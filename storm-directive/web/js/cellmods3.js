'use strict';
// Spawn Prawn - weapon cells, part 3: Red Flagship, Soulmate Signal, Spark of Life, Maximum Gains and Enzyme Sneeze
// (redesign docs/MODIFIER_MATRIX.md 5.9; Claude's design, built 24 Oct). Same engine as cellmods.js (XC_W masking, no fork
// screens, card text TODO_COPY:cell_<tag>_<modifier> filled by cellcopy.js where written).
//  - Where the shared form of a modifier already does what the cell says, it is kept and the cell adds its twist (Range,
//    Catalyst, Kinship, Primer, Area everywhere; Ricochet, Focus, Extra, Orbiting and Death from Above on Red Flagship;
//    Orbiting, Focus, Death from Above on Spark of Life; Up Close, Rapid Fire, Sticky, Piercing, Homing, Focus on the
//    two spreads). Everything else is replaced (XC_W[id].mask) by the code below.
//  - BEAM LINES (xcLine): Red Flagship and Spark of Life are a line from you to their target while firing; Soulmate
//    Signal is the line from you to its twin (toys.js twinTick). Line effects (pull, cling, slide, crackle) read it.
//  - FANS: Maximum Gains and Enzyme Sneeze pellets are tagged per fan as they are fired (spawnProj wrapped; pr.xcFan).
// Simplified for now: Soulmate's Heartbeat pulses the beam's damage (not its look); Charge arcs that "complete a circuit"
// jump to each Static weapon's target in turn; Pollen Pods make the passer burst acid round itself.
// Hooks: none in shared files. Adds XC_W entries and fills XC_TICK / XC_FIRE / XC_STATS / XC_RUN / XC_LIFE; wraps
// spawnProj, wupHit, wupKill, wupDmgMul, modDraw. Loads after cellmods2.js.

const XC3_IDS = { v_shock_beam: 'rf', s_twin: 'ss', acro_spark: 'sp', v_phys_spread: 'mg', acro_spray: 'es' };
{
  const ALL = ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'];
  const keep = { // shared forms kept (the cell adds to them)
    rf: ['range', 'rapid', 'catalyst', 'kinship', 'ricochet', 'focus', 'primer', 'extra', 'orbiting', 'area', 'dfa'],
    ss: ['range', 'catalyst', 'kinship', 'primer', 'area'],
    sp: ['range', 'rapid', 'catalyst', 'kinship', 'primer', 'area', 'orbiting', 'focus', 'dfa'],
    mg: ['range', 'upclose', 'rapid', 'catalyst', 'kinship', 'sticky', 'piercing', 'homing', 'focus', 'primer'],
    es: ['range', 'upclose', 'rapid', 'catalyst', 'kinship', 'sticky', 'piercing', 'homing', 'focus', 'primer'],
  };
  for (const id in XC3_IDS) {
    const tag = XC3_IDS[id], beam = ['rf', 'ss', 'sp'].includes(tag);
    XC_W[id] = { tag, cells: ALL.slice(), mask: ALL.filter(m => !keep[tag].includes(m)), deny: ['ranged'], atkOk: beam ? ['upclose'] : ['ricochet', 'orbiting'] };
  }
  Object.assign(XC_ALT, { v_shock_beam: ['phys'], s_twin: ['arcane'], acro_spark: ['shock'], v_phys_spread: ['shock'], acro_spray: ['ice'] });
  Object.assign(MM_SAB, { s_twin: 'arcane', acro_spark: 'shock', acro_spray: 'ice' });
}
const xc3 = (w, tag) => xcIs(w, tag) && xcAny(w);
const xcCharged = e => e.chargeT > G.t;
const xcSrcOf = (w, extra) => Object.assign(weaponSrc(w), extra || {});
const xcSegD = (x1, y1, x2, y2, e) => { const vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((e.x - x1) * vx + (e.y - y1) * vy) / l2)); return { d: Math.hypot(e.x - (x1 + vx * t), e.y - (y1 + vy * t)), t }; };
// The beam's line right now (null when it isn't firing).
function xcLine(w) {
  const p = G.player, s = w.s;
  if (xcIs(w, 'ss')) { const t = w.twins && w.twins[0]; return t ? { x1: p.x, y1: p.y, x2: t.x, y2: t.y, wd: s.width || 10 } : null; }
  const t = w.curTarget; if (!t || t.dead || G.t - (w.firedT || -9) > 0.25) return null;
  const a = Math.atan2(t.y - p.y, t.x - p.x), L = s.range || 300;
  return { x1: p.x, y1: p.y, x2: p.x + Math.cos(a) * L, y2: p.y + Math.sin(a) * L, wd: s.width || 10, a, L };
}
const xcOnLine = (L, e, pad) => xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < e.r + (pad || L.wd);
const xcFoes = () => G.enemies.filter(e => !e.dead && !e.charmed && !e.egg);
function xcPE(w, e, k) { if (e && !e.dead && corroded(e)) damageEnemy(e, w.s.dmg * (k || 3), xcSrcOf(w, { elem: 'flame' })); } // (a Fire hit on a Corroded enemy: Premature Evaporation)

// ---------------------------------------------------------------- stats
XC_STATS.rf = XC_STATS.sp = XC_STATS.ss = function (w, s) {
  const R = id => xcR(w, id);
  if (xcIs(w, 'ss') && R('rapid')) s.dmg *= 1.15; // (Heartbeat: the beat carries the damage)
  if (R('extra') && !xcIs(w, 'rf')) { const n = 1 + xcLv([1, 2, 3, 6], R('extra')); s.dmg *= Math.pow(1 / n, 0.4); }
  if (R('area') && xcIs(w, 'ss')) s.width *= 1; // (Area widens beams already: areamod.js)
};
XC_STATS.mg = XC_STATS.es = function (w, s) {
  const R = id => xcR(w, id), mg = xcIs(w, 'mg');
  if (R('range')) s.spread *= 1 - 0.1 * Math.min(3, R('range')); // Choke / Projectile Sneeze: the fan tightens
  if (mg && R('rapid')) s.count = Math.max(2, (s.count || 1) - 3); // Reps: 3 fewer pellets
  if (R('charged')) { const k = xcLv([1.6, 1.9, 2.2, 2.2], R('charged')); s.cd += 0.5; s.dmg *= k; if (mg) s.spread = Math.min(s.spread, 0.35); else s.count = (s.count || 3) + Math.min(3, R('charged')); } // Deadlift / Ah... Ah...
  if (R('extra')) { const n0 = s.count || 1, add = mg ? xcLv([2, 2, 4, 4], R('extra')) : xcLv([1, 1, 3, 3], R('extra')); s.count = n0 + add; s.dmg *= Math.pow(n0 / s.count, 0.4); }
  if (R('kinship') && mg) s.count += Math.min(3, R('kinship')) * xcKin(w); // Gym Buddies
  if (R('kinship') >= 4 && !mg) s.count = Math.max(s.count, 5);
  if (R('area')) { s.size = (s.size || 4) * xcArea(w); s.spread *= 1 + 0.1 * Math.min(4, R('area')); }
  if (!mg && R('range') >= 4) { s.range = 400; s.spread *= 0.2; } // the long, narrow jet
  else if (!mg && R('range')) s.range = xcLv([190, 220, 250], R('range'));
};
const xcKin = w => G.weapons.filter(x => x && x !== w && !x.isSpell && x.def && mwType(x) === mwType(w)).length;

