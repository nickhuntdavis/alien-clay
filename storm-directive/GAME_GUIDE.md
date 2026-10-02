# Spawn Prawn: complete game guide

Every weapon, spell, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Weapons](#weapons)
3. [Pairings (secret combos)](#pairings-secret-combos)
4. [Bosses and relics](#bosses-and-relics)
5. [Run events](#run-events)
6. [Spells](#spells)
7. [Power-ups (passives)](#power-ups-passives)
8. [Upgrades any weapon can take](#upgrades-any-weapon-can-take)
9. [Modifiers](#modifiers)
10. [Duo combos](#duo-combos)
11. [Stains](#stains)
12. [Cursed cards](#cursed-cards)
13. [Field pickups](#field-pickups)
14. [Elemental reactions](#elemental-reactions)
15. [Element synergies](#element-synergies)
16. [Targeting directives](#targeting-directives)
17. [Movement directives](#movement-directives)
18. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
19. [Enemies](#enemies)
20. [Rival champions](#rival-champions)
21. [Terrain](#terrain)
22. [Sperm samples](#sperm-samples)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, spells, power-ups, modifiers, stains and (rarely) curses.
2. **Weapons** level up to Lv10. Each weapon has its own upgrade path:
   - **Lv 3:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it). **Lv 5 and Lv 8:** pick one of two signature upgrades only that weapon has. **Lv 10 (mastery):** only one weapon a run can reach it; the others stop at Lv 9.
3. **Pairings:** own two specific weapons, both at Lv5+, and they start working together. They are secret until you find them.
4. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
5. **Weapon drafts:** your first weapon at level 1, then a new weapon mount at Lv 8, 22 (3 in total). Ordinary DNA strands never offer new weapons.
6. **Bosses:** a boss every 2 minutes. Each run meets 4 of the 8, in a random order. Beat one and choose one of its three relics.
7. **Rarity** multiplies a card's value:

| Rarity | Multiplier | Weapon levels granted | Drop weight |
|---|---|---|---|
| Common | x1 | +1 | 56% |
| Uncommon | x1.25 | +1 | 26% |
| Rare | x1.5 | +1 | 12% |
| Epic | x2 | +2 | 5% |
| Legendary | x2.5 | +2 | 1.6% |
| Mythical | x3 | +3 | 0% |
| Celestial | x4 | +3 | 0% |

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Weapons

25 weapons, each with its own play style. **Start** = can appear in your first box. **Bank** = add it to the first box from the Gene Bank (DNA cost shown). 

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
| [Placenta Paddle](#placenta-paddle) (Start) | Kinetic | Cleaver | NEAREST |
| [Flagellum Flail](#flagellum-flail) (Start) | Kinetic | Lasher | NEAREST |
| [Thorny Onesie](#thorny-onesie) (Start) | Kinetic | Tank | NEAREST |
| [Colouring In](#colouring-in) (Bank 90) | Kinetic | Lasso | NEAREST |
| [Due Date](#due-date) (Bank 100) | Arcane | Delayed Doom | HIGHEST HEALTH |
| [Red Tape](#red-tape) (Bank 90) | Toxic | Bureaucrat | DENSEST CLUSTER |
| [Imaginary Friend](#imaginary-friend) (Bank 120) | Arcane | Echo | NEAREST |
| [Peekaboo](#peekaboo) (Bank 100) | Frost | Trickster | NEAREST |
| [Twin Telepathy](#twin-telepathy) (Bank 110) | Shock | Geometry | DENSEST CLUSTER |
| [Bubble Wand](#bubble-wand) (Bank 90) | Kinetic | Trap & Throw | NEAREST |
| [Tooth Fairy](#tooth-fairy) (Bank 100) | Arcane | Lure | DENSEST CLUSTER |

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
| Lv 8 signature | **Sniper's Nest** | +60% range, and shots hit twice as hard on anything more than 250 away. |
|  | **Phlegm Fan** | Every reload sprays a ring of 12 spitballs all around you. |
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
| Lv 8 signature | **Buckshot** | +4 pellets per blast, each at 75% damage. A wall of lead. |
|  | **Recoil Jump** | Every blast kicks you backwards, away from the target, and you cannot be hurt mid-kick. Hit and run. |
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
| Lv 8 signature | **Yo-Yo Shield** | Yo-yos eat every enemy bullet they pass through. |
|  | **Cat's Cradle** | A string runs from you to every yo-yo in flight, cutting whatever crosses it. |
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
| Lv 8 signature | **Bloodletting** | Anything the trail cuts bleeds for 60% of the cut again over 3s. |
|  | **Slipstream** | Swimming through your own trail: +35% swim speed and 25% less damage taken. |
| Lv 10 mastery | **Surgical Team** | Two ghost scalpels circle you, each cutting its own trail. |
|  | **Afterburner** | The trail catches fire, and the faster you swim the hotter it burns (up to x2.5). |

### Heartburn

*Fire gun, Flamethrower.* A short-range cone of fire. Every lick burns. Antacids not included.

- **Base stats:** dmg 3.4, cd 0.05s, mag 50, reload 2.1s, x2, pierce all, range 200
- **Level bonuses:** Lv3: +30% area; Lv6: +30% dmg; Lv9: +1 count
- **Pairings:** **Hot Flush, Cold Sweat** (+ Cold Feet), **Holy Smoke** (+ Premature Evangelation)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Blue Flame** | Narrow and long: +70% range, a tight cone and +40% damage. |
|  | **Indigestion** | Burning enemies explode in flames when they die, spreading the burn to everything nearby. |
| Lv 8 signature | **Napalm** | Flames leave burning puddles where they land. |
|  | **Heatwave** | Burning enemies take +50% damage from everything you own. |
| Lv 10 mastery | **Dragon** | Twice the flames, sweeping a full circle around you, forever. |
|  | **Hell's Kitchen** | It never reloads, and the damage climbs the longer you keep firing (up to x3). Cools off when idle. |

### Nappy Mines

*Fire mine, Trapper.* Drops proximity mines in your wake. Nobody wants to change them.

- **Base stats:** dmg 34, cd 0.7s, mag 5, reload 2.4s, range 600 (explode 72, life 14)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +50% dmg
- **Pairings:** **Baby Monitor Network** (+ Static Cling), **Trail Mix** (+ Slipstream Scalpel), **Bait and Switch** (+ Tooth Fairy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Domino Nappies** | A blast sets off every mine near it, and each one in the chain goes off 25% bigger than the last. |
|  | **Sticky Nappies** | Mines are thrown onto enemies and stick to them, going off 1.2s later. |
| Lv 8 signature | **Claymore** | Every mine also fires a fan of 8 shrapnel shots at the nearest enemy when it goes off. |
|  | **Homing Nappies** | Mines crawl after the nearest enemy instead of waiting. |
| Lv 10 mastery | **Nuclear Nappy** | Every 6th mine is a nuke: three times the blast radius and six times the damage. |
|  | **Minefield** | Three mines per drop, twice as often, and they last twice as long. |

### Cold Feet

*Frost gun, Freezer.* Piercing ice shards that chill and freeze. Commitment issues, weaponised.

- **Base stats:** dmg 15, cd 0.6s, mag 5, reload 1.5s, pierce 3, range 460
- **Level bonuses:** Lv3: +1 count; Lv6: +2 pierce; Lv9: +1 count
- **Pairings:** **Hot Flush, Cold Sweat** (+ Heartburn), **Snow Globe** (+ Toddler Gravity), **Ice Hockey** (+ Placenta Paddle), **Cold Read** (+ Twin Telepathy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Shatter** | A shard that hits a frozen enemy shatters it for 250% damage in an icy burst. |
|  | **Icicle Lance** | +4 pierce, and each enemy a shard passes through makes it 25% stronger. |
| Lv 8 signature | **Brain Freeze** | Every 3rd shard that hits the same enemy freezes it solid (not bosses). |
|  | **Hailstorm** | Every 3rd volley also drops 6 hailstones on enemies around the target. |
| Lv 10 mastery | **Ice Age** | Shards leave frost patches behind that freeze anything that swims through. |
|  | **Cold Snap** | Every 4s a freezing blast around you freezes every non-boss enemy within reach. |

### Static Cling

*Shock chain, Chain Lightning.* Instant lightning that arcs between enemies, like a nylon onesie in winter.

- **Base stats:** dmg 13, cd 0.7s, mag 6, reload 1.8s, range 330 (chain 3, jump 140)
- **Level bonuses:** Lv3: +2 chain; Lv6: +1 count; Lv9: +2 chain
- **Pairings:** **Baby Monitor Network** (+ Nappy Mines), **Conductive Spit** (+ Spitball), **Static Discharge** (+ Placental Siphon), **Live Wire** (+ Flagellum Flail), **Live Paperwork** (+ Red Tape)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Short Circuit** | +3 jumps, and the lightning can bounce back to enemies it already hit. Brutal on big targets. |
|  | **Umbilical Cord** | The first two enemies in each chain get tied together with lightning and slammed into each other. |
| Lv 8 signature | **Ball Lightning** | Every 4th bolt leaves a ball of lightning on its target that zaps everything near it for 3s. |
|  | **Grounded** | Every chain earths through you: heal a little for each enemy it hit (within the lifesteal limit, doubled). |
| Lv 10 mastery | **Overcharge** | Every jump hits 20% harder than the last, instead of weaker. |
|  | **Power Grid** | 15% of hits from all your other weapons set off a Static Cling chain. |

### Morning Sickness

*Toxic lob, Area Denial.* Lobs acid globs that leave toxic puddles. Worse before noon.

- **Base stats:** dmg 10, cd 0.9s, mag 4, reload 1.8s, range 390 (area 58, dur 3, flight 0.6)
- **Level bonuses:** Lv3: +50% duration; Lv6: +1 count; Lv9: +40% area
- **Pairings:** **Nappy Trail** (+ Slipstream Scalpel), **Petri Dish** (+ Tapeworm Seeder), **Nappy Rash** (+ Thorny Onesie), **Colouring Book** (+ Colouring In), **Toil and Trouble** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Nausea** | Enemies in a puddle are slowed by 45% and deal 40% less damage. |
|  | **Toxic Spread** | Enemies that die in a puddle leave a new puddle behind. |
| Lv 8 signature | **Corrosive** | Puddles strip armour: enemies standing in them lose their armour and take +25% damage from everything. |
|  | **Geyser** | When a puddle dries up it erupts for 300% damage. |
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
| Lv 8 signature | **Hive Mind** | Your turrets and zombies hit twice as hard and last 50% longer. |
|  | **Feeding Tube** | Every infected enemy that dies heals you 1% of your max HP. |
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
| Lv 8 signature | **Kamikaze Kids** | Siblings explode when they hit, for 70% damage in a small blast. |
|  | **Swarm Intelligence** | Every sibling in a volley picks a different target. Nobody gets left out. |
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
| Lv 8 signature | **Supermassive** | Orbs are 60% bigger and pull twice as hard, but drift half as fast. |
|  | **Crush Depth** | The longer an orb holds an enemy, the harder it squeezes: up to triple damage after 2s. |
| Lv 10 mastery | **Big Bang** | When an orb ends it explodes for half of all the damage it dealt. |
|  | **Tantrum Parking** | The orb parks wherever it catches 4 enemies, pulls 2.5 times harder and lasts twice as long. |

### Premature Evangelation

*Arcane orbit, Bodyguard.* These guardian angels get started way too soon.

- **Base stats:** dmg 23, reload 2.2s, x3, range 100 (dur 4.5, radius 72, spin 3.6)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +1 count
- **Pairings:** **Collection Plate** (+ Placental Siphon), **Holy Smoke** (+ Heartburn)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Guardian Angel** | The angels eat any enemy bullet they touch. |
|  | **Eternal Vigil** | The angels never take a break, but hit 25% softer. Amen. |
| Lv 8 signature | **Smite** | Every 2.5s each angel throws a holy bolt at an enemy within reach. |
|  | **Martyrdom** | When you get hit, the angels burst out for 300% damage around you (every 2s at most). |
| Lv 10 mastery | **Heavenly Host** | A second ring of angels spins the other way at double the distance. |
|  | **Holier Than Thou** | Enemies they hit are made to feel guilty for 4s: slowed by 40% and taking +35% damage from everything. |

### Placental Siphon

*Arcane siphon, Counter.* Eats enemy bullets that come near you and spits them back. No reloads. No ammo either, until the screen is full of bullets.

- **Base stats:** dmg 15, cd 0.08s, mag 40, range 460 (area 90)
- **Level bonuses:** Lv3: +25% area; Lv6: +1 pierce; Lv9: +40% dmg
- **Pairings:** **Collection Plate** (+ Premature Evangelation), **Static Discharge** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Hot Load** | +40% damage. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Return to Sender** | Returned shots home in on whoever fired them, and hit them three times as hard. |
|  | **Bullet Buffet** | +40% absorb radius, and every bullet eaten heals you a little. |
| Lv 8 signature | **Spread the Love** | Every returned shot splits into three, each at 45% damage. |
|  | **Savings Account** | Returned shots hit +2% harder for every bullet in the store (up to +80%). |
| Lv 10 mastery | **Mirror Womb** | 30% of enemy bullets that reach you bounce back at whoever fired them. |
|  | **Overflow** | When the store fills up, it all bursts out in a ring of returned bullets. |

### Placenta Paddle

*Kinetic melee, Cleaver.* A heavy, slightly floppy paddle. Nobody asks where it came from.

- **Base stats:** dmg 34, cd 0.8s, mag 4, reload 1.1s, range 92 (area 1, arc 2.4, knock 220)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +1 count
- **Pairings:** **One-Two** (+ Flagellum Flail), **Ice Hockey** (+ Cold Feet), **Bubble Hockey** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Full Circle** | Every swing goes all the way round you, at 85% damage. Nothing sneaks up behind you. |
|  | **Home Run** | Every 3rd swing knocks enemies three times as far, and anything they crash into takes the hit too. |
| Lv 8 signature | **Tantrum** | Every hit speeds up your swings by 5% for 3s (up to +60%). It builds. |
|  | **Ground Pound** | Every 4th swing slams the ground all around you at 1.6 times the reach and stuns what it hits. |
| Lv 10 mastery | **Afterbirth Wave** | Every swing sends a wave out to three times its reach for 60% damage. |
|  | **Smother** | Every hit stacks Smothered. The 3rd stack crushes them for 400% damage (150% on bosses). |

### Flagellum Flail

*Kinetic melee, Lasher.* Turns out the tail was a weapon all along.

- **Base stats:** dmg 19, cd 0.38s, mag 6, reload 1s, range 190 (area 1, width 15, knock 60)
- **Level bonuses:** Lv3: +25% dmg; Lv6: +1 count; Lv9: +25% area
- **Pairings:** **One-Two** (+ Placenta Paddle), **Live Wire** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Whip Crack** | The last third of the lash is the sweet spot: three times the damage, and it always crits. |
|  | **Get Over Here** | Lashes drag enemies towards you instead of pushing them away. Lovely with a Paddle or a Ram. |
| Lv 8 signature | **Barbed Tail** | Lashes make enemies bleed for 60% of the hit again over 3s. |
|  | **Snap Back** | Lashes yank you towards the far end of the lash, and you cannot be hurt mid-yank. Hit and run. |
| Lv 10 mastery | **Cat o' Nine Tails** | Every lash is five lashes in a wide fan, each at 60% damage. |
|  | **Spin Cycle** | Every 3rd lash spins a full circle of twelve lashes around you at 1.5 times the reach. |

### Thorny Onesie

*Kinetic melee, Tank.* A babygro with spikes on the outside. Huggable, technically.

- **Base stats:** dmg 18, cd 0.55s, mag 8, reload 0.9s, range 90 (area 90, knock 120)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +20% area
- **Pairings:** **Nappy Rash** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Wide Hips** | +35% area and +15% range. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Spiky Personality** | Whatever hurts you gets hurt back hard (thorns x2), plus a jab to everything around you. |
|  | **Bear Hug** | Pulses pull enemies in instead of pushing them out, and every enemy in reach gives you +1 armour (up to +6). |
| Lv 8 signature | **Porcupine** | Every pulse also shoots 8 spines outwards at 50% damage. |
|  | **Fortress** | When you slow down or stop: +4 armour and pulses come 50% faster. |
| Lv 10 mastery | **Bubble Wrap** | Every 6th pulse is huge: twice the radius, 2.5 times the damage, and it pops every enemy bullet it touches. |
|  | **Growth Spurt** | The pulse grows 10% wider for every 100 max HP you have, and heals you a little for each enemy it hits. |

### Colouring In

*Kinetic crayon, Lasso.* A fat wax crayon held in the tail. Stay inside the lines? Never.

- **Base stats:** dmg 44, cd 2.2s, mag 3, reload 1.2s, range 600 (dur 2.6)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +40% duration; Lv9: +50% dmg
- **Pairings:** **Colouring Book** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
| Lv 5 signature | **Scribble** | The crayon line itself hits four times as hard and slows what it touches. |
|  | **Stay Inside the Lines** | Anything you colour in is stuck where it is for 1.5s and takes +30% damage from everything. |
| Lv 8 signature | **Paint by Numbers** | The more enemies inside a shape, the harder it hits: +15% for each one (up to +150%). |
|  | **Fridge Art** | Every shape you colour in stays on the floor for 3s, hurting anything inside. |
| Lv 10 mastery | **Masterpiece** | Every 5th shape is framed: triple damage, and it wipes every enemy bullet inside it. |
|  | **Join the Dots** | Everything a shape hits becomes a dot for 2s. The dots are joined by lines that cut whatever crosses them. |

### Due Date

*Arcane duedate, Delayed Doom.* A little calendar stuck to an enemy, with the date circled in red. They will not enjoy it.

- **Base stats:** dmg 20, cd 0.9s, mag 3, reload 2s, range 480 (dur 4, repeat 0.4)
- **Level bonuses:** Lv3: +0.15 repeat; Lv6: +1 count; Lv9: +0.2 repeat
- **Pairings:** **Final Notice** (+ Red Tape)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
| Lv 5 signature | **Overdue** | The countdown is twice as long, and the repeat is twice as big. |
|  | **Early Delivery** | A marked enemy that drops below 30% health goes off straight away. |
| Lv 8 signature | **Baby Shower** | When a date goes off, half of it splashes onto everything nearby. |
|  | **Rebooked** | When a date goes off, the two nearest enemies get marked for free. |
| Lv 10 mastery | **Labour Day** | A date that goes off marks the same enemy again, straight away. Bosses never get a day off. |
|  | **The Big Day** | Marked enemies take +30% damage from everything you own. |

### Red Tape

*Toxic tape, Bureaucrat.* Forms in triplicate, stapled to the enemy. Paperwork is the deadliest poison.

- **Base stats:** dmg 18, cd 1.4s, mag 3, reload 2s, range 420 (chain 3, jump 170, dur 5, share 0.35)
- **Level bonuses:** Lv3: +1 chain; Lv6: +0.1 share; Lv9: +2 chain
- **Pairings:** **Final Notice** (+ Due Date), **Live Paperwork** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **In Triplicate** | Every bundle tapes 3 more enemies together. |
|  | **Joint Liability** | When a taped enemy dies, the rest of its bundle takes 30% of its max health. |
| Lv 8 signature | **Stapled** | Bundles are pulled together tight and slowed by 40%. |
|  | **Redacted** | Taped enemies cannot shoot. |
| Lv 10 mastery | **Bureaucracy** | Bundles share 70% of every hit instead of 35%. |
|  | **Referred Elsewhere** | When a bundle runs out, the four enemies nearest to it are taped up for free. |

### Imaginary Friend

*Arcane friend, Echo.* Its name is Gerald. Gerald is very real. Gerald has your weapons.

- **Base stats:** dmg 24, cd 0.7s, mag 6, reload 1.4s, range 230 (delay 2, copy 0.35)
- **Level bonuses:** Lv3: +0.1 copy; Lv6: +1 count; Lv9: +0.1 copy
- **Pairings:** **Hide and Seek** (+ Peekaboo)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Sharing Is Caring** | Your friend's copies hit 35% harder. |
|  | **It Was Them** | Your friend soaks up any enemy bullet it swims into. |
| Lv 8 signature | **Long Memory** | Your friend swims four seconds behind you instead of two, and hits 30% harder. |
|  | **Playdate** | Swimming into your friend heals you 4% of your max health (every 6s at most). |
| Lv 10 mastery | **Too Real** | Your friend is solid: it bowls through enemies, and its copies hit 35% harder. |
|  | **Secret Club** | One more friend, further behind. |

### Peekaboo

*Frost peek, Trickster.* Hands over the eyes. You are now invisible. Science agrees, if the science is three years old.

- **Base stats:** dmg 20, cd 5.5s, mag 1, reload 0.1s, range 420 (dur 1.8, area 230)
- **Level bonuses:** Lv3: +25% duration; Lv6: +25% area; Lv9: +50% dmg
- **Pairings:** **Hide and Seek** (+ Imaginary Friend)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
| Lv 5 signature | **Hide and Seek** | While hidden you swim 40% faster. |
|  | **Jump Scare** | BOO freezes enemies solid for 1.2s instead of scaring them off (not bosses). |
| Lv 8 signature | **Who's There?** | While you are hidden, enemy bullets hit other enemies three times as hard. |
|  | **Decoy Doll** | A doll stays where you vanished for 4s. Enemies keep attacking it, and it bursts for BOO damage at the end. |
| Lv 10 mastery | **Object Permanence** | You stay hidden twice as long. |
|  | **Big Boo** | BOO reaches everything on screen, and the scare lasts twice as long. |

### Twin Telepathy

*Shock twin, Geometry.* You always know what the other one is thinking. Mostly it is "zap".

- **Base stats:** dmg 24, cd 1.6s, mag 3, reload 2s, range 520 (area 90, width 10)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +1 count; Lv9: +30% area
- **Pairings:** **Cold Read** (+ Cold Feet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Wide Hips** | +35% area and +15% range. |
|  | **Hot Load** | +40% damage. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Mind Meld** | The beam is twice as wide and chills what it touches. |
|  | **Switcheroo** | Every 6s you swap places with your twin, cutting everything along the way. |
| Lv 8 signature | **Sympathetic Pain** | When you get hurt, your twin's end erupts for 300% damage (every 1.5s at most). |
|  | **Same Wavelength** | The beam wipes out any enemy bullet that crosses it. |
| Lv 10 mastery | **Quadruplets** | Two more twins, each with its own beam fanning out through the crowd. |
|  | **Psychic Link** | Every pulse also hits everything along the beam for 200% damage. |

### Bubble Wand

*Kinetic bubble, Trap & Throw.* A plastic wand and a pot of slightly toxic bubble mix. Hold your breath.

- **Base stats:** dmg 18, cd 1.1s, mag 4, reload 2s, range 380 (dur 5, hold 34)
- **Level bonuses:** Lv3: +1 count; Lv6: +40% dmg; Lv9: +1 count
- **Pairings:** **Bubble Hockey** (+ Placenta Paddle), **Toil and Trouble** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Extra Soapy** | Bubbles hold enemies twice the size, elites included. |
|  | **Bubble Bath** | Every popped bubble leaves a soapy patch for 3s that slows enemies by 40%. |
| Lv 8 signature | **Cannonball** | Flung enemies explode where they land. |
|  | **Chain Pop** | A flung enemy that hits another bubble pops it and flings that one too. |
| Lv 10 mastery | **Hamster Ball** | Trapped enemies roll after other enemies and bowl them over instead of coming to you. |
|  | **Bubble Boy** | Every 8s you are wrapped in a bubble that blocks the next 3 hits. |

### Tooth Fairy

*Arcane tooth, Lure.* She pays for teeth. She also collects debts.

- **Base stats:** dmg 34, cd 1.1s, mag 3, reload 2s, range 420 (dur 6, lure 230)
- **Level bonuses:** Lv3: +1 count; Lv6: +40% dmg; Lv9: +60 lure
- **Pairings:** **Bait and Switch** (+ Nappy Mines)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Gold Tooth** | Every 4th tooth is gold: it lures from twice as far, and whoever takes it is smitten along with everything near them. |
|  | **Wisdom Teeth** | Teeth lure from 60% further and last twice as long. |
| Lv 8 signature | **Under the Pillow** | A tooth nobody takes within 4s turns into a big XP coin. |
|  | **Dentures** | Teeth bite anything that comes close, for 50% damage every half second. |
| Lv 10 mastery | **Fairy Ring** | Every smite also hits everything within 140 of the victim for 50%. |
|  | **Tooth Decay** | Enemies holding teeth take +12% damage from everything for each tooth. |

### Upgrades with a twist

When an upgrade would do nothing for a weapon, that weapon does its own thing with it instead (the card tells you).

| Upgrade | Weapon | What it does instead |
|---|---|---|
| Spoilers | Placenta Paddle | some swings also land on a second enemy further away. |
| Spoilers | Flagellum Flail | some lashes also crack across a second enemy further away. |
| Spoilers | Slipstream Scalpel | the shot is you. Every few seconds you blink straight through an enemy, cutting the line. |
| Spoilers | Nappy Mines | some mines appear already under an enemy. |
| Spoilers | Morning Sickness | some globs land before you throw them. |
| Spoilers | Static Cling | some bolts start from the far side of the crowd. |
| Spoilers | Premature Evangelation | angels pop up next to enemies to bless them early. |
| Spoilers | Placental Siphon | some returned shots appear right next to their target. |
| Split Personality | Toddler Gravity | more orbs, which pull together and merge into bigger ones (twenty merged go supernova). |
| Split Personality | Slipstream Scalpel | a bigger, longer blade (+18% width and length per stack). |
| Split Personality | Placenta Paddle | +1 swing, aimed another way. |
| Split Personality | Flagellum Flail | +1 lash in the fan. |
| Split Personality | Thorny Onesie | +18% pulse damage. |
| Split Personality | Colouring In | +18% shape damage. |
| Split Personality | Peekaboo | +18% BOO damage. |
| Split Personality | Due Date | +1 mark. |
| Split Personality | Red Tape | +1 bundle. |
| Split Personality | Imaginary Friend | +1 friend, further behind. |
| Split Personality | Twin Telepathy | +1 twin, with its own beam. |
| Split Personality | Bubble Wand | +1 bubble. |
| Split Personality | Tooth Fairy | +1 tooth. |
| Pushy | Placenta Paddle | a 15% wider swing. |
| Pushy | Flagellum Flail | a 12% longer lash. |
| Pushy | Thorny Onesie | pulses shove harder. |
| Pushy | Static Cling | +1 chain jump. |
| Pushy | Morning Sickness | puddles 12% bigger. |
| Pushy | Nappy Mines | blasts shove enemies away. |
| Pushy | Premature Evangelation | angels bless each enemy more often as they pass. |
| Pushy | Slipstream Scalpel | the trail shoves enemies aside. |
| Pushy | Placental Siphon | returned shots pierce. |
| Pushy | Colouring In | a thicker line. |
| Pushy | Due Date | +10% repeat. |
| Pushy | Red Tape | +1 enemy per bundle. |
| Pushy | Imaginary Friend | its pokes reach 15% further. |
| Pushy | Peekaboo | BOO shoves harder. |
| Pushy | Twin Telepathy | a 15% wider beam. |
| Pushy | Bubble Wand | bubbles hold 12% bigger enemies. |
| Pushy | Tooth Fairy | teeth lure from 12% further. |
| Twitchy Tail | Slipstream Scalpel | the trail cuts faster. |
| Twitchy Tail | Premature Evangelation | angels circle faster. |
| Short Refractory Period | Slipstream Scalpel | the trail lingers longer. |
| Bigger Load | Slipstream Scalpel | a wider trail. |
| Bigger Load | Premature Evangelation | bigger angels. |
| Early Arrival | Placenta Paddle | longer reach. |
| Early Arrival | Flagellum Flail | a longer lash. |
| Early Arrival | Morning Sickness | globs land sooner. |
| Early Arrival | Premature Evangelation | angels circle further out. |
| Last Word | Premature Evangelation | when the angels clock off, they burst outwards. |
| Last Word | Placental Siphon | the last stored bullet hits like the rest put together. |
| Last Word | Static Cling | the last bolt of each charge hits four times as hard. |
| Last Word | Nappy Mines | the last mine of each batch is a big one. |
| Tactical Nap | Premature Evangelation | a bullet-clearing shockwave whenever the angels take their break. |
| Tactical Nap | Placental Siphon | a shockwave whenever the store runs dry. |
| Tunnel Vision | Slipstream Scalpel | the trail cuts harder the longer you keep swimming fast. |
| Tunnel Vision | Premature Evangelation | angels hit harder the longer they stay on shift. |
| Hair Trigger | Slipstream Scalpel | Slipstream Scalpel has no cooldown, so its trail cuts 33% harder instead. |
| Due Date Panic | Slipstream Scalpel | Slipstream Scalpel has no cooldown, so its trail cuts 60% harder instead. |
| Espresso Drip | Slipstream Scalpel | Slipstream Scalpel has no cooldown, so its trail cuts twice as hard instead. |

## Pairings (secret combos)

Own both weapons at Lv 5+ and the pairing switches on. In the game they stay hidden (???) until you find them once.

| Pairing | Weapons | Effect |
|---|---|---|
| **Baby Monitor Network** | Static Cling + Nappy Mines | Lightning jumping through a crowd sets off any Nappy Mine near its path. |
| **Hot Flush, Cold Sweat** | Heartburn + Cold Feet | Thermal Shock and Steam Burst reactions have no cooldown and hit twice as hard. |
| **Tetherball** | Yo-Yo Diet + Toddler Gravity | Yo-yos drag enemies back towards you on every throw. |
| **Family Tree** | Seeker Siblings + Tapeworm Seeder | Tapeworm turrets fire homing Seeker Siblings. |
| **Collection Plate** | Placental Siphon + Premature Evangelation | The angels catch enemy bullets and feed them into the Siphon. |
| **Nappy Trail** | Slipstream Scalpel + Morning Sickness | Your scalpel trail oozes poison that stacks. |
| **Conductive Spit** | Spitball + Static Cling | Spat-on enemies are wet: lightning deals double damage to them. |
| **Sucker Punch** | Hiccup Scattergun + Toddler Gravity | Enemies caught in a gravity orb take double damage from the Scattergun. |
| **Snow Globe** | Cold Feet + Toddler Gravity | Gravity orbs chill everything they hold and freeze it solid. |
| **Holy Smoke** | Premature Evangelation + Heartburn | The angels are on fire. Everything they touch catches. |
| **Sibling Yo-Yo** | Seeker Siblings + Yo-Yo Diet | Every yo-yo hit launches a Seeker Sibling. |
| **Petri Dish** | Tapeworm Seeder + Morning Sickness | Anything that dies in a puddle was infected all along. |
| **Static Discharge** | Static Cling + Placental Siphon | Every 12 bullets the Siphon eats fires a Static Cling chain at four enemies. |
| **Trail Mix** | Slipstream Scalpel + Nappy Mines | Your scalpel trail drops a Nappy Mine every 1.5s. |
| **One-Two** | Flagellum Flail + Placenta Paddle | Enemies the Flail has lashed take double damage from the Paddle for 2s. |
| **Live Wire** | Flagellum Flail + Static Cling | The tip of every lash sets off a Static Cling chain. |
| **Nappy Rash** | Thorny Onesie + Morning Sickness | Every Onesie pulse adds a stack of poison to what it hits. |
| **Ice Hockey** | Placenta Paddle + Cold Feet | The Paddle hits frozen enemies three times as hard. |
| **Final Notice** | Due Date + Red Tape | When a Due Date goes off on a taped enemy, the whole bundle takes all of it, not just a share. |
| **Live Paperwork** | Red Tape + Static Cling | Lightning that hits a taped enemy is shared through the bundle twice over. |
| **Hide and Seek** | Imaginary Friend + Peekaboo | While you are hidden, enemies chase your Imaginary Friend instead of the empty spot. |
| **Bubble Hockey** | Bubble Wand + Placenta Paddle | The Paddle pops bubbles it touches and fires the enemy inside the way it swung. |
| **Bait and Switch** | Tooth Fairy + Nappy Mines | Every tooth has a Nappy Mine under it. |
| **Colouring Book** | Colouring In + Morning Sickness | Every shape you colour in fills with a toxic puddle. |
| **Cold Read** | Twin Telepathy + Cold Feet | Anything that stays in the telepathy beam for a second freezes solid. |
| **Toil and Trouble** | Bubble Wand + Morning Sickness | Flung enemies leave a toxic puddle where they land. |

## Bosses and relics

A boss arrives every 2 minutes. Each run draws 4 of these 8 at random; after all 4, they come round again, tougher. Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.

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

## Run events

From level 6 (and about 70 seconds in), something unexpected happens every 55 to 75 seconds: never during a boss fight, the Final Five or the swim to the egg. From level 40 events turn **DIRE**: they come every 35 to 50 seconds, hit harder, pay out more, and 30% of the time two arrive at once. Run-event targets (the Golden Swimmer and bounties) get an arrow on screen, and every weapon and the autorun go after them first.

| Event | Lasts | Normal | Dire |
|---|---|---|---|
| **FEEDING FRENZY** | 25s | Everything swims 40% faster. +30% XP. | Everything swims 70% faster. +30% XP. |
| **GLASS WOMB** | 25s | You deal and take x2 damage. | You deal and take x2.5 damage. |
| **SUGAR RUSH** | 20s | You swim 60% faster, ram x3, contact hurts half as much. | You swim 60% faster, ram x3, contact hurts half as much. So do they: enemies 30% faster. |
| **BULLET HELL** | 20s | Shooters fire x2 as often. Survive: heal 30% and +1 reroll. | Shooters fire x2.6 as often. Survive: heal 30% and +2 rerolls. |
| **KIDNEY STONE SHOWER** | 20s | Stones rain down. They crush everything they land on, you included. | Stones rain down. They crush everything they land on, you included. |
| **THE HORDE** | 20s | Surrounded. Survive 20s for a gold chest. | Surrounded. Survive 20s for two gold chests. |
| **GOLDEN SWIMMER** | 20s | A golden sperm is running off with a chest. Catch it within 20s. | A golden sperm is running off with two chests. Catch it within 20s. |
| **MOST WANTED** | 60s | A bounty target is loose. Kill it within 60s: a chest and 2 rerolls. | A bounty target is loose. Kill it within 60s: two chests and 2 rerolls. |
| **LIGHTS OUT** | 25s | Someone switched off the microscope lamp. +30% XP. | Someone switched off the microscope lamp. +30% XP. Elites are out hunting. |
| **WATERS BREAKING** (Lv 25+) | 20s | A strong current sweeps everything one way. Swim with it and you ram for free. | A strong current sweeps everything one way. Swim with it and you ram for free. |
| **MITOSIS** (Lv 40+) | 20s | Everything that dies splits in two (the halves give no XP). | Everything that dies splits in two (the halves give no XP). |

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

Stat boosts that stack. Value shown is per pick at Common rarity.

| Power-up | Per pick | Max stacks |
|---|---|---|
| **Protein Shake** | +12% damage | 8 |
| **Twitchy Tail** | +10% fire rate | 8 |
| **Short Refractory Period** | +15% reload speed | 6 |
| **Bigger Load** | +20% magazine size | 6 |
| **Split Personality** | +1 projectile for all weapons (shots share the damage: about +25% in all) (Rare or better only) | 3 |
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
| **Snooze Button** | +1 max Rewind charge, +25% Chrono energy (Rare or better only) | 3 |
| **Last Word** | Last bullet of every magazine deals x4 damage and explodes | 3 |
| **Tactical Nap** | Starting a reload sends out a shockwave that deletes nearby bullets (+40 radius) | 4 |
| **Tunnel Vision** | +3% damage per second on the same target, up to +30% more | 3 |
| **Overachiever** | 50% of excess kill damage jumps to the next enemy | 3 |
| **Pincer Movement** | Weapons sharing a target: +25% damage. All three on different targets: +25% fire rate | 3 |
| **Hurry Up** | Up to +22% damage the faster you are moving | 4 |
| **Egg Bond** | Near the egg: +30% fire rate. Away from it: +30% crit chance | 3 |
| **Spoilers** | 10% of shots appear already next to their target (with the Slipstream Scalpel, you do) | 4 |
| **Inheritance** | Paradox Echoes also cast your spells and last twice as long (Rare or better only) | 1 |
| **Acrosome Ram** | Enemies you swim into take big damage (ram power x1.0). It grows with your level, max HP and armour. At full speed it sends out a shockwave and their contact hurts 40% less. Try HUNT autorun. | 5 |
| **Big Boned** | +30 max HP (and heal it). All your damage +4% for every 100 max HP you have. | 4 |
| **Prickly Personality** | Whatever hurts you gets hurt back (thorns x1), plus a smaller jab to everything around you. Grows with max HP and armour. | 4 |
| **Stubborn Streak** | Below half health: take 10% less damage and deal 12% more. | 3 |
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
| **Plus One** | +1 projectile (shots share the damage). |
| **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
| **Punching Up** | +100% damage to elites, bosses and rival champions. |
| **Sugar Rush** | +75% damage. |
| **Due Date Panic** | 40% faster cooldown and reload. |
| **Domino Effect** | Kills explode for 60% of the killing blow. |
| **Giant Killer** | +150% damage to elites, bosses and rival champions. |
| **Twins!** | +2 projectiles (shots share the damage). |
| **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |

## Modifiers

Slot into one weapon (3 per weapon). Power by rarity: Common x1, Uncommon x1.12, Rare x1.25, Epic x1.6, Legendary x2.2, Mythical x2.6, Celestial x3. Values below are at Common. "Projectile only" means guns and other shot-firing weapons.

| Modifier | Effect (Common) | Effect (Legendary) | Fits |
|---|---|---|---|
| **Seeking** | Shots hunt down targets (turn rate 5.0) | Shots hunt down targets (turn rate 7.4) | Projectile only |
| **Splitting** | On first hit, shots split into 3 shards at 30% damage | On first hit, shots split into 4 shards at 30% damage | Projectile only |
| **Orbiting** | Shots circle you for 1.2s, eating enemy bullets, then launch | Shots circle you for 2.6s, eating enemy bullets, then launch | Projectile only |
| **Growing** | Shots swell in flight: triple size and up to +100% damage | Shots swell in flight: triple size and up to +220% damage | Projectile only |
| **Boomerang** | Shots fly out and come back, hitting everything twice | Shots fly out and come back, hitting everything twice | Projectile only |
| **Ricochet** | +2 bounces between enemies | +3 bounces between enemies | Projectile only |
| **Freezing** | 18% chance per hit to freeze the target solid | 40% chance per hit to freeze the target solid | Any weapon |
| **Exploding** | Hits explode for 30% damage in a small blast | Hits explode for 66% damage in a small blast | Any weapon |
| **Mind Control** | 5% chance per hit to make a monster fight for you for 6s (max 6 allies) | 11% chance per hit to make a monster fight for you for 13s (max 6 allies) | Any weapon |
| **Element Swap** | Converts this weapon to a new element | Converts this weapon to a new element | Any weapon |
| **Shrapnel** | Kills burst into 3 shards at 30% damage | Kills burst into 3 shards at 30% damage | Any weapon |
| **Chaining** | 25% of hits chain to another enemy for 50% damage | 55% of hits chain to another enemy for 50% damage | Any weapon |
| **Pulsing** | Shots pulse every 0.6s, hitting everything close by for 15% damage | Shots pulse every 0.6s, hitting everything close by for 33% damage | Projectile only |
| **Magnetic** | Shots drag monsters within 70 units into their path | Shots drag monsters within 154 units into their path | Projectile only |
| **Delayed** | Shots hang for a moment, then launch 60% faster for +30% damage | Shots hang for a moment, then launch 60% faster for +66% damage | Projectile only |
| **Mirror** | Every shot has a twin fired the opposite way at 35% damage | Every shot has a twin fired the opposite way at 77% damage | Projectile only |

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

| Stain | Boon | What it colours |
|---|---|---|
| **GFP Tag** | You can finally see where your shots land: +12% damage. | Green Fluorescent Protein. Tags you: your swimmer, your shots, echoes and allies glow green. Much easier to find yourself in a crowd. |
| **Anti-Immune Stain** | You see it coming: +8% dodge. | Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings. |
| **Luciferase** | You know what is worth chasing: +20% luck, and +25% damage to elites and bosses. | The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas. |
| **Motility Dye** | Spot them early: +8% swim speed, and +30% damage to fast enemies. | Fast swimmers (sprinters, spermlets, krill, paramecia) take up the dye and turn cyan, so you can see what is about to reach you. |
| **Rival Dyes** | Know your enemy: +40% damage to rival champions and the Final Five. | Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board. |
| **H&E Stain Kit** | Everything is easier to spot: +30% pickup range and +1 reroll. | Haematoxylin and eosin, the classic. Stains the rest of the slide: elemental effects in their own colours (fire orange, frost blue, toxic green, arcane violet), power-up pickups and their effects, and your midpiece in your weapon-type colour. |

## Cursed cards

| Curse | Boon | Bane |
|---|---|---|
| **Glass Cannon Deluxe** | x1.8 damage for everything | Max HP halved |
| **Speedrunner's Regret** | +50% fire rate | Enemy bullets 20% faster |
| **Hoarder's Bargain** | +4 rerolls right now, double viewers | Pickup range halved |
| **Crowd Pleaser** | +50% XP and viewers | 30% more enemies (30% bigger waves in the dish) |
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
| **Thick Zona** | +1 armour per rank | 3 | 45 / 80 / 115 |
| **Lucky Genes** | +5% luck per rank (rarer DNA strands) | 3 | 35 / 65 / 95 |
| **Sharp Acrosome** | +3% crit chance per rank | 3 | 40 / 70 / 100 |
| **Well-Incubated** | +1 mutation slot per rank (Enzyme Vesicles) | 2 | 80 / 140 |

### Starter weapons

| Weapon | DNA |
|---|---|
| Nappy Mines | 60 |
| Premature Evangelation | 60 |
| Toddler Gravity | 80 |
| Slipstream Scalpel | 80 |
| Tapeworm Seeder | 90 |
| Placental Siphon | 100 |
| Colouring In | 90 |
| Bubble Wand | 90 |
| Red Tape | 90 |
| Due Date | 100 |
| Peekaboo | 100 |
| Tooth Fairy | 100 |
| Twin Telepathy | 110 |
| Imaginary Friend | 120 |

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
| 002 | **The Petri Dish** | Playable | A mad scientist is breeding super sperm. One drop at a time, wave after wave, each nastier than the last. How many can you take? |
| 000 | **Lab Bench (Debug)** | Playable | For testing: god mode, send in any enemy, boss or event, switch any weapon or spell on and off. Open the DEBUG panel. |
| 005 | **Frozen Donor Bank** | Coming soon | Thawed in a hurry. Everyone is sluggish, except the ones who are not. |
| 003 | **The Morning After** | Coming soon | The pill is already dissolving. Good luck. |
| 004 | **Vasectomy Reversal** | Coming soon | Low count, high stakes, very confused surgeon. |
