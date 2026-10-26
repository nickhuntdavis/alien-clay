'use strict';
// Spawn Prawn - v10 bosses (ENEMY_DESIGN.md 5.4, 12): every boss takes its defence and damage type from roster.js
// (ROSTER_BOSSES) and loses its old hard counters. "Weak to Acid +60%", "immune to Acid", "Force passes through"
// and the like are off under V10 (bosses.js bossDamageMul); a boss's intro card says what its defence is and what
// gets through it instead. The Macrophage Queen's adds are capped (no heavy defence plus unlimited summons).
// Hooks: bosses.js bossDamageMul -> skips weak/resist/noForce/weakAoe under V10; fight.js fightCd and pdef.js
// pdefTypes read B.v10def / B.v10dmg; bosses.js summon cap -> boss10SummonOk.

const BOSS10_TEXT = {
  squishy: ['Squishy: blunt Force hits lose a third and barely push it', 'Acid, Static, Fire, Blood and Parasite land in full'],
  membrane: ['Membrane: a blue pool that soaks hits first and refills if you let it rest', 'Keep up the pressure: it only refills after 2 s untouched. Force is poor into it'],
  shell: ['Shell: layers that take 3 off every hit', 'Acid strips layers for good; a heavy Force hit knocks one loose'],
  thorns: ['Thorns: touching it hurts you back', 'Ranged attacks never trigger it'],
  evasion: ['Evasion: a third of your shots and swipes simply miss', 'Bursts, Beams and Pools never miss'],
};
const BOSS10_SUMMON_CAP = 8;
// v10 difficulty: v9's enemy curve was tuned for v9's much bigger builds. Tune here (sim target: 20 to 50% bot wins).
const V10_DIFF = { hp: 0.65, dmg: 0.6, bossHp: 0.45, rival: 0.3, terrain: 0.5, bullet: 0.6, fireGap: 1.33, ebulCap: 120, egg: 0.03 }; // (bullet: enemy and boss bullet damage, ebulCap: bullets alive at once (game.js eBullet); fireGap: ordinary shooters' gap between volleys)

if (typeof ROSTER_BOSSES !== 'undefined') {
  for (const B of BOSSES) {
    const R = ROSTER_BOSSES.find(r => r.id === B.id);
    if (!R) continue;
    B.v10def = R.def || null;
    B.v10dmg = R.dmgType || 'force';
    const t = R.def && BOSS10_TEXT[R.def.kind];
    // The intro card: its own strengths stay (minus the type immunities), its weaknesses become its defence's answers.
    B.strengths = (B.strengths || []).filter(s => !/immune|resist|passes straight through/i.test(s));
    if (t) B.strengths = [t[0]].concat(B.strengths).slice(0, 3);
    B.weaknesses = (B.weaknesses || []).filter(s => !/[+-]\d+%|double damage|immune/i.test(s));
    if (t) B.weaknesses = [t[1]].concat(B.weaknesses).slice(0, 3);
    if (!B.weaknesses.length) B.weaknesses = ['Learn the telegraph; every big attack shows where it lands first'];
  }
}
// Mitch & Osis: each twin has its own defence from the roster's parts (Mitch Membrane, Osis Shell). fightCd reads e.v10def first.
function boss10Twins(a, b) {
  const R = typeof ROSTER_BOSSES !== 'undefined' && ROSTER_BOSSES.find(r => r.id === 'twins');
  if (!R || !R.parts) return;
  a.v10def = R.parts[0].def; b.v10def = R.parts[1].def;
}
// The Queen may not flood the dish: summons stop while this many of her adds are alive.
function boss10SummonOk(boss) {
  return G.enemies.filter(e => !e.dead && e.summonedBy === boss).length < BOSS10_SUMMON_CAP;
}

// Boss Membranes refill slowly. COMBAT's 2 s quiet then a full refill in 2 s suits small cells; on a boss (the Johnny's
// Membrane is half of 3000 health at wave 5) it refilled during every roll and a weak build never touched the health bar
// (bossprobe: Membrane up 79 to 99% of the fight, 97 to 400 s). The 2 s quiet stays (its intro card says so); the refill
// takes 10 s. Hook: wraps combat.js tickDefence (fight.js calls it by name each frame).
const BOSS10_MEM_FILL = 10, BOSS10_MEM_FRAC = 0.3; // (refill seconds; Membrane as a share of boss health, in place of COMBAT.membraneFrac's 0.5)
// Boss Membranes are 30% of health, not 50%: at wave 20 Mitch's was 55k points, up 87 to 95% of a 400 s fight that never ended.
const boss10Cd0 = fightCd;
fightCd = function (e) {
  const had = !!e.cd, c = boss10Cd0(e);
  if (!had && e.boss && c.def === 'membrane' && c.memMax > 0) { const k = BOSS10_MEM_FRAC / COMBAT.membraneFrac; c.memMax *= k; c.mem = Math.min(c.mem, c.memMax); }
  return c;
};
const boss10Tick0 = tickDefence;
tickDefence = function (t, dt) {
  if (t.rank !== 'boss' || t.def !== 'membrane') return boss10Tick0(t, dt);
  const f0 = COMBAT.membraneFill;
  COMBAT.membraneFill = BOSS10_MEM_FILL;
  try { boss10Tick0(t, dt); } finally { COMBAT.membraneFill = f0; }
};
