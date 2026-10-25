'use strict';
// Spawn Prawn - autorun movement modes and the autoaim helpers.
//  Autoaim: each weapon or Feat has a primary directive (w.dir) and an optional tie-breaker (w.dir2). With a
//   tie-breaker, near-equal picks on the primary (40 units of distance, 5% of health or speed, the same tier)
//   count as level and the tie-breaker decides; if nothing qualifies for the primary (ELITES with no elite in
//   reach) every enemy ties, so the tie-breaker is in effect the fallback. Distance settles anything left.
//   RANDOM keeps its victim for 1.5 s; FURTHEST and DENSEST CLUSTER keep theirs unless a new one is 15% better.
//  Autorun (movement only; aiming stays with each weapon). Every mode still dodges (the danger sampling in autoSteer):
//   KITE holds a band 240 to 360 from the nearest enemy, sidestepping round it; COLLECT takes the best pickups that are
//   not in trouble; ORBIT picks one cluster and circles it, keeping it until it breaks up or a much bigger one shows up;
//   HUNT keeps one target (boss > rival > elite > nearest); HOLD stays near where you chose it; NEST stays in the egg's
//   glow (hidden in campaign levels, where there is no egg: you get HOLD).
// Hooks: game.js targetScore -> aimPair, weapon fire -> aimSticky; acquire(w.dir) calls -> aimDir(w);
//   game.js autoSteer -> arMode, arGoal; ui.js / loadout.js mode pickers -> moveModes.
const AR = { kiteIn: 240, kiteOut: 360, kiteFar: 450, holdR: 60, orbitEvery: 1.5, orbitBetter: 1.5, huntR: 900, huntLose: 1100 };

// ---------------------------------------------------------------- autoaim
// Default aim prefers the boss: a slot still on its default NEAREST (never set in the aim menu: w.dirSet, no tie-breaker)
// aims at a boss in reach before its escorts (20 Oct: bot boss fights sent about a quarter of their damage to the boss).
let aimList = () => DIRECTIVES; // (the rules on offer in the aim menus; spsteer.js narrows it)
function aimDir(w) {
  if (!w.dirSet && w.dir === 'nearest' && !w.dir2 && G && G.boss && !G.boss.dead) return 'bossfirst';
  return w.dir2 && w.dir2 !== w.dir ? w.dir + '>' + w.dir2 : w.dir;
}
// Durability for TOUGHEST: max health plus the defence pool (Membrane pool, Shell layers' own health), as in ENEMY_STATS.md Effective HP.
function aimTough(e) {
  const cd = typeof fightCd === 'function' ? fightCd(e) : null;
  return e.maxHp + (cd ? cd.memMax + cd.layers * cd.layerHp : 0);
}
function aimShootTier(e) { return e.boss || e.def.shoot ? 3 : e.def.ai === 'medic' ? 2 : e.def.ai === 'summon' ? 1 : 0; }
function aimEliteTier(e) { return e.boss ? 3 : e.rival ? 2 : e.elite ? 1 : 0; }
const aimRel = v => Math.floor(Math.log(1 + Math.max(0, v)) / 0.04879); // 5% steps (ln 1.05)
// A directive's value, rounded so that near-equal enemies tie (higher is better).
function aimKey(dir, e, d2) {
  switch (dir) {
    case 'nearest': return -Math.floor(Math.sqrt(d2) / 40);
    case 'furthest': return Math.floor(Math.sqrt(d2) / 40);
    case 'strongest': return aimRel(aimTough(e));
    case 'weakest': return -aimRel(e.maxHp);
    case 'lowhp': return -aimRel(e.hp);
    case 'armour': return aimRel(aimTough(e)); // (retired id, reads as TOUGHEST)
    case 'fastest': return aimRel(e.speed);
    case 'cluster': return e.crowd || 0;
    case 'elite': return aimEliteTier(e);
    case 'shooters': return aimShootTier(e);
    case 'revenge': return e === G.grudge ? 1 : 0;
    case 'random': return Math.floor(Math.random() * 8);
    case 'ownmess': return aimOwnKey(e, d2); // (MY OWN MESS: aimat.js)
  }
  return 0;
}
const AIM_PAIRS = {};
function aimPair(dir, e, d2) {
  const pr = AIM_PAIRS[dir] || (AIM_PAIRS[dir] = dir.split('>'));
  return aimKey(pr[0], e, d2) * 1e9 + aimKey(pr[1], e, d2) * 1e4 - Math.sqrt(d2);
}
// Don't flick between near-equal targets every shot.
function aimSticky(w, t, range) {
  const o = w.lastTarget, p = G.player;
  if (!t || t === o || t.egg) return t;
  if (!o || o.dead || o.phased || o.charmed || o.egg || Math.hypot(o.x - p.x, o.y - p.y) > range) { w.aimT = G.t; return t; }
  if (w.dir === 'random') { if (G.t - (w.aimT || 0) < 1.5) return o; w.aimT = G.t; return t; }
  if (w.dir === 'furthest') return Math.hypot(o.x - p.x, o.y - p.y) >= Math.hypot(t.x - p.x, t.y - p.y) * 0.85 ? o : t;
  if (w.dir === 'cluster') return (o.crowd || 0) >= (t.crowd || 0) * 0.85 ? o : t;
  return t;
}

