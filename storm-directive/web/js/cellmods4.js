'use strict';
// Spawn Prawn - weapon cells, part 4: the two pools as water balloons (redesign docs/MODIFIER_MATRIX.md 5.10, decision 63;
// the user's picks, 24 Oct). Nocturnal Emission (v_ice_pool) and Hot Mess (v_flame_pool) share one set of cells (tag bl):
// every one of the 25 modifiers, plus Switched at Birth as a two-tone balloon. Replaces Hot Mess's 5.7 cells (cellmods2.js
// keys them on tag hm, which no weapon has now). Same engine as cellmods.js: masking, no fork screens, rank 4 is the mastery.
//  - Every puddle a balloon leaves is tagged as it lands (landLob): z.blW is the weapon, z.src.blZ the puddle, so a hit
//    from it knows where it came from. Most cells run on those puddles each frame (XC_TICK.bl).
//  - Throws that the cells change (Charged, Every Nth, Extra Projectiles, Piercing) go through blVolley; the balloons on the
//    floor (Mines), the bag (Death from Above), the juggled balloons (Orbiting) and Smash it on them (Melee) replace firing.
//  - Catalyst, Kinship and Area keep their shared forms and add to them; every other cell masks its shared form.
// Simplified: Switched at Birth has no ranks, so its "+20 / 40%" and the swapping halves (mastery) are not built (as on
// Nappy Mines). The Range wave and the Extra Projectiles lake are puddles laid in a line and one big puddle (zones are round).
// Card text: TODO_COPY:cell_bl_<modifier> (one per cell, shared by both pools).
// Hooks: none in shared files. Adds XC_W / XC_ALT / MM_SAB entries; fills XC_FIRE / XC_STATS / XC_TICK / XC_RUN / XC_LIFE;
// wraps modOk, landLob, wupDmgMul, wupHit, wupKill, rxFired, hurtPlayer, modDraw. Loads after balloon.js.

const BL_CELLS = ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing',
  'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'ranged', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'];
for (const id of ['v_ice_pool', 'v_flame_pool']) XC_W[id] = { tag: 'bl', cells: BL_CELLS, mask: BL_CELLS.filter(x => !['catalyst', 'kinship', 'area'].includes(x)), deny: [], atkOk: BL_CELLS };
XC_ALT.v_ice_pool = ['arcane']; MM_SAB.v_ice_pool = 'arcane'; // (Switched at Birth: Mucus to Blood; Hot Mess keeps Acid or Mucus)
modOk = (orig => function (w, id) { // Ranged is for four close-range weapons; on the pools it is the water pistol
  if (id !== 'ranged' || !xcIs(w, 'bl')) return orig(w, id);
  const k = w24Key(w); MW_RANGED.push(k);
  try { return orig(w, id); } finally { MW_RANGED.splice(MW_RANGED.lastIndexOf(k), 1); }
})(modOk);

const blR = (w, id) => xcR(w, id);
const blS = () => { const S = xcS(); return S.bl || (S.bl = { prints: [], floor: [], bags: [], stuck: [], rain: [] }); };
const blZs = w => G.zones.filter(z => z.blW === w && z.life > 0);
const blIn = (z, e) => Math.hypot(e.x - z.x, e.y - z.y) < z.r + (e.r || 0) * 0.5;
const blOk = e => !!(e && !e.dead && !e.charmed && !e.egg);
const blSrc = w => Object.assign(weaponSrc(w), { zoneHit: true });
const blOrigType = w => (W24_BY[w24Key(w)] || {}).type || w.def.elem;
const blTypeCol = t => (typeof V10_COL !== 'undefined' && V10_COL[t]) || (ELEMENTS[t] && ELEMENTS[t].color) || '#ffffff';

