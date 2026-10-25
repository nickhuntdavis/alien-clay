## 2026-10-25 Wrappers moved onto the event hub
- Systems: hooks, engine, weapons24, modifiers, weapon cells, pool balloons, acro, combos, aim
- Files: game.js, hooks.js, wup1.js, wup4.js, wup5.js, wup6.js, acro.js, combos10.js, modwide.js, spmast.js, balloon.js, cellmods4.js, aimplus.js, tests/hookstest.js, ARCHITECTURE.md, CLAUDE.md
- What: killEnemy, damageEnemy, hurtPlayer and fireWeapon are now thin: they fire `hit:before`, `kill:before`/`kill:after`, `hurt:before` (change or cancel the damage) and `fire:before`/`fire:after` round an unchanged body (`damageEnemyBody`, `killEnemyBody`, `hurtPlayerBody`, `fireWeaponBody`). The 13 wrap-and-replace overrides of those four functions in 11 files are hookOn listeners now, ordered as the wrappers ran. No behaviour change intended.
- Save data: none.
- Hooks: game.js killEnemy / damageEnemy / hurtPlayer / fireWeapon split into a thin entry and a ...Body; hurtPlayer takes an optional 5th argument (hookAfter, used by wup5's Postponed).
- Risk: a branch that still wraps one of the four functions keeps working (it wraps the thin entry, as before). Juggling (cellmods4) now also pops balloons on a Postponed hit landing 2 s later (it used to miss those).
