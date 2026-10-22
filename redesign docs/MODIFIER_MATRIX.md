# Weapon Modifier Matrix (matrix 2)

**Status: working draft, 22 Oct 2026. Docs only; nothing is built.** Every cell follows decisions the user made in a grilling session on 22 Oct (section 1). The first matrix (40 modifiers, single-line cells) is in Notion: "Spawn Prawn: Weapon Modifier Matrix". This one replaces it for the 22 modifiers below. Weapon facts come from `BASE_WEAPONS.md`; the shared modifier rules in `MODIFIERS.md` ("Shared rules") still apply to every cell.

Numbers are starting values for sims. All placeholder names here are internal; player-facing card text follows the copy process (`CLAUDE.md`, Copy).

## 1. Rules for this matrix

1. **Levels.** Each cell gives **Lv 1**, what **Lv 2 and Lv 3** each add, and a **Lv 10 mastery** that transforms the weapon (like Nappy Mines' Nuclear Nappy).
2. **Natural fits are Not applicable.** If the weapon already does what the modifier does, the cell is N/A and the draft never offers it there.
3. **The attack type still decides defences** (`MODIFIERS.md` shared rule 1). Where a modifier changes the attack type (Melee, Ranged, Mines, Death from Above), the new type decides Thorns, Evasion and so on.
4. **Charged** is an automatic wind-up (the game autoruns): a visible build-up before each attack, then a stronger one. Slower, harder hits.
5. **Mines** and **Death from Above** replace how the weapon fires; they are not extra attacks. Death from Above's aim and telegraph suit the weapon (homing weapons track the target; area weapons mark a spot for about 0.6 s).
6. **Range** and **Up Close** act on the falloff already in the build (`power11.js`: full damage to 220 units, down to 55% at 600). Matrix decision: they apply to **Projectile and Spread only**; N/A elsewhere. (In code, `power11.js` checks range on every direct hit, beams and bursts included; only pools, damage over time, reactions and allies are exempt.) **Range** also raises projectile speed, and each Range level zooms the camera out one step: up to 3 steps per weapon. The player can still adjust zoom as normal.
7. **Sticky** applies **Snared** on every weapon. On Fire weapons this is a deliberate trade-off: Snared puts Fire out, so the weapon gains control and loses burn.
8. **Turncoat** works on kill only: enemies the weapon kills rise as temporary allies, each weapon its own kind. Turncoat allies have **their own cap: 6 per weapon**, separate from the pets cap (12.3). Elites and bosses never rise (default; user did not object).
9. **Connecting, Turncoat, Melee and Ranged** were designed weapon by weapon with the user.
10. **Advanced Targeting** gives an ordered priority list (nearest, toughest, weakest, fastest, densest cluster, not yet afflicted); levels add slots. Multi-shot weapons also get a specialty: assigning different shots to different foes.
11. **Switched at Birth** gives each weapon one fixed alternate damage type: its starter sample's other type. **Switching must never spoil the attack**: where the mechanic *is* the damage type, the cell is N/A.
12. **Roster:** 26 weapons. The Runs is no longer a weapon; it becomes a sperm passive mutation (see `storm-directive/NOTES.md`, sperm passives thread).

### Conflicts with other docs (to resolve)
1. **Beams do not pierce** (user, 22 Oct). `MODIFIERS.md` 2 says "Beams always pierce", and Spark of Life's spec (`BASE_WEAPONS.md` 27) says it pierces. Here, Piercing applies to Red Flagship and Spark of Life. Soulmate Signal is N/A, since its beam hits everything between you and your twin by design.
2. **Suicide vest** (Melee × Nappy Mines) hurts the player, against `MODIFIERS.md` 10 ("never hurts you"). Deliberate: a joke pick the card warns against.
3. **Long lunge** (Ranged × Enzyme Headbutt) lunges up to 200, past the Lunge cap of 160 (`MODIFIERS.md` 20).
4. **Family Ties base change:** without Connecting, its holes should only drift together very slightly; Connecting Lv 1 restores today's drift.
5. **The Runs removed:** `BASE_WEAPONS.md` roster, Redtail's starters (`SAMPLES.md`) and the archived references need updating; Redtail now has two starters.

## 2. Weapons (quick reference)

| Weapon | Type, attack | What it does |
|---|---|---|
| Standard Issue | Force Projectile | One heavy pellet at one target. |
| Maximum Gains | Force Spread | A fan of pellets, strongest up close. |
| Nervous Wreck | Force Contact | A hard snap on an enemy that gets too close, with recoil. |
| Panic Button | Force Burst | A pulse that throws enemies outward. |
| Acid Spit | Acid Projectile | A pink glob that fills Corrosion (strips Shell). |
| Red Flagship | Static Beam | A thin electrical beam fired forward; Charges. |
| Nocturnal Emission | Mucus Pool | A sticky puddle that Snares enemies crossing it. |
| Little Prick | Blood Projectile | A fast, thin needle at one target; Bleed. |
| Rent Free | Alien Projectile | A ghostly pellet that possesses what it hits. |
| Hot Mess | Fire Pool | A stationary burning patch. |
| Family Ties | Force Projectile | A slow black hole: pulls enemies, bends shots; 5 merged go supernova. |
| Skill Issue | Force Burst | Lobbed lard that sends enemies flying into each other (collision chain, depth 2). |
| There Is No Spoon | Force Projectile | Eats enemy bullets within 90 (store 10) and fires them back in their own type. |
| Nappy Mines | Fire Burst | Proximity mines behind you; blasts leave a burning patch; Domino chains 3. |
| Soulmate Signal | Static Beam | A twin mirrors you across the crowd; a beam joins you both; Charged enemies pass arcs. |
| Unwanted Contact | Static Projectile | Chains through 3 enemies, Charging them; your other weapons arc off Charged enemies. |
| Ewww, Gross | Mucus Projectile | Tapes a target to up to 3 neighbours; damage shared 35% (echo). |
| Blowing Bubbles | Mucus Projectile | Slow bubbles trap small enemies; touching one pops it as a small Burst. |
| One of These Days | Blood Projectile | A 4 s countdown on a big enemy; at the end it takes 40% of what it took, again. |
| Sister Cousin | Blood Projectile | Two homing siblings per shot; a sibling that kills splits in two. |
| Peekaboo | Alien Burst | Vanish 1.8 s, enemies swarm your last spot, then BOO (Fear). |
| Eggs | Alien Burst | Ghostly eggs lure greedy enemies; the egg smites whoever grabs it. |
| Chest Burster | Alien Projectile | Shots infect; infected enemies that die rise as undead allies (4 max). |
| Enzyme Headbutt | Acid Contact | Headbutts the nearest enemy (Corrosion ×2); every 4th hit lunges through. |
| Enzyme Sneeze | Acid Spread | A short fan of 3 heavy acid droplets. |
| Spark of Life | Fire Beam | Burns enemies the Acid has stripped; Premature Evaporation on Corroded targets. |

## 3. The matrix

### 3.1 Exploding Rounds
*Hits explode, damaging enemies near the target. N/A on Burst weapons (they already explode).*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets burst on impact (radius 40, 40% of the hit). | +10 radius and +15% each. | Cluster round: the burst throws 3 mini-pellets that each burst once more. |
| Maximum Gains | The centre pellet bursts (radius 40, 40%). | +1 more bursting pellet each. | Every pellet bursts; bursts overlapping on one enemy merge into one blast (radius 90). |
| Nervous Wreck | Each snap detonates forward (radius 40, 50%), never towards you. | +10 radius and +15% each. | Recoil blast: the explosion also throws you 60 back out of contact. |
| Panic Button | N/A: Burst, already explodes. | | |
| Acid Spit | Globs burst into acid spray (radius 45), adding Corrosion to everything in it. | +10 radius and +20% Corrosion each. | Corroded targets burst twice as wide and leave a short Acid Pool (counts towards the object cap). |
| Red Flagship | Every 0.5 s on target, the beam's tip pops a Static burst (radius 40) that Charges. | Burst every 0.4 s, then 0.3 s. | The burst runs back along the beam to you, Charging everything on the line. |
| Nocturnal Emission | The first enemy to enter sets off a mucus blast (radius 50) that Snares its neighbours; the puddle shrinks 30%. | +10 radius; shrink 20%, then 10%. | The puddle reforms after its blast, once per puddle. |
| Little Prick | Needles burst from inside the target after 0.5 s (radius 35), making neighbours Bleed. | +10 radius and +1 Bleed stack each. | The burst sprays 4 needles outward that make whatever they hit Bleed. |
| Rent Free | The ghost bursts out of its host as it leaves (radius 50). | +10 radius and +20% each. | The burst possesses the weakest enemy it hits for 1 s. |
| Hot Mess | The patch lands with a flaring burst (radius 50) before it burns. | +10 radius and +20% each. | The patch flares again as it burns out. |
| Family Ties | The hole bursts when it expires: +10% damage per enemy it holds (cap +100%). | +15 radius each. | The burst flings held enemies outward into their mates (40% collision damage). |
| Skill Issue | N/A: Burst, already explodes. | | |
| There Is No Spoon | Returned bullets burst in their own damage type (radius 35, 40%). | +10 radius and +15% each. | Bursts of two different types that overlap set off their unstable reaction at once. |
| Nappy Mines | N/A: Burst, already explodes. | | |
| Soulmate Signal | The twin's anchor bursts once a second (radius 45). | Every 0.8 s, then 0.6 s. | Both ends burst: you emit one too (it never hurts you). |
| Unwanted Contact | The last target in each chain bursts (radius 50), Charging what it hits. | +10 radius and +20% each. | Every jump bursts, not just the last (bursts never start new chains). |
| Ewww, Gross | The stamp bursts (radius 50); enemies in the blast are taped too (still up to 3 neighbours). | +10 radius and +1 neighbour each. | When the tape expires, the bundle bursts as one. |
| Blowing Bubbles | Pops become full blasts at double radius; the trapped enemy is still spared. | +15% damage each. | The freed enemy is launched by its own pop into its mates. |
| One of These Days | The payout bursts: the target takes it all, everything within 60 takes 50%. | +15 radius; others take 60%, then 70%. | The burst puts a fresh 2 s countdown on the toughest enemy it hits. |
| Sister Cousin | A sibling's kill bursts in blood (radius 40) before it splits. | +10 radius and +1 Bleed stack each. | Split siblings also burst on their kills. |
| Peekaboo | N/A: Burst, already explodes. | | |
| Eggs | N/A: Burst, already explodes. | | |
| Chest Burster | Infected enemies burst as they die (radius 50), infecting what they hit, then rise. | +10 radius and +1 s infection each. | Undead allies burst when they expire, infecting again. |
| Enzyme Headbutt | The 4th-hit lunge ends in an acid burst behind the target (radius 50). | +10 radius and +25% Corrosion each. | Every headbutt bursts; the lunge's burst is three times the size. |
| Enzyme Sneeze | Droplets that hit the same enemy merge into one acid burst (radius 50). | +10 radius and +20% each. | Each droplet bursts on its own; misses burst on the floor. |
| Spark of Life | Corroded targets burst on first contact (radius 50), spreading Premature Evaporation to neighbours. | +10 radius and +20% each. | Each Premature Evaporation it causes bursts again at half size (once). |

### 3.2 Piercing
*Attacks carry on through enemies, losing 15% per enemy passed (`MODIFIERS.md` 2). Beams do not pierce by default in this matrix (conflict 1). N/A on Pool and Burst, and where the weapon already pierces.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | The pellet passes through 1 enemy. | +1 enemy each. | Railgun: unlimited pierce in a straight line, no damage lost. |
| Maximum Gains | Each pellet passes through 1 enemy. | +1 enemy each. | Pellets gain 10% damage for each enemy they pass instead of losing it. |
| Nervous Wreck | The snap reaches through to the enemy behind the first. | +1 enemy each. | The recoil hits every enemy in the line, in order. |
| Panic Button | N/A: Burst. | | |
| Acid Spit | Globs pass through 1 enemy, Corroding each. | +1 enemy each. | Globs swell with each enemy passed, adding more Corrosion to the next. |
| Red Flagship | The beam carries on past its first target to 1 more. | +1 enemy each. | Unlimited pierce; each enemy passed adds Charge to every enemy beyond it. |
| Nocturnal Emission | N/A: Pool. | | |
| Little Prick | Needles pass through 1 enemy; both Bleed. | +1 enemy each. | Needles stitch every enemy they pass together (tether 2 s). |
| Rent Free | The ghost passes through 1 enemy and possesses the last one it reaches. | +1 enemy each. | It possesses every enemy it passes for 1 s. |
| Hot Mess | N/A: Pool. | | |
| Family Ties | N/A: already pierces everything. | | |
| Skill Issue | N/A: Burst. | | |
| There Is No Spoon | Returned bullets pass through 1 enemy. | +1 enemy each. | Each pierced enemy takes a hit in every damage type currently in your store. |
| Nappy Mines | N/A: Burst. | | |
| Soulmate Signal | N/A: the beam already hits everything between you and the twin. | | |
| Unwanted Contact | The opening shot passes through 1 enemy; the chain starts from the last one hit. | +1 enemy each. | Every enemy it pierces starts its own chain. |
| Ewww, Gross | The stamp passes through 1 enemy, taping two bundles. | +1 enemy each. | Every bundle the stamp passed through is taped to the others. |
| Blowing Bubbles | Bubbles pass through enemies too big to trap until they find a small one (up to 1). | +1 enemy each. | A bubble can trap 2 small enemies together. |
| One of These Days | The needle passes through 1 enemy on its way to the toughest. | +1 enemy each. | Every enemy it passes gets a 2 s mini-countdown (20%). |
| Sister Cousin | Siblings pass through 1 enemy, then home on the next. | +1 enemy each. | A kill made while piercing counts for splitting. |
| Peekaboo | N/A: Burst. | | |
| Eggs | N/A: Burst. | | |
| Chest Burster | Shots pass through 1 enemy, infecting both. | +1 enemy each. | Unlimited pierce in a straight line. |
| Enzyme Headbutt | The headbutt also hits the enemy directly behind. | +1 enemy each. | The 4th-hit lunge carries on through every enemy in its path. |
| Enzyme Sneeze | Droplets pass through 1 enemy. | +1 enemy each. | Each pierced enemy keeps filling Corrosion for 1 s. |
| Spark of Life | The beam carries on past its first target to 1 more. | +1 enemy each. | Unlimited pierce, damaging only Corroded or unshelled enemies on the way. |

### 3.3 Pulling
*Pulls enemies towards the projectile, beam or weapon. Uses the Pull rule (`COMBAT_MATRIX.md` 12.2: Squishy halves it, elites 50%, bosses 25%, never through walls). N/A where the weapon already pulls.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets tug enemies within 50 of their flight path towards it. | +15 radius each. | Impact yanks everything within 100 onto the target. |
| Maximum Gains | Pellets tug enemies towards the fan's centre line. | Stronger pull each (+30%). | Net: enemies in the cone are dragged to its centre before the pellets land. |
| Nervous Wreck | Each snap pulls the next enemy within 120 into contact range. | +20 radius each. | A constant pull on enemies near you: they come to you. |
| Panic Button | The pulse pulls inward for 0.3 s before it throws out. | Stronger and 0.1 s longer each. | Implosion: pull only, then double damage at the centre. |
| Acid Spit | Globs drag enemies within 40 into the splash. | +15 radius each. | An acid strand reels the target 80 towards you. |
| Red Flagship | Enemies within 40 of the beam are drawn onto it. | +15 reach each. | The beam reels everything on it towards you. |
| Nocturnal Emission | The puddle drags enemies within 80 of its rim towards the centre. | +20 radius each. | Puddles slowly drift towards the densest cluster. |
| Little Prick | Each needle tugs its target 30 towards you. | +15 each. | Bleeding enemies are drawn towards each other. |
| Rent Free | The ghost drags enemies it passes 40 along its path. | +20 each. | The possessed enemy walks into its mates, pulling them along. |
| Hot Mess | The patch draws in enemies within 60 of its edge. | +20 radius each. | Burning enemies that try to leave are pulled back. |
| Family Ties | N/A: already pulls. | | |
| Skill Issue | The lard pulls enemies within 60 together before launching. | +15 radius each. | Enemies are pulled into a pile, then launched at once. |
| There Is No Spoon | Enemy bullets within 140 curve towards you to be eaten (store cap still 10). | +30 radius each. | Each returned bullet tugs its shooter 40 towards you. |
| Nappy Mines | Mines pull enemies within 70 in before they go off. | +15 radius each. | Mines pull nearby mines together too, packing them for Domino. |
| Soulmate Signal | Enemies within 50 of the beam are pulled onto it. | +15 reach each. | The twin pulls enemies towards itself. |
| Unwanted Contact | Each jump tugs its target 30 towards the last. | +15 each. | The chain contracts: every chained enemy is pulled to the first. |
| Ewww, Gross | Taped bundles are pulled tight into a clump. | Stronger each. | Bundles within 140 are pulled into each other and merge (cap 8). |
| Blowing Bubbles | Bubbles pull small enemies within 60 towards them. | +20 radius each. | Bubbles drift towards small enemies by themselves. |
| One of These Days | The marked target pulls enemies within 80 towards it before the payout. | +20 radius each. | The payout bursts on everything it pulled in. |
| Sister Cousin | A sibling's hit tugs its target towards the other sibling's target. | Stronger each. | Kill sites pull targets in for the split siblings. |
| Peekaboo | Your last spot pulls searching enemies 40 tighter before the BOO. | +20 each. | Everything in the BOO radius is pulled to the centre first. |
| Eggs | Eggs lure greedy enemies from 260 instead of 230. | +30 each. | Eggs lure every enemy, not just greedy ones (bosses still ignore them). |
| Chest Burster | Undead allies pull enemies within 60 towards them. | +20 radius each. | Infected enemies pull their neighbours in, spreading infection by touch. |
| Enzyme Headbutt | Each headbutt pulls the next nearest enemy within 120 into reach. | +20 radius each. | The lunge drags everything it passes along with you. |
| Enzyme Sneeze | Droplets tug the enemies they hit 30 towards you. | +15 each. | The sneeze ends in an inward gust that pulls the front row together. |
| Spark of Life | The beam pulls Corroded enemies within 60 onto its lane. | +20 radius each. | Corroded enemies are pulled in from anywhere in range. |

### 3.4 Knockback
*Pushes enemies away. N/A where the weapon already knocks back.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets shove targets back 30. | +15 each. | Shoved enemies that hit a mate or wall take 40% collision damage. |
| Maximum Gains | Fans under 100 range blast the front row back 50. | +20 each. | Point-blank fans launch enemies into their mates (40% collision). |
| Nervous Wreck | N/A: the snap already recoils. | | |
| Panic Button | N/A: the pulse already throws enemies out. | | |
| Acid Spit | Globs shove 25; Corroded targets 50. | +15 each. | Shoved Corroded enemies leave an acid streak. |
| Red Flagship | Contact pushes enemies along the beam, 40 a second. | +20 each. | Enemies pushed to the beam's end are flung off it. |
| Nocturnal Emission | Enemies crossing the puddle are squirted out of its rim. | Further each. | Squirted enemies stay Snared where they land. |
| Little Prick | Each needle makes a small flinch (10) that stacks on the same target. | +5 each. | Every 5th needle pins the target in place for 1 s. |
| Rent Free | The ghost passes through and pushes its target 30. | +15 each. | Possessed enemies are pushed into their mates. |
| Hot Mess | Enemies recoil 40 out of the patch as they enter. | +15 each. | Enemies bounce around inside the patch instead of leaving it. |
| Family Ties | The hole repels instead of pulling. | Stronger each. | The supernova blasts everything 200 outward. |
| Skill Issue | N/A: already knockback-based. | | |
| There Is No Spoon | Returned bullets shove targets 30. | +15 each. | The shove scales with how hard the bullet would have hit you. |
| Nappy Mines | Blasts throw enemies 60 clear of the burning patch. | +20 each. | Thrown enemies set off any mine they land near. |
| Soulmate Signal | Dragging the beam shoves enemies 30 sideways, the way you swim. | +15 each. | Enemies shoved off the beam's end are flung away. |
| Unwanted Contact | Each jump shoves its target 25 away from the last. | +15 each. | Jumps launch enemies into each other (40% collision). |
| Ewww, Gross | The bundle is knocked back 40 together. | +20 each. | The bundle crashes into enemies behind it. |
| Blowing Bubbles | Pops throw nearby enemies 50 outward. | +20 each. | The freed enemy flies out like a cannonball. |
| One of These Days | The payout launches the target 60. | +20 each. | The launched target hits its mates for 40% of the payout. |
| Sister Cousin | Siblings shove targets 20 towards the next sibling's target. | +10 each. | Killed enemies are flung into the nearest enemy. |
| Peekaboo | The BOO blows Feared enemies 60 away. | +20 each. | Fleeing enemies trample their mates. |
| Eggs | The smite knocks the grabber and its neighbours 50 from the egg. | +20 each. | The grabber is flung towards the next egg. |
| Chest Burster | Undead allies shove what they attack 30. | +15 each. | Undead rise with a blast that throws enemies back. |
| Enzyme Headbutt | The lunge bulldozes the target 60 forward with you. | +20 each. | Every headbutt knocks back; the lunge launches. |
| Enzyme Sneeze | The sneeze blows the front row back 40. | +15 each. | Sneezed enemies collide for 40%. |
| Spark of Life | Burning enemies are pushed 30 down the lane. | +15 each. | Enemies pushed to the lane's end burst. |

### 3.5 Connecting
*Links enemies the weapon hits. Each weapon's link was chosen with the user. Shared damage is echo damage (`COMBAT_MATRIX.md` 12.1: no bars, no reactions, never shares on). Every link is bounded (12.5).*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Staple: the pellet staples its target to its nearest neighbour for 3 s; the pellet's knockback drags both. | +1 s each; Lv 3 staples to 2 neighbours. | Staples chain: a stapled enemy hit again staples on to the next, up to 4 in a line. |
| Maximum Gains | Clothesline: enemies hit by the same fan are tied in a line for 3 s and can't spread out, so the next fan lands more pellets. | +1 s each; +1 enemy per line. | Lines tighten each fan: tied enemies are dragged 20 closer together every time the fan hits them. |
| Nervous Wreck | Drag partner: the snapped enemy is tethered to the next nearest; its recoil drags the partner away too. | +1 partner each (up to 3). | Partners dragged away are slammed into each other at the end of the recoil (40% collision). |
| Panic Button | Snap-back: enemies thrown by the pulse stay tethered to its centre and snap back together after 1 s, ready for the next pulse. | Snap back 0.2 s sooner each; +10% damage to snapped-back enemies. | Snapped-back enemies collide at the centre (40% collision each). |
| Acid Spit | Drip tether: a strand of acid ties the target to one neighbour for 3 s; anything crossing the strand between them is Corroded. | +1 strand each (up to 3 neighbours). | Strands sag into Acid Pools when they expire (counts towards the object cap). |
| Red Flagship | Beam relay: the beam carries on from its target to 1 linked enemy within 100, like a short chain. | +1 relay each (70% per relay). | Every relayed enemy also relays to 1 more (bounded: 6 enemies in all). |
| Nocturnal Emission | Snot strings: enemies that leave the puddle stay tied to it by a mucus strand for 3 s and are dragged back towards it. | +1 s and stronger drag each. | Strands Snare enemies they touch on the way back. |
| Little Prick | Blood thread: the needle threads its target to a neighbour; Bleeding on one ticks on both. | +1 threaded neighbour each. | The thread stays after a death: a dying enemy passes its Bleed stacks on to its partners. |
| Rent Free | Hive mind: possessed enemies are linked and all move to the same point, bunching their mates as they go. | +1 linked enemy each (up to 4); they gather faster. | When the possession ends, the bunch is left Conjoined for 2 s (they can't move apart). |
| Hot Mess | Shared Burn: enemies in the same patch are linked; Burn filling on one fills 50% on the others. | 60%, then 70%. | When a linked enemy goes up in flames, its partners do too. |
| Family Ties | Merge magnet: holes drift towards each other, so merges (and the supernova) come sooner. Lv 1 is today's drift strength; without this modifier, holes only drift together very slightly (base change, conflict 4). | Faster drift each. | Linked holes merge from twice as far apart. |
| Skill Issue | Bolas: an enemy sent flying is tethered to the mate it hits, and they fly on together into a third (still within the depth-2 chain). | +15% collision damage each. | The tether stays for 2 s after landing, so the pair can't separate. |
| There Is No Spoon | Return to sender: each eaten bullet is linked to the enemy that fired it; the returned bullet homes on that shooter, and hitting it links the shooter to its nearest mate (shares 25%). | +10% shared each. | Every enemy that has shot at you this wave is linked: returns spread 25% to all of them. |
| Nappy Mines | Tripwires: each mine links to the nearest mine within 140; an enemy crossing a wire sets off both ends. | +40 wire length each. | Wires link up to 3 mines in a triangle; crossing any wire sets off all three. |
| Soulmate Signal | Third point: the beam bends through one linked enemy, making a triangle of you, that enemy and the twin. | Lv 3: a second bend point (a four-sided shape). | The bend points are chosen to cover the densest part of the crowd. |
| Unwanted Contact | Aftershocks: enemies the chain jumps through stay linked for 3 s. No solid beam: stuttering sparks crack between them at intervals, and any hit on one arcs to the others. | Sparks more often; +1 s each. | Aftershocks also Charge any enemy that wanders between two linked enemies. |
| Ewww, Gross | N/A: linking enemies is the whole weapon. | | |
| Blowing Bubbles | Bubble string: bubbles are linked by a thin film; popping one pops every bubble on its string in quick succession. | +1 bubble per string each (up to 4). | Each pop on the string is bigger than the last. |
| One of These Days | Joint account: the mark also links the nearest neighbour; damage to either counts towards the stored payout, and both pay out together. | +1 linked neighbour each. | When the account pays out, the total is split evenly across every linked enemy (still echo damage). |
| Sister Cousin | Family feud: enemies hit by siblings from the same shot are linked; when one dies, the others take a burst of Bleed. | +1 Bleed stack each. | A feud death also counts as a kill for splitting. |
| Peekaboo | Echo BOO: enemies that searched for you together are linked; each linked enemy that is Feared lets out a small BOO of its own (radius 60, Fear only). | +20 radius each. | Echo BOOs can Fear enemies that weren't searching (no further echoes). |
| Eggs | Clutch: eggs laid together are linked; grabbing one smites every enemy near any egg in the clutch. | +20 smite radius each. | A clutch of 3 hatches into one big smite over the whole area between the eggs. |
| Chest Burster | Contagion: an infected enemy links to 2 neighbours for 3 s, and they catch the infection too (contagion never spreads on from them). | +1 neighbour each. | Contagion can spread one more step. |
| Enzyme Headbutt | Skewer: the 4th-hit lunge staples the target to the enemy behind it; both are dragged with you and both take the lunge. | +1 skewered enemy each. | The skewer stays 2 s after the lunge, so the pair can't separate. |
| Enzyme Sneeze | Snot web: droplets that land on different enemies string them together for 3 s; Corrosion added to one fills 50% on the others. | 60%, then 70%. | When one webbed enemy is Corroded, the whole web is. |
| Spark of Life | Fuse: linked Corroded enemies form a fuse; setting one off sets off Premature Evaporation on each in turn. | +1 enemy per fuse each (up to 5). | Fuses relight: an enemy that re-Corrodes within 3 s joins the fuse again. |

### 3.6 Turncoat
*Enemies this weapon kills rise as temporary allies (5 s unless the cell says otherwise). Own cap: 6 per weapon, oldest goes first; elites and bosses never rise. Each weapon's ally was chosen with the user.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Human shield: the killed enemy rises as a slow ally that follows you and soaks enemy shots for 5 s; it doesn't attack. | +1 s and +30% toughness each. | Shields stack: up to 3 shields form a wall that also blocks enemies swimming at you. |
| Maximum Gains | Gym buddy: rises bulked up (+50% size and damage) and brawls up close for 4 s. | +1 s and +15% damage each. | Gym buddies spot each other: each extra buddy adds +10% damage to the rest. |
| Nervous Wreck | Bouncer: rises next to you and body-checks any enemy that comes into contact range, for 5 s. | +1 s each; checks hit harder. | Bouncers throw checked enemies into each other (40% collision). |
| Panic Button | Panic room: enemies killed by the pulse rise and run outward, crashing into enemies for Force collision damage. | +1 crash per runner each. | Runners carry a small pulse that goes off on their last crash. |
| Acid Spit | Spitter: rises and spits acid at enemies for 5 s, filling their Corrosion. | +1 s and +20% Corrosion each. | Spitters aim at whatever you are hitting, stripping it for you. |
| Red Flagship | Relay: your beam passes through the ally and carries on from it, as if it were a second emitter. | +1 s and +20 relay range each. | Each relay ally can relay to another relay ally (bounded by the cap of 6). |
| Nocturnal Emission | Bogeyman: rises mucus-covered and wraps the nearest enemy, Snaring both in place for 3 s. | +1 s each; Lv 3 wraps 2 enemies. | When the bogeyman expires, it leaves a puddle where it stood. |
| Little Prick | Blood brother: attacks for 5 s; its hits make enemies Bleed. | +1 s and +1 Bleed stack each. | Blood brothers' kills rise as blood brothers too (cap still 6). |
| Rent Free | Poltergeist: its ghost rises (no body) and passes through enemies, Fearing them, for 5 s. It can't be hit. | +1 s each. | Poltergeists possess the first enemy they Fear for 2 s. |
| Hot Mess | Fire walker: rises burning and chases enemies for 4 s, setting them alight on contact. | +1 s and +20% Burn each. | Fire walkers leave a short burning patch where they collapse. |
| Family Ties | Satellite: enemies crushed in the hole rise and orbit it, slamming into enemies being pulled in. | +1 s and +20% slam damage each. | Satellites survive the supernova and are flung outward through the crowd. |
| Skill Issue | Bowling ball: rises greased and rolls through the crowd once, sending each enemy it hits flying (starts a collision chain). | +1 enemy per roll each. | Bowling balls bounce off walls and roll a second time. |
| There Is No Spoon | Bullet sponge: rises and stands in front of you, absorbing enemy bullets for 4 s. | +1 s each. | Bullets the sponge absorbs go into your store (still capped at 10). |
| Nappy Mines | Suicide runner: rises carrying a mine and swims into the nearest group, where the mine goes off. | +15% blast and +10 radius each. | Runners leave a burning patch twice the normal size. |
| Soulmate Signal | Third wheel: rises as a second anchor; the beam runs you, twin, ally for 5 s, bending to cover more of the crowd. | +1 s each. | Two third wheels make a four-point beam. |
| Unwanted Contact | Tesla zombie: rises crackling and shocks enemies near it every 1 s for 5 s, starting a small chain (2 jumps) each time. | +1 s and +1 jump each. | Tesla zombies Charge everything they shock, so your other weapons arc off them. |
| Ewww, Gross | Sticky friend: rises still taped and hugs the nearest enemy, taping itself to it; damage to the ally is shared to the enemy, never the other way. | +1 s and +10% shared each. | The sticky friend tapes itself to a whole bundle (up to 3). |
| Blowing Bubbles | Bubble boy: rises inside a bubble that rolls towards enemies and pops on the first one it meets. | +20% pop damage each. | The pop traps the next small enemy in a fresh bubble. |
| One of These Days | Debt collector: a marked enemy that dies early rises and swims to the toughest enemy nearby, sticking a fresh countdown on it. | +10% repeat on the new countdown each. | The collector brings the old target's stored damage with it, adding it to the new payout. |
| Sister Cousin | Adopted: rises as an adopted sibling and fights for 5 s; your siblings home on whatever it is attacking. | +1 s each. | Adopted siblings split like real ones when they kill (cap still 6). |
| Peekaboo | Decoy: enemies killed by the BOO rise looking like you; enemies search for the decoys too, so the next BOO catches more. | +1 s each. | Decoys BOO with you, each in a small radius. |
| Eggs | Hatchling: a smitten enemy hatches back up as a small ghost ally that fights for 5 s. | +1 s and +20% damage each. | Hatchlings lay one egg when they expire. |
| Chest Burster | N/A: raising killed enemies is already its signature. | | |
| Enzyme Headbutt | Battering ram: rises and charges in the direction of your lunge, headbutting the first enemy it meets. | +20% headbutt damage and Corrosion each. | Rams lunge through their target, like yours. |
| Enzyme Sneeze | Contagious: rises and sneezes acid at enemies every 1.5 s for 5 s. | +1 s and +1 droplet each. | Enemies it kills also rise contagious (cap still 6). |
| Spark of Life | Ember: rises as a burning husk and swims at the nearest Corroded enemy, bursting into Premature Evaporation on it. | +15% burst damage each. | Embers chain: an ember's burst can raise another ember. |

### 3.7 Melee
*Turns the weapon into a close-range attack. It becomes Contact unless the cell says otherwise, so Thorns answers each hit and Evasion can make it miss (matrix 13). Each version was chosen with the user.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Head-on ram: the sperm itself rams forward 60 into the target, +50% damage. | +15 ram length and +15% damage each. | Rams carry through the first target into the next. |
| Maximum Gains | Flex: a 120° swipe in front, hitting every enemy within 80, then a short recoil backwards (Lunge, Spread recoil). | +15 reach and +15% each. | Every 3rd flex is a full 360° swipe. |
| Nervous Wreck | N/A: already Contact. | | |
| Panic Button | Panic slap: a flurry of 3 quick slaps on the nearest enemy; the third throws it outward. | +1 slap each (the last always throws). | The final slap sets off the old pulse around the target. |
| Acid Spit | Acid kiss: a wet bite on the nearest enemy within 70; Corrosion fills twice as fast. | ×2.5, then ×3. | The kiss leaves the target drooling acid on its neighbours for 2 s. |
| Red Flagship | Static aura: a crackling ring round the sperm (radius 50) zaps anything inside every 0.2 s. | +10 radius each. | The aura Charges what it zaps, and Charged enemies pass the zap to one neighbour. |
| Nocturnal Emission | Slime coat: the puddle coats the sperm instead; enemies that touch you are Snared and take mucus damage. | +1 s Snare and +20% damage each. | Enemies Snared by your coat stick to you and are dragged along as a shield (up to 2). |
| Little Prick | Stab: a quick jab at the nearest enemy within 60, with double Bleed stacks. | +10 reach and +1 Bleed stack each. | Every 4th stab hits an artery: the target's Bleed stacks all tick at once. |
| Rent Free | Haunted touch: any enemy that touches you is possessed for 2 s. | +0.5 s each. | Enemies possessed by your touch swim away from you, dragging their mates. |
| Hot Mess | Hot to touch: the sperm itself burns; enemies within 40 of you, or touching you, fill their Burn bar. | +10 radius each. | You leave a short scorch where you swim (one piece every 60 units; counts towards the object cap). |
| Family Ties | Event horizon: a small black hole sits on the sperm (radius 60); enemies near you are pulled in and crushed. | +10 radius each. | Shots passing near you bend round you (enemy shots away, yours towards enemies). |
| Skill Issue | Lard slap: a greasy slap on the nearest enemy sends it flying into its mates (collision chain as usual). | +20% launch distance each. | Slapped enemies stay greased: anything they touch in the next 2 s is launched too. |
| There Is No Spoon | Spoon whack: when stocked, it smacks the nearest enemy with all stored bullets at once (each keeps its damage type). | +10 reach and +10% each. | A whack with 3 or more damage types sets off their unstable reactions on the target. |
| Nappy Mines | Suicide vest: a blast goes off on the sperm every 2 s, leaving a burning patch; it **hurts you too** (conflict 2). Not advised, and the card says so. | +20% blast and +20% self-damage each. | The vest's blast heals you instead of hurting you if it hits 5 or more enemies. |
| Soulmate Signal | Orbit twin: the twin circles you at 70, sweeping the beam round you like a blade. | Faster orbit each. | Two twins orbit on opposite sides. |
| Unwanted Contact | Bad touch: any enemy that touches you is zapped and starts a chain (3 jumps) from there. | +1 jump each. | Bad touch also Charges every enemy within 80 of you once a second. |
| Ewww, Gross | Tape slap: slaps tape onto the nearest enemy within 60, taping it to up to 4 neighbours (one more than the shot). | +1 neighbour each. | Taped bundles are stuck to you and dragged along (up to 1). |
| Blowing Bubbles | Bubble butt: the sperm sits inside a bubble; an enemy touching it pops it as a Burst, and it reforms after 3 s. | Reforms 0.5 s sooner each. | The pop traps the enemy that popped it, if it is small. |
| One of These Days | Tick tock: every enemy that touches you gets a 4 s countdown. | +5% repeat each. | Countdowns started by touch pay out on every enemy within 60 of the target. |
| Sister Cousin | Clingy siblings: siblings never leave your side (radius 80) and peck any enemy that comes close; kills still split. | +1 sibling each. | Split siblings also stay close, so a kill-heavy fight builds a swarm round you (cap 12). |
| Peekaboo | Behind you!: you vanish and reappear right behind the nearest enemy, BOOing in a small radius (80) at double damage. | +15 radius each. | You reappear behind the toughest enemy instead, and its Fear lasts twice as long. |
| Eggs | Nest egg: eggs are carried on you; an enemy that comes within 60 tries to grab one and is smitten. | +1 egg carried each. | Grabbing an egg from you also Fears the grabber's neighbours. |
| Chest Burster | Facehugger: latches on to the nearest enemy within 60 and infects it instantly; the undead it raises is +50% stronger. | +10 reach and +10% undead strength each. | The facehugger jumps to a new host when its target dies. |
| Enzyme Headbutt | N/A: already Contact. | | |
| Enzyme Sneeze | Face full: sneezes point-blank (range 60) in a wide 90° spray; each droplet adds double Corrosion. | +15° and +1 droplet each. | Every 3rd sneeze is a ring round you. |
| Spark of Life | Blowtorch: a short, thick flame (range 60) that burns +60% harder and still prefers Corroded enemies. | +10 range and +10% each. | Premature Evaporation from the blowtorch is twice the size. |

### 3.8 Ranged
*Turns a close-range weapon into a ranged one. Applies only to Nervous Wreck, Enzyme Headbutt, Peekaboo and Panic Button; N/A on the other 22. Each version was chosen with the user.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Nervous Wreck | Thrown clamp: throws a clamp that snaps shut on an enemy up to 220 away, then yanks it 60 towards you. It is now a Projectile (Evasion applies; Thorns doesn't). | +40 range and +20 yank each. | The yanked enemy is slammed into the first enemy in its path (40% collision). |
| Enzyme Headbutt | Long lunge: every hit is a lunge from up to 200 away, so you dash in from range. Still Contact. Past the 160 lunge cap (conflict 3). | Lunges come 0.1 s sooner each. | Each lunge headbutts every enemy it passes on the way in. |
| Peekaboo | Throw your voice: the BOO goes off at a decoy spot up to 260 away (the densest cluster); enemies search there, not where you were. | +40 range each. | Two decoy spots, each BOOing in turn. |
| Panic Button | Remote detonator: places a button on the floor that goes off when 3 enemies are near it. | 1 more button on the floor each (up to 3). | Buttons set each other off in a chain (bounded: 3). |
| Every other weapon | N/A: already ranged. | | |

### 3.9 Charged
*An automatic wind-up: a visible build-up before each attack, then a stronger attack. Slower, harder hits. N/A where waiting longer is already the weapon's payoff.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Winds up 0.5 s, then fires a bigger pellet (+70% damage, +30% knockback). | +20% damage each. | A full charge pierces the whole line. |
| Maximum Gains | Winds up 0.5 s; the fan tightens to 20° and each pellet hits +50% harder. | +15% each. | A charged fan at point blank stuns the front row for 1 s. |
| Nervous Wreck | Winds up 0.4 s; the next snap is +70% and stuns for 0.5 s. | +0.2 s stun each. | A charged snap stuns everything in contact range. |
| Panic Button | Winds up 0.6 s; the pulse is +40% radius and +40% damage. | +15% each. | A full charge throws enemies so hard they collide (40%). |
| Acid Spit | Winds up 0.5 s; the glob is twice the size and fills Corrosion ×2. | ×2.5, then ×3. | A charged glob strips one full Shell layer on impact. |
| Red Flagship | Winds up 0.6 s; the next on-phase is a thick beam (+60% damage, double width). | +15% each. | A charged beam Charges everything it touches instantly. |
| Nocturnal Emission | Winds up 0.6 s; puddles are 40% larger. | +15% each. | Charged puddles Snare instantly on contact. |
| Little Prick | Winds up 0.4 s; a heavy needle with +2 Bleed stacks. | +1 stack each. | A charged needle pierces and Bleeds everything in a line. |
| Rent Free | Winds up 0.5 s; the ghost possesses for twice as long. | +0.5 s each. | A charged ghost possesses every enemy it passes. |
| Hot Mess | Winds up 0.6 s; the patch is hotter (+40% Burn) and wider (+20%). | +15% each. | Charged patches flare once a second. |
| Family Ties | Winds up 0.8 s; the hole is larger (+30 radius) and pulls +30% harder. | +15% each. | A charged hole counts as 2 for merging. |
| Skill Issue | Winds up 0.5 s; the dollop launches enemies 50% further. | +15% each. | A charged dollop's chain goes one step deeper (depth 3). |
| There Is No Spoon | Holds returns until the store is full, then fires all 10 as one volley. | Volley spreads over a wider arc each. | The volley fires in a ring round you. |
| Nappy Mines | Winds up 0.4 s per mine; mines have +30% blast and patch. | +15% each. | Every charged mine counts double towards the Nuclear Nappy. |
| Soulmate Signal | The twin winds up 0.6 s when it re-anchors; the beam is twice as wide for 1 s. | +0.3 s each. | Charged re-anchors arc to 5 jumps instead of 3. |
| Unwanted Contact | Winds up 0.5 s; the shot starts with 1 more jump and less falloff (80%). | +1 jump each. | A charged chain has no falloff. |
| Ewww, Gross | Winds up 0.5 s; the stamp tapes 2 more neighbours. | +1 each. | Charged tape shares 50% instead of 35%. |
| Blowing Bubbles | Winds up 0.5 s; bubbles can trap enemies up to 60 max health. | +15 max health each. | Charged bubbles can trap elites (never bosses). |
| One of These Days | Winds up 0.6 s; the mark stores 55% instead of 40%. | +5% each. | A charged mark's payout also Bleeds everything within 80. |
| Sister Cousin | Winds up 0.5 s; fires 3 siblings instead of 2. | +1 sibling each. | Charged siblings split into 3 on a kill. |
| Peekaboo | Hiding winds up the BOO: +10% damage per 0.5 s hidden, beyond the current bonus. | +5% each. | A fully charged BOO stuns as well as Fears. |
| Eggs | N/A: eggs already smite harder the longer they wait. | | |
| Chest Burster | Winds up 0.4 s; the shot infects for twice as long and its undead are +30% stronger. | +15% each. | A charged shot infects everything within 60 of its target. |
| Enzyme Headbutt | Winds up 0.4 s; the next headbutt is a lunge (instead of every 4th). | Lunge +20 each. | Charged lunges Corrode everything they pass. |
| Enzyme Sneeze | Winds up 0.5 s; 5 droplets instead of 3. | +1 droplet each. | A charged sneeze leaves a short Acid Pool in front of you. |
| Spark of Life | Winds up 0.6 s; the next on-phase burns +60% and lasts 0.5 s longer. | +15% each. | A charged beam sets off Premature Evaporation on every Corroded enemy in its lane at once. |

### 3.10 Rapid Fire
*Faster attacks at lower strength. Baseline: +40% attack rate, -25% damage per hit; each level adds +15% rate. Statuses build per hit, so rapid weapons fill bars well.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Fires faster, weaker pellets (+40% rate, -25% damage). | +15% rate each. | Minigun: rate ramps up the longer it fires at one target (up to +100%). |
| Maximum Gains | Faster, narrower fans (3 fewer pellets). | +15% rate each. | Fans alternate left and right, covering a wider arc over time. |
| Nervous Wreck | Faster, lighter snaps. | +15% rate each. | Snaps hit every enemy in contact range at once. |
| Panic Button | Faster, smaller pulses (-20% radius). | +15% rate each. | Pulses ripple outward one after another from the same point. |
| Acid Spit | Faster, smaller globs. | +15% rate each. | Globs come in a continuous stream (a short Acid jet). |
| Red Flagship | The beam becomes fast, weak pulses. | +15% rate each. | Pulses fork to a second target. |
| Nocturnal Emission | Smaller puddles, laid more often. | +15% rate each. | Puddles laid close together merge into one large puddle. |
| Little Prick | A rapid stream of weaker needles. | +15% rate each. | Every 10th needle opens the target: all its Bleed stacks tick at once. |
| Rent Free | Faster, weaker ghosts with shorter possessions. | +15% rate each. | Ghosts that hit an already possessed enemy extend it instead. |
| Hot Mess | Smaller patches, laid more often. | +15% rate each. | Patches laid in a line join into a burning strip. |
| Family Ties | Smaller holes, more often (still capped at 3 wells). | +15% rate each. | Small holes merge twice as easily. |
| Skill Issue | Smaller dollops, more often. | +15% rate each. | Dollops landing on a flying enemy send it flying again. |
| There Is No Spoon | Returns fire faster at lower damage. | +15% rate each. | Returned bullets fire in pairs. |
| Nappy Mines | Smaller mines, more often. | +15% rate each. | Mines dropped within 40 of each other fuse into one bigger mine. |
| Soulmate Signal | The beam pulses rapidly instead of holding. | +15% rate each. | Each pulse arcs once to a Charged enemy off the beam. |
| Unwanted Contact | Faster, weaker chain shots. | +15% rate each. | Chains that cross each other's path both gain a jump. |
| Ewww, Gross | Faster stamps; tape lasts 3 s instead of 5. | +15% rate each. | Stamps on an already taped enemy extend its tape. |
| Blowing Bubbles | A stream of smaller bubbles. | +15% rate each. | Small bubbles merge into a big one that can trap larger enemies. |
| One of These Days | Faster shots with shorter countdowns (3 s, 30%). | +15% rate each. | Each extra mark on the same target stacks its stored share (cap 80%). |
| Sister Cousin | More, weaker siblings. | +15% rate each. | Siblings that hit the same target in quick succession each add +10%. |
| Peekaboo | Shorter vanishes, more frequent smaller BOOs. | +15% rate each. | Every 3rd BOO is a full-strength one. |
| Eggs | Smaller eggs, dropped more often. | +15% rate each. | Eggs that aren't grabbed hatch into a small smite when they expire. |
| Chest Burster | Faster, weaker infecting shots. | +15% rate each. | Infection stacks: 3 hits raise a stronger undead. |
| Enzyme Headbutt | Faster, lighter headbutts. | +15% rate each. | The lunge comes every 3rd hit instead of every 4th. |
| Enzyme Sneeze | Sneezes more often with smaller droplets. | +15% rate each. | A sneezing fit: every 4th sneeze is 3 sneezes in a row. |
| Spark of Life | The beam pulses rapidly instead of holding. | +15% rate each. | Each pulse hitting a Corroded target adds Burn to its neighbours. |

### 3.11 Advanced Targeting
*The default is one target, picked by the weapon's own rule. Lv 1 gives an ordered list of 2 rules from the menu: nearest, toughest, weakest, fastest, densest cluster, not yet afflicted (by this weapon's status). Lv 2 and Lv 3 add a slot each (4 rules). The mastery is a weapon specialty, such as assigning different shots to different foes. N/A where the weapon doesn't aim.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | 2-rule priority list. | +1 slot each. | Last-hit lock: stays on a target until it dies, then takes the next by your list. |
| Maximum Gains | 2-rule list for where the fan points. | +1 slot each. | Split fan: the left half and right half follow different rules. |
| Nervous Wreck | 2-rule list for which enemy in contact range to snap. | +1 slot each. | Ignores enemies that would trigger Thorns, unless nothing else is in range. |
| Panic Button | 2-rule list for when to go off (first enemy in range, densest moment, toughest in range). | +1 slot each. | Holds its pulse until at least N enemies are in range (you set N). |
| Acid Spit | 2-rule list; "not yet afflicted" means not yet Corroded. | +1 slot each. | Assign shots: every other glob takes your second rule. |
| Red Flagship | 2-rule list for the beam's aim. | +1 slot each. | Sweep order: the beam moves along your list, target to target, without returning. |
| Nocturnal Emission | 2-rule list for where puddles are laid (densest, path of the fastest, toughest). | +1 slot each. | Puddles are laid on enemies' predicted paths. |
| Little Prick | 2-rule list; "not yet afflicted" means not yet Bleeding. | +1 slot each. | Assign shots: needles spread across your list's top 3 targets in turn. |
| Rent Free | 2-rule list for who to possess. | +1 slot each. | Never possesses an enemy that is already possessed. |
| Hot Mess | 2-rule list for where to lay the patch. | +1 slot each. | Patches go where enemies will be in 1 s. |
| Family Ties | 2-rule list for where to place the hole. | +1 slot each. | Places holes to set up merges (near an existing hole) when your list allows. |
| Skill Issue | 2-rule list for where to lob. | +1 slot each. | Lobs aim to set up the longest collision chain. |
| There Is No Spoon | 2-rule list for returned bullets. | +1 slot each. | Assign by type: each returned bullet goes to the enemy weakest to its damage type. |
| Nappy Mines | 2-rule list for where mines are dropped (behind you, on enemy paths, near other mines). | +1 slot each. | Mines are dropped to make the most Domino links. |
| Soulmate Signal | 2-rule list for where the twin anchors. | +1 slot each. | The twin anchors so the beam crosses the most enemies. |
| Unwanted Contact | 2-rule list for the first shot and for each jump separately. | +1 slot each. | Jump rules: each of the 3 jumps can follow a different rule. |
| Ewww, Gross | 2-rule list for the stamp target. | +1 slot each. | Picks the target whose neighbours make the biggest bundle. |
| Blowing Bubbles | 2-rule list; small enemies only, as always. | +1 slot each. | Never sends a bubble at an enemy another bubble is already chasing. |
| One of These Days | 2-rule list (default: toughest). | +1 slot each. | Never marks an enemy that will die before the countdown ends. |
| Sister Cousin | 2-rule list for siblings, and a separate one for split siblings. | +1 slot each. | Assign shots: the two siblings take different targets by default. |
| Peekaboo | N/A: it goes off round you and doesn't aim. | | |
| Eggs | 2-rule list for where eggs are dropped. | +1 slot each. | Eggs are dropped to lure the enemy at the top of your list. |
| Chest Burster | 2-rule list; "not yet afflicted" means not yet infected. | +1 slot each. | Infects enemies close to death first, so allies rise sooner. |
| Enzyme Headbutt | 2-rule list for which enemy to headbutt. | +1 slot each. | The 4th-hit lunge follows its own rule (e.g. toughest), separate from the headbutts. |
| Enzyme Sneeze | 2-rule list for where the sneeze points. | +1 slot each. | Points the sneeze to hit the most enemies that aren't yet Corroded. |
| Spark of Life | 2-rule list (default: Corroded first, as in its spec). | +1 slot each. | Waits for a target's Corrosion bar to fill before burning it, when your list allows. |

### 3.12 Range
*Projectile and Spread only (N/A elsewhere). Pushes back the falloff in `power11.js` (full damage to 220, down to 55% at 600), raises projectile speed, and zooms the camera out one step per level (up to 3 steps per weapon; the player can still adjust zoom as normal).*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Full damage to 300; falls to 65% at 700. +20% speed. Zoom +1. | +80 to both, +10% speed, zoom +1 each. | No falloff at all; hits beyond 400 deal +20%. |
| Maximum Gains | Pellet spread tightens 20%; full damage to 280. +20% speed. Zoom +1. | +60 and tighter, zoom +1 each. | The fan holds its shape at any range: the full fan lands at 500. |
| Acid Spit | Full damage to 300; +20% speed. Zoom +1. | +80, +10% speed, zoom +1 each. | Globs that travel more than 400 burst on landing. |
| Little Prick | Full damage to 320; +25% speed. Zoom +1. | +80, +10% speed, zoom +1 each. | Needles that fly more than 400 cause double Bleed. |
| Rent Free | Full damage to 300; the ghost glides 20% faster. Zoom +1. | +80, +10%, zoom +1 each. | Ghosts that travel more than 400 possess for twice as long. |
| Family Ties | The hole travels 30% further before it stops. Zoom +1. | +20% each, zoom +1 each. | The hole keeps travelling until it merges or expires. |
| There Is No Spoon | Returned bullets keep full damage to 300; +20% speed. Zoom +1. | +80, +10%, zoom +1 each. | Returned bullets gain damage the further they fly (up to +50%). |
| Unwanted Contact | Full damage to 300; +20% speed; jump range +20. Zoom +1. | +80 and +20 jump range, zoom +1 each. | Jump range doubles. |
| Ewww, Gross | Full damage to 300; +20% speed; tape radius +20. Zoom +1. | +80 and +20, zoom +1 each. | Tape reaches neighbours up to 260 away. |
| Blowing Bubbles | Bubbles travel 30% further and 20% faster. Zoom +1. | +20% each, zoom +1 each. | Bubbles never pop on their own: they drift until something touches them. |
| One of These Days | Full damage to 320; +25% speed. Zoom +1. | +80, +10%, zoom +1 each. | Marks placed from more than 400 away store 55%. |
| Sister Cousin | Siblings search 30% further for targets; +20% speed. Zoom +1. | +20% each, zoom +1 each. | Split siblings can reach targets anywhere on screen. |
| Chest Burster | Full damage to 300; +20% speed. Zoom +1. | +80, +10%, zoom +1 each. | Shots that fly more than 400 infect everything within 50 of the target. |
| Enzyme Sneeze | Droplets carry to 220 instead of 160; full damage to 220. Zoom +1. | +30 each, zoom +1 each. | The sneeze becomes a long, narrow jet (range 400). |
| Every other weapon | N/A: Range and Up Close are Projectile and Spread only. | | |

### 3.13 Up Close
*Projectile and Spread only (N/A elsewhere). Steepens the falloff but raises damage close in: +40% within 120 at Lv 1; full damage ends at 160 and drops to 40% by 450.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | +40% within 120; steeper falloff. | +15% close damage each. | Point-blank hits (under 60) knock the target back into its mates. |
| Maximum Gains | +40% within 120: the fan at point blank is brutal. | +15% each. | Point-blank fans stun the front row for 0.5 s. |
| Acid Spit | +40% damage and Corrosion within 120. | +15% each. | Point-blank globs strip a full Shell layer. |
| Little Prick | +40% within 120; +1 Bleed stack up close. | +15% and +1 stack each. | Point-blank needles hit twice. |
| Rent Free | +40% within 120; possession lasts 1 s longer up close. | +15% each. | Point-blank possession makes the host attack its nearest mate at once. |
| Family Ties | The hole pulls 40% harder within 120 of you. | +15% each. | A hole placed within 120 of you can't be left by enemies until it expires. |
| There Is No Spoon | Returned bullets hit +40% within 120. | +15% each. | Bullets returned to enemies within 60 hit at double damage. |
| Unwanted Contact | +40% within 120; close chains start with +1 jump. | +15% each. | Every jump within 120 of you Charges twice. |
| Ewww, Gross | +40% within 120; close stamps tape 1 more neighbour. | +15% each. | Point-blank stamps bundle every enemy within 80. |
| Blowing Bubbles | Bubbles blown within 120 trap enemies up to 50 max health. | +15 max health each. | Point-blank pops double in radius. |
| One of These Days | Marks placed within 120 store 50%. | +5% each. | Point-blank marks count down in 2 s. |
| Sister Cousin | Siblings hit +40% within 120 of you. | +15% each. | Siblings return to you after each hit, striking again on the way. |
| Chest Burster | +40% within 120; close infections raise undead +30% stronger. | +15% each. | Point-blank infection is instant: the undead rises on the next hit. |
| Enzyme Sneeze | +40% damage and Corrosion within 120. | +15% each. | At point blank the droplets merge into one heavy splash. |
| Every other weapon | N/A: Range and Up Close are Projectile and Spread only. | | |

### 3.14 Mines
*Replaces how the weapon fires: it lays mines that trigger when enemies come near (trigger radius 60, life 14 s, 5 on the floor at most). The mine delivers the weapon's own attack. N/A where the weapon already lays traps. Mines count towards the object cap.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellet mines lodge in the floor and fire a pellet at the first enemy to come near. | +1 mine on the floor and +15% each. | Mines fire 3 pellets at the 3 nearest enemies. |
| Maximum Gains | Fan mines fire a fan towards the enemy that tripped them. | +1 mine and +1 pellet each. | Mines fire a full ring of pellets. |
| Nervous Wreck | Snap traps clamp the first enemy to step in (Contact rules apply to the trap). | +1 trap and +15% each. | Clamped enemies are held for 1 s. |
| Panic Button | Pulse mines go off when an enemy comes near. | +1 mine and +10 radius each. | Pulse mines set each other off in a chain (up to 3). |
| Acid Spit | Acid mines spray a glob's worth of Corrosion over everything near. | +1 mine and +20% Corrosion each. | Acid mines leave an Acid Pool. |
| Red Flagship | Beam traps fire a short beam (120) across a gap when an enemy crosses it. | +1 trap and +20 beam length each. | Two traps within 200 join with a standing beam between them. |
| Nocturnal Emission | Puddles stay hidden until an enemy steps in, then Snare instantly. | +1 hidden puddle each. | A sprung puddle springs every hidden puddle within 160. |
| Little Prick | Needle traps spring a needle at enemies passing. | +1 trap and +1 Bleed stack each. | Traps spring 3 needles. |
| Rent Free | Ghost mines possess the first enemy to pass. | +1 mine and +0.5 s each. | The possessed enemy carries a new ghost mine with it. |
| Hot Mess | Patches stay hidden until an enemy steps in, then flare. | +1 hidden patch each. | Sprung patches spread to twice their size. |
| Family Ties | A dormant hole opens when enemies come near. | +1 dormant hole (still 3-well cap) each. | Dormant holes open together, merging at once. |
| Skill Issue | Lard mines launch whoever steps on them. | +1 mine and +20% launch each. | Launched enemies land on the next lard mine. |
| There Is No Spoon | Eaten bullets are planted as mines that fire back at the first enemy to come near. | +1 planted bullet each. | Planted bullets fire at every enemy that comes near, until spent. |
| Nappy Mines | N/A: already mines. | | |
| Soulmate Signal | The twin becomes a fixed anchor; when enemies come between you and it, the beam fires. | +40 anchor range each. | A second fixed anchor; the beam runs between all three points. |
| Unwanted Contact | Charged mines start a chain when tripped. | +1 mine and +1 jump each. | Charged mines link to each other: a chain from one jumps through the others. |
| Ewww, Gross | Tape traps bundle whoever steps in with their neighbours. | +1 trap and +1 neighbour each. | A tape trap that bundles 4 enemies sets the next trap. |
| Blowing Bubbles | Bubbles hover in place as traps until a small enemy touches one. | +1 bubble and +10 s life each. | Hovering bubbles drift slowly towards small enemies. |
| One of These Days | Countdown mines mark whoever trips them. | +1 mine and +5% repeat each. | The payout re-arms the mine. |
| Sister Cousin | Sibling nests release siblings at enemies that come near. | +1 nest and +1 sibling each. | Nests release siblings again when one of their siblings kills. |
| Peekaboo | You leave a decoy that BOOs when enemies arrive (you don't vanish). | +1 decoy and +20 radius each. | Decoys draw the search: enemies hunt the decoy instead of you. |
| Eggs | N/A: eggs already work as lures on the ground. | | |
| Chest Burster | Infection traps infect whoever steps in. | +1 trap and +1 s infection each. | Undead raised from trap victims plant a new trap where they rose. |
| Enzyme Headbutt | Leaves an acid trap where you headbutted; it bites the next enemy to step on it. | +1 trap and +20% Corrosion each. | Traps lunge at enemies passing within 80. |
| Enzyme Sneeze | Sneeze traps spray the next enemy to come near. | +1 trap and +1 droplet each. | Sneeze traps go off twice. |
| Spark of Life | Beam traps fire a short Fire beam across a gap when a Corroded enemy crosses it. | +1 trap and +20 beam length each. | Traps fire at any enemy, but burn Corroded ones +50%. |

### 3.15 Death from Above
*Replaces how the weapon fires: the attack lands from above, ignoring walls and line of sight (never into a sealed arena from outside it). The aim and telegraph suit the weapon. Homing weapons track their target, with the strike landing where the target is. Area weapons mark a spot on the floor for 0.6 s. Single-target strikes show a 0.4 s reticle.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | A heavy Force slug drops on the target (0.4 s reticle), +40% damage. | +15% each. | Each slug leaves a small crater that nudges enemies inward. |
| Maximum Gains | A shower of pellets over a marked zone (radius 70, 0.6 s). | +15 radius each. | The shower walks forward across the crowd over 1 s. |
| Nervous Wreck | A stomp lands on the nearest enemy within 160 (0.4 s reticle) and knocks back everything round it. Now a Burst. | +20 radius each. | The stomp stuns for 0.5 s. |
| Panic Button | The pulse lands from above on the densest cluster (0.6 s mark). | +20 radius each. | Two pulses land in quick succession on the two densest clusters. |
| Acid Spit | Acid rain over a marked zone (radius 70) for 1.5 s, Corroding everything in it. | +15 radius and +0.5 s each. | The rain follows the densest cluster while it falls. |
| Red Flagship | A lightning bolt strikes the target from above (0.4 s reticle) and Charges everything within 50. | +20 radius each. | The bolt forks into 3 more bolts on nearby enemies. |
| Nocturnal Emission | A mucus drop falls on the densest cluster and spreads into a puddle (0.6 s mark). | +20% puddle size each. | The drop Snares everything it lands on instantly. |
| Little Prick | A rain of needles over the target (0.4 s reticle), each causing Bleed. | +2 needles each. | The needles pin the target in place for 1 s. |
| Rent Free | A ghost dives from above onto the toughest enemy and possesses it. Tracks its target (homing). | +0.5 s possession each. | The ghost possesses everything within 60 of where it lands. |
| Hot Mess | A burning drop falls and becomes a patch (0.6 s mark). | +20% patch size each. | The drop splashes into 3 patches. |
| Family Ties | The black hole drops onto the densest cluster (0.6 s mark) instead of travelling there. | +20 radius each. | Holes dropped within 100 of another merge on landing. |
| Skill Issue | A dollop falls on the densest cluster (0.6 s mark), sending everything flying outward. | +15% launch each. | Enemies are launched upward and land on their mates (collision 40%). |
| There Is No Spoon | Stored bullets rain down on the enemies that fired them (each tracks its shooter). | +10% each. | Rain falls on every enemy within 100 of each shooter too. |
| Nappy Mines | Mines are dropped from above onto enemy paths (0.6 s mark) instead of behind you. | +1 mine per drop each. | The Nuclear Nappy is always dropped from above, on the densest cluster. |
| Soulmate Signal | The twin dives from above onto the far anchor point, then the beam forms. | Faster dive each. | The dive itself is a Static Burst where the twin lands. |
| Unwanted Contact | A bolt strikes the first target from above, then chains as normal. | +1 jump each. | Every jump is also struck from above. |
| Ewww, Gross | Tape drops from above onto the target, bundling it as usual. | +1 neighbour each. | Tape drops on 2 targets at once. |
| Blowing Bubbles | Bubbles fall from above onto small enemies (tracking them). | +1 bubble each. | Falling bubbles that miss bounce once towards the nearest small enemy. |
| One of These Days | The mark falls from above on the toughest enemy (0.4 s reticle). | +5% repeat each. | The payout comes as a strike from above on everything within 80. |
| Sister Cousin | Siblings dive from above at their targets (homing). | +1 sibling each. | Split siblings also dive from above. |
| Peekaboo | You vanish upward; the BOO comes down on the densest cluster where enemies gather (0.6 s mark). | +20 radius each. | You land with it, appearing at the BOO's centre unharmed. |
| Eggs | Eggs fall from above near greedy enemies. | +1 egg each. | The smite comes down from above on every enemy near the grabbed egg. |
| Chest Burster | Infecting shots fall from above on their targets (0.4 s reticle). | +1 s infection each. | Undead rise by dropping from above onto enemies. |
| Enzyme Headbutt | A falling headbutt: you drop onto the nearest enemy within 160 (Contact rules still apply). | +20 range each. | The 4th-hit lunge becomes a dive that splashes acid round the landing. |
| Enzyme Sneeze | Acid drizzle over a marked zone (radius 60). | +15 radius each. | The drizzle follows the densest cluster. |
| Spark of Life | A Fire bolt strikes a Corroded target from above (0.4 s reticle). | +15% each. | Every Corroded enemy within 120 of the bolt is struck too. |

### 3.16 Sticky
*Adds sticky globs that heavily slow enemies or Snare them. Snared everywhere: on Fire weapons it puts the Fire out, a deliberate trade-off (more control, less burn). N/A where the weapon already sticks enemies in place.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets leave a glob that slows the target 40% for 2 s. | +10% slow each; Lv 3 Snares. | Globbed enemies stick to the first enemy they touch. |
| Maximum Gains | Each pellet hit adds a stacking 10% slow (up to 50%). | +10% cap each. | A full fan on one enemy Snares it. |
| Nervous Wreck | Snaps glue the target in place for 1 s. | +0.5 s each. | Glued enemies count as a wall: other enemies can't pass them. |
| Panic Button | Enemies thrown by the pulse land stuck (Snared 1 s). | +0.5 s each. | Stuck enemies are pulled back to the centre for the next pulse. |
| Acid Spit | Globs leave sticky residue: 40% slow. | +10% each; Lv 3 Snares. | Snared enemies can't shed Corrosion: their bar doesn't fall while they are stuck. |
| Red Flagship | Beam contact leaves a sticky film: 30% slow while on the beam. | +10% each. | Enemies held on the beam for 1 s are Snared. |
| Nocturnal Emission | N/A: already Snares. | | |
| Little Prick | Needles pin the target for 0.5 s. | +0.3 s each. | Pinned Bleeding enemies take Bleed ticks twice as fast. |
| Rent Free | Possessed enemies move 40% slower. | +10% each. | When possession ends, the enemy is Snared for 1 s. |
| Hot Mess | The patch also Snares, which puts its own Fire out on that enemy: control instead of burn. | +0.5 s Snare each. | Snared enemies in the patch reignite when the Snare ends. |
| Family Ties | Enemies pulled in are slowed 30% on their way out. | +10% each. | Enemies in the centre are Snared. |
| Skill Issue | Flying enemies land stuck (Snared 1 s). | +0.5 s each. | Stuck enemies stick to the mate they hit. |
| There Is No Spoon | Returned bullets carry a glob that slows 40%. | +10% each. | Returned bullets Snare. |
| Nappy Mines | Mines leave a sticky patch beside the fire; enemies in it are Snared, which puts their Fire out. | +20% patch size each. | The sticky patch is laid around the fire, holding enemies at its edge. |
| Soulmate Signal | Enemies dragged by the beam are slowed 30%. | +10% each. | Enemies that leave the beam stay stuck where they left it. |
| Unwanted Contact | Charged enemies are slowed 30%. | +10% each. | Chained enemies are Snared, setting up Snot Socket with your Static. |
| Ewww, Gross | N/A: taped enemies are already stuck together. | | |
| Blowing Bubbles | Bubbles linger 2 s longer, and freed enemies are slowed 40%. | +1 s and +10% each. | Pops Snare everything in the pop. |
| One of These Days | Marked enemies are slowed 30%. | +10% each. | The payout Snares the target. |
| Sister Cousin | Sibling hits slow 20% (stacking to 60%). | +10% cap each. | Split siblings Snare their targets. |
| Peekaboo | Feared enemies are slowed 40% as they flee. | +10% each. | Searching enemies are stuck at your last spot. |
| Eggs | Eggs stick to the enemy that grabs one (slowed 50%). | +10% each. | Grabbers are Snared until the smite. |
| Chest Burster | Infected enemies are slowed 30%. | +10% each. | Undead allies Snare what they attack. |
| Enzyme Headbutt | Headbutts leave the target stuck (Snared 0.5 s). | +0.3 s each. | The lunge carries stuck enemies with you. |
| Enzyme Sneeze | Droplets leave sticky residue: 40% slow. | +10% each; Lv 3 Snares. | The whole sneeze cone Snares. |
| Spark of Life | Beamed enemies are Snared, which puts its own Fire out: the beam holds enemies instead of burning them. | +0.5 s Snare each. | Snared Corroded enemies burst into Premature Evaporation when the Snare ends. |

### 3.17 Switched at Birth
*Changes the weapon's damage type to one fixed alternate: its starter sample's other type. **Switching must never spoil the attack.** Where the mechanic is the damage type, the cell is N/A. The new type brings its own status and unstable reactions; the attack's shape and mechanic stay the same.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Force → **Blood**: the pellet makes targets Bleed. | +1 Bleed stack each. | Dual-type: Force and Blood together (Blood Pressure reactions on heavy hits). |
| Maximum Gains | Force → **Static**: each pellet adds Charge. | +15% Charge each. | Dual-type Force and Static: Shocking Impact on every pellet. |
| Nervous Wreck | Force → **Mucus**: snaps add Snare. | +15% Snare each. | Dual-type Force and Mucus: snapped Snared enemies are launched (Snot Rocket). |
| Panic Button | Force → **Blood**: the pulse makes everything Bleed. | +1 Bleed stack each. | Dual-type Force and Blood. |
| Acid Spit | Acid → **Alien**: globs build Possessed instead of Corrosion. | +15% each. | Dual-type Acid and Alien. |
| Red Flagship | Static → **Force**: a plain Force beam with no Charge, but +20% damage. | +10% each. | Dual-type Static and Force (Shocking Impact along the beam). |
| Nocturnal Emission | N/A: the puddle's Snare is the attack. | | |
| Little Prick | N/A: Force has no status, so it would lose Bleed and become a thinner Standard Issue. | | |
| Rent Free | N/A: possession is the Alien status. | | |
| Hot Mess | Fire → **Acid**: an Acid Pool (matrix 11.6) that Corrodes. Gives Ordered Online an Acid weapon (open issue 6). | +15% each. | Dual-type Fire and Acid. |
| Family Ties | N/A: it was moved to Force because gravity is displacement. | | |
| Skill Issue | Force → **Static**: collisions add Charge. | +15% each. | Dual-type Force and Static. |
| There Is No Spoon | N/A: its point is that returned bullets keep their own type. | | |
| Nappy Mines | Fire → **Acid** (its original type): blasts Corrode and leave an Acid Pool instead of a burning patch. | +15% each. | Dual-type Fire and Acid. |
| Soulmate Signal | N/A: its arcs are the Static mechanic. | | |
| Unwanted Contact | N/A: Charging enemies is the whole weapon. | | |
| Ewww, Gross | Mucus → **Acid**: the stamp Corrodes; tape and sharing are unchanged. | +15% each. | Dual-type Mucus and Acid. |
| Blowing Bubbles | Mucus → **Acid**: pops Corrode; trapping is unchanged. | +15% each. | Dual-type Mucus and Acid. |
| One of These Days | Blood → **Mucus**: the needle Snares; the countdown is unchanged. | +15% each. | Dual-type Blood and Mucus. |
| Sister Cousin | Blood → **Fire**: siblings set targets alight; homing and splitting are unchanged. | +15% each. | Dual-type Blood and Fire. |
| Peekaboo | N/A: the BOO's Fear reads as Alien. | | |
| Eggs | Alien → **Blood**: the smite makes enemies Bleed; the lure is unchanged. | +1 Bleed stack each. | Dual-type Alien and Blood. |
| Chest Burster | N/A: rising as an ally is the Alien mechanic. | | |
| Enzyme Headbutt | N/A: as Fire it would undo Sample 9's strip-then-burn loop. | | |
| Enzyme Sneeze | N/A: as Fire it would undo Sample 9's strip-then-burn loop. | | |
| Spark of Life | N/A: burning stripped enemies is the attack. | | |

### 3.18 Primer
*Hits leave a primer mark (lasts 4 s, one per enemy). Any of your **other** weapons hitting a primed enemy sets it off: a small burst (radius 40) for 50% of the primer weapon's base damage, and the mark is used up. Builds two-weapon combos. N/A where this is already the weapon's signature.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets prime their target. | +15% detonation damage each. | Detonations knock enemies back into their mates. |
| Maximum Gains | Every pellet primes. | +15% each. | An enemy primed by 3 pellets detonates three times as hard. |
| Nervous Wreck | Snaps prime. | +15% each. | Primed enemies that touch you detonate on their own. |
| Panic Button | Everything in the pulse is primed. | +15% each. | Detonations throw enemies outward like a small pulse. |
| Acid Spit | Globs prime; detonations add Corrosion. | +15% each. | A detonation on a Corroded enemy strips a Shell layer. |
| Red Flagship | Enemies on the beam for 0.5 s are primed; detonations Charge. | +15% each. | Detonations arc to one neighbour. |
| Nocturnal Emission | Enemies in the puddle are primed; detonations Snare. | +15% each. | Detonations spread the puddle to where the enemy stands. |
| Little Prick | Needles prime; detonations add Bleed. | +15% each. | A detonation ticks all of the target's Bleed stacks at once. |
| Rent Free | Possessed enemies are primed. | +15% each. | Detonating a possessed enemy possesses its neighbours for 1 s. |
| Hot Mess | Enemies in the patch are primed; detonations add Burn. | +15% each. | Detonations leave a small burning patch. |
| Family Ties | Enemies inside the well are primed. | +15% each. | A primed enemy detonating inside the well grows the well. |
| Skill Issue | Flying enemies are primed. | +15% each. | Detonations on landing send the enemy flying again. |
| There Is No Spoon | Returned bullets prime; detonations are in the bullet's damage type. | +15% each. | Detonations set off the unstable reaction between the bullet's type and the detonating weapon's. |
| Nappy Mines | Blasts prime everything they hit. | +15% each. | Primed enemies that step on a mine detonate it from twice as far. |
| Soulmate Signal | Enemies the beam touches are primed. | +15% each. | Detonations on the beam send an arc to the twin. |
| Unwanted Contact | N/A: priming your other weapons (Charged enemies arc) is already its signature. | | |
| Ewww, Gross | Taped enemies are all primed. | +15% each. | Detonating one taped enemy detonates the whole bundle (echo damage). |
| Blowing Bubbles | Trapped and freed enemies are primed. | +15% each. | A primed bubble's pop detonates every primed enemy in it. |
| One of These Days | The marked target is primed throughout the countdown and re-primed after each detonation. | +15% each. | Each detonation adds 10% to the stored payout. |
| Sister Cousin | Sibling hits prime. | +15% each. | A detonation kill counts for splitting. |
| Peekaboo | Feared enemies are primed. | +15% each. | Detonating a Feared enemy Fears its neighbours. |
| Eggs | Enemies lured to an egg are primed. | +15% each. | Detonations near an egg set the egg off early. |
| Chest Burster | Infected enemies are primed. | +15% each. | Undead allies' hits also detonate primers. |
| Enzyme Headbutt | Headbutts prime; detonations add Corrosion. | +15% each. | A detonation counts as a hit towards the 4th-hit lunge. |
| Enzyme Sneeze | Droplets prime. | +15% each. | Detonations splash one acid droplet onto a neighbour. |
| Spark of Life | Burning enemies are primed. | +15% each. | Detonating a primed Corroded enemy sets off Premature Evaporation. |

### 3.19 Catalyst
*Status bars fill faster from this weapon, and the unstable reactions it sets off hit harder. Lv 1: bars fill +25%, its reactions +20%. Each level adds +10% to both. Force has no status, so Force weapons boost the reactions they set off (the Force rows in matrix section 1) instead of a bar.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Force reactions it sets off (Corrosive Splash, Snot Rocket, Blood Pressure and so on) hit +30%. | +10% each. | Every pellet counts as a heavy hit for reaction triggers. |
| Maximum Gains | Its Force reactions +30%. | +10% each. | Each pellet can set off a reaction separately (still one per enemy per fan). |
| Nervous Wreck | Its Force reactions +30%. | +10% each. | Snaps on an enemy with any status always count as heavy. |
| Panic Button | Its Force reactions +30%. | +10% each. | Reactions it sets off also throw enemies outward. |
| Acid Spit | Corrosion fills +25%; its reactions +20%. | +10% each. | Corroded enemies hit by your other weapons gain Corrosion too. |
| Red Flagship | Charge fills +25%; its reactions +20%. | +10% each. | Charged enemies on the beam pass Charge to their neighbours. |
| Nocturnal Emission | Snare fills +25%; its reactions +20%. | +10% each. | Snared enemies keep their Snare bar full for 1 s after leaving the puddle. |
| Little Prick | Bleed builds +25%; its reactions +20%. | +10% each. | Bleeding enemies hit by any of your weapons take +1 stack. |
| Rent Free | Possessed builds +25%; its reactions +20%. | +10% each. | A full Possessed bar lasts twice as long. |
| Hot Mess | Burn fills +25%; its reactions +20%. | +10% each. | Burning enemies spread Burn to enemies they touch. |
| Family Ties | Its Force reactions +30%. | +10% each. | Reactions on enemies inside the well pull the well's radius +10% each time. |
| Skill Issue | Its Force reactions +30%; collisions count as Force hits for reactions. | +10% each. | Collisions set off the reaction between the two enemies' statuses. |
| There Is No Spoon | Returned bullets fill bars +25%; their reactions +20%. | +10% each. | Returned bullets set off reactions with the shooter's own damage type. |
| Nappy Mines | Burn fills +25%; its reactions +20%. | +10% each. | Burning patches from blasts count as Fire hits for reactions. |
| Soulmate Signal | Charge fills +25%; its reactions +20%. | +10% each. | Arcs from the beam set off Static reactions. |
| Unwanted Contact | Charge fills +25%; its reactions +20%. | +10% each. | Each chain jump can set off a reaction. |
| Ewww, Gross | Snare fills +25%; its reactions +20%. | +10% each. | Reactions on one taped enemy happen on the whole bundle (echo damage, matrix 12.1, so only the first is a real reaction). |
| Blowing Bubbles | Snare fills +25%; its reactions +20%. | +10% each. | Pops set off reactions on everything they hit. |
| One of These Days | Bleed builds +25%; its reactions +20%. | +10% each. | Reactions on the marked target add 20% of their damage to the payout. |
| Sister Cousin | Bleed builds +25%; its reactions +20%. | +10% each. | Split siblings carry the reaction their parent set off. |
| Peekaboo | Possessed builds +25% from the BOO; its reactions +20%. | +10% each. | Feared enemies take +30% from every reaction. |
| Eggs | Possessed builds +25% from the smite; its reactions +20%. | +10% each. | The smite sets off every reaction its target is ready for. |
| Chest Burster | Possessed builds +25%; its reactions +20%. | +10% each. | Undead allies' hits fill bars and set off reactions. |
| Enzyme Headbutt | Corrosion fills +25% (on top of ×2); its reactions +20%. | +10% each. | The lunge sets off every reaction the target is ready for. |
| Enzyme Sneeze | Corrosion fills +25%; its reactions +20%. | +10% each. | Each droplet can set off a reaction separately. |
| Spark of Life | Burn fills +25%; Premature Evaporation +20%. | +10% each. | Premature Evaporation no longer resets the Corrosion bar to zero, only to half. |

### 3.20 Kinship
*Rewards committing to a damage type. Lv 1: +8% damage and +8% status fill for each **other** weapon you carry with the same damage type. Each level adds +4% per kin. The mastery is the weapon's own payoff for a full family (3 or more same-type weapons).*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | +8% per other Force weapon. | +4% each. | With 3 Force weapons, pellets ignore Squishy's knockback reduction. |
| Maximum Gains | +8% per other Force weapon. | +4% each. | With 3 Force weapons, the fan gains 2 pellets. |
| Nervous Wreck | +8% per other Force weapon. | +4% each. | With 3 Force weapons, snaps hit everything in contact range. |
| Panic Button | +8% per other Force weapon. | +4% each. | With 3 Force weapons, the pulse goes off twice. |
| Acid Spit | +8% per other Acid weapon. | +4% each. | With 3 Acid weapons, Corroded enemies take +20% from all your weapons. |
| Red Flagship | +8% per other Static weapon. | +4% each. | With 3 Static weapons, the beam arcs to one Charged enemy off its line. |
| Nocturnal Emission | +8% per other Mucus weapon. | +4% each. | With 3 Mucus weapons, puddles merge with any Mucus effect they touch. |
| Little Prick | +8% per other Blood weapon. | +4% each. | With 3 Blood weapons, Bleed stacks have no cap. |
| Rent Free | +8% per other Alien weapon. | +4% each. | With 3 Alien weapons, possessed enemies attack the toughest enemy nearby. |
| Hot Mess | +8% per other Fire weapon. | +4% each. | With 3 Fire weapons, patches never go out while an enemy is burning in them. |
| Family Ties | +8% per other Force weapon. | +4% each. | With 3 Force weapons, the well bends your shots twice as hard. |
| Skill Issue | +8% per other Force weapon. | +4% each. | With 3 Force weapons, the collision chain goes one step deeper. |
| There Is No Spoon | +8% per other Force weapon; returned bullets also count their own type's kin. | +4% each. | Returned bullets gain +8% per weapon you carry of their damage type. |
| Nappy Mines | +8% per other Fire weapon. | +4% each. | With 3 Fire weapons, every blast leaves a full-size burning patch. |
| Soulmate Signal | +8% per other Static weapon. | +4% each. | With 3 Static weapons, the beam arcs 5 jumps. |
| Unwanted Contact | +8% per other Static weapon. | +4% each. | With 3 Static weapons, chains have no falloff. |
| Ewww, Gross | +8% per other Mucus weapon. | +4% each. | With 3 Mucus weapons, the bundle shares 50%. |
| Blowing Bubbles | +8% per other Mucus weapon. | +4% each. | With 3 Mucus weapons, bubbles trap elites (never bosses). |
| One of These Days | +8% per other Blood weapon. | +4% each. | With 3 Blood weapons, the payout repeats 60%. |
| Sister Cousin | +8% per other Blood weapon. | +4% each. | With 3 Blood weapons, split siblings can split once more. |
| Peekaboo | +8% per other Alien weapon. | +4% each. | With 3 Alien weapons, Feared enemies are also possessed for 1 s. |
| Eggs | +8% per other Alien weapon. | +4% each. | With 3 Alien weapons, eggs lure elites. |
| Chest Burster | +8% per other Alien weapon. | +4% each. | With 3 Alien weapons, the undead cap rises to 6. |
| Enzyme Headbutt | +8% per other Acid weapon. | +4% each. | With 3 Acid weapons, every 3rd hit lunges. |
| Enzyme Sneeze | +8% per other Acid weapon. | +4% each. | With 3 Acid weapons, the sneeze fires 5 droplets. |
| Spark of Life | +8% per other Fire weapon (and +4% per Acid weapon: its kit partner). | +4% each. | With 3 Fire weapons, it burns Shelled enemies at full damage too. |

### 3.21 Every Nth
*Every Nth attack is empowered (N = 4 unless the cell says otherwise), with a visible count on the weapon icon. The empowered attack is one hit and may count as heavy if it qualifies (`MODIFIERS.md` 14). N/A where the weapon already has an every-Nth rhythm.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Every 4th pellet is double size and double damage. | Every 3rd at Lv 3; +20% each. | Every 4th pellet pierces the whole line. |
| Maximum Gains | Every 4th fan fires double pellets. | +20% each. | Every 4th fan is a full ring. |
| Nervous Wreck | Every 4th snap stuns for 0.5 s. | +0.2 s each. | Every 4th snap hits everything in contact range. |
| Panic Button | Every 4th pulse is double radius. | +20% each. | Every 4th pulse pulls first, then throws. |
| Acid Spit | Every 4th glob fills Corrosion ×3. | +20% each. | Every 4th glob strips a full Shell layer. |
| Red Flagship | Every 4th on-phase is a thick beam (+50%). | +20% each. | Every 4th on-phase Charges everything it touches at once. |
| Nocturnal Emission | Every 4th puddle is double size. | +20% each. | Every 4th puddle Snares instantly. |
| Little Prick | Every 4th needle adds 3 Bleed stacks. | +1 stack each. | Every 4th needle ticks all Bleed stacks at once. |
| Rent Free | Every 4th ghost possesses for 3 times as long. | +20% each. | Every 4th ghost possesses everything it passes. |
| Hot Mess | Every 4th patch flares on landing. | +20% each. | Every 4th patch is a ring round you. |
| Family Ties | Every 4th hole counts as 2 for merging. | Every 3rd at Lv 3. | Every 4th hole goes supernova on its own after 3 s. |
| Skill Issue | Every 4th dollop launches twice as far. | +20% each. | Every 4th dollop's chain goes one step deeper. |
| There Is No Spoon | Every 4th returned bullet hits double. | +20% each. | Every 4th return fires 3 bullets at once. |
| Nappy Mines | Every 4th mine is double blast. | +20% each. | Every 4th mine is a Nuclear Nappy (in place of every 6th at its own mastery). |
| Soulmate Signal | Every 4th re-anchor doubles beam width for 1 s. | +0.3 s each. | Every 4th re-anchor arcs 5 jumps. |
| Unwanted Contact | Every 4th shot has 2 more jumps. | +1 jump each. | Every 4th chain has no falloff. |
| Ewww, Gross | Every 4th stamp tapes 3 more neighbours. | +1 each. | Every 4th bundle shares 70%. |
| Blowing Bubbles | Every 4th bubble traps any non-elite. | +20% pop each. | Every 4th bubble traps elites (never bosses). |
| One of These Days | Every 4th mark stores 70%. | +5% each. | Every 4th mark pays out on every enemy within 100. |
| Sister Cousin | Every 4th shot fires 4 siblings. | +1 each. | Every 4th shot's siblings split on any hit, not just kills. |
| Peekaboo | Every 4th BOO is double radius. | +20% each. | Every 4th BOO stuns as well as Fears. |
| Eggs | Every 4th egg smites at full strength the moment it's grabbed. | +20% each. | Every 4th egg hatches a ghost ally after its smite. |
| Chest Burster | Every 4th shot infects everything within 50. | +15 radius each. | Every 4th undead rises as an elite version. |
| Enzyme Headbutt | N/A: already lunges every 4th hit. | | |
| Enzyme Sneeze | Every 4th sneeze fires 6 droplets. | +1 each. | Every 4th sneeze leaves an Acid Pool. |
| Spark of Life | Every 4th on-phase sets off Premature Evaporation on every Corroded enemy in the lane. | +20% each. | Every 4th on-phase lasts twice as long. |

### 3.22 Homing
*Shots turn towards their target (`MODIFIERS.md` 1: turn rate per weapon; if the target dies, the shot flies on; Evasion still applies). Projectile and Spread only; N/A elsewhere and where the weapon already homes.*

| Weapon | Lv 1 | Lv 2 and 3 | Lv 10 mastery |
|---|---|---|---|
| Standard Issue | Pellets curve towards their target (turn rate 3). | +1 turn rate each. | Pellets retarget when their target dies. |
| Maximum Gains | Each pellet curves towards the nearest enemy in the cone (turn rate 2). | +1 each. | Pellets spread themselves across different enemies. |
| Acid Spit | Globs curve towards their target (turn rate 3). | +1 each. | Globs prefer enemies that aren't yet Corroded. |
| Little Prick | Needles curve sharply (turn rate 5). | +1 each. | Needles retarget to the nearest Bleeding enemy when theirs dies. |
| Rent Free | The ghost glides towards its target (turn rate 3). | +1 each. | Ghosts pass through walls to reach their target. |
| Family Ties | The hole drifts towards the densest cluster as it travels (turn rate 1). | +0.5 each. | The hole follows the densest cluster for its whole life. |
| There Is No Spoon | Returned bullets home on the enemy that fired them (turn rate 4). | +1 each. | Bullets whose shooter is dead home on the nearest enemy of the same kind. |
| Unwanted Contact | The opening shot curves to its first target (turn rate 4); jumps already pick their own. | +1 each. | The shot retargets until it starts a chain. |
| Ewww, Gross | Stamps curve towards their target (turn rate 3). | +1 each. | Stamps seek the target with the most neighbours. |
| Blowing Bubbles | Bubbles drift towards small enemies (turn rate 2). | +1 each. | Bubbles chase small enemies until they trap one or expire. |
| One of These Days | The needle curves to the toughest target (turn rate 4). | +1 each. | The needle retargets if its target would die before the payout. |
| Sister Cousin | N/A: already homes. | | |
| Chest Burster | Infecting shots curve towards their target (turn rate 4). | +1 each. | Shots retarget to the nearest uninfected enemy. |
| Enzyme Sneeze | Droplets curve towards the nearest enemy (turn rate 2). | +1 each. | Droplets spread themselves across different enemies. |
| Every other weapon | N/A: Contact, Burst, Pool and Beam don't fly. | | |

## 4. Open questions for the user
1. **Turncoat elites:** elites and bosses never rise (default). Confirm.
2. **The four "weakened" Switched at Birth weapons** (Little Prick, There Is No Spoon, Peekaboo, Family Ties) are N/A by default. Reverse any?
3. **Suicide vest:** keep it as a joke trap, or make its mastery the only way it stops hurting you (as written)?
