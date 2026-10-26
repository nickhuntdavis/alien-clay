'use strict';
// Spawn Prawn - the charge-up look, built once and reused wherever something winds up. One look per damage type,
// in the same soft, organic motion as typefx.js / typelook.js (STYLE.md), reading with no colour in Lab view.
//   drawChargeFx(x, y, r, k, elem, seed)  SCREEN px; k 0..1 is the wind-up (builds, then holds a shimmer at 1).
//   chargeSnap(x, y, r, elem)             WORLD units; the release: a ring and flair at full (drawn by this file).
//   Force a tightening ring; Acid pink drips swelling at the rim; Mucus green strands pulled to the middle; Static
//   jittering arcs; Cooties a pulsing rash of dots; Oil a travelling gleam; Water ripples running inwards; Blood a
//   heartbeat and spurting drops; Parasite wisps spiralling in; Fire (flame) tongues rising.
// No allocation per frame: motes come from sin/cos of time and an index, the snaps live in a fixed pool.
// Hooks: laserbeam.js lzChargeDraw, newfeats.js nfDrawCharge, render.js drawEnemy (charger wind-up), bosstells10.js
// (charge lane), newfoes.js (Matchstick, Static Sock), foes3.js (sneeze) each call drawChargeFx; modDraw is wrapped
// here to draw the Charged modifier's wind-up (modwide.js: the last `wind` seconds of the cooldown) and the snaps.

const CFX_LIGHT = { phys: '#ffffff', fire: '#ffc2e6', ice: '#d4f5bd', shock: '#ffffff', poison: '#ffd0e4', oxi: '#fff0b8', salt: '#cfe4ff', arcane: '#ff8fa8', soul: '#e6d4ff', flame: '#fff3b0' };
const CFX_MAIN = { flame: '#ff6a2a' };
const cfxMain = el => CFX_MAIN[el] || (ELEMENTS[el] && ELEMENTS[el].color) || '#e8eef8';
const cfxN = (a, b, k) => Math.max(1, Math.round((a + (b - a) * k) * (QUAL.lv >= 2 ? 0.6 : 1) * (typeof FX !== 'undefined' ? 0.5 + 0.5 * FX.k : 1)));

