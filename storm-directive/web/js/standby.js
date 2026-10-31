'use strict';
// Spawn Prawn - standby: a blank slate (the user, 31 Oct 2026: "Hide/disable all samples except 1 new, empty one called Zero from the planner
// and the game. Keep them on standby. Similarly hide all current weapons, feats, branches, modifiers etc. We're starting with a completely blank
// slate."). Nothing is deleted: everything stays in code, and STANDBY.on = false brings the whole game back as it was.
//  - Zero: a new sample with no passive, no Unique Feat and no weapons of its own. Until it has one, it starts with a placeholder shot
//    (Standard Issue's plain projectile, renamed for the standby; no branches or modifiers ever reach it).
//  - Every other sample is parked: SAMPLES10 holds Zero alone, so the sample screen, rescues (kindred.js) and every list that reads it see
//    only Zero. S10_BY keeps them all (saves and old runs still resolve).
//  - No boxes: level-ups, chests, boss DNA, Feats, mutations, weapon branches and forks are all dropped unopened (the user chose "nothing").
//    The run's first box ('start') is applied straight away, so Zero gets its shot.
//  - The Loadout Planner reads STANDBY (tests/tools/planner/planner.js): it lists Zero and your own samples only and hides the rack's game cards.
// Hooks: none in shared files. Wraps v10.js v10Box and kindred.js kinChoose. Loads last (index.html, after cardrulesengine.js).
// (Automated tests and sims, which run under webdriver, see the full game unless the page is opened with ?standby: the suite tests the
// systems that are parked, not the blank slate. The APK and a browser are always on standby. standbytest.js and the planner use ?standby.)
const STANDBY = { on: !(typeof navigator !== 'undefined' && navigator.webdriver && !/[?&]standby\b/.test(location.search)), keep: ['zero'], parked: [], shot: 'v_phys_proj' };
(function () {
  if (!STANDBY.on || typeof SAMPLES10 === 'undefined') return;
  // ------------------------------------------------------------ Zero
  const Z = { id: 'zero', name: 'Zero', origin: 'Unknown', types: ['force'], passive: 'None yet', pdesc: 'No passive. Nothing has been decided.',
    sci: 'Sample {id} arrived with no file. Not a missing file. No file.', unlock: null, weapons: [STANDBY.shot], strain: 0 };
  SAMPLES10.push(Z); S10_BY.zero = Z;
  PROFILES.s10_zero = { name: Z.name, trait: Z.passive, fmt: () => Z.pdesc, desc: Z.pdesc, weapons: Z.weapons, s10: 'zero', apply: () => {} };
  if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK.s10_zero = Object.assign({}, SEQ_LOOK.human1 || SEQ_LOOK.vanguard, { short: 'ZERO' });
  if (typeof SL !== 'undefined') { SL.zero = SL.baseline; SL_TAIL.zero = SL_TAIL.baseline; SL_SHAPE.zero = SL_SHAPE.baseline; SL_HEAD.zero = SL_HEAD.baseline; if (typeof SL_FAMILY !== 'undefined') SL_FAMILY.zero = SL_FAMILY.baseline; }
  // ------------------------------------------------------------ park every other sample
  STANDBY.parked = SAMPLES10.filter(s => !STANDBY.keep.includes(s.id)).map(s => s.id);
  SAMPLES10.splice(0, SAMPLES10.length, ...SAMPLES10.filter(s => STANDBY.keep.includes(s.id)));
  try { if (typeof META !== 'undefined' && (!META.profile || !/^s10_zero$/.test(META.profile))) { META.profile = 's10_zero'; if (typeof saveMeta === 'function') saveMeta(); } } catch (e) { }
  // ------------------------------------------------------------ the placeholder shot
  const d = typeof WEAPONS !== 'undefined' && WEAPONS[STANDBY.shot];
  if (d) { STANDBY.shotWas = { name: d.name, desc: d.desc }; d.name = 'Shot'; d.desc = d.play = 'A plain shot. A stand-in until Zero has a weapon of its own.'; d.icon = 'SH'; if (W24_BY[STANDBY.shot]) W24_BY[STANDBY.shot].name = 'Shot'; }
  // ------------------------------------------------------------ no boxes (the first one equips the shot)
  if (typeof v10Box === 'function') v10Box = (orig => function (req) {
    if (!STANDBY.on || !req) return orig.apply(this, arguments);
    if (req.kind === 'start') { try { genLoot(req); optNewWeapon(STANDBY.shot, 0).apply(); } catch (e) { console.warn('standby start', e); } } // (genLoot for the sample's set-up: samples10.js s10Start; then the shot)
    return false; // (dropped unopened)
  })(v10Box);
  // ------------------------------------------------------------ no rescues of parked samples
  if (typeof kinChoose === 'function') kinChoose = (orig => function () { return STANDBY.on ? null : orig.apply(this, arguments); })(kinChoose);
})();
