'use strict';
// Spawn Prawn - Flight and Crowd modifiers on each Delivery (redesign docs/MODIFIER_MATRIX.md 5.11, user approved 25 Oct;
// storm-directive/MODAUDIT_HANDOFF.md task 3). One shared form per Delivery x modifier, read from XD; a weapon's own cell
// (cellmods*.js, XC_W masks) overrides it, because the Mines pass runs inside mwTick, which cellmods.js masks.
// Batch 1: Mines (modwide.js mines and the Laser's mines in laserbeam.js).
//  - Homing: armed mines creep to the nearest enemy within 250 (60 / 80 / 100 a second, Smart Mines' creep included).
//  - Bounce (Ricochet): a new mine is flung at the nearest enemy, bounces off it (1 / 2 / 3 bounces) and slides to rest
//    in the crowd; it arms only at rest.
//  - Returning: a mine untouched for 6 / 5 / 4 s rolls back towards you, going off on the first enemy it meets.
//  - Link (Connecting): tripwires join each armed mine to the nearest within 140 (180 from rank 2; 2 wires at rank 3);
//    an enemy crossing a wire sets off both ends, and the snapping wire hits it (60%).
//  - Pull: a tripped mine sucks in enemies within 70 / 105 / 140 for 0.3 s, then goes off (Implosion).
//  - Knockback: the blast shoves outward from the mine (src.mwAt, read by modwide.js mwDmgMul), not from you.
// Hooks: none in shared files. Wraps modwide.js mwLay/mwMineGo/mwTick, modifiers.js modCard/modDraw and laserbeam.js
// lzMineLay/lzExtrasTick.
// Loads after laserbeam.js and before cellmods.js (so cellmods.js's mask wraps this file's mwTick).

const XD = {
  mines: {
    homing:     { r: 250, v: [60, 80, 100] },
    ricochet:   { r: 250, v: 320, n: [1, 2, 3], drag: 2.2, stop: 30, max: 1.6 },
    returning:  { wait: [6, 5, 4], v: 120, rest: 50 },
    connecting: { reach: [140, 180, 180], wires: [1, 1, 2], zap: 0.6 }, // (zap: the snapping wire hits what crossed it, so a crossing
                                                                      //  midway, outside both blasts, still counts; 0 turns it off)
    pull:       { r: [70, 105, 140], t: 0.3, f: 380 },
    knock:      {}, // (the shove's origin: modwide.js mwDmgMul reads src.mwAt)
  },
};
const xdR = (w, id) => Math.min(3, modCount(w, id));
const xdLv = (a, r) => a[Math.max(1, Math.min(a.length, r)) - 1];
const xdFoe = (x, y, R, not) => { let b = null, bd = R; for (const o of G.enemies) { if (o.dead || o.charmed || o.egg || (not && not.includes(o))) continue; const d = Math.hypot(o.x - x, o.y - y) - (o.r || 0); if (d < bd) { bd = d; b = o; } } return b; };

// The two kinds of mine, as the shared pass sees them.
const XD_MW = {
  list: () => mwS().mines,
  idle: q => !q.gone,
  trig: q => 60 * (q.big > 1 ? 1.5 : 1),
  go: q => { mwMineGo(q); if (q.rearm) { q.rearm = 0; q.armed = G.t + 1; } else q.gone = true; },
};
const XD_LZ = {
  list: () => lzS().mines,
  idle: q => !q.firing && !q.gone,
  trig: q => 60 * lzAreaK(q.w),
  go: q => { q.armed = G.t; lzMineFire(q); },
};

