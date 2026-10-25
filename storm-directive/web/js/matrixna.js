'use strict';
// Spawn Prawn - matrix N/A cells (redesign docs/MODIFIER_MATRIX.md rule 6: a modifier that does what the weapon already
// does is N/A, and the draft never offers it there). The attack-type rules (MODS10 atk, modwide.js Ranged) already keep
// most N/A cells out; these are the ones they let through, each checked against the matrix's own cell.
// Always on (also in tests and sims): it is the design, not a "for now" filter like matrixonly.js.
// Hooks: none in shared files. Wraps modmatrix.js modOk (so modCardOk, the draft and DNA strands follow). Loads after laserbranch.js.

const MATRIX_NA = {
  s_void: ['pull', 'piercing'],          // Family Ties: already pulls; already pierces everything
  s_redtape: ['connecting', 'sticky'],   // Ewww, Gross: linking is the whole weapon; taped enemies are already stuck together
  v_phys_burst: ['knock'],               // Panic Button: the pulse already throws enemies out
  s_lard: ['knock'],                     // Skill Issue: already knockback-based
  v_phys_contact: ['knock'],             // Nervous Wreck: the snap already recoils
  s_seeker: ['homing'],                  // Sister Cousin: already homes
  s_parasite: ['turncoat'],              // Chest Burster: raising killed enemies is its signature
  s_tesla: ['primer'],                   // Unwanted Contact: priming your other weapons is its signature
  acro_cap: ['nth'],                     // Enzyme Headbutt: already lunges every 4th hit
  v_flame_beam: ['range'],               // Laser: Range is Projectile and Spread only (rule 10)
};
const matrixNa = (w, id) => !!(w && w.def && !w.isSpell && (MATRIX_NA[w24Key(w)] || []).includes(id));
modOk = (orig => function (w, id) { return !matrixNa(w, id) && orig(w, id); })(modOk);
