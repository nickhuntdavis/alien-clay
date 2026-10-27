'use strict';
// Spawn Prawn - v10 modifiers (spec: ../redesign docs/MODIFIERS.md, COMBAT_MATRIX.md 12 and 13).
// A modifier changes how a v10 weapon's attack moves or repeats. It never changes the damage type, and the attack
// type still decides every defence rule (the hits go through damageEnemy like any other). A weapon slot carries its
// modifiers in w.m10 (array of ids; a few may be taken twice, see MODS10[id].max). The old silly.js modifiers use
// w.mods: this file never touches that field.
// API: modAdd(w, id), modHas(w, id), modCount(w, id), modsFor(w) (ids that fit w and are not capped: fork cards).
// Hooks: game.js fireWeapon -> modFire (before v10Fire), spawnProj -> modProj, updateProjectiles -> modStep (per shot)
// and modHit (after projHit); arsenal.js meleeHit -> modMeleeHit; v10.js v10Fire -> modBeam (beams) and modBurstEnd
// (burst blast); v10Tick -> modTick; v10Draw -> modDraw.
// Simplifications: pets (Summoned) cannot be hurt, so there is no 3 s respawn and enemies never target them; Piercing is
// 2 pierces a copy (no unlimited Railgun yet); Ricochet bounces off campaign-level walls and G.m10walls rects only.

const MOD_ALL = ['contact', 'proj', 'spread', 'burst', 'beam', 'pool'];
const MODS10 = {
  homing:      { name: 'Homing Instinct', desc: 'Shots turn towards their target. If it dies, they fly straight on. Evasion still applies.', atk: ['proj', 'spread'], max: 3, cap: { turn: [5, 7, 9] } },
  piercing:    { name: 'Body Piercing', desc: 'Shots carry on through enemies, losing a little damage for each one passed.', atk: ['proj', 'spread'], max: 3, cap: { pierce: 6, cost: 0.15 } },
  chaining:    { name: 'Chain Letter', desc: 'After a hit, the attack jumps to another enemy, up to three times, a little weaker each time.', atk: ['proj', 'contact'], max: 1, cap: { jumps: [3, 4, 5], range: [110, 125, 140], falloff: [0.7, 0.75, 0.8] } },
  ricochet:    { name: 'Ricochet', desc: 'Shots bounce off walls, twice at most, losing some damage each time.', atk: ['proj'], max: 3, cap: { bounces: [2, 3, 4], loss: [0.2, 0.15, 0.1] } },
  returning:   { name: 'Return to Sender', desc: 'Flies out, then comes back to you, hitting on the way out and on the way back.', atk: ['proj', 'spread'], max: 3, cap: { hits: [3, 4, 5], back: [1, 1.2, 1.4] } },
  orbiting:    { name: 'Hangers-On', desc: 'Three bodies circle you and attack from there. They cannot be hit. They are not pets.', atk: ['contact', 'proj'], max: 3, group: 'delivery', cap: { radius: 72, bodies: [3, 4, 5] } },
  delayed:     { name: 'Booby Trap', desc: 'The blast is placed and marked on the ground. It goes off later, or when something comes near.', atk: ['burst'], max: 3, group: 'delivery', cap: { life: 14, placed: [6, 8, 10], dmg: [1, 1.2, 1.4] } },
  lobbed:      { name: 'Lobbed', desc: 'Flies in an arc over everything in the way and lands on a marked spot.', atk: ['burst', 'pool'], max: 3, group: 'delivery', cap: { flight: [0.6, 0.5, 0.4], area: [1, 1.15, 1.3] } },
  trail:       { name: 'Snail Trail', desc: 'Leaves a piece behind you as you swim. Nothing is left while you stay still.', atk: ['pool'], max: 3, group: 'delivery', cap: { gap: [30, 24, 18], pieces: [40, 50, 60] } },
  selfcentred: { name: 'Self-Centred', desc: 'Goes off around you rather than at a target. It never hurts you.', atk: ['burst', 'contact', 'spread'], max: 3, group: 'delivery', cap: { dmg: [0.7, 0.85, 1], area: [1, 1.15, 1.3] } },
  sweep:       { name: 'Windscreen Wiper', desc: 'The hit area moves across enemies, hitting each one once per sweep.', atk: ['contact', 'beam'], max: 3, group: 'delivery', cap: { arc: [1.8, 2.2, 2.6] } },
  anchored:    { name: 'Washing Line', desc: 'The beam joins you to the far side of the crowd instead of firing from you. It moves when either end moves.', atk: ['beam'], max: 3, group: 'delivery', cap: { range: [520, 620, 720], width: [1, 1.2, 1.4] } },
  volley:      { name: 'Rapid Volley', desc: 'Three shots in quick succession, then a pause.', atk: ['proj', 'spread'], max: 3, cap: { size: [3, 4, 5] } },
  nth:         { name: 'Wind-Up', desc: 'Every fourth attack is empowered. The count shows over you.', atk: MOD_ALL, max: 3, cap: { n: [4, 3, 3], mult: [2.5, 2.5, 3.2] } },
  growing:     { name: 'Growth Hormone', desc: 'Gets bigger and stronger the further it goes, the longer it lasts or the more it hits, up to double. Resets when the attack ends.', atk: ['proj', 'beam', 'pool', 'contact'], max: 3, cap: { size: [1, 1.5, 2] } },
  scaling:     { name: 'Show-Off', desc: 'Damage grows with one of your stats, up to double.', atk: MOD_ALL, max: 3, cap: { mult: [2, 2.5, 3] } },
  multiplying: { name: 'Go Forth and Multiply', desc: 'A shot that kills splits into two weaker shots. Split shots never split again.', atk: ['proj'], max: 3, cap: { split: [2, 3, 3], flight: [12, 16, 20], child: [0.5, 0.5, 0.6] } },
  summoned:    { name: 'Little Helpers', desc: 'Pets deliver the attack for you. Up to four on this weapon, eight in total.', atk: ['contact', 'proj'], max: 3, group: 'delivery', cap: { pets: [2, 3, 4], total: 8 } },
  gravity:     { name: 'Gravity Well', desc: 'Warps space round the attack: drags enemies towards its centre and bends shots passing through. Three wells at most.', atk: ['proj', 'burst', 'pool'], max: 3, cap: { wells: [3, 4, 5], r: [110, 135, 160], bend: 0.785 } },
  lunge:       { name: 'Lunge', desc: 'The attack moves you: forwards through a Contact target, or backwards as recoil from Spread and Burst.', atk: ['contact', 'spread', 'burst'], max: 3, cap: { dist: [160, 240, 320], time: 0.25 } },
};

