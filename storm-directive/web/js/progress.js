'use strict';
// Spawn Prawn - what a new player has (user, 28 Oct). On a first play only The Race (s001) and The Petri Dish (s002)
// are on the mode screen, and only Baseline on the sample rack (kinall.js: S10_ALL off; rescue a sample and finish
// that run to open it; the v9 samples are locked here too). The other modes open by winning (META.modeWon, set on victory):
//  - Endless (s006) once you have beaten the Petri Dish; Level 1 (s007) and the race course (s011) once you have won The Race.
//  - Developer mode's Unlock Everything (META.devAll) opens them all.
// The Race's mode tag is a placeholder while it gets a new name (TODO_COPY:mode_race_tag).
// Hooks: none (wraps game.js victory and samples10.js s10Modes; loads after dsheads.js). Save data: META.modeWon { <mode>: 1 }.

const PROGRESS = { need: { s006: 's002', s007: 's001', s011: 's001' } };
// The v9 samples on the rack (samples9.js) had no unlock, so they were open from the start: locked like the rest
// (META.s10 or developer mode opens them; rescues do not offer them yet, kinall.js KINALL.odds).
for (const s of SAMPLES10) if (/^v9_/.test(s.id) && !s.unlock) s.unlock = { txt: typeof kaLockTxt === 'function' ? kaLockTxt() : '' };
const modeOpen = m => { const n = PROGRESS.need[m]; return !n || !!META.devAll || !!(META.modeWon && META.modeWon[n]); };
victory = (orig => function (at) {
  const was = G && (G.state === 'finale' || G.state === 'won');
  const r = orig.apply(this, arguments);
  if (!was && typeof UI !== 'undefined' && UI.sample) { (META.modeWon || (META.modeWon = {}))[UI.sample] = 1; saveMeta(); }
  return r;
})(victory);
if (typeof s10Modes === 'function') {
  s10Modes = (orig => function (id) {
    const r = orig.apply(this, arguments);
    document.querySelectorAll('#sampleList [data-mode]').forEach(b => {
      if (!modeOpen(b.dataset.mode)) { b.remove(); return; }
      if (b.dataset.mode === 's001') { const em = b.querySelector('.sx-txt em'); if (em) em.textContent = 'TODO_COPY:mode_race_tag'; }
    });
    return r;
  })(s10Modes);
}
