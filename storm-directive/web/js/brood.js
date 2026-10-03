'use strict';
// Spawn Prawn - two more enemies.
// Brood Cyst: a slow, see-through sac full of little Broodlings. It fires them out at you one at a time and
// slowly grows more. Kill it and everyone still inside scatters, then comes back at you as kamikazes.
// Planarian: a looping, segmented flatworm. Destroy a segment and it splits in two at that point, and each
// half (each one!) very slowly grows back to full length. Planarians really do this.

Object.assign(ENEMIES, {
  brood:     { name: 'Brood Cyst', hp: 140, speed: 30, armour: 2, r: 26, dmg: 14, xp: 10, color: '#f4b6c2', shape: 'brood', ai: 'brood', from: 200, w: 1, pack: 2 },
  broodling: { name: 'Broodling', hp: 10, speed: 108, armour: 0, r: 8, dmg: 6, xp: 0.5, color: '#f4b6c2', shape: 'broodling', ai: 'broodling', from: 99999, w: 0 },
  planarian: { name: 'Planarian', hp: 34, speed: 72, armour: 1, r: 12, dmg: 10, xp: 2, color: '#d8b48a', shape: 'planarian', ai: 'planarian', from: 230, w: 0.9, pack: 1 },
});
const BROOD = { max: 6, start: 6, fireCd: 2.4, refill: 5, range: 520, launch: 430, burst: 2, fuse: 5 };
const WORM = { max: 8, gap: 1.45, grow: 10, cap: 40, turn: 1.9 };

// ================================================================ Brood Cyst
function broodInit(e) {
  e.brood = BROOD.start; e.broodT = BROOD.refill;
  e.bp = Array.from({ length: BROOD.max }, (_, i) => ({ a: i / BROOD.max * TAU + Math.random(), d: 0.3 + Math.random() * 0.35, ph: Math.random() * TAU }));
}
// Throw one Broodling at angle a. kami: it's a kamikaze (the cyst burst).
function broodOut(e, a, sp, kami) {
  if (G.enemies.length >= CAPS.enemies) return null;
  const b = makeEnemy(ENEMIES.broodling, e.x + Math.cos(a) * e.r * 0.8, e.y + Math.sin(a) * e.r * 0.8);
  b.kx = Math.cos(a) * sp; b.ky = Math.sin(a) * sp; b.spin = a;
  if (kami) { b.kami = true; b.st = 1; b.stT = rand(0.45, 0.8); b.fuse = BROOD.fuse; }
  if (e.elite) { b.hp *= 2; b.maxHp *= 2; }
  G.enemies.push(b);
  return b;
}
Object.assign(FOE_AI, {
  brood(e, dt, dist, ux, uy) {
    if (e.brood == null) broodInit(e);
    // More grow inside, slowly.
    if (e.brood < BROOD.max && (e.broodT -= dt) <= 0) { e.broodT = BROOD.refill; e.brood++; }
    e.shootCd -= dt;
    // The tell: it swells for 0.35s, then spits one out at you.
    if (e.swell > 0) {
      e.swell -= dt;
      if (e.swell <= 0 && e.brood > 0) {
        e.brood--;
        broodOut(e, Math.atan2(uy, ux) + rand(-0.15, 0.15), BROOD.launch);
        e.flash = 0.06; spawnPart(e.x + ux * e.r, e.y + uy * e.r, e.color, 6, 120, 0.3, 2);
      }
      return { x: ux, y: uy, s: 0 };
    }
    if (e.shootCd <= 0 && e.brood > 0 && dist < BROOD.range) { e.shootCd = BROOD.fireCd * rand(0.85, 1.15); e.swell = 0.35; }
    // Keeps a little distance, so it can lob them.
    if (dist < 200) return { x: -ux, y: -uy, s: e.speed * 0.8 };
    return { x: ux, y: uy, s: e.speed };
  },
  broodling(e, dt, dist, ux, uy) {
    if (!e.kami) return null; // a plain little chaser
    // Scatter, then turn and dive at you. Blows up on contact, or when its fuse runs out.
    e.stT -= dt; e.fuse -= dt;
    if (e.fuse <= 0) { e.hp = 0; killEnemy(e, { wname: 'Broodling' }); return { x: 0, y: 0, s: 0 }; }
    if (e.st === 1) { if (e.stT <= 0) e.st = 2; return { x: Math.cos(e.spin), y: Math.sin(e.spin), s: e.speed * 0.5 }; }
    if (dist < e.r + G.player.r + 8) { e.hp = 0; killEnemy(e, { wname: 'Broodling' }); return { x: 0, y: 0, s: 0 }; }
    return { x: ux, y: uy, s: e.speed * 1.7 };
  },
});
function broodKill(e) {
  if (e.def.ai === 'brood' && !e.charmed) {
    const n = (e.brood == null ? BROOD.start : e.brood) + BROOD.burst;
    for (let i = 0; i < n; i++) broodOut(e, i / n * TAU + rand(-0.2, 0.2), rand(260, 380), true);
    ring(e.x, e.y, e.r * 1.8, e.color, 0.4, 4);
    if (n > 2) floatText(e.x, e.y - e.r - 14, 'SCATTER!', '#ff4d6d', 14, 0.9);
  }
  if (e.kami) {
    // Kamikaze: a small blast that hurts you and anything else nearby.
    const r = 46, p = me();
    ring(e.x, e.y, r, '#ff2e2e', 0.3, 4); spawnPart(e.x, e.y, '#ff5a36', 8, 160, 0.35, 3);
    forNear(e.x, e.y, r, o => { if (o !== e && !o.kami) damageEnemy(o, e.dmg * 1.5, { noCrit: true, wname: 'Broodling blast', friendly: true }); });
    if (Math.hypot(p.x - e.x, p.y - e.y) < r + p.r) hurtPlayer(e.dmg * 1.2, 'Broodling blast', null, 'blast');
  }
}