// ---------------------------------------------------------------- API
const modCount = (w, id) => (w && w.m10 ? w.m10.filter(x => x === id).length : 0);
const modHas = (w, id) => modCount(w, id) > 0;
// A modifier taken again ranks up (max 3). Per-rank numbers are arrays in cap: modV reads the one for w's rank.
const modV = (w, id, k) => { const v = MODS10[id].cap[k], n = modCount(w, id) || 1; if (!Array.isArray(v)) return v; if (n > v.length && v.length > 1) return v[v.length - 1] + (v[v.length - 1] - v[v.length - 2]) * (n - v.length); return v[Math.max(0, Math.min(v.length, n) - 1)]; }; // (past the last rank, a mastery: one more step of the same size, modmatrix.js)
function modOk(w, id) {
  const m = MODS10[id], a = w && w.def && w.def.v10atk;
  if (!m || !a || !m.atk.includes(a) || modCount(w, id) >= m.max) return false;
  if (m.group && (w.m10 || []).some(x => x !== id && MODS10[x].group === m.group)) return false;
  return true;
}
function modAdd(w, id) {
  if (!modOk(w, id)) return false;
  (w.m10 || (w.m10 = [])).push(id);
  return true;
}
const modsFor = w => Object.keys(MODS10).filter(id => modOk(w, id));
const modS = () => G.m10 || (G.m10 = { wells: [], mines: [], lobs: [], pets: [], lunge: null, wid: 0 });
const modNow = () => (G.t || 0);

// Scaling: one stat per weapon, capped at x2 (max health, swim speed, or missing health).
function modScaleK(w) {
  if (!modHas(w, 'scaling')) return 1;
  const P = G.P, a = w.def.v10atk, st = a === 'contact' || a === 'burst' ? 'hp' : a === 'proj' || a === 'beam' ? 'speed' : 'missing';
  const k = st === 'hp' ? 1 + (P.maxHp - 120) / 240 : st === 'speed' ? 1 + (P.speed - 1) : 1 + (1 - G.player.hp / P.maxHp);
  return clamp(k, 1, modV(w, 'scaling', 'mult'));
}
// One attack happens: count it for Every Nth, apply Scaling and Growing (contact) to its source.
function modAtk(w, src) {
  w.m10emp = false;
  if (modHas(w, 'nth')) { w.m10n = (w.m10n || 0) + 1; if (w.m10n % modV(w, 'nth', 'n') === 0) { w.m10emp = true; floatText(G.player.x, G.player.y - 40, 'EMPOWERED', w.def.color, 12, 0.5); } }
  modAgain(w, src);
}
function modAgain(w, src) {
  src.mult = (src.mult || 1) * (w.m10emp ? modV(w, 'nth', 'mult') : 1) * modScaleK(w) * (modHas(w, 'growing') && w.def.v10atk === 'contact' ? 1 + (w.m10gk || 0) : 1);
}

