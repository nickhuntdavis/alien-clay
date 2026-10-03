# Spawn Prawn: complete game guide

Every sequence, weapon, combo, spell, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Epigenetic Profiles (sequences)](#epigenetic-profiles-sequences)
3. [Weapons](#weapons)
4. [Weapon combos](#weapon-combos)
5. [Pairings (secret combos)](#pairings-secret-combos)
6. [Bosses and relics](#bosses-and-relics)
7. [Run events](#run-events)
8. [Spells](#spells)
9. [Power-ups (passives)](#power-ups-passives)
10. [Mutations (Enzyme Vesicles)](#mutations-enzyme-vesicles)
11. [Mythical and Celestial bonuses](#mythical-and-celestial-bonuses)
12. [Upgrades any weapon can take](#upgrades-any-weapon-can-take)
13. [Modifiers](#modifiers)
14. [Duo combos](#duo-combos)
15. [Stains](#stains)
16. [Cursed cards](#cursed-cards)
17. [Field pickups (temporary power-ups)](#field-pickups-temporary-power-ups)
18. [Elemental reactions](#elemental-reactions)
19. [Element synergies](#element-synergies)
20. [Targeting directives](#targeting-directives)
21. [Movement directives](#movement-directives)
22. [Immune Response (difficulty)](#immune-response-difficulty)
23. [Being born (prestige)](#being-born-prestige)
24. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
25. [Enemies](#enemies)
26. [Rival champions](#rival-champions)
27. [Terrain](#terrain)
28. [Sperm samples](#sperm-samples)
29. [Secret Codex entries (spoilers)](#secret-codex-entries-spoilers)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, spells, power-ups, modifiers, stains and (rarely) curses.
2. **Weapons** level up to Lv10. Each weapon has its own upgrade path:
   - **Lv 3:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it). **Lv 5 and Lv 8:** pick one of two signature upgrades only that weapon has. **Lv 10 (mastery):** only one weapon a run can reach it; the others stop at Lv 9.
3. **Combos:** get two specific weapons to Lv 5+ and a COMBO card turns up in your next box. Fuse them and both keep firing, gain a new power, and (2 times a run) you get a bonus weapon mount. **Pairings** are smaller secret bonuses that switch on by themselves when you own both weapons at Lv5+.
4. **Weapon tuning:** fire rate, reload, magazine, extra projectiles, projectile speed and range, area, duration and pierce cards go on ONE weapon you choose (tap it on the card); each weapon keeps its own stacks. Legendary and better versions tune every weapon at once.
5. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
6. **Weapon drafts:** your first weapon at level 1, then a new weapon mount at Lv 8, 22 (3 in total, plus up to 2 bonus mounts from combos). You can only draft weapons from the sequences you carry (plus any Gene Bank wildcards). Ordinary DNA strands never offer new weapons.
7. **Sequences:** you start with one Primary Sequence (its trait at full strength, its weapons and its starting ability). At Lv 6, 20, 40 you can splice in another at half strength (three sequences in total: your primary plus two splices), or skip and take a mutation instead (two rerolls if your genome is full).
8. **Mutations:** Enzyme Vesicles bulge up on the slide (the first at 40s, then every 45 to 70s). Swim into one to pick one of four mutations; you have 6 slots.
9. **Bosses:** a boss every 2 minutes. Each run meets 4 of the 8, in a random order. Beat one and choose one of its three relics.
10. **Rarity** multiplies a card's value:

| Rarity | Multiplier | Weapon levels granted | Roll weight (relative) | Share of cards offered (mid-run) |
|---|---|---|---|---|
| Common | x1 | +1 | 56 | 41% |
| Uncommon | x1.25 | +1 | 26 | 27% |
| Rare | x1.5 | +1 | 12 | 21% |
| Epic | x2 | +2 | 5 | 5.3% |
| Legendary | x2.5 | +2 | 1.6 | 5.6% |
| Mythical | x3 | +3 | separate roll | 0.45% |
| Celestial | x4 | +3 | separate roll | 0.12% |

Weights are relative, not percentages, and luck tilts them towards the rarer rows. Mythical and Celestial skip the table: every card first rolls 0.55% for Mythical and 0.18% for Celestial (times 1 + 2 x luck), three a run at most. Legendary shows up more often than Epic because Legendary-only cards (curses, combos) add to it.

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Epigenetic Profiles (sequences)

Choose your Primary Sequence before each run. It gives its trait at full strength, its exclusive weapons and a starting ability that fires by itself (or tap its button). Spliced-in sequences give their trait at half strength and add their weapons to your drafts. Each sequence ranks up with kills while you carry it (Rank 2 at 5,000, Rank 3 at 25,000), doubling its trait each time. Your weapons take your primary's colour (with the GFP Tag).

| Sequence | Trait (Rank 1) | Weapons | Starting ability | Unlock |
|---|---|---|---|---|
| **The Firstborn** | Quick Recovery: +12% reload speed | Spitball, Seeker Siblings, Yo-Yo Diet | **Head First** (8s): Every 8s: headbutt-dash through whatever is in front of you, hitting everything along the way. You cannot be hurt mid-charge. | Always |
| **The Ten-Pounder** | Puppy Fat: +1 armour | Hiccup Scattergun, Placenta Paddle, Thorny Onesie, Nappy Mines | **Mood Swing** (30s): Drop below half health and you go berserk for 6s: +50% damage, +5 armour, and a shockwave that throws everything back. Every 30s. | Always |
| **The Bright Spark** | Early Developer: +6% fire rate, spells recharge 6% faster | Static Cling, Twin Telepathy, Toddler Gravity | **Short Fuse** (10s): Every 10s: grows a cyst that bursts a second later, shocking everything within 220 and wiping enemy bullets. | Always |
| **The Favourite** | Favouritism: +4% crit chance, +15% crit damage | Due Date, Cold Feet, Tooth Fairy | **Telling Tales** (7s): Every 7s: marks the toughest enemy in range, then a second later hits it with a guaranteed crit for huge damage. | Survive 10 minutes in a single run |
| **The Quiet One** | Under Your Feet: +12% melee and trail damage, +2% dodge | Flagellum Flail, Incompatible Viral Load, Peekaboo | **Slipped Out** (9s): Every 9s, when something gets close: you slip straight through it to the far side, slicing everything in between. Untouchable for a moment. | Beat 25 bosses (all runs) |
| **The Good Eater** | Healthy Appetite: +0.5 HP/s regeneration | Tapeworm Seeder, Bubble Wand, Premature Evangelation | **Cluster Feeding** (10s): Every 10s: drains the six nearest enemies within 250 and heals you for a fifth of what it took. | Pick up 100 power-ups (all runs) |
| **The Problem Child** | Overtired: up to +12% damage, the closer you are to bursting | Morning Sickness, Heartburn, Red Tape | **Bringing It Up** (9s): Every 9s: a ring of six burning acid pools erupts around you. They burn hotter the more hurt you are. | Deal 2,000,000 elemental damage (all runs) |
| **The Designer Baby** | Good Genes: your other sequences' traits are 25% stronger, +5% area | Imaginary Friend, Colouring In, Placental Siphon | **Cold Storage** (11s): Every 11s: a burst of liquid nitrogen hits the biggest crowd within 320, freezing everything in it (bosses only briefly). | Cast 1,500 spells (all runs) |

### Sequence synergies

| Synergy | Sequences | Effect |
|---|---|---|
| **Rubbing Off** | The Firstborn + The Bright Spark | Every reload sends a spark into the two nearest enemies. |
| **Trail of Destruction** | The Firstborn + The Problem Child | You leave small burning patches behind you as you swim. |
| **Comfort Eating** | The Ten-Pounder + The Good Eater | Below half health, your regeneration doubles (and you get +1 HP/s). |
| **Blowout** | The Ten-Pounder + The Problem Child | Nappy Mines leave a burning puddle where they go off. |
| **First Impressions** | The Favourite + The Quiet One | Hits on enemies at full health always crit. |

## Weapons

25 weapons, each with its own play style. Every weapon belongs to one sequence and only that sequence can draft it, unless you unlock it as a wildcard in the Gene Bank (DNA cost shown). Long-range weapons start at a reach of 300 and grow 30 a level to their full range.

| Weapon | Sequence | Element | Role | Aims at | Wildcard |
|---|---|---|---|---|---|
| [Spitball](#spitball) | Firstborn | Kinetic | Marksman | NEAREST | - |
| [Hiccup Scattergun](#hiccup-scattergun) | Ten-Pounder | Kinetic | Brawler | NEAREST | - |
| [Yo-Yo Diet](#yo-yo-diet) | Firstborn | Kinetic | Boomerang Kid | FURTHEST | - |
| [Incompatible Viral Load](#incompatible-viral-load) | Quiet One | Toxic | Toxic Trail | NEAREST | 80 DNA |
| [Heartburn](#heartburn) | Problem Child | Fire | Flamethrower | NEAREST | - |
| [Nappy Mines](#nappy-mines) | Ten-Pounder | Fire | Trapper | NEAREST | 60 DNA |
| [Cold Feet](#cold-feet) | Favourite | Frost | Freezer | FASTEST | - |
| [Static Cling](#static-cling) | Bright Spark | Shock | Chain Lightning | DENSEST CLUSTER | - |
| [Morning Sickness](#morning-sickness) | Problem Child | Toxic | Area Denial | DENSEST CLUSTER | - |
| [Tapeworm Seeder](#tapeworm-seeder) | Good Eater | Toxic | Necromancer | HIGHEST HEALTH | 90 DNA |
| [Seeker Siblings](#seeker-siblings) | Firstborn | Arcane | Swarm | WEAKEST | - |
| [Toddler Gravity](#toddler-gravity) | Bright Spark | Arcane | Crowd Control | DENSEST CLUSTER | 80 DNA |
| [Premature Evangelation](#premature-evangelation) | Good Eater | Arcane | Bodyguard | NEAREST | 60 DNA |
| [Placental Siphon](#placental-siphon) | Designer Baby | Arcane | Counter | NEAREST | 100 DNA |
| [Placenta Paddle](#placenta-paddle) | Ten-Pounder | Kinetic | Cleaver | NEAREST | - |
| [Flagellum Flail](#flagellum-flail) | Quiet One | Kinetic | Lasher | NEAREST | - |
| [Thorny Onesie](#thorny-onesie) | Ten-Pounder | Kinetic | Tank | NEAREST | - |
| [Colouring In](#colouring-in) | Designer Baby | Kinetic | Lasso | NEAREST | 90 DNA |
| [Due Date](#due-date) | Favourite | Arcane | Delayed Doom | HIGHEST HEALTH | 100 DNA |
| [Red Tape](#red-tape) | Problem Child | Toxic | Bureaucrat | DENSEST CLUSTER | 90 DNA |
| [Imaginary Friend](#imaginary-friend) | Designer Baby | Arcane | Echo | NEAREST | 120 DNA |
| [Peekaboo](#peekaboo) | Quiet One | Frost | Trickster | NEAREST | 100 DNA |
| [Twin Telepathy](#twin-telepathy) | Bright Spark | Shock | Geometry | DENSEST CLUSTER | 110 DNA |
| [Bubble Wand](#bubble-wand) | Good Eater | Kinetic | Trap & Throw | NEAREST | 90 DNA |
| [Tooth Fairy](#tooth-fairy) | Favourite | Arcane | Lure | DENSEST CLUSTER | 100 DNA |

### Spitball

*Kinetic gun, Marksman.* Reliable, accurate single shots. Mildly unhygienic.

- **Base stats:** dmg 11, cd 0.3s, mag 12, reload 1.1s, range 440
- **Level bonuses:** Lv3: +1 pierce; Lv6: +1 count; Lv9: +30% dmg
- **Combos:** **Big Sibling** (+ Seeker Siblings), **Swapping Spit** (+ Yo-Yo Diet)
- **Pairings:** **Conductive Spit** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
| Lv 5 signature | **Hock a Loogie** | Every 4th shot is a giant glob: triple damage, pierces everything, and bursts at the end of its flight. |
|  | **Wet Willy** | Hits leave enemies Soggy for 3s. Soggy enemies take +30% damage from everything you own. |
| Lv 8 signature | **Nesting Instinct** | +60% range, and shots hit twice as hard on anything more than 250 away. |
|  | **Phlegm Fan** | Every reload sprays a ring of 12 spitballs all around you. |
| Lv 10 mastery | **One Big Push** | It becomes a railgun: x4 damage, pierces everything, shreds armour, fires half as often. |
|  | **Projectile Vomit** | Fires four times as fast in a wide hose. Each droplet deals 45% damage and pierces once. |

### Hiccup Scattergun

*Kinetic gun, Brawler.* A close-range burst with knockback. Comes out whether you want it to or not.

- **Base stats:** dmg 8, cd 0.75s, mag 4, reload 1.6s, x6, range 270 (knock 70)
- **Level bonuses:** Lv3: +2 count; Lv6: +1 pierce; Lv9: +2 count
- **Combos:** **Porcupine Hug** (+ Thorny Onesie)
- **Pairings:** **Sucker Punch** (+ Toddler Gravity)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Skin to Skin** | Pellets hit up to +150% harder the closer the target is. |
|  | **Slug** | All the pellets fuse into one heavy slug (90% of their total damage) that pierces 3 enemies and bowls them over. |
| Lv 8 signature | **Buckshot** | +4 pellets per blast, each at 75% damage. A wall of lead. |
|  | **Withdrawal Method** | Every blast kicks you backwards, away from the target, and you cannot be hurt mid-kick. 78% effective. |
| Lv 10 mastery | **Hiccup Fit** | Every 3rd blast is a full ring of pellets around you that also wipes out nearby enemy bullets. |
|  | **Dragon's Breath** | Pellets turn to fire, set enemies alight and leave small burning puddles where they land. |

### Yo-Yo Diet

*Kinetic gun, Boomerang Kid.* A spinning blade that flies out and always comes back. Like the weight.

- **Base stats:** dmg 16, cd 1s, mag 2, reload 1.3s, pierce all, range 330 (boomerang 1)
- **Level bonuses:** Lv3: +20% dmg; Lv6: +1 count; Lv9: +30% dmg
- **Combos:** **Swapping Spit** (+ Spitball)
- **Pairings:** **Tetherball** (+ Toddler Gravity), **Tagging Along** (+ Seeker Siblings)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Walk the Dog** | At full reach the yo-yo spins in place for a second, grinding everything it touches, then comes home. |
|  | **Crash Diet** | The yo-yo grows every time it hits something: +10% size and damage per hit, every throw. |
| Lv 8 signature | **Rock the Baby** | Yo-yos eat every enemy bullet they pass through. |
|  | **Cat's Cradle** | A string runs from you to every yo-yo in flight, cutting whatever crosses it. |
| Lv 10 mastery | **Around the World** | Three yo-yos per throw, and every catch heals you a little for each enemy it hit. |
|  | **Gravity Pull** | At full reach it becomes a gravity well for 1.5s, then snaps home dragging its catch with it. |

### Incompatible Viral Load

*Toxic wake, Toxic Trail.* A toxic trail smeared behind you as you swim. Stop, and it is just a puddle.

- **Base stats:** dmg 20 (dur 2.2, area 22)
- **Level bonuses:** Lv3: +30% area; Lv6: +50% duration; Lv9: +50% dmg
- **Combos:** **Whiplash** (+ Flagellum Flail), **Silent but Deadly** (+ Peekaboo)
- **Pairings:** **Nappy Trail** (+ Morning Sickness), **Trail Mix** (+ Nappy Mines)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Closing the Loop** | Swim a loop around enemies and everything inside it takes a massive dose. Try the ORBIT autorun. |
|  | **Sticky Residue** | The trail lasts twice as long and slows whatever swims through it. |
| Lv 8 signature | **Viral Shedding** | Anything the trail touches keeps suffering: 60% of the hit again over 3s. |
|  | **Slipstream** | Swimming through your own trail: +35% swim speed and 25% less damage taken. |
| Lv 10 mastery | **Patient Zeroes** | Two ghost carriers circle you, each shedding its own trail. |
|  | **Fever Trail** | The trail runs a fever and catches fire: the faster you swim, the hotter it burns (up to x2.5). |

### Heartburn

*Fire gun, Flamethrower.* A short-range cone of fire that sets everything alight. Antacids not included.

- **Base stats:** dmg 3.4, cd 0.05s, mag 50, reload 2.1s, x2, pierce all, range 200
- **Level bonuses:** Lv3: +30% area; Lv6: +30% dmg; Lv9: +1 count
- **Combos:** **Flash Point** (+ Morning Sickness)
- **Pairings:** **Hot Flush, Cold Sweat** (+ Cold Feet), **Holy Smoke** (+ Premature Evangelation)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Blue Flame** | Narrow and long: +70% range, a tight cone and +40% damage. |
|  | **Indigestion** | Burning enemies explode in flames when they die, spreading the burn to everything nearby. |
| Lv 8 signature | **Repeating On You** | Flames leave burning puddles where they land. |
|  | **Burning Sensation** | Burning enemies take +50% damage from everything you own. |
| Lv 10 mastery | **Ring of Fire** | Twice the flames, sweeping a full circle around you, forever. |
|  | **Slow Cooker** | It never reloads, and the damage climbs the longer you keep firing (up to x3). Cools off when idle. |

### Nappy Mines

*Fire mine, Trapper.* Drops proximity mines in your wake. Nobody wants to change them.

- **Base stats:** dmg 34, cd 0.7s, mag 5, reload 2.4s, range 600 (explode 72, life 14)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +50% dmg
- **Combos:** **Whack-a-Mole** (+ Placenta Paddle)
- **Pairings:** **Baby Monitor Network** (+ Static Cling), **Trail Mix** (+ Incompatible Viral Load), **Bait and Switch** (+ Tooth Fairy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Wide Hips** | +35% area and +15% range. |
|  | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Domino Nappies** | A blast sets off every mine near it, and each one in the chain goes off 25% bigger than the last. |
|  | **Sticky Nappies** | Mines are thrown onto enemies and stick to them, going off 1.2s later. |
| Lv 8 signature | **Pebbledash** | Every mine also fires a fan of 8 shrapnel shots at the nearest enemy when it goes off. |
|  | **Learning to Crawl** | Mines crawl after the nearest enemy instead of waiting. |
| Lv 10 mastery | **Nuclear Nappy** | Every 6th mine is a nuke: three times the blast radius and six times the damage. |
|  | **Minefield** | Three mines per drop, twice as often, and they last twice as long. |

### Cold Feet

*Frost gun, Freezer.* Piercing ice shards that chill and freeze. Commitment issues, weaponised.

- **Base stats:** dmg 15, cd 0.6s, mag 5, reload 1.5s, pierce 3, range 460
- **Level bonuses:** Lv3: +1 count; Lv6: +2 pierce; Lv9: +1 count
- **Combos:** **Cold Case** (+ Due Date), **Cold Comfort** (+ Tooth Fairy)
- **Pairings:** **Hot Flush, Cold Sweat** (+ Heartburn), **Snow Globe** (+ Toddler Gravity), **Ice Hockey** (+ Placenta Paddle), **Cold Read** (+ Twin Telepathy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Breaking It Off** | A shard that hits a frozen enemy shatters it for 250% damage in an icy burst. |
|  | **Long Engagement** | +4 pierce, and each enemy a shard passes through makes it 25% stronger. |
| Lv 8 signature | **Brain Freeze** | Every 3rd shard that hits the same enemy freezes it solid (not bosses). |
|  | **Confetti** | Every 3rd volley also drops 6 hailstones on enemies around the target. |
| Lv 10 mastery | **Frosty Reception** | Shards leave frost patches behind that freeze anything that swims through. |
|  | **Cold Snap** | Every 4s a freezing blast around you freezes every non-boss enemy within reach. |

### Static Cling

*Shock chain, Chain Lightning.* Instant lightning that arcs between enemies, like a nylon onesie in winter.

- **Base stats:** dmg 13, cd 0.7s, mag 6, reload 1.8s, range 330 (chain 3, jump 140)
- **Level bonuses:** Lv3: +2 chain; Lv6: +1 count; Lv9: +2 chain
- **Combos:** **Storm in a Teacup** (+ Toddler Gravity), **Party Line** (+ Twin Telepathy)
- **Pairings:** **Baby Monitor Network** (+ Nappy Mines), **Conductive Spit** (+ Spitball), **Static Discharge** (+ Placental Siphon), **Live Wire** (+ Flagellum Flail), **Live Paperwork** (+ Red Tape)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Short Circuit** | +3 jumps, and the lightning can bounce back to enemies it already hit. Brutal on big targets. |
|  | **Umbilical Cord** | The first two enemies in each chain get tied together with lightning and slammed into each other. |
| Lv 8 signature | **Party Balloon** | Every 4th bolt leaves a ball of lightning on its target that zaps everything near it for 3s. |
|  | **Grounded** | Every chain earths through you: heal a little for each enemy it hit (within the lifesteal limit, doubled). |
| Lv 10 mastery | **Worked Up** | Every jump hits 20% harder than the last, instead of weaker. |
|  | **Tumble Dryer** | 15% of hits from all your other weapons set off a Static Cling chain. |

### Morning Sickness

*Toxic lob, Area Denial.* Lobs acid globs that leave toxic puddles. Worse before noon.

- **Base stats:** dmg 10, cd 0.9s, mag 4, reload 1.8s, range 390 (area 58, dur 3, flight 0.6)
- **Level bonuses:** Lv3: +50% duration; Lv6: +1 count; Lv9: +40% area
- **Combos:** **Flash Point** (+ Heartburn), **Sticky Situation** (+ Red Tape)
- **Pairings:** **Nappy Trail** (+ Incompatible Viral Load), **Something Going Round** (+ Tapeworm Seeder), **Nappy Rash** (+ Thorny Onesie), **Colouring Book** (+ Colouring In), **Toil and Trouble** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Nausea** | Enemies in a puddle are slowed by 45% and deal 40% less damage. |
|  | **It's Catching** | Enemies that die in a puddle leave a new puddle behind. |
| Lv 8 signature | **Acid Wash** | Puddles strip armour: enemies standing in them lose their armour and take +25% damage from everything. |
|  | **Comes in Waves** | When a puddle dries up it erupts for 300% damage. |
| Lv 10 mastery | **All-Day Sickness** | Puddles last four times as long and slowly spread. |
|  | **Acid Reflux** | When you get hit, you throw up eight puddles in a ring around you. |

### Tapeworm Seeder

*Toxic gun, Necromancer.* Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green.

- **Base stats:** dmg 12, cd 0.4s, mag 8, reload 1.6s, range 430 (dur 8)
- **Level bonuses:** Lv3: +1 count; Lv6: +50% duration; Lv9: +40% dmg
- **Combos:** **Worm Farm** (+ Bubble Wand)
- **Pairings:** **Family Tree** (+ Seeker Siblings), **Something Going Round** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Cold Shoulder** | Hits chill: enemies slow by 35% for 1.5s. |
|  | **Hot Load** | +40% damage. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
| Lv 5 signature | **Up and About** | Infected corpses get back up as zombie allies for 12s instead of turrets (up to 14 at once). |
|  | **Big Worm** | Turrets last twice as long, fire 50% faster and hit twice as hard. |
| Lv 8 signature | **Eating for Two** | Your turrets and zombies hit twice as hard and last 50% longer. |
|  | **Feeding Tube** | Every infected enemy that dies heals you 1% of your max HP. |
| Lv 10 mastery | **Brood** | The infection spreads: every infected death infects the three nearest enemies. |
|  | **Adopted** | Elites killed while infected become permanent allies (three at most). |

### Seeker Siblings

*Arcane gun, Swarm.* Tiny homing siblings who swim for you and never miss. Family is complicated.

- **Base stats:** dmg 9, cd 0.45s, mag 6, reload 2s, x2, range 500 (homing 5)
- **Level bonuses:** Lv3: +1 count; Lv6: +1 count; Lv9: +40% dmg
- **Combos:** **Big Sibling** (+ Spitball)
- **Pairings:** **Family Tree** (+ Tapeworm Seeder), **Tagging Along** (+ Yo-Yo Diet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Big Brother** | One sibling in every volley is huge: four times the size and damage, and pierces 3. |
|  | **Sibling Rivalry** | Every kill adds a sibling to your volleys (up to +8). Reloading makes them all settle down again. |
| Lv 8 signature | **Little Terrors** | Siblings explode when they hit, for 70% damage in a small blast. |
|  | **One Each** | Every sibling in a volley picks a different target. Nobody gets left out. |
| Lv 10 mastery | **Baby Boom** | Every sibling splits into two more homing siblings on its first hit. |
|  | **Family Reunion** | Siblings that miss swim back to circle you, eating bullets, then launch again. |

### Toddler Gravity

*Arcane gun, Crowd Control.* A slow orb that drags everything into its mouth. Everything.

- **Base stats:** dmg 8, cd 1.8s, mag 2, reload 2.5s, pierce all, range 400 (aura 72, pull 95)
- **Level bonuses:** Lv3: +30% area; Lv6: +1 count; Lv9: +50% dmg
- **Combos:** **Storm in a Teacup** (+ Static Cling)
- **Pairings:** **Tetherball** (+ Yo-Yo Diet), **Sucker Punch** (+ Hiccup Scattergun), **Snow Globe** (+ Cold Feet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Choking Hazard** | Non-boss enemies under 20% health that get dragged into the centre are swallowed whole. |
|  | **Nom Nom** | The orb eats enemy bullets, growing with every one (up to twice its size). |
| Lv 8 signature | **Big for Their Age** | Orbs are 60% bigger and pull twice as hard, but drift half as fast. |
|  | **Grasp Reflex** | The longer an orb holds an enemy, the harder it squeezes: up to triple damage after 2s. |
| Lv 10 mastery | **Big Bang** | When an orb ends it explodes for half of all the damage it dealt. |
|  | **Naughty Step** | The orb parks wherever it catches 4 enemies, pulls 2.5 times harder and lasts twice as long. |

### Premature Evangelation

*Arcane orbit, Bodyguard.* Guardian angels circle you and hit whatever comes close. They always start too soon.

- **Base stats:** dmg 23, reload 2.2s, x3, range 100 (dur 4.5, radius 72, spin 3.6)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +1 count
- **Combos:** **Bubble Halo** (+ Bubble Wand)
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

*Arcane siphon, Counter.* Eats enemy bullets that come near you and spits them back. No reloads. Feeds on demand.

- **Base stats:** dmg 15, cd 0.08s, mag 40, range 460 (area 90)
- **Level bonuses:** Lv3: +25% area; Lv6: +1 pierce; Lv9: +40% dmg
- **Combos:** **Fall Guy** (+ Imaginary Friend)
- **Pairings:** **Collection Plate** (+ Premature Evangelation), **Static Discharge** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Hot Load** | +40% damage. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Return to Sender** | Returned shots home in on whoever fired them, and hit them three times as hard. |
|  | **Bullet Buffet** | +40% absorb radius, and every bullet eaten heals you a little. |
| Lv 8 signature | **Spread the Love** | Every returned shot splits into three, each at 45% damage. |
|  | **Trust Fund** | Returned shots hit +2% harder for every bullet in the store (up to +80%). |
| Lv 10 mastery | **Mirror Womb** | 30% of enemy bullets that reach you bounce back at whoever fired them. |
|  | **Let-Down Reflex** | When the store fills up, it all bursts out in a ring of returned bullets. |

### Placenta Paddle

*Kinetic melee, Cleaver.* Heavy sweeping swings that knock crowds flying. Nobody asks where it came from.

- **Base stats:** dmg 34, cd 0.8s, mag 4, reload 1.1s, range 92 (area 1, arc 2.4, knock 220)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +1 count
- **Combos:** **Whack-a-Mole** (+ Nappy Mines)
- **Pairings:** **One-Two** (+ Flagellum Flail), **Ice Hockey** (+ Cold Feet), **Bubble Hockey** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Roundabout** | Every swing goes all the way round you, at 85% damage. Nothing sneaks up behind you. |
|  | **Home Run** | Every 3rd swing knocks enemies three times as far, and anything they crash into takes the hit too. |
| Lv 8 signature | **Tantrum** | Every hit speeds up your swings by 5% for 3s (up to +60%). It builds. |
|  | **Putting Your Foot Down** | Every 4th swing slams the ground all around you at 1.6 times the reach and stuns what it hits. |
| Lv 10 mastery | **Afterbirth Wave** | Every swing sends a wave out to three times its reach for 60% damage. |
|  | **Counting to Three** | Every hit adds a count. On three, the enemy is crushed for 400% damage (150% on bosses). |

### Flagellum Flail

*Kinetic melee, Lasher.* Your tail cracks like a whip in a long straight line. It was a weapon all along.

- **Base stats:** dmg 19, cd 0.38s, mag 6, reload 1s, range 190 (area 1, width 15, knock 60)
- **Level bonuses:** Lv3: +25% dmg; Lv6: +1 count; Lv9: +25% area
- **Combos:** **Whiplash** (+ Incompatible Viral Load)
- **Pairings:** **One-Two** (+ Placenta Paddle), **Live Wire** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Whip Crack** | The last third of the lash is the sweet spot: three times the damage, and it always crits. |
|  | **Come to Papa** | Lashes drag enemies towards you instead of pushing them away. Lovely with a Paddle or Headstrong. |
| Lv 8 signature | **Sting in the Tail** | Lashes make enemies bleed for 60% of the hit again over 3s. |
|  | **Snap Back** | Lashes yank you towards the far end of the lash, and you cannot be hurt mid-yank. Hit and run. |
| Lv 10 mastery | **Cat o' Nine Tails** | Every lash is five lashes in a wide fan, each at 60% damage. |
|  | **Spin Cycle** | Every 3rd lash spins a full circle of twelve lashes around you at 1.5 times the reach. |

### Thorny Onesie

*Kinetic melee, Tank.* Spikes pulse out all around you. Huggable, technically.

- **Base stats:** dmg 18, cd 0.55s, mag 8, reload 0.9s, range 90 (area 90, knock 120)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +20% area
- **Combos:** **Porcupine Hug** (+ Hiccup Scattergun)
- **Pairings:** **Nappy Rash** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Wide Hips** | +35% area and +15% range. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Look, Don't Touch** | Whatever hurts you gets hurt back hard (thorns x2), plus a jab to everything around you. |
|  | **Bear Hug** | Pulses pull enemies in instead of pushing them out, and every enemy in reach gives you +1 armour (up to +6). |
| Lv 8 signature | **Prickly Heat** | Every pulse also shoots 8 spines outwards at 50% damage. |
|  | **Bed Rest** | When you slow down or stop: +4 armour and pulses come 50% faster. |
| Lv 10 mastery | **Bubble Wrap** | Every 6th pulse is huge: twice the radius, 2.5 times the damage, and it pops every enemy bullet it touches. |
|  | **Growth Spurt** | The pulse grows 10% wider for every 100 max HP you have, and heals you a little for each enemy it hits. |

### Colouring In

*Kinetic crayon, Lasso.* Swim a loop round enemies and everything inside gets coloured in. Never inside the lines.

- **Base stats:** dmg 44, cd 2.2s, mag 3, reload 1.2s, range 600 (dur 2.6)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +40% duration; Lv9: +50% dmg
- **Combos:** **Drawn Together** (+ Imaginary Friend)
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

*Arcane duedate, Delayed Doom.* Sticks a countdown on an enemy. When it runs out, 40% of the damage it took lands again. Circled in red.

- **Base stats:** dmg 20, cd 0.9s, mag 3, reload 2s, range 480 (dur 4, repeat 0.4)
- **Level bonuses:** Lv3: +0.15 repeat; Lv6: +1 count; Lv9: +0.2 repeat
- **Combos:** **Cold Case** (+ Cold Feet)
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

*Toxic tape, Bureaucrat.* Tapes a target to the enemies around it, so a hit on one hurts the rest (35% of it). Sign here.

- **Base stats:** dmg 18, cd 1.4s, mag 3, reload 2s, range 420 (chain 3, jump 170, dur 5, share 0.35)
- **Level bonuses:** Lv3: +1 chain; Lv6: +0.1 share; Lv9: +2 chain
- **Combos:** **Sticky Situation** (+ Morning Sickness)
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
- **Combos:** **Drawn Together** (+ Colouring In), **Fall Guy** (+ Placental Siphon)
- **Pairings:** **He Went That Way** (+ Peekaboo)

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

*Frost peek, Trickster.* You vanish. Enemies swarm the empty spot, then BOO. The science is three years old.

- **Base stats:** dmg 20, cd 5.5s, mag 1, reload 0.1s, range 420 (dur 1.8, area 230)
- **Level bonuses:** Lv3: +25% duration; Lv6: +25% area; Lv9: +50% dmg
- **Combos:** **Silent but Deadly** (+ Incompatible Viral Load)
- **Pairings:** **He Went That Way** (+ Imaginary Friend)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Hide and Seek** | While hidden you swim 40% faster. |
|  | **Jump Scare** | BOO freezes enemies solid for 1.2s instead of scaring them off (not bosses). |
| Lv 8 signature | **Who's There?** | While you are hidden, enemy bullets hit other enemies three times as hard. |
|  | **Decoy Doll** | A doll stays where you vanished for 4s. Enemies keep attacking it, and it bursts for BOO damage at the end. |
| Lv 10 mastery | **Object Permanence** | You stay hidden twice as long. |
|  | **Big Boo** | BOO reaches everything on screen, and the scare lasts twice as long. |

### Twin Telepathy

*Shock twin, Geometry.* A beam joins you and your twin across the crowd. You both think "zap".

- **Base stats:** dmg 24, cd 1.6s, mag 3, reload 2s, range 520 (area 90, width 10)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +1 count; Lv9: +30% area
- **Combos:** **Party Line** (+ Static Cling)
- **Pairings:** **Cold Read** (+ Cold Feet)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Wide Hips** | +35% area and +15% range. |
|  | **Hot Load** | +40% damage. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Joined at the Hip** | The beam is twice as wide and chills what it touches. |
|  | **Switcheroo** | Every 6s you swap places with your twin, cutting everything along the way. |
| Lv 8 signature | **Sympathetic Pain** | When you get hurt, your twin's end erupts for 300% damage (every 1.5s at most). |
|  | **Same Wavelength** | The beam wipes out any enemy bullet that crosses it. |
| Lv 10 mastery | **Quadruplets** | Two more twins, each with its own beam fanning out through the crowd. |
|  | **Psychic Link** | Every pulse also hits everything along the beam for 200% damage. |

### Bubble Wand

*Kinetic bubble, Trap & Throw.* Traps small enemies in bubbles that slow them to a crawl. Anything that touches one pops it, blasting everything nearby. Do not drink the mix.

- **Base stats:** dmg 18, cd 1.1s, mag 4, reload 2s, range 380 (dur 5, hold 34)
- **Level bonuses:** Lv3: +1 count, +4 film; Lv6: +40% dmg, +4 film; Lv9: +1 count, +1 rainbow
- **Combos:** **Worm Farm** (+ Tapeworm Seeder), **Bubble Halo** (+ Premature Evangelation)
- **Pairings:** **Bubble Hockey** (+ Placenta Paddle), **Toil and Trouble** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Extra Spicy** | Hits set enemies on fire for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Extra Soapy** | Bubbles hold enemies twice the size, elites included. |
|  | **Bubble Bath** | The soap sticks: everything caught in a pop is slowed by half and can't shoot for 3s. Every pop also leaves a soapy patch that slows enemies by 40%. |
| Lv 8 signature | **Cannonball** | A pop launches the enemy inside away from whatever popped it. It bowls through its friends and explodes where it lands. |
|  | **Chain Pop** | A pop's blast pops every other bubble it reaches, one after another. |
| Lv 10 mastery | **Hamster Ball** | Trapped enemies roll fast at the nearest other enemy and pop on it. |
|  | **Cotton Wool** | Every 8s you are wrapped in a bubble that blocks the next 3 hits. |

### Tooth Fairy

*Arcane tooth, Lure.* Drops baby teeth near the crowd and smites whoever takes one. She collects debts.

- **Base stats:** dmg 34, cd 1.1s, mag 3, reload 2s, range 420 (dur 6, lure 230)
- **Level bonuses:** Lv3: +1 count; Lv6: +40% dmg; Lv9: +60 lure
- **Combos:** **Cold Comfort** (+ Cold Feet)
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
| Spoilers | Incompatible Viral Load | the shot is you. Every few seconds you blink straight through an enemy, cutting the line. |
| Spoilers | Nappy Mines | some mines appear already under an enemy. |
| Spoilers | Morning Sickness | some globs land before you throw them. |
| Spoilers | Static Cling | some bolts start from the far side of the crowd. |
| Spoilers | Premature Evangelation | angels pop up next to enemies to bless them early. |
| Spoilers | Placental Siphon | some returned shots appear right next to their target. |
| Split Personality | Toddler Gravity | more orbs, which pull together and merge into bigger ones (twenty merged go supernova). |
| Split Personality | Incompatible Viral Load | a bigger, longer blade (+18% width and length per stack). |
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
| Pushy | Incompatible Viral Load | the trail shoves enemies aside. |
| Pushy | Placental Siphon | returned shots pierce. |
| Pushy | Colouring In | a thicker line. |
| Pushy | Due Date | +10% repeat. |
| Pushy | Red Tape | +1 enemy per bundle. |
| Pushy | Imaginary Friend | its pokes reach 15% further. |
| Pushy | Peekaboo | BOO shoves harder. |
| Pushy | Twin Telepathy | a 15% wider beam. |
| Pushy | Bubble Wand | bubbles hold 12% bigger enemies. |
| Pushy | Tooth Fairy | teeth lure from 12% further. |
| Personal Space | Spitball | bigger shots, easier to land. |
| Personal Space | Hiccup Scattergun | bigger pellets. |
| Personal Space | Yo-Yo Diet | a bigger yo-yo. |
| Personal Space | Cold Feet | bigger shards. |
| Personal Space | Seeker Siblings | bigger siblings. |
| Personal Space | Tapeworm Seeder | bigger worms. |
| Twitchy Tail | Incompatible Viral Load | the trail hits faster. |
| Twitchy Tail | Premature Evangelation | angels circle faster. |
| Short Refractory Period | Incompatible Viral Load | the trail lingers longer. |
| Bigger Load | Incompatible Viral Load | a wider trail. |
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
| Tunnel Vision | Incompatible Viral Load | the trail hits harder the longer you keep swimming fast. |
| Tunnel Vision | Premature Evangelation | angels hit harder the longer they stay on shift. |
| Hair Trigger | Incompatible Viral Load | Incompatible Viral Load has no cooldown, so its trail hits 33% harder instead. |
| Due Date Panic | Incompatible Viral Load | Incompatible Viral Load has no cooldown, so its trail hits 60% harder instead. |
| Espresso Drip | Incompatible Viral Load | Incompatible Viral Load has no cooldown, so its trail hits twice as hard instead. |

## Weapon combos

Both weapons at Lv 5+: a COMBO card is guaranteed in your next box. Both keep firing, gain the power below, and the first 2 combos a run open a bonus weapon mount with a draft.

| Combo | Weapons | Sequence | Power |
|---|---|---|---|
| **Big Sibling** | Spitball + Seeker Siblings | Firstborn | Every 5th Spitball volley also launches a huge homing Big Sibling that explodes on impact. |
| **Swapping Spit** | Spitball + Yo-Yo Diet | Firstborn | Yo-yos spit Spitballs at whatever is near them while they fly. |
| **Whack-a-Mole** | Placenta Paddle + Nappy Mines | Ten-Pounder | Paddle hits plant a Nappy Mine under the enemy, armed almost at once. |
| **Porcupine Hug** | Thorny Onesie + Hiccup Scattergun | Ten-Pounder | Every Onesie pulse fires a ring of Scattergun pellets outwards. |
| **Storm in a Teacup** | Toddler Gravity + Static Cling | Bright Spark | Gravity orbs crackle: each one throws a Static Cling chain at what it is pulling in. |
| **Party Line** | Twin Telepathy + Static Cling | Bright Spark | Every second, each twin sends a Static Cling chain into the crowd. |
| **Cold Case** | Due Date + Cold Feet | Favourite | When a Due Date goes off, everything near it freezes solid and takes a burst of frost. |
| **Cold Comfort** | Tooth Fairy + Cold Feet | Favourite | Tooth Fairy smites freeze their victim. A frozen victim takes double. |
| **Whiplash** | Flagellum Flail + Incompatible Viral Load | Quiet One | Every lash leaves a strip of viral trail along its length. |
| **Silent but Deadly** | Peekaboo + Incompatible Viral Load | Quiet One | While you are hidden, your viral trail hits 2.5x as hard. The BOO leaves a ring of it round the spot. |
| **Worm Farm** | Bubble Wand + Tapeworm Seeder | Good Eater | Anything trapped in a bubble catches Tapeworm. Bubble pops hit infected enemies 50% harder. |
| **Bubble Halo** | Premature Evangelation + Bubble Wand | Good Eater | Your angels blow bubbles at small enemies near them. |
| **Flash Point** | Morning Sickness + Heartburn | Problem Child | Heartburn ignites your puddles: each one in range erupts in a fireball every second. |
| **Sticky Situation** | Red Tape + Morning Sickness | Problem Child | Taped bundles drip: a toxic puddle forms under each one every second. |
| **Drawn Together** | Colouring In + Imaginary Friend | Designer Baby | Every 3s, the shape between you and your Imaginary Friend is coloured in. |
| **Fall Guy** | Imaginary Friend + Placental Siphon | Designer Baby | Your Imaginary Friend catches enemy bullets and feeds them to the Siphon. |

## Pairings (secret combos)

Own both weapons at Lv 5+ and the pairing switches on. In the game they stay hidden (???) until you find them once.

| Pairing | Weapons | Effect |
|---|---|---|
| **Baby Monitor Network** | Static Cling + Nappy Mines | Lightning jumping through a crowd sets off any Nappy Mine near its path. |
| **Hot Flush, Cold Sweat** | Heartburn + Cold Feet | Thermal Shock and Steam Burst reactions have no cooldown and hit twice as hard. |
| **Tetherball** | Yo-Yo Diet + Toddler Gravity | Yo-yos drag enemies back towards you on every throw. |
| **Family Tree** | Seeker Siblings + Tapeworm Seeder | Tapeworm turrets fire homing Seeker Siblings. |
| **Collection Plate** | Placental Siphon + Premature Evangelation | The angels catch enemy bullets and feed them into the Siphon. |
| **Nappy Trail** | Incompatible Viral Load + Morning Sickness | Your viral trail is extra toxic: it hits 50% harder. |
| **Conductive Spit** | Spitball + Static Cling | Spat-on enemies are wet: lightning deals double damage to them. |
| **Sucker Punch** | Hiccup Scattergun + Toddler Gravity | Enemies caught in a gravity orb take double damage from the Scattergun. |
| **Snow Globe** | Cold Feet + Toddler Gravity | Gravity orbs chill everything they hold and freeze it solid. |
| **Holy Smoke** | Premature Evangelation + Heartburn | The angels are on fire. Everything they touch catches. |
| **Tagging Along** | Seeker Siblings + Yo-Yo Diet | Every yo-yo hit launches a Seeker Sibling. |
| **Something Going Round** | Tapeworm Seeder + Morning Sickness | Anything that dies in a puddle was infected all along. |
| **Static Discharge** | Static Cling + Placental Siphon | Every 12 bullets the Siphon eats fires a Static Cling chain at four enemies. |
| **Trail Mix** | Incompatible Viral Load + Nappy Mines | Your viral trail drops a Nappy Mine every 1.5s. |
| **One-Two** | Flagellum Flail + Placenta Paddle | Enemies the Flail has lashed take double damage from the Paddle for 2s. |
| **Live Wire** | Flagellum Flail + Static Cling | The tip of every lash sets off a Static Cling chain. |
| **Nappy Rash** | Thorny Onesie + Morning Sickness | Every Onesie pulse adds a stack of poison to what it hits. |
| **Ice Hockey** | Placenta Paddle + Cold Feet | The Paddle hits frozen enemies three times as hard. |
| **Final Notice** | Due Date + Red Tape | When a Due Date goes off on a taped enemy, the whole bundle takes all of it, not just a share. |
| **Live Paperwork** | Red Tape + Static Cling | Lightning that hits a taped enemy is shared through the bundle twice over. |
| **He Went That Way** | Imaginary Friend + Peekaboo | While you are hidden, enemies chase your Imaginary Friend instead of the empty spot. |
| **Bubble Hockey** | Bubble Wand + Placenta Paddle | When the Paddle pops a bubble, the enemy inside flies off the way it swung and bowls through its friends. |
| **Bait and Switch** | Tooth Fairy + Nappy Mines | Every tooth has a Nappy Mine under it. |
| **Colouring Book** | Colouring In + Morning Sickness | Every shape you colour in fills with a toxic puddle. |
| **Cold Read** | Twin Telepathy + Cold Feet | Anything that stays in the telepathy beam for a second freezes solid. |
| **Toil and Trouble** | Bubble Wand + Morning Sickness | Every pop leaves a toxic puddle. |

## Bosses and relics

A boss arrives every 2 minutes. Each run draws 4 of these 8 at random; a run that goes past 8 minutes starts the loop again with tougher versions (in practice that is inside the Storm Surge). Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.

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
| **Mother's Intuition** | +25% dodge. Every dodge sends out a pulse that wipes nearby enemy bullets. |

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
| **Acid Tongue** | Every hit shreds armour and adds a stack of poison. |
| **Bad Blood** | When you are hit, you splash acid around you for ten times the damage you took. |
| **Ulcer** | Enemies you kill leave acid puddles that dissolve their friends. |

### CHAD PRIME: Tail Day, Every Day

> "Bro. Bro. You swim like a sneeze."

The biggest swimmer anyone has ever seen. Dashes through you three times, then has to catch his breath. Base HP 3000, armour 5, speed 95.

- **Strengths:** Lightning-fast triple dash; Flexes: dodges 30% of your shots.
- **Weaknesses:** Winded after every dash: stunned, double damage; Blasts, beams and pools never miss him.

| Relic | Effect |
|---|---|
| **Pre-Workout** | +35% swim speed, and every weapon hits up to 50% harder while you swim fast. |
| **Tail Whip** | Your tail becomes a weapon: it lashes everything behind you twice a second. |
| **Flying Start** | Every 5s you surge forward, untouchable for a moment, leaving a shockwave behind you. |

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
| **Seconds** | From now on, every DNA strand pickup lets you take two cards instead of one. |

## Run events

From level 6 (and about 70 seconds in), something unexpected happens every 55 to 75 seconds: never during a boss fight, the Final Five or the swim to the egg. From level 40 events turn **DIRE**: they come every 35 to 50 seconds, hit harder, pay out more, and 30% of the time two arrive at once. Run-event targets (the Golden Swimmer and bounties) get an arrow on screen, and every weapon and the autorun go after them first.

| Event | Lasts | Normal | Dire |
|---|---|---|---|
| **FEEDING FRENZY** | 25s | Everything swims 40% faster. +30% XP. | Everything swims 70% faster. +30% XP. |
| **GLASS WOMB** | 25s | You deal and take x2 damage. | You deal and take x2.5 damage. |
| **SUGAR RUSH** | 20s | You swim 60% faster, ram x3, contact hurts half as much. | You swim 60% faster, ram x3, contact hurts half as much. So do they: enemies 30% faster. |
| **WITCHING HOUR** | 20s | Shooters fire x2 as often. Survive: heal 30% and +1 reroll. | Shooters fire x2.6 as often. Survive: heal 30% and +2 rerolls. |
| **KIDNEY STONE SHOWER** | 20s | Stones rain down. They crush everything they land on, you included. | Stones rain down. They crush everything they land on, you included. |
| **SOFT PLAY** | 20s | Surrounded. Survive 20s for a gold chest. | Surrounded. Survive 20s for two gold chests. |
| **GOLDEN SWIMMER** | 20s | A golden sperm is running off with a chest. Catch it within 20s. | A golden sperm is running off with two chests. Catch it within 20s. |
| **MOST WANTED** | 60s | A bounty target is loose. Kill it within 60s: a chest and 2 rerolls. | A bounty target is loose. Kill it within 60s: two chests and 2 rerolls. |
| **LIGHTS OUT** | 25s | Someone switched off the microscope lamp. +30% XP. | Someone switched off the microscope lamp. +30% XP. Elites are out hunting. |
| **WATERS BREAKING** (Lv 25+) | 20s | A strong current sweeps everything one way. Swim with it and you ram for free. | A strong current sweeps everything one way. Swim with it and you ram for free. |
| **IDENTICAL TWINS** (Lv 40+) | 20s | Everything that dies splits in two (the halves give no XP). | Everything that dies splits in two (the halves give no XP). |

## Spells

Spells autocast on cooldown and use spell slots. They level up like weapons but have no branch tree.

| Spell | Element | What it does | Base stats | Level bonuses |
|---|---|---|---|---|
| **Stork Drop** | Fire | A stork drops something heavy on the target and leaves burning ground. Not a baby. | dmg 65, cd 5s, count 1, area 88, delay 0.7s, dur 2s | Lv3: +1 count; Lv5: +30% area; Lv7: +1 count |
| **Cold Shower** | Frost | A freezing blast around you. Erases enemy bullets, and enthusiasm. | dmg 22, cd 7s, area 165 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 25% faster |
| **Brainstorm** | Shock | Lightning strikes several targets at once. None of the ideas are good. | dmg 36, cd 6s, count 5, area 48 | Lv3: +2 count; Lv5: +40% dmg; Lv7: +3 count |
| **Sofa Crevice** | Arcane | Tears open a singularity that drags and crushes. Everything you ever lost is in there. | dmg 16, cd 10s, area 125, dur 3s, pull 210 | Lv3: +30% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Kiss It Better** | Toxic | Restores 15% of your health. Medically dubious. | heals 15% HP, cd 14s | Lv3: 15% faster; Lv5: +50% healing; Lv7: 20% faster |
| **Nap Time** | Arcane | Slows every enemy and bullet to a crawl. Over too soon. | cd 16s, dur 3s | Lv3: +30% duration; Lv5: 20% faster; Lv7: +40% duration |
| **Latex Barrier** | Arcane | A shield that reflects enemy bullets and blocks contact. 98% effective. | dmg 12, cd 12s, dur 3s, area 80 | Lv3: +35% duration; Lv5: +30% area; Lv7: 25% faster |
| **Running With Scissors** | Kinetic | Explodes a ring of blades outward. You were told. | dmg 19, cd 6s, count 16, speed 460, pierce 3, size 6 | Lv3: +8 count; Lv5: +3 pierce; Lv7: +50% dmg |
| **Dutch Oven** | Toxic | A drifting cloud of stacking poison. You know what you did. | dmg 11, cd 9s, area 115, dur 5s | Lv3: +40% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Baby Monitor** | Shock | Deploys a turret that watches and shoots. Static included. | dmg 9, cd 13s, count 1, dur 10s, rate 0.25 | Lv3: +30% duration; Lv5: +1 count; Lv7: +50% dmg |

## Power-ups (passives)

Stat boosts that stack. Value shown is per pick at Common rarity.

**Tunes one weapon** means the card goes on one weapon you choose (each weapon has its own max stacks), unless it is Legendary or better, which tunes every weapon.

| Power-up | Per pick | Applies to | Max stacks |
|---|---|---|---|
| **Protein Shake** | +12% damage | You | 8 |
| **Twitchy Tail** | +10% fire rate | Tunes one weapon | 8 per weapon |
| **Short Refractory Period** | +15% reload speed | Tunes one weapon | 6 per weapon |
| **Bigger Load** | +20% magazine size | Tunes one weapon | 6 per weapon |
| **Split Personality** | +1 projectile (shots share the damage: about +25% on a one-shot weapon, less on weapons that already fire several; more hits for on-hit effects) (Epic or better only) | Tunes one weapon | 3 per weapon |
| **Early Arrival** | +12% projectile speed and range | Tunes one weapon | 5 per weapon |
| **Personal Space** | +12% area of effect | Tunes one weapon | 6 per weapon |
| **Stamina** | +15% effect duration | Tunes one weapon | 5 per weapon |
| **Pushy** | +1 pierce | Tunes one weapon | 4 per weapon |
| **Sharp Elbows** | +5% crit chance | You | 6 |
| **Low Blow** | +25% crit damage | You | 6 |
| **Thick Skin** | +15 max HP (and heal it) | You | 8 |
| **Pregnancy Vitamins** | +0.3 HP/sec regen | You | 5 |
| **Sticky Cilia** | +22% traction: sharper turns, less drift | You | 5 |
| **Head Down** | +12% traction and +6% swim speed | You | 3 |
| **Leg Day (Tail Day)** | +8% move speed | You | 5 |
| **Clingy** | +30% pickup range | You | 5 |
| **Shell Suit** | +1 armour (flat damage reduction) | You | 6 |
| **Lucky Swimmer** | +15% luck (rarer loot, more drops) | You | 5 |
| **Latching On** | Heal 0.08 HP per kill | You | 5 |
| **Hot-Blooded** | +25% fire damage and burn | You | 5 |
| **Cold-Blooded** | +25% frost damage and chill | You | 5 |
| **Static Hair** | +25% shock damage, +1 chain | You | 5 |
| **Bad Breath** | +25% poison damage, +3 max stacks | You | 5 |
| **Weird Aura** | +25% arcane damage | You | 5 |
| **Headbutt Training** | +25% kinetic damage | You | 5 |
| **Chemistry** | +35% elemental reaction damage | You | 5 |
| **Repeat Prescription** | -10% spell cooldowns | You | 5 |
| **Antenatal Classes** | +12% experience gained | You | 5 |
| **Snooze Button** | +1 max Rewind charge, +25% Chrono energy (Rare or better only) | You | 3 |
| **Last Word** | Last bullet of every magazine deals x4 damage and explodes | You | 3 |
| **Tactical Nap** | Starting a reload sends out a shockwave that deletes nearby bullets (+40 radius) | You | 4 |
| **Tunnel Vision** | +3% damage per second on the same target, up to +30% more | You | 3 |
| **Overachiever** | 50% of excess kill damage jumps to the next enemy | You | 3 |
| **Pincer Movement** | Weapons sharing a target: +15% damage. Three or more weapons all on different targets: +15% fire rate | You | 3 |
| **Hurry Up** | Up to +22% damage the faster you are moving | You | 4 |
| **Separation Anxiety** | Near the egg: +12% fire rate. Away from it: +12% crit chance | You | 3 |
| **Spoilers** | 10% of shots appear already next to their target (with the Incompatible Viral Load, you do) | You | 4 |
| **Inheritance** | Paradox Echoes also cast your spells and last twice as long (Rare or better only) | You | 1 |
| **Headstrong** | Enemies you swim into take big damage (ram power x1.0). It grows with your level, max HP and armour. At full speed it sends out a shockwave and their contact hurts 40% less. Try HUNT autorun. | You | 5 |
| **Big Boned** | +30 max HP (and heal it). All your damage +4% for every 100 max HP you have. | You | 4 |
| **Prickly Personality** | Whatever hurts you gets hurt back (thorns x1), plus a smaller jab to everything around you. Grows with max HP and armour. | You | 4 |
| **Stubborn Streak** | Below half health: take 10% less damage and deal 12% more. | You | 3 |
| **Wriggle Room** | +4% chance to dodge hits | You | 5 |

## Mutations (Enzyme Vesicles)

Swim into a vesicle (COLLECT autorun goes for them) and pick one of four. 6 slots (more with the Gene Bank's Well-Incubated). Tier 0 are common, tier 2 rare.

| Mutation | Tier | Effect |
|---|---|---|
| **Borrowed Jaw** | 0 | Weapons +10% damage and +5% crit chance. Spells -10% damage. The owner has stopped asking. |
| **Fussy Eater** | 0 | +2 rerolls right now and +10% luck. Sends everything back. |
| **Ants in Your Pants** | 0 | +5% dodge chance, +2.5% swim speed. Cannot sit still. |
| **Thumb Sucker** | 0 | +2 HP/s regeneration, but -15% max HP. The dentist disapproves. |
| **Sticky Fingers** | 0 | +30% pickup range. |
| **Runs in the Family** | 0 | +5% swim speed, and you hit up to 15% harder the faster you swim. |
| **Little Magpie** | 0 | +30% pickup range, and picking up any power-up pulls in every XP granule near you. |
| **Soft Spot** | 0 | Kinetic hits have a 4% chance to stun what they hit (1% on bosses, briefly). Everyone has one. |
| **Strong Bones** | 0 | +1 max HP for every 15 kills (elites count as 5), up to +100. Milk helps. |
| **Sweet Tooth** | 0 | Glucose Hits heal three times as much, and all healing is 20% stronger. |
| **Spoilt Rotten** | 0 | Power-ups drop from enemies twice as often. |
| **Non-Slip Socks** | 0 | +10% swim speed and +30% traction. |
| **Trapped Wind** | 0 | Poisoned enemies leave a cloud of toxic gas when they die. Better out than in. |
| **Catching a Chill** | 0 | Frozen enemies chill everything near them. |
| **Highly Strung** | 0 | Shock damage +30%. |
| **Gold Star** | 0 | +10% XP. |
| **Short Attention Span** | 0 | Every spell cast has a 15% chance to recharge twice as fast. |
| **Runny Nose** | 0 | Toxic +30%, Shock -20%. |
| **Past Bedtime** | 0 | Timed power-ups last twice as long. |
| **Showing Off** | 0 | Every elite or boss that dies near you: +5% damage for 10s, stacking 5 times. |
| **Do-Over** | 0 | The first reroll on every card screen is free. |
| **Salt in the Wound** | 0 | +20% crit chance against enemies that are slowed, frozen, poisoned or burning. |
| **Eat Your Greens** | 0 | +5% fire rate, and spells recharge 5% faster. |
| **Cold Hands** | 0 | Frost +30%, Fire -20%. Warm heart. |
| **Hot Head** | 0 | Fire +30%, ice -20%. Don't squeeze it. Or do. I want to watch. |
| **Runner's High** | 0 | +2 HP/s regeneration while you swim fast. |
| **E Numbers** | 0 | Killing an elite: 3s of +25% fire rate. The blue ones are worst. |
| **Surprise Package** | 0 | Popping an Enzyme Vesicle blows everything near you away. A Trojan virus, but rude. |
| **Snot Trail** | 0 | +5% swim speed, poison +5%. You are leaving a sticky mess all over my nice clean floor. |
| **Stiff as a Board** | 0 | +10% dodge chance, -20% swim speed. |
| **Biting Phase** | 0 | Hits heal you a little (within the lifesteal limit). It is just a phase. |
| **Teacher's Pet** | 0 | Weapons and spells -5% damage. +25% XP. |
| **Bookworm** | 0 | Spells +15% damage. Weapons -10% damage. |
| **Bursts Into Tears** | 1 | Get hit and you burst: a blast hits everything near you and shoves it away. |
| **Hollow Legs** | 1 | +1 HP/s regeneration for every 200 max HP you have. |
| **Chip on the Shoulder** | 1 | +30% damage to elites, bosses and rival champions. |
| **Screen Time** | 1 | Stay still and it builds: up to +30% damage after 3s. Swimming wears it off. |
| **Heavy-Handed** | 1 | +1% crit chance for every 100 max HP you have. |
| **Sticker Chart** | 1 | Killing a boss: 6s of +25% fire rate, and your spells recharge 25% faster. |
| **Lucky Dip** | 1 | +20% luck, so your DNA strands come out rarer. |
| **Hot and Cold** | 1 | Fire, Frost and Shock +40%. Kinetic, Toxic and Arcane -10%. |
| **Middle Child** | 1 | Alone (nothing within 250): +15% swim speed. In a crowd (8 or more): +3 armour. Anything in between: +10% damage. Adapts. |
| **Character Building** | 1 | Every hit you take: +1 max HP (up to +150), and +1 armour for every 50 hits. |
| **Double Yolk** | 1 | Every Enzyme Vesicle has a 30% chance to let you take two mutations. |
| **First Word** | 1 | Your spells always crit on enemies at full health, and crits hit 25% harder. |
| **Pass the Parcel** | 1 | Shocked enemies pass a jolt to a neighbour every second. |
| **Flare-Up** | 1 | Burning enemies can burst (about 1 in 10 each second) in a small fiery blast. |
| **Backed Up** | 1 | Weapons with a magazine bigger than 1 hold twice as much. |
| **Magic Cream** | 1 | Heals you fully now, +40 max HP, and every 5th Glucose Hit heals you fully. Fixes everything. |
| **Overexcited** | 1 | Every crit gives +0.5% fire rate for 2s (up to +25%). |
| **One in Each Hand** | 1 | Every timed power-up also gives you another random one. +20% pickup range. |
| **Too Many Sweets** | 1 | A Glucose Hit picked up at full health: +50% damage for 20s. |
| **Attention Seeker** | 1 | Getting hit instantly reloads a random weapon and recharges a random spell (every 2s at most). |
| **Keeping It a Surprise** | 1 | Hidden until you take it. |
| **Rough and Tumble** | 1 | Kinetic +40%. Fire, Frost and Shock -10%. |
| **Finders Keepers** | 1 | Rerolls have a 35% chance not to be used up. +5% luck. |
| **First Dibs** | 2 | Weapon hits on enemies at full health always crit. |
| **Small but Mighty** | 2 | Double damage. Half max HP. |
| **Dropped as a Baby** | 2 | Once, when you would die, you come back on 50% health. After that: -50% max HP for the rest of the run. Never quite the same. |
| **Five More Minutes** | 2 | A hit that would burst you leaves you on 1 HP instead. Once every 90s. |
| **Fair's Fair** | 2 | Every element at normal strength or weaker gets +25%. Any already boosted loses 10%. |

## Mythical and Celestial bonuses

A Mythical or Celestial card carries one of these on top of its own effect, for the rest of the run (three at most a run).

| Bonus | Rarity | Effect |
|---|---|---|
| **Second Wind** | Mythical | Every 40th kill sends you into OXYTOCIN for 5s (double fire rate, no reloads) and heals 10%. |
| **Act of God** | Mythical | Every 3s, lightning strikes the toughest enemy on screen for 8% of its max HP (4% on bosses, 6% on the Final Five). |
| **Second Coming** | Mythical | The first time you would die, you come back at full health. Unplanned. |
| **Growth Hormone** | Mythical | +50% max HP (and heal it), and +2 Headstrong. You are the weapon now. |
| **Bottomless Pit** | Mythical | A small black hole circles you for the rest of the run, dragging enemies in and crushing them. |
| **Full Technicolour** | Mythical | The stains are off. EVERYTHING goes full colour for the rest of the run: you, them, the bullets, the slide, the HUD, the lot. Also +10% damage, because colour is power. |
| **Tantric** | Mythical | When you drop below 30% health, time slows for 4s (every 20s at most). Breathe. |
| **Gender Reveal** | Celestial | Every 12s a blast fills the screen: every enemy takes 18% of its max HP (4% on bosses, 6% on the Final Five) and every enemy bullet is wiped. Everyone finds out. |
| **Hand of God** | Celestial | Every 5s, the three toughest enemies on screen are smitten for 15% of their max HP (4% on bosses, 6% on the Final Five). |
| **In Quick Succession** | Celestial | Every weapon you own fires 60% faster. Forever. |
| **State of Grace** | Celestial | Every 15s: 2s of invulnerability and a 15% heal. |
| **Twinkle, Twinkle** | Celestial | Stars fall on enemies near you, one every 0.4s, each for three times your best weapon's damage. |

## Upgrades any weapon can take

Offered at weapon level 3. Which three a weapon is offered is fixed per weapon (see its table above). Levels 5, 8 and 10 are always the weapon's own signature choices.

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

## Modifiers

Slot into one weapon (3 per weapon). Power by rarity: Common x1, Uncommon x1.12, Rare x1.25, Epic x1.6, Legendary x2.2, Mythical x2.6, Celestial x3. Values below are at Common. "Projectile only" means guns and other shot-firing weapons.

| Modifier | Effect (Common) | Effect (Legendary) | Fits |
|---|---|---|---|
| **Homing Instinct** | Shots hunt down targets (turn rate 5.0) | Shots hunt down targets (turn rate 7.4) | Projectile only |
| **Cell Division** | On first hit, shots split into 3 shards at 30% damage | On first hit, shots split into 4 shards at 30% damage | Projectile only |
| **Holding Pattern** | Shots circle you for 1.2s, eating enemy bullets, then launch | Shots circle you for 2.6s, eating enemy bullets, then launch | Projectile only |
| **Swelling** | Shots swell in flight: triple size and up to +100% damage | Shots swell in flight: triple size and up to +220% damage | Projectile only |
| **Boomerang Kid** | Shots fly out and come back, hitting everything twice | Shots fly out and come back, hitting everything twice | Projectile only |
| **Bouncing Baby** | +2 bounces between enemies | +3 bounces between enemies | Projectile only |
| **Frozen Stiff** | 18% chance per hit to freeze the target solid | 40% chance per hit to freeze the target solid | Any weapon |
| **With a Bang** | Hits explode for 30% damage in a small blast | Hits explode for 66% damage in a small blast | Any weapon |
| **Bad Influence** | 5% chance per hit to make a monster fight for you for 6s (max 6 allies) | 11% chance per hit to make a monster fight for you for 13s (max 6 allies) | Any weapon |
| **Switched at Birth** | Converts this weapon to a new element | Converts this weapon to a new element | Any weapon |
| **Going to Pieces** | Kills burst into 3 shards at 30% damage | Kills burst into 3 shards at 30% damage | Any weapon |
| **Daisy Chain** | 25% of hits chain to another enemy for 50% damage | 55% of hits chain to another enemy for 50% damage | Any weapon |
| **Contractions** | Shots pulse every 0.6s, hitting everything close by for 15% damage | Shots pulse every 0.6s, hitting everything close by for 33% damage | Projectile only |
| **Animal Magnetism** | Shots drag monsters within 70 units into their path | Shots drag monsters within 154 units into their path | Projectile only |
| **Delayed Gratification** | Shots hang for a moment, then launch 60% faster for +30% damage | Shots hang for a moment, then launch 60% faster for +66% damage | Projectile only |
| **Both Ends** | Every shot has a twin fired the opposite way at 35% damage | Every shot has a twin fired the opposite way at 77% damage | Projectile only |

## Duo combos

| Combo | Modifiers | Bonus |
|---|---|---|
| **Follow the Leader** | Homing Instinct + Cell Division | Split shards home in too. |
| **Freezer Burn** | Frozen Stiff + With a Bang | Explosions freeze whatever they hit. |
| **Halo** | Holding Pattern + Contractions | Pulses come twice as often and hit twice as hard. |
| **Snowball** | Boomerang Kid + Swelling | Shots grow twice as much on the way out and back. |
| **Bouncing Off the Walls** | Bouncing Baby + Daisy Chain | Chains jump to 3 targets. |
| **Pied Piper** | Bad Influence + Animal Magnetism | Mind-controlled allies last twice as long. |
| **Kaleidoscope** | Both Ends + Cell Division | Mirrored twins split into twice as many shards. |
| **Biological Clock** | Delayed Gratification + With a Bang | Delayed shots explode as they launch. |

## Stains

The slide starts in greyscale. Each stain brings back one kind of colour so you can read the fight better. GFP is guaranteed early.

| Stain | Boon | What it colours |
|---|---|---|
| **GFP Tag** | +12% damage. You can finally see where your shots land. | Green Fluorescent Protein. Tags you: your swimmer, your shots, echoes and allies glow green. Much easier to find yourself in a crowd. Also puts a health ring round you whenever you are hurt. |
| **Anti-Immune Stain** | +8% dodge. You see it coming. | Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings. Also shows a health ring round every hurt enemy (and an armour ring when its armour has been stripped). |
| **Luciferase** | +20% luck, and +25% damage to elites and bosses. You know what is worth chasing. | The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas. |
| **Motility Dye** | +8% swim speed, and +30% damage to fast enemies. You spot them early. | Fast swimmers (sprinters, spermlets, krill, paramecia) take up the dye and turn cyan, so you can see what is about to reach you. |
| **Rival Dyes** | +40% damage to rival champions and the Final Five. Know your enemy. | Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board, with a health ring round any rival you have hurt. |
| **H&E Stain Kit** | +30% pickup range and +1 reroll. Everything is easier to spot. | Haematoxylin and eosin, the classic. Stains the rest of the slide: elemental effects in their own colours (fire orange, frost blue, toxic green, arcane violet), power-up pickups and their effects, and your midpiece in your weapon-type colour. |

## Cursed cards

| Curse | Boon | Bane |
|---|---|---|
| **Delicate Condition** | x1.8 damage for everything | Max HP halved |
| **Shotgun Wedding** | +50% fire rate | Enemy bullets 20% faster |
| **Hands Full** | +4 rerolls right now, double viewers | Pickup range halved |
| **The More the Merrier** | +50% XP and viewers | 30% more enemies (30% bigger waves in the dish) |
| **Living in the Past** | +2 max Rewind charges, all refilled now | All healing halved |
| **Clothing Optional** | +25% move speed, +20% dodge | Armour is zero. Forever. |

## Field pickups (temporary power-ups)

Dropped by kills and elites. Timed ones show a countdown chip.

| Pickup | Letter | Effect |
|---|---|---|
| **MAGNET** | M | All XP flies to you |
| **NIT COMB** | N | Obliterates nearby enemies |
| **OXYTOCIN** | O | Double fire rate, no reloads |
| **GLUCOSE HIT** | + | Restore 35% HP |
| **STAIR GATE** | S | Invulnerable for 5s |
| **FREEZE TAG** | F | Freeze all enemies |
| **DNA STRAND** | ? | Free upgrade |
| **HIRED HELP** | H | Three bodyguard swimmers fight for you for 14s |
| **CENTRIFUGE** | C | For 6s everything near you is flung round you in a grinding vortex |
| **GROWING PAINS** | G | For 8s you are huge: you crush what you touch and take half damage |
| **CHAIN REACTION** | X | For 10s every kill explodes |
| **REFLUX** | R | For 7s bullets near you are swallowed and spat back as sparks |
| **GOLD RUSH** | $ | For 12s double XP, and XP flies to you |
| **LEECH** | L | For 10s your hits heal you |
| **LIGHTNING ROD** | Z | For 8s lightning strikes enemies on screen twice a second |
| **BREAKING WIND** | W | For 8s you swim 60% faster and leave a burning wake |

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
| Kinetic | **Trigger Happy** | +15% fire rate for kinetic weapons |
| Fire | **Playing With Matches** | Burns last longer and deal +50% damage |
| Frost | **Winter Baby** | Freeze threshold halved, frozen take +25% |
| Shock | **Carpet Shock** | Shocked enemies arc twice as often |
| Toxic | **Stomach Bug** | Poison ticks twice as fast |
| Arcane | **Old Wives' Tale** | Marks amplify damage by +50% instead of +30% |

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
| **COLLECT** | Hoover up XP, power-ups and mutation vesicles |
| **ORBIT** | Circle around the horde |
| **HUNT** | Close in on the primary target |
| **HOLD** | Stand ground, only dodge bullets |
| **NEST** | Hover in the egg's warm glow, which slowly heals you |

## Immune Response (difficulty)

Set on the sequence screen. Each level adds its rule on top of the ones before and +15% DNA. Win at your highest level to unlock the next.

| Level | Name | Rule |
|---|---|---|
| 1 | **Inflammation** | Enemies have 20% more health. |
| 2 | **Running a Temperature** | Enemies swim 10% faster. |
| 3 | **Antibody Surge** | Elites turn up twice as often. |
| 4 | **Opsonisation** | Enemy bullets fly 15% faster. |
| 5 | **Complement Cascade** | Bosses have 25% more health. |
| 6 | **Cytokine Storm** | Enemies hit 20% harder. |
| 7 | **Starvation** | Glucose Hits heal half as much. |
| 8 | **Leukocytosis** | 20% more enemies. |
| 9 | **Memory B-Cells** | Bosses hit 25% harder. |
| 10 | **Antibody Rain** | Elites burst into a ring of bullets when they die. |

## Being born (prestige)

After a win, the Gene Bank lets you be born: your bonuses, wildcards, dyes and DNA reset, but your Generation goes up for good (+10% DNA, +3% damage and +5 max HP each) and you keep a Baby Trait forever. The Codex, sequences, ranks and records stay.

| Baby Trait | Effect |
|---|---|
| **Colic** | Every 20s you scream: everything within 200 is knocked flying and takes damage. |
| **Chubby Cheeks** | +25 max HP. |
| **Teething** | +20% crit damage. |
| **Terrible Twos** | +8% damage. |
| **Baby Talk** | +10% XP. |
| **Cradle Cap** | +1 armour. |
| **Grabby Hands** | +25% pickup range. |
| **Sleeps Through** | +0.6 HP/s regeneration. |
| **Chatterbox** | +6% fire rate. |
| **Silver Spoon** | +1 reroll every run and +10% luck. |
| **The Dummy** | +5% dodge chance. Suck on that. |

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

### Wildcard weapons

Unlocked wildcards can be drafted by any sequence.

| Weapon | DNA |
|---|---|
| Nappy Mines | 60 |
| Premature Evangelation | 60 |
| Toddler Gravity | 80 |
| Incompatible Viral Load | 80 |
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
| **Also-Ran** | 14 | 8 | 64 | 0 | 1 | 0:00 | Swims straight at you |
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
| **Natural Killer** | 48 | 13 | 70 | 2 | 6 | 3:00 | Weaves, crouches, pounces; acid blood |
| **Ghost Swimmer** | 35 | 10 | 82 | 0 | 5 | 3:15 | Phases in and out |
| **Mother Cell** | 75 | 10 | 40 | 2 | 8 | 3:30 | Spawns minions |
| **Enzyme Spire** | 85 | 10 | 16 | 4 | 8 | 4:00 | Sits still and shoots |
| **Plasmodium** | 380 | 22 | 22 | 3 | 24 | 4:00 | Swallows you if it touches |
| **Killer T-Cell** | 26 | 6 | 52 | 0 | 5 | 4:20 | Keeps distance and shoots |
| **Water Bear** | 240 | 20 | 30 | 10 | 14 | 4:30 | Swims straight at you |
| **Alpha Swimmer** | 420 | 30 | 34 | 12 | 20 | 5:00 | Swims straight at you |
| **Booster** | 120 | 14 | 62 | 6 | 10 | 5:00 | Laser lock-on, burst fire, comes back once as a Second Dose |
| **Daughter Cell** | 12 | 5 | 92 | 0 | 1 | Spawned by others | Swims straight at you |
| **Daughter Colony** | 26 | 6 | 62 | 0 | 2 | Spawned by others | Swims straight at you |
| **Candida** | 18 | 5 | 22 | 0 | 1 | Spawned by others | Buds new yeast cells |
| **Pepsinator Jr** | 60 | 14 | 72 | 0 | 6 | Spawned by others | Swims straight at you |
| **Second Dose** | 45 | 12 | 92 | 0 | 6 | Spawned by others | Laser lock-on, burst fire, comes back once as a Second Dose |

## Rival champions

Named rivals race you to the egg. When the sperm count reaches 6, the strongest five survivors (rivals first, stand-ins after) become the Final Five. Beat them and the egg opens.

| Rival | Growth speed | Aggression | Bio |
|---|---|---|---|
| **Big Steve** | x1.1 | 0.6 | Has been doing laps since the Tuesday before last |
| **Chad Flagellum** | x1 | 0.9 | Has a protein shake named after him |
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

## Hidden rules

Rules the cards do not spell out, but that change what is worth picking.

- **Boss damage cap:** No single hit takes more than 4% of a boss's max HP, or 6% of a Final Five rival's. Percentage effects (Act of God, Hand of God, Gender Reveal, Nit Comb) are capped the same way.
- **Boss hits on you:** A single hit from a boss takes at most 22% of your max HP.
- **Your armour:** Each point blocks about 1 damage at the start of a run and about 7 by minute 10 (it scales with the enemy damage clock). It never blocks more than 75% of a hit.
- **Enemy armour:** Flat, but it grows a little with the enemy health clock (about x2.8 by minute 9, x3 at most). At least 15% of every hit gets through. Damage over time ignores armour; shred removes it.
- **Regeneration and lifesteal:** Regeneration and the lifesteal pool (about 3 HP/s, 9 with Transfusion) both grow with your max HP.
- **Dodge:** Capped at 75% when rolled. Cards that clamp their own bonus never lower dodge you already have.
- **Crit overflow:** Crit chance above 100% is added to crit damage one for one.
- **Extra projectiles:** Shots share damage: k times the projectiles deal (1 + (k^0.6 - 1)/2) in total, about +25% for one extra on a one-shot weapon.
- **Level curve:** The game expects Lv 60 at 9:00. Each level you are ahead adds 5% enemy health and 3% enemy damage. Each level behind shows BEHIND PACE on the HUD.
- **Storm Surge:** From 10:00 (difficulty minute 15) enemy health and damage compound every minute. Win before it.
- **Mythical and Celestial:** A separate roll on every card, three a run at most.
- **Weapon tuning:** Tuning cards only offer weapons the stat actually helps (no pierce for weapons that already pierce everything, no magazine for one-shot weapons).

## Glossary

- **Rewind and Chrono energy:** Rewind fires by itself on a lethal hit, rolls you back about 4s and leaves a Paradox Echo that replays your path firing copies of your weapons. You start with 1 charge (max 2, more with Snooze Button). Charges refill from Chrono energy (600 per charge), earned by fighting.
- **Viewers and sponsors:** The race is a live show. Kills, combos, bosses and achievements raise viewers; viewer milestones bring sponsor gifts (a heal, Oxytocin, a stair gate, a magnet, a nuke or a DNA strand).
- **The egg:** Opens at Lv 60: its membrane has 150,000 base HP and 8 armour, and a rival can break in first. The sperm count falls over the run; at 6 the Final Five (you and the five strongest swimmers) fight it out.
- **Spell slots:** Two. Spells cast themselves on cooldown.
- **Element set:** Two weapons or spells of the same element turn on its set bonus.
- **Weapon mounts:** Three (Lv 1 and drafts at 8 and 22), plus up to 2 bonus mounts from combos.
- **Player base stats:** 120 HP, 150 swim speed, 5% crit, x1.6 crit damage, 105 pickup radius, 0 armour, 0 dodge. You grow with max HP.

## Secret Codex entries (spoilers)

**Spoiler warning.** 18 hidden interactions. In the game each one stays ??? in the Codex until it happens to you for the first time; each line below says what sets it off.

| Secret | How it happens |
|---|---|
| **Belly Full of Nappies** | A Toddler Gravity orb swallowed your Nappy Mines. They all went off together when it collapsed. |
| **Gravity Assist** | Your shots curved round a black hole and flew out faster and harder. Ask a space probe. |
| **Live Puddle** | Lightning hit something standing in a toxic puddle, and everyone else in the puddle got it too. |
| **Flammable Fumes** | Something burning touched a toxic puddle and set the whole thing alight. |
| **Ice Rink** | Frost froze a toxic puddle solid. Enemies slide about on it; you skate across it faster. |
| **Icebreaker** | You rammed a frozen enemy at speed. It shattered, and the shards hit what was behind it. |
| **Hereditary** | An infected enemy split during Mitosis, and both halves kept the infection. |
| **Downstream** | Waters Breaking swept your mines, puddles and black holes along with everything else. |
| **Firelight** | In the dark, fire gives off light. Burning things light up their surroundings during Lights Out. |
| **Head-On** | Ramming counts closing speed: swim straight at something fast and it hits much harder. |
| **Something It Ate** | An amoeba swallowed something it should not have: a mine, a black hole, or an infected cell. |
| **Pocket Hoover** | A black hole sucked up loot lying on the floor, then spat it all out to you when it collapsed. |
| **Double Booked** | Two Due Dates landed on the same enemy. The dates merged: the countdown started again, owing half as much more. |
| **Contagious Paperwork** | Red Tape bundled an infected enemy with healthy ones. The infection travelled along the tape to all of them. |
| **Scared Stiff** | BOO! hit something that was already frozen solid. It shattered from the fright. |
| **Double Bluff** | Your Imaginary Friend copied Peekaboo. Two BOOs, back to back, from two places at once. |
| **Hole in One** | A flung enemy sailed over a baby tooth and grabbed it mid-air. The Tooth Fairy noticed. |
| **Tooth Thief** | A rival champion picked up one of your baby teeth. The Tooth Fairy does not check whose tooth it was. |
