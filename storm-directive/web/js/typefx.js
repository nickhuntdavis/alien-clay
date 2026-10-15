'use strict';
// Spawn Prawn - how the damage types look (Pass 5 of the damage type rework; STYLE.md). One motion per type:
// Acid drips, Mucus stretches, Static jitters, Cooties pulse (rash), Oil gleams, Water ripples, Blood bleeds,
// Soul drifts. Each status is drawn in the enemy's body, so it reads with no colour at all (Lab view); Arcade
// view adds coloured rings that drain to show the time left (drawEnemy, render.js).
// Lab view is the real microscope: nothing on the slide has colour (labGrey, after the world is drawn), with a
// round eyepiece edge and dust on the glass (labEyepiece).
// Hooks: typeStatusFx (drawStatusFx, foes.js), typeRings (drawEnemy, render.js), typeZone (the zone loop,
// render.js), typeShotFx (the projectile loop, game.js), labGrey and labEyepiece (render, after the world),
// typeRxFx (react, game.js; and chem.js for your puddles), drawTypeFx (render, with the effects), typeGhostUnder
// (render, under ghost allies).

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

// ---------------------------------------------------------------- helpers
// Small seeded numbers per enemy, so no two look alike and nothing flickers.
const tfR = (id, i) => ((id * 9301 + i * 49297) % 233280) / 233280;
const ha = (hex, a) => hex + Math.round(clamp(a, 0, 1) * 255).toString(16).padStart(2, '0'); // #rrggbb + alpha
// A wobbling organic outline (seeded by s, breathing with t) as the current path.
function blobPathT(x, y, r, s, t, wob, n) {
  n = n || 14; const P = [];
  for (let i = 0; i < n; i++) { const an = i / n * TAU, rr = r * (1 + wob * Math.sin(i * 2.3 + s) + wob * 0.6 * Math.sin(t * 2.2 + i * 1.3 + s)); P.push(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  // Smooth: a curve through the midpoints, using each point as its control (no corners).
  ctx.beginPath(); ctx.moveTo((P[2 * n - 2] + P[0]) / 2, (P[2 * n - 1] + P[1]) / 2);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.quadraticCurveTo(P[2 * i], P[2 * i + 1], (P[2 * i] + P[2 * j]) / 2, (P[2 * i + 1] + P[2 * j + 1]) / 2); }
  ctx.closePath();
}
function blobFill(x, y, r, s, turn) { blobPathT(x, y, r, s, turn, 0.12, 12); ctx.fill(); }
// A glossy volume: a radial gradient from a lit point to a darker rim.
function gloss(x, y, r, c0, c1, c2) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r);
  g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2); return g;
}
// A hanging drop: round at the bottom, drawn to a point at the top (tip at x, y; length L).
function dropPath(x, y, w, L) {
  ctx.moveTo(x, y); ctx.bezierCurveTo(x + w * 0.2, y + L * 0.45, x + w, y + L * 0.55, x + w, y + L - w);
  ctx.arc(x, y + L - w, w, 0, Math.PI); ctx.bezierCurveTo(x - w, y + L * 0.55, x - w * 0.2, y + L * 0.45, x, y);
}
// A tapered strand from (x0, y0) to (x1, y1), sagging by sag, width w at the root.
function strand(x0, y0, x1, y1, w, sag) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + sag, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  ctx.beginPath(); ctx.moveTo(x0 + nx * w, y0 + ny * w); ctx.quadraticCurveTo(mx + nx * w * 0.3, my + ny * w * 0.3, x1, y1); ctx.quadraticCurveTo(mx - nx * w * 0.3, my - ny * w * 0.3, x0 - nx * w, y0 - ny * w); ctx.closePath(); ctx.fill();
}

