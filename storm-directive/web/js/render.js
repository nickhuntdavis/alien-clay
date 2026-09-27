'use strict';
// Storm Directive - rendering: parallax space, lit arena floor, decals, dynamic lights, shadows,
// shaded entities, glow sprites, the Chrono Anchor and towers, rifts, echoes, rewind effect, HUD, minimap.

function sx(x) { return (x - cam.x) * S + W / 2; }
function sy(y) { return (y - cam.y) * S + H / 2; }

// ---------------------------------------------------------------- cached sprites
const SPR = { glow: new Map(), layers: null, vignette: null, vigKey: '' };

function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// Soft radial glow in a colour, drawn additively for cheap bloom.
function glowSprite(color) {
  let c = SPR.glow.get(color);
  if (c) return c;
  c = makeCanvas(64, 64);
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, color); gr.addColorStop(0.25, color + 'aa'); gr.addColorStop(1, color + '00');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  SPR.glow.set(color, c);
  return c;
}
function glow(x, y, r, color, alpha) {
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(glowSprite(color), x - r, y - r, r * 2, r * 2);
}

// Tileable parallax layers: nebula clouds (far) and two star fields.
function buildLayers() {
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const T = 512, D = Math.min(2, DPR);
  const neb = makeCanvas(T, T), ng = neb.getContext('2d');
  const blobs = ['#3a0ca3', '#7209b7', '#1b3a8a', '#0b525b', '#560bad', '#3f37c9'];
  for (let i = 0; i < 16; i++) {
    const x = rnd() * T, y = rnd() * T, r = 60 + rnd() * 170, c = blobs[i % blobs.length];
    for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) {
      const gr = ng.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, c + '38'); gr.addColorStop(1, c + '00');
      ng.fillStyle = gr; ng.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
  const stars = (n, big, tint) => {
    const c = makeCanvas(T * D, T * D), g = c.getContext('2d');
    g.scale(D, D);
    for (let i = 0; i < n; i++) {
      const x = rnd() * T, y = rnd() * T, s = (big ? 0.8 + rnd() * 1.6 : 0.4 + rnd() * 0.8);
      const col = tint[Math.floor(rnd() * tint.length)];
      g.globalAlpha = 0.35 + rnd() * 0.6; g.fillStyle = col;
      g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
      if (big && rnd() < 0.25) { g.globalAlpha = 0.25; g.fillRect(x - s * 4, y - 0.4, s * 8, 0.8); g.fillRect(x - 0.4, y - s * 4, 0.8, s * 8); }
    }
    return c;
  };
  SPR.layers = [
    { f: 0.06, img: neb, T },
    { f: 0.18, img: stars(160, false, ['#aab4ff', '#ffffff', '#c7b8ff']), T },
    { f: 0.4, img: stars(45, true, ['#ffffff', '#9ef0ff', '#ffd6ff', '#ffe8a3']), T },
  ];
}

function buildVignette() {
  const key = W + 'x' + H;
  if (SPR.vigKey === key) return;
  SPR.vigKey = key;
  const c = makeCanvas(Math.ceil(W / 2), Math.ceil(H / 2)), g = c.getContext('2d');
  const gr = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.35, c.width / 2, c.height / 2, Math.hypot(c.width, c.height) * 0.55);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.62)');
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
    default: ctx.arc(x, y, r, 0, TAU);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------- background & floor
