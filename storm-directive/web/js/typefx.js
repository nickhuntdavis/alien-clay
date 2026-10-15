'use strict';
// Spawn Prawn - how the damage types look (Pass 5 of the damage type rework; STYLE.md). One motion per type:
// Acid drips, Mucus stretches, Static jitters, Cooties pulse (rash), Oil gleams, Water ripples, Blood bleeds,
// Soul drifts. Each status is drawn in the enemy's body, so it reads with no colour at all (Lab view); Arcade
// view adds coloured rings that drain to show the time left (drawEnemy, render.js).
// Lab view is the real microscope: nothing on the slide has colour (labGrey, after the world is drawn), with a
// round eyepiece edge and dust on the glass (labEyepiece).
// Hooks: typeStatusFx (drawStatusFx, foes.js), typeRings (drawEnemy, render.js), typeZone (the zone loop,
// render.js), typeShotFx (the projectile loop, game.js), labGrey and labEyepiece (render, after the world).

const TYPE_RING = [ // [status on, seconds left, full length, damage type]
  e => [e.burn > 0, e.burn, 3, 'fire'], e => [e.chill > 0 || e.frozen > 0, Math.max(e.chill, e.frozen), 2.5, 'ice'], e => [e.shock > 0, e.shock, 2.2, 'shock'],
  e => [sick(e), e.poison, 4, 'poison'], e => [e.fizz > 0, e.fizz, 3, 'oxi'], e => [e.pickle > 0, e.pickle, 3, 'salt'],
  e => [e.bloodT > 0, e.bloodT, 4, 'arcane'], e => [e.curse > 0, e.curse, 3, 'soul'],
];
// Arcade view: a ring per damage-type status, in its colour, draining as it runs out. Returns how many it drew.
function typeRings(e, x, y, r, si) {
  let n = 0;
  for (const f of TYPE_RING) {
    const [on, left, full, k] = f(e);
    if (!on) continue;
    const q = clamp(left / full, 0.05, 1), rr = r + 3 + (si + n) * 3;
    const rc = RAW_COL; RAW_COL = true; ctx.strokeStyle = ELEMENTS[k].color; RAW_COL = rc;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + TAU * q); ctx.stroke();
    n++;
  }
  return n;
}

