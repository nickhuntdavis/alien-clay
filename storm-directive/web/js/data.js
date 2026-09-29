'use strict';
// Spawn Storm - game data: elements, weapons, spells, merges, passives, enemies, bosses, directives.

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
const WEAPONS = {
  blaster: { name: 'Blaster', icon: 'BL', elem: 'phys', kind: 'gun', color: '#e8f0ff', dir: 'nearest',
    desc: 'Reliable sidearm. Accurate single shots.',
    base: { dmg: 10, cd: 0.3, mag: 12, reload: 1.1, count: 1, spread: 0.04, speed: 640, pierce: 0, range: 430, size: 4 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.3 } } },
  smg: { name: 'Storm SMG', icon: 'SM', elem: 'phys', kind: 'gun', color: '#cfd8ff', dir: 'nearest',
    desc: 'Sprays a hail of light rounds. Big magazine, long reload.',
    base: { dmg: 4.5, cd: 0.075, mag: 36, reload: 1.7, count: 1, spread: 0.2, speed: 580, pierce: 0, range: 370, size: 3 },
    lv: { 3: { cd: -0.15 }, 5: { pierce: 1 }, 7: { count: 1 } } },
  shotgun: { name: 'Scattergun', icon: 'SG', elem: 'phys', kind: 'gun', color: '#ffd6a5', dir: 'nearest',
    desc: 'Close-range pellet burst with knockback.',
    base: { dmg: 8, cd: 0.75, mag: 4, reload: 1.6, count: 6, spread: 0.55, speed: 540, pierce: 0, range: 270, size: 3.5, knock: 70 },
    lv: { 3: { count: 2 }, 5: { pierce: 1 }, 7: { count: 3 } } },
  railgun: { name: 'Railgun', icon: 'RG', elem: 'phys', kind: 'gun', color: '#9ef0ff', dir: 'armour', style: 'rail',
    desc: 'Hypersonic slug. Pierces everything and shreds armour.',
    base: { dmg: 42, cd: 1.3, mag: 3, reload: 2.2, count: 1, spread: 0.05, speed: 1700, pierce: 99, range: 720, size: 3, shred: 3 },
    lv: { 3: { shred: 2 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
  rocket: { name: 'Rocket Pod', icon: 'RK', elem: 'fire', kind: 'gun', color: '#ffb347', dir: 'cluster', style: 'rocket',
    desc: 'Explosive rockets that ignite the blast zone.',
    base: { dmg: 24, cd: 0.55, mag: 2, reload: 2.4, count: 1, spread: 0.1, speed: 400, pierce: 0, range: 500, size: 5, explode: 62 },
    lv: { 3: { area: 0.25 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  flamer: { name: 'Flamer', icon: 'FL', elem: 'fire', kind: 'gun', color: '#ff7a2f', dir: 'nearest', style: 'flame',
    desc: 'Short-range cone of fire. Every lick burns.',
    base: { dmg: 3.2, cd: 0.05, mag: 50, reload: 2.1, count: 2, spread: 0.45, speed: 310, pierce: 99, range: 200, size: 7 },
    lv: { 3: { area: 0.3 }, 5: { dmg: 0.3 }, 7: { count: 1 } } },
  frost: { name: 'Frost Lance', icon: 'FR', elem: 'ice', kind: 'gun', color: '#6fd8ff', dir: 'fastest', style: 'shard',
    desc: 'Piercing ice shards that chill and freeze.',
    base: { dmg: 15, cd: 0.6, mag: 5, reload: 1.5, count: 1, spread: 0.08, speed: 540, pierce: 3, range: 460, size: 5 },
    lv: { 3: { count: 1 }, 5: { pierce: 3 }, 7: { count: 2 } } },
  tesla: { name: 'Tesla Coil', icon: 'TC', elem: 'shock', kind: 'chain', color: '#ffe94a', dir: 'cluster',
    desc: 'Instant lightning that arcs between enemies.',
    base: { dmg: 13, cd: 0.7, mag: 6, reload: 1.8, count: 1, chain: 3, range: 330, jump: 140 },
    lv: { 3: { chain: 2 }, 5: { count: 1 }, 7: { chain: 3 } } },
  venom: { name: 'Venom Spitter', icon: 'VS', elem: 'poison', kind: 'lob', color: '#8dff4a', dir: 'cluster',
    desc: 'Lobs acid globs that leave toxic puddles.',
    base: { dmg: 9, cd: 0.9, mag: 4, reload: 1.8, count: 1, spread: 40, range: 390, area: 55, dur: 3, flight: 0.6 },
    lv: { 3: { dur: 0.5 }, 5: { count: 1 }, 7: { area: 0.4 } } },
  glaive: { name: 'Glaive', icon: 'GL', elem: 'phys', kind: 'gun', color: '#f1f1f1', dir: 'furthest', style: 'glaive',
    desc: 'Spinning blade that flies out and returns.',
    base: { dmg: 15, cd: 1.0, mag: 2, reload: 1.3, count: 1, spread: 0.3, speed: 430, pierce: 99, range: 330, size: 10, boomerang: 1 },
    lv: { 3: { count: 1 }, 5: { dmg: 0.3 }, 7: { count: 1 } } },
  orbit: { name: 'Orbital Blades', icon: 'OB', elem: 'arcane', kind: 'orbit', color: '#c77dff', dir: 'nearest',
    desc: 'Arcane blades orbit you. Active, then recharge.',
    base: { dmg: 16, count: 3, dur: 4.5, reload: 2.2, radius: 72, spin: 3.6, size: 10, range: 100 },
    lv: { 3: { count: 1 }, 5: { area: 0.3 }, 7: { count: 2 } } },
  prism: { name: 'Prism Beam', icon: 'PB', elem: 'arcane', kind: 'beam', color: '#e0aaff', dir: 'strongest',
    desc: 'Channelled beam that burns through a line of foes.',
    base: { dmg: 32, cd: 1.7, mag: 3, reload: 2.2, count: 1, dur: 1.2, range: 390, size: 6 },
    lv: { 3: { dur: 0.35 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  mines: { name: 'Mine Layer', icon: 'ML', elem: 'fire', kind: 'mine', color: '#ff9f1c', dir: 'nearest',
    desc: 'Drops proximity mines in your wake.',
    base: { dmg: 32, cd: 0.7, mag: 5, reload: 2.4, count: 1, explode: 72, life: 14, range: 600 },
    lv: { 3: { count: 1 }, 5: { area: 0.3 }, 7: { dmg: 0.5 } } },
  seeker: { name: 'Seeker Swarm', icon: 'SS', elem: 'arcane', kind: 'gun', color: '#d0a3ff', dir: 'weakest', style: 'missile',
    desc: 'Homing micro-missiles that never miss.',
    base: { dmg: 9, cd: 0.45, mag: 6, reload: 2.0, count: 2, spread: 1.2, speed: 320, pierce: 0, range: 500, size: 4, homing: 5 },
    lv: { 3: { count: 1 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  gatling: { name: 'Gatling', icon: 'GT', elem: 'phys', kind: 'gun', color: '#ffe8a3', dir: 'nearest', spinup: 1,
    desc: 'Spins up to a terrifying fire rate. Huge belt.',
    base: { dmg: 5.5, cd: 0.14, mag: 120, reload: 3.2, count: 1, spread: 0.13, speed: 720, pierce: 0, range: 450, size: 3 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.3 } } },
  drone: { name: 'Attack Drone', icon: 'DR', elem: 'shock', kind: 'gun', color: '#fff275', dir: 'lowhp', drones: 1,
    desc: 'Drones hover beside you and fire shock bolts.',
    base: { dmg: 8, cd: 0.45, mag: 10, reload: 1.5, count: 1, spread: 0.05, speed: 620, pierce: 0, range: 420, size: 3.5 },
    lv: { 3: { count: 1 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  ricochet: { name: 'Ricochet Disc', icon: 'RD', elem: 'phys', kind: 'gun', color: '#a0c4ff', dir: 'nearest', style: 'disc',
    desc: 'Discs bounce from enemy to enemy.',
    base: { dmg: 13, cd: 0.8, mag: 3, reload: 1.5, count: 1, spread: 0.1, speed: 500, pierce: 0, range: 420, size: 6, bounce: 3 },
    lv: { 3: { bounce: 2 }, 5: { count: 1 }, 7: { bounce: 3 } } },
  mortar: { name: 'Mortar', icon: 'MR', elem: 'fire', kind: 'lob', color: '#ff6b35', dir: 'cluster',
    desc: 'Slow, heavy shells with a huge blast.',
    base: { dmg: 42, cd: 1.6, mag: 2, reload: 2.5, count: 1, spread: 30, range: 540, area: 82, flight: 1.0, explode: 1 },
    lv: { 3: { area: 0.25 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
  arbalest: { name: 'Arbalest', icon: 'AB', elem: 'phys', kind: 'gun', color: '#d4a373', dir: 'strongest', style: 'bolt',
    desc: 'Heavy bolts. Massive knockback, light armour shred.',
    base: { dmg: 24, cd: 0.9, mag: 4, reload: 1.6, count: 1, spread: 0.05, speed: 820, pierce: 2, range: 540, size: 4, knock: 220, shred: 1 },
    lv: { 3: { pierce: 2 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  void: { name: 'Void Orb', icon: 'VO', elem: 'arcane', kind: 'gun', color: '#7b2cbf', dir: 'cluster', style: 'void',
    desc: 'Slow orb that drags enemies into its maw.',
    base: { dmg: 7, cd: 1.8, mag: 2, reload: 2.5, count: 1, spread: 0.2, speed: 115, pierce: 99, range: 400, size: 15, aura: 70, pull: 90 },
    lv: { 3: { area: 0.3 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
  needler: { name: 'Needler', icon: 'ND', elem: 'poison', kind: 'gun', color: '#b8f35a', dir: 'highhp', style: 'needle',
    desc: 'Rapid toxic needles. Poison stacks up.',
    base: { dmg: 3.5, cd: 0.1, mag: 30, reload: 1.6, count: 1, spread: 0.1, speed: 680, pierce: 0, range: 410, size: 2.5 },
    lv: { 3: { count: 1 }, 5: { pierce: 1 }, 7: { cd: -0.2 } } },
  hailstorm: { name: 'Hailstorm', icon: 'HS', elem: 'ice', kind: 'lob', color: '#a2d2ff', dir: 'cluster',
    desc: 'Rains ice chunks around the target.',
    base: { dmg: 11, cd: 1.4, mag: 2, reload: 2.0, count: 5, spread: 90, range: 460, area: 36, flight: 0.7, explode: 1 },
    lv: { 3: { count: 2 }, 5: { area: 0.3 }, 7: { count: 3 } } },

  paradox: { name: 'Paradox Rifle', icon: 'PX', elem: 'arcane', kind: 'gun', color: '#8dffc0', dir: 'strongest', style: 'bolt',
    desc: 'Every hit repeats itself 1 second later, from the future.',
    base: { dmg: 16, cd: 0.55, mag: 6, reload: 1.6, count: 1, spread: 0.04, speed: 760, pierce: 1, range: 480, size: 4, echoHit: 1 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },

  // ---- Merged weapons (not in the random pool; created by fusing two maxed-enough weapons) ----
  steam: { name: 'Steam Cannon', icon: 'ST', elem: 'fire', elem2: 'ice', kind: 'gun', color: '#ffc6ff', dir: 'nearest', style: 'flame', merged: 1,
    desc: 'Scalding fire-and-frost cone. Triggers reactions constantly.',
    base: { dmg: 8, cd: 0.055, mag: 70, reload: 1.9, count: 3, spread: 0.5, speed: 380, pierce: 99, range: 250, size: 9 },
    lv: { 5: { area: 0.3 }, 7: { count: 1 } } },
  thunderbuck: { name: 'Thunder Buckshot', icon: 'TB', elem: 'shock', kind: 'gun', color: '#fff3b0', dir: 'nearest', merged: 1,
    desc: 'Each pellet detonates into chain lightning.',
    base: { dmg: 11, cd: 0.7, mag: 5, reload: 1.4, count: 8, spread: 0.6, speed: 580, pierce: 0, range: 310, size: 4, chainHit: 2, knock: 60 },
    lv: { 5: { count: 2 }, 7: { dmg: 0.3 } } },
  annihilator: { name: 'Annihilator', icon: 'AN', elem: 'arcane', kind: 'beam', color: '#f72585', dir: 'strongest', merged: 1,
    desc: 'Colossal armour-shredding beam across the screen.',
    base: { dmg: 130, cd: 2.4, mag: 2, reload: 2.5, count: 1, dur: 1.5, range: 820, size: 14, shred: 5 },
    lv: { 5: { dur: 0.4 }, 7: { count: 1 } } },
  hydra: { name: 'Hydra Barrage', icon: 'HB', elem: 'fire', kind: 'gun', color: '#ff9e00', dir: 'elite', style: 'rocket', merged: 1,
    desc: 'Volleys of homing explosive rockets.',
    base: { dmg: 22, cd: 0.5, mag: 4, reload: 2.2, count: 4, spread: 1.6, speed: 350, pierce: 0, range: 540, size: 5, homing: 6, explode: 58 },
    lv: { 5: { count: 2 }, 7: { area: 0.3 } } },
  cyclone: { name: 'Cyclone Glaives', icon: 'CG', elem: 'phys', kind: 'orbit', color: '#ffffff', dir: 'nearest', merged: 1,
    desc: 'Six glaives pulse outward and back in a storm.',
    base: { dmg: 30, count: 6, dur: 6, reload: 1.4, radius: 70, spin: 4.2, size: 12, range: 170, pulse: 1 },
    lv: { 5: { count: 2 }, 7: { dmg: 0.4 } } },
  pinball: { name: 'Pinball Magnum', icon: 'PM', elem: 'phys', kind: 'gun', color: '#caffbf', dir: 'nearest', style: 'disc', merged: 1,
    desc: 'Magnum rounds that ricochet 6 times. Crits often.',
    base: { dmg: 22, cd: 0.35, mag: 8, reload: 1.2, count: 1, spread: 0.05, speed: 720, pierce: 0, range: 470, size: 5, bounce: 6, critBonus: 0.2 },
    lv: { 5: { bounce: 3 }, 7: { count: 1 } } },
  plague: { name: 'Plague Mortar', icon: 'PL', elem: 'poison', kind: 'lob', color: '#70e000', dir: 'cluster', merged: 1,
    desc: 'Toxic shells: huge blast plus a lingering plague pool.',
    base: { dmg: 46, cd: 1.4, mag: 3, reload: 2.2, count: 1, spread: 40, range: 540, area: 96, dur: 5, flight: 0.9, explode: 1 },
    lv: { 5: { count: 1 }, 7: { area: 0.3 } } },
  singularity: { name: 'Singularity Mines', icon: 'SI', elem: 'arcane', kind: 'mine', color: '#9d4edd', dir: 'nearest', merged: 1,
    desc: 'Mines open a black hole, then detonate.',
    base: { dmg: 55, cd: 0.8, mag: 4, reload: 2.2, count: 1, explode: 95, life: 16, range: 600, singularity: 1 },
    lv: { 5: { count: 1 }, 7: { dmg: 0.5 } } },
  hive: { name: 'Drone Hive', icon: 'DH', elem: 'shock', kind: 'gun', color: '#ffee32', dir: 'lowhp', drones: 1, merged: 1,
    desc: 'Four drones with SMG fire rates.',
    base: { dmg: 6.5, cd: 0.12, mag: 40, reload: 1.8, count: 4, spread: 0.1, speed: 640, pierce: 0, range: 440, size: 3 },
    lv: { 5: { count: 2 }, 7: { dmg: 0.4 } } },
  siege: { name: 'Siege Repeater', icon: 'SR', elem: 'phys', kind: 'gun', color: '#e9c46a', dir: 'armour', style: 'bolt', spinup: 1, merged: 1,
    desc: 'Automatic heavy bolts. Pierce, shred, knockback.',
    base: { dmg: 17, cd: 0.15, mag: 60, reload: 2.4, count: 1, spread: 0.08, speed: 860, pierce: 4, range: 560, size: 4, knock: 140, shred: 2 },
    lv: { 5: { pierce: 3 }, 7: { count: 1 } } },
  zero: { name: 'Absolute Zero', icon: 'AZ', elem: 'ice', kind: 'lob', color: '#caf0f8', dir: 'cluster', merged: 1,
    desc: 'Ice meteors that flash-freeze everything hit.',
    base: { dmg: 18, cd: 1.3, mag: 3, reload: 1.8, count: 8, spread: 110, range: 500, area: 48, flight: 0.7, explode: 1, freezeHit: 1 },
    lv: { 5: { count: 3 }, 7: { dmg: 0.4 } } },
  neuro: { name: 'Neurotoxin Arc', icon: 'NA', elem: 'poison', elem2: 'shock', kind: 'chain', color: '#d9ed92', dir: 'cluster', merged: 1,
    desc: 'Toxic lightning. Every arc spreads plague.',
    base: { dmg: 9, cd: 0.25, mag: 12, reload: 1.6, count: 1, chain: 6, range: 360, jump: 150 },
    lv: { 5: { chain: 3 }, 7: { count: 1 } } },

  // ---- Show-season weapons
  siphon: { name: 'Bullet Siphon', icon: 'BU', elem: 'arcane', kind: 'siphon', color: '#ff3df2', dir: 'nearest',
    desc: 'Eats enemy bullets that come near you and spits them back. No reloads. No ammo either, until the screen is full of bullets.',
    base: { dmg: 18, cd: 0.08, mag: 40, area: 90, speed: 640, range: 460, size: 4.5, pierce: 0, spread: 0.08, count: 1 },
    lv: { 3: { count: 1 }, 5: { pierce: 1 }, 7: { dmg: 0.4 } } },
  committee: { name: 'Committee Cannon', icon: 'CC', elem: 'phys', kind: 'gun', committee: 1, color: '#ffd6a5', dir: 'strongest',
    desc: 'Three barrels, three directives, zero consensus. Set each barrel in the pause menu.',
    base: { dmg: 9, cd: 0.45, mag: 9, reload: 1.6, count: 1, spread: 0.05, speed: 640, pierce: 0, range: 450, size: 4 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  grudge: { name: 'Grudge Rifle', icon: 'GR', elem: 'phys', kind: 'gun', grudge: 1, color: '#ff4d6d', dir: 'revenge', style: 'bolt',
    desc: 'Remembers whatever last hurt you. Hunts it across the whole map. Triple damage to it. Very healthy.',
    base: { dmg: 20, cd: 0.6, mag: 5, reload: 1.5, count: 1, spread: 0.02, speed: 900, pierce: 0, range: 480, size: 4, homing: 3 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
  wake: { name: 'Wake Blade', icon: 'WB', elem: 'phys', kind: 'wake', color: '#e0fbfc', dir: 'nearest', noTarget: 1,
    desc: 'Your flight path becomes a blade. Keep moving, or it is just very expensive litter.',
    base: { dmg: 22, dur: 2.2, area: 22, range: 0 },
    lv: { 3: { area: 0.3 }, 5: { dur: 0.5 }, 7: { dmg: 0.5 } } },
  scrapcannon: { name: 'Scrap Cannon', icon: 'SK', elem: 'phys', kind: 'gun', scrapAmmo: 1, color: '#ffb400', dir: 'strongest', style: 'scrap',
    desc: 'Fires your savings. 1 scrap per shot, enormous bang. Financial advisers weep.',
    base: { dmg: 55, cd: 0.8, mag: 99, reload: 0.5, count: 1, spread: 0.1, speed: 520, pierce: 0, range: 480, size: 7, explode: 55, knock: 120 },
    lv: { 3: { area: 0.25 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },
  mimic: { name: 'Mimic Core', icon: 'MI', elem: 'arcane', kind: 'mimic', color: '#f15bb5', dir: 'nearest',
    desc: 'Copies the attack pattern of the last shooter you killed. It is not plagiarism if you win.',
    base: { dmg: 10, cd: 0.9, mag: 6, reload: 1.8, count: 1, speed: 330, range: 430, size: 5, pierce: 1 },
    lv: { 3: { dmg: 0.3 }, 5: { count: 1 }, 7: { dmg: 0.4 } } },
  parasite: { name: 'Parasite Seeder', icon: 'PS', elem: 'poison', kind: 'gun', parasite: 1, color: '#b5e48c', dir: 'highhp', style: 'needle',
    desc: 'Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green.',
    base: { dmg: 11, cd: 0.4, mag: 8, reload: 1.6, count: 1, spread: 0.08, speed: 560, pierce: 0, range: 430, size: 3.5, dur: 8 },
    lv: { 3: { count: 1 }, 5: { dur: 0.5 }, 7: { dmg: 0.4 } } },
  thermal: { name: 'Thermal Lance', icon: 'TH', elem: 'fire', kind: 'beam', heat: 1, color: '#ff5400', dir: 'nearest',
    desc: 'No magazine, just heat. Overheat and it vents a fireball around you. Warranty void.',
    base: { dmg: 38, cd: 0, mag: 1, reload: 1.3, count: 1, dur: 3.2, range: 300, size: 5, area: 150 },
    lv: { 3: { dur: 0.3 }, 5: { area: 0.3 }, 7: { dmg: 0.4 } } },
  tether: { name: 'Tether Coil', icon: 'TE', elem: 'shock', kind: 'tether', color: '#9ef0ff', dir: 'highhp',
    desc: 'Ties two monsters together with a lightning leash and makes them hug. Violently.',
    base: { dmg: 16, cd: 1.1, mag: 3, reload: 1.8, count: 1, dur: 3, range: 380, pull: 170, jump: 240 },
    lv: { 3: { count: 1 }, 5: { dur: 0.4 }, 7: { dmg: 0.5 } } },
  gacha: { name: 'Gacha Blaster', icon: 'GB', elem: 'phys', kind: 'gun', gacha: 1, color: '#ffd23f', dir: 'nearest',
    desc: 'Every magazine is a loot box. Every loot box is a lie. Except the Legendary ones. Those explode.',
    base: { dmg: 12, cd: 0.22, mag: 12, reload: 1.3, count: 1, spread: 0.06, speed: 650, pierce: 0, range: 440, size: 4 },
    lv: { 3: { pierce: 1 }, 5: { count: 1 }, 7: { dmg: 0.3 } } },
  prequel: { name: 'Prequel Launcher', icon: 'PQ', elem: 'fire', kind: 'prequel', color: '#ff9e00', dir: 'cluster',
    desc: 'The explosion happens first. The shell arrives afterwards, flying backwards into the barrel, still angry.',
    base: { dmg: 34, cd: 1.1, mag: 3, reload: 2.0, count: 1, area: 70, speed: 520, range: 480, spread: 40 },
    lv: { 3: { area: 0.25 }, 5: { count: 1 }, 7: { dmg: 0.5 } } },

  // ---- Show-season fusions
  hailreturn: { name: 'Hailreturn', icon: 'HR', elem: 'ice', kind: 'siphon', color: '#caf0f8', dir: 'nearest', style: 'shard', merged: 1,
    desc: 'Their bullets. Your ice. Everyone else\'s problem. Returned shots freeze on hit.',
    base: { dmg: 20, cd: 0.06, mag: 70, area: 105, speed: 700, range: 500, size: 5, pierce: 2, spread: 0.1, count: 1, freezeHit: 1 },
    lv: { 5: { count: 1 }, 7: { dmg: 0.4 } } },
  plaguetrail: { name: 'Plague Trail', icon: 'PT', elem: 'poison', kind: 'wake', color: '#70e000', dir: 'nearest', noTarget: 1, merged: 1,
    desc: 'You leave a lane of plague behind you. Lead the siege through it and wave.',
    base: { dmg: 30, dur: 4, area: 34, range: 0 },
    lv: { 5: { area: 0.3 }, 7: { dmg: 0.5 } } },
  salvage: { name: 'Salvage Barrage', icon: 'SB', elem: 'fire', kind: 'lob', scrapAmmo: 1, salvage: 1, color: '#ffb400', dir: 'cluster', merged: 1,
    desc: 'Shells cost scrap. Shells make scrap. It is basically a pyramid scheme with explosions.',
    base: { dmg: 50, cd: 0.9, mag: 99, reload: 0.5, count: 3, spread: 60, range: 540, area: 80, flight: 0.9, explode: 1 },
    lv: { 5: { count: 1 }, 7: { area: 0.3 } } },
};

const MERGES = [
  { a: 'flamer',  b: 'frost',     out: 'steam' },
  { a: 'shotgun', b: 'tesla',     out: 'thunderbuck' },
  { a: 'railgun', b: 'prism',     out: 'annihilator' },
  { a: 'rocket',  b: 'seeker',    out: 'hydra' },
  { a: 'glaive',  b: 'orbit',     out: 'cyclone' },
  { a: 'blaster', b: 'ricochet',  out: 'pinball' },
  { a: 'venom',   b: 'mortar',    out: 'plague' },
  { a: 'mines',   b: 'void',      out: 'singularity' },
  { a: 'drone',   b: 'smg',       out: 'hive' },
  { a: 'arbalest', b: 'gatling',  out: 'siege' },
  { a: 'frost',   b: 'hailstorm', out: 'zero' },
  { a: 'needler', b: 'tesla',     out: 'neuro' },
  { a: 'siphon',  b: 'frost',     out: 'hailreturn' },
  { a: 'wake',    b: 'venom',     out: 'plaguetrail' },
  { a: 'scrapcannon', b: 'mortar', out: 'salvage' },
];
const MERGE_MIN_LEVEL = 4;

// Spells: autocast on cooldown, occupy spell slots.
const SPELLS = {
  meteor: { name: 'Meteor', icon: 'ME', elem: 'fire', kind: 'strike', color: '#ff5400', dir: 'cluster',
    desc: 'Calls a meteor on the target. Leaves burning ground.',
    base: { dmg: 65, cd: 5, count: 1, area: 88, delay: 0.7, range: 520, dur: 2 },
    lv: { 3: { count: 1 }, 5: { area: 0.3 }, 7: { count: 1 } } },
  frostnova: { name: 'Frost Nova', icon: 'FN', elem: 'ice', kind: 'nova', color: '#90e0ef', dir: 'nearest',
    desc: 'Freezing blast around you. Erases enemy bullets.',
    base: { dmg: 22, cd: 7, area: 165, range: 170 },
    lv: { 3: { area: 0.2 }, 5: { dmg: 0.5 }, 7: { cd: -0.25 } } },
  thunder: { name: 'Thunderstorm', icon: 'TS', elem: 'shock', kind: 'thunder', color: '#fdf0d5', dir: 'strongest',
    desc: 'Lightning strikes several targets at once.',
    base: { dmg: 36, cd: 6, count: 5, area: 48, range: 520 },
    lv: { 3: { count: 2 }, 5: { dmg: 0.4 }, 7: { count: 3 } } },
  blackhole: { name: 'Black Hole', icon: 'BH', elem: 'arcane', kind: 'zone', color: '#7209b7', dir: 'cluster',
    desc: 'Tears open a singularity that drags and crushes.',
    base: { dmg: 16, cd: 10, area: 125, dur: 3, pull: 210, range: 460 },
    lv: { 3: { dur: 0.3 }, 5: { area: 0.3 }, 7: { dmg: 0.6 } } },
  heal: { name: 'Rejuvenate', icon: 'RJ', elem: 'poison', kind: 'heal', color: '#80ffdb', dir: 'nearest', noTarget: 1,
    desc: 'Restores a portion of your health.',
    base: { dmg: 0.15, cd: 14, range: 0 },
    lv: { 3: { cd: -0.15 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
  warp: { name: 'Time Warp', icon: 'TW', elem: 'arcane', kind: 'warp', color: '#b8c0ff', dir: 'nearest', noTarget: 1,
    desc: 'Slows every enemy and bullet to a crawl.',
    base: { dmg: 0, cd: 16, dur: 3, range: 0 },
    lv: { 3: { dur: 0.3 }, 5: { cd: -0.2 }, 7: { dur: 0.4 } } },
  barrier: { name: 'Aegis Barrier', icon: 'AE', elem: 'arcane', kind: 'barrier', color: '#48cae4', dir: 'nearest', noTarget: 1,
    desc: 'Shield that reflects enemy bullets and blocks contact.',
    base: { dmg: 12, cd: 12, dur: 3, area: 80, range: 0 },
    lv: { 3: { dur: 0.35 }, 5: { area: 0.3 }, 7: { cd: -0.25 } } },
  bladestorm: { name: 'Blade Storm', icon: 'BS', elem: 'phys', kind: 'ring', color: '#e9ecef', dir: 'nearest', noTarget: 1,
    desc: 'Explodes a ring of blades outward.',
    base: { dmg: 19, cd: 6, count: 16, speed: 460, pierce: 3, range: 360, size: 6 },
    lv: { 3: { count: 8 }, 5: { pierce: 3 }, 7: { dmg: 0.5 } } },
  cloud: { name: 'Plague Cloud', icon: 'PC', elem: 'poison', kind: 'zone', color: '#9ef01a', dir: 'cluster',
    desc: 'A drifting cloud of stacking poison.',
    base: { dmg: 11, cd: 9, area: 115, dur: 5, pull: 0, range: 460 },
    lv: { 3: { dur: 0.4 }, 5: { area: 0.3 }, 7: { dmg: 0.6 } } },
  sentry: { name: 'Sentry Turret', icon: 'SN', elem: 'shock', kind: 'sentry', color: '#ffd60a', dir: 'nearest', noTarget: 1,
    desc: 'Deploys an auto-turret that uses this directive.',
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
  might:     { name: 'Might',            icon: 'MT', max: 8, v: 0.12, fmt: v => `+${pc(v)} damage`, apply: (P, v) => { P.might += v; } },
  haste:     { name: 'Trigger Discipline', icon: 'TD', max: 8, v: 0.10, fmt: v => `+${pc(v)} fire rate`, apply: (P, v) => { P.haste += v; } },
  reload:    { name: 'Quick Hands',      icon: 'QH', max: 6, v: 0.15, fmt: v => `+${pc(v)} reload speed`, apply: (P, v) => { P.reloadSpd += v; } },
  mag:       { name: 'Extended Mags',    icon: 'EM', max: 6, v: 0.20, fmt: v => `+${pc(v)} magazine size`, apply: (P, v) => { P.magMult += v; } },
  multishot: { name: 'Multishot',        icon: 'MS', max: 3, v: 1, minRarity: 2, fmt: v => `+${Math.round(v)} projectile for all weapons`, apply: (P, v) => { P.multishot += Math.round(v); } },
  velocity:  { name: 'Velocity',         icon: 'VE', max: 5, v: 0.12, fmt: v => `+${pc(v)} projectile speed and range`, apply: (P, v) => { P.projSpeed += v; P.range += v * 0.6; } },
  area:      { name: 'Blast Radius',     icon: 'BR', max: 6, v: 0.12, fmt: v => `+${pc(v)} area of effect`, apply: (P, v) => { P.area += v; } },
  duration:  { name: 'Longevity',        icon: 'LG', max: 5, v: 0.15, fmt: v => `+${pc(v)} effect duration`, apply: (P, v) => { P.dur += v; } },
  pierce:    { name: 'Penetrator',       icon: 'PN', max: 4, v: 1, fmt: v => `+${Math.round(v)} pierce`, apply: (P, v) => { P.pierce += Math.round(v); } },
  crit:      { name: 'Deadeye',          icon: 'DE', max: 6, v: 0.05, fmt: v => `+${pc(v)} crit chance`, apply: (P, v) => { P.crit += v; } },
  critdmg:   { name: 'Executioner',      icon: 'EX', max: 6, v: 0.25, fmt: v => `+${pc(v)} crit damage`, apply: (P, v) => { P.critDmg += v; } },
  vital:     { name: 'Vital Core',       icon: 'VC', max: 8, v: 15, fmt: v => `+${Math.round(v)} max HP (and heal it)`, apply: (P, v, G) => { P.maxHp += Math.round(v); G.player.hp += Math.round(v); } },
  regen:     { name: 'Nanites',          icon: 'NA', max: 5, v: 0.3, fmt: v => `+${v.toFixed(1)} HP/sec regen`, apply: (P, v) => { P.regen += v; } },
  grip:      { name: 'Sticky Cilia',     icon: 'SC', max: 5, v: 0.22, fmt: v => `+${pc(v)} traction: sharper turns, less drift`, apply: (P, v) => { P.traction += v; } },
  hydro:     { name: 'Hydrodynamic Head', icon: 'HH', max: 3, v: 0.12, fmt: v => `+${pc(v)} traction and +${pc(v / 2)} swim speed`, apply: (P, v) => { P.traction += v; P.speed += v / 2; } },
  speed:     { name: 'Sprint Servos',    icon: 'SP', max: 5, v: 0.08, fmt: v => `+${pc(v)} move speed`, apply: (P, v) => { P.speed += v; } },
  magnet:    { name: 'Tractor Field',    icon: 'TF', max: 5, v: 0.3, fmt: v => `+${pc(v)} pickup range`, apply: (P, v) => { P.magnet += v; } },
  armour:    { name: 'Plating',          icon: 'PT', max: 6, v: 1, fmt: v => `+${Math.round(v)} armour (flat damage reduction)`, apply: (P, v) => { P.armour += Math.round(v); } },
  luck:      { name: 'Fortune',          icon: 'FO', max: 5, v: 0.15, fmt: v => `+${pc(v)} luck (rarer loot, more drops)`, apply: (P, v) => { P.luck += v; } },
  vamp:      { name: 'Vampiric Rounds',  icon: 'VR', max: 5, v: 0.08, fmt: v => `Heal ${v.toFixed(2)} HP per kill`, apply: (P, v) => { P.lifesteal += v; } },
  pyro:      { name: 'Pyromancy',        icon: 'PY', max: 5, v: 0.25, fmt: v => `+${pc(v)} fire damage and burn`, apply: (P, v) => { P.elem.fire += v; } },
  cryo:      { name: 'Cryomancy',        icon: 'CY', max: 5, v: 0.25, fmt: v => `+${pc(v)} frost damage and chill`, apply: (P, v) => { P.elem.ice += v; } },
  storm:     { name: 'Stormcaller',      icon: 'SC', max: 5, v: 0.25, fmt: v => `+${pc(v)} shock damage, +1 chain`, apply: (P, v) => { P.elem.shock += v; P.chain += 1; } },
  toxin:     { name: 'Toxicology',       icon: 'TX', max: 5, v: 0.25, fmt: v => `+${pc(v)} poison damage, +3 max stacks`, apply: (P, v) => { P.elem.poison += v; P.poisonCap += 3; } },
  arcanum:   { name: 'Arcanum',          icon: 'AR', max: 5, v: 0.25, fmt: v => `+${pc(v)} arcane damage`, apply: (P, v) => { P.elem.arcane += v; } },
  kinetic:   { name: 'Ballistics',       icon: 'BA', max: 5, v: 0.25, fmt: v => `+${pc(v)} kinetic damage`, apply: (P, v) => { P.elem.phys += v; } },
  catalyst:  { name: 'Catalyst',         icon: 'CT', max: 5, v: 0.35, fmt: v => `+${pc(v)} elemental reaction damage`, apply: (P, v) => { P.react += v; } },
  echo:      { name: 'Spell Echo',       icon: 'SE', max: 5, v: 0.10, fmt: v => `-${pc(v)} spell cooldowns`, apply: (P, v) => { P.cdr = Math.max(0.4, P.cdr - v); } },
  scholar:   { name: 'Scholar',          icon: 'SH', max: 5, v: 0.12, fmt: v => `+${pc(v)} experience gained`, apply: (P, v) => { P.xp += v; } },
  temporal:  { name: 'Temporal Loop',    icon: 'TL', max: 3, v: 1, minRarity: 1, fmt: () => `+1 max Rewind charge, +25% Chrono energy`, apply: (P, v, G) => { G.chrono.max += 1; P.chronoGain += 0.25; } },
  salvage:   { name: 'Salvager',         icon: 'SV', max: 5, needsScrap: 1, v: 0.25, fmt: v => `+${pc(v)} scrap from kills`, apply: (P, v) => { P.scrap += v; } },
  lastround: { name: 'Last Word',        icon: 'LW', max: 3, v: 1, fmt: v => `Last bullet of every magazine deals x${3 + Math.round(v)} damage and explodes`, apply: (P, v) => { P.lastRound += Math.round(v); } },
  tactical:  { name: 'Tactical Reload',  icon: 'TR', max: 4, v: 1, fmt: v => `Starting a reload sends out a shockwave that deletes nearby bullets (+${40 * Math.round(v)} radius)`, apply: (P, v) => { P.tactical += Math.round(v); } },
  focus:     { name: 'Focus Lock',       icon: 'FL', max: 3, v: 0.3, fmt: v => `+3% damage per second on the same target, up to +${pc(v)} more`, apply: (P, v) => { P.focus += v; } },
  overkill:  { name: 'Overkill Transfer', icon: 'OK', max: 3, v: 0.5, fmt: v => `${pc(v)} of excess kill damage jumps to the next enemy`, apply: (P, v) => { P.overkill += v; } },
  crossfire: { name: 'Crossfire Protocol', icon: 'CF', max: 3, v: 0.25, fmt: v => `Weapons sharing a target: +${pc(v)} damage. All three on different targets: +${pc(v)} fire rate`, apply: (P, v) => { P.crossfire += v; } },
  momentum:  { name: 'Momentum',         icon: 'MO', max: 4, v: 0.15, fmt: v => `Up to +${pc(v * 1.5)} damage the faster you are moving`, apply: (P, v) => { P.momentum += v; } },
  anchorlink:{ name: 'Egg Bond',         icon: 'EB', max: 3, v: 0.3, fmt: v => `Near the egg: +${pc(v)} fire rate. Away from it: +${pc(v)} crit chance`, apply: (P, v) => { P.anchorLink += v; } },
  future:    { name: 'Future Rounds',    icon: 'FU', max: 4, v: 0.1, fmt: v => `${pc(v)} of shots appear already next to their target`, apply: (P, v) => { P.future += v; } },
  echoinherit: { name: 'Echo Inheritance', icon: 'EI', max: 1, v: 1, minRarity: 1, fmt: () => `Paradox Echoes also cast your spells and last twice as long`, apply: (P) => { P.echoInherit = 1; } },
  evasion:   { name: 'Evasion',          icon: 'EV', max: 5, v: 0.04, fmt: v => `+${pc(v)} chance to dodge hits`, apply: (P, v) => { P.dodge = Math.min(0.5, P.dodge + v); } },
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
  juggernaut: { name: 'Alpha Swimmer', hp: 420, speed: 34, armour: 12, r: 28, dmg: 30, xp: 20, color: '#d4c1a4', shape: 'sperm', ai: 'chase', from: 300, w: 0.6 },
};

const BOSSES = [
  { id: 'queen',    name: 'THE MACROPHAGE QUEEN', hp: 2600, speed: 46, armour: 2, r: 44, dmg: 25, xp: 60, color: '#ff4d8d', shape: 'cell', patterns: ['spiral', 'summon', 'ring', 'aimedFan'] },
  { id: 'colossus', name: 'THE ANTIBODY COLOSSUS', hp: 4200, speed: 36, armour: 10, r: 52, dmg: 35, xp: 90, color: '#ffd23f', shape: 'antibody', patterns: ['ring', 'charge', 'aimedFan', 'doubleSpiral'] },
  { id: 'voideye',  name: 'THE IMMUNE EYE',   hp: 3400, speed: 52, armour: 4, r: 46, dmg: 30, xp: 80, color: '#7b2cbf', shape: 'eye', patterns: ['doubleSpiral', 'blink', 'ring', 'flower'] },
];
const BOSS_INTERVAL = 180; // seconds

// Field power-ups.
const POWERUPS = {
  magnet: { name: 'MAGNET',  letter: 'M', color: '#4cc9f0', desc: 'All XP flies to you' },
  nuke:   { name: 'ACID FLUSH',    letter: 'N', color: '#ff595e', desc: 'Obliterates nearby enemies' },
  rage:   { name: 'ADRENALINE', letter: 'O', color: '#ff924c', desc: 'Double fire rate, no reloads' },
  heal:   { name: 'GLUCOSE HIT',  letter: '+', color: '#8ac926', desc: 'Restore 35% HP' },
  shield: { name: 'SHIELD',  letter: 'S', color: '#48cae4', desc: 'Invulnerable for 5s' },
  freeze: { name: 'STASIS',  letter: 'F', color: '#a2d2ff', desc: 'Freeze all enemies' },
  chest:  { name: 'LOOT BOX', letter: '?', color: '#ffca3a', desc: 'Free upgrade' },
};

// ---------------------------------------------------------------- The Egg
// The egg sits at the world origin: the arena's centre. Standing in its glow heals you.
const CORE = { r: 80, sanctuary: 290, arena: 2400 };
// Break into the egg: reach EGG.level and its membrane becomes vulnerable. Destroy it to be born (you win).
const EGG = { level: 60, hpBase: 150000, armour: 8 };
// Extra weapon slots unlock at these levels (3 to start, 6 at most).
const SLOT_LEVELS = [15, 30, 45];

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
const PAL = { you: '#4dff9a', danger: '#ff3b3b', reward: '#ffd23f', upgrade: '#5fd4e8', pickup: '#d983e8' };

// ---------------------------------------------------------------- Weapon upgrade trees
// Every weapon has a tree: at these levels you pick one of two branch perks (the tree is fixed per weapon,
// so you can plan ahead in the Armoury). tier: which milestone it can appear at. fit(d): which weapons it suits.
const PERK_LEVELS = [3, 5, 8, 10];
const MAX_WLVL = 10; // weapons level to 10; Lv 10 is the mastery branch
const MULTI_KINDS = ['gun', 'lob', 'chain', 'mine', 'orbit', 'ring', 'strike', 'siphon', 'mimic', 'tether', 'prequel'];
const hasArea = d => !!(d.base.area || d.base.explode > 1 || d.base.aura || d.base.radius || d.style === 'flame' || d.kind === 'orbit');
const isProj = d => PROJ_KINDS.includes(d.kind);
const PERKS = {
  // Tier 1 (Lv 3): tune the gun.
  power:    { tier: 1, icon: 'PW', color: '#ff924c', name: 'Hot Load',        desc: '+40% damage.' },
  rapid:    { tier: 1, icon: 'RP', color: '#ffd23f', name: 'Hair Trigger',    desc: '25% faster cooldown and reload.' },
  deepmag:  { tier: 1, icon: 'DM', color: '#9fb3c8', name: 'Deep Magazine',   desc: '+60% magazine size.', fit: d => (d.base.mag || 1) > 1 },
  wide:     { tier: 1, icon: 'WD', color: '#c77dff', name: 'Wide Bore',       desc: '+35% area and +15% range.', fit: hasArea },
  pierce:   { tier: 1, icon: 'PC', color: '#e0fbff', name: 'Drill Tips',      desc: 'Shots pierce 2 more enemies.', fit: d => d.kind === 'gun' || d.kind === 'ring' },
  ricochet: { tier: 1, icon: 'RC', color: '#8dffc0', name: 'Rubber Rounds',   desc: 'Shots bounce to 2 more targets.', fit: isProj },
  keen:     { tier: 1, icon: 'KN', color: '#fee440', name: 'Keen Edge',       desc: '+15% crit chance.' },
  chill:    { tier: 1, icon: 'CH', color: '#6fd8ff', name: 'Cold Snap',       desc: 'Hits chill: enemies slow by 35% for 1.5s.' },
  ignite:   { tier: 1, icon: 'IG', color: '#ff7a2f', name: 'Incendiary',      desc: 'Hits set enemies on fire for 25% of the hit per second.' },
  // Tier 2 (Lv 5): change how it plays.
  seek:     { tier: 2, icon: 'SK', color: '#d0a3ff', name: 'Smart Rounds',    desc: 'Shots home in on targets.', fit: isProj },
  split:    { tier: 2, icon: 'SL', color: '#ffd166', name: 'Fragmenting',     desc: 'Shots burst into 3 shards on first hit.', fit: isProj },
  arc:      { tier: 2, icon: 'AR', color: '#ffe94a', name: 'Static Charge',   desc: '30% of hits arc to a nearby enemy for 50% damage.' },
  execute:  { tier: 2, icon: 'EX', color: '#ff4d6d', name: 'Finisher',        desc: '+60% damage to enemies under 35% health.' },
  venom:    { tier: 2, icon: 'VN', color: '#8dff4a', name: 'Venom Glands',    desc: 'Hits add a stacking poison.' },
  freeze:   { tier: 2, icon: 'FZ', color: '#bde0fe', name: 'Cryo Core',       desc: '12% of hits freeze non-boss enemies solid.' },
  blast:    { tier: 2, icon: 'BL', color: '#ff5a36', name: 'Payload',         desc: 'Hits explode for 35% damage around the target.' },
  volley:   { tier: 2, icon: 'VL', color: '#48cae4', name: 'Extra Barrel',    desc: '+1 projectile.', fit: d => MULTI_KINDS.includes(d.kind) },
  vamp:     { tier: 2, icon: 'VP', color: '#ff8fab', name: 'Leech Rounds',    desc: 'Hits heal you a little (within the lifesteal limit).' },
  giant:    { tier: 2, icon: 'GS', color: '#ffb347', name: 'Big Game',        desc: '+100% damage to elites, bosses and rival champions.' },
  // Tier 3 (Lv 8): capstones.
  overdrive:{ tier: 3, icon: 'OD', color: '#ff3df2', name: 'Overdrive',       desc: '+75% damage.' },
  frenzy:   { tier: 3, icon: 'FR', color: '#ffd23f', name: 'Frenzy',          desc: '40% faster cooldown and reload.' },
  chainburst:{ tier: 3, icon: 'CB', color: '#ff5a36', name: 'Chain Reaction', desc: 'Kills explode for 60% of the killing blow.' },
  slayer:   { tier: 3, icon: 'SY', color: '#ffb347', name: 'Apex Predator',   desc: '+150% damage to elites, bosses and rival champions.' },
  twin:     { tier: 3, icon: 'TW', color: '#48cae4', name: 'Twin Array',      desc: '+2 projectiles.', fit: d => MULTI_KINDS.includes(d.kind) },
  storm:    { tier: 3, icon: 'ST', color: '#ffe94a', name: 'Thunderhead',     desc: '50% of hits arc to 2 nearby enemies for 60% damage.' },
  // Tier 4 (Lv 10): mastery.
  apex:     { tier: 4, icon: 'AX', color: '#ffffff', name: 'Apex Form',       desc: '+100% damage and +20% crit chance.' },
  overclock:{ tier: 4, icon: 'OC', color: '#ffffff', name: 'Overclock',       desc: '50% faster cooldown and reload, +50% magazine.' },
  legion:   { tier: 4, icon: 'LG', color: '#ffffff', name: 'Legion',          desc: '+3 projectiles.', fit: d => MULTI_KINDS.includes(d.kind) },
  lifeline: { tier: 4, icon: 'LF', color: '#ffffff', name: 'Lifeline',        desc: 'Hits heal you (up to four times the usual lifesteal limit).' },
  executioner:{ tier: 4, icon: 'EX', color: '#ffffff', name: 'Executioner',   desc: 'Non-boss enemies under 20% health die instantly when hit.' },
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
const RIVAL = { finish: 840, hpBase: 250, duel: 14, speed: 78, zapR: 240, sight: 950, eggDps: 0.012, spawnR: 1700, pow: 1.1, huntFrom: 150 };

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
  pulsing:   { name: 'Pulsing',      icon: 'PU', color: '#cfe3ff', kinds: PROJ_KINDS, desc: p => `Shots pulse every 0.45s, hitting everything close by for ${Math.round(25 * p)}% damage` },
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
const BOSS_TITLES = { queen: 'Eater of Hopefuls', colossus: 'Head of Border Control', voideye: 'Unblinking Critic of Your Genome' };
const SPONSORS = [
  "Grundle's Discount Ordnance", "Madame Vex's Totally Legal Potions", 'The Committee for Unnecessary Explosions',
  "Big Barry's Scrap and Salvage", 'Glorp Cola: It Glows For A Reason', 'The Ancient Order of Slightly Sticky Relics',
  "Dr Fizzwick's Regrettable Medicines", 'Hovercrab Insurance: We Probably Cover That',
];
const SYSTEM_LINES = {
  start: [
    'Welcome, Swimmer. Four hundred million of you entered. One gets to become a person. No pressure.',
    'Today\'s prize: existence. Today\'s competition: literally everyone you arrived with.',
    'Reminder: you swim yourself. Your job is to make bad decisions in the menus.',
    'Good news: there is an egg. Bad news: so is everyone else\'s plan.',
  ],
  level: [
    'Level up! You are growing. Please stop sprouting weapons from your tail, it upsets the viewers.',
    'Another level. The egg has noticed you. The egg is not impressed yet.',
    'Level up. Please enjoy this complimentary box of violence.',
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
  eggReady: ['The egg has decided you are big enough. Go and break in. Knocking is optional.', 'The egg is ready. Its membrane is not. Shoot it until it agrees.'],
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
  born:       { name: "Congratulations, It's You", desc: 'Broke into the egg and got yourself born. Please enjoy the next eighty years.', reward: 'none' },
  amoeba:     { name: 'Portion Control', desc: 'Let an amoeba eat so much it made the news.', reward: 'none' },
  bigamoeba:  { name: 'Diet Plan', desc: 'Killed an amoeba bigger than a boss.', reward: 'box' },
  rivalkill:  { name: 'Survival of the Fittest', desc: 'Eliminated a rival champion personally. Biology is a contact sport.', reward: 'box' },
  allrivals:  { name: 'Only Child', desc: 'Every rival champion is gone. The egg only has one option now.', reward: 'reroll' },
  eggready:   { name: 'Big Enough', desc: 'Grew strong enough for the egg to take you seriously.', reward: 'heal' },
  slot:       { name: 'Extra Limb', desc: 'Grew an extra weapon slot. The textbooks will need updating.', reward: 'none' },
  kills100:   { name: 'Pest Control', desc: '100 kills. The exterminators\' union has filed a complaint.', reward: 'reroll' },
  kills1000:  { name: 'Statistically Significant', desc: '1,000 kills. You are now a demographic.', reward: 'box' },
  kills5000:  { name: 'Extinction Event', desc: '5,000 kills. Several species have asked you to stop.', reward: 'bossbox' },
  firstloot:  { name: 'Unboxing Influencer', desc: 'Opened your first loot box. Please like and subscribe.', reward: 'none' },
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
  grudge:     { name: 'Petty', desc: 'Killed the thing that hurt you with the Grudge Rifle. Worth it.', reward: 'none' },
  broke:      { name: 'Financially Ruined', desc: 'Ran the Scrap Cannon dry. Please consult a debt counsellor.', reward: 'scrap' },
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