// ---------------------------------------------------------------- firing (true: the cell delivered it)
function xcFan(w, x, y, a, n, spread, src, over) {
  for (let i = 0; i < n; i++) { const b = n > 1 ? a + (i / (n - 1) - 0.5) * spread : a; spawnProj(w, x, y, b + rand(-0.03, 0.03), src, over); }
}
XC_FIRE.mg = XC_FIRE.es = function (w, t, src) {
  const R = id => xcR(w, id), s = w.s, p = G.player, mg = xcIs(w, 'mg'), S = xcS();
  w.xcFanN = (w.xcFanN || 0) + 1;
  if (R('melee')) { // Flex / Face Full: a swipe or a point-blank spray
    if (!t) return true;
    const a = Math.atan2(t.y - p.y, t.x - p.x), reach = mg ? xcLv([80, 100, 100, 100], R('melee')) : 60, arc = mg ? (R('melee') >= 2 ? 160 : 120) : (R('melee') >= 2 ? 120 : 90);
    w.xcFlex = (w.xcFlex || 0) + 1;
    const full = R('melee') >= 4 && w.xcFlex % 3 === 0, msrc = Object.assign({}, src, { atk: 'contact' });
    for (const e of xcFoes()) {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy); if (d > reach + e.r) continue;
      if (!full && Math.abs(angDiff(Math.atan2(dy, dx), a)) > arc * Math.PI / 360) continue;
      damageEnemy(e, s.dmg * (s.count || 3) * 0.5, msrc);
      if (!mg) { const c = fightCd(e); c.bars.acid = Math.min(0.99, c.bars.acid + 0.15); }
    }
    (G.v10fx || (G.v10fx = [])).push({ k: 'arc', x: p.x, y: p.y, a, r: reach, c: w.def.color, life: 0.15, max: 0.15 });
    if (full) ring(p.x, p.y, reach, w.def.color, 0.25, 4);
    if (mg) { p.vx -= Math.cos(a) * 80; p.vy -= Math.sin(a) * 80; } // (the recoil)
    return true;
  }
  if (R('mines')) { // Kettlebells / Pollen Pods
    const mine = (S.pods || (S.pods = [])).filter(q => q.w === w);
    if (mine.length < (R('mines') >= 2 ? 5 : 3)) S.pods.push({ w, x: p.x + rand(-20, 20), y: p.y + rand(-20, 20), end: G.t + 14, n: R('mines') >= 4 && !mg ? 2 : 1 });
    return true;
  }
  if (R('dfa')) { // Dumbbell Drop / Acid Rain
    if (!t) return true;
    const rr = (R('dfa') >= 2 ? (mg ? 90 : 80) : (mg ? 70 : 60)) * xcArea(w);
    (S.rain3 || (S.rain3 = [])).push({ w, x: t.x, y: t.y, r: rr, end: G.t + (mg ? 1 : (R('dfa') >= 3 ? 2 : 1)), next: 0, walk: mg && R('dfa') >= 4 ? Math.atan2(t.y - p.y, t.x - p.x) : null, follow: !mg && R('dfa') >= 4 });
    G.fx.push({ type: 'warn', x: t.x, y: t.y, r: rr, color: w.def.color, life: 0.4, max: 0.4 });
    return true;
  }
  if (R('orbiting')) { // Spin Class / Holding It In: the pellets circle you first
    if (!t) return true;
    const n = s.count || 3, turns = R('orbiting') >= 2 ? 2 : 1;
    if (R('orbiting') >= 4) { w.xcSpin = { n: Math.max(6, n), until: G.t + 0.1 }; if (!mg) w.xcMist = 1; return true; } // (the ring stays: drawn and run in the tick)
    for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU, src, { orbitT: turns * (TAU / 6), oa: i / n * TAU, orad: 50, xcOrbFan: 1 });
    return true;
  }
  if (!t) return false;
  const a0 = Math.atan2(t.y - p.y, t.x - p.x);
  // Rapid Fire on Maximum Gains: fans alternate left and right; every 10th rep fires the skipped pellets
  if (mg && R('rapid')) {
    w.xcSide = -(w.xcSide || 1);
    let a = a0 + w.xcSide * s.spread * 0.25;
    if (R('rapid') >= 4 && w.xcFanN % 10 === 0) { xcFan(w, p.x, p.y, a0, 3 * 9, s.spread * 1.4, src); return true; } // Burnout Set
    xcFan(w, p.x, p.y, a, s.count, s.spread, src); return true;
  }
  if (!mg && R('rapid') >= 4 && w.xcFanN % 4 === 0) { for (let k = 1; k <= 2; k++) after(0.15 * k, () => { if (G && G.weapons.includes(w)) xcFan(w, G.player.x, G.player.y, a0, s.count, s.spread, src); }); } // Sneezing Fit
  if (R('nth')) { // Personal Best / The Big One
    const N = R('nth') >= 2 ? 3 : 4;
    if (w.xcFanN % N === 0) {
      if (R('nth') >= 4) { xcFan(w, p.x, p.y, a0, mg ? 16 : 10, TAU * (1 - 1 / 16), src); return true; }
      xcFan(w, p.x, p.y, a0, mg ? s.count * 2 : 6, s.spread * (R('nth') >= 3 && mg ? 1.5 : 1), src, !mg && R('nth') >= 3 ? { xcPool: 1 } : null);
      return true;
    }
  }
  if (R('extra') >= 2 && R('extra') < 4) { const n = Math.max(2, Math.round((s.count || 3) / 2)); xcFan(w, p.x, p.y, a0 + Math.PI, n, s.spread, src); } // a smaller fan behind you
  if (R('extra') >= 4) { for (const k of [0, 1, 2, 3]) xcFan(w, p.x, p.y, a0 + k * Math.PI / 2, s.count, s.spread, src); return true; } // front, back and both sides
  if (R('pull') >= 4 || (!mg && R('pull'))) { // Sniff / Net: the front row is drawn in before the shot lands
    const reach = mg ? 160 : xcLv([120, 140, 160, 320], R('pull')), f = mg ? 80 : xcLv([30, 50, 70, 70], R('pull'));
    for (const e of xcFoes()) { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy); if (d < reach && Math.abs(angDiff(Math.atan2(dy, dx), a0)) < s.spread) { const cx = p.x + Math.cos(a0) * d, cy = p.y + Math.sin(a0) * d; mwPull(e, cx, cy, f); } }
  }
  if (!mg && R('upclose') >= 4 && Math.hypot(t.x - p.x, t.y - p.y) < 60) { aoe(t.x, t.y, 50, s.dmg * (s.count || 3) * 1.2, src, w.def.color); return true; } // one heavy splash
  if (mg && R('range') >= 4) { spawnProj(w, p.x, p.y, a0, src, { dmg: s.dmg * (s.count || 5), r: (s.size || 4) * 2.5, pierce: 3 }); return true; } // the Slug
  return false;
};
XC_FIRE.rf = XC_FIRE.sp = function (w, t, src) {
  const R = id => xcR(w, id), p = G.player, s = w.s, S = xcS();
  if (R('melee') && xcIs(w, 'rf')) { // Live Wire: a whip
    if (!t || w.xcWhipT > G.t) return true;
    w.xcWhipT = G.t + (R('melee') >= 3 ? 0.3 : 0.4);
    const a = Math.atan2(t.y - p.y, t.x - p.x), reach = R('melee') >= 2 ? 110 : 90, hit = [];
    for (const e of xcFoes()) { const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy); if (d < reach + e.r && Math.abs(angDiff(Math.atan2(dy, dx), a)) < 70 * Math.PI / 180) { damageEnemy(e, s.dmg * 4, Object.assign({}, src, { atk: 'contact' })); hit.push(e); } }
    if (R('melee') >= 4) for (const e of hit.filter(xcCharged)) { let cur = e; for (let k = 0; k < 4; k++) { const o = xcFoe(cur.x, cur.y, 120, hit); if (!o) break; bolt(cur.x, cur.y, o.x, o.y, w.def.color, 0.12); damageEnemy(o, s.dmg * 2, src); hit.push(o); cur = o; } }
    (G.v10fx || (G.v10fx = [])).push({ k: 'arc', x: p.x, y: p.y, a, r: reach, c: w.def.color, life: 0.15, max: 0.15 });
    return true;
  }
  if (R('melee') && xcIs(w, 'sp')) { // Blowtorch: a short, thick flame
    if (!t || Math.hypot(t.x - p.x, t.y - p.y) > (R('melee') >= 2 ? 80 : 60) + t.r) return true;
    const k = R('melee') >= 3 ? 1.9 : 1.6;
    for (const e of xcFoes()) if (Math.hypot(e.x - p.x, e.y - p.y) < (R('melee') >= 2 ? 80 : 60) + e.r && Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), Math.atan2(t.y - p.y, t.x - p.x))) < 0.5) { damageEnemy(e, s.dmg * k, src); if (R('melee') >= 4) xcPE(w, e, 6); }
    (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: t.x, y2: t.y, w: (s.width || 8) * 2.5, c: w.def.color, t: 'flame', life: 0.12, max: 0.12 });
    return true;
  }
  if (R('mines')) { // Electric Fence posts / Pilot Lights
    const mine = (S.posts || (S.posts = [])).filter(q => q.w === w);
    if (mine.length < (R('mines') >= 2 ? 5 : 3) && !(w.xcPostT > G.t)) { w.xcPostT = G.t + 1; S.posts.push({ w, x: p.x, y: p.y, end: G.t + 20 }); }
    return true;
  }
  if (R('charged') && xcIs(w, 'rf')) { // Capacitor: the first 0.3 s after a rest is a surge
    if (G.t - (w.firedT || -9) > 0.6) w.xcSurge = G.t + 0.3;
    if (w.xcSurge > G.t) src.mult = (src.mult || 1) * (1 + xcLv([1, 1.5, 2, 2], R('charged')));
    if (w.xcSurge > G.t && R('charged') >= 4 && t) { const L = xcLine(w) || { x1: p.x, y1: p.y, x2: t.x, y2: t.y, wd: s.width || 10 }; for (const e of xcFoes()) if (xcOnLine(L, e)) e.chargeT = G.t + 3; }
  }
  if (R('charged') && xcIs(w, 'sp')) { // Pilot Light: idles small, then roars for 0.6 s
    w.xcRoarN = (w.xcRoarN || 0) + 1;
    const cyc = w.xcRoarN % 20; // (2 s cycles at the beam's 0.1 s rate)
    if (cyc < 6) { src.mult = (src.mult || 1) * (1 + xcLv([0.6, 0.9, 1.2, 1.2], R('charged'))); if (cyc === 0 && R('charged') >= 4 && t) for (const e of xcFoes()) if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), Math.atan2(t.y - p.y, t.x - p.x))) < 0.12 && Math.hypot(e.x - p.x, e.y - p.y) < s.range) xcPE(w, e); }
    else src.mult = (src.mult || 1) * 0.3;
  }
  if (R('nth')) { // Red Flag / Backdraft: every 4th on-phase
    if (G.t - (w.firedT || -9) > 0.3) w.xcOnN = (w.xcOnN || 0) + 1, w.xcNthT = (w.xcOnN % (R('nth') >= 2 ? 3 : 4) === 0) ? G.t + (R('nth') >= 3 ? 1 : 0.5) * (R('nth') >= 4 && xcIs(w, 'sp') ? 2 : 1) : 0;
    if (w.xcNthT > G.t) {
      if (xcIs(w, 'rf')) { src.mult = (src.mult || 1) * 1.5; if (t && !t.boss) stun(t, 0.5); if (R('nth') >= 4 && t) { const L = xcLine(w); if (L) for (const e of xcFoes()) if (xcOnLine(L, e)) e.chargeT = G.t + 3; } }
      else if (t && !w.xcBackT) { w.xcBackT = 1; for (const e of xcFoes()) if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), Math.atan2(t.y - p.y, t.x - p.x))) < 0.12) xcPE(w, e); }
    } else w.xcBackT = 0;
  }
  return false;
};
spawnProj = (orig => function (w, x, y, a, src, over) {
  const n = G.proj.length;
  const r = orig.apply(this, arguments);
  if (w && (xcIs(w, 'mg') || xcIs(w, 'es')) && G.proj.length > n) { const pr = G.proj[G.proj.length - 1]; if (pr.w === w) { pr.xcFan = w.xcFanN || 0; if (xcR(w, 'ricochet')) pr.xcB = XC_RAMP(xcR(w, 'ricochet')); } }
  return r;
})(spawnProj);

