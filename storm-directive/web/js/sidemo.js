'use strict';
// Spawn Prawn - Standard Issue's own preview and branch screen (one weapon, the model for the other 23).
//  - The preview (preview.js PV_OWN): the real weapon at true proportions. One heavy Force shot at the nearest enemy
//    in range (440, the dashed arc), 0.45 s apart, 8 to a magazine, a 1.2 s reload, and the shot stops on the first
//    thing it hits. Cells swim in from the right; numbers are the real damage.
//  - Each branch card plays its own scene: the promise (A Ricochet Brain, B Through and Through, C Marked for
//    Bonking), its Lv 6 cards and wildcard on top of it, and the masteries on top of both (flags from wup1.js names).
//  - Branch screen: Standard Issue's tier choices open in the Weapon Draft layout (tabs over a live stage and an info
//    panel) instead of cards; the tab's stage plays that branch.
// Hooks: preview.js makePreview/stepPreview/drawPreview -> PV_OWN; ui.js openLoot -> sivDraftKind, openDraft -> sivDraftHead.

const SIV = { id: 'v_phys_proj', range: 0.75, speed: 0.95, cd: 0.45, mag: 8, reload: 1.2, dmg: 16, hop: 0.19, spread: 0.04 }; // (world 440 = 0.75 of the stage's width)
const SIV_FLAG = { 'Ricochet Brain': 'A', 'Through and Through': 'B', 'Marked for Bonking': 'C', "Newton's Cradle": 'cradle', 'Last Orders': 'lastOrders', Squirrel: 'squirrel',
  'Gathering Momentum': 'momentum', Contraflow: 'contraflow', Conkers: 'conkers', 'Soft Spot': 'soft', Concussion: 'concuss', 'Nut Allergy': 'allergy',
  'Shell Shock': 'shell', 'Infinite Nuts': 'inf', 'Squirrel Away': 'sqa' };
const SIV_PALE = '#f1ecff', SIV_BONK = '#ffd23f', SIV_NUT = '#c9a46a';

// ---------------------------------------------------------------- the branch screen
// Standard Issue's tier screen goes to the Weapon Draft. A 'wup' box with only Standard Issue ready becomes its
// fork straight away (as wupCards would), so both routes land here.
function sivDraftKind(req) {
  if (!G || typeof wupReady !== 'function') return false;
  if (req.kind === 'wup') { const r = wupReady(); if (r.length === 1 && w24Key(r[0]) === SIV.id) Object.assign(req, { kind: 'wupfork', w: r[0], lv: wupNextLv(r[0]) }); }
  return req.kind === 'wupfork' && !!req.w && w24Key(req.w) === SIV.id;
}
function sivDraftHead(req, weap) {
  if (!sivDraftKind(req)) return false;
  const t = WUP_TIER.indexOf(req.lv) + 1, U = weap.up || {}, S = WUP[SIV.id];
  for (const o of UI.lootOpts) { // each tab's stage plays what you would have after taking it
    const f = [U.p, U.l6 && SIV_FLAG[U.l6], SIV_FLAG[o.title]].filter(Boolean);
    o.perk = 'siv|' + [...new Set(f)].join(',');
    if (o.tag === 'BRANCH') o.tag = 'BRANCH CARD';
  }
  $('dKick').textContent = `${weap.def.name.toUpperCase()} | TIER ${t - 1} > ${t}`;
  $('dTitle').textContent = ['', '', 'PROMISE', 'BRANCH', 'MASTERY'][t] || 'UPGRADE';
  $('dSub').textContent = t === 2 ? 'Three ways for it to grow. Take one: the other two are gone for the run.'
    : t === 3 ? `How ${S && S[U.p] ? S[U.p].name : 'its promise'} grows. Take one: the others are gone for the run.`
    : 'Its mastery. Only one weapon a run gets one.';
  return true;
}

