'use strict';
// Spawn Prawn - big hazards. Rare, huge features of the slide: one to three a run (never two the same), each
// several times the size of ordinary terrain and each with its own behaviour.
//   The Plughole      a slow whirlpool: drags everything round and in; the middle drowns what it catches.
//   Spermicide Spill  a drifting cloud of foam: burns and slows whatever swims in it, enemies included.
//   Hot Flush         a warm patch that builds up and then goes off, scorching everything inside it.
//   Mucus Plug        a huge sticky glob: everything in it crawls.
//   Acid Lake         a huge acid crypt (real acid terrain) drifting very slowly; if it bumps into another acid
//                     pit, the two run together into one stranger shape (bigHazMerge).
//   Cilia Field       a wide field of misshapen cilia beds (real cilia terrain, each bed a few overlapping ones).
// Enemies get the same treatment as you, so each one is a tool as well as a danger. Autorun keeps out of the
// dangerous parts. Drawn soft and borderless (STYLE.md), in both fields.
// Hooks: game.js newGame (makeBigHaz), update (bigHazTick), player speed (bigHazSpeed); terrain.js
// terrainPlayer (bigHazPlayer), terrainBody (bigHazBody), steerTerrain and terrainDanger (bigHazSteer);
// render.js before drawTerrain (drawBigHaz); daily.js (seeded).

const BIG_HAZ = {
  plughole:   { name: 'The Plughole',     r: 430, desc: 'A whirlpool. It drags everything round and in, and the middle drowns whatever it catches.' },
  spermicide: { name: 'Spermicide Spill', r: 380, desc: 'A drifting cloud of spermicide foam. It burns and slows anything swimming in it. Anything.' },
  hotflush:   { name: 'Hot Flush',        r: 400, desc: 'A warm patch that builds up and then goes off, scorching everything inside. It shimmers before it blows.' },
  mucusplug:  { name: 'Mucus Plug',       r: 480, desc: 'A huge glob of mucus. Everything in it crawls, you and them alike.' },
  acidlake:   { name: 'Acid Lake',        r: 300, terrain: true, desc: 'A crypt of acid the size of a pond, creeping across the slide. Anything acid it touches, it swallows.' },
  ciliafield: { name: 'Cilia Field',      r: 520, terrain: true, desc: 'A whole field of cilia beds, grown every which way. Easy to get tangled in, easy to lose a crowd in.' },
};
const BH = { count: [[1, 0.45], [2, 0.4], [3, 0.15]], flushEvery: 14, flushWarn: 2.5, mucusSlow: 0.45, foamSlow: 0.7 };
if (typeof TERRAIN_HEX !== 'undefined') TERRAIN_HEX.push('#efe6b0', '#f4a261', '#d8e2a6', '#7d8a4a');

