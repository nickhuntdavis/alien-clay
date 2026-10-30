'use strict';
// Spawn Prawn - Baseline reimagined, part 2: the Shotgun (Maximum Gains renamed; ideas.md, 29 Oct 2026 second batch;
// BASELINE_REDESIGN.md "Part 2"). WUP['v_phys_spread'] is re-registered over wup1.js (the old cards stay there, unreachable).
//  - Lv 3 branches, one per film hero, each a different way to play the fan:
//      A Sperminator   two Shell layers on you that regrow every 12 s (pdef.js: D.layers; a wrap of pdRefit keeps them across refits).
//                      The first volley that hits an Elite marks it (baseline1.js mark: red crosshair, G.grudge, aim stays on it), +60% to it.
//                      Lv 6: Improved targeting (unlocks the FINISHER aim directive), Terminated (killing the mark heals 10% and marks the
//                      next Elite). Wild: pellets that hit the mark ricochet into a neighbour once at 70%.
//                      Mastery Judgement Day: three layers, and the mark explodes on death (Force, 120 area, 3x a pellet).
//      B Evil Dead     two weapons in one: the fan keeps firing, and a chainsaw in front of the head (reach 60, 6 Force Contact damage
//                      every 0.15 s) runs whenever something is in reach (front half only). Lv 6: Groovy (chainsaw kills reload the
//                      shotgun), Boomstick (a point-blank volley, target within 60, is a heavy hit with double knockback). Wild: a
//                      chainsaw kill rises as an ally for 3 s (charmed + zombie, as game.js updateEnemies / modwide.js Turncoat do).
//                      Mastery Hail to the King: reach 100, the chainsaw Bleeds, and a Bleeding enemy hit by pellets bursts (Blood, 60
//                      area, 2x a pellet; the burst eats the Bleed).
//      C Riding shotgun  damage +1% per 1% of swim speed over base (165), capped +60%, read each volley; pellets fired while moving
//                      +30% range; sprinting while firing costs no stamina (a wrap of stamTick refunds the frame's cost). Lv 6: Drive-by
//                      (passing within 60 of an enemy at speed fires a free volley at it, once a second), Handbrake turn (stopping dead
//                      fires a ring of 20 pellets, once every 3 s). Wild: a sidecar pod that fires a second, weaker fan while you move.
//                      Mastery Getaway: at full speed you take no Contact damage (hurt:before), every volley kicks you forward (modS lunge).
//  - Come back (sperm passive, mutCard, dealt only once Sperminator is taken): once a run, at 0 health you dry into an untouchable husk for
//    2 s and come back at 50% health with every status cleared (a wrap of genesLethal, which both hurtPlayer and the DoT ticks reach);
//    the robot skeleton costume for the rest of the run.
//  - Rename: Maximum Gains reads "Shotgun" (WEAPONS, W24, W24_BY, W24_DESC).
//  - Costumes: baselinelook.js draws them with your body (the Sperminator's endoskeleton, husk and skull, the chainsaw, the goggles),
//    reading G.bl2 (skel, huskT) and f.sawOn, f.hail from here; this file draws only the mark's crosshair and the sidecar pod (drawPlates).
//  Copy: every card, tag, cost and float is TODO_COPY:<id> (the user writes it); names the user gave are kept.
// Simplifications: a "heavy hit" is applied directly (a Shell layer off and Poise up, baseline1.js bl1Heavy); the husk is p.iframes; the
// sidecar is a plain orbit body, not a modifiers.js pet. Fit rules in fitcheck.js for the old Shotgun cards are left alone (inert now).
// Hooks: wupReg (weapons24.js), hookOn('fire:after'), hookOn('kill'), hookOn('tick'), hookOn('hurt:before'); wraps pdRefit (pdef.js), stamTick
// (stamina.js), genesLethal (genes.js), aimList (spsteer.js), drawPlates (bodymods.js); mutCard (mutations.js). Loads after baseline1.js.

const BL2 = { MG: 'v_phys_spread', name: 'Shotgun', markRange: 520, markK: 1.6, regrow: 12, sawReach: 60, sawHail: 100, sawDmg: 6, sawEvery: 0.15, sawCone: 1.75,
  rideCap: 0.6, rideRange: 1.3, base: 165, boomR: 60, driveR: 60, driveEvery: 1, handEvery: 3, handN: 20, ricK: 0.7, ricR: 220, judgeK: 3, judgeR: 120, hailR: 60, hailK: 2, husk: 2, allyT: 3 };
