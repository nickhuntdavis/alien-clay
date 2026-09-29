'use strict';
// Spawn Prawn - rival champions and the sperm count. Five other swimmers grow stronger elsewhere on the
// map. They farm the immune system and pick fights when they feel big. The sperm count falls as the race
// goes on; when it reaches the last six (you and five), the Final Five showdown starts. Win it and the
// count is 1: swim into the egg to fertilise it.

// A rival's level follows its own clock, which runs at its skill (plus a little for every kill it steals).
function rivalLevelAt(clock) { return Math.min(EGG.level, 1 + Math.floor((EGG.level - 1) * Math.pow(Math.max(0, clock) / RIVAL.finish, RIVAL.pow) + 1e-9)); }

function initRivals() {
  G.rivalsInit = true;
  G.rivalOut = {}; // id -> how they were eliminated
  G.rivalMsgT = 0; G.rivalCullT = 200; G.rivalCulls = 0;
  const off = Math.random() * TAU;
  RIVALS.forEach((R, i) => {
    const a = off + i / RIVALS.length * TAU;
    G.enemies.push(makeRival(R, Math.cos(a) * RIVAL.spawnR, Math.sin(a) * RIVAL.spawnR));
  });
}

function makeRival(R, x, y) {
  const def = { id: 'rival', name: R.name, hp: 1, speed: RIVAL.speed, armour: 2, r: 15, dmg: 10, xp: 0, color: R.color, shape: 'sperm', ai: 'rival', patterns: [] };
  const e = makeEnemy(def, x, y);
  Object.assign(e, { rival: true, rid: R.id, R, lvl: 1, clock: 0, mode: 'roam', wx: x, wy: y, modeT: 0, zapT: 1, calmT: 0, lastHp: 0, shootCd: 2 });
  e.maxHp = 0; rivalStats(e, 1);
  return e;
}

// Recompute a rival's body from its level. heal: fraction of max HP restored on top.
// Toughness tracks your recent damage output, so a rival your size is always a proper duel
// (about RIVAL.duel seconds of your full firepower); smaller rivals fold faster.
function rivalStats(e, heal) {
  const L = e.lvl, t = G.t;
  const rel = Math.pow(Math.min(1.5, L / Math.max(1, G.level)), 1.5);
  const maxHp = (RIVAL.hpBase * hpMul(t) * (1 + L / 7) + (G.dpsAvg || 0) * RIVAL.duel * rel) * (e.final ? 1.8 : 1); // the Final Five are built to last
  const k = e.maxHp > 0 ? e.hp / e.maxHp : 1;
  e.maxHp = maxHp;
  e.hp = Math.min(maxHp, maxHp * Math.min(1, k + heal));
  e.armour = 2 + Math.floor(L / 8);
  e.r = 14 + L * 0.28;
  e.speed = RIVAL.speed * (1 + L / 90);
  e.dmg = 10 * dmgMul(t) * (1 + L / 40);
  e.lastHp = e.hp;
}

function rivalGrow(e, dt) {
  if (e.lvl >= EGG.level) return;
  e.clock += dt * e.R.skill;
  const L = rivalLevelAt(e.clock);
  if (L <= e.lvl) return;
  const before = e.lvl;
  e.lvl = L;
  rivalStats(e, 0.25);
  if (e.vis) { ring(e.x, e.y, e.r + 18, e.color, 0.45, 3); floatText(e.x, e.y - e.r - 20, 'LV ' + L, e.color, 15, 1); }
  // Overtaking you is news. So are round numbers.
  if (before <= G.level && L > G.level) rivalNews(e, `${e.name} has overtaken you (LV ${L}).`, true);
  else if (Math.floor(L / 10) > Math.floor(before / 10)) rivalNews(e, fill(pick(SYSTEM_LINES.rivalLevel), e, L));
}
function fill(s, e, l, k) { return s.replace(/\{n\}/g, e.name).replace(/\{l\}/g, l).replace(/\{k\}/g, k || ''); }
function rivalNews(e, text, force) {
  if (!force && G.rivalMsgT > G.realT) return;
  G.rivalMsgT = G.realT + 12;
  sysMsg('RACE UPDATE', text, e.color, force);
}

