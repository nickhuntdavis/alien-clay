'use strict';
// Spawn Prawn - the four Delivery weapons at work (dlvweap.js builds their defs; user, 28 Oct).
//  - BUILT IN: the slot holds its Delivery modifier (def.dlv) in w.m10 from the start (makeSlot), so the existing paths
//    run it: laserbeam.js lzSwordSwing / lzMineLay / lzOrbital, cellmods.js xcNmDfa, delivforms.js's Flight and Crowd
//    forms. It ranks with the weapon's level, not by cards: Rank 1 at Lv 1, 2 at Lv 3, 3 at Lv 6, its mastery at Lv 9
//    (DLV.at). Rank 2 and the mastery open the modifier's usual fork screen (modslice.js MSB) on the Laser three; the
//    artillery follows its cells' default path (cellmods.js, no forks). The built-in mastery is free (not G.mmM).
//  - SLOTS: the built-in takes no modifier slot (mmHeld leaves it out). No other Delivery card is dealt on these
//    weapons, except Extra Projectiles where the form was built for it (DLVW xok: more laser-mine beams, more shells).
//  - ORBITAL LASER: strikes only, no beam (on the Laser, Strike from Above is an extra beside the beam).
//  - Draft filter: MOD_DEAD rows are the base weapon's (moddead.js), plus DLV.deny (modifiers that do nothing there).
// Hooks: none in shared files. hookOn('tick', 'dlvrun'). Wraps game.js makeSlot, modOk, mmHeld, wupFire, wupStats (DLV.dmgK). Loads after
// atklock.js (its modOk wrap is outermost).

const DLV = { at: [1, 3, 6, 9], dmgK: { v_flame_orbital: 1.5, s_mines_dfa: 0.6 }, // (dmgK: tuned on the measured bars, wstars.js)
  deny: { v_flame_orbital: ['charged', 'piercing', 'ricochet', 'focus', 'nth'], v_flame_sword: ['ricochet'] } };
const dlvOf = w => (w && !w.isSpell && w.def && w.def.dlv) || null;
const dlvRow = w => (w && w.def && DLVW_BY[w24Key(w)]) || null;
const dlvReal = w => (w && (w.xcReal || w.m10)) || [];
for (const r of DLVW) { const d = WEAPONS[r.id]; if (d && MODS10[r.dlv]) d.role = MODS10[r.dlv].name; }

// ---------------------------------------------------------------- the built-in modifier and its ranks
function dlvSync(w, quiet) {
  const id = dlvOf(w); if (!id || w.xcDepth) return;
  const want = DLV.at.filter(l => (w.lvl || 1) >= l).length;
  let n = modCount(w, id), grew = false;
  while (n < want) {
    (w.m10 || (w.m10 = [])).push(id); n++; grew = true;
    const fork = !quiet && G && G.lootQueue && MSB[id] && !(typeof xcCell === 'function' && xcCell(w, id));
    if (fork && (n === 2 || n === 4)) G.lootQueue.push({ kind: 'fork', v10ok: true, lv: n, ms: { w, id, st: n === 2 ? 'b' : 'm' } });
  }
  if (grew) computeStats(w);
}
makeSlot = (orig => function (id, isSpell, lvl) {
  const w = orig(id, isSpell, lvl);
  if (dlvOf(w)) dlvSync(w, true);
  return w;
})(makeSlot);
hookOn('tick', 'dlvrun', () => { if (G && G.state === 'play') for (const w of G.weapons) if (dlvOf(w)) dlvSync(w); });

wupStats = (orig => function (w, s) { orig(w, s); const k = dlvOf(w) && DLV.dmgK[w24Key(w)]; if (k) s.dmg *= k; })(wupStats);

// ---------------------------------------------------------------- slots and cards
mmHeld = (orig => function (w) {
  const id = dlvOf(w); if (!id || !w.m10) return orig(w);
  const keep = w.m10; w.m10 = keep.filter(x => x !== id);
  try { return orig(w); } finally { w.m10 = keep; }
})(mmHeld);
modOk = (orig => function (w, id) {
  const b = dlvOf(w); if (!b) return orig(w, id);
  if (id === b) return false; // (ranks with the weapon's level)
  const D = DLV.deny[w24Key(w)]; if (D && D.includes(id)) return false;
  if (mmGroup(id) !== 'delivery') return orig(w, id);
  const r = dlvRow(w); if (!r || !r.xok.includes(id) || !w.m10) return false;
  const keep = w.m10; w.m10 = keep.filter(x => x !== b); // (the one-per-group rule, as if the built-in were not there)
  try { return orig(w, id); } finally { w.m10 = keep; }
})(modOk);

// ---------------------------------------------------------------- the Orbital Laser: strikes, no beam
wupFire = (orig => function (w, t, src) {
  if (dlvOf(w) === 'dfa' && w.def.lzKin) { if (t && !w.lzOver) lzOrbital(w, t); return true; }
  return orig(w, t, src);
})(wupFire);

// ---------------------------------------------------------------- tables keyed by weapon id
if (typeof XC_W !== 'undefined' && XC_W.s_mines) XC_W.s_mines_dfa = XC_W.s_mines; // (the artillery is Nappy Mines' cells)
if (typeof MOD_DEAD !== 'undefined') for (const r of DLVW) if (MOD_DEAD[r.base] && !MOD_DEAD[r.id]) MOD_DEAD[r.id] = MOD_DEAD[r.base];
if (typeof WTAGS !== 'undefined') Object.assign(WTAGS, { v_flame_sword: ['melee', 'burns'], v_flame_mines: ['places', 'burns'], v_flame_orbital: ['beam', 'burns'],
  s_mines_dfa: (WTAGS.s_mines || ['burst', 'burns']).slice() });
