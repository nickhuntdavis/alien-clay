// Rubber physics for the Latex Barrier Feat and the Rubber Johnny relic. The film is a ring of points on
// springs (rbRing): a hit dents it where it lands and the dent wobbles back out.
// - Enemies bounce off the film's edge (rubberPush): pushed out by what the film won't give, an impulse on first
//   contact (0.8 bounce), heavier ones (bigger, bosses) dent it deeper and get pushed back less.
// - Enemy bullets are caught (rubberCatch): the film stretches round them for 0.2s, then flings them back out at the
//   mirrored angle, x1.1 faster, as your shots. Each held bullet glows faintly.
// - Rubber Johnny's skin (rubberJohnny): the caught hit dents it and wobbles; a caught bullet is flung back the way it came.
// Hooks: game.js updateEnemies (rubberPush), the enemy-bullet loop (rubberCatch), update (rubberTick);
// render.js player draw (rbRad in the barrier film, drawRubber); bosspack.js bpRelicIn (rubberJohnny).
const RB = { n: 24, k: 260, c: 120, damp: 9, hold: 0.2, speed: 1.1, maxHeld: 14, bounce: 0.8, give: 0.45 };

function rbRing(n) { return { n, off: new Float32Array(n), vel: new Float32Array(n) }; }
function rbG() {
  if (!G.rbBar) { G.rbBar = rbRing(RB.n); G.rbJon = rbRing(16); G.rbHeld = []; }
  return G;
}
function rbIdx(rg, a) { return ((Math.round(a / TAU * rg.n) % rg.n) + rg.n) % rg.n; }
// Push the film inwards at angle a, at least `depth` deep (and its neighbours a bit); kick: extra wobble.
function rbPoke(rg, a, depth, kick) {
  const i = rbIdx(rg, a), n = rg.n;
  for (const [j, k] of [[i, 1], [(i + 1) % n, 0.55], [(i + n - 1) % n, 0.55]]) {
    rg.off[j] = Math.min(rg.off[j], -depth * k);
    if (kick) rg.vel[j] -= kick * k;
  }
}
function rbTickRing(rg, dt) {
  const n = rg.n, o = rg.off, v = rg.vel;
  for (let i = 0; i < n; i++) {
    const acc = -RB.k * o[i] + RB.c * (o[(i + 1) % n] + o[(i + n - 1) % n] - 2 * o[i]) - RB.damp * v[i];
    v[i] += acc * dt;
  }
  for (let i = 0; i < n; i++) o[i] += v[i] * dt;
}
// How far the film is dented in at angle a (world units, negative = inwards).
function rbRad(rg, a) {
  if (!rg) return 0;
  const f = ((a / TAU) * rg.n % rg.n + rg.n) % rg.n, i = Math.floor(f) % rg.n, t = f - Math.floor(f);
  return rg.off[i] * (1 - t) + rg.off[(i + 1) % rg.n] * t;
}

function rbShot(x, y, vx, vy, dmg, wname, w) {
  if (G.proj.length >= CAPS.proj) return;
  const sp = Math.hypot(vx, vy);
  G.proj.push({ x, y, vx, vy, speed: sp, r: 5, dmg, pierce: 1, life: 1, max: 1, w,
    src: { elem: 'arcane', wname }, color: '#48cae4', style: 'bullet', explode: 0, homing: 0, bounce: 0, boomerang: 0, chainHit: 0, aura: 0, pull: 0, hits: null, tick: 0, dead: false });
}

function rubberTick(dt) {
  if (!G) return;
  rbG();
  const st = Math.min(dt, 1 / 30);
  rbTickRing(G.rbBar, st); rbTickRing(G.rbJon, st);
  const p = me(), R = G.barrierR, bs = G.spells.find(w => w && w.id === 'barrier');
  for (let i = G.rbHeld.length - 1; i >= 0; i--) {
    const h = G.rbHeld[i], k = Math.min(1, (G.t - h.t0) / RB.hold);
    rbPoke(G.rbBar, h.a, h.depth * Math.sin(k * Math.PI * 0.5), 0); // the film stretches round it
    h.x = p.x + Math.cos(h.a) * (R - h.depth * k); h.y = p.y + Math.sin(h.a) * (R - h.depth * k);
    if (G.t >= h.t0 + RB.hold || !(G.barrier > 0)) {
      G.rbHeld.splice(i, 1);
      if (bs) rbShot(h.x, h.y, h.vx, h.vy, G.barrierDmg, 'Latex Barrier', bs);
      const ri = rbIdx(G.rbBar, h.a); G.rbBar.vel[ri] += 260; // the snap back out
      spawnPart(h.x, h.y, '#f0e8d6', 4, 120, 0.25, 2);
    }
  }
}

