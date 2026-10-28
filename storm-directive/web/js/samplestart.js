'use strict';
// Spawn Prawn - what a sample starts with (user, 23 Oct); how it unlocks moved to kinall.js.
//  - UNLOCKS: Baseline is open; every other sample opens when you rescue it in a run and finish that run (kinall.js).
//    Achievements and the Shell-strip no longer unlock samples (they used to: S10_ACH, retired). Developer mode
//    (META.devAll) still opens everything. META.achEver stays as a record of achievements earned.
//  - STARTING OFFER (user, 24 Oct): the two weapons that suit the sample best (S10_FIT, picked for its passive and damage
//    types) plus two random others from the matrix's 27 (matrixonly.js), in a random order. (Was: three random, one of
//    them Switched at Birth; s10SabOpt is kept for that.) typepools.js replaces the deal at run start.
// Hooks: none in shared files. Wraps samples10.js s10Start; show.js achieve. samples10.js reads s10LockTxt
// (the locked card's line). Save data: META.achEver { id: 1 }. Loads after matrixonly.js.

S10_ALL = false;
for (const s of SAMPLES10) s.unlock = s.id === 'baseline' || s.v9 ? null : { txt: 'TODO_COPY:kin_lock_txt', secret: s.unlock && s.unlock.secret }; // (the locked card's text: kinall.js; the v9 samples have no lock, as before)
const s10LockTxt = s => (typeof kaLockTxt === 'function' ? kaLockTxt() : 'TODO_COPY:kin_lock_txt'); // (kinall.js owns the line)
achieve = (orig => function (id) {
  const first = G && !(G.show && G.show.achieved && G.show.achieved[id]);
  orig(id);
  if (!first || !ACHIEVEMENTS[id]) return;
  if (!(META.achEver && META.achEver[id])) { (META.achEver || (META.achEver = {}))[id] = 1; saveMeta(); }
})(achieve);

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
