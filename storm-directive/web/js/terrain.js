'use strict';
// Spawn Prawn - terrain. Obstacles growing in the womb: nodules that shots bounce off, mitochondria that
// soak up shots and release it as an ATP burst, acid crypts that burn whatever touches them, cilia beds
// that shove everything away, currents that carry everything along, and slicks that steal your grip.

const TCELL = 300;
function tKey(cx, cy) { return (cx + 1000) * 10000 + (cy + 1000); }

function makeTerrain() {
  const list = [];
  const ok = (x, y, r) => {
    const d = Math.hypot(x, y);
    if (d < CORE.sanctuary + 200 + r || d > CORE.arena - 120 - r) return false;
    for (const o of list) if (Math.hypot(o.x - x, o.y - y) < o.r + r + 150) return false;
    return true;
  };
  for (const type in OBSTACLES) {
    const def = OBSTACLES[type];
    for (let i = 0; i < def.n; i++) {
      for (let tries = 0; tries < 40; tries++) {
        const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * CORE.arena, r = rand(def.r[0], def.r[1]);
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        if (!ok(x, y, r)) continue;
        list.push({ type, def, x, y, r, a: Math.random() * TAU, charge: 0, flash: 0, seed: Math.random() * 100, burstT: 0 });
        break;
      }
    }
  }
  return { list, grid: terrainGrid(list), regridT: 0 };
}
// Bucket each obstacle into every cell its circle (plus a margin for bodies) touches.
function terrainGrid(list) {
  const grid = new Map();
  for (const o of list) {
    const m = o.r + 60;
    for (let cx = Math.floor((o.x - m) / TCELL); cx <= Math.floor((o.x + m) / TCELL); cx++)
      for (let cy = Math.floor((o.y - m) / TCELL); cy <= Math.floor((o.y + m) / TCELL); cy++) {
        const k = tKey(cx, cy);
        let c = grid.get(k);
        if (!c) { c = []; grid.set(k, c); }
        c.push(o);
      }
  }
  return grid;
}
function tCell(x, y) { return G.terrain ? G.terrain.grid.get(tKey(Math.floor(x / TCELL), Math.floor(y / TCELL))) : null; }

// Move a body out of solid obstacles, sliding around them; returns the obstacle it touched (if any).
function pushOut(o, r, side) {
  const c = tCell(o.x, o.y);
  if (!c) return null;
  let hit = null;
  for (const ob of c) {
    if (!ob.def.solid) continue;
    const dx = o.x - ob.x, dy = o.y - ob.y, d = Math.hypot(dx, dy) || 0.01, min = ob.r + r;
    if (d >= min) continue;
    const nx = dx / d, ny = dy / d;
    o.x = ob.x + nx * min; o.y = ob.y + ny * min;
    // A nudge along the surface so chasers flow round instead of pinning themselves to it.
    if (side) { o.x += -ny * side * 1.5; o.y += nx * side * 1.5; }
    hit = ob;
  }
  return hit;
}

// Zone forces (cilia push, current flow) on a body at (x, y); returns {fx, fy, slick}.
const ZF = { fx: 0, fy: 0, slick: false, acid: null };
function zoneForce(x, y, r) {
  ZF.fx = 0; ZF.fy = 0; ZF.slick = false; ZF.acid = null;
  const c = tCell(x, y);
  if (!c) return ZF;
  for (const ob of c) {
    const dx = x - ob.x, dy = y - ob.y, d = Math.hypot(dx, dy) || 0.01;
    if (ob.type === 'acid') { if (d < ob.r + r + 3) ZF.acid = ob; continue; }
    if (d > ob.r + r || ob.def.solid) continue;
    if (ob.type === 'cilia') { const k = ob.def.push * (0.4 + 0.6 * (1 - d / (ob.r + r))); ZF.fx += dx / d * k; ZF.fy += dy / d * k; }
    else if (ob.type === 'current') { ZF.fx += Math.cos(ob.a) * ob.def.push; ZF.fy += Math.sin(ob.a) * ob.def.push; }
    else if (ob.type === 'slick') ZF.slick = true;
  }
  return ZF;
}

