## 2026-10-26 Race: autorun no longer stacks weapons in a rescue's fusion; D2 Sprinter finding (v10.155)
- Systems: race (kindred rescues), tests
- Files: kindred.js, tests/kindredtest.js, tests/sim/race.js
- What: while a rescue's fusion played, the loot state still held the rescue's cards, so autorun's auto-pick took another weapon every 0.7 s past MAX_WEAPONS (a sim got hundreds); picks on the rescue screen are ignored until the fusion closes. race.js now starts as the Baseline sample (no sample meant no rescues, so every past Race sim ran with one weapon) and closes a fusion like a tap.
- Save data: none
- Hooks: none (kindred.js's own UI.pickLoot wrap gains one guard line)
- Risk: none expected; the guard only applies while UI.kinFuse is open on a rescue screen.