function drawBackground() {
  if (!SPR.layers) buildLayers();
  ctx.fillStyle = '#05040b';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  for (const L of SPR.layers) {
    const T = L.T;
    const ox = -((((cam.x * S * L.f) % T) + T) % T), oy = -((((cam.y * S * L.f) % T) + T) % T);
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
  // Arena floor: a lit disc of the Anchor's field with a hex-ish grid, dark void beyond.
  const core = G.core, cx = sx(core.x), cy = sy(core.y), R = CORE.arena * S;
  const fl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  fl.addColorStop(0, 'rgba(70,50,150,0.30)'); fl.addColorStop(0.35, 'rgba(40,30,100,0.20)'); fl.addColorStop(0.95, 'rgba(20,20,60,0.12)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  // Grid, clipped to the arena.
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  const gs = 64, x0 = cam.x - W / 2 / S, y0 = cam.y - H / 2 / S;
  ctx.strokeStyle = 'rgba(110,120,220,0.10)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = Math.floor(x0 / gs) * gs; gx < x0 + W / S + gs; gx += gs) { const x = sx(gx); ctx.moveTo(x, 0); ctx.lineTo(x, H); }
  for (let gy = Math.floor(y0 / gs) * gs; gy < y0 + H / S + gs; gy += gs) { const y = sy(gy); ctx.moveTo(0, y); ctx.lineTo(W, y); }
  ctx.stroke();
  // Pulse rings travelling out from the Anchor.
  for (let k = 0; k < 3; k++) {
    const rr = ((G.realT * 0.12 + k / 3) % 1) * CORE.arena;
    ctx.strokeStyle = `rgba(125,249,255,${0.07 * (1 - rr / CORE.arena)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, rr * S, 0, TAU); ctx.stroke();
  }
  ctx.restore();
  // Void beyond the arena edge.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.rect(-20, -20, W + 40, H + 40); ctx.arc(cx, cy, R, 0, TAU, true); ctx.fill();
  ctx.setLineDash([10, 8]); ctx.lineDashOffset = -G.realT * 20;
  ctx.strokeStyle = 'rgba(125,249,255,0.35)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  // Sanctuary ring.
  ctx.strokeStyle = 'rgba(128,255,219,0.18)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, CORE.sanctuary * S, 0, TAU); ctx.stroke();
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
    ctx.globalAlpha = a * 0.8;
    ctx.drawImage(spr, x - r, y - r * 0.8, r * 2, r * 1.6);
    if (d.color !== '#000') {
      ctx.globalAlpha = a * 0.22; ctx.fillStyle = d.color;
      for (let i = 0; i < 4; i++) { const an = d.rot + i * 1.7, rr = r * (0.25 + (i % 2) * 0.3); ctx.beginPath(); ctx.arc(x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.8, 1.5 + (i % 3), 0, TAU); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- Anchor, pads, towers, rifts
function drawCore() {
  const c = G.core, x = sx(c.x), y = sy(c.y), r = c.r * S, t = G.realT;
  ctx.globalCompositeOperation = 'lighter';
  glow(x, y, r * 5, c.flash > 0 ? '#ff4d6d' : '#7df9ff', 0.35 + Math.sin(t * 2) * 0.08);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // Shadow and platform.
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x + 4, y + 10, r * 1.9, r * 1.2, 0, 0, TAU); ctx.fill();
  const pg = ctx.createLinearGradient(x, y - r * 1.6, x, y + r * 1.6);
  pg.addColorStop(0, '#2b2f55'); pg.addColorStop(1, '#0d0f22');
  ctx.fillStyle = pg; drawShape('oct', x, y, r * 1.6, 0); ctx.fill();
  ctx.strokeStyle = '#4a5390'; ctx.lineWidth = 2; ctx.stroke();
  // Rotating rune rings.
  ctx.lineWidth = 3;
  for (let k = 0; k < 2; k++) {
    const rr = r * (1.25 + k * 0.4), dir = k ? -1 : 1;
    ctx.strokeStyle = k ? 'rgba(199,125,255,0.8)' : 'rgba(125,249,255,0.85)';
    for (let i = 0; i < 6; i++) { const a0 = t * 0.8 * dir + i / 6 * TAU; ctx.beginPath(); ctx.arc(x, y, rr, a0, a0 + 0.6); ctx.stroke(); }
  }
  // Crystal.
  const pulse = 1 + Math.sin(t * 3) * 0.06;
  const cg = ctx.createLinearGradient(x - r * 0.6, y - r, x + r * 0.6, y + r);
  cg.addColorStop(0, '#e0fbff'); cg.addColorStop(0.5, c.flash > 0 ? '#ff4d6d' : '#7df9ff'); cg.addColorStop(1, '#3a0ca3');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(x, y - r * 1.05 * pulse); ctx.lineTo(x + r * 0.55, y); ctx.lineTo(x, y + r * 0.85 * pulse); ctx.lineTo(x - r * 0.55, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  // Integrity ring.
  const k = c.hp / c.maxHp;
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, TAU); ctx.stroke();
  ctx.strokeStyle = k < 0.3 ? '#ff4d6d' : '#80ffdb'; ctx.beginPath(); ctx.arc(x, y, r * 2.2, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
}

function drawPadsAndTowers(vis) {
  const sel = typeof UI !== 'undefined' ? UI.selPad : null, showPads = typeof UI !== 'undefined' && UI.buildOpen;
  for (const pad of G.pads) {
    if (!vis(pad)) continue;
    const x = sx(pad.x), y = sy(pad.y), r = 20 * S, t = pad.tower;
    if (!t) {
      ctx.fillStyle = 'rgba(20,24,50,0.55)'; drawShape('hex', x, y, r, 0); ctx.fill();
      ctx.strokeStyle = showPads ? '#ffd23f' : 'rgba(125,249,255,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(125,249,255,0.35)'; ctx.fillRect(x - 5 * S, y - 1, 10 * S, 2); ctx.fillRect(x - 1, y - 5 * S, 2, 10 * S);
      continue;
    }
    const d = TOWERS[t.type], st = towerStats(t);
    if (sel === pad.id) { ctx.strokeStyle = d.color + '88'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(x, y, st.range * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    if (t.type === 'stasis') { ctx.fillStyle = 'rgba(184,192,255,0.07)'; ctx.beginPath(); ctx.arc(x, y, st.range * S, 0, TAU); ctx.fill(); }
    // Shadow, base.
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(x + 3, y + 8, r * 1.1, r * 0.7, 0, 0, TAU); ctx.fill();
    const bg = ctx.createLinearGradient(x, y - r, x, y + r); bg.addColorStop(0, '#3a3f6b'); bg.addColorStop(1, '#14162e');
    ctx.fillStyle = bg; drawShape('oct', x, y, r, 0); ctx.fill();
    ctx.strokeStyle = d.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * (1.6 + (t.flash > 0 ? 0.8 : 0)), d.color, 0.35); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = d.color; ctx.strokeStyle = d.color;
    switch (t.type) {
      case 'cannon': case 'mortar': {
        ctx.save(); ctx.translate(x, y); ctx.rotate(t.face);
        const len = t.type === 'cannon' ? 18 : 11, wid = t.type === 'cannon' ? 5 : 10;
        ctx.fillRect(0, -wid / 2 * S, len * S * (t.flash > 0 ? 0.8 : 1), wid * S);
        ctx.beginPath(); ctx.arc(0, 0, 8 * S, 0, TAU); ctx.fill();
        ctx.restore(); break;
      }
      case 'tesla':
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x, y - (i * 6) * S, (8 - i * 2) * S, 0, TAU); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(x, y - 18 * S, 4 * S, 0, TAU); ctx.fill();
        break;
      case 'cryo': drawShape('diamond', x, y - 4 * S, 12 * S, 0); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); break;
      case 'stasis':
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 10 * S, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face) * 9 * S, y + Math.sin(t.face) * 9 * S); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face / 12) * 6 * S, y + Math.sin(t.face / 12) * 6 * S); ctx.stroke();
        break;
      case 'beacon': { const pl = 1 + Math.sin(G.realT * 4) * 0.15; ctx.fillRect(x - 3 * S * pl, y - 10 * S * pl, 6 * S * pl, 20 * S * pl); ctx.fillRect(x - 10 * S * pl, y - 3 * S * pl, 20 * S * pl, 6 * S * pl); break; }
    }
    for (let i = 0; i < t.lvl; i++) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x - 8 * S + i * 8 * S, y + r + 5, 2.5, 0, TAU); ctx.fill(); }
  }
}

function drawRifts() {
  const core = G.core;
  for (const r of G.rifts) {
    const x = sx(r.x), y = sy(r.y), t = G.realT;
    const open = r.warn > 0 ? 1 - r.warn / SIEGE_WARN : Math.max(0, 1 - r.close / 1.5);
    // Lane towards the Anchor.
    ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 60;
    ctx.strokeStyle = `rgba(199,125,255,${0.25 * open})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx(core.x), sy(core.y)); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y, 90 * S * open, '#9d4edd', 0.6);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#05000d'; ctx.beginPath(); ctx.ellipse(x, y, 34 * S * open, 44 * S * open, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = 3;
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = k % 2 ? '#c77dff' : '#ff3df2';
      const a0 = t * (2 + k * 0.6) * (k % 2 ? -1 : 1);
      ctx.beginPath(); ctx.ellipse(x, y, (20 + k * 7) * S * open, (28 + k * 8) * S * open, 0, a0, a0 + 2.2); ctx.stroke();
    }
    if (r.warn > 0) { ctx.fillStyle = '#ffd6ff'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Math.ceil(r.warn) + '', x, y + 4); }
  }
}

