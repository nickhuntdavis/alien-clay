'use strict';
// Spawn Prawn - the splash screen when the app opens: the lab bench. An eyepiece draws itself on paper, the slide is
// pulled into focus, you (green) are found in the race to the egg, and the logo sets itself where the title screen
// has it, so the hand-over to the title is seamless. About five and a half seconds; a tap anywhere skips it at once.
const SPLASH = { t: 0, on: false, last: 0, swim: [], cv: null };
function splashStart() {
  const el = document.getElementById('splash');
  if (!el) return;
  SPLASH.on = true; SPLASH.t = 0; SPLASH.col = null; SPLASH.last = performance.now(); SPLASH.cv = document.getElementById('splashCan');
  SPLASH.swim = Array.from({ length: 34 }, (_, i) => ({ x: -0.1 + Math.random() * 0.75, y: 0.2 + Math.random() * 0.6, v: 0.16 + Math.random() * 0.12, ph: Math.random() * 10, s: 0.7 + Math.random() * 0.5, you: i === 0 }));
  SPLASH.swim[0].y = 0.5; SPLASH.swim[0].x = 0.12; SPLASH.swim[0].v = 0.2;
  el.classList.add('on');
  const skip = ev => { if (ev) ev.preventDefault(); splashEnd(); };
  el.addEventListener('pointerdown', skip, { once: true });
  requestAnimationFrame(splashFrame);
}
function splashEnd() {
  if (!SPLASH.on) return;
  SPLASH.on = false;
  const el = document.getElementById('splash');
  el.classList.add('out');
  setTimeout(() => el.classList.remove('on', 'out'), 350);
}
// The intro in the design system (lab bench, e-ink): on paper, an ink eyepiece draws itself and its calibration
// ticks tick in; the slide lights up out of focus and a FOCUS readout pulls it sharp; brackets lock onto you (green);
// then the logo sets itself where the title screen's logo sits, its 3px rule drawing across, and the pitch. Menus
// Paper or Ink both work (colours come from the CSS tokens). About five and a half seconds; a tap skips it.
const splashEase = x => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
const splashK = (t, a, d) => splashEase((t - a) / d);
function splashColours() {
  const cs = getComputedStyle(document.documentElement), v = (n, d) => cs.getPropertyValue(n).trim() || d;
  return { bg: v('--color-bg-app', '#e4e5e0'), ink: v('--color-text-primary', '#1e1e1e'), muted: v('--color-text-muted', '#4a4a46'), dim: v('--color-text-dim', '#9a9b95') };
}
function splashFrame(now) {
  if (!SPLASH.on) return;
  const dt = Math.min(0.05, (now - SPLASH.last) / 1000); SPLASH.last = now; SPLASH.t += dt;
  const t = SPLASH.t, c = SPLASH.cv, dpr = Math.min(2, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight;
  if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const C = SPLASH.col || (SPLASH.col = splashColours()), TAU = Math.PI * 2;
  const R = Math.min(W * 0.4, H * 0.27), cx = W / 2, cy = H * 0.58;
  const ring = splashK(t, 0, 0.8), ticks = splashK(t, 0.35, 0.7), lamp = splashK(t, 0.6, 0.6), focus = splashK(t, 0.9, 1.5), lock = splashK(t, 2.4, 0.4);
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // The slide, lit, inside the eyepiece: grey field, faint grid, the egg and the race, coming into focus.
  if (lamp > 0) {
    g.save(); g.beginPath(); g.arc(cx, cy, R - 2, 0, TAU); g.clip(); g.globalAlpha = lamp;
    const bg = g.createRadialGradient(cx - R * 0.2, cy - R * 0.25, R * 0.1, cx, cy, R); bg.addColorStop(0, '#c4c5c0'); bg.addColorStop(1, '#9c9d98');
    g.fillStyle = bg; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    g.filter = focus < 1 ? `blur(${((1 - focus) * 9).toFixed(1)}px)` : 'none';
    g.strokeStyle = 'rgba(30,30,30,0.12)'; g.lineWidth = 1; g.beginPath();
    for (let k = -R; k <= R; k += R / 4) { g.moveTo(cx + k, cy - R); g.lineTo(cx + k, cy + R); g.moveTo(cx - R, cy + k); g.lineTo(cx + R, cy + k); }
    g.stroke();
    const ex = cx + R * 0.5, ey = cy - R * 0.05, er = R * 0.24;
    g.fillStyle = 'rgba(255,214,232,0.55)'; g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.fill();
    g.strokeStyle = '#1e1e1e'; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = '#1e1e1e'; g.beginPath(); g.arc(ex, ey, er * 0.28, 0, TAU); g.fill();
    let you = null;
    for (const s of SPLASH.swim) {
      s.x += s.v * dt * 0.55; if (s.x > 0.82) { s.x = -0.1; s.y = 0.15 + Math.random() * 0.7; }
      const x = cx - R + s.x * 2 * R, y = cy - R + s.y * 2 * R + Math.sin(t * 2 + s.ph) * 4, k = R / 230 * s.s * (s.you ? 1.3 : 1);
      g.strokeStyle = s.you ? '#2fbf6a' : '#1e1e1e'; g.lineWidth = Math.max(1.2, 2 * k); g.lineCap = 'round'; g.beginPath();
      for (let i = 0; i <= 12; i++) { const f = i / 12; g.lineTo(x - 7 * k - f * 40 * k, y + Math.sin(t * 14 + s.ph - f * 5) * 5 * k * f); }
      g.stroke();
      g.fillStyle = s.you ? '#4dff9a' : '#1e1e1e'; g.beginPath(); g.ellipse(x, y, 7 * k, 4.8 * k, 0, 0, TAU); g.fill();
      if (s.you) { g.strokeStyle = '#1e1e1e'; g.lineWidth = 1.2; g.stroke(); you = { x, y, k }; }
    }
    g.filter = 'none';
    // Crosshair hairlines.
    g.strokeStyle = 'rgba(30,30,30,0.28)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
    // Lock-on: corner brackets close in on you.
    if (lock > 0 && you) {
      const b = (34 - 16 * lock) * Math.max(0.8, you.k), L = 7;
      g.globalAlpha = lamp * lock; g.strokeStyle = '#1e1e1e'; g.lineWidth = 2; g.lineCap = 'square'; g.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const px = you.x + sx * b, py = you.y + sy * b * 0.75; g.moveTo(px, py - sy * L); g.lineTo(px, py); g.lineTo(px - sx * L, py); }
      g.stroke();
    }
    g.restore();
  }
  // The eyepiece: an ink ring drawing itself, then calibration ticks, then the readouts.
  g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'butt'; g.beginPath(); g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * ring); g.stroke();
  g.lineWidth = 1.5; g.strokeStyle = C.muted; g.beginPath();
  const n = 72, shown = Math.floor(n * ticks);
  for (let i = 0; i < shown; i++) { const a = -Math.PI / 2 + i / n * TAU, l = i % 9 === 0 ? 11 : 5; g.moveTo(cx + Math.cos(a) * (R + 5), cy + Math.sin(a) * (R + 5)); g.lineTo(cx + Math.cos(a) * (R + 5 + l), cy + Math.sin(a) * (R + 5 + l)); }
  g.stroke();
  if (lamp > 0) {
    g.globalAlpha = lamp; g.fillStyle = C.muted; g.font = '600 10px Barlow, Roboto, sans-serif'; g.textBaseline = 'alphabetic';
    const yTop = cy - R - 24; g.textAlign = 'left'; g.fillText('OBJ 40x', cx - R, yTop); g.textAlign = 'right'; g.fillText('FOCUS ' + focus.toFixed(2), cx + R, yTop);
    // Focus bar under the readouts.
    g.fillStyle = C.dim; g.fillRect(cx - R, yTop + 5, R * 2, 1.5); g.fillStyle = C.ink; g.fillRect(cx - R, yTop + 4, R * 2 * focus, 3);
    g.globalAlpha = 1;
  }
  // Words (DOM): the logo, its rule, then the pitch.
  const el = document.getElementById('splash');
  el.style.setProperty('--sa', splashK(t, 1.9, 0.5));
  el.style.setProperty('--sr', splashK(t, 2.2, 0.6));
  el.style.setProperty('--sb', splashK(t, 2.8, 0.5));
  if (t > 5.6) { splashEnd(); return; }
  requestAnimationFrame(splashFrame);
}
