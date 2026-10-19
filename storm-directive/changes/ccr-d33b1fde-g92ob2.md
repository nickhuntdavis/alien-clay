# ccr-d33b1fde-g92ob2

## 2026-10-19 Branch combos for the 24 weapons (v10.35)
- Systems: combos, weapons, draft, autorun, fight
- Files: combos10.js (new), fight.js, index.html, tests/combo10test.js (new), tests/run.sh, tests/sim/race.js
- What: 30 new Weapon Combos across ten weapon pairs (three each). A combo needs both weapons at Lv 5 and a particular Lv 3 promise on each; each pair's three combos use every promise once, so whatever the first weapon took, one promise on the second fuses with it. Same attack types can fuse. The weapon draft now swaps one card for a combo partner of a weapon you hold (any attack type, so the old Storm in a Teacup and Worm Farm can happen at last); Lv 3 promise cards name the combo they complete; autorun takes a card that completes a combo. Combo hits go through normal hit resolution and never set off an unstable reaction.
- Save data: none (META.combos records fused ids as before).
- Hooks: fight.js fightHit -> `src.noRx` skips fightReact. Everything else wraps globals from combos10.js (fightHit, killEnemy, projHit, comboFire, comboTick, wupDmgMul, bubblePop, toothTaken, availableCombos, wupForkCards, v10Loot, UI.autoTick); it loads after ui.js.
- Risk: balance (more combos fuse, and the weapon draft and autorun now favour partners); any file that later wraps the same globals must load before combos10.js or keep calling through.
