## 2026-10-25 Weapon modifier no-op audit sim
- Systems: tests
- Files: tests/sim/modaudit.js (new), ARCHITECTURE.md, CLAUDE.md
- What: `node sim/modaudit.js` runs every matrix weapon x Delivery x modifier the draft can offer in a fixed Lab Bench arena (14 stationary crawlers, seeded random, fresh page per trial) and classes each modifier as NO-OP (nothing measurable changes), NUMBERS (only damage or hit counts move) or VISIBLE. Found: on the Laser, Charge-Up does nothing once Mines or Melee is held.
- Save data: none.
- Hooks: none.
- Risk: none (a sim only).
