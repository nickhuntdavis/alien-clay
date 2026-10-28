'use strict';
// Spawn Prawn - how your attacks look, by damage type. Cosmetic only: no damage, no gameplay state, nothing saved.
// Every attack of a type wears that type's motion, whatever weapon fires it (shots, lobs, mines, beams, bursts,
// swings, lashes and pools; Switched at Birth and type shifts follow src.elem):
//   Static crackles and snaps short arcs to nearby enemies, like a plasma ball (reaching into empty water when none is near).
//   Acid drips pink goo that splats and fades fast. Mucus strings out and sags, and strands snap. Blood spurts and
//   spatters. Parasite drifts: after-images and wisps. Fire flickers: tongues and embers. Force stays plain.
// Beams are drawn per type instead of a line: Static a continuous jagged bolt with forks (redrawn every frame),
// Acid a sagging dribbling stream, Mucus a stretched braided rope of snot, Blood an arterial spurt in pulses,
// Parasite a twisting ghost ribbon, Fire a flamethrower plume.
// Static grows with the weapon (user, 26 Oct): at Lv 1 it is a faint pale crackle with short, rare arcs; it only becomes full
// lightning (glow, white-hot core, forks) near the level cap. tlZ() runs 0 (Lv 1) to 1 (Lv 9, MM.lvlCap): the firing weapon's
// level where the effect knows it (TL_Z, set round shots, pools and the twin), else your highest-level Static weapon's;
// Static from no weapon of yours looks full. Chain bolts (game.js bolt) in the Static colour follow it too (wrapped below).
// Hooks: v10.js v10Tick -> tlTick, v10Draw -> tlBeam (per beam); render.js after your shots -> tlShots,
// after drawTypeFx -> tlDraw; toys.js Twin Telepathy beam -> tlSeg.

const TL_MAXP = 280, TL_MAXA = 40;
const TL_FIRE = ['#802000', '#ff4d00', '#ffb000', '#fff3b0']; // (cool to hot; none of these is an ELEM_SWAP key)
const TL_GOO = '#ff2fa8', TL_GOO2 = '#ffc2e6', TL_SNOT = '#7fd04a', TL_SNOT2 = '#d4f5bd', TL_BLOOD = '#c9184a', TL_BLOOD2 = '#5a0418';
const TL_SOUL = '#ffcf5a', TL_SOUL2 = '#fff6d6', TL_ZAP = '#ffe94a';
const tlPolOf = o => (!o ? 1 : o.pol != null ? o.pol : o.src && o.src.pol != null ? o.src.pol : o.w && typeof holyPolW === 'function' ? holyPolW(o.w) : 1);
const tlSoulC = o => (tlPolOf(o) < 0 ? HOLY.damned.glow : TL_SOUL), tlSoulC2 = o => (tlPolOf(o) < 0 ? HOLY.damned.col : TL_SOUL2); // (Holy or Damned: holy.js)
const TL_OF = {}; // a type colour -> its type (rings, swings and lashes carry only a colour)
for (const t in TYPE_PAL) if (t !== 'phys') TL_OF[TYPE_PAL[t].toLowerCase()] = t;
const tlS = () => G.tlook || (G.tlook = { p: [], a: [] });
const TL_STAT = '#eaf4ff'; // (pale static, before it is lightning)
let TL_Z = null;
const tlZOf = w => (w && !w.isSpell && w.lvl ? clamp((w.lvl - 1) / (((typeof MM !== 'undefined' && MM.lvlCap) || 9) - 1), 0, 1) : null);
function tlZapLv() {
  if (G.tlzT === G.realT) return G.tlz;
  let z = null; for (const w of G.weapons || []) if (w && !w.isSpell && (w.typeOver || w.def.elem) === 'shock') { const q = tlZOf(w); if (q != null && (z == null || q > z)) z = q; }
  G.tlzT = G.realT; G.tlz = z == null ? 1 : z; return G.tlz;
}
const tlZ = () => (TL_Z != null ? TL_Z : G ? tlZapLv() : 1);
const tlRnd = x => Math.floor(x) + (Math.random() < x % 1 ? 1 : 0);
const tlK = () => (typeof FX !== 'undefined' ? 0.4 + 0.6 * FX.k : 1) * (QUAL.lv >= 2 ? 0.5 : 1);
const tlEl = o => (o && o.src && o.src.elem) || null;
const tlOn = (x, y, m) => Math.abs(x - cam.x) * S < W / 2 + m && Math.abs(y - cam.y) * S < H / 2 + m;

function tlPart(k, x, y, vx, vy, life, s, extra) {
  const T = tlS(); if (T.p.length >= TL_MAXP) return null;
  const q = { k, x, y, vx, vy, life, max: life, s, seed: Math.random() * 10 };
  if (k === 'wisp' && typeof HOLY_HIT !== 'undefined') q.pol = HOLY_HIT; // (the hit being resolved: holy.js)
  if (extra) Object.assign(q, extra);
  T.p.push(q); return q;
}
function tlArc(x, y, x2, y2, life, w, e) {
  const T = tlS(); if (T.a.length >= TL_MAXA) return;
  T.a.push({ x, y, x2, y2, life, max: life, w: w || 1, e, ox: e ? x2 - e.x : 0, oy: e ? y2 - e.y : 0, z: tlZ() });
}
// Static: snap up to n arcs from (x, y) to enemies within R; with none in reach, a short feeler into the water.
function tlSnap(x, y, R, n) {
  const z = tlZ(); R *= 0.35 + 0.65 * z; n = tlRnd(n * (0.25 + 0.75 * z));
  const got = [];
  forNear(x, y, R, e => { if (!e.dead && !e.charmed && got.length < 6) got.push(e); });
  for (let i = 0; i < n; i++) {
    if (got.length) {
      const e = got[(Math.random() * got.length) | 0], a = Math.random() * TAU;
      tlArc(x, y, e.x + Math.cos(a) * e.r * 0.6, e.y + Math.sin(a) * e.r * 0.6, rand(0.06, 0.14), 1, e);
    } else { const a = Math.random() * TAU, L = rand(14, 34) * (0.5 + 0.5 * z); tlArc(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, rand(0.05, 0.1), 0.7); }
  }
}