// ---------------------------------------------------------------- hits
function xc3Hit(e, res, src) {
  const w = src && src.w; if (!w || !G || src.xc3 || src.dot) return;
  const tag = xcDef(w) && xcDef(w).tag; if (!['rf', 'ss', 'sp', 'mg', 'es'].includes(tag) || !xcAny(w)) return;
  const R = id => xcR(w, id), s = w.s, p = G.player, x3 = Object.assign({}, src, { xc3: 1, noRx: true });
  // fans: count each enemy's pellets per fan
  if ((tag === 'mg' || tag === 'es') && src.wname !== 'Pellet') {
    const fan = w.xcFanN || 0;
    if (e.xcFanW !== w || e.xcFanI !== fan) { e.xcFanW = w; e.xcFanI = fan; e.xcFanH = 0; }
    e.xcFanH++;
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (tag === 'mg') {
      if (R('upclose') >= 4 && d < 60 && e.xcFanH === 1 && !e.boss) stun(e, 0.5);
      if (R('charged') >= 4 && d < 80 && e.xcFanH === 1 && !e.boss) stun(e, 1);
      if (R('knock') && d < 100 && !e.boss && e.xcFanH === 1) { const f = xcLv([200, 260, 320, 320], R('knock')); shove(e, p.x, p.y, f); if (R('knock') >= 4) e.xcCan = { w, t: G.t + 0.6, f, k: 0.4 }; } // Power Clean
      if (R('pull') && R('pull') < 4) { const a = Math.atan2(e.y - p.y, e.x - p.x); mwPull(e, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, 10 * R('pull')); }
      if (R('sticky') >= 4 && e.xcFanH >= (s.count || 5) * 0.8) msSnare(e, 1);
      if (R('catalyst') >= 4) e.xcStagK = 2;
    } else {
      if (R('upclose') && d < 120) { const c = fightCd(e); c.bars.acid = Math.min(0.99, c.bars.acid + 0.08); } // In Your Face: double Corrosion
      if (R('knock') && e.xcFanH === 1 && !e.boss) { shove(e, p.x, p.y, xcLv([160, 240, 320, 320], R('knock'))); if (R('knock') >= 4) e.xcCan = { w, t: G.t + 0.6, f: 160, k: 0.4 }; } // Bless You
      if (R('catalyst') >= 4 && corroded(e) && fightCd(e).layers > 0 && !(e.xcAllT > G.t)) { e.xcAllT = G.t + 1; const c = fightCd(e); c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; }
      if (R('sticky') >= 4) msSnare(e, 0.8);
      if (R('piercing')) e.xcCorT = G.t + 1; // keeps filling Corrosion for 1 s
      if (R('focus') >= 4 && e.xcFanH === 1 && e === w.curTarget && (typeof msFocusFull === 'function' && msFocusFull(w))) { const c = fightCd(e); if (c.layers > 0) { c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; } }
    }
    // Explode: Drop Set (centre pellets) / Splatter (merged bursts)
    if (R('explode')) {
      if (tag === 'mg' && (R('explode') >= 4 || (src.xcMid))) aoe(e.x, e.y, R('explode') >= 4 && e.xcFanH >= 3 ? 90 : 40, s.dmg * 0.8, x3, w.def.color);
      if (tag === 'es' && (e.xcFanH === 2 || R('explode') >= 4)) aoe(e.x, e.y, R('explode') >= 4 ? 40 : 50 + 10 * Math.min(3, R('explode')), s.dmg * 0.9, x3, w.def.color);
    }
    // Connecting: Clothesline (tie the fan's enemies) / Snot Web (share Corrosion)
    if (R('connecting')) { const F = w.xcTie && w.xcTie.fan === fan ? w.xcTie : (w.xcTie = { fan, list: [] }); if (!F.list.includes(e)) F.list.push(e); F.t = G.t + (tag === 'mg' ? (R('connecting') >= 2 ? 4 : 3) : 3); (G.xcTies || (G.xcTies = [])).includes(F) || G.xcTies.push(Object.assign(F, { w, tag })); }
    if (R('primer') >= 3 && e.mwPr && tag === 'mg') e.mwPr.xcN = (e.mwPr.xcN || 0) + 1;
  }
  if (tag === 'rf' || tag === 'sp' || tag === 'ss') {
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (tag === 'rf' && R('rapid') && !e.boss && xcCharged(e)) stun(e, 0.05); // Alternating Current: a twitch
    if (tag === 'rf' && R('upclose') >= 4 && d < 60 && !e.boss && !(e.xcShortT > G.t)) { e.xcShortT = G.t + 1; stun(e, 0.5); shove(e, p.x, p.y, 200); }
    if (tag === 'rf' && R('focus') >= 1 && typeof msFocusFull === 'function' && msFocusFull(w)) { e.chargeT = G.t + 3; if (R('focus') >= 4 && !(e.xcBrkT > G.t)) { e.xcBrkT = G.t + 1; for (const o of xcFoes()) if (o !== e && xcCharged(o) && Math.hypot(o.x - e.x, o.y - e.y) < 100) { bolt(e.x, e.y, o.x, o.y, w.def.color, 0.12); damageEnemy(o, s.dmg * 2, x3); } } }
    if (tag === 'sp' && R('rapid') && corroded(e)) { const o = xcFoe(e.x, e.y, 60, [e]); if (o && (R('rapid') >= 4 || !(e.xcPlugT > G.t))) { e.xcPlugT = G.t + 0.5; v10Burn(o, s.dmg, x3); } } // Spark Plug
    if (tag === 'sp' && R('focus') >= 4 && typeof msFocusFull === 'function' && msFocusFull(w) && corroded(e) && !(e.xcRoastT > G.t)) { e.xcRoastT = G.t + 1; xcPE(w, e); }
    if (tag === 'sp' && R('upclose') && d < 120) src.mult = src.mult; // (Blue Flame: damage in xc3Dmg)
    if (tag === 'sp' && R('catalyst') >= 4 && res && res.payoffs && res.payoffs.includes('evap')) { const c = fightCd(e); c.bars.acid = Math.max(c.bars.acid, 0.5); }
    if (R('primer') >= 3 && tag === 'ss' && e.mwPr) e.xcSsPr = 1;
  }
}
wupHit = (orig => function (e, res, src) { orig(e, res, src); xc3Hit(e, res, src); })(wupHit);
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const w = src && src.w; if (!G || !w || !xcAny(w) || src.dot) return k;
  const tag = xcDef(w) && xcDef(w).tag, R = id => xcR(w, id), p = G.player, d = Math.hypot(e.x - p.x, e.y - p.y);
  if (tag === 'rf' && R('upclose') && d < 120) { k *= 1 + xcLv([0.4, 0.8, 1.2, 1.2], R('upclose')); e.chargeT = Math.max(e.chargeT || 0, G.t + 1.5); } // Short Circuit
  if (tag === 'sp' && R('upclose') && d < 120) k *= 1 + xcLv([0.4, 0.8, 1.2, 1.2], R('upclose')); // Blue Flame
  if (tag === 'ss') {
    if (R('range') && w.twins && w.twins[0]) k *= 1 + 0.3 * Math.min(1, Math.hypot(w.twins[0].x - p.x, w.twins[0].y - p.y) / Math.max(1, w.s.range)); // Long Distance Relationship
    if (R('upclose') && w.twins && w.twins[0] && Math.hypot(w.twins[0].x - p.x, w.twins[0].y - p.y) < 200) k *= 1 + xcLv([0.4, 0.8, 1.2, 1.2], R('upclose')); // Clingy
    if (R('charged') && w.xcStare > G.t) k *= 1 + xcLv([0.6, 0.9, 1.2, 1.2], R('charged')); // the surge after a Long Look
    if (R('rapid')) k *= w.xcBeat ? 1.6 : 0.6; // Heartbeat: the beats carry the damage
    if (R('focus')) { e.xcDev = (e.xcDevT > G.t - 0.5 ? e.xcDev || 0 : 0) + 0.05; e.xcDevT = G.t; k *= 1 + Math.min(xcLv([0.4, 0.8, 1.2, 1.2], R('focus')), e.xcDev); if (R('focus') >= 4 && e.xcDev >= 1.2) e.chargeT = G.t + 99; } // Devotion
    if (R('piercing')) { const c = fightCd(e); if (c.layers > 0) k *= 1 + 0.25 * Math.min(3, R('piercing')); if (R('piercing') >= 4 && c.mem > 0) c.mem = Math.max(0, c.mem - c.memMax * 0.05); } // Sees Right Through You
  }
  if (tag === 'rf' && R('piercing') && !src.xc3) { const L = xcLine(w); if (L) { const n = xcFoes().filter(o => xcOnLine(L, o) && Math.hypot(o.x - p.x, o.y - p.y) < d).length; k *= 1 + 0.1 * Math.min(3, R('piercing')) * n; } } // Series Circuit
  if ((tag === 'mg') && R('piercing') >= 4 && src.xcPassed) k *= 1 + 0.1 * src.xcPassed;
  return k;
})(wupDmgMul);