// ================================================================ Planarian
// Every segment is its own enemy (so your weapons hit them one at a time); a worm is a shared object:
// { segs: [head, ...], trail: [points, newest first], ang }. The first segment to update each step moves
// the whole worm: the head steers, and the rest follow its trail.
const wormGap = W0 => W0.segs.length ? W0.segs[0].r * WORM.gap : 18;
function wormNew(segs, ang) {
  const W0 = { segs, ang, trail: [], growT: WORM.grow, tick: -1 };
  for (const s of segs) s.worm = W0;
  wormTrailFromSegs(W0);
  return W0;
}
function wormTrailFromSegs(W0) {
  W0.trail = W0.segs.map(s => ({ x: s.x, y: s.y }));
  const t = W0.segs[W0.segs.length - 1], a = W0.segs.length > 1 ? Math.atan2(t.y - W0.segs[W0.segs.length - 2].y, t.x - W0.segs[W0.segs.length - 2].x) : W0.ang + Math.PI;
  W0.trail.push({ x: t.x + Math.cos(a) * wormGap(W0) * 3, y: t.y + Math.sin(a) * wormGap(W0) * 3 });
}
// The point d along the trail (0 = the head).
function wormAt(W0, d) {
  const T = W0.trail;
  for (let i = 1; i < T.length; i++) {
    const a = T[i - 1], b = T[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (d <= l) { const k = l ? d / l : 0; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, a: Math.atan2(a.y - b.y, a.x - b.x) }; }
    d -= l;
  }
  const z = T[T.length - 1], y = T[Math.max(0, T.length - 2)];
  return { x: z.x, y: z.y, a: Math.atan2(y.y - z.y, y.x - z.x) };
}
function wormSegCount() { let n = 0; for (const e of G.enemies) if (e.worm && !e.dead) n++; return n; }
function wormTick(W0, dt) {
  W0.tick = G.t;
  // Anything that went missing without being killed (eaten, zapped, charmed) just closes the gap.
  W0.segs = W0.segs.filter(s => !s.dead && !s.charmed && s.worm === W0);
  if (!W0.segs.length) return;
  const h = W0.segs[0], p = G.player, gap = wormGap(W0);
  // Teleported (leash, or a toy)? Lay the trail out straight behind it.
  if (!W0.trail.length || Math.hypot(h.x - W0.trail[0].x, h.y - W0.trail[0].y) > gap * 4) {
    W0.trail = [{ x: h.x, y: h.y }, { x: h.x - Math.cos(W0.ang) * gap * (WORM.max + 2), y: h.y - Math.sin(W0.ang) * gap * (WORM.max + 2) }];
  }
  // The head: swims at you with a limited turn rate and a lazy wobble, so it overshoots and loops round.
  const slow = h.frozen > 0 || h.dazeT > G.t || h.tunT > G.t ? 0 : (1 - h.chillAmt) * (h.stasisT > G.realT ? 0.35 : 1) * (h.soapT > G.t ? 0.5 : 1) * (h.guiltT > G.t ? 0.6 : 1);
  const want = Math.atan2(p.y - h.y, p.x - h.x) + Math.sin(h.age * 1.1 + h.id) * 0.8;
  let da = want - W0.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
  W0.ang += Math.max(-WORM.turn * dt, Math.min(WORM.turn * dt, da)) * (slow > 0 ? 1 : 0);
  const v = h.speed * slow * (G.warp > 0 ? 0.3 : 1) * G.evm.espd * (h.tailCut ? 0.15 : 1);
  h.x += Math.cos(W0.ang) * v * dt; h.y += Math.sin(W0.ang) * v * dt;
  // Trail: a new point every few units; keep only as much as the worm needs.
  W0.trail[0] = { x: h.x, y: h.y };
  if (W0.trail.length < 2 || Math.hypot(h.x - W0.trail[1].x, h.y - W0.trail[1].y) > 4) W0.trail.unshift({ x: h.x, y: h.y });
  let len = 0;
  for (let i = 1; i < W0.trail.length; i++) { len += Math.hypot(W0.trail[i].x - W0.trail[i - 1].x, W0.trail[i].y - W0.trail[i - 1].y); if (len > gap * (WORM.max + 3)) { W0.trail.length = i + 1; break; } }
  // Everyone else follows.
  h.wa = W0.ang; h.kx = h.ky = 0;
  for (let i = 1; i < W0.segs.length; i++) { const s = W0.segs[i], q = wormAt(W0, i * gap); s.x = q.x; s.y = q.y; s.wa = q.a; s.kx = s.ky = 0; }
  // Regrowth: one new segment on the tail every few seconds, back up to full length (each piece does this).
  for (const s of W0.segs) if (s.grow < 1) s.grow = Math.min(1, s.grow + dt / 1.5);
  if (W0.segs.length < WORM.max && (W0.growT -= dt) <= 0) {
    W0.growT = WORM.grow;
    if (G.enemies.length < CAPS.enemies && wormSegCount() < WORM.cap) {
      const q = wormAt(W0, W0.segs.length * gap), s = makeEnemy(h.def, q.x, q.y, h.elite ? { elite: true } : undefined);
      s.worm = W0; s.grow = 0; s.xp *= 0.25; s.wa = q.a; // regrown segments are worth less: no farming
      W0.segs.push(s); G.enemies.push(s);
    }
  }
}
FOE_AI.planarian = (e, dt) => {
  if (!e.worm) {
    // Freshly spawned: grow a full body behind it.
    const segs = [e], a = Math.atan2(G.player.y - e.y, G.player.x - e.x);
    for (let i = 1; i < WORM.max && G.enemies.length < CAPS.enemies; i++) {
      const s = makeEnemy(e.def, e.x - Math.cos(a) * e.r * WORM.gap * i, e.y - Math.sin(a) * e.r * WORM.gap * i, e.elite ? { elite: true } : undefined);
      segs.push(s); G.enemies.push(s);
    }
    wormNew(segs, a);
  }
  if (e.worm.tick !== G.t) wormTick(e.worm, dt);
  return { x: 0, y: 0, s: 0 };
};
// Destroyed segment: the worm splits in two there. The front keeps going; the back grows a new head.
function wormKill(e) {
  const W0 = e.worm;
  if (!W0) return;
  e.worm = null;
  const i = W0.segs.indexOf(e);
  if (i < 0) return;
  const back = W0.segs.slice(i + 1);
  W0.segs = W0.segs.slice(0, i);
  W0.growT = Math.max(W0.growT, WORM.grow);
  if (back.length) {
    const a = back.length > 1 ? Math.atan2(back[0].y - back[1].y, back[0].x - back[1].x) : W0.ang + Math.PI;
    wormNew(back, a);
    if (W0.segs.length) floatText(e.x, e.y - 18, 'SPLIT!', '#d8b48a', 13, 0.8);
  }
  if (!W0.segs.length) W0.trail = [];
}
const wormMate = (a, b) => !!(a.worm && a.worm === b.worm);
const wormBody = e => !!(e.worm && e.worm.segs[0] !== e);

