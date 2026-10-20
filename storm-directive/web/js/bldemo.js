'use strict';
// Spawn Prawn - previews and branch scenes for the other two baseline weapons, on the sidemo.js engine.
//  - Panic Button (Force Burst): the button marks the densest cluster in reach (380), the warning fills for 0.45 s,
//    then a 70-wide blast for 34. Three to a magazine, 1.1 s apart, a 1.4 s reload.
//  - Little Prick (Blood Projectile): a thin needle at the nearest cell in reach (440), 16 a hit, 0.45 s apart, 8 to a
//    magazine, a 1.2 s reload. Each hit adds a Bleed stack (3 at most, 4 s each; red pips and drips); a cell that dies
//    bleeding leaves a small blood pool.
//  - Each branch card (wup1.js Panic Button, wup2.js Little Prick) switches on its own effect in the scene.
// Hooks: none (PV_OWN entries, read by preview.js and sidemo.js).

const BLV_RED = '#ff4d6d', BLV_GREEN = '#8ac926', BLV_SPIT = '#b06cff';
const blvSeg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1, k = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)); return Math.hypot(p.x - a.x - dx * k, p.y - a.y - dy * k); };
// The magazine: fire(pv) returns true when it went off.
function blvGun(pv, dt, fire) {
  pv.cd -= dt;
  if (pv.rel > 0) { pv.rel -= dt; if (pv.rel <= 0) pv.ammo = pv.mag; }
  if (pv.cd <= 0 && pv.rel <= 0 && fire(pv)) { pv.n++; pv.cd = pv.rate; if (--pv.ammo <= 0) { pv.rel = pv.reload; sivTxt(pv, pv.me.x, pv.me.y - 0.06, 'RELOAD', '#8a959a'); } }
}
// Shared upkeep: particles, effects, the next group.
function blvTail(pv, dt, wave) {
  for (const q of pv.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  pv.parts = pv.parts.filter(q => q.life > 0);
  for (const f of pv.fx) f.life -= dt;
  pv.fx = pv.fx.filter(f => f.life > 0);
  if (sivAlive(pv).length < 2) { pv.waveT += dt; if (pv.waveT > 0.9) { pv.waveT = 0; wave(pv); } }
  if (!pv.foes.length) wave(pv);
}
// A spitter (purple rim) that lobs a slow blob at Spermy every 2.2 s; hit(pv) runs when one lands.
function blvSpit(pv, dt, hit) {
  for (const e of sivAlive(pv)) if (e.spit) { e.spitT = (e.spitT || 1) - dt; if (e.spitT <= 0) { e.spitT = 2.2; const a = Math.atan2(pv.me.y - e.y, pv.me.x - e.x); pv.ebul.push({ x: e.x, y: e.y, vx: Math.cos(a) * 0.3, vy: Math.sin(a) * 0.3, from: e }); } }
  for (const b of pv.ebul) { b.x += b.vx * dt; b.y += b.vy * dt; if (sivD(b, pv.me) < 0.03) { b.dead = true; hit(pv, b); } }
  pv.ebul = pv.ebul.filter(b => !b.dead && b.x > -0.05 && b.x < 1.05);
}
function blvDrawSpit(pv, g, X, Y, U) {
  for (const b of pv.ebul) { g.fillStyle = '#000'; g.strokeStyle = BLV_SPIT; g.lineWidth = 1.5; g.beginPath(); g.arc(X(b.x), Y(b.y), U * 0.009, 0, TAU); g.fill(); g.stroke(); }
}
const blvSpitCell = (g, e, x, y, r) => { if (e.spit) { g.strokeStyle = BLV_SPIT; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 2, 0, TAU); g.stroke(); } };

// ================================================================ Panic Button
const PBV = { id: 'v_phys_burst', range: 0.65, area: 0.12, delay: 0.45, cd: 1.1, mag: 3, reload: 1.4, dmg: 34 }; // (world 380 / 70)
const PBV_FLAG = { A: 'bigger', B: 'chain', C: 'evac', 'Bigger Bang Theory': 'bigger', 'Edge Case': 'edge', Encore: 'encore', 'Grudge Match': 'grudge',
  'Chain Reaction': 'chain', 'Daisy Chain': 'daisy', 'Grand Finale': 'finale', Dud: 'dud', 'Premature Evacuation': 'evac', 'Bumper Cars': 'bump',
  'Elbow Room': 'selfc', 'Shrapnel Shower': 'frag', 'Big Bang': 'big', 'Chain of Command': 'cmd', 'Trigger Happy': 'hair' };

