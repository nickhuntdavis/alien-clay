'use strict';
// Spawn Prawn - the pool weapons thrown as water balloons (redesign docs/MODIFIER_MATRIX.md 5.10, COMBAT_MATRIX decision 63).
//  - Nocturnal Emission (v_ice_pool) and Hot Mess (v_flame_pool) throw a balloon at one enemy (the face): fireWeapon tags
//    each new lob of theirs with the enemy it was aimed at, and the balloon follows that enemy in flight, so it lands on
//    the face even if it moved. If the face dies first, the balloon lands where it last was.
//  - It bursts on landing: a splash ring, droplets flung outward and a scrap or two of rubber, then the weapon's normal
//    landing (game.js landLob: the face and its neighbours take the hit, the puddle settles round the face). Damage and
//    puddle numbers are unchanged; only aim and look are new.
//  - Drawn as a wobbling balloon with a knot (render.js), not a droplet.
// Hooks: render.js lob drawing -> blDraw. hooks.js fire:after; wraps game.js updateProjectiles, landLob. Loads after cellmods2.js.

const BL_IDS = ['v_ice_pool', 'v_flame_pool'];
const BL_JUMP = 40; // (a face that moves further than this in one frame has blinked or been thrown: let it go)
const BL_DRIFT = 260; // (a balloon follows its face this far from where it was aimed, then lands where it is)
const blIs = w => !!(w && BL_IDS.includes(w24Key(w)));
const blAlive = e => !!(e && !e.dead && e.hp > 0);

SOUNDS.splat = [0.07, t => { const r = jit(0.12); vNoise(t, 0.09, 'bandpass', 900 * r, 260, 0.9, 0.07); vNoise(t + 0.02, 0.12, 'lowpass', 1800 * r, 500, 0.6, 0.04); vTone(t, 320 * r, 90, 0.06, 0.03, 'sine'); }];

// Tag the lobs a pool weapon just threw with the enemy each is aimed at.
hookOn('fire:after', 'balloon:face', (w, target, n) => {
  if (!G || !blIs(w)) return;
  for (let i = n; i < G.proj.length; i++) {
    const pr = G.proj[i];
    if (!pr.lob || pr.bl || pr.w !== w) continue;
    let face = target && blAlive(target) && Math.hypot(target.x - pr.tx, target.y - pr.ty) < 8 ? target : null;
    if (!face) forNear(pr.tx, pr.ty, 60, e => { if (blAlive(e) && (!face || Math.hypot(e.x - pr.tx, e.y - pr.ty) < Math.hypot(face.x - pr.tx, face.y - pr.ty))) face = e; });
    pr.bl = { face, ox: pr.tx, oy: pr.ty, dx: face ? pr.tx - face.x : 0, dy: face ? pr.ty - face.y : 0, seed: Math.random() * TAU };
  }
}, 10);

// In flight, the landing spot follows the face (game.js moves the balloon between the thrower and tx, ty).
updateProjectiles = (orig => function (dt) {
  for (const pr of G.proj) {
    const b = pr.bl;
    if (!b || pr.dead || !pr.lob || !b.face) continue;
    if (!blAlive(b.face)) { b.face = null; continue; }
    if (b.fx != null && Math.hypot(b.face.x - b.fx, b.face.y - b.fy) > BL_JUMP) { b.face = null; continue; } // (it teleported: the balloon can't follow)
    b.fx = b.face.x; b.fy = b.face.y;
    const tx = b.face.x + b.dx, ty = b.face.y + b.dy;
    if (Math.hypot(tx - b.ox, ty - b.oy) > BL_DRIFT) { b.face = null; continue; }
    pr.tx = tx; pr.ty = ty;
  }
  return orig(dt);
})(updateProjectiles);

// The burst, then the normal landing.
landLob = (orig => function (pr) {
  if (pr && pr.bl) blBurst(pr);
  return orig(pr);
})(landLob);
function blBurst(pr) {
  const x = pr.tx, y = pr.ty, c = pr.color || (pr.w && pr.w.def && pr.w.def.color) || '#9be15d', R = (pr.w && pr.w.s && pr.w.s.area) || 58;
  ring(x, y, R * 0.45, c, 0.22, 6); ring(x, y, R * 0.85, c, 0.35, 2);
  fxParts('drop', x, y, c, 14, 210, 0.45, 3.5);
  fxParts('drop', x, y, '#ffffff', 4, 140, 0.3, 2);
  fxParts('shard', x, y, c, 2, 120, 0.5, 4); // (scraps of balloon)
  sfx('splat');
}

// A balloon: a round body that wobbles and leans along its flight, a knot at the back and a shine.
// Returns true when it drew (render.js then skips the droplet).
function blDraw(pr, x, y, r) {
  if (!pr.bl) return false;
  const b = pr.bl, k = Math.min(1, pr.t / (pr.flight || 0.55));
  const vx = pr.tx - pr.sx, vy = (pr.ty - pr.sy) - Math.cos(k * Math.PI) * 180; // (direction of travel, arc included)
  blShape(x, y, r * 1.6 * (pr.w && pr.w.s && pr.w.s.blSize || 1), Math.atan2(vy, vx), pr.color, b.seed); // (a balloon reads bigger than a droplet)
  return true;
}
// The balloon itself, in screen space (also used by cellmods4.js for balloons that wait on the floor, circle you or swell).
function blShape(x, y, r, a, c, seed) {
  const wob = Math.sin(G.t * 26 + (seed || 0)) * 0.12, rx = r * (1.25 + wob), ry = r * (1.05 - wob);
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-rx * 0.92, 0); ctx.lineTo(-rx - r * 0.45, -r * 0.32); ctx.lineTo(-rx - r * 0.45, r * 0.32); ctx.closePath(); ctx.fill(); // (the knot)
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(1, r * 0.18); ctx.beginPath(); ctx.moveTo(-rx - r * 0.4, 0);
  ctx.quadraticCurveTo(-rx - r * 0.9, Math.sin(G.t * 18 + (seed || 0)) * r * 0.5, -rx - r * 1.5, 0); ctx.stroke(); // (a bit of string)
  ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.ellipse(rx * 0.3, -ry * 0.4, rx * 0.28, ry * 0.18, -0.4, 0, TAU); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}
