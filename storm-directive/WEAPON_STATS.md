# Weapon stats: unified table

All 27 live weapons on `main` (the `matrixonly.js` roster), at `2ad20e9`. Stats are base values before modifiers, read from `WEAPONS[id].base`.

- Rate of Fire = 1 / cooldown (shots per second).
- Spread is in degrees (radians x 57), or "n/a" for weapons that are not aimed.
- Pen is how many enemies one shot reaches. The engine has no falloff stat, so Range (game px) is shown instead.
- Damage is per hit. Beams hit about every 0.1 s, so 3 to 4 per hit is roughly 30 to 40 per second.
- Internal type `flame` is shown as "Fire". The brief names Acid as `fire`, so check that label before player-facing use.

| Our weapon | Type | Dmg | Reload (s) | Spread | RoF | Pen | Mag | Count | Range | Reference weapon |
|---|---|---|---|---|---|---|---|---|---|---|
| Standard Issue | Force | 16 | 1.2 | 2 | 2.2 | 0 | 8 | 1 | 440 | Pistol |
| Acid Spit | Acid | 16 | 1.2 | 2 | 2.2 | 0 | 8 | 1 | 440 | AK-47 |
| Little Prick | Blood | 16 | 1.2 | 2 | 2.2 | 0 | 8 | 1 | 440 | Assault Rifle |
| Rent Free | Alien | 22 | 1.2 | 2 | 1.7 | 0 | 8 | 1 | 440 | RYS-38 Plasma Spiral |
| Maximum Gains | Force | 6 | 1.5 | 40 | 1.3 | 0 | 4 | 7 | 260 | Shotgun |
| Enzyme Sneeze | Acid | 14 | 1.5 | 29 | 1.1 | 0 | 4 | 3 | 160 | (Shotgun alternative) |
| Chest Burster | Alien | 12 | 1.6 | 5 | 2.5 | 0 | 8 | 1 | 430 | SMG |
| There Is No Spoon | Force | 15 | none | 5 | 12.5 | 0 | 10 | 1 | 460 | .50 Cal AMR |
| Sister Cousin | Blood | 9 | 2.0 | 69 | 2.2 | 0 | 6 | 2 | 500 | Hydra Minimissile Swarmer |
| Red Flagship | Static | 3 | 1.2 | 0 | 10 | 99 | 30 | 1 | 300 | Pulse Rifle |
| Laser | Fire | 3 | 1.2 | 0 | 10 | 99 | 30 | 1 | 300 | GT Ultralite Railgun |
| Spark of Life | Fire | 4 | 1.0 | 0 | 10 | 99 | 12 | 1 | 180 | Optical Carbine |
| Hot Mess | Fire | 9 | 1.6 | scatter 40 px | 1.0 | pool (58) | 4 | 1 | 380 | Dragonfire Flame Projector |
| Nocturnal Emission | Mucus | 9 | 1.6 | scatter 40 px | 1.0 | pool (58) | 4 | 1 | 380 | none |
| Unwanted Contact | Static | 11 | 1.8 | n/a | 1.4 | chain 3 | 6 | 1 | 330 | Teslion Carbine |
| Ewww, Gross | Mucus | 18 | 2.0 | n/a | 0.7 | chain 3 | 3 | 1 | 420 | none |
| Soulmate Signal | Static | 24 | 2.0 | n/a | 0.6 | beam | 3 | 1 | 520 | Prototype Gun |
| Skill Issue | Force | 14 | 1.8 | scatter 40 px | 0.8 | blast (66) | 3 | 1 | 380 | RPG |
| Panic Button | Force | 34 | 1.4 | 0 | 0.9 | blast (70) | 3 | 1 | 380 | none |
| Nappy Mines | Fire | 34 | 2.4 | n/a | 1.4 | blast (72) | 5 | 1 | 600 | none |
| Nervous Wreck | Force | 30 | 1.0 | 17 | 1.7 | arc | 4 | 1 | 110 | none |
| Enzyme Headbutt | Acid | 34 | 1.0 | 17 | 1.7 | arc | 4 | 1 | 70 | none |
| Family Ties | Force | 8 | 2.5 | 11 | 0.6 | 99 | 2 | 1 | 400 | none |
| Blowing Bubbles | Mucus | 18 | 2.0 | n/a | 0.9 | holds enemies | 4 | 1 | 380 | none |
| One of These Days | Blood | 20 | 2.0 | n/a | 1.1 | delayed hit | 3 | 1 | 480 | none |
| Peekaboo | Alien | 20 | 0.1 | n/a | 0.2 | area (230) | 1 | 1 | 420 | none |
| Eggs | Alien | 34 | 2.0 | n/a | 0.9 | lure | 3 | 1 | 420 | none |

## Reference weapons not mapped one-to-one

Red Flagship and Laser are the same beam in two damage types. Standard Issue, Acid Spit and Little Prick are the same bullet in three. Twelve of ours have no counterpart on the reference list: melee, mines, lures, bubbles, delayed hits and area pulses.