// An enemy against the film: returns nothing; moves it and its knockback.
function rubberPush(e, dt) {
  if (e.charmed || e.egg || e.phased) return;
  rbG();
  const p = me(), dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1, R = G.barrierR, pen = R + e.r - d;
  if (pen <= 0) return;
  const nx = dx / d, ny = dy / d, a = Math.atan2(dy, dx);
  const m = Math.pow(e.r / 14, 2) * (e.boss || e.bossDef ? 4 : 1), give = m / (m + 3);
  const dent = Math.min(R * RB.give, pen * give);
  const fresh = !(e.rbT > G.t - 0.25);
  // How fast it is coming in.
  const vn = -((e.svx || 0) * nx + (e.svy || 0) * ny) - (e.kx * nx + e.ky * ny);
  rbPoke(G.rbBar, a, dent, fresh ? Math.max(0, vn) * 0.6 + 40 * give : 0);
  // The film gives `dent`; anything deeper is pushed straight back out.
  const out = pen - dent;
  if (out > 0) { e.x += nx * out; e.y += ny * out; }
  // Never keep moving inwards through the film; on first contact it springs back off.
  const kin = e.kx * nx + e.ky * ny;
  if (kin < 0) { e.kx -= kin * nx; e.ky -= kin * ny; }
  if (fresh) {
    const imp = (180 + Math.max(0, vn) * (1 + RB.bounce)) / (1 + m);
    e.kx += nx * imp; e.ky += ny * imp;
  }
  e.rbT = G.t;
  if (!(e.hitT.b > G.t)) { e.hitT.b = G.t + 0.4; damageEnemy(e, G.barrierDmg, { elem: 'arcane', wname: 'Latex Barrier' }); }
}

// An enemy bullet inside the film: caught (returns true; the bullet is used up).
function rubberCatch(b, dx, dy) {
  rbG();
  const bs = G.spells.find(w => w && w.id === 'barrier');
  const d = Math.hypot(dx, dy) || 1, nx = dx / d, ny = dy / d;
  const vn = b.vx * nx + b.vy * ny, sp = Math.max(300, Math.hypot(b.vx, b.vy) * RB.speed);
  let rx = b.vx - 2 * vn * nx, ry = b.vy - 2 * vn * ny;
  if (rx * nx + ry * ny <= 0) { rx = nx; ry = ny; } // (grazing: straight out)
  const rl = Math.hypot(rx, ry) || 1; rx = rx / rl * sp; ry = ry / rl * sp;
  if (G.rbHeld.length >= RB.maxHeld) { if (bs) rbShot(b.x, b.y, rx, ry, G.barrierDmg, 'Latex Barrier', bs); return true; }
  const a = Math.atan2(dy, dx);
  G.rbHeld.push({ a, t0: G.t, vx: rx, vy: ry, x: b.x, y: b.y, depth: Math.min(G.barrierR * 0.35, 8 + Math.hypot(b.vx, b.vy) * 0.03), color: b.color || PAL.danger });
  rbPoke(G.rbBar, a, 2, 120);
  return true;
}

// Rubber Johnny caught a hit: dent the skin where it landed; a caught bullet goes back the way it came.
function rubberJohnny(ent) {
  rbG();
  const p = me(), b = G.hitFrom && G.ebul.includes(G.hitFrom) ? G.hitFrom : null, src = b || ent;
  const a = src && src.x != null ? Math.atan2(src.y - p.y, src.x - p.x) : Math.random() * TAU;
  rbPoke(G.rbJon, a, 9, 220);
  G.rbJonT = G.t + 0.8;
  if (b && b.vx != null) {
    const s = Math.max(300, Math.hypot(b.vx, b.vy) * RB.speed), l = Math.hypot(b.vx, b.vy) || 1;
    rbShot(p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20, -b.vx / l * s, -b.vy / l * s, (20 + G.level * 4) * G.P.might, 'Rubber Johnny', null);
  }
}

// Drawn round you, after the barrier film: held bullets, and Rubber Johnny's skin while it wobbles.
function drawRubber(px, py) {
  if (!G || !G.rbBar) return;
  for (const h of G.rbHeld) {
    const x = sx(h.x), y = sy(h.y);
    glow(x, y, 12 * S, '#fff2c8', 0.35);
    ctx.globalAlpha = 0.9; ctx.fillStyle = h.color; ctx.beginPath(); ctx.arc(x, y, 4 * S, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (G.rbJonT > G.t) {
    const al = Math.min(1, (G.rbJonT - G.t) / 0.4), R = 24 * S * playerScale(), n = 40;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = R + rbRad(G.rbJon, a) * S; i ? ctx.lineTo(px + Math.cos(a) * r, py + Math.sin(a) * r) : ctx.moveTo(px + Math.cos(a) * r, py + Math.sin(a) * r); }
    ctx.globalAlpha = 0.18 * al; ctx.fillStyle = '#d8f4ec'; ctx.fill();
    ctx.globalAlpha = 0.85 * al; ctx.strokeStyle = '#9fe8d8'; ctx.lineWidth = Math.max(2, 3 * S); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
