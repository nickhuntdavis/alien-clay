'use strict';
// Spawn Prawn - weapon cells, part 3: Standard Issue (si) and Little Prick (lp) (redesign docs/MODIFIER_MATRIX.md, those
// two rows of sections 3 and 4, and 5.9; Claude's picks, built 24 Oct). Same engine as cellmods.js (XC_W masking, no
// fork screens, rank 1 to 3 then the mastery as rank 4). Card text cell_si_<modifier> / cell_lp_<modifier> in cellcopy3.js.
//  - STANDARD ISSUE (v_phys_proj): a heavy pellet, played as billiards. Sling (Range), Billiards (Knockback), Lodged
//    (Sticky), Staple (Connecting), Human shield (Turncoat), Head-on ram (Melee), pellet mines, a slug from above, Slingshot
//    orbit, Wide load (Area). Switched at Birth deals Blood (MM_SAB; it has no ranks in code, so no Lv 2 to mastery steps).
//  - LITTLE PRICK (v_arcane_proj): a needle; most cells add or cash in Bleed stacks (xc3Bleed adds them, up to 12 on one
//    enemy; xc3BleedAll "ticks all stacks at once": the Bleed left is dealt now and the stacks end). Blood thread
//    (Connecting), stitches (Piercing mastery), blood brothers (Turncoat), stab (Melee), needle traps, needle rain, Blood
//    mist (Area). Switched at Birth is N/A (not in MM_SAB).
//  - Kept shared (the cell adds its own mastery; the shared mastery is switched off with w.mmX[id] = 'X'): Catalyst,
//    Kinship, Focused Intensity, Primer on both; Sticky on Little Prick. Exploding Rounds on Standard Issue is the shared
//    Pop Pop with Cluster Round as its mastery (that row matches it). Every other cell masks the shared form.
// Deviations (also in MODIFIER_MATRIX.md 5.9): reach is capped near 300 on screen, so Range adds +50 reach a rank (standing
// in for the camera zoom, not built) and its distances are scaled down (Sling +8% per 50 flown past 100; the mastery ring
// past 350; Little Prick's double Bleed past 300). Death from Above is an extra strike now and then (user, 23 Oct: the
// shared form), not a replacement. Kinship's mastery on Standard Issue: Squishy has no knockback cut in code, so pellets
// ignore Squishy's Force cut instead.
// Hooks: none in shared files. Wraps game.js fireWeapon, sigs.js projHit, modifiers.js modProj/modStep/modDraw, aim.js
// aimMul, power11.js p11Range, fight.js fightStatus, arsenal.js allyAI, modwide.js mwDetonate, weapons24.js wupHit/
// wupDmgMul/wupTick; fills cellmods.js XC_W/XC_TICK/XC_FIRE/XC_STATS/XC_RUN/XC_LIFE. Loads after cellmods2.js.

const XC3_CELLS = ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'];
XC_W.v_phys_proj = { tag: 'si', cells: XC3_CELLS.slice(),
  mask: ['range', 'upclose', 'rapid', 'charged', 'knock', 'pull', 'sticky', 'piercing', 'homing', 'ricochet', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['ranged'], atkOk: [] };
XC_W.v_arcane_proj = { tag: 'lp', cells: XC3_CELLS.slice(),
  mask: ['range', 'upclose', 'rapid', 'charged', 'knock', 'pull', 'piercing', 'explode', 'homing', 'ricochet', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['ranged'], atkOk: [] };
const XC3_OWNM = { si: ['catalyst', 'kinship', 'focus', 'primer'], lp: ['catalyst', 'kinship', 'focus', 'primer', 'sticky'] }; // (kept shared, own mastery)
const XC3_BLOOD = '#c9184a', XC3_BMAX = 12;
const xc3Is = w => !!w && (xcIs(w, 'si') || xcIs(w, 'lp'));
const xc3On = w => xc3Is(w) && xcAny(w);
const xc3S = () => G.xc3 || (G.xc3 = { st: [], th: [], sti: [], lodge: [], bil: [], mine: [], cr: [] });
const xc3R3 = (w, id) => Math.min(3, xcR(w, id));
const xc3Live = w => G && G.weapons.includes(w);
const xc3Kin = w => mwWs().filter(x => x !== w && mwType(x) === mwType(w)).length;

// ---------------------------------------------------------------- Bleed stacks (Little Prick)
function xc3Bleed(e, dmg, n, nopass) {
  if (!e || e.dead || e.charmed || !(n > 0) || !(dmg > 0)) return;
  const b = e.bleeds || (e.bleeds = []);
  for (let i = 0; i < n; i++) { if (b.length >= XC3_BMAX) b.shift(); b.push({ dps: dmg * 0.1, t: 3, by: 'Little Prick' }); } // (as fight.js: 30% of the hit over 3 s)
  if (!nopass) xc3ThreadPass(e, n, dmg);
}
function xc3BleedAll(e, w) { // the Bleed left is dealt at once, and the stacks end
  if (!e || e.dead || !e.bleeds || !e.bleeds.length) return;
  let d = 0; for (const b of e.bleeds) d += b.dps * b.t;
  e.bleeds = Object.assign([], { breached: e.bleeds.breached });
  ring(e.x, e.y, e.r + 10, XC3_BLOOD, 0.3, 4); fxParts('drop', e.x, e.y, XC3_BLOOD, 6, 120, 0.4, 3);
  if (d > 0) damageEnemy(e, d, { elem: 'arcane', dot: true, noCrit: true, noStatus: true, noArc: true, w, wname: 'Little Prick (bleeding)' });
}
fightStatus = (orig => function (e, elem, dmg, src) {
  const w = src && src.w;
  if (!G || FIGHT_TYPE[elem] !== 'blood' || !w || !xcIs(w, 'lp') || !xcAny(w)) {
    const n0 = e && e.bleeds ? e.bleeds.length : 0, r = orig(e, elem, dmg, src);
    if (G && FIGHT_TYPE[elem] === 'blood' && e && e.xc3Th && e.bleeds && e.bleeds.length >= n0) xc3ThreadPass(e, 1, dmg); // (threads pass any new stack)
    return r;
  }
  const b = e.bleeds || (e.bleeds = []), first = b[0], free = xcR(w, 'kinship') >= 4 && xc3Kin(w) >= 2; // Kinship mastery: no cap
  const r = orig(e, elem, dmg, src);
  if (free && first && e.bleeds[0] !== first && e.bleeds.length < XC3_BMAX) e.bleeds.unshift(first);
  const last = e.bleeds[e.bleeds.length - 1], cat = xcR(w, 'catalyst');
  if (last && cat) last.dps *= 1 + 0.25 * cat; // Catalyst: Bleed hits harder
  xc3ThreadPass(e, 1, dmg);
  return r;
})(fightStatus);

// ---------------------------------------------------------------- stats
function xc3Stats(w, s) {
  const R = id => xcR(w, id), si = xcIs(w, 'si');
  for (const id of XC3_OWNM[xcDef(w).tag]) { // (the cell's own mastery replaces the shared one)
    if (R(id) >= 4) (w.mmX || (w.mmX = {}))[id] = 'X'; else if (w.mmX && w.mmX[id] === 'X') delete w.mmX[id];
  }
  if (R('range')) { s.speed *= 1 + 0.2 * xc3R3(w, 'range'); s.range += 50 * xc3R3(w, 'range'); }
  if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.2], R('rapid')); s.dmg *= xcLv([0.75, 0.7, 0.65, 0.65], R('rapid')); }
  if (R('charged')) {
    s.cd += xcLv([0.5, 0.4, 0.3, 0.3], R('charged'));
    if (si) { s.dmg *= 1 + xcLv([0.6, 0.9, 1.2, 1.2], R('charged')); s.knock = Math.max(s.knock || 0, 60) * 1.3; } // (Little Prick: Bleed stacks instead)
  }
  const ex = R('extra'); if (ex) { s.count = (s.count || 1) + (!si && ex >= 3 ? 3 : 1); s.dmg *= 0.85; }
  if (R('melee')) s.range = (si ? 40 : 20) + (R('melee') >= 2 ? 80 : 60) * xcArea(w);
}
XC_STATS.si = xc3Stats; XC_STATS.lp = xc3Stats;

