'use strict';
// Spawn Storm - terrain. Obstacles growing in the womb: nodules that shots bounce off, mitochondria that
// soak up shots and release it as an ATP burst, acid crypts that burn whatever touches them, cilia beds
// that shove everything away, currents that carry everything along, and slicks that steal your grip.

const TCELL = 300;
function tKey(cx, cy) { return (cx + 1000) * 10000 + (cy + 1000); }

function makeTerrain() {
  const list = [], grid = new Map();
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
  // Bucket each obstacle into every cell its circle (plus a margin for bodies) touches.
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
  return { list, grid };
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
  if (z.acid && G.state === 'play') hurtPlayer(z.acid.def.dps * dmgMul(G.t), 'Acid Crypt');
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
        if (Math.random() < 0.4) spawnPart(s.x, s.y, '#b8f35a', 2, 50, 0.35, 2.5);
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
  const R = ob.def.burstR, dmg = Math.max(80 * hpMul(G.t), (G.dpsAvg || 0) * 1.2);
  ring(ob.x, ob.y, R, '#ffb347', 0.5, 6);
  addLight(ob.x, ob.y, R * 1.3, '#ff9e5e', 0.6);
  spawnPart(ob.x, ob.y, '#ffd23f', 24, 260, 0.6, 4);
  forNear(ob.x, ob.y, R, e => { if (!e.egg && !e.charmed) damageEnemy(e, dmg, { elem: 'fire', noCrit: true, wname: 'ATP Burst' }); });
  for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - ob.x, b.y - ob.y) < R) b.dead = true;
  const p = me();
  if (Math.hypot(p.x - ob.x, p.y - ob.y) < R + 60) {
    p.atpT = 4; G.rage = Math.max(G.rage, 4);
    floatText(p.x, p.y - 30, 'ATP RUSH!', '#ffb347', 16, 1.2);
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

// Keep things that need collecting out of the middle of solid obstacles.
function unstick(o, r) { pushOut(o, r || 10, 0); return o; }

function updateTerrain(dt) {
  if (!G.terrain) return;
  for (const ob of G.terrain.list) {
    if (ob.flash > 0) ob.flash -= dt;
    if (ob.burstT > 0) ob.burstT -= dt;
  }
}