// A new mine: its lay time (Returning) and, with Bounce, a fling at the nearest enemy.
function xdMineNew(q) {
  q.xdT0 = G.t;
  const rr = xdR(q.w, 'ricochet'), C = XD.mines.ricochet;
  if (!rr) return;
  const e = xdFoe(q.x, q.y, C.r); if (!e) return;
  const a = Math.atan2(e.y - q.y, e.x - q.x);
  q.xdSl = { vx: Math.cos(a) * C.v, vy: Math.sin(a) * C.v, n: xdLv(C.n, rr), hit: [], t: 0 };
}
function xdSlide(q, dt) {
  const s = q.xdSl, C = XD.mines.ricochet;
  s.t += dt; q.x += s.vx * dt; q.y += s.vy * dt;
  if (G.lvl && lvSolidAt(q.x, q.y)) { q.x -= s.vx * dt; q.y -= s.vy * dt; s.vx *= -0.5; s.vy *= -0.5; }
  if (s.n > 0) for (const e of G.enemies) {
    if (e.dead || e.charmed || e.egg || s.hit.includes(e)) continue;
    const dx = q.x - e.x, dy = q.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d > (e.r || 10) + 6) continue;
    const nx = dx / d, ny = dy / d, dot = s.vx * nx + s.vy * ny;
    if (dot < 0) { s.vx = (s.vx - 2 * dot * nx) * 0.85; s.vy = (s.vy - 2 * dot * ny) * 0.85; } // (the true reflection angle, as Ricochet)
    s.hit.push(e); s.n--;
    ring(q.x, q.y, 10, q.w.def.color, 0.15, 2);
    break;
  }
  const k = Math.exp(-C.drag * dt); s.vx *= k; s.vy *= k;
  if (Math.hypot(s.vx, s.vy) < C.stop || s.t > C.max) { q.xdSl = null; q.armed = G.t + 0.3; } // (arms at rest)
  else q.armed = G.t + 1;
}
function xdImplode(A, q) {
  const C = XD.mines.pull;
  q.xdImpT = G.t + C.t; q.armed = Infinity;
  ring(q.x, q.y, xdLv(C.r, xdR(q.w, 'pull')) * (typeof areaK === 'function' ? areaK(q.w) : 1), q.w.def.color, C.t, 3);
}
const xdSetOff = (A, q) => { if (q.xdImpT) return; if (mwR(q.w, 'pull')) xdImplode(A, q); else A.go(q); };

// Every frame, before the mine's own tick: slide, implode, creep, roll back, tripwires.
function xdMines(A, dt) {
  const list = A.list(), byW = new Map();
  for (const q of list) {
    if (!A.idle(q) || !q.w || !q.w.m10) continue;
    const w = q.w;
    if (q.xdT0 == null) xdMineNew(q); // (laid by a path this file doesn't wrap)
    if (q.xdSl) { xdSlide(q, dt); continue; }
    if (q.xdImpT) {
      const C = XD.mines.pull, R = xdLv(C.r, Math.max(1, xdR(w, 'pull'))) * (typeof areaK === 'function' ? areaK(w) : 1);
      for (const o of G.enemies) if (!o.dead && !o.charmed && Math.hypot(o.x - q.x, o.y - q.y) < R) mwPull(o, q.x, q.y, C.f * dt);
      if (G.t >= q.xdImpT) { q.xdImpT = 0; A.go(q); }
      continue;
    }
    if (G.t < q.armed) continue;
    // Homing (Smart Mines' 30 a second already runs in the mine's own tick, so this adds the rest)
    const hr = xdR(w, 'homing');
    const tgt = hr ? xdFoe(q.x, q.y, XD.mines.homing.r) : null;
    if (tgt) {
      const v = xdLv(XD.mines.homing.v, hr) - (msB(w, 'mines', 2) ? 30 : 0), d = Math.hypot(tgt.x - q.x, tgt.y - q.y) || 1;
      q.x += (tgt.x - q.x) / d * v * dt; q.y += (tgt.y - q.y) / d * v * dt;
    } else if (xdR(w, 'returning') && G.t - q.xdT0 > xdLv(XD.mines.returning.wait, xdR(w, 'returning'))) {
      const C = XD.mines.returning, p = G.player, d = Math.hypot(p.x - q.x, p.y - q.y) || 1;
      if (d > C.rest) { q.x += (p.x - q.x) / d * C.v * dt; q.y += (p.y - q.y) / d * C.v * dt; q.xdBack = 1; } else q.xdBack = 0;
    }
    if (mwR(w, 'pull') && msNear(q.x, q.y, A.trig(q))) { xdImplode(A, q); continue; }
    if (xdR(w, 'connecting')) { if (!byW.has(w)) byW.set(w, []); byW.get(w).push(q); }
  }
  // Link: tripwires between this weapon's armed mines
  for (const w of G.weapons) if (w && w.xdWiresA === A) w.xdWires = null;
  for (const [w, ms] of byW) {
    const r = xdR(w, 'connecting'), C = XD.mines.connecting, reach = xdLv(C.reach, r), k = xdLv(C.wires, r), edges = [], seen = new Set();
    ms.forEach((m, i) => {
      const near = ms.map((o, j) => [j, Math.hypot(o.x - m.x, o.y - m.y)]).filter(([j, d]) => j !== i && d < reach).sort((u, v) => u[1] - v[1]).slice(0, k);
      for (const [j] of near) { const key = Math.min(i, j) + ':' + Math.max(i, j); if (!seen.has(key)) { seen.add(key); edges.push([ms[Math.min(i, j)], ms[Math.max(i, j)]]); } }
    });
    w.xdWires = edges; w.xdWiresA = A;
    for (const [a, b] of edges) {
      if (!A.idle(a) || !A.idle(b) || a.xdImpT || b.xdImpT) continue;
      const vx = b.x - a.x, vy = b.y - a.y, l2 = vx * vx + vy * vy || 1;
      const cross = G.enemies.filter(e => { if (e.dead || e.charmed) return false; const t = Math.max(0, Math.min(1, ((e.x - a.x) * vx + (e.y - a.y) * vy) / l2)); return Math.hypot(e.x - (a.x + vx * t), e.y - (a.y + vy * t)) < (e.r || 10) + 3; });
      if (!cross.length) continue;
      if (C.zap) { const src = Object.assign({}, a.src || weaponSrc(w)); for (const e of cross) damageEnemy(e, w.s.dmg * C.zap, src); bolt(a.x, a.y, b.x, b.y, w.def.color, 0.15); }
      xdSetOff(A, a); xdSetOff(A, b);
    }
  }
}

