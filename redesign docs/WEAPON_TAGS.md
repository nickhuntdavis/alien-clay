# Weapon tags

Proposal, 25 Oct 2026, for `COMBAT_MATRIX.md` 15.1: every N/A row, pair-bonus condition and combo-mastery condition is written against these tags, never a weapon name. Modifiers add tags while equipped: Mines, Death from Above (where it leaves a mark) and Orbiting add `places`/`orbits` as they apply; Pulling and Knockback add `displaces`; Connecting adds `chains`; Switched at Birth to Fire adds `burns`. A weapon's tag set is therefore live.

| Weapon | Type, attack | Base tags |
|---|---|---|
| Standard Issue | Force, Projectile | `shots` |
| Maximum Gains | Force, Spread | `shots` |
| Nervous Wreck | Force, Contact | `melee`, `displaces` |
| Panic Button | Force, Burst | `burst`, `displaces` |
| Acid Spit | Acid, Projectile | `shots` |
| Red Flagship | Static, Beam | `beam` |
| Nocturnal Emission | Mucus, Pool | `places` |
| Little Prick | Blood, Projectile | `shots` |
| Rent Free | Alien, Projectile | `shots` |
| Hot Mess | Fire, Pool | `places`, `burns` |
| Family Ties | Force, Projectile | `shots`, `displaces`, `places` |
| Skill Issue | Force, Burst | `burst`, `displaces` |
| There Is No Spoon | Force, Projectile | `shots` |
| Nappy Mines | Fire, Burst | `burst`, `places`, `burns` |
| Soulmate Signal | Static, Beam | `beam`, `chains` |
| Unwanted Contact | Static, Projectile | `shots`, `chains` |
| Ewww, Gross | Mucus, Projectile | `shots` |
| Blowing Bubbles | Mucus, Projectile | `shots`, `places` |
| One of These Days | Blood, Projectile | `shots` |
| Sister Cousin | Blood, Projectile | `shots` |
| Peekaboo | Alien, Burst | `burst` |
| Eggs | Alien, Burst | `burst`, `places` |
| Chest Burster | Alien, Projectile | `shots`, `pets` |
| Enzyme Headbutt | Acid, Contact | `melee`, `displaces` |
| Enzyme Sneeze | Acid, Spread | `shots` |
| Spark of Life | Fire, Beam | `beam`, `burns` |
| Laser (new) | Fire, Beam | `beam`, `burns` |

## Resolved

- Family Ties: `places` (a hole is a ground object: it is held by the 3-well cap and merges).
- Skill Issue and Nappy Mines: no `chains`. `chains` means jumps between targets; collisions and Domino are `displaces` and 15.3 territory.
- Blowing Bubbles: `places` (the bubbles sit as traps).
