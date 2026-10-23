'use strict';
// Spawn Prawn - level-up boxes are things on the slide (user, 23 Oct): a level-up drops a box 120 to 300 away from you,
// inside the arena and off hazards. Swim into it and its screen opens at once: no Reward Director gap, no Race schedule
// slot, no wave-break hold (the request goes to the front of the queue with now set).
//  - Every level request is converted, except the Race's milestone screens (raceplan.js mstone) and the Sandbox / Lab Bench.
//  - The boxes never expire; a gold ring pulses round each so they read as loot, not a power-up.
//  - Tests and sims (window.TUT_OFF) keep level-ups as screens unless LVBOX.force.
// Hooks: none in shared files. Wraps game.js applyPickup; weapons24.js wupTick; v10.js v10Draw. Adds POWERUPS.lvbox.
// Loads after raceplan.js (it turns off raceplan's empty-slot screens: RPLAN.fill).

const LVBOX = { min: 120, max: 300, force: false };
POWERUPS.lvbox = { name: 'LEVEL UP', letter: 'LV', color: '#ffd23f', desc: 'A level-up box' };
const lvboxOn = () => !!G && !G.debug && !(typeof window !== 'undefined' && window.TUT_OFF && !LVBOX.force);
if (typeof RPLAN !== 'undefined') RPLAN.fill = false;

function lvboxSpot() {
  const p = G.player, c = G.core || { x: 0, y: 0 }, R = (CORE.arena || 2400) - 120;
  let x = p.x, y = p.y;
  for (let i = 0; i < 24; i++) {
    const a = Math.random() * TAU, d = rand(LVBOX.min, LVBOX.max);
    x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d;
    const dc = Math.hypot(x - c.x, y - c.y); if (dc > R) { x = c.x + (x - c.x) / dc * R; y = c.y + (y - c.y) / dc * R; }
    if (G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y)) continue;
    if (typeof terrainDanger !== 'function' || !terrainDanger(x, y, 40)) break;
  }
  return { x, y };
}
// Each frame: level requests in the queue become boxes on the slide.
function lvboxTick() {
  if (!lvboxOn() || G.state !== 'play') return;
  for (let i = G.lootQueue.length - 1; i >= 0; i--) {
    const q = G.lootQueue[i];
    if (q.kind !== 'level' || q.mstone || q.lvbox) continue;
    G.lootQueue.splice(i, 1);
    const s = lvboxSpot(), u = makePickup('lvbox', s.x, s.y, { req: q });
    u.life = 1e9; G.pickups.push(u);
    ring(s.x, s.y, 30, '#ffd23f', 0.5, 3);
  }
}
wupTick = (orig => function (dt) { orig(dt); if (G) lvboxTick(); })(wupTick);
applyPickup = (orig => function (type, src) {
  if (type !== 'lvbox') return orig(type, src);
  G.stats.pickups = (G.stats.pickups || 0) + 1; sfx('pickup');
  const q = Object.assign({}, (src && src.req) || { kind: 'level' }, { lvbox: true, now: true });
  G.lootQueue.unshift(q);
})(applyPickup);
v10Draw = (orig => function () { // a gold ring pulsing round each box
  orig();
  if (!G) return;
  for (const u of G.pickups) {
    if (u.dead || u.type !== 'lvbox') continue;
    const k = 0.5 + 0.5 * Math.sin(G.realT * 5 + u.bob);
    ctx.save(); ctx.strokeStyle = col('#ffd23f'); ctx.globalAlpha = 0.35 + 0.4 * k; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(sx(u.x), sy(u.y), (18 + 6 * k) * S, 0, TAU); ctx.stroke(); ctx.restore();
  }
})(v10Draw);
