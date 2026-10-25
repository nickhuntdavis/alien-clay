# Enemy behaviour

Same 45 rows and order as `ENEMY_STATS.md`. Source: `ENEMIES` and `BOSSES` in `web/js/data.js`. Regular enemies have no damage-type weaknesses or resistances in the data (only bosses do). "Weight" is spawn weight once unlocked. "Radius" is body size in world units. Damage types use their player-facing names (Force, Acid, Mucus, Static, Cooties, Oil, Water, Blood, Alien).

| # | Enemy | Attack type | Projectile | Radius | Weight | Pack or splits | Flags | Damage-type weak / resist |
|---|---|---|---|---|---|---|---|---|
| 1 | Spermlet Swarm | chase | none | 6 | 2 | pack of 9 | | none |
| 2 | Krill | krill (darts in bursts) | none | 10 | 2 | pack of 12 | | none |
| 3 | Sprinter | chase | none | 8 | 7 | | | none |
| 4 | Daughter Cell | chase | none | 9 | 0 | | split only | none |
| 5 | Also-Ran | chase | none | 12 | 10 | | | none |
| 6 | Acid Bubble | bomber | none | 12 | 3 | | | none |
| 7 | Candida | yeast (buds daughters) | none | 11 | 0 | | infection event only | none |
| 8 | Antibody | ranged | aimed, 6 dmg, speed 170, every 2.6s | 13 | 4 | | | none |
| 9 | Quantum Swimmer | blink | none | 12 | 2 | | | none |
| 10 | Daughter Colony | chase | none | 12 | 0 | | split only | none |
| 11 | Killer T-Cell | ranged | snipe, 16 dmg, speed 430, every 3.6s | 13 | 1.5 | | | none |
| 12 | Nurse Cell | medic (heals others) | none | 13 | 2 | | | none |
| 13 | Paramecium | ciliate (straight lines, backs off on contact) | none | 13 | 2 | | | none |
| 14 | Ghost Swimmer | phase | none | 13 | 2 | | | none |
| 15 | Rotifer | thief (steals XP) | none | 14 | 1.4 | | | none |
| 16 | Mitotic Cell | chase | none | 17 | 3 | splits into Daughter Cells | | none |
| 17 | Cytokine Caster | ranged | ring of 8, 9 dmg, speed 140, every 3.2s | 15 | 2 | | | none |
| 18 | Headbutter | charge | none | 16 | 3 | | | none |
| 19 | Diatom | ranged | ring of 6, 8 dmg, speed 150, every 2.8s | 16 | 1.4 | | | none |
| 20 | Macrophage | chase | none | 20 | 4 | | | none |
| 21 | Pepsinator Jr | chase | none | 24 | 0 | | not in normal spawns | none |
| 22 | Pinworm | chase | none | 11 | 1.6 | | | none |
| 23 | Mother Cell | summon | none | 18 | 1.2 | | | none |
| 24 | Enzyme Spire | turret | spiral, 7 dmg, speed 125, every 0.16s | 18 | 1.5 | | | none |
| 25 | Mucus Wall | aura | none | 20 | 2 | | | none |
| 26 | Volvox | chase | none | 26 | 1.1 | splits into 4 Daughter Colonies | | none |
| 27 | Amoeba | engulf (eats enemies to grow) | none | 30 (grows to 175) | 0.9 | | spongy (knockback-proof) | none |
| 28 | Water Bear | chase | none | 22 | 0.8 | | heavy, tunnels | none |
| 29 | Plasmodium | engulf (eats enemies to grow) | none | 42 (grows to 210) | 0.7 | splits into Amoebae | spongy (knockback-proof) | none |
| 30 | Alpha Swimmer | chase | none | 28 | 0.6 | | | none |
| 31 | **The Litmus Strip** | litmusdrip, ring, aimedFan | pattern bullets | 46 | boss | | changes colour every 12s | current colour +50%, other types mostly resisted (soaked for 4s after each change: everything hurts) |
| 32 | **The Johnny** | johnnyroll, aimedFan, spiral | pattern bullets | 44 | boss | | front reflects shots, charges and overshoots | none by type (weak from behind, +50% after a charge) |
| 33 | **The Mucus Plug** | mucusspit, ring, aimedFan | pattern bullets | 50 | boss | 4 plugs | seals you in a ring | none by type (+25% once all 4 plugs are broken) |
| 34 | **The Sneeze** | sneezecone, aimedFan, spiral | pattern bullets | 48 | boss | | telegraphed cones, second cone near death | none by type (+30% while sniffing) |
| 35 | **The Cramp** | crampgrip, aimedFan, spiral | pattern bullets | 48 | boss | | grabs and reels you in | none by type (sprint while grabbed: winded, double damage) |
| 36 | **The Kidney Stone** | stoneroll, gravel, ring | pattern bullets | 52 | boss | | 40 armour, armour shred sticks | Static +50% |
| 37 | **Mitch & Osis** | spiral, aimedFan, charge, ring | pattern bullets | 40 | boss | twins revive each other within 8s | | none by type (blasts +30%) |
| 38 | **The Macrophage Queen** | summon, devour, spiral, aimedFan | pattern bullets | 50 | boss | summons swimmers | eats minions to heal | Acid +60% |
| 39 | **The Phantom Pregnancy** | blink, spiral, ring, doubleSpiral | pattern bullets | 46 | boss | | ethereal, immune to Force, passes through obstacles | Blood +50%, immune to Force |
| 40 | **The Matron** | wardround, aimedFan, ring, spiral | pattern bullets | 46 | boss | orbiting nurse cells | heals every enemy nearby | Cooties +60% (also halves her healing) |
| 41 | **Chad Prime** | dash3, tailwhip, aimedFan | pattern bullets | 40 | boss | | dodges 30% of shots, stunned after each dash | none by type (blasts, beams and pools never miss) |
| 42 | **The Fever** | firering, spiral, ring | pattern bullets | 48 | boss | | enrages below 35% HP | Mucus x2, immune to Acid |
| 43 | **The Immune Eye** | blink, glare, flower, doubleSpiral | pattern bullets | 48 | boss | | teleports, tracking beam, double damage while glaring | Blood +50% |
| 44 | **The Pepsinator** | acidrain, ring, spiral | pattern bullets | 54 | boss | splits off blobs at 60% and 30% HP | | Mucus +60%, Acid x0.5, blasts and pools +40% |
| 45 | **The Antibody Colossus** | ring, charge, aimedFan | pattern bullets | 56 | boss | | cannot be knocked back or glued, armour shred sticks | Static +60% |

Boss attack patterns are named in `BOSSES[].patterns`; the data holds no per-bullet numbers for them, so they cannot be given a damage-per-second figure in `ENEMY_STATS.md`.
