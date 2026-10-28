'use strict';
// Spawn Prawn - four Delivery forms become weapons (user, 28 Oct). Melee, Ranged, Mines and Death from Above are no
// longer dealt as modifiers (matrixonly.js MATRIX_ONLY.mods); their four best per-weapon forms join the roster instead:
//  - v_flame_sword (Laser + Melee: laserbeam.js lzSwordSwing), v_flame_mines (Laser + Mines: lzMineLay),
//    v_flame_orbital (Laser + Death from Above, strikes only: lzOrbital), s_mines_dfa (Nappy Mines + Death from Above:
//    cellmods.js xcNmDfa, the artillery and the carpet).
//  - Each def is a copy of its base weapon's with def.dlv, the built-in Delivery modifier. The slot holds it in w.m10
//    like a taken card, so every existing path (mwR, msR, xcR, delivforms.js) runs unchanged; it ranks with the
//    weapon's level instead of by cards (dlvrun.js). The Laser three carry def.lzKin, so lzIs takes them as the Laser.
//  - No starter sample, no branch screens (WUP), no Switched at Birth alternate (MM_SAB) for now.
// This file only builds the defs and roster rows (loads after laser.js, before v9arms.js, so the roster loops in
// w24look.js and wtags.js see them). Behaviour: dlvrun.js. Hooks: none.

const DLVW = [ // id, copy id (TODO_COPY:<copy>, <copy>_desc), base weapon, built-in Delivery modifier, icon (icons.js key), badge, other Delivery cards allowed
  { id: 'v_flame_sword', copy: 'w_sword', base: 'v_flame_beam', dlv: 'melee', icon: 'glaive', badge: 'LS', lz: 1, xok: [] },
  { id: 'v_flame_mines', copy: 'w_lzmines', base: 'v_flame_beam', dlv: 'mines', icon: 'mine', badge: 'LM', lz: 1, xok: ['extra'] },
  { id: 'v_flame_orbital', copy: 'w_orbital', base: 'v_flame_beam', dlv: 'dfa', icon: 'comet', badge: 'OL', lz: 1, xok: [] },
  { id: 's_mines_dfa', copy: 'w_artillery', base: 's_mines', dlv: 'dfa', icon: 'mortar', badge: 'NA', xok: ['extra'] },
];
const DLVW_COPY = { // copy id -> [name, description]
  w_sword: ['Laser Sword', 'A laser blade swung through an arc in front of you. It hits everything it passes through.'],
  w_lzmines: ['Laser Mines', 'Lays laser mines where you swim. When an enemy gets close, a mine spins out beams for a second, then it is spent.'],
  w_orbital: ['Orbital Laser', 'Marks a target, then a beam from above follows it for a second, hitting it and whatever crowds it.'],
  w_artillery: ['Nappy Rash', 'Shells land among the enemies. Each blast fills a Burn bar and leaves a burning patch. From Lv 3, a carpet of them goes off across their path.'],
};
const DLVW_BY = Object.fromEntries(DLVW.map(r => [r.id, r]));

(function dlvJoin() {
  for (const r of DLVW) {
    const b = WEAPONS[r.base], row = W24_BY[r.base];
    if (!b || !row) { console.warn('dlvweap: missing ' + r.base); continue; }
    const d = Object.assign({}, b, { base: JSON.parse(JSON.stringify(b.base || {})), lv: JSON.parse(JSON.stringify(b.lv || {})),
      stars: (b.stars || []).slice(), name: DLVW_COPY[r.copy][0], desc: DLVW_COPY[r.copy][1], icon: r.badge,
      role: MODS10[r.dlv] ? MODS10[r.dlv].name : b.role, dlv: r.dlv, dlvBase: r.base, w24: 1, archived: 0 });
    d.play = d.desc;
    if (r.lz) d.lzKin = 1;
    WEAPONS[r.id] = d;
    if (W24_BY[r.id]) continue;
    W24.push([r.id, d.name, row.type, row.atk, null]);
    W24_IDS.push(r.id);
    W24_BY[r.id] = { id: r.id, name: d.name, type: row.type, atk: row.atk, starter: null };
    W24_DESC[r.id] = d.desc;
    if (typeof ICON_OF !== 'undefined') ICON_OF[r.id] = r.icon;
  }
})();
