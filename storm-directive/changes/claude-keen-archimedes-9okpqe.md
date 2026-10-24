## 2026-10-24 Event hub: features register for core moments instead of editing game.js
- Systems: hooks (new), engine
- Files: hooks.js (new), game.js, index.html, tests/hookstest.js (new), tests/run.sh, ARCHITECTURE.md, CLAUDE.md
- What: killEnemy, damageEnemy, hurtPlayer, fireWeapon and update no longer list ~75 feature calls by hand; each fires a named event (`kill:early`, `kill`, `dmgMul`, `proc`, `hit:late`, `hurtMul`, `hurt`, `hurt:late`, `fire`, `tick`) and hooks.js holds the old calls in their old order. New features call `hookOn(...)` from their own file. No behaviour change intended.
- Save data: none.
- Hooks: game.js killEnemy -> hookRun('kill:early'/'kill'); damageEnemy -> hookMul('dmgMul'), hookRun('proc'/'hit:late'); hurtPlayer -> hookMul('hurtMul'), hookRun('hurt'/'hurt:late'); fireWeapon -> hookFirst('fire'); update -> hookSafe('tick').
- Risk: a branch that adds a call inside one of the removed blocks in game.js will conflict; move that call into a hookOn line in its own file. chemPlayerZones and pstTick now run inside safely() like the other ticks (an error there no longer stops the frame). In hurtPlayer the grudge / last-hit bookkeeping now runs before the hurt listeners (none of them read it).

## 2026-10-24 Remove the v9 fallback (window.V10_OFF)
- Systems: core spine (game, render, ui, bosses), chemistry, settings, meta, tutorials, tests
- Files: 41 files in web/js (v10.js, look10.js, game.js, ui.js, bosses.js, chem.js, inspect.js, school.js, tutorial.js and others); tests/loadouttest.js (removed), tests/run.sh
- What: the hidden `window.V10_OFF` switch that brought back the v9 combat build is gone, with every `V10`/`L10` branch folded to its v10 side and the v9 code those branches guarded deleted (old armour block in hurtPlayer, automatic reactions and overloads in applyElement, the v9 sample screen in UI.openSamples, the v9 Junk DNA lesson, the Arcade view offer). No behaviour change in the shipped build.
- Save data: none (META_KEY is always sd_meta10).
- Hooks: none added. `V10` and `L10` stay defined as `true` so other branches' `if (V10)` lines still run.
- Risk: a branch that adds new `!V10` code expects the v9 path to exist; it is now dead. loadouttest (v9 loadout screens) is deleted.