// ---------------------------------------------------------------- the spawners (one per type)
const TL_EMIT = {
  shock(x, y, r, n) { tlSnap(x, y, 110 + r * 2, n > 1 ? 2 : 1); if (Math.random() < 0.6 * (0.3 + 0.7 * tlZ())) { const a = Math.random() * TAU, v = rand(60, 160); tlPart('spark', x, y, Math.cos(a) * v, Math.sin(a) * v, rand(0.1, 0.2), 1.2); } },
  fire(x, y, r) { tlPart('drip', x + rand(-r, r) * 0.6, y + r * 0.4, rand(-10, 10), rand(10, 40), rand(0.3, 0.5), rand(1.6, 2.8)); },
  ice(x, y, r) {
    if (Math.random() < 0.5) tlPart('goo', x + rand(-r, r) * 0.5, y + r * 0.3, rand(-6, 6), rand(4, 14), rand(0.5, 0.8), rand(1.8, 3), { ox: x, oy: y });
    else { const a = Math.random() * TAU, L = rand(10, 22) + r; tlPart('string', x, y, 0, 8, rand(0.35, 0.6), rand(0.8, 1.4), { x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L }); }
  },
  arcane(x, y, r, n, vx, vy) {
    const sp = Math.hypot(vx || 0, vy || 0), a = sp > 1 ? Math.atan2(vy, vx) + Math.PI + rand(-0.9, 0.9) : Math.random() * TAU, v = rand(40, 120);
    tlPart('blood', x, y, Math.cos(a) * v, Math.sin(a) * v - 20, rand(0.25, 0.45), rand(1.3, 2.4));
  },
  soul(x, y, r) { tlPart('wisp', x + rand(-r, r), y + rand(-r, r), rand(-8, 8), rand(-30, -14), rand(0.5, 0.9), rand(3, 5) + r * 0.4); },
  flame(x, y, r) {
    tlPart('tongue', x + rand(-r, r) * 0.7, y + rand(-r, r) * 0.5, rand(-10, 10), rand(-70, -35), rand(0.25, 0.45), rand(3, 5) + r * 0.5);
    if (Math.random() < 0.25) tlPart('ember', x, y, rand(-30, 30), rand(-90, -40), rand(0.4, 0.8), rand(0.9, 1.6));
  },
};
// Per second, for one shot in flight.
const TL_RATE = { shock: 7, fire: 9, ice: 5, arcane: 12, soul: 7, flame: 18 };
const tlEmit = (t, x, y, r, n, vx, vy) => { const f = TL_EMIT[t]; if (f) f(x, y, r, n || 1, vx, vy); };
const tlRoll = (rate, dt) => { let n = 0, p = rate * dt; while (p >= 1) { n++; p--; } return n + (Math.random() < p ? 1 : 0); };

// A burst landing (any ring in a type's colour): a one-off flourish across its area.
function tlBurst(x, y, R, t) {
  const n = Math.round(clamp(R / 8, 6, 16) * tlK());
  if (t === 'shock') { tlSnap(x, y, R * 1.6, 5); for (let i = 0; i < 4; i++) { const a = Math.random() * TAU, L = R * rand(0.6, 1.1); tlArc(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, rand(0.08, 0.16), 1.1); } return; }
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * R, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, v = rand(60, 160);
    if (t === 'fire') tlPart('drip', x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3, Math.cos(a) * v, Math.sin(a) * v - 60, rand(0.35, 0.6), rand(2, 3.4));
    else if (t === 'ice') { if (i % 2) tlPart('string', x, y, 0, 10, rand(0.4, 0.7), rand(1, 1.8), { x2: x + Math.cos(a) * R * rand(0.7, 1.1), y2: y + Math.sin(a) * R * rand(0.7, 1.1) }); else tlEmit('ice', px, py, 3); }
    else if (t === 'arcane') tlPart('blood', x, y, Math.cos(a) * v * 1.3, Math.sin(a) * v * 1.3 - 40, rand(0.3, 0.5), rand(1.6, 3));
    else if (t === 'soul') tlPart('wisp', px, py, Math.cos(a) * 20, -rand(20, 45), rand(0.6, 1.1), rand(5, 9));
    else if (t === 'flame') { tlEmit('flame', px, py, 6); tlEmit('flame', px, py, 4); }
  }
}
// A swing or a lash: along its reach, more at the tip.
function tlSwing(f, t) {
  const L = f.r || 60, ca = Math.cos(f.a || 0), sa = Math.sin(f.a || 0), n = t === 'flame' ? 6 : 4;
  for (let i = 0; i < n; i++) { const k = 0.4 + 0.6 * Math.random(); tlEmit(t, f.x + ca * L * k, f.y + sa * L * k, 4, 1, ca * 80, sa * 80); }
  if (t === 'shock') tlSnap(f.x + ca * L, f.y + sa * L, 110, 2);
}
// A beam just fired: particles along it (the beam itself is drawn by tlBeam).
function tlBeamFired(f) {
  const t = f.t, n = { shock: 2, fire: 3, ice: 2, arcane: 2, soul: 2, flame: 4 }[t] || 0;
  for (let i = 0; i < n; i++) {
    const k = t === 'flame' || t === 'arcane' ? 0.6 + 0.4 * Math.random() : Math.random(), x = lerp(f.x, f.x2, k), y = lerp(f.y, f.y2, k);
    if (t === 'shock') tlSnap(x, y, 90, 1);
    else if (t === 'ice' && i === 0) { const sag = tlSag(f) * 4 * k * (1 - k); tlPart('goo', x, y + sag, rand(-4, 4), rand(6, 16), rand(0.6, 0.9), rand(2, 3.2), { ox: x, oy: y + sag }); }
    else tlEmit(t, x, y, f.w * 0.4, 1, f.x2 - f.x, f.y2 - f.y);
  }
  if (t === 'arcane') for (let i = 0; i < 2; i++) { const a = Math.atan2(f.y2 - f.y, f.x2 - f.x) + rand(-0.5, 0.5), v = rand(80, 180); tlPart('blood', f.x2, f.y2, Math.cos(a) * v, Math.sin(a) * v, rand(0.25, 0.4), rand(1.4, 2.4)); }
}
const tlSag = f => Math.min(60, Math.hypot(f.x2 - f.x, f.y2 - f.y) * 0.12); // (how far a goo stream droops in the middle, world units)

