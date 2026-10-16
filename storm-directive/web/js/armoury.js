'use strict';
// Spawn Prawn - the Armoury: 22 weapons that bring every damage type up to at least five (v9.22). Each one fires
// through an existing weapon kind (gun, lob, mine, orbit, wake, beam, tether, ring, melee, drones) with its own
// twist, and has its own Lv 5 and Lv 10 forks (sig ids start with 'x'). They join the eight starting sequences'
// weapon pools at the bottom of this file.
// Hooks: armFire (fireWeapon), armSigStats (applySigStats), armHit (projHit), armLand (landLob), armMine (detonateMine).

Object.assign(WEAPONS, {
  // ---- Mucus
  achoo: { name: 'Achoo Cannon', stars: [3, 2, 1, 4], play: 'A wide spray of snot droplets at close range. Every fourth one is a big sneeze: twice the droplets and a shove that clears space.', icon: 'AC', elem: 'ice', kind: 'gun', dir: 'nearest', role: 'Sneezer', armoury: 1,
    desc: 'Covers its mouth with its elbow. Misses.',
    base: { dmg: 6, cd: 0.6, mag: 4, reload: 1.5, count: 7, spread: 0.7, speed: 480, pierce: 0, range: 250, size: 3, knock: 40 },
    lv: { 3: { count: 2 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['xblessyou', 'xhayfever'], 10: ['xsnotrocket', 'xatishoo'] } },
  hocker: { name: 'Hocker', stars: [4, 2, 3, 3], play: 'Coughs up a slow, fat glob of phlegm. When it hits, it bursts into smaller globs that fly on through the crowd.', icon: 'HK', elem: 'ice', kind: 'gun', dir: 'nearest', role: 'Splitter', armoury: 1,
    desc: 'Hawked up from somewhere deep. Somewhere very deep.',
    base: { dmg: 22, cd: 1.0, mag: 3, reload: 1.6, count: 1, spread: 0.05, speed: 360, pierce: 0, range: 420, size: 8, splitHit: 3 },
    lv: { 3: { dmg: 0.25 }, 6: { splitHit: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['xgreenie', 'xclearthroat'], 10: ['xlunger', 'xgobstopper'] } },
  runny: { name: 'Runny Nose', stars: [2, 5, 1, 4], play: 'No aiming: you drip a trail of snot wherever you swim. Anything that wades through it gets slower and slower.', icon: 'RN', elem: 'ice', kind: 'wake', dir: 'nearest', noTarget: 1, role: 'Slime Trail', armoury: 1,
    desc: 'It just keeps coming. Nobody has a tissue.',
    base: { dmg: 14, dur: 2.6, area: 24, range: 0 },
    lv: { 3: { area: 0.3 }, 6: { dur: 0.5 }, 9: { dmg: 0.5 } }, sig: { 5: ['xdrippy', 'xsniffles'], 10: ['xgluetrail', 'xcoldseason'] } },
  bogey: { name: 'Bogey Bomb', stars: [2, 2, 3, 4], play: 'Lobs a bogey that splats into a sticky puddle. Enemies wading through it get Snotty and slow right down.', icon: 'BB', elem: 'ice', kind: 'lob', dir: 'cluster', role: 'Glue Trap', armoury: 1,
    desc: 'Rolled for a long time. Flicked with love.',
    base: { dmg: 9, cd: 1.0, mag: 3, reload: 1.8, count: 1, spread: 40, range: 380, area: 64, dur: 3.5, flight: 0.6 },
    lv: { 3: { dur: 0.4 }, 6: { count: 1 }, 9: { area: 0.3 } }, sig: { 5: ['xcrusty', 'xdoubledip'], 10: ['xflypaper', 'xrollup'] } },
  // ---- Acid
  bile: { name: 'Bile Duct', stars: [3, 3, 3, 3], play: 'A steady beam of bile that locks on and sweeps after its target, melting everything along the line.', icon: 'BD', elem: 'fire', kind: 'beam', dir: 'nearest', role: 'Beam', armoury: 1,
    desc: 'Straight from the gall bladder. Tastes like it, too.',
    base: { dmg: 40, cd: 2.2, mag: 1, reload: 0.1, count: 1, dur: 1.6, range: 300, size: 5 },
    lv: { 3: { dur: 0.3 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xgallstone', 'xlongduct'], 10: ['xbilious', 'xliverspill'] } },
  upchuck: { name: 'Upchuck', stars: [4, 2, 3, 4], play: 'Lobs a mouthful of sick that bursts on landing and leaves a burning puddle.', icon: 'UC', elem: 'fire', kind: 'lob', dir: 'cluster', role: 'Grenadier', armoury: 1,
    desc: 'Lunch, the sequel. Nobody asked for a sequel.',
    base: { dmg: 26, cd: 1.3, mag: 3, reload: 2.0, count: 1, spread: 50, range: 400, area: 72, explode: 1, dur: 1.5, flight: 0.7 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xprojectile', 'xcarrots'], 10: ['xtechnicolour', 'xsecondwave'] } },
  ulcer: { name: 'Ulcer Moons', stars: [3, 4, 1, 3], play: 'Little moons of stomach acid circle you and melt whatever comes close.', icon: 'UM', elem: 'fire', kind: 'orbit', dir: 'nearest', role: 'Bodyguard', armoury: 1,
    desc: 'Caused by stress. Causes more stress.',
    base: { dmg: 22, count: 2, dur: 4, reload: 2, radius: 64, spin: 3, size: 9, range: 100 },
    lv: { 3: { count: 1 }, 6: { area: 0.3 }, 9: { dmg: 0.4 } }, sig: { 5: ['xpeptic', 'xwideorbit'], 10: ['xperforate', 'xeclipse'] } },
  // ---- Blood
  nosebleed: { name: 'Nosebleed', stars: [2, 4, 3, 3], play: 'Quick needles of blood that bounce from enemy to enemy, leaving each one Bleeding.', icon: 'NB', elem: 'arcane', kind: 'gun', dir: 'nearest', style: 'needle', role: 'Ricochet', armoury: 1,
    desc: 'Tilt your head back. No, forward. Nobody knows.',
    base: { dmg: 7, cd: 0.32, mag: 10, reload: 1.3, count: 1, spread: 0.12, speed: 600, pierce: 0, range: 420, size: 3, bounce: 2 },
    lv: { 3: { bounce: 1 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['xpickit', 'xgush'], 10: ['xhaemorrhage', 'xclot'] } },
  heelprick: { name: 'Heel Prick', stars: [5, 1, 5, 2], play: 'A slow, very hard shot that goes straight through a line of enemies. Aims for the toughest one in range.', icon: 'HP', elem: 'arcane', kind: 'gun', dir: 'highhp', style: 'rail', role: 'Sniper', armoury: 1,
    desc: 'The first test of your life. You cried then, too.',
    base: { dmg: 70, cd: 1.6, mag: 3, reload: 2.2, count: 1, spread: 0.01, speed: 1300, pierce: 6, range: 620, size: 3 },
    lv: { 3: { dmg: 0.25 }, 6: { pierce: 3 }, 9: { dmg: 0.4 } }, sig: { 5: ['xbloodtest', 'xsteadyhand'], 10: ['xfullpanel', 'xapgar'] } },
  papercut: { name: 'Paper Cut', stars: [2, 5, 2, 3], play: 'Fast, thin slashes in a line in front of you. Tiny cuts, lots of them, and they all bleed.', icon: 'PC', elem: 'arcane', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Slasher', armoury: 1,
    desc: 'The smallest wound. The biggest fuss.',
    base: { dmg: 12, cd: 0.26, mag: 8, reload: 0.9, count: 1, range: 160, area: 1, width: 8, spread: 0.4, knock: 10 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { area: 0.25 } }, sig: { 5: ['xorigami', 'xsharpedge'], 10: ['xthousand', 'xpapertrail'] } },
  // ---- Static
  hairraiser: { name: 'Hair Raiser', stars: [2, 2, 3, 4], play: 'Fires slow, crackling balls of static that drift through the crowd, zapping everything near them as they go.', icon: 'HR', elem: 'shock', kind: 'gun', dir: 'cluster', role: 'Pulser', armoury: 1,
    desc: 'Rubbed on a balloon until it hums.',
    base: { dmg: 10, cd: 1.1, mag: 3, reload: 1.8, count: 1, spread: 0.1, speed: 140, pierce: 99, range: 380, size: 9, pulse: 1.0, pulseRate: 0.4 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['xfrizz', 'xbedhead'], 10: ['xafro', 'xvandegraaff'] } },
  carpet: { name: 'Carpet Shuffle', stars: [2, 3, 2, 5], play: 'Shuffle, shuffle, ZAP: a ring of sparks bursts out all around you.', icon: 'CS', elem: 'shock', kind: 'ring', dir: 'nearest', role: 'Ring', armoury: 1,
    desc: 'Socks on carpet. The oldest weapon there is.',
    base: { dmg: 14, cd: 1.1, mag: 3, reload: 1.6, count: 10, speed: 300, pierce: 1, range: 220, size: 3.5 },
    lv: { 3: { count: 4 }, 6: { dmg: 0.3 }, 9: { pierce: 2 } }, sig: { 5: ['xsocks', 'xnylon'], 10: ['xdoubleshuffle', 'xdoorknob'] } },
  balloon: { name: 'Balloon Rub', stars: [3, 2, 3, 4], play: 'Charges up two enemies so they cling together: they get dragged into each other and SLAM, hard.', icon: 'BR', elem: 'shock', kind: 'tether', dir: 'cluster', role: 'Tether', armoury: 1,
    desc: 'Rub it on your head, stick it to the wall. Or to a germ.',
    base: { dmg: 10, cd: 1.5, mag: 3, reload: 2.0, count: 1, range: 380, jump: 160, dur: 3, pull: 70 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['xtwoballoons', 'xrubharder'], 10: ['xpop', 'xlonglasting'] } },
  // ---- Water
  squirt: { name: 'Water Pistol', stars: [2, 5, 3, 2], play: 'A fast stream of water that shoves whatever it soaks.', icon: 'WP', elem: 'salt', kind: 'gun', dir: 'nearest', role: 'Hose', armoury: 1,
    desc: 'Pump action. Bath-time rules apply.',
    base: { dmg: 5, cd: 0.1, mag: 24, reload: 1.4, count: 1, spread: 0.08, speed: 620, pierce: 0, range: 380, size: 3, knock: 25 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['xsupersoaker', 'xdoublesquirt'], 10: ['xfirehose', 'xpressure'] } },
  bathbomb: { name: 'Bath Bomb', stars: [4, 2, 3, 4], play: 'Lobs a fizzing bath bomb that bursts in a splash and leaves a soapy puddle.', icon: 'BA', elem: 'salt', kind: 'lob', dir: 'cluster', role: 'Splash', armoury: 1,
    desc: 'Smells like lavender. Hits like a brick.',
    base: { dmg: 22, cd: 1.4, mag: 3, reload: 2.0, count: 1, spread: 40, range: 380, area: 80, explode: 1, dur: 2, flight: 0.65 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xlavender', 'xbubbly'], 10: ['xjacuzzi', 'xtidal'] } },
  waters: { name: 'Waters Breaking', stars: [3, 2, 1, 5], play: 'A gush of water bursts out all around you and washes everything nearby away.', icon: 'WB', elem: 'salt', kind: 'gun', dir: 'nearest', role: 'Pusher', armoury: 1,
    desc: 'It is happening. It is happening right now.',
    base: { dmg: 26, cd: 1.6, mag: 3, reload: 1.4, count: 1, range: 160, area: 120, knock: 260 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { area: 0.2 } }, sig: { 5: ['xcontractions', 'xgushy'], 10: ['xtsunami', 'xwaterbirth'] } },
  // ---- Oil
  cradlecap: { name: 'Cradle Cap', stars: [4, 2, 1, 3], play: 'A close-range burst of greasy scalp flakes that cut through the front row.', icon: 'CC', elem: 'oxi', kind: 'gun', dir: 'nearest', style: 'shard', role: 'Brawler', armoury: 1,
    desc: 'Flaky, greasy and stuck to the top of your head.',
    base: { dmg: 7, cd: 0.7, mag: 4, reload: 1.6, count: 6, spread: 0.6, speed: 500, pierce: 1, range: 260, size: 3 },
    lv: { 3: { count: 2 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['xdandruff', 'xgreasy'], 10: ['xscalp', 'xcombover'] } },
  lard: { name: 'Lard Lobber', stars: [2, 2, 3, 4], play: 'Lobs dollops of lard that melt into oily slicks. Lubricated enemies slide much further and react harder.', icon: 'LL', elem: 'oxi', kind: 'lob', dir: 'cluster', role: 'Slicker', armoury: 1,
    desc: 'Straight from the chip shop fryer. Still warm.',
    base: { dmg: 14, cd: 1.0, mag: 3, reload: 1.8, count: 1, spread: 40, range: 380, area: 66, dur: 4, flight: 0.6 },
    lv: { 3: { dur: 0.4 }, 6: { count: 1 }, 9: { area: 0.3 } }, sig: { 5: ['xdripping', 'xdeepfat'], 10: ['xgreasefire', 'xbutterball'] } },
  pimple: { name: 'Pimple Popper', stars: [4, 2, 2, 4], play: 'Leaves greasy pimples behind you. Anything that comes near makes them pop.', icon: 'PP', elem: 'oxi', kind: 'mine', dir: 'nearest', role: 'Trapper', armoury: 1,
    desc: 'Do not squeeze. Fine, squeeze.',
    base: { dmg: 26, cd: 0.8, mag: 4, reload: 2.4, count: 1, explode: 60, life: 12, range: 600 },
    lv: { 3: { count: 1 }, 6: { area: 0.3 }, 9: { dmg: 0.5 } }, sig: { 5: ['xwhitehead', 'xblackhead'], 10: ['xsqueeze', 'xbreakout'] } },
  butter: { name: 'Butter Fingers', stars: [3, 2, 3, 3], play: 'Throws a spinning pat of butter that flies out and slides back, greasing everything on the way.', icon: 'BF', elem: 'oxi', kind: 'gun', dir: 'furthest', style: 'disc', role: 'Boomerang', armoury: 1,
    desc: 'It slipped. Twice.',
    base: { dmg: 17, cd: 0.9, mag: 2, reload: 1.3, count: 1, spread: 0.3, speed: 420, pierce: 99, range: 300, size: 8, boomerang: 1 },
    lv: { 3: { dmg: 0.2 }, 6: { count: 1 }, 9: { dmg: 0.3 } }, sig: { 5: ['xtwopats', 'xsalted'], 10: ['xmeltdown', 'xgreasedlightning'] } },
  // ---- Cooties
  germs: { name: 'Playground Germs', stars: [2, 3, 3, 3], play: 'Little germs circle you and pick their own targets, spreading the Sick to anything they hit.', icon: 'PG', elem: 'poison', kind: 'gun', drones: 1, dir: 'nearest', role: 'Drones', armoury: 1,
    desc: 'Caught from the climbing frame. Shared with everyone.',
    base: { dmg: 7, cd: 0.45, mag: 8, reload: 1.6, count: 2, spread: 0.1, speed: 520, pierce: 0, range: 380, size: 3 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['xtag', 'xsnotty'], 10: ['xoutbreak', 'xcootieshot'] } },
  whoop: { name: 'Whooping Cough', stars: [2, 2, 2, 5], play: 'A coughing fit: three quick coughs, each a fan of slow, germy puffs that hang in the air and make the front of the crowd Sick.', icon: 'WC', elem: 'poison', kind: 'gun', dir: 'nearest', role: 'Cloud', armoury: 1,
    desc: 'Did not cover its mouth. Never covers its mouth.',
    base: { dmg: 6, cd: 1.2, mag: 3, reload: 1.6, count: 5, spread: 0.9, speed: 160, pierce: 99, range: 170, size: 9 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['xhacking', 'xphlegmy'], 10: ['xcroup', 'xchestinfection'] } },
});
// Each one wears its damage type's colour.
for (const id in WEAPONS) if (WEAPONS[id].armoury && !WEAPONS[id].color) WEAPONS[id].color = ELEMENTS[WEAPONS[id].elem].color;

Object.assign(SIGS, {
  xblessyou: { name: 'Bless You', desc: 'Every other sneeze is a big one.' },
  xhayfever: { name: 'Hay Fever', desc: '+4 droplets in every sneeze, each 15% weaker.' },
  xsnotrocket: { name: 'Snot Rocket', desc: 'Mastery. A big sneeze is one huge glob that goes through everything and glues what it hits.' },
  xatishoo: { name: 'A-tishoo', desc: 'Mastery. Big sneezes go off in a full ring all around you.' },
  xgreenie: { name: 'Greenie', desc: 'Globs are 50% bigger and hit 40% harder.' },
  xclearthroat: { name: 'Clear Your Throat', desc: '+1 glob every time.' },
  xlunger: { name: 'Lunger', desc: 'Mastery. Globs burst into twice as many pieces, and the pieces hit twice as hard.' },
  xgobstopper: { name: 'Gobstopper', desc: 'Mastery. Every glob that hits glues its target in place for a second.' },
  xdrippy: { name: 'Drippy', desc: 'The trail lasts 50% longer.' },
  xsniffles: { name: 'The Sniffles', desc: 'The trail is 40% wider.' },
  xgluetrail: { name: 'Glue Trail', desc: 'Mastery. Anything in the trail is glued in place, but the trail does 30% less damage.' },
  xcoldseason: { name: 'Cold Season', desc: 'Mastery. The trail does twice the damage.' },
  xcrusty: { name: 'Crusty', desc: 'Puddles are 30% wider.' },
  xdoubledip: { name: 'Double Dip', desc: '+1 bogey every throw.' },
  xflypaper: { name: 'Flypaper', desc: 'Mastery. Puddles slowly suck enemies into the middle.' },
  xrollup: { name: 'Roll It Up', desc: 'Mastery. When a puddle dries, everything still in it is glued in place for 1.5 seconds.' },
  xgallstone: { name: 'Gallstone', desc: '+1 beam, on another target.' },
  xlongduct: { name: 'Long Duct', desc: 'The beam reaches 40% further.' },
  xbilious: { name: 'Bilious', desc: 'Mastery. The beam lasts twice as long.' },
  xliverspill: { name: 'Liver Spill', desc: 'Mastery. The beam is 50% wider and hits 60% harder.' },
  xprojectile: { name: 'Projectile Vomit', desc: 'It flies twice as fast and hits 30% harder.' },
  xcarrots: { name: 'Diced Carrots', desc: 'Every splat also flings 6 chunks out in a ring.' },
  xtechnicolour: { name: 'Technicolour Yawn', desc: 'Mastery. Every throw lands as three splats in a line.' },
  xsecondwave: { name: 'Second Wave', desc: 'Mastery. It comes back up: a second burst on the same spot a moment later, at 60%.' },
  xpeptic: { name: 'Peptic', desc: '+1 moon.' },
  xwideorbit: { name: 'Wide Orbit', desc: 'Moons circle 30% further out and are 20% bigger.' },
  xperforate: { name: 'Perforated', desc: 'Mastery. Moons hit 60% harder.' },
  xeclipse: { name: 'Eclipse', desc: 'Mastery. +2 moons, each 25% weaker, and they stay out longer.' },
  xpickit: { name: 'Pick It', desc: '+2 bounces.' },
  xgush: { name: 'Gusher', desc: '+1 needle every shot.' },
  xhaemorrhage: { name: 'Haemorrhage', desc: 'Mastery. A needle hits 25% harder every time it bounces.' },
  xclot: { name: 'Clot', desc: 'Mastery. Needles hit Bleeding enemies 50% harder.' },
  xbloodtest: { name: 'Blood Test', desc: '+1 shot, at a slight angle.' },
  xsteadyhand: { name: 'Steady Hand', desc: 'Shots hit 50% harder but come 25% slower.' },
  xfullpanel: { name: 'Full Panel', desc: 'Mastery. Shots go through everything and reach 30% further.' },
  xapgar: { name: 'Apgar Score', desc: 'Mastery. Shots do double damage to enemies above 80% health.' },
  xorigami: { name: 'Origami', desc: '+1 cut every slash.' },
  xsharpedge: { name: 'Sharp Edge', desc: 'Cuts hit 35% harder.' },
  xthousand: { name: 'Death by a Thousand', desc: 'Mastery. Slashes come twice as fast, each 35% weaker.' },
  xpapertrail: { name: 'Paper Trail', desc: 'Mastery. Cuts reach 50% further.' },
  xfrizz: { name: 'Frizz', desc: 'Balls are 40% bigger and zap 30% harder.' },
  xbedhead: { name: 'Bed Head', desc: '+1 ball every shot.' },
  xafro: { name: 'Big Hair', desc: 'Mastery. Balls drift half as fast, so they hang about twice as long.' },
  xvandegraaff: { name: 'Van de Graaff', desc: 'Mastery. Balls zap twice as often.' },
  xsocks: { name: 'Fluffy Socks', desc: '+6 sparks in every ring.' },
  xnylon: { name: 'Nylon Onesie', desc: 'Sparks go through 2 more enemies.' },
  xdoubleshuffle: { name: 'Double Shuffle', desc: 'Mastery. Every ring goes off twice.' },
  xdoorknob: { name: 'Doorknob', desc: 'Mastery. Every spark that hits jumps on to one more enemy.' },
  xtwoballoons: { name: 'Two Balloons', desc: '+1 pair stuck together every time.' },
  xrubharder: { name: 'Rub Harder', desc: 'Pairs are dragged together 60% harder.' },
  xpop: { name: 'POP', desc: 'Mastery. Slams hit twice as hard.' },
  xlonglasting: { name: 'Long Lasting', desc: 'Mastery. The charge lasts twice as long and reaches 50% further for a partner.' },
  xsupersoaker: { name: 'Super Soaker', desc: '+60% tank size and 30% more reach.' },
  xdoublesquirt: { name: 'Double Squirt', desc: '+1 stream.' },
  xfirehose: { name: 'Fire Hose', desc: 'Mastery. Never needs refilling, but each squirt is 20% weaker.' },
  xpressure: { name: 'High Pressure', desc: 'Mastery. Squirts go through 2 enemies and shove much harder.' },
  xlavender: { name: 'Lavender', desc: 'Bursts and puddles are 35% bigger.' },
  xbubbly: { name: 'Bubbly', desc: '+1 bomb every throw.' },
  xjacuzzi: { name: 'Jacuzzi', desc: 'Mastery. Puddles suck enemies into the middle.' },
  xtidal: { name: 'Tidal', desc: 'Mastery. Bursts hit 50% harder and wash enemies away.' },
  xcontractions: { name: 'Contractions', desc: 'Every third gush is twice as big and twice as hard.' },
  xgushy: { name: 'Gushy', desc: 'Gushes reach 30% further.' },
  xtsunami: { name: 'Tsunami', desc: 'Mastery. Every gush also sends a ring of 12 droplets flying.' },
  xwaterbirth: { name: 'Water Birth', desc: 'Mastery. Every gush heals you 1% of your max HP for each enemy it hits (up to 6%).' },
  xdandruff: { name: 'Dandruff', desc: '+3 flakes every burst.' },
  xgreasy: { name: 'Greasy', desc: 'Flakes hit 30% harder.' },
  xscalp: { name: 'Itchy Scalp', desc: 'Mastery. Flakes bounce on to one more enemy.' },
  xcombover: { name: 'Comb-over', desc: 'Mastery. Every burst also fires behind you, at full strength.' },
  xdripping: { name: 'Dripping', desc: '+1 dollop every throw.' },
  xdeepfat: { name: 'Deep Fat', desc: 'Slicks last 60% longer.' },
  xgreasefire: { name: 'Grease Fire', desc: 'Mastery. Slicks go up in an Acid burst when they end.' },
  xbutterball: { name: 'Butterball', desc: 'Mastery. +2 dollops every throw, each slick 25% smaller.' },
  xwhitehead: { name: 'Whitehead', desc: '+1 pimple every drop.' },
  xblackhead: { name: 'Blackhead', desc: 'Pops are 40% bigger.' },
  xsqueeze: { name: 'Big Squeeze', desc: 'Mastery. Every pop sprays 8 greasy droplets all around.' },
  xbreakout: { name: 'Breakout', desc: 'Mastery. Every pop leaves two new pimples beside it (they do not spread again).' },
  xtwopats: { name: 'Two Pats', desc: '+1 pat every throw.' },
  xsalted: { name: 'Salted', desc: 'Pats hit 35% harder.' },
  xmeltdown: { name: 'Melting', desc: 'Mastery. Pats leave little oily slicks on whatever they hit.' },
  xgreasedlightning: { name: 'Greased Lightning', desc: 'Mastery. Pats fly 60% faster and 30% further.' },
  xtag: { name: "Tag, You're It", desc: '+1 germ.' },
  xsnotty: { name: 'Snotty Sleeve', desc: 'Germs hit 30% harder.' },
  xoutbreak: { name: 'Outbreak', desc: 'Mastery. +2 germs.' },
  xcootieshot: { name: 'Cootie Shot', desc: 'Mastery. Germ shots burst into 3 more on their first hit.' },
  xhacking: { name: 'Hacking', desc: '+1 cough in every fit.' },
  xphlegmy: { name: 'Phlegmy', desc: 'Puffs are 30% bigger and hit 30% harder.' },
  xcroup: { name: 'Croup', desc: 'Mastery. Puffs drift half as fast, so they hang about twice as long.' },
  xchestinfection: { name: 'Chest Infection', desc: 'Mastery. +3 puffs in every cough.' },
});
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, {
  achoo: 'spray', hocker: 'droplet', runny: 'wake', bogey: 'mortar', bile: 'bigbeam', upchuck: 'flask', ulcer: 'orbit',
  nosebleed: 'syringe', heelprick: 'pipette', papercut: 'scissors', hairraiser: 'neuron', carpet: 'storm', balloon: 'link',
  squirt: 'pistol', bathbomb: 'bubble', waters: 'nova', cradlecap: 'shotgun', lard: 'steam', pimple: 'mine', butter: 'disc',
  germs: 'bacteria', whoop: 'cloud',
});
// The starting sequences pick them up in their weapon pools.
for (const [seq, ids] of Object.entries({
  vanguard: ['squirt', 'nosebleed', 'heelprick'], bruiser: ['waters', 'cradlecap', 'lard'], nerd: ['hairraiser', 'carpet', 'balloon'],
  eggseeker: ['hocker', 'bile', 'bogey'], stealth: ['runny', 'papercut', 'butter'], pusher: ['germs', 'whoop', 'bathbomb'],
  acid: ['upchuck', 'ulcer', 'pimple'], splicer: ['achoo'],
})) if (PROFILES[seq]) for (const id of ids) if (!PROFILES[seq].weapons.includes(id)) PROFILES[seq].weapons.push(id);

const armHas = (w, id) => w && w.def && w.def.armoury && hasSig(w, id);
const glue = (e, t) => { if (!e.boss && !e.rival && !e.egg && !e.dead) e.frozen = Math.max(e.frozen || 0, t); };

// ---------------------------------------------------------------- stats (from applySigStats)
function armSigStats(w, s) {
  if (!w.def.armoury) return;
  const has = id => hasSig(w, id);
  if (has('xhayfever')) { s.count += 4; s.dmg *= 0.85; }
  if (has('xgreenie')) { s.size *= 1.5; s.dmg *= 1.4; }
  if (has('xclearthroat')) s.count += 1;
  if (has('xlunger')) s.splitHit = (s.splitHit || 3) * 2;
  if (has('xdrippy')) s.dur *= 1.5;
  if (has('xsniffles')) s.area *= 1.4;
  if (has('xgluetrail')) { s.freezeHit = 1; s.dmg *= 0.7; }
  if (has('xcoldseason')) s.dmg *= 2;
  if (has('xcrusty') || has('xlavender')) s.area *= has('xlavender') ? 1.35 : 1.3;
  if (has('xdoubledip') || has('xbubbly') || has('xdripping')) s.count += 1;
  if (has('xbutterball')) { s.count += 2; s.area *= 0.75; }
  if (has('xgallstone')) s.count += 1;
  if (has('xlongduct')) s.range *= 1.4;
  if (has('xbilious')) s.dur *= 2;
  if (has('xliverspill')) { s.size *= 1.5; s.dmg *= 1.6; }
  if (has('xprojectile')) { s.flight *= 0.5; s.dmg *= 1.3; }
  if (has('xpeptic')) s.count += 1;
  if (has('xwideorbit')) { s.radius *= 1.3; s.size *= 1.2; }
  if (has('xperforate')) s.dmg *= 1.6;
  if (has('xeclipse')) { s.count += 2; s.dmg *= 0.75; s.dur *= 1.4; }
  if (has('xpickit')) s.bounce = (s.bounce || 0) + 2;
  if (has('xgush') || has('xbedhead') || has('xdoublesquirt') || has('xtwopats') || has('xtag')) s.count += 1;
  if (has('xbloodtest')) { s.count += 1; s.spread = Math.max(s.spread, 0.12); }
  if (has('xsteadyhand')) { s.dmg *= 1.5; s.cd *= 1.25; }
  if (has('xfullpanel')) { s.pierce = 99; s.range *= 1.3; }
  if (has('xorigami')) s.count += 1;
  if (has('xsharpedge') || has('xsalted')) s.dmg *= 1.35;
  if (has('xthousand')) { s.cd *= 0.5; s.dmg *= 0.65; }
  if (has('xpapertrail')) s.range *= 1.5;
  if (has('xfrizz')) { s.size *= 1.4; s.dmg *= 1.3; }
  if (has('xafro') || has('xcroup')) s.speed *= 0.5;
  if (has('xvandegraaff')) s.pulseRate = (s.pulseRate || 0.4) * 0.5;
  if (has('xsocks')) s.count += 6;
  if (has('xnylon')) s.pierce = (s.pierce || 0) + 2;
  if (has('xdoorknob')) s.chainHit = Math.max(s.chainHit || 0, 2);
  if (has('xtwoballoons')) s.count += 1;
  if (has('xrubharder')) s.pull *= 1.6;
  if (has('xpop')) s.dmg *= 2;
  if (has('xlonglasting')) { s.dur *= 2; s.jump *= 1.5; }
  if (has('xsupersoaker')) { s.mag = Math.round(s.mag * 1.6); s.range *= 1.3; }
  if (has('xfirehose')) { s.mag = 9999; s.reload = 0; s.dmg *= 0.8; }
  if (has('xpressure')) { s.pierce = (s.pierce || 0) + 2; s.knock = (s.knock || 0) + 90; }
  if (has('xtidal')) s.dmg *= 1.5;
  if (has('xgushy')) s.area *= 1.3;
  if (has('xdandruff')) s.count += 3;
  if (has('xgreasy') || has('xsnotty')) s.dmg *= 1.3;
  if (has('xscalp')) s.bounce = (s.bounce || 0) + 1;
  if (has('xcombover')) s.mirror = Math.max(s.mirror || 0, 1);
  if (has('xdeepfat')) s.dur *= 1.6;
  if (has('xwhitehead')) s.count += 1;
  if (has('xblackhead')) s.explode *= 1.4;
  if (has('xgreasedlightning')) { s.speed *= 1.6; s.range *= 1.3; }
  if (has('xoutbreak')) s.count += 2;
  if (has('xcootieshot')) s.splitHit = Math.max(s.splitHit || 0, 3);
  if (has('xhacking')) s.coughs = 4;
  if (has('xphlegmy')) { s.size *= 1.3; s.dmg *= 1.3; }
  if (has('xchestinfection')) s.count += 3;
}

// ---------------------------------------------------------------- firing (from fireWeapon; true = handled here)
function armFire(w, target, src) {
  if (!target) return false; // (mines and trails fire without one)
  const s = w.s, d = w.def, p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x);
  const fan = (n, spread, a, over, from) => {
    const o = from || p;
    for (let i = 0; i < n; i++) spawnProj(w, o.x, o.y, n > 1 ? a + (i / (n - 1) - 0.5) * spread + rand(-0.04, 0.04) : a, src, over);
  };
  switch (w.id) {
    case 'carpet': // Double Shuffle: the ring goes off again a moment later
      if (hasSig(w, 'xdoubleshuffle') && !w.again) after(0.25, () => { if (!G || !w.s) return; w.again = 1; try { fireWeapon(w, target); } finally { w.again = 0; } });
      return false;
    case 'achoo': {
      w.sneezeN = (w.sneezeN || 0) + 1;
      if (w.sneezeN % (hasSig(w, 'xblessyou') ? 2 : 4)) return false; // an ordinary sneeze: the usual gun
      const big = Object.assign({}, src, { knock: 160 });
      if (hasSig(w, 'xsnotrocket')) spawnProj(w, p.x, p.y, a0, big, { dmg: s.dmg * s.count * 0.9, r: s.size * 4, pierce: 99, glue: 1, life: s.range * 1.6 / s.speed });
      else if (hasSig(w, 'xatishoo')) { const n = s.count * 2; for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, i / n * TAU, big); }
      else for (let i = 0; i < s.count * 2; i++) spawnProj(w, p.x, p.y, a0 + rand(-s.spread, s.spread) * 0.6, big);
      p.face = a0; sfx('shot');
      if (!w.echo) floatText(p.x, p.y - 30, 'ACHOO!', d.color, 13);
      return true;
    }
    case 'whoop': {
      const n = s.coughs || 3;
      for (let k = 0; k < n; k++) after(k * 0.15, () => { if (!G || !w.s) return; const q = me(); fan(w.s.count, w.s.spread, a0 + rand(-0.15, 0.15), null, q); sfx('shot'); });
      p.face = a0;
      return true;
    }
    case 'waters': {
      w.gushN = (w.gushN || 0) + 1;
      const k = hasSig(w, 'xcontractions') && w.gushN % 3 === 0 ? 2 : 1, r = s.area * (k > 1 ? 1.4 : 1);
      let hit = 0;
      forNear(p.x, p.y, r, e => { if (!e.dead) { damageEnemy(e, s.dmg * k, Object.assign({}, src, { knock: s.knock * k, kx: e.x - p.x, ky: e.y - p.y })); hit++; } });
      ring(p.x, p.y, r, d.color, 0.45, 6); ring(p.x, p.y, r * 0.6, '#cfe8ff', 0.35, 3);
      fxParts('spark', p.x, p.y, d.color, 14, r * 3, 0.5, 3);
      if (hasSig(w, 'xtsunami')) for (let i = 0; i < 12; i++) spawnProj(w, p.x, p.y, i / 12 * TAU, src, { speed: 420, vx: Math.cos(i / 12 * TAU) * 420, vy: Math.sin(i / 12 * TAU) * 420, life: 0.7, r: 4 });
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

// ---------------------------------------------------------------- on hit (from projHit)
function armHit(pr, e) {
  const w = pr.w;
  if (!w || !w.def || !w.def.armoury) return;
  if (pr.glue || (w.id === 'hocker' && hasSig(w, 'xgobstopper'))) glue(e, 1);
  if (w.id === 'nosebleed') {
    if (hasSig(w, 'xclot') && bleeding(e)) damageEnemy(e, pr.dmg * 0.5, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Clot' }));
    if (hasSig(w, 'xhaemorrhage')) pr.dmg *= 1.25;
  }
  if (w.id === 'heelprick' && hasSig(w, 'xapgar') && e.hp > e.maxHp * 0.8) damageEnemy(e, pr.dmg, Object.assign({}, pr.src, { noProc: true, noCrit: true, wname: 'Apgar Score' }));
  if (w.id === 'butter' && hasSig(w, 'xmeltdown') && !(pr.slickT > G.t) && G.zones.length < 220) {
    pr.slickT = G.t + 0.25;
    G.zones.push({ x: e.x, y: e.y, r: 30, life: 2, max: 2, dps: pr.dmg * 0.5, elem: 'oxi', pull: 0, color: w.def.color, tick: 0, src: pr.src });
  }
}

// ---------------------------------------------------------------- lobs landing (from landLob)
function armLand(pr) {
  const w = pr.w, s = w.s, src = pr.src, z = G.zones[G.zones.length - 1];
  const mine = z && z.x === pr.tx && z.y === pr.ty ? z : null; // the puddle this lob just left
  switch (w.id) {
    case 'upchuck':
      if (hasSig(w, 'xcarrots')) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + rand(-0.2, 0.2); spawnProj(w, pr.tx, pr.ty, a, src, { noMods: true, speed: 360, vx: Math.cos(a) * 360, vy: Math.sin(a) * 360, life: 0.5, dmg: s.dmg * 0.35, r: 4, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
      if (hasSig(w, 'xsecondwave')) { const x = pr.tx, y = pr.ty; after(0.6, () => { if (G) aoe(x, y, s.area, s.dmg * 0.6, src, w.def.color); }); }
      break;
    case 'bogey':
      if (mine && hasSig(w, 'xflypaper')) mine.pull = 60;
      if (mine && hasSig(w, 'xrollup')) mine.onEnd = q => { forNear(q.x, q.y, q.r, e => glue(e, 1.5)); ring(q.x, q.y, q.r, w.def.color, 0.4, 3); };
      break;
    case 'bathbomb':
      if (mine && hasSig(w, 'xjacuzzi')) mine.pull = 90;
      if (hasSig(w, 'xtidal')) forNear(pr.tx, pr.ty, s.area * 1.2, e => { damageEnemy(e, s.dmg * 0.2, Object.assign({}, src, { knock: 240, kx: e.x - pr.tx, ky: e.y - pr.ty, noProc: true })); });
      break;
    case 'lard':
      if (mine && hasSig(w, 'xgreasefire')) mine.onEnd = q => aoe(q.x, q.y, q.r * 1.1, s.dmg * 3, Object.assign({}, src, { elem: 'fire', wname: 'Grease Fire' }), '#c6ff3d');
      break;
  }
}

// ---------------------------------------------------------------- mines popping (from detonateMine)
function armMine(pr) {
  const w = pr.w;
  if (!w || w.id !== 'pimple') return;
  if (hasSig(w, 'xsqueeze')) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; spawnProj(w, pr.x, pr.y, a, pr.src, { noMods: true, speed: 380, vx: Math.cos(a) * 380, vy: Math.sin(a) * 380, life: 0.6, dmg: w.s.dmg * 0.3, r: 3.5, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
  if (hasSig(w, 'xbreakout') && !pr.child) {
    for (let i = 0; i < 2; i++) { const m = mineDrop(w, pr.x + rand(-40, 40), pr.y + rand(-40, 40)); m.child = true; G.proj.push(m); }
    mineTrim();
  }
}
