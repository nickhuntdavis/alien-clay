'use strict';
// Spawn Prawn - the Tackle Box and the BUILD tab split by job (user, 26 Oct; wireframes approved).
//  - TACKLE BOX (Loadout tab, loadout.js): weapons, targeting, Feats and what is next for weapons. The Autorun tiles
//    leave it. Each weapon row gains a line under it: its branch, its modifiers with rank pips (out of 3, a 4th ringed
//    once mastered), the slots used, and its weapon mutations. Feat rows show their level as pips and the forks taken.
//    A Next panel (the next weapon upgrade, the next weapon slot) follows the Feats.
//  - BUILD TAB (pause, the sperm key: buildbtn.js): Autorun first, two columns of compact rows (the full hint of the
//    mode you are on underneath); then the Genome (mutations and defences, one row each with rank pips), Upgrades (the
//    slotless health, vitals, perk and v9 upgrade cards you hold, with pips), Stat bonuses (statup.js totals) and the
//    non-weapon Next lines (the egg, rewards waiting). Press and hold a Genome or Upgrades row for its card in full.
// Hooks: none in shared files. Replaces buildpanel.js bpHtml (and statup.js's wrap of it: its Stat bonuses tiles are
// drawn here); wraps loadout.js loadoutHtml and ui.js UI.renderPause (hold-to-read). Loads after xpgems.js.
const PS = { featMax: 5 };
const psPips = (n, max, msFrom) => `<span class="ps-pips">${Array.from({ length: Math.max(max, n) }, (_, k) => `<i class="${k < n ? 'on' : ''}${msFrom && k >= msFrom ? ' ms' : ''}"></i>`).join('')}</span>`;
const psCard = id => (typeof CARDS !== 'undefined' ? CARDS.find(x => x.id === id) : null);
const psHead = (cat, title, right) => `<h3 class="bp-h"${cat ? ` style="--cat:${RW_CAT[cat].col}"` : ''}>${esc(title)}${right ? `<em>${esc(right)}</em>` : ''}</h3>`;

// ---------------------------------------------------------------- Tackle Box
function psWeaponLine(w) {
  const C = RW_CAT, S = typeof WUP !== 'undefined' && typeof w24Key === 'function' && WUP[w24Key(w)], U = w.up || {}, bits = [];
  const br = [];
  if (S && U.p && S[U.p]) br.push(S[U.p].name);
  if (U.l6) br.push(U.l6);
  if (U.l10) br.push(U.l10 + ' (mastery)');
  if (br.length) bits.push(`<span class="ps-tag" style="--cat:${C.branch.col}">${esc(br.join(' > '))}</span>`);
  const brOf = id => (typeof MSB !== 'undefined' && MSB[id] && modCount(w, id) >= 2 ? MSB[id][{ A: 0, B: 1, A1: 2, A2: 3, B1: 4, B2: 5 }[modCount(w, id) >= 4 ? msMa(w, id) : msBr(w, id)]] : ''); // (modslice.js)
  const ids = [...new Set(w.m10 || [])];
  for (const id of ids) bits.push(`<span class="ps-tag" style="--cat:${C.modifier.col}">${esc((MODS10[id] || {}).name || id)} ${psPips(modCount(w, id), 3, 3)}${brOf(id) ? ' ' + esc(brOf(id)) : ''}</span>`);
  if (ids.length) bits.push(`<span class="ps-tag ps-slots">${typeof mmSlots === 'function' ? `${mmHeld(w).size}/${mmFree() ? '∞' : mmSlots(w)}` : `${ids.length}/3`}</span>`);
  for (const id of w.wm10 || []) bits.push(`<span class="ps-tag" style="--cat:${C.mutation.col}">${esc((psCard(id) || {}).title || id)}</span>`);
  return bits.length ? `<div class="ps-mods">${bits.join('')}</div>` : '';
}
function psFeatLine(s) {
  const d = s.def && s.def.f10;
  const fk = d && d.forks ? Object.values(d.forks).flat().filter(f => s.f10fk && s.f10fk[f.id]).map(f => f.title) : [];
  return fk.length ? `<div class="ps-mods">${fk.map(t => `<span class="ps-tag" style="--cat:${RW_CAT.feat.col}">${esc(t)}</span>`).join('')}</div>` : '';
}
function psWeaponNext() {
  const next = [], ws = G.weapons.filter(w => w && !w.isSpell && w.def);
  const ready = typeof wupReady === 'function' ? wupReady() : [];
  if (ready.length && !(typeof MM !== 'undefined' && MM.on)) next.push(`Weapon upgrade at Lv ${Math.ceil((G.level + 1) / WUP_EVERY) * WUP_EVERY} (${ready.length} weapon${ready.length > 1 ? 's' : ''} can grow)`);
  const sl = SLOT_LEVELS.find(l => l > G.level);
  if (sl && ws.length < MAX_WEAPONS) next.push(`New weapon slot at Lv ${sl}`);
  return next;
}
function psTackle(d) {
  const mv = d.querySelector('.lomv'); if (mv && mv.closest('.sec')) mv.closest('.sec').remove(); // (Autorun lives on the BUILD tab now)
  d.querySelectorAll('.low').forEach(row => {
    const go = row.querySelector('[data-go]'), head = row.querySelector('.lowh'); if (!go || !head) return;
    const k = go.dataset.go[0], i = +go.dataset.go.slice(1);
    if (k === 'w') {
      const w = G.weapons[i]; if (!w) return;
      const sm = row.querySelector('.lon small'); if (sm) sm.textContent = sm.textContent.split(' | ')[0]; // (the old v9 modifier names give way to the pips line)
      head.insertAdjacentHTML('afterend', psWeaponLine(w));
    } else if (k === 's') {
      const s = G.spells[i]; if (!s || !(s.def && s.def.f10)) return;
      const em = row.querySelector('.lon em'); if (em) em.innerHTML = em.innerHTML.replace(/^Lv \d+\/\d+/, `Lv ${s.lvl}/${PS.featMax} ${psPips(s.lvl, PS.featMax)}`);
      head.insertAdjacentHTML('afterend', psFeatLine(s));
    }
  });
  const next = psWeaponNext(), wsec = d.querySelector('[data-go^="s"]') || d.querySelector('[data-go^="w"]'); // (after the Feats, or the weapons when there are none)
  if (next.length && wsec && wsec.closest('.sec')) wsec.closest('.sec').insertAdjacentHTML('afterend', uiPanel('Next', uiList(next.map(t => `<div class="li">${esc(t)}</div>`).join('')), 'lo'));
}
loadoutHtml = (orig => function () {
  const d = document.createElement('div'); d.innerHTML = orig.apply(this, arguments);
  try { psTackle(d); } catch (e) { console.error(e); }
  return d.innerHTML;
})(loadoutHtml);

