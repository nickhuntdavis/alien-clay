'use strict';
// Spawn Prawn - Area, a weapon modifier (user, 23 Oct): everything the weapon does over an area gets bigger. +25% a rank
// (+25/50/75%; mastery +100%). Like every modifier it sits on one weapon, chosen when the card is dealt.
//  - Covered: explosions and blasts (game.js aoe with that weapon's source: bursts, Exploding Rounds, Death from Above,
//    Mines, Ranged, Exploding shots...), the pools it leaves (zones with its source), Contact reach and the Melee
//    modifier's reach, beam width, aura shots, Pulling's reach, Knockback's Repulsor wave and gravity wells.
//  - Its own group, Area (modmatrix.js MM_GROUP), so it competes only for a slot, never with another modifier's group.
//  - Visuals: a ring drawn on the same spot in the same frame as a scaled blast is scaled to match.
// Hooks: none in shared files. Wraps game.js aoe and ring, modifiers.js modWell, weapons24.js wupStats and wupTick;
// modwide.js reads areaK (Melee reach, Pulling, Repulsor). Loads after atkswap.js.

MODS10.area = { name: 'Area', desc: 'Everything this weapon does over an area is bigger: blasts, pools, melee reach, pulls and pushes. +25% area.', atk: MOD_ALL.slice(), max: 3, cap: {} };
MODUP.area = ['+50% area.', '+75% area.'];
MM_GROUP.area = 'area'; MM_GNAME.area = 'Area';
if (typeof MATRIX_ONLY !== 'undefined') MATRIX_ONLY.mods.push('area');
if (typeof SLICE !== 'undefined') SLICE.mods.push('area');
if (typeof SLICE_COPY !== 'undefined') SLICE_COPY.mastery_area = 'Mastery: +100% area.';
const areaK = w => { const n = w && w.m10 ? modCount(w, 'area') : 0; return 1 + 0.25 * Math.min(4, n); };

wupStats = (orig => function (w, s) {
  orig(w, s);
  const k = areaK(w); if (k === 1) return;
  const a = w.def && w.def.v10atk;
  if (a === 'contact' && s.range) s.range *= k; // (melee reach)
  if (a === 'beam' && s.width) s.width *= k;
  if (s.aura) s.aura *= k;
})(wupStats);
let AREA_LAST = null; // (the last scaled blast: its ring is scaled too)
aoe = (orig => function (x, y, r, dmg, src, color) {
  const k = areaK(src && src.w);
  if (k > 1 && !(src && src.noArea)) { r *= k; AREA_LAST = { x, y, k, f: G.frameN }; }
  return orig(x, y, r, dmg, src, color);
})(aoe);
ring = (orig => function (x, y, r, color, life, width) {
  const L = AREA_LAST;
  if (L && G && L.f === G.frameN && L.x === x && L.y === y) r *= L.k;
  return orig(x, y, r, color, life, width);
})(ring);
modWell = (orig => function (x, y, r, pull, life, w, bodies, shots) { return orig(x, y, r * areaK(w), pull, life, w, bodies, shots); })(modWell);
wupTick = (orig => function (dt) { // pools: grow each new zone that this weapon made
  orig(dt);
  if (!G || G.state !== 'play') return;
  for (let i = G.zones.length - 1; i >= 0 && i >= G.zones.length - 40; i--) {
    const z = G.zones[i]; if (z.areaSeen) break;
    z.areaSeen = 1; const k = z.src && z.src.w ? areaK(z.src.w) : 1; if (k > 1) z.r *= k;
  }
})(wupTick);
