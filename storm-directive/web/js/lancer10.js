'use strict';
// Spawn Prawn - Killer T-Cell, a sniper that fires a Beam (B2 of ENEMY_HANDOFF.md).
// It holds range, lights a thin lane to you for 0.9 s (the lane is fixed when the tell starts), then fires a 0.4 s Beam
// along that lane: four small hits totalling the roster dmg, stopped by the first wall. Nothing lands during the tell.
// The hit goes through hurtPlayer with kind 'beam', so pdef.js treats it as a Beam (Evasion never applies, Membrane and
// Shell still do; leaving the lane stops it). Force or Static hits interrupt the wind-up.
// Hooks: pdef.js PDEF_ATK (beam), roster.js (lancer shoot row removed), index.html (script tag after newfoes.js),
//        proc event (interrupt); wraps nf10Draw (newfoes.js) for the lane.

const LC = { ticks: 4, fireLen: 0.4, stun: 1.2, retry: 1.5 };
const lcA = () => ROSTER.lancer.atk[0];
if (ENEMIES.lancer) { delete ENEMIES.lancer.shoot; ENEMIES.lancer.ai = 'new_lancer'; } // (nfWire ran before this file and fell back to 'ranged'; data.js still carries the v9 'snipe' row, the roster has none)

// Where the lane ends: the first solid wall or obstacle along it, or its full range.
function lcEnd(e) {
  const A = lcA(), ux = Math.cos(e.lcA), uy = Math.sin(e.lcA);
  let L = A.range;
  for (let s = 12; s <= A.range; s += 12) {
    const x = e.x + ux * s, y = e.y + uy * s;
    if (G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y)) { L = s - 12; break; }
    const cell = typeof tCell === 'function' ? tCell(x, y) : null;
    if (cell && cell.some(ob => ob.def.solid && Math.hypot(x - ob.x, y - ob.y) < ob.r)) { L = s - 12; break; }
  }
  return L;
}

FOE_AI.new_lancer = function (e, dt, dist, ux, uy) {
  const A = lcA(), p = me();
  if (e.lcS == null) { e.lcS = 0; e.lcT = 0; e.lcCd = rand(0.8, 2); e.lcTick = 0; }
  if (e.lcS === 0) {
    e.lcCd -= dt;
    if (e.lcCd <= 0 && dist < A.range - 20) { e.lcS = 1; e.lcT = A.tele; e.lcA = Math.atan2(p.y - e.y, p.x - e.x); e.lcRT = G.realT; e.lcLen = lcEnd(e); }
    const side = e.side || 1; // hold range: close in, back off, otherwise circle
    if (dist > 300) return { x: ux, y: uy };
    if (dist < 200) return { x: -ux, y: -uy };
    return { x: -uy * side, y: ux * side };
  }
  if (e.lcS === 1) { // the tell: the lane is lit and fixed, nothing hurts yet
    e.lcT -= dt;
    if (e.lcT <= 0) { e.lcS = 2; e.lcT = LC.fireLen; e.lcTick = 0; e.lcLen = lcEnd(e); }
    return { x: 0, y: 0, s: 0 };
  }
  e.lcT -= dt; // the Beam: hits at fixed moments along the lane, no tracking
  const done = Math.min(LC.ticks, Math.floor((LC.fireLen - e.lcT) / LC.fireLen * LC.ticks + 1e-6) + 1);
  while (e.lcTick < done) {
    e.lcTick++;
    const ex = e.x + Math.cos(e.lcA) * e.lcLen, ey = e.y + Math.sin(e.lcA) * e.lcLen;
    const s = nfSegD(p.x, p.y, e.x, e.y, ex, ey);
    if (s.d < A.width / 2 + p.r) {
      const hp0 = p.hp;
      hurtPlayer(A.dmg / LC.ticks * G.evm.fire, e.name + ' beam', e, 'beam');
      if (p.hp < hp0 && p.iframes > 0.1) p.iframes = 0.05; // the Beam's own rapid hits are not spaced by the usual 0.7 s
    }
  }
  if (e.lcT <= 0) { e.lcS = 0; e.lcCd = A.cd; }
  return { x: 0, y: 0, s: 0 };
};

// Force or Static during the wind-up breaks it off.
hookOn('proc', 'lancerInterrupt', (e, dmg, src) => {
  if (!e || e.lcS !== 1 || !src) return;
  if (src.elem === 'phys' || src.elem === 'shock') { e.lcS = 0; e.lcCd = LC.retry; floatText(e.x, e.y - e.r - 10, 'interrupted', TYPE_PAL.phys, 11, 0.6); }
});

function lancerDraw() {
  const now = performance.now() / 1000;
  for (const e of G.enemies) {
    if (e.dead || !e.lcS) continue;
    const x0 = sx(e.x), y0 = sy(e.y), x1 = sx(e.x + Math.cos(e.lcA) * e.lcLen), y1 = sy(e.y + Math.sin(e.lcA) * e.lcLen), w = lcA().width * S;
    ctx.save(); ctx.lineCap = 'round';
    if (e.lcS === 1) {
      const k = 1 - e.lcT / lcA().tele;
      ctx.globalAlpha = 0.25 + 0.5 * k; ctx.strokeStyle = TYPE_PAL.arcane; ctx.lineWidth = Math.max(1.5, w * 0.3); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = 0.35 + 0.4 * (k > 0.75 ? Math.sin(now * 40) ** 2 : 0); ctx.lineWidth = 1; ctx.setLineDash([6 * S, 5 * S]); ctx.strokeStyle = '#ffd0dc'; ctx.stroke(); ctx.setLineDash([]);
    } else if (e.lcS === 2) {
      ctx.globalAlpha = 0.9; ctx.strokeStyle = TYPE_PAL.arcane; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(1.5, w * 0.35); ctx.stroke();
    }
    ctx.restore();
  }
}
{ const prev = nf10Draw; nf10Draw = function () { prev(); lancerDraw(); }; }
