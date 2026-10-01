'use strict';
// Spawn Prawn - animated weapon previews for the Weapon Draft, upgrade paths and upgrade cards. Each one is a
// tiny looping scene on its own canvas: Spermy using the weapon on a few dummy cells, drawn in the weapon's
// type colour (menus keep their colour).

const PREVIEWS = new Set();

function makePreview(canvas, def, opts) {
  const pv = { canvas, def, t: 0, cd: 0.3, shots: [], parts: [], fx: [], puddles: [], mines: [], trail: [], targets: [], opts: opts || {}, ang: 0, stored: 0, seq: 0 };
  pv.col = elemCol(def.elem);
  resetTargets(pv);
  PREVIEWS.add(pv);
  return pv;
}
function dropPreview(pv) { PREVIEWS.delete(pv); }
function clearPreviews(root) { for (const pv of [...PREVIEWS]) if (!pv.canvas.isConnected || (root && root.contains(pv.canvas))) PREVIEWS.delete(pv); }

function resetTargets(pv) {
  pv.targets = [];
  for (let i = 0; i < 5; i++) pv.targets.push({ x: 0.62 + Math.random() * 0.3, y: 0.18 + i * 0.16 + (Math.random() - 0.5) * 0.06, r: 0.045 + Math.random() * 0.02, hp: 1, flash: 0, vy: (Math.random() - 0.5) * 0.04, frozen: 0, burn: 0 });
}

// Advance every visible preview (called from UI.tick).
function updatePreviews(dt) {
  for (const pv of PREVIEWS) {
    if (!pv.canvas.isConnected) { PREVIEWS.delete(pv); continue; }
    if (!pv.canvas.offsetParent) continue; // hidden
    try { stepPreview(pv, Math.min(dt, 1 / 20)); drawPreview(pv); } catch (e) { PREVIEWS.delete(pv); safely('preview ' + defId(pv.def), () => { throw e; }); }
  }
}