// ================================================================ drawing
// Brood Cyst: a glassy sac with the little ones visibly jostling inside. It swells before it spits.
MICROBES.brood = (e, x, y, r) => {
  const sw = e.swell > 0 ? 1 + 0.18 * (1 - e.swell / 0.35) : 1, R = r * sw, n = e.brood == null ? BROOD.start : e.brood;
  ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.92, 0, 0, TAU); ctx.fillStyle = mBody(e, 0.72); ctx.fill(); mHalo(r * 0.1);
  ctx.strokeStyle = 'rgba(30,36,32,0.25)'; ctx.lineWidth = Math.max(0.8, r * 0.04); ctx.beginPath(); ctx.ellipse(x, y, R * 0.86, R * 0.8, 0, 0, TAU); ctx.stroke();
  if (e.bp) for (let i = 0; i < n; i++) {
    const b = e.bp[i], a = b.a + G.realT * 0.6 + Math.sin(G.realT * 2 + b.ph) * 0.3, d = b.d * R + Math.sin(G.realT * 3 + b.ph) * R * 0.05;
    const bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d * 0.9, br = r * 0.2;
    ctx.fillStyle = e.flash > 0 ? '#ffffff' : eTone(e, 0.3); ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(20,24,22,0.75)'; ctx.beginPath(); ctx.arc(bx + Math.cos(a) * br * 0.35, by + Math.sin(a) * br * 0.35, br * 0.3, 0, TAU); ctx.fill();
  }
};
// Broodling: a tiny round body with a stubby tail. Kamikazes blink red as their fuse burns down.
MICROBES.broodling = (e, x, y, r, face) => {
  const hot = e.kami && e.st === 2 && Math.sin(G.realT * (10 + (BROOD.fuse - (e.fuse || 0)) * 4)) > 0;
  ctx.strokeStyle = mBody(e, 0.3); ctx.lineWidth = Math.max(1, r * 0.35); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - Math.cos(face) * r * 0.6, y - Math.sin(face) * r * 0.6);
  ctx.quadraticCurveTo(x - Math.cos(face) * r * 1.4 + Math.sin(G.realT * 14 + e.id) * r * 0.5, y - Math.sin(face) * r * 1.4, x - Math.cos(face) * r * 2, y - Math.sin(face) * r * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU);
  if (hot) { RAW_COL = true; ctx.fillStyle = '#ff3b3b'; ctx.fill(); RAW_COL = false; } else { ctx.fillStyle = mBody(e, 0.36); ctx.fill(); }
  mHalo(r * 0.12);
};
// Planarian: flat, soft, slightly see-through segments joined into a ribbon. The head is a spade with
// the famous cross-eyed look. New segments start small and grow in.
MICROBES.planarian = (e, x, y, r) => {
  const W0 = e.worm, i = W0 ? W0.segs.indexOf(e) : 0, a = e.wa != null ? e.wa : 0, g = e.grow == null ? 1 : 0.35 + 0.65 * e.grow, R = r * g;
  // A strip of body back to the segment in front, so the worm reads as one ribbon.
  if (W0 && i > 0) {
    const f = W0.segs[i - 1];
    ctx.strokeStyle = mBody(e, 0.5); ctx.lineWidth = R * 1.3; ctx.lineCap = 'round';
    const fx = sx(f.x), fy = sy(f.y); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (fx - x) * 0.6, y + (fy - y) * 0.6); ctx.stroke();
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  if (i === 0) {
    ctx.beginPath(); ctx.moveTo(R * 1.35, 0); ctx.quadraticCurveTo(R * 0.9, -R * 1.15, -R * 0.2, -R * 0.95); ctx.lineTo(-R * 0.9, -R * 0.6);
    ctx.lineTo(-R * 0.9, R * 0.6); ctx.lineTo(-R * 0.2, R * 0.95); ctx.quadraticCurveTo(R * 0.9, R * 1.15, R * 1.35, 0); ctx.closePath();
    ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(R * 0.1);
    // Eyes: two dark cups looking in at each other.
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(R * 0.45, s * R * 0.38, R * 0.24, R * 0.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(15,18,16,0.9)'; ctx.beginPath(); ctx.arc(R * 0.47, s * R * 0.24, R * 0.11, 0, TAU); ctx.fill();
    }
  } else {
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.85, R * 0.95, 0, 0, TAU); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(R * 0.08);
    ctx.strokeStyle = 'rgba(30,36,32,0.35)'; ctx.lineWidth = Math.max(0.7, R * 0.07); ctx.beginPath(); ctx.moveTo(0, -R * 0.75); ctx.lineTo(0, R * 0.75); ctx.stroke();
  }
  ctx.restore();
};
