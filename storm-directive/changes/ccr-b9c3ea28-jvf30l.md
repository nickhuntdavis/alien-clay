## 2026-10-27 Intensity meter replaces the clock cycle (v10.183)
- Systems: pacing
- Files: pacing.js
- What: Free modes now run on an invisible intensity meter (Left 4 Dead style) instead of a fixed 75 s loop: it fills from enemies dying within 260 units of you (0.012 each, elites 0.04), from hits you take (0.6 x the share of max HP lost) and slowly with time (0.01/s); the spawn rate is 1x to 1.3x as it fills, then a 4 s peak, then a 0.6x relax while it drains at 0.06/s until it is under 0.3 (or 40 s). A boss death jumps straight to the breather. `PACING.mode = 'clock'` restores the v10.182 loop. Telemetry: `G.stats.peaks`.
- Save data: none.
- Hooks: hookOn hurt from pacing.js (the kill and tick hooks already existed).
- Risk: a busy build (many kills near you) peaks about every 40 s, a kiting one about every 85 s; the Race sim is in NOTES.md.

## 2026-10-27 Pacing: intensity cycle, wave shape, screens in lulls (v10.182)
- Systems: pacing (new), engine (spawn rate), wave-mode, reward director
- Files: pacing.js (new), game.js, waves.js, campaign.js, director.js, index.html, ARCHITECTURE.md
- What: Free modes (Race, Endless, race to the egg) swell and lull on a 75 s cycle (0.6x for 12 s, then a ramp from 0.85x to 1.3x; the average is 1.0) with a 10 s lull after every boss death. Wave feeds are a burst, a steady middle and a final surge instead of flat; the rest after a wave clear is 5 s (was 1.6 s). The Reward Director opens screens at half its gap in a lull and 15 s later at a peak (unless three or more rewards wait). `PACING.on = false` restores the old flat behaviour. Telemetry: `G.stats.lullT`, `lullScr`.
- Save data: none.
- Hooks: game.js update spawn rate -> paceK; waves.js waveSpawn and campaign.js campSpawn feed -> paceShape; waves.js waveClear -> PACING.rest; director.js dirGate -> paceGap and lullScr. hookOn tick and kill from pacing.js.
- Risk: balance in the Race and Endless shifts within a cycle (peaks are 30% denser than before); 20-wave runs are about 1 minute longer from the rest; the bot sims are in NOTES.md.
