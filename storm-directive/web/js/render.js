'use strict';
// Storm Directive - rendering: parallax space, lit arena floor, decals, dynamic lights, shadows,
// shaded entities, glow sprites, the egg, swimmers, echoes, rewind effect, HUD, minimap.

function sx(x) { return (x - cam.x) * S + W / 2; }
function sy(y) { return (y - cam.y) * S + H / 2; }

// ---------------------------------------------------------------- palette enforcement
// Any colour that isn't one of the rationed meanings (see PAL in data.js) or a rival's dye is drawn as
// its greyscale equivalent. Aliases fold old accent colours into the meaning they stood for.
// X-ray film neutrals for the UI: a slightly blue white and a blue-grey.
const XR = { white: '#d6e4f0', dim: '#8395a8', line: 'rgba(196,218,240,0.42)', halo: 'rgba(196,218,240,0.16)' };
const PAL_OK = new Set(Object.values(ELEM_UI).concat([PAL.you, PAL.danger, PAL.reward, PAL.upgrade, PAL.pickup, '#ffffff', '#000000', XR.white, XR.dim].concat(RIVALS.map(r => r.color))));
const PAL_ALIAS = { '#8dffc0': PAL.you, '#ff4d6d': PAL.danger, '#ff2e2e': PAL.danger, '#ffca3a': PAL.reward, '#ffd60a': PAL.reward, '#ffb400': PAL.reward };
const COL = new Map();
function col(c) {
  if (typeof c !== 'string') return c;
  let v = COL.get(c);
  if (v !== undefined) return v;
  let r, g, b, a = null;
  const h = c.toLowerCase();
  if (h[0] === '#' && (h.length === 7 || h.length === 9)) {
    const base = h.slice(0, 7);
    if (PAL_OK.has(base)) v = c;
    else if (PAL_ALIAS[base]) v = PAL_ALIAS[base] + h.slice(7);
    else { const n = parseInt(base.slice(1), 16); r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255; if (h.length === 9) a = parseInt(h.slice(7), 16) / 255; }
  } else {
    const m = h.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
    if (!m) v = c;
    else { r = +m[1]; g = +m[2]; b = +m[3]; if (m[4] != null) a = +m[4]; }
  }
  if (v === undefined) {
    const l = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
    v = a == null ? `rgb(${l},${l},${l})` : `rgba(${l},${l},${l},${a})`;
  }
  if (COL.size > 4000) COL.clear();
  COL.set(c, v);
  return v;
}
// Darkfield: while the world is drawn, every grey is inverted (black field, bright specimens); the meaning
// colours and pure white stay as they are. The HUD is drawn with WORLD_DF off.
let WORLD_DF = false;
const COLDF = new Map();
function colDF(c) {
  if (typeof c !== 'string') return c;
  let v = COLDF.get(c);
  if (v !== undefined) return v;
  v = col(c);
  const m = typeof v === 'string' && v.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)$/);
  if (m && m[1] === m[2] && m[2] === m[3]) { const l = Math.round(clamp((255 - +m[1] - 128) * 1.6 + 128, 0, 255)); v = m[4] != null ? `rgba(${l},${l},${l},${m[4]})` : `rgb(${l},${l},${l})`; }
  if (COLDF.size > 4000) COLDF.clear();
  COLDF.set(c, v);
  return v;
}
for (const prop of ['fillStyle', 'strokeStyle']) {
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, prop);
  Object.defineProperty(ctx, prop, { get() { return d.get.call(this); }, set(v) { d.set.call(this, WORLD_DF ? colDF(v) : col(v)); } });
}
// Gradients made on the main canvas go through the same gate (only while drawing the world in darkfield).
for (const fn of ['createRadialGradient', 'createLinearGradient']) {
  const orig = ctx[fn].bind(ctx);
  ctx[fn] = (...a) => { const g = orig(...a); if (!WORLD_DF) return g; const add = g.addColorStop.bind(g); g.addColorStop = (o, c) => add(o, colDF(c)); return g; };
}
// Invert a baked sprite for darkfield (needs canvas filters; otherwise it's left as is).
function invertCanvas(c) {
  if (!CAN_FILTER) return c;
  const o = makeCanvas(c.width, c.height), g = o.getContext('2d');
  g.filter = 'invert(1) contrast(1.6)'; g.drawImage(c, 0, 0);
  return o;
}
// Called when look settings change: drop every cached, pre-rendered asset.
function resetLook() { SPR.layers = null; SPR.fore = null; SPR.oocyte = null; SPR.oocyteR = 0; SPR.vigKey = ''; if (typeof SHEETS !== 'undefined') SHEETS.clear(); }

// ---------------------------------------------------------------- cached sprites
const SPR = { glow: new Map(), layers: null, vignette: null, vigKey: '' };

function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// Soft radial glow in a colour, drawn additively for cheap bloom.
function glowSprite(color) {
  color = col(color);
  if (color[0] !== '#') { const l = color.match(/\d+/)[0]; color = '#' + (+l).toString(16).padStart(2, '0').repeat(3); }
  let c = SPR.glow.get(color);
  if (c) return c;
  c = makeCanvas(64, 64);
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'aa'); gr.addColorStop(1, color + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  SPR.glow.set(color, c);
  return c;
}
// Only things that give off light glow: fire and heat, electricity, arcane / temporal energy, fluorescent
// dye tags, laser beams and charged mitochondria. Bullets, needles, blades, drones, ice, poison, acid,
// XP, pickups, enemy bullets and every creature's body do not.
const EMISSIVE = new Set(['fire', 'shock', 'arcane']);
const emits = elem => EMISSIVE.has(elem);
function glow(x, y, r, color, alpha) {
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite(color), x - r, y - r, r * 2, r * 2);
}

// ---------------------------------------------------------------- the microscope look
// Reference: a wet mount of semen under positive phase contrast (the standard for semen analysis):
// an even mid-grey field with a faint green cast from the interference filter, brightest in the middle
// of the camera frame; objects are darker grey than the fluid and every edge wears a bright white halo;
// out-of-focus specks show as soft discs with a light core and a dark ring; there are fine counting-
// chamber grid lines; fluorescent labels (GFP and friends) glow in colour on top of the grey.
const MIC = { fluid: '#a3aba1', edge: '#6e766d', body: 'rgb(36,37,37)', acro: 'rgb(96,98,97)', halo: 'rgba(255,255,255,', dark: 'rgba(24,28,26,' };
const PC_TONE = new Map();
// Phase-contrast tone for a colour: mostly grey, a hint of the original hue, a little darker than the fluid.
function pcTone(hex, k) {
  const key = hex + (k || 0);
  let v = PC_TONE.get(key);
  if (v) return v;
  const n = parseInt(hex.slice(1, 7), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  const l = 0.3 * r + 0.59 * g + 0.11 * b, hue = 0.28, dk = k != null ? k : 0.36;
  const f = c => Math.round((l * (1 - hue) + c * hue) * dk);
  v = `rgb(${f(r)},${f(g)},${f(b)})`;
  PC_TONE.set(key, v);
  return v;
}
// Bright phase halo round the current path, then a thin dark edge.
function pcHalo(width, alpha) {
  if (!SET.clinical) { ctx.strokeStyle = MIC.halo + (alpha != null ? alpha : 0.55) + ')'; ctx.lineWidth = width; ctx.stroke(); }
  ctx.strokeStyle = MIC.dark + '0.55)'; ctx.lineWidth = Math.max(1, width * 0.35); ctx.stroke();
}

// Tileable depth layers for the fluid: gentle luminance mottling (far), defocused particles (mid),
// fine sharp specks (near).
function buildLayers() {
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const T = 512, D = Math.min(2, DPR);
  const tile = () => { const c = makeCanvas(T * D, T * D), g = c.getContext('2d'); g.scale(D, D); return [c, g]; };
  const wrap = (g, x, y, fn) => { for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) fn(g, x + ox, y + oy); };
  const [far, fg0] = tile();
  for (let i = 0; i < 26; i++) {
    const x = rnd() * T, y = rnd() * T, r = 50 + rnd() * 160, light = rnd() < 0.5;
    wrap(fg0, x, y, (g, X, Y) => {
      const gr = g.createRadialGradient(X, Y, 0, X, Y, r);
      gr.addColorStop(0, light ? 'rgba(255,255,250,0.07)' : 'rgba(20,30,20,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(X - r, Y - r, r * 2, r * 2);
    });
  }
  // Defocused particles: pale core, dark diffraction ring, faint outer bright ring.
  const [mid, fg1] = tile();
  for (let i = 0; i < 34; i++) {
    const x = rnd() * T, y = rnd() * T, r = 4 + rnd() * 12;
    wrap(fg1, x, y, (g, X, Y) => {
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.beginPath(); g.arc(X, Y, r * 0.6, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(30,36,32,0.22)'; g.lineWidth = r * 0.3; g.beginPath(); g.arc(X, Y, r, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = r * 0.2; g.beginPath(); g.arc(X, Y, r * 1.35, 0, TAU); g.stroke();
    });
  }
  // Fine specks and bits of debris, nearly in focus.
  const [near, fg2] = tile();
  for (let i = 0; i < 110; i++) {
    const x = rnd() * T, y = rnd() * T, r = 0.5 + rnd() * 1.4, dark = rnd() < 0.6;
    fg2.fillStyle = dark ? `rgba(30,36,32,${0.25 + rnd() * 0.35})` : `rgba(255,255,255,${0.3 + rnd() * 0.4})`;
    fg2.beginPath(); fg2.arc(x, y, r, 0, TAU); fg2.fill();
    if (dark && rnd() < 0.3) { fg2.strokeStyle = 'rgba(255,255,255,0.35)'; fg2.lineWidth = 0.8; fg2.stroke(); }
  }
  const lay = img => SET.darkfield ? invertCanvas(img) : img;
  SPR.layers = SET.clinical ? [{ f: 0.6, img: lay(blurTile(near, 0.4 * D)), T }] : [
    { f: 0.06, img: lay(blurTile(far, 7)), T },
    { f: 0.25, img: lay(blurTile(mid, 2.5 * D)), T },
    { f: 0.6, img: lay(blurTile(near, 0.4 * D)), T },
  ];
  // Foreground: debris drifting above the focal plane, badly out of focus.
  const fg = makeCanvas(T, T), fgc = fg.getContext('2d');
  for (let i = 0; i < 5; i++) {
    const x = rnd() * T, y = rnd() * T, r = 26 + rnd() * 40;
    wrap(fgc, x, y, (g, X, Y) => {
      g.fillStyle = 'rgba(40,46,42,0.16)'; g.beginPath(); g.arc(X, Y, r, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = r * 0.25; g.beginPath(); g.arc(X, Y, r * 1.15, 0, TAU); g.stroke();
    });
  }
  SPR.fore = { f: 1.6, img: blurTile(fg, 14), T };
}

// Blur a seamless tile without its edges going soft: blur a 3x3 mosaic and keep the middle.
const CAN_FILTER = (() => { try { const c = makeCanvas(2, 2).getContext('2d'); c.filter = 'blur(1px)'; return c.filter === 'blur(1px)'; } catch (e) { return false; } })();
function blurTile(src, px) {
  if (!CAN_FILTER || px <= 0) return src;
  const w = src.width, h = src.height, out = makeCanvas(w, h), g = out.getContext('2d');
  g.filter = `blur(${px}px)`;
  for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) g.drawImage(src, ox, oy);
  return out;
}

// Lens blur towards the screen edges: a quarter-resolution copy of the frame, masked to the rim.
const DOF = { on: true, c: null, key: '' };
try { DOF.on = localStorage.getItem('sd_dof') !== '0'; } catch (e) { /* storage unavailable */ }
function drawLensBlur() {
  if (!DOF.on) return;
  const w = Math.max(1, Math.ceil(W / 4)), h = Math.max(1, Math.ceil(H / 4)), key = w + 'x' + h;
  if (DOF.key !== key) {
    DOF.key = key; DOF.c = makeCanvas(w, h);
    DOF.mask = makeCanvas(w, h);
    const m = DOF.mask.getContext('2d'), gr = m.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.hypot(w, h) * 0.55);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.85)');
    m.fillStyle = gr; m.fillRect(0, 0, w, h);
  }
  const g = DOF.c.getContext('2d');
  g.globalCompositeOperation = 'copy'; g.imageSmoothingEnabled = true;
  g.drawImage(cv, 0, 0, w, h);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(DOF.mask, 0, 0);
  g.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(DOF.c, 0, 0, W, H);
}
function drawForeground() {
  const L = SPR.fore;
  if (!L || !DOF.on) return;
  if (SET.darkfield) ctx.globalAlpha = 0.25; // barely there on black
  const T = L.T, ox = -((((cam.x * S * L.f + G.realT * 6) % T) + T) % T), oy = -((((cam.y * S * L.f + G.realT * 3) % T) + T) % T);
  for (let x = ox; x < W; x += T) for (let y = oy; y < H; y += T) ctx.drawImage(L.img, x, y, T, T);
  ctx.globalAlpha = 1;
}

