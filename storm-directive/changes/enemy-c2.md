## 2026-10-25 Boss telegraphs (enemy handoff C2)
- Systems: bosses, telegraphs
- Files: bosstells10.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: every boss attack with big damage now shows where and when. Charge (Colossus, Twins) draws a soft lane for the 0.8 s wind-up; Blink (Phantom, Immune Eye) marks the landing spot 0.5 s before the jump and the 14-bullet ring waits 0.3 s after arrival (same 1.6 s rhythm, first jump still 0.6 s into the pattern); the Matron's ward round shows its heal ring for 1 s before the heal and nurses (the boss pulses for the last 0.6 s); the Queen's summon pulses 0.6 s before the adds; the Fever's fire ring shows an outline for the last 0.7 s of each ring (the first ring of a pattern waits 0.7 s). No HP, damage or rate number changed. The fallback "Learn the telegraph" weakness line (boss10.js) is now true for every boss and stays.
- Save data: none.
- Hooks: none in shared files: bosstells10.js wraps `bossAI` (game.js) and `nf10Draw` (newfoes.js) from its own file.
- Risk: Matron's ward round, the Queen's summon and the Fever's first ring start 1.0, 0.6 and 0.7 s later within their 5.5 s pattern window (the adds and heals come slightly later in the fight); Phantom and Eye fire one fewer blink per pattern at most (the ring is 0.3 s late). Not simmed.
