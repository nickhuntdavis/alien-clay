# Enemy stats (v10, generated)

Generated from the live game by `tests/tools/enemytables.js` (it loads the game, reads `ENEMIES`, `ROSTER`, `BOSSES` and `V10_DIFF`, and builds each enemy with the real `makeEnemy`). Re-run it after balance changes. Behaviour, attack types and notes are in `ENEMY_BEHAVIOUR.md`.

v10 replaced armour with five defences (Squishy, Membrane, Shell, Thorns, Evasion; rules in `redesign docs/COMBAT_MATRIX.md`). Every enemy's armour is 0 in the live game, so there is no armour column. Rows are ranked by effective HP at the start of a run, weakest first.

## How the numbers work

- **Base HP** is the roster value. **HP at start** and **HP at 5 min** are what `makeEnemy` produces at run clock 0 and 450 (5 real minutes at pace 1.5), including the v10 enemy HP knob (x0.65) and the run's HP curve. Wave mode and the campaign use their own clocks, so treat these as a guide.
- **Effective HP** (at start) adjusts HP for the defence against ordinary non-Force-specific hits: Membrane adds its pool (+50%), Shell adds its layers' own health (+15% per layer, and each hit also loses 3 damage per layer, not counted here), Evasion divides by the hit chance, Squishy divides by the blunt cut (Force only). Thorns does not change HP. It is an estimate: the matrix says numbers are still for playtesting.
- **Contact dmg** is what one touch does at the start of a run (includes the x0.6 v10 damage knob). **Contact dmg/s** = contact dmg / 0.7 (you get 0.7s of invulnerability after a hit): the most a touching enemy can deal per second.
- **Shot dmg/s** counts only enemies with a legacy `shoot` table: bullets per volley x bullet dmg x 0.6 (v10 bullet knob) / (cooldown x 1.33 fire gap), assuming every bullet lands. Newer attack types (Burst, Beam, Pool) have no cadence in the data and are not counted; see `ENEMY_BEHAVIOUR.md`.
- **Danger/s** = contact dmg/s + shot dmg/s. A ceiling, not an observed figure.

## Regular enemies

