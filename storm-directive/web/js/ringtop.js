'use strict';
// Spawn Prawn - enemy rings on top (user, 24 Oct): every ring round an enemy (status rings and their timers, render.js
// drawEnemy; defence rings, build-up bars and status marks, fight.js fightDraw) draws after explosions and effects,
// so a blast never hides them. Enemy bullets still draw over the rings.
// render.js sets RING_DEFER while it draws the enemies; drawEnemy hands its ring block to ringLater, which runs it at
// once anywhere else (pictures, the Field Guide) and otherwise queues it for ringsOnTop.
// Hooks: render.js render -> RING_DEFER on/off round the enemies, ringsOnTop after the fx layer; drawEnemy -> ringLater.
// v10.js v10Draw no longer calls fightDraw (ringsOnTop does). Loads after fight.js.

let RING_DEFER = false;
const RING_Q = [];
function ringLater(fn) { if (RING_DEFER) RING_Q.push(fn); else fn(); }
function ringsOnTop() {
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  for (const fn of RING_Q) { try { fn(); } catch (e) { /* (one bad ring must not stop the frame) */ } }
  RING_Q.length = 0;
  ctx.globalAlpha = 1;
  if (G && typeof fightDraw === 'function') fightDraw();
  ctx.globalAlpha = 1; ctx.lineWidth = 1;
}
