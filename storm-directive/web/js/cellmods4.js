'use strict';
// Spawn Prawn - weapon cells, part 4: Acid Spit and Ewww, Gross (redesign docs/MODIFIER_MATRIX.md 5.9 and those two rows of
// sections 3 and 4; built 24 Oct). Same engine as cellmods.js (XC_W masking, no fork screens, rank 1 to 3 then the mastery).
// Card text: cell_as_<modifier> / cell_ew_<modifier> in cellcopy4.js.
//  - ACID SPIT (v_fire_proj, Acid Projectile, tag as): its globs are ordinary shots (game.js spawnProj), so the cells mark a
//    glob as it spawns (modProj), act when it lands on an enemy (sigs.js projHit) or at the end of its flight (projEnd).
//    Kept shared forms (plus this weapon's flavour): Range, Up Close, Rapid Fire, Charged, Catalyst, Kinship, Homing, Focused
//    Intensity, Primer, Area. Replaced: Knockback, Pulling, Sticky, Piercing, Exploding Rounds, Ricochet, Connecting
//    (drip tethers), Turncoat (spitters), Melee (acid kiss), Mines, Death from Above (acid rain), Every Nth, Extra
//    Projectiles, Orbiting. Ranged is N/A. Switched at Birth (Alien): the cells' Corrosion becomes the Alien bar.
//  - EWWW, GROSS (s_redtape, Mucus Projectile, tag ew): a toy weapon (toys.js tapeFire, no projectile). With a cell its
//    stamping runs here (tapeFire), bundles are made by c4Up (as toys.js tapeUp), the bundle's share is read per bundle
//    (toyHurt) and an expiring bundle is seen in tapeTick. Kept shared forms: Range, Up Close, Rapid Fire, Catalyst,
//    Kinship, Primer, Area; every other cell is this file's. Sticky, Connecting and Ranged are N/A (taping is the weapon).
//    Switched at Birth (Acid): the stamp Corrodes (its damage type does that by itself).
// Simplified: Acid Spit's Lob bursts after 200 of flight, not 400 (its reach is 270); Ewww's Piercing, Homing and Ricochet
// act on the instant stamp (a line, a better target, bounces to enemies ahead); Ewww's Focused Intensity ramps the share.
// Hooks: none in shared files. Wraps modifiers.js modProj, sigs.js projHit/projEnd, toys.js tapeFire/tapeTick/toyHurt,
// fight.js rxFired, weapons24.js wupHit/wupDmgMul, modwide.js mwDetonate, modDraw; fills cellmods.js XC_W, XC_TICK,
// XC_FIRE, XC_STATS, XC_RUN, XC_LIFE. Loads after cellmods.js (and cellmods2.js, cellmods3.js).