// ---------------------------------------------------------------- statuses in the body
// Small seeded numbers per enemy, so no two look alike and nothing flickers.
const tfR = (id, i) => ((id * 9301 + i * 49297) % 233280) / 233280;
function typeStatusFx(e, x, y, r) {
  const t = G.realT, id = e.id || 0, a0 = ctx.globalAlpha;
  const mvx = e.svx || 0, mvy = e.svy || 0, mv = Math.hypot(mvx, mvy), bx = mv > 1 ? -mvx / mv : 0, by = mv > 1 ? -mvy / mv : 1; // (behind it)
  if (e.burn > 0) { // Melting: it sags and drips, with holes eaten in it
    ctx.globalAlpha = a0 * 0.45; ctx.fillStyle = '#2b3a10'; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const an = tfR(id, i) * TAU, d = r * 0.45 * tfR(id, i + 7), hr = Math.max(1.2, r * (0.1 + 0.06 * tfR(id, i + 3))); ctx.moveTo(x + Math.cos(an) * d + hr, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, hr, 0, TAU); }
    ctx.fill();
    ctx.globalAlpha = a0 * 0.9; ctx.fillStyle = ELEMENTS.fire.color; ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.8 + i / 3 + tfR(id, i)) % 1, dx = x + (tfR(id, i + 11) - 0.5) * r * 1.2, dy = y + r * 0.85 + k * r * 1.3, dr = Math.max(1, r * 0.09) * (1 - k * 0.5);
      ctx.moveTo(dx + dr, dy); ctx.ellipse(dx, dy, dr, dr * 1.6, 0, 0, TAU);
    }
    ctx.fill(); ctx.globalAlpha = a0;
  }
  if (e.frozen > 0) { // Stuck fast: a wobbling glob of snot round it, with a wet highlight
    ctx.globalAlpha = a0 * 0.5; ctx.fillStyle = ELEMENTS.ice.color; ctx.beginPath();
    for (let i = 0; i <= 10; i++) { const an = i / 10 * TAU, rr = r * (1.3 + 0.12 * Math.sin(t * 3 + i * 1.7 + id)); i ? ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : ctx.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = a0 * 0.8; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.7, Math.PI * 1.05, Math.PI * 1.45); ctx.stroke();
    ctx.globalAlpha = a0;
  } else if (e.chill > 0) { // Snotty: a glossy coat, and strands stretching out behind it
    ctx.globalAlpha = a0 * 0.3; ctx.fillStyle = ELEMENTS.ice.color; ctx.beginPath(); ctx.arc(x, y, r * 1.08, 0, TAU); ctx.fill();
    ctx.globalAlpha = a0 * 0.7; ctx.strokeStyle = ELEMENTS.ice.color; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath();
    for (let i = 0; i < 2; i++) {
      const s = (i ? 1 : -1) * r * 0.45, ox = x + bx * r * 0.9 - by * s * 0.5, oy = y + by * r * 0.9 + bx * s * 0.5, L = r * (0.9 + 0.4 * Math.sin(t * 2 + i + id));
      ctx.moveTo(ox, oy); ctx.quadraticCurveTo(ox + bx * L * 0.5 + Math.sin(t * 3 + i) * r * 0.2, oy + by * L * 0.5, ox + bx * L, oy + by * L);
    }
    ctx.stroke(); ctx.globalAlpha = a0;
  }
  if (sick(e)) { // Sick: a rash of spots that pulse, more of them the sicker it is
    const n = Math.min(7, 2 + e.poisonStacks);
    ctx.globalAlpha = a0 * 0.85; ctx.fillStyle = ELEMENTS.poison.color; ctx.beginPath();
    for (let i = 0; i < n; i++) { const an = tfR(id, i + 20) * TAU, d = r * 0.7 * Math.sqrt(tfR(id, i + 30)), sr = Math.max(1, r * 0.1 * (0.8 + 0.3 * Math.sin(t * 4 + i))); ctx.moveTo(x + Math.cos(an) * d + sr, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, sr, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = a0;
  }
  if (e.fizz > 0) { // Lubricated: a rainbow sheen sliding across it
    const k = (t * 0.7 + tfR(id, 40)) % 1, hues = ['#ff5fa2', '#ffd23f', '#7dff6a', '#3fe0ff', '#b49bff'];
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    for (let i = 0; i < hues.length; i++) {
      ctx.globalAlpha = a0 * 0.45; ctx.strokeStyle = hues[i]; ctx.beginPath();
      const an = -2.4 + k * 1.6 + i * 0.12; ctx.arc(x, y, r * 0.8, an, an + 0.5); ctx.stroke();
    }
    ctx.globalAlpha = a0;
  }
  if (e.pickle > 0) { // Soaking wet: a sharp highlight, and drops flicking off it
    ctx.globalAlpha = a0 * 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.4, Math.max(1.5, r * 0.18), Math.max(1, r * 0.1), -0.6, 0, TAU); ctx.fill();
    ctx.fillStyle = ELEMENTS.salt.color; ctx.beginPath();
    for (let i = 0; i < 2; i++) { const k = (t * 1.3 + i / 2 + tfR(id, i + 50)) % 1, an = tfR(id, i + 60) * TAU, d = r * (1 + k * 0.9), dr = Math.max(1, r * 0.08) * (1 - k); ctx.moveTo(x + Math.cos(an) * d + dr, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, dr, 0, TAU); }
    ctx.globalAlpha = a0 * 0.8; ctx.fill(); ctx.globalAlpha = a0;
  }
  if (e.bloodT > 0) { // Bleeding: dark veins spreading as it stacks, and a drip only while it moves
    const n = 2 + (e.bloodN || 1);
    ctx.globalAlpha = a0 * 0.75; ctx.strokeStyle = ELEMENTS.arcane.color; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath();
    for (let i = 0; i < n; i++) { let an = tfR(id, i + 70) * TAU, px = x + Math.cos(an) * r * 0.2, py = y + Math.sin(an) * r * 0.2; ctx.moveTo(px, py); for (let j = 1; j <= 3; j++) { an += (tfR(id, i * 3 + j) - 0.5) * 0.9; px = x + Math.cos(an) * r * (0.2 + j * 0.25); py = y + Math.sin(an) * r * (0.2 + j * 0.25); ctx.lineTo(px, py); } }
    ctx.stroke();
    if (mv > 12) { const k = (t * 2 + tfR(id, 80)) % 1; ctx.globalAlpha = a0 * (1 - k); ctx.fillStyle = ELEMENTS.arcane.color; ctx.beginPath(); ctx.ellipse(x + bx * r * (1 + k), y + by * r * (1 + k), Math.max(1, r * 0.09), Math.max(1.5, r * 0.14), Math.atan2(by, bx) + Math.PI / 2, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = a0;
  }
  if (e.curse > 0) { // Cursed: its soul pulling out of it, lagging behind, eyes aglow
    const ox = x + bx * r * 0.45 + Math.sin(t * 2 + id) * r * 0.12, oy = y + by * r * 0.45 - r * 0.15;
    ctx.globalAlpha = a0 * (0.3 + 0.1 * Math.sin(t * 4 + id)); ctx.strokeStyle = ELEMENTS.soul.color; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath(); ctx.arc(ox, oy, r * 1.02, 0, TAU); ctx.stroke();
    ctx.globalAlpha = a0 * 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(ox + s * r * 0.28 + r * 0.08, oy - r * 0.15); ctx.arc(ox + s * r * 0.28, oy - r * 0.15, Math.max(1, r * 0.08), 0, TAU); } ctx.fill();
    ctx.globalAlpha = a0;
  }
  if (e.xrayT > G.t) { // TOASTER IN THE BATH: an x-ray flash of its skeleton
    ctx.globalAlpha = a0 * 0.85; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(x, y, r * 0.95, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.beginPath();
    ctx.moveTo(x, y - r * 0.75); ctx.lineTo(x, y + r * 0.6);
    for (let i = 0; i < 3; i++) { const yy = y - r * 0.35 + i * r * 0.28, w = r * (0.55 - i * 0.08); ctx.moveTo(x - w, yy + r * 0.12); ctx.quadraticCurveTo(x, yy - r * 0.15, x + w, yy + r * 0.12); }
    ctx.moveTo(x - r * 0.18 + r * 0.16, y - r * 0.62); ctx.arc(x - r * 0.18, y - r * 0.62, r * 0.16, 0, TAU); ctx.moveTo(x + r * 0.18 + r * 0.16, y - r * 0.62); ctx.arc(x + r * 0.18, y - r * 0.62, r * 0.16, 0, TAU);
    ctx.stroke(); ctx.globalAlpha = a0;
  }
}

// ---------------------------------------------------------------- puddles and patches (true: drawn here)
function typeZone(z, x, y, r, a) {
  const t = G.realT, s = (z.x * 13 + z.y * 7) % 1000;
  if (z.oil) { // a dark slick with oil-on-water colours swirling in it
    ctx.globalAlpha = a * 0.45; ctx.fillStyle = '#2a1d08'; blobFill(x, y, r, s, t * 0.3);
    const hues = ['#ff5fa2', '#ffd23f', '#3fe0ff', '#b49bff'];
    ctx.lineWidth = Math.max(1, r * 0.08);
    for (let i = 0; i < hues.length; i++) { ctx.globalAlpha = a * 0.35; ctx.strokeStyle = hues[i]; ctx.beginPath(); const an = t * 0.6 + i * 1.4 + s; ctx.arc(x + Math.cos(an) * r * 0.2, y + Math.sin(an) * r * 0.2, r * (0.35 + i * 0.1), an, an + 1.6); ctx.stroke(); }
    return true;
  }
  if (z.heal) { // a pool of blood, drying darker at the edge
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = '#6a0d25'; blobFill(x, y, r * 1.05, s, 0);
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = ELEMENTS.arcane.color; blobFill(x, y, r * 0.8, s + 3, 0);
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.15, r * 0.07, -0.5, 0, TAU); ctx.fill();
    return true;
  }
  if (z.snot) { // raised blobs of snot joined by strands
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = ELEMENTS.ice.color; ctx.beginPath();
    const P = []; for (let i = 0; i < 4; i++) { const an = (s + i * 1.7) % TAU, d = r * 0.55 * ((i * 37 + s) % 10) / 10; P.push([x + Math.cos(an) * d, y + Math.sin(an) * d, r * (0.25 + 0.08 * (i % 3))]); }
    for (const [px, py, pr] of P) { ctx.moveTo(px + pr, py); ctx.arc(px, py, pr * (1 + 0.05 * Math.sin(t * 3 + px)), 0, TAU); }
    ctx.fill();
    ctx.strokeStyle = ELEMENTS.ice.color; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath();
    for (let i = 1; i < P.length; i++) { ctx.moveTo(P[i - 1][0], P[i - 1][1]); ctx.quadraticCurveTo((P[i - 1][0] + P[i][0]) / 2, (P[i - 1][1] + P[i][1]) / 2 + r * 0.15, P[i][0], P[i][1]); }
    ctx.stroke();
    return true;
  }
  if (z.water) { // the slide is already water: just a ripple, fading fast
    const k = 1 - z.life / z.max;
    ctx.globalAlpha = a * (1 - k) * 0.7; ctx.strokeStyle = ELEMENTS.salt.color; ctx.lineWidth = Math.max(1, r * 0.06);
    ctx.beginPath(); ctx.arc(x, y, r * (0.4 + k * 0.8), 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r * (0.2 + k * 0.5), 0, TAU); ctx.stroke();
    return true;
  }
  if (z.flame) { // GREASE FIRE and NAPALM: the only real flames in the game
    const rc = RAW_COL; RAW_COL = true; // (real fire colours: ELEM_SWAP would turn these orange tones into Acid green)
    ctx.globalAlpha = a * 0.25; ctx.fillStyle = '#ff5a00'; blobFill(x, y, r, s, 0);
    for (const [c, k] of [['#ff5a36', 1], ['#ffd166', 0.55]]) {
      ctx.globalAlpha = a * 0.85; ctx.fillStyle = c; ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const an = (s + i * 2.39) % TAU, d = r * 0.7 * (((i * 53 + s) % 10) / 10), fx = x + Math.cos(an) * d, fy = y + Math.sin(an) * d, fl = r * 0.35 * (0.6 + 0.4 * Math.sin(t * 11 + i * 2.3)) * k, w = r * 0.1 * k;
        ctx.moveTo(fx - w, fy); ctx.quadraticCurveTo(fx - w, fy - fl, fx + Math.sin(t * 9 + i) * w, fy - fl * 1.6); ctx.quadraticCurveTo(fx + w, fy - fl, fx + w, fy); ctx.closePath();
      }
      ctx.fill();
    }
    RAW_COL = rc;
    return true;
  }
  return false;
}
// A soft wobbling blob (seeded by s, turning slowly with turn), filled with the current fillStyle.
function blobFill(x, y, r, s, turn) {
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) { const an = i / 12 * TAU + turn, rr = r * (0.85 + 0.15 * Math.sin(i * 1.9 + s)); i ? ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr) : ctx.moveTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill();
}

