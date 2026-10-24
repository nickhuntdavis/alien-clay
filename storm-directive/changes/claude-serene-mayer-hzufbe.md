## 2026-10-24 Five failing tests brought up to date
- Systems: tests
- Files: tests/samplestest.js, tests/v10test.js, tests/v9armstest.js, tests/p11test.js, tests/wup2test.js
- What: samplestest, v10test and v9armstest check the 23 Oct sample rules (samplestart.js: a random three-weapon matrix offer with one Switched at Birth card, only Baseline open on a fresh save, achievements unlock the rest, Ordered Online's 30% Evasion). p11test kills its late germ with ten times its health (late germs now pass 1e6). wup2test's Final Prick and Terminal Clause scenes run longer with weaker enemies so their chance effects always show. v10test's type-switch check uses a v10 weapon (the random offer may have none). No game code changed.
- Save data: none.
- Hooks: none.
- Risk: none (tests only).
