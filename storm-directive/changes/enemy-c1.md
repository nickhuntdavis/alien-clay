# claude/enemy-c1 (ENEMY_HANDOFF.md task C1: boss HP and placement, with sims)

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