// ---------------------------------------------------------------- firing (game.js fireWeapon, before v10Fire)
// Returns true when the modifier delivers the attack itself (the normal fire is skipped).
function modFire(w, target, src) {
  const a = w.def.v10atk;
  if (!a || !w.m10 || !w.m10.length) return false;
  if (modHas(w, 'orbiting') || modHas(w, 'summoned') || modHas(w, 'trail')) return true; // (the bodies run in modTick)
  const s = w.s, p = G.player, fresh = !w._mvol;
  if (fresh) modAtk(w, src); else modAgain(w, src);
  if (fresh && modHas(w, 'lunge') && target) modLunge(w, target);
  if (fresh && modHas(w, 'volley')) {
    for (let i = 1; i < modV(w, 'volley', 'size'); i++) after(0.09 * i, () => {
      if (!G || !G.weapons.includes(w)) return;
      const t = target && !target.dead ? target : acquire(aimDir(w), s.range, G.player.x, G.player.y);
      if (!t) return;
      w._mvol = 1; try { fireWeapon(w, t); } finally { w._mvol = 0; }
    });
    w.cd += s.cd; // (the pause)
  }
  if (modHas(w, 'selfcentred')) return modSelf(w, src);
  if (modHas(w, 'delayed')) return modMine(w, target, src);
  if (modHas(w, 'lobbed')) return modLob(w, target, src);
  if (modHas(w, 'sweep') && a === 'contact') return modSweep(w, target, src);
  return false;
}

function modSelf(w, src) {
  const s = w.s, p = G.player, d = w.def, a = d.v10atk, dk = modV(w, 'selfcentred', 'dmg'), ar = s.area * modV(w, 'selfcentred', 'area');
  if (a === 'burst') {
    G.fx.push({ type: 'warn', x: p.x, y: p.y, r: ar, color: d.color, life: s.delay, max: s.delay });
    after(s.delay, () => { const q = G.player; aoe(q.x, q.y, ar, s.dmg, src, d.color); modBurstEnd(w, q.x, q.y); });
  } else if (a === 'contact') {
    forNear(p.x, p.y, s.range, e => { if (!e.charmed) damageEnemy(e, s.dmg * dk, Object.assign({}, src, { kx: e.x - p.x, ky: e.y - p.y })); });
    ring(p.x, p.y, s.range, d.color, 0.3, 4);
  } else if (a === 'spread') {
    const n = Math.max(10, s.count * 2);
    for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU + rand(-0.05, 0.05), src, { dmg: s.dmg * dk });
  }
  return true;
}
function modMine(w, target, src) {
  const S = modS(), s = w.s, d = w.def;
  if (!target) return true;
  const mine = S.mines.filter(m => m.w === w);
  if (mine.length >= modV(w, 'delayed', 'placed')) modBlow(mine[0]);
  S.mines.push({ x: target.x, y: target.y, w, src, life: MODS10.delayed.cap.life, arm: 0.4, r: s.area, dmg: s.dmg * modV(w, 'delayed', 'dmg'), color: d.color });
  return true;
}
function modBlow(m) {
  const S = modS(); m.dead = true; S.mines = S.mines.filter(q => q !== m);
  aoe(m.x, m.y, m.r, m.dmg, m.src, m.color); modBurstEnd(m.w, m.x, m.y);
}
function modLob(w, target, src) {
  const S = modS(), p = G.player, d = w.def, s = w.s, fl = modV(w, 'lobbed', 'flight');
  if (!target) return true;
  G.fx.push({ type: 'warn', x: target.x, y: target.y, r: s.area * modV(w, 'lobbed', 'area'), color: d.color, life: fl, max: fl });
  if (d.v10atk === 'pool') G.proj.push({ lob: true, sx: p.x, sy: p.y, tx: target.x, ty: target.y, x: p.x, y: p.y, t: 0, flight: fl, w, src, color: d.color, dead: false });
  else S.lobs.push({ sx: p.x, sy: p.y, tx: target.x, ty: target.y, x: p.x, y: p.y, t: 0, flight: fl, w, src, color: d.color, ak: modV(w, 'lobbed', 'area') });
  return true;
}
function modSweep(w, target, src) {
  const s = w.s, p = G.player, d = w.def, a0 = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.face, arc = modV(w, 'sweep', 'arc'), R = s.range;
  p.face = a0;
  forNear(p.x, p.y, R, e => {
    if (e.charmed) return;
    const dd = Math.hypot(e.x - p.x, e.y - p.y) || 1;
    if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), a0)) > arc / 2 + Math.atan(e.r / dd)) return;
    damageEnemy(e, s.dmg, Object.assign({}, src, { kx: e.x - p.x, ky: e.y - p.y }));
    if (w.m10) modMeleeHit(w, e, s.dmg, src, true);
  });
  G.fx.push({ type: 'swing', x: p.x, y: p.y, a: a0, arc, r: R, color: d.color, life: 0.22, max: 0.22 });
  return true;
}
function modLunge(w, target) {
  const p = G.player, S = modS(), c = MODS10.lunge.cap;
  if (S.lunge && S.lunge.left > 0) return;
  const a = Math.atan2(target.y - p.y, target.x - p.x), fwd = w.def.v10atk === 'contact';
  let dist = modV(w, 'lunge', 'dist');
  if (fwd) dist = Math.max(0, Math.min(dist, Math.hypot(target.x - p.x, target.y - p.y) + target.r));
  S.lunge = { ux: Math.cos(a) * (fwd ? 1 : -1), uy: Math.sin(a) * (fwd ? 1 : -1), left: dist, v: dist / c.time };
}

