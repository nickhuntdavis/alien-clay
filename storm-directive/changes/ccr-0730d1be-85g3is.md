## 2026-10-26 Nine stale or broken tests fixed; Range and Up Close cards offered again
- Systems: weapon modifiers (dead-card table), stat points, tests
- Files: moddead.js, statup.js; tests modstest.js, celltest.js, laserbeamtest.js, lasershot.js, slicetest.js, spslicetest.js, sptest.js, statuptest.js, tools/moddead.js
- What: the dead-card table (MOD_DEAD) had Range and Up Close back on about 50 weapon cells after a rebuild (b8daec1 had taken them off on purpose; v_phys_contact was refused Range though it widens reach 110 to 154); they are removed and the generator now skips both. Returning gets its stat ('range', what its cards already got by default). Tests updated to the intended game: MOD_DEAD filtering, the Laser's charge-up and held beam and its own forks, the two-best-weapons start draft; statuptest resets ids, kill counts, sightings and the damage-number average between weapons so results no longer depend on order; random crits off where a lucky one flipped a check.
- Save data: none.
- Hooks: none.
- Risk: Range and Up Close cards show up again on many weapons (more card variety, slightly different offers). statuptest still fails on Enzyme Sneeze (dps ratio about 1.3 to 1.5, a balance call left open).
