# Spawn Prawn: complete game guide

Every sequence, weapon, combo, Feat, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Epigenetic Profiles (sequences)](#epigenetic-profiles-sequences)
   - [Sequence synergies](#sequence-synergies)
3. [Weapons](#weapons)
4. [Weapon combos](#weapon-combos)
5. [Pairings (secret combos)](#pairings-secret-combos)
6. [Bosses and relics](#bosses-and-relics)
7. [Run events](#run-events)
8. [Feats](#feats)
   - [Feat paths (Lv 4)](#feat-paths-lv-4)
9. [Power-ups (passives)](#power-ups-passives)
10. [Junk DNA (Lateral Gene Transfer)](#junk-dna-lateral-gene-transfer)
11. [Mutations](#mutations)
12. [Mythical and Immaculate bonuses](#mythical-and-immaculate-bonuses)
13. [Upgrades any weapon can take](#upgrades-any-weapon-can-take)
   - [Lv 3 pool](#lv-3-pool)
14. [Modifiers](#modifiers)
15. [Duo combos](#duo-combos)
16. [Stains](#stains)
17. [Cursed cards](#cursed-cards)
18. [Field pickups (temporary power-ups)](#field-pickups-temporary-power-ups)
19. [Stamina](#stamina)
20. [Sequence evolutions](#sequence-evolutions)
21. [Damage types](#damage-types)
22. [Chemical reactions](#chemical-reactions)
23. [Combo twists](#combo-twists)
24. [Damage-type synergies](#damage-type-synergies)
25. [Targeting directives](#targeting-directives)
26. [Movement directives](#movement-directives)
27. [Immune Response (difficulty)](#immune-response-difficulty)
28. [Being born (prestige)](#being-born-prestige)
29. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
   - [Bonuses](#bonuses)
   - [Wildcard weapons](#wildcard-weapons)
   - [GFP variants](#gfp-variants)
30. [Enemies](#enemies)
   - [First sightings](#first-sightings)
31. [Rival champions](#rival-champions)
32. [Terrain](#terrain)
33. [Campaign (SPOILERS: where Level 1 is set)](#campaign-spoilers-where-level-1-is-set)
34. [Achievement DNA](#achievement-dna)
35. [Wave mode (The Petri Dish)](#wave-mode-the-petri-dish)
36. [Boss rewards](#boss-rewards)
37. [Sperm samples](#sperm-samples)
38. [Hidden rules](#hidden-rules)
39. [Glossary](#glossary)
40. [Secret Field Guide entries (spoilers)](#secret-field-guide-entries-spoilers)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, Feats, power-ups, modifiers, stains and (rarely) curses.
2. **Weapons** level up to Lv10. Each weapon has its own upgrade path:
   - **Lv 3:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it). **Lv 5 and Lv 8:** pick one of two signature upgrades only that weapon has. **Lv 10 (mastery):** only one weapon a run can reach it; the others stop at Lv 9.
3. **Combos:** get two specific weapons to Lv 5+ and a COMBO card turns up in your next box. Fuse them and both keep firing, gain a new power, and (2 times a run) you get a bonus weapon mount. **Pairings** are smaller secret bonuses that switch on by themselves when you own both weapons at Lv5+.
4. **Weapon tuning:** fire rate, reload, magazine, extra projectiles, projectile speed and range, area, duration and pierce cards go on ONE weapon you choose (tap it on the card); each weapon keeps its own stacks. Legendary and better versions tune every weapon at once.
5. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
6. **Weapon drafts:** your first weapon at level 1, then a new weapon mount at Lv 8, 22 (3 in total, plus up to 2 bonus mounts from combos). You can only draft weapons from the sequences you carry (plus any Gene Bank wildcards). Ordinary DNA strands never offer new weapons.
7. **Sequences:** you start with one Primary Sequence (its trait at full strength, its weapons and its starting ability). At Lv 6, 20, 40 you can splice in another at half strength (three sequences in total: your primary plus two splices), or skip and take a mutation instead (two rerolls if your genome is full).
8. **Lateral Gene Transfer (junk DNA):** from 35s in, then every 40 to 55s, one ordinary enemy on screen carries junk DNA (a white double helix round it, and 50% more health). Kill it within 30s and you absorb a small power of whatever it was, at once; the same kind again stacks, up to 3 times. **Mutations** (pick one of four; 6 slots) now come from skipping a sequence splice and from stashes hidden in campaign levels.
9. **Bosses:** four bosses, at about 2:05, 3:50, 5:35 and 7:20 of game time; a fifth waits until the Fever Pitch. Each run meets 4 of the 9, in a random order. Beat one and choose one of its three relics.
10. **Rarity** multiplies a card's value:

| Rarity | Multiplier | Weapon levels granted | Roll weight (relative) | Share of cards offered (mid-run) |
|---|---|---|---|---|
| Common | x1 | +1 | 56 | 41% |
| Uncommon | x1.25 | +1 | 26 | 27% |
| Rare | x1.5 | +1 | 12 | 21% |
| Epic | x2 | +2 | 5 | 5.3% |
| Legendary | x2.5 | +2 | 1.6 | 5.6% |
| Mythical | x3 | +3 | separate roll | 0.45% |
| Immaculate | x4 | +3 | separate roll | 0.12% |

Weights are relative, not percentages, and luck tilts them towards the rarer rows. Mythical and Immaculate skip the table: every card first rolls 0.55% for Mythical and 0.18% for Immaculate (times 1 + 2 x luck), three a run at most. Legendary shows up more often than Epic because Legendary-only cards (curses, combos) add to it.

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Epigenetic Profiles (sequences)

Choose your Primary Sequence before each run. It gives its trait at full strength, its exclusive weapons and a starting ability that fires by itself (or tap its button). Spliced-in sequences give their trait at half strength and add their weapons to your drafts. Each sequence ranks up with kills while you carry it (Rank 2 at 12,000, Rank 3 at 60,000), doubling its trait each time. Your weapons take your primary's colour (with the GFP Tag).

| Sequence | Trait (Rank 1) | Weapons | Starting ability | Unlock |
|---|---|---|---|---|
| **The Firstborn** | Quick Recovery: +12% reload speed | Spitball, Seeker Siblings, Yo-Yo Diet | **Head First** (8s): Every 8s: headbutt-dash through whatever is in front of you, hitting everything along the way. You cannot be hurt mid-charge. | Always |
| **The Chonker** | Puppy Fat: +1 armour | Hiccup Scattergun, Placenta Paddle, Thorny Onesie, Nappy Mines | **Mood Swing** (30s): Drop below half health and you go berserk for 6s: +50% damage, +5 armour, and a shockwave that throws everything back. Every 30s. | Always |
| **The Bright Spark** | Early Developer: +6% fire rate, Feats recharge 6% faster | Static Cling, Twin Telepathy, Toddler Gravity | **Short Fuse** (10s): Every 10s: grows a cyst that bursts a second later, shocking everything within 220 and wiping enemy bullets. | Always |
| **The Favourite** | Favouritism: +4% crit chance, +15% crit damage | Due Date, Antacid, Tooth Fairy | **Telling Tales** (7s): Every 7s: marks the toughest enemy in range, then a second later hits it with a guaranteed crit for huge damage. | Survive 10 minutes in a single run |
| **The Quiet One** | Under Your Feet: +12% melee and trail damage, +2% dodge | Flagellum Flail, Pub Crawl, Peekaboo | **Slipped Out** (9s): Every 9s, when something gets close: you slip straight through it to the far side, slicing everything in between. Untouchable for a moment. | Beat 25 bosses (all runs) |
| **The Good Eater** | Healthy Appetite: +0.5 HP/s regeneration | Tapeworm Seeder, Bubble Wand, Premature Evangelation | **Cluster Feeding** (10s): Every 10s: drains the six nearest enemies within 250 and heals you for a fifth of what it took. | Pick up 100 power-ups (all runs) |
| **The Problem Child** | Overtired: up to +12% damage, the closer you are to bursting | Morning Sickness, Heartburn, Red Tape | **Bringing It Up** (9s): Every 9s: a ring of six acid pools erupts around you. They corrode harder the more hurt you are. | Deal 2,000,000 chemical damage (all runs) |
| **The Designer Baby** | Good Genes: your other sequences' traits are 25% stronger, +5% area | Imaginary Friend, Colouring In, Placental Siphon, Gene Gun | **Soap Dispenser** (11s): Every 11s: a squirt of lye hits the biggest crowd within 320, saponifying everything in it (bosses only briefly). | Cast 1,500 Feats (all runs) |
| **Prawn Again** | Past Life: memories of a past life surface as you level (100% strength), +5% experience | Déjà Vu, Ghosts of You, Karma | **Second Life** (45s): When your health drops below 25%, you die a little and are prawn again: 40% of your health back, 2s in which nothing can hurt you, and a burst of light that hurts everything near you. Every 45s at most. | Reach Rank 3 with every other sequence |
| **The Redtail** | Inbred Luck: +25% luck; level-up boxes are never Common. Every level up also brings a small bane (at most 4 of each) | Shotgun Wedding, Moonshine Jug, Duelling Banjo | **Sister-Cousin** (12s): When you are hit, there is a 35% chance a copy of you splits off and fights beside you for 12s. Swim into her to recombine for Keeping It in the Family: +30% damage and +20% fire rate for 8s, and 10% of your health back. Tap to split on purpose. | Play 20 runs (any result) |

### Sequence synergies

| Synergy | Sequences | Effect |
|---|---|---|
| **Rubbing Off** | The Firstborn + The Bright Spark | Every reload sends a spark into the two nearest enemies. |
| **Trail of Destruction** | The Firstborn + The Problem Child | You leave small acid patches behind you as you swim. |
| **Comfort Eating** | The Chonker + The Good Eater | Below half health, your regeneration doubles (and you get +1 HP/s). |
| **Blowout** | The Chonker + The Problem Child | Nappy Mines leave an acid puddle where they go off. |
| **First Impressions** | The Favourite + The Quiet One | Hits on enemies at full health always crit. |
| **Clean Living** | The Designer Baby + The Favourite | Lathered or saponified enemies take 30% more damage from you. |
| **Batch Cooking** | The Designer Baby + The Good Eater | Your starting ability (Soap Dispenser or Cluster Feeding, whichever is your primary's) heals you 3% of your max HP for every enemy it hits (up to 15%). |

## Weapons

32 weapons, each with its own play style. Every weapon belongs to one sequence and only that sequence can draft it, unless you unlock it as a wildcard in the Gene Bank (DNA cost shown). Long-range weapons start at a reach of 300 and grow 30 a level to their full range.

| Weapon | Sequence | Damage type | Role | Aims at | Wildcard |
|---|---|---|---|---|---|
| [Spitball](#spitball) | Firstborn | Force | Marksman | NEAREST | - |
| [Hiccup Scattergun](#hiccup-scattergun) | Chonker | Force | Brawler | NEAREST | - |
| [Yo-Yo Diet](#yo-yo-diet) | Firstborn | Force | Boomerang | FURTHEST | - |
| [Pub Crawl](#pub-crawl) | Quiet One | Ethanol | Boozy Trail | NEAREST | 80 DNA |
| [Heartburn](#heartburn) | Problem Child | Acid | Acid Spray | NEAREST | - |
| [Nappy Mines](#nappy-mines) | Chonker | Acid | Trapper | NEAREST | 60 DNA |
| [Antacid](#antacid) | Favourite | Base | Saponifier | FASTEST | - |
| [Static Cling](#static-cling) | Bright Spark | Static | Chain Static | DENSEST CLUSTER | - |
| [Morning Sickness](#morning-sickness) | Problem Child | Ethanol | Area Denial | DENSEST CLUSTER | - |
| [Tapeworm Seeder](#tapeworm-seeder) | Good Eater | Ethanol | Necromancer | HIGHEST HEALTH | 90 DNA |
| [Seeker Siblings](#seeker-siblings) | Firstborn | Histamine | Swarm | WEAKEST | - |
| [Toddler Gravity](#toddler-gravity) | Bright Spark | Histamine | Crowd Control | DENSEST CLUSTER | 80 DNA |
| [Premature Evangelation](#premature-evangelation) | Good Eater | Histamine | Bodyguard | NEAREST | 60 DNA |
| [Placental Siphon](#placental-siphon) | Designer Baby | Brine | Counter | NEAREST | 100 DNA |
| [Placenta Paddle](#placenta-paddle) | Chonker | Force | Cleaver | NEAREST | - |
| [Flagellum Flail](#flagellum-flail) | Quiet One | Force | Lasher | NEAREST | - |
| [Thorny Onesie](#thorny-onesie) | Chonker | Force | Tank | NEAREST | - |
| [Colouring In](#colouring-in) | Designer Baby | Force | Lasso | NEAREST | 90 DNA |
| [Due Date](#due-date) | Favourite | Histamine | Delayed Doom | HIGHEST HEALTH | 100 DNA |
| [Red Tape](#red-tape) | Problem Child | Ethanol | Bureaucrat | DENSEST CLUSTER | 90 DNA |
| [Imaginary Friend](#imaginary-friend) | Designer Baby | Histamine | Echo | NEAREST | 120 DNA |
| [Peekaboo](#peekaboo) | Quiet One | Base | Trickster | NEAREST | 100 DNA |
| [Twin Telepathy](#twin-telepathy) | Bright Spark | Static | Geometry | DENSEST CLUSTER | 110 DNA |
| [Bubble Wand](#bubble-wand) | Good Eater | Peroxide | Trap & Throw | NEAREST | 90 DNA |
| [Tooth Fairy](#tooth-fairy) | Favourite | Histamine | Lure | DENSEST CLUSTER | 100 DNA |
| [Déjà Vu](#dj-vu) | Prawn Again | Histamine | Repeater | NEAREST | - |
| [Ghosts of You](#ghosts-of-you) | Prawn Again | Base | Haunter | NEAREST | - |
| [Karma](#karma) | Prawn Again | Force | Payback | NEAREST | - |
| [Gene Gun](#gene-gun) | Designer Baby | Histamine | Splicer | NEAREST | - |
| [Shotgun Wedding](#shotgun-wedding) | Redtail | Force | Brawler | NEAREST | - |
| [Moonshine Jug](#moonshine-jug) | Redtail | Ethanol | Firebomber | DENSEST CLUSTER | - |
| [Duelling Banjo](#duelling-banjo) | Redtail | Static | Ring | NEAREST | - |

### Spitball

*Force gun, Marksman.* Reliable, accurate single shots. Mildly unhygienic.

- **Base stats:** dmg 11, cd 0.3s, mag 12, reload 1.1s, range 440
- **Level bonuses:** Lv3: +1 pierce; Lv6: +1 count; Lv9: +30% dmg
- **Combos:** **Big Sibling** (+ Seeker Siblings), **Swapping Spit** (+ Yo-Yo Diet)
- **Pairings:** **Conductive Spit** (+ Static Cling), **Seen It Before** (+ Déjà Vu)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
| Lv 5 signature | **Hock a Loogie** | Every 4th shot is a giant glob: triple damage, pierces everything, and bursts at the end of its flight. |
|  | **Wet Willy** | Hits leave enemies Soggy for 3s. Soggy enemies take +30% damage from everything you own. |
| Lv 8 signature | **Nesting Instinct** | +60% range, and shots hit twice as hard on anything more than 250 away. |
|  | **Phlegm Fan** | Every reload sprays a ring of 12 spitballs all around you. |
| Lv 10 mastery | **One Big Push** | It becomes a railgun: x4 damage, pierces everything, shreds armour, fires half as often. |
|  | **Projectile Vomit** | Fires four times as fast in a wide hose. Each droplet deals 45% damage and pierces once. |

### Hiccup Scattergun

*Force gun, Brawler.* A close-range burst with knockback. Comes out whether you want it to or not.

- **Base stats:** dmg 8, cd 0.75s, mag 4, reload 1.6s, x6, range 270 (knock 70)
- **Level bonuses:** Lv3: +2 count; Lv6: +1 pierce; Lv9: +2 count
- **Combos:** **Porcupine Hug** (+ Thorny Onesie)
- **Pairings:** **Sucker Punch** (+ Toddler Gravity), **Shotgun Reception** (+ Shotgun Wedding)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Skin to Skin** | Pellets hit up to +150% harder the closer the target is. |
|  | **Slug** | All the pellets fuse into one heavy slug (90% of their total damage) that pierces 3 enemies and bowls them over. |
| Lv 8 signature | **Buckshot** | +4 pellets per blast, each at 75% damage. A wall of lead. |
|  | **Withdrawal Method** | Every blast kicks you backwards, away from the target, and you cannot be hurt mid-kick. 78% effective. |
| Lv 10 mastery | **Hiccup Fit** | Every 3rd blast is a full ring of pellets around you that also wipes out nearby enemy bullets. |
|  | **Dragon's Breath** | Pellets turn to acid, corrode enemies and leave small acid puddles where they land. |

### Yo-Yo Diet

*Force gun, Boomerang.* A spinning blade that flies out and always comes back. Like the weight.

- **Base stats:** dmg 16, cd 1s, mag 2, reload 1.3s, pierce all, range 330 (boomerang 1)
- **Level bonuses:** Lv3: +20% dmg; Lv6: +1 count; Lv9: +30% dmg
- **Combos:** **Swapping Spit** (+ Spitball)
- **Pairings:** **Tetherball** (+ Toddler Gravity), **Tagging Along** (+ Seeker Siblings)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Walk the Dog** | At full reach the yo-yo spins in place for a second, grinding everything it touches, then comes home. |
|  | **Crash Diet** | The yo-yo grows every time it hits something: +10% size and damage per hit, every throw. |
| Lv 8 signature | **Rock the Baby** | Yo-yos eat every enemy bullet they pass through. |
|  | **Cat's Cradle** | A string runs from you to every yo-yo in flight, cutting whatever crosses it. |
| Lv 10 mastery | **Around the World** | Three yo-yos per throw, and every catch heals you a little for each enemy it hit. |
|  | **Gravity Pull** | At full reach it becomes a gravity well for 1.5s, then snaps home dragging its catch with it. |

### Pub Crawl

*Ethanol wake, Boozy Trail.* A boozy trail smeared behind you as you swim. Stop, and it is just a puddle.

- **Base stats:** dmg 20 (dur 2.2, area 22)
- **Level bonuses:** Lv3: +30% area; Lv6: +50% duration; Lv9: +50% dmg
- **Combos:** **Whiplash** (+ Flagellum Flail), **Silent but Deadly** (+ Peekaboo)
- **Pairings:** **Nappy Trail** (+ Morning Sickness), **Trail Mix** (+ Nappy Mines)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Closing the Loop** | Swim a loop around enemies and everything inside it takes a massive dose. Try the ORBIT autorun. |
|  | **Sticky Residue** | The trail lasts twice as long and slows whatever swims through it. |
| Lv 8 signature | **Viral Shedding** | Anything the trail touches keeps suffering: 60% of the hit again over 3s. |
|  | **Slipstream** | Swimming through your own trail: +35% swim speed and 25% less damage taken. |
| Lv 10 mastery | **Patient Zeroes** | Two ghost carriers circle you, each shedding its own trail. |
|  | **Fever Trail** | The trail runs a fever and turns acidic: the faster you swim, the harder it corrodes (up to x2.5). |

### Heartburn

*Acid gun, Acid Spray.* A short-range spray of reflux that corrodes everything it touches. Antacids not included.

- **Base stats:** dmg 3.4, cd 0.05s, mag 50, reload 2.1s, x2, pierce all, range 200
- **Level bonuses:** Lv3: +30% area; Lv6: +30% dmg; Lv9: +1 count
- **Combos:** **Flash Point** (+ Morning Sickness)
- **Pairings:** **Indigestion Remedy** (+ Antacid), **Holy Water** (+ Premature Evangelation)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Projectile Reflux** | Narrow and long: +70% range, a tight cone and +40% damage. |
|  | **Indigestion** | Corroding enemies burst when they die, splashing their acid onto everything nearby. |
| Lv 8 signature | **Repeating On You** | The spray leaves acid puddles where it lands. |
|  | **Sour Stomach** | Corroding enemies take +50% damage from everything you own. |
| Lv 10 mastery | **Total Reflux** | Twice the spray, sweeping a full circle around you, forever. |
|  | **Slow Cooker** | It never reloads, and the damage climbs the longer you keep firing (up to x3). Cools off when idle. |

### Nappy Mines

*Acid mine, Trapper.* Drops proximity mines in your wake. Nobody wants to change them.

- **Base stats:** dmg 34, cd 0.7s, mag 5, reload 2.4s, range 600 (explode 72, life 14)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +50% dmg
- **Combos:** **Whack-a-Mole** (+ Placenta Paddle)
- **Pairings:** **Baby Monitor Network** (+ Static Cling), **Trail Mix** (+ Pub Crawl), **Bait and Switch** (+ Tooth Fairy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Wide Hips** | +35% area and +15% range. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Domino Nappies** | A blast sets off every mine near it, and each one in the chain goes off 25% bigger than the last. |
|  | **Sticky Nappies** | Mines are thrown onto enemies and stick to them, going off 1.2s later. |
| Lv 8 signature | **Pebbledash** | Every mine also fires a fan of 8 shrapnel shots at the nearest enemy when it goes off. |
|  | **Learning to Crawl** | Mines crawl after the nearest enemy instead of waiting. |
| Lv 10 mastery | **Nuclear Nappy** | Every 6th mine is a nuke: three times the blast radius and six times the damage. |
|  | **Minefield** | Three mines per drop, twice as often, and they last twice as long. |

### Antacid

*Base gun, Saponifier.* Piercing shards of antacid that lather enemies up and turn them to soap. Neutralises everything, including the mood.

- **Base stats:** dmg 15, cd 0.6s, mag 5, reload 1.5s, pierce 3, range 460
- **Level bonuses:** Lv3: +1 count; Lv6: +2 pierce; Lv9: +1 count
- **Combos:** **Clean Slate** (+ Due Date), **Soap in the Mouth** (+ Tooth Fairy)
- **Pairings:** **Indigestion Remedy** (+ Heartburn), **Plughole** (+ Toddler Gravity), **Soap Hockey** (+ Placenta Paddle), **Brainwashed** (+ Twin Telepathy)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Breaking It Off** | A shard that hits a saponified enemy bursts it for 250% damage in a cloud of suds. |
|  | **Long Engagement** | +4 pierce, and each enemy a shard passes through makes it 25% stronger. |
| Lv 8 signature | **Soft Soap** | Every 3rd shard that hits the same enemy saponifies it on the spot (not bosses). |
|  | **Confetti** | Every 3rd volley also drops 6 hailstones on enemies around the target. |
| Lv 10 mastery | **Bubble Bath** | Shards leave patches of lather behind that saponify anything that swims through. |
|  | **Soap Snap** | Every 4s a blast of lye around you saponifies every non-boss enemy within reach. |

### Static Cling

*Static chain, Chain Static.* Instant static that arcs between enemies, like a nylon onesie in winter.

- **Base stats:** dmg 13, cd 0.7s, mag 6, reload 1.8s, range 330 (chain 3, jump 140)
- **Level bonuses:** Lv3: +2 chain; Lv6: +1 count; Lv9: +2 chain
- **Combos:** **Storm in a Teacup** (+ Toddler Gravity), **Party Line** (+ Twin Telepathy)
- **Pairings:** **Baby Monitor Network** (+ Nappy Mines), **Conductive Spit** (+ Spitball), **Static Discharge** (+ Placental Siphon), **Live Wire** (+ Flagellum Flail), **Live Paperwork** (+ Red Tape)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Short Circuit** | +3 jumps, and the static can bounce back to enemies it already hit. Brutal on big targets. |
|  | **Umbilical Cord** | The first two enemies in each chain get tied together with static and slammed into each other. |
| Lv 8 signature | **Party Balloon** | Every 4th bolt leaves a ball of static on its target that zaps everything near it for 3s. |
|  | **Grounded** | Every chain earths through you: heal a little for each enemy it hit (within the lifesteal limit, doubled). |
| Lv 10 mastery | **Worked Up** | Every jump hits 20% harder than the last, instead of weaker. |
|  | **Tumble Dryer** | 15% of hits from all your other weapons set off a Static Cling chain. |

### Morning Sickness

*Ethanol lob, Area Denial.* Lobs globs of last night that leave boozy puddles. Worse before noon.

- **Base stats:** dmg 10, cd 0.9s, mag 4, reload 1.8s, range 390 (area 58, dur 3, flight 0.6)
- **Level bonuses:** Lv3: +50% duration; Lv6: +1 count; Lv9: +40% area
- **Combos:** **Flash Point** (+ Heartburn), **Sticky Situation** (+ Red Tape)
- **Pairings:** **Nappy Trail** (+ Pub Crawl), **Something Going Round** (+ Tapeworm Seeder), **Nappy Rash** (+ Thorny Onesie), **Colouring Book** (+ Colouring In), **Toil and Trouble** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Nausea** | Enemies in a puddle are slowed by 45% and deal 40% less damage. |
|  | **It's Catching** | Enemies that die in a puddle leave a new puddle behind. |
| Lv 8 signature | **Acid Wash** | Puddles strip armour: enemies standing in them lose their armour and take +25% damage from everything. |
|  | **Comes in Waves** | When a puddle dries up it erupts for 300% damage. |
| Lv 10 mastery | **All-Day Sickness** | Puddles last four times as long and slowly spread. |
|  | **Acid Reflux** | When you get hit, you throw up eight puddles in a ring around you. |

### Tapeworm Seeder

*Ethanol gun, Necromancer.* Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green.

- **Base stats:** dmg 12, cd 0.4s, mag 8, reload 1.6s, range 430 (dur 8)
- **Level bonuses:** Lv3: +1 count; Lv6: +50% duration; Lv9: +40% dmg
- **Combos:** **Worm Farm** (+ Bubble Wand)
- **Pairings:** **Family Tree** (+ Seeker Siblings), **Something Going Round** (+ Morning Sickness)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Hot Load** | +40% damage. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
| Lv 5 signature | **Up and About** | Infected corpses get back up as zombie allies for 12s instead of turrets (up to 14 at once). |
|  | **Big Worm** | Turrets last twice as long, fire 50% faster and hit twice as hard. |
| Lv 8 signature | **Eating for Two** | Your turrets and zombies hit twice as hard and last 50% longer. |
|  | **Feeding Tube** | Every infected enemy that dies heals you 1% of your max HP. |
| Lv 10 mastery | **Brood** | The infection spreads: every infected death infects the three nearest enemies. |
|  | **Adopted** | Elites killed while infected become permanent allies (three at most). |

### Seeker Siblings

*Histamine gun, Swarm.* Tiny homing siblings who swim for you and never miss. Family is complicated.

- **Base stats:** dmg 9, cd 0.45s, mag 6, reload 2s, x2, range 500 (homing 5)
- **Level bonuses:** Lv3: +1 count; Lv6: +1 count; Lv9: +40% dmg
- **Combos:** **Big Sibling** (+ Spitball)
- **Pairings:** **Family Tree** (+ Tapeworm Seeder), **Tagging Along** (+ Yo-Yo Diet), **Lost Siblings** (+ Ghosts of You)

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

*Histamine gun, Crowd Control.* A slow orb that drags everything into its mouth. Everything.

- **Base stats:** dmg 8, cd 1.8s, mag 2, reload 2.5s, pierce all, range 400 (aura 72, pull 95)
- **Level bonuses:** Lv3: +30% area; Lv6: +1 count; Lv9: +50% dmg
- **Combos:** **Storm in a Teacup** (+ Static Cling)
- **Pairings:** **Tetherball** (+ Yo-Yo Diet), **Sucker Punch** (+ Hiccup Scattergun), **Plughole** (+ Antacid)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Choking Hazard** | Non-boss enemies under 20% health that get dragged into the centre are swallowed whole. |
|  | **Nom Nom** | The orb eats enemy bullets, growing with every one (up to twice its size). |
| Lv 8 signature | **Big for Their Age** | Orbs are 60% bigger and pull twice as hard, but drift half as fast. |
|  | **Grasp Reflex** | The longer an orb holds an enemy, the harder it squeezes: up to triple damage after 2s. |
| Lv 10 mastery | **Big Bang** | When an orb ends it explodes for half of all the damage it dealt. |
|  | **Naughty Step** | The orb parks wherever it catches 4 enemies, pulls 2.5 times harder and lasts twice as long. |

### Premature Evangelation

*Histamine orbit, Bodyguard.* Guardian angels circle you and hit whatever comes close. They always start too soon.

- **Base stats:** dmg 23, reload 2.2s, x3, range 100 (dur 4.5, radius 72, spin 3.6)
- **Level bonuses:** Lv3: +1 count; Lv6: +30% area; Lv9: +1 count
- **Combos:** **Bubble Halo** (+ Bubble Wand)
- **Pairings:** **Collection Plate** (+ Placental Siphon), **Holy Water** (+ Heartburn)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Guardian Angel** | The angels eat any enemy bullet they touch. |
|  | **Eternal Vigil** | The angels never take a break, but hit 25% softer. Amen. |
| Lv 8 signature | **Smite** | Every 2.5s each angel throws a holy bolt at an enemy within reach. |
|  | **Martyrdom** | When you get hit, the angels burst out for 300% damage around you (every 2s at most). |
| Lv 10 mastery | **Heavenly Host** | A second ring of angels spins the other way at double the distance. |
|  | **Holier Than Thou** | Enemies they hit are made to feel guilty for 4s: slowed by 40% and taking +35% damage from everything. |

### Placental Siphon

*Brine siphon, Counter.* Eats enemy bullets that come near you and spits them back. No reloads. Feeds on demand.

- **Base stats:** dmg 15, cd 0.08s, mag 40, range 460 (area 90)
- **Level bonuses:** Lv3: +25% area; Lv6: +1 pierce; Lv9: +40% dmg
- **Combos:** **Fall Guy** (+ Imaginary Friend), **Gene Splice** (+ Gene Gun)
- **Pairings:** **Collection Plate** (+ Premature Evangelation), **Static Discharge** (+ Static Cling), **Gene Therapy** (+ Gene Gun)

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

*Force melee, Cleaver.* Heavy sweeping swings that knock crowds flying. Nobody asks where it came from.

- **Base stats:** dmg 34, cd 0.8s, mag 4, reload 1.1s, range 92 (area 1, arc 2.4, knock 220)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +1 count
- **Combos:** **Whack-a-Mole** (+ Nappy Mines)
- **Pairings:** **One-Two** (+ Flagellum Flail), **Soap Hockey** (+ Antacid), **Bubble Hockey** (+ Bubble Wand)

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

*Force melee, Lasher.* Your tail cracks like a whip in a long straight line. It was a weapon all along.

- **Base stats:** dmg 19, cd 0.38s, mag 6, reload 1s, range 190 (area 1, width 15, knock 60)
- **Level bonuses:** Lv3: +25% dmg; Lv6: +1 count; Lv9: +25% area
- **Combos:** **Whiplash** (+ Pub Crawl)
- **Pairings:** **One-Two** (+ Placenta Paddle), **Live Wire** (+ Static Cling), **Lashing Out** (+ Karma)

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

*Force melee, Tank.* Spikes pulse out all around you. Huggable, technically.

- **Base stats:** dmg 18, cd 0.55s, mag 8, reload 0.9s, range 90 (area 90, knock 120)
- **Level bonuses:** Lv3: +20% area; Lv6: +30% dmg; Lv9: +20% area
- **Combos:** **Porcupine Hug** (+ Hiccup Scattergun)
- **Pairings:** **Nappy Rash** (+ Morning Sickness), **Flammable Fabric** (+ Moonshine Jug)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Wide Hips** | +35% area and +15% range. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **Look, Don't Touch** | Whatever hurts you gets hurt back hard (thorns x2), plus a jab to everything around you. |
|  | **Bear Hug** | Pulses pull enemies in instead of pushing them out, and every enemy in reach gives you +1 armour (up to +6). |
| Lv 8 signature | **Prickly Heat** | Every pulse also shoots 8 spines outwards at 50% damage. |
|  | **Bed Rest** | When you slow down or stop: +4 armour and pulses come 50% faster. |
| Lv 10 mastery | **Bubble Wrap** | Every 6th pulse is huge: twice the radius, 2.5 times the damage, and it pops every enemy bullet it touches. |
|  | **Growth Spurt** | The pulse grows 10% wider for every 100 max HP you have, and heals you a little for each enemy it hits. |

### Colouring In

*Force crayon, Lasso.* Swim a loop round enemies and everything inside gets coloured in. Never inside the lines.

- **Base stats:** dmg 44, cd 2.2s, mag 3, reload 1.2s, range 600 (dur 2.6)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +40% duration; Lv9: +50% dmg
- **Combos:** **Drawn Together** (+ Imaginary Friend)
- **Pairings:** **Colouring Book** (+ Morning Sickness), **Campfire Song** (+ Duelling Banjo)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Nappy Bag** | +60% magazine size. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
| Lv 5 signature | **Scribble** | The crayon line itself hits four times as hard and slows what it touches. |
|  | **Stay Inside the Lines** | Anything you colour in is stuck where it is for 1.5s and takes +30% damage from everything. |
| Lv 8 signature | **Paint by Numbers** | The more enemies inside a shape, the harder it hits: +15% for each one (up to +150%). |
|  | **Fridge Art** | Every shape you colour in stays on the floor for 3s, hurting anything inside. |
| Lv 10 mastery | **Masterpiece** | Every 5th shape is framed: triple damage, and it wipes every enemy bullet inside it. |
|  | **Join the Dots** | Everything a shape hits becomes a dot for 2s. The dots are joined by lines that cut whatever crosses them. |

### Due Date

*Histamine duedate, Delayed Doom.* Sticks a countdown on an enemy. When it runs out, 40% of the damage it took lands again. Circled in red.

- **Base stats:** dmg 20, cd 0.9s, mag 3, reload 2s, range 480 (dur 4, repeat 0.4)
- **Level bonuses:** Lv3: +0.15 repeat; Lv6: +1 count; Lv9: +0.2 repeat
- **Combos:** **Clean Slate** (+ Antacid)
- **Pairings:** **Final Notice** (+ Red Tape), **Last Orders** (+ Moonshine Jug), **Been Here Before** (+ Déjà Vu)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
| Lv 5 signature | **Overdue** | The countdown is twice as long, and the repeat is twice as big. |
|  | **Early Delivery** | A marked enemy that drops below 30% health goes off straight away. |
| Lv 8 signature | **Baby Shower** | When a date goes off, half of it splashes onto everything nearby. |
|  | **Rebooked** | When a date goes off, the two nearest enemies get marked for free. |
| Lv 10 mastery | **Labour Day** | A date that goes off marks the same enemy again, straight away. Bosses never get a day off. |
|  | **The Big Day** | Marked enemies take +30% damage from everything you own. |

### Red Tape

*Ethanol tape, Bureaucrat.* Tapes a target to the enemies around it, so a hit on one hurts the rest (35% of it). Sign here.

- **Base stats:** dmg 18, cd 1.4s, mag 3, reload 2s, range 420 (chain 3, jump 170, dur 5, share 0.35)
- **Level bonuses:** Lv3: +1 chain; Lv6: +0.1 share; Lv9: +2 chain
- **Combos:** **Sticky Situation** (+ Morning Sickness)
- **Pairings:** **Final Notice** (+ Due Date), **Live Paperwork** (+ Static Cling)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **In Triplicate** | Every bundle tapes 3 more enemies together. |
|  | **Joint Liability** | When a taped enemy dies, the rest of its bundle takes 30% of its max health. |
| Lv 8 signature | **Stapled** | Bundles are pulled together tight and slowed by 40%. |
|  | **Redacted** | Taped enemies cannot shoot. |
| Lv 10 mastery | **Bureaucracy** | Bundles share 70% of every hit instead of 35%. |
|  | **Referred Elsewhere** | When a bundle runs out, the four enemies nearest to it are taped up for free. |

### Imaginary Friend

*Histamine friend, Echo.* Its name is Gerald. Gerald is very real. Gerald has your weapons.

- **Base stats:** dmg 24, cd 0.7s, mag 6, reload 1.4s, range 230 (delay 2, copy 0.35)
- **Level bonuses:** Lv3: +0.1 copy; Lv6: +1 count; Lv9: +0.1 copy
- **Combos:** **Drawn Together** (+ Colouring In), **Fall Guy** (+ Placental Siphon)
- **Pairings:** **He Went That Way** (+ Peekaboo)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hot Load** | +40% damage. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
| Lv 5 signature | **Sharing Is Caring** | Your friend's copies hit 35% harder. |
|  | **It Was Them** | Your friend soaks up any enemy bullet it swims into. |
| Lv 8 signature | **Long Memory** | Your friend swims four seconds behind you instead of two, and hits 30% harder. |
|  | **Playdate** | Swimming into your friend heals you 4% of your max health (every 6s at most). |
| Lv 10 mastery | **Too Real** | Your friend is solid: it bowls through enemies, and its copies hit 35% harder. |
|  | **Secret Club** | One more friend, further behind. |

### Peekaboo

*Base peek, Trickster.* You vanish. Enemies swarm the empty spot, then BOO. The science is three years old.

- **Base stats:** dmg 20, cd 5.5s, mag 1, reload 0.1s, range 420 (dur 1.8, area 230)
- **Level bonuses:** Lv3: +25% duration; Lv6: +25% area; Lv9: +50% dmg
- **Combos:** **Silent but Deadly** (+ Pub Crawl)
- **Pairings:** **He Went That Way** (+ Imaginary Friend), **Who You Gonna Call** (+ Ghosts of You), **Shotgun Surprise** (+ Shotgun Wedding)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sharp Tongue** | +15% crit chance. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Wide Hips** | +35% area and +15% range. |
| Lv 5 signature | **Hide and Seek** | While hidden you swim 40% faster. |
|  | **Jump Scare** | BOO scares enemies stiff for 1.2s instead of scaring them off (not bosses). |
| Lv 8 signature | **Who's There?** | While you are hidden, enemy bullets hit other enemies three times as hard. |
|  | **Decoy Doll** | A doll stays where you vanished for 4s. Enemies keep attacking it, and it bursts for BOO damage at the end. |
| Lv 10 mastery | **Object Permanence** | You stay hidden twice as long. |
|  | **Big Boo** | BOO reaches everything on screen, and the scare lasts twice as long. |

### Twin Telepathy

*Static twin, Geometry.* A beam joins you and your twin across the crowd. You both think "zap".

- **Base stats:** dmg 24, cd 1.6s, mag 3, reload 2s, range 520 (area 90, width 10)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +1 count; Lv9: +30% area
- **Combos:** **Party Line** (+ Static Cling)
- **Pairings:** **Brainwashed** (+ Antacid), **Mind the Gap** (+ Gene Gun)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Wide Hips** | +35% area and +15% range. |
|  | **Hot Load** | +40% damage. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
| Lv 5 signature | **Joined at the Hip** | The beam is twice as wide and lathers what it touches. |
|  | **Switcheroo** | Every 6s you swap places with your twin, cutting everything along the way. |
| Lv 8 signature | **Sympathetic Pain** | When you get hurt, your twin's end erupts for 300% damage (every 1.5s at most). |
|  | **Same Wavelength** | The beam wipes out any enemy bullet that crosses it. |
| Lv 10 mastery | **Quadruplets** | Two more twins, each with its own beam fanning out through the crowd. |
|  | **Psychic Link** | Every pulse also hits everything along the beam for 200% damage. |

### Bubble Wand

*Peroxide bubble, Trap & Throw.* Traps small enemies in bubbles that slow them to a crawl. Anything that touches one pops it, blasting everything nearby. Do not drink the mix.

- **Base stats:** dmg 18, cd 1.1s, mag 4, reload 2s, range 380 (dur 5, hold 34)
- **Level bonuses:** Lv3: +1 count, thicker bubbles (each holds 4 more times the wand's damage before it pops, and adds what it soaked to the pop); Lv6: +40% dmg, thicker bubbles (each holds 4 more times the wand's damage before it pops, and adds what it soaked to the pop); Lv9: +1 count, rainbow pops (each pop takes a random damage type)
- **Combos:** **Worm Farm** (+ Tapeworm Seeder), **Bubble Halo** (+ Premature Evangelation)
- **Pairings:** **Bubble Hockey** (+ Placenta Paddle), **Toil and Trouble** (+ Morning Sickness), **Bubble Band** (+ Duelling Banjo)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Extra Soapy** | Bubbles hold enemies twice the size, elites included. |
|  | **Bubble Bath** | The soap sticks: everything caught in a pop is slowed by half and can't shoot for 3s. Every pop also leaves a soapy patch that slows enemies by 40%. |
| Lv 8 signature | **Cannonball** | A pop launches the enemy inside away from whatever popped it. It bowls through its friends and explodes where it lands. |
|  | **Chain Pop** | A pop's blast pops every other bubble it reaches, one after another. |
| Lv 10 mastery | **Hamster Ball** | Trapped enemies roll fast at the nearest other enemy and pop on it. |
|  | **Cotton Wool** | Every 8s you are wrapped in a bubble that blocks the next 3 hits. |

### Tooth Fairy

*Histamine tooth, Lure.* Drops baby teeth near the crowd and smites whoever takes one. She collects debts.

- **Base stats:** dmg 34, cd 1.1s, mag 3, reload 2s, range 420 (dur 6, lure 230)
- **Level bonuses:** Lv3: +1 count; Lv6: +40% dmg; Lv9: +60 lure
- **Combos:** **Soap in the Mouth** (+ Antacid)
- **Pairings:** **Bait and Switch** (+ Nappy Mines), **A Tooth for a Tooth** (+ Karma)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Gold Tooth** | Every 4th tooth is gold: it lures from twice as far, and whoever takes it is smitten along with everything near them. |
|  | **Wisdom Teeth** | Teeth lure from 60% further and last twice as long. |
| Lv 8 signature | **Under the Pillow** | A tooth nobody takes within 4s turns into a big XP coin. |
|  | **Dentures** | Teeth bite anything that comes close, for 50% damage every half second. |
| Lv 10 mastery | **Fairy Ring** | Every smite also hits everything within 140 of the victim for 50%. |
|  | **Tooth Decay** | Enemies holding teeth take +12% damage from everything for each tooth. |

### Déjà Vu

*Histamine gun, Repeater.* Every shot happens twice. The second time, it is a memory.

- **Base stats:** dmg 20, cd 0.8s, mag 6, reload 1.3s, pierce 1, range 420 (replay 1)
- **Level bonuses:** Lv3: +25% dmg; Lv6: +1 count; Lv9: +2 pierce
- **Combos:** **Haunting Memory** (+ Ghosts of You), **Karmic Loop** (+ Karma)
- **Pairings:** **Been Here Before** (+ Due Date), **Seen It Before** (+ Spitball)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Hot Load** | +40% damage. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
| Lv 5 signature | **Third Time Lucky** | Every memory replays once more, at 70% damage. |
|  | **Premonition** | The replay arrives sooner (0.5s), flies 50% faster and pierces 2 more enemies. |
| Lv 8 | **Sugar Rush** | +75% damage. |
|  | **Magnetic Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
|  | **Plus One** | +1 projectile (shots share the damage). |
| Lv 10 mastery | **Groundhog Day** | Memories keep replaying, each at 60% of the last, until they fade (up to four times). |
|  | **Same Dream** | Replays fire from wherever you are now, at the nearest enemy, at full damage. |

### Ghosts of You

*Base gun, Haunter.* The ones who came before you never really left.

- **Base stats:** dmg 15, cd 1.1s, mag 4, reload 1.6s, range 460 (homing 6)
- **Level bonuses:** Lv3: +30% dmg; Lv6: +1 count; Lv9: +40% dmg
- **Combos:** **Haunting Memory** (+ Déjà Vu)
- **Pairings:** **Who You Gonna Call** (+ Peekaboo), **Lost Siblings** (+ Seeker Siblings)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Nappy Bag** | +60% magazine size. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Sour Note** | Hits corrode enemies for 25% of the hit per second. |
| Lv 5 signature | **Unfinished Business** | An enemy killed by a ghost leaves two ghosts behind. |
|  | **Gave Me the Creeps** | Ghosts lather what they hit: 40% slower for 1.5s. |
| Lv 8 | **Homing Instinct** | Shots home in on targets. |
|  | **Soap Queen** | 12% of hits saponify non-boss enemies. |
|  | **One for the Road** | Hits add a round of Ethanol. |
| Lv 10 mastery | **We Are Legion** | Store twice as many ghosts, and every volley sends two extra. |
|  | **Family Reunion** | Every ghost that hits heals you 0.4% of your max HP. |

### Karma

*Force ring, Payback.* Every hit you take comes back around. With interest.

- **Base stats:** dmg 18, cd 1.6s, mag 3, reload 1.8s, x10, pierce 2, range 240
- **Level bonuses:** Lv3: +4 count; Lv6: +40% dmg; Lv9: +2 pierce
- **Combos:** **Karmic Loop** (+ Déjà Vu)
- **Pairings:** **A Tooth for a Tooth** (+ Tooth Fairy), **Lashing Out** (+ Flagellum Flail)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Nappy Bag** | +60% magazine size. |
|  | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Hot Load** | +40% damage. |
| Lv 5 signature | **Instant Karma** | Getting hit fires a ring straight back at once (every 1.5s at most). |
|  | **Good Karma** | Kills near you charge Karma too, not just hits you take. |
| Lv 8 | **Kick Them While Down** | +60% damage to enemies under 35% health. |
|  | **Due Date Panic** | 40% faster cooldown and reload. |
|  | **Rubbed the Wrong Way** | 30% of hits arc to a nearby enemy for 50% damage. |
| Lv 10 mastery | **Wheel of Life** | Every ring is followed by a second, turned half a step, 0.25s later. |
|  | **Nirvana** | A fully charged ring also heals you 8% of your max HP. |

### Gene Gun

*Histamine gun, Splicer.* Precision gene therapy, delivered at speed. Side effects include exploding.

- **Base stats:** dmg 11.5, cd 0.5s, mag 8, reload 1.3s, pierce 1, range 480
- **Level bonuses:** Lv3: +30% dmg; Lv6: +1 count; Lv9: +2 pierce
- **Combos:** **Gene Splice** (+ Placental Siphon)
- **Pairings:** **Mind the Gap** (+ Twin Telepathy), **Gene Therapy** (+ Placental Siphon)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
|  | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
| Lv 5 signature | **Triple Helix** | A third strand, with a third damage type. Edits need any two strands to land. |
|  | **CRISPR** | Edits are cleaner: edited enemies take +60% damage (not +30%) for 4s, and the edit burst is twice as big. |
| Lv 8 | **Bloodsucker** | Hits heal you a little (within the lifesteal limit). |
|  | **Sugar Rush** | +75% damage. |
|  | **Plus One** | +1 projectile (shots share the damage). |
| Lv 10 mastery | **Chimera** | Every strand carries two damage types at once and applies both. |
|  | **Recombination** | A strand that kills splits into a fresh helix aimed at the nearest enemy (once per strand). |

### Shotgun Wedding

*Force gun, Brawler.* Something old, something new, something double-barrelled.

- **Base stats:** dmg 6, cd 0.55s, mag 2, reload 1.3s, x7, range 300 (knock 90, bounce 1)
- **Level bonuses:** Lv3: +2 count; Lv6: +30% dmg; Lv9: +2 count
- **Combos:** **Hoedown Throwdown** (+ Duelling Banjo), **Shotgun Shine** (+ Moonshine Jug)
- **Pairings:** **Shotgun Reception** (+ Hiccup Scattergun), **Shotgun Surprise** (+ Peekaboo)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Trampoline Rounds** | Shots bounce to 2 more targets. |
|  | **Sharp Tongue** | +15% crit chance. |
| Lv 5 signature | **Throwing Rice** | Every blast also scatters a ring of 8 grains of rice all around you at 40% damage. |
|  | **Both Barrels, Always** | Every blast is both barrels: double the pellets, but 30% slower to fire. |
| Lv 8 | **Soap Queen** | 12% of hits saponify non-boss enemies. |
|  | **Special Delivery** | Hits explode for 35% damage around the target. |
|  | **Magnetic Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
| Lv 10 mastery | **The Reception** | Every fourth blast fires a full ring of pellets all around you as well. |
|  | **Elope** | Every reload, you dash forward and nothing can hurt you for half a second. |

### Moonshine Jug

*Ethanol lob, Firebomber.* Grandpappy's recipe. Do not drink. Do not stand near.

- **Base stats:** dmg 15, cd 1.2s, mag 3, reload 2s, range 380 (area 70, explode 1, dur 2.4, flight 0.65)
- **Level bonuses:** Lv3: +50% duration; Lv6: +1 count; Lv9: +35% area
- **Combos:** **Shotgun Shine** (+ Shotgun Wedding)
- **Pairings:** **Flammable Fabric** (+ Thorny Onesie), **Last Orders** (+ Due Date)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Wide Hips** | +35% area and +15% range. |
|  | **Nappy Bag** | +60% magazine size. |
| Lv 5 signature | **200 Proof** | Puddles last 50% longer and spread 25% wider. |
|  | **Backyard Still** | Every third jug lands as three jugs. |
| Lv 8 | **Magnetic Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |
|  | **Giant Killer** | +150% damage to elites, bosses and rival champions. |
|  | **Twins!** | +2 projectiles (shots share the damage). |
| Lv 10 mastery | **Every Batch Is Bad** | Every jug is a bad batch. |
|  | **Hooch Hour** | Standing in your own puddles heals you 2% of your max HP a second. You are used to it. |

### Duelling Banjo

*Static ring, Ring.* Only knows one song. Plays it with feeling.

- **Base stats:** dmg 12, cd 1.3s, mag 3, reload 1.6s, x10, pierce 2, range 240
- **Level bonuses:** Lv3: +4 count; Lv6: +40% dmg; Lv9: +2 pierce
- **Combos:** **Hoedown Throwdown** (+ Shotgun Wedding)
- **Pairings:** **Campfire Song** (+ Colouring In), **Bubble Band** (+ Bubble Wand)

| Level | Choice | Effect |
|---|---|---|
| Lv 3 | **Hair Trigger** | 25% faster cooldown and reload. |
|  | **Sharp Tongue** | +15% crit chance. |
|  | **Pointy Head** | Shots pierce 2 more enemies. |
| Lv 5 signature | **Fingerpicking** | +6 notes in every ring. |
|  | **Duelling** | Every ring is answered a moment later by a second ring: from your Sister-Cousin if she is out, otherwise from you. |
| Lv 8 | **Sugar Rush** | +75% damage. |
|  | **Rubbed the Wrong Way** | 30% of hits arc to a nearby enemy for 50% damage. |
|  | **Plus One** | +1 projectile (shots share the damage). |
| Lv 10 mastery | **Hoedown** | Low notes knock enemies back hard and leave them dazed for a moment. |
|  | **Bluegrass Encore** | Every third ring plays both notes at once. |

### Upgrades with a twist

When an upgrade would do nothing for a weapon, that weapon does its own thing with it instead (the card tells you).

| Upgrade | Weapon | What it does instead |
|---|---|---|
| Spoilers | Placenta Paddle | some swings also land on a second enemy further away. |
| Spoilers | Flagellum Flail | some lashes also crack across a second enemy further away. |
| Spoilers | Pub Crawl | the shot is you. Every few seconds you blink straight through an enemy, cutting the line. |
| Spoilers | Nappy Mines | some mines appear already under an enemy. |
| Spoilers | Morning Sickness | some globs land before you throw them. |
| Spoilers | Static Cling | some bolts start from the far side of the crowd. |
| Spoilers | Premature Evangelation | angels pop up next to enemies to bless them early. |
| Spoilers | Placental Siphon | some returned shots appear right next to their target. |
| Split Personality | Toddler Gravity | more orbs, which pull together and merge into bigger ones (twenty merged go supernova). |
| Split Personality | Pub Crawl | a bigger, longer blade (+18% width and length per stack). |
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
| Pushy | Pub Crawl | the trail shoves enemies aside. |
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
| Personal Space | Antacid | bigger shards. |
| Personal Space | Seeker Siblings | bigger siblings. |
| Personal Space | Tapeworm Seeder | bigger worms. |
| Twitchy Tail | Pub Crawl | the trail hits faster. |
| Twitchy Tail | Premature Evangelation | angels circle faster. |
| Short Refractory Period | Pub Crawl | the trail lingers longer. |
| Bigger Load | Pub Crawl | a wider trail. |
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
| Tunnel Vision | Pub Crawl | the trail hits harder the longer you keep swimming fast. |
| Tunnel Vision | Premature Evangelation | angels hit harder the longer they stay on shift. |
| Hair Trigger | Pub Crawl | Pub Crawl has no cooldown, so its trail hits 33% harder instead. |

## Weapon combos

Both weapons at Lv 5+: a COMBO card is guaranteed in your next box. Both keep firing, gain the power below, and the first 2 combos a run open a bonus weapon mount with a draft.

| Combo | Weapons | Sequence | Power |
|---|---|---|---|
| **Big Sibling** | Spitball + Seeker Siblings | Firstborn | Every 5th Spitball volley also launches a huge homing Big Sibling that explodes on impact. |
| **Swapping Spit** | Spitball + Yo-Yo Diet | Firstborn | Yo-yos spit Spitballs at whatever is near them while they fly. |
| **Whack-a-Mole** | Placenta Paddle + Nappy Mines | Chonker | Paddle hits plant a Nappy Mine under the enemy, armed almost at once. |
| **Porcupine Hug** | Thorny Onesie + Hiccup Scattergun | Chonker | Every Onesie pulse fires a ring of Scattergun pellets outwards. |
| **Storm in a Teacup** | Toddler Gravity + Static Cling | Bright Spark | Gravity orbs crackle: each one throws a Static Cling chain at what it is pulling in. |
| **Party Line** | Twin Telepathy + Static Cling | Bright Spark | Every second, each twin sends a Static Cling chain into the crowd. |
| **Clean Slate** | Due Date + Antacid | Favourite | When a Due Date goes off, everything near it is saponified and takes a burst of antacid. |
| **Soap in the Mouth** | Tooth Fairy + Antacid | Favourite | Tooth Fairy smites saponify their victim. A saponified victim takes double. |
| **Whiplash** | Flagellum Flail + Pub Crawl | Quiet One | Every lash leaves a strip of viral trail along its length. |
| **Silent but Deadly** | Peekaboo + Pub Crawl | Quiet One | While you are hidden, your viral trail hits 2.5x as hard. The BOO leaves a ring of it round the spot. |
| **Worm Farm** | Bubble Wand + Tapeworm Seeder | Good Eater | Anything trapped in a bubble catches Tapeworm. Bubble pops hit infected enemies 50% harder. |
| **Bubble Halo** | Premature Evangelation + Bubble Wand | Good Eater | Your angels blow bubbles at small enemies near them. |
| **Flash Point** | Morning Sickness + Heartburn | Problem Child | Heartburn reacts with your puddles: each one in range erupts in an acid burst every second. |
| **Sticky Situation** | Red Tape + Morning Sickness | Problem Child | Taped bundles drip: a boozy puddle forms under each one every second. |
| **Drawn Together** | Colouring In + Imaginary Friend | Designer Baby | Every 3s, the shape between you and your Imaginary Friend is coloured in. |
| **Fall Guy** | Imaginary Friend + Placental Siphon | Designer Baby | Your Imaginary Friend catches enemy bullets and feeds them to the Siphon. |
| **Haunting Memory** | Déjà Vu + Ghosts of You | Prawn Again | One Deja Vu hit in four leaves a ghost behind for Ghosts of You. |
| **Karmic Loop** | Karma + Déjà Vu | Prawn Again | Every Karma ring happens again a second later, at 70%. |
| **Hoedown Throwdown** | Shotgun Wedding + Duelling Banjo | Redtail | Every Both Barrels blast also plays a ring of low notes. |
| **Shotgun Shine** | Moonshine Jug + Shotgun Wedding | Redtail | Shotgun Wedding pellets pour enemies a round of Ethanol, and hit drunk enemies 50% harder. |
| **Gene Splice** | Gene Gun + Placental Siphon | Designer Baby | Every 10 bullets the Siphon eats fires a free Gene Gun helix at the nearest enemy. |

## Pairings (secret combos)

Own both weapons at Lv 5+ and the pairing switches on. In the game they stay hidden (???) until you find them once.

| Pairing | Weapons | Effect |
|---|---|---|
| **Baby Monitor Network** | Static Cling + Nappy Mines | Static jumping through a crowd sets off any Nappy Mine near its path. |
| **Indigestion Remedy** | Heartburn + Antacid | Neutralised reactions have no cooldown and hit twice as hard. |
| **Tetherball** | Yo-Yo Diet + Toddler Gravity | Yo-yos drag enemies back towards you on every throw. |
| **Family Tree** | Seeker Siblings + Tapeworm Seeder | Tapeworm turrets fire homing Seeker Siblings. |
| **Collection Plate** | Placental Siphon + Premature Evangelation | The angels catch enemy bullets and feed them into the Siphon. |
| **Nappy Trail** | Pub Crawl + Morning Sickness | Your viral trail is extra strong: it hits 50% harder. |
| **Conductive Spit** | Spitball + Static Cling | Spat-on enemies are wet: static deals double damage to them. |
| **Sucker Punch** | Hiccup Scattergun + Toddler Gravity | Enemies caught in a gravity orb take double damage from the Scattergun. |
| **Plughole** | Antacid + Toddler Gravity | Gravity orbs lather everything they hold and saponify it. |
| **Holy Water** | Premature Evangelation + Heartburn | The angels drip acid. Everything they touch corrodes. |
| **Tagging Along** | Seeker Siblings + Yo-Yo Diet | Every yo-yo hit launches a Seeker Sibling. |
| **Something Going Round** | Tapeworm Seeder + Morning Sickness | Anything that dies in a puddle was infected all along. |
| **Static Discharge** | Static Cling + Placental Siphon | Every 12 bullets the Siphon eats fires a Static Cling chain at four enemies. |
| **Trail Mix** | Pub Crawl + Nappy Mines | Your viral trail drops a Nappy Mine every 1.5s. |
| **One-Two** | Flagellum Flail + Placenta Paddle | Enemies the Flail has lashed take double damage from the Paddle for 2s. |
| **Live Wire** | Flagellum Flail + Static Cling | The tip of every lash sets off a Static Cling chain. |
| **Nappy Rash** | Thorny Onesie + Morning Sickness | Every Onesie pulse adds a round of Ethanol to what it hits. |
| **Soap Hockey** | Placenta Paddle + Antacid | The Paddle hits saponified enemies three times as hard. |
| **Final Notice** | Due Date + Red Tape | When a Due Date goes off on a taped enemy, the whole bundle takes all of it, not just a share. |
| **Live Paperwork** | Red Tape + Static Cling | Static that hits a taped enemy is shared through the bundle twice over. |
| **He Went That Way** | Imaginary Friend + Peekaboo | While you are hidden, enemies chase your Imaginary Friend instead of the empty spot. |
| **Bubble Hockey** | Bubble Wand + Placenta Paddle | When the Paddle pops a bubble, the enemy inside flies off the way it swung and bowls through its friends. |
| **Bait and Switch** | Tooth Fairy + Nappy Mines | Every tooth has a Nappy Mine under it. |
| **Colouring Book** | Colouring In + Morning Sickness | Every shape you colour in fills with a boozy puddle. |
| **Brainwashed** | Twin Telepathy + Antacid | Anything that stays in the telepathy beam for a second saponifies. |
| **Toil and Trouble** | Bubble Wand + Morning Sickness | Every pop leaves a boozy puddle. |
| **Shotgun Reception** | Hiccup Scattergun + Shotgun Wedding | Enemies the Hiccup Scattergun hits take 35% more from Shotgun Wedding for 2s. |
| **Flammable Fabric** | Thorny Onesie + Moonshine Jug | Drunk enemies the Thorny Onesie has pricked burst into a puddle of moonshine when they die. |
| **Campfire Song** | Colouring In + Duelling Banjo | Enemies touched by the crayon line take 40% more from Duelling Banjo notes for 2s. |
| **Last Orders** | Due Date + Moonshine Jug | Moonshine hits enemies with a Due Date 40% harder. |
| **Who You Gonna Call** | Peekaboo + Ghosts of You | Every enemy a BOO! hits adds a ghost to Ghosts of You. |
| **Mind the Gap** | Twin Telepathy + Gene Gun | Enemies in the telepathy beam take 30% more from the Gene Gun. |
| **A Tooth for a Tooth** | Tooth Fairy + Karma | Karma hits enemies carrying teeth 35% harder. |
| **Been Here Before** | Déjà Vu + Due Date | Every Deja Vu hit on a marked enemy adds a quarter of itself to its Due Date. |
| **Lost Siblings** | Ghosts of You + Seeker Siblings | Every kill by Seeker Siblings adds a ghost to Ghosts of You. |
| **Lashing Out** | Karma + Flagellum Flail | Enemies the Flail has lashed take 35% more from Karma for 2s. |
| **Gene Therapy** | Gene Gun + Placental Siphon | Every Gene Edit heals you 1% of your max HP. |
| **Seen It Before** | Déjà Vu + Spitball | Enemies a Spitball has hit take 40% more from Deja Vu for 2s. |
| **Shotgun Surprise** | Shotgun Wedding + Peekaboo | Enemies a BOO! has hit take 40% more from Shotgun Wedding for 2s. |
| **Bubble Band** | Duelling Banjo + Bubble Wand | Duelling Banjo notes hit bubbled enemies 50% harder. |

## Bosses and relics

A boss arrives every 1.75 minutes of game time, four in all. Each run draws 4 of these 9 at random; a fifth (a tougher repeat) waits until the Fever Pitch. Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.

In a race (Standard Issue) the bosses come in softer, in run order: health x0.2, x0.35, x0.5, x0.7 and attack strength x0.5, x0.65, x0.8, x0.95. Everything there also hits you for 50% of its listed damage.

### THE MACROPHAGE QUEEN: Eater of Hopefuls

> "Oh good. Dessert swam in."

A white blood cell who ate her way to the top. She summons swarms, then swallows them to heal. Base HP 2600, armour 2, speed 46.

- **Strengths:** Devours her own minions to heal; Summons swarms of swimmers.
- **Weaknesses:** Acid: +60% damage; Slow: kite her and clear the snacks.

| Trophy | Effect |
|---|---|
| **Second Stomach** | +60% max HP, and every kill heals 1 HP. Eat everything. |
| **Swallow Whole** | Touching a small, ordinary enemy swallows it whole instead of hurting you, and heals you 3 HP. |
| **The Queen's Court** | Three loyal macrophage guards follow you and fight for you. A fallen guard returns 15s later. |

### THE ANTIBODY COLOSSUS: Head of Border Control

> "Papers. Now. No, those are not papers. Those are bullets."

A Y-shaped wall of protein. Heavily armoured, cannot be moved or saponified, and charges in straight lines. Base HP 3800, armour 12, speed 36.

- **Strengths:** 12 armour: small hits barely scratch it; Cannot be knocked back or saponified.
- **Weaknesses:** Static: +60% damage; Armour shred sticks for longer; Charges are telegraphed: side-step.

| Trophy | Effect |
|---|---|
| **Border Wall** | +10 armour and +40% max HP, but you swim 10% slower. |
| **Bouncer** | Enemies that touch you are hurled away and take ten times their own contact damage. You take 40% less from them. |
| **Diplomatic Immunity** | Every 5s, a shield blocks the next hit completely. |

### THE IMMUNE EYE: Unblinking Critic of Your Genome

> "I've read your genome. I've seen better genomes on a crouton."

It teleports next to you, then glares: a beam that follows you around. While it glares, it cannot blink. Base HP 3400, armour 4, speed 52.

- **Strengths:** Teleports right next to you; Death-stare beam that tracks you.
- **Weaknesses:** Takes double damage while glaring; Histamine: +50% damage.

| Trophy | Effect |
|---|---|
| **Third Eye** | +25% crit chance and crits deal +100% more damage. |
| **Death Stare** | Every 4s you glare at the toughest enemy on screen with a beam of your own for 1.5s. |
| **Mother's Intuition** | +25% dodge. Every dodge sends out a pulse that wipes nearby enemy bullets. |

### THE MATRON: Head of Ward Nine

> "Visiting hours are over. Forever."

Runs the ward with an iron bedpan. Heals every enemy on screen and hides behind a ring of nurses. Base HP 3000, armour 3, speed 40.

- **Strengths:** Heals every enemy nearby on her rounds; Nurse cells orbit her and soak your shots.
- **Weaknesses:** Ethanol: +60%, and halves her healing (she never touches the stuff); Kill her nurses: she panics and takes +50%.

| Trophy | Effect |
|---|---|
| **Bedside Manner** | Regenerate 1.5% of your max HP every second. |
| **Triage** | Dropping below 25% HP heals you to 70% and makes you untouchable for 2s. Once every 45s. |
| **Transfusion** | Every hit you land heals you a little, and your lifesteal limit is three times higher. |

### THE PEPSINATOR: Acid Reflux Incarnate

> "Everything dissolves eventually. You're just early."

A blob of stomach acid with ambitions. Rains acid puddles and splits off smaller blobs when hurt. Base HP 3600, armour 0, speed 44.

- **Strengths:** Acid puddles eat into you; Acid only does half damage to it; Splits off blobs at 60% and 30% health.
- **Weaknesses:** Base: +60% damage (an antacid); Blasts and pools: +40% damage.

| Trophy | Effect |
|---|---|
| **Acid Tongue** | Every hit shreds armour and adds a round of Ethanol. |
| **Bad Blood** | When you are hit, you splash acid around you for ten times the damage you took. |
| **Ulcer** | Enemies you kill leave acid puddles that dissolve their friends. |

### CHAD PRIME: Tail Day, Every Day

> "Bro. Bro. You swim like a sneeze."

The biggest swimmer anyone has ever seen. Dashes through you three times, then has to catch his breath. Base HP 3000, armour 5, speed 95.

- **Strengths:** Blindingly fast triple dash; Flexes: dodges 30% of your shots.
- **Weaknesses:** Winded after every dash: stunned, double damage; Blasts, beams and pools never miss him.

| Trophy | Effect |
|---|---|
| **Pre-Workout** | +35% swim speed, and every weapon hits up to 50% harder while you swim fast. |
| **Tail Whip** | Your tail becomes a weapon: it lashes everything behind you twice a second. |
| **Flying Start** | Every 5s you surge forward, untouchable for a moment, leaving a shockwave behind you. |

### THE FEVER: Pyrogen Prime, 41 Degrees

> "Is it hot in here, or is it me? It's me. It's always me."

A walking temperature spike. Rings of heat, scalding ground, and it runs hotter and faster as it dies. Base HP 3200, armour 2, speed 48.

- **Strengths:** Immune to Acid: sweats it straight off; Rages below 35% health: twice as fast.
- **Weaknesses:** Base: double damage; Saponifying it snuffs out its current attack.

| Trophy | Effect |
|---|---|
| **Running Hot** | Every weapon you own corrodes what it hits. |
| **Fever Dream** | Every corroding enemy near you makes all your weapons fire 3% faster (up to +60%). |
| **Heatstroke** | Corroding enemies explode when they die, spreading the acid. |

### MITCH & OSIS: The Mitosis Twins

> "We finish each other's... ...swimmers."

Identical twins who fight as one. Kill one and the other rebuilds it in 8 seconds, unless you finish both. Base HP 1900 each, armour 2, speed 58.

- **Strengths:** Revive each other; Crossfire from two sides.
- **Weaknesses:** Finish both within 8 seconds; Blasts hit both when they huddle: +30%.

| Trophy | Effect |
|---|---|
| **Mirror Twin** | Every shot-firing weapon also fires a twin shot backwards at 50% damage. |
| **Double Trouble** | +1 projectile, +1 pierce and +1 chain jump for every weapon. |
| **Seconds** | From now on, every DNA strand pickup lets you take two cards instead of one. |

### THE PHANTOM PREGNANCY: Expecting Nothing

> "Boo. Sorry. Habit."

A pregnancy that was never really there. It drifts straight through walls and growths, and Force passes through it as if it were mist. The womb itself still hurts it. Base HP 3000, armour 0, speed 50.

- **Strengths:** Immune to Force damage; Swims through obstacles.
- **Weaknesses:** Histamine: +50% damage; Terrain still hurts it: Acid Crypts, cilia and ATP bursts.

| Trophy | Effect |
|---|---|
| **See-Through** | +20% dodge. Half the bullets that should hit you go straight through. |
| **Poltergeist** | Every 3s the nearest enemy is picked up and thrown at the toughest one nearby. Both take a beating. |
| **Ectoplasm** | Bullets sometimes pass straight through you: +15% dodge. |

## Run events

From level 6 (and about 70 seconds in), something unexpected happens every 55 to 75 seconds: never during a boss fight, the Final Five or the swim to the egg. From level 40 events turn **DIRE**: they come every 35 to 50 seconds, hit harder, pay out more, and 30% of the time two arrive at once. Run-event targets (the Golden Swimmer and bounties) get an arrow on screen, and every weapon and the autorun go after them first.

| Event | Lasts | Normal | Dire |
|---|---|---|---|
| **FEEDING FRENZY** | 25s | Everything swims 40% faster. +30% XP. | Everything swims 70% faster. +30% XP. |
| **GLASS WOMB** | 25s | You deal and take x2 damage. | You deal and take x2.5 damage. |
| **SUGAR RUSH** | 20s | You swim 60% faster, ram x3, contact hurts half as much. | You swim 60% faster, ram x3, contact hurts half as much. So do they: enemies 30% faster. |
| **WITCHING HOUR** | 20s | Shooters fire x2 as often. Survive: heal 30% and +1 reroll. | Shooters fire x2.6 as often. Survive: heal 30% and +2 rerolls. |
| **KIDNEY STONE SHOWER** | 20s | Stones rain down. They crush everything they land on, you included. | Stones rain down. They crush everything they land on, you included. |
| **SOFT PLAY** | 20s | Surrounded. Survive 20s for a strand of Donor DNA. | Surrounded. Survive 20s for two strands of Donor DNA. |
| **GOLDEN SWIMMER** | 20s | A golden sperm is running off with a DNA strand. Catch it within 20s. | A golden sperm is running off with two DNA strands. Catch it within 20s. |
| **TAGGED SPECIMEN** | 60s | The lab tagged a specimen and it got loose. Kill it within 60s: a DNA strand and 2 rerolls. | The lab tagged a specimen and it got loose. Kill it within 60s: two DNA strands and 2 rerolls. |
| **LIGHTS OUT** | 25s | Someone switched off the microscope lamp. +30% XP. | Someone switched off the microscope lamp. +30% XP. Elites are out hunting. |
| **WATERS BREAKING** (Lv 25+) | 20s | A strong current sweeps everything one way. Swim with it and you ram for free. | A strong current sweeps everything one way. Swim with it and you ram for free. |
| **IDENTICAL TWINS** (Lv 40+) | 20s | Everything that dies splits in two (the halves give no XP). | Everything that dies splits in two (the halves give no XP). |

## Feats

Feats (what used to be spells) cast themselves and use the two Feat slots. The attacking ones (Stork Drop, Power Shower, Brainstorm, Sofa Crevice, Running With Scissors, Dutch Oven) are paid for from your stamina instead of waiting on a cooldown; the rest keep cooldowns. They level up like weapons, and at Lv 4 each one asks you to choose one of two paths (below).

| Feat | Damage type | What it does | Base stats | Level bonuses |
|---|---|---|---|---|
| **Stork Drop** | Acid | A stork drops something heavy on the target and leaves acid on the ground. Not a baby. | dmg 65, cd 5s, count 1, area 88, delay 0.7s, dur 2s | Lv3: +1 count; Lv5: +30% area; Lv7: +1 count |
| **Power Shower** | Base | A soapy blast around you. Erases enemy bullets, and enthusiasm. | dmg 22, cd 7s, area 165 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 25% faster |
| **Brainstorm** | Static | Static strikes several targets at once. None of the ideas are good. | dmg 36, cd 6s, count 5, area 48 | Lv3: +2 count; Lv5: +40% dmg; Lv7: +3 count |
| **Sofa Crevice** | Histamine | Tears open a singularity that drags and crushes. Everything you ever lost is in there. | dmg 16, cd 10s, area 125, dur 3s, pull 210 | Lv3: +30% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Kiss It Better** | Ethanol | Restores 15% of your health. Medically dubious. | heals 15% HP, cd 14s | Lv3: 15% faster; Lv5: +50% healing; Lv7: 20% faster |
| **Nap Time** | Histamine | Slows every enemy and bullet to a crawl. Over too soon. | cd 16s, dur 3s | Lv3: +30% duration; Lv5: 20% faster; Lv7: +40% duration |
| **Latex Barrier** | Histamine | A shield that reflects enemy bullets and blocks contact. 98% effective. | dmg 12, cd 12s, dur 3s, area 80 | Lv3: +35% duration; Lv5: +30% area; Lv7: 25% faster |
| **Running With Scissors** | Force | Explodes a ring of blades outward. You were told. | dmg 19, cd 6s, count 16, speed 460, pierce 3, size 6 | Lv3: +8 count; Lv5: +3 pierce; Lv7: +50% dmg |
| **Dutch Oven** | Ethanol | A drifting cloud of stacking Ethanol fumes. You know what you did. | dmg 11, cd 9s, area 115, dur 5s | Lv3: +40% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Baby Monitor** | Static | Deploys a turret that watches and shoots. Static included. | dmg 9, cd 13s, count 1, dur 10s, rate 0.25 | Lv3: +30% duration; Lv5: +1 count; Lv7: +50% dmg |
| **Out of Body** | Histamine | You slip out of your body for a moment: nothing can touch you, you swim faster, and anything you pass through takes damage. Your body waits where you left it. | dmg 24, cd 13s, dur 2.2s | Lv3: +30% duration; Lv5: +50% dmg; Lv7: 20% faster |

### Feat paths (Lv 4)

| Feat | Path A | Path B |
|---|---|---|
| **Stork Drop** | **Double Delivery**: One more stork every cast, each dropping 80% as hard. | **Hot Water Bottle**: The acid it leaves on the ground is 40% wider and lasts twice as long. |
| **Power Shower** | **Soap Bath**: Everything it catches stays saponified twice as long. | **Power Shower**: A second blast goes off a second later, wherever you are by then. |
| **Brainstorm** | **Brainwave**: Every strike jumps on to the two nearest enemies for half its damage. | **Thunderclap**: Every strike leaves the enemies it hits dazed for a second (not bosses). |
| **Sofa Crevice** | **Down the Back**: It pulls twice as hard. | **Loose Change**: When it closes, it spits everything out in a blast worth four seconds of its damage. |
| **Kiss It Better** | **Plaster**: You also get 1.5s in which nothing can hurt you. | **Kiss Chase**: The kiss also blasts nearby enemies for one and a half times what it heals. |
| **Nap Time** | **Lie-In**: Time stays slow 50% longer. | **Power Nap**: You heal 3% of your max HP every second while time is slowed. |
| **Latex Barrier** | **Extra Large**: The barrier is 50% wider. | **Ribbed**: Whatever touches the barrier, or is hit by what it bounces back, takes 2.5 times the damage. |
| **Running With Scissors** | **Safety Scissors**: The blades fly out and come back, cutting everything twice. | **Pinking Shears**: Four more blades in every ring. |
| **Dutch Oven** | **Lingering Smell**: The cloud lasts twice as long. | **Hotbox**: The cloud follows you around. |
| **Baby Monitor** | **Night Light**: Turrets shoot twice as fast. | **Twin Pack**: One more turret every cast. |
| **Out of Body** | **Astral Projection**: You stay out of your body 60% longer. | **Poltergeist**: When you snap back, your body bursts, blasting everything near it for four times the touch damage. |

## Power-ups (passives)

Stat boosts that stack. Value shown is per pick at Common rarity.

**Tunes one weapon** means the card goes on one weapon you choose (each weapon has its own max stacks), unless it is Legendary or better, which tunes every weapon.

| Power-up | Per pick | Applies to | Max stacks |
|---|---|---|---|
| **Protein Shake** | +12% damage | You | 8 |
| **Twitchy Tail** | +10% fire rate | Tunes one weapon | 8 per weapon |
| **Short Refractory Period** | +15% reload speed | Tunes one weapon | 6 per weapon |
| **Bigger Load** | +20% magazine size | Tunes one weapon | 6 per weapon |
| **Split Personality** | +1 projectile (shots share the damage: about +25% on a one-shot weapon, less on weapons that already fire several; more hits for on-hit effects) (Epic or better only) | Tunes one weapon | 2 per weapon |
| **Early Arrival** | +12% projectile speed and range | Tunes one weapon | 5 per weapon |
| **Personal Space** | +12% area of effect | Tunes one weapon | 6 per weapon |
| **Staying Power** | +15% effect duration | Tunes one weapon | 5 per weapon |
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
| **Hot-Blooded** | +25% Acid damage and corrosion | You | 5 |
| **Alkaline Diet** | +25% Base damage and lather | You | 5 |
| **Static Hair** | +25% Static damage, +1 chain | You | 5 |
| **Hip Flask** | +25% Ethanol damage, +3 max rounds | You | 5 |
| **Pins and Needles** | +25% Histamine damage | You | 5 |
| **Headbutt Training** | +25% Force damage | You | 5 |
| **Big Lungs** | +25 max stamina (sprint longer, cast more Feats) | You | 3 |
| **Second Wind** | Stamina refills 30% faster | You | 3 |
| **Cardio** | Sprinting costs 25% less stamina and is 10% faster | You | 2 |
| **Muscle Memory** | Stamina Feats cost 20% less | You | 2 |
| **Cocktail Hour** | Hits deal +12% damage for every different chemical already on the target | You | 3 |
| **Chain Reaction** | 25% chance that a reaction sets off the same reaction in a nearby enemy carrying any chemical | You | 3 |
| **Mixologist** | Against enemies already carrying 2 or more chemicals, your chemicals go on +50% stronger | You | 3 |
| **Chemistry** | +35% chemical reaction damage | You | 5 |
| **Repeat Prescription** | -10% Feat cooldowns | You | 5 |
| **Antenatal Classes** | +12% experience gained | You | 5 |
| **Snooze Button** | +1 max Rewind charge, +25% Body Clock energy (Rare or better only) | You | 3 |
| **Last Word** | Last bullet of every magazine deals x4 damage and explodes | You | 3 |
| **Tactical Nap** | Starting a reload sends out a shockwave that deletes nearby bullets (+40 radius) | You | 4 |
| **Tunnel Vision** | +3% damage per second on the same target, up to +30% more | You | 3 |
| **Overachiever** | 50% of excess kill damage jumps to the next enemy | You | 3 |
| **Pincer Movement** | Weapons sharing a target: +15% damage. Three or more weapons all on different targets: +15% fire rate | You | 3 |
| **Hurry Up** | Up to +22% damage the faster you are moving | You | 4 |
| **Separation Anxiety** | Near the egg: +12% fire rate. Away from it: +12% crit chance | You | 3 |
| **Spoilers** | 10% of shots appear already next to their target (with the Pub Crawl, you do) | You | 4 |
| **Inheritance** | When you Rewind, the you that got erased stays behind as a ghost (a Paradox Echo) that retraces your last few seconds firing your weapons. With this, those ghosts cast your Feats too and last twice as long (Rare or better only) | You | 1 |
| **Headstrong** | Enemies you swim into take big damage (ram power x1.0). It grows with your level, max HP and armour. At full speed it sends out a shockwave and their contact hurts 40% less. Try HUNT autorun. | You | 5 |
| **Big Boned** | +30 max HP (and heal it). All your damage +4% for every 100 max HP you have. | You | 4 |
| **Prickly Personality** | Whatever hurts you gets hurt back (thorns x1), plus a smaller jab to everything around you. Grows with max HP and armour. | You | 4 |
| **Stubborn Streak** | Below half health: take 10% less damage and deal 12% more. | You | 3 |
| **Wriggle Room** | +4% chance to dodge hits | You | 5 |
| **Bank Shot** | Shots that bounce off a Cartilage Nodule hit 50% harder for the rest of their flight | You | 2 |
| **Batteries Included** | ATP bursts from Mitochondria hit 50% harder and 25% wider, and the Mitochondria fill 25% faster | You | 2 |
| **Cast-Iron Stomach** | Acid Crypts no longer hurt you, and corrode enemies twice as hard | You | 2 |
| **Brush-Off** | Cilia Beds sting everything they shove | You | 2 |
| **Go With the Flow** | In a Tubal Current: +30% damage and +20% swim speed | You | 2 |
| **Skid Marks** | On a Lubricant Slick you swim 40% faster and leave a boozy trail | You | 2 |
| **Old Soul** | +10% experience and +5% damage | You | 5 |
| **Muscle Memory** | +8% fire rate and reload speed | You | 5 |
| **Nine Lives** | +5% dodge and +10 max HP | You | 3 |
| **Homebrew** | +8% fire rate and +8% damage, -2% swim speed | You | 4 |
| **Thick as Thieves** | +2 armour and +6% luck | You | 3 |

## Junk DNA (Lateral Gene Transfer)

One power per enemy type (offspring such as Daughter Cells carry their parent's). Values are per stack; up to 3 stacks. Shots and blasts scale with your level and damage. Bosses, rivals and allies never carry junk DNA. In the Petri Dish, carriers only turn up while a wave is on.

| Enemy | Power | Effect (1 stack) | Effect (3 stacks) |
|---|---|---|---|
| Also-Ran | **Safety in Numbers** | +1% damage for each enemy within 250, up to +10% | +1% damage for each enemy within 250, up to +30% |
| Sprinter | **Quick Off the Mark** | +6% swim speed | +18% swim speed |
| Antibody | **Spit Take** | every 3s, spit a shot at the nearest enemy | every 3s, spit 3 shots at the nearest enemy |
| Krill | **Darting** | +4% dodge | +12% dodge |
| Macrophage | **Thick Skin** | +2 armour | +6 armour |
| Amoeba | **Second Helpings** | each kill heals 1 HP (up to 3 HP/s) | each kill heals 3 HP (up to 9 HP/s) |
| Paramecium | **Cilia** | sprint stamina recovers 15% faster | sprint stamina recovers 45% faster |
| Mitotic Cell | **Cell Division** | 10% of weapon hits fling 2 shards off the target | 30% of weapon hits fling 2 shards off the target |
| Spermlet Swarm | **Swarm Mind** | +8% area | +24% area |
| Acid Bubble | **Heartburn** | kills have a 10% chance to burst in a small Acid blast | kills have a 30% chance to burst in a small Acid blast |
| Quantum Swimmer | **Now You See Me** | every 15s, the next hit misses (you blink aside) | every 7s, the next hit misses (you blink aside) |
| Rotifer | **Light-Fingered** | +20% pickup range | +60% pickup range |
| Nurse Cell | **Bedside Manner** | +0.6 HP/s regeneration | +1.8 HP/s regeneration |
| Headbutter | **Hard Head** | enemies you swim into take a headbutt (+0.4 Headstrong) | enemies you swim into take a headbutt (+1.2 Headstrong) |
| Pinworm | **Wriggle Through** | shots pierce 1 more enemy | shots pierce 3 more enemies |
| Mucus Wall | **Phlegm** | 10% less damage from enemy shots | 30% less damage from enemy shots |
| Volvox | **Colony** | +8% XP | +24% XP |
| Cytokine Caster | **Inflamed** | every 6s, a ring of 6 small shots bursts out of you | every 6s, a ring of 18 small shots bursts out of you |
| Diatom | **Glass Case** | the first hit every 10s is halved | the first hit every 6s is halved |
| Natural Killer | **Licence to Kill** | +4% crit chance | +12% crit chance |
| Ghost Swimmer | **Ghosting** | +0.25s of invulnerability after you are hit | +0.75s of invulnerability after you are hit |
| Brood Cyst | **Clutch** | kills have an 8% chance to release a broodling that homes in and pops | kills have an 24% chance to release a broodling that homes in and pops |
| Mother Cell | **Broody** | every 20s, a friendly spermlet fights beside you for 10s | every 20s, 3 friendly spermlets fight beside you for 10s |
| Planarian | **Regrowth** | +1.5 HP/s regeneration below 50% HP | +4.5 HP/s regeneration below 50% HP |
| Enzyme Spire | **Rooted** | stay still for 1s: +15% fire rate until you move | stay still for 1s: +45% fire rate until you move |
| Plasmodium | **Big-Boned** | +10% max HP | +30% max HP |
| Killer T-Cell | **Long Shot** | +20% damage to enemies more than 350 away | +60% damage to enemies more than 350 away |
| Water Bear | **Hard to Kill** | +4 armour below 30% HP | +12 armour below 30% HP |
| Alpha Swimmer | **Alpha** | +8% damage | +24% damage |
| Booster | **Booster Shot** | +8% fire rate | +24% fire rate |

## Mutations

From skipping a sequence splice, and from stashes hidden in campaign levels: pick one of four. 6 slots (more with the Gene Bank's Well-Incubated). Tier 0 are common, tier 2 rare.

| Mutation | Tier | Effect |
|---|---|---|
| **Borrowed Jaw** | 0 | Weapons +10% damage and +5% crit chance. Feats -10% damage. The owner has stopped asking. |
| **Fussy Eater** | 0 | +2 rerolls right now and +10% luck. Sends everything back. |
| **Ants in Your Pants** | 0 | +5% dodge chance, +2.5% swim speed. Cannot sit still. |
| **Thumb Sucker** | 0 | +2 HP/s regeneration, but -15% max HP. The dentist disapproves. |
| **Sticky Fingers** | 0 | +30% pickup range. |
| **Runs in the Family** | 0 | +5% swim speed, and you hit up to 15% harder the faster you swim. |
| **Little Magpie** | 0 | +30% pickup range, and picking up any power-up pulls in every XP granule near you. |
| **Soft Spot** | 0 | Force hits have a 4% chance to stun what they hit (1% on bosses, briefly). Everyone has one. |
| **Strong Bones** | 0 | +1 max HP for every 15 kills (elites count as 5), up to +100. Milk helps. |
| **Sweet Tooth** | 0 | Glucose Hits heal three times as much, and all healing is 20% stronger. |
| **Spoilt Rotten** | 0 | Power-ups drop from enemies twice as often. |
| **Non-Slip Socks** | 0 | +10% swim speed and +30% traction. |
| **Trapped Wind** | 0 | Drunk enemies leave a cloud of Ethanol fumes when they die. Better out than in. |
| **Contagious Lather** | 0 | Saponified enemies lather everything near them. |
| **Highly Strung** | 0 | Static +30%, Ethanol -20%. |
| **Gold Star** | 0 | +10% XP. |
| **Short Attention Span** | 0 | Every Feat cast has a 15% chance to recharge twice as fast. |
| **Runny Nose** | 0 | Ethanol +30%, Static -20%. |
| **Past Bedtime** | 0 | Timed power-ups last twice as long. |
| **Showing Off** | 0 | Every elite or boss that dies near you: +5% damage for 10s, stacking 5 times. |
| **Do-Over** | 0 | The first reroll on every card screen is free. |
| **Salt in the Wound** | 0 | +20% crit chance against enemies that are lathered, saponified, drunk or corroding. |
| **Eat Your Greens** | 0 | +5% fire rate, and Feats recharge 5% faster. |
| **Soft Hands** | 0 | Base +30%, Acid -20%. Washes up nicely. |
| **Sour Face** | 0 | Acid +30%, Base -20%. |
| **Runner's High** | 0 | +2 HP/s regeneration while you swim fast. |
| **E Numbers** | 0 | Killing an elite: 3s of +25% fire rate. The blue ones are worst. |
| **Surprise Package** | 0 | Absorbing junk DNA blows everything near you away. |
| **Snot Trail** | 0 | +5% swim speed, Ethanol +5%. |
| **Stiff as a Board** | 0 | +10% dodge chance, -20% swim speed. |
| **Biting Phase** | 0 | Hits heal you a little (within the lifesteal limit). It is just a phase. |
| **Teacher's Pet** | 0 | Weapons and Feats -5% damage. +25% XP. |
| **Bookworm** | 0 | Feats +15% damage. Weapons -10% damage. |
| **Bursts Into Tears** | 1 | Get hit and you burst: a blast hits everything near you and shoves it away. |
| **Hollow Legs** | 1 | +1 HP/s regeneration for every 200 max HP you have. |
| **Chip on the Shoulder** | 1 | +30% damage to elites, bosses and rival champions. |
| **Screen Time** | 1 | Stay still and it builds: up to +30% damage after 3s. Swimming wears it off. |
| **Heavy-Handed** | 1 | +1% crit chance for every 100 max HP you have. |
| **Sticker Chart** | 1 | Killing a boss: 6s of +25% fire rate, and your Feats recharge 25% faster. |
| **Lucky Dip** | 1 | +20% luck, so your DNA strands come out rarer. |
| **Mood Swings** | 1 | Acid, Base and Static +40%. Force, Ethanol and Histamine -10%. |
| **Middle Child** | 1 | Alone (nothing within 250): +15% swim speed. In a crowd (8 or more): +3 armour. Anything in between: +10% damage. Adapts. |
| **Character Building** | 1 | Every hit you take: +1 max HP (up to +150), and +1 armour for every 50 hits. |
| **Double Yolk** | 1 | Every mutation box has a 30% chance to let you take two mutations. |
| **First Word** | 1 | Your Feats always crit on enemies at full health, and crits hit 25% harder. |
| **Pass the Parcel** | 1 | Charged enemies pass a jolt to a neighbour every second. |
| **Flare-Up** | 1 | Corroding enemies can burst (about 1 in 10 each second) in a small acid blast. |
| **Backed Up** | 1 | Weapons with a magazine bigger than 1 hold twice as much. |
| **Magic Cream** | 1 | Heals you fully now, +40 max HP, and every 5th Glucose Hit heals you fully. Fixes everything. |
| **Overexcited** | 1 | Every crit gives +0.5% fire rate for 2s (up to +25%). |
| **One in Each Hand** | 1 | Every timed power-up also gives you another random one. +20% pickup range. |
| **Too Many Sweets** | 1 | A Glucose Hit picked up at full health: +50% damage for 20s. |
| **Attention Seeker** | 1 | Getting hit instantly reloads a random weapon and recharges a random Feat (every 2s at most). |
| **Keeping It a Surprise** | 1 | Hidden until you take it. |
| **Rough and Tumble** | 1 | Force +40%. Acid, Base and Static -10%. |
| **Finders Keepers** | 1 | Rerolls have a 35% chance not to be used up. +5% luck. |
| **First Dibs** | 2 | Weapon hits on enemies at full health always crit. |
| **Small but Mighty** | 2 | Double damage. Half max HP. |
| **Dropped as a Baby** | 2 | Once, when you would die, you come back on 50% health. After that: -50% max HP for the rest of the run. Never quite the same. |
| **Five More Minutes** | 2 | A hit that would burst you leaves you on 1 HP instead. Once every 90s. |
| **Fair's Fair** | 2 | Every damage type at normal strength or weaker gets +25%. Any already boosted loses 10%. |

## Mythical and Immaculate bonuses

A Mythical or Immaculate card carries one of these on top of its own effect, for the rest of the run (three at most a run).

| Bonus | Rarity | Effect |
|---|---|---|
| **Second Wind** | Mythical | Every 40th kill sends you into OXYTOCIN for 5s (double fire rate, no reloads) and heals 10%. |
| **Act of God** | Mythical | Every 3s, a bolt of static strikes the toughest enemy on screen for 8% of its max HP (4% on bosses, 6% on the Final Five). |
| **Second Coming** | Mythical | The first time you would die, you come back at full health. Unplanned. |
| **Growth Hormone** | Mythical | +50% max HP (and heal it), and +2 Headstrong. You are the weapon now. |
| **Bottomless Pit** | Mythical | A small black hole circles you for the rest of the run, dragging enemies in and crushing them. |
| **Full Technicolour** | Mythical | Everything goes full colour for the rest of the run: you, them, the bullets, the slide, the HUD. Also +10% damage. |
| **Tantric** | Mythical | When you drop below 30% health, time slows for 4s (every 20s at most). Breathe. |
| **Gender Reveal** | Immaculate | Every 12s a blast fills the screen: every enemy takes 18% of its max HP (4% on bosses, 6% on the Final Five) and every enemy bullet is wiped. Everyone finds out. |
| **Hand of God** | Immaculate | Every 5s, the three toughest enemies on screen are smitten for 15% of their max HP (4% on bosses, 6% on the Final Five). |
| **In Quick Succession** | Immaculate | Every weapon you own fires 60% faster. Forever. |
| **State of Grace** | Immaculate | Every 15s: 2s of invulnerability and a 15% heal. |
| **Twinkle, Twinkle** | Immaculate | Stars fall on enemies near you, one every 0.4s, each for three times your best weapon's damage. |

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
| **Lathered Up** | Hits lather: enemies slow by 35% for 1.5s. |
| **Sour Note** | Hits corrode enemies for 25% of the hit per second. |

## Modifiers

Slot into one weapon (3 per weapon). Power by rarity: Common x1, Uncommon x1.12, Rare x1.25, Epic x1.6, Legendary x2.2, Mythical x2.6, Immaculate x3. Values below are at Common. "Projectile only" means guns and other shot-firing weapons.

| Modifier | Effect (Common) | Effect (Legendary) | Fits |
|---|---|---|---|
| **Homing Instinct** | Shots hunt down targets (turn rate 5.0) | Shots hunt down targets (turn rate 7.4) | Projectile only |
| **Cell Division** | On first hit, shots split into 3 shards at 30% damage | On first hit, shots split into 4 shards at 30% damage | Projectile only |
| **Holding Pattern** | Shots circle you for 1.2s, eating enemy bullets, then launch | Shots circle you for 2.6s, eating enemy bullets, then launch | Projectile only |
| **Swelling** | Shots swell in flight: triple size and up to +100% damage | Shots swell in flight: triple size and up to +220% damage | Projectile only |
| **Boomerang Kid** | Shots fly out and come back, hitting everything twice | Shots fly out and come back, hitting everything twice (+42% damage on the way back) | Projectile only |
| **Bouncing Baby** | +2 bounces between enemies | +3 bounces between enemies | Projectile only |
| **Soaped Up** | 18% chance per hit to saponify the target | 40% chance per hit to saponify the target | Any weapon |
| **With a Bang** | Hits explode for 30% damage in a small blast | Hits explode for 66% damage in a small blast | Any weapon |
| **Bad Influence** | 5% chance per hit to make a germ fight for you for 6s (max 6 allies) | 11% chance per hit to make a germ fight for you for 13s (max 6 allies) | Any weapon |
| **Switched at Birth** | Converts this weapon to a new damage type | Converts this weapon to a new damage type, +18% damage | Any weapon |
| **Going to Pieces** | Kills burst into 3 shards at 30% damage | Kills burst into 4 shards at 42% damage | Any weapon |
| **Daisy Chain** | 25% of hits chain to another enemy for 50% damage | 55% of hits chain to another enemy for 50% damage | Any weapon |
| **Contractions** | Shots pulse every 0.6s, hitting everything close by for 15% damage | Shots pulse every 0.6s, hitting everything close by for 33% damage | Projectile only |
| **Animal Magnetism** | Shots drag germs within 70 units into their path | Shots drag germs within 154 units into their path | Projectile only |
| **Delayed Gratification** | Shots hang for a moment, then launch 60% faster for +30% damage | Shots hang for a moment, then launch 60% faster for +66% damage | Projectile only |
| **Both Ends** | Every shot has a twin fired the opposite way at 35% damage | Every shot has a twin fired the opposite way at 77% damage | Projectile only |
| **Trash Talk** | Kills give this weapon +6% damage (up to 10 stacks). Getting hit loses the lot | Kills give this weapon +13% damage (up to 10 stacks). Getting hit loses the lot | Any weapon |
| **Passive Aggressive** | 2s after a hit, the target takes another 40% of it. As per your last email | 2s after a hit, the target takes another 88% of it. As per your last email | Any weapon |
| **Participation Trophy** | Every 10th hit deals 300% damage and drops a little XP. Everyone is a winner | Every 10th hit deals 420% damage and drops a little XP. Everyone is a winner | Any weapon |
| **Inheritance** | Kills pass 25% of the victim's max HP to the nearest enemy as damage. Next of kin | Kills pass 55% of the victim's max HP to the nearest enemy as damage. Next of kin | Any weapon |
| **Separation Anxiety** | +50% damage to anything within 150 of you, -20% beyond 450. Do not leave | +110% damage to anything within 150 of you, -20% beyond 450. Do not leave | Any weapon |
| **Snitch** | 20% of hits grass the target up: every weapon deals +30% to it for 3s | 44% of hits grass the target up: every weapon deals +30% to it for 3s | Any weapon |

## Duo combos

| Combo | Modifiers | Bonus |
|---|---|---|
| **Follow the Leader** | Homing Instinct + Cell Division | Split shards home in too. |
| **Bath Bomb** | Soaped Up + With a Bang | Explosions saponify whatever they hit. |
| **Halo** | Holding Pattern + Contractions | Pulses come twice as often and hit twice as hard. |
| **Snowball** | Boomerang Kid + Swelling | Shots grow twice as much on the way out and back. |
| **Bouncing Off the Walls** | Bouncing Baby + Daisy Chain | Chains jump to 3 targets. |
| **Pied Piper** | Bad Influence + Animal Magnetism | Mind-controlled allies last twice as long. |
| **Kaleidoscope** | Both Ends + Cell Division | Mirrored twins split into twice as many shards. |
| **Biological Clock** | Delayed Gratification + With a Bang | Delayed shots explode as they launch. |
| **Sore Winner** | Trash Talk + Participation Trophy | Trophy hits add two Trash Talk stacks, and say so. |
| **Office Politics** | Passive Aggressive + Snitch | Passive-aggressive follow-ups always grass the target up, and spread to one neighbour. |

## Stains

The slide starts in greyscale, your own swimmer included. Colour comes back two ways.

**Stain grants** are permanent: each turns up once ever, floating on the slide for you to swim into, and is on in every run after that (the pause menu switches any off). Not in campaign levels.

| Grant | When | What it colours |
|---|---|---|
| **Acridine Orange** | Floats by the egg, your first game (until you take it) | You, your echoes and your allies, in your own colour |
| **Tracer Dye** | Level 5, once you have Acridine Orange | Your shots and weapon effects, and every damage type in its own colour |
| **Gentian Violet** | Level 10, once you have Tracer Dye | Power-up pickups and their effects |

**Stain cards** turn up in DNA strands: each colours one more thing for that run and brings a boon. (Stains kept on older versions stay on; a kept GFP Tag became the first two grants.)

| Stain | Boon | What it colours |
|---|---|---|
| **Anti-Immune Stain** | +8% dodge. You see it coming. | Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings. Also shows a health ring round every hurt enemy (and an armour ring when its armour has been stripped). |
| **Luciferase** | +20% luck, and +25% damage to elites and bosses. You know what is worth chasing. | The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas. |
| **Motility Dye** | +8% swim speed, and +30% damage to fast enemies. You spot them early. | Fast swimmers (sprinters, spermlets, krill, paramecia) take up the dye and turn cyan, so you can see what is about to reach you. |
| **Rival Dyes** | +40% damage to rival champions and the Final Five. Know your enemy. | Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board, with a health ring round any rival you have hurt. |
| **H&E Stain Kit** | +30% pickup range and +1 reroll. Everything is easier to spot. | Haematoxylin and eosin, the classic. Stains the rest of the slide: chemical effects in their own colours (Acid green, Base blue, Static yellow, Ethanol amber, Histamine violet) and your midpiece in your weapon-type colour. |

## Cursed cards

| Curse | Boon | Bane |
|---|---|---|
| **Smoker's Cough** | +20% damage for everything | -40 max stamina, and it refills 25% slower |
| **Couch Potato** | +30% max HP (and heal it) | Sprinting costs twice the stamina |
| **Delicate Condition** | +80% damage for everything | Max HP halved |
| **Shotgun Wedding** | +50% fire rate | Enemy bullets 20% faster |
| **Hands Full** | +4 rerolls right now, double funding | Pickup range halved |
| **The More the Merrier** | +50% XP and funding | 30% more enemies (30% bigger waves in the dish) |
| **Living in the Past** | +2 max Rewind charges, all refilled now | All healing halved |
| **Clothing Optional** | +25% move speed, +20% dodge | Armour is zero, forever, and every hit hurts 15% more |

## Field pickups (temporary power-ups)

Dropped by kills and elites. Timed ones show a countdown chip.

| Pickup | Letter | Effect |
|---|---|---|
| **MAGNET** | M | All XP flies to you |
| **NIT COMB** | N | Obliterates nearby enemies |
| **OXYTOCIN** | O | For 12s double fire rate, no reloads. Then 6s of Post-Nut Clarity: slower fire, but +40% crit chance |
| **GLUCOSE HIT** | + | Restore 50% HP |
| **STAIR GATE** | S | Invulnerable for 7.5s |
| **MUSICAL STATUES** | F | The music stops: every enemy stands stock still for 6s (bosses 2s) |
| **DNA STRAND** | ? | Free upgrade |
| **HIRED HELP** | H | Three bodyguard swimmers fight for you for 21s |
| **CENTRIFUGE** | C | For 9s everything near you is flung round you in a grinding vortex |
| **GROWING PAINS** | G | For 12s you are huge: you crush what you touch and take half damage |
| **KNOCK-ON EFFECT** | K | For 15s every kill explodes |
| **REFLUX** | R | For 10s bullets near you are swallowed and spat back as sparks |
| **GOLD RUSH** | $ | For 18s double XP, and XP flies to you |
| **LEECH** | L | For 15s your hits heal you |
| **BOLT FROM THE BLUE** | B | For 12s bolts of static strike enemies on screen twice a second |
| **BREAKING WIND** | W | For 12s you swim 60% faster and leave an acid wake |
| **CARDBOARD CUTOUT** | D | For 10s a life-size cardboard you stands where you were. Everything attacks it. It does not mind |
| **IDLE GOSSIP** | T | For 12s a rumour spreads: cells near you turn on each other |
| **CONGA LINE** | P | For 15s everything you kill joins a conga line behind you. The line hurts |
| **HICCUPS** | U | For 12s you hiccup: a little jump forward and a shockwave, every 1.3s |
| **PAPERWORK** | E | For 10s every enemy must fill in a form first: 60% slower (bosses 25%) |
| **LIFE INSURANCE** | I | For 30s one fatal hit is covered. You wake up on 40% HP and a small payout. Excess applies |
| **THE HOST SNEEZES** | A | Everything is flung across the slide and enemy bullets are wiped. Bless you |
| **TAX REFUND** | £ | Overpaid damage, returned as XP. Nobody knows how it was calculated |

## Stamina

One bar of 60 (shown as a thin ring inside your health ring). In manual control, hold the stick right at its edge for a moment (or hold Shift) to sprint: 55% faster, burning 30 stamina a second. Run dry and you are winded until it is back to 30%. Stamina refills at 14 a second after a short pause. The attacking Feats cost stamina (9 per second of their old cooldown, never more than 90% of a full bar), so sprinting and casting share it. Upgrades: Big Lungs (+25 max), Second Wind (refills 30% faster), Cardio (sprinting cheaper and faster), Muscle Memory (Feats cheaper). Curses: Smoker's Cough and Couch Potato.

## Sequence evolutions

Your Primary Sequence evolves at Lv 5, 10, 20 and 50.

| Sequence | Lv 5 | Lv 10 | Lv 20 | Lv 50 |
|---|---|---|---|---|
| Firstborn | **Sibling Rivalry**: +8% damage. | **Teacher's Pet**: +10% fire rate. | **Head Boy**: +1 projectile for every weapon. | **Heir Apparent**: +25% damage and +15% swim speed. |
| Chonker | **Second Helping**: +20% max HP. | **Big Boned**: +3 armour. | **Belly Flop**: +1 Headstrong: enemies you swim into take a beating. | **Absolute Unit**: +40% max HP and +5 armour. |
| Bright Spark | **Extra Homework**: +15% XP. | **Overclocked**: +12% fire rate. | **Big Brain**: Reactions hit 25% harder, and +1 chain jump. | **Galaxy Brain**: +40% damage with every chemical. |
| Favourite | **Gold Star**: +8% crit chance. | **Mummy's Favourite**: Crits hit 40% harder. | **Golden Child**: +25% luck and +1 pierce. | **The Chosen One**: +15% crit chance, and crits hit 100% harder. |
| Quiet One | **Wallflower**: +6% dodge. | **Light Feet**: +10% swim speed. | **Nobody Saw Anything**: +8% dodge and +10% crit chance. | **Urban Legend**: +10% dodge, and crits hit 75% harder. |
| Good Eater | **Growth Spurt**: Regenerate 0.5 HP a second. | **Eats Everything**: +2% lifesteal. | **Healthy Appetite**: +25% max HP, and heal to full. | **Bottomless Pit**: Healing works 50% better, and regenerate 2 HP a second. |
| Problem Child | **Terrible Twos**: +25% Acid damage. | **Tantrum**: +15% area. | **Teenage Phase**: Effects last 25% longer, and +15% damage with every chemical. | **Menace to Society**: +30% damage. |
| Designer Baby | **Gifted and Talented**: +15% XP. | **Private Tutor**: +20% luck. | **Lab Grown**: Reactions hit 40% harder. | **Perfect Specimen**: +30% damage with every chemical and +15% damage. |
| Old Soul | **Deja Vu**: The Rewind meter fills 25% faster. | **Been Here Before**: +30% pickup range. | **Past Lives**: Echoes inherit one more of your upgrades. | **Enlightened**: +20% damage and +20% fire rate. |
| Redtail | **Lucky Horseshoe**: +15% luck. | **Farm Strong**: +15% max HP. | **Family Gun**: +1 projectile for every weapon. | **Head of the Family**: +50% luck and +20% damage. |

## Damage types

Every weapon and Feat has one. Switched at Birth changes it.

| Damage type | Status it leaves | What it does |
|---|---|---|
| **Force** | shoved | Plain physics. Knocks things about, and knocks over anything drunk or saponified. |
| **Acid** | corroding | Low pH. Corrodes: damage over time that eats a little armour as it goes. |
| **Base** | lathered | High pH. Lathers enemies (slower, and they slide further when hit), then saponifies them: turned to soap, stuck solid. |
| **Static** | charged | Charges enemies: some of the damage they take arcs to a neighbour and drags it closer (static cling). |
| **Ethanol** | drunk | Gets enemies drunk: stacking damage over time, and they weave about. Enough rounds and they black out. |
| **Peroxide** | fizzing | An oxidiser. Every Peroxide hit adds bubbles: a fizzing enemy loses a little armour, and when the fizzing stops the bubbles pop in a small blast that grows with every hit. |
| **Brine** | pickled | Salt water. Pickled enemies shrivel: they swim 15% slower, hit you 25% softer, and conduct Static twice as well. |
| **Histamine** | swollen | Makes enemies swell up: they take more from everything. When a swollen enemy dies the swelling passes to the nearest one. |

## Chemical reactions

| Reaction | Trigger and effect |
|---|---|
| **NEUTRALISED** | Acid meets Base (either way round): both cancel out in a hot burst that hits everything nearby, and the salt water heals you 1% of your max HP. pH 7. Refreshing. |
| **BATTERY** | Acid meets Static (either way round): the enemy becomes a battery for 2s, zapping two neighbours every half second. You get CHARGED UP: +12% fire rate for 3s. |
| **PEAR DROPS** | Acid on a drunk enemy: it makes an ester and smells of pear drops. Everything nearby is drawn in for a sniff. |
| **FLASHPOINT** | Static on a drunk enemy (2+ rounds): the fumes go up. Every round of Ethanol in it explodes at once. |
| **ELECTROLYSIS** | Static on a lathered enemy: splits it into hydrogen. Armour stripped, and a small pop. |
| **SANITISED** | Base on a drunk enemy: hand sanitiser. Kills 99.9% of germs: every ordinary enemy nearby on 12% health or less dies outright. |
| **HIVES** | Histamine on any status: bonus damage, and it breaks out: its status copies onto two neighbours, which swell up too. |
| **SUDS** | Force on a saponified enemy: the soap bursts, and the suds hit everything near it. |
| **PUSHOVER** | Force on a drunk enemy (3+ rounds): it falls over. Knocked flat for 1.2s and flies twice as far. |
| **BLEACHED** | Peroxide meets Acid (either way round): all its armour is stripped for 4s, and its corrosion burns twice as hard. |
| **ELEPHANT TOOTHPASTE** | Peroxide meets Base (either way round): a column of foam erupts, lathering and shoving everything nearby. |
| **ROCKET FUEL** | Peroxide meets Ethanol (either way round): the enemy is launched away from you and explodes where it lands. |
| **OZONE** | Peroxide meets Static (either way round): static jumps to three neighbours and sets them fizzing. |
| **ANTIHISTAMINE** | Peroxide meets Histamine (either way round): the swelling is burned out of it in one hit (15% of its health; 6% on bosses). |
| **ELECTROLYTE** | Brine meets Static (either way round): the charge runs through the salt water to four neighbours, charging them all. |
| **SALT IN THE WOUND** | Brine meets Acid (either way round): its corrosion does double damage for the rest of the dose. |
| **MARGARITA** | Brine meets Ethanol (either way round): a salted rim. It nods off for 2.5s, and so do the drunks around it. |
| **SALT CRUST** | Brine meets Base (either way round): it crusts over and saponifies on the spot (not bosses), and takes +20% for 4s. |
| **SEA FOAM** | Peroxide meets Brine (either way round): the bubbles all pop at once, twice as hard, in a wide ring. |
| **BLACKOUT** | An enemy topped up to its Ethanol limit passes out for 2s, and wakes up hungover: +25% damage taken for 5s. |

## Combo twists

A combo whose two weapons are on their usual damage types does what its card says. Change either weapon's damage type (Switched at Birth) and the combo also picks up the twist for its new pair of damage types. The twist fires on every hit the combo itself deals, and on about 1 in 8 of either weapon's own hits. The Switched at Birth card says which twist you would get.

| Damage-type pair | Twist | Effect |
|---|---|---|
| Acid + Base | **Neutral Ground** | Combo hits neutralise: a hot burst round the target, and the salt water heals you a little. |
| Acid + Static | **Car Battery** | Combo hits turn the target into a battery that zaps its neighbours for 2s. |
| Acid + Ethanol | **Pear Drops** | Combo hits make the target smell of pear drops: everything nearby is drawn in for a sniff. |
| Histamine + Acid | **Weeping Rash** | Combo hits swell the target and corrode it, hard. |
| Acid + Force | **Acid Wash** | Combo hits strip 2 armour for good (1 from bosses). |
| Base + Static | **Hydrogen Pop** | Combo hits split water: a small pop round the target that strips armour. |
| Base + Ethanol | **Hand Sanitiser** | Combo hits kill 99.9% of germs: ordinary enemies near the target on 15% health or less die. |
| Histamine + Base | **Soap Opera** | Combo hits are so dramatic the target faints for a second (not bosses). |
| Base + Force | **Slip and Slide** | Combo hits lather the target and send it skidding a long way. |
| Ethanol + Static | **Lit Up** | Combo hits light the fumes: a small blast that gets everything in it a round drunker. |
| Histamine + Static | **Brain Fog** | Combo hits fog the minds of badly hurt enemies (under 30% health): they fight for you for 5s. |
| Force + Static | **Crumple Zone** | Combo hits charge a barrier that blocks the next hit you take (recharges after 8s). |
| Histamine + Ethanol | **Spirits** | Enemies the combo kills give up their spirit: it flies into the nearest enemy for a share of their health. |
| Force + Ethanol | **Bar Fight** | Combo hits start a bar fight: the target swings at everything next to it. |
| Histamine + Force | **Pin Cushion** | Every 4th combo hit on the same enemy deals triple damage. |
| Acid + Acid | **Concentrated** | Combo hits deal +35% damage and eat 1 armour. |
| Base + Base | **Lye** | Combo hits saponify ordinary enemies on the spot. |
| Static + Static | **Supercharged** | Combo hits arc on to three more enemies. |
| Ethanol + Ethanol | **Double Shot** | Combo hits pour two rounds of Ethanol at once. |
| Histamine + Histamine | **Anaphylaxis** | Swollen enemies the combo kills explode. |
| Force + Force | **Brute Squad** | Combo hits deal +25% damage and knock enemies flying. |

## Damage-type synergies

Own two or more weapons or Feats of one damage type to unlock its set bonus.

| Damage type | Bonus name | Effect |
|---|---|---|
| Force | **Brute Force** | +15% fire rate for Force weapons |
| Acid | **Reflux** | Corrosion lasts longer and deals +50% damage |
| Base | **Bath Time** | Saponify threshold halved, saponified enemies take +25% |
| Static | **Balloon Hair** | Charged enemies arc twice as often |
| Ethanol | **Open Bar** | Ethanol ticks twice as fast |
| Peroxide | **Bubbly** | Fizz pops 50% harder |
| Brine | **Seasoned** | Pickling lasts 50% longer |
| Histamine | **Hay Fever** | Swelling amplifies damage by +50% instead of +30% |

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
| **RANDOM** | Chaos. The lab loves it. |
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

After a win, the Gene Bank lets you be born: your bonuses, wildcards, dyes and DNA reset, but your Generation goes up for good (+10% DNA, +3% damage and +5 max HP each) and you keep a Baby Trait forever. The Field Guide, sequences, ranks and records stay.

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
| **Well-Incubated** | +1 mutation slot per rank | 2 | 80 / 140 |

### Wildcard weapons

Unlocked wildcards can be drafted by any sequence.

| Weapon | DNA |
|---|---|
| Nappy Mines | 60 |
| Premature Evangelation | 60 |
| Toddler Gravity | 80 |
| Pub Crawl | 80 |
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
| **Brood Cyst** | 140 | 14 | 30 | 2 | 10 | 3:20 | brood |
| **Mother Cell** | 75 | 10 | 40 | 2 | 8 | 3:30 | Spawns minions |
| **Planarian** | 34 | 10 | 72 | 1 | 2 | 3:50 | planarian |
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
| **Second Dose** | 45 | 12 | 92 | 0 | 6 | Spawned by others | Laser lock-on, burst fire |
| **Broodling** | 10 | 6 | 108 | 0 | 0.5 | Spawned by others | broodling |

### First sightings

The first time you ever see each kind of enemy (once ever, not once a run), the slide stops and it gets a short introduction: what it is and how to beat it. It then goes in the Field Guide under ENEMIES. Settings > Tutorial resets them so you can see them again. Bosses always get their full introduction.

**Spotlight.** That first meeting also gets the stage for about 17 seconds: it arrives as a pack, most new spawns are more of it, the rest of the crowd near you backs off and scripted waves wait, so you can get a feel for it. Types you have already met just join the run as normal.

| Enemy | What it is | How to beat it |
|---|---|---|
| **Also-Ran** | One of the four hundred million. Not a threat on its own. There is never one on its own. | Anything that hits a crowd. Keep swimming and let your weapons mow them down. |
| **Sprinter** | Small, fast and fragile. It reaches you before you have noticed it. | Fast fire and wide shots. One hit is enough. |
| **Antibody** | Part of the host's immune system. Keeps its distance and shoots at you: dodge! | Its shots are slow. Swim across them, not along them. SHOOTERS FIRST targeting helps. |
| **Macrophage** | A big eater with a little armour. Swallows whatever it catches. | Armour shred and big single hits. Don't let it pin you against a wall. |
| **Acid Bubble** | A bubble of stomach acid that rushes you and bursts. | Kill it at range, or swim clear when it swells. Its blast hurts other enemies too. |
| **Mitotic Cell** | Divides when it dies: two smaller, faster cells come out. | Splash damage handles the halves. Kill it where your blasts can catch them. |
| **Daughter Cell** | Half of a cell that just divided. Quick and angry. | It is fragile. Anything that hits more than one target. |
| **Krill** | Shoals of tiny crustaceans that dart in bursts. Nobody knows how they got in here. | Wide, sweeping weapons. They scatter, then regroup. |
| **Spermlet Swarm** | A swarm of spermlets: tiny, fast and everywhere at once. | Area damage and auras. Single shots waste time on them. |
| **Quantum Swimmer** | Teleports short distances when you aim at it. | Homing shots and chaining static don't care where it went. |
| **Nurse Cell** | Heals the enemies around it. | Kill it first: set a weapon to SHOOTERS FIRST, which counts healers. |
| **Headbutter** | Lowers its head, winds up, then charges in a straight line. | When it stops and shakes, sidestep. It can't turn mid-charge. |
| **Mucus Wall** | A slow wall of mucus with heavy armour that shields the enemies behind it. | Armour shred, damage over time (it ignores armour) and HIGHEST ARMOUR targeting. |
| **Cytokine Caster** | Fires rings of cytokines in every direction. | Find the gaps in the ring and slip through them. Kill it before the rings stack up. |
| **Ghost Swimmer** | Fades out of phase: shots pass straight through it while it is faded. | Hit it when it is solid. Auras and trails catch it as it comes back. |
| **Mother Cell** | Keeps budding new enemies until it dies. | It is the source: kill it, not the children. STRONGEST targeting helps. |
| **Enzyme Spire** | Rooted to the spot, spraying a spiral of enzymes. | Stay out of its reach or kill it fast. The spiral has gaps: time your way through. |
| **Killer T-Cell** | A sniper. A thin line shows where it is aiming, then a fast, heavy shot. | Move when you see the line. Kill it from the side. |
| **Amoeba** | Soft, slow and huge. It eats other enemies and grows, and shrugs off knockback. | Acid and big blasts. Don't let it eat its way to a giant size. |
| **Plasmodium** | A giant amoeba made of many. It splits into amoebas when it dies. | Save your area damage for when it bursts. |
| **Pinworm** | A wriggling worm. Tougher than it looks and hard to hit side on. | Piercing shots go down its length. |
| **Diatom** | A glass-shelled turret: heavy armour and a ring of shots. | Armour shred and big hits. Its rings have gaps. |
| **Water Bear** | A tardigrade: very tough, very armoured, and it curls into a near-indestructible ball when hurt. | Back off while it is curled up, then finish it. Damage over time ignores its armour. |
| **Paramecium** | Swims in long straight lines and backs off when it bumps into you. | Predictable: put a trap or a mine in its path. |
| **Rotifer** | A hoover. It goes for your XP granules and eats them before you can. | Kill it quickly: it drops what it ate. Collect XP before it does. |
| **Volvox** | A hollow colony that bursts into daughter colonies when it dies. | Area damage cleans up the burst. |
| **Daughter Colony** | A daughter colony from a burst Volvox. Small and quick. | Splash damage. |
| **Candida** | Candida: every cell buds a daughter every few seconds, so a colony doubles and doubles. Sticky to swim through. | Clear it out early, before it spreads. Acid and Ethanol clouds work well. |
| **Pepsinator Jr** | A small Pepsinator. All the stomach, half the size. | Treat it like a mini boss: keep moving and hit it hard. |
| **Alpha Swimmer** | A huge rival swimmer, armoured and hard-hitting. | Shred its armour and keep your distance. Its charge is slow to start. |
| **Booster** | A booster shot. It locks on with a red sight line before firing a burst, and killing it is only half the job. | Move as soon as the line settles on you. A Second Dose follows it. |
| **Second Dose** | What comes after a Booster: lighter, faster and still coming. | It has no armour left. Finish it before it reaches you. |
| **Brood Cyst** | A see-through sac full of Broodlings. It swells, then fires one out at you, and slowly grows more. Kill it and everyone left inside scatters and comes back as kamikazes. | Kill it from range, then back off: the burst blows up on contact. Area damage clears the scatter. |
| **Broodling** | A little passenger from a Brood Cyst. Fired at you, it just chases. From a burst cyst, it blinks red and dives at you to blow up. | Anything that hits a crowd. Keep moving when a cyst bursts. |
| **Planarian** | A looping flatworm. Destroy a segment and it splits in two there, and each half slowly grows back to full length. | Kill the head end first, or hit it all at once. Chipping the middle makes more worms. |
| **Natural Killer** | A Natural Killer: it weaves in, crouches, then pounces. Its blood is acid. | When it crouches, get clear. Don't stand where it dies. |

## Rival champions

Named rivals race you to the egg. When the sperm count reaches 6, the strongest five survivors (rivals first, stand-ins after) become the Final Five. Beat them and the sperm count is 1.

**The egg.** Once the sperm count is 1 (or you reach level 60), swim into the egg. Its membrane wakes up with a boss introduction and fights back: rings of bullets that speed up as it cracks, aimed volleys, and five bodyguards budding off it every 5 seconds (one of them elite). It gives way slowly however big your build (at most 2.5% of it a second), and its warm glow heals you while you are close. Break it and you are born. Touching the egg is no longer enough on its own.

**Breaking in.** A rival who reaches level 60 before the Final Five swims for the egg and gnaws at its membrane (0.7% a second). They stop gnawing while you are hitting them. If they get through first, they fertilise the egg and you lose (BEATEN TO IT). Kill them, or win the race before they finish: when the Final Five start they leave the egg to fight you, and whatever damage they did stays in the membrane.

Knock a named rival out of the race and you choose one of their two relics.

The first time you ever meet each named rival, the slide stops to introduce them: personality, five attributes (1 to 5) and two specialities that change how they fight.

| Rival | Growth speed | Aggression | Speed / Tough / Fire / Aggro / Growth | Specialities | How to beat them | Relics (choose one) |
|---|---|---|---|---|---|---|
| **Big Steve** (THE MARATHON MAN) | x1.1 | 0.6 | 4 / 3 / 2 / 3 / 4 | **Pacing**: Swims 20% faster than other rivals.<br>**Second Wind**: Starts healing after 2 quiet seconds (not 4), twice as fast. | Chip damage is wasted on him. Save your burst and finish him in one go. | **Personal Best**: +20% swim speed, and +10% dodge while you are swimming fast.<br>**Marathon**: While you keep swimming fast you heal 1% of your max HP every second. |
| **Chad Flagellum** (THE GYM BRO) | x1 | 0.9 | 2 / 5 / 3 / 5 / 3 | **Bulking**: 30% more HP, 10% slower, and running into him hurts 50% more.<br>**Shoulder Barge**: When he is close, he plants himself, glows, then charges straight at you. | When he stops and glows, sidestep. He can't turn mid-barge. | **Gains**: +30% max HP (and heal it).<br>**Head Coach**: +2 Headstrong: enemies you swim into take big damage. |
| **Professor Wiggles** (THE ACADEMIC) | x1.15 | 0.2 | 3 / 2 / 4 / 1 / 5 | **Field Research**: Clears enemies in a wider circle, five at a time, so he grows fastest.<br>**Sabbatical**: Duels from long range. When badly hurt, he vanishes and reappears far away (every 20s at most). | He is fragile up close. Get in his face, and chase him early before he outgrows you. | **Honorary Degree**: +25% XP for the rest of the run.<br>**Thesis Defence**: Your crits hit 75% harder. |
| **Lil' Zygo** (THE TANTRUM) | x0.9 | 0.7 | 5 / 1 / 3 / 4 / 2 | **Small Target**: 20% smaller, 30% faster, 25% less HP.<br>**Tantrum**: Never runs away. Below half HP he fires twice as often. | One big hit does it. Don't let him reach half HP at close range. | **Small Mercies**: Your hitbox is 25% smaller, so more bullets miss you.<br>**Throwing a Wobbly**: Below half health: take 20% less damage and deal 24% more. |
| **Kevin** (JUST KEVIN) | x0.95 | 0.4 | 3 / 3 / 3 / 3 / 3 | **Unremarkable**: Nothing special about him at all.<br>**Somehow Fine**: The first time you knock him out, he gets back up with 30% HP and swims off. | You have to beat him twice. Don't stop shooting when he goes down. | **Just Kevin**: A little of everything: +6% damage, fire rate, swim speed, max HP and crit chance.<br>**Kevin's Mum**: Every 45s she drops off a power-up next to you. She worries. |
| **Dash Mitosis** (THE SPRINTER) | x1.05 | 0.7 | 5 / 2 / 3 / 3 / 3 | **Burst**: Every 7s he sprints at more than twice his speed for over a second.<br>**Lightweight**: 15% less HP. | Let the sprint go past you, then hit him while he catches his breath. | **Head Start**: Every 8s you burst forward at double speed for 0.6s, and nothing can hurt you while you do.<br>**Early Bird**: +40% damage to enemies that are still at full health. |
| **Sly Motility** (THE PICKPOCKET) | x1 | 0.4 | 4 / 2 / 2 / 2 / 5 | **Sticky Fingers**: Hoovers up your XP granules from all around him, and grows on them.<br>**Slippery**: 10% faster than most rivals. | Collect before he does, and take him out early: he only gets bigger. | **Pickpocket**: +50% pickup range, and XP gems are worth 15% more.<br>**Five-Finger Discount**: Elites always drop a power-up when they die. |
| **Brick Wallace** (THE TANK) | x0.9 | 0.5 | 1 / 5 / 2 / 2 / 2 | **Plated**: +4 armour and 40% more HP.<br>**Lumbering**: 20% slower than other rivals. | Armour shred and damage over time. Or just outswim him. | **Mucus Wall**: +6 armour, but 5% slower.<br>**Load-Bearing**: While you are barely moving, you take 35% less damage. |
| **Hawkeye Harriet** (THE SNIPER) | x1.05 | 0.5 | 3 / 2 / 5 / 3 / 3 | **Long Shot**: One heavy, fast shot instead of a fan, from much further away.<br>**Keeps Her Distance**: Duels from long range. | Keep moving sideways to her: a single shot is easy to dodge if you are not where she aimed. | **Eagle Eye**: +45% damage to enemies more than 350 away from you.<br>**Steady Hand**: +35% range and +20% shot speed for every weapon. |
| **Buckshot Bev** (THE SCATTERER) | x0.95 | 0.8 | 3 / 3 / 5 / 4 / 2 | **Wide Load**: Two more bullets in every fan, spread wider.<br>**Trigger Happy**: Picks fights often. | Get close or very far: the fan is deadliest at middle distance. | **Buckshot**: +1 projectile for every weapon and +10% fire rate.<br>**Trigger Happy**: +15% fire rate and +25% reload speed. |
| **Casper Flagella** (THE PHANTOM) | x1 | 0.5 | 3 / 2 / 3 / 3 / 3 | **Fade**: Every 9s he fades out for 2s: shots pass straight through him.<br>**Unsettling**: Very polite about it. | Save big hits for when he is solid. Auras and trails catch him as he comes back. | **Ectoplasm**: Bullets sometimes pass straight through you: +15% dodge.<br>**Now You See Me**: Every 12s you fade out for 2s: nothing can touch you. |
| **Big Mama Morula** (THE MOTHER HEN) | x0.95 | 0.6 | 2 / 4 / 2 / 3 / 3 | **Backup**: In a fight, two of her boys swim in to help every 12s.<br>**Well Fed**: 15% more HP. | Kill her, not the boys: they stop coming when she stops calling. | **Her Boys**: Two of Mama's boys escort you for the rest of the run. One that falls is back 20s later.<br>**Packed Lunch**: Every level up heals you 12% of your max HP. |
| **Vlad the Inhaler** (THE BLOODSUCKER) | x1 | 0.7 | 3 / 3 / 3 / 4 / 3 | **Drain**: Every hit he lands on you heals him 2.5% of his max HP.<br>**Undying**: Starts healing after 2 quiet seconds, twice as fast. | Do not trade hits. Burst him down, or stay out of reach. | **Blood Bank**: 2% of the damage you deal heals you.<br>**Undead Membership**: Every 90s, a hit that would kill you leaves you on 1 HP instead. |
| **Sticky Ricky** (THE LITTERBUG) | x0.95 | 0.6 | 3 / 3 / 2 / 3 / 3 | **Slime Trail**: In a fight, drops a puddle of acid every couple of seconds.<br>**Messy**: He will not clean it up. | Fight him side on, never follow his tail. | **Slime Trail**: You leave a boozy slime trail behind you as you swim.<br>**Sticky Situation**: Anything that touches you is stuck: half speed for 3s. |
| **Coach Kenny** (THE MOTIVATOR) | x1 | 0.9 | 3 / 4 / 3 / 5 / 3 | **Shoulder Barge**: When he is close, he plants himself, glows, then charges straight at you.<br>**Pads On**: +2 armour and 10% more HP. | When he glows, sidestep. Hit him while he recovers. | **Pep Talk**: +12% damage and +12% fire rate. Come on, then.<br>**The Whistle**: Every 15s a whistle blast knocks back and dazes everything near you. |
| **Diva Delores** (THE SHOW-OFF) | x1.1 | 0.6 | 3 / 2 / 4 / 3 / 4 | **Encore**: Two more bullets in every fan.<br>**Exit Stage Left**: When badly hurt, she vanishes and reappears far away (every 20s at most). | Finish her fast once she is low, before she blinks away. | **Encore**: One kill in ten takes a bow: a burst of damage all round it.<br>**Exit Stage Left**: Hit while under half health, you blink away from the trouble (every 8s). |
| **Nana Nucleus** (THE OLD HAND) | x0.85 | 0.3 | 2 / 4 / 2 / 2 / 2 | **Not Today**: The first time you knock her out, she gets back up with 30% HP.<br>**Second Wind**: Starts healing sooner, twice as fast. | You have to beat her twice. Keep the pressure on so she cannot heal. | **Knitted Cardigan**: +2 HP every second, and +10% max HP.<br>**Not Today, Dear**: Once this run, when you would die, you get back up on 50% HP. |
| **Turbo Tadpole** (THE LIVE WIRE) | x1.05 | 0.8 | 5 / 1 / 3 / 5 / 3 | **Wired**: 25% faster, and sprints every 7s.<br>**Tantrum**: Never runs away. Below half HP he fires twice as often. | Fragile. Hit him hard before he gets close. | **Nine Espressos**: +25% swim speed and +10% fire rate, but you take 5% more damage.<br>**Full Meltdown**: Below 40% health your weapons fire 40% faster. |
| **Norman Nucleotide** (THE MATHEMATICIAN) | x1.15 | 0.3 | 3 / 2 / 4 / 2 / 5 | **Calculated**: One heavy, fast shot from long range, and he grows fast.<br>**Probability Cloud**: When badly hurt, he vanishes and reappears far away. | Rush him early. Left alone he outgrows everyone. | **Calculated Odds**: +10% crit chance and +30% crit damage.<br>**Probability Cloud**: One hit in seven you take simply did not happen. |
| **Morticia Mitochondria** (THE GOTH) | x1 | 0.6 | 3 / 3 / 3 / 3 / 3 | **Fade**: Every 9s she fades out for 2s: shots pass straight through her.<br>**Drain**: Every hit she lands on you heals her. | Hit her while she is solid, and do not let her hit you back. | **Powerhouse of the Cell**: Above 70% health: +18% damage and +12% fire rate.<br>**Mourning Wear**: Every kill near you heals 0.5% of your max HP. |

## Terrain

Each kind of terrain has an upgrade of its own, offered only when that terrain is on the slide.

| Feature | Solid | Effect on shots | Notes | Upgrade |
|---|---|---|---|---|
| **Cartilage Nodule** | Yes | bounce | - | **Bank Shot**: Shots that bounce off a Cartilage Nodule hit 50% harder for the rest of their flight |
| **Mitochondrion** | Yes | absorb | absorbs 45 shots then bursts (radius 230) | **Batteries Included**: ATP bursts from Mitochondria hit 50% harder and 25% wider, and the Mitochondria fill 25% faster |
| **Acid Crypt** | Yes | melt | 10 damage/s on contact | **Cast-Iron Stomach**: Acid Crypts no longer hurt you, and corrode enemies twice as hard |
| **Cilia Bed** | No | repel | pushes 260 | **Brush-Off**: Cilia Beds sting everything they shove |
| **Tubal Current** | No | drift | pushes 150 | **Go With the Flow**: In a Tubal Current: +30% damage and +20% swim speed |
| **Lubricant Slick** | No | none | traction x0.3 | **Skid Marks**: On a Lubricant Slick you swim 40% faster and leave a boozy trail |

Also on the slide: the **Morning-After Pill** (a dissolving cloud that grows to about half the map, then fades), **yeast infections** (colonies that bud more yeast) and the ambient crowd of harmless swimmers outside the arena.

## Campaign (SPOILERS: where Level 1 is set)

A hand-built maze, lips to throat, played as its own run (you start at Lv 1; DNA banks as usual). Finding the way is up to you: autorun fights where you are but does not solve the maze. If you go 40 seconds without getting any further, a faint chevron next to you points the way on.

1. **The Lips:** behind the front teeth, a small arena (30 kills) opens the way on.
2. **The Gum Line:** a maze. Plaque walls break if you keep shooting them (some hide shortcuts), and plaque colonies grow Cavity Creeps. A dead end holds a guarded cavity: a mutation and a DNA strand. Then the Gum Pocket arena (70).
3. **The Tongue:** open ground, saliva pools that slow everything, coughs that blow everyone towards the throat, and mouthwash fronts that sweep the tongue: get behind a tooth, because it scours everything out in the open, germs included. The Papillae arena (90) and the Back of the Tongue (110).
4. **The Throat:** the Tartar Colony (a mini-boss in calcified plaque). Beat it and the way to the egg opens. Except it is a tonsil stone. It stinks. The Egg is in another castle, and Level 2 unlocks.

Arenas seal behind you until the quota is cleared. Food scraps in the corridors break for pick-ups. After 9 minutes the toothbrush starts sweeping up from the lips (it waits while you fight the boss). Local germs: Cavity Creep, Strep Chain, Thrush Spore, Amylase Droplet, Tartar Crust.

## Achievement DNA

The hardest achievements (Chemical Warfare: ten different reactions in a run; Breaking Bad: 1,000 reactions in a run; Flawless Specimen: a boss killed without taking a hit) pay out a box where every card is Mythical or Immaculate.

## Wave mode (The Petri Dish)

The default mode. 20 waves. It starts easy: each ordinary wave brings in 2 enemy types you have not met yet this run, on top of the ones you have. Waves 1 to 3 bring them in a fixed order; after that they are drawn at random from the next 6 you have not had (so nothing big comes early). What a wave holds is a surprise until it lands. Every 5th wave is a boss wave instead: the boss and its entourage, which keeps arriving on cue with its moves and at each enrage. Beat the boss and the wave is beaten. Wave 5 is always the Pepsinator or the Eye; Chad Prime and the Fever only come at wave 15 or 20. Beat wave 20 and you win (it counts as a birth). Winning once unlocks Endless.

Your first wave run (and the first after Settings > Tutorial > reset) opens with **wave 0, Pre-pre-pre-pre-school**: ten slow cells, a junk DNA carrier to practise on and a box of upgrades at the end. Tutorial cards explain sprinting (after your first sprint), Feats (before your first upgrade), Lateral Gene Transfer (your first junk DNA), the egg (the first time you swim up to it; until then no arrow points to it), stains (your first grant) and each damage type and reactions (the first time you use them), at least 25 seconds apart. Every card has a skip tutorial link, which also ends wave 0 where it stands.

From wave 15 the boss can be **the Failed Experiment**: a copy of one of your own past runs (a lost one if you have any), alone in the dish, with an attack for each weapon that run carried and health that grows with the level it reached.

| Boss | Drop name | Entourage | Arrives | Cued by |
|---|---|---|---|---|
| THE MACROPHAGE QUEEN | Feeding Time | Also-Ran, Sprinter, Spermlet Swarm, Krill | near | summon, devour |
| THE ANTIBODY COLOSSUS | Border Control | Antibody, Mucus Wall, Also-Ran | behind | charge |
| THE IMMUNE EYE | Peer Review | Quantum Swimmer, Antibody, Sprinter, Ghost Swimmer | behind | blink |
| THE MATRON | Ward Nine | Macrophage, Nurse Cell, Mucus Wall, Headbutter | near | wardround |
| THE PEPSINATOR | Indigestion | Acid Bubble, Mitotic Cell, Also-Ran | flank | acidrain |
| CHAD PRIME | Leg Day | Headbutter, Sprinter, Spermlet Swarm | ring | dash3 |
| THE FEVER | Forty-One Degrees | Antibody, Acid Bubble, Also-Ran, Cytokine Caster | ring | firering |
| MITCH & OSIS | Double Dose | Mitotic Cell, Also-Ran, Nurse Cell | near | charge, spiral |
| THE PHANTOM PREGNANCY | Something in the Dish | Ghost Swimmer, Spermlet Swarm, Quantum Swimmer | ring | blink |

Boss waves: entourage warm-up (seconds) 16, 12, 10, 10; boss health (times its base) 2.2, 13, 50, 160; boss attack strength 0.55, 0.75, 0.9, 1.

## Boss rewards

Every boss pays twice: a relic (its own three, plus one smuggled relic from a boss you will not meet this run), then a SPOILS box. It also heals you 40%. Spoils are three of these (usually including a full-power Switched at Birth on one of your weapons):

| Spoils | Effect |
|---|---|
| **Trophy Polish** | Every weapon you own goes up a level. |
| **Boss Blood** | +15% max HP, and heal to full. |
| **Adrenal Gland** | +8% damage and +8% fire rate, for good. |
| **Trophy Hide** | +4 armour and +6% dodge. |
| **Lab Notes** | Reactions hit 40% harder, and your damage types +10%. |
| **Victory Lap** | +12% swim speed and +30% pickup range. |
| **Finder's Fee** | +3 rerolls and +15% luck. |
| **Killer Instinct** | +10% crit chance and +40% crit damage. |

## Sperm samples

| Sample | Name | Status | Description |
|---|---|---|---|
| 001 | **Standard Issue** | Playable | One healthy donor, four hundred million hopefuls, one egg. The classic. |
| 002 | **The Petri Dish** | Playable | A mad scientist is breeding super sperm. Twenty drops into the dish, starting easy: each wave brings a couple of new kinds of swimmer, and every fifth wave is a boss. Beat wave 20 and you get the egg. |
| 006 | **Petri Dish: Endless** | Locked: Beat wave mode (The Petri Dish) to unlock. | No egg, no end. Wave after wave, each nastier than the last, with something big every fifth. How many can you take? |
| 007 | **Level 1** | Playable | Somewhere warm, wet and pink, with something round and glowing at the far end. Probably the egg. Find the way through. |
| 008 | **Level 2** | Locked: Beat Level 1 to unlock. | Further in. Nobody knows what is down there. |
| 000 | **Lab Bench (Debug)** | Playable | For testing: god mode, send in any enemy, boss or event, switch any weapon or Feat on and off. Open the DEBUG panel. |
| 005 | **Donor Bank** | Coming soon | Thawed in a hurry. Everyone is sluggish, except the ones who are not. |
| 003 | **The Morning After** | Coming soon | The pill is already dissolving. Good luck. |
| 004 | **Vasectomy Reversal** | Coming soon | Low count, high stakes, very confused surgeon. |

## Hidden rules

Rules the cards do not spell out, but that change what is worth picking.

- **Boss damage cap:** No single hit takes more than 4% of a boss's max HP, or 6% of a Final Five rival's. Percentage effects (Act of God, Hand of God, Gender Reveal, Nit Comb) are capped the same way.
- **Boss hits on you:** A single hit from a boss is capped at 15% of your max HP plus a fixed part (about 8 HP at the start, growing with the clock), so more max HP means more hits to go down.
- **Your armour:** Each point blocks about 1 damage at the start of a run and about 7 by minute 10 (it scales with the enemy damage clock). It never blocks more than 75% of a hit.
- **Enemy armour:** Flat, but it grows a little with the enemy health clock (about x2.8 by minute 9, x3 at most). At least 15% of every hit gets through. Damage over time ignores armour; shred removes it.
- **Regeneration and lifesteal:** Regeneration and the lifesteal pool (about 3 HP/s, 9 with Transfusion) both grow with your max HP.
- **Dodge:** Capped at 75% when rolled. Cards that clamp their own bonus never lower dodge you already have.
- **Crit overflow:** Crit chance above 100% is added to crit damage one for one.
- **Extra projectiles:** Shots share damage: k times the projectiles deal (1 + (k^0.6 - 1)/2) in total, about +25% for one extra on a one-shot weapon.
- **Level curve:** The game expects Lv 60 at 9:00. Each level you are ahead adds 5% enemy health and 3% enemy damage. Three or more levels behind, BEHIND PACE shows on the HUD.
- **Fever Pitch:** From 10:00 (difficulty minute 15) enemy health and damage compound every minute. Every win so far has finished in its first 2 minutes (10:15 to 11:35), so it is the final sprint, not a wall: the longer you stay in it, the harder every minute gets.
- **Mythical and Immaculate:** A separate roll on every card, three a run at most.
- **Weapon tuning:** Tuning cards only offer weapons the stat actually helps (no pierce for weapons that already pierce everything, no magazine for one-shot weapons).

## Glossary

- **Rewind and Chrono energy:** Rewind fires by itself on a lethal hit, rolls you back about 4s and leaves a Paradox Echo that replays your path firing copies of your weapons. You start with 1 charge (max 2, more with Snooze Button). Charges refill from Chrono energy (600 per charge, 15% more for every Rewind already used this run), earned by fighting.
- **Funding and grants:** Every sample is an experiment, and the lab is watching. Kills, combos, bosses and achievements raise its funding; funding milestones bring research grants (a heal, Oxytocin, a stair gate, a magnet, a Nit Comb or a DNA strand). In the campaign the same meter is your devotion to the egg, and the gifts are signs from it.
- **The egg:** Opens at sperm count 1 or Lv 60: swim into it and its membrane (150,000 base HP, 8 armour, at most 2.5% a second) fights back. A rival at Lv 60 can break in first, and if they get through you lose. The sperm count falls over the run; at 6 the Final Five (you and the five strongest swimmers) fight it out.
- **Feat slots:** Two. Feats cast themselves on cooldown.
- **Damage-type set:** Two weapons or Feats of the same damage type turn on its set bonus.
- **Weapon mounts:** Three (Lv 1 and drafts at 8 and 22), plus up to 2 bonus mounts from combos.
- **Player base stats:** 120 HP, 150 swim speed, 5% crit, x1.6 crit damage, 105 pickup radius, 0 armour, 0 dodge. You grow with max HP.

## Secret Field Guide entries (spoilers)

**Spoiler warning.** 18 hidden interactions. In the game each one stays ??? in the Field Guide until it happens to you for the first time; each line below says what sets it off.

| Secret | How it happens |
|---|---|
| **Belly Full of Nappies** | A Toddler Gravity orb swallowed your Nappy Mines. They all went off together when it collapsed. |
| **Gravity Assist** | Your shots curved round a black hole and flew out faster and harder. Ask a space probe. |
| **Live Puddle** | Static hit something standing in a boozy puddle, and everyone else in the puddle got it too. |
| **Flammable Fumes** | Something corroding touched a boozy puddle and the whole thing went up. |
| **Slip Hazard** | Base turned a boozy puddle to soap. Enemies slide about on it; you skate across it faster. |
| **Bar of Soap** | You rammed a saponified enemy at speed. It burst, and the suds hit what was behind it. |
| **Hereditary** | An infected enemy split during Identical Twins, and both halves kept the infection. |
| **Downstream** | Waters Breaking swept your mines, puddles and black holes along with everything else. |
| **Glow in the Dark** | In the dark, acid glows. Corroding things light up their surroundings during Lights Out. |
| **Head-On** | Ramming counts closing speed: swim straight at something fast and it hits much harder. |
| **Something It Ate** | An amoeba swallowed something it should not have: a mine, a black hole, or an infected cell. |
| **Pocket Hoover** | A black hole sucked up loot lying on the floor, then spat it all out to you when it collapsed. |
| **Double Booked** | Two Due Dates landed on the same enemy. The dates merged: the countdown started again, owing half as much more. |
| **Contagious Paperwork** | Red Tape bundled an infected enemy with healthy ones. The infection travelled along the tape to all of them. |
| **Scared Stiff** | BOO! hit something that was already saponified. It burst from the fright. |
| **Double Bluff** | Your Imaginary Friend copied Peekaboo. Two BOOs, back to back, from two places at once. |
| **Hole in One** | A flung enemy sailed over a baby tooth and grabbed it mid-air. The Tooth Fairy noticed. |
| **Tooth Thief** | A rival champion picked up one of your baby teeth. The Tooth Fairy does not check whose tooth it was. |
