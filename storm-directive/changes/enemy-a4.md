## 2026-10-25 Strays into the roster (no build)
- Systems: enemies, roster
- Files: roster.js, foes2.js, pstatus.js, game.js, ENEMY_STATS.md, ENEMY_BEHAVIOUR.md
- What: Mirror Cell (Membrane), Grease Ball (Squishy), Platelet Clump, Brood Cyst, Broodling, Planarian are ROSTER rows with v10 defences; the Litmus Cell is retired (`w: 0`, `status: 'park'`, kept by id). `foes2Dmg` no longer applies weak/resist. Mirror's front reflection is gone; Grease Ball no longer lubricates you (slick zone, `pstGrip` effect and the enemy Oil look removed, its slow glob stays); Platelet Clump costs a piercing shot one extra pierce instead of stopping it.
- Save data: none.
- Hooks: none added (game.js: removed the `pstGrip()` factor and the `z.oil` fizz line).
- Risk: Mirror Cell and Grease Ball are now tankier in effect (Membrane/Squishy on top of old HP); not simmed for balance.
