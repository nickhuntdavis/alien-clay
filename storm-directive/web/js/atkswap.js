'use strict';
// Spawn Prawn - attack-type modifiers swap (user, 23 Oct). Melee, Ranged, Mines and Death from Above each replace how a
// weapon fires (MODIFIER_MATRIX.md 17). A weapon holds one at a time: taking another switches to it, and the old one's
// ranks, branch and mastery are lost (its weapon levels stay). The card says so before you take it. Once a weapon has
// an attack-type modifier, the draft offers it another one far less often (ATKSW.k). Holds in the Sandbox too.
// Also: the Laser's pictogram (pictomap.js PICTO_ALIAS).
// Hooks: none in shared files. Wraps modmatrix.js modOk, modAdd, modCard, modDraftCands. Loads after spmast.js.

const ATKSW = { ids: ['melee', 'ranged', 'mines', 'dfa'], k: 0.15 };
const atkHeld = (w, id) => ((w && w.m10) || []).filter(x => ATKSW.ids.includes(x) && x !== id).filter((x, i, a) => a.indexOf(x) === i);
// Test with the other attack type(s) set aside, as if the slot were free.
function atkWithout(w, olds, f) {
  const keep = w.m10; w.m10 = keep.filter(x => !olds.includes(x));
  try { return f(); } finally { w.m10 = keep; }
}
modOk = (orig => function (w, id) {
  if (!ATKSW.ids.includes(id) || !w) return orig(w, id);
  const olds = atkHeld(w, id);
  return olds.length ? atkWithout(w, olds, () => orig(w, id)) : orig(w, id);
})(modOk);
modAdd = (orig => function (w, id) {
  const olds = ATKSW.ids.includes(id) && w ? atkHeld(w, id) : [];
  if (!olds.length) return orig(w, id);
  if (!modOk(w, id)) return false;
  const key = w24Key(w);
  w.m10 = w.m10.filter(x => !olds.includes(x));
  for (const o of olds) {
    if (G.mmM) G.mmM = G.mmM.filter(m => m !== key + ':' + o);
    if (w.mmB) delete w.mmB[o];
    if (w.mmX) delete w.mmX[o];
  }
  w.atkSwaps = (w.atkSwaps || 0) + 1;
  return orig(w, id);
})(modAdd);
modCard = (orig => function (w, id) {
  const c = orig(w, id), olds = ATKSW.ids.includes(id) ? atkHeld(w, id) : [];
  c.atkW = w;
  if (olds.length) {
    const nm = olds.map(o => MODS10[o].name).join(' and '), d = typeof slCopy === 'function' ? slCopy(c.desc) : c.desc;
    c.tag = 'MODIFIER: SWITCH'; c.warn = true;
    c.sub += ' | replaces ' + nm;
    c.desc = 'Switches the attack to ' + MODS10[id].name + '. ' + nm + ' is removed, with its ranks, branch and mastery. ' + d;
  }
  return c;
})(modCard);
modDraftCands = (orig => function (kind) {
  const out = orig(kind);
  for (const c of out) {
    const id = c.fam && c.fam.startsWith('mod:') ? c.fam.slice(4) : null;
    if (!ATKSW.ids.includes(id)) continue;
    const card = c.o(); c.o = () => card; // (built once to find its weapon; reused when dealt)
    if (card && card.atkW && atkHeld(card.atkW, id).length) c.w *= ATKSW.k;
  }
  return out;
})(modDraftCands);

// The Laser (v_flame_beam, renamed in laser.js): the beam-and-flash pictogram.
PICTO_ALIAS['weapon:laser'] = 'spark-of-life'; PICTO_ALIAS[':laser'] = 'spark-of-life';
