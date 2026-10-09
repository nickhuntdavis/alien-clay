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
// Everything starts greyscale: only the colours of the stains you've picked up this run get through.
const PAL_OK = new Set();
// Full Technicolour (a Mythical bonus): no more greyscale, anywhere.
let FULL_COL = false;
const DYE_COLOURS = {
  gfp: () => [PAL.you].concat(typeof G !== 'undefined' && G && G.seqCol ? [G.seqCol] : []), // you, and your weapons in your sequence's colour
  // (These three used to sit at the end of the comment above, so their colours never switched on.)
  immuno: () => [PAL.danger], luciferase: () => [PAL.reward], motility: () => [DYE_FAST, DYE_FAST_DK],
  rival: () => RIVALS.map(r => r.color), he: () => [PAL.upgrade, PAL.pickup].concat(Object.values(ELEM_UI)),
};
function refreshPalette() {
  PAL_OK.clear();
  for (const c of ['#ffffff', '#000000', XR.white, XR.dim]) PAL_OK.add(c);
  const dyes = (typeof G !== 'undefined' && G && G.dyes) || {};
  FULL_COL = !!(typeof G !== 'undefined' && G && ((G.boons && G.boons.technicolour) || G.finaleCol)); // (and while the egg hatches)
  if (typeof PC_TONE !== 'undefined') PC_TONE.clear();
  document.body.classList.toggle('technicolour', FULL_COL);
  for (const id in dyes) if (dyes[id] && DYE_COLOURS[id]) for (const c of DYE_COLOURS[id]()) PAL_OK.add(c.toLowerCase());
  if (typeof COL !== 'undefined') { COL.clear(); COLDF.clear(); SPR.glow.clear(); }
  document.body.classList.toggle('dye-ui', !!dyes.he);
}
// Element effects. With the H&E stain, Acid shows green, Base blue, Ethanol amber and Voodoo violet.
// Static is always coloured, in a static-shock blue and pink.
// (Acid and Ethanol took over colours that were drawn orange and green: ELEM_SWAP repaints those on the way through.)
const ELEM_SWAP = new Map([
  ['#ff7a2f', '#c6ff3d'], ['#ff5400', '#a8e61d'], ['#ff9e00', '#d4ff6b'], ['#ff9f1c', '#b5f23a'], ['#ffd166', '#e2ff9a'], ['#ff5a36', '#9fd61a'], ['#ffba08', '#ccff4d'],
  ['#8dff4a', '#e8a33d'], ['#9ef01a', '#d98c2b'], ['#b5e48c', '#f0c27a'], ['#d4ff5c', '#f2b552'],
]);
const ELEM_HEX = {
  fire: ['#c6ff3d', '#a8e61d', '#d4ff6b', '#b5f23a', '#e2ff9a', '#9fd61a', '#ccff4d'],
  ice: ['#5b8cff', '#6fd8ff', '#90e0ef', '#caf0f8', '#bde0fe', '#c9e4f5'],
  poison: ['#e8a33d', '#d98c2b', '#f0c27a', '#f2b552'],
  oxi: ['#9ff7ff', '#e6fbff'],
  salt: ['#ffb3c6', '#ffe5ec', '#fff0f3'],
  arcane: ['#c77dff', '#7b2cbf', '#7209b7', '#d0a3ff', '#e0aaff', '#9d4edd', '#b8c0ff'],
};
const STATIC_HEX = { '#ffe94a': '#6f9bff', '#fdf0d5': '#ff8ae0', '#9ef0ff': '#9fb0ff', '#fff3b0': '#ff8ae0' };
const ELEM_OF = new Map();
for (const el in ELEM_HEX) for (const h of ELEM_HEX[el]) ELEM_OF.set(h, el);
const PAL_ALIAS = { '#8dffc0': PAL.you, '#ff4d6d': PAL.danger, '#ff2e2e': PAL.danger, '#ff0033': PAL.danger, '#ffca3a': PAL.reward, '#ffd60a': PAL.reward, '#ffb400': PAL.reward };
const COL = new Map();
function col(c) {
  if (typeof c !== 'string') return c;
  if (c[0] === '#' && ELEM_SWAP.has(c.slice(0, 7).toLowerCase())) c = ELEM_SWAP.get(c.slice(0, 7).toLowerCase()) + c.slice(7);
  if (FULL_COL) return c;
  let v = COL.get(c);
  if (v !== undefined) return v;
  let r, g, b, a = null;
  const h = c.toLowerCase();
  if (h[0] === '#' && (h.length === 7 || h.length === 9)) {
    const base = h.slice(0, 7);
    if (PAL_OK.has(base)) v = c;
    else if (PAL_ALIAS[base] && PAL_OK.has(PAL_ALIAS[base])) v = PAL_ALIAS[base] + h.slice(7);
    else if (STATIC_HEX[base]) v = STATIC_HEX[base] + h.slice(7);
    else if (ELEM_OF.has(base) && G && G.dyes && G.dyes.he) v = c;
    else { const n = parseInt(base.slice(1), 16); r = n >> 16 & 255; g = n >> 8 & 255; b = n & 255; if (h.length === 9) a = parseInt(h.slice(7), 16) / 255; }
  } else {
    const m = h.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
    if (!m) v = c;
    else { r = +m[1]; g = +m[2]; b = +m[3]; if (m[4] != null) a = +m[4]; }
  }
  if (v === undefined) {
    const l = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
    if (h[0] === '#' && ELEM_OF.get(h.slice(0, 7)) === 'poison') {
      // Unstained toxic: grey with a faint green cast.
      const k = 0.28, m = x => Math.round(l + (x - l) * k);
      v = a == null ? `rgb(${m(r)},${m(g)},${m(b)})` : `rgba(${m(r)},${m(g)},${m(b)},${a})`;
    }
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
// Sequence marks on your swimmer keep their true colours, like a second fluorescent label.
let RAW_COL = false;
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
  Object.defineProperty(ctx, prop, { get() { return d.get.call(this); }, set(v) { d.set.call(this, RAW_COL ? v : WORLD_DF ? colDF(v) : col(v)); } });
}
// Your own effects (shots, trails, puddles, sparks) fade back when the screen gets busy, so enemies and
// their bullets stay readable. FX.dim is on only while those are drawn; FX.k is how faded they are.
const FX = { dim: false, k: 1 };
{ const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalAlpha');
  Object.defineProperty(ctx, 'globalAlpha', { get() { return d.get.call(this); }, set(v) { d.set.call(this, FX.dim ? v * FX.k : v); } }); }
function fxDim(on) { FX.dim = on; ctx.globalAlpha = 1; }
// How busy the screen is with your own stuff decides FX.k (and the Effects setting caps it).
function updateFxK(vis) {
  let n = 0;
  for (const pr of G.proj) if (!pr.mine && vis(pr)) n += pr.style === 'flame' ? 0.5 : 1;
  for (const z of G.zones) if (vis(z)) n += z.trail ? 0.35 : 0.8;
  n += G.parts.length * 0.1 + G.fx.length * 0.3;
  const auto = clamp(1 - (n - 30) / 170, 0.25, 1);
  const want = SET.fx === 'full' ? 1 : SET.fx === 'faded' ? Math.min(auto, 0.45) : auto;
  FX.k = lerp(FX.k, want, 0.08);
}
// Gradients made on the main canvas go through the same gate (so unstained colours stay grey, and in
// darkfield the greys invert).
for (const fn of ['createRadialGradient', 'createLinearGradient']) {
  const orig = ctx[fn].bind(ctx);
  ctx[fn] = (...a) => { const g = orig(...a), df = WORLD_DF, raw = RAW_COL, add = g.addColorStop.bind(g); g.addColorStop = (o, c) => add(o, raw ? c : df ? colDF(c) : col(c)); return g; };
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
  if (color[0] !== '#') { const m = color.match(/\d+/g); color = '#' + m.slice(0, 3).map(n => (+n).toString(16).padStart(2, '0')).join(''); }
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
  const l = 0.3 * r + 0.59 * g + 0.11 * b, hue = FULL_COL ? 1 : 0.28, dk = FULL_COL ? Math.min(1, (k != null ? k : 0.36) * 2.2) : k != null ? k : 0.36;
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
// The rim blur copies the finished frame back off the screen, which stalls a phone's GPU every frame, so
// Android skips it (the out-of-focus foreground layer stays).
const LENS_OK = !/Android/i.test(navigator.userAgent || '');
function drawLensBlur() {
  if (!DOF.on || !LENS_OK || QUAL.lv >= 1) return;
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
  if (!L || !DOF.on || QUAL.lv >= 1) return;
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
// Full Technicolour: a slowly turning rainbow laid over whatever is drawn so far with the 'color' blend
// (it takes its hue from the rainbow and its light and dark from what's underneath), so even the greys
// (tails, the slide, the grid, the terrain) come up in colour.
function technicolourWash(alpha) {
  const cx = W / 2, cy = H / 2, t = G.realT * 0.25;
  let g;
  if (ctx.createConicGradient) { g = ctx.createConicGradient(t, cx, cy); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`); }
  else { g = ctx.createLinearGradient(0, 0, W, H); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${(i * 60 + t * 57) % 360},100%,50%)`); }
  const op = ctx.globalCompositeOperation, a0 = ctx.globalAlpha;
  ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = alpha;
  ctx.fillStyle = g; ctx.fillRect(-40, -40, W + 80, H + 80);
  ctx.globalCompositeOperation = op; ctx.globalAlpha = a0;
}
function drawBackground() {
  if (!SPR.layers) buildLayers();
  if (SET.darkfield) { drawDarkfieldBackground(); return; }
  // Köhler illumination: an even field, a touch brighter in the middle of the frame.
  // (The two lowest quality steps: a flat fill and one depth layer instead of three, fewer full-screen passes.)
  const lite = QUAL.lv >= 3;
  let bg = '#a6a6a6';
  if (!lite) { bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6); bg.addColorStop(0, '#b6b6b6'); bg.addColorStop(0.6, '#a6a6a6'); bg.addColorStop(1, '#8c8c8c'); }
  ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
  for (const L of lite ? SPR.layers.slice(-1) : SPR.layers) {
    const T = L.T;
    const ox = -((((cam.x * S * L.f) % T) + T) % T), oy = -((((cam.y * S * L.f) % T) + T) % T);
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
  if (FULL_COL) technicolourWash(0.75);
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
  }
  // The specks of everything that died here go in one path (one fill, not four per mark).
  ctx.globalAlpha = 0.3; ctx.fillStyle = 'rgb(50,56,52)'; ctx.beginPath();
  for (const d of G.decals) {
    if (d.color === '#000' || d.life < 1 || !vis(d)) continue;
    const x = sx(d.x), y = sy(d.y), r = d.r * S;
    for (let i = 0; i < 4; i++) { const an = d.rot + i * 1.7, rr = r * (0.25 + (i % 2) * 0.3), cx = x + Math.cos(an) * rr, cy = y + Math.sin(an) * rr * 0.8, sr = 1.5 + (i % 3); ctx.moveTo(cx + sr, cy); ctx.arc(cx, cy, sr, 0, TAU); }
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- the egg
function drawCore() {
  // The oocyte, as it looks under phase contrast: a big granular sphere with a paler rim, a thick glassy
  // zona pellucida, a polar body in the gap, and the corona radiata (small dark cells packed radially
  // against the zona) fading out into the looser cumulus cloud.
  const c = G.core, x = sx(c.x), y = sy(c.y), r = c.r * S, t = G.realT;
  const egg = G.fertile, dmg = egg ? 0.45 : 0; // the zona opens for the last sperm standing
  // Built at a size step (about 12% apart) and scaled to fit, so zooming doesn't rebuild it every frame.
  const rq = Math.max(8, Math.round(Math.pow(1.12, Math.round(Math.log(Math.max(8, r)) / Math.log(1.12)))));
  if (!SPR.oocyte || SPR.oocyteR !== rq) buildOocyte(rq);
  const O = SPR.oocyte, sz = O.width / (DPR > 1 ? Math.min(2, DPR) : 1) * (r / rq);
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
// Viral trails (Incompatible Viral Load): the trail is a run of small zones dropped as you swim. Draw each run
// as one smooth ribbon that tapers and fades with age (in a few age bands, so overlaps never double up), with a
// dark core and virus specks drifting in it, instead of a row of stamped circles.
function drawTrails() {
  // Link each trail point to the open run (same weapon) whose end it continues; ghost trails interleave.
  const chains = [];
  for (const z of G.zones) {
    if (!z.trail) continue;
    let cur = null;
    for (let i = chains.length - 1; i >= 0 && i >= chains.length - 6; i--) { const C = chains[i], l = C[C.length - 1]; if (l.src.w === z.src.w && Math.abs(z.x - l.x) < 60 && Math.abs(z.y - l.y) < 60) { cur = C; break; } }
    if (!cur) { cur = []; chains.push(cur); }
    cur.push(z);
  }
  // One filled outline per run: a fill paints every pixel once, so where the trail crosses itself or bends
  // nothing doubles up (no blobs). Its fade is a single gradient from the oldest end to the newest.
  // #rrggbb plus an alpha byte: the fill filters (stains, darkfield) understand 8-digit hex.
  const rgba = (cs, a) => cs.slice(0, 7) + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  for (const C of chains) {
    if (C.length < 2) { const z = C[0], k = Math.max(0, z.life / z.max); ctx.globalAlpha = 0.3 * k; ctx.fillStyle = col(z.color); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S * (0.4 + 0.6 * k), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; continue; }
    const c = C[C.length - 1].color; // raw, like other zones (the darkfield view handles it)
    const pts = C.map(z => ({ x: sx(z.x), y: sy(z.y), r: z.r * S, k: Math.max(0, Math.min(1, z.life / z.max)) }));
    const n = pts.length, a0 = pts[0], a1 = pts[n - 1];
    const ribbon = wk => {
      const L = [], R = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
        let nx = -(b.y - a.y), ny = b.x - a.x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
        const h = pts[i].r * wk * (0.35 + 0.65 * pts[i].k);
        L.push({ x: pts[i].x + nx * h, y: pts[i].y + ny * h }); R.push({ x: pts[i].x - nx * h, y: pts[i].y - ny * h });
      }
      const side = P => { for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i].x, P[i].y, (P[i].x + P[i + 1].x) / 2, (P[i].y + P[i + 1].y) / 2); ctx.lineTo(P[P.length - 1].x, P[P.length - 1].y); };
      ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y); side(L);
      // Round the fresh end.
      const e = pts[n - 1], ang = Math.atan2(L[n - 1].y - e.y, L[n - 1].x - e.x);
      ctx.arc(e.x, e.y, Math.hypot(L[n - 1].x - e.x, L[n - 1].y - e.y), ang, ang + Math.PI, false);
      R.reverse(); side(R); ctx.closePath();
    };
    const grad = (lo, hi) => { const g = ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y); g.addColorStop(0, rgba(c, lo)); g.addColorStop(1, rgba(c, hi)); return g; };
    const kNew = a1.k;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    if (FX.k > 0.5) { ribbon(1.6); ctx.fillStyle = grad(0.04, 0.22 * kNew); ctx.fill(); }
    ribbon(1); ctx.fillStyle = grad(0.14, 0.6 * kNew); ctx.fill();
    // A thin dark core down the middle (one stroke, so it can't double up either).
    ctx.beginPath(); ctx.moveTo(a0.x, a0.y);
    for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
    ctx.lineTo(a1.x, a1.y);
    const cg = ctx.createLinearGradient(a0.x, a0.y, a1.x, a1.y); cg.addColorStop(0, 'rgba(6,20,11,0)'); cg.addColorStop(1, rgba('#06140b', 0.5 * kNew));
    ctx.strokeStyle = cg; ctx.lineWidth = Math.max(1, a1.r * 0.16); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    // Virus specks drifting in the smear.
    if (FX.k > 0.6) {
      ctx.fillStyle = c;
      for (let j = 0; j < n; j += 2) {
        const q = pts[j], a = G.realT * 1.7 + j * 2.3, d = q.r * 0.5 * Math.sin(G.realT * 1.1 + j);
        ctx.globalAlpha = 0.6 * q.k; ctx.beginPath(); ctx.arc(q.x + Math.cos(a) * d, q.y + Math.sin(a) * d, Math.max(1, q.r * 0.12), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

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
  const P = G.passives, key = Object.entries(P).join() + '|' + G.level;
  if (G.lookKey === key && G.look) return G.look;
  const n = id => Math.min(5, P[id] || 0);
  let elem = null, best = 0;
  for (const id in ELEM_PASSIVE) if ((P[id] || 0) > best) { best = P[id]; elem = ELEM_PASSIVE[id]; }
  G.lookKey = key;
  G.look = {
    tails: 1 + Math.min(3, P.multishot || 0),
    head: 1 + 0.07 * n('vital') + 0.04 * n('armour'),
    stretch: 1 + 0.05 * (n('speed') + n('hydro')),
    tailLen: 1, // the flagellum no longer grows
    beat: 1 + 0.12 * (n('haste') + n('reload')),
    levelTail: 1, tailN: TAIL_BASE,
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
  if (body && body.tailCut) {
    // Snipped: a ragged stub where the flagellum was.
    ctx.globalAlpha = alpha * 0.9; ctx.strokeStyle = 'rgb(46,52,48)'; ctx.lineWidth = 1.4 * k; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - Math.cos(face) * 10 * k, y - Math.sin(face) * 10 * k); ctx.lineTo(x - Math.cos(face) * 15 * k + Math.sin(G.realT * 30 + (body.id || 0)) * k, y - Math.sin(face) * 15 * k); ctx.stroke();
  } else if (body) {
    const back = 10.5 * sc * L.head * L.stretch, wx = body.x - Math.cos(face) * back, wy = body.y - Math.sin(face) * back;
    const v = body.tailV != null ? body.tailV : Math.hypot(body.vx || 0, body.vy || 0), len = 78 * sc * L.tailLen * (L.levelTail || 1);
    stepTail(body, wx, wy, face, len, v, L.beat, L.tailN);
    const tails = [body.tailDraw];
    if (L.tails > 1) {
      // Extra flagella sprout from either side of the neck and beat out of phase.
      body.xt = body.xt || [];
      const nx = -Math.sin(face), ny = Math.cos(face);
      for (let j = 1; j < L.tails; j++) {
        const sub = body.xt[j - 1] || (body.xt[j - 1] = { beat: j * 2.1 });
        const off = (j % 2 ? 1 : -1) * Math.ceil(j / 2) * 3.4 * sc * L.head;
        stepTail(sub, wx + nx * off, wy + ny * off, face + (j % 2 ? 0.3 : -0.3) * Math.ceil(j / 2), len * (0.9 - 0.05 * j), v, L.beat * (1 + 0.07 * j));
        tails.push(sub.tailDraw);
      }
    }
    // The tail grows out of the midpiece: same width at the neck, then the thin principal piece.
    const hk = k * L.head;
    ctx.globalAlpha = alpha * 0.45; for (const t of tails) drawTail(t, '#ffffff', 2.8 * k, 3.6 * hk);
    ctx.globalAlpha = alpha * 0.9; for (const t of tails) drawTail(t, 'rgb(46,52,48)', 1.1 * k, 2 * hk);
  }
  ctx.globalAlpha = alpha;
  // The head rocks from side to side with each stroke of the tail (real sperm heads do), less when the wag
  // dies down in a turn: it reads as swimming rather than gliding on rails.
  // While turning at all, the head holds steady (eases out fast, back in gently once straight).
  if (body && body.tail) {
    const now = G.realT, dtr = Math.min(0.05, Math.max(0, now - (body.yawT ?? now))); body.yawT = now;
    let df = face - (body.yawF ?? face); while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; body.yawF = face;
    const turning = dtr > 0 && Math.abs(df / dtr) > 0.3, k = body.yawK ?? 1;
    body.yawK = turning ? lerp(k, 0, Math.min(1, dtr * 15)) : lerp(k, 1, Math.min(1, dtr * 4));
  }
  const yaw = body && body.tail ? Math.sin((body.beat || 0) + 0.6) * 0.14 * Math.min(1.4, body.turnK ?? 1) * (body.yawK ?? 1) : 0;
  if (body) body.yaw = yaw;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face + yaw);
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
  ctx.fillStyle = body && body.def && fastDyed(body) ? DYE_FAST_DK : MIC.body; ctx.fill(); // Motility Dye
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
// A krill in phase contrast: a translucent, curled, segmented body with a tail fan, a big dark compound
// eye, long twitching antennae and swimmerets that paddle on every kick.
function drawKrill(e, x, y, r, face) {
  const fl = e.flick || 0, t = G.realT * 20 + e.id;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  if (Math.cos(face) < 0) ctx.scale(1, -1); // keep its back up
  ctx.lineCap = 'round';
  // Antennae.
  ctx.strokeStyle = 'rgba(40,46,42,0.75)'; ctx.lineWidth = Math.max(0.6, r * 0.07);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(r * 0.95, -r * 0.2);
    ctx.quadraticCurveTo(r * 2, -r * (0.5 + 0.25 * s) + Math.sin(t * 0.4 + s) * r * 0.2, r * 2.8, -r * (0.2 + 0.6 * s * 0.5) + Math.sin(t * 0.3 + s) * r * 0.35);
    ctx.stroke();
  }
  // Swimmerets under the abdomen, paddling with each kick.
  ctx.lineWidth = Math.max(0.6, r * 0.09);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) { const bx = r * (0.4 - i * 0.38), by = r * (0.35 + i * 0.05), a = 1.9 + Math.sin(t * 0.8 - i * 0.7) * (0.3 + fl * 0.6); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * r * 0.55, by + Math.sin(a) * r * 0.55); }
  ctx.stroke();
  // Body: overlapping segments along a gentle curl, then the tail fan.
  const body = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#c9e4f5' : eTone(e, 0.3);
  const curl = 0.35 + 0.25 * (1 - fl);
  for (let i = 5; i >= 0; i--) {
    const u = i / 5, bx = r * (0.7 - u * 2.1), by = r * curl * u * u * 1.4, rr = r * (0.55 - u * 0.22);
    ctx.beginPath(); ctx.ellipse(bx, by, rr * 1.15, rr, u * curl * 1.4, 0, TAU);
    ctx.fillStyle = body; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(0.6, r * 0.08); ctx.stroke();
  }
  const tx = r * -1.55, ty = r * curl * 1.45;
  ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(tx + r * 0.2, ty); ctx.lineTo(tx - r * 0.5, ty - r * 0.35); ctx.lineTo(tx - r * 0.55, ty + r * 0.4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
  // Gut line and the big compound eye.
  ctx.strokeStyle = 'rgba(40,46,42,0.45)'; ctx.lineWidth = Math.max(0.5, r * 0.06);
  ctx.beginPath(); ctx.moveTo(r * 0.5, 0); ctx.quadraticCurveTo(-r * 0.5, r * curl * 0.5, tx, ty); ctx.stroke();
  ctx.fillStyle = '#0c0f0e'; ctx.beginPath(); ctx.arc(r * 0.8, -r * 0.15, r * 0.28, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(r * 0.86, -r * 0.24, r * 0.08, 0, TAU); ctx.fill();
  ctx.restore(); ctx.lineCap = 'butt';
}

// ---------------------------------------------------------------- more pond life
// Each drawn in the same phase-contrast style: grey body darker than the fluid, a bright halo, dark detail.
// Motility Dye: fast swimmers take up the stain, so their whole body turns cyan.
function fastDyed(e) { return !!(G.dyes && G.dyes.motility && e.def.speed >= 95 && !e.rival && !e.boss && !e.charmed); }
function eTone(e, k) { return fastDyed(e) ? DYE_FAST_DK : pcTone(e.color, k); }
function mBody(e, k) { return e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#c9e4f5' : eTone(e, k || 0.42); }
function mHalo(w) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = Math.max(1, w); ctx.stroke(); }
const MICROBES = {
  // Candida: oval budding cells, joined to their parent by a pseudohypha; buds swell as they grow.
  yeast(e, x, y, r) {
    const pa = e.parent;
    if (pa && !pa.dead && Math.hypot(pa.x - e.x, pa.y - e.y) < 90) {
      ctx.strokeStyle = 'rgba(60,66,62,0.55)'; ctx.lineWidth = Math.max(1.5, r * 0.35); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx(pa.x), sy(pa.y)); ctx.stroke(); ctx.lineCap = 'butt';
    }
    const a = e.id * 1.7;
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.12, r * 0.86, a, 0, TAU); ctx.fillStyle = mBody(e, 0.4); ctx.fill(); mHalo(r * 0.14);
    ctx.fillStyle = 'rgba(230,236,232,0.55)'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(30,36,32,0.45)'; ctx.beginPath(); ctx.arc(x - Math.cos(a) * r * 0.5, y - Math.sin(a) * r * 0.5, r * 0.12, 0, TAU); ctx.fill();
  },
  // Pinworm: a long, tapering, ringed body that follows its head through every turn.
  worm(e, x, y, r, face) {
    stepTail(e, e.x - Math.cos(face) * e.r * 0.6, e.y - Math.sin(face) * e.r * 0.6, face, e.r * 7, Math.hypot(e.vx || 0, e.vy || 0) + 40);
    const t = e.tail, n = t.length;
    for (let i = n - 1; i >= 0; i--) {
      const rr = r * (0.95 - i / n * 0.6);
      ctx.beginPath(); ctx.arc(sx(t[i].x), sy(t[i].y), rr, 0, TAU); ctx.fillStyle = mBody(e); ctx.fill(); mHalo(rr * 0.12);
    }
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = mBody(e, 0.36); ctx.fill(); mHalo(r * 0.14);
    ctx.fillStyle = 'rgba(20,24,22,0.7)'; ctx.beginPath(); ctx.arc(x + Math.cos(face) * r * 0.55, y + Math.sin(face) * r * 0.55, r * 0.22, 0, TAU); ctx.fill();
  },
  // Diatom: a glass pillbox shell with radial ribs and a central pore, turning slowly.
  diatom(e, x, y, r) {
    const rot = e.age * 0.4;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = mBody(e, 0.55); ctx.fill(); mHalo(r * 0.16);
    ctx.strokeStyle = 'rgba(30,36,32,0.5)'; ctx.lineWidth = Math.max(0.7, r * 0.05); ctx.beginPath();
    for (let i = 0; i < 18; i++) { const a = rot + i / 18 * TAU; ctx.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3); ctx.lineTo(x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92); }
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
    ctx.fillStyle = 'rgba(20,24,22,0.6)'; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, TAU); ctx.fill();
  },
  // Water bear: a plump, segmented tardigrade on eight stubby clawed legs. Curls into a round 'tun' when hurt.
  tardigrade(e, x, y, r, face) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(face);
    if (e.tunT > G.t) {
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.8, r * 0.72, 0, 0, TAU); ctx.fillStyle = mBody(e, 0.3); ctx.fill(); mHalo(r * 0.14);
      ctx.strokeStyle = 'rgba(30,36,32,0.5)'; ctx.lineWidth = r * 0.06;
      for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(i * r * 0.14, 0, r * 0.1, r * 0.66, 0, 0, TAU); ctx.stroke(); }
      ctx.restore(); return;
    }
    const step = Math.sin(e.age * 6);
    ctx.strokeStyle = 'rgba(40,46,42,0.85)'; ctx.lineWidth = Math.max(1.2, r * 0.16); ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
      const lx = r * (0.6 - i * 0.42), sw = (i % 2 ? step : -step) * r * 0.12;
      ctx.beginPath(); ctx.moveTo(lx, s * r * 0.45); ctx.lineTo(lx + sw, s * r * 0.82); ctx.stroke();
    }
    ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r * 0.62, 0, 0, TAU); ctx.fillStyle = mBody(e, 0.4); ctx.fill(); mHalo(r * 0.12);
    ctx.strokeStyle = 'rgba(30,36,32,0.35)'; ctx.lineWidth = r * 0.05;
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.3, -r * 0.55); ctx.quadraticCurveTo(i * r * 0.3 + r * 0.08, 0, i * r * 0.3, r * 0.55); ctx.stroke(); }
    ctx.fillStyle = 'rgba(20,24,22,0.75)'; ctx.beginPath(); ctx.arc(r * 0.95, 0, r * 0.12, 0, TAU); ctx.fill();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(r * 0.72, s * r * 0.2, r * 0.07, 0, TAU); ctx.fill(); }
    ctx.restore();
  },
  // Paramecium: a slipper-shaped ciliate with an oral groove and a beating fringe of cilia.
  slipper(e, x, y, r) {
    const a = e.hd != null ? e.hd : 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.strokeStyle = 'rgba(40,46,42,0.55)'; ctx.lineWidth = Math.max(0.6, r * 0.05); ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const u = i / 26 * TAU, px = Math.cos(u) * r * 1.35, py = Math.sin(u) * r * 0.62, w = Math.sin(e.age * 18 - i * 0.9) * 0.4;
      ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(u + w) * r * 0.28, py + Math.sin(u + w) * r * 0.28);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.35, r * 0.62, 0, 0, TAU); ctx.fillStyle = mBody(e, 0.46); ctx.fill(); mHalo(r * 0.12);
    ctx.strokeStyle = 'rgba(30,36,32,0.5)'; ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.moveTo(r * 0.9, -r * 0.1); ctx.quadraticCurveTo(r * 0.1, r * 0.35, -r * 0.1, r * 0.05); ctx.stroke();
    ctx.fillStyle = 'rgba(40,46,42,0.4)'; ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.05, r * 0.35, r * 0.22, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(230,236,232,0.7)';
    for (const px of [-r * 0.85, r * 0.55]) { const cv = r * (0.1 + 0.07 * Math.sin(e.age * 3 + px)); ctx.beginPath(); ctx.arc(px, 0, cv, 0, TAU); ctx.fill(); }
    ctx.restore();
  },
  // Rotifer: a trumpet-shaped body with two spinning ciliary wheels at the head, and a forked foot.
  rotifer(e, x, y, r, face) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(face);
    ctx.beginPath(); ctx.moveTo(r * 0.7, -r * 0.7); ctx.quadraticCurveTo(-r * 0.2, -r * 0.55, -r * 1.2, -r * 0.12); ctx.lineTo(-r * 1.6, -r * 0.28); ctx.lineTo(-r * 1.45, 0);
    ctx.lineTo(-r * 1.6, r * 0.28); ctx.lineTo(-r * 1.2, r * 0.12); ctx.quadraticCurveTo(-r * 0.2, r * 0.55, r * 0.7, r * 0.7); ctx.closePath();
    ctx.fillStyle = mBody(e, 0.44); ctx.fill(); mHalo(r * 0.12);
    const spin = e.age * 14;
    for (const s of [-1, 1]) {
      const cx = r * 0.78, cy = s * r * 0.45;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.36, 0, TAU); ctx.fillStyle = 'rgba(210,216,212,0.35)'; ctx.fill();
      ctx.strokeStyle = 'rgba(40,46,42,0.6)'; ctx.lineWidth = Math.max(0.6, r * 0.05); ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = spin * s + i / 10 * TAU; ctx.moveTo(cx + Math.cos(a) * r * 0.3, cy + Math.sin(a) * r * 0.3); ctx.lineTo(cx + Math.cos(a + 0.5 * s) * r * 0.5, cy + Math.sin(a + 0.5 * s) * r * 0.5); }
      ctx.stroke();
    }
    // Whatever XP it has swallowed glints inside it.
    if (e.stolen > 0) { ctx.fillStyle = PAL.reward; for (let i = 0; i < Math.min(6, 1 + e.stolen / 8); i++) { ctx.beginPath(); ctx.arc(-r * 0.3 + (i % 3) * r * 0.2, (i < 3 ? -1 : 1) * r * 0.12, r * 0.07, 0, TAU); ctx.fill(); } }
    ctx.restore();
  },
  // Volvox: a hollow ball colony of hundreds of cells, rolling, with daughter colonies inside.
  volvox(e, x, y, r) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = mBody(e, 0.6); ctx.fill(); mHalo(r * 0.1);
    const roll = e.age * 0.8, m = Math.min(40, Math.floor(r * 1.2)), n = Math.min(50, Math.floor(r * 1.4)), dot = Math.max(0.8, r * 0.045);
    // Cells round the rim (seen edge-on, so they crowd together), then the near face, sparser.
    ctx.fillStyle = 'rgba(40,46,42,0.6)';
    for (let i = 0; i < m; i++) { const a = roll * 0.3 + i / m * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86, dot, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(40,46,42,0.3)';
    for (let i = 0; i < n; i++) { const a = i * 2.39996 + roll * 0.3, d = r * 0.8 * Math.sqrt((i + 0.5) / n); ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, dot * 0.8, 0, TAU); ctx.fill(); }
    if (e.def.split) for (let i = 0; i < 3; i++) {
      const a = roll * 0.5 + i * 2.1, cx = x + Math.cos(a) * r * 0.35, cy = y + Math.sin(a) * r * 0.35;
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.2, 0, TAU); ctx.fillStyle = 'rgba(60,68,62,0.45)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.stroke();
    }
  },
};