// ---------------------------------------------------------------- throwing and landing
// A balloon thrown by a cell. o: x, y (from), tx, ty (if no face), k (splat size), d (damage), l (puddle life), flight,
// plus flags read when it lands (faceK, stick, giant, bomb, bn ...).
function blThrow(w, face, o) {
  o = o || {};
  const p = G.player, sx = o.x != null ? o.x : p.x, sy = o.y != null ? o.y : p.y;
  const tx = face ? face.x : o.tx, ty = face ? face.y : o.ty;
  if (tx == null) return null;
  const k = o.k || 1, ws = (k !== 1 || o.d || o.l) ? Object.assign({}, w.s, { area: w.s.area * k, dmg: w.s.dmg * (o.d || 1), dur: w.s.dur * (o.l || 1), blSize: Math.sqrt(k) }) : null;
  const fw = ws ? Object.create(w, { s: { value: ws } }) : w;
  const pr = { lob: true, sx, sy, tx, ty, x: sx, y: sy, t: 0, flight: o.flight || (w.s.flight || 0.55) * rand(0.9, 1.15), w: fw, src: weaponSrc(w), color: w.def.color, dead: false,
    bl: { face: face || null, ox: tx, oy: ty, dx: 0, dy: 0, seed: Math.random() * TAU }, blo: o };
  G.proj.push(pr);
  return pr;
}
// A balloon that bursts here and now (on the floor, in your hand, in orbit).
function blPop(w, face, x, y, o) {
  const pr = blThrow(w, face, Object.assign({ x, y, tx: x, ty: y, flight: 0.01 }, o || {}));
  if (!pr) return;
  pr.dead = true; if (face) { pr.tx = face.x; pr.ty = face.y; }
  landLob(pr);
}
// A small puddle laid by a cell (not a balloon).
function blPuddle(w, x, y, k) {
  k = k || {};
  if (G.zones.length >= 150) return null;
  const s = w.s, life = s.dur * (k.l || 1);
  const z = { x, y, r: s.area * (k.r || 1) * xcArea(w), life, max: life, dps: s.dmg * 0.9 * (k.d || 1), elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w) };
  G.zones.push(z); blZone(w, z, null);
  return z;
}
// Every puddle of this weapon, as it appears.
function blZone(w, z, pr) {
  z.blW = w; z.blBorn = G.t; z.blR0 = z.r; z.blD0 = z.dps;
  z.src = Object.assign({}, z.src, { blZ: z }); z.hsrc = null;
  if (pr) { z.blDir = Math.atan2(pr.ty - pr.sy, pr.tx - pr.sx); z.blFar = Math.hypot(pr.tx - pr.sx, pr.ty - pr.sy); }
  if (w.def.sab && !z.blTwo && pr) { // Two-tone balloon: half the new type, half the old
    const t0 = blOrigType(w); if (t0 === w.def.elem) return;
    const a = (z.blDir || 0) + Math.PI / 2, off = z.r * 0.4;
    z.r *= 0.75; z.blR0 = z.r;
    const z2 = Object.assign({}, z, { x: z.x - Math.cos(a) * off, y: z.y - Math.sin(a) * off, elem: t0, color: blTypeCol(t0), blTwo: 1, st: 0, hsrc: null });
    z2.src = Object.assign({}, z.src, { elem: t0, blZ: z2 });
    z.x += Math.cos(a) * off; z.y += Math.sin(a) * off; z.blTwo = 1;
    if (G.zones.length < 150) G.zones.push(z2);
  }
}
// Before the normal landing: bounces (Ricochet) and balloons that stick to the face first (Charged mastery).
function blPre(w, pr) {
  const o = pr.blo || {}, face = pr.bl && pr.bl.face, R = id => blR(w, id);
  if (o.stick && !pr.blStuck && blOk(face)) { blS().stuck.push({ pr, face, end: G.t + 1 }); return true; }
  const nb = xcLv([1, 3, 6, 12], R('ricochet'));
  if (R('ricochet') && blOk(face) && (o.bn || 0) < nb) {
    const x = face.x, y = face.y, kk = Math.pow(0.8, (o.bn || 0) + 1) * (o.wk || 1);
    damageEnemy(face, w.s.dmg * kk, weaponSrc(w)); blPuddle(w, x, y, { r: Math.sqrt(kk), d: kk });
    ring(x, y, 20, w.def.color, 0.2, 3); fxParts('drop', x, y, w.def.color, 6, 140, 0.35, 3);
    const hit = (o.hit || []).concat([face]);
    let ux = pr.tx - pr.sx, uy = pr.ty - pr.sy; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    const na = Math.atan2(-uy, -ux) + rand(-0.9, 0.9), nx = Math.cos(na), ny = Math.sin(na), dot = ux * nx + uy * ny;
    let rx = ux - 2 * dot * nx, ry = uy - 2 * dot * ny, wk = o.wk || 1;
    let next = null, bd = 320;
    for (const e of G.enemies) {
      if (!blOk(e) || hit.includes(e)) continue;
      const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy);
      if (d < bd && (dx * rx + dy * ry) / (d || 1) > 0.77) { bd = d; next = e; }
    }
    const nxt = Object.assign({}, o, { x, y, bn: (o.bn || 0) + 1, hit, flight: 0.3 });
    if (next) { blThrow(w, next, nxt); return true; }
    if (R('ricochet') >= 4 && typeof modWall === 'function') { // Pinball: off the walls too, a little bigger each time
      for (let d = 20; d <= 160; d += 20) {
        if (!modWall(x + rx * d, y + ry * d)) continue;
        if (modWall(x + rx * d, y)) rx = -rx; else ry = -ry;
        nxt.wk = wk * 1.1 / 0.8; blThrow(w, null, Object.assign(nxt, { tx: x + rx * 140, ty: y + ry * 140 })); return true;
      }
    }
  }
  return false;
}
// After it: everything that happens where it burst.
function blPost(w, pr, zs) {
  const R = id => blR(w, id), o = pr.blo || {}, s = w.s, face = pr.bl && pr.bl.face, x = pr.tx, y = pr.ty, src = weaponSrc(w);
  const dir = Math.atan2(pr.ty - pr.sy, pr.tx - pr.sx), far = Math.hypot(pr.tx - pr.sx, pr.ty - pr.sy);
  if (R('upclose')) { // Face takes it all
    if (blOk(face)) damageEnemy(face, s.dmg * xcLv([0.4, 0.8, 1.2, 1.2], R('upclose')), src);
    for (const z of zs) { z.dps *= xcLv([0.75, 0.65, 0.55, 0.55], R('upclose')); z.blD0 = z.dps; }
  }
  if (o.faceK && blOk(face)) damageEnemy(face, s.dmg * (o.faceK - 1), src); // (Overfilled balloon, Giant balloon)
  if (R('range') && !o.bn) { // Through the crowd: the spray fans on past the face
    const wave = R('range') >= 4 && far >= s.range * 0.8, L = wave ? 600 : xcLv([120, 180, 240, 240], R('range')), cx = Math.cos(dir), cy = Math.sin(dir);
    forNear(x, y, L, e => {
      if (!blOk(e) || e === face) return;
      const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1;
      if ((dx * cx + dy * cy) / d < 0.86) return;
      damageEnemy(e, s.dmg * 0.6, src); if (wave && !e.boss) shove(e, x, y, 140);
    });
    const n = wave ? 5 : 2;
    for (let i = 1; i <= n; i++) { const d = L * i / (n + 0.2); blPuddle(w, x + cx * d, y + cy * d, { r: 0.55, l: 0.8 }); }
    fxParts('drop', x, y, w.def.color, 10, 260, 0.45, 3, dir, 0.5);
  }
  if (o.jet) { // Leaky balloon mastery: a jet on through the next 6
    const cx = Math.cos(dir), cy = Math.sin(dir), line = [];
    forNear(x, y, 320, e => { if (!blOk(e) || e === face) return; const dx = e.x - x, dy = e.y - y, along = dx * cx + dy * cy; if (along > 0 && Math.abs(dx * cy - dy * cx) < 30 + e.r) line.push([along, e]); });
    line.sort((a, b) => a[0] - b[0]);
    for (const [, e] of line.slice(0, 6)) damageEnemy(e, s.dmg * 0.5, src);
    fxParts('drop', x, y, w.def.color, 8, 320, 0.4, 2.5, dir, 0.12);
  }
  if (R('kinship')) blFamily(w, face, x, y);
  if (R('knock') >= 4 && blOk(face) && !face.boss) { shove(face, pr.sx, pr.sy, 260); face.xcCan = { w, t: G.t + 0.6, f: 160, k: 0.3 }; } // Bowling face
  if (o.bomb) { aoe(x, y, s.area * 2.2, s.dmg, src, w.def.color); blPuddle(w, x, y, { r: 2, l: 1.5 }); } // Water bomb
  if (o.lake) { const L = o.lake; L.n++; if (L.n === L.of) { const z = blPuddle(w, L.x, L.y, { r: 1.6, l: 1.3 }); if (z) z.blLake = 1; } } // Cluster mastery: the splits join into a lake
}
landLob = (orig => function (pr) {
  const w = pr && pr.src && pr.src.w;
  if (!G || !w || !xcIs(w, 'bl') || !xcAny(w) || !pr.bl) return orig(pr);
  if (blPre(w, pr)) return;
  const n = G.zones.length;
  orig(pr);
  const zs = [];
  for (let i = n; i < G.zones.length; i++) { const z = G.zones[i]; if (z.src && z.src.w === w && !z.blW) { blZone(w, z, pr); zs.push(z); } }
  blPost(w, pr, zs);
})(landLob);

