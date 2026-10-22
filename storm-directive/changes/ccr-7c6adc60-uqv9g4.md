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