function rivalAI(e, dt) {
  if (G.rivalOut[e.rid]) { e.dead = true; return; } // eliminated in a timeline you rewound past
  const p = me();
  const dx = p.x - e.x, dy = p.y - e.y, dist = Math.hypot(dx, dy) || 1;
  e.vis = dist < 900;
  rivalGrow(e, dt);
  // Regenerate after a few quiet seconds.
  if (e.hp < e.lastHp - 0.5) e.calmT = 4;
  e.calmT -= dt;
  if (e.calmT <= 0 && e.hp < e.maxHp && !e.final) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.02 * dt);
  e.lastHp = e.hp;
  if (e.frozen > 0) { rivalMove(e, 0, 0, 0, dt); return; }
  e.modeT -= dt;
  let tx = e.wx, ty = e.wy, spd = e.speed * (G.pill && inPill(e.x, e.y) ? 0.65 : 1);
  const hurt = e.hp < e.maxHp * 0.3;
  if (e.final) {
    // The Final Five: no running, no resting, just you.
    // They surround you, one to each side, slowly circling, so no single blast catches them all.
    const a = e.slot + G.t * 0.25, want = 240;
    tx = p.x + Math.cos(a) * want; ty = p.y + Math.sin(a) * want; spd *= 1.15;
  } else if (e.mode === 'flee') {
    tx = e.x - dx / dist * 400; ty = e.y - dy / dist * 400; spd *= 1.35;
    if (e.modeT <= 0 || dist > RIVAL.sight) { e.mode = 'roam'; newWaypoint(e); }
  } else if (e.mode === 'hunt') {
    // Circle you at shooting range.
    const want = 250, side = e.side;
    tx = p.x - dx / dist * want - dy / dist * 120 * side; ty = p.y - dy / dist * want + dx / dist * 120 * side;
    if (hurt) { e.mode = 'flee'; e.modeT = 8; rivalNews(e, `${e.name} is running away. Coward. Chase them if you're feeling mean.`); }
    else if (e.modeT <= 0 || dist > RIVAL.sight * 1.3) { e.mode = 'roam'; newWaypoint(e); }
  } else {
    if (Math.hypot(e.wx - e.x, e.wy - e.y) < 60 || e.modeT <= 0) newWaypoint(e);
    // Outgrown by you? They give you a wide berth (you'll have to go and get them).
    if (e.lvl < G.level - 2 && dist < 750) { tx = e.x - dx / dist * 300; ty = e.y - dy / dist * 300; spd *= 1.15; if (Math.hypot(e.wx - p.x, e.wy - p.y) < 900) newWaypoint(e); }
    // Feeling big? Come and have a go.
    if (dist < RIVAL.sight && !hurt && G.t > RIVAL.huntFrom && e.huntRoll !== Math.floor(G.t / 5)) {
      e.huntRoll = Math.floor(G.t / 5);
      if (Math.random() < e.R.aggro * 0.45 && e.lvl >= G.level - 6) {
        e.mode = 'hunt'; e.modeT = 14 + e.R.aggro * 10;
        rivalNews(e, `${e.name} (LV ${e.lvl}) is coming for you.`);
      }
    }
  }
  const mx = tx - e.x, my = ty - e.y, md = Math.hypot(mx, my);
  rivalMove(e, md > 4 ? mx / md : 0, md > 4 ? my / md : 0, Math.min(spd, md / Math.max(dt, 1e-3)), dt);
  // Contact.
  if (dist < e.r + p.r && G.state === 'play') hurtPlayer(e.dmg, e.name, e);
  // Weapons: zap monsters nearby (stealing your XP), shoot you when you're in range.
  e.zapT -= dt;
  if (e.zapT <= 0) { e.zapT = 0.7; rivalZap(e); }
  e.shootCd -= dt;
  // Early on they mind their own business unless you start something.
  const riled = G.t > RIVAL.huntFrom || e.hp < e.maxHp * 0.95;
  if (e.shootCd <= 0 && dist < 520 && riled && G.state === 'play') {
    e.shootCd = e.final ? 1.6 : e.mode === 'hunt' ? 1.1 : 1.8;
    const n = Math.min(e.final ? 3 : 9, 1 + Math.floor(e.lvl / 12)), a0 = Math.atan2(dy, dx), bd = 7 * dmgMul(G.t) * (1 + e.lvl / 40);
    shooterName = e.name; shooterEnt = e;
    for (let i = 0; i < n; i++) eBullet(e.x, e.y, a0 + (i - (n - 1) / 2) * 0.16, 210, bd, 5.5, e.color);
  }
}

