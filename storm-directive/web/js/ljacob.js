'use strict';
// Spawn Prawn - Little Jacob (user, 26 Oct): Sister Cousin's double mastery. With BOTH the Charged and the Exploding Rounds
// masteries on Sister Cousin (two weapon masteries, so it needs Extra Mastery), every LJ.cd seconds a fat sibling waddles
// out squealing at the densest crowd within LJ.range and explodes there (Blood, radius LJ.r, LJ.base x Sister Cousin's
// damage). He goes off when he reaches an enemy (after LJ.arm s) or after LJ.life s wherever he is.
//  - FEEDING HIM: your other weapons' shots that touch him are eaten, and their damage is added to his blast at x LJ.feed
//    (up to LJ.cap x his base blast). Your shots passing within LJ.lure bend towards him, so shooting him first is easy.
//  - Bosses take LJ.boss of the blast.
//  Squeal text TODO_COPY:lj_squeal (LJ_TEXT).
// Hooks: none in shared files. hookOn tick 'ljTick'; wraps feats10.js f10Draw. Loads after matskin.js.
const LJ = { cd: 8, range: 520, speed: 115, arm: 0.8, life: 4.5, r: 140, base: 8, feed: 1.25, cap: 4, lure: 120, turn: 6, boss: 0.5 };
const LJ_TEXT = { squeal: 'TODO_COPY:lj_squeal' };
const ljGun = () => (G && G.weapons || []).find(w => w && !w.isSpell && w24Key(w) === 's_seeker' && modCount(w, 'charged') >= 4 && modCount(w, 'explode') >= 4) || null;
const ljLive = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
function ljLaunch(w) {
  const p = G.player, t = acquire('cluster', LJ.range, p.x, p.y); if (!t) return false;
  const J = G.lj = { w, x: p.x, y: p.y, t0: G.t, tgt: t, tx: t.x, ty: t.y, bank: 0, base: w.s.dmg * LJ.base, wob: 0 };
  floatText(J.x, J.y - 26, LJ_TEXT.squeal, '#f25c78', 12, 0.9); ring(J.x, J.y, 24, '#f25c78', 0.3, 3);
  return true;
}
function ljBoom(J) {
  G.lj = null;
  const dmg = J.base + Math.min(J.bank, J.base * LJ.cap) * LJ.feed, src = Object.assign(weaponSrc(J.w), { elem: 'arcane', atk: 'burst', noProc: true, wupEcho: true, ljBoom: 1 });
  forNear(J.x, J.y, LJ.r + 40, e => { if (ljLive(e) && Math.hypot(e.x - J.x, e.y - J.y) < LJ.r + e.r) damageEnemy(e, dmg * (e.boss ? LJ.boss : 1), src); });
  ring(J.x, J.y, LJ.r, '#c9184a', 0.5, 8); ring(J.x, J.y, LJ.r * 0.6, '#ffd6de', 0.35, 5);
  if (typeof fxParts === 'function') fxParts('spark', J.x, J.y, '#c9184a', 24, 260, 0.6, 4);
  cam.shake = Math.min(14, cam.shake + 4 + 6 * Math.min(1, J.bank / (J.base * LJ.cap)));
  G.ljLast = { dmg, bank: J.bank, t: G.t };
}
function ljTick(dt) {
  if (!G || G.state !== 'play') return;
  const J = G.lj;
  if (!J) { const w = ljGun(); if (w && !(G.ljAt > G.t)) { if (ljLaunch(w)) G.ljAt = G.t + LJ.cd; else G.ljAt = G.t + 0.5; } return; }
  if (!G.weapons.includes(J.w)) { G.lj = null; return; }
  if (!ljLive(J.tgt)) { const n = acquire('cluster', LJ.range, J.x, J.y); if (n) J.tgt = n; }
  if (ljLive(J.tgt)) { J.tx = J.tgt.x; J.ty = J.tgt.y; }
  const dx = J.tx - J.x, dy = J.ty - J.y, d = Math.hypot(dx, dy) || 1;
  J.x += dx / d * LJ.speed * dt; J.y += dy / d * LJ.speed * dt; J.wob += dt * 14;
  // Feeding: your other weapons' shots near him bend in; touching him, they are eaten
  for (const pr of G.proj) {
    if (pr.dead || !pr.w || pr.w === J.w || pr.w.isSpell || pr.mine) continue;
    const ex = J.x - pr.x, ey = J.y - pr.y, ed = Math.hypot(ex, ey);
    if (ed < 18 + (pr.r || 4)) { pr.dead = true; J.bank += pr.dmg || (pr.w.s && pr.w.s.dmg) || 0; continue; }
    if (ed < LJ.lure && pr.vx != null) { const sp = Math.hypot(pr.vx, pr.vy) || 1, a = Math.atan2(pr.vy, pr.vx), want = Math.atan2(ey, ex); let da = ((want - a + Math.PI * 3) % TAU) - Math.PI; da = clamp(da, -LJ.turn * dt, LJ.turn * dt); pr.vx = Math.cos(a + da) * sp; pr.vy = Math.sin(a + da) * sp; }
  }
  let hit = false;
  if (G.t - J.t0 > LJ.arm) forNear(J.x, J.y, 60, e => { if (!hit && ljLive(e) && Math.hypot(e.x - J.x, e.y - J.y) < e.r + 16) hit = true; });
  if (hit || G.t - J.t0 > LJ.life) ljBoom(J);
}
hookOn('tick', 'ljTick', dt => ljTick(dt));
f10Draw = (orig => function () {
  orig.apply(this, arguments);
  const J = G && G.lj; if (!J) return;
  const x = sx(J.x), y = sy(J.y), sq = 1 + 0.12 * Math.sin(J.wob), full = Math.min(1, J.bank / (J.base * LJ.cap));
  ctx.save();
  ctx.globalAlpha = 0.95; ctx.fillStyle = col('#f25c78'); ctx.beginPath(); ctx.ellipse(x, y, 15 * S * sq, 13 * S / sq, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = col('#ffd6de'); ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(x - 5 * S, y - 5 * S, 4 * S, 0, TAU); ctx.fill();
  ctx.strokeStyle = col('#f25c78'); ctx.lineWidth = 2.5 * S; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(x - 14 * S, y); ctx.quadraticCurveTo(x - 24 * S, y + 6 * S * Math.sin(J.wob * 0.7), x - 32 * S, y); ctx.stroke(); // (a stubby tail)
  if (full > 0) { ctx.strokeStyle = col('#c9184a'); ctx.lineWidth = 3; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(x, y, 20 * S, -Math.PI / 2, -Math.PI / 2 + TAU * full); ctx.stroke(); }
  ctx.restore();
})(f10Draw);