// Kinship, Family pack: each other weapon of the same damage type adds a small extra to the splat.
function blFamily(w, face, x, y) {
  const r = blR(w, 'kinship'), k = xcLv([1, 1.25, 1.5, 1.5], r);
  w.blKin = (w.blKin || 0) + 1;
  const times = r >= 4 && w.blKin % 3 === 0 ? 2 : 1;
  for (const o of G.weapons) {
    if (!o || o === w || o.isSpell || !o.def || mwType(o) !== mwType(w)) continue;
    for (let i = 0; i < times; i++) {
      const key = w24Key(o);
      if (key === 's_bubble' && blOk(face) && !face.boss && typeof xcTrap === 'function') xcTrap(o, face);
      else if (key === 's_mines') { const m = mineDrop(o, x + rand(-30, 30), y + rand(-30, 30)); m.arm = 0.2; G.proj.push(m); }
      else if (key === 's_redtape' && blOk(face)) { const n = xcFoe(face.x, face.y, 140, [face]); if (n) face.blTie = { o: n, t: G.t + 3, k: 0.3 * k }; }
      else if (key === 'v_flame_beam' && blOk(face)) { damageEnemy(face, o.s.dmg * 4 * k, weaponSrc(o)); ring(face.x, face.y, face.r + 10, o.def.color, 0.3, 4); }
      else if (blOk(face)) damageEnemy(face, (o.s.dmg || 5) * 0.5 * k, weaponSrc(o));
    }
  }
}

