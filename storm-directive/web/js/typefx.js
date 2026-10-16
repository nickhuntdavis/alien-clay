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
    const rc = RAW_COL;
    ctx.beginPath(); ctx.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + TAU * q); RAW_COL = true; softStroke(1.6, ELEMENTS[k].color, 0.9); RAW_COL = rc;
    n++;
  }
  return n;
}

// ---------------------------------------------------------------- helpers
// Small seeded numbers per enemy, so no two look alike and nothing flickers.
const TF_HUES = ['#ff5fa2', '#ffd23f', '#7dff6a', '#3fe0ff', '#b49bff'], TF_FIRE = [[1.3, '#ff3d00'], [0.95, '#ff9e00'], [0.55, '#fff3b0']];
const tfR = (id, i) => ((id * 9301 + i * 49297) % 233280) / 233280;
// #rrggbb + alpha, in 32 steps, from a cache: no new strings every frame (garbage made the game stutter).
const HA = new Map();
function ha(hex, a) {
  let row = HA.get(hex);
  if (!row) { row = []; for (let i = 0; i < 32; i++) row.push(hex + (i * 255 / 31 | 0).toString(16).padStart(2, '0')); HA.set(hex, row); }
  return row[Math.round(clamp(a, 0, 1) * 31)];
}
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

