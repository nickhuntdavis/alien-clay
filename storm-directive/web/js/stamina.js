'use strict';
// Spawn Prawn - stamina. One bar, two uses:
//  - Sprinting (manual control only): push the stick past its edge and you sprint, 55% faster, burning stamina.
//    Run it dry and you are WINDED: no sprint until it is back to 30%.
//  - Feats (what used to be spells): the attacking ones cost stamina instead of waiting on a cooldown, so you can
//    spend it on speed or on Feats. The rest (Kiss It Better, Nap Time, Latex Barrier, Baby Monitor) keep cooldowns.
// Hooks: stamTick (update), sprintMul (player speed), featCost / featPay (updateSpellList), drawStamina (HUD).
const STAM = { max: 60, regen: 14, sprintCost: 30, sprintK: 1.55, rest: 0.6, featK: 9, windedAt: 0.3, push: 66, stick: 74, hold: 0.22 };
const STAM_FEATS = new Set(['meteor', 'frostnova', 'thunder', 'blackhole', 'bladestorm', 'cloud', 'naughtycorner', 'tantrum', 'dummyspit',
  // (v9.23, newfeats.js: the ones without a cooldown in seconds)
  'slimemould', 'vanishingtwin', 'mosquito', 'notlatex', 'donorsample', 'ouija', 'formicacid', 'bombardier', 'crabs', 'wanderingwomb',
  'capacitation', 'brownfat', 'asymptomatic', 'rupture', 'spinnbarkeit', 'tonic', 'earcandling', 'hostileenv', 'sharedplacenta', 'productivecough',
  'biofilm', 'shedlining', 'osmosis', 'aerosol', 'anticoagulant', 'lacticacid']);
const stamMax = () => Math.max(20, STAM.max + (G.P.stamMax || 0));
function stamInit() { G.stam = { cur: stamMax(), restT: 0, sprint: false, winded: false }; }
function stamTick(dt) {
  const S = G.stam || (stamInit(), G.stam), P = G.P;
  S.cur = Math.min(S.cur, stamMax());
  const was = S.sprint;
  // The stick has to sit right at its edge for a moment (not just brush it), or Shift.
  S.edgeT = G.manual && G.manual.edge ? (S.edgeT || 0) + dt : 0;
  S.sprint = !!(G.manual && (G.manual.sprint || S.edgeT > STAM.hold)) && !S.winded && S.cur > 0.5 && G.state === 'play';
  if (was && !S.sprint && G.state === 'play') tutSprintEnd(); // (your first sprint: a card about stamina)
  if (S.sprint) {
    S.cur -= STAM.sprintCost * (P.sprintCost || 1) * dt; S.restT = STAM.rest;
    if (S.cur <= 0) { S.cur = 0; S.winded = true; const p = me(); floatText(p.x, p.y - 28, 'WINDED', XR.white, 12, 0.8); }
  } else if (S.restT > 0) S.restT -= dt;
  else S.cur = Math.min(stamMax(), S.cur + STAM.regen * (P.stamRegen || 1) * dt);
  if (S.winded && S.cur >= stamMax() * STAM.windedAt) S.winded = false;
  // A little wake while sprinting.
  if (S.sprint && Math.random() < dt * 20) { const p = me(); fxParts('spark', p.x - (p.vx || 0) * 0.04, p.y - (p.vy || 0) * 0.04, PAL.you, 1, 40, 0.3, 2); }
}
const sprintMul = () => (G.stam && G.stam.sprint ? STAM.sprintK + (G.P.sprintSpd || 0) : 1) * f10Speed(); // (v10 Feats: husk, boosts)
// What a Feat costs (0: it runs on a cooldown). Scales with the Feat's cooldown, so cooldown upgrades make it cheaper.
// (Never more than 90% of a full bar, so a small bar can still afford its biggest Feat.)
const featCost = w => w.def.f10 ? (w.echo ? 0 : f10Cost(w)) : (!w.echo && STAM_FEATS.has(w.id) ? Math.max(10, Math.min(Math.round(stamMax() * 0.9), Math.round(w.s.cd * STAM.featK * (G.P.featCost || 1)))) : 0);
// Can it go now? (true: pay and cast). Feats that cost stamina still wait a short beat between casts.
function featPay(w) {
  const c = featCost(w);
  if (!c) return true;
  const S = G.stam || (stamInit(), G.stam);
  if (S.cur < c) return false;
  G.loadK = S.cur / stamMax(); // (how full the bar was: Full Load, bodymods.js)
  S.cur -= c; S.restT = Math.max(S.restT, 0.3);
  return true;
}
// The ring: very thin and almost invisible, just inside your health ring, only while stamina isn't full.
function stamRing(px, py) {
  const S = G.stam;
  if (!S) return;
  const k = clamp(S.cur / stamMax(), 0, 1);
  if (k >= 0.995) return;
  const R = 24 * S0 * ZOOM.z * playerScale() * 0.8, top = -Math.PI / 2, a0 = ctx.globalAlpha;
  // Drawn like the health ring (one solid arc, no track), in blue. Full strength while stamina is being spent or held
  // (sprinting, or the short rest after a sprint or Feat); the moment it starts to refill it drops to a faint arc.
  const hot = S.sprint || S.restT > 0;
  ctx.lineCap = 'butt'; ctx.lineWidth = Math.max(2, 2.2 * Math.min(1.6, S0 * ZOOM.z));
  ctx.globalAlpha = a0 * (S.winded ? 0.9 : hot ? 1 : 0.3); ctx.strokeStyle = S.winded ? PAL.danger : '#3d9bff';
  ctx.beginPath(); ctx.arc(px, py, R, top, top + TAU * k); ctx.stroke();
  ctx.globalAlpha = a0;
}

