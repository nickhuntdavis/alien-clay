'use strict';
// Spawn Prawn - the vertical slice's sperm passives and pairs (redesign docs/SPERM_PASSIVES.md, MODIFIER_MATRIX.md 5.3;
// IMPLEMENTATION_PLAN.md Phase 3). Draft names; every line is TODO_COPY.
//  - FEVER PITCH (Fire): an enemy that dies burning sets 1 neighbour alight (2, then 3). Mastery: burning enemies that
//    touch share their Burn (the larger burn spreads to the other, once a second).
//  - PERSONAL SPACE: a field round you (radius 80) pushes enemies away, 40 a second (Squishy half, elites 50%, bosses 25%,
//    never into walls). Its Rank 2 card opens a fork: A Repel (push doubled; an enemy pushed out is staggered 0.3 s) or
//    B Attract (the field pulls instead). Rank 3: radius 110, and A: enemies pushed into each other collide (40% of
//    the push as a shove), B: enemies pulled close are slowed 20%. Mastery: A: enemy bullets in the field slow by half;
//    B: enemies within 60 take +20% from your Contact and Burst hits.
//  - INTERNAL RICOCHET: Membrane Shield's mastery (needs Latex Protection, Thicker Membrane and Faster Recharge; uses the
//    sperm-passive mastery). While the bubble is up, your shots bounce back off its inside (twice each).
//  - PAIRS (two modifiers on one weapon): Chain reaction (Connecting + Ricochet): beam bounces go to a linked enemy
//    first and lose nothing; Not Finished Yet (Ricochet + Focused Intensity): a kill passes the beam on to an enemy
//    within 110 at 70%, up to 3 jumps. Holding one half of a pair makes the draft offer the other half 50% more often.
// Not built: Advanced Targeting (needs its rules menu), Carousel, Smart bounce, combo masteries.
// Hooks: none in shared files. Wraps weapons24.js wupTick, wupKill, wupDmgMul; draft.js forkCards, draftTitle;
// modslice.js msRicochet target choice (msBounceTo); modmatrix.js modDraftCands (pair weights). Loads after modslice.js.

mutCard({ id: 'sp_fever', title: 'Fever Pitch', icon: 'FP', rarity: 2, maxRank: 3, family: 'mut:fire', flavour: 'TODO_COPY:sp_fever_line', desc: 'TODO_COPY:sp_fever_desc' });
mutCard({ id: 'sp_space', title: 'Personal Space', icon: 'PS', rarity: 1, maxRank: 3, family: 'mut:body', flavour: 'TODO_COPY:sp_space_line', desc: 'TODO_COPY:sp_space_desc' });
mutCard({ id: 'sp_iric', title: 'Internal Ricochet', icon: 'IR', rarity: 4, maxRank: 1, family: 'mut:rules', flavour: 'TODO_COPY:sp_iric_line', desc: 'TODO_COPY:sp_iric_desc' });
{ // masteries (a 4th rank, one a build: spassives.js spMasteryRoom) and Personal Space's fork at Rank 2
  for (const id of ['sp_fever', 'sp_space']) {
    const c = MUT_REG.find(x => x.id === id), el = c.eligible, ap = c.apply;
    c.maxRank = 4; c.eligible = G => el(G) && (mr(id) < 3 || spMasteryRoom('sperm'));
    c.apply = (G, t) => {
      const r0 = mr(id); ap(G, t); const r1 = mr(id);
      if (r0 === 3 && r1 === 4) (G.spM || (G.spM = [])).push(id);
      if (id === 'sp_space' && r0 === 1 && r1 === 2) G.lootQueue.unshift({ kind: 'fork', v10ok: true, lv: 2, sp: id });
    };
  }
  const ir = MUT_REG.find(x => x.id === 'sp_iric'), el = ir.eligible, ap = ir.apply;
  ir.eligible = G => el(G) && !!G.pd && G.pd.n.latex > 0 && G.pd.n.thick > 0 && G.pd.n.fast > 0 && spMasteryRoom('sperm');
  ir.apply = (G, t) => { ap(G, t); (G.spM || (G.spM = [])).push('sp_iric'); };
}
const SPS_BR = { sp_space: [['A', 'Repel'], ['B', 'Attract']] };
const spsBr = id => (G.spB && G.spB[id]) || 'A';
forkCards = (orig => function (req) {
  if (!req.sp) return orig(req);
  return SPS_BR[req.sp].map(([k, nm]) => ({ rarity: 3, tag: 'FORK', icon: 'F', color: '#ffd23f', title: nm, sub: (MUT_REG.find(c => c.id === req.sp) || {}).title,
    desc: 'TODO_COPY:br_' + req.sp + '_' + k, apply: () => { (G.spB || (G.spB = {}))[req.sp] = k; } }));
})(forkCards);
draftTitle = (orig => function (req) {
  if (!req.sp) return orig(req);
  return [(MUT_REG.find(c => c.id === req.sp) || {}).title.toUpperCase() + ': LEVEL 2 FORK', 'Two ways to grow. Take one; the other is gone for the run.'];
})(draftTitle);