// Soft, organic edges (STYLE.md: nothing graphic on the slide). A feathered blob: an organic outline filled with
// colour c that fades to nothing at its edge, so there is no hard silhouette.
// (Three overlapping soft lobes, drifting a little: organic and feathered, and only three sprite stamps.)
function softBlob(x, y, r, s, t, wob, c, a, core) {
  const k = core == null ? 0.55 : core, R = r * (1 + wob * 1.6);
  const nl = FX.k < 0.85 || QUAL.lv >= 2 ? 2 : 3;
  for (let i = 0; i < nl; i++) {
    const an = s * 1.7 + i * 2.1 + Math.sin(t * 0.9 + i + s) * 0.4, d = r * wob * 2.2, rr = R * (0.82 + 0.12 * Math.sin(s + i * 1.3));
    soft(x + Math.cos(an) * d, y + Math.sin(an) * d, rr, c, a * 0.62, k);
  }
}
// A soft round glow in colour c: alpha a in the middle, nothing at r.
function soft(x, y, r, c, a, core) {
  if (!(r >= 0.5) || !(a > 0.01)) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r), k = core || 0.35;
  g.addColorStop(0, ha(c, a)); g.addColorStop(k, ha(c, a * 0.8)); g.addColorStop(1, ha(c, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
// Stroke the current path softly: a wide faint pass, then a narrow one.
function softStroke(w, c, a) { ctx.lineCap = 'round'; ctx.strokeStyle = ha(c, a * 0.25); ctx.lineWidth = w * 3; ctx.stroke(); ctx.strokeStyle = ha(c, a); ctx.lineWidth = w; ctx.stroke(); ctx.lineCap = 'butt'; }

// ---------------------------------------------------------------- statuses in the body
function typeStatusFx(e, x, y, r) {
  const t = G.realT, id = e.id || 0, a0 = ctx.globalAlpha;
  const mvx = e.svx || 0, mvy = e.svy || 0, mv = Math.hypot(mvx, mvy), bx = mv > 1 ? -mvx / mv : 0, by = mv > 1 ? -mvy / mv : 1; // (behind it)
  const A = k => { ctx.globalAlpha = a0 * k; }, busy = G.enemies.length > 40 || QUAL.lv >= 2; // (busy: the key pieces only)
  if (e.burn > 0) { // Melting: a corroding halo, eaten patches, pits that glow at the edge, fizz, drips, steam
    const C = ELEMENTS.fire.color;
    A(0.5); ctx.fillStyle = (() => { const g = ctx.createRadialGradient(x, y, r * 0.55, x, y, r * 1.25); g.addColorStop(0, ha(C, 0)); g.addColorStop(0.65, ha(C, 0.4)); g.addColorStop(1, ha(C, 0)); return g; })();
    ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.fill();
    A(1); for (let i = 0; i < 2; i++) { const an = tfR(id, i + 15) * TAU; softBlob(x + Math.cos(an) * r * 0.35, y + Math.sin(an) * r * 0.35, r * 0.3, id + i, t * 0.2, 0.2, C, 0.35, 0.3); }
    for (let i = 0; i < 3; i++) {
      const an = tfR(id, i) * TAU, d = r * 0.5 * tfR(id, i + 7), hx = x + Math.cos(an) * d, hy = y + Math.sin(an) * d, hr = Math.max(1.4, r * (0.11 + 0.07 * tfR(id, i + 3)) * (0.9 + 0.1 * Math.sin(t * 3 + i)));
      soft(hx, hy, hr * 2.4, C, 0.45, 0.4); soft(hx, hy, hr * 1.3, '#141a06', 0.8, 0.55);
    }
    for (let i = 0, N = busy ? 0 : 4; i < N; i++) { const k = (t * 1.6 + i / N + tfR(id, i + 40)) % 1, an = tfR(id, i + 41) * TAU, px = x + Math.cos(an) * r * (0.95 + k * 0.25), py = y + Math.sin(an) * r * (0.95 + k * 0.25) - k * r * 0.3; soft(px, py, Math.max(1.2, r * 0.1 * (0.5 + k)), '#f4ffd0', 0.6 * (1 - k), 0.3); }
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.55 + i / 3 + tfR(id, i)) % 1, ox = x + (tfR(id, i + 11) - 0.5) * r * 1.3, base = y + r * Math.sqrt(Math.max(0, 1 - ((ox - x) / r) ** 2)) * 0.95;
      const w = Math.max(1.2, r * 0.1), stretch = k < 0.6 ? k / 0.6 : 1, fall = k < 0.6 ? 0 : (k - 0.6) / 0.4;
      A(0.85 * (1 - fall * 0.8)); ctx.fillStyle = gloss(ox, base + r * 0.3, w * 2, '#f4ffd0', C, '#6b8f14'); ctx.beginPath();
      if (fall) { const fy = base + r * 0.4 + fall * fall * r * 1.6; ctx.ellipse(ox, fy, w, w * 1.3, 0, 0, TAU); } else dropPath(ox, base - w * 0.5, w * (0.5 + 0.5 * stretch), r * (0.15 + 0.4 * stretch));
      ctx.fill(); A(1);
    }
    A(0.18); ctx.beginPath();
    for (let i = 0; i < 2; i++) { const k = (t * 0.5 + i / 2 + tfR(id, i + 90)) % 1, sx0 = x + (i ? 0.3 : -0.3) * r, sy0 = y - r * (0.9 + k * 1.2); ctx.moveTo(sx0, sy0 + r * 0.4); ctx.bezierCurveTo(sx0 + r * 0.3 * Math.sin(t * 2 + i), sy0 + r * 0.2, sx0 - r * 0.3 * Math.sin(t * 2 + i), sy0, sx0, sy0 - r * 0.3); }
    softStroke(Math.max(1, r * 0.1), '#ffffff', 1); A(1);
  }
  if (e.frozen > 0) { // Stuck fast: a jiggling glob of snot with trapped bubbles and a wet sheen, feathered at the edge
    const C = ELEMENTS.ice.color, sq = 1 + 0.05 * Math.sin(t * 7 + id);
    ctx.save(); ctx.translate(x, y); ctx.scale(sq, 2 - sq);
    softBlob(0, 0, r * 1.3, id * 0.37, t, 0.08, C, 0.62, 0.62);
    softBlob(-r * 0.2, -r * 0.25, r * 0.7, id, t, 0.1, '#f2f5d8', 0.3, 0.2);
    ctx.restore();
    for (let i = 0; i < 4; i++) { const an = tfR(id, i + 20) * TAU, d = r * (0.4 + 0.6 * tfR(id, i + 21)), br = Math.max(1, r * (0.06 + 0.06 * tfR(id, i + 22))); soft(x + Math.cos(an) * d, y + Math.sin(an) * d, br * 1.6, '#ffffff', 0.45, 0.5); }
    soft(x - r * 0.45, y - r * 0.5, r * 0.28, '#ffffff', 0.7, 0.25);
    A(0.55); ctx.fillStyle = ha(C, 0.8); strand(x + r * 0.3, y + r * 1.15, x + r * 0.5, y + r * 1.9 + Math.sin(t * 2 + id) * r * 0.1, Math.max(1, r * 0.11), r * 0.15); A(1);
  } else if (e.chill > 0) { // Snotty: a translucent coat with a soft sheen, beaded strands stretching behind, a drool
    const C = ELEMENTS.ice.color, k = clamp(e.chillAmt / 0.6, 0.2, 1);
    softBlob(x, y, r * 1.05, id, t, 0.06, C, 0.3 + 0.3 * k, 0.6);
    soft(x - r * 0.4, y - r * 0.45, r * 0.35, '#ffffff', 0.45, 0.25);
    const n = 1 + Math.round(k * 2);
    for (let i = 0; i < n; i++) {
      const sp = (i - (n - 1) / 2) * r * 0.5, ox = x + bx * r * 0.85 - by * sp * 0.6, oy = y + by * r * 0.85 + bx * sp * 0.6, L = r * (0.8 + 0.6 * k + 0.25 * Math.sin(t * 2.4 + i + id));
      const ex = ox + bx * L + Math.sin(t * 3 + i) * r * 0.15, ey = oy + by * L + r * 0.25;
      A(0.7); ctx.fillStyle = ha(C, 0.85); strand(ox, oy, ex, ey, Math.max(1, r * 0.11), r * 0.2); A(1);
      soft(ex, ey, Math.max(2, r * 0.22), C, 0.85, 0.5); soft(ex - r * 0.04, ey - r * 0.05, Math.max(1, r * 0.07), '#ffffff', 0.7, 0.3);
    }
    const k2 = (t * 0.6 + tfR(id, 5)) % 1; A(0.75); ctx.fillStyle = gloss(x + r * 0.2, y + r, r * 0.2, '#f2f5d8', C, '#55621c'); ctx.beginPath(); dropPath(x + r * 0.2, y + r * 0.95, Math.max(1.2, r * 0.1), r * (0.25 + 0.45 * k2)); ctx.fill(); A(1);
  }
  if (sick(e)) { // Sick: a feverish blush, soft throbbing pustules, a bead of sweat
    const C = ELEMENTS.poison.color, n = Math.min(busy ? 3 : 6, 1 + e.poisonStacks), th = 0.5 + 0.5 * Math.sin(t * 5 + id);
    soft(x, y, r * 1.3, C, 0.2 + 0.1 * th, 0.4);
    for (let i = 0; i < n; i++) {
      const an = tfR(id, i + 20) * TAU, d = r * 0.75 * Math.sqrt(tfR(id, i + 30)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d, sr = Math.max(1.3, r * (0.1 + 0.05 * tfR(id, i + 31)) * (0.85 + 0.25 * Math.sin(t * 5 + i * 1.7)));
      soft(px, py, sr * 2, C, 0.8, 0.35); if (!busy) soft(px, py, sr * 0.6, '#fff4c2', 0.7, 0.3);
    }
    const k = (t * 0.9 + tfR(id, 99)) % 1; A(0.6 * (1 - k)); ctx.fillStyle = '#e8f6ff'; ctx.beginPath(); dropPath(x + r * 0.7, y - r * 0.2 + k * r * 0.9, Math.max(1, r * 0.07), r * 0.25); ctx.fill(); A(1);
  }
  if (e.fizz > 0) { // Lubricated: a dark oily film, feathered, with soft thin-film colours sliding across it
    softBlob(x, y, r * 1.02, id + 3, t * 0.4, 0.05, '#5a3a0a', 0.5, 0.65);
    const k = (t * 0.45 + tfR(id, 40)) % 1, hues = TF_HUES;
    for (let i = 0; i < hues.length; i++) { const an = -2.8 + k * 1.4 + i * 0.28; A(0.5); ctx.beginPath(); ctx.arc(x, y, r * (0.45 + i * 0.09), an, an + 1.2); softStroke(Math.max(1, r * 0.07), hues[i], 0.55); }
    A(1); soft(x - r * 0.35 + Math.sin(t * 1.5 + id) * r * 0.1, y - r * 0.45, r * 0.25, '#fff3d6', 0.6, 0.2);
    const k2 = (t * 0.5 + tfR(id, 6)) % 1; A(0.75 * (1 - k2 * 0.5)); ctx.fillStyle = gloss(x - r * 0.3, y + r, r * 0.2, '#f2c879', '#7a4f0f', '#2a1d08'); ctx.beginPath(); dropPath(x - r * 0.3, y + r * 0.95, Math.max(1.2, r * 0.1), r * (0.2 + 0.35 * k2)); ctx.fill(); A(1);
  }
  if (e.pickle > 0) { // Soaking wet: a faint water film, beads catching the light, drops flicking off
    const C = ELEMENTS.salt.color;
    softBlob(x, y, r * 1.05, id + 5, t * 0.3, 0.04, C, 0.18, 0.6);
    for (let i = 0, N = busy ? 2 : 4; i < N; i++) { const an = tfR(id, i + 50) * TAU, d = r * (0.3 + 0.6 * tfR(id, i + 51)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d, br = Math.max(1, r * (0.06 + 0.05 * tfR(id, i + 52))); soft(px, py, br * 1.8, C, 0.45, 0.4); if (!busy) soft(px - br * 0.3, py - br * 0.3, br * 0.6, '#ffffff', 0.8, 0.3); }
    soft(x - r * 0.38, y - r * 0.42, r * 0.22, '#ffffff', 0.7, 0.2);
    for (let i = 0; i < 2; i++) { const k = (t * 1.4 + i / 2 + tfR(id, i + 60)) % 1, an = tfR(id, i + 61) * TAU, d = r * (1 + k * 1.1), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d + k * k * r * 0.6; soft(px, py, Math.max(1.5, r * 0.14) * (1 - k * 0.5), C, 0.7 * (1 - k), 0.4); }
  }
  if (e.bloodT > 0) { // Bleeding: fine branching veins under the skin, dark seeping gashes, drips while it moves
    const C = ELEMENTS.arcane.color, n = 2 + (e.bloodN || 1);
    for (let i = 0; i < n; i++) {
      let an = tfR(id, i + 70) * TAU, px = x + Math.cos(an) * r * 0.15, py = y + Math.sin(an) * r * 0.15;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let j = 1; j <= 4; j++) { an += (tfR(id, i * 4 + j) - 0.5) * 1.1; px = x + Math.cos(an) * r * (0.15 + j * 0.21); py = y + Math.sin(an) * r * (0.15 + j * 0.21); ctx.lineTo(px, py); }
      A(0.55); softStroke(Math.max(0.6, r * 0.05), '#6a0d25', 1); A(1);
    }
    for (let i = 0; i < Math.min(3, e.bloodN || 1); i++) { const an = tfR(id, i + 75) * TAU, gx = x + Math.cos(an) * r * 0.45, gy = y + Math.sin(an) * r * 0.45;
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(an + 1.2); ctx.scale(1, 0.3); soft(0, 0, r * 0.38, C, 0.6, 0.4); soft(0, 0, r * 0.26, '#2a0410', 0.85, 0.45); ctx.restore(); }
    if (mv > 12) for (let i = 0; i < 2; i++) { const k = (t * 2.2 + i / 2 + tfR(id, 80)) % 1, px = x + bx * r * (0.9 + k * 1.2) + (i ? 1 : -1) * r * 0.2, py = y + by * r * (0.9 + k * 1.2); soft(px, py, Math.max(1.5, r * 0.15), C, 0.85 * (1 - k), 0.45); }
  }
  if (e.curse > 0) { // Cursed: its soul slipping out of it, a pale translucent double drifting behind, joined by a wisp
    const C = ELEMENTS.soul.color, wob = Math.sin(t * 2.5 + id), pull = 0.8 + 0.2 * Math.sin(t * 1.7 + id), ox = x + bx * r * 0.9 * pull + wob * r * 0.15, oy = y + by * r * 0.7 * pull - r * 0.55;
    A(0.6); ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + (ox - x) * 0.3 + wob * r * 0.3, y + (oy - y) * 0.2, ox - (ox - x) * 0.3, oy + r * 0.4, ox, oy); softStroke(Math.max(1, r * 0.12), C, 0.35); A(1);
    softBlob(ox, oy, r * 0.85, id + 9, t * 1.5, 0.12, C, 0.35, 0.35);
    soft(ox, oy, r * 0.5, '#ffffff', 0.25, 0.3);
    for (const sgn of [-1, 1]) soft(ox + sgn * r * 0.25, oy - r * 0.08, r * 0.14, '#0a1a22', 0.22, 0.3); // (a face, barely)
  }
  if (e.xrayT > G.t && Math.random() < 0.85) { // TOASTER IN THE BATH: an x-ray flash of its skeleton
    soft(x, y, r * 1.35, '#05060a', 0.85, 0.65); glow(x, y, r * 1.6, '#bde0fe', 0.45);
    A(0.95); ctx.beginPath(); ctx.moveTo(x, y - r * 0.55); ctx.lineTo(x, y + r * 0.65);
    for (let i = 0; i < 4; i++) { const yy = y - r * 0.32 + i * r * 0.22, w = r * (0.58 - i * 0.07); ctx.moveTo(x - w, yy + r * 0.14); ctx.quadraticCurveTo(x, yy - r * 0.14, x + w, yy + r * 0.14); }
    ctx.moveTo(x + r * 0.24, y - r * 0.62); ctx.arc(x, y - r * 0.62, r * 0.24, 0, TAU); softStroke(Math.max(1, r * 0.08), '#eaf6ff', 1); A(1);
  }
  if (e.bowlT > G.t) { // sent bowling: soft speed streaks behind it
    A(0.5); ctx.beginPath();
    for (let i = -1; i <= 1; i++) { const ox = x + bx * r * 1.1 - by * i * r * 0.45, oy = y + by * r * 1.1 + bx * i * r * 0.45; ctx.moveTo(ox, oy); ctx.lineTo(ox + bx * r * (1.2 - Math.abs(i) * 0.4), oy + by * r * (1.2 - Math.abs(i) * 0.4)); }
    softStroke(Math.max(1, r * 0.07), '#ffffff', 0.7);
  }
  ctx.globalAlpha = a0;
}
// Ghost allies (Soul): a soft glow and a feathered wisp trailing under the see-through body (render.js).
function typeGhostUnder(e) {
  const x = sx(e.x), y = sy(e.y), r = (e.r || 12) * S, t = G.realT, C = ELEMENTS.soul.color, mv = Math.hypot(e.svx || 0, e.svy || 0), bx = mv > 1 ? -(e.svx || 0) / mv : 0, by = mv > 1 ? -(e.svy || 0) / mv : 1;
  const n = G.enemies.length > 60 || QUAL.lv >= 2 ? 2 : 4;
  if (n > 2) glow(x, y, r * 2.4, C, 0.3);
  for (let i = 1; i <= n; i++) { const k = i / n, px = x + bx * r * 2.2 * k + Math.sin(t * 3 + e.id + i) * r * 0.3 * k, py = y + by * r * 2.2 * k; soft(px, py, r * (1.1 - k * 0.6), C, 0.3 * (1 - k * 0.6), 0.3); }
}

