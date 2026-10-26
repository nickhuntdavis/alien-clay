# Spawn Prawn: complete game guide

Every sequence, weapon, combo, Feat, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Epigenetic Profiles (sequences)](#epigenetic-profiles-sequences)
   - [Sequence synergies](#sequence-synergies)
3. [Weapons](#weapons)
4. [Weapon combos](#weapon-combos)
5. [Super combos](#super-combos)
6. [Pairings (secret combos)](#pairings-secret-combos)
7. [Bosses and relics](#bosses-and-relics)
8. [Run events](#run-events)
9. [Feats](#feats)
   - [Feat paths (Lv 4)](#feat-paths-lv-4)
10. [Power-ups (passives)](#power-ups-passives)
11. [Junk DNA (Lateral Gene Transfer)](#junk-dna-lateral-gene-transfer)
12. [Mutations](#mutations)
13. [Mythical and Immaculate bonuses](#mythical-and-immaculate-bonuses)
14. [Upgrades any weapon can take](#upgrades-any-weapon-can-take)
   - [Lv 3 pool](#lv-3-pool)
15. [Modifiers](#modifiers)
   - [Stat bonuses](#stat-bonuses)
16. [Upgrades that do not fit](#upgrades-that-do-not-fit)
17. [Duo combos](#duo-combos)
18. [Stains](#stains)
19. [Cursed cards](#cursed-cards)
20. [Field pickups (temporary power-ups)](#field-pickups-temporary-power-ups)
21. [Stamina](#stamina)
22. [Sequence evolutions](#sequence-evolutions)
23. [Damage types](#damage-types)
24. [Unstable reactions](#unstable-reactions)
25. [Combo twists](#combo-twists)
26. [Damage-type synergies](#damage-type-synergies)
27. [Targeting directives](#targeting-directives)
28. [Movement directives](#movement-directives)
29. [Immune Response (difficulty)](#immune-response-difficulty)
30. [Being born (prestige)](#being-born-prestige)
31. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
   - [Bonuses](#bonuses)
   - [GFP variants](#gfp-variants)
32. [Enemies](#enemies)
   - [Typed bullets and your statuses](#typed-bullets-and-your-statuses)
   - [First sightings](#first-sightings)
33. [Rival champions](#rival-champions)
34. [Terrain](#terrain)
35. [Campaign (SPOILERS: where Level 1 is set)](#campaign-spoilers-where-level-1-is-set)
36. [Achievement DNA](#achievement-dna)
37. [Wave mode (The Petri Dish)](#wave-mode-the-petri-dish)
   - [Big hazards](#big-hazards)
38. [Boss rewards](#boss-rewards)
39. [Sperm samples](#sperm-samples)
40. [Hidden rules](#hidden-rules)
41. [Glossary](#glossary)
42. [Secret Field Guide entries (spoilers)](#secret-field-guide-entries-spoilers)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, Feats, power-ups, modifiers, stains and (rarely) curses.
   Each ordinary card has a pin and a hide (✕) button at its top right. A pinned card (up to 3) turns up in your next box if it still fits; a hidden card (up to 5) never comes back this run. Tap either in the pause menu (Build tab) to undo it.
   **Weird boxes:** about one level or DNA strand box in six (after the first two minutes) breaks the rules. **Double or Nothing**: take a card, or GAMBLE (half the time two cards a rarity better, half the time nothing). **Mystery Sachet**: three sealed cards, only the border shows the rarity. **The Recycler**: hand over two weapon modifiers for one card two rarities better (Legendary at most). **Cursed Bargain**: a Mythical card with a curse attached, or refuse it. **Nothing Box**: you get nothing, and the next ordinary box is all Immaculate.
   **Upgrade All:** holding 5 or more rerolls, an UPGRADE ALL (5) button sits beside REROLL. It spends 5 rerolls and raises every card in the box one rarity (each has a 20% chance of two), up to Mythical, keeping the same upgrades. Curses, supplies and stains stay as they are.
   **Appetite cards** (from Lv 3): **Acquired Taste: [damage type]** makes cards of that damage type come up more often (x2.25 to x3 by rarity); **Gone Off It: [damage type]** makes them rarer (25% down to 10%, never none). You hold one of each; a new one replaces the old.
2. **Weapons** level up to Lv10. Each weapon has its own upgrade path:
   - **Lv 3:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it). **Lv 5 and Lv 8:** pick one of two signature upgrades only that weapon has. **Lv 10 (mastery):** only one weapon a run can reach it; the others stop at Lv 9.
3. **Combos:** get two specific weapons to Lv 5+ and the game stops for the combo alone: the two weapons slam together on their own unlock screen. Both keep firing, gain a new power, and (0 times a run) you get a bonus weapon mount. **Pairings** are smaller secret bonuses that switch on by themselves when you own both weapons at Lv5+.
4. **Weapon tuning:** fire rate, reload, magazine, extra projectiles, projectile speed and range, area, duration and pierce cards go on ONE weapon you choose (tap it on the card); each weapon keeps its own stacks. Legendary and better versions tune every weapon at once.
5. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
6. **Weapon drafts:** your first weapon at level 1, then a new weapon mount at Lv 5, 12 (3 in total, plus up to 0 bonus mounts from combos). You can only draft weapons from the sequences you carry (plus any Gene Bank wildcards). Ordinary DNA strands never offer new weapons.
7. **Sequences:** you start with one Primary Sequence (its trait at full strength, its weapons and its starting ability). At Lv 6, 20, 40 you can splice in another at half strength (three sequences in total: your primary plus two splices), or skip and take a mutation instead (two rerolls if your genome is full).
8. **Lateral Gene Transfer (junk DNA):** from 35s in, then every 40 to 55s, one ordinary enemy on screen carries junk DNA (a white double helix round it, and 50% more health). Kill it within 30s and it drops a floating helix; swim into that (it fades after 20s) and you absorb a small power of whatever it was, shown on screen at once; the same kind again stacks, up to 3 times. **Mutations** (pick one of four; 6 slots) now come from skipping a sequence splice and from stashes hidden in campaign levels.
9. **Bosses:** four bosses, at about 2:05, 3:50, 5:35 and 7:20 of game time; a fifth waits until the Fever Pitch. Each run meets 4 of the 15, in a random order. Beat one and choose one of its three relics.
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

Weights are relative, not percentages, and luck tilts them towards the rarer rows. Mythical and Immaculate skip the table: every card first rolls 0.55% for Mythical and 0.18% for Immaculate (times 1 + 2 x luck), three a run at most. Legendary shows up more often than Epic because Legendary-only cards (curses) add to it.

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Epigenetic Profiles (sequences)

Choose your Primary Sequence before each run. It gives its trait at full strength, its exclusive weapons and a starting ability that fires by itself (or tap its button). Spliced-in sequences give their trait at half strength and add their weapons to your drafts. Each sequence ranks up with kills while you carry it (Rank 2 at 12,000, Rank 3 at 60,000), doubling its trait each time. Your weapons take your primary's colour (with the GFP Tag).

| Sequence | Trait (Rank 1) | Weapons | Starting ability | Unlock |
|---|---|---|---|---|
| **The Firstborn** | Quick Recovery: +12% reload speed | Spitball, Seeker Siblings, Yo-Yo Diet, Little Swimmers, Baby Rattle, Spirit Fingers, Egg White, Runaway Pram, Water Pistol | **Head First** (8s): Every 8s: headbutt-dash through whatever is in front of you, hitting everything along the way. You cannot be hurt mid-charge. | Always |
| **The Chonker** | Puppy Fat: +1 armour | Hiccup Scattergun, Placenta Paddle, Thorny Onesie, Nappy Mines, Gut Punch, Waters Breaking, Butter Knife, Cod Liver Oil, Soft Play | **Mood Swing** (30s): Drop below half health and you go berserk for 6s: +50% damage, +5 armour, and a shockwave that throws everything back. Every 30s. | Always |
| **The Bright Spark** | Early Developer: +6% fire rate, Feats recharge 6% faster | Static Cling, Twin Telepathy, Toddler Gravity, Static Hairbrush, Carpet Shuffle, Lightning Bugs, Fork in the Socket, Lava Lamp | **Short Fuse** (10s): Every 10s: grows a cyst that bursts a second later, shocking everything within 220 and wiping enemy bullets. | Always |
| **The Favourite** | Favouritism: +4% crit chance, +15% crit damage | Due Date, Booger Flick, Tooth Fairy, Bogey Roller, Nose Goblins, Blood Blister, Sticky Fingers, Wet Kiss, Lemon Squeezy | **Telling Tales** (7s): Every 7s: marks the toughest enemy in range, then a second later hits it with a guaranteed crit for huge damage. | Rung 1: Beat wave mode (The Petri Dish) with the Firstborn, the Chonker and the Bright Spark as your Primary |
| **The Good Eater** | Healthy Appetite: +0.5 HP/s regeneration | Tapeworm Seeder, Bubble Wand, Premature Evangelation, Leeches, Whooping Cough, Bath Bomb, Sea Monkeys, Greased Piglet, Umbilical Cord | **Cluster Feeding** (10s): Every 10s: drains the six nearest enemies within 250 and heals you for a fifth of what it took. | Rung 2: Pick up 150 power-ups (all runs) |
| **The Quiet One** | Under Your Feet: +12% melee and trail damage, +2% dodge | Flagellum Flail, Skid Mark, Peekaboo, Runny Nose, Paper Cut, Head Lice, Hanky Panky, Boo-merang, Night Light | **Slipped Out** (9s): Every 9s, when something gets close: you slip straight through it to the far side, slicing everything in between. Untouchable for a moment. | Rung 3: Beat a boss without taking any damage during the fight |
| **The Problem Child** | Overtired: up to +12% damage, the closer you are to bursting | Morning Sickness, Heartburn, Red Tape, Upchuck, Ulcer Moons, Grubby Fingers, Juice Box, Period Drama | **Bringing It Up** (9s): Every 9s: a ring of six acid pools erupts around you. They melt harder the more hurt you are. | Rung 4: Deal 2,000,000 chemical damage (all runs) |
| **The Designer Baby** | Good Genes: your other sequences' traits are 25% stronger, +5% area | Imaginary Friend, Colouring In, Placental Siphon, Gene Gun, Achoo, Cradle Cap, Lard Lobber, Wet Wipe, Heel Prick, Baby Shower | **Soap Dispenser** (11s): Every 11s: a squirt of lye hits the biggest crowd within 320, gluing everything in it (bosses only briefly). | Rung 5: Beat wave mode without using a Rewind |
| **The Redtail** | Inbred Luck: +25% luck; level-up boxes are never Common. Every level up also brings a small bane (at most 4 of each) | Shotgun Wedding, Moonshine Jug, Duelling Banjo | **Sister-Cousin** (12s): When you are hit, there is a 35% chance a copy of you splits off and fights beside you for 12s. Swim into her to recombine for Keeping It in the Family: +30% damage and +20% fire rate for 8s, and 10% of your health back. Tap to split on purpose. | Rung 6: Play 30 runs (any result) |
| **The Twins** | Never Apart: your ghostly twin swims beside you, firing copies of your weapons at 25% damage. Hits on your twin hurt you at half | Hand in Hand, Twin Telepathy, Seeker Siblings | **Which One?** (8s): Every 8s, when you are crowded or low with something close: you and your twin swap places, and each of you lets out a shockwave. Tap to swap whenever you like. | Rung 8: Beat Double Dose (the Twins boss) in wave mode |
| **Prawn Again** | Past Life: memories of a past life surface as you level (100% strength), +5% experience | Déjà Vu, Ghosts of You, Karma | **Second Life** (45s): When your health drops below 25%, you die a little and are prawn again: 40% of your health back, 2s in which nothing can hurt you, and a burst of light that hurts everything near you. Every 45s at most. | Rung 9: Reach Rank III with every other sequence |

### Sequence synergies

| Synergy | Sequences | Effect |
|---|---|---|
| **Rubbing Off** | The Firstborn + The Bright Spark | Every reload sends a spark into the two nearest enemies. |
| **Trail of Destruction** | The Firstborn + The Problem Child | You leave small acid patches behind you as you swim. |
| **Comfort Eating** | The Chonker + The Good Eater | Below half health, your regeneration doubles (and you get +1 HP/s). |
| **Blowout** | The Chonker + The Problem Child | Nappy Mines leave an acid puddle where they go off. |
| **First Impressions** | The Favourite + The Quiet One | Hits on enemies at full health always crit. |
| **Clean Living** | The Designer Baby + The Favourite | Snotty or glued enemies take 30% more damage from you. |
| **Batch Cooking** | The Designer Baby + The Good Eater | Your starting ability (Soap Dispenser or Cluster Feeding, whichever is your primary's) heals you 3% of your max HP for every enemy it hits (up to 15%). |
| **Two Heads Are Better** | The Twins + The Firstborn | When Head First charges, your twin charges too, at the enemy nearest to it. |
| **Something in the Corner** | The Twins + The Quiet One | Your twin passes through whatever it swims into, chilling it to the bone for your melee damage. |

## Weapons

24 weapons, and only these: ten foundations (a plain weapon per attack type and damage type) and fourteen signatures. Each sample starts you with three of them; the rest turn up in drafts. Each weapon takes a branch at Lv 3, Lv 6 and Lv 10.

| Weapon | Damage type | Attack | Starter of | What it does |
|---|---|---|---|---|
| **Standard Issue** | Force | Projectile | Baseline | A plain, heavy shot. No gimmicks. It keeps firing even when the situation is objectively hopeless. |
| **Maximum Gains** | Force | Spread | Alpha | A wide fan of blunt pellets. The closer you get, the more of them connect. Leg day, every day. |
| **Nervous Wreck** | Force | Contact | Beta | Snaps shut on anything that gets too close. It was not looking for trouble. Trouble found it. |
| **Panic Button** | Force | Burst | Baseline | An emergency shockwave. Something got too close and somebody pressed the button. |
| **Acid Spit** | Acid | Projectile | Private Schooled | Hurls a shocking-pink glob that corrodes what it hits. Manners are not a survival strategy. |
| **Red Flagship** | Static | Beam | Alpha | A sustained electrical beam. It talks for hours, provided nobody challenges the central thesis. |
| **Nocturnal Emission** | Mucus | Pool | Beta | Leaves a sticky green patch that snares whatever crosses it. Nobody mentions it in the morning. |
| **Little Prick** | Blood | Projectile | Baseline | A thin red needle. Individually unimpressive. Repeated, it becomes a problem. |
| **Rent Free** | Alien | Projectile | Private Schooled | A pale spirit-kernel that glides through with an unsettling sense of authority. |
| **Hot Mess** | Fire | Pool | Ordered Online | Splashes down a burning patch that stays put. The floor is unwell. |
| **Family Ties** | Force | Projectile | Not of This World | A slow little vortex that drags enemies in and bends your other shots. Five that merge go supernova. |
| **Skill Issue** | Force | Burst | Alpha | A heavy dollop that sends enemies flying into each other. If it goes wrong, that is a skill issue. |
| **There Is No Spoon** | Force | Projectile | Not of This World | Eats enemy bullets near you and fires them back as hard as they hit you. |
| **Nappy Mines** | Fire | Burst | Ordered Online | Drops mines behind you. Each blast fills a Burn bar and leaves a small burning patch. |
| **Soulmate Signal** | Static | Beam | Not of This World | A beam joins you to your twin across the crowd. Swim, and drag it through them. |
| **Unwanted Contact** | Static | Projectile | Redtail | Chains electricity through a crowd. Your other weapons arc again off anything it Charged. |
| **Ewww, Gross** | Mucus | Projectile | Private Schooled | Tapes enemies together with Mucus. Whatever hurts one hurts the bundle (35% of it). |
| **Blowing Bubbles** | Mucus | Projectile | Ordered Online | Traps small enemies in bubbles. Anything that touches a bubble pops it. |
| **One of These Days** | Blood | Projectile | Beta | Sticks a countdown on a big target. When it ends, 40% of what it took lands again. |
| **Sister Cousin** | Blood | Projectile | Redtail | Two homing siblings per shot. A sibling that kills splits in two. Family is complicated. |
| **Peekaboo** | Alien | Burst | Prawn Again | You vanish; enemies swarm the empty spot and shoot each other. Then BOO: Fear. |
| **Eggs** | Alien | Burst | Prawn Again | Drops spectral eggs that lure greedy enemies, then smite whoever takes one. |
| **Chest Burster** | Alien | Projectile | Prawn Again | Infects enemies. The ones that die rise for a few seconds and fight for you. |
| **The Runs** | Fire | Pool | Redtail | No aiming: you leave a burning trail wherever you swim. |

## Weapon combos

Both weapons at Lv 5+: the game stops at once for the combo's own unlock screen (never a card in a box). Both keep firing, gain the power below, and the first 0 combos a run open a bonus weapon mount with a draft.

| Combo | Weapons | Sequence | Power |
|---|---|---|---|
| **Storm in a Teacup** | Family Ties + Unwanted Contact | - | Family Ties vortices crackle: each one throws an Unwanted Contact chain at what it is pulling in. |
| **Party Line** | Soulmate Signal + Unwanted Contact | - | Every second, each twin sends an Unwanted Contact chain into the crowd. |
| **Silent but Deadly** | Peekaboo + The Runs | - | While you are hidden, your burning trail hits 2.5x as hard. The BOO leaves a ring of it round the spot. |
| **Worm Farm** | Blowing Bubbles + Chest Burster | - | Anything trapped in a bubble gets infected by Chest Burster. Bubble pops hit infected enemies 50% harder. |

## Super combos

Two fused combos can fuse again: once both are fused and every weapon in them is Lv 8+, the game stops for a gold unlock screen. Super rare: the ones whose combos share no weapon need a splice and both bonus mounts.

| Super combo | Combos | Power |
|---|---|---|
| **Perfect Storm** | Storm in a Teacup + Party Line | Your twins drag nearby enemies in towards themselves, and every Unwanted Contact chain from either combo jumps 2 more times. |

## Pairings (secret combos)

Own both weapons at Lv 5+ and the pairing switches on. In the game they stay hidden (???) until you find them once.

| Pairing | Weapons | Effect |
|---|---|---|
| **Baby Monitor Network** | Unwanted Contact + Nappy Mines | Unwanted Contact jumping through a crowd sets off any Nappy Mine near its path. |
| **Family Tree** | Sister Cousin + Chest Burster | The enemies Chest Burster raises fire homing Sister Cousin shots. |
| **Static Discharge** | Unwanted Contact + There Is No Spoon | Every 12 bullets There Is No Spoon eats fires an Unwanted Contact chain at four enemies. |
| **Trail Mix** | The Runs + Nappy Mines | Your burning trail drops a Nappy Mine every 1.5s. |
| **Final Notice** | One of These Days + Ewww, Gross | When One of These Days goes off on a taped enemy, the whole bundle takes all of it, not just a share. |
| **Live Paperwork** | Ewww, Gross + Unwanted Contact | Static that hits a taped enemy is shared through the bundle twice over. |
| **Bait and Switch** | Eggs + Nappy Mines | Every egg has a Nappy Mine under it. |

## Bosses and relics

A boss arrives every 1.75 minutes of game time, four in all. Each run draws 4 of these 15 at random; a fifth (a tougher repeat) waits until the Fever Pitch. Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.

In a race (Standard Issue) the bosses come in softer, in run order: health x0.2, x0.35, x0.5, x0.7 and attack strength x0.5, x0.65, x0.8, x0.95. Everything there also hits you for 75% of its listed damage.

### THE MACROPHAGE QUEEN: Eater of Hopefuls

> "Oh good. Dessert swam in."

A white blood cell who ate her way to the top. She summons swarms, then swallows them to heal. Base HP 2600, speed 46. Wave mode tier 2.

- **Strengths:** Devours her own minions to heal; Summons swarms of swimmers.
- **Weaknesses:** Acid: +60% damage; Slow: kite her and clear the snacks.

| Trophy | Effect |
|---|---|
| **Second Stomach** | +60% max HP, and every kill heals 1 HP. Eat everything. |
| **Swallow Whole** | Touching a small, ordinary enemy swallows it whole instead of hurting you, and heals you 3 HP. |
| **The Queen's Court** | Three loyal macrophage guards follow you and fight for you. A fallen guard returns 15s later. |

### THE ANTIBODY COLOSSUS: Head of Border Control

> "Papers. Now. No, those are not papers. Those are bullets."

A Y-shaped wall of protein. Heavily armoured, cannot be moved or glued, and charges in straight lines. Base HP 3800, speed 36. Wave mode tier 3.

- **Strengths:** 12 armour: small hits barely scratch it; Cannot be knocked back or glued.
- **Weaknesses:** Static: +60% damage; Armour shred sticks for longer; Charges are telegraphed: side-step.

| Trophy | Effect |
|---|---|
| **Border Wall** | +3 Shell layers and +40% max HP, but you swim 10% slower. Papers, please. |
| **Bouncer** | Enemies that touch you are hurled away and take ten times their own contact damage. You take 40% less from them. |
| **Diplomatic Immunity** | Every 5s, a shield blocks the next hit completely. |

### THE IMMUNE EYE: Unblinking Critic of Your Genome

> "I've read your genome. I've seen better genomes on a crouton."

It teleports next to you, then glares: a beam that follows you around. While it glares, it cannot blink. Base HP 3400, speed 52. Wave mode tier 2.

- **Strengths:** Teleports right next to you; Death-stare beam that tracks you.
- **Weaknesses:** Takes double damage while glaring; Blood: +50% damage.

| Trophy | Effect |
|---|---|
| **Third Eye** | +25% crit chance and crits deal +100% more damage. |
| **Death Stare** | Every 4s you glare at the toughest enemy on screen with a beam of your own for 1.5s. |
| **Mother's Intuition** | +25% dodge. Every dodge sends out a pulse that wipes nearby enemy bullets. |

### THE MATRON: Head of Ward Nine

> "Visiting hours are over. Forever."

Runs the ward with an iron bedpan. Heals every enemy on screen and hides behind a ring of nurses. Base HP 3000, speed 40. Wave mode tier 2.

- **Strengths:** Heals every enemy nearby on her rounds; Nurse cells orbit her and soak your shots.
- **Weaknesses:** Cooties: +60%, and halves her healing (she never touches the stuff); Kill her nurses: she panics and takes +50%.

| Trophy | Effect |
|---|---|
| **Bedside Manner** | Regenerate 1.5% of your max HP every second. |
| **Triage** | Dropping below 25% HP heals you to 70% and makes you untouchable for 2s. Once every 45s. |
| **Transfusion** | Every hit you land heals you a little, and your lifesteal limit is three times higher. |

### THE PEPSINATOR: Acid Reflux Incarnate

> "Everything dissolves eventually. You're just early."

A blob of stomach acid with ambitions. Rains acid puddles and splits off smaller blobs when hurt. Base HP 3600, speed 44. Wave mode tier 2.

- **Strengths:** Acid puddles eat into you; Acid only does half damage to it; Splits off blobs at 60% and 30% health.
- **Weaknesses:** Mucus: +60% damage (it gums up the works); Blasts and pools: +40% damage.

| Trophy | Effect |
|---|---|
| **Acid Tongue** | Every hit you land also counts 30% of its damage as Acid towards Corrosion, whatever the weapon. Shells come off sooner. |
| **Bad Blood** | When you are hit, you splash acid around you for ten times the damage you took. |
| **Ulcer** | Enemies you kill leave acid puddles that dissolve their friends. |

### CHAD PRIME: Tail Day, Every Day

> "Bro. Bro. You swim like a sneeze."

The biggest swimmer anyone has ever seen. Dashes through you three times, then has to catch his breath. Base HP 3000, speed 95. Wave mode tier 3.

- **Strengths:** Blindingly fast triple dash; Flexes: dodges 30% of your shots.
- **Weaknesses:** Winded after every dash: stunned, double damage; Blasts, beams and pools never miss him.

| Trophy | Effect |
|---|---|
| **Pre-Workout** | +35% swim speed, and every weapon hits up to 50% harder while you swim fast. |
| **Tail Whip** | Your tail becomes a weapon: it lashes everything behind you twice a second. |
| **Flying Start** | Every 5s you surge forward, untouchable for a moment, leaving a shockwave behind you. |

### THE FEVER: Pyrogen Prime, 41 Degrees

> "Is it hot in here, or is it me? It's me. It's always me."

A walking temperature spike. Rings of heat, scalding ground, and it runs hotter and faster as it dies. Base HP 3200, speed 48. Wave mode tier 3.

- **Strengths:** Immune to Acid: sweats it straight off; Rages below 35% health: twice as fast.
- **Weaknesses:** Mucus: double damage; Gluing it snuffs out its current attack.

| Trophy | Effect |
|---|---|
| **Running Hot** | Every hit you land also adds 30% of its damage as Burn, whatever the weapon. Everything you touch runs a temperature. |
| **Fever Dream** | +3% fire rate for every burning enemy within 230 of you, up to +60%. The worse it gets, the better you feel. |
| **Heatstroke** | A burning enemy that dies explodes for a quarter of its max health and passes the Burn to its neighbours. |

### MITCH & OSIS: The Mitosis Twins

> "We finish each other's... ...swimmers."

Identical twins who fight as one. Kill one and the other rebuilds it in 8 seconds, unless you finish both. Base HP 1900 each, speed 58. Wave mode tier 2.

- **Strengths:** Revive each other; Crossfire from two sides.
- **Weaknesses:** Finish both within 8 seconds; Blasts hit both when they huddle: +30%.

| Trophy | Effect |
|---|---|
| **Mirror Twin** | Every shot-firing weapon also fires a twin shot backwards at 50% damage. |
| **Double Trouble** | +1 projectile, +1 pierce and +1 chain jump for every weapon. |
| **Seconds** | From now on, every DNA strand pickup lets you take two cards instead of one. |

### THE PHANTOM PREGNANCY: Expecting Nothing

> "Boo. Sorry. Habit."

A pregnancy that was never really there. It drifts straight through walls and growths, and Force passes through it as if it were mist. The womb itself still hurts it. Base HP 3000, speed 50. Wave mode tier 2.

- **Strengths:** Immune to Force damage; Swims through obstacles.
- **Weaknesses:** Blood: +50% damage; Terrain still hurts it: Acid Crypts, cilia and ATP bursts.

| Trophy | Effect |
|---|---|
| **See-Through** | +20% dodge. Half the bullets that should hit you go straight through. |
| **Poltergeist** | Every 3s the nearest enemy is picked up and thrown at the toughest one nearby. Both take a beating. |
| **Ectoplasm** | Bullets sometimes pass straight through you: +15% dodge. |

### THE LITMUS STRIP: Tester of Everything, Twice

> "Hold still. I need to know exactly how acidic you are."

A strip of paper with a superiority complex. Only one damage type hurts it at a time, shown by its colour, and it changes every 12 seconds. Right after each change it is soaked for 4 seconds: everything hurts it. Base HP 1500, speed 40. Wave mode tier 1.

- **Strengths:** Shrugs off three quarters of every damage type but its current colour; Changes colour every 12 seconds (faster when hurt).
- **Weaknesses:** Its colour takes +50% damage; Soaked for 4 seconds after every change: anything goes; It likes to test what you are carrying.

| Trophy | Effect |
|---|---|
| **Universal Indicator** | +6% damage and +3% fire rate for every different damage type you carry when you take it. |
| **Blue to Red** | Every hit has a 15% chance to fill Corrosion and a 15% chance to Snare, whatever its damage type. Litmus paper, but violent. |
| **Test Strip** | Bosses can no longer resist or ignore any of your damage types. |

### THE JOHNNY: Ninety-Eight Percent Effective

> "Nothing gets past me. Well. Two percent."

A sheath of latex with one job. Its front sends your shots straight back at you; its open end at the back has no defence at all. It charges, overshoots, and has to turn round. Base HP 1500, speed 52. Wave mode tier 1.

- **Strengths:** Shots that hit its front bounce back at you; Blasts and beams on its front do only 40%.
- **Weaknesses:** Hit it from behind: no protection at all; After a charge it is stuck facing away: +50% from behind.

| Trophy | Effect |
|---|---|
| **Rubber Johnny** | Ninety-eight percent effective, per the packet. You are wrapped in a latex forcefield worth 30% of your max health: it soaks what hits it, mends after two quiet seconds, and has opinions about walls. The other two percent is how you got here. |
| **Ribbed** | +1 Shell layer, and enemies you swim into take far more damage (+2 Headstrong). For nobody's pleasure. |
| **Reservoir Tip** | Damage you take is collected. Every 10s it all comes back out as a blast around you, ten times over. |

### THE MUCUS PLUG: Doorman of the Cervix

> "Nobody in, nobody out. It is a fertile window, not a free-for-all."

A doorman made of snot. It seals you in a tight ring of mucus with it. Four plugs hold the seal: break one and the ring widens, break all four and it is out in the open. Base HP 1500, speed 34. Wave mode tier 1.

- **Strengths:** Seals you into a small ring; Lobs sticky globs that pool on the floor.
- **Weaknesses:** Break its four plugs: each one widens the ring; All four gone: it takes +25% damage.

| Trophy | Effect |
|---|---|
| **Plugged** | Enemies that touch you get stuck in mucus: 65% slower for 3s. |
| **Snot Rocket** | Every 4s you hock a glob at the nearest enemy: it bursts into a sticky puddle that eats at everything in it. |
| **Mucous Membrane** | +20% max HP and pickups stick to you from 50% further away. |

### THE CRAMP: Knot of the Month

> "Come here. Closer. CLOSER. Now do not move for an hour."

A muscle in a permanent clench. It grabs you with a tendon and reels you in, slowly, towards its rings. Sprint and the tendon snaps: it pulls a muscle and is left winded. Base HP 1500, speed 38. Wave mode tier 1.

- **Strengths:** Grabs you and drags you in; Rings of bullets up close.
- **Weaknesses:** Sprint while grabbed: it snaps, winded, double damage; Slow: the pull can be outswum.

| Trophy | Effect |
|---|---|
| **Stitch** | Every 5s you yank the three nearest enemies towards you and leave them dazed for 1s. |
| **Charley Horse** | +20% swim speed, and sprinting costs 40% less stamina. |
| **Clench** | While you are barely moving, you take 35% less damage and heal 1% of your max HP every second. |

### THE SNEEZE: Patient Zero, Zero Manners

> "Ah... ah... no, gone. Ah... AH..."

A common cold with uncommon range. It winds up a huge cone of spray and lets go. The wind-up is long and obvious: read it and step out of the way. After a sneeze it has to sniff. Base HP 1500, speed 44. Wave mode tier 1.

- **Strengths:** Huge cone blasts that hit very hard; Two cones at once when it is nearly done.
- **Weaknesses:** Every sneeze is telegraphed for over a second; Sniffing after each sneeze: +30% damage.

| Trophy | Effect |
|---|---|
| **Bless You** | +15% dodge. Every dodge makes you sneeze on whatever is in front of you. |
| **Atishoo** | Every 6s you sneeze a wide cone ahead of you: big damage and a hard shove. |
| **Catch It, Bin It, Kill It** | Enemies you kill sneeze on their neighbours, hexing them: they take more from everything. |

### THE KIDNEY STONE: Six Millimetres of Pure Agony

> "I am not going anywhere. Not without a fight. And a lot of screaming."

A crystal of calcium oxalate the size of a grudge. 40 armour: ordinary hits barely scratch it. Armour shred is the way in, and it sticks: the stone cannot grow it back. Every enrage cracks 10 armour off. Base HP 1500, speed 30. Wave mode tier 2.

- **Strengths:** 40 armour: small hits do almost nothing; Rolls at you, leaving gravel.
- **Weaknesses:** Armour shred sticks to it for good; Static: +50% (lithotripsy); Cracks lose 10 armour each.

| Trophy | Effect |
|---|---|
| **Lithotripsy** | Every hit wears an enemy's outer Shell layer down by half its damage. Shock waves were invented for stones. Now they are for everyone. |
| **Calcified** | +4 Shell layers and +25% max HP, but you swim 8% slower. Mostly calcium now. |
| **Pissing Razor Blades** | When you are hit, shards burst out of you, hurting everything within 120 and wearing down Shells. Twice a second at most. It hurts them more than you. Barely. |

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

Feats (what used to be spells) perform themselves and use the two Feat slots. The attacking ones are paid for from your stamina instead of waiting on a cooldown (the Cost column; a stamina Feat costs about 9 stamina per second of its listed cooldown); the rest keep cooldowns. Anhydrobiosis only ever performs itself. They level up like weapons, and at Lv 4 each one asks you to choose one of two paths (below).

| Feat | Damage type | Cost | What it does | Base stats | Level bonuses |
|---|---|---|---|---|---|
| **Stork Drop** | Acid | stamina | A stork drops something heavy on the target and leaves acid on the ground. Not a baby. | dmg 65, cd 5s, count 1, area 88, delay 0.7s, dur 2s | Lv3: +1 count; Lv5: +30% area; Lv7: +1 count |
| **Power Shower** | Water | stamina | A soapy blast around you. Erases enemy bullets, and enthusiasm. | dmg 22, cd 7s, area 165 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 25% faster |
| **Brainstorm** | Static | stamina | Static strikes several targets at once. None of the ideas are good. | dmg 36, cd 6s, count 5, area 48 | Lv3: +2 count; Lv5: +40% dmg; Lv7: +3 count |
| **Sofa Crevice** | Alien | stamina | Tears open a singularity that drags and crushes. Everything you ever lost is in there. | dmg 16, cd 10s, area 125, dur 3s, pull 210 | Lv3: +30% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Kiss It Better** | Cooties | 14s cooldown | Restores 15% of your health. Medically dubious. | heals 15% HP, cd 14s | Lv3: 15% faster; Lv5: +50% healing; Lv7: 20% faster |
| **Nap Time** | Alien | 16s cooldown | Slows every enemy and bullet to a crawl. Over too soon. | cd 16s, dur 3s | Lv3: +30% duration; Lv5: 20% faster; Lv7: +40% duration |
| **Latex Barrier** | Blood | 12s cooldown | A stretchy shield. Enemies bounce off it; bullets sink in, then get flung back at them. 98% effective. | dmg 12, cd 12s, dur 3s, area 55 | Lv3: +35% duration; Lv5: +30% area; Lv7: 25% faster |
| **Running With Scissors** | Force | stamina | Explodes a ring of blades outward. You were told. | dmg 19, cd 6s, count 16, speed 460, pierce 3, size 6 | Lv3: +8 count; Lv5: +3 pierce; Lv7: +50% dmg |
| **Dutch Oven** | Cooties | stamina | A drifting cloud of stacking Cooties fumes. You know what you did. | dmg 11, cd 9s, area 115, dur 5s | Lv3: +40% duration; Lv5: +30% area; Lv7: +60% dmg |
| **Baby Monitor** | Static | 13s cooldown | Deploys a turret that watches and shoots. Static included. | dmg 9, cd 13s, count 1, dur 10s, rate 0.25 | Lv3: +30% duration; Lv5: +1 count; Lv7: +50% dmg |
| **Naughty Corner** | Water | stamina | A ring of salt on the floor. Anything inside is rooted. Bullets pass through. Think about what you did. | dmg 9, cd 9s, area 120, dur 4s, root 1 | Lv3: +30% duration; Lv5: +30% area; Lv7: 25% faster |
| **Tantrum** | Static | stamina | The more you have been hurt lately, the bigger the blast. Floor-thumping included. | dmg 20, cd 9s, area 120, rage 0.15 | Lv3: +0.05 rage; Lv5: +50% dmg; Lv7: 25% faster |
| **Dummy Spit** | Acid | stamina | Flings a dummy at the toughest enemy. It sticks, and bursts into acid when they die. | dmg 55, cd 8s, count 1, area 95, delay 0.4s, stick 1 | Lv3: +25% area; Lv5: +50% dmg; Lv7: +1 count |
| **Slime Mould** | Mucus | stamina | A yellow slime spreads from you and finds the shortest route to the toughest enemy, round walls. Its veins leave snotty trails that slow anything on them. When it arrives it engulfs the target: stuck for 2s and hit hard with Mucus. "Has no brain. Recreated the Tokyo rail network anyway." | dmg 30, cd 8s, count 1, area 22, dur 5s | Lv3: +30% dmg; Lv5: +30% duration; Lv7: +1 count |
| **Polar Body** | Water | 11s cooldown | You shed a small, egg-like decoy. For 4s enemies and their bullets go for it instead of you (bosses are not fooled). Every hit on it splashes Water back on the attacker, and when it pops everything mobbing it is soaked. "The egg's spare. Same packaging. Nothing inside." | dmg 14, cd 11s, dur 4s, area 120 | Lv3: +25% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Hagfish** | Mucus | 13s cooldown | An instant burst of slime around you. Everything inside is stuck for 2s, and bullets that enter it slow and sink. Anything that bites you while it is up gags and is stuck again. "Releases enough slime to fill a bucket in seconds. Sharks give up." | dmg 18, cd 13s, area 150, dur 3s | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Vanishing Twin** | Alien | stamina | A faint copy of you rises under the toughest enemy nearby and pulls it under, out of play for 3s. It comes back possessed and fights for you, and enemies nearby flee for 2s. Bosses are spooked and take a big hit instead. "Estimated in up to thirty percent of twin pregnancies. Nobody tells the survivor." | dmg 80, cd 8s, dur 3s | Lv3: +30% dmg; Lv5: 15% faster; Lv7: +50% dmg |
| **Mosquito** | Blood | stamina | Its shadow crosses the slide, then a proboscis the size of the screen stabs down through the longest line of enemies. Everything on the line bleeds and gets a dose of Cooties in the same hit, and you heal 1% for every enemy hit. "The deadliest animal on Earth. Briefly on your side." | dmg 40, cd 7s, area 30 | Lv3: +30% dmg; Lv5: +30% area; Lv7: +50% dmg |
| **Not Latex-Safe** | Oil | stamina | A sheen spreads over the crowd. Every shield, shell and armour plate it touches perishes: armour drops to zero for 6s and shields fail, bosses included. Everything in it is lubricated. "Oil-based lubricant cuts latex strength by ninety percent in sixty seconds. Read the label." | dmg 12, cd 7s, area 150, dur 3s | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Donor Sample** | Force | stamina | An unlabelled vial lands on an enemy and is passed to the nearest one every 0.6s, with a small Force hit at each pass. After 3 to 5 passes the music cuts out, and whoever is holding it is hit hard with a random damage type, which reacts with whatever is already on it. "Donor 4471. Six foot. Enjoys hiking. They all say that." | dmg 14, cd 6s, count 4 | Lv3: +30% dmg; Lv5: +1 count; Lv7: +50% dmg |
| **Ouija Board** | Alien | stamina | Faded letters appear under the crowd, and a planchette glides through a word, through walls. Everything near each letter is cursed. The finished word is spelled out once. "Moved by the ideomotor effect: small muscle movements you don't notice. You have no muscles." | dmg 16, cd 8s, area 64 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Formic Acid** | Acid | stamina | An ant's head, far too big for the slide, reaches in. Its mandibles snap the most armoured enemy and spray acid in a line behind it, stripping armour from everything hit. "Twenty quadrillion ants on Earth. Two and a half million per person." | dmg 60, cd 8s, count 1, area 34 | Lv3: +30% dmg; Lv5: +30% area; Lv7: +40% dmg |
| **Fecal Transplant** | Cooties | 14s cooldown | Clears every debuff on you and heals 10%. For 5s you shed Cooties: anything you touch gets two doses, and your shots give one. "An approved treatment with a cure rate around ninety percent. Do not ask about the delivery method." | dmg 8, cd 14s, dur 5s | Lv3: +30% duration; Lv5: 15% faster; Lv7: +50% dmg |
| **Bombardier Beetle** | Acid | stamina | A cone of boiling acid in pulses, fired at whatever is chasing you. The recoil throws you the other way: a free dash through a gap. "Mixes two chemicals in its abdomen and fires them at a hundred degrees. Five hundred pulses a second." | dmg 12, cd 6s, count 6, area 220 | Lv3: +2 count; Lv5: +50% dmg; Lv7: +20% area |
| **Crabs** | Cooties | stamina | Tiny crabs hop onto 4 enemies and jump to anything they touch. Each hop gives a dose of Cooties, and infested enemies stop firing to scratch for 1s at a time. "Spread by close contact. Very close." | dmg 10, cd 7s, count 4, dur 6s | Lv3: +1 count; Lv5: +50% dmg; Lv7: +2 count |
| **Van de Graaff** | Static | 12s cooldown | A charged dome floats beside you for 4s and pulls enemy bullets into it. Each bullet it catches charges it, and when it ends it fires one Static arc per bullet. "Makes hair stand on end. You have no hair. Something else is standing on end." | dmg 16, cd 12s, dur 4s, area 230 | Lv3: +25% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Wandering Womb** | Alien | stamina | A ghostly womb drifts in a slow line across the slide, through walls, cursing everything it passes and pulling enemies into its path. "Ancient Greek doctors believed the uterus roamed the body. They were wrong." | dmg 14, cd 8s, area 70, dur 4s, pull 140 | Lv3: +20% area; Lv5: +50% dmg; Lv7: +30% duration |
| **Anhydrobiosis** | Water | 18s cooldown | Performs itself when a hit would drop you under 20% health: the hit misses, and you dry into a husk that nothing can touch for 2.5s. Then you rehydrate in a splash that soaks and shoves everything nearby. "Life without water. Tardigrades dry out, wait, and come back." | dmg 20, cd 18s, dur 2.5s, area 160 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Capacitation** | Force | stamina | You drive head-first through a line of enemies, piercing armour and shields. Every status on each enemy you hit is carried forward and added to the next, so the last one in line holds all of them. "Sperm cannot fertilise anything until the female tract changes them. Then they can." | dmg 40, cd 7s, area 30 | Lv3: +30% dmg; Lv5: +30% area; Lv7: 20% faster |
| **Brown Fat** | Oil | stamina | A fat globule lands in the crowd and spreads an Oil slick. After 2s it ignites (Grease Fire). Any Water hit on it before then makes it erupt instead (Don't Mix), flinging the crowd apart. "Burns fat to make heat. Newborns are full of it." | dmg 30, cd 7s, area 110, dur 2s | Lv3: +30% dmg; Lv5: +20% area; Lv7: +40% dmg |
| **Asymptomatic** | Cooties | stamina | Silently infects 4 enemies. Nothing visible happens for 4s. Then every dose lands at once and each host spreads it to its neighbours (Pandemic). "About seventy percent of cases show no symptoms. Until they do." | dmg 10, cd 7s, count 4, dur 4s | Lv3: +1 count; Lv5: +50% dmg; Lv7: +2 count |
| **Rupture of Membranes** | Water | stamina | A wave gushes from you to the screen edge. It soaks everything, sweeps enemies and bullets outward, and leaves you in clear water. "Spontaneous. Unscheduled. Upholstery affected." | dmg 18, cd 8s, area 520 | Lv3: +30% dmg; Lv5: +15% area; Lv7: +40% dmg |
| **Spinnbarkeit** | Mucus | stamina | Throws stretchy strings between 4 pairs of enemies. Tied enemies drag on each other and are slowed, and the strings carry statuses between them. "At ovulation, cervical mucus stretches up to ten centimetres. Someone measured." | dmg 12, cd 7s, count 4, dur 5s | Lv3: +1 count; Lv5: +30% duration; Lv7: +50% dmg |
| **Tonic Immobility** | Static | stamina | Every enemy on screen locks still for 1.5s and is shocked. Anything that moves anyway (bosses) takes a big Static hit for it. "Turn a shark upside down and it stops moving. Nobody is sure why." | dmg 40, cd 9s, dur 1.5s | Lv3: +20% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Ear Candling** | Oil | stamina | Plants a lit candle behind you. Enemies are drawn to it for 4s, and it drips burning oil on anything close. "Removes no earwax. This has been tested." | dmg 10, cd 7s, dur 4s, area 75, pull 320 | Lv3: +25% duration; Lv5: +50% dmg; Lv7: +30% area |
| **Hostile Environment** | Acid | stamina | The pH drops in a patch where the crowd is heading. Everything inside melts and loses armour, and anything that dies inside widens it. "Vaginal pH is around four. Most sperm die here." | dmg 12, cd 8s, area 120, dur 5s | Lv3: +20% area; Lv5: +30% duration; Lv7: +50% dmg |
| **Shared Placenta** | Blood | stamina | Ties 4 pairs of enemies with a thin red vessel for 5s. Both bleed, and half of any damage one takes is copied to its partner. "Monochorionic. Two tenants, one placenta, one argument." | dmg 14, cd 7s, count 4, dur 5s | Lv3: +30% duration; Lv5: +1 count; Lv7: +50% dmg |
| **Productive Cough** | Mucus | stamina | You hack up a glob that bounces between 5 enemies, sticking a little of itself to each. "Productive is a medical term. It is not a compliment." | dmg 22, cd 6s, count 5 | Lv3: +30% dmg; Lv5: +2 count; Lv7: +40% dmg |
| **Hirudotherapy** | Blood | 12s cooldown | Leeches latch onto 4 enemies for 6s. Those enemies bleed even while they keep still, and every feed heals you a little. "Medicinal leeches were cleared by the FDA in 2004." | dmg 10, cd 12s, count 4, dur 6s | Lv3: +1 count; Lv5: +50% dmg; Lv7: 20% faster |
| **Lipid Bilayer** | Oil | 12s cooldown | Lays a membrane wall between you and the crowd for 4s. Your shots pass out; enemy bullets slide along it; enemies that push through are lubricated and slowed. "Selectively permeable." | dmg 10, cd 12s, dur 4s, area 160 | Lv3: +25% duration; Lv5: +20% area; Lv7: 20% faster |
| **Biofilm** | Mucus | stamina | A slime mat lands and grows slowly towards nearby enemies for 6s, slowing anything on it and making it snotty. "Most bacteria live like this. Antibiotics struggle with it." | dmg 8, cd 7s, area 90, dur 6s | Lv3: +20% area; Lv5: +30% duration; Lv7: +50% dmg |
| **Shed the Lining** | Blood | stamina | A slow red tide rolls across the screen from behind you, sweeping enemies with it, making them bleed, and leaving pools behind. "Rebuilt monthly. Removed on schedule." | dmg 12, cd 8s, area 150, dur 2.6s | Lv3: +30% dmg; Lv5: +20% area; Lv7: +40% dmg |
| **Osmosis** | Water | stamina | Soaks the most afflicted enemy nearby, and every status on it flows into its neighbours at full strength. "Moves from high concentration to low until everything is equal." | dmg 16, cd 6s, area 160 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Aerosol** | Cooties | stamina | A sneeze in a cone, giving two doses of Cooties. The droplets hang as a cloud for 3s. "A sneeze can carry droplets eight metres. You are about fifty micrometres long." | dmg 10, cd 6s, area 220, dur 3s | Lv3: +30% dmg; Lv5: +20% area; Lv7: +50% dmg |
| **Self-Lubricating** | Oil | 11s cooldown | Coats you for 4s. You swim faster, enemies that touch you slide off and are flung (their bodies hit half as hard), and every contact lubricates them. "Produced on demand. Usually." | dmg 14, cd 11s, dur 4s | Lv3: +25% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Anticoagulant** | Blood | stamina | Every bleeding enemy on screen takes all of its remaining bleeding at once, and splashes bleeding onto its neighbours. "Warfarin was first sold as rat poison. It still is." | dmg 10, cd 7s, area 120 | Lv3: +30% dmg; Lv5: +20% area; Lv7: +50% dmg |
| **Fertile Window** | Mucus | 12s cooldown | Lays a mucus lane ahead of you for 5s. You swim 40% faster along it; enemies on it are snotty and stuck. "Open about six days a month." | dmg 10, cd 12s, dur 5s, area 46 | Lv3: +20% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Surfactant** | Oil | 12s cooldown | A patch where nothing can grip: enemies inside slide out to its edge, lubricated, and bullets that cross it skid off course. "Lowers surface tension so the lungs don't stick shut." | dmg 8, cd 12s, area 130, dur 5s | Lv3: +20% area; Lv5: +30% duration; Lv7: 20% faster |
| **Lactic Acid** | Acid | stamina | Charges while you swim, three times as fast while you sprint (the charge fills its slot). When performed, it bursts acid around you, bigger the further you swam. "Long blamed for muscle soreness. It isn't the cause." | dmg 30, cd 6s, area 150 | Lv3: +30% dmg; Lv5: +20% area; Lv7: +40% dmg |
| **Out of Body** | Alien | 13s cooldown | You slip out of your body for a moment: nothing can touch you, you swim faster, and anything you pass through takes damage. Your body waits where you left it. | dmg 24, cd 13s, dur 2.2s | Lv3: +30% duration; Lv5: +50% dmg; Lv7: 20% faster |
| **Elbows Out** | Force | stamina | You throw your elbows about. Everything close to you is hit and shoved well back. You were here first. Firstborn only. | dmg 30, cd 8s, area 140 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Belly Flop** | Force | stamina | You launch yourself at the thickest crowd nearby and land on it, hard. Chonker only. | dmg 55, cd 10s, area 130 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |
| **Lightbulb Moment** | Static | stamina | A bolt of inspiration jumps from enemy to enemy, up to six of them. None of them asked. Bright Spark only. | dmg 34, cd 7s, count 6 | Lv3: +2 count; Lv5: +50% dmg; Lv7: 20% faster |
| **Come Play With Us** | Force | stamina | You and your twin both reach out at the same moment. Everything near either of you is pulled in close and hurt. Twins only. | dmg 40, cd 9s, area 150 | Lv3: +20% area; Lv5: +50% dmg; Lv7: 20% faster |

### Feat paths (Lv 4)

| Feat | Path A | Path B |
|---|---|---|
| **Stork Drop** | **Double Delivery**: One more stork every time, each dropping 80% as hard. | **Hot Water Bottle**: The acid it leaves on the ground is 40% wider and lasts twice as long. |
| **Power Shower** | **Soap Bath**: Everything it catches stays glued twice as long. | **Power Shower**: A second blast goes off a second later, wherever you are by then. |
| **Brainstorm** | **Brainwave**: Every strike jumps on to the two nearest enemies for half its damage. | **Thunderclap**: Every strike leaves the enemies it hits dazed for a second (not bosses). |
| **Sofa Crevice** | **Down the Back**: It pulls twice as hard. | **Loose Change**: When it closes, it spits everything out in a blast worth four seconds of its damage. |
| **Kiss It Better** | **Plaster**: You also get 1.5s in which nothing can hurt you. | **Kiss Chase**: The kiss also blasts nearby enemies for one and a half times what it heals. |
| **Nap Time** | **Lie-In**: Time stays slow 50% longer. | **Power Nap**: You heal 3% of your max HP every second while time is slowed. |
| **Latex Barrier** | **Extra Large**: The barrier is 50% wider. | **Ribbed**: Whatever touches the barrier, or is hit by what it bounces back, takes 2.5 times the damage. |
| **Running With Scissors** | **Safety Scissors**: The blades fly out and come back, cutting everything twice. | **Pinking Shears**: Four more blades in every ring. |
| **Dutch Oven** | **Lingering Smell**: The cloud lasts twice as long. | **Hotbox**: The cloud follows you around. |
| **Naughty Corner** | **Longer Sentence**: The salt ring lasts nearly twice as long. | **Sent to Bed**: When the ring fades, everything still inside takes a blast worth eight seconds of its damage. |
| **Tantrum** | **Encore**: A second blast follows 0.7 seconds later, at 60% strength, wherever you are by then. | **Full Volume**: The blast also stuns every enemy it hits for 1.5 seconds (not bosses). |
| **Dummy Spit** | **Spare Dummy**: One more dummy every time. | **Dummy Chain**: When a dummy bursts, up to two nearby enemies get one at half strength. |
| **Baby Monitor** | **Night Light**: Turrets shoot twice as fast. | **Twin Pack**: One more turret every time. |
| **Slime Mould** | **Foraging**: It grows to the three toughest enemies at once. | **Memory**: The network stays for the rest of the wave (20s outside wave mode), slowing anything on it. |
| **Polar Body** | **Meiosis II**: It splits into two decoys halfway through. | **Zona**: It is armoured, so it lasts the full time whatever hits it. |
| **Hagfish** | **Knot Tying**: When the slime ends, you slip out at speed in the direction you swim. | **Gill Clogger**: Stuck enemies cannot fire. |
| **Vanishing Twin** | **Absorbed**: A 25% chance the enemy never comes back (not elites). It counts as a kill. | **Survivor's Guilt**: While it fights for you, you take 25% less damage. |
| **Mosquito** | **Return Visit**: It stabs a second line 1s later. | **Itch**: Bitten enemies stop to scratch for 1s (not bosses). |
| **Not Latex-Safe** | **Petroleum Jelly**: The sheen lasts twice as long. | **Expired**: Perished shields and armour burst, hitting whatever is behind them. |
| **Donor Sample** | **Matched Donor**: The damage type is no longer random: it is one that sets off an unstable reaction. | **Split Sample**: Every pass also lands a random damage type. |
| **Ouija Board** | **Long Word**: Always a word of six letters or more. | **Goodbye**: When the word ends, every enemy it cursed takes a hit per letter. |
| **Formic Acid** | **Worker**: Two bites on two targets. | **Pheromone Trail**: The spray leaves a trail for 4s that draws enemies along it. |
| **Fecal Transplant** | **Good Bacteria**: Heals 20% instead of 10%. | **Bad Bacteria**: No heal, but the shedding lasts twice as long and touches give three doses. |
| **Bombardier Beetle** | **Turret**: The cone keeps spraying for 1s, tracking the densest crowd. | **Escape Artist**: Nothing can touch you during the recoil dash. |
| **Crabs** | **Nits**: Dead hosts leave eggs that hatch into two crabs 2s later. | **Grip**: Infested enemies are dragged towards each other. |
| **Van de Graaff** | **Earthed**: It also pulls small enemies in. | **Spark Gap**: It fires an arc for every bullet as it catches it, not at the end. |
| **Wandering Womb** | **Ectopic**: It stops on the toughest enemy it meets and stays there for 3s. | **Bicornuate**: Two wombs, angled apart. |
| **Anhydrobiosis** | **Vacuum Rated**: The husk reflects bullets back at whoever fired them. | **Rehydration**: The splash also heals 15%. |
| **Capacitation** | **Hyperactivated**: You drive twice as far. | **Zona Binding**: The last enemy in line is stuck in place for 2s. |
| **Brown Fat** | **Thermogenic**: It ignites at once. | **Insulation**: The slick is twice as wide. |
| **Asymptomatic** | **Carrier**: During the wait, the hosts pass a dose to anything they touch. | **Late Diagnosis**: The wait is 6s and the payoff is twice as big. |
| **Rupture of Membranes** | **Premature**: Half the stamina, half the reach. | **Second Stage**: A second wave 1s later. |
| **Spinnbarkeit** | **Elastic**: When a string snaps, it flings both ends into each other. | **Ferning**: Each string branches to a third enemy. |
| **Tonic Immobility** | **Upside Down**: Lasts 2.5s. | **Twitch**: Bosses that move take triple. |
| **Ear Candling** | **Vigil**: Two candles. | **Snuffed**: When it burns out, it bursts in a ring of oil. |
| **Hostile Environment** | **Buffer**: Inside it you take no Acid damage and swim 20% faster. | **Yeast**: It drifts towards the nearest crowd. |
| **Shared Placenta** | **Transfusion Syndrome**: All of the damage is copied, not half. | **Cord Pull**: Tied pairs are pulled into each other. |
| **Productive Cough** | **Chesty**: Two globs. | **Hairball**: The last bounce bursts and sticks everything nearby. |
| **Hirudotherapy** | **Anticoagulant Saliva**: Their bleeding lasts twice as long. | **Engorged**: Leeches burst when full, splashing bleeding onto neighbours. |
| **Lipid Bilayer** | **Ion Channel**: Enemies that cross it are shocked. | **Vesicle**: The wall curls into a ring around you and goes where you go. |
| **Biofilm** | **Quorum Sensing**: It grows twice as fast with 5 or more enemies on it. | **Persister Cells**: Enemies that leave it stay snotty for 3s. |
| **Shed the Lining** | **Heavy Flow**: A wider tide that sweeps harder. | **Irregular**: A second tide from the opposite edge. |
| **Osmosis** | **Hypotonic**: The source bursts after spreading. | **Gradient**: It spreads twice: on to the neighbours' neighbours. |
| **Aerosol** | **Droplet**: The cloud drifts twice as far. | **Fomite**: The cloud lasts 8s. |
| **Self-Lubricating** | **Bowling**: Flung enemies hit whatever they land on. | **Long-Lasting**: Lasts twice as long. |
| **Anticoagulant** | **Thinner**: The splash makes neighbours bleed twice as hard. | **Heparin**: It goes off twice, 1s apart. |
| **Fertile Window** | **Channels**: Two lanes in a V. | **Crypts**: Reaching the end of the lane refills 30% stamina. |
| **Surfactant** | **Detergent**: It strips the statuses off enemies that enter and splashes them outward. | **Foam**: The patch follows you. |
| **Lactic Acid** | **Anaerobic**: It charges when you are hit, too. | **Cool Down**: The burst also refills 30% stamina. |
| **Out of Body** | **Astral Projection**: You stay out of your body 60% longer. | **Poltergeist**: When you snap back, your body bursts, blasting everything near it for four times the touch damage. |
| **Elbows Out** | **Sharp Elbows**: Everything you shove is stunned for a second. | **Personal Space**: For 3s after, you take 30% less damage. |
| **Belly Flop** | **Aftershock**: A second slam lands 0.6s later, for 60% of the first. | **Soft Landing**: Nothing can hurt you for a second after you land. |
| **Lightbulb Moment** | **Bright Idea**: The bolt jumps to four more enemies. | **Brainwave**: Every enemy the bolt jumps through is stunned for half a second. |
| **Come Play With Us** | **Again, Again**: You both reach out again 0.8s later. | **Feed on Fear**: You heal 2% of your max health for every enemy caught (up to 10%). |

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
| **Hot-Blooded** | +25% Acid damage and melting | You | 5 |
| **Snot Diet** | +25% Mucus damage and slime | You | 5 |
| **Static Hair** | +25% Static damage, +1 chain | You | 5 |
| **Hip Flask** | +25% Cooties damage, +3 max doses | You | 5 |
| **Bad Blood** | +25% Blood damage | You | 5 |
| **Headbutt Training** | +25% Force damage | You | 5 |
| **Big Lungs** | +25 max stamina (sprint longer, perform more Feats) | You | 3 |
| **Second Wind** | Stamina refills 30% faster | You | 3 |
| **Cardio** | Sprinting costs 25% less stamina and is 10% faster | You | 2 |
| **Rubber Johnny** | +1 rubber plate: each soaks up to 8% of your max HP from one hit, then breaks, and regrows once you stop getting hit. With 3, a breaking plate fires spines that clear nearby bullets | You | 3 |
| **Flinch** | Dodge a hit that would land with a dart sideways, once every 8s (a second copy: every 4s) | You | 2 |
| **Full Load** | Stamina Feats performed from a fuller bar hit harder: from half a bar x1.35 with +1 count and +20% area; a second copy, from 90%: x1.7 and they stun for 1.5s | You | 2 |
| **Muscle Memory** | Stamina Feats cost 20% less | You | 2 |
| **Cocktail Hour** | Hits deal +12% damage for every different chemical already on the target | You | 3 |
| **Chain Reaction** | 25% chance that a reaction sets off the same reaction in a nearby enemy carrying any chemical | You | 3 |
| **Mixologist** | Against enemies already carrying 2 or more chemicals, your chemicals go on +50% stronger | You | 3 |
| **Chemistry** | +35% unstable reaction damage | You | 5 |
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
| **Spoilers** | 10% of shots appear already next to their target (with the Skid Mark, you do) | You | 4 |
| **Inheritance** | When you Rewind, the you that got erased stays behind as a ghost (a Paradox Echo) that retraces your last few seconds firing your weapons. With this, those ghosts perform your Feats too and last twice as long (Rare or better only) | You | 1 |
| **Headstrong** | Enemies you swim into take big damage (ram power x1.0). It grows with your level, max HP and armour. At full speed it sends out a shockwave and their contact hurts 40% less. Try HUNT autorun. | You | 5 |
| **Big Boned** | +30 max HP (and heal it). All your damage +4% for every 100 max HP you have. | You | 4 |
| **Prickly Personality** | Whatever hurts you gets hurt back (thorns x1), plus a smaller jab to everything around you. Grows with max HP and armour. | You | 4 |
| **Stubborn Streak** | Below half health: take 10% less damage and deal 12% more. | You | 3 |
| **Wriggle Room** | +4% chance to dodge hits | You | 5 |
| **Bank Shot** | Shots that bounce off a Cartilage Nodule hit 50% harder for the rest of their flight | You | 2 |
| **Batteries Included** | ATP bursts from Mitochondria hit 50% harder and 25% wider, and the Mitochondria fill 25% faster | You | 2 |
| **Cast-Iron Stomach** | Acid Crypts no longer hurt you, and melt enemies twice as hard | You | 2 |
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
| Killer T-Cell | **Long Shot** | +20% damage to enemies more than 350 away | +60% damage to enemies more than 350 away |
| Water Bear | **Hard to Kill** | +4 armour below 30% HP | +12 armour below 30% HP |
| Alpha Swimmer | **Alpha** | +8% damage | +24% damage |
| Booster | **Booster Shot** | +8% fire rate | +24% fire rate |
| Litmus Cell | **Litmus Test** | +6% damage | +18% damage |
| Mirror Cell | **Smoke and Mirrors** | +4% dodge | +12% dodge |
| Shell Cell | **Shell Suit** | +2 armour | +6 armour |
| Puffball | **Spore Print** | +8% area | +24% area |
| Grease Ball | **Greased Lightning** | +6% swim speed | +18% swim speed |
| Leech | **Second Wind** | stamina recovers 20% faster | stamina recovers 60% faster |
| Platelet Clump | **Quick Clotter** | +0.5 HP/s regeneration | +1.5 HP/s regeneration |
| Callus | **Hard Skin** | +10% crit damage | +30% crit damage |
| Plasma Cell | **Mass Production** | +6% fire rate | +18% fire rate |
| Cortisol Puff | **Fight or Flight** | +5% swim speed | +15% swim speed |
| Phlegm Hocker | **Clear Your Throat** | +5% projectile speed | +15% projectile speed |
| Snot Bubble | **Nose Job** | +3% swim speed | +9% swim speed |
| Hayfever Cell | **Bless You** | +3% dodge | +9% dodge |

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
| **Trapped Wind** | 0 | Sick enemies leave a cloud of Cooties fumes when they die. Better out than in. |
| **Contagious Slime** | 0 | Glued enemies slime everything near them. |
| **Highly Strung** | 0 | Static +30%, Cooties -20%. |
| **Gold Star** | 0 | +10% XP. |
| **Short Attention Span** | 0 | Every Feat you perform has a 15% chance to recharge twice as fast. |
| **Runny Nose** | 0 | Cooties +30%, Static -20%. |
| **Past Bedtime** | 0 | Timed power-ups last twice as long. |
| **Showing Off** | 0 | Every elite or boss that dies near you: +5% damage for 10s, stacking 5 times. |
| **Do-Over** | 0 | The first reroll on every card screen is free. |
| **Salt in the Wound** | 0 | +20% crit chance against enemies that are snotty, glued, sick or melting. |
| **Eat Your Greens** | 0 | +5% fire rate, and Feats recharge 5% faster. |
| **Soft Hands** | 0 | Mucus +30%, Acid -20%. Washes up nicely. |
| **Sour Face** | 0 | Acid +30%, Mucus -20%. |
| **Runner's High** | 0 | +2 HP/s regeneration while you swim fast. |
| **E Numbers** | 0 | Killing an elite: 3s of +25% fire rate. The blue ones are worst. |
| **Surprise Package** | 0 | Absorbing junk DNA blows everything near you away. |
| **Snot Trail** | 0 | +5% swim speed, Cooties +5%. |
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
| **Mood Swings** | 1 | Acid, Mucus and Static +40%. Force, Cooties and Blood -10%. |
| **Middle Child** | 1 | Alone (nothing within 250): +15% swim speed. In a crowd (8 or more): +3 armour. Anything in between: +10% damage. Adapts. |
| **Character Building** | 1 | Every hit you take: +1 max HP (up to +150), and +1 armour for every 50 hits. |
| **Double Yolk** | 1 | Every mutation box has a 30% chance to let you take two mutations. |
| **First Word** | 1 | Your Feats always crit on enemies at full health, and crits hit 25% harder. |
| **Pass the Parcel** | 1 | Charged enemies pass a jolt to a neighbour every second. |
| **Flare-Up** | 1 | Melting enemies can burst (about 1 in 10 each second) in a small acid blast. |
| **Backed Up** | 1 | Weapons with a magazine bigger than 1 hold twice as much. |
| **Magic Cream** | 1 | Heals you fully now, +40 max HP, and every 5th Glucose Hit heals you fully. Fixes everything. |
| **Overexcited** | 1 | Every crit gives +0.5% fire rate for 2s (up to +25%). |
| **One in Each Hand** | 1 | Every timed power-up also gives you another random one. +20% pickup range. |
| **Too Many Sweets** | 1 | A Glucose Hit picked up at full health: +50% damage for 20s. |
| **Attention Seeker** | 1 | Getting hit instantly reloads a random weapon and recharges a random Feat (every 2s at most). |
| **Keeping It a Surprise** | 1 | Hidden until you take it. |
| **Rough and Tumble** | 1 | Force +40%. Acid, Mucus and Static -10%. |
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
| **Snotted Up** | Hits slime: enemies slow by 35% for 1.5s. |
| **Sour Note** | Hits melt enemies for 25% of the hit per second. |

## Modifiers

Level-up cards for one weapon whose attack type fits. A weapon holds up to 3 different modifiers, and only one Delivery modifier. Taking one again ranks it up, to Rank 3. **Switched at Birth** (a Rare card, never two level-ups running) changes a random weapon to a random other damage type; it keeps its level, upgrades and modifiers.

| Modifier | Effect | Rank 2 | Rank 3 | Fits |
|---|---|---|---|---|
| **Homing Instinct** | Shots turn towards their target. If it dies, they fly straight on. Evasion still applies. | Turns harder (7). | Turns harder still (9). | Projectile, Spread |
| **Body Piercing** | Shots carry on through enemies, losing a little damage for each one passed. | +2 more enemies (4 in all). | +2 more enemies (6 in all). | Projectile, Spread |
| **Chain Letter** | After a hit, the attack jumps to another enemy, up to three times, a little weaker each time. | 4 jumps, 75% of the last, a little further. | 5 jumps, 80% of the last, further again. | Projectile, Contact |
| **Ricochet** | Shots bounce off walls, twice at most, losing some damage each time. | 3 bounces, losing 15% each. | 4 bounces, losing 10% each. | Projectile |
| **Return to Sender** | Flies out, then comes back to you, hitting on the way out and on the way back. | 4 hits; the way back hits 20% harder. | 5 hits; the way back hits 40% harder. | Projectile, Spread |
| **Hangers-On** (Delivery) | Three bodies circle you and attack from there. They cannot be hit. They are not pets. | Four bodies. | Five bodies. | Contact, Projectile |
| **Booby Trap** (Delivery) | The blast is placed and marked on the ground. It goes off later, or when something comes near. | 8 placed at once; blasts +20% damage. | 10 placed at once; blasts +40% damage. | Burst |
| **Lobbed** (Delivery) | Flies in an arc over everything in the way and lands on a marked spot. | Lands sooner; +15% area. | Lands sooner still; +30% area. | Burst, Pool |
| **Snail Trail** (Delivery) | Leaves a piece behind you as you swim. Nothing is left while you stay still. | A piece every 24 units, 50 at most. | A piece every 18 units, 60 at most. | Pool |
| **Self-Centred** (Delivery) | Goes off around you rather than at a target. It never hurts you. | 85% damage around you; +15% area. | Full damage around you; +30% area. | Burst, Contact, Spread |
| **Windscreen Wiper** (Delivery) | The hit area moves across enemies, hitting each one once per sweep. | A wider sweep. | A wider sweep still. | Contact, Beam |
| **Washing Line** (Delivery) | The beam joins you to the far side of the crowd instead of firing from you. It moves when either end moves. | Reaches 620; 20% thicker. | Reaches 720; 40% thicker. | Beam |
| **Rapid Volley** | Three shots in quick succession, then a pause. | Four shots a volley. | Five shots a volley. | Projectile, Spread |
| **Wind-Up** | Every fourth attack is empowered. The count shows over you. | Every third attack is empowered. | Every third attack, and harder (x3.2). | Contact, Projectile, Spread, Burst, Beam, Pool |
| **Growth Hormone** | Gets bigger and stronger the further it goes, the longer it lasts or the more it hits, up to double. Resets when the attack ends. | Grows to two and a half times. | Grows to triple. | Projectile, Beam, Pool, Contact |
| **Show-Off** | Damage grows with one of your stats, up to double. | Scales up to x2.5. | Scales up to x3. | Contact, Projectile, Spread, Burst, Beam, Pool |
| **Go Forth and Multiply** | A shot that kills splits into two weaker shots. Split shots never split again. | Kills split into three; 16 in flight. | Splits hit at 60%; 20 in flight. | Projectile |
| **Little Helpers** (Delivery) | Pets deliver the attack for you. Up to four on this weapon, eight in total. | Three pets on this weapon. | Four pets on this weapon. | Contact, Projectile |
| **Gravity Well** | Warps space round the attack: drags enemies towards its centre and bends shots passing through. Three wells at most. | Wider wells, four at once. | Wider still, five at once. | Projectile, Burst, Pool |
| **Lunge** | The attack moves you: forwards through a Contact target, or backwards as recoil from Spread and Burst. | Up to 240 units. | Up to 320 units. | Contact, Spread, Burst |

### Stat bonuses

Every modifier card you take (each rank, and Switched at Birth) also adds a small bonus to one stat, shown on the card. Bonuses last the run. Every weapon has its own base stats (damage, fire rate, crit chance and bonus, magazine, reload, range), shown on the weapon draft; they differ weapon to weapon but deal about the same damage over time. Shell takes that much off every hit that gets through (never more than half); Membrane adds that share of max health to your Membrane.

| Modifier | Stat bonus |
|---|---|
| Body Piercing | +3% Bullet Damage |
| explode | +3% Bullet Damage |
| rapid | +3% Rate of Fire |
| Homing Instinct | +1.5% Crit Chance |
| primer | +1.5% Crit Chance |
| charged | +8% Crit Bonus |
| focus | +8% Crit Bonus |
| mines | +6% Magazine Size |
| extra | +6% Magazine Size |
| ranged | +5% Reload Speed |
| connecting | +5% Reload Speed |
| range | +5% Bullet Range |
| catalyst | +5% Feat Power |
| Wind-Up | +5% Feat Power |
| upclose | +5 Max Health |
| kinship | +0.2/s Health Regeneration |
| Area | +0.2/s Health Regeneration |
| knock | +1 Shell |
| melee | +1 Shell |
| sticky | +3% Membrane |
| Hangers-On | +3% Membrane |
| dfa | +3% Move Speed |
| turncoat | +5% XP Bonus |
| Switched at Birth | +5% XP Bonus |
| pull | +5% Traction |
| Ricochet | +6% Acceleration |

## Upgrades that do not fit

Some upgrades would break a weapon's branch, or do nothing for it, so they are not offered to that weapon (web/js/fitcheck.js; keep this list in step with it). A tier always keeps at least one card.

| Weapon | Not offered | Why |
|---|---|---|
| **Standard Issue** | Homing on Through and Through; Through and Through while it has Homing | Homing curves the shot off the line it pierces. |
| **Maximum Gains** | Lunge on Shotgun Wedding (and the reverse); Baby Boom after Roundabout; Roundabout with Homing or Returning | Recoil pushes you out of point-blank range; a ring has no direction to kick from. |
| **Nervous Wreck** | Lunge on Vice Grip or Back Off! (and the reverse) | Lunge drags you through the enemy you are holding or knocking away. |
| **Panic Button** | Hair Trigger Happy after Personal Space; Self-Centred, Lobbed and Delayed Detonation with Personal Space (and the reverse) | Blasts round you cannot also land on clusters. |
| **Acid Spit** | Projectile Vomit after Spittoon, Lob Lip, Nasty Fifth or Gargle, or with any modifier a Beam cannot take; Projectile modifiers after Projectile Vomit | It turns the glob into a beam. |
| **Red Flagship** | Packet Loss; Multi-Monitor Setup on Overclocked | Packet Loss breaks every mastery; turning beams never hold one target. |
| **Nocturnal Emission** | Snotwork Everywhere and Trail on Bogged Down (and the reverse) | Bogged Down keeps one trap at a time. |
| **Little Prick** | Homing on Needlework (and the reverse) | Homing breaks the line. |
| **Rent Free** | Poltergeist on Return to Sender or after Second Sighting; Returning on Return to Sender (and the reverse) | A wandering ghost never retraces; Returning doubles up. |
| **Hot Mess** | Fire Drill; Powder Keg with modifiers a Burst cannot take; Hellmouth, Scorched Earth and Spontaneous Combustion after Powder Keg; Trail after Powder Keg | Fire Drill keeps enemies out of the patch Hotter Mess wants them in; Powder Keg patches no longer burn. |
| **Family Ties** | Wormhole on Event Horizon; Spaghettification on Orbituary; Gravity Well; Multiplying on Big Bang, Eventually (and the reverse) | They undo the hold, the orbit or the merge count. |
| **Soulmate Signal** | Conjoined Twins on Long-Distance Relationship or Toxic Codependency; Anchored Beam | Both promises need sweeps; the beam is already anchored. |
| **Peekaboo** | Gravity Well, Lobbed, Delayed Detonation, Self-Centred | Vanishing has no target or fuse; a well cancels the Fear. |
| **Nappy Mines** | Self-Centred, Delayed Detonation; Flare Up once switched to another damage type | Mines are already delayed; Flare Up needs an Ignite. |
| **Unwanted Contact** | Chaining | It already chains. |
| **The Runs** | Trail, Lobbed | It is already a trail. |

**Switched at Birth** changes most weapons to any other damage type. Seven weapons have branches built on their own damage type, so each switches only to the one type its branch has a version for, and its cards change to say so:

| Weapon | Switches to | What changes |
|---|---|---|
| **The Runs** | Static | The trail is a live wire: a bolt from the trail jolts (staggers) what crosses it, waves are running sparks, and closing a loop is CIRCUIT CLOSED (the loop lights up and one bolt jolts everything inside). |
| **Little Prick** | Alien | Voodoo pins: Bleed stacks show as pins in the enemy, a full pincushion (6) is Possessed, Sutures yanks crossers back along a ghost thread, Reef Knot stitches the knot into a Possessed ragdoll, Terminal Clause's spirit slams the nearest enemy, Exsanguinate becomes Voodoo Doll (Possessed enemies burst in pins, in place of the healing). |
| **Acid Spit** | Mucus | Snowball: each glob thickens a snot coat; a full coat snowballs the enemy (stuck fast for 1.5 s) and its sneeze Snares everything near. Acid Pools become snot puddles. Stripped Bare and Projectile Vomit are not offered. |
| **Nocturnal Emission** | Alien | Ectoplasm: ghost hands rise from each puddle and grip what is in it; strands and bogeys grip too; Bogged Down pulls enemies under, held down by two hands. |
| **Hot Mess** | Blood | Crime Scene: a full Burn bar is a SPIN-OUT (the enemy slips, spins across the floor, cannot attack for 1 s and takes a hit), and the Ignite cards count slips; anything that walks out leaves bloody footprints. |
| **Rent Free** | Force | Poltergeist: every 4th hit on one enemy (or a full Alien bar from a card) picks it up and THROWS it at the nearest enemy. Nine-Tenths of the Law and Hitching a Ride are not offered. |
| **Unwanted Contact** | Fire | Wildfire: the chain is a flame that leaps enemy to enemy (Fire hits, so they Burn and Ignite); each one it catches is kindling, which the Charged cards read. Brainstorm becomes a wildfire to every piece of kindling. |

Switched to another type, Nappy Mines leaves patches of that type, and only Flare Up (which needs an Ignite) is not offered.

## Duo combos

| Combo | Modifiers | Bonus |
|---|---|---|
| **Follow the Leader** | Homing Instinct + Cell Division | Split shards home in too. |
| **Bath Bomb** | Soaped Up + With a Bang | Explosions glue whatever they hit. |
| **Halo** | Holding Pattern + Contractions | Pulses come twice as often and hit twice as hard. |
| **Snowball** | Boomerang Kid + Swelling | Shots grow twice as much on the way out and back. |
| **Bouncing Off the Walls** | Bouncing Baby + Daisy Chain | Chains jump to 3 targets. |
| **Pied Piper** | Bad Influence + Animal Magnetism | Mind-controlled allies last twice as long. |
| **Kaleidoscope** | Both Ends + Cell Division | Mirrored twins split into twice as many shards. |
| **Biological Clock** | Delayed Gratification + With a Bang | Delayed shots explode as they launch. |
| **Sore Winner** | Trash Talk + Participation Trophy | Trophy hits add two Trash Talk stacks, and say so. |
| **Office Politics** | Passive Aggressive + Snitch | Passive-aggressive follow-ups always grass the target up, and spread to one neighbour. |

## Stains

The slide starts in greyscale, your own swimmer included. Colour comes back three ways.

**Damage types** come into colour one at a time, from the card that introduces each (soon after you first use it; at once with tutorials off). Force stays white.

**Stain cards** turn up in DNA strands: each colours one more thing for that run and brings a boon. **Arcade view** (Settings > Screen > View) shows everything in full colour.

| Stain | Boon | What it colours |
|---|---|---|
| **Anti-Immune Stain** | +8% dodge. You see it coming. | Labels everything that can hurt you in red: enemy bullets, acid, hazards and your low-HP warnings. Also shows a health ring round every hurt enemy (and an armour ring when its armour has been stripped). |
| **Luciferase** | +20% luck, and +25% damage to elites and bosses. You know what is worth chasing. | The firefly enzyme. Things worth having glow gold: DNA strands, elites, bosses and very big amoebas. |
| **Motility Dye** | +8% swim speed, and +30% damage to fast enemies. You spot them early. | Fast swimmers (sprinters, spermlets, krill, paramecia) take up the dye and turn cyan, so you can see what is about to reach you. |
| **Rival Dyes** | +40% damage to rival champions and the Final Five. Know your enemy. | Each rival champion wears their own fluorescent colour, on the field, on the minimap and on the race board, with a health ring round any rival you have hurt. |
| **H&E Stain Kit** | +30% pickup range and +1 reroll. Everything is easier to spot. | Haematoxylin and eosin, the classic. Stains the rest of the slide: chemical effects in their own colours (Acid green, Mucus blue, Static yellow, Cooties amber, Blood red) and your midpiece in your weapon-type colour. |

## Cursed cards

| Curse | Boon | Bane |
|---|---|---|
| **Smoker's Cough** | +20% damage for everything | -40 max stamina, and it refills 25% slower |
| **Couch Potato** | +30% max HP (and heal it) | Sprinting costs twice the stamina |
| **Delicate Condition** | +80% damage for everything | Max HP halved |
| **Shotgun Wedding** | +50% fire rate | Enemy bullets 20% faster |
| **Hands Full** | +4 rerolls right now, double data | Pickup range halved |
| **The More the Merrier** | +50% XP and data | 30% more enemies (30% bigger waves in the dish) |
| **Living in the Past** | +2 max Rewind charges, all refilled now | All healing halved |
| **Clothing Optional** | +25% move speed, +20% dodge | Armour is zero, forever, and every hit hurts 15% more |

## Field pickups (temporary power-ups)

Dropped now and then by kills and elites (they are scarce: only half the drops that could be a pickup turn into one). Timed ones show a countdown chip.

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

One bar of 60 (shown as a thin ring inside your health ring). In manual control, hold the stick right at its edge for a moment (or hold Shift) to sprint: 55% faster, burning 30 stamina a second. Run dry and you are winded until it is back to 30%. Stamina refills at 14 a second after a short pause. The attacking Feats cost stamina (9 per second of their old cooldown, never more than 90% of a full bar), so sprinting and performing Feats share it. Upgrades: Big Lungs (+25 max), Second Wind (refills 30% faster), Cardio (sprinting cheaper and faster), Muscle Memory (Feats cheaper). Curses: Smoker's Cough and Couch Potato.

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
| Twins | **One Cot Between Us**: Your twin swims 20% closer and takes 10% less of the blame (hits on it hurt you at 40%). | **Mother's Lullaby**: +10% fire rate. | **We Hear Each Other**: Your twin copies your weapons at 10% more damage. | **Forever and Ever**: +20% damage, and Which One? heals you 5% each time. |

## Damage types

Every weapon and Feat has one. Switched at Birth changes it.

| Damage type | Status it leaves | What it does |
|---|---|---|
| **Force** | shoved | Plain physics, and the base damage under most attacks. No status and no reactions: it just hurts. |
| **Acid** | melting | Eats through armour. Melting enemies take damage over time and lose armour as they go; once it is all gone, the acid eats through for +50%. |
| **Mucus** | snotty | Gums them up. Snotty enemies get slower with every hit, and enough of it leaves them stuck fast. Shots stick in them and burst back out when they die. |
| **Static** | shocked | Spreads and stuns. Some of the damage a shocked enemy takes arcs to a neighbour and drags it closer, and every 4th Static hit stuns it. |
| **Cooties** | sick | Catching. Sick enemies take stacking damage over time, hit you softer, and sneeze it onto their mates every couple of seconds. |
| **Oil** | lubricated | Highly reactive. Lubricated enemies lose their grip, so knockback sends them much further, and every reaction on them is 50% stronger. Hits leave slicks that lubricate whatever swims through. |
| **Water** | soaking wet | Crowd control. Every hit shoves enemies away and splashes their other statuses onto two neighbours at half strength. Soaking-wet enemies carry Static twice as well. |
| **Blood** | bleeding | Bleeds them. Bleeding enemies take damage over time, but only while they move. Five deep, the blood clots and drags its neighbours into one slow lump. Bleeding kills sometimes leave a pool that heals you. |
| **Alien** | cursed | Not of this world. Alien shots pass through walls, shields and armour. Cursed enemies sometimes turn on their mates, and bosses get spooked. A cursed enemy that dies comes back as a ghost that fights for you for 4s. |

## Unstable reactions

| Reaction | Trigger and effect |
|---|---|
| **TOASTER IN THE BATH** | Water meets Static (either way round): every soaking-wet enemy on screen gets zapped. |
| **GREASE FIRE** | Static meets Oil (either way round): the slick goes up, leaving a burning patch for 3s. |
| **HOLY WATER** | Water meets Alien (either way round): the curse is boiled out in one big hit, twice as big on bosses. |
| **PENICILLIN** | Acid meets Cooties (either way round): the sickness is burned out in one big hit, bigger the sicker it was. |
| **ALIEN ROT** | Acid meets Alien (either way round): the ghost comes out spitting acid, melting 3 enemies nearby. |
| **BLOOD CLOT** | Blood meets Oil (either way round): everything nearby is dragged into one slow lump for 2.5s. |
| **GAS STATION SUSHI** | Cooties meets Oil (either way round): it throws up on its mates, giving everything nearby two doses of Cooties. |
| **PUBLIC POOL** | Water meets Cooties (either way round): every soaking-wet enemy nearby catches it. |
| **ECTOPLASM** | Mucus meets Alien (either way round): ghost slime slows everything nearby. |
| **CARDIAC ARREST** | Blood meets Static (either way round): a 1s stun, then all its bleeding lands at once. |
| **LAST RITES** | Alien meets Oil (either way round): anointed. It fights for you for 5s (bosses take a big hit instead). |
| **SNOT ROCKET** | Mucus meets Cooties (either way round): the sneeze carries twice as far, giving 4 enemies two doses each. |
| **DIRTY NEEDLE** | Blood meets Cooties (either way round): every bleeding enemy nearby catches two doses. |
| **CRIME SCENE** | Blood meets Water (either way round): the blood spreads into a pool that hurts anything in it for 3.5s. |
| **SCAB** | Blood meets Mucus (either way round): it crusts over and stops for 1.5s, then takes +40% for a few seconds once the scab is picked. |
| **BLOOD PACT** | Blood meets Alien (either way round): the ghost drains it for bonus damage and heals you 1% of your max HP. |
| **BATTERY** | Acid meets Static (either way round): the enemy becomes a battery for 2s, zapping two neighbours every half second. You get CHARGED UP: +12% fire rate for 3s. |
| **ACID RAIN** | Acid meets Water (either way round): weaker melting on everything nearby. |
| **HEARTBURN** | Acid meets Mucus (either way round): acid glue bursts out, hitting everything nearby and setting it melting. |
| **ULCER** | Acid meets Blood (either way round): strips 4 armour and bursts for its melting and bleeding at once. |
| **VINAIGRETTE** | Acid meets Oil (either way round): 4 enemies nearby get dressed in it, melting and lubricated. |
| **DON'T MIX** | Water meets Oil (either way round): the crowd round it is flung apart. |
| **SNOT SLICK** | Mucus meets Water (either way round): it gets stuck and slides away from you, and everything nearby gets snottier. |
| **SNAIL TRAIL** | Mucus meets Oil (either way round): the slick spreads the snot, slowing and lubricating everything nearby. |
| **SHORT CIRCUIT** | Mucus meets Static (either way round): a small pop, and stuck enemies stay stuck twice as long (others are stunned). |
| **POLTERGEIST** | Static meets Alien (either way round): the ghost throws arcs at 4 enemies nearby. |
| **THE SHAKES** | Static meets Cooties (either way round): it shivers to a stop, and so does every sick enemy nearby. |
| **PATIENT ZERO** | Alien meets Cooties (either way round): it is filled with Cooties and runs into its mates, fighting for you for 3s. |
| **FULL POSSESSION** | Six Alien hits in 3s: it fights for you for 6s (bosses: spooked and hit hard). |
| **OVERCHARGED** | Static shots fill a mitochondrion three times as fast. |
| **LUBED UP** | You in an Oil slick: +30% swim speed. |
| **TOP-UP** | You in a Blood pool: it heals you. |
| **RINSE** | You in a Water puddle: washes off acid, tangles and stuck bogeys. |
| **SNOT SHIELD** | You in a blob of snot: it blocks the next hit (every 10s at most). |
| **PANDEMIC** | An enemy topped up to its Cooties limit spreads it: 6 enemies nearby get two doses each. |
| **POPPED** | Static on a Snot Bubble: it bursts at once, harmless to you, and every enemy nearby is Snotty. |

## Combo twists

A combo whose two weapons are on their usual damage types does what its card says. Change either weapon's damage type (Switched at Birth) and the combo also picks up the twist for its new pair of damage types. The twist fires on every hit the combo itself deals, and on about 1 in 8 of either weapon's own hits. The Switched at Birth card says which twist you would get.

| Damage-type pair | Twist | Effect |
|---|---|---|
| Acid + Mucus | **Acid Glue** | Combo hits splash acid glue: a burst round the target that sets its mates melting. |
| Acid + Static | **Car Battery** | Combo hits turn the target into a battery that zaps its neighbours for 2s. |
| Acid + Cooties | **Antiseptic** | Combo hits burn the sickness out of the target in one big hit. |
| Blood + Acid | **Weeping Wounds** | Combo hits make the target bleed and melt, hard. |
| Acid + Force | **Acid Wash** | Combo hits strip 2 armour for good (1 from bosses). |
| Mucus + Static | **Fried Snot** | Combo hits fry the snot: a small pop round the target that strips armour. |
| Mucus + Cooties | **Head Cold** | Combo hits make the target sneeze: 4 enemies nearby get two doses of Cooties. |
| Blood + Mucus | **Scab Picker** | Combo hits scab the target over: it stops for a second (not bosses). |
| Mucus + Force | **Slip and Slide** | Combo hits lather the target and send it skidding a long way. |
| Cooties + Static | **Fever** | Combo hits spike a fever: a small blast that makes everything in it a dose sicker. |
| Blood + Static | **Flatline** | Combo hits stop the heart of badly hurt enemies (under 30% health): they fight for you for 5s. |
| Force + Static | **Crumple Zone** | Combo hits charge a barrier that blocks the next hit you take (recharges after 8s). |
| Blood + Cooties | **Bad Transfusion** | Enemies the combo kills spray their blood into the nearest enemy for a share of their health. |
| Force + Cooties | **Coughing Fit** | Combo hits start a coughing fit: the target hacks up on everything next to it. |
| Blood + Force | **Pin Cushion** | Every 4th combo hit on the same enemy deals triple damage. |
| Acid + Acid | **Concentrated** | Combo hits deal +35% damage and eat 1 armour. |
| Mucus + Mucus | **Glued Shut** | Combo hits leave ordinary enemies stuck fast on the spot. |
| Static + Static | **Supercharged** | Combo hits arc on to three more enemies. |
| Cooties + Cooties | **Double Dose** | Combo hits give two doses of Cooties at once. |
| Blood + Blood | **Blood Rite** | Bleeding enemies the combo kills explode. |
| Force + Force | **Brute Squad** | Combo hits deal +25% damage and knock enemies flying. |

## Damage-type synergies

Own two or more weapons or Feats of one damage type to unlock its set bonus.

| Damage type | Bonus name | Effect |
|---|---|---|
| Force | **Brute Force** | +15% fire rate for Force weapons |
| Acid | **Reflux** | Melting lasts longer and deals +50% damage |
| Mucus | **Head Cold** | Enemies get stuck twice as fast, and stuck enemies take +25% |
| Static | **Balloon Hair** | Shocked enemies arc twice as often, and stuns last longer |
| Cooties | **Super Spreader** | Cooties ticks twice as fast |
| Oil | **Well Oiled** | Lubrication lasts 50% longer |
| Water | **Waterlogged** | Soaking wet lasts 50% longer |
| Blood | **Bloodlust** | Bleeding lasts longer and ticks even when they stand still |
| Alien | **Haunting** | Curses last 50% longer |

## Targeting directives

| Directive | Aims at |
|---|---|
| **NEAREST** | Whatever is closest. Safe, boring, effective. |
| **FRAGILEST** | Lowest max health, wounded or not. Clears fodder. |
| **LOWEST HEALTH** | Least health left right now. Finishes off the wounded. |
| **TOUGHEST** | Most max health in range. Bosses and elites first, whatever else is happening. |
| **FASTEST** | Chargers and skitters before they reach you. |
| **FURTHEST** | The farthest enemy in range. Snipes the back line. |
| **DENSEST CLUSTER** | The middle of the crowd. Best for splash. |
| **ELITES & BOSSES** | Bosses, then rivals, then elites, then nearest. |
| **SHOOTERS FIRST** | Shooters, then healers, then summoners. Otherwise nearest. |
| **REVENGE** | Whatever hurt you last. Otherwise nearest. |
| **RANDOM** | Chaos. Picks a new victim every second or so. The lab loves it. |
| **MY OWN MESS** | Whatever is nearest your own mess: a black hole, a puddle, a pet. You choose whose mess. |

Each weapon and Feat also takes an optional second directive (THEN). When two enemies are near-level on the first (within 40 units of distance, within 5% of health or speed, or the same rank), the second decides; when nothing fits the first (ELITES & BOSSES with no elite about), every enemy is level, so the second takes over. RANDOM keeps a victim for about 1.5 seconds; FURTHEST and DENSEST CLUSTER keep theirs unless a new one is 15% better.

## Movement directives

| Directive | Behaviour |
|---|---|
| **KITE** | Keep your distance and dodge attacks |
| **COLLECT** | Grab nearby XP and power-ups, unless it means swimming into trouble |
| **ORBIT** | Circle the biggest nearby group of enemies |
| **HUNT** | Close in on bosses, rivals and elites, or whatever is nearest |
| **HOLD** | Hold your position and dodge immediate threats |
| **NEST** | Stay in the egg's warm glow, which slowly heals you |

Autorun only decides where you swim; each weapon still aims by its own directive. Every mode dodges bullets and attacks. KITE keeps 240 to 360 units from the nearest enemy, sidestepping round the pack, and closes in a little if everything is out past 450. COLLECT goes for the best XP and power-ups for the distance, skipping any with enemies sitting on them or in the way. ORBIT picks the biggest group within reach and circles it, sticking with it until it breaks up or one half as big again turns up (no group: it kites). HUNT chases one target (bosses, then rivals, then elites, then the nearest), keeping it until it dies or gets away, unless something higher-ranked turns up. HOLD stays within about 60 units of where you chose it, coming back after each dodge. NEST stays in the egg's warm glow and only goes for pickups near it; it is not offered in campaign levels, which have no egg.

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

### GFP variants

| Colour | DNA |
|---|---|
| EGFP (standard) | Free |
| Emerald | Free |
| Aqua GFP | Free |
| Azami Green | Free |
| After-Dinner Mint | Free |
| Blue Lagoon | Free |
| Black Light | Free |
| Neon Teal | Free |
| Frosted Tips | Free |
| Lime Rickey | Free |
| Ghost Load | Free |
| Lilac Love Juice | Free |

## Enemies

HP and damage are at the start; both scale up over the run. **From** is the earliest spawn time.

**Cap** is the most of that type on the slide at once (support cells 3, build-punishers 6, joke ones 8); a spawn over its cap becomes another type.

| Enemy | HP | Damage | Speed | XP | From | Cap | Defence | Behaviour |
|---|---|---|---|---|---|---|---|---|
| **Also-Ran** | 14 | 8 | 64 | 1 | 0:00 |  |  | Swims straight at you |
| **Sprinter** | 6 | 5 | 125 | 1 | 0:15 |  | Evasion | Swims straight at you |
| **Antibody** | 20 | 6 | 58 | 3 | 0:35 |  |  | Keeps distance and shoots |
| **Krill** | 5 | 3 | 140 | 0.5 | 0:45 |  |  | Swarms in schools |
| **Macrophage** | 60 | 16 | 44 | 4 | 0:55 |  | Squishy | Swims straight at you |
| **Ingrown Hair** | 36 | 9 | 54 | 3 | 1:05 |  | Thorns | Swims straight at you |
| **Amoeba** | 150 | 14 | 30 | 10 | 1:10 |  | Squishy | Swallows you if it touches |
| **Navel Fluff** | 18 | 3 | 34 | 0.6 | 1:15 | 8 |  | chaser |
| **Lost Tadpole** | 1 | 0 | 46 | 0.5 | 1:20 | 8 |  | chaser |
| **Mitotic Cell** | 42 | 10 | 52 | 3 | 1:25 |  |  | Swims straight at you |
| **Mosquito** | 8 | 4 | 118 | 1.5 | 1:25 | 4 |  | leech, sprinter |
| **Stray Pube** | 10 | 0 | 30 | 0.5 | 1:30 | 8 |  | controller |
| **Glitter** | 8 | 2 | 76 | 0.4 | 1:35 | 8 |  | Swims straight at you |
| **Acid Bubble** | 16 | 18 | 98 | 2 | 1:40 |  |  | Rushes in and explodes |
| **Bogey** | 16 | 0 | 58 | 0.6 | 1:40 | 8 |  | controller |
| **Static Sock** | 34 | 5 | 58 | 3 | 1:40 |  | Squishy | chaser |
| **Quantum Swimmer** | 22 | 9 | 72 | 3 | 1:45 |  | Evasion | Teleports around |
| **Rotifer** | 40 | 8 | 50 | 5 | 1:50 |  |  | Steals XP and runs |
| **Puffball** | 42 | 8 | 42 | 4 | 1:50 | 6 |  | Swims straight at you |
| **Bit of Sweetcorn** | 110 | 0 | 32 | 2 | 1:55 | 8 | Shell | tank |
| **Nurse Cell** | 30 | 6 | 56 | 4 | 2:00 |  |  | Heals nearby enemies |
| **Snot Bubble** | 30 | 6 | 34 | 4 | 2:00 | 4 |  | Swims straight at you |
| **Stress Ball** | 90 | 8 | 36 | 5 | 2:05 |  | Squishy | tank |
| **Headbutter** | 50 | 18 | 56 | 4 | 2:10 |  |  | Winds up, then charges |
| **Leech** | 30 | 7 | 72 | 4 | 2:10 | 6 |  | leech |
| **Phlegm Hocker** | 32 | 8 | 50 | 4 | 2:20 | 6 |  | shooter |
| **Cortisol Puff** | 30 | 6 | 50 | 5 | 2:25 | 3 |  | relay |
| **Mucus Wall** | 95 | 14 | 40 | 6 | 2:30 |  | Membrane | Damages anything close |
| **Mirror Cell** | 34 | 9 | 54 | 4 | 2:30 | 6 | Membrane | tank |
| **Matchstick** | 20 | 12 | 60 | 3 | 2:30 |  |  | charger |
| **Platelet Clump** | 46 | 10 | 46 | 4 | 2:40 | 6 |  | Swims straight at you |
| **Complement Protein** | 28 | 6 | 60 | 5 | 2:45 | 3 |  | controller |
| **Cytokine Caster** | 45 | 8 | 46 | 6 | 2:50 |  |  | Keeps distance and shoots |
| **Shell Cell** | 46 | 12 | 38 | 5 | 2:55 | 6 | Shell | Swims straight at you |
| **Plasma Cell** | 38 | 7 | 46 | 6 | 2:55 | 3 |  | relay |
| **Diatom** | 55 | 8 | 24 | 6 | 3:00 |  | Shell | Keeps distance and shoots |
| **Natural Killer** | 48 | 13 | 70 | 6 | 3:00 |  | Evasion | Weaves, crouches, pounces; acid blood |
| **Interferon** | 34 | 6 | 46 | 6 | 3:05 | 3 |  | support |
| **Grease Ball** | 52 | 11 | 52 | 5 | 3:10 | 6 | Squishy | Swims straight at you |
| **Ghost Swimmer** | 35 | 10 | 82 | 5 | 3:15 |  | Evasion | Phases in and out |
| **Brood Cyst** | 140 | 14 | 30 | 10 | 3:20 |  |  | summoner |
| **Callus** | 58 | 12 | 40 | 5 | 3:20 | 6 | Shell | Swims straight at you |
| **Hayfever Cell** | 50 | 10 | 48 | 5 | 3:20 | 6 |  | shooter, carrier |
| **Fibrin Weaver** | 44 | 8 | 40 | 6 | 3:25 | 3 |  | relay |
| **Mother Cell** | 75 | 10 | 40 | 8 | 3:30 |  |  | Spawns minions |
| **Birthday Candle** | 70 | 6 | 0 | 7 | 3:40 | 1 | Shell | controller |
| **Planarian** | 34 | 10 | 72 | 2 | 3:50 |  |  | swarm |
| **Stem Cell** | 44 | 6 | 36 | 8 | 3:50 | 3 |  | summoner |
| **Enzyme Spire** | 85 | 10 | 16 | 8 | 4:00 |  | Shell | Sits still and shoots |
| **Trapped Wind** | 24 | 0 | 28 | 3 | 4:10 | 2 | Squishy | carrier |
| **Killer T-Cell** | 26 | 6 | 52 | 5 | 4:20 |  |  | Keeps distance and shoots |
| **Water Bear** | 240 | 20 | 30 | 14 | 4:30 |  | Shell | Swims straight at you |
| **Alpha Swimmer** | 420 | 30 | 34 | 20 | 5:00 |  | Membrane | Swims straight at you |
| **Booster** | 120 | 14 | 62 | 10 | 5:00 |  | Shell | Laser lock-on, burst fire, comes back once as a Second Dose |
| **Daughter Cell** | 12 | 5 | 92 | 1 | Spawned by others |  |  | Swims straight at you |
| **Spermlet Swarm** | 4 | 4 | 145 | 0.5 | Spawned by others |  |  | Swims straight at you |
| **Paramecium** | 30 | 10 | 105 | 4 | Spawned by others |  |  | Darts in bursts |
| **Volvox** | 110 | 14 | 34 | 8 | Spawned by others |  |  | Swims straight at you |
| **Daughter Colony** | 26 | 6 | 62 | 2 | Spawned by others |  |  | Swims straight at you |
| **Candida** | 18 | 5 | 22 | 1 | Spawned by others |  |  | Buds new yeast cells |
| **Pepsinator Jr** | 60 | 14 | 72 | 6 | Spawned by others |  |  | Swims straight at you |
| **Second Dose** | 45 | 12 | 92 | 6 | Spawned by others |  |  | Laser lock-on, burst fire |
| **Broodling** | 10 | 6 | 108 | 0.5 | Spawned by others |  |  | swarm |
| **Litmus Cell** | 40 | 10 | 50 | 4 | Spawned by others | 6 |  | Swims straight at you |
| **Spore** | 6 | 4 | 84 | 0.3 | Spawned by others | 10 |  | Swims straight at you |

### Typed bullets and your statuses

Some enemies shoot bullets with a damage type, marked in white on the black speck (a highlight, germs, a glint or a spark). A typed bullet that lands gives you a status for a few seconds; each hit adds time, up to a cap. Your own Water puddles rinse Snotty and Sick off. Bosses shoot plain bullets.

| Shooter | Bullet | Status on you | Effect |
|---|---|---|---|
| Antibody | Mucus | **Snotty** (+1.2s a hit, up to 3s) | You swim 20% slower. Water washes it off, and it will not stick to you while you are wet. |
| Cytokine Caster | Cooties | **Sick** (+2s a hit, up to 5s) | You lose 1% of max health a second (never the last point) and heal at half rate. |
| Diatom | Water | **Soaking wet** (+3s a hit, up to 6s) | Static bullets hit you 60% harder (Zapped in the Bath). Also washes off Snotty and acid. |
| Killer T-Cell, Booster, Second Dose | Static | none | Plain damage, unless you are wet. |

### First sightings

The first time you ever see each kind of enemy (once ever, not once a run), the slide stops and it gets a short introduction: what it is and how to beat it. It then goes in the Field Guide under ENEMIES. Settings > Data > Tutorials resets them so you can see them again. Bosses always get their full introduction.

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
| **Mother Cell** | Keeps budding new enemies until it dies. | It is the source: kill it, not the children. SHOOTERS FIRST targeting helps. |
| **Enzyme Spire** | Rooted to the spot, spraying a spiral of enzymes. | Stay out of its reach or kill it fast. The spiral has gaps: time your way through. |
| **Killer T-Cell** | A sniper. A thin line shows where it is aiming, then a fast, heavy shot. | Move when you see the line. Kill it from the side. |
| **Amoeba** | Soft, slow and huge. It eats other enemies and grows, and shrugs off knockback. | Acid and big blasts. Don't let it eat its way to a giant size. |
| **Diatom** | A glass-shelled turret: heavy armour and a ring of shots. | Armour shred and big hits. Its rings have gaps. |
| **Water Bear** | A tardigrade: very tough, very armoured, and it curls into a near-indestructible ball when hurt. | Back off while it is curled up, then finish it. Damage over time ignores its armour. |
| **Paramecium** | Swims in long straight lines and backs off when it bumps into you. | Predictable: put a trap or a mine in its path. |
| **Rotifer** | A hoover. It goes for your XP granules and eats them before you can. | Kill it quickly: it drops what it ate. Collect XP before it does. |
| **Volvox** | A hollow colony that bursts into daughter colonies when it dies. | Area damage cleans up the burst. |
| **Daughter Colony** | A daughter colony from a burst Volvox. Small and quick. | Splash damage. |
| **Candida** | Candida: every cell buds a daughter every few seconds, so a colony doubles and doubles. Sticky to swim through. | Clear it out early, before it spreads. Acid and Cooties clouds work well. |
| **Pepsinator Jr** | A small Pepsinator. All the stomach, half the size. | Treat it like a mini boss: keep moving and hit it hard. |
| **Alpha Swimmer** | A huge rival swimmer, armoured and hard-hitting. | Shred its armour and keep your distance. Its charge is slow to start. |
| **Booster** | A booster shot. It locks on with a red sight line before firing a burst, and killing it is only half the job. | Move as soon as the line settles on you. A Second Dose follows it. |
| **Second Dose** | What comes after a Booster: lighter, faster and still coming. | It has no armour left. Finish it before it reaches you. |
| **Brood Cyst** | A see-through sac full of Broodlings. It swells, then fires one out at you, and slowly grows more. Kill it and everyone left inside scatters and comes back as kamikazes. | Kill it from range, then back off: the burst blows up on contact. Area damage clears the scatter. |
| **Broodling** | A little passenger from a Brood Cyst. Fired at you, it just chases. From a burst cyst, it blinks red and dives at you to blow up. | Anything that hits a crowd. Keep moving when a cyst bursts. |
| **Planarian** | A looping flatworm. Destroy a segment and it splits in two there, and each half slowly grows back to full length. | Kill the head end first, or hit it all at once. Chipping the middle makes more worms. |
| **Natural Killer** | A Natural Killer: it weaves in, crouches, then pounces. Its blood is acid. | When it crouches, get clear. Don't stand where it dies. |
| **Litmus Cell** | A cell that has been reading your lab book. It resists whichever damage type you have dealt most this run: its paper strip shows which. | Switch it up. A second damage type in your build earns its keep here. Oil bleaches it. |
| **Mirror Cell** | Polished to a shine. Shots that hit its front bounce straight back at you. | Hit it from the side or behind, or use blasts and pools. Acid etches the silvering. |
| **Shell Cell** | A cell that has grown a shell like a whelk. Fifteen points of armour: small hits just tickle. | Big single hits, armour shred and damage over time. Acid dissolves the shell. |
| **Puffball** | A fungal puffball. Hit it with a blast or a pool and it bursts into a cloud of spores that chase you. | Single shots are fine. Save the blasts for after it has gone. |
| **Spore** | A spore from a burst Puffball. Small, quick and annoying, like the person who burst it. | Anything that hits a crowd. |
| **Grease Ball** | A ball of grease. Homing shots slide right off it, and it can't be knocked about. | Aim properly, or use pools and auras. Mucus gums it up. |
| **Leech** | Latches on from a distance and sucks the stamina out of you while it is within 120. | Kill it before you need to sprint or perform a Feat. Water makes it curl up. |
| **Platelet Clump** | A clot of platelets. Piercing shots stop dead in it, like a plaster. | Blasts and chains go round it. Blood thins it out. |
| **Callus** | Hard skin with ideas above its station. Crits do nothing extra to it. | Raw damage and damage over time. Water softens it. |
| **Plasma Cell** | An antibody factory. Shooters near it fire 40% faster. | Kill it first and the bullets thin out. It hangs back, so go and get it. |
| **Interferon** | A warning signal. It wraps nearby enemies in a shield that soaks about 30 damage. | Kill it before you spend big hits on shielded enemies. |
| **Cortisol Puff** | A puff of stress hormone. Everything near it swims 30% faster. You know the feeling. | Take it out early, then the crowd calms down. |
| **Fibrin Weaver** | Spins sticky threads to up to four nearby enemies. Tethered enemies can't be knocked back. | Cut the weaver and the threads go with it. |
| **Complement Protein** | Tags you for destruction. While you are marked, every enemy hits you 25% harder. | It is flimsy: kill it the moment it closes in. The mark wears off after 5 seconds. |
| **Stem Cell** | It can become anything, including whatever you just killed. Every 10 seconds it brings one back. | Kill it before it gets to work, or nothing in the dish stays dead. |
| **Lost Tadpole** | A frog tadpole. It has no idea how it got here and it would like directions to the pond. | One hit. Or don't. It's not hurting anyone. |
| **Stray Pube** | A stray pube, drifting about. Swim into it and you are tangled for a second. | Shoot it or swim round it. Mucus glues it down. |
| **Navel Fluff** | Navel fluff. Nobody knows where it comes from. It barely hurts. | Ignore it, or let it soak up a stray shot. |
| **Bogey** | A bogey. It flicks itself at you and sticks: each one stuck on you slows you down a little. | Your weapons will pick them off you. Water helps, as does a tissue. |
| **Bit of Sweetcorn** | A bit of sweetcorn. It has been through the whole system intact and it is not stopping now. Tough as anything, completely harmless. | Don't waste your best hits on it. It can't hurt you. |
| **Glitter** | Glitter from a hen do. Kill it and it comes back. You will be finding it for weeks. | Area damage. It only comes back once. |
| **Phlegm Hocker** | Clears its throat, then lobs a big glob of phlegm at you. A direct hit leaves you Snotty: slower for a few seconds. | When it clears its throat, step sideways. The glob is big and slow, not clever. |
| **Snot Bubble** | A bubble blown out of a nostril. Every hit makes it swell. Pop it too late and it bursts all over the neighbourhood, you included. | Pop it early for a small splash, or from range. Static pops it at once, and harmlessly. |
| **Hayfever Cell** | Allergic to everything, mostly you. Every few seconds it winds up (AH... AH...) and sneezes a cone at you, and it sneezes back whatever statuses you have given it. | Step out of the cone when it winds up, and go easy on the statuses. Soak it with Water, then give it Cooties, and it sneezes on its friends instead. |
| **Static Sock** | A sock that has been dragged across every carpet in the body. The further it travels, the more it crackles. | Kill it before it is fully charged, or step aside when it stops to zap. Being shoved does not charge it. |
| **Stress Ball** | A stress ball. It takes every hit personally and, on the fifth Force hit, springs back and shoves you. | Use another damage type, or keep your distance once it is fully squeezed. The rebound never pushes you through a wall. |
| **Mosquito** | Bites once, then flies off with your blood. It is only borrowing it. | Kill it within four seconds for half the bite back. Once it leaves the screen, the blood goes with it. |
| **Matchstick** | Strikes itself on whatever is nearest, then charges in a straight line trailing fire. Safety was never a priority. | Step out of the lit lane, and do not swim back through the trail. |
| **Birthday Candle** | A birthday candle, lit, with a wax problem. It drips wax that sets into short-lived walls, and it lights any Mucus beside it. | Kill it, keep Mucus away from it, and swim round the wax. Wax blocks shots too. |
| **Trapped Wind** | A pocket of trapped gas. Handle with care, and do not light it near anything you are fond of. | A Fire hit or a Burning enemy touching it sets it off, once, setting Burning on everyone inside. Light it among enemies. |
| **Ingrown Hair** | An ingrown hair. It has curled the wrong way and taken it badly. | Contact weapons take damage back from its spines. Use anything that is not Contact. |

## Rival champions

Named rivals race you to the egg. They join one at a time, one with each scripted wave (every 30 seconds from about 27 seconds in), each at the level it reached racing elsewhere; anyone still missing joins the Final Five. Each scripted wave lands as several groups a couple of seconds apart. When the sperm count reaches 6, the strongest five survivors (rivals first, stand-ins after) become the Final Five. Beat them and the sperm count is 1.

**The egg.** Once the sperm count is 1 (or you reach level 60), swim into the egg. Its membrane wakes up with a boss introduction and fights back: rings of bullets that speed up as it cracks, aimed volleys, and five bodyguards budding off it every 5 seconds (one of them elite). It gives way slowly however big your build (at most 2.5% of it a second), and its warm glow heals you while you are close. Break it and you are born. Touching the egg is no longer enough on its own.

**Breaking in.** A rival who reaches level 60 before the Final Five swims for the egg and gnaws at its membrane (0.7% a second). They stop gnawing while you are hitting them. If they get through first, they fertilise the egg and you lose (BEATEN TO IT). Kill them, or win the race before they finish: when the Final Five start they leave the egg to fight you, and whatever damage they did stays in the membrane.

Knock a named rival out of the race and you choose one of their two relics.

**Early fights.** For the first two minutes no single hit can take more than half of an ordinary germ's or elite's health, so everything takes at least two; the limit lifts by five minutes, and weapon branches and mutations can push past it. Early germs are tougher (twice the health at the start, normal by eight minutes) and your damage against them starts at 70%, reaching full by ten minutes. Every level also adds a little damage, attack rate and health. Direct hits lose damage with distance: full within 220, down to 55% at 600 and beyond. Bosses and rivals are not affected by any of this except the distance.

**Kindred spirits (The Race).** Rescues are the only way to get a new weapon in a race. At 02:00 and again at 05:00 a stranded sperm of another sample turns up somewhere on the slide, marked by gold rings, a column of light and a gold arrow on the screen edge until you reach it. Swim into it to absorb it: its passive works alongside yours, your body takes on its look, and it unlocks as a starting sample. Then pick a weapon on the Weapon Draft screen: one of its three, or one of your own sample's starters you do not have yet. It goes on an empty weapon mount (up to three), or skip for 2 rerolls and keep the mount free. At 08:00 and 11:00 another sample turns up only if you have an empty mount, from a skip or from recycling a weapon in the Tackle Box (which no longer opens a replacement draft in a race). It prefers samples you have never rescued.

**Rivals in wave mode.** From wave 2, a new named rival drops into the dish with each ordinary wave (at most 3 alive at once; none join a boss wave). A wave is beaten without killing them, they leave you alone between waves and in boss waves, and every one that survives a wave comes back healed and 2 levels stronger. Dish rivals are 50% as tough as race rivals, hit 70% as hard and grow at half the pace; beating one gives half the XP, plus the usual relic choice.

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
| **Brick Wallace** (THE TANK) | x0.9 | 0.5 | 1 / 5 / 2 / 2 / 2 | **Plated**: +4 armour and 40% more HP.<br>**Lumbering**: 20% slower than other rivals. | Armour shred and damage over time. Or just outswim him. | **Mucus Wall**: +2 Shell layers, but you swim 5% slower. Snot, but load-bearing.<br>**Load-Bearing**: While you are barely moving, you take 35% less damage. |
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
| **Acid Crypt** | Yes | melt | 10 damage/s on contact | **Cast-Iron Stomach**: Acid Crypts no longer hurt you, and melt enemies twice as hard |
| **Cilia Bed** | No | repel | pushes 260 | **Brush-Off**: Cilia Beds sting everything they shove |
| **Tubal Current** | No | drift | pushes 150 | **Go With the Flow**: In a Tubal Current: +30% damage and +20% swim speed |
| **Lubricant Slick** | No | none | traction x0.3 | **Skid Marks**: On a Lubricant Slick you swim 40% faster and leave a boozy trail |

Also on the slide: the **Morning-After Pill** (a dissolving cloud that grows to about half the map, then fades), **yeast infections** (colonies that bud more yeast) and the ambient crowd of harmless swimmers outside the arena.

## Campaign (SPOILERS: where Level 1 is set)

**Level 0, Swimming Lessons** (the tutorial): one long straight tube, a lesson in each room, the egg at the end. Autorun swims you on between rooms, and each room's membrane opens once you have done what it teaches: let your weapon fire, switch RUN to COLLECT (and take your first stain), open a box, switch to HUNT, try KITE, ORBIT or HOLD, sprint, perform a Feat (you are given Power Shower if you have none), get past an acid pool, take hits in a Shell Suit (4 armour, given), and kill a junk DNA carrier and swim into its helix (Spit Take). No dying: a lethal hit is a second wind. It takes 2 to 5 minutes.

A hand-built maze, lips to throat, played as its own run (you start at Lv 1; DNA banks as usual). Finding the way is up to you: autorun fights where you are but does not solve the maze. If you go 40 seconds without getting any further, a faint chevron next to you points the way on.

1. **The Lips:** behind the front teeth, a small arena (30 kills) opens the way on.
2. **The Gum Line:** a maze. Plaque walls break if you keep shooting them (some hide shortcuts), and plaque colonies grow Cavity Creeps. A dead end holds a guarded cavity: a mutation and a DNA strand. Then the Gum Pocket arena (70).
3. **The Tongue:** open ground, saliva pools that slow everything, coughs that blow everyone towards the throat, and mouthwash fronts that sweep the tongue: get behind a tooth, because it scours everything out in the open, germs included. The Papillae arena (90) and the Back of the Tongue (110).
4. **The Throat:** the Tartar Colony (a mini-boss in calcified plaque). Beat it and the way to the egg opens. Except it is a tonsil stone. It stinks. The Egg is in another castle, and Level 2 unlocks.

Arenas seal behind you until the quota is cleared. Food scraps in the corridors break for pick-ups. After 9 minutes the toothbrush starts sweeping up from the lips (it waits while you fight the boss). Local germs: Cavity Creep, Strep Chain, Thrush Spore, Amylase Droplet, Tartar Crust.

## Achievement DNA

The hardest achievements (Chemical Warfare: ten different reactions in a run; Breaking Bad: 1,000 reactions in a run; Flawless Specimen: a boss killed without taking a hit) pay out a box where every card is Mythical or Immaculate.

## Wave mode (The Petri Dish)

The default mode. 20 waves. It starts easy: each ordinary wave brings in 2 enemy types you have not met yet this run (3 from wave 6), on top of the ones you have. Waves 1 to 3 bring them in a fixed order; after that they are drawn from the types the wave has reached (at least the next 6), the ones you have met least over all your runs first, so every type turns up within about three runs and nothing big comes early. What a wave holds is a surprise until it lands. Every 5th wave is a boss wave instead: the boss and its entourage, which keeps arriving on cue with its moves and at each enrage. Beat the boss and the wave is beaten. Bosses come by tier: wave 5 is always a tier 1 boss (The Litmus Strip, The Johnny, The Mucus Plug, The Cramp, The Sneeze: each one teaches a single mechanic), waves 10 and 15 tier 2, and wave 20 tier 3 (The Antibody Colossus, Chad Prime, The Fever). Beat wave 20 and you win (it counts as a birth). Winning once unlocks Endless.

**Terrain you can enter:** cilia beds let you through but tangle you (you crawl and cannot attack until you are out); acid crypts let you in but burn, and the acid clings to you for 2.5 seconds after you leave. Enemies are still shoved out of cilia. About half of them swim straight through acid (and burn: a lime ring shows it), the rest go round it; bosses always go round. Autorun stays out of acid.

### Big hazards

Rare and huge: 1 to 3 a run (45% one, 40% two, 15% three), never two the same (except a pair of Acid Lakes), several times the size of ordinary terrain (smaller in the Petri Dish). They treat enemies just as they treat you, so each is a tool as well as a danger. The first time one comes into view it is named. Autorun keeps out of the dangerous parts.

| Hazard | What it does |
|---|---|
| **The Plughole** | A whirlpool. It drags everything round and in (you less than enemies); the middle drowns what it catches: about 12% of an enemy's HP every half second, and it hurts you too. Bosses are not pulled. |
| **Spermicide Spill** | A cloud of foam drifting across the slide. Everything in it is slowed to 70% and burnt (enemies about 4% of their HP every half second). |
| **Hot Flush** | A warm patch. Every 14s or so it shimmers for 2.5s, then goes off: 35% of every enemy's HP inside (5% for bosses), and a hefty hit on you if you are in it. |
| **Mucus Plug** | A huge glob of mucus. Everything in it crawls at 45% speed, you and enemies alike. |
| **Acid Lake** | A pond-sized acid crypt made of several pools run together. It works like any acid (it burns, and about half of enemies wade through it) but creeps across the slide; now and then it bumps into another acid pit, or a second lake, and swallows it into one stranger shape. Sometimes two come at once. |
| **Cilia Field** | A wide field of misshapen cilia beds. Each bed tangles you like any cilia (slow, no attacking) and shoves enemies about. |

**Settings** has four tabs. GAME: game speed, Feat timing, Full Auto, tapping enemies, new enemy introductions, narrator. SCREEN: Lab or Arcade view, Darkfield, Clean clinical view, depth of field, detail, your effects, damage numbers (ALL, BIG HITS or OFF), screen shake, layout, Immersive mode, frame rate. SOUND: sound effects and music volume (0% is off), vibration. DATA: back up or restore your save, the run log, reset tutorials, reset settings, reset all progress. Tap ? on a row for what it does; a dimmed row does nothing right now and says why.

**The Tackle Box** (the toolbox button) opens on LOADOUT: autorun (all six modes, tap one), every weapon (level, next milestone, share of your damage, modifiers; tap its target to pick from all 12, plus a second choice that breaks ties and takes over when nothing fits the first; the arrow opens its full page), every Feat (cooldown, and its own timing: AUTO performs it when ready, TAP waits for you), combos, super combos and pairings your weapons are part of (closest first, with what each still needs), and your build (damage types you deal, Acquired Taste and Gone Off It, rerolls, mastery). Each weapon page starts with its targeting, then stats, the upgrade tree and modifiers. On a card screen, **YOUR BUILD** (top right) opens LOADOUT, and BACK returns to the cards. **Immersive mode** (AUTO: on in Arcade view) puts the menu buttons (AUTO, speed, Tackle Box, pause) along the top and the play buttons along the bottom.

A fresh save (and the first START SWIMMING after Settings > Data > Tutorials reset) goes straight into **Level 0, Swimming Lessons** (see Campaign), with a SKIP TUTORIAL button at the top of the screen. During runs, tutorial cards explain sprinting (after your first sprint), Feats (before your first upgrade), Lateral Gene Transfer (your first junk DNA), the egg (the first time you swim up to it; until then no arrow points to it), stains (your first grant) and each damage type and reactions (soon after you first use them). Cards come well apart and in order of need: mechanics first (at least 40 seconds apart), then damage types (from 15 seconds into a run, 45 seconds apart), reactions (from 2 minutes) and terrain (from 100 seconds, 80 seconds apart). Only the first two buffs or debuffs get a full card; after that a new one flashes NEW POWERUP UNLOCKED! beside its chip for 12 seconds, and tapping the chip or the message opens its card. Every card has a skip tutorial link, which also ends wave 0 where it stands.

In 1 run of 4 the wave 20 boss is **the Failed Experiment**: a copy of one of your own past runs (a lost one if you have any), alone in the dish, with an attack for each weapon that run carried (by its attack type) and the health of a tier 3 boss.

| Boss | Drop name | Entourage | Arrives | Cued by |
|---|---|---|---|---|
| THE MACROPHAGE QUEEN | Feeding Time | Also-Ran, Sprinter, Krill | near | summon, devour |
| THE ANTIBODY COLOSSUS | Border Control | Antibody, Mucus Wall, Also-Ran | behind | charge |
| THE IMMUNE EYE | Peer Review | Quantum Swimmer, Antibody, Sprinter, Ghost Swimmer | behind | blink |
| THE MATRON | Ward Nine | Macrophage, Nurse Cell, Mucus Wall, Headbutter | near | wardround |
| THE PEPSINATOR | Indigestion | Acid Bubble, Mitotic Cell, Also-Ran | flank | acidrain |
| CHAD PRIME | Leg Day | Headbutter, Sprinter, Krill | ring | dash3 |
| THE FEVER | Forty-One Degrees | Antibody, Acid Bubble, Also-Ran, Cytokine Caster | ring | firering |
| MITCH & OSIS | Double Dose | Mitotic Cell, Also-Ran, Nurse Cell | near | charge, spiral |
| THE PHANTOM PREGNANCY | Something in the Dish | Ghost Swimmer, Krill, Quantum Swimmer | ring | blink |
| THE LITMUS STRIP | Change of Colour | Antibody, Also-Ran, Sprinter, Krill | ring | litmusdrip |
| THE JOHNNY | Safe Sex | Headbutter, Also-Ran, Sprinter | behind | johnnyroll |
| THE MUCUS PLUG | Sealed In | Also-Ran, Mitotic Cell, Krill | near | mucusspit |
| THE CRAMP | Time of the Month | Sprinter, Also-Ran, Headbutter | ring | crampgrip |
| THE SNEEZE | Bless You | Also-Ran, Krill, Sprinter | flank | sneezecone |
| THE KIDNEY STONE | Passing Through | Mucus Wall, Antibody, Also-Ran, Macrophage | behind | stoneroll |

**Wave conditions:** from wave 4, about half the ordinary waves (never two in a row) come with something wrong in the dish for the whole wave. Its name stays on screen until the wave is beaten.

| Condition | Effect |
|---|---|
| **LAMP BLOWN** | The microscope lamp has gone. You can only see what is close to you. +20% XP. |
| **STIRRING ROD** | Someone is stirring the dish. A current sweeps everything along, and it keeps turning. |
| **THICK AGAR** | The agar set too thick. Everything swims a quarter slower, you included, and so do the bullets. |
| **LEAKY DRIP TRAY** | Drops of acid keep landing in the dish. Swim out of the rings before they land. They burn enemies too. |
| **INCUBATOR ON HIGH** | It is 41 degrees in here. Everything swims faster and shooters fire more often. +20% XP. |

**Sequences:** you start with the Firstborn, the Chonker and the Bright Spark. The rest unlock one rung at a time (see the Unlock column under Sequences), alternating skill and grind. After a wave-mode win, NEW SEQUENCE takes you straight back to sequence select.

Boss waves: entourage warm-up (seconds) 16, 12, 10, 10; boss health (times its base) 3.5, 13, 50, 130; boss attack strength 0.55, 0.82, 1, 1.1.

## Boss rewards

Every boss pays twice: a relic (its own three, plus one smuggled relic from a boss you will not meet this run), then a SPOILS box. It also heals you 40%. Spoils are three of these (usually including a full-power Switched at Birth on one of your weapons):

| Spoils | Effect |
|---|---|
| **Trophy Polish** | Every weapon you own goes up a level. |
| **Boss Blood** | +15% max HP, and heal to full. |
| **Adrenal Gland** | +8% damage and +8% fire rate, for good. |
| **Trophy Hide** | +1 Shell layer and +6% dodge. Someone else's skin, worn with pride. |
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
- **Tap to inspect:** Tap an enemy or boss (a quick touch that barely moves; steering is untouched) for its card: HP, speed, armour, what it deals, what it is weak to and resists, and its joke. Enemies you have not met show as a silhouette and "Not met yet". Tap a damage type on a card, or a row in Active effects, for that card. Every damage type card has a Reactions button: an 8 by 8 chart of what each pair sets off, with "?" for ones you have not triggered. The chart is in the Field Guide too. Settings > Game > Tap an enemy: PAUSE (default) stops the game while a card is open, HALF SPEED slows it to half.
- **Feat slots:** Two. Feats perform themselves on cooldown.
- **Damage-type set:** Two weapons or Feats of the same damage type turn on its set bonus.
- **Weapon mounts:** Three (Lv 1 and drafts at 5 and 12), plus up to 0 bonus mounts from combos.
- **Player base stats:** 120 HP, 150 swim speed, 5% crit, x1.6 crit damage, 105 pickup radius, 0 armour, 0 dodge. You grow with max HP.

## Secret Field Guide entries (spoilers)

**Spoiler warning.** 18 hidden interactions. In the game each one stays ??? in the Field Guide until it happens to you for the first time; each line below says what sets it off.

| Secret | How it happens |
|---|---|
| **Belly Full of Nappies** | A Toddler Gravity orb swallowed your Nappy Mines. They all went off together when it collapsed. |
| **Gravity Assist** | Your shots curved round a black hole and flew out faster and harder. Ask a space probe. |
| **Live Puddle** | Static hit something standing in a boozy puddle, and everyone else in the puddle got it too. |
| **Flammable Fumes** | Something melting touched a boozy puddle and the whole thing went up. |
| **Slip Hazard** | Mucus turned a puddle to slime. Enemies slide about on it; you skate across it faster. |
| **Bar of Soap** | You rammed a glued enemy at speed. It burst, and the suds hit what was behind it. |
| **Hereditary** | An infected enemy split during Identical Twins, and both halves kept the infection. |
| **Downstream** | Waters Breaking swept your mines, puddles and black holes along with everything else. |
| **Glow in the Dark** | In the dark, acid glows. Melting things light up their surroundings during Lights Out. |
| **Head-On** | Ramming counts closing speed: swim straight at something fast and it hits much harder. |
| **Something It Ate** | An amoeba swallowed something it should not have: a mine, a black hole, or an infected cell. |
| **Pocket Hoover** | A black hole sucked up loot lying on the floor, then spat it all out to you when it collapsed. |
| **Double Booked** | Two Due Dates landed on the same enemy. The dates merged: the countdown started again, owing half as much more. |
| **Contagious Paperwork** | Red Tape bundled an infected enemy with healthy ones. The infection travelled along the tape to all of them. |
| **Scared Stiff** | BOO! hit something that was already glued. It burst from the fright. |
| **Double Bluff** | Your Imaginary Friend copied Peekaboo. Two BOOs, back to back, from two places at once. |
| **Hole in One** | A flung enemy sailed over a baby tooth and grabbed it mid-air. The Tooth Fairy noticed. |
| **Tooth Thief** | A rival champion picked up one of your baby teeth. The Tooth Fairy does not check whose tooth it was. |
