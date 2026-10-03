'use strict';
// Spawn Prawn - the Sperminator and the Alien Sperm (two new enemies), the status-effect VFX (burning,
// poisoned, chilled/frozen, electrocuted) and the stain-gated health and armour rings.

// ================================================================ new enemies
Object.assign(ENEMIES, {
  // A nanobot hunter-killer built in a lab to win the race. Locks on with a red laser, fires a burst, and
  // when you destroy it, it isn't finished: the chrome endoskeleton climbs out and keeps coming.
  sperminator: { name: 'Booster', hp: 120, speed: 62, armour: 6, r: 14, dmg: 14, xp: 10, color: '#b8c4cc', shape: 'sperminator', ai: 'sperminator', from: 300, w: 1.1, rebuild: 'endoskeleton',
    shoot: { pattern: 'aimed', cd: 4, speed: 360, dmg: 9 } },
  endoskeleton: { name: 'Second Dose', hp: 45, speed: 92, armour: 0, r: 12, dmg: 12, xp: 6, color: '#dfe7ec', shape: 'sperminator', ai: 'sperminator', from: 99999, w: 0, endo: true,
    shoot: { pattern: 'aimed', cd: 3, speed: 360, dmg: 7 } },
  // From somewhere a long way from here. It weaves in, crouches and pounces, and bleeds acid when it dies.
  alien: { name: 'Natural Killer', hp: 48, speed: 70, armour: 2, r: 13, dmg: 13, xp: 6, color: '#3a3d4a', shape: 'alien', ai: 'alien', from: 180, w: 1.3 },
});

// Behaviour (from updateEnemies' switch): returns the swim direction and speed, or nothing for a plain chase.
const FOE_INTRO = {
  sperminator: ['BOOSTER', 'A nanobot hunter-killer. It locks on with a red laser before it fires, so move when you see the beam. Destroying it is only half the job.'],
  alien: ['NATURAL KILLER', 'Not from round here. It weaves in, crouches, then pounces: get clear when it crouches. Its blood is acid.'],
};
function foeIntro(e) {
  const k = e.def.endo ? null : e.def.ai, seen = G.foeSeen || (G.foeSeen = {});
  if (!k || seen[k] || !FOE_INTRO[k]) return;
  seen[k] = true; sysMsg(FOE_INTRO[k][0], FOE_INTRO[k][1], PAL.danger, true);
}
const FOE_AI = {
  sperminator(e, dt, dist, ux, uy, dx, dy) {
    foeIntro(e);
    const sh = e.def.shoot;
    e.shootCd -= dt;
    if (e.aimT > 0) {
      // Locked on: it stops, the laser sight settles on you, then a three-round burst.
      e.aimT -= dt; e.aimA = Math.atan2(dy, dx);
      if (e.aimT <= 0) {
        for (let i = 0; i < 3; i++) after(i * 0.09, () => { if (!e.dead) eBullet(e.x, e.y, e.aimA + rand(-0.04, 0.04), sh.speed, e.dmg * 0.6, 4, '#ff3b3b'); });
        e.shootCd = sh.cd * rand(0.9, 1.1);
      }
      return { x: ux, y: uy, s: 0 };
    }
    if (e.shootCd <= 0 && dist < 480) { e.aimT = 0.7; e.aimA = Math.atan2(dy, dx); }
    // Relentless: never faster, never slower, straight at you.
    return { x: ux, y: uy, s: e.speed };
  },
  alien(e, dt, dist, ux, uy) {
    foeIntro(e);
    // st 0: weaving in. st 1: crouched (a tell). st 2: the pounce.
    e.stT -= dt;
    if (e.st === 1) { if (e.stT <= 0) { e.st = 2; e.stT = 0.38; e.dashX = ux; e.dashY = uy; } return { x: ux, y: uy, s: 0 }; }
    if (e.st === 2) { if (e.stT <= 0) { e.st = 0; e.stT = rand(1.8, 2.6); } return { x: e.dashX, y: e.dashY, s: e.speed * 5 }; }
    if (dist < 180 && e.stT <= 0) { e.st = 1; e.stT = 0.4; return { x: ux, y: uy, s: 0 }; }
    const w = Math.sin(e.age * 4 + e.id) * 0.9;
    return { x: ux * Math.cos(w) - uy * Math.sin(w), y: uy * Math.cos(w) + ux * Math.sin(w), s: e.speed };
  },
};
// From killEnemy.
function foeKill(e) {
  if (e.def.rebuild && !e.charmed && G.enemies.length < CAPS.enemies) {
    const x = e.x, y = e.y, elite = e.elite;
    floatText(x, y - 30, "I'LL BE BACK", '#ff3b3b', 15, 1.4);
    spawnPart(x, y, '#b8c4cc', 14, 200, 0.5, 3);
    after(1, () => {
      if (G.state !== 'play' && G.state !== 'loot') return;
      const z = makeEnemy(ENEMIES[e.def.rebuild], x, y, elite ? { elite: true } : undefined);
      G.enemies.push(z);
      ring(x, y, 40, '#ff3b3b', 0.4, 3);
      floatText(x, y - 26, 'REBOOTING', '#dfe7ec', 12, 0.8);
    });
  }
  if (e.def.ai === 'alien') {
    // Acid for blood: a sizzling pool where it fell.
    addHazard(e.x, e.y, 30 + e.r, 3, e.dmg * 0.6, '#9ef01a', 'Acid blood', 0.35);
    fxParts('drop', e.x, e.y, '#9ef01a', 10, 180, 0.5, 3);
  }
}

