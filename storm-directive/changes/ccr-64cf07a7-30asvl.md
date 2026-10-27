## 2026-10-27 Weapon card bars measured (v10.189)
- Systems: weapon card bars (new), ui
- Files: wstars.js (new, generated), tests/tools/wstars.js (new), tests/wstarstest.js (new), index.html, tests/run.sh, ARCHITECTURE.md
- What: POWER, FIRE RATE, REACH and CROWDS on weapon cards and details were a flat 3 of 5 for every v10 weapon. They are now measured per weapon in a fixed arena (Lv 1, no modifiers) and ranked in fifths across the 26 matrix weapons: power is damage a second to one enemy, fire rate is attacks a second, reach is the farthest hit, crowds is damage a second into a pack of 10.
- Save data: none.
- Hooks: none (wstars.js sets WEAPONS[id].stars at load).
- Risk: the bars go stale after balance changes until tools/wstars.js is rerun.