// ---------------------------------------------------------------- BUILD tab
function psRow(key, title, pips, sub, cat) {
  return `<div class="ps-row" data-psc="${key}" style="--cat:${RW_CAT[cat].col}"><b>${esc(title)}</b>${pips}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`;
}
function psOpt(key) { // the card behind a row, for press and hold (glossary.js cardGlossary)
  const [k, id] = [key.slice(0, key.indexOf(':')), key.slice(key.indexOf(':') + 1)];
  if (k === 'def') return pdefCard(id);
  const c = psCard(id); return c ? cardOpt(c) : null;
}
bpHtml = function () {
  let h = '';
  // Autorun: two columns of compact rows; the full hint of the current mode underneath.
  const MV = moveModes(), cur = MV.find(m => m.id === G.moveDir) || MV[0];
  h += `<div class="sec bp ps-ar">${psHead(null, 'Autorun', cur ? cur.name : '')}<div class="ps-mv">${MV.map(m => `<button class="ps-mvb${m.id === G.moveDir ? ' sel' : ''}" data-move="${m.id}" title="${esc(m.desc)}">${pictoFor(m.id, 'move')}<span><b>${m.name}</b><small>${esc(m.desc)}</small></span></button>`).join('')}</div>${cur ? uiHint(esc(cur.desc) + '.') : ''}</div>`;

  // Genome: mutations and defences share the slots.
  const muts = Object.keys(G.muts || {}).filter(k => G.muts[k] > 0), D = typeof pdef === 'function' ? pdef() : null;
  const defs = D ? Object.keys(D.n).filter(k => D.n[k] > 0) : [];
  const cap = typeof DRAFT !== 'undefined' ? DRAFT.genome : 4, used = typeof genomeFree === 'function' ? cap - genomeFree() : muts.length + defs.length;
  h += `<div class="sec bp">${psHead('mutation', 'Genome', `${used}/${cap > 50 ? '∞' : cap} slots`)}<div class="ps-rows">`;
  for (const id of muts) {
    const c = psCard(id) || {}, sb = typeof SPS_BR !== 'undefined' && SPS_BR[id] && G.muts[id] >= 2 ? (SPS_BR[id].find(b => b[0] === spsBr(id)) || [])[1] : '';
    h += psRow('mut:' + id, c.title || id, c.maxRank > 1 ? psPips(G.muts[id], Math.min(c.maxRank, 3), 3) : '', sb, 'mutation');
  }
  for (const id of defs) { const P = PDEF_CARDS[id]; h += psRow('def:' + id, P.name, P.max > 1 ? psPips(D.n[id], P.max) : '', '', 'defence'); }
  for (let i = used; i < Math.min(cap, used + 8); i++) h += `<div class="ps-row empty">empty</div>`;
  h += `</div>`;
  const cats = Object.keys(G.cat || {}).filter(k => G.cat[k] > 0), conc = Object.keys(G.conc || {}).filter(k => G.conc[k] > 0);
  if (cats.length || conc.length) h += `<p class="hint" style="color:${RW_CAT.special.col}">Specialised: ${[...cats.map(k => (REACTIONS[k] || {}).name || k), ...conc.map(k => 'Concentration (' + (RW_TYPE_NAME[k] || k) + ')')].map(esc).join(', ')}</p>`;
  h += `</div>`;

  // Upgrades: the slotless cards you hold (health, vitals, perks, v9 upgrades).
  const ups = (typeof CARDS !== 'undefined' ? CARDS : []).filter(c => c.family && c.family.startsWith('up:') && c.rank).map(c => { let r = 0; try { r = c.rank(G) || 0; } catch (e) { /* ignore */ } return [c, r]; }).filter(([, r]) => r > 0);
  if (ups.length) h += `<div class="sec bp">${psHead('special', 'Upgrades')}<div class="ps-rows">${ups.map(([c, r]) => psRow('up:' + c.id, c.title, c.maxRank > 1 ? psPips(r, Math.min(c.maxRank, 6)) : '', '', 'special')).join('')}</div></div>`;

  // Stat bonuses (statup.js).
  const B = G.stb || {}, ks = (typeof ST_ORDER !== 'undefined' ? ST_ORDER : []).filter(k => B[k] > 0);
  if (ks.length) h += `<div class="sec bp"><h3 class="bp-h">Stat bonuses</h3>${uiTiles(ks.map(k => uiTile(esc(stFmt(k, B[k])), esc(ST_DEF[k].name))).join(''), 'ps-st')}</div>`;

  // Next: the egg and rewards waiting (weapon lines are in the Tackle Box).
  const next = [];
  if (typeof raceOn === 'function' && raceOn()) next.push(eggBreakable() ? 'The egg is open. Swim in.' : `The egg opens in ${mmss(raceLeft())}, or at Lv ${EGG.level} (you are Lv ${G.level})`);
  const wait = G.lootQueue.filter(q => RW_WAIT.has(q.kind)).length;
  if (wait) next.push(`${wait} reward${wait > 1 ? 's' : ''} waiting for a quiet moment`);
  if (next.length) h += `<div class="sec bp">${psHead('branch', 'Next')}<div class="list">${next.map(t => `<div class="li">${esc(t)}</div>`).join('')}</div></div>`;
  return h;
};
UI.renderPause = (orig => function () {
  const r = orig.apply(this, arguments);
  try { if (UI.pauseTab === 'build') document.querySelectorAll('#pauseBody [data-psc]').forEach(el => { const o = psOpt(el.dataset.psc); if (o) holdable(el, () => cardGlossary(o), () => {}); }); } catch (e) { console.error(e); }
  return r;
})(UI.renderPause);

