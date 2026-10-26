## 2026-10-26 Stat cards roll a rarity (v10.163)
- Systems: draft, stats
- Files: wmods.js, tests/statrartest.js (new)
- What: level-up and DNA strand stat cards (Crit Chance, Max Health and the rest) each roll a rarity like other loot (skipped-box floors count), and rarer ones give more: Common 1.5 steps, Uncommon 2 (the old fixed card), Rare 3, Epic 4, Legendary 6 (WM.statSteps). The average deal stays about 2 steps.
- Save data: none
- Hooks: none
- Risk: stat power per run is about the same on average but swingier; a Legendary Bullet Damage card is +18%.

## 2026-10-26 Rank pips on loot cards (v10.162)
- Systems: reward cards, draft
- Files: rankpips.js (new), index.html, tests/rankpipstest.js (new)
- What: a loot card that ranks up something you already hold (defence, modifier, Feat, mutation, health/vitals/perk and v9 upgrade cards) shows "Lv N" (the rank after taking it) and a row of pips under its title: held ranks filled, the new one ringed and pulsing, ranks still to come hollow. New cards show none. The Runs' upgrade card also shows its next rank's numbers (Area, Lasts, Damage before → after) in the Feat card's "Next level" line.
- Save data: none
- Hooks: none in shared files (wraps ui.js UI.renderLootCards, after dsheads.js, and rewardui.js rwDelta).
- Risk: a card family that reports its rank some new way gets no pips (falls back to parsing "Rank r > r+1 of m" in the sub line).