// ---------------------------------------------------------------- shots (game.js spawnProj / updateProjectiles)
function modProj(pr, w) {
  pr.m10 = 1;
  if (modHas(w, 'homing')) pr.mH = modV(w, 'homing', 'turn');
  const pc = modCount(w, 'piercing');
  if (pc) { pr.pierce = (pr.pierce || 0) + 2 * pc; pr.mP = 1; }
  if (modHas(w, 'chaining')) pr.mC = 1;
  if (modHas(w, 'ricochet')) pr.mR = modV(w, 'ricochet', 'bounces');
  if (modHas(w, 'returning')) {
    const had = pr.pierce > 0;
    pr.boomerang = 1; pr.life = pr.max = (w.s.range || 400) / pr.speed * 2 + 0.3; pr.mRet = 1;
    if (!had) { pr.pierce = 3; pr.mRetNP = 1; }
  }
  if (modHas(w, 'growing')) { pr.mG = 1; pr.r0 = pr.r; pr.dmg0 = pr.dmg; pr.age = 0; }
  if (modHas(w, 'multiplying') && !pr.mSplit) pr.mS = 1;
  if (modHas(w, 'gravity')) pr.mW = 1;
}
const modWall = (x, y) => {
  if (G.lvl && lvSolidAt(x, y)) return true;
  if (G.m10walls) for (const r of G.m10walls) if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return true;
  return false;
};
// Per shot, per frame, before the engine moves it. Returns true if the shot is gone.
function modStep(pr, dt) {
  if (pr.mH && !pr.mHlost && !pr.back) {
    if (!pr.tgt) pr.tgt = acquire('nearest', 380, pr.x, pr.y);
    if (pr.tgt && pr.tgt.dead) { pr.tgt = null; pr.mHlost = 1; }
    else if (pr.tgt) {
      const ta = Math.atan2(pr.tgt.y - pr.y, pr.tgt.x - pr.x), ca = Math.atan2(pr.vy, pr.vx), da = angDiff(ta, ca), na = ca + clamp(da, -pr.mH * dt, pr.mH * dt);
      pr.vx = Math.cos(na) * pr.speed; pr.vy = Math.sin(na) * pr.speed;
    }
  }
  if (pr.mRet && pr.back && !pr.mBk) { pr.mBk = 1; pr.pierce = 99; pr.hits = null; if (pr.w) pr.dmg *= modV(pr.w, 'returning', 'back'); }
  if (pr.mG) { pr.age += dt; const k = Math.min(1, pr.age / Math.max(0.3, pr.max * 0.8)) * (pr.w ? modV(pr.w, 'growing', 'size') : 1); pr.r = pr.r0 * (1 + k); pr.dmg = pr.dmg0 * (1 + k); }
  if (pr.mR > 0 && !pr.back) {
    const nx = pr.x + pr.vx * dt, ny = pr.y + pr.vy * dt;
    if (modWall(nx, ny)) {
      let fx = modWall(nx, pr.y), fy = modWall(pr.x, ny);
      if (!fx && !fy) fx = fy = true;
      if (fx) pr.vx = -pr.vx;
      if (fy) pr.vy = -pr.vy;
      pr.mR--; pr.dmg *= 1 - (pr.w ? modV(pr.w, 'ricochet', 'loss') : 0.2); pr.hits = null; pr.mBounced = (pr.mBounced || 0) + 1;
      spawnPart(pr.x, pr.y, pr.color, 3, 60, 0.2, 2);
    }
  }
  if (pr.mW && !pr.mWdone && pr.life <= dt * 1.5) { pr.mWdone = 1; pr.dead = true; modWell(pr.x, pr.y, modV(pr.w, 'gravity', 'r'), 600, 2.5, pr.w, true, true); return true; }
  return false;
}
// After a shot's hit has landed (game.js, after projHit).
function modHit(pr, e) {
  if (pr.mP && pr.pierce > 0) pr.dmg *= 1 - MODS10.piercing.cap.cost;
  if (pr.mC) modChain(e, pr.dmg, pr.src);
  pr.mHits = (pr.mHits || 0) + 1;
  if (pr.mRetNP && !pr.back && pr.mHits >= modV(pr.w, 'returning', 'hits')) { pr.back = true; pr.hits = null; }
  if (pr.mS && !pr.mSplit && e.dead && !pr.mSplitDone) {
    pr.mSplitDone = 1;
    let n = 0; for (const q of G.proj) if (q.w === pr.w && !q.dead) n++;
    const room = Math.min(modV(pr.w, 'multiplying', 'split'), modV(pr.w, 'multiplying', 'flight') - n);
    const ts = acquireMany('nearest', 260, e.x, e.y, 4).filter(t => t !== e);
    for (let i = 0; i < room; i++) {
      const a = ts[i] ? Math.atan2(ts[i].y - e.y, ts[i].x - e.x) : Math.random() * TAU;
      spawnProj(pr.w, e.x, e.y, a, pr.src, { dmg: pr.dmg * modV(pr.w, 'multiplying', 'child'), mSplit: 1, pierce: 0, hits: [e.id] });
    }
  }
  if (pr.mW && !pr.mWdone) { pr.mWdone = 1; pr.dead = true; modWell(pr.x, pr.y, modV(pr.w, 'gravity', 'r'), 600, 2.5, pr.w, true, true); }
}
// Contact hits (arsenal.js meleeHit; also the Sweep above).
function modMeleeHit(w, e, dmg, src, sweepCall) {
  if (modHas(w, 'chaining') && !src.m10chain) modChain(e, dmg, src);
  if (modHas(w, 'growing') && w.def.v10atk === 'contact') { w.m10gk = Math.min(modV(w, 'growing', 'size'), (w.m10gk || 0) + 0.1); w.m10gt = modNow(); }
}
// Bounded chain: up to 3 jumps (4, 5 at higher ranks), range 110, 70% a jump, each target once (modifiers 3).
function modChain(from, dmg, src) {
  const w = src.w, v = k => w ? modV(w, 'chaining', k) : MODS10.chaining.cap[k][0], c = { jumps: v('jumps'), range: v('range'), falloff: v('falloff') }, hit = new Set([from]);
  let cur = from, d = dmg;
  for (let k = 0; k < c.jumps; k++) {
    let nx = null, bd = c.range * c.range;
    forNear(cur.x, cur.y, c.range, (o, d2) => { if (!hit.has(o) && !o.dead && !o.charmed && d2 < bd) { bd = d2; nx = o; } });
    if (!nx) break;
    d *= c.falloff; hit.add(nx);
    bolt(cur.x, cur.y, nx.x, nx.y, src.w ? src.w.def.color : '#fff', 0.16);
    damageEnemy(nx, d, Object.assign({}, src, { m10chain: 1, knock: 0, noArc: true, mult: 1 }));
    cur = nx;
  }
}
// A burst has gone off at x, y (v10.js v10Fire, and the placed and lobbed blasts here).
function modBurstEnd(w, x, y) { if (w && modHas(w, 'gravity')) modWell(x, y, modV(w, 'gravity', 'r'), 600, 2.5, w, true, true); }

