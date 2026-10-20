'use strict';
// Spawn Prawn - Level 0, Swimming Lessons: the tutorial level. One long tube, one lesson per room, the egg at the end.
// It is a campaign level (levels.js) like any other, except that each room is a station (A.st): its gate opens when
// you have done the thing the room teaches (picked COLLECT, opened the box, sprinted...), not on a kill quota.
// There is no dying in school: a lethal hit gives you a second wind instead.
// Hooks: schoolTick (lvTick), schoolEnter / schoolArena / schoolDone (lvTick arenas), schoolTask (drawLevelHud),
// schoolSteer (autoSteer: autorun swims you on down the tube), schoolSave (hurtPlayer), schoolWin (lvWin),
// schoolEulogy (the end screen), schoolDue / schoolStart (the title's START SWIMMING), schoolSkip (the HUD's SKIP TUTORIAL).
// Wave 0 (Pre-pre-pre-pre-school) is retired: tutWaveInit no longer starts it.

const SCHOOL_COL = '#ffb3c6';
const SCHOOL = {
  id: 'school', no: 0, name: 'SWIMMING LESSONS', sub: 'One tube, one egg', school: true,
  pt: [0, 25], par: 1e9, // (no bristles: take as long as you like)
  zones: [{ name: 'THE TUBE', to: 999, floor: '#e8909a', mix: { crawler: 1 }, rate: 0, max: 0 }],
  boss: null,
  map: [
    '################',
    '################',
    '#####......#####',
    '###..........###',
    '##.....EE.....##',
    '##.....EE.....##',
    '##............##',
    '##............##',
    '###..........###',
    '#####......#####',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######9999######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######8888######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######7777######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######6666######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######5555######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######4444######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######3333######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######2222######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######1111######',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '##............##',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '######....######',
    '####........####',
    '####...S....####',
    '####........####',
    '################',
    '################',
  ],
  arenas: [
    { st: 'shoot', gate: '1', rect: [2, 142, 13, 149] },
    { st: 'collect', gate: '2', rect: [2, 130, 13, 137] },
    { st: 'box', gate: '3', rect: [2, 119, 13, 125] },
    { st: 'hunt', gate: '4', rect: [2, 103, 13, 114] },
    { st: 'modes', gate: '5', rect: [2, 89, 13, 98] },
    { st: 'sprint', gate: '6', rect: [2, 71, 13, 84] },
    { st: 'feat', gate: '7', rect: [2, 57, 13, 66] },
    { st: 'hazard', gate: '8', rect: [2, 41, 13, 52] },
    { st: 'armour', gate: '9', rect: [2, 28, 13, 36] },
    { st: 'junk', rect: [2, 14, 13, 23] },
  ],
};
// Lesson names for the room banners (lesson 1, autorun, is the stretch before the first room).
const SCHOOL_NAMES = { shoot: 'LESSON 2: LOOK, NO HANDS', collect: 'LESSON 3: HOOVERING UP', box: 'LESSON 4: UNBOXING', hunt: 'LESSON 5: ON THE PULL',
  modes: 'LESSON 6: SWIMMING STYLES', sprint: 'LESSON 7: A QUICKIE', feat: 'LESSON 8: PERFORMANCE ANXIETY', hazard: 'LESSON 9: ACID REFLUX', armour: 'LESSON 10: USE PROTECTION', junk: 'LESSON 11: JUNK IN THE TRUNK' };
for (const A of SCHOOL.arenas) { A.name = SCHOOL_NAMES[A.st]; A.quota = 0; }
LEVELS.push(SCHOOL);
LV_SAMPLE.s009 = LEVELS.length - 1;
SAMPLES.push({ id: 's009', no: '009', order: 0, name: 'Swimming Lessons', tag: 'CAMPAIGN: LEVEL 0', count: 'one, supervised', motility: 'learning', open: true,
  desc: 'The tutorial. One long tube, one lesson in each room, and an egg at the end. Everything you need before the real thing.' });

