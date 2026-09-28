'use strict';
// Storm Directive - rendering: parallax space, lit arena floor, decals, dynamic lights, shadows,
// shaded entities, glow sprites, the egg, swimmers, echoes, rewind effect, HUD, minimap.

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
  // Living tissue: deep crimson fluid, drifting cells at mid-depth, fine bubbles up close.
  let seed = 1337;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const T = 512, D = Math.min(2, DPR);
  const neb = makeCanvas(T, T), ng = neb.getContext('2d');
  const blobs = ['#6a0f35', '#8a1f4f', '#3d0b2a', '#a02a62', '#4a1340', '#2b0a24'];
  for (let i = 0; i < 18; i++) {
    const x = rnd() * T, y = rnd() * T, r = 60 + rnd() * 180, c = blobs[i % blobs.length];
    for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) {
      const gr = ng.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
      gr.addColorStop(0, c + '44'); gr.addColorStop(1, c + '00');
      ng.fillStyle = gr; ng.fillRect(x + ox - r, y + oy - r, r * 2, r * 2);
    }
  }
  // Wavy fibres through the far layer.
  ng.strokeStyle = 'rgba(255,140,180,0.05)'; ng.lineWidth = 6;
  for (let i = 0; i < 7; i++) {
    const y0 = rnd() * T, amp = 20 + rnd() * 40, ph = rnd() * TAU;
    ng.beginPath();
    for (let x = 0; x <= T; x += 8) ng.lineTo(x, y0 + Math.sin(x / T * TAU * 2 + ph) * amp);
    ng.stroke();
  }
  const cells = (n, big) => {
    const c = makeCanvas(T * D, T * D), g = c.getContext('2d');
    g.scale(D, D);
    for (let i = 0; i < n; i++) {
      const x = rnd() * T, y = rnd() * T;
      if (big) {
        const r = 6 + rnd() * 16;
        g.globalAlpha = 0.12 + rnd() * 0.12;
        g.fillStyle = '#ff9ecb'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
        g.globalAlpha *= 1.8; g.strokeStyle = '#ffd1e3'; g.lineWidth = 1.2; g.stroke();
        g.fillStyle = '#b5487a'; g.beginPath(); g.arc(x + r * 0.2, y - r * 0.15, r * 0.3, 0, TAU); g.fill();
      } else {
        const r = 0.6 + rnd() * 1.6;
        g.globalAlpha = 0.25 + rnd() * 0.45; g.fillStyle = rnd() < 0.7 ? '#ffd6e8' : '#ff8fb8';
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      }
    }
    return c;
  };
  // Depth of field: the further back a layer sits, the more out of focus it is.
  SPR.layers = [
    { f: 0.06, img: blurTile(neb, 7), T },
    { f: 0.2, img: blurTile(cells(26, true), 3.5 * D), T },
    { f: 0.45, img: blurTile(cells(90, false), 1.2 * D), T },
  ];
  // Foreground: big soft debris drifting between the camera and the fight, badly out of focus.
  const fg = makeCanvas(T, T), fgc = fg.getContext('2d');
  for (let i = 0; i < 5; i++) {
    const x = rnd() * T, y = rnd() * T, r = 26 + rnd() * 40;
    for (const ox of [-T, 0, T]) for (const oy of [-T, 0, T]) {
      fgc.globalAlpha = 0.16 + rnd() * 0.08; fgc.fillStyle = i % 2 ? '#ff9ecb' : '#ffc2d9';
      fgc.beginPath(); fgc.arc(x + ox, y + oy, r, 0, TAU); fgc.fill();
      fgc.globalAlpha *= 0.8; fgc.fillStyle = '#7a1f4a'; fgc.beginPath(); fgc.arc(x + ox + r * 0.25, y + oy - r * 0.2, r * 0.3, 0, TAU); fgc.fill();
    }
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
  const T = L.T, ox = -((((cam.x * S * L.f + G.realT * 6) % T) + T) % T), oy = -((((cam.y * S * L.f + G.realT * 3) % T) + T) % T);
  for (let x = ox; x < W; x += T) for (let y = oy; y < H; y += T) ctx.drawImage(L.img, x, y, T, T);
}

