'use strict';
// Spawn Prawn - big bursts of hits spread over a few frames (user, 28 Oct: the lag when you crash into a crowd).
// A Headstrong shockwave or a chain into a pack lands 30+ hits, and their kills, in one frame: 40 to 90 ms on a
// desktop, several times that on a phone (tests/sim/crowdbench.js CRASH=1). Past HS.budget hits a frame, a hit is
// held and lands at the start of the next frame's tick, oldest first, up to HS.budget again: the burst plays out as a
// ripple over 2 to 4 frames. Damage, kills and credit are unchanged; only when they land.
//  - Not held: damage over time (src.dot), hits outside play, and everything once HS.cap hits are waiting (a failsafe).
//  - A held hit returns 0 to its caller (a few callers count damage dealt: they undercount a burst slightly).
//  - Off in tests and sims (window.TUT_OFF), as matrixonly.js, unless window.HS_FORCE: they check health right after a hit.
// Hooks: hookOn hit:before (order 0: before decoys and the rest), tick. Save data: none.

const HS = { on: true, budget: 12, cap: 240, q: [], f: -1, n: 0, g: null, replay: false };
const hsFrame = () => { if (HS.g !== G) { HS.g = G; HS.q.length = 0; } if (HS.f !== G.frameN) { HS.f = G.frameN; HS.n = 0; } }; // (a new run drops what was waiting)
const hsOn = () => HS.on && !(window.TUT_OFF && !window.HS_FORCE);
hookOn('hit:before', 'hitspread:hold', (e, dmg, src) => {
  if (HS.replay || !hsOn() || !G || G.state !== 'play' || (src && src.dot) || e.dead) return false;
  hsFrame();
  if (++HS.n <= HS.budget || HS.q.length >= HS.cap) return false;
  HS.q.push([e, dmg, src]);
  return true;
}, 0);
hookOn('tick', 'hitspread:land', () => {
  if (!HS.q.length) return;
  hsFrame(); if (!HS.q.length) return;
  const k = Math.min(HS.q.length, HS.budget), batch = HS.q.splice(0, k);
  HS.replay = true;
  try { for (const [e, dmg, src] of batch) if (!e.dead) damageEnemy(e, dmg, src); } finally { HS.replay = false; }
  HS.n += k;
});