const schoolOn = () => !!(G && G.lvl && G.lvl.L.school);
// A lesson's message replaces whatever is showing (or queued), and stays up long enough to read.
function schoolSay(t, c) {
  if (!G) return;
  G.show.msgQ = [{ head: narratorHead('SWIMMING LESSONS'), body: t, color: c || SCHOOL_COL, hold: Math.min(10, 3 + t.length / 25) }];
  if (typeof UI !== 'undefined' && UI.msgT > 0) UI.msgT = 0.01;
}
const schoolLeft = R => (R.foes || []).filter(e => !e.dead).length;
// Parts of a room, in cells: its far end (the top rows) and its middle.
const stFar = rc => [rc[0] + 1, rc[1], rc[2] - 1, rc[1] + 2];
const stMid = rc => ({ x: (rc[0] + rc[2] + 1) / 2 * LV_C, y: (rc[1] + rc[3] + 1) / 2 * LV_C });
function schoolFoes(R, ids, rc, away) {
  R.foes = R.foes || [];
  for (const id of ids) {
    const c = lvRectPos(rc || R.A.rect, away == null ? 260 : away), e = makeEnemy(ENEMIES[id], c.x + rand(-20, 20), c.y + rand(-20, 20));
    e.speed *= 0.8; lvPush(e, e.r); G.enemies.push(e); R.foes.push(e);
  }
}