const bl2F = w => w.bl2 || (w.bl2 = {});
const bl2S = () => G.bl2 || (G.bl2 = { shellT: 0, huskT: 0, cb: 0, skel: 0, fireT: -9, layers: 0, judge: 0 });
const bl2W = () => (G && G.weapons ? G.weapons.find(w => w && !w.isSpell && w.def && w24Key(w) === BL2.MG) : null);
const bl2P = () => { const w = bl2W(); return w && w.bl2 ? w.bl2.p || '' : ''; };
const bl2Has = k => { const w = bl2W(); return !!(w && w.bl2 && w.bl2[k]); };
const bl2Pale = '#f1ecff';
const bl2Spd = () => { const p = G.player; return Math.hypot(p.vx || 0, p.vy || 0); };
const bl2Top = () => BL2.base * (G.P.speed || 1); // (top swim speed before a sprint)
const bl2Full = () => bl2Spd() >= 0.9 * bl2Top();
const bl2Head = () => { const p = G.player; return p.hd != null ? p.hd : p.face; };

// ---------------------------------------------------------------- the rename (Maximum Gains is the Shotgun)
(function () {
  const id = BL2.MG;
  if (typeof W24_BY !== 'undefined' && W24_BY[id]) W24_BY[id].name = BL2.name;
  if (typeof W24 !== 'undefined') { const r = W24.find(x => x[0] === id); if (r) r[1] = BL2.name; }
  if (typeof W24_DESC !== 'undefined') W24_DESC[id] = 'A wide fan of blunt pellets. Best used close, and by people who have made peace with the mess.';
  const d = WEAPONS[id]; if (d) { d.name = BL2.name; d.desc = d.play = 'A wide fan of blunt pellets. Best used close, and by people who have made peace with the mess.'; }
})();

// ---------------------------------------------------------------- shared helpers
function bl2Src(w, atk, extra) { return Object.assign({ elem: 'phys', w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name }, extra); }
function bl2Say(key, x, y, txt, color, size, gap) { return bl1Say(key, x, y, txt, color, size, gap); }
function bl2Shove(e, ux, uy, dist) { // (wup1.js shove, which is closed over there)
  if (!e || e.dead || e.boss || e.egg || e.def.spongy || e.def.heavy || e.tethT > G.t) return false;
  const l = Math.hypot(ux, uy) || 1, k = dist * 3.9 * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1) * (e.cd && e.cd.def === 'squishy' ? 0.5 : 1);
  e.kx += ux / l * k; e.ky += uy / l * k; return true;
}
function bl2Kick(dist) { // push the swimmer forward along its head (wup1.js recoil / modifiers.js lunge)
  const S = modS(), a = bl2Head(); if (S.lunge && S.lunge.left > 0) return;
  S.lunge = { ux: Math.cos(a), uy: Math.sin(a), left: dist, v: dist / 0.25 };
}
// A volley of the weapon's own at a target, outside its cooldown (Drive-by); tagged like a normal one.
function bl2Volley(w, tgt) {
  if (w._in || !tgt || tgt.dead) return false;
  const n0 = G.proj.length; w._in = 1; w.bl2aim = tgt;
  try { fireWeapon(w, tgt); } finally { w._in = 0; }
  bl2After(w, tgt, n0); return true;
}

// ---------------------------------------------------------------- Sperminator: the Shell on you
const bl2Extra = () => (bl2P() === 'A' ? (bl2Has('judge') ? 3 : 2) : 0);
const bl2BaseLayers = D => Math.min(Math.max(D.n.shell, RELIC10.shellCap), D.n.shell + (typeof relShell === 'function' ? relShell() : 0));
pdRefit = (orig => function (D) { orig(D); const x = bl2Extra(); if (x) { D.layers += x; D.layerHp = pdLayerHp(); } })(pdRefit); // (a wave start or the race refit keeps the extra layers)
function bl2Layers(n) { const D = pdef(), S = bl2S(); D.layers += n; if (D.layerHp <= 0 || D.layers === n) D.layerHp = pdLayerHp(); S.layers += n; ring(G.player.x, G.player.y, G.player.r + 16, FIGHT_COL.shell, 0.35, 5); }
function bl2ShellTick() {
  const D = pdef(), S = bl2S(), cap = bl2BaseLayers(D) + bl2Extra();
  if (G.t < S.shellT) return;
  S.shellT = G.t + BL2.regrow;
  if (D.layers < cap) { const was = D.layers; D.layers++; if (!was) D.layerHp = pdLayerHp(); ring(G.player.x, G.player.y, G.player.r + 16, FIGHT_COL.shell, 0.3, 4); }
}