// Drawing. Robot: a chrome head with panel lines, a glowing red eye and a segmented metal tail. Endoskeleton:
// just the frame. Alien: a long ridged dome of a head, a jaw that shoots out, a barbed tail.
function foeTail(e, x, y, face, r, len) {
  const back = r * 0.95, wx = e.x - Math.cos(face) * back / S, wy = e.y - Math.sin(face) * back / S;
  if (e.tailV == null) { e.tailV = 0; e.px = e.x; e.py = e.y; }
  const fdt = Math.max(1e-3, G.realT - (e.tailT2 || G.realT)); e.tailT2 = G.realT;
  e.tailV = Math.hypot(e.x - e.px, e.y - e.py) / fdt; e.px = e.x; e.py = e.y;
  stepTail(e, wx, wy, face, len, e.tailV, e.def.ai === 'alien' ? 1.4 : 0.7, 14);
  return e.tailDraw || [];
}
MICROBES.sperminator = (e, x, y, r, face) => {
  const T = foeTail(e, x, y, face, r, r / S * 4.2), endo = e.def.endo, fl = e.flash > 0;
  // Tail: vertebrae, big to small.
  for (let i = T.length - 1; i >= 1; i--) {
    const q = T[i], k = 1 - i / T.length, rr = Math.max(1, r * 0.22 * (0.4 + k));
    ctx.fillStyle = fl ? '#ffffff' : endo ? '#e6edf2' : i % 2 ? '#8a969e' : '#c9d3da';
    ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), rr, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgb(30,34,38)'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  if (endo) {
    // The frame: ribs round an empty skull.
    ctx.strokeStyle = fl ? '#ffffff' : '#e6edf2'; ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r * 0.8, 0, 0, TAU); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); ctx.quadraticCurveTo(0, s * r * 0.9, r * 0.7, s * r * 0.25); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-r * 0.9, 0); ctx.lineTo(r * 0.9, 0); ctx.stroke();
  } else {
    const g = ctx.createLinearGradient(0, -r, 0, r);
    g.addColorStop(0, '#f1f5f8'); g.addColorStop(0.45, '#8f9ba3'); g.addColorStop(0.55, '#5d6870'); g.addColorStop(1, '#c9d3da');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.15, r * 0.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgb(24,28,32)'; ctx.lineWidth = Math.max(1.2, r * 0.08); ctx.stroke();
    // Panel lines and rivets.
    ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-r * 0.3, -r * 0.78); ctx.lineTo(-r * 0.3, r * 0.78); ctx.moveTo(r * 0.35, -r * 0.7); ctx.lineTo(r * 0.35, r * 0.7); ctx.stroke();
    ctx.fillStyle = 'rgb(24,28,32)'; for (const [a, b] of [[-0.6, -0.45], [-0.6, 0.45], [0.05, -0.6], [0.05, 0.6]]) { ctx.beginPath(); ctx.arc(r * a, r * b, Math.max(0.8, r * 0.06), 0, TAU); ctx.fill(); }
  }
  // The eye: a red light that never blinks (red even on a greyscale slide).
  RAW_COL = true;
  const lock = e.aimT > 0, glowA = lock ? 0.9 : 0.55 + 0.25 * Math.sin(G.realT * 6 + e.id);
  ctx.globalCompositeOperation = 'lighter';
  const eg = ctx.createRadialGradient(r * 0.62, -r * 0.08, 0, r * 0.62, -r * 0.08, r * (lock ? 1 : 0.6));
  eg.addColorStop(0, `rgba(255,40,40,${glowA})`); eg.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(r * 0.62, -r * 0.08, r * (lock ? 1 : 0.6), 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(r * 0.62, -r * 0.08, Math.max(1.5, r * 0.13), 0, TAU); ctx.fill();
  RAW_COL = false;
  ctx.restore();
  // The laser sight while it's locking on.
  if (e.aimT > 0) {
    RAW_COL = true;
    ctx.strokeStyle = `rgba(255,30,30,${0.35 + 0.5 * (1 - e.aimT / 0.7)})`; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(face) * r * 0.7, y + Math.sin(face) * r * 0.7); ctx.lineTo(sx(G.player.x), sy(G.player.y)); ctx.stroke();
    ctx.fillStyle = '#ff2020'; ctx.beginPath(); ctx.arc(sx(G.player.x), sy(G.player.y), 2.5, 0, TAU); ctx.fill();
    RAW_COL = false;
  }
};
MICROBES.alien = (e, x, y, r, face) => {
  const T = foeTail(e, x, y, face, r, r / S * 5), fl = e.flash > 0, crouch = e.st === 1, pounce = e.st === 2;
  // Tail: a dark ribbed whip ending in a barb.
  ctx.strokeStyle = fl ? '#ffffff' : '#23252e'; ctx.lineCap = 'round';
  for (let i = 1; i < T.length; i++) { const a = T[i - 1], b = T[i], k = 1 - i / T.length; ctx.lineWidth = Math.max(1, r * 0.3 * (0.3 + k)); ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke(); }
  if (T.length > 2) {
    const a = T[T.length - 2], b = T[T.length - 1], ang = Math.atan2(b.y - a.y, b.x - a.x), bx = sx(b.x), by = sy(b.y);
    ctx.fillStyle = '#23252e'; ctx.beginPath(); ctx.moveTo(bx + Math.cos(ang) * r * 0.6, by + Math.sin(ang) * r * 0.6); ctx.lineTo(bx + Math.cos(ang + 2.4) * r * 0.35, by + Math.sin(ang + 2.4) * r * 0.35); ctx.lineTo(bx + Math.cos(ang - 2.4) * r * 0.35, by + Math.sin(ang - 2.4) * r * 0.35); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(face);
  const sq = crouch ? 0.85 : pounce ? 1.15 : 1;
  ctx.scale(sq, 1 / sq);
  // A long glossy dome, swept back.
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#5b6070'); g.addColorStop(0.5, '#1d1f27'); g.addColorStop(1, '#3a3d4a');
  ctx.fillStyle = fl ? '#ffffff' : g;
  ctx.beginPath(); ctx.moveTo(r * 1.1, 0); ctx.quadraticCurveTo(r * 0.6, -r * 0.85, -r * 1.5, -r * 0.35); ctx.quadraticCurveTo(-r * 1.1, 0, -r * 1.5, r * 0.35); ctx.quadraticCurveTo(r * 0.6, r * 0.85, r * 1.1, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(200,210,230,0.5)'; ctx.lineWidth = 1; ctx.stroke();
  // Ridges along the dome, and a highlight.
  ctx.strokeStyle = 'rgba(160,170,190,0.45)';
  for (let i = 0; i < 4; i++) { const u = -r * 1.2 + i * r * 0.45; ctx.beginPath(); ctx.moveTo(u, -r * 0.25); ctx.quadraticCurveTo(u + r * 0.12, 0, u, r * 0.25); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(r * 0.1, -r * 0.35, r * 0.5, r * 0.1, -0.15, 0, TAU); ctx.fill();
  // Teeth, and the inner jaw that shoots out on the pounce.
  ctx.fillStyle = '#e8e6dc';
  for (let i = 0; i < 4; i++) { const u = r * (0.5 + i * 0.13); ctx.beginPath(); ctx.moveTo(u, -r * 0.12); ctx.lineTo(u + r * 0.05, 0); ctx.lineTo(u + r * 0.1, -r * 0.12); ctx.fill(); ctx.beginPath(); ctx.moveTo(u, r * 0.12); ctx.lineTo(u + r * 0.05, 0); ctx.lineTo(u + r * 0.1, r * 0.12); ctx.fill(); }
  const jaw = pounce ? r * 0.9 : crouch ? r * 0.15 : 0;
  if (jaw > 0) {
    ctx.strokeStyle = '#4a4d58'; ctx.lineWidth = Math.max(1.5, r * 0.14); ctx.beginPath(); ctx.moveTo(r * 0.8, 0); ctx.lineTo(r * 0.8 + jaw, 0); ctx.stroke();
    ctx.fillStyle = '#e8e6dc'; ctx.beginPath(); ctx.arc(r * 0.8 + jaw, 0, Math.max(1.5, r * 0.12), 0, TAU); ctx.fill();
  }
  // Acid drool (green on any slide).
  RAW_COL = true;
  ctx.fillStyle = '#9ef01a'; const dr = (G.realT * 1.3 + e.id * 0.37) % 1;
  ctx.globalAlpha *= 1 - dr; ctx.beginPath(); ctx.ellipse(r * 0.7, r * 0.2 + dr * r * 0.8, r * 0.07, r * 0.12, 0, 0, TAU); ctx.fill();
  RAW_COL = false;
  ctx.restore();
};

// ================================================================ status effects
// Burning: flame tongues licking up off it and embers rising. Poisoned: a sickly film, bubbles and a drip.
// Chilled: frost specks circling; frozen: a block of ice with a glint. Electrocuted: arcs crawling round it.
function drawStatusFx(e, x, y, r) {
  const t = G.realT, id = e.id, a0 = ctx.globalAlpha;
  if (e.poison > 0) {
    ctx.globalAlpha = a0 * 0.3; ctx.fillStyle = '#8dff4a'; ctx.beginPath(); ctx.arc(x, y, r * 0.95, 0, TAU); ctx.fill();
    ctx.globalAlpha = a0;
    // (Batched: the bubbles share one path and one stroke.)
    ctx.strokeStyle = '#b5e48c'; ctx.lineWidth = Math.max(1, r * 0.07); ctx.globalAlpha = a0 * 0.6; ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.7 + i / 3 + id * 0.13) % 1, bx = x + Math.sin(i * 2.1 + id) * r * 0.6, by = y - r * 0.2 - k * r * 1.6, br = Math.max(1.2, r * (0.1 + 0.1 * k));
      ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, TAU);
    }
    ctx.stroke();
    const dk = (t * 0.9 + id * 0.31) % 1;
    ctx.globalAlpha = a0 * (1 - dk); ctx.fillStyle = '#8dff4a'; ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * (0.9 + dk), Math.max(1, r * 0.07), Math.max(1.5, r * 0.13), 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = a0;
  }
  if (e.burn > 0) {
    // Solid flames (not additive) so they read on a pale slide too.
    // (Batched: all five outer tongues in one fill, all five cores in another.)
    ctx.globalAlpha = a0 * 0.9;
    for (const [c, k] of [['#ff5a36', 1], ['#ffd166', 0.55]]) {
      ctx.fillStyle = c; ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + (i - 2) * 0.42, fx = x + Math.cos(an) * r * 0.8, fy = y + Math.sin(an) * r * 0.8;
        const fl = r * (0.45 + 0.25 * Math.sin(t * 13 + i * 2.3 + id)), sw = Math.sin(t * 9 + i + id) * r * 0.12;
        ctx.moveTo(fx - r * 0.16 * k, fy); ctx.quadraticCurveTo(fx - r * 0.14 * k, fy - fl * k, fx + sw, fy - fl * 1.5 * k); ctx.quadraticCurveTo(fx + r * 0.14 * k, fy - fl * k, fx + r * 0.16 * k, fy); ctx.closePath();
      }
      ctx.fill();
    }
    ctx.fillStyle = '#ffba08'; ctx.globalAlpha = a0 * 0.6; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const k = (t * 1.1 + i / 3 + id * 0.17) % 1, ex = x + Math.sin(i * 3 + id + t) * r * 0.7, ey = y - r - k * r * 1.8, er = Math.max(1, r * 0.06); ctx.moveTo(ex + er, ey); ctx.arc(ex, ey, er, 0, TAU); }
    ctx.fill();
    ctx.globalAlpha = a0;
  }
  if (e.frozen > 0) {
    // A block of ice round it: a faceted shell, crystals, and a glint sweeping across.
    ctx.globalAlpha = a0 * 0.5; ctx.fillStyle = '#bde0fe'; ctx.beginPath();
    for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + id * 0.7, rr = r * (1.25 + 0.12 * ((i * 7 + id) % 3)); ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = a0 * 0.9; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke();
    ctx.globalAlpha = a0 * 0.7; ctx.fillStyle = '#e6f4ff'; ctx.beginPath();
    for (let i = 0; i < 7; i++) { const an = i / 7 * TAU + id, L = r * (1.35 + (i % 3) * 0.15); ctx.moveTo(x + Math.cos(an - 0.12) * r * 1.1, y + Math.sin(an - 0.12) * r * 1.1); ctx.lineTo(x + Math.cos(an) * L, y + Math.sin(an) * L); ctx.lineTo(x + Math.cos(an + 0.12) * r * 1.1, y + Math.sin(an + 0.12) * r * 1.1); }
    ctx.fill();
    const gk = (t * 0.6 + id * 0.2) % 1.6;
    if (gk < 1) { ctx.globalAlpha = a0 * Math.sin(gk * Math.PI); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1.5, r * 0.12); ctx.beginPath(); ctx.moveTo(x - r + gk * r * 2, y - r * 0.9); ctx.lineTo(x - r * 0.6 + gk * r * 2, y + r * 0.9); ctx.stroke(); }
    ctx.globalAlpha = a0;
  } else if (e.chill > 0) {
    // Chilled: frost specks circling slowly.
    ctx.fillStyle = '#caf0f8';
    // Little crosses, turning; drawn as one path (no save/rotate per speck).
    ctx.globalAlpha = a0 * 0.85; ctx.strokeStyle = '#caf0f8'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const an = t * 0.8 + i / 5 * TAU + id, rr = r * 1.15, cx = x + Math.cos(an) * rr, cy = y + Math.sin(an) * rr, s = Math.max(1.5, r * 0.12), ro = t * 2 + i, c = Math.cos(ro) * s, sn = Math.sin(ro) * s;
      ctx.moveTo(cx - c, cy - sn); ctx.lineTo(cx + c, cy + sn); ctx.moveTo(cx + sn, cy - c); ctx.lineTo(cx - sn, cy + c);
    }
    ctx.stroke();
    ctx.globalAlpha = a0;
  }
  if (e.soapT > G.t) {
    // Soaped (Bubble Bath): a sheen and a few clinging suds.
    ctx.globalAlpha = a0 * 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const an = i * 1.6 + id, br = Math.max(1.5, r * 0.16), cx = x + Math.cos(an) * r * 0.85, cy = y + Math.sin(an) * r * 0.85; ctx.moveTo(cx + br, cy); ctx.arc(cx, cy, br, 0, TAU); }
    ctx.stroke(); ctx.globalAlpha = a0;
  }
  if (e.dazeT > G.t) {
    // Dazed (out of a popped bubble): little stars circling over its head.
    ctx.globalAlpha = a0; ctx.fillStyle = '#ffffff'; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const an = t * 5 + i / 3 * TAU, sx2 = x + Math.cos(an) * r * 0.8, sy2 = y - r * 1.25 + Math.sin(an) * r * 0.25, sr = Math.max(1.5, r * 0.12); ctx.moveTo(sx2 + sr, sy2); ctx.arc(sx2, sy2, sr, 0, TAU); }
    ctx.fill();
  }
  if (e.shock > 0) {
    // Arcs crawling round it, re-drawn every frame, with a few sparks thrown off.
    ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      const an = Math.random() * TAU, span = rand(0.8, 1.6);
      for (const [c, w, al] of [['#ffe94a', Math.max(2.5, r * 0.18), 0.35], ['#fff3b0', Math.max(1, r * 0.07), 1]]) {
        ctx.globalAlpha = a0 * al; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
        for (let j = 0; j <= 6; j++) { const b = an + span * j / 6, rr = r * (1.05 + (Math.random() - 0.5) * 0.35); j ? ctx.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr) : ctx.moveTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); }
        ctx.stroke();
      }
    }
    if (Math.random() < 0.5) { const an = Math.random() * TAU; ctx.globalAlpha = a0; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.lineTo(x + Math.cos(an) * r * 1.6, y + Math.sin(an) * r * 1.6); ctx.stroke(); }
    ctx.globalAlpha = a0;
  }
}

