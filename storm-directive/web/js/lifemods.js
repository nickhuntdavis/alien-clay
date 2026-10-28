'use strict';
// Spawn Prawn - lifesteal back in the v10 draft (user, 28 Oct). Under v10 every lifesteal card had gone: the v9 perks,
// relics, genes and evolutions are never read (v10Loot), and the slice (spslice.js) kept the two health cards out.
//  - Bloodsucker, a weapon modifier (v9 perk 'vamp'): hits from this weapon heal 2/3/4% of the damage dealt (mastery 6%),
//    drawn from the lifesteal pool (G.lsBudget), so the limit holds.
//  - Umbilical Cord, a weapon modifier (v9 perk 'lifeline'): one rank, Epic, dealt half as often. Hits heal 5% of the
//    damage dealt and may draw up to four times the pool (as arsenal.js pVampCap).
//  - Both share one group, Lifesteal (modmatrix.js MM_GROUP), so a weapon holds one or the other.
//  - Leech (vitals.js vt_leech) and Slurp (membrane.js hp_slurp) join the slice's card list, so real drafts deal them.
// Hooks: none in shared files. hookOn('proc', 'lsmProc'); wraps modmatrix.js modCard and modDraftCands. Loads after
// wmods.js (adds its preview loops).

const LSM = { blood: [0.02, 0.03, 0.04, 0.06], cord: 0.05, cordCap: 4, cordW: 0.5, drop: '#ff4d6d' };
MODS10.bloodsucker = { name: 'Bloodsucker', desc: 'Hits heal you a little (within the lifesteal limit).', atk: MOD_ALL.slice(), max: 3, cap: {} };
MODS10.umbilical = { name: 'Umbilical Cord', desc: 'Hits heal you (up to four times the usual lifesteal limit).', atk: MOD_ALL.slice(), max: 1, cap: {} };
MODUP.bloodsucker = ['TODO_COPY:mod_bloodsucker_r2', 'TODO_COPY:mod_bloodsucker_r3'];
MODUP.umbilical = [];
MM_GROUP.bloodsucker = MM_GROUP.umbilical = 'lifesteal'; MM_GNAME.lifesteal = 'TODO_COPY:mm_group_lifesteal';
for (const L of [typeof MATRIX_ONLY !== 'undefined' && MATRIX_ONLY.mods, typeof SLICE !== 'undefined' && SLICE.mods]) if (L) L.push('bloodsucker', 'umbilical');
if (typeof SLICE !== 'undefined') SLICE.muts.push('vt_leech', 'hp_slurp');

function lsmProc(e, dmg, src, d) {
  const w = src.w; if (!w || !w.m10 || !(d > 0) || !(G.lsBudget > 0)) return;
  const n = modCount(w, 'bloodsucker'), cord = modHas(w, 'umbilical');
  if (!n && !cord) return;
  const cap = cord ? LSM.cordCap : 1, k = cord ? LSM.cord : LSM.blood[Math.min(n, 4) - 1];
  const h = Math.min(G.lsBudget * cap, d * k); G.lsBudget = Math.max(0, G.lsBudget - h / cap); healPlayer(h, true);
}
hookOn('proc', 'lsmProc', (e, dmg, src, d) => lsmProc(e, dmg, src, d));

modCard = (orig => function (w, id) {
  const c = orig(w, id);
  if (id === 'umbilical') { c.rarity = 3; c.sub = c.sub.replace(' of 3', ''); }
  return c;
})(modCard);
modDraftCands = (orig => function (kind) {
  const out = orig(kind);
  for (const c of out) if (c.fam === 'mod:umbilical') c.w *= LSM.cordW;
  return out;
})(modDraftCands);

// Card preview loops (wmods.js): a plain shot, then a drop of blood swims back to you.
if (typeof WMV_SCENE !== 'undefined') {
  const scene = big => (K, u) => {
    K.cells([0, wmvHit(u, 0.45, 0.1), 0]); K.fly(u, 0, 0.45, K.me[0], K.me[1], WC1[0], WC1[1]);
    K.fly(u, 0.5, 0.85, WC1[0], WC1[1], K.me[0], K.me[1], big ? 1.4 : 0.8, LSM.drop);
    if (u > 0.85 && u < 0.95) K.ring(K.me[0], K.me[1], big ? 0.12 : 0.08, 1 - (u - 0.85) * 10, LSM.drop, 2);
    K.spermy();
  };
  WMV_SCENE.bloodsucker = scene(false); WMV_SCENE.umbilical = scene(true);
}