// ---------------------------------------------------------------- the mark (baseline1.js owns the list and the crosshair; this is the Sperminator's)
const bl2Elite = e => bl1Elite(e);
function bl2Unmark(e) { if (!e) return; e.bl2mk = 0; bl1Unmark(e); }
function bl2SetMark(w, e) {
  if (!e || e.dead || e.egg || e.charmed) return false;
  const S = bl1S();
  S.marks = S.marks.filter(x => !x.dead && x.bl1mk && x !== e);
  while (S.marks.length >= 1) bl2Unmark(S.marks[0]);
  e.bl1mk = 1; e.bl2mk = 1; e.bl1mkT = G.t; S.marks.push(e); G.grudge = e;
  ring(e.x, e.y, e.r + 10, '#ff4d6d', 0.35, 4); bl2Say('mgmark', e.x, e.y - e.r - 12, 'ACQUIRED', '#ff4d6d', 12, 0.4);
  return true;
}
const bl2LiveMark = () => bl1S().marks.some(e => !e.dead && e.bl1mk);
function bl2MarkNext(w) { // the nearest Elite in range
  const p = G.player; let best = null, bd = 1e18;
  forNear(p.x, p.y, BL2.markRange, (e, d2) => { if (e.dead || e.egg || e.charmed || e.bl1mk || !bl2Elite(e)) return false; if (d2 < bd) { bd = d2; best = e; } return false; });
  return best ? bl2SetMark(w, best) : false;
}
hookOn('kill', 'baseline2:mark', (e, src) => {
  if (!e || !e.bl2mk) return;
  const w = bl2W(); bl2Unmark(e); if (!w || bl2P() !== 'A') return;
  const f = bl2F(w);
  if (f.judge) { aoe(e.x, e.y, BL2.judgeR, w.s.dmg * BL2.judgeK, bl2Src(w, 'burst', { noStatus: true }), w.def.color); ring(e.x, e.y, BL2.judgeR, bl2Pale, 0.3, 4); }
  if (f.term) { healPlayer(G.P.maxHp * 0.1); bl2MarkNext(w); }
});

// ---------------------------------------------------------------- Evil Dead: the chainsaw
function bl2Saw(w, dt) {
  const f = bl2F(w); f.sawT = (f.sawT || 0) + dt;
  if (f.sawT < BL2.sawEvery) return;
  f.sawT -= BL2.sawEvery; if (f.sawT > BL2.sawEvery) f.sawT = 0;
  const p = G.player, hd = bl2Head(), reach = f.hail ? BL2.sawHail : BL2.sawReach;
  const src = Object.assign(weaponSrc(w), { elem: 'phys', atk: 'contact', wupEcho: true, noCrit: true, noProc: true, noArc: true, bl2saw: 1, knock: 0 }); // (weaponSrc: your damage multipliers, no knockback so it stays in reach)
  let any = 0;
  forNear(p.x, p.y, reach, e => {
    if (e.dead || e.egg || e.charmed) return false;
    if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), hd)) > BL2.sawCone) return false;
    any++; damageEnemy(e, BL2.sawDmg, src);
    if (!e.dead && f.hail && !(e.bl2bleedT > G.t)) { e.bl2bleedT = G.t + 1; fightStatus(e, 'arcane', BL2.sawDmg * 5, src); }
    if (Math.random() < 0.5) fxParts('spark', e.x, e.y, '#ffd9a0', 2, 90, 0.25, 2);
    return false;
  });
  if (any) f.sawOn = G.t;
}
function bl2Rise(w, e) { // Turncoat's rise (modwide.js mwRise) with a 3 s life
  if (e.elite || e.boss || e.rival || e.egg || e.charmed || e.bl2ally) return;
  const z = makeEnemy(e.def, e.x, e.y);
  z.charmed = true; z.charmT = BL2.allyT; z.zombie = true; z.xp = 0; z.bl2ally = 1; z.name = e.name; z.hp = z.maxHp = z.maxHp * 0.5;
  if (G.enemies.length < CAPS.enemies) G.enemies.push(z);
  ring(z.x, z.y, z.r + 8, bl2Pale, 0.4, 3);
}