// ---------------------------------------------------------------- the preview
function sivInit(pv) {
  const p = pv.opts.perk || '', F = pv.F = new Set(p.startsWith('siv|') ? p.slice(4).split(',').filter(Boolean) : []);
  pv.scene = F.has('squirrel') ? 'swarm' : F.has('shell') ? 'shell' : F.has('inf') ? 'mixed' : F.has('C') ? 'elite' : F.has('B') ? 'line' : F.has('A') ? 'pack' : 'open';
  pv.fh = pv.fh || 0.625; // the stage's height in widths (drawn size sets it)
  pv.me = { x: pv.scene === 'swarm' ? 0.45 : 0.2, y: pv.fh * 0.56, a: 0 };
  Object.assign(pv, { foes: [], shots: [], fx: [], parts: [], nuts: [], lanes: [], pips: [], ammo: SIV.mag, rel: 0, cd: 0.5, n: 0, lock: null, waveT: 0, burst: null, otherCd: 0.3 });
}
const sivHas = (pv, k) => pv.F.has(k);
const sivAlive = pv => pv.foes.filter(e => e.hp > 0);
const sivD = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function sivFoe(pv, x, y, o) {
  const e = Object.assign({ x, y, r: 0.026, hp: 40, max: 40, sp: 0.05 + Math.random() * 0.03, flash: 0, shell: 0, hc: 0, mark: false, stun: 0, swell: 0, kx: 0, ky: 0, wob: Math.random() * 6 }, o);
  e.max = e.hp; pv.foes.push(e); return e;
}
// A fresh group for the scene.
function sivWave(pv) {
  const H = pv.fh, cy = H * 0.56, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  switch (pv.scene) {
    case 'pack': { const x = 0.68, y = H * (0.3 + R() * 0.4); for (let i = 0; i < 5; i++) sivFoe(pv, x + (i % 3) * 0.06, y + (i - 2) * 0.05 + (R() - 0.5) * 0.02, { sp: 0.05, shell: sivHas(pv, 'lastOrders') ? 1 : 0 }); break; }
    case 'line': for (let i = 0; i < 6; i++) sivFoe(pv, 0.42 + i * 0.075, cy + (R() - 0.5) * 0.015, { sp: 0.04, hp: 50 }); break;
    case 'elite':
      sivFoe(pv, 0.6, cy, { r: 0.05, hp: 260, sp: 0.018, shell: 3, elite: true });
      if (sivHas(pv, 'allergy')) for (let i = 0; i < 4; i++) sivFoe(pv, 0.78 + (i % 2) * 0.05, cy + (i < 2 ? -0.17 : 0.17) + (i % 2 ? 0.04 : -0.02), { hp: 30, sp: 0.045 });
      else for (let i = 0; i < 2; i++) sivFoe(pv, 0.8 + i * 0.1, H * (0.25 + i * 0.5), { hp: 30, sp: 0.04 });
      break;
    case 'shell': for (let i = 0; i < 4; i++) sivFoe(pv, 0.55 + R() * 0.2, H * (0.18 + i * 0.21), { r: 0.034, hp: 70, shell: 2, sp: 0.035 }); break;
    case 'mixed':
      for (let i = 0; i < 5; i++) sivFoe(pv, 0.45 + i * 0.07, cy + (R() - 0.5) * 0.02, { hp: 50, sp: 0.03 });
      for (let i = 0; i < 4; i++) sivFoe(pv, 0.6 + (i % 2) * 0.06, cy + (i < 2 ? -1 : 1) * (0.12 + (i % 2) * 0.03), { hp: 50, sp: 0.03 });
      break;
    case 'swarm': for (let i = 0; i < 5; i++) { const e = sivFoe(pv, 0, 0, { orb: i / 5 * TAU, sp: 0.85 }); e.x = pv.me.x + Math.cos(e.orb) * 0.24; e.y = pv.me.y + Math.sin(e.orb) * 0.2; } break;
    default: for (let i = 0; i < 5; i++) sivFoe(pv, 0.95 + R() * 0.25, H * (0.15 + R() * 0.7));
  }
}
function sivTxt(pv, x, y, txt, color, big) { // (words stack upwards instead of on top of each other)
  if (pv.fx.length >= 60) return;
  y -= 0.04;
  for (let i = 0; i < 4 && pv.fx.some(f => f.type === 'text' && f.life > 0.35 && Math.abs(f.x - x) < 0.06 && Math.abs(f.y - y) < 0.03); i++) y -= 0.032;
  pv.fx.push({ type: 'text', x, y, txt, color: color || '#fff', big, life: 0.7 });
}
function sivRing(pv, x, y, r, color, life) { pv.fx.push({ type: 'ring', x, y, r, color, life: life || 0.3, max: life || 0.3 }); }
function sivBits(pv, x, y, n, color, v) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = (v || 0.25) * (0.5 + Math.random()); pv.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, color }); } }

