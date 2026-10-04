'use strict';
// Spawn Prawn - the splash screen when the app opens. Through the microscope: a crowd of swimmers racing
// towards a glowing egg, one of them tagged green (you), the title, the pitch, then the title screen.
// About five seconds; a tap anywhere skips it at once.
const SPLASH = { t: 0, on: false, last: 0, swim: [], cv: null };
function splashStart() {
  const el = document.getElementById('splash');
  if (!el) return;
  SPLASH.on = true; SPLASH.t = 0; SPLASH.last = performance.now(); SPLASH.cv = document.getElementById('splashCan');
  SPLASH.swim = Array.from({ length: 46 }, (_, i) => ({ x: -0.1 - Math.random() * 0.9, y: 0.2 + Math.random() * 0.6, v: 0.16 + Math.random() * 0.12, ph: Math.random() * 10, s: 0.7 + Math.random() * 0.5, you: i === 0 }));
  SPLASH.swim[0].y = 0.5; SPLASH.swim[0].x = -0.15; SPLASH.swim[0].v = 0.24;
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
function splashFrame(now) {
  if (!SPLASH.on) return;
  const dt = Math.min(0.05, (now - SPLASH.last) / 1000); SPLASH.last = now; SPLASH.t += dt;
  const t = SPLASH.t, c = SPLASH.cv, dpr = Math.min(2, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight;
  if (c.width !== Math.round(W * dpr)) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const R = Math.min(W, H) * 0.46, cx = W / 2, cy = H * 0.42, fade = Math.min(1, t / 1.2);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // The microscope's field of view: a lit disc of slide.
  g.save(); g.beginPath(); g.arc(cx, cy, R * (0.6 + 0.4 * fade), 0, Math.PI * 2); g.clip();
  const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R); bg.addColorStop(0, `rgba(196,203,194,${fade})`); bg.addColorStop(0.75, `rgba(150,158,148,${fade})`); bg.addColorStop(1, `rgba(60,66,62,${fade})`);
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // The egg, glowing, on the right.
  const ex = cx + R * 0.62, ey = cy, er = R * 0.3, pulse = 1 + 0.03 * Math.sin(t * 3);
  const eg = g.createRadialGradient(ex, ey, er * 0.2, ex, ey, er * 1.6 * pulse); eg.addColorStop(0, 'rgba(255,240,230,0.9)'); eg.addColorStop(0.55, 'rgba(230,214,205,0.55)'); eg.addColorStop(1, 'rgba(230,214,205,0)');
  g.fillStyle = eg; g.beginPath(); g.arc(ex, ey, er * 1.6 * pulse, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(40,46,42,0.6)'; g.lineWidth = 2; g.beginPath(); g.arc(ex, ey, er, 0, Math.PI * 2); g.stroke();
  // The race: everyone swimming for the egg, tails beating.
  for (const s of SPLASH.swim) {
    s.x += s.v * dt * (t > 0.4 ? 1 : 0); if (s.x > 0.9) { s.x = -0.1; s.y = 0.2 + Math.random() * 0.6; }
    const x = cx - R + s.x * 2 * R, y = cy - R + s.y * 2 * R + Math.sin(t * 2 + s.ph) * 6, k = R / 260 * s.s * (s.you ? 1.35 : 1);
    g.strokeStyle = s.you ? 'rgba(77,255,154,0.95)' : 'rgba(40,46,42,0.8)'; g.lineWidth = Math.max(1, 1.4 * k); g.beginPath();
    for (let i = 0; i <= 12; i++) { const f = i / 12; g.lineTo(x - 8 * k - f * 46 * k, y + Math.sin(t * 14 + s.ph - f * 5) * 6 * k * f); }
    g.stroke();
    g.fillStyle = s.you ? '#4dff9a' : 'rgb(40,44,42)'; g.beginPath(); g.ellipse(x, y, 7 * k, 4.6 * k, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1; g.stroke();
  }
  g.restore();
  // Vignette and the eyepiece rim.
  const v = g.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = v; g.beginPath(); g.arc(cx, cy, R * 1.06, 0, Math.PI * 2); g.fill();
  g.strokeStyle = `rgba(200,222,242,${0.25 * fade})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  // Words.
  const el = document.getElementById('splash');
  el.style.setProperty('--sa', Math.min(1, Math.max(0, (t - 1.3) / 0.6)));
  el.style.setProperty('--sb', Math.min(1, Math.max(0, (t - 2.3) / 0.6)));
  if (t > 5.4) { splashEnd(); return; }
  requestAnimationFrame(splashFrame);
}
