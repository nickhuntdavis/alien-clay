# ccr-a595ab0d-mak514: one damage type per sample

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
