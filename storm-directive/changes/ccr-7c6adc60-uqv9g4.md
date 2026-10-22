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
