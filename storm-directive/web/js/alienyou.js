'use strict';
// Spawn Prawn - Not of This World's body (samples10.js 'alien'). Not a sperm: a translucent indigo bell with a
// bioluminescent split core, trailing seven sensor tentacles with glowing tips. It swims by jet pulses (the bell
// squeezes and the tentacles stream after it), and its mood shows on it:
//  - idle: slow pulse, tentacles hang close.            - curious: slow, nothing near: the outer tentacles reach forward.
//  - alert: an enemy within 300: tentacles fan, core up. - agitated: an enemy within 130: fast pulse, writhing, core flares.
//  - hurt: just hit: the core gutters, the rim flushes, motes shed off the bell.
// The core and tentacle tips take the colour of Adaptive Biology's current type (G.s10.shiftI: Fire, Alien, Static).
// Tentacles are short chains in world space (dragged through the fluid, so turns sweep them round), kept on the body
// (b.ay). Your hitbox and swim physics are unchanged.
// Hooks: render.js drawShip -> alienYou (draws instead of the sperm, for you and the pause-menu portrait);
// seqsel.js drawSeqMods -> alienYouOn (no sequence marks on it); samples10.js s10Samples -> alienPicStart (its card's picture).

const AY = {
  n: 7, nodes: 9, size: 1.45, // (bigger than a sperm head: it has no tail to read by)
  len: [30, 38, 27, 40, 27, 38, 30], // (world units at scale 1; the middle one longest)
  moods: { // pulse (Hz), fan, writhe, glow, reach
    idle:     [1.5, 0.55, 0.5, 0.75, 0],
    curious:  [1.1, 0.7, 0.6, 0.85, 1],
    alert:    [2.4, 0.9, 0.7, 1.0, 0],
    agitated: [3.6, 1.25, 1.5, 1.3, 0],
    hurt:     [2.8, 0.7, 1.9, 0.35, 0],
  },
  bell: '90,108,255', rim: '205,215,255', dark: '28,26,90',
};

const alienYouOn = b => !!(b && G && G.s10 && G.s10.id === 'alien' && (b === G.player || (typeof UI !== 'undefined' && b === UI.youBody)));

function alienMood(b) {
  if (b.flash > 0 || (b === G.player && b.iframes > 0.25)) return 'hurt';
  let near = 1e9;
  if (b === G.player) for (const e of G.enemies) { if (e.dead || e.ally) continue; const d = Math.hypot(e.x - b.x, e.y - b.y) - (e.r || 0); if (d < near) near = d; }
  if (near < 130) return 'agitated';
  if (near < 300) return 'alert';
  return Math.hypot(b.vx || 0, b.vy || 0) < 40 ? 'curious' : 'idle';
}

