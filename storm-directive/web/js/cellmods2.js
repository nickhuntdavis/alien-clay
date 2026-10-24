'use strict';
// Spawn Prawn - weapon cells, part 2: Hot Mess and Eggs (redesign docs/MODIFIER_MATRIX.md, those two rows of every table,
// and 5.7 / 5.8; Claude's picks, built 24 Oct). Same engine as cellmods.js (XC_W masking, no fork screens, two Switched at
// Birth alternates, card text TODO_COPY:cell_hm_<modifier> / cell_eg_<modifier>).
//  - HOT MESS (v_flame_pool, Fire Pool): every patch it lays is tagged (z.xcHm) as it lands (game.js landLob) and run here
//    each frame: Spatter merges, Simmer heats, Tar pit slows, Plughole pulls, Popcorn hops, Shared Burn, Grease fire,
//    Bonfire, Spreading (Area). Hot to touch (Melee), the ring of fire (Orbiting), hidden patches (Mines) and the
//    Flaming bag (Death from Above) replace the lob.
//  - EGGS (s_toothfairy, the Tooth Fairy's teeth in toys.js): this file lays the eggs itself when the weapon has a cell
//    (toothFire), adds to every grab (toothTaken: Egg toss, yolk, Scrambled, Clutch, bounce, Golden egg) and moves the
//    eggs that orbit you. Nest egg (Melee), the orbit and Egg drop (Death from Above) replace the drop.
// Simplified: Eggs' Catalyst mastery is the shared one (no "sets off every reaction it is ready for"); Kinship's mastery on
// Eggs is +50% lure range (every enemy but bosses is lured already) and Pulling's is a +50% rush towards the egg.
// Hooks: none in shared files. Wraps game.js landLob, toys.js toothFire/toothTaken/toothTick, fight.js rxFired,
// wupDmgMul, mwDetonate, wupKill, modDraw; fills cellmods.js XC_TICK/XC_FIRE/XC_STATS/XC_RUN/XC_LIFE. Loads after cellmods.js.

