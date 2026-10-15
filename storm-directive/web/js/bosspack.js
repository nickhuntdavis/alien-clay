'use strict';
// Spawn Prawn - the boss pack: six bosses that each teach one mechanic. The Litmus Strip (one damage type at a
// time), the Johnny (shots bounce off its front: hit it from behind), the Mucus Plug (a sealed ring that widens
// as you break its plugs), the Cramp (a pull you sprint out of), the Sneeze (huge telegraphed cones) and the
// Kidney Stone (40 armour: shred is the way in). Their moves, tells, sprites and relics live here; the defs are
// in data.js (BOSSES, RELICS) and the entourages in campaign.js.
// Hooks (bosses.js): bpSpawn (spawnBoss), bpSpecial (bossSpecial), bpUpkeep (bossUpkeep), bpDamageMul
// (bossDamageMul), bpBounce (bossDodges), bpPlug (orbitNurse), bpTick (updateBosses), bpDown (bossDown), bpPhase
// (bossEnrage), bpDanger (hazardDanger), bpRelicApply/Hit/Kill/In/Hurt/Dodge/Tick (the relic hooks).
// Hook (render.js): bpDraw (drawHazards).

const BP = { litmusEvery: 12, soak: 4, wrong: 0.25, ringR0: 380, ringStep: 110, pull: 72, coneLen: 720, coneHalf: 0.32, coneTrack: 0.9, sneezeK: 1.8, turn: 0.75 };
const LITMUS_TYPES = ['phys', 'fire', 'ice', 'shock', 'poison', 'oxi', 'salt', 'arcane'];
const PLUG_DEF = { name: 'Mucus Plug', hp: 1, speed: 0, armour: 0, r: 26, dmg: 0, xp: 10, color: '#d9f0a3', shape: 'mucusplug', ai: 'plug', from: 99999, w: 0 };
let BP_BACK = null; // the boss a projectile just hit from behind (the Johnny: set by bpBounce, read once by bpDamageMul)

const bpBd = e => e.def.dmg * 0.35 * dmgNow() * (e.campK || 1); // (the same as bossAI's bullet damage)
function bpOwnTypes() {
  const s = new Set();
  for (const w of G.weapons.concat(G.spells)) if (w && w.s) s.add(weaponSrc(w).elem || 'phys');
  return [...s];
}
function bpShoot(e, fn) { const n = shooterName, s = shooterEnt; shooterName = e.name; shooterEnt = e; fn(); shooterName = n; shooterEnt = s; }

// ---------------------------------------------------------------- arrival
function bpSpawn(e) {
  const d = e.def;
  if (d.litmus) bpLitmusShift(e, true);
  if (d.latex) e.face = Math.atan2(me().y - e.y, me().x - e.x);
  if (d.stone) e.armK = 1; // (its armour is the whole point: it doesn't grow with the clock)
}

// ---------------------------------------------------------------- the Litmus Strip
function bpLitmusShift(e, first) {
  // Half the time it tests something you are actually carrying, so one-type builds get their turn.
  const own = bpOwnTypes().filter(t => t !== e.lit), all = LITMUS_TYPES.filter(t => t !== e.lit);
  e.lit = own.length && Math.random() < 0.5 ? pick(own) : pick(all);
  const ph = e.bphase || 0;
  e.litT = BP.litmusEvery * (ph === 2 ? 0.6 : ph === 1 ? 0.8 : 1);
  e.soakUntil = G.t + BP.soak;
  if (first) return;
  const c = ELEMENTS[e.lit].color;
  ring(e.x, e.y, e.r * 2.4, c, 0.6, 6); spawnPart(e.x, e.y, c, 16, 200, 0.6, 3);
  floatText(e.x, e.y - e.r - 20, 'SOAKED! THEN ' + ELEMENTS[e.lit].name.toUpperCase() + ' ONLY', c, 14, 1.4);
  bpShoot(e, () => { for (let i = 0; i < 16; i++) eBullet(e.x, e.y, i / 16 * TAU + e.age, 115, bpBd(e), 6); });
}

// ---------------------------------------------------------------- the Johnny
const bpFront = (e, x, y) => Math.abs(angDiff(Math.atan2(y - e.y, x - e.x), e.face || 0)) < 1.1; // (its latex end: about 125 degrees)
// From bossDodges, for every projectile that reaches a boss: true means the shot is spent (bounced).
function bpBounce(e, pr) {
  if (!e.def.latex || !pr || pr.orbitT > 0) return false;
  if (!bpFront(e, pr.x - (pr.vx || 0) * 0.03, pr.y - (pr.vy || 0) * 0.03)) { BP_BACK = e; return false; }
  pr.dead = true;
  if (G.realT >= (e.bounceT || 0)) {
    e.bounceT = G.realT + 0.14; // (fast guns don't turn it into a bullet hose)
    const p = me();
    bpShoot(e, () => eBullet(pr.x, pr.y, Math.atan2(p.y - pr.y, p.x - pr.x) + rand(-0.15, 0.15), 230, bpBd(e) * 0.5, 5));
  }
  if (!(e.boingT > G.realT)) { e.boingT = G.realT + 0.7; floatText(pr.x, pr.y - 10, 'BOING', XR.white, 13, 0.6); }
  return true;
}