function buildVignette() {
  const key = W + 'x' + H;
  if (SPR.vigKey === key) return;
  SPR.vigKey = key;
  const c = makeCanvas(Math.ceil(W / 2), Math.ceil(H / 2)), g = c.getContext('2d');
  const gr = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.35, c.width / 2, c.height / 2, Math.hypot(c.width, c.height) * 0.55);
  gr.addColorStop(0, 'rgba(10,14,12,0)'); gr.addColorStop(1, 'rgba(12,16,14,0.62)');
  g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  SPR.vignette = c;
}

// ---------------------------------------------------------------- world helpers used by the engine
function addLight(x, y, r, color, life) {
  if (!G || G.lights.length > 40) return;
  G.lights.push({ x, y, r, color, life, max: life });
}
function addDecal(x, y, r, color) {
  if (!G) return;
  if (G.decals.length > 140) G.decals.shift();
  G.decals.push({ x, y, r, color, life: 14, max: 14, rot: Math.random() * TAU, n: 5 + Math.floor(Math.random() * 4) });
}

function drawShape(shape, x, y, r, rot) {
  ctx.beginPath();
  switch (shape) {
    case 'tri': for (let i = 0; i < 3; i++) { const a = rot + i / 3 * TAU; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'square': ctx.rect(x - r * 0.85, y - r * 0.85, r * 1.7, r * 1.7); break;
    case 'diamond': ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.8, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.8, y); break;
    case 'hex': for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rot * 0.2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'oct': for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + Math.PI / 8; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } break;
    case 'star': for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + rot * 0.3, rr = i % 2 ? r * 0.5 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } break;
    case 'spike': for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + rot, rr = i % 2 ? r * 0.7 : r * 1.1; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } break;
    case 'cross': { const t = r * 0.38; ctx.rect(x - t, y - r, t * 2, r * 2); ctx.rect(x - r, y - t, r * 2, t * 2); break; }
    case 'sperm': ctx.ellipse(x, y, r, r * 0.72, rot, 0, TAU); break;
    case 'amoeba': {
      // A soft, slowly flowing outline with a few blunt lobopodia, drawn as a smooth closed curve.
      const n = 36, pts = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * TAU;
        const rr = r * (1 + 0.08 * Math.sin(2 * a + rot) + 0.05 * Math.sin(3 * a - rot * 1.4) + 0.16 * Math.pow(Math.max(0, Math.sin(a + rot * 0.5)), 4) + 0.1 * Math.pow(Math.max(0, Math.sin(2 * a - rot * 0.3 + 1)), 6));
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
      }
      ctx.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
      for (let i = 0; i < n; i++) { const p0 = pts[i], p1 = pts[(i + 1) % n]; ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2); }
      break;
    }
    case 'cell': for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, rr = r * (1 + 0.09 * Math.sin(i * 3 + rot * 2.5)); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } break;
    case 'antibody': {
      const w = r * 0.34, pts = [[-w / 2, r], [w / 2, r], [w / 2, 0.1 * r], [0.9 * r, -0.7 * r], [0.6 * r, -r], [0, -0.3 * r], [-0.6 * r, -r], [-0.9 * r, -0.7 * r], [-w / 2, 0.1 * r]];
      const c = Math.cos(rot), s2 = Math.sin(rot);
      for (const [px, py] of pts) ctx.lineTo(x + px * c - py * s2, y + px * s2 + py * c);
      break;
    }
    default: ctx.arc(x, y, r, 0, TAU);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------- background & floor
