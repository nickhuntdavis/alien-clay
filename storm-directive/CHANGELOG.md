# CHANGELOG.md: Spawn Prawn

Newest first. Sessions don't edit this file: they log in `changes/<branch>.md`, and those fragments are folded in here when a branch merges into `main` (rules: `CLAUDE.md` > Change log). System names come from `ARCHITECTURE.md`. History before v9.23 lives in `NOTES.md` > Recent changes and `git log`.

## Unreleased: 2026-10-24 Plain copy for weapon cells, aim choices and stat bonuses
- Merged: ccr-eff39359-vaxudl.

### Folded from ccr-eff39359-vaxudl: 2026-10-24 Plain copy for weapon cells, aim choices and stat bonuses
- Systems: weapons, ui
- Files: cellcopy.js (new), aimplus.js, statup.js, index.html
- What: the 75 per-weapon modifier cards on Nappy Mines, Blowing Bubbles, Hot Mess and Eggs now say what the upgrade does on that weapon (effect, then ranks 2, 3 and mastery). The four new aim choices (Mines, Projectiles, Enemies, Me) and the build panel's stat heading have plain text. No TODO_COPY placeholder is left on screen.
- Save data: none
- Hooks: none
- Risk: copy only; cell cards are long (150 to 260 characters), so check they fit on a small phone.

## v10.119: 2026-10-24 Copy for the weapon cells, aim menu and elite carriers
- Merged: ccr-10c7b3a7-ugrptm (after ccr-eff39359-vaxudl's copy, folded above).

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Copy for the elite carriers (v10.119, merge build)
- Systems: copy (elite carriers)
- Files: branchback.js, mutdrop.js, SpawnPrawn_Copy.xlsx
- What: the elite carrier's banner, float text and labels read LOOT CARRIER!, LOOT SECURED, LOOT LOST, LOOT and KILL FOR LOOT 12s. The weapon-cell cards, aim choices and stats heading keep the plain copy from ccr-eff39359-vaxudl (cellcopy.js), by the user's choice. Written by Claude at the user's request.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## v10.118: 2026-10-24 Weapon branches at Lv 3, 6 and 9; elite carriers drop a loot box; every targeting rule and autorun mode always on
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Every targeting rule and autorun mode always on (v10.118, merge build)
- Systems: targeting, autorun, sperm passives, tests
- Files: spsteer.js, aimplus.js, tests/aimplustest.js
- What: Advanced Targeting, Autopilot and their masteries are no longer dealt; every targeting rule (MINES, PROJECTILES, ENEMIES and ME included) and every autorun mode (AUTO included) is always available. Alternating two rules every other shot (the old targeting mastery) is gone.
- Save data: META.spKeep is no longer read (left in old saves, harmless).
- Hooks: none.
- Risk: four sperm passive cards fewer in the draft; spsteertest (not in the suite) still describes the old rules.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Weapon branches and elite carriers back
- Systems: weapons (upgrades), rewards (elite drops), tests
- Files: branchback.js (new), mutdrop.js (two strand labels are TODO_COPY), index.html, tests/branchtest.js (new), tests/mutdroptest.js, tests/run.sh
- What: a weapon's old upgrade path opens again as it reaches Lv 3 (pick one of three promises), Lv 6 (that promise's cards and its wildcard) and Lv 9 (a mastery; one weapon a run). Some elites carry a DNA strand again (the helix, the beacon, a 40 s countdown); kill one in time and the strand gives you a loot box with modifier cards.
- Save data: none.
- Hooks: none in shared files (mutdrop.js labels changed in place).
- Risk: more power per run (branch cards on top of modifiers, plus carrier boxes); branch cards and the new weapon cells both act on Nappy Mines, Blowing Bubbles, Hot Mess and Eggs (e.g. Domino and Loaded nappy together); 5 TODO_COPY lines for the carrier.

