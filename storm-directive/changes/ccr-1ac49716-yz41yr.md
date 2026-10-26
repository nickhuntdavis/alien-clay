# ccr-1ac49716-yz41yr (after main's v10.154 fold)

## 2026-10-26 Open copy written (v10.160)
- Systems: ui (card copy): Feats, sperm passives, weapons (fusion), Little Jacob
- Files: matskin.js (MS_TEXT), runstype.js (RUNS_TEXT), wfusion.js (WF_TEXT pairs 9 to 16, WF_SB.text), ljacob.js (LJ_TEXT), tests/runstypetest.js
- What: at the user's request ("write the open copy yourself"), Claude wrote the 33 open strings: the material skin Feat (Petrified; forks Chitin, Kidney Stone, Enamel, Latex), The Runs' seven per-type card lines, fusions 9 to 16 (Chain of Custody, Family Reunion, Red Alert, Night Terrors, Gym Flu, Fight or Flight, Mixed Signals), the Spoon pairing float and Little Jacob's squeal. No TODO_COPY left in this branch's feature files.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## 2026-10-26 There Is No Spoon + Blowing Bubbles as a passive pairing (v10.159)
- Systems: weapons (fusion), sperm passives (There Is No Spoon), tests
- Files: wfusion.js (pair 13 at the end), tests/wfusiontest.js
- What: holding the There Is No Spoon passive with Blowing Bubbles at HUD Lv 3 pairs them (no merge, no mount): every bullet Spoon fires back traps what it hits in a bubble (1.5 s Snare; bosses only slowed). A float says when it switches on (TODO_COPY:wf_spoonbub_on).
- Save data: none.
- Hooks: none in shared files (hookOn proc 'wfSpoonProc' and tick 'wfSpoonTick'; another modDraw wrap).
- Risk: none beyond balance.

## 2026-10-26 Fusion pairs 9 to 16 (v10.158)
- Systems: weapons (fusion), tests
- Files: wfusion.js, tests/wfusiontest.js (7 new checks; the lardmine check pauses both weapons, it was flaky)
- What: seven more fusions: Ewww, Gross + Unwanted Contact (zaps arc through a taped bundle), Chest Burster + Sister Cousin (risen allies spit siblings), Laser + Red Flagship (the Laser's target arcs Static to 2 neighbours), Rent Free + Panic Button (possessed enemies pulse), Maximum Gains + Enzyme Sneeze (close hits splash acid), Nervous Wreck + Panic Button (snaps end in a pulse), Red Flagship + Soulmate Signal (twins fire Red Flagship beams). Pair 13 (There Is No Spoon + Blowing Bubbles) is parked: Spoon is a sperm passive now, never a weapon. Names and card text TODO_COPY.
- Save data: none.
- Hooks: none.
- Risk: weapons in two pairs (Panic Button, Red Flagship, Unwanted Contact, Sister Cousin, Blowing Bubbles) fuse with whichever partner reaches Lv 3 first.

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