function drawChargeFx(x, y, r, k, elem, seed) {
  if (!(k > 0.02) || !(r > 0)) return;
  if (k > 1) k = 1;
  r *= 1.3; // (the look reads at the size of a body, not a pinhead)
  const el = CFX_LIGHT[elem] ? elem : 'phys', c = cfxMain(el), c2 = CFX_LIGHT[el], t = (G ? G.realT : 0) + (seed || 0) * 1.7, ready = k >= 0.999;
  const pulse = ready ? 0.65 + 0.35 * Math.sin(t * 18) : 1;
  const a0 = ctx.globalAlpha, op = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  soft(x, y, r * (1.5 + 0.9 * k), c, (0.12 + 0.3 * k) * pulse, 0.3); // the gathering glow, common to all
  ctx.globalCompositeOperation = 'source-over';
  const gr = r * (2.3 - 1.3 * k); // a ring drawing in as it fills
  switch (el) {
    case 'phys': {
      ctx.beginPath(); ctx.arc(x, y, gr, 0, TAU); softStroke(1.4 * (0.8 + k), c2, 0.25 + 0.5 * k);
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t * 0.6, d0 = gr * 1.25, d1 = gr * 1.25 - r * (0.5 + 0.6 * k); ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0); ctx.lineTo(x + Math.cos(a) * d1, y + Math.sin(a) * d1); }
      softStroke(1, c2, 0.3 + 0.4 * k); break;
    }
    case 'fire': { // Acid: drops swell at the rim, sag and let go
      const n = cfxN(3, 7, k);
      ctx.fillStyle = ha(c, 0.7);
      for (let i = 0; i < n; i++) {
        const ph = (t * 0.9 + i * 0.37) % 1, a = i / n * TAU + 0.5, bx = x + Math.cos(a) * r * 1.05, by = y + Math.sin(a) * r * 1.05 + ph * r * 0.7 * (0.4 + k);
        ctx.beginPath(); ctx.arc(bx, by, (1.1 + 1.8 * k) * Math.max(0.8, r / 12) * (1 - ph * 0.4), 0, TAU); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(x, y, gr, 0, TAU); softStroke(1.3, c, 0.2 + 0.5 * k); break;
    }
    case 'ice': { // Mucus: strands stretch from the rim towards the middle and sag
      const n = cfxN(3, 6, k);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + Math.sin(t * 0.7 + i) * 0.2, d = r * (2.0 - 1.1 * k), sx0 = x + Math.cos(a) * d, sy0 = y + Math.sin(a) * d, ex = x + Math.cos(a) * r * 0.5, ey = y + Math.sin(a) * r * 0.5;
        ctx.moveTo(sx0, sy0); ctx.quadraticCurveTo((sx0 + ex) / 2, (sy0 + ey) / 2 + r * 0.35 * (1 - k * 0.5), ex, ey);
      }
      softStroke(1.4, c, 0.3 + 0.55 * k);
      ctx.fillStyle = ha(c2, 0.4 + 0.3 * k); ctx.beginPath(); ctx.ellipse(x, y, r * (0.7 + 0.25 * Math.sin(t * 3)), r * (0.7 - 0.2 * Math.sin(t * 3)), 0, 0, TAU); ctx.fill(); break;
    }
    case 'shock': { // Static: jittering arcs, more of them the fuller it is
      const n = cfxN(2, 6, k);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU + Math.floor(t * 14 + i * 3) * 1.3, d0 = r * (2 - 0.7 * k), x0 = x + Math.cos(a) * d0, y0 = y + Math.sin(a) * d0;
        ctx.moveTo(x0, y0); let px = x0, py = y0;
        for (let j = 1; j <= 3; j++) { const dd = d0 * (1 - j / 3.2), jx = Math.sin(t * 61 + i * 7 + j * 3) * r * 0.35, jy = Math.cos(t * 53 + i * 5 + j * 2) * r * 0.35; px = x + Math.cos(a) * dd + jx; py = y + Math.sin(a) * dd + jy; ctx.lineTo(px, py); }
      }
      softStroke(1.2, c, 0.5 + 0.4 * k);
      ctx.globalAlpha = 0.5 + 0.5 * k; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x, y, Math.max(1, r * 0.22 * (0.6 + k)), 0, TAU); ctx.fill(); break;
    }
    case 'poison': { // Cooties: a rash of dots that pulses faster as it fills
      const n = cfxN(5, 11, k), beat = 0.5 + 0.5 * Math.sin(t * (4 + 10 * k));
      ctx.fillStyle = ha(c, 0.45 + 0.4 * beat);
      for (let i = 0; i < n; i++) { const a = i * 2.399 + 0.3, d = r * (0.6 + 0.9 * ((i * 0.37) % 1)); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (0.9 + 1.4 * k) * Math.max(0.8, r / 12) * (0.7 + 0.5 * beat), 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, r * (1.1 + 0.25 * beat * k), 0, TAU); softStroke(1.2, c2, 0.2 + 0.4 * k); break;
    }
    case 'oxi': { // Oil: a slick ring and a gleam that sweeps faster as it fills
      ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); softStroke(2, c, 0.25 + 0.3 * k);
      const a = t * (2 + 6 * k);
      ctx.beginPath(); ctx.arc(x, y, r * 1.25, a, a + 0.9 + 0.8 * k); softStroke(2.2, c2, 0.5 + 0.45 * k);
      ctx.beginPath(); ctx.arc(x, y, r * 1.25, a + Math.PI, a + Math.PI + 0.35); softStroke(1.4, c2, 0.3 + 0.3 * k); break;
    }
    case 'salt': { // Water: ripples running inwards
      for (let i = 0; i < 3; i++) {
        const ph = (t * (0.9 + 0.8 * k) + i / 3) % 1, rr = r * (2.4 - 1.5 * ph);
        ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); softStroke(1.2, i ? c : c2, (1 - ph) * (0.2 + 0.55 * k));
      }
      break;
    }
    case 'arcane': { // Blood: a heartbeat and drops drawn in
      const beat = Math.pow(0.5 + 0.5 * Math.sin(t * (5 + 7 * k)), 3), n = cfxN(3, 7, k);
      ctx.beginPath(); ctx.arc(x, y, r * (1.05 + 0.3 * beat), 0, TAU); softStroke(1.6, c, 0.25 + 0.5 * k);
      ctx.fillStyle = ha(c, 0.8);
      for (let i = 0; i < n; i++) { const ph = (t * 1.1 + i * 0.29) % 1, a = i * 2.399, d = r * (2.2 - 1.5 * ph); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (1 + 1.3 * k) * Math.max(0.8, r / 12) * (0.5 + ph * 0.5), 0, TAU); ctx.fill(); }
      break;
    }
    case 'soul': { // Parasite: wisps spiralling in
      const n = cfxN(3, 6, k);
      for (let i = 0; i < n; i++) {
        const ph = (t * 0.8 + i / n) % 1, a = i / n * TAU + ph * 4, d = r * (2.4 - 1.6 * ph);
        soft(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.55, c, (0.25 + 0.4 * k) * Math.sin(ph * Math.PI), 0.3);
      }
      break;
    }
    case 'flame': { // Fire: tongues rising off the body
      const n = cfxN(3, 6, k);
      for (let i = 0; i < n; i++) {
        const ph = (t * 1.4 + i * 0.31) % 1, a = (i / n - 0.5) * 2.4, bx = x + Math.sin(a) * r * 1.0, by = y - Math.cos(a) * r * 0.4 - ph * r * (0.8 + 0.8 * k);
        soft(bx, by, r * (0.5 - 0.25 * ph), i % 2 ? c : c2, (0.3 + 0.4 * k) * (1 - ph), 0.3);
      }
      break;
    }
  }
  ctx.restore(); ctx.globalAlpha = a0; ctx.globalCompositeOperation = op;
}

