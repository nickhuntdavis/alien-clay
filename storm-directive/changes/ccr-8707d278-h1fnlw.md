## 2026-10-23 Frame rate in a late Race (v10.114)
- Systems: terrain, render (enemies, bosses), combat (status draw), particles, tests (sims)
- Files: terrain.js, render.js, fight.js, game.js, tests/sim/framebench.js (new)
- What: terrain drift checks its neighbours every 8th frame (staggered) instead of all pairs every frame (0.65 to 0.2 ms a frame). Enemy status rings and bars skip enemies off screen. Volvox dots, boss aura motes and rotifer glints draw as a few batched paths; in a crowd, yeast drops its two surface spots. A fixed late-Race scene goes from 421 to 122 canvas calls for enemies and 70 to 10 for a boss aura. Particles are trimmed to the quality cap even when an effect adds them directly. New `sim/framebench.js` times a late Race at a chosen quality step.
- Save data: none.
- Hooks: none.
- Risk: terrain steering reacts up to 8 frames late (it creeps at 6 to 20 a second); crowd-mode yeast look plainer; boss motes flicker in 4 brightness steps instead of smoothly.

## 2026-10-23 Run log: stats line, honest XP line
- Systems: run log, stat bonuses
- Files: statup.js, game.js, meta.js, tests/statuptest.js
- What: the run log has a ` stats:` line (your stat bonus totals) under the build line. The xp line's "collected" is now the gems' own value (it used to include the Race and Feat XP multipliers, so it read about 1.7x what was dropped) and its "bonus" is every multiplier together.
- Save data: run log records gain `stb`; `xpK` now means total multiplier.
- Hooks: none new (statup.js wraps runSummary, runText).
- Risk: none for play; old run log entries keep their old xp numbers.

## 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats (v10.113)
- Systems: stat bonuses (new), weapons, modifier cards, ui (weapon draft, BUILD tab), defences, movement
- Files: statup.js (new), game.js, pdef.js, index.html, style.css, tests/statuptest.js (new), tests/run.sh, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: every modifier card (each rank, and Switched at Birth) also adds a small bonus to one of 16 stats, shown on the card and totalled on the pause BUILD tab. Each of the 27 matrix weapons has its own base stats (fire rate, magazine, reload, crit chance, crit bonus, range), shown on the weapon draft; damage is rescaled so each still deals about what it did (statuptest: all within 20% on dummies).
- Save data: none (run state `G.stb`; new stat `G.P.accel`).
- Hooks: game.js updatePlayer swim thrust reads `P.accel`; pdef.js pdMemFrac -> stMemFrac.
- Risk: weapon damage numbers change for all 27 (balance held per weapon, not simmed per sample); stat bonuses make late runs a little stronger; anything that reads `def.base.dmg`/`cd`/`mag` sees the new values. Placeholder `TODO_COPY:stats_build_head` (BUILD tab heading).
