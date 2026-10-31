# claude/sharp-hypatia-icfi8l

## 2026-10-31 Standby: a blank slate with one sample, Zero (v10.235)
- Systems: samples, weapons (draft), loot, kindred, tests/tools (planner)
- Files: standby.js (new), index.html, tests/standbytest.js (new), tests/tools/planner/planner.js, tests/tools/planner/template.html, ARCHITECTURE.md, NOTES.md
- What: every sample but a new, empty one called Zero is parked (SAMPLES10 holds Zero alone; S10_BY keeps them all). Zero has no passive, Feat or weapon of its own and starts with a placeholder Shot (Standard Issue's projectile, renamed). Every box (level-ups, chests, boss DNA, Feats, mutations, branches, forks) is dropped unopened, and no samples are rescued. The planner lists Zero (and your own samples) and its left panel holds only the blank block. STANDBY.on = false in standby.js restores the whole game. Tests and sims run the full game unless the page is opened with ?standby.
- Save data: META.profile is set to s10_zero on load.
- Hooks: none in shared files. standby.js wraps v10Box and kinChoose; loads last.
- Risk: everything that reads SAMPLES10 now sees Zero only; any screen that assumed a box would open (tutorial cards about Feats or mutations) may wait or show nothing.
