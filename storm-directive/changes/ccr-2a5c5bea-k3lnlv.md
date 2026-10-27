## 2026-10-27 Late-wave hitches and acid after-burn (v10.182)
- Systems: render (enemy shapes, tails, terrain outlines), terrain (drift, acid, ambient crowd), Membranes (foemem), tests
- Files: terrain.js, render.js, foemem.js, tests/sim/framewave.js (new), ARCHITECTURE.md
- What: the late-wave stutter in the v10.180 log (#24, wave 20 win: lows of 6 to 15 fps, frames up to 158 ms) traced to garbage-collector pauses, not one slow system: the game made about 1.2 MB of garbage a frame. Terrain neighbour steering now looks only in nearby grid cells (was all pairs, 150 KB a frame), and enemy shapes, tails, terrain outlines and Membranes draw from reused buffers instead of fresh point arrays; the ambient crowd's grid reuses its cells. Same scene: 1212 -> 859 KB a frame (29% less); drawing is pixel-identical. Acid's after-burn now lasts 1.5 s per second you were in it (up to 2.5 s): a brush used to cost the full 2.5 s, so "Acid burn" out-hurt the acid itself (#23: 43 of 51 damage taken by wave 3).
- Save data: none.
- Hooks: none (new helpers terrainNTurn in terrain.js; SHB, shbRound, shbSmooth, TAIL_L/TAIL_R in render.js).
- Risk: terrain pieces see a neighbour up to 0.25 s late after it drifts into a new cell (the grid's regrid time); the phone's fps gain is unmeasured (the headless bench shows the garbage drop, not phone GC pause length).
