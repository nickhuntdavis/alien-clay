'use strict';
// Spawn Prawn - the Laser fires like a laser (user, 23 Oct). Replaces v10.js v10Fire for the Laser only (laser.js LASER).
//  - RAY: the beam leaves you and stops at the first enemy it meets (it doesn't pierce by default). Its aim swings
//    towards the target at a turn rate (LZ.turn), so it meets enemies off-centre and reflects at real angles; a new
//    target more than 50 degrees away switches it off and back on aimed there instead. A beam that runs into open
//    water is seen 3 times as far (to the first thing in the way, hurting nothing there) and fades out.
//  - BOUNCE (the renamed Ricochet modifier): at each enemy the beam reflects off the enemy's surface at the true angle
//    set by the sperm head's angle against the beam (lzBounceDir); only a beam exactly in line with the head doesn't bounce
//    of incidence, like a laser pointer off a mirrored ball (1 / 3 / 6 bounces, 12 at mastery; each keeps 35 / 50 / 65%, 80% at mastery: LZ_KEEP).
//  - PIERCING (now fits beams): the beam carries on through 1 / 3 / 6 enemies (12 at mastery); what gets through each
//    keeps 30 / 45 / 60%, 75% at mastery (LZ_PKEEP), and gets its own length past the enemy.
//    With Bounce as well, every enemy splits the beam: one part carries straight on, one reflects, each at half power.
//  - INTERNAL RICOCHET (spslice.js sp_iric): while the membrane is up, the beam can't leave the bubble: it reflects
//    off the bubble's inside wall over and over (LZ.wallMax reflections), hitting what touches the bubble.
//  - RAMP: the Laser starts weak (LZ.start of its damage) and builds while it stays on one target, to LZ.peak after
//    LZ.time seconds; a new target starts again. Focused Intensity speeds the ramp up (+20% a rank) and raises the peak
//    (+0.2 a rank) instead of its usual multiplier; its branches (Tunnel Vision keeps part of the ramp on a switch)
//    and masteries still apply.
//  - CHARGE: a beam starting from off first charges for LZ.charge seconds (shorter with Rapid Fire: lzCharge), a small
//    glow growing at the sperm's head.
//  - OVERHEAT: a burn bar under you fills while it fires; full, the Laser switches off and reloads until cool (lzHeatTick).
//  - Growing is not offered on the Laser. CHARGE-UP turns it into a charge-and-blast weapon (lzBlast).
//  - Bounded: at most LZ.segs beam segments a shot.
// Extra Projectiles (front, rear and Disco Ball beams) fire through the same ray. Hooks: none in shared files. Wraps
// v10.js v10Fire (outermost: loads after modwide.js). Renames modifiers.js MODS10.ricochet to Bounce.

const LZ = { charge: 0.6, heatT: 4, coolT: 2.2, inLine: 1 * Math.PI / 180, bounceL: 0.75, fade: 0.7, reachK: 3, sweepMax: 50 * Math.PI / 180, gap: 0.08, start: 0.45, peak: 1.6, time: 2.2, turn: 5, segs: 64, wallMax: 14, keep: 0.5 };
MODS10.ricochet.name = 'Bounce';
if (!MODS10.homing.atk.includes('beam')) MODS10.homing.atk.push('beam'); // (Homing bends the Laser: lzTrace)
if (!MODS10.piercing.atk.includes('beam')) MODS10.piercing.atk.push('beam');

