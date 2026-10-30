# claude/sharp-hypatia-icfi8l

## 2026-10-30 Private Schooled reimagined: old money branches, gated cards, costumes (Private Schooled only)
- Systems: weapon branches (sample branch sets), Feats, sperm passives, card rules, baseline costumes (Private kinds), tests
- Files: private1.js, private2.js, privatelook.js, privatecopy.js (new), cardrules.js (g12 to g15), index.html, PRIVATE_REDESIGN.md, PRIVATE_COPY_IDS.md, tests/private1test.js, private2test.js, privatelooktest.js, privategatetest.js (new), featstest.js
- What: while a run is played as Private Schooled, Acid Spit (Silver Spoon / Trust Fund / Hostile Takeover), Rent Free (Old Boys' Network / The Help / Legacy Admission; Rent Free Possesses under these branches) and Ewww, Gross (NDA / Hush Money / Daddy's Lawyers) take its own old-money branches; four cards dealt only on their branch (Daddy's Credit Card, Expelled, Signet Ring, Diplomatic Immunity); nine costumes. Other samples keep the shared sets.
- Save data: none.
- Hooks: none in shared files. private1.js wraps fightPayoff and allyAI; private2.js wraps eBullet; privatelook.js wraps blDrawLook, blPick, BL_WEAP entries and PV_OWN flags; hookOn hurt:before / dmgMul / kill / tick / fire:after.
- Risk: Private balance (possession chains from Old Boys' Network raise copies of the dead; NDA silences bundles of 3 or more).