function alienYou(x, y, face, tag, alpha, scale, body) {
  if (!alienYouOn(body)) return false;
  const to = S10_BY.alien.shift[G.s10.shiftI || 0];
  return alienDraw(x, y, face, tag, alpha, scale, body, G.realT, (ELEMENTS[to] || ELEMENTS.flame).color, alienMood(body));
}
// The drawing itself, free of G (the sample card draws it on the title screen): now is the clock, core the core colour.
function alienDraw(x, y, face, tag, alpha, scale, body, now, core, mood) {
  const sc = (scale || 1) * AY.size, k = S * sc;
  const A = body.ay || (body.ay = { t: now, ph: 0, m: AY.moods.idle.slice(), tt: null, f: face, spark: [] });
  const dt = Math.min(0.05, Math.max(0, now - A.t)); A.t = now;
  // Mood eases in (about a quarter of a second), hurt snaps in.
  const want = AY.moods[mood], ease = mood === 'hurt' ? 1 : Math.min(1, dt * 5);
  for (let i = 0; i < 5; i++) A.m[i] += (want[i] - A.m[i]) * ease;
  const [hz, fan0, writhe, glw, reach] = A.m, v = Math.hypot(body.vx || 0, body.vy || 0);
  A.ph += TAU * (hz + Math.min(1.6, v / 160)) * dt;
  const c = Math.pow(Math.max(0, Math.sin(A.ph)), 2); // the squeeze: quick, then a slow refill
  const lk = 1 + 0.08 * c, wk = 1 - 0.15 * c, fan = fan0 * (1 - 0.35 * c);
  const hurt = mood === 'hurt', flick = hurt ? 0.5 + 0.5 * Math.random() : 1;
  body.yaw = 0;

  // ---- tentacles (world space, dragged)
  const cf = Math.cos(face), sf = Math.sin(face), nx = -sf, ny = cf, back = face + Math.PI;
  if (!A.tt || Math.hypot(A.tt[0][0].x - body.x, A.tt[0][0].y - body.y) > 200 * sc) A.tt = null;
  const T = A.tt || (A.tt = Array.from({ length: AY.n }, (_, i) => Array.from({ length: AY.nodes }, (_, j) => { const d = (5.5 + AY.len[i] * j / (AY.nodes - 1)) * sc; return { x: body.x - cf * d, y: body.y - sf * d }; }))) // (laid out straight behind, so they don't start in a knot);
  for (let i = 0; i < AY.n; i++) {
    const s = i / (AY.n - 1) * 2 - 1, L = AY.len[i] * sc * (1 + 0.06 * c), seg = L / (AY.nodes - 1), ch = T[i];
    const ax = body.x + (cf * (-5.5 * lk + Math.abs(s) * 1.2) + nx * s * 6.4 * wk) * sc, ay = body.y + (sf * (-5.5 * lk + Math.abs(s) * 1.2) + ny * s * 6.4 * wk) * sc;
    const outer = Math.abs(s) > 0.6 ? Math.sign(s) : 0, rest = back + s * fan * 0.8 + outer * reach * 1.9; // (curious: the outer pair reach round to the front)
    ch[0].x = ax; ch[0].y = ay;
    for (let j = 1; j < AY.nodes; j++) {
      const f = j / (AY.nodes - 1), a = rest + Math.sin(now * (2.2 + 2.6 * writhe) - j * 0.75 + i * 1.3) * 0.32 * writhe * f;
      const p = ch[j], q = ch[j - 1];
      const tx = q.x + Math.cos(a) * seg, ty = q.y + Math.sin(a) * seg, st = Math.min(1, dt * (4 + 3 * writhe) * (1 - 0.5 * f));
      p.x += (tx - p.x) * st; p.y += (ty - p.y) * st;
      const dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy) || 1; p.x = q.x + dx / d * seg; p.y = q.y + dy / d * seg;
    }
  }
  const X = q => x + (q.x - body.x) * S, Y = q => y + (q.y - body.y) * S;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // Three width bands per pass, one path each (cheap on phones).
  const bands = [[1, 3, 2.8], [3, 6, 1.9], [6, AY.nodes, 1.1]];
  for (const [col, al, wm] of [[AY.dark, 0.35, 1.25], [AY.bell, 0.55, 1], [AY.rim, 0.75, 0.42]]) {
    ctx.strokeStyle = `rgb(${col})`; ctx.globalAlpha = alpha * al * flick;
    for (const [j0, j1, w] of bands) {
      ctx.lineWidth = w * wm * k; ctx.beginPath();
      for (const ch of T) { ctx.moveTo(X(ch[j0 - 1]), Y(ch[j0 - 1])); for (let j = j0; j < j1; j++) ctx.lineTo(X(ch[j]), Y(ch[j])); }
      ctx.stroke();
    }
  }
  // Glowing tips: teardrop bulbs pointing down the tentacle.
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < AY.n; i++) { const e = T[i][AY.nodes - 1]; glow(X(e), Y(e), 6 * k, core, alpha * 0.55 * glw * flick); }
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < AY.n; i++) {
    const e = T[i][AY.nodes - 1], d = T[i][AY.nodes - 2], a = Math.atan2(e.y - d.y, e.x - d.x);
    ctx.save(); ctx.translate(X(e), Y(e)); ctx.rotate(a);
    ctx.globalAlpha = alpha * flick; ctx.fillStyle = core;
    ctx.beginPath(); ctx.ellipse(0, 0, 2.1 * k, 1.3 * k, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff6e8'; ctx.globalAlpha = alpha * 0.8 * flick; ctx.beginPath(); ctx.ellipse(0.4 * k, 0, 0.9 * k, 0.55 * k, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }

  // ---- the bell (local frame: +x is forward)
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  const rx = 10.5 * lk * k, ry = 9 * wk * k, bx = -5.5 * lk * k;
  const bell = () => {
    ctx.beginPath(); ctx.moveTo(bx, -ry * 0.82);
    ctx.bezierCurveTo(bx + 1 * k, -ry * 1.15, rx, -ry * 0.8, rx, 0);
    ctx.bezierCurveTo(rx, ry * 0.8, bx + 1 * k, ry * 1.15, bx, ry * 0.82);
    for (let i = 0; i < 5; i++) { // the scalloped margin, fluttering with the pulse
      const y0 = ry * 0.82 * (1 - 2 * i / 5), y1 = ry * 0.82 * (1 - 2 * (i + 1) / 5);
      ctx.quadraticCurveTo(bx - (1.4 + 0.8 * c + 0.4 * Math.sin(now * 6 + i)) * k, (y0 + y1) / 2, bx, y1);
    }
    ctx.closePath();
  };
  // Soft outer haze, then a dark rim (reads on a pale field), the translucent body and a bright rim (reads on black).
  ctx.globalCompositeOperation = 'lighter'; glow(1 * k, 0, 19 * k, `rgb(${AY.bell})`, alpha * 0.35 * flick); ctx.globalCompositeOperation = 'source-over';
  bell(); ctx.globalAlpha = alpha * 0.5; ctx.strokeStyle = `rgb(${AY.dark})`; ctx.lineWidth = 2.2 * k; ctx.stroke();
  const gr = ctx.createRadialGradient(2 * k, 0, 0, 1 * k, 0, rx * 1.15);
  gr.addColorStop(0, `rgba(${AY.dark},0.55)`); gr.addColorStop(0.55, `rgba(${AY.bell},0.5)`); gr.addColorStop(1, `rgba(${AY.rim},0.85)`);
  ctx.globalAlpha = alpha * flick; ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = hurt || tag === '#ff4d6d' ? '#ff8fb0' : `rgb(${AY.rim})`; ctx.lineWidth = 0.9 * k; ctx.stroke();
  // Veins over the dome, and Alien sparkle drifting inside it.
  ctx.strokeStyle = `rgba(${AY.rim},0.35)`; ctx.lineWidth = 0.6 * k; ctx.beginPath();
  for (const s of [-0.62, -0.25, 0.25, 0.62]) { ctx.moveTo(rx * 0.92, s * ry * 0.3); ctx.quadraticCurveTo(rx * 0.3, s * ry * 1.25, bx + 0.5 * k, s * ry * 0.95); }
  ctx.stroke();
  if (SET.detail !== 'low') {
    ctx.fillStyle = '#e8ecff';
    for (let i = 0; i < 7; i++) {
      const u = ((i * 0.37 + now * 0.05) % 1), px = bx + u * (rx - bx) * 0.9, py = Math.sin(i * 2.3) * ry * 0.7 * Math.sin(u * Math.PI);
      ctx.globalAlpha = alpha * Math.max(0, Math.sin(now * 3 + i * 1.9)) * 0.8; ctx.beginPath(); ctx.arc(px, py, 0.45 * k, 0, TAU); ctx.fill();
    }
  }
  // The core: a dark chamber holding two glowing lobes that face each other, with a bright spark between them.
  const cx = 1.6 * k, gk = glw * flick, open = 1 + 0.25 * c + (mood === 'agitated' ? 0.15 * Math.sin(now * 14) : 0);
  ctx.globalAlpha = alpha * 0.75; ctx.fillStyle = `rgb(${AY.dark})`;
  ctx.beginPath(); ctx.ellipse(cx, 0, 5.4 * k, 4.6 * k * wk, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = core;
  for (const s of [-1, 1]) {
    ctx.globalAlpha = alpha * Math.min(1, 0.55 + 0.4 * gk);
    ctx.beginPath(); ctx.moveTo(cx + 4.6 * k, s * 0.35 * k);
    ctx.quadraticCurveTo(cx + 1.5 * k, s * 4.6 * k * wk, cx - 3.6 * k, s * 0.9 * k);
    ctx.quadraticCurveTo(cx + 0.6 * k, s * 1.4 * k * open, cx + 4.6 * k, s * 0.35 * k); ctx.fill();
  }
  ctx.globalAlpha = alpha * gk; ctx.fillStyle = '#fff6e8'; // (a four-point spark)
  const r1 = 1.6 * k * open, r2 = 0.45 * k;
  ctx.beginPath(); ctx.moveTo(cx + r1, 0); ctx.lineTo(cx + r2, r2); ctx.lineTo(cx, r1 * 0.8); ctx.lineTo(cx - r2, r2); ctx.lineTo(cx - r1, 0); ctx.lineTo(cx - r2, -r2); ctx.lineTo(cx, -r1 * 0.8); ctx.lineTo(cx + r2, -r2); ctx.closePath(); ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  glow(cx, 0, 15 * k * (0.8 + 0.3 * c), core, alpha * 0.5 * gk);
  glow(cx, 0, 4.5 * k, '#ffffff', alpha * 0.6 * gk);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  // Hurt: motes shed off the bell and drift away.
  if (hurt && dt > 0 && Math.random() < 0.5) A.spark.push({ x: body.x, y: body.y, vx: (Math.random() - 0.5) * 70, vy: (Math.random() - 0.5) * 70, l: 0.5 });
  if (A.spark.length) {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of A.spark) { p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; glow(X(p), Y(p), 3 * k, '#b06cff', alpha * Math.max(0, p.l) * 1.6); }
    ctx.globalCompositeOperation = 'source-over';
    A.spark = A.spark.filter(p => p.l > 0);
  }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  return true;
}

// ---------------------------------------------------------------- the sample card's picture (s10Samples)
// A live canvas on Not of This World's card: it hangs in place, pulsing, and runs through its moods while the core
// cycles Fire, Alien and Static the way Adaptive Biology does. Borrows the world drawing globals for each frame
// (like drawYouPortrait) and stops once the card leaves the page.
const AY_PIC = ['idle', 'curious', 'alert', 'agitated'];
let alienPicTok = 0;
function alienPicStart() {
  const cv = document.querySelector('canvas[data-alienpic]'); if (!cv) return;
  const tok = ++alienPicTok, body = { x: 0, y: 0, vx: 0, vy: -50 }, t0 = performance.now();
  const frame = () => {
    if (tok !== alienPicTok || !cv.isConnected) return;
    requestAnimationFrame(frame);
    if (!cv.clientWidth) return; // (screen hidden)
    const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const g = cv.getContext('2d'), now = (performance.now() - t0) / 1000, step = Math.floor(now / 3);
    const keep = { ctx, S };
    try {
      ctx = g; S = cv.height / 84;
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
      body.y = Math.sin(now * 1.1) * 2.5; // (a gentle bob; tentacles hang below)
      const core = ELEMENTS[S10_BY.alien.shift[step % 3]].color;
      alienDraw(cv.width / 2, cv.height * 0.2 + body.y * S, -Math.PI / 2, null, 1, 1, body, now, core, AY_PIC[step % AY_PIC.length]);
    } finally { ctx = keep.ctx; S = keep.S; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  };
  requestAnimationFrame(frame);
}
