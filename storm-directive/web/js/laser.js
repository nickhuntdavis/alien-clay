'use strict';
// Spawn Prawn - the Laser and The Runs' exit from the roster (redesign docs: COMBAT_MATRIX decisions 56 and 57,
// MODIFIER_MATRIX.md, IMPLEMENTATION_PLAN.md Phase 3).
//  - LASER: Ordered Online's 4th starter, a Fire Beam held on one target. It reuses the archived v10 matrix Fire beam
//    (v_flame_beam, "Flame Jet": v10.js builds it), renamed, un-archived and added to the W24 roster.
//  - THE RUNS (s_wake) leaves the roster: put on hold (never offered, never a starter). It becomes a sperm passive
//    (spassives.js). Redtail keeps two starters.
// Loads after weapons24.js and acro.js, before samples10.js (which reads w24Starters when it loads).
// The beam draws as a thin red line (no Fire-jet particles): the fx it leaves gets t 'laser' (v10.js draws any unknown
// type as a plain glowing line). Hooks: none (it edits the W24 tables in place and wraps v10.js v10Fire).

const LASER = { id: 'v_flame_beam', name: 'Laser', col: '#ff3b30',
  desc: 'TODO_COPY:w28_desc' }; // (the user writes the line)

(function laserJoin() {
  const d = WEAPONS[LASER.id];
  if (!d) { console.warn('laser: missing ' + LASER.id); return; }
  d.name = LASER.name; d.desc = d.play = LASER.desc; d.color = LASER.col; d.icon = 'LA';
  d.w24 = 1; d.archived = 0;
  if (!W24_BY[LASER.id]) {
    W24.push([LASER.id, LASER.name, 'flame', 'beam', 'ordered']);
    W24_IDS.push(LASER.id);
    W24_BY[LASER.id] = { id: LASER.id, name: LASER.name, type: 'flame', atk: 'beam', starter: 'ordered' };
    if (typeof W24_DESC !== 'undefined') W24_DESC[LASER.id] = LASER.desc;
  }
  // The Runs is a sperm passive now: off the roster.
  if (!W24_HOLD.includes('s_wake')) W24_HOLD.push('s_wake');
  if (WEAPONS.s_wake) WEAPONS.s_wake.archived = 1;
})();

v10Fire = (orig => function (w, target, src) {
  const r = orig(w, target, src);
  if (r && w && w.def && w.def.name === LASER.name && G.v10fx && G.v10fx.length) {
    const f = G.v10fx[G.v10fx.length - 1];
    if (f.k === 'beam') { f.t = 'laser'; f.w = Math.max(3, f.w * 0.45); f.c = w.def.sab ? f.c : LASER.col; }
  }
  return r;
})(v10Fire);
