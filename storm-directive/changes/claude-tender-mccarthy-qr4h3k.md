## 2026-10-24 There Is No Spoon becomes a passive; matrix N/A cells enforced (v10.123)
- Systems: sperm passives, modifier matrix, matrix only, tests
- Files: spoon.js (new), matrixna.js (new), matrixonly.js, index.html, tests/spoontest.js (new), tests/statuptest.js, tests/run.sh
- What: There Is No Spoon is no longer a weapon; it is a sperm passive (3 ranks and a mastery) that eats enemy bullets near you and fires them back, wider, bigger store and harder hitting per rank. Thirteen modifiers the matrix marks N/A on ten weapons are no longer dealt there (Family Ties: Pulling, Piercing; Ewww, Gross: Connecting, Sticky; Panic Button, Skill Issue, Nervous Wreck: Knockback; Sister Cousin: Homing; Chest Burster: Turncoat; Unwanted Contact: Primer; Enzyme Headbutt: Every Nth; Laser: Range).
- Save data: none (run state G.spSpoon; passive rank in G.muts.sp_spoon).
- Hooks: none (spoon.js wraps v10Tick and pushes to SP_KEEP; matrixna.js wraps modOk).
- Risk: There Is No Spoon's combos and branch cards are unreachable now; the passive's balance is not simmed. statuptest now runs 7 trials a side (its result depended on weapon order).
