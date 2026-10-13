# Spawn Prawn review log

## 2026-10-12 07:18 UTC: run log review (v8.94, 3 runs, 1 finished, 1 won)

Verdict: early spike, late walkover. One finished run is too small a sample for the win rate.

### Now
1. Late game too easy. Run 3 HP was 100% in every sample from minute 14 (Lv14 to Lv37). It took 305 damage in 14 minutes but sustain (vamp, lungs) outpaced it. Box income snowballs: 94 boxes (6.7 per minute), 31 chests, 15 relics, Lv38, 4281 kills. Likely well above the 1 in 3 human target.
2. Early game too harsh. Deaths at wave 3 (2:02) and wave 5 (3:11, Immune Eye).
   - Run 1: single weak source (Static Cling 87% of damage), 46% of damage from acid hazards.
   - Run 2: thin build, 94 contact damage, killed by the Immune Eye death stare.
3. Win rate: 1 of 1 finished (100%) against a 33% target. No real data until about 10 finished runs.

### Later
4. Hitches outside update and draw: 125ms frames in runs 1 and 2 (fps low 8 to 12) with update and draw at 1 to 2ms. Likely a loot or level-up UI open, or first-frame load. Same pattern in run 3 minute 1 (50ms). Run 2 minute 2 is a real draw spike (draw 35ms).
5. Late draw cost rising: run 3 reached 210 to 282 particles and 107 shots, draw up to 15ms, one 67ms frame (draw 26) in minute 11. Fine now, first thing to break on a weaker phone.
6. "fps low 30" in run 3 is a single missed frame at 60Hz. Not a problem.
7. Log quirk: run 2 lists `pierce0` under ups (upgrade shown at zero).
8. Device refresh rate reads 120Hz in runs 1 and 2, 60Hz in run 3, same phone.

### Open next steps
- Balance pass on late-game sustain versus early hazard damage (wave 3 acid). Suits Opus (sims, several numbers tuned together).
- Play 2 or 3 more runs and add the logs here.
