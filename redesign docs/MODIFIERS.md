# Modifiers

Working proposal, 17 Oct 2026. A **modifier** changes how an attack moves or repeats. It never changes the attack's damage type. Rarely (a fork or mastery upgrade, `UPGRADES.md` 6), it changes the attack type; the new attack type then decides every defence rule. The six attack types are in `ATTACK_TYPES.md`; `COMBAT_MATRIX.md` section 13 (rule 3) says homing, chaining and the rest are modifiers, not new types. This doc defines every modifier the weapons use (`WEAPONS.md`).

## Shared rules

1. **The attack type still decides the defence rules.** An orbiting Contact hit is still Contact (Thorns triggers, Evasion applies); a lobbed Burst is still a Burst (Evasion never applies).
2. **A weapon can carry several modifiers.** Upgrades and forks add more over a run. Each modifier keeps its own cap; check that the stack still reads clearly on screen.
3. **Every hit is a normal hit.** Bars, reactions, the heavy-hit test and lockouts all work per hit, as in `COMBAT_MATRIX.md` section 11. A modifier never creates echo damage (12.1).
4. **Anything that repeats or spreads has a cap** (bounded chains, 12.5).
5. **Telegraph by danger.** Enemy attacks with modifiers show their path (homing shots glow, delayed blasts mark the ground).

## The modifiers

| # | Modifier | Applies to | What it does | Rules and starting values | Used by |
| --- | --- | --- | --- | --- | --- |
| 1 | **Homing** | Projectile, Spread | Shots turn towards their target | Turn rate per weapon (Seeker Siblings 5). If the target dies, the shot flies straight on. Evasion still applies | Seeker Siblings; Nappy Mines' "Learning to Crawl" upgrade |
| 2 | **Piercing** | Projectile, Spread | A shot carries on through enemies | Pierce count per weapon; each enemy passed through costs 15% of the shot's damage. "Railgun" upgrades give unlimited pierce in a straight line. Platelet Clump removes one pierce. Beams always pierce, so they don't need it | Spitball (railgun), Booger Flick, Nose Goblins (1), Black Hole (unlimited) |
| 3 | **Chaining** | Projectile, Contact | After a hit, the attack jumps to another enemy | Up to 3 jumps, range 110, each jump 70% of the last (the same numbers as Charge arcs). A target is hit once per chain | Static Cling, Lightning Bugs |
| 4 | **Ricochet** | Projectile | Shots bounce off walls | Up to 2 bounces, 20% damage lost per bounce. Only where there are walls (campaign levels, wax walls) | Kidney Stone boss (enemy) |
| 5 | **Returning** | Projectile, Spread | Flies out, then comes back to you, hitting on the way out and back | Each pass is a separate hit; an enemy is hit at most once per pass. Turns back at full range or on its third hit (piercing shots turn back at full range only) | Yo-Yo Diet, Heartburn |
| 6 | **Orbiting** | Contact, Projectile | Bodies circle you and attack from there | Radius per weapon (72 for the angels). Orbiters can't be hit, follow you exactly, and are not pets. They may block enemy shots only if the weapon says so (projectile blocking, 12.8) | Premature Evangelation, Nose Goblins, Ulcer Moons |
| 7 | **Delayed detonation** | Burst | The blast is placed, then goes off later or on contact | A visible mark shows the blast area for its whole delay. Placed blasts expire (Nappy Mines: 14 s) | Nappy Mines, Peekaboo's BOO |
| 8 | **Lobbed** | Burst, Pool | Travels in an arc and lands on a point | Passes over enemies on the way; the landing spot is marked during the flight (0.6 s typical). Aimed by the weapon's directive (often DENSEST CLUSTER) | Upchuck, Lard Lobber, Blood Blister, Morning Sickness |
| 9 | **Trail** | Pool | Laid along your swim path | One piece per 30 units swum; each piece is a normal world object and counts towards the 40-object cap (oldest goes first). Nothing is laid while you stand still | Pub Crawl, Runny Nose, The Cold Parcel sample |
| 10 | **Self-centred** | Burst, Contact | Goes off around you rather than at a target | Never hurts you; aimed by nothing (always your position) | Thorny Onesie, Hot and Bothered, Baby Rattle, Carpet Shuffle |
| 11 | **Sweep** | Contact, Beam | The hit area moves across enemies (a swing, or a beam you drag by swimming) | An enemy is hit at most once per sweep, or every 0.1 s for a held beam | Placenta Paddle, Static Hairbrush, Twin Telepathy |
| 12 | **Anchored beam** | Beam | A beam joins two points (you and a twin, or two marked enemies) instead of firing from you | The far anchor sits on the weapon's target (Twin Telepathy: across the crowd, range 520). The beam moves when either end moves | Twin Telepathy |
| 13 | **Rapid volley** | Projectile, Spread | Several shots in quick succession, then a pause | Volley size per weapon (Whooping Cough: 3). Each shot is a normal hit; the volley counts once for "every Nth" | Whooping Cough |
| 14 | **Every Nth** | Any | Every Nth attack is empowered | Show the count (a visible build-up on the weapon icon). The empowered attack is one hit, and may count as heavy if it qualifies | Static Hairbrush (4th), Baby Rattle (3rd), Achoo (4th), Nappy Mines' nuke (6th) |
| 15 | **Growing** | Projectile, Beam, Pool | Gets bigger or stronger with distance, time or hits | Capped at +100% size or damage. Resets when the attack ends | Bogey Roller, Getting Warmer, Black Hole (merges), Upchuck (merging pools) |
| 16 | **Scaling** | Any | Damage scales with one of your stats | One stat only, capped at ×2. Thorny Onesie: max health. Carpet Burn: swim speed. Hot and Bothered: missing health | Thorny Onesie, Carpet Burn, Hot and Bothered |
| 17 | **Multiplying** | Projectile | A shot that kills splits into more shots | Splits once only (split shots never split again), each at 50% damage. At most 12 of the weapon's shots in flight | Seeker Siblings |
| 18 | **Summoned** | Contact (usually) | The attack is delivered by pets | Uses the pets rule (`COMBAT_MATRIX.md` 12.3): 4 per weapon, 8 in total | Little Swimmers, Lightning Bugs, Leeches, Sea Monkeys, Head Lice, Tapeworm undead |

## Adding a modifier

Add a row here, with a cap, before any weapon uses it. Prefer combining two existing modifiers to inventing a third. A modifier that changes how defences apply is not a modifier: it is a rule, and belongs in `COMBAT_MATRIX.md`.