function pbvInit(pv) {
  sivInit(pv);
  const F = pv.F;
  Object.assign(pv, { range: PBV.range, mag: PBV.mag, reload: PBV.reload, ammo: PBV.mag, rate: PBV.cd * (F.has('big') ? 2 : 1), cd: 0.4,
    blasts: [], frags: [], lumps: [], ebul: [], grudge: null, last: null });
  if (F.has('hair')) { pv.rate = 0.4; pv.mag = pv.ammo = 12; }
  pv.R = PBV.area * (F.has('bigger') ? 1.4 : 1) * (F.has('big') ? 2.5 : 1);
  pv.D = PBV.dmg * (F.has('big') ? 2 : 1) * (F.has('chain') ? 0.85 : 1);
  pv.me.x = F.has('selfc') ? 0.3 : 0.18;
}
function pbvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  const chain = F.has('chain'), close = F.has('selfc');
  for (let c = 0; c < 2; c++) {
    const cx = close ? 0.62 + c * 0.14 : 0.55 + c * 0.2, cy = H * (c ? 0.72 : 0.36) + (R() - 0.5) * 0.04;
    for (let i = 0; i < 5; i++) {
      const a = i / 5 * TAU + R(), d = i ? 0.035 + R() * 0.025 : 0;
      sivFoe(pv, cx + Math.cos(a) * d, cy + Math.sin(a) * d, { hp: chain ? (i % 2 ? 48 : 24) : 60, sp: close ? 0.07 : 0.035 });
    }
  }
  if (F.has('grudge')) sivFoe(pv, 0.5, H * 0.15, { hp: 90, sp: 0.005, spit: true });
}
// Where the blast goes: the densest cluster in reach (Personal Space: round you; Grudge Match: whoever hurt you).
function pbvAim(pv) {
  const F = pv.F, me = pv.me, R = pv.R, live = sivAlive(pv).filter(e => !e.dying && sivD(e, me) < pv.range);
  if (!live.length) return null;
  if (F.has('selfc')) return live.some(e => sivD(e, me) < R + e.r) ? { x: me.x, y: me.y, self: true } : null;
  if (F.has('grudge') && pv.grudge && pv.grudge.hp > 0 && sivD(pv.grudge, me) < pv.range) { const e = pv.grudge; pv.grudge = null; sivTxt(pv, e.x, e.y - e.r - 0.04, 'GRUDGE', BLV_SPIT, true); return { x: e.x, y: e.y }; }
  let best = null, bn = -1;
  for (const e of live) {
    if (F.has('hair') && pv.last && sivD(e, pv.last) < R) continue; // a different cluster each time
    const n = live.filter(o => sivD(o, e) < R).length - sivD(e, me) * 0.5;
    if (n > bn) { bn = n; best = e; }
  }
  best = best || live[0];
  const grp = live.filter(o => sivD(o, best) < R);
  let x = grp.reduce((a, o) => a + o.x, 0) / grp.length, y = grp.reduce((a, o) => a + o.y, 0) / grp.length;
  if (F.has('edge')) { const a = Math.atan2(y - me.y, x - me.x); x -= Math.cos(a) * R * 0.65; y -= Math.sin(a) * R * 0.65; sivTxt(pv, x, y - R, 'EDGE CASE', SIV_PALE); } // the rim sits on the crowd
  return { x, y };
}
function pbvFire(pv) {
  const F = pv.F, t = pbvAim(pv);
  if (!t) return false;
  const me = pv.me; pv.vn = (pv.vn || 0) + 1; pv.last = t;
  me.a = t.self ? me.a : Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.008;
  sivRing(pv, me.x, me.y, 0.04, pv.col, 0.2);
  if (F.has('dud') && pv.vn % 4 === 0) { pv.lumps.push({ x: t.x, y: t.y, t: 2 }); sivTxt(pv, t.x, t.y - 0.05, 'DUD', '#8a959a', true); return true; }
  const root = { pops: 0, last: null };
  pv.blasts.push({ x: t.x, y: t.y, t: PBV.delay, max: PBV.delay, r: pv.R, dmg: pv.D, kind: 'main', depth: 0, root });
  if (F.has('encore') && pv.vn % 4 === 0) pv.blasts.push({ x: t.x, y: t.y, t: PBV.delay + 0.3, max: PBV.delay + 0.3, r: pv.R * 2, dmg: pv.D * 0.6, kind: 'encore', depth: 0, root, label: 'ENCORE' });
  return true;
}
function pbvBoom(pv, b) {
  const F = pv.F, depth = F.has('cmd') ? 6 : F.has('daisy') ? 3 : 1;
  pv.flash = pv.flash || []; pv.flash.push({ x: b.x, y: b.y, r: b.r, life: 0.3, chain: b.kind === 'chain' });
  sivRing(pv, b.x, b.y, b.r, b.kind === 'chain' ? SIV_BONK : '#ffffff', 0.35); sivBits(pv, b.x, b.y, b.kind === 'main' ? 12 : 6, pv.col, 0.35);
  if (b.label) sivTxt(pv, b.x, b.y - b.r * 0.6, b.label, b.kind === 'chain' ? SIV_BONK : SIV_PALE, true);
  for (const e of sivAlive(pv)) {
    if (e.dying) continue;
    const d = sivD(e, b), reach = b.r + e.r;
    if (d > reach) continue;
    let k = b.dmg;
    if (F.has('bigger') && b.kind !== 'chain') k *= 0.8 + 0.5 * Math.min(1, d / b.r); // weak centre, hard rim
    sivDamage(pv, e, k, false, b.kind === 'chain' ? SIV_BONK : null);
    if (e.hp <= 0) {
      if (F.has('chain') && (b.kind !== 'chain' || b.depth < depth)) { // Chain Reaction: a pop where it died
        b.root.pops++; b.root.last = { x: e.x, y: e.y };
        pv.blasts.push({ x: e.x, y: e.y, t: 0.18, max: 0.18, r: F.has('cmd') ? pv.R : pv.R * 0.4, dmg: pv.D * (F.has('cmd') ? 1 : 0.5), kind: 'chain', depth: b.kind === 'chain' ? b.depth + 1 : 1, root: b.root, label: 'POP' });
      }
    } else if (F.has('evac')) { // Premature Evacuation: thrown outwards, further the harder it was hit
      const a = d > 0.001 ? Math.atan2(e.y - b.y, e.x - b.x) : Math.random() * TAU, v = 0.5 + k / 34 * 0.7;
      e.kx += Math.cos(a) * v; e.ky += Math.sin(a) * v; e.launched = 0.6; e.bumped = new Set(); e.wall = false;
    }
  }
  if (F.has('frag') && b.kind === 'main') for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + Math.random() * 0.5, v = 0.35 + Math.random() * 0.2; pv.frags.push({ x: b.x, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0.35, max: 0.35, hops: 1 }); }
  // Grand Finale: a chain of 3 or more ends in one big blast at the last link.
  if (b.kind === 'chain' && F.has('finale') && !b.root.done && b.root.pops >= 3 && !pv.blasts.some(o => o !== b && o.root === b.root && o.t > 0)) {
    b.root.done = true; const L = b.root.last;
    pv.blasts.push({ x: L.x, y: L.y, t: 0.25, max: 0.25, r: pv.R, dmg: pv.D, kind: 'finale', depth: 99, root: b.root, label: 'GRAND FINALE' });
  }
}
function pbvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  me.y = H * 0.56 + Math.sin(pv.t * 0.9) * 0.02; me.kick = Math.max(0, (me.kick || 0) - dt * 0.1);
  blvGun(pv, dt, pbvFire);
  for (const b of pv.blasts) { b.t -= dt; if (b.t <= 0 && !b.done) { b.done = true; pbvBoom(pv, b); } }
  pv.blasts = pv.blasts.filter(b => !b.done);
  for (const L of pv.lumps) { L.t -= dt; if (L.t <= 0) { L.done = true; pbvBoom(pv, { x: L.x, y: L.y, r: pv.R * 3, dmg: pv.D, kind: 'dud', depth: 0, root: { pops: 0 }, label: 'BOOM' }); } }
  pv.lumps = pv.lumps.filter(L => !L.done);
  for (const f of pv.frags) { // Shrapnel Shower: land, hit, bounce once
    f.t -= dt; f.x += f.vx * dt; f.y += f.vy * dt;
    if (f.t <= 0) {
      for (const e of sivAlive(pv)) if (!e.dying && sivD(e, f) < e.r + 0.025) sivDamage(pv, e, 10, false, DEF_PAL.shell);
      sivBits(pv, f.x, f.y, 3, DEF_PAL.shell, 0.15);
      if (f.hops-- > 0) { f.vx *= 0.6; f.vy *= 0.6; f.t = f.max = 0.25; } else f.dead = true;
    }
  }
  pv.frags = pv.frags.filter(f => !f.dead);
  // Bumper Cars: a thrown cell that meets another (or the edge) hurts both.
  for (const e of sivAlive(pv)) {
    if (!(e.launched > 0)) continue;
    e.launched -= dt;
    if (!F.has('bump')) continue;
    for (const o of sivAlive(pv)) if (o !== e && !o.dying && !e.bumped.has(o) && sivD(e, o) < e.r + o.r) {
      e.bumped.add(o); sivTxt(pv, (e.x + o.x) / 2, (e.y + o.y) / 2 - 0.03, 'BUMP', SIV_PALE, true);
      sivDamage(pv, e, 10, false, SIV_PALE); sivDamage(pv, o, 10, false, SIV_PALE); o.kx += e.kx * 0.6; o.ky += e.ky * 0.6; e.kx *= 0.3; e.ky *= 0.3;
    }
    if (!e.wall && (e.y < e.r + 0.005 || e.y > H - e.r - 0.005 || e.x > 0.99)) { e.wall = true; sivTxt(pv, e.x, e.y - 0.03, 'BUMP', SIV_PALE, true); sivDamage(pv, e, 10, false, SIV_PALE); }
  }
  blvSpit(pv, dt, (pv, b) => { sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true); if (F.has('grudge')) pv.grudge = b.from; });
  sivStepFoes(pv, dt);
  if (pv.flash) { for (const f of pv.flash) f.life -= dt; pv.flash = pv.flash.filter(f => f.life > 0); }
  blvTail(pv, dt, pbvWave);
}
function pbvUnder(pv, g, X, Y, U, c) {
  // The warning: a dashed circle that fills in until it goes off.
  for (const b of pv.blasts) {
    const k = 1 - Math.max(0, b.t) / b.max, x = X(b.x), y = Y(b.y), r = U * b.r;
    g.globalAlpha = 0.18; g.fillStyle = b.kind === 'chain' ? SIV_BONK : c; g.beginPath(); g.arc(x, y, r * k, 0, TAU); g.fill();
    g.globalAlpha = 0.7; g.save(); g.setLineDash([4, 4]); g.strokeStyle = b.kind === 'chain' ? SIV_BONK : c; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore();
  }
  for (const L of pv.lumps) { const x = X(L.x), y = Y(L.y), r = U * 0.022 * (1 + Math.sin(pv.t * (8 + (2 - L.t) * 6)) * 0.15); g.globalAlpha = 1; g.fillStyle = '#6b6f75'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = c; g.lineWidth = 1.5; g.stroke(); g.fillStyle = '#fff'; g.font = `700 ${Math.round(U * 0.025)}px monospace`; g.textAlign = 'center'; g.fillText(L.t.toFixed(1), x, y - r - 4); }
  g.globalAlpha = 1;
  blvDrawSpit(pv, g, X, Y, U);
}
function pbvOver(pv, g, X, Y, U, c) {
  for (const f of pv.flash || []) { const k = f.life / 0.3; pvGlow(g, X(f.x), Y(f.y), U * f.r * (1.1 - k * 0.2), f.chain ? SIV_BONK : c, 0.55 * k); }
  for (const f of pv.frags) { const h = Math.sin((1 - f.t / f.max) * Math.PI) * U * 0.03; g.fillStyle = DEF_PAL.shell; g.fillRect(X(f.x) - 3, Y(f.y) - 3 - h, 6, 6); }
}
PV_OWN[PBV.id] = { init: pbvInit, step: pbvStep, draw: sivDraw, flags: PBV_FLAG, under: pbvUnder, over: pbvOver, cell: (pv, g, e, x, y, r) => blvSpitCell(g, e, x, y, r) };

