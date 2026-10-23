## 2026-10-23 The Laser's orbit is a traced ring; beams meet obstacles (v10.80)
- Systems: weapons (Laser, Orbiting), terrain
- Files: laserbeam.js (lzOrbit, obstacles in lzMeet, modOrbit/modFire wrapped), modslice.js (old hoop skips the Laser), tests/laserbeamtest.js
- What: with Orbiting the Laser leaves you and runs round a circle as one solid beam, traced in 48 sections with the beam's rules: an enemy in the way breaks the ring until it moves (Piercing carries on past it, weaker), Bounce reflects it off enemies and obstacles as a straight beam; a second inner ring turning the other way at mastery. No orbiting bodies for the Laser. Every Laser beam now stops at solid terrain, or reflects off it with Bounce.
- Save data: none.
- Hooks: laserbeam.js wraps modifiers.js modOrbit and modFire.
- Risk: solid terrain now blocks the Laser (it used to shine through).

## 2026-10-23 The Laser is a held, smooth beam (v10.79)
- Systems: weapons (Laser), fx
- Files: laserbeam.js, tests/laserbeamtest.js, tests/slicetest.js
- What: the Laser stays on between damage ticks: every frame its aim sweeps smoothly towards the target and its path (bounces, piercing, bubble reflections) is traced again and drawn as a steady beam with a white-hot core, a coloured glow and a bright spot where it lands. More power glows more, pulsing once past full strength. Overheating (Rapid Fire) blinks it off. Damage still lands at the weapon's fire rate.
- Save data: none.
- Hooks: laserbeam.js wraps weapons24.js wupTick and modifiers.js modDraw.
- Risk: per-frame tracing costs a little (32 segments at most per beam).

## 2026-10-23 Bigger Membrane; plain modifier names (v10.78)
- Systems: defences (Membrane Shield), weapons (modifier names), copy
- Files: pdef.js (wide card and state), bodymods.js (bubbleR reads it), draft.js (defsHeld), spslice.js (slice defs), modmatrix.js (Type Swap tag), rewardui.js (Type Swap category), slicecopy.js (SLICE_NAMES), tests/spslicetest.js, tests/modcardtest.js
- What: Bigger Membrane, a new Membrane Shield level (needs the shield, uses no slot): the bubble is 60% wider. Weapon modifiers get plain names (Chain Hits, Orbiting, Delayed Blast, Around You, Sweep, Anchored Beam, Empowered Attack, Stat Scaling, Split on Kill, Pets, Focus, Link, Status Boost, Extra Shots, Long Range, Close Range, Charge-Up, Same Type Bonus, Pull, Raise Allies, Strike from Above, Explosive Hits, Mark and Detonate...); Switched at Birth's card tag is TYPE SWAP.
- Save data: G.pd.n.wide (run state only).
- Hooks: bodymods.js bubbleR -> G.pd.n.wide; rewardui.js accepts the TYPE SWAP tag.
- Risk: a bigger bubble is a strong defence (it is also a hitbox). fittest already failed before this (it expects the old random Switched at Birth).