function makeBigHaz() {
  if (typeof UI !== 'undefined' && LV_SAMPLE[UI.sample] != null) return []; // (campaign levels have their own maps)
  if (CORE.arena > 1e8) return [];
  const k = CORE.arena < 2000 ? 0.6 : 1; // (smaller in the Petri Dish)
  let x = Math.random(), n = 1;
  for (const [c, w] of BH.count) { if (x < w) { n = c; break; } x -= w; }
  const types = Object.keys(BIG_HAZ).sort(() => Math.random() - 0.5).slice(0, n), out = [];
  const start = { x: 0, y: CORE.arena * 0.78 };
  for (const type of types) {
    const r = BIG_HAZ[type].r * k * rand(0.9, 1.1);
    for (let tries = 0; tries < 80; tries++) {
      const a = Math.random() * TAU, d = rand(CORE.sanctuary + r + 80, Math.max(CORE.sanctuary + r + 81, CORE.arena - r * 0.7));
      const hx = Math.cos(a) * d, hy = Math.sin(a) * d;
      if (Math.hypot(hx - start.x, hy - start.y) < r + 380) continue;
      if (out.some(o => Math.hypot(o.x - hx, o.y - hy) < o.r + r + 160)) continue;
      if (type === 'acidlake' && Math.random() < 0.25) { // (now and then a pair, which may run together)
        const tx = hx + Math.cos(a + 1.6) * r * 2.6, ty = hy + Math.sin(a + 1.6) * r * 2.6, td = Math.hypot(tx, ty);
        if (td < CORE.arena - r && td > CORE.sanctuary + r * 1.7 && Math.hypot(tx - start.x, ty - start.y) > r * 1.7 + 380) out.push({ type, def: BIG_HAZ[type], x: tx, y: ty, r, seed: Math.random() * 1000, seen: false, twin: true });
      }
      const sp = 26 * k, va = Math.random() * TAU;
      out.push({ type, def: BIG_HAZ[type], x: hx, y: hy, r, seed: Math.random() * 1000, seen: false,
        vx: type === 'spermicide' ? Math.cos(va) * sp : 0, vy: type === 'spermicide' ? Math.sin(va) * sp : 0,
        flushT: type === 'hotflush' ? rand(5, BH.flushEvery) : 0, warn: 0, blastT: -9 });
      break;
    }
  }
  return out;
}
// Build the terrain-made ones into the slide (clearing ordinary terrain out of their way). Returns the list.
function bigHazBuild(list) {
  const T = G && G.terrain;
  if (!T) return list;
  for (const h of list) {
    if (!h.def.terrain) continue;
    if (Math.hypot(h.x, h.y) > CORE.arena - h.r * 0.6) { h.x *= 0.85; h.y *= 0.85; }
    const ext = h.type === 'acidlake' ? h.r * 1.7 : h.r;
    const gone = new Set(T.list.filter(o => !o.parent && Math.hypot(o.x - h.x, o.y - h.y) < ext + o.r + 80));
    T.list = T.list.filter(o => !gone.has(o) && !gone.has(o.parent));
    if (h.type === 'acidlake') h.ob = bhLake(T.list, h.x, h.y, h.r);
    else bhField(T.list, h.x, h.y, h.r);
  }
  T.grid = terrainGrid(T.list);
  return list;
}
const bhLobes = () => Array.from({ length: 8 }, () => rand(0.82, 1.2));
const bhPiece = (type, x, y, r, extra) => Object.assign({ type, def: OBSTACLES[type], x, y, r, a: Math.random() * TAU, charge: 0, flash: 0, seed: Math.random() * 100, burstT: 0, lobes: bhLobes() }, extra);
function bhLake(L, x, y, R) {
  const root = bhPiece('acid', x, y, R * 0.65, { lake: true, sp: rand(3, 6), h: Math.random() * TAU, fixed: false });
  L.push(root);
  const n = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rand(-0.4, 0.4), d = root.r * rand(0.4, 0.7), r = root.r * rand(0.55, 0.8), px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
    L.push(bhPiece('acid', px, py, r, { parent: root, ox: px - x, oy: py - y }));
  }
  return root;
}
function bhField(L, x, y, F) {
  const k = CORE.arena < 2000 ? 0.7 : 1, n = 9 + Math.floor(Math.random() * 6), beds = [];
  for (let i = 0; i < n * 3 && beds.length < n; i++) {
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * F * 0.85, r = rand(50, 115) * k, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d;
    if (beds.some(b => Math.hypot(b.x - bx, b.y - by) < (b.r + r) * 0.75)) continue;
    const root = bhPiece('cilia', bx, by, r, { sp: 0, h: 0, fixed: true });
    beds.push(root); L.push(root);
    // Misshapen: a couple of smaller beds grown into each one.
    for (let j = 0, m = 1 + Math.floor(Math.random() * 3); j < m; j++) {
      const aa = Math.random() * TAU, dd = r * rand(0.55, 0.95), rr = r * rand(0.45, 0.8), px = bx + Math.cos(aa) * dd, py = by + Math.sin(aa) * dd;
      L.push(bhPiece('cilia', px, py, rr, { parent: root, ox: px - bx, oy: py - by }));
    }
  }
}
// Acid lakes swallow any acid pit (or other lake) they bump into: its pools join the lake and ride along with it.
// Lakes creep and ordinary pits steer clear, so it is rare. Hook: terrain.js updateTerrain.
function bigHazMerge(L) {
  if ((G.bhMergeT || 0) > G.t) return;
  G.bhMergeT = G.t + 0.5;
  for (const a of L) {
    if (!a.lake || a.parent) continue;
    for (const b of L) {
      if (b === a || b.parent || b.type !== 'acid' || Math.hypot(a.x - b.x, a.y - b.y) > a.r * 1.5 + b.r * 1.2) continue;
      const big = b.lake && b.r > a.r ? b : a, small = big === a ? b : a;
      for (const o of L) if (o === small || o.parent === small) { o.parent = big; o.ox = o.x - big.x; o.oy = o.y - big.y; }
      small.lake = false; big.merged = (big.merged || 0) + 1; big.flash = 0.8;
      G.stats.lakeMerges = (G.stats.lakeMerges || 0) + 1;
      const p = G.player;
      if (Math.hypot(p.x - small.x, p.y - small.y) < 900) floatText(small.x, small.y, 'THE ACID RUNS TOGETHER', '#c6f07a', 15, 1.6);
      G.terrain.regridT = 0;
      return;
    }
  }
}
const bigHazList = () => (G && G.bigHaz) || [];
// How far into h a point is: 0 at the edge, 1 at the middle (negative outside).
const bhIn = (h, x, y) => 1 - Math.hypot(x - h.x, y - h.y) / h.r;