// ---------------------------------------------------------------- every frame
function xcBeamTick(w, dt) { // Red Flagship and Spark of Life
  const R = id => xcR(w, id), s = w.s, p = G.player, rf = xcIs(w, 'rf'), L = xcLine(w), t4 = !(w.xc3T > G.t), src = () => xcSrcOf(w, { xc3: 1 });
  if (t4) w.xc3T = G.t + 0.25;
  if (L) {
    if (R('pull')) { const reach = rf ? xcLv([40, 60, 80, 80], R('pull')) : xcLv([60, 90, 120, 999], R('pull')); for (const e of xcFoes()) { const q = xcSegD(L.x1, L.y1, L.x2, L.y2, e); if (q.d < reach + e.r && (rf || corroded(e) || q.d < reach * 0.5)) { const tx = L.x1 + (L.x2 - L.x1) * q.t, ty = L.y1 + (L.y2 - L.y1) * q.t; mwPull(e, tx, ty, (rf || !corroded(e) ? 60 : 120) * dt); if (rf && R('pull') >= 4) mwPull(e, p.x, p.y, 50 * dt); } } } // Electromagnet / Oxygen Draw
    if (R('knock')) for (const e of xcFoes()) if (!e.boss && xcOnLine(L, e) && (rf || xcBurning(e))) { const v = (rf ? xcLv([40, 80, 120, 120], R('knock')) : xcLv([30, 60, 90, 90], R('knock'))) * dt, ux = Math.cos(L.a), uy = Math.sin(L.a); e.x += ux * v; e.y += uy * v;
      if (R('knock') >= 4 && Math.hypot(e.x - p.x, e.y - p.y) > (L.L || 300) * 0.92 && !(e.xcRailT > G.t)) { e.xcRailT = G.t + 1.5; if (rf) { shove(e, p.x, p.y, 500); e.xcCan = { w, t: G.t + 0.8, f: 300, k: 0.6 }; } else { aoe(e.x, e.y, 50, s.dmg * 6, src(), w.def.color); } } } // Railgun / Updraft
    if (R('sticky')) for (const e of xcFoes()) if (xcOnLine(L, e)) { msSlow(e, rf ? xcLv([0.3, 0.5, 0.7, 0.7], R('sticky')) : 0.4, 0.3); if (rf && !e.boss) { const q = xcSegD(L.x1, L.y1, L.x2, L.y2, e); const tx = L.x1 + (L.x2 - L.x1) * q.t, ty = L.y1 + (L.y2 - L.y1) * q.t; mwPull(e, tx, ty, 80 * dt); }
      if (R('sticky') >= 4) { e.xcClung = (e.xcClungT > G.t - 0.1 ? e.xcClung || 0 : 0) + dt; e.xcClungT = G.t; if (e.xcClung >= 1 && !(e.snareT > G.t)) { msSnare(e, 1.5); if (rf) e.chargeT = G.t + 3; else xcPE(w, e); e.xcClung = 0; } } } // Static Cling / Melted Wax
    if (R('explode') && rf && w.curTarget && !(w.xcFlashT > G.t)) { // Arc Flash
      w.xcFlashT = G.t + xcLv([0.5, 0.4, 0.3, 0.3], R('explode')); const t = w.curTarget;
      aoe(t.x, t.y, 50, s.dmg * 3, src(), w.def.color); forNear(t.x, t.y, 50, o => { o.chargeT = G.t + 3; });
      if (R('explode') >= 4) for (const e of xcFoes()) if (xcOnLine(L, e)) { e.chargeT = G.t + 3; damageEnemy(e, s.dmg, src()); }
    }
    if (R('explode') && !rf && w.curTarget && corroded(w.curTarget) && w.xcFlashE !== w.curTarget) { w.xcFlashE = w.curTarget; const t = w.curTarget; aoe(t.x, t.y, 60, s.dmg * 3, xcSrcOf(w, { xc3: 1, elem: 'flame' }), w.def.color); if (R('explode') >= 4) after(0.25, () => G && aoe(t.x, t.y, 30, s.dmg * 1.5, xcSrcOf(w, { xc3: 1, elem: 'flame' }), w.def.color)); } // Flashover
    if (R('homing') && t4) { // the beam bends to brush Charged (Corroded) enemies near its line
      const n = R('homing') >= 4 ? 6 : Math.min(3, R('homing')), near = xcFoes().filter(e => (rf ? xcCharged(e) : corroded(e)) && !xcOnLine(L, e) && xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < (R('homing') >= 4 ? 60 : 80)).slice(0, n);
      for (const e of near) { const q = xcSegD(L.x1, L.y1, L.x2, L.y2, e); const bx = L.x1 + (L.x2 - L.x1) * q.t, by = L.y1 + (L.y2 - L.y1) * q.t; (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: bx, y: by, x2: e.x, y2: e.y, w: L.wd * 0.6, c: w.def.color, t: rf ? 'shock' : 'flame', life: 0.12, max: 0.12 }); damageEnemy(e, s.dmg * 2.5, src()); }
    }
    if (R('piercing') && !rf && t4) { const n = xcLv([1, 3, 6, 99], R('piercing')); xcFoes().filter(e => e !== w.curTarget && xcOnLine(L, e) && (R('piercing') < 4 || corroded(e) || !(fightCd(e).layers > 0))).slice(0, n).forEach(e => damageEnemy(e, s.dmg * 2.5 * (corroded(e) ? 1 : 0.6), src())); } // Through and Through
    if (R('piercing') >= 4 && rf && t4) { const on = xcFoes().filter(e => xcOnLine(L, e)).sort((a, b) => Math.hypot(b.x - p.x, b.y - p.y) - Math.hypot(a.x - p.x, a.y - p.y)); if (on.length >= 3 && !(w.xcSerT > G.t)) { w.xcSerT = G.t + 1; damageEnemy(on[0], s.dmg * 2.5 * on.length, src()); ring(on[0].x, on[0].y, on[0].r + 12, w.def.color, 0.3, 3); } }
    if (R('area') && rf && t4) for (const e of xcFoes()) if (xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < e.r + L.wd * 2) e.chargeT = Math.max(e.chargeT || 0, G.t + 1); // Crackle
    if (R('area') && !rf && t4) for (const e of xcFoes()) if (xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < e.r + L.wd * 3) v10Burn(e, s.dmg * 0.3, src()); // Heat Haze
    if (R('range') && rf && t4) { const n = Math.min(3, R('range')); xcFoes().filter(e => Math.hypot(e.x - L.x2, e.y - L.y2) < 90 && Math.hypot(e.x - p.x, e.y - p.y) > 300).slice(0, n).forEach(e => { bolt(L.x2, L.y2, e.x, e.y, w.def.color, 0.12); damageEnemy(e, s.dmg * 2, src()); }); } // Long Distance Call: forks at the tip
    if (R('range') >= 4 && t4 && !(w.xcEarthT > G.t) && G.zones.length < 150) { w.xcEarthT = G.t + 1; G.zones.push({ x: L.x2, y: L.y2, r: 40, life: 2, max: 2, dps: s.dmg * 2, elem: rf ? 'shock' : 'fire', pull: 0, color: w.def.color, tick: 0, src: xcSrcOf(w, { zoneHit: true }) }); } // Earthing / the far end drips
    if (R('kinship') && rf && t4) { const others = G.weapons.filter(x => x && x !== w && !x.isSpell && mwType(x) === 'shock'); const n = R('kinship') >= 4 ? 9 : Math.min(3, R('kinship')); let k = 0; for (const e of xcFoes()) { if (k >= n) break; if (xcCharged(e) && !xcOnLine(L, e) && xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < 100) { k++; bolt(p.x, p.y, e.x, e.y, w.def.color, 0.1); damageEnemy(e, s.dmg * 1.5, src()); } } if (R('kinship') >= 4) for (const x of others) if (x.curTarget && !x.curTarget.dead) { bolt(p.x, p.y, x.curTarget.x, x.curTarget.y, w.def.color, 0.1); damageEnemy(x.curTarget, s.dmg * 2, src()); } } // Grid
    if (R('catalyst') >= 4 && rf && t4) for (const e of xcFoes()) if (xcCharged(e) && xcOnLine(L, e)) forNear(e.x, e.y, e.r + 6, o => { if (o !== e && !o.charmed) o.chargeT = G.t + 3; }); // Conductor
    if (R('connecting') && w.curTarget && t4) { // Jump Leads / Fuse
      const n = rf ? xcLv([1, 2, 2, 6], R('connecting')) : xcLv([1, 3, 5, 5], R('connecting')); let cur = w.curTarget; const seen = [cur];
      for (let i = 0; i < n; i++) { const o = xcFoes().filter(q => !seen.includes(q) && (rf || corroded(q)) && Math.hypot(q.x - cur.x, q.y - cur.y) < (rf ? 100 : 120)).sort((a, b) => Math.hypot(a.x - cur.x, a.y - cur.y) - Math.hypot(b.x - cur.x, b.y - cur.y))[0]; if (!o) break;
        (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: cur.x, y: cur.y, x2: o.x, y2: o.y, w: L.wd * 0.7, c: w.def.color, t: rf ? 'shock' : 'flame', life: 0.25, max: 0.25 });
        if (rf) { damageEnemy(o, s.dmg * 2.5 * (R('connecting') >= 2 ? 0.7 : 1), src()); if (R('connecting') >= 3) o.chargeT = G.t + 3; } else xcPE(w, o); seen.push(o); cur = o; }
    }
  }
  if (rf && R('rapid') >= 4 && L) for (const e of xcFoes()) if (xcCharged(e) && xcOnLine(L, e) && !e.boss) stun(e, 0.15); // 50 Hz
  // Electric Fence / Pilot Lights
  const S = xcS();
  if (S.posts) {
    for (const q of S.posts) {
      if (q.w !== w || q.end < G.t) continue;
      const others = S.posts.filter(o => o !== q && o.w === w && o.end >= G.t && Math.hypot(o.x - q.x, o.y - q.y) < (R('mines') >= 2 ? 200 : 160));
      if (rf) for (const o of others) { if (q.x > o.x) continue; const on = R('mines') >= 4 && others.length >= 2; const hit = xcFoes().filter(e => xcSegD(q.x, q.y, o.x, o.y, e).d < e.r + 6);
        if ((on || hit.length) && !(q.zapT > G.t)) { q.zapT = G.t + 0.25; for (const e of hit) { damageEnemy(e, s.dmg * 3, src()); e.chargeT = G.t + 3; } (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: q.x, y: q.y, x2: o.x, y2: o.y, w: 6, c: w.def.color, t: 'shock', life: 0.2, max: 0.2 }); } }
      else { let e = xcFoe(q.x, q.y, R('mines') >= 3 ? 160 : 120); if (e && !(R('mines') >= 4 || corroded(e))) e = xcFoes().find(o => Math.hypot(o.x - q.x, o.y - q.y) < o.r + 30); if (e && !(q.zapT > G.t)) { q.zapT = G.t + 0.3; damageEnemy(e, s.dmg * 3 * (corroded(e) ? 1.5 : 1), src()); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: q.x, y: q.y, x2: e.x, y2: e.y, w: 6, c: w.def.color, t: 'flame', life: 0.15, max: 0.15 }); } }
    }
    S.posts = S.posts.filter(q => q.end >= G.t && G.weapons.includes(q.w));
  }
  if (!rf && R('dfa') >= 4 && t4 && w.xcDfaSeen !== G.mwS) w.xcDfaSeen = G.mwS; // (the shared strike runs; Fire from Heaven's mastery is in xc3Kill)
}
XC_TICK.rf = XC_TICK.sp = xcBeamTick;

