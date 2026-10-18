'use strict';
// Spawn Prawn - how the 24 weapons (weapons24.js) look and read in the menus (v10 clean-up).
//  - Icons: each of the 24 gets its own icon (ICON_OF) and a short, unique badge code (def.icon). Before this they all
//    fell back to the pistol.
//  - Names: a signature slot keeps the old id in w.id (w.sid is the s_ id), and combos, pairings and the Tackle Box
//    look partners up by that old id. The old weapon's name is set to the new one so those screens read right.
//  - Combos, pairings and super combos: only the ones whose weapons are all among the 24 can happen. Their text is
//    rewritten with the new names; menus list only the live ones (wl_combos, wl_pairs, wl_supers).
//  - Field Guide and Gene Bank: 24 weapons (not 123), live combos only, V10 sample sequences, V10 Feats; the
//    Gene Bank's wildcard-weapon shop (archived weapons for DNA) is empty under V10.
// Everything here is off with window.V10_OFF (the wl_* helpers return the old lists).
// Hooks (one line each): ui.js codexHtml (wl_wids, wl_stat, wl_combos, wl_supers, wl_pairs, wl_profiles, wl_feat),
// ui.js renderBank (wl_profiles, wl_starters), ui.js profileHtml (guard), ui.js weapon info panel (wl_combos, wl_pairs),
// loadout.js loadoutCombos (wl_combos, wl_supers, wl_pairs).

const wl_on = () => typeof V10 !== 'undefined' && !!V10 && typeof W24_IDS !== 'undefined';
const wl_old = id => (WEAPONS[id] && WEAPONS[id].sigOf) || id; // the id a slot's w.id carries
let wl_setC = null;
const wl_set = () => wl_setC || (wl_setC = new Set(W24_IDS.map(wl_old)));

// ---------------------------------------------------------------- icons and names
const WL_ICON = { // [IC key (icons.js), badge code]
  v_phys_proj: ['pistol', 'SI'], v_phys_spread: ['shotgun', 'MG'], v_phys_contact: ['tick', 'NW'], v_phys_burst: ['nova', 'PB'],
  v_fire_proj: ['droplet', 'AS'], v_shock_beam: ['bigbeam', 'RF'], v_ice_pool: ['web', 'NE'], v_arcane_proj: ['syringe', 'LP'],
  v_soul_proj: ['ghost', 'RT'], v_flame_pool: ['flame', 'HM'],
  s_void: ['void', 'FT'], s_lard: ['mortar', 'SK'], s_siphon: ['siphon', 'NS'], s_mines: ['mine', 'NM'], s_twin: ['twins', 'SS'],
  s_tesla: ['bolt', 'UC'], s_redtape: ['tape', 'EW'], s_bubble: ['bubble', 'BB'], s_duedate: ['calendar', 'OD'], s_seeker: ['seeker', 'SC'],
  s_peekaboo: ['peek', 'PK'], s_toothfairy: ['mitosis', 'EG'], s_parasite: ['bacteria', 'CB'], s_wake: ['wake', 'TR'],
};
for (const id of W24_IDS) {
  const d = WEAPONS[id], L = WL_ICON[id];
  if (!d || !L) continue;
  if (typeof ICON_OF !== 'undefined') ICON_OF[id] = L[0];
  d.icon = L[1];
  const o = d.sigOf && WEAPONS[d.sigOf];
  if (o && o !== d) { if (o.name0 === undefined) o.name0 = o.name; o.name = d.name; } // (the slot's old id now reads as the new name)
}

// ---------------------------------------------------------------- text for the combos, pairings and super combo that can happen
const WL_TEXT = {
  teacup: 'Family Ties vortices crackle: each one throws an Unwanted Contact chain at what it is pulling in.',
  partyline: 'Every second, each twin sends an Unwanted Contact chain into the crowd.',
  ghosttrail: 'While you are hidden, your burning trail hits 2.5x as hard. The BOO leaves a ring of it round the spot.',
  wormfarm: 'Anything trapped in a bubble gets infected by Chest Burster. Bubble pops hit infected enemies 50% harder.',
  monitor: 'Unwanted Contact jumping through a crowd sets off any Nappy Mine near its path.',
  familytree: 'The enemies Chest Burster raises fire homing Sister Cousin shots.',
  discharge: 'Every 12 bullets There Is No Spoon eats fires an Unwanted Contact chain at four enemies.',
  trailmix: 'Your burning trail drops a Nappy Mine every 1.5s.',
  finalnotice: 'When One of These Days goes off on a taped enemy, the whole bundle takes all of it, not just a share.',
  baitswitch: 'Every egg has a Nappy Mine under it.',
  perfectstorm: 'Your twins drag nearby enemies in towards themselves, and every Unwanted Contact chain from either combo jumps 2 more times.',
};
for (const list of [COMBOS, PAIRINGS, SUPERS]) for (const c of list) if (WL_TEXT[c.id]) { if (c.desc0 === undefined) c.desc0 = c.desc; c.desc = WL_TEXT[c.id]; }

// ---------------------------------------------------------------- what the menus list
const wl_liveC = c => !wl_on() || (wl_set().has(c.a) && wl_set().has(c.b));
const wl_combos = () => wl_on() ? COMBOS.filter(wl_liveC) : COMBOS;
const wl_pairs = () => wl_on() ? PAIRINGS.filter(wl_liveC) : PAIRINGS;
const wl_supers = () => wl_on() ? SUPERS.filter(s => [s.x, s.y].every(id => COMBO_BY[id] && wl_liveC(COMBO_BY[id]))) : SUPERS;
const wl_wids = () => wl_on() ? W24_IDS.slice() : Object.keys(WEAPONS); // Field Guide weapon list
const wl_stat = id => (META.wstats && (META.wstats[wl_old(id)] || META.wstats[id])) || null; // wstats are logged under w.id
const wl_profiles = () => wl_on() ? Object.keys(PROFILES).filter(id => PROFILES[id].s10) : Object.keys(PROFILES);
const wl_starters = list => wl_on() ? [] : list; // the Gene Bank's wildcard weapons (archived under V10)
const wl_feat = id => !wl_on() || !SPELLS[id] || SPELLS[id].kind === 'f10';
