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