// Red in every form (rings, mines, strikes, links, bursts all read w.def.color): later colour passes set the Fire colour
// on the shared def, so its colour is pinned. A Switched at Birth def (modcards.js sabSwitch) has its own colour.
{ const d = WEAPONS[LASER.id]; if (d) Object.defineProperty(d, 'color', { get: () => LASER.col, set: () => {}, configurable: true, enumerable: true }); }
// The bounce angle (user, 23 Oct): set by where the sperm head points against the beam's line to the enemy, not by
// where on the enemy it lands. delta = head angle minus beam angle; the beam reflects as if off a surface tilted by
// delta (2 x delta away from straight back, at most 80 degrees of tilt). Only a beam exactly in line with the head
// (within LZ.inLine) doesn't reflect at all.
const lzHead = () => { const p = G.player; return p.hd != null ? p.hd : p.face || 0; };
function lzBounceDir(dx, dy, delta) {
  if (Math.abs(delta) < LZ.inLine) return null;
  const d = Math.max(-1.4, Math.min(1.4, delta)), na = Math.atan2(dy, dx) + Math.PI + d, c = Math.cos(d);
  return Math.atan2(dy + 2 * c * Math.sin(na), dx + 2 * c * Math.cos(na));
}
// What a bounce keeps (user, 23 Oct): a lot is lost at first, less with each Bounce rank (damage and brightness).
const LZ_KEEP = [0.35, 0.5, 0.65, 0.8]; // (Rank 1, 2, 3, mastery)
// What gets through an enemy with Piercing: a sliver at Rank 1, more each rank (damage and brightness).
const LZ_PKEEP = [0.3, 0.45, 0.6, 0.75];
const lzPKeep = (w, both) => LZ_PKEEP[Math.max(0, Math.min(4, msR(w, 'piercing')) - 1)] * (both ? 0.6 : 1);
const lzKeep = (w, both) => LZ_KEEP[Math.max(0, Math.min(4, msR(w, 'ricochet')) - 1)] * (both ? 0.6 : 1);
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
// SWEEP and GROWING on the Laser (user, 23 Oct). Sweep: the beam swings either side of its target (about 34 / 42 / 50
// degrees, 57 at mastery), following all the beam's rules. Growing: the beam widens the longer it is held (up to x1.33
// / x1.67 / x2, x2.33 at mastery, over 3 s; resets when it goes out); a wider beam catches enemies near its line (LZC.pad).
const LZC = { pad: 0 };
const lzSweep = w => { const r = Math.min(4, modCount(w, 'sweep')); return r ? Math.sin(G.t * 3.2) * [1.8, 2.2, 2.6, 3][r - 1] / 3 : 0; };
const lzGrow = w => { const r = Math.min(4, modCount(w, 'growing')); return r ? 1 + Math.min(1, (G.t - (w.lzHeldS || G.t)) / 3) * [1 / 3, 2 / 3, 1, 4 / 3][r - 1] : 1; };
function lzMeet(x, y, a, L, skip, bub) {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = null, bt = L;
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e === skip || (skip && skip.has && skip.has(e))) continue; // (skip: one enemy, or a set of them)
    const fx = e.x - x, fy = e.y - y, tc = fx * dx + fy * dy; if (tc < -e.r) continue;
    const h2 = fx * fx + fy * fy - tc * tc, r = (e.r || 10) + LZC.pad; if (h2 > r * r) continue;
    let t = tc - Math.sqrt(r * r - h2); if (t < 0.5) t = 0.5;
    if (t < bt) { bt = t; best = { e, t }; }
  }
  if (G.terrain && G.terrain.list) for (const ob of G.terrain.list) { // solid obstacles: the beam stops or reflects
    if (!ob.def || !ob.def.solid) continue;
    const fx = ob.x - x, fy = ob.y - y, tc = fx * dx + fy * dy; if (tc < -ob.r) continue;
    const h2 = fx * fx + fy * fy - tc * tc; if (h2 > ob.r * ob.r) continue;
    let t = tc - Math.sqrt(ob.r * ob.r - h2); if (t < 0.5) continue;
    if (t < bt) { bt = t; best = { ob, t }; }
  }
  if (bub) { // leaving the bubble from inside: |p + t d - c| = R
    const fx = x - bub.x, fy = y - bub.y, b = fx * dx + fy * dy, c = fx * fx + fy * fy - bub.r * bub.r, disc = b * b - c;
    if (disc >= 0) { const t = -b + Math.sqrt(disc); if (t > 0.5 && t < bt) { bt = t; best = { wall: true, t }; } }
  }
  return best ? best : { t: L };
}
// Trace one beam: damage, bounces, piercing, bubble reflections. st carries the shot's budget; st.out collects the
// segments (drawn every frame, see below); st.dry traces without damage (the per-frame picture).
// HOMING on the Laser (user, 23 Oct): the beam, and every bounce and pierce, curves towards the enemy ahead of it (the one
// nearest its line within 70 degrees), turning up to 7 / 13 / 18 degrees (26 at mastery) every 45 units. Laser mines' beams
// don't home (they spin).
function lzSeek(x, y, a, L, skip) {
  let best = null, ba = 1.22;
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e === skip || (skip && skip.has && skip.has(e))) continue;
    const d = Math.hypot(e.x - x, e.y - y); if (d > L || d < 1) continue;
    const da = Math.abs(angDiff(Math.atan2(e.y - y, e.x - x), a)); if (da < ba) { ba = da; best = e; }
  }
  return best;
}
function lzTrace(w, x, y, a, L, k, src, skip, st, pierce, bounce) {
  if (st.segs >= LZ.segs || k < 0.04 || L < 4) return;
  st.segs++;
  const hr = st.noHome ? 0 : Math.min(4, msR(w, 'homing'));
  if (hr && L > 50) { // curve towards the enemy ahead, 45 units at a time
    const tg = lzSeek(x, y, a, L, skip);
    if (tg) {
      const m0 = lzMeet(x, y, a, 45, skip, st.bub);
      if (!m0.e && !m0.ob && !m0.wall) {
        const nx = x + Math.cos(a) * 45, ny = y + Math.sin(a) * 45, turn = [0.12, 0.22, 0.32, 0.45][hr - 1];
        st.out.push({ x1: x, y1: y, x2: nx, y2: ny, k, hit: false });
        lzTrace(w, nx, ny, a + Math.max(-turn, Math.min(turn, angDiff(Math.atan2(tg.y - ny, tg.x - nx), a))), L - 45, k, src, skip, st, pierce, bounce);
        return;
      }
    }
  }
  const m = lzMeet(x, y, a, L, skip, st.bub), dx = Math.cos(a), dy = Math.sin(a), cx = x + dx * m.t, cy = y + dy * m.t;
  const seg = { x1: x, y1: y, x2: cx, y2: cy, k, hit: !!(m.e || m.ob), end: !m.e && !m.ob && !m.wall }; // (end: runs out in open water)
  if (seg.end) { // seen LZ.reachK times as far (to the first thing in the way; it hurts nothing out there), fading over LZ.fade of the old length
    const ext = lzMeet(cx, cy, a, m.t * (LZ.reachK - 1), skip, st.bub).t;
    seg.x2 = cx + dx * ext; seg.y2 = cy + dy * ext; seg.fadeL = m.t * LZ.fade;
  }
  st.out.push(seg);
  if (m.wall) { // reflect off the inside of the membrane (Internal Ricochet)
    if (st.walls >= LZ.wallMax) return; st.walls++;
    const nx = (cx - st.bub.x) / st.bub.r, ny = (cy - st.bub.y) / st.bub.r, dot = dx * nx + dy * ny;
    lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), L, k * 0.97, src, null, st, pierce, bounce);
    return;
  }
  if (m.ob) { // a solid obstacle: reflect with Bounce, otherwise stop
    const ra = bounce > 0 ? lzBounceDir(dx, dy, st.delta) : null;
    if (ra == null) return; // (no Bounce, or exactly in line: it stops)
    lzTrace(w, cx, cy, ra, Math.max(L - m.t, w.s.range * LZ.bounceL), k * lzKeep(w, false), src, null, st, pierce, bounce - 1);
    return;
  }
  const e = m.e; if (!e) return;
  if (!st.first) st.first = e;
  if (!st.dry) damageEnemy(e, w.s.dmg * k * st.ramp, src);
  const rest = L - m.t, both = pierce > 0 && bounce > 0;
  if (pierce > 0) { // carry straight on through it
    const ox = e.x - cx, oy = e.y - cy, through = 2 * (ox * dx + oy * dy); // (out the far side of the circle)
    lzTrace(w, cx + dx * through, cy + dy * through, a, Math.max(rest - through, w.s.range * LZ.bounceL), k * lzPKeep(w, both), src, e, st, pierce - 1, both ? bounce : 0); // (its own length, like a bounce)
  }
  if (bounce > 0) { // reflect off its surface at the true angle (not when head-on)
    const ra = lzBounceDir(dx, dy, st.delta);
    if (ra != null) lzTrace(w, cx, cy, ra, Math.max(rest, w.s.range * LZ.bounceL), k * lzKeep(w, both), src, e, st, both ? pierce : 0, bounce - 1);
  }
}
// One beam along angle a from you.
function lzShot(w, a, src, k, ramp, dry) {
  LZC.pad = (lzGrow(w) - 1) * 12;
  const p = G.player, pr = msR(w, 'piercing'), br = msR(w, 'ricochet');
  const st = { segs: 0, walls: 0, ramp, first: null, bub: null, out: [], dry, delta: angDiff(lzHead(), a) };
  if (typeof mr === 'function' && mr('sp_iric') && typeof pdefBubbleR === 'function') { const R = pdefBubbleR(); if (R > 0) st.bub = { x: p.x, y: p.y, r: R }; }
  lzTrace(w, p.x, p.y, a, st.bub ? 1e4 : w.s.range, k, src, null, st, lzN(pr), lzN(br));
  return st;
}
// EXTRA SHOTS on the Laser (user, 23 Oct): each extra beam is its own laser (w.lzX): it locks its own target (front
// beams in your front half, the rear beam (Full Circle, Rank 2) in your back half), sweeps to it (within 50 degrees),
// has its own ramp and charges before it first fires on a new target. A beam with no target of its own runs beside the
// main beam on its target. Damage: beams on one target share one beam's damage (no loss, no gain); beams on D
// different targets deal D^0.6 beams' worth in all (more beams, less each). More beams heat the Laser faster (+33% each).
function lzXUpdate(w, target) {
  const p = G.player, [f, b] = msR(w, 'extra') ? msBeams(w) : [0, 0], n = f + b, L = w.s.range;
  const X = w.lzX = (w.lzX || []).slice(0, n); while (X.length < n) X.push({});
  const mainA = Math.atan2(target.y - p.y, target.x - p.x), taken = new Set([target]);
  X.forEach((x, i) => {
    x.rear = i >= f; x.off = (i % 2 ? -1 : 1) * 0.09 * (1 + Math.floor(i / 2));
    x.cross = x.rear && msMa(w, 'extra') === 'A2'; // (Crossfire: the rear beam curves round onto the main target: lzCross)
    if (x.cross) { x.tgt = null; x.a = null; return; }
    const inSec = e => { const da = Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), mainA)); return x.rear ? da > Math.PI / 2 : da <= Math.PI / 2; };
    const ok = e => e && !e.dead && !e.charmed && !taken.has(e) && Math.hypot(e.x - p.x, e.y - p.y) <= L + (e.r || 0) && inSec(e);
    if (!ok(x.tgt)) {
      let best = null, bd = 1e9;
      for (const e of G.enemies) { if (!ok(e)) continue; const d = Math.hypot(e.x - p.x, e.y - p.y); if (d < bd) { bd = d; best = e; } }
      if (best !== x.tgt) { x.tgt = best; if (best) { x.chgS = G.t; x.S = G.t; } }
    }
    if (x.tgt) taken.add(x.tgt);
    if (x.a == null) x.a = mainA + x.off;
  });
  // damage shares: per target group
  const on = X.filter(x => lzXOn(w, x)), groups = new Map([[target, 1]]);
  for (const x of on) { const t = x.tgt || target; groups.set(t, (groups.get(t) || 0) + 1); }
  const D = groups.size, g = Math.pow(D, 0.6) / D;
  w.lzMainK = g / groups.get(target);
  for (const x of X) x.k = g / (groups.get(x.tgt || target) || 1);
}
const lzXOn = (w, x) => !x.tgt || G.t - (x.chgS || -9) >= lzCharge(w); // (a beam on its own new target charges first)
function lzRampX(w, x) { // an extra beam's own ramp on its own target
  if (!x.tgt) return w.lzPow || 1;
  const fr = Math.min(3, msR(w, 'focus')), T = LZ.time / (1 + 0.2 * fr), top = LZ.peak + 0.2 * fr;
  return LZ.start + (top - LZ.start) * Math.min(1, (G.t - (x.S || G.t)) / T);
}
// CROSSFIRE (Extra Shots mastery, Full Circle) on the Laser (user, 23 Oct): the rear beam leaves you, curves round and
// strikes the main target from the far side, so it is caught between two beams: while both are on it, it takes +30% and
// can't be pushed out (Knockback pins it instead). Returns the shot's segments.
const lzCrossOn = w => msMa(w, 'extra') === 'A2' && (w.lzX || []).some(x => x.cross);
function lzCross(w, t, src, k, ramp, dry) {
  const p = G.player, ux = t.x - p.x, uy = t.y - p.y, d = Math.hypot(ux, uy) || 1, nx = ux / d, ny = uy / d, side = (w.lzCrossSide || (w.lzCrossSide = 1));
  const bx = t.x + nx * 70, by = t.y + ny * 70, cx = (p.x + bx) / 2 - ny * side * Math.max(120, d * 0.6), cy = (p.y + by) / 2 + nx * side * Math.max(120, d * 0.6);
  const out = []; let px = p.x, py = p.y;
  for (let j = 1; j <= 12; j++) { // (a curve out and round to behind the target)
    const u = j / 12, qx = (1 - u) * (1 - u) * p.x + 2 * (1 - u) * u * cx + u * u * bx, qy = (1 - u) * (1 - u) * p.y + 2 * (1 - u) * u * cy + u * u * by;
    out.push({ x1: px, y1: py, x2: qx, y2: qy, k: k * (0.6 + 0.4 * u), hit: false }); px = qx; py = qy;
  }
  const st = { segs: 0, walls: 0, ramp, first: null, bub: null, out, dry, delta: angDiff(lzHead(), Math.atan2(t.y - by, t.x - bx)), noHome: true };
  LZC.pad = 0; lzTrace(w, bx, by, Math.atan2(t.y - by, t.x - bx), w.s.range * 0.6, k, src, null, st, lzN(msR(w, 'piercing')), lzN(msR(w, 'ricochet')));
  if (!dry && st.first === t) t.lzCrossT = G.t + 0.25;
  return out;
}
// Every beam the Laser holds right now: [angle, power share, ramp] (main, Extra Shots' beams that are on, Disco Ball).
function lzBeams(w) {
  const sw = lzSweep(w), out = [[w.lzA + sw, w.lzMainK || 1, w.lzPow || 1]];
  for (const x of w.lzX || []) if (!x.cross && x.a != null && lzXOn(w, x)) out.push([x.a + sw, x.k || 1, lzRampX(w, x)]);
  if (msMa(w, 'extra') === 'A1') for (let i = 0; i < 6; i++) out.push([G.t * 1.5 + i / 6 * TAU, 0.5, w.lzPow || 1]);
  return out;
}
function lzXSweep(w, dt) { // each extra beam swings to its own target (or beside the main beam)
  const p = G.player;
  for (const x of w.lzX || []) {
    if (x.tgt && x.tgt.dead) x.tgt = null;
    const want = x.tgt ? Math.atan2(x.tgt.y - p.y, x.tgt.x - p.x) : w.lzA + x.off;
    if (x.a == null) { x.a = want; continue; }
    const d = angDiff(want, x.a), m = LZ.turn * dt;
    if (Math.abs(d) > LZ.sweepMax) x.a = want; else x.a += Math.max(-m, Math.min(m, d));
  }
}

