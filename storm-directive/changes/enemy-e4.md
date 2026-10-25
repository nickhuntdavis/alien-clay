## 2026-10-25 Enemy loop robustness and frame cost (E4, not shipped)
- Systems: enemies, fight (v10 defences)
- Files: game.js (updateEnemies, new enemyFault), fight.js (fightTick, fightDraw), tests/fighttest.js
- What: one enemy's AI throwing no longer aborts the frame for the rest (caught per enemy, reported once per enemy name through `safely`, error box shows once). `fightTick` skips far enemies (beyond CROWD.far) on alternate frames with the time carried (`fFarDt`), same exemptions as updateEnemies. `fightDraw` culls off screen before calling `fightId`, once per enemy. framebench (q4, 240 frames, seeded): update 4.15 ms -> 3.81 ms, draw 8.6 ms -> 8.09 ms, calls 629 -> 628.
- Save data: none
- Hooks: none
- Risk: far enemies' defence timers now tick in 2-frame steps (carry keeps totals equal). A throwing AI now skips that enemy's rest-of-frame (leash, contact) instead of the whole frame.
