# Starter weapons: 4 per sequence (design decision)

Each of the 8 main sequences gets exactly 4 starting weapons, ranked by how clearly they fit the trait and description. Twins, Reborn and Redtail already have 3 and are left alone.

| Sequence | Trait | The 4 (most "meant to be" first) | Runner-up |
|---|---|---|---|
| The Firstborn (`vanguard`) | Quick Recovery (reload) | Spitball, Yo-Yo Diet, Seeker Siblings, Little Swimmers | Runaway Pram |
| The Chonker (`bruiser`) | Puppy Fat (armour) | Thorny Onesie, Placenta Paddle, Hiccup Scattergun, Nappy Mines | none (original 4) |
| The Bright Spark (`nerd`) | Early Developer (fire rate) | Static Cling, Twin Telepathy, Fork in the Socket, Toddler Gravity | Lightning Bugs |
| The Favourite (`eggseeker`) | Favouritism (crit) | Due Date, Tooth Fairy, Booger Flick, Lemon Squeezy | none |
| The Quiet One (`stealth`) | Under Your Feet (melee, trail) | Flagellum Flail, Skid Mark, Peekaboo, Paper Cut | none |
| The Good Eater (`pusher`) | Healthy Appetite (regen) | Tapeworm Seeder, Bubble Wand, Premature Evangelation, Leeches | Umbilical Cord |
| The Problem Child (`acid`) | Overtired (angrier when hurt) | Heartburn, Morning Sickness, Red Tape, Ulcer Moons | Upchuck |
| The Designer Baby (`splicer`) | Good Genes (boosts others) | Imaginary Friend, Colouring In, Placental Siphon, Gene Gun | none |

Cut from the sequences (still in the game, candidates for Gene Bank wildcards): Rattle, Spirit Fingers, Egg White, Water Pistol, Runaway Pram, Gut Punch, Waters Breaking, Butter Knife, Cod Liver Oil, Soft Play, Static Hairbrush, Carpet Shuffle, Lightning Bugs, Lava Lamp, Bogey Roller, Nose Goblins, Blood Blister, Sticky Fingers, Wet Kiss, Runny Nose, Head Lice, Hanky Panky, Boo-merang, Night Light, Whooping Cough, Bath Bomb, Sea Monkeys, Greased Piglet, Umbilical Cord, Upchuck, Grubby Fingers, Juice Box, Period Drama, Achoo, Cradle Cap, Lard Lobber, Wet Wipe, Heel Prick, Baby Shower.

Status: design only. Not yet applied in code (`PROFILES[...].weapons` in `genes.js`, plus the pushes in `armoury.js`, `playpen.js`, `genegun.js`).

Next: each of the 32 gets a first branch with two directions (64 variants), each borrowing the best aspect of another sequence's weapon.

---

# Damage-type versions of the 9 weapon archetypes

The 9 main weapon types, with the best "clear, classic, fun" example of each: Gun (Spitball), Melee (Placenta Paddle), Lob (Upchuck), Pet (Little Swimmers), Ring (Baby Rattle), Orbit (Premature Evangelation), Trail (Skid Mark), Mine (Nappy Mines), Chain (Static Cling).

Below, one version of each archetype per damage type. "(existing)" = already in the game as that type's version. **Bold** = new weapon, not yet built.

## Force (plain: no status, no reactions; trades them for raw damage, knockback and physical effects)
1. Gun: Spitball (existing). Every 5th spitball is a heavy "hawker" (3x damage, shoves the target).
2. Melee: Placenta Paddle (existing). Knockback is the pitch: slams into walls or other enemies deal bonus damage.
3. Lob: **Hairball.** A wet hairball lands with a thud and rolls, bouncing twice and flattening everything in its path. No puddle, no burn.
4. Pet: Little Swimmers (existing). Headbutts for knockback; harder hits on wall-pinned enemies.
5. Ring: Baby Rattle (existing). Every third shake doubles range and damage.
6. Orbit: **Brick Angels.** Stone cherubs circle and swat, eat bullets, and drop for a moment if they hit too much.
7. Trail: **Rubber Burn.** Scorched-tyre skid marks: flat hit and sideways knock. Thicker the longer you swim.
8. Mine: **Lego.** Bricks you cannot see from above: flat hit and short stagger. Piled bricks hurt more.
9. Chain: **Newton's Cradle.** A heavy ball passes momentum down the crowd; damage ramps with each link.