// ---------------------------------------------------------------- tick (v10.js v10Tick)
function tlTick(dt) {
  if (!G || !G.player) return;
  const T = tlS(), K = tlK();
  // Your shots in flight (and lobs, and mines at a trickle).
  let shots = 0;
  for (const pr of G.proj) {
    const t = tlEl(pr); if (!t || t === 'phys' || !TL_RATE[t] || !tlOn(pr.x, pr.y, 120)) continue;
    if (++shots > 70) break;
    const y = pr.y - (pr.h || 0), r = pr.r || 5;
    if (t === 'ice') { // a lagging blob on a strand (stretch): springs after the shot
      if (pr.tlx == null) { pr.tlx = pr.x; pr.tly = y; }
      pr.tlx += (pr.x - pr.tlx) * Math.min(1, dt * 9); pr.tly += (y - pr.tly) * Math.min(1, dt * 9);
    }
    TL_Z = t === 'shock' ? tlZOf(pr.src && pr.src.w) : null;
    for (let i = tlRoll(TL_RATE[t] * K * (pr.mine ? 0.3 : 1), dt); i > 0; i--) tlEmit(t, pr.x, y, r, 1, pr.vx, pr.vy);
    TL_Z = null;
  }
  // Beams (v10 beams and Getting Warmer): particles once per beam.
  if (G.v10fx) for (const f of G.v10fx) if (f.k === 'beam' && !f.tl) { f.tl = 1; if (tlOn(f.x, f.y, 400)) tlBeamFired(f); }
  // Twin Telepathy (Static): arcs jump off the beam.
  for (const w of G.weapons) {
    if (!w || w.def.kind !== 'twin' || !w.twins || w.def.elem !== 'shock') continue;
    TL_Z = tlZOf(w);
    for (const [a, b] of twinSegs(w)) for (let i = tlRoll(4 * K, dt); i > 0; i--) { const k = Math.random(); tlSnap(lerp(a.x, b.x, k), lerp(a.y, b.y, k), 90, 1); }
    TL_Z = null;
  }
  // Rings (bursts landing), swings and lashes in a type's colour: one flourish each.
  for (const f of G.fx) {
    if (f.tl) continue; f.tl = 1;
    if (f.type !== 'ring' && f.type !== 'swing' && f.type !== 'lash') continue;
    const t = typeof f.color === 'string' && TL_OF[f.color.slice(0, 7).toLowerCase()];
    if (!t || !tlOn(f.x, f.y, 200)) continue;
    if (f.type === 'ring') tlBurst(f.x, f.y, f.r || 40, t); else tlSwing(f, t);
  }
  // Your pools: each type keeps doing its thing in the puddle.
  let zn = 0;
  for (const z of G.zones) {
    if (!z.src || !(z.src.w || z.src.wname) || z.trail) continue;
    const t = z.src.elem || z.elem; if (!t || t === 'phys' || !TL_RATE[t] || !tlOn(z.x, z.y, z.r + 60)) continue;
    if (++zn > 20) break;
    const rate = { shock: 3, fire: 4, ice: 2.5, arcane: 3, soul: 4, flame: 10 }[t] * clamp(z.r / 60, 0.5, 2) * K;
    for (let i = tlRoll(rate, dt); i > 0; i--) {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * z.r * 0.85, x = z.x + Math.cos(a) * d, y = z.y + Math.sin(a) * d;
      if (t === 'fire') tlPart('bub', x, y, 0, 0, rand(0.35, 0.6), rand(2, 4.5));
      else if (t === 'ice') { // snot strands from the puddle to whatever is stuck in it
        let e = null; forNear(z.x, z.y, z.r, q => { if (!e && !q.dead && Math.random() < 0.5) e = q; });
        if (e) tlPart('string', x, y, 0, 0, rand(0.4, 0.7), rand(1, 1.6), { e, x2: e.x, y2: e.y }); else tlEmit('ice', x, y, 4);
      } else if (t === 'arcane') tlPart('ripple', x, y, 0, 0, rand(0.5, 0.8), rand(4, 8));
      else if (t === 'shock') { TL_Z = tlZOf(z.src.w); tlSnap(x, y, z.r * 0.8 + 30, 1); TL_Z = null; }
      else tlEmit(t, x, y, 5);
    }
  }
  // Move the particles.
  const P = T.p;
  for (const q of P) {
    q.life -= dt;
    switch (q.k) {
      case 'drip': case 'blood': q.vy += 520 * dt; q.vx *= 1 - dt * 2; break; // falls, and splats when it ends
      case 'goo': q.vy += 150 * dt; break;
      case 'string': q.y += 0; break;
      case 'wisp': q.vx += Math.sin(G.realT * 4 + q.seed) * 40 * dt; q.vy *= 1 - dt * 0.8; break;
      case 'tongue': q.vx *= 1 - dt * 3; break;
      case 'ember': q.vx += Math.sin(G.realT * 7 + q.seed) * 60 * dt; break;
      case 'spark': q.vx *= 1 - dt * 6; q.vy *= 1 - dt * 6; break;
    }
    q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.life <= 0 && (q.k === 'drip' || q.k === 'blood') && !q.tail && P.length < TL_MAXP) tlPart('splat', q.x, q.y, 0, 0, q.k === 'drip' ? 0.25 : 0.4, q.s * 1.4, { c: q.k === 'drip' ? TL_GOO : TL_BLOOD });
  }
  T.p = P.filter(q => q.life > 0);
  for (const a of T.a) a.life -= dt;
  T.a = T.a.filter(a => a.life > 0);
}