// Damage to a cell. heavy: one Shell layer off (or a thump when it has none).
function sivDamage(pv, e, k, heavy, color, noPop) {
  if (e.hp <= 0 || e.dying) return;
  k = Math.round(k);
  e.hp -= k; e.flash = 0.1;
  sivTxt(pv, e.x + (Math.random() - 0.5) * 0.02, e.y - e.r, String(k), color || (heavy ? SIV_BONK : '#fff'), heavy);
  if (heavy) {
    if (e.shell > 0) { e.shell--; sivBits(pv, e.x, e.y, 7, DEF_PAL.shell, 0.35); sivTxt(pv, e.x, e.y - e.r - 0.05, 'CRACK', DEF_PAL.shell); }
    else if (!e.mark) sivTxt(pv, e.x, e.y - e.r - 0.05, 'HEAVY', '#ffffff');
    sivRing(pv, e.x, e.y, e.r * 2.2, '#ffffff', 0.25);
  }
  if (e.hp <= 0) {
    sivBits(pv, e.x, e.y, 9, '#ffffff');
    if (pv.lock === e) pv.lock = null;
    if (sivHas(pv, 'allergy') && !noPop) { e.hp = 0.001; e.dying = true; e.swell = 0.35; } // swells, then bursts (sivStepFoes)
  }
}
// The weapon's shot. o: { x, y, dmg, color, nut } for shots that do not come from Spermy's gun.
function sivShoot(pv, t, o) {
  o = o || {};
  const F = pv.F, x = o.x != null ? o.x : pv.me.x, y = o.y != null ? o.y : pv.me.y;
  const a = Math.atan2(t.y - y, t.x - x) + (Math.random() - 0.5) * SIV.spread * 2;
  const inf = F.has('inf');
  const s = { x, y, a, v: SIV.speed, dist: 0, hits: 0, hit: new Set(), dmg: o.dmg || SIV.dmg, size: 1, trail: [], color: o.color,
    bounce: inf ? 99 : F.has('A') ? 2 + (F.has('lastOrders') ? 1 : 0) : 0,
    pierce: inf ? 12 : F.has('B') ? 4 + (F.has('contraflow') ? 2 : 0) + (F.has('momentum') ? 1 : 0) : 1,
    heavy: F.has('shell'), conker: F.has('conkers') };
  pv.shots.push(s);
  if (o.x == null) { pv.me.a = a; pv.fx.push({ type: 'muzzle', x: x + Math.cos(a) * 0.035, y: y + Math.sin(a) * 0.035, a, life: 0.08, max: 0.08 }); pv.me.kick = 0.012; }
  return s;
}
function sivFireRate(pv) { return SIV.cd / (sivHas(pv, 'B') ? 0.8 : 1) / (sivHas(pv, 'shell') ? 1.5 : 1); }
// What the gun aims at: the nearest cell in range (Marked for Bonking stays on its target).
function sivTarget(pv) {
  const live = sivAlive(pv).filter(e => !e.dying && sivD(e, pv.me) < SIV.range + e.r);
  if (sivHas(pv, 'C') && pv.lock && live.includes(pv.lock)) return pv.lock;
  let best = null, bd = 1e9;
  for (const e of live) { const d = sivD(e, pv.me); if (d < bd) { bd = d; best = e; } }
  if (sivHas(pv, 'C')) pv.lock = best;
  return best;
}

