## 2026-10-23 Homing kicks in after a moment (v10.107)
- Systems: weapons (modifiers)
- Files: piercefx.js (modStep wrapped), tests/piercetest.js
- What: the Homing modifier steers a shot only from 0.2 s after it is fired, so a spread fans out first and then each shot turns towards the nearest enemy. Weapons that home by design are unchanged.
- Save data: none.
- Hooks: none in shared files.
- Risk: Homing shots miss a little more at point-blank range.

## 2026-10-23 Strike from Above is an extra (v10.106)
- Systems: weapons (modifiers, Laser)
- Files: modwide.js (MW_DFA_RATE, mwDfaRoll; mwFire falls through), laserbeam.js (orbital strikes on a timer while the beam fires), atkswap.js (no longer an attack type), slicecopy.js (lines), tests/widetest.js, laserbeamtest.js, lootfiltertest.js
- What: Strike from Above no longer replaces the weapon's attack. The weapon fires as normal and now and then a strike from above lands too: about 0.15 strikes a second at Rank 1, then 0.25, 0.35 and 0.5 at mastery (a chance per attack from the weapon's cooldown; on the Laser, an orbital strike on a timer). It no longer swaps with Melee, Ranged or Mines (still the Delivery group).
- Save data: none.
- Hooks: none in shared files.
- Risk: Strike from Above builds gain the base attack back (stronger overall); strike rates unsimmed.