// ================================================================ health and armour rings
// Off by default. The Anti-Immune Stain puts rings round hurt enemies (and the Rival Dyes round rivals);
// the GFP Tag puts one round you. A ring only shows below 100%: health on the inside, armour (when it's been
// stripped) just outside it.
const ringStain = e => (e === G.player ? !!G.dyes.gfp : e.rival || e.final ? !!(G.dyes.rival || G.dyes.immuno) : !!G.dyes.immuno);
function drawHealthRing(x, y, R, hpK, armK, color) {
  const a0 = ctx.globalAlpha, top = -Math.PI / 2, lw = Math.max(2, 2.2 * Math.min(1.6, S));
  if (hpK < 0.995) {
    ctx.lineCap = 'butt';
    ctx.globalAlpha = a0; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, R, top, top + TAU * Math.max(0, hpK)); ctx.stroke();
  }
  if (armK != null && armK < 1) {
    const R2 = R + 3;
    ctx.globalAlpha = a0; ctx.strokeStyle = '#8da9c4'; ctx.lineWidth = lw * 0.7; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(x, y, R2, top, top + TAU * Math.max(0, armK)); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = a0;
}
function enemyRing(e, x, y, r) {
  if (e.boss || e.egg || !ringStain(e)) return;
  const hpK = e.hp / e.maxHp, armK = e.armour > 0 ? effArmour(e) / ((e.armour + (e.auraArm > 0 ? 4 : 0)) * (e.armK || 1)) : null;
  if (hpK >= 0.995 && !(armK != null && armK < 0.995)) return; // untouched: no ring at all
  drawHealthRing(x, y, r + 7, hpK, armK, e.rival ? e.color : e.elite ? PAL.reward : hpK < 0.3 ? PAL.danger : '#ffffff');
}
function playerRing(px, py) {
  if (!ringStain(G.player)) return;
  const p = G.player, P = G.P, hpK = p.hp / P.maxHp;
  if (p.hp >= P.maxHp - 0.5) return; // not wounded: no ring at all
  // Player armour: Bear Hug and other temporary plating count towards its max while it lasts.
  const armMax = (P.armour || 0) + (G.hugArmMax || 0), armK = armMax > 0 && G.armourLost ? Math.max(0, 1 - G.armourLost / armMax) : null;
  drawHealthRing(px, py, 24 * S * playerScale(), hpK, armK, hpK < 0.3 ? PAL.danger : PAL.you);
}