// ---------------------------------------------------------------- the Mucus Plug
function bpSeal(e) {
  const p = me(), c = G.core;
  let x = p.x, y = p.y;
  if (G.wave && !G.lvl) { const lim = Math.max(0, CORE.arena - DISH_IN - BP.ringR0 + 40), d = Math.hypot(x - c.x, y - c.y); if (d > lim) { x = c.x + (x - c.x) / d * lim; y = c.y + (y - c.y) / d * lim; } }
  const R = G.bpRing = { x, y, r: BP.ringR0 * 2.2, want: BP.ringR0, n: 0, broken: 0, a0: Math.random() * TAU };
  // The boss comes in with you.
  const bd = Math.hypot(e.x - x, e.y - y);
  if (bd > BP.ringR0 - e.r - 60) { const a = Math.atan2(e.y - y, e.x - x); e.x = x + Math.cos(a) * (BP.ringR0 * 0.55); e.y = y + Math.sin(a) * (BP.ringR0 * 0.55); }
  for (let i = 0; i < (e.def.plugs || 4); i++) {
    const g = makeEnemy(PLUG_DEF, x, y);
    g.plugA = R.a0 + i / 4 * TAU; g.orbitBoss = e; g.hp = g.maxHp = e.maxHp * 0.055; g.armour = 0; g.dmg = 0; g.xp = 10;
    G.enemies.push(g); R.n++;
  }
  e.sealed = true;
  banner('SEALED IN: BREAK THE FOUR PLUGS', PAL.danger);
  ring(x, y, BP.ringR0, '#d9f0a3', 0.9, 8);
}
// The plugs sit in the wall of the seal (from orbitNurse).
function bpPlug(e) {
  const R = G.bpRing;
  if (!R) { e.dead = true; return true; }
  const a = e.plugA + Math.sin(G.t * 0.3) * 0.05;
  e.x = R.x + Math.cos(a) * R.r; e.y = R.y + Math.sin(a) * R.r; e.kx = e.ky = 0;
  return true;
}
function bpRingTick(dt) {
  const R = G.bpRing, b = G.boss;
  if (!b || b.dead || !b.def.plugs) { G.bpRing = null; for (const o of G.enemies) if (o.plugA != null) o.dead = true; return; }
  let alive = 0;
  for (const o of G.enemies) if (o.plugA != null && !o.dead) alive++;
  const broken = R.n - alive;
  if (broken > R.broken) {
    R.broken = broken;
    cam.shake = Math.max(cam.shake, 8); sfx('boom');
    if (alive) floatText(me().x, me().y - 40, `PLUG BROKEN: ${alive} TO GO`, PAL.reward, 15, 1.2);
  }
  if (!alive) {
    G.bpRing = null; b.bpOpen = true;
    banner('THE PLUG IS OUT: IT TAKES +25%', PAL.reward);
    ring(R.x, R.y, R.r, '#d9f0a3', 1, 10); fxParts('drop', R.x, R.y, '#d9f0a3', 30, 500, 0.8, 5);
    return;
  }
  R.want = BP.ringR0 + broken * BP.ringStep;
  R.r = lerp(R.r, R.want, 1 - Math.pow(0.12, dt));
  // You (and the boss) stay inside; enemy shots and the entourage ooze straight through.
  for (const [o, pad] of [[me(), me().r + 4], [b, b.r * 0.6]]) {
    const dx = o.x - R.x, dy = o.y - R.y, d = Math.hypot(dx, dy) || 1, lim = R.r - pad;
    if (d > lim) {
      o.x = R.x + dx / d * lim; o.y = R.y + dy / d * lim;
      const out = (o.vx || 0) * dx / d + (o.vy || 0) * dy / d;
      if (out > 0 && o.vx != null) { o.vx -= dx / d * out; o.vy -= dy / d * out; }
    }
  }
}

// ---------------------------------------------------------------- the Sneeze
const bpCones = e => (e.bphase || 0) >= 2 ? [e.coneA - 0.55, e.coneA + 0.55] : [e.coneA];
function bpInCone(e, a, x, y, pad) {
  const px = x - e.x, py = y - e.y, d = Math.hypot(px, py);
  return d < BP.coneLen + pad && Math.abs(angDiff(Math.atan2(py, px), a)) < BP.coneHalf + pad / Math.max(80, d);
}
function bpSneeze(e, bd) {
  const p = me();
  for (const a of bpCones(e)) {
    if (bpInCone(e, a, p.x, p.y, p.r * 0.5)) hurtPlayer(bd * BP.sneezeK, e.name + ' sneeze', e);
    bpShoot(e, () => { for (let i = 0; i < 8; i++) eBullet(e.x, e.y, a + rand(-BP.coneHalf, BP.coneHalf) * 0.9, rand(200, 360), bd * 0.4, rand(3.5, 6)); });
    fxParts('drop', e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r, '#e6f4ff', 26, 700, 0.6, 4, a, BP.coneHalf);
  }
  floatText(e.x, e.y - e.r - 16, 'CHOO!', XR.white, 20, 0.9);
  cam.shake = Math.max(cam.shake, 12); sfx('boom'); vibrate(60);
}

