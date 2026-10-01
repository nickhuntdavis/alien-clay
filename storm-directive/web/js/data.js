'use strict';
// Spawn Prawn - game data: elements, weapons, spells, merges, passives, enemies, bosses, directives.

const ELEMENTS = {
  phys:   { name: 'Kinetic', color: '#e8eef8' },
  fire:   { name: 'Fire',    color: '#ff7a2f' },
  ice:    { name: 'Frost',   color: '#6fd8ff' },
  shock:  { name: 'Shock',   color: '#ffe94a' },
  poison: { name: 'Toxic',   color: '#8dff4a' },
  arcane: { name: 'Arcane',  color: '#c77dff' },
};

// Targeting directives. Each weapon/spell runs one of these.
const DIRECTIVES = [
  { id: 'nearest',   name: 'NEAREST',        short: 'NEAR',   desc: 'Whatever is closest. Safe, boring, effective.' },
  { id: 'strongest', name: 'STRONGEST',      short: 'STRG',   desc: 'Biggest max health first. Tank busting.' },
  { id: 'weakest',   name: 'WEAKEST',        short: 'WEAK',   desc: 'Smallest max health first. Clears fodder.' },
  { id: 'lowhp',     name: 'LOWEST HEALTH',  short: 'LOW HP', desc: 'Finish off the wounded. Great for kills.' },
  { id: 'highhp',    name: 'HIGHEST HEALTH', short: 'HI HP',  desc: 'Whoever has the most health left right now.' },
  { id: 'armour',    name: 'HIGHEST ARMOUR', short: 'ARMR',   desc: 'Most armour first. Pair with shred.' },
  { id: 'fastest',   name: 'FASTEST',        short: 'FAST',   desc: 'Chargers and skitters before they reach you.' },
  { id: 'furthest',  name: 'FURTHEST',       short: 'FAR',    desc: 'Snipe the back line.' },
  { id: 'cluster',   name: 'DENSEST CLUSTER', short: 'CLSTR', desc: 'The middle of the crowd. Best for splash.' },
  { id: 'elite',     name: 'ELITES & BOSSES', short: 'ELITE', desc: 'Bosses, then elites, then nearest.' },
  { id: 'shooters',  name: 'SHOOTERS FIRST', short: 'SHOOT',  desc: 'Ranged enemies, healers and summoners first.' },
  { id: 'random',    name: 'RANDOM',         short: 'RAND',   desc: 'Chaos. The audience loves it.' },
  { id: 'revenge',   name: 'REVENGE',        short: 'GRUDGE', desc: 'Whatever hurt you last. Otherwise nearest.' },
];

// Movement (autorun) directives.
const MOVE_DIRECTIVES = [
  { id: 'kite',    name: 'KITE',    desc: 'Keep distance from threats, dodge bullets' },
  { id: 'collect', name: 'COLLECT', desc: 'Hoover up XP and power-ups' },
  { id: 'orbit',   name: 'ORBIT',   desc: 'Circle around the horde' },
  { id: 'hunt',    name: 'HUNT',    desc: 'Close in on the primary target' },
  { id: 'hold',    name: 'HOLD',    desc: 'Stand ground, only dodge bullets' },
  { id: 'defend',  name: 'NEST',    desc: 'Hover in the egg\'s warm glow, which slowly heals you' },
];