## v10.117: 2026-10-24 Weapon cells for Hot Mess and Eggs; aim at mines, shots or yourself; mines show their charge; a level-up box every level
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Mines that show their charge; more to aim at; a box every level (v10.117, merge build)
- Systems: weapons (mine look), targeting, rewards (level-ups), tests
- Files: cellmods.js (xcMineLook, the Ripening fizzle), aimplus.js (new), game.js (gainXp), index.html, tests/aimplustest.js (new), tests/run.sh
- What: Nappy Mines that are ripening (Charged) fizzle and glow brighter, then flash once when full; empowered mines (Ripening, Loaded nappy, fused, nukes) are drawn bigger and brighter the more empowered they are. With the Advanced Targeting mastery every aim menu leads with MINES (shoot your own mine to set it off), PROJECTILES (shoot down enemy shots), ENEMIES (the nearest enemy, then the usual rules) and ME (your attack lands on you). Every level-up now gives a level-up box (was every level to Lv 8, every second to Lv 24, then every third).
- Save data: none.
- Hooks: game.js gainXp pushes a level request every level (the condition removed).
- Risk: about twice as many level-up boxes after Lv 8, so runs get stronger later (win rate needs a sim); aim stand-ins reach code that expects an enemy (damageEnemy and acquireMany are covered; anything else that reads target.hp sees 1).

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Weapon cells for Hot Mess and Eggs
- Systems: modifiers, weapons, tests, docs
- Files: cellmods2.js (new), cellmods.js (per-tag tables; Cannonball share per source), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: Hot Mess and Eggs get their own effect for every modifier the matrix gives them (Claude's picks, 5.7 and 5.8): Spatter, Simmer, Fuel spill, Firestarter, Popcorn, Plughole, Tar pit, Grease fire, Flaming bag, Bonfire, Splash pattern, Shared Burn, Fire walker, Hot to touch, hidden patches, ring of fire, Spreading; Scrambled, Family recipe, Egg toss, Egg on your face, Egg drop, Golden egg, bouncing eggs, Clutch, Hatchling, Nest egg, orbiting eggs, Yolk splash. Switched at Birth deals Acid or Mucus on Hot Mess and Blood or Acid on Eggs. celltest covers all four weapons and no longer fails when the player spawns in cilia.
- Save data: none.
- Hooks: none in shared files.
- Risk: balance of Hot Mess and Eggs with modifiers (not simmed; Eggs' delivery cells deal less than plain Eggs); 34 more TODO_COPY card texts.

## v10.116: 2026-10-23 Weapon cells for Nappy Mines and Blowing Bubbles; every bubble inflates before it is sent
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-23 Bubbles inflate before they leave; the melee bubble is its own thing (v10.116, merge build)
- Systems: weapons, modifiers, tests
- Files: cellmods.js, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: every bubble (Blowing Bubbles with or without modifiers, the Bubble machine and Bubble rain) grows from nothing before it is sent (0.25 s; Big breath 0.6 s) and can't trap or pop until it leaves. Melee on Bubbles: the bubble round you pops in a Force explosion on contact, then grows back from tiny (3 s, 2 s from Lv 2); it is not the Membrane and stacks with it.
- Save data: none.
- Hooks: none.
- Risk: Blowing Bubbles fires a little later than before (every bubble waits 0.25 s); celltest now counts every hit and gives bubble cells 8 s.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-23 Weapon cells for Nappy Mines and Blowing Bubbles
- Systems: modifiers, weapons, tests, docs
- Files: cellmods.js (new), toys.js, index.html, tests/celltest.js (new), tests/run.sh, redesign docs/MODIFIER_MATRIX.md
- What: Nappy Mines and Blowing Bubbles get their own effect for every modifier the matrix gives them (designed with the user: Breadcrumbs, Ripening, Implosion, Fly paper, Cannonball, sliding Ricochet mines, artillery into carpet bombing, tripwires, suicide vest and runners; Bubble post, Personal space, Big breath, Beach ball, Bubble magnet, gum, Unpoppable, Bubble pinball, Inflating, Bubble pack, Hamster ball, a bubble round you, Bubble machine, Bubble rain, Gift wrap, Iron lung and more). Rapid Fire, Sticky, Ricochet, Connecting, Extra Projectiles and Orbiting are now dealt on Nappy Mines; Switched at Birth deals one of two alternates on each (Acid or Mucus; Acid or Static), and a switched bubble pops in its new type.
- Save data: none.
- Hooks: toys.js bubblePop: the pop's type follows Switched at Birth (one line).
- Risk: balance of both weapons with modifiers (not simmed); other branches that wrap msHit/mwHit/msStats/mwStats etc. by reassignment must load before cellmods.js; card text is TODO_COPY for the 42 cells.

## v10.115: 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats; run log stats and XP fixes; late-Race frame rate
- Merged: ccr-8707d278-h1fnlw.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Frame rate in a late Race (v10.114)
- Systems: terrain, render (enemies, bosses), combat (status draw), particles, tests (sims)
- Files: terrain.js, render.js, fight.js, game.js, tests/sim/framebench.js (new)
- What: terrain drift checks its neighbours every 8th frame (staggered) instead of all pairs every frame (0.65 to 0.2 ms a frame). Enemy status rings and bars skip enemies off screen. Volvox dots, boss aura motes and rotifer glints draw as a few batched paths; in a crowd, yeast drops its two surface spots. A fixed late-Race scene goes from 421 to 122 canvas calls for enemies and 70 to 10 for a boss aura. Particles are trimmed to the quality cap even when an effect adds them directly. New `sim/framebench.js` times a late Race at a chosen quality step.
- Save data: none.
- Hooks: none.
- Risk: terrain steering reacts up to 8 frames late (it creeps at 6 to 20 a second); crowd-mode yeast look plainer; boss motes flicker in 4 brightness steps instead of smoothly.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Run log: stats line, honest XP line
- Systems: run log, stat bonuses
- Files: statup.js, game.js, meta.js, tests/statuptest.js
- What: the run log has a ` stats:` line (your stat bonus totals) under the build line. The xp line's "collected" is now the gems' own value (it used to include the Race and Feat XP multipliers, so it read about 1.7x what was dropped) and its "bonus" is every multiplier together.
- Save data: run log records gain `stb`; `xpK` now means total multiplier.
- Hooks: none new (statup.js wraps runSummary, runText).
- Risk: none for play; old run log entries keep their old xp numbers.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats (v10.113)
- Systems: stat bonuses (new), weapons, modifier cards, ui (weapon draft, BUILD tab), defences, movement
- Files: statup.js (new), game.js, pdef.js, index.html, style.css, tests/statuptest.js (new), tests/run.sh, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: every modifier card (each rank, and Switched at Birth) also adds a small bonus to one of 16 stats, shown on the card and totalled on the pause BUILD tab. Each of the 27 matrix weapons has its own base stats (fire rate, magazine, reload, crit chance, crit bonus, range), shown on the weapon draft; damage is rescaled so each still deals about what it did (statuptest: all within 20% on dummies).
- Save data: none (run state `G.stb`; new stat `G.P.accel`).
- Hooks: game.js updatePlayer swim thrust reads `P.accel`; pdef.js pdMemFrac -> stMemFrac.
- Risk: weapon damage numbers change for all 27 (balance held per weapon, not simmed per sample); stat bonuses make late runs a little stronger; anything that reads `def.base.dmg`/`cd`/`mag` sees the new values. Placeholder `TODO_COPY:stats_build_head` (BUILD tab heading).

## v10.112: 2026-10-23 Strike from Above as an extra; Homing delay; Race upgrade schedule; sample unlocks, random starts, bigger passives; Rewind off; late-race frame rate; level-up boxes to pick up; much bigger arenas
- Merged: ccr-7c6adc60-uqv9g4.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Glowing level-up boxes; arenas even bigger (v10.112, merge build)
- Systems: pickups (draw), race, waves, terrain, big hazards
- Files: render.js (a level-up box draws as a bigger, glowing gold DNA strand), data.js (CORE.arena 5400), waves.js (DISH.arena 2600), terrain.js (terrain count scale capped at 2.5x), bighaz.js (Petri Dish sizing reads DISH.arena), tests/levelboxtest.js
- What: level-up boxes are a large gold DNA strand with a pulsing glow, so they stand out from Donor DNA strands and power-ups. The Race arena is 5400 (was 3600) and the Petri Dish 2600 (was 1750); terrain grows with the area but at most 2.5x the old count, so the biggest arena is sparser.
- Save data: none.
- Hooks: render.js pickups loop (lvbox draws with the chest strand).
- Risk: longer swims; sparser terrain in the Race.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Level-up boxes to pick up; bigger arenas; rescues inside the dish (v10.111)
- Systems: rewards (level-ups), pickups, kindred (rescues), terrain, waves, race
- Files: levelbox.js (new), kindred.js (kinIn, KIN.rim), data.js (CORE.arena 3600), waves.js (DISH.arena 1750), terrain.js (terrain counts scale with arena area), raceplan.js (RPLAN.fill), spsteer.js (cache keyed on mode), index.html, tests/levelboxtest.js (new), tests/kindredtest.js (diagnostics)
- What: a level-up drops a gold-ringed box 120 to 300 away (inside the arena, off hazards); swimming into it opens its screen at once (no Director gap, Race slot or wave-break hold). The Race keeps its 5:00 and 10:00 milestones and its schedule for other rewards, but no longer adds empty-slot screens. The Race arena is 3600 (was 2400) and the Petri Dish 1750 (was 1150), with terrain counts scaled to keep the same density. Rescue spirits and Donor DNA strands are placed at least 160 inside the rim and at least 540 from you (a spot pulled in from the rim could land on you). Autorun's 30 Hz steering cache no longer carries over a mode change.
- Save data: none.
- Hooks: levelbox.js wraps game.js applyPickup, weapons24.js wupTick, v10.js v10Draw; adds POWERUPS.lvbox.
- Risk: bigger arenas lengthen travel (to the egg, to rescues); terrain counts up to 2.3x (performance). Bots in sims (TUT_OFF) still get level screens directly.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Late-race frame rate: thinner crowds, cheaper movement (v10.110)
- Systems: director (spawning), enemies, autorun, fx (particles)
- Files: game.js (CROWD, crowdK/spawnK, CAPS.enemies a getter; updateEnemies far half-rate; separation half-rate; particle caps), spsteer.js (autoSteer every other frame)
- What: outside wave mode a quarter fewer enemies are alive and spawned (the hard cap every spawner checks is 128, was 170; sims at minutes 5 to 9 hold 100 to 117 alive, were 143 to 152), each with up to a third more health and XP. Enemies over 600 away update every other frame (time carried), separation runs on half the crowd a frame, autorun steers 30 times a second, particles cap 160 (120 at lower quality). Measured 6 to 19% less update time in the same scene, before the smaller crowd.
- Save data: none.
- Hooks: game.js updateEnemies(dt0); spsteer.js wraps autoSteer (cache).
- Risk: CROWD.k changes difficulty feel (fewer, tougher); far enemies' reactions lag a frame.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Run log lists the Switched at Birth start card
- Systems: telemetry (run log)
- Files: wstats.js (wsPick matches a wrapped def)
- What: the run log's start offers now include the Switched at Birth card (it was dropped, so starts looked like two offers).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Rewind off (v10.109)
- Systems: chrono (rewind), ui (HUD)
- Files: norewind.js (new), index.html, tests/rewindtest.js (checks it is off; NOREWIND.on = false for the old mechanic)
- What: Rewind is off in v10 runs: no charges, no button, and dying is final. Its Paradox Echo had done half of a Sandbox run's damage from one rewind.
- Save data: none.
- Hooks: none in shared files. Wraps td.js startRewind and gainChrono.
- Risk: runs are harder (no second chance on death); win rate unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Race's upgrade schedule (v10.108)
- Systems: rewards (Reward Director), race, draft
- Files: raceplan.js (new), index.html, tests/raceplantest.js (new), tests/drafttest.js (RPLAN.off for the Director's stacking check)
- What: in the Race, reward screens open only at 20 set times (0:30, then about every 40 to 45 s, last 14:25) plus Sample Milestone screens at 5:00 and 10:00 (a Rare-floor level draft, a placeholder for the sample reward sequence). Level-ups between slots fold into the next level screen and raise its rarity floor; a slot with nothing waiting still opens a level-up screen. Transformations are dealt less before 5:00 and more from 5:00 to 10:00; masteries less before 10:00, more after. Forks, branch screens, boss rewards and the second weapon still open at once; after the egg wakes, waiting rewards apply themselves as before.
- Save data: none.
- Hooks: none in shared files. Wraps director.js dirGate, dirTitle; modmatrix.js modDraftCands; v10.js v10Tick.
- Risk: fewer screens means slower builds in the Race (difficulty unsimmed); chests wait for slots.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Samples: achievement unlocks, random starting offer, bigger passives (v10.108)
- Systems: samples, achievements, weapons (start)
- Files: samplestart.js (new), samples10.js (locked card line; passive numbers), acrosample.js and acrocopy.js (Early Bird at 50%), kindred.js (rescues remembered in META.kinSeen, no unlock), index.html, tests/samplestarttest.js (new), tests/kindredtest.js
- What: Baseline is open; every other sample unlocks when you first earn its achievement (Alpha: Still Here?, Beta: Flesh Wound, Private Schooled: Middle Management Removed, Ordered Online: Statistically Significant, Redtail: Contractually Obligated, Prawn Again: Lab Rat, Not of This World: Congratulations It's You, Early Bird: Flawless Specimen). Achievements are remembered between runs; rescues no longer unlock samples. The start offers three random matrix weapons: one of the sample's damage type, one Switched at Birth into it (starts switched), one any. Passives exaggerated: Baseline +15% stats, Alpha +50% fire rate while moving, Beta below 40% up to +200% damage and double lifesteal, Private Schooled twice the Corrosion and ally damage, Ordered Online 30% Evasion and a wider, longer trail, Redtail double burn, Prawn Again 2.5x Bleed, Not of This World shifts every 12 s with a 3 s +30% surge, Early Bird pays off at 50%.
- Save data: META.achEver and META.kinSeen added; META.s10 now filled by achievements (S10_ALL off).
- Hooks: none in shared files. Wraps samples10.js s10Start, s10Unlock; show.js achieve.
- Risk: testers lose samples they had through S10_ALL until they earn the achievements. Stronger passives unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Homing kicks in after a moment (v10.107)
- Systems: weapons (modifiers)
- Files: piercefx.js (modStep wrapped), tests/piercetest.js, tests/modstest.js (Homing curve checked after 0.5 s)
- What: the Homing modifier steers a shot only from 0.2 s after it is fired, so a spread fans out first and then each shot turns towards the nearest enemy. Weapons that home by design are unchanged.
- Save data: none.
- Hooks: none in shared files.
- Risk: Homing shots miss a little more at point-blank range.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Strike from Above is an extra (v10.106)
- Systems: weapons (modifiers, Laser)
- Files: modwide.js (MW_DFA_RATE, mwDfaRoll; mwFire falls through), laserbeam.js (orbital strikes on a timer while the beam fires), atkswap.js (no longer an attack type), slicecopy.js (lines), tests/widetest.js, laserbeamtest.js, lootfiltertest.js
- What: Strike from Above no longer replaces the weapon's attack. The weapon fires as normal and now and then a strike from above lands too: about 0.15 strikes a second at Rank 1, then 0.25, 0.35 and 0.5 at mastery (a chance per attack from the weapon's cooldown; on the Laser, an orbital strike on a timer). It no longer swaps with Melee, Ranged or Mines (still the Delivery group).
- Save data: none.
- Hooks: none in shared files.
- Risk: Strike from Above builds gain the base attack back (stronger overall); strike rates unsimmed.

## v10.105: 2026-10-23 Full sperm passive list with branching masteries; targeting and autorun as passives; loot filters; Area modifier; piercing fixes; HOLD is manual; Turncoat by chance
- Merged: ccr-7c6adc60-uqv9g4.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Turncoat is a chance (merge build, v10.105)
- Systems: weapons (modifiers)
- Files: modwide.js (MW_TURN_CH), slicecopy.js (Turncoat lines), tests/widetest.js
- What: a Turncoat kill rises as an ally only by chance: 1 in 20 at Rank 1, then 10%, 15%, and 20% at mastery (was every kill).
- Save data: none.
- Hooks: none.
- Risk: Turncoat builds are much weaker.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser holds Piercing and Ricochet together (merge build, v10.105)
- Systems: weapons (Laser, modifiers)
- Files: atkswap.js (modOk, mmHeld wrapped), tests/flightpairtest.js (new)
- What: the Laser alone may hold Piercing and Ricochet (both Flight) at once; the second takes a slot of its own. Every other weapon keeps one Flight modifier.
- Save data: none.
- Hooks: atkswap.js wraps modmatrix.js mmHeld.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 HOLD is fully manual (merge build, v10.105)
- Systems: autorun
- Files: spsteer.js (autoSteer wrapped; HOLD's description), tests/holdtest.js (new)
- What: under HOLD the sperm does not move unless you steer it: no dodging and no drifting back to a spot.
- Save data: none.
- Hooks: spsteer.js wraps game.js autoSteer.
- Risk: HOLD players no longer get free dodges.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Piercing fixes (v10.104)
- Systems: weapons (modifiers)
- Files: piercefx.js (new), index.html, tests/piercetest.js (new)
- What: a homing shot that pierces an enemy now steers to one it has not hit (it used to curl back round the one it pierced); with none in reach it flies straight. Each pierce sprays sparks out of the far side with a small flash.
- Save data: none.
- Hooks: none in shared files. Wraps modifiers.js modHit.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Area weapon modifier (v10.103)
- Systems: weapons (modifiers)
- Files: areamod.js (new), modwide.js (Melee reach, Pulling and Repulsor read areaK), index.html, tests/areatest.js (new), tests/modstest.js (count)
- What: a new modifier, Area, on any attack type: +25/50/75% (mastery +100%) to everything the weapon does over an area: blasts (bursts, Exploding Rounds, Death from Above, Mines, Ranged), its pools, Contact reach, Melee reach, beam width, aura shots, Pulling reach, the Repulsor wave and gravity wells. It has its own group, so it only competes for a slot.
- Save data: none.
- Hooks: none in shared files. Wraps game.js aoe and ring, modifiers.js modWell, weapons24.js wupStats, wupTick.
- Risk: a 6th modifier group with 5 slots, so a weapon can no longer fill every group. Area-heavy builds unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Loot filters, attack-type swap, Laser pictogram (v10.102)
- Systems: ui (loot screen, weapon draft), weapons (modifiers), pictograms
- Files: atkswap.js (new), lootfilter.js (new), index.html, tests/lootfiltertest.js (new)
- What: long loot lists (the no-limits level-up list, the 27-weapon pick) get a search box, tabs (by weapon, passives, defences; by attack type for weapons), chips (modifier group, passive kind, damage type) and sort (as dealt, A to Z, by group). Melee, Ranged, Mines and Death from Above now swap: the card is marked SWITCH with a red border and says the old one's ranks, branch and mastery go; once a weapon has one, another is dealt at 15% weight. The Laser uses the spark-of-life pictogram.
- Save data: none.
- Hooks: none in shared files. Wraps modOk, modAdd, modCard, modDraftCands, UI.renderLootCards, UI.renderDraft; adds PICTO_ALIAS entries.
- Risk: the Laser now shares its pictogram with Spark of Life. Attack-type modifiers can now be offered on a weapon that already holds one (was never).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Kept targeting/autorun masteries use no slot (v10.101)
- Systems: sperm passives
- Files: spsteer.js, tests/spsteertest.js
- What: the mastery card for a kept Advanced Targeting or Autopilot no longer takes a passive slot (stored in G.spMx, like the defence masteries).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Branching passive masteries (v10.100)
- Systems: sperm passives, mutations, defences (pdef), draft (forks)
- Files: spmast.js (new), index.html, tests/spmasttest.js (new)
- What: taking a passive's mastery opens a fork of two masteries (user: the first two options of each). Covers Slipstream, Heartbeat, Overexcited, Group Project, Growing Pains, Extra Padding, Stickier, Crossed Wires, Conductive Mess, Big Brain, Can't Sit Still, All at Once and Hungry Hungry; Squishy, Shell, Thorns and Evasion get mastery cards (no slot) once held at 3 (Squishy at 1). Group Project, Growing Pains, Conductive Mess and the four trade-offs now have 3 levels (trade-off costs stay fixed). Shell's option A became "a lost layer regrows after 15 s without a hit", as layers already refit each wave.
- Save data: none.
- Hooks: none in shared files. Wraps mutations.js mutDmg, mutRate, mutSpeed, mutHurtIn, mutKill, mutLevel, mutBurst, mutRxLock, mutHit; pdef.js pdefHurt; game.js healPlayer, gainXp, fireWeapon; weapons24.js wupTick; draft.js forkCards, draftTitle.
- Risk: many wrappers on mutation hooks (order: after spfull and spsteer). Mastery numbers are unsimmed (bots rarely reach Rank 4).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Targeting and autorun passives; The Runs loop mastery (v10.99)
- Systems: sperm passives, autorun, autoaim, ui (aim menus, end screen)
- Files: spsteer.js (new), spfull.js, autorun.js (aimList), ui.js and loadout.js (aim menus read aimList), index.html, tests/spsteertest.js (new)
- What: targeting starts with Nearest, Furthest, Densest cluster and Elites & bosses; Advanced Targeting adds Toughest and Fastest, then Lowest health and Shooters first, then the rest; its mastery alternates a weapon's shots between its two rules. Autorun starts with Kite and Hold; Autopilot adds Collect, Orbit, then Hunt and Nest; its mastery adds an AUTO mode that picks for you. Win a run holding one and you keep all its levels for good (both held: you pick one); a kept passive's card is gone and its mastery card turns up from run Lv 10. The Runs' mastery: close a loop of trail and everything inside takes a hit of its type.
- Save data: META.spKeep added ({ aim, auto }).
- Hooks: ui.js tap-cycle and aim grid, loadout.js aim chips: DIRECTIVES -> aimList(). Wraps autorun.js moveModes, arMode, aimDir; UI.showGameOver; v10.js v10Draw.
- Risk: tests, sims and the School get every option (STEER.force to test the limits). Weapons whose default rule is not on offer fall back to Nearest.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sperm passives: the doc's full list (v10.98)
- Systems: sperm passives, mutations, chemistry (fight), draft
- Files: spfull.js (new), index.html, tests/spfulltest.js (new)
- What: level-ups deal only SPERM_PASSIVES.md's list (24 cards plus all eight defences); Sticky Fingers, the old damage-type cards, Come Closer and Death Is Recycling as cards, and the v9 g_ cards are gone. Six new passives with 3 levels and a mastery: Pile-Up (Force knockback and collisions), Wet Floor (bigger, longer Acid pools), Chain Letter (more and longer Static jumps), Bleeding Heart (stronger Bleed, more Extraction healing; mastery Bad Blood), Peer Pressure (longer Possession, harder ally hits), Leave a Little Something (all your pools last longer, final double tick). Come Closer (Stickier + Pile-Up) and Death Is Recycling (Peer Pressure + Crossed Wires) are now automatic pair bonuses; holding one half deals the other more often. Renamed to the doc: Overexcited, Stickier, All at Once, Hungry Hungry.
- Save data: none.
- Hooks: none in shared files. Wraps fight.js fightStatus, fightDeath, fightArc; chem.js curseFoe; mutations.js mutHit; weapons24.js wupStats, wupDmgMul, wupTick, wupKill.
- Risk: Chain Letter replaces fightArc's body while held (a later change to fightArc needs copying). Defences now include Shell, Squishy, Evasion and Thorns in drafts (SLICE.defs widened).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Matrix only: the 27 matrix weapons and 25 matrix modifiers (v10.97)
- Systems: weapons, samples, weapons (modifiers), sandbox
- Files: matrixonly.js (new), index.html, tests/v9armstest.js, combo10test.js, wup3test.js, wup5test.js (matrixRestore)
- What: only the 27 weapons in MODIFIER_MATRIX.md are dealt anywhere (drafts, starting picks, rescues, the Sandbox): the rest go on hold, and the v9 samples leave the Sample Rack. Only the matrix's modifiers are offered (plus Type Swap); Sweep, Growing, Chain Hits, Returning, Delayed Blast, Lobbed, Trail, Around You, Volley, Stat Scaling, Split on Kill, Pets, Gravity Well and Lunge are hidden. MATRIX_ONLY.on = false, or matrixRestore(), undoes it; tests (window.TUT_OFF) still get every modifier.
- Save data: none.
- Hooks: none in shared files. Wraps modmatrix.js modOk; pushes onto weapons24.js W24_HOLD.
- Risk: v9 sample unlocks and saves still exist but are hidden.

## v10.96: 2026-10-23 Weapon modifier matrix and sperm passives in code; the Laser; Sandbox on the home screen; splash lag fix
- Merged: ccr-7c6adc60-uqv9g4, ccr-5e56e811-ce1r6c.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sandbox on the home screen (merge build)
- Systems: ui (home screen), sandbox, weapons (modifiers)
- Files: index.html (SANDBOX button; Quick Start hidden), sandbox.js (button; level-ups and modifier forks open), modmatrix.js (mmFree true in the Sandbox), tests/quick.js, tests/veilshot.js, tests/wstest.js (call UI.quickStart directly)
- What: the home screen has SANDBOX in place of Quick Start: straight into the Sandbox with no developer switch. In the Sandbox, level-ups now open and list every weapon modifier and sperm passive with no slot limits (and their branch and mastery forks), so any weapon and modifier can be tried. Also merges the splash lag fix (ccr-5e56e811-ce1r6c).
- Save data: none.
- Hooks: none new.
- Risk: Quick Start is gone from the home screen (UI.quickStart still exists).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Homing and Crossfire on the Laser (v10.95)
- Systems: weapons (Laser, modifiers)
- Files: laserbeam.js (lzSeek and homing steps in lzTrace; lzCross, lzCrossOn), modwide.js (Crossfire pins instead of pushing), tests/laserbeamtest.js
- What: Homing now fits beams: the Laser and every bounce and pierce curve towards the enemy ahead (within 70 degrees), turning up to 7 / 13 / 18 degrees (26 at mastery) every 45 units; Laser mines' beams don't home. Crossfire (Extra Shots mastery, Full Circle): the rear beam curves round and strikes the main target from the far side; while both beams hold it, it takes +30% and Knockback pins it instead of pushing.
- Save data: none.
- Hooks: none new.
- Risk: Homing makes bounces reliably find enemies (more damage with Bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser versions of the remaining modifiers (v10.94)
- Systems: weapons (Laser, modifiers), chemistry (Sticky), fx
- Files: laserbeam.js (lzOrbital, lzSwordSwing, lzMineLay, lzExtrasTick, lzExtrasDraw, lzDrawSegs, lzFx, lzPulseOn, LZ_RAPID; wraps wupFire, modAtk, forkCards, modCard), modwide.js (Explosive Hits pops every 0.5 s on the Laser, Knockback pushes steadily, Mark and Detonate needs 0.5 s held), modslice.js (Sticky slows then freezes by time held; Can't Pick One rolls every 0.5 s and draws as a held laser; no Charge-Up fork on the Laser), tests/laserbeamtest.js
- What: the Laser hits 10 times a second, so per-hit modifiers were rescaled for it. Strike from Above is an orbital laser (a mark, then a beam from above that follows the target for 1 s; one at a time). Melee is a laser sword (a 150-degree swing every 0.6 s). Mines are laser mines that spin out 1 beam plus one per Extra Shots beam for 1.2 s when an enemy comes near, never aiming. Empowered Attack is a wide, bright 0.5 s pulse every 4 / 3 / 3 s. Rapid Fire has Laser branches: Cooler (heats slower; Heat Sink, Vent) and Quicker (shorter charge-up; Instant, Strong Start). Raise Allies is not offered on the Laser; Charge-Up has no branches on it.
- Save data: none.
- Hooks: laserbeam.js wraps weapons24.js wupFire, modifiers.js modAtk, draft.js forkCards, modcards.js modCard.
- Risk: crowd damage with Strike from Above (about 5x the beam in a tight cluster), the sword (3x) and Explosive Hits (2x).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Extra Shots on the Laser: beams with their own targets (v10.93)
- Systems: weapons (Laser, modifiers), ui (charge glow)
- Files: laserbeam.js (lzXUpdate, lzXOn, lzRampX, lzXSweep; lzBeams returns per-beam share and ramp), modslice.js (no blanket beam damage cut on the Laser), tests/laserbeamtest.js
- What: each Extra Shots beam is its own laser: it locks its own target (front beams in your front half; Full Circle's rear beam in your back half), sweeps to it within 50 degrees, has its own ramp, and charges (a smaller glow) before firing on a new target. A beam with no target of its own runs beside the main beam on its target. Beams on one target share one beam's damage (no loss); beams on D different targets deal D^0.6 beams' worth in all. Each extra beam heats the Laser 33% faster. The old blanket damage cut (x0.76 even with nothing to aim at) is gone.
- Save data: none.
- Hooks: none new.
- Risk: more total damage in crowds than v10.92 (x1.52 with 2 targets, x1.93 with 3), offset by faster overheating.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Charge-Up turns the Laser into a charge-and-blast weapon (v10.92)
- Systems: weapons (Laser, modifiers), chemistry (status bars), fx
- Files: laserbeam.js (lzBlast, lzBlastDraw, lzCR; mutBarK wrapped for blasts), modwide.js (Charge-Up's stats and branches skip the Laser), tests/laserbeamtest.js
- What: with Charge-Up the Laser has no held beam: its charge-up is longer each rank (x1.25 / 1.5 / 1.75, x2 at mastery) and ends in one wide, white-hot blast (0.3 s flash) under all the beam's rules, dealing the held beam's damage at once: 4 s of full-strength beam at Rank 3 (50 / 75 / 100%, 125% at mastery). Blasts build enemies' status bars 3 times as fast and add half a burn bar of heat to you. The charge glow is bigger each rank.
- Save data: none.
- Hooks: laserbeam.js wraps mutations.js mutBarK.
- Risk: single huge hits (power11.js still caps early one-shots on germs).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser overheat bar; Rapid Fire shortens its charge; no Growing; longer charge (v10.91)
- Systems: weapons (Laser, modifiers), ui (burn bar)
- Files: laserbeam.js (lzHeatTick, lzHeatDraw, lzCharge, modOk drops Growing), modslice.js (Rapid Fire's rate and branches skip the Laser), tests/laserbeamtest.js
- What: firing heats the Laser (a burn bar under you, full after 4 s of beam); full, it switches off and reloads until it has cooled right down (2.2 s, faster with reload speed); it never hurts you. Rapid Fire on the Laser only shortens the charge-up (70 / 50 / 35%, 20% at mastery). The base charge-up is 0.6 s (was 0.3). Growing is no longer offered on the Laser.
- Save data: none.
- Hooks: none new.
- Risk: the Laser's damage over time drops (it rests about 2 s in every 6 under constant fire).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser charge-up (v10.90)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (LZ.charge, lzCharging, lzChargeDraw), tests/laserbeamtest.js, tests/slicetest.js
- What: a Laser starting from off charges for 0.3 s first: a small glow grows and flickers at the sperm's head, then the beam comes on (no damage while charging). A held beam, or one switching targets, doesn't charge again.
- Save data: none.
- Hooks: none new.
- Risk: the Laser's first hit on a new engagement lands 0.3 s later.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser Piercing: a visible sliver gets through (v10.89)
- Systems: weapons (Laser)
- Files: laserbeam.js (LZ_PKEEP, lzPKeep; pierced beam gets its own length), tests/laserbeamtest.js
- What: the beam past a pierced enemy gets its own length (75% of range, like a bounce) instead of what was left, so it shows even when the target is near the edge of reach; what gets through keeps 30 / 45 / 60% of the power (75% at mastery), so Rank 1 is a thin, dim sliver. Applies to the orbit ring too.
- Save data: none.
- Hooks: none new.
- Risk: Piercing deals less per pierced enemy than before (was 85%).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sweep and Growing on the Laser (v10.88)
- Systems: weapons (Laser, modifiers)
- Files: laserbeam.js (lzSweep, lzGrow, LZC.pad), tests/laserbeamtest.js
- What: Sweep swings the Laser either side of its target (about 34 / 42 / 50 degrees, 57 at mastery) under all its beam rules. Growing widens the Laser the longer it is held (up to x1.33 / x1.67 / x2, x2.33 at mastery, over 3 s; resets when it goes out); the wider beam also catches enemies up to 12 units off its line. Both did nothing on the Laser since v10.76.
- Save data: none.
- Hooks: none new.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Anchored Beam retired; Long Range fits beams (v10.87)
- Systems: weapons (modifiers)
- Files: modwide.js (modOk refuses anchored; range fits beams, +20% beam reach a rank), tests/modstest.js
- What: Anchored Beam is no longer offered (the aim menu's FURTHEST rule already does its job); Long Range now fits beams, adding 20% reach a rank to them (so a FURTHEST Laser can reach far enemies).
- Save data: none.
- Hooks: none new.
- Risk: none (a run already holding Anchored Beam keeps it).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser curves into its orbit ring (v10.86)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (lzOrbit lead-in)
- What: with Orbiting, the beam spirals out from you (three quarters of a turn) and runs into the ring along it, instead of a straight spoke out to it. Visual only.
- Save data: none.
- Hooks: none new.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounces lose damage and brightness by Bounce rank (v10.85)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (LZ_KEEP, lzKeep; brightness follows segment power), tests/laserbeamtest.js
- What: each Laser bounce keeps 35% of the power at Bounce Rank 1, 50% at Rank 2, 65% at Rank 3 and 80% at mastery (x0.6 more when Piercing splits it too); damage and the beam's brightness (glow, beam, core, hit spot) fall with it.
- Save data: none.
- Hooks: none new.
- Risk: Bounce deals less than before at low ranks (was -20% a bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounce angle from the sperm head (v10.84)
- Systems: weapons (Laser)
- Files: laserbeam.js (lzHead, lzBounceDir), tests/laserbeamtest.js
- What: the Laser's bounce angle is set by the sperm head's angle against the beam's line to the enemy (reflected as off a surface tilted by that difference), not by where on the enemy it lands, so hits nearly always reflect; only a beam exactly in line with the head (within 1 degree) doesn't reflect. Replaces v10.83's 12-degree head-on rule. Obstacles and the orbit ring follow the same rule; the membrane wall still reflects physically.
- Save data: none.
- Hooks: none new.
- Risk: Bounce fires on almost every hit again (more damage with Bounce than v10.83).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser: no bounce on a head-on hit (v10.83)
- Systems: weapons (Laser)
- Files: laserbeam.js (lzGlance), tests/laserbeamtest.js
- What: a Laser hit within 12 degrees of head-on doesn't bounce (it would only come straight back at you); off-centre hits still reflect at the true angle. Applies to enemies, obstacles and the orbit ring (user's choice of three options).
- Save data: none.
- Hooks: none new.
- Risk: Bounce triggers less often on a beam held dead on its target (mostly while sweeping or on moving enemies).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser reach and sweep limit (v10.82)
- Systems: weapons (Laser), fx
- Files: laserbeam.js
- What: a beam that ends in open water is drawn 3 times as far (stopping at the first enemy or obstacle, no damage out there) with a fade twice as long; the held beam only sweeps to a new target within 50 degrees, otherwise it switches off for a moment and comes back on aimed at the target.
- Save data: none.
- Hooks: none new.
- Risk: none (visual and aim only).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounces always show, open ends fade, orbit Piercing per section (v10.81)
- Systems: weapons (Laser)
- Files: laserbeam.js, tests/laserbeamtest.js
- What: a bounced beam gets its own length (75% of the weapon's range) instead of what was left, so a reflection always shows after a hit; a beam that ends in open water fades out over its last 35%; the orbit ring spends a Piercing charge in every section that meets an enemy, the same enemy included.
- Save data: none.
- Hooks: none new.
- Risk: longer bounces reach more enemies (more damage with Bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser's orbit is a traced ring; beams meet obstacles (v10.80)
- Systems: weapons (Laser, Orbiting), terrain
- Files: laserbeam.js (lzOrbit, obstacles in lzMeet, modOrbit/modFire wrapped), modslice.js (old hoop skips the Laser), tests/laserbeamtest.js
- What: with Orbiting the Laser leaves you and runs round a circle as one solid beam, traced in 48 sections with the beam's rules: an enemy in the way breaks the ring until it moves (Piercing carries on past it, weaker), Bounce reflects it off enemies and obstacles as a straight beam; a second inner ring turning the other way at mastery. No orbiting bodies for the Laser. Every Laser beam now stops at solid terrain, or reflects off it with Bounce.
- Save data: none.
- Hooks: laserbeam.js wraps modifiers.js modOrbit and modFire.
- Risk: solid terrain now blocks the Laser (it used to shine through).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser is a held, smooth beam (v10.79)
- Systems: weapons (Laser), fx
- Files: laserbeam.js, tests/laserbeamtest.js, tests/slicetest.js
- What: the Laser stays on between damage ticks: every frame its aim sweeps smoothly towards the target and its path (bounces, piercing, bubble reflections) is traced again and drawn as a steady beam with a white-hot core, a coloured glow and a bright spot where it lands. More power glows more, pulsing once past full strength. Overheating (Rapid Fire) blinks it off. Damage still lands at the weapon's fire rate.
- Save data: none.
- Hooks: laserbeam.js wraps weapons24.js wupTick and modifiers.js modDraw.
- Risk: per-frame tracing costs a little (32 segments at most per beam).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Bigger Membrane; plain modifier names (v10.78)
- Systems: defences (Membrane Shield), weapons (modifier names), copy
- Files: pdef.js (wide card and state), bodymods.js (bubbleR reads it), draft.js (defsHeld), spslice.js (slice defs), modmatrix.js (Type Swap tag), rewardui.js (Type Swap category), slicecopy.js (SLICE_NAMES), tests/spslicetest.js, tests/modcardtest.js
- What: Bigger Membrane, a new Membrane Shield level (needs the shield, uses no slot): the bubble is 60% wider. Weapon modifiers get plain names (Chain Hits, Orbiting, Delayed Blast, Around You, Sweep, Anchored Beam, Empowered Attack, Stat Scaling, Split on Kill, Pets, Focus, Link, Status Boost, Extra Shots, Long Range, Close Range, Charge-Up, Same Type Bonus, Pull, Raise Allies, Strike from Above, Explosive Hits, Mark and Detonate...); Switched at Birth's card tag is TYPE SWAP.
- Save data: G.pd.n.wide (run state only).
- Hooks: bodymods.js bubbleR -> G.pd.n.wide; rewardui.js accepts the TYPE SWAP tag.
- Risk: a bigger bubble is a strong defence (it is also a hitbox). fittest already failed before this (it expects the old random Switched at Birth).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser always red; no limits shows every modifier; plain copy for placeholders (v10.77)
- Systems: weapons (Laser colour), draft (slice-only), copy
- Files: laserbeam.js (colour pinned), spslice.js (sliceOn off under no limits; Piercing in the slice), slicecopy.js (new), index.html
- What: every form of the Laser (rings, mines, strikes, melee arcs, links, bursts) is red unless Switched at Birth changes its type. With no slot limits, slice-only drafting is off, so every modifier is offered. First-pass plain copy (written at the user's request) fills every TODO_COPY placeholder: modifiers, branches, masteries, sperm passives, the Laser, the setting, race rescue and v9 sample lines (SLICE_COPY in slicecopy.js; the user can rewrite there).
- Save data: none.
- Hooks: none in shared files. slicecopy.js wraps modCard, forkCards, banner, makePickup, UI.renderArmoury; loads last.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser fires like a laser; Ricochet renamed Bounce (v10.76)
- Systems: weapons (Laser, modifiers), defences (Internal Ricochet)
- Files: laserbeam.js (new), modslice.js (Focused Intensity skips its multiplier on the Laser), index.html, tests/laserbeamtest.js (new), run.sh
- What: the Laser is a traced ray: it stops at the first enemy (no pierce by default) and its aim swings towards the target. Bounce (was Ricochet) reflects it off the enemy's surface at the true angle; Piercing (now fits beams) carries it through; both split it into a straight and a bounced part at half power each. With Internal Ricochet and the membrane up the beam reflects round the inside of the bubble (14 reflections) and never leaves it. Its damage starts at 45% and ramps to 160% over 2.2 s on one target; Focused Intensity ramps it faster and higher.
- Save data: none.
- Hooks: none in shared files. Wraps v10.js v10Fire (outermost, Laser only).
- Risk: the Laser's damage curve changed (weaker on fast target switches); with Internal Ricochet the Laser only hits what touches the bubble.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The other 13 weapon modifiers; every modifier on a level-up with no slot limits (v10.75)
- Systems: weapons (modifiers), chemistry (Kinship fill, Primer), ui (fork screens)
- Files: modwide.js (new), index.html, tests/widetest.js (new), run.sh
- What: Range, Up Close, Charged, Kinship, Knockback, Pulling, Turncoat, Melee, Ranged, Mines, Death from Above, Primer and Exploding Rounds, each with both branches and four masteries (generic versions; per-weapon cells later). Slice-only drafts deal them too. With the no-limits setting on, a level-up lists every card you could take (modifiers, Switched at Birth, passives, defences) in a scrolling list. wup2/5/6 tests run with MM.on off (they test the retired branch screens).
- Save data: none (run state G.mwS, G.mwAny).
- Hooks: none in shared files. Wraps weapons24.js wup* hooks, power11.js p11Range, mutations.js mutBarK, game.js hurtPlayer, modifiers.js modOk/modDraw, draft.js draftLoot, ui.js UI.renderLootCards.
- Risk: power (unsimulated); Melee shortens the weapon's reach to 110; Counter cancels a hit every 3 s.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Slice only drafts (v10.74)
- Systems: draft, weapons (modifiers), mutations (sperm passives), defences
- Files: spslice.js (SLICE, sliceSkip, modOk and pdefOffer wrappers), spassives.js (spSkip -> sliceSkip), tests/spslicetest.js
- What: for testing, drafts deal only the vertical slice: 9 weapon modifiers plus Switched at Birth, 6 sperm passives (The Runs, Slipstream, Fever Pitch, Extra Mastery, Personal Space, Internal Ricochet) and Membrane Shield's 3 cards; Feats as normal; v9 upgrades, catalysts, Concentration and other defences off. SLICE.on = false restores the full pool. Tests and sims (window.TUT_OFF) keep the full pool unless SLICE.force.
- Save data: none.
- Hooks: spassives.js spSkip -> sliceSkip.
- Risk: fewer power sources while on (harder runs).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 No slot limits setting (v10.73)
- Systems: settings, weapons, mutations (sperm passives), ui (build panel)
- Files: modmatrix.js (setting row, mmFree, modOk, mmRoom), spassives.js (spSlots), buildpanel.js, tests/sptest.js
- What: a GAME tab setting (off by default) lifts weapon modifier slot and group limits and sperm passive slot limits, for testing. Weapon count (3) and masteries are unchanged.
- Save data: SET.noLimits (sd_settings).
- Hooks: none new (SETTINGS_DEF.push, SET_DEFAULTS.noLimits from modmatrix.js).
- Risk: none with it off.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Weapon level pacing, draft crash guard (v10.72)
- Systems: weapons, draft
- Files: modmatrix.js (MM.freeEvery), draft.js (draftCards skips empty candidates), tests/drafttest.js, tests/sim/wave20.js (--pre)
- What: every weapon gains a level each 4th player level (the retired upgrade screen's pacing), on top of a level per modifier card. A draft candidate that comes back empty is skipped instead of reaching the loot screen as null (a bot sim crashed in UI.sortLoot). Ships the build panel and MM.lvK changes above.
- Save data: none.
- Hooks: none new.
- Risk: wave mode is still harder than main (wave20 mortal: this branch dies at waves 5 to 15; main 20, 8, win, 15). 4 starting sperm passive slots got closest to main in sims; left at 2 pending the user.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Build panel for slots and branches; weapon level damage knob (unshipped)
- Systems: ui (build panel), weapons
- Files: buildpanel.js, modmatrix.js
- What: the build panel shows group slots (held/open), branch and mastery names, Rank IV, Personal Space's branch, and sperm slots counted as the draft counts them; the retired weapon upgrade line is hidden. MM.lvK adds 6% damage per weapon level (being tuned by wave20 sims).
- Save data: none.
- Hooks: modmatrix.js wraps weapons24.js wupStats.
- Risk: balance (lvK under test).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Slice sperm passives and pairs (v10.71)
- Systems: mutations (sperm passives), defences, weapons (pairs)
- Files: spslice.js (new), index.html, tests/spslicetest.js (new), run.sh
- What: Fever Pitch (burning kills spread Burn), Personal Space (push field; a Repel or Attract fork at Rank 2), Internal Ricochet (Membrane Shield's mastery: shots bounce inside the bubble). Pairs: Chain reaction (Connecting + Ricochet) and Not Finished Yet (Ricochet + Focused Intensity); the other half of a pair is dealt 50% more often.
- Save data: none (run state G.spB, G.spsFevT).
- Hooks: none in shared files. Wraps weapons24.js wupTick/wupKill/wupDmgMul, draft.js forkCards/draftTitle, modslice.js msRicochet, modmatrix.js modDraftCands.
- Risk: Personal Space moves enemies directly (wall-checked in campaign levels only, as the gravity well does).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Slice modifiers with branches and masteries (v10.70)
- Systems: weapons (modifiers), chemistry (Catalyst bars and reactions), ui (fork screens)
- Files: modslice.js (new), modmatrix.js (Switched at Birth checks the Chemistry slot), index.html, tests/slicetest.js (new), run.sh
- What: six new modifiers (Rapid Fire, Focused Intensity, Sticky, Connecting, Catalyst, Extra Projectiles), each with a branch fork at Rank 2 and a mastery fork (two masteries of that branch). Ricochet now bounces beams at the reflection angle; Orbiting turns a beam into a ring round you (the Laser's hula hoop).
- Save data: none (run state w.mmB, w.mmX, G.msS, G.msAny).
- Hooks: none in shared files. Wraps weapons24.js wupStats/wupFire/wupDmgMul/wupHit/wupKill/wupTick, v10.js v10Fire, fight.js fightReact, mutations.js mutBarK, modifiers.js modOk/modAdd/modDraw, draft.js forkCards/draftTitle, modcards.js modCard.
- Risk: power (stacked modifiers are unsimulated); Disco Ball and Clip Dump are strong; all new card text is TODO_COPY.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Masteries, Extra Mastery, The Runs passive, Membrane Shield levels, red Laser (v10.69)
- Systems: weapons, mutations (sperm passives), defences, fx
- Files: modmatrix.js, spassives.js, laser.js, modifiers.js (modV), pdef.js (pdHeld), draft.js (defsHeld), tests/sptest.js (new), drafttest, modcardtest, modstest, mutstest, run.sh
- What: a modifier or sperm passive at Rank 3 can take a 4th card, its mastery (one of each kind a build; Extra Mastery adds one more of either). The Runs is a sperm passive: a trail in the sample's primary damage type. Thicker Membrane and Faster Recharge are one-rank levels of Membrane Shield and use no slot. The Laser draws as a thin red beam.
- Save data: none (run state G.mmM, G.spM, G.spRuns).
- Hooks: spassives.js wraps v10.js v10Tick; laser.js wraps v10.js v10Fire. modifiers.js modV extrapolates past the last rank.
- Risk: masteries are only "one more step" of the numbers for now; The Runs stacks extra damage on every sample.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Weapon modifier matrix draft (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (new), redesign docs/README.md, redesign docs/COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md (sperm passives bullet)
- What: a 22-modifier × 26-weapon matrix with levels and masteries, from a design grilling with the user. The Runs leaves the weapon roster (becomes a sperm passive). Raises rule conflicts listed in the doc (beams don't pierce, suicide vest, long lunge, Family Ties drift, The Runs).
- Save data: none.
- Hooks: none.
- Risk: none in code; other redesign docs (MODIFIERS.md 2, BASE_WEAPONS.md, SAMPLES.md Redtail) now disagree until the conflicts are resolved.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier levels and mastery limits (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, storm-directive/NOTES.md
- What: modifiers have 3 levels plus a mastery as the 4th; up to 3 modifiers per weapon; one mastery per build unless the Extra Mastery sperm passive (costs a passive slot).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier matrix v2: scaling and shaping, Laser, 4 new modifiers (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (rewritten), redesign docs/README.md
- What: 26 modifiers × 27 weapons. Modifiers split into scaling (shared ramp: counts 1/3/6/12) and shaping (a distinct step per level). Adds Ricochet, Orbiting, Extra Projectiles and Focused Intensity, and the Laser (Ordered Online's Fire beam) from the user's voice notes.
- Save data: none.
- Hooks: none.
- Risk: none in code; BASE_WEAPONS.md needs a Laser entry and MODIFIERS.md 4 (Ricochet) disagrees (listed in the doc).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier groups, pair bonuses, Advanced Targeting to sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md, storm-directive/NOTES.md
- What: five modifier groups (Delivery, Flight, Crowd, Tempo, Chemistry); one firing replacement per weapon; look-alike distinctions; 13 pair bonuses with draft weighting; DPS and transformation checks; Charged wind-up shortens per level; Advanced Targeting becomes a sperm passive (adds "elite first" and "nearest threat").
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 One modifier slot per group (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md
- What: weapons have 5 modifier slots, one per group (replaces "up to 3 per weapon"); same-group modifiers never stack; 10 pair bonuses reworked so every pair crosses groups.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier slots unlock with weapon level (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: weapons start with 2 modifier slots and unlock the 3rd, 4th and 5th at weapon Lv 3, 6 and 9 (any unfilled group).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md (new), MODIFIER_MATRIX.md, MUTATIONS.md (superseded note), README.md, COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md
- What: 29 sperm passives replace the Genome slots (mutations and defences re-sorted one by one with the user): slots 2, then +1 at Lv 8, 16, 24; 3 levels plus a mastery; separate mastery cap from weapon modifiers; two passive pairs. Weapon mutations folded into the matrix (branches, pair bonuses). Matrix gains the branch rule (2 branches, 4 masteries per modifier; tables not yet rewritten).
- Save data: none.
- Hooks: none.
- Risk: none in code; UPGRADES.md (Genome, max 3 weapon mutations) now disagrees until updated.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Combo masteries and the push/pull field (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, SPERM_PASSIVES.md, README.md
- What: combo masteries (a modifier mastery offered only while a condition holds): Static net (Static arcs jump between your projectiles) and Planetary system (projectiles orbit Family Ties' black holes). New sperm passive: a push field that can branch to pull.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 The Runs takes the sample's primary damage type (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: The Runs' trail is in the sample's primary damage type, changeable by a type-changing passive.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Damage-type passives boost what each type does best (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md, MODIFIER_MATRIX.md
- What: Force (knockback, collisions), Acid (Acid Pools), Static (jumps and range), Mucus (Snare), Blood (wounds, Extraction; pools at mastery), Alien (possession) and Fire (spread) passives reworked; draft names written at the user's request; Static net's arc cap grows with the Static passive.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier branches written (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: all 25 weapon modifiers (3.1 to 3.14, 4.1 to 4.11) now have a Branches block: shared Lv 1, branches A and B with Lv 2, Lv 3 and two masteries each (100 endings, plus the Static net and Planetary system combo masteries), and weapon exceptions. Table headings renamed: per-weapon cells are flavour the shared branches apply.
- Save data: none.
- Hooks: none.
- Risk: none in code. Branch numbers are starting values for sims; the Branches block in each section is now the place to tune endings.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Sperm passive source (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: sperm passives come from level-up drafts only; bosses and rivals give relics (separate reward, no slot). Open: what gene boxes and elite drops give now.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Gene boxes and elite drops retired (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: gene boxes and elite mutation drops are retired; relics unchanged for now.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Implementation plan; Laser 4th starter; 3 weapons max (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md (new), MODIFIER_MATRIX.md, README.md
- What: phased build plan (vertical slice first). Laser is Ordered Online's 4th starter. Runs hold at most 3 weapons: combo bonus mounts (combos.js COMBO_MOUNTS) to be retired in Phase 1.
- Save data: none.
- Hooks: none.
- Risk: none in code yet; combos.js/fusion.js bonus mounts change in Phase 1.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Profiles retired; no base Membrane (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md, SPERM_PASSIVES.md
- What: Epigenetic Profiles retire with the gene box; runs no longer start with a Membrane (only the Membrane Shield card gives one). Plan has no blockers left.
- Save data: none yet (Profiles' META keys stay readable when retired in Phase 1).
- Hooks: none.
- Risk: none in code yet; removing the base Membrane will shift difficulty (sim in Phase 4).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Phase 0: redesign docs reconciled (docs only)
- Systems: docs only (redesign docs)
- Files: COMBAT_MATRIX.md (decisions 47 to 62, Beam row, decision 31), MODIFIERS.md, ATTACK_TYPES.md, BASE_WEAPONS.md, SAMPLES.md, UPGRADES.md, WEAPON_UPGRADES.md, README.md, IMPLEMENTATION_PLAN.md
- What: today's design decisions logged and the conflicting docs fixed (beams don't pierce, Ricochet off enemies, named exceptions, The Runs out, Laser in, sperm passives replace Genome, branch cards retired).
- Save data: none.
- Hooks: none.
- Risk: none in code.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier slots by group, sperm passive slots, the Laser (v10.68)
- Systems: weapons, draft, mutations, defences, samples, combos
- Files: modmatrix.js (new), spassives.js (new), laser.js (new), mutdrop.js, combos.js, index.html; tests: lasershot.js (new), drafttest, modcardtest, modstest, mutdroptest, mutstest, samplestest, weapons24test
- What: weapons hold one modifier per group (Delivery, Flight, Crowd, Tempo; Switched at Birth is Chemistry) in slots that open at weapon Lv 1 (2), 3, 6, 9; each modifier taken levels the weapon; modifier cards come in level-ups as well as DNA strands; the old branch screens no longer open. Switched at Birth switches to one fixed alternate type, N/A where it would spoil the weapon. Genome mutations and defences are dealt in level-ups as sperm passives (2 slots, +1 at Lv 8, 16, 24); weapon mutations and cut cards are never dealt; elite mutation drops, mid-run splices, built-in sample shields and combo bonus mounts are off. The Laser (Fire Beam) is Ordered Online's 4th starter; The Runs is off the roster.
- Save data: none.
- Hooks: mutdrop.js mdDraftSkip -> spSkip. Replaced by assignment (no shared file edited): modifiers.js modOk, modAdd; modcards.js modCardOk, modCard, sabCard, modDraftCands; weapons24.js wupLevel; genes.js genesLevel.
- Risk: big balance shift (no weapon branch cards, no built-in shields, fewer Genome slots early); weapons level more slowly (only through modifiers); Private Schooled and Not of This World lose their shields; v9 weapon tier cards still open only through modifiers.

### Folded from ccr-5e56e811-ce1r6c: 2026-10-23 Splash intro lag fix (v10.68)
- Systems: ui (splash)
- Files: splash.js
- What: the focus phase of the opening splash no longer uses a canvas blur filter (very slow in the Android WebView). The slide is drawn small and scaled up for the soft look, and the canvas resolution is capped at 1.5x.
- Save data: none
- Hooks: none
- Risk: the out-of-focus look is slightly different (softer, pixel-scaled rather than gaussian).

## v10.67: 2026-10-22 Daily Challenge card, Immune Response on Mode Select, previews on paper
- Merged: claude/determined-goldberg-3z778m.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 Daily Challenge and Immune Response back in the v10 start flow; previews on paper (v10.67)
- Systems: ui (Sample Rack, Mode Select), daily, preview, kindred
- Files: rackextras.js (new), daily.js, preview.js, eink.css, kindred.js, index.html, tests/rackxtest.js (new), tests/v9armstest.js, tests/run.sh, ARCHITECTURE.md
- What: the Daily Challenge is a card at the top of the Sample Rack (its title button went with the Figma title) and picks its sample from the v10 samples only. Mode Select has the Immune Response stepper (v9 strings), so it can be set under v10 again. Weapon previews read as white grid paper on Paper menus (the canvas is inverted with its hues turned back; Ink menus keep the dark slide). The Race fusion ceremony draws a v9 sample with the Baseline body instead of nothing.
- Save data: none (META.heat and META.heatMax as in v9).
- Hooks: kindred.js kinFuseDraw body -> Baseline for v9 samples; preview.js makePreview adds class pvpaper.
- Risk: the daily's sample for a given date changes (v10 samples only). Preview colours on paper are the inverted glows (hue kept, lightness flipped).

## v10.66: 2026-10-22 v9 samples, weapons, combos and fusions back; Dinner Time fix; suite green
- Merged: claude/determined-goldberg-3z778m.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 Dinner Time works again; red tests fixed (v10.66)
- Systems: weapons (Sister Cousin branch), tests
- Files: wup5.js, tests/wup5test.js, wup6test.js, weapons24test.js, loadouttest.js, wup1test.js
- What: a Dinner Time sibling gets a fresh range of flight with each kill, so it can reach three kills and swim home (since reach stopped growing with level on 20 Oct it ran out after two). Tests: wup5/wup6 run with the V11 power curve off like wup1 to wup4 (they test card mechanics, not pacing); wup6's egg-cap checks keep enemies off the eggs (they were flaky); weapons24test counts the 24 apart from Sample 9's and the v9 weapons; loadouttest expects the Tackle Box in the bottom row (design system v2 dock); wup1test's Hiccups average takes 4000 samples (400 failed by chance about 1 run in 20).
- Save data: none
- Hooks: none
- Risk: Dinner Time siblings fly a little longer after a kill.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 v9 samples, weapons, combos and fusions back under v10 (v10.65)
- Systems: weapons, samples, combos, ui (Sample Rack, Field Guide)
- Files: v9arms.js (new), samples9.js (new), index.html, tests/v9armstest.js (new), tests/run.sh, tests/drafttest.js, samplestest.js, ufeatstest.js, v10test.js (only v10 samples where a test assumes a Unique Feat or Baseline's starters), ARCHITECTURE.md, GAME_GUIDE.md
- What: all 64 v9 weapons not already live are back in every weapon draft (91 live weapons). The retired types are re-typed (Cooties to Alien, Oil to Fire, Water to Mucus) and each has one attack type. They have no branch cards, so their tier screens (every 4th level, internal Lv 3 / 6 / 10) offer three fitting v10 modifier cards instead, which also lets them reach Lv 5 for their combos. Their 59 Combos, 40 Pairings and 5 Super Combos (fusion ceremony) can happen again and show in the Field Guide. The 11 v9 samples sit in the Sample Rack after the v10 ones, with their v9 traits, starting abilities and starters.
- Save data: META.v9pick added (the v9 sample last picked).
- Hooks: none in shared files (rows pushed into weapons24.js W24/W24_IDS/W24_BY/W24_DESC and SAMPLES10/S10_BY/KIN.skip; wraps weapons24.js wupNextLv and wupForkCards, UI.startGame, genesStart and slPicStart).
- Risk: the 27 come up far less often in drafts (91-weapon pool). v9 weapon balance under v10 combat is untuned (8 s solo damage: median level with the 27, a few outliers both ways). About 25 combo and 11 weapon descriptions still name retired types or old weapon names (copy for the user). New copy placeholders: TODO_COPY:s9_origin, TODO_COPY:s9_family (Field Guide samples list).

## v10.64: 2026-10-22 Design system v2 port (e-ink menus, pictograms, Immersive-only HUD, Figma screens)
- Merged: ccr-ui-port (local session, applied on v10.61 and merged with main at v10.63).
- Merge: no conflicts. Tests updated to the port's intended copy and order: kindredtest (WEAPON DRAFT, LEVEL UP headings), v10test (mode order Race, Petri Dish, Endless, Level 1). Still failing, as at hand-off and not UI: weapons24test, wup5test, wup6test.

### Folded from local-ui-port: 2026-10-22 Tackle Box into the bottom row; leaner loot cards
- Systems: hud, ui
- Files: eink.css
- What: Bottom row is Rewind 52 x 52, Autorun 106 x 52, Tackle Box 52 x 52 (rounded rectangles), pause alone top-right. Loot cards drop the pin / hide (1/2, X) buttons and the sub-line (e.g. Defence | Squishy | New); the category and its swatch sit top-right.
- Save data: none (pins and hides made before still apply).
- Hooks: none.
- Risk: pinning and hiding cards is no longer reachable from the card screen.

### Folded from local-ui-port: 2026-10-22 Immersive dock revised
- Systems: hud
- Files: eink.css
- What: Feats are round keys stacked bottom-left, opposite the weapons; Rewind (64 x 52) and Autorun (140 x 52) are rounded rectangles at the bottom centre; the starting ability sits above the Feats.
- Save data: none.
- Hooks: none.
- Risk: portrait only (landscape keeps its row).

### Folded from local-ui-port: 2026-10-22 Design system v2: close match to the Figma screens, Immersive only, new intro
- Systems: ui, hud, settings, splash
- Files: dsheads.js (new), splash.js, eink.css, settings.js, samples10.js, ui.js, index.html, tests/uishots.js (new), tests/tapcycle.js
- What: Immersive is the only in-run HUD (the setting is gone). Title tiles: Field Guide first, How to Play last. Screen Header (01/02, 02/02, LV nn, IT'S A BABY!, Game Over title with Run over) on Sample Rack, Mode Select, Weapon Draft, DNA Loot, It's a Baby and Game Over, with the Figma copy (CHOOSE EXPERIMENT, BASELINE SAMPLE, WEAPON DRAFT, LEVEL UP, Level n strand | splice one gene, REROLL (n LEFT)). Mode cards: #001 left, tag right; Evolution (the Race) first, Iteration, Endless, Level 1. Sample cards show type swatches, not names. Loot cards in the Reward Card layout (rarity chip under the tile, category + swatch at the bottom). Draft loses its restating kicker and repeated description. Pause YOU stats as one ruled readout grid, BUILD and GUIDE as plain rows. Gene Bank: full numbers, Banked / Earned / Spent. Active Effects split For you / Against you. Game Over: time in the readouts, 2 x 2 buttons. New intro (splash.js): on paper, an ink eyepiece draws itself, the slide is pulled into focus, brackets lock onto you, the logo sets itself where the title has it.
- Save data: SET.immersive is now ignored (left in saves).
- Hooks: none in shared files beyond ui.js (Gene Bank readout markup, Active Effects grouping, Game Over Time cell, REROLL label) and samples10.js (mode card copy and order).
- Risk: dsheads.js wraps several UI functions; anything else wrapping them must load before it. The full HUD (top bar, minimap, event chips) is no longer reachable.

### Folded from local-ui-port: 2026-10-22 Design system v2: remaining screens, Menus copy, pictogram coverage
- Systems: ui, settings, icons
- Files: pictomap.js, eink.css, ui.js, settings.js, seqsel.js, tests/tapcycle.js
- What: Gene Bank leads with a Readout Panel (DNA banked as the hero number, earned, spent) and the next swimmer as a pictogram card. Game Over and Victory stats are Readout Panels, four per row. How to Play rows lead with pictograms. Stat upgrades (PASSIVES, 65) and the last achievement map to shared pictograms; mutation cards 171/200 (the other 29 are v9 genome cards, they show the Mutation category pictogram). Menus setting has its copy (label Menus, PAPER / INK / AUTO). Pinned action bars sit flush with the bottom edge. The v9 sequence screen (openSeq) now opens the v10 Sample Rack: it crashed on v10 profiles after a Petri Dish win (NEW SEQUENCE) and after a Sequence Reveal.
- Save data: none.
- Hooks: seqsel.js openSeq redirects to UI.openSamples under V10.
- Risk: Immune Response can only be chosen on the old sequence screen, so it is now unreachable under v10 (it already was in practice, the screen crashed).

### Folded from local-ui-port: 2026-10-21 Design system v2: Immersive HUD and 64px pictograms on every card screen
- Systems: ui, hud, icons, autorun
- Files: pictomap.js (new), eink.css, ui.js, uikit.js, loadout.js, fusion.js, samples10.js, junk.js, prestige.js, manualfire.js, tests/einkshot.js
- What: In-run HUD follows the Figma Immersive HUD: dark film keys, round weapon keys stacked bottom-right with a reload ring, Rewind bottom-left with a round RUN / directive key under it, Feats bottom-centre (manual fire: the FIRE keys take the right column). 64px pictograms lead loot and reward cards, draft options, the Tackle Box header and loadout, Field Guide rows, Gene Bank traits and starters, mode cards, autorun options (Pause RUN as option cards), achievements, active effects and junk DNA, baby traits and fusion. Card names are ink; loot titles ink.
- Save data: none.
- Hooks: ui.js refreshHud sets --f on each slot (reload ring); ui.js renderLootCards uses lootPictoHtml; manualfire.js toggles body.mfire.
- Risk: dock layout in portrait Immersive changed (landscape and full HUD keep the old row). Tests updated: einkshot (Menus rule), tapcycle (weapon keys may stack in a column). Full suite 105/109 before the tapcycle fix; still failing and not UI: weapons24test (expects 24 weapons, the pool is 27 with the Early Bird three), wup5test (Toxic Relationship share), wup6test (Eggs clutch cap).
- Also: Settings rows as stacked cards, Segmented Tabs for Pause and Settings, pinned actions stay at the bottom, Field Guide and Active Effects as full-width pictogram rows, mode cards with pictograms, draft options in three columns, baby traits as three cards, Ink tokens on Fusion / Sequence Reveal / Kindred Fuse, splash words in HUD ink.

### Folded from local-ui-port: 2026-10-21 Design system v2 in the game: tokens, pictograms, title
- Systems: ui, settings, icons
- Files: eink.css, settings.js, index.html, pictos.js (new), tests/tools/pictos.py (new)
- What: The e-ink design system is now the only menu style (eink.css always on); View is LAB / ARCADE again and a new Menus setting picks PAPER / INK / AUTO. Tokens regenerated from Figma (radii 3/5/7, 3px button rule, 31px titles, reward/state/HUD colours, text styles). All 335 Figma pictograms ship as path data (121 KB, 45 KB gzipped) with a renderer. Title: hero egg, nav as 2 x 2 pictogram tiles, Daily Challenge hidden.
- Save data: SET.menus added ('paper' default); SET.view 'eink' migrates to 'arcade' + menus 'paper'.
- Hooks: none (index.html script tag for pictos.js before wicons.js).
- Risk: every DOM screen restyles (eink.css now loads for everyone). Daily Challenge has no entry point while its title button is hidden. New copy placeholders: TODO_COPY:set_menus, TODO_COPY:set_menus_hint.

### Folded from local-wicons: 2026-10-21 Weapon icons drawn from what each weapon does
- Systems: weapons, ui
- Files: wicons.js (new), index.html
- What: the 27 live weapons (the 24 plus the three Early Bird weapons) get their own icons, drawn from what they do (a dumbbell for Maximum Gains, a nappy for Nappy Mines, a moon over a puddle for Nocturnal Emission), replacing the generic gun shapes. Same grid as icons.js: 24 x 24, stroke 1.7, in the damage-type colour. Matches Figma "Weapon Icons v2".
- Save data: none.
- Hooks: none (index.html script tag after w24look.js).
- Risk: none for play. Signature slots that carry an old weapon id get the new icon too (ICON_OF[sigOf]).
- Not shipped: no APK built (local Mac has no SPAWN_KS_PASS or Android SDK). Ship from the cloud environment.

## v10.63: 2026-10-21 Feat level-up card gains, Weapon Atlas tree
- Merged: ccr-2c93f95d-u8jz5s, ccr-e216d253-cail6q.

### Folded from ccr-2c93f95d-u8jz5s: 2026-10-21 Feat level-up card says what the level adds
- Systems: feats, draft
- Files: feats10.js
- What: the Feat "enhance" card no longer says "More of whatever it does"; `f10UpText` writes the next level's real gains (+35% damage, effect +20% and area +15% at level 2, effect +20% and cooldown 19% shorter at level 4, 5% shorter cooldown each level, and a fork notice at levels 3 and 5).
- Save data: none
- Hooks: none
- Risk: text only; numbers mirror `f10Stats` and `computeStats`, so change both if those do.

### Folded from ccr-e216d253-cail6q: 2026-10-21 Weapon Atlas rebuilt for v10.62
- Systems: tests (tools)
- Files: tests/tools/atlas/atlas.js, tests/tools/atlas/template.html, NOTES.md
- What: the Atlas also has a branching upgrade tree (weapon > 3 promises > 3 branch cards each > 3 masteries, with combos on each promise). The Atlas builder now reads the v10 data (24 weapons plus Sample 9's three, 9 samples, promise / branch / mastery cards from `WUP`, the 30 `C10` branch combos, 21 `RX10` reactions) instead of the v9 sequences and 78 weapons. Atlas artifact republished at the same URL.
- Save data: none
- Hooks: none
- Risk: none (no game code touched)

## v10.62: 2026-10-21 rescues are a race's only weapon drafts
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescues are a race's only weapon drafts; Donor DNA when mounts are full (v10.62)
- Systems: kindred, ui (Tackle Box)
- Files: kindred.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race there are no level-up weapon drafts. Rescues come at 02:00 and 05:00; their screen offers the sample's three weapons plus one of your own sample's starters you don't hold, and the pick fills an empty mount or grows one (up to 3). Skip keeps the mount free. At 08:00 and 11:00 a rescue comes only if a mount is empty (a skipped rescue or a Recycle). Recycle in a race gives its rerolls and leaves the mount for the next rescue instead of opening a draft (its button text is a TODO_COPY placeholder in races). At 08:00 or 11:00 with every mount full, a Donor DNA strand (weapon modification screen) lies out with the same beacon instead (TODO_COPY banner and source name). With every mount full, a rescue still absorbs and plays the fusion, with no weapon screen.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.renderArmoury for the Recycle text; draftBox now drops non-rescue weapon drafts in a race).
- Risk: balance: one weapon for the first two minutes (the bot sim checks survival); 3 weapons at most, by 05:00.

## v10.61: 2026-10-21 absorbed samples change your head
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Absorbed samples change your head, not just your tail (v10.61)
- Systems: kindred, samples (looks)
- Files: kindred.js, ARCHITECTURE.md
- What: each absorbed sample adds its key feature to your head (user's picks): Baseline its glowing tag; Alpha its pointed nose and ridge; Beta a crooked neck, its droplet and a big coiled tail tip; Private Schooled a gold rim and crest; Ordered Online a robot shell with a blinking light over the back of your head; Redtail a wobbling red blister (plus its frayed tail); Prawn Again a white-gold glow with rays (plus its halo); Not of This World three glowing tentacles and a glowing core; Sample 9 a steaming pink rim (it is not rescuable yet). You also draw 15% bigger per absorbed sample (`KIN.grow`; hitbox unchanged). Shown in the fusion too.
- Save data: none.
- Hooks: none new (kindred.js's slDraw wrapper now also swaps SL_HEAD for the call).
- Risk: none to play; a Not of This World player still takes no grafts.

## v10.60: 2026-10-21 rescue beacon, autorun COLLECT for every collectable
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue beacon; autorun COLLECT goes for every collectable (v10.60)
- Systems: kindred, autorun
- Files: kindred.js, render.js, tests/kindredtest.js, ARCHITECTURE.md
- What: a waiting kindred spirit sends sonar pings and a column of light, has a big bobbing arrow over it on screen and a gold edge badge (a sperm inside, an arrow out) off screen, and nudges you (sound, buzz, marker swells) every 20 s. Autorun on COLLECT now heads for it first, chases mutation carriers, and goes for pickups and XP beyond its old reach.
- Save data: none.
- Hooks: render.js drawHud -> kinPointers() (no argument now). kindred.js also wraps autorun.js arGoal.
- Risk: COLLECT runs swim further for loot, so they meet more enemies.

## v10.59: 2026-10-21 eInk view, Sample 9 copy, rescue copy
- Merged: claude/exciting-allen-oy8n9q (eInk view), ccr-cbe5a578-nzu9tn (Sample 9 copy), ccr-455e7cea-1tppwd (rescue copy drafts). Suite: 105 passed; weapons24test and wup5test fail as before the merge (they expect 24 weapons; Sample 9 makes 27).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue copy drafted (v10.58)
- Systems: kindred, samples
- Files: kindred.js, samples10.js
- What: the two rescue placeholders filled with Claude-drafted lines (the user asked for drafts): the spawn banner "ONE OF YOUR OWN, STRANDED" and the locked-sample hint "Rescue it when it turns up stranded in The Race." Awaiting the user's read-through.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-exciting-allen-oy8n9q: 2026-10-21 eInk view always light (v10.52)
- Systems: style, settings
- Files: settings.js, tests/einkshot.js, ARCHITECTURE.md
- What: eInk view is always Paper (light), whatever the phone's dark setting.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-exciting-allen-oy8n9q: 2026-10-21 eInk view (v10.51)
- Systems: style, settings, ui
- Files: eink.css (new), fonts/Barlow-*.ttf + OFL.txt (new), style.css, index.html, settings.js, ui.js, tests/einkshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: Merged the e-ink UI archive. Settings > View now has a third option, EINK: every DOM screen and the HUD use the Figma e-ink design system (grey paper, 2px ink rules, Barlow, no glow or grain; Ink mode, AMOLED black, when the phone is in dark mode), over the Arcade slide. style.css's hardcoded greys now use the colour tokens (Lab and Arcade look the same as before, near enough).
- Save data: SET.view gains the value 'eink' (no new keys).
- Hooks: ui.js applySettings -> applyEink(); index.html loads eink.css (media off) after style.css.
- Risk: viewArcade() is true in eInk view, so everything gated on Arcade (full colour, rings, Immersive AUTO) applies. TODO_COPY:set_view_eink_hint open. Barlow adds about 530 KB to the APK.

### Folded from ccr-cbe5a578-nzu9tn: 2026-10-20 Sample 9 copy dropped in (v10.51)
- Systems: weapons, samples, feats
- Files: acrocopy.js (new), acro.js, acrosample.js, index.html, ARCHITECTURE.md
- What: all 143 Sample 9 strings (sample card, Premature Evaporation Feat and forks, X9 Watched Pot and forks, three weapons, 45 branch cards) now come from `ACRO_COPY`; no `TODO_COPY` left in play. Written by Claude at the user's request, so the user may want to rewrite.
- Save data: none
- Hooks: acro.js / acrosample.js `T()` reads `ACRO_COPY[id]`
- Risk: none beyond copy quality; limits checked against SAMPLE_9_ACRO.md section 6.

## v10.57: 2026-10-21 V11: kindred spirits, one pick per screen, power curve
- Merged: ccr-455e7cea-1tppwd (v10.51 to v10.57).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 V11 power curve: no early one-shots, range falloff, per-level gains (v10.57)
- Systems: power11 (new), combat
- Files: power11.js (new), index.html, tests/p11test.js (new), tests/fighttest.js, tests/wup1test.js, tests/modstest.js, tests/ufeatstest.js (curve off: they test exact mechanics), tests/tools/guide.js, ARCHITECTURE.md
- What: until 2:00 one hit can take at most half a germ's or elite's health (lifting by 5:00; branches and mutations still multiply past it); damage against germs starts at 70% and reaches full by 10:00; early germs have x2 health, back to normal by 8:00; each level gives +0.5% damage, +0.5% attack rate and +1.5 max health; direct hits beyond 220 units lose damage, down to 55% at 600. Only your weapons' and Feats' hits (src.w); hazards, terrain and events are untouched. Bosses and rivals keep their tuning (range still applies). Sims: early one-shots ~90% -> 0 to 10% for every starter (median 2 to 3 hits); bot deaths unchanged (mostly 6 to 8 min either way).
- Save data: none.
- Hooks: none in shared files (wraps game.js makeEnemy, fight.js fightHit, juice.js levelJuice).
- Risk: balance in every v10 mode (Petri Dish and Endless too); Level 1 not checked; long-range weapons lose up to 45% on far targets.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Weapon branch screens back (v10.56)
- Systems: weapons (branch screens), ui
- Files: sidemo.js, tests/kindredtest.js
- What: weapon upgrade tiers open in the Weapon Draft layout again, with a tab and a live scene per branch (`SIV_DRAFT` true). Mutations and modifications stay plain cards.
- Save data: none.
- Hooks: none.
- Risk: the v10.44 run that stalled did so as this screen opened; watch the run log's fps line.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue made a big deal: portrait, pick or skip, fusion animation (v10.55)
- Systems: kindred, ui (reward screens)
- Files: kindred.js, v11ui.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: the rescue's Weapon Draft screen shows the rescued sample swimming at the top; pick one of its weapons or skip; either way a fusion plays (the two swim together, flash, and your new grafted body swims out, with both names). Paused throughout; tap to close after 2.6 s, closes itself at 5 s.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.openDraft and UI.pickLoot; v11ui.js v11Skip calls kinFuse).
- Risk: none beyond the screens; the fusion borrows the drawing globals for its frames (as slPicDraw does).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 One pick per screen; stacked rewards come back to back (v10.54)
- Systems: reward director, ui (reward screens)
- Files: director.js, v11ui.js, v10.js, tests/drafttest.js
- What: waiting level drafts no longer merge into a four-card take-two screen. Every screen offers three cards and one pick; with two or three rewards waiting, closing (or skipping) one screen opens the next at once, then the usual 30 s gap resumes. The no-sample start draft offers three, not four.
- Save data: none.
- Hooks: none new (v11ui.js listens on #skipBtn).
- Risk: more screens in a row after a big XP burst (they were merged before); `DIRECTOR.merge = true` brings take-two back.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 V11 headings, skippable weapon drafts, earlier rescues, fewer race drafts (v10.53)
- Systems: ui (reward screens), kindred, engine (levelling)
- Files: v11ui.js (new), kindred.js, game.js, index.html, tests/kindredtest.js, tests/drafttest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: reward screens head by kind (CHOOSE AN UPGRADE, CHOOSE A WEAPON, UPGRADE A WEAPON, CHOOSE A MUTATION); every weapon draft but the first has SKIP (+2 REROLLS), leaving the mount empty. Rescues at 03:00 and 06:00. A race grows a weapon mount only at Lv 5 (no Lv 12 draft): four weapon drafts a race (first, Lv 5, two rescues).
- Save data: none.
- Hooks: game.js levelling -> kinSlotLv (the SLOT_LEVELS check).
- Risk: race balance (one fewer level-up weapon, rescues 2 to 4 minutes earlier); the Build panel and pause screen still name Lv 12 as the next draft in a race.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescued samples change your body; one card screen for upgrades (v10.52)
- Systems: kindred, samples, ui (reward screens), weapons
- Files: kindred.js, boxlook.js, sidemo.js, tests/kindredtest.js, tests/sivtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: an absorbed sample grafts onto your body (your tail in lengths: yours, then each rescued sample's; Not of This World a glow; Prawn Again its halo). The rescue pick now uses the Weapon Draft screen, like the starting weapons. Weapon upgrade tiers, mutations and modifications all use the plain card screen (flags `SIV_DRAFT`, `BOX_LOOK_ON` bring the old screens back).
- Save data: none.
- Hooks: none new; kindred.js also wraps samplelooks.js slDraw.
- Risk: other branches working on sidemo tier screens or boxlook heads will find them switched off.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Kindred spirits: sample rescue and absorption in The Race (v10.51)
- Systems: kindred (new), samples, weapons, ui
- Files: kindred.js (new), samples10.js, sigweap.js, render.js, index.html, tests/kindredtest.js (new), tests/samplestest.js, tests/v10test.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race a stranded sperm of another sample appears at 05:00 and 10:00 with an edge chevron; touching it absorbs it (its passive runs beside yours, its three weapons join the run's pool, it unlocks as a starter) and opens CHOOSE YOUR DIFFERENCE, where one of its weapons goes on a new mount. Race weapon drafts only offer carried samples' weapons. The old sample unlock watches (wave 10, a Mythical box and so on) are retired.
- Save data: META.s10 now also written by rescues; no keys added.
- Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool (filter). samples10.js passives read s10Has instead of G.s10.id.
- Risk: balance (a 4th and 5th weapon mount by 10:00; absorbed passives stack); slot drafts in a race often deal one card (your own remaining starter). weapons24test already failed on main (27 weapons with Acro).

## v10.50: 2026-10-20 bubble hitbox, between-wave close-up, glossary, voice check
- Merged: claude/affectionate-cerf-6ris1m, claude/dazzling-bohr-o55gfr, ccr-be55daae-goa9o3, claude/kind-faraday-bpyfxx (You check tab in Card_Copy_Draft_All.xlsx; Alpha and Prawn Again exempt from the "we" voice rule).

### Folded from claude-affectionate-cerf-6ris1m: 2026-10-20 Membrane bubble is a hitbox again (v10.49)
- Systems: combat (pdef), enemies, projectiles
- Files: pdef.js, game.js, tests/bubblehit.js (new)
- What: while your shield (Membrane) is up, the bubble is solid. Enemies touch it at its edge (not your body), are held outside it and shoved back (heavier ones less, bosses barely). Enemy shots stop at its edge and the Membrane soaks them. With the Rubber Johnny relic the bubble also throws each stopped shot back out at the mirrored angle as a player shot (the v9 skin did this; `!V10` had switched it off). Once the Membrane breaks, the bubble is gone and contact is on your body as before.
- Save data: none.
- Hooks: game.js updateEnemies -> pdefBubbleR / pdefBubbleBounce (contact radius); game.js enemy-bullet loop -> pdefBubbleR / pdefBubbleReflect (hit radius).
- Risk: balance. Contact and bullet hit radius is now the bubble's (38 units vs body ~13) while a shield is up, so the Membrane drains a little sooner; enemies can no longer body-block you inside the bubble. Sims not run.

### Folded from claude-dazzling-bohr-o55gfr: 2026-10-20 Close-up between waves; tutorial cards pan to terrain and the egg (v10.49)
- Systems: wave-mode, camera, tutorial
- Files: restcam.js (new), game.js, bosses.js, tutorial.js, index.html
- What: while the next-wave button shows, the camera zooms in on your sperm and sits low of it so the button does not cover you; it eases back out when the wave starts. Terrain and egg tutorial cards now pan and zoom to the thing they explain (they used to spotlight you).
- Save data: none
- Hooks: game.js update -> restCamTick (camera line); bosses.js updateBossIntro reads I.zk
- Risk: ZOOM.z is written directly during the rest (not saved); pinching during the rest becomes the new base zoom.

### Folded from ccr-be55daae-goa9o3: 2026-10-19 Glossary: v10 combat terms
- Systems: ui (glossary)
- Files: glossary.js
- What: Held loot cards now explain Poise, Alien bar (Possessed), Burn bar (Ignition), Corrosion, Membrane, Shell, Squishy, Thorns, Evasion, Snared, Conjoined and Bleeding (Extraction). Second pass: the six attack types, bars, run terms (sperm count, egg, Final Five, Fever Pitch, Behind pace, Stamina, Chrono energy), all 24 field pickups, terrain, big hazards and wave conditions. Charged text updated for v10.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## v10.48: 2026-10-20 local work merged (card copy, Sample 9 and tuning, consciousness gifts, design system, Ordered Online nanobot)
- Merge notes: main's feats9.js Feats (Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb, Ear Candling) removed in favour of the local builds with the user's copy (feats10.js, gifts10.js); fitcheck.js uses the new card names; voice canon ("we" mostly, "you" to blame, "I" when selfish) written into voice_and_tone.md, VOICE_GUIDE.md, CONSCIOUSNESS.md, redesign docs CLAUDE.md and COMBAT_MATRIX.md.

### Folded from local-card-copy: 2026-10-20 Card copy: names, descriptions and per-sample voice lines (not shipped)
- Systems: weapons, feats, mutations, modifiers, combos, draft, ui
- Files: cardvoice.js (new, generated), tests/tools/copy/cardvoice.py (new), feats10.js, mutations.js, combos10.js, modifiers.js, wup1.js to wup6.js, weapons24.js, draft.js, modcards.js, combos.js, sandbox.js, fitcheck.js, aldemo.js, asdemo.js, bldemo.js, fbdemo.js, mfdemo.js, scdemo.js, index.html, style.css, tests/wup2test.js, tests/wup4test.js, tests/wup5test.js
- What: 477 cards get the user's approved copy from Card_Copy_Draft_All.xlsx: new names and "what it does" text, and a consciousness line per sample (three for Not of This World, by active damage type) shown in each card's italic quip. Feat cards no longer prefix their old generic line to the description. Promise cards skip the "Costs:" suffix when the new text already carries the cost (costs fields unchanged).
- Save data: none. (A run saved mid-way keeps old branch names in w.up.l6/l10; harmless, only text lookups.)
- Hooks: draft.js cardOpt and weapon fork cards -> quip: cardVoice/cardLine; weapons24.js wupForkCards card() -> quip; modcards.js modCard -> quip; combos.js optCombo -> quip; sandbox.js sbDraftInfo shows o.quip; feats10.js feat() text = d.does.
- Risk: renamed weapon cards are matched by name in fitcheck.js and the *demo.js flag maps (updated per weapon); tests/tools/guide.js prose and fitcheck.js FIT_TEXT (The Runs' Static versions) still use some old names and old text.

### Folded from local-sample9: 2026-10-20 Range stops growing with level (not shipped)
- Systems: engine
- Files: game.js
- What: long-range weapons stay at REACH_START (300, about a phone's half-width) at every level instead of growing 30 a level to their full range (Acid Spit was 300 / 390 / 440 by tier), so kills happen on screen. Range upgrade cards still multiply it.
- Save data: none.
- Hooks: none (one line in computeStats).
- Risk: every long-range weapon is weaker from tier 2; balance shifts for all samples (bot sim below is noisy at 4 runs a sample).

### Folded from local-sample9: 2026-10-20 Sample 9 (proposed): sample, three weapons, 45 branch cards, tuning (not shipped)
- Systems: acro, acrosample, samples, weapons24, feats10
- Files: acro.js (new), acrosample.js (new), index.html
- What: Sample 9 (Acid / Fire, all text TODO_COPY): its three weapons (acro_cap, acro_spray, acro_spark) join the roster with their branches; the sample itself (passive, Unique Feat, exclusive gift X9, unlock, body, cosmetic lurch). Tuned after bot sims: Feat penalty -25% for 4 s (was -50% for 6 s); cap 34, spray 8 per pellet, beam 4 per tick. Spec: redesign docs/SAMPLE_9_ACRO.md.
- Save data: META.s10.acro (unlock), META.s10runs.acro.
- Hooks: none in shared files; wraps wupStats, wupFire, wupDmgMul, wupHit, wupKill, wupTick, hurtPlayer, s10Hit, s10DmgMul, s10Tick, sampleLook.
- Risk: roster is 27 weapons; any sample can draft the three. TODO_COPY strings show in the UI until the copy is written.

### Folded from local-sample9: 2026-10-20 Van de Graaff Feat (not shipped)
- Systems: feats
- Files: feats10.js
- What: the re-gifted Van de Graaff (FEATS.md F6) is built and in the starting pool; Lv 5 fork text TODO_COPY.
- Save data: none.
- Hooks: none (f10Tick and f10Draw call its own functions in feats10.js).
- Risk: one more Static Feat in the draft.

### Folded from local-sample9: 2026-10-20 Beams pass Charge arcs every 3rd hit (not shipped)
- Systems: combat
- Files: fight.js; redesign docs/COMBAT_MATRIX.md (decision 45, sections 4 and 11.5 Charge rows), tables/*.csv (re-exported)
- What: a Beam's Static hits pass Charge arcs on only every 3rd hit, counted per weapon (fightBeamArcOk). Red Flagship at level 1 (weapon arena, XP frozen): 65 to 75 damage a second before, 61 to 72 after; its arc share 19-22% to 14-15%. Every other attack type unchanged.
- Save data: none.
- Hooks: none (one helper in fight.js, called from fightStatus).
- Risk: Red Flagship's Static-arc branch cards and combos (Static Cling, Crossing the Streams) see a third of the arcs from beams.

### Folded from local-sample9: 2026-10-20 Beam base damage 3.5 to 3 (not shipped)
- Systems: v10, weapons
- Files: v10.js (V10_ATK.beam.base.dmg)
- What: the matrix beams' base damage drops 15%. Live, that is only Red Flagship (Soulmate Signal and Sample 9's beam set their own). Red Flagship at level 1, XP frozen: 61 / 72 damage a second (standing / circling) after decision 45, 56 / 62 after this; field: Standard Issue 47 / 50, Nervous Wreck 45 / 78, Acid Spit 33 / 40.
- Save data: none.
- Hooks: none.
- Risk: the archived matrix beams (Lab Bench, Switched at Birth targets) drop too.

### Folded from local-sample9: 2026-10-20 Chain jumps don't pass Charge arcs (not shipped)
- Systems: combat, engine
- Files: fight.js (fightArcOk, was fightBeamArcOk), game.js (doChain tags jumps chainHop); redesign docs/COMBAT_MATRIX.md (decision 46, Charge rows), tables/*.csv
- What: only a chaining attack's first hit passes Charge arcs on; its jumps (doChain and the chaining modifier) don't. Unwanted Contact at level 1, XP frozen: 96 / 86 damage a second (standing / circling) before, 84 / 81 after; its arc share 30% to 17%.
- Save data: none.
- Hooks: none new (doChain adds a src flag).
- Risk: Static Cling combos and Unwanted Contact branch cards that lean on arcs from jumps lose some of them.

### Folded from local-sample9: 2026-10-20 Unwanted Contact damage 13 to 11 (not shipped)
- Systems: weapons
- Files: sigweap.js (sigReg 'tesla' base override; the archived Static Cling def keeps 13)
- What: Unwanted Contact at level 1, XP frozen: 84 / 81 damage a second (standing / circling) after decision 46, 70 / 69 after this. Field in the same test: Red Flagship 60 / 61, Nervous Wreck 43 / 77, Acid Spit 56 / 43, Standard Issue 41 / 46.
- Save data: none.
- Hooks: none.
- Risk: Redtail's starter is weaker; Redtail averaged wave 10.0 in the last big sim, before these Static changes.

### Folded from local-sample9: 2026-10-20 Autorun KITE keeps your reach; targets count from their edge (not shipped)
- Systems: autorun, engine
- Files: autorun.js (arKite, new arReach), game.js (acquire and acquireMany range checks)
- What: KITE's band (240 / 360 / 450) now scales to your longest weapon reach (65% / 85% / 95%, never more than before); with nothing within 420 it closes in on the nearest enemy (that branch could never run before); with a boss alive it closes until the boss's edge is in reach. acquire and acquireMany count an enemy in range when its edge is (range + its radius); shots, beams and chains already hit on contact with the edge, so a picked big target is hittable. Bot, Baseline, 12 instrumented mortal runs each: average wave 11.1 to 12.9, worst run 5 to 9, boss in reach 51% to 62% of boss-fight time; damage share on the boss unchanged (24% to 25%: the aim still picks the escorts).
- Save data: none.
- Hooks: none.
- Risk: player autorun KITE plays closer with short-range weapons; every weapon can now pick big targets slightly further away (by their radius).

### Folded from local-sample9: 2026-10-20 Default aim prefers the boss (not shipped)
- Systems: autorun, engine, ui
- Files: autorun.js (aimDir), game.js (targetScore 'bossfirst'), ui.js (both aim menus set w.dirSet)
- What: a slot on its default NEAREST aim (no tie-breaker, never set in an aim menu) aims at a boss in reach before its escorts while a boss is alive. Bot, Baseline, 12 instrumented runs: damage on the boss 25% to 44%, boss fights won in 50 s on average (was 135 s), but average wave 12.9 to 11.3 (7 of 12 died at the wave-10 boss, to its own attacks: death stare, contact, bullets). Net: shorter boss fights, no gain in how far the bot gets.
- Save data: none (w.dirSet is per run).
- Hooks: none new.
- Risk: players on default aim now shoot the boss over nearer escorts; choosing any aim (even NEAREST) turns it off for that slot.

### Folded from local-sample9: 2026-10-20 Autorun bullet dodging looks further ahead (not shipped)
- Systems: autorun, engine
- Files: game.js (autoSteer: STEER_BUL, bullet radius 300 to 420)
- What: each candidate heading checks bullets at four moments (0.1, 0.225, 0.45, 0.675 s) instead of two, and sees bullets from 420 instead of 300. Bot, Baseline, 12 instrumented runs: average wave 11.8 (spread 3.6), against 11.3 with boss-first aim alone: no measurable change.
- Save data: none.
- Hooks: none.
- Risk: slightly more steering work per frame (4 checks per bullet per heading, more bullets in range).

### Folded from claude-consciousness-gifts: 2026-10-20 X5, X7, X8 to full spec; five old test failures fixed
- Systems: feats10, tests
- Files: gifts10.js, tests/featstest.js, drafttest.js, samplestest.js, ufeatstest.js, v10test.js
- What: X5 also slips chargers' and bosses' aimed wind-ups, and the attack it dodged hits its own side (areas when they go off, dashes for 1.6 s). X7's copies fire your real first weapon (an echo slot at half damage, three quarters with Muscle Memory) and count towards the 8-pet cap (wraps sigweap.js sigPetCount). X8 also clears a Complement Protein's mark (G.complT). Tests: featstest's pool is 16 (Van de Graaff), with tests for Van de Graaff, X9 and the three spec details; drafttest accepts the tabbed tier screen a lone weapon opens; samplestest, ufeatstest and v10test allow the PROPOSED Sample 9.
- Save data: none.
- Hooks: none in shared files (adds a sigPetCount wrap).
- Risk: X7 fires the weapon from the copy by moving the player for one call; a weapon with side effects on the player (a lunge) could misbehave. Supersedes the "Simplified against the spec" note below.

### Folded from claude-consciousness-gifts: 2026-10-20 Doc names for two Feats, Feat-line ownership, run.sh on macOS
- Systems: feats10, card voice, tests
- Files: feats10.js, giftvoice.js (regenerated), tests/tools/copy/giftvoice.py, tests/tools/copy/cardvoice.py, tests/run.sh, CLAUDE.md
- What: Comfort Eating is More! again and Clean Plate is COME BACK HERE (decision 45). Feat card lines are owned by the docs via giftvoice.py, the sheet keeps every other card (decision 46). run.sh runs on a Mac: no `timeout` needed, and it shims playwright-core into out/.pw when `playwright` is missing (nothing installed).
- Save data: none (Feat ids unchanged).
- Hooks: none.
- Risk: anything keyed on the two old titles (none found outside the generated tables).

### Folded from claude-consciousness-gifts: 2026-10-20 Consciousness gift lines, exclusive gifts and six new Feats
- Systems: feats10, card voice, samples10
- Files: gifts10.js (new), giftvoice.js (new, generated), tests/tools/copy/giftvoice.py (new), samples10.js, index.html, tests/featstest.js, ARCHITECTURE.md
- What: every Feat card now shows the approved per-sample gift line from the redesign docs (GIFT_LINES.md, FEATS.md 3), replacing the sheet's Feat lines; Alpha's Red Flagship Lv 3 lines and the Alpha, Beta and Ordered Online sample lines (Ordered Online is now a synthetic nanobot: origin and Scientist line) follow the docs. The eight sample-exclusive gifts X1 to X8 are drafted for their own sample only, and THIS WAY, Capacitation, Bombardier Beetle, Spinnbarkeit, Wandering Womb and Ear Candling join the later unlocks. Level 5 forks for all fourteen were written in code (the docs list level 3 only). The card text for the fourteen (does lines, fork names and descriptions, pops) was written by Claude and approved as written by the user on 20 Oct.
- Simplified against the spec: X5 dodges only the telegraphs newfoes.js exposes (G.nfBurst, wind-ups) and the dodged attack does not hit its own side; X7's copies fire bolts of the first weapon's damage type at half damage (at most two copies; they do not count towards the pet cap); X8 reacts to statuses only, not marks.
- Save data: none.
- Hooks: none in shared files (wraps f10Hurt, f10Kill, f10Tick, f10Draw, arGoal, sampleLook).
- Risk: Card_Copy_Draft_All.xlsx's Feat lines are now overridden: rerunning cardvoice.py alone no longer changes Feat lines (run giftvoice.py). Balance of the new gifts is untested by sims. Ordered Online's body still draws the old frosted look (samplelooks.js): the nanobot look is follow-on work.

### Folded from local-design-system: 2026-10-20 HUD, loot cards and boss card through the kit
- Systems: ui, uikit, hud
- Files: uikit.js, ui.js, index.html, ARCHITECTURE.md
- What: the HUD overlay (uiHud: uiHudKey, uiWeaponSlotClass/Inner, uiRewindButton, uiToast, uiSystemMessage) and the boss introduction (uiBossIntro, uiBossCard) moved out of index.html into builders; uikit.js fills #hud and #bossIntro as it loads, with every element id unchanged. Loot and weapon-upgrade card bodies use uiLootCard, the section labels uiLootSection. Screens pixel-identical; 17 tests pass (quick, hudshot3, bossshot, bosstest, rewindtest, loottest, mythtest, overtest, tapcycle, introtest, rivintro, newtut, tuttest, settabs, autotest, putest, wup1test).
- Save data: none
- Hooks: none (uikit.js now fills #hud and #bossIntro at load)
- Risk: low. Anything that adds elements to #hud must run after uikit.js loads (all current code does: it runs from ui.js init or later).

### Folded from local-design-system: 2026-10-20 Last lists and chip rows through the kit
- Systems: ui, uikit
- Files: ui.js, aimat.js, junk.js, samplelooks.js
- What: the Combos, Pairings and Damage-type synergies lists and the Autorun directive chips (ui.js), the whose-mess chips (aimat.js), the Junk DNA list (junk.js) and the Field Guide samples list (samplelooks.js) now use uiList/uiChips/uiChip/uiHint. No hand-written .list or .chips markup is left in web/js. Screens pixel-identical; 16 tests pass (adds aimowntest, pairtest).
- Save data: none
- Hooks: none
- Risk: low.

### Folded from local-design-system: 2026-10-20 Every menu panel through the kit
- Systems: ui, uikit
- Files: uikit.js, ui.js, loadout.js
- What: the 21 panels that are filled over several statements now open and close with uiPanelOpen()/uiPanelClose(), and the settings row uses uiPanel; no hand-written .sec markup is left in ui.js or loadout.js. Screens pixel-identical; the same 14 tests pass.
- Save data: none
- Hooks: none
- Risk: low.

### Folded from local-design-system: 2026-10-20 UI builders from the design system
- Systems: ui, uikit
- Files: uikit.js (new), ui.js, loadout.js, pinhide.js, samples10.js, inspect.js, v10.js, sandbox.js, index.html, ARCHITECTURE.md
- What: menus now build their HTML through one builder per design-system component (uikit.js, 15 builders, 203 call sites). Output is the same elements and classes as before: all 35 screen captures (portrait and landscape) are pixel-identical and quick, settabs, setshot, loottest, loadouttest, inspecttest, porttest, logtest, stpanel, glosstest, youshot2, overtest, finaletest and sbtest pass. Not converted at the time: 21 split panels (since done, above), 5 lists and 1 chip row with classes glued to expressions, and the HUD, loot cards and boss card (built as DOM or static HTML in index.html).
- Save data: none
- Hooks: none (index.html: uikit.js after settings.js)
- Risk: low; markup is unchanged. Anything new that builds a menu should use the builders.

### Folded from local-design-system: 2026-10-20 Design-token layer in style.css
- Systems: ui
- Files: style.css, look10.js (comment), data.js (comment)
- What: one :root block of tokens named like the Figma variables (colour, space, radius, surfaces); the three old :root blocks folded in, older names (--xw, --dim, --r, --line ...) kept as aliases; 308 declarations that a later rule with the same selector always overrides removed; 121 hex colours swapped for tokens. Screens pixel-identical. 229 one-off colours left as they are (no matching token).
- Save data: none
- Hooks: none
- Risk: low.

### Folded from claude-ordered-nanobot: 2026-10-20 Ordered Online drawn as a synthetic nanobot (not shipped)
- Systems: samplelooks, orderedlook (new)
- Files: orderedlook.js (new), samplelooks.js (old Ordered Online head and tail removed, header comment), index.html, ARCHITECTURE.md
- What: Ordered Online's body (in a run, on the sample card, in the Field Guide and pause portrait) is a machine (SAMPLES.md 5, decision 43): a segmented glossy silver shell with a seam down the head, panel gaps, a lens and a cyan status light on a jointed servo midpiece (amber after a glitch, red when hit); a tail of rigid links whose wave moves in exact steps (4 poses a beat, about 11 steps a second); a two-frame twitch every 2.5 to 6 s; on a corner the head leads past its heading, holds 0.12 s, then corrects in one step. Its Mucus trail gets a glossy gel band and a specular line on top. All cosmetic: hitbox, swim physics, kit, passive, Feat and trail rules unchanged.
- Save data: none.
- Hooks: none in shared files; replaces SL_HEAD/SL_TAIL.ordered, adds SL_UNDER.ordered, sets SL.ordered.beat 0.45 (visual beat only), wraps f10Draw.
- Risk: none to balance. The trail sheen is drawn in v10Draw (over zones, under you); a branch that edits SL_HEAD.ordered in samplelooks.js would be overridden by orderedlook.js.

## Unreleased: every weapon can take Switched at Birth


### Folded from claude/lucid-allen-vr25lv: 2026-10-20 Pick feedback on take-more-than-one card screens
- Systems: ui (card screens), rewards
- Files: pickfeel.js (new), ui.js, index.html, style.css
- What: Screens where you take two cards show an "n/2" chip. The card you took stays visible with a tick and a held glow; the remaining cards pulse an outline. Cards also squash on press.
- Save data: none
- Hooks: ui.js openLoot -> pfInit; ui.js pickLoot -> pfTaken
- Risk: the old 30% dim on the taken card is gone. Chip copy is Claude-drafted; replace if you prefer your own.

### Folded from claude-adoring-edison-w5x7ky: 2026-10-20 Fill v9 TODO_COPY placeholders
- Systems: feats, upgrades, mutations
- Files: feats9.js, v9back.js
- What: 33 placeholder strings replaced with written copy (6 Feat descriptions, 12 level 5 forks, Headstrong, Character Building, Mood Swings).  Also: Van de Graaff and Wandering Womb text now match their code; Character Building no longer grants armour (armour is retired in v10).
- Save data: none
- Hooks: none
- Risk: Character Building loses its armour clause (tiny balance shift).

### Folded from ccr-b4817013-jgeigi: 2026-10-20 Switched versions for every status-bound weapon
- Systems: fitcheck, upgrades, tests
- Files: wup2.js, wup3.js, wup4.js, fitcheck.js, tests/switchtest.js (new), tests/wup2test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick every weapon. The seven whose branches run on their own status switch only to one type with its own version: Acid Spit to Mucus (Snowball), Nocturnal Emission to Alien (Ectoplasm), Hot Mess to Blood (Crime Scene), Rent Free to Force (Poltergeist), Unwanted Contact to Fire (Wildfire), plus The Runs (Static) and Little Prick (Alien) from earlier. Mass Hysteria and Possession Fee are no longer hidden after a switch (they never needed Alien); Nappy Mines hides only Flare Up.
- Save data: none.
- Hooks: none (w2Snot/w2Ecto in wup2.js, w3Scene/w3Polter in w3BarFrac, ucWild in wup4.js ucChain; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: card and callout text for the new versions are drafts (user keeps them for now and edits in place: fitcheck.js FIT_TEXT, floatText calls in wup2/3/4/6.js); untested for balance.

## Unreleased (merged to main without a build or test run): 2026-10-20 v9 Feats, upgrades and mutations back in v10
- Systems: feats9 (new), v9back (new), feats10, draft, mutation drops
- Files: feats9.js (new), v9back.js (new), feats10.js, draft.js, mutdrop.js, v10.js, index.html, tests/featstest.js, tests/v9backtest.js (new), tests/run.sh
- What: (card text for the six new Feats' descriptions, their level 5 forks, Headstrong, Character Building and Mood Swings is TODO_COPY, waiting on the user's copy.) The six v9 Feats FEATS.md picked but never built (Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb, Ear Candling) are in, with level 3 and 5 forks, and Hagfish and Running With Scissors join the starting pool (it was waiting on an unlock system that doesn't exist). 15 v9 upgrades that change how you play (Last Word, Tunnel Vision, Overachiever, Pincer Movement, Hurry Up, Stubborn Streak, Big Boned, Muscle Memory, Big Lungs, Cardio, Tactical Nap, Spoilers, Separation Anxiety, Headstrong, Snooze Button) are draft cards again, and 29 v9 mutations are back in the elite mutation drops.
- Save data: none (G.passives, G.mut and META.muts as in v9).
- Hooks: v10.js v10Tick -> f9Tick, v10Draw -> f9Draw; draft.js grp 'up' (DRAFT.groupW.up 0.6); mutdrop.js mdIsMut also takes 'g_' ids.
- Risk: more power in a run (bot sim: death wave 9.7 -> 11.8, 0 wins both); fewer v10 mutations per elite drop (29 more in the pool); the Feat starting pool is 23, so each Feat turns up less often.

## v10.46 (versionCode 325): merge of `ccr-d549bf1a-tq7f9u` into `main` (narrator voices, Immersive whispers)

### Inner voice says "we"; shape-shifting cloud; Immersive whispers (v10.44)
- Systems: voice (voice.js, voice10, new whisper.js), narrator copy (data.js LONGING_LINES, show.js), ui, docs (VOICE_GUIDE, voice_and_tone)
- Files: whisper.js (new), voice.js, data.js, show.js, ui.js, inspect.js, index.html, style.css, tests/wstest.js (new), tests/veilshot.js, ARCHITECTURE.md
- What: The inner voice now speaks as "we" (it and the sperm are a team): every consciousness line, sighting, status hint and campaign longing line is rewritten, and the canon in VOICE_GUIDE says so. Its black cloud shape-shifts (core and colour fringe morph out of step). In Immersive, Scientist and inner-voice lines no longer pop up: a small indicator appears (a black cosmic blob, or a LOG chip for the Scientist); tapping it reveals the line and runs the slide at 10% until the line is tapped or times out. Unread lines fade after 30 s.
- Save data: none.
- Hooks: ui.js sysmsg queue -> wsTake; inspect.js inspectMul -> wsMul; index.html whisper.js after voice10.js.
- Risk: In Immersive, a player who never taps misses the lines (by design). The 10% slow-down multiplies the game speed while a line is open; autorun keeps playing behind it.

### Narrator voices: one story, two looks (v10.43)
- Systems: narrator (voice10, show), ui, copy (data.js achievements, card quips, sponsors), sequences (seqreveal)
- Files: voice10.js, show.js, ui.js, data.js, seqreveal.js, style.css, tests/veilshot.js (new)
- What: Narrator messages now carry who is speaking. The Scientist shows as the plain lab panel with a "LAB LOG · 1B" header; the inner voice is a pitch-black cloud with a soft, breathing cosmic colour fringe and italic text. Both voices now show in Immersive mode (which hid every narrator line by default). Copy that broke "he works alone" is rewritten: Funding is now Data (no £), research grants and sponsors are things found around the empty lab, Peak viewers is Peak data, achievements, card quips, reward lines and three sample stories lose the doctor, staff, lawyers, Committee and announcer "!".
- Save data: none (achievement ids viewers1m and sponsor keep their keys).
- Hooks: ui.js sysmsg display sets box.dataset.who; show.js sysMsg gains optional 5th arg `who`; voice10.js vxPush adds `who` to the queued message.
- Risk: Immersive now shows narrator lines over the slide (about one every 20 s). SPONSORS now holds place names, so anything that prints a sponsor reads "Found in {place}".

## v10.45 (versionCode 324)
- Systems: reward director, race15, reward cards, build panel, rivals, mutation drops, draft, fitcheck, upgrades
- Files: see the folded entries below.
- What: merge of `claude/game-rewards-system-stm097` into `main`. The Reward Director paces reward screens (30 s gap that shortens with a backlog, take-two level drafts, egg cut-off); mutation carriers secure the mutation on the kill and a full Genome offers swaps; the race to the egg runs 15 minutes (egg at 15:00 or Lv 60 early, rivals only go for it from 15:00); Immersive rival track with standings; one card language (type colour, icon, fit line) and a v10 Build panel. Also ships main's unreleased fit check and Static version of The Runs.
- Save data: none.
- Hooks: see the folded entries.
- Risk: race balance (race only: difficulty clock at real time, XP x1.8); player-facing text from this branch was written before the copy rule and awaits the user's copy.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 Rivals crack the egg at 15:00 (v10.44)
- Systems: race15, rivals
- Files: race15.js, rivals.js, tests/eggtest.js, tests/rewarduitest.js
- What: In a race, rivals that reach Lv 60 keep racing but only head for the egg from 15:00 (raceRivalEgg), and they level a little slower (RIVAL.finish 860 in races). Invulnerable sim: first rival at the egg at 15:04, through the membrane at 18:04.
- Save data: none.
- Hooks: rivals.js rival egg mode -> raceRivalEgg.
- Risk: the egg can no longer be opened early by a rival; eggtest now starts its break-in at 15:00.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 15-minute race, rival track, card language, Build panel (v10.43)
- Systems: race15 (new), reward cards (new), build panel (new), reward director, difficulty, rivals, ui, tutorial
- Files: race15.js (new), rewardui.js (new), buildpanel.js (new), game.js, render.js, rivals.js, inspect.js, meta.js, ui.js, director.js, tutorial.js, style.css, index.html, tests/rewarduitest.js (new), tests/sim/race.js
- What: The race to the egg now runs 15 minutes: the egg opens at 15:00, or sooner at Lv 60 or sperm count 1, and getting there early pays 20 DNA per minute to spare on a win. The top bar counts down to the egg. Immersive mode shows a thin rival track (dots by level, yours ringed, the egg at the end, a clock tick); tapping it shows the standings while the slide runs at 10%. Every reward card now has a type colour, an icon and a fit line (Feat upgrades show their numbers before and after); a "N WAITING" badge shows held rewards and "SAVED" toasts say a reward is held; choosing a card rings you in its colour. The pause BUILD tab is a v10 Build panel.
- Save data: none.
- Hooks: game.js eggBreakable -> raceEggOpen, PT and spawn rate -> racePace, gainXp -> raceXp, levelsAhead -> raceCurveT, canvas tap -> raceTap; render.js drawHud -> raceHud, rwHud, drawTopBar -> raceClock, behind-pace chip -> raceCurveT, Immersive chip row -> raceTrackH; rivals.js updateShowdown -> raceTick; inspect.js inspectMul -> raceMul; meta.js runDna -> raceDnaBonus; ui.js renderLootCards -> rwCls, rwIcoHtml, rwFitHtml, pickLoot -> rwPicked, renderPause -> bpHtml; director.js dirTick -> rwSaved.
- Risk: race balance moves a lot (race only: difficulty clock 1.5x -> 1.0x, XP x1.8, RIVAL.finish and COUNT.time are getters that differ in races). Race sim (bot, god mode): Lv 17/30/35 at 3/6/9 min, rivals break in about 12 min (was about 7). Petri Dish, Endless and levels unchanged.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 Reward Director: one gate for every reward screen (v10.42)
- Systems: reward director (new), draft, mutation drops, mutations, ui, run log, campaign (Level 0 line)
- Files: director.js (new), draft.js, mutdrop.js, mutations.js, ui.js, v10.js, meta.js, school.js, index.html, tests/drafttest.js, tests/mutdroptest.js, tests/sim/race.js
- What: Reward screens outside wave modes now open at most one per 30 s of combat, highest priority first (boss, weapon slot, branch, fork, mutation, DNA strand, level draft), and a waiting reward climbs the order the longer it waits. Two waiting level drafts merge into one screen of four cards where you take two. Once the egg's membrane is awake no screen opens; waiting rewards apply themselves. Killing a mutation carrier now secures the mutation (the strand is only the show, no 20 s pickup), and a full Genome offers swaps instead of skipping the screen.
- Save data: none (run log record gains scr, scrBy, menuT, merged, autoRw, mutDrops).
- Hooks: v10.js v10Tick -> dirTick; draft.js draftBox -> dirGate, draftLoot -> dirN; ui.js openLoot -> dirTitle, pickLoot -> dirTwo and dirPicked; meta.js run record fields.
- Risk: fewer, later screens in the race to the egg slow early power (win rate); draftBox no longer sets G.draftT or req.v10ok (DRAFT.budget is now unused); swapped-out mutations lose their effect only if it is read live (one-off ones are never offered for swap).

### Folded from ccr-b4817013-jgeigi: Little Prick has an Alien version (voodoo pins)
- Systems: fitcheck, upgrades, tests
- Files: wup2.js, fitcheck.js, tests/wup2test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick Little Prick, but only to Alien. Bleed stacks become pale pins; a full pincushion (6) is Possessed; Open Wound's ghost outline makes crossers flinch to a stop; Sutures yanks crossers back; Reef Knot Possesses the knot (RAGDOLL); Terminal Clause's spirit hits the nearest enemy for x3; Exsanguinate becomes Voodoo Doll (Possessed enemies burst in pins, no double healing). Needlework and Final Prick add a pin per hit in Alien, standing in for Blood's own Bleed. Card text changes to match.
- Save data: none.
- Hooks: none (wup2.js w2Voodoo, w2Possess, w2PinBase; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: Alien Possesses enemies by itself, so Final Prick finishes fewer enemies; no balance sim run.

### Folded from main (unreleased): The Runs has a Static version
- Systems: fitcheck, upgrades, tests
- Files: wup6.js, fitcheck.js, tests/wup6test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick The Runs, but only to Static. Its Burn and Ignite cards become visible zaps: a bolt from the trail jolts (staggers) what crosses it, waves are running sparks, and closing a loop is CIRCUIT CLOSED (the loop lights up, one bolt to everything inside). Card text changes to match.
- Save data: none.
- Hooks: none (wup6.js rnBar replaces its own bar6 'fire' calls; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: Static Runs staggers a lot on Afterburner (every enemy per 3 s); untested for balance.

### Folded from main (unreleased): upgrade fit check
- Systems: fitcheck (new), upgrades, combos, tests
- Files: fitcheck.js (new), index.html, tests/fittest.js (new), tests/wup2test.js, wup3test.js, wup4test.js, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: upgrades that break a weapon's branch (attack-type changes that strand masteries or modifiers, masteries that contradict the promise, modifiers that fight or duplicate a branch) are no longer offered to that weapon, and Switched at Birth never picks a weapon whose branch runs on its own status. New guide section "Upgrades that do not fit".
- Save data: none.
- Hooks: none (wraps wupForkCards, modCardOk, modDraftCands, sabCard from its own file).
- Risk: Red Flagship never offers Packet Loss and Hot Mess never offers Fire Drill; those promises now show two Lv 6 cards. Card tests set FIT_OFF.

## v10.42 (versionCode 321)
- Systems: school, tests
- Files: see the folded entries below.
- What: Level 0 no longer crashes at lesson 11 under v10 (autorun follows the mutation strand); v10test matches the four Experiments and the weapon draft's combo partner; stray test screenshots are git-ignored.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-20 v10test allows the weapon draft's combo partner
- Systems: tests
- Files: tests/v10test.js
- What: the weapon slot draft may swap one card for a combo partner of a weapon you hold, of any attack type (combos10.js, by design). v10test now allows that one card (marked c10) and still checks every other card brings a new attack type. It was failing about 2 runs in 3.
- Save data: none.
- Hooks: none.
- Risk: none (test only).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-20 Level 0 no longer crashes at lesson 11 (v10.42)
- Systems: school, tests
- Files: school.js, tests/v10test.js, tests/.gitignore
- What: autorun in Level 0's lesson 11 (Junk in the Trunk) read the v9 junk DNA list, which doesn't exist under v10, and crashed the game on entering the room; it now steers to the mutation strand and its carrier (mutdrop.js). Level 0 plays through all ten lessons to the egg again (schooltest passes). v10test expects the four Experiments the sample screen now offers. Screenshots from tests run outside run.sh no longer show up as untracked files.
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.41 (versionCode 320)
- Systems: combos, weapons, draft, autorun, fight
- Files: see the folded entry below.
- What: merge of `ccr-d33b1fde-g92ob2` into `main`: 30 branch combos (ten weapon pairs, three each, gated on a Lv 3 promise per weapon), combo partners in the weapon draft, promise cards that name their combo.
- Save data: none.
- Hooks: fight.js fightHit -> src.noRx; combos10.js wraps globals and loads after ui.js.
- Risk: balance. Bot Races: 0 of 60 won with the combos (24 of 30 fused naturally), same as without.

### Folded from ccr-d33b1fde-g92ob2: 2026-10-19 Branch combos for the 24 weapons (v10.41)
- Systems: combos, weapons, draft, autorun, fight
- Files: combos10.js (new), fight.js, index.html, tests/combo10test.js (new), tests/run.sh, tests/sim/race.js
- What: 30 new Weapon Combos across ten weapon pairs (three each). A combo needs both weapons at Lv 5 and a particular Lv 3 promise on each; each pair's three combos use every promise once, so whatever the first weapon took, one promise on the second fuses with it. Same attack types can fuse. The weapon draft now swaps one card for a combo partner of a weapon you hold (any attack type, so the old Storm in a Teacup and Worm Farm can happen at last); Lv 3 promise cards name the combo they complete; autorun takes a card that completes a combo. Combo hits go through normal hit resolution and never set off an unstable reaction.
- Save data: none (META.combos records fused ids as before).
- Hooks: fight.js fightHit -> `src.noRx` skips fightReact. Everything else wraps globals from combos10.js (fightHit, killEnemy, projHit, comboFire, comboTick, wupDmgMul, bubblePop, toothTaken, availableCombos, wupForkCards, v10Loot, UI.autoTick); it loads after ui.js.
- Risk: balance (more combos fuse, and the weapon draft and autorun now favour partners); any file that later wraps the same globals must load before combos10.js or keep calling through.

## v10.40 (versionCode 319)
- Systems: asdemo (new), mfdemo (new), aldemo (new), screens
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: the last 14 weapons get real previews, tabbed tier screens and a scene per branch card, so all 24 weapons and all 360 branch cards are done.
- Save data: none.
- Hooks: none.
- Risk: preview only, no combat change.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 The last 14 weapons: real previews, tabbed branch screens, a scene per branch (v10.40)
- Systems: asdemo (new), mfdemo (new), aldemo (new), screens
- Files: asdemo.js (new), mfdemo.js (new), aldemo.js (new), index.html
- What: every remaining weapon gets the Standard Issue treatment, so all 24 now have a preview that shows the real weapon, their tier screens open in the Weapon Draft tabs, and every one of the 360 branch cards plays its own scene. New here: Acid Spit, Red Flagship, Soulmate Signal, Unwanted Contact, Nocturnal Emission, Ewww Gross, Blowing Bubbles, Hot Mess, Nappy Mines, The Runs, Rent Free, Peekaboo, Eggs and Chest Burster (210 cards). Typed previews share one status look (Corrosion, Burn and Alien bars; Charged, Snared, Ignited, Possessed, Feared).
- Save data: none.
- Hooks: none (PV_OWN entries).
- Risk: preview only, no combat change. Every 'wup' box with a single weapon ready now opens as that weapon's tabbed fork; the card version of the branch screen is no longer used for any of the 24.

## v10.39 (versionCode 318)
- Systems: samples, render, defences, mutations, ui
- Files: see the folded entries below.
- What: merge of `claude/alien-sample-design-xdoks8` into `main`: every v10 sample has its own body in three families (natural Baseline, Alpha, Beta; engineered Private Schooled, Ordered Online; anomalies Redtail, Prawn Again and the jellyfish-like Not of This World), live pictures on the sample cards and a Field Guide SAMPLES tab, defences and upgrades worn on the body (Shell armour bands, Squishy jelly, Thorns, Evasion, stat reshaping, a mark per body and trade-off mutation), and tails that join the neck cleanly. Branch builds were v10.29 to v10.33.
- Save data: none.
- Hooks: render.js drawShip -> sampleLook; seqsel.js drawSeqMods -> sampleLookOn; samples10.js s10Samples -> slPicStart; ui.js codexHtml -> slCodex (SAMPLES chip); portraits.js portraitsStart -> slPicStart; pdef.js pdefDraw skips Shell rings for v10 samples.
- Risk: visual only; hitbox and swim physics unchanged.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Tails attach cleanly (v10.33, with the upgrade marks and the bold-hypatia merge)
- Systems: samples
- Files: samplelooks.js, alienyou.js
- What: the tail now leaves from the neck as drawn: its root follows the head's rock, squash and stretch (Squishy, the speed stretch, damage bulk) and Can't Sit Still's jitter, and leaves along the midpiece. Natural tails' root width matches the midpiece. The alien's tentacles stay on the rim of the bell when it squashes.
- Save data: none.
- Hooks: none.
- Risk: none (the swim physics reads the tail's shape; its root moves by a unit or two at most).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Upgrades show on the body
- Systems: samples, mutations
- Files: samplelooks.js, tests/upbodyshot.js (new)
- What: non-defence upgrades change the v10 bodies. Stats (from any source): damage bulks the head, swim speed stretches it and lengthens the tail, attack rate quickens the tail beat, pickup range adds a faint receptor field. Each body and trade-off mutation has a mark (Slipstream wake, Extra Padding pads, Sticky Fingers hairs, Heartbeat heart, Hard to Hold drips, Spare Parts sac, Overexcited lines, Personal Space ripple, Big Brain brain, Quantity Over Quality buds, Can't Sit Still jitter, All at Once barb, Hungry Hungry belly, No Time for Being Careful stripes, Growing Pains stretch marks); a damage type mutation dyes the neck. The alien gets them too.
- Save data: none (G.slBase, run only: the stats at the run's start).
- Hooks: none new (inside samplelooks.js slDefState/slDefUnder/slDefOver, already hooked).
- Risk: visual only.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Defences on the body, samples in the Field Guide (v10.32)
- Systems: samples, defences, ui
- Files: samplelooks.js, alienyou.js, pdef.js, ui.js, portraits.js, tests/defbodyshot.js (new), tests/codexsamples.js (new)
- What: your defence cards now change your body. Shell is shaded brown armour bands wrapping the head front first (one band per layer, a collar at 4; cracks and chips as it wears; a front cap only on the alien so its core shows) instead of rings. Squishy makes the head jelly: its squash and stretch is about three times bigger and overshoots, and hits squash it flat. Thorns are spikes raked back along the head; Evasion leaves after-images. The Field Guide has a SAMPLES tab: each sample with its live picture, family, origin, passive and lab note.
- Save data: none.
- Hooks: ui.js codexHtml -> slCodex (and a SAMPLES chip in the tab list); portraits.js portraitsStart -> slPicStart; pdef.js pdefDraw skips Shell rings when sampleLookOn; alienyou.js alienDraw -> slDefState/slDefUnder/slDefOver.
- Risk: visual only. Shell no longer draws as rings round v10 samples (only on the body).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Every sample gets its own body (v10.31)
- Systems: samples, render
- Files: samplelooks.js (new), alienyou.js, render.js, seqsel.js, samples10.js, index.html, tests/lineupshot.js (new), tests/alienyoushot.js
- What: three visual families. Natural: Baseline (textbook), Alpha (long, pointed, big striped midpiece, longer tail), Beta (small, bent neck, droplet, coiled tail tip, plaster). Engineered: Private Schooled (lacquered navy, gold trim, crest, school-tie midpiece, braided tail), Ordered Online (moulded plastic box with seam, barcode, crooked sticker, misaligned cap, ribbed hose, zip-tie tail, frost). Anomalies: Redtail (lumpy wobbling red head, twitchy hairs, frayed tail, embers), Prawn Again (white-gold, halo, wings, light rays, an echo). Every sample card has a live picture of its body.
- Save data: none.
- Hooks: render.js drawShip -> sampleLook (replaces alienYou); seqsel.js drawSeqMods -> sampleLookOn (replaces alienYouOn); samples10.js s10Samples -> slPicStart (replaces alienPicStart).
- Risk: visual only; hitbox and swim physics unchanged. Body-look upgrades (cilia, barb, plating) and sequence marks don't show on v10 samples.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Not of This World's card shows the creature (v10.30)
- Systems: samples
- Files: alienyou.js, samples10.js, tests/alienyoushot.js
- What: its card on the sample screen has a live picture of it, hanging and pulsing, cycling through its moods and its Fire, Alien and Static core colours. Tentacles now start laid out straight instead of in a knot. alienYou's drawing is split into alienDraw (no G needed).
- Save data: none.
- Hooks: samples10.js s10Samples -> alienPicStart (and the card list adds a canvas to the alien card).
- Risk: none (title screen only; the loop stops when the card leaves the page).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Not of This World gets its own body (v10.29)
- Systems: samples, render
- Files: alienyou.js (new), render.js, seqsel.js, index.html, tests/alienyoushot.js (new)
- What: the Not of This World sample is no longer drawn as a sperm. It is a translucent indigo bell with a split, glowing core and seven tentacles with glowing tips, swimming by jet pulses. Its mood shows (idle, curious, alert, agitated, hurt), and the core and tips take the colour of the current Adaptive Biology type (Fire, Alien, Static). Pause portrait too.
- Save data: none.
- Hooks: render.js drawShip -> alienYou; seqsel.js drawSeqMods -> alienYouOn.
- Risk: visual only; hitbox and swim physics unchanged (its tail never runs stepTail, so p.ext/p.behind stay at their defaults). Body-look upgrades (cilia, barb, armour plating) don't show on it.

## v10.38 (versionCode 317)
- Systems: scdemo (new), fbdemo (new), bldemo, screens
- Files: see the folded entries below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Sister Cousin and the rest of the Force and Blood weapons (Maximum Gains, Nervous Wreck, Family Ties, Skill Issue, There Is No Spoon, One of These Days) get real previews, tabbed tier screens and a scene per branch card. With Standard Issue, Panic Button and Little Prick, every Force and Blood weapon is done (10 of 24).
- Save data: none.
- Hooks: none.
- Risk: preview only, no combat change.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 The rest of the Force and Blood weapons: real previews, tabbed branch screens, a scene per branch (v10.38)
- Systems: fbdemo (new), bldemo, screens
- Files: fbdemo.js (new), bldemo.js, index.html
- What: Maximum Gains, Nervous Wreck, Family Ties, Skill Issue, There Is No Spoon and One of These Days get the Standard Issue treatment: each preview shows the real weapon (pellet fan, clamping jaws, merging vortices, bowling lard, eaten and returned shots, countdown marks with a ledger), their tier screens open in the Weapon Draft tabs, and each of their 90 branch cards plays its own scene. Spitter cells now show their purple rim (it never drew on Panic Button's Grudge Match).
- Save data: none.
- Hooks: none (PV_OWN entries).
- Risk: preview only, no combat change. 'wup' boxes with only one of these weapons ready now open as that weapon's fork.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Sister Cousin: real preview, tabbed branch screen, a scene per branch (branch build v10.37, merged as v10.38)
- Systems: scdemo (new), screens
- Files: scdemo.js (new), index.html
- What: Sister Cousin (old name Seeker Siblings) gets the Standard Issue treatment. Its preview fires two wiggling homing siblings per volley (6 volleys, 2 s reload) that add Bleed and split in two on a kill, with an in-flight counter (12 at most) under Spermy. Its tier screens open in the Weapon Draft tabs, and each of its 15 branch cards plays its own scene (extra siblings, runts, hiding and ambushes, the weakest-first favourite, squabbles, pack dives, Pile-On, Dinner Time, Baby Boom, Family Reunion, Only Child).
- Save data: none.
- Hooks: none (a PV_OWN entry).
- Risk: preview only, no combat change.

## v10.37 (versionCode 316)
- Systems: mutation drops, draft, tests
- Files: see the folded entry below.
- What: merge of `claude/bold-hypatia-jadt4w` into `main`: an empty mutation screen can no longer stick a run (the box is dropped when no mutation fits), and the flaky perf18, eggtest and autoruntest are reliable.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Flaky tests fixed; empty mutation screen no longer sticks (v10.37)
- Systems: mutation drops, draft, tests
- Files: draft.js, tests/perf18.js, tests/eggtest.js, tests/autoruntest.js
- What: (eggtest also keeps its rival alive and alone: race rivals could kill it mid-gnaw.) A mutation box now opens only if a mutation can still be taken (draft.js draftBox); several strands queued while the Genome filled up used to open an empty mutation screen that stuck the run. Tests: perf18 goes through v10Box like the main loop and times 300 play frames (it could time none); eggtest's rival break-in runs unarmed (anything of yours hitting the rival stops it gnawing); autoruntest clears terrain properly (`G.terrain` is { list, grid }: 85 to 102 pieces were left in and pushed you off HOLD and ORBIT).
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.36 (versionCode 314)
- Systems: samples screen, school (Level 0), mutation drops
- Files: see the folded entry below.
- What: merge of `claude/v9-v10-breaking-changes-1hjfdw` into `main`: The Petri Dish, Endless and Level 1 are back in the Experiment picker; Level 0 lesson 11 teaches the mutation strand.
- Save data: none.
- Hooks: none.
- Risk: see the folded entry.

### Folded from claude-v9-v10-breaking-changes-1hjfdw: 2026-10-19 Petri Dish, Endless and Level 1 back; Level 0 lesson 11 teaches mutation strands (v10.36)
- Systems: samples screen, school (Level 0), mutation drops
- Files: samples10.js, school.js
- What: the Experiment picker offers The Petri Dish, The Race, Endless and Level 1 again (flags S10_PETRI, S10_ENDLESS, S10_LEVELS). Level 0 lesson 11 is no longer a free pass under V10: an Antibody carries a mutation strand (mutdrop.js) that never sheds or decays in school; kill it, swim into the strand and pick a mutation to open the gate.
- Save data: none.
- Hooks: none (school.js reads mutdrop.js mdS, mdOk, MUTDROP and G.stats.mutDrops).
- Risk: Endless and Level 1 have not been played or simmed under v10 (untested by request); expect balance gaps or a crash in Level 1 arenas. schooltest not rerun.

## v10.35 (versionCode 313)
- Systems: bldemo (new), sidemo, screens
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Panic Button and Little Prick get real previews, tabbed tier screens and a scene per branch card; sidemo.js becomes the shared engine for weapon previews.
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Panic Button and Little Prick: real previews, tabbed branch screens, a scene per branch (v10.35)
- Systems: bldemo (new), sidemo, screens
- Files: bldemo.js (new), sidemo.js, index.html
- What: the other two baseline weapons get the Standard Issue treatment. Panic Button's preview marks the densest cluster in reach, fills a warning for 0.45 s and blasts it (3 to a magazine); Little Prick fires needles that stack Bleed (red pips, drips, tick numbers) and leave blood pools. Their tier screens open in the Weapon Draft tabs, and each of their 30 branch cards plays its own scene. sidemo.js is now a shared engine: any PV_OWN entry with a flags table gets the tabbed screen.
- Save data: none.
- Hooks: none new (PV_OWN entries; sidemo.js sivDraw gained under/over/cell/me layers and sivDamage a kill hook).
- Risk: preview only, no combat change. 'wup' boxes with only one of these three weapons ready now open as that weapon's fork.

## v10.34 (versionCode 312)
- Systems: box looks (new), mutation drops, modifier cards, draft, ui
- Files: see the folded entry below.
- What: merge of `claude/bold-hypatia-jadt4w` into `main`: the mutation, weapon modification and Feat screens each look like what they change (your sperm and stats on the mutation screen, your weapons and modifier slots on the modifier screen, violet SPECIAL ABILITY Feat cards).
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Mutation, modifier and Feat screens look like what they change (v10.34)
- Systems: box looks (new), mutation drops, modifier cards, draft, ui
- Files: boxlook.js (new), mutdrop.js, modcards.js, draft.js, ui.js, index.html, style.css, tests/mutdroptest.js
- What: an elite's strand now opens a MUTATION screen (pick 1 of 3) with your sperm drawn at the top and its stats (health, speed, damage, attack speed, pickup range, Genome slots) and what it already carries. DNA strands open a WEAPON MODIFICATION screen of modifier cards only, with your weapons and their three modifier slots at the top; each card names its weapon. Feat cards in level-ups glow violet and read SPECIAL ABILITY. Card frames differ: rounded flesh for mutations, square steel for modifiers.
- Save data: none.
- Hooks: ui.js openLoot -> boxLook, renderLootCards -> boxCardCls, tick -> boxTick; draft.js draftLoot -> mdCards (kind 'mutation') and modBoxCards (chest, boss); draftBox opens 'mutation' at once.
- Risk: DNA strands no longer deal weapon upgrades, Feats or defences when a modifier fits (they fall back to the old draft when none does).

## v10.33 (versionCode 311)
- Systems: sidemo (new), screens, weapons24, ui
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Standard Issue's preview shows the real weapon (magazine, reload, reach), its tier screens use the Weapon Draft tabs, and each branch card plays its own scene.
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Standard Issue: real preview, tabbed branch screen, a scene per branch (v10.33)
- Systems: sidemo (new), screens, weapons24, ui
- Files: sidemo.js (new), preview.js, ui.js, index.html, tests/sivtest.js (new), tests/run.sh
- What: Standard Issue's animated preview now shows the real weapon: one heavy shot at the nearest cell inside its 440 reach (dashed arc), 0.45 s apart, an 8-round magazine under Spermy and a 1.2 s reload ring, stopping on the first hit, with real damage numbers. Its tier screens (promise, branch card, mastery) open in the Weapon Draft layout with a tab per choice instead of cards, and each tab plays its own scene (bounces and zigzags, pierce lines, marks and BONKs, nuts, lanes, pops, the 10-shot replay ...), built on the choices already taken. The badge shows the tier, not the internal level.
- Save data: none.
- Hooks: preview.js makePreview/stepPreview/drawPreview -> PV_OWN (new registry); ui.js openLoot -> sivDraftKind, openDraft -> sivDraftHead; ui.js renderDraft badge reads wTier for 'wupfork'.
- Risk: a 'wup' box with only Standard Issue ready is turned into its 'wupfork' in openLoot (the other 23 still use cards). Preview only: no combat change.

## v10.32 (versionCode 310)
- Systems: attack looks (new), render, weapons, settings, tests
- Files: see the folded entries below.
- What: merge of `ccr-fc17e397-fp3yvs` into `main`: every attack wears its damage type (typelook.js: Static arcs, Acid drips, Mucus strings, Blood spatter, Alien wisps, Fire flames; a different beam per type), and Lab view is a Settings option again.
- Save data: SET.lab10 added.
- Hooks: see the folded entries.
- Risk: see the folded entries.

### Folded from ccr-fc17e397-fp3yvs: 2026-10-19 Lab view is an option again (v10.32)
- Systems: settings, render, tests
- Files: settings.js, look10.js, ui.js, tests/looktest.js, tests/tlshot.js
- What: the LAB/ARCADE View row is back in Settings > Screen under v10. Arcade stays the default; Lab greys the slide as before (labGrey, eyepiece). Older saves that still had Lab from v9 are moved to Arcade once, then the choice sticks.
- Save data: SET.lab10 added (the one-time Arcade reset is done; Reset settings keeps it at 1).
- Hooks: none.
- Risk: v10 colour-coded things (defence rings, type colours) are grey in Lab view, as all Lab view is; tlshot now clears terrain (a random rock could block every shot).

### Folded from ccr-fc17e397-fp3yvs: 2026-10-19 Attack looks by damage type (v10.31)
- Systems: attack looks (new), render, weapons
- Files: typelook.js (new), v10.js, render.js, toys.js, index.html, tests/tlshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: every attack now wears its damage type, whatever the weapon: Static crackles and snaps short arcs onto nearby enemies (feelers into the water when none is near), Acid drips pink goo that splats and fades, Mucus strings out and sags, Blood spatters, Alien leaves after-images and wisps, Fire sheds tongues and embers. Beams are drawn per type: Static a continuous jagged bolt with forks, Acid a sagging dribbling stream, Mucus a braided rope of snot with beads, Blood an arterial spurt in pulses, Alien a twisting helix, Fire a flamethrower plume. Soulmate Signal's twin beam is a living bolt. Bursts, swings, lashes and pools get the same per-type flourishes. Cosmetic only (no damage).
- Save data: none. Run state `G.tlook` (particles and arcs; `G.tl` is the run log's timeline).
- Hooks: v10.js v10Tick -> tlTick, v10Draw beam loop -> tlBeam; render.js after your shot loop -> tlShots, after drawTypeFx -> tlDraw; toys.js twin beam -> tlSeg.
- Risk: frame time with many typed shots (particles capped at 280, arcs at 40, shots decorated at 60 a frame; perf18 passes). Bursts are spotted by ring colour, so any ring in a type colour gets that type's flourish.

## v9.28 to v10.30 (folded late, 19 Oct 2026)
- What: session fragments from the merges between v9.27 and v10.30 that were left in `changes/` unfolded. Folded here as they were written, newest branch first; one heading per entry.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Modifiers in loot boxes; mutations dropped by elites (v10.30)
- Systems: mutation drops (new), modifier cards, draft
- Files: mutdrop.js (new), modcards.js, draft.js, game.js, v10.js, index.html, tests/mutdroptest.js (new), tests/modcardtest.js, tests/run.sh
- What: modifier cards now come only in DNA strands (chest and boss boxes), and every strand deals one when one fits; level-ups no longer offer them. Mutation cards (body, weapon, damage-type, trade-off, rare) left the draft: 60% of elites carry one, wearing the junk DNA helix with a beacon and countdown (40 s); killing it drops a strand labelled with the mutation, which you swim into to take. Catalysts, Concentrations and defences stay in the draft.
- Save data: none.
- Hooks: game.js killEnemy -> mdKill; v10.js v10Tick -> mdTick, v10Draw -> mdDraw; draft.js draftCards gains a kind argument.
- Risk: mutation supply now depends on elite numbers; level-ups are left with weapons, Feats, Switched at Birth, defences and Catalysts.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 All 24 weapons live again (v10.29)
- Systems: weapons, samples
- Files: weapons24.js, NOTES.md
- What: Family Ties, Sister Cousin and Eggs are back in drafts, starters and the Field Guide (`W24_HOLD` emptied; their wup tests pass 3 of 3). Not of This World, Redtail and Prawn Again have three starters again.
- Save data: none.
- Hooks: none.
- Risk: none beyond v10.27's card changes (Clutch, Warm Glow, Dinner Time, Baby Boom).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Family Ties, Sister Cousin and Eggs on hold (v10.28)
- Systems: weapons, samples
- Files: weapons24.js, sigweap.js, w24look.js, tests/weapons24test.js, tests/samplestest.js, NOTES.md
- What: the three weapons are no longer offered, never start a run and are hidden from the Field Guide (`W24_HOLD`, `w24Live`). Not of This World, Redtail and Prawn Again start with two starters. Code and upgrade cards are kept for their return.
- Save data: none.
- Hooks: sigweap.js v10Pool -> w24Live; w24look.js wl_wids -> w24Live.
- Risk: three samples have one starter fewer; the pool is 21 weapons.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Fix Sister Cousin, Eggs and Family Ties after levels stopped speeding up firing (v10.27)
- Systems: weapons (the 24's upgrade branches)
- Files: wup5.js, wup6.js, tests/wup3test.js, tests/wup5test.js, tests/wup6test.js
- What: since v10.23 (levels add damage only) these broke or got unreliable. Sister Cousin: Baby Boom's 24-in-flight cap now holds for volleys too (25 flew), and Dinner Time siblings home in on a new enemy after each kill (they flew straight, so 3 kills was luck). Eggs: Clutch drops 2 eggs at a time that last 8 s (1 egg a drop, 6 s life topped out near 6 eggs, so "up to 12" was unreachable); Warm Glow eggs last 9 s (a charged egg had a 1 s window to be eaten). Family Ties was only slow to show its merges: its Lv 6 tests run 10 s, Eggs' 15 s.
- Save data: none.
- Hooks: none.
- Risk: Clutch and Warm Glow are stronger (more eggs, longer lived). Card text updated for both.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Merge sandbox fix, voice guide, and the two old autorun branches (v10.26)
- Systems: sandbox, docs
- Files: merges only (see changes/ccr-f38bcc1f-1rc8ck.md, claude-great-maxwell-2ar9sg.md, claude-festive-allen-xmea8i.md, claude-zealous-clarke-i26iot.md)
- What: brings in the sandbox fix (no Acid Crypts or big hazards; the run log counts weapons) and the voice and tone guide. festive-allen (v9.28 autorun) and zealous-clarke (v10.04 test build, autorun doc) were already in v10 by another route: merged with our side kept, so nothing changes from them.
- Save data: none.
- Hooks: none new.
- Risk: none. Known failures carried over: wup5test (Baby Boom), wup6test (Tooth Fairy), and autoruntest, which is flaky (also fails about 1 run in 4 on v10.25).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Enemy Membranes like yours (v10.25)
- Systems: enemy membranes (new), enemies, combat
- Files: foemem.js (new), fight.js, index.html, tests/foememtest.js (new), tests/run.sh
- What: Nurse Cell, Mitotic Cell, Mother Cell, Plasma Cell and Stem Cell now wear a Membrane worth 30% of their health (the player's size), with the usual rules (Force does half, mends after 2 quiet seconds, Static recharges it). Every enemy Membrane, Mucus Wall's and Alpha Swimmer's included, now draws as the player's soap-bubble forcefield, bulging where it is hit, instead of a thin blue arc.
- Save data: none.
- Hooks: fight.js fightCd passes d.memFrac to makeDefence; fightDraw -> foeMemDraw.
- Risk: those five enemies take about 30% more damage to kill (60% more with Force). One extra gradient per Membrane enemy per frame.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge ccr-caa43b42: Soul damage is now Alien (v10.24)
- Systems: damage types, chemistry, ui, weapons, samples, docs
- Files: merge only (see changes/ccr-caa43b42-e4m6sc.md); meta.js, build.gradle, GAME_GUIDE.md
- What: brings in the Soul -> Alien rename, so the game's text now matches the Notion tables. Internal id stays `soul`.
- Save data: none.
- Hooks: none.
- Risk: wup3test, wup5test and wup6test already failed on v10.23 before this merge (Family Ties slingshot/white hole, Baby Boom in flight 25, Tooth Fairy clutch cap 6); not caused by it.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon levels add damage only (v10.23)
- Systems: weapons
- Files: game.js (computeStatsInner, optUpgrade, lvBonusText), ui.js (weapon level tree text), toys.js (crayon)
- What: levelling a weapon no longer makes it fire 5% faster, reload 5% faster or hold 12% more a level; fire rate, reload and magazine now change only when a branch card, level table (d.lv) or modifier says so. Level-table `mag` and `range` bonuses now apply and show in the text (they were silently ignored). Feats still cycle 5% faster a level. Weapon upgrade cards no longer say "faster cycling".
- Save data: none.
- Hooks: none.
- Risk: balance (a Lv 10 weapon used to fire about 37% faster and hold twice the magazine). wave20 4 mortal: before 0/4 wins (deaths at waves 8, 10, 13, 15), after 1/4 (9, 10, 15).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon UI colours match damage types (v10.22)
- Systems: render, ui
- Files: icons.js, seqsel.js, seqreveal.js, draft.js
- What: weapon and Feat icons, names and borders in every menu now use the exact damage type colour from `ELEMENTS` (`ELEM_UI` is derived from it instead of its own slightly different palette; Blood was pink-red in menus but claret in the world). Sequence select and the sequence reveal colour each exclusive weapon by its own damage type, not the sequence colour; Lv fork cards use the type colour, not the weapon's own shade.
- Save data: none.
- Hooks: none.
- Risk: menu colours shift slightly (Blood darker, Force brighter); the in-world `elem` glow in render.js reads `ELEM_UI`, so it now matches shot colours. seqtest, revealshot and colourtest already failed on this branch before the change.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Modifier cards with ranks; Switched at Birth back for every weapon (v10.21)
- Systems: modifiers, draft, damage types
- Files: modcards.js (new), modifiers.js, draft.js, index.html, tests/modcardtest.js (new), tests/modstest.js, tests/run.sh
- What: the 20 v10 modifiers (Notion v10+ rows) are now level-up draft cards for a weapon whose attack type fits: 3 different a weapon (one Delivery), and taking one again ranks it up to Rank 3 with bigger numbers (more jumps, bounces, bodies, pets and so on). Switched at Birth is offered again for all 24 weapons, signatures included: a random weapon gets a random other damage type and keeps its level, upgrade branch, modifiers and mutations; the card is Rare and never turns up two drafts running. Mutations already matched the Notion v10+ rows, so they are unchanged. No old v9 modifiers or mutations added.
- Save data: none (run state only: w.m10 may now hold 3 copies of any modifier; G.draftN, G.sabAt).
- Hooks: draft.js draftCards -> modDraftCands (replaces the v10Switch line while modcards.js loads); draft.js groupW gains mod.
- Risk: draft share shifts (a new mod group at weight 1.1, plus Switched at Birth at 0.6). Signature weapons switched to another type may still show some old-type effects their sigFire hard-codes. Branch ccr-caa43b42 (Soul renamed Alien) touches damage types: merge order matters for card text only.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 MY OWN MESS targeting (v10.20)
- Systems: autorun (autoaim), weapons, ui
- Files: aimat.js (new), game.js, autorun.js, ui.js, loadout.js, index.html, tests/aimowntest.js (new), run.sh, tools/guide.js
- What: new targeting directive MY OWN MESS (short MESS, id `ownmess`): a weapon or Feat shoots the enemy nearest another of your weapons' stuff (black hole, puddle, a lob's landing spot, pets, orbit blades, turrets, Feat effects). Pick whose mess (ANY MESS = your biggest thing in range, a named weapon or Feat, or itself) on the weapon page or in the LOADOUT target grid. Works as the primary or the tie-breaker. No mess about: nearest.
- Save data: none (`w.aimAt` lives on the run's weapon slot).
- Hooks: game.js targetScore case 'ownmess' -> aimOwnScore; acquire/acquireMany -> aimOwnSet; updateWeapon, updateSpellList, featTap -> AIMAT.w = w; autorun.js aimKey case 'ownmess' -> aimOwnKey; ui.js armoury targeting and loadout.js target grid -> aimOwnPick/aimOwnBind. DIRECTIVES gets its entry by push from aimat.js.
- Risk: the id must stay longer than 3 letters (targetScore only reads strings over 9 characters as pairs). Homing retargets and turrets using it borrow the last-fired weapon's aim point. Echo copies aim at ANY MESS.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Sandbox HUD: kills, kills a second, DPS (v10.19)
- Systems: sandbox
- Files: sandbox.js
- What: the Sandbox HEAT bar gains a second line: KILLS n | kills a second | DPS (all your damage), both averaged over the whole run so far. The HEAT buttons now refresh it at once (a comment had swallowed the call).
- Save data: none.
- Hooks: none.
- Risk: none (Sandbox only). Touches the Sandbox session's file: merge with care.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge the Sandbox session again: autofire toggle, + mount, banked upgrades (v10.17)
- Systems: sandbox, ui
- Files: merge only (manualfire.js arrives; ARCHITECTURE.md script order keeps both wstats and manualfire)
- What: brings in ccr-b8d66d4a-dmxu9z's two newer commits (one Sandbox with + mount and banked upgrades; autofire toggle with per-weapon FIRE buttons, Rewind on the left). Both branches had shipped v10.16, so this build is v10.17.
- Save data: see changes/ccr-b8d66d4a-dmxu9z.md.
- Hooks: see that fragment.
- Risk: none beyond that fragment's.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Per-weapon telemetry in the run log (v10.16)
- Systems: runlog, weapons, sandbox
- Files: wstats.js (new), meta.js, game.js, ui.js, index.html, tests/wstatstest.js (new), tests/run.sh
- What: each run now logs, per weapon slot: seconds held, dps, uptime (0.25 s windows with damage), distinct targets per active window, projectile hit rate, average hit distance, kills, share of damage on bosses, when each tier was taken, plus the weapons offered and picked in start/slot drafts. runText adds one ` wpn` line per weapon and an ` offers:` line (existing lines unchanged). Sandbox runs are now live-saved (closed runs get logged) and marked `[SANDBOX heat N]`. The run log keeps the last 60 runs (unchanged).
- Save data: `sd_runs` entries gain a `ws` object; the log is trimmed to 60 on load and save.
- Hooks: game.js damageEnemy -> wsHit, killEnemy -> wsKill, fireWeapon -> wsFire, spawnProj -> wsProj, update -> wsTick; ui.js pickLoot -> wsPick; meta.js runSummary -> wsSummary, runText -> wsHead, wsText.
- Risk: one extra set operation per hit; older logged runs have no `ws` and print as before.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge the Sandbox session (ccr-b8d66d4a-dmxu9z) (v10.15)
- Systems: sandbox
- Files: merge only; tests/run.sh (sbtest added to ALL)
- What: brings in the weapons-only developer Sandbox (its fragment: changes/ccr-b8d66d4a-dmxu9z.md). Both branches had shipped v10.14, so the merged build is v10.15.
- Save data: none.
- Hooks: see that fragment.
- Risk: none outside Sandbox.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Race balance: boss contact, bullet cap and fire rate, rival damage, egg membrane (v10.14)
- Systems: bosses, enemies, rivals, the egg, difficulty
- Files: bosses.js, game.js, boss10.js
- What: boss contact damage now takes the v10 cut (bosses.js overwrote makeEnemy's); enemy bullets alive at once capped at 120 (was 800); ordinary shooters fire a third less often; rival damage 0.3 (was 0.45); the egg's membrane has half the health. Bot race sim: first win (1 of 6, was 0); 5 of 6 reach the egg.
- Save data: none.
- Hooks: V10_DIFF gains fireGap, ebulCap, egg (boss10.js); game.js eBullet cap, shooter cooldown, openEgg; bosses.js boss dmg.
- Risk: easier race; re-check against phone runs (bot target 20 to 50%).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Test triage: 20 v9 tests retired, 6 fixed
- Systems: tests, school (Level 0)
- Files: tests/run.sh, tests/schooltest.js, inspecttest.js, introtest.js, setshot.js, rewindtest.js, newtut.js, web/js/school.js
- What: the ALL list drops 20 tests of v9 systems that v10 switches off (files kept): sigwtest weirdbox pintest reborntest forktest junktest sxshot devall seqtest seqfeattest revealshot foescenetest colourtest fusiontest supertest rubbertest armtest newfeattest psttest f3test. Fixed: Level 0 crashed in lesson 11 (junk DNA is off, `G.junkDrops` undefined) so lesson 11 is now a free pass under V10; the Feat lesson now gives a tappable Feat when the starting one is a trigger Feat (Oopsie), and schooltest finishes in about 93 s again; inspecttest expects the 7x7 chart; introtest reads the `sd_meta10` key; setshot opens a visible hint row (View is hidden); rewindtest and newtut skip junk-carrier and earned-colour assertions under V10.
- Save data: none.
- Hooks: none.
- Risk: none for the game beyond Level 0 lesson 11 being skipped under V10.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapons grow between tiers; Thorns recoil capped; hazards get the v10 damage cut (v10.13)
- Systems: weapons, combat, hazards
- Files: weapons24.js, game.js, fight.js, bosses.js
- What: between tiers the 24 still gain stats with player level (up to 3 old levels past their tier, one per 3 player levels; cards stay branch-only). Thorns recoil is capped at 4% of max health per hit (a mastered contact weapon took 202 back in a sim). Hazards (kidney stones, boss ground attacks) now take V10_DIFF.dmg like everything else.
- Save data: none.
- Hooks: game.js computeStatsInner -> wStatLv; bosses.js addHazard -> V10_DIFF.dmg; fight.js thorns cap.
- Risk: bot sim still 0/6 wins (2 of 6 reach the egg, one the Final Five); deaths now mostly late bullets and rivals.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon tiers: upgrades on their own screen, four tiers, all branches; no empty slots; catalysts need this run's reaction
- Systems: weapons, draft, ui, mutations
- Files: weapons24.js, draft.js, game.js, ui.js, mutations.js, tests/drafttest.js, tests/mutstest.js
- What: normal drafts carry no weapon cards; every 4th level opens a WEAPON UPGRADE screen (pick a weapon if more than one is ready, then its branch cards). Weapons have tiers 1-4 (promise, branch, mastery; one mastery a run), stored on the old internal levels 1/3/6/10 so stats and cards are unchanged. HUD and menus show tiers and hide empty and locked slots. "More <reaction>" cards need that reaction set off this run (was: ever discovered).
- Save data: none.
- Hooks: game.js gainXp -> wupLevel; draft.js draftLoot/draftBox/draftTitle -> 'wup', 'wupfork'; ui.js HUD/armoury -> wTier, wLvText.
- Risk: weapons reach fewer levels' worth of stats early (tier 2 = old Lv 3 only at level 4); balance re-sim pending.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Enemy bullets get the v10 damage cut
- Systems: enemies, difficulty
- Files: game.js, boss10.js
- What: enemy and boss bullets read their damage from the enemy def, so V10_DIFF.dmg never reached them (bullets were 45 to 69% of damage taken in run logs). New V10_DIFF.bullet (0.6) applies in eBullet; rival bullets keep their own knob.
- Save data: none.
- Hooks: game.js eBullet -> V10_DIFF.bullet (one line).
- Risk: easier race; tuning pending a 6-run sim.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 V10 clean-up after the weapon roster change
- Systems: weapons24, ui (Field Guide, Gene Bank, weapon panel), loadout, tutorial, school, guide tool
- Files: w24look.js (new), ui.js, loadout.js, tutorial.js, school.js, index.html, tests/tools/guide.js, GAME_GUIDE.md
- What: the 24 weapons get their own icons and unique badge codes (they all fell back to the pistol); a signature weapon's old id now reads as the new name in combos, pairings and the Tackle Box; only the 4 combos, 7 pairings and 1 super combo whose weapons are all among the 24 are listed (text rewritten with the new names); the Field Guide lists 24 weapons, V10 Feats and sample sequences (and no longer crashes on them); the Gene Bank no longer sells archived weapons; the Feat tutorial and Level 0 Feat room use V10 Feats; the GRUDGE card drops the Grudge Rifle; the guide lists only the 24 weapons.
- Save data: none.
- Hooks: ui.js codexHtml/renderBank/profileHtml/weapon panel and loadout.js loadoutCombos call wl_* helpers (w24look.js); school.js feat room f10Give.
- Risk: menus only. Old-id name sync renames archived defs (Lab Bench shows new names). Pre-existing failures: schooltest, inspecttest.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Race fixes from a run log: XP pull, weapon slots at Lv 5/12, gentler death stare, branches in the log (v10.12)
- Systems: pickups, draft, bosses, run log
- Files: game.js, data.js, bosses.js, meta.js, draft.js, tests/drafttest.js, tests/sim/race.js
- What: in the race, loose XP follows you from 1600 away at 190/s (was 650 at 85) and the magnet reaches 1.5x further; weapon mounts come at Lv 5 and 12 (was 8 and 22); The Immune Eye's death stare warns for 1.6 s (was 1.1) and hits for 60%; the run log shows each weapon's branch choices {A/Lv6/Lv10}. race.js prints XP collected, weapons and boxes. drafttest samples more drafts (it flaked).
- Save data: none.
- Hooks: none (edits inside game.js updatePickups, data.js SLOT_LEVELS, bosses.js glare).
- Risk: faster levelling (bot sim: XP collected 80 to 97%, was 66 to 90%); bot still 0/3 wins, dying to bullets at 5 to 7 min.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 6: Peekaboo, Eggs, Chest Burster, The Runs
- Systems: weapons, upgrades
- Files: wup6.js (new), index.html (script tag after wup3.js), ARCHITECTURE.md (script order), tests/wup6test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg. Costs are real stat changes (BOO and smite damage, hide time, lure, trail damage, undead life, cap and damage). Unnamed Lv 6 cards were named (Standing Room Only, Encore, Silent Running, Sneak Attack, Pass It On, Stampede, Bigger Basket, Triple Yolk, Egg Trail, Golden Opportunity, Warm Glow, Time Bomb, The Staff, Adoption Papers, Chronic Condition, Open Casket, Soul Searching, Remote Detonation, Burning Rubber, Footloose, Full Circle, Flashpoint, Creature of Habit, Well Trodden).
- Save data: none.
- Hooks: none added to shared files. Peekaboo and Eggs are toy weapons, which fireWeapon sends to toyFire before the 'fire' hook, so wup6.js wraps globals instead (peekSpot, toySteer, toyAim, toothFire, toothTaken, toothLure, hurtPlayer, killEnemy, sigwTick, wupDmgMul, v10Draw), the way wup1.js does for projHit.
- Risk: once a Chest Burster card is taken, sigwTick no longer sees that weapon's undead (they are lifted out of G.turrets for the call and managed in wup6.js, so they do not count towards the shared 8-pet total). Simplified: Rattle flings the false position 230 away (not left at the real position); Sneak Attack gives other weapons +30% while hidden (they already fire while you are hidden); Don't Count Your Chickens also makes eggs last 7 s so they can reach full charge at 6 s; Open Casket also spreads infection to two neighbours (rising from any kill already happens); Chest Burster undead have no melee, so the Dead Useful cost cuts their shot damage; Hookworm undead sit on their host and fire from it; the Runs' loop and wave checks use the trail pieces, not the exact path.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 3: Rent Free, Hot Mess, Family Ties, Skill Issue
- Systems: weapons, upgrades
- Files: wup3.js (new), index.html (script tag after wup2.js), tests/wup3test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg and acting through the weapons24.js hooks (stats, fire, hit, dmg, kill, tick). Costs are real stat changes. Unnamed Lv 6 cards were named (Cold Spot, Second Sighting, Ghostly Tug, Hitching a Ride, Spreading Spooks, Friendly Ghost, Backdraft, Hot Tub, Hot Foot, Burning Bridges, Short Fuse, Powder Keg, Roach Motel, Compaction, Bumper Cars, Let Go, Appetite, Afterglow, Bank Shot, Hat Trick, Weight Class, Prime Cut, Splatter Zone, Chain Tenderising).
- Save data: none.
- Hooks: none added to shared files.
- Risk: Skill Issue cards watch the armoury bowling list (G.armBowl); Family Ties cards edit orb fields (pull, aura, r); Hot Mess cards edit their own zones. Simplified: pets are invulnerable ghosts drawn with particles; Appetite/Afterglow add a second blast after the engine's supernova.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 4: There Is No Spoon, Nappy Mines, Soulmate Signal, Unwanted Contact
- Systems: weapons, upgrades (weapons24.js engine), defence (Umbilical Shield reads the Membrane hit)
- Files: wup4.js (new), index.html (script tag after wup2.js), tests/wup4test.js (new)
- What: all 60 cards for the four signature weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise (12 new names, e.g. Afterbirth, Water Breaks, Pass the Parcel, Nappy Pin, Stretch Marks, Love Triangle, Split Ends, Echo Chamber), and three masteries each. Costs are real stat or behaviour changes. Every card draws something (ring, line, tape, floatText) and counts itself in w.w4.fx for the test.
- Save data: none.
- Hooks: none added to shared files. wup4.js wraps globals at load: updateSiphon (replaced by a copy plus the cards once a card is taken), mineDrop, mineScale, detonateMine, twinPoints, wupDmgMul, wupHit, killEnemy, rateBonus, and (on first card taken, because fight.js and pdef.js load later) fightArc, fightStatus, fightPayoff, pdefHurt. Shares the 'phit' / 'pend' hook kinds with wup1.js (same globalThis.WUP_PROJ_HOOKS guard).
- Risk: other branches that edit updateSiphon, detonateMine or pdefHurt will not see their change take effect on a slot with a card. Simplified: stored-bullet staleness is not modelled (the base weapon has none, so Return to Womb's "+2 s" is dropped); Mirror Womb bounces half the shots that enter the absorb radius, not only ones that would hit you; Odd Sock and Evil Twin pick once per wave (once per 20 s or 25 s outside wave mode).
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 5: Ewww Gross, Blowing Bubbles, One of These Days, Sister Cousin
- Systems: weapons, upgrades (weapons24.js engine), toys (Red Tape, Bubble Wand, Due Date), modifiers (multiplying)
- Files: wup5.js (new), index.html (one script tag after wup2.js), tests/wup5test.js (new), ARCHITECTURE.md (script-order line)
- What: all 60 cards for the four Mucus/Blood projectile weapons are live through wupReg: three promises (Lv 3), two Lv 6 cards and a wildcard per promise, three masteries each. 24 in-promise Lv 6 cards are newly named (Corporate Merger, Group Chat, Puppet Strings, Gossip, Tangled, Escalation, Locked In, Cannonball, Chaperone, Return to Sender, Popcorn, Stuck Together, Early Delivery, Short Notice, Pass the Parcel, Rush Hour, Compound Interest, Fine Print, Runts of the Litter, Overcrowding, Taste for It, Nepotism, Pack Hunting, Pile-On). Costs are real stat or behaviour changes. Sister Cousin now really splits on a kill from Lv 1 (its slot starts with the 'multiplying' modifier; the text promised it but nothing did it).
- Save data: none.
- Hooks: none added to shared files. wup5.js wraps these globals at load, each a no-op for a slot without a card: toyFire (so toy weapons reach the 'fire' hook, which fireWeapon skips for them), canBubble, toyHold, bubbleSoak, bubbleHit, bubblePop, dueMark, duePop, toyHurt, modHit, makeSlot, wupDmgMul, hurtPlayer, v10Draw; and the shared 'phit'/'pend' kinds (same WUP_PROJ_HOOKS guard as wup1.js). Candidates to become real one-line hooks.
- Risk: Group Chat is thin (the base tape already shares to every member at any distance, so the card only lifts the boss discount). Hit-ups that are a share of max health (snap, Compound Interest) use mult 1. Lost in the Post and Postponed act in a hurtPlayer wrapper before dodge and boss-cap rules. Cotton Wool/Postponed/Lost in the Post share one wrapper.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Every level-up and DNA pick opens at once (v10.11)
- Systems: draft
- Files: draft.js, tests/drafttest.js
- What: the 40 s spacing between draft screens is gone (`DRAFT.budget` 0): level-ups and DNA pickups open their card screen immediately.
- Save data: none.
- Hooks: none.
- Risk: more card screens close together; faster power growth.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: the game froze at the second level-up (v10.10)
- Systems: draft, core loop
- Files: game.js
- What: queued level-up boxes waiting out the 40 s draft spacing stopped the game clock, so the wait never ended. A waiting box now goes to the back of the queue and the game keeps running.
- Save data: none.
- Hooks: none (game.js frame loop condition).
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 1: Standard Issue, Maximum Gains, Nervous Wreck, Panic Button
- Systems: weapons, upgrades
- Files: wup1.js (new), index.html (one script tag after weapons24.js), tests/wup1test.js (new)
- What: all 60 cards for the four Force weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise, and three Lv 10 masteries (15 per weapon). Costs are real stat changes. Marks, bounce zigzags, lanes, nuts, confetti, lumps, fragments and jaws are drawn so each "Shows" line is true.
- Save data: none.
- Hooks: none added to shared files. wup1.js wraps four globals at load: projHit and projEnd (new hook kinds 'phit' and 'pend', guarded by globalThis.WUP_PROJ_HOOKS so later wup*.js files can share them), wupDmgMul (marks that raise damage from your other weapons), hurtPlayer (Untouchable) and v10Draw (marks). Candidates to move into weapons24.js / game.js as real one-line hooks.
- Risk: the four weapons' fire paths are replaced by dispatchers once a Lv 3 card is taken (Maximum Gains tags the engine's own volley; Panic Button places its own blast, so mutFire/modFire do not apply to it). A card "heavy hit" is applied directly (one Shell layer off, Poise up) and does not trigger Blood Pressure.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The new eight samples in code: three starters each, Race only (v10.09)
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 2: Acid Spit, Red Flagship, Nocturnal Emission, Little Prick
- Systems: weapons, upgrades (weapons24.js engine), combat (bars read and paid off from a card)
- Files: wup2.js (new), index.html (script tag after weapons24.js), tests/wup2test.js (new)
- What: the four weapons now have their three promises (Lv 3), nine Lv 6 cards (two per promise plus a wildcard; 18 in-promise names are new, e.g. Second Helping, Backsplash, Cascade Failure, Rising Damp, Reef Knot, Terminal Clause) and three masteries each, all registered with wupReg and acting through wupOn hooks. Costs are real stat or damage changes; every card draws something (ring, line, drips, floatText).
- Save data: none.
- Hooks: none added to shared files. wup2.js only reads fight.js, combat.js and game.js (damageEnemy, spawnProj, zones, v10fx lines). Globals are all w2* / W2_*.
- Risk: Snot Ocean is read as radius x3 (not area x3); Pin Cushion needles do 50% each; Projectile Vomit swaps stats and fire() but leaves def.v10atk as proj (its hits carry atk 'beam'). Nocturnal Emission strands, bogeys and bubbles are drawn with v10fx dots and lines. tests/wup2test.js is not in run.sh's ALL list (run it by name).
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The new eight samples in code: three starters each, Race only
- Systems: samples, weapons, ui
- Files: samples10.js, feats10.js, mutations.js, fight.js, game.js, ui.js, tests/samplestest.js, tests/ufeatstest.js, tests/v10test.js, tests/voicetest.js
- What: Samples are now Baseline, Alpha, Beta, Private Schooled, Ordered Online (Mucus / Fire), Redtail, Prawn Again and Not of This World, with ids baseline, alpha, beta, private, ordered, redtail, prawn, alien (old over, late, friend, parcel, unsol, unacc, other migrated). The first draft offers the sample's three starters (w24Starters); the other two stay in the pool. Not of This World shifts a per-slot type (w.typeOver) every 20 s instead of swapping weapons. All samples are open (S10_ALL, unlock rules kept). The Experiment picker and quick start use only the Race (S10_PETRI hides the Petri Dish). Private Schooled and Not of This World carry shield: true (s10Shield()).
- Save data: META.s10 / META.s10runs keys change from the old ids to the new ones (test build, no migration); profile ids s10_<new id>.
- Hooks: fight.js fightHit reads src.w.typeOver; game.js spawnProj colours by w.typeOver; ui.js quickStart uses s001.
- Risk: old saves with META.profile s10_over etc. fall back to a missing profile; the Petri Dish is unreachable from the sample screen.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Player shield: samples, Rubber Johnny or Latex Protection, drawn as the original forcefield
- Systems: combat (player defences), relics, draft, render (shield bubble)
- Files: pdef.js, stamina.js, bodymods.js, render.js, bosspack.js, data.js, tests/shieldtest.js (new), pdeftest.js, bubtest.js, GAME_GUIDE.md
- What: Nobody has the Membrane by default now. It is the player's shield, granted by Private Schooled / Not of This World (s10Shield, from samples10.js), the Rubber Johnny relic (replaces its old catch-a-hit skin under V10; text rewritten) or the new Latex Protection card (offered while you have no shield, takes a Genome slot). Thicker Membrane and Faster Recharge need a shield. It draws as the original forcefield bubble (armourRing) with the elastic physics and surface contact (bubbleBump); the blue arc is gone. Soaks and Static recharges set G.armFlash; a hard bump into a wall wears the Membrane 4% (was armour).
- Save data: none.
- Hooks: render.js `if (!V10 || pdefShieldUp()) armourRing(px, py)`; stamina.js armourRing guard and k -> pdefShieldUp / pdefShieldK; bodymods.js bubbleOn -> pdefShieldUp, bubbleBump dent -> pdefDent; bosspack.js bpRelicIn rubber skin `&& !V10`.
- Risk: Baseline and most samples lose 30% max health of soak (balance: re-sim). Latex Protection competes for Genome slots. s10Shield must be added by samples10.js (read via typeof guard).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Samples renamed; three unique starting weapons each; 15 weapon renames (docs only)
- Systems: sequences, weapons (docs only, redesign docs)
- Files: SAMPLES.md, BASE_WEAPONS.md, WEAPON_UPGRADES.md, COMBAT_MATRIX.md, FEATS.md, MODIFIERS.md, MUTATIONS.md, UPGRADES.md, VOICE_GUIDE.md, AUTORUN_AUTOAIM.md, README.md
- What: The eight samples are now Baseline, Alpha (rewritten as a manosphere podcaster), Beta, Private Schooled, Ordered Online, Redtail, Prawn Again and Not of This World. Each has three starters of its own (all 24 weapons, none shared), offered in the level 1 draft. Fifteen weapons renamed (Nut Shot is Standard Issue, Tooth Fairy is Eggs, and so on); the Eggs upgrade cards were rewritten from teeth to eggs.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Two open issues: Ordered Online has no Acid starter; Not of This World's type-shifting passive needs a matrix line.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades: Lv 6 wildcards (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md
- What: Lv 6 now offers three cards: two inside the chosen promise and one wildcard from outside it (72 new cards; 360 in all).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades: choices at Lv 6 and 10 (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md, CLAUDE.md
- What: Lv 6 is now a two-card choice inside the chosen promise; Lv 10 is three extreme masteries per weapon (72 new cards). 288 cards in all.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Five masteries break shared caps on purpose (listed in the doc).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades second draft; Nappy Mines is Fire (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (rewritten), BASE_WEAPONS.md, UPGRADES.md, README.md, CLAUDE.md
- What: upgrades are now three promises at Lv 3, each grown at Lv 6 and Lv 10, with trade-offs, visible tells and autorun-mode notes; no upgrade changes damage type. Nappy Mines is Fire from the start (burning patch footprint instead of an Acid Pool).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrade forks (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (new), UPGRADES.md, README.md, CLAUDE.md, COMBAT_MATRIX.md
- What: 216 upgrade cards (three at each of Lv 3, 6, 10) for the 24 base weapons; weapon forks move from Lv 5/10 with two cards to Lv 3/6/10 with three.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Overrides the UPGRADES.md weapon-fork rule and the MODIFIERS.md "a fork never changes damage type" line.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Base weapons decisions (docs only)
- Systems: weapons, chemistry (docs only, redesign docs)
- Files: BASE_WEAPONS.md, COMBAT_MATRIX.md, SAMPLES.md, ENEMY_DESIGN.md, FEATS.md, tables/*.csv
- What: Static + Mucus reaction renamed Snot Socket (the weapon takes Sticky Situation); four weapon renames confirmed; three sample starting weapons changed.
- Save data: none.
- Hooks: none.
- Risk: none (no code). `combos.js` still has a combo named Sticky Situation.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Base weapons roster (docs only)
- Systems: weapons (docs only, redesign docs)
- Files: redesign docs/BASE_WEAPONS.md (new, now self-contained), WEAPONS.md and SIGNATURE_WEAPONS.md (moved to archive/), README.md, CLAUDE.md, COMBAT_MATRIX.md, SAMPLES.md
- What: records the 24-weapon roster (10 foundations with animation specs, 14 signatures) and archives the other 72; lists the open naming and sample-start issues.
- Save data: none.
- Hooks: none.
- Risk: none (no code changed). Code pass is described in BASE_WEAPONS.md section 6.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Player defences and defence cards
- Systems: combat, v10, ui (loot cards only)
- Files: pdef.js (new), game.js, v10.js, render.js, index.html, tests/pdeftest.js (new), tests/v10test.js, tests/fighttest.js
- What: under V10 you start with a base Membrane (30% of max health, recharges like an enemy's) and can hold Shell layers, Squishy, Evasion and Thorns from six new defence cards (Thicker Membrane, Faster Recharge, Shell Layer, Squishy, Evasion, Thorns). Hits resolve in matrix 11.1 order in pdef.js; a hit fully soaked by the Membrane applies no status. Level-ups now offer Switched at Birth plus two different defence cards (one box a wave unchanged). Blue Membrane arc and brown Shell rings are drawn round you; the old armour ring is off under V10.
- Save data: none (G.pd is per run; run log gains fst.pMem, pLayers, pMiss, pThorns).
- Hooks: game.js hurtPlayer -> pdefHurt (replaces the armour block under V10); v10.js v10Tick -> pdefTick, v10Draw -> pdefDraw, v10Loot -> pdefOffer; render.js armourRing skipped under V10.
- Risk: player survivability shifts (a free 30% Membrane); fighttest and v10test adjusted for it. Genome slots (4) are enforced for defence cards only.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Merge v10.04 and record the implementation plan
- Systems: none (docs and merge)
- Files: merge of claude/zealous-clarke-i26iot; NOTES.md (v10 section); redesign docs/README.md
- What: this branch now carries the v10 test build plus the newest redesign docs. NOTES records the Soul, defence and player-armour decisions and the phase plan.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: agent guide for the folder
- Systems: docs only (redesign docs)
- Files: redesign docs/CLAUDE.md (new), redesign docs/README.md, CLAUDE.md
- What: per the user, a CLAUDE.md in the redesign folder tells agents the source-of-truth order, which doc holds what, the hard limits and vocabulary, what to ignore, and the checks before finishing. The root CLAUDE.md points to it.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: mutation cards
- Systems: docs only (redesign docs)
- Files: redesign docs/MUTATIONS.md (new), MODIFIERS.md, UPGRADES.md, COMBAT_MATRIX.md, README.md
- What: per the user, the run's change-the-sample cards are called Mutations (the attack-behaviour list keeps the internal name modifiers). 33 mutations from the user's list, mapped to the rules: body, weapon, damage-type, trade-off and rare synergy. Weapon mutations attach to a weapon (max 3); the rest use Genome slots and rank up when picked again. Bad Blood and Leave a Little Something lost their new ground objects; Crossed Wires became the general Catalyst (the combinations are the 21 reactions). Starting pool of 8.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Feats as the consciousness's gifts; gravity well and lunge
- Systems: docs only (redesign docs)
- Files: redesign docs/FEATS.md (new), MODIFIERS.md, COMBAT_MATRIX.md, SIGNATURE_WEAPONS.md, WEAPONS.md, UPGRADES.md, VOICE_GUIDE.md, README.md
- What: per the user, Feats are gifts from the consciousness: 16 gifts for every sample (11 from the user's ideas list, 5 new), 8 sample-exclusive gifts (one per sample), and the best 15 of the 48 original Feats mapped to the current rules and re-gifted (gift line on the card, old Scientist line as a Field Guide note), with a suggested starting pool of about 15. New attack modifiers: gravity well (pulls bodies and bends shots; Black Hole, Sofa Crevice, Wandering Womb, Van de Graaff) and lunge (moves you). Utility Feats have no damage or attack type.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: open issues settled (decisions 29 to 32)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, WEAPONS.md, SAMPLES.md, ENEMY_DESIGN.md, UPGRADES.md, DEFENCE_TYPES.md, SIGNATURE_WEAPONS.md, README.md, tables/combat_interactions.csv
- What: per the user, (29) the Force + Soul reaction is renamed Out-of-Body Experience, so the Soul Burst weapon keeps Soul Purpose; (30) The Other Half's First Contact is a fifth reaction trigger kind (Feat): it counts as a hit of the old and new type for reactions only, at most 8 per use; (31) the player gets defences from upgrade cards (Genome slots) or built into some samples, weapons and Feats (no slot); Assimilation is dropped; (32) built-ins stay rare: The Cold Parcel has 20% Evasion, Thorny Onesie gives Thorns, no sample Feat has one.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: COMBAT_MATRIX is the single source; CSVs generated
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, README.md, MODIFIERS.md, WEAPONS.md, SIGNATURE_WEAPONS.md, UPGRADES.md, tables/*.csv, tables/export.py (new)
- What: per the user, every combat rule and status now lives only in COMBAT_MATRIX.md (new: type rules in section 2, all defence rules and interaction rows in section 3, triggers and design status on every status in section 4, attack-type rules in section 13, a where-things-live map and the CSV export in section 14; old section 9 merged away). DAMAGE_TYPES, DEFENCE_TYPES and ATTACK_TYPES are cut to identity, look, strengths and weaknesses plus pointers. ENEMY_DESIGN cites the matrix instead of restating it. The three CSVs are now generated by tables/export.py from the matrix. Stale lines fixed: "named weapon combo", Static "Charge to interrupt", Matchstick's trail as a world object, "five" Soul reactions (six), signature weapon counts, a wrong rule reference on Placental Siphon, Yo-Yo Diet's missing modifier.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Heartburn signature (returning droplets)
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md, WEAPONS.md, MODIFIERS.md
- What: per the user, Heartburn's signature is "coming back up": each droplet flies out to full range and back, hitting on both passes (the Returning modifier, now allowed on Spread). Damage per droplet 3.4 to 2.4 to compensate.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: shipped ground objects only, greyscale notes gone, tidy-up
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md, SIGNATURE_WEAPONS.md, WEAPONS.md, SAMPLES.md, VOICE_GUIDE.md, tables/*.csv
- What: per the user, only shipped ground objects plus wax (decision 27): Burn zones, corrosive slicks, clot patches and Heartburn's reflux puddle are cut. Slick Move now leaves an Acid Pool, Caught in the Clot Snares the first enemy across the blood pool, Flammable Mucus flares once (a burst, not a zone), Smouldering elites give off a death Burst. Shipped terrain added to the world objects table. Acid stays shocking pink (decision 28). Greyscale notes removed (Lab view is retired). Em dashes replaced, duplicate link removed.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Heartburn has no signature until one is chosen.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: modifiers stack, forks can rarely change attack type
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md, MODIFIERS.md
- What: per the user, a weapon can carry several modifiers (the two-plus-one cap is gone) and a fork can, rarely, change a weapon's attack type (mostly at the Lv 10 mastery fork). Damage type never changes.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: upgrades and progression
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md (new), README.md
- What: the progression model: one shared card draft (Acquire, Enhance, Transform, Specialise), slot caps (3 weapons at levels 1/8/22, 3 Feats with the sample's unique Feat fixed, 4 shared Genome slots for mutations and Assimilation defences), Feat levels with forks at 3 and 5, weapon forks at 5 and 10 (one mastery a run; forks use the upgrade modifier slot from MODIFIERS.md, never change attack type), a 50/25/25 sample-type pool lean, Skip/Reroll/Banish (Remove 2, Fewer like this 1) and a one-screen-per-40 s interruption budget.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: pets rule, modifiers, six more signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIERS.md (new), COMBAT_MATRIX.md (12.3 Pets), SIGNATURE_WEAPONS.md, WEAPONS.md, ATTACK_TYPES.md, README.md
- What: pets get one rule (damage, leash 300, 4 per weapon and 8 in total, 20% of your health, respawn 3 s, ignore statuses and hazards, enemies only target nearby pets). MODIFIERS.md defines 18 modifiers with caps (homing, piercing, chaining, ricochet, returning, orbiting, delayed detonation, lobbed, trail, self-centred, sweep, anchored beam, rapid volley, every Nth, growing, scaling, multiplying, summoned). Twin Telepathy, Blood Blister, Thorny Onesie, Seeker Siblings, Flagellum Flail and Nose Goblins become signature weapons 21 to 26 (68 weapons in all).
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Samples doc: tell, quirk and payoff format
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md
- What: SAMPLES.md rewritten in the user's format: design principle (tell, quirk, payoff), one-line roster, a page per sample (core fantasy, behaviour, named passive, Unique Feat, visual signature, consciousness, Scientist, selection-card gag), visual rhythm, guardrails and the guiding test. Rules, starting attack types (linked to WEAPONS.md section 4), unlocks and open decisions kept at the end.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: one weapons list
- Systems: docs only (redesign docs)
- Files: redesign docs/WEAPONS.md (new), README.md
- What: all 62 redesign weapons in one table set (42 matrix weapons from v10.js V10_NAMES, 20 signature weapons) plus the 34 parked originals with reasons. Flags a new name clash: Soul Purpose is both the Soul Burst weapon and the Force + Soul reaction. Section 4 maps each SAMPLES.md sample to its starting matrix weapon.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Samples design: eight new playable characters
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md (new), README.md, VOICE_GUIDE.md
- What: Eight samples (Baseline to Other Half) to replace the sequences as playable characters: types, starter attack type, passive, unique Feat, Scientist line, unlock, story and visual language each, aligned with the 26 reconciliation decisions (Soul possesses, no automatic Fire spread, Lab view retired, type colours). Profiles become trait-named builds; game modes become "Experiments".
- Save data: none.
- Hooks: none.
- Risk: none now; when built, replacing sequences touches seqsel/seqlock/genes and the META.prof migration.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Fire signature weapon drafts
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md
- What: five Fire signature drafts, one per attack type beside Pub Crawl's Pool: Heartburn (original `flamer`, moved from Acid), Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation. Names checked against the code (Hot Flush, Running a Temperature and Fever Dream are taken).
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Moving `flamer` from Acid to Fire changes Heartburn's existing upgrades and Pairings when ported.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md (new), COMBAT_MATRIX.md (section 12, Fear row), README.md
- What: 15 original weapons (Premature Evangelation, Nappy Mines, Pub Crawl, Peekaboo, Black Hole, Tapeworm Seeder, Red Tape, Due Date, Leeches, Static Cling, Lard Lobber, Placental Siphon, Bubble Wand, Tooth Fairy, Upchuck) return as signature weapons beside the 42-weapon matrix, each retyped to one of the seven types. New rules: echo damage, Pull, allied creatures, player hiding, bounded chains, lures, merging pools, projectile blocking.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Porting will touch weapon ids that have Pairings on other branches.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: formulas and starting values
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (new section 11, status rows), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md (Damage type column), AUTORUN_AUTOAIM.md (SHELLED, MEMBRANED, TOUGHEST), README.md, tables/*.csv
- What: every mechanic now has a formula and a starting number: hit order (Evasion, Membrane, Shell, Squishy, then crit); one build-up bar formula (raw damage over bar size x max HP, 2 s drain); heavy Force hit at 15% max HP; reaction damage as % of the triggering hit with a 1.5 s lockout; Possessed AI; Charge as a conductor; Extraction on bleeding kills; Membrane recharge only (no supercharge); defence, status and world-object values; enemy damage types on a bell curve; Snot Trap rename.
- Save data: proposed META.rxSeen (reaction discovery); nothing in code yet.
- Hooks: none.
- Risk: none (docs only); numbers need playtest.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: reconciliation (26 decisions)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (rewritten), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, VOICE_GUIDE.md, README.md, tables/*.csv (regenerated)
- What: cross-doc contradictions settled one by one (COMBAT_MATRIX.md section 10). Reactions use four trigger kinds (state + hit, world object + hit, dual-type weapon, Pairing) and are identical in every doc; Soul reactions rebuilt on Possessed and the Soul Mark retired; Dodge defence renamed Evasion (miss chance on Contact, Projectile, Spread only); Acid strips Shell for good and has no DoT outside Pools; Fire uses a Burn bar with one Ignition flare and no auto-spread; Squishy blunt only; Shell layers wear slowly under ordinary hits; Mucus smothers Fire; world objects split from statuses; player can have every defence and status except Possessed; reactions are discovered; Lab view to be retired; plain internal ids to come.
- Save data: none yet (decision 19 will rename internal type ids and needs a migration).
- Hooks: none.
- Risk: decisions 19 to 21 (id rename, Lab view retired, palette) are big code changes still to do; see redesign docs/README.md "Follow-on work".

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Soul as mind control, TOUGHEST restored, feature-file enemy rows
- Systems: docs only (redesign docs)
- Files: redesign docs/AUTORUN_AUTOAIM.md (copied from claude/zealous-clarke-i26iot), DAMAGE_TYPES.md, DEFENCE_TYPES.md, COMBAT_MATRIX.md, ENEMY_DESIGN.md, README.md, tables/mechanics_statuses.csv, tables/combat_interactions.csv; NOTES.md (one bullet)
- What: Soul is mind control only: new Possessed status (full build-up turns an enemy on its mates for a few seconds; bounded, bosses reduced); essence and resource bypass removed everywhere (Essence Drain and Soul Fracture rows gone). TOUGHEST restored (HIGHEST HEALTH was removed in AUTORUN_AUTOAIM.md). ENEMY_DESIGN 5.3 now reviews all 27 enemies from foes.js, foes2.js and foes3.js, with revisions for Litmus Cell, Mirror Cell, Platelet Clump and Grease Ball.
- Save data: none.
- Hooks: none.
- Risk: v10 code may still describe Soul with essence wording.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Enemy design doc: review fixes
- Systems: docs only (redesign docs)
- Files: redesign docs/ENEMY_DESIGN.md
- What: Fire damage and Burning separated; defence wording allows enemy-specific states that aren't hidden defences; exact triggers for Static Sock (Crackle by distance), Stress Ball (qualifying hit, reset, decay, hazard-safe rebound), Mosquito (fixed bite, half back within 4 s, not Extraction) and Snot Bubble (any Static hit bursts it); targeting policies framed as tools (TOUGHEST, which doesn't exist, is now HIGHEST HEALTH); roster uses in-game names with code ids, adds Paramecium and lists the unreviewed foes/foes2/foes3 enemies; Fire prototype order (Matchstick first).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Combat rulings 33 to 38 (docs)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (section 10 rows 33-38, 11.3, 11.5), tables/mechanics_statuses.csv (regenerated)
- What: reaction damage is explicit per reaction (no hidden 60%/150% on every reaction); Corrosion makes unshelled enemies Corroded for 4 s; a hit fully soaked by Membrane applies no status; one shared burn per target; Shell wear rule; the 21 reactions are inventory until playtested.
- Save data: none.
- Hooks: none.
- Risk: none (docs).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Pure combat resolver (combat.js)
- Systems: combat (new)
- Files: web/js/combat.js (new, not yet loaded by index.html), tests/combatunit.js (new, plain node)
- What: matrix 11.1 hit resolution as pure functions (makeDefence, resolveHit, tickDefence, addBurn, COMBAT constants) with decisions 33-37; 45 unit tests. Crits fill bars and judge heavy hits from pre-crit damage.
- Save data: none.
- Hooks: none yet (wired into damageEnemy/hurtPlayer in the slice).
- Risk: none until wired.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Voice line tables (voice.js)
- Systems: voice (new)
- Files: web/js/voice.js (new, not yet loaded)
- What: Scientist and consciousness lines for 19 events with composure tiers, a Scientist and a consciousness first-sighting line for 81 enemies and bosses, 13 first-time status hints, sampleId (1A..1Z, 1AA) and voiceLine (no repeats, tier rarity).
- Save data: none.
- Hooks: none yet (show.js, intro.js, finale.js later).
- Risk: none until wired.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Combat slice: defences and the first reactions in play (v10.05)
- Systems: combat (new fight.js), roster, v10, chemistry, engine
- Files: fight.js (new), roster.js (new, data), combat.js (addBurn renamed burnAdd: chem.js has one), game.js, chem.js, v10.js, meta.js, index.html, tests/fighttest.js (new)
- What: enemies now carry the five defences from the roster (Macrophage Squishy, Diatom/Spire/Water Bear Shell, Mucus Wall/Alpha Swimmer Membrane, Sprinter/Quantum/Ghost Evasion, the new Ingrown Hair Thorns), drawn as rings (blue Membrane arc, brown ring per Shell layer, thorn spikes, dashed Evasion ring) with "miss" puffs. Hits resolve through combat.js; crits come last. Acid builds Corrosion (strips a Shell layer, or Corroded for 4 s) with no damage over time; Mucus Snares (55% slow, puts out Burning); Static Charges (+20% Static, arcs 3 jumps, discharges on death). Five reactions: Corrosive Splash, Snot Rocket, Conductive Pool, Slick Move, Sticky Situation, named on first discovery (META.rxSeen). Per-run stats in G.fst, saved in the run log.
- Save data: META.rxSeen (list of reaction ids) added; run log entries gain `fst`.
- Hooks: game.js damageEnemy -> fightHit (replaces armour under V10; crit multiplier skipped under V10), applyElement guard e.fOk; game.js killEnemy -> fightDeath; chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js runSummary fst.
- Risk: balance. Bot sim (2 runs) dies at waves 4-5, same as the build before the slice (waves 3-5): v10 has almost no upgrades yet. Blood, Soul and Fire keep v10.04 statuses for now. Shocking Impact needs a dual-type weapon (none yet).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 All seven damage types and twenty reactions
- Systems: combat (fight.js), engine
- Files: fight.js, game.js, tests/fighttest.js, tests/v10test.js
- What: Blood Bleeds (30% of the hit over 3 s, 3 at most); dying while bleeding leaves a blood pool and heals you a little (Extraction, 1% max health, 6 a second at most). Soul fills the Possess bar only. Fire adds to one shared burn; Snared puts it out. Two Snared enemies touching are Conjoined for 3 s. The other fifteen reactions now fire: Blood Pressure, Out-of-Body Experience, Flashover, Caustic Breach, Soul Erosion, Premature Evaporation, Blood Circuit, Interference Pattern, Arc Flash, Caught in the Clot, Held in Suspension, Flammable Mucus, Blood Donor, Cauterise, Spectral Combustion (Soul Beam + Burning Ground, both Lv 5+). Area hits now land on Possessed enemies (autoaim still skips them), so the Soul reactions can happen.
- Save data: none new (META.rxSeen gains the new ids).
- Hooks: game.js damageEnemy charmed guard skipped under V10.
- Risk: Possessed enemies can now be killed by your area weapons. Shocking Impact still needs a dual-type weapon.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Draft core (draft.js) (v10.06)
- Systems: draft (new), v10, loot
- Files: draft.js (new), v10.js, game.js, index.html, tests/drafttest.js (new), tests/v10test.js, tests/pdeftest.js
- What: level-ups and elite/boss chests open one shared draft: weapon upgrades, Switched at Birth, defence cards and any card a feature file registers (Feats, mutations). Acquire cards need a free slot (3 Feats, 4 Genome shared by mutations and defences). Weapons reaching Lv 5 or 10 and Feats reaching level 3 or 5 get a 2-card fork screen. Wave mode: one level draft a wave plus chests, at the wave break; race: at most one screen per 40 s (forks never wait). Banish data (G.banish, G.fewer) is honoured; the buttons come with the UI pass.
- Save data: none.
- Hooks: v10.js v10Box -> draftBox, v10Loot -> draftLoot; game.js main loop: a 'wait' from v10Box rotates the box to the back of the queue.
- Risk: more drafts in race mode than v10.04's every-strand switches are fewer now (40 s budget); elite/boss chests now open drafts in wave mode.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Wave-mode drafts queue instead of vanishing; sim uses the real draft rules
- Systems: draft, tests
- Files: draft.js, tests/sim/wave20.js, tests/v10test.js
- What: in wave mode every level-up draft now queues and plays at the wave break (UPGRADES.md 9); before, every level after the first in a wave was dropped. The wave sim now sends boxes through v10Box like the real loop and prints combat stats (G.fst) and the final build per run.
- Save data: none.
- Hooks: none.
- Risk: more upgrades per run in wave mode. Bot sims (3 runs): deaths at waves 8, 5, 8 (was 4 to 5).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Banish on draft cards; Switched at Birth keeps the weapon's level
- Systems: draft, ui, v10
- Files: draft.js, ui.js, v10.js
- What: draft cards carry two small buttons: Fewer like this (1 reroll: that family half as often) and Banish (2 rerolls: gone for the run); the screen then redraws. Switched at Birth now keeps the weapon's level, modifiers and weapon mutations instead of resetting it to Lv 1.
- Save data: none (G.banish, G.fewer are run state).
- Hooks: ui.js renderLootCards -> draftBanishBtns.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 modifiers (merged from agent-mods)
- Systems: weapons, modifiers (new)
- Files: modifiers.js (new), game.js, arsenal.js, v10.js, index.html, tests/modstest.js (new; the old body-mods test is now bodymodstest.js, not in the run list)
- What: all 20 modifiers (MODIFIERS.md) work on v10 weapons through w.m10, with modAdd / modHas / modsFor; weapon forks at Lv 5 and 10 now offer two fitting modifiers. Attack type and damage type never change.
- Save data: none (w.m10 is run state).
- Hooks: game.js fireWeapon -> modFire, spawnProj -> modProj, updateProjectiles -> modStep and modHit; arsenal.js meleeHit -> modMeleeHit; v10.js v10Fire -> modBeam and modBurstEnd, v10Tick -> modTick, v10Draw -> modDraw.
- Risk: Summoned pets can't be hurt (simplified); balance numbers (orbit 0.6x, pet 0.8x, every-4th 2.5x) untuned.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Your statuses from enemy damage types
- Systems: combat (pdef.js), engine
- Files: pdef.js, game.js, pstatus.js, tests/pdeftest.js
- What: an enemy hit that gets past your Membrane applies its damage type's status to you (matrix 11.5): Mucus Snares you (45% speed for 1.5 s, puts out Burning), Blood Bleeds (30% of the hit over 3 s, 3 at most), Fire burns (one shared burn, 20% of the hit over 3 s, at most 25% of max health held), Static Charges you (+20% Static taken for 3 s). Bleed and burn can kill. Each shows on you like on enemies. The old v9 player statuses (Snotty, Sick, Soaking wet, Lubricated) are off under V10.
- Save data: none.
- Hooks: game.js updatePlayer speed -> pdefSpeed (both speed lines); pstatus.js pstHit returns under V10.
- Risk: enemy Mucus/Blood/Fire/Static hits hurt more than before; enemy damage types come from roster.js dmgType.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The eight samples (samples10.js)
- Systems: samples (new), v10, combat, ui
- Files: samples10.js (new), v10.js, fight.js, game.js, pdef.js, ui.js, index.html, tests/samplestest.js (new), tests/v10test.js
- What: the sample screen lists the eight samples (locked ones show their unlock; the Unaccounted shows ??? until earned), then the Experiment (#002 The Petri Dish or #001 The Race). Each sample starts with its own matrix weapon and leans the draft to its types, with its passive: Baseline +5% stats; Overachiever fires 25% faster while moving; Late Starter gets damage and lifesteal below 30% health; Family Friend builds Corrosion 50% faster and its Possessed enemies hit 50% harder; Cold Parcel leaves a Snaring Mucus trail and has 20% Evasion built in; Unsolicited's Static hits add burn; Unaccounted's Possessed enemies make their friends Bleed; Other Half's weapons shift Fire, Soul, Static every 20 s. Unlocks follow SAMPLES.md (wave 10, recover from under 10%, beat the dish, survive a big hazard, Soul boss kill, beat Level 1; Mythical box still has no trigger). Unique Feats come with the Feats merge.
- Save data: META.s10 (unlocked sample ids), META.s10runs (runs per sample, for the 1A/1B IDs). META.profile now holds s10_<id>.
- Hooks: v10.js v10Samples -> s10Samples, v10Loot 'start' -> s10Start, v10Tick -> s10Tick; fight.js fightHit -> s10DmgMul, s10Hit; fightDeath -> s10Kill (game.js now passes src); pdef.js pdEvasion, pdefOffer -> s10Evasion; ui.js quickStart uses s10_baseline.
- Risk: the start draft is now one card (the sample's weapon); old saves' META.profile 'human1' still works through Lab Bench and quick start paths.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 mutation cards (merged from agent-muts)
- Systems: upgrades, combat, weapons, mutations (new)
- Files: mutations.js (new), tests/mutstest.js (new), index.html, fight.js, combat.js, game.js, v10.js, arsenal.js, tests/pdeftest.js
- What: 33 mutation cards (body, weapon, damage type, trade-off, rare), 20 Catalyst cards (one per unstable reaction, offered once discovered: +25% reaction damage and a shorter lockout per rank) and 4 Concentration cards (a build-up bar fills faster and drains slower), all in the draft. Eight make up the starting pool. Can't Sit Still is not offered to the Overachiever.
- Save data: none (G.muts, G.cat, G.conc and w.wm10 are per run).
- Hooks: v10.js v10Tick -> mutTick, v10Draw -> mutDraw; fight.js fightHit -> mutDmg/mutBarK/mutHit, rxLocked -> mutRxLock, fightStatus -> mutSnareK; combat.js resolveHit a.barK; game.js killEnemy -> mutKill, hurtPlayer -> mutHurtIn/mutHurt, gainXp -> mutLevel, computeStatsInner -> mutWeaponStats, fireWeapon -> mutFire, projectile hit -> mutProjHit, updatePlayer speed -> mutSpeed; arsenal.js rateBonus -> mutRate.
- Risk: more multipliers in the hit path (balance not simmed yet); the bigger pool dilutes defence cards.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Boss defences, fork screens, smarter auto-pick
- Systems: bosses (boss10.js new), draft, ui, combat
- Files: boss10.js (new), bosses.js, game.js, fight.js, pdef.js, draft.js, ui.js, index.html, tests/bosstest.js (new), tests/drafttest.js
- What: bosses take their defence and damage type from the roster (Kidney Stone 6 Shell layers, Antibody Colossus 5, Chad Prime Evasion, Macrophage Queen Squishy, The Johnny Membrane); the old "+60% from Acid" weaknesses and type immunities are off, and each intro card now says what its defence is and what gets through it. The Queen stops summoning while 8 of her adds live. Fixed: a weapon or Feat fork screen crashed the game (no title). Every level draft now leads with one weapon upgrade. Auto-pick takes the weapon upgrade half the time.
- Save data: none.
- Hooks: bosses.js bossDamageMul skips weak/resist/noForce/weakAoe under V10; game.js boss 'summon' pattern -> boss10SummonOk and tags adds; ui.js openLoot -> draftTitle; ui.js autoTick weapon-upgrade preference.
- Risk: bosses lose their old soft spots, so some fights get longer; balance needs the sims (1 run: died wave 10, weapons up to Lv 10 with two forks).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 Feats (merged from agent-feats); draft groups
- Systems: feats (feats10.js new), stamina, draft, ui
- Files: feats10.js (new), index.html, game.js, stamina.js, v10.js, ui.js, draft.js, tests/featstest.js (new), tests/pdeftest.js, tests/mutstest.js
- What: three Feat slots under V10 and 24 Feats (gifts from the consciousness) with levels 1 to 5 and forks at 3 and 5; attacking Feats go through damageEnemy and cost stamina, utility gifts are free; 15 in the starting pool, 9 unlockable. The draft now weights card groups (Feats, mutations, Catalyst/Concentration, defences) as wholes, so big groups don't crowd out the others. mutstest no longer depends on the random start weapon.
- Save data: META.f10unl (unlocked later-pool Feat ids).
- Hooks: game.js newGame (F10_SLOTS), fireWeapon (case 'f10'), updateSpellList and featTap (f10Wait), featFire, computeStats (f10Stats), hurtPlayer (f10Hurt, f10HurtMul), killEnemy (f10Kill), gainXp (f10Xp); stamina.js featCost (f10Cost), sprintMul (f10Speed); v10.js v10Tick (f10Tick), v10Draw (f10Draw); ui.js Feat slot count.
- Risk: Level 5 Feat forks are first drafts (FEATS.md lists only level 3). THIS WAY and the eight sample Feats are not built yet.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Signature weapons and Shocking Impact (merged from agent-sigw)
- Systems: weapons, combat, draft, sigweap (new)
- Files: sigweap.js (new), v10.js, fight.js, game.js, sigs.js, toys.js, armoury.js, arsenal.js, index.html, tests/sigwtest.js (new), tests/v10test.js
- What: 21 favourite originals plus 5 Fire drafts return as one-damage-type, one-attack-type signature weapons (WEAPONS['s_*']) in the slot-draft pool (69 weapons with the matrix). A new dual Force/Static weapon, Rubbed the Wrong Way, alternates shots and sets off Shocking Impact, so all 21 reactions can now happen. Echo damage, pet/lure/chain caps and shared Extraction are enforced.
- Save data: none.
- Hooks: game.js makeSlot (id: def.sigOf || id, sid); v10.js v10Fire/v10Tick (sigwTick)/v10Draw (sigDraw)/v10Loot (v10Pool)/v10Switch; fight.js fightReact -> sigReact; sigs.js afterMine -> sigMine, bladeEats; toys.js toySrc/toyHurt echo, peekBoo, toothFire; armoury.js latch heal, Upchuck merge, bowling depth; arsenal.js Flail tip.
- Risk: signature slots keep the OLD weapon id in w.id (w.sid is the s_ id); undead are stationary turrets; Placental Siphon fires back as Force.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The Scientist and the consciousness, wired (merged from agent-voice) (v10.07)
- Systems: voice, ui, tutorials, narrator (show.js), combat
- Files: voice10.js (new), voice.js (helper renames: its `W` clashed with game.js), index.html, show.js, v10.js, intro.js, bosses.js, fight.js, meta.js, ui.js, tests/voicetest.js (new)
- What: under V10, run events produce Scientist and consciousness lines (at most one commentary line every 20 s, no repeats, Tier 2/3 lines followed by their recovery). Enemy and boss first sightings show one of their two lines. Statuses and defences get a one-line hint the first time they appear. The end screen shows the sample ID (1A, 1B...) and a Scientist line, plus the consciousness on a win. Spectral Combustion's first trigger gets the Tier 3 line.
- Save data: META.vxSt, META.vxEv added; run log entries gain sid.
- Hooks: show.js sysLine -> vxSysLine; v10.js v10Tick -> vxTick; intro.js startFoeIntro -> vxSight; bosses.js startBossIntro -> vxBossIntro; fight.js rxFired -> vxReaction, fightReact -> vxSpectral; ui.js showGameOver/showDishOver -> vxEnd; meta.js runSummary -> vxSid.
- Risk: the old narrator's idle, level, boss, low-health and death chatter is silent under V10. Celestial drops never happen (weight 0), so that line has no trigger.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Field Guide: the 21-reaction chart
- Systems: combat (fight.js), help (inspect.js)
- Files: fight.js, inspect.js, tests/fighttest.js
- What: under V10 the Field Guide's reaction chart is the 7 by 7 grid of the 21 unstable reactions; each stays a question mark until set off once, then names itself and says what sets it off and what it does. Damage type cards list their six partners the same way.
- Save data: none (reads META.rxSeen).
- Hooks: inspect.js rxChartHtml -> rxChart10, INSPECTOR.cell -> rxCell10, inspectGuideHtml and the type card's REACTS WITH row use RX10_ORDER/rx10Pair.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Arcade-only look and one type palette (merged from agent-look)
- Systems: ui, render, damage types, look10 (new)
- Files: look10.js (new), index.html, data.js, settings.js, render.js, ui.js, tutorial.js, v10.js, fight.js, pdef.js, mutations.js, feats10.js, newfoes.js, STYLE.md, tests/looktest.js (new)
- What: under V10, Arcade is the only view (View setting hidden, Lab grey and eyepiece never run, the arcade offer is gone). The seven damage types share one palette (Acid shocking pink, Mucus green, Soul purple, Static yellow, Blood red, Fire orange, Force white), including acid pools and crypts.
- Save data: none (SET.view is ignored under V10).
- Hooks: render.js l10Swap(ELEM_SWAP); ui.js settings row filter honours d.hide; tutorial.js viewOffer skips under L10; settings.js viewArcade/hide.
- Risk: Acid and Mucus colours change wherever the old greens were hard-coded; RAW_COL drawing (levels) bypasses the remap.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Role-based wave encounters (merged from agent-waves)
- Systems: waves, enemies, waves10 (new)
- Files: waves10.js (new), campaign.js, index.html, tests/waves10test.js (new), tests/run.sh
- What: under V10 the Petri Dish's 20 waves draw from WAVES10: waves 1 to 4 teach Chaser, Sprinter (Evasion), Shooter and Tank (Squishy) alone; then Thorns, Shell, Membrane and each new enemy (Mosquito, Static Sock, Matchstick, Stress Ball, Birthday Candle, Trapped Wind) are met alone or beside familiar ones, with ENEMY_DESIGN 10's pairs and a big mix at wave 19. Per-wave cap on live enemies (summons count), no stacked disruptive statuses or Pool-makers, caps on live shooters and Pool-makers. Boss waves and CAMP budgets unchanged.
- Save data: none.
- Hooks: campaign.js campBegin -> w10Fresh; campSpawnMob -> w10Spawn; campSpawn -> w10Max.
- Risk: wave composition changes for waves 1 to 19 (sims comparable: waves 9 and 7 vs 10 and 5 before, 2 runs each).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The eight samples' Unique Feats and First Contact (merged from agent-ufeats) (v10.08)
- Systems: feats, samples, combat
- Files: feats10.js, fight.js, tests/ufeatstest.js (new)
- What: each sample starts with its Unique Feat in Feat slot 1: Standard Procedure (Force pulse), Personal Best (Static wake sprint), Second Wind (Blood drain heal, bigger when low), Pulling Strings (marks the toughest: Corrosion on it, Soul on its entourage), Shrink Wrap (Snare ring, then Acid Pools), Reply All (fills a Burn bar, Static arcs spread burn), Recount (Possess up to 6 for 3 s, then each takes a delayed hit), First Contact (the Other Half shifts type and sets off reactions on up to 8 statused enemies, no damage). Each has level 3 and 5 forks (first drafts). Never drafted for other samples.
- Save data: none.
- Hooks: none new in shared files; fight.js gains fightReactAs and inert src.feat guards.
- Risk: Unique Feat numbers and forks are untuned.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: new enemies ran their timers at double speed
- Systems: enemies (newfoes.js), tests
- Files: newfoes.js, game.js, v10.js, tests/dupetest.js (new), tests/run.sh
- What: newfoes.js reused three function names from the old newfeats.js (nfTick, nfKill, nfDraw); the later file won, so game.js ran the new-enemy tick twice a frame (wax walls, trails, Bursts and Mosquito timers at double speed) and render.js drew them extra times. They are now nf10Tick, nf10Kill, nf10Draw, nf10Hit. New dupetest fails if any two loaded scripts declare the same global; the v10 tests are now in run.sh's full list.
- Save data: none.
- Hooks: game.js damageEnemy -> nf10Hit, killEnemy -> nf10Kill, update -> nf10Tick (V10 only); v10.js v10Draw -> nf10Draw.
- Risk: new enemies' timings halve back to their designed values (they were too fast before).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 difficulty knob (balance)
- Systems: enemies, bosses, rivals, terrain, waves
- Files: boss10.js, game.js, bosses.js, rivals.js, campaign.js, terrain.js
- What: one tuning object, V10_DIFF in boss10.js, scales v10 enemy health (0.65) and damage (0.6), boss health (0.45, including wave mode's boss formula), rival champions' bullets and contact (0.45) and acid terrain damage to you (0.5). v9's enemy curve was tuned for v9's far bigger builds; with v10's leaner builds the bot died at waves 5 to 9 and never won.
- Save data: none.
- Hooks: game.js makeEnemy, bosses.js spawnBoss, campaign.js campBoss, rivals.js (bullets, contact), terrain.js acid -> V10_DIFF.
- Risk: balance in flux. Sims so far (4 runs each, deaths): before 9/5/8/9; first pass 11/7/8/5; with rivals scaled 10/13/10/8; this pass still running.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: terrain.js failed to load (runs crashed at start)
- Systems: terrain, tests
- Files: terrain.js, tests/dupetest.js
- What: the previous balance commit put a comment in the middle of the acid-crypt line in terrain.js, cutting off its closing brace, so the file didn't load and every new run crashed. Fixed. dupetest now also syntax-checks every loaded script, so a file that won't parse fails the suite.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The 24 weapons and the branch engine (weapons24.js)
- Systems: weapons, draft, weapons24 (new)
- Files: weapons24.js (new), sigweap.js, draft.js, game.js, fight.js, v10.js, index.html, tests/weapons24test.js (new), tests/drafttest.js, tests/run.sh
- What: the game offers only the 24 weapons of BASE_WEAPONS.md (10 foundations, 14 signatures), renamed (Standard Issue, Red Flagship, Family Ties, Skill Issue, There Is No Spoon, Ewww Gross, Sister Cousin, Eggs, Chest Burster, The Runs...) and re-typed (Nappy Mines Fire); every other weapon is archived (Lab Bench only). Switched at Birth retires. Weapon forks move to Lv 3 (pick one of three promises), Lv 6 (the promise's two cards plus its wildcard) and Lv 10 (one of three masteries); the cards come in wup1.js...wup6.js. Rubbed the Wrong Way is archived, so Shocking Impact has no weapon again.
- Save data: none.
- Hooks: game.js computeStatsInner -> wupStats, fireWeapon -> wupFire, killEnemy -> wupKill; fight.js fightHit -> wupDmgMul, wupHit; v10.js v10Tick -> wupTick; draft.js forkCards -> wupForkCards; sigweap.js v10Pool -> W24_IDS.
- Risk: until the card files land, Lv 3/6/10 fall back to modifier forks.

### Folded from ccr-caa43b42-e4m6sc: 2026-10-18 Soul damage renamed Alien (v10.20)
- Systems: damage types, chemistry, ui, weapons, samples, docs
- Files: data.js, chem.js, mutations.js, tutorial.js, glossary.js, fight.js, wup3.js, wup6.js, voice.js, index.html and others (text only), tests, GAME_GUIDE.md, redesign docs/*
- What: the "Soul" damage type is now "Alien" in every player-facing string, comment, test message, guide and redesign doc. Reaction names follow (Alien Rot, Alien Erosion). Pun names stay: Soulmate Signal, Old Soul, Soul Searching, Soul Purpose, Soul Scatter, Twin Soul.
- Save data: none. Internal id stays `soul` (ELEMENTS.soul, `bars.soul`, `t_soul`, `soulrot`, `v_soul_proj`), so saves and META.offered are untouched. Redesign decision 19 now plans `soul` -> `alien` at the id rename (clash check: sample id `alien`, enemy id `alien`, family `alien` in weapons24.js are separate namespaces).
- Hooks: none.
- Risk: any code that compares display names to the string 'Soul' (needType display arg only; checked).

### Folded from ccr-f38bcc1f-1rc8ck: 2026-10-18 Sandbox: no Acid Crypts or big hazards; log head fixed (v10.20)
- Systems: sandbox, terrain, run log
- Files: terrain.js, bighaz.js, sandbox.js, wstats.js, meta.js, tests/sbtest.js
- What: Sandbox maps have no Acid Crypts and no big hazards (Plughole, Hot Flush and so on), which were doing 25 to 65% of the damage and killed one run. The run log's Sandbox line now counts weapons properly (was "undefined weapon") and drops the meaningless "vs level curve".
- Save data: none.
- Hooks: terrain.js makeTerrain and bighaz.js makeBigHaz -> sbOn.
- Risk: none outside Sandbox.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Autofire toggle and FIRE buttons; Rewind moves left (v10.16)
- Systems: manual fire (new), settings, ui
- Files: manualfire.js (new), game.js, settings.js, style.css, index.html, tests/mftest.js (new)
- What: Settings > Game > Autofire. OFF gives each weapon a round FIRE button, stacked up the right side; hold to fire, tap for one shot. Orbit, wake, siphon and heat weapons stay automatic. Rewind and the ability button (#side) move to the bottom left in every mode (landscape: right of the HUD column).
- Save data: SET.autoFire (default true).
- Hooks: game.js updateWeapon -> mfGo, and w.mfTap cleared after a shot.
- Risk: anything else placed bottom left now shares the corner with Rewind.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Sandbox: + mount, branch mark; level number in Immersive (v10.15)
- Systems: sandbox, ui, render
- Files: sandbox.js, ui.js, render.js, tests/sbtest.js
- What: one Sandbox card. You start with one weapon; an empty + mount on the HUD opens a weapon pick whenever tapped (up to 3). Level-ups no longer open weapon upgrades in Sandbox: every 4th level banks one, and a faint branch mark on a ready weapon's slot spends it. Immersive mode shows your level as a small faint number top left (every mode).
- Save data: none.
- Hooks: ui.js slot tap -> sbSlotTap, refreshHud -> sbSlotShow/sbSlotMark; render.js drawHud level number (Immersive).
- Risk: none outside Sandbox apart from the Immersive level number.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Sandbox: weapons-only developer mode (v10.14)
- Systems: sandbox (new), lab-bench, draft, ui, samples
- Files: sandbox.js (new), game.js, v10.js, ui.js, samples10.js, index.html, tests/sbtest.js (new)
- What: DEVELOPER section (tap the samples title five times; the switch was lost with the v10 samples screen) gets Sandbox with 1, 2 or 3 weapons. It runs on the Lab Bench without god mode: a slow enemy stream on a quarter-speed difficulty clock, HEAT +/- bar on the HUD (35% more spawns and +90 s of clock per step, down to -3), only weapon picks and weapon upgrades (shown in the weapon draft screen), no power-ups, chests, Feats, mutations, defences, bosses or rivals.
- Save data: none (localStorage sd_dev reused).
- Hooks: game.js PT -> sbPT, newGame -> sbInit, director -> sbSpawn; v10.js v10Box -> sbBox, v10Loot -> sbLoot; ui.js openLoot -> sbDraftKind, openDraft -> sbDraftHead (wraps the kicker/title/sub lines), renderDraft -> sbDraftInfo; samples10.js s10Samples -> sbCards, sbWire.
- Risk: none outside Sandbox (every hook is gated on G.debug.sb or UI.sample s010).

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Merge v9.28 autorun and autoaim revision (v10.04)
- Systems: autorun, weapons, ui (incoming, see changes/claude-festive-allen-xmea8i.md), v10
- Files: merge of claude/festive-allen-xmea8i; tests/loadouttest.js (runs with V10_OFF)
- What: the v10 test build now has v9.28's targeting (TOUGHEST, FRAGILEST, a second "Then" directive) and reworked autorun modes (autorun.js). v10 weapons keep their NEAREST and CLUSTER defaults.
- Save data: none.
- Hooks: none new; v10 hooks and v9.28's aimDir/arMode hooks sit side by side in game.js and ui.js.
- Risk: loadouttest now tests the old build only (V10_OFF), since v10 level boxes need v10 weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Regular mode: a switch every level-up and DNA strand (v10.03)
- Systems: v10
- Files: v10.js
- What: in Regular Mode every level-up box and every DNA strand (chest box: pickups, events, achievements) opens as one Switched at Birth card, replacing the once-a-minute limit. Wave Mode is unchanged (one a wave).
- Save data: none.
- Hooks: none.
- Risk: many more switches in regular mode; skipping is the only way to keep a weapon.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Wave mode and regular mode (v10.02)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: the samples screen offers Human Sample 1 in Wave Mode (s002) or Regular Mode (s001, race to the egg). In regular mode Switched at Birth comes once a minute instead of once a wave.
- Save data: none.
- Hooks: none.
- Risk: regular mode not balanced for the new weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 One Switched at Birth card a wave (v10.01)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: Switched at Birth now offers one card, and only once a wave (the first level-up box after the wave; the wave's other level-up boxes are dropped). Reroll still swaps the card.
- Save data: none (run state `G.v10sw`).
- Hooks: none.
- Risk: far fewer upgrades a run; levels past the first in a wave give nothing.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 test build: Human Sample 1, 42-weapon matrix, Switched at Birth only (v10.00)
- Systems: v10 (new), weapons, loot, chemistry, ui, meta
- Files: v10.js (new), game.js, chem.js, sigs.js, ui.js, render.js, meta.js, index.html, tests/v10test.js (new)
- What: the game is now a stripped test build. One sample card (Human Sample 1, wave mode, no trait or ability). Weapons are the 42-cell matrix from the user's spec (Contact, Projectile, Beam, Spread, Burst, Pool x Force, Acid, Static, Mucus, Blood, Soul, Fire); start draft 4 of 42, Lv 8/22 drafts 3 more (no shared attack type). Level-ups offer only Switched at Birth (same attack type, new damage type); all other boxes are dropped, so no Feats, mutations, gene transfer, relics, combos or curses. Fire (`flame`) is new: Burning, 3 s damage over time. Old automatic reactions, overloads, triples and terrain reactions are off. Old content is gated, not deleted (`window.V10_OFF = 1` restores it).
- Save data: META now lives in `sd_meta10` (full wipe); `sd_best`, `sd_runs`, `sd_live` cleared on first v10 boot. `sd_meta` left untouched.
- Hooks: game.js genLoot -> v10Loot, main loop -> v10Box, fireWeapon -> v10Fire, update -> v10Tick, newGame skips junkStart, newStats elem.flame; render.js -> v10Draw; chem.js applyElement -> v10Burn and `if (V10)` reaction guards; sigs.js applyAdapt v10 contact reach; ui.js openSamples -> v10Samples, playBtn skips Level 0, quickStart uses human1/s002; meta.js META_KEY.
- Risk: most of the old test suite assumes old content and will fail with V10 on; `quick` and `v10test` pass. Balance untested (beams and Blood Pool run hottest). Feat slots show empty.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 combat rework: plan and decisions
- Systems: none yet (docs only)
- Files: NOTES.md (v10 section); merged `redesign docs/` from claude/charming-brown-51v3ev
- What: agreed approach (keep engine, rebuild combat core, restart content) and the step-2 decisions: literal Fire, Soul = mind control, 5 defences no traits, full save wipe.
- Save data: none yet (v10 will move to a new META key).
- Hooks: none.
- Risk: none.

### Folded from claude-festive-allen-xmea8i: 2026-10-17 Autorun and autoaim revision (v9.28)
- Systems: autorun (new), weapons, ui
- Files: autorun.js (new), game.js, data.js, ui.js, loadout.js, armoury.js, playpen.js, arsenal.js, toys.js, td.js, twins.js, genes.js, intro.js, index.html, tests/autoruntest.js (new), tests/loadouttest.js, tests/sim/wave20.js (`--move <id>`), tests/run.sh, tests/tools/guide.js
- What: Targeting: STRONGEST is now TOUGHEST (max health, plus 10% per point of armour), WEAKEST is now FRAGILEST, HIGHEST HEALTH is gone (its five weapons now default to TOUGHEST), SHOOTERS FIRST ranks shooters > healers > summoners, and RANDOM/REVENGE sit at the end of the list. Every weapon and Feat can take a second "Then" directive that breaks near-ties and takes over when nothing fits the first (Tackle Box loadout and weapon page; HUD shows `NEAR›FRAG`). RANDOM keeps a victim 1.5 s; FURTHEST and CLUSTER keep theirs unless a new one is 15% better. Autorun: KITE holds 240 to 360 from the nearest enemy; COLLECT skips pickups with enemies on or near the way; ORBIT picks one cluster and keeps it; HUNT keeps one target (boss > rival > elite > nearest, no longer the first weapon's directive); HOLD returns to where it was chosen; NEST only grabs pickups near the egg and is not offered in campaign levels (it used to steer you towards an egg 10 million units away).
- Save data: none (slot field `w.dir2` is run state only; `G.ar` holds autorun memory)
- Hooks: game.js targetScore -> aimPair; weapon fire -> aimSticky(acquire(aimDir(w))); every acquire(w.dir)/acquireMany(w.dir) -> aimDir(w) (game.js, arsenal.js, armoury.js, playpen.js, toys.js); game.js autoSteer -> arMode, arGoal (its old per-mode blocks moved into autorun.js); ui.js/loadout.js mode pickers -> moveModes.
- Risk: bot balance per autorun mode. Sims (`wave20.js 4 mortal --move <mode>`, old code then new): KITE 3/4 -> 2/4, ORBIT 1/4 -> 3/4, HUNT 3/4 -> 2/4, HOLD 2/4 -> 2/4; 9/16 both ways, too few runs to call any single mode; weapons that defaulted to HIGHEST HEALTH (Tapeworm Seeder, Due Date, Leeches, Umbilical Cord, Heel Prick) now pick by durability, not health left; RANDOM-targeting weapons no longer spray a new enemy every shot.

### Folded from claude-great-maxwell-2ar9sg: 2026-10-17 Voice and tone guide
- Systems: docs only
- Files: voice_and_tone.md (new)
- What: Added the voice, tone and humour guide (composure ladder, progressive disclosure, per-screen rules, existing examples).
- Save data: none
- Hooks: none
- Risk: none
- CLAUDE.md now points sessions at voice_and_tone.md before any player-facing copy.
- voice_and_tone.md: added the Lab Tech persona (the mundane-versus-life-and-death gap) and the four ways composure breaks (excited, supportive, irritated, disbelieving).
- voice_and_tone.md: added "The world" (setting, sample naming 1A/1B, the Scientist and his guardrails, decision table, optional dials). Persona renamed from Lab Tech to the Scientist. Flagged lines that imply an audience or colleagues.
- voice_and_tone.md: letter drift decided (Scientist grows slightly more invested across runs of one line, via events only).
- voice_and_tone.md: wordplay is now a core technique (the corrupted phrase, the borrowed disclaimer) with Premature Evangelation, Projectile Dysfunction and 98% effective as benchmarks. Removed the earlier "avoid puns" guidance.
- voice_and_tone.md: added the third signature technique, the innocent clinical term (Flaccid as the model).

### Folded from claude-charming-brown-51v3ev: 2026-10-17 Combat design docs imported
- Systems: docs only
- Files: redesign docs/ (COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, VOICE_GUIDE.md, tables/*.csv, README.md)
- What: Notion combat-rework exports unpacked into readable docs; remaining-updates hand-off merged as COMBAT_MATRIX.md section 9. Defences purged to the canonical five (Squishy, Membrane, Shell, Thorns, Dodge); voice owner fixed as the pre-incarnate consciousness.
- Save data: none.
- Hooks: none.
- Risk: none (no code touched).

### Folded from claude-fervent-galileo-66jpd2: 2026-10-16 Snot Bubble, player Lubricated, combos batch 2 design (not shipped: APK build blocked)
- Systems: chemistry (player statuses), enemies
- Files: pstatus.js, foes3.js, foes2.js, chem.js, game.js, tests/psttest.js, tests/f3test.js
- What: Lubricated joins Snotty, Sick and Soaking wet as a player status (3 s a hit, 6 s cap): you lose grip and skid wide in turns, and a Static hit on you then lights the grease (GREASE FIRE: x1.3 and an acid-style burn, grease gone). Grease Balls now leave a 5 s oil slick behind them (standing in it lubricates you) and lob a slow oil glob every 6 s. New enemy Snot Bubble (from 120 s, cap 4): swells with each hit; an early pop splashes neighbours with Snotty, a late pop (4+ hits) sticks every enemy within 170 and you if close; Static on it is POPPED (instant, harmless to you).
- Save data: none
- Hooks: game.js trac -> pstGrip; chem.js chemPlayerZones skips z.foe slicks for the speed boost; foes2.js foes2Dmg -> foes3Dmg, foes2Kill -> foes3Kill.
- Risk: Grease Ball is a little more dangerous (slick plus glob); win rate was not re-simmed after it. Wave sim on v9.27 before these changes: 3 of 20 mortal bot wins (15%), against 3 of 12 (25%) before player statuses; too few runs to call it a regression.

## v9.27 (versionCode 277)
- Systems: chemistry, enemies, combos, weapons, render, ui, sequences, school, tutorial, tools, tests, docs
- Files: see the folded entries below.
- What: merge of six session branches into `main`: player statuses and two enemies that use them (`claude/intelligent-keller-n89f5p`, its v9.25 and v9.26), combos batch 1 (`claude/sweet-gauss-q7pan5`), the dead stain-grant purge (`claude/exciting-ramanujan-56w3kr`), developer cards on fresh saves (`claude/youthful-pasteur-nt0tn6`), roomier draft screens (`ccr-189e2988`, its v9.25) and the Weapon Atlas builder (`ccr-618305e3`).
- Save data: META.combos gains eight combo ids; META.pstainOff no longer written. Otherwise none.
- Hooks: see the folded entries. Merge conflicts were only in NOTES.md, run.sh, guide.js, ARCHITECTURE.md, versions and game.js update (pstTick kept, grantsTick dropped).
- Risk: full suite on the merge: 90 of 92 passed; the two failures were test-side and are fixed (overtest still clicked the removed stain toggle; f3test now clears terrain so a nodule can't block the glob or sneeze).

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Phlegm Hocker and Hayfever Cell (v9.26)
- Systems: enemies, chemistry
- Files: foes3.js (new), pstatus.js (pstGive), chem.js, index.html, tests/f3test.js (new), tests/run.sh, tests/tools/guide.js
- What: two new enemies from ENEMY_IDEAS.md. The Phlegm Hocker lobs Mucus globs (a bigger Snotty dose); Water on it (GARGLED) turns its next 3 globs into rinse puddles. The Hayfever Cell winds up and sneezes a cone that gives you whichever of Snotty, Sick and Soaking wet it carries; Water then Cooties on it (ANTIHISTAMINE) makes it sneeze Sick onto its neighbours.
- Save data: none (new ENEMY_INTRO ids hocker and hayfever go in META.seen; META.foeRuns gains them).
- Hooks: chem.js applyElement (after chemFoe) -> foes3Chem.
- Risk: two more types in the wave draw pool (punisher cap 6 each); new REACTIONS ids gargled and antihistamine.

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Player statuses from typed enemy bullets (v9.25)
- Systems: chemistry, enemies, render, tutorial
- Files: pstatus.js (new), game.js, render.js, chem.js, newfeats.js, index.html, tests/psttest.js (new), tests/tools/guide.js
- What: Antibody, Cytokine Caster, Diatom, Killer T-Cell and Booster bullets now carry a damage type (white mark on the speck) and give you Snotty (slower), Sick (slow drain, half healing) or Soaking wet (Static bullets hit 60% harder; washes off snot and acid). Status chips with timers and first-time cards; your Water puddles and Fecal Transplant rinse them off.
- Save data: none (new STATUS_INTRO keys SNOTTY, SICK, SOAKING WET go in the existing META.seenSt).
- Hooks: game.js eBullet -> pstElem, hurtPlayer -> pstHurtMul + pstHit, healPlayer -> pstHeal, player speed -> pstSpeed, update -> pstTick; render.js chips -> pstChips, enemy bullets -> pstBulletMarks; chem.js chemPlayerZones -> pstOn/pstClear; newfeats.js fecaltransplant -> pstClear.
- Risk: early runs are a little harder (Antibody is the first shooter, from 35s); wave-sim deaths were in line with the baseline over 4 runs. Bosses unchanged.

### Folded from claude-sweet-gauss-q7pan5: 2026-10-16 Combos batch 1 for the Armoury and Playpen weapons (v9.24, not shipped)
- Systems: combos, weapons
- Files: combos3.js (new), combos.js, playpen.js, index.html, tests/combo3test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: eight new Weapon Combos (Drive-By Pramming, One-Two Delivery, Live Mains, Auntie's Revenge, Water Delivery, Locker Room Towel, Packed Lunch, Guthrie Test), one per sequence. They fuse through the usual ceremony and bonus mount, and use the standard Switched at Birth twist table. Water Delivery pairs Waters Breaking (Chonker) with Bath Bomb (Good Eater), so it needs a splice. Live Mains' overload is a held stun, not the Static reaction. "Natural synergy" lines from the brief are not implemented (only twists for swapped damage types exist).
- Save data: META.combos gains eight ids (c_driveby, c_onetwo_deliv, c_livemains, c_aunties_revenge, c_waterdelivery, c_towel_snap, c_packed_lunch, c_guthrie_test).
- Hooks: combos.js comboFire -> combo3Fire, comboHit -> combo3Hit, comboTick -> combo3Tick, comboLash -> combo3Lash; playpen.js penEnd -> combo3Pram, penFire juicebox -> combo3Carton and combo3Boil.
- Risk: Drive-By Pramming spawns many Spitballs (projectile cap applies); Packed Lunch widens Upchuck puddles for 3s; no new sounds (existing sfx reused).

### Folded from claude-exciting-ramanujan-56w3kr: 2026-10-16 Purge dead stain-grant code
- Systems: render (colour switches), ui, school, show
- Files: grants.js (142 to 33 lines), game.js, render.js, ui.js, school.js, ARCHITECTURE.md, tests/tools/guide.js, tests/schooltest.js
- What: removed the retired floating research grant (grantsStart/Tick/Due/Take, drawGrants, pause-menu list and toggles, G.grant). grants.js now holds only the live Lab/Arcade colour switches.
- Save data: none (META.grants/grantOff left in place, harmless).
- Hooks: removed grantsStart (game.js), grantsTick (game.js), drawGrants (render.js), grantsHtml/grantsBind (ui.js).
- Risk: tutorial.js 'stains' card text still mentions grants (unreachable now).
- Also: deleted the unreachable `stains` tutorial card (tutorial.js). Risk: none.
- Also: removed the pause-menu Stains lists and permanent-stain toggles (ui.js stainsHtml, data-pst), .li.stain CSS, staintest. Save data: META.pstainOff no longer written; META.pstains still read in game.js (old saves keep their stains, now with no off switch).

### Folded from claude-youthful-pasteur-nt0tn6: 2026-10-16 Fix devall test on fresh saves
- Systems: ui, debug, school
- Files: ui.js, debug.js
- What: Developer mode's Unlock Everything and Reset Starters cards now render on the fresh-save samples screen (Level 0 only), so `devall` passes. Unlock Everything also marks Level 0 as skipped (`META.school`) so the full screen shows afterwards.
- Save data: none added (sets existing `META.school`).
- Hooks: none.
- Risk: none for real players; the dev cards only show with `sd_dev` on.

### Folded from ccr-189e2988-a6jy7f: 2026-10-16 Roomier draft and sequence screens (v9.25)
- Systems: ui, sequences
- Files: style.css, game.js
- What: the starter weapon draft offers at most 4 weapons. Draft tabs wrap in an even grid; sequence select and the draft have more padding and spacing.
- Save data: none
- Hooks: none
- Risk: none (spacing only; the starter draft drops the 5th wildcard when a sequence already has 4 weapons)

### Folded from ccr-618305e3-li7ynm: 2026-10-16 Weapon Atlas builder saved in the repo
- Systems: tools
- Files: tests/tools/atlas/atlas.js (new), tests/tools/atlas/template.html (new), ARCHITECTURE.md
- What: `node tests/tools/atlas/atlas.js` rebuilds the Weapon Atlas page (all weapons, sequences, upgrade ladders, combos, pairings, reactions, twists, play styles) from the live game into tests/out/weapon-atlas.html, ready to republish to the Atlas artifact. Atlas republished for v9.24 (78 weapons).
- Save data: none.
- Hooks: none.
- Risk: none (tool only, not loaded by the game).

## v9.24 (versionCode 274)
- Systems: feats, chemistry, upgrades, render, ui, audio, data, tests, docs
- Files: `newfeats.js` (new), `data.js`, `spellfork.js`, `stamina.js`, `icons.js`, `chem.js`, `typefx.js`, `game.js`, `render.js`, `ui.js`, `audio.js`, `sigs.js`, `index.html`, `meta.js`, `android/app/build.gradle`, `tests/newfeattest.js` (new), `tests/newfeatshot.js` (new), `tests/run.sh`, `tests/sim/wave20.js`, `tests/tools/guide.js`, `GAME_GUIDE.md`, `FEAT_IDEAS.md`, `ENEMY_IDEAS.md` (new, from `ccr-9082b737`), `NOTES.md`, `ARCHITECTURE.md`
- What: merge of this session's v9.23 (all 36 Feats from `FEAT_IDEAS.md`, each with two Lv 4 paths, in loot, the Tackle Box and a new Field Guide FEATS tab; the Bloody Show three-type reaction, Mucus + Blood + Static) with main's v9.23 (the Playpen) and `ccr-9082b737` (enemy ideas doc). Also fixes a crash: Rubber Johnny's spines have no weapon and broke `projHit`/`projEnd`. Two branches used v9.23, so this combined build is v9.24.
- Save data: none
- Hooks: game.js fireWeapon -> nfFire, update -> nfTick, updateEnemies -> nfSteer, shootPattern -> nfNoFire/nfAim, enemy bullets -> nfBullet, hurtPlayer -> nfHurtMul/nfLethal, updatePlayer -> nfSpeed, updateSpellList -> nfWait, featTap -> passive Feats, damageEnemy -> nfDamaged, killEnemy -> nfKill; render.js -> nfDrawUnder/nfDrawOver/nfYouAlpha and the Bloody Show squeeze; ui.js Feat slot bar -> w.nfCharge, Field Guide FEATS tab; audio.js -> G.musCutT; sigs.js projHit/projEnd skip projectiles with no weapon.
- Risk: 36 more Feats dilute Feat drafts (novelty weighting rotates them). Wave sims: 27% bot wins before, 36% with a new Feat forced in; Mosquito, Fecal Transplant, Brown Fat and Fertile Window sit at 50%. Hooks in `updateEnemies`, `shootPattern`, enemy bullets, `hurtPlayer`, `damageEnemy` and `killEnemy` all run through `G.nf` (absent until a new Feat is performed). No save-data changes.

### Folded from ccr-e8ca6f23-vawkv2: merge-friendly change logging (2026-10-16)
- Systems: docs
- Files: CLAUDE.md, ARCHITECTURE.md (new), CHANGELOG.md (new), changes/ (new)
- What: per-session change-log fragments, a merge playbook, start-of-session overlap check, and the system architecture map.
- Save data: none
- Hooks: none
- Risk: none

## v9.23 (versionCode 273)
- Systems: weapons, combos, chemistry, loot
- Files: playpen.js (new), index.html, chem.js, data.js, WEAPON_IDEAS.md, tests (armtest)
- What: the Playpen, 20 more weapons from `WEAPON_IDEAS.md` (78 in all), flagged `armoury: 1, pen: 1`. Merged `ccr-618305e3` (the Armoury) and `ccr-d9934b1d` (four weapons retyped for an even damage type spread).
- Save data: none
- Risk: new weapons in the general pool shift loot odds; armtest guards the play-style and damage type spread.
