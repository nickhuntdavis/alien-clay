'use strict';
// Spawn Prawn - XP granules you can see, that you go and get (user, 26 Oct).
//  - LOOK: granules drawn XPG.size (1.8) times bigger with a pale halo round each, so they read on the pale slide and the
//    dark film alike (render.js gem pass reads XPG.size and XPG.halo).
//  - DRIFT: loose granules no longer crawl to you from 650 px in wave mode (game.js updatePickups -> xpDrift). Off in
//    waves, cut in the race (it swims on, so a little drift stays: XPG.race). The 105 px magnet is unchanged.
//  - STAT CARDS (statup.js ST_DEF, dealt by wmods.js WM_STAT, rarity steps as the others): Pickup Range (+15% magnet a
//    step, P.magnet) and Gem Drift (+100 px of drift reach a step; any at all switches drift on in waves). Gravity Well
//    and Trail modifier cards bank them (ST_MOD).
// Hooks: game.js updatePickups -> xpDrift; render.js gem pass reads XPG. Wraps statup.js stNow. Loads after buildbtn.js.
const XPG = { size: 1.8, halo: true, wave: { r: 0, v: 0 }, race: { r: 700, v: 110 }, driftV: 85 };
ST_DEF.magnet = { name: 'Pickup Range', k: 0.15, fmt: 'pct', P: 'magnet' };
ST_DEF.drift = { name: 'Gem Drift', k: 100, fmt: 'flat' };
ST_MOD.gravity = 'magnet'; ST_MOD.trail = 'drift'; // (a modifier way into each: Gravity Well pulls, Trail leaves a wake; both had a fallback weapon stat)
for (const k of ['magnet', 'drift']) { if (!ST_ORDER.includes(k)) ST_ORDER.push(k); if (typeof WM_STAT !== 'undefined' && !WM_STAT.includes(k)) WM_STAT.push(k); }
// [reach, speed] of the slow drift towards you.
function xpDrift(race) {
  const b = race ? XPG.race : XPG.wave, add = stVal('drift');
  return [b.r + add, b.v || (add > 0 ? XPG.driftV : 0)];
}
stNow = (orig => function (k, add) { return k === 'drift' ? String(Math.round(stVal('drift') + (add || 0))) : orig(k, add); })(stNow);