// ---------------------------------------------------------------- moves (from bossSpecial)
function bpSpecial(e, pat, dt, dist, ux, uy, aim, bd) {
  const p = me();
  // The Cramp, winded after you snapped its tendon: it just lies there.
  if (e.def.grip && e.winded > G.t) { e.mvs = 0; e.gripping = false; return true; }
  if (e.def.latex && e.bpExposed > G.t) {
    // Overshot: it drifts on with its open end towards you until it has turned round.
    e.mvx = Math.cos(e.face); e.mvy = Math.sin(e.face); e.mvs = e.speed * 0.4;
    return true;
  }
  switch (pat) {
    case 'litmusdrip':
      if (e.fireT <= 0) { e.fireT = 0.32; e.spin += 0.5; for (let k = 0; k < 2; k++) eBullet(e.x, e.y, e.spin + k * Math.PI, 120, bd, 6); }
      return true;
    case 'johnnyroll':
      // A wind-up (it rears back, aimed down its front), a charge, then it overshoots and is left facing away.
      if (e.st === 0) { e.st = 1; e.stT = 0.9; }
      if (e.st === 1) {
        e.mvs = 0; e.stT -= dt; e.rolling = true;
        e.dashX = Math.cos(e.face); e.dashY = Math.sin(e.face);
        if (e.stT <= 0) { e.st = 2; e.stT = 0.85; sfx('zap'); }
      } else if (e.st === 2) {
        e.mvx = e.dashX; e.mvy = e.dashY; e.mvs = e.speed * 6.5; e.stT -= dt;
        if (e.stT <= 0) { e.st = 3; e.rolling = false; e.bpExposed = G.t + 2.6; floatText(e.x, e.y - e.r - 14, 'OVERSHOT! HIT ITS BACK', PAL.reward, 15, 1.4); }
      } else e.mvs = e.speed * 0.6;
      return true;
    case 'mucusspit':
      if (e.fireT <= 0) {
        e.fireT = 1.5;
        for (let i = 0; i < 3; i++) addHazard(p.x + rand(-130, 130), p.y + rand(-130, 130), 44, 4, bd * 0.7, '#d9f0a3', e.name + ' glob', 0.9);
        for (let i = -1; i <= 1; i++) eBullet(e.x, e.y, aim + i * 0.2, 170, bd, 6);
      }
      return true;
    case 'crampgrip':
      // A tendon reaches out (0.9 s), then reels you in for 3.8 s. Sprint while it has you and it snaps.
      e.mvs = e.speed * 0.3;
      if (e.st === 0) { e.st = 1; e.stT = 0.9; }
      if (e.st === 1) {
        e.stT -= dt;
        if (e.stT <= 0) {
          if (dist < 700) { e.st = 2; e.stT = 3.8; e.gripping = true; sfx('zap'); floatText(p.x, p.y - 34, 'GRABBED! SPRINT TO SNAP IT', PAL.danger, 15, 1.4); }
          else e.st = 3;
        }
      } else if (e.st === 2) {
        e.stT -= dt; e.mvs = 0;
        if (G.stam && G.stam.sprint) {
          e.st = 3; e.gripping = false; e.winded = G.t + 2.8;
          floatText(e.x, e.y - e.r - 14, 'SNAP! PULLED A MUSCLE', PAL.reward, 16, 1.4);
          ring(e.x, e.y, e.r * 2.5, PAL.reward, 0.5, 6); cam.shake = Math.max(cam.shake, 10); sfx('boom');
        } else if (e.fireT <= 0) { e.fireT = 1.4; const n = 9, off = e.age; for (let i = 0; i < n; i++) eBullet(e.x, e.y, off + i / n * TAU, 110, bd, 6); }
        if (e.stT <= 0) { e.st = 3; e.gripping = false; }
      }
      return true;
    case 'sneezecone':
      e.mvs = e.speed * 0.4;
      if (e.st === 0) { e.st = 1; e.stT = 1.5; e.coneA = aim; floatText(e.x, e.y - e.r - 14, 'AH...', XR.white, 15, 0.7); }
      if (e.st === 1) {
        e.mvs = 0; e.stT -= dt;
        if (e.stT > 0.95) e.coneA += clamp(angDiff(aim, e.coneA), -BP.coneTrack * dt, BP.coneTrack * dt); // (it follows you, then locks on: nearly a second to get out)
        else if (!e.ahah) { e.ahah = true; floatText(e.x, e.y - e.r - 14, 'AH... AH...', XR.white, 17, 0.6); }
        if (e.stT <= 0) { bpSneeze(e, bd); e.st = 2; e.stT = 1.2; e.ahah = false; e.sniff = G.t + 1.8; }
      } else if (e.st === 2) { e.mvs = 0; e.stT -= dt; if (e.stT <= 0) e.st = 0; }
      return true;
    case 'stoneroll':
      // It rocks back, then rolls at you, leaving gravel behind it.
      if (e.st === 0) { e.st = 1; e.stT = 0.9; e.dashX = ux; e.dashY = uy; }
      if (e.st === 1) { e.mvs = 0; e.stT -= dt; if (e.stT > 0.3) { e.dashX = ux; e.dashY = uy; } if (e.stT <= 0) { e.st = 2; e.stT = 1.1; sfx('zap'); } }
      else if (e.st === 2) {
        e.mvx = e.dashX; e.mvy = e.dashY; e.mvs = e.speed * 8; e.stT -= dt;
        if (e.fireT <= 0) { e.fireT = 0.22; addHazard(e.x, e.y, 34, 3, bd * 0.6, '#e0c48a', e.name + ' gravel', 0.3); }
        if (e.stT <= 0) e.st = 3;
      }
      return true;
    case 'gravel':
      if (e.fireT <= 0) { e.fireT = 1.1; for (let i = -2; i <= 2; i++) eBullet(e.x, e.y, aim + i * 0.28 + rand(-0.05, 0.05), 120, bd * 1.2, 9); }
      return true;
  }
  return false;
}
// Per frame, before the patterns (from bossUpkeep).
function bpUpkeep(e, dt) {
  const d = e.def;
  if (d.litmus) { e.litT -= dt; if (e.litT <= 0) bpLitmusShift(e); }
  if (d.latex && !(e.bpExposed > G.t) && !e.rolling) {
    const p = me(), k = BP.turn * (1 + 0.2 * (e.bphase || 0));
    e.face = (e.face || 0) + clamp(angDiff(Math.atan2(p.y - e.y, p.x - e.x), e.face || 0), -k * dt, k * dt);
  }
  if (d.latex && e.rolling && e.def.patterns[e.pat] !== 'johnnyroll') e.rolling = false;
  if (d.grip && e.gripping && e.def.patterns[e.pat] !== 'crampgrip') e.gripping = false;
  if (d.stone && e.shred > 0) e.shred = Math.min(e.armour + 4, e.shred + 0.4 * dt); // (shred sticks: cancels the usual wear-off)
  if (d.plugs && !e.sealed && G.state === 'play') bpSeal(e);
}
// Damage multipliers (from bossDamageMul).
function bpDamageMul(e, src) {
  const d = e.bossDef || e.def;
  let m = 1;
  if (d.litmus && !src.env) {
    if (src.dot) m *= 0.5;
    else if (!(e.soakUntil > G.t)) m *= (src.elem || 'phys') === e.lit ? 1.5 : G.relics.teststrip ? 1 : BP.wrong;
  }
  if (d.latex && !src.dot && !src.env) {
    const back = BP_BACK === e || (BP_BACK !== e && !bpFront(e, me().x, me().y));
    BP_BACK = null;
    m *= back ? (e.bpExposed > G.t ? 1.5 : 1) : 0.4;
  }
  if (d.plugs && e.bpOpen) m *= 1.25;
  if (d.cone && e.sniff > G.t) m *= 1.3;
  return m;
}
// An enrage (from bossEnrage): its line, and what changes.
function bpPhase(e, ph) {
  const d = e.def;
  if (d.phase && d.phase[ph - 1]) sysMsg(d.name, d.phase[ph - 1], PAL.danger, true);
  if (d.stone) { e.armour = Math.max(0, e.armour - 10); floatText(e.x, e.y - e.r - 24, 'CRACK! -10 ARMOUR', PAL.reward, 16, 1.4); }
  if (d.litmus) e.litT = Math.min(e.litT, 1);
}
// Per frame (from updateBosses).
function bpTick(dt) {
  if (G.bpRing) bpRingTick(dt);
  const b = G.boss;
  if (b && b.gripping && !b.dead && G.state === 'play') {
    // The Cramp reels you in: slower than you swim, so it can be outswum; sprinting snaps it (bpSpecial).
    const p = me(), dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
    if (d > b.r + p.r + 30) { const k = BP.pull * (1 + 0.25 * (b.bphase || 0)) * dt; p.x += dx / d * k; p.y += dy / d * k; }
  }
}
function bpDown(e) {
  if (e.def.plugs) { G.bpRing = null; for (const o of G.enemies) if (o.plugA != null) o.dead = true; }
  e.gripping = false;
}
// Autorun: danger from the pack's moves (from hazardDanger).
function bpDanger(x, y, r) {
  let d = 0;
  const b = G.boss;
  if (b && !b.dead) {
    const pat = b.def.patterns[b.pat];
    if (pat === 'sneezecone' && b.st === 1 && b.coneA != null) for (const a of bpCones(b)) {
      // Deeper in counts for more, so there is always a way out towards the nearer edge.
      const px = x - b.x, py = y - b.y, dd = Math.hypot(px, py), edge = (BP.coneHalf - Math.abs(angDiff(Math.atan2(py, px), a))) * dd + r + 30;
      if (dd < BP.coneLen + r && edge > 0) d += 3 + Math.min(7, edge / 18);
    }
    if ((pat === 'johnnyroll' || pat === 'stoneroll') && b.st === 1) {
      const cx = pat === 'stoneroll' ? b.dashX : Math.cos(b.face), cy = pat === 'stoneroll' ? b.dashY : Math.sin(b.face), px = x - b.x, py = y - b.y;
      if (px * cx + py * cy > 0 && Math.abs(px * cy - py * cx) < b.r + r + 20) d += 3;
    }
  }
  const R = G.bpRing;
  if (R && Math.hypot(x - R.x, y - R.y) > R.r - r - 50) d += 1.5;
  return d;
}