// ---------------------------------------------------------------- beams (v10.js v10Fire)
function modBeam(w, a, L, wd) {
  const p = G.player, out = { a, L, wd, bk: 1 };
  if (modHas(w, 'anchored')) {
    const far = acquire('furthest', modV(w, 'anchored', 'range'), p.x, p.y);
    if (far) { out.a = Math.atan2(far.y - p.y, far.x - p.x); out.L = Math.hypot(far.x - p.x, far.y - p.y); }
    out.wd = wd * modV(w, 'anchored', 'width');
  }
  if (modHas(w, 'sweep')) out.a += Math.sin(modNow() * 3.2) * modV(w, 'sweep', 'arc') / 3;
  if (modHas(w, 'growing')) {
    w.m10bg = modNow() - (w.m10bt || -9) < 0.35 ? Math.min(modV(w, 'growing', 'size'), (w.m10bg || 0) + 0.05) : 0; w.m10bt = modNow();
    out.bk = 1 + w.m10bg; out.wd = out.wd * out.bk;
  }
  return out;
}

// ---------------------------------------------------------------- gravity wells (matrix 12.2)
function modWell(x, y, r, pull, life, w, bodies, shots) {
  const S = modS();
  S.wells.push({ id: ++S.wid, x, y, r, pull, life, max: life, w, bodies, shots });
  while (S.wells.length > Math.max(...S.wells.map(q => q.w ? modV(q.w, 'gravity', 'wells') : 3))) S.wells.shift();
}
function wellTick(wl, dt) {
  const bend = MODS10.gravity.cap.bend;
  if (wl.bodies) forNear(wl.x, wl.y, wl.r, e => {
    if (e.egg || e.dead) return;
    let f = wl.pull / (wl.r / 12) * dt;
    if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5;
    if (typeof fightCd === 'function' && fightCd(e).def === 'squishy') f *= 0.5;
    const dx = wl.x - e.x, dy = wl.y - e.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, f), nx = e.x + dx / d * m, ny = e.y + dy / d * m;
    if (G.lvl && lvSolidAt(nx, ny)) return;
    e.x = nx; e.y = ny;
  });
  if (wl.shots) {
    const key = 'mb' + wl.id, bendOne = b => {
      if (b.dead || b.lob || b.mine || b.pair) return;
      const dx = wl.x - b.x, dy = wl.y - b.y;
      if (dx * dx + dy * dy > wl.r * wl.r) return;
      const used = b[key] || 0; if (used >= bend) return;
      const sp = Math.hypot(b.vx, b.vy) || 1, ca = Math.atan2(b.vy, b.vx), da = angDiff(Math.atan2(dy, dx), ca);
      const t = clamp(da, -Math.min(3.5 * dt, bend - used), Math.min(3.5 * dt, bend - used));
      b[key] = used + Math.abs(t); const na = ca + t; b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
    };
    for (const b of G.proj) { if (b.w && !(b.w === wl.w && b.mWdone)) bendOne(b); }
    for (const b of G.ebul) bendOne(b);
  }
}