// ---------------------------------------------------------------- drawing helpers (screen space)
// A jagged bolt from (x1, y1) to (x2, y2): midpoint displacement, new every frame, so it crackles.
function tlJag(x1, y1, x2, y2, amp, depth, out) {
  if (depth <= 0) { out.push(x2, y2); return; }
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, j = (Math.random() - 0.5) * amp;
  const px = mx - dy / L * j, py = my + dx / L * j;
  tlJag(x1, y1, px, py, amp / 2, depth - 1, out); tlJag(px, py, x2, y2, amp / 2, depth - 1, out);
}
function tlStrokePts(P, lw, c, al) {
  ctx.globalAlpha = al; ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(P[0], P[1]);
  for (let i = 2; i < P.length; i += 2) ctx.lineTo(P[i], P[i + 1]); ctx.stroke();
}
// A full lightning bolt: wide glow, coloured channel, white-hot core, and forks.
function tlBolt(x1, y1, x2, y2, w, k, forks, z) {
  const L = Math.hypot(x2 - x1, y2 - y1); if (L < 2) return;
  if (z == null) z = tlZ();
  if (z < 0.5) k *= 0.55 + 0.45 * Math.random(); // (low: it fizzes rather than burns)
  const P = [x1, y1]; tlJag(x1, y1, x2, y2, Math.min(L * 0.35, 70 * S) * (0.15 + 0.85 * z * z), L > 160 * S ? 5 : 4, P);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (z > 0.2) tlStrokePts(P, Math.max(3, w * 2.2) * (0.5 + 0.5 * z), TL_ZAP, 0.18 * k * z * z);
  tlStrokePts(P, Math.max(1, w * (0.25 + 0.45 * z)), z < 0.35 ? TL_STAT : TL_ZAP, (0.4 + 0.5 * z) * k);
  if (z > 0.25) tlStrokePts(P, Math.max(0.8, w * 0.28 * z), '#ffffff', k * z);
  forks = Math.round((forks || 0) * clamp((z - 0.45) / 0.4, 0, 1));
  for (let f = 0; f < forks; f++) {
    const i = 2 + 2 * Math.floor(Math.random() * (P.length / 2 - 2)), a = Math.atan2(y2 - y1, x2 - x1) + (Math.random() < 0.5 ? -1 : 1) * rand(0.4, 1.1), FL = L * rand(0.12, 0.28);
    const F = [P[i], P[i + 1]]; tlJag(P[i], P[i + 1], P[i] + Math.cos(a) * FL, P[i + 1] + Math.sin(a) * FL, FL * 0.4, 3, F);
    tlStrokePts(F, Math.max(1, w * 0.4), TL_ZAP, 0.75 * k); tlStrokePts(F, Math.max(0.6, w * 0.15), '#ffffff', 0.8 * k);
  }
  ctx.lineJoin = 'miter'; ctx.lineCap = 'butt';
}
const tlFireCol = k => TL_FIRE[Math.min(3, Math.max(0, Math.floor(k * 4)))]; // k: 1 hot .. 0 cool