XC_TICK.ss = function (w, dt) { // Soulmate Signal
  const R = id => xcR(w, id), s = w.s, p = G.player, L = xcLine(w), t4 = !(w.xc3T > G.t), src = () => xcSrcOf(w, { xc3: 1 });
  if (t4) w.xc3T = G.t + 0.25;
  const tw = w.twins && w.twins[0];
  // Heartbeat: two quick beats, a gap (faster when you are hurt)
  if (R('rapid')) { const per = (R('rapid') >= 2 ? 0.8 : 1) * (R('rapid') >= 4 && p.hp < G.P.maxHp * 0.5 ? 0.5 : 1), ph = (G.t % per) / per; w.xcBeat = ph < 0.12 || (ph > 0.22 && ph < 0.34); if (w.xcBeat && !w.xcBeatW) { const o = xcFoes().find(e => xcCharged(e) && L && !xcOnLine(L, e) && xcSegD(L.x1, L.y1, L.x2, L.y2, e).d < 110); if (o) { const q = xcSegD(L.x1, L.y1, L.x2, L.y2, o); bolt(L.x1 + (L.x2 - L.x1) * q.t, L.y1 + (L.y2 - L.y1) * q.t, o.x, o.y, w.def.color, 0.1); damageEnemy(o, s.dmg, src()); } } w.xcBeatW = w.xcBeat; }
  // Long Look: you and the twin hold still, then move
  if (R('charged')) { const still = Math.hypot(p.vx || 0, p.vy || 0) < 25; w.xcLook = still ? (w.xcLook || 0) + dt : w.xcLook; if (!still && (w.xcLook || 0) > 1) { w.xcStare = G.t + 1; if (R('charged') >= 4 && L) for (const e of xcFoes()) if (xcOnLine(L, e)) e.chargeT = G.t + 3; w.xcLook = 0; } if (!still && (w.xcLook || 0) <= 1) w.xcLook = 0; }
  if (!L || !tw) return;
  if (R('knock') && t4) { const vx = p.vx || 0, vy = p.vy || 0, sp = Math.hypot(vx, vy); if (sp > 20) for (const e of xcFoes()) if (!e.boss && xcOnLine(L, e)) { shove(e, e.x - vx, e.y - vy, xcLv([30, 60, 90, 90], R('knock'))); if (R('knock') >= 4) e.xcCan = { w, t: G.t + 0.5, f: 120, k: 0.4 }; } } // Third Wheel
  if (R('pull')) { const rr = xcLv([60, 90, 120, 120], R('pull')); for (const e of xcFoes()) { if (Math.hypot(e.x - tw.x, e.y - tw.y) < rr + e.r) mwPull(e, tw.x, tw.y, 60 * dt); if (R('pull') >= 4 && Math.hypot(e.x - p.x, e.y - p.y) < rr + e.r) { const q = xcSegD(L.x1, L.y1, L.x2, L.y2, e); mwPull(e, L.x1 + (L.x2 - L.x1) * q.t, L.y1 + (L.y2 - L.y1) * q.t, 60 * dt); } } } // Gravitational Pull
  if (R('sticky')) for (const e of xcFoes()) { if (xcOnLine(L, e)) { msSlow(e, 0.4, 0.3); e.xcOnSS = G.t; if (!e.boss) { const vx = p.vx || 0, vy = p.vy || 0; e.x += vx * 0.3 * dt; e.y += vy * 0.3 * dt; } } else if (R('sticky') >= 4 && e.xcOnSS > G.t - 0.1 && !e.boss) { msSnare(e, 1.5); e.xcOnSS = 0; } } // Attachment Issues
  if (R('explode') && !(w.xcFwT > G.t)) { w.xcFwT = G.t + xcLv([1, 0.8, 0.6, 0.6], R('explode')); aoe(tw.x, tw.y, 60, s.dmg * 3, src(), w.def.color); if (R('explode') >= 4) aoe(p.x, p.y, 60, s.dmg * 3, src(), w.def.color); } // Fireworks
  if (R('homing')) { const c = acquire('cluster', s.range, p.x, p.y); if (c && w.anchor) { const k = Math.min(1, (R('homing') >= 2 ? 3 : 1.5) * dt); w.anchor.x += (c.x - w.anchor.x) * k; w.anchor.y += (c.y - w.anchor.y) * k; } } // Soul Searching
  if ((R('ricochet') || R('connecting')) && t4) { // Love Triangle / Mutual Friend: the beam bends through more points
    const pts = []; const n = R('ricochet') ? xcLv([1, 2, 3, 5], R('ricochet')) : xcLv([1, 1, 2, 2], R('connecting'));
    let cur = tw; const seen = [];
    for (let i = 0; i < n; i++) { const o = xcFoes().filter(e => !seen.includes(e) && (!R('connecting') || R('connecting') < 4 || xcCharged(e)) && Math.hypot(e.x - cur.x, e.y - cur.y) < 220).sort((a, b) => (R('connecting') >= 2 ? b.crowd - a.crowd : 0) || Math.hypot(a.x - cur.x, a.y - cur.y) - Math.hypot(b.x - cur.x, b.y - cur.y))[0]; if (!o) break; seen.push(o); pts.push(o); cur = o; }
    let a = tw; for (const o of pts) { for (const e of xcFoes()) if (xcSegD(a.x, a.y, o.x, o.y, e).d < e.r + L.wd) damageEnemy(e, s.dmg * 0.5, src()); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: a.x, y: a.y, x2: o.x, y2: o.y, w: L.wd, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); a = o; }
    if (R('connecting') && pts.length) { for (const e of xcFoes()) if (xcSegD(pts[pts.length - 1].x, pts[pts.length - 1].y, p.x, p.y, e).d < e.r + L.wd) damageEnemy(e, s.dmg * 0.5, src()); }
  }
  if (R('melee') || R('orbiting')) { // Slow Dance (round you) / Honeymoon (round the crowd)
    const c = R('orbiting') && !R('melee') ? (acquire('cluster', s.range, p.x, p.y) || p) : p, rad = R('melee') ? (R('melee') >= 3 ? 90 : 70) : 110 * (R('orbiting') >= 3 ? 1.3 : 1), sp = (R('melee') || R('orbiting')) >= 2 ? 2.6 : 2;
    w.xcDance = (w.xcDance || 0) + sp * dt;
    const ax = c.x + Math.cos(w.xcDance) * rad, ay = c.y + Math.sin(w.xcDance) * rad;
    // the twin is a mirror of you through the anchor: set the anchor half-way so the twin lands on (ax, ay)
    w.anchor = { x: (p.x + ax) / 2, y: (p.y + ay) / 2 };
    if ((R('melee') || R('orbiting')) >= 4 && t4) { const bx = c.x - Math.cos(w.xcDance) * rad, by = c.y - Math.sin(w.xcDance) * rad; for (const e of xcFoes()) if (xcSegD(p.x, p.y, bx, by, e).d < e.r + L.wd) damageEnemy(e, s.dmg, src()); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: bx, y2: by, w: L.wd, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); }
  }
  if (R('mines')) { // Waiting at the Altar: a fixed anchor; the beam is only on with enemies between
    w.xcAltar = w.xcAltar || { x: tw.x, y: tw.y };
    w.anchor = { x: (p.x + w.xcAltar.x) / 2, y: (p.y + w.xcAltar.y) / 2 };
    const between = xcFoes().some(e => xcOnLine(L, e)); if (between) w.xcAltarOn = G.t + (R('mines') >= 3 ? 1 : 0.05);
    if (Math.hypot(p.x - w.xcAltar.x, p.y - w.xcAltar.y) > s.range + (R('mines') >= 2 ? 60 : 0)) w.xcAltar = null;
  } else w.xcAltar = null;
  if (R('dfa') && !(w.xcDiveT > G.t) && t4) { w.xcDiveT = G.t + 4; const c = (R('dfa') >= 3 && acquire('cluster', s.range, p.x, p.y)) || tw; G.fx.push({ type: 'warn', x: c.x, y: c.y, r: 50, color: w.def.color, life: 0.6, max: 0.6 }); after(R('dfa') >= 2 ? 0.3 : 0.6, () => { if (!G) return; w.anchor = { x: (G.player.x + c.x) / 2, y: (G.player.y + c.y) / 2 }; aoe(c.x, c.y, R('dfa') >= 4 ? 110 : 60, s.dmg * (R('dfa') >= 4 ? 8 : 3), xcSrcOf(w, { xc3: 1, elem: 'shock' }), w.def.color); }); } // Falling for You
  if (R('upclose') >= 4 && Math.hypot(tw.x - p.x, tw.y - p.y) < 40 && !(w.xcHugT > G.t)) { w.xcHugT = G.t + 2; aoe(p.x, p.y, 90, s.dmg * 6, src(), w.def.color); } // a hug
  if (R('nth') && w.xcAnchorN !== w.anchor) { w.xcAnchorN = w.anchor; w.xcRe = (w.xcRe || 0) + 1; if (w.xcRe % (R('nth') >= 2 ? 3 : 4) === 0) w.xcWideT = G.t + (R('nth') >= 3 ? 2 : 1); } // Anniversary
  if (R('kinship') >= 4 && t4) for (const x of G.weapons) if (x && x !== w && !x.isSpell && mwType(x) === 'shock' && x.curTarget && !x.curTarget.dead && !(x.xcMirT > G.t)) { x.xcMirT = G.t + Math.max(0.3, x.s.cd); const m = { x: 2 * tw.x - x.curTarget.x, y: 2 * tw.y - x.curTarget.y }, o = xcFoe(m.x, m.y, 200); if (o) { bolt(tw.x, tw.y, o.x, o.y, w.def.color, 0.1); damageEnemy(o, x.s.dmg * 0.4, xcSrcOf(x, { xc3: 1 })); } } // Matchmaker
  if (R('catalyst') >= 4 && t4) for (const e of xcFoes()) if (xcOnLine(L, e) && e.rxLast && e.rxLast > G.t - 0.25 && Math.hypot(e.x - tw.x, e.y - tw.y) > 60) { aoe(tw.x, tw.y, 50, s.dmg * 2, src(), w.def.color); break; }
  if (R('primer') >= 4 && t4 && !(w.xcRePrT > G.t)) { w.xcRePrT = G.t + 1; for (const e of xcFoes()) if (xcOnLine(L, e) && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: G.t + 4, by: new Set(), steps: 0 }; }
  if (R('extra') && !(w.xcExtraT > G.t) && t4) { w.xcExtraT = G.t + 0.25; const n = xcLv([1, 1, 2, 3], R('extra')); for (let i = 1; i <= n; i++) { const ang = R('extra') >= 4 ? G.t * 1.5 + i / (n + 1) * TAU : (R('extra') >= 2 && i === 1 ? Math.atan2(p.y - tw.y, p.x - tw.x) : Math.atan2(tw.y - p.y, tw.x - p.x) + i * 0.9), len = Math.hypot(tw.x - p.x, tw.y - p.y), x2 = p.x + Math.cos(ang) * len, y2 = p.y + Math.sin(ang) * len; for (const e of xcFoes()) if (xcSegD(p.x, p.y, x2, y2, e).d < e.r + L.wd) damageEnemy(e, s.dmg * 0.6, src()); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2, y2, w: L.wd, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); } } // Polycule
}
// Soulmate Signal: the twin's beam is off while Waiting at the Altar has nobody between you, and wider on an Anniversary.
twinTick = (orig => function (w, dt) {
  if (w && xc3(w, 'ss')) {
    const s = w.s, wd = s.width;
    if (w.xcWideT > G.t) s.width = wd * 2;
    if (xcR(w, 'mines') && !(w.xcAltarOn > G.t)) { w.beamT = Math.max(w.beamT || 0, 0.05); }
    try { return orig(w, dt); } finally { s.width = wd; }
  }
  return orig(w, dt);
})(twinTick);