function newWaypoint(e) {
  const a = Math.random() * TAU, d = rand(500, CORE.arena - 250);
  e.wx = G.core.x + Math.cos(a) * d; e.wy = G.core.y + Math.sin(a) * d;
  e.modeT = rand(10, 20);
}

function rivalMove(e, ux, uy, spd, dt) {
  const slow = (1 - e.chillAmt) * (e.stasisT > G.realT ? 0.35 : 1) * (G.warp > 0 ? 0.3 : 1);
  e.x += (ux * spd * slow + e.kx * 0.3) * dt; e.y += (uy * spd * slow + e.ky * 0.3) * dt;
  const kd = Math.pow(0.02, dt); e.kx *= kd; e.ky *= kd;
  if (Math.abs(ux) + Math.abs(uy) > 0.1) e.face = Math.atan2(uy, ux);
  pushOut(e, e.r, e.side || 1);
  const c = G.core, ox = e.x - c.x, oy = e.y - c.y, od = Math.hypot(ox, oy) || 1;
  if (od < CORE.r + e.r) { e.x = c.x + ox / od * (CORE.r + e.r); e.y = c.y + oy / od * (CORE.r + e.r); }
  if (od > CORE.arena) { e.x = c.x + ox / od * CORE.arena; e.y = c.y + oy / od * CORE.arena; }
}

// Rivals clear monsters around themselves. Those kills feed them, not you.
function rivalZap(e) {
  let n = 0;
  forNear(e.x, e.y, RIVAL.zapR, o => {
    if (o === e || o.rival || o.egg || o.boss || o.charmed || o.dead) return false;
    const d = o.maxHp * (0.25 + e.lvl / 200);
    o.hp -= d; o.flash = 0.07;
    if (e.vis) bolt(e.x, e.y, o.x, o.y, e.color, 0.12);
    if (o.hp <= 0) {
      o.dead = true; e.clock += 0.6;
      if (e.vis) spawnPart(o.x, o.y, o.color, 6, 120, 0.4, 3);
      if (o.def.split) for (let i = 0; i < 2 && G.enemies.length < CAPS.enemies; i++) G.enemies.push(makeEnemy(ENEMIES[o.def.split], o.x + rand(-12, 12), o.y + rand(-12, 12)));
    }
    return ++n >= 3;
  });
}

// Called from killEnemy when you (or your weapons, echoes and allies) finish off a rival.
function rivalDown(e) {
  e.dead = true;
  G.kills++;
  G.rivalOut[e.rid] = 'you';
  const P = G.P;
  spawnPart(e.x, e.y, e.color, 50, 300, 0.8, 5);
  addDecal(e.x, e.y, e.r * 2.4, e.color);
  cam.shake = 14;
  // Their growth is yours now: about a level of XP, a Fan Box and a snack.
  const xp = xpNeed(G.level) * 1.2;
  for (let i = 0; i < 10; i++) dropGem(e.x + rand(-50, 50), e.y + rand(-50, 50), xp / 10);
  G.pickups.push(makePickup('chest', e.x, e.y, { t: 'rival', name: e.name }));
  healPlayer(P.maxHp * 0.2);
  gainChrono(CHRONO.energyPerCharge * 0.5);
  banner(e.name.toUpperCase() + ' ELIMINATED', e.color);
  sysMsg('SYSTEM MESSAGE', fill(pick(SYSTEM_LINES.rivalDead), e, 0, 'You did that. The crowd loved it.'), e.color, true);
  addViewers(20000);
  achieve('rivalkill');
  if (RIVALS.every(R => G.rivalOut[R.id])) achieve('allrivals');
  sfx('boss'); vibrate(120);
}

