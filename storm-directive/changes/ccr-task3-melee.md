## 2026-10-25 Melee forms for Flight and Crowd modifiers (handoff task 3, batch 2)
- Systems: modifier cards (Delivery forms), weapons (Melee, Laser sword), tests
- Files: delivforms.js, moddead.js (regenerated), ARCHITECTURE.md, tests/delivtest.js
- What: on the Melee Delivery and the Laser's sword, Homing throws homing slashes (40%) at enemies just out of reach, Bounce rebounds the last hit to 1 to 3 more enemies within 100 (60%), Returning sweeps back 0.2 s later (60 / 75 / 90%), Link shares 25% of damage between enemies hit by one swing (3 to 5 s), Pull draws enemies within 120 to 180 a step in before the swing, Knockback (Bouncer) makes shoved enemies hurt what they hit (40%). Card text `TODO_COPY:xd_melee_<mod>` (6 placeholders). MOD_DEAD regenerated from a fresh full audit.
- Save data: none
- Hooks: none in shared files; hookOn('proc', 'xdProc') in delivforms.js. Wraps mwMelee (modwide.js) and lzSwordSwing (laserbeam.js).
- Audit: Standard Issue NO-OP 21 -> 19, Laser 13 -> 11; full audit 648 -> 631 of 2810.
- Risk: Melee weapons get more damage (the follow-up hits); Link shares any weapon's hits on a linked enemy. Wall Slam keeps its own collision when held (Bouncer skips an enemy Wall Slam already counted).
