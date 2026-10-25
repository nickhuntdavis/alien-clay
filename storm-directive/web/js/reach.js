'use strict';
// Spawn Prawn - Reach and proximity (redesign docs/COMBAT_MATRIX.md 15.5). Range and Up Close are now offered on every
// attack type (modwide.js MW_NEW atk lists), and both are Tempo modifiers, so a weapon takes one or the other.
//  - Range scales the reach of whatever the weapon does, never damage: Projectile and Spread keep the speed and falloff ramp
//    (modwide.js p11Range), beams keep their +20% length a rank, and here 1 + 0.2 a rank (reachMul) also scales Burst and
//    Exploding-round blast radius, Pool radius, Contact reach, mine trigger radius (modwide.js), gravity well radius, chain
//    jump range and orbit radius. reachK is the same number for Burst, Pool and Contact weapons and 1 for the rest.
//  - Up Close scales damage by the target's distance from you (modwide.js p11Range): the Pool's ticks (zoneHit) skipped it,
//    so they use the same curve here.
//  - Not scaled (hard-coded outside the shared tables): Pet leash (wup3.js w3PetTick, 300) and Nappy Mines' trigger (game.js).
// Hooks: none in shared files (modwide.js reads reachMul in the mine trigger line). Wraps game.js aoe and ring, modifiers.js
// modWell, modChain and modOrbit (the Chain Letter and Hangers-On caps are swapped for one call), weapons24.js wupStats and
// wupTick, power11.js p11Range. Loads last, after areamod.js (reach and Area multiply).

const reachMul = w => (typeof mwR === 'function' && w && w.m10 ? 1 + 0.2 * mwR(w, 'range') : 1);
const reachK = w => { const a = w && w.def && w.def.v10atk; return a === 'proj' || a === 'spread' ? 1 : reachMul(w); };

let REACH_LAST = null; // (the last scaled blast: its ring is scaled too)
aoe = (orig => function (x, y, r, dmg, src, color) {
  const k = reachMul(src && src.w);
  if (k > 1 && !(src && src.noArea)) { r *= k; REACH_LAST = { x, y, k, f: G.frameN }; }
  return orig(x, y, r, dmg, src, color);
})(aoe);
ring = (orig => function (x, y, r, color, life, width) {
  const L = REACH_LAST;
  if (L && G && L.f === G.frameN && L.x === x && L.y === y) r *= L.k;
  return orig(x, y, r, color, life, width);
})(ring);
modWell = (orig => function (x, y, r, pull, life, w, bodies, shots) { return orig(x, y, r * reachMul(w), pull, life, w, bodies, shots); })(modWell);
wupStats = (orig => function (w, s) {
  orig(w, s);
  const k = reachK(w); if (k === 1) return;
  if (w.def && w.def.v10atk === 'contact' && s.range) s.range *= k; // (contact reach)
})(wupStats);
wupTick = (orig => function (dt) { // pools: grow each new zone that this weapon made
  orig(dt);
  if (!G || G.state !== 'play') return;
  for (let i = G.zones.length - 1; i >= 0 && i >= G.zones.length - 40; i--) {
    const z = G.zones[i]; if (z.reachSeen) break;
    z.reachSeen = 1; const k = z.src && z.src.w ? reachMul(z.src.w) : 1; if (k > 1) z.r *= k;
  }
})(wupTick);

// modV is a const read straight off MODS10[id].cap, so the two distance caps are swapped for the length of one call.
const reachCap = (id, key, k, fn) => {
  const c = MODS10[id].cap, v = c[key];
  c[key] = Array.isArray(v) ? v.map(x => x * k) : v * k;
  try { return fn(); } finally { c[key] = v; }
};
modChain = (orig => function (from, dmg, src) {
  const k = reachMul(src && src.w);
  return k === 1 ? orig(from, dmg, src) : reachCap('chaining', 'range', k, () => orig(from, dmg, src));
})(modChain);
modOrbit = (orig => function (w, dt) {
  const k = reachMul(w);
  return k === 1 ? orig(w, dt) : reachCap('orbiting', 'radius', k, () => orig(w, dt));
})(modOrbit);

// Up Close on a Pool: its ticks are zone hits, which p11Range leaves alone, so ask it again as if they were plain hits.
p11Range = (orig => function (e, src) {
  const w = src && src.w;
  if (w && G && G.mwAny && src.zoneHit && !src.dot && !src.rx && !src.echo && !src.fromAlly && mwR(w, 'upclose') && !mwR(w, 'range'))
    return orig(e, Object.assign({}, src, { zoneHit: false }));
  return orig(e, src);
})(p11Range);