function terrainPlayer(p, dt) {
  const z = zoneForce(p.x, p.y, p.r);
  p.x += z.fx * dt; p.y += z.fy * dt;
  p.slick = z.slick;
  if (z.acid && G.state === 'play') hurtPlayer(z.acid.def.dps * dmgNow(), 'Acid Crypt');
  const hit = pushOut(p, p.r, 0);
  if (hit) {
    // Lose the velocity that points into the surface (you slide along it instead).
    const nx = p.x - hit.x, ny = p.y - hit.y, d = Math.hypot(nx, ny) || 1, vn = (p.vx * nx + p.vy * ny) / d;
    if (vn < 0) { p.vx -= vn * nx / d; p.vy -= vn * ny / d; }
  }
  if (p.atpT > 0) p.atpT -= dt;
}

function terrainBody(e, dt) {
  const z = zoneForce(e.x, e.y, e.r);
  if (!e.boss) { e.x += z.fx * dt * 0.8; e.y += z.fy * dt * 0.8; }
  if (z.acid && !e.egg && !(e.acidT > G.t)) {
    e.acidT = G.t + 0.5;
    damageEnemy(e, e.maxHp * 0.08 + 4, { dot: true, noCrit: true, noStatus: true, noArc: true, elem: 'poison', wname: 'Acid Crypt' });
  }
  pushOut(e, e.r, e.side || 1);
}

// Projectiles and enemy bullets meeting terrain. Returns true if the shot is gone.
function terrainShot(s, hostile, dt) {
  const c = tCell(s.x, s.y);
  if (!c) return false;
  for (const ob of c) {
    const dx = s.x - ob.x, dy = s.y - ob.y, d = Math.hypot(dx, dy) || 0.01;
    if (d > ob.r + (s.r || 4)) continue;
    const nx = dx / d, ny = dy / d;
    switch (ob.def.shot) {
      case 'bounce': {
        const vn = s.vx * nx + s.vy * ny;
        if (vn < 0) { s.vx -= 2 * vn * nx; s.vy -= 2 * vn * ny; ob.flash = 0.12; if (!hostile) s.hits = null; }
        s.x = ob.x + nx * (ob.r + (s.r || 4) + 1); s.y = ob.y + ny * (ob.r + (s.r || 4) + 1);
        if (Math.random() < 0.3) spawnPart(s.x, s.y, '#fff', 1, 60, 0.2, 2);
        return false;
      }
      case 'absorb':
        s.dead = true; ob.charge++; ob.flash = 0.08;
        if (ob.charge >= ob.def.charge) atpBurst(ob);
        return true;
      case 'melt':
        s.dead = true;
        if (Math.random() < 0.4) spawnPart(s.x, s.y, PAL.danger, 2, 50, 0.35, 2.5);
        return true;
      case 'repel': {
        // Bend the shot away from the bed's centre, keeping its speed.
        const sp = Math.hypot(s.vx, s.vy) || 1, k = 5 * dt;
        s.vx += nx * sp * k; s.vy += ny * sp * k;
        const ns = Math.hypot(s.vx, s.vy) || 1; s.vx *= sp / ns; s.vy *= sp / ns;
        return false;
      }
      case 'drift':
        s.x += Math.cos(ob.a) * ob.def.push * dt * 0.8; s.y += Math.sin(ob.a) * ob.def.push * dt * 0.8;
        return false;
    }
  }
  return false;
}

