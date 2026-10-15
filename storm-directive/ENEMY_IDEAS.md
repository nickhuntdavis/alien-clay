# Enemy ideas

Source: v9.21 code (`data.js` ENEMIES, `foes2.js`, `chem.js`, REACTIONS) and FEAT_IDEAS.md. Damage types: Force, Acid, Mucus, Static, Cooties, Oil, Water, Blood, Soul.
Delight (1 to 10) means joke, visual surprise and "I'd show a friend", not difficulty. Scores are a first-pass judgement. Build times assume the `foes2.js` pattern (one entry, a `weak`/`resist`, an intro joke, one `chemFoe` line).

## 1. Where enemies stand now

- 30 original enemies (`data.js`) have no damage type: they are bodies to shoot. Only the 20 `foes2.js` enemies and the bosses carry `weak`/`resist`.
- Enemy-specific reactions (8): Grease Ball + Static, Leech + Blood, Puffball + Cooties, Shell Cell + Acid, Callus + Water, Platelet Clump + Blood, Stray Pube + Mucus, Bogey + Water.
- Gaps, ranked: (1) no enemy reacts to Soul or Oil; (2) no enemy uses a damage type against you (you only ever suffer Acid from terrain); (3) Mucus, Cooties and Force each set off one enemy reaction or none; (4) no enemy plays with puddles, which v9.12 made a big part of every build.
- So the ideas below lean on three new hooks: enemies that **apply a status to you** (new, small system: a player-side version of Snotty, Lubricated, Soaking wet, Sick), enemies that **use or steal puddles**, and **Soul/Oil enemy reactions**.

Each line: name (damage type it is built around, role), inspiration, user story, how to beat it, its enemy reaction, build time.
Roles follow `foes2.js` caps: punisher (cap 6, punishes one build), support (cap 3, helps other enemies), joke (cap 8, light threat, mostly a laugh), new: carrier (cap 4, hands you a reaction if you answer it right).

## 2. New enemy ideas (32), ranked by delight

