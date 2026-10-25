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
// Batch 2: Melee (modwide.js mwMelee and the Laser's sword, laserbeam.js lzSwordSwing). A swing tags its src (src.xdSw);
// the 'proc' hook collects what it hit, and the forms run once the swing is over. Follow-up hits carry src.xdF (never
// collected again). Base damage per hit: the swing's own (1.5x the weapon's hit; the sword's 0.6 s of beam or its blast).
//  - Homing: each swing also throws a small homing slash (40%) at the nearest enemy just out of reach (1 / 2 / 3 slashes,
//    at different enemies, up to 220 past the reach).
//  - Bounce (Ricochet): the swing's last hit rebounds to 1 / 2 / 3 more enemies within 100 at 60%.
//  - Returning: the swing sweeps back 0.2 s later as a second arc at 60 / 75 / 90%.
//  - Link (Connecting): enemies hit by the same swing are linked for 3 / 4 / 5 s; a hit on one passes 25% to the others.
//  - Pull: before it lands, the swing draws enemies within 120 / 150 / 180 a step (30 / 40 / 50) towards you.
//  - Knockback (Bouncer): enemies the swing shoves hurt the first enemy they hit, and themselves, for 40% of the swing.
//    (Wall Slam's own collision, modwide.js mwTick, takes the shove first when the weapon has it.)
// Batch 3: Strike from Above (an extra: modwide.js mwDfa's marked strikes, and the Laser's orbital strikes, laserbeam.js
// lzOrbital). The forms attach to the strike and its marker, never the weapon's own shot. A strike's hit is 1.4x the
// weapon's (mwDfa); an orbital strike's is its whole beam (0.4 of the peak beam every 0.1 s).
//  - Homing: the marker follows its target through the warning (an orbital strike, which already follows, takes the
//    nearest enemy within 150 when its target dies).
//  - Bounce (Ricochet): the strike lands again on the nearest enemy within 120 (1 / 2 / 3 times, 60%), each with a 0.2 s
//    marker (an orbital strike: a 0.2 s mark, then half as long a beam).
//  - Returning: a line of small strikes (0.6x the radius; 30 / 40 / 50%) walks back from the target to you, 70 apart, every
//    0.15 s (Orbital Strike reversed); an orbital strike's beam sweeps back to you over 0.6 s (50 / 60 / 70%).
//  - Link (Connecting): each strike is joined to the last one's spot (within 500) by a 2 s beam that hurts what crosses it
//    (6 / 8 / 10% of the strike every 0.25 s).
//  - Pull: the marker pulls enemies within its radius + 60 / 90 / 120 towards it through the warning.
//  - Knockback: the strike throws enemies outward from where it lands (src.mwAt), not away from you.
// Hooks: none in shared files; hookOn('proc', 'xdProc') from this file. Wraps modwide.js mwLay/mwMineGo/mwTick/mwMelee/mwDfa,
// modifiers.js modCard/modDraw and laserbeam.js lzMineLay/lzExtrasTick/lzSwordSwing/lzOrbital.
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
  melee: {
    homing:     { gap: 220, v: 520, k: 0.4, n: [1, 2, 3], life: 1 },
    ricochet:   { r: 100, k: 0.6, n: [1, 2, 3], step: 0.06 },
    returning:  { t: 0.2, k: [0.6, 0.75, 0.9] },
    connecting: { t: [3, 4, 5], share: 0.25, max: 8 },
    pull:       { r: [120, 150, 180], step: [30, 40, 50] },
    knock:      { k: 0.4, f: 150 },
  },
  dfa: {
    homing:     { re: 150 },                                         // (re: an orbital strike's new target when its own dies)
    ricochet:   { r: 120, k: 0.6, n: [1, 2, 3], mark: 0.2, lzDur: 0.5 },
    returning:  { step: 70, gap: 0.15, max: 6, rk: 0.6, k: [0.3, 0.4, 0.5], lzT: 0.6, lzK: [0.5, 0.6, 0.7] },
    connecting: { t: 2, reach: 500, tick: 0.25, k: [0.06, 0.08, 0.1] },
    pull:       { r: [60, 90, 120], f: 300 },
    knock:      {},                                                  // (the shove's origin: src.mwAt, as Mines)
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

// ---------------------------------------------------------------- Melee (batch 2)
const xdM = () => G.xdM || (G.xdM = { sl: [], lk: [] });
const xdSwAny = w => !!w && !!w.m10 && ['homing', 'ricochet', 'returning', 'connecting', 'pull', 'knock'].some(id => modCount(w, id) > 0);
const xdSrcF = (src, lz) => Object.assign({}, src, { atk: 'contact', xdF: 1, xdSw: null }, lz ? { lzDel: true, mwDel: true } : null);
function xdHitArc(w, a, reach, half, dmg, src, not) { // (the Returning sweep: one arc round where you are now)
  const p = G.player; let n = 0;
  for (const e of G.enemies) {
    if (e.dead || e.charmed || (not && not.includes(e))) continue;
    if (Math.hypot(e.x - p.x, e.y - p.y) > reach + e.r) continue;
    if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), a)) > half) continue;
    damageEnemy(e, dmg, src); n++;
  }
  return n;
}
// Pull: before the swing lands
function xdSwPull(w, reach) {
  const r = xdR(w, 'pull'); if (!r) return;
  const C = XD.melee.pull, p = G.player, R = xdLv(C.r, r) * (typeof areaK === 'function' ? areaK(w) : 1), f = xdLv(C.step, r);
  let n = 0;
  for (const o of G.enemies) { if (o.dead || o.charmed || n >= 12) continue; const d = Math.hypot(o.x - p.x, o.y - p.y) - (o.r || 0); if (d > R || d < reach * 0.5) continue; mwPull(o, p.x, p.y, f); o.mwPulledT = G.t + 1; n++; }
  if (n) ring(p.x, p.y, R, w.def.color, 0.2, 2);
}
// After the swing: what it hit (sw.hits, in hit order), its angle and reach, the damage one of its hits was worth
function xdSwung(w, src, sw, a, reach, base, lz) {
  xdM(); const C = XD.melee, p = G.player, g0 = G, hits = [...new Set(sw.hits)].filter(e => !e.dead), fsrc = xdSrcF(src, lz);
  // Homing: slashes at the nearest enemies just out of reach
  const hr = xdR(w, 'homing');
  if (hr) {
    const far = G.enemies.filter(e => !e.dead && !e.charmed && !e.egg && !sw.hits.includes(e)).map(e => [Math.hypot(e.x - p.x, e.y - p.y) - (e.r || 0), e]).filter(([d]) => d > reach * 0.8 && d < reach + C.homing.gap).sort((u, v) => u[0] - v[0]).slice(0, xdLv(C.homing.n, hr));
    for (const [, e] of far) xdM().sl.push({ w, e, x: p.x, y: p.y, a: Math.atan2(e.y - p.y, e.x - p.x), end: G.t + C.homing.life, dmg: base * C.homing.k, src: fsrc });
  }
  // Bounce: the last hit rebounds
  const br = xdR(w, 'ricochet');
  if (br && hits.length) {
    let cur = hits[hits.length - 1]; const used = hits.slice();
    for (let i = 0; i < xdLv(C.ricochet.n, br); i++) {
      const nx = xdFoe(cur.x, cur.y, C.ricochet.r, used); if (!nx) break;
      used.push(nx); const fx = cur.x, fy = cur.y;
      after(C.ricochet.step * i, () => { if (G !== g0 || nx.dead) return; damageEnemy(nx, base * C.ricochet.k, fsrc); bolt(fx, fy, nx.x, nx.y, w.def.color, 0.15); ring(nx.x, nx.y, 10, w.def.color, 0.15, 2); });
      cur = nx;
    }
  }
  // Returning: the swing sweeps back
  const rr = xdR(w, 'returning');
  if (rr) after(C.returning.t, () => {
    if (G !== g0 || !G.weapons.includes(w)) return;
    xdHitArc(w, a, reach, Math.PI * 150 / 360, base * xdLv(C.returning.k, rr), fsrc);
    (G.v10fx || (G.v10fx = [])).push({ k: 'arc', x: G.player.x, y: G.player.y, a, r: reach * 0.9, c: w.def.color, life: 0.15, max: 0.15 });
  });
  // Link: everything this swing hit shares damage for a while
  const lr = xdR(w, 'connecting');
  if (lr && hits.length >= 2) {
    const L = { w, es: hits.slice(0, C.connecting.max), end: G.t + xdLv(C.connecting.t, lr), share: C.connecting.share };
    for (const e of L.es) e.xdLk = L;
    const M = xdM(); M.lk = M.lk.filter(o => o.end > G.t); M.lk.push(L);
  }
  // Knockback (Bouncer): shoved enemies hurt what they hit
  const kr = xdR(w, 'knock');
  if (kr) for (const e of hits) {
    if (e.boss) continue;
    if (lz) { shove(e, p.x, p.y, C.knock.f * kr); e.mwKnT = G.t; e.mwKnW = w; e.mwKnHit = null; } // (the Laser's own Knockback only pushes along its beam)
    e.xdBnT = G.t; e.xdBnW = w; e.xdBnD = base * C.knock.k; e.xdBnSrc = fsrc;
  }
}
function xdProc(e, dmg, src, d) {
  if (src.xdSw && !src.xdF && !src.echo && !src.mwBoom) src.xdSw.hits.push(e);
  const L = e.xdLk; // Link: a hit on one passes a share to the others
  if (L && !src.xdLk && d > 0) {
    if (L.end <= G.t) { e.xdLk = null; return; }
    const s2 = msEcho(src, { xdLk: 1, xdF: 1, xdSw: null, mult: 1 });
    for (const o of L.es) if (o !== e && !o.dead) damageEnemy(o, d * L.share, s2);
  }
}
hookOn('proc', 'xdProc', (e, dmg, src, d) => xdProc(e, dmg, src, d));
function xdMelee(dt) {
  const M = xdM();
  // Homing slashes
  for (const q of M.sl) {
    if (q.e.dead) q.e = xdFoe(q.x, q.y, 200);
    if (!q.e || G.t > q.end) { q.end = 0; continue; }
    const v = XD.melee.homing.v, ta = Math.atan2(q.e.y - q.y, q.e.x - q.x);
    q.a += Math.max(-10 * dt, Math.min(10 * dt, angDiff(ta, q.a))); // (turns 10 radians a second)
    q.x += Math.cos(q.a) * v * dt; q.y += Math.sin(q.a) * v * dt;
    if (Math.hypot(q.e.x - q.x, q.e.y - q.y) < (q.e.r || 10) + 8) { damageEnemy(q.e, q.dmg, q.src); ring(q.x, q.y, 12, q.w.def.color, 0.15, 2); q.end = 0; }
  }
  M.sl = M.sl.filter(q => q.end > G.t);
  M.lk = M.lk.filter(L => L.end > G.t);
  // Bouncer: a shoved enemy that runs into another hurts both (once per shove)
  for (const e of G.enemies) {
    if (typeof cdOn === 'function' && cdOn()) break; // collide.js owns collisions when loaded
    if (e.dead || !(e.xdBnT > G.t - 0.6) || e.mwKnHit || !G.weapons.includes(e.xdBnW)) continue;
    const o = msNear(e.x, e.y, e.r + 2, [e]); if (!o) continue;
    e.mwKnHit = 1; e.xdBnT = 0;
    damageEnemy(e, e.xdBnD, e.xdBnSrc); damageEnemy(o, e.xdBnD, e.xdBnSrc);
    ring((e.x + o.x) / 2, (e.y + o.y) / 2, 14, e.xdBnW.def.color, 0.2, 3);
  }
}
mwMelee = (orig => function (w, target, src) {
  if (!xdSwAny(w)) return orig(w, target, src);
  const p = G.player, a = Math.atan2(target.y - p.y, target.x - p.x), reach = 90 * (typeof areaK === 'function' ? areaK(w) : 1) * (1 + 0.2 * mwR(w, 'range'));
  xdSwPull(w, reach);
  const sw = { hits: [] }; src.xdSw = sw;
  let r; try { r = orig(w, target, src); } finally { src.xdSw = null; }
  xdSwung(w, src, sw, a, reach, w.s.dmg * 1.5, false);
  return r;
})(mwMelee);
lzSwordSwing = (orig => function (w, target, src, blast) {
  if (!xdSwAny(w) || !target) return orig(w, target, src, blast);
  const n0 = w.lzSwN || 0, p = G.player, a = Math.atan2(target.y - p.y, target.x - p.x), reach = (mwR(w, 'melee') >= 2 ? 110 : 90) * lzAreaK(w) * (1 + 0.2 * mwR(w, 'range'));
  if (blast || G.t >= (w.lzSwT || 0)) xdSwPull(w, reach);
  const sw = { hits: [] }; src.xdSw = sw;
  let r; try { r = orig(w, target, src, blast); } finally { src.xdSw = null; }
  if ((w.lzSwN || 0) !== n0) xdSwung(w, src, sw, a, reach, w.s.dmg * (blast ? lzBlastK(w) : 0.6 / Math.max(0.05, w.s.cd || 0.1)), true); // (only when it swung)
  return r;
})(lzSwordSwing);
mwTick = (orig => function (dt) { const r = orig(dt); if (G && G.xdM && G.state === 'play') xdMelee(dt); return r; })(mwTick);