function bigHazTick(dt) {
  for (const h of bigHazList()) {
    const p = G.player;
    if (h.ob) { h.x = h.ob.parent ? h.ob.parent.x + h.ob.ox : h.ob.x; h.y = h.ob.parent ? h.ob.parent.y + h.ob.oy : h.ob.y; } // (a lake creeps)
    if (!h.seen && Math.hypot(p.x - h.x, p.y - h.y) < h.r + 380) {
      h.seen = true;
      floatText(h.x, h.y, h.def.name.toUpperCase(), '#ffffff', 22, 2);
      sysMsg(h.def.name.toUpperCase(), h.def.desc, '#f4a261', true);
      META.bigHaz = META.bigHaz || {}; if (!META.bigHaz[h.type]) { META.bigHaz[h.type] = 1; saveMeta(); }
    }
    if (h.type === 'spermicide') {
      // Drift, turning back at the dish edge and away from the egg.
      h.x += h.vx * dt; h.y += h.vy * dt;
      const d = Math.hypot(h.x, h.y) || 1;
      if ((d > CORE.arena - h.r * 0.5 && h.vx * h.x + h.vy * h.y > 0) || (d < CORE.sanctuary + h.r * 0.8 && h.vx * h.x + h.vy * h.y < 0)) {
        const nx = h.x / d, ny = h.y / d, vn = h.vx * nx + h.vy * ny; h.vx -= 2 * vn * nx; h.vy -= 2 * vn * ny;
      }
    }
    if (h.type === 'hotflush') {
      h.flushT -= dt;
      h.warn = h.flushT < BH.flushWarn ? 1 - Math.max(0, h.flushT) / BH.flushWarn : 0;
      if (h.flushT <= BH.flushWarn && h.flushT + dt > BH.flushWarn && Math.hypot(p.x - h.x, p.y - h.y) < h.r * 1.6) floatText(h.x, h.y - 30, 'HOT FLUSH!', '#f4a261', 18, 1.4);
      if (h.flushT <= 0) { h.flushT = BH.flushEvery * rand(0.85, 1.15); h.warn = 0; bigHazFlush(h); }
    }
  }
}
function bigHazFlush(h) {
  h.blastT = G.realT;
  const src = { elem: 'fire', env: true, noCrit: true, noStatus: true, wname: 'Hot Flush' };
  IN_AOE = true;
  forNear(h.x, h.y, h.r, e => { if (!e.charmed && !e.egg) damageEnemy(e, e.boss ? e.maxHp * 0.05 : e.maxHp * 0.35 + 10, src); });
  IN_AOE = false;
  const p = G.player;
  if (Math.hypot(p.x - h.x, p.y - h.y) < h.r) hurtPlayer(24 * dmgNow(), 'Hot Flush', null, 'blast');
  if (Math.hypot(p.x - h.x, p.y - h.y) < h.r * 2.2) { cam.shake = Math.min(14, cam.shake + 7); sfx('boom'); }
  G.fx.push({ type: 'flash', x: h.x, y: h.y, r: h.r * 0.9, color: '#ffd8b0', life: 0.3, max: 0.3 });
  addLight(h.x, h.y, h.r * 1.3, '#f4a261', 0.8);
}