// ---------------------------------------------------------------- the release (a fixed pool, no garbage)
const CFX_SNAPS = []; for (let i = 0; i < 8; i++) CFX_SNAPS.push({ t: -9, x: 0, y: 0, r: 0, el: 'phys' });
let cfxSnapI = 0;
const CFX_SNAP_T = 0.28;
function chargeSnap(x, y, r, elem) {
  const s = CFX_SNAPS[cfxSnapI++ & 7]; s.t = G ? G.realT : 0; s.x = x; s.y = y; s.r = r; s.el = CFX_LIGHT[elem] ? elem : 'phys';
}
function cfxDrawSnaps() {
  if (!G) return;
  const now = G.realT;
  for (const s of CFX_SNAPS) {
    const u = (now - s.t) / CFX_SNAP_T; if (u < 0 || u >= 1) continue;
    const x = sx(s.x), y = sy(s.y), R = s.r * S, c = cfxMain(s.el), c2 = CFX_LIGHT[s.el], a = 1 - u;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    soft(x, y, R * (1.6 + 1.4 * u), c, 0.5 * a, 0.3);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath(); ctx.arc(x, y, R * (1.1 + 1.6 * u), 0, TAU); softStroke(2.2 * a + 0.6, c2, 0.85 * a);
    if (s.el === 'shock') { ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = i * 1.047 + s.t * 40, d0 = R * (0.9 + 0.5 * u), d1 = R * (1.9 + 1.1 * u); ctx.moveTo(x + Math.cos(an) * d0, y + Math.sin(an) * d0); ctx.lineTo(x + Math.cos(an + 0.15) * (d0 + d1) / 2, y + Math.sin(an + 0.15) * (d0 + d1) / 2); ctx.lineTo(x + Math.cos(an) * d1, y + Math.sin(an) * d1); } softStroke(1.2, c, 0.8 * a); }
    else { ctx.fillStyle = ha(c, 0.8 * a); ctx.beginPath(); for (let i = 0; i < 6; i++) { const an = i * 1.047 + s.t * 7, d = R * (1.2 + 1.8 * u); ctx.moveTo(x + Math.cos(an) * d + 2 * S, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, 2 * S * a + 0.5, 0, TAU); } ctx.fill(); }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- the Charged modifier (modwide.js)
// Progress is the last `wind` seconds of the weapon's cooldown. When the shot goes off, a snap.
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons || !G.player || typeof mwR !== 'function') return;
  cfxDrawSnaps();
  const p = G.player, x = sx(p.x), y = sy(p.y), r = (p.r || 11) * S;
  let n = 0;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.m10 || (typeof lzIs === 'function' && lzIs(w))) continue; // (the Laser draws its own charge)
    const cr = mwR(w, 'charged'); if (!cr) continue;
    const wind = [0.5, 0.4, 0.3][cr - 1], cd = w.cd, kk = cd > 0 && cd <= wind ? 1 - cd / wind : 0;
    if (kk > 0.02) { drawChargeFx(x, y, r + n * 3 * S, kk, wElem(w), n); n++; w.cfxK = kk; }
    else if (w.cfxK) { if (w.cfxK > 0.6 && cd > wind) chargeSnap(p.x, p.y, 12, wElem(w)); w.cfxK = 0; }
  }
})(modDraw);