// ---------------------------------------------------------------- every frame (v10.js v10Tick)
function modTick(dt) {
  if (!G || !G.weapons) return;
  const S = modS(), p = G.player;
  for (const w of G.weapons) {
    if (!w || !w.m10 || !w.m10.length || !w.def.v10atk) continue;
    if (w.m10gk > 0 && modNow() - (w.m10gt || 0) > 1.5) w.m10gk = 0;
    if (modHas(w, 'orbiting')) modOrbit(w, dt);
    if (modHas(w, 'summoned')) modPets(w, dt);
    if (modHas(w, 'trail')) modTrail(w);
  }
  S.pets = S.pets.filter(q => G.weapons.includes(q.w));
  // Lunge
  const L = S.lunge;
  if (L && L.left > 0) {
    const st = Math.min(L.left, L.v * dt), nx = p.x + L.ux * st, ny = p.y + L.uy * st, egg = G.eggE;
    if ((G.lvl && lvSolidAt(nx, ny)) || (egg && !egg.dead && Math.hypot(nx - egg.x, ny - egg.y) < egg.r + p.r + 6)) L.left = 0;
    else { p.x = nx; p.y = ny; L.left -= st; if (Math.random() < 0.6) spawnPart(p.x, p.y, '#fff', 1, 40, 0.2, 2); }
  }
  // Placed blasts
  for (const m of S.mines.slice()) {
    m.life -= dt; m.arm -= dt;
    let trig = false;
    if (m.arm <= 0) forNear(m.x, m.y, m.r * 0.6, () => { trig = true; return true; });
    if (trig || m.life <= 0) modBlow(m);
  }
  // Lobbed blasts
  for (const b of S.lobs.slice()) {
    b.t += dt; const k = Math.min(1, b.t / b.flight);
    b.x = lerp(b.sx, b.tx, k); b.y = lerp(b.sy, b.ty, k); b.h = Math.sin(k * Math.PI) * 90;
    if (k >= 1) { S.lobs = S.lobs.filter(q => q !== b); aoe(b.tx, b.ty, b.w.s.area * (b.ak || 1), b.w.s.dmg, b.src, b.color); modBurstEnd(b.w, b.tx, b.ty); }
  }
  // Pool pieces: Growing and Gravity Well (the engine makes the zone when a lob lands)
  for (const z of G.zones) {
    if (z.m10t) {
      if (z.m10g) { z.age += dt; const k = Math.min(1, z.age / Math.max(0.3, z.max * 0.8)) * (z.src && z.src.w ? modV(z.src.w, 'growing', 'size') : 1); z.r = z.r0 * (1 + k); z.dps = z.d0 * (1 + k); }
      continue;
    }
    const w = z.src && z.src.w;
    if (!w || !w.m10 || w.def.v10atk !== 'pool') continue;
    z.m10t = 1;
    if (modHas(w, 'growing')) { z.m10g = 1; z.r0 = z.r; z.d0 = z.dps; z.age = 0; }
    if (modHas(w, 'gravity')) modWell(z.x, z.y, Math.max(modV(w, 'gravity', 'r'), z.r * 1.4), 600, Math.max(0.5, z.life), w, true, false);
  }
  // Wells
  for (const wl of S.wells) { wl.life -= dt; wellTick(wl, dt); }
  S.wells = S.wells.filter(wl => wl.life > 0);
}
function modOrbit(w, dt) {
  const s = w.s, p = G.player, c = { radius: MODS10.orbiting.cap.radius, bodies: modV(w, 'orbiting', 'bodies') }, src0 = weaponSrc(w);
  w.m10ang = (w.m10ang || 0) + 3 * dt;
  w.m10orb = [];
  for (let i = 0; i < c.bodies; i++) {
    const a = w.m10ang + i / c.bodies * TAU, bx = p.x + Math.cos(a) * c.radius, by = p.y + Math.sin(a) * c.radius, key = 'm' + w.uid + '_' + i;
    w.m10orb.push({ x: bx, y: by });
    if (w.m10block) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - bx, b.y - by) < 12 + b.r) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 1, 40, 0.2); }
    forNear(bx, by, 12, e => {
      if (e.charmed || e.hitT[key] > G.t) return;
      e.hitT[key] = G.t + 0.5;
      const src = Object.assign({}, src0, { knock: 50, kx: e.x - p.x, ky: e.y - p.y }); modAtk(w, src);
      damageEnemy(e, s.dmg * 0.6, src);
      if (modHas(w, 'chaining')) modChain(e, s.dmg * 0.6, src);
    });
  }
}
function modPets(w, dt) {
  const S = modS(), p = G.player, s = w.s, c = MODS10.summoned.cap, mine = S.pets.filter(q => q.w === w);
  const want = modV(w, 'summoned', 'pets');
  if (mine.length < want && S.pets.length < c.total) S.pets.push({ w, x: p.x + rand(-30, 30), y: p.y + rand(-30, 30), away: false, hitT: 0 });
  for (const q of mine) {
    const dp = Math.hypot(q.x - p.x, q.y - p.y);
    if (dp > 300) q.away = true; else if (dp < 200) q.away = false;
    let tx = p.x, ty = p.y;
    if (!q.away) {
      let best = null, bd = 1e9;
      for (const e of G.enemies) { if (e.dead || e.charmed || e.phased || (e.egg)) continue; const d2 = (e.x - q.x) ** 2 + (e.y - q.y) ** 2; if (d2 < bd && Math.hypot(e.x - p.x, e.y - p.y) < 300) { bd = d2; best = e; } }
      if (best) { tx = best.x; ty = best.y; }
      else { tx = p.x + Math.cos(modNow() * 2 + q.x) * 50; ty = p.y + Math.sin(modNow() * 2 + q.x) * 50; }
    }
    const dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy) || 1, sp = q.away ? 260 : 170;
    q.x += dx / d * Math.min(d, sp * dt); q.y += dy / d * Math.min(d, sp * dt);
    q.hitT -= dt;
    if (!q.away && q.hitT <= 0) forNear(q.x, q.y, 10, e => {
      if (e.charmed) return true;
      q.hitT = 0.5;
      const src = Object.assign(weaponSrc(w), { knock: 40, kx: e.x - q.x, ky: e.y - q.y }); modAtk(w, src);
      damageEnemy(e, s.dmg * 0.8, src);
      if (modHas(w, 'chaining')) modChain(e, s.dmg * 0.8, src);
      return true;
    });
  }
}
function modTrail(w) {
  const p = G.player, c = { gap: modV(w, 'trail', 'gap'), pieces: modV(w, 'trail', 'pieces') }, s = w.s;
  if (!w.m10lx) { w.m10lx = p.x; w.m10ly = p.y; w.m10acc = 0; return; }
  w.m10acc += Math.hypot(p.x - w.m10lx, p.y - w.m10ly); w.m10lx = p.x; w.m10ly = p.y;
  while (w.m10acc >= c.gap) {
    w.m10acc -= c.gap;
    const src = weaponSrc(w); modAtk(w, src);
    G.zones.push({ x: p.x, y: p.y, r: s.area * 0.6, life: s.dur, max: s.dur, dps: s.dmg * 0.9, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src, m10trail: 1 });
    const mine = G.zones.filter(z => z.m10trail && z.life > 0.01);
    for (let i = 0; i < mine.length - c.pieces; i++) mine[i].life = 0.001;
  }
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function modDraw() {
  if (!G || !G.m10) return;
  const S = G.m10, t = G.realT || 0;
  ctx.save(); ctx.lineWidth = Math.max(1.5, 2 * S_());
  for (const wl of S.wells) { // lensing ripple at the edge
    ctx.strokeStyle = col('#b8c4ff');
    for (let i = 0; i < 3; i++) { const k = ((t * 0.8 + i / 3) % 1); ctx.globalAlpha = 0.5 * (1 - k); ctx.beginPath(); ctx.arc(sx(wl.x), sy(wl.y), wl.r * S_() * (1 - k * 0.25), 0, TAU); ctx.stroke(); }
  }
  for (const m of S.mines) { // the mark, for its whole delay
    ctx.strokeStyle = col(m.color); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 6); ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), m.r * S_(), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = col(m.color); ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 4 * S_(), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const b of S.lobs) { ctx.fillStyle = col(b.color); ctx.beginPath(); ctx.arc(sx(b.x), sy(b.y) - (b.h || 0) * S_(), 5 * S_(), 0, TAU); ctx.fill(); }
  for (const w of G.weapons) {
    if (!w || !w.m10) continue;
    // (Orbiting bodies on a beam are dots; every other weapon's look like its own shots: orbShots)
    if (w.m10orb && w.def.v10atk === 'beam') { ctx.fillStyle = col(w.def.color); for (const o of w.m10orb) { ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), 7 * S_(), 0, TAU); ctx.fill(); } }
    if (modHas(w, 'nth')) { // the build-up: pips over you
      const n = modV(w, 'nth', 'n'), have = (w.m10n || 0) % n, p = G.player, i0 = G.weapons.indexOf(w);
      for (let i = 0; i < n; i++) { ctx.fillStyle = col(i < have ? w.def.color : '#556'); ctx.beginPath(); ctx.arc(sx(p.x) + (i - (n - 1) / 2) * 7 * S_(), sy(p.y) - (30 + i0 * 7) * S_(), 2.5 * S_(), 0, TAU); ctx.fill(); }
    }
  }
  for (const q of S.pets) { ctx.strokeStyle = col(q.w.def.color); ctx.fillStyle = col('#10121a'); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 6 * S_(), 0, TAU); ctx.fill(); ctx.stroke(); }
  ctx.restore();
}
const S_ = () => (typeof S === 'number' ? S : 1);
// Orbiting bodies drawn as the weapon's own shots: display-only copies, facing along the spin, that render.js and
// typelook.js draw with G.proj (never pushed into it, so they never hit, merge or count). Beams keep their dots.
function orbShots() {
  if (!G || !G.weapons) return G ? G.proj : [];
  let out = null;
  const p = G.player;
  for (const w of G.weapons) {
    if (!w || !w.m10orb || !w.m10orb.length || w.def.v10atk === 'beam') continue;
    const d = w.def, s = w.s || {}, L = w.m10look || (w.m10look = []);
    w.m10orb.forEach((o, i) => {
      const q = L[i] || (L[i] = { seed: Math.random() * 10, life: 1, max: 1, orbitT: 1, dmg: 0, hit: null, orbLook: 1 });
      const a = Math.atan2(o.y - p.y, o.x - p.x) + Math.PI / 2;
      q.x = o.x; q.y = o.y; q.vx = Math.cos(a) * 300; q.vy = Math.sin(a) * 300; q.r = s.size || 4; q.w = w;
      q.color = w.typeOver && V10_COL[w.typeOver] || d.color; q.style = s.style || d.style || 'bullet';
      q.lob = d.v10atk === 'pool'; q.h = 0;
      if (!q.src || q.src.w !== w) q.src = { elem: d.elem, w };
      (out || (out = [])).push(q);
    });
    L.length = w.m10orb.length;
  }
  return out ? G.proj.concat(out) : G.proj;
}
