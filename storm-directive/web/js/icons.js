'use strict';
// Spawn Prawn - weapon and spell icons (24x24 line icons, drawn in currentColor), and weapon-type colours.

// Weapon type = damage element. UI only (in the world, everything you fire stays GFP green).
// Chosen to sit apart from the five meaning colours: you, danger, reward, upgrade, pickup.
const ELEM_UI = { phys: '#c9d6e3', fire: '#ff8a3d', ice: '#8fb3ff', shock: '#eee36a', poison: '#a3d94f', arcane: '#b48cff' };

const IC = {
  // Guns and launchers
  pistol: '<path d="M4 9h13v4h-5l-1 5H8l1-5H4z"/><path d="M17 10h3"/>',
  smg: '<path d="M3 9h15v3H11l-1 3H7l1-3H3z"/><path d="M13 12v5h2v-5"/><path d="M18 10h3"/>',
  shotgun: '<path d="M2 10h13v3H8l-2 4H4l1-4H2z"/><path d="M17 9l4-2M17 11.5h5M17 14l4 2"/>',
  rail: '<path d="M2 12h20"/><path d="M6 9v6M10 9v6M14 9v6"/><circle cx="20" cy="12" r="1.2"/>',
  rocket: '<path d="M12 3c3 2 4 6 4 10l-4 3-4-3c0-4 1-8 4-10z"/><circle cx="12" cy="9" r="1.5"/><path d="M8 13l-2 3 3 1M16 13l2 3-3 1M11 19l1 2 1-2"/>',
  hydra: '<path d="M7 5c2 1 2.5 4 2.5 6.5L7 13l-2.5-1.5C4.5 9 5 6 7 5z"/><path d="M17 5c2 1 2.5 4 2.5 6.5L17 13l-2.5-1.5c0-2.5.5-5.5 2.5-6.5z"/><path d="M12 9c2 1 2.5 4 2.5 6.5L12 17l-2.5-1.5C9.5 13 10 10 12 9z"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-3 2-4 2-7 1 1 2 2 2 4 1-2 1-4 1-7z"/>',
  steam: '<path d="M6 20c-2-3 2-4 0-7s2-4 0-7"/><path d="M12 20c-2-3 2-4 0-7s2-4 0-7"/><path d="M18 20c-2-3 2-4 0-7s2-4 0-7"/>',
  shard: '<path d="M12 2l4 9-4 11-4-11z"/><path d="M8 11h8M12 2v20"/>',
  snowflake: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>',
  hail: '<path d="M7 13a4 4 0 01.5-8 5 5 0 019.5 1.5A3.5 3.5 0 0117 13z"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="16" cy="17" r="1"/>',
  bolt: '<path d="M13 2L5 13h6l-1 9 8-12h-6z"/>',
  buckbolt: '<path d="M2 11h9v3H6l-1 3H3l.5-3H2z"/><path d="M16 5l-3 5h3l-2 5M20 8l-2 4h2l-2 4"/>',
  droplet: '<path d="M12 3c3 5 6 8 6 12a6 6 0 01-12 0c0-4 3-7 6-12z"/><path d="M9 15a3 3 0 003 3"/>',
  biohazard: '<circle cx="12" cy="12" r="2"/><path d="M12 10a4 4 0 01-3.5-6 6 6 0 007 0 4 4 0 01-3.5 6zM13.7 13a4 4 0 017 0 6 6 0 00-3.5 6 4 4 0 01-3.5-6zM10.3 13a4 4 0 01-3.5 6 6 6 0 00-3.5-6 4 4 0 017 0z"/>',
  glaive: '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 3-7 7-7-2 2-3 5-3 8M13.7 13c3.5 2 5 6 3.5 9.5-1-2.5-3.5-4.5-6.5-5M10.3 13c-3.5 2-7.5 1.5-9.5-1.5 2.5.5 5.5-.5 7.5-3"/>',
  cyclone: '<path d="M4 12a8 8 0 0114-5M20 12A8 8 0 016 17"/><path d="M8 12a4 4 0 017-2.5M16 12a4 4 0 01-7 2.5"/><circle cx="12" cy="12" r="1"/>',
  orbit: '<circle cx="12" cy="12" r="2.5"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/><circle cx="20" cy="12" r="1.5"/><circle cx="6.3" cy="17.7" r="1.5"/><circle cx="6.3" cy="6.3" r="1.5"/>',
  prism: '<path d="M8 19L13 5l5 14z"/><path d="M2 11l8.5 3"/><path d="M16.5 13L22 10M17 15l5 1M16.5 17l5 4"/>',
  bigbeam: '<path d="M2 12h20"/><path d="M2 8h20M2 16h20" stroke-dasharray="3 2"/><circle cx="4" cy="12" r="2.5"/>',
  mine: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.9 2.9M15.5 15.5l2.9 2.9M5.6 18.4l2.9-2.9M15.5 8.5l2.9-2.9"/>',
  singularity: '<circle cx="12" cy="12" r="3"/><path d="M12 5a7 7 0 017 7M12 19a7 7 0 01-7-7M19 12a7 7 0 01-4 6.3M5 12a7 7 0 014-6.3"/>',
  seeker: '<ellipse cx="16" cy="7" rx="3.2" ry="2.3" transform="rotate(-35 16 7)"/><path d="M13.6 9c-2 1.5-1 3.5-3 4.5s-2.5 3-4.5 4"/><ellipse cx="8" cy="12" rx="2.2" ry="1.6" transform="rotate(-35 8 12)"/><path d="M6.3 13.3c-1.3 1-.7 2.5-2 3.3"/>',
  gatling: '<path d="M3 8h13M3 12h13M3 16h13"/><path d="M16 6v12h3a2 2 0 002-2V8a2 2 0 00-2-2z"/>',
  drone: '<rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 9L5 5M15 9l4-4M9 15l-4 4M15 15l4 4"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
  hive: '<path d="M8 3l4 2.3v4.6L8 12.2 4 9.9V5.3zM16 7.5l4 2.3v4.6l-4 2.3-4-2.3V9.8zM8 12.2l4 2.3v4.6L8 21.4l-4-2.3v-4.6z"/>',
  disc: '<circle cx="9" cy="14" r="5"/><circle cx="9" cy="14" r="1.5"/><path d="M14 9l3-5 3 4M17 4v6"/>',
  pinball: '<circle cx="7" cy="17" r="3"/><path d="M9 14l4-8 3 7 5-9"/>',
  mortar: '<path d="M3 20c3-12 12-16 18-10"/><circle cx="21" cy="10" r="1.3"/><path d="M3 20h5l-2-4z"/>',
  crossbow: '<path d="M3 21L21 3"/><path d="M5 11c2-4 4-6 6-6M13 19c4-2 6-4 6-6"/><path d="M5 11l8 8"/><path d="M21 3l-4 1 3 3z"/>',
  siege: '<path d="M3 19L19 3M6 21L21 6"/><path d="M5 10c2-4 4-6 6-6M14 19c4-2 6-4 6-6"/><path d="M19 3l-4 .5 3.5 3.5zM21 6l-4 .5"/>',
  void: '<circle cx="12" cy="12" r="8"/><path d="M12 8a4 4 0 104 4"/><circle cx="12" cy="12" r="1.2"/>',
  syringe: '<path d="M14 3l7 7M17.5 6.5l-10 10-3-3 10-10z"/><path d="M4.5 13.5l6 6M6 18l-4 4"/><path d="M10 10l2 2M12.5 7.5l2 2"/>',
  hourglass: '<path d="M6 2h12M6 22h12M7 2c0 6 5 7 5 10s-5 4-5 10M17 2c0 6-5 7-5 10s5 4 5 10"/><path d="M9 19h6"/>',
  neuron: '<circle cx="9" cy="10" r="3"/><path d="M9 7V3M6.4 8.5L3 6.5M6.4 11.5L3 14M11 12.5l5 4 5 1M16 16.5l1 4M18.5 17.5L21 20"/><path d="M11.5 8L15 5"/>',
  siphon: '<path d="M3 4h18l-7 8v6l-4 3v-9z"/><path d="M6 7h12"/>',
  committee: '<path d="M3 7h13M3 12h16M3 17h13"/><path d="M16 5v4M19 10v4M16 15v4"/>',
  grudge: '<circle cx="12" cy="12" r="8"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/><path d="M9 10l2 1M15 10l-2 1M9.5 15.5c1.5-1 3.5-1 5 0"/>',
  wake: '<path d="M3 17c4 0 6-2 8-5s4-6 10-8"/><path d="M3 13c3 0 5-1 6-3M8 21c4-1 7-3 9-6"/>',
  footprints: '<path d="M4 18h3M9 14h3M14 10h3M19 6h2"/><circle cx="5.5" cy="20" r="1"/><circle cx="10.5" cy="16" r="1"/><circle cx="15.5" cy="12" r="1"/><circle cx="20" cy="8" r="1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/><circle cx="12" cy="12" r="6.5"/>',
  mimic: '<rect x="3" y="3" width="12" height="12" rx="2"/><rect x="9" y="9" width="12" height="12" rx="2" stroke-dasharray="2.5 2"/>',
  tick: '<ellipse cx="12" cy="13" rx="4" ry="5.5"/><circle cx="12" cy="6.5" r="1.8"/><path d="M8 11L4 9M8 14l-4 1M8.5 17l-3 3M16 11l4-2M16 14l4 1M15.5 17l3 3"/>',
  thermometer: '<path d="M10 14V5a2 2 0 014 0v9a4 4 0 11-4 0z"/><path d="M12 9v7"/><path d="M16 6h2M16 9h2M16 12h2"/>',
  link: '<rect x="2" y="9" width="10" height="6" rx="3"/><rect x="12" y="9" width="10" height="6" rx="3"/><path d="M9 12h6"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/><circle cx="12" cy="12" r="1.2"/>',
  prequel: '<path d="M4 12a8 8 0 108-8"/><path d="M4 4v5h5"/><path d="M11 12h6M14 9l3 3-3 3"/>',
  boomerang: '<path d="M4 20L12 4l8 16-8-6z"/><path d="M12 9v3"/>',
  salvage: '<circle cx="9" cy="15" r="3"/><circle cx="9" cy="15" r="6" stroke-dasharray="2 2.5"/><path d="M14 8c2-3 5-4 7-3M18 3l3 2-2 3"/>',
  // Reproductive Arsenal
  dna: '<path d="M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/><path d="M8.5 6h7M8.5 18h7M10 9.5h4M10 14.5h4"/>',
  whip: '<path d="M3 20l5-5"/><path d="M8 15c2-4 1-8 5-10s7 1 6 4-5 3-5 6 3 4 6 3"/>',
  nail: '<path d="M4 20l9-9"/><path d="M11 9l4 4"/><path d="M14 6l4 4 2-6z"/>',
  crossbow2: '<path d="M4 20L20 4"/><path d="M6 12c2-3 3-5 6-6M12 18c3-1 5-3 6-6"/><path d="M6 12l6 6"/>',
  bone: '<path d="M7 17l10-10"/><circle cx="6" cy="16" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="18" cy="8" r="2"/>',
  hammer: '<path d="M4 20l9-9"/><rect x="11" y="3" width="10" height="7" rx="1.5" transform="rotate(45 16 6.5)"/>',
  pipette: '<path d="M18 3l3 3-3 3-3-3z"/><path d="M16.5 7.5L6 18l-2 3 3-2 10.5-10.5"/><path d="M5 19l-1 2"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3"/><path d="M7.5 15h9"/>',
  pill: '<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M10 7.5l4 9"/>',
  heart: '<path d="M12 20s-7-4.5-8.5-9A4.5 4.5 0 0112 7a4.5 4.5 0 018.5 4c-1.5 4.5-8.5 9-8.5 9z"/><path d="M5 12h4l1.5-3 2 5 1.5-2h5"/>',
  paddles: '<rect x="3" y="4" width="7" height="10" rx="2"/><rect x="14" y="4" width="7" height="10" rx="2"/><path d="M6.5 14v3M17.5 14v3M6.5 17c0 3 11 3 11 0"/><path d="M11.5 8h1"/>',
  virus: '<circle cx="12" cy="12" r="5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.9 2.9M15.5 15.5l2.9 2.9M5.6 18.4l2.9-2.9M15.5 8.5l2.9-2.9"/><circle cx="12" cy="3" r="1"/><circle cx="12" cy="21" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="21" cy="12" r="1"/>',
  bacteria: '<rect x="5" y="8" width="14" height="8" rx="4"/><path d="M5 12H2M19 12h3M9 8V5M15 16v3M9 16v3M15 8V5"/>',
  spray: '<rect x="4" y="9" width="8" height="12" rx="2"/><path d="M6 9V6h4v3M10 6h3"/><path d="M16 5h.01M19 4h.01M18 8h.01M21 7h.01M20 11h.01"/>',
  drill: '<path d="M3 12h8"/><path d="M11 8h4l6 4-6 4h-4z"/><path d="M13 9l2 6M16 10l1 4"/>',
  web: '<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/>',
  mitosis: '<circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/>',
  ribo: '<ellipse cx="12" cy="8" rx="7" ry="4"/><ellipse cx="12" cy="15" rx="5" ry="3"/><path d="M3 20c3-2 6 2 9 0s6 2 9 0"/>',
  cycler: '<path d="M12 4a8 8 0 017.5 5.5M20 12a8 8 0 01-5.5 7.5M12 20a8 8 0 01-7.5-5.5M4 12a8 8 0 015.5-7.5"/><path d="M19.5 5.5v4h-4M4.5 18.5v-4h4"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 18M8.5 16.5L20 6"/>',
  spike: '<path d="M2 14h5l2-8 3 14 3-10 2 4h5"/>',
  cart: '<rect x="3" y="6" width="18" height="10" rx="1.5"/><path d="M12 8v6M9 11h6"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/>',
  // Spells
  comet: '<circle cx="16" cy="16" r="4"/><path d="M13 13L3 3M12 16L5 9M16 12L9 5"/>',
  nova: '<circle cx="12" cy="12" r="3"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5"/>',
  storm: '<path d="M7 12a4 4 0 01.5-8 5 5 0 019.5 1.5A3.5 3.5 0 0117 12z"/><path d="M12 12l-3 5h4l-2 5"/>',
  spiral: '<path d="M12 12c0-1 1-2 2-1.5s1 2.5-1 3.5-4-.5-4-3 2.5-5 5.5-4.5S21 10 20 14s-5 7-9 6-7-5-6-10 5-7 8-7"/>',
  cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/><path d="M3 5l3-2M21 5l-3-2"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  shuriken: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/><circle cx="12" cy="12" r="1.5"/>',
  cloud: '<path d="M7 17a4 4 0 01.5-8 5.5 5.5 0 0110.5 2 3 3 0 01-.5 6z"/><circle cx="9" cy="20" r=".8"/><circle cx="14" cy="21" r=".8"/>',
  turret: '<rect x="6" y="12" width="12" height="7" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M14 9l6-4M8 19l-2 3M16 19l2 3"/>',
};