// ---------------------------------------------------------------- statuses in the body
function typeStatusFx(e, x, y, r) {
  const t = G.realT, id = e.id || 0, a0 = ctx.globalAlpha;
  const mvx = e.svx || 0, mvy = e.svy || 0, mv = Math.hypot(mvx, mvy), bx = mv > 1 ? -mvx / mv : 0, by = mv > 1 ? -mvy / mv : 1; // (behind it)
  const A = k => { ctx.globalAlpha = a0 * k; };
  if (e.burn > 0) { // Melting: a corroding rim, pitted holes with glowing edges, fizz, drips that stretch and fall, steam
    const C = ELEMENTS.fire.color;
    A(0.55); ctx.fillStyle = (() => { const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r * 1.12); g.addColorStop(0, ha(C, 0)); g.addColorStop(0.7, ha(C, 0.45)); g.addColorStop(1, ha(C, 0)); return g; })();
    ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, TAU); ctx.fill();
    A(0.35); ctx.fillStyle = C; for (let i = 0; i < 2; i++) { const an = tfR(id, i + 15) * TAU; blobPathT(x + Math.cos(an) * r * 0.35, y + Math.sin(an) * r * 0.35, r * 0.32, id + i, 0, 0.2, 9); ctx.fill(); } // (eaten patches)
    for (let i = 0; i < 3; i++) { // pits
      const an = tfR(id, i) * TAU, d = r * 0.5 * tfR(id, i + 7), hx = x + Math.cos(an) * d, hy = y + Math.sin(an) * d, hr = Math.max(1.4, r * (0.11 + 0.07 * tfR(id, i + 3)) * (0.9 + 0.1 * Math.sin(t * 3 + i)));
      A(0.75); ctx.fillStyle = '#141a06'; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
      A(0.9); ctx.strokeStyle = C; ctx.lineWidth = Math.max(0.8, hr * 0.35); ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.stroke();
    }
    A(0.85); ctx.strokeStyle = '#f4ffd0'; ctx.lineWidth = Math.max(0.8, r * 0.04); ctx.beginPath(); // fizz at the rim
    for (let i = 0; i < 5; i++) { const k = (t * 1.6 + i / 5 + tfR(id, i + 40)) % 1, an = tfR(id, i + 41) * TAU, br = Math.max(1, r * 0.09 * (0.4 + k)), px = x + Math.cos(an) * r * (0.95 + k * 0.25), py = y + Math.sin(an) * r * (0.95 + k * 0.25) - k * r * 0.3; ctx.moveTo(px + br, py); ctx.arc(px, py, br, 0, TAU); }
    ctx.stroke();
    for (let i = 0; i < 3; i++) { // drips: stretch from the underside, then let go and fall
      const k = (t * 0.55 + i / 3 + tfR(id, i)) % 1, ox = x + (tfR(id, i + 11) - 0.5) * r * 1.3, base = y + r * Math.sqrt(Math.max(0, 1 - ((ox - x) / r) ** 2)) * 0.95;
      const w = Math.max(1.2, r * 0.1), stretch = k < 0.6 ? k / 0.6 : 1, fall = k < 0.6 ? 0 : (k - 0.6) / 0.4;
      A(0.95 * (1 - fall * 0.8)); ctx.fillStyle = gloss(ox, base + r * 0.3, w * 2, '#f4ffd0', C, '#6b8f14'); ctx.beginPath();
      if (fall) { const fy = base + r * 0.4 + fall * fall * r * 1.6; ctx.ellipse(ox, fy, w, w * 1.3, 0, 0, TAU); } else dropPath(ox, base - w * 0.5, w * (0.5 + 0.5 * stretch), r * (0.15 + 0.4 * stretch));
      ctx.fill();
    }
    A(0.22); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineCap = 'round'; ctx.beginPath(); // steam
    for (let i = 0; i < 2; i++) { const k = (t * 0.5 + i / 2 + tfR(id, i + 90)) % 1, sx0 = x + (i ? 0.3 : -0.3) * r, sy0 = y - r * (0.9 + k * 1.2); ctx.moveTo(sx0, sy0 + r * 0.4); ctx.bezierCurveTo(sx0 + r * 0.3 * Math.sin(t * 2 + i), sy0 + r * 0.2, sx0 - r * 0.3 * Math.sin(t * 2 + i), sy0, sx0, sy0 - r * 0.3); }
    ctx.stroke(); ctx.lineCap = 'butt';
  }
  if (e.frozen > 0) { // Stuck fast: a wobbling glob of snot with trapped bubbles, a wet highlight and a strand to the floor
    const C = ELEMENTS.ice.color, s = id * 0.37, sq = 1 + 0.05 * Math.sin(t * 7 + id);
    A(0.6); ctx.fillStyle = gloss(x, y, r * 1.45, ha('#eef2c8', 0.9), ha(C, 0.7), ha('#55621c', 0.85));
    ctx.save(); ctx.translate(x, y); ctx.scale(sq, 2 - sq); blobPathT(0, 0, r * 1.35, s, t, 0.07, 16); ctx.restore(); ctx.fill();
    A(0.55); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.8, r * 0.035); ctx.beginPath();
    for (let i = 0; i < 4; i++) { const an = tfR(id, i + 20) * TAU, d = r * (0.4 + 0.6 * tfR(id, i + 21)), br = Math.max(1, r * (0.06 + 0.06 * tfR(id, i + 22))); ctx.moveTo(x + Math.cos(an) * d + br, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, br, 0, TAU); }
    ctx.stroke();
    A(0.9); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.2, r * 0.12); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.95, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
    A(1); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + r * 0.55, y - r * 0.6, Math.max(1, r * 0.08), 0, TAU); ctx.fill(); ctx.lineCap = 'butt';
    A(0.6); ctx.fillStyle = ha(C, 0.8); strand(x + r * 0.3, y + r * 1.2, x + r * 0.5, y + r * 1.9 + Math.sin(t * 2 + id) * r * 0.1, Math.max(1, r * 0.12), r * 0.15);
  } else if (e.chill > 0) { // Snotty: a translucent gloss coat, beaded strands stretching out behind
    const C = ELEMENTS.ice.color, k = clamp(e.chillAmt / 0.6, 0.2, 1);
    A(0.75); ctx.fillStyle = gloss(x, y, r * 1.15, ha('#f2f5d8', 0.55), ha(C, 0.35 + 0.35 * k), ha('#55621c', 0.75)); blobPathT(x, y, r * 1.12, id, t, 0.05, 14); ctx.fill();
    A(0.7); ctx.strokeStyle = ha('#dfe6b0', 0.9); ctx.lineWidth = Math.max(1, r * 0.05); ctx.stroke();
    { const k2 = (t * 0.6 + tfR(id, 5)) % 1; A(0.9); ctx.fillStyle = gloss(x + r * 0.2, y + r, r * 0.2, '#ffffff', C, '#55621c'); ctx.beginPath(); dropPath(x + r * 0.2, y + r * 0.95, Math.max(1.2, r * 0.1), r * (0.25 + 0.45 * k2)); ctx.fill(); } // (a drool, stretching)
    A(0.8); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r * 0.85, Math.PI * 1.15, Math.PI * 1.4); ctx.stroke(); ctx.lineCap = 'butt';
    const n = 1 + Math.round(k * 2);
    for (let i = 0; i < n; i++) {
      const sp = (i - (n - 1) / 2) * r * 0.5, ox = x + bx * r * 0.85 - by * sp * 0.6, oy = y + by * r * 0.85 + bx * sp * 0.6, L = r * (0.8 + 0.6 * k + 0.25 * Math.sin(t * 2.4 + i + id));
      const ex = ox + bx * L + Math.sin(t * 3 + i) * r * 0.15, ey = oy + by * L + r * 0.25;
      A(0.9); ctx.fillStyle = ha(C, 0.95); strand(ox, oy, ex, ey, Math.max(1, r * 0.13), r * 0.2);
      A(0.9); ctx.fillStyle = gloss(ex, ey, r * 0.12, '#ffffff', C, '#55621c'); ctx.beginPath(); ctx.arc(ex, ey, Math.max(1.5, r * 0.15), 0, TAU); ctx.fill();
    }
  }
  if (sick(e)) { // Sick: a feverish blush and raised pustules that throb, sweat beading off
    const C = ELEMENTS.poison.color, n = Math.min(8, 2 + e.poisonStacks), th = 0.5 + 0.5 * Math.sin(t * 5 + id);
    A(0.18 + 0.1 * th); ctx.fillStyle = (() => { const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.25); g.addColorStop(0, ha(C, 0.6)); g.addColorStop(1, ha(C, 0)); return g; })(); ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
    for (let i = 0; i < n; i++) {
      const an = tfR(id, i + 20) * TAU, d = r * 0.75 * Math.sqrt(tfR(id, i + 30)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d, sr = Math.max(1.3, r * (0.09 + 0.05 * tfR(id, i + 31)) * (0.85 + 0.25 * Math.sin(t * 5 + i * 1.7)));
      A(0.95); ctx.fillStyle = gloss(px, py, sr, '#ffe0ef', C, '#9c1f55'); ctx.beginPath(); ctx.arc(px, py, sr, 0, TAU); ctx.fill();
      A(0.8); ctx.fillStyle = '#fff4c2'; ctx.beginPath(); ctx.arc(px + sr * 0.1, py + sr * 0.1, sr * 0.35, 0, TAU); ctx.fill();
    }
    const k = (t * 0.9 + tfR(id, 99)) % 1; A(0.8 * (1 - k)); ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); dropPath(x + r * 0.7, y - r * 0.2 + k * r * 0.9, Math.max(1, r * 0.07), r * 0.25); ctx.fill();
  }
  if (e.fizz > 0) { // Lubricated: a dark oily film with thin-film colours sliding across it, and a hard glint
    A(0.6); ctx.fillStyle = gloss(x, y, r * 1.1, ha('#f2c879', 0.7), ha('#7a4f0f', 0.45), ha('#2a1d08', 0.85)); ctx.beginPath(); ctx.arc(x, y, r * 1.08, 0, TAU); ctx.fill();
    A(0.8); ctx.strokeStyle = '#f2c879'; ctx.lineWidth = Math.max(1, r * 0.05); ctx.stroke();
    const k = (t * 0.45 + tfR(id, 40)) % 1, g = ctx.createLinearGradient(x - r, y - r, x + r, y + r), off = k;
    for (const [o, c] of [[0, '#ff5fa2'], [0.2, '#ffd23f'], [0.4, '#7dff6a'], [0.6, '#3fe0ff'], [0.8, '#b49bff'], [1, '#ff5fa2']]) g.addColorStop((o + off) % 1, ha(c, 0.75));
    A(0.9); ctx.strokeStyle = g; ctx.lineWidth = Math.max(2, r * 0.2); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, r * 0.8, -2.8 + k * 1.4, -0.9 + k * 1.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0.4 + k * 1.4, 2.2 + k * 1.4); ctx.stroke();
    ctx.lineWidth = Math.max(1.2, r * 0.1); ctx.beginPath(); ctx.arc(x, y, r * 0.3, 2.6 + k * 1.4, 4.2 + k * 1.4); ctx.stroke();
    { const k2 = (t * 0.5 + tfR(id, 6)) % 1; A(0.9 * (1 - k2 * 0.5)); ctx.fillStyle = gloss(x - r * 0.3, y + r, r * 0.2, '#f2c879', '#7a4f0f', '#2a1d08'); ctx.beginPath(); dropPath(x - r * 0.3, y + r * 0.95, Math.max(1.2, r * 0.1), r * (0.2 + 0.35 * k2)); ctx.fill(); }
    A(1); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.07); ctx.beginPath(); ctx.arc(x, y, r * 0.95, -2.2 + Math.sin(t * 1.5 + id) * 0.2, -1.8 + Math.sin(t * 1.5 + id) * 0.2); ctx.stroke(); ctx.lineCap = 'butt';
  }
  if (e.pickle > 0) { // Soaking wet: a blue water film, beads of water on the surface, sharp glints, drops flicking off with streaks
    const C = ELEMENTS.salt.color;
    A(0.3); ctx.fillStyle = gloss(x, y, r * 1.1, ha('#e8f2ff', 0.4), ha(C, 0.18), ha(C, 0.5)); ctx.beginPath(); ctx.arc(x, y, r * 1.08, 0, TAU); ctx.fill();
    for (let i = 0; i < 5; i++) { const an = tfR(id, i + 50) * TAU, d = r * (0.3 + 0.6 * tfR(id, i + 51)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d, br = Math.max(1, r * (0.06 + 0.05 * tfR(id, i + 52)));
      A(0.85); ctx.fillStyle = gloss(px, py, br, '#ffffff', ha(C, 0.6), ha('#0d2e66', 0.8)); ctx.beginPath(); ctx.arc(px, py, br, 0, TAU); ctx.fill(); }
    A(1); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - r * 0.38, y - r * 0.42, Math.max(1.5, r * 0.2), Math.max(1, r * 0.08), -0.7, 0, TAU); ctx.fill();
    for (let i = 0; i < 2; i++) { const k = (t * 1.4 + i / 2 + tfR(id, i + 60)) % 1, an = tfR(id, i + 61) * TAU, d = r * (1 + k * 1.1), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d + k * k * r * 0.6, dr = Math.max(1, r * 0.09) * (1 - k * 0.6);
      A(0.5 * (1 - k)); ctx.strokeStyle = C; ctx.lineWidth = dr; ctx.beginPath(); ctx.moveTo(px - Math.cos(an) * r * 0.25, py - Math.sin(an) * r * 0.25); ctx.lineTo(px, py); ctx.stroke();
      A(0.9 * (1 - k)); ctx.fillStyle = gloss(px, py, dr, '#ffffff', C, '#0d2e66'); ctx.beginPath(); ctx.arc(px, py, dr, 0, TAU); ctx.fill(); }
  }
  if (e.bloodT > 0) { // Bleeding: branching dark veins, open gashes, and a drip trail only while it moves
    const C = ELEMENTS.arcane.color, n = 2 + (e.bloodN || 1);
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let an = tfR(id, i + 70) * TAU, px = x + Math.cos(an) * r * 0.15, py = y + Math.sin(an) * r * 0.15;
      for (let j = 1; j <= 4; j++) { const an2 = an + (tfR(id, i * 4 + j) - 0.5) * 1.1, qx = x + Math.cos(an2) * r * (0.15 + j * 0.21), qy = y + Math.sin(an2) * r * (0.15 + j * 0.21);
        A(0.85); ctx.strokeStyle = j < 3 ? '#6a0d25' : C; ctx.lineWidth = Math.max(0.6, r * 0.09 * (1 - j / 5)); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke(); px = qx; py = qy; an = an2; }
    }
    for (let i = 0; i < Math.min(3, e.bloodN || 1); i++) { const an = tfR(id, i + 75) * TAU, gx = x + Math.cos(an) * r * 0.45, gy = y + Math.sin(an) * r * 0.45, gl = r * 0.32, ga = an + 1.2;
      A(0.95); ctx.fillStyle = '#2a0410'; ctx.beginPath(); ctx.ellipse(gx, gy, gl, Math.max(0.8, r * 0.06), ga, 0, TAU); ctx.fill();
      A(0.9); ctx.strokeStyle = C; ctx.lineWidth = Math.max(0.6, r * 0.04); ctx.stroke(); }
    ctx.lineCap = 'butt';
    if (mv > 12) for (let i = 0; i < 2; i++) { const k = (t * 2.2 + i / 2 + tfR(id, 80)) % 1, px = x + bx * r * (0.9 + k * 1.2) + (i ? 1 : -1) * r * 0.2, py = y + by * r * (0.9 + k * 1.2);
      A(0.95 * (1 - k)); ctx.fillStyle = gloss(px, py, r * 0.12, '#ff9fb3', C, '#4a0818'); ctx.beginPath(); ctx.ellipse(px, py, Math.max(1, r * 0.1), Math.max(1.4, r * 0.15), Math.atan2(by, bx) + Math.PI / 2, 0, TAU); ctx.fill(); }
  }
  if (e.curse > 0) { // Cursed: its soul pulling out of it, a pale wailing ghost lagging behind
    const C = ELEMENTS.soul.color, wob = Math.sin(t * 2.5 + id), pull = 1 + 0.15 * Math.sin(t * 1.7 + id), ox = x + bx * r * 1.05 * pull + wob * r * 0.15, oy = y + by * r * 0.8 * pull - r * 0.7, gr = r * 0.62;
    A(0.35); ctx.strokeStyle = ha(C, 0.8); ctx.lineWidth = Math.max(1, r * 0.06); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ox) / 2 + wob * r * 0.3, (y + oy) / 2 + r * 0.3, ox, oy + gr * 0.8); ctx.stroke(); ctx.setLineDash([]); // (the thread still holding it)
    glow(ox, oy, gr * 2, C, 0.25);
    A(0.6 + 0.1 * Math.sin(t * 4 + id)); ctx.fillStyle = gloss(ox, oy, gr * 1.2, '#ffffff', ha(C, 0.85), ha(C, 0.15));
    ctx.beginPath(); ctx.arc(ox, oy, gr, Math.PI, 0); // a sheet-ghost: round head, wavy hem
    for (let i = 0; i <= 6; i++) { const px = ox + gr - i / 6 * gr * 2, py = oy + gr * (1.05 + 0.22 * Math.sin(i * 2.1 + t * 7 + id)); ctx.lineTo(px, py); }
    ctx.closePath(); ctx.fill();
    A(0.85); ctx.fillStyle = '#0a1a22'; ctx.beginPath();
    for (const sgn of [-1, 1]) { ctx.moveTo(ox + sgn * gr * 0.32 + gr * 0.14, oy - gr * 0.1); ctx.ellipse(ox + sgn * gr * 0.32, oy - gr * 0.1, gr * 0.14, gr * 0.2, 0, 0, TAU); }
    ctx.moveTo(ox + gr * 0.12, oy + gr * 0.35); ctx.ellipse(ox, oy + gr * 0.35, gr * 0.12, gr * (0.16 + 0.06 * Math.sin(t * 6 + id)), 0, 0, TAU); ctx.fill();
  }
  if (e.xrayT > G.t) { // TOASTER IN THE BATH: an x-ray flash of its skeleton, flickering
    if (Math.random() < 0.85) {
      A(0.9); ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(x, y, r * 1.02, 0, TAU); ctx.fill();
      glow(x, y, r * 1.6, '#bde0fe', 0.5);
      A(1); ctx.strokeStyle = '#eaf6ff'; ctx.lineWidth = Math.max(1, r * 0.09); ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(x, y - r * 0.55); ctx.lineTo(x, y + r * 0.65);
      for (let i = 0; i < 4; i++) { const yy = y - r * 0.32 + i * r * 0.22, w = r * (0.58 - i * 0.07); ctx.moveTo(x - w, yy + r * 0.14); ctx.quadraticCurveTo(x, yy - r * 0.14, x + w, yy + r * 0.14); }
      ctx.stroke(); ctx.beginPath(); ctx.arc(x, y - r * 0.62, r * 0.24, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(x - r * 0.09, y - r * 0.64, r * 0.06, 0, TAU); ctx.arc(x + r * 0.09, y - r * 0.64, r * 0.06, 0, TAU); ctx.fill(); ctx.lineCap = 'butt';
    }
  }
  if (e.bowlT > G.t) { // sent bowling: speed streaks behind it
    A(0.5); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = -1; i <= 1; i++) { const ox = x + bx * r * 1.1 - by * i * r * 0.45, oy = y + by * r * 1.1 + bx * i * r * 0.45; ctx.moveTo(ox, oy); ctx.lineTo(ox + bx * r * (1.2 - Math.abs(i) * 0.4), oy + by * r * (1.2 - Math.abs(i) * 0.4)); }
    ctx.stroke(); ctx.lineCap = 'butt';
  }
  ctx.globalAlpha = a0;
}
// Ghost allies (Soul): a glow and a wispy tail under the see-through body (render.js, before drawEnemy).
function typeGhostUnder(e) {
  const x = sx(e.x), y = sy(e.y), r = (e.r || 12) * S, t = G.realT, C = ELEMENTS.soul.color, mv = Math.hypot(e.svx || 0, e.svy || 0), bx = mv > 1 ? -e.svx / mv : 0, by = mv > 1 ? -e.svy / mv : 1, a0 = ctx.globalAlpha;
  glow(x, y, r * 2.4, C, 0.35);
  ctx.globalAlpha = a0 * 0.35; ctx.fillStyle = gloss(x, y, r * 1.4, '#ffffff', ha(C, 0.6), ha(C, 0));
  const tx = x + bx * r * 2.4 + Math.sin(t * 3 + e.id) * r * 0.4, ty = y + by * r * 2.4;
  ctx.beginPath(); ctx.moveTo(x - by * r, y + bx * r); ctx.quadraticCurveTo(x + bx * r * 1.4 - by * r * 0.6, y + by * r * 1.4 + bx * r * 0.6, tx, ty); ctx.quadraticCurveTo(x + bx * r * 1.4 + by * r * 0.6, y + by * r * 1.4 - bx * r * 0.6, x + by * r, y - bx * r); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = a0;
}