XC_W.v_flame_pool = { tag: 'hm',
  cells: ['rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'explode', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['rapid', 'charged', 'knock', 'pull', 'sticky', 'explode', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['range', 'upclose', 'piercing', 'ricochet', 'focus', 'homing', 'ranged'],
  atkOk: ['rapid', 'charged', 'knock', 'sticky', 'explode', 'connecting', 'mines', 'primer', 'extra', 'orbiting'] };
XC_W.s_toothfairy = { tag: 'eg',
  cells: ['rapid', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'ricochet', 'connecting', 'turncoat', 'melee', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['rapid', 'knock', 'pull', 'sticky', 'ricochet', 'connecting', 'turncoat', 'melee', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['range', 'upclose', 'charged', 'piercing', 'explode', 'focus', 'homing', 'mines', 'ranged'],
  atkOk: ['rapid', 'sticky', 'ricochet', 'connecting', 'extra', 'orbiting'] };
XC_ALT.v_flame_pool = ['fire', 'ice']; XC_ALT.s_toothfairy = ['arcane', 'fire']; // (Acid or Mucus; Blood or Acid)
MM_SAB.s_toothfairy = MM_SAB.s_toothfairy || 'arcane';
const xcInZ = (z, e) => Math.hypot(e.x - z.x, e.y - z.y) < z.r + (e.r || 0) * 0.5;
const xcBurning = e => (e.cd && e.cd.bars.fire > 0.3) || e.v10burn > 0;
const xcToward = (e, tx, ty, f) => shove(e, 2 * e.x - tx, 2 * e.y - ty, f); // (shove pushes away from a point: push towards one)
const xcMix = (a, b, k) => { const h = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

// ================================================================ HOT MESS
function xcHmPatch(w, x, y, k) { // a patch laid by a cell (not a lob)
  k = k || {};
  if (G.zones.length >= 150) return null;
  const s = w.s, life = s.dur * (k.l || 1);
  const z = { x, y, r: s.area * (k.r || 1), life, max: life, dps: s.dmg * 0.9 * (k.d || 1), elem: w.def.elem, pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w) };
  G.zones.push(z); xcHmZone(w, z, false);
  return z;
}
function xcHmZone(w, z, landed) { // every patch of this weapon, as it appears
  const R = id => xcR(w, id), s = w.s;
  z.xcHm = w; z.xcBorn = G.t;
  if (w.def.sab && w.def.elem === 'ice') z.xcSlick = 1; // (a Mucus slick Snares)
  if (!landed) return;
  if (R('nth')) { // Bonfire
    w.xcN = (w.xcN || 0) + 1;
    if (w.xcN % (R('nth') >= 2 ? 3 : 4) === 0) {
      z.xcBon = 1; z.r *= Math.SQRT2; z.life *= 3; z.max *= 3;
      if (R('nth') >= 4) { z.follow = true; z.x = G.player.x; z.y = G.player.y; } // (the ring round you)
    }
  }
  if (R('explode')) { aoe(z.x, z.y, z.r, s.dmg, weaponSrc(w), w.def.color); } // Grease fire: a burst as it lands
}
landLob = (orig => function (pr) {
  const n = G.zones.length;
  orig(pr);
  const w = pr.w;
  if (!w || !xcIs(w, 'hm') || !xcAny(w)) return;
  for (let i = n; i < G.zones.length; i++) { const z = G.zones[i]; if (z.src && z.src.w === w && !z.xcHm) xcHmZone(w, z, true); }
})(landLob);
function xcLob(w, tx, ty) { const p = G.player; G.proj.push({ lob: true, sx: p.x, sy: p.y, tx, ty, x: p.x, y: p.y, t: 0, flight: (w.s.flight || 0.55) * rand(0.9, 1.15), w, src: weaponSrc(w), color: w.def.color, dead: false }); }
XC_FIRE.hm = function (w, target) {
  const R = id => xcR(w, id), p = G.player, S = xcS(), s = w.s;
  if (R('melee') || R('orbiting')) return true; // (Hot to touch and the ring of fire run in the tick)
  if (!target) return false;
  if (R('mines')) { // hidden patches
    const mine = (S.hmHide || (S.hmHide = [])).filter(q => q.w === w);
    if (mine.length >= (R('mines') >= 2 ? 5 : 3)) mine[0].end = 0;
    S.hmHide.push({ w, x: target.x + rand(-30, 30), y: target.y + rand(-30, 30), r: s.area, end: G.t + 14 });
    return true;
  }
  if (R('dfa')) { // the Flaming bag
    const x = target.x, y = target.y;
    G.fx.push({ type: 'warn', x, y, r: 26, color: w.def.color, life: 0.6, max: 0.6 });
    after(0.6, () => {
      if (!G || !G.weapons.includes(w)) return;
      if (R('dfa') >= 3) aoe(x, y, 50, s.dmg, weaponSrc(w), w.def.color); // it lands with a flare
      (S.hmBag || (S.hmBag = [])).push({ w, x, y, end: G.t + 6 });
    });
    return true;
  }
  const ex = R('extra');
  if (ex) { // Splash pattern
    const a = Math.atan2(target.y - p.y, target.x - p.x);
    if (ex >= 4) { const c = acquire('cluster', s.range, p.x, p.y) || target; for (let i = 0; i < 8; i++) xcLob(w, c.x + Math.cos(i / 8 * TAU) * 110, c.y + Math.sin(i / 8 * TAU) * 110); return true; } // a ring round the crowd
    if (ex >= 3) { for (let i = -2; i <= 2; i++) xcLob(w, target.x + Math.cos(a + Math.PI / 2) * i * 50, target.y + Math.sin(a + Math.PI / 2) * i * 50); return true; } // a wall across their path
    for (let i = 1; i <= ex; i++) xcLob(w, target.x + Math.cos(a) * 60 * i, target.y + Math.sin(a) * 60 * i); // a line beyond the target
  }
  return false;
};
XC_STATS.hm = function (w, s) {
  const R = id => xcR(w, id);
  if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.6], R('rapid')); s.dmg *= xcLv([0.75, 0.7, 0.65, 0.6], R('rapid')); s.area *= 0.75; } // Spatter
  const ex = R('extra'); if (ex) { const n1 = xcLv([2, 3, 5, 8], ex); s.dmg *= Math.pow(1 / n1, 0.4); }
};
XC_TICK.hm = function (w, dt) {
  const R = id => xcR(w, id), s = w.s, p = G.player, S = xcS(), src = () => Object.assign(weaponSrc(w), { zoneHit: true });
  const zs = G.zones.filter(z => z.xcHm === w && z.life > 0);
  const t4 = !(w.xcT4 > G.t); if (t4) w.xcT4 = G.t + 0.25; // (the quarter-second checks)
  for (const z of zs) {
    if (z.xcR0 == null) { z.xcR0 = z.r; z.xcD0 = z.dps; }
    const age = G.t - z.xcBorn;
    if (R('charged') || z.xcKinFl) { // Simmer heats it; Firestarter flares it
      const cap = xcLv([0.6, 1.2, 1.8, 1.8], Math.max(1, R('charged'))), k = R('charged') ? Math.min(cap, 0.15 * age) : 0;
      z.dps = z.xcD0 * (1 + k) * (z.xcKinFl > G.t ? 1.5 : 1);
      if (R('charged')) z.color = xcMix(w.def.color.length === 7 ? w.def.color : '#ff6a2a', '#ffffff', 0.7 * k / cap);
      if (R('charged') >= 4 && k >= cap && !z.xcBoiled) { z.xcBoiled = 1; const a = Math.random() * TAU; xcHmPatch(w, z.x + Math.cos(a) * z.r * 1.2, z.y + Math.sin(a) * z.r * 1.2); } // boils over
    }
    if (R('area')) z.r = Math.max(z.r, z.xcR0 * (1 + 0.5 * Math.min(1, age / Math.max(0.1, z.max)))); // Spreading
    if (z.xcBon && !(z.xcBonT > G.t)) { z.xcBonT = G.t + 1; aoe(z.x, z.y, z.r, s.dmg, src(), w.def.color); } // the bonfire flares
    if (z.xcBon && R('nth') >= 3) forNear(z.x, z.y, z.r + 60, e => { if (!e.charmed) mwPull(e, z.x, z.y, 20 * dt); });
    if (z.xcPieces >= 3 && R('rapid') >= 4 && !(z.xcFlT > G.t)) { z.xcFlT = G.t + 1; aoe(z.x, z.y, z.r, s.dmg * 1.2, src(), w.def.color); } // merged patches flare
    if (R('kinship') >= 4 && t4 && G.enemies.some(e => !e.dead && xcInZ(z, e) && xcBurning(e))) z.life = Math.max(z.life, 0.3); // never goes out on a burning enemy
    if (R('pull')) { // Plughole
      const reach = z.r + 60 * Math.min(3, R('pull')) * xcArea(w);
      forNear(z.x, z.y, reach, e => { if (e.charmed || e.boss) return; mwPull(e, z.x, z.y, 45 * dt);
        if (R('pull') >= 4 && xcBurning(e) && Math.hypot(e.x - z.x, e.y - z.y) > z.r * 0.7) mwPull(e, z.x, z.y, 120 * dt); });
      if (R('pull') >= 3 && t4) forNear(z.x, z.y, z.r * 0.4, e => { if (!e.charmed) damageEnemy(e, z.dps * 0.25, src()); }); // its centre burns double
    }
    if (R('sticky')) forNear(z.x, z.y, z.r, e => { // Tar pit: slows, never Snares (until the mastery)
      if (e.charmed) return;
      msSlow(e, xcLv([0.3, 0.5, 0.7, 0.7], R('sticky')), 0.3);
      if (R('sticky') >= 4) { e.xcTar = G.t - (e.xcTarL || 0) < 0.1 ? (e.xcTar || 0) + dt : dt; e.xcTarL = G.t; if (e.xcTar >= 2 && !(e.snareT > G.t)) { msSnare(e, 1.5); e.xcTarRe = G.t + 1.5; e.xcTarW = w; e.xcTar = 0; } }
    });
    if (R('knock') && !(z.xcPopT > G.t)) { // Popcorn
      z.xcPopT = G.t + 0.5;
      forNear(z.x, z.y, z.r, e => {
        if (e.charmed || e.boss || !xcBurning(e) || Math.random() < 0.5) return;
        if (R('knock') >= 4) { const a = Math.random() * TAU, d = Math.random() * z.r * 0.6; xcToward(e, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d, 160); } // bounces about inside
        else { const a = Math.random() * TAU; shove(e, e.x - Math.cos(a), e.y - Math.sin(a), 180); }
        e.xcCan = { w, t: G.t + 0.5, f: 120, k: 0.3 };
      });
    }
    if (R('explode')) { forNear(z.x, z.y, z.r, e => { if (!e.charmed) (z.xcIn || (z.xcIn = new Set())).add(e.id); });
      if (R('explode') >= 4 && z.life <= dt * 1.5 && !z.xcEnded) { z.xcEnded = 1; aoe(z.x, z.y, z.r * 1.3, s.dmg * (1 + 0.25 * Math.min(12, z.xcIn ? z.xcIn.size : 0)), src(), w.def.color); } } // explodes as it burns out
    if (R('connecting') && t4) { // Shared Burn
      const r = R('connecting'), mem = [];
      forNear(z.x, z.y, z.r, e => { if (!e.charmed) { mem.push(e); e.xcLinkZ = z; e.xcLinkT = G.t + 2; } });
      if (r >= 3) for (const e of G.enemies) if (!e.dead && e.xcLinkZ === z && e.xcLinkT > G.t && !mem.includes(e)) mem.push(e);
      let mx = 0; for (const e of mem) { const c = fightCd(e); mx = Math.max(mx, c.bars.fire); }
      for (const e of mem) {
        const c = fightCd(e), was = e.xcLastBF || 0;
        if (r >= 4 && was > 0.8 && c.bars.fire < 0.2) for (const o of mem) if (o !== e) { fightCd(o).bars.fire = 0.999; } // one goes up, its partners go too
        c.bars.fire = Math.max(c.bars.fire, Math.min(0.99, mx * (r >= 2 ? 0.7 : 0.5)));
        e.xcLastBF = c.bars.fire;
      }
    }
    if (z.xcSlick) forNear(z.x, z.y, z.r, o => { if (!o.charmed && !(o.xcSlT > G.t)) { msSnare(o, 0.6); o.xcSlT = G.t + 1.2; } });
    if (z.xcStamp) { const o = xcFoe(z.x, z.y, z.r * 0.4); if (o) { z.xcStamp = 0; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.random(); xcHmPatch(w, z.x + Math.cos(a) * 45, z.y + Math.sin(a) * 45, { r: 0.7 }); } } }
  }
  if (R('rapid') && t4) for (let i = 0; i < zs.length; i++) for (let j = i + 1; j < zs.length; j++) { // Spatter: patches that touch merge
    const a = zs[i], b = zs[j]; if (a.life <= 0 || b.life <= 0 || a.follow || b.follow || a.xcBon || b.xcBon) continue;
    if (Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 0.7) {
      a.r = Math.min(Math.hypot(a.r, b.r), s.area * 1.73 * xcArea(w)); a.xcR0 = a.r; a.life = Math.max(a.life, b.life); a.max = Math.max(a.max, b.max);
      a.xcPieces = (a.xcPieces || 1) + (b.xcPieces || 1); b.life = 0;
    }
  }
  // Melee: Hot to touch
  if (R('melee') && t4) {
    const RR = (R('melee') >= 2 ? 60 : 40) * xcArea(w);
    forNear(p.x, p.y, RR, e => { if (e.charmed) return; damageEnemy(e, s.dmg * 0.5, weaponSrc(w)); if (R('melee') >= 3) { const c = fightCd(e); c.bars.fire = Math.min(0.99, c.bars.fire + 0.09); } }); // (a Fire touch fills Burn; Lv 3 fills it twice as fast)
  }
  if (R('melee') >= 4) { // a scorch where you swim
    if (w.xcLx == null) { w.xcLx = p.x; w.xcLy = p.y; }
    if (Math.hypot(p.x - w.xcLx, p.y - w.xcLy) > 30) { w.xcLx = p.x; w.xcLy = p.y; xcHmPatch(w, p.x, p.y, { r: 0.35, l: 0.35, d: 0.5 }); }
  }
  // Orbiting: a ring of fire
  if (R('orbiting')) {
    const r = R('orbiting'), Rr = r >= 2 ? 90 : 72, rings = r >= 4 ? [Rr, Rr * 0.6] : [Rr];
    w.xcRingA = (w.xcRingA || 0) + 2 * dt; w.xcRings = rings;
    if (t4) for (const RR of rings) forNear(p.x, p.y, RR + 20, e => { if (!e.charmed && Math.abs(Math.hypot(e.x - p.x, e.y - p.y) - RR) < e.r + 10) damageEnemy(e, s.dmg * 0.5, Object.assign(weaponSrc(w), { zoneHit: true })); });
    if (r >= 3 && !(w.xcTrailT > G.t)) { w.xcTrailT = G.t + 0.4; const a = w.xcRingA; xcHmPatch(w, p.x + Math.cos(a) * Rr, p.y + Math.sin(a) * Rr, { r: 0.3, l: 0.3, d: 0.6 }); } // a short burning trail
  } else w.xcRings = null;
  // Mines: hidden patches flare when stepped in
  if (S.hmHide) {
    for (const q of S.hmHide) {
      if (q.w !== w || q.end < G.t) continue;
      if (!xcFoe(q.x, q.y, q.r * 0.6)) continue;
      q.end = 0;
      aoe(q.x, q.y, q.r, s.dmg * 2 * (R('mines') >= 3 ? 1.3 : 1), weaponSrc(w), w.def.color);
      xcHmPatch(w, q.x, q.y, { r: R('mines') >= 4 ? 2 : 1 });
    }
    S.hmHide = S.hmHide.filter(q => q.end >= G.t);
  }
  // Death from Above: the first enemy to step on the bag stamps it out into 3 patches
  if (S.hmBag) {
    for (const q of S.hmBag) {
      if (q.w !== w || q.end < G.t || !xcFoe(q.x, q.y, 18)) continue;
      q.end = 0;
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + Math.random(), z = xcHmPatch(w, q.x + Math.cos(a) * 55, q.y + Math.sin(a) * 55, { d: R('dfa') >= 2 ? 1.3 : 1 }); if (z && R('dfa') >= 4) z.xcStamp = 1; }
    }
    S.hmBag = S.hmBag.filter(q => q.end >= G.t);
  }
};
XC_LIFE.hm = w => (xcR(w, 'turncoat') >= 2 ? 6 : 4);
XC_RUN.hm = function (z, dt) { // Fire walker: chases enemies, setting them alight
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  const o = xcFoe(z.x, z.y, 420, [z]);
  if (o) { const d = Math.hypot(o.x - z.x, o.y - z.y) || 1; z.x += (o.x - z.x) / d * 150 * dt; z.y += (o.y - z.y) / d * 150 * dt; }
  forNear(z.x, z.y, z.r + 6, e => { if (e === z || e.charmed || e.xcWalkT > G.t) return; e.xcWalkT = G.t + 0.5; const c = fightCd(e); c.bars.fire = Math.min(0.99, c.bars.fire + (r >= 3 ? 0.45 : 0.3)); v10Burn(e, w.s.dmg, weaponSrc(w)); });
  if (z.xcRun.end > G.t) return;
  z.dead = true;
  if (r >= 4) xcHmPatch(w, z.x, z.y); // collapses into a patch
};
rxFired = (orig => function (id, e) { // Catalyst mastery: a reaction inside a patch splashes a new small patch
  orig(id, e);
  if (!G || !e || !G.weapons) return;
  for (const w of G.weapons) {
    if (!w || !xcIs(w, 'hm') || xcR(w, 'catalyst') < 4 || w.xcSplT > G.t) continue;
    if (G.zones.some(z => z.xcHm === w && z.life > 0 && xcInZ(z, e))) { w.xcSplT = G.t + 1; xcHmPatch(w, e.x, e.y, { r: 0.5, l: 0.6 }); }
  }
})(rxFired);