| # | Enemy | Base HP | HP at start | HP at 5 min | Defence | Effective HP | Speed | Contact dmg | Contact dmg/s | Shot dmg/s | Danger/s | XP | From |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lost Tadpole | 1 | 2 | 1.1 | none | 2 | 46 | 0 | 0 | - | 0 | 0.5 | 80 |
| 2 | Spermlet Swarm | 4 | 3.7 | 62.8 | none | 3.7 | 145 | 1.5 | 2.1 | - | 2.1 | 0.5 | events and bosses only |
| 3 | Krill | 5 | 4.7 | 78.6 | none | 4.7 | 140 | 1.1 | 1.6 | - | 1.6 | 0.5 | 45 |
| 4 | Spore | 6 | 5.6 | 94.3 | none | 5.6 | 84 | 1.5 | 2.1 | - | 2.1 | 0.3 | spawned only |
| 5 | Glitter | 8 | 7.5 | 125.7 | none | 7.5 | 76 | 0.7 | 1.1 | - | 1.1 | 0.4 | 95 |
| 6 | Mosquito | 8 | 7.5 | 125.7 | none | 7.5 | 118 | 1.5 | 2.1 | - | 2.1 | 1.5 | 85 |
| 7 | Sprinter | 6 | 5.6 | 94.3 | Evasion (35% miss) | 8.6 | 125 | 1.9 | 2.7 | - | 2.7 | 1 | 15 |
| 8 | Broodling | 10 | 9.4 | 157.1 | none | 9.4 | 108 | 2.2 | 3.2 | - | 3.2 | 0.5 | spawned only |
| 9 | Stray Pube | 10 | 9.4 | 157.1 | none | 9.4 | 30 | 0 | 0 | - | 0 | 0.5 | 90 |
| 10 | Daughter Cell | 12 | 11.2 | 188.5 | none | 11.2 | 92 | 1.9 | 2.7 | - | 2.7 | 1 | spawned only |
| 11 | Also-Ran | 14 | 13.1 | 220 | none | 13.1 | 64 | 3 | 4.3 | - | 4.3 | 1 | 0 |
| 12 | Bogey | 16 | 15 | 251.4 | none | 15 | 58 | 0 | 0 | - | 0 | 0.6 | 100 |
| 13 | Acid Bubble | 16 | 15 | 251.4 | none | 15 | 98 | 6.7 | 9.6 | - | 9.6 | 2 | 100 |
| 14 | Navel Fluff | 18 | 16.8 | 282.8 | none | 16.8 | 34 | 1.1 | 1.6 | - | 1.6 | 0.6 | 75 |
| 15 | Candida | 18 | 16.8 | 282.8 | none | 16.8 | 22 | 1.9 | 2.7 | - | 2.7 | 1 | spawned only |
| 16 | Matchstick | 20 | 18.7 | 314.2 | none | 18.7 | 60 | 4.5 | 6.4 | - | 6.4 | 3 | 150 |
| 17 | Antibody | 20 | 18.7 | 314.2 | none | 18.7 | 58 | 2.2 | 3.2 | 1 | 4.2 | 3 | 35 |
| 18 | Killer T-Cell | 26 | 24.3 | 408.5 | none | 24.3 | 52 | 2.2 | 3.2 | 2 | 5.2 | 5 | 260 |
| 19 | Daughter Colony | 26 | 24.3 | 408.5 | none | 24.3 | 62 | 2.2 | 3.2 | - | 3.2 | 2 | events and bosses only |
| 20 | Complement Protein | 28 | 26.2 | 439.9 | none | 26.2 | 60 | 2.2 | 3.2 | - | 3.2 | 5 | 165 |
| 21 | Cortisol Puff | 30 | 28.1 | 471.4 | none | 28.1 | 50 | 2.2 | 3.2 | - | 3.2 | 5 | 145 |
| 22 | Leech | 30 | 28.1 | 471.4 | none | 28.1 | 72 | 2.6 | 3.7 | - | 3.7 | 4 | 130 |
| 23 | Paramecium | 30 | 28.1 | 471.4 | none | 28.1 | 105 | 3.7 | 5.3 | - | 5.3 | 4 | events and bosses only |
| 24 | Snot Bubble | 30 | 28.1 | 471.4 | none | 28.1 | 34 | 2.2 | 3.2 | - | 3.2 | 4 | 120 |
| 25 | Phlegm Hocker | 32 | 30 | 502.8 | none | 30 | 50 | 3 | 4.3 | - | 4.3 | 4 | 140 |
| 26 | Quantum Swimmer | 22 | 20.6 | 345.7 | Evasion (35% miss) | 31.7 | 72 | 3.3 | 4.8 | - | 4.8 | 3 | 105 |
| 27 | Interferon | 34 | 31.8 | 534.2 | none | 31.8 | 46 | 2.2 | 3.2 | - | 3.2 | 6 | 185 |
| 28 | Planarian | 34 | 31.8 | 534.2 | none | 31.8 | 72 | 3.7 | 5.3 | - | 5.3 | 2 | 230 |
| 29 | Ingrown Hair | 36 | 33.7 | 565.6 | Thorns (5 + 35%) | 33.7 | 54 | 3.3 | 4.8 | - | 4.8 | 3 | 65 |
| 30 | Trapped Wind | 24 | 22.5 | 377.1 | Squishy (-35% Force) | 34.6 | 28 | 0 | 0 | - | 0 | 3 | 250 |
| 31 | Nurse Cell | 30 | 28.1 | 471.4 | Membrane (30% pool) | 36.5 | 56 | 2.2 | 3.2 | - | 3.2 | 4 | 120 |
| 32 | Litmus Cell | 40 | 37.4 | 628.5 | none | 37.4 | 50 | 3.7 | 5.3 | - | 5.3 | 4 | spawned only |
| 33 | Rotifer | 40 | 37.4 | 628.5 | none | 37.4 | 50 | 3 | 4.3 | - | 4.3 | 5 | 110 |
| 34 | Puffball | 42 | 39.3 | 659.9 | none | 39.3 | 42 | 3 | 4.3 | - | 4.3 | 4 | 110 |
| 35 | Fibrin Weaver | 44 | 41.2 | 691.3 | none | 41.2 | 40 | 3 | 4.3 | - | 4.3 | 6 | 205 |
| 36 | Second Dose | 45 | 42.1 | 707.1 | none | 42.1 | 92 | 4.5 | 6.4 | 1.1 | 7.4 | 6 | spawned only |
| 37 | Cytokine Caster | 45 | 42.1 | 707.1 | none | 42.1 | 46 | 3 | 4.3 | 10.2 | 14.4 | 6 | 170 |
| 38 | Platelet Clump | 46 | 43.1 | 722.8 | none | 43.1 | 46 | 3.7 | 5.3 | - | 5.3 | 4 | 160 |
| 39 | Plasma Cell | 38 | 35.6 | 597.1 | Membrane (30% pool) | 46.2 | 46 | 2.6 | 3.7 | - | 3.7 | 6 | 175 |
| 40 | Headbutter | 50 | 46.8 | 785.6 | none | 46.8 | 56 | 6.7 | 9.6 | - | 9.6 | 4 | 130 |
| 41 | Hayfever Cell | 50 | 46.8 | 785.6 | none | 46.8 | 48 | 3.7 | 5.3 | - | 5.3 | 5 | 200 |
| 42 | Mirror Cell | 34 | 31.8 | 534.2 | Membrane (50% pool) | 47.7 | 54 | 3.3 | 4.8 | - | 4.8 | 4 | 150 |
| 43 | Static Sock | 34 | 31.8 | 534.2 | Squishy (-35% Force) | 49 | 58 | 1.9 | 2.7 | - | 2.7 | 3 | 100 |
| 44 | Shell Cell | 46 | 43.1 | 722.8 | Shell x1 (-3/hit) | 49.5 | 38 | 4.5 | 6.4 | - | 6.4 | 5 | 175 |
| 45 | Ghost Swimmer | 35 | 32.8 | 549.9 | Evasion (35% miss) | 50.4 | 82 | 3.7 | 5.3 | - | 5.3 | 5 | 195 |
| 46 | Mitotic Cell | 42 | 39.3 | 659.9 | Membrane (30% pool) | 51.1 | 52 | 3.7 | 5.3 | - | 5.3 | 3 | 85 |
| 47 | Stem Cell | 44 | 41.2 | 691.3 | Membrane (30% pool) | 53.5 | 36 | 2.2 | 3.2 | - | 3.2 | 8 | 230 |
| 48 | Pepsinator Jr | 60 | 56.2 | 942.7 | none | 56.2 | 72 | 5.2 | 7.4 | - | 7.4 | 6 | events and bosses only |
| 49 | Callus | 58 | 54.3 | 911.3 | Shell x1 (-3/hit) | 62.4 | 40 | 4.5 | 6.4 | - | 6.4 | 5 | 200 |
| 50 | Diatom | 55 | 51.5 | 864.2 | Shell x2 (-3/hit) | 66.9 | 24 | 3 | 4.3 | 7.7 | 12 | 6 | 180 |
| 51 | Natural Killer | 48 | 44.9 | 754.2 | Evasion (35% miss) | 69.1 | 70 | 4.8 | 6.9 | - | 6.9 | 6 | 180 |
| 52 | Grease Ball | 52 | 48.7 | 817 | Squishy (-35% Force) | 74.9 | 52 | 4.1 | 5.8 | - | 5.8 | 5 | 190 |
| 53 | Birthday Candle | 70 | 65.5 | 1099.9 | Shell x2 (-3/hit) | 85.2 | 0 | 2.2 | 3.2 | - | 3.2 | 7 | 220 |
| 54 | Macrophage | 60 | 56.2 | 942.7 | Squishy (-35% Force) | 86.4 | 44 | 6 | 8.5 | - | 8.5 | 4 | 55 |
| 55 | Mother Cell | 75 | 70.2 | 1178.4 | Membrane (30% pool) | 91.3 | 40 | 3.7 | 5.3 | - | 5.3 | 8 | 210 |
| 56 | Enzyme Spire | 85 | 79.6 | 1335.6 | Shell x1 (-3/hit) | 91.5 | 16 | 3.7 | 5.3 | 19.7 | 25.1 | 8 | 240 |
| 57 | Volvox | 110 | 103 | 1728.4 | none | 103 | 34 | 5.2 | 7.4 | - | 7.4 | 8 | events and bosses only |
| 58 | Bit of Sweetcorn | 110 | 103 | 1728.4 | Shell x1 (-3/hit) | 118.4 | 32 | 0 | 0 | - | 0 | 2 | 115 |
| 59 | Stress Ball | 90 | 84.2 | 1414.1 | Squishy (-35% Force) | 129.6 | 36 | 3 | 4.3 | - | 4.3 | 5 | 125 |
| 60 | Brood Cyst | 140 | 131 | 2199.7 | none | 131 | 30 | 5.2 | 7.4 | - | 7.4 | 10 | 200 |
| 61 | Mucus Wall | 95 | 88.9 | 1492.7 | Membrane (50% pool) | 133.4 | 40 | 5.2 | 7.4 | - | 7.4 | 6 | 150 |
| 62 | Booster | 120 | 112.3 | 1885.5 | Shell x2 (-3/hit) | 146 | 62 | 5.2 | 7.4 | 1 | 8.5 | 10 | 300 |
| 63 | Amoeba | 150 | 140.4 | 2356.9 | Squishy (-35% Force) | 216 | 30 | 5.2 | 7.4 | - | 7.4 | 10 | 70 |
| 64 | Water Bear | 240 | 224.6 | 3771 | Shell x4 (-3/hit) | 359.4 | 30 | 7.4 | 10.6 | - | 10.6 | 14 | 270 |
| 65 | Alpha Swimmer | 420 | 393.1 | 6599.2 | Membrane (50% pool) | 589.7 | 34 | 11.2 | 15.9 | - | 15.9 | 20 | 300 |