function drawBackground() {
  if (!SPR.layers) buildLayers();
  if (SET.darkfield) { drawDarkfieldBackground(); return; }
  // Köhler illumination: an even field, a touch brighter in the middle of the frame.
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  bg.addColorStop(0, '#b6b6b6'); bg.addColorStop(0.6, '#a6a6a6'); bg.addColorStop(1, '#8c8c8c');
  ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
  for (const L of SPR.layers) {
    const T = L.T;
    const ox = -((((cam.x * S * L.f) % T) + T) % T), oy = -((((cam.y * S * L.f) % T) + T) % T);
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
  const core = G.core, cx = sx(core.x), cy = sy(core.y), R = CORE.arena * S;
  // Counting-chamber grid etched into the slide: fine lines every 100 units, heavier every 500.
  const x0 = cam.x - W / 2 / S, y0 = cam.y - H / 2 / S, x1 = x0 + W / S, y1 = y0 + H / S;
  for (const [step, a, lw] of [[100, 0.07, 1], [500, 0.13, 1.6]]) {
    ctx.strokeStyle = `rgba(30,38,32,${a})`; ctx.lineWidth = lw; ctx.beginPath();
    for (let gx = Math.ceil(x0 / step) * step; gx < x1; gx += step) { const X = Math.round(sx(gx)) + 0.5; ctx.moveTo(X, 0); ctx.lineTo(X, H); }
    for (let gy = Math.ceil(y0 / step) * step; gy < y1; gy += step) { const Y = Math.round(sy(gy)) + 0.5; ctx.moveTo(0, Y); ctx.lineTo(W, Y); }
    ctx.stroke();
  }
  // Beyond the chamber: the spacer's edge, darker and out of focus.
  ctx.fillStyle = 'rgba(38,44,40,0.62)';
  ctx.beginPath(); ctx.rect(-20, -20, W + 40, H + 40); ctx.arc(cx, cy, R, 0, TAU, true); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.strokeStyle = 'rgba(20,24,22,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();
  // The egg's warm zone, marked like a region of interest in the imaging software.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, CORE.sanctuary * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
}

// Darkfield: a true black (AMOLED) field. Only the faintest out-of-focus specks and discs drift behind,
// so the specimens are the only bright things on screen.
function drawDarkfieldBackground() {
  const df = WORLD_DF; WORLD_DF = false;
  ctx.fillStyle = '#000000'; ctx.fillRect(-20, -20, W + 40, H + 40);
  const alpha = [0.07, 0.06, 0.1];
  SPR.layers.forEach((L, i) => {
    const T = L.T;
    ctx.globalAlpha = SPR.layers.length === 1 ? 0.08 : alpha[i];
    const ox = -((((cam.x * S * L.f) % T) + T) % T), oy = -((((cam.y * S * L.f) % T) + T) % T);
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  });
  ctx.globalAlpha = 1;
  const core = G.core, cx = sx(core.x), cy = sy(core.y);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, CORE.arena * S, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, CORE.sanctuary * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  WORLD_DF = df;
}

// Soft scorch marks with a faint tint of whatever died there.
function scorchSprite() {
  if (SPR.scorch) return SPR.scorch;
  const c = makeCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  SPR.scorch = c;
  return c;
}
function drawDecals(vis) {
  const spr = scorchSprite();
  for (const d of G.decals) {
    if (!vis(d)) continue;
    const a = Math.min(1, d.life / 4), x = sx(d.x), y = sy(d.y), r = d.r * S;
    ctx.globalAlpha = a * 0.22;
    ctx.drawImage(spr, x - r, y - r * 0.8, r * 2, r * 1.6);
    if (d.color !== '#000') {
      ctx.globalAlpha = a * 0.35; ctx.fillStyle = 'rgb(50,56,52)';
      for (let i = 0; i < 4; i++) { const an = d.rot + i * 1.7, rr = r * (0.25 + (i % 2) * 0.3); ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.8, 1.5 + (i % 3), 0, TAU); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the egg
function drawCore() {
  // The oocyte, as it looks under phase contrast: a big granular sphere with a paler rim, a thick glassy
  // zona pellucida, a polar body in the gap, and the corona radiata (small dark cells packed radially
  // against the zona) fading out into the looser cumulus cloud.
  const c = G.core, x = sx(c.x), y = sy(c.y), r = c.r * S, t = G.realT;
  const egg = G.eggE, dmg = egg ? 1 - egg.hp / egg.maxHp : 0;
  if (!SPR.oocyte || SPR.oocyteR !== Math.round(r)) buildOocyte(r);
  const O = SPR.oocyte, sz = O.width / (DPR > 1 ? Math.min(2, DPR) : 1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.02);
  ctx.drawImage(O, -sz / 2, -sz / 2, sz, sz);
  ctx.restore();
  // Once breakable, the zona fluoresces (as if labelled) and pulses.
  if (egg) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(255,120,190,${0.35 + Math.sin(t * 6) * 0.15})`; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, TAU); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (c.flash > 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  // Cracks spread as the membrane weakens.
  if (egg && dmg > 0.02) {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const n = Math.ceil(dmg * 14);
    for (const [col, lw] of [['rgba(255,255,255,0.8)', 3], ['rgba(20,24,22,0.8)', 1.2]]) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; seed = 7;
      for (let i = 0; i < n; i++) {
        let a = rnd() * TAU, rr = r * (0.2 + rnd() * 0.3);
        ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
        for (let k = 0; k < 4; k++) { a += (rnd() - 0.5) * 0.7; rr += r * 0.2; ctx.lineTo(x + Math.cos(a) * Math.min(rr, r * 1.15), y + Math.sin(a) * Math.min(rr, r * 1.15)); }
        ctx.stroke();
      }
    }
  }  // High detail: the zona pellucida visibly breaches where the damage is worst, and granules leak out.
  if (egg && SET.detail === 'high' && dmg > 0.35) {
    const p = me(), ba = Math.atan2(p.y - c.y, p.x - c.x), span = 0.12 + (dmg - 0.35) * 0.9;
    ctx.strokeStyle = 'rgba(20,24,22,0.85)'; ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.arc(x, y, r * 1.13, ba - span, ba + span); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r * 1.02, ba - span, ba + span); ctx.moveTo(x + Math.cos(ba + span) * r * 1.25, y + Math.sin(ba + span) * r * 1.25); ctx.arc(x, y, r * 1.25, ba + span, ba - span, true); ctx.stroke();
    ctx.fillStyle = 'rgba(40,46,42,0.7)';
    for (let i = 0; i < 10; i++) { const f = ((t * 0.35 + i * 0.1) % 1), a = ba + (i % 5 - 2) * span * 0.35, d = r * (1.05 + f * 0.6); ctx.globalAlpha = 1 - f; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2 + (i % 3), 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}
function buildOocyte(r) {
  const D = Math.min(2, DPR), R = Math.round(r), size = Math.ceil(R * 4.2), c = makeCanvas(size * D, size * D), g = c.getContext('2d');
  g.scale(D, D); g.translate(size / 2, size / 2);
  let seed = 99; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // Cumulus cloud: loose, faint cells.
  for (let i = 0; i < 160; i++) {
    const a = rnd() * TAU, d = R * (1.55 + rnd() * 0.5), cr = R * (0.035 + rnd() * 0.03);
    g.fillStyle = `rgba(70,78,72,${0.15 + rnd() * 0.15})`; g.beginPath(); g.arc(Math.cos(a) * d, Math.sin(a) * d, cr, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 1; g.stroke();
  }
  // Corona radiata: elongated dark cells standing radially on the zona.
  for (let i = 0; i < 70; i++) {
    const a = i / 70 * TAU + rnd() * 0.05, d = R * (1.32 + rnd() * 0.06);
    g.save(); g.rotate(a); g.translate(d, 0);
    g.fillStyle = `rgba(60,68,62,${0.55 + rnd() * 0.2})`; g.beginPath(); g.ellipse(0, 0, R * 0.09, R * 0.045, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 1; g.stroke();
    g.restore();
  }
  // Zona pellucida: a thick, glassy, slightly lighter band with bright edges.
  g.fillStyle = 'rgba(200,208,200,0.45)'; g.beginPath(); g.arc(0, 0, R * 1.24, 0, TAU); g.arc(0, 0, R * 1.03, 0, TAU, true); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 1.24, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(40,46,42,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, R * 1.03, 0, TAU); g.stroke();
  // Polar body in the perivitelline space.
  g.fillStyle = 'rgb(96,104,98)'; g.beginPath(); g.arc(R * 0.72, -R * 0.66, R * 0.14, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; g.stroke();
  // Ooplasm: granular, darker in the middle, a clear cortical rim.
  const og = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.95);
  og.addColorStop(0, 'rgb(98,106,100)'); og.addColorStop(0.75, 'rgb(122,130,124)'); og.addColorStop(1, 'rgb(158,166,160)');
  g.fillStyle = og; g.beginPath(); g.arc(0, 0, R * 0.95, 0, TAU); g.fill();
  for (let i = 0; i < 900; i++) {
    const a = rnd() * TAU, d = Math.sqrt(rnd()) * R * 0.86;
    g.fillStyle = rnd() < 0.65 ? `rgba(30,36,32,${0.12 + rnd() * 0.2})` : `rgba(255,255,255,${0.12 + rnd() * 0.18})`;
    g.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1 + rnd() * 1.4, 1 + rnd() * 1.4);
  }
  // Germinal vesicle with its nucleolus.
  g.fillStyle = 'rgba(170,178,170,0.55)'; g.beginPath(); g.arc(-R * 0.18, R * 0.12, R * 0.26, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(40,46,42,0.5)'; g.lineWidth = 1.2; g.stroke();
  g.fillStyle = 'rgb(60,66,62)'; g.beginPath(); g.arc(-R * 0.14, R * 0.1, R * 0.07, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2.2; g.beginPath(); g.arc(0, 0, R * 0.95, 0, TAU); g.stroke();
  SPR.oocyte = SET.darkfield ? invertCanvas(c) : c; SPR.oocyteR = R;
}

// Weapon visuals that belong to an origin (player or echo): drones, orbit blades, beams.
function drawWeaponFx(weapons, ox, oy, alpha) {
  const px = sx(ox), py = sy(oy);
  ctx.globalAlpha = alpha;
  const prevOp = ctx.globalCompositeOperation;
  for (const w of weapons) {
    ctx.globalCompositeOperation = 'source-over';
    if (!w) continue;
    if (w.def.drones) {
      for (let i = 0; i < w.s.count; i++) {
        const a = G.realT * 1.6 + i / w.s.count * TAU, rr = 42 + (w.s.count > 2 ? 10 : 0);
        const x = px + Math.cos(a) * rr * S, y = py + Math.sin(a) * rr * S;
        ctx.fillStyle = w.def.color; drawShape('diamond', x, y, 7 * S, 0); ctx.fill();
      }
    }
    if (w.blades.length) {
      for (let i = 0; i < w.blades.length; i += 3) {
        const x = sx(w.blades[i]), y = sy(w.blades[i + 1]);
        if (emits(w.def.elem)) { glow(x, y, w.s.size * 2 * S, w.def.color, 0.35 * alpha); ctx.globalAlpha = alpha; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(w.blades[i + 2] + G.realT * 8);
        ctx.fillStyle = w.def.color; ctx.fillRect(-w.s.size * S, -2.5 * S, w.s.size * 2 * S, 5 * S); ctx.fillRect(-2.5 * S, -w.s.size * 0.6 * S, 5 * S, w.s.size * 1.2 * S);
        ctx.restore();
      }
    }
    if (w.beams.length && w.beamT > 0) {
      ctx.globalCompositeOperation = 'lighter'; // beams are light
      for (const b of w.beams) {
        const L = w.s.range * S, x2 = px + Math.cos(b.a) * L, y2 = py + Math.sin(b.a) * L, fl = 0.8 + Math.random() * 0.4;
        ctx.strokeStyle = w.def.color; ctx.globalAlpha = 0.25 * alpha; ctx.lineWidth = w.s.size * 4 * S * fl; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = 0.5 * alpha; ctx.lineWidth = w.s.size * 1.8 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = alpha; ctx.strokeStyle = '#fff'; ctx.lineWidth = w.s.size * 0.6 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        glow(x2, y2, w.s.size * 5 * S, w.def.color, 0.6 * alpha);
      }
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = prevOp;
}

// ---------------------------------------------------------------- mutations
// Your sperm upgrades (not weapon upgrades) show on your body: Multishot grows extra flagella, Vitality and
// Armour make the head bigger and plated, Speed and Hydrodynamics stretch it and lengthen the tail, Haste
// quickens the beat, Sticky Cilia and Grip sprout cilia, Crit grows a barb, Might swells the acrosome,
// element passives dye the midpiece in their type colour, Magnet adds a receptor field, Regen and Vamp a
// glowing droplet, Luck a gold speck.
const NOLOOK = { tails: 1, head: 1, stretch: 1, tailLen: 1, beat: 1, armour: 0, cilia: 0, barb: 0, acro: 1, elem: null, field: 0, drop: 0, luck: 0 };
const ELEM_PASSIVE = { pyro: 'fire', cryo: 'ice', storm: 'shock', toxin: 'poison', arcanum: 'arcane', kinetic: 'phys' };
function shipLook() {
  const P = G.passives, key = Object.entries(P).join();
  if (G.lookKey === key && G.look) return G.look;
  const n = id => Math.min(5, P[id] || 0);
  let elem = null, best = 0;
  for (const id in ELEM_PASSIVE) if ((P[id] || 0) > best) { best = P[id]; elem = ELEM_PASSIVE[id]; }
  G.lookKey = key;
  G.look = {
    tails: 1 + Math.min(3, P.multishot || 0),
    head: 1 + 0.07 * n('vital') + 0.04 * n('armour'),
    stretch: 1 + 0.05 * (n('speed') + n('hydro')),
    tailLen: 1 + 0.07 * (n('speed') + n('hydro')),
    beat: 1 + 0.12 * (n('haste') + n('reload')),
    armour: n('armour'),
    cilia: Math.min(18, 5 * n('grip')),
    barb: n('crit') + n('critdmg'),
    acro: 1 + 0.06 * n('might'),
    elem: elem ? ELEM_UI[elem] : null, glowElem: elem === 'fire' || elem === 'shock' || elem === 'arcane',
    field: n('magnet'),
    drop: n('regen') + n('vamp'),
    luck: n('luck'),
  };
  return G.look;
}

function drawShip(x, y, face, tag, alpha, scale, body, look) {
  const L = look || NOLOOK;
  // A spermatozoon under phase contrast, in true proportions: a flat oval head (about 5 x 3 um) that reads
  // dark grey with a bright halo and a paler acrosome cap over its front half, a short thicker midpiece,
  // and a hair-thin flagellum about ten head-lengths long, beating in a travelling wave.
  // tag: a fluorescent label colour glowing on the acrosome (you are GFP-tagged; rivals wear other dyes).
  const sc = scale || 1, k = S * sc;
  const ph = G.realT * 16;
  if (body) {
    const back = 9 * sc * L.head * L.stretch, wx = body.x - Math.cos(face) * back, wy = body.y - Math.sin(face) * back;
    const v = body.tailV != null ? body.tailV : Math.hypot(body.vx || 0, body.vy || 0), len = 78 * sc * L.tailLen;
    stepTail(body, wx, wy, face, len, v, L.beat);
    const tails = [body.tail];
    if (L.tails > 1) {
      // Extra flagella sprout from either side of the neck and beat out of phase.
      body.xt = body.xt || [];
      const nx = -Math.sin(face), ny = Math.cos(face);
      for (let j = 1; j < L.tails; j++) {
        const sub = body.xt[j - 1] || (body.xt[j - 1] = { beat: j * 2.1 });
        const off = (j % 2 ? 1 : -1) * Math.ceil(j / 2) * 3.4 * sc * L.head;
        stepTail(sub, wx + nx * off, wy + ny * off, face + (j % 2 ? 0.3 : -0.3) * Math.ceil(j / 2), len * (0.9 - 0.05 * j), v, L.beat * (1 + 0.07 * j));
        tails.push(sub.tail);
      }
    }
    ctx.globalAlpha = alpha * 0.45; for (const t of tails) drawTail(t, '#ffffff', 2.8 * k);
    ctx.globalAlpha = alpha * 0.9; for (const t of tails) drawTail(t, 'rgb(46,52,48)', 1.1 * k);
  }
  ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  if (L !== NOLOOK) ctx.scale(L.head * L.stretch, L.head / Math.sqrt(L.stretch));
  ctx.lineCap = 'round';
  if (L.field) {
    // Chemoreceptor field: a faint rotating dashed ring.
    ctx.save(); ctx.rotate(G.realT * 0.8); ctx.setLineDash([2 * k, 4 * k]);
    ctx.strokeStyle = 'rgba(214,228,240,0.22)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, (13 + 2.2 * L.field) * k, 0, TAU); ctx.stroke(); ctx.restore();
  }
  if (!body) {
    // Ghosts (echoes) keep a simple procedural tail.
    const segs = 14, len = 70 * k;
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? 'rgb(46,52,48)' : '#ffffff'; ctx.lineWidth = pass ? 1.1 * k : 2.8 * k;
      ctx.globalAlpha = alpha * (pass ? 0.9 : 0.45);
      ctx.beginPath(); ctx.moveTo(-9 * k, 0);
      for (let i = 1; i <= segs; i++) { const f = i / segs; ctx.lineTo(-9 * k - f * len, Math.sin(ph - f * 7) * 6 * k * f); }
      ctx.stroke();
    }
    ctx.globalAlpha = alpha;
  }
  // Midpiece: short, a little thicker than the tail, dark.
  ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = alpha * 0.5; ctx.lineWidth = 3.6 * k;
  ctx.beginPath(); ctx.moveTo(-5 * k, 0); ctx.lineTo(-11 * k, 0); ctx.stroke();
  ctx.globalAlpha = alpha; ctx.strokeStyle = L.elem || 'rgb(58,64,60)'; ctx.lineWidth = (L.elem ? 2.4 : 2) * k; ctx.stroke();
  if (L.drop) {
    // Cytoplasmic droplet at the neck, pulsing with regeneration.
    ctx.fillStyle = '#ffffff'; ctx.globalAlpha = alpha * (0.45 + 0.25 * Math.sin(G.realT * 4));
    ctx.beginPath(); ctx.arc(-7 * k, 0, (1.2 + 0.25 * L.drop) * k, 0, TAU); ctx.fill(); ctx.globalAlpha = alpha;
  }
  if (L.cilia) {
    // Cilia: short hairs round the back and sides of the head, rippling.
    ctx.strokeStyle = 'rgba(40,46,42,0.85)'; ctx.lineWidth = Math.max(0.7, 0.45 * k);
    ctx.beginPath();
    for (let i = 0; i < L.cilia; i++) {
      const a = Math.PI * 0.35 + (i / (L.cilia - 1 || 1)) * Math.PI * 1.3, ex = 1 * k + Math.cos(a) * 7.5 * k, ey = Math.sin(a) * 5 * k;
      const w = Math.sin(G.realT * 10 + i) * 0.5;
      ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(a + w) * 2.6 * k, ey + Math.sin(a + w) * 2.6 * k);
    }
    ctx.stroke();
  }
  if (L.barb) {
    // Crit barb: a hardened point on the acrosome.
    const bl = (2 + L.barb * 0.9) * k;
    ctx.fillStyle = 'rgb(58,64,60)'; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(7.6 * k + bl, 0); ctx.lineTo(7.8 * k, -1.8 * k); ctx.lineTo(7.8 * k, 1.8 * k); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // Head with halo.
  ctx.beginPath(); ctx.ellipse(1 * k, 0, 7.5 * k, 5 * k, 0, 0, TAU);
  ctx.fillStyle = MIC.body; ctx.fill();
  pcHalo(2.2 * k, 0.75);
  if (L.armour) {
    // Armour: a thickened, plated membrane.
    ctx.strokeStyle = 'rgb(30,34,32)'; ctx.lineWidth = (0.5 + 0.4 * L.armour) * k; ctx.stroke();
    if (L.armour >= 2) { ctx.setLineDash([2.2 * k, 1.4 * k]); ctx.strokeStyle = 'rgba(214,228,240,0.6)'; ctx.lineWidth = 0.6 * k; ctx.stroke(); ctx.setLineDash([]); }
  }
  // Acrosome: paler cap over the front of the head, glowing when labelled.
  ctx.beginPath(); ctx.ellipse(3.6 * k, 0, 4.4 * k * L.acro, 4.3 * k * L.acro, 0, 0, TAU);
  ctx.fillStyle = tag || MIC.acro; ctx.globalAlpha = alpha * (tag ? 0.85 : 0.8); ctx.fill();
  ctx.globalAlpha = alpha;
  // Post-acrosomal dark band and nucleus shading.
  ctx.fillStyle = 'rgba(20,24,22,0.35)'; ctx.beginPath(); ctx.ellipse(-2.6 * k, 0, 2 * k, 4 * k, 0, 0, TAU); ctx.fill();
  if (SET.detail === 'high' && k > 0.55) {
    // Mitochondrial sheath: the midpiece's helix of mitochondria.
    ctx.strokeStyle = 'rgba(210,216,212,0.55)'; ctx.lineWidth = Math.max(0.6, 0.5 * k);
    ctx.beginPath(); for (let i = 0; i < 5; i++) { const hx = -5.5 * k - i * 1.2 * k; ctx.moveTo(hx, -1.3 * k); ctx.lineTo(hx - 0.8 * k, 1.3 * k); } ctx.stroke();
    // Equatorial segment and a couple of small nuclear vacuoles.
    ctx.strokeStyle = 'rgba(210,216,212,0.4)'; ctx.beginPath(); ctx.moveTo(1.2 * k, -4.4 * k); ctx.quadraticCurveTo(0.2 * k, 0, 1.2 * k, 4.4 * k); ctx.stroke();
    ctx.fillStyle = 'rgba(230,236,232,0.55)';
    ctx.beginPath(); ctx.arc(-0.6 * k, -1.4 * k, 0.55 * k, 0, TAU); ctx.moveTo(0.4 * k + 0.5 * k, 1.6 * k); ctx.arc(0.4 * k, 1.6 * k, 0.45 * k, 0, TAU); ctx.fill();
  }
  if (L.luck) { ctx.fillStyle = PAL.reward; ctx.beginPath(); ctx.arc(-0.8 * k, 0, (0.6 + 0.15 * L.luck) * k, 0, TAU); ctx.fill(); }
  ctx.restore();
  if (L.elem && L.glowElem) { ctx.globalCompositeOperation = 'lighter'; glow(x - Math.cos(face) * 8 * k * L.head, y - Math.sin(face) * 8 * k * L.head, 8 * k, L.elem, 0.4 * alpha); ctx.globalCompositeOperation = 'source-over'; }
  if (tag) { ctx.globalCompositeOperation = 'lighter'; glow(x + Math.cos(face) * 3.6 * k, y + Math.sin(face) * 3.6 * k, 11 * k, tag, 0.55 * alpha); ctx.globalCompositeOperation = 'source-over'; }
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- flagellum physics
// A tail is a chain of points in world space. The root is pinned behind the head and beats side to side;
// every other link is dragged along by the one in front (so turns sweep the tail round behind you and
// swimming leaves a travelling wave), with a little stiffness pulling it straight when you stop.
const TAIL_N = 11;
function stepTail(o, rx, ry, face, len, speed, beatMul) {
  const now = G.realT, dt = Math.min(0.05, Math.max(0, now - (o.tailT || now)));
  o.tailT = now;
  const seg = len / (TAIL_N - 1);
  if (!o.tail || o.tail.length !== TAIL_N || Math.hypot(o.tail[0].x - rx, o.tail[0].y - ry) > len * 3) {
    o.tail = [];
    for (let i = 0; i < TAIL_N; i++) o.tail.push({ x: rx - Math.cos(face) * seg * i, y: ry - Math.sin(face) * seg * i });
  }
  o.beat = (o.beat || Math.random() * 10) + dt * (9 + Math.min(14, speed / 10)) * (beatMul || 1);
  const nx = -Math.sin(face), ny = Math.cos(face), amp = len * 0.11;
  const t = o.tail;
  t[0].x = rx + nx * Math.sin(o.beat) * amp * 0.5; t[0].y = ry + ny * Math.sin(o.beat) * amp * 0.5;
  // The second link follows the head's axis more strictly so the tail leaves the head cleanly.
  for (let i = 1; i < TAIL_N; i++) {
    const a = t[i - 1], b = t[i];
    // Water drag: links lag behind; stiffness: drift towards straight-back from the link ahead.
    const pv = i > 1 ? t[i - 2] : { x: a.x + Math.cos(face) * seg, y: a.y + Math.sin(face) * seg };
    let ax = a.x - pv.x, ay = a.y - pv.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
    const st = Math.min(1, dt * (i === 1 ? 30 : 6));
    b.x = lerp(b.x, a.x + ax * seg, st); b.y = lerp(b.y, a.y + ay * seg, st);
    // Idle wiggle so a stationary swimmer still looks alive.
    const w = Math.sin(o.beat - i * 0.7) * amp * 0.06 * i / TAIL_N;
    b.x += nx * w; b.y += ny * w;
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    b.x = a.x + dx / d * seg; b.y = a.y + dy / d * seg;
  }
}
function drawTail(t, color, width) {
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // Tapered: draw in three runs, thinning towards the tip.
  for (let run = 0; run < 3; run++) {
    const i0 = Math.floor(run * (TAIL_N - 1) / 3), i1 = Math.floor((run + 1) * (TAIL_N - 1) / 3);
    ctx.lineWidth = Math.max(0.8, width * (1 - run * 0.3));
    ctx.beginPath(); ctx.moveTo(sx(t[i0].x), sy(t[i0].y));
    for (let i = i0 + 1; i <= i1; i++) ctx.lineTo(sx(t[i].x), sy(t[i].y));
    ctx.stroke();
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

// ---------------------------------------------------------------- terrain
// Drawn as they'd look in the same phase-contrast field: refractile debris (bright-edged, glassy),
// mitochondria (dark rods with pale cristae, glowing orange as they charge, like a membrane-potential
// dye), acidic vesicles (dark granular sacs lit by an acid-tracking green dye), patches of ciliated
// epithelium, streams of drifting particles, and highly refractile lipid droplets.
function drawTerrain() {
  if (!G.terrain) return;
  const t = G.realT, m = 200;
  const x0 = cam.x - W / 2 / S - m, x1 = cam.x + W / 2 / S + m, y0 = cam.y - H / 2 / S - m, y1 = cam.y + H / 2 / S + m;
  for (const ob of G.terrain.list) {
    if (ob.x < x0 || ob.x > x1 || ob.y < y0 || ob.y > y1) continue;
    const x = sx(ob.x), y = sy(ob.y), r = ob.r * S;
    let seed = Math.floor(ob.seed * 1000) + 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    switch (ob.type) {
      case 'ridge': {
        // Refractile debris: an irregular glassy clump.
        ctx.beginPath();
        for (let i = 0; i < 11; i++) { const a = ob.a + i / 11 * TAU, rr = r * (0.82 + rnd() * 0.3); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        ctx.closePath();
        ctx.fillStyle = ob.flash > 0 ? 'rgb(235,240,235)' : 'rgb(150,158,150)'; ctx.fill();
        pcHalo(4, 0.85);
        ctx.strokeStyle = 'rgba(40,46,42,0.35)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + (rnd() - 0.5) * r, y + (rnd() - 0.5) * r); ctx.lineTo(x + (rnd() - 0.5) * r, y + (rnd() - 0.5) * r); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.3, r * 0.3, r * 0.14, -0.6, 0, TAU); ctx.fill();
        break;
      }
      case 'mito': {
        const k = ob.charge / ob.def.charge, pulse = k > 0.8 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
        if (k > 0.05 || ob.burstT > 0) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * (1.7 + pulse * 0.5 + ob.burstT * 3), PAL.reward, k * 0.55 + pulse * 0.2 + ob.burstT); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
        ctx.save(); ctx.translate(x, y); ctx.rotate(ob.a);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * 0.62, 0, 0, TAU);
        ctx.fillStyle = ob.flash > 0 ? 'rgb(200,205,200)' : `rgb(${Math.round(70 + 120 * k)},${Math.round(74 + 30 * k)},${Math.round(70 - 20 * k)})`; ctx.fill();
        pcHalo(3, 0.7);
        ctx.strokeStyle = `rgba(${Math.round(190 + 65 * k)},${Math.round(200 - 40 * k)},${Math.round(190 - 120 * k)},0.7)`; ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) { const cx0 = i * r * 0.3; ctx.beginPath(); ctx.moveTo(cx0, -r * 0.5 * Math.cos(i * 0.4)); ctx.quadraticCurveTo(cx0 + r * 0.12, 0, cx0, r * 0.5 * Math.cos(i * 0.4)); ctx.stroke(); }
        ctx.restore();
        ctx.fillStyle = 'rgba(20,24,22,0.55)'; ctx.fillRect(x - r * 0.6, y + r * 0.8, r * 1.2, 4);
        ctx.fillStyle = PAL.reward; ctx.fillRect(x - r * 0.6, y + r * 0.8, r * 1.2 * k, 4);
        break;
      }
      case 'acid': {
        
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
        const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
        g.addColorStop(0, 'rgb(52,62,40)'); g.addColorStop(0.8, 'rgb(84,100,60)'); g.addColorStop(1, 'rgb(150,190,90)');
        ctx.fillStyle = g; ctx.fill();
        pcHalo(3, 0.6);
        ctx.strokeStyle = PAL.danger; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r - 1, 0, TAU); ctx.stroke();
        for (let i = 0; i < 14; i++) { const a = rnd() * TAU + t * 0.3, d = r * 0.8 * Math.sqrt(rnd()); ctx.fillStyle = PAL.danger; ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 2, 2); }
        for (let i = 0; i < 4; i++) {
          const ph = (t * 0.7 + ob.seed + i * 0.37) % 1, a = ob.seed * 7 + i * 2.1, d = r * 0.5 * ((i * 0.31 + ob.seed) % 1);
          ctx.strokeStyle = `rgba(230,255,190,${1 - ph})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (2 + ph * 6) * S, 0, TAU); ctx.stroke();
        }
        break;
      }
      case 'cilia': {
        // A patch of ciliated epithelium: pale cell outlines with a fringe of beating cilia.
        ctx.fillStyle = 'rgba(120,128,122,0.35)'; ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + ob.a; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.stroke();
        const n = Math.round(ob.r / 3);
        ctx.strokeStyle = 'rgba(40,46,42,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU, sw = Math.sin(t * 9 - i * 0.5) * 0.28, r0 = r * 0.62, r1 = r * 0.98;
          ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
          ctx.quadraticCurveTo(x + Math.cos(a + sw * 0.5) * (r0 + r1) / 2, y + Math.sin(a + sw * 0.5) * (r0 + r1) / 2, x + Math.cos(a + sw) * r1, y + Math.sin(a + sw) * r1);
        }
        ctx.stroke();
        break;
      }
      case 'current': {
        // A stream: particles drifting along, with a faint boundary.
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        const ca = Math.cos(ob.a), sa = Math.sin(ob.a);
        for (let i = 0; i < 26; i++) {
          const lane = (rnd() - 0.5) * 2 * r, ph = ((t * ob.def.push * S / (2 * r) + rnd()) % 1) * 2 * r - r;
          const px = x + ca * ph - sa * lane, py = y + sa * ph + ca * lane, len = 10 * S;
          ctx.strokeStyle = 'rgba(30,36,32,0.4)'; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(px - ca * len, py - sa * len); ctx.lineTo(px, py); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(px - 1, py - 1, 2, 2);
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        break;
      }
      case 'slick': {
        // Lipid droplet: very refractile, bright with a hard dark ring and a wide halo.
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
        const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r);
        g.addColorStop(0, 'rgba(255,255,250,0.55)'); g.addColorStop(0.7, 'rgba(215,222,212,0.35)'); g.addColorStop(1, 'rgba(160,168,160,0.3)');
        ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(30,36,32,0.55)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r + 5, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.25, r * 0.12, -0.6, 0, TAU); ctx.fill();
        break;
      }
    }
  }
}