// ---------------------------------------------------------------- Riding shotgun
const bl2Ride = () => bl2P() === 'C';
stamTick = (orig => function (dt) { // sprinting while firing costs no stamina
  const S0 = G && G.stam, c0 = S0 ? S0.cur : 0, w0 = S0 ? S0.winded : false;
  orig(dt);
  const S = G && G.stam;
  if (S && S.sprint && c0 > 0.5 && bl2Ride() && G.t - bl2S().fireT < 0.5) { S.cur = c0; S.winded = w0; }
})(stamTick);
function bl2PetPos() { const p = G.player, a = bl2Head(), c = Math.cos(a), s = Math.sin(a); return { x: p.x + c * -8 - s * 30, y: p.y + s * -8 + c * 30 }; }
function bl2Ride_tick(w, dt) {
  const f = bl2F(w), p = G.player, spd = bl2Spd(), top = bl2Top();
  if (f.driveby && G.t >= (f.dbT || 0) && spd >= 0.6 * top) { // Drive-by
    let best = null, bd = 1e18;
    forNear(p.x, p.y, BL2.driveR, (e, d2) => { if (e.dead || e.egg || e.charmed) return false; if (d2 < bd) { bd = d2; best = e; } return false; });
    if (best && bl2Volley(w, best)) { f.dbT = G.t + BL2.driveEvery; fxParts('smoke', p.x, p.y, '#e8e8e8', 4, 70, 0.4, 5); ring(p.x, p.y, p.r + 10, bl2Pale, 0.25, 3); }
  }
  if (f.brake) { // Handbrake turn
    if (spd >= 0.6 * top) f.moveT = (f.moveT || 0) + dt;
    else if (spd < 25) {
      if ((f.moveT || 0) > 0.4 && G.t >= (f.hbT || 0)) {
        f.hbT = G.t + BL2.handEvery; const s = w.s, src = weaponSrc(w);
        for (let i = 0; i < BL2.handN; i++) spawnProj(w, p.x, p.y, i / BL2.handN * TAU, src, { dmg: s.dmg });
        ring(p.x, p.y, 60, bl2Pale, 0.3, 4); fxParts('smoke', p.x, p.y, '#e8e8e8', 6, 90, 0.5, 6); cam.shake = Math.min(8, cam.shake + 2);
      }
      f.moveT = 0;
    }
  }
  if (f.pod && spd > 40) { // Sidecar: a second, weaker fan from the pod while you move
    f.podT = (f.podT || 0) - dt;
    if (f.podT <= 0) {
      const o = bl2PetPos(), t = acquire('nearest', w.s.range, o.x, o.y);
      if (t) {
        f.podT = w.s.cd * 1.5; const s = w.s, n = Math.max(3, Math.ceil(s.count / 2)), a0 = Math.atan2(t.y - o.y, t.x - o.x), src = weaponSrc(w);
        for (let i = 0; i < n; i++) spawnProj(w, o.x, o.y, a0 + (n > 1 ? (i / (n - 1) - 0.5) * s.spread : 0), src, { dmg: s.dmg * 0.5, bl2pod: 1 });
        fxParts('spark', o.x, o.y, w.def.color, 3, 60, 0.2, 2);
      } else f.podT = 0.25;
    }
  }
}
hookOn('hurt:before', 'baseline2:getaway', (dmg, from, ent, kind) => { // Getaway: no Contact damage at full speed
  if (kind === 'contact' && G && G.player && bl2Ride() && bl2Has('getaway') && bl2Full()) return null;
  return dmg;
}, 60);

