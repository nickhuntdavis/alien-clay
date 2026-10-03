'use strict';
// Spawn Prawn - spell forks. At Lv 4 every spell asks you to choose one of two upgrades, the way weapons do
// at their signature levels. The choice is kept in w.fork ('a' or 'b'). Stat changes are applied from
// computeStats (spellForkStats); behaviour changes are read where the spell is cast (game.js fireWeapon).
const SPELL_FORK_LV = 4;
const SPELL_FORKS = {
  meteor:     [{ name: 'Double Delivery', desc: 'One more stork every cast, each dropping 80% as hard.' },
               { name: 'Hot Water Bottle', desc: 'The burning ground it leaves is 40% wider and burns twice as long.' }],
  frostnova:  [{ name: 'Ice Bath', desc: 'Everything it catches stays frozen twice as long.' },
               { name: 'Power Shower', desc: 'A second blast goes off a second later, wherever you are by then.' }],
  thunder:    [{ name: 'Brainwave', desc: 'Every strike jumps on to the two nearest enemies for half its damage.' },
               { name: 'Thunderclap', desc: 'Every strike leaves the enemies it hits dazed for a second (not bosses).' }],
  blackhole:  [{ name: 'Down the Back', desc: 'It pulls twice as hard.' },
               { name: 'Loose Change', desc: 'When it closes, it spits everything out in a blast worth four seconds of its damage.' }],
  heal:       [{ name: 'Plaster', desc: 'You also get 1.5s in which nothing can hurt you.' },
               { name: 'Kiss Chase', desc: 'The kiss also blasts nearby enemies for one and a half times what it heals.' }],
  warp:       [{ name: 'Lie-In', desc: 'Time stays slow 50% longer.' },
               { name: 'Power Nap', desc: 'You heal 3% of your max HP every second while time is slowed.' }],
  barrier:    [{ name: 'Extra Large', desc: 'The barrier is 50% wider.' },
               { name: 'Ribbed', desc: 'Whatever touches the barrier, or is hit by what it bounces back, takes 2.5 times the damage.' }],
  bladestorm: [{ name: 'Safety Scissors', desc: 'The blades fly out and come back, cutting everything twice.' },
               { name: 'Pinking Shears', desc: 'Four more blades in every ring.' }],
  cloud:      [{ name: 'Lingering Smell', desc: 'The cloud lasts twice as long.' },
               { name: 'Hotbox', desc: 'The cloud follows you around.' }],
  sentry:     [{ name: 'Night Light', desc: 'Turrets shoot twice as fast.' },
               { name: 'Twin Pack', desc: 'One more turret every cast.' }],
};
const spellFork = (w, k) => !!(w && w.isSpell && w.fork === k);
// From computeStats.
function spellForkStats(w, s) {
  if (!w.isSpell || !w.fork) return;
  const a = w.fork === 'a';
  switch (w.id) {
    case 'meteor': if (a) { s.count = (s.count || 1) + 1; s.dmg *= 0.8; } break;
    case 'blackhole': if (a) s.pull = (s.pull || 0) * 2; break;
    case 'warp': if (a) s.dur *= 1.5; break;
    case 'barrier': if (a) s.area *= 1.5; else s.dmg *= 2.5; break;
    case 'bladestorm': if (a) s.boomerang = 1; else s.count = (s.count || 1) + 4; break;
    case 'cloud': if (a) s.dur *= 2; break;
    case 'sentry': if (a) s.rate *= 0.5; else s.count = (s.count || 1) + 1; break;
  }
}
// The Lv 4 choice, from setWeaponLevel's spell branch.
function spellForkOpts(w) {
  return SPELL_FORKS[w.id].map((f, i) => ({ rarity: 3, tag: 'SPELL PATH', icon: w.def.icon, color: w.def.color, elem: w.def.elem, title: f.name,
    sub: `${w.def.name} | Lv ${SPELL_FORK_LV}, only this spell`, desc: f.desc,
    apply: () => { w.fork = i ? 'b' : 'a'; computeStats(w); floatText(me().x, me().y - 40, f.name.toUpperCase(), PAL.upgrade, 15, 1.2); } }));
}