// A shot meets a cell.
function sivHit(pv, s, e) {
  const F = pv.F;
  let k = s.dmg, heavy = s.heavy || s.heavyNext;
  if (F.has('A') && s.hits === 0 && !F.has('inf')) k *= 0.85; // Ricochet Brain: the first hit is weaker
  if (F.has('B') && !F.has('inf')) k *= Math.pow(1.15, s.hits); // Through and Through: each one after the first takes more
  if (F.has('C') && !s.nut) {
    if (e.mark) {
      k *= 2.5; heavy = true; e.mark = false; e.hc = 0;
      sivTxt(pv, e.x, e.y - e.r - 0.06, 'BONK', SIV_BONK, true); sivRing(pv, e.x, e.y, e.r * 3, SIV_BONK, 0.4);
      if (F.has('concuss')) { e.stun = 1; sivTxt(pv, e.x + 0.05, e.y - e.r - 0.02, 'STAGGERED', '#ffffff'); }
    } else {
      e.hc++;
      if (e.hc >= (F.has('concuss') && e.elite ? 3 : 4)) { e.mark = true; sivTxt(pv, e.x, e.y - e.r - 0.06, 'MARKED', SIV_BONK); }
    }
  }
  s.hit.add(e); s.hits++;
  sivDamage(pv, e, k, heavy);
  if (e.hp > 0 && !e.elite) { const kb = heavy ? 0.25 : 0.08; e.kx += Math.cos(s.a) * kb; e.ky += Math.sin(s.a) * kb; } // (Force shoves a little)
  s.heavyNext = false;
  if (s.hits >= 12 && F.has('inf')) return sivEnd(pv, s);
  // Through and Through (and Infinite Nuts): carry on through.
  if (F.has('B') || F.has('inf')) {
    s.size *= F.has('momentum') && s.hits === 4 ? 2 : 1.12;
    if (F.has('momentum')) { s.v *= 1.15; if (s.hits === 4) sivTxt(pv, s.x, s.y - 0.04, 'MOMENTUM', SIV_PALE); }
    if (s.conker && s.hits === 1) { s.swing = { e, a: Math.atan2(s.y - e.y, s.x - e.x), turned: 0, hit: new Set([e]) }; sivTxt(pv, e.x, e.y + e.r + 0.07, 'CONKER', SIV_NUT); }
    if (s.hits < s.pierce) { if (!F.has('A') && !F.has('inf')) return; }
    else if (!F.has('inf')) return sivEnd(pv, s);
  }
  // Ricochet Brain: bounce to the nearest cell within 110.
  if (s.bounce > 0) {
    let o = null, bd = SIV.hop;
    for (const q of sivAlive(pv)) { if (q === e || s.hit.has(q) || q.dying) continue; const d = sivD(q, s); if (d < bd) { bd = d; o = q; } }
    if (o) {
      if (!F.has('B') && !F.has('inf')) s.hit.clear(), s.hit.add(e);
      s.bounce--; if (!F.has('inf')) s.dmg *= 0.8;
      if (F.has('lastOrders') && s.bounce === 0) s.heavyNext = true;
      s.a = Math.atan2(o.y - s.y, o.x - s.x); s.zig = s.zig || [{ x: s.x, y: s.y }];
      pv.fx.push({ type: 'line', a: { x: e.x, y: e.y }, b: { x: o.x, y: o.y }, color: SIV_PALE, life: 0.45, max: 0.45 });
      if (F.has('cradle') && e.hp > 0) { e.slam = { o, t: 0.35 }; }
      return;
    }
  }
  if (!F.has('B') && !F.has('inf')) sivEnd(pv, s);
}
// A shot's flight ends.
function sivEnd(pv, s) {
  if (s.dead) return;
  s.dead = true;
  if (s.hits === 0 && sivHas(pv, 'squirrel') && pv.nuts.length < 6) { // Squirrel: a miss lands as a nut
    pv.nuts.push({ x: Math.max(0.03, Math.min(0.97, s.x)), y: Math.max(0.03, Math.min(pv.fh - 0.03, s.y)), life: 7, sp: Math.random() * TAU });
  }
  if (s.hits >= 5 && sivHas(pv, 'contraflow') && s.first) pv.lanes.push({ a: s.first, b: { x: s.x, y: s.y }, life: 0.5, shoved: new Set() });
}

