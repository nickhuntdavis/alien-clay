## 2026-10-26 All open copy written; stat cards show before → after (v10.155)
- Systems: ui, feats, weapons, defence, stats
- Files: perks.js, vitals.js, mobfeats.js, passivefeat.js, wfusion.js, wmods.js, rtooth.js, statup.js, v9back.js, tests/statuptest.js
- What: every TODO_COPY that reached the screen now has Claude-drafted text (user asked: "write copy for all missing copy"): the 14 perk and 9 vitals cards (PK_TEXT, VT_TEXT), Brave Phase and Puddle Jumper with their forks, the Passive Feat slot and its two aura Feats, the 8 weapon fusions and the fusion screen, the weapon modifier screen heading and stat cards, Reverse Tooth Fairy's TEETHING float. Stat cards show your current value and the value after taking them (statup.js stNow/stDelta: "Crit Chance 5% → 8%"), as does the stat line under modifier cards; v9 ranked upgrades from rank 2 show each changing number as before → after (v9back.js v9Delta: "take 10% → 20% less damage").
- Save data: none.
- Hooks: none.
- Risk: copy is a first draft for the user's read-through. stLine's format changed (holdcopy.js "Also:" line uses it). statuptest's Enzyme Sneeze dps ratio fails on main too (not from this change).
