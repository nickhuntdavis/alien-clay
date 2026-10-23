'use strict';
// Spawn Prawn - Rewind is off in v10 runs (user, 23 Oct). It was a v9 mechanic: it undid deaths, and its Paradox Echo
// (a ghost firing your weapons, then a 190-wide implosion) outdamaged whole builds (50% of a Sandbox run's damage).
// No charges are gained, the button is hidden, and dying is final. Back on with V10_OFF (or NOREWIND.on = false).
// Hooks: none in shared files. Wraps td.js startRewind and gainChrono.
const NOREWIND = { on: typeof V10 !== 'undefined' && !!V10 }; // (tests of the old mechanic set on = false)
startRewind = (orig => function (auto) { return NOREWIND.on ? false : orig(auto); })(startRewind);
gainChrono = (orig => function (v) { if (!NOREWIND.on) orig(v); })(gainChrono);
{ const st = document.createElement('style'); st.textContent = 'body:not(.rewindOn) #rewindBtn{display:none!important}'; document.head.appendChild(st); if (!NOREWIND.on) document.body.classList.add('rewindOn'); }