// You: pulled by the Plughole, burnt by the foam, drowned in the middle.
function bigHazPlayer(p, dt) {
  for (const h of bigHazList()) {
    const k = bhIn(h, p.x, p.y);
    if (k <= 0) continue;
    if (h.type === 'plughole') { const f = bhPull(h, p.x, p.y, 0.35); p.x += f.x * dt; p.y += f.y * dt; }
    if (G.state !== 'play' || (G.bhHurtT || 0) > G.t) continue;
    if (h.type === 'plughole' && k > 0.78) { G.bhHurtT = G.t + 0.5; hurtPlayer(9 * dmgNow(), 'The Plughole'); }
    if (h.type === 'spermicide' && k > 0.08) { G.bhHurtT = G.t + 0.5; hurtPlayer(4 * dmgNow(), 'Spermicide'); }
  }
}
// Everyone's speed in the goo and the foam (you; enemies get the same through bigHazBody).
function bigHazSpeed() {
  let m = 1;
  const p = G.player;
  for (const h of bigHazList()) {
    const k = bhIn(h, p.x, p.y);
    if (k <= 0) continue;
    if (h.type === 'mucusplug') m *= 1 - (1 - BH.mucusSlow) * Math.min(1, k * 4);
    if (h.type === 'spermicide') m *= 1 - (1 - BH.foamSlow) * Math.min(1, k * 4);
  }
  return m;
}
// The whirlpool's pull at (x, y): mostly round, partly in, stronger towards the middle.
function bhPull(h, x, y, mul) {
  const dx = h.x - x, dy = h.y - y, d = Math.hypot(dx, dy) || 1, k = Math.max(0, 1 - d / h.r), F = (60 + 240 * k) * mul;
  return { x: (dx / d * 0.55 - dy / d * 0.85) * F, y: (dy / d * 0.55 + dx / d * 0.85) * F };
}
// Enemies: the same pull, burn and drag.
function bigHazBody(e, dt) {
  const hs = bigHazList();
  if (!hs.length || e.egg) return;
  for (const h of hs) {
    const k = bhIn(h, e.x, e.y);
    if (k <= 0) continue;
    if (h.type === 'plughole' && !e.boss) { const f = bhPull(h, e.x, e.y, 1); e.x += f.x * dt; e.y += f.y * dt; }
    if ((h.type === 'mucusplug' || h.type === 'spermicide') && e.bhx != null) {
      // Drag: undo part of this frame's movement.
      const slow = h.type === 'mucusplug' ? BH.mucusSlow : BH.foamSlow, q = (1 - slow) * Math.min(1, k * 4);
      e.x -= (e.x - e.bhx) * q; e.y -= (e.y - e.bhy) * q;
    }
    if (e.bhHurtT > G.t || e.charmed) continue;
    const src = { dot: true, noCrit: true, noStatus: true, noArc: true, env: true };
    if (h.type === 'plughole' && k > 0.78) { e.bhHurtT = G.t + 0.5; damageEnemy(e, e.boss ? e.maxHp * 0.01 : e.maxHp * 0.12 + 5, Object.assign(src, { elem: 'phys', wname: 'The Plughole' })); }
    if (h.type === 'spermicide' && k > 0.08) { e.bhHurtT = G.t + 0.5; damageEnemy(e, e.boss ? e.maxHp * 0.005 : e.maxHp * 0.04 + 3, Object.assign(src, { elem: 'poison', wname: 'Spermicide' })); }
  }
  e.bhx = e.x; e.bhy = e.y;
}
// Autorun: the drowning middle, the foam and a Hot Flush about to go off are walls; the rest costs a little.
function bigHazSteer(x, y, r) {
  let dn = 0;
  for (const h of bigHazList()) {
    const k = 1 - (Math.hypot(x - h.x, y - h.y) - r) / h.r;
    if (k <= -0.15) continue;
    if (h.type === 'plughole') dn += k > 0.45 ? 5 + (k - 0.45) * 20 : k > 0 ? 1.4 * k : 0;
    else if (h.type === 'spermicide') dn += k > 0 ? 3 + k * 4 : 1.5 * (1 + k / 0.15);
    else if (h.type === 'hotflush') dn += h.warn > 0 || h.flushT < BH.flushWarn + 1.5 ? (k > 0 ? 8 + k * 4 : 2) : k > 0 ? 0.3 : 0;
    else if (h.type === 'mucusplug') dn += k > 0 ? 1 + k : 0;
  }
  return dn;
}

