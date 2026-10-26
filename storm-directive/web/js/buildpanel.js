'use strict';
// Spawn Prawn - the Build panel (pause menu BUILD tab, v10): what you have, what is full and what comes next.
//  - Arsenal: each weapon's tier, the branch it took (promise, Lv 6 card, mastery), its modifiers with their ranks as pips and
//    its weapon mutations.
//  - Feats: level of 5 and the forks taken. Genome: mutations and defences against its 4 slots.
//  - Next: the next weapon upgrade, the next weapon slot, the egg (15:00 or Lv 60), rewards waiting.
//  Colours and icons are the card language's (rewardui.js RW_CAT).
// Hooks: ui.js renderPause (BUILD tab under V10) -> bpHtml.

function bpHtml() {
  const C = RW_CAT, svg = (k, col, s) => (IC[k] ? `<svg viewBox="0 0 24 24" width="${s || 18}" height="${s || 18}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>` : '');
  const head = (cat, title, right) => `<h3 class="bp-h" style="--cat:${C[cat].col}">${svg(C[cat].ico, C[cat].col)} ${esc(title)}${right ? `<em>${esc(right)}</em>` : ''}</h3>`;
  const card = c => (typeof CARDS !== 'undefined' ? CARDS.find(x => x.id === c) : null);
  let h = '';

  // Arsenal.
  const ws = G.weapons.filter(w => w && !w.isSpell && w.def);
  h += `<div class="sec bp">${head('weapon', 'Arsenal', `${ws.length}/${typeof MAX_WEAPONS !== 'undefined' ? MAX_WEAPONS : 3} weapons`)}<div class="list">`;
  for (const w of ws) {
    const col = elemCol(wElem(w)), S = typeof WUP !== 'undefined' && WUP[w24Key(w)], U = w.up || {}, bits = [];
    const br = [];
    if (S && U.p && S[U.p]) br.push(S[U.p].name);
    if (U.l6) br.push(U.l6);
    if (U.l10) br.push(U.l10 + ' (mastery)');
    if (br.length) bits.push(`<span class="bp-tag" style="--cat:${C.branch.col}">${esc(br.join(' > '))}</span>`);
    const brOf = id => (typeof MSB !== 'undefined' && MSB[id] && modCount(w, id) >= 2 ? MSB[id][{ A: 0, B: 1, A1: 2, A2: 3, B1: 4, B2: 5 }[modCount(w, id) >= 4 ? msMa(w, id) : msBr(w, id)]] : ''); // (branch or mastery taken: modslice.js)
    // One tag per modifier: its rank as pips out of 3 (a 4th, ringed, once it is mastered), then the branch it took.
    const pips = n => `<span class="bp-pips">${Array.from({ length: Math.max(3, n) }, (_, k) => `<i class="${k < n ? 'on' : ''}${k >= 3 ? ' ms' : ''}"></i>`).join('')}</span>`;
    const mods = [...new Set(w.m10 || [])].map(id => `${esc((MODS10[id] || {}).name || id)} ${pips(modCount(w, id))}${brOf(id) ? ' ' + esc(brOf(id)) : ''}`);
    const slots = typeof mmSlots === 'function' ? `${mmHeld(w).size}/${mmFree() ? '∞' : mmSlots(w)}` : `${mods.length}/3`; // (group slots by weapon level: modmatrix.js)
    if (mods.length) bits.push(mods.map(m => `<span class="bp-tag" style="--cat:${C.modifier.col}">${m}</span>`).join('') + `<span class="bp-tag bp-slots">${slots}</span>`);
    const wm = (w.wm10 || []).map(id => (card(id) || {}).title || id);
    if (wm.length) bits.push(`<span class="bp-tag" style="--cat:${C.mutation.col}">${esc(wm.join(', '))}</span>`);
    const nx = typeof wupNextLv === 'function' ? wupNextLv(w) : 0;
    h += `<div class="li on bp-w"><span class="bp-ico">${iconSVG(w.def, 22, col)}</span><div><b style="color:${col}">${esc(w.def.name)}</b> <em>${esc(wLvText(w))}${nx ? '' : ' (top)'}</em><br>${bits.join(' ') || '<span class="hint">No branch or modifiers yet.</span>'}</div></div>`;
  }
  h += `</div></div>`;

  // Feats.
  const fs = (G.spells || []).filter(Boolean);
  h += `<div class="sec bp">${head('feat', 'Feats', `${fs.length}/${typeof DRAFT !== 'undefined' ? DRAFT.feats : 3}`)}<div class="list">`;
  for (const s of fs) {
    const d = s.def && s.def.f10, ico = (typeof ICON_OF !== 'undefined' && ICON_OF[s.id]) || C.feat.ico;
    const fk = d && d.forks ? Object.values(d.forks).flat().filter(f => s.f10fk && s.f10fk[f.id]).map(f => f.title) : [];
    h += `<div class="li on bp-w"><span class="bp-ico">${svg(ico, C.feat.col, 22)}</span><div><b style="color:${C.feat.col}">${esc(s.def.name)}</b> <em>Level ${s.lvl}/5</em>${fk.length ? `<br><span class="bp-tag" style="--cat:${C.feat.col}">${esc(fk.join(', '))}</span>` : ''}</div></div>`;
  }
  if (!fs.length) h += `<p class="hint">None yet. Level-ups deal them.</p>`;
  h += `</div></div>`;

  // Genome: mutations and defences share the 4 slots.
  const muts = Object.keys(G.muts || {}).filter(k => G.muts[k] > 0), D = typeof pdef === 'function' ? pdef() : null;
  const defs = D ? Object.keys(D.n).filter(k => D.n[k] > 0) : [];
  const cap = typeof DRAFT !== 'undefined' ? DRAFT.genome : 4, used = typeof genomeFree === 'function' ? cap - genomeFree() : muts.length + defs.length; // (Membrane Shield's levels share its slot: spassives.js)
  h += `<div class="sec bp">${head('mutation', 'Genome', `${used}/${cap > 50 ? '∞' : cap} slots`)}<div class="bp-chips">`;
  for (const id of muts) { const c = card(id) || {}, sb = typeof SPS_BR !== 'undefined' && SPS_BR[id] && G.muts[id] >= 2 ? (SPS_BR[id].find(b => b[0] === spsBr(id)) || [])[1] : ''; h += `<span class="bp-chip" style="--cat:${C.mutation.col}">${esc(c.title || id)}${c.maxRank > 1 ? ' ' + G.muts[id] + '/' + c.maxRank : ''}${sb ? ' (' + esc(sb) + ')' : ''}</span>`; }
  for (const id of defs) { const P = PDEF_CARDS[id]; h += `<span class="bp-chip" style="--cat:${C.defence.col}">${esc(P.name)}${P.max > 1 ? ' ' + D.n[id] + '/' + P.max : ''}</span>`; }
  for (let i = used; i < Math.min(cap, used + 8); i++) h += `<span class="bp-chip empty">empty</span>`; // (no slot limits: a few empties, not 99)
  h += `</div>`;
  const cats = Object.keys(G.cat || {}).filter(k => G.cat[k] > 0), conc = Object.keys(G.conc || {}).filter(k => G.conc[k] > 0);
  if (cats.length || conc.length) h += `<p class="hint" style="color:${C.special.col}">Specialised: ${[...cats.map(k => (REACTIONS[k] || {}).name || k), ...conc.map(k => 'Concentration (' + (RW_TYPE_NAME[k] || k) + ')')].map(esc).join(', ')}</p>`;
  h += `</div>`;

  // What comes next.
  const next = [];
  const ready = typeof wupReady === 'function' ? wupReady() : [];
  if (ready.length && !(typeof MM !== 'undefined' && MM.on)) next.push(`Weapon upgrade at Lv ${Math.ceil((G.level + 1) / WUP_EVERY) * WUP_EVERY} (${ready.length} weapon${ready.length > 1 ? 's' : ''} can grow)`);
  const sl = SLOT_LEVELS.find(l => l > G.level);
  if (sl && ws.length < MAX_WEAPONS) next.push(`New weapon slot at Lv ${sl}`);
  if (typeof raceOn === 'function' && raceOn()) next.push(eggBreakable() ? 'The egg is open. Swim in.' : `The egg opens in ${mmss(raceLeft())}, or at Lv ${EGG.level} (you are Lv ${G.level})`);
  const wait = G.lootQueue.filter(q => RW_WAIT.has(q.kind)).length;
  if (wait) next.push(`${wait} reward${wait > 1 ? 's' : ''} waiting for a quiet moment`);
  h += `<div class="sec bp">${head('branch', 'Next')}${next.length ? `<div class="list">${next.map(t => `<div class="li">${esc(t)}</div>`).join('')}</div>` : '<p class="hint">Nothing scheduled. Keep swimming.</p>'}</div>`;
  return h;
}
