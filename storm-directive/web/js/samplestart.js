'use strict';
// Spawn Prawn - how a sample is unlocked and what it starts with (user, 23 Oct).
//  - UNLOCKS: Baseline is open; every other sample unlocks the first time you earn its achievement (S10_ACH), in any run.
//    Achievements are now remembered between runs (META.achEver). Rescues in The Race (kindred.js) no longer unlock
//    samples. Developer mode (META.devAll) still opens everything.
//  - STARTING OFFER (user, 24 Oct): the two weapons that suit the sample best (S10_FIT, picked for its passive and damage
//    types) plus two random others from the matrix's 27 (matrixonly.js), in a random order. (Was: three random, one of
//    them Switched at Birth; s10SabOpt is kept for that.)
// Hooks: none in shared files. Wraps samples10.js s10Start and s10Unlock; show.js achieve. samples10.js reads s10LockTxt
// (the locked card's line). Save data: META.achEver { id: 1 }. Loads after matrixonly.js.

const S10_ACH = { alpha: 'survive5', beta: 'lowhp', private: 'boss', ordered: 'kills1000', redtail: 'survive10', prawn: 'wave5', alien: 'born', acro: 'flawless' };
S10_ALL = false;
for (const s of SAMPLES10) s.unlock = S10_ACH[s.id] ? { txt: 'Earn the achievement ' + ACHIEVEMENTS[S10_ACH[s.id]].name + ': ' + ACHIEVEMENTS[S10_ACH[s.id]].desc, ach: S10_ACH[s.id], secret: s.unlock && s.unlock.secret } : null;
const s10LockTxt = s => 'LOCKED. ' + (s.unlock ? s.unlock.txt : '');

let S10_ACH_UNLOCK = false; // (only an achievement unlocks a sample now)
s10Unlock = (orig => function (id) { if (S10_ACH_UNLOCK) return orig(id); })(s10Unlock);
achieve = (orig => function (id) {
  const first = G && !(G.show && G.show.achieved && G.show.achieved[id]);
  orig(id);
  if (!first || !ACHIEVEMENTS[id]) return;
  if (!(META.achEver && META.achEver[id])) { (META.achEver || (META.achEver = {}))[id] = 1; saveMeta(); }
  for (const sid in S10_ACH) if (S10_ACH[sid] === id) { S10_ACH_UNLOCK = true; try { s10Unlock(sid); } finally { S10_ACH_UNLOCK = false; } }
})(achieve);
// Achievements earned before this build open their samples on load.
for (const sid in S10_ACH) if (META.achEver && META.achEver[S10_ACH[sid]] && !(META.s10 && META.s10[sid])) (META.s10 || (META.s10 = {}))[sid] = 1;

// ---------------------------------------------------------------- the starting offer
function s10Pool() {
  const ids = typeof MATRIX_ONLY !== 'undefined' ? MATRIX_ONLY.weapons : Object.keys(WEAPONS);
  return ids.filter(id => WEAPONS[id] && !(typeof W24_HOLD !== 'undefined' && W24_HOLD.includes(id)) && WEAPONS[id].elem);
}
const s10Shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Each sample's two best weapons (all from MATRIX_ONLY.weapons), and why.
const S10_FIT = {
  baseline: ['v_phys_proj', 'v_arcane_proj'],      // plain stats, plain guns: Standard Issue, Little Prick
  alpha: ['s_twin', 'v_phys_spread'],              // faster while moving: a beam you drag by swimming; a fan at close range
  beta: ['s_seeker', 'v_ice_pool'],                // low health, lifesteal: homing Blood that needs no aim; Mucus that keeps them off
  private: ['v_fire_proj', 's_parasite'],          // double Corrosion, Possession: Acid Spit; Chest Burster turns them
  ordered: ['s_mines', 's_bubble'],                // a Mucus trail while moving: mines dropped behind; bubbles for what follows
  redtail: ['v_shock_beam', 's_tesla'],            // Static adds to burn: a constant beam; chains through a crowd
  prawn: ['v_soul_proj', 's_peekaboo'],            // Possessed foes make friends Bleed: Rent Free; Peekaboo sets them on each other
  alien: ['v_soul_proj', 's_tesla'],               // shifts type every 12 s: fast hits that cash in the shift bonus
  acro: ['acro_spray', 'acro_spark'],              // early Corrosion: Enzyme Sneeze sets up, Spark of Life finishes
  v9_vanguard: ['v_phys_proj', 'v_phys_contact'],  // reload speed and a headbutt charge: the magazine gun; contact
  v9_bruiser: ['v_phys_burst', 's_lard'],          // armour and a knock-back fury: Panic Button, Skill Issue
  v9_nerd: ['s_tesla', 'v_shock_beam'],            // fire rate and an EMP: Static
  v9_eggseeker: ['s_duedate', 'v_arcane_proj'],    // crits on the toughest: One of These Days on big targets; Little Prick
  v9_stealth: ['v_phys_contact', 'acro_cap'],      // melee damage and slipping through: contact weapons
  v9_pusher: ['s_parasite', 's_redtape'],          // regeneration and draining: Chest Burster, Ewww, Gross
  v9_acid: ['v_fire_proj', 'v_flame_pool'],        // up close and burning: Acid Spit, Hot Mess
  v9_splicer: ['s_void', 's_toothfairy'],          // more area: Family Ties' vortex, Eggs
  v9_reborn: ['v_soul_proj', 's_parasite'],        // past lives: Rent Free; Chest Burster's dead rise again
  v9_redtail: ['s_lard', 's_seeker'],              // luck and a small family tree: Skill Issue, Sister Cousin
  v9_twins: ['s_twin', 's_seeker'],                // never apart: Soulmate Signal, two siblings per shot
};
function s10Offer(s) {
  const pool = s10Shuffle(s10Pool()), fit = (S10_FIT[s.id] || []).filter(id => pool.includes(id));
  const rest = pool.filter(id => !fit.includes(id)).slice(0, 4 - fit.length);
  return s10Shuffle([...fit, ...rest]).map(id => optNewWeapon(id, 0));
}
// A starting card for a weapon that comes already switched to type t (internal id).
function s10SabOpt(id, t) {
  const o = optNewWeapon(id, 0), base = o.def, E = ELEMENTS[t], col = (typeof V10_COL !== 'undefined' && V10_COL[t]) || E.color, ap = o.apply;
  o.def = Object.create(base, { elem: { value: t, enumerable: true }, v10type: { value: t, enumerable: true }, color: { value: col, writable: true, enumerable: true } });
  o.elem = t; o.color = col; o.sab = t;
  o.sub = `${ELEMENTS[base.elem].name} > ${E.name} (Switched at Birth) | Lv 1`;
  o.desc = `Starts Switched at Birth: deals ${E.name} damage. ` + o.desc;
  o.apply = () => { const before = G.weapons.slice(); ap(); const w = G.weapons.find((x, i) => x && x !== before[i]); if (w && typeof sabSwitch === 'function') sabSwitch(w, t); };
  return o;
}
s10Start = (orig => function () {
  const r = orig(); if (!r) return r;
  const s = S10_BY[s10Of()];
  const o = s && s10Offer(s);
  return o && o.length ? o : r;
})(s10Start);
