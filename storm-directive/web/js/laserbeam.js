'use strict';
// Spawn Prawn - the Laser fires like a laser (user, 23 Oct). Replaces v10.js v10Fire for the Laser only (laser.js LASER).
//  - RAY: the beam leaves you and stops at the first enemy it meets (it doesn't pierce by default). Its aim swings
//    towards the target at a turn rate (LZ.turn), so it meets enemies off-centre and reflects at real angles.
//  - BOUNCE (the renamed Ricochet modifier): at each enemy the beam reflects off the enemy's surface at the true angle
//    of incidence, like a laser pointer off a mirrored ball (1 / 3 / 6 bounces, 12 at mastery; -20% each).
//  - PIERCING (now fits beams): the beam carries on through 1 / 3 / 6 enemies (12 at mastery), -15% each.
//    With Bounce as well, every enemy splits the beam: one part carries straight on, one reflects, each at half power.
//  - INTERNAL RICOCHET (spslice.js sp_iric): while the membrane is up, the beam can't leave the bubble: it reflects
//    off the bubble's inside wall over and over (LZ.wallMax reflections), hitting what touches the bubble.
//  - RAMP: the Laser starts weak (LZ.start of its damage) and builds while it stays on one target, to LZ.peak after
//    LZ.time seconds; a new target starts again. Focused Intensity speeds the ramp up (+20% a rank) and raises the peak
//    (+0.2 a rank) instead of its usual multiplier; its branches (Tunnel Vision keeps part of the ramp on a switch)
//    and masteries still apply.
//  - Bounded: at most LZ.segs beam segments a shot.
// Extra Projectiles (front, rear and Disco Ball beams) fire through the same ray. Hooks: none in shared files. Wraps
// v10.js v10Fire (outermost: loads after modwide.js). Renames modifiers.js MODS10.ricochet to Bounce.

const LZ = { start: 0.45, peak: 1.6, time: 2.2, turn: 5, segs: 32, wallMax: 14, keep: 0.5 };
MODS10.ricochet.name = 'Bounce';
if (!MODS10.piercing.atk.includes('beam')) MODS10.piercing.atk.push('beam');

// Red in every form (rings, mines, strikes, links, bursts all read w.def.color): later colour passes set the Fire colour
// on the shared def, so its colour is pinned. A Switched at Birth def (modcards.js sabSwitch) has its own colour.
{ const d = WEAPONS[LASER.id]; if (d) Object.defineProperty(d, 'color', { get: () => LASER.col, set: () => {}, configurable: true, enumerable: true }); }
const lzIs = w => !!(w && w.def && typeof LASER !== 'undefined' && (w.id === LASER.id || w.def.name === LASER.name));
const lzN = r => [0, 1, 3, 6, 12][Math.min(4, r || 0)];

// The ramp: how strong the beam is on its current target (Focused Intensity: faster and higher).
function lzRamp(w, e) {
  const fr = Math.min(3, msR(w, 'focus')), T = LZ.time / (1 + 0.2 * fr), top = LZ.peak + 0.2 * fr;
  if (e && (w.lzE !== e || G.t - (w.lzLast || -9) > 0.6)) {
    const was = w.lzE && !w.lzE.dead && G.t - (w.lzLast || -9) <= 0.6 ? G.t - w.lzS : 0;
    const keep = msA(w, 'focus', 3) ? 0.75 : msA(w, 'focus', 2) ? 0.5 : 0;
    w.lzE = e; w.lzS = G.t - was * keep;
  }
  if (e) w.lzLast = G.t;
  const u = Math.min(1, (G.t - (w.lzS || G.t)) / T);
  return LZ.start + (top - LZ.start) * u;
}
const lzFull = w => G.t - (w.lzS || G.t) >= LZ.time / (1 + 0.2 * Math.min(3, msR(w, 'focus')));