// ---------------------------------------------------------------- firing
fireWeapon = (orig => function (w, target) {
  if (!w || !xc3On(w)) return orig(w, target);
  w.xc3Del = 0; w.xc3Fire = 1;
  try { orig(w, target); } finally { w.xc3Emp = 0; w.xc3Ten = 0; }
  try { if (!w.xc3Del && target && G.weapons.includes(w)) xc3Extra(w, target); } finally { w.xc3Fire = 0; }
})(fireWeapon);
function xc3Extra(w, target) { // Extra Projectiles: the rear and side shots, the ring
  const r = xcR(w, 'extra'); if (r < 2) return;
  const p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x), src = weaponSrc(w), sh = (a, k) => spawnProj(w, p.x, p.y, a, Object.assign({}, src, { mult: (src.mult || 1) * k }));
  if (r >= 4) { for (let i = 0; i < 8; i++) sh(a0 + (i + 0.5) / 8 * TAU, 0.5); return; }
  sh(a0 + Math.PI, 1);
  if (r >= 3 && xcIs(w, 'si')) { sh(a0 + Math.PI / 2, 1); sh(a0 - Math.PI / 2, 1); }
}
const xc3DfaRoll = w => Math.random() < 1 - Math.exp(-MW_DFA_RATE[Math.min(4, xcR(w, 'dfa')) - 1] * Math.max(0.1, (w.s && w.s.cd) || 1));
function xc3Fire(w, target, src) {
  const R = id => xcR(w, id), p = G.player, s = w.s, si = xcIs(w, 'si');
  if (R('nth')) { w.xc3N = (w.xc3N || 0) + 1; w.m10n = w.xc3N; w.xc3Emp = w.xc3N % (R('nth') >= 2 ? 3 : 4) === 0; if (w.xc3Emp && si) src.mult = (src.mult || 1) * 2; } // (the pips: modifiers.js modDraw)
  if (R('rapid')) {
    if (target !== w.xc3SpE || G.t - (w.xc3LastF || -9) > 1) { w.xc3SpE = target; w.xc3SpS = G.t; }
    w.xc3LastF = G.t;
    if (!si && R('rapid') >= 4) { w.xc3RN = (w.xc3RN || 0) + 1; w.xc3Ten = w.xc3RN % 10 === 0; }
  }
  if (R('dfa') && target && xc3DfaRoll(w)) xc3Dfa(w, target, src); // (an extra: the weapon still fires)
  if (R('melee')) { if (target) xc3Melee(w, target, src); w.xc3Del = 1; return true; }
  if (R('mines')) { xc3Lay(w); w.xc3Del = 1; return true; }
  return false;
}
XC_FIRE.si = xc3Fire; XC_FIRE.lp = xc3Fire;

