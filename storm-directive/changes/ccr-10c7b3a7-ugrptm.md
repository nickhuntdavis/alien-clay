## 2026-10-24 Cells for five more weapons
- Systems: weapons (modifiers), tests
- Files: cellmods3.js (new), cellcopy3.js (new), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: every modifier now does something specific on Red Flagship, Soulmate Signal, Spark of Life, Maximum Gains and Enzyme Sneeze (MODIFIER_MATRIX.md 5.9, 120 cells), with plain card text for each.
- Save data: none.
- Hooks: none in shared files (wraps spawnProj, twinTick, wupHit, wupDmgMul, wupFire, wupTick, modDraw).
- Risk: balance on those five weapons; spawnProj wrapper tags every pellet of those weapons.

## 2026-10-24 Laser branches
- Systems: weapons (upgrades), tests
- Files: laserbranch.js (new), index.html, tests/branchtest.js
- What: the Laser gets branch upgrades at Lv 3, 6 and 9 (designed with the user): Laser Hair Removal (the beam strips Shell and Membrane; Ingrown, Wax Strip, Patch Test), Cat Toy (the red dot lures small enemies; Dot Trail, Bigger Dot, Two Dots), Overclocked (the ramp climbs three times as high, about 4 s of beam overheats it into a vent with a burst; Heat Sink, Redline, Meltdown); masteries Full Body Wax, Laser Show, Death Ray.
- Save data: none.
- Hooks: none.
- Risk: Laser balance (Overclocked's x3 ramp; Hair Removal ignores defences); every weapon now has branches.