{
  const st = document.createElement('style');
  st.textContent = '.ps-pips{display:inline-flex;gap:3px;margin-left:6px;vertical-align:middle}.ps-pips i{width:8px;height:8px;border-radius:50%;border:1.3px solid currentColor;box-sizing:border-box;opacity:.55}.ps-pips i.on{background:currentColor;opacity:1}.ps-pips i.ms{margin-left:2px;box-shadow:0 0 0 1.5px var(--color-bg-sheet,#fff),0 0 0 2.5px currentColor}'
    + '.ps-mods{display:flex;flex-wrap:wrap;gap:4px;margin:5px 0 0 34px}.ps-tag{display:inline-flex;align-items:center;font-size:11px;padding:1px 7px;border-radius:8px;border:1px solid var(--cat,var(--line));color:var(--color-text-primary)}.ps-tag.ps-slots{border-style:dashed;color:var(--color-text-muted)}'
    + '.ps-mv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}'
    + '.ps-mvb{display:flex;align-items:center;gap:7px;min-height:42px;padding:4px 7px;border:1px solid var(--line);border-radius:8px;background:var(--color-bg-sheet);color:var(--color-text-primary);text-align:left;min-width:0}'
    + '.ps-mvb svg{width:22px;height:22px;flex:none}.ps-mvb span{min-width:0;display:flex;flex-direction:column}.ps-mvb b{font-size:12px;letter-spacing:.5px}.ps-mvb small{font-size:10px;color:var(--color-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
    + '.ps-mvb.sel{border-color:var(--color-text-primary);box-shadow:inset 3px 0 0 var(--color-text-primary)}'
    + '.ps-rows{display:flex;flex-direction:column;gap:4px}.ps-row{display:flex;flex-wrap:wrap;align-items:center;gap:2px 0;padding:6px 8px;border:1px solid var(--line);border-left:3px solid var(--cat,var(--line));border-radius:8px;font-size:13px;user-select:none;-webkit-user-select:none}'
    + '.ps-row b{font-weight:700}.ps-row small{flex-basis:100%;font-size:11px;color:var(--color-text-muted)}.ps-row.empty{border-style:dashed;border-left-width:1px;color:var(--color-text-muted);font-size:11px;padding:4px 8px}'
    + '.ps-ar .hint{margin-top:6px}';
  document.head.appendChild(st);
}
