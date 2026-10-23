## 2026-10-23 The Race's upgrade schedule
- Systems: rewards (Reward Director), race, draft
- Files: raceplan.js (new), index.html, tests/raceplantest.js (new)
- What: in the Race, reward screens open only at 20 set times (0:30, then about every 40 to 45 s, last 14:25) plus Sample Milestone screens at 5:00 and 10:00 (a Rare-floor level draft, a placeholder for the sample reward sequence). Level-ups between slots fold into the next level screen and raise its rarity floor. Transformations are dealt less before 5:00 and more from 5:00 to 10:00; masteries less before 10:00, more after. Forks, branch screens, boss rewards and the second weapon still open at once; after the egg wakes, waiting rewards apply themselves as before.
- Save data: none.
- Hooks: none in shared files. Wraps director.js dirGate, dirTitle; modmatrix.js modDraftCands; v10.js v10Tick.
- Risk: fewer screens means slower builds in the Race (difficulty unsimmed); chests wait for slots.

## 2026-10-23 Samples: achievement unlocks, random starting offer, bigger passives
- Systems: samples, achievements, weapons (start)
- Files: samplestart.js (new), samples10.js (locked card line; passive numbers), acrosample.js and acrocopy.js (Early Bird at 50%), index.html, tests/samplestarttest.js (new)
- What: Baseline is open; every other sample unlocks when you first earn its achievement (Alpha: Still Here?, Beta: Flesh Wound, Private Schooled: Middle Management Removed, Ordered Online: Statistically Significant, Redtail: Contractually Obligated, Prawn Again: Lab Rat, Not of This World: Congratulations It's You, Early Bird: Flawless Specimen). Achievements are remembered between runs; rescues no longer unlock samples. The start offers three random matrix weapons: one of the sample's damage type, one Switched at Birth into it (starts switched), one any. Passives exaggerated: Baseline +15% stats, Alpha +50% fire rate while moving, Beta below 40% up to +200% damage and double lifesteal, Private Schooled twice the Corrosion and ally damage, Ordered Online 30% Evasion and a wider, longer trail, Redtail double burn, Prawn Again 2.5x Bleed, Not of This World shifts every 12 s with a 3 s +30% surge, Early Bird pays off at 50%.
- Save data: META.achEver added; META.s10 now filled by achievements (S10_ALL off).
- Hooks: none in shared files. Wraps samples10.js s10Start, s10Unlock; show.js achieve.
- Risk: testers lose samples they had through S10_ALL until they earn the achievements. Stronger passives unsimmed.

## 2026-10-23 Homing kicks in after a moment (v10.107)
- Systems: weapons (modifiers)
- Files: piercefx.js (modStep wrapped), tests/piercetest.js, tests/modstest.js (Homing curve checked after 0.5 s)
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
