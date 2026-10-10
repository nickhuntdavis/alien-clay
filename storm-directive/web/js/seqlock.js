'use strict';
// Spawn Prawn - the sequence ladder. You start with three sequences (the Firstborn, the Chonker and the Bright
// Spark). The rest unlock one rung at a time, alternating skill and grind, each a bit trickier than the last:
//   1 The Favourite       skill  beat wave mode with each of the three starters as your Primary
//   2 The Good Eater      grind  pick up 150 power-ups (all runs)
//   3 The Quiet One       skill  beat a boss without taking any damage during the fight
//   4 The Problem Child   grind  deal 2,000,000 chemical damage (all runs)
//   5 The Designer Baby   skill  beat wave mode without using a Rewind
//   6 The Redtail         grind  play 30 runs (any result)
//   7 The Reborn          grind  reach Rank III with every other sequence
// Sequences unlocked under the old rules stay unlocked (META.seqGrand), and wave-mode wins already in the run
// log count towards rung 1. Newly unlocked sequences are announced on the end-of-run screen (seqNewHtml).
// Hooks: genes.js profUnlocked (seqGrand); seqsel.js seqOrder (rung); campaign.js campWin (seqWin);
// bosses.js spawnBoss / boss death (seqBossStart, seqBossDead); game.js hurtPlayer (seqHurt); ui.js end screen.

const SEQ_STARTERS = ['vanguard', 'bruiser', 'nerd'];
const SEQ_NAME = id => PROFILES[id] ? PROFILES[id].name.replace(/^The /, 'the ') : id;
const seqDishWon = id => !!(META.dishWon && META.dishWon[id]);
const SEQ_LADDER = {
  eggseeker: { rung: 1, text: 'Beat wave mode (The Petri Dish) with the Firstborn, the Chonker and the Bright Spark as your Primary', have: () => SEQ_STARTERS.filter(seqDishWon).length, need: 3 },
  pusher:    { rung: 2, text: 'Pick up 150 power-ups (all runs)', have: () => META.life.pickups, need: 150 },
  stealth:   { rung: 3, text: 'Beat a boss without taking any damage during the fight', have: () => Math.min(1, META.cleanBoss || 0), need: 1 },
  acid:      { rung: 4, text: 'Deal 2,000,000 chemical damage (all runs)', have: () => Math.floor(META.life.elem), need: 2e6 },
  splicer:   { rung: 5, text: 'Beat wave mode without using a Rewind', have: () => Math.min(1, META.noRewindWin || 0), need: 1 },
  redtail:   { rung: 6, text: 'Play 30 runs (any result)', have: () => (typeof RUNLOG !== 'undefined' ? RUNLOG.length : 0), need: 30 },
  reborn:    { rung: 7, text: 'Reach Rank III with every other sequence', have: () => Object.keys(PROFILES).filter(id => id !== 'reborn' && profRank(id) >= 3).length, need: () => Object.keys(PROFILES).length - 1 },
};
for (const id in SEQ_LADDER) if (PROFILES[id]) {
  const L = SEQ_LADDER[id];
  PROFILES[id].unlock = { text: L.text, have: L.have, rung: L.rung, get need() { return typeof L.need === 'function' ? L.need() : L.need; } };
}

// Once, on the first load of this version: keep what the old rules had unlocked, and count past wave wins.
(function seqMigrate() {
  if (META.seqMig) return;
  const L = META.life || {}, runs = typeof RUNLOG !== 'undefined' ? RUNLOG : [], g = META.seqGrand = META.seqGrand || {};
  const old = { eggseeker: (L.bestT || 0) >= 600, stealth: (L.bosses || 0) >= 25, pusher: (L.pickups || 0) >= 100, acid: (L.elem || 0) >= 2e6, splicer: (L.casts || 0) >= 1500, redtail: runs.length >= 20 };
  for (const id in old) if (old[id]) g[id] = 1;
  const won = META.dishWon = META.dishWon || {};
  for (const r of runs) if (r.res === 'WON' && r.smp === 's002' && r.seq) won[r.seq.split('+')[0]] = 1;
  META.seqAnn = {}; for (const id in PROFILES) if (profUnlocked(id)) META.seqAnn[id] = 1; // (no fanfare for what you already had)
  META.seqMig = 1; saveMeta();
})();

function seqWin(G) {
  const id = G.genes && G.genes.primary;
  if (id) (META.dishWon || (META.dishWon = {}))[id] = 1;
  if (!G.stats.rewinds) META.noRewindWin = (META.noRewindWin || 0) + 1;
  saveMeta();
}
function seqBossStart() { G.bossHurt = false; }
function seqHurt() { if (G.boss && !G.boss.dead) G.bossHurt = true; }
function seqBossDead() { if (G.bossHurt === false) { META.cleanBoss = (META.cleanBoss || 0) + 1; saveMeta(); } G.bossHurt = null; }

// The end-of-run screen: anything that just unlocked.
function seqNewHtml() {
  const ann = META.seqAnn || (META.seqAnn = {}), fresh = Object.keys(PROFILES).filter(id => profUnlocked(id) && !ann[id]);
  if (!fresh.length) return '';
  for (const id of fresh) ann[id] = 1; saveMeta();
  return fresh.map(id => `<div class="bdna" style="color:${SEQ_LOOK[id] ? SEQ_LOOK[id].color : PAL.upgrade}">NEW SEQUENCE DECODED: ${esc(PROFILES[id].name.toUpperCase())}</div>`).join('');
}
// Which starters still need a wave-mode win (for the end screen's nudge).
const seqStartersLeft = () => SEQ_STARTERS.filter(id => !seqDishWon(id));