// A full mitochondrion vents its stored energy: monsters nearby get hit hard, hostile bullets are wiped,
// and if you're close you get a speed and fire-rate kick.
function atpBurst(ob) {
  ob.charge = 0; ob.burstT = 0.6;
  // Scales with the clock and your level, never with your own damage (that fed back on itself: every burst
  // raised the next one, into the billions).
  const R = ob.def.burstR, dmg = 80 * hpNow() * (1 + 0.04 * G.level);
  ring(ob.x, ob.y, R, PAL.reward, 0.5, 6);
  addLight(ob.x, ob.y, R * 1.3, PAL.reward, 0.6);
  spawnPart(ob.x, ob.y, '#ffd23f', 24, 260, 0.6, 4);
  forNear(ob.x, ob.y, R, e => { if (!e.egg && !e.charmed) damageEnemy(e, dmg, { elem: 'fire', noCrit: true, wname: 'ATP Burst' }); });
  for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - ob.x, b.y - ob.y) < R) b.dead = true;
  const p = me();
  if (Math.hypot(p.x - ob.x, p.y - ob.y) < R + 60) {
    p.atpT = 4; G.rage = Math.max(G.rage, 4);
    floatText(p.x, p.y - 30, 'ATP RUSH!', PAL.reward, 16, 1.2);
  }
  if (!G.atpSeen) { G.atpSeen = true; sysMsg('SYSTEM MESSAGE', 'A mitochondrion just vented everything it absorbed. Stand near the next one when it pops for an ATP rush.', '#ffb347'); }
  cam.shake = Math.min(12, cam.shake + 6);
  sfx('boom');
}

// Autopilot cost of standing at (x, y): solids are walls, acid hurts, slicks are mildly unwelcome.
function terrainDanger(x, y, r) {
  const c = tCell(x, y);
  if (!c) return 0;
  let dn = 0;
  for (const ob of c) {
    const d = Math.hypot(x - ob.x, y - ob.y) - ob.r - r;
    if (ob.type === 'acid' && d < 30) dn += 6 + (30 - d) * 0.1;
    else if (ob.def.solid && d < 6) dn += 3;
    else if (ob.type === 'slick' && d < 0) dn += 0.25;
  }
  return dn;
}

// Autorun's view of the slide: how bad a spot is, and whether heading (dx, dy) through it is a good idea.
// Solid walls are felt from 45 units out (so it steers round them early), acid from further, and the soft
// zones (cilia that shove, slicks that make you slide, currents you'd swim against) cost a little.
function steerTerrain(x, y, r, dx, dy) {
  const c = tCell(x, y);
  if (!c) return 0;
  let dn = 0;
  for (const ob of c) {
    const d = Math.hypot(x - ob.x, y - ob.y) - ob.r - r;
    if (ob.type === 'acid') { if (d < 50) dn += 3 + (50 - d) * 0.12; }
    else if (ob.def.solid) { if (d < 45) { const k = 1 - Math.max(0, d) / 45; dn += 2.4 * k * k + (d < 4 ? 4 : 0); } }
    else if (d < 0) {
      if (ob.type === 'cilia') dn += 0.7;
      else if (ob.type === 'slick') dn += 0.6;
      else if (ob.type === 'current') dn += 0.5 * Math.max(0, -(Math.cos(ob.a) * dx + Math.sin(ob.a) * dy)); // against the flow
    }
  }
  return dn;
}

// Keep things that need collecting out of the middle of solid obstacles.
function unstick(o, r) { pushOut(o, r || 10, 0); return o; }

