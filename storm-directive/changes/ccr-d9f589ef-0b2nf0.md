## 2026-10-28 Crowd frame bench
- Systems: tests (sims), render
- Files: tests/sim/crowdbench.js (new), render.js, ARCHITECTURE.md
- What: crowdbench.js times frames when you swim into a packed crowd (DEFS=enemy ids, LOD=on-screen threshold, NODRAW=1 for update only). render.js counts enemies on screen and draws the plain crowd look above LOD_ON_SCREEN (999 for now: off, so nothing changes yet).
- Save data: none.
- Hooks: none.
- Risk: none (threshold off).

## 2026-10-28 Run clock on the HUD (v10.210)
- Systems: ui (HUD)
- Files: render.js
- What: a small run clock (m:ss) at the top centre between the AUTO/speed and pause buttons. It reads G.t, which runs at the set game speed, so it matches the race's 15:00 egg and the run log's times. The top bar that used to hold the clock is never drawn (Immersive is the only HUD).
- Save data: none.
- Hooks: none (one line in render.js drawHud).
- Risk: none.

## 2026-10-28 Obligatory Podcast, enemy health rings back (v10.209)
- Systems: weapons (podcast), samples (type pools), enemies (health rings), ui
- Files: podcast.js (new), foes.js, render.js, typepools.js, matrixonly.js, wstars.js (regenerated), index.html, ARCHITECTURE.md, tests/typepoolstest.js
- What: new Force weapon Obligatory Podcast: 3 sound waves a shot, each a widening 40-degree funnel that pierces and shoves; reach 300, crowd 116 dps into 10 (bars 1/2/5/3). In the Force pool, and Alpha drafts it too. Every hurt enemy shows a red health ring again (it needed the Anti-Immune Stain, retired in v9.11); rivals ring in their own colour. Weapon bars re-ranked with 31 weapons (a few other weapons' reach bars moved by one).
- Save data: none.
- Hooks: render.js shot loop skips pr.pod; typepools.js tpOk -> podOk; matrixonly.js MATRIX_ONLY.weapons + v_phys_podcast; wraps v10Draw; hookOn fire, tick.
- Risk: one more arc stroke per hurt enemy (late-game draw cost); Alpha's drafts now include a Force weapon. Copy open: TODO_COPY:w_podcast_desc.

## 2026-10-28 Tougher race start (v10.208)
- Systems: race (race early), enemies
- Files: raceearly.js (new), index.html, ARCHITECTURE.md, tests/sim/early.js (new)
- What: in the race, ordinary enemies spawned at 0:00 have x2 health, x2.5 hits and x1.4 speed, fading to normal by 3:00 (RACE_EARLY). Bot sim (10 runs): damage taken in minutes 1 and 2 from about 1-5 and 6-24 to about 18-35 and 40-64; lowest health in minute 2 from about 90% to 45-65%. Deaths by 7:00 unchanged within noise (baseline 1/6 to 6/10). Extra early spawns were tried and dropped: they fed XP and made the start easier.
- Save data: none.
- Hooks: wraps game.js makeEnemy (power11.js also wraps it, later in script order).
- Risk: new players meet real pressure in the first 2 minutes. Petri Dish, Endless and levels untouched (raceOn); bosses and rivals untouched (def.patterns).