XC_TICK.mg = XC_TICK.es = function (w, dt) { // the two spreads
  const R = id => xcR(w, id), s = w.s, p = G.player, mg = xcIs(w, 'mg'), S = xcS(), src = () => xcSrcOf(w, { xc3: 1 });
  // Ricochet: pellets bounce off enemies (Ball Slam / Bounce); bounced pellets that meet merge (Maximum Gains mastery)
  if (R('ricochet')) for (const pr of G.proj) {
    if (pr.dead || pr.w !== w || !(pr.xcB > 0)) continue;
    const e = xcFoe(pr.x, pr.y, pr.r + 2, pr.xcHitB);
    if (e) { pr.xcB--; (pr.xcHitB || (pr.xcHitB = [])).push(e); const nx = pr.x - e.x, ny = pr.y - e.y, l = Math.hypot(nx, ny) || 1, dot = (pr.vx * nx + pr.vy * ny) / l; pr.vx -= 2 * dot * nx / l; pr.vy -= 2 * dot * ny / l; pr.hits = null; pr.pierce = Math.max(pr.pierce || 0, 1); pr.life = Math.max(pr.life, 0.4);
      if (!mg && R('ricochet') >= 4 && corroded(e) && !pr.xcSplit) { pr.xcSplit = 1; spawnProj(w, pr.x, pr.y, Math.atan2(pr.vy, pr.vx) + 0.4, pr.src, { dmg: pr.dmg * 0.6, xcSplit: 1, pierce: 0, hits: [e.id] }); } }
    if (mg && R('ricochet') >= 4 && pr.xcHitB && pr.xcHitB.length && !pr.xcMerged) for (const q of G.proj) if (q !== pr && !q.dead && q.w === w && q.xcHitB && q.xcHitB.length && Math.hypot(q.x - pr.x, q.y - pr.y) < pr.r + q.r) { pr.dmg += q.dmg; pr.r = Math.min(14, pr.r * 1.3); q.dead = true; pr.xcMerged = 1; break; }
  }
  // Clothesline and Snot Web
  if (G.xcTies) {
    for (const T of G.xcTies) {
      if (T.w !== w || T.t < G.t) continue;
      const L = T.list.filter(e => !e.dead); if (L.length < 2) continue;
      const cx = L.reduce((u, e) => u + e.x, 0) / L.length, cy = L.reduce((u, e) => u + e.y, 0) / L.length;
      if (mg) for (const e of L) { const d = Math.hypot(e.x - cx, e.y - cy); if (d > 40) mwPull(e, cx, cy, Math.min(d - 40, 90 * dt)); } // they can't spread out
      else { let mx = 0; for (const e of L) mx = Math.max(mx, fightCd(e).bars.acid); for (const e of L) { const c = fightCd(e); c.bars.acid = Math.max(c.bars.acid, mx * (R('connecting') >= 2 ? 0.7 : 0.5)); if (R('connecting') >= 4 && L.some(corroded)) e.corrodedT = Math.max(e.corrodedT || 0, G.t + 1); } }
    }
    G.xcTies = G.xcTies.filter(T => T.t >= G.t);
  }
  // Snot Web / Through the Tissue: Corrosion keeps filling
  if (!mg) for (const e of G.enemies) if (e.xcCorT > G.t) { const c = fightCd(e); c.bars.acid = Math.min(0.99, c.bars.acid + 0.15 * dt); }
  // Kettlebells and Pollen Pods
  if (S.pods) {
    for (const q of S.pods) {
      if (q.w !== w || q.end < G.t) continue;
      const e = xcFoe(q.x, q.y, 36); if (!e) continue;
      if (mg) { const a = Math.atan2(e.y - q.y, e.x - q.x); if (R('mines') >= 4) xcFan(w, q.x, q.y, a, 12, TAU * 11 / 12, src()); else xcFan(w, q.x, q.y, a, (s.count || 5) + (R('mines') >= 3 ? 2 : 0), s.spread, src()); }
      else { aoe(e.x, e.y, R('mines') >= 2 ? 70 : 55, s.dmg * 3, xcSrcOf(w, { xc3: 1 }), w.def.color); forNear(e.x, e.y, 70, o => { const c = fightCd(o); c.bars.acid = Math.min(0.99, c.bars.acid + 0.3); }); } // the passer sneezes acid on its friends
      q.n--; if (q.n <= 0) q.end = 0; else q.end = G.t + 14;
    }
    S.pods = S.pods.filter(q => q.end >= G.t && G.weapons.includes(q.w));
  }
  // Dumbbell Drop and Acid Rain
  if (S.rain3) {
    for (const q of S.rain3) {
      if (q.w !== w || q.end < G.t) continue;
      if (q.walk != null) { q.x += Math.cos(q.walk) * 160 * dt; q.y += Math.sin(q.walk) * 160 * dt; }
      if (q.follow) { const c = acquire('cluster', s.range || 400, p.x, p.y); if (c) { q.x += (c.x - q.x) * Math.min(1, 2 * dt); q.y += (c.y - q.y) * Math.min(1, 2 * dt); } }
      if (q.next > G.t) continue;
      q.next = G.t + (mg ? 0.08 : 0.12);
      const n = mg && R('dfa') >= 3 ? 2 : 1;
      for (let i = 0; i < n; i++) { const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * q.r, x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d; forNear(x, y, 14, e => { if (!e.charmed) damageEnemy(e, s.dmg * (mg ? 0.8 : 0.6), xcSrcOf(w, { xc3: 1 })); }); spawnPart(x, y, w.def.color, 2, 40, 0.25, 2); }
    }
    S.rain3 = S.rain3.filter(q => q.end >= G.t && G.weapons.includes(q.w));
  }
  // the spinning ring (Spin Class mastery) and the acid mist (Holding It In mastery)
  if (R('orbiting') >= 4 && w.xcSpin) {
    w.xcRingA = (w.xcRingA || 0) + 4 * dt;
    if (!(w.xcRingT > G.t)) { w.xcRingT = G.t + 0.25; const n = w.xcSpin.n, rr = 60; for (let i = 0; i < n; i++) { const a = w.xcRingA + i / n * TAU, x = p.x + Math.cos(a) * rr, y = p.y + Math.sin(a) * rr; forNear(x, y, 10, e => { if (!e.charmed) damageEnemy(e, s.dmg * 0.5, src()); }); if (!mg) forNear(x, y, 14, e => { const c = fightCd(e); c.bars.acid = Math.min(0.99, c.bars.acid + 0.05); }); } }
    if (R('orbiting') >= 3) for (const b of G.ebul) if (!b.dead && Math.abs(Math.hypot(b.x - p.x, b.y - p.y) - 60) < 8) b.dead = true;
  }
  if (R('orbiting') === 3 || (R('orbiting') >= 2 && mg)) for (const pr of G.proj) if (pr.w === w && pr.orbitT > 0 && pr.xcOrbFan) { if (mg && R('orbiting') >= 3) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - pr.x, b.y - pr.y) < pr.r + b.r + 3) b.dead = true; if (!mg) forNear(pr.x, pr.y, pr.r + 4, e => { const c = fightCd(e); c.bars.acid = Math.min(0.99, c.bars.acid + 0.05); }); }
  // Contagion: your other Acid weapons' hits make enemies sneeze (in xc3Other)
};
// Other weapons' hits: Contagion (Enzyme Sneeze Kinship) and Spotter (Maximum Gains Kinship mastery is on fire, below)
wupHit = (orig => function (e, res, src) {
  orig(e, res, src);
  const w = src && src.w; if (!G || !w || src.dot || src.xc3) return;
  for (const o of G.weapons) {
    if (!o || o === w || !xcIs(o, 'es') || !xcR(o, 'kinship') || mwType(w) !== 'fire' || e.dead || e.xcSneezeT > G.t) continue;
    e.xcSneezeT = G.t + 1; forNear(e.x, e.y, 50 + 10 * Math.min(3, xcR(o, 'kinship')), q => { if (q !== e && !q.charmed) { const c = fightCd(q); c.bars.acid = Math.min(0.99, c.bars.acid + 0.15); } });
  }
})(wupHit);
wupFire = (orig => function (w, t, src) { // Spotter: firing Maximum Gains speeds your other Force weapons
  const r = orig(w, t, src);
  if (w && xcIs(w, 'mg') && xcR(w, 'kinship') >= 4) for (const o of G.weapons) if (o && o !== w && !o.isSpell && mwType(o) === mwType(w)) o.xcSpotT = G.t + 2;
  return r;
})(wupFire);
wupTick = (orig => function (dt) {
  orig(dt);
  if (!G || G.state !== 'play') return;
  for (const o of G.weapons) if (o && o.xcSpotT > G.t) o.cd -= dt * 0.25; // (+25% fire rate)
})(wupTick);