// ---------------------------------------------------------------- drawing
function drawBigHaz() {
  const hs = bigHazList();
  if (!hs.length) return;
  const t = G.realT, df = WORLD_DF, a0 = ctx.globalAlpha;
  WORLD_DF = false;
  for (const h of hs) {
    const x = sx(h.x), y = sy(h.y), R = h.r * S;
    if (x < -R || x > W + R || y < -R || y > H + R) continue;
    let seed = Math.floor(h.seed) + 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    if (h.type === 'plughole') drawPlughole(h, x, y, R, t, df, rnd);
    else if (h.type === 'spermicide') drawFoam(h, x, y, R, t, df, rnd);
    else if (h.type === 'hotflush') drawFlush(h, x, y, R, t, df, rnd);
    else if (h.type === 'mucusplug') drawMucus(h, x, y, R, t, df, rnd);
    ctx.globalAlpha = a0;
  }
  WORLD_DF = df;
}
// A soft glow that fades to nothing at its edge (no rim).
function bhGlow(x, y, R, c0, c1, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
}
function drawPlughole(h, x, y, R, t, df, rnd) {
  // The funnel: darker towards the middle on the light field, a faint bright swirl on black.
  bhGlow(x, y, R * 0.6, df ? 'rgba(10,20,26,0.9)' : 'rgba(30,48,58,0.55)', df ? 'rgba(20,40,50,0.35)' : 'rgba(60,85,96,0.18)', 1);
  // Specks spiralling in: each one rides an arm inwards, faster as it gets close.
  ctx.lineCap = 'round';
  const n = 110;
  for (let i = 0; i < n; i++) {
    const s0 = rnd(), a0 = rnd() * TAU, len = 0.08 + rnd() * 0.16, w = 0.6 + rnd() * 1.4;
    const u = 1 - ((s0 + t * 0.045) % 1); // (1 at the rim, falling to 0 in the middle, then back out)
    const a = a0 + Math.log(0.12 + u) * -2.6 + t * (0.25 + 0.5 * (1 - u)), rr = R * u;
    const fade = Math.min(1, (1 - u) * 6) * Math.min(1, u * 3);
    ctx.globalAlpha = fade * (df ? 0.75 : 0.55);
    ctx.strokeStyle = i % 5 ? (df ? '#9fd4e6' : '#3a5560') : '#ffffff'; ctx.lineWidth = w * Math.max(0.6, S);
    ctx.beginPath(); ctx.arc(x, y, rr, a, a + len * (1.2 - u * 0.6)); ctx.stroke();
  }
}
function drawFoam(h, x, y, R, t, df, rnd) {
  bhGlow(x, y, R, df ? 'rgba(239,230,176,0.16)' : 'rgba(255,252,236,0.35)', df ? 'rgba(239,230,176,0.07)' : 'rgba(255,250,228,0.18)', 1);
  // Bubbles: clumped, swelling and popping, thinning out towards the edge.
  for (let i = 0; i < 170; i++) {
    const u = Math.sqrt(rnd()), a = rnd() * TAU, ph = rnd() * TAU, br = (3 + rnd() * 11) * S;
    const life = (t * (0.25 + rnd() * 0.3) + ph) % 1, sw = Math.sin(life * Math.PI);
    const bx = x + Math.cos(a + t * 0.03) * u * R + Math.sin(t * 0.7 + ph) * 4 * S, by = y + Math.sin(a + t * 0.03) * u * R * 0.92 + Math.cos(t * 0.6 + ph) * 4 * S;
    ctx.globalAlpha = (1 - u * u) * (0.35 + 0.65 * sw) * (df ? 0.85 : 0.8);
    ctx.strokeStyle = df ? '#efe6b0' : '#7d8a4a'; ctx.lineWidth = Math.max(1, 1.4 * S);
    ctx.beginPath(); ctx.arc(bx, by, br * (0.6 + 0.4 * sw), 0, TAU); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.globalAlpha *= 0.9; ctx.beginPath(); ctx.arc(bx - br * 0.3, by - br * 0.3, Math.max(0.8, br * 0.18), 0, TAU); ctx.fill();
  }
}
function drawFlush(h, x, y, R, t, df, rnd) {
  const w = h.warn, since = G.realT - h.blastT;
  // Warmth: faint until it builds, then glowing hot.
  bhGlow(x, y, R, df ? 'rgba(244,162,97,' + (0.1 + 0.4 * w) + ')' : 'rgba(255,190,140,' + (0.15 + 0.45 * w) + ')', df ? 'rgba(244,162,97,' + (0.04 + 0.18 * w) + ')' : 'rgba(255,200,160,' + (0.06 + 0.2 * w) + ')', 1);
  // Heat haze: wavy strokes rising, faster and brighter as it builds.
  ctx.lineCap = 'round';
  for (let i = 0; i < 55; i++) {
    const u = Math.sqrt(rnd()), a = rnd() * TAU, ph = rnd(), L = (16 + rnd() * 26) * S;
    const rise = ((t * (0.25 + w * 1.2) + ph) % 1), hx = x + Math.cos(a) * u * R, hy = y + Math.sin(a) * u * R - rise * 40 * S;
    ctx.globalAlpha = Math.min(1, (1 - u * u) * Math.sin(rise * Math.PI) * (0.55 + 0.6 * w));
    ctx.strokeStyle = w > 0.5 && i % 3 === 0 ? '#ffffff' : df ? '#f4a261' : '#b8604a'; ctx.lineWidth = Math.max(1.2, 2 * S);
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) { const px = hx - L / 2 + L * k / 6, py = hy + Math.sin(k * 1.3 + t * 6 + ph * 9) * 2.5 * S; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  }
  // Just went off: a hot wash fading out.
  if (since < 0.8) bhGlow(x, y, R * (1 + since * 0.3), 'rgba(255,240,220,' + (0.7 * (1 - since / 0.8)) + ')', 'rgba(244,162,97,' + (0.4 * (1 - since / 0.8)) + ')', 1);
}
function drawMucus(h, x, y, R, t, df, rnd) {
  bhGlow(x, y, R, df ? 'rgba(216,226,166,0.13)' : 'rgba(216,226,166,0.32)', df ? 'rgba(216,226,166,0.06)' : 'rgba(200,214,150,0.16)', 1);
  // Strings of mucus sagging between points, swaying slowly.
  ctx.lineCap = 'round';
  for (let i = 0; i < 34; i++) {
    const u1 = Math.sqrt(rnd()) * 0.9, a1 = rnd() * TAU, u2 = Math.min(0.92, Math.max(0.05, u1 + (rnd() - 0.5) * 0.35)), a2 = a1 + (rnd() - 0.5) * 0.7, ph = rnd() * TAU;
    const x1 = x + Math.cos(a1) * u1 * R, y1 = y + Math.sin(a1) * u1 * R, x2 = x + Math.cos(a2) * u2 * R, y2 = y + Math.sin(a2) * u2 * R;
    const sag = (14 + 10 * Math.sin(t * 0.5 + ph)) * S + Math.hypot(x2 - x1, y2 - y1) * 0.25, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
    ctx.globalAlpha = Math.min(1, (1 - Math.max(u1, u2) * 0.8) * (df ? 0.85 : 0.9));
    ctx.strokeStyle = df ? '#d8e2a6' : '#7d8a4a'; ctx.lineWidth = Math.max(1.5, (1.5 + rnd() * 2.5) * S);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2, y2); ctx.stroke();
    ctx.globalAlpha *= 0.7; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(0.6, 0.6 * S);
    ctx.beginPath(); ctx.moveTo(x1, y1 - 1); ctx.quadraticCurveTo(mx, my - 1.5 * S, x2, y2 - 1); ctx.stroke();
  }
  // Glossy beads caught in it.
  for (let i = 0; i < 40; i++) {
    const u = Math.sqrt(rnd()), a = rnd() * TAU, br = (2 + rnd() * 5) * S, ph = rnd() * TAU;
    const bx = x + Math.cos(a) * u * R, by = y + Math.sin(a) * u * R + Math.sin(t * 0.8 + ph) * 2 * S;
    ctx.globalAlpha = (1 - u * u) * (df ? 0.7 : 0.55);
    ctx.fillStyle = df ? '#d8e2a6' : '#7d8a4a'; ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(bx - br * 0.35, by - br * 0.35, Math.max(0.7, br * 0.3), 0, TAU); ctx.fill();
  }
}