// Melee: Standard Issue rams 60 (80) into the target; Little Prick stabs the nearest within 60 (80).
function xc3Melee(w, t, src) {
  const R = id => xcR(w, id), p = G.player, s = w.s, si = xcIs(w, 'si'), a = Math.atan2(t.y - p.y, t.x - p.x), r = R('melee');
  const msrc = Object.assign({}, src, { atk: 'contact', kx: Math.cos(a), ky: Math.sin(a) });
  const reach = (r >= 2 ? 80 : 60) * xcArea(w);
  if (si) {
    const d = Math.hypot(t.x - p.x, t.y - p.y), go = Math.max(0, Math.min(reach, d - t.r - p.r));
    if (go > 2) { const S = modS(); S.lunge = { ux: Math.cos(a), uy: Math.sin(a), left: go, v: go / 0.12 }; }
    damageEnemy(t, s.dmg * 1.5, msrc);
    if (r >= 3 && !t.dead && !t.boss) { shove(t, p.x, p.y, 250); t.xcCan = { w, t: G.t + 0.6, f: 200, k: 0.4 }; } // into its mates
    if (r >= 4) { // carries through into the next one in line
      let nx = null, bd = 110 + t.r;
      for (const o of G.enemies) { if (o === t || o.dead || o.charmed) continue; const u = (o.x - t.x) * Math.cos(a) + (o.y - t.y) * Math.sin(a); if (u <= 0 || u > bd) continue; if (Math.abs((o.x - t.x) * -Math.sin(a) + (o.y - t.y) * Math.cos(a)) < o.r + 20) { bd = u; nx = o; } }
      if (nx) { damageEnemy(nx, s.dmg * 1.5, msrc); if (!nx.boss) shove(nx, p.x, p.y, 200); ring(nx.x, nx.y, nx.r + 6, w.def.color, 0.25, 3); }
    }
    G.fx.push({ type: 'swing', x: p.x, y: p.y, a, arc: 0.9, r: reach + p.r, color: w.def.color, life: 0.18, max: 0.18 });
    fxParts('spark', p.x, p.y, w.def.color, 5, 160, 0.25, 2, a + Math.PI, 0.4);
    return;
  }
  const e = acquire('nearest', reach, p.x, p.y) || (Math.hypot(t.x - p.x, t.y - p.y) - t.r < reach ? t : null);
  if (!e) return;
  const b = Math.atan2(e.y - p.y, e.x - p.x);
  damageEnemy(e, s.dmg, Object.assign(msrc, { kx: Math.cos(b), ky: Math.sin(b) }));
  xc3Bleed(e, s.dmg, 1 + (r >= 3 ? 1 : 0)); // double Bleed (and +1 from Lv 3)
  if (r >= 4) { w.xc3Stab = (w.xc3Stab || 0) + 1; if (w.xc3Stab % 4 === 0) xc3BleedAll(e, w); }
  G.fx.push({ type: 'swing', x: p.x, y: p.y, a: b, arc: 0.35, r: reach + p.r, color: w.def.color, life: 0.14, max: 0.14 });
}
// Mines: pellet mines (needle traps) fire at the first enemy to come near.
function xc3Lay(w) {
  const S = xc3S(), R = id => xcR(w, id), p = G.player, cap = R('mines') >= 2 ? 5 : 3;
  S.mine.push({ w, x: p.x + rand(-14, 14), y: p.y + rand(-14, 14), end: G.t + 14, arm: G.t + 0.4, shots: R('mines') >= 3 ? 2 : 1, next: 0 });
  const mine = S.mine.filter(m => m.w === w); while (mine.length > cap) { const o = mine.shift(); o.end = 0; }
  S.mine = S.mine.filter(m => m.end > G.t);
}
// Death from Above (an extra strike): a slug on a 0.4 s reticle, or a rain of needles.
function xc3Dfa(w, t, src) {
  const R = id => xcR(w, id), s = w.s, x = t.x, y = t.y;
  G.fx.push({ type: 'warn', x, y, r: 24, color: w.def.color, life: 0.4, max: 0.4 });
  if (xcIs(w, 'si')) {
    after(0.4, () => {
      if (!G || !xc3Live(w)) return;
      aoe(x, y, 24, s.dmg * (R('dfa') >= 2 ? 1.7 : 1.4), Object.assign({}, src, { mwBoom: 1 }), w.def.color);
      if (R('dfa') >= 3) forNear(x, y, 40, o => { if (!o.charmed) shove(o, x, y, 150); });
      if (R('dfa') >= 4) { const S = xc3S(); if (S.cr.length >= 6) S.cr.shift(); S.cr.push({ w, x, y, end: G.t + 3 }); } // a crater
    });
    return;
  }
  const n = R('dfa') >= 2 ? 5 : 3;
  for (let i = 0; i < n; i++) after(0.4 + i * 0.07, () => {
    if (!G || !xc3Live(w)) return;
    let e = t.dead ? null : t;
    if (R('dfa') >= 3) { const fs = []; forNear(x, y, 50, o => { if (!o.charmed) fs.push(o); }); if (fs.length) e = pick(fs); }
    const ex = e ? e.x : x + rand(-12, 12), ey = e ? e.y : y + rand(-12, 12);
    bolt(ex + rand(-6, 6), ey - 70, ex, ey, w.def.color, 0.1);
    if (e) { damageEnemy(e, s.dmg * 0.4, src); if (R('dfa') >= 4 && !e.boss && i === 0) { e.xcHeldT = G.t + 1; e.xcHX = e.x; e.xcHY = e.y; } } // the needles pin it
  });
}

