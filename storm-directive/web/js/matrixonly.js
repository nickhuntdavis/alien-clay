'use strict';
// Spawn Prawn - matrix only (user, 23 Oct): for now the game deals only what redesign docs/MODIFIER_MATRIX.md covers.
//  - WEAPONS: the matrix's 27 (MATRIX_ONLY.weapons), less There Is No Spoon (a sperm passive now: spoon.js). Every other weapon is put on hold (weapons24.js W24_HOLD), so no
//    draft, starting pick, rescue or Sandbox offers it. The v9 samples stay on the Sample Rack (user, 24 Oct): like every
//    sample they start with an offer from the matrix's weapons (samplestart.js), not their v9 starters.
//  - MODIFIERS: the matrix's 25 (MATRIX_ONLY.mods, plus Switched at Birth's card). The others are never offered;
//    a slot that already holds one keeps it.
// To undo: MATRIX_ONLY.on = false before this file runs, or matrixRestore() at runtime (tests that need the full roster).
// Hooks: none in shared files. Wraps modmatrix.js modOk. Loads after samples9.js.

const MATRIX_ONLY = {
  on: true,
  weapons: ['v_phys_proj', 'v_phys_spread', 'v_phys_contact', 'v_phys_burst', 'v_fire_proj', 'v_shock_beam', 'v_ice_pool', 'v_arcane_proj',
    'v_soul_proj', 'v_flame_pool', 's_void', 's_lard', 's_mines', 's_twin', 's_tesla', 's_redtape', 's_bubble', 's_duedate',
    's_seeker', 's_peekaboo', 's_toothfairy', 's_parasite', 'acro_cap', 'acro_spray', 'acro_spark', 'v_flame_beam'],
  mods: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet',
    'focus', 'connecting', 'turncoat', 'melee', 'ranged', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting'],
  held: [], samples: [], force: false,
};
function matrixApply() {
  for (const id of W24_IDS) if (!MATRIX_ONLY.weapons.includes(id) && !W24_HOLD.includes(id)) { W24_HOLD.push(id); MATRIX_ONLY.held.push(id); if (WEAPONS[id]) WEAPONS[id].archived = 1; }
}
function matrixRestore() { // (the full roster again: for tests that cover the v9 weapons and samples)
  MATRIX_ONLY.on = false;
  for (const id of MATRIX_ONLY.held) { const i = W24_HOLD.indexOf(id); if (i >= 0) W24_HOLD.splice(i, 1); if (WEAPONS[id]) WEAPONS[id].archived = 0; }
  MATRIX_ONLY.held = [];
  for (const s of MATRIX_ONLY.samples) if (!SAMPLES10.includes(s)) SAMPLES10.push(s);
  MATRIX_ONLY.samples = [];
}
if (MATRIX_ONLY.on) matrixApply();
const matrixOn = () => MATRIX_ONLY.on && !(typeof window !== 'undefined' && window.TUT_OFF && !MATRIX_ONLY.force); // (tests and sims set window.TUT_OFF and get every modifier unless MATRIX_ONLY.force)
modOk = (orig => function (w, id) { return (!matrixOn() || MATRIX_ONLY.mods.includes(id)) && orig(w, id); })(modOk);
