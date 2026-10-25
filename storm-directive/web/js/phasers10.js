'use strict';
// Spawn Prawn - Ghost Swimmer and Quantum Swimmer (ENEMY_HANDOFF B5, COMBAT_MATRIX 3 and 13). Loads after newfoes.js.
//  - Ghost Swimmer: phasing is Evasion, not immunity. While e.phased it stays targetable and takes hits (its Evasion
//    defence still rolls its miss chance), its contact is off (game.js), and it flickers; the last 0.4 s of its solid
//    spell flickers too, as the tell (roster.js `phase.tele`).
//  - Quantum Swimmer: picks the landing spot first, draws a puff there for 0.4 s, then jumps; at most one jump per 2 s.
// Hooks: game.js 'blink' case -> qsBlink; render.js enemy alpha -> phFlick; wraps nf10Draw (world telegraphs).
const PH10 = { tele: 0.4, minGap: 2 };

function phFlick(e) {
  const f = 0.5 + 0.5 * Math.sin(G.realT * 38 + e.id);
  return e.phased ? 0.18 + 0.3 * f : 0.55 + 0.4 * f;
}

function qsBlink(e, edt, dist) {
  if (e.qDest) { // landing spot chosen: wait out the tell, then jump
    e.qDest.t -= edt;
    if (e.qDest.t <= 0) {
      spawnPart(e.x, e.y, e.color, 8, 120, 0.3);
      e.x = e.qDest.x; e.y = e.qDest.y; e.qDest = null; e.qLast = G.t; e.stT = rand(3, 4.5);
      ring(e.x, e.y, 26, e.color, 0.3);
    }
    return;
  }
  e.stT -= edt;
  if (e.stT <= 0 && dist > 130 && G.t - (e.qLast == null ? -99 : e.qLast) >= PH10.minGap) {
    const p = G.player, a = Math.random() * TAU, r = rand(110, 170);
    e.qDest = { x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r, t: PH10.tele, max: PH10.tele };
  }
}

// ghost tell: flicker through the last 0.4 s of the solid spell (stT is the time left in the current spell)
hookOn('tick', 'phaserTell', () => {
  if (!G) return;
  for (const e of G.enemies) if (e.def && e.def.ai === 'phase') e.phTell = !e.phased && e.stT > 0 && e.stT < PH10.tele;
});

const _nf10DrawPh = nf10Draw;
nf10Draw = function () {
  _nf10DrawPh();
  if (!G) return;
  for (const e of G.enemies) {
    if (e.dead || !e.qDest) continue;
    const q = e.qDest, k = 1 - q.t / q.max;
    ctx.save(); ctx.strokeStyle = e.color; ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.25 + 0.5 * k; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), (e.r + 14 * (1 - k)) * S, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.2 + 0.3 * k; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), e.r * 0.6 * k * S, 0, TAU); ctx.fill();
    ctx.restore();
  }
};
