'use strict';
// Spawn Prawn - Baseline reimagined, part 3: Hand-to-gland (Nervous Wreck renamed; slot id v_phys_contact; Contact). Spec:
// BASELINE_REDESIGN.md "Part 3" (ideas.md, 29 Oct 2026 second batch; the user's design). Pattern: baseline1.js.
//  - Rename: W24 / W24_BY / W24_DESC / WEAPONS name, icon HG, description Hits whatever gets too close. Hand-to-gland combat is as close as the name suggests, and no more hygienic.. The old Nervous Wreck cards stay in
//    wup1.js, unreachable (WUP['v_phys_contact'] is re-registered here).
//  - Base retune (a wupStats wrap, so it holds with no branch taken): reach 70 (was 110), 14 damage (was 30), 2.2 hits a second
//    (was 1.67), no magazine (the rate is the rate). Everything is scaled from what the engine computed, so levels, mods and buffs still count.
//  - Lv 3 branches (WUP re-registered with wupReg; behaviour through wupOn hooks):
//      A Kung fu   twice the hit rate at 70% damage; every 5th swing is a kick that knocks back (the wup1.js shove pattern).
//                  Lv 6: Combo (+8% a hit on the same enemy, up to +40%, reset when it dies or you switch), Flying kick (the kick
//                        lunges you through the target). Wild: an enemy hit twice within a second has its next shot reflected back.
//                  Lv 9: Thousand fists (every hit lands on everything in reach).
//      B Samurai   one cut a second at triple damage in a 160 degree arc (arsenal.js meleeSweep); the first strike on a fresh enemy
//                  is a heavy hit. Lv 6: Iaijutsu (a cut after 1.5 s idle is x2), Parry (a cut destroys enemy shots in its arc).
//                  Wild: under 30% health every cut is heavy. Lv 9: Clean cut (cuts strip a Shell layer and stagger).
//      C Biting    bites Bleed (fightStatus) and heal you 4% of the damage dealt. Lv 6: Chew toy (a bitten enemy is held 0.5 s:
//                  e.snareT and a stun), Rabies (biting a Bleeding enemy spreads Bleed to neighbours within 60). Wild: a bite on a
//                  Shelled enemy strips a layer. Lv 9: Jaws (bites on enemies under 20% health kill outright, not bosses; heal 10% max health).
//  - Costumes: baselinelook.js draws them with your body (Kung fu's belt and fists, Samurai's topknot and katana, Biting's teeth),
//    reading f.kickT, f.cutT and f.biteT from here.
//  Copy: every card text is TODO_COPY:<id> (BASELINE_COPY_IDS.md); the branch and Lv 6 card names the user gave are kept.
// Simplifications: "a hit" for the kick counts swings, not enemies hit; the reflected shot is cancelled and its damage (at least two
// swings' worth) lands on the shooter instead of flying back as a bullet; Jaws heals 10% of max health.
// Hooks: wupReg (weapons24.js), wupOn stats/fire/dmg/hit/kill/tick, hookOn('fire:after'); wraps wupStats (base retune).
// No shared file is edited. Loads after baseline1.js (reuses bl1Heavy, bl1Src, bl1Say).

const BL3 = { HG: 'v_phys_contact', reach: 70, reach0: 110, dmg: 14, dmg0: 30, rate: 2.2, cd0: 0.6, kickEvery: 5, kickDist: 170, flyDist: 200,
  arc: 160 * Math.PI / 180, iaiIdle: 1.5, parryPad: 24, spreadR: 60, reflWin: 1, reflLife: 8, chew: 0.5, lowHp: 0.2, lowSamurai: 0.3 };
const hgF = w => w.hg || (w.hg = {});
const hgS = () => G.bl3 || (G.bl3 = { refl: [], seen: new WeakSet() });
const hgIs = w => !!(w && !w.isSpell && w.def && w24Key(w) === BL3.HG);
const hgW = () => (G && G.weapons ? G.weapons.find(hgIs) : null);
const hgP = () => { const w = hgW(); return w && w.hg ? w.hg.p || '' : ''; };
const hgPale = '#f1ecff';

// ---------------------------------------------------------------- the rename
(function () {
  const row = W24.find(r => r[0] === BL3.HG); if (row) row[1] = 'Hand-to-gland';
  W24_BY[BL3.HG].name = 'Hand-to-gland';
  W24_DESC[BL3.HG] = 'Hits whatever gets too close. Hand-to-gland combat is as close as the name suggests, and no more hygienic.';
  const d = WEAPONS[BL3.HG];
  if (d) { d.name = 'Hand-to-gland'; d.desc = d.play = 'Hits whatever gets too close. Hand-to-gland combat is as close as the name suggests, and no more hygienic.'; d.icon = 'HG'; }
  if (typeof WL_ICON !== 'undefined' && WL_ICON[BL3.HG]) WL_ICON[BL3.HG][1] = 'HG';
})();