// ---------------------------------------------------------------- puddles and patches (true: drawn here)
function typeZone(z, x, y, r, a) {
  const t = G.realT, s = Math.abs((z.x * 13 + z.y * 7) % 1000) / 37, A = k => { ctx.globalAlpha = a * k; }; // (s >= 0: tfR and sqrt need it)
  const lite = G.zones.length > 14 || FX.k < 0.85 || QUAL.lv >= 2; // (a busy slide: fewer pieces per puddle)
  if (z.oil) { // a dark slick, feathered at the edge, thin-film colours swirling slowly, a soft glint
    A(1); if (!lite) softBlob(x + r * 0.06, y + r * 0.08, r, s, t * 0.3, 0.12, '#000000', 0.2, 0.5);
    if (lite) soft(x, y, r * 1.2, '#24190a', 0.75, 0.6); else softBlob(x, y, r, s, t * 0.3, 0.12, '#24190a', 0.8, 0.7);
    const hues = TF_HUES;
    for (let i = 0; i < (lite ? 2 : hues.length); i++) { const an = t * (0.35 + i * 0.05) + i * 1.25 + s, rr = r * (0.25 + i * 0.12); A(0.4); ctx.beginPath(); ctx.ellipse(x + Math.cos(an * 0.7) * r * 0.12, y + Math.sin(an * 0.7) * r * 0.08, rr, rr * 0.7, an * 0.3, an, an + 1.9); softStroke(Math.max(1, r * 0.05), hues[i], 0.5); }
    A(1); soft(x - r * 0.3 + Math.sin(t + s) * r * 0.05, y - r * 0.3, r * 0.3, '#fff3d6', 0.35, 0.2);
    return true;
  }
  if (z.heal) { // a pool of blood: soft spatter, a darker drying margin, a glossy middle, a slow pulse
    const C = ELEMENTS.arcane.color, pulse = 1 + 0.03 * Math.sin(t * 3 + s);
    A(1);
    for (let i = 0, N = lite ? 0 : 4; i < N; i++) { const an = (s * 3 + i * 1.6) % TAU, d = r * (1.15 + 0.35 * ((i * 37 + s * 10) % 10) / 10); soft(x + Math.cos(an) * d, y + Math.sin(an) * d, Math.max(1.5, r * (0.06 + 0.06 * (i % 3) / 2)), '#4a0818', 0.8, 0.45); }
    softBlob(x, y, r * pulse, s, 0, 0.12, '#3a0612', 0.85, 0.7);
    softBlob(x, y, r * 0.75 * pulse, s + 2, 0, 0.1, C, 0.7, 0.45);
    soft(x - r * 0.25, y - r * 0.3, r * 0.25, '#ffd6de', 0.35, 0.2);
    return true;
  }
  if (z.snot) { // soft glossy blobs of snot joined by sagging strands
    const C = ELEMENTS.ice.color, P = [];
    for (let i = 0; i < 4; i++) { const an = (s + i * 1.7) % TAU, d = r * 0.6 * (((i * 37 + s * 10) % 10) / 10), br = r * (0.26 + 0.09 * (i % 3)) * (1 + 0.04 * Math.sin(t * 3 + i)); P.push([x + Math.cos(an) * d, y + Math.sin(an) * d, br]); }
    A(0.6); ctx.fillStyle = ha(C, 0.8);
    for (let i = 1; i < P.length; i++) strand(P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], Math.max(1, r * 0.05), r * 0.18);
    A(1);
    for (const [px, py, br] of P) { soft(px + br * 0.15, py + br * 0.25, br * 1.3, '#000000', 0.25, 0.4); softBlob(px, py, br, px, t, 0.08, C, 0.85, 0.6); soft(px - br * 0.35, py - br * 0.35, br * 0.35, '#ffffff', 0.7, 0.25); }
    return true;
  }
  if (z.water) { // the slide is already water: droplets thrown up, then soft refracting ripples
    const k = 1 - z.life / z.max, C = ELEMENTS.salt.color;
    for (let j = 0; j < (lite ? 1 : 2); j++) { const rr = r * (0.3 + (k + j * 0.3) * 0.9); A((1 - k) * 0.7); ctx.beginPath(); ctx.arc(x, y - 0.7, rr, 0, TAU); softStroke(Math.max(1, r * 0.04), '#ffffff', 0.6); ctx.beginPath(); ctx.arc(x, y + 0.9, rr, 0, TAU); softStroke(Math.max(1, r * 0.04), C, 0.5); }
    A(1);
    if (k < 0.35 && !lite) { const q = k / 0.35; for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + s, d = r * (0.3 + q * 0.6), h = Math.sin(q * Math.PI) * r * 0.5; soft(x + Math.cos(an) * d, y + Math.sin(an) * d * 0.6 - h, Math.max(1.5, r * 0.1), C, 0.8 * (1 - q), 0.4); } }
    return true;
  }
  if (z.flame) { // GREASE FIRE and NAPALM: soft rising fire, white-yellow at the root, red then smoke at the tips
    const rc = RAW_COL; RAW_COL = true; // (real fire colours: ELEM_SWAP would turn these orange tones into Acid green)
    A(1); softBlob(x, y, r, s, 0, 0.14, '#1a0d05', 0.5, 0.6);
    const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter';
    glow(x, y, r * 1.5, '#ff6a00', 0.45 * a);
    for (let i = 0, N = lite ? 12 : 28; i < N; i++) { // tongues: soft, tall, leaning and flickering, cooling as they rise
      const k = (t * 1.4 + i / N + tfR(i + 1, Math.floor(s))) % 1, an = tfR(i + 3, Math.floor(s)) * TAU, d = r * 0.75 * Math.sqrt(tfR(i + 5, Math.floor(s)));
      const px = x + Math.cos(an) * d + Math.sin(t * 6 + i) * r * 0.1 * k, py = y + Math.sin(an) * d * 0.7 - k * r * 1.1, rr = r * 0.3 * (1 - k * 0.65);
      const c = k < 0.2 ? '#fff3b0' : k < 0.45 ? '#ffb000' : k < 0.75 ? '#ff4d00' : '#802000';
      A(1); ctx.save(); ctx.translate(px, py); ctx.scale(0.6, 1.5); soft(0, 0, rr, c, 0.6 * (1 - k * 0.6), 0.3); ctx.restore();
    }
    ctx.globalCompositeOperation = op;
    for (let i = 0; i < 6; i++) { const k = (t * 0.8 + i / 6 + s) % 1; soft(x + Math.sin(i * 2.7 + s + t) * r * 0.7, y - k * r * 1.6, Math.max(1, r * 0.05 * (1 - k)), '#ffd166', 0.9, 0.4); }
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
  blood: ['crimescene', 'hemorrhage', 'bloodclot', 'bloodpact', 'ulcer', 'gorged', 'dirtyneedle', 'thinned', 'topup', 'bloodyshow'],
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
  const st = RX_OF[id] || 'pop', L = G.tfx || (G.tfx = []), last = G.tfxLast || (G.tfxLast = {});
  // Busy fights: the same reaction at most every 0.3s, and 12 pictures at most (each is a few dozen soft strokes).
  if (last[id] > G.realT - 0.3) return;
  last[id] = G.realT;
  if (L.length >= 6) L.shift();
  L.push({ x, y, r: Math.max(18, r || 14), st, id, c: (REACTIONS[id] || {}).color || '#ffffff', t0: G.realT, dur: RX_DUR[st] || 0.6, seed: Math.random() * 100 });
}
// Drawn with the effects (render.js), in world space. Soft and organic: no hard outlines.
function drawTypeFx() {
  const L = G.tfx; if (!L || !L.length) return;
  const a0 = ctx.globalAlpha, op = ctx.globalCompositeOperation;
  for (let i = L.length - 1; i >= 0; i--) {
    const f = L[i], q = (G.realT - f.t0) / f.dur;
    if (q >= 1 || q < 0) { L.splice(i, 1); continue; }
    if (sx(f.x) < -120 || sx(f.x) > W + 120 || sy(f.y) < -120 || sy(f.y) > H + 120) continue; // (off screen)
    const x = sx(f.x), y = sy(f.y), R = f.r * S, s = f.seed, e = 1 - Math.pow(1 - q, 3), fade = 1 - q, T = G.realT, lite = L.length > 2 || FX.k < 0.85 || QUAL.lv >= 2; // (lite: fewer pieces when busy)
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a0;
    switch (f.st) {
      case 'zap': { // forking discharges with a soft glow, white-hot at the core
        if (!lite) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, R * (1.5 + e), f.c, 0.5 * fade); }
        for (let b = 0; b < (lite ? 3 : 6); b++) {
          const an = s + b / 6 * TAU, L2 = R * (1 + e * 1.6); ctx.beginPath(); ctx.moveTo(x, y);
          for (let j = 1; j <= 6; j++) { const d = L2 * j / 6, jit = (Math.random() - 0.5) * R * 0.45 * (j / 6); ctx.lineTo(x + Math.cos(an) * d - Math.sin(an) * jit, y + Math.sin(an) * d + Math.cos(an) * jit); }
          ctx.globalAlpha = a0 * fade; ctx.strokeStyle = ha(f.c, 0.35); ctx.lineWidth = Math.max(2, R * 0.12); ctx.stroke(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.8, R * 0.03); ctx.stroke();
        }
        break;
      }
      case 'splash': { // droplets thrown up and out, and soft ripples spreading
        for (let j = 0; j < 2; j++) { const rr = R * (0.4 + e * (1.3 + j * 0.4)); ctx.globalAlpha = a0 * fade * 0.8; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 0.75, 0, 0, TAU); softStroke(Math.max(1, R * 0.05), j ? f.c : '#ffffff', 0.6); }
        ctx.globalAlpha = a0;
        for (let i = 0; i < (lite ? 5 : 10); i++) { const an = s + i / 10 * TAU, d = R * (0.5 + e * 1.4), h = Math.sin(q * Math.PI) * R * 0.9; const px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * 0.7 - h, dr = Math.max(1.5, R * 0.13 * fade); soft(px, py, dr * 1.6, f.c, 0.8 * fade, 0.45); soft(px - dr * 0.3, py - dr * 0.3, dr * 0.5, '#ffffff', 0.8 * fade, 0.3); }
        break;
      }
      case 'goo': { // strands of goo shooting out, stretching thin, snapping into soft beads
        for (let i = 0; i < 7; i++) { const an = s + i / 7 * TAU + Math.sin(i * 3) * 0.3, d = R * (0.4 + e * 1.5), ex = x + Math.cos(an) * d, ey = y + Math.sin(an) * d + q * q * R * 0.6;
          if (q < 0.55) { ctx.globalAlpha = a0 * 0.75; ctx.fillStyle = ha(f.c, 0.85); strand(x, y, ex, ey, Math.max(1, R * 0.14 * (1 - q)), R * 0.2); ctx.globalAlpha = a0; }
          soft(ex, ey, Math.max(2, R * 0.3 * (0.6 + 0.4 * fade)), f.c, 0.85 * fade, 0.5); soft(ex - R * 0.05, ey - R * 0.06, Math.max(1, R * 0.08), '#ffffff', 0.7 * fade, 0.3); }
        softBlob(x, y, R * 0.55 * (1 - q * 0.6), s, T, 0.15, f.c, 0.7 * fade, 0.5);
        break;
      }
      case 'blood': { // a spray of drops, then a soft splat seeping into the slide
        if (lite) soft(x, y, R * (0.8 + e * 0.6), '#5a0a1d', 0.6 * Math.min(1, q * 4) * fade, 0.55); else softBlob(x, y, R * (0.55 + e * 0.5), s, 0, 0.22, '#5a0a1d', 0.7 * Math.min(1, q * 4) * fade, 0.55);
        for (let i = 0; i < (lite ? 5 : 12); i++) { const an = s + i * 2.39, d = R * (0.4 + e * (1.2 + (i % 4) * 0.3)), px = x + Math.cos(an) * d, py = y + Math.sin(an) * d + q * q * R * 0.5, dr = Math.max(1.5, R * (0.08 + 0.06 * (i % 3)) * (1 - q * 0.5)); soft(px, py, dr * 1.5, f.c, 0.9 * fade, 0.5); }
        break;
      }
      case 'ghost': { // its soul leaves: a pale translucent wisp stretching up out of it and thinning away
        const gy = y - e * R * 2.2, wob = Math.sin(T * 4 + s) * R * 0.2, C = '#bff4ff';
        if (!lite) { ctx.globalCompositeOperation = 'lighter'; glow(x + wob, gy, R * 2.2, C, 0.45 * fade); ctx.globalCompositeOperation = 'source-over'; }
        const NK = lite ? 2 : 5; for (let k = 0; k <= NK; k++) { const u = k / NK, px = x + wob * u + Math.sin(T * 5 + k) * R * 0.15 * u, py = y + (gy - y) * u; soft(px, py, R * (0.45 + u * 0.55), C, (0.3 + 0.4 * u) * fade, 0.35); }
        soft(x + wob, gy, R * 0.6, '#ffffff', 0.4 * fade, 0.3);
        for (const sg of [-1, 1]) soft(x + wob + sg * R * 0.22, gy - R * 0.05, R * 0.14, '#0a1a22', 0.25 * fade, 0.3);
        break;
      }
      case 'germ': { // a soft cloud of rod-shaped bacteria tumbling outwards, each with a fine whip of a flagellum
        if (!lite) soft(x, y, R * (1 + e * 1.6), f.c, 0.28 * fade, 0.3);
        for (let i = 0; i < (lite ? 4 : 9); i++) {
          const an = s + i * 2.39 + T * 0.4, d = R * (0.3 + e * (1 + (i % 3) * 0.4)), gx = x + Math.cos(an) * d, gy = y + Math.sin(an) * d, rot = an * 1.7 + T * (i % 2 ? 1 : -1), L2 = Math.max(3, R * 0.32), w = Math.max(1.5, R * 0.1);
          ctx.globalAlpha = a0 * fade; ctx.beginPath(); ctx.moveTo(gx - Math.cos(rot) * L2 / 2, gy - Math.sin(rot) * L2 / 2); ctx.lineTo(gx + Math.cos(rot) * L2 / 2, gy + Math.sin(rot) * L2 / 2); softStroke(w, f.c, 0.85);
          ctx.beginPath(); let fx = gx - Math.cos(rot) * L2 / 2, fy = gy - Math.sin(rot) * L2 / 2; ctx.moveTo(fx, fy);
          for (let j = 1; j <= 4; j++) { const wv = Math.sin(T * 18 + j * 1.6 + i) * w; fx -= Math.cos(rot) * L2 * 0.3 + Math.sin(rot) * wv * 0.5; fy -= Math.sin(rot) * L2 * 0.3 - Math.cos(rot) * wv * 0.5; ctx.lineTo(fx, fy); }
          if (!lite) { ctx.strokeStyle = ha(f.c, 0.5); ctx.lineWidth = Math.max(0.5, w * 0.25); ctx.stroke(); }
        }
        break;
      }
      case 'fire': { // a soft fireball blooming and rolling up into smoke
        const rc = RAW_COL; RAW_COL = true;
        soft(x, y - e * R * 1.4, R * (0.8 + e * 1.4), '#2a1a10', 0.45 * fade, 0.4);
        ctx.globalCompositeOperation = 'lighter';
        for (const [k, c] of TF_FIRE) soft(x, y - e * R * 0.6, R * k * (0.5 + e), c, 0.8 * fade, 0.2);
        RAW_COL = rc; break;
      }
      case 'acid': { // soft acid bubbles boiling up and popping, with steam
        for (let i = 0; i < (lite ? 5 : 10); i++) { const k = (q * 1.5 + i / 10) % 1, an = s + i * 2.39, d = R * (0.2 + 0.9 * ((i * 7) % 10) / 10), bx2 = x + Math.cos(an) * d, by2 = y + Math.sin(an) * d * 0.6 - k * R * 0.8, br = Math.max(1.5, R * 0.2 * Math.sin(k * Math.PI));
          soft(bx2, by2, br * 1.4, f.c, 0.7 * fade, 0.55); soft(bx2 - br * 0.3, by2 - br * 0.35, br * 0.4, '#ffffff', 0.7 * fade, 0.3); }
        ctx.globalAlpha = a0 * 0.3 * fade; ctx.beginPath(); for (let i = 0; i < 3; i++) { const sx0 = x + (i - 1) * R * 0.5, sy0 = y - R * (0.6 + e * 1.2); ctx.moveTo(sx0, sy0 + R * 0.5); ctx.bezierCurveTo(sx0 + R * 0.3, sy0 + R * 0.2, sx0 - R * 0.3, sy0, sx0, sy0 - R * 0.4); }
        softStroke(Math.max(1, R * 0.12), '#ffffff', 0.8);
        break;
      }
      case 'oil': { // thin-film colours spreading out across the slide, soft
        const hues = TF_HUES;
        for (let i = 0; i < hues.length; i++) { ctx.globalAlpha = a0 * fade * 0.7; ctx.beginPath(); const rr = R * (0.4 + e * 1.4 + i * 0.12); ctx.ellipse(x, y, rr, rr * 0.7, 0, 0, TAU); softStroke(Math.max(1, R * 0.05), hues[i], 0.5); }
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