// ---------------------------------------------------------------- simulation (unit square, 0..1)
function pvShooter(pv) {
  const d = pv.def;
  if (d.kind === 'mine' || d.kind === 'wake') { const a = pv.t * 1.3; return { x: 0.32 + Math.cos(a) * 0.16, y: 0.5 + Math.sin(a * 2) * 0.2, a: Math.atan2(Math.cos(a * 2) * 0.4, -Math.sin(a) * 0.16) }; }
  if (d.kind === 'melee' && d.melee !== 'lash') return { x: 0.42, y: 0.5 + Math.sin(pv.t * 0.9) * 0.08, a: 0 };
  return { x: 0.2, y: 0.5 + Math.sin(pv.t * 0.9) * 0.06, a: 0 };
}
const pvAlive = pv => pv.targets.filter(t => t.hp > 0);
function pvHit(pv, t, k) {
  t.hp -= k; t.flash = 0.12;
  if (t.hp <= 0) { for (let i = 0; i < 8; i++) { const a = Math.random() * TAU; pv.parts.push({ x: t.x, y: t.y, vx: Math.cos(a) * 0.3, vy: Math.sin(a) * 0.3, life: 0.5 }); } }
}
function stepPreview(pv, dt) {
  const d = pv.def, b = d.base, me0 = pvShooter(pv);
  pv.t += dt;
  for (const t of pv.targets) { t.flash = Math.max(0, t.flash - dt); if (t.frozen > 0) t.frozen -= dt; else t.y += t.vy * dt; if (t.y < 0.12 || t.y > 0.88) t.vy *= -1; if (t.burn > 0) { t.burn -= dt; t.hp -= dt * 0.15; } }
  if (!pvAlive(pv).length || pv.t > (pv.resetAt || 9)) { resetTargets(pv); pv.resetAt = pv.t + 9; pv.shots = []; pv.puddles = []; pv.mines = []; }
  const live = pvAlive(pv), tgt = live[pv.seq % Math.max(1, live.length)];
  pv.cd -= dt;
  const rate = Math.max(0.14, Math.min(0.9, (b.cd || 0.6) * (d.style === 'flame' ? 3 : 1)));
  const fire = pv.cd <= 0;
  if (fire) pv.cd = d.style === 'flame' ? 0.05 : rate;
  switch (d.kind) {
    case 'orbit': {
      pv.ang += dt * 3.4;
      const n = Math.min(5, b.count || 3);
      for (let i = 0; i < n; i++) {
        const a = pv.ang + i / n * TAU, x = me0.x + Math.cos(a) * 0.13, y = me0.y + Math.sin(a) * 0.13 * 1.6;
        for (const t of live) if (Math.hypot(t.x - x, (t.y - y) / 1.6) < t.r + 0.03 && !(t.flash > 0)) pvHit(pv, t, 0.25);
      }
      for (const t of live) { t.x -= dt * 0.06; if (t.x < me0.x + 0.1) t.x = 0.9; }
      break;
    }
    case 'chain':
      if (fire && tgt) {
        pv.seq++;
        const hops = [me0].concat(live.slice(0, Math.min(live.length, (b.chain || 3) + 1)));
        for (let i = 1; i < hops.length; i++) { pvHit(pv, hops[i], 0.3); pv.fx.push({ type: 'bolt', a: { x: hops[i - 1].x, y: hops[i - 1].y }, b: { x: hops[i].x, y: hops[i].y }, life: 0.35 }); }
        pv.cd = 0.55;
      }
      break;
    case 'lob':
      if (fire && tgt) { pv.seq++; pv.shots.push({ lob: true, sx: me0.x, sy: me0.y, tx: tgt.x, ty: tgt.y, k: 0 }); pv.cd = 0.8; }
      break;
    case 'mine':
      if (fire) { pv.mines.push({ x: me0.x, y: me0.y, arm: 0.4 }); pv.cd = 0.55; }
      for (const t of live) { t.x -= dt * 0.08; if (t.x < 0.05) t.x = 0.95; }
      break;
    case 'wake':
      pv.trail.push({ x: me0.x, y: me0.y, life: 1.6 });
      for (const t of live) { t.x -= dt * 0.05; if (t.x < 0.05) t.x = 0.95; for (const q of pv.trail) if (Math.hypot(q.x - t.x, (q.y - t.y) / 1.6) < t.r + 0.02 && !(t.flash > 0)) { pvHit(pv, t, 0.2); break; } }
      break;
    case 'siphon':
      if (Math.random() < dt * 5 && live.length) { const s = pick(live); pv.shots.push({ enemy: true, x: s.x, y: s.y, vx: (me0.x - s.x) * 1.1, vy: (me0.y - s.y) * 1.1 }); }
      if (fire && pv.stored > 0 && tgt) { pv.stored--; pv.seq++; const a = Math.atan2(tgt.y - me0.y, tgt.x - me0.x); pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * 1.2, vy: Math.sin(a) * 1.2, r: 0.014, style: 'bullet' }); pv.cd = 0.12; }
      break;
    case 'melee': {
      // Targets drift in; every swing, lash or pulse hits whatever is in reach.
      for (const t of live) { t.x -= dt * 0.07; if (t.x < me0.x - 0.25) t.x = 0.95; }
      if (fire) {
        pv.cd = d.melee === 'pulse' ? 0.6 : d.melee === 'lash' ? 0.45 : 0.75;
        const near = live.slice().sort((p1, p2) => Math.hypot(p1.x - me0.x, p1.y - me0.y) - Math.hypot(p2.x - me0.x, p2.y - me0.y))[0];
        const a = near ? Math.atan2((near.y - me0.y) / 1.6, near.x - me0.x) : 0;
        const R = d.melee === 'pulse' ? 0.17 : d.melee === 'lash' ? 0.62 : 0.22, arc = d.melee === 'sweep' ? 2.4 : TAU;
        pv.fx.push({ type: d.melee, x: me0.x, y: me0.y, a, r: R, life: 0.3 });
        for (const t of live) {
          const dx = t.x - me0.x, dy = (t.y - me0.y) / 1.6, dist = Math.hypot(dx, dy);
          let hit;
          if (d.melee === 'lash') { const al = dx * Math.cos(a) + dy * Math.sin(a), sd = Math.abs(-dx * Math.sin(a) + dy * Math.cos(a)); hit = al > -t.r && al < R && sd < t.r + 0.02; }
          else hit = dist < R + t.r && (arc >= TAU || Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - a), Math.cos(Math.atan2(dy, dx) - a))) < arc / 2 + 0.3);
          if (hit) { pvHit(pv, t, d.melee === 'pulse' ? 0.2 : 0.35); t.x += Math.cos(a) * 0.05; }
        }
      }
      break;
    }
    default: // guns
      if (fire && tgt) {
        pv.seq++;
        const n = Math.min(7, b.count || 1), sp = d.style === 'flame' ? 0.5 : Math.min(0.8, b.spread || 0.06);
        const a0 = Math.atan2(tgt.y - me0.y, tgt.x - me0.x);
        const spd = d.style === 'flame' ? 0.7 : d.style === 'rail' ? 3 : d.style === 'void' ? 0.18 : d.style === 'sperm' ? 0.55 : 1.1;
        for (let i = 0; i < n; i++) {
          const a = n > 1 ? a0 + (i / (n - 1) - 0.5) * sp : a0 + (Math.random() - 0.5) * sp;
          pv.shots.push({ x: me0.x, y: me0.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, style: d.style || 'bullet', life: d.style === 'flame' ? 0.4 : 2, back: false, boom: !!b.boomerang, home: b.homing ? tgt : null, r: d.style === 'void' ? 0.05 : 0.012, hit: new Set() });
        }
      }
  }
  // Projectiles.
  for (const s of pv.shots) {
    if (s.dead) continue;
    if (s.lob) {
      s.k += dt / 0.7;
      if (s.k >= 1) { s.dead = true; pv.puddles.push({ x: s.tx, y: s.ty, life: 2.5 }); for (const t of live) if (Math.hypot(t.x - s.tx, (t.y - s.ty) / 1.6) < 0.1) pvHit(pv, t, 0.3); }
      continue;
    }
    if (s.enemy) {
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (Math.hypot(s.x - me0.x, (s.y - me0.y) / 1.6) < 0.11) { s.dead = true; pv.stored++; pv.fx.push({ type: 'ring', x: me0.x, y: me0.y, r: 0.11, life: 0.2 }); }
      continue;
    }
    if (!s.hit) s.hit = new Set(); // every shot keeps a list of what it already hit
    if (s.home && s.home.hp > 0) { const a = Math.atan2(s.home.y - s.y, s.home.x - s.x), c = Math.atan2(s.vy, s.vx), dd = Math.atan2(Math.sin(a - c), Math.cos(a - c)), na = c + Math.max(-4 * dt, Math.min(4 * dt, dd)), v = Math.hypot(s.vx, s.vy); s.vx = Math.cos(na) * v; s.vy = Math.sin(na) * v; }
    if (s.boom && !s.back && Math.hypot(s.x - me0.x, s.y - me0.y) > 0.5) { s.back = true; s.hit.clear(); }
    if (s.back) { const a = Math.atan2(me0.y - s.y, me0.x - s.x), v = Math.hypot(s.vx, s.vy); s.vx = Math.cos(a) * v; s.vy = Math.sin(a) * v; if (Math.hypot(me0.x - s.x, me0.y - s.y) < 0.03) s.dead = true; }
    s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.life != null) { s.life -= dt; if (s.life <= 0) s.dead = true; }
    if (s.x > 1.1 || s.x < -0.1 || s.y < -0.1 || s.y > 1.1) s.dead = true;
    for (const t of live) {
      if (s.hit.has(t)) continue;
      const rr = s.style === 'void' ? 0.16 : t.r + s.r;
      const d2 = Math.hypot(t.x - s.x, (t.y - s.y) / 1.6);
      if (s.style === 'void') { if (d2 < rr) { t.x += (s.x - t.x) * dt * 1.5; t.y += (s.y - t.y) * dt * 1.5; if (Math.random() < dt * 4) pvHit(pv, t, 0.08); } continue; }
      if (d2 < rr) {
        pvHit(pv, t, s.style === 'flame' ? 0.06 : s.style === 'rail' ? 0.6 : 0.3);
        if (d.elem === 'ice') t.frozen = 0.8;
        if (d.elem === 'fire') t.burn = 1;
        if (d.style === 'rail' || d.style === 'flame' || s.boom || (b.pierce || 0) > 2) s.hit.add(t);
        else { s.dead = true; break; }
      }
    }
  }
  pv.shots = pv.shots.filter(s => !s.dead);
  for (const m of pv.mines) {
    m.arm -= dt;
    if (m.arm <= 0 && !m.dead) for (const t of live) if (Math.hypot(t.x - m.x, (t.y - m.y) / 1.6) < 0.08) { m.dead = true; pv.fx.push({ type: 'ring', x: m.x, y: m.y, r: 0.14, life: 0.35 }); for (const o of live) if (Math.hypot(o.x - m.x, (o.y - m.y) / 1.6) < 0.16) pvHit(pv, o, 0.55); break; }
  }
  pv.mines = pv.mines.filter(m => !m.dead).slice(-10);
  for (const q of pv.puddles) { q.life -= dt; for (const t of live) if (Math.hypot(t.x - q.x, (t.y - q.y) / 1.6) < 0.09) { t.hp -= dt * 0.12; t.flash = Math.max(t.flash, 0.03); } }
  pv.puddles = pv.puddles.filter(q => q.life > 0);
  for (const q of pv.trail) q.life -= dt;
  pv.trail = pv.trail.filter(q => q.life > 0);
  for (const q of pv.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  pv.parts = pv.parts.filter(q => q.life > 0);
  for (const f of pv.fx) f.life -= dt;
  pv.fx = pv.fx.filter(f => f.life > 0);
}