const RIVAL_FATES = ['A Macrophage ate them. It did not even chew.', 'They took a wrong turn into a Mucus Wall and are now part of it.',
  'Killer T-Cells got them. Paperwork is being filed.', 'They swam in a very confident circle until they ran out of tail.',
  'Acid got them. They were last seen saying "is it meant to fizz?"'];

// Every tick: the host thins out the field (away from you), and bookkeeping for the race board.
function updateRivals(dt) {
  if (!G.rivalsInit) initRivals();
  // Rolling average of your damage per second (drives rival toughness).
  G.dpsT = (G.dpsT || 0) - dt;
  if (G.dpsT <= 0) {
    G.dpsT = 5;
    let tot = 0; for (const k in G.stats.dmg) tot += G.stats.dmg[k];
    const cur = Math.max(0, tot - (G.dpsLast || 0)) / 5;
    G.dpsLast = tot;
    G.dpsAvg = G.dpsAvg ? G.dpsAvg * 0.8 + cur * 0.2 : cur;
    for (const e of G.enemies) if (e.rival && !e.dead) rivalStats(e, 0);
  }
  if (G.t < G.rivalCullT) return;
  G.rivalCullT = G.t + 75;
  if (G.showdown) return;
  const alive = G.enemies.filter(e => e.rival && !e.dead);
  if (alive.length <= 2 || G.rivalCulls >= 2) return;
  const p = me();
  const pool = alive.filter(e => e.mode !== 'egg' && Math.hypot(e.x - p.x, e.y - p.y) > 1200);
  if (!pool.length || Math.random() > 0.35) return;
  const e = pick(pool);
  e.dead = true; G.rivalOut[e.rid] = 'host'; G.rivalCulls++;
  sysMsg('RACE UPDATE', fill(pick(SYSTEM_LINES.rivalDead), e, 0, pick(RIVAL_FATES)), e.color, true);
}

// Sorted standings for the HUD: you and every rival, alive or not.
function rivalBoard() {
  const rows = [{ name: 'SPERMY', lvl: G.level, color: PAL.you, you: true }];
  for (const R of RIVALS) {
    const e = G.enemies.find(o => o.rid === R.id && !o.dead);
    rows.push({ name: R.name, lvl: e ? e.lvl : 0, color: R.color, out: !e, egg: e && e.final, e });
  }
  // Stand-ins who joined the Final Five.
  for (const e of G.enemies) if (e.final && !e.dead && !RIVALS.some(R => R.id === e.rid)) rows.push({ name: e.name, lvl: e.lvl, color: e.color, egg: true, e });
  return rows.sort((a, b) => (a.out ? 1 : 0) - (b.out ? 1 : 0) || b.lvl - a.lvl || (a.you ? -1 : 1));
}

