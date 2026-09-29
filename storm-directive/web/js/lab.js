'use strict';
// Spawn Storm - the lab. An out-of-focus desk and microscope sit behind the title screen; pressing
// START pulls focus, then the camera dives into the eyepiece and the slide opens up around you.

// Scene space: 1600 x 1000, desk top at y 640, the microscope's eyepiece at EYE.
const LAB = { w: 1600, h: 1000 };
const EYE = { x: 760, y: 168, rx: 34, ry: 11 };

function labBokeh() {
  if (LAB.bokeh) return LAB.bokeh;
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  LAB.bokeh = Array.from({ length: 26 }, () => ({ x: rnd() * 1600, y: 40 + rnd() * 560, r: 10 + rnd() * 34, a: 0.04 + rnd() * 0.1 }));
  return LAB.bokeh;
}

// Draw the lab in scene units onto g (already transformed).
function drawLab(g, t) {
  const lin = (x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  // Wall.
  g.fillStyle = lin(0, 0, 0, 640, [[0, '#1c2531'], [1, '#0f141b']]); g.fillRect(-400, -400, 2400, 1040);
  // Window with blinds, cold daylight.
  g.fillStyle = lin(120, 80, 520, 520, [[0, '#c9dcec'], [1, '#7f93a8']]); g.fillRect(120, 80, 400, 440);
  g.fillStyle = 'rgba(15,20,27,0.55)';
  for (let y = 92; y < 520; y += 26) g.fillRect(120, y, 400, 9);
  g.strokeStyle = '#0b0f14'; g.lineWidth = 14; g.strokeRect(120, 80, 400, 440);
  // Shelf with bottles and flasks.
  g.fillStyle = '#2a3441'; g.fillRect(980, 300, 560, 14);
  const bottle = (x, w, h, neck) => { g.fillStyle = 'rgba(160,180,200,0.35)'; rr(x, 300 - h, w, h, 6); g.fill(); g.fillRect(x + w / 2 - neck / 2, 300 - h - 18, neck, 20); g.fillStyle = 'rgba(214,228,240,0.25)'; g.fillRect(x + 5, 300 - h + 8, 4, h - 16); };
  bottle(1000, 46, 110, 16); bottle(1060, 36, 80, 14); bottle(1110, 60, 140, 20); bottle(1190, 40, 96, 14);
  g.fillStyle = 'rgba(160,180,200,0.3)'; g.beginPath(); g.moveTo(1270, 300); g.lineTo(1330, 300); g.lineTo(1308, 230); g.lineTo(1308, 196); g.lineTo(1292, 196); g.lineTo(1292, 230); g.closePath(); g.fill();
  bottle(1360, 52, 120, 18); bottle(1430, 34, 70, 12);
  // Bokeh from the window and lamps.
  for (const b of labBokeh()) { g.fillStyle = `rgba(214,228,240,${b.a})`; g.beginPath(); g.arc(b.x, b.y, b.r, 0, TAU); g.fill(); }
  // Desk.
  g.fillStyle = lin(0, 640, 0, 1000, [[0, '#46515f'], [0.08, '#343e4b'], [1, '#141920']]); g.fillRect(-400, 640, 2400, 800);
  g.fillStyle = 'rgba(214,228,240,0.35)'; g.fillRect(-400, 640, 2400, 3);
  // Notebook, pen, mug, petri dishes, pipette.
  g.save(); g.translate(360, 760); g.rotate(-0.12);
  g.fillStyle = '#c8d3de'; rr(-120, -70, 240, 150, 6); g.fill();
  g.strokeStyle = 'rgba(40,50,62,0.35)'; g.lineWidth = 2; for (let y = -45; y < 70; y += 18) { g.beginPath(); g.moveTo(-100, y); g.lineTo(100, y); g.stroke(); }
  g.fillStyle = '#1c232c'; g.fillRect(40, -90, 8, 150); g.restore();
  g.fillStyle = lin(520, 0, 600, 0, [[0, '#5a6674'], [0.5, '#8a97a6'], [1, '#48525e']]); rr(520, 600, 80, 96, 10); g.fill();
  g.strokeStyle = '#5a6674'; g.lineWidth = 10; g.beginPath(); g.arc(606, 640, 20, -1.2, 1.2); g.stroke();
  g.fillStyle = 'rgba(214,228,240,0.18)'; g.beginPath(); g.ellipse(560, 604, 36, 7, 0, 0, TAU); g.fill();
  const dish = (x, y, r) => { g.fillStyle = 'rgba(190,210,228,0.25)'; g.beginPath(); g.ellipse(x, y, r, r * 0.3, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(214,228,240,0.55)'; g.lineWidth = 2; g.stroke(); };
  dish(1080, 690, 70); dish(1170, 740, 58); dish(1060, 790, 64);
  g.save(); g.translate(1320, 700); g.rotate(-0.5); g.fillStyle = '#9aa6b4'; rr(-8, -110, 16, 150, 6); g.fill(); g.fillStyle = '#d6e4f0'; g.fillRect(-3, 40, 6, 50); g.restore();
  // The microscope.
  const metal = (x0, x1) => lin(x0, 0, x1, 0, [[0, '#262d36'], [0.35, '#7d8a99'], [0.55, '#aab6c3'], [1, '#2a313b']]);
  g.fillStyle = 'rgba(0,0,0,0.45)'; g.beginPath(); g.ellipse(810, 660, 190, 22, 0, 0, TAU); g.fill();
  g.fillStyle = metal(650, 970); rr(650, 600, 320, 52, 18); g.fill();
  // Arm.
  g.fillStyle = metal(860, 940); g.beginPath(); g.moveTo(880, 604); g.bezierCurveTo(960, 520, 960, 330, 860, 250); g.lineTo(820, 280); g.bezierCurveTo(900, 350, 900, 520, 840, 604); g.closePath(); g.fill();
  // Focus knob.
  g.fillStyle = metal(890, 950); g.beginPath(); g.arc(918, 470, 30, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(214,228,240,0.3)'; g.lineWidth = 2; g.beginPath(); g.arc(918, 470, 22, 0, TAU); g.stroke();
  // Stage and slide.
  g.fillStyle = '#20262e'; g.fillRect(680, 470, 220, 22);
  g.fillStyle = 'rgba(214,228,240,0.55)'; g.fillRect(700, 462, 150, 8);
  g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(760, 463, 30, 6);
  // Light source under the stage.
  g.fillStyle = lin(740, 0, 820, 0, [[0, '#2a313b'], [0.5, '#8a97a6'], [1, '#2a313b']]); g.fillRect(745, 492, 70, 108);
  const lamp = g.createRadialGradient(780, 500, 2, 780, 500, 60); lamp.addColorStop(0, 'rgba(230,240,250,0.55)'); lamp.addColorStop(1, 'rgba(230,240,250,0)');
  g.fillStyle = lamp; g.fillRect(700, 440, 160, 120);
  // Objectives on the turret.
  g.fillStyle = metal(740, 830); g.beginPath(); g.ellipse(785, 360, 60, 22, 0, 0, TAU); g.fill();
  g.fillStyle = metal(760, 800); g.fillRect(768, 370, 32, 80); g.fillStyle = metal(806, 836); g.fillRect(808, 366, 24, 60);
  g.fillStyle = '#d6e4f0'; g.fillRect(768, 440, 32, 4);
  // Head and body tube up to the eyepiece.
  g.fillStyle = metal(730, 880); rr(730, 280, 150, 80, 16); g.fill();
  g.fillStyle = metal(736, 790); g.beginPath(); g.moveTo(740, 290); g.lineTo(790, 290); g.lineTo(784, EYE.y + 4); g.lineTo(736, EYE.y + 4); g.closePath(); g.fill();
  g.fillStyle = metal(724, 796); rr(EYE.x - 38, EYE.y - 4, 76, 40, 8); g.fill();
  // Eyepiece lens: dark glass with a glint.
  g.fillStyle = '#05070a'; g.beginPath(); g.ellipse(EYE.x, EYE.y, EYE.rx, EYE.ry, 0, 0, TAU); g.fill();
  g.strokeStyle = '#aab6c3'; g.lineWidth = 3; g.stroke();
  g.fillStyle = `rgba(214,228,240,${0.35 + 0.15 * Math.sin(t * 2)})`; g.beginPath(); g.ellipse(EYE.x - 12, EYE.y - 3, 8, 2.5, -0.2, 0, TAU); g.fill();
  // Label on the arm.
  g.fillStyle = 'rgba(214,228,240,0.45)'; g.font = 'bold 13px monospace'; g.fillText('SPAWN-O-SCOPE 40x', 700, 640);
}

// Fit the scene to the screen ("cover"), keeping the microscope in view.
function labFit() {
  const s = Math.max(W / LAB.w, H / LAB.h) * (H > W ? 1.25 : 1.05);
  return { s, ox: W / 2 - 800 * s, oy: H * (H > W ? 0.46 : 0.5) - 430 * s };
}
// A pre-blurred copy for the title screen.
function labBlurred() {
  const key = W + 'x' + H;
  if (LAB.blurKey === key) return LAB.blur;
  const f = labFit(), scale = Math.min(1, DPR), c = makeCanvas(Math.ceil(W * scale), Math.ceil(H * scale)), g = c.getContext('2d');
  const sharp = makeCanvas(c.width, c.height), sg = sharp.getContext('2d');
  sg.setTransform(f.s * scale, 0, 0, f.s * scale, f.ox * scale, f.oy * scale);
  drawLab(sg, 0);
  g.filter = `blur(${Math.round(9 * scale)}px)`; g.drawImage(sharp, 0, 0); g.filter = 'none';
  LAB.blur = c; LAB.blurKey = key;
  return c;
}

function drawTitleLab() {
  const c = labBlurred(), t = performance.now() / 1000;
  const dx = Math.sin(t * 0.15) * 8, dy = Math.cos(t * 0.11) * 5;
  ctx.drawImage(c, -12 + dx, -12 + dy, W + 24, H + 24);
}

// ---------------------------------------------------------------- the opening shot
const INTRO = { t: 0, dur: 2.9, on: false };
function startIntro() { INTRO.t = 0; INTRO.on = true; G.state = 'intro'; introSound(); }

// The intro's sound, scheduled against the picture: focus-knob ticks during the focus pull, a glass slide
// sliding across the stage and clacking into the clips, the objective turret clunking into place, then an
// airy swell as the field of view opens. Everything stops if you skip.
const INTRO_NODES = [];
function introSound() {
  INTRO_NODES.length = 0;
  if (!AUDIO.on || !AUDIO.ctx) return;
  const ac = AUDIO.ctx, t0 = ac.currentTime + 0.02;
  sndNoiseBuf();
  const keep = n => { INTRO_NODES.push(n); return n; };
  // Filtered noise with a frequency sweep and a gain envelope [[time, level], ...].
  const noise = (at, dur, type, f0, f1, q, env) => {
    const src = keep(ac.createBufferSource()), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = AUDIO.noise1; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0 + at); f.frequency.exponentialRampToValueAtTime(f1, t0 + at + dur);
    g.gain.setValueAtTime(0.0001, t0 + at);
    for (const [tt, v] of env) g.gain.exponentialRampToValueAtTime(Math.max(0.0001, v), t0 + at + tt);
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(t0 + at); src.stop(t0 + at + dur + 0.05);
  };
  const tone = (at, freq, dur, vol, type) => {
    const o = keep(ac.createOscillator()), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t0 + at); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
    o.connect(g); g.connect(ac.destination); o.start(t0 + at); o.stop(t0 + at + dur + 0.02);
  };
  const tick = (at, heavy) => {
    noise(at, heavy ? 0.06 : 0.025, 'bandpass', heavy ? 1500 : 3200, heavy ? 1300 : 3000, heavy ? 4 : 7, [[0.002, heavy ? 0.22 : 0.1], [heavy ? 0.06 : 0.025, 0.0001]]);
    tone(at, heavy ? 420 : 1150, heavy ? 0.09 : 0.04, heavy ? 0.05 : 0.016);
  };
  // Focus pull: the fine-focus knob.
  [0.05, 0.15, 0.24, 0.32, 0.39, 0.45].forEach(t => tick(t));
  // The slide sliding across the stage (glass on metal), then clacking into the clips.
  noise(0.5, 0.42, 'bandpass', 2400, 900, 2.2, [[0.06, 0.07], [0.3, 0.05], [0.42, 0.0001]]);
  noise(0.93, 0.05, 'highpass', 3000, 3000, 0.7, [[0.002, 0.18], [0.05, 0.0001]]);
  tone(0.93, 2650, 0.18, 0.035); tone(0.93, 3980, 0.12, 0.02);
  // Objective turret clunks into place.
  tick(1.3, true); tone(1.3, 140, 0.16, 0.06, 'triangle');
  // The field of view opens: an airy swell.
  noise(1.4, 1.3, 'lowpass', 250, 2200, 0.8, [[0.6, 0.06], [1.3, 0.0001]]);
}
function stopIntroSound() {
  for (const n of INTRO_NODES) { try { n.stop(); } catch (e) { /* already stopped */ } }
  INTRO_NODES.length = 0;
}
function endIntro() {
  if (!INTRO.on) return;
  INTRO.on = false;
  if (INTRO.t < INTRO.dur - 0.1) stopIntroSound();
  if (G && G.state === 'intro') { G.state = 'play'; if (typeof UI !== 'undefined') UI.afterIntro(); }
}
function updateIntro(dt) { INTRO.t += dt; G.realT += dt; if (INTRO.t >= INTRO.dur) endIntro(); }
// Tap anywhere to skip the shot.
window.addEventListener('pointerdown', () => { if (INTRO.on && INTRO.t > 0.25) endIntro(); });
const easeInOut = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;

// Drawn over the rendered slide: the lab, zooming into the eyepiece, with a growing hole through which
// the slide shows. 0-0.7s focus pull, 0.5-2.3s dive, 1.4-2.9s the field of view opens to full screen.
function drawIntro() {
  const T = INTRO.t, f = labFit();
  const dive = easeInOut(clamp((T - 0.5) / 1.8, 0, 1));
  const ex = f.ox + EYE.x * f.s, ey = f.oy + EYE.y * f.s;
  const endS = (Math.hypot(W, H) / (EYE.rx * f.s)) * 1.1;
  const z = Math.exp(Math.log(endS) * dive);
  // The eyepiece slides to the centre of the screen as we dive.
  const cx = lerp(ex, W / 2, dive), cy = lerp(ey, H / 2, dive);
  const open = easeInOut(clamp((T - 1.4) / 1.5, 0, 1));
  const g = LAB.ic && LAB.ic.width === cv.width && LAB.ic.height === cv.height ? LAB.ic : (LAB.ic = makeCanvas(cv.width, cv.height));
  const gc = g.getContext('2d');
  gc.setTransform(1, 0, 0, 1, 0, 0); gc.clearRect(0, 0, g.width, g.height);
  gc.setTransform(DPR * z * f.s, 0, 0, DPR * z * f.s, DPR * (cx - EYE.x * f.s * z - (f.ox - f.ox) * z), DPR * (cy - EYE.y * f.s * z));
  drawLab(gc, T);
  // Focus pull at the start: blend from the blurred title copy.
  const pull = 1 - clamp(T / 0.7, 0, 1);
  if (pull > 0 && dive < 0.02) { gc.setTransform(DPR, 0, 0, DPR, 0, 0); gc.globalAlpha = pull; gc.drawImage(labBlurred(), 0, 0, W, H); gc.globalAlpha = 1; }
  // Punch the field of view through the eyepiece: the tube's black interior first, then the slide.
  gc.setTransform(DPR, 0, 0, DPR, 0, 0);
  const lensR = EYE.rx * f.s * z;
  if (dive > 0.25) {
    const holeR = lensR * lerp(0.2, 0.9, clamp((dive - 0.25) / 0.5, 0, 1));
    gc.globalCompositeOperation = 'destination-out';
    const hg = gc.createRadialGradient(cx, cy, holeR * 0.82, cx, cy, holeR);
    hg.addColorStop(0, 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    gc.fillStyle = hg; gc.beginPath(); gc.arc(cx, cy, holeR, 0, TAU); gc.fill();
    gc.globalCompositeOperation = 'source-over';
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Before the view opens, the slide is only visible through a round field stop, black around it.
  const fieldR = lerp(Math.min(W, H) * 0.42, Math.hypot(W, H) * 0.6, open);
  if (dive > 0.25 && open < 1) {
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.rect(0, 0, cv.width, cv.height);
    ctx.arc(W / 2 * DPR, H / 2 * DPR, fieldR * DPR, 0, TAU, true); ctx.fill('evenodd');
  }
  const fade = 1 - clamp((T - 2.2) / 0.6, 0, 1);
  ctx.globalAlpha = fade; ctx.drawImage(g, 0, 0); ctx.globalAlpha = 1;
  ctx.restore();
  // Caption.
  if (T < 1.6) {
    ctx.globalAlpha = clamp(Math.min(T / 0.3, (1.6 - T) / 0.4), 0, 1);
    ctx.textAlign = 'center'; ctx.font = 'bold 12px ' + MONO; ctx.fillStyle = XR.white;
    ctx.fillText('SPECIMEN 001  :  LOADING SLIDE', W / 2, H - 40);
    ctx.globalAlpha = 1;
  }
}
