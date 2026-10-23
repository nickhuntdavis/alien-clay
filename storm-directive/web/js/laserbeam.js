'use strict';
// Spawn Prawn - the Laser fires like a laser (user, 23 Oct). Replaces v10.js v10Fire for the Laser only (laser.js LASER).
//  - RAY: the beam leaves you and stops at the first enemy it meets (it doesn't pierce by default). Its aim swings
//    towards the target at a turn rate (LZ.turn), so it meets enemies off-centre and reflects at real angles; a new
//    target more than 50 degrees away switches it off and back on aimed there instead. A beam that runs into open
//    water is seen 3 times as far (to the first thing in the way, hurting nothing there) and fades out.
//  - BOUNCE (the renamed Ricochet modifier): at each enemy the beam reflects off the enemy's surface at the true angle
//    (a hit within 12 degrees of head-on doesn't bounce)
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

const LZ = { headOn: Math.cos(12 * Math.PI / 180), bounceL: 0.75, fade: 0.7, reachK: 3, sweepMax: 50 * Math.PI / 180, gap: 0.08, start: 0.45, peak: 1.6, time: 2.2, turn: 5, segs: 32, wallMax: 14, keep: 0.5 };
MODS10.ricochet.name = 'Bounce';
if (!MODS10.piercing.atk.includes('beam')) MODS10.piercing.atk.push('beam');

// Red in every form (rings, mines, strikes, links, bursts all read w.def.color): later colour passes set the Fire colour
// on the shared def, so its colour is pinned. A Switched at Birth def (modcards.js sabSwitch) has its own colour.
{ const d = WEAPONS[LASER.id]; if (d) Object.defineProperty(d, 'color', { get: () => LASER.col, set: () => {}, configurable: true, enumerable: true }); }
// A hit within 12 degrees of head-on doesn't bounce (user, 23 Oct: it would only come straight back at you).
const lzGlance = (dx, dy, nx, ny) => -(dx * nx + dy * ny) < LZ.headOn;
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
    if (e.dead || e.charmed || e === skip || (skip && skip.has && skip.has(e))) continue; // (skip: one enemy, or a set of them)
    const fx = e.x - x, fy = e.y - y, tc = fx * dx + fy * dy; if (tc < -e.r) continue;
    const h2 = fx * fx + fy * fy - tc * tc, r = e.r || 10; if (h2 > r * r) continue;
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
    const nx = (cx - m.ob.x) / m.ob.r, ny = (cy - m.ob.y) / m.ob.r, dot = dx * nx + dy * ny;
    if (bounce <= 0 || !lzGlance(dx, dy, nx, ny)) return; // (head-on: it stops)
    lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), Math.max(L - m.t, w.s.range * LZ.bounceL), k * 0.9, src, null, st, pierce, bounce - 1);
    return;
  }
  const e = m.e; if (!e) return;
  if (!st.first) st.first = e;
  if (!st.dry) damageEnemy(e, w.s.dmg * k * st.ramp, src);
  const rest = L - m.t, both = pierce > 0 && bounce > 0;
  if (pierce > 0) { // carry straight on through it
    const ox = e.x - cx, oy = e.y - cy, through = 2 * (ox * dx + oy * dy); // (out the far side of the circle)
    lzTrace(w, cx + dx * through, cy + dy * through, a, rest - through, k * (both ? 0.5 : 0.85), src, e, st, pierce - 1, both ? bounce : 0);
  }
  if (bounce > 0) { // reflect off its surface at the true angle (not when head-on)
    const nx = (cx - e.x) / (e.r || 10), ny = (cy - e.y) / (e.r || 10), dot = dx * nx + dy * ny;
    if (lzGlance(dx, dy, nx, ny)) lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), Math.max(rest, w.s.range * LZ.bounceL), k * (both ? 0.5 : 0.8), src, e, st, both ? pierce : 0, bounce - 1);
  }
}
// One beam along angle a from you.
function lzShot(w, a, src, k, ramp, dry) {
  const p = G.player, pr = msR(w, 'piercing'), br = msR(w, 'ricochet');
  const st = { segs: 0, walls: 0, ramp, first: null, bub: null, out: [], dry };
  if (typeof mr === 'function' && mr('sp_iric') && typeof pdefBubbleR === 'function') { const R = pdefBubbleR(); if (R > 0) st.bub = { x: p.x, y: p.y, r: R }; }
  lzTrace(w, p.x, p.y, a, st.bub ? 1e4 : w.s.range, k, src, null, st, lzN(pr), lzN(br));
  return st;
}
// Every beam the Laser holds right now: [angle, power] (main, Extra Shots' front and rear beams, Disco Ball).
function lzBeams(w) {
  const p = G.player, out = [[w.lzA, 1]];
  for (const e of w.lzXT || []) if (!e.dead) out.push([Math.atan2(e.y - p.y, e.x - p.x), 1]);
  if (msMa(w, 'extra') === 'A1') for (let i = 0; i < 6; i++) out.push([G.t * 1.5 + i / 6 * TAU, 0.5]);
  return out;
}

