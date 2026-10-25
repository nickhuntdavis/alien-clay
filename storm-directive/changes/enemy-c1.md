# claude/enemy-c1 (ENEMY_HANDOFF.md task C1: boss HP and placement, with sims)

## 2026-10-25 Boss HP and placement retuned from sims (C1)
- Systems: bosses, wave-mode, prestige
- Files: campaign.js, bosses.js, bosspack.js, prestige.js, waves.js, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: Petri Dish boss health is `CAMP.hp` [3.5, 13, 50, 130] (was [2.2, 13, 50, 160]) with Immune Response kept (campBoss used to overwrite `heatBoss`'s health); Mitch & Osis get half health each (`BOSS_TWIN_HP`); the Failed Experiment takes wave 20 in 1 run of 4 with a tier-3 boss's average health and moves by its weapons' v10 attack type. Race and Endless boss health grows by index without the sawtooth (`bossGrow`); Endless draws bosses by tier like wave mode; the Sneeze and the Litmus Strip's glare go through `V10_DIFF.dmg`.
- Numbers (each in one place): `CAMP.hp` [2.2, 13, 50, 160] -> [3.5, 13, 50, 130]; `CAMP.hpClock` 600 (was inline, unchanged); `CAMP.failedOdds` 0.25 (was 0.5 of wave 15 or 20); `CAMP.failedHp` 1 (was x1.4) on def hp = tier-3 average 3333 (was 2600 + 25 x level); `BOSS_TWIN_HP` 0.5 (new, bosses.js, every mode); `BOSS_GROW_ON` 1.5 per boss after the fourth (bosses.js; replaces `(1 + round x 4)` restarting at idx % 4); `FAILED_MOVES` proj spiral, spread aimedFan, burst ring, beam doubleSpiral, pool acidrain, contact charge.
- Save data: none.
- Hooks: waves.js initWaves -> bossTierRoster (Endless); prestige.js heatBoss split into heatBossHp (read by campaign.js campBoss).
- Risk: Race bosses 1 to 4 are unchanged; a fifth and later Race or Endless boss is much tougher than before (was reset to the first's size x5). Twins are softer everywhere. Wave 5 bosses 60% tougher.

### After (same sims; final numbers)
`node sim/wave20.js 4 mortal` (final), plus god runs (`1 god`, `1 god --boss failed`, `1 god --boss twins`) and the mortal set before the twins change.

Mortal (final): 1 of 4 wins (wave 20 Chad Prime in 41 s). Deaths: wave 10 (Mitch & Osis), 15 (Mitch & Osis at 48%), 15
(Mitch & Osis at 43%). Before the twins change: 0 of 4, deaths 13 (Acid drip), 10 (Twins at 4% after 483 s), 20
(Fever at 69%), 15 (Twins at 76%). No death before wave 5 in all 8 runs.

| Wave (HP) | Fights (s), all after-runs | Median before -> after |
|---|---|---|
| 5 (3.0k) | Mucus Plug 14, 10, 19; Litmus 80, 16; Sneeze 23; Johnny 64, 96, 317, 56, 91 | 31 -> 56 |
| 10 (8.2k per twin, 13k to 31k) | Stone 82, 51; Pepsinator 92, 89; Phantom 30, 19; Matron 210; Twins 33, 18 (483 before the twins change) | 72 -> 51 |
| 15 (100k to 131k; twins 37k each) | Phantom 56; Eye 88; Queen 219; Matron 36 | 116 (Failed Experiment) -> 72 |
| 20 (345k to 381k) | Failed Experiment 115 (381k); Chad Prime 111, 41 | 167 -> 111 |

Outliers are mechanics, not health: the Johnny (front bounce), the Litmus Strip, the Matron and the Queen (healing).

Per-wave seconds and hurt, final mortal runs 0 to 3:

| Wave | Run 0 | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 1 crawler | 80 s, 9/123 | 36 s, 0/123 | 71 s, 52/123 | 40 s, 26/123 |
| 2 skitter | 35 s, 14/126 | 41 s, 0/126 | 58 s, 41/126 | 47 s, 41/101 |
| 3 spitter | 50 s, 22/129 | 49 s, 0/134 | 54 s, 0/135 | 46 s, 34/104 |
| 4 brute | 67 s, 0/132 | 56 s, 3/137 | 56 s, 0/138 | 51 s, 4/107 |
| 5 boss | 107 s, 122/138 | 35 s, 58/144 | 32 s, 0/140 | 39 s, 47/109 |
| 6 to 9 | 55 to 94 s, 0 to 149 | 52 to 113 s, 0 to 89 | 53 to 83 s, 0 | 51 to 79 s, 3 to 40 |
| 10 boss | died (Twins) | Matron 222 s, 210/188 | Pepsinator 101 s, 93/181 | Twins 30 s, 1/161 |
| 15 boss | | died (Twins) | died (Twins) | Matron 46 s, 4/269 |
| 20 boss | | | | Chad Prime 51 s, WIN |

Race (`node sim/race.js 3 mortal`): 0 of 3, deaths at 3:40, 6:29, 3:40 (baseline 3:12 to 5:00); bosses 1 to 4 have the same health as before.

## Baseline (measured before any change; main v10.131, 25 Oct 2026)
`node sim/wave20.js 4 mortal`, plus god runs (`2 god`, `1 god --boss twins`, `1 god --boss colossus`). Boss fight =
wave seconds minus the entourage lead (16 s at wave 5, 12 s at 10 and 15, 10 s at 20, 1.5 s for the Failed Experiment).

Mortal: 0 of 4 wins. Deaths: wave 14 (Acid drip, Phantom Pregnancy's entourage), 9 (Mucus Wall elite), 9 (Mucus Wall
elite), 10 (Mitch & Osis at 80%). No death before wave 5.

| Wave (HP) | Mortal fights (s) | God fights (s) |
|---|---|---|
| 5 (1.9k) | Sneeze 30, Litmus 7, Cramp 16, Cramp 26 | Johnny 144, Johnny 79, Sneeze 32, Litmus 251 |
| 10 (13k to 31k) | Phantom 46 | Pepsinator 87, Kidney Stone 72, Queen 19, Twins 703 (16k HP; the 8 s revive loops) |
| 15 Failed Experiment (198k, lv 44 copy) | none reached | 128, 248, 75, 105 |
| 20 (425k to 538k) | none reached | Chad Prime 216 (win), Chad Prime died at 83% after about 48, Colossus 118 (win) |

Per-wave seconds and hurt (mortal runs 0 to 3; hurt is HP lost that wave / max HP):

| Wave | Run 0 | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 1 crawler | 52 s, 23/123 | 48 s, 11/123 | 65 s, 38/123 | 47 s, 21/123 |
| 2 skitter | 45 s, 36/126 | 49 s, 16/101 | 45 s, 20/126 | 42 s, 56/126 |
| 3 spitter | 48 s, 13/129 | 50 s, 7/103 | 53 s, 0/104 | 47 s, 65/129 |
| 4 brute | 62 s, 71/132 | 54 s, 34/107 | 46 s, 61/107 | 51 s, 32/131 |
| 5 boss | 46 s, 5/134 | 23 s, 17/109 | 32 s, 6/107 | 42 s, 97/134 |
| 6 ingrown | 56 s, 0/140 | 53 s, 31/113 | 62 s, 97/113 | 59 s, 19/140 |
| 7 shell | 65 s, 42/143 | 55 s, 59/115 | 72 s, 23/113 | 55 s, 29/141 |
| 8 mosquito | 58 s, 37/144 | 56 s, 141/121 | 57 s, 80/116 | 60 s, 14/143 |
| 9 bulwark | 98 s, 156/147 | died | died | 131 s, 202/146 |
| 10 boss | 58 s, 207/149 | | | died |
| 11 to 13 | 36 s 10, 71 s 59, 55 s 61 | | | |
| 14 | died | | | |
