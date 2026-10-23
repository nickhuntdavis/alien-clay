## 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats (v10.113)
- Systems: stat bonuses (new), weapons, modifier cards, ui (weapon draft, BUILD tab), defences, movement
- Files: statup.js (new), game.js, pdef.js, index.html, style.css, tests/statuptest.js (new), tests/run.sh, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: every modifier card (each rank, and Switched at Birth) also adds a small bonus to one of 16 stats, shown on the card and totalled on the pause BUILD tab. Each of the 27 matrix weapons has its own base stats (fire rate, magazine, reload, crit chance, crit bonus, range), shown on the weapon draft; damage is rescaled so each still deals about what it did (statuptest: all within 20% on dummies).
- Save data: none (run state `G.stb`; new stat `G.P.accel`).
- Hooks: game.js updatePlayer swim thrust reads `P.accel`; pdef.js pdMemFrac -> stMemFrac.
- Risk: weapon damage numbers change for all 27 (balance held per weapon, not simmed per sample); stat bonuses make late runs a little stronger; anything that reads `def.base.dmg`/`cd`/`mag` sees the new values. Placeholder `TODO_COPY:stats_build_head` (BUILD tab heading).