// ---------------------------------------------------------------- drawing
function drawPreview(pv) {
  const cv = pv.canvas, dpr = Math.min(2, window.devicePixelRatio || 1);
  const W2 = cv.clientWidth, H2 = cv.clientHeight;
  if (!W2 || !H2) return;
  if (cv.width !== Math.round(W2 * dpr) || cv.height !== Math.round(H2 * dpr)) { cv.width = Math.round(W2 * dpr); cv.height = Math.round(H2 * dpr); }
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const X = x => x * W2, Y = y => y * H2, U = Math.min(W2, H2 * 1.6) * (pv.opts.mini ? 1.5 : 1);
  const c = pv.col, d = pv.def, me0 = pvShooter(pv);
  // Background: a dark slide with a faint grid and a glow in the weapon's colour.
  g.fillStyle = '#05070a'; g.fillRect(0, 0, W2, H2);
  const bg = g.createRadialGradient(X(0.5), Y(0.5), 0, X(0.5), Y(0.5), Math.max(W2, H2) * 0.7);
  bg.addColorStop(0, c + '22'); bg.addColorStop(1, '#00000000'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
  if (!pv.opts.mini) { g.strokeStyle = '#ffffff0c'; g.lineWidth = 1; for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(X(i / 10), 0); g.lineTo(X(i / 10), H2); g.stroke(); } for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, Y(i / 6)); g.lineTo(W2, Y(i / 6)); g.stroke(); } }
  g.globalCompositeOperation = 'lighter';
  for (const q of pv.trail) { g.globalAlpha = q.life / 1.6 * 0.5; g.fillStyle = c; g.beginPath(); g.arc(X(q.x), Y(q.y), U * 0.022, 0, TAU); g.fill(); }
  for (const q of pv.puddles) { g.globalAlpha = Math.min(1, q.life) * 0.35; g.fillStyle = c; g.beginPath(); g.ellipse(X(q.x), Y(q.y), U * 0.09, U * 0.09 * 0.65, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  // Targets.
  for (const t of pv.targets) {
    if (t.hp <= 0) continue;
    g.fillStyle = t.flash > 0 ? '#ffffff' : t.frozen > 0 ? '#bde0fe' : '#5a6068';
    g.beginPath(); g.arc(X(t.x), Y(t.y), U * t.r, 0, TAU); g.fill();
    g.strokeStyle = t.burn > 0 ? '#ff8a3d' : '#c9d1d9'; g.lineWidth = 1.5; g.stroke();
    if (!pv.opts.mini) { g.fillStyle = '#000'; g.fillRect(X(t.x) - U * 0.04, Y(t.y) - U * t.r - 7, U * 0.08, 3); g.fillStyle = '#e6e6e6'; g.fillRect(X(t.x) - U * 0.04, Y(t.y) - U * t.r - 7, U * 0.08 * Math.max(0, t.hp), 3); }
  }
  for (const m of pv.mines) { g.fillStyle = '#111'; g.beginPath(); g.arc(X(m.x), Y(m.y), U * 0.018, 0, TAU); g.fill(); g.fillStyle = m.arm > 0 || Math.floor(pv.t * 6) % 2 ? c : '#fff'; g.beginPath(); g.arc(X(m.x), Y(m.y), U * 0.009, 0, TAU); g.fill(); }
  // Spermy.
  const ha = d.kind === 'mine' || d.kind === 'wake' ? me0.a : (pv.targets.find(t => t.hp > 0) ? Math.atan2(pv.targets.find(t => t.hp > 0).y - me0.y, pv.targets.find(t => t.hp > 0).x - me0.x) : 0);
  const hx = X(me0.x), hy = Y(me0.y), hr = U * 0.03;
  g.strokeStyle = PAL.you; g.lineWidth = Math.max(1, U * 0.006); g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - Math.cos(ha) * hr, hy - Math.sin(ha) * hr);
  for (let i = 1; i <= 10; i++) { const f = i / 10, w = Math.sin(pv.t * 18 - f * 7) * hr * 0.8 * f, L = hr + hr * 4 * f; g.lineTo(hx - Math.cos(ha) * L - Math.sin(ha) * w, hy - Math.sin(ha) * L + Math.cos(ha) * w); }
  g.stroke(); g.lineCap = 'butt';
  g.fillStyle = PAL.you; g.beginPath(); g.ellipse(hx, hy, hr * 1.2, hr * 0.85, ha, 0, TAU); g.fill();
  if (d.kind === 'siphon') { g.setLineDash([4, 5]); g.strokeStyle = c + 'aa'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(hx, hy, U * 0.11, U * 0.11, 0, 0, TAU); g.stroke(); g.setLineDash([]); }
  // Orbiting blades.
  g.globalCompositeOperation = 'lighter';
  if (d.kind === 'orbit') {
    const n = Math.min(5, d.base.count || 3);
    for (let i = 0; i < n; i++) { const a = pv.ang + i / n * TAU, x = X(me0.x) + Math.cos(a) * U * 0.13, y = Y(me0.y) + Math.sin(a) * U * 0.13; pvGlow(g, x, y, U * 0.05, c); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, U * 0.014, 0, TAU); g.fill(); }
  }
  // Projectiles.
  for (const s of pv.shots) {
    if (s.lob) { const x = X(s.sx + (s.tx - s.sx) * s.k), y = Y(s.sy + (s.ty - s.sy) * s.k) - Math.sin(s.k * Math.PI) * H2 * 0.18; pvGlow(g, x, y, U * 0.03, c); g.fillStyle = c; g.beginPath(); g.arc(x, y, U * 0.012, 0, TAU); g.fill(); continue; }
    const x = X(s.x), y = Y(s.y), a = Math.atan2(s.vy, s.vx);
    if (s.enemy) { g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.strokeStyle = '#ffffff99'; g.beginPath(); g.arc(x, y, U * 0.01, 0, TAU); g.fill(); g.stroke(); g.globalCompositeOperation = 'lighter'; continue; }
    switch (s.style) {
      case 'flame': pvGlow(g, x, y, U * (0.03 + (0.4 - s.life) * 0.12), c, 0.8); break;
      case 'rail': g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.moveTo(x - Math.cos(a) * U * 0.12, y - Math.sin(a) * U * 0.12); g.lineTo(x, y); g.stroke(); break;
      case 'void': g.globalCompositeOperation = 'source-over'; pvGlow(g, x, y, U * 0.16, c, 0.5); g.fillStyle = '#000'; g.beginPath(); g.arc(x, y, U * 0.035, 0, TAU); g.fill(); g.strokeStyle = c; g.lineWidth = 2; g.stroke(); g.globalCompositeOperation = 'lighter'; break;
      case 'glaive': g.save(); g.translate(x, y); g.rotate(pv.t * 18); g.fillStyle = c; g.beginPath(); for (let i = 0; i < 10; i++) { const aa = i / 10 * TAU, rr = i % 2 ? U * 0.012 : U * 0.028; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.fill(); g.restore(); break;
      case 'sperm': g.strokeStyle = c; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); for (let i = 1; i <= 6; i++) { const f = i / 6, w = Math.sin(pv.t * 25 - f * 6) * U * 0.008 * f; g.lineTo(x - Math.cos(a) * U * 0.05 * f - Math.sin(a) * w, y - Math.sin(a) * U * 0.05 * f + Math.cos(a) * w); } g.stroke(); g.fillStyle = c; g.beginPath(); g.ellipse(x, y, U * 0.012, U * 0.008, a, 0, TAU); g.fill(); break;
      case 'shard': case 'needle': case 'bolt': g.strokeStyle = c; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - Math.cos(a) * U * 0.04, y - Math.sin(a) * U * 0.04); g.lineTo(x, y); g.stroke(); break;
      default: pvGlow(g, x, y, U * 0.025, c, 0.6); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, U * 0.008, 0, TAU); g.fill();
    }
  }
  for (const f of pv.fx) {
    g.globalAlpha = Math.min(1, f.life * 5);
    if (f.type === 'bolt') { g.strokeStyle = c; for (const [lw, al] of [[6, 0.3], [2, 1]]) { g.globalAlpha = al * Math.min(1, f.life * 6); g.lineWidth = lw; g.beginPath(); g.moveTo(X(f.a.x), Y(f.a.y)); for (let i = 1; i < 5; i++) { const k = i / 5; g.lineTo(X(f.a.x + (f.b.x - f.a.x) * k) + (Math.random() - 0.5) * 10, Y(f.a.y + (f.b.y - f.a.y) * k) + (Math.random() - 0.5) * 10); } g.lineTo(X(f.b.x), Y(f.b.y)); g.stroke(); } }
    else if (f.type === 'sweep') { const k = f.life / 0.3; g.globalAlpha = k * 0.6; g.fillStyle = c; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r, f.a - 1.2, f.a + 1.2); g.arc(X(f.x), Y(f.y), U * f.r * 0.5, f.a + 1.2, f.a - 1.2, true); g.closePath(); g.fill(); g.globalAlpha = k; g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r, f.a - 1.2, f.a + 1.2); g.stroke(); }
    else if (f.type === 'lash') { const k = f.life / 0.3, L = f.r * Math.min(1, (1 - k) * 4); g.globalAlpha = k; g.strokeStyle = c; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); for (let i = 0; i <= 10; i++) { const t = i / 10, wob = Math.sin(t * 9 + pv.t * 20) * 0.015 * t; g.lineTo(X(f.x + Math.cos(f.a) * L * t - Math.sin(f.a) * wob), Y(f.y + (Math.sin(f.a) * L * t + Math.cos(f.a) * wob) * 1.6)); } g.stroke(); g.lineCap = 'butt'; }
    else if (f.type === 'pulse') { const k = f.life / 0.3, R = U * f.r * (0.6 + 0.4 * (1 - k)); g.globalAlpha = k * 0.8; g.fillStyle = c; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.moveTo(X(f.x) + Math.cos(a - 0.12) * R * 0.55, Y(f.y) + Math.sin(a - 0.12) * R * 0.55); g.lineTo(X(f.x) + Math.cos(a) * R, Y(f.y) + Math.sin(a) * R); g.lineTo(X(f.x) + Math.cos(a + 0.12) * R * 0.55, Y(f.y) + Math.sin(a + 0.12) * R * 0.55); } g.fill(); }
    else { g.strokeStyle = c; g.lineWidth = 3; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r * (1.2 - f.life), 0, TAU); g.stroke(); }
  }
  g.globalAlpha = 1;
  g.fillStyle = '#fff';
  for (const q of pv.parts) { g.globalAlpha = q.life * 2; g.fillRect(X(q.x), Y(q.y), 2, 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function pvGlow(g, x, y, r, c, a) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, c + Math.round((a == null ? 0.7 : a) * 255).toString(16).padStart(2, '0')); gr.addColorStop(1, c + '00');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
