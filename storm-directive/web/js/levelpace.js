'use strict';
// Spawn Prawn - level pace and reward sources (user, 29 Oct: "too easy, too many loot boxes"; boxes should be rewards
// for play, not a schedule; runs should top out near Lv 30, not 60).
//  - New level L costs the XP of old level LVPACE.map(L) = L + L^2 / 30: near the old pace early (old Lv 13 at Lv 10),
//    double late (old Lv 33 at Lv 20, old Lv 60 at Lv 30).
//    Level-keyed numbers follow: EGG.level 30, SLOT_LEVELS 4 and 9, EVOLVE_LV 4/8/15/27 (the old 5, 12 and 5/10/20/50), and levelsAhead's expected
//    curve is read in old levels (LVPACE.map), so enemies rubber-band on the same XP lead as before.
//  - Reward screens come from play: one per level-up (DNA drops), the boss relic, Vestigial Masses, and the weapon
//    kill bars (wmods.js, slower: WM.k0 20, was 16). Gone: elite carrier DNA strands (XEB.chance 0), the boss spoils screen,
//    the Race's 5:00 and 10:00 milestone screens, and every other DNA strand ('chest': elite carriers, infection cures, events, chest pickups) but
//    Achievement DNA.
// Hooks: none in shared files. Replaces game.js xpNeed and levelsAhead; wraps director.js dirGate. Loads after
// vestigial.js (and raceplan.js, evolve.js, branchback.js, kindred.js).

const LVPACE = { on: true, spoils: false, chest: false, k: 30, map: L => L + L * L / LVPACE.k };
const xpNeedOld = xpNeed;
const lvpCum = x => { let c = 0, l = 1; for (; l <= Math.floor(x); l++) c += xpNeedOld(l); return c + (x - Math.floor(x)) * xpNeedOld(l); }; // (old XP from Lv 1 to old level x)
xpNeed = l => LVPACE.on ? Math.max(1, Math.round(lvpCum(LVPACE.map(l)) - lvpCum(LVPACE.map(l - 1)))) : xpNeedOld(l);
levelsAhead = (orig => function () {
  if (!LVPACE.on) return orig();
  if (G.wave || G.lvl) return 0;
  const want = 1 + 52 * Math.pow(Math.min(1, G.t / (typeof raceCurveT === 'function' ? raceCurveT() : 540)), 0.85); // (in old levels)
  return Math.max(0, LVPACE.map(G.level) - want);
})(levelsAhead);
if (LVPACE.on) {
  EGG.level = 30;
  SLOT_LEVELS.splice(0, SLOT_LEVELS.length, 4, 9);
  if (typeof EVOLVE_LV !== 'undefined') EVOLVE_LV.splice(0, EVOLVE_LV.length, 4, 8, 15, 27);
  if (typeof XEB !== 'undefined') XEB.chance = 0;
  if (typeof RPLAN !== 'undefined') RPLAN.milestones = [];
}
dirGate = (orig => function (req) {
  if (LVPACE.on && req && ((!LVPACE.spoils && req.kind === 'spoils') || (!LVPACE.chest && req.kind === 'chest' && !(req.src && req.src.t === 'ach')))) return false;
  return orig(req);
})(dirGate);