## Soul (ignores armour; Cursed: cursed enemies sometimes turn on mates; bosses Spooked)
1. Gun: **Spitting Image.** Ghostly spit passes through the first enemy, ignores armour, curses on hit.
2. Melee: **Poltergeist Paddle.** Every swing is followed by a ghost echo that swings again from the same spot. No knockback.
3. Lob: **Projectile Ectoplasm.** A haunted puddle: enemies in it are cursed, and the curse spreads between touching enemies. Puddles merge.
4. Pet: **Little Ghosts.** Spectral swimmers pass through walls and enemies; each headbutt curses.
5. Ring: **Haunted Rattle.** Ghostly beads pass through walls. Every third shake is a banshee wail: the ring goes out, then comes back in.
6. Orbit: Premature Evangelation (existing). Sharpen: angels curse what they swat; angels that eat enough bullets hand them back as soul bolts.
7. Trail: **Cold Spot.** A chilly patch wherever you swim: enemies crossing it are cursed and may turn on mates the longer they stay.
8. Mine: **Unmarked Graves.** Near-invisible graves: a ghost rises when triggered and haunts the nearest enemy, cursing the area.
9. Chain: **Possession.** Jumps by possessing each enemy; the last one turns on its mates for a few seconds. Does not power other weapons.

## Acid (Melting: damage over time, eats armour, +50% once armour is gone)
1. Gun: **Gastric Spitball.** Long-range Acid: Melting on hit, strips armour fast. Slower, weaker hits. (Heartburn is the close-range Acid spray.)
2. Melee: **Caustic Paddle.** The swing leaves an acid smear along its arc for 3s. Less knockback.
3. Lob: Upchuck (existing). Burning puddles that merge.
4. Pet: **Low pH Swimmers.** Headbutts apply Melting; they drip acid as they chase.
5. Ring: **Sour Rattle.** Beads leave a drop of acid where they land. Every third shake is bigger and burns longer.
6. Orbit: Ulcer Moons (existing). Little moons of stomach acid.
7. Trail: **Bile Trail.** An acid trail: crossing it starts Melting, and armour goes faster the longer they stay.
8. Mine: Nappy Mines (existing). Traps with chain reactions.
9. Chain: **Corrosion.** Melting on each jump; when a melting enemy dies the acid jumps to its nearest neighbour. Does not power other weapons.

## Mucus (Snotty: slower and slower; enough and it is stuck fast. Control, not damage)
1. Gun: Booger Flick (existing). Piercing flicks that slow and glue.
2. Melee: Achoo (existing). A cone of sneeze; every 4th is a big one all around you.
3. Lob: **Glob.** A fat glob lands as a sticky puddle: slow, then stuck if they stay.
4. Pet: Nose Goblins (existing). Bogey goblins circle and flick snot.
5. Ring: **Common Cold.** A ring of snot beads: slow on touch, stuck on a second touch. Every third is a "full-blown cold".
6. Orbit: **Dried Bogeys.** Crusty bogeys circle; a touch sticks the enemy for a moment.
7. Trail: Runny Nose (existing). A snot trail that slows anything wading through.
8. Mine: **Flypaper.** Glues everything near it when stepped on; stuck enemies take extra damage from all your other weapons.
9. Chain: **Strings Attached.** A stretchy strand links enemies: slowing one slows all, and hits on one are felt by the others.

## Static (Shocked: some damage arcs to a neighbour; every 4th hit stuns)
1. Gun: Fork in the Socket (existing). A locked bolt that strengthens the longer it holds.
2. Melee: Static Hairbrush (existing). Brushing swings; a bolt every 4th.
3. Lob: **Rubbed Balloon.** Sticks to an enemy and pops, arcing a shock to neighbours.
4. Pet: Lightning Bugs (existing). Every bite is a zap that jumps on.
5. Ring: Carpet Shuffle (existing). Shuffle, shuffle, ZAP.
6. Orbit: **Plasma Ball.** Orbs circle and arc to nearby enemies; every 4th arc stuns.
7. Trail: **Carpet Burn.** A static trail: crossing it is Shocked.
8. Mine: **Doorknob.** Zaps when touched and arcs to the enemies around it.
9. Chain: Static Cling (existing). Jumps through whole crowds.