function buildVignette() {
  const key = W + 'x' + H;
  if (SPR.vigKey === key) return;
  SPR.vigKey = key;
  const c = makeCanvas(Math.ceil(W / 2), Math.ceil(H / 2)), g = c.getContext('2d');
  const gr = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.35, c.width / 2, c.height / 2, Math.hypot(c.width, c.height) * 0.55);
  gr.addColorStop(0, 'rgba(20,0,8,0)'); gr.addColorStop(1, 'rgba(25,0,10,0.66)');
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
  ctx.fillStyle = '#14040d';
  ctx.fillRect(-20, -20, W + 40, H + 40);
  for (const L of SPR.layers) {
    const T = L.T;
    const ox = -((((cam.x * S * L.f) % T) + T) % T), oy = -((((cam.y * S * L.f) % T) + T) % T);
    for (let x = ox - T; x < W + T; x += T) for (let y = oy - T; y < H + T; y += T) ctx.drawImage(L.img, x, y, T, T);
  }
  // The womb: a warm, lit disc around the egg, dark tissue beyond.
  const core = G.core, cx = sx(core.x), cy = sy(core.y), R = CORE.arena * S;
  const fl = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  fl.addColorStop(0, 'rgba(255,120,170,0.26)'); fl.addColorStop(0.3, 'rgba(170,40,100,0.18)'); fl.addColorStop(0.95, 'rgba(90,15,50,0.12)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fl; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip();
  // Cell-wall mesh.
  const gs = 72, x0 = cam.x - W / 2 / S, y0 = cam.y - H / 2 / S;
  ctx.strokeStyle = 'rgba(255,150,190,0.06)'; ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gy = Math.floor(y0 / gs) * gs; gy < y0 + H / S + gs; gy += gs) {
    const off = (Math.round(gy / gs) % 2) * gs / 2;
    for (let gx = Math.floor(x0 / gs) * gs - off; gx < x0 + W / S + gs; gx += gs) { const x = sx(gx), y = sy(gy); ctx.moveTo(x + gs * S * 0.45, y); ctx.arc(x, y, gs * S * 0.45, 0, TAU); }
  }
  ctx.stroke();
  // Heartbeat: a double pulse from the egg every 1.2 seconds.
  const beat = (G.realT % 1.2) / 1.2;
  for (const [ofs, a] of [[0, 0.14], [0.14, 0.09]]) {
    const k = beat - ofs;
    if (k < 0) continue;
    const rr = k * CORE.arena;
    ctx.strokeStyle = `rgba(255,143,184,${a * (1 - k)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, rr * S, 0, TAU); ctx.stroke();
  }
  ctx.restore();
  // Tissue beyond the arena edge.
  ctx.fillStyle = 'rgba(20,0,8,0.55)';
  ctx.beginPath(); ctx.rect(-20, -20, W + 40, H + 40); ctx.arc(cx, cy, R, 0, TAU, true); ctx.fill();
  ctx.strokeStyle = 'rgba(255,143,184,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, rr = R + Math.sin(a * 14 + G.realT * 1.5) * 6 * S; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.stroke();
  // Warm glow zone.
  ctx.strokeStyle = 'rgba(255,214,232,0.16)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, CORE.sanctuary * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
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

// ---------------------------------------------------------------- the egg
function drawCore() {
  // The egg: pearly ovum, translucent zona, a ring of follicle cells, and cracks once you start breaking in.
  const c = G.core, x = sx(c.x), y = sy(c.y), r = c.r * S, t = G.realT;
  const egg = G.eggE, dmg = egg ? 1 - egg.hp / egg.maxHp : 0;
  const beat = 1 + Math.max(0, Math.sin(t * TAU / 1.2)) * 0.025;
  ctx.globalCompositeOperation = 'lighter';
  glow(x, y, r * 3.2, egg ? '#ff6fa8' : '#ffb3d1', egg ? 0.55 + Math.sin(t * 6) * 0.1 : 0.4);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(40,0,15,0.45)'; ctx.beginPath(); ctx.ellipse(x + 6, y + r * 0.9, r * 1.1, r * 0.4, 0, 0, TAU); ctx.fill();
  // Corona radiata: follicle cells orbiting slowly.
  for (let i = 0; i < 26; i++) {
    const a = t * 0.15 + i / 26 * TAU, rr = r * (1.36 + Math.sin(i * 1.7 + t) * 0.04);
    ctx.fillStyle = i % 3 ? 'rgba(255,194,220,0.55)' : 'rgba(255,160,200,0.6)';
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * 0.1, 0, TAU); ctx.fill();
  }
  // Zona pellucida.
  ctx.strokeStyle = egg ? `rgba(255,120,170,${0.5 + Math.sin(t * 8) * 0.2})` : 'rgba(255,240,248,0.35)';
  ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.arc(x, y, r * 1.1 * beat, 0, TAU); ctx.stroke();
  // Ovum.
  const og = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * beat);
  og.addColorStop(0, '#fffafc'); og.addColorStop(0.45, '#ffd1e3'); og.addColorStop(1, c.flash > 0 ? '#ff4d6d' : '#d9689d');
  ctx.fillStyle = og; ctx.beginPath(); ctx.arc(x, y, r * beat, 0, TAU); ctx.fill();
  // Nucleus.
  ctx.fillStyle = 'rgba(160,40,100,0.35)'; ctx.beginPath(); ctx.arc(x + r * 0.2, y + r * 0.15, r * 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, TAU); ctx.fill();
  // Cracks spread as the membrane weakens.
  if (egg && dmg > 0.02) {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    const n = Math.ceil(dmg * 14);
    for (let i = 0; i < n; i++) {
      let a = rnd() * TAU, rr = r * (0.2 + rnd() * 0.3);
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      for (let k = 0; k < 4; k++) { a += (rnd() - 0.5) * 0.7; rr += r * 0.2; ctx.lineTo(x + Math.cos(a) * Math.min(rr, r), y + Math.sin(a) * Math.min(rr, r)); }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.2, '#ffffff', dmg * 0.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
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

function drawShip(x, y, face, bodyColor, alpha, scale, body) {
  // A spermatozoon: glossy head, midpiece and a whipping tail. With a body, the tail is a physical
  // chain that drags behind the head; without one (ghosts) it's a simple procedural wiggle.
  const k = S * (scale || 1);
  const ph = G.realT * 16;
  if (body) {
    const wx = body.x - Math.cos(face) * 6 * (scale || 1), wy = body.y - Math.sin(face) * 6 * (scale || 1);
    stepTail(body, wx, wy, face, 44 * (scale || 1), Math.hypot(body.vx || 0, body.vy || 0));
    ctx.globalAlpha = alpha * 0.35; drawTail(body.tail, bodyColor, 4.4 * k);
    ctx.globalAlpha = alpha; drawTail(body.tail, bodyColor, 2 * k);
  }
  ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  ctx.strokeStyle = bodyColor; ctx.lineCap = 'round';
  const segs = 14, len = 34 * k;
  for (let pass = 0; pass < 2 && !body; pass++) {
    ctx.lineWidth = pass ? 1.4 * k : 3.2 * k;
    ctx.globalAlpha = alpha * (pass ? 1 : 0.35);
    ctx.beginPath(); ctx.moveTo(-6 * k, 0);
    for (let i = 1; i <= segs; i++) { const f = i / segs; ctx.lineTo(-6 * k - f * len, Math.sin(ph - f * 7) * 5 * k * f); }
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
  ctx.fillStyle = shade(bodyColor); ctx.fillRect(-9 * k, -1.6 * k, 5 * k, 3.2 * k);
  const hg = ctx.createRadialGradient(3 * k, -2 * k, 0.5 * k, 2 * k, 0, 9 * k);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, bodyColor); hg.addColorStop(1, shade(bodyColor));
  ctx.fillStyle = hg; ctx.beginPath(); ctx.ellipse(2 * k, 0, 9 * k, 6.2 * k, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(6 * k, 0, 3.5 * k, 3.6 * k, 0, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.lineCap = 'butt';
  ctx.globalAlpha = 1;
}
// ---------------------------------------------------------------- flagellum physics
// A tail is a chain of points in world space. The root is pinned behind the head and beats side to side;
// every other link is dragged along by the one in front (so turns sweep the tail round behind you and
// swimming leaves a travelling wave), with a little stiffness pulling it straight when you stop.
const TAIL_N = 11;
function stepTail(o, rx, ry, face, len, speed) {
  const now = G.realT, dt = Math.min(0.05, Math.max(0, now - (o.tailT || now)));
  o.tailT = now;
  const seg = len / (TAIL_N - 1);
  if (!o.tail || o.tail.length !== TAIL_N || Math.hypot(o.tail[0].x - rx, o.tail[0].y - ry) > len * 3) {
    o.tail = [];
    for (let i = 0; i < TAIL_N; i++) o.tail.push({ x: rx - Math.cos(face) * seg * i, y: ry - Math.sin(face) * seg * i });
  }
  o.beat = (o.beat || Math.random() * 10) + dt * (9 + Math.min(14, speed / 10));
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
function drawTerrain() {
  if (!G.terrain) return;
  const t = G.realT, m = 200;
  const x0 = cam.x - W / 2 / S - m, x1 = cam.x + W / 2 / S + m, y0 = cam.y - H / 2 / S - m, y1 = cam.y + H / 2 / S + m;
  for (const ob of G.terrain.list) {
    if (ob.x < x0 || ob.x > x1 || ob.y < y0 || ob.y > y1) continue;
    const x = sx(ob.x), y = sy(ob.y), r = ob.r * S, c = ob.def.color;
    switch (ob.type) {
      case 'ridge': {
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 5, y + r * 0.35, r, r * 0.55, 0, 0, TAU); ctx.fill();
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, ob.flash > 0 ? '#ffffff' : '#fff4ee'); g.addColorStop(0.6, c); g.addColorStop(1, '#a8706c');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(120,60,60,0.45)'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(x + r * 0.1, y + r * 0.15, r * (0.35 + i * 0.2), ob.a + i, ob.a + i + 1.6); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r - 1, -2.6, -1.2); ctx.stroke();
        break;
      }
      case 'mito': {
        const k = ob.charge / ob.def.charge, pulse = k > 0.8 ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ob.a);
        ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(4, r * 0.3, r * 1.25, r * 0.7, 0, 0, TAU); ctx.fill();
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
        g.addColorStop(0, '#ffe0c2'); g.addColorStop(0.7, c); g.addColorStop(1, '#8a3b1a');
        ctx.fillStyle = ob.flash > 0 ? '#fff' : g; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * 0.7, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#6b2a10'; ctx.lineWidth = 3; ctx.stroke();
        // Cristae: the folded inner membrane, glowing as it charges.
        ctx.strokeStyle = `rgba(255,${Math.round(200 + 55 * k)},${Math.round(120 * k)},${0.5 + 0.5 * k})`; ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 24; i++) { const f = i / 24, px = (f - 0.5) * r * 2.1, py = Math.sin(f * 16) * r * 0.42 * Math.sin(f * Math.PI); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        glow(x, y, r * (1.6 + pulse * 0.6 + ob.burstT * 3), '#ffb347', 0.12 + k * 0.4 + pulse * 0.2);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        // Charge meter.
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x - r * 0.6, y + r * 0.85, r * 1.2, 4);
        ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - r * 0.6, y + r * 0.85, r * 1.2 * k, 4);
        break;
      }
      case 'acid': {
        ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.8, c, 0.3); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
        g.addColorStop(0, '#1d2b05'); g.addColorStop(0.65, '#4d7a0c'); g.addColorStop(0.9, c); g.addColorStop(1, '#e9ff9e');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        // Bubbles rise and pop.
        for (let i = 0; i < 6; i++) {
          const ph = (t * 0.7 + ob.seed + i * 0.37) % 1, a = ob.seed * 7 + i * 2.1, d = r * 0.55 * ((i * 0.31 + ob.seed) % 1);
          ctx.strokeStyle = `rgba(233,255,158,${1 - ph})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (2 + ph * 7) * S, 0, TAU); ctx.stroke();
        }
        break;
      }
      case 'cilia': {
        ctx.fillStyle = 'rgba(255,143,171,0.08)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,143,171,0.55)'; ctx.lineWidth = 1.5;
        const n = Math.round(ob.r / 5);
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = i / n * TAU, sw = Math.sin(t * 7 + i * 0.9) * 0.25, r0 = r * 0.55, r1 = r * 0.98;
          ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
          ctx.quadraticCurveTo(x + Math.cos(a + sw * 0.5) * (r0 + r1) / 2, y + Math.sin(a + sw * 0.5) * (r0 + r1) / 2, x + Math.cos(a + sw) * r1, y + Math.sin(a + sw) * r1);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,143,171,0.35)'; ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, TAU); ctx.fill();
        break;
      }
      case 'current': {
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
        ctx.fillStyle = 'rgba(125,249,255,0.07)'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.translate(x, y); ctx.rotate(ob.a);
        ctx.strokeStyle = 'rgba(125,249,255,0.45)'; ctx.lineWidth = 2;
        const sp = 38 * S, off = (t * ob.def.push * S) % sp;
        for (let row = -3; row <= 3; row++) for (let cx = -r - sp + off; cx < r + sp; cx += sp) {
          const cy = row * r / 3.5 + Math.sin(cx * 0.03 + row) * 3;
          ctx.beginPath(); ctx.moveTo(cx - 8 * S, cy - 6 * S); ctx.lineTo(cx, cy); ctx.lineTo(cx - 8 * S, cy + 6 * S); ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = 'rgba(125,249,255,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        break;
      }
      case 'slick': {
        const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
        g.addColorStop(0, 'rgba(255,255,255,0.4)'); g.addColorStop(0.5, 'rgba(200,182,255,0.3)'); g.addColorStop(1, 'rgba(125,249,255,0.08)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, ob.a, 0, TAU); ctx.fill();
        ctx.strokeStyle = `hsla(${(t * 40 + ob.seed * 50) % 360},90%,80%,0.6)`; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.ellipse(x, y, r * 0.7, r * 0.5, ob.a + t * 0.2, 0.3, 2.4); ctx.stroke();
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
      ctx.globalCompositeOperation = 'lighter';
      glow(x, y, r * 1.5, z.color, 0.45 * Math.min(1, z.life / z.max * 2));
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      continue;
    }
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
    ctx.strokeStyle = t.color || '#ffd60a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(t.face) * 16 * S, y + Math.sin(t.face) * 16 * S); ctx.lineWidth = 4; ctx.stroke();
  }

  // Enemy drop shadows, batched.
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  for (const e of G.enemies) {
    if (!vis(e) || e.phased || e.egg) continue;
    const x = sx(e.x) + 3, y = sy(e.y) + e.r * S * 0.75, r = e.r * S;
    ctx.moveTo(x + r, y); ctx.ellipse(x, y, r, r * 0.45, 0, 0, TAU);
  }
  ctx.fill();
  // Elite, boss and ally auras.
  ctx.globalCompositeOperation = 'lighter';
  for (const e of G.enemies) {
    if (!vis(e) || e.egg) continue;
    if (e.boss) glow(sx(e.x), sy(e.y), e.r * 3.2 * S, e.color, 0.5);
    else if (e.rival) glow(sx(e.x), sy(e.y), e.r * 3 * S, e.color, 0.5);
    else if (e.elite) glow(sx(e.x), sy(e.y), e.r * 2.6 * S, '#ffd23f', 0.35);
    else if (e.charmed) glow(sx(e.x), sy(e.y), e.r * 2.4 * S, '#ff8fab', 0.45);
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
      // Swimmers drag physical tails behind them.
      const wr = e.r * 0.8;
      if (e.tailV == null) { e.tailV = 0; e.px = e.x; e.py = e.y; }
      const fdt = Math.max(1e-3, G.realT - (e.tailT || G.realT)); e.tailV = Math.hypot(e.x - e.px, e.y - e.py) / fdt; e.px = e.x; e.py = e.y;
      stepTail(e, e.x - Math.cos(face) * wr, e.y - Math.sin(face) * wr, face, e.r * 3.2, e.tailV);
      drawTail(e.tail, e.charmed ? '#ff8fab' : e.color, Math.max(1.2, r * 0.22));
    }
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
      if (sh === 'cell' && e.flash <= 0) { ctx.fillStyle = 'rgba(90,10,50,0.35)'; ctx.beginPath(); ctx.arc(x + r * 0.2, y + r * 0.1, r * 0.35, 0, TAU); ctx.fill(); drawShape(sh, x, y, r, rot); }
      ctx.lineWidth = e.elite || e.boss || e.rival ? 3 : 1.5;
      if (e.charmed) ctx.lineWidth = 3;
      ctx.strokeStyle = e.charmed ? '#ff8fab' : e.rival ? '#fff' : e.elite ? '#ffd23f' : e.boss ? '#fff' : 'rgba(0,0,0,0.6)';
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
    if (e.parasiteT > 0) st('#b5e48c');
    if (e.charmed) { ctx.fillStyle = '#ff8fab'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ALLY ' + Math.ceil(e.charmT), x, y - r - 12); }
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
      drawShip(sx(ex), sy(ey), face, '#7df9ff', 0.12 * fade * (4 - k), playerScale());
    }
    drawShip(x, y, face, '#7df9ff', 0.6 * fade, playerScale());
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
    const ba = (p.hd != null ? p.hd : p.face) + Math.PI;
    glow(px + Math.cos(ba) * 12 * S, py + Math.sin(ba) * 12 * S, (8 + sp / 20) * S, '#ff9e00', 0.7);
    if (Math.random() < 0.6) spawnPart(p.x + Math.cos(ba) * 10, p.y + Math.sin(ba) * 10, Math.random() < 0.5 ? '#ff9e00' : '#3cf0ff', 1, 40, 0.35, 2.5);
  }
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (G.shieldT > 0) { ctx.strokeStyle = '#48cae4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.stroke(); }
  for (const w of G.weapons) {
    if (!w) continue;
    if (w.def.kind === 'siphon') {
      ctx.setLineDash([4, 6]); ctx.lineDashOffset = G.realT * 30;
      ctx.strokeStyle = w.def.color + '66'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(px, py, w.s.area * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    }
    if (w.def.heat && w.heat > 0.6) { ctx.globalCompositeOperation = 'lighter'; glow(px, py, 30 * S, '#ff5400', (w.heat - 0.6) * 1.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
  }
  drawShip(px, py, p.hd != null ? p.hd : p.face, p.flash > 0 ? '#ff4d6d' : '#3cf0ff', p.iframes > 0 && Math.floor(G.realT * 20) % 2 ? 0.4 : 1, playerScale(), p);
  ctx.fillStyle = '#000'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S, 4);
  ctx.fillStyle = p.hp / G.P.maxHp < 0.3 ? '#ff4d6d' : '#8ac926'; ctx.fillRect(px - 16 * S, py + 18 * S, 32 * S * (p.hp / G.P.maxHp), 4);

  // Additive layer: weapon fx, projectiles, particles, fx.
  ctx.globalCompositeOperation = 'lighter';
  drawWeaponFx(G.weapons, p.x, p.y, 1);
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
      case 'prequel':
        // A shell flying backwards: the flame trail is in front of it.
        ctx.lineWidth = r * 1.1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 3, y + Math.sin(a) * r * 3); ctx.stroke();
        glow(x + Math.cos(a) * r * 3, y + Math.sin(a) * r * 3, r * 2.5, '#ffd166', 0.8); ctx.globalAlpha = 1;
        break;
      case 'scrap':
        ctx.save(); ctx.translate(x, y); ctx.rotate(G.realT * 10);
        drawShape('spike', 0, 0, r, 0); ctx.fill(); ctx.fillStyle = '#5a3a00'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, TAU); ctx.fill(); ctx.restore(); break;
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

  // Screen-space post effects: out-of-focus foreground, lens blur at the rim, vignette.
  drawForeground();
  if (!rewinding) drawLensBlur();
  buildVignette();
  ctx.drawImage(SPR.vignette, 0, 0, W, H);
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
  ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#fff'; ctx.fillText(`LV ${G.level}`, 10, top + 40);
  ctx.fillStyle = '#ff8fab'; ctx.fillText(`${G.kills} kills`, 56, top + 40);
  // Live broadcast counter (and scrap, when a weapon uses it).
  if (Math.floor(G.realT * 2) % 2) { ctx.fillStyle = '#ff2e4d'; ctx.beginPath(); ctx.arc(14, top + 57, 4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ffc2cc'; ctx.font = 'bold 12px sans-serif'; ctx.fillText(`LIVE ${fmtViewers(G.show.viewers)}`, 22, top + 57);
  if (ownsScrapWeapon()) { ctx.fillStyle = '#ffb400'; ctx.fillText(`${Math.floor(G.scrap)} scrap`, 110, top + 57); }
  ctx.textAlign = 'center'; ctx.fillStyle = G.state === 'rewind' ? '#7df9ff' : '#fff'; ctx.font = 'bold 18px sans-serif';
  const m = Math.floor(G.t / 60), s = Math.floor(G.t % 60);
  ctx.fillText(`${m}:${s < 10 ? '0' : ''}${s}`, W / 2, top + 24);
  // Status chips.
  const chips = [];
  if (G.rage > 0) chips.push(['ADRENALINE', '#ff924c']);
  if (G.shieldT > 0) chips.push(['SHIELD', '#48cae4']);
  if (G.warp > 0) chips.push(['WARP', '#b8c0ff']);
  if (G.barrier > 0) chips.push(['AEGIS', '#48cae4']);
  if (G.echoes.length) chips.push(['ECHO x' + G.echoes.length, '#7df9ff']);
  if (G.manual) chips.push(['MANUAL', '#fff']);
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';
  chips.forEach((ch, i) => { ctx.fillStyle = ch[1]; ctx.fillText(ch[0], 10 + i * 74, top + 74); });
  // Boss bar.
  if (G.boss && !G.boss.dead) {
    const b = G.boss, bw = Math.min(360, W - 130), bx = 10, by = top + 108;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, 12);
    const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, '#ff4d6d'); bg.addColorStop(1, '#ff3df2');
    ctx.fillStyle = bg; ctx.fillRect(bx, by, bw * Math.max(0, b.hp / b.maxHp), 12);
    ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, 12);
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText(b.name + (b.armour ? `  [ARMOUR ${Math.round(effArmour(b))}]` : ''), bx + bw / 2, by - 8);
  }
  // Egg membrane bar, or progress towards being big enough.
  {
    const bw = Math.min(360, W - 130), bx = 10, by = top + (G.boss && !G.boss.dead ? 138 : 108), mid = bx + bw / 2;
    ctx.textAlign = 'center'; ctx.font = 'bold 12px sans-serif';
    if (G.eggE && !G.eggE.dead && G.level < EGG.level) {
      const e = G.eggE, who = G.enemies.filter(o => o.rival && !o.dead && o.mode === 'egg').map(o => o.name);
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, 12);
      ctx.fillStyle = '#ff4d6d'; ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 12);
      ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, 12);
      ctx.fillStyle = '#ff8fab';
      ctx.fillText((who.length ? who.join(' & ') + ' breaking in: ' : 'Egg membrane: ') + Math.ceil(e.hp / e.maxHp * 100) + '%', mid, by - 8);
    } else if (G.eggE && !G.eggE.dead) {
      const e = G.eggE;
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(bx, by, bw, 12);
      ctx.fillStyle = '#ffd6e8'; ctx.fillRect(bx, by, bw * Math.max(0, e.hp / e.maxHp), 12);
      ctx.strokeStyle = '#fff'; ctx.strokeRect(bx, by, bw, 12);
      ctx.fillStyle = '#ffd6e8'; ctx.fillText("BREAK INTO THE EGG! " + Math.ceil(e.hp / e.maxHp * 100) + '%', mid, by - 8);
    } else if (!G.boss && G.level < EGG.level) {
      ctx.fillStyle = 'rgba(255,214,232,0.75)'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`Grow to LV ${EGG.level} to break into the egg`, mid, top + 108);
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
  pointer(c.x, c.y, G.eggE ? '#ffffff' : '#ffb3d1');
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
  if (G.terrain) { ctx.globalAlpha = 0.45; for (const ob of G.terrain.list) if (ob.def.solid || ob.type === 'current') dot(ob.x, ob.y, 2, ob.def.color); ctx.globalAlpha = 1; }
  for (const e of G.enemies) if (e.boss || e.elite || e.charmed) dot(e.x, e.y, e.boss ? 5 : 3, e.boss ? '#ff4d6d' : e.charmed ? '#ff8fab' : '#ffd23f');
  dot(G.core.x, G.core.y, 8, G.eggE ? '#ffffff' : '#ffb3d1');
  for (const e of G.enemies) if (e.rival && !e.dead) dot(e.x, e.y, 5, e.color);
  for (const e of G.echoes) dot(e.x, e.y, 3, '#e0fbff');
  dot(G.player.x, G.player.y, 4, '#fff');
  // View rectangle.
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1;
  ctx.strokeRect(mx + (cam.x - G.core.x - W / 2 / S) * k, my + (cam.y - G.core.y - H / 2 / S) * k, W / S * k, H / S * k);
  drawRaceBoard(W - 10, my + R + 16);
}

// The race to the egg: you and the rival champions, by level.
function drawRaceBoard(rx, y) {
  if (!G.rivalsInit) return;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = 'rgba(255,214,232,0.7)'; ctx.fillText('RACE TO THE EGG', rx, y);
  rivalBoard().forEach((row, i) => {
    const yy = y + 14 + i * 13;
    ctx.globalAlpha = row.out ? 0.4 : 1;
    ctx.font = row.you ? 'bold 11px sans-serif' : 'bold 10px sans-serif';
    const tag = row.out ? 'OUT' : (row.egg ? 'EGG! ' : '') + 'LV ' + row.lvl;
    ctx.fillStyle = row.egg ? '#ff4d6d' : '#fff'; ctx.fillText(tag, rx, yy);
    const tw = ctx.measureText(tag).width;
    ctx.fillStyle = row.color; ctx.fillText(row.name, rx - tw - 6, yy);
  });
  ctx.globalAlpha = 1;
}