// ================================================================ EGGS
function xcEgPut(w, x, y, o) {
  const T = TOYS(), R = id => xcR(w, id);
  const cap = 3 + (R('extra') >= 2 ? 1 : 0) + (R('extra') >= 4 ? 1 : 0) + (R('rapid') ? 1 : 0);
  if (T.teeth.length >= 30 || T.teeth.filter(q => q.w === w && !q.dead && !q.xcOrb).length >= cap) return null;
  w.toothN = (w.toothN || 0) + 1;
  const t = Object.assign({ x, y, w, gold: false, end: G.t + w.s.dur, born: G.t, bite: 0 }, o || {});
  if (R('nth') && w.toothN % (R('nth') >= 2 ? 3 : 4) === 0) { t.gold = true; t.xcGoldE = 1; } // Golden egg
  T.teeth.push(t);
  return t;
}
function xcEgFire(w, target) {
  const R = id => xcR(w, id), s = w.s, p = G.player;
  if (R('melee') || R('orbiting')) return true; // (Nest egg and the orbit run in the tick)
  if (!target) return false;
  if (R('dfa')) { // Egg drop: cracks on whoever it lands on, otherwise stays as a lure
    const fs = acquireMany('nearest', s.range, p.x, p.y, 8); if (!fs.length) return true;
    for (let i = 0; i < Math.max(s.count, R('dfa') >= 2 ? 2 : 1); i++) {
      const e = pick(fs), x = e.x + rand(-25, 25), y = e.y + rand(-25, 25);
      G.fx.push({ type: 'warn', x, y, r: 18, color: w.def.color, life: 0.6, max: 0.6 });
      after(0.6, () => {
        if (!G || !G.weapons.includes(w)) return;
        const o = xcFoe(x, y, 14);
        if (o) { damageEnemy(o, s.dmg * (R('dfa') >= 3 ? 1.5 : 1), toySrc(w, 'Tooth Fairy')); ring(x, y, 30, w.def.color, 0.3, 3); }
        else xcEgPut(w, x, y);
      });
    }
    sfx('gem'); return true;
  }
  const ex = R('extra'), n = s.count, clutch = R('connecting') ? (G.xcClutch = (G.xcClutch || 0) + 1) : 0;
  for (let i = 0; i < n; i++) {
    let x, y;
    if (ex >= 4) { const a = i / n * TAU + G.t; x = p.x + Math.cos(a) * 150; y = p.y + Math.sin(a) * 150; } // a ring of lures
    else if (ex >= 3) { const a = Math.random() * TAU, d = rand(110, 170); x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d; } // spread round you
    else { const k = 0.85 + rand(-0.1, 0.05); x = p.x + (target.x - p.x) * k + rand(-50, 50); y = p.y + (target.y - p.y) * k + rand(-50, 50); }
    if (R('ricochet')) { const a = Math.atan2(y - p.y, x - p.x), d = xcLv([50, 90, 130, 130], R('ricochet')); spawnPart(x, y, w.def.color, 3, 50, 0.2, 2); x += Math.cos(a) * d; y += Math.sin(a) * d; } // bounces deeper into the crowd
    xcEgPut(w, x, y, clutch ? { xcClutch: clutch } : null);
  }
  sfx('gem');
  return true;
}
toothFire = (orig => function (w, target) {
  if (w && xcIs(w, 'eg') && xcAny(w) && xcEgFire(w, target)) return;
  return orig(w, target);
})(toothFire);
XC_STATS.eg = function (w, s) {
  const R = id => xcR(w, id);
  if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.6], R('rapid')); s.dmg *= xcLv([0.75, 0.7, 0.65, 0.6], R('rapid')); } // Scrambled
  if (R('extra')) { const n0 = s.count || 1; s.count = R('extra') >= 4 ? 5 : n0 + xcLv([1, 2, 2], R('extra')); s.dmg *= Math.pow(n0 / s.count, 0.4); }
  if (R('connecting') >= 3) s.count = Math.max(s.count, 3); // clutches of 3
  if (R('pull')) s.lure += 30 * Math.min(3, R('pull'));
  if (R('kinship') >= 4) s.lure *= 1.5;
  if (R('area')) s.lure *= xcArea(w);
};
toothTaken = (orig => function (t, e) {
  const w = t && t.w;
  if (!w || !xcIs(w, 'eg') || !xcAny(w) || !w.s) return orig(t, e);
  const R = id => xcR(w, id);
  t.xcTaken = 1;
  if (R('nth') >= 3 && t.xcGoldE) e.teeth = Math.max(e.teeth || 0, 4); // full strength at once
  if (R('sticky') >= 4) msSnare(e, 0.35); // Snared until the smite
  const second = R('rapid') ? xcFoe(t.x, t.y, 30, [e]) : null; // Scrambled: both are smitten
  orig(t, e);
  if (second) after(0.3, () => { if (G && !second.dead) damageEnemy(second, w.s.dmg, toySrc(w, 'Tooth Fairy')); });
  after(0.31, () => { if (G && G.weapons.includes(w)) xcEgSmite(w, t, e); });
})(toothTaken);
function xcEgSmite(w, t, e) {
  const R = id => xcR(w, id), s = w.s, x = e.dead ? t.x : e.x, y = e.dead ? t.y : e.y, src = toySrc(w, 'Tooth Fairy'), T = TOYS();
  if (R('knock') && !e.dead && !e.boss) { // Egg toss
    const nx = R('knock') >= 4 ? T.teeth.filter(q => q.w === w && !q.dead).sort((u, v) => Math.hypot(u.x - x, u.y - y) - Math.hypot(v.x - x, v.y - y))[0] : null;
    const o = nx || msNear(x, y, 220, [e]);
    if (o) xcToward(e, o.x, o.y, 320); else shove(e, G.player.x, G.player.y, 260);
    e.xcCan = { w, t: G.t + 0.6, f: 260, k: 0.3 };
  }
  if (R('sticky')) forNear(x, y, 60, o => { if (!o.charmed) msSlow(o, 0.4, 2); }); // yolk
  if (R('connecting') && t.xcClutch) { // Clutch
    const mates = T.teeth.filter(q => q !== t && !q.dead && q.w === w && q.xcClutch === t.xcClutch);
    if (R('connecting') >= 4 && mates.length) {
      const all = [t, ...mates], cx = all.reduce((u, q) => u + q.x, 0) / all.length, cy = all.reduce((u, q) => u + q.y, 0) / all.length, rr = Math.max(...all.map(q => Math.hypot(q.x - cx, q.y - cy))) + 60;
      aoe(cx, cy, rr, s.dmg * 1.5, src, w.def.color); for (const q of mates) q.dead = true; // the clutch hatches into one big smite
    } else for (const q of mates) { const rr = 60 + (R('connecting') >= 2 ? 20 : 0); forNear(q.x, q.y, rr, o => { if (!o.charmed) damageEnemy(o, s.dmg * 0.6, src); }); ring(q.x, q.y, rr, w.def.color, 0.3, 3); }
  }
  if (R('ricochet') >= 4) { const o = xcFoe(x, y, 160, [e]); if (o) { bolt(x, y, o.x, o.y, w.def.color, 0.16); damageEnemy(o, s.dmg * 0.6, src); } } // the egg bounces on
  if (R('dfa') >= 4) forNear(t.x, t.y, 100, o => { if (o !== e && !o.charmed) damageEnemy(o, s.dmg, src); });
  if (R('primer') >= 4) forNear(x, y, 100, o => { if (o.mwPr && o.mwPr.t > G.t) { const M = o.mwPr; o.mwPr = null; mwDetonate(o, M.w, M); } });
  if (t.xcOrb && R('orbiting') >= 4) { const p = G.player, rr = R('orbiting') >= 3 ? 100 : 70; forNear(p.x, p.y, rr + 30, o => { if (!o.charmed && Math.abs(Math.hypot(o.x - p.x, o.y - p.y) - rr) < 30 + o.r) damageEnemy(o, s.dmg * 0.6, src); }); }
  if (t.xcGoldE) { forNear(x, y, 160, o => { o.xcGold = G.t + 1.5; }); e.xcGold = G.t + 1.5; if (R('nth') >= 4) xcRise(w, e); } // Golden egg
  if (xcArea(w) > 1 && G.zones.length < 150) G.zones.push({ x, y, r: 50 * xcArea(w), life: 2, max: 2, dps: s.dmg * 0.15, elem: 'soul', pull: 0, color: w.def.color, tick: 0, src: Object.assign(weaponSrc(w), { zoneHit: true, elem: 'soul' }) }); // Yolk splash
}
toothTick = (orig => function (dt) { // Scrambled mastery: an egg nobody grabbed hatches into a small smite
  const due = G && G.toy ? G.toy.teeth.filter(t => !t.dead && t.w && xcIs(t.w, 'eg') && xcR(t.w, 'rapid') >= 4 && G.t >= t.end) : [];
  orig(dt);
  for (const t of due) if (t.dead && !t.xcTaken) aoe(t.x, t.y, 60, t.w.s.dmg * 0.6, toySrc(t.w, 'Tooth Fairy'), t.w.def.color);
})(toothTick);
XC_TICK.eg = function (w, dt) {
  const R = id => xcR(w, id), s = w.s, p = G.player, T = TOYS();
  // Orbiting: eggs circle you, so greedy enemies have to come close
  if (R('orbiting')) {
    const n = R('orbiting') >= 2 ? 3 : 2, rad = R('orbiting') >= 3 ? 100 : 70, mine = T.teeth.filter(q => q.w === w && !q.dead && q.xcOrb);
    if (mine.length < n && !(w.xcOrbT > G.t)) { w.xcOrbT = G.t + s.cd; const q = xcEgPut(w, p.x, p.y, { xcOrb: 1 }); if (q) mine.push(q); }
    w.xcOA = (w.xcOA || 0) + 1.5 * dt;
    mine.forEach((q, i) => { const a = w.xcOA + i / n * TAU; q.x = p.x + Math.cos(a) * rad; q.y = p.y + Math.sin(a) * rad; q.end = G.t + 5; });
  }
  // Melee: Nest egg, carried on you
  if (R('melee')) {
    const N = w.xcNest || (w.xcNest = { n: 1, t: 0 }), max = R('melee') >= 2 ? 2 : 1;
    if (N.n < max && G.t >= N.t) { N.n++; N.t = G.t + s.cd * 2; }
    const o = N.n > 0 ? xcFoe(p.x, p.y, 60) : null;
    if (o) {
      N.n--; if (N.n < max && !(N.t > G.t)) N.t = G.t + s.cd * 2;
      damageEnemy(o, s.dmg * 2, toySrc(w, 'Tooth Fairy')); G.fx.push({ type: 'star', x: o.x, y: o.y - o.r - 10, r: 14, color: w.def.color, life: 0.4, max: 0.4 });
      if (R('melee') >= 3) forNear(o.x, o.y, 30 + o.r, q => { if (q !== o && !q.charmed) damageEnemy(q, s.dmg, toySrc(w, 'Tooth Fairy')); });
      if (R('melee') >= 4) forNear(o.x, o.y, 100, q => { if (!q.charmed && !q.boss) q.fearT = G.t + 1.5; });
    }
  } else w.xcNest = null;
  // Lured enemies: primed (Primer), rushing (Pulling mastery)
  if (R('primer') || R('pull') >= 4) for (const e of G.enemies) {
    if (e.dead || e.charmed || e.boss) continue;
    const t = toothLure(e); if (!t || t.w !== w) continue;
    if (R('primer') && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: G.t + 4, by: new Set(), steps: 0 };
    if (R('pull') >= 4) { const d = Math.hypot(t.x - e.x, t.y - e.y) || 1; e.x += (t.x - e.x) / d * e.speed * 0.5 * dt; e.y += (t.y - e.y) / d * e.speed * 0.5 * dt; }
  }
};
XC_LIFE.eg = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_RUN.eg = function (z) { // Hatchling: a small ghost ally; from Lv 3 its touch Fears
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  if (r >= 3) forNear(z.x, z.y, z.r + 4, e => { if (e !== z && !e.charmed && !e.boss && !(e.xcHatchT > G.t)) { e.xcHatchT = G.t + 1; e.fearT = G.t + 0.5; } });
  if (z.xcRun.end > G.t) return;
  z.dead = true;
  if (r >= 4 || xcR(w, 'nth') >= 4) xcEgPut(w, z.x, z.y); // lays one egg
};