// ---------------------------------------------------------------- beams (v10.js v10Draw; true = drawn)
function tlBeam(f) {
  const t = f.t; if (!t || t === 'phys') return false;
  const k = f.life / f.max, x1 = sx(f.x), y1 = sy(f.y), x2 = sx(f.x2), y2 = sy(f.y2), L = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux, w = Math.max(7, f.w * S), tm = G.realT, rc = RAW_COL, op = ctx.globalCompositeOperation;
  RAW_COL = true; ctx.save();
  if (t === 'shock') { // a continuous lightning bolt in erratic shapes, never a straight line
    ctx.globalCompositeOperation = 'lighter';
    const z = tlZ(); tlBolt(x1, y1, x2, y2, w, k, 2, z);
    glow(x2, y2, 16 * S * (0.5 + 0.5 * z), z < 0.35 ? TL_STAT : TL_ZAP, 0.6 * k * (0.25 + 0.75 * z)); glow(x1, y1, 10 * S * (0.5 + 0.5 * z), TL_ZAP, 0.5 * k * z);
  } else if (t === 'fire' || t === 'ice') { // Acid: a sagging stream that dribbles. Mucus: a stretched rope that braids and beads.
    const acid = t === 'fire', sag = tlSag(f) * S * (acid ? 0.6 : 1), N = 24, C = acid ? TL_GOO : TL_SNOT, C2 = acid ? TL_GOO2 : TL_SNOT2;
    const pt = (q, off, ph) => { const droop = sag * 4 * q * (1 - q), wob = Math.sin(q * 14 - tm * (acid ? 16 : 7) + ph) * w * (acid ? 0.15 : 0.35) * Math.sin(q * Math.PI);
      return [x1 + ux * L * q + nx * (wob + off), y1 + uy * L * q + ny * (wob + off) + droop]; };
    const strands = acid ? [[0, 0]] : [[-w * 0.18, 0], [w * 0.18, 2.1]];
    for (const [off, ph] of strands) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [lw, c, al] of [[w * (acid ? 1.3 : 0.8), C, 0.35], [w * (acid ? 0.65 : 0.38), C, 0.85], [Math.max(1, w * 0.14), C2, 0.7]]) {
        ctx.globalAlpha = al * k; ctx.strokeStyle = c; ctx.beginPath();
        for (let i = 0; i <= N; i++) { const q = i / N, thin = acid ? 1 : 0.55 + 0.45 * Math.abs(q - 0.5) * 2, P = pt(q, off * thin, ph); ctx.lineWidth = lw * thin; i ? ctx.lineTo(P[0], P[1]) : ctx.moveTo(P[0], P[1]); }
        ctx.stroke();
      }
    }
    ctx.fillStyle = C; // blobs flowing out along it (Acid) or beads sliding slowly (Mucus)
    for (let i = 0; i < (acid ? 6 : 4); i++) {
      const q = ((tm * (acid ? 1.6 : 0.35) + i / (acid ? 6 : 4)) % 1), P = pt(q, 0, 0), br = w * (acid ? 0.5 : 0.45) * (0.8 + 0.3 * Math.sin(i * 3 + tm * 5));
      ctx.globalAlpha = 0.9 * k; ctx.beginPath(); ctx.ellipse(P[0], P[1], br * 1.25, br, Math.atan2(uy, ux), 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.6 * k; ctx.fillStyle = C2; ctx.beginPath(); ctx.arc(P[0] - br * 0.35, P[1] - br * 0.35, br * 0.3, 0, TAU); ctx.fill(); ctx.fillStyle = C;
    }
    if (acid) for (let i = 0; i < 4; i++) { // drips hanging off the underside, stretching before they let go
      const q = 0.15 + 0.2 * i + 0.04 * Math.sin(i * 7), P = pt(q, 0, 0), st = ((tm * 2.2 + i * 0.37) % 1), dl = w * (0.4 + 2.2 * st);
      ctx.globalAlpha = 0.85 * k * (1 - st * 0.3); ctx.beginPath(); ctx.moveTo(P[0] - w * 0.18, P[1]); ctx.quadraticCurveTo(P[0], P[1] + dl * 0.6, P[0] - w * 0.1, P[1] + dl);
      ctx.arc(P[0], P[1] + dl, w * 0.18 * (0.7 + st * 0.6), Math.PI, 0, true); ctx.quadraticCurveTo(P[0], P[1] + dl * 0.6, P[0] + w * 0.18, P[1]); ctx.fill();
    }
  } else if (t === 'arcane') { // an arterial spurt: thick pulses running out along it, breaking into drops at the end
    const N = 30; ctx.fillStyle = TL_BLOOD;
    for (let i = 0; i <= N; i++) {
      const q = i / N, pulse = Math.max(0, Math.sin((q * 3.2 - tm * 4.5) * TAU)), r = w * (0.3 + 0.55 * pulse) * (1 - q * 0.25), bx = x1 + ux * L * q, by = y1 + uy * L * q + Math.sin(q * 9 + tm * 3) * w * 0.12;
      if (q > 0.8 && pulse < 0.4) continue; // the end of the stream comes apart
      ctx.globalAlpha = 0.9 * k; ctx.fillStyle = TL_BLOOD2; ctx.beginPath(); ctx.arc(bx, by + r * 0.15, r * 1.08, 0, TAU); ctx.fill();
      ctx.fillStyle = TL_BLOOD; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
      if (pulse > 0.85) { ctx.globalAlpha = 0.45 * k; ctx.fillStyle = '#ffd6de'; ctx.beginPath(); ctx.arc(bx - r * 0.3, by - r * 0.35, r * 0.28, 0, TAU); ctx.fill(); }
    }
    for (let i = 0; i < 5; i++) { const a = Math.atan2(uy, ux) + Math.sin(tm * 13 + i * 2.1) * 0.5, d = w * (1 + ((tm * 3 + i * 0.23) % 1) * 3); ctx.globalAlpha = 0.8 * k; ctx.fillStyle = TL_BLOOD; ctx.beginPath(); ctx.arc(x2 + Math.cos(a) * d, y2 + Math.sin(a) * d, w * 0.14, 0, TAU); ctx.fill(); }
  } else if (t === 'soul') { // a twisting ghost ribbon: two pale strands winding round each other, fading in and out
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    const N = 36, turns = Math.max(2, L / (60 * S));
    for (let s = 0; s < 2; s++) for (const [lw, c, al] of [[w * 0.9, tlSoulC(f), 0.22], [Math.max(1, w * 0.22), tlSoulC2(f), 0.75]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath();
      for (let i = 0; i <= N; i++) { const q = i / N, ph = q * turns * TAU - tm * 5 + s * Math.PI, amp = w * 0.9 * Math.sin(q * Math.PI) + w * 0.15, X = x1 + ux * L * q + nx * Math.sin(ph) * amp, Y = y1 + uy * L * q + ny * Math.sin(ph) * amp; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
      ctx.globalAlpha = al * k * (0.7 + 0.3 * Math.sin(tm * 9 + s * 2)); ctx.stroke();
    }
    for (let i = 0; i < 4; i++) { const q = (tm * 0.8 + i / 4) % 1; glow(x1 + ux * L * q + nx * Math.sin(tm * 3 + i) * w, y1 + uy * L * q + ny * Math.sin(tm * 3 + i) * w, w * 1.2, tlSoulC(f), 0.35 * k * Math.sin(q * Math.PI)); }
  } else if (t === 'flame') { // a flamethrower plume: a cone of billowing fire, hot at the nozzle, smoke at the tip
    const N = 18;
    for (let i = 0; i < N; i++) {
      const q = ((i + 0.5) / N + (tm * 2.5) % (1 / N)) % 1, spread = w * (0.4 + 2.2 * q), j = Math.sin(tm * 23 + i * 7.3) * spread * 0.35;
      const X = x1 + ux * L * q + nx * j, Y = y1 + uy * L * q + ny * j - q * q * 18 * S, heat = 1 - q;
      const R = spread * (0.9 + 0.3 * Math.sin(tm * 17 + i)); glow(X, Y, R, tlFireCol(heat * 0.7), 0.85 * k); if (heat > 0.25) glow(X, Y, R * 0.55, tlFireCol(heat * 0.7 + 0.35), 0.9 * k);
    }
    ctx.globalCompositeOperation = 'lighter'; glow(x1 + ux * 6 * S, y1 + uy * 6 * S, w * 1.1, '#fff3b0', 0.8 * k); ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 3; i++) { const q = 0.8 + ((tm * 0.9 + i / 3) % 1) * 0.3; ctx.globalAlpha = 0.18 * k; ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.arc(x1 + ux * L * q, y1 + uy * L * q - 14 * S * q, w * 2.4 * q, 0, TAU); ctx.fill(); }
  } else { ctx.restore(); RAW_COL = rc; return false; }
  ctx.restore(); ctx.globalCompositeOperation = op; RAW_COL = rc;
  return true;
}
// Twin Telepathy's beam (toys.js): a living bolt when it is Static. World points a and b.
function tlSeg(a, b, elem) {
  if (elem !== 'shock') return false;
  const rc = RAW_COL; RAW_COL = true;
  tlBolt(sx(a.x), sy(a.y), sx(b.x), sy(b.y), 5 * S, 0.9, 2);
  RAW_COL = rc; return true;
}

