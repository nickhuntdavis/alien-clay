# Spawn Prawn: complete game guide

Every weapon, spell, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Weapons](#weapons)
3. [Pairings (secret combos)](#pairings-secret-combos)
4. [Bosses and relics](#bosses-and-relics)
5. [Spells](#spells)
6. [Power-ups (passives)](#power-ups-passives)
7. [Upgrades any weapon can take](#upgrades-any-weapon-can-take)
8. [Modifiers](#modifiers)
9. [Duo combos](#duo-combos)
10. [Stains](#stains)
11. [Cursed cards](#cursed-cards)
12. [Field pickups](#field-pickups)
13. [Elemental reactions](#elemental-reactions)
14. [Element synergies](#element-synergies)
15. [Targeting directives](#targeting-directives)
16. [Movement directives](#movement-directives)
17. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
18. [Enemies](#enemies)
19. [Rival champions](#rival-champions)
20. [Terrain](#terrain)
21. [Sperm samples](#sperm-samples)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, spells, power-ups, modifiers, stains and (rarely) curses.
2. **Weapons** level up to Lv10. Each weapon has its own upgrade path:
   - **Lv 3 and Lv 8:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it).
   - **Lv 5 (signature):** pick one of two upgrades only that weapon has. This decides how it plays.
   - **Lv 10 (mastery):** pick one of two more. Big, build-defining changes.
3. **Pairings:** own two specific weapons, both at Lv5+, and they start working together. They are secret until you find them.
4. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
5. **Weapon slots:** 3 to start, one more at Lv 15, 30, 45.
6. **Bosses:** a boss every 3 minutes. Each run meets 4 of the 8, in a random order. Beat one and choose one of its three relics.
7. **Rarity** multiplies a card's value:

| Rarity | Multiplier | Weapon levels granted | Drop weight |
|---|---|---|---|
| Bronze | x1 | +1 | 60% |
| Silver | x1.5 | +1 | 27% |
| Gold | x2 | +2 | 10% |
| Legendary | x3 | +3 | 3% |

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Weapons

14 weapons, each with its own play style. **Start** = can appear in your first box. **Bank** = add it to the first box from the Gene Bank (DNA cost shown). Every weapon can also drop from level-ups and DNA strands.

| Weapon | Element | Role | Aims at |
|---|---|---|---|
| [Spitball](#spitball) (Start) | Kinetic | Marksman | NEAREST |
| [Hiccup Scattergun](#hiccup-scattergun) (Start) | Kinetic | Brawler | NEAREST |
| [Yo-Yo Diet](#yo-yo-diet) (Start) | Kinetic | Boomerang | FURTHEST |
| [Slipstream Scalpel](#slipstream-scalpel) (Bank 80) | Kinetic | Swim Path | NEAREST |
| [Heartburn](#heartburn) (Start) | Fire | Flamethrower | NEAREST |
| [Nappy Mines](#nappy-mines) (Bank 60) | Fire | Trapper | NEAREST |
| [Cold Feet](#cold-feet) (Start) | Frost | Freezer | FASTEST |
| [Static Cling](#static-cling) (Start) | Shock | Chain Lightning | DENSEST CLUSTER |
| [Morning Sickness](#morning-sickness) (Start) | Toxic | Area Denial | DENSEST CLUSTER |
| [Tapeworm Seeder](#tapeworm-seeder) (Bank 90) | Toxic | Necromancer | HIGHEST HEALTH |
| [Seeker Siblings](#seeker-siblings) (Start) | Arcane | Swarm | WEAKEST |
| [Toddler Gravity](#toddler-gravity) (Bank 80) | Arcane | Crowd Control | DENSEST CLUSTER |
| [Premature Evangelation](#premature-evangelation) (Bank 60) | Arcane | Bodyguard | NEAREST |
| [Placental Siphon](#placental-siphon) (Bank 100) | Arcane | Counter | NEAREST |

### Spitball

*Kinetic gun, Marksman.* Reliable, accurate single shots. Mildly unhygienic.

- **Base stats:** dmg 11, cd 0.3s, mag 12, reload 1.1s, range 440
- **Level bonuses:** Lv3: +1 pierce; Lv6: +1 count; Lv9: +30% dmg
- **Pairings:** **Conductive Spit** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
| Lv 5 signature | **Hock a Loogie** | Every 4th shot is a giant glob: triple damage, pierces everything, and bursts at the end of its flight. |
|  | **Wet Willy** | Hits leave enemies Soggy for 3s. Soggy enemies take +30% damage from everything you own. |
| Lv 8 | **Domino Effect** | Kills explode for 60% of the killing blow. |
|  | **Special Delivery** | Hits explode for 35% damage around the target. |
|  | **Carpet Shock** | 30% of hits arc to a nearby enemy for 50% damage. |
| Lv 10 mastery | **Kidney Stone** | It becomes a railgun: x4 damage, pierces everything, shreds armour, fires half as often. |
|  | **Projectile Vomit** | Fires four times as fast in a wide hose. Each droplet deals 45% damage and pierces once. |

### Hiccup Scattergun

*Kinetic gun, Brawler.* A close-range burst with knockback. Comes out whether you want it to or not.

- **Base stats:** dmg 8, cd 0.75s, mag 4, reload 1.6s, x6, range 270 (knock 70)
- **Level bonuses:** Lv3: +2 count; Lv6: +1 pierce; Lv9: +2 count
- **Pairings:** **Sucker Punch** (+ Toddler Gravity)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Point Blank** | Pellets hit up to +150% harder the closer the target is. Get in their face. |
|  | **Slug** | All the pellets fuse into one heavy slug (90% of their total damage) that pierces 3 enemies and bowls them over. |
| Lv 8 | **Special Delivery** | Hits explode for 35% damage around the target. |
|  | **Kick Them While Down** | +60% damage to enemies under 35% health. |
|  | **Toxic Relationship** | Hits add a stacking poison. |
| Lv 10 mastery | **Hiccup Fit** | Every 3rd blast is a full ring of pellets around you that also wipes out nearby enemy bullets. |
|  | **Dragon's Breath** | Pellets turn to fire, set enemies alight and leave small burning puddles where they land. |

### Yo-Yo Diet

*Kinetic gun, Boomerang.* A spinning blade that flies out and always comes back. Like the weight.

- **Base stats:** dmg 16, cd 1s, mag 2, reload 1.3s, pierce all, range 330 (boomerang 1)
- **Level bonuses:** Lv3: +20% dmg; Lv6: +1 count; Lv9: +30% dmg
- **Pairings:** **Tetherball** (+ Toddler Gravity), **Sibling Yo-Yo** (+ Seeker Siblings)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Walk the Dog** | At full reach the yo-yo spins in place for a second, grinding everything it touches, then comes home. |
|  | **Crash Diet** | The yo-yo grows every time it hits something: +10% size and damage per hit, every throw. |
| Lv 8 | **Plus One** | +1 projectile. |
|  | **Punching Up** | +100% damage to elites, bosses and rival champions. |
|  | **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
| Lv 10 mastery | **Around the World** | Three yo-yos per throw, and every catch heals you a little for each enemy it hit. |
|  | **Black Hole Yo-Yo** | At full reach it becomes a gravity well for 1.5s, then snaps home dragging its catch with it. |

### Slipstream Scalpel

*Kinetic wake, Swim Path.* Your swim path becomes a blade. Keep moving, or it is just very expensive litter.

- **Base stats:** dmg 24 (dur 2.2, area 22)
- **Level bonuses:** Lv3: +30% area; Lv6: +50% duration; Lv9: +50% dmg
- **Pairings:** **Nappy Trail** (+ Morning Sickness), **Trail Mix** (+ Nappy Mines)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Closing the Loop** | Swim a loop around enemies and everything inside it takes a massive cut. Try the ORBIT autorun. |
|  | **Razor Wire** | The trail lasts twice as long and slows whatever swims through it. |
| Lv 8 | **Due Date Panic** | 40% faster cooldown and reload. |
|  | **Sugar Rush** | +75% damage. |
|  | **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
| Lv 10 mastery | **Surgical Team** | Two ghost scalpels circle you, each cutting its own trail. |
|  | **Afterburner** | The trail catches fire, and the faster you swim the hotter it burns (up to x2.5). |

### Heartburn

*Fire gun, Flamethrower.* A short-range cone of fire. Every lick burns. Antacids not included.

- **Base stats:** dmg 3.4, cd 0.05s, mag 50, reload 2.1s, x2, pierce all, range 200
- **Level bonuses:** Lv3: +30% area; Lv6: +30% dmg; Lv9: +1 count
- **Pairings:** **Hot Flush, Cold Sweat** (+ Cold Feet), **Family BBQ** (+ Premature Evangelation)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Blue Flame** | Narrow and long: +70% range, a tight cone and +40% damage. |
|  | **Indigestion** | Burning enemies explode in flames when they die, spreading the burn to everything nearby. |
| Lv 8 | **Twins!** | +2 projectiles. |
|  | **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
|  | **Plus One** | +1 projectile. |
| Lv 10 mastery | **Dragon** | Twice the flames, sweeping a full circle around you, forever. |
|  | **Hell's Kitchen** | It never reloads, and the damage climbs the longer you keep firing (up to x3). Cools off when idle. |

### Nappy Mines

*Fire mine, Trapper.* Drops proximity mines in your wake. Nobody wants to change them.

- **Base stats:** dmg 34, cd 0.7s, mag 5, reload 2.4s, range 600 (explode 72, life 14)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +50% dmg
- **Pairings:** **Baby Monitor Network** (+ Static Cling), **Trail Mix** (+ Slipstream Scalpel)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Domino Nappies** | A blast sets off every mine near it, and each one in the chain goes off 25% bigger than the last. |
|  | **Sticky Nappies** | Mines are thrown onto enemies and stick to them, going off 1.2s later. |
| Lv 8 | **Giant Killer** | +150% damage to elites, bosses and rival champions. |
|  | **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
|  | **Domino Effect** | Kills explode for 60% of the killing blow. |
| Lv 10 mastery | **Nuclear Nappy** | Every 6th mine is a nuke: three times the blast radius and six times the damage. |
|  | **Minefield** | Three mines per drop, twice as often, and they last twice as long. |

### Cold Feet

*Frost gun, Freezer.* Piercing ice shards that chill and freeze. Commitment issues, weaponised.

- **Base stats:** dmg 15, cd 0.6s, mag 5, reload 1.5s, pierce 3, range 460
- **Level bonuses:** Lv3: +1 count; Lv6: +2 pierce; Lv9: +1 count
- **Pairings:** **Hot Flush, Cold Sweat** (+ Heartburn), **Snow Globe** (+ Toddler Gravity)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Shatter** | A shard that hits a frozen enemy shatters it for 250% damage in an icy burst. |
|  | **Icicle Lance** | +4 pierce, and each enemy a shard passes through makes it 25% stronger. |
| Lv 8 | **Due Date Panic** | 40% faster cooldown and reload. |
|  | **Punching Up** | +100% damage to elites, bosses and rival champions. |
|  | **Giant Killer** | +150% damage to elites, bosses and rival champions. |
| Lv 10 mastery | **Ice Age** | Shards leave frost patches behind that freeze anything that swims through. |
|  | **Cold Snap** | Every 4s a freezing blast around you freezes every non-boss enemy within reach. |

### Static Cling

*Shock chain, Chain Lightning.* Instant lightning that arcs between enemies, like a nylon onesie in winter.

- **Base stats:** dmg 13, cd 0.7s, mag 6, reload 1.8s, range 330 (chain 3, jump 140)
- **Level bonuses:** Lv3: +2 chain; Lv6: +1 count; Lv9: +2 chain
- **Pairings:** **Baby Monitor Network** (+ Nappy Mines), **Conductive Spit** (+ Spitball), **Static Discharge** (+ Placental Siphon)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Short Circuit** | +3 jumps, and the lightning can bounce back to enemies it already hit. Brutal on big targets. |
|  | **Umbilical Cord** | The first two enemies in each chain get tied together with lightning and slammed into each other. |
| Lv 8 | **Punching Up** | +100% damage to elites, bosses and rival champions. |
|  | **Plus One** | +1 projectile. |
|  | **Special Delivery** | Hits explode for 35% damage around the target. |
| Lv 10 mastery | **Overcharge** | Every jump hits 20% harder than the last, instead of weaker. |
|  | **Power Grid** | 15% of hits from all your other weapons set off a Static Cling chain. |

### Morning Sickness

*Toxic lob, Area Denial.* Lobs acid globs that leave toxic puddles. Worse before noon.

- **Base stats:** dmg 10, cd 0.9s, mag 4, reload 1.8s, range 390 (area 58, dur 3, flight 0.6)
- **Level bonuses:** Lv3: +50% duration; Lv6: +1 count; Lv9: +40% area
- **Pairings:** **Nappy Trail** (+ Slipstream Scalpel), **Petri Dish** (+ Tapeworm Seeder)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Nausea** | Enemies in a puddle are slowed by 45% and deal 40% less damage. |
|  | **Toxic Spread** | Enemies that die in a puddle leave a new puddle behind. |
| Lv 8 | **Twins!** | +2 projectiles. |
|  | **Giant Killer** | +150% damage to elites, bosses and rival champions. |
|  | **Carpet Shock** | 30% of hits arc to a nearby enemy for 50% damage. |
| Lv 10 mastery | **Swamp** | Puddles last four times as long and slowly spread. |
|  | **Acid Reflux** | When you get hit, you throw up eight puddles in a ring around you. |

### Tapeworm Seeder

*Toxic gun, Necromancer.* Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green.

- **Base stats:** dmg 12, cd 0.4s, mag 8, reload 1.6s, range 430 (dur 8)
- **Level bonuses:** Lv3: +1 count; Lv6: +50% duration; Lv9: +40% dmg
- **Pairings:** **Family Tree** (+ Seeker Siblings), **Petri Dish** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
| Lv 5 signature | **Walking Dead** | Infected corpses get back up as zombie allies for 12s instead of turrets (up to 14 at once). |
|  | **Big Worm** | Turrets last twice as long, fire 50% faster and hit twice as hard. |
| Lv 8 | **Twins!** | +2 projectiles. |
|  | **Special Delivery** | Hits explode for 35% damage around the target. |
|  | **Ice Queen** | 12% of hits freeze non-boss enemies solid. |
| Lv 10 mastery | **Brood** | The infection spreads: every infected death infects the three nearest enemies. |
|  | **Body Snatcher** | Elites killed while infected become permanent allies (three at most). |

### Seeker Siblings

*Arcane gun, Swarm.* Tiny homing siblings who swim for you and never miss. Family is complicated.

- **Base stats:** dmg 9, cd 0.45s, mag 6, reload 2s, x2, range 500 (homing 5)
- **Level bonuses:** Lv3: +1 count; Lv6: +1 count; Lv9: +40% dmg
- **Pairings:** **Family Tree** (+ Tapeworm Seeder), **Sibling Yo-Yo** (+ Yo-Yo Diet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Big Brother** | One sibling in every volley is huge: four times the size and damage, and pierces 3. |
|  | **Sibling Rivalry** | Every kill adds a sibling to your volleys (up to +8). Reloading makes them all settle down again. |
| Lv 8 | **Kick Them While Down** | +60% damage to enemies under 35% health. |
|  | **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
|  | **Domino Effect** | Kills explode for 60% of the killing blow. |
| Lv 10 mastery | **Population Boom** | Every sibling splits into two more homing siblings on its first hit. |
|  | **Family Reunion** | Siblings that miss swim back to circle you, eating bullets, then launch again. |

### Toddler Gravity

*Arcane gun, Crowd Control.* A slow orb that drags everything into its mouth. Everything.

- **Base stats:** dmg 8, cd 1.8s, mag 2, reload 2.5s, pierce all, range 400 (aura 72, pull 95)
- **Level bonuses:** Lv3: +30% area; Lv6: +1 count; Lv9: +50% dmg
- **Pairings:** **Tetherball** (+ Yo-Yo Diet), **Sucker Punch** (+ Hiccup Scattergun), **Snow Globe** (+ Cold Feet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Event Horizon** | Non-boss enemies under 20% health that get dragged into the centre are swallowed whole. |
|  | **Nom Nom** | The orb eats enemy bullets, growing with every one (up to twice its size). |
| Lv 8 | **Twins!** | +2 projectiles. |
|  | **Toxic Relationship** | Hits add a stacking poison. |
|  | **Punching Up** | +100% damage to elites, bosses and rival champions. |
| Lv 10 mastery | **Big Bang** | When an orb ends it explodes for half of all the damage it dealt. |
|  | **Tantrum Parking** | The orb parks wherever it catches 4 enemies, pulls 2.5 times harder and lasts twice as long. |

### Premature Evangelation

*Arcane orbit, Bodyguard.* These guardian angels get started way too soon.

- **Base stats:** dmg 23, reload 2.2s, x3, range 100 (dur 4.5, radius 72, spin 3.6)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +1 count
- **Pairings:** **Overprotective** (+ Placental Siphon), **Family BBQ** (+ Heartburn)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Protective Nan** | The angels eat any enemy bullet they touch. |
|  | **Clingy** | The angels never take a break, but hit 25% softer. |
| Lv 8 | **Twins!** | +2 projectiles. |
|  | **Toxic Relationship** | Hits add a stacking poison. |
|  | **Kick Them While Down** | +60% damage to enemies under 35% health. |
| Lv 10 mastery | **Extended Family** | A second ring of angels spins the other way at double the distance. |
|  | **Guilt Trip** | Enemies they hit feel guilty for 4s: slowed by 40% and taking +35% damage from everything. |

### Placental Siphon

*Arcane siphon, Counter.* Eats enemy bullets that come near you and spits them back. No reloads. No ammo either, until the screen is full of bullets.

- **Base stats:** dmg 18, cd 0.08s, mag 40, range 460 (area 90)
- **Level bonuses:** Lv3: +1 count; Lv6: +1 pierce; Lv9: +40% dmg
- **Pairings:** **Overprotective** (+ Premature Evangelation), **Static Discharge** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Hot Load** | +40% damage. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Return to Sender** | Returned shots home in on whoever fired them, and hit them three times as hard. |
|  | **Bullet Buffet** | +40% absorb radius, and every bullet eaten heals you a little. |
| Lv 8 | **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
|  | **Giant Killer** | +150% damage to elites, bosses and rival champions. |
|  | **Toxic Relationship** | Hits add a stacking poison. |
| Lv 10 mastery | **Mirror Womb** | 30% of enemy bullets that reach you bounce back at whoever fired them. |
|  | **Overflow** | When the store fills up, it all bursts out in a ring of returned bullets. |

## Pairings (secret combos)

Own both weapons at Lv 5+ and the pairing switches on. In the game they stay hidden (???) until you find them once.

| Pairing | Weapons | Effect |
|---|---|---|
| **Baby Monitor Network** | Static Cling + Nappy Mines | Lightning jumping through a crowd sets off any Nappy Mine near its path. |
| **Hot Flush, Cold Sweat** | Heartburn + Cold Feet | Thermal Shock and Steam Burst reactions have no cooldown and hit twice as hard. |
| **Tetherball** | Yo-Yo Diet + Toddler Gravity | Yo-yos drag enemies back towards you on every throw. |
| **Family Tree** | Seeker Siblings + Tapeworm Seeder | Tapeworm turrets fire homing Seeker Siblings. |
| **Overprotective** | Placental Siphon + Premature Evangelation | The angels catch enemy bullets and feed them into the Siphon. |
| **Nappy Trail** | Slipstream Scalpel + Morning Sickness | Your scalpel trail oozes poison that stacks. |
| **Conductive Spit** | Spitball + Static Cling | Spat-on enemies are wet: lightning deals double damage to them. |
| **Sucker Punch** | Hiccup Scattergun + Toddler Gravity | Enemies caught in a gravity orb take double damage from the Scattergun. |
| **Snow Globe** | Cold Feet + Toddler Gravity | Gravity orbs chill everything they hold and freeze it solid. |
| **Family BBQ** | Premature Evangelation + Heartburn | The angels are on fire. Everything they touch catches. |
| **Sibling Yo-Yo** | Seeker Siblings + Yo-Yo Diet | Every yo-yo hit launches a Seeker Sibling. |
| **Petri Dish** | Tapeworm Seeder + Morning Sickness | Anything that dies in a puddle was infected all along. |
| **Static Discharge** | Static Cling + Placental Siphon | Every 12 bullets the Siphon eats fires a Static Cling chain at four enemies. |
| **Trail Mix** | Slipstream Scalpel + Nappy Mines | Your scalpel trail drops a Nappy Mine every 1.5s. |

## Bosses and relics

A boss arrives every 3 minutes. Each run draws 4 of these 8 at random; after all 4, they come round again, tougher. Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.

### THE MACROPHAGE QUEEN: Eater of Hopefuls

> "Oh good. Dessert swam in."

A white blood cell who ate her way to the top. She summons swarms, then swallows them to heal. Base HP 2600, armour 2, speed 46.

- **Strengths:** Devours her own minions to heal; Summons swarms of swimmers.
- **Weaknesses:** Fire: +60% damage; Slow: kite her and clear the snacks.

| Relic | Effect |
|---|---|
| **Second Stomach** | +60% max HP, and every kill heals 1 HP. Eat everything. |
| **Swallow Whole** | Touching a small, ordinary enemy swallows it whole instead of hurting you, and heals you 3 HP. |
| **The Queen's Court** | Three loyal macrophage guards follow you and fight for you. A fallen guard returns 15s later. |

### THE ANTIBODY COLOSSUS: Head of Border Control

> "Papers. Now. No, those are not papers. Those are bullets."

A Y-shaped wall of protein. Heavily armoured, cannot be moved or frozen, and charges in straight lines. Base HP 3800, armour 12, speed 36.

- **Strengths:** 12 armour: small hits barely scratch it; Cannot be knocked back or frozen.
- **Weaknesses:** Shock: +60% damage; Armour shred sticks for longer; Charges are telegraphed: side-step.

| Relic | Effect |
|---|---|
| **Border Wall** | +10 armour and +40% max HP, but you swim 10% slower. |
| **Bouncer** | Enemies that touch you are hurled away and take ten times their own contact damage. You take 40% less from them. |
| **Diplomatic Immunity** | Every 5s, a shield blocks the next hit completely. |

### THE IMMUNE EYE: Unblinking Critic of Your Genome

> "I've read your genome. I've seen better genomes on a crouton."

It teleports next to you, then glares: a beam that follows you around. While it glares, it cannot blink. Base HP 3400, armour 4, speed 52.

- **Strengths:** Teleports right next to you; Death-stare beam that tracks you.
- **Weaknesses:** Takes double damage while glaring; Arcane: +50% damage.

| Relic | Effect |
|---|---|
| **Third Eye** | +25% crit chance and crits deal +100% more damage. |
| **Death Stare** | Every 4s you glare at the toughest enemy on screen with a beam of your own for 1.5s. |
| **Precognition** | +25% dodge. Every dodge sends out a pulse that wipes nearby enemy bullets. |

### THE MATRON: Head of Ward Nine

> "Visiting hours are over. Forever."

Runs the ward with an iron bedpan. Heals every enemy on screen and hides behind a ring of nurses. Base HP 3000, armour 3, speed 40.

- **Strengths:** Heals every enemy nearby on her rounds; Nurse cells orbit her and soak your shots.
- **Weaknesses:** Poison: +60%, and halves her healing; Kill her nurses: she panics and takes +50%.

| Relic | Effect |
|---|---|
| **Bedside Manner** | Regenerate 1.5% of your max HP every second. |
| **Triage** | Dropping below 25% HP heals you to 70% and makes you untouchable for 2s. Once every 45s. |
| **Transfusion** | Every hit you land heals you a little, and your lifesteal limit is three times higher. |

### THE PEPSINATOR: Acid Reflux Incarnate

> "Everything dissolves eventually. You're just early."

A blob of stomach acid with ambitions. Rains acid puddles and splits off smaller blobs when hurt. Base HP 3600, armour 0, speed 44.

- **Strengths:** Acid puddles burn you; Splits off blobs at 60% and 30% health.
- **Weaknesses:** Frost: +60% damage; Blasts and pools: +40% damage.

| Relic | Effect |
|---|---|
| **Corrosive** | Every hit shreds armour and adds a stack of poison. |
| **Acid Blood** | When you are hit, you splash acid around you for ten times the damage you took. |
| **Ulcer** | Enemies you kill leave acid puddles that dissolve their friends. |

### CHAD PRIME: Tail Day, Every Day

> "Bro. Bro. You swim like a sneeze."

The biggest swimmer anyone has ever seen. Dashes through you three times, then has to catch his breath. Base HP 3000, armour 5, speed 95.

- **Strengths:** Lightning-fast triple dash; Flexes: dodges 30% of your shots.
- **Weaknesses:** Winded after every dash: stunned, double damage; Blasts, beams and pools never miss him.

| Relic | Effect |
|---|---|
| **Protein Shake Pro** | +35% swim speed, and every weapon hits up to 50% harder while you swim fast. |
| **Tail Whip** | Your tail becomes a weapon: it lashes everything behind you twice a second. |
| **Sprint Start** | Every 5s you surge forward, untouchable for a moment, leaving a shockwave behind you. |

### THE FEVER: Pyrogen Prime, 41 Degrees

> "Is it hot in here, or is it me? It's me. It's always me."

A walking temperature spike. Rings of fire, burning ground, and it runs hotter and faster as it dies. Base HP 3200, armour 2, speed 48.

- **Strengths:** Immune to fire; Rages below 35% health: twice as fast.
- **Weaknesses:** Frost: double damage; Freezing it snuffs out its current attack.

| Relic | Effect |
|---|---|
| **Running Hot** | Every weapon you own sets enemies on fire. |
| **Fever Dream** | Every burning enemy near you makes all your weapons fire 3% faster (up to +60%). |
| **Heatstroke** | Burning enemies explode when they die, spreading the fire. |

### MITCH & OSIS: The Mitosis Twins

> "We finish each other's... ...swimmers."

Identical twins who fight as one. Kill one and the other rebuilds it in 8 seconds, unless you finish both. Base HP 1900 each, armour 2, speed 58.

- **Strengths:** Revive each other; Crossfire from two sides.
- **Weaknesses:** Finish both within 8 seconds; Blasts hit both when they huddle: +30%.

| Relic | Effect |
|---|---|
| **Mirror Twin** | Every shot-firing weapon also fires a twin shot backwards at 50% damage. |
| **Double Trouble** | +1 projectile, +1 pierce and +1 chain jump for every weapon. |
| **Twin Pick** | From now on, every DNA strand lets you take two cards instead of one. |

## Spells

Spells autocast on cooldown and use spell slots. They level up like weapons but have no branch tree.

| Spell | Element | What it does | Base stats | Level bonuses |
|---|---|---|---|---|
| **Stork Drop** | Fire | A stork drops something heavy on the target and leaves burning ground. Not a baby. | dmg 65, cd 5s, count 1, area 88, delay 0.7s, dur 2s | Lv3: +1 count; Lv5: +30% area; Lv7: +1 count |
| **Cold Shower** | Frost | A freezing blast around you. Erases enemy bullets, and enthusiasm. | dmg 22, cd 7s, area 165 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 25% faster |
| **Brainstorm** | Shock | Lightning strikes several targets at once. None of the ideas are good. | dmg 36, cd 6s, count 5, area 48 | Lv3: +2 count; Lv5: +40% dmg; Lv7: +3 count |
| **Sofa Crevice** | Arcane | Tears open a singularity that drags and crushes. Everything you ever lost is in there. | dmg 16, cd 10s, area 125, dur 3s, pull 210 | Lv3: +30% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Kiss It Better** | Toxic | Restores a portion of your health. Medically dubious. Works anyway. | heals 15% HP, cd 14s | Lv3: 15% faster; Lv5: +50% dmg; Lv7: 20% faster |
| **Nap Time** | Arcane | Slows every enemy and bullet to a crawl. Rare. Precious. Over too soon. | cd 16s, dur 3s | Lv3: +30% duration; Lv5: 20% faster; Lv7: +40% duration |
| **Latex Barrier** | Arcane | A shield that reflects enemy bullets and blocks contact. 98% effective. | dmg 12, cd 12s, dur 3s, area 80 | Lv3: +35% duration; Lv5: +30% area; Lv7: 25% faster |
| **Running With Scissors** | Kinetic | Explodes a ring of blades outward. You were told. | dmg 19, cd 6s, count 16, speed 460, pierce 3, size 6 | Lv3: +8 count; Lv5: +3 pierce; Lv7: +50% dmg |
| **Dutch Oven** | Toxic | A drifting cloud of stacking poison. You know what you did. | dmg 11, cd 9s, area 115, dur 5s | Lv3: +40% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Baby Monitor** | Shock | Deploys a turret that watches and shoots using this directive. Static included. | dmg 9, cd 13s, count 1, dur 10s, rate 0.25 | Lv3: +30% duration; Lv5: +1 count; Lv7: +50% dmg |

## Power-ups (passives)

Stat boosts that stack. Value shown is per pick at Bronze rarity.

| Power-up | Per pick | Max stacks |
|---|---|---|
| **Protein Shake** | +12% damage | 8 |
| **Twitchy Tail** | +10% fire rate | 8 |
| **Short Refractory Period** | +15% reload speed | 6 |
| **Bigger Load** | +20% magazine size | 6 |
| **Split Personality** | +1 projectile for all weapons (Silver or better only) | 3 |
| **Early Arrival** | +12% projectile speed and range | 5 |
| **Personal Space** | +12% area of effect | 6 |
| **Stamina** | +15% effect duration | 5 |
| **Pushy** | +1 pierce | 4 |
| **Sharp Elbows** | +5% crit chance | 6 |
| **Low Blow** | +25% crit damage | 6 |
| **Thick Skin** | +15 max HP (and heal it) | 8 |
| **Pregnancy Vitamins** | +0.3 HP/sec regen | 5 |
| **Sticky Cilia** | +22% traction: sharper turns, less drift | 5 |
| **Hydrodynamic Head** | +12% traction and +6% swim speed | 3 |
| **Leg Day (Tail Day)** | +8% move speed | 5 |
| **Clingy** | +30% pickup range | 5 |
| **Shell Suit** | +1 armour (flat damage reduction) | 6 |
| **Lucky Swimmer** | +15% luck (rarer loot, more drops) | 5 |
| **Leech Mode** | Heal 0.08 HP per kill | 5 |
| **Hot-Blooded** | +25% fire damage and burn | 5 |
| **Cold-Blooded** | +25% frost damage and chill | 5 |
| **Static Hair** | +25% shock damage, +1 chain | 5 |
| **Bad Breath** | +25% poison damage, +3 max stacks | 5 |
| **Weird Aura** | +25% arcane damage | 5 |
| **Headbutt Training** | +25% kinetic damage | 5 |
| **Chemistry** | +35% elemental reaction damage | 5 |
| **Repeat Prescription** | -10% spell cooldowns | 5 |
| **Antenatal Classes** | +12% experience gained | 5 |
| **Snooze Button** | +1 max Rewind charge, +25% Chrono energy (Silver or better only) | 3 |
| **Hand-Me-Downs** | +25% scrap from kills | 5 |
| **Last Word** | Last bullet of every magazine deals x4 damage and explodes | 3 |
| **Tactical Nap** | Starting a reload sends out a shockwave that deletes nearby bullets (+40 radius) | 4 |
| **Tunnel Vision** | +3% damage per second on the same target, up to +30% more | 3 |
| **Overachiever** | 50% of excess kill damage jumps to the next enemy | 3 |
| **Pincer Movement** | Weapons sharing a target: +25% damage. All three on different targets: +25% fire rate | 3 |
| **Hurry Up** | Up to +22% damage the faster you are moving | 4 |
| **Egg Bond** | Near the egg: +30% fire rate. Away from it: +30% crit chance | 3 |
| **Spoilers** | 10% of shots appear already next to their target | 4 |
| **Inheritance** | Paradox Echoes also cast your spells and last twice as long (Silver or better only) | 1 |
| **Wriggle Room** | +4% chance to dodge hits | 5 |

## Upgrades any weapon can take

Offered at weapon levels 3 and 8. Which three a weapon is offered is fixed per weapon (see its table above).

### Lv 3 pool

| Upgrade | Effect |
|---|---|
| **Hot Load** | +40% damage. |
| **Hair Trigger** | 25% faster cooldown and reload. |
| **Nappy Bag** | +60% magazine size. |
| **Wide Hips** | +35% area and +15% range. |
| **Pointy Head** | Shots pierce 2 more enemies. |
| **Trampoline Rounds** | Shots bounce to 2 more targets. |
| **Sharp Tongue** | +15% crit chance. |
| **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |

### Lv 8 pool

| Upgrade | Effect |
|---|---|
| **Homing Instinct** | Shots home in on targets. |
| **Cell Division** | Shots burst into 3 shards on first hit. |
| **Carpet Shock** | 30% of hits arc to a nearby enemy for 50% damage. |
| **Kick Them While Down** | +60% damage to enemies under 35% health. |
| **Toxic Relationship** | Hits add a stacking poison. |
| **Ice Queen** | 12% of hits freeze non-boss enemies solid. |
| **Special Delivery** | Hits explode for 35% damage around the target. |
| **Plus One** | +1 projectile. |
| **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
| **Punching Up** | +100% damage to elites, bosses and rival champions. |
| **Sugar Rush** | +75% damage. |
| **Due Date Panic** | 40% faster cooldown and reload. |
| **Domino Effect** | Kills explode for 60% of the killing blow. |
| **Giant Killer** | +150% damage to elites, bosses and rival champions. |
| **Twins!** | +2 projectiles. |
| **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |

## Modifiers

Slot into one weapon (3 per weapon). Power by rarity: Bronze x1, Silver x1.25, Gold x1.6, Legendary x2.2. Values below are at Bronze. "Projectile only" means guns and other shot-firing weapons.

| Modifier | Effect (Bronze) | Effect (Legendary) | Fits |
|---|---|---|---|
| **Seeking** | Shots hunt down targets (turn rate 5.0) | Shots hunt down targets (turn rate 7.4) | Projectile only |
| **Splitting** | On first hit, shots split into 3 shards at 45% damage | On first hit, shots split into 4 shards at 45% damage | Projectile only |
| **Orbiting** | Shots circle you for 1.2s, eating enemy bullets, then launch | Shots circle you for 2.6s, eating enemy bullets, then launch | Projectile only |
| **Growing** | Shots swell in flight: triple size and up to +100% damage | Shots swell in flight: triple size and up to +220% damage | Projectile only |
| **Boomerang** | Shots fly out and come back, hitting everything twice | Shots fly out and come back, hitting everything twice | Projectile only |
| **Ricochet** | +2 bounces between enemies | +3 bounces between enemies | Projectile only |
| **Freezing** | 18% chance per hit to freeze the target solid | 40% chance per hit to freeze the target solid | Any weapon |
| **Exploding** | Hits explode for 30% damage in a small blast | Hits explode for 66% damage in a small blast | Any weapon |
| **Mind Control** | 5% chance per hit to make a monster fight for you for 6s (max 6 allies) | 11% chance per hit to make a monster fight for you for 13s (max 6 allies) | Any weapon |
| **Element Swap** | Converts this weapon to a new element | Converts this weapon to a new element | Any weapon |
| **Shrapnel** | Kills burst into 3 shards at 40% damage | Kills burst into 3 shards at 40% damage | Any weapon |
| **Chaining** | 25% of hits chain to another enemy for 50% damage | 55% of hits chain to another enemy for 50% damage | Any weapon |
| **Pulsing** | Shots pulse every 0.6s, hitting everything close by for 15% damage | Shots pulse every 0.6s, hitting everything close by for 33% damage | Projectile only |
| **Magnetic** | Shots drag monsters within 70 units into their path | Shots drag monsters within 154 units into their path | Projectile only |
| **Delayed** | Shots hang for a moment, then launch 60% faster for +30% damage | Shots hang for a moment, then launch 60% faster for +66% damage | Projectile only |
| **Mirror** | Every shot has a twin fired the opposite way at 50% damage | Every shot has a twin fired the opposite way at 110% damage | Projectile only |

## Duo combos

| Combo | Modifiers | Bonus |
|---|---|---|
| **Cluster Hunter** | Seeking + Splitting | Split shards home in too. |
| **Cryoblast** | Freezing + Exploding | Explosions freeze whatever they hit. |
| **Halo** | Orbiting + Pulsing | Pulses come twice as often and hit twice as hard. |
| **Snowball** | Boomerang + Growing | Shots grow twice as much on the way out and back. |
| **Pinball Wizard** | Ricochet + Chaining | Chains jump to 3 targets. |
| **Pied Piper** | Mind Control + Magnetic | Mind-controlled allies last twice as long. |
| **Kaleidoscope** | Mirror + Splitting | Mirrored twins split into twice as many shards. |
| **Time Bomb** | Delayed + Exploding | Delayed shots explode as they launch. |

## Stains

The slide starts in greyscale. Each stain brings back one kind of colour so you can read the fight better. GFP is guaranteed early.

| Stain | What it colours |
|---|---|
| **GFP Tag** | Green Fluorescent Protein. Tags you: your swimmer, your shots, echoes and allies glow green. Much easier to find yourself in a crowd. |
| **Anti-Immune Stain** | Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings. |
| **Luciferase** | The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas. |
| **Motility Dye** | Fast swimmers (sprinters, spermlets, krill, paramecia) light up cyan, so you can see what is about to reach you. |
| **Rival Dyes** | Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board. |
| **H&E Stain Kit** | Haematoxylin and eosin, the classic. Stains the rest of the slide: power-up pickups and their effects, and your midpiece in your weapon-type colour. |

## Cursed cards

| Curse | Boon | Bane |
|---|---|---|
| **Glass Cannon Deluxe** | x1.8 damage for everything | Max HP halved |
| **Speedrunner's Regret** | +50% fire rate | Enemy bullets 20% faster |
| **Hoarder's Bargain** | Double scrap, double viewers | Pickup range halved |
| **Crowd Pleaser** | +50% XP and viewers | 30% more enemies |
| **Paradox Addict** | +2 max Rewind charges, all refilled now | All healing halved |
| **Clothing Optional** | +25% move speed, +20% dodge | Armour is zero. Forever. |

## Field pickups

| Pickup | Letter | Effect |
|---|---|---|
| **MAGNET** | M | All XP flies to you |
| **ACID FLUSH** | N | Obliterates nearby enemies |
| **ADRENALINE** | O | Double fire rate, no reloads |
| **GLUCOSE HIT** | + | Restore 35% HP |
| **SHIELD** | S | Invulnerable for 5s |
| **STASIS** | F | Freeze all enemies |
| **DNA STRAND** | ? | Free upgrade |

## Elemental reactions

| Reaction | Trigger and effect |
|---|---|
| **THERMAL SHOCK** | Fire on a chilled/frozen enemy: big burst damage |
| **STEAM BURST** | Frost on a burning enemy: scalding area blast |
| **COMBUSTION** | Fire on a poisoned enemy: poison stacks explode |
| **TOXIC ARC** | Shock on a poisoned enemy: poison spreads to neighbours |
| **SUPERCONDUCT** | Shock on a chilled enemy: armour shredded |
| **RESONANCE** | Arcane on any status: bonus damage, mark spreads |
| **OVERLOAD** | Fire on a shocked enemy: lightning explosion |

## Element synergies

Own several weapons or spells of one element to unlock its set bonus.

| Element | Bonus name | Effect |
|---|---|---|
| Kinetic | **Gunslinger** | +15% fire rate for kinetic weapons |
| Fire | **Pyromaniac** | Burns last longer and deal +50% damage |
| Frost | **Permafrost** | Freeze threshold halved, frozen take +25% |
| Shock | **Conductor** | Shocked enemies arc twice as often |
| Toxic | **Plaguebringer** | Poison ticks twice as fast |
| Arcane | **Arcanist** | Marks amplify damage by +50% instead of +30% |

## Targeting directives

| Directive | Aims at |
|---|---|
| **NEAREST** | Whatever is closest. Safe, boring, effective. |
| **STRONGEST** | Biggest max health first. Tank busting. |
| **WEAKEST** | Smallest max health first. Clears fodder. |
| **LOWEST HEALTH** | Finish off the wounded. Great for kills. |
| **HIGHEST HEALTH** | Whoever has the most health left right now. |
| **HIGHEST ARMOUR** | Most armour first. Pair with shred. |
| **FASTEST** | Chargers and skitters before they reach you. |
| **FURTHEST** | Snipe the back line. |
| **DENSEST CLUSTER** | The middle of the crowd. Best for splash. |
| **ELITES & BOSSES** | Bosses, then elites, then nearest. |
| **SHOOTERS FIRST** | Ranged enemies, healers and summoners first. |
| **RANDOM** | Chaos. The audience loves it. |
| **REVENGE** | Whatever hurt you last. Otherwise nearest. |

## Movement directives

| Directive | Behaviour |
|---|---|
| **KITE** | Keep distance from threats, dodge bullets |
| **COLLECT** | Hoover up XP and power-ups |
| **ORBIT** | Circle around the horde |
| **HUNT** | Close in on the primary target |
| **HOLD** | Stand ground, only dodge bullets |
| **NEST** | Hover in the egg's warm glow, which slowly heals you |

## Gene Bank (permanent upgrades)

Every run earns DNA: 2 per level, 1 per 80 kills, 15 per boss, 12 per rival you beat, 1 per 30 seconds survived, plus 120 for a win.

### Bonuses

| Bonus | Effect | Max rank | Cost per rank |
|---|---|---|---|
| **Thicker Membrane** | +10 max HP per rank | 5 | 30 / 55 / 80 / 105 / 130 |
| **Potent Genome** | +4% damage per rank | 5 | 40 / 70 / 100 / 130 / 160 |
| **Fast Metaboliser** | +5% XP per rank | 5 | 35 / 60 / 85 / 110 / 135 |
| **Second Opinion** | +1 starting reroll per rank | 3 | 30 / 60 / 90 |
| **Pre-Sticky Cilia** | +10% traction per rank | 3 | 30 / 55 / 80 |
| **Chemotaxis** | +15% pickup range per rank | 3 | 25 / 45 / 65 |
| **Deja Vu** | Start with an extra Rewind charge | 1 | 150 |

### Starter weapons

| Weapon | DNA |
|---|---|
| Nappy Mines | 60 |
| Premature Evangelation | 60 |
| Toddler Gravity | 80 |
| Slipstream Scalpel | 80 |
| Tapeworm Seeder | 90 |
| Placental Siphon | 100 |

### GFP variants

| Colour | DNA |
|---|---|
| EGFP (standard) | Free |
| Emerald | 80 |
| Azami Green | 120 |
| Aqua GFP | 160 |

## Enemies

HP and damage are at the start; both scale up over the run. **From** is the earliest spawn time.

| Enemy | HP | Damage | Speed | Armour | XP | From | Behaviour |
|---|---|---|---|---|---|---|---|
| **Rival Swimmer** | 14 | 8 | 64 | 0 | 1 | 0:00 | Swims straight at you |
| **Sprinter** | 6 | 5 | 125 | 0 | 1 | 0:15 | Swims straight at you |
| **Antibody** | 20 | 6 | 58 | 0 | 3 | 0:35 | Keeps distance and shoots |
| **Krill** | 5 | 3 | 140 | 0 | 0.5 | 0:45 | Swarms in schools |
| **Macrophage** | 60 | 16 | 44 | 3 | 4 | 0:55 | Swims straight at you |
| **Amoeba** | 150 | 14 | 30 | 1 | 10 | 1:10 | Swallows you if it touches |
| **Paramecium** | 30 | 10 | 105 | 0 | 4 | 1:15 | Darts in bursts |
| **Mitotic Cell** | 42 | 10 | 52 | 0 | 3 | 1:25 | Swims straight at you |
| **Spermlet Swarm** | 4 | 4 | 145 | 0 | 0.5 | 1:35 | Swims straight at you |
| **Acid Bubble** | 16 | 18 | 98 | 0 | 2 | 1:40 | Rushes in and explodes |
| **Quantum Swimmer** | 22 | 9 | 72 | 0 | 3 | 1:45 | Teleports around |
| **Rotifer** | 40 | 8 | 50 | 1 | 5 | 1:50 | Steals XP and runs |
| **Nurse Cell** | 30 | 6 | 56 | 1 | 4 | 2:00 | Heals nearby enemies |
| **Headbutter** | 50 | 18 | 56 | 2 | 4 | 2:10 | Winds up, then charges |
| **Pinworm** | 70 | 12 | 60 | 1 | 5 | 2:20 | Swims straight at you |
| **Mucus Wall** | 95 | 14 | 40 | 8 | 6 | 2:30 | Damages anything close |
| **Volvox** | 110 | 14 | 34 | 2 | 8 | 2:40 | Swims straight at you |
| **Cytokine Caster** | 45 | 8 | 46 | 1 | 6 | 2:50 | Keeps distance and shoots |
| **Diatom** | 55 | 8 | 24 | 6 | 6 | 3:00 | Keeps distance and shoots |
| **Ghost Swimmer** | 35 | 10 | 82 | 0 | 5 | 3:15 | Phases in and out |
| **Mother Cell** | 75 | 10 | 40 | 2 | 8 | 3:30 | Spawns minions |
| **Enzyme Spire** | 85 | 10 | 16 | 4 | 8 | 4:00 | Sits still and shoots |
| **Plasmodium** | 380 | 22 | 22 | 3 | 24 | 4:00 | Swallows you if it touches |
| **Killer T-Cell** | 26 | 6 | 52 | 0 | 5 | 4:20 | Keeps distance and shoots |
| **Water Bear** | 240 | 20 | 30 | 10 | 14 | 4:30 | Swims straight at you |
| **Alpha Swimmer** | 420 | 30 | 34 | 12 | 20 | 5:00 | Swims straight at you |
| **Daughter Cell** | 12 | 5 | 92 | 0 | 1 | Spawned by others | Swims straight at you |
| **Daughter Colony** | 26 | 6 | 62 | 0 | 2 | Spawned by others | Swims straight at you |
| **Candida** | 18 | 5 | 22 | 0 | 1 | Spawned by others | Buds new yeast cells |
| **Pepsinator Jr** | 60 | 14 | 72 | 0 | 6 | Spawned by others | Swims straight at you |

## Rival champions

Named rivals race you to the egg. When the sperm count reaches 6, the strongest five survivors (rivals first, stand-ins after) become the Final Five. Beat them and the egg opens.

| Rival | Growth speed | Aggression | Bio |
|---|---|---|---|
| **Big Steve** | x1.1 | 0.6 | Has been doing laps since the Tuesday before last |
| **Chad Flagellum** | x1 | 0.9 | Tail day, every day |
| **Professor Wiggles** | x1.15 | 0.2 | Holds a doctorate in swimming, self-awarded |
| **Lil' Zygo** | x0.9 | 0.7 | Small, angry, surprisingly aerodynamic |
| **Kevin** | x0.95 | 0.4 | Just Kevin |

## Terrain

| Feature | Solid | Effect on shots | Notes |
|---|---|---|---|
| **Cartilage Nodule** | Yes | bounce | - |
| **Mitochondrion** | Yes | absorb | absorbs 45 shots then bursts (radius 230) |
| **Acid Crypt** | Yes | melt | 10 damage/s on contact |
| **Cilia Bed** | No | repel | pushes 260 |
| **Tubal Current** | No | drift | pushes 150 |
| **Lubricant Slick** | No | none | traction x0.3 |

Also on the slide: the **Morning-After Pill** (a dissolving cloud that grows to about half the map, then fades), **yeast infections** (colonies that bud more yeast) and the ambient crowd of harmless swimmers outside the arena.

## Sperm samples

| Sample | Name | Status | Description |
|---|---|---|---|
| 001 | **Standard Issue** | Playable | One healthy donor, four hundred million hopefuls, one egg. The classic. |
| 002 | **Frozen Donor Bank** | Coming soon | Thawed in a hurry. Everyone is sluggish, except the ones who are not. |
| 003 | **The Morning After** | Coming soon | The pill is already dissolving. Good luck. |
| 004 | **Vasectomy Reversal** | Coming soon | Low count, high stakes, very confused surgeon. |
