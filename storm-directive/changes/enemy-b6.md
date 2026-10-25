## 2026-10-25 Summon and heal caps (enemy handoff B6)
- Systems: enemies, roster
- Files: game.js (medic, summon, split), foes2.js (stem), tests/newfoestest.js
- What: Mother Cell keeps at most `summon.cap` (6) living children; Nurse Cell heals each ally at most `heal.perTargetCap` (3) times and skips full-health allies; Stem Cell revives at most `summon.cap` (3) per Stem; Mitotic Cell splits only while `splitGen < splitCap`.
- Save data: none
- Hooks: none (edits in place)
- Risk: Nurse/Mother waves are slightly easier to clear; Stem stops after 3 revives (it idles).
