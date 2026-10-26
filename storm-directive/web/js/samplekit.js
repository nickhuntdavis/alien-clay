'use strict';
// Spawn Prawn - three weapons per sample, picked for the character (user, 26 Oct). One table, loaded last, so it wins
// over the starters other files set (weapons24.js W24's starter column, laser.js, acro.js, v9arms.js).
//  - Ordered Online (the nanobot) drops Hot Mess for the Laser; Redtail (touches everything, everyone's hot) takes Hot
//    Mess and Spark of Life (shared with the Acrobat sample) in place of Sister Cousin and The Runs (a passive now);
//    Not of This World takes Sister Cousin in place of There Is No Spoon (a passive now). The rest are unchanged.
//  - Sets each sample's weapons (kindred.js rescue cards, the Field Guide profile) and the W24 starter column (first
//    listed sample) for weapons that belong to one sample.
//  - THE OPENING DRAFT deals exactly those three, in a random order (user, 26 Oct: it dealt four, samplestart.js's two
//    best fits plus two random).
// Hooks: none in shared files. Wraps samplestart.js s10Start; kindred.js kinCards reads S10_BY[...].weapons. Loads after
// pagesplit.js.
const SAMPLE_KIT = {
  baseline: ['v_phys_proj', 'v_phys_burst', 'v_arcane_proj'],
  alpha: ['v_phys_spread', 'v_shock_beam', 's_lard'],
  beta: ['v_phys_contact', 'v_ice_pool', 's_duedate'],
  private: ['v_fire_proj', 'v_soul_proj', 's_redtape'],
  ordered: ['s_bubble', 's_mines', 'v_flame_beam'],
  redtail: ['s_tesla', 'v_flame_pool', 'acro_spark'],
  prawn: ['s_peekaboo', 's_toothfairy', 's_parasite'],
  alien: ['s_void', 's_twin', 's_seeker'],
  acro: ['acro_cap', 'acro_spray', 'acro_spark'],
};
{
  const owner = {};
  for (const [sid, ids] of Object.entries(SAMPLE_KIT)) {
    const s = typeof S10_BY !== 'undefined' && S10_BY[sid]; if (!s) continue;
    s.weapons = ids.slice();
    if (typeof PROFILES !== 'undefined' && PROFILES['s10_' + sid]) PROFILES['s10_' + sid].weapons = s.weapons;
    for (const id of ids) if (!owner[id]) owner[id] = sid;
  }
  if (typeof W24 !== 'undefined') for (const r of W24) {
    if (owner[r[0]] && !String(r[0]).startsWith('acro_')) r[4] = owner[r[0]]; // (the Acrobat keeps its own three)
    else if (SAMPLE_KIT[r[4]] && !SAMPLE_KIT[r[4]].includes(r[0])) r[4] = ''; // (no longer anyone's starter)
    if (W24_BY && W24_BY[r[0]]) W24_BY[r[0]].starter = r[4];
  }
}
s10Start = (orig => function () {
  const r = orig(), s = typeof s10Of === 'function' && S10_BY[s10Of()], kit = s && SAMPLE_KIT[s.id] && s.weapons.filter(id => WEAPONS[id]);
  return kit && kit.length ? shuffle(kit.slice()).map(id => optNewWeapon(id, 0)) : r;
})(s10Start);