// ---------------------------------------------------------------- firing
function bl2Fire(w, target) { // Sperminator: no switching off the mark while it is in range
  if (w._in) return false;
  w.bl2aim = target;
  if (bl2F(w).p !== 'A') return false;
  const p = G.player, m = bl1Mark(p.x, p.y, w.s.range);
  if (m && m !== target) { w.bl2aim = m; w._in = 1; try { fireWeapon(w, m); } finally { w._in = 0; } return true; }
  return false;
}
function bl2After(w, tgt, n0) { // tag the volley's pellets (fire:after, and a free volley)
  const f = bl2F(w), p = G.player, news = G.proj.slice(n0).filter(pr => pr.w === w && !pr.dead);
  if (!news.length) return;
  if (f.p === 'C') {
    const over = clamp(bl2Spd() / BL2.base - 1, 0, BL2.rideCap), mv = bl2Spd() > 30; // (swim speed over base: sprint and speed cards)
    for (const pr of news) { if (over > 0) pr.dmg *= 1 + over; if (mv) { pr.life *= BL2.rideRange; pr.max *= BL2.rideRange; } }
    if (f.getaway) bl2Kick(36);
  }
  if (f.p === 'B' && f.boom && tgt && !tgt.dead && Math.hypot(tgt.x - p.x, tgt.y - p.y) - tgt.r <= BL2.boomR) { // Boomstick
    const vol = { hit: new Set() };
    for (const pr of news) { pr.bl2boom = vol; pr.src = Object.assign({}, pr.src, { knock: Math.max(30, w.s.knock || 0) * 2 }); }
    ring(p.x, p.y, 40, bl2Pale, 0.25, 4); cam.shake = Math.min(8, cam.shake + 2);
  }
}
hookOn('fire:after', 'baseline2:after', (w, target, n0) => {
  if (G) bl2S().fireT = G.t; // (any weapon: sprinting while firing)
  if (!w || w.isSpell || !w.bl2 || !w.bl2.p || w._in) return;
  const tgt = w.bl2aim || target; w.bl2aim = null;
  bl2After(w, tgt, n0);
});

// ---------------------------------------------------------------- damage and hits
function bl2Dmg(w, e, src) {
  if (src.wupEcho) return 1;
  if (bl2F(w).p === 'A' && e.bl2mk) return BL2.markK;
  return 1;
}
function bl2Phit(w, pr, e) {
  if (pr.bl2rc || (pr.src && pr.src.wupEcho)) return;
  const f = bl2F(w), p = G.player;
  if (f.p === 'A') {
    if (!e.bl2mk && bl2Elite(e) && !bl2LiveMark()) bl2SetMark(w, e); // the first volley on an Elite
    if (f.ric && e.bl2mk) { // pellets that hit the mark bounce into a neighbour, once
      let best = null, bd = 1e18;
      forNear(e.x, e.y, BL2.ricR, (o, d2) => { if (o === e || o.dead || o.egg || o.charmed) return false; if (d2 < bd) { bd = d2; best = o; } return false; });
      if (best) { const a = Math.atan2(best.y - e.y, best.x - e.x); spawnProj(w, e.x + Math.cos(a) * (e.r + 3), e.y + Math.sin(a) * (e.r + 3), a, pr.src, { dmg: pr.dmg * BL2.ricK, life: 0.35, max: 0.35, bl2rc: 1 }); }
    }
  }
  if (f.p === 'B') {
    if (pr.bl2boom && !pr.bl2boom.hit.has(e)) { pr.bl2boom.hit.add(e); bl1Heavy(e, w, 0.5); ring(e.x, e.y, e.r + 12, '#ffffff', 0.3, 5); }
    if (f.hail && f_bleeding(e) && !e.dead) { // a Bleeding enemy hit by pellets bursts, and the burst eats the Bleed
      e.bleeds = [];
      aoe(e.x, e.y, BL2.hailR, pr.dmg * BL2.hailK, bl2Src(w, 'burst', { elem: 'arcane', noStatus: true }), '#c9184a');
    }
  }
}
function bl2Kill(w, e, src) {
  const f = bl2F(w);
  if (f.p === 'B' && src && src.bl2saw) {
    if (f.groovy) { w.ammo = w.s.mag; w.reloadT = 0; ring(G.player.x, G.player.y, 22, bl2Pale, 0.3, 3); }
    if (f.rise) bl2Rise(w, e);
  }
}
function bl2Tick(w, dt) {
  const f = bl2F(w);
  if (f.p === 'A') {
    bl2ShellTick();
    const S = bl1S(), p = G.player;
    for (const e of S.marks.slice()) if (e.bl2mk && (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 1000)) bl2Unmark(e);
  }
  if (f.p === 'B') bl2Saw(w, dt);
  if (f.p === 'C') bl2Ride_tick(w, dt);
}

