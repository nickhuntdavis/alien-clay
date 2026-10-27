## 2026-10-27 Pacing: intensity cycle, wave shape, screens in lulls (v10.182)
- Systems: pacing (new), engine (spawn rate), wave-mode, reward director
- Files: pacing.js (new), game.js, waves.js, campaign.js, director.js, index.html, ARCHITECTURE.md
- What: Free modes (Race, Endless, race to the egg) swell and lull on a 75 s cycle (0.6x for 12 s, then a ramp from 0.85x to 1.3x; the average is 1.0) with a 10 s lull after every boss death. Wave feeds are a burst, a steady middle and a final surge instead of flat; the rest after a wave clear is 5 s (was 1.6 s). The Reward Director opens screens at half its gap in a lull and 15 s later at a peak (unless three or more rewards wait). `PACING.on = false` restores the old flat behaviour. Telemetry: `G.stats.lullT`, `lullScr`.
- Save data: none.
- Hooks: game.js update spawn rate -> paceK; waves.js waveSpawn and campaign.js campSpawn feed -> paceShape; waves.js waveClear -> PACING.rest; director.js dirGate -> paceGap and lullScr. hookOn tick and kill from pacing.js.
- Risk: balance in the Race and Endless shifts within a cycle (peaks are 30% denser than before); 20-wave runs are about 1 minute longer from the rest; the bot sims are in NOTES.md.
