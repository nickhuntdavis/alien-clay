# Enemy stats

All enemies and bosses, ranked by base HP (weakest first). Source: `ENEMIES` and `BOSSES` in `web/js/data.js`. Behaviour (attack types, projectiles, weaknesses) is in `ENEMY_BEHAVIOUR.md`. Values are base stats at spawn: the game scales HP, speed and armour up as a run goes on.

Bosses are in bold with tier in brackets (tier 1 = wave 5 only, tier 2 = waves 10 and 15, tier 3 = wave 20). "From" is the earliest second the enemy can spawn.

## How the derived columns work

- **Effective HP** = HP x (1 + 0.1 x armour). This is the game's own toughness measure (`aimTough` in `autorun.js`). Armour shred lowers it in play.
- **Contact dmg/s** = contact damage / 0.7. You get 0.7s of invulnerability after a hit, so this is the most contact damage an enemy can deal per second if it never leaves you.
- **Shot dmg/s** = bullets per volley x bullet damage / cooldown, assuming every bullet lands. Only enemies with a `shoot` entry have it. Bosses fire from named patterns with no per-bullet numbers in the data, so they show a dash.
- **Danger/s** = contact dmg/s + shot dmg/s. A theoretical ceiling, not an observed figure. Dodge, kiting and bullet gaps all bring the real number down.

## Table

