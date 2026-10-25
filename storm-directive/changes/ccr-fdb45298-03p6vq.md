## 2026-10-25 Weapon modifier no-op audit: handoff
- Systems: tests, docs
- Files: MODAUDIT_HANDOFF.md (new), NOTES.md
- What: the audit's findings (761 of 2810 weapon x Delivery x modifier combos change nothing) and three briefed tasks for later sessions: a draft filter that hides dead cards (Sonnet), routing the Delivery replacements through the modifier path (Opus), per-Delivery forms for the Flight and Crowd modifiers (Opus, design first).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-25 Weapon modifier no-op audit sim
- Systems: tests
- Files: tests/sim/modaudit.js (new), ARCHITECTURE.md, CLAUDE.md
- What: `node sim/modaudit.js` runs every matrix weapon x Delivery x modifier the draft can offer in a fixed arena (16 slow crawlers walking in from random distances, seeded random, fresh page per trial, range falloff on) and classes each modifier as NO-OP (nothing measurable changes), NUMBERS (only damage or hit counts move) or VISIBLE. Found: 761 of 2810 combos are NO-OP; on the Laser, Charge-Up does nothing once Mines or Melee is held.
- Save data: none.
- Hooks: none.
- Risk: none (a sim only).
