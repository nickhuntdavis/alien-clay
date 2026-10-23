'use strict';
// Spawn Prawn - the Race's upgrade schedule (user, 23 Oct; race only: race15.js raceOn).
//  - SCHEDULE: reward screens open only at set times (RPLAN.at: first at 0:30, then about every 40 to 45 s, last at
//    14:25), plus two milestones at 5:00 and 10:00: 22 in all. XP and level-ups carry on in the background; a request
//    that arrives between slots waits for the next one (the Reward Director's queue order decides which goes first). A
//    slot with nothing waiting still opens a level-up screen, so late slots aren't skipped when levels slow down.
//  - BANKING: when a level-up screen opens, the other level-ups waiting are folded into it and raise its rarity floor
//    (one rarity per RPLAN.bankPer banked levels, up to Epic). Nothing earned is lost.
//  - MILESTONES (placeholder until the sample reward sequence is designed): at 5:00 and 10:00, a Sample Milestone
//    screen, a level draft with a Rare floor.
//  - PHASES: transformations (Melee, Ranged, Mines, Strike from Above) are dealt less before 5:00 and more from 5:00 to
//    10:00; masteries are dealt less before 10:00 and more after.
//  - Straight through, as before: the start, forks and weapon branch screens, boss rewards and the second weapon.
//  - THE EGG: once its membrane wakes the Director applies what is waiting without screens (director.js dirAuto); slots
//    due after that are dropped.
// Hooks: none in shared files. Wraps director.js dirGate, dirTitle; modmatrix.js modDraftCands; v10.js v10Tick.
// Loads after director.js and atkswap.js.

const RPLAN = {
  at: [30, 70, 110, 150, 190, 230, 270, 335, 375, 415, 455, 495, 535, 575, 640, 685, 730, 775, 820, 865],
  milestones: [300, 600], off: false, bankPer: 2, bankMax: 3, mstoneBoost: 2,
  transform: ['melee', 'ranged', 'mines', 'dfa'], early: 0.35, mid: 1.6, mastEarly: 0.5, mastLate: 2,
};
const rplanOn = () => !RPLAN.off && typeof raceOn === 'function' && raceOn();
const rplanS = () => G.rplan || (G.rplan = { used: 0, ms: 0 });
const rplanDue = () => { const S = rplanS(); return S.used < RPLAN.at.length && G.t >= RPLAN.at[S.used]; };
const rplanFree = req => ['start', 'fork', 'wupfork', 'boss', 'relic'].includes(req.kind) || req.now || req.mstone || (req.kind === 'slot' && G.weapons.filter(Boolean).length < 2);

dirGate = (orig => function (req) {
  if (!rplanOn() || dirEgg() || rplanFree(req)) return orig(req);
  if (!rplanDue()) return 'wait';
  const S = rplanS();
  while (S.used < RPLAN.at.length && G.t >= RPLAN.at[S.used]) S.used++; // (a slot missed while another screen was up is not saved up)
  if (req.kind === 'level') { // banking: the other waiting level-ups fold into this one
    const more = G.lootQueue.filter(q => q !== req && q.kind === 'level');
    for (const q of more) G.lootQueue.splice(G.lootQueue.indexOf(q), 1);
    const bank = (req.rpBank || 0) + more.length;
    req.boost = Math.min(4, Math.max(req.boost || 0, G.rarBoost || 0, Math.min(RPLAN.bankMax, Math.floor(bank / RPLAN.bankPer))));
    G.rarBoost = 0; G.stats.banked = (G.stats.banked || 0) + more.length;
  }
  dirS().t = G.t;
  return dirOpen(req);
})(dirGate);
// The milestones: queued at their time, straight to the front.
v10Tick = (orig => function (dt) {
  orig(dt);
  if (!G || !rplanOn() || G.state !== 'play') return;
  const S = rplanS();
  if (RPLAN.fill !== false && rplanDue() && !G.lootQueue.length && !dirEgg()) G.lootQueue.push({ kind: 'level', rpSched: 1 }); // (every slot gets a screen, even when no level-up is waiting)
  if (S.ms < RPLAN.milestones.length && G.t >= RPLAN.milestones[S.ms]) {
    const min = Math.round(RPLAN.milestones[S.ms] / 60); S.ms++;
    if (!dirEgg()) G.lootQueue.unshift({ kind: 'level', mstone: min, boost: RPLAN.mstoneBoost, now: true });
  }
})(v10Tick);
dirTitle = (orig => function (req, titles) {
  orig(req, titles);
  if (req.mstone && titles.level) titles.level = ['SAMPLE MILESTONE: ' + req.mstone + ' MINUTES', 'You made it this far. Rare or better.'];
})(dirTitle);
// Phases: what the draft leans towards as the race goes on.
modDraftCands = (orig => function (kind) {
  const out = orig(kind);
  if (!rplanOn()) return out;
  const t = G.t;
  for (const c of out) {
    const id = c.fam && c.fam.startsWith('mod:') ? c.fam.slice(4) : null; if (!id) continue;
    if (RPLAN.transform.includes(id)) c.w *= t < 300 ? RPLAN.early : t < 600 ? RPLAN.mid : 1;
    const card = c.o(); c.o = () => card; // (built once to see if it is a mastery)
    if (card && card.tag === 'MASTERY') c.w *= t < 600 ? RPLAN.mastEarly : RPLAN.mastLate;
  }
  return out;
})(modDraftCands);