// Armour: a sci-fi forcefield round you, bigger than the health ring. While you have armour it is always there: a
// faint bubble that glows from inside its skin, with a soft highlight and a gently wobbling rim, dimmer and flickery
// as it wears. A hit spreads light across the bubble's face from the impact point (a perspective radial gradient), lights
// the rim, and sends two waves running round the shell from it (the rim bulges as they pass). New hits are spotted from G.armFlash (set in hurtPlayer).
const ARM_RIP = [];
function armourRing(px, py) {
  const P = G.P;
  if (!pdefShieldUp()) { ARM_RIP.length = 0; return; } // (v10: the bubble is the Membrane, pdef.js)
  const k = pdefShieldK(), sc = S0 * ZOOM.z, R = 24 * sc * playerScale() * 1.6, t = G.realT, a0 = ctx.globalAlpha;
  // Elastic (bodymods.js): it sloshes behind you on its spring and flattens against whatever it is pressed on.
  const B = G.bub, ox = B ? B.ox * sc : 0, oy = B ? B.oy * sc : 0, C = G.bubC;
  px += ox * 0.4; py += oy * 0.4;
  const F = G.armFlash;
  if (F && F.t !== armourRing.lastT) { armourRing.lastT = F.t; ARM_RIP.push({ t: F.t, a: F.a != null ? F.a : rand(0, TAU), k: F.soft ? 0.3 : 0.7 + 0.3 * (F.k || 0) }); if (ARM_RIP.length > 4) ARM_RIP.shift(); }
  while (ARM_RIP.length && (t - ARM_RIP[0].t > 0.9 || t < ARM_RIP[0].t)) ARM_RIP.shift(); // (a new run resets the clock)
  const flick = k < 0.35 ? 0.7 + 0.3 * Math.sin(t * 37) * Math.sin(t * 13) : 1; // (worn thin: it flickers)
  const base = (0.25 + 0.55 * k) * flick, hot = ARM_RIP.reduce((m, r) => Math.max(m, (1 - (t - r.t) / 0.9) * r.k), 0);
  // The shell's outline: a slow wobble, plus a bulge wherever a wave is passing.
  const N = 64, pts = [];
  for (let i = 0; i < N; i++) {
    const th = i / N * TAU;
    let r = R * (1 + 0.018 * Math.sin(th * 3 + t * 1.6) + 0.012 * Math.sin(th * 5 - t * 2.3));
    for (const rp of ARM_RIP) {
      const u = (t - rp.t) / 0.9, d = Math.abs(((th - rp.a + Math.PI * 3) % TAU) - Math.PI), front = u * Math.PI;
      r += R * 0.16 * rp.k * (1 - u) * Math.exp(-((d - front) ** 2) / 0.05);
    }
    const cx = Math.cos(th), cy = Math.sin(th);
    r += (cx * ox + cy * oy) * 0.6; // (stretched out behind, squashed in front)
    if (C) { const f = -(cx * C.nx + cy * C.ny); if (f > 0.05) r = Math.min(r, R * (1 - C.pen / bubbleR()) / f); } // (flat against the surface)
    pts.push([px + Math.cos(th) * r, py + Math.sin(th) * r]);
  }
  const shell = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < N; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };
  // Light on black in Darkfield; on the grey field it draws normally in a deeper cyan with white highlights (additive light washes out there). True colours either way.
  const df = !!SET.darkfield, rim = df ? '#9ef0ff' : '#1b9cc4', hi = df ? '#e8fdff' : '#ffffff', raw = RAW_COL;
  ctx.save(); RAW_COL = true; ctx.globalCompositeOperation = df ? 'lighter' : 'source-over';
  // The bubble: clear in the middle, glowing from just inside its skin (all of it inside the shell, none spills out),
  // with a soft highlight top left and a faint reflection bottom right, like a soap bubble.
  const tint = df ? '120,220,255' : '40,170,215';
  const g = ctx.createRadialGradient(px, py, R * 0.35, px, py, R * 1.02);
  g.addColorStop(0, `rgba(${tint},0)`); g.addColorStop(0.55, `rgba(${tint},${0.05 * base + 0.08 * hot})`); g.addColorStop(0.86, `rgba(${tint},${0.2 * base + 0.2 * hot})`); g.addColorStop(1, `rgba(${df ? '200,245,255' : '160,225,245'},${0.38 * base + 0.3 * hot})`);
  shell(); ctx.fillStyle = g; ctx.globalAlpha = a0; ctx.fill();
  ctx.save(); shell(); ctx.clip();
  for (const [ox, oy, rr, al, sy2] of [[-0.42, -0.44, 0.42, 0.34, 0.7], [0.5, 0.5, 0.26, 0.12, 0.55]]) {
    const hx = px + ox * R, hy = py + oy * R;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-Math.PI / 4); ctx.scale(1, sy2);
    const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, rr * R);
    hg.addColorStop(0, `rgba(255,255,255,${al * base})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, rr * R, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // The skin: one thin rim.
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  shell(); ctx.lineWidth = Math.max(1.2, 1.4 * Math.min(1.6, sc)); ctx.strokeStyle = rim; ctx.globalAlpha = a0 * (0.5 * base + 0.5 * hot); ctx.stroke();
  // Hits: energy spreads over the bubble's face from the impact point like light across a sphere: a radial gradient
  // squashed towards the middle (perspective), its brightest band at the travelling front, a fading glow behind it and
  // a hot core at the impact; the rim lights up (fresnel) as it passes. Two wave fronts also run round the rim.
  for (const rp of ARM_RIP) {
    const u = (t - rp.t) / 0.9, fade = (1 - u) * rp.k, f = 1 - (1 - u) ** 2.2; // (eased: fast off the mark, settling)
    ctx.save(); shell(); ctx.clip();
    ctx.translate(px + Math.cos(rp.a) * R * 0.94, py + Math.sin(rp.a) * R * 0.94); ctx.rotate(rp.a); ctx.scale(0.55, 1);
    const RG = R * 2.3, fr = Math.min(0.97, 0.06 + f * 0.9), sh = ctx.createRadialGradient(0, 0, 0, 0, 0, RG);
    const st = (o, rgb, al) => sh.addColorStop(clamp(o, 0, 1), `rgba(${rgb},${clamp(al, 0, 1)})`);
    st(0, '255,255,255', 0.9 * fade * (1 - u)); st(Math.min(0.1, fr * 0.5), tint, 0.55 * fade);
    st(fr - 0.3, tint, 0.28 * fade); st(fr - 0.1, tint, 0.5 * fade); st(fr - 0.02, '255,255,255', (df ? 0.7 : 0.55) * fade); st(fr + 0.06, tint, 0);
    ctx.fillStyle = sh; ctx.globalAlpha = a0; ctx.fillRect(-RG, -RG, RG * 2, RG * 2);
    ctx.restore();
    // Fresnel: the shell's edge lights up as the energy crosses it.
    const fz = ctx.createRadialGradient(px, py, R * 0.62, px, py, R * 1.04);
    fz.addColorStop(0, `rgba(${tint},0)`); fz.addColorStop(0.8, `rgba(${tint},${0.22 * fade})`); fz.addColorStop(1, `rgba(255,255,255,${0.35 * fade})`);
    shell(); ctx.fillStyle = fz; ctx.globalAlpha = a0; ctx.fill();
    ctx.lineWidth = Math.max(2.5, 3.6 * Math.min(1.6, sc));
    for (const dir of [1, -1]) {
      const c = rp.a + dir * u * Math.PI, i0 = Math.round(((c % TAU) + TAU) % TAU / TAU * N);
      ctx.beginPath();
      for (let j = -6; j <= 6; j++) { const q = pts[(i0 + j + N) % N]; if (j > -6) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
      ctx.globalAlpha = a0 * 0.8 * fade; ctx.strokeStyle = rim; ctx.lineWidth *= 2; ctx.stroke(); ctx.lineWidth /= 2;
      ctx.globalAlpha = a0 * fade; ctx.strokeStyle = hi; ctx.stroke();
    }
  }
  ctx.restore(); ctx.globalAlpha = a0; RAW_COL = raw;
}
