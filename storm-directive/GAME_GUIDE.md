# Spawn Prawn: complete game guide

Every weapon, spell, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.

## Contents
1. [How upgrades work](#how-upgrades-work)
2. [Weapons](#weapons)
3. [Fusions (weapon merges)](#fusions-weapon-merges)
4. [Spells](#spells)
5. [Power-ups (passives)](#power-ups-passives)
6. [Weapon branch perks](#weapon-branch-perks)
7. [Modifiers](#modifiers)
8. [Duo combos](#duo-combos)
9. [Stains](#stains)
10. [Cursed cards](#cursed-cards)
11. [Field pickups](#field-pickups)
12. [Elemental reactions](#elemental-reactions)
13. [Element synergies](#element-synergies)
14. [Targeting directives](#targeting-directives)
15. [Movement directives](#movement-directives)
16. [Gene Bank (permanent upgrades)](#gene-bank-permanent-upgrades)
17. [Enemies](#enemies)
18. [Bosses](#bosses)
19. [Rival champions](#rival-champions)
20. [Terrain](#terrain)
21. [Sperm samples](#sperm-samples)

## How upgrades work

1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, spells, power-ups, modifiers, stains and (rarely) curses.
2. **Weapons** level up to Lv10. At Lv 3, 5, 8, 10 you pick one of three branch perks. Each weapon's tree is fixed, so you can plan it (listed per weapon below). Lv10 is the mastery pick.
3. **Fusions:** two specific weapons, both at Lv4+, fuse into a stronger weapon.
4. **Modifiers:** up to 3 per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.
5. **Weapon slots:** 3 to start, one more at Lv 15, 30, 45.
6. **Rarity** multiplies a card's value:

| Rarity | Multiplier | Weapon levels granted | Drop weight |
|---|---|---|---|
| Bronze | x1 | +1 | 60% |
| Silver | x1.5 | +1 | 27% |
| Gold | x2 | +2 | 10% |
| Legendary | x3 | +3 | 3% |

**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.

## Weapons

74 base weapons. **Start** = can appear in your first box. **Bank** = add it to the first box from the Gene Bank (DNA cost shown). Every weapon can also drop from level-ups and DNA strands.

### Kinetic weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Spitball** (Start)<br>gun, aims NEAREST | Reliable, accurate single shots. Mildly unhygienic. | dmg 10, cd 0.3s, mag 12, reload 1.1s, range 430 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +30% dmg | **Lv3:** Extra Spicy / Pointy Head / Trampoline Rounds<br>**Lv5:** Plus One / Kick Them While Down / Cell Division<br>**Lv8:** Sugar Rush / Giant Killer / Due Date Panic<br>**Lv10:** Espresso Drip / Octuplets / Final Form | + Pass the Parcel = Bouncy Castle Magnum |
| **Sneeze Gun** (Start)<br>gun, aims NEAREST | Sprays a hail of light droplets. Big magazine, long recovery. Bless you. | dmg 4.5, cd 0.075s, mag 36, reload 1.7s, range 370 | Lv3: 15% faster; Lv5: +1 pierce; Lv7: +1 count | **Lv3:** Trampoline Rounds / Nappy Bag / Pointy Head<br>**Lv5:** Carpet Shock / Ice Queen / Bloodsucker<br>**Lv8:** Domino Effect / Electric Personality / Sugar Rush<br>**Lv10:** Espresso Drip / Octuplets / Umbilical Cord | + Helicopter Parent = Grandparent Hive |
| **Hiccup Scattergun** (Start)<br>gun, aims NEAREST | Close-range burst with knockback. Comes out whether you want it to or not. | dmg 8, cd 0.75s, mag 4, reload 1.6s, x6, range 270<br>knock 70 | Lv3: +2 count; Lv5: +1 pierce; Lv7: +3 count | **Lv3:** Extra Spicy / Nappy Bag / Cold Shoulder<br>**Lv5:** Kick Them While Down / Carpet Shock / Toxic Relationship<br>**Lv8:** Sugar Rush / Due Date Panic / Twins!<br>**Lv10:** Espresso Drip / No Survivors / Umbilical Cord | + Static Cling = Static Hiccups |
| **Kidney Stone Railgun** (Start)<br>gun, aims HIGHEST ARMOUR | A hypersonic calcified slug. Pierces everything, shreds armour, hurts everyone involved. | dmg 42, cd 1.3s, mag 3, reload 2.2s, pierce 99, range 720<br>shred 3 | Lv3: +2 shred; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Nappy Bag / Hair Trigger / Cold Shoulder<br>**Lv5:** Toxic Relationship / Kick Them While Down / Special Delivery<br>**Lv8:** Electric Personality / Due Date Panic / Twins!<br>**Lv10:** Octuplets / Umbilical Cord / Espresso Drip | + Ultrasound Beam = Full-Body Scan |
| **Yo-Yo Diet** (Start)<br>gun, aims FURTHEST | A spinning blade that flies out and always comes back. Like the weight. | dmg 15, cd 1s, mag 2, reload 1.3s, pierce 99, range 330<br>boomerang 1 | Lv3: +1 count; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Extra Spicy / Pointy Head / Hot Load<br>**Lv5:** Toxic Relationship / Ice Queen / Punching Up<br>**Lv8:** Domino Effect / Due Date Panic / Sugar Rush<br>**Lv10:** Final Form / Octuplets / Espresso Drip | + Doting Relatives = Tantrum Cyclone |
| **Contraction Gatling**<br>gun, aims NEAREST | Spins up faster and faster and faster. Breathe through it. | dmg 5.5, cd 0.14s, mag 120, reload 3.2s, range 450 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +30% dmg | **Lv3:** Trampoline Rounds / Cold Shoulder / Extra Spicy<br>**Lv5:** Toxic Relationship / Special Delivery / Kick Them While Down<br>**Lv8:** Twins! / Giant Killer / Domino Effect<br>**Lv10:** Final Form / Octuplets / Umbilical Cord | + Tongue Depressor Crossbow = Forceps Repeater |
| **Pass the Parcel**<br>gun, aims NEAREST | Discs bounce from enemy to enemy. Nobody wants to be holding one when the music stops. | dmg 13, cd 0.8s, mag 3, reload 1.5s, range 420<br>bounce 3 | Lv3: +2 bounce; Lv5: +1 count; Lv7: +3 bounce | **Lv3:** Trampoline Rounds / Sharp Tongue / Nappy Bag<br>**Lv5:** Special Delivery / Carpet Shock / Plus One<br>**Lv8:** Giant Killer / Sugar Rush / Domino Effect<br>**Lv10:** Umbilical Cord / Octuplets / No Survivors | + Spitball = Bouncy Castle Magnum |
| **Tongue Depressor Crossbow**<br>gun, aims STRONGEST | Heavy bolts: massive knockback, light armour shred. Say "ahh". | dmg 24, cd 0.9s, mag 4, reload 1.6s, pierce 2, range 540<br>knock 220, shred 1 | Lv3: +2 pierce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Trampoline Rounds / Nappy Bag<br>**Lv5:** Special Delivery / Homing Instinct / Kick Them While Down<br>**Lv8:** Electric Personality / Sugar Rush / Giant Killer<br>**Lv10:** Umbilical Cord / No Survivors / Final Form | + Contraction Gatling = Forceps Repeater |
| **Birth Plan Committee**<br>gun, aims STRONGEST | Three barrels, three directives, zero consensus. Nobody follows the birth plan. Set each barrel in the Armoury. | dmg 9, cd 0.45s, mag 9, reload 1.6s, range 450 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Hot Load / Extra Spicy<br>**Lv5:** Plus One / Homing Instinct / Carpet Shock<br>**Lv8:** Due Date Panic / Domino Effect / Giant Killer<br>**Lv10:** Octuplets / Espresso Drip / No Survivors | - |
| **Family Grudge**<br>gun, aims REVENGE | Remembers whatever last hurt you. Hunts it across the whole map. Triple damage to it. Very healthy. | dmg 20, cd 0.6s, mag 5, reload 1.5s, range 480<br>homing 3 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Extra Spicy / Trampoline Rounds / Hot Load<br>**Lv5:** Toxic Relationship / Special Delivery / Bloodsucker<br>**Lv8:** Twins! / Giant Killer / Domino Effect<br>**Lv10:** Final Form / No Survivors / Espresso Drip | - |
| **Slipstream Scalpel**<br>wake, aims NEAREST | Your flight path becomes a blade. Keep moving, or it is just very expensive litter. | dmg 22<br>dur 2.2, area 22 | Lv3: +30% area; Lv5: +50% duration; Lv7: +50% dmg | **Lv3:** Hot Load / Extra Spicy / Cold Shoulder<br>**Lv5:** Bloodsucker / Special Delivery / Toxic Relationship<br>**Lv8:** Due Date Panic / Electric Personality / Giant Killer<br>**Lv10:** Umbilical Cord / Espresso Drip / Final Form | + Morning Sickness = Nappy Trail |
| **Child Benefit Cannon**<br>gun, aims STRONGEST | Fires your savings. 1 scrap per shot, enormous bang. Financial advisers weep. | dmg 55, cd 0.8s, mag 99, reload 0.5s, range 480<br>explode 55, knock 120 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Wide Hips / Sharp Tongue / Pointy Head<br>**Lv5:** Cell Division / Punching Up / Ice Queen<br>**Lv8:** Electric Personality / Giant Killer / Due Date Panic<br>**Lv10:** Final Form / Umbilical Cord / Octuplets | + Bedpan Mortar = Pyramid Scheme |
| **Gender Reveal Blaster**<br>gun, aims NEAREST | Every magazine is a surprise. Every surprise is a letdown. Except the Legendary ones. Those explode and set fire to a forest. | dmg 12, cd 0.22s, mag 12, reload 1.3s, range 440 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +30% dmg | **Lv3:** Nappy Bag / Sharp Tongue / Pointy Head<br>**Lv5:** Toxic Relationship / Carpet Shock / Cell Division<br>**Lv8:** Due Date Panic / Electric Personality / Domino Effect<br>**Lv10:** No Survivors / Umbilical Cord / Final Form | - |
| **Chromosome Whip** (Bank 80)<br>gun, aims FURTHEST | A coiled chromosome on a crack. Flies out, snaps back, hits everything twice. | dmg 17, cd 0.9s, mag 2, reload 1.2s, pierce 99, range 300<br>boomerang 1 | Lv3: +1 count; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Hot Load / Cold Shoulder / Sharp Tongue<br>**Lv5:** Plus One / Ice Queen / Punching Up<br>**Lv8:** Giant Killer / Twins! / Electric Personality<br>**Lv10:** Octuplets / Final Form / Umbilical Cord | + Cilia Flail = Spindle Apparatus |
| **Keratin Nailgun** (Bank 60)<br>gun, aims NEAREST | Fires fingernail clippings at alarming speed. Please do not ask where it gets them. | dmg 5, cd 0.09s, mag 32, reload 1.5s, pierce 1, range 400 | Lv3: +1 pierce; Lv5: 15% faster; Lv7: +1 count | **Lv3:** Trampoline Rounds / Pointy Head / Nappy Bag<br>**Lv5:** Punching Up / Homing Instinct / Carpet Shock<br>**Lv8:** Giant Killer / Twins! / Due Date Panic<br>**Lv10:** Octuplets / No Survivors / Espresso Drip | - |
| **Cilia Flail**<br>orbit, aims NEAREST | A ring of stiffened cilia sweeps around you. Very tidy. Very rude. | dmg 14, reload 2s, x4, range 90<br>dur 4, radius 64, spin 4.2 | Lv3: +1 count; Lv5: +30% area; Lv7: +2 count | **Lv3:** Extra Spicy / Sharp Tongue / Wide Hips<br>**Lv5:** Special Delivery / Carpet Shock / Ice Queen<br>**Lv8:** Domino Effect / Electric Personality / Giant Killer<br>**Lv10:** Espresso Drip / Final Form / No Survivors | + Chromosome Whip = Spindle Apparatus |
| **Collagen Crossbow**<br>gun, aims STRONGEST | Tough protein bolts that pierce and push. Structural integrity as a weapon. | dmg 26, cd 0.8s, mag 4, reload 1.6s, pierce 2, range 560<br>knock 60 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Hot Load / Hair Trigger / Cold Shoulder<br>**Lv5:** Toxic Relationship / Homing Instinct / Carpet Shock<br>**Lv8:** Sugar Rush / Twins! / Giant Killer<br>**Lv10:** Final Form / Espresso Drip / Octuplets | - |
| **Bone Marrow Mortar**<br>lob, aims DENSEST CLUSTER | Lobs dense marrow shells. Lands like a femur. | dmg 46, cd 1.7s, mag 2, reload 2.4s, range 520<br>area 78, flight 1, explode 1 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Nappy Bag / Cold Shoulder / Hot Load<br>**Lv5:** Special Delivery / Kick Them While Down / Carpet Shock<br>**Lv8:** Domino Effect / Due Date Panic / Twins!<br>**Lv10:** Octuplets / No Survivors / Final Form | + Metabolic Flare = Osteoclast Barrage |
| **Histone Hammer**<br>gun, aims NEAREST | A point-blank wall of packed DNA spools. Enormous knockback. | dmg 11, cd 0.9s, mag 3, reload 1.5s, x7, pierce 1, range 220<br>knock 130 | Lv3: +2 count; Lv5: +30% dmg; Lv7: +3 count | **Lv3:** Sharp Tongue / Hot Load / Pointy Head<br>**Lv5:** Ice Queen / Toxic Relationship / Homing Instinct<br>**Lv8:** Twins! / Electric Personality / Sugar Rush<br>**Lv10:** Umbilical Cord / No Survivors / Final Form | - |
| **Tendon Railshot**<br>gun, aims HIGHEST ARMOUR | A tendon wound until it snaps. Pierces everything, shreds armour. | dmg 36, cd 1.1s, mag 3, reload 2s, pierce 99, range 680<br>shred 2.5 | Lv3: +2 shred; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Hair Trigger / Sharp Tongue / Extra Spicy<br>**Lv5:** Cell Division / Punching Up / Homing Instinct<br>**Lv8:** Sugar Rush / Domino Effect / Giant Killer<br>**Lv10:** Octuplets / Final Form / No Survivors | - |
| **Zona Punch**<br>gun, aims NEAREST | A hardened glycoprotein disc that ricochets around like it owns the place. | dmg 16, cd 0.7s, mag 3, reload 1.4s, range 380<br>bounce 3 | Lv3: +2 bounce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Nappy Bag / Pointy Head / Cold Shoulder<br>**Lv5:** Ice Queen / Toxic Relationship / Homing Instinct<br>**Lv8:** Electric Personality / Sugar Rush / Domino Effect<br>**Lv10:** Final Form / Espresso Drip / Octuplets | - |

### Fire weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Bottle Rockets** (Start)<br>gun, aims DENSEST CLUSTER | Explosive baby bottles that set the blast zone alight. Test the temperature first. | dmg 24, cd 0.55s, mag 2, reload 2.4s, range 500<br>explode 62 | Lv3: +25% area; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Hair Trigger / Trampoline Rounds<br>**Lv5:** Carpet Shock / Bloodsucker / Special Delivery<br>**Lv8:** Domino Effect / Giant Killer / Due Date Panic<br>**Lv10:** No Survivors / Espresso Drip / Octuplets | + Seeker Siblings = Sibling Rivalry |
| **Heartburn** (Start)<br>gun, aims NEAREST | Short-range cone of fire. Every lick burns. Antacids not included. | dmg 3.2, cd 0.05s, mag 50, reload 2.1s, x2, pierce 99, range 200 | Lv3: +30% area; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Extra Spicy / Nappy Bag / Wide Hips<br>**Lv5:** Bloodsucker / Punching Up / Kick Them While Down<br>**Lv8:** Twins! / Domino Effect / Electric Personality<br>**Lv10:** Octuplets / Umbilical Cord / Final Form | + Cold Feet = Hot Flush Cold Sweat |
| **Nappy Mines**<br>mine, aims NEAREST | Drops proximity mines in your wake. Nobody wants to change them. | dmg 32, cd 0.7s, mag 5, reload 2.4s, range 600<br>explode 72, life 14 | Lv3: +1 count; Lv5: +30% area; Lv7: +50% dmg | **Lv3:** Sharp Tongue / Cold Shoulder / Nappy Bag<br>**Lv5:** Bloodsucker / Punching Up / Plus One<br>**Lv8:** Due Date Panic / Giant Killer / Twins!<br>**Lv10:** Final Form / No Survivors / Umbilical Cord | + Toddler Gravity = Sleep Regression Mines |
| **Bedpan Mortar**<br>lob, aims DENSEST CLUSTER | Slow, heavy shells with a huge blast. Contents best not discussed. | dmg 42, cd 1.6s, mag 2, reload 2.5s, range 540<br>area 82, flight 1, explode 1 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Hot Load / Extra Spicy / Cold Shoulder<br>**Lv5:** Special Delivery / Kick Them While Down / Punching Up<br>**Lv8:** Electric Personality / Twins! / Giant Killer<br>**Lv10:** Umbilical Cord / Final Form / Octuplets | + Morning Sickness = Nappy Bomb<br>+ Child Benefit Cannon = Pyramid Scheme |
| **Thermometer Lance**<br>beam, aims NEAREST | No magazine, just temperature. Overheat and it vents a fireball around you. Not for oral use. | dmg 38, cd 0s, mag 1, reload 1.3s, range 300<br>dur 3.2, area 150 | Lv3: +30% duration; Lv5: +30% area; Lv7: +40% dmg | **Lv3:** Hot Load / Extra Spicy / Wide Hips<br>**Lv5:** Ice Queen / Toxic Relationship / Kick Them While Down<br>**Lv8:** Due Date Panic / Sugar Rush / Electric Personality<br>**Lv10:** Final Form / Espresso Drip / No Survivors | - |
| **Hindsight Launcher**<br>prequel, aims DENSEST CLUSTER | The explosion happens first. The shell arrives afterwards, flying backwards into the barrel, still angry. | dmg 34, cd 1.1s, mag 3, reload 2s, range 480<br>area 70 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Cold Shoulder / Hot Load / Hair Trigger<br>**Lv5:** Kick Them While Down / Ice Queen / Special Delivery<br>**Lv8:** Due Date Panic / Twins! / Giant Killer<br>**Lv10:** No Survivors / Final Form / Espresso Drip | - |
| **Enzyme Torch**<br>gun, aims NEAREST | Digestive enzymes, heated. It does not so much burn as disagree with you. | dmg 3.6, cd 0.05s, mag 44, reload 2s, x2, pierce 99, range 190<br>pIgnite 0.2 | Lv3: +30% area; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Sharp Tongue / Cold Shoulder / Pointy Head<br>**Lv5:** Special Delivery / Bloodsucker / Homing Instinct<br>**Lv8:** Giant Killer / Sugar Rush / Domino Effect<br>**Lv10:** Umbilical Cord / Final Form / Octuplets | + Liquid Nitrogen Spray = Thermal Cycler |
| **Metabolic Flare** (Bank 90)<br>gun, aims DENSEST CLUSTER | Burns a week of calories in one rocket. Explodes in a satisfying way. | dmg 22, cd 0.5s, mag 3, reload 2.2s, range 520<br>explode 58 | Lv3: +25% area; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Hair Trigger / Pointy Head / Hot Load<br>**Lv5:** Special Delivery / Bloodsucker / Plus One<br>**Lv8:** Due Date Panic / Sugar Rush / Twins!<br>**Lv10:** Final Form / Umbilical Cord / Octuplets | + Bone Marrow Mortar = Osteoclast Barrage |
| **Fever Pitch**<br>beam, aims NEAREST | A 41-degree beam. Overheat and you vent the whole fever around you. | dmg 34, cd 0s, mag 1, reload 1.2s, range 290<br>dur 3.4, area 140 | Lv3: +30% duration; Lv5: +30% area; Lv7: +40% dmg | **Lv3:** Hair Trigger / Extra Spicy / Sharp Tongue<br>**Lv5:** Special Delivery / Punching Up / Toxic Relationship<br>**Lv8:** Domino Effect / Sugar Rush / Giant Killer<br>**Lv10:** No Survivors / Final Form / Espresso Drip | - |
| **Mitochondrial Grenade**<br>lob, aims DENSEST CLUSTER | The powerhouse of the cell, thrown. The school textbooks were right all along. | dmg 38, cd 1.3s, mag 3, reload 2.1s, range 480<br>area 70, flight 0.8, explode 1 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Cold Shoulder / Wide Hips / Nappy Bag<br>**Lv5:** Plus One / Ice Queen / Toxic Relationship<br>**Lv8:** Due Date Panic / Sugar Rush / Domino Effect<br>**Lv10:** Espresso Drip / Final Form / Octuplets | - |
| **Pyrogen Mines**<br>mine, aims NEAREST | Leaves little fever-inducing mines behind you. The host will feel it too. | dmg 30, cd 0.6s, mag 6, reload 2.2s, range 600<br>explode 66, life 14, pIgnite 0.3 | Lv3: +1 count; Lv5: +30% area; Lv7: +50% dmg | **Lv3:** Sharp Tongue / Wide Hips / Hair Trigger<br>**Lv5:** Plus One / Special Delivery / Ice Queen<br>**Lv8:** Due Date Panic / Giant Killer / Electric Personality<br>**Lv10:** Umbilical Cord / Espresso Drip / Octuplets | - |
| **Acrosome Burst**<br>gun, aims NEAREST | The enzyme cap you were meant to use on the egg, fired at everything else instead. | dmg 12, cd 0.8s, mag 4, reload 1.4s, x5, range 240<br>explode 26 | Lv3: +2 count; Lv5: +30% area; Lv7: +40% dmg | **Lv3:** Wide Hips / Hair Trigger / Pointy Head<br>**Lv5:** Cell Division / Punching Up / Carpet Shock<br>**Lv8:** Domino Effect / Due Date Panic / Sugar Rush<br>**Lv10:** Final Form / Umbilical Cord / Espresso Drip | - |

### Frost weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Cold Feet** (Start)<br>gun, aims FASTEST | Piercing ice shards that chill and freeze. Commitment issues, weaponised. | dmg 15, cd 0.6s, mag 5, reload 1.5s, pierce 3, range 460 | Lv3: +1 count; Lv5: +3 pierce; Lv7: +2 count | **Lv3:** Hot Load / Cold Shoulder / Sharp Tongue<br>**Lv5:** Special Delivery / Ice Queen / Bloodsucker<br>**Lv8:** Giant Killer / Sugar Rush / Twins!<br>**Lv10:** Final Form / No Survivors / Umbilical Cord | + Heartburn = Hot Flush Cold Sweat<br>+ Frozen Peas = Egg Freezing Service<br>+ Placental Siphon = Return to Sender |
| **Frozen Peas**<br>lob, aims DENSEST CLUSTER | Rains frozen peas around the target. Also good for swelling. | dmg 11, cd 1.4s, mag 2, reload 2s, x5, range 460<br>area 36, flight 0.7, explode 1 | Lv3: +2 count; Lv5: +30% area; Lv7: +3 count | **Lv3:** Hot Load / Nappy Bag / Extra Spicy<br>**Lv5:** Plus One / Carpet Shock / Kick Them While Down<br>**Lv8:** Electric Personality / Domino Effect / Sugar Rush<br>**Lv10:** Umbilical Cord / No Survivors / Octuplets | + Cold Feet = Egg Freezing Service |
| **Cryo Pipette** (Bank 60)<br>gun, aims FASTEST | Precise drops of liquid cold. Lab-grade accuracy, very poor bedside manner. | dmg 14, cd 0.5s, mag 6, reload 1.4s, pierce 2, range 480<br>pChill 1 | Lv3: +1 count; Lv5: +2 pierce; Lv7: +1 count | **Lv3:** Nappy Bag / Cold Shoulder / Sharp Tongue<br>**Lv5:** Special Delivery / Homing Instinct / Toxic Relationship<br>**Lv8:** Giant Killer / Electric Personality / Sugar Rush<br>**Lv10:** Espresso Drip / Umbilical Cord / Final Form | + Hailstone Swarm = Cryobank |
| **Liquid Nitrogen Spray**<br>gun, aims NEAREST | A cone of minus 196 degrees. Things that stay in it stay put. | dmg 2.6, cd 0.05s, mag 46, reload 2s, x2, pierce 99, range 190<br>pChill 1 | Lv3: +30% area; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Extra Spicy / Hot Load / Trampoline Rounds<br>**Lv5:** Toxic Relationship / Bloodsucker / Homing Instinct<br>**Lv8:** Giant Killer / Domino Effect / Electric Personality<br>**Lv10:** Umbilical Cord / Octuplets / No Survivors | + Enzyme Torch = Thermal Cycler |
| **Frozen Embryo Mortar**<br>lob, aims DENSEST CLUSTER | Cryo-stored and very cross about it. Shatters into a freezing blast. | dmg 34, cd 1.4s, mag 2, reload 2.3s, range 500<br>area 76, flight 0.9, explode 1, pChill 1 | Lv3: +25% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Cold Shoulder / Hair Trigger / Extra Spicy<br>**Lv5:** Punching Up / Bloodsucker / Plus One<br>**Lv8:** Domino Effect / Twins! / Giant Killer<br>**Lv10:** Espresso Drip / Octuplets / No Survivors | - |
| **Hailstone Swarm** (Bank 90)<br>gun, aims WEAKEST | Homing ice pellets. Small, cold and personal. | dmg 8, cd 0.4s, mag 8, reload 1.9s, x2, range 480<br>homing 5, pChill 1 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Trampoline Rounds / Nappy Bag / Cold Shoulder<br>**Lv5:** Punching Up / Cell Division / Kick Them While Down<br>**Lv8:** Giant Killer / Sugar Rush / Twins!<br>**Lv10:** Octuplets / Final Form / Umbilical Cord | + Cryo Pipette = Cryobank |
| **Glacial Orbit**<br>orbit, aims NEAREST | Ice crystals orbit you and chill whatever they touch. | dmg 13, reload 2.2s, x3, range 100<br>dur 4.5, radius 78, spin 3.2, pChill 1 | Lv3: +1 count; Lv5: +30% area; Lv7: +2 count | **Lv3:** Cold Shoulder / Hair Trigger / Hot Load<br>**Lv5:** Carpet Shock / Kick Them While Down / Ice Queen<br>**Lv8:** Sugar Rush / Domino Effect / Due Date Panic<br>**Lv10:** Final Form / Espresso Drip / Octuplets | - |

### Shock weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Static Cling** (Start)<br>chain, aims DENSEST CLUSTER | Instant lightning that arcs between enemies, like a nylon onesie in winter. | dmg 13, cd 0.7s, mag 6, reload 1.8s, range 330<br>chain 3, jump 140 | Lv3: +2 chain; Lv5: +1 count; Lv7: +3 chain | **Lv3:** Hair Trigger / Extra Spicy / Nappy Bag<br>**Lv5:** Special Delivery / Toxic Relationship / Ice Queen<br>**Lv8:** Domino Effect / Sugar Rush / Twins!<br>**Lv10:** Final Form / No Survivors / Umbilical Cord | + Hiccup Scattergun = Static Hiccups<br>+ Booster Jab = Nervous Breakdown |
| **Helicopter Parent**<br>gun, aims LOWEST HEALTH | Hovers beside you and fires shock bolts at anyone who looks at you funny. | dmg 8, cd 0.45s, mag 10, reload 1.5s, range 420 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Sharp Tongue / Trampoline Rounds / Pointy Head<br>**Lv5:** Special Delivery / Ice Queen / Bloodsucker<br>**Lv8:** Due Date Panic / Sugar Rush / Giant Killer<br>**Lv10:** Espresso Drip / Final Form / No Survivors | + Sneeze Gun = Grandparent Hive |
| **Umbilical Tether**<br>tether, aims HIGHEST HEALTH | Ties two monsters together with a lightning cord and makes them hug. Violently. | dmg 16, cd 1.1s, mag 3, reload 1.8s, range 380<br>dur 3, pull 170, jump 240 | Lv3: +1 count; Lv5: +40% duration; Lv7: +50% dmg | **Lv3:** Sharp Tongue / Extra Spicy / Nappy Bag<br>**Lv5:** Special Delivery / Kick Them While Down / Toxic Relationship<br>**Lv8:** Due Date Panic / Twins! / Sugar Rush<br>**Lv10:** Umbilical Cord / Final Form / No Survivors | - |
| **Nerve Impulse** (Bank 70)<br>chain, aims DENSEST CLUSTER | An action potential, weaponised. Jumps from cell to cell faster than gossip. | dmg 12, cd 0.6s, mag 7, reload 1.7s, range 320<br>chain 4, jump 150 | Lv3: +2 chain; Lv5: +1 count; Lv7: +3 chain | **Lv3:** Sharp Tongue / Nappy Bag / Hair Trigger<br>**Lv5:** Special Delivery / Carpet Shock / Punching Up<br>**Lv8:** Sugar Rush / Giant Killer / Domino Effect<br>**Lv10:** No Survivors / Espresso Drip / Final Form | + Axon Rail = Action Potential |
| **Axon Rail**<br>gun, aims STRONGEST | A myelinated slug down a very long nerve. Arcs to whatever it passes. | dmg 30, cd 1.2s, mag 3, reload 2s, pierce 99, range 700<br>pArc 0.35, pArcDmg 0.5, pArcN 1 | Lv3: +1 count; Lv5: +30% dmg; Lv7: +50% dmg | **Lv3:** Trampoline Rounds / Nappy Bag / Hot Load<br>**Lv5:** Plus One / Homing Instinct / Toxic Relationship<br>**Lv8:** Electric Personality / Twins! / Due Date Panic<br>**Lv10:** Final Form / Octuplets / No Survivors | + Nerve Impulse = Action Potential |
| **Synapse Drone**<br>gun, aims LOWEST HEALTH | Tiny neurons in hover mode, firing sparks at whatever looks weakest. | dmg 7, cd 0.4s, mag 12, reload 1.5s, range 430 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Hot Load / Trampoline Rounds / Nappy Bag<br>**Lv5:** Cell Division / Plus One / Kick Them While Down<br>**Lv8:** Domino Effect / Sugar Rush / Twins!<br>**Lv10:** Octuplets / Final Form / No Survivors | - |
| **Pacemaker**<br>gun, aims STRONGEST | One steady, heavy jolt every beat. Stuns what it hits. | dmg 40, cd 1s, mag 6, reload 1.6s, pierce 1, range 520<br>freezeHit 1 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Sharp Tongue / Hot Load / Cold Shoulder<br>**Lv5:** Kick Them While Down / Ice Queen / Homing Instinct<br>**Lv8:** Twins! / Electric Personality / Sugar Rush<br>**Lv10:** Final Form / Umbilical Cord / No Survivors | + Defibrillator = Crash Cart |
| **Defibrillator**<br>chain, aims NEAREST | CLEAR! Big, short-range shocks that leap through a crowd. | dmg 30, cd 1.8s, mag 2, reload 2.2s, range 220<br>chain 6, jump 120 | Lv3: +2 chain; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Sharp Tongue / Extra Spicy / Cold Shoulder<br>**Lv5:** Punching Up / Plus One / Kick Them While Down<br>**Lv8:** Due Date Panic / Giant Killer / Electric Personality<br>**Lv10:** Umbilical Cord / No Survivors / Final Form | + Pacemaker = Crash Cart |
| **Ion Channel**<br>beam, aims STRONGEST | Opens a channel and lets the current flow straight through a line of foes. | dmg 28, cd 1.6s, mag 3, reload 2.1s, range 400<br>dur 1.2, pArc 0.25, pArcDmg 0.5, pArcN 1 | Lv3: +35% duration; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Hot Load / Sharp Tongue<br>**Lv5:** Kick Them While Down / Punching Up / Ice Queen<br>**Lv8:** Sugar Rush / Due Date Panic / Domino Effect<br>**Lv10:** Umbilical Cord / Espresso Drip / No Survivors | - |

### Toxic weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Morning Sickness** (Start)<br>lob, aims DENSEST CLUSTER | Lobs acid globs that leave toxic puddles. Worse before noon. | dmg 9, cd 0.9s, mag 4, reload 1.8s, range 390<br>area 55, dur 3, flight 0.6 | Lv3: +50% duration; Lv5: +1 count; Lv7: +40% area | **Lv3:** Cold Shoulder / Nappy Bag / Sharp Tongue<br>**Lv5:** Punching Up / Bloodsucker / Carpet Shock<br>**Lv8:** Twins! / Sugar Rush / Electric Personality<br>**Lv10:** Final Form / No Survivors / Octuplets | + Bedpan Mortar = Nappy Bomb<br>+ Slipstream Scalpel = Nappy Trail |
| **Booster Jab** (Start)<br>gun, aims HIGHEST HEALTH | Rapid toxic needles. Poison stacks up. Side effects may include winning. | dmg 3.5, cd 0.1s, mag 30, reload 1.6s, range 410 | Lv3: +1 count; Lv5: +1 pierce; Lv7: 20% faster | **Lv3:** Hot Load / Extra Spicy / Pointy Head<br>**Lv5:** Toxic Relationship / Kick Them While Down / Cell Division<br>**Lv8:** Domino Effect / Electric Personality / Due Date Panic<br>**Lv10:** Octuplets / Espresso Drip / No Survivors | + Static Cling = Nervous Breakdown |
| **Tapeworm Seeder**<br>gun, aims HIGHEST HEALTH | Infects enemies. When they die, the corpse becomes your turret for 8 seconds. Ethically grey, tactically green. | dmg 11, cd 0.4s, mag 8, reload 1.6s, range 430<br>dur 8 | Lv3: +1 count; Lv5: +50% duration; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Hot Load / Extra Spicy<br>**Lv5:** Bloodsucker / Kick Them While Down / Toxic Relationship<br>**Lv8:** Domino Effect / Due Date Panic / Giant Killer<br>**Lv10:** Octuplets / Espresso Drip / Final Form | - |
| **Antibiotic Shotgun** (Bank 70)<br>gun, aims NEAREST | A broad-spectrum course, all at once. Finish the whole magazine. | dmg 7, cd 0.7s, mag 4, reload 1.5s, x6, range 270<br>pVenom 1 | Lv3: +2 count; Lv5: +1 pierce; Lv7: +3 count | **Lv3:** Hair Trigger / Nappy Bag / Extra Spicy<br>**Lv5:** Homing Instinct / Toxic Relationship / Special Delivery<br>**Lv8:** Twins! / Domino Effect / Sugar Rush<br>**Lv10:** Espresso Drip / No Survivors / Umbilical Cord | + Viral Payload = Superbug |
| **Mucus Web**<br>lob, aims DENSEST CLUSTER | Lobs sticky globs that leave slowing, toxic puddles. Ew, but effective. | dmg 7, cd 0.9s, mag 4, reload 1.8s, range 380<br>area 62, dur 3.5, flight 0.6, pChill 1 | Lv3: +50% duration; Lv5: +1 count; Lv7: +40% area | **Lv3:** Wide Hips / Hair Trigger / Hot Load<br>**Lv5:** Punching Up / Bloodsucker / Toxic Relationship<br>**Lv8:** Due Date Panic / Domino Effect / Sugar Rush<br>**Lv10:** Final Form / Octuplets / Espresso Drip | - |
| **Hormone Cloud**<br>gun, aims DENSEST CLUSTER | A slow drifting surge of hormones. Everything nearby gets confused and drawn in. | dmg 6, cd 1.7s, mag 2, reload 2.4s, pierce 99, range 400<br>aura 74, pull 70, pVenom 1 | Lv3: +30% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Pointy Head / Hair Trigger / Sharp Tongue<br>**Lv5:** Kick Them While Down / Ice Queen / Carpet Shock<br>**Lv8:** Sugar Rush / Domino Effect / Electric Personality<br>**Lv10:** Espresso Drip / Final Form / Octuplets | - |
| **Spermicide Sprayer**<br>gun, aims NEAREST | You are, technically, immune. Probably. Do not check. | dmg 3.2, cd 0.05s, mag 48, reload 2s, x2, pierce 99, range 190<br>pVenom 1, pGiant 0.5 | Lv3: +30% area; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Sharp Tongue / Hair Trigger / Cold Shoulder<br>**Lv5:** Special Delivery / Punching Up / Plus One<br>**Lv8:** Sugar Rush / Electric Personality / Giant Killer<br>**Lv10:** Espresso Drip / Final Form / Octuplets | - |
| **Enzyme Drill**<br>beam, aims HIGHEST ARMOUR | A beam of protease that eats through armour, then through whatever was under it. | dmg 26, cd 1.5s, mag 3, reload 2s, range 360<br>dur 1.3, shred 3, pVenom 1 | Lv3: +35% duration; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Cold Shoulder / Sharp Tongue / Extra Spicy<br>**Lv5:** Carpet Shock / Punching Up / Special Delivery<br>**Lv8:** Domino Effect / Giant Killer / Sugar Rush<br>**Lv10:** Final Form / No Survivors / Umbilical Cord | - |
| **Toxin Needles**<br>gun, aims WEAKEST | Homing hypodermics. They always find a vein. | dmg 4, cd 0.14s, mag 24, reload 1.6s, range 420<br>homing 4 | Lv3: +1 count; Lv5: +1 pierce; Lv7: 20% faster | **Lv3:** Hair Trigger / Pointy Head / Sharp Tongue<br>**Lv5:** Carpet Shock / Bloodsucker / Toxic Relationship<br>**Lv8:** Due Date Panic / Sugar Rush / Electric Personality<br>**Lv10:** Umbilical Cord / Espresso Drip / Final Form | - |
| **Viral Payload**<br>gun, aims STRONGEST | Missiles full of virus. Infected targets burst into turrets when they die. | dmg 11, cd 0.6s, mag 4, reload 2s, range 500<br>homing 4 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Sharp Tongue / Extra Spicy / Nappy Bag<br>**Lv5:** Kick Them While Down / Toxic Relationship / Homing Instinct<br>**Lv8:** Domino Effect / Giant Killer / Electric Personality<br>**Lv10:** Espresso Drip / No Survivors / Octuplets | + Antibiotic Shotgun = Superbug |

### Arcane weapons

| Weapon | What it does | Base stats | Level bonuses | Branch tree | Fuses with |
|---|---|---|---|---|---|
| **Doting Relatives**<br>orbit, aims NEAREST | Blades circle you, fussing. They need a sit-down every so often. | dmg 16, reload 2.2s, x3, range 100<br>dur 4.5, radius 72, spin 3.6 | Lv3: +1 count; Lv5: +30% area; Lv7: +2 count | **Lv3:** Hot Load / Extra Spicy / Hair Trigger<br>**Lv5:** Bloodsucker / Kick Them While Down / Carpet Shock<br>**Lv8:** Giant Killer / Electric Personality / Sugar Rush<br>**Lv10:** No Survivors / Umbilical Cord / Final Form | + Yo-Yo Diet = Tantrum Cyclone |
| **Ultrasound Beam**<br>beam, aims STRONGEST | A channelled beam that burns through a line of foes. Would you like a printout? | dmg 32, cd 1.7s, mag 3, reload 2.2s, range 390<br>dur 1.2 | Lv3: +35% duration; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Nappy Bag / Sharp Tongue / Cold Shoulder<br>**Lv5:** Kick Them While Down / Toxic Relationship / Punching Up<br>**Lv8:** Electric Personality / Sugar Rush / Due Date Panic<br>**Lv10:** Espresso Drip / Final Form / No Survivors | + Kidney Stone Railgun = Full-Body Scan |
| **Seeker Siblings** (Start)<br>gun, aims WEAKEST | Tiny homing siblings who swim for you and never miss. Family is complicated. | dmg 9, cd 0.45s, mag 6, reload 2s, x2, range 500<br>homing 5 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Hot Load / Nappy Bag / Sharp Tongue<br>**Lv5:** Carpet Shock / Ice Queen / Bloodsucker<br>**Lv8:** Electric Personality / Domino Effect / Due Date Panic<br>**Lv10:** No Survivors / Final Form / Umbilical Cord | + Bottle Rockets = Sibling Rivalry |
| **Toddler Gravity**<br>gun, aims DENSEST CLUSTER | A slow orb that drags everything into its mouth. Everything. | dmg 7, cd 1.8s, mag 2, reload 2.5s, pierce 99, range 400<br>aura 70, pull 90 | Lv3: +30% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Extra Spicy / Trampoline Rounds / Hot Load<br>**Lv5:** Bloodsucker / Carpet Shock / Ice Queen<br>**Lv8:** Twins! / Domino Effect / Sugar Rush<br>**Lv10:** Umbilical Cord / Final Form / No Survivors | + Nappy Mines = Sleep Regression Mines |
| **Deja Vu Rifle**<br>gun, aims STRONGEST | Every hit repeats itself 1 second later, from the future. Every hit repeats itself 1 second later... | dmg 16, cd 0.55s, mag 6, reload 1.6s, pierce 1, range 480<br>echoHit 1 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Extra Spicy / Trampoline Rounds / Pointy Head<br>**Lv5:** Bloodsucker / Carpet Shock / Ice Queen<br>**Lv8:** Giant Killer / Sugar Rush / Due Date Panic<br>**Lv10:** Umbilical Cord / Octuplets / Final Form | - |
| **Placental Siphon**<br>siphon, aims NEAREST | Eats enemy bullets that come near you and spits them back. No reloads. No ammo either, until the screen is full of bullets. | dmg 18, cd 0.08s, mag 40, range 460<br>area 90 | Lv3: +1 count; Lv5: +1 pierce; Lv7: +40% dmg | **Lv3:** Trampoline Rounds / Hot Load / Sharp Tongue<br>**Lv5:** Ice Queen / Bloodsucker / Carpet Shock<br>**Lv8:** Sugar Rush / Electric Personality / Twins!<br>**Lv10:** Final Form / Umbilical Cord / Espresso Drip | + Cold Feet = Return to Sender |
| **Copycat Twin**<br>mimic, aims NEAREST | Copies the attack pattern of the last shooter you killed. It is not plagiarism if you win. | dmg 10, cd 0.9s, mag 6, reload 1.8s, pierce 1, range 430 | Lv3: +30% dmg; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Sharp Tongue / Trampoline Rounds / Extra Spicy<br>**Lv5:** Ice Queen / Toxic Relationship / Homing Instinct<br>**Lv8:** Sugar Rush / Giant Killer / Due Date Panic<br>**Lv10:** Umbilical Cord / Octuplets / No Survivors | - |
| **Gene Splicer** (Bank 100)<br>gun, aims STRONGEST | Snips the target's genome at the worst possible place. Crits often. | dmg 22, cd 0.55s, mag 5, reload 1.5s, pierce 1, range 520<br>critBonus 0.25 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Trampoline Rounds / Hair Trigger / Hot Load<br>**Lv5:** Homing Instinct / Punching Up / Carpet Shock<br>**Lv8:** Twins! / Sugar Rush / Domino Effect<br>**Lv10:** Umbilical Cord / Final Form / Espresso Drip | + Mitosis Cannon = CRISPR Cannon |
| **Mitosis Cannon** (Bank 120)<br>gun, aims DENSEST CLUSTER | Every shot divides on impact. Then the halves divide. Biology is relentless. | dmg 14, cd 0.6s, mag 5, reload 1.6s, range 450<br>splitHit 3 | Lv3: +1 count; Lv5: +30% dmg; Lv7: +1 count | **Lv3:** Pointy Head / Trampoline Rounds / Hot Load<br>**Lv5:** Kick Them While Down / Homing Instinct / Special Delivery<br>**Lv8:** Sugar Rush / Electric Personality / Domino Effect<br>**Lv10:** Final Form / Umbilical Cord / Octuplets | + Gene Splicer = CRISPR Cannon |
| **Telomere Beam**<br>beam, aims FURTHEST | A very long beam that shortens everything it touches. Ageing, weaponised. | dmg 30, cd 1.8s, mag 3, reload 2.2s, range 540<br>dur 1.2, pExec 0.5 | Lv3: +35% duration; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Nappy Bag / Sharp Tongue / Cold Shoulder<br>**Lv5:** Toxic Relationship / Ice Queen / Special Delivery<br>**Lv8:** Domino Effect / Due Date Panic / Sugar Rush<br>**Lv10:** Final Form / Umbilical Cord / Espresso Drip | - |
| **Epigenetic Orb**<br>gun, aims DENSEST CLUSTER | Switches genes off in a wide radius. Monsters drift in, confused about who they are. | dmg 8, cd 1.9s, mag 2, reload 2.5s, pierce 99, range 400<br>aura 80, pull 100 | Lv3: +30% area; Lv5: +1 count; Lv7: +50% dmg | **Lv3:** Sharp Tongue / Pointy Head / Trampoline Rounds<br>**Lv5:** Kick Them While Down / Plus One / Cell Division<br>**Lv8:** Twins! / Sugar Rush / Due Date Panic<br>**Lv10:** Espresso Drip / Octuplets / No Survivors | - |
| **Placebo Pistol** (Bank 80)<br>gun, aims NEAREST | Contains no active ingredients. Works anyway, especially on big things. | dmg 11, cd 0.28s, mag 12, reload 1.1s, range 440<br>pGiant 1 | Lv3: +1 pierce; Lv5: +1 count; Lv7: +30% dmg | **Lv3:** Hair Trigger / Extra Spicy / Cold Shoulder<br>**Lv5:** Carpet Shock / Cell Division / Special Delivery<br>**Lv8:** Due Date Panic / Domino Effect / Twins!<br>**Lv10:** Octuplets / No Survivors / Umbilical Cord | - |
| **Stem Cell Mines**<br>mine, aims NEAREST | Undifferentiated mines. They become whatever kills best, which is usually an explosion. | dmg 34, cd 0.7s, mag 5, reload 2.4s, range 600<br>explode 74, life 16, splitHit 3 | Lv3: +1 count; Lv5: +30% area; Lv7: +50% dmg | **Lv3:** Hair Trigger / Sharp Tongue / Wide Hips<br>**Lv5:** Bloodsucker / Plus One / Ice Queen<br>**Lv8:** Electric Personality / Giant Killer / Due Date Panic<br>**Lv10:** Final Form / Octuplets / Umbilical Cord | - |
| **Retrovirus Swarm**<br>gun, aims WEAKEST | Homing viral particles that write themselves into the target. Leaves a poison. | dmg 8, cd 0.42s, mag 7, reload 2s, x2, range 500<br>homing 5, pVenom 1 | Lv3: +1 count; Lv5: +1 count; Lv7: +40% dmg | **Lv3:** Hair Trigger / Hot Load / Pointy Head<br>**Lv5:** Carpet Shock / Punching Up / Bloodsucker<br>**Lv8:** Sugar Rush / Due Date Panic / Twins!<br>**Lv10:** Umbilical Cord / Espresso Drip / Octuplets | - |
| **Ribosome Printer**<br>orbit, aims NEAREST | Prints protein blades around you, one amino acid at a time. | dmg 15, reload 2s, x3, range 100<br>dur 4.2, radius 70, spin 3.8 | Lv3: +1 count; Lv5: +30% area; Lv7: +2 count | **Lv3:** Hair Trigger / Wide Hips / Sharp Tongue<br>**Lv5:** Toxic Relationship / Ice Queen / Kick Them While Down<br>**Lv8:** Giant Killer / Domino Effect / Twins!<br>**Lv10:** Final Form / Umbilical Cord / Espresso Drip | - |

## Fusions (weapon merges)

Both ingredients must be Lv4 or higher.

| Fusion | Recipe | Element | What it does | Base stats | Branch tree |
|---|---|---|---|---|---|
| **Spindle Apparatus** | Chromosome Whip + Cilia Flail | Kinetic | Whips and cilia become a mitotic spindle that shreds anything in the division zone. | dmg 30, x6<br>dur 5, radius 88, spin 4.4, shred 2 | **Lv3:** Sharp Tongue / Wide Hips / Hot Load<br>**Lv5:** Carpet Shock / Punching Up / Toxic Relationship<br>**Lv8:** Sugar Rush / Due Date Panic / Domino Effect<br>**Lv10:** Final Form / Espresso Drip / Umbilical Cord |
| **Thermal Cycler** | Enzyme Torch + Liquid Nitrogen Spray | Fire + Frost | PCR in cone form: denature, anneal, extend, repeat. Burns and freezes by turns. | dmg 7, cd 0.05s, mag 60, x3, pierce 99<br>pIgnite 0.25, pChill 1 | **Lv3:** Pointy Head / Extra Spicy / Cold Shoulder<br>**Lv5:** Kick Them While Down / Punching Up / Cell Division<br>**Lv8:** Due Date Panic / Giant Killer / Twins!<br>**Lv10:** Octuplets / Final Form / Espresso Drip |
| **Action Potential** | Nerve Impulse + Axon Rail | Shock | All-or-nothing: a rail of pure nerve signal that arcs through everything in its path. | dmg 60, cd 0.9s, mag 4, pierce 99<br>pArc 0.6, pArcDmg 0.6, pArcN 2 | **Lv3:** Hair Trigger / Extra Spicy / Trampoline Rounds<br>**Lv5:** Toxic Relationship / Kick Them While Down / Special Delivery<br>**Lv8:** Domino Effect / Twins! / Electric Personality<br>**Lv10:** Umbilical Cord / Espresso Drip / Octuplets |
| **Superbug** | Antibiotic Shotgun + Viral Payload | Toxic | Resistant to everything, including your conscience. Missiles that split and infect. | dmg 18, cd 0.5s, mag 6, x2<br>homing 5, pVenom 1, splitHit 3 | **Lv3:** Trampoline Rounds / Hot Load / Pointy Head<br>**Lv5:** Ice Queen / Homing Instinct / Plus One<br>**Lv8:** Twins! / Electric Personality / Due Date Panic<br>**Lv10:** Final Form / Umbilical Cord / No Survivors |
| **CRISPR Cannon** | Gene Splicer + Mitosis Cannon | Arcane | Precision edits at scale. Every shot divides, and every piece crits. | dmg 34, cd 0.45s, mag 6, pierce 2<br>critBonus 0.35, splitHit 4 | **Lv3:** Hot Load / Sharp Tongue / Pointy Head<br>**Lv5:** Ice Queen / Carpet Shock / Toxic Relationship<br>**Lv8:** Electric Personality / Sugar Rush / Domino Effect<br>**Lv10:** Final Form / Umbilical Cord / No Survivors |
| **Cryobank** | Cryo Pipette + Hailstone Swarm | Frost | The whole freezer, launched. Homing, piercing, freezing. | dmg 16, cd 0.35s, mag 10, x3, pierce 2<br>homing 6, pChill 1, freezeHit 1 | **Lv3:** Cold Shoulder / Trampoline Rounds / Hair Trigger<br>**Lv5:** Plus One / Punching Up / Carpet Shock<br>**Lv8:** Domino Effect / Electric Personality / Sugar Rush<br>**Lv10:** Espresso Drip / Umbilical Cord / Octuplets |
| **Crash Cart** | Pacemaker + Defibrillator | Shock | The full resuscitation trolley. Enormous shocks through the whole crowd. | dmg 44, cd 1s, mag 4, x2<br>chain 8, jump 160 | **Lv3:** Nappy Bag / Hair Trigger / Hot Load<br>**Lv5:** Special Delivery / Punching Up / Carpet Shock<br>**Lv8:** Sugar Rush / Twins! / Domino Effect<br>**Lv10:** No Survivors / Umbilical Cord / Espresso Drip |
| **Osteoclast Barrage** | Bone Marrow Mortar + Metabolic Flare | Kinetic + Fire | Bone-dissolving cells, burning, delivered by mortar. A lot of mortar. | dmg 52, cd 0.9s, mag 4, x2<br>area 84, flight 0.9, explode 1, pIgnite 0.25 | **Lv3:** Sharp Tongue / Hot Load / Nappy Bag<br>**Lv5:** Carpet Shock / Ice Queen / Kick Them While Down<br>**Lv8:** Giant Killer / Sugar Rush / Twins!<br>**Lv10:** Umbilical Cord / Final Form / Octuplets |
| **Hot Flush Cold Sweat** | Heartburn + Cold Feet | Fire + Frost | A scalding fire-and-frost cone. Triggers reactions constantly. Menopause, but tactical. | dmg 8, cd 0.055s, mag 70, x3, pierce 99 | **Lv3:** Pointy Head / Trampoline Rounds / Extra Spicy<br>**Lv5:** Ice Queen / Special Delivery / Cell Division<br>**Lv8:** Electric Personality / Domino Effect / Sugar Rush<br>**Lv10:** Espresso Drip / Octuplets / No Survivors |
| **Static Hiccups** | Hiccup Scattergun + Static Cling | Shock | Each pellet detonates into chain lightning. Try holding your breath. | dmg 11, cd 0.7s, mag 5, x8<br>chainHit 2, knock 60 | **Lv3:** Nappy Bag / Sharp Tongue / Hot Load<br>**Lv5:** Ice Queen / Cell Division / Toxic Relationship<br>**Lv8:** Domino Effect / Due Date Panic / Electric Personality<br>**Lv10:** Final Form / Espresso Drip / Umbilical Cord |
| **Full-Body Scan** | Kidney Stone Railgun + Ultrasound Beam | Arcane | A colossal armour-shredding beam across the whole screen. Please remain very still. | dmg 130, cd 2.4s, mag 2<br>dur 1.5, shred 5 | **Lv3:** Nappy Bag / Sharp Tongue / Cold Shoulder<br>**Lv5:** Ice Queen / Toxic Relationship / Carpet Shock<br>**Lv8:** Sugar Rush / Electric Personality / Domino Effect<br>**Lv10:** Espresso Drip / Umbilical Cord / Final Form |
| **Sibling Rivalry** | Bottle Rockets + Seeker Siblings | Fire | Volleys of homing explosive rockets that fight over who gets there first. | dmg 22, cd 0.5s, mag 4, x4<br>homing 6, explode 58 | **Lv3:** Hair Trigger / Hot Load / Extra Spicy<br>**Lv5:** Punching Up / Carpet Shock / Cell Division<br>**Lv8:** Electric Personality / Twins! / Due Date Panic<br>**Lv10:** No Survivors / Espresso Drip / Octuplets |
| **Tantrum Cyclone** | Yo-Yo Diet + Doting Relatives | Kinetic | Six blades pulse outward and back in a screaming storm. It is about the blue cup. | dmg 30, x6<br>dur 6, radius 70, spin 4.2, pulse 1 | **Lv3:** Wide Hips / Sharp Tongue / Hot Load<br>**Lv5:** Toxic Relationship / Kick Them While Down / Bloodsucker<br>**Lv8:** Electric Personality / Twins! / Giant Killer<br>**Lv10:** Final Form / Umbilical Cord / No Survivors |
| **Bouncy Castle Magnum** | Spitball + Pass the Parcel | Kinetic | Magnum rounds that ricochet 6 times and crit often. Shoes off. | dmg 22, cd 0.35s, mag 8<br>bounce 6, critBonus 0.2 | **Lv3:** Sharp Tongue / Hair Trigger / Pointy Head<br>**Lv5:** Homing Instinct / Special Delivery / Ice Queen<br>**Lv8:** Sugar Rush / Domino Effect / Due Date Panic<br>**Lv10:** Umbilical Cord / No Survivors / Espresso Drip |
| **Nappy Bomb** | Morning Sickness + Bedpan Mortar | Toxic | Toxic shells: a huge blast plus a lingering pool. Nobody is volunteering. | dmg 46, cd 1.4s, mag 3<br>area 96, dur 5, flight 0.9, explode 1 | **Lv3:** Wide Hips / Nappy Bag / Hot Load<br>**Lv5:** Plus One / Kick Them While Down / Bloodsucker<br>**Lv8:** Domino Effect / Electric Personality / Twins!<br>**Lv10:** Final Form / Octuplets / Umbilical Cord |
| **Sleep Regression Mines** | Nappy Mines + Toddler Gravity | Arcane | Mines open a black hole that swallows everything, then detonate. Like 4am. | dmg 55, cd 0.8s, mag 4<br>explode 95, life 16, singularity 1 | **Lv3:** Sharp Tongue / Wide Hips / Cold Shoulder<br>**Lv5:** Kick Them While Down / Bloodsucker / Toxic Relationship<br>**Lv8:** Due Date Panic / Sugar Rush / Twins!<br>**Lv10:** Espresso Drip / No Survivors / Umbilical Cord |
| **Grandparent Hive** | Helicopter Parent + Sneeze Gun | Shock | Four drones with SMG fire rates. They insist on helping. | dmg 6.5, cd 0.12s, mag 40, x4 | **Lv3:** Sharp Tongue / Pointy Head / Hot Load<br>**Lv5:** Ice Queen / Carpet Shock / Kick Them While Down<br>**Lv8:** Domino Effect / Giant Killer / Electric Personality<br>**Lv10:** Umbilical Cord / Final Form / No Survivors |
| **Forceps Repeater** | Tongue Depressor Crossbow + Contraction Gatling | Kinetic | Automatic heavy bolts. Pierce, shred, knockback. Gentle it is not. | dmg 17, cd 0.15s, mag 60, pierce 4<br>knock 140, shred 2 | **Lv3:** Extra Spicy / Cold Shoulder / Sharp Tongue<br>**Lv5:** Cell Division / Homing Instinct / Carpet Shock<br>**Lv8:** Twins! / Giant Killer / Electric Personality<br>**Lv10:** No Survivors / Octuplets / Umbilical Cord |
| **Egg Freezing Service** | Cold Feet + Frozen Peas | Frost | Ice meteors that flash-freeze everything they hit. Very forward-planning. | dmg 18, cd 1.3s, mag 3, x8<br>area 48, flight 0.7, explode 1, freezeHit 1 | **Lv3:** Cold Shoulder / Nappy Bag / Sharp Tongue<br>**Lv5:** Bloodsucker / Ice Queen / Punching Up<br>**Lv8:** Due Date Panic / Twins! / Electric Personality<br>**Lv10:** Final Form / Umbilical Cord / No Survivors |
| **Nervous Breakdown** | Booster Jab + Static Cling | Toxic + Shock | Toxic lightning. Every arc spreads plague. It has been a long week. | dmg 9, cd 0.25s, mag 12<br>chain 6, jump 150 | **Lv3:** Extra Spicy / Nappy Bag / Hair Trigger<br>**Lv5:** Special Delivery / Ice Queen / Plus One<br>**Lv8:** Sugar Rush / Twins! / Due Date Panic<br>**Lv10:** Octuplets / Espresso Drip / Umbilical Cord |
| **Return to Sender** | Placental Siphon + Cold Feet | Frost | Their bullets. Your ice. Everyone else's problem. Returned shots freeze on hit. | dmg 20, cd 0.06s, mag 70, pierce 2<br>area 105, freezeHit 1 | **Lv3:** Extra Spicy / Cold Shoulder / Sharp Tongue<br>**Lv5:** Special Delivery / Homing Instinct / Cell Division<br>**Lv8:** Due Date Panic / Giant Killer / Domino Effect<br>**Lv10:** Umbilical Cord / Octuplets / No Survivors |
| **Nappy Trail** | Slipstream Scalpel + Morning Sickness | Toxic | You leave a lane of plague behind you. Lead the siege through it and wave. | dmg 30<br>dur 4, area 34 | **Lv3:** Hot Load / Cold Shoulder / Sharp Tongue<br>**Lv5:** Carpet Shock / Special Delivery / Punching Up<br>**Lv8:** Giant Killer / Domino Effect / Due Date Panic<br>**Lv10:** Umbilical Cord / Espresso Drip / Final Form |
| **Pyramid Scheme** | Child Benefit Cannon + Bedpan Mortar | Fire | Shells cost scrap. Shells make scrap. It is basically a pyramid scheme with explosions. | dmg 50, cd 0.9s, mag 99, x3<br>area 80, flight 0.9, explode 1 | **Lv3:** Hair Trigger / Cold Shoulder / Sharp Tongue<br>**Lv5:** Plus One / Special Delivery / Kick Them While Down<br>**Lv8:** Electric Personality / Due Date Panic / Giant Killer<br>**Lv10:** Umbilical Cord / Octuplets / Espresso Drip |

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

## Weapon branch perks

Offered at weapon levels 3, 5, 8 and 10 (mastery). Which ones a weapon gets is fixed per weapon (see the weapon tables).

### Tier 1 (Lv3)

| Perk | Effect |
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

### Tier 2 (Lv5)

| Perk | Effect |
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

### Tier 3 (Lv8)

| Perk | Effect |
|---|---|
| **Sugar Rush** | +75% damage. |
| **Due Date Panic** | 40% faster cooldown and reload. |
| **Domino Effect** | Kills explode for 60% of the killing blow. |
| **Giant Killer** | +150% damage to elites, bosses and rival champions. |
| **Twins!** | +2 projectiles. |
| **Electric Personality** | 50% of hits arc to 2 nearby enemies for 60% damage. |

### Tier 4 (Lv10)

| Perk | Effect |
|---|---|
| **Final Form** | +100% damage and +20% crit chance. |
| **Espresso Drip** | 50% faster cooldown and reload, +50% magazine. |
| **Octuplets** | +3 projectiles. |
| **Umbilical Cord** | Hits heal you (up to four times the usual lifesteal limit). |
| **No Survivors** | Non-boss enemies under 20% health die instantly when hit. |

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
| Keratin Nailgun | 60 |
| Cryo Pipette | 60 |
| Antibiotic Shotgun | 70 |
| Nerve Impulse | 70 |
| Placebo Pistol | 80 |
| Chromosome Whip | 80 |
| Metabolic Flare | 90 |
| Gene Splicer | 100 |
| Mitosis Cannon | 120 |
| Hailstone Swarm | 90 |

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

## Bosses

A boss arrives every 3 minutes.

| Boss | HP | Damage | Armour | Attack patterns |
|---|---|---|---|---|
| **THE MACROPHAGE QUEEN** | 2600 | 25 | 2 | spiral, summon, ring, aimedFan |
| **THE ANTIBODY COLOSSUS** | 4200 | 35 | 10 | ring, charge, aimedFan, doubleSpiral |
| **THE IMMUNE EYE** | 3400 | 30 | 4 | doubleSpiral, blink, ring, flower |

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