const C4 = { det: 0, rx: 0, mark: (w, k) => { const F = w.c4fx || (w.c4fx = {}); F[k] = (F[k] || 0) + 1; } };
{
XC_W.v_fire_proj = { tag: 'as',
  cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['knock', 'pull', 'sticky', 'piercing', 'explode', 'ricochet', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['ranged'], atkOk: [] };
XC_W.s_redtape = { tag: 'ew',
  cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['charged', 'knock', 'pull', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['sticky', 'connecting', 'ranged'], atkOk: [] };

const c4Mark = C4.mark;
const c4As = w => !!w && xcIs(w, 'as') && xcAny(w);
const c4Ew = w => !!w && xcIs(w, 'ew') && xcAny(w);
const c4Live = w => !!(G && w && G.weapons.includes(w));
const c4Same = w => G.weapons.filter(x => x && !x.isSpell && x.def && mwType(x) === mwType(w)).length; // (weapons of its type, itself included)

// ================================================================ ACID SPIT
// Corrosion (or, switched to Alien, the Alien bar) from a cell. A glob's worth is what one hit of dmg fills.
const c4Bar = w => (mwType(w) === 'soul' ? 'soul' : 'acid');
const c4Worth = (w, e, dmg) => w2AcidFrac(e, dmg || w.s.dmg);
function c4Fill(w, e, f) {
  if (!e || e.dead || e.charmed || e.egg || !(f > 0)) return;
  if (c4Bar(w) === 'acid') { w2BarBump(e, 'acid', f, w2Base(w)); return; }
  const c = fightCd(e); c.bars.soul = Math.min(0.99, c.bars.soul + f); c.barQuietT.soul = 0;
}
function c4Strip(w, e) { // a full Shell layer (no Shell: a full bar, which Corrodes)
  if (!e || e.dead || e.charmed || e.egg) return;
  const c = fightCd(e);
  if (c4Bar(w) === 'acid') w2BarBump(e, 'acid', Math.max(0.01, 1.001 - c.bars.acid), w2Base(w));
  else c.bars.soul = 0.99;
  ring(e.x, e.y, e.r + 8, w.def.color, 0.35, 4); c4Mark(w, 'strip');
}
function c4Pud(w, x, y, r, life) { // a thin acid puddle (16 a weapon; the oldest dries up)
  if (G.zones.length >= 150) return null;
  const L = (w.c4pud || []).filter(z => z.life > 0); w.c4pud = L;
  if (L.length >= 16) L.shift().life = 0.001;
  const z = { x, y, r, life, max: life, dps: w.s.dmg * 0.12, elem: w.def.elem, pull: 0, color: w.def.color, tick: 0,
    src: Object.assign(weaponSrc(w), { zoneHit: true, wname: w.def.name + ' (puddle)' }), c4pud: w };
  G.zones.push(z); L.push(z); c4Mark(w, 'puddle');
  return z;
}
const c4Spray = (pr, extra) => Object.assign({}, pr.src, { c4sp: 1, noRx: true, knock: 0 }, extra || {}); // (secondary hits: never cells again)

modProj = (orig => function (pr, w) { // a glob as it leaves
  orig(pr, w);
  if (!c4As(w) || pr.c4drop || pr.c4ally) return;
  const R = id => xcR(w, id);
  pr.c4x = pr.x; pr.c4y = pr.y;
  if (w.c4emp === G.frameN) { pr.c4emp = 1; pr.r *= 1.8; pr.vx *= 0.7; pr.vy *= 0.7; pr.life /= 0.7; } // Every Nth: a big, slow hocker
  if (R('piercing')) { pr.pierce = (pr.pierce || 0) + XC_RAMP(R('piercing')); pr.c4P = 1; }
  if (R('homing') >= 4) { // prefers enemies not yet Corroded
    let b = null, bd = 380;
    for (const e of G.enemies) { if (e.dead || e.charmed || e.egg || corroded(e)) continue; const d = Math.hypot(e.x - pr.x, e.y - pr.y); if (d < bd) { bd = d; b = e; } }
    if (b) pr.tgt = b;
  }
})(modProj);
projHit = (orig => function (pr, e) {
  orig(pr, e);
  const w = pr.w;
  if (!G || !c4As(w) || !e) return;
  if (pr.c4ally) { if (xcR(w, 'turncoat') >= 3) c4Fill(w, e, c4Worth(w, e, pr.dmg)); return; } // (a spitter's spit: Corrosion x2 from Lv 3)
  if (pr.c4drop) return;
  c4AsHit(w, pr, e);
})(projHit);
projEnd = (orig => function (pr) {
  orig(pr);
  if (G && pr && c4As(pr.w) && !pr.c4drop && !pr.c4ally) c4AsLand(pr.w, pr, pr.x, pr.y);
})(projEnd);

function c4AsHit(w, pr, e) {
  const R = id => xcR(w, id), p = G.player, f0 = c4Worth(w, e, pr.dmg), dist = Math.hypot(e.x - p.x, e.y - p.y);
  if (R('upclose') && dist < 120 + e.r) { // Splash-through: a close glob hasn't spread yet; it bursts out behind the target in a cone
    c4AsDrops(w, pr, e, xcLv([3, 5, 7, 7], R('upclose')), Math.atan2(pr.vy, pr.vx)); c4Mark(w, 'through');
    if (R('upclose') >= 4 && dist < 60 + e.r && !(e.c4ucT > G.t)) { e.c4ucT = G.t + 0.6; c4Strip(w, e); }
  }
  if (R('charged')) { // Surface tension: a bigger glob that breaks into droplets
    const r = R('charged');
    c4Fill(w, e, f0 * xcLv([0.6, 0.9, 1.2, 1.2], r));
    if (r >= 4) c4Strip(w, e);
    c4AsDrops(w, pr, e, xcLv([3, 5, 7, 14], r));
  }
  if (R('focus') && typeof msFocusRamp === 'function') { // Thick coat: staying on one enemy lays the acid on thicker; the coat drags at it
    const k = msFocusRamp(w), r = R('focus');
    if (k > 0 && !e.dead) {
      msSlow(e, Math.min(xcLv([0.2, 0.35, 0.5, 0.5], r), 0.4 * k), 1);
      if (!(e.c4coatT > G.t)) { e.c4coatT = G.t + 0.3; ring(e.x, e.y, e.r + 3 + k * 6, w.def.color, 0.3, 2 + k * 4); fxParts('drop', e.x, e.y + e.r * 0.6, w.def.color, 1, 15, 0.5, 2 + k * 2, Math.PI / 2, 0.3); }
      c4Mark(w, 'coat');
    }
    if (r >= 4 && msFocusFull(w)) c4Strip(w, e);
  }
  if (pr.c4emp) { // Every Nth, Hocker: the big glob sticks to its target and drips on whatever passes under it
    const r = R('nth');
    c4Fill(w, e, f0 * 2); ring(e.x, e.y, e.r + 10, w.def.color, 0.35, 4); c4Mark(w, 'nth');
    if (!e.dead) e.c4hock = { w, end: G.t + (r >= 3 ? 3 : 2), next: 0, R: r >= 3 ? 60 : 40 };
    if (r >= 4) c4Strip(w, e);
  }
  if (R('sticky') && !e.dead) { // the glob slows; from Lv 3 the 3rd hit Snares
    const r = R('sticky');
    msSlow(e, xcLv([0.3, 0.5, 0.7, 0.7], r), 1.5); e.c4stW = w;
    if (r >= 3) {
      e.c4stN = G.t - (e.c4stL || -9) < 2 ? (e.c4stN || 0) + 1 : 1; e.c4stL = G.t;
      if (e.c4stN >= 3) { e.c4stN = 0; msSnare(e, 1); ring(e.x, e.y, e.r + 6, w.def.color, 0.4, 3); c4Mark(w, 'snare'); }
    }
  }
  if (R('knock') && !e.dead && !e.boss) { // a shove along the glob's flight, twice as hard on Corroded enemies
    const r = R('knock'), cor = corroded(e);
    shove(e, e.x - pr.vx, e.y - pr.vy, 5 * (cor ? 50 : 25) * Math.min(3, r)); c4Mark(w, 'shove');
    e.c4kb = { w, t: G.t + 0.6 }; // (Splat: a shoved enemy that hits a mate splats its acid on it)
    if (r >= 4 && cor) e.c4streak = { w, end: G.t + 0.7, x: e.x, y: e.y };
  }
  if (R('pull') && !e.dead) { // enemies near the splash are dragged into it
    const r = R('pull'), RR = 40 * Math.min(3, r) * xcArea(w);
    let n = 0;
    for (const o of G.enemies) {
      if (o === e || o.dead || o.charmed || n >= 8 || Math.hypot(o.x - e.x, o.y - e.y) > RR + o.r) continue;
      n++; mwPull(o, e.x, e.y, 14 * Math.min(3, r)); o.mwPulledT = G.t + 1;
    }
    if (n) { c4Mark(w, 'pull'); ring(e.x, e.y, RR, w.def.color, 0.2, 2); }
    if (r >= 4 && !e.boss) { e.c4reel = { w, left: 80 }; w2Line(p.x, p.y, e.x, e.y, 2, w.def.color, 0.3); } // an acid strand reels it in
  }
  if (pr.c4P) { // Piercing: thins as it passes (the mastery swells instead, adding Corrosion to the next)
    if (R('piercing') >= 4) { c4Fill(w, e, f0 * 0.5 * (pr.c4sw || 0)); pr.c4sw = (pr.c4sw || 0) + 1; pr.r = Math.min(14, pr.r * 1.15); }
    else pr.dmg *= 0.85;
  }
  if (R('explode')) { // an acid spray; the mastery bursts twice as wide on a Corroded target and leaves a pool
    const r = R('explode'), big = r >= 4 && corroded(e), RR = xcLv([40, 60, 80, 80], r) * (big ? 2 : 1);
    aoe(e.x, e.y, RR, pr.dmg * xcLv([0.4, 0.6, 0.8, 0.8], r), c4Spray(pr, { mwBoom: 1 }), w.def.color); ring(e.x, e.y, RR, w.def.color, 0.25, 3);
    let n = 0; forNear(e.x, e.y, RR * xcArea(w), o => { if (o !== e && !o.charmed && n++ < 10) c4Fill(w, o, f0 * 0.5); });
    if (big) c4Pud(w, e.x, e.y, 40, 2);
    c4Mark(w, 'spray');
  }
  if (R('ricochet') && (pr.c4rb || 0) < XC_RAMP(R('ricochet'))) { // off the enemy at the reflection angle
    const a = Math.atan2(pr.y - e.y, pr.x - e.x) + rand(-0.5, 0.5), nx = Math.cos(a), ny = Math.sin(a), dot = pr.vx * nx + pr.vy * ny;
    if (dot < 0) { pr.vx -= 2 * dot * nx; pr.vy -= 2 * dot * ny; }
    pr.c4rb = (pr.c4rb || 0) + 1; pr.pierce = (pr.pierce || 0) + 1; pr.dmg *= 0.8; pr.hits = [e.id]; pr.life = Math.max(pr.life, 0.6);
    spawnPart(pr.x, pr.y, w.def.color, 3, 60, 0.2, 2); c4Mark(w, 'bounce');
    if (R('ricochet') >= 4) { fxParts('drop', pr.x, pr.y, w.def.color, 3, 30, 0.5, 2.5); forNear(pr.x, pr.y, 22, o => { if (!o.charmed) c4Fill(w, o, f0 * 0.4); }); } // a drop of acid
  }
  if (R('connecting') && !e.dead) c4AsTie(w, e);
  c4AsLand(w, pr, e.x, e.y);
}
// A glob's first landing (on an enemy, or at the end of its flight): Range's Lob and puddles; Area's spill.
function c4AsLand(w, pr, x, y) {
  if (pr.c4landed) return;
  pr.c4landed = 1;
  const R = id => xcR(w, id), flown = pr.c4x != null ? Math.hypot(x - pr.c4x, y - pr.c4y) : 0;
  if (R('range') && flown > 200) {
    const RR = 40 * (1 + Math.min(0.6, 0.1 * flown / 100));
    aoe(x, y, RR, pr.dmg * 0.5, c4Spray(pr), w.def.color); ring(x, y, RR, w.def.color, 0.3, 3); c4Mark(w, 'lob');
  }
  if (R('range') >= 4) c4Pud(w, x, y, 26, 2);
  if (R('rapid')) { // Pooling: globs landing close together run into one puddle
    const P = w.c4rp, r = R('rapid');
    if (P && G.t - P.t < 1 && Math.hypot(x - P.x, y - P.y) < 40) { P.n++; P.t = G.t; P.x = (P.x + x) / 2; P.y = (P.y + y) / 2; } else w.c4rp = { x, y, t: G.t, n: 1 };
    if (w.c4rp.n >= (r >= 3 ? 2 : 3)) { c4Pud(w, w.c4rp.x, w.c4rp.y, xcLv([20, 26, 32, 32], r), 2); w.c4rp = null; c4Mark(w, 'pool'); }
  }
  if (R('area')) c4Pud(w, x, y, 22, 2);
}
function c4AsDrops(w, pr, e, n, dir) { // droplets fly to different nearby enemies (or, given dir, in a cone that way)
  const ts = dir != null ? [] : acquireMany('nearest', 160, e.x, e.y, n + 1).filter(o => o !== e);
  for (let i = 0; i < n; i++) {
    const t = ts.length ? ts[i % ts.length] : null, a = dir != null ? dir + (n > 1 ? (i / (n - 1) - 0.5) * 1 : 0) : t ? Math.atan2(t.y - e.y, t.x - e.x) + rand(-0.08, 0.08) : Math.random() * TAU, sp = 380;
    spawnProj(w, e.x, e.y, a, pr.src, { noMods: true, c4drop: 1, dmg: pr.dmg * 0.2, r: 2.5, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5, max: 0.5, hits: [e.id], pierce: 0 });
  }
  c4Mark(w, 'drops');
}
function c4AsTie(w, e) { // Connecting: a strand of acid ties the target to a neighbour for 3 s (8 strands a weapon)
  const S = xcS(), L = S.c4str || (S.c4str = []), r = xcR(w, 'connecting');
  if (L.some(q => q.w === w && !q.gone && (q.a === e || q.b === e))) return;
  if (L.filter(q => q.w === w && !q.gone).length >= 8) return;
  const ns = acquireMany('nearest', 140 + e.r, e.x, e.y, 4).filter(o => o !== e).slice(0, r >= 2 ? 2 : 1);
  for (const o of ns) L.push({ w, a: e, b: o, end: G.t + 3, next: 0, drip: 0 });
  if (ns.length) c4Mark(w, 'strand');
}

XC_STATS.as = function (w, s) {
  const R = id => xcR(w, id);
  if (R('rapid')) { s.size *= 0.75; if (R('rapid') >= 4) { s.cd *= 0.45; s.dmg *= 0.5; s.size = Math.min(s.size, 3); s.range = Math.min(s.range, 200); s.speed *= 1.25; s.mag = Math.round(s.mag * 3); } } // smaller globs; the mastery is a short jet
  if (R('charged')) s.size *= xcLv([1.6, 1.9, 2.2, 2.2], R('charged'));
  if (R('melee')) s.range = 70 * xcArea(w);
  if (R('extra')) s.dmg *= xcLv([0.85, 0.8, 0.72, 0.55], R('extra'));
};
XC_FIRE.as = function (w, target, src) {
  const R = id => xcR(w, id), p = G.player, s = w.s;
  if (R('nth')) { w.c4n = (w.c4n || 0) + 1; if (w.c4n % (R('nth') >= 2 ? 3 : 4) === 0) { w.c4emp = G.frameN; ring(p.x, p.y, p.r + 10, w.def.color, 0.3, 3); } }
  if (!target) return false;
  if (R('melee')) { c4AsKiss(w, target, src); return true; }
  if (R('mines')) { c4AsLay(w, target); return true; }
  if (R('dfa')) { c4AsRain(w, target); return true; }
  if (R('orbiting')) { // globs circle you (once; twice from Lv 3), then fly off; the mastery holds 4 until an enemy comes near
    const r = R('orbiting');
    if (r >= 4 && G.proj.filter(q => q.w === w && !q.dead && q.c4hold).length >= 4) return true;
    const pr = spawnProj(w, p.x, p.y, 0, Object.assign({}, src, { c4orb: 1 }), { orbitT: r >= 4 ? 99 : r >= 3 ? 2.1 : 1.05, oa: Math.random() * TAU, orad: 56, c4hold: r >= 4 ? 1 : 0 });
    if (pr) c4Mark(w, 'orbit');
    return true;
  }
  if (R('extra')) { // +1 glob; a rear glob; two side globs; the mastery a ring of 8
    const r = R('extra'), a0 = Math.atan2(target.y - p.y, target.x - p.x), as = [];
    if (r >= 4) for (let i = 0; i < 8; i++) as.push(a0 + i / 8 * TAU);
    else { as.push(a0 - 0.15, a0 + 0.15); if (r >= 2) as.push(a0 + Math.PI); if (r >= 3) as.push(a0 + Math.PI / 2, a0 - Math.PI / 2); }
    const prs = as.map(a => spawnProj(w, p.x, p.y, a + rand(-s.spread, s.spread) * 0.5, src));
    const S = xcS(), L = S.c4spit || (S.c4spit = []); // String of spit: globs spat together stay joined by a strand while they fly
    for (let i = 0; i < prs.length; i++) { const a = prs[i], b = prs[(i + 1) % prs.length]; if (a && b && a !== b && (r >= 4 || i + 1 < prs.length)) L.push({ w, a, b, next: 0 }); }
    while (L.length > 24) L.shift();
    p.face = a0; sfx('shot'); c4Mark(w, 'extra');
    return true;
  }
  return false;
};
function c4AsKiss(w, target, src) { // Melee: a wet bite on the nearest enemy within 70
  const p = G.player, r = xcR(w, 'melee'), reach = 70 * xcArea(w), emp = w.c4emp === G.frameN;
  const e = Math.hypot(target.x - p.x, target.y - p.y) < reach + target.r ? target : xcFoe(p.x, p.y, reach);
  if (!e) return;
  const f0 = c4Worth(w, e, w.s.dmg);
  damageEnemy(e, w.s.dmg * 1.4, Object.assign({}, src, { atk: 'contact', c4kiss: 1 }));
  c4Fill(w, e, f0 * (r >= 2 ? 2 : 1) + (emp ? f0 * 2 : 0));
  if (r >= 3) e.c4drool = { w, end: G.t + 2, next: 0 };
  w.c4kissN = (w.c4kissN || 0) + 1;
  if (r >= 4 && w.c4kissN % 3 === 0) c4Strip(w, e);
  p.face = Math.atan2(e.y - p.y, e.x - p.x);
  ring(e.x, e.y, e.r + 4, w.def.color, 0.2, 3); fxParts('drop', e.x, e.y, w.def.color, 3, 40, 0.4, 2.5); c4Mark(w, 'kiss'); sfx('shot');
}
function c4AsLay(w, target) { // Mines: 3 (5 from Lv 2) acid mines between you and the crowd
  if (w.c4layT > G.t) return;
  w.c4layT = G.t + Math.max(0.6, w.s.cd * 2);
  const S = xcS(), L = S.c4mine || (S.c4mine = []), p = G.player, cap = xcR(w, 'mines') >= 2 ? 5 : 3;
  L.push({ w, x: p.x + (target.x - p.x) * 0.35 + rand(-15, 15), y: p.y + (target.y - p.y) * 0.35 + rand(-15, 15), end: G.t + 14, armed: G.t + 0.4 });
  const mine = L.filter(q => q.w === w && !q.gone);
  while (mine.length > cap) mine.shift().gone = 1;
  c4Mark(w, 'mine');
}
function c4AsRain(w, target) { // Death from Above: acid rain over a marked zone (2 at once)
  const S = xcS(), L = S.c4rain || (S.c4rain = []), r = xcR(w, 'dfa'), p = G.player;
  if (L.filter(q => q.w === w && !q.gone).length >= 2) return;
  const c = (r >= 4 && acquire('cluster', w.s.range || 300, p.x, p.y)) || target, RR = (r >= 3 ? 90 : 70) * xcArea(w);
  G.fx.push({ type: 'warn', x: c.x, y: c.y, r: RR, color: w.def.color, life: 0.6, max: 0.6 });
  L.push({ w, x: c.x, y: c.y, r: RR, start: G.t + 0.6, end: G.t + 0.6 + (r >= 2 ? 2.5 : 1.5), next: 0 });
  c4Mark(w, 'rain');
}
XC_TICK.as = function (w, dt) {
  const R = id => xcR(w, id), s = w.s, p = G.player, S = xcS(), src = () => Object.assign(weaponSrc(w), { c4sp: 1 });
  const t4 = !(w.c4t4 > G.t); if (t4) w.c4t4 = G.t + 0.25;
  if (t4 && w.c4pud) for (const z of w.c4pud) if (z.life > 0) forNear(z.x, z.y, z.r, o => { if (!o.charmed) c4Fill(w, o, 0.05); }); // puddles Corrode what stands in them
  if (S.c4str) { // Connecting: strands hold their pair, Corrode what crosses them, drip (Lv 3) and sag into pools (mastery)
    for (const q of S.c4str) {
      if (q.w !== w || q.gone) continue;
      if (q.end <= G.t || q.a.dead || q.b.dead || !R('connecting')) { q.gone = 1; if (R('connecting') >= 4) c4Pud(w, (q.a.x + q.b.x) / 2, (q.a.y + q.b.y) / 2, 35, 2.5); continue; }
      if (Math.hypot(q.a.x - q.b.x, q.a.y - q.b.y) > 160) { mwPull(q.a, q.b.x, q.b.y, 60 * dt); mwPull(q.b, q.a.x, q.a.y, 60 * dt); }
      if (q.next <= G.t) { q.next = G.t + 0.5; for (const o of G.enemies) if (!o.dead && !o.charmed && o !== q.a && o !== q.b && w2SegDist(o.x, o.y, q.a.x, q.a.y, q.b.x, q.b.y) < o.r + 5) { c4Fill(w, o, 0.08); c4Mark(w, 'cross'); } }
      if (R('connecting') >= 3 && q.drip <= G.t) {
        q.drip = G.t + 0.4; const k = Math.random(), x = q.a.x + (q.b.x - q.a.x) * k, y = q.a.y + (q.b.y - q.a.y) * k + 6;
        fxParts('drop', x, y, w.def.color, 1, 20, 0.5, 2.5, Math.PI / 2, 0.3); forNear(x, y, 24, o => { if (!o.charmed) c4Fill(w, o, 0.06); }); c4Mark(w, 'drip');
      }
    }
    S.c4str = S.c4str.filter(q => !q.gone && c4Live(q.w));
  }
  if (S.c4mine) { // Mines: go off when an enemy comes within 40
    for (const q of S.c4mine) {
      if (q.w !== w || q.gone) continue;
      if (q.end < G.t || !R('mines')) { q.gone = 1; continue; }
      if (q.armed > G.t || !xcFoe(q.x, q.y, 40)) continue;
      q.gone = 1; const RR = 60;
      aoe(q.x, q.y, RR, s.dmg * 1.6, src(), w.def.color); ring(q.x, q.y, RR, w.def.color, 0.3, 4);
      let n = 0; forNear(q.x, q.y, RR * xcArea(w), o => { if (!o.charmed && n++ < 12) c4Fill(w, o, c4Worth(w, o, s.dmg) * (R('mines') >= 3 ? 2 : 1)); });
      if (R('mines') >= 4) c4Pud(w, q.x, q.y, 50, 3);
      c4Mark(w, 'boom');
    }
    S.c4mine = S.c4mine.filter(q => !q.gone && c4Live(q.w));
  }
  if (S.c4rain) { // Death from Above: drops land 10 a second; the mastery's rain follows the densest crowd
    for (const q of S.c4rain) {
      if (q.w !== w || q.gone) continue;
      if (q.end < G.t || !R('dfa')) { q.gone = 1; continue; }
      if (q.start > G.t) continue;
      if (R('dfa') >= 4) { const c = acquire('cluster', s.range || 300, p.x, p.y); if (c) { q.x += (c.x - q.x) * Math.min(1, 1.5 * dt); q.y += (c.y - q.y) * Math.min(1, 1.5 * dt); } }
      if (q.next > G.t) continue;
      q.next = G.t + 0.1;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * q.r, x = q.x + Math.cos(a) * d, y = q.y + Math.sin(a) * d;
      aoe(x, y, 16, s.dmg * 0.45, src(), w.def.color); fxParts('drop', x, y - 24, w.def.color, 1, 60, 0.3, 2.5, Math.PI / 2, 0.1);
    }
    S.c4rain = S.c4rain.filter(q => !q.gone && c4Live(q.w));
  }
  if (R('orbiting')) for (const pr of G.proj) { // orbiting globs: the mastery lets one go when an enemy comes near
    if (pr.w !== w || pr.dead) continue;
    if (pr.c4hold && pr.orbitT > 0 && !(w.c4relT > G.t) && xcFoe(pr.x, pr.y, 110)) { pr.orbitT = 0.001; pr.c4hold = 0; w.c4relT = G.t + 0.25; }
    if (!(pr.orbitT > 0) && pr.src && pr.src.c4orb) pr.src = Object.assign({}, pr.src, { c4orb: 0 });
  }
  if (S.c4spit) { // strings of spit Corrode what they cross
    for (const q of S.c4spit) {
      if (q.w !== w || q.gone) continue;
      if (q.a.dead || q.b.dead) { q.gone = 1; continue; }
      for (const o of G.enemies) if (!o.dead && !o.charmed && !(o.c4ssT > G.t) && w2SegDist(o.x, o.y, q.a.x, q.a.y, q.b.x, q.b.y) < o.r + 6) { o.c4ssT = G.t + 0.3; c4Fill(w, o, 0.05); damageEnemy(o, s.dmg * 0.15, src()); c4Mark(w, 'string'); }
    }
    S.c4spit = S.c4spit.filter(q => !q.gone && c4Live(q.w));
  }
  if (R('homing')) for (const pr of G.proj) { // Homing, Seed pod: a glob whose target died splits into droplets that find new ones
    if (pr.w !== w || pr.dead || !pr.mH || !pr.mHlost || pr.c4split) continue;
    pr.c4split = 1; pr.dead = true;
    const n = xcLv([2, 3, 4, 4], R('homing')), ts = acquireMany('nearest', 220, pr.x, pr.y, n);
    for (let i = 0; i < n; i++) { const t = ts[i % Math.max(1, ts.length)], a = t ? Math.atan2(t.y - pr.y, t.x - pr.x) : Math.random() * TAU; spawnProj(w, pr.x, pr.y, a, pr.src, { noMods: true, c4drop: 1, dmg: pr.dmg * 0.45, r: 3, life: 0.6, max: 0.6, homing: 6, tgt: t || null, pierce: 0 }); }
    fxParts('drop', pr.x, pr.y, w.def.color, 3, 50, 0.3, 2.5); c4Mark(w, 'split');
  }
  for (const e of G.enemies) { // per enemy: Sticky's mastery, the acid streak, the reel and the drool
    if (e.dead) continue;
    if (e.c4hock && e.c4hock.w === w) { const K = e.c4hock; if (K.end < G.t) e.c4hock = null; else if (K.next <= G.t) { K.next = G.t + 0.4; fxParts('drop', e.x, e.y + e.r * 0.5, w.def.color, 2, 25, 0.5, 3, Math.PI / 2, 0.4); forNear(e.x, e.y, K.R, o => { if (o !== e && !o.charmed) c4Fill(w, o, 0.08); }); c4Mark(w, 'hock'); } }
    if (e.c4kb && e.c4kb.w === w) { if (e.c4kb.t < G.t) e.c4kb = null; else { const o = msNear(e.x, e.y, e.r + 4, [e]); if (o && !o.charmed) { e.c4kb = null; c4Fill(w, o, 0.15 + 0.3 * ((e.cd && e.cd.bars[c4Bar(w)]) || 0)); damageEnemy(o, s.dmg * 0.25, msEcho(weaponSrc(w))); fxParts('drop', o.x, o.y, w.def.color, 4, 50, 0.4, 2.5); c4Mark(w, 'splat'); } } }
    if (e.c4stW === w && R('sticky') >= 4 && e.snareT > G.t && e.cd) { e.cd.barQuietT[c4Bar(w)] = 0; if (Math.random() < dt * 3) fxParts('drop', e.x, e.y, w.def.color, 1, 15, 0.5, 2.5, Math.PI / 2, 0.3); } // can't shed Corrosion while stuck
    if (e.c4streak && e.c4streak.w === w) { const K = e.c4streak; if (K.end < G.t) e.c4streak = null; else if (Math.hypot(e.x - K.x, e.y - K.y) > 22) { K.x = e.x; K.y = e.y; c4Pud(w, e.x, e.y, 14, 1.5); c4Mark(w, 'streak'); } }
    if (e.c4reel && e.c4reel.w === w) { const K = e.c4reel, d = Math.hypot(p.x - e.x, p.y - e.y) || 1; if (K.left <= 0 || d < e.r + p.r + 30) e.c4reel = null; else { const st = Math.min(K.left, 240 * dt); K.left -= st; mwPull(e, p.x, p.y, st); } }
    if (e.c4drool && e.c4drool.w === w) { const K = e.c4drool; if (K.end < G.t) e.c4drool = null; else if (K.next <= G.t) { K.next = G.t + 0.5; fxParts('drop', e.x, e.y + e.r * 0.5, w.def.color, 2, 25, 0.5, 2.5, Math.PI / 2, 0.4); forNear(e.x, e.y, 45, o => { if (o !== e && !o.charmed) c4Fill(w, o, 0.08); }); c4Mark(w, 'drool'); } }
  }
};
XC_LIFE.as = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_RUN.as = function (z, dt) { // Spitter: keeps its distance and spits acid; the mastery spits at whatever you are hitting
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  let t = null;
  if (r >= 4) { const c = w.curTarget || w.lastTarget; if (c && !c.dead && !c.charmed && Math.hypot(c.x - z.x, c.y - z.y) < 420) t = c; }
  if (!t) t = xcFoe(z.x, z.y, 300, [z]);
  if (t) {
    const d = Math.hypot(t.x - z.x, t.y - z.y) || 1;
    if (d > 140) { z.x += (t.x - z.x) / d * 110 * dt; z.y += (t.y - z.y) / d * 110 * dt; }
    if (!(z.c4spT > G.t) && d < 320) { z.c4spT = G.t + 0.7; spawnProj(w, z.x, z.y, Math.atan2(t.y - z.y, t.x - z.x), Object.assign(weaponSrc(w), { fromAlly: true }), { noMods: true, c4ally: 1, dmg: w.s.dmg * 0.6 }); c4Mark(w, 'spit'); }
  }
  if (z.xcRun.end > G.t) return;
  z.dead = true;
};

// ================================================================ EWWW, GROSS
const c4Free = o => !!o && !o.dead && !o.charmed && !o.egg && !o.phased && !o.tape;
function c4Up(w, first, n, k, list) { // a bundle, as toys.js tapeUp makes one (or from a given list), and its stamp
  const s = w.s, T = TOYS();
  let members = list ? list.filter(e => e === first || c4Free(e)) : null;
  if (!members) {
    members = [first]; let cur = first;
    while (members.length < n) {
      let nx = null, bd = s.jump * s.jump;
      forNear(cur.x, cur.y, s.jump, (e, d2) => { if (c4Free(e) && !members.includes(e) && d2 < bd) { bd = d2; nx = e; } });
      if (!nx) break;
      members.push(nx); cur = nx;
    }
  }
  const B = { w, members, end: G.t + s.dur, max: s.dur, c4born: G.t };
  for (const e of members) e.tape = B;
  T.tapes.push(B);
  damageEnemy(first, s.dmg * 1.5 * (k || 1), toySrc(w, 'Red Tape'));
  floatText(first.x, first.y - first.r - 12, 'STAMPED', w.def.color, 12, 0.5);
  B.stampT = G.t + 0.35;
  return B;
}
function c4Around(t, R, n) { // t and the c4Free enemies nearest it within R
  const out = [];
  forNear(t.x, t.y, R, o => { if (o !== t && c4Free(o)) out.push(o); });
  out.sort((a, b) => Math.hypot(a.x - t.x, a.y - t.y) - Math.hypot(b.x - t.x, b.y - t.y));
  return [t].concat(out.slice(0, Math.max(0, n - 1)));
}
function c4Score(w, e) { let n = 0; forNear(e.x, e.y, w.s.jump, o => { if (o !== e && c4Free(o)) n++; }); return n; }
function c4EwBest(w, n) { // the c4Free targets with the most c4Free neighbours
  const p = G.player, c = acquireMany('nearest', w.s.range, p.x, p.y, 12).filter(c4Free).map(e => [c4Score(w, e), e]);
  c.sort((a, b) => b[0] - a[0]);
  return c.slice(0, n).map(x => x[1]);
}
// One stamp, with every cell that marks a stamp or its bundle. o.free: a stamp made by another cell (no blast, bounce or pierce of its own).
function c4EwStamp(w, t, o) {
  o = o || {};
  const R = id => xcR(w, id), s = w.s, p = G.player;
  if (!t || t.dead || t.charmed || t.egg) return null;
  if (t.tape) {
    if (R('rapid') >= 4 && t.tape.w === w) { // stamps on a taped enemy extend its tape
      const B = t.tape; B.end = Math.min(G.t + s.dur * 2, B.end + 1.5);
      damageEnemy(t, s.dmg * 1.5, toySrc(w, 'Red Tape')); B.stampT = G.t + 0.35; c4Mark(w, 'extend');
      return B;
    }
    return null;
  }
  let n = s.chain + 1 + (R('dfa') >= 2 ? 1 : 0) + (R('mines') >= 3 ? 1 : 0), list = null, emp = false;
  if (R('nth') && w.c4empP) { w.c4empP = 0; emp = true; n += 3; } // (Every Nth: counted per shot in ewFire, spent on the next bundle)
  const d = Math.hypot(t.x - p.x, t.y - p.y);
  const wrap = R('upclose') && d < 120 + t.r;
  if (wrap && R('upclose') >= 4 && d < 60 + t.r) { list = c4Around(t, 80, 12); c4Mark(w, 'pointblank'); }
  if (R('explode') && !o.free) { // the stamp explodes; the bundle is made from what it hit
    const r = R('explode'), RR = xcLv([40, 60, 80, 80], r);
    aoe(t.x, t.y, RR, s.dmg * 1.5 * xcLv([0.4, 0.6, 0.8, 0.8], r), toySrc(w, 'Red Tape', { c4sp: 1 }), w.def.color); ring(t.x, t.y, RR, w.def.color, 0.25, 3);
    if (!list) { list = c4Around(t, RR * xcArea(w), n); if (list.length < n) list = null; } // (too few in the blast: tape on along the chain as usual)
    c4Mark(w, 'blast');
  }
  const B = c4Up(w, t, n, o.k, list);
  if (emp) { if (R('nth') >= 3) B.end += s.dur; if (R('nth') >= 4) B.c4share = 0.7; ring(t.x, t.y, t.r + 14, w.def.color, 0.4, 4); c4Mark(w, 'nth'); }
  if (wrap) { // Hand-wrapped: a close stamp wraps the target round and round: it is Snared and its mates are hauled in
    msSnare(t, xcLv([0.5, 0.8, 1.1, 1.1], R('upclose')));
    for (const m of B.members) if (m !== t && !m.boss) mwPull(m, t.x, t.y, 30);
    ring(t.x, t.y, t.r + 8, w.def.color, 0.3, 4); c4Mark(w, 'wrap');
  }
  if (R('charged') && !o.free) { // Tape bomb: the wound-up stamp lands and the tape snaps tight, yanking the bundle onto the target
    for (const m of B.members) if (m !== t && !m.boss) mwPull(m, t.x, t.y, 0.4 * Math.hypot(m.x - t.x, m.y - t.y));
    ring(t.x, t.y, t.r + 16, w.def.color, 0.35, 5); c4Mark(w, 'bomb');
  }
  if (emp) for (const m of B.members) msSnare(m, 1); // Duct tape: the empowered bundle is taped to the floor
  if (R('knock') && !o.free) c4EwKnock(w, B, t);
  if (R('ricochet') && !o.free) c4EwBounce(w, t, B, o.k || 1);
  if (R('piercing') && !o.free) c4EwPierce(w, t, B);
  if (R('melee') >= 4) w.c4drag = B; // (one bundle stuck to you)
  return B;
}
function c4EwKnock(w, B, t) { // Elastic: the bundle is knocked back together
  const r = xcR(w, 'knock'), p = G.player, f = 5 * xcLv([40, 60, 80, 80], r), d = Math.hypot(t.x - p.x, t.y - p.y) || 1, ux = (t.x - p.x) / d, uy = (t.y - p.y) / d;
  B.members.forEach((e, i) => { if (!e.boss) shove(e, e.x - ux, e.y - uy, f * Math.max(0.25, 1 - 0.3 * i)); }); // (the stamped end takes the full knock: the tape stretches)
  B.c4kn = G.t + 0.7; B.c4snap = new Set(); B.c4yank = new Set(); c4Mark(w, 'knock');
}
function c4EwBounce(w, t, B, k) { // Ricochet: the stamp bounces on to enemies ahead, taping each to the last bundle (8 a bundle; the mastery: all in one)
  const n = XC_RAMP(xcR(w, 'ricochet')), cap = xcR(w, 'ricochet') >= 4 ? 16 : 8, p = G.player, s = w.s, hit = [t];
  let last = t, a = Math.atan2(t.y - p.y, t.x - p.x);
  for (let i = 0; i < n; i++) {
    const h = rand(-0.95, 0.95); a += (Math.PI - 2 * Math.asin(Math.abs(h))) * (h < 0 ? -1 : 1); // (off a round body: the deflection follows where it struck)
    let nx = null, bd = 220;
    for (const o of G.enemies) {
      if (o.dead || o.charmed || o.egg || hit.includes(o)) continue;
      const dd = Math.hypot(o.x - last.x, o.y - last.y) - o.r; if (dd > bd) continue;
      if (Math.abs(angDiff(Math.atan2(o.y - last.y, o.x - last.x), a)) > 0.6) continue;
      bd = dd; nx = o;
    }
    if (!nx) break;
    k *= 0.8; hit.push(nx);
    damageEnemy(nx, s.dmg * 1.5 * k, toySrc(w, 'Red Tape')); w2Line(last.x, last.y, nx.x, nx.y, 3, w.def.color, 0.25); c4Mark(w, 'bounce');
    a = Math.atan2(nx.y - last.y, nx.x - last.x);
    if (c4Free(nx)) {
      let host = cap > 8 ? B : (last.tape && !last.tape.dead && last.tape.members.length < cap ? last.tape : null);
      if (host && host.members.length < cap) { host.members.push(nx); nx.tape = host; }
      else c4Up(w, nx, 2, 0.001, [nx].concat(c4Around(nx, s.jump, 2).slice(1)));
    }
    last = nx;
  }
}
function c4EwPierce(w, t, B) { // Piercing: the stamp carries on in a line, starting a bundle on each enemy it passes (the mastery joins them all)
  const r = xcR(w, 'piercing'), p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x), L = w.s.range * 1.2, c = Math.cos(a), sn = Math.sin(a), line = [];
  for (const e of G.enemies) {
    if (e.dead || e.charmed || e.egg || e === t) continue;
    const u = (e.x - p.x) * c + (e.y - p.y) * sn; if (u < 0 || u > L) continue;
    if (Math.hypot(e.x - (p.x + c * u), e.y - (p.y + sn * u)) < e.r + 10) line.push([u, e]);
  }
  line.sort((x, y) => x[0] - y[0]);
  const Bs = [B]; let k = 1;
  for (const [, e] of line.slice(0, XC_RAMP(r))) { k *= 0.85; if (c4Free(e)) Bs.push(c4Up(w, e, w.s.chain + 1, k)); }
  w2Line(p.x, p.y, p.x + c * L, p.y + sn * L, 3, w.def.color, 0.2); c4Mark(w, 'pierce');
  if (r >= 4 && Bs.length > 1) {
    for (const b of Bs.slice(1)) { for (const e of b.members) if (B.members.length < 16) { B.members.push(e); e.tape = B; } b.c4merged = 1; }
    c4Mark(w, 'joined');
  }
}
function c4EwFire(w, target) {
  const R = id => xcR(w, id), s = w.s, p = G.player;
  if (R('nth')) { w.c4n = (w.c4n || 0) + 1; if (w.c4n % (R('nth') >= 2 ? 3 : 4) === 0) w.c4empP = 1; }
  if (R('orbiting')) return true; // (the orbs stamp in the tick)
  if (R('mines')) { c4EwLay(w, target); return true; }
  if (R('dfa')) { c4EwDrop(w, target); return true; }
  if (R('melee')) { // Tape slap: the nearest c4Free enemy within 60
    let e = null, bd = s.range;
    for (const o of G.enemies) { if (!c4Free(o)) continue; const d = Math.hypot(o.x - p.x, o.y - p.y) - o.r; if (d < bd) { bd = d; e = o; } }
    if (e) { c4EwStamp(w, e); ring(e.x, e.y, e.r + 6, w.def.color, 0.2, 3); c4Mark(w, 'slap'); sfx('shot'); }
    return true;
  }
  let first = target;
  if (R('homing')) { // the stamp seeks a c4Free enemy (the mastery: the one with the most neighbours)
    if (R('homing') >= 4) first = c4EwBest(w, 1)[0] || first;
    else if (!c4Free(first)) { first = null; let bd = s.range; for (const o of G.enemies) { if (!c4Free(o)) continue; const d = Math.hypot(o.x - p.x, o.y - p.y) - o.r; if (d < bd) { bd = d; first = o; } } }
    if (first) { w2Line(p.x, p.y, first.x, first.y, 2, w.def.color, 0.2); c4Mark(w, 'seek'); }
  }
  let ts = [first];
  const ex = R('extra');
  if (ex >= 4) { // stamps in every direction
    ts = [first];
    for (let i = 0; i < 6; i++) {
      let b = null, bd = s.range;
      for (const o of G.enemies) { if (!c4Free(o) || ts.includes(o)) continue; const da = Math.abs(angDiff(Math.atan2(o.y - p.y, o.x - p.x), i / 6 * TAU)); if (da > Math.PI / 6) continue; const d = Math.hypot(o.x - p.x, o.y - p.y) - o.r; if (d < bd) { bd = d; b = o; } }
      if (b) ts.push(b);
    }
    ts = ts.slice(0, s.count);
  } else if (s.count > 1) {
    const c = acquireMany(aimDir(w), s.range, p.x, p.y, s.count + 8).filter(o => c4Free(o) && o !== first);
    for (const o of c) { if (ts.length >= s.count) break; if (ex >= 3 && ts.some(q => q && Math.hypot(q.x - o.x, q.y - o.y) < s.jump * 1.2)) continue; ts.push(o); } // (Lv 3: to different bundles)
  }
  const Bs = [];
  for (let t of ts) if (t) { if (t.tape && t !== first && ex) { const o = acquireMany(aimDir(w), s.range, p.x, p.y, 12).find(c4Free); if (o) t = o; } const B = c4EwStamp(w, t); if (B && !Bs.includes(B)) Bs.push(B); if (R('rapid')) c4EwStrip(w, p.x, p.y, t.x, t.y); }
  const old = target && target !== first && target.tape && !target.tape.dead ? target.tape : null;
  if (R('homing') && old && Bs[0] && old !== Bs[0]) { // Sticky fingers: the stamp peels enemies off the bundle it skipped and brings them along
    const nb = Bs[0], f = nb.members[0];
    const peel = old.members.filter(o => !o.dead).sort((a, b) => Math.hypot(a.x - f.x, a.y - f.y) - Math.hypot(b.x - f.x, b.y - f.y)).slice(0, xcLv([1, 2, 3, 3], R('homing')));
    for (const o of peel) { old.members.splice(old.members.indexOf(o), 1); nb.members.push(o); o.tape = nb; w2Line(o.x, o.y, f.x, f.y, 3, w.def.color, 0.3); c4Mark(w, 'peel'); }
  }
  if (ex && Bs.length > 1) { // Spare roll: stamps fired together are joined by one long strip of tape
    const A = Bs[0], cap = xcLv([8, 10, 12, 16], ex);
    for (const b of Bs.slice(1)) {
      w2Line(A.members[0].x, A.members[0].y, b.members[0] ? b.members[0].x : A.members[0].x, b.members[0] ? b.members[0].y : A.members[0].y, 3, w.def.color, 0.3);
      for (const e of b.members.slice()) if (A.members.length < cap) { A.members.push(e); e.tape = A; }
      b.members = b.members.filter(e => e.tape === b); if (!b.members.length) b.c4merged = 1;
    }
    c4Mark(w, 'join');
  }
  if (ex) c4Mark(w, 'extra');
  sfx('shot');
  return true;
}
function c4EwStrip(w, x1, y1, x2, y2) { // Rapid Fire, Tape gun: a strip of tape left on the floor along the shot (8 a weapon)
  const S = xcS(), L = S.c4strip || (S.c4strip = []), r = xcR(w, 'rapid');
  L.push({ w, x1, y1, x2, y2, end: G.t + (r >= 2 ? 3 : 2), slow: r >= 3 ? 0.5 : 0.3, next: 0 });
  const mine = L.filter(q => q.w === w); while (mine.length > 8) { const q = mine.shift(); q.end = 0; }
  c4Mark(w, 'strip');
}
tapeFire = (orig => function (w, target) {
  if (G && c4Ew(w) && c4EwFire(w, target)) return;
  return orig(w, target);
})(tapeFire);
function c4EwLay(w, target) { // Mines: tape traps between you and the crowd (3; 5 from Lv 2)
  if (w.c4layT > G.t) return;
  w.c4layT = G.t + Math.max(0.8, w.s.cd);
  const S = xcS(), L = S.c4trap || (S.c4trap = []), p = G.player, cap = xcR(w, 'mines') >= 2 ? 5 : 3;
  const t = target || G.player;
  L.push({ w, x: p.x + (t.x - p.x) * 0.35 + rand(-15, 15), y: p.y + (t.y - p.y) * 0.35 + rand(-15, 15), end: G.t + 14, armed: G.t + 0.4 });
  const mine = L.filter(q => q.w === w && !q.gone);
  while (mine.length > cap) mine.shift().gone = 1;
  c4Mark(w, 'trap');
}
function c4EwDrop(w, target) { // Death from Above: tape drops on the target after a 0.4 s reticle
  const r = xcR(w, 'dfa'), ts = r >= 3 ? c4EwBest(w, r >= 4 ? 2 : 1) : [];
  if (!ts.length && target) ts.push(target);
  for (const t of ts) {
    const x = t.x, y = t.y;
    G.fx.push({ type: 'warn', x, y, r: 22, color: w.def.color, life: 0.4, max: 0.4 });
    after(0.4, () => {
      if (!c4Live(w)) return;
      let e = null, bd = 40;
      for (const o of G.enemies) { if (!c4Free(o)) continue; const d = Math.hypot(o.x - x, o.y - y) - o.r; if (d < bd) { bd = d; e = o; } }
      ring(x, y, 26, w.def.color, 0.3, 3);
      if (e) c4EwStamp(w, e);
    });
  }
  c4Mark(w, 'drop');
}
XC_STATS.ew = function (w, s) {
  const R = id => xcR(w, id);
  if (R('range')) s.jump = R('range') >= 4 ? Math.max(s.jump + 60, 260) : s.jump + 20 * R('range'); // tape reaches further
  if (R('area')) s.jump *= xcArea(w);
  if (R('rapid')) s.dur = Math.min(s.dur, 3);
  if (R('charged')) { const r = R('charged'); s.cd += xcLv([0.5, 0.4, 0.3, 0.3], r); s.chain += xcLv([1, 3, 6, 6], r); if (r >= 4) s.share = Math.max(s.share, 0.5); } // a wind-up, then a bigger bundle
  if (R('kinship') >= 4 && G && c4Same(w) >= 3) s.share = Math.max(s.share, 0.5);
  if (R('melee')) { s.range = 60 * xcArea(w); s.chain = Math.max(s.chain, R('melee') >= 2 ? 5 : 4); if (R('melee') >= 3) s.dur = Math.max(s.dur, 7); }
  if (R('homing')) s.range *= 1 + 0.1 * Math.min(3, R('homing'));
  if (R('extra')) { const n0 = s.count || 1, n1 = R('extra') >= 4 ? 6 : n0 + Math.min(2, R('extra')); s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
};
// The share of a bundle (toys.js toyHurt reads w.s.share): Every Nth's 70%, and Focused Intensity's ramp.
function c4EwShare(B) {
  const w = B.w, f = xcR(w, 'focus');
  let k = Math.max(w.s.share, B.c4share || 0);
  if (f) {
    const age = G.t - (B.c4born != null ? B.c4born : B.end - B.max), top = xcLv([0.1, 0.2, 0.3, 0.3], f), ramp = Math.min(top, 0.05 * Math.floor(age / 0.25));
    k += ramp; if (f >= 4 && ramp >= top - 1e-6) k = Math.max(k, 0.7);
  }
  return Math.min(0.9, k);
}
toyHurt = (orig => function (e, lost, src) {
  const B = e && e.tape, w = B && B.w;
  if (!G || !w || !w.s || !c4Ew(w)) return orig(e, lost, src);
  const k = c4EwShare(B), s0 = w.s.share;
  if (k === s0) return orig(e, lost, src);
  w.s.share = k;
  try { return orig(e, lost, src); } finally { w.s.share = s0; }
})(toyHurt);
tapeTick = (orig => function (dt) { // a bundle of this weapon coming off
  const T = G && G.toy, mine = T ? T.tapes.filter(B => !B.dead && c4Ew(B.w)) : [];
  orig(dt);
  for (const B of mine) if (B.dead) c4EwEnd(B);
})(tapeTick);
function c4EwEnd(B) {
  const w = B.w;
  if (!c4Live(w) || B.c4merged) return;
  const al = B.members.filter(e => !e.dead), x = al.length ? al.reduce((u, e) => u + e.x, 0) / al.length : B.c4cx, y = al.length ? al.reduce((u, e) => u + e.y, 0) / al.length : B.c4cy;
  if (x == null) return;
  if (xcR(w, 'explode') >= 4 && G.t >= B.end - 1e-6 && al.length) { // the bundle bursts as one
    const RR = Math.max(...al.map(e => Math.hypot(e.x - x, e.y - y))) + 50;
    aoe(x, y, RR, w.s.dmg * Math.min(3, 1 + 0.3 * al.length), toySrc(w, 'Red Tape', { c4sp: 1 }), w.def.color); ring(x, y, RR, w.def.color, 0.35, 5); c4Mark(w, 'burst');
  }
  if (xcR(w, 'area')) { // Residue: a sticky smear where the bundle was
    const S = xcS(), L = S.c4smear || (S.c4smear = []);
    if (L.length >= 8) L.shift();
    L.push({ w, x, y, r: 40 * xcArea(w), end: G.t + 2 }); c4Mark(w, 'smear');
  }
}
XC_TICK.ew = function (w, dt) {
  const R = id => xcR(w, id), s = w.s, p = G.player, S = xcS(), T = TOYS();
  const t4 = !(w.c4t4 > G.t); if (t4) w.c4t4 = G.t + 0.25;
  const mine = T.tapes.filter(B => B.w === w && !B.dead && B.members.length);
  for (const B of mine) {
    const m = B.members.filter(e => !e.dead); if (!m.length) continue;
    const cx = m.reduce((u, e) => u + e.x, 0) / m.length, cy = m.reduce((u, e) => u + e.y, 0) / m.length; B.c4cx = cx; B.c4cy = cy;
    if (R('range')) for (let i = 1; i < m.length; i++) { const a = m[i - 1], b = m[i]; if (Math.hypot(a.x - b.x, a.y - b.y) > 200) { mwPull(a, b.x, b.y, 40 * dt); mwPull(b, a.x, a.y, 40 * dt); } } // Bungee: stretched tape draws its ends together
    if (R('pull')) for (const e of m) mwPull(e, cx, cy, 25 * Math.min(3, R('pull')) * dt); // pulled tight into a clump
    if (R('primer') && t4) for (const e of m) if (!(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: B.end, by: new Set(), steps: 0 }; // every taped enemy is primed
    if (B.c4kn > G.t) { // Elastic: tape stretched past 120 snaps taut and yanks the pair together
      for (let i = 1; i < m.length; i++) {
        const a = m[i - 1], b = m[i], d = Math.hypot(a.x - b.x, a.y - b.y), key = a.id + ':' + b.id;
        if (B.c4snap.has(key)) continue;
        if (d > 120) B.c4yank.add(key);
        if (!B.c4yank.has(key)) continue;
        if (d < a.r + b.r + 10) { B.c4snap.add(key); const src = toySrc(w, 'Red Tape', { taped: true, noCrit: true, noProc: true }); damageEnemy(a, s.dmg * 0.3, src); damageEnemy(b, s.dmg * 0.3, src); ring((a.x + b.x) / 2, (a.y + b.y) / 2, 18, w.def.color, 0.3, 4); c4Mark(w, 'snap'); }
        else { mwPull(a, b.x, b.y, 400 * dt); mwPull(b, a.x, a.y, 400 * dt); }
      }
      if (R('knock') >= 4) for (const e of m) forNear(e.x, e.y, 14, o => { // the bundle crashes into enemies behind it
        if (o.tape === B || o.charmed || o.boss || o.c4crT > G.t) return;
        o.c4crT = G.t + 0.6; shove(o, e.x, e.y, 200); damageEnemy(o, s.dmg * 0.4, toySrc(w, 'Red Tape')); c4Mark(w, 'crash');
      });
    }
  }
  if (R('pull') >= 4 && t4) { // bundles within 140 pull into each other and merge (8 at most)
    for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) {
      const a = mine[i], b = mine[j];
      if (a.dead || b.dead || b.c4merged || a.c4merged || a.c4cx == null || b.c4cx == null || a.members.length + b.members.length > 8) continue;
      const d = Math.hypot(a.c4cx - b.c4cx, a.c4cy - b.c4cy);
      if (d > 140) continue;
      if (d > 50) { for (const e of a.members) mwPull(e, b.c4cx, b.c4cy, 120 * 0.25); for (const e of b.members) mwPull(e, a.c4cx, a.c4cy, 120 * 0.25); continue; }
      for (const e of b.members) { a.members.push(e); e.tape = a; }
      b.members = []; b.c4merged = 1; a.end = Math.max(a.end, b.end); ring(a.c4cx, a.c4cy, 30, w.def.color, 0.35, 4); c4Mark(w, 'merge');
    }
  }
  if (R('melee') >= 4 && w.c4drag && !w.c4drag.dead) { // the slapped bundle is stuck to you, dragged along behind
    const hd = p.hd != null ? p.hd : Math.atan2(p.vy || 0, p.vx || 1);
    w.c4drag.members.forEach((e, i) => { if (e.dead || e.boss) return; const tx = p.x - Math.cos(hd) * (70 + i * 26), ty = p.y - Math.sin(hd) * (70 + i * 26), d = Math.hypot(tx - e.x, ty - e.y); if (d > 2) { const st = Math.min(d, 220 * dt); e.x += (tx - e.x) / d * st; e.y += (ty - e.y) / d * st; } });
  } else w.c4drag = null;
  if (R('orbiting')) { // tape orbs circle you and stamp what touches them; from Lv 3 the stamped enemy is dragged round
    const r = R('orbiting'), n = r >= 2 ? 3 : 2, rad = 80, O = w.c4orb || (w.c4orb = { a: 0, slots: [] });
    O.a += 2.2 * dt; while (O.slots.length < n) O.slots.push({ ready: 0 }); O.slots.length = n;
    O.slots.forEach((sl, i) => {
      const a = O.a + i / n * TAU; sl.x = p.x + Math.cos(a) * rad; sl.y = p.y + Math.sin(a) * rad;
      if (sl.ready > G.t) return;
      let e = null; forNear(sl.x, sl.y, 10, o => { if (c4Free(o)) { e = o; return true; } });
      if (!e) return;
      const B = c4EwStamp(w, e); sl.ready = G.t + Math.max(1, s.cd); c4Mark(w, 'orb');
      if (B && r >= 3 && !e.boss) e.c4drag = { w, i, end: G.t + 2 };
    });
    for (const e of G.enemies) {
      const D = e.c4drag; if (!D || D.w !== w) continue;
      if (e.dead || D.end < G.t || !O.slots[D.i]) { e.c4drag = null; continue; }
      const sl = O.slots[D.i], d = Math.hypot(sl.x - e.x, sl.y - e.y); if (d > 1) { const st = Math.min(d, 300 * dt); e.x += (sl.x - e.x) / d * st; e.y += (sl.y - e.y) / d * st; }
      if (r >= 4 && e.tape && e.tape.members.length < 8) forNear(e.x, e.y, 4, o => { if (o !== e && c4Free(o)) { e.tape.members.push(o); o.tape = e.tape; c4Mark(w, 'bump'); return true; } }); // dragged enemies tape what they bump into
    }
  } else w.c4orb = null;
  if (S.c4trap) { // tape traps: whoever steps in is bundled with their neighbours; the mastery's trap that bundles 4 sets the next
    const add = [];
    for (const q of S.c4trap) {
      if (q.w !== w || q.gone) continue;
      if (q.end < G.t || !R('mines')) { q.gone = 1; continue; }
      if (q.armed > G.t) continue;
      let e = null; forNear(q.x, q.y, 28, o => { if (c4Free(o)) { e = o; return true; } });
      if (!e) continue;
      q.gone = 1; const B = c4EwStamp(w, e); ring(q.x, q.y, 30, w.def.color, 0.3, 3); c4Mark(w, 'sprung');
      if (B && R('mines') >= 4 && B.members.length >= 4) add.push({ w, x: q.x, y: q.y, end: G.t + 14, armed: G.t + 0.6 });
    }
    S.c4trap = S.c4trap.filter(q => !q.gone && c4Live(q.w)).concat(add);
  }
  if (S.c4strip) { // tape strips slow what crosses them
    for (const q of S.c4strip) if (q.w === w && q.end > G.t && q.next <= G.t) { q.next = G.t + 0.25; for (const o of G.enemies) if (!o.dead && !o.charmed && w2SegDist(o.x, o.y, q.x1, q.y1, q.x2, q.y2) < o.r + 4) { msSlow(o, q.slow, 0.4); c4Mark(w, 'stuck'); } }
    S.c4strip = S.c4strip.filter(q => q.end > G.t && c4Live(q.w));
  }
  if (S.c4smear) { // Residue slows 30%
    for (const q of S.c4smear) if (q.w === w && q.end > G.t) forNear(q.x, q.y, q.r, o => { if (!o.charmed) msSlow(o, 0.3, 0.3); });
    S.c4smear = S.c4smear.filter(q => q.end > G.t && c4Live(q.w));
  }
};
XC_LIFE.ew = w => (xcR(w, 'turncoat') >= 3 ? 7 : 5);
XC_RUN.ew = function (z, dt) { // Sticky friend: hugs the nearest enemy, slows it, and shares the damage it takes (never the other way)
  const w = z.xcRun.w, r = xcR(w, 'turncoat'), X = z.xcRun;
  if (!X.hug || X.hug.dead || X.hug.charmed) { X.hug = xcFoe(z.x, z.y, 320, [z]); X.mates = null; }
  const h = X.hug;
  let held = false;
  if (h) {
    const d = Math.hypot(h.x - z.x, h.y - z.y) || 1, gap = h.r + z.r + 2;
    if (d > gap) { const st = Math.min(d - gap, 160 * dt); z.x += (h.x - z.x) / d * st; z.y += (h.y - z.y) / d * st; }
    held = d < gap + 10;
    if (held) { msSlow(h, 0.4, 0.3); if (r >= 4 && !X.mates) X.mates = acquireMany('nearest', w.s.jump, h.x, h.y, 4).filter(o => o !== h && o !== z).slice(0, 2); if (!X.hugged) { X.hugged = 1; c4Mark(w, 'hug'); } }
  }
  if (X.hp0 == null) X.hp0 = z.hp;
  const lost = X.hp0 - z.hp; X.hp0 = z.hp;
  if (lost > 0 && held) { const k = r >= 2 ? 0.5 : 0.35, src = toySrc(w, 'Red Tape', { taped: true, noCrit: true, noProc: true }); for (const o of [h].concat(X.mates || [])) if (!o.dead) damageEnemy(o, lost * k, src); }
  if (X.end > G.t) return;
  z.dead = true;
};

C4.share = c4EwShare; C4.stamp = c4EwStamp; // (for tests)

// ================================================================ both: hits, damage, reactions, detonations
wupHit = (orig => function (e, res, src) {
  orig(e, res, src);
  if (!G || !src || !src.w || src.dot || src.echo || !e) return;
  const w = src.w;
  if (src.c4orb && c4As(w) && xcR(w, 'orbiting') >= 2) c4Fill(w, e, c4Worth(w, e, (res && res.raw) || w.s.dmg)); // orbiting globs Corrode what they pass
  for (const ow of G.weapons) // Acid Spit's Catalyst mastery: Corroded enemies hit by your other weapons gain Corrosion too
    if (ow && ow !== w && c4As(ow) && xcR(ow, 'catalyst') >= 4 && !e.dead && corroded(e) && !(e.c4catT > G.t)) { e.c4catT = G.t + 0.25; c4Fill(ow, e, 0.06); c4Mark(ow, 'catalyst'); }
  if (w.isSpell || src.taped || src.c4sp) return;
  for (const ow of G.weapons) { // Kinship: another weapon of the same damage type works your mess
    if (!ow || ow === w || mwType(ow) !== mwType(w) || !xcR(ow, 'kinship')) continue;
    const r = Math.min(3, xcR(ow, 'kinship'));
    if (c4As(ow) && corroded(e) && !e.dead && !(e.c4kinT > G.t)) { // Spill: it knocks the Corrosion off onto the neighbours
      e.c4kinT = G.t + 0.5;
      for (const o of acquireMany('nearest', 80 + e.r, e.x, e.y, r + 1).filter(o => o !== e).slice(0, r)) { c4Fill(ow, o, 0.1); w2Line(e.x, e.y, o.x, o.y, 2, ow.def.color, 0.25); c4Mark(ow, 'spill'); }
    }
    const B = e.tape;
    if (c4Ew(ow) && B && B.w === ow && !B.dead && !(B.c4kinT > G.t) && B.members.length < xcLv([6, 7, 8, 8], r)) { // Group project: it counts as a stamp, and the tape grabs one more
      B.c4kinT = G.t + 0.5;
      let nx = null, bd = ow.s.jump; forNear(e.x, e.y, ow.s.jump, o => { if (c4Free(o)) { const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; nx = o; } } });
      if (nx) { B.members.push(nx); nx.tape = B; w2Line(e.x, e.y, nx.x, nx.y, 3, ow.def.color, 0.3); c4Mark(ow, 'grab'); }
    }
  }
})(wupHit);
wupDmgMul = (orig => function (e, src) { // Acid Spit's Kinship mastery: with 3 Acid weapons, Corroded enemies take +20% from all of yours
  let k = orig(e, src);
  if (G && src && src.w && !src.dot && e && corroded(e)) for (const ow of G.weapons) if (ow && c4As(ow) && xcR(ow, 'kinship') >= 4 && c4Same(ow) >= 3) { k *= 1.2; break; }
  return k;
})(wupDmgMul);
rxFired = (orig => function (id, e) {
  orig(id, e);
  if (!G || !e || C4.rx) return;
  for (const w of G.weapons) { // Acid Spit's Catalyst, Fizz: a reaction on a Corroded enemy makes the acid foam over onto its neighbours
    if (!c4As(w) || !xcR(w, 'catalyst') || !corroded(e) || e.c4fizT > G.t) continue;
    e.c4fizT = G.t + 0.5; const k = xcLv([0.1, 0.15, 0.2, 0.2], xcR(w, 'catalyst'));
    ring(e.x, e.y, 50, w.def.color, 0.35, 3); fxParts('bubble', e.x, e.y, w.def.color, 6, 60, 0.5, 3);
    forNear(e.x, e.y, 50, o => { if (o !== e && !o.charmed) c4Fill(w, o, k); }); c4Mark(w, 'fizz');
  }
  const B = e.tape, w = B && B.w;
  if (!w || !w.s || !c4Ew(w) || !xcR(w, 'catalyst') || B.dead || B.c4rxT > G.t) return;
  B.c4rxT = G.t + 0.3; const r = xcR(w, 'catalyst');
  // Heat shrink: the reaction's heat shrinks the tape: the bundle is yanked onto the reacting enemy, and the tape holds 1 s longer
  for (const o of B.members) if (o !== e && !o.dead && !o.boss) mwPull(o, e.x, e.y, xcLv([30, 45, 60, 60], r));
  B.end = Math.min(G.t + w.s.dur * 2, B.end + 1); B.flashT = G.t + 0.1; ring(e.x, e.y, e.r + 12, w.def.color, 0.3, 4); c4Mark(w, 'shrink');
  if (r < 4) return;
  C4.rx = 1; // (the mastery: it also repeats on the bundle as echo damage)
  try { for (const o of B.members) if (o !== e && !o.dead) damageEnemy(o, w.s.dmg * 0.6, toySrc(w, 'Red Tape', { taped: true, echo: true, noStatus: true, noRx: true, noCrit: true, noProc: true })); } finally { C4.rx = 0; }
  c4Mark(w, 'rxecho');
})(rxFired);
mwDetonate = (orig => function (e, pw, M) {
  orig(e, pw, M);
  if (!G || !pw || !c4Live(pw)) return;
  if (c4As(pw) && xcR(pw, 'primer')) { // detonations add Corrosion; Lv 3 strip a Corroded target; the mastery spreads it to everything near
    const r = xcR(pw, 'primer'), cor = corroded(e);
    c4Fill(pw, e, 0.3); if (r >= 3 && cor) c4Strip(pw, e);
    c4AsDrops(pw, { src: Object.assign(weaponSrc(pw), { mwDet: true }), dmg: pw.s.dmg }, e, xcLv([3, 5, 5, 8], r)); // Burst blister: the detonation throws the target's acid out as droplets
    if (r >= 4) { let n = 0; forNear(e.x, e.y, 70, o => { if (o !== e && !o.charmed && n++ < 8) c4Fill(pw, o, 0.3); }); }
    c4Mark(pw, 'det');
  }
  if (c4Ew(pw) && xcR(pw, 'primer') >= 3 && e.tape && e.tape.w === pw && !C4.det) { // detonating one taped enemy sets off the next (the mastery: the whole bundle)
    const B = e.tape, i = B.members.indexOf(e), next = xcR(pw, 'primer') >= 4 ? B.members.filter(o => o !== e) : [B.members[i + 1] || B.members[0]].filter(o => o && o !== e);
    C4.det = 1;
    try { for (const o of next) if (!o.dead && o.mwPr && o.mwPr.w === pw) { const N = o.mwPr; o.mwPr = null; mwDetonate(o, pw, N); c4Mark(pw, 'chaindet'); } } finally { C4.det = 0; }
  }
})(mwDetonate);

// ================================================================ drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const p = G.player, X = G.xcS, k = S_();
  ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * k);
  for (const w of G.weapons) {
    if (!w || !(c4As(w) || c4Ew(w))) continue;
    const c = col(w.def.color);
    if (xcR(w, 'charged') && w.s && w.s.cd > 0) { // the wind-up: an arc that fills before each attack
      const f = 1 - clamp(w.cd / w.s.cd, 0, 1);
      ctx.globalAlpha = 0.25 + 0.5 * f; ctx.strokeStyle = c; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 14) * k, -Math.PI / 2, -Math.PI / 2 + f * TAU); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k);
    }
    if (w.c4orb) for (const sl of w.c4orb.slots) { if (sl.x == null) continue; ctx.globalAlpha = sl.ready > G.t ? 0.3 : 0.9; ctx.fillStyle = c; ctx.fillRect(sx(sl.x) - 6 * k, sy(sl.y) - 4 * k, 12 * k, 8 * k); } // tape orbs
  }
  if (X) {
    for (const q of X.c4str || []) { // drip tethers: a sagging strand
      if (q.gone) continue;
      const mx = (q.a.x + q.b.x) / 2, my = (q.a.y + q.b.y) / 2 + 14 + 6 * Math.sin(G.realT * 3);
      ctx.globalAlpha = 0.7; ctx.strokeStyle = col(q.w.def.color); ctx.beginPath(); ctx.moveTo(sx(q.a.x), sy(q.a.y)); ctx.quadraticCurveTo(sx(mx), sy(my), sx(q.b.x), sy(q.b.y)); ctx.stroke();
    }
    for (const q of X.c4mine || []) { if (q.gone) continue; const c = col(q.w.def.color); ctx.globalAlpha = q.armed > G.t ? 0.4 : 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 6 * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.25; ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 40 * k, 0, TAU); ctx.stroke(); }
    for (const q of X.c4rain || []) { if (q.gone) continue; ctx.globalAlpha = q.start > G.t ? 0.2 : 0.4; ctx.strokeStyle = col(q.w.def.color); ctx.setLineDash([5 * k, 5 * k]); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    for (const q of X.c4trap || []) { if (q.gone) continue; const c = col(q.w.def.color); ctx.globalAlpha = q.armed > G.t ? 0.4 : 0.85; ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(sx(q.x) - 7 * k, sy(q.y) - 7 * k); ctx.lineTo(sx(q.x) + 7 * k, sy(q.y) + 7 * k); ctx.moveTo(sx(q.x) + 7 * k, sy(q.y) - 7 * k); ctx.lineTo(sx(q.x) - 7 * k, sy(q.y) + 7 * k); ctx.stroke(); ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 28 * k, 0, TAU); ctx.stroke(); }
    for (const q of X.c4strip || []) { ctx.globalAlpha = 0.45 * Math.min(1, (q.end - G.t) / 0.5); ctx.strokeStyle = col(q.w.def.color); ctx.lineWidth = 4 * k; ctx.beginPath(); ctx.moveTo(sx(q.x1), sy(q.y1)); ctx.lineTo(sx(q.x2), sy(q.y2)); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k); }
    for (const q of X.c4spit || []) { if (q.gone) continue; ctx.globalAlpha = 0.6; ctx.strokeStyle = col(q.w.def.color); ctx.beginPath(); ctx.moveTo(sx(q.a.x), sy(q.a.y)); ctx.lineTo(sx(q.b.x), sy(q.b.y)); ctx.stroke(); }
    for (const q of X.c4smear || []) { ctx.globalAlpha = 0.18 * Math.min(1, (q.end - G.t) / 0.5); ctx.fillStyle = col(q.w.def.color); ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), q.r * k, 0, TAU); ctx.fill(); }
  }
  for (const e of G.enemies) if (e.c4hock && !e.dead && e.c4hock.end > G.t) { ctx.globalAlpha = 0.7; ctx.fillStyle = col(e.c4hock.w.def.color); ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y - e.r * 0.4), Math.max(3, e.r * 0.45) * k, 0, TAU); ctx.fill(); } // the hocker stuck on
  for (const z of G.enemies) { // Sticky friends: a strip of tape to what they hug
    const X2 = z.xcRun; if (!X2 || z.dead || X2.tag !== 'ew' || !X2.hug || X2.hug.dead) continue;
    ctx.globalAlpha = 0.8; ctx.strokeStyle = col(X2.w.def.color); ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(sx(z.x), sy(z.y)); ctx.lineTo(sx(X2.hug.x), sy(X2.hug.y)); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k);
  }
  ctx.restore();
})(modDraw);
}