// ORBITING: the beam curves out from you into a circle and runs round it (radius 72, 100 from Rank 2; a second, inner ring turning the
// other way at mastery), traced as short straight sections with the beam's own rules: an enemy in the way breaks the
// ring there (Piercing carries it on past, weaker, spending a charge in each section that meets the enemy), Bounce reflects it off the enemy or an obstacle and it carries on
// as a straight beam, and Internal Ricochet's bubble still holds it.
const lzRings = w => { const r = msR(w, 'orbiting'), R = r >= 2 ? 100 : 72; return modCount(w, 'orbiting') >= 4 ? [[R, 1], [R * 0.6, -1]] : [[R, 1]]; };
function lzOrbit(w, src, ramp, dry) {
  LZC.pad = (lzGrow(w) - 1) * 12;
  const p = G.player, out = [], N = 48;
  let first = null;
  for (const [R, dir] of lzRings(w)) {
    const st = { segs: 0, walls: 0, ramp, first: null, bub: null, out, dry, delta: 0 };
    let pierce = lzN(msR(w, 'piercing')), bounce = lzN(msR(w, 'ricochet')), k = 1;
    const a0 = G.t * 1.6 * dir;
    { // out to the ring: a curve that spirals out from you and runs into the ring along it (user, 23 Oct)
      let px = p.x, py = p.y;
      for (let j = 1; j <= 10; j++) {
        const u = j / 10, r = R * (1 - Math.pow(1 - u, 2)), th = a0 - dir * (1 - u) * Math.PI * 0.75, qx = p.x + Math.cos(th) * r, qy = p.y + Math.sin(th) * r;
        out.push({ x1: px, y1: py, x2: qx, y2: qy, k: 0.6 + 0.4 * u, hit: false }); px = qx; py = qy;
      }
    }
    for (let i = 0; i < N; i++) {
      const t1 = a0 + dir * i / N * TAU, t2 = a0 + dir * (i + 1) / N * TAU;
      const x1 = p.x + Math.cos(t1) * R, y1 = p.y + Math.sin(t1) * R, x2 = p.x + Math.cos(t2) * R, y2 = p.y + Math.sin(t2) * R;
      const passed = new Set(); // (per section: the next section can meet the same enemy again and spend Piercing again)
      const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), m = lzMeet(x1, y1, a, L, passed, null);
      const cx = x1 + Math.cos(a) * m.t, cy = y1 + Math.sin(a) * m.t;
      out.push({ x1, y1, x2: cx, y2: cy, k, hit: !!(m.e || m.ob) });
      if (!m.e && !m.ob) continue;
      if (m.e) { if (!first) first = m.e; if (!dry) damageEnemy(m.e, w.s.dmg * k * ramp, src); }
      const both = pierce > 0 && bounce > 0, rest = (N - i) / N * TAU * R;
      if (bounce > 0) { // reflect off it and carry on as a straight beam
        st.delta = angDiff(lzHead(), a); const ra = lzBounceDir(Math.cos(a), Math.sin(a), st.delta);
        if (ra != null) lzTrace(w, cx, cy, ra, w.s.range * LZ.bounceL, k * lzKeep(w, both), src, m.e, st, both ? pierce : 0, bounce - 1);
      }
      if (pierce > 0 && m.e) { // on round the ring, past it (the rest of this section too)
        pierce--; k *= lzPKeep(w, both); passed.add(m.e);
        const r2 = lzMeet(cx, cy, a, L - m.t, passed, null); out.push({ x1: cx, y1: cy, x2: cx + Math.cos(a) * r2.t, y2: cy + Math.sin(a) * r2.t, k, hit: false });
        continue;
      }
      break; // (the ring is broken here)
    }
    if (st.first && !first) first = st.first;
  }
  return { out, first };
}

