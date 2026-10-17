## 2026-10-17 Wave mode and regular mode (v10.02)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: the samples screen offers Human Sample 1 in Wave Mode (s002) or Regular Mode (s001, race to the egg). In regular mode Switched at Birth comes once a minute instead of once a wave.
- Save data: none.
- Hooks: none.
- Risk: regular mode not balanced for the new weapons.

## 2026-10-17 One Switched at Birth card a wave (v10.01)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: Switched at Birth now offers one card, and only once a wave (the first level-up box after the wave; the wave's other level-up boxes are dropped). Reroll still swaps the card.
- Save data: none (run state `G.v10sw`).
- Hooks: none.
- Risk: far fewer upgrades a run; levels past the first in a wave give nothing.

## 2026-10-17 v10 test build: Human Sample 1, 42-weapon matrix, Switched at Birth only (v10.00)
- Systems: v10 (new), weapons, loot, chemistry, ui, meta
- Files: v10.js (new), game.js, chem.js, sigs.js, ui.js, render.js, meta.js, index.html, tests/v10test.js (new)
- What: the game is now a stripped test build. One sample card (Human Sample 1, wave mode, no trait or ability). Weapons are the 42-cell matrix from the user's spec (Contact, Projectile, Beam, Spread, Burst, Pool x Force, Acid, Static, Mucus, Blood, Soul, Fire); start draft 4 of 42, Lv 8/22 drafts 3 more (no shared attack type). Level-ups offer only Switched at Birth (same attack type, new damage type); all other boxes are dropped, so no Feats, mutations, gene transfer, relics, combos or curses. Fire (`flame`) is new: Burning, 3 s damage over time. Old automatic reactions, overloads, triples and terrain reactions are off. Old content is gated, not deleted (`window.V10_OFF = 1` restores it).
- Save data: META now lives in `sd_meta10` (full wipe); `sd_best`, `sd_runs`, `sd_live` cleared on first v10 boot. `sd_meta` left untouched.
- Hooks: game.js genLoot -> v10Loot, main loop -> v10Box, fireWeapon -> v10Fire, update -> v10Tick, newGame skips junkStart, newStats elem.flame; render.js -> v10Draw; chem.js applyElement -> v10Burn and `if (V10)` reaction guards; sigs.js applyAdapt v10 contact reach; ui.js openSamples -> v10Samples, playBtn skips Level 0, quickStart uses human1/s002; meta.js META_KEY.
- Risk: most of the old test suite assumes old content and will fail with V10 on; `quick` and `v10test` pass. Balance untested (beams and Blood Pool run hottest). Feat slots show empty.

## 2026-10-17 v10 combat rework: plan and decisions
- Systems: none yet (docs only)
- Files: NOTES.md (v10 section); merged `redesign docs/` from claude/charming-brown-51v3ev
- What: agreed approach (keep engine, rebuild combat core, restart content) and the step-2 decisions: literal Fire, Soul = mind control, 5 defences no traits, full save wipe.
- Save data: none yet (v10 will move to a new META key).
- Hooks: none.
- Risk: none.
