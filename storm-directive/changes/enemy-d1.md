## 2026-10-25 WAVES10 rework: relays, sniper, Booster, Diatom, Spire and the rest meet the player (D1, not shipped)
- Systems: waves (waves10.js, campaign.js entourage), tests
- Files: web/js/waves10.js, web/js/campaign.js (ENTOURAGE `wisp` -> `krill`), tests/waves10test.js
- What: the 16 ordinary waves now bring in Puffball (7), Sweetcorn (the joke wave, 8), Rotifer (9), Leech (11), Enzyme Spire (12), Plasma Cell (13, Shooter + Relay), Killer T-Cell (14, sniper), Complement (16), Diatom (17, Shell tank + Shooter), Cortisol Puff (18, Swarm + Relay) and, in the wave 19 big mix, Booster, Stem Cell, Fibrin Weaver and Natural Killer. Waves 1 to 4 and 6 are unchanged. New per-wave `cap` (bodies of an id sent in all) cuts the slog waves by count: bulwark 2 and max 30 (wave 9), summoner 1 and max 34 (16), stressball 3 and max 38 (14), staticsock 4, spire 1, max 34 (12). `W10_STATUS` now names `drain` (leech, mosquito), `mark` (complement), `steal` (rotifer); amoeba removed (parked). Entourage `wisp` slots are `krill`. The `teaches` strings are developer notes (nothing reads them on screen).
- Smallest design choice: twelve ordinary waves cannot give 28 first-timers a wave each, so from wave 11 a new behaviour may arrive with one pair partner (ENEMY_DESIGN 10); before wave 11 it is one at a time (plain tag-alongs puffball, sweetcorn, rotifer excepted). waves10test's "alone first" check is relaxed to match.
- Save data: none.
- Hooks: none.
- Risk: balance after wave 11 is new ground (waves 12, 14, 16, 19 carry two new behaviours). Run-to-run variance is large (2 runs per sim); waves 1 to 4 are untouched and the bot still sometimes dies there to the Sprinter (also in the baseline).

### Per-wave seconds (hurt), `node sim/wave20.js 2 mortal`
Before (v10.133): run 0 w1 40 (19), w2 57 (128), died wave 3 to Sprinter. Run 1 w1 47, w2 49, w3 47, w4 61, w5 boss 91 (102), w6 65 (84), w7 80 (39), w8 55 (31), w9 bulwark 111 (180), w10 boss 37, w11 44 (146), died wave 12. 0 wins.
After, final table: run 0 w1 69, w2 54 (148), w3 62, died wave 4 to Sprinter (waves 1 to 4 untouched). Run 1 w1 109 (48), w2 39, w3 43, w4 70, w5 boss 73 (116), w6 53, w7 64, w8 54 (164), w9 69 (66), w10 boss 29, w11 36, w12 64, w13 59, w14 83 (135), died wave 15 (Matron). 0 wins.
After, caps-less intermediate table: run 1 reached wave 20 and WON: w9 87, w12 78, w14 85 (240), w16 128 (65), w17 75, w18 43, w19 63 (187), boss 182 s. Other runs died at waves 10, 12, 13 in the middle tables.
Slog waves: wave 9 111 s -> 64 to 87 s; wave 12 (sock + spire) 99 s -> 64 s after caps; wave 14 83 to 85 s; wave 16 was 128 s before its caps and has not been timed again (no final run reached it).
