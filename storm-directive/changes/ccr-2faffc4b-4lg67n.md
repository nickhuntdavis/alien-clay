## 2026-10-28 Lifesteal back in the v10 draft (v10.193)
- Systems: modifier cards, draft cards, healing
- Files: lifemods.js (new), index.html, ARCHITECTURE.md, tests/lifemodstest.js (new), tests/modstest.js
- What: two new weapon modifiers in their own Lifesteal group: Bloodsucker (hits heal 2/3/4% of damage dealt, mastery 6%, within the lifesteal pool) and Umbilical Cord (one rank, Epic, half weight: 5%, may draw four times the pool). Leech and Slurp were blocked for real players by the slice filter (spslice.js) and are now on its card list. In slice drafts about 1 level-up in 3 offers a lifesteal card.
- Save data: none
- Hooks: none in shared files (hookOn proc 'lsmProc'; wraps modmatrix.js modCard and modDraftCands; adds wmods.js WMV_SCENE loops; pushes to MODS10, MODUP, MM_GROUP, MM_GNAME, MATRIX_ONLY.mods, SLICE.mods, SLICE.muts).
- Risk: more healing in real runs: wave20 8 mortal (slice on) went from 2 to 4 bot wins. Copy open: TODO_COPY:mod_bloodsucker_r2, mod_bloodsucker_r3, mm_group_lifesteal, mastery_bloodsucker.