## Cooties (Sick: stacking damage over time; sneezes onto mates)
1. Gun: Wet Kiss (existing). Homing kisses; lipstick prints spread Cooties.
2. Melee: Grubby Fingers (existing). Poke something Sick and the germs spread.
3. Lob: Soft Play (existing). A ball pit that bogs enemies down and infects them.
4. Pet: **Daycare.** Three toddlers chase; each bite stacks Sick and sneezes onto nearby enemies.
5. Ring: **Outbreak.** A ring of germy puffs; every third is bigger.
6. Orbit: **Bluebottles.** Flies circle and carry germs to whatever they touch.
7. Trail: **Patient Zero.** A germ trail: crossing it starts Sick, and sneezes spread the stacks.
8. Mine: **Dirty Nappy.** Releases a cloud of Cooties when stepped on.
9. Chain: **Pass the Parcel.** A germ passes enemy to enemy, carrying its Sick stacks.

## Oil (Lubricated: knockback goes much further; reactions 50% stronger)
1. Gun: **Grease Gun.** Shots lubricate: all your other weapons knock it further and react harder.
2. Melee: Butter Knife (existing). Long, quick slashes with a greasy smear.
3. Lob: Lard Lobber (existing). Sends everything flying and bowls it into its mates.
4. Pet: Greased Piglet (existing). A squealing piglet that skids round you.
5. Ring: **Suntan Lotion.** A ring of lotion lubricates everything near you.
6. Orbit: Lava Lamp (existing). Slow blobs of hot oil.
7. Trail: Skid Mark (existing). A boozy viral trail.
8. Mine: **Baby Oil.** Bursts into an oil slick; nearby enemies slide into each other.
9. Chain: **Greased Lightning.** Lubricates each enemy as it jumps, so later typed hits react 50% stronger.

## Water (Soaking wet: each hit shoves it away; wet things carry Static twice as well)
1. Gun: Water Pistol (existing). Fast, weak, soaks everything.
2. Melee: Wet Wipe (existing). Wide, wet sweeps that wipe away bullets.
3. Lob: Bath Bomb (existing). A fizzing splash and a soapy puddle.
4. Pet: Sea Monkeys (existing). Bites with a splash.
5. Ring: Waters Breaking (existing). A gush that washes everything away.
6. Orbit: **Rubber Ducks.** Ducks circle and shove enemies on contact, soaking them.
7. Trail: **Puddle Jumper.** A trail of puddles: each step in one shoves the enemy back.
8. Mine: **Water Balloons.** Bursts into a wave, soaking and shoving a crowd.
9. Chain: **Ripple Effect.** A ripple spreads across soaked enemies, shoving each in turn.

## Blood (Bleeding: damage over time that only ticks while the enemy moves)
1. Gun: Heel Prick (existing). Fast needles; every 6th hits a weak spot for 4x.
2. Melee: Paper Cut (existing). Fast, thin slashes that all bleed.
3. Lob: Blood Blister (existing). Bursts into a puddle, then pops once more when it dries.
4. Pet: Leeches (existing). Latch on and suck; some comes back to you.
5. Ring: Period Drama (existing). Three waves of cramps every few seconds.
6. Orbit: **Platelets.** Discs circle and cut anything near.
7. Trail: **Nosebleed.** A blood trail: crossing it makes enemies bleed, so they keep moving.
8. Mine: **Thumbtacks.** Anything stepping on it bleeds.
9. Chain: **Bloodline.** Follows bleeding enemies and shares bleed damage along it.

## New-weapon count (bold entries)
Force 5, Soul 8, Acid 6, Mucus 5, Static 4, Cooties 6, Oil 4, Water 3, Blood 4 = **45 new weapons** across the nine tables.