// ---------------------------------------------------------------- shared: damage, detonations, kills
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const w = src && src.w;
  if (G && w && !src.dot && !w.isSpell && mwType(w) === 'soul' && !xcIs(w, 'eg') && G.weapons.some(x => x && xcIs(x, 'eg') && xcR(x, 'kinship'))) { // Family recipe
    const t = toothLure(e); if (t && xcIs(t.w, 'eg') && xcR(t.w, 'kinship')) k *= 1.25;
  }
  if (G && w && src.zoneHit && xcIs(w, 'hm') && xcR(w, 'catalyst')) k *= 1 + 0.2 * Math.max(0, msStatusN(e) - (xcBurning(e) ? 1 : 0)); // Fuel spill
  return k;
})(wupDmgMul);
mwDetonate = (orig => function (e, pw, M) {
  orig(e, pw, M);
  if (!G || !pw || !G.weapons.includes(pw)) return;
  if (xcIs(pw, 'hm') && xcR(pw, 'primer')) { // detonations add Burn; from Lv 3 they leave a small patch; the mastery sets off the whole patch
    forNear(e.x, e.y, 60, o => { if (!o.charmed) v10Burn(o, pw.s.dmg * 0.5, weaponSrc(pw)); });
    if (xcR(pw, 'primer') >= 3) xcHmPatch(pw, e.x, e.y, { r: 0.5, l: 0.6 });
    if (xcR(pw, 'primer') >= 4) { const z = G.zones.find(q => q.xcHm === pw && q.life > 0 && xcInZ(q, e)); if (z) forNear(z.x, z.y, z.r, o => { if (o !== e && o.mwPr && o.mwPr.t > G.t && o.mwPr.w === pw) { const N = o.mwPr; o.mwPr = null; orig(o, pw, N); } }); }
  }
  if (xcIs(pw, 'eg') && xcR(pw, 'primer') >= 3) { // detonations near an egg set it off early
    const t = TOYS().teeth.find(q => q.w === pw && !q.dead && Math.hypot(q.x - e.x, q.y - e.y) < 80);
    const o = t && xcFoe(t.x, t.y, 100); if (o) toothTaken(t, o);
  }
})(mwDetonate);
wupHit = (orig => function (e, res, src) { // Firestarter: another Fire weapon's hit in a patch makes it flare and grow
  orig(e, res, src);
  const w = src && src.w;
  if (!G || !w || w.isSpell || src.dot || src.zoneHit || mwType(w) !== 'flame' || xcIs(w, 'hm')) return;
  for (const z of G.zones) {
    if (!z.xcHm || z.life <= 0 || !xcR(z.xcHm, 'kinship') || z.xcKinT > G.t || !xcInZ(z, e)) continue;
    z.xcKinT = G.t + 0.3; z.xcKinFl = G.t + 1; if (z.xcR0 == null) { z.xcR0 = z.r; z.xcD0 = z.dps; }
    z.r = Math.min(z.xcR0 * 2, z.r * 1.1);
  }
})(wupHit);
wupKill = (orig => function (e, src) {
  orig(e, src);
  if (!G) return;
  for (const z of G.zones) { // Grease fire: a patch bursts when an enemy dies in it
    if (!z.xcHm || z.life <= 0 || !xcR(z.xcHm, 'explode') || z.xcBoomT > G.t || !xcInZ(z, e)) continue;
    z.xcBoomT = G.t + 0.5; aoe(z.x, z.y, z.r * 0.8, z.xcHm.s.dmg * 0.8, weaponSrc(z.xcHm), z.xcHm.def.color);
  }
})(wupKill);
wupTick = (orig => function (dt) {
  orig(dt);
  if (!G || G.state !== 'play') return;
  for (const e of G.enemies) if (e.xcTarRe && G.t >= e.xcTarRe) { // Tar pit mastery: bursts back into flame when the Snare ends
    e.xcTarRe = 0; if (e.dead || !e.xcTarW || !G.weapons.includes(e.xcTarW)) continue;
    const c = fightCd(e); c.bars.fire = Math.max(c.bars.fire, 0.85); v10Burn(e, e.xcTarW.s.dmg * 0.5, weaponSrc(e.xcTarW));
  }
})(wupTick);

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const p = G.player, S = G.xcS;
  ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * S_());
  for (const w of G.weapons) {
    if (!w || !xcAny(w)) continue;
    const c = col(w.def.color);
    if (w.xcRings) { ctx.strokeStyle = c; ctx.lineWidth = 6 * S_(); ctx.setLineDash([14 * S_(), 10 * S_()]); w.xcRings.forEach((R, i) => { ctx.lineDashOffset = (i ? -1 : 1) * (w.xcRingA || 0) * 20; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), R * S_(), 0, TAU); ctx.stroke(); }); ctx.setLineDash([]); ctx.lineWidth = Math.max(1, 1.5 * S_()); } // the ring of fire
    if (xcIs(w, 'hm') && xcR(w, 'melee')) { ctx.globalAlpha = 0.12; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (xcR(w, 'melee') >= 2 ? 60 : 40) * xcArea(w) * S_(), 0, TAU); ctx.fill(); } // hot to touch
    if (w.xcNest) for (let i = 0; i < w.xcNest.n; i++) { const a = G.realT * 2 + i * Math.PI; ctx.globalAlpha = 0.85; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(sx(p.x + Math.cos(a) * (p.r + 8)), sy(p.y + Math.sin(a) * (p.r + 8)), 3.5 * S_(), 4.5 * S_(), 0, 0, TAU); ctx.fill(); } // nest eggs
  }
  if (S) {
    for (const q of S.hmHide || []) { ctx.globalAlpha = 0.18; ctx.strokeStyle = col(q.w.def.color); ctx.setLineDash([3 * S_(), 6 * S_()]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * 0.6 * S_(), 0, TAU); ctx.stroke(); ctx.setLineDash([]); } // hidden patches (a faint hint)
    for (const q of S.hmBag || []) { ctx.globalAlpha = 0.9; ctx.fillStyle = col(q.w.def.color); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 8 * S_(), 0, TAU); ctx.fill(); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(G.realT * 12); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y) - 9 * S_(), 4 * S_(), 0, TAU); ctx.fill(); } // the flaming bag
  }
  ctx.restore();
})(modDraw);