// ---------------------------------------------------------------- flagellum physics
// A tail is a chain of points in world space. The root is pinned behind the head and beats side to side;
// every other link is dragged along by the one in front (so turns sweep the tail round behind you and
// swimming leaves a travelling wave), with a little stiffness pulling it straight when you stop.
const TAIL_BASE = 11;
// The flagellum. o.tail is its spine: anchored to the end of the midpiece and dragged through the water, so it
// curves when the swimmer turns. o.tailDraw is what you see: the spine plus a travelling wave whose amplitude
// grows from nothing at the root (so the tail always leaves the body cleanly) to its widest near the tip.
function stepTail(o, rx, ry, face, len, speed, beatMul, nSeg) {
  const TAIL_N = nSeg || TAIL_BASE;
  const now = G.realT, dt = Math.min(0.05, Math.max(0, now - (o.tailT || now)));
  o.tailT = now;
  const seg = len / (TAIL_N - 1);
  if (!o.tail || o.tail.length !== TAIL_N || Math.hypot(o.tail[0].x - rx, o.tail[0].y - ry) > len * 3) {
    o.tail = [];
    for (let i = 0; i < TAIL_N; i++) { const x = rx - Math.cos(face) * seg * i, y = ry - Math.sin(face) * seg * i; o.tail.push({ x, y, px: x, py: y }); }
  }
  // Turning (anything more than a slight curve)? The wag eases to a stop over a few frames while the tail
  // swings round. The moment the turn ends it leaps back to life, with a burst of extra
  // vigour (kick) that settles back to the normal beat. turnK: 1 = straight, 0.04 mid-turn.
  if (o.stroke != null) { o.turnK = o.stroke; } // the player: the swim physics drives the stroke (game.js updatePlayer)
  else if (dt > 0) {
    let df = face - (o.lastFace ?? face); while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU;
    const rate = Math.abs(df / dt), want = rate < 0.35 ? 1 : Math.max(0.04, 1 - (rate - 0.35) / 0.9), cur = o.turnK ?? 1;
    if (want < cur) o.turnK = lerp(cur, want, 1 - Math.exp(-dt * 25)); // easing into the stop (about 4 frames)
    else {
      if (o.turned && want > 0.9) { o.kick = 1; o.turned = false; } // the turn is over: back to life
      o.turnK = lerp(cur, want, Math.min(1, dt * 12));
    }
    if (o.turnK < 0.45) o.turned = true;
    o.kick = (o.kick || 0) * Math.pow(0.5, dt / 0.22);
  }
  o.lastFace = face;
  const kick = o.kick || 0, tk = (o.turnK ?? 1) * (1 + 0.9 * kick); // (the first strokes are big and exaggerated)
  o.beat = (o.beat || Math.random() * 10) + dt * (24 + Math.min(28, speed / 5)) * 0.78 * (beatMul || 1) * (0.08 + 0.92 * Math.min(1, o.turnK ?? 1)) * (1 + 0.6 * kick); // a strong, deliberate beat (nearly still mid-turn, quick just after)
  const t = o.tail;
  // The tail as a springy rubber rod. phi: how far it's swung off straight-back (radians), om: how fast it's
  // swinging. When the body turns, the tail stays where it was in the water (phi grows), then springs round
  // quickly, with a little overshoot, to trail straight behind again. It bends in a clean arc, more towards
  // the tip, and its bend is capped (the tip stays at least a third of the tail's length from the head).
  if (o.phi == null) { o.phi = 0; o.om = 0; o.f0 = face; }
  { let df = face - o.f0; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; o.f0 = face;
    o.phi -= df;
    // A sharp or long turn loads the tail up: the longer you keep turning one way, the deeper it bends.
    if (dt > 0 && Math.abs(df / dt) > 0.6 && Math.sign(df) === (o.ldir || Math.sign(df))) o.load = (o.load || 0) + Math.abs(df);
    else if (dt > 0) o.load = (o.load || 0) * Math.pow(0.5, dt / 0.15);
    if (df) o.ldir = Math.sign(df);
    const ld = Math.min(1, (o.load || 0) / 2.5), w0 = 10.5 / (1 + 1.1 * ld), z = 0.45; // (springiness: about a third of a second to swing back, softer when loaded; z: a little overshoot)
    if (dt > 0) { o.om += (-w0 * w0 * o.phi - 2 * z * w0 * o.om) * dt; o.phi += o.om * dt; }
    const lim = 2.3; if (Math.abs(o.phi) > lim) { o.phi = Math.sign(o.phi) * lim; if (o.om * o.phi > 0) o.om = 0; } }
  const back = face + Math.PI, bend = clamp(o.phi * (1.7 + 1.3 * Math.min(1, (o.load || 0) / 2.5)), -3.8, 3.8); // (the visible bend: twice the swing, up to 3.6x in a long, sharp turn)
  t[0].x = rx; t[0].y = ry;
  for (let i = 1; i < TAIL_N; i++) {
    const f = (i - 0.5) / (TAIL_N - 1), d = back + bend * Math.pow(f, 1.15); // (bends along its whole length, from just behind the head)
    t[i].x = t[i - 1].x + Math.cos(d) * seg; t[i].y = t[i - 1].y + Math.sin(d) * seg;
  }
  // How stretched out it is (1 = straight), and whether it's behind you (1 when the tip trails straight back,
  // 0 when it's off to the side). The swim physics reads both: a swung-out tail can't push you forward.
  o.ext = Math.hypot(t[TAIL_N - 1].x - t[0].x, t[TAIL_N - 1].y - t[0].y) / len;
  { const bx = t[0].x - t[TAIL_N - 1].x, by = t[0].y - t[TAIL_N - 1].y, bl = Math.hypot(bx, by) || 1; o.behind = clamp(((bx * Math.cos(face) + by * Math.sin(face)) / bl - 0.55) / 0.4, 0, 1); }
  // The visible wave, perpendicular to the spine.
  const amp = Math.min(len * 0.15, 38) * (0.75 + 0.25 * Math.min(1, speed / 150)) * tk; // big, sweeping strokes (quiet while turning)
  const D = o.tailDraw && o.tailDraw.length === TAIL_N ? o.tailDraw : (o.tailDraw = t.map(q => ({ x: q.x, y: q.y })));
  for (let i = 0; i < TAIL_N; i++) {
    const a = t[Math.max(0, i - 1)], c = t[Math.min(TAIL_N - 1, i + 1)], f = i / (TAIL_N - 1);
    let nx = -(c.y - a.y), ny = c.x - a.x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const w = Math.sin(o.beat - f * 4.8) * amp * Math.pow(f, 0.6); // (a longer wave: fewer, fuller bends; it starts right behind the head, not halfway down)
    D[i].x = t[i].x + nx * w; D[i].y = t[i].y + ny * w;
  }
}
// A smooth, filled ribbon along the tail: rootWidth at the neck (matching the midpiece), easing quickly to the
// tail's own width and tapering to a hair at the tip.
function drawTail(t, color, width, rootWidth) {
  const n = t.length;
  if (n < 2) return;
  const r0 = (rootWidth || width) / 2, r1 = width / 2;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = t[Math.max(0, i - 1)], c = t[Math.min(n - 1, i + 1)], f = i / (n - 1);
    let nx = -(c.y - a.y), ny = c.x - a.x; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const h = Math.max(0.35, (f < 0.12 ? lerp(r0, r1, f / 0.12) : r1 * (1 - 0.7 * (f - 0.12) / 0.88)));
    const x = sx(t[i].x), y = sy(t[i].y);
    L.push({ x: x + nx * h, y: y + ny * h }); R.push({ x: x - nx * h, y: y - ny * h });
  }
  const side = P => { for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i].x, P[i].y, (P[i].x + P[i + 1].x) / 2, (P[i].y + P[i + 1].y) / 2); ctx.lineTo(P[P.length - 1].x, P[P.length - 1].y); };
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(L[0].x, L[0].y); side(L);
  R.reverse(); ctx.lineTo(R[0].x, R[0].y); side(R);
  ctx.closePath(); ctx.fill();
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
  if (!G) { drawTitleLab(); return; }
  const rewinding = G.state === 'rewind';
  const shk = SET.shake === false ? 0 : cam.shake; // (Settings > Screen shake)
  const shx = shk ? rand(-shk, shk) : 0, shy = shk ? rand(-shk, shk) : 0;
  ctx.save();
  ctx.translate(shx, shy);
  WORLD_DF = !!SET.darkfield;
  drawBackground();
  const p = G.player;
  const vx0 = cam.x - W / 2 / S - 90, vx1 = cam.x + W / 2 / S + 90, vy0 = cam.y - H / 2 / S - 90, vy1 = cam.y + H / 2 / S + 90;
  const vis = o => o.x > vx0 && o.x < vx1 && o.y > vy0 && o.y < vy1;

  drawDecals(vis);
  drawTerrain();
  if (G.wave) drawDish();
  drawPill();
  drawAmbient(vis);
  // Dynamic lights pooling on the floor.
  ctx.globalCompositeOperation = 'lighter';
  for (const l of G.lights) if (vis(l)) glow(sx(l.x), sy(l.y), l.r * S, l.color, 0.35 * (l.life / l.max));
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  updateFxK(vis);
  // Zones (yours: faded when busy).
  fxDim(true);
  drawTrails();
  for (const z of G.zones) {
    if (z.trail || !vis(z)) continue;
    const a = Math.min(1, z.life / 0.4);
    const x = sx(z.x), y = sy(z.y), r = z.r * S;
    if (z.pull || (z.src && emits(z.src.elem))) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.1, z.color, 0.35 * a); ctx.globalCompositeOperation = 'source-over'; }
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = z.color; ctx.lineWidth = 2;
    if (z.pull) {
      for (let k = 0; k < 4; k++) { const rr = ((G.realT * 0.9 + k / 4) % 1) * z.r; ctx.beginPath(); ctx.arc(x, y, (z.r - rr) * S, 0, TAU); ctx.stroke(); }
      // Spiral arms winding into the middle.
      ctx.lineWidth = 2.5; ctx.globalAlpha = a * 0.7;
      for (let arm = 0; arm < 3; arm++) { ctx.beginPath(); for (let i = 0; i <= 14; i++) { const t = i / 14, ang = -G.realT * 3 + arm * TAU / 3 + t * 4.2, rr = r * (1 - t * 0.85); i ? ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr) : ctx.moveTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } ctx.stroke(); }
      ctx.lineWidth = 2; ctx.globalAlpha = a * 0.6;
      ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x, y, 14 * S, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#e0aaff'; ctx.beginPath(); ctx.arc(x, y, 15 * S, 0, TAU); ctx.stroke();
    } else {
      // Gas clouds (Dutch Oven) roll in soft puffs.
      if (z.spell === 'cloud' && FX.k > 0.5) { ctx.fillStyle = z.color; for (let k = 0; k < 6; k++) { const an = G.realT * 0.5 + k * 1.05, rr = r * 0.55; ctx.globalAlpha = a * 0.12; ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an * 1.3) * rr * 0.7, r * 0.45, 0, TAU); ctx.fill(); } ctx.globalAlpha = a * 0.6; }
      // Bubbling pool (just the rim when the screen is busy).
      if (FX.k > 0.75) for (let k = 0; k < 5; k++) { const an = G.realT * 0.7 + k * 1.3, rr = r * (0.2 + ((k * 0.37 + G.realT * 0.3) % 0.7)); ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr, 3 + k % 3, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    }
  }
  fxDim(false);
  drawHazards(vis);

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
  }
  // XP granules: dark diamonds with a crisp edge and a glint, so they stand out on the pale slide.
  // Batched by size (one fill per colour, one outline, one glint) rather than three draws per granule.
  // (Nearby granules merge into bigger ones (gemMerge, game.js): four sizes, so the slide stays readable.)
  const GEM_TIERS = [[100, 9, '#6a1f7a'], [20, 7, '#7a5a00'], [5, 5.5, '#14594a'], [0, 4, '#0f3d55']];
  const gemOf = g => (g.v >= 100 ? 0 : g.v >= 20 ? 1 : g.v >= 5 ? 2 : 3);
  const diamond = (x, y, r) => { ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r * 1.3); ctx.lineTo(x - r, y); ctx.closePath(); };
  const gemVis = G.gems.filter(g => g.kind !== 's' && vis(g));
  ctx.strokeStyle = 'rgb(12,14,16)'; ctx.lineWidth = 1;
  for (let ti = 0; ti < GEM_TIERS.length; ti++) {
    const r = GEM_TIERS[ti][1] * S; let any = false;
    ctx.beginPath();
    for (const g of gemVis) if (gemOf(g) === ti) { diamond(sx(g.x), sy(g.y), r); any = true; }
    if (any) { ctx.fillStyle = GEM_TIERS[ti][2]; ctx.fill(); ctx.stroke(); }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath();
  for (const g of gemVis) { const r = GEM_TIERS[gemOf(g)][1] * S, x = sx(g.x), y = sy(g.y); ctx.moveTo(x, y - r * 1.3); ctx.lineTo(x + r * 0.5, y - r * 0.2); ctx.lineTo(x, y); ctx.closePath(); }
  ctx.fill();
  // Pickups: temporary power-ups are monitor magenta; DNA strands (loot) are gold.
  for (const u of G.pickups) {
    if (!vis(u)) continue;
    const d = POWERUPS[u.type], x = sx(u.x), y = sy(u.y) + Math.sin(u.bob) * 3, r = 13 * S, pc = u.type === 'chest' ? PAL.reward : PAL.pickup;
    if (u.life < 5 && Math.floor(u.life * 6) % 2) continue;
    if (u.type === 'chest') {
      // A strand of DNA: a short spinning double helix, gold.
      const ph = G.realT * 4 + u.bob, len = r * 1.6;
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.6);
      ctx.strokeStyle = 'rgba(214,228,240,0.7)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let i = -3; i <= 3; i++) { const px = i * len / 3.5, a = Math.sin(ph + i * 0.9) * r * 0.55; ctx.moveTo(px, a); ctx.lineTo(px, -a); }
      ctx.stroke();
      ctx.strokeStyle = pc; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (const sg of [1, -1]) { ctx.beginPath(); for (let i = 0; i <= 24; i++) { const px = -len + i / 24 * len * 2, a = sg * Math.sin(ph + (px / (len / 3.5)) * 0.9) * r * 0.55; i ? ctx.lineTo(px, a) : ctx.moveTo(px, a); } ctx.stroke(); }
      ctx.restore(); ctx.lineCap = 'butt';
      continue;
    }
    // Power-ups are bright and always in colour (enemy bullets are dark specks, so the two never mix up):
    // each kind has its own colour: a glowing halo that pulses, a pale turning hexagon, and the letter.
    RAW_COL = true;
    const pu = 0.5 + 0.5 * Math.sin(G.realT * 5 + u.bob), puc = puColour(u.type);
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * (2 + 0.4 * pu), puc, 0.55); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.strokeStyle = puc; ctx.globalAlpha = 0.35 + 0.4 * (1 - pu); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * (1.35 + 0.35 * pu), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    drawShape('hex', x, y, r, G.realT * 0.8 + u.bob); ctx.fillStyle = '#fbf8ff'; ctx.fill();
    ctx.strokeStyle = puc; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = puColour(u.type, true); ctx.font = `900 ${Math.round(14 * S)}px ` + "ui-monospace, Menlo, monospace"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(d.letter, x, y + 1);
    RAW_COL = false;
  }
  // Mines & lob shadows.
  for (const pr of G.proj) {
    if (pr.mine) {
      const x = sx(pr.x), y = sy(pr.y);
      ctx.fillStyle = '#1a1a22'; ctx.beginPath(); ctx.arc(x, y, (pr.nuke ? 11 : 7) * S, 0, TAU); ctx.fill();
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

  // Your shots go under the enemies (enemies and their bullets must stay readable), faded when busy.
  fxDim(true);
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
    // A motion streak behind anything fast (thins out when the screen is busy).
    if (FX.k > 0.4 && pr.style !== 'flame' && pr.style !== 'void' && pr.style !== 'glaive' && pr.style !== 'disc' && pr.style !== 'needle' && pr.style !== 'helix' && !pr.orbitT) {
      const L = Math.min(70, Math.hypot(pr.vx, pr.vy) * 0.05) * S;
      ctx.globalAlpha = 0.45; ctx.strokeStyle = pr.color; ctx.lineWidth = Math.max(1, r * 1.3); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(a) * L, y - Math.sin(a) * L); ctx.stroke(); ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
    }
    if (hot && pr.style !== 'flame') glow(x, y, Math.max(8, r * 3.2), pr.color, 0.55);
    else if (!hot) { ctx.fillStyle = 'rgba(20,20,20,0.8)'; ctx.beginPath(); ctx.arc(x, y, r + 1.5, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = pr.color; ctx.strokeStyle = pr.color;
    switch (pr.style) {
      case 'flame': {
        const k = 1 - pr.life / pr.max;
        glow(x, y, r * (1.4 + k * 2.6) * (0.55 + 0.45 * FX.k), k < 0.35 && pr.src.elem === 'fire' ? '#ffd166' : pr.color, 0.75 * (1 - k));
        ctx.globalAlpha = 1;
        break;
      }
      case 'helix': drawHelix(pr, x, y, r); break;
      case 'rail': ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 60 * S, y - Math.sin(a) * 60 * S); ctx.lineTo(x, y); ctx.stroke(); break;
      case 'bolt': case 'needle': case 'shard':
        ctx.lineWidth = (pr.style === 'shard' ? 4 : 2.5) * S; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 3.5, y - Math.sin(a) * r * 3.5); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); break;
      case 'glaive': case 'disc':
        ctx.save(); ctx.translate(x, y); ctx.rotate(G.realT * 18);
        drawShape(pr.style === 'glaive' ? 'star' : 'hex', 0, 0, r, 0); ctx.fill(); ctx.restore(); break;
      case 'void': {
        // Every merge makes it more unstable: the glow flickers and swells, the core shudders, arcs crackle off
        // it, and near supernova mass it is white-hot, cracked open and visibly about to burst.
        const v = clamp(((pr.mass || 1) - 1) / (VOID_MERGE.supernova - 1), 0, 1), t = G.realT + (pr.seed || (pr.seed = Math.random() * 10));
        const flick = 1 + (Math.random() - 0.5) * 0.5 * v, swell = 1 + Math.sin(t * (3 + 18 * v)) * 0.1 * v;
        glow(x, y, pr.aura * S * swell, pr.color, Math.min(0.9, (0.35 + 0.3 * v) * flick)); ctx.globalAlpha = 1;
        const jx = v > 0.2 ? (Math.random() - 0.5) * r * 0.25 * v : 0, jy = v > 0.2 ? (Math.random() - 0.5) * r * 0.25 * v : 0, cx = x + jx, cy = y + jy;
        // Accretion arcs, spinning faster with mass.
        if (v > 0) {
          ctx.strokeStyle = pr.color; ctx.lineWidth = Math.max(1, r * 0.12);
          for (let i = 0; i < 3; i++) { const a0 = t * (2 + 9 * v) + i * TAU / 3; ctx.globalAlpha = 0.4 + 0.5 * v; ctx.beginPath(); ctx.arc(cx, cy, r * (1.35 + 0.15 * i), a0, a0 + 0.9 + v); ctx.stroke(); }
          // Crackling arcs leaping off it: more of them, more often, as it fills up.
          const nArc = Math.floor(v * 7);
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
          for (let k = 0; k < nArc; k++) {
            if (Math.random() > 0.35 + 0.5 * v) continue;
            const an = Math.random() * TAU; let px2 = cx + Math.cos(an) * r, py2 = cy + Math.sin(an) * r;
            ctx.globalAlpha = 0.5 + 0.5 * v; ctx.beginPath(); ctx.moveTo(px2, py2);
            for (let j = 0; j < 4; j++) { px2 += Math.cos(an) * r * 0.35 + (Math.random() - 0.5) * r * 0.4; py2 += Math.sin(an) * r * 0.35 + (Math.random() - 0.5) * r * 0.4; ctx.lineTo(px2, py2); }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000'; ctx.strokeStyle = pr.color; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
        if (v >= 0.7) {
          // Ready to burst: a white-hot rim pulsing faster and faster, and cracks of light across the core.
          const hot = (v - 0.7) / 0.3, beat = 0.5 + 0.5 * Math.sin(t * (14 + 26 * hot));
          ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.5 + 0.5 * beat; ctx.lineWidth = Math.max(1.5, r * (0.08 + 0.1 * hot)); ctx.beginPath(); ctx.arc(cx, cy, r * 0.97, 0, TAU); ctx.stroke();
          ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath();
          for (let k = 0; k < 3 + Math.round(hot * 4); k++) { const an = (pr.seed * 7 + k * 2.4) % TAU; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * r * 0.5 + jx, cy + Math.sin(an) * r * 0.5 + jy); ctx.lineTo(cx + Math.cos(an + 0.3) * r * 0.95, cy + Math.sin(an + 0.3) * r * 0.95); }
          ctx.globalAlpha = 0.4 + 0.6 * beat; ctx.stroke();
          ctx.globalAlpha = 1;
          if (hot > 0.5 && Math.random() < 0.3) { const an = Math.random() * TAU; ctx.globalCompositeOperation = 'lighter'; glow(cx + Math.cos(an) * r, cy + Math.sin(an) * r, r * 0.8, '#ffffff', 0.6); ctx.globalAlpha = 1; }
        }
        ctx.globalCompositeOperation = 'lighter';
        break;
      }
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
  ctx.globalCompositeOperation = 'source-over';
  // Toddler Gravity: the rubber bands of gravity between orbs about to merge.
  if (G.voidBands && G.voidBands.length) {
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#c77dff';
    for (let i = 0; i < G.voidBands.length; i += 2) {
      const a = G.voidBands[i], b = G.voidBands[i + 1], ax = sx(a.x), ay = sy(a.y), bx = sx(b.x), by = sy(b.y), d = Math.hypot(bx - ax, by - ay), tight = Math.min(1, 140 * S / Math.max(1, d));
      const nx = -(by - ay) / (d || 1), ny = (bx - ax) / (d || 1), sag = Math.sin(G.realT * 9 + i) * 10 * S * (1 - tight);
      for (const [lw, al] of [[6, 0.15], [2, 0.6 + 0.3 * tight]]) { ctx.globalAlpha = al; ctx.lineWidth = lw * Math.max(0.7, S); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo((ax + bx) / 2 + nx * sag, (ay + by) / 2 + ny * sag, bx, by); ctx.stroke(); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  fxDim(false);
  drawToysUnder();
  // Elite, boss and ally auras.
  ctx.globalCompositeOperation = 'lighter';
  for (const e of G.enemies) {
    if (!vis(e) || e.egg) continue;
    if (e.burn > 0) glow(sx(e.x), sy(e.y), e.r * 2 * S, '#ff7a2f', 0.3);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // Enemies. (Lower quality with a crowd: common enemies skip their halo and surface detail.)
  // (A crowd: common enemies drop their halo and surface detail, and status effects draw as a single tint.)
  const lod = (QUAL.lv >= 1 && G.enemies.length > 60) || G.enemies.length > 80;
  STATUS_LOD = lod;
  for (const e of G.enemies) if (vis(e) && !e.egg) drawEnemy(e, lod);
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

  drawToysOver();
  drawVesicles();
  // Player.
  const px = sx(p.x), py = sy(p.y);
  if (G.barrier > 0) {
    // Latex Barrier: a stretchy hexagonal membrane with a shimmer running round it.
    const R = G.barrierR * S, wob = 1 + Math.sin(G.realT * 5) * 0.02;
    ctx.fillStyle = 'rgba(72,202,228,0.08)'; ctx.beginPath(); ctx.arc(px, py, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(72,202,228,0.8)'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU + G.realT * 0.4; i ? ctx.lineTo(px + Math.cos(a) * R * wob, py + Math.sin(a) * R * wob) : ctx.moveTo(px + Math.cos(a) * R * wob, py + Math.sin(a) * R * wob); }
    ctx.stroke();
    ctx.lineWidth = 1; ctx.globalAlpha = 0.35; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.realT * 0.4; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * R * wob, py + Math.sin(a) * R * wob); }
    ctx.stroke();
    const sa = G.realT * 2.2; ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, R, sa, sa + 0.5); ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (G.shieldT > 0) { ctx.strokeStyle = '#48cae4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.stroke(); }
  if (G.relics.diplomatic && G.t >= (G.dipAt || 0)) { ctx.strokeStyle = PAL.reward; ctx.globalAlpha = 0.55 + 0.25 * Math.sin(G.realT * 4); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 26 * S * playerScale(), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  if (G.stare) { const L = 560 * S, a = G.stare.a; ctx.globalCompositeOperation = 'lighter'; for (const [lw, al] of [[12, 0.2], [3, 0.9]]) { ctx.globalAlpha = al * Math.min(1, G.stare.life * 3); ctx.strokeStyle = '#c77dff'; ctx.lineWidth = lw * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); ctx.stroke(); } ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
  for (const w of G.weapons) {
    if (!w) continue;
    if (w.def.kind === 'siphon') {
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = G.realT * 30;
      ctx.strokeStyle = w.def.color + '66'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, w.s.area * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    if (w.def.heat && w.heat > 0.6) { ctx.globalCompositeOperation = 'lighter'; glow(px, py, 30 * S, '#ff5400', (w.heat - 0.6) * 1.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  }
  if (G.severed) for (const sv of G.severed) {
    const a = Math.max(0, sv.life / sv.max);
    ctx.globalAlpha = a * 0.45; drawTail(sv.pts, '#ffffff', 2.8 * S * sv.k);
    ctx.globalAlpha = a * 0.9; drawTail(sv.pts, 'rgb(46,52,48)', 1.1 * S * sv.k);
  }
  ctx.globalAlpha = 1;
  rebornDrawOOB(); // (Out of Body: your empty body)
  drawShip(px, py, p.hd != null ? p.hd : p.face, p.flash > 0 ? '#ff4d6d' : PAL.you, (G.oob ? 0.5 : p.iframes > 0 && Math.floor(G.realT * 20) % 2 ? 0.4 : 1) * (G.peek && G.peek.t > G.t ? 0.2 : 1) * finaleYouAlpha(), playerScale(), p, shipLook());
  drawSeqMods(px, py, p.hd != null ? p.hd : p.face, (G.peek && G.peek.t > G.t ? 0.2 : 1) * finaleYouAlpha(), playerScale(), p, shipLook());
  playerRing(px, py); // only with the GFP Tag, and only when you're hurt

  // Additive layer: weapon fx, projectiles, particles, fx.
  ctx.globalCompositeOperation = 'lighter';
  fxDim(true); drawWeaponFx(G.weapons, p.x, p.y, 1); fxDim(false);
  ctx.globalCompositeOperation = 'lighter';
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
  // Debris particles are matter, not light.
  ctx.globalCompositeOperation = 'source-over';
  fxDim(true);
  const hot = [];
  for (const q of G.parts) {
    if (!vis(q)) continue;
    const k = Math.max(0, q.life / q.max), x = sx(q.x), y = sy(q.y), s = q.size * S;
    switch (q.k) {
      case 'spark': case 'ember': hot.push(q); continue; // drawn as light, below
      case 'smoke': ctx.globalAlpha = 0.28 * k; ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill(); continue;
      case 'drop': ctx.globalAlpha = k; ctx.fillStyle = q.color; ctx.beginPath(); ctx.ellipse(x, y, s * 0.75, s * 0.55, Math.atan2(q.vy, q.vx), 0, TAU); ctx.fill(); continue;
      case 'shard': ctx.globalAlpha = k; ctx.fillStyle = q.color; ctx.beginPath(); ctx.moveTo(x + Math.cos(q.rot) * s * 1.6, y + Math.sin(q.rot) * s * 1.6); ctx.lineTo(x + Math.cos(q.rot + 2.4) * s * 0.6, y + Math.sin(q.rot + 2.4) * s * 0.6); ctx.lineTo(x + Math.cos(q.rot - 2.4) * s * 0.6, y + Math.sin(q.rot - 2.4) * s * 0.6); ctx.fill(); continue;
      case 'bubble': ctx.globalAlpha = k; ctx.strokeStyle = q.color; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, s * (1.3 - k * 0.5), 0, TAU); ctx.stroke(); continue;
      case 'plus': ctx.globalAlpha = k; ctx.fillStyle = q.color; ctx.fillRect(x - s / 2, y - s / 6, s, s / 3); ctx.fillRect(x - s / 6, y - s / 2, s / 3, s); continue;
      default: ctx.globalAlpha = k; ctx.fillStyle = q.color; ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }
  // Sparks and embers are light: additive streaks and glows.
  ctx.globalCompositeOperation = 'lighter';
  for (const q of hot) {
    const k = Math.max(0, q.life / q.max), x = sx(q.x), y = sy(q.y), s = q.size * S;
    if (q.k === 'spark') {
      ctx.globalAlpha = k; ctx.strokeStyle = q.color; ctx.lineWidth = Math.max(1, s); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - q.vx * 0.035 * S, y - q.vy * 0.035 * S); ctx.stroke();
    } else glow(x, y, s * 2.2, q.color, 0.8 * k);
  }
  ctx.lineCap = 'butt'; ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'lighter'; // arcs, blasts and shockwaves are energy
  for (const f of G.fx) {
    const k = f.life / f.max;
    if (f.type === 'pillar') {
      // A column of light from above (boss arrivals and deaths).
      const x = sx(f.x), y = sy(f.y), wd = f.r * S * (0.4 + 0.6 * k), top = y - H;
      for (const [m, al] of [[1.8, 0.18], [1, 0.4], [0.35, 0.9]]) { ctx.globalAlpha = al * k; ctx.fillStyle = al > 0.5 ? '#ffffff' : f.color; ctx.fillRect(x - wd * m / 2, top, wd * m, y - top); }
      glow(x, y, wd * 2.5, '#ffffff', 0.8 * k);
      continue;
    }
    if (f.type === 'flash') {
      // The white-hot core of a blast: big and bright for a few frames.
      const e = 1 - k, q = 0.4 + 0.6 * FX.k; glow(sx(f.x), sy(f.y), f.r * S * (0.45 + e * 0.5), '#ffffff', 0.55 * k * q); glow(sx(f.x), sy(f.y), f.r * S * (0.8 + e * 0.7), f.color, 0.45 * k * q);
      continue;
    }
    if (f.type === 'star') {
      // Crit: a four-point star flare.
      const x = sx(f.x), y = sy(f.y), L = f.r * S * (1.2 - k * 0.4);
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 4; i++) { const a = f.rot + i * Math.PI / 2; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); } ctx.stroke();
      glow(x, y, L * 0.5, f.color, 0.6 * k);
      continue;
    }
    if (f.type === 'muzzle') {
      // A short cone of flash at the gun.
      const x = sx(f.x), y = sy(f.y), ca = Math.cos(f.a), sa = Math.sin(f.a), L = 26 * S, Wd = 8 * S, o = 10 * S;
      ctx.globalAlpha = k; ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.moveTo(x + ca * o - sa * Wd, y + sa * o + ca * Wd); ctx.lineTo(x + ca * (o + L), y + sa * (o + L)); ctx.lineTo(x + ca * o + sa * Wd, y + sa * o - ca * Wd); ctx.fill();
      glow(x + ca * o, y + sa * o, 16 * S, '#ffffff', 0.7 * k);
      continue;
    }
    if (f.type === 'fall') {
      // Stork Drop: something heavy falls out of the sky onto the warning circle.
      const e = 1 - k, x = sx(f.x), y = sy(f.y), h = k * k * 520 * S, rr = Math.max(4, f.r * 0.22 * S);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.35 * e; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.ellipse(x, y, rr * (0.6 + e), rr * 0.5 * (0.6 + e), 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5; ctx.strokeStyle = f.color; ctx.lineWidth = rr * 0.8; ctx.beginPath(); ctx.moveTo(x, y - h - 90 * S); ctx.lineTo(x, y - h); ctx.stroke();
      glow(x, y - h, rr * 2.6, f.color, 0.9); ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y - h, rr * 0.7, 0, TAU); ctx.fill();
      continue;
    }
    if (f.type === 'frost') {
      // Power Shower: a ring of ice spikes punching outwards.
      const x = sx(f.x), y = sy(f.y), R = f.r * S * (0.3 + 0.7 * (1 - k)), n = 20;
      ctx.globalAlpha = 0.8 * k; ctx.fillStyle = f.color; ctx.beginPath();
      for (let i = 0; i < n; i++) { const a = i / n * TAU + (i % 2) * 0.1, L = (i % 2 ? 0.75 : 1) * R; ctx.moveTo(x + Math.cos(a - 0.06) * L * 0.6, y + Math.sin(a - 0.06) * L * 0.6); ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.lineTo(x + Math.cos(a + 0.06) * L * 0.6, y + Math.sin(a + 0.06) * L * 0.6); }
      ctx.fill();
      continue;
    }
    if (f.type === 'drop') {
      // The Petri Dish: the scientist's pipette drop falling into the dish.
      const fall = (k) * 520 * S, x = sx(f.x), y = sy(f.y) - fall, r = f.r * S * (1.2 - 0.4 * k);
      ctx.globalAlpha = 0.9; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - r * 2.2); ctx.quadraticCurveTo(x + r * 1.1, y - r * 0.2, x, y + r); ctx.quadraticCurveTo(x - r * 1.1, y - r * 0.2, x, y - r * 2.2); ctx.fill();
      ctx.globalAlpha = 0.5 * (1 - k); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), r * 2 * (1 - k * 0.5), r * (1 - k * 0.5), 0, 0, TAU); ctx.stroke();
      continue;
    }
    if (f.type === 'swing') {
      // Placenta Paddle: a crescent sweeping through the arc.
      const x = sx(f.x), y = sy(f.y), R = f.r * S, a0 = f.a - f.arc / 2, a1 = f.a + f.arc / 2, sweep = a0 + (a1 - a0) * Math.min(1, (1 - k) * 2.5);
      ctx.globalAlpha = (f.wave ? 0.3 : 0.5) * k; ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.arc(x, y, R, a0, sweep); ctx.arc(x, y, R * (f.wave ? 0.85 : 0.5), sweep, a0, true); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = f.wave ? 2 : 4;
      ctx.beginPath(); ctx.arc(x, y, R, a0, sweep); ctx.stroke();
      continue;
    }
    if (f.type === 'lash') {
      // Flagellum Flail: a whip that cracks out straight and wobbles at the tip.
      const ca = Math.cos(f.a), sa = Math.sin(f.a), L = f.r * Math.min(1, (1 - k) * 4);
      ctx.strokeStyle = f.color; ctx.lineCap = 'round';
      for (const [lw, al] of [[f.w * 1.6, 0.25], [Math.max(2, f.w * 0.45), 1]]) {
        ctx.globalAlpha = al * k; ctx.lineWidth = lw * S; ctx.beginPath();
        for (let i = 0; i <= 12; i++) { const t = i / 12, wob = Math.sin(t * 9 + f.seed + (1 - k) * 20) * f.w * 0.5 * t; const px = f.x + ca * L * t - sa * wob, py = f.y + sa * L * t + ca * wob; if (i) ctx.lineTo(sx(px), sy(py)); else ctx.moveTo(sx(px), sy(py)); }
        ctx.stroke();
      }
      ctx.lineCap = 'butt';
      continue;
    }
    if (f.type === 'spikes') {
      // Thorny Onesie: a ring of spikes punching outwards.
      const x = sx(f.x), y = sy(f.y), R = f.r * S * (0.55 + 0.45 * (1 - k)), n = 18;
      ctx.globalAlpha = 0.7 * k; ctx.fillStyle = f.color; ctx.beginPath();
      for (let i = 0; i < n; i++) { const a = f.rot + i / n * TAU, da = 0.12; ctx.moveTo(x + Math.cos(a - da) * R * 0.55, y + Math.sin(a - da) * R * 0.55); ctx.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R); ctx.lineTo(x + Math.cos(a + da) * R * 0.55, y + Math.sin(a + da) * R * 0.55); }
      ctx.fill();
      ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = f.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, R * 0.55, 0, TAU); ctx.stroke();
      continue;
    }
    if (f.type === 'ring') {
      ctx.globalAlpha = k; ctx.strokeStyle = f.color; ctx.lineWidth = f.w * k + 1;
      ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S * (1.1 - k * 0.4), 0, TAU); ctx.stroke();
    } else if (f.type === 'bolt') {
      // Lightning: a wide faint glow, the coloured channel, then a white-hot core, crackling every frame.
      const P = f.pts, j = () => (Math.random() - 0.5) * 6 * S, path = () => { ctx.beginPath(); ctx.moveTo(sx(P[0]), sy(P[1])); for (let i = 2; i < P.length - 2; i += 2) ctx.lineTo(sx(P[i]) + j(), sy(P[i + 1]) + j()); ctx.lineTo(sx(P[P.length - 2]), sy(P[P.length - 1])); };
      ctx.lineJoin = 'round';
      for (const [lw, al, c] of [[10, 0.18, f.color], [3.5, 0.9, f.color], [1.4, 1, '#ffffff']]) {
        ctx.globalAlpha = k * al; ctx.lineWidth = lw * Math.max(0.7, S); ctx.strokeStyle = c; path(); ctx.stroke();
      }
      if (f.forks) for (const F of f.forks) { ctx.globalAlpha = k * 0.7; ctx.strokeStyle = f.color; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(sx(F[0]), sy(F[1])); ctx.lineTo(sx(F[2]) + j(), sy(F[3]) + j()); ctx.lineTo(sx(F[4]), sy(F[5])); ctx.stroke(); }
      ctx.lineJoin = 'miter';
      glow(sx(P[P.length - 2]), sy(P[P.length - 1]), 18 * S, f.color, 0.7 * k);
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
  fxDim(false);

  // Enemy bullets on top, drawn like debris under phase contrast: a black granule with a solid white
  // halo, so they stand out on any background. With the Anti-Immune Stain the granule takes up the red dye at its core.
  ctx.globalCompositeOperation = 'source-over';
  const df = WORLD_DF; WORLD_DF = false; // black stays black, even in darkfield
  // A faint motion blur behind each one, which is how a moving particle looks on a live slide (and what
  // tells it apart from the still debris in the background).
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineCap = 'round'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y); ctx.moveTo(x, y); ctx.lineTo(x - b.vx * 0.06 * S, y - b.vy * 0.06 * S); }
  ctx.lineWidth = Math.max(1.5, 5 * S); ctx.stroke(); ctx.lineCap = 'butt';
  // High contrast on any background: a solid white ring round a black core (inverted in darkfield).
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, 1.1 * S); ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = (b.r * 0.8 + 1.6) * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.stroke();
  ctx.fillStyle = '#000000'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = b.r * 0.8 * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
  ctx.fill();
  if (G.dyes && G.dyes.immuno) {
    ctx.fillStyle = PAL.danger; ctx.beginPath();
    for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = b.r * 0.45 * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
  }
  WORLD_DF = df;

  drawOverkill();
  puDraw(); redDraw();
  if (FULL_COL) technicolourWash(0.32);
  // Floating texts.
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of G.texts) {
    ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
    const f = t.life / t.max, X = sx(t.x), Y = sy(t.y);
    if (t.big) {
      // Big hits slam in oversized, settle, then hang; huge ones get a coloured halo and a white core.
      const pop = 1 + Math.max(0, f - 0.82) * (t.big === 3 ? 7 : 4);
      ctx.font = `900 ${Math.round(t.size * Math.max(0.8, S) * pop)}px sans-serif`;
      ctx.lineJoin = 'round';
      ctx.globalAlpha *= 0.45; ctx.lineWidth = t.big === 3 ? 12 : 8; ctx.strokeStyle = t.color; ctx.strokeText(t.txt, X, Y);
      ctx.globalAlpha = Math.min(1, f * 2);
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.9)'; ctx.strokeText(t.txt, X, Y);
      ctx.fillStyle = t.big === 3 && f > 0.6 ? '#ffffff' : t.color; ctx.fillText(t.txt, X, Y);
      ctx.lineJoin = 'miter';
      continue;
    }
    const pop = 1 + Math.max(0, (f - 0.8)) * 2;
    ctx.font = `900 ${Math.round(t.size * Math.max(0.8, S) * pop)}px sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(t.txt, X, Y);
    ctx.fillStyle = t.color; ctx.fillText(t.txt, X, Y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  WORLD_DF = false;
  // Screen-space post effects: out-of-focus foreground, lens blur at the rim, vignette (none in clinical view).
  if (!SET.clinical) {
    drawForeground();
    if (!rewinding) drawLensBlur();
    if (QUAL.lv < 3) { buildVignette(); ctx.drawImage(SPR.vignette, 0, 0, W, H); } // (no vignette on the two lowest steps)
  }
  if (G.warp > 0) {
    // Nap Time: slow ripples spreading from you while time crawls.
    ctx.fillStyle = 'rgba(120,130,255,0.08)'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(184,192,255,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const ph = (G.realT * 0.6 + i / 3) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (40 + ph * 420) * S, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  if (G.boss && !G.boss.dead && !G.boss.egg) {
    // Dread: the edges of the slide darken and pulse while a boss is alive (harder when it's enraged).
    const ph = G.boss.bphase || 0, pulse = 0.5 + 0.5 * Math.sin(G.realT * (2 + ph * 1.5));
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.22, W / 2, H / 2, Math.hypot(W, H) * 0.52);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${(0.42 + 0.14 * ph + 0.12 * pulse).toFixed(3)})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  if (G.flashT > 0) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = Math.min(0.28, G.flashT * 2); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (G.evm && G.evm.dark) {
    // Lights Out: only a small pool of light round you... and fire, which gives off light of its own.
    drawDarkness(p, shx, shy);
  }
  if (G.state === 'bossIntro' && G.bossIntro) drawIntroSpot(G.bossIntro, shx, shy);
  if (p.flash > 0) { ctx.globalAlpha = p.flash / 0.2 * 0.5; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (G.clarityT > G.t) { const k = Math.min(1, (G.clarityT - G.t) / 0.8, (G.t - (G.clarityT - CLARITY_LEN)) / 0.5); ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.55 * k; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); ctx.restore(); } // (Post-Nut Clarity: the colour drains a little)
  if (p.hp / G.P.maxHp < 0.3) { ctx.globalAlpha = 0.25 + Math.sin(G.realT * 6) * 0.1; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (rewinding) drawRewindFx();
  drawRefocus();
  if (G.state === 'finale') drawFinale(shx, shy); else if (G.state === 'intro') drawIntro(); else if (G.state !== 'bossIntro') drawHud();
}

// You grow as you level up: up to 1.8x at level 60.
// Your swimmer grows with its max HP (not its level): +60% size at 400 max HP, up to double.
function hpScale(k) { return 1 + Math.min(1, Math.max(0, (G.P.maxHp - 120) / 470)) * (k == null ? 1 : k); }
// One enemy, drawn at its place on the slide (also used for the Codex portraits). lod: a crowd, so common
// enemies skip their halo and surface detail.
function drawEnemy(e, lod) {
  const plain = !e.elite && !e.boss && !e.rival && !e.charmed;
  const squash = 1 + Math.max(0, e.flash) * 2;
  // Individuals vary a little in size, and soft-bodied things breathe.
  if (e.vs == null) e.vs = e.boss || e.rival ? 1 : 0.9 + ((e.id * 9301 + 49297) % 233280) / 233280 * 0.2;
  const breathe = e.def.shape === 'cell' || e.def.shape === 'amoeba' || e.def.shape === 'spike' ? 1 + 0.035 * Math.sin(G.realT * 2.6 + e.id) : 1;
  // Hit stutter: a quick recoil away from the hit, with a shiver, springing back in 0.14s.
  const hk = e.hitRT != null ? 1 - (G.realT - e.hitRT) / 0.14 : 0, big = e.boss || e.rival ? 0.4 : 1;
  let jx = 0, jy = 0;
  if (hk > 0) { const kick = 3.2 * hk * hk * (e.hitK || 1) * big * S, sh = 1.4 * hk * big * S * (Math.floor(G.realT * 60) % 2 ? 1 : -1); jx = Math.cos(e.hitA) * kick - Math.sin(e.hitA) * sh; jy = Math.sin(e.hitA) * kick + Math.cos(e.hitA) * sh; }
  const x = sx(e.x) + jx, y = sy(e.y) + jy, r = e.r * S * squash * e.vs * breathe;
  ctx.globalAlpha = e.phased ? 0.25 : e.def.ethereal ? 0.55 : 1;
  if (e.def.ai === 'charge' && e.st === 1) { ctx.strokeStyle = 'rgba(241,91,181,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * 250 * S, y + e.dashY * 250 * S); ctx.stroke(); }
  if (e.boss && !e.egg) drawBossAura(e, x, y, r);
  if (e.boss) drawBossTells(e, x, y, r);
  if (e.aimT > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 - e.aimT) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(e.aimA) * 700 * S, y + Math.sin(e.aimA) * 700 * S); ctx.stroke(); }
  const tgt = e.charmed && e.allyT ? e.allyT : G.player;
  let face = e.rival ? (e.face || 0) : e.def.ai === 'charge' && e.st === 2 ? Math.atan2(e.dashY, e.dashX) : Math.atan2(tgt.y - e.y, tgt.x - e.x);
  // Peekaboo: you're gone, so they look where they think you went, and once there they look around,
  // confused, turning their heads this way and that (with the odd "?").
  const spot = (G.peek || G.toy || G.decoy) && !e.boss && !e.rival && !e.egg && !e.charmed ? peekSpot() : null;
  if (spot) {
    const sd = Math.hypot(spot.x - e.x, spot.y - e.y);
    let a = Math.atan2(spot.y - e.y, spot.x - e.x);
    if (sd < 80) a += Math.sin(G.realT * 2.4 + e.id * 1.7) * 1.4 + Math.sin(G.realT * 5.1 + e.id) * 0.35;
    let da = a - (e.lookA ?? a); while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    e.lookA = (e.lookA ?? a) + da * 0.18; face = e.lookA;
    if (sd < 80 && Math.sin(G.realT * 1.3 + e.id * 2.3) > 0.85) { ctx.fillStyle = '#ffffff'; ctx.font = `900 ${Math.round(13 * Math.max(0.8, S))}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y - r - 10 * S); }
  } else e.lookA = face;
  const sh = e.def.shape;
  const rot = sh === 'sperm' ? face : sh === 'antibody' ? face + Math.PI / 2 : e.age * (sh === 'spike' ? 3 : 1) + (sh === 'tri' ? face : 0);
  if (sh === 'sperm') {
    // Swimmers are drawn like you: real sperm with dragging tails. Rivals carry their fluorescent dye.
    if (e.tailV == null) { e.tailV = 0; e.px = e.x; e.py = e.y; }
    const fdt = Math.max(1e-3, G.realT - (e.tailT || G.realT)); e.tailV = Math.hypot(e.x - e.px, e.y - e.py) / fdt; e.px = e.x; e.py = e.y;
    const tag = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#bde0fe' : e.charmed ? PAL.you : e.rival ? e.color : e.elite ? '#ffd23f' : fastDyed(e) ? DYE_FAST : null;
    const lk = enemyLook(e);
    if (lk && lk.flicker && Math.random() < 0.08) ctx.globalAlpha = 0.3; // Quantum Swimmer: not entirely here
    drawShip(x, y, face, tag, e.phased ? 0.25 : ctx.globalAlpha, e.r * squash * e.vs / 8, e, lk);
  } else if (sh === 'krill') {
    drawKrill(e, x, y, r, face);
  } else if (MICROBES[sh]) {
    MICROBES[sh](e, x, y, r, face);
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
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#c9e4f5' : eTone(e, sh === 'amoeba' ? 0.62 : 0.36);
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
      // (Batched: the dark granules in one path, the light ones in another: two draw calls, not dozens.)
      for (const lite of [0, 1]) {
        ctx.fillStyle = lite ? 'rgba(255,255,255,0.3)' : 'rgba(30,36,32,0.35)'; ctx.beginPath();
        for (let i = 0, gn = SET.detail === 'high' ? 70 : 26; i < gn; i++) { if ((i % 3 === 0) !== !!lite) continue; const a = i * 2.39 + e.id + e.age * (SET.detail === 'high' ? 0.25 + (i % 5) * 0.04 : 0.25), d = r * 0.72 * Math.sqrt((i * 0.618) % 1); ctx.rect(x + Math.cos(a) * d, y + Math.sin(a) * d, Math.max(1, r * 0.035), Math.max(1, r * 0.035)); }
        ctx.fill();
      }
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
      ctx.beginPath(); for (let i = 0; i < gn; i++) { const a = i * 2.4 + e.id, d = r * 0.8 * ((i * 0.37) % 1); ctx.rect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.5, 1.5); } ctx.fill(); // (one draw call)
      if (SET.detail === 'high') { ctx.strokeStyle = 'rgba(230,236,232,0.35)'; ctx.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = e.id + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25, r * 0.24, 0, TAU); ctx.stroke(); } }
      drawShape(sh, x, y, r, rot);
    }
    if (e.elite || e.charmed) {
      // Immunostained: a fluorescent rim marks elites (gold) and your allies (pink).
      ctx.strokeStyle = e.charmed ? PAL.you : PAL.reward; ctx.lineWidth = 3; ctx.stroke();
    } else if (!(lod && plain)) pcHalo(e.boss ? 4.5 : Math.max(2.5, r * 0.16), e.boss ? 0.95 : 0.85);
  }
  if (sh !== 'sperm' && !e.boss && !(lod && plain)) drawEnemyDetail(e, x, y, r, rot);
  if (e.elite && !e.boss) { ctx.fillStyle = PAL.reward; for (let i = 0; i < 3; i++) { const a = G.realT * 2 + i * TAU / 3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * (r + 9), y + Math.sin(a) * (r + 9), 2.5, 0, TAU); ctx.fill(); } }
  // Hit flash: the body goes bright white with a crisp rim, and a ring snaps outwards. Ticks get a faint flicker.
  if (hk > 0 || G.realT - (e.tickRT || -9) < 0.08) {
    const k = hk > 0 ? Math.min(1, hk * 1.4) : 0.3 * (1 - (G.realT - e.tickRT) / 0.08), a0 = ctx.globalAlpha;
    ctx.globalAlpha = a0 * 0.7 * k * (big < 1 ? 0.45 : 1); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, r * 0.98, 0, TAU); ctx.fill();
    if (hk > 0 && big === 1) {
      ctx.globalAlpha = a0 * k; ctx.lineWidth = Math.max(1.5, 1.2 * S); ctx.strokeStyle = 'rgb(20,24,22)'; ctx.stroke();
      const rr = r * (1.05 + 0.45 * (1 - hk)) + 2;
      ctx.globalAlpha = a0 * hk * 0.9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, 2 * hk * S * (e.hitK || 1) * 0.6); ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = a0;
  }
  let si = 0;
  const st = c => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 3 + si * 3, 0, TAU); ctx.stroke(); si++; };
  drawStatusFx(e, x, y, r);
  if (e.mark > 0) st('#c77dff');
  if (e.fizz > 0) st('#9ff7ff');
  if (e.pickle > 0) st('#ffb3c6');
  if (e.stasisT > G.realT) st('rgba(184,192,255,0.7)');
  if (e.parasiteT > 0) st('#b5e48c');
  if (e.soggyT > G.t) st('#cfe8ff');
  if (e.guiltT > G.t) st('#c77dff');
  if (e.charmed) { ctx.fillStyle = PAL.you; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ALLY ' + Math.ceil(e.charmT), x, y - r - 12); }
  if (e === G.grudge) {
    // Grudge target: a rotating red crosshair.
    ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 2.5;
    const gr = r + 10 + Math.sin(G.realT * 8) * 2, ga = G.realT * 2;
    for (let i = 0; i < 4; i++) { const a = ga + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, gr, a, a + 0.9); ctx.stroke(); }
    ctx.fillStyle = '#ff4d6d'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GRUDGE', x, y - gr - 6);
  }
  if ((e.auraArm > 0 || e.armour >= 8) && !e.boss) { ctx.strokeStyle = '#8da9c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r + 1, -2.4, -0.7); ctx.stroke(); }
  if (e.rival && !e.portrait) {
    // Rival champions: name and level (their health ring comes with the Rival Dyes or the Anti-Immune Stain).
    const by = y - r - 12;
    ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    const label = `${e.name}  LV ${e.lvl}` + (e.mode === 'hunt' ? '  !' : e.mode === 'flee' ? '  (fleeing)' : '');
    ctx.strokeText(label, x, by - 5); ctx.fillStyle = e.color; ctx.fillText(label, x, by - 5);
  }
  enemyRing(e, x, y, r);
}
// The pause menu's YOU portrait: your sperm exactly as it looks in play (upgrades and every active sequence's
// marks), drawn big on canvas context g (css size Wc x Hc) on a patch of slide. Borrows the world drawing
// globals for the length of the call. body: a stand-in that keeps its own tail, so yours isn't disturbed.
function drawYouPortrait(g, Wc, Hc, body, t) {
  const keep = { ctx, W, H, S, cx: cam.x, cy: cam.y, rt: G.realT }, L = shipLook(), ps = playerScale();
  const bg = g.createRadialGradient(Wc * 0.55, Hc * 0.5, 0, Wc * 0.55, Hc * 0.5, Math.max(Wc, Hc) * 0.75);
  bg.addColorStop(0, '#c4cbc2'); bg.addColorStop(0.65, MIC.fluid); bg.addColorStop(1, MIC.edge);
  g.fillStyle = bg; g.fillRect(0, 0, Wc, Hc);
  try {
    ctx = g; W = Wc; H = Hc; G.realT = t; // (the game clock stands still while paused; the portrait keeps swimming)
    S = Math.min(Wc * 0.8 / ((78 * L.tailLen + 18) * ps * L.head), Hc * 0.55 / (16 * ps * L.head));
    body.vx = 140; body.vy = 0; body.tailV = 140; body.hd = 0; body.face = 0;
    cam.x = body.x - 32 * ps * L.head; cam.y = body.y + Math.sin(t * 1.3) * 2;
    const x = sx(body.x), y = sy(body.y);
    drawShip(x, y, 0, PAL.you, 1, ps, body, L);
    drawSeqMods(x, y, 0, 1, ps, body, L);
  } finally { ctx = keep.ctx; W = keep.W; H = keep.H; S = keep.S; cam.x = keep.cx; cam.y = keep.cy; G.realT = keep.rt; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}
function playerScale() { return hpScale() * puScale(); }

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
// Sperm-analysis-style tracking overlay: each tracked swimmer
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
  ctx.fillStyle = XR.white; ctx.fillText('PH2 ' + zoomMag() + 'x  37\u00b0C  ' + Math.round(FPS.v) + ' FPS (low ' + Math.round(FPS.low) + ')' + (QUAL.lv ? '  Q' + (4 - QUAL.lv) : ''), x + len + 10, y + 4);
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
  // Sizes are baked in steps (and stretched the last few pixels), so a chip whose text changes width every
  // second (a countdown, BEHIND PACE) reuses one bake instead of baking a new panel each time.
  const qw = round ? bw : Math.max(8, Math.ceil(bw / 16) * 16), qh = round ? bh : Math.max(8, Math.ceil(bh / 4) * 4);
  const key = qw + 'x' + qh + (round ? 'o' : '');
  let set = SHEETS.get(key);
  if (set) { SHEETS.delete(key); SHEETS.set(key, set); } // most recently used goes to the back
  else {
    set = [0, 1, 2].map(i => bakeSheet(qw, qh, round, i + 1)); SHEETS.set(key, set);
    if (SHEETS.size > 80) SHEETS.delete(SHEETS.keys().next().value); // drop the least recently used, not the lot
  }
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
// Patient-monitor module: HP as a vital sign, heart rate that climbs as you get hurt, a live ECG trace
// (your green; danger red when low; flat when you die), and level / kills / viewers underneath.
// Minimal HUD: everything in one thin bar. HP (with a slim bar), level, time, race position, kills.
// The HUD's one bar across the top: health (number and bar), level, the clock, kills, and your place in the
// race (or the sperm count). Everything else lives in the readout under it or on chips down the left.
function drawTopBar(top, m, s) {
  const p = G.player, k = clamp(p.hp / G.P.maxHp, 0, 1), low = k < 0.3, w = W - 70, x = 8, y = top + 8, h = 28;
  filmPanel(x, y, w, h);
  const sb = ctx.shadowOffsetX; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = 'bold 14px ' + MONO; ctx.fillStyle = low ? PAL.danger : XR.white;
  const hv = String(Math.ceil(p.hp)); ctx.fillText(hv, x + 8, y + 19);
  const bx = x + 14 + Math.max(28, ctx.measureText(hv).width), bw = Math.min(84, w * 0.24);
  ctx.fillStyle = 'rgba(214,228,240,0.15)'; ctx.fillRect(bx, y + 11, bw, 7);
  ctx.fillStyle = low ? PAL.danger : PAL.you; ctx.fillRect(bx, y + 11, bw * k, 7);
  drawStamina(bx, y + 20, bw); // (stamina, just under: stamina.js)
  if (G.shieldT > 0 || G.absorbOn) { ctx.strokeStyle = PAL.pickup; ctx.lineWidth = 1.5; ctx.strokeRect(bx - 1.5, y + 9.5, bw + 3, 10); }
  ctx.font = 'bold 11px ' + MONO; ctx.fillStyle = XR.white;
  let txt = `LV ${G.level}  ${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}  K ${G.kills}`;
  if (G.rivalsInit && !G.wave && !G.debug) {
    const board = rivalBoard(), place = board.findIndex(r => r.you) + 1;
    if (place) txt += `  P${place}/${board.length}`;
  }
  if (ownsScrapWeapon()) txt += `  SCRAP ${Math.floor(G.scrap)}`;
  ctx.fillText(txt, bx + bw + 10, y + 18);
  ctx.shadowOffsetX = sb; ctx.shadowOffsetY = sb;
}

function drawHud() {
  const p = G.player, top = UI.safeTop || 0;
  // Everything on the HUD gets a soft dark drop so it reads against the pale field.
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
  drawScaleBar();
  // XP: a thin calibration line across the very top.
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, top, W, 3);
  ctx.fillStyle = XR.white; ctx.fillRect(0, top, W * Math.min(1, G.xp / G.xpNeed), 3);
  const c = G.core, land = LAYOUT.land, BY = land ? 56 : 60;
  const barX = 10, barW = Math.min(360, W - 130);
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  drawTopBar(top, m, s);
  // Status chips.
  const chips = [];
  if (G.rage > 0) chips.push(['OXYTOCIN', PAL.pickup]);
  puChips(chips);
  // Falling behind the level curve is what loses runs: say so.
  if (!G.wave) { const behind = (1 + 59 * Math.pow(Math.min(1, G.t / 540), 0.85)) - G.level; if (behind >= 3) chips.push(['BEHIND PACE: ' + Math.round(behind) + ' LV', PAL.danger]); }
  if (G.shieldT > 0) chips.push(['STAIR GATE', PAL.pickup]);
  if (G.warp > 0) chips.push(['WARP', XR.white]);
  if (G.barrier > 0) chips.push(['AEGIS', XR.white]);
  if (G.echoes.length) chips.push(['ECHO x' + G.echoes.length, PAL.you]);
  if (G.inPill) chips.push(['PILL: SLOW, XP -50%', PAL.danger]);
  if (G.sticky) chips.push(['STUCK IN YEAST', PAL.danger]);
  if (G.yeastOn && G.yeastN) chips.push(['INFECTION: ' + G.yeastN + ' CELLS', PAL.danger]);
  if (G.chargeUpT > G.t) chips.push(['CHARGED UP', '#f4ff8a']);
  if (G.absorbOn) chips.push(['CRUMPLE ZONE', '#ffe94a']);
  if (G.manual) chips.push(['MANUAL', XR.white]);
  statusIntroCheck(chips); // first time ever for a buff or debuff: a tutorial card (statusintro.js)
  // Stacked down the left edge, below the boss bar.
  ctx.font = 'bold 10px ' + MONO; ctx.textAlign = 'left';
  let cyp = land ? top + BY + 72 : Math.max(top + BY + 72, H * 0.38); // (portrait: clear of the narrator's box)
  // (Tap one to pause and see them all: UI.chipRects, statusintro.js.)
  UI.chipRects = [];
  for (const [ch, cc] of chips) { const tw = ctx.measureText(ch).width + 14; filmPanel(8, cyp, tw, 16); ctx.fillStyle = cc; ctx.fillText(ch, 15, cyp + 12); UI.chipRects.push({ x: 8, y: cyp, w: tw, h: 16 }); cyp += 20; }
  UI.chips = chips;
  // Boss bar: centred, under the sperm count / wave readout.
  if (G.boss && !G.boss.dead) {
    const b = G.boss, bw = Math.min(360, W - 120), bx = (W - bw) / 2, by = top + BY + 46;
    const pair = b.twin ? [b, b.twin] : [b];
    const hp = pair.reduce((a, o) => a + (o.dead ? 0 : Math.max(0, o.hp)), 0), mx = pair.reduce((a, o) => a + o.maxHp, 0);
    // A trailing "damage taken" chunk, phase marks at 66% and 33%, and a jolt on big hits.
    const k = hp / mx;
    if (G.bossGhost == null || G.bossGhostOf !== b) { G.bossGhost = k; G.bossGhostOf = b; }
    if (G.bossGhost - k > 0.02) G.bossJolt = 0.25;
    G.bossGhost = Math.max(k, G.bossGhost - 0.004);
    const jx = G.bossJolt > 0 ? (Math.random() - 0.5) * 6 * G.bossJolt * 4 : 0; if (G.bossJolt > 0) G.bossJolt -= 1 / 60;
    softBar(bx + jx, by, bw, G.bossGhost, 'rgba(255,255,255,0.35)');
    { const fw = Math.max(0, Math.min(1, k)) * bw; if (fw > 1) { sheetPath(bx + jx, by, Math.max(fw, 8), 10, false, 5); ctx.fillStyle = b.bphase ? PAL.danger : XR.white; ctx.fill(); } }
    ctx.fillStyle = '#000000'; for (const m of [0.33, 0.66]) ctx.fillRect(bx + jx + bw * m - 1, by - 2, 2, 14);
    ctx.textAlign = 'center'; ctx.fillStyle = XR.white; ctx.font = 'bold 11px ' + MONO;
    const nm = b.twin ? b.def.name : b.name;
    const tag = G.revive ? `  REBUILDING IN ${Math.max(0, Math.ceil(G.revive.t - G.t))}s` : b.winded > G.t ? '  WINDED: HIT IT!' : b.glaring ? '  GLARING: HIT IT!' : b.armour >= 6 ? `  [ARMOUR ${Math.round(effArmour(b))}]` : '';
    ctx.fillText(nm + tag, bx + bw / 2, by - 8);
  }
  // The sperm count (always ticking down), then the Final Five, then the egg.
  {
    const bw = barW, bx = barX, by = top + BY, mid = bx + bw / 2;
    ctx.textAlign = 'center';
    if (G.fertile) {
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(G.realT * 6);
      ctx.fillStyle = PAL.reward; ctx.font = 'bold 13px ' + MONO; ctx.fillText('SPERM COUNT: 1. SWIM INTO THE EGG!', mid, by - 4);
      ctx.globalAlpha = 1;
    } else if (G.showdown) {
      const fin = G.enemies.filter(e => e.final && !e.dead), hp = fin.reduce((a, e) => a + e.hp, 0), mx = fin.reduce((a, e) => a + e.maxHp, 0) || 1;
      softBar(bx, by, bw, fin.length ? hp / mx : 0, PAL.danger);
      ctx.fillStyle = XR.white; ctx.font = 'bold 11px ' + MONO;
      ctx.fillText(`THE FINAL FIVE: ${fin.length} LEFT (SPERM COUNT ${spermCount()})`, mid, by - 8);
    } else if (G.debug) {
      const cy2 = by;
      ctx.fillStyle = XR.dim; ctx.font = '9px ' + MONO; ctx.fillText('LAB BENCH' + (G.debug.god ? ' | GOD MODE' : '') + (G.debug.freeze ? ' | TIME STOPPED' : ''), mid, cy2 - 14);
      ctx.fillStyle = XR.white; ctx.font = 'bold 16px ' + MONO; ctx.fillText(G.enemies.filter(e => !e.dead && !e.charmed).length + ' ENEMIES', mid, cy2 + 4);
    } else if (G.wave) {
      // The Petri Dish: the wave and how much of it is left.
      const V = G.wave, cy2 = by;
      const left = V.active ? Math.max(0, V.budget - V.spawned) + G.enemies.filter(e => !e.dead && !e.charmed && !e.egg).length : 0;
      ctx.fillStyle = XR.dim; ctx.font = '9px ' + MONO; ctx.fillText(V.camp && V.active ? (V.phase === 'mobs' ? `${left} LEFT | BOSS AT WAVE ${Math.ceil(V.n / CAMP.bossEvery) * CAMP.bossEvery}` : V.phase === 'lead' ? `${bossDef(V.boss).name} IN ${Math.max(0, Math.ceil(V.leadT))}s` : V.boss ? bossDef(V.boss).name : '') : V.active ? 'THE PETRI DISH' : V.n ? 'BETWEEN DROPS' : 'THE PETRI DISH', mid, cy2 - 14);
      ctx.fillStyle = XR.white; ctx.font = 'bold 16px ' + MONO; ctx.fillText(V.camp ? (V.n ? `WAVE ${V.n} OF ${CAMP.waves}${V.active ? '' : ' BEATEN'}` : `${CAMP.waves} WAVES`) : V.n ? `WAVE ${V.n}${V.active ? '  |  ' + left + ' LEFT' : ' CLEAR'}` : 'READY', mid, cy2 + 4);
    }
  }
  // Off-screen pointers: boss (red) and the egg (pink).
  const pointer = (wx, wy, col, size, alpha, edge) => {
    const dx = wx - cam.x, dy = wy - cam.y;
    if (Math.abs(dx * S) < W / 2 - 10 && Math.abs(dy * S) < H / 2 - 10) return;
    const a = Math.atan2(dy, dx), k = size || 1;
    let px, py;
    if (edge) {
      // Pinned to the actual screen edge (clear of the HUD bands), where the threat will come in.
      const hw = W / 2 - 16, hh = H / 2 - 16, t = Math.min(hw / Math.abs(Math.cos(a) || 1e-6), hh / Math.abs(Math.sin(a) || 1e-6));
      px = W / 2 + Math.cos(a) * t; py = clamp(H / 2 + Math.sin(a) * t, (UI.safeTop || 0) + 150, H - (UI.bottomH || 200) - 24);
    } else { const rr = Math.min(W, H) / 2 - 40; px = W / 2 + Math.cos(a) * rr; py = H / 2 + Math.sin(a) * rr; }
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.translate(px, py); ctx.rotate(a); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(14 * k, 0); ctx.lineTo(-8 * k, 9 * k); ctx.lineTo(-8 * k, -9 * k); ctx.fill(); ctx.restore();
  };
  // Off-screen shooters: red chevrons on the screen edge, flashing just before they fire.
  const shooters = [];
  for (const e of G.enemies) {
    if (e.dead || e.boss || e.charmed || e.rival || !e.def.shoot) continue;
    const d = Math.hypot(e.x - cam.x, e.y - cam.y);
    if (d < 1100) shooters.push([d, e]);
  }
  shooters.sort((a, b) => a[0] - b[0]);
  for (const [, e] of shooters.slice(0, 6)) {
    const soon = (e.shootCd != null && e.shootCd < 0.6) || e.aimT > 0;
    pointer(e.x, e.y, PAL.danger, 0.7, soon ? 0.55 + 0.45 * Math.sin(G.realT * 30) : 0.6, true);
  }
  if (G.boss && !G.boss.dead) pointer(G.boss.x, G.boss.y, '#ff4d6d');
  for (const e of G.enemies) if (e.evTag && !e.dead) pointer(e.x, e.y, PAL.reward, 1.1, 0.7 + 0.3 * Math.sin(G.realT * 8));
  // The Petri Dish: the last few of a wave get arrows.
  if (G.wave && G.wave.active && G.wave.spawned >= G.wave.budget) { const rest = G.enemies.filter(e => !e.dead && !e.charmed && !e.egg); if (rest.length <= 10) for (const e of rest) pointer(e.x, e.y, XR.white, 0.8, 0.8); }
  for (const e of G.enemies) if (e.rival && !e.dead && (e.mode === 'egg' || e.mode === 'hunt')) pointer(e.x, e.y, e.color);
  pointer(c.x, c.y, G.fertile ? PAL.reward : '#ffb3d1', G.fertile ? 1.3 : 1);
  drawEventBar();
  drawMinimap(top);
  drawZoomGauge();
  ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  // Banner.
  if (G.banner) {
    const b = G.banner, a = Math.min(1, b.t * 2), sc = 1 + Math.max(0, b.t - 2.1) * 1.5;
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = `900 ${Math.min(24, W / 17) * sc}px sans-serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(b.text, W / 2, H * 0.3);
    ctx.fillStyle = b.color; ctx.fillText(b.text, W / 2, H * 0.3);
    ctx.globalAlpha = 1;
  }
  if (G.evNote) {
    // What the run event does, in a line or two under the banner.
    ctx.globalAlpha = Math.min(1, G.evNote.t * 2); ctx.textAlign = 'center'; ctx.font = 'bold 13px ' + MONO;
    const words = G.evNote.text.split(' '), lines = [''], maxW = Math.min(W - 40, 420);
    for (const wd of words) { const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + wd : wd; if (ctx.measureText(t).width > maxW) lines.push(wd); else lines[lines.length - 1] = t; }
    lines.forEach((l, i) => { const y = H * 0.3 + 28 + i * 17; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)'; ctx.strokeText(l, W / 2, y); ctx.fillStyle = XR.white; ctx.fillText(l, W / 2, y); });
    ctx.globalAlpha = 1;
  }
  if (INPUT.active && G.manual) {
    ctx.strokeStyle = XR.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(INPUT.ox, INPUT.oy, 50, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(INPUT.ox + G.manual.x * 50, INPUT.oy + G.manual.y * 50, 20, 0, TAU); ctx.fill();
  }
}

// Run events: one chip each, above the weapon bar, with a timer running down underneath.
function drawEventBar() {
  if (!G.ev || !G.ev.active.length) return;
  ctx.font = 'bold 11px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  const items = G.ev.active.map(ev => { const E = RUN_EVENTS[ev.id], t = (ev.dire ? 'DIRE ' : '') + E.name + '  ' + Math.max(0, Math.ceil(ev.left)) + 's'; return { ev, E, t, w: ctx.measureText(t).width + 18 }; });
  // Stacked bottom-left, clear of the scale bar and the Rewind button.
  const x = 10, y0 = H - (UI.bottomH || 200) - 62;
  items.forEach((it, i) => {
    const y = y0 - i * 27;
    filmPanel(x, y, it.w, 22);
    ctx.fillStyle = it.E.color; ctx.fillText(it.t, x + 9, y + 15);
    ctx.fillRect(x + 4, y + 19, (it.w - 8) * Math.max(0, it.ev.left / it.ev.max), 2);
  });
}

function mmR() { return LAYOUT.land ? Math.round(clamp(H * 0.15, 62, 120)) : 44; }
function drawMinimap(top) {
  const R = mmR(), mx = W - R - 10, my = top + 132 + R; // (below the pause, auto and speed buttons)
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
  dot(G.core.x, G.core.y, 8, G.fertile ? PAL.reward : '#ffb3d1');
  for (const e of G.enemies) if (e.rival && !e.dead) dot(e.x, e.y, 5, e.color);
  for (const e of G.echoes) dot(e.x, e.y, 3, '#e0fbff');
  if (G.pill) {
    ctx.globalAlpha = 0.25 * G.pill.alpha; ctx.fillStyle = PAL.danger;
    pillLobes((wx, wy, wr) => { let dx = (wx - G.core.x) * k, dy = (wy - G.core.y) * k; ctx.beginPath(); ctx.arc(mx + dx, my + dy, Math.max(2, wr * k), 0, TAU); ctx.fill(); });
    ctx.globalAlpha = 1;
    if (pillR() <= 0) dot(G.pill.x, G.pill.y, 5, PAL.danger);
  }
  dot(G.player.x, G.player.y, 4, XR.white);
  // View rectangle.
  ctx.strokeStyle = XR.line; ctx.lineWidth = 1;
  ctx.strokeRect(mx + (cam.x - G.core.x - W / 2 / S) * k, my + (cam.y - G.core.y - H / 2 / S) * k, W / S * k, H / S * k);
}

// ---------------------------------------------------------------- the crowd
// Hundreds of tiny swimmers, batched into two paths (tails, then heads) so they cost almost nothing.
function drawAmbient(vis) {
  const A = G.amb;
  if (!A || !A.length) return;
  const k = S, hl = 3.2 * k, tl = 11 * k;
  ctx.lineCap = 'round';
  ctx.strokeStyle = SET.darkfield ? 'rgba(214,228,240,0.5)' : 'rgba(40,46,42,0.5)'; ctx.lineWidth = Math.max(0.7, 0.7 * k);
  ctx.beginPath();
  for (const s of A) {
    if (s.dead || !vis(s)) continue;
    const x = sx(s.x), y = sy(s.y), ca = Math.cos(s.a || 0), sa = Math.sin(s.a || 0), nx = -sa, ny = ca;
    ctx.moveTo(x - ca * hl, y - sa * hl);
    for (let i = 1; i <= 3; i++) { const f = i / 3, w = Math.sin(s.ph - f * 5) * 2.2 * k * f; ctx.lineTo(x - ca * (hl + tl * f) + nx * w, y - sa * (hl + tl * f) + ny * w); }
  }
  ctx.stroke();
  ctx.fillStyle = SET.darkfield ? 'rgba(230,238,245,0.85)' : 'rgba(58,64,60,0.8)';
  ctx.beginPath();
  for (const s of A) {
    if (s.dead || !vis(s)) continue;
    const x = sx(s.x), y = sy(s.y), r = 2.4 * k;
    ctx.moveTo(x + r, y); ctx.ellipse(x, y, r * 1.35, r, s.a || 0, 0, TAU);
  }
  ctx.fill();
  ctx.lineCap = 'butt';
}

// ---------------------------------------------------------------- the pill's cloud
// Drawn at low resolution: the lobes are unioned into one chalky blob with a thin red rim (it hurts).
const PILLC = { a: null, b: null, key: '' };
function drawPill() {
  const q = G.pill;
  if (!q) return;
  if (q.t < PILL.fizz) {
    // The pill itself, fizzing: a white capsule with a split seam.
    const x = sx(q.x), y = sy(q.y), r = 30 * S, a = q.t * 0.6;
    // Warning pulse where it will dissolve.
    ctx.strokeStyle = PAL.danger; ctx.lineWidth = 2; ctx.globalAlpha = 0.6 * (1 - (q.t % 1));
    ctx.beginPath(); ctx.arc(x, y, r * (2 + 4 * (q.t % 1)), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.fillStyle = '#e8eef4'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.7, r, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = PAL.danger; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = 'rgba(40,46,52,0.6)'; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.restore();
    return;
  }
  const w = Math.max(1, Math.ceil(W / 3)), h = Math.max(1, Math.ceil(H / 3)), key = w + 'x' + h;
  if (PILLC.key !== key) { PILLC.key = key; PILLC.a = makeCanvas(w, h); PILLC.b = makeCanvas(w, h); }
  const ga = PILLC.a.getContext('2d'), gb = PILLC.b.getContext('2d'), k = S / 3, ox = w / 2 - cam.x * k, oy = h / 2 - cam.y * k;
  ga.clearRect(0, 0, w, h); gb.clearRect(0, 0, w, h);
  ga.fillStyle = SET.darkfield ? '#e6edf3' : '#48525c'; gb.fillStyle = col(PAL.danger); // grey rim until the Anti-Immune Stain
  pillLobes((wx, wy, wr) => {
    ga.beginPath(); ga.arc(ox + wx * k, oy + wy * k, wr * k, 0, TAU); ga.fill();
    gb.beginPath(); gb.arc(ox + wx * k, oy + wy * k, wr * k + 2.5, 0, TAU); gb.fill();
  });
  gb.globalCompositeOperation = 'destination-out'; gb.drawImage(PILLC.a, 0, 0); gb.globalCompositeOperation = 'source-over';
  const df = WORLD_DF; WORLD_DF = false;
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = (SET.darkfield ? 0.14 : 0.3) * q.alpha; ctx.drawImage(PILLC.a, 0, 0, W, H);
  ctx.globalAlpha = 0.55 * q.alpha; ctx.drawImage(PILLC.b, 0, 0, W, H);
  ctx.globalAlpha = 1; WORLD_DF = df;
}

// ---------------------------------------------------------------- refocus blur
// After a zoom the image goes soft and the focus hunts back in (a slight overshoot, like turning the fine
// focus knob), over about 0.6 s. Cheap: the frame is shrunk twice and laid back over itself.
const RF = { a: null, b: null, key: '' };
function drawRefocus() {
  const k = refocusLeft();
  if (k <= 0 || !ZOOM.defocus || !LENS_OK) return; // (copies the frame back: skipped on Android, like the rim blur)
  const t = 1 - k, d = ZOOM.defocus * k * k * (0.8 + 0.2 * Math.cos(t * 20));
  if (d < 0.03) return;
  const w1 = Math.max(1, Math.ceil(W / 4)), h1 = Math.max(1, Math.ceil(H / 4)), w2 = Math.max(1, Math.ceil(W / 12)), h2 = Math.max(1, Math.ceil(H / 12)), key = w1 + 'x' + h1;
  if (RF.key !== key) { RF.key = key; RF.a = makeCanvas(w1, h1); RF.b = makeCanvas(w2, h2); }
  const ga = RF.a.getContext('2d'), gb = RF.b.getContext('2d');
  ga.imageSmoothingEnabled = gb.imageSmoothingEnabled = true;
  ga.drawImage(cv, 0, 0, w1, h1); gb.drawImage(RF.a, 0, 0, w2, h2);
  ctx.imageSmoothingEnabled = true;
  ctx.globalAlpha = Math.min(1, d * 1.3); ctx.drawImage(RF.a, 0, 0, W, H);
  ctx.globalAlpha = Math.min(1, d); ctx.drawImage(RF.b, 0, 0, W, H);
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- magnification gauge
// Shown while you pinch: a fine-focus style scale from 24x to 80x with the objective's reading.
function zoomMag() { return Math.round(40 * ZOOM.z); }
function drawZoomGauge() {
  const left = ZOOM.until - performance.now();
  if (left <= 0) return;
  const a = Math.min(1, left / 400), gh = Math.min(220, H * 0.34), gw = 44;
  const x = LAYOUT.land ? W - mmR() * 2 - 90 : W - 96, y = H * 0.5 - gh / 2;
  const osx = ctx.shadowOffsetX; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.globalAlpha = a;
  filmPanel(x - 6, y - 30, gw + 12, gh + 58);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.font = 'bold 9px ' + MONO; ctx.fillStyle = XR.dim;
  ctx.fillText('OBJ', x + gw / 2, y - 14);
  // Log scale, high magnification at the top.
  const lo = Math.log(ZOOM.min), hi = Math.log(ZOOM.max), yOf = z => y + gh - (Math.log(z) - lo) / (hi - lo) * gh;
  ctx.strokeStyle = XR.line; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 10, y); ctx.lineTo(x + 10, y + gh); ctx.stroke();
  ctx.textAlign = 'left'; ctx.font = '8px ' + MONO;
  for (const m of [25, 32, 40, 50, 63, 80]) {
    const ty = yOf(m / 40);
    ctx.strokeStyle = XR.dim; ctx.beginPath(); ctx.moveTo(x + 6, ty); ctx.lineTo(x + 14, ty); ctx.stroke();
    ctx.fillStyle = XR.dim; ctx.fillText(m + 'x', x + 18, ty + 3);
  }
  for (let z = ZOOM.min; z <= ZOOM.max; z *= 1.06) { const ty = yOf(z); ctx.fillStyle = XR.line; ctx.fillRect(x + 8, ty, 4, 1); }
  // Pointer and reading.
  const py = yOf(ZOOM.z);
  ctx.fillStyle = XR.white; ctx.beginPath(); ctx.moveTo(x + 2, py); ctx.lineTo(x - 5, py - 5); ctx.lineTo(x - 5, py + 5); ctx.fill();
  ctx.fillRect(x + 4, py - 1, 14, 2);
  ctx.textAlign = 'center'; ctx.font = 'bold 13px ' + MONO; ctx.fillStyle = XR.white;
  ctx.fillText(zoomMag() + 'x', x + gw / 2, y + gh + 20);
  ctx.globalAlpha = 1; ctx.shadowOffsetX = osx; ctx.shadowOffsetY = osx;
}


// The race to the egg: you and the rival champions, by level.

// ---------------------------------------------------------------- bosses: telegraphs and ground hazards
function drawBossTells(e, x, y, r) {
  const pat = e.def.patterns[e.pat];
  if (pat === 'glare' && (e.st === 1 || e.st === 2) && e.glareA != null) {
    const L = 950 * S, cx = Math.cos(e.glareA), cy = Math.sin(e.glareA);
    if (e.st === 1) {
      ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 + 0.4 * Math.sin(G.realT * 20) ** 2) + ')'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cx * L, y + cy * L); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.globalCompositeOperation = 'lighter';
      for (const [lw, al] of [[34, 0.18], [14, 0.5], [4, 1]]) { ctx.globalAlpha = al; ctx.strokeStyle = PAL.danger; ctx.lineWidth = lw * S; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + cx * L, y + cy * L); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (pat === 'dash3' && e.st === 1) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * 420 * S, y + e.dashY * 420 * S); ctx.stroke(); ctx.setLineDash([]); }
  if (e.winded > G.t) { ctx.fillStyle = XR.white; ctx.font = `bold ${Math.round(14 * Math.max(0.8, S))}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText('z z z', x + Math.sin(G.realT * 3) * 6, y - r - 14); }
  if (pat === 'devour') { ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { const rr = ((G.realT * 0.8 + k / 3) % 1) * 290 * S; ctx.beginPath(); ctx.arc(x, y, 290 * S - rr, 0, TAU); ctx.stroke(); } }
}
function drawHazards(vis) {
  for (const h of G.hazards) {
    if (!vis(h)) continue;
    const x = sx(h.x), y = sy(h.y), r = h.r * S;
    if (h.warn > 0) {
      ctx.strokeStyle = PAL.danger; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.realT * 18) ** 2; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const a = Math.min(1, h.life / 0.5);
      ctx.globalAlpha = 0.3 * a; ctx.fillStyle = PAL.danger; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.8 * a; ctx.strokeStyle = PAL.danger; ctx.lineWidth = 2;
      for (let k = 0; k < 4; k++) { const an = G.realT * 0.9 + k * 1.6 + h.x, rr = r * (0.2 + ((k * 0.31 + G.realT * 0.4) % 0.7)); ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr, 2 + k % 3, 0, TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// The Petri Dish: the glass rim of the dish, printed graduations, and a faint agar ripple.
function drawDish() {
  const c = G.core, x = sx(c.x), y = sy(c.y), R = CORE.arena * S;
  ctx.globalAlpha = 0.85; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(3, 14 * S);
  ctx.beginPath(); ctx.arc(x, y, R + 30 * S, 0, TAU); ctx.stroke();
  ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1, 3 * S); ctx.beginPath(); ctx.arc(x, y, R + 50 * S, 0, TAU); ctx.stroke();
  // Outside the dish: the bench.
  ctx.globalAlpha = 0.55; ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); ctx.arc(x, y, R + 58 * S, 0, TAU, true); ctx.fill();
  ctx.globalAlpha = 0.5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.font = `${Math.max(9, 18 * S)}px ` + MONO; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  for (let i = 0; i < 72; i++) {
    const a = i / 72 * TAU, r0 = R + 30 * S, r1 = r0 - (i % 6 ? 14 : 34) * S;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke();
  }
  ctx.globalAlpha = 0.12; ctx.lineWidth = 1;
  for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(x, y, R * k / 5 + Math.sin(G.realT * 0.6 + k) * 6 * S, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- boss presence
// Under every boss: a dark halo so it looms, a ground sigil of counter-rotating rings (spinning faster as
// it enrages), and once it's angry, glowing cracks across its body.
function drawBossAura(e, x, y, r) {
  const ph = e.bphase || 0, t = G.realT, R = r * 1.9;
  ctx.save();
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#000000';
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3.2); g.addColorStop(0, 'rgba(0,0,0,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, TAU); ctx.fill();
  const col1 = ph ? '#ff3b3b' : '#ffffff', spd = 0.4 + ph * 0.5;
  ctx.strokeStyle = col1; ctx.lineWidth = 2; ctx.globalAlpha = 0.45 + 0.15 * ph;
  ctx.setLineDash([R * 0.18, R * 0.1]); ctx.lineDashOffset = -t * 40 * spd;
  ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.stroke();
  ctx.setLineDash([R * 0.06, R * 0.14]); ctx.lineDashOffset = t * 60 * spd;
  ctx.beginPath(); ctx.arc(x, y, R * 1.25, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  // Runic ticks round the outer ring.
  ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 0.3 * spd, r0 = R * 1.36, r1 = R * (i % 4 ? 1.44 : 1.55); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); }
  ctx.stroke();
  ctx.restore();
  if (ph) {
    // Enraged: cracks of light across the body (drawn as additive light, flickering).
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#ff3b3b'; ctx.lineWidth = 2 + ph; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 13);
    ctx.beginPath();
    for (let c = 0; c < 2 + ph * 2; c++) { let a = e.id * 1.3 + c * 2.1, qx = x, qy = y; ctx.moveTo(qx, qy); for (let i = 0; i < 4; i++) { a += Math.sin(e.id + c * 3 + i) * 0.7; qx += Math.cos(a) * r * 0.26; qy += Math.sin(a) * r * 0.26; ctx.lineTo(qx, qy); } }
    ctx.stroke(); ctx.restore();
  }
}

// ---------------------------------------------------------------- enemy variety
// Sperm-shaped enemies share a body, so each type gets its own build: head shape, tails, armour, fields.
const ENEMY_KEY = new Map(Object.entries(ENEMIES).map(([k, d]) => [d, k]));
const SPERM_LOOKS = {
  skitter:    { stretch: 1.5, head: 0.9, tailLen: 1.35, beat: 1.9 },
  wisp:       { head: 0.8, tailLen: 0.7, beat: 2.3, acro: 0.7 },
  blinker:    { field: 3, acro: 1.4, flicker: 1 },
  charger:    { head: 1.4, barb: 5, armour: 1, acro: 1.25, beat: 0.8 },
  phantom:    { tails: 2, tailLen: 1.25, field: 1, beat: 0.7 },
  juggernaut: { head: 1.45, armour: 4, tails: 3, cilia: 12, barb: 2, beat: 0.6 },
};
const LOOK_CACHE = {};
function enemyLook(e) {
  if (e.rival) return null;
  const k = ENEMY_KEY.get(e.def);
  if (!SPERM_LOOKS[k]) return null;
  return LOOK_CACHE[k] || (LOOK_CACHE[k] = Object.assign({}, NOLOOK, SPERM_LOOKS[k]));
}
// Extra detail drawn over each type's body, so no two look alike.
function drawEnemyDetail(e, x, y, r, rot) {
  const k = ENEMY_KEY.get(e.def), t = G.realT + e.id;
  if (!k || e.flash > 0) return;
  const halo = (w, a) => { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = w; ctx.stroke(); };
  switch (k) {
    case 'brute': { // Macrophage: pseudopods reaching out, and the dark remains of its meals
      ctx.fillStyle = mBody(e, 0.42);
      for (let i = 0; i < 5; i++) { const a = e.id + i * 1.26 + Math.sin(t * 0.8 + i) * 0.3, L = r * (1.05 + 0.18 * Math.sin(t * 1.3 + i * 2)); ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * L * 0.82, y + Math.sin(a) * L * 0.82, r * 0.34, r * 0.22, a, 0, TAU); ctx.fill(); halo(1.2, 0.45); }
      ctx.fillStyle = 'rgba(25,28,26,0.55)'; for (let i = 0; i < 4; i++) { const a = e.id * 2 + i * 1.7, d = r * 0.45; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * 0.1, 0, TAU); ctx.fill(); }
      break;
    }
    case 'splitter': { // Mitotic Cell: pinching in two, two nuclei pulled apart by spindle fibres
      const a = e.id * 0.7 + t * 0.2, ca = Math.cos(a), sa = Math.sin(a), d = r * (0.38 + 0.06 * Math.sin(t * 3));
      ctx.strokeStyle = 'rgba(25,28,26,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - sa * r * 0.9, y + ca * r * 0.9); ctx.quadraticCurveTo(x, y, x + sa * r * 0.9, y - ca * r * 0.9); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(x - ca * d, y - sa * d); ctx.quadraticCurveTo(x - sa * i * r * 0.12, y + ca * i * r * 0.12, x + ca * d, y + sa * d); } ctx.stroke();
      ctx.fillStyle = 'rgba(25,28,26,0.6)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(x + ca * d * s, y + sa * d * s, r * 0.2, 0, TAU); ctx.fill(); }
      break;
    }
    case 'splitling': ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(x + r * 0.15, y - r * 0.15, r * 0.25, 0, TAU); ctx.fill(); break;
    case 'bulwark': { // Mucus Wall: thick layered slime, oozing
      for (let i = 1; i <= 2; i++) { ctx.beginPath(); for (let j = 0; j <= 24; j++) { const a = j / 24 * TAU, rr = r * (1 + 0.16 * i + 0.05 * Math.sin(a * 4 + t * (1 + i * 0.4))); j ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } halo(2.2 - i * 0.6, 0.35 - i * 0.1); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1, a = e.id + i * 2.1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2 + ph * r * 0.8, 2 + 2 * (1 - ph), 0, TAU); ctx.fill(); }
      ctx.globalAlpha = e.phased ? 0.25 : e.def.ethereal ? 0.55 : 1;
      break;
    }
    case 'summoner': { // Mother Cell: buds swelling round the rim, bigger as the next brood nears
      const ripe = 1 - Math.max(0, Math.min(1, (e.shootCd || 0) / 5));
      ctx.fillStyle = mBody(e, 0.48);
      for (let i = 0; i < 6; i++) { const a = e.id + i * TAU / 6 + t * 0.15, br = r * (0.15 + 0.2 * ripe); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.02, y + Math.sin(a) * r * 1.02, br, 0, TAU); ctx.fill(); halo(1, 0.55); }
      break;
    }
    case 'lancer': { // Killer T-Cell: blades on its arms
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath();
      for (const s of [-1, 1]) { const a = rot - Math.PI / 2 + s * 0.55; ctx.moveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.lineTo(x + Math.cos(a) * r * 1.7, y + Math.sin(a) * r * 1.7); }
      ctx.stroke(); break;
    }
    case 'plasmod': { // Plasmodium: a pulsing vein network
      ctx.strokeStyle = 'rgba(25,28,26,0.45)'; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i < 6; i++) { let a = e.id + i * 1.05, qx = x, qy = y; ctx.moveTo(qx, qy); for (let j = 0; j < 4; j++) { a += Math.sin(i * 3 + j + t * 0.4) * 0.6; qx += Math.cos(a) * r * 0.2; qy += Math.sin(a) * r * 0.2; ctx.lineTo(qx, qy); } }
      ctx.stroke(); break;
    }
    case 'pepsinjr': { // Pepsinator Jr: fizzing with acid
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { const ph = (t * 0.7 + i / 6) % 1, a = e.id * 3 + i * 1.9; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5 - ph * r * 0.4, 1.5 + ph * 3, 0, TAU); ctx.stroke(); }
      break;
    }
    case 'bomber': { // Acid Bubble: a hot core that throbs faster the closer you are
      const d = Math.hypot(e.x - me().x, e.y - me().y), rate = d < 200 ? 14 : 5, k2 = 0.5 + 0.5 * Math.sin(t * rate);
      ctx.fillStyle = `rgba(255,255,255,${(0.35 + 0.45 * k2).toFixed(2)})`; ctx.beginPath(); ctx.arc(x, y, r * (0.28 + 0.12 * k2), 0, TAU); ctx.fill();
      break;
    }
    case 'medic': { // Nurse Cell: a halo that pulses when it heals
      ctx.setLineDash([4, 5]); ctx.lineDashOffset = -t * 20; ctx.beginPath(); ctx.arc(x, y, r * 1.45, 0, TAU); halo(1.5, 0.55); ctx.setLineDash([]);
      break;
    }
    case 'warlock': { // Cytokine Caster: motes orbiting, an inner star turning the other way
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 3; i++) { const a = -t * 2.4 + i * TAU / 3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.5, y + Math.sin(a) * r * 1.5, 2.5, 0, TAU); ctx.fill(); }
      drawShape('star', x, y, r * 0.45, -t * 1.5); ctx.fillStyle = 'rgba(25,28,26,0.5)'; ctx.fill();
      break;
    }
    case 'spire': { // Enzyme Spire: crystal facets and a turning inner hex
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const a = rot + i * TAU / 6; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke();
      drawShape('hex', x, y, r * 0.45, -t); halo(2, 0.7);
      break;
    }
  }
}