// ---------------------------------------------------------------- your shots (render.js, after the shot loop)
function tlShots() {
  const all = G ? orbShots() : null; // (+ Orbiting bodies: modifiers.js)
  if (!all || !all.length) return;
  const rc = RAW_COL, op = ctx.globalCompositeOperation; RAW_COL = true;
  let n = 0;
  for (const pr of all) {
    const t = tlEl(pr); if (!t || t === 'phys' || pr.dead || !tlOn(pr.x, pr.y, 40)) continue;
    if (++n > 60) break;
    const x = sx(pr.x), y = sy(pr.y - (pr.h || 0)), r = Math.max(2, (pr.r || 5) * S), sp = Math.hypot(pr.vx, pr.vy) || 1, ux = pr.vx / sp, uy = pr.vy / sp, tm = G.realT;
    if (t === 'shock') { // crackle round the shot
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      const z = tlZOf(pr.src && pr.src.w) ?? tlZ();
      for (let i = 0; i < (z < 0.4 ? 1 : 2); i++) { const a = Math.random() * TAU, R = r * rand(1.6, 2.8) * (0.6 + 0.4 * z), P = [x, y]; tlJag(x, y, x + Math.cos(a) * R, y + Math.sin(a) * R, R * 0.6, 2, P); tlStrokePts(P, Math.max(1, S), z < 0.35 ? TL_STAT : TL_ZAP, 0.4 + 0.4 * z); }
      if (Math.random() < 0.5 * z) glow(x, y, r * 2.2, '#ffffff', 0.5);
    } else if (t === 'fire') { // a drip hanging off it, stretching
      const st = (tm * 3 + pr.x * 0.01) % 1, dl = r * (0.6 + 1.6 * st);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.9; ctx.fillStyle = TL_GOO;
      ctx.beginPath(); ctx.moveTo(x - r * 0.35, y); ctx.quadraticCurveTo(x, y + dl * 0.7, x, y + dl); ctx.quadraticCurveTo(x, y + dl * 0.7, x + r * 0.35, y); ctx.fill();
      ctx.beginPath(); ctx.arc(x, y + dl, r * 0.3 * (0.8 + st * 0.5), 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.fillStyle = TL_GOO2; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, TAU); ctx.fill();
    } else if (t === 'ice' && pr.tlx != null) { // a snot strand back to a lagging blob: it stretches and thins
      const tx = sx(pr.tlx), ty = sy(pr.tly), d = Math.hypot(tx - x, ty - y), thin = clamp(1 - d / (60 * S), 0.25, 1);
      ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = TL_SNOT; ctx.lineCap = 'round';
      ctx.globalAlpha = 0.75; ctx.lineWidth = Math.max(1, r * 0.7 * thin); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo((x + tx) / 2, (y + ty) / 2 + d * 0.2, tx, ty); ctx.stroke();
      ctx.fillStyle = TL_SNOT; ctx.beginPath(); ctx.arc(tx, ty, r * 0.55, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.6; ctx.fillStyle = TL_SNOT2; ctx.beginPath(); ctx.arc(tx - r * 0.2, ty - r * 0.2, r * 0.18, 0, TAU); ctx.fill();
    } else if (t === 'soul') { // after-images, drifting off the line as they lag
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 3; i++) { const lag = i * r * 1.6, wob = Math.sin(tm * 8 + i * 1.7 + pr.x * 0.02) * r * 0.6 * i; glow(x - ux * lag - uy * wob, y - uy * lag + ux * wob, r * (1.6 - i * 0.2), tlSoulC(pr), 0.35 / i); }
    } else if (t === 'flame') { // tongues licking back off it
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < 3; i++) { const lag = r * (1 + i * 1.2), j = Math.sin(tm * 25 + i * 2 + pr.y * 0.03) * r * 0.5; glow(x - ux * lag - uy * j, y - uy * lag + ux * j - i * r * 0.3, r * (1.8 - i * 0.3), tlFireCol(0.9 - i / 3), 0.75); }
    } else if (t === 'arcane') { // a darker heart that throbs
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.6; ctx.fillStyle = TL_BLOOD2;
      ctx.beginPath(); ctx.arc(x, y, r * (0.45 + 0.15 * Math.sin(tm * 14 + pr.x)), 0, TAU); ctx.fill();
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = op; ctx.lineCap = 'butt'; RAW_COL = rc;
}

// ---------------------------------------------------------------- particles and arcs (render.js, after drawTypeFx)
function tlDraw() {
  if (!G || !G.tlook) return;
  const T = G.tlook, rc = RAW_COL, op = ctx.globalCompositeOperation; RAW_COL = true;
  ctx.globalCompositeOperation = 'source-over';
  for (const q of T.p) {
    if (!tlOn(q.x, q.y, 60)) continue;
    const k = Math.max(0, q.life / q.max), x = sx(q.x), y = sy(q.y), s = q.s * S;
    switch (q.k) {
      case 'drip': case 'blood': { // a falling teardrop, longer the faster it falls
        const v = Math.hypot(q.vx, q.vy), a = Math.atan2(q.vy, q.vx), Lg = s * (1 + Math.min(2, v / 160));
        ctx.globalAlpha = Math.min(1, k * 2.5); ctx.fillStyle = q.k === 'drip' ? TL_GOO : TL_BLOOD;
        ctx.beginPath(); ctx.ellipse(x - Math.cos(a) * Lg * 0.3, y - Math.sin(a) * Lg * 0.3, Lg, s * 0.7, a, 0, TAU); ctx.fill();
        if (q.k === 'drip') { ctx.globalAlpha *= 0.7; ctx.fillStyle = TL_GOO2; ctx.beginPath(); ctx.arc(x - s * 0.25, y - s * 0.25, s * 0.25, 0, TAU); ctx.fill(); }
        break;
      }
      case 'splat': ctx.globalAlpha = 0.7 * k; ctx.fillStyle = q.c; ctx.beginPath(); ctx.ellipse(x, y, s * (1.6 - k * 0.5), s * 0.6 * (1.6 - k * 0.5), 0, 0, TAU); ctx.fill(); break;
      case 'goo': { // a snot drop on a strand back to where it came from, until the strand gives
        const ox = sx(q.ox), oy = sy(q.oy), held = k > 0.45;
        if (held) { ctx.globalAlpha = 0.6 * k; ctx.strokeStyle = TL_SNOT; ctx.lineWidth = Math.max(0.8, s * 0.35 * k); ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(x, y); ctx.stroke(); }
        ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = TL_SNOT; ctx.beginPath(); ctx.ellipse(x, y, s * 0.8, s * (held ? 1.2 : 0.9), 0, 0, TAU); ctx.fill();
        ctx.globalAlpha *= 0.6; ctx.fillStyle = TL_SNOT2; ctx.beginPath(); ctx.arc(x - s * 0.25, y - s * 0.3, s * 0.25, 0, TAU); ctx.fill();
        break;
      }
      case 'string': { // a strand of snot that sags, then snaps and pulls back to both ends
        if (q.e && !q.e.dead) { q.x2 = q.e.x; q.y2 = q.e.y; }
        const x2 = sx(q.x2), y2 = sy(q.y2), d = Math.hypot(x2 - x, y2 - y), sag = d * (0.15 + 0.35 * (1 - k)), mx = (x + x2) / 2, my = (y + y2) / 2 + sag;
        ctx.strokeStyle = TL_SNOT; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(0.7, s * (0.4 + 0.6 * k));
        if (k > 0.35) { ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke(); }
        else { const f = k / 0.35; ctx.globalAlpha = 0.7 * f; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(lerp(x, mx, f), lerp(y, my, f) + sag * (1 - f), lerp(x, mx, f), lerp(y, my, f) + sag * (1 - f) * 1.5);
          ctx.moveTo(x2, y2); ctx.quadraticCurveTo(lerp(x2, mx, f), lerp(y2, my, f) + sag * (1 - f), lerp(x2, mx, f), lerp(y2, my, f) + sag * (1 - f) * 1.5); ctx.stroke(); }
        ctx.lineCap = 'butt';
        break;
      }
      case 'bub': { // acid fizzing in its puddle: a bubble swells and pops into a ring
        if (k > 0.3) { ctx.globalAlpha = 0.8; ctx.fillStyle = TL_GOO; ctx.beginPath(); ctx.arc(x, y, s * (1.3 - k), 0, TAU); ctx.fill(); ctx.globalAlpha = 0.6; ctx.fillStyle = TL_GOO2; ctx.beginPath(); ctx.arc(x - s * 0.25, y - s * 0.25, s * 0.25 * (1.3 - k), 0, TAU); ctx.fill(); }
        else { ctx.globalAlpha = k / 0.3; ctx.strokeStyle = TL_GOO2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, s * (1.4 + (0.3 - k) * 4), 0, TAU); ctx.stroke(); }
        break;
      }
      case 'ripple': ctx.globalAlpha = 0.5 * k; ctx.strokeStyle = TL_BLOOD; ctx.lineWidth = Math.max(1, S); ctx.beginPath(); ctx.ellipse(x, y, s * (2 - k * 1.6), s * 0.6 * (2 - k * 1.6), 0, 0, TAU); ctx.stroke(); break;
    }
  }
  for (const q of T.p) {
    if (!tlOn(q.x, q.y, 60)) continue;
    const k = Math.max(0, q.life / q.max), x = sx(q.x), y = sy(q.y), s = q.s * S;
    switch (q.k) {
      case 'wisp': glow(x, y, s * (1.2 + (1 - k) * 1.2), tlSoulC(q), 0.45 * Math.sin(k * Math.PI)); glow(x, y, s * 0.5, tlSoulC2(q), 0.35 * k); break;
      case 'tongue': ctx.save(); ctx.translate(x, y); ctx.scale(0.65, 1.4); glow(0, 0, s * (0.6 + 0.7 * k), tlFireCol(k * 0.9 + 0.05), Math.min(1, 1.3 * k)); ctx.restore(); break;
      case 'ember': ctx.globalAlpha = k; ctx.fillStyle = '#ff4d00'; ctx.beginPath(); ctx.arc(x, y, s * 0.9, 0, TAU); ctx.fill(); glow(x, y, s * 2.4, '#ffb000', 0.8 * k); break;
      case 'spark': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k; ctx.strokeStyle = TL_ZAP; ctx.lineWidth = Math.max(1, s); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - q.vx * 0.03 * S, y - q.vy * 0.03 * S); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; break;
    }
  }
  // Static arcs: each snaps in for a few frames and crackles while it lasts.
  ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const a of T.a) {
    if (a.e && !a.e.dead) { a.x2 = a.e.x + a.ox; a.y2 = a.e.y + a.oy; }
    if (!tlOn(a.x, a.y, 120)) continue;
    const k = Math.min(1, (a.life / a.max) * 1.6), x1 = sx(a.x), y1 = sy(a.y), x2 = sx(a.x2), y2 = sy(a.y2), L = Math.hypot(x2 - x1, y2 - y1), P = [x1, y1];
    const z = a.z == null ? 1 : a.z, wz = a.w * (0.5 + 0.5 * z) * Math.max(0.7, S);
    tlJag(x1, y1, x2, y2, Math.min(L * 0.45, 40 * S) * (0.4 + 0.6 * z), L > 60 * S ? 4 : 3, P);
    if (z > 0.2) tlStrokePts(P, 4 * wz, TL_ZAP, 0.2 * k * z);
    tlStrokePts(P, 1.5 * wz, z < 0.35 ? TL_STAT : TL_ZAP, 0.85 * k * (0.45 + 0.55 * z));
    if (z > 0.3) tlStrokePts(P, 0.7 * wz, '#ffffff', k * z);
    if (a.e) glow(x2, y2, 7 * S * (0.5 + 0.5 * z), TL_ZAP, 0.6 * k * z);
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = op; RAW_COL = rc;
}