## 2026-10-23 Laser always red; no limits shows every modifier; plain copy for placeholders (v10.77)
- Systems: weapons (Laser colour), draft (slice-only), copy
- Files: laserbeam.js (colour pinned), spslice.js (sliceOn off under no limits; Piercing in the slice), slicecopy.js (new), index.html
- What: every form of the Laser (rings, mines, strikes, melee arcs, links, bursts) is red unless Switched at Birth changes its type. With no slot limits, slice-only drafting is off, so every modifier is offered. First-pass plain copy (written at the user's request) fills every TODO_COPY placeholder: modifiers, branches, masteries, sperm passives, the Laser, the setting, race rescue and v9 sample lines (SLICE_COPY in slicecopy.js; the user can rewrite there).
- Save data: none.
- Hooks: none in shared files. slicecopy.js wraps modCard, forkCards, banner, makePickup, UI.renderArmoury; loads last.
- Risk: none.

## 2026-10-23 The Laser fires like a laser; Ricochet renamed Bounce (v10.76)
- Systems: weapons (Laser, modifiers), defences (Internal Ricochet)
- Files: laserbeam.js (new), modslice.js (Focused Intensity skips its multiplier on the Laser), index.html, tests/laserbeamtest.js (new), run.sh
- What: the Laser is a traced ray: it stops at the first enemy (no pierce by default) and its aim swings towards the target. Bounce (was Ricochet) reflects it off the enemy's surface at the true angle; Piercing (now fits beams) carries it through; both split it into a straight and a bounced part at half power each. With Internal Ricochet and the membrane up the beam reflects round the inside of the bubble (14 reflections) and never leaves it. Its damage starts at 45% and ramps to 160% over 2.2 s on one target; Focused Intensity ramps it faster and higher.
- Save data: none.
- Hooks: none in shared files. Wraps v10.js v10Fire (outermost, Laser only).
- Risk: the Laser's damage curve changed (weaker on fast target switches); with Internal Ricochet the Laser only hits what touches the bubble.

## 2026-10-23 The other 13 weapon modifiers; every modifier on a level-up with no slot limits (v10.75)
- Systems: weapons (modifiers), chemistry (Kinship fill, Primer), ui (fork screens)
- Files: modwide.js (new), index.html, tests/widetest.js (new), run.sh
- What: Range, Up Close, Charged, Kinship, Knockback, Pulling, Turncoat, Melee, Ranged, Mines, Death from Above, Primer and Exploding Rounds, each with both branches and four masteries (generic versions; per-weapon cells later). Slice-only drafts deal them too. With the no-limits setting on, a level-up lists every card you could take (modifiers, Switched at Birth, passives, defences) in a scrolling list. wup2/5/6 tests run with MM.on off (they test the retired branch screens).
- Save data: none (run state G.mwS, G.mwAny).
- Hooks: none in shared files. Wraps weapons24.js wup* hooks, power11.js p11Range, mutations.js mutBarK, game.js hurtPlayer, modifiers.js modOk/modDraw, draft.js draftLoot, ui.js UI.renderLootCards.
- Risk: power (unsimulated); Melee shortens the weapon's reach to 110; Counter cancels a hit every 3 s.

## 2026-10-23 Slice only drafts (v10.74)
- Systems: draft, weapons (modifiers), mutations (sperm passives), defences
- Files: spslice.js (SLICE, sliceSkip, modOk and pdefOffer wrappers), spassives.js (spSkip -> sliceSkip), tests/spslicetest.js
- What: for testing, drafts deal only the vertical slice: 9 weapon modifiers plus Switched at Birth, 6 sperm passives (The Runs, Slipstream, Fever Pitch, Extra Mastery, Personal Space, Internal Ricochet) and Membrane Shield's 3 cards; Feats as normal; v9 upgrades, catalysts, Concentration and other defences off. SLICE.on = false restores the full pool. Tests and sims (window.TUT_OFF) keep the full pool unless SLICE.force.
- Save data: none.
- Hooks: spassives.js spSkip -> sliceSkip.
- Risk: fewer power sources while on (harder runs).

## 2026-10-23 No slot limits setting (v10.73)
- Systems: settings, weapons, mutations (sperm passives), ui (build panel)
- Files: modmatrix.js (setting row, mmFree, modOk, mmRoom), spassives.js (spSlots), buildpanel.js, tests/sptest.js
- What: a GAME tab setting (off by default) lifts weapon modifier slot and group limits and sperm passive slot limits, for testing. Weapon count (3) and masteries are unchanged.
- Save data: SET.noLimits (sd_settings).
- Hooks: none new (SETTINGS_DEF.push, SET_DEFAULTS.noLimits from modmatrix.js).
- Risk: none with it off.

## 2026-10-23 Weapon level pacing, draft crash guard (v10.72)
- Systems: weapons, draft
- Files: modmatrix.js (MM.freeEvery), draft.js (draftCards skips empty candidates), tests/drafttest.js, tests/sim/wave20.js (--pre)
- What: every weapon gains a level each 4th player level (the retired upgrade screen's pacing), on top of a level per modifier card. A draft candidate that comes back empty is skipped instead of reaching the loot screen as null (a bot sim crashed in UI.sortLoot). Ships the build panel and MM.lvK changes above.
- Save data: none.
- Hooks: none new.
- Risk: wave mode is still harder than main (wave20 mortal: this branch dies at waves 5 to 15; main 20, 8, win, 15). 4 starting sperm passive slots got closest to main in sims; left at 2 pending the user.

## 2026-10-22 Build panel for slots and branches; weapon level damage knob (unshipped)
- Systems: ui (build panel), weapons
- Files: buildpanel.js, modmatrix.js
- What: the build panel shows group slots (held/open), branch and mastery names, Rank IV, Personal Space's branch, and sperm slots counted as the draft counts them; the retired weapon upgrade line is hidden. MM.lvK adds 6% damage per weapon level (being tuned by wave20 sims).
- Save data: none.
- Hooks: modmatrix.js wraps weapons24.js wupStats.
- Risk: balance (lvK under test).

## 2026-10-22 Slice sperm passives and pairs (v10.71)
- Systems: mutations (sperm passives), defences, weapons (pairs)
- Files: spslice.js (new), index.html, tests/spslicetest.js (new), run.sh
- What: Fever Pitch (burning kills spread Burn), Personal Space (push field; a Repel or Attract fork at Rank 2), Internal Ricochet (Membrane Shield's mastery: shots bounce inside the bubble). Pairs: Chain reaction (Connecting + Ricochet) and Not Finished Yet (Ricochet + Focused Intensity); the other half of a pair is dealt 50% more often.
- Save data: none (run state G.spB, G.spsFevT).
- Hooks: none in shared files. Wraps weapons24.js wupTick/wupKill/wupDmgMul, draft.js forkCards/draftTitle, modslice.js msRicochet, modmatrix.js modDraftCands.
- Risk: Personal Space moves enemies directly (wall-checked in campaign levels only, as the gravity well does).

## 2026-10-22 Slice modifiers with branches and masteries (v10.70)
- Systems: weapons (modifiers), chemistry (Catalyst bars and reactions), ui (fork screens)
- Files: modslice.js (new), modmatrix.js (Switched at Birth checks the Chemistry slot), index.html, tests/slicetest.js (new), run.sh
- What: six new modifiers (Rapid Fire, Focused Intensity, Sticky, Connecting, Catalyst, Extra Projectiles), each with a branch fork at Rank 2 and a mastery fork (two masteries of that branch). Ricochet now bounces beams at the reflection angle; Orbiting turns a beam into a ring round you (the Laser's hula hoop).
- Save data: none (run state w.mmB, w.mmX, G.msS, G.msAny).
- Hooks: none in shared files. Wraps weapons24.js wupStats/wupFire/wupDmgMul/wupHit/wupKill/wupTick, v10.js v10Fire, fight.js fightReact, mutations.js mutBarK, modifiers.js modOk/modAdd/modDraw, draft.js forkCards/draftTitle, modcards.js modCard.
- Risk: power (stacked modifiers are unsimulated); Disco Ball and Clip Dump are strong; all new card text is TODO_COPY.

## 2026-10-22 Masteries, Extra Mastery, The Runs passive, Membrane Shield levels, red Laser (v10.69)
- Systems: weapons, mutations (sperm passives), defences, fx
- Files: modmatrix.js, spassives.js, laser.js, modifiers.js (modV), pdef.js (pdHeld), draft.js (defsHeld), tests/sptest.js (new), drafttest, modcardtest, modstest, mutstest, run.sh
- What: a modifier or sperm passive at Rank 3 can take a 4th card, its mastery (one of each kind a build; Extra Mastery adds one more of either). The Runs is a sperm passive: a trail in the sample's primary damage type. Thicker Membrane and Faster Recharge are one-rank levels of Membrane Shield and use no slot. The Laser draws as a thin red beam.
- Save data: none (run state G.mmM, G.spM, G.spRuns).
- Hooks: spassives.js wraps v10.js v10Tick; laser.js wraps v10.js v10Fire. modifiers.js modV extrapolates past the last rank.
- Risk: masteries are only "one more step" of the numbers for now; The Runs stacks extra damage on every sample.

## 2026-10-22 Weapon modifier matrix draft (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (new), redesign docs/README.md, redesign docs/COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md (sperm passives bullet)
- What: a 22-modifier × 26-weapon matrix with levels and masteries, from a design grilling with the user. The Runs leaves the weapon roster (becomes a sperm passive). Raises rule conflicts listed in the doc (beams don't pierce, suicide vest, long lunge, Family Ties drift, The Runs).
- Save data: none.
- Hooks: none.
- Risk: none in code; other redesign docs (MODIFIERS.md 2, BASE_WEAPONS.md, SAMPLES.md Redtail) now disagree until the conflicts are resolved.

## 2026-10-22 Modifier levels and mastery limits (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, storm-directive/NOTES.md
- What: modifiers have 3 levels plus a mastery as the 4th; up to 3 modifiers per weapon; one mastery per build unless the Extra Mastery sperm passive (costs a passive slot).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Modifier matrix v2: scaling and shaping, Laser, 4 new modifiers (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (rewritten), redesign docs/README.md
- What: 26 modifiers × 27 weapons. Modifiers split into scaling (shared ramp: counts 1/3/6/12) and shaping (a distinct step per level). Adds Ricochet, Orbiting, Extra Projectiles and Focused Intensity, and the Laser (Ordered Online's Fire beam) from the user's voice notes.
- Save data: none.
- Hooks: none.
- Risk: none in code; BASE_WEAPONS.md needs a Laser entry and MODIFIERS.md 4 (Ricochet) disagrees (listed in the doc).

## 2026-10-22 Modifier groups, pair bonuses, Advanced Targeting to sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md, storm-directive/NOTES.md
- What: five modifier groups (Delivery, Flight, Crowd, Tempo, Chemistry); one firing replacement per weapon; look-alike distinctions; 13 pair bonuses with draft weighting; DPS and transformation checks; Charged wind-up shortens per level; Advanced Targeting becomes a sperm passive (adds "elite first" and "nearest threat").
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 One modifier slot per group (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md
- What: weapons have 5 modifier slots, one per group (replaces "up to 3 per weapon"); same-group modifiers never stack; 10 pair bonuses reworked so every pair crosses groups.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Modifier slots unlock with weapon level (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: weapons start with 2 modifier slots and unlock the 3rd, 4th and 5th at weapon Lv 3, 6 and 9 (any unfilled group).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md (new), MODIFIER_MATRIX.md, MUTATIONS.md (superseded note), README.md, COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md
- What: 29 sperm passives replace the Genome slots (mutations and defences re-sorted one by one with the user): slots 2, then +1 at Lv 8, 16, 24; 3 levels plus a mastery; separate mastery cap from weapon modifiers; two passive pairs. Weapon mutations folded into the matrix (branches, pair bonuses). Matrix gains the branch rule (2 branches, 4 masteries per modifier; tables not yet rewritten).
- Save data: none.
- Hooks: none.
- Risk: none in code; UPGRADES.md (Genome, max 3 weapon mutations) now disagrees until updated.

## 2026-10-22 Combo masteries and the push/pull field (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, SPERM_PASSIVES.md, README.md
- What: combo masteries (a modifier mastery offered only while a condition holds): Static net (Static arcs jump between your projectiles) and Planetary system (projectiles orbit Family Ties' black holes). New sperm passive: a push field that can branch to pull.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 The Runs takes the sample's primary damage type (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: The Runs' trail is in the sample's primary damage type, changeable by a type-changing passive.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Damage-type passives boost what each type does best (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md, MODIFIER_MATRIX.md
- What: Force (knockback, collisions), Acid (Acid Pools), Static (jumps and range), Mucus (Snare), Blood (wounds, Extraction; pools at mastery), Alien (possession) and Fire (spread) passives reworked; draft names written at the user's request; Static net's arc cap grows with the Static passive.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Modifier branches written (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: all 25 weapon modifiers (3.1 to 3.14, 4.1 to 4.11) now have a Branches block: shared Lv 1, branches A and B with Lv 2, Lv 3 and two masteries each (100 endings, plus the Static net and Planetary system combo masteries), and weapon exceptions. Table headings renamed: per-weapon cells are flavour the shared branches apply.
- Save data: none.
- Hooks: none.
- Risk: none in code. Branch numbers are starting values for sims; the Branches block in each section is now the place to tune endings.

## 2026-10-22 Sperm passive source (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: sperm passives come from level-up drafts only; bosses and rivals give relics (separate reward, no slot). Open: what gene boxes and elite drops give now.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Gene boxes and elite drops retired (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: gene boxes and elite mutation drops are retired; relics unchanged for now.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-22 Implementation plan; Laser 4th starter; 3 weapons max (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md (new), MODIFIER_MATRIX.md, README.md
- What: phased build plan (vertical slice first). Laser is Ordered Online's 4th starter. Runs hold at most 3 weapons: combo bonus mounts (combos.js COMBO_MOUNTS) to be retired in Phase 1.
- Save data: none.
- Hooks: none.
- Risk: none in code yet; combos.js/fusion.js bonus mounts change in Phase 1.

## 2026-10-22 Profiles retired; no base Membrane (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md, SPERM_PASSIVES.md
- What: Epigenetic Profiles retire with the gene box; runs no longer start with a Membrane (only the Membrane Shield card gives one). Plan has no blockers left.
- Save data: none yet (Profiles' META keys stay readable when retired in Phase 1).
- Hooks: none.
- Risk: none in code yet; removing the base Membrane will shift difficulty (sim in Phase 4).

## 2026-10-22 Phase 0: redesign docs reconciled (docs only)
- Systems: docs only (redesign docs)
- Files: COMBAT_MATRIX.md (decisions 47 to 62, Beam row, decision 31), MODIFIERS.md, ATTACK_TYPES.md, BASE_WEAPONS.md, SAMPLES.md, UPGRADES.md, WEAPON_UPGRADES.md, README.md, IMPLEMENTATION_PLAN.md
- What: today's design decisions logged and the conflicting docs fixed (beams don't pierce, Ricochet off enemies, named exceptions, The Runs out, Laser in, sperm passives replace Genome, branch cards retired).
- Save data: none.
- Hooks: none.
- Risk: none in code.

## 2026-10-22 Modifier slots by group, sperm passive slots, the Laser (v10.68)
- Systems: weapons, draft, mutations, defences, samples, combos
- Files: modmatrix.js (new), spassives.js (new), laser.js (new), mutdrop.js, combos.js, index.html; tests: lasershot.js (new), drafttest, modcardtest, modstest, mutdroptest, mutstest, samplestest, weapons24test
- What: weapons hold one modifier per group (Delivery, Flight, Crowd, Tempo; Switched at Birth is Chemistry) in slots that open at weapon Lv 1 (2), 3, 6, 9; each modifier taken levels the weapon; modifier cards come in level-ups as well as DNA strands; the old branch screens no longer open. Switched at Birth switches to one fixed alternate type, N/A where it would spoil the weapon. Genome mutations and defences are dealt in level-ups as sperm passives (2 slots, +1 at Lv 8, 16, 24); weapon mutations and cut cards are never dealt; elite mutation drops, mid-run splices, built-in sample shields and combo bonus mounts are off. The Laser (Fire Beam) is Ordered Online's 4th starter; The Runs is off the roster.
- Save data: none.
- Hooks: mutdrop.js mdDraftSkip -> spSkip. Replaced by assignment (no shared file edited): modifiers.js modOk, modAdd; modcards.js modCardOk, modCard, sabCard, modDraftCands; weapons24.js wupLevel; genes.js genesLevel.
- Risk: big balance shift (no weapon branch cards, no built-in shields, fewer Genome slots early); weapons level more slowly (only through modifiers); Private Schooled and Not of This World lose their shields; v9 weapon tier cards still open only through modifiers.
