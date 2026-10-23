## 2026-10-23 Glowing level-up boxes; arenas even bigger
- Systems: pickups (draw), race, waves, terrain, big hazards
- Files: render.js (a level-up box draws as a bigger, glowing gold DNA strand), data.js (CORE.arena 5400), waves.js (DISH.arena 2600), terrain.js (terrain count scale capped at 2.5x), bighaz.js (Petri Dish sizing reads DISH.arena), tests/levelboxtest.js
- What: level-up boxes are a large gold DNA strand with a pulsing glow, so they stand out from Donor DNA strands and power-ups. The Race arena is 5400 (was 3600) and the Petri Dish 2600 (was 1750); terrain grows with the area but at most 2.5x the old count, so the biggest arena is sparser.
- Save data: none.
- Hooks: render.js pickups loop (lvbox draws with the chest strand).
- Risk: longer swims; sparser terrain in the Race.

## 2026-10-23 Level-up boxes to pick up; bigger arenas; rescues inside the dish (v10.111)
- Systems: rewards (level-ups), pickups, kindred (rescues), terrain, waves, race
- Files: levelbox.js (new), kindred.js (kinIn, KIN.rim), data.js (CORE.arena 3600), waves.js (DISH.arena 1750), terrain.js (terrain counts scale with arena area), raceplan.js (RPLAN.fill), spsteer.js (cache keyed on mode), index.html, tests/levelboxtest.js (new), tests/kindredtest.js (diagnostics)
- What: a level-up drops a gold-ringed box 120 to 300 away (inside the arena, off hazards); swimming into it opens its screen at once (no Director gap, Race slot or wave-break hold). The Race keeps its 5:00 and 10:00 milestones and its schedule for other rewards, but no longer adds empty-slot screens. The Race arena is 3600 (was 2400) and the Petri Dish 1750 (was 1150), with terrain counts scaled to keep the same density. Rescue spirits and Donor DNA strands are placed at least 160 inside the rim and at least 540 from you (a spot pulled in from the rim could land on you). Autorun's 30 Hz steering cache no longer carries over a mode change.
- Save data: none.
- Hooks: levelbox.js wraps game.js applyPickup, weapons24.js wupTick, v10.js v10Draw; adds POWERUPS.lvbox.
- Risk: bigger arenas lengthen travel (to the egg, to rescues); terrain counts up to 2.3x (performance). Bots in sims (TUT_OFF) still get level screens directly.

## 2026-10-23 Late-race frame rate: thinner crowds, cheaper movement (v10.110)
- Systems: director (spawning), enemies, autorun, fx (particles)
- Files: game.js (CROWD, crowdK/spawnK, CAPS.enemies a getter; updateEnemies far half-rate; separation half-rate; particle caps), spsteer.js (autoSteer every other frame)
- What: outside wave mode a quarter fewer enemies are alive and spawned (the hard cap every spawner checks is 128, was 170; sims at minutes 5 to 9 hold 100 to 117 alive, were 143 to 152), each with up to a third more health and XP. Enemies over 600 away update every other frame (time carried), separation runs on half the crowd a frame, autorun steers 30 times a second, particles cap 160 (120 at lower quality). Measured 6 to 19% less update time in the same scene, before the smaller crowd.
- Save data: none.
- Hooks: game.js updateEnemies(dt0); spsteer.js wraps autoSteer (cache).
- Risk: CROWD.k changes difficulty feel (fewer, tougher); far enemies' reactions lag a frame.

## 2026-10-23 Run log lists the Switched at Birth start card
- Systems: telemetry (run log)
- Files: wstats.js (wsPick matches a wrapped def)
- What: the run log's start offers now include the Switched at Birth card (it was dropped, so starts looked like two offers).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-23 Rewind off (v10.109)
- Systems: chrono (rewind), ui (HUD)
- Files: norewind.js (new), index.html, tests/rewindtest.js (checks it is off; NOREWIND.on = false for the old mechanic)
- What: Rewind is off in v10 runs: no charges, no button, and dying is final. Its Paradox Echo had done half of a Sandbox run's damage from one rewind.
- Save data: none.
- Hooks: none in shared files. Wraps td.js startRewind and gainChrono.
- Risk: runs are harder (no second chance on death); win rate unsimmed.

## 2026-10-23 The Race's upgrade schedule (v10.108)
- Systems: rewards (Reward Director), race, draft
- Files: raceplan.js (new), index.html, tests/raceplantest.js (new), tests/drafttest.js (RPLAN.off for the Director's stacking check)
- What: in the Race, reward screens open only at 20 set times (0:30, then about every 40 to 45 s, last 14:25) plus Sample Milestone screens at 5:00 and 10:00 (a Rare-floor level draft, a placeholder for the sample reward sequence). Level-ups between slots fold into the next level screen and raise its rarity floor; a slot with nothing waiting still opens a level-up screen. Transformations are dealt less before 5:00 and more from 5:00 to 10:00; masteries less before 10:00, more after. Forks, branch screens, boss rewards and the second weapon still open at once; after the egg wakes, waiting rewards apply themselves as before.
- Save data: none.
- Hooks: none in shared files. Wraps director.js dirGate, dirTitle; modmatrix.js modDraftCands; v10.js v10Tick.
- Risk: fewer screens means slower builds in the Race (difficulty unsimmed); chests wait for slots.

## 2026-10-23 Samples: achievement unlocks, random starting offer, bigger passives (v10.108)
- Systems: samples, achievements, weapons (start)
- Files: samplestart.js (new), samples10.js (locked card line; passive numbers), acrosample.js and acrocopy.js (Early Bird at 50%), kindred.js (rescues remembered in META.kinSeen, no unlock), index.html, tests/samplestarttest.js (new), tests/kindredtest.js
- What: Baseline is open; every other sample unlocks when you first earn its achievement (Alpha: Still Here?, Beta: Flesh Wound, Private Schooled: Middle Management Removed, Ordered Online: Statistically Significant, Redtail: Contractually Obligated, Prawn Again: Lab Rat, Not of This World: Congratulations It's You, Early Bird: Flawless Specimen). Achievements are remembered between runs; rescues no longer unlock samples. The start offers three random matrix weapons: one of the sample's damage type, one Switched at Birth into it (starts switched), one any. Passives exaggerated: Baseline +15% stats, Alpha +50% fire rate while moving, Beta below 40% up to +200% damage and double lifesteal, Private Schooled twice the Corrosion and ally damage, Ordered Online 30% Evasion and a wider, longer trail, Redtail double burn, Prawn Again 2.5x Bleed, Not of This World shifts every 12 s with a 3 s +30% surge, Early Bird pays off at 50%.
- Save data: META.achEver and META.kinSeen added; META.s10 now filled by achievements (S10_ALL off).
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
