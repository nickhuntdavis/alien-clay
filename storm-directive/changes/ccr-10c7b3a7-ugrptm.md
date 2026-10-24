## 2026-10-24 Weapon branches and elite carriers back
- Systems: weapons (upgrades), rewards (elite drops), tests
- Files: branchback.js (new), mutdrop.js (two strand labels are TODO_COPY), index.html, tests/branchtest.js (new), tests/mutdroptest.js, tests/run.sh
- What: a weapon's old upgrade path opens again as it reaches Lv 3 (pick one of three promises), Lv 6 (that promise's cards and its wildcard) and Lv 9 (a mastery; one weapon a run). Some elites carry a DNA strand again (the helix, the beacon, a 40 s countdown); kill one in time and the strand gives you a loot box with modifier cards.
- Save data: none.
- Hooks: none in shared files (mutdrop.js labels changed in place).
- Risk: more power per run (branch cards on top of modifiers, plus carrier boxes); branch cards and the new weapon cells both act on Nappy Mines, Blowing Bubbles, Hot Mess and Eggs (e.g. Domino and Loaded nappy together); 5 TODO_COPY lines for the carrier.

