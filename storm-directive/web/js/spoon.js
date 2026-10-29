'use strict';
// Spawn Prawn - There Is No Spoon becomes a defensive sperm passive (user, 24 Oct: "make There Is No Spoon a defensive
// passive"). It leaves the weapon roster (matrixonly.js MATRIX_ONLY.weapons) and comes back as a Genome card, built the way
// The Runs is (spassives.js spRunsSlot): a hidden s_siphon slot, never in G.weapons, that eats enemy bullets near you and
// fires them back as hard as they hit you (arsenal.js updateSiphon, so the weapon's own rules come with it).
//  - Lv 1: the weapon as it was (eats within its area, stores its magazine).
//  - Lv 2: eats from 30% further away, stores 50% more.
//  - Lv 3: returned bullets hit 50% harder.
//  - Mastery (Rank 4, the build's one sperm mastery, spassives.js spMasteryRoom): eats from 60% further, stores twice as many,
//    and returned bullets hit twice as hard. (The doc's other masteries are numbers only too: spfull.js.)
// Stats follow the player's level as a held weapon's do (computeStats reads weapons24.js wStatLv); refreshed every 3 levels.
// Hooks: none in shared files. Wraps v10.js v10Tick; adds to spfull.js SP_KEEP. Loads after spmast.js.

const SPOON = { lv2: { area: 1.3, mag: 1.5 }, lv3: { dmg: 1.5 }, lv4: { area: 1.6, mag: 2, dmg: 2 } };
mutCard({ id: 'sp_spoon', title: 'There Is No Spoon', icon: 'NS', rarity: 2, maxRank: 3, family: 'mut:body', flavour: 'It swallows. Then it spits. Manners were not selected for.',
  desc: 'Eats enemy bullets that come close and spits them back just as hard. Holds 10. Ranks: reach and storage, then harder hits.' });
{ const c = MUT_REG.find(x => x.id === 'sp_spoon'), el = c.eligible, ap = c.apply; // (it can be mastered, as The Runs can)
  c.maxRank = 4; c.eligible = G => el(G) && (mr('sp_spoon') < 3 || spMasteryRoom('sperm'));
  c.apply = (G, t) => { const r0 = mr('sp_spoon'); ap(G, t); if (r0 === 3 && mr('sp_spoon') === 4) (G.spM || (G.spM = [])).push('sp_spoon'); }; }
SP_KEEP.push('sp_spoon');

function spoonSlot() {
  const S = G.spSpoon || (G.spSpoon = { w: makeSlot('s_siphon', false, 1), rank: 0, lv: 0 });
  const r = mr('sp_spoon'), lv = Math.floor(((G && G.level) || 1) / 3);
  if (S.rank !== r || S.lv !== lv) {
    S.rank = r; S.lv = lv;
    computeStats(S.w); const s = S.w.s;
    const k = r >= 4 ? SPOON.lv4 : r >= 2 ? SPOON.lv2 : null;
    if (k) { s.area *= k.area; s.mag = Math.round(s.mag * k.mag); }
    if (r >= 4) s.dmg *= SPOON.lv4.dmg; else if (r >= 3) s.dmg *= SPOON.lv3.dmg;
  }
  return S.w;
}
v10Tick = (orig => function (dt) {
  orig(dt);
  if (G && G.state === 'play' && mr('sp_spoon')) updateSiphon(spoonSlot(), dt);
})(v10Tick);
