'use strict';
// Spawn Prawn - more pairings and combos, so every weapon has at least one combo and two pairings (Reece
// noticed some weapons had none: Prawn Again's three, the Gene Gun and the Redtail's three). Most of these
// work by tags: one weapon's hits mark an enemy for a couple of seconds, and the other weapon hits it harder.
// Hooks: pair2Hit (comboHit), pair2Mul (comboDamageMul), pair2Kill (killEnemy), pair2Fire (comboFire),
// pair2Ate (siphonAte), pair2Both (Shotgun Wedding's Both Barrels).

PAIRINGS.push(
  { a: 'shotgun',    b: 'wedding',   id: 'reception',   name: 'Shotgun Reception',  desc: 'Enemies the Hiccup Scattergun hits take 35% more from Shotgun Wedding for 2s.' },
  { a: 'onesie',     b: 'moonshine', id: 'flammable',   name: 'Flammable Fabric',   desc: 'Burning enemies the Thorny Onesie has pricked burst into a fire puddle when they die.' },
  { a: 'crayon',     b: 'banjo',     id: 'campfire',    name: 'Campfire Song',      desc: 'Enemies touched by the crayon line take 40% more from Duelling Banjo notes for 2s.' },
  { a: 'duedate',    b: 'moonshine', id: 'lastorders',  name: 'Last Orders',        desc: 'Moonshine hits enemies with a Due Date 40% harder.' },
  { a: 'peekaboo',   b: 'ghosts',    id: 'spooked',     name: 'Who You Gonna Call', desc: 'Every enemy a BOO! hits adds a ghost to Ghosts of You.' },
  { a: 'twin',       b: 'genegun',   id: 'mindthegap',  name: 'Mind the Gap',       desc: 'Enemies in the telepathy beam take 30% more from the Gene Gun.' },
  { a: 'toothfairy', b: 'karma',     id: 'toothfortooth', name: 'A Tooth for a Tooth', desc: 'Karma hits enemies carrying teeth 35% harder.' },
  { a: 'dejavu',     b: 'duedate',   id: 'beenhere',    name: 'Been Here Before',   desc: 'Every Deja Vu hit on a marked enemy adds a quarter of itself to its Due Date.' },
  { a: 'ghosts',     b: 'seeker',    id: 'lostsibs',    name: 'Lost Siblings',      desc: 'Every kill by Seeker Siblings adds a ghost to Ghosts of You.' },
  { a: 'karma',      b: 'flail',     id: 'lashingout',  name: 'Lashing Out',        desc: 'Enemies the Flail has lashed take 35% more from Karma for 2s.' },
  { a: 'genegun',    b: 'siphon',    id: 'genetherapy', name: 'Gene Therapy',       desc: 'Every Gene Edit heals you 1% of your max HP.' },
  { a: 'dejavu',     b: 'blaster',   id: 'seenit',      name: 'Seen It Before',     desc: 'Enemies a Spitball has hit take 40% more from Deja Vu for 2s.' },
  { a: 'wedding',    b: 'peekaboo',  id: 'surprise',    name: 'Shotgun Surprise',   desc: 'Enemies a BOO! has hit take 40% more from Shotgun Wedding for 2s.' },
  { a: 'banjo',      b: 'bubble',    id: 'bubbleband',  name: 'Bubble Band',        desc: 'Duelling Banjo notes hit bubbled enemies 50% harder.' },
);
COMBOS.push(
  // Prawn Again
  { id: 'hauntmem',  a: 'dejavu',  b: 'ghosts',   name: 'Haunting Memory',     desc: 'One Deja Vu hit in four leaves a ghost behind for Ghosts of You.' },
  { id: 'karmaloop', a: 'karma',   b: 'dejavu',   name: 'Karmic Loop',         desc: 'Every Karma ring happens again a second later, at 70%.' },
  // The Redtail
  { id: 'throwdown', a: 'wedding', b: 'banjo',    name: 'Hoedown Throwdown',   desc: 'Every Both Barrels blast also plays a ring of low notes.' },
  { id: 'shine',     a: 'moonshine', b: 'wedding', name: 'Shotgun Shine',      desc: 'Shotgun Wedding pellets set enemies alight, and hit burning enemies 50% harder.' },
  // The Designer Baby
  { id: 'genesplice', a: 'genegun', b: 'siphon',  name: 'Gene Splice',         desc: 'Every 10 bullets the Siphon eats fires a free Gene Gun helix at the nearest enemy.' },
);
for (const c of COMBOS) COMBO_BY[c.id] = c;

const ptag = (e, k, s) => { (e.ptag || (e.ptag = {}))[k] = G.t + (s || 2); };
const ptagged = (e, k) => !!(e.ptag && e.ptag[k] > G.t);
const addGhost = n => { const g = owned('ghosts'); if (g && typeof ghostCap === 'function') g.souls = Math.min(ghostCap(g), (g.souls || 0) + n); };