const SHADE = new Map();
function shade(hex) {
  let v = SHADE.get(hex);
  if (v) return v;
  const n = parseInt(hex.slice(1, 7), 16), f = 0.55;
  v = `rgb(${Math.round((n >> 16 & 255) * f)},${Math.round((n >> 8 & 255) * f)},${Math.round((n & 255) * f)})`;
  SHADE.set(hex, v);
  return v;
}

// ---------------------------------------------------------------- main render
function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#05040b';
  ctx.fillRect(0, 0, W, H);
  if (!G) { drawTitleBackdrop(); return; }
  const rewinding = G.state === 'rewind';
  const shx = cam.shake ? rand(-cam.shake, cam.shake) : 0, shy = cam.shake ? rand(-cam.shake, cam.shake) : 0;
  ctx.save();
  ctx.translate(shx, shy);
  WORLD_DF = !!SET.darkfield;
  drawBackground();
  const p = G.player;
  const vx0 = cam.x - W / 2 / S - 90, vx1 = cam.x + W / 2 / S + 90, vy0 = cam.y - H / 2 / S - 90, vy1 = cam.y + H / 2 / S + 90;
  const vis = o => o.x > vx0 && o.x < vx1 && o.y > vy0 && o.y < vy1;

  drawDecals(vis);
  drawTerrain();
  // Dynamic lights pooling on the floor.
  ctx.globalCompositeOperation = 'lighter';
  for (const l of G.lights) if (vis(l)) glow(sx(l.x), sy(l.y), l.r * S, l.color, 0.35 * (l.life / l.max));
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  // Zones.
  for (const z of G.zones) {
    if (!vis(z)) continue;
    const a = Math.min(1, z.life / 0.4);
    const x = sx(z.x), y = sy(z.y), r = z.r * S;
    if (z.trail) {
      const zk = Math.min(1, z.life / z.max * 2);
      if (z.src && emits(z.src.elem)) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.5, z.color, 0.45 * zk); ctx.globalCompositeOperation = 'source-over'; }
      else { ctx.globalAlpha = 0.35 * zk; ctx.fillStyle = z.color; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      continue;
    }
    if (z.pull || (z.src && emits(z.src.elem))) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.1, z.color, 0.35 * a); ctx.globalCompositeOperation = 'source-over'; }
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = z.color; ctx.lineWidth = 2;
    if (z.pull) {
      for (let k = 0; k < 4; k++) { const rr = ((G.realT * 0.9 + k / 4) % 1) * z.r; ctx.beginPath(); ctx.arc(x, y, (z.r - rr) * S, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, 14 * S, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#e0aaff'; ctx.beginPath(); ctx.arc(x, y, 15 * S, 0, TAU); ctx.stroke();
    } else {
      // Bubbling pool.
      for (let k = 0; k < 5; k++) { const an = G.realT * 0.7 + k * 1.3, rr = r * (0.2 + ((k * 0.37 + G.realT * 0.3) % 0.7)); ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr, 3 + k % 3, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  drawCore();

  // Gems and scrap (no glow: they're just granules).
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  for (const g of G.gems) {
    if (!vis(g)) continue;
    const x = sx(g.x), y = sy(g.y);
    if (g.kind === 's') {
      // Scrap cog.
      const r = (g.v >= 10 ? 6 : 4) * S;
      ctx.fillStyle = '#ffb400'; drawShape('spike', x, y, r, G.realT * 2); ctx.fill();
      ctx.fillStyle = '#5a3a00'; ctx.beginPath(); ctx.arc(x, y, r * 0.35, 0, TAU); ctx.fill();
      continue;
    }
    const r = (g.v >= 20 ? 7 : g.v >= 5 ? 5.5 : 4) * S;
    const col = g.v >= 20 ? '#ffd23f' : g.v >= 5 ? '#80ffdb' : '#4cc9f0';
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * 1.3); ctx.lineTo(x - r, y); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r * 0.5, y - r * 0.2); ctx.lineTo(x, y); ctx.fill();
  }
  // Pickups: temporary power-ups are monitor magenta; loot boxes are gold.
  for (const u of G.pickups) {
    if (!vis(u)) continue;
    const d = POWERUPS[u.type], x = sx(u.x), y = sy(u.y) + Math.sin(u.bob) * 3, r = 13 * S, pc = u.type === 'chest' ? PAL.reward : PAL.pickup;
    if (u.life < 5 && Math.floor(u.life * 6) % 2) continue;
    drawShape(u.type === 'chest' ? 'square' : 'hex', x, y, r, 0); ctx.fillStyle = '#0a0f14'; ctx.fill();
    ctx.strokeStyle = pc; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = pc; ctx.font = `bold ${Math.round(14 * S)}px ` + "ui-monospace, Menlo, monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.letter, x, y + 1);
  }
  // Mines & lob shadows.
  for (const pr of G.proj) {
    if (pr.mine) {
      const x = sx(pr.x), y = sy(pr.y);
      ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.arc(x, y, 7 * S, 0, TAU); ctx.fill();
      const on = pr.arm > 0 || Math.floor(G.realT * 5) % 2;
      ctx.fillStyle = on ? pr.color : '#fff';
      ctx.beginPath(); ctx.arc(x, y, 3.5 * S, 0, TAU); ctx.fill();
    } else if (pr.lob) {
      const k = pr.h ? pr.h / 90 : 0;
      ctx.fillStyle = `rgba(0,0,0,${0.45 - k * 0.25})`; ctx.beginPath(); ctx.ellipse(sx(pr.x), sy(pr.y), (6 + k * 4) * S, (3 + k * 2) * S, 0, 0, TAU); ctx.fill();
    }
  }
  // Sentry turrets.
  for (const t of G.turrets) {
    const x = sx(t.x), y = sy(t.y);
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 7, 13 * S, 7 * S, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2b2b3a'; drawShape('hex', x, y, 12 * S, 0); ctx.fill();
    ctx.strokeStyle = t.color || '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face) * 16 * S, y + Math.sin(t.face) * 16 * S); ctx.lineWidth = 4; ctx.stroke();
  }

  // Elite, boss and ally auras.
  ctx.globalCompositeOperation = 'lighter';
  for (const e of G.enemies) {
    if (!vis(e) || e.egg) continue;
    if (e.burn > 0) glow(sx(e.x), sy(e.y), e.r * 2 * S, '#ff7a2f', 0.3);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // Enemies.
  for (const e of G.enemies) {
    if (!vis(e) || e.egg) continue;
    const squash = 1 + Math.max(0, e.flash) * 2;
    const x = sx(e.x), y = sy(e.y), r = e.r * S * squash;
    ctx.globalAlpha = e.phased ? 0.25 : 1;
    if (e.def.ai === 'charge' && e.st === 1) { ctx.strokeStyle = 'rgba(241,91,181,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * 250 * S, y + e.dashY * 250 * S); ctx.stroke(); }
    if (e.aimT > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 - e.aimT) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(e.aimA) * 700 * S, y + Math.sin(e.aimA) * 700 * S); ctx.stroke(); }
    const tgt = e.charmed && e.allyT ? e.allyT : G.player;
    const face = e.rival ? (e.face || 0) : e.def.ai === 'charge' && e.st === 2 ? Math.atan2(e.dashY, e.dashX) : Math.atan2(tgt.y - e.y, tgt.x - e.x);
    const sh = e.def.shape;
    const rot = sh === 'sperm' ? face : sh === 'antibody' ? face + Math.PI / 2 : e.age * (sh === 'spike' ? 3 : 1) + (sh === 'tri' ? face : 0);
    if (sh === 'sperm') {
      // Swimmers are drawn like you: real sperm with dragging tails. Rivals carry their fluorescent dye.
      if (e.tailV == null) { e.tailV = 0; e.px = e.x; e.py = e.y; }
      const fdt = Math.max(1e-3, G.realT - (e.tailT || G.realT)); e.tailV = Math.hypot(e.x - e.px, e.y - e.py) / fdt; e.px = e.x; e.py = e.y;
      const tag = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#bde0fe' : e.charmed ? PAL.you : e.rival ? e.color : e.elite ? '#ffd23f' : null;
      drawShip(x, y, face, tag, e.phased ? 0.25 : 1, e.r * squash / 8, e);
    } else if (e.def.shape === 'eye') {
      const eg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      eg.addColorStop(0, '#5a1a8e'); eg.addColorStop(1, '#14002a');
      ctx.fillStyle = e.flash > 0 ? '#fff' : eg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.stroke();
      const la = Math.atan2(G.player.y - e.y, G.player.x - e.x);
      ctx.fillStyle = '#ff3df2'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.4, y + Math.sin(la) * r * 0.4, r * 0.35, 0, TAU); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.5, y + Math.sin(la) * r * 0.5, r * 0.15, 0, TAU); ctx.fill();
    } else {
      // Phase contrast: a grey body (a hint of its hue), darker towards the middle, bright halo round the edge.
      drawShape(e.def.shape, x, y, r, rot);
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#c9e4f5' : pcTone(e.color, sh === 'amoeba' ? 0.62 : 0.36);
      ctx.fill();
      if (e.flash <= 0 && sh !== 'amoeba') {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
        drawShape(e.def.shape, x, y, r, rot);
      }
      if (sh === 'amoeba' && e.flash <= 0) {
        // Amoeba: clear hyaline rim (ectoplasm), granular endoplasm streaming inside, a nucleus, a clear
        // contractile vacuole, and the dark remains of whatever it has engulfed in food vacuoles.
        ctx.save(); drawShape(sh, x, y, r, rot); ctx.clip();
        ctx.fillStyle = 'rgba(70,78,72,0.55)'; drawShape(sh, x - r * 0.04, y, r * 0.82, rot + 0.3); ctx.fill();
        for (let i = 0, gn = SET.detail === 'high' ? 70 : 26; i < gn; i++) { const a = i * 2.39 + e.id + e.age * (SET.detail === 'high' ? 0.25 + (i % 5) * 0.04 : 0.25), d = r * 0.72 * Math.sqrt((i * 0.618) % 1); ctx.fillStyle = i % 3 ? 'rgba(30,36,32,0.35)' : 'rgba(255,255,255,0.3)'; ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(1, r * 0.035), Math.max(1, r * 0.035)); }
        for (let i = 0; i < Math.min(10, e.meals || 0); i++) { const a = i * 1.9 + e.age * 0.2, d = r * 0.5 * ((i * 0.53) % 1); ctx.fillStyle = 'rgba(30,34,32,0.5)'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.1, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.fillStyle = 'rgba(150,158,150,0.7)'; ctx.beginPath(); ctx.arc(x - r * 0.15, y + r * 0.12, r * 0.2, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(30,36,32,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
        const cv = 0.08 + 0.1 * ((e.age * 0.25 + e.id * 0.1) % 1);
        ctx.fillStyle = 'rgba(225,232,225,0.8)'; ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.3, r * cv, 0, TAU); ctx.fill();
        ctx.restore();
        drawShape(sh, x, y, r, rot);
      }
      if (sh === 'cell' && e.flash <= 0) {
        // White blood cell: granular cytoplasm and a dark lobed nucleus.
        ctx.fillStyle = 'rgba(30,36,32,0.45)';
        for (let i = 0; i < 3; i++) { const a = e.id + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.24, 0, TAU); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        const gn = SET.detail === 'high' ? 26 : 8;
        for (let i = 0; i < gn; i++) { const a = i * 2.4 + e.id, d = r * 0.8 * ((i * 0.37) % 1); ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.5, 1.5); }
        if (SET.detail === 'high') { ctx.strokeStyle = 'rgba(230,236,232,0.35)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = e.id + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.24, 0, TAU); ctx.stroke(); } }
        drawShape(sh, x, y, r, rot);
      }
      if (e.elite || e.charmed) {
        // Immunostained: a fluorescent rim marks elites (gold) and your allies (pink).
        ctx.strokeStyle = e.charmed ? PAL.you : PAL.reward; ctx.lineWidth = 3; ctx.stroke();
      } else pcHalo(e.boss ? 4.5 : Math.max(2.5, r * 0.16), e.boss ? 0.95 : 0.85);
    }
    let si = 0;
    const st = c => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 3 + si * 3, 0, TAU); ctx.stroke(); si++; };
    if (e.burn > 0) st('#ff7a2f');
    if (e.chill > 0) st('#6fd8ff');
    if (e.poison > 0) st('#8dff4a');
    if (e.shock > 0) st('#ffe94a');
    if (e.mark > 0) st('#c77dff');
    if (e.stasisT > G.realT) st('rgba(184,192,255,0.7)');
    if (e.parasiteT > 0) st('#b5e48c');
    if (e.charmed) { ctx.fillStyle = PAL.you; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ALLY ' + Math.ceil(e.charmT), x, y - r - 12); }
    if (e === G.grudge) {
      // Grudge target: a rotating red crosshair.
      ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2.5;
      const gr = r + 10 + Math.sin(G.realT * 8) * 2, ga = G.realT * 2;
      for (let i = 0; i < 4; i++) { const a = ga + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, gr, a, a + 0.9); ctx.stroke(); }
      ctx.fillStyle = '#ff4d6d'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GRUDGE', x, y - gr - 6);
    }
    if ((e.auraArm > 0 || e.armour >= 8) && !e.boss) { ctx.strokeStyle = '#8da9c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r + 1, -2.4, -0.7); ctx.stroke(); }
    if (e.rival) {
      // Rival champions: name, level and a proper health bar.
      const bw = Math.max(46, r * 3), by = y - r - 12;
      ctx.fillStyle = '#000'; ctx.fillRect(x - bw / 2, by, bw, 5);
      ctx.fillStyle = e.color; ctx.fillRect(x - bw / 2, by, bw * Math.max(0, e.hp / e.maxHp), 5);
      ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      const label = `${e.name}  LV ${e.lvl}` + (e.mode === 'hunt' ? '  !' : e.mode === 'flee' ? '  (fleeing)' : '');
      ctx.strokeText(label, x, by - 5); ctx.fillStyle = e.color; ctx.fillText(label, x, by - 5);
    } else if ((e.elite || e.hp < e.maxHp) && !e.boss && e.maxHp > 30) {
      const bw = Math.max(18, r * 2);
      ctx.fillStyle = '#000'; ctx.fillRect(x - bw / 2, y - r - 8, bw, 3);
      ctx.fillStyle = e.elite ? PAL.reward : '#e6e6e6'; ctx.fillRect(x - bw / 2, y - r - 8, bw * Math.max(0, e.hp / e.maxHp), 3);
    }
  }
  ctx.globalAlpha = 1;

  drawTracks(vis);
  // Paradox echoes: translucent ghosts with afterimages.
  for (const echo of G.echoes) {
    const fade = Math.min(1, (echo.dur - echo.t) / 0.6, echo.t / 0.3);
    const x = sx(echo.x), y = sy(echo.y), face = Math.hypot(echo.vx, echo.vy) > 10 ? Math.atan2(echo.vy, echo.vx) : echo.face;
    echo.face = face;
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y, 40 * S, '#8dffc0', 0.45 * fade);
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 3; k >= 1; k--) {
      const ex = echo.x - echo.vx * 0.05 * k, ey = echo.y - echo.vy * 0.05 * k;
      drawShip(sx(ex), sy(ey), face, '#8dffc0', 0.12 * fade * (4 - k), playerScale());
    }
    drawShip(x, y, face, '#8dffc0', 0.6 * fade, playerScale());
    drawWeaponFx(echo.weapons, echo.x, echo.y, 0.6 * fade);
    ctx.globalAlpha = fade; ctx.strokeStyle = '#8dffc0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 22 * S, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, 1 - echo.t / echo.dur)); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Player.
  const px = sx(p.x), py = sy(p.y);
  if (G.barrier > 0) { ctx.strokeStyle = 'rgba(72,202,228,0.8)'; ctx.fillStyle = 'rgba(72,202,228,0.10)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, G.barrierR * S, 0, TAU); ctx.fill(); ctx.stroke(); }
  if (G.shieldT > 0) { ctx.strokeStyle = '#48cae4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.stroke(); }
  for (const w of G.weapons) {
    if (!w) continue;
    if (w.def.kind === 'siphon') {
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = G.realT * 30;
      ctx.strokeStyle = w.def.color + '66'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, w.s.area * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    if (w.def.heat && w.heat > 0.6) { ctx.globalCompositeOperation = 'lighter'; glow(px, py, 30 * S, '#ff5400', (w.heat - 0.6) * 1.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  }
  drawShip(px, py, p.hd != null ? p.hd : p.face, p.flash > 0 ? '#ff4d6d' : PAL.you, p.iframes > 0 && Math.floor(G.realT * 20) % 2 ? 0.4 : 1, playerScale(), p, shipLook());
  ctx.fillStyle = '#000'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S, 4);
  ctx.fillStyle = p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S * (p.hp / G.P.maxHp), 4);

  // Additive layer: weapon fx, projectiles, particles, fx.
  ctx.globalCompositeOperation = 'lighter';
  drawWeaponFx(G.weapons, p.x, p.y, 1);
  ctx.globalCompositeOperation = 'lighter'; // tethers are electric
  for (const t of G.tethers) {
    const x1 = sx(t.a.x), y1 = sy(t.a.y), x2 = sx(t.b.x), y2 = sy(t.b.y), k = Math.min(1, t.life / 0.3);
    for (const [lw, al] of [[8, 0.25], [2.5, 1]]) {
      ctx.globalAlpha = al * k; ctx.strokeStyle = '#9ef0ff'; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      for (let i = 1; i < 6; i++) { const f = i / 6; ctx.lineTo(lerp(x1, x2, f) + rand(-5, 5), lerp(y1, y2, f) + rand(-5, 5)); }
      ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  for (const pr of G.proj) {
    if (pr.mine || !vis(pr)) continue;
    const x = sx(pr.x), y = sy(pr.y), hot = emits(pr.src && pr.src.elem) || pr.style === 'flame' || pr.style === 'void';
    ctx.globalCompositeOperation = hot ? 'lighter' : 'source-over';
    if (pr.lob) {
      const yy = y - (pr.h || 0) * S;
      if (hot) { glow(x, yy, 16 * S, pr.color, 0.8); ctx.globalAlpha = 1; }
      else { ctx.fillStyle = 'rgba(20,20,20,0.85)'; ctx.beginPath(); ctx.arc(x, yy, 7.5 * S, 0, TAU); ctx.fill(); }
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(x, yy, 6 * S, 0, TAU); ctx.fill();
      continue;
    }
    const a = Math.atan2(pr.vy, pr.vx), r = pr.r * S;
    if (hot && pr.style !== 'flame') glow(x, y, Math.max(8, r * 3.2), pr.color, 0.55);
    else if (!hot) { ctx.fillStyle = 'rgba(20,20,20,0.8)'; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = pr.color; ctx.strokeStyle = pr.color;
    switch (pr.style) {
      case 'flame': {
        const k = 1 - pr.life / pr.max;
        glow(x, y, r * (1.4 + k * 2.6), k < 0.35 && pr.src.elem === 'fire' ? '#ffd166' : pr.color, 0.75 * (1 - k));
        ctx.globalAlpha = 1;
        break;
      }
      case 'rail': ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 60 * S, y - Math.sin(a) * 60 * S); ctx.lineTo(x, y); ctx.stroke(); break;
      case 'bolt': case 'needle': case 'shard':
        ctx.lineWidth = (pr.style === 'shard' ? 4 : 2.5) * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 3.5, y - Math.sin(a) * r * 3.5); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); break;
      case 'glaive': case 'disc':
        ctx.save(); ctx.translate(x, y); ctx.rotate(G.realT * 18);
        drawShape(pr.style === 'glaive' ? 'star' : 'hex', 0, 0, r, 0); ctx.fill(); ctx.restore(); break;
      case 'void':
        glow(x, y, pr.aura * S, pr.color, 0.35); ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        break;
      case 'prequel':
        // A shell flying backwards: the flame trail is in front of it.
        ctx.lineWidth = r * 1.1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 3, y + Math.sin(a) * r * 3); ctx.stroke();
        glow(x + Math.cos(a) * r * 3, y + Math.sin(a) * r * 3, r * 2.5, '#ffd166', 0.8); ctx.globalAlpha = 1;
        break;
      case 'scrap':
        ctx.save(); ctx.translate(x, y); ctx.rotate(G.realT * 10);
        drawShape('spike', 0, 0, r, 0); ctx.fill(); ctx.fillStyle = '#5a3a00'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill(); ctx.restore(); break;
      case 'sperm': {
        // Seeker Siblings: little spermatozoa with a beating tail, swimming head-first at their target.
        const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, ph = G.realT * 26 + (pr.seed || (pr.seed = Math.random() * 10));
        const hl = r * 1.3, tl = r * 5.5;
        ctx.lineWidth = Math.max(1, r * 0.35); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - ca * hl, y - sa * hl);
        for (let i = 1; i <= 6; i++) { const f = i / 6, w = Math.sin(ph - f * 6) * r * 0.9 * f; ctx.lineTo(x - ca * (hl + tl * f) + nx * w, y - sa * (hl + tl * f) + ny * w); }
        ctx.stroke(); ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.ellipse(x, y, hl, r * 0.85, a, 0, TAU); ctx.fill();
        break;
      }
      case 'rocket': case 'missile':
        ctx.lineWidth = r * 1.2; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 2.4, y - Math.sin(a) * r * 2.4); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
        if (Math.random() < 0.5 && !rewinding) spawnPart(pr.x - pr.vx * 0.02, pr.y - pr.vy * 0.02, '#ff9e00', 1, 20, 0.25, 2);
        break;
      default: ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
  // Debris particles are matter, not light.
  ctx.globalCompositeOperation = 'source-over';
  for (const q of G.parts) {
    if (!vis(q)) continue;
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.color;
    const s = q.size * S;
    ctx.fillRect(sx(q.x) - s / 2, sy(q.y) - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter'; // arcs, blasts and shockwaves are energy
  for (const f of G.fx) {
    const k = f.life / f.max;
    if (f.type === 'ring') {
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = f.w * k + 1;
      ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S * (1.1 - k * 0.4), 0, TAU); ctx.stroke();
    } else if (f.type === 'bolt') {
      ctx.strokeStyle = f.color;
      for (const [lw, al] of [[7, 0.25], [2.5, 1]]) {
        ctx.globalAlpha = k * al; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(sx(f.pts[0]), sy(f.pts[1]));
        for (let i = 2; i < f.pts.length; i += 2) ctx.lineTo(sx(f.pts[i]), sy(f.pts[i + 1]));
        ctx.stroke();
      }
    } else if (f.type === 'warn') {
      ctx.globalAlpha = 0.5; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.2; ctx.fillStyle = f.color; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S * (1 - k), 0, TAU); ctx.fill();
    } else if (f.type === 'echoMark' && f.e && !f.e.dead) {
      // Clock-hand countdown on enemies that will be hit again by the Paradox Rifle.
      const x = sx(f.e.x), y = sy(f.e.y), rr = (f.e.r + 7) * S;
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#8dffc0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k)); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Enemy bullets on top: solid danger-red beads with a dark rim and a small highlight (no bloom).
  const byColor = {};
  for (const b of G.ebul) { if (!vis(b)) continue; (byColor[b.color] || (byColor[b.color] = [])).push(b); }
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(20,24,22,0.7)'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = (b.r + 3) * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.fill();
  for (const c in byColor) {
    ctx.fillStyle = c; ctx.beginPath();
    for (const b of byColor[c]) { const x = sx(b.x), y = sy(b.y), r = (b.r + 1.5) * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x) - b.r * 0.35 * S, y = sy(b.y) - b.r * 0.35 * S, r = b.r * 0.32 * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.fill();

  // Floating texts.
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of G.texts) {
    ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
    const pop = 1 + Math.max(0, (t.life / t.max - 0.8)) * 2;
    ctx.font = `900 ${Math.round(t.size * Math.max(0.8, S) * pop)}px sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t.txt, sx(t.x), sy(t.y));
    ctx.fillStyle = t.color; ctx.fillText(t.txt, sx(t.x), sy(t.y));
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  WORLD_DF = false;
  // Screen-space post effects: out-of-focus foreground, lens blur at the rim, vignette (none in clinical view).
  if (!SET.clinical) {
    drawForeground();
    if (!rewinding) drawLensBlur();
    buildVignette();
    ctx.drawImage(SPR.vignette, 0, 0, W, H);
  }
  if (G.warp > 0) { ctx.fillStyle = 'rgba(120,130,255,0.08)'; ctx.fillRect(0, 0, W, H); }
  if (p.flash > 0) { ctx.globalAlpha = p.flash / 0.2 * 0.5; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (p.hp / G.P.maxHp < 0.3) { ctx.globalAlpha = 0.25 + Math.sin(G.realT * 6) * 0.1; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (rewinding) drawRewindFx();
  drawHud();
}

// You grow as you level up: up to 1.8x at level 60.
function playerScale() { return 1 + SWIM.growth * (G.level - 1); }

function drawEdgeFlash() {
  const e = Math.min(W, H) * 0.08;
  ctx.fillRect(0, 0, W, e); ctx.fillRect(0, H - e, W, e); ctx.fillRect(0, 0, e, H); ctx.fillRect(W - e, 0, e, H);
}

// VHS-style rewind: cyan tint, scanlines, tearing bands and a running-backwards clock.
function drawRewindFx() {
  const r = G.rewind, t = G.realT;
  ctx.fillStyle = 'rgba(40,140,200,0.22)'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let y = (t * 120) % 4; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
  for (let i = 0; i < 3; i++) {
    const y = ((t * (300 + i * 170)) % (H + 80)) - 40, h = 10 + i * 8;
    ctx.fillStyle = `rgba(141,255,192,${0.08 + i * 0.03})`; ctx.fillRect(0, y, W, h);
    try { ctx.drawImage(cv, 0, y * DPR, cv.width, h * DPR, 8 + i * 6, y, W, h); } catch (e) { /* ignore */ }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.min(44, W / 9)}px sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText('<< REWIND', W / 2 + 3, H * 0.42 + 3);
  ctx.fillStyle = Math.floor(t * 6) % 2 ? '#8dffc0' : '#e0fbff'; ctx.fillText('<< REWIND', W / 2, H * 0.42);
  ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#e0fbff';
  ctx.fillText(r.auto ? 'Fatal timeline detected. Your future self stays behind.' : 'Your future self becomes a Paradox Echo.', W / 2, H * 0.42 + 36);
}

function drawTitleBackdrop() {
  if (!SPR.layers) buildLayers();
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6);
  bg.addColorStop(0, '#b6b6b6'); bg.addColorStop(0.6, '#a6a6a6'); bg.addColorStop(1, '#6f6f6f');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const t = performance.now() / 1000;
  for (const L of SPR.layers) {
    const T = L.T, ox = -(((t * 40 * L.f) % T) + T) % T, oy = -(((t * 15 * L.f) % T) + T) % T;
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
}

// ---------------------------------------------------------------- HUD (canvas part)
// CASA-style tracking overlay (as in computer-assisted sperm analysis software): each tracked swimmer
// leaves a colour-coded path of its last few seconds, and rivals get detection brackets.
function trackPoint(o) {
  o.trk = o.trk || [];
  const last = o.trk[o.trk.length - 1];
  if (!last || G.realT - last.t > 0.12) { o.trk.push({ x: o.x, y: o.y, t: G.realT }); if (o.trk.length > 26) o.trk.shift(); }
}
function drawTrackLine(o, color) {
  const t = o.trk;
  if (!t || t.length < 2) return;
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineJoin = 'round';
  for (let i = 1; i < t.length; i++) {
    ctx.globalAlpha = 0.15 + 0.65 * i / t.length;
    ctx.beginPath(); ctx.moveTo(sx(t[i - 1].x), sy(t[i - 1].y)); ctx.lineTo(sx(t[i].x), sy(t[i].y)); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
}
function drawTracks(vis) {
  const p = G.player;
  trackPoint(p); drawTrackLine(p, '#4dff9a');
  for (const e of G.enemies) {
    if (!e.rival || e.dead) continue;
    trackPoint(e);
    if (!vis(e)) continue;
    drawTrackLine(e, e.color);
    const x = sx(e.x), y = sy(e.y), b = e.r * S * 1.9, c = b * 0.35;
    ctx.strokeStyle = e.color; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      ctx.moveTo(x + dx * b, y + dy * (b - c)); ctx.lineTo(x + dx * b, y + dy * b); ctx.lineTo(x + dx * (b - c), y + dy * b);
    }
    ctx.stroke();
  }
}

// Scale bar and objective readout, bottom-left, like the imaging software burns into a frame.
// A sperm head is about 15 world units long and ~5 um in reality, so 30 units is 10 um.
function drawScaleBar() {
  const land = LAYOUT.land, bh = land ? 0 : (UI.bottomH || 230), y = H - bh - 22, x = land ? LAYOUT.colW + 12 : 12, len = 30 * S * 2;
  ctx.fillStyle = XR.white; ctx.fillRect(x, y, len, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y + 3, len, 1);
  ctx.font = 'bold 10px ui-monospace, Menlo, Consolas, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = XR.white; ctx.fillText('20 \u00b5m', x, y - 4);
  ctx.fillStyle = XR.white; ctx.fillText('PH2 40x  37\u00b0C  ' + Math.round(FPS.v) + ' FPS', x + len + 10, y + 4);
  // Lead side marker, as on a radiograph.
  const mkx = land ? W - 112 : W - 26, mky = land ? H - 40 : H * 0.5;
  filmPanel(mkx - 1, mky - 11, 19, 22);
  ctx.font = 'bold 13px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = XR.white; ctx.fillText('R', mkx + 8.5, mky + 5);
}

// Film grain: a small noise tile drawn at a new random offset every frame, so dark panels shimmer
// like an X-ray on a lightbox instead of sitting flat black.
let GRAIN = null;
function grainPattern() {
  if (GRAIN) return GRAIN;
  const c = makeCanvas(96, 96), g = c.getContext('2d'), img = g.createImageData(96, 96);
  for (let i = 0; i < img.data.length; i += 4) { const v = 150 + Math.random() * 105; img.data[i] = v * 0.9; img.data[i + 1] = v * 0.96; img.data[i + 2] = v; img.data[i + 3] = Math.random() < 0.5 ? Math.random() * 90 : 0; }
  g.putImageData(img, 0, 0);
  GRAIN = ctx.createPattern(c, 'repeat');
  return GRAIN;
}
// A film sheet: rounded, lifted by a soft drop shadow, blue-black with an uneven exposure and shimmering
// grain, and an edge that catches the light top-left and fades away (no hard outline).
function sheetPath(x, y, w, h, round, rad, g) {
  g = g || ctx;
  g.beginPath();
  if (round) { g.arc(x, y, w, 0, TAU); return; }
  const r = Math.min(rad || 10, w / 2, h / 2);
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// Performance: each panel size is rendered once (shadow, exposure, edge and grain baked in) into three
// cached frames with different grain; the shimmer is just cycling those frames. No per-frame blur.
const SHEETS = new Map();
function bakeSheet(bw, bh, round, seed) {
  const pad = 14, D = Math.min(2, DPR), c = makeCanvas(Math.ceil((bw + pad * 2) * D), Math.ceil((bh + pad * 2) * D)), g = c.getContext('2d');
  g.scale(D, D); g.translate(pad, pad);
  const shape = () => round ? sheetPath(bw / 2, bh / 2, bw / 2, 0, true, 0, g) : sheetPath(0, 0, bw, bh, false, 10, g);
  shape();
  g.shadowColor = 'rgba(0,0,0,0.55)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
  const gr = g.createRadialGradient(bw * 0.28, bh * 0.15, 0, bw * 0.28, bh * 0.15, Math.max(bw, bh));
  gr.addColorStop(0, 'rgba(24,35,48,0.94)'); gr.addColorStop(0.55, 'rgba(10,17,24,0.94)'); gr.addColorStop(1, 'rgba(4,8,12,0.95)');
  g.fillStyle = gr; g.fill();
  g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.save(); shape(); g.clip();
  let sd = seed * 9301 + 49297; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0, n = SET.clinical ? 0 : Math.floor(bw * bh / 9); i < n; i++) { const v = 170 + rnd() * 85; g.fillStyle = `rgba(${v * 0.9 | 0},${v * 0.96 | 0},${v | 0},${0.05 + rnd() * 0.07})`; g.fillRect(rnd() * bw, rnd() * bh, 1, 1); }
  g.restore();
  if (round) sheetPath(bw / 2, bh / 2, bw / 2 - 0.5, 0, true, 0, g); else sheetPath(0.5, 0.5, bw - 1, bh - 1, false, 10, g);
  const eg = g.createLinearGradient(0, 0, bw * 0.8, bh);
  eg.addColorStop(0, 'rgba(214,228,240,0.38)'); eg.addColorStop(0.4, 'rgba(214,228,240,0.08)'); eg.addColorStop(0.75, 'rgba(214,228,240,0)'); eg.addColorStop(1, 'rgba(214,228,240,0.10)');
  g.strokeStyle = eg; g.lineWidth = 1; g.stroke();
  return { c, pad };
}
function filmPanel(x, y, w, h, round) {
  const bx = round ? x - w : x, by = round ? y - w : y, bw = Math.round(round ? w * 2 : w), bh = Math.round(round ? w * 2 : h);
  const key = bw + 'x' + bh + (round ? 'o' : '');
  let set = SHEETS.get(key);
  if (!set) { set = [0, 1, 2].map(i => bakeSheet(bw, bh, round, i + 1)); SHEETS.set(key, set); if (SHEETS.size > 60) SHEETS.clear(); }
  const f = set[Math.floor(G.realT * 8) % 3];
  const sb = ctx.shadowColor; ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.drawImage(f.c, bx - f.pad, by - f.pad, bw + f.pad * 2, bh + f.pad * 2);
  ctx.shadowColor = sb;
}
// A rounded bar on a film sheet: dark rounded track with a soft shadow, rounded fill.
function softBar(x, y, w, k, color) {
  filmPanel(x - 2, y - 2, w + 4, 14, false);
  const fw = Math.max(0, Math.min(1, k)) * w;
  if (fw > 1) { sheetPath(x, y, Math.max(fw, 8), 10, false, 5); ctx.fillStyle = color; ctx.fill(); }
}
const MONO = "ui-monospace, 'SF Mono', 'Roboto Mono', 'DejaVu Sans Mono', Menlo, Consolas, monospace";
// One ECG beat as a function of phase 0..1: P wave, QRS spike, T wave.
function ecgWave(ph) {
  if (ph > 0.1 && ph < 0.2) return 0.14 * Math.sin((ph - 0.1) / 0.1 * Math.PI);
  if (ph >= 0.28 && ph < 0.3) return -0.18 * (ph - 0.28) / 0.02;
  if (ph >= 0.3 && ph < 0.315) return -0.18 + 1.18 * (ph - 0.3) / 0.015;
  if (ph >= 0.315 && ph < 0.335) return 1 - 1.4 * (ph - 0.315) / 0.02;
  if (ph >= 0.335 && ph < 0.36) return -0.4 + 0.4 * (ph - 0.335) / 0.025;
  if (ph > 0.5 && ph < 0.68) return 0.28 * Math.sin((ph - 0.5) / 0.18 * Math.PI);
  return 0;
}
// Patient-monitor module: HP as a vital sign, heart rate that climbs as you get hurt, a live ECG trace
// (your green; danger red when low; flat when you die), and level / kills / viewers underneath.
// Minimal HUD: everything in one thin bar. HP (with a slim bar), level, time, race position, kills.
function drawMiniBar(top, m, s) {
  const p = G.player, k = clamp(p.hp / G.P.maxHp, 0, 1), w = W - 70, x = 8, y = top + 8, h = 24;
  filmPanel(x, y, w, h);
  const sb = ctx.shadowOffsetX; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = 'bold 11px ' + MONO;
  ctx.fillStyle = k < 0.3 ? PAL.danger : XR.white; ctx.fillText('HP ' + Math.ceil(p.hp), x + 8, y + 16);
  const bx = x + 58, bw = Math.min(70, w * 0.2);
  ctx.fillStyle = 'rgba(214,228,240,0.15)'; ctx.fillRect(bx, y + 10, bw, 4);
  ctx.fillStyle = k < 0.3 ? PAL.danger : PAL.you; ctx.fillRect(bx, y + 10, bw * k, 4);
  const board = G.rivalsInit ? rivalBoard() : [];
  const place = board.findIndex(r => r.you) + 1, ord = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'][place] || '';
  ctx.fillStyle = XR.white;
  const txt = `LV ${G.level}  ${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}  RACE ${ord}  K ${G.kills}`;
  ctx.fillText(txt, bx + bw + 10, y + 16);
  ctx.shadowOffsetX = sb; ctx.shadowOffsetY = sb;
}
function drawVitals(top) {
  const p = G.player, P = G.P, k = clamp(p.hp / P.maxHp, 0, 1), low = k < 0.3, dead = p.hp <= 0;
  const x0 = 8, y0 = top + 10, w = Math.min(190, W * 0.46), h = 58;
  const sb = ctx.shadowBlur; ctx.shadowBlur = 0;
  filmPanel(x0, y0, w, h);
  const hr = dead ? 0 : Math.round(62 + 98 * (1 - k) + (G.rage > 0 ? 25 : 0));
  const E = G.ecg || (G.ecg = { ph: 0, buf: new Array(80).fill(0), t: G.realT });
  const steps = Math.min(8, Math.max(0, Math.round((G.realT - E.t) * 60)));
  if (steps) E.t = G.realT;
  for (let i = 0; i < steps; i++) { E.ph = (E.ph + hr / 3600) % 1; E.buf.push(dead ? 0 : ecgWave(E.ph)); E.buf.shift(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '9px ' + MONO; ctx.fillStyle = XR.dim; ctx.fillText('HP', x0 + 6, y0 + 12);
  ctx.font = 'bold 22px ' + MONO; ctx.fillStyle = low ? PAL.danger : XR.white;
  const hv = String(Math.ceil(p.hp)); ctx.fillText(hv, x0 + 6, y0 + 34);
  const hw = ctx.measureText(hv).width;
  ctx.font = '10px ' + MONO; ctx.fillStyle = XR.dim; ctx.fillText('/' + P.maxHp, x0 + 8 + hw, y0 + 34);
  ctx.fillText('HR ' + (dead ? '---' : hr), x0 + 6, y0 + 50);
  const tx = x0 + 74, tw = w - 80, ty = y0 + 32, n = E.buf.length;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath();
  for (let gx = tx; gx < tx + tw; gx += 10) { ctx.moveTo(gx + 0.5, y0 + 4); ctx.lineTo(gx + 0.5, y0 + h - 4); }
  ctx.stroke();
  ctx.lineJoin = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++) { const X = tx + i / (n - 1) * tw, Y = ty - E.buf[i] * 20; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
  ctx.strokeStyle = low || dead ? PAL.danger : PAL.you; ctx.globalAlpha = 0.25; ctx.lineWidth = 4; ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.stroke(); ctx.lineJoin = 'miter';
  ctx.shadowBlur = sb;
  // Readouts under the module.
  ctx.font = 'bold 10px ' + MONO; ctx.fillStyle = XR.white;
  let line = `LV ${G.level}   KILLS ${G.kills}   VIEWERS ${fmtViewers(G.show.viewers)}`;
  if (ownsScrapWeapon()) line += `   SCRAP ${Math.floor(G.scrap)}`;
  ctx.fillText(line, x0, y0 + h + 14);
}

function drawHud() {
  const p = G.player, top = UI.safeTop || 0;
  // Everything on the HUD gets a soft dark drop so it reads against the pale field.
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  drawScaleBar();
  // XP: a thin calibration line across the very top.
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, top, W, 3);
  ctx.fillStyle = XR.white; ctx.fillRect(0, top, W * Math.min(1, G.xp / G.xpNeed), 3);
  const c = G.core, mini = SET.hud === 'minimal', land = LAYOUT.land, BY = land ? (mini ? 56 : 30) : mini ? 60 : 126;
  // Landscape: the bars sit top centre, between the vitals and the bigger minimap.
  const barX = land && !mini ? 210 : 10, barW = land && !mini ? Math.min(420, W - 210 - 190) : Math.min(360, W - 130);
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  if (mini) drawMiniBar(top, m, s);
  else {
    drawVitals(top);
    // Clock, like a monitor's elapsed-time readout.
    ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.font = 'bold 15px ' + MONO;
    ctx.fillStyle = G.state === 'rewind' ? PAL.you : XR.white;
    ctx.fillText(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`, W - 62, top + 32);
    ctx.font = '9px ' + MONO; ctx.fillStyle = XR.dim; ctx.fillText('ELAPSED', W - 62, top + 44);
  }
  // Status chips.
  const chips = [];
  if (G.rage > 0) chips.push(['ADRENALINE', PAL.pickup]);
  if (G.shieldT > 0) chips.push(['SHIELD', PAL.pickup]);
  if (G.warp > 0) chips.push(['WARP', XR.white]);
  if (G.barrier > 0) chips.push(['AEGIS', XR.white]);
  if (G.echoes.length) chips.push(['ECHO x' + G.echoes.length, PAL.you]);
  if (G.manual) chips.push(['MANUAL', XR.white]);
  ctx.font = 'bold 10px ' + MONO; ctx.textAlign = 'left';
  let cxp = 8;
  const cy = mini ? top + 38 : top + 91;
  for (const [ch, cc] of chips) { const tw = ctx.measureText(ch).width + 14; filmPanel(cxp, cy, tw, 16); ctx.fillStyle = cc; ctx.fillText(ch, cxp + 7, cy + 12); cxp += tw + 5; }
  // Boss bar.
  if (G.boss && !G.boss.dead) {
    const b = G.boss, bw = barW, bx = barX, by = top + BY;
    softBar(bx, by, bw, b.hp / b.maxHp, XR.white);
    ctx.textAlign = 'center'; ctx.fillStyle = XR.white; ctx.font = 'bold 11px ' + MONO;
    ctx.fillText(b.name + (b.armour ? `  [ARMOUR ${Math.round(effArmour(b))}]` : ''), bx + bw / 2, by - 8);
  }
  // Egg membrane bar, or progress towards being big enough.
  {
    const bw = barW, bx = barX, by = top + BY + (G.boss && !G.boss.dead ? 26 : 0), mid = bx + bw / 2;
    ctx.textAlign = 'center'; ctx.font = 'bold 11px ' + MONO;
    if (G.eggE && !G.eggE.dead && G.level < EGG.level) {
      const e = G.eggE, who = G.enemies.filter(o => o.rival && !o.dead && o.mode === 'egg').map(o => o.name);
      softBar(bx, by, bw, e.hp / e.maxHp, PAL.danger);
      ctx.fillStyle = '#ff8fab';
      ctx.fillText((who.length ? who.join(' & ') + ' breaking in: ' : 'Egg membrane: ') + Math.ceil(e.hp / e.maxHp * 100) + '%', mid, by - 8);
    } else if (G.eggE && !G.eggE.dead) {
      const e = G.eggE;
      softBar(bx, by, bw, e.hp / e.maxHp, XR.white);
      ctx.fillStyle = '#ffd6e8'; ctx.fillText("BREAK INTO THE EGG! " + Math.ceil(e.hp / e.maxHp * 100) + '%', mid, by - 8);
    } else if (!G.boss && G.level < EGG.level) {
      ctx.fillStyle = XR.white; ctx.font = 'bold 10px ' + MONO;
      if (!mini) ctx.fillText(`GROW TO LV ${EGG.level} TO BREAK INTO THE EGG`, mid, top + BY);
    }
  }
  // Off-screen pointers: boss (red) and the egg (pink).
  const pointer = (wx, wy, col) => {
    const dx = wx - cam.x, dy = wy - cam.y;
    if (Math.abs(dx * S) < W / 2 - 10 && Math.abs(dy * S) < H / 2 - 10) return;
    const a = Math.atan2(dy, dx), rr = Math.min(W, H) / 2 - 40;
    ctx.save(); ctx.translate(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); ctx.rotate(a); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, 9); ctx.lineTo(-8, -9); ctx.fill(); ctx.restore();
  };
  if (G.boss && !G.boss.dead) pointer(G.boss.x, G.boss.y, '#ff4d6d');
  for (const e of G.enemies) if (e.rival && !e.dead && (e.mode === 'egg' || e.mode === 'hunt')) pointer(e.x, e.y, e.color);
  pointer(c.x, c.y, G.eggE ? XR.white : '#ffb3d1');
  drawMinimap(top);
  if (SET.casa) drawCasa(top);
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  // Banner.
  if (G.banner) {
    const b = G.banner, a = Math.min(1, b.t * 2), sc = 1 + Math.max(0, b.t - 2.1) * 1.5;
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = `900 ${Math.min(24, W / 17) * sc}px sans-serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(b.text, W / 2, H * 0.3);
    ctx.fillStyle = b.color; ctx.fillText(b.text, W / 2, H * 0.3);
    ctx.globalAlpha = 1;
  }
  if (INPUT.active && G.manual) {
    ctx.strokeStyle = XR.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(INPUT.ox, INPUT.oy, 50, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(INPUT.ox + G.manual.x * 50, INPUT.oy + G.manual.y * 50, 20, 0, TAU); ctx.fill();
  }
}

function mmR() { return LAYOUT.land ? Math.round(clamp(H * 0.15, 62, 120)) : 44; }
function drawMinimap(top) {
  const R = mmR(), mx = W - R - 10, my = top + 70 + R;
  const k = R / CORE.arena;
  filmPanel(mx, my, R, 0, true);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath();
  ctx.arc(mx, my, R * 0.66, 0, TAU); ctx.moveTo(mx + R * 0.33, my); ctx.arc(mx, my, R * 0.33, 0, TAU);
  ctx.moveTo(mx - R, my); ctx.lineTo(mx + R, my); ctx.moveTo(mx, my - R); ctx.lineTo(mx, my + R); ctx.stroke();
  const dot = (x, y, r, col) => {
    let dx = (x - G.core.x) * k, dy = (y - G.core.y) * k; const d = Math.hypot(dx, dy);
    if (d > R - 2) { dx = dx / d * (R - 2); dy = dy / d * (R - 2); }
    ctx.fillStyle = col; ctx.fillRect(mx + dx - r / 2, my + dy - r / 2, r, r);
  };
  if (G.terrain) { ctx.globalAlpha = 0.45; for (const ob of G.terrain.list) if (ob.def.solid || ob.type === 'current') dot(ob.x, ob.y, 2, ob.def.color); ctx.globalAlpha = 1; }
  for (const e of G.enemies) if (e.def.spongy && e.r > 60) dot(e.x, e.y, Math.min(7, e.r / 20), e.color);
  for (const e of G.enemies) if (e.boss || e.elite || e.charmed) dot(e.x, e.y, e.boss ? 5 : 3, e.boss ? PAL.danger : e.charmed ? PAL.you : '#ffd23f');
  dot(G.core.x, G.core.y, 8, G.eggE ? XR.white : '#ffb3d1');
  for (const e of G.enemies) if (e.rival && !e.dead) dot(e.x, e.y, 5, e.color);
  for (const e of G.echoes) dot(e.x, e.y, 3, '#e0fbff');
  dot(G.player.x, G.player.y, 4, XR.white);
  // View rectangle.
  ctx.strokeStyle = XR.line; ctx.lineWidth = 1;
  ctx.strokeRect(mx + (cam.x - G.core.x - W / 2 / S) * k, my + (cam.y - G.core.y - H / 2 / S) * k, W / S * k, H / S * k);
  if (SET.hud !== 'minimal') drawRaceBoard(W - 10, my + R + 16);
}

// ---------------------------------------------------------------- CASA Pro panel
// Computer-assisted sperm analysis, live on yourself: the last second of your head track gives VCL (curvilinear
// speed), VSL (straight-line speed), LIN, ALH (lateral head amplitude) and BCF (beat-cross frequency), with a
// WHO motility grade, a histogram of what's on the slide and a log of tracked events.
// 20 um on the scale bar = 60 world units, so 1 world unit = 1/3 um.
const UM = 1 / 3;
const CASA = { pts: [], lastT: -1, log: [], hist: [] , histT: 0 };
function casaLog(text) {
  if (!SET.casa || !G) return;
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  CASA.log.unshift(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s} ${text}`);
  if (CASA.log.length > 4) CASA.log.length = 4;
}
function casaStats() {
  const P = CASA.pts;
  if (P.length < 8) return null;
  const T = P[P.length - 1].t - P[0].t || 1;
  let vcl = 0;
  for (let i = 1; i < P.length; i++) vcl += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  const vsl = Math.hypot(P[P.length - 1].x - P[0].x, P[P.length - 1].y - P[0].y);
  // Average path: a 7-point running mean. ALH is twice the mean distance from it; BCF counts side crossings.
  let dev = 0, n = 0, cross = 0, lastSide = 0;
  for (let i = 3; i < P.length - 3; i++) {
    let ax = 0, ay = 0;
    for (let j = -3; j <= 3; j++) { ax += P[i + j].x; ay += P[i + j].y; }
    ax /= 7; ay /= 7;
    const tx = P[i + 1].x - P[i - 1].x, ty = P[i + 1].y - P[i - 1].y, tl = Math.hypot(tx, ty) || 1;
    const side = ((P[i].x - ax) * ty - (P[i].y - ay) * tx) / tl;
    dev += Math.abs(side); n++;
    const sg = Math.sign(side);
    if (sg && lastSide && sg !== lastSide) cross++;
    if (sg) lastSide = sg;
  }
  const VCL = vcl / T * UM, VSL = vsl / T * UM;
  return { VCL, VSL, LIN: VCL > 0.5 ? VSL / VCL * 100 : 0, ALH: n ? dev / n * 2 * UM : 0, BCF: cross / T,
    grade: VSL >= 25 ? 'A  RAPID PROG.' : VSL >= 5 ? 'B  SLOW PROG.' : VCL >= 5 ? 'C  NON-PROG.' : 'D  IMMOTILE' };
}
function drawCasa(top) {
  const p = G.player;
  if (G.t !== CASA.lastT) {
    CASA.lastT = G.t;
    CASA.pts.push({ x: p.x, y: p.y, t: G.t });
    while (CASA.pts.length && G.t - CASA.pts[0].t > 1) CASA.pts.shift();
    if (G.t < CASA.pts[0].t) CASA.pts.length = 0; // rewound
  }
  // Population histogram, refreshed twice a second.
  if (G.realT - CASA.histT > 0.5 || G.realT < CASA.histT) {
    CASA.histT = G.realT;
    const cnt = {};
    for (const e of G.enemies) if (!e.dead && !e.rival && !e.egg) cnt[e.name] = (cnt[e.name] || 0) + 1;
    CASA.hist = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }
  const st = casaStats(), w = 150, h = 22 + (6 + CASA.hist.length + CASA.log.length) * 12 + 14;
  const x = LAYOUT.land ? W - mmR() * 2 - 20 - w - 10 : 8;
  const y = LAYOUT.land ? top + 70 : Math.max(top + (SET.hud === 'minimal' ? 60 : 150), H * 0.36);
  const osx = ctx.shadowOffsetX; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  filmPanel(x, y, w, h);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 9px ' + MONO; ctx.fillStyle = XR.dim; ctx.fillText('CASA  TRK #001  1.0 s', x + 8, y + 14);
  let yy = y + 28;
  const row = (k, v, col) => { ctx.font = '9px ' + MONO; ctx.fillStyle = XR.dim; ctx.fillText(k, x + 8, yy); ctx.font = 'bold 10px ' + MONO; ctx.fillStyle = col || XR.white; ctx.textAlign = 'right'; ctx.fillText(v, x + w - 8, yy); ctx.textAlign = 'left'; yy += 12; };
  if (st) {
    row('VCL um/s', st.VCL.toFixed(1)); row('VSL um/s', st.VSL.toFixed(1)); row('LIN %', st.LIN.toFixed(0));
    row('ALH um', st.ALH.toFixed(2)); row('BCF Hz', st.BCF.toFixed(1));
    ctx.font = 'bold 9px ' + MONO; ctx.fillStyle = st.grade[0] === 'A' ? PAL.you : XR.white; ctx.fillText('WHO ' + st.grade, x + 8, yy); yy += 12;
  } else { row('TRACKING', '...'); yy += 12 * 5; }
  const mx = CASA.hist.length ? CASA.hist[0][1] : 1;
  for (const [name, n] of CASA.hist) {
    ctx.fillStyle = 'rgba(214,228,240,0.28)'; ctx.fillRect(x + 8, yy - 7, (w - 46) * n / mx, 7);
    ctx.font = '8px ' + MONO; ctx.fillStyle = XR.white; ctx.fillText(name.slice(0, 18), x + 10, yy - 1);
    ctx.textAlign = 'right'; ctx.fillText(n, x + w - 8, yy - 1); ctx.textAlign = 'left';
    yy += 12;
  }
  ctx.fillStyle = XR.line; ctx.fillRect(x + 8, yy - 6, w - 16, 1); yy += 6;
  ctx.font = '8px ' + MONO;
  CASA.log.forEach((l, i) => { ctx.globalAlpha = 1 - i * 0.13; ctx.fillStyle = XR.white; ctx.fillText(l.slice(0, 28), x + 8, yy); yy += 12; });
  ctx.globalAlpha = 1; ctx.shadowOffsetX = osx; ctx.shadowOffsetY = osx;
}

// The race to the egg: you and the rival champions, by level.
function drawRaceBoard(rx, y) {
  if (!G.rivalsInit) return;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = '9px ' + MONO;
  ctx.fillStyle = XR.dim; ctx.fillText('RACE TO THE EGG', rx, y);
  rivalBoard().forEach((row, i) => {
    const yy = y + 14 + i * 13;
    ctx.globalAlpha = row.out ? 0.4 : 1;
    ctx.font = (row.you ? 'bold 11px ' : 'bold 10px ') + MONO;
    const tag = row.out ? 'OUT' : (row.egg ? 'EGG! ' : '') + 'LV ' + row.lvl;
    ctx.fillStyle = row.egg ? '#ff4d6d' : XR.white; ctx.fillText(tag, rx, yy);
    const tw = ctx.measureText(tag).width;
    ctx.fillStyle = row.color; ctx.fillText(row.name, rx - tw - 6, yy);
  });
  ctx.globalAlpha = 1;
}
