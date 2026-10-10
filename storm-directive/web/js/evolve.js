'use strict';
// Spawn Prawn - sequence evolutions. Your Primary Sequence grows up with you: at Lv 5, 10, 20 and 50 it evolves,
// each step in its own style (the Chonker gets bigger, the Quiet One gets harder to hit, the Problem Child
// gets worse). Hook: evolveCheck (gainXp, on every level).
const EVOLVE_LV = [5, 10, 20, 50];
const maxHpUp = (P, G, k) => { const add = Math.round(P.maxHp * k); P.maxHp += add; if (G.player) G.player.hp += add; };
const EVOLVE = {
  vanguard: [
    { name: 'Sibling Rivalry', desc: '+8% damage.', apply: P => { P.might += 0.08; } },
    { name: "Teacher's Pet", desc: '+10% fire rate.', apply: P => { P.haste += 0.1; } },
    { name: 'Head Boy', desc: '+1 projectile for every weapon.', apply: P => { P.multishot += 1; } },
    { name: 'Heir Apparent', desc: '+25% damage and +15% swim speed.', apply: P => { P.might += 0.25; P.speed += 0.15; } },
  ],
  bruiser: [
    { name: 'Second Helping', desc: '+20% max HP.', apply: (P, G) => maxHpUp(P, G, 0.2) },
    { name: 'Big Boned', desc: '+3 armour.', apply: P => { P.armour += 3; } },
    { name: 'Belly Flop', desc: '+1 Headstrong: enemies you swim into take a beating.', apply: P => { P.ram += 1; } },
    { name: 'Absolute Unit', desc: '+40% max HP and +5 armour.', apply: (P, G) => { maxHpUp(P, G, 0.4); P.armour += 5; } },
  ],
  nerd: [
    { name: 'Extra Homework', desc: '+15% XP.', apply: P => { P.xp += 0.15; } },
    { name: 'Overclocked', desc: '+12% fire rate.', apply: P => { P.haste += 0.12; } },
    { name: 'Big Brain', desc: 'Reactions hit 25% harder, and +1 chain jump.', apply: P => { P.react += 0.25; P.chain += 1; } },
    { name: 'Galaxy Brain', desc: '+40% damage with every chemical.', apply: P => { for (const k in P.elem) if (k !== 'phys') P.elem[k] += 0.4; } },
  ],
  eggseeker: [
    { name: 'Gold Star', desc: '+8% crit chance.', apply: P => { P.crit += 0.08; } },
    { name: "Mummy's Favourite", desc: 'Crits hit 40% harder.', apply: P => { P.critDmg += 0.4; } },
    { name: 'Golden Child', desc: '+25% luck and +1 pierce.', apply: P => { P.luck += 0.25; P.pierce += 1; } },
    { name: 'The Chosen One', desc: '+15% crit chance, and crits hit 100% harder.', apply: P => { P.crit += 0.15; P.critDmg += 1; } },
  ],
  stealth: [
    { name: 'Wallflower', desc: '+6% dodge.', apply: P => { P.dodge = Math.min(0.7, P.dodge + 0.06); } },
    { name: 'Light Feet', desc: '+10% swim speed.', apply: P => { P.speed += 0.1; } },
    { name: 'Nobody Saw Anything', desc: '+8% dodge and +10% crit chance.', apply: P => { P.dodge = Math.min(0.7, P.dodge + 0.08); P.crit += 0.1; } },
    { name: 'Urban Legend', desc: '+10% dodge, and crits hit 75% harder.', apply: P => { P.dodge = Math.min(0.7, P.dodge + 0.1); P.critDmg += 0.75; } },
  ],
  pusher: [
    { name: 'Growth Spurt', desc: 'Regenerate 0.5 HP a second.', apply: P => { P.regen += 0.5; } },
    { name: 'Eats Everything', desc: '+2% lifesteal.', apply: P => { P.lifesteal += 0.02; } },
    { name: 'Healthy Appetite', desc: '+25% max HP, and heal to full.', apply: (P, G) => { maxHpUp(P, G, 0.25); if (G.player) G.player.hp = P.maxHp; } },
    { name: 'Bottomless Pit', desc: 'Healing works 50% better, and regenerate 2 HP a second.', apply: P => { P.healMult += 0.5; P.regen += 2; } },
  ],
  acid: [
    { name: 'Terrible Twos', desc: '+25% Acid damage.', apply: P => { P.elem.fire += 0.25; } },
    { name: 'Tantrum', desc: '+15% area.', apply: P => { P.area += 0.15; } },
    { name: 'Teenage Phase', desc: 'Effects last 25% longer, and +15% damage with every chemical.', apply: P => { P.dur += 0.25; for (const k in P.elem) if (k !== 'phys') P.elem[k] += 0.15; } },
    { name: 'Menace to Society', desc: '+30% damage.', apply: P => { P.might += 0.3; } },
  ],
  splicer: [
    { name: 'Gifted and Talented', desc: '+15% XP.', apply: P => { P.xp += 0.15; } },
    { name: 'Private Tutor', desc: '+20% luck.', apply: P => { P.luck += 0.2; } },
    { name: 'Lab Grown', desc: 'Reactions hit 40% harder.', apply: P => { P.react += 0.4; } },
    { name: 'Perfect Specimen', desc: '+30% damage with every chemical and +15% damage.', apply: P => { for (const k in P.elem) if (k !== 'phys') P.elem[k] += 0.3; P.might += 0.15; } },
  ],
  reborn: [
    { name: 'Deja Vu', desc: 'The Rewind meter fills 25% faster.', apply: P => { P.chronoGain += 0.25; } },
    { name: 'Been Here Before', desc: '+30% pickup range.', apply: P => { P.magnet += 0.3; } },
    { name: 'Past Lives', desc: 'Echoes inherit one more of your upgrades.', apply: P => { P.echoInherit += 1; } },
    { name: 'Enlightened', desc: '+20% damage and +20% fire rate.', apply: P => { P.might += 0.2; P.haste += 0.2; } },
  ],
  redtail: [
    { name: 'Lucky Horseshoe', desc: '+15% luck.', apply: P => { P.luck += 0.15; } },
    { name: 'Farm Strong', desc: '+15% max HP.', apply: (P, G) => maxHpUp(P, G, 0.15) },
    { name: 'Family Gun', desc: '+1 projectile for every weapon.', apply: P => { P.multishot += 1; } },
    { name: 'Head of the Family', desc: '+50% luck and +20% damage.', apply: P => { P.luck += 0.5; P.might += 0.2; } },
  ],
};
if (typeof TWINS_EVOLVE !== 'undefined') EVOLVE.twins = TWINS_EVOLVE; // (twins.js)
// From gainXp: when you reach an evolution level, your Primary Sequence evolves.
function evolveCheck(lvl) {
  if (!G || !G.genes) return;
  const id = G.genes.primary, i = EVOLVE_LV.indexOf(lvl), E = EVOLVE[id];
  if (i < 0 || !E || !E[i]) return;
  const ev = E[i];
  ev.apply(G.P, G);
  (G.evolved || (G.evolved = [])).push(ev.name);
  // (stat upgrades are re-derived by recomputeAll from G.P, so the evolution is part of the base from here on)
  recomputeAll();
  const p = me(), c = (SEQ_LOOK[id] || {}).color || PAL.upgrade;
  banner(`EVOLVED: ${ev.name.toUpperCase()}`, c);
  sysMsg(`${(SEQ_LOOK[id] || {}).short || 'YOUR SEQUENCE'} EVOLVES`, `Lv ${lvl}: ${ev.name}. ${ev.desc}`, c, true);
  ring(p.x, p.y, 120, c, 0.7, 6); addLight(p.x, p.y, 260, c, 0.6); sfx('level');
}
// For the sequence screen.
const evolveText = id => (EVOLVE[id] || []).map((e, i) => `Lv ${EVOLVE_LV[i]} ${e.name}`).join(', ');
