'use strict';
// Spawn Prawn - Piercing fixes (user, 23 Oct).
//  - HOMING + PIERCING: a homing shot that passes through an enemy picks a new target it has not hit yet (it used to
//    keep steering at the one it had just pierced and curl back round it). None left in reach: it flies straight on.
//  - A VISIBLE PIERCE: each pass-through sprays sparks out of the far side in the shot's direction, with a small flash.
//  - HOMING DELAY: the Homing modifier steers a shot only from 0.2 s after it is fired (a spread fans out first).
// Hooks: none in shared files. Wraps modifiers.js modHit (called by game.js after a shot's hit) and modStep. Loads after areamod.js.

const PIERCE = { reach: 380 };
modHit = (orig => function (pr, e) {
  const through = pr.mP && pr.pierce > 0;
  orig(pr, e);
  if (!through || pr.dead) return;
  // the flash on the far side
  const sp = Math.hypot(pr.vx, pr.vy) || 1, ux = pr.vx / sp, uy = pr.vy / sp, x = e.x + ux * (e.r || 10), y = e.y + uy * (e.r || 10);
  fxParts('spark', x, y, pr.color || '#ffffff', 6, 240, 0.25, 2.5, Math.atan2(uy, ux), 0.35);
  ring(x, y, 7, pr.color || '#ffffff', 0.18, 2);
  // homing: on to an enemy it has not hit yet
  if (pr.mH || pr.homing) {
    const done = new Set(pr.hits || []); done.add(e.id);
    let best = null, bd = PIERCE.reach;
    for (const o of G.enemies) {
      if (o.dead || o.charmed || o.egg || done.has(o.id)) continue;
      const d = Math.hypot(o.x - pr.x, o.y - pr.y); if (d < bd) { bd = d; best = o; }
    }
    if (best) { pr.tgt = best; pr.mHlost = 0; } else { pr.tgt = null; pr.mHlost = 1; pr.homing = 0; }
  }
})(modHit);

// ---------------------------------------------------------------- Homing kicks in a moment after firing (user, 23 Oct)
// For HOMING.delay after it leaves, a shot flies as fired (so a spread still fans out), then the Homing modifier steers
// it at the nearest enemy to the shot. Weapons that home by design (their own stat, game.js pr.homing) are unchanged.
const HOMING = { delay: 0.2 };
modStep = (orig => function (pr, dt) {
  const h = pr.mH; if (!h) return orig(pr, dt);
  if (pr.mHt0 == null) pr.mHt0 = G.t;
  if (G.t - pr.mHt0 >= HOMING.delay) return orig(pr, dt);
  pr.mH = 0; try { return orig(pr, dt); } finally { pr.mH = h; }
})(modStep);