// Chain bolts in the Static colour (game.js bolt, drawn by render.js): flatter, fork-free, paler and briefer while the Static is weak.
if (typeof bolt === 'function') {
  const _bolt = bolt, zapCol = c => typeof c === 'string' && c.slice(0, 7).toLowerCase() === TYPE_PAL.shock;
  bolt = function (x1, y1, x2, y2, color, life) {
    const r = _bolt(x1, y1, x2, y2, color, life), f = G && G.fx && G.fx[G.fx.length - 1];
    if (!f || f.type !== 'bolt' || !zapCol(color)) return r;
    const z = tlZ(); if (z >= 1) return r;
    const P = f.pts, flat = 0.25 + 0.75 * z;
    if (P) for (let i = 2; i < P.length - 2; i += 2) { const t = i / (P.length - 2); P[i] = x1 + (x2 - x1) * t + (P[i] - (x1 + (x2 - x1) * t)) * flat; P[i + 1] = y1 + (y2 - y1) * t + (P[i + 1] - (y1 + (y2 - y1) * t)) * flat; }
    if (z < 0.6) f.forks = null;
    if (z < 0.35) f.color = TL_STAT;
    if (f.life != null) { f.life *= 0.5 + 0.5 * z; if (f.max != null) f.max = f.life; }
    return r;
  };
}