// Weapon visuals that belong to an origin (player or echo): drones, orbit blades, beams.
function drawWeaponFx(weapons, ox, oy, alpha) {
  const px = sx(ox), py = sy(oy);
  ctx.globalAlpha = alpha;
  for (const w of weapons) {
    if (!w) continue;
    if (w.def.drones) {
      for (let i = 0; i < w.s.count; i++) {
        const a = G.realT * 1.6 + i / w.s.count * TAU, rr = 42 + (w.s.count > 2 ? 10 : 0);
        const x = px + Math.cos(a) * rr * S, y = py + Math.sin(a) * rr * S;
        glow(x, y, 14 * S, w.def.color, 0.5 * alpha); ctx.globalAlpha = alpha;
        ctx.fillStyle = w.def.color; drawShape('diamond', x, y, 7 * S, 0); ctx.fill();
      }
    }
    if (w.blades.length) {
      for (let i = 0; i < w.blades.length; i += 3) {
        const x = sx(w.blades[i]), y = sy(w.blades[i + 1]);
        glow(x, y, w.s.size * 2 * S, w.def.color, 0.35 * alpha); ctx.globalAlpha = alpha;
        ctx.save(); ctx.translate(x, y); ctx.rotate(w.blades[i + 2] + G.realT * 8);
        ctx.fillStyle = w.def.color; ctx.fillRect(-w.s.size * S, -2.5 * S, w.s.size * 2 * S, 5 * S); ctx.fillRect(-2.5 * S, -w.s.size * 0.6 * S, 5 * S, w.s.size * 1.2 * S);
        ctx.restore();
      }
    }
    if (w.beams.length && w.beamT > 0) {
      for (const b of w.beams) {
        const L = w.s.range * S, x2 = px + Math.cos(b.a) * L, y2 = py + Math.sin(b.a) * L, fl = 0.8 + Math.random() * 0.4;
        ctx.strokeStyle = w.def.color; ctx.globalAlpha = 0.25 * alpha; ctx.lineWidth = w.s.size * 4 * S * fl; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = 0.5 * alpha; ctx.lineWidth = w.s.size * 1.8 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.globalAlpha = alpha; ctx.strokeStyle = '#fff'; ctx.lineWidth = w.s.size * 0.6 * S; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x2, y2); ctx.stroke();
        glow(x2, y2, w.s.size * 5 * S, w.def.color, 0.6 * alpha);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawShip(x, y, face, bodyColor, alpha, scale) {
  const k = S * (scale || 1);
  ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  // Two-tone hull for a bevelled look.
  ctx.fillStyle = bodyColor;
  ctx.beginPath(); ctx.moveTo(16 * k, 0); ctx.lineTo(-10 * k, -10 * k); ctx.lineTo(-5 * k, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(bodyColor);
  ctx.beginPath(); ctx.moveTo(16 * k, 0); ctx.lineTo(-10 * k, 10 * k); ctx.lineTo(-5 * k, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(16 * k, 0); ctx.lineTo(-10 * k, 10 * k); ctx.lineTo(-5 * k, 0); ctx.lineTo(-10 * k, -10 * k); ctx.closePath(); ctx.stroke();
  ctx.fillStyle = '#e0fbff'; ctx.beginPath(); ctx.ellipse(4 * k, 0, 4 * k, 2.2 * k, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
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
  drawBackground();
  const p = G.player;
  const vx0 = cam.x - W / 2 / S - 90, vx1 = cam.x + W / 2 / S + 90, vy0 = cam.y - H / 2 / S - 90, vy1 = cam.y + H / 2 / S + 90;
  const vis = o => o.x > vx0 && o.x < vx1 && o.y > vy0 && o.y < vy1;

  drawDecals(vis);
  // Dynamic lights pooling on the floor.
  ctx.globalCompositeOperation = 'lighter';
  for (const l of G.lights) if (vis(l)) glow(sx(l.x), sy(l.y), l.r * S, l.color, 0.35 * (l.life / l.max));
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;

  // Zones.
  for (const z of G.zones) {
    if (!vis(z)) continue;
    const a = Math.min(1, z.life / 0.4);
    const x = sx(z.x), y = sy(z.y), r = z.r * S;
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y, r * 1.1, z.color, 0.35 * a);
    ctx.globalCompositeOperation = 'source-over';
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
  drawPadsAndTowers(vis);
  drawRifts();

  // Gems and scrap.
  ctx.globalCompositeOperation = 'lighter';
  for (const g of G.gems) {
    if (!vis(g)) continue;
    const col = g.kind === 's' ? '#ffb400' : g.v >= 20 ? '#ffd23f' : g.v >= 5 ? '#80ffdb' : '#4cc9f0';
    glow(sx(g.x), sy(g.y), (g.v >= 5 ? 14 : 9) * S, col, 0.5);
  }
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
  // Pickups.
  for (const u of G.pickups) {
    if (!vis(u)) continue;
    const d = POWERUPS[u.type], x = sx(u.x), y = sy(u.y) + Math.sin(u.bob) * 3, r = 13 * S;
    if (u.life < 5 && Math.floor(u.life * 6) % 2) continue;
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 2.6, d.color, 0.6); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 2, sy(u.y) + r + 4, r * 0.8, r * 0.3, 0, 0, TAU); ctx.fill();
    drawShape('hex', x, y, r, 0); ctx.fillStyle = '#111'; ctx.fill(); ctx.strokeStyle = d.color; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = d.color; ctx.font = `bold ${Math.round(14 * S)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
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
      if (!on) { ctx.globalCompositeOperation = 'lighter'; glow(x, y, 16 * S, pr.color, 0.6); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
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
    ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face) * 16 * S, y + Math.sin(t.face) * 16 * S); ctx.lineWidth = 4; ctx.stroke();
  }

  // Enemy drop shadows, batched.
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  for (const e of G.enemies) {
    if (!vis(e) || e.phased) continue;
    const x = sx(e.x) + 3, y = sy(e.y) + e.r * S * 0.75, r = e.r * S;
    ctx.moveTo(x + r, y); ctx.ellipse(x, y, r, r * 0.45, 0, 0, TAU);
  }
  ctx.fill();
  // Elite, boss and siege auras.
  ctx.globalCompositeOperation = 'lighter';
  for (const e of G.enemies) {
    if (!vis(e)) continue;
    if (e.boss) glow(sx(e.x), sy(e.y), e.r * 3.2 * S, e.color, 0.5);
    else if (e.elite) glow(sx(e.x), sy(e.y), e.r * 2.6 * S, '#ffd23f', 0.35);
    else if (e.siege) glow(sx(e.x), sy(e.y), e.r * 2.2 * S, '#9d4edd', 0.3);
    if (e.burn > 0) glow(sx(e.x), sy(e.y), e.r * 2 * S, '#ff7a2f', 0.3);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  // Enemies.
  for (const e of G.enemies) {
    if (!vis(e)) continue;
    const squash = 1 + Math.max(0, e.flash) * 2;
    const x = sx(e.x), y = sy(e.y), r = e.r * S * squash;
    ctx.globalAlpha = e.phased ? 0.25 : 1;
    if (e.def.ai === 'charge' && e.st === 1) { ctx.strokeStyle = 'rgba(241,91,181,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + e.dashX * 250 * S, y + e.dashY * 250 * S); ctx.stroke(); }
    if (e.aimT > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.8 - e.aimT) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(e.aimA) * 700 * S, y + Math.sin(e.aimA) * 700 * S); ctx.stroke(); }
    const rot = e.age * (e.def.shape === 'spike' ? 3 : 1) + (e.def.shape === 'tri' ? Math.atan2(G.player.y - e.y, G.player.x - e.x) : 0);
    if (e.def.shape === 'eye') {
      const eg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      eg.addColorStop(0, '#5a1a8e'); eg.addColorStop(1, '#14002a');
      ctx.fillStyle = e.flash > 0 ? '#fff' : eg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = e.color; ctx.lineWidth = 4; ctx.stroke();
      const la = Math.atan2(G.player.y - e.y, G.player.x - e.x);
      ctx.fillStyle = '#ff3df2'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.4, y + Math.sin(la) * r * 0.4, r * 0.35, 0, TAU); ctx.fill();
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + Math.cos(la) * r * 0.5, y + Math.sin(la) * r * 0.5, r * 0.15, 0, TAU); ctx.fill();
    } else {
      drawShape(e.def.shape, x, y, r, rot);
      ctx.fillStyle = e.flash > 0 ? '#ffffff' : e.frozen > 0 ? '#bde0fe' : e.color;
      ctx.fill();
      // Lower-right shading and top-left highlight give each body volume.
      if (e.flash <= 0) {
        ctx.save(); ctx.clip();
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.arc(x + r * 0.75, y + r * 0.8, r * 0.95, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.4, r * 0.42, 0, TAU); ctx.fill();
        ctx.restore();
        drawShape(e.def.shape, x, y, r, rot);
      }
      ctx.lineWidth = e.elite || e.boss ? 3 : 1.5;
      ctx.strokeStyle = e.elite ? '#ffd23f' : e.boss ? '#fff' : e.siege ? '#c77dff' : 'rgba(0,0,0,0.6)';
      ctx.stroke();
    }
    let si = 0;
    const st = c => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 3 + si * 3, 0, TAU); ctx.stroke(); si++; };
    if (e.burn > 0) st('#ff7a2f');
    if (e.chill > 0) st('#6fd8ff');
    if (e.poison > 0) st('#8dff4a');
    if (e.shock > 0) st('#ffe94a');
    if (e.mark > 0) st('#c77dff');
    if (e.stasisT > G.realT) st('rgba(184,192,255,0.7)');
    if ((e.auraArm > 0 || e.armour >= 8) && !e.boss) { ctx.strokeStyle = '#8da9c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r + 1, -2.4, -0.7); ctx.stroke(); }
    if ((e.elite || e.hp < e.maxHp) && !e.boss && e.maxHp > 30) {
      const bw = Math.max(18, r * 2);
      ctx.fillStyle = '#000'; ctx.fillRect(x - bw / 2, y - r - 8, bw, 3);
      ctx.fillStyle = e.elite ? '#ffd23f' : '#ff4d6d'; ctx.fillRect(x - bw / 2, y - r - 8, bw * Math.max(0, e.hp / e.maxHp), 3);
    }
  }
  ctx.globalAlpha = 1;

  // Paradox echoes: translucent ghosts with afterimages.
  for (const echo of G.echoes) {
    const fade = Math.min(1, (echo.dur - echo.t) / 0.6, echo.t / 0.3);
    const x = sx(echo.x), y = sy(echo.y), face = Math.hypot(echo.vx, echo.vy) > 10 ? Math.atan2(echo.vy, echo.vx) : echo.face;
    echo.face = face;
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y, 40 * S, '#7df9ff', 0.45 * fade);
    ctx.globalCompositeOperation = 'source-over';
    for (let k = 3; k >= 1; k--) {
      const ex = echo.x - echo.vx * 0.05 * k, ey = echo.y - echo.vy * 0.05 * k;
      drawShip(sx(ex), sy(ey), face, '#7df9ff', 0.12 * fade * (4 - k));
    }
    drawShip(x, y, face, '#7df9ff', 0.6 * fade);
    drawWeaponFx(echo.weapons, echo.x, echo.y, 0.6 * fade);
    ctx.globalAlpha = fade; ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 22 * S, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, 1 - echo.t / echo.dur)); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Player.
  const px = sx(p.x), py = sy(p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(px + 3, py + 12 * S, 13 * S, 6 * S, 0, 0, TAU); ctx.fill();
  if (G.barrier > 0) { ctx.strokeStyle = 'rgba(72,202,228,0.8)'; ctx.fillStyle = 'rgba(72,202,228,0.10)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, G.barrierR * S, 0, TAU); ctx.fill(); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  glow(px, py, 34 * S, G.rage > 0 ? '#ff924c' : '#3cf0ff', 0.45);
  // Engine plume.
  const sp = Math.hypot(p.vx, p.vy);
  if (sp > 15 && !rewinding) {
    const ba = p.face + Math.PI;
    glow(px + Math.cos(ba) * 12 * S, py + Math.sin(ba) * 12 * S, (8 + sp / 20) * S, '#ff9e00', 0.7);
    if (Math.random() < 0.6) spawnPart(p.x + Math.cos(ba) * 10, p.y + Math.sin(ba) * 10, Math.random() < 0.5 ? '#ff9e00' : '#3cf0ff', 1, 40, 0.35, 2.5);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (G.shieldT > 0) { ctx.strokeStyle = '#48cae4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.stroke(); }
  drawShip(px, py, p.face, p.flash > 0 ? '#ff4d6d' : '#3cf0ff', p.iframes > 0 && Math.floor(G.realT * 20) % 2 ? 0.4 : 1);
  ctx.fillStyle = '#000'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S, 4);
  ctx.fillStyle = p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S * (p.hp / G.P.maxHp), 4);

  // Additive layer: weapon fx, projectiles, particles, fx.
  ctx.globalCompositeOperation = 'lighter';
  drawWeaponFx(G.weapons, p.x, p.y, 1);
  for (const pr of G.proj) {
    if (pr.mine || !vis(pr)) continue;
    const x = sx(pr.x), y = sy(pr.y);
    if (pr.lob) {
      const yy = y - (pr.h || 0) * S;
      glow(x, yy, 16 * S, pr.color, 0.8); ctx.globalAlpha = 1;
      ctx.fillStyle = pr.color; ctx.beginPath(); ctx.arc(x, yy, 6 * S, 0, TAU); ctx.fill();
      continue;
    }
    const a = Math.atan2(pr.vy, pr.vx), r = pr.r * S;
    if (pr.style !== 'flame') glow(x, y, Math.max(8, r * 3.2), pr.color, 0.55);
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
      case 'rocket': case 'missile':
        ctx.lineWidth = r * 1.2; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * r * 2.4, y - Math.sin(a) * r * 2.4); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke();
        if (Math.random() < 0.5 && !rewinding) spawnPart(pr.x - pr.vx * 0.02, pr.y - pr.vy * 0.02, '#ff9e00', 1, 20, 0.25, 2);
        break;
      default: ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }
  for (const q of G.parts) {
    if (!vis(q)) continue;
    ctx.globalAlpha = Math.max(0, q.life / q.max);
    ctx.fillStyle = q.color;
    const s = q.size * S;
    ctx.fillRect(sx(q.x) - s / 2, sy(q.y) - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
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
      ctx.globalAlpha = 0.8; ctx.strokeStyle = '#7df9ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, rr, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k)); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Enemy bullets on top: glow, coloured body and white-hot core.
  const byColor = {};
  for (const b of G.ebul) { if (!vis(b)) continue; (byColor[b.color] || (byColor[b.color] = [])).push(b); }
  for (const c in byColor) { const spr = glowSprite(c); for (const b of byColor[c]) { const r = b.r * 3.4 * S; ctx.drawImage(spr, sx(b.x) - r, sy(b.y) - r, r * 2, r * 2); } }
  ctx.globalCompositeOperation = 'source-over';
  for (const c in byColor) {
    ctx.fillStyle = c; ctx.beginPath();
    for (const b of byColor[c]) { const x = sx(b.x), y = sy(b.y), r = (b.r + 1.5) * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
  }
  ctx.fillStyle = '#fff'; ctx.beginPath();
  for (const b of G.ebul) { if (!vis(b)) continue; const x = sx(b.x), y = sy(b.y), r = b.r * 0.5 * S; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
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

  // Screen-space post effects.
  buildVignette();
  ctx.drawImage(SPR.vignette, 0, 0, W, H);
  if (G.warp > 0) { ctx.fillStyle = 'rgba(120,130,255,0.08)'; ctx.fillRect(0, 0, W, H); }
  if (p.flash > 0) { ctx.globalAlpha = p.flash / 0.2 * 0.5; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (p.hp / G.P.maxHp < 0.3) { ctx.globalAlpha = 0.25 + Math.sin(G.realT * 6) * 0.1; ctx.fillStyle = '#ff0033'; drawEdgeFlash(); ctx.globalAlpha = 1; }
  if (rewinding) drawRewindFx();
  drawHud();
}

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
    ctx.fillStyle = `rgba(125,249,255,${0.08 + i * 0.03})`; ctx.fillRect(0, y, W, h);
    try { ctx.drawImage(cv, 0, y * DPR, cv.width, h * DPR, 8 + i * 6, y, W, h); } catch (e) { /* ignore */ }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.min(44, W / 9)}px sans-serif`;
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText('<< REWIND', W / 2 + 3, H * 0.42 + 3);
  ctx.fillStyle = Math.floor(t * 6) % 2 ? '#7df9ff' : '#e0fbff'; ctx.fillText('<< REWIND', W / 2, H * 0.42);
  ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#e0fbff';
  ctx.fillText(r.auto ? 'Fatal timeline detected. Your future self stays behind.' : 'Your future self becomes a Paradox Echo.', W / 2, H * 0.42 + 36);
}

function drawTitleBackdrop() {
  if (!SPR.layers) buildLayers();
  const t = performance.now() / 1000;
  for (const L of SPR.layers) {
    const T = L.T, ox = -(((t * 40 * L.f) % T) + T) % T, oy = -(((t * 15 * L.f) % T) + T) % T;
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
}

// ---------------------------------------------------------------- HUD (canvas part)
function drawHud() {
  const p = G.player, top = UI.safeTop || 0;
  // XP bar.
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, top, W, 7);
  const xg = ctx.createLinearGradient(0, 0, W, 0); xg.addColorStop(0, '#4cc9f0'); xg.addColorStop(1, '#c77dff');
  ctx.fillStyle = xg; ctx.fillRect(0, top, W * Math.min(1, G.xp / G.xpNeed), 7);
  const hw = Math.min(200, W * 0.34);
  const bar = (y, k, col, label) => {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(10, y, hw, 13);
    ctx.fillStyle = col; ctx.fillRect(10, y, hw * clamp(k, 0, 1), 13);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(10, y, hw * clamp(k, 0, 1), 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(10, y, hw, 13);
    ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    ctx.fillText(label, 15, y + 7);
  };
  bar(top + 13, p.hp / G.P.maxHp, p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926', `HP ${Math.ceil(p.hp)} / ${G.P.maxHp}`);
  const c = G.core;
  bar(top + 30, c.hp / c.maxHp, c.hp / c.maxHp < 0.3 ? '#ff4d6d' : '#48cae4', `ANCHOR ${Math.ceil(c.hp)} / ${c.maxHp}`);
  ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#fff'; ctx.fillText(`LV ${G.level}`, 10, top + 55);
  ctx.fillStyle = '#ff8fab'; ctx.fillText(`${G.kills} kills`, 56, top + 55);
  ctx.fillStyle = '#ffb400'; ctx.fillText(`${Math.floor(G.scrap)} scrap`, 10, top + 72);
  ctx.textAlign = 'center'; ctx.fillStyle = G.state === 'rewind' ? '#7df9ff' : '#fff'; ctx.font = 'bold 18px sans-serif';
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  ctx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, top + 24);
  // Siege countdown.
  const toSiege = G.nextSiege - G.t;
  ctx.font = 'bold 11px sans-serif';
  if (G.rifts.length) { ctx.fillStyle = '#c77dff'; ctx.fillText('SIEGE IN PROGRESS', W / 2 + 20, top + 72); }
  else if (toSiege < 20) { ctx.fillStyle = '#c77dff'; ctx.fillText(`SIEGE IN ${Math.ceil(toSiege)}s`, W / 2 + 20, top + 72); }
  // Status chips.
  const chips = [];
  if (G.rage > 0) chips.push(['OVERDRIVE', '#ff924c']);
  if (G.shieldT > 0) chips.push(['SHIELD', '#48cae4']);
  if (G.warp > 0) chips.push(['WARP', '#b8c0ff']);
  if (G.barrier > 0) chips.push(['AEGIS', '#48cae4']);
  if (G.echoes.length) chips.push(['ECHO x' + G.echoes.length, '#7df9ff']);
  if (G.manual) chips.push(['MANUAL', '#fff']);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
  chips.forEach((ch, i) => { ctx.fillStyle = ch[1]; ctx.fillText(ch[0], 10 + i * 78, top + 89); });
  // Boss bar.
  if (G.boss && !G.boss.dead) {
    const b = G.boss, bw = Math.min(360, W - 40), bx = (W - bw) / 2, by = top + 108;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, 12);
    const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, '#ff4d6d'); bg.addColorStop(1, '#ff3df2');
    ctx.fillStyle = bg; ctx.fillRect(bx, by, bw * Math.max(0, b.hp / b.maxHp), 12);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, 12);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(b.name + (b.armour ? `  [ARMOUR ${Math.round(effArmour(b))}]` : ''), W / 2, by - 8);
  }
  // Off-screen pointers: boss (red) and the Anchor (cyan).
  const pointer = (wx, wy, col) => {
    const dx = wx - cam.x, dy = wy - cam.y;
    if (Math.abs(dx * S) < W / 2 - 10 && Math.abs(dy * S) < H / 2 - 10) return;
    const a = Math.atan2(dy, dx), rr = Math.min(W, H) / 2 - 40;
    ctx.save(); ctx.translate(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); ctx.rotate(a); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, 9); ctx.lineTo(-8, -9); ctx.fill(); ctx.restore();
  };
  if (G.boss && !G.boss.dead) pointer(G.boss.x, G.boss.y, '#ff4d6d');
  pointer(c.x, c.y, c.flash > 0 ? '#ff4d6d' : '#7df9ff');
  drawMinimap(top);
  // Banner.
  if (G.banner) {
    const b = G.banner, a = Math.min(1, b.t * 2), sc = 1 + Math.max(0, b.t - 2.1) * 1.5;
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = `900 ${Math.min(24, W / 17) * sc}px sans-serif`;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.strokeText(b.text, W / 2, H * 0.3);
    ctx.fillStyle = b.color; ctx.fillText(b.text, W / 2, H * 0.3);
    ctx.globalAlpha = 1;
  }
  if (INPUT.active && G.manual) {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(INPUT.ox, INPUT.oy, 50, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(INPUT.ox + G.manual.x * 50, INPUT.oy + G.manual.y * 50, 20, 0, TAU); ctx.fill();
  }
}

function drawMinimap(top) {
  const R = 44, mx = W - R - 10, my = top + 70 + R;
  const k = R / CORE.arena;
  ctx.fillStyle = 'rgba(5,5,20,0.75)'; ctx.beginPath(); ctx.arc(mx, my, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(125,249,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  const dot = (x, y, r, col) => {
    let dx = (x - G.core.x) * k, dy = (y - G.core.y) * k; const d = Math.hypot(dx, dy);
    if (d > R - 2) { dx = dx / d * (R - 2); dy = dy / d * (R - 2); }
    ctx.fillStyle = col; ctx.fillRect(mx + dx - r / 2, my + dy - r / 2, r, r);
  };
  for (const e of G.enemies) if (e.siege || e.boss || e.elite) dot(e.x, e.y, e.boss ? 5 : 2.5, e.boss ? '#ff4d6d' : e.siege ? '#c77dff' : '#ffd23f');
  for (const r of G.rifts) dot(r.x, r.y, 5, '#ff3df2');
  for (const pad of G.pads) if (pad.tower) dot(pad.x, pad.y, 3, TOWERS[pad.tower.type].color);
  dot(G.core.x, G.core.y, 6, '#7df9ff');
  for (const e of G.echoes) dot(e.x, e.y, 3, '#e0fbff');
  dot(G.player.x, G.player.y, 4, '#fff');
  // View rectangle.
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(mx + (cam.x - G.core.x - W / 2 / S) * k, my + (cam.y - G.core.y - H / 2 / S) * k, W / S * k, H / S * k);
}
