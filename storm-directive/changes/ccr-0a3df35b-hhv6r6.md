## 2026-10-29 Fewer reward screens, Lv 30 runs (v10.208)
- Systems: level pace (new), engine (XP curve, levelsAhead), reward director, weapon levels, race schedule, DNA strands
- Files: levelpace.js (new), wmods.js, index.html, ARCHITECTURE.md, tests/tools/guide.js
- What: levels cost more as you climb (new Lv L = old Lv L + L²/30, so Lv 30 is the old Lv 60; egg opens at Lv 30, weapon mounts at 4 and 9, evolutions at 4/8/15/27). Reward screens come from play: one per level-up, the boss relic, Vestigial Masses and the weapon kill bars (WM.k0 16 -> 20). Boss spoils, elite/event/cure/pickup DNA strands (all but Achievement DNA) and the Race's 5:00/10:00 milestone screens are gone. Race bot sim (10 runs, mortal): Lv 22-29 at 15:00 (was 57-62), 14-85 screens a run (was 100-134), wins 2/10 (baseline 1/4).
- Save data: none.
- Hooks: none in shared files (levelpace.js replaces xpNeed and levelsAhead, wraps dirGate, sets EGG.level, SLOT_LEVELS, EVOLVE_LV, XEB.chance, RPLAN.milestones at load).
- Risk: wave mode (s002) and Level 1 also level about half as far; SPLICE_LEVELS and Prawn Again memories keyed to old levels may come later or not at all; the bot dies more often before 8:00 with one weapon.