// ---------------------------------------------------------------- the sperm count
// About 400 million start the race, and the count doesn't move until you kill something (a monster or one
// of the crowd). From then on it falls with every kill (0.3: monsters, rival swimmers and popped crowd
// sperm), with your growth (0.4, full at level 60) and a little with time (0.3), on a log scale, and never
// goes back up. 95% of that is enough. At the last six (you and five) the Final Five showdown begins;
// each finalist you kill takes one off.
const COUNT = { start: 4e8, time: 720, cull: 2600 };
function countKill(x, y) {
  if (!G.countStartT && G.countStartT !== 0) { G.countStartT = G.t; }
  G.lastKillX = x; G.lastKillY = y; G.lastKillT = G.realT;
}
function countProgress() {
  if (G.countStartT == null) return 0;
  const cull = G.kills + (G.stats.spermKills || 0) + (G.ambKills || 0) * 0.5;
  const P = 0.3 * Math.min(1, (G.t - G.countStartT) / COUNT.time) + 0.4 * Math.min(1, (G.level - 1) / (EGG.level - 1)) + 0.3 * Math.min(1, cull / COUNT.cull);
  G.countP = Math.max(G.countP || 0, Math.min(1, P / 0.95));
  return G.countP;
}
function spermCount() {
  if (G.fertile) return 1;
  if (G.showdown) return 1 + G.enemies.filter(e => e.final && !e.dead).length;
  const P = countProgress();
  if (P >= 1) return 6;
  return Math.max(7, Math.round(Math.exp(Math.log(COUNT.start) * (1 - P) + Math.log(6) * P)));
}
// Show what your kills are doing to the count: the drop floats up from where you're killing things.
function updateCountFx() {
  const c = spermCount();
  if (G.countShown == null) G.countShown = c;
  if (c < G.countShown) { G.countDrop = (G.countDrop || 0) + (G.countShown - c); G.countShown = c; G.countFlash = 0.25; }
  if (G.countFlash > 0) G.countFlash -= 1 / 60;
  if (G.countDrop > 0 && !(G.countDropT > G.realT) && G.realT - (G.lastKillT || -9) < 0.5 && !G.showdown) {
    G.countDropT = G.realT + 0.35;
    const d = G.countDrop, txt = d >= 1e6 ? (d / 1e6).toFixed(1) + 'M' : d >= 1e3 ? (d / 1e3).toFixed(d >= 1e5 ? 0 : 1) + 'k' : Math.round(d);
    floatText(G.lastKillX, G.lastKillY - 20, '-' + txt, XR.white, 12, 0.8);
    G.countDrop = 0;
  }
}
const FINALIST_NAMES = ['The Dark Horse', 'Anonymous Donor', 'The Favourite', 'Mr Motility', 'The Underdog'];
function startShowdown() {
  G.showdown = { t0: G.t }; G.eggAt = G.t;
  const p = me(), fin = G.enemies.filter(e => e.rival && !e.dead);
  for (let i = fin.length; i < 5; i++) {
    const R = { id: 'fin' + i, name: FINALIST_NAMES[i], color: XR.white, skill: 1, aggro: 1 };
    const e = makeRival(R, p.x, p.y); G.enemies.push(e); fin.push(e);
  }
  fin.forEach((e, i) => {
    // They close in from all sides, fully grown and fully healed.
    const a = i / fin.length * TAU + Math.random() * 0.5;
    e.x = p.x + Math.cos(a) * 850; e.y = p.y + Math.sin(a) * 850;
    e.final = true; e.mode = 'final'; e.slot = i / fin.length * TAU; e.lvl = Math.max(e.lvl, G.level);
    e.maxHp = 0; rivalStats(e, 1);
  });
  banner('THE FINAL FIVE', PAL.danger);
  sysLine('finalFive', true);
  cam.shake = 12; sfx('boss'); vibrate([150, 80, 150]);
}
function updateShowdown() {
  updateCountFx();
  if (!G.showdown && G.state === 'play' && countProgress() >= 1) startShowdown();
  if (G.showdown && !G.fertile && !G.enemies.some(e => e.final && !e.dead)) {
    G.fertile = true;
    banner('SPERM COUNT: 1. FERTILISE THE EGG!', PAL.reward);
    sysLine('eggReady', true); achieve('eggready');
    sfx('level'); vibrate(200);
  }
  if (G.fertile && G.state === 'play') {
    const p = me();
    if (Math.hypot(p.x - G.core.x, p.y - G.core.y) < CORE.r + p.r + 14) victory();
  }
}
