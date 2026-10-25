'use strict';
// Spawn Prawn - the two roster shooters with tells (ENEMY_HANDOFF B3; COMBAT_MATRIX 13: Spread rolls per pellet, a fan's angle must be readable).
//   Cytokine Caster  holds 190 to 280 from you. 0.5 s fan outline (aim locked when the tell starts), then 5 Acid shots over 70 degrees.
//   Diatom           slow, holds range. 0.4 s ring outline with a tick for each shot, then a full ring of 6 (offset locked at the tell).
// Both stand still while the tell shows. Damage, count, arc, speed and cd come from ROSTER[id].atk[0]; the roster rows carry no `shoot`.
// Hooks: render.js v10Draw -> nf10Draw is wrapped here for the outlines. AI rides FOE_AI (game.js updateEnemies default branch).
// Save data: none.

function s10Shoot(e, a) { // the volley itself: through eBullet so caps, scaling and typed bullets stay the same
  if (e.soapT > G.t && !e.boss) return;
  if (G.nf && nfNoFire(e)) return;
  const A = e.def.atk[0], bd = A.dmg * dmgNow(), n = A.count;
  shooterName = e.name; shooterEnt = e;
  for (let i = 0; i < n; i++) {
    const ang = A.arc >= 360 ? a + i / n * TAU : a + (i - (n - 1) / 2) * (A.arc * Math.PI / 180 / (n - 1));
    eBullet(e.x, e.y, ang, A.speed, bd, 5, e.def.color);
  }
}
function s10Shooter(e, dt, dist, ux, uy, dx, dy) {
  const A = e.def.atk[0];
  if (e.s10T > 0) { // the tell: stand still, then fire along the locked aim
    e.s10T -= dt;
    if (e.s10T <= 0) { s10Shoot(e, e.s10A); e.shootCd = A.cd * rand(0.85, 1.15) / fireMul(PT()) / G.evm.fire * V10_DIFF.fireGap; }
    return { x: 0, y: 0, s: 0 };
  }
  e.shootCd -= dt;
  if (e.shootCd <= 0 && dist < 520) {
    e.s10T = A.tele; e.s10Tot = A.tele;
    e.s10A = A.arc >= 360 ? Math.random() * TAU : Math.atan2(dy, dx);
  }
  if (dist > 280) return { x: ux, y: uy };
  if (dist < 190) return { x: -ux, y: -uy };
  return { x: -uy * e.side, y: ux * e.side };
}
FOE_AI.new_caster = s10Shooter;
FOE_AI.new_diatom = s10Shooter;
// newfoes.js wired the roster before these AIs existed: restore the two rows' AI and drop the old shoot row.
for (const id of ['warlock', 'diatom']) if (ENEMIES[id] && ROSTER[id]) { ENEMIES[id].ai = ROSTER[id].ai; delete ENEMIES[id].shoot; }

const s10Prev = nf10Draw;
nf10Draw = function () {
  s10Prev();
  if (!G) return;
  for (const e of G.enemies) {
    if (e.dead || !(e.s10T > 0) || !/^new_(caster|diatom)$/.test(e.def.ai)) continue;
    const A = e.def.atk[0], k = 1 - e.s10T / e.s10Tot, x = sx(e.x), y = sy(e.y), L = 300 * S;
    ctx.save();
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.realT * 25) ** 2; ctx.strokeStyle = e.def.color; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]);
    if (A.arc >= 360) {
      ctx.beginPath(); ctx.arc(x, y, L * 0.5, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < A.count; i++) { const a = e.s10A + i / A.count * TAU; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * e.r * S, y + Math.sin(a) * e.r * S); ctx.lineTo(x + Math.cos(a) * L * 0.5, y + Math.sin(a) * L * 0.5); ctx.stroke(); }
      ctx.globalAlpha = 0.08 + 0.15 * k; ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.arc(x, y, L * 0.5 * k, 0, TAU); ctx.fill();
    } else {
      const h = A.arc * Math.PI / 360;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, L, e.s10A - h, e.s10A + h); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.08 + 0.15 * k; ctx.fillStyle = e.def.color; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, L * k, e.s10A - h, e.s10A + h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
};