// ---------------------------------------------------------------- firing
// The throws the cells change: Every Nth, Extra Projectiles, Piercing (and Charged, once wound up).
function blVolley(w, t, base) {
  const R = id => blR(w, id), o0 = Object.assign({}, base || {});
  if (R('nth')) { // Giant balloon
    w.blN = (w.blN || 0) + 1;
    if (w.blN % (R('nth') >= 2 ? 3 : 4) === 0) { o0.k = (o0.k || 1) * 2; o0.l = 3; if (R('nth') >= 3) o0.faceK = (o0.faceK || 1) * 1.5; if (R('nth') >= 4) o0.bomb = 1; }
  }
  let faces = [t];
  const ex = R('extra');
  if (ex) { // Cluster balloon
    const n = xcLv([2, 3, 4, 4], ex), near = acquireMany('nearest', 170, t.x, t.y, n + 2).filter(e => e !== t && blOk(e));
    faces = [t, ...near].slice(0, n); while (faces.length < n) faces.push(null);
    o0.d = (o0.d || 1) * Math.pow(1 / n, 0.6);
    if (ex >= 4) { o0.lake = { n: 0, of: n, x: t.x, y: t.y }; faces = faces.map(() => null); }
  }
  faces.forEach((f, i) => {
    const o = Object.assign({}, o0);
    if (!f) { const a = i / faces.length * TAU; o.tx = t.x + Math.cos(a) * (ex >= 4 ? 90 : 50); o.ty = t.y + Math.sin(a) * (ex >= 4 ? 90 : 50); }
    if (R('piercing') && f) { // Leaky balloon: through N enemies, dripping on each, bursting on the next
      const p = G.player, N = xcLv([1, 3, 6, 12], R('piercing')), dx = f.x - p.x, dy = f.y - p.y, L = Math.hypot(dx, dy) || 1, cx = dx / L, cy = dy / L, line = [];
      for (const e of G.enemies) { if (!blOk(e)) continue; const ex2 = e.x - p.x, ey2 = e.y - p.y, along = ex2 * cx + ey2 * cy; if (along > 20 && along < L + 260 && Math.abs(ex2 * cy - ey2 * cx) < 30 + e.r) line.push([along, e]); }
      line.sort((a, b) => a[0] - b[0]);
      const drips = line.slice(0, N).map(q => q[1]), last = line[N] ? line[N][1] : (line.length ? line[line.length - 1][1] : f);
      const fl = (w.s.flight || 0.55);
      for (const [along, e] of line.slice(0, N)) if (e !== last) after(fl * Math.min(1, along / (L + 260)), () => { if (blOk(e)) { damageEnemy(e, w.s.dmg * 0.2, weaponSrc(w)); fxParts('drop', e.x, e.y, w.def.color, 4, 90, 0.3, 2.5); } });
      if (R('piercing') >= 4) o.jet = 1;
      f = last;
    }
    blThrow(w, f, o);
  });
}
XC_FIRE.bl = function (w, t) {
  const R = id => blR(w, id), p = G.player, s = w.s, S = blS();
  if (R('orbiting')) return true; // (juggled in the tick)
  if (R('melee')) { // Smash it on them
    const reach = (R('melee') >= 2 ? 130 : 110) * xcArea(w), f = xcFoe(p.x, p.y, reach);
    if (f) blPop(w, f, (p.x + f.x) / 2, (p.y + f.y) / 2, { faceK: R('melee') >= 2 ? 2.25 : 2 });
    return true;
  }
  if (!t) return false;
  if (R('mines')) { // Balloons on the floor
    const mine = S.floor.filter(q => q.w === w), cap = xcLv([3, 4, 5, 5], R('mines'));
    if (mine.length >= cap) mine[0].end = 0;
    S.floor.push({ w, x: t.x + rand(-30, 30), y: t.y + rand(-30, 30), end: G.t + 14, seed: Math.random() * TAU });
    return true;
  }
  if (R('dfa')) { // Stamp it out (or, at the mastery, the rain cloud)
    const x = t.x, y = t.y;
    G.fx.push({ type: 'warn', x, y, r: R('dfa') >= 4 ? s.area : 26, color: w.def.color, life: 0.6, max: 0.6 });
    after(0.6, () => {
      if (!G || !G.weapons.includes(w)) return;
      if (R('dfa') >= 4) { const z = blPuddle(w, x, y, { r: 0.3, l: 1.2 }); if (z) S.rain.push({ w, z, x, y, end: G.t + 2, tick: 0 }); }
      else S.bags.push({ w, x, y, end: G.t + 6, seed: Math.random() * TAU });
    });
    return true;
  }
  if (R('charged')) { // Overfilled balloon: it swells on your nose first
    if (!w.blWind) w.blWind = { end: G.t + xcLv([0.5, 0.4, 0.3, 0.3], R('charged')), t };
    return true;
  }
  if (R('nth') || R('extra') || R('piercing')) { blVolley(w, t); return true; }
  return false;
};
XC_STATS.bl = function (w, s) {
  const R = id => blR(w, id);
  if (R('range')) s.range *= 1 + xcLv([0.2, 0.4, 0.6, 0.6], R('range'));
  if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.2], R('rapid')); s.area *= xcLv([0.8, 0.7, 0.65, 0.65], R('rapid')); } // Balloon barrage
  if (R('charged')) s.cd += xcLv([0.5, 0.4, 0.3, 0.3], R('charged')); // (the wind-up is part of the wait)
};

