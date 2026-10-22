'use strict';
// Spawn Prawn - weapon modifier slots by group (redesign docs/MODIFIER_MATRIX.md; COMBAT_MATRIX decisions 47 to 49, 59;
// IMPLEMENTATION_PLAN.md Phases 1 and 2). First pass: the 20 shipped modifiers (modifiers.js MODS10), sorted into groups.
//  - GROUPS: every modifier is Delivery, Flight, Crowd, Tempo or Chemistry (Switched at Birth). A weapon holds one per
//    group, so same-group modifiers never stack.
//  - SLOTS: 2 at weapon Lv 1, a 3rd at Lv 3, a 4th at Lv 6, the 5th at Lv 9 (MM.open). A weapon levels by taking
//    modifiers: each card taken on it (new or rank-up) adds a level, up to Lv 9 (MM.lvlCap).
//  - The old branch screens (weapons24.js wupLevel, promise / swerve / mastery cards) no longer open (decision 48).
//  - Modifier cards are dealt in level-up drafts as well as DNA strands (were strands only).
//  - SWITCHED AT BIRTH: one fixed alternate type per weapon (its starter sample's other type), N/A where switching would
//    spoil the attack (MM_SAB); it takes the weapon's Chemistry slot.
//  - MASTERY: a modifier at Rank 3 can take a 4th card, its mastery (for now one more step of its numbers: modifiers.js
//    modV). One weapon-modifier mastery per build, plus one more with Extra Mastery (spassives.js mmMasteryFree).
// Not built yet (later passes): branches at modifier Lv 2, transforming masteries, the new modifiers, pairs, combo masteries.
// Hooks: none in shared files. Replaces modifiers.js modOk and modAdd, modcards.js modCardOk, modCard, sabCard and
// modDraftCands, and weapons24.js wupLevel (assigned over the originals, never redeclared: dupetest; loads after modcards.js).

const MM = { on: true, open: [1, 1, 3, 6, 9], lvlCap: 9 };
DRAFT.groupW.mod = 2.2; // (weapons now grow only through modifiers, so level-ups deal them more often: was 1.1)
const MM_GROUP = {
  orbiting: 'delivery', delayed: 'delivery', lobbed: 'delivery', trail: 'delivery', selfcentred: 'delivery', sweep: 'delivery',
  anchored: 'delivery', summoned: 'delivery', lunge: 'delivery',
  homing: 'flight', piercing: 'flight', ricochet: 'flight', returning: 'flight', multiplying: 'flight', chaining: 'flight',
  gravity: 'crowd',
  volley: 'tempo', nth: 'tempo', growing: 'tempo', scaling: 'tempo',
};
const MM_GNAME = { delivery: 'Delivery', flight: 'Flight', crowd: 'Crowd', tempo: 'Tempo', chemistry: 'Chemistry' };
// Switched at Birth: the one alternate per weapon (internal type ids). Weapons not listed are N/A (MODIFIER_MATRIX.md 4.7).
const MM_SAB = {
  v_phys_proj: 'arcane', v_phys_spread: 'shock', v_phys_contact: 'ice', v_phys_burst: 'arcane', v_fire_proj: 'soul',
  v_shock_beam: 'phys', s_lard: 'shock', s_duedate: 'ice', v_flame_pool: 'fire', s_mines: 'fire', s_redtape: 'fire',
  s_bubble: 'fire', s_seeker: 'flame', s_toothfairy: 'arcane', v_flame_beam: 'fire',
};

const mmGroup = id => MM_GROUP[id] || 'flight';
const mmSlots = w => MM.open.filter(l => (w.lvl || 1) >= l).length;
function mmHeld(w) {
  const g = new Set((w.m10 || []).map(mmGroup));
  if (w.def && w.def.sab) g.add('chemistry');
  return g;
}
const mmRoom = w => mmHeld(w).size < mmSlots(w);
const mmLevelUp = w => { if (MM.on && w && !w.isSpell) { w.lvl = Math.max(w.lvl || 1, Math.min(MM.lvlCap, (w.lvl || 1) + 1)); computeStats(w); } }; // (never lowers a level set elsewhere, e.g. v9arms tier screens)

