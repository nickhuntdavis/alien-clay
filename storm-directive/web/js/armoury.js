'use strict';
// Spawn Prawn - the Armoury: 25 weapons (v9.22) so that every damage type has at least five in the general pool,
// and at least one of each play style: melee, fun (toy-like twists), area and pets (ARM_CLASS below; the test
// armtest checks both). Each fires through an existing kind (melee sweep/lash, lob, ring, orbit, wake, drones)
// with its own twist, except the pets that chase and bite (kind 'critter', run here in armTick and drawn in
// armDraw). Each has its own Lv 5 and Lv 10 forks (sig ids start with 'x'). They join the eight starting
// sequences' weapon pools at the bottom of the data section.
// Hooks: armFire (fireWeapon), armSigStats (applySigStats), armHit (projHit), armEnd (projEnd), armLand (landLob),
// armMelee (meleeHit), armTick (update), armDraw (render).

Object.assign(WEAPONS, {
  // ---- Force
  rattle: { name: 'Baby Rattle', stars: [2, 3, 2, 5], play: 'Shake, shake: a ring of beads bursts out all around you. Every third shake flings them twice as far and twice as hard.', icon: 'BR', elem: 'phys', kind: 'ring', dir: 'nearest', role: 'Ring', armoury: 1,
    desc: 'The first thing you ever hit anyone with.',
    base: { dmg: 12, cd: 1.2, mag: 3, reload: 1.6, count: 12, speed: 260, pierce: 2, range: 200, size: 4 },
    lv: { 3: { count: 4 }, 6: { dmg: 0.3 }, 9: { pierce: 2 } }, sig: { 5: ['xbeads', 'xteething'], 10: ['xmaraca', 'xjingle'] } },
  swimmers: { name: 'Little Swimmers', stars: [2, 3, 3, 3], play: 'Three tiny swimmers of your own chase down enemies and headbutt them away. They never die, they just come back for more.', icon: 'LS', elem: 'phys', kind: 'critter', critter: 'ram', dir: 'nearest', role: 'Pets', armoury: 1,
    desc: 'They look up to you. Literally: they are very small.',
    base: { dmg: 14, cd: 0.7, mag: 1, reload: 0, count: 3, range: 320, speed: 300 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xbrood', 'xheadbutt'], 10: ['xrace', 'xmob'] } },
  // ---- Acid
  gutpunch: { name: 'Gut Punch', stars: [4, 3, 1, 2], play: 'A short, heavy jab of acid straight ahead. Whatever it hits is winded: stunned for a moment.', icon: 'GP', elem: 'fire', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'Right in the breadbasket. The breadbasket is now soup.',
    base: { dmg: 30, cd: 0.6, mag: 4, reload: 1.0, count: 1, range: 110, area: 1, width: 22, spread: 0.3, knock: 140 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['xonetwo', 'xknuckle'], 10: ['xsucker', 'xwindmill'] } },
  upchuck: { name: 'Upchuck', stars: [3, 2, 3, 4], play: 'Lobs mouthfuls of sick that leave burning puddles. Puddles that touch merge into one bigger, nastier puddle, so keep throwing at the same spot.', icon: 'UC', elem: 'fire', kind: 'lob', dir: 'cluster', role: 'Fun', armoury: 1,
    desc: 'Lunch, the sequel. Then the sequel to the sequel.',
    base: { dmg: 16, cd: 1.2, mag: 3, reload: 2.0, count: 1, spread: 30, range: 400, area: 60, explode: 1, dur: 4, flight: 0.7 },
    lv: { 3: { dur: 0.3 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xprojectile', 'xcarrots'], 10: ['xtechnicolour', 'xsecondwave'] } },
  ulcer: { name: 'Ulcer Moons', stars: [3, 4, 1, 3], play: 'Little moons of stomach acid circle you and melt whatever comes close.', icon: 'UM', elem: 'fire', kind: 'orbit', dir: 'nearest', role: 'Pets', armoury: 1,
    desc: 'Caused by stress. Causes more stress.',
    base: { dmg: 22, count: 2, dur: 4, reload: 2, radius: 64, spin: 3, size: 9, range: 100 },
    lv: { 3: { count: 1 }, 6: { area: 0.3 }, 9: { dmg: 0.4 } }, sig: { 5: ['xpeptic', 'xwideorbit'], 10: ['xperforate', 'xeclipse'] } },
  // ---- Mucus
  achoo: { name: 'Achoo', stars: [3, 3, 1, 4], play: 'A cone of sneeze right in front of you. Every fourth one is a big sneeze that goes off all around you and blows everything away.', icon: 'AC', elem: 'ice', kind: 'melee', melee: 'sweep', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'Covers its mouth with its elbow. Misses.',
    base: { dmg: 16, cd: 0.6, mag: 4, reload: 1.2, count: 1, range: 100, area: 1, arc: 1.6, knock: 90 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { area: 0.2 } }, sig: { 5: ['xblessyou', 'xhayfever'], 10: ['xsnotrocket', 'xatishoo'] } },
  roller: { name: 'Bogey Roller', stars: [3, 1, 4, 4], play: 'Rolls a bogey along the floor. Everything it rolls over sticks to it, so it grows bigger and hits harder the further it goes.', icon: 'BO', elem: 'ice', kind: 'gun', dir: 'cluster', role: 'Fun', armoury: 1,
    desc: 'Started under the desk. Ended up the size of the desk.',
    base: { dmg: 16, cd: 1.3, mag: 2, reload: 1.6, count: 1, spread: 0.05, speed: 170, pierce: 99, range: 520, size: 7 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['xpickup', 'xdoubleroll'], 10: ['xkatamari', 'xsplat'] } },
  runny: { name: 'Runny Nose', stars: [2, 5, 1, 4], play: 'No aiming: you drip a trail of snot wherever you swim. Anything that wades through it gets slower and slower.', icon: 'RN', elem: 'ice', kind: 'wake', dir: 'nearest', noTarget: 1, role: 'Slime Trail', armoury: 1,
    desc: 'It just keeps coming. Nobody has a tissue.',
    base: { dmg: 14, dur: 2.6, area: 24, range: 0 },
    lv: { 3: { area: 0.3 }, 6: { dur: 0.5 }, 9: { dmg: 0.5 } }, sig: { 5: ['xdrippy', 'xsniffles'], 10: ['xgluetrail', 'xcoldseason'] } },
  goblins: { name: 'Nose Goblins', stars: [2, 3, 3, 3], play: 'Little bogey goblins circle you and flick snot at whatever is closest.', icon: 'NG', elem: 'ice', kind: 'gun', drones: 1, dir: 'nearest', role: 'Pets', armoury: 1,
    desc: 'They live up there. They have always lived up there.',
    base: { dmg: 9, cd: 0.5, mag: 8, reload: 1.6, count: 2, spread: 0.1, speed: 480, pierce: 1, range: 380, size: 3.5 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xgoblin', 'xpicky'], 10: ['xboogeyman', 'xglueflick'] } },
  // ---- Static
  hairbrush: { name: 'Static Hairbrush', stars: [3, 3, 1, 4], play: 'Big brushing swings in front of you. Every fourth swing lets the built-up static go in a bolt that jumps through the crowd.', icon: 'SH', elem: 'shock', kind: 'melee', melee: 'sweep', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'A hundred strokes a night. It has been counting.',
    base: { dmg: 22, cd: 0.7, mag: 4, reload: 1.2, count: 1, range: 105, area: 1, arc: 2.0, knock: 80 },
    lv: { 3: { dmg: 0.25 }, 6: { area: 0.2 }, 9: { dmg: 0.35 } }, sig: { 5: ['xbristles', 'xbackcomb'], 10: ['xstaticdis', 'xbeehive'] } },
  carpet: { name: 'Carpet Shuffle', stars: [2, 3, 2, 5], play: 'Shuffle, shuffle, ZAP: a ring of sparks bursts out all around you.', icon: 'CS', elem: 'shock', kind: 'ring', dir: 'nearest', role: 'Ring', armoury: 1,
    desc: 'Socks on carpet. The oldest weapon there is.',
    base: { dmg: 14, cd: 1.1, mag: 3, reload: 1.6, count: 10, speed: 300, pierce: 1, range: 220, size: 3.5 },
    lv: { 3: { count: 4 }, 6: { dmg: 0.3 }, 9: { pierce: 2 } }, sig: { 5: ['xsocks', 'xnylon'], 10: ['xdoubleshuffle', 'xdoorknob'] } },
  bugs: { name: 'Lightning Bugs', stars: [2, 3, 3, 4], play: 'Glowing bugs buzz off after enemies. Every bite is a zap that jumps on to two more.', icon: 'LB', elem: 'shock', kind: 'critter', critter: 'zap', dir: 'nearest', role: 'Pets', armoury: 1,
    desc: 'Caught in a jar. Let out of the jar. Big mistake, for someone.',
    base: { dmg: 8, cd: 0.8, mag: 1, reload: 0, count: 3, range: 340, speed: 260, chain: 2 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { chain: 1 } }, sig: { 5: ['xglow', 'xbuzz'], 10: ['xswarmbugs', 'xsuperconductor'] } },
  // ---- Cooties
  grubby: { name: 'Grubby Fingers', stars: [2, 4, 2, 4], play: 'Quick pokes with filthy fingers. Poke something already Sick and the germs spread to everything around it.', icon: 'GF', elem: 'poison', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'Has never once washed its hands. Proud of it.',
    base: { dmg: 15, cd: 0.35, mag: 6, reload: 1.0, count: 1, range: 120, area: 1, width: 12, spread: 0.3, knock: 20 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['xnailbiter', 'xpicknose'], 10: ['xdoubledipping', 'xunwashed'] } },
  whoop: { name: 'Whooping Cough', stars: [2, 2, 2, 5], play: 'A coughing fit: three quick coughs, each a fan of slow, germy puffs that hang in the air and make the front of the crowd Sick.', icon: 'WC', elem: 'poison', kind: 'gun', dir: 'nearest', role: 'Cloud', armoury: 1,
    desc: 'Did not cover its mouth. Never covers its mouth.',
    base: { dmg: 6, cd: 1.2, mag: 3, reload: 1.6, count: 5, spread: 0.9, speed: 160, pierce: 99, range: 170, size: 9 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['xhacking', 'xphlegmy'], 10: ['xcroup', 'xchestinfection'] } },
  // ---- Oil
  cradlecap: { name: 'Cradle Cap', stars: [4, 2, 1, 3], play: 'A close-range burst of greasy scalp flakes that cut through the front row.', icon: 'CC', elem: 'oxi', kind: 'gun', dir: 'nearest', style: 'shard', role: 'Brawler', armoury: 1,
    desc: 'Flaky, greasy and stuck to the top of your head.',
    base: { dmg: 7, cd: 0.7, mag: 4, reload: 1.6, count: 6, spread: 0.6, speed: 500, pierce: 1, range: 260, size: 3 },
    lv: { 3: { count: 2 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['xdandruff', 'xgreasy'], 10: ['xscalp', 'xcombover'] } },
  butterknife: { name: 'Butter Knife', stars: [2, 4, 3, 3], play: 'Long, quick slashes that leave a greasy smear on whatever they hit.', icon: 'BK', elem: 'oxi', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'Blunt, greasy and not allowed near the toaster.',
    base: { dmg: 15, cd: 0.32, mag: 6, reload: 1.0, count: 1, range: 170, area: 1, width: 10, spread: 0.3, knock: 50 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { area: 0.25 } }, sig: { 5: ['xspreadit', 'xsalted'], 10: ['xmeltdown', 'xgreasedlightning'] } },
  lard: { name: 'Lard Lobber', stars: [3, 2, 3, 5], play: 'Lobs dollops of lard that send everything flying. Anything sent flying bowls into its mates and sends them flying too. STRIKE!', icon: 'LL', elem: 'oxi', kind: 'lob', dir: 'cluster', role: 'Fun', armoury: 1,
    desc: 'Straight from the chip shop fryer. Ten pins, no waiting.',
    base: { dmg: 14, cd: 1.2, mag: 3, reload: 1.8, count: 1, spread: 40, range: 380, area: 66, dur: 2.5, flight: 0.6 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { area: 0.3 } }, sig: { 5: ['xdripping', 'xspare'], 10: ['xstrike', 'xgreasefire'] } },
  lice: { name: 'Head Lice', stars: [2, 4, 3, 4], play: 'A gang of lice that hop from enemy to enemy, biting each one and leaving it Lubricated.', icon: 'HL', elem: 'oxi', kind: 'critter', critter: 'hop', dir: 'nearest', role: 'Pets', armoury: 1,
    desc: 'Caught at nursery. Shared with the whole nursery.',
    base: { dmg: 9, cd: 0.5, mag: 1, reload: 0, count: 4, range: 340, speed: 320 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xnits', 'xitchy'], 10: ['xinfest', 'xnitcomb'] } },
  // ---- Blood
  papercut: { name: 'Paper Cut', stars: [2, 5, 2, 3], play: 'Fast, thin slashes in a line in front of you. Tiny cuts, lots of them, and they all bleed.', icon: 'PC', elem: 'arcane', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'The smallest wound. The biggest fuss.',
    base: { dmg: 12, cd: 0.26, mag: 8, reload: 0.9, count: 1, range: 160, area: 1, width: 8, spread: 0.4, knock: 10 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { area: 0.25 } }, sig: { 5: ['xorigami', 'xsharpedge'], 10: ['xthousand', 'xpapertrail'] } },
  blister: { name: 'Blood Blister', stars: [3, 2, 3, 4], play: 'Lobs blisters that burst into a puddle of blood. When the puddle dries up, it pops one last time.', icon: 'BB', elem: 'arcane', kind: 'lob', dir: 'cluster', role: 'Splash', armoury: 1,
    desc: 'Do not pop it. It will pop itself. Twice.',
    base: { dmg: 14, cd: 1.3, mag: 3, reload: 2.0, count: 1, spread: 40, range: 380, area: 70, explode: 1, dur: 2.5, flight: 0.6 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xpopit', 'xbigblister'], 10: ['xbloodbath', 'xweeping'] } },
  leeches: { name: 'Leeches', stars: [2, 5, 3, 2], play: 'Leeches swim off, latch onto an enemy and suck until it dies. A little of what they drink comes back to you as health.', icon: 'LC', elem: 'arcane', kind: 'critter', critter: 'latch', dir: 'highhp', role: 'Pets', armoury: 1,
    desc: 'Medically approved. In 1820.',
    base: { dmg: 6, cd: 0.25, mag: 1, reload: 0, count: 2, range: 340, speed: 240 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xleech', 'xbloodsucker'], 10: ['xfatleech', 'xjumbo'] } },
  // ---- Soul
  spiritfingers: { name: 'Spirit Fingers', stars: [3, 3, 1, 4], play: 'Ghostly jazz hands: every attack is two swipes in front of you, one each way.', icon: 'SF', elem: 'soul', kind: 'melee', melee: 'sweep', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'They are like regular fingers, but more spirited.',
    base: { dmg: 14, cd: 0.6, mag: 4, reload: 1.1, count: 1, range: 115, area: 1, arc: 1.8, knock: 60 },
    lv: { 3: { dmg: 0.25 }, 6: { area: 0.2 }, 9: { dmg: 0.35 } }, sig: { 5: ['xjazzhands', 'xhaunt'], 10: ['xpoltergeist', 'xcoldtouch'] } },
  // ---- Water
  waters: { name: 'Waters Breaking', stars: [3, 2, 1, 5], play: 'A gush of water bursts out all around you and washes everything nearby away.', icon: 'WB', elem: 'salt', kind: 'gun', dir: 'nearest', role: 'Melee', armoury: 1,
    desc: 'It is happening. It is happening right now.',
    base: { dmg: 20, cd: 1.6, mag: 3, reload: 1.4, count: 1, range: 160, area: 120, knock: 260 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { area: 0.2 } }, sig: { 5: ['xcontractions', 'xgushy'], 10: ['xtsunami', 'xwaterbirth'] } },
  bathbomb: { name: 'Bath Bomb', stars: [4, 2, 3, 4], play: 'Lobs a fizzing bath bomb that bursts in a splash and leaves a soapy puddle.', icon: 'BA', elem: 'salt', kind: 'lob', dir: 'cluster', role: 'Splash', armoury: 1,
    desc: 'Smells like lavender. Hits like a brick.',
    base: { dmg: 22, cd: 1.4, mag: 3, reload: 2.0, count: 1, spread: 40, range: 380, area: 80, explode: 1, dur: 2, flight: 0.65 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xlavender', 'xbubbly'], 10: ['xjacuzzi', 'xtidal'] } },
  seamonkeys: { name: 'Sea Monkeys', stars: [3, 3, 3, 4], play: 'Just add water: a little family of sea monkeys swims after enemies and bites with a splash that hits everything nearby.', icon: 'SM', elem: 'salt', kind: 'critter', critter: 'splash', dir: 'cluster', role: 'Pets', armoury: 1,
    desc: 'Nothing like the picture on the packet.',
    base: { dmg: 12, cd: 0.7, mag: 1, reload: 0, count: 3, range: 340, speed: 280, area: 40 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { area: 0.3 } }, sig: { 5: ['xmonkey', 'xjustadd'], 10: ['xcastle', 'xbarrel'] } },
});
// Each one wears its damage type's colour.
for (const id in WEAPONS) if (WEAPONS[id].armoury && !WEAPONS[id].color) WEAPONS[id].color = ELEMENTS[WEAPONS[id].elem].color;
// Play style of every weapon in the general pool (shooter, melee, fun, area, pet). Not shown in game yet.
const ARM_CLASS = {
  blaster: 'shooter', shotgun: 'shooter', glaive: 'shooter', paddle: 'melee', flail: 'melee', onesie: 'melee', crayon: 'fun', rattle: 'area', swimmers: 'pet',
  flamer: 'shooter', mines: 'area', gutpunch: 'melee', upchuck: 'fun', ulcer: 'pet',
  frost: 'shooter', achoo: 'melee', roller: 'fun', runny: 'area', goblins: 'pet',
  tesla: 'shooter', twin: 'fun', hairbrush: 'melee', carpet: 'area', bugs: 'pet',
  venom: 'area', parasite: 'pet', redtape: 'fun', grubby: 'melee', whoop: 'shooter',
  wake: 'area', cradlecap: 'shooter', butterknife: 'melee', lard: 'fun', lice: 'pet',
  seeker: 'shooter', duedate: 'fun', papercut: 'melee', blister: 'area', leeches: 'pet',
  void: 'area', orbit: 'pet', friend: 'pet', peekaboo: 'fun', toothfairy: 'fun', spiritfingers: 'melee',
  siphon: 'shooter', bubble: 'fun', waters: 'melee', bathbomb: 'area', seamonkeys: 'pet',
};
if (typeof MULTI_KINDS !== 'undefined') MULTI_KINDS.push('critter'); // (+projectile power-ups add pets)
if (typeof REACH_FREE !== 'undefined') REACH_FREE.add('critter'); // (a pet's range is its leash)

Object.assign(SIGS, {
  xbeads: { name: 'More Beads', desc: '+6 beads in every shake.' },
  xteething: { name: 'Teething', desc: 'Beads hit 35% harder.' },
  xmaraca: { name: 'Maracas', desc: 'Mastery. Every shake is a big one.' },
  xjingle: { name: 'Jingle Jangle', desc: 'Mastery. Beads shove enemies away hard.' },
  xbrood: { name: 'Brood', desc: '+1 swimmer.' },
  xheadbutt: { name: 'Headbutt', desc: 'Swimmers hit 40% harder and shove further.' },
  xrace: { name: 'The Race', desc: 'Mastery. Swimmers are 60% faster and bite twice as often.' },
  xmob: { name: 'Mob', desc: 'Mastery. +3 swimmers, each 25% weaker.' },
  xonetwo: { name: 'One-Two', desc: '+1 punch every time.' },
  xknuckle: { name: 'Knuckle Sandwich', desc: 'Punches hit 35% harder.' },
  xsucker: { name: 'Sucker Punch', desc: 'Mastery. Punches hit Melting enemies twice as hard.' },
  xwindmill: { name: 'Windmill', desc: 'Mastery. Punches come twice as fast, each 30% weaker.' },
  xprojectile: { name: 'Projectile Vomit', desc: 'It flies twice as fast and hits 30% harder.' },
  xcarrots: { name: 'Diced Carrots', desc: 'Every splat also flings 6 chunks out in a ring.' },
  xtechnicolour: { name: 'Technicolour Yawn', desc: 'Mastery. Every throw lands as three splats in a line.' },
  xsecondwave: { name: 'Second Wave', desc: 'Mastery. It comes back up: a second burst on the same spot a moment later, at 60%.' },
  xpeptic: { name: 'Peptic', desc: '+1 moon.' },
  xwideorbit: { name: 'Wide Orbit', desc: 'Moons circle 30% further out and are 20% bigger.' },
  xperforate: { name: 'Perforated', desc: 'Mastery. Moons hit 60% harder.' },
  xeclipse: { name: 'Eclipse', desc: 'Mastery. +2 moons, each 25% weaker, and they stay out longer.' },
  xblessyou: { name: 'Bless You', desc: 'Every other sneeze is a big one.' },
  xhayfever: { name: 'Hay Fever', desc: 'Sneezes reach 30% further.' },
  xsnotrocket: { name: 'Snot Rocket', desc: 'Mastery. Big sneezes glue everything they hit in place for a second.' },
  xatishoo: { name: 'A-tishoo', desc: 'Mastery. Big sneezes hit twice as hard and blow things twice as far.' },
  xpickup: { name: 'Sticky', desc: 'Small enemies it rolls over are stuck fast for half a second.' },
  xdoubleroll: { name: 'Double Roll', desc: '+1 bogey every throw.' },
  xkatamari: { name: 'Snowball', desc: 'Mastery. It grows twice as fast and can get twice as big.' },
  xsplat: { name: 'Splat', desc: 'Mastery. At the end of its roll it bursts, hitting everything near it for three times its grown damage.' },
  xdrippy: { name: 'Drippy', desc: 'The trail lasts 50% longer.' },
  xsniffles: { name: 'The Sniffles', desc: 'The trail is 40% wider.' },
  xgluetrail: { name: 'Glue Trail', desc: 'Mastery. Anything in the trail is glued in place, but the trail does 30% less damage.' },
  xcoldseason: { name: 'Cold Season', desc: 'Mastery. The trail does twice the damage.' },
  xgoblin: { name: 'Another Goblin', desc: '+1 goblin.' },
  xpicky: { name: 'Picky', desc: 'Goblins hit 30% harder.' },
  xboogeyman: { name: 'Bogeyman', desc: 'Mastery. +2 goblins.' },
  xglueflick: { name: 'Glue Flick', desc: 'Mastery. Every flick glues its target in place for a moment.' },
  xbristles: { name: 'Bristles', desc: 'Swings reach 30% further.' },
  xbackcomb: { name: 'Backcomb', desc: '+1 swing, behind you.' },
  xstaticdis: { name: 'Built-up Charge', desc: 'Mastery. Every other swing lets the static go.' },
  xbeehive: { name: 'Beehive', desc: 'Mastery. The static jumps to 4 more enemies.' },
  xsocks: { name: 'Fluffy Socks', desc: '+6 sparks in every ring.' },
  xnylon: { name: 'Nylon Onesie', desc: 'Sparks go through 2 more enemies.' },
  xdoubleshuffle: { name: 'Double Shuffle', desc: 'Mastery. Every ring goes off twice.' },
  xdoorknob: { name: 'Doorknob', desc: 'Mastery. Every spark that hits jumps on to one more enemy.' },
  xglow: { name: 'Glow', desc: '+1 bug.' },
  xbuzz: { name: 'Buzz', desc: 'Bugs hit 30% harder.' },
  xswarmbugs: { name: 'Swarm', desc: 'Mastery. +3 bugs.' },
  xsuperconductor: { name: 'Superconductor', desc: 'Mastery. Every zap jumps 3 more times.' },
  xnailbiter: { name: 'Nail Biter', desc: 'Pokes hit 35% harder.' },
  xpicknose: { name: 'Pick and Flick', desc: '+1 poke every time.' },
  xdoubledipping: { name: 'Double Dipping', desc: 'Mastery. Germs spread twice as far and twice as hard.' },
  xunwashed: { name: 'Unwashed', desc: 'Mastery. Pokes come twice as fast, each 30% weaker.' },
  xhacking: { name: 'Hacking', desc: '+1 cough in every fit.' },
  xphlegmy: { name: 'Phlegmy', desc: 'Puffs are 30% bigger and hit 30% harder.' },
  xcroup: { name: 'Croup', desc: 'Mastery. Puffs drift half as fast, so they hang about twice as long.' },
  xchestinfection: { name: 'Chest Infection', desc: 'Mastery. +3 puffs in every cough.' },
  xdandruff: { name: 'Dandruff', desc: '+3 flakes every burst.' },
  xgreasy: { name: 'Greasy', desc: 'Flakes hit 30% harder.' },
  xscalp: { name: 'Itchy Scalp', desc: 'Mastery. Flakes bounce on to one more enemy.' },
  xcombover: { name: 'Comb-over', desc: 'Mastery. Every burst also fires behind you, at full strength.' },
  xspreadit: { name: 'Spread It Thick', desc: '+1 slash every time.' },
  xsalted: { name: 'Salted', desc: 'Slashes hit 35% harder.' },
  xmeltdown: { name: 'Melted', desc: 'Mastery. Smears are twice as big and last twice as long.' },
  xgreasedlightning: { name: 'Greased Lightning', desc: 'Mastery. Slashes reach 50% further.' },
  xdripping: { name: 'Dripping', desc: '+1 dollop every throw.' },
  xspare: { name: 'Picking Up the Spare', desc: 'Things bowled over take 50% more damage.' },
  xstrike: { name: 'Perfect Game', desc: 'Mastery. Everything flies twice as hard, so it bowls over twice as many.' },
  xgreasefire: { name: 'Grease Fire', desc: 'Mastery. Slicks go up in an Acid burst when they end.' },
  xnits: { name: 'Nits', desc: '+2 lice.' },
  xitchy: { name: 'Itchy', desc: 'Lice bite 30% harder.' },
  xinfest: { name: 'Infestation', desc: 'Mastery. +4 lice.' },
  xnitcomb: { name: 'Nit Comb', desc: 'Mastery. Every hop leaves a little oily slick.' },
  xorigami: { name: 'Origami', desc: '+1 cut every slash.' },
  xsharpedge: { name: 'Sharp Edge', desc: 'Cuts hit 35% harder.' },
  xthousand: { name: 'Death by a Thousand', desc: 'Mastery. Slashes come twice as fast, each 35% weaker.' },
  xpapertrail: { name: 'Paper Trail', desc: 'Mastery. Cuts reach 50% further.' },
  xpopit: { name: 'Pop It', desc: '+1 blister every throw.' },
  xbigblister: { name: 'Big Blister', desc: 'Bursts and puddles are 35% bigger.' },
  xbloodbath: { name: 'Bloodbath', desc: 'Mastery. Puddles last twice as long.' },
  xweeping: { name: 'Weeping', desc: 'Mastery. Every burst flings 6 drops of blood all around.' },
  xleech: { name: 'Another Leech', desc: '+1 leech.' },
  xbloodsucker: { name: 'Bloodsucker', desc: 'Leeches suck 30% harder.' },
  xfatleech: { name: 'Fat Leech', desc: 'Mastery. Leeches heal you three times as much.' },
  xjumbo: { name: 'Jumbo Pack', desc: 'Mastery. +2 leeches.' },
  xjazzhands: { name: 'Jazz Hands', desc: 'Swipes reach 30% further.' },
  xhaunt: { name: 'Haunting', desc: 'Swipes hit 30% harder.' },
  xpoltergeist: { name: 'Poltergeist', desc: 'Mastery. Every attack also slaps a random enemy nearby for half damage.' },
  xcoldtouch: { name: 'Cold Touch', desc: 'Mastery. Attacks come 40% faster.' },
  xcontractions: { name: 'Contractions', desc: 'Every third gush is twice as big and twice as hard.' },
  xgushy: { name: 'Gushy', desc: 'Gushes reach 30% further.' },
  xtsunami: { name: 'Tsunami', desc: 'Mastery. Every gush also sends a ring of 12 droplets flying.' },
  xwaterbirth: { name: 'Water Birth', desc: 'Mastery. Every gush heals you 1% of your max HP for each enemy it hits (up to 6%).' },
  xlavender: { name: 'Lavender', desc: 'Bursts and puddles are 35% bigger.' },
  xbubbly: { name: 'Bubbly', desc: '+1 bomb every throw.' },
  xjacuzzi: { name: 'Jacuzzi', desc: 'Mastery. Puddles suck enemies into the middle.' },
  xtidal: { name: 'Tidal', desc: 'Mastery. Bursts hit 50% harder and wash enemies away.' },
  xmonkey: { name: 'Monkey Business', desc: '+1 sea monkey.' },
  xjustadd: { name: 'Just Add Water', desc: 'Sea monkeys bite 30% harder.' },
  xcastle: { name: 'Sandcastle', desc: 'Mastery. Splashes are twice as big.' },
  xbarrel: { name: 'Barrel of Monkeys', desc: 'Mastery. +3 sea monkeys.' },
});
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, {
  rattle: 'nova', swimmers: 'seeker', gutpunch: 'hammer', upchuck: 'flask', ulcer: 'orbit', achoo: 'spray', roller: 'droplet',
  runny: 'wake', goblins: 'drone', hairbrush: 'storm', carpet: 'bolt', bugs: 'hive', grubby: 'virus', whoop: 'cloud',
  cradlecap: 'shotgun', butterknife: 'scissors', lard: 'mortar', lice: 'bacteria', papercut: 'whip', blister: 'bubble',
  leeches: 'syringe', spiritfingers: 'ghost', waters: 'nova', bathbomb: 'bubble', seamonkeys: 'footprints',
});
// The starting sequences pick them up in their weapon pools.
for (const [seq, ids] of Object.entries({
  vanguard: ['swimmers', 'rattle', 'spiritfingers'], bruiser: ['gutpunch', 'waters', 'butterknife'], nerd: ['hairbrush', 'carpet', 'bugs'],
  eggseeker: ['roller', 'goblins', 'blister'], stealth: ['runny', 'papercut', 'lice'], pusher: ['leeches', 'whoop', 'bathbomb', 'seamonkeys'],
  acid: ['upchuck', 'ulcer', 'grubby'], splicer: ['achoo', 'cradlecap', 'lard'],
})) if (PROFILES[seq]) for (const id of ids) if (!PROFILES[seq].weapons.includes(id)) PROFILES[seq].weapons.push(id);

const glue = (e, t) => { if (!e.boss && !e.rival && !e.egg && !e.dead) e.frozen = Math.max(e.frozen || 0, t); };
const armSrc = (src, o) => Object.assign({}, src, o);

// ---------------------------------------------------------------- stats (from applySigStats)
function armSigStats(w, s) {
  if (!w.def.armoury) return;
  if (w.def.pen) { penSigStats(w, s); return; } // (playpen.js)
  const has = id => hasSig(w, id);
  // more of it
  for (const id of ['xonetwo', 'xpicknose', 'xspreadit', 'xorigami', 'xdoubleroll', 'xgoblin', 'xbackcomb', 'xbrood', 'xglow', 'xleech', 'xmonkey',
    'xdripping', 'xpopit', 'xbubbly', 'xpeptic']) if (has(id)) s.count += 1;
  if (has('xnits') || has('xboogeyman') || has('xjumbo')) s.count += 2;
  if (has('xswarmbugs') || has('xbarrel') || has('xchestinfection')) s.count += 3;
  if (has('xinfest')) s.count += 4;
  if (has('xbeads') || has('xsocks')) s.count += 6;
  if (has('xdandruff')) s.count += 3;
  if (has('xmob')) { s.count += 3; s.dmg *= 0.75; }
  if (has('xeclipse')) { s.count += 2; s.dmg *= 0.75; s.dur *= 1.4; }
  // harder
  for (const [id, k] of [['xteething', 1.35], ['xheadbutt', 1.4], ['xknuckle', 1.35], ['xpicky', 1.3], ['xbuzz', 1.3], ['xnailbiter', 1.35], ['xgreasy', 1.3],
    ['xsalted', 1.35], ['xitchy', 1.3], ['xsharpedge', 1.35], ['xbloodsucker', 1.3], ['xhaunt', 1.3], ['xjustadd', 1.3], ['xperforate', 1.6], ['xtidal', 1.5]]) if (has(id)) s.dmg *= k;
  // faster
  if (has('xwindmill') || has('xunwashed')) { s.cd *= 0.5; s.dmg *= 0.7; }
  if (has('xthousand')) { s.cd *= 0.5; s.dmg *= 0.65; }
  if (has('xrace')) { s.cd *= 0.5; s.speed *= 1.6; }
  if (has('xcoldtouch')) s.cd /= 1.4;
  // further and bigger (melee reach comes from area)
  if (has('xhayfever') || has('xbristles') || has('xjazzhands')) s.area *= 1.3;
  if (has('xgreasedlightning') || has('xpapertrail')) s.area *= 1.5;
  if (has('xgushy')) s.area *= 1.3;
  if (has('xlavender') || has('xbigblister')) s.area *= 1.35;
  if (has('xcastle')) s.area *= 2;
  if (has('xwideorbit')) { s.radius *= 1.3; s.size *= 1.2; }
  if (has('xdrippy')) s.dur *= 1.5;
  if (has('xsniffles')) s.area *= 1.4;
  if (has('xbloodbath')) s.dur *= 2;
  // other
  if (has('xheadbutt')) s.knock = 1;
  if (has('xjingle')) s.knock = (s.knock || 0) + 160;
  if (has('xprojectile')) { s.flight *= 0.5; s.dmg *= 1.3; }
  if (has('xgluetrail')) { s.freezeHit = 1; s.dmg *= 0.7; }
  if (has('xcoldseason')) s.dmg *= 2;
  if (has('xglueflick')) s.freezeHit = 1;
  if (has('xnylon')) s.pierce = (s.pierce || 0) + 2;
  if (has('xdoorknob')) s.chainHit = Math.max(s.chainHit || 0, 2);
  if (has('xsuperconductor')) s.chain = (s.chain || 2) + 3;
  if (has('xphlegmy')) { s.size *= 1.3; s.dmg *= 1.3; }
  if (has('xcroup')) s.speed *= 0.5;
  if (has('xhacking')) s.coughs = 4;
  if (has('xscalp')) s.bounce = (s.bounce || 0) + 1;
  if (has('xcombover')) s.mirror = Math.max(s.mirror || 0, 1);
  if (has('xkatamari')) s.growK = 2;
}

// ---------------------------------------------------------------- firing (from fireWeapon; true = handled here)
function armFire(w, target, src) {
  const d = w.def;
  if (d.pen) return penFire(w, target, src); // (playpen.js)
  if (d.kind === 'critter') return true; // (pets bite on their own: armTick)
  if (!target) return false; // (trails fire without one)
  const s = w.s, p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x);
  switch (w.id) {
    case 'carpet': // Double Shuffle: the ring goes off again a moment later
      if (hasSig(w, 'xdoubleshuffle') && !w.again) after(0.25, () => { if (!G || !w.s) return; w.again = 1; try { fireWeapon(w, target); } finally { w.again = 0; } });
      return false;
    case 'rattle': {
      w.shakeN = (w.shakeN || 0) + 1;
      if (!hasSig(w, 'xmaraca') && w.shakeN % 3) return false; // an ordinary shake: the usual ring
      const sp = s.speed * 1.6, off = Math.random() * TAU;
      for (let i = 0; i < s.count; i++) { const a = off + i / s.count * TAU; spawnProj(w, p.x, p.y, a, src, { speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: s.range * 2 / sp, dmg: s.dmg * 2 }); }
      sfx('shot');
      return true;
    }
    case 'achoo': {
      w.sneezeN = (w.sneezeN || 0) + 1;
      if (w.sneezeN % (hasSig(w, 'xblessyou') ? 2 : 4)) return false; // an ordinary sneeze: a cone in front
      const k = hasSig(w, 'xatishoo') ? 2 : 1, arc = s.arc, reach = s.reach;
      s.arc = TAU; s.reach *= 1.5; w.bigNow = 1;
      try { meleeSweep(w, p.x, p.y, a0, armSrc(src, { mult: (src.mult || 1) * k })); } finally { s.arc = arc; s.reach = reach; w.bigNow = 0; }
      // (meleeSweep sets the shove from s.knock: a big sneeze blows much harder)
      forNear(p.x, p.y, reach * 1.5, e => { if (!e.boss && !e.rival && !e.egg) shove(e, p.x, p.y, 220 * k); });
      if (!w.echo) floatText(p.x, p.y - 30, 'ACHOO!', d.color, 13);
      sfx('shot');
      return true;
    }
    case 'hairbrush': // every fourth swing (Built-up Charge: every other) lets the static go
      w.brushN = (w.brushN || 0) + 1;
      if (w.brushN % (hasSig(w, 'xstaticdis') ? 2 : 4) === 0) {
        doChain(p.x, p.y, target, s.dmg * 1.5, 4 + (hasSig(w, 'xbeehive') ? 4 : 0), 150, armSrc(src, { wname: d.name + ' (static)' }));
        if (!w.echo) floatText(p.x, p.y - 30, 'ZAP', d.color, 12, 0.5);
      }
      return false;
    case 'spiritfingers': { // two swipes, one each way
      p.face = a0; w.swingN = (w.swingN || 0) + 1;
      for (const da of [-0.35, 0.35]) for (let i = 0; i < s.count; i++) meleeSweep(w, p.x, p.y, a0 + da + i / s.count * TAU, src);
      if (hasSig(w, 'xpoltergeist')) { const e = acquire('random', 420, p.x, p.y); if (e) { damageEnemy(e, s.dmg * 0.5, armSrc(src, { wname: 'Poltergeist' })); ring(e.x, e.y, e.r + 10, d.color, 0.3, 3); } }
      sfx('shot');
      return true;
    }
    case 'whoop': {
      const n = s.coughs || 3;
      for (let k = 0; k < n; k++) after(k * 0.15, () => {
        if (!G || !w.s) return;
        const q = me(), c = w.s.count, a = a0 + rand(-0.15, 0.15);
        for (let i = 0; i < c; i++) spawnProj(w, q.x, q.y, c > 1 ? a + (i / (c - 1) - 0.5) * w.s.spread : a, src);
        sfx('shot');
      });
      p.face = a0;
      return true;
    }
    case 'waters': {
      w.gushN = (w.gushN || 0) + 1;
      const k = hasSig(w, 'xcontractions') && w.gushN % 3 === 0 ? 2 : 1, r = s.area * (k > 1 ? 1.4 : 1);
      let hit = 0;
      forNear(p.x, p.y, r, e => { if (!e.dead) { damageEnemy(e, s.dmg * k, armSrc(src, { knock: s.knock * k, kx: e.x - p.x, ky: e.y - p.y })); hit++; } });
      ring(p.x, p.y, r, d.color, 0.45, 6); ring(p.x, p.y, r * 0.6, '#cfe8ff', 0.35, 3);
      fxParts('spark', p.x, p.y, d.color, 14, r * 3, 0.5, 3);
      if (hasSig(w, 'xtsunami')) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; spawnProj(w, p.x, p.y, a, src, { speed: 420, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, life: 0.7, r: 4 }); }
      if (hasSig(w, 'xwaterbirth') && hit && !w.echo) healPlayer(G.P.maxHp * Math.min(0.06, 0.01 * hit), true);
      if (k > 1) cam.shake = Math.min(8, cam.shake + 3);
      sfx('boom');
      return true;
    }
    case 'upchuck': {
      if (!hasSig(w, 'xtechnicolour')) return false;
      const dx = Math.cos(a0), dy = Math.sin(a0);
      for (let i = 0; i < s.count; i++) for (let j = -1; j <= 1; j++) {
        const tx = target.x + dx * j * s.area * 0.9 + (i ? rand(-s.spread, s.spread) : 0), ty = target.y + dy * j * s.area * 0.9 + (i ? rand(-s.spread, s.spread) : 0);
        G.proj.push({ lob: true, sx: p.x, sy: p.y, tx, ty, x: p.x, y: p.y, t: 0, flight: s.flight * rand(0.9, 1.15) + (j + 1) * 0.08, w, src, color: d.color, dead: false });
      }
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------- shots (from projHit and projEnd)
function armHit(pr, e) {
  const w = pr.w;
  if (!w || !w.def || !w.def.armoury) return;
  if (w.def.pen) { penHit(pr, e); return; } // (playpen.js)
  if (w.id === 'roller') { // it picks up what it rolls over
    if (pr.r0 == null) { pr.r0 = pr.r; pr.dmg0 = pr.dmg; }
    const g = w.s.growK || 1;
    pr.r = Math.min(pr.r0 * 3.5 * g, pr.r * (1 + 0.08 * g)); pr.dmg = Math.min(pr.dmg0 * 4 * g, pr.dmg * (1 + 0.07 * g));
    if (hasSig(w, 'xpickup') && !e.elite) glue(e, 0.5);
  }
}
function armEnd(pr) {
  const w = pr.w;
  if (w && w.def && w.def.pen) { penEnd(pr); return; } // (playpen.js)
  if (!w || w.id !== 'roller' || !hasSig(w, 'xsplat') || pr.dmg0 == null) return;
  aoe(pr.x, pr.y, pr.r * 2.5, pr.dmg * 3, armSrc(pr.src, { wname: 'Splat' }), w.def.color);
}

// ---------------------------------------------------------------- melee hits (from meleeHit)
function armMelee(w, e, dmg, src) {
  if (!w.def.armoury || e.dead) return;
  if (w.def.pen) { penMelee(w, e, dmg, src); return; } // (playpen.js)
  switch (w.id) {
    case 'achoo': if (w.bigNow && hasSig(w, 'xsnotrocket')) glue(e, 1); break;
    case 'gutpunch':
      stun(e, 0.4);
      if (hasSig(w, 'xsucker') && e.burn > 0) damageEnemy(e, dmg, armSrc(src, { noProc: true, knock: 0, wname: 'Sucker Punch' }));
      break;
    case 'grubby':
      if (sick(e) && !(w.spreadT > G.t)) { // germs spread from something already Sick
        w.spreadT = G.t + 0.15;
        const dd = hasSig(w, 'xdoubledipping') ? 2 : 1;
        forNear(e.x, e.y, 70 * dd, o => { if (o !== e && !o.dead) damageEnemy(o, dmg * 0.3 * dd, armSrc(src, { knock: 0, wname: 'Grubby Fingers (germs)' })); });
        fxParts('spark', e.x, e.y, w.def.color, 6, 120, 0.4, 2.5);
      }
      break;
    case 'butterknife':
      if (!(w.smearT > G.t) && G.zones.length < 220) {
        w.smearT = G.t + 0.3;
        const k = hasSig(w, 'xmeltdown') ? 2 : 1;
        G.zones.push({ x: e.x, y: e.y, r: 26 * k, life: 1.8 * k, max: 1.8 * k, dps: dmg * 0.5, elem: 'oxi', pull: 0, color: w.def.color, tick: 0, src });
      }
      break;
  }
}

// ---------------------------------------------------------------- lobs landing (from landLob)
function armLand(pr) {
  const w = pr.w, s = w.s, src = pr.src, z = G.zones[G.zones.length - 1];
  const pud = z && z.x === pr.tx && z.y === pr.ty ? z : null; // the puddle this lob just left
  if (w.def.pen) { penLand(pr); return; } // (playpen.js)
  switch (w.id) {
    case 'upchuck':
      if (pud) { // puddles that touch merge into one bigger, nastier one
        pud.armUp = w.uid;
        for (const o of G.zones) {
          if (o === pud || o.armUp !== w.uid || o.life <= 0 || Math.hypot(o.x - pud.x, o.y - pud.y) > o.r + pud.r * 0.8) continue;
          const ra = pud.r * pud.r, rb = o.r * o.r;
          pud.x = (pud.x * ra + o.x * rb) / (ra + rb); pud.y = (pud.y * ra + o.y * rb) / (ra + rb);
          pud.r = Math.min(170, Math.hypot(pud.r, o.r)); pud.dps = Math.min(s.dmg * 8, pud.dps + o.dps * 0.85);
          pud.life = pud.max = Math.max(pud.life, o.life) + 0.5; o.life = 0;
          pud.merged = (pud.merged || 0) + (o.merged || 0) + 1;
          if (pud.merged >= 3 && !w.echo) floatText(pud.x, pud.y - 20, 'MEGA PUDDLE', w.def.color, 12, 0.6);
        }
      }
      if (hasSig(w, 'xcarrots')) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rand(-0.2, 0.2); spawnProj(w, pr.tx, pr.ty, a, src, { noMods: true, speed: 360, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, life: 0.5, dmg: s.dmg * 0.35, r: 4, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
      if (hasSig(w, 'xsecondwave')) { const x = pr.tx, y = pr.ty; after(0.6, () => { if (G) aoe(x, y, s.area, s.dmg * 0.6, src, w.def.color); }); }
      break;
    case 'blister': {
      if (pud) pud.onEnd = q => aoe(q.x, q.y, q.r, s.dmg * 0.5, armSrc(src, { wname: 'Blood Blister (pop)' }), w.def.color);
      if (hasSig(w, 'xweeping')) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; spawnProj(w, pr.tx, pr.ty, a, src, { noMods: true, speed: 340, vx: Math.cos(a) * 340, vy: Math.sin(a) * 340, life: 0.55, dmg: s.dmg * 0.3, r: 3.5, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
      break;
    }
    case 'bathbomb':
      if (pud && hasSig(w, 'xjacuzzi')) pud.pull = 90;
      if (hasSig(w, 'xtidal')) forNear(pr.tx, pr.ty, s.area * 1.2, e => { if (!e.boss && !e.rival && !e.egg) shove(e, pr.tx, pr.ty, 240); });
      break;
    case 'lard': {
      if (pud && hasSig(w, 'xgreasefire')) pud.onEnd = q => aoe(q.x, q.y, q.r * 1.1, s.dmg * 3, armSrc(src, { elem: 'fire', wname: 'Grease Fire' }), '#c6ff3d');
      // Everything in the splash goes flying, and bowls over whatever it flies into (armTick).
      const k = hasSig(w, 'xstrike') ? 2 : 1, B = G.armBowl || (G.armBowl = []), hit = new Set();
      forNear(pr.tx, pr.ty, s.area, e => {
        if (e.boss || e.rival || e.egg || e.dead) return;
        shove(e, pr.tx, pr.ty, 300 * k); hit.add(e);
        if (B.length < 80) B.push({ e, w, until: G.t + 0.9, hit, n: { v: 0 } });
      });
      break;
    }
  }
}

// ---------------------------------------------------------------- per frame (from update): pets and bowling
function armTick(dt) {
  if (!G || !G.weapons) return;
  for (const w of G.weapons) if (w && w.def.kind === 'critter' && w.s && !penPetTick(w, dt)) petsTick(w, dt);
  penTick(dt); // (playpen.js)
  if (G.armBowl && G.armBowl.length) bowlTick();
}
function bowlTick() {
  const B = G.armBowl;
  for (let i = B.length - 1; i >= 0; i--) {
    const b = B[i], e = b.e, w = b.w;
    if (e.dead || G.t > b.until || !w.s) { B.splice(i, 1); continue; }
    const v = Math.hypot(e.kx || 0, e.ky || 0);
    if (v < 70) continue;
    const s = w.s, src = weaponSrc(w), k = hasSig(w, 'xspare') ? 1.5 : 1;
    forNear(e.x, e.y, e.r + 16, o => {
      if (o === e || o.dead || b.hit.has(o) || o.charmed) return;
      b.hit.add(o); b.n.v++;
      damageEnemy(o, s.dmg * 1.4 * k, armSrc(src, { knock: 0, wname: 'Lard Lobber (bowled over)' }));
      damageEnemy(e, s.dmg * 0.5 * k, armSrc(src, { knock: 0, noProc: true, wname: 'Lard Lobber (bowled over)' }));
      if (!o.boss && !o.rival && !o.egg) { o.kx += (e.kx || 0) * 0.8; o.ky += (e.ky || 0) * 0.8; if (B.length < 80) B.push({ e: o, w, until: G.t + 0.6, hit: b.hit, n: b.n }); }
      spawnPart(o.x, o.y, w.def.color, 4, 100, 0.3);
      if (b.n.v === 3 && !w.echo) floatText(o.x, o.y - o.r - 14, 'STRIKE!', w.def.color, 14, 0.7);
    });
  }
}

// Pets: they swim after a target near you, bite it on a cooldown, and come back to you when there is nothing to bite.
// Each kind bites its own way: ram (shoved back), zap (chain), hop (to the next enemy), latch (stays on, heals you),
// splash (a small burst).
function petsTick(w, dt) {
  const s = w.s, p = me(), P = w.pets || (w.pets = []), kind = w.def.critter;
  while (P.length < s.count) P.push({ x: p.x + rand(-20, 20), y: p.y + rand(-20, 20), vx: 0, vy: 0, cd: rand(0, 0.5), t: null, a: 0, seed: Math.random() * 10 });
  if (P.length > s.count) P.length = s.count;
  let src = null;
  P.forEach((q, i) => {
    q.cd -= dt;
    if (q.t && (q.t.dead || q.t.phased || q.t.charmed || Math.hypot(q.t.x - p.x, q.t.y - p.y) > s.range * 1.5)) q.t = null;
    if (!q.t && !(q.lookT > G.t)) {
      q.lookT = G.t + 0.25;
      const ts = acquireMany(w.dir, s.range, p.x, p.y, Math.max(1, P.length));
      q.t = ts.length ? ts[i % ts.length] : null;
    }
    let tx, ty;
    if (q.t) { tx = q.t.x; ty = q.t.y; } else { const a = G.realT * 1.2 + i / P.length * TAU; tx = p.x + Math.cos(a) * 46; ty = p.y + Math.sin(a) * 46; }
    if (kind === 'latch' && q.on && q.on === q.t) { q.x = q.t.x + Math.cos(q.oa) * q.t.r; q.y = q.t.y + Math.sin(q.oa) * q.t.r; q.vx = q.vy = 0; }
    else {
      q.on = null;
      const dx = tx - q.x, dy = ty - q.y, d = Math.hypot(dx, dy) || 1, sp = s.speed * (q.t ? 1 : Math.min(1, d / 80));
      const kf = Math.min(1, dt * 6);
      q.vx += (dx / d * sp - q.vx) * kf; q.vy += (dy / d * sp - q.vy) * kf;
      q.x += q.vx * dt; q.y += q.vy * dt;
      if (Math.abs(q.vx) + Math.abs(q.vy) > 5) q.a = Math.atan2(q.vy, q.vx);
    }
    const t = q.t;
    if (!t || q.cd > 0 || Math.hypot(t.x - q.x, t.y - q.y) > t.r + 10) return;
    q.cd = s.cd;
    src = src || armSrc(weaponSrc(w), { knock: 0 });
    switch (kind) {
      case 'ram': {
        damageEnemy(t, s.dmg, armSrc(src, { knock: s.knock ? 200 : 110, kx: t.x - q.x, ky: t.y - q.y }));
        q.vx = -q.vx * 0.9; q.vy = -q.vy * 0.9; q.x += q.vx * 0.05; q.y += q.vy * 0.05;
        break;
      }
      case 'zap':
        doChain(q.x, q.y, t, s.dmg, s.chain || 2, 130, armSrc(src));
        break;
      case 'hop': {
        damageEnemy(t, s.dmg, src);
        if (hasSig(w, 'xnitcomb') && G.zones.length < 220) G.zones.push({ x: t.x, y: t.y, r: 22, life: 1.5, max: 1.5, dps: s.dmg * 0.6, elem: 'oxi', pull: 0, color: w.def.color, tick: 0, src });
        q.t = acquire('nearest', 170, t.x, t.y, t) || t; q.vx *= 0.3; q.vy *= 0.3;
        break;
      }
      case 'latch': {
        if (q.on !== t) { q.on = t; q.oa = Math.atan2(q.y - t.y, q.x - t.x); }
        const got = damageEnemy(t, s.dmg, src) || 0;
        if (!w.echo && got > 0) { // a little of it back to you, at most 1% of your max HP a second per leech
          const k = hasSig(w, 'xfatleech') ? 3 : 1, cap = G.P.maxHp * 0.01 * s.cd * k;
          healPlayer(Math.min(cap, got * 0.04 * k), true);
        }
        break;
      }
      case 'splash': {
        const r = s.area || 40;
        forNear(t.x, t.y, r, e => { damageEnemy(e, s.dmg, src); });
        ring(t.x, t.y, r, w.def.color, 0.25, 2);
        break;
      }
    }
    spawnPart(t.x, t.y, w.def.color, 2, 70, 0.2, 2);
  });
}

// ---------------------------------------------------------------- drawing (from render, with the turrets)
// A pet is a little swimmer of its own: a soft glow, a body in its type's colour with a pale membrane, a bright
// eye and a beating tail. Leeches are longer and fatter; bugs glow brighter; lice are squat.
function armDraw() {
  if (!G || !G.weapons) return;
  penDraw(); // (playpen.js)
  for (const w of G.weapons) {
    if (!w || w.def.kind !== 'critter' || !w.pets) continue;
    const kind = w.def.critter, c = w.def.color;
    for (const q of w.pets) {
      const x = sx(q.x), y = sy(q.y), a = q.a, L = (kind === 'latch' ? 9 : kind === 'hop' ? 5 : 6.5) * S, Wd = (kind === 'latch' ? 4.5 : kind === 'hop' ? 4.5 : 4) * S;
      glow(x, y, (kind === 'zap' ? 18 : 11) * S, c, kind === 'zap' ? 0.5 + 0.2 * Math.sin(G.realT * 9 + q.seed) : 0.3);
      // tail
      if (kind !== 'hop') {
        ctx.strokeStyle = c; ctx.globalAlpha = 0.7; ctx.lineWidth = 1.4 * S; ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const d = L + k * 2.4 * S, wv = Math.sin(G.realT * 14 + q.seed - k * 0.9) * k * 0.6 * S;
          const px = x - Math.cos(a) * d - Math.sin(a) * wv, py = y - Math.sin(a) * d + Math.cos(a) * wv;
          if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, L, Wd, a, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.stroke();
      if (kind === 'hop') { ctx.strokeStyle = c; ctx.globalAlpha = 0.8; for (const sd of [-1, 1]) for (const f of [-0.6, 0, 0.6]) { const la = a + sd * (Math.PI / 2 + f); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(la) * 7 * S, y + Math.sin(la) * 7 * S); ctx.stroke(); } }
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * L * 0.45, y + Math.sin(a) * L * 0.45, 1.4 * S, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}
