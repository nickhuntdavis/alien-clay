'use strict';
// Spawn Prawn - the Gene Gun: the Designer Baby's own firepower. It fires double helices: two strands that
// twist round each other in flight, each carrying the element of one of your other weapons (cycling through
// them, so a bit of everything), which means its own two strands set off elemental reactions. When both
// strands of one helix hit the same enemy, the enemy is EDITED: a burst of damage, and everything you have
// hits it harder for a few seconds. Hooks: geneFire (fireWeapon), geneStep (updateProjectiles),
// geneHit (projectile collision), geneDamageMul (damageEnemy).

Object.assign(WEAPONS, {
  genegun: { name: 'Gene Gun', stars: [3, 3, 3, 4], play: 'Fires double helices: two strands twisting round each other, each carrying the element of another weapon you own, so they react on their own. Land both strands of one helix on the same enemy to EDIT it: a burst, and it takes more damage from everything.', icon: 'GG', elem: 'arcane', kind: 'gun', color: '#90e0ef', dir: 'nearest', style: 'helix', role: 'Splicer', gene: 1, seqOnly: 'splicer',
    desc: 'Precision gene therapy, delivered at speed. Side effects include exploding.',
    base: { dmg: 11.5, cd: 0.5, mag: 8, reload: 1.3, count: 1, spread: 0.16, speed: 380, pierce: 1, range: 480, size: 4.5 },
    lv: { 3: { dmg: 0.3 }, 6: { count: 1 }, 9: { pierce: 2 } }, sig: { 5: ['ggtriple', 'ggcrispr'], 10: ['ggchimera', 'ggrecomb'] } },
});
Object.assign(SIGS, {
  ggtriple: { name: 'Triple Helix', desc: 'A third strand, with a third element. Edits need any two strands to land.' },
  ggcrispr: { name: 'CRISPR', desc: 'Edits are cleaner: edited enemies take +60% damage (not +30%) for 4s, and the edit burst is twice as big.' },
  ggchimera: { name: 'Chimera', desc: 'Mastery. Every strand carries two elements at once and applies both.' },
  ggrecomb: { name: 'Recombination', desc: 'Mastery. A strand that kills splits into a fresh helix aimed at the nearest enemy (once per strand).' },
});
if (PROFILES.splicer && !PROFILES.splicer.weapons.includes('genegun')) PROFILES.splicer.weapons.push('genegun');
if (typeof ICON_OF !== 'undefined') ICON_OF.genegun = 'helix';
if (typeof IC !== 'undefined') IC.helix = '<path d="M7 3c0 6 10 6 10 12s-10 6-10 6"/><path d="M17 3c0 6-10 6-10 12s10 6 10 6"/><path d="M8.5 6.5h7M9 17.5h6M10.5 9h3M10.5 15h3"/>';

const GENE_ELEMS = ['fire', 'ice', 'shock', 'poison', 'arcane'];
// The elements on offer: those of your other weapons (not Kinetic), topped up from the rest.
function geneElems(w) {
  const own = [...new Set(G.weapons.filter(x => x && x !== w && x.def.elem && x.def.elem !== 'phys').map(x => x.def.elem))];
  for (const e of GENE_ELEMS) { if (own.length >= 3) break; if (!own.includes(e)) own.push(e); }
  return own;
}
function geneFire(w, target, src) {
  if (w.id !== 'genegun') return false;
  const s = w.s, p = G.player, els = geneElems(w), n = hasSig(w, 'ggtriple') ? 3 : 2, chim = hasSig(w, 'ggchimera');
  const a0 = Math.atan2(target.y - p.y, target.x - p.x);
  for (let k = 0; k < s.count; k++) {
    const a = a0 + (s.count > 1 ? (k / (s.count - 1) - 0.5) * s.spread * 2 : rand(-s.spread, s.spread) * 0.4);
    geneHelix(w, p.x, p.y, a, src, els, n, chim, false);
  }
  w.geneI = ((w.geneI || 0) + 1) % 60;
  sfx('shot');
  return true;
}
// One helix: n strands sharing a pair record (for edits and the rungs drawn between them).
function geneHelix(w, x, y, a, src, els, n, chim, child) {
  const pair = { strands: [], id: (G.geneId = (G.geneId || 0) + 1) };
  for (let i = 0; i < n; i++) {
    const el = els[((w.geneI || 0) + i) % els.length], el2 = chim ? els[((w.geneI || 0) + i + 1) % els.length] : null;
    const pr = spawnProj(w, x, y, a, Object.assign({}, src, { elem: el }), { helix: { ph: i / n * TAU, amp: 15, f: 10, t: 0 }, pair, elem2: el2, color: ELEMENTS[el].color, recombined: child });
    if (pr) pair.strands.push(pr);
  }
}
// From updateProjectiles: the twist (sideways wobble round the line of flight).
function geneStep(pr, dt) {
  const h = pr.helix, sp = Math.hypot(pr.vx, pr.vy) || 1;
  h.t += dt;
  const lat = h.amp * h.f * Math.cos(h.t * h.f + h.ph);
  pr.x += -pr.vy / sp * lat * dt; pr.y += pr.vx / sp * lat * dt;
}
// From the projectile collision: chimera's second element, edits, recombination.
function geneHit(pr, e) {
  const w = pr.w;
  if (pr.elem2 && !e.dead) applyElement(e, pr.elem2, pr.dmg, Object.assign({}, pr.src, { elem: pr.elem2 }));
  const P = pr.pair;
  if (P && !e.dead) {
    const rec = e.geneHit;
    if (rec && rec.id === P.id && rec.pr !== pr && G.t - rec.t < 0.7 && !rec.done) {
      rec.done = true;
      const crispr = hasSig(w, 'ggcrispr');
      e.edited = G.t + (crispr ? 4 : 2.5); e.editK = crispr ? 0.6 : 0.3;
      damageEnemy(e, pr.dmg * (crispr ? 1.6 : 0.8), { elem: 'arcane', noProc: true, noCrit: true, wname: 'Gene Edit', w });
      ring(e.x, e.y, e.r + 16, '#90e0ef', 0.35, 3);
      if (!(G.editSayT > G.t)) { G.editSayT = G.t + 0.6; floatText(e.x, e.y - e.r - 12, 'EDITED', '#90e0ef', 13, 0.8); }
    } else if (!rec || rec.id !== P.id) e.geneHit = { id: P.id, pr, t: G.t };
  }
  if (e.dead && hasSig(w, 'ggrecomb') && !pr.recombined && !pr.didRecomb) {
    pr.didRecomb = true;
    const t = acquire('nearest', 380, e.x, e.y, e);
    if (t) geneHelix(w, e.x, e.y, Math.atan2(t.y - e.y, t.x - e.x), pr.src, geneElems(w), 2, hasSig(w, 'ggchimera'), true);
  }
}
// From damageEnemy: edited enemies take more from everything.
const geneDamageMul = e => (e.edited > G.t ? 1 + (e.editK || 0.3) : 1);
// Drawing (render.js projectile switch): a bead, with a rung to the next strand of the same helix.
function drawHelix(pr, x, y, r) {
  const P = pr.pair;
  if (P && P.strands[0] === pr) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, 1.2 * S);
    for (let i = 1; i < P.strands.length; i++) { const q = P.strands[i]; if (q.dead) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx(q.x), sy(q.y)); ctx.stroke(); }
  }
  ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  if (pr.elem2) { ctx.strokeStyle = ELEMENTS[pr.elem2].color; ctx.lineWidth = Math.max(1, 1.5 * S); ctx.stroke(); }
}