// ---------------------------------------------------------------- modifiers.js
// Masteries held: weapon-modifier masteries (G.mmM: 'weapon id:modifier'). Extra Mastery's one extra is shared with sperm passives.
const mmMasteries = () => (G && G.mmM ? G.mmM.length : 0);
const mmMasteryFree = () => typeof spMasteryRoom === 'function' ? spMasteryRoom('weapon') : mmMasteries() < 1;
const mmIsMastery = (w, id) => MODS10[id] && MODS10[id].max >= 3 && modCount(w, id) === MODS10[id].max;
modOk = function (w, id) {
  const m = MODS10[id], a = w && w.def && w.def.v10atk;
  if (!m || !a || !m.atk.includes(a)) return false;
  if (modCount(w, id) >= m.max && !(mmIsMastery(w, id) && mmMasteryFree())) return false; // (a 4th card is the mastery)
  const g = mmGroup(id);
  if ((w.m10 || []).some(x => x !== id && mmGroup(x) === g)) return false; // (one per group)
  if (!modHas(w, id) && !mmRoom(w)) return false; // (a new group needs an open slot)
  return true;
};
modAdd = function (w, id) {
  if (!modOk(w, id)) return false;
  const mastery = mmIsMastery(w, id);
  (w.m10 || (w.m10 = [])).push(id);
  if (mastery) (G.mmM || (G.mmM = [])).push(w24Key(w) + ':' + id);
  mmLevelUp(w);
  return true;
};

// ---------------------------------------------------------------- modcards.js
modCardOk = function (w, id) { return modOk(w, id); };
modCard = (orig => function (w, id) { // (an assignment, not a declaration: a declaration would hoist over orig)
  const c = orig(w, id);
  c.sub = c.sub.replace(' | Delivery', '') + ' | ' + MM_GNAME[mmGroup(id)];
  if (mmIsMastery(w, id)) { // (the 4th card: the mastery)
    c.title = MODS10[id].name + ' MASTERY'; c.rarity = 4; c.tag = 'MASTERY';
    c.sub = 'Rank 3 > Mastery | one a build | ' + MM_GNAME[mmGroup(id)]; c.desc = 'TODO_COPY:mastery_' + id;
  }
  return c;
})(modCard);
sabCard = function () {
  const own = G.weapons.filter(w => w && !w.isSpell && w.def && !mmHeld(w).has('chemistry') && MM_SAB[w24Key(w)] && mmRoom(w));
  if (!own.length) return null;
  const w = pick(own), t = MM_SAB[w24Key(w)], E = ELEMENTS[t];
  if (!E) return null;
  return { card: 'switch', family: 'switch', rarity: SAB_RAR, tag: 'SWITCHED AT BIRTH', icon: w.def.icon, color: (typeof V10_COL !== 'undefined' && V10_COL[t]) || E.color, elem: t,
    title: `${w.def.name} → ${E.name}`, sub: `${ELEMENTS[w.def.elem] ? ELEMENTS[w.def.elem].name : ''} > ${E.name} | Chemistry`,
    desc: `The hospital mixed up the tags. ${w.def.name} now deals ${E.name} damage. Everything else about it stays where it was.`,
    apply: () => { if (G.weapons.includes(w)) { sabSwitch(w, t); mmLevelUp(w); } } };
};
modDraftCands = function (kind) {
  const out = [];
  G.draftN = (G.draftN || 0) + 1;
  for (const w of G.weapons) { // (level-ups and DNA strands both deal modifiers now)
    if (!w || w.isSpell || !w.def || !w.def.v10atk) continue;
    for (const id of modsFor(w)) if (!banished('mod:' + id)) out.push({ o: () => modCard(w, id), w: famK('mod:' + id) * (modHas(w, id) ? 1.3 : 1), fam: 'mod:' + id });
  }
  if (!banished('switch') && G.sabAt !== G.draftN - 1 && G.weapons.some(w => w && !w.isSpell && w.def && !mmHeld(w).has('chemistry') && MM_SAB[w24Key(w)] && mmRoom(w))) {
    const n = G.draftN;
    out.push({ o: () => { const c = sabCard(); G.sabAt = n; return c; }, w: 0.6 * famK('switch'), fam: 'switch' });
  }
  return out;
};

// ---------------------------------------------------------------- weapons24.js: no branch screens
wupLevel = (orig => function (lv) { // (the developer Sandbox keeps the old branch screens: sandbox.js)
  if (typeof sbOn === 'function' && sbOn()) return orig(lv);
  if (lv % 3 === 0) recomputeAll();
})(wupLevel);