// Damage ticks at the weapon's fire rate; the beam itself is held and drawn every frame (lzTick, lzDraw).
v10Fire = (orig => function (w, target, src) {
  if (!lzIs(w) || !target || w.def.v10atk !== 'beam') return orig(w, target, src);
  const p = G.player, want = Math.atan2(target.y - p.y, target.x - p.x);
  if (w.lzA == null || !lzOnNow(w)) w.lzA = want; // (a fresh beam starts on the target; a held one sweeps: lzTick)
  else if (Math.abs(angDiff(want, w.lzA)) > LZ.sweepMax) { w.lzA = want; w.lzOffT = G.t + LZ.gap; } // (too far to sweep: off, then on again at the target)
  if (w.lzOver) return true; // (overheated: reloading until it has cooled right down, lzHeatTick)
  if (lzCR(w)) { // Charge-Up: charge, then one blast
    if (!w.lzChgS || G.t - (w.lzChgLast || -9) > 0.4) w.lzChgS = G.t;
    w.lzChgLast = G.t; w.lzTgt = target;
    if (G.t - w.lzChgS >= lzCharge(w)) lzBlast(w, target, src);
    return true;
  }
  if (!lzOnNow(w)) { // a beam starting from off charges first: a glow grows at the head for LZ.charge seconds (lzDraw)
    if (!w.lzChgS || G.t - (w.lzChgLast || -9) > 0.4) w.lzChgS = G.t;
    w.lzChgLast = G.t; w.lzTgt = target;
    if (G.t - w.lzChgS < lzCharge(w)) return true;
  }
  w.lzChgS = 0;
  if (!lzOnNow(w)) w.lzHeldS = G.t; // (Growing counts from when the beam came on)
  w.lzTgt = target; w.lzFireT = G.t;
  if (msR(w, 'orbiting')) { // the ring
    const pre = lzOrbit(w, src, w.lzPow || LZ.start, true), ramp = lzRamp(w, pre.first); w.lzPow = ramp;
    const o = lzOrbit(w, src, ramp, false); w.lzShotSegs = w.lzSegs = o.out; w.lzX = []; return true;
  }
  // The ramp follows whatever the main beam is actually on
  const probe = lzMeet(p.x, p.y, w.lzA, w.s.range, null, null).e || null;
  const ramp = lzRamp(w, probe); w.lzPow = ramp;
  if (msMa(w, 'rapid') === 'B2' && G.t - (w.lzHeldS || G.t) < 0.5) src = Object.assign({}, src, { mult: (src.mult || 1) * 2 }); // (Strong Start)
  lzXUpdate(w, target); // (Extra Shots' beams: their own targets, charges and damage shares)
  w.lzShotSegs = [];
  if (lzCrossOn(w) && target.lzCrossT > G.t) src = Object.assign({}, src, { mult: (src.mult || 1) * 1.3 }); // (caught between two beams)
  lzBeams(w).forEach(([a, k, rp], i) => { const st = lzShot(w, a, src, k, rp, false); w.lzShotSegs.push(...st.out); if (i === 0 && st.first) w.lzOn = st.first; });
  if (lzCrossOn(w)) { const x = w.lzX.find(q => q.cross); w.lzShotSegs.push(...lzCross(w, target, src, x.k || 1, w.lzPow || 1, false)); }
  w.lzSegs = w.lzShotSegs;
  return true;
})(v10Fire);

