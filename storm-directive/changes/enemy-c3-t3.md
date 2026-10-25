## 2026-10-25 Tier 3 boss signature beats (not shipped)
- Systems: bosses, boss telegraphs, tests
- Files: bosssig10_t3.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: The Fever, Chad Prime and the Antibody Colossus lose every generic spray slot (spiral, ring, aimedFan). The Fever's list is firering/flush x2: Flush sends three expanding heat waves 0.8 s apart, each with one 50 degree safe gap that steps 30 degrees a wave, gaps marked for 0.7 s first. Chad's list is dash3/tailwhip x2: each dash landing is marked (from the wind-up) and a shockwave of radius 2.5 x his r goes off 0.3 s after he lands. The Colossus's list is yvolley/charge x2: three lanes 120 degrees apart sweep 40 degrees over 1.2 s after a 0.9 s mark, twice a pattern. All hits use the boss's own bullet damage base through V10_DIFF.dmg x 0.8 (as hazards do); no HP, damage or rate number changed.
- Save data: none.
- Hooks: none in shared files. Wraps bossAI and nf10Draw from bosssig10_t3.js, edits `patterns` of three BOSSES and ROSTER_BOSSES rows in place, adds `TODO_COPY:boss_<id>_sig` to each boss's strengths.
- Risk: boss cycle makeup shifts (fewer bullets on screen); other tier files (bosssig10_t1/t2) touch other rows only. The Colossus entourage still pulses on `charge` only.
