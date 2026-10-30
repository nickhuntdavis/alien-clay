'use strict';
// Spawn Prawn - per-sample branch sets (the user, 30 Oct: Alpha's hustle branches, "Alpha-only"). A weapon keeps its branches for
// every sample; a sample can register its own set for a weapon with wupRegFor(sampleId, weaponId, spec) (the weapons24.js card
// spec). While a run is played as that sample, WUP[weaponId] returns the sample's set, so every branch screen, the Lv 6 and Lv 9
// screens, wupCarry, branchback.js, wmods.js and the fit checks follow without knowing about it. wupReg() still sets the shared set.
//  - The run's sample is G.s10.id. SBR.as forces one (tests, and the planner's data build, which reads every set).
//  - wupSpecFor(weaponId, sampleId) reads one sample's set (or the shared one) without a run.
// Hooks: none in shared files. Turns WUP entries into accessors (get: the run's set, set: the shared one). Loads after
// weapons24.js and every wup*.js, before the sample sets (alpha*.js).

const SBR = { alt: {}, base: {}, as: null };
const sbrSample = () => SBR.as || (typeof G !== 'undefined' && G && G.s10 && G.s10.id) || null;
function wupRegFor(sample, id, spec) {
  if (!SBR.alt[id]) {
    SBR.alt[id] = {}; SBR.base[id] = WUP[id];
    Object.defineProperty(WUP, id, { configurable: true, enumerable: true,
      get() { const s = sbrSample(); return (s && SBR.alt[id][s]) || SBR.base[id]; },
      set(v) { SBR.base[id] = v; } });
  }
  SBR.alt[id][sample] = spec;
}
const wupSpecFor = (id, sample) => (SBR.alt[id] && sample && SBR.alt[id][sample]) || (SBR.alt[id] ? SBR.base[id] : WUP[id]);
const sbrSamplesOf = id => Object.keys(SBR.alt[id] || {});