// What each room teaches. enter: on stepping in. tick: every frame while it is on. done: the gate opens. task: the HUD line.
const SCHOOL_ST = {
  shoot: {
    enter(R) { schoolSay('Your weapon fires by itself, at whatever is nearest. All you do is swim. Let it work.'); schoolFoes(R, ['crawler', 'crawler', 'crawler', 'crawler', 'crawler'], stFar(R.A.rect)); },
    done: R => !schoolLeft(R),
    task: R => `WEAPON FIRES ITSELF: ${schoolLeft(R)} LEFT` },
  collect: {
    enter(R) {
      schoolSay('The RUN button (bottom left) picks how autorun swims. Tap it until it says COLLECT: autorun goes for anything worth picking up.');
      const rc = R.A.rect;
      // (No stain here any more: stains were retired in the damage type rework, v9.11.)
      R.gems = [];
      for (let k = 0; k < 10; k++) { const c = lvRectPos(stFar(rc), 200); dropGem(c.x, c.y, 1); R.gems.push(G.gems[G.gems.length - 1]); }
    },
    tick(R) { if (G.moveDir === 'collect') R.picked = true; },
    left: R => R.gems.filter(g => G.gems.includes(g)).length,
    done: R => R.picked && !SCHOOL_ST.collect.left(R),
    task: R => R.picked ? `COLLECT IT ALL: ${SCHOOL_ST.collect.left(R)} LEFT` : 'TAP RUN: PICK COLLECT' },
  box: {
    enter(R) {
      schoolSay('A box of DNA. Swim into it, then pick one upgrade. Every level up brings one too.');
      const c = stMid(R.A.rect);
      R.box = makePickup('chest', c.x, c.y - LV_C, { t: 'drop', name: 'SWIMMING LESSONS' }); R.box.life = 1e9;
      G.pickups.push(R.box);
    },
    done: R => !G.pickups.includes(R.box) && !G.lootQueue.length,
    task: () => 'SWIM INTO THE BOX' },
  hunt: {
    enter() { schoolSay('Something is lurking at the far end, out of reach. Tap RUN until it says HUNT: autorun closes in on your target.'); },
    tick(R) {
      if (G.moveDir === 'hunt' && !R.hunted) { R.hunted = true; schoolFoes(R, ['spitter'], stFar(R.A.rect)); }
    },
    done: R => R.hunted && !schoolLeft(R),
    task: R => R.hunted ? 'HUNT IT DOWN' : 'TAP RUN: PICK HUNT' },
  modes: {
    enter(R) { schoolSay('Six ways to swim. KITE keeps its distance, ORBIT circles the pack, HOLD stands its ground. Try one of them on this lot.'); schoolFoes(R, ['crawler', 'crawler', 'crawler', 'skitter', 'skitter', 'skitter'], stFar(R.A.rect)); },
    tick(R, dt) {
      if (['kite', 'orbit', 'hold'].includes(G.moveDir)) R.tried = true;
      if (!schoolLeft(R) && !R.tried && (R.again = (R.again || 2) - dt) <= 0) { R.again = 3; schoolFoes(R, ['crawler', 'crawler', 'skitter'], stFar(R.A.rect)); }
    },
    done: R => R.tried && !schoolLeft(R),
    task: R => R.tried ? `${schoolLeft(R)} LEFT` : 'TAP RUN: KITE, ORBIT OR HOLD' },
  sprint: {
    enter() { schoolSay('Sprinting is up to you. Touch and drag to steer, then push right out to the edge: 55% faster. It burns stamina, the thin ring inside your health ring.'); },
    tick(R, dt) { if (G.stam && G.stam.sprint) R.sprintT = (R.sprintT || 0) + dt; },
    done: R => (R.sprintT || 0) >= 0.8,
    task: () => 'DRAG TO THE EDGE TO SPRINT' },
  feat: {
    enter(R) {
      if (!G.spells.some(w => w && !w.def.passive)) { if (V10 && typeof f10Give === 'function') f10Give('brown_fat'); else G.spells[0] = makeSlot('frostnova', true, 1); recomputeAll(); if (typeof UI !== 'undefined') UI.refreshHud(true); tutShow('feats', true); }
      schoolSay('A Feat: a big move in its own slot (bottom right). It goes off by itself when ready, or tap it to perform it now. Attacking Feats cost stamina.');
      R.casts = G.stats.casts || 0;
      schoolFoes(R, ['crawler', 'crawler', 'crawler', 'crawler', 'crawler', 'crawler'], R.A.rect, 300);
    },
    tick(R, dt) { if (!schoolLeft(R) && (G.stats.casts || 0) <= R.casts && (R.again = (R.again || 2) - dt) <= 0) { R.again = 3; schoolFoes(R, ['crawler', 'crawler', 'crawler', 'crawler'], R.A.rect, 300); } },
    done: R => (G.stats.casts || 0) > R.casts && !schoolLeft(R),
    task: R => (G.stats.casts || 0) > R.casts ? `${schoolLeft(R)} LEFT` : 'TAP YOUR FEAT TO PERFORM IT' },
  hazard: {
    enter(R) {
      schoolSay('Acid. It burns you, and anything else that swims into it. Steer round it to the far end. (Lure them through it if you like.)');
      const c = stMid(R.A.rect), T = G.terrain;
      T.list.push({ type: 'acid', def: OBSTACLES.acid, x: c.x, y: c.y, r: 150, a: 0, charge: 0, flash: 0, seed: 7, burstT: 0, sp: 0, fixed: true, lobes: Array.from({ length: 8 }, (_, k) => 0.92 + 0.2 * ((k * 37) % 7) / 7) });
      T.grid = terrainGrid(T.list);
      schoolFoes(R, ['crawler', 'crawler', 'crawler'], stFar(R.A.rect));
    },
    done: R => me().y < (R.A.rect[1] + 2.5) * LV_C,
    task: () => 'GET PAST THE ACID' },
  armour: {
    enter(R) {
      PASSIVES.armour.apply(G.P, 4); G.passives.armour = (G.passives.armour || 0) + 1; recomputeAll();
      schoolSay('Shell Suit: 4 armour. Every hit lands that much softer. It wears down as you get hit and grows back once you stop. Those antibodies shoot back: see how little their hits take.');
      R.hits = 0; R.flash = G.armFlash;
      schoolFoes(R, ['spitter', 'spitter', 'spitter', 'spitter'], stFar(R.A.rect));
    },
    tick(R) { if (G.armFlash && G.armFlash !== R.flash) { R.flash = G.armFlash; if (!R.hits++) floatText(me().x, me().y - 40, 'ARMOUR SOAKED IT', '#d6e4f0', 13, 1.2); } },
    done: R => !schoolLeft(R),
    task: R => `ARMOUR SOAKS HITS: ${schoolLeft(R)} LEFT` },
  junk: { // (Lateral Gene Transfer: in a real run a carrier turns up every 40 to 55s, and sheds its junk after 30s. Under V10 it teaches the mutation strand from mutdrop.js instead.)
    enter(R) {
      if (V10) {
        schoolSay('See the pale helix round that Antibody? It is carrying a mutation. Kill it and the mutation is yours: pick one, and it changes you for the rest of the run. Usually a carrier sheds it after 40 seconds; here it waits.');
        R.k0 = (G.stats && G.stats.mutDrops) || 0;
        schoolFoes(R, ['crawler', 'crawler', 'crawler'], R.A.rect, 300);
        return;
      }
      schoolSay('See the white helix round that Antibody? Junk DNA. Kill it, then swim into the helix it drops: you keep a little of what it was for the rest of the run. Usually it sheds after 30 seconds; here it waits.');
      R.k0 = junkK('spitter');
      schoolFoes(R, ['crawler', 'crawler', 'crawler'], R.A.rect, 300);
    },
    tick(R) {
      if (V10) {
        if (SCHOOL_ST.junk.got(R)) return;
        const D = mdS();
        for (const d of D.drops) d.life = Math.max(d.life, MUTDROP.dropLife); // (it never decays in school)
        const C = R.mdE;
        if (C && !C.dead) { C.mdT = G.t; C.mdCarry = true; } // (it never sheds in school)
        else if (!D.drops.length) { // (a carrier, and another if the last one was lost)
          schoolFoes(R, ['spitter'], stFar(R.A.rect));
          const e = R.foes[R.foes.length - 1];
          e.mdRoll = true; e.mdCarry = true; e.mdT = G.t; e.mdPing = G.realT; R.mdE = e;
          banner('MUTATION CARRIER!', MUTDROP.col); sfx('level');
        }
        return;
      }
      const C = G.junkE;
      if (C && !C.dead) C.junk = G.t; // (it never sheds in school)
      else if (!C && !G.junkDrops.length && junkK('spitter') <= R.k0 && junkK('spitter') < JUNK.stacks) { // (a carrier, and another if the helix decayed)
        schoolFoes(R, ['spitter'], stFar(R.A.rect));
        const e = R.foes[R.foes.length - 1];
        e.junk = G.t; e.junkPing = G.realT; G.junkE = e; e.hp *= JUNK.hpK; e.maxHp *= JUNK.hpK;
        banner('JUNK DNA!', '#e9f5db'); sfx('level');
      }
    },
    got: R => V10 ? ((G.stats && G.stats.mutDrops) || 0) > R.k0 || !mdOk().length : junkK('spitter') > R.k0 || junkK('spitter') >= JUNK.stacks,
    done: R => SCHOOL_ST.junk.got(R) && !schoolLeft(R),
    task: R => SCHOOL_ST.junk.got(R) ? `${schoolLeft(R)} LEFT` : (V10 ? mdS().drops.length : G.junkDrops.length) ? 'SWIM INTO THE STRAND' : 'KILL THE ONE WITH THE HELIX' },
};