// ---------------------------------------------------------------- shot trails (your shots only)
const SHOT_FX = { // [particle, colour, per second, speed, life, size, direction (null: any), spread]
  fire: ['drop', '#c6ff3d', 6, 25, 0.45, 2, Math.PI / 2, 0.3], ice: ['drop', '#a8b84a', 4, 10, 0.6, 2.2, null, 0], shock: ['spark', '#ffe94a', 10, 60, 0.18, 1.5, null, 0],
  poison: ['bubble', '#ff5fa2', 4, 15, 0.6, 2, -Math.PI / 2, 0.6], oxi: ['spark', '#f2c879', 3, 10, 0.3, 1.5, null, 0], salt: ['drop', '#3d8bff', 5, 30, 0.35, 1.8, null, 0],
  arcane: ['drop', '#c9184a', 6, 20, 0.5, 2, Math.PI / 2, 0.2], soul: ['smoke', '#bff4ff', 6, 8, 0.6, 3, -Math.PI / 2, 0.5],
};
function typeShotFx(pr, dt) {
  const el = pr.src && pr.src.elem, F = el && SHOT_FX[el];
  if (!F || pr.mine || G.parts.length > 260 || Math.random() > F[2] * dt) return;
  fxParts(F[0], pr.x, pr.y, F[1], 1, F[3], F[4], F[5], F[6] == null ? Math.random() * TAU : F[6], F[7]);
}

