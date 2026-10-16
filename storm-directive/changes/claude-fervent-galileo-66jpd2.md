## 2026-10-16 Snot Bubble, player Lubricated, combos batch 2 design (not shipped: APK build blocked)
- Systems: chemistry (player statuses), enemies
- Files: pstatus.js, foes3.js, foes2.js, chem.js, game.js, tests/psttest.js, tests/f3test.js
- What: Lubricated joins Snotty, Sick and Soaking wet as a player status (3 s a hit, 6 s cap): you lose grip and skid wide in turns, and a Static hit on you then lights the grease (GREASE FIRE: x1.3 and an acid-style burn, grease gone). Grease Balls now leave a 5 s oil slick behind them (standing in it lubricates you) and lob a slow oil glob every 6 s. New enemy Snot Bubble (from 120 s, cap 4): swells with each hit; an early pop splashes neighbours with Snotty, a late pop (4+ hits) sticks every enemy within 170 and you if close; Static on it is POPPED (instant, harmless to you).
- Save data: none
- Hooks: game.js trac -> pstGrip; chem.js chemPlayerZones skips z.foe slicks for the speed boost; foes2.js foes2Dmg -> foes3Dmg, foes2Kill -> foes3Kill.
- Risk: Grease Ball is a little more dangerous (slick plus glob); win rate was not re-simmed after it. Wave sim on v9.27 before these changes: 3 of 20 mortal bot wins (15%), against 3 of 12 (25%) before player statuses; too few runs to call it a regression.
