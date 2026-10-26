## 2026-10-26 Race: autorun pulls harder to the egg once it is breakable
- Systems: race (race15), autorun steering
- Files: race15.js, game.js (autoSteer egg goal weights)
- What: autorun's pull to the egg is now RACE15.eggPull (4 before it wakes, 3.5 after; was 1.8 and 1.4), which beat the dodging that kept it 500 to 2,500 px away while a rival broke in. In a probe its damage to the egg rose from about 3k to 115k.
- Save data: none
- Hooks: game.js autoSteer reads RACE15.eggPull.
- Risk: autorun players head into the egg's bullet rings more readily.

## 2026-10-26 Race: swimming into the egg counts from 80 px of its edge
- Systems: race (race15), egg
- Files: race15.js, game.js (eggTick touch radius)
- What: once the egg is breakable, coming within RACE15.touch (80 px, was 14) of its edge wakes it. Autorun circled it just outside the old radius while dodging its rings, so it never started its own egg fight and a rival always won.
- Save data: none
- Hooks: game.js eggTick reads RACE15.touch.
- Risk: the egg fight starts a little earlier for human players too.

## 2026-10-26 Race: Fever Pitch holds 3 min after the egg opens; race boss bullets take RACE.bossHit
- Systems: race (race15), bosses, director (difficulty clock)
- Files: race15.js, game.js (one line in shootPattern)
- What: in a race, enemy damage now holds at its 15:00 level for RACE15.surgeLag (180 s) before Fever Pitch compounds, so the egg fight no longer starts inside the x1.3-a-minute spiral. Race bosses' bullets now take their RACE.bossHit softening (only their contact damage did).
- Save data: none
- Hooks: game.js shootPattern bullet damage x e.campK (set only on race bosses, bosses.js); race15.js wraps dmgMul.
- Risk: the race egg phase and the first four race bosses are easier; Petri Dish, Endless and levels unchanged (raceOn and campK gate both).

## 2026-10-26 Race: autorun no longer stacks weapons in a rescue's fusion; D2 Sprinter finding (v10.155)
- Systems: race (kindred rescues), tests
- Files: kindred.js, tests/kindredtest.js, tests/sim/race.js
- What: while a rescue's fusion played, the loot state still held the rescue's cards, so autorun's auto-pick took another weapon every 0.7 s past MAX_WEAPONS (a sim got hundreds); picks on the rescue screen are ignored until the fusion closes. race.js now starts as the Baseline sample (no sample meant no rescues, so every past Race sim ran with one weapon) and closes a fusion like a tap.
- Save data: none
- Hooks: none (kindred.js's own UI.pickLoot wrap gains one guard line)
- Risk: none expected; the guard only applies while UI.kinFuse is open on a rescue screen.