function sivStep(pv, dt) {
  dt = Math.min(dt, 1 / 30);
  pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  // Spermy: still, a bob; with Squirrel it swims for the nuts.
  if (F.has('squirrel')) {
    const nut = pv.nuts.reduce((b, n) => (!b || sivD(n, me) < sivD(b, me) ? n : b), null);
    const goal = nut || { x: 0.45, y: H * 0.56 }, d = sivD(goal, me) || 1, v = Math.min(d, 0.32 * dt);
    me.x += (goal.x - me.x) / d * v; me.y += (goal.y - me.y) / d * v;
    if (nut && d < 0.035) { pv.nuts.splice(pv.nuts.indexOf(nut), 1); const t = sivAlive(pv).filter(e => !e.dying).sort((a, b) => sivD(a, me) - sivD(b, me))[0]; sivTxt(pv, me.x, me.y - 0.05, 'NUT', SIV_NUT); if (t) sivShoot(pv, t, { x: me.x, y: me.y, color: SIV_NUT }).nut = true; }
  } else me.y = H * 0.56 + Math.sin(pv.t * 0.9) * 0.02;
  me.kick = Math.max(0, (me.kick || 0) - dt * 0.1);
  // The gun: fire rate, magazine, reload.
  pv.cd -= dt;
  if (pv.rel > 0) { pv.rel -= dt; if (pv.rel <= 0) pv.ammo = SIV.mag; }
  if (pv.cd <= 0 && pv.rel <= 0) {
    const t = sivTarget(pv);
    if (t) {
      sivShoot(pv, t); pv.n++; pv.cd = sivFireRate(pv);
      if (--pv.ammo <= 0) { pv.rel = SIV.reload; sivTxt(pv, me.x, me.y - 0.06, 'RELOAD', '#8a959a'); }
      if (F.has('sqa')) { pv.hist = (pv.hist || 0) + 1; if (pv.hist >= 10) { pv.hist = 0; pv.burst = { left: 10, t: 0, tgt: t }; sivTxt(pv, me.x + 0.08, me.y - 0.07, 'SQUIRREL AWAY', SIV_NUT, true); } }
    }
  }
  // Squirrel Away: the last ten again in 0.3 s at the same target, x1.5.
  if (pv.burst) {
    const B = pv.burst; B.t -= dt;
    if (B.tgt.hp <= 0 || B.tgt.dying) B.tgt = sivTarget(pv) || B.tgt;
    while (B.t <= 0 && B.left > 0 && B.tgt.hp > 0) { B.left--; B.t += 0.03; const s = sivShoot(pv, B.tgt, { x: me.x, y: me.y, dmg: SIV.dmg * 1.5, color: SIV_NUT }); s.a += (Math.random() - 0.5) * 0.2; }
    if (B.left <= 0 || B.tgt.hp <= 0) pv.burst = null;
  }
  // Soft Spot: your other weapon (the grey pips) hits a marked cell 20% harder.
  if (F.has('soft')) {
    pv.otherCd -= dt;
    const t = pv.lock && pv.lock.hp > 0 ? pv.lock : sivAlive(pv)[0];
    if (pv.otherCd <= 0 && t && sivD(t, me) < SIV.range) { pv.otherCd = 0.5; const a = Math.atan2(t.y - me.y, t.x - me.x) + 0.5; pv.pips.push({ x: me.x, y: me.y, t, a, life: 1.5 }); }
    for (const p of pv.pips) {
      if (p.t.hp <= 0) { p.life = 0; continue; }
      const a = Math.atan2(p.t.y - p.y, p.t.x - p.x); p.a += Math.atan2(Math.sin(a - p.a), Math.cos(a - p.a)) * Math.min(1, dt * 6);
      p.x += Math.cos(p.a) * 0.7 * dt; p.y += Math.sin(p.a) * 0.7 * dt; p.life -= dt;
      if (sivD(p, p.t) < p.t.r) { p.life = 0; const m = p.t.mark; sivDamage(pv, p.t, m ? 7.2 : 6, false, m ? SIV_BONK : '#8a959a'); if (m) sivTxt(pv, p.t.x + 0.05, p.t.y - p.t.r - 0.06, '+20%', SIV_BONK); }
    }
    pv.pips = pv.pips.filter(p => p.life > 0);
  }
  sivStepShots(pv, dt);
  sivStepFoes(pv, dt);
  // Contraflow lanes shove what crosses them.
  for (const L of pv.lanes) {
    L.life -= dt;
    const dx = L.b.x - L.a.x, dy = L.b.y - L.a.y, l2 = dx * dx + dy * dy || 1;
    for (const e of sivAlive(pv)) {
      const k = Math.max(0, Math.min(1, ((e.x - L.a.x) * dx + (e.y - L.a.y) * dy) / l2)), px = L.a.x + dx * k, py = L.a.y + dy * k, d = Math.hypot(e.x - px, e.y - py);
      if (d < e.r + 0.02 && !L.shoved.has(e)) { // out sideways and back along the lane
        L.shoved.add(e); const n = Math.sqrt(l2), nx = -dy / n, ny = dx / n, side = (e.x - px) * nx + (e.y - py) * ny < 0 ? -1 : 1;
        e.kx += nx * side * 0.6 + dx / n * 0.3; e.ky += ny * side * 0.6 + dy / n * 0.3; sivTxt(pv, e.x, e.y - e.r, 'SHOVE', SIV_PALE);
      }
    }
  }
  pv.lanes = pv.lanes.filter(L => L.life > 0);
  for (const n of pv.nuts) n.life -= dt;
  pv.nuts = pv.nuts.filter(n => n.life > 0);
  for (const q of pv.parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; }
  pv.parts = pv.parts.filter(q => q.life > 0);
  for (const f of pv.fx) f.life -= dt;
  pv.fx = pv.fx.filter(f => f.life > 0);
  // Next group once this one is mostly gone.
  const left = sivAlive(pv).length, want = pv.scene === 'elite' ? 1 : pv.scene === 'line' || pv.scene === 'mixed' ? 1 : 2;
  if (left < want) { pv.waveT += dt; if (pv.waveT > 0.8) { pv.waveT = 0; sivWave(pv); } }
  if (!pv.foes.length) sivWave(pv);
}
function sivStepShots(pv, dt) {
  const H = pv.fh;
  for (const s of pv.shots) {
    if (s.dead) continue;
    if (s.swing) { // Conkers: once round the cell it hit, on a string, then on its way
      const W = s.swing, st = TAU / 0.45 * dt, R = W.e.r + 0.05;
      W.a += st; W.turned += st;
      s.x = W.e.x + Math.cos(W.a) * R; s.y = W.e.y + Math.sin(W.a) * R;
      for (const e of sivAlive(pv)) if (!W.hit.has(e) && !e.dying && Math.hypot(e.x - s.x, e.y - s.y) < e.r + 0.012) { W.hit.add(e); sivDamage(pv, e, s.dmg, false, SIV_NUT); sivBits(pv, e.x, e.y, 3, SIV_NUT); }
      if (W.turned >= TAU || W.e.hp <= 0) { s.swing = null; s.conker = false; }
      s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 10) s.trail.shift();
      continue;
    }
    const step = s.v * dt;
    s.x += Math.cos(s.a) * step; s.y += Math.sin(s.a) * step; s.dist += step;
    s.trail.push({ x: s.x, y: s.y }); if (s.trail.length > 10) s.trail.shift();
    if (s.dist > SIV.range * (sivHas(pv, 'inf') ? 3 : 1) || s.x < -0.05 || s.x > 1.05 || s.y < -0.05 || s.y > H + 0.05) { sivEnd(pv, s); continue; }
    for (const e of sivAlive(pv)) {
      if (s.hit.has(e) || e.dying) continue;
      if (Math.hypot(e.x - s.x, e.y - s.y) < e.r + 0.006 * s.size) { if (!s.first) s.first = { x: s.x, y: s.y }; sivHit(pv, s, e); if (s.dead || s.swing) break; }
    }
  }
  pv.shots = pv.shots.filter(s => !s.dead);
}
function sivStepFoes(pv, dt) {
  const me = pv.me, H = pv.fh;
  for (const e of pv.foes) {
    e.flash = Math.max(0, e.flash - dt); e.wob += dt * 3;
    if (e.dying) { // Nut Allergy: swell, then burst and shove the neighbours
      e.swell -= dt;
      if (e.swell <= 0 && !e.popped) {
        e.popped = true; e.hp = 0; sivRing(pv, e.x, e.y, 0.13, SIV_BONK, 0.35); sivTxt(pv, e.x, e.y - 0.05, 'POP', SIV_BONK, true); sivBits(pv, e.x, e.y, 12, SIV_BONK, 0.4);
        for (const o of sivAlive(pv)) { const d = sivD(o, e); if (o !== e && d < 0.14) { const k = (0.14 - d) / 0.14 * 0.9 + 0.3; o.kx += (o.x - e.x) / (d || 1) * k; o.ky += (o.y - e.y) / (d || 1) * k; sivDamage(pv, o, 8, false, SIV_BONK, true); } }
      }
      continue;
    }
    if (e.hp <= 0) continue;
    // Shoves and knockback.
    e.x += e.kx * dt; e.y += e.ky * dt; const fr = Math.exp(-dt * 5); e.kx *= fr; e.ky *= fr;
    // Newton's Cradle: slammed into the next cell.
    if (e.slam) {
      const o = e.slam.o; e.slam.t -= dt;
      if (o.hp <= 0 || e.slam.t <= 0) e.slam = null;
      else { const d = sivD(e, o) || 1; e.x += (o.x - e.x) / d * 1.1 * dt; e.y += (o.y - e.y) / d * 1.1 * dt;
        if (d < e.r + o.r) { e.slam = null; sivTxt(pv, (e.x + o.x) / 2, (e.y + o.y) / 2 - 0.03, 'CLONK', SIV_PALE, true); sivRing(pv, (e.x + o.x) / 2, (e.y + o.y) / 2, 0.05, SIV_PALE, 0.25); sivDamage(pv, e, 10, false, SIV_PALE); sivDamage(pv, o, 10, false, SIV_PALE); o.kx += (o.x - e.x) / d * 0.5; o.ky += (o.y - e.y) / d * 0.5; }
        continue; }
    }
    if (e.stun > 0) { e.stun -= dt; continue; }
    if (pv.scene === 'swarm') { // they circle you
      e.orb += dt * e.sp; const tx = me.x + Math.cos(e.orb) * 0.24, ty = me.y + Math.sin(e.orb) * 0.2;
      e.x += (tx - e.x) * Math.min(1, dt * 3); e.y += (ty - e.y) * Math.min(1, dt * 3);
    } else {
      const d = sivD(e, me) || 1, wy = Math.sin(e.wob) * 0.01;
      e.x += (me.x - e.x) / d * e.sp * dt; e.y += ((me.y - e.y) / d * e.sp + wy) * dt;
      if (d < e.r + 0.03) { e.x = 1.05; e.y = H * (0.2 + Math.random() * 0.6); e.kx = e.ky = 0; } // reached you: off it goes, back to the edge
    }
    e.y = Math.max(e.r, Math.min(H - e.r, e.y));
  }
  pv.foes = pv.foes.filter(e => e.hp > 0 || (e.dying && !e.popped));
}

