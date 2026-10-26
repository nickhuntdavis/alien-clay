# ccr-1ac49716-yz41yr (after main's v10.154 fold)

## 2026-10-26 The material skin Feat (v10.156)
- Systems: Feats (v10), tests
- Files: matskin.js (new), index.html, tests/matskintest.js (new), tests/featstest.js (starting pool 21, an entry for it), FEATS.md (F18), ARCHITECTURE.md
- What: a new Feat in the starting pool: 4 s of 60% less damage, rolling on momentum instead of swimming, bowling enemies over by speed; level 4 drags enemies into your path; forks Chitin / Calcified and Enamel / Latex. Name and card text TODO_COPY (MS_TEXT).
- Save data: none.
- Hooks: none in shared files (hookOn tick 'msTick2' and hurtMul 'msHurtMul'; wraps nfSpeed and f10Draw).
- Risk: the Feat starting pool grows to 21; autorun steering while rolling is sluggish by design.

## 2026-10-26 The Runs rolls a damage type per card (v10.155)
- Systems: sperm passives (The Runs), draft, tests
- Files: runstype.js (new), spassives.js (spRunsSlot reads G.spRunsType), index.html, tests/runstypetest.js (new), SPERM_PASSIVES.md, ARCHITECTURE.md
- What: each new The Runs card rolls one of the seven damage types (weighted towards your weapons' types and the sample's primary); picking it fixes the trail's type for the run and upgrade cards keep it. Extras: Force shoves enemies aside, Static arcs between trail pieces, Blood heals you while enemies stand in it, Parasite drags enemies along the trail away from you. Card text TODO_COPY:sp_runs_<type>_desc.
- Save data: none (run state G.spRunsType).
- Hooks: none in shared files (hookOn tick 'runsTick'; wraps cardOpt).
- Tests: runstypetest, spslicetest, mutstest, drafttest pass; spfulltest fails the same way on main (sp_aim list, Chain Letter).
- Risk: The Runs no longer follows the sample's type; balance of the four extras untested.