// ---------------------------------------------------------------- Lab view: the real microscope
const labOn = () => typeof SET !== 'undefined' && !viewArcade();
// Everything drawn on the slide loses its colour (one pass over the world, before the HUD).
function labGrey() {
  if (!labOn()) return;
  const op = ctx.globalCompositeOperation, rc = RAW_COL;
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'saturation'; RAW_COL = true; ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = op; RAW_COL = rc;
}
// The eyepiece: a round field with a soft dark edge, and specks of dust on the glass (the scale bar is drawn already).
let LAB_DUST = null;
function labEyepiece() {
  if (!labOn() || SET.clinical) return;
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H) / 2 * 0.98, df = !!SET.darkfield, rc = RAW_COL;
  RAW_COL = true;
  const g = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.75, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0.92)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (!LAB_DUST || LAB_DUST.w !== W) { LAB_DUST = { w: W, d: [] }; for (let i = 0; i < 14; i++) LAB_DUST.d.push([tfR(i + 1, 3) * W, tfR(i + 1, 5) * H, 1 + tfR(i + 1, 9) * 3.5, tfR(i + 1, 13)]); }
  ctx.fillStyle = df ? '#ffffff' : '#000000';
  for (const [x, y, r, k] of LAB_DUST.d) { ctx.globalAlpha = 0.06 + 0.08 * k; ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.6 + 0.4 * k), k * 3, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1; RAW_COL = rc;
}
