# ccr-1ac49716-yz41yr (after main's v10.154 fold)

## 2026-10-26 Little Jacob (v10.157)
- Systems: weapons (Sister Cousin), modifier masteries, tests
- Files: ljacob.js (new), index.html, tests/ljacobtest.js (new), MODIFIER_MATRIX.md (5.4b), ARCHITECTURE.md
- What: Sister Cousin with both the Charged and Exploding Rounds masteries sends out Little Jacob every 8 s: a fat sibling that waddles to the crowd and explodes (Blood, radius 140, 8x Sister Cousin's damage, bosses half). Your other weapons' shots that touch him feed the blast (x1.25, capped at 4x base); shots near him bend in. Squeal text TODO_COPY:lj_squeal.
- Save data: none.
- Hooks: none in shared files (hookOn tick 'ljTick'; wraps f10Draw).
- Risk: needs two weapon masteries (Extra Mastery), so it is rare; the blast is big by design and untested for balance.

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