// ---------------------------------------------------------------- Personal Space
function spsSpace(dt) {
  const r = mr('sp_space'); if (!r) return;
  const p = G.player, br = r >= 2 ? spsBr('sp_space') : 'A', R = r >= 3 ? 110 : 80, pull = br === 'B';
  const f0 = 40 * (r >= 2 && !pull ? 2 : 1) * dt;
  for (const e of G.enemies) { // (not forNear: its grid lags a frame behind spawns)
    if (e.egg || e.dead || Math.hypot(e.x - p.x, e.y - p.y) > R) continue;
    let f = f0; if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5; if (fightCd(e).def === 'squishy') f *= 0.5;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1, s = pull ? -Math.min(f, Math.max(0, d - (e.r || 10) - 14)) : f;
    const nx = e.x + dx / d * s, ny = e.y + dy / d * s;
    if (G.lvl && lvSolidAt(nx, ny)) continue;
    e.x = nx; e.y = ny;
    if (!pull && r >= 2 && d <= R && d + s > R && !e.boss) e.dazeT = Math.max(e.dazeT || 0, G.t + 0.3); // Repel: pushed out, staggered
    if (!pull && r >= 3) forNear(e.x, e.y, (e.r || 10) * 2, o => { if (o !== e && !o.dead && !o.boss) { o.x += dx / d * s * 0.4; o.y += dy / d * s * 0.4; } }); // bumped into each other
    if (pull && r >= 3) { e.chill = Math.max(e.chill || 0, 0.2); e.chillAmt = Math.max(e.chillAmt || 0, e.boss ? 0.06 : 0.2); }
  }
  if (r >= 4 && br === 'A') for (const b of G.ebul) if (!b.dead && !b.spsSlow && Math.hypot(b.x - p.x, b.y - p.y) < R) { b.spsSlow = 1; b.vx *= 0.5; b.vy *= 0.5; }
}

// ---------------------------------------------------------------- Fever Pitch
function spsFeverKill(e) {
  const r = mr('sp_fever'); if (!r || !e.cd || !(e.cd.burnT > 0)) return;
  const pool = Math.max(e.cd.burnPool || 0, e.maxHp * 0.05), n = Math.min(3, r);
  const near = G.enemies.filter(o => !o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 90).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y)).slice(0, n);
  for (const o of near) { burnAdd(fightCd(o), pool / COMBAT.burnFrac * 0.5); bolt(e.x, e.y, o.x, o.y, V10_COL.flame || '#ff7a1a', 0.15); }
}
function spsFeverTick() {
  if (mr('sp_fever') < 4 || (G.spsFevT || 0) > G.t) return;
  G.spsFevT = G.t + 1;
  for (const e of G.enemies) {
    if (e.dead || !e.cd || !(e.cd.burnT > 0)) continue;
    forNear(e.x, e.y, (e.r || 10) * 2 + 4, o => { if (o !== e && !o.dead && o.cd && !(o.cd.burnT > 0)) { o.cd.burnPool = Math.max(o.cd.burnPool || 0, Math.min(e.cd.burnPool, COMBAT.burnCapFrac * o.maxHp)); o.cd.burnT = COMBAT.burnT; } });
  }
}