// ---------------------------------------------------------------- shots
modProj = (orig => function (pr, w) {
  orig(pr, w);
  if (w && xc3On(w) && !pr.xc3Frag) xc3Pj(pr, w);
})(modProj);
function xc3Pj(pr, w) {
  const R = id => xcR(w, id), si = xcIs(w, 'si'), fired = w.xc3Fire && !pr.xc3MineP;
  pr.xc3 = 1; pr.xc3Fly = 0;
  if (si && xcArea(w) > 1) pr.r *= xcArea(w); // Wide load
  if (R('homing')) { pr.mH = (si ? 3 : 5) * xc3R3(w, 'homing'); pr.xc3Re = R('homing') >= 4; }
  if (R('piercing')) { pr.pierce += XC_RAMP(R('piercing')); pr.xc3PL = si && R('piercing') >= 4 ? 0 : 0.15; if (!si && R('piercing') >= 4) pr.xc3Sti = 1; }
  if (R('ricochet')) { pr.xc3B = XC_RAMP(R('ricochet')); pr.xc3BL = si && R('ricochet') >= 4 ? 0.1 : 0.2; if (!si && R('ricochet') >= 4) pr.xc3BH = []; }
  if (R('charged')) { if (!si) pr.xc3Chg = xcLv([2, 4, 6, 6], R('charged')); if (R('charged') >= 4) pr.pierce += 12; }
  if (R('range') >= 4) pr.xc3NoF = 1;
  if (fired && w.xc3Emp) { // Every Nth: the empowered shot
    if (si) { pr.r *= 2; pr.xc3Big = 1; if (R('nth') >= 3) pr.xc3Kn = 1; if (R('nth') >= 4) pr.pierce += 12; }
    else { pr.xc3Nth = 1; if (R('nth') >= 3) pr.pierce += 3; if (R('nth') >= 4) pr.xc3All = 1; }
  }
  if (fired && w.xc3Ten) pr.xc3All = 1; // Rapid Fire mastery: every 10th needle
  if (fired && R('orbiting')) {
    const laps = R('orbiting') >= 2 ? 2 : 1;
    pr.xc3Orb = { left: laps * TAU, spun: 0, a: Math.atan2(pr.vy, pr.vx), stay: 0, go: null };
    (w.xc3Orbs || (w.xc3Orbs = [])).push(pr);
  }
}
modStep = (orig => function (pr, dt) {
  if (pr.xc3 && pr.w && xc3Step(pr, dt)) return true;
  return orig(pr, dt);
})(modStep);
function xc3Step(pr, dt) {
  const w = pr.w, R = id => xcR(w, id);
  if (pr.xc3Orb) return xc3OrbStep(pr, dt);
  pr.xc3Fly += pr.speed * dt;
  if (pr.xc3Re && pr.tgt && pr.tgt.dead) { // Homing mastery: a new target when its own dies
    let t = null;
    if (xcIs(w, 'lp')) { let bd = 380; for (const o of G.enemies) { if (o.dead || o.charmed || !(o.bleeds && o.bleeds.length)) continue; const d = Math.hypot(o.x - pr.x, o.y - pr.y); if (d < bd) { bd = d; t = o; } } }
    pr.tgt = t || acquire('nearest', 380, pr.x, pr.y); pr.mHlost = 0;
  }
  if (xcIs(w, 'si') && R('pull') && !(pr.xc3PT > G.t)) { // pellets tug what they pass towards them
    pr.xc3PT = G.t + 0.1; const r3 = xc3R3(w, 'pull'); let n = 0;
    forNear(pr.x, pr.y, 50 * r3 * xcArea(w), o => { if (o.charmed) return; if (n++ >= 8) return true; mwPull(o, pr.x, pr.y, 6 * r3); o.mwPulledT = G.t + 1; });
  }
  return false;
}
function xc3OrbStep(pr, dt) { // Orbiting: circle you, then fly off at the nearest enemy
  const O = pr.xc3Orb, w = pr.w, p = G.player, R = id => xcR(w, id), lp = xcIs(w, 'lp');
  if (O.left > 0 || (O.stay && !O.go)) {
    if (!xc3Live(w)) O.go = O.go || true;
    else {
      O.a += 6 * dt; O.left -= 6 * dt; O.spun += 6 * dt;
      pr.x = p.x + Math.cos(O.a) * 72; pr.y = p.y + Math.sin(O.a) * 72;
      if ((!lp && R('orbiting') >= 3) || (lp && R('orbiting') >= 4)) for (const b of G.ebul) if (!b.dead && Math.abs(b.x - pr.x) < pr.r + b.r + 3 && Math.abs(b.y - pr.y) < pr.r + b.r + 3) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 1, 40, 0.2); }
      if (lp) forNear(pr.x, pr.y, pr.r + 1, e => { // needles stab what they pass
        if (e.charmed) return; const k = 'xo' + w.uid; if ((e.hitT[k] || 0) > G.t) return;
        e.hitT[k] = G.t + 0.5; damageEnemy(e, pr.dmg * 0.6, pr.src);
      });
      return true;
    }
  }
  const t = O.go && O.go !== true && !O.go.dead ? O.go : acquire('nearest', (w.s.range || 300) * 1.2, pr.x, pr.y);
  const a = t ? Math.atan2(t.y - pr.y, t.x - pr.x) : O.a + Math.PI / 2;
  pr.vx = Math.cos(a) * pr.speed; pr.vy = Math.sin(a) * pr.speed; pr.life = pr.max = (w.s.range || 300) / pr.speed + 0.2; pr.hits = null;
  if (!lp) pr.dmg *= 1 + 0.1 * Math.min(6, Math.floor(O.spun / TAU + 0.05)); // Slingshot: +10% a lap
  pr.xc3Orb = null; pr.xc3Fly = 0;
  return false;
}
aimMul = (orig => function (pr, e) {
  if (!pr || !pr.xc3 || !pr.w) return orig(pr, e);
  let k = orig(pr.xc3NoF ? { w: pr.w, speed: pr.speed, slung: 1 } : pr, e); // (Range mastery: no falloff)
  const r = xcR(pr.w, 'range');
  if (r && xcIs(pr.w, 'si')) k *= 1 + Math.min(xcLv([0.24, 0.48, 0.72, 0.72], r), 0.08 * Math.max(0, Math.floor((pr.xc3Fly - 100) / 50))); // Sling
  return k;
})(aimMul);
p11Range = (orig => function (e, src) { // Range and Up Close on these two (the shared forms are masked)
  const w = src && src.w;
  if (!G || !w || !xc3Is(w) || src.zoneHit || src.dot || src.rx || src.echo || src.fromAlly || !G.player) return orig(e, src);
  const rr = xcR(w, 'range'), ur = xcR(w, 'upclose'); if (!rr && !ur) return orig(e, src);
  const d = Math.hypot(e.x - G.player.x, e.y - G.player.y);
  if (rr) {
    if (rr >= 4) return 1;
    const near = [300, 400, 520][rr - 1], floor = [0.65, 0.75, 0.85][rr - 1];
    return d <= near ? 1 : 1 - (1 - floor) * Math.min(1, (d - near) / Math.max(1, 800 - near));
  }
  const u = Math.min(3, ur), bonus = [0.4, 0.8, 1.2][u - 1], end = [180, 160, 140][u - 1], floor = [0.4, 0.35, 0.3][u - 1];
  return d <= 120 ? 1 + bonus : d <= end ? 1 : 1 - (1 - floor) * Math.min(1, (d - end) / (450 - end));
})(p11Range);