// ---------------------------------------------------------------- the held beam (user, 23 Oct: a smooth line like a real laser)
// The beam stays on between damage ticks: each frame its aim sweeps towards the target (LZ.turn) and it is traced again
// (no damage) for the picture. It goes out when the weapon stops firing. Overheat (Rapid Fire) blinks it off.
const lzOnNow = w => G.t - (w.lzFireT || -9) < Math.max(0.3, (w.s.cd || 0.2) + 0.15);
// OVERHEAT (user, 23 Oct): firing heats the Laser (a burn bar under you; full after LZ.heatT seconds of beam). Full: the
// beam switches off and reloads, unusable until it has cooled right down (LZ.coolT seconds, faster with reload speed:
// G.P.reloadSpd). It never hurts you. Off the trigger it cools at the same rate.
function lzHeatTick(w, dt) {
  const on = lzOnNow(w) && !w.lzOver, cool = dt / LZ.coolT * ((G.P && G.P.reloadSpd) || 1) * (msMa(w, 'rapid') === 'A1' ? 2 : 1);
  const slow = msA(w, 'rapid', 3) ? 0.65 : msA(w, 'rapid', 2) ? 0.8 : 1; // (Rapid Fire's Cooler branch)
  const nX = (w.lzX || []).filter(x => x.a != null && lzXOn(w, x)).length; // (each extra beam heats it 33% faster)
  w.lzHeat = Math.max(0, Math.min(1, (w.lzHeat || 0) + (on ? dt / LZ.heatT * (1 + 0.33 * nX) * slow : -cool)));
  if (on && w.lzHeat >= 1) { w.lzOver = true; w.lzFireT = -9; w.lzSegs = null; w.lzChgS = 0; const p = G.player; ring(p.x, p.y, 26, LASER.col, 0.35, 3);
    if (msMa(w, 'rapid') === 'A2') { aoe(p.x, p.y, 140, w.s.dmg * 12, weaponSrc(w), w.def.color); ring(p.x, p.y, 140, LASER.col, 0.5, 6); } } // (Vent)
  if (w.lzOver && w.lzHeat <= 0) w.lzOver = false;
}
function lzTick(dt) {
  if (!G || G.state !== 'play') return;
  for (const w of G.weapons) if (w && lzIs(w) && w.def.v10atk === 'beam') lzHeatTick(w, dt);
  const p = G.player;
  for (const w of G.weapons) {
    if (!w || !lzIs(w) || w.def.v10atk !== 'beam') continue;
    if (w.lzChgS && G.t - (w.lzChgLast || -9) < 0.4 && G.t - w.lzChgS >= lzCharge(w)) w.cd = Math.min(w.cd, 0); // (charged: fire on the next frame)
    if ((!lzOnNow(w) && !(w._ventT > G.t)) || !w.lzTgt || w.lzTgt.dead) { w.lzSegs = null; continue; } // (venting keeps it traced so it can blink)
    const want = Math.atan2(w.lzTgt.y - p.y, w.lzTgt.x - p.x), d = angDiff(want, w.lzA), m = LZ.turn * dt;
    if (Math.abs(d) > LZ.sweepMax) { w.lzA = want; w.lzOffT = G.t + LZ.gap; } // (a new target over 50 degrees away: off and on again)
    else w.lzA += Math.max(-m, Math.min(m, d));
    if (msR(w, 'orbiting')) { w.lzSegs = lzOrbit(w, null, w.lzPow || 1, true).out; continue; }
    lzXSweep(w, dt);
    const segs = [];
    for (const [a, k, rp] of lzBeams(w)) segs.push(...lzShot(w, a, null, k, rp, true).out);
    if (lzCrossOn(w) && w.lzTgt && !w.lzTgt.dead) { const x = w.lzX.find(q => q.cross); segs.push(...lzCross(w, w.lzTgt, null, x.k || 1, w.lzPow || 1, true)); }
    w.lzSegs = segs;
  }
}
wupTick = (orig => function (dt) { orig(dt); lzTick(dt); })(wupTick);
// Drawn like a laser: a white-hot core in a coloured beam with a soft glow, a bright spot where it lands. More power
// glows more, in slow pulses once it is past full strength.
// Rapid Fire on the Laser: a shorter charge-up (70 / 50 / 35% of LZ.charge, 20% at mastery), nothing else.
const lzCR = w => Math.min(4, modCount(w, 'charged'));
const lzCharge = w => msMa(w, 'rapid') === 'B1' ? 0 : LZ.charge * [1, 0.7, 0.5, 0.35, 0.2][Math.min(4, msR(w, 'rapid'))] * (msB(w, 'rapid', 3) ? 0.65 : msB(w, 'rapid', 2) ? 0.8 : 1) * [1, 1.25, 1.5, 1.75, 2][lzCR(w)]; // (Charge-Up: longer; Rapid Fire's Quicker branch: shorter)
// CHARGE-UP on the Laser (user, 23 Oct): no held beam. Each charge (longer each rank) ends in one big, bright blast that
// packs the beam's held damage into one hit: a full burn bar's worth (4 s of beam at full strength) at Rank 3 (50 / 75 /
// 100%, 125% at mastery). It builds enemies' status bars 3 times as fast, and adds half a burn bar of heat to you.
const LZ_BLAST = { share: [0.5, 0.75, 1, 1.25], heat: 0.5, bars: 3, show: 0.3 };
function lzBlast(w, target, src) {
  const p = G.player, r = lzCR(w), k = (LZ.heatT / Math.max(0.05, w.s.cd || 0.2)) * LZ.peak * LZ_BLAST.share[r - 1];
  w.lzA = Math.atan2(target.y - p.y, target.x - p.x);
  const bsrc = Object.assign({}, src, { lzBlast: true });
  const segs = [];
  if (msR(w, 'orbiting')) segs.push(...lzOrbit(w, bsrc, k, false).out);
  else { lzXUpdate(w, target); for (const [a, kk] of lzBeams(w)) segs.push(...lzShot(w, a, bsrc, kk, k, false).out); }
  w.lzBlastSegs = segs; w.lzBlastT = G.t; w.lzShotSegs = segs; w.lzPow = LZ.peak;
  w.lzHeat = Math.min(1, (w.lzHeat || 0) + LZ_BLAST.heat);
  if (w.lzHeat >= 1) { w.lzOver = true; ring(p.x, p.y, 26, LASER.col, 0.35, 3); }
  cam.shake = Math.min(10, (cam.shake || 0) + 2 + r);
  w.lzChgS = 0; w.lzChgLast = -9; w.lzFireT = -9;
}
mutBarK = (orig => function (e) { // a blast builds status bars 3 times as fast
  const src = MSC.src, k0 = orig(e);
  if (!src || !src.lzBlast) return k0;
  const out = {}; for (const t of ['acid', 'fire', 'force', 'soul']) out[t] = ((k0 && k0[t]) || 1) * LZ_BLAST.bars;
  return out;
})(mutBarK);
const lzCharging = w => !!(w.lzChgS && G.t - (w.lzChgLast || -9) < 0.4 && !lzOnNow(w));
function lzChargeDraw(w, t0, sz) { // a small glow at the head that grows until the beam comes on (sz: smaller for extra beams)
  const p = G.player, hd = lzHead(), u = Math.min(1, (G.t - (t0 || w.lzChgS)) / lzCharge(w)), hx = p.x + Math.cos(hd) * 11, hy = p.y + Math.sin(hd) * 11;
  const c = col(w.def.sab ? w.def.color : LASER.col), x = sx(hx), y = sy(hy), r = (2 + 7 * u) * (1 + 0.35 * lzCR(w)) * (sz || 1) * S, fl = 0.85 + 0.15 * Math.sin(G.t * 40);
  ctx.save();
  ctx.globalAlpha = 0.25 * u * fl; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.6 * u; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.globalAlpha = 0.5 + 0.5 * u; ctx.fillStyle = '#fff4f0'; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r * 0.35), 0, TAU); ctx.fill();
  ctx.restore();
}
function lzHeatDraw(w) { // the burn bar under you: orange to red as it fills; while reloading it blinks and drains
  const p = G.player, x = sx(p.x), y = sy(p.y) + 22 * S, bw = 34 * S, bh = 4 * S, h = w.lzHeat || 0;
  if (w.lzOver && Math.floor(G.t * 8) % 2) return;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.fillStyle = '#1b1b1b'; ctx.fillRect(x - bw / 2 - S, y - S, bw + 2 * S, bh + 2 * S);
  const r = 255, g = Math.round(150 * (1 - h)), col2 = w.lzOver ? '#ff2a1f' : `rgb(${r},${g},40)`;
  ctx.globalAlpha = 0.95; ctx.fillStyle = col(col2); ctx.fillRect(x - bw / 2, y, bw * h, bh);
  ctx.restore();
}
function lzBlastDraw(w) { // the blast: a wide, white-hot flash along its path that fades in LZ_BLAST.show seconds
  const age = G.t - w.lzBlastT, f = 1 - age / LZ_BLAST.show; if (f <= 0) return;
  const c = col(w.def.sab ? w.def.color : LASER.col), base = Math.max(3, (w.s.width || 10) * 0.42) * (2.2 + 0.5 * lzCR(w)) * S;
  ctx.save(); ctx.lineCap = 'round';
  for (const s of w.lzBlastSegs) {
    const x1 = sx(s.x1), y1 = sy(s.y1), x2 = sx(s.x2), y2 = sy(s.y2), wd = base * Math.max(0.35, Math.sqrt(Math.min(1, s.k))), br = Math.pow(Math.min(1, s.k), 0.7);
    for (const [lw, a, st] of [[wd * 3, 0.22, c], [wd * 1.4, 0.7, c], [wd * 0.6, 1, '#fff8f4']]) { ctx.globalAlpha = a * f * Math.max(0.2, br); ctx.strokeStyle = st; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    if (s.hit) { ctx.globalAlpha = 0.6 * f * br; ctx.fillStyle = '#fff8f4'; ctx.beginPath(); ctx.arc(x2, y2, wd * 1.5, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}
function lzDraw() {
  if (!G) return;
  for (const w of G.weapons) if (w && lzIs(w) && w.lzBlastSegs && G.t - w.lzBlastT < LZ_BLAST.show) lzBlastDraw(w);
  for (const w of G.weapons) if (w && lzIs(w) && lzCharging(w)) lzChargeDraw(w);
  for (const w of G.weapons) if (w && lzIs(w) && lzOnNow(w)) for (const x of w.lzX || []) if (x.tgt && !lzXOn(w, x)) lzChargeDraw(w, x.chgS, 0.6); // (an extra beam charging for its new target)
  for (const w of G.weapons) if (w && lzIs(w) && (w.lzHeat > 0.01 || w.lzOver)) lzHeatDraw(w);
  for (const w of G.weapons) {
    if (!w || !lzIs(w)) continue;
    lzExtrasDraw(w); // (orbital strikes, the sword, mines, forks: laserbeam.js below)
    if (!w.lzSegs || !w.lzSegs.length) continue;
    if (w._ventT > G.t && Math.floor(G.t * 18) % 6) continue; // overheating: blinks off
    if (w.lzOffT > G.t) continue; // (switching to a target too far round to sweep to)
    lzDrawSegs(w, w.lzSegs, w.lzPow || 1, lzGrow(w) * (lzPulseOn(w) ? 1.8 : 1), lzPulseOn(w) ? 1.5 : 1);
  }
}
// Draw beam segments the Laser's way (pw: power, for glow and pulse; wk: width factor; bk: brightness factor).
function lzDrawSegs(w, segs, pw, wk, bk) {
  const glow = Math.min(1.6, (0.55 + 0.45 * Math.min(1, Math.max(0, (pw - LZ.start) / (1 - LZ.start)))) * (bk || 1));
  const pulse = pw > 1 ? 1 + 0.45 * Math.min(1, pw - 1) * (0.5 + 0.5 * Math.sin(G.t * 9)) : 1;
  const c = col(w.def.sab ? w.def.color : LASER.col), base = Math.max(2.4, (w.s.width || 10) * 0.42) * (wk || 1);
  ctx.save(); ctx.lineCap = 'round';
  for (const s of segs) {
    const x1 = sx(s.x1), y1 = sy(s.y1), x2 = sx(s.x2), y2 = sy(s.y2), wd = base * Math.max(0.4, Math.sqrt(Math.min(1, s.k))) * S;
    const line = (lw, a, st) => { // (a beam into open water fades over its last stretch instead of stopping dead)
      ctx.lineWidth = lw; ctx.globalAlpha = Math.min(1, a);
      if (!s.end) { ctx.strokeStyle = st; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return; }
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, u = Math.max(0, 1 - (s.fadeL || 0) * S / len), fx = x1 + (x2 - x1) * u, fy = y1 + (y2 - y1) * u;
      ctx.strokeStyle = st; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(fx, fy); ctx.stroke();
      const g = ctx.createLinearGradient(fx, fy, x2, y2); g.addColorStop(0, st); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const br = Math.pow(Math.min(1, s.k), 0.7) * (s.fadeK == null ? 1 : s.fadeK); // (brightness falls with the power each bounce keeps)
    line(wd * 5 * pulse, 0.16 * glow * pulse * br, c);  // (the glow)
    line(wd * 1.6, 0.55 * glow * br, c);               // (the beam)
    line(Math.max(1, wd * 0.45), 0.95 * Math.max(0.2, br), '#fff4f0'); // (the white-hot core)
    if (s.hit) { // where it lands
      const r = wd * 1.8 * pulse;
      ctx.globalAlpha = Math.min(1, 0.35 * glow * pulse * br); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x2, y2, r * 1.6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.9 * Math.max(0.2, br); ctx.fillStyle = '#fff4f0'; ctx.beginPath(); ctx.arc(x2, y2, Math.max(1.2, r * 0.45), 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}
modDraw = (orig => function () { orig(); lzDraw(); })(modDraw);

// Focused Intensity on the Laser works through the ramp above, not its usual multiplier (modslice.js msDmgMul reads this).
const lzOwnFocus = w => lzIs(w); // (the sword and the mines take Focus's Delivery form instead: modwide.js mwFocusStep)

// The old orbiting bodies (modifiers.js modOrbit) are not the Laser's: its orbit is the traced ring above, fired by v10Fire.
modOrbit = (orig => function (w, dt) { if (!lzIs(w)) orig(w, dt); })(modOrbit);
modFire = (orig => function (w, target, src) { if (lzIs(w) && modHas(w, 'orbiting')) return false; return orig(w, target, src); })(modFire);

// Growing is not offered on the Laser (user, 23 Oct).
modOk = (orig => function (w, id) { return !(id === 'growing' && lzIs(w)) && orig(w, id); })(modOk);

// ================================================================ the Laser's own versions (user, 23 Oct)
// EMPOWERED ATTACK: every few seconds (4 / 3 / 3, 2.5 at mastery) the beam pulses wide and bright for 0.5 s, dealing x2.5
// (x3.2 from Rank 3). Not every Nth tick. Replaces modifiers.js modAtk's count for the Laser.
const lzPulseOn = w => { const r = Math.min(4, modCount(w, 'nth')); if (!r) return false; const per = [4, 3, 3, 2.5][r - 1]; return ((G.t - (w.lzNthS || 0)) % per) < 0.5; };
modAtk = (orig => function (w, src) {
  if (!lzIs(w)) return orig(w, src);
  if (w.lzNthS == null) w.lzNthS = G.t;
  w.m10emp = lzPulseOn(w); modAgain(w, src);
})(modAtk);
// RAISE ALLIES is not offered on the Laser.
modOk = (orig => function (w, id) { return !(id === 'turncoat' && lzIs(w)) && orig(w, id); })(modOk);

// Short-lived Laser lines (Can't Pick One forks): drawn the Laser's way for 0.25 s.
function lzFx(w, x1, y1, x2, y2, k) { (w.lzFxs || (w.lzFxs = [])).push({ x1, y1, x2, y2, k, hit: true, t: G.t }); }
const lzS = () => G.lzS || (G.lzS = { orb: [], mines: [] });
function lzExtrasDraw(w) {
  if (w.lzFxs && w.lzFxs.length) { w.lzFxs = w.lzFxs.filter(f => G.t - f.t < 0.25); for (const f of w.lzFxs) f.fadeK = 1 - (G.t - f.t) / 0.25; lzDrawSegs(w, w.lzFxs, 1, 0.6, 1); }
  const S2 = lzS(), c = col(w.def.sab ? w.def.color : LASER.col);
  for (const o of S2.orb) { // strike from above: a marker, then a beam from the sky
    if (o.w !== w) continue;
    const x = sx(o.x), y = sy(o.y);
    if (G.t < o.t0) { ctx.save(); ctx.globalAlpha = 0.7; ctx.strokeStyle = c; ctx.lineWidth = 2 * S; ctx.setLineDash([4 * S, 3 * S]); ctx.beginPath(); ctx.arc(x, y, (16 + 8 * (o.t0 - G.t) / o.mark) * S, 0, TAU); ctx.stroke(); ctx.restore(); continue; }
    lzDrawSegs(w, [{ x1: o.x, y1: o.y - 520, x2: o.x, y2: o.y, k: 1, hit: true }], LZ.peak, 2.2, 1.3);
  }
  for (const m of S2.mines) { // laser mines: a red dot, then spinning beams
    if (m.w !== w) continue;
    if (m.firing) lzDrawSegs(w, m.segs || [], LZ.peak, m.blast ? 2.6 : 1.4, m.blast ? 1.6 : 1.2);
    else { const x = sx(m.x), y = sy(m.y), bl = 0.6 + 0.4 * Math.sin(G.t * 6 + m.x); ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, 5 * S, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.25 * bl; ctx.beginPath(); ctx.arc(x, y, 60 * S, 0, TAU); ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = bl; ctx.fillStyle = '#fff4f0'; ctx.beginPath(); ctx.arc(x, y, 2 * S, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  if (w.lzSword && G.t - w.lzSword.t < 0.22) { // the laser sword's swing
    const sw = w.lzSword, u = (G.t - sw.t) / 0.22, p = G.player, a = sw.a0 + (sw.a1 - sw.a0) * Math.min(1, u * 1.2);
    const tr = []; for (let i = 0; i <= 5; i++) { const aa = a - (sw.a1 - sw.a0) * i * 0.04; tr.push({ x1: p.x, y1: p.y, x2: p.x + Math.cos(aa) * sw.L, y2: p.y + Math.sin(aa) * sw.L, k: 1 - i * 0.17, hit: false }); }
    lzDrawSegs(w, tr, LZ.peak, sw.blast ? 2.6 : 1.2, sw.blast ? 1.6 : 1.1);
  }
}

// STRIKE FROM ABOVE: an orbital laser, one strike at a time (0.3 s apart). It marks the target (0.4 s, 0.2 with Precision Strike), then a beam from
// above holds on the target, following it, for 1 s (1.5 s from Orbital Strike Rank 3, 2.5 s with Siege), hitting it and
// what crowds it (within 30, 40 with Orbital Strike). Orbital Strike: +30% damage. Precision Strike Rank 3: a second
// strike on the second-toughest enemy; Volley: up to 4 targets at 60%. Each strike adds 15% heat.
function lzOrbital(w, target) {
  if (G.t < (w.lzOrbT || 0)) return;
  const p = G.player, m = msMa(w, 'dfa'), mark = msB(w, 'dfa', 2) ? 0.2 : 0.4, dur = m === 'A2' ? 2.5 : msA(w, 'dfa', 3) ? 1.5 : 1;
  w.lzOrbT = G.t + mark + dur + 0.3; // (one strike at a time, with a short gap)
  let tg = [target];
  if (m === 'B1') tg = acquireMany('strongest', w.s.range || 400, p.x, p.y, 4);
  else if (msB(w, 'dfa', 3)) { const t2 = acquireMany('strongest', w.s.range || 400, p.x, p.y, 2).find(e => e !== target); if (t2) tg.push(t2); }
  for (const e of tg) lzS().orb.push({ w, e, x: e.x, y: e.y, t0: G.t + mark, mark, end: G.t + mark + dur, next: 0, k: (m === 'B1' ? 0.6 : 1) * (msA(w, 'dfa', 2) ? 1.3 : 1) });
  w.lzHeat = Math.min(1, (w.lzHeat || 0) + 0.15);
}
// LASER SWORD (Melee): a 90-long blade (110 from Rank 2) swung through 150 degrees in front of you every 0.6 s, hitting
// each enemy in the arc once a swing for 0.6 s of beam damage. Brawler: every 3rd swing is a full circle;
// Hit and Run: you dart up to 120 at the target first. Each swing adds 6% heat. A blast swing (Charge-Up, lzDelFire)
// packs lzBlast's share into each hit and adds lzBlast's heat; Area and Long Range lengthen the blade; Piercing thrusts
// past it (modwide.js mwThrust); Rapid Fire swings sooner.
const lzAreaK = w => (typeof areaK === 'function' ? areaK(w) : 1); // (Area: areamod.js, loaded later)
const lzRapK = w => [1, 0.8, 0.65, 0.5, 0.4][Math.min(4, msR(w, 'rapid'))]; // (Rapid Fire on the sword and the mines: shorter gaps)
const lzBlastK = w => (LZ.heatT / Math.max(0.05, w.s.cd || 0.2)) * LZ.peak * LZ_BLAST.share[lzCR(w) - 1]; // (lzBlast's packed damage)
const lzDelSrc = (w, src, gap) => { const o = Object.assign({}, src, { lzDel: true, mwDel: true }); modAtk(w, o); mwFocusStep(w, gap); return o; }; // (Empowered Attack, Stat Scaling and Focus count each swing or mine)
function lzSwordSwing(w, target, src, blast) {
  if (!blast) { if (G.t < (w.lzSwT || 0)) return; w.lzSwT = G.t + 0.6 * lzRapK(w); }
  src = lzDelSrc(w, src, blast ? lzCharge(w) : 0.6 * lzRapK(w));
  const p = G.player, r = mwR(w, 'melee'), L = (r >= 2 ? 110 : 90) * lzAreaK(w) * (1 + 0.2 * mwR(w, 'range')); // (Long Range: a longer blade)
  let a = Math.atan2(target.y - p.y, target.x - p.x);
  if (msB(w, 'melee', 2)) { const d = Math.min(120, Math.max(0, Math.hypot(target.x - p.x, target.y - p.y) - (target.r || 10) - 20)); p.x += Math.cos(a) * d; p.y += Math.sin(a) * d; if (r >= 3) p.iframes = Math.max(p.iframes || 0, 0.25); }
  w.lzSwN = (w.lzSwN || 0) + 1;
  const full = msA(w, 'melee', 2) && w.lzSwN % 3 === 0, half = full ? Math.PI : Math.PI * 150 / 360;
  const dir = w.lzSwN % 2 ? 1 : -1, msrc = Object.assign({}, src, { atk: 'contact' }, blast ? { lzBlast: true } : null), k = blast ? lzBlastK(w) : 0.6 / Math.max(0.05, w.s.cd || 0.1); // (0.6 s of beam, before its ramp)
  for (const e of G.enemies) {
    if (e.dead || e.charmed) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y); if (d > L + e.r) continue;
    if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), a)) > half) continue;
    damageEnemy(e, w.s.dmg * k, msrc);
  }
  mwThrust(w, a, L, w.s.dmg * k, msrc); // (Piercing: a thrust past the blade)
  w.lzSword = { t: G.t, a0: a - dir * half, a1: a + dir * half, L, blast };
  w.lzHeat = Math.min(1, (w.lzHeat || 0) + (blast ? LZ_BLAST.heat : 0.06));
  if (blast) lzBlastHeat(w);
}
function lzBlastHeat(w) { // (as lzBlast: a full burn bar overheats it, and the blast shakes the camera)
  if (w.lzHeat >= 1) { w.lzOver = true; ring(G.player.x, G.player.y, 26, LASER.col, 0.35, 3); }
  cam.shake = Math.min(10, (cam.shake || 0) + 2 + lzCR(w));
}
// LASER MINES (Mines): a mine every 1.5 s where you are (3 on the floor, 5 with either branch). When an enemy comes within
// 60 it spins out beams (1, plus one for each Extra Shots beam) that turn round it for 1.2 s and then it is spent. The beams
// never aim: they sweep, under the beam's rules (bounce, pierce), each hit worth more than a held beam (x2.5 at full
// strength). Smart Mines creep towards enemies. Each mine adds 10% heat. A blast mine (Charge-Up, lzDelFire) is laid
// after the charge with lzBlast's heat; set off, it fires one starburst of 8 beams (8 more per Extra Shots beam) at half
// lzBlast's share each, then it is spent. The mine keeps the hit it was laid with (Empowered Attack); Area widens the trigger.
function lzMineLay(w, src, blast) {
  if (!blast) { if (G.t < (w.lzMnT || 0)) return; w.lzMnT = G.t + 1.5 * lzRapK(w); }
  const p = G.player, M = lzS().mines, cap = msA(w, 'mines', 2) || msB(w, 'mines', 2) ? 5 : 3, mine = M.filter(m => m.w === w && !m.firing);
  if (mine.length >= cap) M.splice(M.indexOf(mine[0]), 1);
  M.push({ w, x: p.x, y: p.y, armed: G.t + 0.5, life: G.t + 20, firing: false, src: lzDelSrc(w, src || weaponSrc(w), blast ? lzCharge(w) : 1.5 * lzRapK(w)), blast: blast ? lzBlastK(w) : 0 });
  w.lzHeat = Math.min(1, (w.lzHeat || 0) + (blast ? LZ_BLAST.heat : 0.1));
  if (blast) lzBlastHeat(w);
}
function lzExtrasTick(dt) {
  const S2 = lzS();
  for (const o of S2.orb) {
    if (!G.weapons.includes(o.w)) { o.end = 0; continue; }
    if (o.e && !o.e.dead) { o.x = o.e.x; o.y = o.e.y; } // (it follows its target)
    if (G.t < o.t0 || G.t >= o.end || G.t < o.next) continue;
    o.next = G.t + 0.1;
    const R = msA(o.w, 'dfa', 2) ? 40 : 30, src = weaponSrc(o.w);
    for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - o.x, e.y - o.y) < R + e.r) damageEnemy(e, o.w.s.dmg * LZ.peak * 0.4 * o.k, src);
  }
  S2.orb = S2.orb.filter(o => G.t < o.end);
  for (const m of S2.mines) {
    if (!G.weapons.includes(m.w) || G.t > m.life) { m.gone = true; continue; }
    const w = m.w;
    if (!m.firing) {
      if (msB(w, 'mines', 2)) { const o = msNear(m.x, m.y, 250); if (o) { const d = Math.hypot(o.x - m.x, o.y - m.y) || 1; m.x += (o.x - m.x) / d * 30 * dt; m.y += (o.y - m.y) / d * 30 * dt; } }
      if (G.t >= m.armed && msNear(m.x, m.y, 60 * lzAreaK(w))) { m.firing = true; m.t0 = G.t; m.end = G.t + (m.blast ? LZ_BLAST.show : 1.2); m.next = 0; m.a = Math.random() * TAU; }
      continue;
    }
    if (G.t >= m.end) { m.gone = true; continue; }
    const nx = 1 + (msR(w, 'extra') ? msBeams(w).reduce((a, b) => a + b, 0) : 0);
    if (m.blast) { // the starburst: one hit, then its picture holds for LZ_BLAST.show
      if (!m.segs) { m.segs = []; const n = 8 * nx, src = Object.assign({}, m.src, { lzBlast: true });
        for (let i = 0; i < n; i++) { const st = { segs: 0, walls: 0, ramp: m.blast * 0.5, first: null, bub: null, out: [], dry: false, delta: 0.6, noHome: true };
          LZC.pad = 0; lzTrace(w, m.x, m.y, m.a + i / n * TAU, w.s.range * 0.8, 1, src, null, st, lzN(msR(w, 'piercing')), lzN(msR(w, 'ricochet'))); m.segs.push(...st.out); } }
      continue;
    }
    const n = nx, spin = m.a + (G.t - m.t0) * 5, hitNow = G.t >= m.next;
    if (hitNow) m.next = G.t + 0.1;
    const segs = [], src = hitNow ? Object.assign({}, m.src || weaponSrc(w)) : null;
    for (let i = 0; i < n; i++) {
      const st = { segs: 0, walls: 0, ramp: LZ.peak * 2.5, first: null, bub: null, out: [], dry: !hitNow, delta: 0.6, noHome: true };
      LZC.pad = 0; lzTrace(w, m.x, m.y, spin + i / n * TAU, w.s.range * 0.8, 1 / Math.sqrt(n), src, null, st, lzN(msR(w, 'piercing')), lzN(msR(w, 'ricochet')));
      segs.push(...st.out);
    }
    m.segs = segs;
  }
  S2.mines = S2.mines.filter(m => !m.gone);
}
wupTick = (orig => function (dt) { orig(dt); if (G && G.state === 'play') lzExtrasTick(dt); })(wupTick);
// Melee and Mines replace how the Laser fires (ahead of modwide.js's general versions); Strike from Above adds orbital strikes.
wupFire = (orig => function (w, t, src) {
  if (lzIs(w) && w.m10 && mwR(w, 'dfa') && t && !w.lzOver) { // Strike from Above is an extra (user, 23 Oct): an orbital strike every so often while the beam fires
    if (w.lzDfaT == null) w.lzDfaT = G.t + 1 / MW_DFA_RATE[Math.min(4, mwR(w, 'dfa')) - 1];
    if (G.t >= w.lzDfaT) { lzOrbital(w, t); w.lzDfaT = G.t - Math.log(1 - Math.random() * 0.95) / MW_DFA_RATE[Math.min(4, mwR(w, 'dfa')) - 1]; }
  }
  if (lzIs(w) && w.m10 && (mwR(w, 'melee') || mwR(w, 'mines'))) { lzDelFire(w, t, src); return true; }
  return orig(w, t, src);
})(wupFire);
// The sword and the mines with Charge-Up: the Laser charges as it does for its beam (lzCharge: the glow at the head,
// Rapid Fire shortens it), then swings or lays one blast (lzBlastK, lzBlast's heat) instead of the plain swing or mine.
function lzDelFire(w, t, src) {
  if (w.lzOver) return;
  const melee = mwR(w, 'melee') && t;
  if (!melee && !mwR(w, 'mines')) return;
  if (lzCR(w)) {
    if (!w.lzChgS || G.t - (w.lzChgLast || -9) > 0.4) w.lzChgS = G.t;
    w.lzChgLast = G.t; if (t) w.lzTgt = t;
    if (G.t - w.lzChgS < lzCharge(w)) return;
    w.lzChgS = 0; w.lzChgLast = -9; w.lzFireT = -9;
  }
  if (melee) lzSwordSwing(w, t, src, !!lzCR(w)); else lzMineLay(w, src, !!lzCR(w));
}
// The Laser's heat also cools while it swings, lays mines or calls strikes (they add their own heat above).

// RAPID FIRE's branches on the Laser (user, 23 Oct): A, Cooler: the burn bar fills 20% slower (35% from Rank 3); masteries
// Heat Sink (cools twice as fast) or Vent (overheating sets off a blast round you). B, Quicker: the charge-up shortens a
// further 20% (35%); masteries Instant (no charge-up) or Strong Start (double damage for the beam's first 0.5 s).
const LZ_RAPID = {
  A: ['Cooler', 'The Laser heats up 20% slower. Rank 3: 35% slower.'], B: ['Quicker', 'The charge-up is 20% shorter again. Rank 3: 35% shorter.'],
  A1: ['Heat Sink', 'The Laser cools down twice as fast.'], A2: ['Vent', 'When the Laser overheats it sets off a blast around you.'],
  B1: ['Instant', 'No charge-up: the Laser fires at once.'], B2: ['Strong Start', 'The beam deals double damage for its first half second.'],
};
forkCards = (orig => function (req) {
  const cs = orig(req);
  if (!(req.ms && req.ms.id === 'rapid' && lzIs(req.ms.w))) return cs;
  for (const c of cs) { const k = (c.desc || '').split('_').pop(); const L = LZ_RAPID[k]; if (L) { c.title = L[0]; c.desc = L[1]; } }
  return cs;
})(forkCards);
modCard = (orig => function (w, id) {
  const c = orig(w, id);
  if (!lzIs(w)) return c;
  const r = modCount(w, id);
  if (id === 'rapid') c.desc = r === 0 ? 'Shortens the Laser\'s charge-up.' : r === 1 ? 'Shorter charge-up. Choose a branch.' : r === 2 ? (msBr(w, 'rapid') === 'A' ? 'Heats up slower still.' : 'Shorter charge-up still.') : c.desc;
  if (id === 'charged') c.desc = r === 0 ? 'The Laser charges longer, then fires one big blast instead of a held beam.' : r < 3 ? 'Longer charge, bigger blast.' : c.desc;
  return c;
})(modCard);
