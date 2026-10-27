'use strict';
// Spawn Prawn - XP granules you can see, that you go and get (user, 26 Oct).
//  - LOOK: granules drawn XPG.size (1.8) times bigger with a pale halo round each, so they read on the pale slide and the
//    dark film alike (render.js gem pass reads XPG.size and XPG.halo).
//  - DRIFT: loose granules no longer crawl to you from 650 px in wave mode (game.js updatePickups -> xpDrift). Off in
//    waves, cut in the race (it swims on, so a little drift stays: XPG.race). The 105 px magnet is unchanged.
//  - STAT CARDS (statup.js ST_DEF, dealt by wmods.js WM_STAT, rarity steps as the others): Pickup Range (+15% magnet a
//    step, P.magnet) and Gem Drift (+100 px of drift reach a step; any at all switches drift on in waves). Gravity Well
//    and Trail modifier cards bank them (ST_MOD).
//  - LOOK v2 (user, 27 Oct: "tiny specks of flowing light"): xpgDraw replaces the dark diamonds with a small bright core in a
//    soft coloured glow that twinkles, idles in a slow lazy loop and pulls a short tail of light behind it (longer while it
//    is flying to you). Colour by size, same four tiers as before. XPG.light = false brings the diamonds back.
// Hooks: game.js updatePickups -> xpDrift; render.js gem pass reads XPG and calls xpgDraw. Wraps statup.js stNow. Loads after buildbtn.js.
const XPG = { size: 1.8, halo: true, light: true, wave: { r: 0, v: 0 }, race: { r: 700, v: 110 }, driftV: 85 };
ST_DEF.magnet = { name: 'Pickup Range', k: 0.15, fmt: 'pct', P: 'magnet' };
ST_DEF.drift = { name: 'Gem Drift', k: 100, fmt: 'flat' };
ST_MOD.gravity = 'magnet'; ST_MOD.trail = 'drift'; // (a modifier way into each: Gravity Well pulls, Trail leaves a wake; both had a fallback weapon stat)
for (const k of ['magnet', 'drift']) { if (!ST_ORDER.includes(k)) ST_ORDER.push(k); if (typeof WM_STAT !== 'undefined' && !WM_STAT.includes(k)) WM_STAT.push(k); }
// [reach, speed] of the slow drift towards you.
function xpDrift(race) {
  const b = race ? XPG.race : XPG.wave, add = stVal('drift');
  return [b.r + add, b.v || (add > 0 ? XPG.driftV : 0)];
}
stNow = (orig => function (k, add) { return k === 'drift' ? String(Math.round(stVal('drift') + (add || 0))) : orig(k, add); })(stNow);
// Tier colours (gemOf order: 100+, 20+, 5+, small): violet, gold, sea green, sky blue.
const XPG_LIT = [['#c46bff', 2.6], ['#ffc23a', 2.1], ['#3fe0b0', 1.7], ['#5cc8ff', 1.4]];
// Draws every visible granule as a speck of light; returns false (diamonds) when switched off.
function xpgDraw(vis, gemOf) {
  if (!XPG.light) return false;
  if (!vis.length) return true;
  const t = G.realT, k = Math.max(0.75, S), lit = [[], [], [], []];
  for (const g of vis) {
    if (g.ph == null) g.ph = Math.random() * TAU;
    // Idle wander: a slow figure-of-eight a few px wide, so a floor of XP shimmers like motes in a current.
    const a = t * 1.1 + g.ph, ox = Math.sin(a) * 2.6 * k, oy = Math.sin(a * 2) * 1.4 * k;
    const x = sx(g.x) + ox, y = sy(g.y) + oy;
    // Tail: points back along the real motion (world move since last frame) plus the wander's own direction.
    let tx = -Math.cos(a) * 2.6, ty = -Math.cos(a * 2) * 2.8;
    if (g.lx != null) { const mx = g.x - g.lx, my = g.y - g.ly, m = Math.hypot(mx, my); if (m > 0.3 && m < 80) { const L = Math.min(16, 3 + m * 1.1); tx = -mx / m * L; ty = -my / m * L; } }
    g.lx = g.x; g.ly = g.y;
    lit[gemOf(g)].push(x, y, tx * k, ty * k, 0.75 + 0.25 * Math.sin(t * 5.3 + g.ph * 3));
  }
  ctx.lineCap = 'round';
  for (let ti = 0; ti < 4; ti++) {
    const L = lit[ti]; if (!L.length) continue;
    const [c, r0] = XPG_LIT[ti], r = r0 * k;
    // Soft coloured bloom (normal blend so it still reads on the pale slide).
    for (let i = 0; i < L.length; i += 5) glow(L[i], L[i + 1], r * (2.4 + 0.8 * L[i + 4]), c, 0.3 * L[i + 4]);
    // Tail of light: a wide faint stroke and a thin bright one.
    ctx.globalAlpha = 0.18; ctx.strokeStyle = c; ctx.lineWidth = r * 1.5; ctx.beginPath();
    for (let i = 0; i < L.length; i += 5) { ctx.moveTo(L[i], L[i + 1]); ctx.lineTo(L[i] + L[i + 2], L[i + 1] + L[i + 3]); }
    ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.lineWidth = r * 0.6; ctx.beginPath();
    for (let i = 0; i < L.length; i += 5) { ctx.moveTo(L[i], L[i + 1]); ctx.lineTo(L[i] + L[i + 2] * 0.6, L[i + 1] + L[i + 3] * 0.6); }
    ctx.stroke();
    // Coloured body, then a white-hot core that twinkles.
    ctx.globalAlpha = 0.85; ctx.fillStyle = c; ctx.beginPath();
    for (let i = 0; i < L.length; i += 5) { ctx.moveTo(L[i] + r, L[i + 1]); ctx.arc(L[i], L[i + 1], r, 0, TAU); }
    ctx.fill();
    ctx.globalAlpha = 0.8; ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for (let i = 0; i < L.length; i += 5) { const rc = r * 0.55 * L[i + 4]; ctx.moveTo(L[i] + rc, L[i + 1]); ctx.arc(L[i], L[i + 1], rc, 0, TAU); }
    ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  return true;
}