// One shot has hit e (after its damage; sigs.js projHit, before the engine decides whether the shot carries on).
projHit = (orig => function (pr, e) {
  orig(pr, e);
  if (pr && pr.xc3 && pr.w && G && xc3Is(pr.w) && !e.charmed) xc3Hit(pr, e);
})(projHit);
function xc3Hit(pr, e) {
  const w = pr.w, R = id => xcR(w, id), p = G.player, d = Math.hypot(e.x - p.x, e.y - p.y), S = xc3S();
  const si = xcIs(w, 'si');
  if (pr.pierce > 0 && pr.xc3PL) pr.dmg *= 1 - pr.xc3PL; // (Piercing: -15% an enemy)
  if (si) {
    if (R('range') >= 4 && pr.xc3Fly > 350 && !pr.xc3Shk) { pr.xc3Shk = 1; aoe(e.x, e.y, 60, pr.dmg * 0.5, msEcho(pr.src, { mwBoom: 1 }), w.def.color); } // the long shot lands with a shock ring
    if (R('upclose') >= 3 && d < 60 + e.r && !e.boss && !e.dead) { shove(e, p.x, p.y, 250); e.xcCan = { w, t: G.t + 0.6, f: 200, k: 0.4 }; }
    if (R('upclose') >= 4 && d < 60 + e.r && !pr.xc3OP) { pr.xc3OP = 1; pr.pierce += 1; } // Over-penetration
    if (R('rapid') >= 4 && xc3Spin(w) >= 0.999) msSlow(e, 0.6, 0.3); // Suppressing fire
    if (R('knock') && !e.boss && !e.dead) { // Billiards
      shove(e, pr.x - pr.vx, pr.y - pr.vy, 150 * xc3R3(w, 'knock'));
      e.xc3Bil = { w, t: G.t + 0.6, depth: xc3R3(w, 'knock'), idx: 1, f: 150 * xc3R3(w, 'knock'), m: R('knock') >= 4 };
      if (!S.bil.includes(e)) { S.bil.push(e); if (S.bil.length > 24) S.bil.shift(); }
    }
    if (R('pull') >= 4 && !(e.xc3YkT > G.t)) { e.xc3YkT = G.t + 0.5; let n = 0; forNear(e.x, e.y, 100 * xcArea(w), o => { if (o === e || o.charmed || n++ > 10) return; mwPull(o, e.x, e.y, 60); }); ring(e.x, e.y, 100 * xcArea(w), w.def.color, 0.3, 2); } // the impact yanks
    if (R('sticky') && !e.dead) { // Lodged
      const L = e.xc3Lg || (e.xc3Lg = { n: 0, w, t: 0 }); L.n = Math.min(5, L.n + 1); L.t = G.t; L.w = w;
      msSlow(e, L.n * xcLv([0.08, 0.12, 0.16, 0.16], R('sticky')), 2);
      if (R('sticky') >= 4 && L.n >= 5 && !(e.xc3LgS > G.t)) { e.xc3LgS = G.t + 3; msSnare(e, 1); ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 4); } // Dead weight
      if (!S.lodge.includes(e)) { S.lodge.push(e); if (S.lodge.length > 40) { const o = S.lodge.shift(); o.xc3Lg = null; } }
    }
    if (pr.xc3Kn && !e.boss && !e.dead) { shove(e, p.x, p.y, 250); }
    if (R('focus') >= 4 && !pr.xc3FP && msFocusFull(w)) { pr.xc3FP = 1; pr.pierce += 1; } // at full ramp, through its target
    if (R('connecting') && !e.dead) xc3Staple(w, e);
    if (xcArea(w) > 1) { const RR = 40 * xcArea(w), src = Object.assign({}, pr.src, { mwBoom: 1, noRx: true }); forNear(e.x, e.y, RR, o => { if (o !== e && !o.charmed) damageEnemy(o, pr.dmg * 0.3, src); }); ring(e.x, e.y, RR, w.def.color, 0.25, 2); } // Wide load: a ring
  } else {
    let n = 0; // Bleed stacks this needle adds
    if (pr.xc3Chg) n += pr.xc3Chg;
    if (pr.xc3Nth) n += 3;
    if (R('upclose') && d < 120 + e.r) n += xc3R3(w, 'upclose');
    if (R('range') >= 4 && pr.xc3Fly > 300) n += 1; // double Bleed
    if (pr.xc3Stk) n += 1;
    if (n) xc3Bleed(e, pr.dmg, n);
    if (R('upclose') >= 4 && d < 60 + e.r && !pr.xc3Tw && !e.dead) { pr.xc3Tw = 1; damageEnemy(e, pr.dmg, pr.src); } // point-blank: hits twice
    if (R('knock') && !e.boss && !e.dead) { // a flinch that stacks on the same target
      e.xc3Fl = e.xc3FlW === w && G.t - (e.xc3FlT || -9) < 1 ? Math.min(5, (e.xc3Fl || 0) + 1) : 1; e.xc3FlW = w; e.xc3FlT = G.t;
      shove(e, p.x, p.y, 50 * xc3R3(w, 'knock') * e.xc3Fl);
      if (R('knock') >= 4) { w.xc3Kn5 = (w.xc3Kn5 || 0) + 1; if (w.xc3Kn5 % 5 === 0) { e.xcHeldT = G.t + 1; e.xcHX = e.x; e.xcHY = e.y; ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 3); } } // pinned
    }
    if (R('pull') && !e.dead) mwPull(e, p.x, p.y, 30 * xc3R3(w, 'pull')); // tugged towards you
    if (pr.xc3Sti) { if (pr.xc3StL && !pr.xc3StL.dead && pr.xc3StL !== e) xc3Stitch(pr.xc3StL, e); pr.xc3StL = e; }
    if (R('connecting') && !e.dead) xc3Thread(w, e);
    if (R('explode') && !pr.xc3Frag && !(e.xc3BmT > G.t)) xc3Burst(w, pr, e);
    if (xcArea(w) > 1) { const RR = 35 * xcArea(w); forNear(e.x, e.y, RR, o => { if (!o.charmed) xc3Bleed(o, pr.dmg, 1); }); fxParts('drop', e.x, e.y, XC3_BLOOD, 6, RR * 2.5, 0.4, 2.5); ring(e.x, e.y, RR, XC3_BLOOD, 0.25, 2); } // Blood mist
    if (pr.xc3All || (R('focus') >= 4 && msFocusFull(w))) xc3BleedAll(e, w);
  }
  if (pr.xc3B > 0) xc3Bounce(pr, e); // Ricochet
}
// Ricochet: off the enemy at the true reflection angle (never dead straight back).
function xc3Bounce(pr, e) {
  let nx = pr.x - e.x, ny = pr.y - e.y; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
  const sp = Math.hypot(pr.vx, pr.vy) || 1, ix = pr.vx / sp, iy = pr.vy / sp;
  const off = angDiff(Math.atan2(ny, nx), Math.atan2(-iy, -ix));
  if (Math.abs(off) < 0.3) { const a = Math.atan2(-iy, -ix) + (off < 0 ? -0.3 : 0.3); nx = Math.cos(a); ny = Math.sin(a); }
  const dot = ix * nx + iy * ny, rx = ix - 2 * dot * nx, ry = iy - 2 * dot * ny;
  pr.vx = rx * pr.speed; pr.vy = ry * pr.speed; pr.x = e.x + nx * (e.r + pr.r + 1); pr.y = e.y + ny * (e.r + pr.r + 1);
  pr.xc3B--; pr.pierce += 1; pr.dmg *= 1 - pr.xc3BL; pr.life = Math.max(pr.life, 0.6); pr.xc3Bn = (pr.xc3Bn || 0) + 1;
  spawnPart(pr.x, pr.y, pr.color, 3, 70, 0.2, 2);
  if (pr.xc3BH) { for (const o of pr.xc3BH) if (!o.dead) xc3Bleed(o, pr.dmg, 1); if (pr.xc3BH.length < 12) pr.xc3BH.push(e); } // each bounce Bleeds what it hit before
}
// Exploding Rounds on Little Prick: from inside the target after 0.5 s (the mastery sprays 4 needles).
function xc3Burst(w, pr, e) {
  e.xc3BmT = G.t + 0.5;
  const r = xcR(w, 'explode'), R = [40, 60, 80, 80][r - 1], k = [0.4, 0.6, 0.8, 0.8][r - 1], dmg = pr.dmg * k, src = Object.assign({}, pr.src, { mwBoom: 1, noRx: true });
  ring(e.x, e.y, e.r + 4, XC3_BLOOD, 0.5, 2);
  after(0.5, () => {
    if (!G || !xc3Live(w)) return;
    const x = e.x, y = e.y;
    aoe(x, y, R, dmg, src, XC3_BLOOD);
    if (r >= 4) for (let i = 0; i < 4; i++) spawnProj(w, x, y, i / 4 * TAU + Math.random(), Object.assign({}, src, { mult: (src.mult || 1) * 0.25 }), { noMods: true, xc3Frag: 1, life: 0.45, hits: [e.id] });
  });
}