// ---------------------------------------------------------------- Strike from Above (batch 3)
const xdD = () => G.xdD || (G.xdD = { mk: [], lk: [] });
const xdDfaAny = w => !!w && !!w.m10 && ['homing', 'ricochet', 'returning', 'connecting', 'pull', 'knock'].some(id => modCount(w, id) > 0);
const xdDfaSrc = (src, x, y, w) => Object.assign({}, src, { xdF: 1 }, xdR(w, 'knock') ? { mwAt: { x, y } } : null);
// A marker (the 'warn' fx): Homing makes it follow, Pull drags enemies onto it. Returns the fx, whose spot the strike takes.
function xdMark(w, t, r, dl, follow) {
  const f = { type: 'warn', x: t.x, y: t.y, r, color: w.def.color, life: dl, max: dl };
  G.fx.push(f);
  xdD().mk.push({ w, e: follow ? t : null, f, r, end: G.t + dl });
  return f;
}
// Link: a beam from this strike's spot to the last one's
function xdLinkAt(w, x, y, base, src) {
  const C = XD.dfa.connecting, r = xdR(w, 'connecting'), L = w.xdLastS;
  w.xdLastS = { x, y };
  if (!r || !L || Math.hypot(L.x - x, L.y - y) > C.reach || Math.hypot(L.x - x, L.y - y) < 1) return;
  xdD().lk.push({ w, x0: L.x, y0: L.y, x1: x, y1: y, end: G.t + C.t, next: G.t, dmg: base * xdLv(C.k, r), src: Object.assign({}, src, { xdF: 1, mwAt: null }) });
}
// A strike from above landing (mwDfa's, or a bounce): the blast, then Link, Bounce and Returning
function xdLand(w, x, y, r, k, src, hit, nB, main) {
  const s2 = xdDfaSrc(src, x, y, w), g0 = G, C = XD.dfa;
  mwStrike(w, x, y, r, k, s2);
  if (main) xdLinkAt(w, x, y, w.s.dmg * k, src);
  if (nB > 0) { // Bounce: again on the nearest enemy within 120, after a short marker
    const nx = xdFoe(x, y, C.ricochet.r, hit);
    if (nx) {
      const f = xdMark(w, nx, r, C.ricochet.mark, true);
      bolt(x, y, nx.x, nx.y, w.def.color, 0.15);
      after(C.ricochet.mark, () => { if (G === g0 && G.weapons.includes(w)) xdLand(w, f.x, f.y, r, k * C.ricochet.k, src, hit.concat(nx), nB - 1, false); });
    }
  }
  const rr = main ? xdR(w, 'returning') : 0;
  if (rr) { // Returning: small strikes walk back towards you
    const R = C.returning, p = G.player, n = Math.min(R.max, Math.floor((Math.hypot(p.x - x, p.y - y) - 50) / R.step));
    for (let i = 1; i <= n; i++) after(R.gap * i, () => {
      if (G !== g0 || !G.weapons.includes(w)) return;
      const q = G.player, d = Math.hypot(q.x - x, q.y - y) || 1, s = Math.min(d - 30, R.step * i);
      const sx2 = x + (q.x - x) / d * s, sy2 = y + (q.y - y) / d * s;
      if (s > 0) mwStrike(w, sx2, sy2, r * R.rk, k * xdLv(R.k, rr), xdDfaSrc(src, sx2, sy2, w));
    });
  }
}
mwDfa = (orig => function (w, t, src, k, delay) {
  if (!xdDfaAny(w) || !t) return orig(w, t, src, k, delay);
  const r = (w.s.area || 40) * (msA(w, 'dfa', 2) ? 1.3 : 1), dl = delay != null ? delay : msB(w, 'dfa', 2) ? 0.2 : 0.4; // (as mwDfa)
  const f = xdMark(w, t, r, dl, xdR(w, 'homing') > 0), g0 = G, km = 1.4 * k * (msA(w, 'dfa', 2) ? 1.3 : 1), nB = xdR(w, 'ricochet') ? xdLv(XD.dfa.ricochet.n, xdR(w, 'ricochet')) : 0;
  after(dl, () => { if (G === g0) xdLand(w, f.x, f.y, r, km, src, [t], nB, true); });
})(mwDfa);
// Every frame: markers follow and pull; Link beams hurt what crosses them
function xdStrikes(dt) {
  const D = xdD(), C = XD.dfa;
  for (const m of D.mk) {
    if (G.t >= m.end) continue;
    if (m.e && !m.e.dead) { m.f.x = m.e.x; m.f.y = m.e.y; }
    const pr = xdR(m.w, 'pull');
    if (pr) {
      const R = m.r + xdLv(C.pull.r, pr) * (typeof areaK === 'function' ? areaK(m.w) : 1);
      for (const o of G.enemies) if (!o.dead && !o.charmed && Math.hypot(o.x - m.f.x, o.y - m.f.y) < R) { mwPull(o, m.f.x, m.f.y, C.pull.f * dt); o.mwPulledT = G.t + 1; }
    }
  }
  D.mk = D.mk.filter(m => G.t < m.end);
  for (const L of D.lk) {
    if (G.t < L.next || !G.weapons.includes(L.w)) continue;
    L.next = G.t + C.connecting.tick;
    const vx = L.x1 - L.x0, vy = L.y1 - L.y0, l2 = vx * vx + vy * vy || 1;
    for (const e of G.enemies) {
      if (e.dead || e.charmed) continue;
      const u = Math.max(0, Math.min(1, ((e.x - L.x0) * vx + (e.y - L.y0) * vy) / l2));
      if (Math.hypot(e.x - (L.x0 + vx * u), e.y - (L.y0 + vy * u)) < (e.r || 10) + 6) damageEnemy(e, L.dmg, L.src);
    }
  }
  D.lk = D.lk.filter(L => G.t < L.end);
}
mwTick = (orig => function (dt) { const r = orig(dt); if (G && G.xdD && G.state === 'play') xdStrikes(dt); return r; })(mwTick);
// The Laser's orbital strikes: tagged with a src (Knockback's origin) when a form is held; this file then runs their hits
// (as lzExtrasTick does, which skips them) and adds Homing's new target, Pull, Link, Bounce and Returning.
lzOrbital = (orig => function (w, target) {
  const O = lzS().orb, n = O.length; orig(w, target);
  if (!xdDfaAny(w)) return;
  const br = xdR(w, 'ricochet');
  for (const o of O.slice(n)) { o.src = Object.assign({}, weaponSrc(w), { xdF: 1 }); if (xdR(w, 'knock')) o.src.mwAt = o; o.xdMain = 1; o.xdN = br ? xdLv(XD.dfa.ricochet.n, br) : 0; o.xdHit = [o.e]; }
})(lzOrbital);
function xdOrbs(dt) {
  const S2 = lzS(), C = XD.dfa, add = [];
  for (const o of S2.orb) {
    const w = o.w;
    if (!o.src || !G.weapons.includes(w)) continue;
    if (o.e && o.e.dead && xdR(w, 'homing')) o.e = xdFoe(o.x, o.y, C.homing.re); // (Homing: a new target)
    if (o.e && !o.e.dead) { o.x = o.e.x; o.y = o.e.y; }
    if (o.xdV) { o.x += o.xdV.x * dt; o.y += o.xdV.y * dt; }
    const R = msA(w, 'dfa', 2) ? 40 : 30, per = w.s.dmg * LZ.peak * 0.4 * o.k; // (as lzExtrasTick)
    if (G.t < o.t0) { // the mark: Pull
      const pr = xdR(w, 'pull');
      if (pr) { const RR = R + xdLv(C.pull.r, pr) * lzAreaK(w); for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - o.x, e.y - o.y) < RR) { mwPull(e, o.x, o.y, C.pull.f * dt); e.mwPulledT = G.t + 1; } }
      continue;
    }
    if (!o.xdLand) { o.xdLand = 1; if (o.xdMain) xdLinkAt(w, o.x, o.y, per * (o.end - o.t0) / 0.1, o.src); }
    if (G.t < o.end && G.t >= o.next) {
      o.next = G.t + 0.1;
      for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - o.x, e.y - o.y) < R + e.r) damageEnemy(e, per, Object.assign({}, o.src));
    }
    if (G.t >= o.end && !o.xdDone) {
      o.xdDone = 1;
      const nx = o.xdN > 0 ? xdFoe(o.x, o.y, C.ricochet.r, o.xdHit) : null;
      if (nx) { // Bounce: a short orbital strike on the nearest enemy
        const b = { w, e: nx, x: nx.x, y: nx.y, t0: G.t + C.ricochet.mark, mark: C.ricochet.mark, end: G.t + C.ricochet.mark + C.ricochet.lzDur, next: 0, k: o.k * C.ricochet.k, src: Object.assign({}, o.src), xdN: o.xdN - 1, xdHit: o.xdHit.concat(nx) };
        if (b.src.mwAt) b.src.mwAt = b;
        bolt(o.x, o.y, nx.x, nx.y, w.def.color, 0.15); add.push(b);
      }
      const rr = o.xdMain ? xdR(w, 'returning') : 0, p = G.player, d = Math.hypot(p.x - o.x, p.y - o.y);
      if (rr && d > 60) { // Returning: the beam sweeps back to you
        const T = C.returning.lzT, b = { w, e: null, x: o.x, y: o.y, t0: G.t, mark: 0, end: G.t + T, next: 0, k: o.k * xdLv(C.returning.lzK, rr), src: Object.assign({}, o.src), xdN: 0, xdHit: [], xdV: { x: (p.x - o.x) / d * (d - 40) / T, y: (p.y - o.y) / d * (d - 40) / T } };
        if (b.src.mwAt) b.src.mwAt = b;
        add.push(b);
      }
    }
  }
  S2.orb.push(...add);
  for (const o of S2.orb) if (o.src && G.t >= o.t0 && G.t < o.end) o.next = Math.max(o.next, G.t + 1e-6); // (lzExtrasTick skips the hits this file ran)
}
lzExtrasTick = (orig => function (dt) { if (G && G.lzS && G.lzS.orb.length) xdOrbs(dt); return orig(dt); })(lzExtrasTick); // (Link beams tick in mwTick)