mwLay = (orig => function (w, target, src) {
  const S = mwS(), r = orig(w, target, src);
  for (const q of S.mines) if (q.xdT0 == null && q.w === w) xdMineNew(q);
  return r;
})(mwLay);
mwMineGo = (orig => function (q) { // Knockback: the blast shoves outward from the mine
  const s = q.src; if (!s) return orig(q);
  const had = s.mwAt; s.mwAt = { x: q.x, y: q.y };
  try { return orig(q); } finally { s.mwAt = had; }
})(mwMineGo);
mwTick = (orig => function (dt) { if (G && G.mwAny && G.state === 'play') xdMines(XD_MW, dt); return orig(dt); })(mwTick);
lzMineLay = (orig => function (w, src, blast) {
  const M = lzS().mines, n = M.length; orig(w, src, blast);
  for (const m of M.slice(n)) { if (m.src) m.src.mwAt = m; xdMineNew(m); } // (its beams shove outward from the mine)
})(lzMineLay);
lzExtrasTick = (orig => function (dt) { xdMines(XD_LZ, dt); return orig(dt); })(lzExtrasTick);

// Card text: a modifier offered on a weapon that lays mines describes its Mines form (TODO_COPY:xd_mines_<modifier>, the
// user writes it). cellmods.js wraps modCard after this file, so a weapon's own cell text still wins.
modCard = (orig => function (w, id) {
  const c = orig(w, id);
  if (c && w && w.m10 && mwR(w, 'mines') && XD.mines[id]) c.desc = 'TODO_COPY:xd_mines_' + id;
  return c;
})(modCard);

// Drawing: tripwires (dashed, as Nappy Mines' are)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  ctx.save();
  for (const w of G.weapons) {
    if (!w || !w.xdWires) continue;
    ctx.globalAlpha = 0.6; ctx.strokeStyle = col(w.def.color); ctx.lineWidth = 1.5 * S; ctx.setLineDash([4 * S, 4 * S]);
    for (const [a, b] of w.xdWires) { ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke(); }
  }
  ctx.setLineDash([]); ctx.restore();
})(modDraw);
