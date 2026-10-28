## 2026-10-28 Secret reroll on the Weapon Draft (v10.193)
- Systems: secret reroll (new), ui (Weapon Draft)
- Files: secretroll.js (new), style.css, index.html, tests/secretrolltest.js (new), tests/run.sh, ARCHITECTURE.md
- What: an invisible 56 px tap zone in the top-right corner of the Weapon Draft deals the draft again (UI.openDraft on the same request), as often as you like and free; the box count is left as it was. The start draft (always the sample's three) and a Daily's fixed weapons only reshuffle.
- Save data: none (G.stats.secretRolls counts rerolls within a run).
- Hooks: none (adds #dSecretRoll to #draft).
- Risk: an accidental tap in that corner rerolls the draft; balance is off for anyone who knows (endless free rerolls).