const ICON_OF = {
  blaster: 'pistol', smg: 'smg', shotgun: 'shotgun', railgun: 'rail', rocket: 'rocket', flamer: 'flame', frost: 'shard',
  tesla: 'bolt', venom: 'droplet', glaive: 'glaive', orbit: 'orbit', prism: 'prism', mines: 'mine', seeker: 'seeker',
  gatling: 'gatling', drone: 'drone', ricochet: 'disc', mortar: 'mortar', arbalest: 'crossbow', void: 'void', needler: 'syringe',
  hailstorm: 'hail', paradox: 'hourglass', steam: 'steam', thunderbuck: 'buckbolt', annihilator: 'bigbeam', hydra: 'hydra',
  cyclone: 'cyclone', pinball: 'pinball', plague: 'biohazard', singularity: 'singularity', hive: 'hive', siege: 'siege',
  zero: 'snowflake', neuro: 'neuron', siphon: 'siphon', committee: 'committee', grudge: 'grudge', wake: 'wake',
  scrapcannon: 'gear', mimic: 'mimic', parasite: 'tick', thermal: 'thermometer', tether: 'link', gacha: 'dice',
  prequel: 'prequel', hailreturn: 'boomerang', plaguetrail: 'footprints', salvage: 'salvage',
  chromowhip: 'whip', nailgun: 'nail', ciliaflail: 'orbit', collagenbow: 'crossbow2', marrowmortar: 'bone', histonehammer: 'hammer',
  tendonrail: 'rail', zonapunch: 'disc', enzymetorch: 'flame', metaflare: 'rocket', feverpitch: 'thermometer', mitogrenade: 'flask',
  pyrogen: 'mine', acroburst: 'nova', cryopipette: 'pipette', ln2spray: 'spray', embryomortar: 'snowflake', hailswarm: 'hail',
  glacialorbit: 'orbit', nerveimpulse: 'neuron', axonrail: 'spike', synapsedrone: 'drone', pacemaker: 'heart', defib: 'paddles',
  ionchannel: 'bigbeam', antibioticsg: 'pill', mucusweb: 'web', hormonecloud: 'cloud', spermicide: 'spray', enzymedrill: 'drill',
  toxinneedles: 'syringe', viralpayload: 'virus', genesplicer: 'scissors', mitosiscannon: 'mitosis', telomere: 'dna', epiorb: 'void',
  placebo: 'pill', stemmines: 'singularity', retrovirus: 'virus', ribosome: 'ribo',
  spindle: 'cyclone', thermocycler: 'cycler', actionpotential: 'spike', superbug: 'bacteria', crispr: 'dna', cryobank: 'snowflake',
  crashcart: 'cart', osteoclast: 'bone',
  meteor: 'comet', frostnova: 'nova', thunder: 'storm', blackhole: 'spiral', heal: 'cross', warp: 'clock',
  barrier: 'shield', bladestorm: 'shuriken', cloud: 'cloud', sentry: 'turret',
};

const DEF_ID = new Map();
function defId(def) {
  let v = DEF_ID.get(def);
  if (v != null) return v;
  v = '';
  for (const id in WEAPONS) if (WEAPONS[id] === def) v = id;
  for (const id in SPELLS) if (SPELLS[id] === def) v = id;
  DEF_ID.set(def, v);
  return v;
}
// Inline SVG for a weapon or spell definition, stroked in its weapon-type colour (or `color`).
function iconSVG(def, size, color) {
  const id = defId(def);
  const body = IC[ICON_OF[id]] || IC.pistol;
  return `<svg class="wicon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${color || elemCol(def.elem)}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
function elemCol(e) { return ELEM_UI[e] || ELEM_UI.phys; }