## Bosses

Boss HP in wave mode is base HP x 2.2 / 13 / 50 / 160 (for the boss on waves 5 / 10 / 15 / 20) x (1 + run clock / 600) x 0.45 (v10 boss HP knob). Tier 1 bosses only appear on wave 5, tier 2 on waves 10 and 15, tier 3 on wave 20. The run clock is estimated as 30s per wave, ignoring the early-wave bonus. Boss damage also gets a per-boss-wave softener (`CAMP.hit` = 0.55 / 0.82 / 1 / 1.1) that is not applied below. Race and level modes use different formulas. Contact dmg/s uses base damage x 0.6; boss attacks come from named patterns with no per-bullet numbers in the data, so there is no shot column.

| # | Boss | Tier | Base HP | HP in wave mode (wave: HP) | Defence | Damage type | Speed | Contact dmg/s | XP |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **The Litmus Strip** | 1 | 1500 | 5: 1782 | none | acid | 40 | 15.4 | 85 |
| 2 | **The Mucus Plug** | 1 | 1500 | 5: 1782 | none | mucus | 34 | 15.4 | 85 |
| 3 | **The Cramp** | 1 | 1500 | 5: 1782 | none | blood | 38 | 15.4 | 85 |
| 4 | **The Sneeze** | 1 | 1500 | 5: 1782 | none | mucus | 44 | 15.4 | 85 |
| 5 | **The Johnny** | 1 | 1500 | 5: 1782 | Membrane (50% pool) | force | 52 | 15.4 | 85 |
| 6 | **Mitch & Osis** | 2 | 1900 | 10: 16117; 15: 72675 | none | force + acid | 58 | 22.3 | 50 |
| 7 | **The Kidney Stone** | 2 | 1500 | 10: 12724; 15: 57375 | Shell x6 (-3/hit) | force | 30 | 24 | 85 |
| 8 | **The Matron** | 2 | 3000 | 10: 25448; 15: 114750 | none | force | 40 | 20.6 | 80 |
| 9 | **The Phantom Pregnancy** | 2 | 3000 | 10: 25448; 15: 114750 | none | soul | 50 | 22.3 | 85 |
| 10 | **The Immune Eye** | 2 | 3400 | 10: 28841; 15: 130050 | none | soul | 52 | 25.7 | 80 |
| 11 | **The Pepsinator** | 2 | 3600 | 10: 30537; 15: 137700 | none | acid | 44 | 24 | 85 |
| 12 | **The Macrophage Queen** | 2 | 2600 | 10: 22055; 15: 99450 | Squishy (-35% Force) | force | 46 | 21.4 | 60 |
| 13 | **The Fever** | 3 | 3200 | 20: 449280 | none | fire | 48 | 25.7 | 85 |
| 14 | **Chad Prime** | 3 | 3000 | 20: 421200 | Evasion (35% miss) | force | 95 | 27.4 | 85 |
| 15 | **The Antibody Colossus** | 3 | 3800 | 20: 533520 | Shell x5 (-3/hit) | force | 36 | 30 | 90 |
