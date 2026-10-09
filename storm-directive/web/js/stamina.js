'use strict';
// Spawn Prawn - stamina. One bar, two uses:
//  - Sprinting (manual control only): push the stick past its edge and you sprint, 55% faster, burning stamina.
//    Run it dry and you are WINDED: no sprint until it is back to 30%.
//  - Feats (what used to be spells): the attacking ones cost stamina instead of waiting on a cooldown, so you can
//    spend it on speed or on Feats. The rest (Kiss It Better, Nap Time, Latex Barrier, Baby Monitor) keep cooldowns.
// Hooks: stamTick (update), sprintMul (player speed), featCost / featPay (updateSpellList), drawStamina (HUD).
const STAM = { max: 100, regen: 14, sprintCost: 30, sprintK: 1.55, rest: 0.6, featK: 9, windedAt: 0.3, push: 58, stick: 70 };
const STAM_FEATS = new Set(['meteor', 'frostnova', 'thunder', 'blackhole', 'bladestorm', 'cloud']);
const stamMax = () => Math.max(20, STAM.max + (G.P.stamMax || 0));
function stamInit() { G.stam = { cur: stamMax(), restT: 0, sprint: false, winded: false }; }
function stamTick(dt) {
  const S = G.stam || (stamInit(), G.stam), P = G.P;
  S.cur = Math.min(S.cur, stamMax());
  S.sprint = !!(G.manual && G.manual.sprint) && !S.winded && S.cur > 0.5 && G.state === 'play';
  if (S.sprint) {
    S.cur -= STAM.sprintCost * (P.sprintCost || 1) * dt; S.restT = STAM.rest;
    if (S.cur <= 0) { S.cur = 0; S.winded = true; const p = me(); floatText(p.x, p.y - 28, 'WINDED', XR.white, 12, 0.8); }
  } else if (S.restT > 0) S.restT -= dt;
  else S.cur = Math.min(stamMax(), S.cur + STAM.regen * (P.stamRegen || 1) * dt);
  if (S.winded && S.cur >= stamMax() * STAM.windedAt) S.winded = false;
  // A little wake while sprinting.
  if (S.sprint && Math.random() < dt * 20) { const p = me(); fxParts('spark', p.x - (p.vx || 0) * 0.04, p.y - (p.vy || 0) * 0.04, PAL.you, 1, 40, 0.3, 2); }
}
const sprintMul = () => (G.stam && G.stam.sprint ? STAM.sprintK + (G.P.sprintSpd || 0) : 1);
// What a Feat costs (0: it runs on a cooldown). Scales with the Feat's cooldown, so cooldown upgrades make it cheaper.
const featCost = w => (!w.echo && STAM_FEATS.has(w.id) ? Math.max(10, Math.round(w.s.cd * STAM.featK * (G.P.featCost || 1))) : 0);
// Can it go now? (true: pay and cast). Feats that cost stamina still wait a short beat between casts.
function featPay(w) {
  const c = featCost(w);
  if (!c) return true;
  const S = G.stam || (stamInit(), G.stam);
  if (S.cur < c) return false;
  S.cur -= c; S.restT = Math.max(S.restT, 0.3);
  return true;
}
// The bar: under your health bar in the top HUD strip.
function drawStamina(x, y, w) {
  const S = G.stam;
  if (!S) return;
  const k = clamp(S.cur / stamMax(), 0, 1);
  ctx.fillStyle = 'rgba(214,228,240,0.12)'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = S.winded ? PAL.danger : S.sprint ? '#ffe94a' : '#d6e4f0'; ctx.fillRect(x, y, w * k, 3);
}
