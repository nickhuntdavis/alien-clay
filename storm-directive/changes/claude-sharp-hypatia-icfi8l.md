# claude/sharp-hypatia-icfi8l

## 2026-10-30 Beta reimagined: near-death branches, gated cards, costumes (Beta only)
- Systems: weapon branches (sample branch sets), Feats, sperm passives, card rules, baseline costumes (Beta kinds), tests
- Files: beta1.js, beta2.js, betalook.js, betacopy.js (new), cardrules.js (g8 to g11), index.html, BETA_REDESIGN.md, BETA_COPY_IDS.md, tests/beta1test.js, beta2test.js, betalooktest.js, betagatetest.js (new), featstest.js
- What: while a run is played as Beta, Little Prick (IV Drip / Adrenaline Shot / Blood Draw), One of These Days (Flatline / DNR / Triage) and Sister Cousin (Next of Kin / Organ Donor / Transfusion) take Beta's own A&E branches, each paying off at low health; four cards dealt only on their branch (Defibrillator, Morphine Drip, Famous Last Words, Blood Bag); nine costumes. Other samples keep the shared sets.
- Save data: none.
- Hooks: none in shared files. beta1.js wraps rateBonus, mutSpeed, healPlayer, duePop; beta2.js wraps modHit, mutSpeed; betalook.js wraps blDrawLook, blPick, BL_WEAP entries and PV_OWN flags; hookOn hurt:before / hurt:late / fire:after.
- Risk: Beta balance (low-health payoffs stack with Not Dead Yet: Shared Circulation doubles seeker lifesteal while low).

## 2026-10-30 Planner: sample branches
- Systems: tests/tools (planner)
- Files: tests/tools/planner/planner.js, tests/tools/planner/template.html
- What: the planner reads samplebranch.js's SMB_REG: a sample with its own branches (Baseline: Rambo, Dirty Harry, Robocop) shows them on the sperm (run Lv 15 branch, Lv 20 card or wildcard, Lv 25 mastery), picked in the sperm's detail panel or taken from the Full tree; kept per sample. The Builds menu's "Sample branches" group replaces the Standard Issue hero builds.
- Save data: none in the game.
- Hooks: none.
- Risk: none.
