'use strict';
// Spawn Prawn - range and trick shots. The fight is meant to happen on screen, so:
//  - Falloff: a shot's damage is full out to about the edge of the normal view, then fades to 40% at twice that.
//    Fast projectiles hold their damage further out (up to 1.8x), and homing shots ignore falloff altogether.
//  - Sniper: a fast projectile (640+ speed) that lands beyond 450 hits 50% harder. SNIPED.
//  - Slingshot: your shots bend round gravity (Toddler Gravity orbs and pulling zones such as the Black Hole). A
//    shot that whips most of the way round one flies out 60% faster and hits 80% harder, in a direction that is
//    hard to predict. Slow shots that stray too close fall in instead (and feed it).
// Hooks: aimMul (projectile hits), aimHoles (start of updateProjectiles), aimBend (each projectile).
const AIM = { view: 380, floor: 0.4, snipeSpeed: 640, snipeAt: 450, maxHoles: 8 };
function aimMul(pr, e) {
  if (!pr.w || pr.w.isSpell) return 1;
  const o = G.realPlayer || G.player, d = Math.hypot(e.x - o.x, e.y - o.y), sp = pr.speed || 0;
  let m = 1;
  if (!pr.homing && !pr.slung) {
    const R0 = AIM.view * clamp(sp / 450, 1, 1.8);
    if (d > R0) m *= Math.max(AIM.floor, 1 - (d - R0) / R0 * (1 - AIM.floor));
  }
  if (sp >= AIM.snipeSpeed && d > AIM.snipeAt) {
    m *= 1.5;
    if (!(G.snipeSayT > G.t)) { G.snipeSayT = G.t + 1.5; floatText(e.x, e.y - e.r - 14, 'SNIPED', '#e8f0ff', 13, 0.7); }
  }
  return m;
}
// Once a frame: the gravity wells on the slide.
function aimHoles() {
  const H = G.aimHoles || (G.aimHoles = []);
  H.length = 0;
  for (const pr of G.proj) if (!pr.dead && pr.style === 'void' && H.length < AIM.maxHoles) H.push({ x: pr.x, y: pr.y, R: Math.max(90, (pr.aura || 70) * 1.6), core: Math.max(8, pr.r * 0.8), src: pr });
  for (const z of G.zones) if (z.pull > 0 && H.length < AIM.maxHoles) H.push({ x: z.x, y: z.y, R: z.r * 1.5, core: Math.max(10, z.r * 0.18), src: z });
  return H.length;
}
// Each of your projectiles, each frame (before it moves).
function aimBend(pr, dt) {
  const H = G.aimHoles;
  if (!H || !H.length || pr.lob || pr.mine || pr.style === 'void' || pr.orbitT > 0 || pr.hanging || !pr.w) return;
  for (const h of H) {
    const dx = h.x - pr.x, dy = h.y - pr.y, d = Math.hypot(dx, dy);
    if (d > h.R) { if (pr.slingH === h.src && pr.slingTurn > 1.3 && !pr.slung) aimSling(pr); continue; }
    const sp = Math.hypot(pr.vx, pr.vy) || 1;
    // Slow shots that come too close fall in, and feed it.
    if (d < h.core && sp < 520) {
      pr.dead = true; spawnPart(pr.x, pr.y, '#c77dff', 2, 60, 0.3);
      if (h.src.mass != null) h.src.mass = Math.min(h.src.mass + 0.05, 40); else if (h.src.dps != null) h.src.dps *= 1.002;
      return;
    }
    // Bend towards it: harder the closer you pass, gentler the faster you are going.
    const want = Math.atan2(dy, dx), cur = Math.atan2(pr.vy, pr.vx);
    let da = want - cur; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    const turn = clamp(da, -1, 1) * (1 - d / h.R) * 6 * dt * Math.min(1.6, 500 / sp + 0.3);
    const na = cur + turn;
    pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp;
    if (pr.slingH !== h.src) { pr.slingH = h.src; pr.slingTurn = 0; }
    pr.slingTurn += Math.abs(turn);
    pr.life += dt * 0.6; // (curving round it buys a little flight time)
  }
}
function aimSling(pr) {
  pr.slung = true;
  const sp = Math.hypot(pr.vx, pr.vy) * 1.6, a = Math.atan2(pr.vy, pr.vx) + (Math.random() - 0.5) * 0.8;
  pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; pr.speed = sp; pr.dmg *= 1.8; pr.life = Math.max(pr.life, 0.9); pr.hits = null;
  if (pr.r) pr.r *= 1.2;
  ring(pr.x, pr.y, 18, '#c77dff', 0.3, 2);
  if (!(G.slingSayT > G.t)) { G.slingSayT = G.t + 1.2; floatText(pr.x, pr.y - 16, 'SLINGSHOT', '#c77dff', 13, 0.7); }
}