// ================================================================ Little Prick
const LPV = { id: 'v_arcane_proj', range: 0.75, speed: 0.95, cd: 0.45, mag: 8, reload: 1.2, dmg: 16, bleedT: 4, bleedDps: 1.6, near: 0.51 }; // (world 440; Next, Please 300)
const LPV_FLAG = { A: 'heart', B: 'needle', C: 'final', 'Bleeding Heart': 'heart', Leaky: 'leaky', 'Open Wound': 'wound', 'Sewing Circle': 'sewing',
  Needlework: 'needle', Sutures: 'sutures', 'Reef Knot': 'knot', Tattoo: 'tattoo', 'Final Prick': 'final', 'Next, Please': 'next', 'Terminal Clause': 'clause',
  Vaccination: 'vacc', Exsanguinate: 'exsang', 'Pin Cushion': 'pin', 'Coup de Grace': 'coup' };

function lpvInit(pv) {
  sivInit(pv);
  const F = pv.F;
  Object.assign(pv, { range: LPV.range, mag: LPV.mag, reload: LPV.reload, ammo: LPV.mag, rate: LPV.cd * (F.has('needle') ? 1.25 : 1), cd: 0.4,
    needles: [], pools: [], threads: [], ebul: [], vacc: 0, heal: 0 });
  pv.cap = F.has('heart') || F.has('exsang') ? 6 : 3;
  pv.me.x = 0.18;
  if (F.has('sewing')) { pv.scene = 'swarm'; pv.me.x = 0.45; } // (cells that circle you, so needles miss)
}
function lpvWave(pv) {
  const F = pv.F, H = pv.fh, cy = H * 0.56, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  if (pv.scene === 'swarm') for (let i = 0; i < 5; i++) { const e = sivFoe(pv, 0, 0, { orb: i / 5 * TAU, sp: 0.85, hp: 60 }); e.x = pv.me.x + Math.cos(e.orb) * 0.24; e.y = pv.me.y + Math.sin(e.orb) * 0.2; }
  else if (F.has('needle')) for (let i = 0; i < 6; i++) sivFoe(pv, 0.42 + i * 0.07, cy + (R() - 0.5) * 0.015, { hp: F.has('tattoo') ? 120 : 70, sp: 0.03 });
  else if (F.has('heart')) { const x = 0.62, y = H * (0.35 + R() * 0.3); for (let i = 0; i < 5; i++) sivFoe(pv, x + (i % 3) * 0.06, y + (i - 2) * 0.05, { hp: F.has('leaky') ? 130 : 80, sp: 0.03 }); }
  else if (F.has('final') || F.has('coup')) for (let i = 0; i < 5; i++) { const e = sivFoe(pv, 0.5 + R() * 0.3, H * (0.18 + i * 0.16), { hp: 60, sp: 0.03 }); e.hp = Math.round(e.max * (0.2 + R() * 0.8)); }
  else for (let i = 0; i < 5; i++) sivFoe(pv, 0.75 + R() * 0.3, H * (0.15 + R() * 0.7), { hp: 60 });
  if (F.has('vacc')) sivFoe(pv, 0.62, H * 0.15, { hp: 200, sp: 0.004, spit: true });
}
const lpvStacks = e => (e.bl ? e.bl.length : 0);
function lpvBleed(pv, e, n) {
  if (e.hp <= 0 || e.dying) return;
  const b = e.bl || (e.bl = []);
  for (let i = 0; i < n; i++) { if (b.length >= pv.cap) b.shift(); b.push(LPV.bleedT); }
}
function lpvTarget(pv, from, skip) {
  let best = null, bd = 1e9;
  for (const e of sivAlive(pv)) { if (e.dying || e === skip || e.spit) continue; const d = sivD(e, from); if (d < pv.range && d < bd) { bd = d; best = e; } }
  return best;
}
function lpvShoot(pv, t, o) {
  o = o || {};
  const x = o.x != null ? o.x : pv.me.x, y = o.y != null ? o.y : pv.me.y, a = Math.atan2(t.y - y, t.x - x) + (o.spr || (Math.random() - 0.5) * 0.06);
  const s = { x, y, a, v: LPV.speed, dist: 0, hits: 0, hit: new Set(), dmg: o.dmg || LPV.dmg, pierce: pv.F.has('needle') ? 5 : 1, trail: [], home: o.home, free: o.free, list: [] };
  pv.needles.push(s);
  if (o.x == null) { pv.me.a = a; pv.me.kick = 0.006; }
  return s;
}
function lpvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('pin')) { // Pin Cushion: eight needles, each homing on a different cell
    const ts = sivAlive(pv).filter(e => !e.dying && !e.spit && sivD(e, me) < pv.range).sort((a, b) => sivD(a, me) - sivD(b, me)).slice(0, 8);
    if (!ts.length) return false;
    for (let i = 0; i < 8; i++) lpvShoot(pv, ts[i % ts.length], { home: ts[i % ts.length], dmg: LPV.dmg * 0.5, spr: (i / 7 - 0.5) * 1.6 });
    return true;
  }
  const t = lpvTarget(pv, me); if (!t) return false;
  lpvShoot(pv, t); return true;
}
function lpvHit(pv, s, e) {
  const F = pv.F, f = e.hp / e.max;
  let k = s.dmg;
  if (F.has('heart')) k *= 0.7;
  if (F.has('needle')) k *= Math.pow(1.1, s.hits);
  if (F.has('final')) { if (f < 0.3) { k *= 2; sivRing(pv, e.x, e.y, e.r * 1.6, BLV_RED, 0.15); } else if (f > 0.5) k *= 0.75; }
  s.hit.add(e); s.hits++; s.list.push(e);
  if (F.has('tattoo')) { e.tc = (e.tc || 0) + 1; if (e.tc === 5) { e.tat = true; sivTxt(pv, e.x, e.y - e.r - 0.05, 'TATTOO', BLV_RED); } }
  const lowKill = (F.has('coup') && f < 0.25 && 'COUP DE GRACE') || (F.has('clause') && lpvStacks(e) && f < 0.15 && 'FINE PRINT');
  if (lowKill) { sivTxt(pv, e.x, e.y - e.r - 0.06, lowKill, BLV_RED, true); sivRing(pv, e.x, e.y, e.r * 2.4, BLV_RED, 0.4); k = e.hp + 1; }
  lpvBleed(pv, e, F.has('exsang') ? 3 : 1);
  sivDamage(pv, e, k, false);
  if (s.hits === 5 && F.has('knot')) { // Reef Knot: the five are pulled into a knot, a stack each
    const cx = s.list.reduce((a, o) => a + o.x, 0) / 5, cy = s.list.reduce((a, o) => a + o.y, 0) / 5;
    for (const o of s.list) { o.kx += (cx - o.x) * 4; o.ky += (cy - o.y) * 4; lpvBleed(pv, o, 1); }
    sivTxt(pv, cx, cy - 0.05, 'REEF KNOT', BLV_RED, true);
  }
  if (s.hits >= s.pierce) lpvEnd(pv, s);
}
function lpvEnd(pv, s) {
  if (s.dead) return;
  const F = pv.F;
  if (s.hits === 0 && F.has('sewing') && !s.sewn) { // Sewing Circle: once round you, then out again
    s.sewn = true; s.orbit = { a: Math.atan2(s.y - pv.me.y, s.x - pv.me.x), turned: 0 }; s.dist = 0;
    if (!pv.sewTold) { pv.sewTold = 1; sivTxt(pv, pv.me.x, pv.me.y - 0.07, 'SEWING CIRCLE', BLV_RED); }
    return;
  }
  s.dead = true;
  if (F.has('sutures') && s.hits >= 3) pv.threads.push({ a: s.list[0], b: s.list[s.list.length - 1], t: 2, seen: new Map() });
}
// A death: blood pools, healing, the free needle, Vaccination.
function lpvKill(pv, e) {
  const F = pv.F, me = pv.me, bled = lpvStacks(e) > 0;
  if (bled) pv.pools.push({ x: e.x, y: e.y, r: F.has('wound') ? 0.08 : 0.04, t: 3, max: 3, seen: new Map() });
  if (bled && F.has('exsang')) sivTxt(pv, me.x, me.y - 0.06, '+2', BLV_GREEN, true);
  if (e.tat) { sivTxt(pv, me.x, me.y - 0.08, '<3 +1%', BLV_GREEN, true); sivRing(pv, me.x, me.y, 0.05, BLV_GREEN, 0.4); }
  if (F.has('final')) sivTxt(pv, e.x + 0.03, e.y - e.r, 'ding', '#ff758f');
  if (F.has('next')) {
    let t = null; for (const o of sivAlive(pv)) if (o !== e && !o.dying && !o.spit && sivD(o, e) < LPV.near && (!t || o.hp < t.hp)) t = o;
    if (t) { lpvShoot(pv, t, { x: e.x, y: e.y, free: true }); sivTxt(pv, e.x, e.y - e.r - 0.04, 'NEXT', BLV_RED); }
  }
  if (F.has('vacc')) { pv.vacc = 3; sivTxt(pv, me.x, me.y - 0.07, 'ARMED', BLV_GREEN); }
  e.bl = null;
}
function lpvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.scene !== 'swarm') me.y = H * 0.56 + Math.sin(pv.t * 0.9) * 0.02;
  me.kick = Math.max(0, (me.kick || 0) - dt * 0.1);
  pv.vacc = Math.max(0, pv.vacc - dt); me.snot = Math.max(0, (me.snot || 0) - dt);
  blvGun(pv, dt, lpvFire);
  // Needles.
  for (const s of pv.needles) {
    if (s.dead) continue;
    if (s.orbit) { // circling you once
      const O = s.orbit, st = TAU / 0.6 * dt; O.a += st; O.turned += st;
      s.x = me.x + Math.cos(O.a) * 0.07; s.y = me.y + Math.sin(O.a) * 0.07; s.a = O.a + Math.PI / 2;
      if (O.turned >= TAU) { s.orbit = null; const t = lpvTarget(pv, s); if (t) { s.a = Math.atan2(t.y - s.y, t.x - s.x); sivTxt(pv, s.x, s.y - 0.04, 'AGAIN', BLV_RED); } }
    } else {
      if (s.home && s.home.hp > 0) { const a = Math.atan2(s.home.y - s.y, s.home.x - s.x), d = Math.atan2(Math.sin(a - s.a), Math.cos(a - s.a)); s.a += Math.max(-6 * dt, Math.min(6 * dt, d)); }
      const step = s.v * dt; s.x += Math.cos(s.a) * step; s.y += Math.sin(s.a) * step; s.dist += step;
      if (s.dist > LPV.range || s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > H + 0.05) { lpvEnd(pv, s); continue; }
      for (const e of sivAlive(pv)) { if (s.hit.has(e) || e.dying || (s.home && s.home !== e && s.home.hp > 0)) continue; if (sivD(e, s) < e.r + 0.006) { lpvHit(pv, s, e); if (s.dead) break; } }
    }
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > (F.has('needle') ? 16 : 6)) s.trail.shift();
  }
  pv.needles = pv.needles.filter(s => !s.dead);
  // Bleed: stacks tick down; damage shows every half second; red drips.
  for (const e of sivAlive(pv)) {
    if (!e.bl || !e.bl.length || e.dying) continue;
    e.bl = e.bl.map(t => t - dt).filter(t => t > 0);
    e.bacc = (e.bacc || 0) + e.bl.length * LPV.bleedDps * dt * (F.has('exsang') ? 1.3 : 1);
    if (Math.random() < dt * 6) pv.parts.push({ x: e.x + (Math.random() - 0.5) * e.r, y: e.y + e.r * 0.6, vx: 0, vy: 0.08, life: 0.4, color: BLV_RED });
    e.btk = (e.btk || 0) + dt;
    if (e.btk > 0.5 && e.bacc >= 1) { e.btk = 0; const d = Math.floor(e.bacc); e.bacc -= d; sivDamage(pv, e, d, false, BLV_RED); }
    // Leaky: at the cap, a stack splashes onto the nearest cell each second.
    if (F.has('leaky') && e.bl && e.bl.length >= pv.cap) {
      e.leakT = (e.leakT || 0) + dt;
      if (e.leakT > 1) { e.leakT = 0; let o = null; for (const q of sivAlive(pv)) if (q !== e && !q.dying && (!o || sivD(q, e) < sivD(o, e))) o = q;
        if (o && sivD(o, e) < 0.25) { lpvBleed(pv, o, 1); pv.fx.push({ type: 'line', a: { x: e.x, y: e.y }, b: { x: o.x, y: o.y }, color: BLV_RED, life: 0.35, max: 0.35 }); sivTxt(pv, o.x, o.y - o.r, 'LEAK', BLV_RED); } }
    }
  }
  // Pools (Open Wound: bigger, and they open new wounds) and Sutures threads.
  for (const P of pv.pools) {
    P.t -= dt;
    if (F.has('wound')) for (const e of sivAlive(pv)) if (!e.dying && sivD(e, P) < P.r + e.r * 0.5 && pv.t - (P.seen.get(e) || -9) > 0.7) { P.seen.set(e, pv.t); lpvBleed(pv, e, 1); sivTxt(pv, e.x, e.y - e.r, '+BLEED', BLV_RED); }
  }
  pv.pools = pv.pools.filter(P => P.t > 0);
  for (const T of pv.threads) {
    T.t -= dt;
    if (T.a.hp <= 0 && T.b.hp <= 0) T.t = 0;
    for (const e of sivAlive(pv)) if (!e.dying && e !== T.a && e !== T.b && blvSeg(e, T.a, T.b) < e.r && pv.t - (T.seen.get(e) || -9) > 0.6) { T.seen.set(e, pv.t); lpvBleed(pv, e, 1); sivTxt(pv, e.x, e.y - e.r, 'SNAG', BLV_RED); }
  }
  pv.threads = pv.threads.filter(T => T.t > 0);
  blvSpit(pv, dt, pv => { if (pv.vacc > 0) { pv.vacc = 0; sivTxt(pv, me.x, me.y - 0.07, 'IMMUNE', BLV_GREEN, true); sivRing(pv, me.x, me.y, 0.06, BLV_GREEN, 0.5); } else { me.snot = 2; sivTxt(pv, me.x, me.y - 0.07, 'SNOTTY', BLV_GREEN, true); } });
  sivStepFoes(pv, dt);
  blvTail(pv, dt, lpvWave);
}
function lpvUnder(pv, g, X, Y, U) {
  for (const P of pv.pools) { g.globalAlpha = Math.min(1, P.t) * 0.45; g.fillStyle = '#8a0f2a'; g.beginPath(); g.ellipse(X(P.x), Y(P.y), U * P.r, U * P.r * 0.7, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  for (const T of pv.threads) { g.globalAlpha = Math.min(1, T.t) * 0.9; g.strokeStyle = BLV_RED; g.lineWidth = 1.5; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(X(T.a.x), Y(T.a.y)); g.lineTo(X(T.b.x), Y(T.b.y)); g.stroke(); g.setLineDash([]); }
  g.globalAlpha = 1;
  blvDrawSpit(pv, g, X, Y, U);
}
function lpvCell(pv, g, e, x, y, r, U) {
  blvSpitCell(g, e, x, y, r);
  const n = lpvStacks(e); // Bleed stacks: red pips over the cell
  for (let i = 0; i < n; i++) { g.fillStyle = BLV_RED; g.beginPath(); g.arc(x - (n - 1) * 3 + i * 6, y + r + 6, 2.2, 0, TAU); g.fill(); }
  if (e.tat) { g.fillStyle = '#ff758f'; g.font = `900 ${Math.round(U * 0.026)}px sans-serif`; g.textAlign = 'center'; g.fillText('<3', x, y + 4); }
}
function lpvMe(pv, g, hx, hy, hr) {
  if (pv.vacc > 0) { g.strokeStyle = BLV_GREEN; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, hr * 2, 0, TAU); g.stroke(); }
  if (pv.me.snot > 0) { g.globalAlpha = 0.5; g.fillStyle = BLV_GREEN; g.beginPath(); g.ellipse(hx, hy, hr * 1.4, hr * 1.1, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
}
function lpvOver(pv, g, X, Y, U, c) {
  for (const s of pv.needles) { // a thin needle with a red thread behind it
    const x = X(s.x), y = Y(s.y), L = U * 0.022;
    if (s.trail.length > 1) { g.strokeStyle = c; g.globalAlpha = 0.5; g.lineWidth = pv.F.has('needle') ? 1.5 : 1; g.beginPath(); g.moveTo(X(s.trail[0].x), Y(s.trail[0].y)); for (const q of s.trail) g.lineTo(X(q.x), Y(q.y)); g.stroke(); g.globalAlpha = 1; }
    g.strokeStyle = s.free ? '#ff758f' : c; g.lineWidth = 2; g.beginPath(); g.moveTo(x - Math.cos(s.a) * L, y - Math.sin(s.a) * L); g.lineTo(x, y); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 1.5, 0, TAU); g.fill();
  }
}
PV_OWN[LPV.id] = { init: lpvInit, step: lpvStep, draw: sivDraw, flags: LPV_FLAG, under: lpvUnder, over: lpvOver, cell: lpvCell, me: lpvMe, kill: lpvKill };