// Every weapon hit (not damage over time): set tags, and the on-hit effects.
function pair2Hit(e, dmg, src) {
  const id = src.w && src.w.id, P = G.pair || {};
  if (!id) return;
  if (id === 'shotgun' && P.reception) ptag(e, 'hic');
  if (id === 'onesie' && P.flammable) ptag(e, 'thorn', 3);
  if (id === 'crayon' && P.campfire) ptag(e, 'cray');
  if (id === 'flail' && P.lashingout) ptag(e, 'lash');
  if (id === 'blaster' && P.seenit) ptag(e, 'spit');
  if (id === 'peekaboo') { if (P.surprise) ptag(e, 'boo'); if (P.spooked) addGhost(1); }
  if (id === 'twin' && P.mindthegap) ptag(e, 'beam', 1);
  if (id === 'dejavu') {
    if (P.beenhere && e.due) e.due.stored += dmg * 0.25;
    if (comboOn('hauntmem') && Math.random() < 0.25) addGhost(1);
  }
  if (id === 'wedding' && comboOn('shine') && !e.dead) { e.burn = Math.max(e.burn, 2); setBurn(e, dmg * 0.25, Object.assign({}, src, { wname: 'Shotgun Shine' })); }
}
// Damage multipliers for these pairings and combos (every hit, including ones that don't proc).
function pair2Mul(e, src) {
  const id = src.w && src.w.id, P = G.pair || {};
  if (src.wname === 'Gene Edit' && P.genetherapy && G.lsBudget > 0) { const h = Math.min(G.lsBudget, G.P.maxHp * 0.01); G.lsBudget -= h; healPlayer(h, true); }
  if (!id) return 1;
  let m = 1;
  if (id === 'wedding') { if (P.reception && ptagged(e, 'hic')) m *= 1.35; if (P.surprise && ptagged(e, 'boo')) m *= 1.4; if (comboOn('shine') && e.burn > 0) m *= 1.5; }
  if (id === 'banjo') { if (P.campfire && ptagged(e, 'cray')) m *= 1.4; if (P.bubbleband && e.bubT > G.t) m *= 1.5; }
  if (id === 'moonshine' && P.lastorders && e.due) m *= 1.4;
  if (id === 'genegun' && P.mindthegap && ptagged(e, 'beam')) m *= 1.3;
  if (id === 'karma') { if (P.toothfortooth && e.teeth > 0) m *= 1.35; if (P.lashingout && ptagged(e, 'lash')) m *= 1.35; }
  if (id === 'dejavu' && P.seenit && ptagged(e, 'spit')) m *= 1.4;
  return m;
}
function pair2Kill(e, src) {
  const P = G.pair || {};
  if (!P) return;
  if (P.flammable && e.burn > 0 && ptagged(e, 'thorn') && G.zones.length < 220) {
    const mw = owned('moonshine');
    if (mw && mw.s) G.zones.push({ x: e.x, y: e.y, r: 50, life: 2, max: 2, dps: mw.s.dmg * 0.4, elem: 'fire', pull: 0, color: '#f48c06', tick: 0, src: Object.assign(weaponSrc(mw), { wname: 'Flammable Fabric' }) });
  }
  if (P.lostsibs && src && src.w && src.w.id === 'seeker') addGhost(1);
}
// After a weapon fires (comboFire).
function pair2Fire(w, target) {
  if (w.id === 'karma' && comboOn('karmaloop') && !w.echo) {
    const s = w.s, src = comboSrc(w, 'Karmic Loop'), n = s.count, dmg = s.dmg * 0.7 * (typeof karmaMul === 'function' ? karmaMul() : 1);
    after(1, () => { if (!G || !w.s) return; const p = me(); for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU + 0.15, src, { dmg, color: '#e8dcff', noMods: true }); });
  }
}
// From siphonAte.
function pair2Ate(w) {
  if (!comboOn('genesplice') || (w.geneAte = (w.geneAte || 0) + 1) % 10) return;
  const gg = owned('genegun'), p = me(), t = acquire('nearest', 420, p.x, p.y);
  if (gg && gg.s && t && typeof geneHelix === 'function') geneHelix(gg, p.x, p.y, Math.atan2(t.y - p.y, t.x - p.x), comboSrc(gg, 'Gene Splice'), geneElems(gg), hasSig(gg, 'ggtriple') ? 3 : 2, hasSig(gg, 'ggchimera'), false);
}
// From Shotgun Wedding, on a Both Barrels blast.
function pair2Both(w) {
  if (!comboOn('throwdown')) return;
  const bw = owned('banjo');
  if (!bw || !bw.s) return;
  const s = bw.s, p = me(), n = s.count, sp = s.speed * 0.7, off = Math.random() * TAU, src = comboSrc(bw, 'Hoedown Throwdown');
  for (let i = 0; i < n; i++) { const a = off + i / n * TAU; spawnProj(bw, p.x, p.y, a, src, { speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: s.range * 0.8 / sp, dmg: s.dmg * 1.45, r: (s.size || 4) * 1.7, note: 'lo', color: '#f48c06' }); }
}