// One ray from (x, y) at angle a: the first enemy (or the bubble wall) it meets.
function lzMeet(x, y, a, L, skip, bub) {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = null, bt = L;
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e === skip) continue;
    const fx = e.x - x, fy = e.y - y, tc = fx * dx + fy * dy; if (tc < -e.r) continue;
    const h2 = fx * fx + fy * fy - tc * tc, r = e.r || 10; if (h2 > r * r) continue;
    let t = tc - Math.sqrt(r * r - h2); if (t < 0.5) t = 0.5;
    if (t < bt) { bt = t; best = { e, t }; }
  }
  if (bub) { // leaving the bubble from inside: |p + t d - c| = R
    const fx = x - bub.x, fy = y - bub.y, b = fx * dx + fy * dy, c = fx * fx + fy * fy - bub.r * bub.r, disc = b * b - c;
    if (disc >= 0) { const t = -b + Math.sqrt(disc); if (t > 0.5 && t < bt) { bt = t; best = { wall: true, t }; } }
  }
  return best ? best : { t: L };
}
// Trace one beam: damage, bounces, piercing, bubble reflections. st carries the shot's budget.
function lzTrace(w, x, y, a, L, k, src, skip, st, pierce, bounce) {
  if (st.segs >= LZ.segs || k < 0.04 || L < 4) return;
  st.segs++;
  const m = lzMeet(x, y, a, L, skip, st.bub), dx = Math.cos(a), dy = Math.sin(a), cx = x + dx * m.t, cy = y + dy * m.t;
  msBeamFx(w, x, y, cx, cy, (w.s.width || 10) * Math.max(0.35, Math.sqrt(Math.min(1, k))));
  if (m.wall) { // reflect off the inside of the membrane (Internal Ricochet)
    if (st.walls >= LZ.wallMax) return; st.walls++;
    const nx = (cx - st.bub.x) / st.bub.r, ny = (cy - st.bub.y) / st.bub.r, dot = dx * nx + dy * ny;
    lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), L, k * 0.97, src, null, st, pierce, bounce);
    return;
  }
  const e = m.e; if (!e) return;
  if (!st.first) st.first = e;
  damageEnemy(e, w.s.dmg * k * st.ramp, src);
  const rest = L - m.t, both = pierce > 0 && bounce > 0;
  if (pierce > 0) { // carry straight on through it
    const ox = e.x - cx, oy = e.y - cy, through = 2 * (ox * dx + oy * dy); // (out the far side of the circle)
    lzTrace(w, cx + dx * through, cy + dy * through, a, rest - through, k * (both ? 0.5 : 0.85), src, e, st, pierce - 1, both ? bounce : 0);
  }
  if (bounce > 0) { // reflect off its surface at the true angle
    const nx = (cx - e.x) / (e.r || 10), ny = (cy - e.y) / (e.r || 10), dot = dx * nx + dy * ny;
    lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), rest, k * (both ? 0.5 : 0.8), src, e, st, both ? pierce : 0, bounce - 1);
  }
}
// One shot along angle a from you.
function lzShot(w, a, src, k, ramp) {
  const p = G.player, pr = msR(w, 'piercing'), br = msR(w, 'ricochet');
  const st = { segs: 0, walls: 0, ramp, first: null, bub: null };
  if (typeof mr === 'function' && mr('sp_iric') && typeof pdefBubbleR === 'function') { const R = pdefBubbleR(); if (R > 0) st.bub = { x: p.x, y: p.y, r: R }; }
  lzTrace(w, p.x, p.y, a, st.bub ? 1e4 : w.s.range, k, src, null, st, lzN(pr), lzN(br));
  return st;
}

v10Fire = (orig => function (w, target, src) {
  if (!lzIs(w) || !target || w.def.v10atk !== 'beam') return orig(w, target, src);
  const p = G.player, want = Math.atan2(target.y - p.y, target.x - p.x);
  // The aim swings towards the target (a beam that sweeps, not one that snaps)
  if (w.lzA == null || G.t - (w.lzAT || -9) > 1) w.lzA = want;
  else { const dt = Math.max(0.016, G.t - w.lzAT), d = angDiff(want, w.lzA), m = LZ.turn * dt; w.lzA += Math.max(-m, Math.min(m, d)); }
  w.lzAT = G.t;
  // The ramp follows whatever the main beam is actually on
  const probe = lzMeet(p.x, p.y, w.lzA, w.s.range, null, null).e || null;
  const ramp = lzRamp(w, probe);
  const main = lzShot(w, w.lzA, src, 1, ramp);
  // Extra Projectiles: more beams at other targets (front 180 degrees, then rear), Disco Ball's rotating beams
  if (msR(w, 'extra')) {
    const [f, b] = msBeams(w), front = [], rear = [], L = w.s.range;
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e === target || Math.hypot(e.x - p.x, e.y - p.y) > L) continue;
      const da = Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), want));
      (da <= Math.PI / 2 ? front : rear).push(e);
    }
    const byD = (u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y);
    for (const e of front.sort(byD).slice(0, f)) lzShot(w, Math.atan2(e.y - p.y, e.x - p.x), src, 1, ramp);
    for (const e of rear.sort(byD).slice(0, b)) lzShot(w, Math.atan2(e.y - p.y, e.x - p.x), src, 1, ramp);
    if (msMa(w, 'extra') === 'A1') for (let i = 0; i < 6; i++) lzShot(w, G.t * 1.5 + i / 6 * TAU, src, 0.5, ramp);
  }
  if (main.first) w.lzOn = main.first;
  return true;
})(v10Fire);

// Focused Intensity on the Laser works through the ramp above, not its usual multiplier (modslice.js msDmgMul reads this).
const lzOwnFocus = w => lzIs(w);