// ---------------------------------------------------------------- drawing
function sivDraw(pv, g, W2, H2) {
  const K = W2, F = pv.F, c = pv.col;
  pv.fh = H2 / K;
  const X = x => x * K, Y = y => y * K, U = K, me = pv.me;
  // Reach: the dashed arc 440 out.
  g.save(); g.setLineDash([3, 6]); g.strokeStyle = c + '30'; g.lineWidth = 1; g.beginPath(); g.arc(X(me.x), Y(me.y), U * SIV.range, -1.2, 1.2); g.stroke(); g.restore();
  // Contraflow lanes.
  for (const L of pv.lanes) { g.globalAlpha = L.life / 0.5 * 0.5; g.strokeStyle = SIV_PALE; g.lineWidth = U * 0.03; g.lineCap = 'round'; g.beginPath(); g.moveTo(X(L.a.x), Y(L.a.y)); g.lineTo(X(L.b.x), Y(L.b.y)); g.stroke(); g.lineCap = 'butt'; }
  g.globalAlpha = 1;
  // Nuts on the floor.
  for (const n of pv.nuts) { const x = X(n.x), y = Y(n.y), r = U * 0.011; g.globalAlpha = Math.min(1, n.life); g.fillStyle = SIV_NUT; g.beginPath(); g.ellipse(x, y + r * 0.3, r, r * 1.2, n.sp, 0, TAU); g.fill(); g.fillStyle = '#7a5a33'; g.beginPath(); g.ellipse(x - Math.sin(n.sp) * r * 0.6, y - r * 0.7, r * 1.1, r * 0.55, n.sp, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  // Cells.
  for (const e of pv.foes) {
    if (e.hp <= 0 && !e.dying) continue;
    const x = X(e.x), y = Y(e.y), sw = e.dying ? 1 + (0.35 - e.swell) * 2.2 : 1, r = U * e.r * sw;
    g.fillStyle = e.flash > 0 ? '#ffffff' : e.dying ? '#a8706a' : e.elite ? '#4c5259' : '#5a6068';
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = e.mark ? SIV_BONK : '#c9d1d9'; g.lineWidth = e.mark ? 2.5 : 1.5; g.stroke();
    for (let i = 0; i < e.shell; i++) { g.strokeStyle = DEF_PAL.shell; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r + 3 + i * 3.5, 0, TAU); g.stroke(); }
    if (e.hp < e.max && !e.dying) { g.strokeStyle = '#e6e6e6'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r + 3 + e.shell * 3.5, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, e.hp / e.max)); g.stroke(); }
    if (F.has('C') && (e.hc > 0 || e.mark)) { // the dent icon fills in quarters
      const ix = x, iy = y - r - 10 - e.shell * 3.5, ir = 5, n = e.mark ? 4 : e.hc, of = F.has('concuss') && e.elite ? 3 : 4;
      g.fillStyle = '#00000088'; g.beginPath(); g.arc(ix, iy, ir + 1, 0, TAU); g.fill();
      g.fillStyle = e.mark ? SIV_BONK : '#e6e6e6'; g.beginPath(); g.moveTo(ix, iy); g.arc(ix, iy, ir, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, n / of)); g.closePath(); g.fill();
    }
    if (e.stun > 0) for (let i = 0; i < 3; i++) { const a = pv.t * 6 + i / 3 * TAU; g.fillStyle = SIV_BONK; g.font = `900 ${Math.round(U * 0.03)}px sans-serif`; g.textAlign = 'center'; g.fillText('*', x + Math.cos(a) * r * 1.1, y - r * 0.9 + Math.sin(a) * r * 0.35); }
  }
  // Spermy.
  const ha = me.a, kx = -Math.cos(ha) * (me.kick || 0) * U, ky = -Math.sin(ha) * (me.kick || 0) * U;
  const hx = X(me.x) + kx, hy = Y(me.y) + ky, hr = U * 0.03;
  g.strokeStyle = PAL.you; g.lineWidth = Math.max(1, U * 0.006); g.lineCap = 'round'; g.beginPath(); g.moveTo(hx - Math.cos(ha) * hr, hy - Math.sin(ha) * hr);
  for (let i = 1; i <= 10; i++) { const f = i / 10, w = Math.sin(pv.t * 18 - f * 7) * hr * 0.8 * f, L = hr + hr * 4 * f; g.lineTo(hx - Math.cos(ha) * L - Math.sin(ha) * w, hy - Math.sin(ha) * L + Math.cos(ha) * w); }
  g.stroke(); g.lineCap = 'butt';
  g.fillStyle = PAL.you; g.beginPath(); g.ellipse(hx, hy, hr * 1.2, hr * 0.85, ha, 0, TAU); g.fill();
  // The magazine under Spermy: 8 rounds, then a reload ring.
  const ay = hy + hr * 2.1;
  for (let i = 0; i < SIV.mag; i++) { g.fillStyle = i < pv.ammo && pv.rel <= 0 ? c : '#ffffff22'; g.fillRect(hx - hr * 1.6 + i * hr * 0.42, ay, hr * 0.28, hr * 0.5); }
  if (pv.rel > 0) { g.strokeStyle = c; g.lineWidth = 2; g.beginPath(); g.arc(hx, hy, hr * 1.7, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - pv.rel / SIV.reload)); g.stroke(); }
  if (F.has('sqa')) { g.font = `700 ${Math.round(U * 0.026)}px monospace`; g.textAlign = 'center'; g.fillStyle = SIV_NUT; g.fillText((pv.hist || 0) + '/10', hx, ay + hr * 1.5); }
  g.globalCompositeOperation = 'lighter';
  // Soft Spot's other weapon.
  for (const p of pv.pips) { g.fillStyle = '#8a959a'; g.beginPath(); g.arc(X(p.x), Y(p.y), U * 0.006, 0, TAU); g.fill(); }
  // Shots: a heavy white pellet; Through and Through grows it and thickens its trail.
  for (const s of pv.shots) {
    const col = s.color || c, x = X(s.x), y = Y(s.y), r = U * 0.007 * s.size;
    if (s.swing) { g.strokeStyle = SIV_NUT + '99'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(s.swing.e.x), Y(s.swing.e.y)); g.lineTo(x, y); g.stroke(); }
    if (s.trail.length > 1) { g.strokeStyle = col; g.lineWidth = Math.max(1, r * (sivHas(pv, 'B') ? 1.4 : 0.9)); g.lineCap = 'round'; g.globalAlpha = 0.45; g.beginPath(); g.moveTo(X(s.trail[0].x), Y(s.trail[0].y)); for (const q of s.trail) g.lineTo(X(q.x), Y(q.y)); g.stroke(); g.globalAlpha = 1; g.lineCap = 'butt'; }
    pvGlow(g, x, y, r * 3.2, col, s.heavy || s.heavyNext ? 0.9 : 0.6);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // Effects.
  for (const f of pv.fx) {
    const k = f.max ? f.life / f.max : Math.min(1, f.life * 3);
    if (f.type === 'muzzle') { g.globalAlpha = k; pvGlow(g, X(f.x), Y(f.y), U * 0.03, c, 0.9); }
    else if (f.type === 'line') { g.globalAlpha = k; g.strokeStyle = f.color; g.lineWidth = 2; g.beginPath(); const ax = X(f.a.x), ay2 = Y(f.a.y), bx = X(f.b.x), by = Y(f.b.y), nx = -(by - ay2) * 0.12, ny = (bx - ax) * 0.12; g.moveTo(ax, ay2); g.lineTo((ax * 2 + bx) / 3 + nx, (ay2 * 2 + by) / 3 + ny); g.lineTo((ax + bx * 2) / 3 - nx, (ay2 + by * 2) / 3 - ny); g.lineTo(bx, by); g.stroke(); }
    else if (f.type === 'ring') { g.globalAlpha = k; g.strokeStyle = f.color; g.lineWidth = 2.5; g.beginPath(); g.arc(X(f.x), Y(f.y), U * f.r * (1.15 - k * 0.5), 0, TAU); g.stroke(); }
  }
  g.globalAlpha = 1;
  for (const q of pv.parts) { g.globalAlpha = Math.min(1, q.life * 2); g.fillStyle = q.color || '#fff'; g.fillRect(X(q.x), Y(q.y), 2, 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  for (const f of pv.fx) {
    if (f.type !== 'text') continue;
    g.globalAlpha = Math.min(1, f.life * 3); g.font = `900 ${Math.round(U * (f.big ? 0.045 : 0.03))}px sans-serif`; g.textAlign = 'center';
    const ty = Y(f.y) - (0.7 - f.life) * U * 0.06;
    g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(f.txt, X(f.x), ty); g.fillStyle = f.color; g.fillText(f.txt, X(f.x), ty);
  }
  g.globalAlpha = 1;
}

PV_OWN[SIV.id] = { init: sivInit, step: sivStep, draw: sivDraw };