// ---------------------------------------------------------------- every frame
XC_TICK.bl = function (w, dt) {
  const R = id => blR(w, id), s = w.s, p = G.player, S = blS(), zs = blZs(w);
  const t4 = !(w.blT4 > G.t); if (t4) w.blT4 = G.t + 0.25;
  // who is standing in which puddle (Sticky, Focus, Knockback, Primer read it)
  for (const z of zs) forNear(z.x, z.y, z.r, e => { if (blOk(e)) { e.blInT = G.t; e.blInZ = z; e.blInW = w; } });
  // Charged: the wind-up ends, the balloon goes
  if (w.blWind && G.t >= w.blWind.end) {
    const W = w.blWind, k = xcLv([1.6, 1.9, 2.2, 2.2], R('charged')); w.blWind = null;
    const t = blOk(W.t) ? W.t : acquire(aimDir(w), s.range, p.x, p.y);
    if (t) { const o = { k: 1 + (k - 1) / 2, faceK: k, stick: R('charged') >= 4 }; if (R('nth') || R('extra') || R('piercing')) blVolley(w, t, o); else blThrow(w, t, o); }
  }
  for (const z of zs) {
    const age = G.t - z.blBorn, life = z.max || 1;
    if (R('catalyst')) z.r = Math.max(4, z.blR0 * (1 - 0.4 * Math.min(1, age / life))); // Evaporating: it dries smaller
    if (R('pull')) { // Plughole
      const reach = z.r + xcLv([60, 120, 180, 180], R('pull')) * xcArea(w);
      forNear(z.x, z.y, reach, e => { if (blOk(e) && !e.boss) mwPull(e, z.x, z.y, 35 * dt); });
      if (z.life < 1 && !z.blGurg) { z.blGurg = 1; forNear(z.x, z.y, reach, e => { if (blOk(e)) mwPull(e, z.x, z.y, 50); }); fxParts('bubble', z.x, z.y, z.color, 8, 60, 0.5, 3); }
      if (R('pull') >= 4 && z.life <= dt * 1.5 && !z.blSpit) { z.blSpit = 1; forNear(z.x, z.y, reach, e => { if (blOk(e)) mwPull(e, z.x, z.y, 90); }); const c = acquire('cluster', 420, z.x, z.y); if (c) blThrow(w, c, { x: z.x, y: z.y }); }
    }
    if (R('knock')) forNear(z.x, z.y, z.r, e => { // Slip and slide
      if (!blOk(e) || e.boss) return;
      const k = Math.min(3, R('knock'));
      if (e.blPx != null && e.blPt === G.frameN - 1) { const vx = (e.x - e.blPx) / Math.max(dt, 1e-3), vy = (e.y - e.blPy) / Math.max(dt, 1e-3); e.x += vx * dt * 0.5 * k; e.y += vy * dt * 0.5 * k;
        if (Math.hypot(vx, vy) > 60 && !(e.blColT > G.t)) { const o = msNear(e.x, e.y, e.r + 4, [e]); if (o && blOk(o)) { e.blColT = o.blColT = G.t + 0.5; damageEnemy(e, s.dmg * 0.3, blSrc(w)); damageEnemy(o, s.dmg * 0.3, blSrc(w)); } } }
      e.kx = (e.kx || 0) * (1 + dt * 1.5 * k); e.ky = (e.ky || 0) * (1 + dt * 1.5 * k);
      e.blPx = e.x; e.blPy = e.y; e.blPt = G.frameN;
    });
    if (R('sticky') >= 4) { // Clump: enemies in the puddle stick together
      const ins = []; forNear(z.x, z.y, z.r, e => { if (blOk(e) && !e.boss && ins.length < 8) ins.push(e); });
      if (ins.length >= 2) { let cx = 0, cy = 0; for (const e of ins) { cx += e.x; cy += e.y; } cx /= ins.length; cy /= ins.length; for (const e of ins) { mwPull(e, cx, cy, 60 * dt); msSlow(e, 0.5, 0.3); } }
    }
    if (R('explode') >= 4) { forNear(z.x, z.y, z.r, e => { if (blOk(e)) (z.blHeld || (z.blHeld = new Set())).add(e.id); }); // Geyser
      if (z.life <= dt * 1.5 && !z.blGey) { z.blGey = 1; const n = Math.min(10, z.blHeld ? z.blHeld.size : 0), k = 1 + 0.1 * n; aoe(z.x, z.y, z.r * k, s.dmg * k, blSrc(w), w.def.color); fxParts('drop', z.x, z.y, z.color, 16, 300, 0.6, 3.5); } }
    if (R('homing')) { // Creeping puddle
      if (!(z.blTgtT > G.t) || !blOk(z.blTgt)) { z.blTgtT = G.t + 0.5; z.blTgt = null; let bd = 320; for (const e of G.enemies) { if (!blOk(e) || blIn(z, e)) continue; const d = Math.hypot(e.x - z.x, e.y - z.y); if (d < bd) { bd = d; z.blTgt = e; } } }
      const e = z.blTgt;
      if (e) {
        const d = Math.hypot(e.x - z.x, e.y - z.y) || 1, v = xcLv([20, 40, 60, 60], R('homing')) * dt, nx = z.x + (e.x - z.x) / d * v, ny = z.y + (e.y - z.y) / d * v;
        if (!(typeof modWall === 'function' && modWall(nx, ny))) { z.x = nx; z.y = ny; }
        if (R('homing') >= 4 && !z.blSplit && d < z.r * 0.6 && G.zones.length < 150) { // it splits to chase two more
          z.blSplit = 1; z.r *= 0.75; z.blR0 = z.r; z.blTgt = null;
          const z2 = Object.assign({}, z, { st: 0, hsrc: null, blTgt: null, x: z.x + rand(-10, 10), y: z.y + rand(-10, 10) }); z2.src = Object.assign({}, z.src, { blZ: z2 }); G.zones.push(z2);
        }
      }
    }
    if (R('ranged') && !(z.blJetT > G.t)) { // Water pistol puddles
      const r = R('ranged'), sp = r >= 4;
      z.blJetT = G.t + (sp ? 1 / 6 : 1 / xcLv([1, 2, 3, 3], r));
      let a = null, o = null;
      if (sp) { a = Math.random() * TAU; for (let d = z.r; d < z.r + 150 && !o; d += 15) o = msNear(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d, 14); }
      else { o = xcFoe(z.x, z.y, z.r + 150); if (o && blIn(z, o)) o = null; if (o) a = Math.atan2(o.y - z.y, o.x - z.x); }
      if (a != null) fxParts('drop', z.x + Math.cos(a) * z.r * 0.8, z.y + Math.sin(a) * z.r * 0.8, z.color, 5, 380, 0.3, 2.5, a, 0.08);
      if (o && blOk(o)) damageEnemy(o, s.dmg * (sp ? 0.2 : 0.3), Object.assign(weaponSrc(w), { blJet: 1 }));
    }
    if (R('connecting') >= 4 && z.life <= dt * 1.5 && !z.blPour) { // a puddle that ends pours into your nearest other one
      z.blPour = 1; let b = null, bd = 1e9; for (const q of zs) { if (q === z || q.life <= dt * 1.5) continue; const d = Math.hypot(q.x - z.x, q.y - z.y); if (d < bd) { bd = d; b = q; } }
      if (b) { b.r = Math.max(b.r, z.r); b.blR0 = Math.max(b.blR0, z.blR0); b.life = Math.min(b.max * 1.5, b.life + 1); }
    }
    if (z.blLake && t4) forNear(z.x, z.y, z.r + 30, e => { if (blOk(e) && !blIn(z, e)) mwPull(e, z.x, z.y, 30); }); // the lake holds the crowd
    if (z.blSurge && G.t >= z.blSurge) { z.blSurge = 0; z.r = z.blRS || z.r; } // (High tide ends)
  }
  if (R('rapid') && t4) for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) { // Balloon barrage: splats that overlap merge
    const a = zs[i], b = zs[j]; if (a.life <= 0 || b.life <= 0 || a.blLake || b.blLake || a.elem !== b.elem) continue;
    if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.7) {
      a.r = Math.min(Math.hypot(a.r, b.r), s.area * 1.73 * xcArea(w)); a.blR0 = a.r; a.life = Math.max(a.life, b.life); a.max = Math.max(a.max, b.max);
      a.blPieces = (a.blPieces || 1) + (b.blPieces || 1); b.life = 0;
    }
  }
  if (R('rapid') >= 4) for (const z of zs) if (z.blPieces >= 3 && !(z.blRipT > G.t)) { z.blRipT = G.t + 1; aoe(z.x, z.y, z.r, s.dmg * 0.3, blSrc(w), w.def.color); } // a merged puddle ripples
  // Sticky footprints: enemies walking out of a puddle leave a sticky trail
  if (R('sticky')) {
    const dur = xcLv([2, 3, 4, 4], R('sticky')), slow = xcLv([0.3, 0.5, 0.7, 0.7], R('sticky'));
    for (const e of G.enemies) {
      if (!blOk(e) || e.blInW !== w || e.blInT >= G.t || G.t - e.blInT > 2) continue;
      if (e.blFx == null || Math.hypot(e.x - e.blFx, e.y - e.blFy) > 24) { e.blFx = e.x; e.blFy = e.y; if (S.prints.length < 80) S.prints.push({ w, x: e.x, y: e.y, a: Math.atan2(e.vy || 0, e.vx || 1), end: G.t + dur, r: 14 }); }
    }
    if (t4) for (const q of S.prints) if (q.w === w && q.end > G.t) forNear(q.x, q.y, q.r, e => { if (blOk(e)) msSlow(e, slow, 0.4); });
  }
  // Fully cooked: a fully marinated enemy drips its own puddle
  if (R('focus') >= 4) for (const e of G.enemies) {
    if (!blOk(e) || e.blCookW !== w || !(e.blCook > G.t)) continue;
    if (e.blCx == null || Math.hypot(e.x - e.blCx, e.y - e.blCy) > 40) { e.blCx = e.x; e.blCy = e.y; blPuddle(w, e.x, e.y, { r: 25 / Math.max(1, s.area), l: 0.6, d: 0.5 }); }
  }
  // Up Close mastery: Point-blank balloon
  if (R('upclose') >= 4 && !(w.blPbT > G.t)) {
    const f = xcFoe(p.x, p.y, 120);
    if (f) { w.blPbT = G.t + 3; blThrow(w, f, { flight: 0.15 }); fxParts('drop', p.x, p.y, w.def.color, 3, 40, 0.4, 2); }
  }
  // Melee mastery: Belly flop
  if (R('melee') >= 4) {
    const inZ = zs.find(z => Math.hypot(p.x - z.x, p.y - z.y) < z.r);
    if (inZ && w.blWasIn !== inZ && !inZ.blFlop) { inZ.blFlop = 1; aoe(inZ.x, inZ.y, inZ.r, s.dmg, blSrc(w), w.def.color); ring(inZ.x, inZ.y, inZ.r, w.def.color, 0.35, 5); fxParts('drop', p.x, p.y, w.def.color, 12, 220, 0.45, 3); }
    w.blWasIn = inZ || null;
  }
  // Orbiting: Juggling
  if (R('orbiting')) {
    const r = R('orbiting'), n = xcLv([1, 2, 3, 3], r), Rr = (r >= 2 ? 100 : 72) * xcArea(w);
    const O = w.blOrb || (w.blOrb = { a: 0, slots: [] });
    while (O.slots.length < n) O.slots.push({ ready: 0 }); O.slots.length = n;
    O.a += 2.2 * dt; O.R = Rr;
    O.slots.forEach((sl, i) => {
      const a = O.a + i / n * TAU; sl.x = p.x + Math.cos(a) * Rr; sl.y = p.y + Math.sin(a) * Rr; sl.ang = a + Math.PI / 2;
      if (sl.ready > G.t) return;
      const e = msNear(sl.x, sl.y, 14);
      if (e && blOk(e)) { sl.ready = G.t + 1.2; blPop(w, e, sl.x, sl.y, { faceK: 1.5 }); }
    });
  } else w.blOrb = null;
  // Area mastery: High tide
  if (R('area') >= 4 && !(w.blTideT > G.t)) { if (w.blTideT) for (const z of zs) { z.blRS = z.r; z.r *= 2; z.blSurge = G.t + 1; } w.blTideT = G.t + 10; }
  // Mines: balloons on the floor burst in the face of whoever treads on them
  const popFloor = q => {
    if (q.end <= 0) return; q.end = 0;
    const e = xcFoe(q.x, q.y, 30); blPop(w, e, q.x, q.y);
    if (R('mines') >= 4) for (const o of S.floor) if (o.w === w && o.end > G.t && Math.hypot(o.x - q.x, o.y - q.y) < 160) popFloor(o);
  };
  for (const q of S.floor) if (q.w === w && q.end > G.t && xcFoe(q.x, q.y, 16)) popFloor(q);
  // Death from Above: the first enemy to tread on the bag splashes 3 (then 4) puddles round itself
  for (const q of S.bags) {
    if (q.w !== w || q.end < G.t) continue;
    const e = xcFoe(q.x, q.y, 18); if (!e) continue;
    q.end = 0; const n = R('dfa') >= 3 ? 4 : 3;
    damageEnemy(e, s.dmg, weaponSrc(w)); fxParts('drop', q.x, q.y, w.def.color, 14, 220, 0.45, 3);
    for (let i = 0; i < n; i++) { const a = i / n * TAU + Math.random(); blPuddle(w, e.x + Math.cos(a) * 45, e.y + Math.sin(a) * 45, { r: 0.7, d: R('dfa') >= 2 ? 1.3 : 1 }); }
  }
  // the rain cloud: the puddle fills while it rains
  for (const q of S.rain) {
    if (q.w !== w || q.end < G.t) continue;
    q.z.r = Math.min(s.area * 1.3 * xcArea(w), q.z.r + s.area * 0.5 * dt); q.z.blR0 = q.z.r; q.z.life = Math.max(q.z.life, 1);
    if (!(q.tick > G.t)) { q.tick = G.t + 0.25; aoe(q.x, q.y, q.z.r, s.dmg * 0.25, blSrc(w), w.def.color); fxParts('drop', q.x + rand(-q.z.r, q.z.r), q.y + rand(-q.z.r, q.z.r), w.def.color, 4, 60, 0.3, 2.5); }
  }
  // the Charged mastery: balloons stuck to their face burst after 1 s
  for (const q of S.stuck) {
    if (q.done || q.pr.src.w !== w) continue;
    if (blOk(q.face)) { q.pr.tx = q.face.x; q.pr.ty = q.face.y; }
    if (G.t >= q.end || !blOk(q.face)) { q.done = 1; q.pr.blStuck = 1; landLob(q.pr); }
  }
  if (t4) { // housekeeping
    S.prints = S.prints.filter(q => q.end > G.t); S.floor = S.floor.filter(q => q.end > G.t); S.bags = S.bags.filter(q => q.end >= G.t);
    S.rain = S.rain.filter(q => q.end >= G.t); S.stuck = S.stuck.filter(q => !q.done);
  }
};
// Turncoat: Lifeguards stand at the rim of your nearest puddle and shove escapers back in.
XC_LIFE.bl = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_RUN.bl = function (z, dt) {
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  if (G.t >= z.xcRun.end) { z.dead = true; if (r >= 4) { const c = acquire('cluster', 420, z.x, z.y); if (c) blThrow(w, c, { x: z.x, y: z.y }); } return; }
  let q = null, bd = 400; for (const o of blZs(w)) { const d = Math.hypot(o.x - z.x, o.y - z.y); if (d < bd) { bd = d; q = o; } }
  if (!q) return;
  const a = Math.atan2(z.y - q.y, z.x - q.x), gx = q.x + Math.cos(a) * (q.r + 6), gy = q.y + Math.sin(a) * (q.r + 6), d = Math.hypot(gx - z.x, gy - z.y);
  if (d > 4) { const v = Math.min(d, 150 * dt); z.x += (gx - z.x) / d * v; z.y += (gy - z.y) / d * v; }
  forNear(z.x, z.y, z.r + 40, e => { if (!blOk(e) || e === z || e.boss || blIn(q, e)) return; if (e.blInZ === q && G.t - e.blInT < 1) xcToward(e, q.x, q.y, r >= 2 ? 240 : 120); });
};

