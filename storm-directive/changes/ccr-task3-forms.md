## 2026-10-25 Mines forms for Flight and Crowd modifiers (task 3, batch 1)
- Systems: modifier cards, Delivery modifiers, laser beam, tests
- Files: delivforms.js (new), modwide.js, laserbeam.js, index.html, ARCHITECTURE.md, tests/delivtest.js (new), tests/run.sh
- What: on any weapon that lays mines (the Laser's too), Homing makes armed mines creep at enemies, Bounce flings a new mine off the nearest enemy to rest in the crowd, Returning rolls an untouched mine back to you, Link strings tripwires between mines (crossing one sets off both ends and the wire hits the crosser for 60%), Pull makes a tripped mine implode for 0.3 s first, and Knockback shoves outward from the mine instead of from you. Card text for these on a Mines weapon is TODO_COPY:xd_mines_<modifier>. Audit: Standard Issue + Mines NO-OP 4 -> 2 (Homing, Bounce cleared), Laser + Mines 1 -> 0.
- Save data: none
- Hooks: none in shared files (wraps mwLay, mwMineGo, mwTick, modCard, modDraw, lzMineLay, lzExtrasTick; modwide.js mwDmgMul reads src.mwAt; laserbeam.js gains lzMineFire)
- Risk: MOD_DEAD (moddead.js) still hides Homing and Bounce on Mines weapons until it is regenerated from an audit that includes this batch. Knockback on mine blasts now pushes enemies away from the mine, which can push them towards you.

## 2026-10-25 Per-Delivery forms for Flight and Crowd modifiers (design only)
- Systems: docs
- Files: redesign docs/MODIFIER_MATRIX.md
- What: new section 5.11, the user-approved table of how Homing, Bounce, Returning, Link, Pull and Knockback work on Mines, Melee, Strike from Above, Orbiting and Ranged (MODAUDIT_HANDOFF.md task 3). User decisions: rule 17 stays (no Extra Projectiles row); Pull on Ranged and Grappling Hook both stay. No code.
- Save data: none
- Hooks: none
- Risk: none