// ---------------------------------------------------------------- links: staples, Blood threads, stitches
function xc3Staple(w, e) { // Connecting on Standard Issue
  const S = xc3S(), r = xcR(w, 'connecting'), life = r >= 2 ? 5 : 3, mine = S.st.filter(L => L.w === w && (L.a === e || L.b === e) && L.t > G.t);
  let g = mine.length ? mine[0].g : 0;
  const size = g ? new Set(S.st.filter(L => L.g === g && L.t > G.t).flatMap(L => [L.a, L.b])).size : 1;
  const want = r >= 4 && g ? (size < 4 ? 1 : 0) : !mine.length ? (r >= 3 ? 2 : 1) : 0; // (the mastery: a stapled enemy hit again staples on, 4 in a line)
  if (!want) { for (const L of mine) L.t = Math.max(L.t, G.t + 1); return; }
  const not = [e]; for (const L of S.st) if (L.g && L.g === g) not.push(L.a, L.b);
  g = g || (S.gid = (S.gid || 0) + 1);
  for (let i = 0; i < want; i++) {
    const o = msNear(e.x, e.y, 100, not); if (!o || o.charmed) break; not.push(o);
    if (S.st.length >= 12) S.st.shift();
    S.st.push({ a: e, b: o, w, t: G.t + life, g }); ring(o.x, o.y, o.r + 4, w.def.color, 0.25, 2);
  }
}
function xc3Thread(w, e) { // Connecting on Little Prick
  const S = xc3S(), r = xcR(w, 'connecting'), mine = S.th.filter(L => L.w === w && (L.a === e || L.b === e) && L.t > G.t);
  if (mine.length >= (r >= 2 ? 2 : 1)) return;
  const o = msNear(e.x, e.y, 140, [e, ...mine.map(L => (L.a === e ? L.b : L.a))]); if (!o || o.charmed) return;
  if (S.th.length >= 12) { const q = S.th.shift(); xc3ThCount(q, -1); }
  const L = { a: e, b: o, w, t: G.t + 3 }; S.th.push(L); xc3ThCount(L, 1);
}
const xc3ThCount = (L, k) => { L.a.xc3Th = Math.max(0, (L.a.xc3Th || 0) + k); L.b.xc3Th = Math.max(0, (L.b.xc3Th || 0) + k); };
function xc3ThreadPass(e, n, dmg) { // Lv 3: threads pass new Bleed stacks along
  if (!e.xc3Th || !G.xc3 || xc3ThreadPass.busy) return;
  xc3ThreadPass.busy = 1;
  try { for (const L of G.xc3.th) if (L.t > G.t && xcR(L.w, 'connecting') >= 3 && (L.a === e || L.b === e)) xc3Bleed(L.a === e ? L.b : L.a, dmg, n, true); } finally { xc3ThreadPass.busy = 0; }
}
function xc3Stitch(a, b) { // Piercing mastery on Little Prick: the needle stitches what it passes together (2 s)
  const S = xc3S(); if (S.sti.length >= 12) S.sti.shift();
  S.sti.push({ a, b, t: G.t + 2 });
}
const xc3Spin = w => (xcR(w, 'rapid') && G.t - (w.xc3LastF || -9) < 1 ? Math.min(1, (G.t - (w.xc3SpS || G.t)) / 3) : 0);

// ---------------------------------------------------------------- hits from any source, damage, detonations, allies
wupHit = (orig => function (e, res, src) {
  orig(e, res, src);
  const w = src && src.w;
  if (!G || !w || src.dot || src.echo) return;
  if (res && xcIs(w, 'si') && xcR(w, 'catalyst') >= 4 && !src.rx && !src.mwDet) res.heavy = true; // every pellet is a heavy hit for reactions
  if (e.bleeds && e.bleeds.length && !e.dead && !(e.xc3CatT > G.t)) { // Catalyst mastery on Little Prick: any of your weapons adds a stack
    const lw = G.weapons.find(x => x && xcIs(x, 'lp') && xcR(x, 'catalyst') >= 4);
    if (lw) { e.xc3CatT = G.t + 0.3; xc3Bleed(e, lw.s.dmg, 1); }
  }
})(wupHit);
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const w = src && src.w;
  if (G && w && !src.dot && xcIs(w, 'si') && xcR(w, 'kinship') >= 4 && xc3Kin(w) >= 2 && fightCd(e).def === 'squishy') k /= 1 - COMBAT.squishyForceCut; // Full family: Squishy's cut is ignored
  return k;
})(wupDmgMul);
mwDetonate = (orig => function (e, pw, M) {
  orig(e, pw, M);
  if (!G || !pw || !xc3Live(pw) || !xc3Is(pw)) return;
  const r = xcR(pw, 'primer'); if (r < 3) return;
  if (xcIs(pw, 'lp')) { xc3Bleed(e, pw.s.dmg, 2); if (r >= 4) xc3BleedAll(e, pw); return; }
  const R = (r >= 2 ? 60 : 40) * xcArea(pw); // Standard Issue: detonations knock back (the mastery: into their mates)
  forNear(e.x, e.y, R, o => { if (o.charmed || o.boss) return; shove(o, e.x, e.y, 180); if (r >= 4) o.xcCan = { w: pw, t: G.t + 0.6, f: 150, k: 0.4 }; });
})(mwDetonate);
XC_LIFE.si = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5); XC_LIFE.lp = XC_LIFE.si;
XC_RUN.si = function (z, dt) { // Human shield: follows you and soaks enemy shots; it does not attack
  const w = z.xcRun.w, r = xcR(w, 'turncoat'), p = G.player;
  if (!z.xc3Init) { z.xc3Init = 1; if (r >= 3) { z.hp *= 1.5; z.maxHp *= 1.5; } }
  if (z.xcRun.end <= G.t) { z.dead = true; spawnPart(z.x, z.y, w.def.color, 8, 80, 0.5); return; }
  const list = w.xc3Sh || [z], i = Math.max(0, list.indexOf(z)), foe = acquire('nearest', 400, p.x, p.y);
  const a = foe ? Math.atan2(foe.y - p.y, foe.x - p.x) : (p.face || 0);
  let tx, ty;
  if (r >= 4 && i < 3) { const k = i - (Math.min(3, list.length) - 1) / 2; tx = p.x + Math.cos(a) * 64 - Math.sin(a) * k * 30; ty = p.y + Math.sin(a) * 64 + Math.cos(a) * k * 30; } // the wall
  else { const b = a + (i % 2 ? 1 : -1) * 0.5 * Math.ceil(i / 2); tx = p.x + Math.cos(b) * 52; ty = p.y + Math.sin(b) * 52; }
  const dx = tx - z.x, dy = ty - z.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 170 * dt);
  z.x += dx / d * st; z.y += dy / d * st;
  for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - z.x, b.y - z.y) < z.r + (b.r || 3) + 4) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 50, 0.2); }
  if (r >= 4 && i < 3) forNear(z.x, z.y, z.r + 6, o => { if (o === z || o.charmed || o.boss || o.xc3WlT > G.t) return; o.xc3WlT = G.t + 0.3; shove(o, z.x, z.y, 140); }); // the wall blocks
};
XC_RUN.lp = function (z) { // Blood brother: fights for you (arsenal.js allyAI); its hits Bleed (below)
  if (z.xcRun.end > G.t) return;
  z.dead = true; spawnPart(z.x, z.y, XC3_BLOOD, 8, 80, 0.5);
};
allyAI = (orig => function (e, dt) {
  const tag = e.xcRun && e.xcRun.tag;
  if (tag === 'si') { e.x += e.kx * dt; e.y += e.ky * dt; const kd = Math.pow(0.02, dt); e.kx *= kd; e.ky *= kd; return; } // (the shield moves in XC_RUN.si)
  if (tag !== 'lp') return orig(e, dt);
  const was = e.atkCd || 0, t = e.allyT, alive = t && !t.dead;
  orig(e, dt);
  const w = e.xcRun.w, hit = t && e.atkCd === 0.5 && was !== 0.5; // (allyAI has just struck)
  if (hit && xc3Live(w)) {
    if (!t.dead) xc3Bleed(t, e.maxHp * 0.2, 1 + (xcR(w, 'turncoat') >= 3 ? 1 : 0));
    else if (alive && xcR(w, 'turncoat') >= 4 && !t.elite && !t.boss && !t.rival && !t.egg && !t.charmed && !t.mwAllyOf) xcRise(w, t); // its kills rise too
  }
})(allyAI);