// ---------------------------------------------------------------- autorun
// The modes on offer here (no NEST in a campaign level: there is no egg to nest by).
function moveModes() { return MOVE_DIRECTIVES.filter(m => !(G && G.lvl && m.id === 'defend')); }
const arFoe = e => !e.dead && !e.phased && !e.charmed && !e.egg && !e.dummy;
// Threat near a point: enemies within r, bigger ones counting more.
function arThreat(x, y, r) {
  let n = 0;
  forNear(x, y, r, e => { if (arFoe(e)) n += e.boss ? 3 : e.elite ? 1.6 : 1; });
  return n;
}
const arRisk = (p, x, y) => arThreat(x, y, 140) + arThreat((p.x + x) / 2, (p.y + y) / 2, 110) * 0.6;
// The current mode; resets each mode's memory when it changes, or after you have steered by hand.
function arMode() {
  if (G.moveDir === 'defend' && G.lvl) G.moveDir = 'hold';
  const A = G.ar || (G.ar = { mode: null, t: -9 }), mode = G.moveDir;
  if (A.mode !== mode || G.t - A.t > 0.25) { G.ar = { mode, t: G.t, hold: null, orbit: null, hunt: null, huntT: 0, side: 0 }; }
  G.ar.t = G.t;
  return mode;
}
// Turn the same way round a point as we already are (so circling doesn't flip sides).
function arSide(p, dx, dy, d) {
  const A = G.ar;
  if (!A.side) A.side = Math.sign(Math.cos(p.hd || 0) * -dy / d + Math.sin(p.hd || 0) * dx / d) || 1;
  return A.side;
}
// Pickups and gems worth going for: best value for distance that isn't in trouble.
function arPickups(p, mode, goal) {
  const core = G.core, nest = mode === 'defend', collect = mode === 'collect';
  const ok = (x, y) => !nest || Math.hypot(x - core.x, y - core.y) < CORE.sanctuary + 120;
  const cap = collect ? 2.2 : 1.4;
  let homing = false;
  const cands = [];
  const reachU = collect ? 900 : 380;
  for (const u of G.pickups) { const d = Math.hypot(u.x - p.x, u.y - p.y); if (d < reachU && ok(u.x, u.y)) cands.push({ o: u, d, v: 6 / (d + 40) }); }
  cands.sort((a, b) => b.v - a.v);
  const bu = cands.slice(0, 4).find(c => arRisk(p, c.o.x, c.o.y) < cap);
  if (bu) {
    goal(bu.o.x, bu.o.y, mode === 'hold' ? 0.3 : 1.2);
    if (collect && bu.d < 200 && arThreat(p.x, p.y, 120) === 0) { homing = true; goal(bu.o.x, bu.o.y, 2.5); }
  }
  if (collect || mode === 'kite' || nest) {
    const reachG = collect ? 800 : 400, gs = [];
    for (const g of G.gems) { if (g.dead) continue; const d = Math.hypot(g.x - p.x, g.y - p.y); if (d < reachG && ok(g.x, g.y)) gs.push({ o: g, s: d / Math.sqrt(g.v) }); }
    gs.sort((a, b) => a.s - b.s);
    const bg = gs.slice(0, 4).find(c => arRisk(p, c.o.x, c.o.y) < cap);
    if (bg) goal(bg.o.x, bg.o.y, collect ? 1.1 : 0.45);
  }
  return homing;
}
// KITE: hold a band from the nearest enemy, sidestepping round the pack. The band scales to your reach (arReach), so
// what you kite stays in range; with nothing near it closes in, and with a boss alive it keeps the boss's edge in reach.
// (20 Oct: the fixed 240-360 band sat at or past the 300 reach cap, and the close-in branch could never run: bot boss
// fights put the boss in range about half the time and sent 14-42% of the damage to it.)
function arReach() {
  let r = 0;
  for (const w of G.weapons) if (w && w.s && w.s.range > r && !(typeof REACH_FREE !== 'undefined' && REACH_FREE.has(w.def.kind))) r = w.s.range;
  return r > 0 ? Math.max(150, r) : 300;
}
function arKite(p) {
  const R = arReach(), kIn = Math.min(AR.kiteIn, R * 0.65), kOut = Math.min(AR.kiteOut, R * 0.85), kFar = Math.min(AR.kiteFar, R * 0.95);
  let nd = Infinity, ne = null, wx = 0, wy = 0, wn = 0, boss = null;
  for (const e of G.enemies) {
    if (!arFoe(e)) continue;
    const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (d < nd) { nd = d; ne = e; }
    if (e.boss && !boss) boss = e;
    if (d < 420) { const k = (e.boss ? 3 : e.elite ? 1.6 : 1) / d; wx += dx * k / d; wy += dy * k / d; wn += k; }
  }
  if (!ne) return null;
  if (!wn) { if (G.lvl) return null; const l = nd || 1; return { x: (ne.x - p.x) / l * 0.6, y: (ne.y - p.y) / l * 0.6 }; } // nothing near: close in (not in campaign levels, where the route steers and the nearest enemy can be behind a wall)
  const al = Math.hypot(wx, wy) || 1, ax = wx / al, ay = wy / al, side = arSide(p, -ax, -ay, 1);
  let gx = -ay * side * 0.5, gy = ax * side * 0.5; // sidestep
  if (nd < kIn) { const k = Math.min(1.3, (kIn - nd) / 80 + 0.35); gx += ax * k; gy += ay * k; }
  else if (nd < kOut) { gx += ax * 0.1; gy += ay * 0.1; }
  else if (nd > kFar) { gx -= ax * 0.35; gy -= ay * 0.35; }
  if (boss) { // keep the boss's edge in reach (the pack push above still keeps you off whatever is closest)
    const bx = boss.x - p.x, by = boss.y - p.y, bd = Math.hypot(bx, by) || 1, edge = bd - (boss.r || 0);
    if (edge > R * 0.85 && nd > kIn * 0.8) { gx += bx / bd * 0.5; gy += by / bd * 0.5; }
  }
  return { x: gx, y: gy };
}
// ORBIT: the cluster we are circling (its middle, size and spread), kept until it is worth changing.
function arCluster(cx, cy, r) {
  let x = 0, y = 0, n = 0;
  forNear(cx, cy, r, e => { if (arFoe(e)) { x += e.x; y += e.y; n++; } });
  if (!n) return null;
  x /= n; y /= n;
  let sp = 0;
  forNear(x, y, r, e => { if (arFoe(e)) sp += Math.hypot(e.x - x, e.y - y); });
  return { x, y, n, spread: sp / n };
}
function arBestCluster(p) {
  let seed = null, sc = 0;
  for (const e of G.enemies) {
    if (!arFoe(e) || (e.crowd || 0) <= sc) continue;
    if (Math.hypot(e.x - p.x, e.y - p.y) < 700) { seed = e; sc = e.crowd; }
  }
  return seed ? arCluster(seed.x, seed.y, 170) : null;
}
function arOrbit(p) {
  const A = G.ar;
  let c = A.orbit ? arCluster(A.orbit.x, A.orbit.y, 200) : null;
  if (!c || c.n < 3 || Math.hypot(c.x - p.x, c.y - p.y) > 800) { c = arBestCluster(p); A.orbitT = G.t; }
  else if (G.t - (A.orbitT || 0) > AR.orbitEvery) {
    A.orbitT = G.t;
    const b = arBestCluster(p);
    if (b && b.n >= c.n * AR.orbitBetter && Math.hypot(b.x - c.x, b.y - c.y) > 200) c = b;
  }
  A.orbit = c;
  if (!c) return null;
  const dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1, side = arSide(p, -dx, -dy, d);
  const R = clamp(c.spread + 160, 180, 380);
  return { x: -dy / d * side * 1.0 + dx / d * (R - d) / 200, y: dx / d * side * 1.0 + dy / d * (R - d) / 200 };
}
// HUNT: one target for the legs (each weapon still aims by its own directive).
function arHuntPick(p) {
  let best = null, bv = -Infinity;
  for (const e of G.enemies) {
    if (!arFoe(e)) continue;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d > AR.huntR) continue;
    const v = aimEliteTier(e) * 1e5 - d;
    if (v > bv) { bv = v; best = e; }
  }
  return best;
}
function arHunt(p) {
  const A = G.ar;
  let t = A.hunt;
  if (!t || !arFoe(t) || Math.hypot(t.x - p.x, t.y - p.y) > AR.huntLose) { t = arHuntPick(p); A.huntT = G.t; }
  else if (G.t - A.huntT > 1) { A.huntT = G.t; const b = arHuntPick(p); if (b && aimEliteTier(b) > aimEliteTier(t)) t = b; } // (a boss turning up outranks the crawler you were after)
  A.hunt = t;
  return t;
}
// Per-mode goals, added into autoSteer's goal vector. Returns whether we are homing on a pickup.
function arGoal(p, mode, goal, add) {
  const homing = arPickups(p, mode, goal);
  if (mode === 'kite') { const k = arKite(p); if (k) add(k.x, k.y); }
  if (mode === 'orbit') { const o = arOrbit(p) || arKite(p); if (o) add(o.x, o.y); }
  if (mode === 'hunt') {
    const t = arHunt(p);
    if (t) {
      const dx = t.x - p.x, dy = t.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (d > 130) goal(t.x, t.y, 1.2);
      else { const side = arSide(p, dx, dy, d); add(-dy / d * side * 1.0 - dx / d * 0.2, dx / d * side * 1.0 - dy / d * 0.2); } // (close: sweep past it, don't back off)
    }
  }
  if (mode === 'hold') {
    const A = G.ar, h = A.hold || (A.hold = { x: p.x, y: p.y }), d = Math.hypot(h.x - p.x, h.y - p.y);
    if (d > AR.holdR) goal(h.x, h.y, Math.min(1.5, (d - AR.holdR) / 80 + 0.2));
  }
  if (mode === 'defend') {
    const core = G.core, cd = Math.hypot(p.x - core.x, p.y - core.y) || 1;
    if (cd > CORE.sanctuary * 0.8) goal(core.x, core.y, 1.4);
    else add(-(p.y - core.y) / cd * 0.5, (p.x - core.x) / cd * 0.5);
  }
  return homing;
}
