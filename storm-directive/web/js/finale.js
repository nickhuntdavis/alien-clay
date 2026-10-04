'use strict';
// Spawn Prawn - the last moments of a run, before the end screen.
// Losing: time all but stops, the microscope pushes in on whatever got you, the colour drains out of the
// slide (except the killer, lit red) and you come apart. Winning: the egg shakes, cracks, bursts in a flash
// of light, and out comes the baby. A tap (or back) skips either.
const FINALE_LEN = { death: 2.6, win: 3.8 };
const FINALE_BURST = 1.4; // when the egg gives way
function finaleFoeName(e) { return e ? (e.rival && e.R ? e.R.name : e.bossDef ? e.bossDef.name : e.def ? e.def.name : '') : ''; }
function startFinale(kind, at) {
  const p = G.player, k = kind === 'death' ? G.lastHitEnt : null;
  const near = k && Math.hypot(k.x - p.x, k.y - p.y) < 900 ? k : null;
  const egg = at ? { x: at.x, y: at.y, r: at.r || CORE.r } : G.core ? { x: G.core.x, y: G.core.y, r: CORE.r } : { x: p.x, y: p.y, r: 60 };
  // Cracks: jagged lines from the shell's rim inwards (unit circle), drawn out bit by bit as the egg gives.
  const cracks = [];
  for (let i = 0; i < 8; i++) {
    let a = i / 8 * TAU + Math.random() * 0.5, r = 1;
    const pts = [[Math.cos(a), Math.sin(a)]];
    for (let j = 0; j < 5; j++) { r -= 0.12 + Math.random() * 0.08; a += (Math.random() - 0.5) * 0.7; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    cracks.push(pts);
  }
  G.finale = { kind, t: 0, z0: ZOOM.z, k: near, name: finaleFoeName(near) || G.stats.lastHit || 'the immune system', egg, cracks, burst: false, hit: false };
  G.state = 'finale';
  if (kind === 'win') { G.finaleCol = true; refreshPalette(); } // you made it: the whole slide floods with colour
  INPUT.active = false; INPUT.id = null; PTRS.clear(); PINCH = null; G.manual = null;
  if (typeof UI !== 'undefined') UI.show('none');
}
function updateFinale(dt) {
  const F = G.finale;
  if (!F) { G.state = 'play'; return; }
  F.t += dt; G.realT += dt;
  const p = G.player, t = F.t;
  let fx, fy, zt, ps = 1;
  if (F.kind === 'death') {
    const k = F.k || p;
    fx = lerp(p.x, k.x, 0.6); fy = lerp(p.y, k.y, 0.6);
    const d = Math.hypot(k.x - p.x, k.y - p.y) + (k.r || 20) * 2 + 80;
    zt = clamp(Math.min(F.z0 * 1.8, 0.7 * Math.min(W, H) / (d * S0)), F.z0, ZOOM.max);
    // The world all but stops: everything breathes in slow motion, the killer a touch faster.
    for (const e of G.enemies) e.age += dt * 0.12;
    if (F.k) F.k.age += dt * 0.2;
    if (t > 0.3 && !F.hit) {
      F.hit = true;
      if (F.k) { ring(k.x, k.y, (k.r || 20) * 3, '#ff0033', 0.9, 6); }
      vibrate([0, 40, 80, 30, 40, 20]);
    }
    // You come apart: bits of you drift off.
    if (t > 0.35 && t < 1.9 && Math.random() < dt * 30) spawnPart(p.x + rand(-p.r, p.r), p.y + rand(-p.r, p.r), PAL.you, 2, 50, 1.4, 3);
    ps = 0.35;
  } else {
    const E = F.egg;
    fx = E.x; fy = E.y; zt = Math.min(ZOOM.max, F.z0 * 1.7);
    if (!F.burst && t > FINALE_BURST) {
      F.burst = true;
      spawnPart(E.x, E.y, '#ffd6e8', 70, 380, 1.1, 6); spawnPart(E.x, E.y, '#ffd23f', 40, 260, 1.3, 4);
      ring(E.x, E.y, E.r * 2, '#ffffff', 0.6, 8); ring(E.x, E.y, E.r * 4, '#ffd6e8', 0.9, 5); ring(E.x, E.y, E.r * 7, '#ffd23f', 1.2, 3);
      addLight(E.x, E.y, E.r * 6, '#ffe8c0', 1.6);
      cam.shake = 18; sfx('boom'); vibrate([0, 30, 40, 220]);
    } else if (!F.burst && Math.random() < dt * (2 + t * 6)) {
      ring(E.x, E.y, E.r * (1.05 + Math.random() * 0.3), '#ffd6e8', 0.4, 2);
      if (Math.random() < 0.3) vibrate(12);
    }
  }
  ZOOM.z = lerp(ZOOM.z, zt, 1 - Math.pow(0.08, dt)); S = S0 * ZOOM.z;
  const ck = 1 - Math.pow(0.02, dt);
  cam.x = lerp(cam.x, fx, ck); cam.y = lerp(cam.y, fy, ck);
  const pd = dt * ps;
  for (const q of G.parts) { q.x += q.vx * pd; q.y += q.vy * pd; q.vx *= Math.pow(0.92, ps); q.vy *= Math.pow(0.92, ps); q.life -= pd; }
  for (const f of G.fx) f.life -= pd;
  for (const l of G.lights) l.life -= pd;
  compactArr(G.parts, x => x.life > 0); compactArr(G.fx, x => x.life > 0); compactArr(G.lights, x => x.life > 0);
  cam.shake = Math.max(0, cam.shake - dt * 20);
  if (t >= FINALE_LEN[F.kind]) endFinale();
}
function endFinale() {
  if (!G || G.state !== 'finale') return;
  const F = G.finale;
  G.finale = null;
  G.state = F.kind === 'win' ? 'won' : 'over';
  // One clean frame of the zoomed-in slide first, so the end screen's close-up of the killer is cut from it.
  if (typeof render === 'function') safely('render', render);
  if (typeof UI !== 'undefined') { if (F.kind === 'win') UI.showVictory(); else UI.showGameOver(); }
  ZOOM.z = F.z0; S = S0 * ZOOM.z;
}
// How visible you still are (you fade out as you dissolve, or into the light as the egg bursts).
function finaleYouAlpha() {
  const F = G.finale;
  if (!F) return 1;
  return F.kind === 'death' ? 1 - clamp((F.t - 0.4) / 1.4, 0, 1) : 1 - clamp((F.t - FINALE_BURST) / 0.25, 0, 1);
}
function drawFinale(shx, shy) {
  const F = G.finale;
  if (!F) return;
  const t = F.t, len = FINALE_LEN[F.kind], k = Math.min(1, t / 0.6), m = Math.min(W, H);
  ctx.save();
  const raw = RAW_COL, df = WORLD_DF; RAW_COL = true; WORLD_DF = false; // (a cinematic: true colours, not the slide's palette)
  if (F.kind === 'death') {
    // The colour drains out of the slide...
    ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.9 * k; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    const e = F.k;
    if (e) {
      // ...except the killer, in a pool of red light.
      const x = sx(e.x) + shx, y = sy(e.y) + shy, r = ((e.r || 20) * 2 + 30) * S, pulse = 0.85 + 0.15 * Math.sin(t * 7);
      const g = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 2.6);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(12,0,3,${(0.78 * k).toFixed(3)})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.5 * pulse, '#ff0033', 0.3 * k);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = k;
      ctx.strokeStyle = '#ff2848'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r * pulse, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const v = ctx.createRadialGradient(W / 2, H / 2, m * 0.3, W / 2, H / 2, Math.hypot(W, H) * 0.55);
    v.addColorStop(0, 'rgba(120,0,20,0)'); v.addColorStop(1, `rgba(120,0,20,${(0.55 * k).toFixed(3)})`);
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  } else {
    const E = F.egg, burst = t > FINALE_BURST;
    const shake = burst ? 0 : Math.pow(t / FINALE_BURST, 2) * 5;
    const ex = sx(E.x) + shx + rand(-shake, shake), ey = sy(E.y) + shy + rand(-shake, shake), er = E.r * S;
    if (!burst) {
      // The egg, glowing harder as it gives way, cracks spreading with light leaking through them.
      const c = clamp(t / (FINALE_BURST - 0.1), 0, 1);
      ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, er * (2 + c), '#ffe8c0', 0.25 + 0.55 * c);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      const sg = ctx.createRadialGradient(ex - er * 0.3, ey - er * 0.3, er * 0.1, ex, ey, er);
      sg.addColorStop(0, '#fff6f0'); sg.addColorStop(1, '#e8b8c8');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(ex, ey, er, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#a06878'; ctx.lineWidth = 2; ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const pass of [0, 1]) {
        ctx.strokeStyle = pass ? '#fff3c0' : '#5a2a3a'; ctx.lineWidth = pass ? 1.2 : 3;
        if (pass) ctx.globalCompositeOperation = 'lighter';
        for (const pts of F.cracks) {
          const n = c * (pts.length - 1);
          ctx.beginPath(); ctx.moveTo(ex + pts[0][0] * er, ey + pts[0][1] * er);
          for (let i = 1; i <= Math.ceil(n); i++) {
            const f = Math.min(1, n - (i - 1)), a = pts[i - 1], b = pts[i];
            ctx.lineTo(ex + lerp(a[0], b[0], f) * er, ey + lerp(a[1], b[1], f) * er);
          }
          ctx.stroke();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
    } else {
      // The fertilised egg, whole again and blazing, its heart beating.
      const bt = t - FINALE_BURST, pop = clamp(bt / 0.45, 0, 1), s = pop < 1 ? 1 - Math.pow(1 - pop, 3) * Math.cos(pop * 9) : 1;
      const beat = 1 + 0.06 * Math.pow(Math.max(0, Math.sin(bt * 7)), 8), R = er * s * beat;
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(t * 0.25);
      ctx.globalAlpha = Math.min(1, bt / 0.4);
      for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.fillStyle = i % 2 ? 'rgba(255,210,63,0.16)' : 'rgba(255,214,232,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(m * 1.2, -m * 0.08); ctx.lineTo(m * 1.2, m * 0.08); ctx.fill(); }
      ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, R * 2.6, '#ffe8c0', 0.5); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      if (R > 2) {
        const og = ctx.createRadialGradient(ex - R * 0.3, ey - R * 0.3, R * 0.1, ex, ey, R);
        og.addColorStop(0, '#fffaf0'); og.addColorStop(0.6, '#ffd6e8'); og.addColorStop(1, '#ff9ec4');
        ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ex, ey, R, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.stroke();
        // Two nuclei drifting together into one.
        const j = clamp(bt / 1.6, 0, 1), d = R * 0.32 * (1 - j);
        ctx.fillStyle = '#ff6fa8';
        for (const sg of [-1, 1]) { ctx.beginPath(); ctx.arc(ex + sg * d, ey, R * (0.16 + 0.06 * j), 0, TAU); ctx.fill(); }
        ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, R * 0.9, '#ffd23f', 0.35 * j); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        if (Math.sin(bt * 7) > 0.97 && !F.thump) { F.thump = true; ring(F.egg.x, F.egg.y, F.egg.r * 1.4, '#ffd23f', 0.6, 4); } else if (Math.sin(bt * 7) < 0) F.thump = false;
      }
      // The flash.
      const fl = 1 - bt / 0.7;
      if (fl > 0) { ctx.globalAlpha = fl; ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    }
  }
  // Letterbox bars and the words.
  const out = clamp((len - t) / 0.25, 0, 1), bh = H * 0.11 * k;
  ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const wa = clamp((t - (F.kind === 'death' ? 0.8 : FINALE_BURST + 0.3)) / 0.4, 0, 1) * out;
  if (wa > 0 && bh > 20) {
    ctx.globalAlpha = wa;
    const big = Math.round(clamp(m * 0.07, 20, 40)), small = Math.round(big * 0.42);
    if (F.kind === 'death') {
      ctx.fillStyle = '#ff8094'; ctx.font = `700 ${small}px sans-serif`; ctx.fillText('ABSORBED BY', W / 2, H - bh * 0.72);
      ctx.fillStyle = '#ff2848'; ctx.font = `900 ${big}px sans-serif`; ctx.fillText(F.name.toUpperCase(), W / 2, H - bh * 0.38);
    } else {
      ctx.fillStyle = '#ffe9a8'; ctx.font = `700 ${small}px sans-serif`; ctx.fillText('FERTILISED AT ' + fmtTime(G.t), W / 2, H - bh * 0.74);
      ctx.fillStyle = '#ffd23f'; ctx.font = `900 ${big}px sans-serif`; ctx.fillText("IT'S SPERMY!", W / 2, H - bh * 0.38);
    }
  }
  if (t > 0.5 && bh > 20) { ctx.globalAlpha = 0.45 * k; ctx.fillStyle = '#ffffff'; ctx.font = '600 11px sans-serif'; ctx.textAlign = 'right'; ctx.fillText('tap to skip', W - 14, bh * 0.5); }
  ctx.restore();
  RAW_COL = raw; WORLD_DF = df;
}
window.addEventListener('pointerdown', () => { if (typeof G !== 'undefined' && G && G.state === 'finale' && G.finale && G.finale.t > 0.25) endFinale(); });
