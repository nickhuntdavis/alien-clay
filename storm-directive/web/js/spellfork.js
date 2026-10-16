'use strict';
// Spawn Prawn - spell forks. At Lv 4 every spell asks you to choose one of two upgrades, the way weapons do
// at their signature levels. The choice is kept in w.fork ('a' or 'b'). Stat changes are applied from
// computeStats (spellForkStats); behaviour changes are read where the spell is cast (game.js fireWeapon).
const SPELL_FORK_LV = 4;
const SPELL_FORKS = {
  meteor:     [{ name: 'Double Delivery', desc: 'One more stork every time, each dropping 80% as hard.' },
               { name: 'Hot Water Bottle', desc: 'The acid it leaves on the ground is 40% wider and lasts twice as long.' }],
  frostnova:  [{ name: 'Soap Bath', desc: 'Everything it catches stays glued twice as long.' },
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
  naughtycorner: [{ name: 'Longer Sentence', desc: 'The salt ring lasts nearly twice as long.' },
               { name: 'Sent to Bed', desc: 'When the ring fades, everything still inside takes a blast worth eight seconds of its damage.' }],
  tantrum:    [{ name: 'Encore', desc: 'A second blast follows 0.7 seconds later, at 60% strength, wherever you are by then.' },
               { name: 'Full Volume', desc: 'The blast also stuns every enemy it hits for 1.5 seconds (not bosses).' }],
  dummyspit:  [{ name: 'Spare Dummy', desc: 'One more dummy every time.' },
               { name: 'Dummy Chain', desc: 'When a dummy bursts, up to two nearby enemies get one at half strength.' }],
  sentry:     [{ name: 'Night Light', desc: 'Turrets shoot twice as fast.' },
               { name: 'Twin Pack', desc: 'One more turret every time.' }],
  // v9.23: the new Feats (newfeats.js reads the behaviour paths where each one is performed)
  slimemould: [{ name: 'Foraging', desc: 'It grows to the three toughest enemies at once.' },
               { name: 'Memory', desc: 'The network stays for the rest of the wave (20s outside wave mode), slowing anything on it.' }],
  polarbody:  [{ name: 'Meiosis II', desc: 'It splits into two decoys halfway through.' },
               { name: 'Zona', desc: 'It is armoured, so it lasts the full time whatever hits it.' }],
  hagfish:    [{ name: 'Knot Tying', desc: 'When the slime ends, you slip out at speed in the direction you swim.' },
               { name: 'Gill Clogger', desc: 'Stuck enemies cannot fire.' }],
  vanishingtwin: [{ name: 'Absorbed', desc: 'A 25% chance the enemy never comes back (not elites). It counts as a kill.' },
               { name: "Survivor's Guilt", desc: 'While it fights for you, you take 25% less damage.' }],
  mosquito:   [{ name: 'Return Visit', desc: 'It stabs a second line 1s later.' },
               { name: 'Itch', desc: 'Bitten enemies stop to scratch for 1s (not bosses).' }],
  notlatex:   [{ name: 'Petroleum Jelly', desc: 'The sheen lasts twice as long.' },
               { name: 'Expired', desc: 'Perished shields and armour burst, hitting whatever is behind them.' }],
  donorsample: [{ name: 'Matched Donor', desc: 'The damage type is no longer random: it is one that sets off an unstable reaction.' },
               { name: 'Split Sample', desc: 'Every pass also lands a random damage type.' }],
  ouija:      [{ name: 'Long Word', desc: 'Always a word of six letters or more.' },
               { name: 'Goodbye', desc: 'When the word ends, every enemy it cursed takes a hit per letter.' }],
  formicacid: [{ name: 'Worker', desc: 'Two bites on two targets.' },
               { name: 'Pheromone Trail', desc: 'The spray leaves a trail for 4s that draws enemies along it.' }],
  fecaltransplant: [{ name: 'Good Bacteria', desc: 'Heals 20% instead of 10%.' },
               { name: 'Bad Bacteria', desc: 'No heal, but the shedding lasts twice as long and touches give three doses.' }],
  bombardier: [{ name: 'Turret', desc: 'The cone keeps spraying for 1s, tracking the densest crowd.' },
               { name: 'Escape Artist', desc: 'Nothing can touch you during the recoil dash.' }],
  crabs:      [{ name: 'Nits', desc: 'Dead hosts leave eggs that hatch into two crabs 2s later.' },
               { name: 'Grip', desc: 'Infested enemies are dragged towards each other.' }],
  vandegraaff: [{ name: 'Earthed', desc: 'It also pulls small enemies in.' },
               { name: 'Spark Gap', desc: 'It fires an arc for every bullet as it catches it, not at the end.' }],
  wanderingwomb: [{ name: 'Ectopic', desc: 'It stops on the toughest enemy it meets and stays there for 3s.' },
               { name: 'Bicornuate', desc: 'Two wombs, angled apart.' }],
  anhydrobiosis: [{ name: 'Vacuum Rated', desc: 'The husk reflects bullets back at whoever fired them.' },
               { name: 'Rehydration', desc: 'The splash also heals 15%.' }],
  capacitation: [{ name: 'Hyperactivated', desc: 'You drive twice as far.' },
               { name: 'Zona Binding', desc: 'The last enemy in line is stuck in place for 2s.' }],
  brownfat:   [{ name: 'Thermogenic', desc: 'It ignites at once.' },
               { name: 'Insulation', desc: 'The slick is twice as wide.' }],
  asymptomatic: [{ name: 'Carrier', desc: 'During the wait, the hosts pass a dose to anything they touch.' },
               { name: 'Late Diagnosis', desc: 'The wait is 6s and the payoff is twice as big.' }],
  rupture:    [{ name: 'Premature', desc: 'Half the stamina, half the reach.' },
               { name: 'Second Stage', desc: 'A second wave 1s later.' }],
  spinnbarkeit: [{ name: 'Elastic', desc: 'When a string snaps, it flings both ends into each other.' },
               { name: 'Ferning', desc: 'Each string branches to a third enemy.' }],
  tonic:      [{ name: 'Upside Down', desc: 'Lasts 2.5s.' },
               { name: 'Twitch', desc: 'Bosses that move take triple.' }],
  earcandling: [{ name: 'Vigil', desc: 'Two candles.' },
               { name: 'Snuffed', desc: 'When it burns out, it bursts in a ring of oil.' }],
  hostileenv: [{ name: 'Buffer', desc: 'Inside it you take no Acid damage and swim 20% faster.' },
               { name: 'Yeast', desc: 'It drifts towards the nearest crowd.' }],
  sharedplacenta: [{ name: 'Transfusion Syndrome', desc: 'All of the damage is copied, not half.' },
               { name: 'Cord Pull', desc: 'Tied pairs are pulled into each other.' }],
  productivecough: [{ name: 'Chesty', desc: 'Two globs.' },
               { name: 'Hairball', desc: 'The last bounce bursts and sticks everything nearby.' }],
  hirudotherapy: [{ name: 'Anticoagulant Saliva', desc: 'Their bleeding lasts twice as long.' },
               { name: 'Engorged', desc: 'Leeches burst when full, splashing bleeding onto neighbours.' }],
  lipidbilayer: [{ name: 'Ion Channel', desc: 'Enemies that cross it are shocked.' },
               { name: 'Vesicle', desc: 'The wall curls into a ring around you and goes where you go.' }],
  biofilm:    [{ name: 'Quorum Sensing', desc: 'It grows twice as fast with 5 or more enemies on it.' },
               { name: 'Persister Cells', desc: 'Enemies that leave it stay snotty for 3s.' }],
  shedlining: [{ name: 'Heavy Flow', desc: 'A wider tide that sweeps harder.' },
               { name: 'Irregular', desc: 'A second tide from the opposite edge.' }],
  osmosis:    [{ name: 'Hypotonic', desc: 'The source bursts after spreading.' },
               { name: 'Gradient', desc: 'It spreads twice: on to the neighbours\' neighbours.' }],
  aerosol:    [{ name: 'Droplet', desc: 'The cloud drifts twice as far.' },
               { name: 'Fomite', desc: 'The cloud lasts 8s.' }],
  selflube:   [{ name: 'Bowling', desc: 'Flung enemies hit whatever they land on.' },
               { name: 'Long-Lasting', desc: 'Lasts twice as long.' }],
  anticoagulant: [{ name: 'Thinner', desc: 'The splash makes neighbours bleed twice as hard.' },
               { name: 'Heparin', desc: 'It goes off twice, 1s apart.' }],
  fertilewindow: [{ name: 'Channels', desc: 'Two lanes in a V.' },
               { name: 'Crypts', desc: 'Reaching the end of the lane refills 30% stamina.' }],
  surfactant: [{ name: 'Detergent', desc: 'It strips the statuses off enemies that enter and splashes them outward.' },
               { name: 'Foam', desc: 'The patch follows you.' }],
  lacticacid: [{ name: 'Anaerobic', desc: 'It charges when you are hit, too.' },
               { name: 'Cool Down', desc: 'The burst also refills 30% stamina.' }],
};
const spellFork = (w, k) => !!(w && w.isSpell && w.fork === k);
// From computeStats.
function spellForkStats(w, s) {
  if (w.id === 'warp') { // (after its path, below)
    if (w.fork === 'a') s.dur *= 1.5;
    // Nap Time can't be up more than 40% of the time: at Lv 10 with cooldown upgrades it used to slow the
    // whole slide almost permanently (Reece: "easy mode").
    s.cd = Math.max(s.cd, s.dur * 2.5);
    return;
  }
  if (!w.isSpell || !w.fork) return;
  const a = w.fork === 'a';
  switch (w.id) {
    case 'meteor': if (a) { s.count = (s.count || 1) + 1; s.dmg *= 0.8; } break;
    case 'blackhole': if (a) s.pull = (s.pull || 0) * 2; break;
    case 'barrier': if (a) s.area *= 1.5; else s.dmg *= 2.5; break;
    case 'bladestorm': if (a) s.boomerang = 1; else s.count = (s.count || 1) + 4; break;
    case 'cloud': if (a) s.dur *= 2; break;
    case 'sentry': if (a) s.rate *= 0.5; else s.count = (s.count || 1) + 1; break;
    case 'naughtycorner': if (a) s.dur *= 1.8; break;
    case 'dummyspit': if (a) s.count = (s.count || 1) + 1; break;
    case 'oob': if (a) s.dur *= 1.6; break;
    // (the new Feats: newfeats.js)
    case 'slimemould': if (a) s.count = (s.count || 1) + 2; break;
    case 'notlatex': if (a) s.dur *= 2; break;
    case 'formicacid': if (a) s.count = (s.count || 1) + 1; break;
    case 'fecaltransplant': if (!a) s.dur *= 2; break;
    case 'rupture': if (a) { s.cd *= 0.5; s.area *= 0.5; } break;
    case 'tonic': if (a) s.dur = Math.max(s.dur, 2.5); break;
    case 'brownfat': if (!a) s.area *= 2; break;
    case 'asymptomatic': if (!a) s.dur = 6; break;
    case 'hirudotherapy': if (a) s.bleedK = 2; break;
    case 'shedlining': if (a) s.area *= 1.6; break;
    case 'aerosol': if (!a) s.dur = Math.max(s.dur, 8); break;
    case 'selflube': if (!a) s.dur *= 2; break;
    case 'capacitation': if (a) s.reach = 2; break;
    case 'productivecough': if (a) s.globs = 2; break;
  }
}
// The Lv 4 choice, from setWeaponLevel's spell branch.
function spellForkOpts(w) {
  return SPELL_FORKS[w.id].map((f, i) => ({ def: w.def, rarity: 3, tag: 'FEAT PATH', icon: w.def.icon, color: w.def.color, elem: w.def.elem, title: f.name,
    sub: `${w.def.name} | Lv ${SPELL_FORK_LV}, only this Feat`, desc: f.desc,
    apply: () => { w.fork = i ? 'b' : 'a'; computeStats(w); floatText(me().x, me().y - 40, f.name.toUpperCase(), PAL.upgrade, 15, 1.2); } }));
}