// ---------------------------------------------------------------- the base retune (always on, branch or not)
function hgBase(w, s) {
  const kr = BL3.reach / BL3.reach0;
  s.range *= kr; s.reach = (s.reach || s.range / kr) * kr;
  s.dmg *= BL3.dmg / BL3.dmg0;
  s.cd *= (1 / BL3.rate) / BL3.cd0;
  s.mag = 9999; s.reload = 0.01; // (no magazine: 2.2 hits a second means 2.2 hits a second)
}
wupStats = (orig => function (w, s) {
  if (hgIs(w)) hgBase(w, s); // (first, so the branch cards below scale the retuned numbers)
  orig(w, s);
})(wupStats);
function hgStats(w, s) {
  const f = hgF(w);
  if (f.p === 'A') { s.cd *= 0.5; s.dmg *= 0.7; }
  if (f.p === 'B') { s.cd *= BL3.rate; s.dmg *= 3; s.arc = BL3.arc; }
}

// ---------------------------------------------------------------- helpers (as wup1.js keeps them, closed over there)
function hgShove(e, ux, uy, dist) { // knock e away along (ux, uy) by about dist units (bosses, eggs and the very large don't move)
  if (!e || e.dead || e.boss || e.egg || e.def.spongy || e.def.heavy || e.tethT > G.t) return false;
  const l = Math.hypot(ux, uy) || 1;
  const k = dist * 3.9 * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1) * (e.cd && e.cd.def === 'squishy' ? 0.5 : 1);
  if (!(k > 0)) return false;
  e.kx += ux / l * k; e.ky += uy / l * k;
  return true;
}
function hgLunge(target, dist) { // modifiers.js lunge: forward through the target
  const p = G.player, S = modS(); if (S.lunge && S.lunge.left > 0) return false;
  const dx = target.x - p.x, dy = target.y - p.y, l = Math.hypot(dx, dy) || 1, d = Math.max(0, Math.min(dist, l + target.r));
  S.lunge = { ux: dx / l, uy: dy / l, left: d, v: d / 0.25 };
  return true;
}
// One swing of the weapon's own sweep (arsenal.js meleeSweep) over an arc: a cut, or a full circle for Thousand fists.
function hgSweep(w, target, src, arc, extra) {
  const s = w.s, p = G.player, a0 = target ? Math.atan2(target.y - p.y, target.x - p.x) : p.face, keep = s.arc;
  p.face = a0; w.swingN = (w.swingN || 0) + 1;
  s.arc = arc;
  try { meleeSweep(w, p.x, p.y, a0, extra ? Object.assign({}, src, extra) : src); } finally { s.arc = keep; }
  sfx('shot');
  return a0;
}

// ---------------------------------------------------------------- firing
function hgFire(w, target, src) {
  const f = hgF(w), p = G.player, s = w.s; if (!target) return false;
  f.swings = (f.swings || 0) + 1;
  f.kick = 0; f.cut = 0;
  if (f.p === 'A' && f.swings % BL3.kickEvery === 0) { // the kick
    f.kick = 1; f.kicks = (f.kicks || 0) + 1; f.kickT = G.realT;
    if (f.flying) hgLunge(target, BL3.flyDist);
  }
  let took = false;
  if (f.p === 'B') { // the cut
    f.cut = 1; f.cuts = (f.cuts || 0) + 1; f.cutAt = G.realT;
    const idle = G.t - (f.cutT == null ? -99 : f.cutT); f.cutT = G.t;
    const iai = f.iai && idle >= BL3.iaiIdle;
    if (iai) { bl1Say('iai', p.x, p.y - 30, 'SNICK', hgPale, 14, 0.4); f.iais = (f.iais || 0) + 1; }
    const a0 = hgSweep(w, target, src, f.fists ? TAU : s.arc, iai ? { mult: (src.mult || 1) * 2 } : null);
    if (f.parry) { // Parry: the cut destroys enemy shots in its arc
      const R = (s.reach || s.range) + BL3.parryPad;
      for (const b of G.ebul) {
        if (b.dead) continue;
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy);
        if (d > R + (b.r || 4) || (!f.fists && Math.abs(angDiff(Math.atan2(dy, dx), a0)) > s.arc / 2)) continue;
        b.dead = true; f.parried = (f.parried || 0) + 1; spawnPart(b.x, b.y, w.def.color, 4, 90, 0.25, 2); ring(b.x, b.y, 12, hgPale, 0.25, 3);
      }
    }
    took = true;
  } else if (f.fists) { // Thousand fists: the swing is a full circle
    hgSweep(w, target, src, TAU); took = true;
  }
  return took;
}
hookOn('fire:after', 'baseline3:after', w => { if (w && w.hg) { w.hg.kick = 0; w.hg.cut = 0; } });