// Everything in the womb drifts: solid growths creep (6 to 12 a second), currents, cilia and slicks wander a
// little faster. They wander, keep out of the egg's glow and inside the arena, and steer round each other.
const DRIFT = { solid: [6, 12], soft: [10, 20], gap: 120, regrid: 0.25 };
function updateTerrain(dt) {
  const T = G.terrain;
  if (!T) return;
  const L = T.list;
  for (const ob of L) {
    if (ob.flash > 0) ob.flash -= dt;
    if (ob.burstT > 0) ob.burstT -= dt;
    if (ob.sp == null) { const r = ob.def.solid ? DRIFT.solid : DRIFT.soft; ob.sp = rand(r[0], r[1]); ob.h = Math.random() * TAU; ob.fixed = Math.hypot(ob.x, ob.y) > CORE.arena - 100; }
    if (ob.fixed) continue; // outside the Petri Dish wall: leave it be
    let turn = Math.sin(G.t * 0.13 + ob.seed) * 0.25; // a lazy wander
    // Stay in the band between the egg's glow and the arena wall.
    const d = Math.hypot(ob.x, ob.y) || 1, inner = CORE.sanctuary + 200 + ob.r, outer = CORE.arena - 120 - ob.r;
    if (d < inner || d > outer) turn += angDiff(Math.atan2(ob.y, ob.x) + (d < inner ? 0 : Math.PI), ob.h) * 1.5;
    // Steer away from neighbours.
    for (const o of L) {
      if (o === ob) continue;
      const dx = ob.x - o.x, dy = ob.y - o.y, gap = ob.r + o.r + DRIFT.gap;
      if (Math.abs(dx) > gap || Math.abs(dy) > gap || dx * dx + dy * dy > gap * gap) continue;
      turn += angDiff(Math.atan2(dy, dx), ob.h) * 0.8;
    }
    ob.h += clamp(turn, -0.8, 0.8) * dt;
    ob.x += Math.cos(ob.h) * ob.sp * dt; ob.y += Math.sin(ob.h) * ob.sp * dt;
  }
  T.regridT = (T.regridT || 0) - dt;
  if (T.regridT <= 0) {
    T.regridT = DRIFT.regrid;
    T.grid = terrainGrid(L);
    // Nothing collectable gets buried under a growth that crept over it.
    for (const k of G.pickups) pushOut(k, 14, 0);
    for (const g of G.gems) if (!g.mag) pushOut(g, 6, 0);
  }
}