| # | Enemy | HP | Armour | Effective HP | Speed | Dmg | Contact dmg/s | Shot dmg/s | Danger/s | XP | From |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Spermlet Swarm | 4 | 0 | 4 | 145 | 4 | 5.7 | - | 5.7 | 0.5 | 95 |
| 2 | Krill | 5 | 0 | 5 | 140 | 3 | 4.3 | - | 4.3 | 0.5 | 45 |
| 3 | Sprinter | 6 | 0 | 6 | 125 | 5 | 7.1 | - | 7.1 | 1 | 15 |
| 4 | Daughter Cell | 12 | 0 | 12 | 92 | 5 | 7.1 | - | 7.1 | 1 | split |
| 5 | Also-Ran | 14 | 0 | 14 | 64 | 8 | 11.4 | - | 11.4 | 1 | 0 |
| 6 | Acid Bubble | 16 | 0 | 16 | 98 | 18 | 25.7 | - | 25.7 | 2 | 100 |
| 7 | Candida | 18 | 0 | 18 | 22 | 5 | 7.1 | - | 7.1 | 1 | event |
| 8 | Antibody | 20 | 0 | 20 | 58 | 6 | 8.6 | 2.3 | 10.9 | 3 | 35 |
| 9 | Quantum Swimmer | 22 | 0 | 22 | 72 | 9 | 12.9 | - | 12.9 | 3 | 105 |
| 10 | Daughter Colony | 26 | 0 | 26 | 62 | 6 | 8.6 | - | 8.6 | 2 | split |
| 11 | Killer T-Cell | 26 | 0 | 26 | 52 | 6 | 8.6 | 4.4 | 13.0 | 5 | 260 |
| 12 | Nurse Cell | 30 | 1 | 33 | 56 | 6 | 8.6 | - | 8.6 | 4 | 120 |
| 13 | Paramecium | 30 | 0 | 30 | 105 | 10 | 14.3 | - | 14.3 | 4 | 75 |
| 14 | Ghost Swimmer | 35 | 0 | 35 | 82 | 10 | 14.3 | - | 14.3 | 5 | 195 |
| 15 | Rotifer | 40 | 1 | 44 | 50 | 8 | 11.4 | - | 11.4 | 5 | 110 |
| 16 | Mitotic Cell | 42 | 0 | 42 | 52 | 10 | 14.3 | - | 14.3 | 3 | 85 |
| 17 | Cytokine Caster | 45 | 1 | 50 | 46 | 8 | 11.4 | 22.5 | 33.9 | 6 | 170 |
| 18 | Headbutter | 50 | 2 | 60 | 56 | 18 | 25.7 | - | 25.7 | 4 | 130 |
| 19 | Diatom | 55 | 6 | 88 | 24 | 8 | 11.4 | 17.1 | 28.5 | 6 | 180 |
| 20 | Macrophage | 60 | 3 | 78 | 44 | 16 | 22.9 | - | 22.9 | 4 | 55 |
| 21 | Pepsinator Jr | 60 | 0 | 60 | 72 | 14 | 20.0 | - | 20.0 | 6 | none |
| 22 | Pinworm | 70 | 1 | 77 | 60 | 12 | 17.1 | - | 17.1 | 5 | 140 |
| 23 | Mother Cell | 75 | 2 | 90 | 40 | 10 | 14.3 | - | 14.3 | 8 | 210 |
| 24 | Enzyme Spire | 85 | 4 | 119 | 16 | 10 | 14.3 | 43.8 | 58.1 | 8 | 240 |
| 25 | Mucus Wall | 95 | 8 | 171 | 40 | 14 | 20.0 | - | 20.0 | 6 | 150 |
| 26 | Volvox | 110 | 2 | 132 | 34 | 14 | 20.0 | - | 20.0 | 8 | 160 |
| 27 | Amoeba | 150 | 1 | 165 | 30 | 14 | 20.0 | - | 20.0 | 10 | 70 |
| 28 | Water Bear | 240 | 10 | 480 | 30 | 20 | 28.6 | - | 28.6 | 14 | 270 |
| 29 | Plasmodium | 380 | 3 | 494 | 22 | 22 | 31.4 | - | 31.4 | 24 | 240 |
| 30 | Alpha Swimmer | 420 | 12 | 924 | 34 | 30 | 42.9 | - | 42.9 | 20 | 300 |
| 31 | **The Litmus Strip** [1] | 1500 | 0 | 1500 | 40 | 18 | 25.7 | - | 25.7 | 85 | boss |
| 32 | **The Johnny** [1] | 1500 | 0 | 1500 | 52 | 18 | 25.7 | - | 25.7 | 85 | boss |
| 33 | **The Mucus Plug** [1] | 1500 | 1 | 1650 | 34 | 18 | 25.7 | - | 25.7 | 85 | boss |
| 34 | **The Sneeze** [1] | 1500 | 1 | 1650 | 44 | 18 | 25.7 | - | 25.7 | 85 | boss |
| 35 | **The Cramp** [1] | 1500 | 2 | 1800 | 38 | 18 | 25.7 | - | 25.7 | 85 | boss |
| 36 | **The Kidney Stone** [2] | 1500 | 40 | 7500 | 30 | 28 | 40.0 | - | 40.0 | 85 | boss |
| 37 | **Mitch & Osis** [2] | 1900 | 2 | 2280 | 58 | 26 | 37.1 | - | 37.1 | 50 | boss |
| 38 | **The Macrophage Queen** [2] | 2600 | 2 | 3120 | 46 | 25 | 35.7 | - | 35.7 | 60 | boss |
| 39 | **The Phantom Pregnancy** [2] | 3000 | 0 | 3000 | 50 | 26 | 37.1 | - | 37.1 | 85 | boss |
| 40 | **The Matron** [2] | 3000 | 3 | 3900 | 40 | 24 | 34.3 | - | 34.3 | 80 | boss |
| 41 | **Chad Prime** [3] | 3000 | 5 | 4500 | 95 | 32 | 45.7 | - | 45.7 | 85 | boss |
| 42 | **The Fever** [3] | 3200 | 2 | 3840 | 48 | 30 | 42.9 | - | 42.9 | 85 | boss |
| 43 | **The Immune Eye** [2] | 3400 | 4 | 4760 | 52 | 30 | 42.9 | - | 42.9 | 80 | boss |
| 44 | **The Pepsinator** [2] | 3600 | 0 | 3600 | 44 | 28 | 40.0 | - | 40.0 | 85 | boss |
| 45 | **The Antibody Colossus** [3] | 3800 | 12 | 8360 | 36 | 35 | 50.0 | - | 50.0 | 90 | boss |

## Reading the derived columns

- By effective HP the Kidney Stone (7,500) and Antibody Colossus (8,360) are the toughest bosses by a distance, and the Alpha Swimmer (924) is the toughest regular enemy.
- By Danger/s the Enzyme Spire (58.1) is the deadliest regular enemy on paper because its spiral fires every 0.16s, but it barely moves (speed 16). The Cytokine Caster (33.9) and Diatom (28.5) are next.
- Bosses show contact damage only. Their real output comes from the attack patterns listed in `ENEMY_BEHAVIOUR.md`.