// ---------------------------------------------------------------- damage and hits
function hgDmg(w, e, src) {
  const f = hgF(w);
  if (src.wupEcho) return 1;
  if (f.combo) return 1 + 0.08 * Math.min(5, e.hgN || 0); // Combo: +8% a hit on this enemy, up to +40%
  return 1;
}
function hgHit(w, e, res, src) {
  const f = hgF(w), p = G.player;
  if (!res || res.miss || !e) return;
  const dealt = (res.toHp || 0) + (res.toShell || 0) + (res.toMem || 0);
  // ---- Kung fu
  if (f.p === 'A' || f.combo || f.reflect) {
    if (f.combo) { // Combo: the count is per enemy; switching target drops the old one's
      if (!f.fists && f.comboE && f.comboE !== e) f.comboE.hgN = 0;
      f.comboE = e; e.hgN = (e.hgN || 0) + 1;
    }
    if (f.kick && !e.dead) {
      hgShove(e, e.x - p.x, e.y - p.y, BL3.kickDist);
      ring(e.x, e.y, e.r + 12, hgPale, 0.3, 6); fxParts('spark', e.x, e.y, hgPale, 10, 180, 0.35, 3); cam.shake = Math.min(8, cam.shake + 2);
      bl1Say('kick', e.x, e.y - e.r - 14, 'HIYAH', hgPale, 14, 0.3);
    }
    if (f.reflect && !e.dead) { // Wild: hit twice inside a second and its next shot goes back
      const ts = e.hgHitT || (e.hgHitT = []); ts.push(G.t); while (ts.length > 2) ts.shift();
      if (ts.length === 2 && ts[1] - ts[0] <= BL3.reflWin && !e.hgRefl) {
        const S = hgS(); e.hgRefl = G.t; ts.length = 0; S.refl.push(e);
        for (const b of G.ebul) if (b.owner === e) S.seen.add(b); // (only shots fired from now on are turned round)
        ring(e.x, e.y, e.r + 8, hgPale, 0.3, 4);
      }
    }
  }
  // ---- Samurai
  if (f.p === 'B') { // the first strike on a fresh enemy is heavy; under 30% health every cut is
    const low = f.low && p.hp < G.P.maxHp * BL3.lowSamurai;
    if (!f.clean && (!e.hgSeen || low)) { bl1Heavy(e, w, 0.333); ring(e.x, e.y, e.r + 12, hgPale, 0.3, 5); f.heavies = (f.heavies || 0) + 1; }
    e.hgSeen = 1;
  }
  if (f.clean) { bl1Heavy(e, w, 1); ring(e.x, e.y, e.r + 12, hgPale, 0.3, 5); } // Clean cut: a layer off and a stagger, every hit
  // ---- Biting
  if (f.p === 'C') {
    f.biteT = G.realT; f.bites = (f.bites || 0) + 1;
    const wasBleeding = f_bleeding(e);
    if (f.strip) bl1Heavy(e, w, 0); // wild: a bite on a Shelled enemy strips a layer
    fightStatus(e, 'arcane', res.raw || res.toHp || 1, src);
    if (dealt > 0) healPlayer(dealt * 0.04, true);
    if (f.chew && !e.dead) { e.snareT = Math.max(e.snareT || 0, G.t + BL3.chew); stun(e, BL3.chew); } // Chew toy: held
    if (f.rabies && wasBleeding && !e.dead && !(e.hgRabT > G.t)) { // Rabies: the Bleed spreads to neighbours
      e.hgRabT = G.t + 0.4; let n = 0;
      forNear(e.x, e.y, BL3.spreadR, q => { if (q === e || q.dead || q.egg || q.charmed || n >= 6) return false; n++; fightStatus(q, 'arcane', res.raw || 1, src); fxParts('spark', q.x, q.y, '#ff4d6d', 3, 80, 0.25, 2); return false; });
      if (n) ring(e.x, e.y, BL3.spreadR, '#ff4d6d', 0.3, 3);
    }
    if (f.jaws && !e.boss && !e.dead && e.hp > 0 && e.hp < e.maxHp * BL3.lowHp) { // Jaws: bites on the nearly dead kill outright
      damageEnemy(e, e.hp * 3 + 1, bl1Src(w, 'contact', {}));
      ring(e.x, e.y, e.r + 14, hgPale, 0.3, 6); f.jawsKills = (f.jawsKills || 0) + 1;
      healPlayer(G.P.maxHp * 0.1);
    }
  }
}
function hgKill(w, e) { // (a kill leaves its Combo and reflect marks behind with the corpse)
  e.hgN = 0; e.hgRefl = 0;
}