// Level bonus keys: count, pierce, chain, bounce (additive); dmg, area, dur (additive %); cd (negative = faster).
// Fourteen signature weapons. Each one plays differently, and each has its own upgrade path:
// Lv 3 and Lv 8 offer upgrades any weapon can take; Lv 5 and Lv 10 fork into two upgrades only that
// weapon has (see SIGS). role: the play style in two words.
const WEAPONS = {
  blaster: { name: 'Spitball', stars: [3, 3, 4, 1], play: 'Picks targets off from range, one at a time. Grows into a railgun or a fire hose.', icon: 'BL', elem: 'phys', kind: 'gun', color: '#e8f0ff', dir: 'nearest', role: 'Marksman',
    desc: 'Reliable, accurate single shots. Mildly unhygienic.',
    base: { dmg: 11, cd: 0.3, mag: 12, reload: 1.1, count: 1, spread: 0.04, speed: 640, pierce: 0, range: 440, size: 4 },
    lv: { 3: { pierce: 1 }, 6: { count: 1 }, 9: { dmg: 0.3 } }, sig: { 5: ['loogie', 'wetwilly'], 10: ['kidneystone', 'vomit'] } },
  shotgun: { name: 'Hiccup Scattergun', stars: [4, 2, 1, 3], play: 'Get up close and blast. Point-blank damage, knockback and a ring of pellets later.', icon: 'SG', elem: 'phys', kind: 'gun', color: '#ffd6a5', dir: 'nearest', role: 'Brawler',
    desc: 'A close-range burst with knockback. Comes out whether you want it to or not.',
    base: { dmg: 8, cd: 0.75, mag: 4, reload: 1.6, count: 6, spread: 0.55, speed: 540, pierce: 0, range: 270, size: 3.5, knock: 70 },
    lv: { 3: { count: 2 }, 6: { pierce: 1 }, 9: { count: 2 } }, sig: { 5: ['pointblank', 'slug'], 10: ['hiccupfit', 'dragonbreath'] } },
  glaive: { name: 'Yo-Yo Diet', stars: [3, 2, 3, 3], play: 'Throws out and comes back, hitting everything twice. Can hang, grow or become a black hole.', icon: 'GL', elem: 'phys', kind: 'gun', color: '#f1f1f1', dir: 'furthest', style: 'glaive', role: 'Boomerang',
    desc: 'A spinning blade that flies out and always comes back. Like the weight.',
    base: { dmg: 16, cd: 1.0, mag: 2, reload: 1.3, count: 1, spread: 0.3, speed: 430, pierce: 99, range: 330, size: 10, boomerang: 1 },
    lv: { 3: { dmg: 0.2 }, 6: { count: 1 }, 9: { dmg: 0.3 } }, sig: { 5: ['walkdog', 'crashdiet'], 10: ['aroundworld', 'blackyoyo'] } },
  wake: { name: 'Slipstream Scalpel', stars: [3, 5, 1, 3], play: 'No aiming: your swim path is the blade. Swim circles round crowds to cut them all at once.', icon: 'WB', elem: 'phys', kind: 'wake', color: '#e0fbfc', dir: 'nearest', noTarget: 1, role: 'Swim Path',
    desc: 'Your swim path becomes a blade. Keep moving, or it is just very expensive litter.',
    base: { dmg: 24, dur: 2.2, area: 22, range: 0 },
    lv: { 3: { area: 0.3 }, 6: { dur: 0.5 }, 9: { dmg: 0.5 } }, sig: { 5: ['closeloop', 'razorwire'], 10: ['surgicalteam', 'afterburner'] } },
  flamer: { name: 'Heartburn', stars: [2, 5, 1, 4], play: 'A short cone of fire that melts crowds. Later it sweeps a full circle or never stops.', icon: 'FL', elem: 'fire', kind: 'gun', color: '#ff7a2f', dir: 'nearest', style: 'flame', role: 'Flamethrower',
    desc: 'A short-range cone of fire. Every lick burns. Antacids not included.',
    base: { dmg: 3.4, cd: 0.05, mag: 50, reload: 2.1, count: 2, spread: 0.45, speed: 310, pierce: 99, range: 200, size: 7 },
    lv: { 3: { area: 0.3 }, 6: { dmg: 0.3 }, 9: { count: 1 } }, sig: { 5: ['blueflame', 'indigestion'], 10: ['dragon', 'hellkitchen'] } },
  mines: { name: 'Nappy Mines', stars: [4, 2, 2, 4], play: 'Leaves traps behind you. Chain reactions, sticky bombs and the occasional nuke.', icon: 'ML', elem: 'fire', kind: 'mine', color: '#ff9f1c', dir: 'nearest', role: 'Trapper',
    desc: 'Drops proximity mines in your wake. Nobody wants to change them.',
    base: { dmg: 34, cd: 0.7, mag: 5, reload: 2.4, count: 1, explode: 72, life: 14, range: 600 },
    lv: { 3: { count: 1 }, 6: { area: 0.3 }, 9: { dmg: 0.5 } }, sig: { 5: ['domino', 'sticky'], 10: ['nuclear', 'minefield'] } },
  frost: { name: 'Cold Feet', stars: [3, 2, 4, 3], play: 'Piercing shards that slow and freeze. Frozen things shatter.', icon: 'FR', elem: 'ice', kind: 'gun', color: '#6fd8ff', dir: 'fastest', style: 'shard', role: 'Freezer',
    desc: 'Piercing ice shards that chill and freeze. Commitment issues, weaponised.',
    base: { dmg: 15, cd: 0.6, mag: 5, reload: 1.5, count: 1, spread: 0.08, speed: 540, pierce: 3, range: 460, size: 5 },
    lv: { 3: { count: 1 }, 6: { pierce: 2 }, 9: { count: 1 } }, sig: { 5: ['shatter', 'icicle'], 10: ['iceage', 'coldsnap'] } },
  tesla: { name: 'Static Cling', stars: [3, 3, 3, 5], play: 'Lightning jumps through whole crowds. Can power every other weapon you own.', icon: 'TC', elem: 'shock', kind: 'chain', color: '#ffe94a', dir: 'cluster', role: 'Chain Lightning',
    desc: 'Instant lightning that arcs between enemies, like a nylon onesie in winter.',
    base: { dmg: 13, cd: 0.7, mag: 6, reload: 1.8, count: 1, chain: 3, range: 330, jump: 140 },
    lv: { 3: { chain: 2 }, 6: { count: 1 }, 9: { chain: 2 } }, sig: { 5: ['shortcircuit', 'umbilical'], 10: ['overcharge', 'powergrid'] } },
  venom: { name: 'Morning Sickness', stars: [2, 2, 3, 4], play: 'Lobs puddles that keep hurting. Turns the floor into a swamp.', icon: 'VS', elem: 'poison', kind: 'lob', color: '#8dff4a', dir: 'cluster', role: 'Area Denial',
    desc: 'Lobs acid globs that leave toxic puddles. Worse before noon.',
    base: { dmg: 10, cd: 0.9, mag: 4, reload: 1.8, count: 1, spread: 40, range: 390, area: 58, dur: 3, flight: 0.6 },
    lv: { 3: { dur: 0.5 }, 6: { count: 1 }, 9: { area: 0.4 } }, sig: { 5: ['nausea', 'toxicspread'], 10: ['swamp', 'acidreflux'] } },
  parasite: { name: 'Tapeworm Seeder', stars: [2, 3, 3, 3], play: 'Infects, then the dead fight for you as turrets or zombies.', icon: 'PS', elem: 'poison', kind: 'gun', parasite: 1, color: '#b5e48c', dir: 'highhp', style: 'needle', role: 'Necromancer',
    desc: 'Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green.',
    base: { dmg: 12, cd: 0.4, mag: 8, reload: 1.6, count: 1, spread: 0.08, speed: 560, pierce: 0, range: 430, size: 3.5, dur: 8 },
    lv: { 3: { count: 1 }, 6: { dur: 0.5 }, 9: { dmg: 0.4 } }, sig: { 5: ['walkingdead', 'bigworm'], 10: ['brood', 'bodysnatcher'] } },
  seeker: { name: 'Seeker Siblings', stars: [2, 3, 4, 2], play: 'Homing siblings that never miss. They multiply.', icon: 'SS', elem: 'arcane', kind: 'gun', color: '#d0a3ff', dir: 'weakest', style: 'sperm', role: 'Swarm',
    desc: 'Tiny homing siblings who swim for you and never miss. Family is complicated.',
    base: { dmg: 9, cd: 0.45, mag: 6, reload: 2.0, count: 2, spread: 1.2, speed: 320, pierce: 0, range: 500, size: 4, homing: 5 },
    lv: { 3: { count: 1 }, 6: { count: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['bigbrother', 'rivalry'], 10: ['boom', 'reunion'] } },
  void: { name: 'Toddler Gravity', stars: [2, 1, 3, 5], play: 'A slow black hole that drags everything in. Crowd control, then a Big Bang.', icon: 'VO', elem: 'arcane', kind: 'gun', color: '#7b2cbf', dir: 'cluster', style: 'void', role: 'Crowd Control',
    desc: 'A slow orb that drags everything into its mouth. Everything.',
    base: { dmg: 8, cd: 1.8, mag: 2, reload: 2.5, count: 1, spread: 0.2, speed: 115, pierce: 99, range: 400, size: 15, aura: 72, pull: 95 },
    lv: { 3: { area: 0.3 }, 6: { count: 1 }, 9: { dmg: 0.5 } }, sig: { 5: ['horizon', 'nomnom'], 10: ['bigbang', 'parking'] } },
  orbit: { name: 'Premature Evangelation', stars: [3, 4, 1, 3], play: 'Guardian angels circle you and swat whatever comes close. Some eat bullets.', icon: 'OB', elem: 'arcane', kind: 'orbit', color: '#c77dff', dir: 'nearest', role: 'Bodyguard',
    desc: 'These guardian angels get started way too soon.',
    base: { dmg: 23, count: 3, dur: 4.5, reload: 2.2, radius: 72, spin: 3.6, size: 10, range: 100 },
    lv: { 3: { count: 1 }, 6: { area: 0.3 }, 9: { count: 1 } }, sig: { 5: ['nan', 'clingy'], 10: ['extended', 'guilttrip'] } },
  siphon: { name: 'Placental Siphon', stars: [3, 5, 3, 2], play: 'Eats enemy bullets and fires them back. The busier the screen, the stronger it gets.', icon: 'BU', elem: 'arcane', kind: 'siphon', color: '#ff3df2', dir: 'nearest', role: 'Counter',
    desc: 'Eats enemy bullets that come near you and spits them back. No reloads. No ammo either, until the screen is full of bullets.',
    base: { dmg: 18, cd: 0.08, mag: 40, area: 90, speed: 640, range: 460, size: 4.5, pierce: 0, spread: 0.08, count: 1 },
    lv: { 3: { count: 1 }, 6: { pierce: 1 }, 9: { dmg: 0.4 } }, sig: { 5: ['sender', 'buffet'], 10: ['mirrorwomb', 'overflow'] } },
};

// Signature upgrades: only one weapon gets each. Lv 5 picks the weapon's path; Lv 10 is its mastery.
const SIGS = {
  // Spitball
  loogie:      { name: 'Hock a Loogie', desc: 'Every 4th shot is a giant glob: triple damage, pierces everything, and bursts at the end of its flight.' },
  wetwilly:    { name: 'Wet Willy', desc: 'Hits leave enemies Soggy for 3s. Soggy enemies take +30% damage from everything you own.' },
  kidneystone: { name: 'Kidney Stone', desc: 'Mastery. It becomes a railgun: x4 damage, pierces everything, shreds armour, fires half as often.' },
  vomit:       { name: 'Projectile Vomit', desc: 'Mastery. Fires four times as fast in a wide hose. Each droplet deals 45% damage and pierces once.' },
  // Hiccup Scattergun
  pointblank:  { name: 'Point Blank', desc: 'Pellets hit up to +150% harder the closer the target is. Get in their face.' },
  slug:        { name: 'Slug', desc: 'All the pellets fuse into one heavy slug (90% of their total damage) that pierces 3 enemies and bowls them over.' },
  hiccupfit:   { name: 'Hiccup Fit', desc: 'Mastery. Every 3rd blast is a full ring of pellets around you that also wipes out nearby enemy bullets.' },
  dragonbreath:{ name: "Dragon's Breath", desc: 'Mastery. Pellets turn to fire, set enemies alight and leave small burning puddles where they land.' },
  // Yo-Yo Diet
  walkdog:     { name: 'Walk the Dog', desc: 'At full reach the yo-yo spins in place for a second, grinding everything it touches, then comes home.' },
  crashdiet:   { name: 'Crash Diet', desc: 'The yo-yo grows every time it hits something: +10% size and damage per hit, every throw.' },
  aroundworld: { name: 'Around the World', desc: 'Mastery. Three yo-yos per throw, and every catch heals you a little for each enemy it hit.' },
  blackyoyo:   { name: 'Black Hole Yo-Yo', desc: 'Mastery. At full reach it becomes a gravity well for 1.5s, then snaps home dragging its catch with it.' },
  // Slipstream Scalpel
  closeloop:   { name: 'Closing the Loop', desc: 'Swim a loop around enemies and everything inside it takes a massive cut. Try the ORBIT autorun.' },
  razorwire:   { name: 'Razor Wire', desc: 'The trail lasts twice as long and slows whatever swims through it.' },
  surgicalteam:{ name: 'Surgical Team', desc: 'Mastery. Two ghost scalpels circle you, each cutting its own trail.' },
  afterburner: { name: 'Afterburner', desc: 'Mastery. The trail catches fire, and the faster you swim the hotter it burns (up to x2.5).' },
  // Heartburn
  blueflame:   { name: 'Blue Flame', desc: 'Narrow and long: +70% range, a tight cone and +40% damage.' },
  indigestion: { name: 'Indigestion', desc: 'Burning enemies explode in flames when they die, spreading the burn to everything nearby.' },
  dragon:      { name: 'Dragon', desc: 'Mastery. Twice the flames, sweeping a full circle around you, forever.' },
  hellkitchen: { name: "Hell's Kitchen", desc: 'Mastery. It never reloads, and the damage climbs the longer you keep firing (up to x3). Cools off when idle.' },
  // Nappy Mines
  domino:      { name: 'Domino Nappies', desc: 'A blast sets off every mine near it, and each one in the chain goes off 25% bigger than the last.' },
  sticky:      { name: 'Sticky Nappies', desc: 'Mines are thrown onto enemies and stick to them, going off 1.2s later.' },
  nuclear:     { name: 'Nuclear Nappy', desc: 'Mastery. Every 6th mine is a nuke: three times the blast radius and six times the damage.' },
  minefield:   { name: 'Minefield', desc: 'Mastery. Three mines per drop, twice as often, and they last twice as long.' },
  // Cold Feet
  shatter:     { name: 'Shatter', desc: 'A shard that hits a frozen enemy shatters it for 250% damage in an icy burst.' },
  icicle:      { name: 'Icicle Lance', desc: '+4 pierce, and each enemy a shard passes through makes it 25% stronger.' },
  iceage:      { name: 'Ice Age', desc: 'Mastery. Shards leave frost patches behind that freeze anything that swims through.' },
  coldsnap:    { name: 'Cold Snap', desc: 'Mastery. Every 4s a freezing blast around you freezes every non-boss enemy within reach.' },
  // Static Cling
  shortcircuit:{ name: 'Short Circuit', desc: '+3 jumps, and the lightning can bounce back to enemies it already hit. Brutal on big targets.' },
  umbilical:   { name: 'Umbilical Cord', desc: 'The first two enemies in each chain get tied together with lightning and slammed into each other.' },
  overcharge:  { name: 'Overcharge', desc: 'Mastery. Every jump hits 20% harder than the last, instead of weaker.' },
  powergrid:   { name: 'Power Grid', desc: 'Mastery. 15% of hits from all your other weapons set off a Static Cling chain.' },
  // Morning Sickness
  nausea:      { name: 'Nausea', desc: 'Enemies in a puddle are slowed by 45% and deal 40% less damage.' },
  toxicspread: { name: 'Toxic Spread', desc: 'Enemies that die in a puddle leave a new puddle behind.' },
  swamp:       { name: 'Swamp', desc: 'Mastery. Puddles last four times as long and slowly spread.' },
  acidreflux:  { name: 'Acid Reflux', desc: 'Mastery. When you get hit, you throw up eight puddles in a ring around you.' },
  // Tapeworm Seeder
  walkingdead: { name: 'Walking Dead', desc: 'Infected corpses get back up as zombie allies for 12s instead of turrets (up to 14 at once).' },
  bigworm:     { name: 'Big Worm', desc: 'Turrets last twice as long, fire 50% faster and hit twice as hard.' },
  brood:       { name: 'Brood', desc: 'Mastery. The infection spreads: every infected death infects the three nearest enemies.' },
  bodysnatcher:{ name: 'Body Snatcher', desc: 'Mastery. Elites killed while infected become permanent allies (three at most).' },
  // Seeker Siblings
  bigbrother:  { name: 'Big Brother', desc: 'One sibling in every volley is huge: four times the size and damage, and pierces 3.' },
  rivalry:     { name: 'Sibling Rivalry', desc: 'Every kill adds a sibling to your volleys (up to +8). Reloading makes them all settle down again.' },
  boom:        { name: 'Population Boom', desc: 'Mastery. Every sibling splits into two more homing siblings on its first hit.' },
  reunion:     { name: 'Family Reunion', desc: 'Mastery. Siblings that miss swim back to circle you, eating bullets, then launch again.' },
  // Toddler Gravity
  horizon:     { name: 'Event Horizon', desc: 'Non-boss enemies under 20% health that get dragged into the centre are swallowed whole.' },
  nomnom:      { name: 'Nom Nom', desc: 'The orb eats enemy bullets, growing with every one (up to twice its size).' },
  bigbang:     { name: 'Big Bang', desc: 'Mastery. When an orb ends it explodes for half of all the damage it dealt.' },
  parking:     { name: 'Tantrum Parking', desc: 'Mastery. The orb parks wherever it catches 4 enemies, pulls 2.5 times harder and lasts twice as long.' },
  // Premature Evangelation
  nan:         { name: 'Protective Nan', desc: 'The angels eat any enemy bullet they touch.' },
  clingy:      { name: 'Clingy', desc: 'The angels never take a break, but hit 25% softer.' },
  extended:    { name: 'Extended Family', desc: 'Mastery. A second ring of angels spins the other way at double the distance.' },
  guilttrip:   { name: 'Guilt Trip', desc: 'Mastery. Enemies they hit feel guilty for 4s: slowed by 40% and taking +35% damage from everything.' },
  // Placental Siphon
  sender:      { name: 'Return to Sender', desc: 'Returned shots home in on whoever fired them, and hit them three times as hard.' },
  buffet:      { name: 'Bullet Buffet', desc: '+40% absorb radius, and every bullet eaten heals you a little.' },
  mirrorwomb:  { name: 'Mirror Womb', desc: 'Mastery. 30% of enemy bullets that reach you bounce back at whoever fired them.' },
  overflow:    { name: 'Overflow', desc: 'Mastery. When the store fills up, it all bursts out in a ring of returned bullets.' },
};

// Pairings: secret combos between two weapons you own (both Lv 5+). Found by playing; listed in the Codex once found.
const PAIRINGS = [
  { a: 'tesla',    b: 'mines',    id: 'monitor',   name: 'Baby Monitor Network', desc: 'Lightning jumping through a crowd sets off any Nappy Mine near its path.' },
  { a: 'flamer',   b: 'frost',    id: 'hotcold',   name: 'Hot Flush, Cold Sweat', desc: 'Thermal Shock and Steam Burst reactions have no cooldown and hit twice as hard.' },
  { a: 'glaive',   b: 'void',     id: 'tetherball', name: 'Tetherball', desc: 'Yo-yos drag enemies back towards you on every throw.' },
  { a: 'seeker',   b: 'parasite', id: 'familytree', name: 'Family Tree', desc: 'Tapeworm turrets fire homing Seeker Siblings.' },
  { a: 'siphon',   b: 'orbit',    id: 'overprotective', name: 'Overprotective', desc: 'The angels catch enemy bullets and feed them into the Siphon.' },
  { a: 'wake',     b: 'venom',    id: 'nappytrail', name: 'Nappy Trail', desc: 'Your scalpel trail oozes poison that stacks.' },
  { a: 'blaster',  b: 'tesla',    id: 'conductive', name: 'Conductive Spit', desc: 'Spat-on enemies are wet: lightning deals double damage to them.' },
  { a: 'shotgun',  b: 'void',     id: 'suckerpunch', name: 'Sucker Punch', desc: 'Enemies caught in a gravity orb take double damage from the Scattergun.' },
  { a: 'frost',    b: 'void',     id: 'snowglobe', name: 'Snow Globe', desc: 'Gravity orbs chill everything they hold and freeze it solid.' },
  { a: 'orbit',    b: 'flamer',   id: 'bbq',       name: 'Family BBQ', desc: 'The angels are on fire. Everything they touch catches.' },
  { a: 'seeker',   b: 'glaive',   id: 'yoyosibs',  name: 'Sibling Yo-Yo', desc: 'Every yo-yo hit launches a Seeker Sibling.' },
  { a: 'parasite', b: 'venom',    id: 'petri',     name: 'Petri Dish', desc: 'Anything that dies in a puddle was infected all along.' },
  { a: 'tesla',    b: 'siphon',   id: 'discharge', name: 'Static Discharge', desc: 'Every 12 bullets the Siphon eats fires a Static Cling chain at four enemies.' },
  { a: 'wake',     b: 'mines',    id: 'trailmix',  name: 'Trail Mix', desc: 'Your scalpel trail drops a Nappy Mine every 1.5s.' },
];
const PAIR_LEVEL = 5;

// Fusions were retired in favour of Pairings (both weapons stay).
const MERGES = [];
const MERGE_MIN_LEVEL = 4;

// Spells: autocast on cooldown, occupy spell slots.
const SPELLS = {
  meteor: { name: 'Stork Drop', icon: 'ME', elem: 'fire', kind: 'strike', color: '#ff5400', dir: 'cluster',
    desc: 'A stork drops something heavy on the target and leaves burning ground. Not a baby.',
    base: { dmg: 65, cd: 5, count: 1, area: 88, delay: 0.7, range: 520, dur: 2 },
    lv: { 3: { count: 1 }, 5: { area: 0.3 }, 7: { count: 1 } } },
  frostnova: { name: 'Cold Shower', icon: 'FN', elem: 'ice', kind: 'nova', color: '#90e0ef', dir: 'nearest',
    desc: 'A freezing blast around you. Erases enemy bullets, and enthusiasm.',
    base: { dmg: 22, cd: 7, area: 165, range: 170 },
    lv: { 3: { area: 0.2 }, 5: { dmg: 0.5 }, 7: { cd: -0.25 } } },
  thunder: { name: 'Brainstorm', icon: 'TS', elem: 'shock', kind: 'thunder', color: '#fdf0d5', dir: 'strongest',
    desc: 'Lightning strikes several targets at once. None of the ideas are good.',
    base: { dmg: 36, cd: 6, count: 5, area: 48, range: 520 },
    lv: { 3: { count: 2 }, 5: { dmg: 0.4 }, 7: { count: 3 } } },
  blackhole: { name: 'Sofa Crevice', icon: 'BH', elem: 'arcane', kind: 'zone', color: '#7209b7', dir: 'cluster',
    desc: 'Tears open a singularity that drags and crushes. Everything you ever lost is in there.',
    base: { dmg: 16, cd: 10, area: 125, dur: 3, pull: 210, range: 460 },
    lv: { 3: { dur: 0.3 }, 5: { area: 0.3 }, 7: { dmg: 0.6 } } },
  heal: { name: 'Kiss It Better', icon: 'RJ', elem: 'poison', kind: 'heal', color: '#80ffdb', dir: 'nearest', noTarget: 1,
    desc: 'Restores a portion of your health. Medically dubious. Works anyway.',
    base: { dmg: 0.15, cd: 14, range: 0 },
    lv: { 3: { cd: -0.15 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
  warp: { name: 'Nap Time', icon: 'TW', elem: 'arcane', kind: 'warp', color: '#b8c0ff', dir: 'nearest', noTarget: 1,
    desc: 'Slows every enemy and bullet to a crawl. Rare. Precious. Over too soon.',
    base: { dmg: 0, cd: 16, dur: 3, range: 0 },
    lv: { 3: { dur: 0.3 }, 5: { cd: -0.2 }, 7: { dur: 0.4 } } },
  barrier: { name: 'Latex Barrier', icon: 'AE', elem: 'arcane', kind: 'barrier', color: '#48cae4', dir: 'nearest', noTarget: 1,
    desc: 'A shield that reflects enemy bullets and blocks contact. 98% effective.',
    base: { dmg: 12, cd: 12, dur: 3, area: 80, range: 0 },
    lv: { 3: { dur: 0.35 }, 5: { area: 0.3 }, 7: { cd: -0.25 } } },
  bladestorm: { name: 'Running With Scissors', icon: 'BS', elem: 'phys', kind: 'ring', color: '#e9ecef', dir: 'nearest', noTarget: 1,
    desc: 'Explodes a ring of blades outward. You were told.',
    base: { dmg: 19, cd: 6, count: 16, speed: 460, pierce: 3, range: 360, size: 6 },
    lv: { 3: { count: 8 }, 5: { pierce: 3 }, 7: { dmg: 0.5 } } },
  cloud: { name: 'Dutch Oven', icon: 'PC', elem: 'poison', kind: 'zone', color: '#9ef01a', dir: 'cluster',
    desc: 'A drifting cloud of stacking poison. You know what you did.',
    base: { dmg: 11, cd: 9, area: 115, dur: 5, pull: 0, range: 460 },
    lv: { 3: { dur: 0.4 }, 5: { area: 0.3 }, 7: { dmg: 0.6 } } },
  sentry: { name: 'Baby Monitor', icon: 'SN', elem: 'shock', kind: 'sentry', color: '#ffd60a', dir: 'nearest', noTarget: 1,
    desc: 'Deploys a turret that watches and shoots using this directive. Static included.',
    base: { dmg: 9, cd: 13, count: 1, dur: 10, rate: 0.25, range: 400 },
    lv: { 3: { dur: 0.3 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
};

const RARITIES = [
  { id: 'common',    name: 'Bronze',    color: '#cd8a4a', mult: 1,   lvls: 1, w: 60 },
  { id: 'rare',      name: 'Silver',    color: '#c9d6e3', mult: 1.5, lvls: 1, w: 27 },
  { id: 'epic',      name: 'Gold',      color: '#ffd23f', mult: 2,   lvls: 2, w: 10 },
  { id: 'legendary', name: 'Legendary', color: '#ff3df2', mult: 3,   lvls: 3, w: 3 },
];

// Passive power-ups. v = value per stack at common rarity; rarity multiplies it.
const PASSIVES = {
  might:     { name: 'Protein Shake',            icon: 'MT', max: 8, v: 0.12, fmt: v => `+${pc(v)} damage`, apply: (P, v) => { P.might += v; } },
  haste:     { name: 'Twitchy Tail', icon: 'TD', max: 8, v: 0.10, fmt: v => `+${pc(v)} fire rate`, apply: (P, v) => { P.haste += v; } },
  reload:    { name: 'Short Refractory Period',      icon: 'QH', max: 6, v: 0.15, fmt: v => `+${pc(v)} reload speed`, apply: (P, v) => { P.reloadSpd += v; } },
  mag:       { name: 'Bigger Load',    icon: 'EM', max: 6, v: 0.20, fmt: v => `+${pc(v)} magazine size`, apply: (P, v) => { P.magMult += v; } },
  multishot: { name: 'Split Personality',        icon: 'MS', max: 3, v: 1, minRarity: 2, fmt: v => `+${Math.round(v)} projectile for all weapons`, apply: (P, v) => { P.multishot += Math.round(v); } },
  velocity:  { name: 'Early Arrival',         icon: 'VE', max: 5, v: 0.12, fmt: v => `+${pc(v)} projectile speed and range`, apply: (P, v) => { P.projSpeed += v; P.range += v * 0.6; } },
  area:      { name: 'Personal Space',     icon: 'BR', max: 6, v: 0.12, fmt: v => `+${pc(v)} area of effect`, apply: (P, v) => { P.area += v; } },
  duration:  { name: 'Stamina',        icon: 'LG', max: 5, v: 0.15, fmt: v => `+${pc(v)} effect duration`, apply: (P, v) => { P.dur += v; } },
  pierce:    { name: 'Pushy',       icon: 'PN', max: 4, v: 1, fmt: v => `+${Math.round(v)} pierce`, apply: (P, v) => { P.pierce += Math.round(v); } },
  crit:      { name: 'Sharp Elbows',          icon: 'DE', max: 6, v: 0.05, fmt: v => `+${pc(v)} crit chance`, apply: (P, v) => { P.crit += v; } },
  critdmg:   { name: 'Low Blow',      icon: 'EX', max: 6, v: 0.25, fmt: v => `+${pc(v)} crit damage`, apply: (P, v) => { P.critDmg += v; } },
  vital:     { name: 'Thick Skin',       icon: 'VC', max: 8, v: 15, fmt: v => `+${Math.round(v)} max HP (and heal it)`, apply: (P, v, G) => { P.maxHp += Math.round(v); G.player.hp += Math.round(v); } },
  regen:     { name: 'Pregnancy Vitamins',          icon: 'NA', max: 5, v: 0.3, fmt: v => `+${v.toFixed(1)} HP/sec regen`, apply: (P, v) => { P.regen += v; } },
  grip:      { name: 'Sticky Cilia',     icon: 'SC', max: 5, v: 0.22, fmt: v => `+${pc(v)} traction: sharper turns, less drift`, apply: (P, v) => { P.traction += v; } },
  hydro:     { name: 'Hydrodynamic Head', icon: 'HH', max: 3, v: 0.12, fmt: v => `+${pc(v)} traction and +${pc(v / 2)} swim speed`, apply: (P, v) => { P.traction += v; P.speed += v / 2; } },
  speed:     { name: 'Leg Day (Tail Day)',    icon: 'SP', max: 5, v: 0.08, fmt: v => `+${pc(v)} move speed`, apply: (P, v) => { P.speed += v; } },
  magnet:    { name: 'Clingy',    icon: 'TF', max: 5, v: 0.3, fmt: v => `+${pc(v)} pickup range`, apply: (P, v) => { P.magnet += v; } },
  armour:    { name: 'Shell Suit',          icon: 'PT', max: 6, v: 1, fmt: v => `+${Math.round(v)} armour (flat damage reduction)`, apply: (P, v) => { P.armour += Math.round(v); } },
  luck:      { name: 'Lucky Swimmer',          icon: 'FO', max: 5, v: 0.15, fmt: v => `+${pc(v)} luck (rarer loot, more drops)`, apply: (P, v) => { P.luck += v; } },
  vamp:      { name: 'Leech Mode',  icon: 'VR', max: 5, v: 0.08, fmt: v => `Heal ${v.toFixed(2)} HP per kill`, apply: (P, v) => { P.lifesteal += v; } },
  pyro:      { name: 'Hot-Blooded',        icon: 'PY', max: 5, v: 0.25, fmt: v => `+${pc(v)} fire damage and burn`, apply: (P, v) => { P.elem.fire += v; } },
  cryo:      { name: 'Cold-Blooded',        icon: 'CY', max: 5, v: 0.25, fmt: v => `+${pc(v)} frost damage and chill`, apply: (P, v) => { P.elem.ice += v; } },
  storm:     { name: 'Static Hair',      icon: 'SC', max: 5, v: 0.25, fmt: v => `+${pc(v)} shock damage, +1 chain`, apply: (P, v) => { P.elem.shock += v; P.chain += 1; } },
  toxin:     { name: 'Bad Breath',       icon: 'TX', max: 5, v: 0.25, fmt: v => `+${pc(v)} poison damage, +3 max stacks`, apply: (P, v) => { P.elem.poison += v; P.poisonCap += 3; } },
  arcanum:   { name: 'Weird Aura',          icon: 'AR', max: 5, v: 0.25, fmt: v => `+${pc(v)} arcane damage`, apply: (P, v) => { P.elem.arcane += v; } },
  kinetic:   { name: 'Headbutt Training',       icon: 'BA', max: 5, v: 0.25, fmt: v => `+${pc(v)} kinetic damage`, apply: (P, v) => { P.elem.phys += v; } },
  catalyst:  { name: 'Chemistry',         icon: 'CT', max: 5, v: 0.35, fmt: v => `+${pc(v)} elemental reaction damage`, apply: (P, v) => { P.react += v; } },
  echo:      { name: 'Repeat Prescription',       icon: 'SE', max: 5, v: 0.10, fmt: v => `-${pc(v)} spell cooldowns`, apply: (P, v) => { P.cdr = Math.max(0.4, P.cdr - v); } },
  scholar:   { name: 'Antenatal Classes',          icon: 'SH', max: 5, v: 0.12, fmt: v => `+${pc(v)} experience gained`, apply: (P, v) => { P.xp += v; } },
  temporal:  { name: 'Snooze Button',    icon: 'TL', max: 3, v: 1, minRarity: 1, fmt: () => `+1 max Rewind charge, +25% Chrono energy`, apply: (P, v, G) => { G.chrono.max += 1; P.chronoGain += 0.25; } },
  salvage:   { name: 'Hand-Me-Downs',         icon: 'SV', max: 5, needsScrap: 1, v: 0.25, fmt: v => `+${pc(v)} scrap from kills`, apply: (P, v) => { P.scrap += v; } },
  lastround: { name: 'Last Word',        icon: 'LW', max: 3, v: 1, fmt: v => `Last bullet of every magazine deals x${3 + Math.round(v)} damage and explodes`, apply: (P, v) => { P.lastRound += Math.round(v); } },
  tactical:  { name: 'Tactical Nap',  icon: 'TR', max: 4, v: 1, fmt: v => `Starting a reload sends out a shockwave that deletes nearby bullets (+${40 * Math.round(v)} radius)`, apply: (P, v) => { P.tactical += Math.round(v); } },
  focus:     { name: 'Tunnel Vision',       icon: 'FL', max: 3, v: 0.3, fmt: v => `+3% damage per second on the same target, up to +${pc(v)} more`, apply: (P, v) => { P.focus += v; } },
  overkill:  { name: 'Overachiever', icon: 'OK', max: 3, v: 0.5, fmt: v => `${pc(v)} of excess kill damage jumps to the next enemy`, apply: (P, v) => { P.overkill += v; } },
  crossfire: { name: 'Pincer Movement', icon: 'CF', max: 3, v: 0.25, fmt: v => `Weapons sharing a target: +${pc(v)} damage. All three on different targets: +${pc(v)} fire rate`, apply: (P, v) => { P.crossfire += v; } },
  momentum:  { name: 'Hurry Up',         icon: 'MO', max: 4, v: 0.15, fmt: v => `Up to +${pc(v * 1.5)} damage the faster you are moving`, apply: (P, v) => { P.momentum += v; } },
  anchorlink:{ name: 'Egg Bond',         icon: 'EB', max: 3, v: 0.3, fmt: v => `Near the egg: +${pc(v)} fire rate. Away from it: +${pc(v)} crit chance`, apply: (P, v) => { P.anchorLink += v; } },
  future:    { name: 'Spoilers',    icon: 'FU', max: 4, v: 0.1, fmt: v => `${pc(v)} of shots appear already next to their target`, apply: (P, v) => { P.future += v; } },
  echoinherit: { name: 'Inheritance', icon: 'EI', max: 1, v: 1, minRarity: 1, fmt: () => `Paradox Echoes also cast your spells and last twice as long`, apply: (P) => { P.echoInherit = 1; } },
  evasion:   { name: 'Wriggle Room',          icon: 'EV', max: 5, v: 0.04, fmt: v => `+${pc(v)} chance to dodge hits`, apply: (P, v) => { P.dodge = Math.min(0.5, P.dodge + v); } },
};
function pc(v) { return Math.round(v * 100) + '%'; }

// Element reactions (triggered when an element hits an enemy already carrying another status).
const REACTIONS = {
  thermal:   { name: 'THERMAL SHOCK', color: '#ff9e9e', desc: 'Fire on a chilled/frozen enemy: big burst damage' },
  steam:     { name: 'STEAM BURST',   color: '#e0fbfc', desc: 'Frost on a burning enemy: scalding area blast' },
  combust:   { name: 'COMBUSTION',    color: '#ffba08', desc: 'Fire on a poisoned enemy: poison stacks explode' },
  toxicarc:  { name: 'TOXIC ARC',     color: '#d4ff5c', desc: 'Shock on a poisoned enemy: poison spreads to neighbours' },
  supercon:  { name: 'SUPERCONDUCT',  color: '#bde0fe', desc: 'Shock on a chilled enemy: armour shredded' },
  resonance: { name: 'RESONANCE',     color: '#e0aaff', desc: 'Arcane on any status: bonus damage, mark spreads' },
  overload:  { name: 'OVERLOAD',      color: '#fff3b0', desc: 'Fire on a shocked enemy: lightning explosion' },
};

// Elemental synergy set bonuses: owning N weapons/spells of one element.
const SYNERGIES = {
  phys:   { name: 'Gunslinger',  desc: '+15% fire rate for kinetic weapons' },
  fire:   { name: 'Pyromaniac',  desc: 'Burns last longer and deal +50% damage' },
  ice:    { name: 'Permafrost',  desc: 'Freeze threshold halved, frozen take +25%' },
  shock:  { name: 'Conductor',   desc: 'Shocked enemies arc twice as often' },
  poison: { name: 'Plaguebringer', desc: 'Poison ticks twice as fast' },
  arcane: { name: 'Arcanist',    desc: 'Marks amplify damage by +50% instead of +30%' },
};

// Enemies. from = seconds before they can spawn, w = spawn weight.
const ENEMIES = {
  // Rival swimmers (they have tails) and the host's immune system (they have opinions).
  crawler:  { name: 'Rival Swimmer', hp: 14, speed: 64, armour: 0, r: 12, dmg: 8, xp: 1, color: '#f4ecd8', shape: 'sperm', ai: 'chase', from: 0, w: 10 },
  skitter:  { name: 'Sprinter', hp: 6, speed: 125, armour: 0, r: 8, dmg: 5, xp: 1, color: '#ffd6a5', shape: 'sperm', ai: 'chase', from: 15, w: 7 },
  spitter:  { name: 'Antibody', hp: 20, speed: 58, armour: 0, r: 13, dmg: 6, xp: 3, color: '#ffd23f', shape: 'antibody', ai: 'ranged', from: 35, w: 4,
    shoot: { pattern: 'aimed', cd: 2.6, speed: 170, dmg: 6 } },
  brute:    { name: 'Macrophage', hp: 60, speed: 44, armour: 3, r: 20, dmg: 16, xp: 4, color: '#ff8fab', shape: 'cell', ai: 'chase', from: 55, w: 4 },
  bomber:   { name: 'Acid Bubble', hp: 16, speed: 98, armour: 0, r: 12, dmg: 18, xp: 2, color: '#b8f35a', shape: 'spike', ai: 'bomber', from: 100, w: 3 },
  splitter: { name: 'Mitotic Cell', hp: 42, speed: 52, armour: 0, r: 17, dmg: 10, xp: 3, color: '#43e97b', shape: 'cell', ai: 'chase', from: 85, w: 3, split: 'splitling' },
  splitling:{ name: 'Daughter Cell', hp: 12, speed: 92, armour: 0, r: 9, dmg: 5, xp: 1, color: '#7af5a8', shape: 'cell', ai: 'chase', from: 99999, w: 0 },
  // Tiny krill: shoals of flick-swimming crustaceans that dart in bursts. Nobody knows how they got in here.
  krill:    { name: 'Krill', hp: 5, speed: 140, armour: 0, r: 10, dmg: 3, xp: 0.5, color: '#b9ad9c', shape: 'krill', ai: 'krill', from: 45, w: 2, group: 12 },
  wisp:     { name: 'Spermlet Swarm', hp: 4, speed: 145, armour: 0, r: 6, dmg: 4, xp: 0.5, color: '#fee9a0', shape: 'sperm', ai: 'chase', from: 95, w: 2, group: 9 },
  blinker:  { name: 'Quantum Swimmer', hp: 22, speed: 72, armour: 0, r: 12, dmg: 9, xp: 3, color: '#00f5d4', shape: 'sperm', ai: 'blink', from: 105, w: 2 },
  medic:    { name: 'Nurse Cell', hp: 30, speed: 56, armour: 1, r: 13, dmg: 6, xp: 4, color: '#7bed9f', shape: 'cross', ai: 'medic', from: 120, w: 2 },
  charger:  { name: 'Headbutter', hp: 50, speed: 56, armour: 2, r: 16, dmg: 18, xp: 4, color: '#ffb4a2', shape: 'sperm', ai: 'charge', from: 130, w: 3 },
  bulwark:  { name: 'Mucus Wall', hp: 95, speed: 40, armour: 8, r: 20, dmg: 14, xp: 6, color: '#c9d6e3', shape: 'cell', ai: 'aura', from: 150, w: 2 },
  warlock:  { name: 'Cytokine Caster', hp: 45, speed: 46, armour: 1, r: 15, dmg: 8, xp: 6, color: '#9b5de5', shape: 'star', ai: 'ranged', from: 170, w: 2,
    shoot: { pattern: 'ring', count: 8, cd: 3.2, speed: 140, dmg: 9 } },
  phantom:  { name: 'Ghost Swimmer', hp: 35, speed: 82, armour: 0, r: 13, dmg: 10, xp: 5, color: '#caf0f8', shape: 'sperm', ai: 'phase', from: 195, w: 2 },
  summoner: { name: 'Mother Cell', hp: 75, speed: 40, armour: 2, r: 18, dmg: 10, xp: 8, color: '#ff6fa8', shape: 'cell', ai: 'summon', from: 210, w: 1.2 },
  spire:    { name: 'Enzyme Spire', hp: 85, speed: 16, armour: 4, r: 18, dmg: 10, xp: 8, color: '#ff006e', shape: 'hex', ai: 'turret', from: 240, w: 1.5,
    shoot: { pattern: 'spiral', cd: 0.16, speed: 125, dmg: 7 } },
  lancer:   { name: 'Killer T-Cell', hp: 26, speed: 52, armour: 0, r: 13, dmg: 6, xp: 5, color: '#ff99c8', shape: 'antibody', ai: 'ranged', from: 260, w: 1.5,
    shoot: { pattern: 'snipe', cd: 3.6, speed: 430, dmg: 16 } },
  // Spongy engulfers: slow, tough, knockback-proof, and they eat other monsters to grow (up to 'max' radius).
  amoeba:   { name: 'Amoeba', hp: 150, speed: 30, armour: 1, r: 30, dmg: 14, xp: 10, color: '#7fd8b0', shape: 'amoeba', ai: 'engulf', from: 70, w: 0.9, spongy: true, max: 175 },
  plasmod:  { name: 'Plasmodium', hp: 380, speed: 22, armour: 3, r: 42, dmg: 22, xp: 24, color: '#e9c46a', shape: 'amoeba', ai: 'engulf', from: 240, w: 0.7, spongy: true, max: 210, split: 'amoeba' },
  // More of the pond: a wriggling worm, a glass-shelled turret, a near-indestructible water bear, a ciliate
  // that swims in straight lines and backs off when it bumps you, a rotifer that hoovers up your XP, and a
  // Volvox colony that bursts into daughter colonies.
  pinworm:  { name: 'Pinworm', hp: 70, speed: 60, armour: 1, r: 11, dmg: 12, xp: 5, color: '#e8e2d6', shape: 'worm', ai: 'chase', from: 140, w: 1.6 },
  diatom:   { name: 'Diatom', hp: 55, speed: 24, armour: 6, r: 16, dmg: 8, xp: 6, color: '#cfe0d8', shape: 'diatom', ai: 'ranged', from: 180, w: 1.4,
    shoot: { pattern: 'ring', count: 6, cd: 2.8, speed: 150, dmg: 8 } },
  waterbear:{ name: 'Water Bear', hp: 240, speed: 30, armour: 10, r: 22, dmg: 20, xp: 14, color: '#d9cdb8', shape: 'tardigrade', ai: 'chase', from: 270, w: 0.8, heavy: true, tun: true },
  paramecium:{ name: 'Paramecium', hp: 30, speed: 105, armour: 0, r: 13, dmg: 10, xp: 4, color: '#dfe6d2', shape: 'slipper', ai: 'ciliate', from: 75, w: 2 },
  rotifer:  { name: 'Rotifer', hp: 40, speed: 50, armour: 1, r: 14, dmg: 8, xp: 5, color: '#e3dccb', shape: 'rotifer', ai: 'thief', from: 110, w: 1.4 },
  volvox:   { name: 'Volvox', hp: 110, speed: 34, armour: 2, r: 26, dmg: 14, xp: 8, color: '#c8d9b8', shape: 'volvox', ai: 'chase', from: 160, w: 1.1, split: 'volvoxling', splitN: 4 },
  volvoxling:{ name: 'Daughter Colony', hp: 26, speed: 62, armour: 0, r: 12, dmg: 6, xp: 2, color: '#c8d9b8', shape: 'volvox', ai: 'chase', from: 99999, w: 0 },
  // Yeast infection (Candida): only arrives as an infection event. Each cell buds a daughter every few
  // seconds, joined by a pseudohypha, so an ignored colony doubles and doubles. Sticky to swim through.
  yeast:    { name: 'Candida', hp: 18, speed: 22, armour: 0, r: 11, dmg: 5, xp: 1, color: '#e4dcc8', shape: 'yeast', ai: 'yeast', from: 99999, w: 0 },
  pepsinjr: { name: 'Pepsinator Jr', hp: 60, speed: 72, armour: 0, r: 24, dmg: 14, xp: 6, color: '#b8f35a', shape: 'amoeba', ai: 'chase', from: 99999, w: 0 },
  juggernaut: { name: 'Alpha Swimmer', hp: 420, speed: 34, armour: 12, r: 28, dmg: 30, xp: 20, color: '#d4c1a4', shape: 'sperm', ai: 'chase', from: 300, w: 0.6 },
};

// Bosses: eight in the ward, four per run, drawn at random. Each has a personality, strengths you have to
// respect, weaknesses you can exploit (weak/resist: damage multipliers by element; weakAoe: blasts and pools),
// and three relics themed on it. Beat it and you choose one: they are meant to define a build.
const BOSSES = [
  { id: 'queen', name: 'THE MACROPHAGE QUEEN', title: 'Eater of Hopefuls', shape: 'cell', color: '#ff4d8d',
    hp: 2600, speed: 46, armour: 2, r: 50, dmg: 25, xp: 60, patterns: ['summon', 'devour', 'spiral', 'aimedFan'],
    quote: 'Oh good. Dessert swam in.',
    desc: 'A white blood cell who ate her way to the top. She summons swarms, then swallows them to heal.',
    strengths: ['Devours her own minions to heal', 'Summons swarms of swimmers'], weaknesses: ['Fire: +60% damage', 'Slow: kite her and clear the snacks'],
    weak: { fire: 1.6 }, relics: ['secondstomach', 'swallow', 'court'] },
  { id: 'colossus', name: 'THE ANTIBODY COLOSSUS', title: 'Head of Border Control', shape: 'antibody', color: '#ffd23f',
    hp: 3800, speed: 36, armour: 12, r: 56, dmg: 35, xp: 90, patterns: ['ring', 'charge', 'aimedFan', 'charge'],
    quote: 'Papers. Now. No, those are not papers. Those are bullets.',
    desc: 'A Y-shaped wall of protein. Heavily armoured, cannot be moved or frozen, and charges in straight lines.',
    strengths: ['12 armour: small hits barely scratch it', 'Cannot be knocked back or frozen'], weaknesses: ['Shock: +60% damage', 'Armour shred sticks for longer', 'Charges are telegraphed: side-step'],
    weak: { shock: 1.6 }, shredStick: true, relics: ['borderwall', 'bouncer', 'diplomatic'] },
  { id: 'eye', name: 'THE IMMUNE EYE', title: 'Unblinking Critic of Your Genome', shape: 'eye', color: '#7b2cbf',
    hp: 3400, speed: 52, armour: 4, r: 48, dmg: 30, xp: 80, patterns: ['blink', 'glare', 'flower', 'glare', 'doubleSpiral'],
    quote: "I've read your genome. I've seen better genomes on a crouton.",
    desc: 'It teleports next to you, then glares: a beam that follows you around. While it glares, it cannot blink.',
    strengths: ['Teleports right next to you', 'Death-stare beam that tracks you'], weaknesses: ['Takes double damage while glaring', 'Arcane: +50% damage'],
    weak: { arcane: 1.5 }, relics: ['thirdeye', 'deathstare', 'precog'] },
  { id: 'matron', name: 'THE MATRON', title: 'Head of Ward Nine', shape: 'cross', color: '#7bed9f',
    hp: 3000, speed: 40, armour: 3, r: 46, dmg: 24, xp: 80, patterns: ['wardround', 'aimedFan', 'ring', 'wardround', 'spiral'],
    quote: 'Visiting hours are over. Forever.',
    desc: 'Runs the ward with an iron bedpan. Heals every enemy on screen and hides behind a ring of nurses.',
    strengths: ['Heals every enemy nearby on her rounds', 'Nurse cells orbit her and soak your shots'], weaknesses: ['Poison: +60%, and halves her healing', 'Kill her nurses: she panics and takes +50%'],
    weak: { poison: 1.6 }, relics: ['bedside', 'triage', 'transfusion'] },
  { id: 'pepsin', name: 'THE PEPSINATOR', title: 'Acid Reflux Incarnate', shape: 'amoeba', color: '#b8f35a',
    hp: 3600, speed: 44, armour: 0, r: 54, dmg: 28, xp: 85, patterns: ['acidrain', 'ring', 'acidrain', 'spiral'],
    quote: "Everything dissolves eventually. You're just early.",
    desc: 'A blob of stomach acid with ambitions. Rains acid puddles and splits off smaller blobs when hurt.',
    strengths: ['Acid puddles burn you', 'Splits off blobs at 60% and 30% health'], weaknesses: ['Frost: +60% damage', 'Blasts and pools: +40% damage'],
    weak: { ice: 1.6 }, weakAoe: 1.4, relics: ['corrosive', 'acidblood', 'ulcer'] },
  { id: 'alpha', name: 'CHAD PRIME', title: 'Tail Day, Every Day', shape: 'sperm', color: '#d4c1a4',
    hp: 3000, speed: 95, armour: 5, r: 40, dmg: 32, xp: 85, patterns: ['dash3', 'tailwhip', 'aimedFan', 'dash3'],
    quote: 'Bro. Bro. You swim like a sneeze.',
    desc: 'The biggest swimmer anyone has ever seen. Dashes through you three times, then has to catch his breath.',
    strengths: ['Lightning-fast triple dash', 'Flexes: dodges 30% of your shots'], weaknesses: ['Winded after every dash: stunned, double damage', 'Blasts, beams and pools never miss him'],
    dodge: 0.3, relics: ['proteinpro', 'tailwhip', 'sprint'] },
  { id: 'fever', name: 'THE FEVER', title: 'Pyrogen Prime, 41 Degrees', shape: 'star', color: '#ff7a2f',
    hp: 3200, speed: 48, armour: 2, r: 48, dmg: 30, xp: 85, patterns: ['firering', 'spiral', 'firering', 'ring'],
    quote: "Is it hot in here, or is it me? It's me. It's always me.",
    desc: 'A walking temperature spike. Rings of fire, burning ground, and it runs hotter and faster as it dies.',
    strengths: ['Immune to fire', 'Rages below 35% health: twice as fast'], weaknesses: ['Frost: double damage', 'Freezing it snuffs out its current attack'],
    weak: { ice: 2 }, resist: { fire: 0 }, relics: ['runninghot', 'feverdream', 'heatstroke'] },
  { id: 'twins', name: 'MITCH & OSIS', title: 'The Mitosis Twins', shape: 'cell', color: '#43e97b',
    hp: 1900, speed: 58, armour: 2, r: 40, dmg: 26, xp: 50, patterns: ['spiral', 'aimedFan', 'charge', 'ring'], twins: true,
    quote: "We finish each other's... ...swimmers.",
    desc: 'Identical twins who fight as one. Kill one and the other rebuilds it in 8 seconds, unless you finish both.',
    strengths: ['Revive each other', 'Crossfire from two sides'], weaknesses: ['Finish both within 8 seconds', 'Blasts hit both when they huddle: +30%'],
    weakAoe: 1.3, relics: ['mirror', 'doubletrouble', 'twinpick'] },
];
const BOSS_INTERVAL = 180; // seconds
const BOSSES_PER_RUN = 4;
const BOSS_TITLES = Object.fromEntries(BOSSES.map(b => [b.id, b.title]));

// Boss relics: one of three, chosen after the kill.
const RELICS = {
  // The Macrophage Queen: appetite.
  secondstomach: { name: 'Second Stomach', desc: '+60% max HP, and every kill heals 1 HP. Eat everything.' },
  swallow:       { name: 'Swallow Whole', desc: 'Touching a small, ordinary enemy swallows it whole instead of hurting you, and heals you 3 HP.' },
  court:         { name: "The Queen's Court", desc: 'Three loyal macrophage guards follow you and fight for you. A fallen guard returns 15s later.' },
  // The Antibody Colossus: armour.
  borderwall:    { name: 'Border Wall', desc: '+10 armour and +40% max HP, but you swim 10% slower.' },
  bouncer:       { name: 'Bouncer', desc: 'Enemies that touch you are hurled away and take ten times their own contact damage. You take 40% less from them.' },
  diplomatic:    { name: 'Diplomatic Immunity', desc: 'Every 5s, a shield blocks the next hit completely.' },
  // The Immune Eye: sight.
  thirdeye:      { name: 'Third Eye', desc: '+25% crit chance and crits deal +100% more damage.' },
  deathstare:    { name: 'Death Stare', desc: 'Every 4s you glare at the toughest enemy on screen with a beam of your own for 1.5s.' },
  precog:        { name: 'Precognition', desc: '+25% dodge. Every dodge sends out a pulse that wipes nearby enemy bullets.' },
  // The Matron: healing.
  bedside:       { name: 'Bedside Manner', desc: 'Regenerate 1.5% of your max HP every second.' },
  triage:        { name: 'Triage', desc: 'Dropping below 25% HP heals you to 70% and makes you untouchable for 2s. Once every 45s.' },
  transfusion:   { name: 'Transfusion', desc: 'Every hit you land heals you a little, and your lifesteal limit is three times higher.' },
  // The Pepsinator: acid.
  corrosive:     { name: 'Corrosive', desc: 'Every hit shreds armour and adds a stack of poison.' },
  acidblood:     { name: 'Acid Blood', desc: 'When you are hit, you splash acid around you for ten times the damage you took.' },
  ulcer:         { name: 'Ulcer', desc: 'Enemies you kill leave acid puddles that dissolve their friends.' },
  // Chad Prime: speed.
  proteinpro:    { name: 'Protein Shake Pro', desc: '+35% swim speed, and every weapon hits up to 50% harder while you swim fast.' },
  tailwhip:      { name: 'Tail Whip', desc: 'Your tail becomes a weapon: it lashes everything behind you twice a second.' },
  sprint:        { name: 'Sprint Start', desc: 'Every 5s you surge forward, untouchable for a moment, leaving a shockwave behind you.' },
  // The Fever: heat.
  runninghot:    { name: 'Running Hot', desc: 'Every weapon you own sets enemies on fire.' },
  feverdream:    { name: 'Fever Dream', desc: 'Every burning enemy near you makes all your weapons fire 3% faster (up to +60%).' },
  heatstroke:    { name: 'Heatstroke', desc: 'Burning enemies explode when they die, spreading the fire.' },
  // Mitch & Osis: doubling.
  mirror:        { name: 'Mirror Twin', desc: 'Every shot-firing weapon also fires a twin shot backwards at 50% damage.' },
  doubletrouble: { name: 'Double Trouble', desc: '+1 projectile, +1 pierce and +1 chain jump for every weapon.' },
  twinpick:      { name: 'Twin Pick', desc: 'From now on, every DNA strand lets you take two cards instead of one.' },
};

// Field power-ups.
const POWERUPS = {
  magnet: { name: 'MAGNET',  letter: 'M', color: '#4cc9f0', desc: 'All XP flies to you' },
  nuke:   { name: 'ACID FLUSH',    letter: 'N', color: '#ff595e', desc: 'Obliterates nearby enemies' },
  rage:   { name: 'ADRENALINE', letter: 'O', color: '#ff924c', desc: 'Double fire rate, no reloads' },
  heal:   { name: 'GLUCOSE HIT',  letter: '+', color: '#8ac926', desc: 'Restore 35% HP' },
  shield: { name: 'SHIELD',  letter: 'S', color: '#48cae4', desc: 'Invulnerable for 5s' },
  freeze: { name: 'STASIS',  letter: 'F', color: '#a2d2ff', desc: 'Freeze all enemies' },
  chest:  { name: 'DNA STRAND', letter: '?', color: '#ffca3a', desc: 'Free upgrade' },
};

// ---------------------------------------------------------------- The Egg
// The egg sits at the world origin: the arena's centre. Standing in its glow heals you.
const CORE = { r: 80, sanctuary: 290, arena: 2400 };
// Break into the egg: reach EGG.level and its membrane becomes vulnerable. Destroy it to be born (you win).
const EGG = { level: 60, hpBase: 150000, armour: 8 };
// Weapon drafts: a new weapon mount at level 1 and at these levels.
const SLOT_LEVELS = [10, 20, 35, 50];
const BASE_SLOTS = 1; // you choose a new weapon at level 1 and at every SLOT_LEVELS level (5 at most)
const MAX_WEAPONS = BASE_SLOTS + SLOT_LEVELS.length;

// ---------------------------------------------------------------- Palette
// Colour is rationed. Everything is greyscale except four meanings:
//   you     - GFP green: you, your shots, your echoes and your mind-controlled allies
//   danger  - red: anything that can hurt you (enemy bullets, acid, hits you take, low HP)
//   reward  - gold: loot, big XP, elites (they carry loot), charged mitochondria
//   rivals  - each rival champion's own fluorescent dye (their tag, track and name only)
// Loot boxes are reward-gold everywhere, in the world and in the UI.
// The renderer greys out any other colour it is asked to draw.
// Two more for the interface, taken from patient-monitor conventions (each trace has its own fixed colour):
//   upgrade - monitor cyan: anything that permanently changes your build (weapons, levels, perks, mods, stats)
//   pickup  - monitor magenta: temporary field power-ups lying on the slide
// Sperm samples (levels). Only the first is in the fridge so far.
const SAMPLES = [
  { id: 's001', no: '001', name: 'Standard Issue', desc: 'One healthy donor, four hundred million hopefuls, one egg. The classic.', count: '400,000,000', motility: '62% progressive', open: true },
  { id: 's002', no: '002', name: 'Frozen Donor Bank', desc: 'Thawed in a hurry. Everyone is sluggish, except the ones who are not.', open: false },
  { id: 's003', no: '003', name: 'The Morning After', desc: 'The pill is already dissolving. Good luck.', open: false },
  { id: 's004', no: '004', name: 'Vasectomy Reversal', desc: 'Low count, high stakes, very confused surgeon.', open: false },
];
const PAL = { you: '#4dff9a', danger: '#ff3b3b', reward: '#ffd23f', upgrade: '#5fd4e8', pickup: '#d983e8' };
// Stains. The world and the UI are greyscale until you pick these up (like a biologist adding a dye to
// see one protein better). Each one brings back one kind of colour.
const DYE_FAST = '#46e0ff';
const DYES = {
  gfp:        { name: 'GFP Tag', desc: 'Green Fluorescent Protein. Tags you: your swimmer, your shots, echoes and allies glow green. Much easier to find yourself in a crowd.' },
  immuno:     { name: 'Anti-Immune Stain', desc: 'Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings.' },
  luciferase: { name: 'Luciferase', desc: 'The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas.' },
  motility:   { name: 'Motility Dye', desc: 'Fast swimmers (sprinters, spermlets, krill, paramecia) light up cyan, so you can see what is about to reach you.' },
  rival:      { name: 'Rival Dyes', desc: 'Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board.' },
  he:         { name: 'H&E Stain Kit', desc: 'Haematoxylin and eosin, the classic. Stains the rest of the slide: power-up pickups and their effects, and your midpiece in your weapon-type colour.' },
};

// ---------------------------------------------------------------- Weapon upgrade trees
// Every weapon has a tree: at these levels you pick one of two branch perks (the tree is fixed per weapon,
// so you can plan ahead in the Armoury). tier: which milestone it can appear at. fit(d): which weapons it suits.
const PERK_LEVELS = [3, 5, 8, 10];
const MAX_WLVL = 10; // weapons level to 10; Lv 10 is the mastery branch
const MULTI_KINDS = ['gun', 'lob', 'chain', 'mine', 'orbit', 'ring', 'strike', 'siphon', 'mimic', 'tether', 'prequel'];
const hasArea = d => !!(d.base.area || d.base.explode > 1 || d.base.aura || d.base.radius || d.style === 'flame' || d.kind === 'orbit');
const isProj = d => PROJ_KINDS.includes(d.kind);
const isShot = d => isProj(d) && d.style !== 'flame'; // flames don't bounce, split or home
const PERKS = {
  // Tier 1 (Lv 3): tune the gun.
  power:    { tier: 1, icon: 'PW', color: '#ff924c', name: 'Hot Load',        desc: '+40% damage.' },
  rapid:    { tier: 1, icon: 'RP', color: '#ffd23f', name: 'Hair Trigger',    desc: '25% faster cooldown and reload.' },
  deepmag:  { tier: 1, icon: 'DM', color: '#9fb3c8', name: 'Nappy Bag',   desc: '+60% magazine size.', fit: d => (d.base.mag || 1) > 1 },
  wide:     { tier: 1, icon: 'WD', color: '#c77dff', name: 'Wide Hips',       desc: '+35% area and +15% range.', fit: hasArea },
  pierce:   { tier: 1, icon: 'PC', color: '#e0fbff', name: 'Pointy Head',      desc: 'Shots pierce 2 more enemies.', fit: d => d.kind === 'gun' || d.kind === 'ring' },
  ricochet: { tier: 1, icon: 'RC', color: '#8dffc0', name: 'Trampoline Rounds',   desc: 'Shots bounce to 2 more targets.', fit: isShot },
  keen:     { tier: 1, icon: 'KN', color: '#fee440', name: 'Sharp Tongue',       desc: '+15% crit chance.' },
  chill:    { tier: 1, icon: 'CH', color: '#6fd8ff', name: 'Cold Shoulder',       desc: 'Hits chill: enemies slow by 35% for 1.5s.' },
  ignite:   { tier: 1, icon: 'IG', color: '#ff7a2f', name: 'Extra Spicy',      desc: 'Hits set enemies on fire for 25% of the hit per second.' },
  // Tier 2 (Lv 5): change how it plays.
  seek:     { tier: 2, icon: 'SK', color: '#d0a3ff', name: 'Homing Instinct',    desc: 'Shots home in on targets.', fit: isShot },
  split:    { tier: 2, icon: 'SL', color: '#ffd166', name: 'Cell Division',     desc: 'Shots burst into 3 shards on first hit.', fit: isShot },
  arc:      { tier: 2, icon: 'AR', color: '#ffe94a', name: 'Carpet Shock',   desc: '30% of hits arc to a nearby enemy for 50% damage.' },
  execute:  { tier: 2, icon: 'EX', color: '#ff4d6d', name: 'Kick Them While Down',        desc: '+60% damage to enemies under 35% health.' },
  venom:    { tier: 2, icon: 'VN', color: '#8dff4a', name: 'Toxic Relationship',    desc: 'Hits add a stacking poison.' },
  freeze:   { tier: 2, icon: 'FZ', color: '#bde0fe', name: 'Ice Queen',       desc: '12% of hits freeze non-boss enemies solid.' },
  blast:    { tier: 2, icon: 'BL', color: '#ff5a36', name: 'Special Delivery',         desc: 'Hits explode for 35% damage around the target.' },
  volley:   { tier: 2, icon: 'VL', color: '#48cae4', name: 'Plus One',    desc: '+1 projectile.', fit: d => MULTI_KINDS.includes(d.kind) },
  vamp:     { tier: 2, icon: 'VP', color: '#ff8fab', name: 'Bloodsucker',    desc: 'Hits heal you a little (within the lifesteal limit).' },
  giant:    { tier: 2, icon: 'GS', color: '#ffb347', name: 'Punching Up',        desc: '+100% damage to elites, bosses and rival champions.' },
  // Tier 3 (Lv 8): capstones.
  overdrive:{ tier: 3, icon: 'OD', color: '#ff3df2', name: 'Sugar Rush',       desc: '+75% damage.' },
  frenzy:   { tier: 3, icon: 'FR', color: '#ffd23f', name: 'Due Date Panic',          desc: '40% faster cooldown and reload.' },
  chainburst:{ tier: 3, icon: 'CB', color: '#ff5a36', name: 'Domino Effect', desc: 'Kills explode for 60% of the killing blow.' },
  slayer:   { tier: 3, icon: 'SY', color: '#ffb347', name: 'Giant Killer',   desc: '+150% damage to elites, bosses and rival champions.' },
  twin:     { tier: 3, icon: 'TW', color: '#48cae4', name: 'Twins!',      desc: '+2 projectiles.', fit: d => MULTI_KINDS.includes(d.kind) },
  storm:    { tier: 3, icon: 'ST', color: '#ffe94a', name: 'Electric Personality',     desc: '50% of hits arc to 2 nearby enemies for 60% damage.' },
  // Tier 4 (Lv 10): mastery.
  apex:     { tier: 4, icon: 'AX', color: '#ffffff', name: 'Final Form',       desc: '+100% damage and +20% crit chance.' },
  overclock:{ tier: 4, icon: 'OC', color: '#ffffff', name: 'Espresso Drip',       desc: '50% faster cooldown and reload, +50% magazine.' },
  legion:   { tier: 4, icon: 'LG', color: '#ffffff', name: 'Octuplets',          desc: '+3 projectiles.', fit: d => MULTI_KINDS.includes(d.kind) },
  lifeline: { tier: 4, icon: 'LF', color: '#ffffff', name: 'Umbilical Cord',        desc: 'Hits heal you (up to four times the usual lifesteal limit).' },
  executioner:{ tier: 4, icon: 'EX', color: '#ffffff', name: 'No Survivors',   desc: 'Non-boss enemies under 20% health die instantly when hit.' },
};

// ---------------------------------------------------------------- Swimming
// Your head turns at most turn rad/s (times traction), faster when you're nearly stopped.
// Sideways drift bleeds off at grip per second (times traction). Growth per level: +1.5% size.
const SWIM = { turn: 3.8, pivot: 1.6, grip: 4, growth: 0.015, hitGrowth: 0.0075 };

// ---------------------------------------------------------------- Terrain
// Things growing in the womb. solid: blocks bodies. shot: what happens to any projectile or bullet that hits it.
const OBSTACLES = {
  ridge:   { name: 'Cartilage Nodule', solid: true,  shot: 'bounce', n: 16, r: [45, 110], color: '#f2d0c9' },
  mito:    { name: 'Mitochondrion',    solid: true,  shot: 'absorb', n: 9,  r: [48, 72],  color: PAL.reward, charge: 45, burstR: 230 },
  acid:    { name: 'Acid Crypt',       solid: true,  shot: 'melt',   n: 9,  r: [40, 80],  color: PAL.danger, dps: 10 },
  cilia:   { name: 'Cilia Bed',        solid: false, shot: 'repel',  n: 8,  r: [95, 150], color: '#b0b0b0', push: 260 },
  current: { name: 'Tubal Current',    solid: false, shot: 'drift',  n: 7,  r: [120, 180], color: '#b0b0b0', push: 150 },
  slick:   { name: 'Lubricant Slick',  solid: false, shot: 'none',   n: 8,  r: [90, 150], color: '#c8b6ff', traction: 0.3 },
};

// ---------------------------------------------------------------- Rival champions
// Other would-be babies grow elsewhere on the map. First to level 60 to break the membrane wins.
// skill: how fast they grow. aggro: how keen they are to come and pick a fight with you.
const RIVALS = [
  { id: 'steve',  name: 'Big Steve',          color: '#ffb347', skill: 1.10, aggro: 0.6, title: 'Has been doing laps since the Tuesday before last' },
  { id: 'chad',   name: 'Chad Flagellum',     color: '#9ef01a', skill: 1.00, aggro: 0.9, title: 'Tail day, every day' },
  { id: 'wiggles',name: 'Professor Wiggles',  color: '#c77dff', skill: 1.15, aggro: 0.2, title: 'Holds a doctorate in swimming, self-awarded' },
  { id: 'zygo',   name: "Lil' Zygo",          color: '#ff5d8f', skill: 0.90, aggro: 0.7, title: 'Small, angry, surprisingly aerodynamic' },
  { id: 'kevin',  name: 'Kevin',              color: '#ffe94a', skill: 0.95, aggro: 0.4, title: 'Just Kevin' },
];
// finish: seconds for a skill-1.0 rival to reach EGG.level if nobody interferes.
const RIVAL = { finish: 840, hpBase: 250, duel: 14, speed: 78, zapR: 240, sight: 950, eggDps: 0.012, spawnR: 1700, pow: 1.1, huntFrom: 240 };

// ---------------------------------------------------------------- Chrono (time travel)
const CHRONO = { window: 4, snapEvery: 0.25, animDur: 1.1, energyPerCharge: 600, startCharges: 1, maxCharges: 2 };

// ---------------------------------------------------------------- Modifiers (slot into one weapon, 3 per weapon)
// Power (p) comes from the card's rarity. Picking a modifier a weapon already has boosts its power.
const MOD_SLOTS = 3;
const MOD_POWER = [1, 1.25, 1.6, 2.2];
const MOD_MAX_POWER = 3;
const MAX_ALLIES = 6;
const PROJ_KINDS = ['gun', 'siphon', 'mimic'];
const MODS = {
  seeking:   { name: 'Seeking',      icon: 'SE', color: '#d0a3ff', kinds: PROJ_KINDS, desc: p => `Shots hunt down targets (turn rate ${(3 + 2 * p).toFixed(1)})` },
  splitting: { name: 'Splitting',    icon: 'SP', color: '#ffd166', kinds: PROJ_KINDS, desc: p => `On first hit, shots split into ${2 + Math.round(p)} shards at 45% damage` },
  orbiting:  { name: 'Orbiting',     icon: 'OR', color: '#8dffc0', kinds: PROJ_KINDS, desc: p => `Shots circle you for ${(1.2 * p).toFixed(1)}s, eating enemy bullets, then launch` },
  growing:   { name: 'Growing',      icon: 'GW', color: '#8ac926', kinds: PROJ_KINDS, desc: p => `Shots swell in flight: triple size and up to +${Math.round(100 * p)}% damage` },
  boomerang: { name: 'Boomerang',    icon: 'BM', color: '#f1f1f1', kinds: PROJ_KINDS, desc: () => 'Shots fly out and come back, hitting everything twice' },
  ricochet:  { name: 'Ricochet',     icon: 'RI', color: '#a0c4ff', kinds: PROJ_KINDS, desc: p => `+${1 + Math.round(p)} bounces between enemies` },
  freezing:  { name: 'Freezing',     icon: 'FZ', color: '#6fd8ff', desc: p => `${Math.round(18 * p)}% chance per hit to freeze the target solid` },
  exploding: { name: 'Exploding',    icon: 'EX', color: '#ff7a2f', desc: p => `Hits explode for ${Math.round(30 * p)}% damage in a small blast` },
  mindctrl:  { name: 'Mind Control', icon: 'MC', color: '#ff8fab', desc: p => `${(5 * p).toFixed(0)}% chance per hit to make a monster fight for you for ${Math.round(6 * p)}s (max ${MAX_ALLIES} allies)` },
  elemental: { name: 'Element Swap', icon: 'EL', color: '#c77dff', desc: () => 'Converts this weapon to a new element' },
  shrapnel:  { name: 'Shrapnel',     icon: 'SH', color: '#e9c46a', desc: () => 'Kills burst into 3 shards at 40% damage' },
  // The Modifier Forge.
  chaining:  { name: 'Chaining',     icon: 'CN', color: '#eee36a', desc: p => `${Math.round(25 * p)}% of hits chain to another enemy for 50% damage` },
  pulsing:   { name: 'Pulsing',      icon: 'PU', color: '#cfe3ff', kinds: PROJ_KINDS, desc: p => `Shots pulse every 0.6s, hitting everything close by for ${Math.round(15 * p)}% damage` },
  magnetic:  { name: 'Magnetic',     icon: 'MG', color: '#b0b0b0', kinds: PROJ_KINDS, desc: p => `Shots drag monsters within ${Math.round(70 * p)} units into their path` },
  delayed:   { name: 'Delayed',      icon: 'DL', color: '#b0b0b0', kinds: PROJ_KINDS, desc: p => `Shots hang for a moment, then launch 60% faster for +${Math.round(30 * p)}% damage` },
  mirror:    { name: 'Mirror',       icon: 'MR', color: '#b0b0b0', kinds: PROJ_KINDS, desc: p => `Every shot has a twin fired the opposite way at ${Math.round(50 * p)}% damage` },
};
// Duo combos: two specific modifiers on the same weapon unlock a named bonus.
const DUOS = [
  { a: 'seeking',   b: 'splitting', name: 'Cluster Hunter', desc: 'Split shards home in too.' },
  { a: 'freezing',  b: 'exploding', name: 'Cryoblast',      desc: 'Explosions freeze whatever they hit.' },
  { a: 'orbiting',  b: 'pulsing',   name: 'Halo',           desc: 'Pulses come twice as often and hit twice as hard.' },
  { a: 'boomerang', b: 'growing',   name: 'Snowball',       desc: 'Shots grow twice as much on the way out and back.' },
  { a: 'ricochet',  b: 'chaining',  name: 'Pinball Wizard', desc: 'Chains jump to 3 targets.' },
  { a: 'mindctrl',  b: 'magnetic',  name: 'Pied Piper',     desc: 'Mind-controlled allies last twice as long.' },
  { a: 'mirror',    b: 'splitting', name: 'Kaleidoscope',   desc: 'Mirrored twins split into twice as many shards.' },
  { a: 'delayed',   b: 'exploding', name: 'Time Bomb',      desc: 'Delayed shots explode as they launch.' },
];

// ---------------------------------------------------------------- Cursed loot cards
const CURSES = [
  { id: 'glass', name: 'Glass Cannon Deluxe', boon: 'x1.8 damage for everything', bane: 'Max HP halved',
    apply: (P, G) => { P.might *= 1.8; P.maxHp = Math.max(30, Math.round(P.maxHp / 2)); G.player.hp = Math.min(G.player.hp, P.maxHp); } },
  { id: 'speed', name: "Speedrunner's Regret", boon: '+50% fire rate', bane: 'Enemy bullets 20% faster', apply: P => { P.haste += 0.5; P.bulletSpeed *= 1.2; } },
  { id: 'hoard', name: "Hoarder's Bargain", boon: 'Double scrap, double viewers', bane: 'Pickup range halved', apply: P => { P.scrap *= 2; P.viewers *= 2; P.magnet *= 0.5; } },
  { id: 'crowd', name: 'Crowd Pleaser', boon: '+50% XP and viewers', bane: '30% more enemies', apply: P => { P.xp += 0.5; P.viewers *= 1.5; P.spawnMult *= 1.3; } },
  { id: 'paradox', name: 'Paradox Addict', boon: '+2 max Rewind charges, all refilled now', bane: 'All healing halved', apply: (P, G) => { G.chrono.max += 2; G.chrono.charges = G.chrono.max; P.healMult *= 0.5; } },
  { id: 'naked', name: 'Clothing Optional', boon: '+25% move speed, +20% dodge', bane: 'Armour is zero. Forever.', apply: P => { P.speed += 0.25; P.dodge = Math.min(0.6, P.dodge + 0.2); P.noArmour = true; } },
];

// ---------------------------------------------------------------- The Show: announcer, achievements, viewers, sponsors
// Original comedy writing for Storm Directive's sardonic game-show host, "the System".
const GACHA_TIERS = [
  { name: 'BRONZE MAG', mult: 0.7, color: '#cd8a4a', w: 55 },
  { name: 'SILVER MAG', mult: 1.1, color: '#c9d6e3', w: 28 },
  { name: 'GOLD MAG', mult: 1.8, color: '#ffd23f', w: 13 },
  { name: 'LEGENDARY MAG', mult: 3, color: '#ff3df2', w: 4 },
];
const SPONSORS = [
  "Grundle's Discount Ordnance", "Madame Vex's Totally Legal Potions", 'The Committee for Unnecessary Explosions',
  "Big Barry's Scrap and Salvage", 'Glorp Cola: It Glows For A Reason', 'The Ancient Order of Slightly Sticky Relics',
  "Dr Fizzwick's Regrettable Medicines", 'Hovercrab Insurance: We Probably Cover That',
];
const SYSTEM_LINES = {
  start: [
    'Welcome, Spermy. Four hundred million of you entered. One gets to become a person. No pressure.',
    'Today\'s prize: existence. Today\'s competition: literally everyone you arrived with.',
    'Reminder: you swim yourself. Your job is to make bad decisions in the menus.',
    'Good news: there is an egg. Bad news: so is everyone else\'s plan.',
  ],
  level: [
    'Level up! You are growing. Please stop sprouting weapons from your tail, it upsets the viewers.',
    'Another level. The egg has noticed you. The egg is not impressed yet.',
    'Level up. Please enjoy this complimentary strand of violent DNA.',
    'Congratulations on your promotion from "tadpole" to "slightly angrier tadpole".',
  ],
  boss: [
    'It has read your genome and is unimpressed.',
    'It has been told you insulted its mother. You did not. We did. On your behalf.',
    'Please try to die slowly. The viewers paid for the full episode.',
  ],
  lowhp: [
    'Your health is low. Have you tried not getting absorbed?',
    'Vital signs: concerning. Viewer engagement: excellent.',
    'The immune system is winning. The immune system always thinks it is winning.',
  ],
  rewind: [
    'Time has been rewound. Biology has filed a formal complaint.',
    'Rewind successful. Your future self is now an unpaid intern.',
    'You swam backwards through time. Most swimmers can barely swim forwards.',
  ],
  fusion: ['Fusion complete. Two weapons became one. That is, ironically, the theme of the show.', 'Fusion complete. It violates at least four treaties and one textbook.'],
  cursed: ['You took the cursed card. We are not angry. We are just disappointed. And delighted.', 'Bold. Stupid, but bold. Very on-brand for a swimmer.'],
  surge: ['Immune Surge! The host has noticed you. Everything hits harder now. Please remain calm and panic.'],
  idle: [
    'The egg is right there. Just saying.',
    'Fun fact: most swimmers never get past the first minute. Just saying.',
    'A reminder that screaming does not affect gameplay, but we do record it.',
    'Viewer poll: 61% think you will be eaten by a Macrophage. Prove them right.',
    'You are doing great! This message is automated and applies to all four hundred million swimmers equally.',
    'Current odds of becoming a person: low. Current odds of being a snack: excellent.',
  ],
  death: [
    'Swimmer absorbed. Your DNA will be recycled into something more useful, like a toenail.',
    'You have been eaten by the immune system. It was nothing personal. It was entirely personal.',
    'And that is the show! Another swimmer gets to be a person. It was not you.',
    'Cause of death: optimism.',
  ],
  gacha: ['Legendary magazine! The house always wins. Except, apparently, now.'],
  mimic: ['Pattern copied. The original owner has been absorbed and cannot sue.'],
  grudge: ['Grudge settled. Therapy was cheaper, but this was faster.'],
  eggReady: ['Sperm count: one. It is you. The egg is waiting, and frankly it is getting impatient. Swim in.', 'The last rival is gone. Four hundred million went in; one is left. Go and fertilise something.'],
  finalFive: ['Sperm count: six. You and the five strongest swimmers in existence. Only one of you gets the egg. Fight.', 'Four hundred million started. Six are left. The other five have noticed you.'],
  rivalLevel: ['{n} just hit level {l}. They look insufferable about it.', '{n} is level {l}. The Committee would like to remind you that this is a race.'],
  rivalEgg: ['{n} has reached the egg and is headbutting the membrane. If it breaks for them, you lose. Go and have words.', '{n} is knocking on the egg. Politely, with their face. Stop them.'],
  rivalDead: ['{n} has been eliminated. {k}', 'Farewell, {n}. {k}'],
  rivalWin: ['{n} got there first. Congratulations to {n}. You are now a statistic.'],
  amoebaHuge: ['An amoeba has eaten {n} of its colleagues and is now the size of a small opinion. Kill it before it becomes a large one.', 'Something spongy has had {n} meals and is getting ideas. Deal with it.'],
  born: ['Congratulations! It\'s you! Everyone else can go home. Everyone else is, technically, going nowhere.'],
  slot: ['You grew a new weapon mount. Biology is not supposed to work like this. Please enjoy it anyway.', 'Extra weapon slot unlocked. Evolution took millions of years. You took fifteen levels.'],
};
const NO_REWARD = [
  'Reward: a sense of accomplishment. It is non-refundable.',
  'Reward: nothing. We are not made of money.',
  'Reward: our respect. It has no resale value.',
  'Reward: exposure. You know how it is.',
];
const CARD_QUIPS = [
  'The System recommends this one. The System is often wrong.',
  'Viewers voted this "most likely to end in tears".',
  'A previous contestant picked this. We don\'t talk about them.',
  'Sponsored content. Probably.',
  'This one comes with a free trial of hope.',
  'Our focus group loved it. The focus group has since dissolved.',
];
const ACHIEVEMENTS = {
  firstblood: { name: "Baby's First Homicide", desc: 'Killed a rival. Only 399,999,999 to go.', reward: 'none' },
  born:       { name: "Congratulations, It's You", desc: 'Got the sperm count down to one and fertilised the egg. Please enjoy the next eighty years.', reward: 'none' },
  amoeba:     { name: 'Portion Control', desc: 'Let an amoeba eat so much it made the news.', reward: 'none' },
  bigamoeba:  { name: 'Diet Plan', desc: 'Killed an amoeba bigger than a boss.', reward: 'box' },
  rivalkill:  { name: 'Survival of the Fittest', desc: 'Eliminated a rival champion personally. Biology is a contact sport.', reward: 'box' },
  allrivals:  { name: 'Only Child', desc: 'Every rival champion is gone. The egg only has one option now.', reward: 'reroll' },
  eggready:   { name: 'Last Sperm Standing', desc: 'Won the Final Five. Sperm count: one.', reward: 'heal' },
  slot:       { name: 'Extra Limb', desc: 'Grew an extra weapon slot. The textbooks will need updating.', reward: 'none' },
  kills100:   { name: 'Pest Control', desc: '100 kills. The exterminators\' union has filed a complaint.', reward: 'reroll' },
  kills1000:  { name: 'Statistically Significant', desc: '1,000 kills. You are now a demographic.', reward: 'box' },
  kills5000:  { name: 'Extinction Event', desc: '5,000 kills. Several species have asked you to stop.', reward: 'bossbox' },
  firstloot:  { name: 'Gene Therapy Influencer', desc: 'Spliced in your first DNA strand. Please like and subscribe.', reward: 'none' },
  fusion:     { name: 'Frankenweapon', desc: 'Fused two weapons. It is alive. It is also on fire.', reward: 'reroll' },
  rewind:     { name: 'Undo Button Enthusiast', desc: 'Rewound time. Causality has been notified.', reward: 'none' },
  autorewind: { name: 'Not Today, Death', desc: 'Died, then un-died. Our lawyers are looking into it.', reward: 'heal' },
  boss:       { name: 'Middle Management Removed', desc: 'Killed a boss. Someone will be promoted to replace it.', reward: 'none' },
  reactions:  { name: 'Mad Scientist', desc: 'Triggered 50 elemental reactions. Safety goggles were optional.', reward: 'reroll' },
  friendly:   { name: 'Let Them Fight', desc: 'A Bomber killed another monster. Teamwork!', reward: 'none' },
  cursed:     { name: 'Bad Decision Maker', desc: 'Took a cursed card. We knew you would.', reward: 'none' },
  modded:     { name: 'Aftermarket Parts', desc: 'Installed a modifier. The warranty is now fully void.', reward: 'none' },
  fullmods:   { name: 'Pimp My Death Machine', desc: 'Filled all three modifier slots on one weapon. Tasteful.', reward: 'box' },
  mindctrl:   { name: 'Friends Forever', desc: 'Mind-controlled a monster. It was not consulted.', reward: 'none' },
  recycle:    { name: 'Circular Economy', desc: 'Recycled a weapon in the Armoury. Very eco. Very violent.', reward: 'none' },
  grudge:     { name: 'Petty', desc: 'Killed the thing that hurt you with the Family Grudge. Worth it.', reward: 'none' },
  broke:      { name: 'Financially Ruined', desc: 'Ran the Child Benefit Cannon dry. Please consult a debt counsellor.', reward: 'scrap' },
  gachagold:  { name: 'Gambling Problem', desc: 'Rolled a Legendary magazine. Do not tell your mother.', reward: 'none' },
  parasite:   { name: 'Landlord of Flesh', desc: 'A corpse became your turret. Rent is due Tuesday.', reward: 'none' },
  mimic:      { name: 'Identity Theft', desc: 'Stole a monster\'s attack pattern. It will be pressing charges.', reward: 'none' },
  overkill:   { name: 'Excessive Force', desc: 'Dealt 1,000 overkill damage in one hit. The review board is concerned.', reward: 'none' },
  lastword:   { name: 'The Last Word', desc: 'Killed something with the final round of a magazine. Dramatic.', reward: 'none' },
  spoilers:   { name: 'Spoilers', desc: 'Killed something before the shell had even been fired.', reward: 'none' },
  tethered:   { name: 'Forced Proximity', desc: 'Slammed two tethered monsters together. They did not consent.', reward: 'none' },
  siphoned:   { name: 'Return to Sender', desc: 'Absorbed 200 enemy bullets. The postal service is in awe.', reward: 'reroll' },
  echokill:   { name: 'Time Paradox Murder', desc: 'Your future self got a kill. Who gets the XP? You do. Don\'t ask.', reward: 'none' },
  survive5:   { name: 'Still Here?', desc: 'Survived 5 minutes. The producers are surprised.', reward: 'box' },
  survive10:  { name: 'Contractually Obligated', desc: 'Survived 10 minutes. We have to keep filming now.', reward: 'box' },
  surge:      { name: 'Ratings Spike', desc: 'Reached the Storm Surge. The audience is thrilled you will die soon.', reward: 'none' },
  viewers1m:  { name: 'Celebrity', desc: 'One million viewers. Your agent has several questions.', reward: 'box' },
  lowhp:      { name: 'Flesh Wound', desc: 'Survived a hit with under 5% HP. The medic has fainted.', reward: 'heal' },
  sponsor:    { name: 'Sold Out', desc: 'Accepted a sponsor gift. Integrity was never on the table.', reward: 'none' },
};
const VIEWER_MILESTONES = [10e3, 50e3, 100e3, 250e3, 500e3, 1e6, 2.5e6, 5e6, 1e7, 2.5e7, 5e7];

// Everything you fire is yours, so it's all GFP green.
for (const d of Object.values(WEAPONS).concat(Object.values(SPELLS))) d.color = PAL.you;
