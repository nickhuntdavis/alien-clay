'use strict';
// Spawn Prawn - rank pips on loot cards (user, 26 Oct): a card that ranks up something you already hold says so at a
// glance. Under the title: "Lv N" (the rank you will have after taking it) and a row of pips, the ranks you hold filled,
// the new one filled and ringed in the card's rarity colour, the ones still to come hollow. New cards (rank 0) get nothing.
//  - Where the rank comes from: defence cards (pdef.js G.pd.n), modifier cards (modifiers.js modCount on the weapon named
//    in modFor; a modpick.js card for several weapons only when every weapon holds the same rank), and every card
//    registered with draft.js (c.rank, c.maxRank: Feats, mutations, Catalysts, health, vitals, perks, v9 upgrades).
//  - Maxed or past-max cards (the Rank 3 > Mastery card) get no pips. Weapon upgrade cards keep their own level track.
// Hooks: none in shared files. Wraps ui.js UI.renderLootCards (after dsheads.js) and rewardui.js rwDelta (The Runs). Loads after runstype.js.
const RP = { maxPips: 6 };
function rpRank(o) {
  if (!o || !G || o.wup || o.sealed) return null;
  if (o.defence && typeof PDEF_CARDS !== 'undefined' && PDEF_CARDS[o.defence]) return { n: pdef().n[o.defence] || 0, max: PDEF_CARDS[o.defence].max };
  const mid = o.card && o.card.startsWith('mod:') ? o.card.slice(4) : null;
  if (mid && typeof MODS10 !== 'undefined' && MODS10[mid]) {
    const max = 3; // (every modifier card ranks to 3: modcards.js modCard; MODS10 max is the old v9 cap)
    if (o.pickW) { const ns = o.pickW.map(p => p.n || 0); return ns.every(x => x === ns[0]) ? { n: ns[0], max } : null; }
    const w = (G.weapons || []).find(x => x && !x.isSpell && x.def && x.def.name === o.modFor);
    return w ? { n: modCount(w, mid), max } : null;
  }
  if (o.card && typeof CARDS !== 'undefined') {
    const c = CARDS.find(x => x.id === o.card);
    if (c && c.rank) { try { return { n: c.rank(G) || 0, max: c.maxRank || 0 }; } catch (e) { return null; } }
  }
  const m = /Rank (\d+) > \d+(?: of (\d+))?/.exec(o.sub || ''); // (any other card that writes its rank the draft way)
  return m ? { n: +m[1], max: +(m[2] || 0) } : null;
}
function rpHtml(R) {
  const lv = R.n + 1, tot = R.max && R.max <= RP.maxPips ? R.max : lv;
  const pips = Array.from({ length: tot }, (_, k) => `<i class="${k < R.n ? 'on' : k === R.n ? 'up' : ''}"></i>`).join('');
  return `<div class="rpips"><b>Lv ${lv}</b>${pips}</div>`;
}
function rpMark() {
  const wrap = document.getElementById('lootCards'); if (!wrap || !UI.lootOpts) return;
  const els = [...wrap.children].filter(c => !c.classList.contains('lsec'));
  UI.lootOpts.forEach((o, i) => {
    const c = els[i]; if (!c || !c.classList.contains('card') || c.querySelector('.rpips')) return;
    const R = rpRank(o); if (!R || R.n < 1 || (R.max && R.n >= R.max)) return;
    const t = c.querySelector('.ctitle'); if (!t) return;
    t.insertAdjacentHTML('afterend', rpHtml(R));
    c.classList.add('rankup');
  });
}
// The Runs (spassives.js spRunsSlot): its upgrade card shows the trail's numbers before and after, in the Feat card's
// "Next level" line (rewardui.js rwDelta). Steps per rank as spRunsSlot applies them.
const RP_RUNS = { 2: { dur: 1.5, area: 1.5 }, 3: { dmg: 1.5 }, 4: { dmg: 4 / 3 } };
function rpRunsDelta(o) {
  if (!o || o.card !== 'sp_runs' || !G || typeof spRunsSlot !== 'function') return null;
  const r = mr('sp_runs'), k = RP_RUNS[r + 1]; if (!r || !k) return null;
  const s0 = spRunsSlot().s, n = v => (Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10), out = [];
  for (const [f, l] of [['dmg', 'Damage'], ['area', 'Area'], ['dur', 'Lasts']]) if (k[f] && s0[f] > 0) out.push(`${l} ${n(s0[f])} → ${n(s0[f] * k[f])}`);
  return out.length ? out : null;
}
if (typeof rwDelta === 'function') rwDelta = (orig => function (o) { return orig(o) || rpRunsDelta(o); })(rwDelta);
if (typeof UI !== 'undefined' && UI.renderLootCards) {
  UI.renderLootCards = (orig => function () { const r = orig.apply(this, arguments); try { rpMark(); } catch (e) { console.error(e); } return r; })(UI.renderLootCards);
  const st = document.createElement('style');
  st.textContent = '#lootCards .card .rpips{display:flex;align-items:center;gap:5px;margin:4px 0 3px}'
    + '#lootCards .card .rpips b{font:800 13px sans-serif;letter-spacing:.5px;margin-right:3px;padding:1px 6px;border-radius:4px;background:var(--color-text-primary,#111);color:var(--color-bg-sheet,#fff);box-shadow:inset 0 -3px 0 var(--rar,transparent)}'
    + '#lootCards .card .rpips i{width:10px;height:10px;border-radius:50%;border:1.5px solid currentColor;opacity:.45;box-sizing:border-box}'
    + '#lootCards .card .rpips i.on{background:currentColor;opacity:.9}'
    + '#lootCards .card .rpips i.up{background:currentColor;opacity:1;box-shadow:0 0 0 2px var(--color-bg-sheet,#fff),0 0 0 4px var(--rar,currentColor);margin:0 3px;animation:rpPulse 1.1s ease-in-out infinite alternate}'
    + '@keyframes rpPulse{from{transform:scale(1)}to{transform:scale(1.25)}}';
  document.head.appendChild(st);
}