// ---------------------------------------------------------------- the FINISHER directive (Improved targeting; baseline1.js builds it for Robocop)
const bl2Finisher = () => bl2P() === 'A' && bl2Has('targ');
aimList = (orig => function () {
  const L = orig();
  if (!bl2Finisher() || L.some(d => d.id === 'finisher')) return L;
  const d = DIRECTIVES.find(x => x.id === 'finisher'); return d ? L.concat([d]) : L;
})(aimList);

// ---------------------------------------------------------------- Come back
function bl2Clear() { // every status off you (pdef.js: Snared, Bleeding, Burning, Charged)
  const D = pdef(); D.snareT = 0; D.bleeds = []; D.burnPool = 0; D.burnT = 0; D.chargeT = 0;
}
genesLethal = (orig => function () {
  if (G && G.bl2 && G.bl2.huskT > G.t) { G.player.hp = 1; return true; } // (already a husk: the death check cannot land)
  if (G && typeof mr === 'function' && mr('pass_comeback') > 0 && bl2P() === 'A' && !bl2S().cb) {
    const S = bl2S(), p = G.player; S.cb = 1; S.huskT = G.t + BL2.husk; S.skel = 1;
    p.hp = 1; p.iframes = Math.max(p.iframes || 0, BL2.husk + 0.05); bl2Clear();
    ring(p.x, p.y, p.r + 18, '#8b6f47', 0.6, 5); cam.shake = Math.min(10, cam.shake + 4);
    return true;
  }
  return orig();
})(genesLethal);
hookOn('tick', 'baseline2:comeback', dt => {
  if (!G || G.state !== 'play' || !G.bl2) return;
  const S = G.bl2;
  if (S.huskT && G.t >= S.huskT) {
    S.huskT = 0; const p = G.player; p.hp = Math.max(p.hp, G.P.maxHp * 0.5); bl2Clear();
    bl1Say('mgcb', p.x, p.y - 36, 'REBOOT', '#ff2e2e', 14, 0.5);
    ring(p.x, p.y, p.r + 24, '#ff2e2e', 0.5, 5); fxParts('spark', p.x, p.y, '#ff2e2e', 12, 160, 0.5, 3);
  }
});
if (typeof mutCard === 'function') {
  mutCard({ id: 'pass_comeback', title: 'Come back', icon: 'CB', rarity: 2, maxRank: 1, family: 'mut:body', flavour: 'Rehydrated. Reinforced. Slightly more chrome than before.',
    desc: 'Once a run, at 0 health you dry into an untouchable husk for 2 s, then return at 50% health with every status cleared. Now a robot skeleton.', why: () => '' }); // (gated on Sperminator by a Do rule in cardrules.js, 30 Oct)
}