// ---------------------------------------------------------------- every frame
function xc3Tick(w, dt) {
  const R = id => xcR(w, id), p = G.player;
  if (R('rapid') && G.t - (w.xc3LastF || -9) < 1) w.cd -= dt * xcLv([0.25, 0.5, 0.75, 1], R('rapid')) * xc3Spin(w); // Minigun: spins up on one target
  if (R('turncoat')) w.xc3Sh = G.enemies.filter(z => z.xcRun && z.xcRun.w === w && !z.dead); else w.xc3Sh = null;
  if (w.xc3Orbs) { // Orbiting: which pellets stay in orbit
    w.xc3Orbs = w.xc3Orbs.filter(q => !q.dead && q.xc3Orb);
    const r = R('orbiting'), lp = xcIs(w, 'lp'), done = w.xc3Orbs.filter(q => q.xc3Orb.left <= 0);
    if (lp) done.forEach((q, i) => { q.xc3Orb.stay = r >= 3 && i < 3; });
    else if (r >= 4) {
      done.forEach((q, i) => { q.xc3Orb.stay = i >= done.length - 6; });
      const o = !(w.xc3RelT > G.t) && xcFoe(p.x, p.y, 160);
      const q = o && done.find(u => u.xc3Orb.stay && !u.xc3Orb.go); if (q) { q.xc3Orb.go = o; w.xc3RelT = G.t + 0.25; }
    }
  }
}
XC_TICK.si = xc3Tick; XC_TICK.lp = xc3Tick;
function xc3Shared(dt) {
  const S = G.xc3; if (!S) return;
  // Staples: stapled enemies are held together, and a shove on one drags the other
  S.st = S.st.filter(L => L.t > G.t && !L.a.dead && !L.b.dead && xc3Live(L.w));
  for (const L of S.st) {
    const a = L.a, b = L.b, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, want = a.r + b.r + 4;
    if (d > want) {
      const m = Math.min((d - want) / 2, 300 * dt), ux = dx / d, uy = dy / d;
      const ka = a.boss ? 0 : b.boss ? 2 : 1, kb = b.boss ? 0 : a.boss ? 2 : 1;
      if (!(G.lvl && lvSolidAt(a.x + ux * m * ka, a.y + uy * m * ka))) { a.x += ux * m * ka; a.y += uy * m * ka; }
      if (!(G.lvl && lvSolidAt(b.x - ux * m * kb, b.y - uy * m * kb))) { b.x -= ux * m * kb; b.y -= uy * m * kb; }
    }
    if (!a.boss && !b.boss) { const kx = (a.kx + b.kx) / 2, ky = (a.ky + b.ky) / 2; a.kx = b.kx = kx; a.ky = b.ky = ky; }
  }
  // Blood threads: Bleeding on one ticks on both; the mastery passes a dying enemy's stacks on
  const keep = [];
  for (const L of S.th) {
    const dead = L.a.dead || L.b.dead;
    if (dead && xc3Live(L.w) && xcR(L.w, 'connecting') >= 4) { const [x, y] = L.a.dead ? [L.a, L.b] : [L.b, L.a]; if (!y.dead && x.bleeds) for (const s of x.bleeds) xc3Bleed(y, s.dps * 10, 1, true); }
    if (dead || L.t <= G.t || !xc3Live(L.w)) { xc3ThCount(L, -1); continue; }
    keep.push(L);
    for (const [x, y] of [[L.a, L.b], [L.b, L.a]]) {
      if (!x.bleeds || !x.bleeds.length || y.dead) continue;
      let s = 0; for (const b of x.bleeds) s += b.dps;
      if (s > 0) damageEnemy(y, s * dt, { elem: 'arcane', dot: true, noCrit: true, noStatus: true, noArc: true, w: L.w, wname: 'Little Prick (thread)' });
    }
  }
  S.th = keep;
  // Stitches: drawn together for 2 s
  S.sti = S.sti.filter(L => L.t > G.t && !L.a.dead && !L.b.dead);
  for (const L of S.sti) if (Math.hypot(L.a.x - L.b.x, L.a.y - L.b.y) > L.a.r + L.b.r + 6) { mwPull(L.a, L.b.x, L.b.y, 90 * dt); mwPull(L.b, L.a.x, L.a.y, 90 * dt); }
  // Lodged pellets: when the enemy dies they pop out and shove its neighbours
  S.lodge = S.lodge.filter(e => {
    const L = e.xc3Lg; if (!L) return false;
    if (e.dead) {
      if (xc3Live(L.w)) { forNear(e.x, e.y, 60 + e.r, o => { if (o !== e && !o.charmed) shove(o, e.x, e.y, 150); }); fxParts('shard', e.x, e.y, '#cfd3da', 2 * L.n, 160, 0.4, 2.5); }
      e.xc3Lg = null; return false;
    }
    if (G.t - L.t > 6) { e.xc3Lg = null; return false; }
    return true;
  });
  // Billiards: a shoved enemy shoves what it runs into (40%), a chain 1 / 2 / 3 deep; the 4th breaks the rack
  S.bil = S.bil.filter(e => {
    const B = e.xc3Bil; if (!B || e.dead || B.t <= G.t || !xc3Live(B.w)) { e.xc3Bil = null; return false; }
    const o = msNear(e.x, e.y, e.r + 3, [e]); if (!o || o.charmed) return true;
    e.xc3Bil = null;
    damageEnemy(o, B.w.s.dmg * 0.4, msEcho(weaponSrc(B.w))); ring((e.x + o.x) / 2, (e.y + o.y) / 2, 10, B.w.def.color, 0.2, 2);
    if (!o.boss) shove(o, e.x, e.y, B.f * 0.8);
    if (B.depth > 1 && !o.boss) { o.xc3Bil = { w: B.w, t: G.t + 0.6, depth: B.depth - 1, idx: B.idx + 1, f: B.f * 0.8, m: B.m }; if (!S.bil.includes(o)) S.bil.push(o); }
    if (B.m && B.idx + 1 >= 4) { forNear(o.x, o.y, 80, q => { if (q !== o && !q.charmed) shove(q, o.x, o.y, 300); }); ring(o.x, o.y, 80, B.w.def.color, 0.35, 3); } // Break shot
    return false;
  });
  if (S.bil.length > 24) S.bil.length = 24;
  // Mines: fire at the first enemy to come near
  for (const m of S.mine) {
    if (m.end <= G.t || !xc3Live(m.w)) { m.end = 0; continue; }
    if (m.arm > G.t || m.next > G.t) continue;
    const o = xcFoe(m.x, m.y, 60); if (!o) continue;
    const w = m.w, r = xcR(w, 'mines'), ts = r >= 4 ? acquireMany('nearest', 220, m.x, m.y, 3) : [o], src = weaponSrc(w);
    for (const t of ts) { const pr = spawnProj(w, m.x, m.y, Math.atan2(t.y - m.y, t.x - m.x), src, { xc3MineP: 1 }); if (pr && xcIs(w, 'lp') && r >= 3) pr.xc3Stk = 1; }
    m.shots--; m.next = G.t + 0.4; if (m.shots <= 0) m.end = 0;
    ring(m.x, m.y, 10, w.def.color, 0.2, 2);
  }
  S.mine = S.mine.filter(m => m.end > G.t);
  // Craters: nudge enemies inwards
  S.cr = S.cr.filter(c => c.end > G.t && xc3Live(c.w));
  for (const c of S.cr) forNear(c.x, c.y, 70, o => { if (!o.charmed) mwPull(o, c.x, c.y, 40 * dt); });
  // Sticky mastery on Little Prick: a pinned, Bleeding enemy bleeds twice as fast
  for (const w of G.weapons) {
    if (!w || !xcIs(w, 'lp') || xcR(w, 'sticky') < 4) continue;
    for (const e of G.enemies) {
      if (e.dead || !(e.snareT > G.t) || e.msStuckBy !== w || !e.bleeds || !e.bleeds.length) continue;
      let d = 0; for (const b of e.bleeds) { d += b.dps * Math.min(dt, b.t); b.t -= dt; }
      if (d > 0) damageEnemy(e, d, { elem: 'arcane', dot: true, noCrit: true, noStatus: true, noArc: true, w, wname: 'Little Prick (bleeding)' });
    }
  }
}
wupTick = (orig => function (dt) { orig(dt); if (G && G.state === 'play') xc3Shared(dt); })(wupTick);

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const p = G.player, k = S_();
  ctx.save(); ctx.lineCap = 'round';
  for (const w of G.weapons) {
    if (!w || !xc3On(w)) continue;
    const c = col(w.def.color);
    if (xcR(w, 'charged') && w.s && w.s.cd > 0) { const u = clamp(1 - w.cd / w.s.cd, 0, 1); ctx.globalAlpha = 0.25 + 0.5 * u; ctx.strokeStyle = c; ctx.lineWidth = (1 + 2 * u) * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 9) * k, -Math.PI / 2, -Math.PI / 2 + u * TAU); ctx.stroke(); } // the wind-up
    const sp = xc3Spin(w); if (sp > 0.05) { ctx.globalAlpha = 0.6; ctx.strokeStyle = c; ctx.lineWidth = 2 * k; const a0 = G.realT * (6 + 14 * sp); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 14) * k, a0 + i * TAU / 3, a0 + i * TAU / 3 + 0.5 * sp); ctx.stroke(); } } // the spin
    if (w.xc3Sh) for (const z of w.xc3Sh) if (xcIs(w, 'si')) { ctx.globalAlpha = 0.55; ctx.strokeStyle = c; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), (z.r + 6) * k, 0, TAU); ctx.stroke(); } // human shields
  }
  const X = G.xc3;
  if (X) {
    ctx.lineWidth = 3 * k;
    for (const L of X.st) { ctx.globalAlpha = 0.8; ctx.strokeStyle = col(L.w.def.color); ctx.beginPath(); ctx.moveTo(sx(L.a.x), sy(L.a.y)); ctx.lineTo(sx(L.b.x), sy(L.b.y)); ctx.stroke(); } // staples
    ctx.lineWidth = 1.5 * k; ctx.strokeStyle = col(XC3_BLOOD);
    for (const L of X.th) { ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(sx(L.a.x), sy(L.a.y)); ctx.quadraticCurveTo(sx((L.a.x + L.b.x) / 2), sy((L.a.y + L.b.y) / 2) + 8 * k, sx(L.b.x), sy(L.b.y)); ctx.stroke(); } // Blood threads
    ctx.setLineDash([4 * k, 3 * k]);
    for (const L of X.sti) { ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.moveTo(sx(L.a.x), sy(L.a.y)); ctx.lineTo(sx(L.b.x), sy(L.b.y)); ctx.stroke(); } // stitches
    ctx.setLineDash([]);
    ctx.fillStyle = col('#cfd3da');
    for (const e of X.lodge) { const L = e.xc3Lg; if (!L || e.dead) continue; ctx.globalAlpha = 0.9; for (let i = 0; i < L.n; i++) { const a = i / 5 * TAU + 0.7; ctx.beginPath(); ctx.arc(sx(e.x + Math.cos(a) * e.r * 0.7), sy(e.y + Math.sin(a) * e.r * 0.7), 2 * k, 0, TAU); ctx.fill(); } } // lodged pellets
    for (const m of X.mine) { const c = col(m.w.def.color); ctx.globalAlpha = m.arm > G.t ? 0.4 : 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 4 * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.18; ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 60 * k, 0, TAU); ctx.stroke(); } // pellet mines, needle traps
    for (const q of X.cr) { ctx.globalAlpha = 0.35 * Math.min(1, q.end - G.t); ctx.strokeStyle = col(q.w.def.color); ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 30 * k, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 70 * k, 0, TAU); ctx.globalAlpha *= 0.4; ctx.stroke(); } // craters
  }
  ctx.restore();
})(modDraw);