// Introductions: a stage spotlight on whoever is being introduced. The rest of the slide dims, and a beam
// of light comes down on them from above, fading in over the first half second.
function drawIntroSpot(I, shx, shy) {
  const k = Math.min(1, I.t / 0.5), ents = [I.e, I.e.twin].filter(Boolean);
  for (const e of ents) {
    const x = sx(e.x) + shx, y = sy(e.y) + shy, r = (e.r * 2.2 + 40) * S;
    // Dim everything outside the pool of light.
    if (e === I.e) {
      const g = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 1.9);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${(0.7 * k).toFixed(3)})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // The beam and the pool.
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * k;
    const top = Math.max(-40, y - H * 0.6), bw = r * 0.35;
    const bg = ctx.createLinearGradient(0, top, 0, y);
    bg.addColorStop(0, 'rgba(255,250,230,0)'); bg.addColorStop(1, 'rgba(255,250,230,0.22)');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(x - bw, top); ctx.lineTo(x + bw, top); ctx.lineTo(x + r, y); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fill();
    const pg = ctx.createRadialGradient(x, y, 0, x, y, r);
    pg.addColorStop(0, 'rgba(255,250,230,0.35)'); pg.addColorStop(0.7, 'rgba(255,250,230,0.12)'); pg.addColorStop(1, 'rgba(255,250,230,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.9, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
}

// Lights Out: a darkness layer with holes cut where there's light (you, and anything on fire).
const DARK = { c: null, puff: null };
function drawDarkness(p, shx, shy) {
  const dw = Math.ceil(W / 2), dh = Math.ceil(H / 2);
  if (!DARK.c || DARK.c.width !== dw || DARK.c.height !== dh) DARK.c = makeCanvas(dw, dh);
  if (!DARK.puff) { DARK.puff = makeCanvas(64, 64); const q = DARK.puff.getContext('2d'), gr = q.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(0, 0, 64, 64); }
  const g = DARK.c.getContext('2d');
  g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(2,2,6,0.94)'; g.fillRect(0, 0, dw, dh);
  g.globalCompositeOperation = 'destination-out';
  const hole = (wx, wy, r) => { const x = (sx(wx) + shx) / 2, y = (sy(wy) + shy) / 2, rr = r * S / 2; if (x < -rr || y < -rr || x > dw + rr || y > dh + rr) return false; g.drawImage(DARK.puff, x - rr, y - rr, rr * 2, rr * 2); return true; };
  hole(p.x, p.y, 230);
  // Introductions: whoever is being introduced is always lit, even in the dark.
  const I = G.state === 'bossIntro' && G.bossIntro;
  if (I) for (const b of [I.e, I.e.twin].filter(Boolean)) hole(b.x, b.y, b.r * 3 + 90);
  let lit = 0;
  for (const e of G.enemies) if (!e.dead && e.burn > 0 && hole(e.x, e.y, e.r * 2 + 70)) lit++;
  for (const pr of G.proj) if (!pr.dead && (pr.style === 'flame' || (pr.src && pr.src.elem === 'fire')) && hole(pr.x, pr.y, 60)) lit++;
  for (const z of G.zones) if (z.elem === 'fire' && hole(z.x, z.y, z.r * 1.8)) lit++;
  for (const f of G.fx) if (f.type === 'flash' && hole(f.x, f.y, f.r * 1.6 * (f.life / f.max))) lit++;
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(DARK.c, 0, 0, W, H);
  if (lit >= 3) quirkFound('firelight');
}
