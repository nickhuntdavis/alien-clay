## 2026-10-24 Remove the v9 fallback (window.V10_OFF)
- Systems: core spine (game, render, ui, bosses), chemistry, settings, meta, tutorials, tests
- Files: 41 files in web/js (v10.js, look10.js, game.js, ui.js, bosses.js, chem.js, inspect.js, school.js, tutorial.js and others); tests/loadouttest.js (removed), tests/run.sh
- What: the hidden `window.V10_OFF` switch that brought back the v9 combat build is gone, with every `V10`/`L10` branch folded to its v10 side and the v9 code those branches guarded deleted (old armour block in hurtPlayer, automatic reactions and overloads in applyElement, the v9 sample screen in UI.openSamples, the v9 Junk DNA lesson, the Arcade view offer). No behaviour change in the shipped build.
- Save data: none (META_KEY is always sd_meta10).
- Hooks: none added. `V10` and `L10` stay defined as `true` so other branches' `if (V10)` lines still run.
- Risk: a branch that adds new `!V10` code expects the v9 path to exist; it is now dead. loadouttest (v9 loadout screens) is deleted.