// ---------------------------------------------------------------- the morning-after pill
// Every so often a pill drops somewhere random in the womb, fizzes for a few seconds, then dissolves into
// an organically shaped cloud that keeps growing until it covers about half the map, holds, and slowly
// dissipates. Inside it you (and the rivals) swim 35% slower and gain half the XP. The shape is a cluster
// of wobbling lobes, so it spreads unevenly like a real dissolving tablet.
const PILL = { firstAt: [240, 420], every: [330, 450], fizz: 3.5, grow: 75, hold: 12, fade: 45, maxR: 0.82 };
function schedulePill(t) { G.nextPill = t + rand(PILL.every[0], PILL.every[1]); }
function dropPill() {
  const a = Math.random() * TAU, d = rand(350, CORE.arena - 450);
  const n = 9, lobes = [];
  for (let k = 0; k < n; k++) lobes.push({ a: k / n * TAU + rand(-0.3, 0.3), d: rand(0.3, 0.55), rk: rand(0.5, 0.7), ph: Math.random() * TAU });
  G.pill = { x: G.core.x + Math.cos(a) * d, y: G.core.y + Math.sin(a) * d, t: 0, lobes, alpha: 1 };
  const p = me(), dir = Math.atan2(G.pill.y - p.y, G.pill.x - p.x), comp = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'][Math.round(((dir + TAU) % TAU) / (TAU / 8)) % 8];
  banner('MORNING-AFTER PILL INCOMING', PAL.danger);
  sysMsg('SYSTEM MESSAGE', `Someone upstairs has taken a morning-after pill. It's landing to the ${comp} of you. When it dissolves, everything inside the cloud swims slower and grows slower. The egg is choosing not to comment.`, PAL.danger, true);
  sfx('boss');
}
function pillR() {
  const q = G.pill; if (!q || q.t < PILL.fizz) return 0;
  const t = q.t - PILL.fizz, max = CORE.arena * PILL.maxR;
  return max * (1 - Math.exp(-t / (PILL.grow / 3)));
}
function updatePill(dt) {
  if (G.nextPill == null) G.nextPill = rand(PILL.firstAt[0], PILL.firstAt[1]);
  if (!G.pill) { if (G.t >= G.nextPill && G.state === 'play') dropPill(); return; }
  const q = G.pill; q.t += dt;
  const end = PILL.fizz + PILL.grow + PILL.hold;
  if (q.t < PILL.fizz && Math.random() < 0.5) spawnPart(q.x + rand(-14, 14), q.y + rand(-14, 14), '#ffffff', 1, 60, 0.5, 2);
  if (q.t > end) q.alpha = Math.max(0, 1 - (q.t - end) / PILL.fade);
  if (q.t > end + PILL.fade) { G.pill = null; schedulePill(G.t); }
}
// Is (x, y) inside the cloud? (It stops counting once it has mostly faded.)
function inPill(x, y) {
  const q = G.pill, R = pillR();
  if (!q || R <= 0 || q.alpha < 0.25) return false;
  const dx0 = x - q.x, dy0 = y - q.y;
  if (dx0 * dx0 + dy0 * dy0 > R * R * 1.7) return false;
  if (dx0 * dx0 + dy0 * dy0 < R * R * 0.3) return true;
  for (let k = 0; k < q.lobes.length; k++) {
    const L = q.lobes[k], w = Math.sin(G.t * 0.25 + L.ph) * 0.15;
    const cx = q.x + Math.cos(L.a + w) * L.d * R, cy = q.y + Math.sin(L.a + w) * L.d * R, rr = L.rk * R * (1 + 0.08 * Math.sin(G.t * 0.3 + k));
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < rr * rr) return true;
  }
  return false;
}
function pillLobes(fn) {
  const q = G.pill, R = pillR();
  if (!q || R <= 0) return;
  fn(q.x, q.y, Math.sqrt(0.3) * R);
  q.lobes.forEach((L, k) => { const w = Math.sin(G.t * 0.25 + L.ph) * 0.15; fn(q.x + Math.cos(L.a + w) * L.d * R, q.y + Math.sin(L.a + w) * L.d * R, L.rk * R * (1 + 0.08 * Math.sin(G.t * 0.3 + k))); });
}

// ---------------------------------------------------------------- yeast infection
// From about 3:30 (then every 5 to 7 minutes) an infection takes hold somewhere just off screen: three
// Candida cells that bud and bud. Wipe out every cell and you're cured, with a Gold strand of DNA for it.
const YEAST = { first: [210, 330], every: [300, 420], seed: 3, cap: 70 };
function updateYeast(dt) {
  G.yeastN = 0;
  for (const e of G.enemies) if (!e.dead && e.def.ai === 'yeast') G.yeastN++;
  if (G.nextYeast == null) G.nextYeast = rand(YEAST.first[0], YEAST.first[1]);
  if (!G.yeastOn) {
    if (G.t >= G.nextYeast && G.state === 'play') startInfection();
    return;
  }
  if (G.yeastN === 0 && G.t - G.yeastOn > 4) {
    G.yeastOn = 0; G.nextYeast = G.t + rand(YEAST.every[0], YEAST.every[1]);
    G.lootQueue.push({ kind: 'chest', src: { t: 'cure' } });
    banner('INFECTION CURED', PAL.reward);
    sysMsg('SYSTEM MESSAGE', 'The yeast infection has cleared up. The womb thanks you. It will not be discussing this with anyone.', PAL.reward, true);
  }
}
function startInfection() {
  const s = spawnPos();
  G.yeastOn = G.t;
  for (let i = 0; i < YEAST.seed; i++) {
    const e = makeEnemy(ENEMIES.yeast, s.x + rand(-30, 30), s.y + rand(-30, 30));
    e.baseR = e.r; e.grow = 1; e.budT = rand(1, 3); G.enemies.push(e);
  }
  banner('YEAST INFECTION!', PAL.danger);
  sysMsg('SYSTEM MESSAGE', pick([
    'Congratulations: a yeast infection. It is itchy, it is spreading, and it is now your problem. Kill every cell before it doubles again.',
    'A yeast infection has broken out nearby. It buds every few seconds. Ignore it and it will not ignore you.',
    'Candida has entered the chat. Each cell makes another cell. You do the maths. Then do the killing.',
  ]), PAL.danger, true);
  sfx('boss');
}