// ---------------------------------------------------------------- relics
function bpRelicApply(id) {
  const P = G.P, p = me();
  switch (id) {
    case 'indicator': { const n = Math.max(1, bpOwnTypes().length); P.might += 0.06 * n; P.haste += 0.03 * n; return true; }
    case 'ribbed': P.ram += 2; P.armour += 4; return true;
    case 'membrane': { const add = Math.round(P.maxHp * 0.2); P.maxHp += add; p.hp += add; P.magnet += 0.5; return true; }
    case 'charleyhorse': P.speed += 0.2; P.sprintCost *= 0.6; return true;
    case 'blessyou': P.dodge = Math.max(P.dodge, Math.min(0.7, P.dodge + 0.15)); return true;
    case 'calcified': { P.armour += 12; const add = Math.round(P.maxHp * 0.25); P.maxHp += add; p.hp += add; P.speed -= 0.08; return true; }
    case 'bluetored': case 'teststrip': case 'rubber': case 'reservoir': case 'plugged': case 'snotrocket': case 'stitch': case 'clench': case 'atishoo': case 'binit': case 'lithotripsy': case 'razors': return true;
  }
  return false;
}
function bpRelicHit(e, d) {
  const R = G.relics;
  if (R.bluetored) {
    if (Math.random() < 0.15 && !(e.boss && e.def.resist && e.def.resist.fire === 0)) { e.burn = Math.max(e.burn, 2.5); setBurn(e, d * 0.3, 'Blue to Red'); }
    if (Math.random() < 0.15) { e.chill = Math.max(e.chill, 1.5); e.chillAmt = Math.max(e.chillAmt, 0.3); }
  }
  if (R.lithotripsy) e.shred = Math.min(e.armour + 4, e.shred + 2);
}
function bpRelicKill(e) {
  if (!G.relics.binit) return;
  let n = 0;
  forNear(e.x, e.y, 95, o => { if (o !== e && n < 4 && !o.dead) { n++; o.mark = Math.max(o.mark, 3); } });
  if (n) spawnPart(e.x, e.y, '#e6f4ff', 6, 140, 0.4, 2);
}
const bpStill = () => { const p = me(); return Math.hypot(p.vx || 0, p.vy || 0) < 40; };
// Incoming damage (from relicDamageIn): returns what is left of it.
function bpRelicIn(dmg, ent) {
  const R = G.relics, p = me(), P = G.P;
  if (!dmg) return dmg;
  if (R.rubber && G.t >= (G.rubberAt || 0)) {
    G.rubberAt = G.t + 8; p.iframes = Math.max(p.iframes || 0, 0.4);
    floatText(p.x, p.y - 26, 'SNAP!', '#9fe8d8', 13);
    rubberJohnny(ent); // (the skin dents where it was hit; a caught bullet goes back: rubber.js)
    aoe(p.x, p.y, 130, (40 + G.level * 8) * P.might, { elem: 'phys', wname: 'Rubber Johnny', knock: 400, noCrit: true }, '#9fe8d8');
    return 0;
  }
  if (R.plugged && ent && !ent.dead && !ent.boss && !ent.rival && !ent.egg && ent.hp != null) ent.stasisT = G.realT + 3;
  if (R.clench && bpStill()) dmg *= 0.65;
  return dmg;
}
function bpRelicHurt(d) {
  const R = G.relics, p = me(), P = G.P;
  if (R.reservoir) G.resv = (G.resv || 0) + d;
  if (R.razors && G.t >= (G.razorAt || 0)) {
    G.razorAt = G.t + 0.5;
    aoe(p.x, p.y, 120, (20 + G.level * 5) * P.might, { elem: 'phys', wname: 'Pissing Razor Blades', shred: 6, noCrit: true }, '#e0c48a');
  }
}
// You sneeze: a cone ahead of you (Atishoo, and Bless You on a dodge).
function bpPlayerSneeze(k) {
  const p = me(), P = G.P, h = p.hd != null ? p.hd : p.face || 0, dmg = (35 + G.level * 9) * P.might * k;
  forNear(p.x, p.y, 260, e => {
    if (Math.abs(angDiff(Math.atan2(e.y - p.y, e.x - p.x), h)) < 0.6) damageEnemy(e, dmg, { elem: 'phys', wname: k < 1 ? 'Bless You' : 'Atishoo', knock: 380, kx: Math.cos(h), ky: Math.sin(h), noCrit: true });
  });
  fxParts('drop', p.x + Math.cos(h) * 14, p.y + Math.sin(h) * 14, '#e6f4ff', 18, 520, 0.45, 3, h, 0.6);
}
function bpRelicDodge() { if (G.relics.blessyou) bpPlayerSneeze(0.6); }
function bpRelicTick(dt) {
  const R = G.relics, p = me(), P = G.P;
  if (R.reservoir) {
    G.resvT = (G.resvT == null ? 10 : G.resvT) - dt;
    if (G.resvT <= 0) { G.resvT = 10; if (G.resv > 0) { aoe(p.x, p.y, 170, G.resv * 10 * P.might, { elem: 'phys', wname: 'Reservoir Tip', knock: 300, noCrit: true }, '#9fe8d8'); G.resv = 0; } }
  }
  if (R.snotrocket) {
    G.snotT = (G.snotT == null ? 2 : G.snotT) - dt;
    if (G.snotT <= 0) {
      G.snotT = 4;
      const t = acquire('nearest', 420, p.x, p.y);
      if (t && G.zones.length < 200) {
        bolt(p.x, p.y, t.x, t.y, '#d9f0a3', 0.2);
        G.zones.push({ x: t.x, y: t.y, r: 60, life: 3, max: 3, dps: (12 + G.level * 3) * P.might, elem: 'phys', pull: 0, color: '#d9f0a3', tick: 0, src: { elem: 'phys', wname: 'Snot Rocket' } });
        forNear(t.x, t.y, 60, e => { if (!e.boss) e.stasisT = G.realT + 2; });
      }
    }
  }
  if (R.stitch) {
    G.stitchT = (G.stitchT == null ? 3 : G.stitchT) - dt;
    if (G.stitchT <= 0) {
      G.stitchT = 5;
      for (const e of acquireMany('nearest', 320, p.x, p.y, 3)) {
        if (e.boss || e.egg || e.rival) continue;
        const dx = p.x - e.x, dy = p.y - e.y, l = Math.hypot(dx, dy) || 1;
        e.kx += dx / l * 600; e.ky += dy / l * 600; e.dazeT = G.t + 1;
        bolt(p.x, p.y, e.x, e.y, '#ff8a5c', 0.2);
      }
    }
  }
  if (R.clench && bpStill()) healPlayer(P.maxHp * 0.01 * dt, true);
  if (R.atishoo) {
    G.achooT = (G.achooT == null ? 3 : G.achooT) - dt;
    if (G.achooT <= 0 && G.state === 'play') { G.achooT = 6; bpPlayerSneeze(1); }
  }
}