// ---------------------------------------------------------------- kills, and risen allies
function xc3Kill(e, src) {
  const w = src && src.w; if (!G || !w || !xcAny(w)) return;
  const tag = xcDef(w) && xcDef(w).tag;
  if (tag === 'sp' && xcR(w, 'knock') >= 4 && xcBurning(e)) aoe(e.x, e.y, 50, w.s.dmg * 4, xcSrcOf(w, { xc3: 1 }), w.def.color);
  if (tag === 'sp' && xcR(w, 'dfa') >= 4 && src.wname && /from Above|Strike/i.test(src.wname)) for (const o of xcFoes()) if (corroded(o) && Math.hypot(o.x - e.x, o.y - e.y) < 120) xcPE(w, o);
}
wupKill = (orig => function (e, src) { orig(e, src); xc3Kill(e, src); })(wupKill);
XC_LIFE.rf = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_LIFE.ss = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_LIFE.sp = () => 6;
XC_LIFE.mg = w => (xcR(w, 'turncoat') >= 2 ? 6 : 4);
XC_LIFE.es = () => 5;
XC_RUN.rf = function (z, dt) { // Antenna: re-transmits your beam from itself
  const w = z.xcRun.w, s = w.s, r = xcR(w, 'turncoat');
  if (!(z.xcAntT > G.t)) { z.xcAntT = G.t + 0.25; const o = xcFoe(z.x, z.y, s.range * 0.6, [z]); if (o) { (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: z.x, y: z.y, x2: o.x, y2: o.y, w: (s.width || 10) * 0.7, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); damageEnemy(o, s.dmg * 2, xcSrcOf(w, { xc3: 1 })); if (r >= 3) o.chargeT = G.t + 3; }
    if (r >= 4) { const a2 = G.enemies.find(q => q !== z && q.xcRun && q.xcRun.w === w && !q.dead); if (a2) { for (const e of xcFoes()) if (xcSegD(z.x, z.y, a2.x, a2.y, e).d < e.r + 8) damageEnemy(e, s.dmg, xcSrcOf(w, { xc3: 1 })); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: z.x, y: z.y, x2: a2.x, y2: a2.y, w: 6, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); } } }
  if (z.xcRun.end <= G.t) z.dead = true;
};
XC_RUN.ss = function (z, dt) { // Rebound: the beam runs you, twin, ally
  const w = z.xcRun.w, s = w.s, tw = w.twins && w.twins[0];
  if (xcR(w, 'turncoat') >= 3) { const c = acquire('cluster', s.range, z.x, z.y); if (c) { const d = Math.hypot(c.x - z.x, c.y - z.y) || 1; z.x += (c.x - z.x) / d * 80 * dt; z.y += (c.y - z.y) / d * 80 * dt; } }
  if (tw && !(z.xcAntT > G.t)) { z.xcAntT = G.t + 0.25; for (const e of xcFoes()) if (e !== z && xcSegD(tw.x, tw.y, z.x, z.y, e).d < e.r + (s.width || 10)) damageEnemy(e, s.dmg * 0.5, xcSrcOf(w, { xc3: 1 })); (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: tw.x, y: tw.y, x2: z.x, y2: z.y, w: s.width || 10, c: w.def.color, t: 'shock', life: 0.26, max: 0.26 }); }
  if (z.xcRun.end <= G.t) z.dead = true;
};
XC_RUN.sp = function (z, dt) { // Ember: swims at the nearest Corroded enemy and bursts on it
  const w = z.xcRun.w, r = xcR(w, 'turncoat'), o = xcFoes().filter(e => e !== z && corroded(e) && (r >= 3 || Math.hypot(e.x - z.x, e.y - z.y) < 400)).sort((a, b) => Math.hypot(a.x - z.x, a.y - z.y) - Math.hypot(b.x - z.x, b.y - z.y))[0] || xcFoe(z.x, z.y, 400, [z]);
  if (o) { const d = Math.hypot(o.x - z.x, o.y - z.y) || 1; z.x += (o.x - z.x) / d * 160 * dt; z.y += (o.y - z.y) / d * 160 * dt; }
  if ((o && Math.hypot(o.x - z.x, o.y - z.y) < z.r + o.r + 4) || z.xcRun.end <= G.t) {
    z.dead = true; aoe(z.x, z.y, 70, w.s.dmg * 6 * (r >= 2 ? 1.3 : 1), xcSrcOf(w, { xc3: 1, elem: 'flame' }), w.def.color);
    if (o) xcPE(w, o);
    if (r >= 4 && o && o.dead && Math.random() < 0.5) xcRise(w, o);
  }
};
XC_RUN.mg = function (z) { // Gym Bro: bulked up, brawls
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  if (!z.xcBulk) { z.xcBulk = 1; z.r *= 1.5; z.dmg = (z.dmg || 5) * 1.5 * (1 + 0.1 * Math.max(0, G.enemies.filter(q => q.xcRun && q.xcRun.w === w && !q.dead).length - 1)); }
  if (r >= 3 && !(z.xcPunchT > G.t)) { const o = xcFoe(z.x, z.y, z.r + 10, [z]); if (o) { z.xcPunchT = G.t + 0.6; shove(o, z.x, z.y, 200); } }
  if (z.xcRun.end <= G.t) z.dead = true;
};
XC_RUN.es = function (z) { // Contagious: sneezes acid
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  if (!(z.xcSneezeT > G.t)) { z.xcSneezeT = G.t + (r >= 2 ? 1 : 1.5); const o = xcFoe(z.x, z.y, 160, [z]); if (o) { const a = Math.atan2(o.y - z.y, o.x - z.x), n = r >= 3 ? 5 : 3; for (let i = 0; i < n; i++) { const b = a + (i / (n - 1) - 0.5) * 0.6; for (const e of xcFoes()) if (e !== z && Math.hypot(e.x - z.x, e.y - z.y) < 140 && Math.abs(angDiff(Math.atan2(e.y - z.y, e.x - z.x), b)) < 0.15) { damageEnemy(e, w.s.dmg, xcSrcOf(w, { xc3: 1 })); if (r >= 4 && e.dead) xcRise(w, e); } } } }
  if (z.xcRun.end <= G.t) z.dead = true;
};

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.xcS) return;
  const X = G.xcS, P = G.player;
  ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * S);
  for (const q of X.posts || []) { ctx.globalAlpha = 0.85; ctx.fillStyle = col(q.w.def.color); ctx.fillRect(sx(q.x) - 3 * S, sy(q.y) - 8 * S, 6 * S, 16 * S); }
  for (const q of X.pods || []) { ctx.globalAlpha = 0.85; ctx.strokeStyle = col(q.w.def.color); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), (xcIs(q.w, 'mg') ? 9 : 6) * S, 0, TAU); ctx.stroke(); }
  for (const q of X.rain3 || []) { ctx.globalAlpha = 0.3; ctx.strokeStyle = col(q.w.def.color); ctx.setLineDash([5 * S, 5 * S]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  for (const w of G.weapons) {
    if (!w || !w.xcSpin || xcR(w, 'orbiting') < 4) continue;
    ctx.globalAlpha = 0.85; ctx.fillStyle = col(w.def.color);
    for (let i = 0; i < w.xcSpin.n; i++) { const a = (w.xcRingA || 0) + i / w.xcSpin.n * TAU; ctx.beginPath(); ctx.arc(sx(P.x + Math.cos(a) * 60), sy(P.y + Math.sin(a) * 60), 3.5 * S, 0, TAU); ctx.fill(); }
  }
  for (const T of G.xcTies || []) { const L = T.list.filter(e => !e.dead); if (L.length < 2) continue; ctx.globalAlpha = 0.45; ctx.strokeStyle = col(T.w.def.color); ctx.beginPath(); ctx.moveTo(sx(L[0].x), sy(L[0].y)); for (const e of L.slice(1)) ctx.lineTo(sx(e.x), sy(e.y)); ctx.stroke(); }
  ctx.restore();
})(modDraw);
