## 2026-10-16 Branch tree, Force slice (not yet shipped)
- Systems: weapons, sequences
- Files: branches.js (new), index.html, arsenal.js, game.js, sigs.js, armoury.js, tests/branchtest.js (new), tests/run.sh, tests/tools/guide.js, ARCHITECTURE.md, STARTERS.md (new, design notes)
- What: Spitball, Placenta Paddle and Little Swimmers now have a Lv 4 first branch (two to pick from) and Lv 7 sub-branches (two under the one picked). The old Lv 3, 5, 8 and 10 forks are unchanged. Branch cards say BRANCH. 18 branch nodes in all (6 first branches, 12 sub-branches). Data and effects live in `branches.js` (`BRANCHES`), so more weapons are one table entry plus effects.
- Save data: none (picks live in `w.perks[4]` and `w.perks[7]`, like the other forks).
- Hooks: arsenal.js setWeaponLevel -> brQueue, applyPerks -> brStats, perkProcs -> brProc, meleeSweep -> brSwing; game.js genLoot 'branch' -> brIds, update -> brTick, player speed -> brSpeed; sigs.js sigVolley -> brVolley; armoury.js petsTick -> brPet.
- Risk: three weapons get two more upgrade screens each (Lv 4 and Lv 7), so runs with them are slightly stronger and slightly slower to pick through. Not balance-tuned yet. Slip and Slide pushes enemies out of paddle reach, which is intended but untested in real play.