// ---------------------------------------------------------------- the reflect (Kung fu wild card)
function hgTick(w, dt) {
  const f = hgF(w), S = hgS();
  if (!S.refl.length) return;
  S.refl = S.refl.filter(e => !e.dead && e.hgRefl && G.t - e.hgRefl < BL3.reflLife);
  if (!S.refl.length) return;
  for (const b of G.ebul) {
    if (b.dead || S.seen.has(b)) continue;
    S.seen.add(b);
    const o = b.owner; if (!o || !o.hgRefl || o.dead) continue;
    b.dead = true; o.hgRefl = 0; S.refl = S.refl.filter(x => x !== o);
    damageEnemy(o, Math.max(b.dmg || 0, w.s.dmg * 2), bl1Src(w, 'proj', {}));
    bolt(b.x, b.y, o.x, o.y, hgPale, 0.2); ring(o.x, o.y, o.r + 10, hgPale, 0.3, 5); f.reflected = (f.reflected || 0) + 1;
  }
}

// ---------------------------------------------------------------- install and the cards
function hgInstall(w) {
  const f = hgF(w); if (f.inst) return; f.inst = 1;
  wupOn(w, 'stats', hgStats); wupOn(w, 'fire', hgFire); wupOn(w, 'dmg', hgDmg); wupOn(w, 'hit', hgHit); wupOn(w, 'kill', hgKill); wupOn(w, 'tick', hgTick);
}
(function () {
  const C = (name, desc, apply) => ({ name, desc, apply });
  const set = k => w => { hgF(w)[k] = 1; };
  const P = k => w => { hgF(w).p = k; hgInstall(w); recomputeAll(); };
  wupReg(BL3.HG, {
    A: { name: 'Kung fu', tag: 'Fast hands, then a kick', costs: 'each hit is 30% weaker.', shows: 'two small fists circling the head.', modes: 'HUNT and ORBIT keep you in reach.',
      lv3: { desc: 'Twice the hit rate. Every 5th hit is a kick that knocks back. Mostly practised alone.', apply: P('A') },
      lv6: [C('Combo', 'Each hit on the same enemy does 8% more, up to +40%. Resets when it dies or you switch. Rhythm is everything.', set('combo')), C('Flying kick', 'The kick becomes a lunge through the target. Technically gliding.', set('flying'))],
      wild: C('Return to Sender', 'An enemy hit twice within a second has its next shot reflected back at it. Returned, unopened.', set('reflect')) },
    B: { name: 'Samurai', tag: 'One clean cut a second', costs: 'you only cut once a second.', shows: 'a thin blade beside the head and a topknot.', modes: 'HOLD lets the crowd walk into the arc.',
      lv3: { desc: 'One cut a second at triple damage in a 160 degree arc, hitting all in reach. The first strike on a fresh enemy is a heavy hit.', apply: P('B') },
      lv6: [C('Iaijutsu', 'A cut after 1.5 s of not cutting does double. The sheath is doing most of the work.', set('iai')), C('Parry', 'A cut destroys enemy shots in its arc. The shots are not consulted.', set('parry'))],
      wild: C('Nothing to Lose', 'Under 30% health, every cut is a heavy hit. The body has stopped negotiating.', set('low')) },
    C: { name: 'Biting', tag: 'Bite, bleed, heal', costs: 'the range is the length of your face.', shows: 'a row of teeth along the leading edge of the head.', modes: 'HUNT keeps you on one enemy.',
      lv3: { desc: 'Bites Bleed and heal you 4% of the damage dealt. Technically a love bite, with the love removed.', apply: P('C') },
      lv6: [C('Chew toy', 'A bitten enemy is held for half a second. Chew thoroughly, as the leaflet says.', set('chew')), C('Rabies', 'Bleeding enemies you bite spread Bleed to neighbours within 60. Vaccination status: unknown.', set('rabies'))],
      wild: C('Nutcracker', 'A bite on a Shelled enemy strips a layer. Jaw strength is the whole technique.', set('strip')) },
    lv10: [
      { name: 'Thousand Fists', best: 'A', desc: 'Every hit lands on everything in reach, not just one enemy. Do not count the fists.', apply: set('fists') },
      { name: 'Clean Cut', best: 'B', desc: 'Cuts strip a Shell layer and stagger. Performed without anaesthetic, and without comment.', apply: set('clean') },
      { name: 'Jaws', best: 'C', desc: 'Bites on enemies under 20% health kill outright (not bosses) and heal 10%. Swallowed whole.', apply: set('jaws') }] });
})();

// (The costumes are baselinelook.js's, drawn with your body; this file only keeps the state they read: f.kickT, f.cutT, f.biteT.)