// ---------------------------------------------------------------- hooks
// Every frame (lvTick): lesson 1 and the stretches between rooms.
function schoolTick() {
  if (!schoolOn()) return;
  const V = G.lvl;
  if (!V.msg.junk) { V.msg.junk = 1; G.nextJunk = 1e12; } // (no random junk DNA here: lesson 11 has its own)
  if (!V.msg.start && G.t > 1.2) { V.msg.start = 1; schoolSay('Left alone, you swim yourself: that is autorun. Touch and drag anywhere to steer; let go and autorun takes over again.'); }
}
function schoolEnter(R) { R.from = G.moveDir; SCHOOL_ST[R.A.st].enter(R); }
function schoolArena(R, dt) { const S = SCHOOL_ST[R.A.st]; if (S.tick) S.tick(R, dt); }
function schoolDone(R) {
  const ok = SCHOOL_ST[R.A.st].done(R);
  if (ok) { G.lvl.passed = (G.lvl.passed || 0) + 1; if (R.A.st === 'junk') schoolSay('That is everything. The egg is just ahead. Go and get it.', PAL.reward); }
  return ok;
}
// The HUD line: what to do now.
function schoolTask(R) {
  if (R && R.A.st) return SCHOOL_ST[R.A.st].task(R);
  const n = G.lvl.passed || 0;
  return n >= SCHOOL.arenas.length ? 'THE EGG: GO ON' : n ? 'SWIM ON' : 'LESSON 1: AUTORUN';
}
// Autorun: on down the tube between rooms, and to whatever the room is about inside one.
function schoolSteer(p) {
  const V = G.lvl, R = V.arena;
  if (!R) return lvPushOn(p) ? Object.assign({ w: 0.9 }, lvPushOn(p)) : null;
  const st = R.A.st;
  if (st === 'box' && R.box && G.pickups.includes(R.box)) return { x: R.box.x, y: R.box.y, w: 1.2 };
  if (st === 'feat' || st === 'armour') { // (close in, so the Feat has something to hit and the antibodies something to shoot)
    let t = null, td = 1e9; for (const e of R.foes || []) { const d = e.dead ? 1e9 : Math.hypot(e.x - p.x, e.y - p.y); if (d < td) { td = d; t = e; } }
    if (t && td > 160) return { x: t.x, y: t.y, w: 0.8 };
  }
  if (st === 'junk' && G.junkDrops.length) return { x: G.junkDrops[0].x, y: G.junkDrops[0].y, w: 1.6 };
  if (st === 'junk' && G.junkE && !G.junkE.dead && Math.hypot(G.junkE.x - p.x, G.junkE.y - p.y) > 200) return { x: G.junkE.x, y: G.junkE.y, w: 0.8 };
  if (st === 'hazard') return { x: (R.A.rect[0] + R.A.rect[2] + 1) / 2 * LV_C, y: (R.A.rect[1] + 1) * LV_C, w: 0.9 };
  return null;
}
// The title's START SWIMMING: a fresh save (no runs yet), or one whose tutorial was reset, goes to Level 0 first.
const schoolFresh = () => META.school == null && !RUNLOG.some(r => r.smp !== 's009'); // (no runs, and Level 0 never passed or skipped: the samples screen shows only Level 0)
const schoolDue = () => META.schoolDue === 1 || schoolFresh();
function schoolStart() { UI.sample = 's009'; openSeq(); }
// The SKIP TUTORIAL button (top of the HUD, Level 0 only): back to the title, and START SWIMMING goes to the samples from then on.
function schoolSkip() {
  if (!schoolOn()) return;
  META.school = META.school || 2; delete META.schoolDue; saveMeta();
  logRun(G, 'QUIT'); G = null;
  $('schoolSkip').classList.remove('on');
  UI.show('title'); UI.renderBest(); UI.toast('TUTORIAL SKIPPED. LEVEL 0 IS IN THE CAMPAIGN LIST.');
}
// No dying in school: a second wind instead.
function schoolSave() {
  if (!schoolOn()) return false;
  const p = me();
  p.hp = G.P.maxHp; p.iframes = 2.5; G.armourLost = 0;
  for (const e of G.enemies) if (!e.dead && !e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 260) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4); }
  ring(p.x, p.y, 160, SCHOOL_COL, 0.6, 5); banner('SECOND WIND', SCHOOL_COL); sfx('level');
  if (!G.lvl.msg.save) { G.lvl.msg.save = 1; schoolSay('No dying in school. In a real run, that was the end of you.'); }
  return true;
}
// The egg: the real thing, this time.
function schoolWin(at) {
  const V = G.lvl;
  if (V.won) return;
  V.won = true;
  META.school = 1; delete META.schoolDue;
  META.lvBest = META.lvBest || {};
  if (!META.lvBest.school || G.t < META.lvBest.school) META.lvBest.school = G.t;
  saveMeta();
  for (const e of G.enemies) if (!e.dead && !e.charmed) { e.dead = true; spawnPart(e.x, e.y, '#ffffff', 3, 70, 0.4); }
  spawnPart(at.x, at.y, '#ffd6e8', 40, 260, 1.2, 5); ring(at.x, at.y, 200, '#ffd6e8', 0.8, 8); ring(at.x, at.y, 340, PAL.reward, 1.1, 4);
  cam.shake = 8; sfx('level'); vibrate([60, 40, 120]);
  banner('FERTILISED!', '#ffd6e8');
  schoolSay('Lessons over. That was the easy egg: in a real run there are four hundred million of you, and only one gets in.', '#ffd6e8');
  after(2.6, () => { if (G && G.lvl && G.state === 'play') { G.state = 'won'; if (typeof UI !== 'undefined') UI.showVictory(); } });
}
function schoolEulogy() {
  return `Swimming Lessons passed. You can swim, shoot, collect, hunt, sprint, perform a Feat, dodge acid, wear protection and steal junk DNA. In a real run there are four hundred million of you, the way through is yours to find, and only one gets the egg.`;
}
