## 2026-10-28 Delivery modifiers out; four Delivery weapons in (v10.193)
- Systems: weapons, modifier cards, laser, weapon cells, tests
- Files: dlvweap.js (new), dlvrun.js (new), laserbeam.js, matrixonly.js, wstars.js (regenerated), index.html, tests/dlvtest.js (new), tests/weapons24test.js, tests/v10test.js, tests/run.sh
- What: Melee, Ranged, Mines and Death from Above are no longer dealt as modifier cards. Four of their custom forms are now weapons in the draft: Laser Sword, Laser Mines, Orbital Laser (strikes only) and Nappy Mines artillery. Each one's attack ranks with the weapon's level (Lv 1/3/6/9) instead of by cards, with the usual fork at Rank 2 and the mastery on the Laser three. Names and descriptions are TODO_COPY.
- Save data: none.
- Hooks: none in shared files. laserbeam.js lzIs also matches def.lzKin. dlvrun.js wraps makeSlot, modOk, mmHeld, wupFire, wupStats; hookOn('tick', 'dlvrun:sync'); adds statup.js ST_W rows.
- Risk: the generic Melee/Ranged/Mines/Death from Above code stays (it drives the new weapons; tests still reach it), so slots that hold one in the Sandbox keep it. Balance of the four is set from measured bars only (Orbital x1.5, artillery x0.6 damage), not from run sims.
