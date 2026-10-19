# claude/v9-v10-breaking-changes-1hjfdw

## 2026-10-19 Petri Dish, Endless and Level 1 back; Level 0 lesson 11 teaches mutation strands (v10.35)
- Systems: samples screen, school (Level 0), mutation drops
- Files: samples10.js, school.js
- What: the Experiment picker offers The Petri Dish, The Race, Endless and Level 1 again (flags S10_PETRI, S10_ENDLESS, S10_LEVELS). Level 0 lesson 11 is no longer a free pass under V10: an Antibody carries a mutation strand (mutdrop.js) that never sheds or decays in school; kill it, swim into the strand and pick a mutation to open the gate.
- Save data: none.
- Hooks: none (school.js reads mutdrop.js mdS, mdOk, MUTDROP and G.stats.mutDrops).
- Risk: Endless and Level 1 have not been played or simmed under v10 (untested by request); expect balance gaps or a crash in Level 1 arenas. schooltest not rerun.