// ---------------------------------------------------------------- Internal Ricochet
function spsIric() {
  if (!mr('sp_iric') || typeof pdefBubbleR !== 'function') return;
  const R = pdefBubbleR(); if (!R) return;
  const p = G.player;
  for (const b of G.proj) {
    if (b.dead || b.lob || b.mine || !b.vx && !b.vy || (b.irN || 0) >= 2) continue;
    const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
    if (d < R || d > R + 30 || dx * b.vx + dy * b.vy <= 0) continue;
    const nx = dx / d, ny = dy / d, dot = b.vx * nx + b.vy * ny;
    b.vx -= 2 * dot * nx; b.vy -= 2 * dot * ny; b.x = p.x + nx * (R - 1); b.y = p.y + ny * (R - 1);
    b.irN = (b.irN || 0) + 1; b.life = Math.max(b.life || 0, 0.6);
  }
}

// ---------------------------------------------------------------- pairs
const SPS_PAIRS = [['connecting', 'ricochet'], ['ricochet', 'focus']];
const spsPair = (w, a, b) => modHas(w, a) && modHas(w, b);
// Chain reaction: the next bounce goes to a linked enemy if there is one, with no loss.
function msBounceTo(w, e) {
  if (!spsPair(w, 'connecting', 'ricochet')) return null;
  const L = msLinksOf(e).find(l => l.w === w); return L ? (L.a === e ? L.b : L.a) : null;
}
msRicochet = (orig => function (w, target, src) {
  if (!spsPair(w, 'connecting', 'ricochet')) return orig(w, target, src);
  let e = target, n = [1, 3, 6, 12][Math.min(4, msR(w, 'ricochet')) - 1];
  const seen = [e];
  while (n > 0 && e) { const o = msBounceTo(w, e); if (!o || seen.includes(o)) break; msBeamFx(w, e.x, e.y, o.x, o.y, w.s.width || 10); damageEnemy(o, w.s.dmg, src); seen.push(o); e = o; n--; }
  if (n > 0) orig(w, e, src);
})(msRicochet);
// Not Finished Yet: a kill passes the beam on.
function spsNfy(e, src) {
  const w = src && src.w; if (!w || src.nfyN >= 3 || w.def.v10atk !== 'beam' || !spsPair(w, 'ricochet', 'focus')) return;
  const o = msNear(e.x, e.y, 110, [e]); if (!o) return;
  const k = Math.pow(0.7, (src.nfyN || 0) + 1);
  after(0.05, () => { if (!o.dead) { msBeamFx(w, e.x, e.y, o.x, o.y, w.s.width || 10); damageEnemy(o, w.s.dmg * k, Object.assign({}, src, { nfyN: (src.nfyN || 0) + 1 })); } });
}
// Draft: the other half of a pair you half hold turns up 50% more often.
modDraftCands = (orig => function (kind) {
  const out = orig(kind);
  for (const c of out) {
    const id = c.fam && c.fam.startsWith('mod:') ? c.fam.slice(4) : null; if (!id) continue;
    if (SPS_PAIRS.some(([a, b]) => (a === id || b === id) && G.weapons.some(w => w && !w.isSpell && modHas(w, a === id ? b : a) && !modHas(w, id)))) c.w *= 1.5;
  }
  return out;
})(modDraftCands);

// ---------------------------------------------------------------- hooks
wupTick = (orig => function (dt) { orig(dt); if (!G || G.state !== 'play') return; spsSpace(dt); spsFeverTick(); spsIric(); })(wupTick);
wupKill = (orig => function (e, src) { orig(e, src); spsFeverKill(e); spsNfy(e, src); })(wupKill);
wupDmgMul = (orig => function (e, src) { // Attract mastery: close enemies take more from Contact and Burst
  let k = orig(e, src);
  if (mr('sp_space') >= 4 && spsBr('sp_space') === 'B' && src && src.w && ['contact', 'burst'].includes(src.w.def.v10atk) && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 60) k *= 1.2;
  return k;
})(wupDmgMul);