// ================================================================ Overachiever (overkill) jumps
// The damage left over from a kill leaps to the next enemy as a glowing spark on an arc: you can follow it.
function overkillJump(from, to, dmg, src) {
  const J = G.okJumps || (G.okJumps = []);
  if (J.length > 30) { damageEnemy(to, dmg, src); return; }
  J.push({ x0: from.x, y0: from.y, to, tx: to.x, ty: to.y, t: 0, dur: 0.22 + Math.min(0.2, Math.hypot(to.x - from.x, to.y - from.y) / 1200), dmg, src, side: Math.random() < 0.5 ? 1 : -1, trail: [] });
  ring(from.x, from.y, from.r + 10, '#ff924c', 0.25, 3);
}
function okPos(j, k) {
  const tx = j.to.dead ? j.tx : j.to.x, ty = j.to.dead ? j.ty : j.to.y, dx = tx - j.x0, dy = ty - j.y0, d = Math.hypot(dx, dy) || 1;
  const lift = Math.sin(k * Math.PI) * Math.min(90, d * 0.35) * j.side;
  return { x: j.x0 + dx * k - dy / d * lift, y: j.y0 + dy * k + dx / d * lift };
}
function overkillTick(dt) {
  const J = G.okJumps;
  if (!J || !J.length) return;
  for (const j of J) {
    if (!j.to.dead) { j.tx = j.to.x; j.ty = j.to.y; }
    j.t += dt;
    const k = Math.min(1, j.t / j.dur), q = okPos(j, k);
    j.trail.push(q); if (j.trail.length > 8) j.trail.shift();
    if (k >= 1) {
      j.done = true;
      if (!j.to.dead) damageEnemy(j.to, j.dmg, j.src);
      ring(q.x, q.y, (j.to.r || 12) + 14, '#ff924c', 0.3, 4);
      spawnPart(q.x, q.y, '#ffd166', 6, 160, 0.3, 2);
    }
  }
  compactArr(J, j => !j.done);
}
function drawOverkill() {
  const J = G.okJumps;
  if (!J || !J.length) return;
  ctx.lineCap = 'round';
  for (const j of J) {
    const T = j.trail;
    for (let i = 1; i < T.length; i++) {
      const k = i / T.length;
      ctx.globalAlpha = k * 0.8; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = Math.max(1.5, 5 * S * k);
      ctx.beginPath(); ctx.moveTo(sx(T[i - 1].x), sy(T[i - 1].y)); ctx.lineTo(sx(T[i].x), sy(T[i].y)); ctx.stroke();
    }
    const h = T[T.length - 1];
    if (!h) continue;
    ctx.globalCompositeOperation = 'lighter'; glow(sx(h.x), sy(h.y), 22 * S, '#ff924c', 0.8); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgb(30,30,30)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx(h.x), sy(h.y), Math.max(3, 4 * S), 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.lineCap = 'butt';
}
