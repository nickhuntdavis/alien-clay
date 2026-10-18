'use strict';
// Spawn Prawn - v10 bosses (ENEMY_DESIGN.md 5.4, 12): every boss takes its defence and damage type from roster.js
// (ROSTER_BOSSES) and loses its old hard counters. "Weak to Acid +60%", "immune to Acid", "Force passes through"
// and the like are off under V10 (bosses.js bossDamageMul); a boss's intro card says what its defence is and what
// gets through it instead. The Macrophage Queen's adds are capped (no heavy defence plus unlimited summons).
// Hooks: bosses.js bossDamageMul -> skips weak/resist/noForce/weakAoe under V10; fight.js fightCd and pdef.js
// pdefTypes read B.v10def / B.v10dmg; bosses.js summon cap -> boss10SummonOk.

const BOSS10_TEXT = {
  squishy: ['Squishy: blunt Force hits lose a third and barely push it', 'Acid, Static, Fire, Blood and Soul land in full'],
  membrane: ['Membrane: a blue pool that soaks hits first and refills if you let it rest', 'Keep up the pressure: it only refills after 2 s untouched. Force is poor into it'],
  shell: ['Shell: layers that take 3 off every hit', 'Acid strips layers for good; a heavy Force hit knocks one loose'],
  thorns: ['Thorns: touching it hurts you back', 'Ranged attacks never trigger it'],
  evasion: ['Evasion: a third of your shots and swipes simply miss', 'Bursts, Beams and Pools never miss'],
};
const BOSS10_SUMMON_CAP = 8;

if (typeof V10 !== 'undefined' && V10 && typeof ROSTER_BOSSES !== 'undefined') {
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
// The Queen may not flood the dish: summons stop while this many of her adds are alive.
function boss10SummonOk(boss) {
  if (!V10) return true;
  return G.enemies.filter(e => !e.dead && e.summonedBy === boss).length < BOSS10_SUMMON_CAP;
}