// ORBITING: the beam leaves you, then runs round a circle (radius 72, 100 from Rank 2; a second, inner ring turning the
// other way at mastery), traced as short straight sections with the beam's own rules: an enemy in the way breaks the
// ring there (Piercing carries it on past, weaker, spending a charge in each section that meets the enemy), Bounce reflects it off the enemy or an obstacle and it carries on
// as a straight beam, and Internal Ricochet's bubble still holds it.
const lzRings = w => { const r = msR(w, 'orbiting'), R = r >= 2 ? 100 : 72; return modCount(w, 'orbiting') >= 4 ? [[R, 1], [R * 0.6, -1]] : [[R, 1]]; };
function lzOrbit(w, src, ramp, dry) {
  const p = G.player, out = [], N = 48;
  let first = null;
  for (const [R, dir] of lzRings(w)) {
    const st = { segs: 0, walls: 0, ramp, first: null, bub: null, out, dry };
    let pierce = lzN(msR(w, 'piercing')), bounce = lzN(msR(w, 'ricochet')), k = 1;
    const a0 = G.t * 1.6 * dir;
    out.push({ x1: p.x, y1: p.y, x2: p.x + Math.cos(a0) * R, y2: p.y + Math.sin(a0) * R, k: 0.6, hit: false }); // (out to the ring)
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
        const o = m.e || m.ob, nx = (cx - o.x) / (o.r || 10), ny = (cy - o.y) / (o.r || 10), dx = Math.cos(a), dy = Math.sin(a), dot = dx * nx + dy * ny;
        if (lzGlance(dx, dy, nx, ny)) lzTrace(w, cx, cy, Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx), w.s.range * LZ.bounceL, k * (both ? 0.5 : 0.8), src, m.e, st, both ? pierce : 0, bounce - 1);
      }
      if (pierce > 0 && m.e) { // on round the ring, past it (the rest of this section too)
        pierce--; k *= both ? 0.5 : 0.85; passed.add(m.e);
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
  for (const [a, k] of lzBeams(w)) { const st = lzShot(w, a, src, k, ramp, false); w.lzShotSegs.push(...st.out); if (k === 1 && a === w.lzA && st.first) w.lzOn = st.first; }
  w.lzSegs = w.lzShotSegs;
  return true;
})(v10Fire);

// ---------------------------------------------------------------- the held beam (user, 23 Oct: a smooth line like a real laser)
// The beam stays on between damage ticks: each frame its aim sweeps towards the target (LZ.turn) and it is traced again
// (no damage) for the picture. It goes out when the weapon stops firing. Overheat (Rapid Fire) blinks it off.
const lzOnNow = w => G.t - (w.lzFireT || -9) < Math.max(0.3, (w.s.cd || 0.2) + 0.15);
function lzTick(dt) {
  if (!G || G.state !== 'play') return;
  const p = G.player;
  for (const w of G.weapons) {
    if (!w || !lzIs(w) || w.def.v10atk !== 'beam') continue;
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
function lzDraw() {
  if (!G) return;
  for (const w of G.weapons) {
    if (!w || !lzIs(w) || !w.lzSegs || !w.lzSegs.length) continue;
    if (w._ventT > G.t && Math.floor(G.t * 18) % 6) continue; // overheating: blinks off
    if (w.lzOffT > G.t) continue; // (switching to a target too far round to sweep to)
    const pw = w.lzPow || 1, glow = 0.55 + 0.45 * Math.min(1, Math.max(0, (pw - LZ.start) / (1 - LZ.start)));
    const pulse = pw > 1 ? 1 + 0.45 * Math.min(1, pw - 1) * (0.5 + 0.5 * Math.sin(G.t * 9)) : 1;
    const c = col(w.def.sab ? w.def.color : LASER.col), base = Math.max(2.4, (w.s.width || 10) * 0.42);
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
      line(wd * 5 * pulse, 0.16 * glow * pulse, c);  // (the glow)
      line(wd * 1.6, 0.55 * glow, c);               // (the beam)
      line(Math.max(1, wd * 0.45), 0.95, '#fff4f0'); // (the white-hot core)
      if (s.hit) { // where it lands
        const r = wd * 1.8 * pulse;
        ctx.globalAlpha = 0.35 * glow * pulse; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x2, y2, r * 1.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff4f0'; ctx.beginPath(); ctx.arc(x2, y2, Math.max(1.2, r * 0.45), 0, TAU); ctx.fill();
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
