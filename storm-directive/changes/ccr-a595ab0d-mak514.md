# ccr-a595ab0d-mak514: one damage type per sample

## 28 Oct Rescues in every mode, weighted odds, type-pool rescue drafts, rescue-and-finish unlocks
- Systems: kindred, samples (unlocks), waves, levels, tests
- Files: kinall.js (new), kindred.js (kinTick reads kinOn()), samplestart.js (achievement unlocks removed, s10LockTxt), index.html, ARCHITECTURE.md, tests (kinalltest.js new; kindredtest, samplestarttest, samplestest updated; run.sh list)
- What: stranded samples now also appear in the Petri Dish and Endless after each boss wave (5, 10, 15; Endless every 5th) and in Level 1 after each arena clear (placed on a reachable floor cell). Which one is weighted: alpha 4, beta 4, ordered 3, redtail 3, acro 2, prawn 1, alien 0.5 (never baseline or Private Schooled), from samples not yet unlocked and not carried. The rescue draft is two weapons from the rescued sample's type pool plus one wildcard, with a type swatch and note on the screen; absorbing adds that type to the run's drafts (tpAdd). Only Baseline is open on a fresh save: a sample unlocks when it was rescued in a run that was finished (Race: the egg; Dish: wave 20 beaten; Endless: wave 20 reached; Level 1: cleared). Achievements no longer unlock samples. In the Dish and Endless the next wave waits up to 30 s for a waiting spirit. Placeholders: `TODO_COPY:kin_lock_txt`, `kin_unlocked`, `kin_type_note`, `kin_type_note_any`.
- Save data: META.s10 (unlocks, same key, now set on a finished run); META.achEver still recorded.
- Hooks: none in game.js, render.js, ui.js or bosses.js. Wraps waveClear, kinChoose, kinCards, kinAbsorb, victory, lvWin, waveBegin; hookOn tick.
- Risk: the Dish's 30 s wave hold changes pacing slightly at waves 5, 10 and 15; acro's old unlock line and the Shell-strip unlock are inert; wup2test is flaky on main (Terminal Clause scene), unrelated.

## 28 Oct Alpha may take Can't Sit Still again
- Systems: mutations
- Files: mutations.js
- What: the "Alpha already has this" gate on the Can't Sit Still trade-off is gone, since Alpha's passive is no longer a fire-rate bonus.
- Save data: none.
- Hooks: none.
- Risk: none.

## 28 Oct Weapon pools by type, one type per sample, Private Schooled on hold
- Systems: samples, weapons24, kindred (kinPool), tests
- Files: typepools.js (new), index.html, ARCHITECTURE.md, tests (typepoolstest.js new; samplestest, weapons24test, v9armstest, kindredtest, v10test updated)
- What: every sample is a specialist of one damage type (baseline Force, alpha Static, beta Blood, ordered Mucus, redtail Fire, prawn Parasite, acro Acid, alien all). Each type's pool is its live weapons (Force 6, Static 3, Mucus 3, Blood 3, Acid 3, Parasite 4, Fire 8). The opening draft is the sample's signature weapon plus two random others from its pool. Every later draft offers only the run's types (`G.tp.types`: the sample's, plus any a rescue adds with `tpAdd`). Private Schooled is off the rack (`S10_BY.private` stays; its weapons stay in their pools).
- Save data: none.
- Hooks: none in shared files. Wraps samplekit.js s10Start and kindred.js kinPool (sample runs now gate drafts by type, so kinAbsorb no longer adds weapons by itself: the rescue task calls tpAdd).
- Risk: rack count 19 (strain 004 is a gap); four pools have exactly three weapons, so their opening draft is fixed; Dish, Endless and Level 1 runs need rescues (next entry) to get a second type.

## 28 Oct Specialist passives for Alpha, Beta, Redtail and Prawn Again
- Systems: samples, chemistry (Charge, Bleed, Burning), tests
- Files: specpass.js (new), index.html, ARCHITECTURE.md, redesign docs/SAMPLES.md, tests (specpasstest.js new; samplestest, kindredtest updated)
- What: Alpha: while moving, Static hits keep Charge 4.5 s (was 3) with 1.5x arcs and other hits Charge for 1 s (the +50% fire rate is gone). Beta: below 40% health, Bleed damage heals it (25%, up to 50% at 10% health; the damage bonus and plain lifesteal are gone). Redtail: body contact Ignites (1 s per-enemy cooldown; Static no longer adds burn). Prawn Again: Possessed enemies hit their old friends twice as hard (its Bleed line is gone). Three pdescs are `TODO_COPY:pas_alpha_desc`, `pas_beta_desc`, `pas_redtail_desc`.
- Save data: none.
- Hooks: none in shared files. Wraps s10Tick, s10DmgMul, s10Hit, fightStatus; hookOn hit:late and tick.
- Risk: not sim-tuned (Alpha is likely weaker on non-Static builds; Redtail's dose is a guess). The masks depend on the shape of the old branches in samples10.js.
