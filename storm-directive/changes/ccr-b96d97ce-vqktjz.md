## 2026-10-26 Rank pips on loot cards (v10.162)
- Systems: reward cards, draft
- Files: rankpips.js (new), index.html, tests/rankpipstest.js (new)
- What: a loot card that ranks up something you already hold (defence, modifier, Feat, mutation, health/vitals/perk and v9 upgrade cards) shows "Lv N" (the rank after taking it) and a row of pips under its title: held ranks filled, the new one ringed and pulsing, ranks still to come hollow. New cards show none. The Runs' upgrade card also shows its next rank's numbers (Area, Lasts, Damage before → after) in the Feat card's "Next level" line.
- Save data: none
- Hooks: none in shared files (wraps ui.js UI.renderLootCards, after dsheads.js, and rewardui.js rwDelta).
- Risk: a card family that reports its rank some new way gets no pips (falls back to parsing "Rank r > r+1 of m" in the sub line).