// ---------------------------------------------------------------- puddles and patches (true: drawn here)
function typeZone(z, x, y, r, a) {
  const t = G.realT, s = ((z.x * 13 + z.y * 7) % 1000) / 37, A = k => { ctx.globalAlpha = a * k; };
  if (z.oil) { // a dark slick: a soft shadow, a body with a bright meniscus, thin-film colours swirling slowly, and glints
    A(0.25); ctx.fillStyle = '#000000'; blobPathT(x + r * 0.05, y + r * 0.07, r * 1.02, s, t * 0.3, 0.1); ctx.fill();
    A(0.7); ctx.fillStyle = gloss(x, y, r, ha('#6b4a12', 0.9), ha('#2a1d08', 0.85), ha('#120c03', 0.9)); blobPathT(x, y, r, s, t * 0.3, 0.1); ctx.fill();
    A(0.6); ctx.strokeStyle = '#f2c879'; ctx.lineWidth = Math.max(1, r * 0.04); ctx.stroke();
    ctx.lineCap = 'round';
    const hues = ['#ff5fa2', '#ffd23f', '#7dff6a', '#3fe0ff', '#b49bff'];
    for (let i = 0; i < hues.length; i++) { const an = t * (0.35 + i * 0.05) + i * 1.25 + s, rr = r * (0.25 + i * 0.12);
      A(0.42); ctx.strokeStyle = hues[i]; ctx.lineWidth = Math.max(1.2, r * 0.07); ctx.beginPath(); ctx.ellipse(x + Math.cos(an * 0.7) * r * 0.12, y + Math.sin(an * 0.7) * r * 0.08, rr, rr * 0.7, an * 0.3, an, an + 1.9); ctx.stroke(); }
    A(0.9); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.55, 3.6 + Math.sin(t + s) * 0.15, 4.1 + Math.sin(t + s) * 0.15); ctx.stroke();
    ctx.lineCap = 'butt';
    return true;
  }
  if (z.heal) { // a pool of blood: spatter round it, a dark drying edge, a glossy middle and a slow pulse
    const C = ELEMENTS.arcane.color, pulse = 1 + 0.03 * Math.sin(t * 3 + s);
    A(0.75); ctx.fillStyle = '#4a0818'; ctx.beginPath();
    for (let i = 0; i < 7; i++) { const an = (s * 3 + i * 0.9) % TAU, d = r * (1.15 + 0.35 * ((i * 37 + s * 10) % 10) / 10), dr = Math.max(1, r * (0.04 + 0.05 * (i % 3) / 2)); ctx.moveTo(x + Math.cos(an) * d + dr, y + Math.sin(an) * d); ctx.arc(x + Math.cos(an) * d, y + Math.sin(an) * d, dr, 0, TAU); }
    ctx.fill();
    A(0.85); ctx.fillStyle = '#3a0612'; blobPathT(x, y, r * 1.02 * pulse, s, 0, 0.12); ctx.fill();
    A(0.9); ctx.fillStyle = gloss(x, y, r * 0.85, '#ff5c7a', C, '#5a0a1d'); blobPathT(x, y, r * 0.85 * pulse, s + 2, 0, 0.1); ctx.fill();
    A(0.8); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.05); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.55, 3.7, 4.3); ctx.stroke(); ctx.lineCap = 'butt';
    return true;
  }
  if (z.snot) { // raised glossy blobs of snot joined by beaded, sagging strands
    const C = ELEMENTS.ice.color, P = [];
    for (let i = 0; i < 4; i++) { const an = (s + i * 1.7) % TAU, d = r * 0.6 * (((i * 37 + s * 10) % 10) / 10), br = r * (0.26 + 0.09 * (i % 3)) * (1 + 0.04 * Math.sin(t * 3 + i)); P.push([x + Math.cos(an) * d, y + Math.sin(an) * d, br]); }
    A(0.7); ctx.fillStyle = ha(C, 0.85);
    for (let i = 1; i < P.length; i++) strand(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], Math.max(1, r * 0.05), r * 0.18);
    for (const [px, py, br] of P) {
      A(0.3); ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(px + br * 0.1, py + br * 0.2, br, br * 0.8, 0, 0, TAU); ctx.fill();
      A(0.85); ctx.fillStyle = gloss(px, py, br, '#f2f5d8', C, '#55621c'); ctx.beginPath(); ctx.ellipse(px, py, br, br * 0.85, 0, 0, TAU); ctx.fill();
      A(0.9); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(px - br * 0.35, py - br * 0.35, br * 0.22, br * 0.12, -0.6, 0, TAU); ctx.fill();
    }
    return true;
  }
  if (z.water) { // the slide is already water: a crown of droplets, then refracting ripples (a light and a dark ring)
    const k = 1 - z.life / z.max, C = ELEMENTS.salt.color;
    for (let j = 0; j < 2; j++) { const rr = r * (0.3 + (k + j * 0.3) * 0.9);
      A((1 - k) * 0.6); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.arc(x, y - 0.7, rr, 0, TAU); ctx.stroke();
      A((1 - k) * 0.5); ctx.strokeStyle = C; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath(); ctx.arc(x, y + 0.9, rr, 0, TAU); ctx.stroke(); }
    if (k < 0.35) { const q = k / 0.35; A(1 - q); ctx.fillStyle = C; ctx.beginPath();
      for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + s, d = r * (0.3 + q * 0.6), h = Math.sin(q * Math.PI) * r * 0.5, px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * 0.6 - h, dr = Math.max(1, r * 0.06); ctx.moveTo(px + dr, py); ctx.arc(px, py, dr, 0, TAU); }
      ctx.fill(); }
    return true;
  }
  if (z.flame) { // GREASE FIRE and NAPALM: real flames, hot at the core, embers lifting off, a scorched floor
    const rc = RAW_COL; RAW_COL = true; // (real fire colours: ELEM_SWAP would turn these orange tones into Acid green)
    A(0.45); ctx.fillStyle = '#1a0d05'; blobPathT(x, y, r, s, 0, 0.12); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.6, '#ff6a00', 0.55 * a); ctx.globalCompositeOperation = 'source-over';
    const N = 9;
    for (let layer = 0; layer < 3; layer++) {
      const k = [1, 0.7, 0.4][layer];
      for (let i = 0; i < N; i++) {
        const an = (s + i * 2.39) % TAU, d = r * 0.75 * (((i * 53 + s * 10) % 10) / 10), fx = x + Math.cos(an) * d, fy = y + Math.sin(an) * d * 0.7;
        const fl = r * 0.55 * (0.6 + 0.4 * Math.sin(t * 11 + i * 2.3)) * k, w = r * 0.13 * k, sw = Math.sin(t * 9 + i) * w;
        const g = ctx.createLinearGradient(fx, fy, fx, fy - fl * 1.6); g.addColorStop(0, ['#ff3d00', '#ff9e00', '#fff3b0'][layer]); g.addColorStop(1, ['#ff3d0000', '#ffd16600', '#ffffff00'][layer]);
        A(0.9); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx - w, fy); ctx.quadraticCurveTo(fx - w, fy - fl, fx + sw, fy - fl * 1.6); ctx.quadraticCurveTo(fx + w, fy - fl, fx + w, fy); ctx.closePath(); ctx.fill();
      }
    }
    A(0.9); ctx.fillStyle = '#ffd166'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6 + s) % 1, ex = x + Math.sin(i * 2.7 + s + t) * r * 0.7, ey = y - k * r * 1.5, er = Math.max(0.8, r * 0.03 * (1 - k)); ctx.moveTo(ex + er, ey); ctx.arc(ex, ey, er, 0, TAU); }
    ctx.fill();
    RAW_COL = rc;
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- reaction moments
// Every reaction gets a short animated picture where it happens, in one of ten styles (react(), game.js).
const RX_STYLE = {
  zap: ['bath', 'overload', 'livewire', 'poltergeist', 'cardiac', 'shortcircuit', 'battery', 'shakes', 'overcharged'],
  splash: ['waterlogged', 'publicpool', 'dontmix', 'washedoff', 'snotslick', 'acidrain', 'diluted', 'rinse', 'softened'],
  goo: ['heartburn', 'ectoplasm', 'snotrocket', 'booger', 'snailtrail', 'scab', 'gluedown', 'snotshield'],
  blood: ['crimescene', 'hemorrhage', 'bloodclot', 'bloodpact', 'ulcer', 'gorged', 'dirtyneedle', 'thinned', 'topup'],
  ghost: ['holywater', 'soulrot', 'lastrites', 'possession', 'patientzero', 'zombie', 'baptism'],
  germ: ['pandemic', 'sushi', 'fluseason', 'sporesneeze', 'downstream', 'penicillin'],
  fire: ['greasefire', 'napalm', 'flareup', 'oilrig', 'fireball'],
  acid: ['meltdown', 'vinaigrette', 'flesheating', 'shellshock'],
  oil: ['slipnslide', 'lubedup'],
};
const RX_OF = {}; for (const k in RX_STYLE) for (const id of RX_STYLE[k]) RX_OF[id] = k;
const RX_DUR = { zap: 0.45, splash: 0.7, goo: 0.8, blood: 0.8, ghost: 1.1, germ: 1.2, fire: 0.8, acid: 0.9, oil: 0.9 };
function typeRxFx(x, y, r, id) {
  if (!G) return;
  const st = RX_OF[id] || 'pop', L = G.tfx || (G.tfx = []);
  if (L.length > 40) L.shift();
  L.push({ x, y, r: Math.max(18, r || 14), st, id, c: (REACTIONS[id] || {}).color || '#ffffff', t0: G.realT, dur: RX_DUR[st] || 0.6, seed: Math.random() * 100 });
}
// Drawn with the effects (render.js), in world space.
function drawTypeFx() {
  const L = G.tfx; if (!L || !L.length) return;
  const a0 = ctx.globalAlpha, op = ctx.globalCompositeOperation;
  for (let i = L.length - 1; i >= 0; i--) {
    const f = L[i], q = (G.realT - f.t0) / f.dur;
    if (q >= 1 || q < 0) { L.splice(i, 1); continue; }
    const x = sx(f.x), y = sy(f.y), R = f.r * S, s = f.seed, e = 1 - Math.pow(1 - q, 3), fade = 1 - q, A = k => { ctx.globalAlpha = a0 * k; };
    ctx.globalCompositeOperation = 'source-over';
    switch (f.st) {
      case 'zap': { // branching lightning bursting out, white-hot at the core
        ctx.globalCompositeOperation = 'lighter'; glow(x, y, R * (1.5 + e), f.c, 0.6 * fade);
        ctx.lineCap = 'round';
        for (let b = 0; b < 6; b++) {
          const an = s + b / 6 * TAU + Math.sin(G.realT * 40 + b) * 0.1, L2 = R * (1 + e * 1.6);
          for (const [w, c, al] of [[4, f.c, 0.5], [1.6, '#ffffff', 1]]) { A(al * fade); ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x, y);
            let px = x, py = y; for (let j = 1; j <= 5; j++) { const d = L2 * j / 5, jit = (Math.random() - 0.5) * R * 0.5; px = x + Math.cos(an) * d - Math.sin(an) * jit; py = y + Math.sin(an) * d + Math.cos(an) * jit; ctx.lineTo(px, py); }
            ctx.stroke(); }
        }
        ctx.lineCap = 'butt'; break;
      }
      case 'splash': { // a crown of droplets thrown up and out, and a ring spreading
        A(0.6 * fade); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, R * (0.6 + e * 1.6), R * (0.6 + e * 1.6) * 0.75, 0, 0, TAU); ctx.stroke();
        A(0.5 * fade); ctx.strokeStyle = f.c; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y + 2, R * (0.4 + e * 1.3), R * (0.4 + e * 1.3) * 0.75, 0, 0, TAU); ctx.stroke();
        for (let i = 0; i < 10; i++) { const an = s + i / 10 * TAU, d = R * (0.5 + e * 1.4), h = Math.sin(q * Math.PI) * R * 0.9, px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * 0.7 - h, dr = Math.max(1.5, R * 0.1 * fade);
          A(fade); ctx.fillStyle = gloss(px, py, dr, '#ffffff', f.c, '#0d2e66'); ctx.beginPath(); ctx.arc(px, py, dr, 0, TAU); ctx.fill(); }
        break;
      }
      case 'goo': { // strands of goo shooting out, stretching thin, then snapping into beads
        for (let i = 0; i < 7; i++) { const an = s + i / 7 * TAU + Math.sin(i * 3) * 0.3, d = R * (0.4 + e * 1.5), ex = x + Math.cos(an) * d, ey = y + Math.sin(an) * d + q * q * R * 0.6;
          if (q < 0.55) { A(0.85); ctx.fillStyle = f.c; strand(x, y, ex, ey, Math.max(1, R * 0.16 * (1 - q)), R * 0.2); }
          A(fade); ctx.fillStyle = gloss(ex, ey, R * 0.2, '#ffffff', f.c, '#3a4410'); ctx.beginPath(); ctx.arc(ex, ey, Math.max(1.5, R * 0.17 * (0.6 + 0.4 * fade)), 0, TAU); ctx.fill(); }
        A(0.7 * fade); ctx.fillStyle = gloss(x, y, R * 0.7, '#ffffff', f.c, '#3a4410'); blobPathT(x, y, R * 0.6 * (1 - q * 0.6), s, G.realT, 0.15); ctx.fill();
        break;
      }
      case 'blood': { // a spray of drops, then a splat left on the slide
        A(0.75 * Math.min(1, q * 4) * fade); ctx.fillStyle = '#5a0a1d'; blobPathT(x, y, R * (0.6 + e * 0.5), s, 0, 0.25, 12); ctx.fill();
        for (let i = 0; i < 12; i++) { const an = s + i * 2.39, d = R * (0.4 + e * (1.2 + (i % 4) * 0.3)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d + q * q * R * 0.5, dr = Math.max(1.2, R * (0.06 + 0.05 * (i % 3)) * (1 - q * 0.5));
          A(fade); ctx.fillStyle = gloss(px, py, dr, '#ff9fb3', f.c, '#4a0818'); ctx.beginPath(); ctx.arc(px, py, dr, 0, TAU); ctx.fill(); }
        break;
      }
      case 'ghost': { // a ghost rising out of it, wailing, and fading away
        const gy = y - e * R * 2.2, gr = R * (0.7 + e * 0.3), wob = Math.sin(G.realT * 6 + s) * gr * 0.15, C = f.c;
        ctx.globalCompositeOperation = 'lighter'; glow(x + wob, gy, gr * 2.2, C, 0.5 * fade); ctx.globalCompositeOperation = 'source-over';
        A(0.75 * fade); ctx.fillStyle = gloss(x + wob, gy, gr, '#ffffff', ha(C === '#ffffff' ? '#bff4ff' : C, 0.8), ha('#bff4ff', 0.1));
        ctx.beginPath(); ctx.arc(x + wob, gy, gr, Math.PI, 0); for (let i = 0; i <= 6; i++) { const px = x + wob + gr - i / 6 * gr * 2, py = gy + gr * (1.1 + 0.25 * Math.sin(i * 2 + G.realT * 10)); ctx.lineTo(px, py); } ctx.closePath(); ctx.fill();
        A(0.9 * fade); ctx.fillStyle = '#0a1a22'; ctx.beginPath(); for (const sg of [-1, 1]) { ctx.moveTo(x + wob + sg * gr * 0.32 + gr * 0.13, gy - gr * 0.1); ctx.ellipse(x + wob + sg * gr * 0.32, gy - gr * 0.1, gr * 0.13, gr * 0.2, 0, 0, TAU); }
        ctx.moveTo(x + wob + gr * 0.14, gy + gr * 0.4); ctx.ellipse(x + wob, gy + gr * 0.4, gr * 0.14, gr * 0.24, 0, 0, TAU); ctx.fill();
        break;
      }
      case 'germ': { // a cloud of wriggling germs spreading out
        A(0.35 * fade); ctx.fillStyle = (() => { const g = ctx.createRadialGradient(x, y, 0, x, y, R * (1 + e * 1.5)); g.addColorStop(0, ha(f.c, 0.5)); g.addColorStop(1, ha(f.c, 0)); return g; })(); ctx.beginPath(); ctx.arc(x, y, R * (1 + e * 1.5), 0, TAU); ctx.fill();
        for (let i = 0; i < 9; i++) { const an = s + i * 2.39 + G.realT * 0.5, d = R * (0.3 + e * (1 + (i % 3) * 0.4)), gx = x + Math.cos(an) * d, gy = y + Math.sin(an) * d, gr = Math.max(1.5, R * 0.13);
          A(fade); ctx.fillStyle = gloss(gx, gy, gr, '#ffe0ef', f.c, '#7a1840'); ctx.beginPath(); ctx.ellipse(gx, gy, gr * 1.3, gr, an, 0, TAU); ctx.fill();
          ctx.strokeStyle = f.c; ctx.lineWidth = 1; ctx.beginPath(); for (let j = 0; j < 6; j++) { const ca = an + j / 6 * TAU, w = Math.sin(G.realT * 20 + j + i) * 0.4; ctx.moveTo(gx + Math.cos(ca) * gr * 1.1, gy + Math.sin(ca) * gr * 1.1); ctx.lineTo(gx + Math.cos(ca + w) * gr * 1.8, gy + Math.sin(ca + w) * gr * 1.8); } ctx.stroke(); }
        break;
      }
      case 'fire': { // a fireball blooming, rolling up into smoke
        const rc = RAW_COL; RAW_COL = true;
        A(0.5 * fade); ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(x, y - e * R * 1.4, R * (0.6 + e * 1.2), 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        for (const [k, c] of [[1.3, '#ff3d00'], [0.95, '#ff9e00'], [0.55, '#fff3b0']]) { A(0.85 * fade); const rr = R * k * (0.5 + e); ctx.fillStyle = (() => { const g = ctx.createRadialGradient(x, y - e * R * 0.6, 0, x, y - e * R * 0.6, rr); g.addColorStop(0, c); g.addColorStop(1, c + '00'); return g; })(); ctx.beginPath(); ctx.arc(x, y - e * R * 0.6, rr, 0, TAU); ctx.fill(); }
        RAW_COL = rc; break;
      }
      case 'acid': { // a dome of acid bubbles boiling up and popping, with steam
        for (let i = 0; i < 10; i++) { const k = (q * 1.5 + i / 10) % 1, an = s + i * 2.39, d = R * (0.2 + 0.9 * ((i * 7) % 10) / 10), bx2 = x + Math.cos(an) * d, by2 = y + Math.sin(an) * d * 0.6 - k * R * 0.8, br = Math.max(1.5, R * 0.18 * Math.sin(k * Math.PI));
          A(0.9 * fade); ctx.fillStyle = gloss(bx2, by2, br, '#f4ffd0', ha(f.c, 0.7), ha('#6b8f14', 0.6)); ctx.beginPath(); ctx.arc(bx2, by2, br, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke(); }
        A(0.25 * fade); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = R * 0.18; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 3; i++) { const sx0 = x + (i - 1) * R * 0.5, sy0 = y - R * (0.6 + e * 1.2); ctx.moveTo(sx0, sy0 + R * 0.5); ctx.bezierCurveTo(sx0 + R * 0.3, sy0 + R * 0.2, sx0 - R * 0.3, sy0, sx0, sy0 - R * 0.4); } ctx.stroke(); ctx.lineCap = 'butt';
        break;
      }
      case 'oil': { // iridescent rings sliding out across the slide
        const hues = ['#ff5fa2', '#ffd23f', '#7dff6a', '#3fe0ff', '#b49bff'];
        for (let i = 0; i < hues.length; i++) { A(0.55 * fade); ctx.strokeStyle = hues[i]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x, y, R * (0.4 + e * 1.4 + i * 0.12), R * (0.4 + e * 1.4 + i * 0.12) * 0.7, 0, 0, TAU); ctx.stroke(); }
        break;
      }
      default: { ctx.globalCompositeOperation = 'lighter'; glow(x, y, R * (1 + e), f.c, 0.6 * fade); }
    }
  }
  ctx.globalAlpha = a0; ctx.globalCompositeOperation = op;
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