// ---------------------------------------------------------------- the crowd (cosmetic)
// A steady stream of tiny, harmless sperm swims in from beyond the arena and heads for the egg, where
// they try to tunnel in. They don't fight and nothing targets them, but any shot or blast that touches
// one pops it, and that takes a chunk off the sperm count. They're there to show the 400 million.
const AMB = { rate: 10, cap: 300, rim: 80, cell: 48 };
function updateAmbient(dt) {
  const A = G.amb || (G.amb = []);
  G.ambAcc = (G.ambAcc || 0) + AMB.rate * dt;
  while (G.ambAcc >= 1) {
    G.ambAcc--;
    if (A.length >= AMB.cap) break;
    const a = Math.random() * TAU, d = CORE.arena + rand(20, 120);
    A.push({ x: G.core.x + Math.cos(a) * d, y: G.core.y + Math.sin(a) * d, sp: rand(38, 70), ph: Math.random() * TAU, rim: false, wob: rand(-0.35, 0.35) });
  }
  let rimN = 0;
  const grid = G.ambGrid || (G.ambGrid = new Map());
  grid.clear();
  for (const s of A) {
    if (s.dead) continue;
    const dx = G.core.x - s.x, dy = G.core.y - s.y, d = Math.hypot(dx, dy) || 1;
    s.ph += dt * (s.rim ? 26 : 14);
    if (!s.rim) {
      // A wandering, wiggling approach.
      const a = Math.atan2(dy, dx) + s.wob * Math.sin(s.ph * 0.15);
      s.x += Math.cos(a) * s.sp * dt; s.y += Math.sin(a) * s.sp * dt; s.a = a;
      if (d < CORE.r + 8) { s.rim = true; s.a = Math.atan2(dy, dx); s.rimT = G.t; }
    } else rimN++;
    const k = Math.floor(s.x / AMB.cell) * 100003 + Math.floor(s.y / AMB.cell);
    let c = grid.get(k); if (!c) grid.set(k, c = []); c.push(s);
  }
  // The egg's surface only holds so many hopefuls; the oldest give up.
  if (rimN > AMB.rim) { let drop = rimN - AMB.rim; for (const s of A) { if (drop <= 0) break; if (s.rim && !s.dead) { s.dead = true; drop--; } } }
  if (G.frameN % 30 === 0) G.amb = A.filter(s => !s.dead);
}
// Pop every crowd sperm within r of (x, y). Returns how many.
function popAmbient(x, y, r) {
  if (!G.ambGrid) return 0;
  let n = 0;
  const c0 = Math.floor((x - r) / AMB.cell), c1 = Math.floor((x + r) / AMB.cell), d0 = Math.floor((y - r) / AMB.cell), d1 = Math.floor((y + r) / AMB.cell);
  for (let cx = c0; cx <= c1; cx++) for (let cy = d0; cy <= d1; cy++) {
    const c = G.ambGrid.get(cx * 100003 + cy);
    if (!c) continue;
    for (const s of c) if (!s.dead && (s.x - x) * (s.x - x) + (s.y - y) * (s.y - y) < r * r) {
      s.dead = true; n++;
      if (Math.random() < 0.5) spawnPart(s.x, s.y, '#ffffff', 2, 50, 0.3, 1.5);
    }
  }
  if (n) { G.ambKills = (G.ambKills || 0) + n; countKill(x, y); }
  return n;
}
