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
//  - Growing is not offered on the Laser.
//  - Bounded: at most LZ.segs beam segments a shot.
// Extra Projectiles (front, rear and Disco Ball beams) fire through the same ray. Hooks: none in shared files. Wraps
// v10.js v10Fire (outermost: loads after modwide.js). Renames modifiers.js MODS10.ricochet to Bounce.

const LZ = { charge: 0.6, heatT: 4, coolT: 2.2, inLine: 1 * Math.PI / 180, bounceL: 0.75, fade: 0.7, reachK: 3, sweepMax: 50 * Math.PI / 180, gap: 0.08, start: 0.45, peak: 1.6, time: 2.2, turn: 5, segs: 32, wallMax: 14, keep: 0.5 };
MODS10.ricochet.name = 'Bounce';
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
function lzTrace(w, x, y, a, L, k, src, skip, st, pierce, bounce) {
  if (st.segs >= LZ.segs || k < 0.04 || L < 4) return;
  st.segs++;
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
// Every beam the Laser holds right now: [angle, power] (main, Extra Shots' front and rear beams, Disco Ball).
function lzBeams(w) {
  const p = G.player, out = [[w.lzA + lzSweep(w), 1]];
  for (const e of w.lzXT || []) if (!e.dead) out.push([Math.atan2(e.y - p.y, e.x - p.x), 1]);
  if (msMa(w, 'extra') === 'A1') for (let i = 0; i < 6; i++) out.push([G.t * 1.5 + i / 6 * TAU, 0.5]);
  return out;
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
    const o = lzOrbit(w, src, ramp, false); w.lzShotSegs = w.lzSegs = o.out; w.lzXT = []; return true;
  }
  // The ramp follows whatever the main beam is actually on
  const probe = lzMeet(p.x, p.y, w.lzA, w.s.range, null, null).e || null;
  const ramp = lzRamp(w, probe); w.lzPow = ramp;
  // Extra Shots: more beams at other targets (front 180 degrees, then rear)
  w.lzXT = [];
  if (msR(w, 'extra')) {
    const [f, b] = msBeams(w), front = [], rear = [], L = w.s.range;
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e === target || Math.hypot(e.x - p.x, e.y - p.y) > L) continue;
      const da = Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), want));
      (da <= Math.PI / 2 ? front : rear).push(e);
    }
    const byD = (u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y);
    w.lzXT = [...front.sort(byD).slice(0, f), ...rear.sort(byD).slice(0, b)];
  }
  w.lzShotSegs = [];
  lzBeams(w).forEach(([a, k], i) => { const st = lzShot(w, a, src, k, ramp, false); w.lzShotSegs.push(...st.out); if (i === 0 && st.first) w.lzOn = st.first; });
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
  const on = lzOnNow(w) && !w.lzOver, cool = dt / LZ.coolT * ((G.P && G.P.reloadSpd) || 1);
  w.lzHeat = Math.max(0, Math.min(1, (w.lzHeat || 0) + (on ? dt / LZ.heatT : -cool)));
  if (on && w.lzHeat >= 1) { w.lzOver = true; w.lzFireT = -9; w.lzSegs = null; w.lzChgS = 0; const p = G.player; ring(p.x, p.y, 26, LASER.col, 0.35, 3); }
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
    const segs = [];
    for (const [a, k] of lzBeams(w)) segs.push(...lzShot(w, a, null, k, w.lzPow || 1, true).out);
    w.lzSegs = segs;
  }
}
wupTick = (orig => function (dt) { orig(dt); lzTick(dt); })(wupTick);
// Drawn like a laser: a white-hot core in a coloured beam with a soft glow, a bright spot where it lands. More power
// glows more, in slow pulses once it is past full strength.
// Rapid Fire on the Laser: a shorter charge-up (70 / 50 / 35% of LZ.charge, 20% at mastery), nothing else.
const lzCharge = w => LZ.charge * [1, 0.7, 0.5, 0.35, 0.2][Math.min(4, msR(w, 'rapid'))];
const lzCharging = w => !!(w.lzChgS && G.t - (w.lzChgLast || -9) < 0.4 && !lzOnNow(w));
function lzChargeDraw(w) { // a small glow at the head that grows until the beam comes on
  const p = G.player, hd = lzHead(), u = Math.min(1, (G.t - w.lzChgS) / lzCharge(w)), hx = p.x + Math.cos(hd) * 11, hy = p.y + Math.sin(hd) * 11;
  const c = col(w.def.sab ? w.def.color : LASER.col), x = sx(hx), y = sy(hy), r = (2 + 7 * u) * S, fl = 0.85 + 0.15 * Math.sin(G.t * 40);
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
function lzDraw() {
  if (!G) return;
  for (const w of G.weapons) if (w && lzIs(w) && lzCharging(w)) lzChargeDraw(w);
  for (const w of G.weapons) if (w && lzIs(w) && (w.lzHeat > 0.01 || w.lzOver)) lzHeatDraw(w);
  for (const w of G.weapons) {
    if (!w || !lzIs(w) || !w.lzSegs || !w.lzSegs.length) continue;
    if (w._ventT > G.t && Math.floor(G.t * 18) % 6) continue; // overheating: blinks off
    if (w.lzOffT > G.t) continue; // (switching to a target too far round to sweep to)
    const pw = w.lzPow || 1, glow = 0.55 + 0.45 * Math.min(1, Math.max(0, (pw - LZ.start) / (1 - LZ.start)));
    const pulse = pw > 1 ? 1 + 0.45 * Math.min(1, pw - 1) * (0.5 + 0.5 * Math.sin(G.t * 9)) : 1;
    const c = col(w.def.sab ? w.def.color : LASER.col), base = Math.max(2.4, (w.s.width || 10) * 0.42) * lzGrow(w);
    ctx.save(); ctx.lineCap = 'round';
    for (const s of w.lzSegs) {
      const x1 = sx(s.x1), y1 = sy(s.y1), x2 = sx(s.x2), y2 = sy(s.y2), wd = base * Math.max(0.4, Math.sqrt(Math.min(1, s.k))) * S;
      const line = (lw, a, st) => { // (a beam into open water fades over its last stretch instead of stopping dead)
        ctx.lineWidth = lw; ctx.globalAlpha = a;
        if (!s.end) { ctx.strokeStyle = st; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return; }
        const len = Math.hypot(x2 - x1, y2 - y1) || 1, u = Math.max(0, 1 - (s.fadeL || 0) * S / len), fx = x1 + (x2 - x1) * u, fy = y1 + (y2 - y1) * u;
        ctx.strokeStyle = st; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(fx, fy); ctx.stroke();
        const g = ctx.createLinearGradient(fx, fy, x2, y2); g.addColorStop(0, st); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(x2, y2); ctx.stroke();
      };
      const br = Math.pow(Math.min(1, s.k), 0.7); // (brightness falls with the power each bounce keeps)
      line(wd * 5 * pulse, 0.16 * glow * pulse * br, c);  // (the glow)
      line(wd * 1.6, 0.55 * glow * br, c);               // (the beam)
      line(Math.max(1, wd * 0.45), 0.95 * Math.max(0.2, br), '#fff4f0'); // (the white-hot core)
      if (s.hit) { // where it lands
        const r = wd * 1.8 * pulse;
        ctx.globalAlpha = 0.35 * glow * pulse * br; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x2, y2, r * 1.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.9 * Math.max(0.2, br); ctx.fillStyle = '#fff4f0'; ctx.beginPath(); ctx.arc(x2, y2, Math.max(1.2, r * 0.45), 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }
}
modDraw = (orig => function () { orig(); lzDraw(); })(modDraw);

// Focused Intensity on the Laser works through the ramp above, not its usual multiplier (modslice.js msDmgMul reads this).
const lzOwnFocus = w => lzIs(w);

// The old orbiting bodies (modifiers.js modOrbit) are not the Laser's: its orbit is the traced ring above, fired by v10Fire.
modOrbit = (orig => function (w, dt) { if (!lzIs(w)) orig(w, dt); })(modOrbit);
modFire = (orig => function (w, target, src) { if (lzIs(w) && modHas(w, 'orbiting')) return false; return orig(w, target, src); })(modFire);

// Growing is not offered on the Laser (user, 23 Oct).
modOk = (orig => function (w, id) { return !(id === 'growing' && lzIs(w)) && orig(w, id); })(modOk);
