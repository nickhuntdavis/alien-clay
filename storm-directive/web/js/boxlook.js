'use strict';
// Spawn Prawn - each kind of box looks like what it changes.
//  - Mutation (an elite's strand, mutdrop.js): your sperm at the top, animated, with the stats a mutation moves and
//    your Genome slots, in the colour of flesh. Cards wear "ALTERS THE SAMPLE".
//  - Modifier (DNA strands, modcards.js): your weapons at the top, each with its three modifier slots, in steel blue.
//    Cards wear "ALTERS A WEAPON" and name the weapon.
//  - Feats (level-ups): Feat cards glow violet and wear "SPECIAL ABILITY".
// Hooks: ui.js openLoot -> boxLook, renderLootCards -> boxCardCls, tick -> boxTick.

const BOX_LOOK = {
  mutation: { col: '#e8a598', title: 'MUTATION', sub: 'Lateral transfer complete. Pick one change to the sample. The other two are discarded.' },
  chest:    { col: '#7fb7d9', title: 'WEAPON MODIFICATION', sub: 'Donor DNA, weapon grade. Pick one change to one weapon.' },
  boss:     { col: '#7fb7d9', title: 'BOSS DNA: WEAPON MODIFICATION', sub: 'Extracted from the boss while still warm. Pick one change to one weapon.' },
};
const boxKindOf = o => !o || !o.tag ? '' : o.tag.startsWith('MODIFIER') ? 'mod' : o.tag === 'MUTATION' ? 'mut' : /FEAT/.test(o.tag) ? 'feat' : '';
const BOX_LOOK_ON = false; // V11 (user, 21 Oct): mutations and modifications use the same plain card screen; true brings these looks back
const boxCardCls = o => { if (!BOX_LOOK_ON) return ''; const k = boxKindOf(o); return k ? ' k-' + k : ''; };
const boxModsOnly = () => UI.lootOpts && UI.lootOpts.length && UI.lootOpts.every(o => boxKindOf(o) === 'mod');

function boxLook(req, box) {
  const head = $('lootHead');
  if (!head) return;
  head.innerHTML = ''; head.className = '';
  const L = BOX_LOOK[req.kind];
  if (!L) return;
  if ((req.kind === 'chest' || req.kind === 'boss') && !boxModsOnly()) return; // (nothing fitted: an ordinary draft)
  $('lootTitle').textContent = L.title; $('lootSub').textContent = L.sub;
  if (!BOX_LOOK_ON) return; // (the words stay; the colour and the head go)
  box.style.setProperty('--bc', L.col); $('lootTitle').style.color = L.col;
  head.className = 'bhead ' + (req.kind === 'mutation' ? 'bh-mut' : 'bh-mod');
  head.style.setProperty('--c', L.col);
  head.innerHTML = req.kind === 'mutation' ? boxMutHead() : boxModHead();
}

// ---------------------------------------------------------------- the sample
function boxMutHead() {
  const P = G.P, p = G.player, plus = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
  const free = typeof genomeFree === 'function' ? genomeFree() : 0, used = (typeof DRAFT !== 'undefined' ? DRAFT.genome : 4) - free;
  const mem = typeof pdef === 'function' ? Math.round(pdef().mem.memMax) : 0;
  const st = [['Health', `${Math.ceil(p.hp)}/${Math.round(P.maxHp)}`], ['Swim speed', plus(P.speed - 1)], ['Damage', plus(P.might - 1)],
    ['Attack speed', plus(P.haste - 1)], ['Pickup range', plus(P.magnet - 1)], ['Genome', `${used}/${used + free}`]];
  if (mem > 0) st.splice(1, 0, ['Membrane', mem]); // (no shield, no Membrane: don't show a zero)
  const held = CARDS.filter(c => typeof mdIsMut === 'function' && mdIsMut(c) && c.slot === 'genome' && G.muts && G.muts[c.id] > 0).map(c => c.title);
  const wm = G.weapons.filter(w => w && w.wm10 && w.wm10.length).map(w => `${w.def.name}: ${w.wm10.map(id => (CARDS.find(c => c.id === id) || {}).title || id).join(', ')}`);
  return `<div class="bh-sperm"><canvas id="lootYou"></canvas><span class="bh-cap">THE SAMPLE</span></div>`
    + `<div class="bh-stats">${st.map(([k, v]) => `<div><b>${esc(String(v))}</b><span>${k}</span></div>`).join('')}</div>`
    + (held.length || wm.length ? `<div class="bh-held">${held.length ? 'Mutations: ' + held.map(esc).join(', ') : ''}${wm.length ? (held.length ? '<br>' : '') + wm.map(esc).join('<br>') : ''}</div>` : '');
}
function boxTick(dt) {
  const cv = $('lootYou');
  if (!cv || !G || !UI.lootReq || UI.lootReq.kind !== 'mutation') return;
  const dpr = Math.min(2, window.devicePixelRatio || 1), Wc = cv.clientWidth, Hc = cv.clientHeight;
  if (!Wc || !Hc) return;
  if (cv.width !== Math.round(Wc * dpr) || cv.height !== Math.round(Hc * dpr)) { cv.width = Math.round(Wc * dpr); cv.height = Math.round(Hc * dpr); }
  UI.boxT = (UI.boxT || 0) + dt;
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  UI.boxBody = UI.boxBody || { x: 0, y: 0, vx: 0, vy: 0, id: -1 };
  drawYouPortrait(g, Wc, Hc, UI.boxBody, 1000 + UI.boxT);
}

// ---------------------------------------------------------------- the weapons
function boxModHead() {
  const ATK = typeof V10_ATK !== 'undefined' ? V10_ATK : {};
  const rows = G.weapons.filter(w => w && !w.isSpell && w.def).map(w => {
    const col = elemCol(w.def.elem), kinds = [...new Set(w.m10 || [])];
    const slots = [0, 1, 2].map(i => { const id = kinds[i]; if (!id) return '<i class="bh-slot">empty</i>';
      const r = modCount(w, id), M = MODS10[id]; return `<i class="bh-slot on">${esc(M.name)}${r > 1 ? ' ' + ['', '', 'II', 'III'][r] : ''}</i>`; }).join('');
    return `<div class="bh-w" style="--wc:${col}"><span class="bh-ico">${iconSVG(w.def, 26, col)}</span><span class="bh-wn"><b>${esc(w.def.name)}</b><em>${esc((ATK[w.def.v10atk] || {}).label || '')} | Lv ${w.lvl}</em></span><span class="bh-slots">${slots}</span></div>`;
  }).join('');
  return `<div class="bh-wl">${rows}</div>`;
}
