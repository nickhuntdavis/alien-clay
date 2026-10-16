'use strict';
// Spawn Prawn - the Playpen: 20 more weapons (v9.23) from WEAPON_IDEAS.md, the ones that did not clash with the
// Armoury. They carry `armoury: 1` (so the Armoury's colour, play-style and test rules cover them) and `pen: 1`,
// which hands their firing, hits, landings, melee and stats to this file. New behaviours run here: the Egg White
// lane (you swim faster in it), Greased Piglets that careen about, Night Lights you plug in as you go, the
// Umbilical Cord and the Fork in the Socket (held lines drawn here).
// Hooks (all from armoury.js): penSigStats (armSigStats), penFire (armFire), penHit (armHit), penEnd (armEnd),
// penMelee (armMelee), penLand (armLand), penPetTick and penTick (armTick), penDraw (armDraw).
// Also: chem.js chemPlayerSpeed reads G.penHasteT/G.penHasteK; sigs.js applyAdapt lists hanky, wetwipe, lavalamp.

Object.assign(WEAPONS, {
  // ---- Mucus
  sticky: { name: 'Sticky Fingers', stars: [2, 3, 4, 5], play: 'Flings a stretchy party-bag hand at the fastest enemy. It slaps, sticks and reels the thing straight back to you.', icon: 'SF', elem: 'ice', kind: 'gun', dir: 'fastest', role: 'Grabber', armoury: 1, pen: 1,
    desc: 'Came free in a party bag. Has never once been clean.',
    base: { dmg: 34, cd: 0.9, mag: 3, reload: 1.4, count: 1, spread: 0.05, speed: 540, pierce: 0, range: 420, size: 5 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['pstretchy', 'pslap'], 10: ['ppartybag', 'pgooey'] } },
  eggwhite: { name: 'Egg White', stars: [2, 4, 1, 4], play: 'No aiming: you lay a lane of stretchy fertile mucus just ahead of you. You swim faster along it, and anything that wades in gets Snotty.', icon: 'EW', elem: 'ice', kind: 'critter', critter: 'lane', dir: 'nearest', noTarget: 1, role: 'Fast Lane', armoury: 1, pen: 1,
    desc: 'Nature\'s own fast lane. Smells like a leisure centre.',
    base: { dmg: 18, cd: 0.15, mag: 1, reload: 0, count: 1, range: 0, dur: 2.4, area: 26 },
    lv: { 3: { area: 0.2 }, 6: { dur: 0.4 }, 9: { dmg: 0.5 } }, sig: { 5: ['pstretch', 'pfertile'], 10: ['povulating', 'psticky'] } },
  // ---- Cooties
  hanky: { name: 'Hanky Panky', stars: [3, 3, 2, 4], play: 'Cracks a snotty hanky like a towel in the changing room. The tip stings twice as hard and spreads the germs.', icon: 'HP', elem: 'poison', kind: 'melee', melee: 'lash', dir: 'nearest', role: 'Melee', armoury: 1, pen: 1,
    desc: 'Used. Very used. Still damp.',
    base: { dmg: 18, cd: 0.45, mag: 5, reload: 1.1, count: 1, range: 180, area: 1, width: 13, spread: 0.3, knock: 50 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { area: 0.2 } }, sig: { 5: ['pwettowel', 'psnotty'], 10: ['pchanging', 'pgermflick'] } },
  wetkiss: { name: 'Wet Kiss', stars: [3, 3, 3, 4], play: 'Blows sloppy homing kisses at the weakest enemies. Some leave a lipstick print that spreads the Cooties to its mates.', icon: 'WK', elem: 'poison', kind: 'gun', dir: 'weakest', role: 'Smoocher', armoury: 1, pen: 1,
    desc: 'From your auntie. You cannot wipe it off. Nobody can.',
    base: { dmg: 12, cd: 0.6, mag: 6, reload: 1.6, count: 2, spread: 0.6, speed: 260, pierce: 0, range: 460, size: 6, homing: 5 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['psmooch', 'pauntie'], 10: ['plipstick', 'pfrench'] } },
  softplay: { name: 'Soft Play', stars: [2, 3, 3, 5], play: 'Drops a ball pit on the biggest crowd. Everything in it gets bogged down and catches whatever the last kid had, and the balls go everywhere.', icon: 'SP', elem: 'poison', kind: 'lob', dir: 'cluster', role: 'Ball Pit', armoury: 1, pen: 1,
    desc: 'The germiest place on earth. Socks must be worn.',
    base: { dmg: 7, cd: 2.4, mag: 1, reload: 2.4, count: 1, spread: 0, range: 380, area: 100, explode: 0, dur: 5, flight: 0.7 },
    lv: { 3: { area: 0.15 }, 6: { dmg: 0.3 }, 9: { dur: 0.3 } }, sig: { 5: ['pballpit', 'psocks'], 10: ['pparty', 'plostshoe'] } },
  // ---- Acid
  juicebox: { name: 'Juice Box', stars: [3, 3, 2, 4], play: 'Squeezes a stream of stomach acid through a bendy straw. When the carton is empty, it throws the carton, which bursts.', icon: 'JB', elem: 'fire', kind: 'gun', dir: 'nearest', style: 'flame', role: 'Squeeze and Throw', armoury: 1, pen: 1,
    desc: 'Apple and something. Mostly something.',
    base: { dmg: 4, cd: 0.08, mag: 24, reload: 1.8, count: 1, spread: 0.12, speed: 380, pierce: 1, range: 230, size: 3 },
    lv: { 3: { dmg: 0.25 }, 6: { mag: 0.25 }, 9: { dmg: 0.35 } }, sig: { 5: ['pbendy', 'pfamily'], 10: ['psqueeze', 'pfunsize'] } },
  lemon: { name: 'Lemon Squeezy', stars: [3, 3, 4, 3], play: 'Quick, accurate squirts of lemon juice. Right in the eye: whatever it hits stops to rub its eyes for a moment.', icon: 'LQ', elem: 'fire', kind: 'gun', dir: 'nearest', role: 'Marksman', armoury: 1, pen: 1,
    desc: 'Easy peasy. Not for them.',
    base: { dmg: 10, cd: 0.32, mag: 10, reload: 1.2, count: 1, spread: 0.04, speed: 640, pierce: 1, range: 440, size: 3.5 },
    lv: { 3: { pierce: 1 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['pzest', 'ppips'], 10: ['psourface', 'plemonade'] } },
  // ---- Blood
  cord: { name: 'Umbilical Cord', stars: [3, 4, 2, 4], play: 'A cord latches onto the toughest enemy in reach and feeds off it, healing you a little. Anything that swims across the cord gets hurt.', icon: 'UC', elem: 'arcane', kind: 'gun', dir: 'highhp', role: 'Tether', armoury: 1, pen: 1,
    desc: 'You were attached once. You can be attached again.',
    base: { dmg: 7, cd: 0.2, mag: 20, reload: 0.6, count: 1, range: 300 },
    lv: { 3: { dmg: 0.25 }, 6: { range: 0.15 }, 9: { dmg: 0.35 } }, sig: { 5: ['plongcord', 'ptwincord'], 10: ['pfeeding', 'ptiedoff'] } },
  period: { name: 'Period Drama', stars: [4, 2, 1, 4], play: 'Every few seconds, like clockwork: three waves of cramps roll out all around you, and everything they catch starts bleeding.', icon: 'PD', elem: 'arcane', kind: 'gun', dir: 'nearest', role: 'Monthly Flood', armoury: 1, pen: 1,
    desc: 'Arrives on time. Ruins everything. Leaves.',
    base: { dmg: 24, cd: 5, mag: 1, reload: 0.1, count: 1, range: 200, area: 170 },
    lv: { 3: { area: 0.15 }, 6: { dmg: 0.3 }, 9: { area: 0.15 } }, sig: { 5: ['pheavy', 'pcramps'], 10: ['pclockwork', 'phormonal'] } },
  heelprick: { name: 'Heel Prick', stars: [3, 3, 4, 3], play: 'Tiny, fast needles at the toughest enemy. Every sixth one into the same enemy finds a weak spot and hits four times as hard.', icon: 'HK', elem: 'arcane', kind: 'gun', dir: 'highhp', role: 'Needler', armoury: 1, pen: 1,
    desc: 'Just a little scratch. Everyone says that.',
    base: { dmg: 7, cd: 0.14, mag: 15, reload: 1.3, count: 1, spread: 0.06, speed: 720, pierce: 0, range: 460, size: 2.5 },
    lv: { 3: { dmg: 0.25 }, 6: { mag: 0.3 }, 9: { dmg: 0.35 } }, sig: { 5: ['ptwopricks', 'pfineneedle'], 10: ['pguthrie', 'pbutterfly'] } },
  // ---- Static
  fork: { name: 'Fork in the Socket', stars: [3, 3, 2, 5], play: 'A jittery bolt locks onto the nearest enemy and gets stronger the longer it holds on. Switch target and it starts again.', icon: 'FS', elem: 'shock', kind: 'gun', dir: 'nearest', role: 'Held Beam', armoury: 1, pen: 1,
    desc: 'You were told not to. You were told many times.',
    base: { dmg: 4, cd: 0.1, mag: 30, reload: 1.2, count: 1, range: 260 },
    lv: { 3: { dmg: 0.25 }, 6: { range: 0.15 }, 9: { dmg: 0.35 } }, sig: { 5: ['pprongs', 'plivesocket'], 10: ['pbarewire', 'pearthed'] } },
  // ---- Force
  pram: { name: 'Runaway Pram', stars: [3, 2, 3, 5], play: 'Shoves a pram off towards the furthest enemy. It scoops up everything in its path and dumps them in a pile-up at the end.', icon: 'RP', elem: 'phys', kind: 'gun', dir: 'furthest', role: 'Bowler', armoury: 1, pen: 1,
    desc: 'Somebody let go of the handle. Somebody always lets go of the handle.',
    base: { dmg: 44, cd: 2.2, mag: 2, reload: 1.6, count: 1, spread: 0, speed: 180, pierce: 99, range: 420, size: 14 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['ptwinpram', 'poffroad'], 10: ['psteps', 'pramrace'] } },
  // ---- Water
  shower: { name: 'Baby Shower', stars: [3, 2, 3, 4], play: 'Presents rain down on the biggest crowd, each one bursting in a soaking splash.', icon: 'BS', elem: 'salt', kind: 'lob', dir: 'cluster', role: 'Gift Rain', armoury: 1, pen: 1,
    desc: 'Nobody bought anything off the list.',
    base: { dmg: 20, cd: 1.6, mag: 2, reload: 2.0, count: 5, spread: 80, range: 400, area: 42, explode: 1, dur: 1.4, flight: 0.8 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { area: 0.2 } }, sig: { 5: ['pgiftlist', 'pconfetti'], 10: ['preveal', 'pthankyou'] } },
  wetwipe: { name: 'Wet Wipe', stars: [3, 4, 1, 3], play: 'Wide, wet sweeps in front of you that wipe away enemy bullets as well as enemies.', icon: 'WW', elem: 'salt', kind: 'melee', melee: 'sweep', dir: 'nearest', role: 'Melee', armoury: 1, pen: 1,
    desc: 'Gets everything off. Everything.',
    base: { dmg: 24, cd: 0.8, mag: 4, reload: 1.2, count: 1, range: 125, area: 1, arc: 2.6, knock: 70 },
    lv: { 3: { dmg: 0.25 }, 6: { area: 0.2 }, 9: { dmg: 0.35 } }, sig: { 5: ['pmoist', 'ppack'], 10: ['pantibac', 'pflushable'] } },
  pistol: { name: 'Water Pistol', stars: [2, 4, 3, 3], play: 'A fast, weak squirt gun that soaks everything. Every twentieth squirt is a big SPLOSH.', icon: 'WP', elem: 'salt', kind: 'gun', dir: 'nearest', role: 'Squirter', armoury: 1, pen: 1,
    desc: 'Filled from the bath. Which bath, nobody will say.',
    base: { dmg: 5, cd: 0.13, mag: 20, reload: 1.4, count: 1, spread: 0.08, speed: 560, pierce: 0, range: 340, size: 3 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['ppump', 'ppressure'], 10: ['psplosh', 'ptwopistols'] } },
  // ---- Oil
  codliver: { name: 'Cod Liver Oil', stars: [3, 3, 3, 3], play: 'A spoon flicks globs of cod liver oil at the nearest enemy. Whatever it lands on gags for a moment.', icon: 'CL', elem: 'oxi', kind: 'lob', dir: 'nearest', role: 'Spoon', armoury: 1, pen: 1,
    desc: 'Good for you. Allegedly. Nobody has ever checked.',
    base: { dmg: 26, cd: 0.9, mag: 4, reload: 1.6, count: 1, spread: 20, range: 360, area: 50, explode: 1, dur: 1.6, flight: 0.45 },
    lv: { 3: { area: 0.2 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['pheaped', 'psecondspoon'], 10: ['pomega', 'psugar'] } },
  lavalamp: { name: 'Lava Lamp', stars: [3, 4, 1, 4], play: 'Slow blobs of hot oil rise and fall around you, drifting in and out. Groovy, and greasy.', icon: 'LL', elem: 'oxi', kind: 'orbit', dir: 'nearest', role: 'Pets', armoury: 1, pen: 1,
    desc: 'Bought in 1974. Never switched off.',
    base: { dmg: 18, count: 3, dur: 5, reload: 2.2, radius: 70, spin: 1.4, size: 11, range: 120 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { size: 0.25 } }, sig: { 5: ['pblob', 'pgroovy'], 10: ['pbigblob', 'pfarout'] } },
  piglet: { name: 'Greased Piglet', stars: [3, 2, 2, 5], play: 'Lets loose a squealing greased piglet that skids round you at full tilt, bouncing off everything it hits. Nobody can catch it.', icon: 'GP', elem: 'oxi', kind: 'critter', critter: 'pig', dir: 'nearest', role: 'Pets', armoury: 1, pen: 1,
    desc: 'First prize at the fair. Second prize was not catching it.',
    base: { dmg: 40, cd: 0.25, mag: 1, reload: 0, count: 1, range: 260, speed: 460 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['plitter', 'pgreasy'], 10: ['pfly', 'phogwild'] } },
  // ---- Soul
  nightlight: { name: 'Night Light', stars: [2, 3, 2, 4], play: 'You plug in night lights as you swim. Each one glows for a while and zaps anything that creeps too close.', icon: 'NL', elem: 'soul', kind: 'critter', critter: 'lamp', dir: 'nearest', noTarget: 1, role: 'Plug-ins', armoury: 1, pen: 1,
    desc: 'Keeps the monsters away. You are the monster.',
    base: { dmg: 18, cd: 0.6, mag: 1, reload: 0, count: 3, range: 120, dur: 9 },
    lv: { 3: { count: 1 }, 6: { dmg: 0.3 }, 9: { range: 0.2 } }, sig: { 5: ['pplugin', 'pbulb'], 10: ['pmonster', 'planding'] } },
  booerang: { name: 'Boo-merang', stars: [3, 2, 3, 5], play: 'A ghostly boomerang that sails out to the furthest enemy and comes back. On the way back it jumps out at everything: BOO.', icon: 'BM', elem: 'soul', kind: 'gun', dir: 'furthest', style: 'glaive', role: 'Fun', armoury: 1, pen: 1,
    desc: 'You threw it away. It came back. They always come back.',
    base: { dmg: 30, cd: 1.1, mag: 2, reload: 1.4, count: 1, spread: 0.3, speed: 400, pierce: 99, range: 340, size: 10, boomerang: 1 },
    lv: { 3: { dmg: 0.25 }, 6: { count: 1 }, 9: { dmg: 0.35 } }, sig: { 5: ['pspooky', 'psender'], 10: ['phaunted', 'pbanshee'] } },
});
for (const id in WEAPONS) if (WEAPONS[id].pen && !WEAPONS[id].color) WEAPONS[id].color = ELEMENTS[WEAPONS[id].elem].color;
Object.assign(ARM_CLASS, {
  sticky: 'fun', eggwhite: 'area', hanky: 'melee', wetkiss: 'shooter', softplay: 'area', juicebox: 'fun', lemon: 'shooter',
  cord: 'fun', period: 'area', heelprick: 'shooter', fork: 'shooter', pram: 'fun', shower: 'area', wetwipe: 'melee', pistol: 'shooter',
  codliver: 'shooter', lavalamp: 'pet', piglet: 'pet', nightlight: 'area', booerang: 'fun',
});

// Upgrade forks. `st` is the plain stat change: + for count/pierce, x for the rest. The rest are handled in code.
const PEN_SIGS = {
  pstretchy: ['Extra Stretchy', 'Reaches 30% further and reels harder.', { range: 1.3 }], pslap: ['Slap Happy', '+1 hand every fling.', { count: 1 }],
  ppartybag: ['Party Bag', 'Mastery. +2 hands every fling.', { count: 2 }], pgooey: ['Gooey', 'Mastery. Whatever you reel in is glued in place for a second when it arrives.'],
  pstretch: ['Stretchy', 'The lane lasts 50% longer.', { dur: 1.5 }], pfertile: ['Fertile Window', 'You swim 45% faster in the lane, not 25%.'],
  povulating: ['Ovulating', 'Mastery. The lane is twice as wide.', { area: 2 }], psticky: ['Sticky Situation', 'Mastery. Enemies in the lane are glued in place now and then.'],
  pwettowel: ['Wet Towel', 'The stinging tip starts halfway along, not near the end.'], psnotty: ['Snotty', 'Cracks hit 35% harder.', { dmg: 1.35 }],
  pchanging: ['Changing Room', 'Mastery. +1 lash every time.', { count: 1 }], pgermflick: ['Germ Flick', 'Mastery. The tip spreads germs to everything near what it hits.'],
  psmooch: ['Big Smooch', 'Kisses are 30% bigger and hit 30% harder.', { size: 1.3, dmg: 1.3 }], pauntie: ['Auntie', '+1 kiss every time.', { count: 1 }],
  plipstick: ['Lipstick', 'Mastery. Every kiss leaves a print that spreads.'], pfrench: ['French', 'Mastery. Kisses go through 2 enemies and home in harder.', { pierce: 2, homing: 1.6 }],
  pballpit: ['Ball Pit', 'Pits are 25% bigger.', { area: 1.25 }], psocks: ['Socks Only', 'Pits last 50% longer.', { dur: 1.5 }],
  pparty: ['Birthday Party', 'Mastery. +1 pit every throw.', { count: 1 }], plostshoe: ['Lost Shoe', 'Mastery. Twice as many balls fly out.'],
  pbendy: ['Bendy Straw', 'The stream reaches 30% further.', { range: 1.3 }], pfamily: ['Family Pack', 'Throws two cartons, not one.'],
  psqueeze: ['Squeeze Hard', 'Mastery. Cartons burst twice as big.'], pfunsize: ['Fun Size', 'Mastery. Throws a carton every half carton, each 30% weaker.'],
  pzest: ['Zest', 'Squirts go through 1 more enemy.', { pierce: 1 }], ppips: ['Pips', '+1 squirt every time.', { count: 1 }],
  psourface: ['Sour Face', 'Mastery. Eyes water for twice as long.'], plemonade: ['Lemonade', 'Mastery. Squirts hit enemies rubbing their eyes 60% harder.'],
  plongcord: ['Long Cord', 'The cord reaches 30% further.', { range: 1.3 }], ptwincord: ['Twin Cord', '+1 cord, on the next toughest enemy.', { count: 1 }],
  pfeeding: ['Feeding Tube', 'Mastery. The cord heals you three times as much.'], ptiedoff: ['Tied Off', 'Mastery. Anything crossing a cord takes 2.5 times the damage.'],
  pheavy: ['Heavy Flow', 'Waves reach 30% further.', { area: 1.3 }], pcramps: ['Cramps', '+1 wave every time.'],
  pclockwork: ['Like Clockwork', 'Mastery. It comes round 40% sooner.', { cd: 0.6 }], phormonal: ['Hormonal', 'Mastery. Waves hit 50% harder and shove everything away.', { dmg: 1.5 }],
  ptwopricks: ['Two Pricks', '+1 needle every time.', { count: 1 }], pfineneedle: ['Fine Needle', 'Needles come 25% faster.', { cd: 0.8 }],
  pguthrie: ['Guthrie Card', 'Mastery. Every fourth needle finds the weak spot.'], pbutterfly: ['Butterfly Needle', 'Mastery. The weak spot takes seven times the damage.'],
  pprongs: ['Both Prongs', '+1 bolt, on the next enemy along.', { count: 1 }], plivesocket: ['Live Socket', 'It builds up twice as fast.'],
  pbarewire: ['Bare Wire', 'Mastery. It builds up to five times the damage, not three.'], pearthed: ['Earthed', 'Mastery. Once it is fully built up, the shock jumps on through 3 more enemies.'],
  ptwinpram: ['Double Buggy', '+1 pram every shove.', { count: 1 }], poffroad: ['Off-Road', 'Prams are 30% bigger and hit 25% harder.', { size: 1.3, dmg: 1.25 }],
  psteps: ['Down the Steps', 'Mastery. Pile-ups hit twice as hard.'], pramrace: ['Pram Race', 'Mastery. Prams roll 60% faster and come 40% more often.', { speed: 1.6, cd: 0.6 }],
  pgiftlist: ['Gift List', '+2 presents every time.', { count: 2 }], pconfetti: ['Confetti', 'Splashes are 30% bigger.', { area: 1.3 }],
  preveal: ['Gender Reveal', 'Mastery. One present in five is a huge burst: twice the size, three times the damage.'], pthankyou: ['Thank-You Cards', 'Mastery. Puddles last 2.5 times as long.', { dur: 2.5 }],
  pmoist: ['Extra Moist', 'Sweeps reach 30% further.', { area: 1.3 }], ppack: ['Pack of 80', '+1 sweep, behind you.', { count: 1 }],
  pantibac: ['Antibacterial', 'Mastery. Every wipe strips a little armour.'], pflushable: ['Flushable', 'Mastery. Wiped bullets come back out as your shots.'],
  ppump: ['Pump Action', '+1 squirt every time.', { count: 1 }], ppressure: ['Pressurised', 'Squirts fly 30% faster and hit 20% harder.', { speed: 1.3, dmg: 1.2 }],
  psplosh: ['Big Splosh', 'Mastery. Every tenth squirt is a SPLOSH.'], ptwopistols: ['Two Pistols', 'Mastery. +2 squirts every time.', { count: 2 }],
  pheaped: ['Heaped Spoon', 'Splats are 30% bigger.', { area: 1.3 }], psecondspoon: ['Second Spoon', '+1 glob every flick.', { count: 1 }],
  pomega: ['Omega-3', 'Mastery. Globs hit 60% harder.', { dmg: 1.6 }], psugar: ['Spoonful of Sugar', 'Mastery. Enemies gag twice as long.'],
  pblob: ['Another Blob', '+1 blob.', { count: 1 }], pgroovy: ['Groovy', 'Blobs drift round 50% faster.', { spin: 1.5 }],
  pbigblob: ['Big Blob', 'Mastery. Blobs are 50% bigger and hit 30% harder.', { size: 1.5, dmg: 1.3 }], pfarout: ['Far Out', 'Mastery. Blobs drift out 40% further.', { radius: 1.4 }],
  plitter: ['Litter', '+1 piglet.', { count: 1 }], pgreasy: ['Extra Greasy', 'Piglets skid 30% faster.', { speed: 1.3 }],
  pfly: ['Pigs Might Fly', 'Mastery. +2 piglets.', { count: 2 }], phogwild: ['Hog Wild', 'Mastery. Piglets hit 60% harder.', { dmg: 1.6 }],
  pplugin: ['Plug-in', '+1 night light.', { count: 1 }], pbulb: ['Brighter Bulb', 'Lights reach 35% further.', { range: 1.35 }],
  pmonster: ['Monster Under the Bed', 'Mastery. Every zap spooks what it hits, freezing it for a moment.'], planding: ['Landing Light', 'Mastery. Lights hit 60% harder.', { dmg: 1.6 }],
  pspooky: ['Spookier', 'Hits 30% harder.', { dmg: 1.3 }], psender: ['Return to Sender', '+1 boo-merang every throw.', { count: 1 }],
  phaunted: ['Haunted', 'Mastery. The trip back hits twice as hard.'], pbanshee: ['Banshee', 'Mastery. Every BOO spooks everything near it too.'],
};
for (const id in PEN_SIGS) SIGS[id] = { name: PEN_SIGS[id][0], desc: PEN_SIGS[id][1] };
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, {
  sticky: 'whip', eggwhite: 'wake', hanky: 'whip', wetkiss: 'seeker', softplay: 'bubble', juicebox: 'flask', lemon: 'droplet',
  cord: 'chain1', period: 'nova', heelprick: 'syringe', fork: 'bolt', pram: 'hammer', shower: 'cloud', wetwipe: 'spray', pistol: 'droplet',
  codliver: 'mortar', lavalamp: 'orbit', piglet: 'footprints', nightlight: 'turret', booerang: 'ghost',
});
for (const [seq, ids] of Object.entries({
  vanguard: ['eggwhite', 'pram', 'pistol'], bruiser: ['codliver', 'softplay'], nerd: ['fork', 'lavalamp'],
  eggseeker: ['sticky', 'wetkiss', 'lemon'], stealth: ['hanky', 'booerang', 'nightlight'], pusher: ['piglet', 'cord'],
  acid: ['juicebox', 'period'], splicer: ['wetwipe', 'heelprick', 'shower'],
})) if (PROFILES[seq]) for (const id of ids) if (!PROFILES[seq].weapons.includes(id)) PROFILES[seq].weapons.push(id);

const penFree = e => !e.boss && !e.rival && !e.egg && !e.dead;
const penSay = (w, x, y, txt, every) => { if (w.echo || w.sayT > G.t) return; w.sayT = G.t + (every || 1.2); floatText(x, y, txt, w.def.color, 12, 0.6); };

// ---------------------------------------------------------------- stats (from armSigStats)
function penSigStats(w, s) {
  for (const l of [5, 10]) {
    const id = w.perks && w.perks[l], f = id && PEN_SIGS[id] && PEN_SIGS[id][2];
    if (!f) continue;
    for (const k in f) {
      if (k === 'count' || k === 'pierce') s[k] = (s[k] || 0) + f[k];
      else if (s[k] != null) s[k] *= f[k];
    }
  }
}

// ---------------------------------------------------------------- firing (from armFire; true = handled here)
function penFire(w, target, src) {
  const d = w.def;
  if (d.kind === 'critter') return true; // (the lane, piglets and night lights run in penPetTick)
  if (!target) return false;
  const s = w.s, p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x);
  switch (w.id) {
    case 'juicebox': { // the stream is the usual gun; an empty carton gets thrown
      w.sipN = (w.sipN || 0) + 1;
      const every = Math.max(4, Math.round(s.mag * (hasSig(w, 'pfunsize') ? 0.5 : 1)));
      if (w.sipN % every) return false;
      target = combo3Carton(w, target) || target; // (combos3.js: Packed Lunch)
      const n = hasSig(w, 'pfamily') ? 2 : 1, ar = 70 * (hasSig(w, 'psqueeze') ? 2 : 1), k = hasSig(w, 'pfunsize') ? 0.7 : 1;
      for (let i = 0; i < n; i++) {
        const tx = target.x + (i ? rand(-60, 60) : 0), ty = target.y + (i ? rand(-60, 60) : 0);
        G.fx.push({ type: 'warn', x: tx, y: ty, r: ar, color: d.color, life: 0.5, max: 0.5 });
        after(0.5, () => {
          if (!G || !w.s) return;
          aoe(tx, ty, ar, w.s.dmg * 10 * k, armSrc(src, { wname: 'Juice Box (carton)' }), d.color);
          combo3Boil(tx, ty); // (combos3.js)
          if (G.zones.length < 240) G.zones.push({ x: tx, y: ty, r: ar * 0.7, life: 2, max: 2, dps: w.s.dmg * 2, elem: 'fire', pull: 0, color: d.color, tick: 0, src });
          sfx('boom');
        });
      }
      penSay(w, p.x, p.y - 30, 'SLURP', 2);
      return false;
    }
    case 'cord': { // a held line to the toughest enemies in reach
      const ts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count) : [target];
      w.cords = ts; w.cordUntil = G.t + 0.3;
      const cross = s.dmg * 0.6 * (hasSig(w, 'ptiedoff') ? 2.5 : 1), heal = hasSig(w, 'pfeeding') ? 3 : 1;
      for (const t of ts) {
        const got = damageEnemy(t, s.dmg, src) || 0;
        if (!w.echo && got > 0) healPlayer(Math.min(G.P.maxHp * 0.006 * s.cd * heal, got * 0.05 * heal), true);
        const dx = t.x - p.x, dy = t.y - p.y, L = Math.hypot(dx, dy) || 1;
        for (let k = 30; k < L - t.r; k += 30) forNear(p.x + dx / L * k, p.y + dy / L * k, 14, e => {
          if (e === t || e.cordT > G.t) return;
          e.cordT = G.t + 0.4; damageEnemy(e, cross, armSrc(src, { wname: 'Umbilical Cord (crossed)' }));
        });
      }
      return true;
    }
    case 'period': { // waves of cramps, all around you
      const n = hasSig(w, 'pcramps') ? 4 : 3, shoveIt = hasSig(w, 'phormonal');
      for (let i = 0; i < n; i++) after(i * 0.35, () => {
        if (!G || !w.s) return;
        const q = me(), r = w.s.area * (0.7 + i * 0.15);
        aoe(q.x, q.y, r, w.s.dmg, src, d.color);
        if (shoveIt) forNear(q.x, q.y, r, e => { shove(e, q.x, q.y, 160); });
        ring(q.x, q.y, r, d.color, 0.45, 5);
        fxParts('spark', q.x, q.y, d.color, 10, r * 2.5, 0.5, 3);
      });
      penSay(w, p.x, p.y - 32, 'CRAMPS', 0.5);
      cam.shake = Math.min(8, cam.shake + 2);
      sfx('boom');
      return true;
    }
    case 'fork': { // a held bolt that builds up on one target
      const ts = s.count > 1 ? acquireMany(w.dir, s.range, p.x, p.y, s.count) : [target];
      const rate = hasSig(w, 'plivesocket') ? 1.5 : 0.75, top = hasSig(w, 'pbarewire') ? 5 : 3;
      if (ts[0] !== w.forkOn) { w.forkOn = ts[0]; w.forkK = 1; w.forkFull = 0; }
      w.forkK = Math.min(top, (w.forkK || 1) + s.cd * rate);
      ts.forEach((t, i) => {
        const k = i ? 1 : w.forkK;
        damageEnemy(t, s.dmg * k, src);
        bolt(i ? ts[i - 1].x : p.x, i ? ts[i - 1].y : p.y, t.x, t.y, k >= top ? '#ffffff' : d.color, 0.1);
      });
      if (w.forkK >= top && hasSig(w, 'pearthed') && !(w.forkFull > G.t)) { w.forkFull = G.t + 1; doChain(ts[0].x, ts[0].y, ts[0], s.dmg * top, 3, 150, armSrc(src, { wname: 'Earthed' })); }
      if (!(w.zapT > G.t)) { w.zapT = G.t + 0.3; sfx('zap'); }
      p.face = a0;
      return true;
    }
    case 'pistol': { // every twentieth (Big Splosh: tenth) squirt is a big one
      w.squirtN = (w.squirtN || 0) + 1;
      if (w.squirtN % (hasSig(w, 'psplosh') ? 10 : 20)) return false;
      spawnProj(w, p.x, p.y, a0, src, { dmg: s.dmg * 6, r: 9, pierce: 3, explode: 50 });
      penSay(w, p.x, p.y - 30, 'SPLOSH', 0.5);
      sfx('shot');
      return true;
    }
    case 'wetwipe': { // the sweep also wipes enemy bullets in front of you
      const reach = (s.reach || s.range) * 1.05, half = (s.arc || 2) / 2 + 0.1, n = s.count || 1;
      let wiped = 0;
      for (const b of G.ebul) {
        if (b.dead) continue;
        const dx = b.x - p.x, dy = b.y - p.y;
        if (dx * dx + dy * dy > reach * reach) continue;
        let ok = false;
        for (let i = 0; i < n && !ok; i++) { const da = ((Math.atan2(dy, dx) - (a0 + i / n * TAU)) % TAU + TAU * 1.5) % TAU - Math.PI; ok = Math.abs(da) < half; }
        if (!ok) continue;
        b.dead = true; wiped++; spawnPart(b.x, b.y, d.color, 1, 60, 0.3);
        if (hasSig(w, 'pflushable') && wiped <= 6) { const a = Math.atan2(dy, dx); spawnProj(w, b.x, b.y, a, src, { noMods: true, speed: 480, vx: Math.cos(a) * 480, vy: Math.sin(a) * 480, life: 0.6, dmg: s.dmg * 0.6, r: 4, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
      }
      if (wiped >= 4) penSay(w, p.x, p.y - 30, 'SPOTLESS', 3);
      return false;
    }
  }
  return false;
}

// ---------------------------------------------------------------- shots (from armHit and armEnd)
function penHit(pr, e) {
  const w = pr.w, s = w.s, p = me();
  switch (w.id) {
    case 'sticky': // it sticks and reels them in
      if (penFree(e)) {
        shove(e, p.x, p.y, -(hasSig(w, 'pstretchy') ? 420 : 320));
        if (hasSig(w, 'pgooey') && !e.elite) after(0.45, () => { if (G && !e.dead) glue(e, 1); });
      }
      break;
    case 'wetkiss':
      if (!e.dead && (hasSig(w, 'plipstick') || Math.random() < 0.3)) {
        let n = 0;
        forNear(e.x, e.y, 80, o => { if (o === e || o.dead) return; damageEnemy(o, pr.dmg * 0.4, armSrc(pr.src, { knock: 0, wname: 'Wet Kiss (lipstick)' })); return ++n >= 2; });
        if (Math.random() < 0.3) penSay(w, e.x, e.y - e.r - 12, 'MWAH', 1.5);
      }
      break;
    case 'lemon':
      if (e.lemT > G.t) { if (hasSig(w, 'plemonade')) damageEnemy(e, pr.dmg * 0.6, armSrc(pr.src, { knock: 0, noProc: true, wname: 'Lemonade' })); break; }
      e.lemT = G.t + 1.2;
      stun(e, hasSig(w, 'psourface') ? 0.6 : 0.3);
      if (Math.random() < 0.25) penSay(w, e.x, e.y - e.r - 12, 'IN THE EYE', 2);
      break;
    case 'heelprick': {
      e.prickN = (e.prickN || 0) + 1;
      if (e.prickN % (hasSig(w, 'pguthrie') ? 4 : 6)) break;
      damageEnemy(e, pr.dmg * (hasSig(w, 'pbutterfly') ? 6 : 3), armSrc(pr.src, { knock: 0, noProc: true, wname: 'Heel Prick (weak spot)' }));
      spawnPart(e.x, e.y, w.def.color, 5, 90, 0.3);
      penSay(w, e.x, e.y - e.r - 12, 'WEAK SPOT', 1.5);
      break;
    }
    case 'pram': // everything in its path rides along
      pr.load = (pr.load || 0) + 1;
      if (penFree(e)) { e.kx += pr.vx * 0.9; e.ky += pr.vy * 0.9; }
      break;
    case 'booerang':
      if (!pr.back) break;
      if (hasSig(w, 'phaunted')) damageEnemy(e, pr.dmg, armSrc(pr.src, { knock: 0, noProc: true, wname: 'Boo-merang (haunted)' }));
      if (!(e.booT > G.t)) {
        e.booT = G.t + 1.5; stun(e, 0.35);
        if (hasSig(w, 'pbanshee')) forNear(e.x, e.y, 70, o => { if (o !== e) stun(o, 0.25); });
        penSay(w, e.x, e.y - e.r - 12, 'BOO', 0.6);
      }
      break;
  }
}
function penEnd(pr) {
  const w = pr.w;
  combo3Pram(pr); // (combos3.js)
  if (!w || w.id !== 'pram' || !(pr.load >= 2)) return;
  const k = hasSig(w, 'psteps') ? 2 : 1, n = Math.min(10, pr.load);
  aoe(pr.x, pr.y, 60 + n * 6, w.s.dmg * (1 + 0.25 * n) * k, armSrc(pr.src, { wname: 'Runaway Pram (pile-up)' }), w.def.color);
  if (n >= 4 && !w.echo) floatText(pr.x, pr.y - 24, 'PILE-UP!', w.def.color, 14, 0.7);
  cam.shake = Math.min(8, cam.shake + 2);
}

// ---------------------------------------------------------------- melee hits (from armMelee)
function penMelee(w, e, dmg, src) {
  if (w.id === 'hanky') { // the tip of the towel stings
    const p = me(), reach = w.s.reach || w.s.range, dd = Math.hypot(e.x - p.x, e.y - p.y);
    if (dd < reach * (hasSig(w, 'pwettowel') ? 0.5 : 0.7)) return;
    damageEnemy(e, dmg, armSrc(src, { knock: 0, noProc: true, wname: 'Hanky Panky (crack)' }));
    if (hasSig(w, 'pgermflick')) forNear(e.x, e.y, 70, o => { if (o !== e && !o.dead) damageEnemy(o, dmg * 0.3, armSrc(src, { knock: 0, wname: 'Hanky Panky (germs)' })); });
    penSay(w, e.x, e.y - e.r - 12, 'CRACK', 1);
  } else if (w.id === 'wetwipe' && hasSig(w, 'pantibac') && !e.dead) {
    e.shred = Math.min(e.armour + 4, (e.shred || 0) + 0.5);
  }
}

// ---------------------------------------------------------------- lobs landing (from armLand)
function penLand(pr) {
  const w = pr.w, s = w.s, src = pr.src, z = G.zones[G.zones.length - 1];
  const pud = z && z.x === pr.tx && z.y === pr.ty ? z : null;
  switch (w.id) {
    case 'softplay': {
      if (pud) pud.penSoft = 1;
      const n = hasSig(w, 'plostshoe') ? 16 : 8;
      for (let i = 0; i < n; i++) { const a = i / n * TAU + rand(-0.2, 0.2), sp = rand(240, 340); spawnProj(w, pr.tx, pr.ty, a, src, { noMods: true, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.6, dmg: s.dmg * 0.6, r: 5, pierce: 1, explode: 0, bounce: 1, homing: 0 }); }
      break;
    }
    case 'codliver': {
      const t = hasSig(w, 'psugar') ? 0.9 : 0.45;
      let gagged = 0;
      forNear(pr.tx, pr.ty, s.area, e => { if (e.gagT > G.t) return; e.gagT = G.t + 1.5; stun(e, t); gagged++; });
      if (gagged && Math.random() < 0.3) penSay(w, pr.tx, pr.ty - 20, 'BLEURGH', 2);
      break;
    }
    case 'shower':
      if (hasSig(w, 'preveal') && Math.random() < 0.2) {
        aoe(pr.tx, pr.ty, s.area * 2, s.dmg * 3, armSrc(src, { wname: 'Gender Reveal' }), Math.random() < 0.5 ? '#ffafcc' : '#a2d2ff');
        ring(pr.tx, pr.ty, s.area * 2, '#ffffff', 0.5, 5);
        penSay(w, pr.tx, pr.ty - 24, "IT'S A... SPLASH", 2);
      } else if (Math.random() < 0.12) penSay(w, pr.tx, pr.ty - 20, ['ANOTHER BIB', 'SOCKS', 'A RATTLE', 'MORE SOCKS'][Math.floor(Math.random() * 4)], 2.5);
      break;
  }
}

// ---------------------------------------------------------------- per frame (from armTick)
// The pets of this file: the Egg White lane, Greased Piglets and Night Lights. True = handled.
function penPetTick(w, dt) {
  if (!w.def.pen) return false;
  if (w.def.critter === 'lane') laneTick(w, dt);
  else if (w.def.critter === 'pig') pigTick(w, dt);
  else if (w.def.critter === 'lamp') lampTick(w, dt);
  return true;
}
function penTick(dt) {
  if (!G || !G.weapons) return;
  // Soft Play pits bog down what is in them.
  if (!(G.penSoftT > G.t)) {
    G.penSoftT = G.t + 0.5;
    for (const z of G.zones) if (z.penSoft && z.life > 0) forNear(z.x, z.y, z.r, e => { if (penFree(e) && !e.elite) glue(e, 0.2); });
  }
  // The Lava Lamp's blobs drift in and out.
  for (const w of G.weapons) if (w && w.id === 'lavalamp' && w.s) {
    if (w.lavaS !== w.s) { w.lavaS = w.s; w.lavaR0 = w.s.radius; }
    w.s.radius = w.lavaR0 * (1 + 0.35 * Math.sin(G.t * 0.9));
  }
}
function laneTick(w, dt) {
  const s = w.s, p = me(), v = Math.hypot(p.vx || 0, p.vy || 0);
  w.laneT = (w.laneT || 0) - dt;
  if (w.laneT <= 0 && v > 60 && G.zones.length < 250) {
    w.laneT = s.cd;
    const ax = p.vx / v, ay = p.vy / v, r = s.area * (1 + 0.25 * ((s.count || 1) - 1));
    G.zones.push({ x: p.x + ax * 60, y: p.y + ay * 60, r, life: s.dur, max: s.dur, dps: s.dmg, elem: 'ice', pull: 0, color: w.def.color, tick: 0, src: weaponSrc(w), penLane: w.uid });
  }
  // You swim faster in your own lane.
  if (!(w.laneLook > G.t)) {
    w.laneLook = G.t + 0.1;
    let on = false;
    for (const z of G.zones) if (z.penLane === w.uid && z.life > 0 && Math.hypot(z.x - p.x, z.y - p.y) < z.r + 6) { on = true; break; }
    if (on) { G.penHasteT = G.t + 0.25; G.penHasteK = hasSig(w, 'pfertile') ? 1.45 : 1.25; }
    if (hasSig(w, 'psticky') && !(w.glueT > G.t)) {
      w.glueT = G.t + 1.5;
      for (const z of G.zones) if (z.penLane === w.uid && z.life > 0) forNear(z.x, z.y, z.r, e => { if (penFree(e) && !e.elite) glue(e, 0.5); });
    }
  }
}
// Greased Piglets skid about at full tilt inside a leash round you, bouncing off whatever they hit.
function pigTick(w, dt) {
  const s = w.s, p = me(), P = w.pigs || (w.pigs = []);
  while (P.length < s.count) { const a = Math.random() * TAU; P.push({ x: p.x, y: p.y, vx: Math.cos(a) * s.speed, vy: Math.sin(a) * s.speed, a, seed: Math.random() * 10 }); }
  if (P.length > s.count) P.length = s.count;
  let src = null;
  for (const q of P) {
    const sp = Math.hypot(q.vx, q.vy) || 1;
    q.vx = q.vx / sp * s.speed; q.vy = q.vy / sp * s.speed;
    q.x += q.vx * dt; q.y += q.vy * dt;
    // the leash: bounce back in off its edge
    const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
    if (d > s.range) {
      const nx = dx / d, ny = dy / d, dot = q.vx * nx + q.vy * ny;
      if (dot > 0) { q.vx -= 2 * dot * nx; q.vy -= 2 * dot * ny; const t = rand(-0.4, 0.4), c = Math.cos(t), sn = Math.sin(t); [q.vx, q.vy] = [q.vx * c - q.vy * sn, q.vx * sn + q.vy * c]; }
      q.x = p.x + nx * s.range; q.y = p.y + ny * s.range;
    }
    q.a = Math.atan2(q.vy, q.vx);
    forNear(q.x, q.y, 10, e => {
      if (e.pigT > G.t || e.charmed) return;
      e.pigT = G.t + s.cd;
      src = src || armSrc(weaponSrc(w), { knock: 0 });
      damageEnemy(e, s.dmg, armSrc(src, { knock: 120, kx: e.x - q.x, ky: e.y - q.y }));
      // bounce off it, a bit sideways
      const ex = q.x - e.x, ey = q.y - e.y, el = Math.hypot(ex, ey) || 1, nx = ex / el, ny = ey / el, dot = q.vx * nx + q.vy * ny;
      if (dot < 0) { q.vx -= 2 * dot * nx; q.vy -= 2 * dot * ny; }
      const t = rand(-0.6, 0.6), c = Math.cos(t), sn = Math.sin(t); [q.vx, q.vy] = [q.vx * c - q.vy * sn, q.vx * sn + q.vy * c];
      spawnPart(e.x, e.y, w.def.color, 2, 70, 0.2, 2);
      if (Math.random() < 0.04) penSay(w, q.x, q.y - 16, 'OINK', 2);
      return true;
    });
  }
}
// Night Lights: plugged in where you swim, each glows for a while and zaps what creeps close.
function lampTick(w, dt) {
  const s = w.s, p = me(), L = w.lamps || (w.lamps = []);
  w.plugT = (w.plugT || 0) - dt;
  if (w.plugT <= 0) {
    w.plugT = s.dur / Math.max(1, s.count);
    L.push({ x: p.x, y: p.y, life: s.dur, cd: 0.3, seed: Math.random() * 10 });
    while (L.length > s.count) L.shift();
  }
  let src = null;
  for (let i = L.length - 1; i >= 0; i--) {
    const q = L[i];
    q.life -= dt; q.cd -= dt;
    if (q.life <= 0) { L.splice(i, 1); continue; }
    if (q.cd > 0) continue;
    const t = acquire('nearest', s.range, q.x, q.y);
    if (!t) { q.cd = 0.2; continue; }
    q.cd = s.cd;
    src = src || armSrc(weaponSrc(w), { knock: 0 });
    damageEnemy(t, s.dmg, src);
    if (hasSig(w, 'pmonster')) stun(t, 0.3);
    bolt(q.x, q.y, t.x, t.y, w.def.color, 0.12);
  }
}

// ---------------------------------------------------------------- drawing (from armDraw)
function penDraw() {
  if (!G || !G.weapons) return;
  for (const w of G.weapons) {
    if (!w || !w.def.pen) continue;
    const c = w.def.color, p = me();
    if (w.id === 'cord' && w.cords && w.cordUntil > G.t) { // a wobbly cord
      ctx.strokeStyle = c; ctx.lineWidth = 3 * S; ctx.globalAlpha = 0.85;
      for (const t of w.cords) {
        if (!t || t.dead) continue;
        const dx = t.x - p.x, dy = t.y - p.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        ctx.beginPath();
        for (let k = 0; k <= 16; k++) {
          const f = k / 16, wv = Math.sin(f * 14 + G.realT * 6) * 5 * Math.sin(f * Math.PI);
          const x = sx(p.x + dx * f + nx * wv), y = sy(p.y + dy * f + ny * wv);
          if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    if (w.pigs) for (const q of w.pigs) { // a pink, shiny piglet with a curly tail
      const x = sx(q.x), y = sy(q.y), a = q.a, L = 8 * S, Wd = 5.5 * S;
      glow(x, y, 12 * S, c, 0.3);
      ctx.globalAlpha = 1; ctx.fillStyle = '#ffafcc'; ctx.beginPath(); ctx.ellipse(x, y, L, Wd, a, 0, TAU); ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1.2 * S; ctx.stroke();
      ctx.strokeStyle = '#ffafcc'; ctx.beginPath(); ctx.arc(x - Math.cos(a) * (L + 2 * S), y - Math.sin(a) * (L + 2 * S), 2 * S, 0, TAU * 0.8); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.ellipse(x - Math.sin(a) * 2 * S, y + Math.cos(a) * 2 * S, L * 0.5, Wd * 0.3, a, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (w.lamps) for (const q of w.lamps) { // a small glowing plug-in
      const x = sx(q.x), y = sy(q.y), f = Math.min(1, q.life / 1.2);
      glow(x, y, 22 * S, c, (0.35 + 0.1 * Math.sin(G.realT * 3 + q.seed)) * f);
      ctx.globalAlpha = f; ctx.fillStyle = '#fff3d6'; ctx.beginPath(); ctx.arc(x, y, 4 * S, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}