### Delight 9
1. **Snot Bubble** (Mucus, carrier). From Bogey Flick and Bubble Wand. As a player, I want a nostril bubble that swells every time I shoot it, so that I have to choose between popping it early (a little splash) or late (a burst that sticks every enemy nearby, and me if I'm close). Weak Static, resist Force. Reaction POPPED (Static on it): it bursts at once, harmless to you, and every enemy nearby is Snotty. Build: about 2 hours.
2. **Newton's Cradle** (Force, punisher). From Pass the Parcel. As a player, I want a row of 5 linked balls where hitting one end sends the far end flying at me, so that blindly firing into it hurts and hitting from the side is the trick. Knockback-proof as a group; side hits split the chain. Weak Acid (melts the strings), resist Force. Reaction CLICK-CLACK (Force on an end ball): the far ball flies away from you instead and bowls through enemies. Build: about 4 hours (linked bodies).
3. **Cootie Catcher** (Cooties, punisher). The paper fortune-teller. As a player, I want an enemy that flips between 4 faces, each resisting a different damage type, so that I have to time my shots to the face it shows. Each face is a shape as well as a colour, so it reads in Lab view. Weak to whichever type the next face resists (a tell). Reaction FORTUNE TOLD (Cooties while it flips): it lands on a "you're sick" face and is stuck there, weak to everything for 5 s. Build: about 3 hours.
4. **Echo Cell** (Soul, punisher). From Déjà Vu and Ghosts of You. As a player, I want a cell that leaves a see-through echo replaying its last 2 seconds of movement and shots, so that I dodge the same pattern twice. Only Soul shots hit the echo. Weak Soul, resist Static. Reaction DÉJÀ BOO (Soul on the echo): the echo turns on its owner and replays the shots into it. Build: about 3 hours.

### Delight 8
1. **Bladder** (Water, carrier). From Waterlogged. As a player, I want a balloon of fluid that fills as it lives and gets bigger and slower, so that popping it early is a small splash and popping it late is a flood that soaks the whole area and shoves me. Weak Force (pierce pops it), resist Water. Reaction BURST (Static on a full one): a screen-wide Toaster in the Bath on every soaked enemy. Build: about 2 hours.
2. **Count Cellula** (Blood, punisher). From Blood Donor. As a player, I want a vampire cell that heals from every bleeding enemy near it, so that a Blood build has to deal with it first. Hides from you (backs off) while feeding. Weak Soul and Water, resist Blood. Reaction STAKED (Soul on it): it turns to dust and every bleed nearby ticks at once. Build: about 2 hours.
3. **Static Sock** (Static, punisher). From Doorknob and Balloon Rub. As a player, I want a fluffy sock that builds charge as it shuffles about and zaps me hard on contact, so that I learn to discharge it before it gets close. Its glow grows with charge. Weak Water (grounds it), resist Static (feeds it). Reaction GROUNDED (Water on it): the charge goes into the puddle and shocks enemies standing in it. Build: about 1.5 hours.
4. **Lava Lamp** (Oil, joke/punisher). From Nappy Leak. As a player, I want a slow blob of oil that splits into rising globs and joins back up, so that killing it means hitting every glob before they merge. Leaves slicks that make other enemies faster. Weak Static, resist Water. Reaction LAVA (Static on it): every glob catches fire and drifts upward, burning what it touches. Build: about 3 hours (split and merge).
5. **Mosquito** (Blood, joke). From Paper Cut. As a player, I want a little biter that flies over walls, sips my health and flies off swollen, so that chasing it down wins my health back. Kill it within 6 s and it bursts into a Top-Up pool. Weak Force, resist Soul. Reaction FLYPAPER (Mucus on it): it is stuck and can't fly off, and its pool is twice the size. Build: about 1.5 hours.
6. **Ouija Planchette** (Soul, support). From Ouija Board. As a player, I want a pointer gliding about a board on the floor that spells out which enemy it is buffing, so that I can read the letters and kill that one first. The buffed enemy is untouchable by anything but Soul. Weak Soul, resist Force. Reaction SÉANCE OVER (Soul on the planchette): it spells "BYE" and the board curses every enemy on it. Build: about 3 hours.
7. **Grease Trap** (Oil, support). From Chip Pan and Wet Floor Sign. As a player, I want a cell that soaks up my oil slicks and grows from them, so that an Oil build has a real counter. When full it spits the oil back as a slick under me (enemies slide in). Weak Acid, resist Oil. Reaction RENDERED (Acid on a full one): it pops into a Vinaigrette on everything nearby. Build: about 2 hours.
8. **Hayfever Cell** (Cooties, punisher). From Coughs and Sneezes. As a player, I want a cell that sneezes my own statuses back at me in a cone (Sick, Snotty, Wet and the like on me for 2 s), so that piling statuses onto it carelessly backfires. Needs player statuses. Weak Water (rinsed), resist Cooties. Reaction ANTIHISTAMINE (Water then Cooties on it): it sneezes on its own side instead. Build: about 4 hours (player statuses, first time).

### Delight 7
1. **Phlegm Hocker** (Mucus, punisher). As a player, I want a spitter that lobs sticky globs that make me Snotty (slower) for 2 s, so that Mucus becomes something I dodge, not just something I use. Weak Water, resist Mucus. Reaction GARGLED (Water on it): its next 3 globs come out as harmless rinse puddles that cleanse me. Build: about 1.5 hours (after player statuses).
2. **Cold Sore** (Cooties, support). As a player, I want a sore that hops onto another enemy and makes it immune to Cooties until burnt off, so that a Cooties build has to strip it first. Weak Acid, resist Cooties. Reaction CLEARED UP (Acid on the host): the sore falls off and the host is Sick at double strength. Build: about 2 hours (riding another enemy).
3. **Leaky Tap** (Water, support). As a player, I want a fixed dripper whose puddles heal enemies that stand in them, so that I fight near it on purpose or move the fight away. Weak Static, resist Water. Reaction PLUMBED IN (Oil on it): its puddles turn to oil slicks that make the enemies in them slide away. Build: about 1.5 hours.
4. **Earwax Plug** (Oil, punisher). As a player, I want a waxy lump that soaks up Static and stops arcs passing through it, so that chain builds have to go round it. Weak Acid (melts it), resist Static. Reaction CANDLED (Acid on it): it melts into a big oil slick, ready for Grease Fire. Build: about 1.5 hours.
5. **Séance Ring** (Soul, support). From Hand in Hand and Twin Telepathy. As a player, I want 4 cells holding hands in a turning ring that curses whatever is inside it, so that I break the circle with a hard hit before it closes on me. Weak Force (breaks hands), resist Soul. Reaction BROKEN CIRCLE (Force on one cell): the other 3 are Cursed and flee. Build: about 3 hours.
6. **Antacid Tablet** (Acid, support). As a player, I want a chalky disc that neutralises my acid puddles and Melting on enemies near it, so that an Acid build has a priority target. Weak Water, resist Acid. Reaction FIZZ (Water on it): it dissolves in a fizzing splash that soaks every enemy nearby. Build: about 1.5 hours.
7. **Canker Sore** (Acid, punisher). From Stork Drop's pools. As a player, I want a slow crawler that leaves a trail of acid behind it, so that its path becomes ground I can't swim through. Weak Water (dilutes the trail), resist Acid. Reaction SALT IN THE WOUND (Water on it): its trail goes harmless and it takes double damage for 4 s. Build: about 1.5 hours.
8. **Stress Ball** (Force, punisher). As a player, I want a squishy ball that gets harder every time Force hits it, so that untyped builds have to bring a damage type. Squeezes visibly as it hardens. Weak Acid and Oil, resist Force (stacking). Reaction SQUISHED (Oil on it): it slips out of shape and loses all its built-up armour. Build: about 1 hour.
9. **Crybaby** (Water, support). From Kiss It Better. As a player, I want a cell that bursts into tears when hurt and its tears heal nearby enemies, so that I finish it in one go or not at all. Weak Static, resist Water. Reaction TANTRUM THROWN (Static while it cries): the tears conduct and shock everything they reached. Build: about 2 hours.
10. **Chameleon Cell** (Soul, joke). As a player, I want a cell that copies the look of the last enemy I killed, so that I sometimes chase the wrong thing. It keeps a giveaway (googly eyes). Weak Soul (shows its true form), resist nothing. Reaction UNMASKED (Soul on it): it is cursed and fights as the thing it copied. Build: about 2 hours.
11. **Clotting Factor** (Blood, support). As a player, I want a cell that clots bleeding enemies near it so their bleeds stop, so that Blood builds kill it first. Weak Oil (thins it), resist Blood. Reaction THINNED OUT (Oil on it): every enemy nearby bleeds twice as fast for 4 s. Build: about 1.5 hours.

### Delight 6
1. **Hairball** (Force, joke). As a player, I want a tangle that collects every Stray Pube and bit of fluff it rolls over and grows, so that leaving junk about makes a big problem. Weak Acid, resist Force. Reaction COMBED OUT (Oil on it): everything it picked up comes loose and slides away. Build: about 2 hours.
2. **Battery Cell** (Static, carrier). As a player, I want a slow cell that powers up the Static enemies near it, so that I see a reason to kill it first. Kill it with Static and it gives me a 4 s charge (Static hits arc further). Weak Static, resist Water. Reaction JUMP-STARTED (Static on it): the charge comes to you instead. Build: about 1.5 hours.
3. **Sneeze Guard** (Mucus, support). As a player, I want a clear wall that walks in front of other enemies and catches my shots in snot, so that I go round it or soften it. Weak Static, resist Force. Reaction WIPED (Water on it): it slides off and the enemies behind it are Snotty. Build: about 2 hours.
4. **Bath Duck** (Water, joke). As a player, I want a rubber duck that bobs about and squeaks, harmless until a puddle is near, when it zooms across it, so that puddles become a hazard to read. Weak Force, resist Water. Reaction DUCK FLU (Cooties while it is in a puddle): it quacks and makes every enemy in the puddle Sick. Build: about 1 hour.
5. **Tooth Decay** (Acid, punisher). As a player, I want a cell that leaves a little Melting on every enemy it touches but buffs their speed, so that its friends hurt more until I kill it. Weak Water, resist Acid. Reaction FLOSSED (Mucus on it): it is stuck and its acid stops. Build: about 1.5 hours.
6. **Fever Blister** (Cooties, joke). As a player, I want a blister that pops when I touch it and leaves a Cooties puddle that makes enemies faster, so that I give it room. Weak Force from range, resist Cooties. Reaction LANCED (Blood on it): the puddle heals me instead. Build: about 1 hour.

### Delight 5
1. **Oil Tanker** (Oil, carrier). As a player, I want a big, slow cell that leaks a slick behind it, so that Static builds get a free Grease Fire if they set it off. Weak Static, resist Force. Reaction SUPERTANKER SPILL (Static on it): the whole wake goes up in a line. Build: about 1.5 hours.
2. **Inkblot** (Soul, joke). As a player, I want a blot that splats an ink cloud when hit and hides other enemies inside it, so that I fire into the dark. Weak Water (washes the ink), resist Soul. Reaction RORSCHACH (Soul on it): the ink takes a ghost shape and haunts the enemies in it. Build: about 1.5 hours.
3. **Plaque** (Mucus, punisher). As a player, I want a sticky film that builds up on walls and shrinks the room over time, so that I clean it before it boxes me in. Weak Acid, resist Mucus. Reaction SCRAPED (Force on it): it flakes off and bowls into enemies. Build: about 3 hours (wall growth).

## 3. Damage type spread after all 32 ideas

Count is the damage type each new enemy is built around. "Reacts to" is how many new enemy reactions each type sets off (the current 8 in brackets).

| Damage type | New enemies | Reacts to (new) | Reacts to (current) |
|---|---|---|---|
| Soul | 5 | 5 | (0) |
| Water | 4 | 6 | (2) |
| Cooties | 4 | 2 | (1) |
| Oil | 4 | 4 | (0) |
| Mucus | 4 | 2 | (1) |
| Acid | 3 | 3 | (1) |
| Force | 3 | 3 | (0) |
| Blood | 3 | 1 | (2) |
| Static | 2 | 6 | (1) |

Static and Water still set off the most enemy reactions (they are the natural counters for wet and charged things); Blood sets off only one, so it is the type to give the next idea.

## 4. Build order (suggested)

1. **Player statuses** (about 1 afternoon): Snotty, Sick, Wet on you, with HUD chips and Rinse clearing them. Unlocks Hayfever Cell, Phlegm Hocker and Snot Bubble's late burst.
2. **Quick wins** (about 1 hour each, no new systems): Stress Ball, Bath Duck, Static Sock, Earwax Plug, Mosquito, Canker Sore, Antacid Tablet.
3. **Puddle users** (about 2 hours each): Grease Trap, Leaky Tap, Bladder, Fever Blister.
4. **Big ones** (3 to 4 hours each): Newton's Cradle, Cootie Catcher, Echo Cell, Lava Lamp, Ouija Planchette, Séance Ring.