// Card text: a modifier offered on a weapon that lays mines describes its Mines form (TODO_COPY:xd_mines_<modifier>, the
// user writes it). cellmods.js wraps modCard after this file, so a weapon's own cell text still wins.
modCard = (orig => function (w, id) {
  const c = orig(w, id);
  if (c && w && w.m10 && mwR(w, 'mines') && XD.mines[id]) c.desc = 'TODO_COPY:xd_mines_' + id;
  else if (c && w && w.m10 && mwR(w, 'melee') && XD.melee[id]) c.desc = 'TODO_COPY:xd_melee_' + id;
  else if (c && w && w.m10 && mwR(w, 'dfa') && XD.dfa[id]) c.desc = 'TODO_COPY:xd_dfa_' + id;
  return c;
})(modCard);

// Drawing: tripwires (dashed, as Nappy Mines' are); Melee's homing slashes and links
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  ctx.save();
  for (const w of G.weapons) {
    if (!w || !w.xdWires) continue;
    ctx.globalAlpha = 0.6; ctx.strokeStyle = col(w.def.color); ctx.lineWidth = 1.5 * S; ctx.setLineDash([4 * S, 4 * S]);
    for (const [a, b] of w.xdWires) { ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke(); }
  }
  ctx.setLineDash([]);
  if (G.xdM) {
    for (const L of G.xdM.lk) { // (a thin dotted line through the linked enemies)
      const es = L.es.filter(e => !e.dead); if (es.length < 2 || L.end <= G.t) continue;
      ctx.globalAlpha = 0.5 * Math.min(1, (L.end - G.t) / 0.5); ctx.strokeStyle = col(L.w.def.color); ctx.lineWidth = 1 * S; ctx.setLineDash([2 * S, 3 * S]);
      ctx.beginPath(); ctx.moveTo(sx(es[0].x), sy(es[0].y)); for (const e of es.slice(1)) ctx.lineTo(sx(e.x), sy(e.y)); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const q of G.xdM.sl) { // (a small crescent, facing where it flies)
      ctx.globalAlpha = 0.85; ctx.strokeStyle = col(q.w.def.color); ctx.lineWidth = 2.5 * S;
      ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 9 * S, q.a - 1.1, q.a + 1.1); ctx.stroke();
    }
  }
  if (G.xdD) {
    for (const L of G.xdD.lk) { // (a thin beam between two strike spots, fading out)
      ctx.globalAlpha = 0.55 * Math.min(1, (L.end - G.t) / 0.5); ctx.strokeStyle = col(L.w.def.color); ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.moveTo(sx(L.x0), sy(L.y0)); ctx.lineTo(sx(L.x1), sy(L.y1)); ctx.stroke();
    }
    for (const m of G.xdD.mk) { // (Pull: a faint ring at the marker's reach)
      const pr = xdR(m.w, 'pull'); if (!pr || G.t >= m.end) continue;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = col(m.w.def.color); ctx.lineWidth = 1 * S; ctx.setLineDash([3 * S, 4 * S]);
      ctx.beginPath(); ctx.arc(sx(m.f.x), sy(m.f.y), (m.r + xdLv(XD.dfa.pull.r, pr)) * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  ctx.restore();
})(modDraw);