// ---------------------------------------------------------------- install and the cards
function bl2Install(w) {
  const f = bl2F(w); if (f.inst) return; f.inst = 1;
  wupOn(w, 'fire', bl2Fire); wupOn(w, 'dmg', bl2Dmg); wupOn(w, 'phit', bl2Phit); wupOn(w, 'kill', bl2Kill); wupOn(w, 'tick', bl2Tick);
}
(function () {
  const C = (name, desc, apply) => ({ name, desc, apply });
  const set = k => w => { bl2F(w)[k] = 1; };
  const P = (k, extra) => w => { bl2F(w).p = k; bl2Install(w); if (extra) extra(w); recomputeAll(); };
  const layers = w => { const S = bl2S(); if (!S.layers) bl2Layers(2); };
  const judge = w => { const S = bl2S(); bl2F(w).judge = 1; if (!S.judge) { S.judge = 1; bl2Layers(1); } };
  wupReg(BL2.MG, {
    A: { name: 'Sperminator', tag: 'Mark it and keep coming', costs: 'your aim will not leave the mark.', shows: 'segmented metal plates on the head and a red eye; the mark wears a crosshair.', modes: 'REVENGE follows the mark.',
      lv3: { desc: 'Two Shell layers on you, regrown every 12 s. The first volley on an Elite marks it: +60% to it, and your aim stays on it.', apply: P('A', layers) },
      lv6: [C('Improved targeting', 'Adds the FINISHER rule to every weapon aim menu: nearest, but anything in range under 15% health first. It finishes what it starts.', set('targ')), C('Terminated', 'Killing the mark heals 10% of max health and marks the next Elite. No hard feelings, none at all.', set('term'))],
      wild: C('Liquid Metal', 'Pellets that hit the mark bounce once into its neighbours at 70%. Everything in here is mostly liquid.', set('ric')) },
    B: { name: 'Evil Dead', tag: 'Two weapons, no waiting', costs: 'the saw only works within 60 of the enemy.', shows: 'a toothed blade in front of the head that spins while it runs.', modes: 'HUNT and ORBIT keep things in the saw.',
      lv3: { desc: 'The fan keeps firing at range. A chainsaw on your head (reach 60, 6 damage every 0.15 s) runs whenever something is in reach. Medically unwise.', apply: P('B') },
      lv6: [C('Groovy', 'Chainsaw kills reload the shotgun. Multitasking, one limb short.', set('groovy')), C('Boomstick', 'A point-blank volley (target within 60) is a heavy hit with double knockback. Safety is for the other end.', set('boom'))],
      wild: C('Raised Hand', 'An enemy killed by the chainsaw rises as an ally for 3 s. It has no ambitions beyond that.', set('rise')) },
    C: { name: 'Riding shotgun', tag: 'Faster is stronger', costs: 'standing still gets you nothing extra.', shows: 'a speed streak behind the tail; a puff on each drive-by.', modes: 'KITE and ORBIT keep you at speed.',
      lv3: { desc: 'Damage +1% per 1% of swim speed over base, up to +60%. Pellets fired while moving reach 30% further. Sprinting while firing costs no stamina.', apply: P('C') },
      lv6: [C('Drive-by', 'Passing within 60 of an enemy at speed fires a free volley at it, once a second. Eyes on the road are optional.', set('driveby')), C('Handbrake turn', 'Stopping dead fires a full ring of pellets all round you, once every 3 s. Whiplash is a sperm-specific hazard.', set('brake'))],
      wild: C('Sidecar', 'A small pet in a sidecar fires a second, weaker fan while you move. It has not been vaccinated.', set('pod')) },
    lv10: [
      { name: 'Judgement Day', best: 'A', desc: 'Three Shell layers, and the mark explodes when it dies (Force, 120 area, three times a pellet). A short day.', apply: judge },
      { name: 'Hail to the King', best: 'B', desc: 'Chainsaw reach 100, and its hits Bleed. A Bleeding enemy hit by pellets bursts (Blood, 60 area, twice a pellet). Cabin sold separately.', apply: set('hail') },
      { name: 'Getaway', best: 'C', desc: 'At full speed you take no Contact damage, and every volley kicks you forward. The speed limit is a suggestion.', apply: set('getaway') }] });
})();

// ---------------------------------------------------------------- costumes
function bl2Costume(px, py) {
  if (!G || !G.player) return;
  const w = bl2W(), p = bl2P(), S2 = G.bl2; if (!w || !p) return;
  const pl = G.player, k = S * (typeof playerScale === 'function' ? playerScale() : 1), face = bl2Head(), t = G.realT;
  const raw = RAW_COL; RAW_COL = true; // (the costumes on the head are baselinelook.js's: here only the mark and the sidecar, in the world)
  if (p === 'A') for (const e of bl1S().marks) { // the mark's crosshair ring in the world
    if (e.dead || !e.bl2mk) continue;
    const x = sx(e.x), y = sy(e.y), r = (e.r + 9) * S, a = t * 1.5;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.strokeStyle = '#ff2e2e'; ctx.lineWidth = 2; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 4; i++) { const q = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(Math.cos(q) * (r - 5), Math.sin(q) * (r - 5)); ctx.lineTo(Math.cos(q) * (r + 6), Math.sin(q) * (r + 6)); ctx.stroke(); }
    ctx.restore();
  }
  if (p === 'C' && bl2F(w).pod) { // the sidecar pod
    const o = bl2PetPos(), x = sx(o.x), y = sy(o.y), r = 6 * S;
    ctx.save(); ctx.translate(x, y); ctx.rotate(face); ctx.globalAlpha = 0.95; ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgb(48,54,50)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.3, r, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r * 0.6, 0); ctx.lineTo(r * 2, 0); ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1; RAW_COL = raw;
}
drawPlates = (orig => function (px, py) { orig(px, py); try { bl2Costume(px, py); } catch (e) { } })(drawPlates);