// ---------------------------------------------------------------- damage, hits, kills, reactions
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const z = src && src.blZ, w = z && z.blW;
  if (!G || !w || !xcIs(w, 'bl')) return k;
  if (xcR(w, 'catalyst')) k *= 1 + xcLv([0.25, 0.5, 0.75, 0.75], xcR(w, 'catalyst')) * Math.min(1, (G.t - z.blBorn) / Math.max(0.1, z.max)); // concentrated as it dries
  if (xcR(w, 'focus')) { // Marinating
    if (!e.blMar || e.blMar.last < G.t - 0.4 || e.blMar.w !== w) e.blMar = { t0: G.t, w };
    e.blMar.last = G.t;
    const top = xcLv([0.4, 0.8, 1.2, 1.2], xcR(w, 'focus')), b = Math.min(top, 0.2 * (G.t - e.blMar.t0));
    k *= 1 + b;
    if (xcR(w, 'focus') >= 4 && b >= top && !(e.blCook > G.t)) { e.blCook = G.t + 3; e.blCookW = w; }
  }
  return k;
})(wupDmgMul);
wupHit = (orig => function (e, res, src) {
  orig(e, res, src);
  if (!G || !src || src.msEcho || src.echo) return;
  const amt = (res && (res.toHp || res.raw)) || 0;
  if (e.blTie && e.blTie.t > G.t && blOk(e.blTie.o) && amt > 0) damageEnemy(e.blTie.o, amt * e.blTie.k, msEcho(src)); // (Family pack with Ewww, Gross)
  const z = src.blZ, w = z && z.blW;
  if (w && xcIs(w, 'bl') && xcR(w, 'connecting') && amt > 0) { // Connected vessels
    const share = xcLv([0.3, 0.5, 0.7, 0.7], xcR(w, 'connecting'));
    let n = 0; for (const q of blZs(w)) { if (q === z || n >= 4) continue; const o = xcFoe(q.x, q.y, q.r); if (o) { n++; damageEnemy(o, amt * share, msEcho(weaponSrc(w))); } }
  }
  const hw = src.w; // Primer: another weapon's hit inside a primed puddle sets the whole puddle off
  if (!hw || hw.isSpell || src.zoneHit || (hw && xcIs(hw, 'bl'))) return;
  for (const q of G.zones) {
    if (!q.blW || q.life <= 0 || !xcR(q.blW, 'primer') || q.blW === hw || !blIn(q, e)) continue;
    const pw = q.blW, r = xcR(pw, 'primer'); q.life = 0;
    aoe(q.x, q.y, q.r, pw.s.dmg * xcLv([0.5, 0.75, 1, 1], r) * 3, blSrc(pw), pw.def.color); ring(q.x, q.y, q.r, pw.def.color, 0.35, 6);
    if (r >= 4) { const fs = acquireMany('nearest', 300, q.x, q.y, 3); for (const f of fs) blThrow(pw, f, { x: q.x, y: q.y }); }
    break;
  }
})(wupHit);
wupKill = (orig => function (e, src) {
  orig(e, src);
  if (!G) return;
  for (const z of G.zones) { // Pop goes the enemy: an enemy that dies in the puddle bursts like a balloon
    if (!z.blW || z.life <= 0 || !xcR(z.blW, 'explode') || z.blPopT > G.t || !blIn(z, e)) continue;
    const w = z.blW, r = xcR(w, 'explode'); z.blPopT = G.t + 0.5;
    aoe(e.x, e.y, xcLv([40, 60, 80, 80], r), w.s.dmg * xcLv([0.4, 0.6, 0.8, 0.8], r), blSrc(w), w.def.color);
    blPuddle(w, e.x, e.y, { r: 25 / Math.max(1, w.s.area), l: 2 / Math.max(0.5, w.s.dur) });
    fxParts('drop', e.x, e.y, w.def.color, 10, 200, 0.4, 3);
    break;
  }
})(wupKill);
rxFired = (orig => function (id, e) { // Evaporating mastery: a reaction in a puddle's last second refills it
  orig(id, e);
  if (!G || !e) return;
  for (const z of G.zones) if (z.blW && z.life > 0 && z.life < 1 && !z.blRefill && xcR(z.blW, 'catalyst') >= 4 && blIn(z, e)) { z.blRefill = 1; z.life = z.max; z.blBorn = G.t; z.r = z.blR0; ring(z.x, z.y, z.r, z.color, 0.3, 4); }
})(rxFired);
hurtPlayer = (orig => function (dmg, from, ent, kind) { // Juggling mastery: when you are hit, every juggled balloon bursts round you
  const hp = G && G.player ? G.player.hp : 0, r = orig(dmg, from, ent, kind);
  if (G && G.player && G.player.hp < hp) for (const w of G.weapons) {
    if (!w || !xcIs(w, 'bl') || xcR(w, 'orbiting') < 4 || !w.blOrb) continue;
    for (const sl of w.blOrb.slots) if (!(sl.ready > G.t) && sl.x != null) { sl.ready = G.t + 2; blPop(w, xcFoe(sl.x, sl.y, 60), sl.x, sl.y); }
  }
  return r;
})(hurtPlayer);

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons || !G.xcS || !G.xcS.bl) { blDrawW(); return; }
  const S = G.xcS.bl, k = S_();
  ctx.save();
  for (const q of S.prints) { const c = col(q.w.def.color); ctx.globalAlpha = 0.35 * Math.min(1, (q.end - G.t) / 0.6); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(sx(q.x), sy(q.y), 5 * k, 3.2 * k, q.a, 0, TAU); ctx.fill(); } // sticky footprints
  ctx.restore();
  for (const q of S.floor) { if (q.end <= G.t) continue; ctx.globalAlpha = 0.9; blShape(sx(q.x), sy(q.y), 6 * k, -Math.PI / 2 + Math.sin(G.t * 2 + q.seed) * 0.3, col(q.w.def.color), q.seed); } // balloons on the floor
  for (const q of S.bags) { if (q.end < G.t) continue; blShape(sx(q.x), sy(q.y), 8 * k, -Math.PI / 2, col(q.w.def.color), q.seed); }
  for (const q of S.stuck) if (!q.done && blOk(q.face)) blShape(sx(q.face.x), sy(q.face.y) - (q.face.r + 6) * k, 8 * k, -Math.PI / 2, col(q.pr.color), 1); // stuck to the face
  blDrawW();
})(modDraw);
function blDrawW() { // per weapon: juggled balloons, the balloon swelling on your nose
  if (!G || !G.weapons) return;
  const p = G.player, k = S_();
  for (const w of G.weapons) {
    if (!w || !xcIs(w, 'bl')) continue;
    const c = col(w.def.color);
    if (w.blOrb) for (const sl of w.blOrb.slots) if (sl.x != null && !(sl.ready > G.t)) blShape(sx(sl.x), sy(sl.y), 7 * k, sl.ang, c, sl.ang);
    if (w.blWind) { const W = w.blWind, tot = xcLv([0.5, 0.4, 0.3, 0.3], xcR(w, 'charged')), f = 1 - Math.max(0, W.end - G.t) / tot; blShape(sx(p.x + Math.cos(p.face || 0) * 18), sy(p.y + Math.sin(p.face || 0) * 18), (3 + 9 * f) * k, p.face || 0, c, 2); }
  }
}