// ---------------------------------------------------------------- tells and the seal (from drawHazards)
function bpDraw() {
  const R = G.bpRing;
  if (R) {
    // The seal: a wall of glistening mucus, thick at the ring and thinning out behind it (no hard line).
    const x = sx(R.x), y = sy(R.y), rr = R.r * S, t = G.realT;
    const g = ctx.createRadialGradient(x, y, Math.max(1, rr - 30 * S), x, y, rr + 90 * S);
    g.addColorStop(0, 'rgba(217,240,163,0)'); g.addColorStop(0.25, 'rgba(217,240,163,0.38)'); g.addColorStop(0.5, 'rgba(190,214,140,0.22)'); g.addColorStop(1, 'rgba(190,214,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr + 90 * S, 0, TAU); ctx.arc(x, y, Math.max(1, rr - 30 * S), 0, TAU, true); ctx.fill();
    // Lumps along the wall, breathing slowly, with a wet highlight.
    const n = 44;
    ctx.fillStyle = 'rgba(225,244,180,0.32)'; ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + R.a0, k = (i * 7919 % 13) / 13, lr = (12 + 14 * k + 3 * Math.sin(t * 1.3 + i)) * S, d = rr + (6 + 10 * k) * S;
      const bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d;
      ctx.moveTo(bx + lr, by); ctx.ellipse(bx, by, lr, lr * 0.75, a, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath();
    for (let i = 0; i < n; i += 2) { const a = i / n * TAU + R.a0 + 0.02 * Math.sin(t + i), d = rr + 2 * S; ctx.moveTo(x + Math.cos(a) * d + 2, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2, 0, TAU); }
    ctx.fill();
  }
  const b = G.boss;
  if (!b || b.dead) return;
  const pat = b.def.patterns[b.pat], bx = sx(b.x), by = sy(b.y);
  if (pat === 'sneezecone' && b.st === 1 && b.coneA != null) {
    // The wind-up: a cone of fine mist gathering where it is about to sneeze, brightening as it comes.
    const k = 1 - clamp(b.stT / 1.5, 0, 1), L = BP.coneLen * S, fl = b.stT < 0.4 ? 0.5 + 0.5 * Math.sin(G.realT * 30) : 1;
    for (const a of bpCones(b)) {
      const g = ctx.createRadialGradient(bx, by, b.r * S, bx, by, L);
      g.addColorStop(0, `rgba(255,70,90,${(0.32 * k * fl).toFixed(3)})`); g.addColorStop(0.7, `rgba(255,70,90,${(0.16 * k * fl).toFixed(3)})`); g.addColorStop(1, 'rgba(255,70,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx, by); ctx.arc(bx, by, L, a - BP.coneHalf, a + BP.coneHalf); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${(0.5 * k).toFixed(3)})`; ctx.beginPath();
      for (let i = 0; i < 22; i++) { const u = (i * 0.618 + G.realT * 0.5) % 1, aa = a + ((i * 0.377) % 1 - 0.5) * 2 * BP.coneHalf * 0.9, d = (b.r + u * BP.coneLen * k) * S; ctx.rect(bx + Math.cos(aa) * d, by + Math.sin(aa) * d, 2, 2); }
      ctx.fill();
    }
  }
  if (((pat === 'johnnyroll' && b.def.latex) || pat === 'stoneroll') && b.st === 1) {
    // A charge lane: a soft streak where it is about to go.
    const a = pat === 'stoneroll' ? Math.atan2(b.dashY, b.dashX) : b.face, L = 520 * S, w = b.r * S;
    const g = ctx.createLinearGradient(bx, by, bx + Math.cos(a) * L, by + Math.sin(a) * L);
    g.addColorStop(0, 'rgba(255,70,90,0.28)'); g.addColorStop(1, 'rgba(255,70,90,0)');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(bx - Math.sin(a) * w, by + Math.cos(a) * w); ctx.lineTo(bx + Math.cos(a) * L - Math.sin(a) * w * 0.6, by + Math.sin(a) * L + Math.cos(a) * w * 0.6);
    ctx.lineTo(bx + Math.cos(a) * L + Math.sin(a) * w * 0.6, by + Math.sin(a) * L - Math.cos(a) * w * 0.6); ctx.lineTo(bx + Math.sin(a) * w, by - Math.cos(a) * w); ctx.closePath(); ctx.fill();
  }
  if (pat === 'crampgrip' && (b.st === 1 || b.gripping)) {
    // The tendon: a bundle of striated fibres, reaching out (st 1), then taut and twitching while it reels you in.
    const p = me(), px = sx(p.x), py = sy(p.y), reach = b.st === 1 ? 1 - clamp(b.stT / 0.9, 0, 1) : 1;
    const ex = bx + (px - bx) * reach, ey = by + (py - by) * reach, nx = -(ey - by), ny = ex - bx, nl = Math.hypot(nx, ny) || 1;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * 2.2 * S, tw = (b.gripping ? 4 : 10) * Math.sin(G.realT * (b.gripping ? 20 : 6) + i) * S;
      ctx.strokeStyle = i % 2 ? 'rgba(255,170,140,0.75)' : 'rgba(200,90,70,0.7)'; ctx.lineWidth = Math.max(1.2, 2.2 * S);
      ctx.beginPath(); ctx.moveTo(bx + nx / nl * off, by + ny / nl * off);
      ctx.quadraticCurveTo((bx + ex) / 2 + nx / nl * (off + tw), (by + ey) / 2 + ny / nl * (off + tw), ex + nx / nl * off * 0.3, ey + ny / nl * off * 0.3); ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }
}

// ---------------------------------------------------------------- sprites (STYLE.md: soft, organic, no outlines)
// Shared: a soft bright halo round whatever path was just drawn.
const bpHalo = (w, a) => { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = Math.max(1, w); ctx.stroke(); };
Object.assign(MICROBES, {
  // A strip of indicator paper, swaying; the dipped end shows the one damage type that hurts it.
  litmus(e, x, y, r) {
    const fl = e.flash > 0, lit = e.lit || 'fire', c = ELEMENTS[lit].color, soak = e.soakUntil > G.t, sw = Math.sin(e.age * 0.7 + e.id) * 0.25;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sw);
    const w = r * 0.62, L = r * 1.25, bend = r * 0.12 * Math.sin(e.age * 1.3);
    const path = () => { ctx.beginPath(); ctx.moveTo(-w, -L); ctx.quadraticCurveTo(-w + bend, 0, -w, L); ctx.quadraticCurveTo(0, L + w * 0.35, w, L); ctx.quadraticCurveTo(w + bend, 0, w, -L); ctx.quadraticCurveTo(0, -L - w * 0.3, -w, -L); ctx.closePath(); };
    path();
    RAW_COL = true;
    const g = ctx.createLinearGradient(0, -L, 0, L);
    g.addColorStop(0, '#eee8da'); g.addColorStop(0.32, '#e6dfcf');
    g.addColorStop(0.42, soak ? '#ffffff' : c); g.addColorStop(1, soak ? '#d9e6f0' : c);
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill();
    RAW_COL = false;
    bpHalo(r * 0.12, 0.55);
    // Paper fibres, and drips running off the wet end.
    ctx.fillStyle = 'rgba(40,40,36,0.22)'; ctx.beginPath();
    for (let i = 0; i < 14; i++) { const fx = ((i * 0.618) % 1 - 0.5) * w * 1.6, fy = ((i * 0.377) % 1 - 0.5) * L * 1.8; ctx.rect(fx, fy, Math.max(1, r * 0.1), 1); }
    ctx.fill();
    RAW_COL = true;
    ctx.fillStyle = soak ? 'rgba(220,236,255,0.8)' : c;
    for (let i = 0; i < 3; i++) { const u = (e.age * 0.6 + i / 3) % 1, dx = (i - 1) * w * 0.55; ctx.beginPath(); ctx.ellipse(dx, L + u * r * 0.8, r * 0.06 * (1 - u * 0.5), r * 0.1 * (1 - u * 0.5), 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // Its current colour, spelled out (the slide may be greyscale).
    ctx.font = `900 ${Math.round(12 * Math.max(0.8, S))}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = soak ? '#ffffff' : c; ctx.fillText(soak ? 'SOAKED: ANYTHING' : ELEMENTS[lit].name.toUpperCase() + ' ONLY', x, y - r * 1.55 - 6);
    RAW_COL = false;
  },
  // A sheath of latex: the rolled rim at the open (weak) end, the reservoir tip at the front, a wet sheen.
  johnny(e, x, y, r) {
    const fl = e.flash > 0, a = e.face != null ? e.face : 0, open = e.bpExposed > G.t;
    const wob = 1 + 0.04 * Math.sin(e.age * 3), L = r * 1.05, w = r * 0.62 * wob;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    // Body: a soft capsule, more see-through towards the open end.
    ctx.beginPath(); ctx.moveTo(-L, -w); ctx.bezierCurveTo(-L * 0.2, -w * 1.05, L * 0.55, -w, L * 0.75, -w * 0.55);
    ctx.quadraticCurveTo(L * 0.95, 0, L * 0.75, w * 0.55); ctx.bezierCurveTo(L * 0.55, w, -L * 0.2, w * 1.05, -L, w); ctx.closePath();
    const g = ctx.createLinearGradient(-L, 0, L, 0);
    g.addColorStop(0, 'rgba(160,220,206,0.35)'); g.addColorStop(0.6, 'rgba(160,220,206,0.6)'); g.addColorStop(1, 'rgba(190,240,228,0.85)');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.08, 0.5);
    // The reservoir tip.
    ctx.fillStyle = fl ? '#ffffff' : 'rgba(200,245,234,0.8)'; ctx.beginPath(); ctx.ellipse(L * 0.98, 0, r * 0.2, r * 0.17, 0, 0, TAU); ctx.fill(); bpHalo(r * 0.05, 0.6);
    // A wet sheen along the top: the bit your shots bounce off.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, r * 0.07); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-L * 0.3, -w * 0.72); ctx.quadraticCurveTo(L * 0.4, -w * 0.82, L * 0.7, -w * 0.35); ctx.stroke();
    // The rolled rim: thick and soft, glowing gold when it is the way in.
    if (open) { RAW_COL = true; const gg = ctx.createRadialGradient(-L, 0, 0, -L, 0, r * 0.9); gg.addColorStop(0, 'rgba(255,214,90,0.55)'); gg.addColorStop(1, 'rgba(255,214,90,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(-L, 0, r * 0.9, 0, TAU); ctx.fill(); RAW_COL = false; }
    ctx.strokeStyle = fl ? '#ffffff' : 'rgba(206,246,236,0.9)'; ctx.lineWidth = Math.max(2, r * 0.2);
    ctx.beginPath(); ctx.ellipse(-L, 0, r * 0.14, w * 1.02, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(70,110,100,0.35)'; ctx.lineWidth = Math.max(1, r * 0.05); ctx.beginPath(); ctx.ellipse(-L, 0, r * 0.06, w * 0.8, 0, 0, TAU); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.restore();
  },
  // A glob of cervical mucus: clear, glossy and stringy, with bubbles caught inside.
  mucus(e, x, y, r) {
    const fl = e.flash > 0, t = e.age, P = [];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, k = 1 + 0.1 * Math.sin(a * 3 + t * 1.1 + e.id) + 0.06 * Math.sin(a * 5 - t * 0.7); P.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k * 0.92]); }
    ctx.beginPath(); smoothPts(P);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, 'rgba(240,250,215,0.85)'); g.addColorStop(0.6, 'rgba(205,228,160,0.6)'); g.addColorStop(1, 'rgba(170,196,120,0.45)');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.09, 0.55);
    // Bubbles and a darker knot of something best not thought about.
    ctx.fillStyle = 'rgba(80,96,60,0.3)'; ctx.beginPath(); ctx.ellipse(x + r * 0.15, y + r * 0.1, r * 0.3, r * 0.22, t * 0.2, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * 2.1 + t * 0.3, d = r * 0.6 * ((i * 0.43) % 1), br = r * (0.05 + 0.04 * (i % 3)); ctx.moveTo(x + Math.cos(a) * d + br, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, br, 0, TAU); } ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.18, r * 0.09, -0.6, 0, TAU); ctx.fill();
  },
  // A plug in the seal: a dense, cloudy knot of mucus with strands running off into the wall.
  mucusplug(e, x, y, r) {
    const fl = e.flash > 0, R = G.bpRing, t = e.age;
    if (R) {
      const a = Math.atan2(e.y - R.y, e.x - R.x);
      ctx.strokeStyle = 'rgba(225,244,180,0.4)'; ctx.lineWidth = Math.max(1, 1.5 * S);
      ctx.beginPath(); for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const b2 = a + s * Math.PI / 2, l = r * (1.6 + k * 0.6); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(b2) * l * 0.5 + Math.cos(a) * 6, y + Math.sin(b2) * l * 0.5 + Math.sin(a) * 6, x + Math.cos(b2) * l, y + Math.sin(b2) * l); } ctx.stroke();
    }
    const P = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, k = 1 + 0.12 * Math.sin(a * 2 + t * 1.6 + e.id); P.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); }
    ctx.beginPath(); smoothPts(P);
    const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, 'rgba(150,170,100,0.85)'); g.addColorStop(1, 'rgba(215,236,165,0.6)');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.12, 0.6);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.2, r * 0.1, -0.7, 0, TAU); ctx.fill();
  },
  // A knot of muscle in a permanent clench: three twisted bundles of striated fibre, throbbing.
  cramp(e, x, y, r) {
    const fl = e.flash > 0, t = e.age, grip = e.gripping, th = 1 + (grip ? 0.06 : 0.03) * Math.sin(t * (grip ? 14 : 4));
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + t * 0.25 + Math.sin(t * 0.8) * 0.1, cx = x + Math.cos(a) * r * 0.3, cy = y + Math.sin(a) * r * 0.3;
      ctx.beginPath(); ctx.ellipse(cx, cy, r * 0.78 * th, r * 0.44 * th, a + 1.1, 0, TAU);
      const g = ctx.createRadialGradient(cx, cy, r * 0.05, cx, cy, r * 0.8);
      g.addColorStop(0, i === 0 ? '#e88a72' : '#d47360'); g.addColorStop(1, '#9e4a3c');
      ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.06, 0.45);
      // Striations: fine bands across the fibre.
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a + 1.1);
      ctx.strokeStyle = 'rgba(255,220,205,0.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = -4; k <= 4; k++) { const sx2 = k * r * 0.16, h = r * 0.4 * Math.sqrt(Math.max(0, 1 - (k / 4.8) ** 2)); ctx.moveTo(sx2, -h); ctx.quadraticCurveTo(sx2 + r * 0.05, 0, sx2, h); }
      ctx.stroke(); ctx.restore();
    }
    // The knot in the middle, tight and pale.
    ctx.fillStyle = fl ? '#ffffff' : 'rgba(255,200,180,0.7)'; ctx.beginPath(); ctx.arc(x, y, r * 0.22 * th, 0, TAU); ctx.fill();
  },
  // A cold virus (a rhinovirus, naturally): a knobbly capsid with a big drippy nose that swells as it winds up.
  sneeze(e, x, y, r, face) {
    const fl = e.flash > 0, t = e.age, wind = e.def.patterns && e.def.patterns[e.pat] === 'sneezecone' && e.st === 1 ? 1 - clamp(e.stT / 1.5, 0, 1) : 0;
    const R = r * (1 + 0.14 * wind), a = e.st === 1 && e.coneA != null ? e.coneA : face, P = [];
    for (let i = 0; i < 24; i++) { const an = i / 24 * TAU, k = 1 + (i % 2 ? 0.1 : -0.02) + 0.03 * Math.sin(t * 2 + i); P.push([x + Math.cos(an) * R * k, y + Math.sin(an) * R * k]); }
    ctx.beginPath(); smoothPts(P);
    const g = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R * 1.1);
    g.addColorStop(0, '#e9f4ff'); g.addColorStop(0.7, '#a9c8e4'); g.addColorStop(1, '#7d9cb8');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.08, 0.6);
    // Facets on the capsid.
    ctx.strokeStyle = 'rgba(60,84,110,0.3)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < 5; i++) { const an = i / 5 * TAU + t * 0.1; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an) * R * 0.75, y + Math.sin(an) * R * 0.75); } ctx.stroke();
    // The nose: a pink bulb pointed where it will sneeze, with a drip.
    const nx = x + Math.cos(a) * R * 0.7, ny = y + Math.sin(a) * R * 0.7, nr = R * (0.32 + 0.08 * wind);
    RAW_COL = true;
    ctx.fillStyle = fl ? '#ffffff' : `rgb(${Math.round(240 + 15 * wind)},${Math.round(160 - 60 * wind)},${Math.round(170 - 60 * wind)})`;
    ctx.beginPath(); ctx.ellipse(nx, ny, nr, nr * 0.85, a, 0, TAU); ctx.fill(); bpHalo(r * 0.05, 0.6);
    RAW_COL = false;
    ctx.fillStyle = 'rgba(60,40,50,0.55)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(nx + Math.cos(a) * nr * 0.45 - Math.sin(a) * s * nr * 0.35, ny + Math.sin(a) * nr * 0.45 + Math.cos(a) * s * nr * 0.35, nr * 0.16, nr * 0.24, a, 0, TAU); ctx.fill(); }
    const u = (t * 0.5) % 1; ctx.fillStyle = 'rgba(214,240,190,0.75)'; ctx.beginPath(); ctx.ellipse(nx + Math.cos(a) * nr * 0.9, ny + Math.sin(a) * nr * 0.9 + u * R * 0.3, R * 0.06, R * 0.09 + u * R * 0.05, 0, 0, TAU); ctx.fill();
  },
  // A crystal of calcium oxalate: jagged but rounded at the tips, faceted, cracking as its armour comes off.
  stone(e, x, y, r) {
    const fl = e.flash > 0, rot = e.age * 0.15 + e.id, P = [];
    for (let i = 0; i < 11; i++) { const a = rot + i / 11 * TAU, k = i % 2 ? 0.78 + 0.08 * ((i * 0.37) % 1) : 1.04 + 0.1 * ((i * 0.61) % 1); P.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k]); }
    ctx.beginPath(); roundPts(P, r * 0.14);
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, '#f6e7c4'); g.addColorStop(0.6, '#cdb07a'); g.addColorStop(1, '#8c7244');
    ctx.fillStyle = fl ? '#ffffff' : g; ctx.fill(); bpHalo(r * 0.07, 0.55);
    // Facets: a few lighter and darker planes from the middle.
    for (let i = 0; i < P.length; i += 2) {
      const q = P[i], q2 = P[(i + 1) % P.length];
      ctx.fillStyle = i % 4 ? 'rgba(255,248,225,0.18)' : 'rgba(60,44,20,0.16)';
      ctx.beginPath(); ctx.moveTo(x + (q[0] - x) * 0.15, y + (q[1] - y) * 0.15); ctx.lineTo(q[0], q[1]); ctx.lineTo(q2[0], q2[1]); ctx.closePath(); ctx.fill();
    }
    // Cracks, one more per enrage.
    const cr = e.bphase || 0;
    if (cr) {
      ctx.strokeStyle = 'rgba(50,36,16,0.55)'; ctx.lineWidth = Math.max(1, r * 0.035); ctx.beginPath();
      for (let c = 0; c < cr * 2; c++) { let a = rot + c * 2.2, px = x, py = y; ctx.moveTo(px, py); for (let k = 1; k <= 4; k++) { a += ((c * 7 + k * 3) % 5 - 2) * 0.2; px = x + Math.cos(a) * r * k * 0.22; py = y + Math.sin(a) * r * k * 0.22; ctx.lineTo(px, py); } }
      ctx.stroke();
    }
    // Glints.
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath();
    for (let i = 0; i < 4; i++) { const tw = Math.max(0, Math.sin(G.realT * 2 + i * 1.7)), a = rot + i * 1.6, d = r * 0.55; if (tw > 0.2) { ctx.moveTo(x + Math.cos(a) * d + 2 * tw, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2 * tw, 0, TAU); } }
    ctx.fill();
  },
});
