## 2026-10-28 Tougher race start (v10.208)
- Systems: race (race early), enemies
- Files: raceearly.js (new), index.html, ARCHITECTURE.md, tests/sim/early.js (new)
- What: in the race, ordinary enemies spawned at 0:00 have x2 health, x2.5 hits and x1.4 speed, fading to normal by 3:00 (RACE_EARLY). Bot sim (10 runs): damage taken in minutes 1 and 2 from about 1-5 and 6-24 to about 18-35 and 40-64; lowest health in minute 2 from about 90% to 45-65%. Deaths by 7:00 unchanged within noise (baseline 1/6 to 6/10). Extra early spawns were tried and dropped: they fed XP and made the start easier.
- Save data: none.
- Hooks: wraps game.js makeEnemy (power11.js also wraps it, later in script order).
- Risk: new players meet real pressure in the first 2 minutes. Petri Dish, Endless and levels untouched (raceOn); bosses and rivals untouched (def.patterns).
