## 2026-10-23 Matrix only: the 27 matrix weapons and 25 matrix modifiers (v10.97)
- Systems: weapons, samples, weapons (modifiers), sandbox
- Files: matrixonly.js (new), index.html, tests/v9armstest.js, combo10test.js, wup3test.js, wup5test.js (matrixRestore)
- What: only the 27 weapons in MODIFIER_MATRIX.md are dealt anywhere (drafts, starting picks, rescues, the Sandbox): the rest go on hold, and the v9 samples leave the Sample Rack. Only the matrix's modifiers are offered (plus Type Swap); Sweep, Growing, Chain Hits, Returning, Delayed Blast, Lobbed, Trail, Around You, Volley, Stat Scaling, Split on Kill, Pets, Gravity Well and Lunge are hidden. MATRIX_ONLY.on = false, or matrixRestore(), undoes it; tests (window.TUT_OFF) still get every modifier.
- Save data: none.
- Hooks: none in shared files. Wraps modmatrix.js modOk; pushes onto weapons24.js W24_HOLD.
- Risk: v9 sample unlocks and saves still exist but are hidden.

