# Weapon Modifier Matrix (matrix 2)

**Status: working draft, 22 Oct 2026. Docs only; nothing is built.** Every cell follows decisions the user made in design sessions on 22 Oct (section 1). The first matrix (40 modifiers, single-line cells) is in Notion: "Spawn Prawn: Weapon Modifier Matrix". This one replaces it for the 25 weapon modifiers below (Advanced Targeting became a sperm passive, section 6). Weapon facts come from `BASE_WEAPONS.md`; the shared modifier rules in `MODIFIERS.md` ("Shared rules") still apply to every cell.

Numbers are starting values for sims. All names here are internal; player-facing card text follows the copy process (`CLAUDE.md`, Copy).

## 1. Rules for this matrix

1. **Levels.** A modifier has **3 levels, then a mastery as its 4th**.
   - **5 slots per weapon, one per group** (user, 22 Oct): one Delivery, one Flight, one Crowd, one Tempo and one Chemistry modifier (groups: section 5.1). All 5 slots are open from the start (user, 22 Oct); balance comes from the draft and sims, not from locked slots.
   - **One mastery per build:** only one weapon modifier in the whole build can reach its mastery; the others stop at Lv 3.
   - **Extra Mastery** (a sperm passive) allows one more mastery, at the cost of one of the sperm's passive slots.
2. **Two kinds of modifier.**
   - **Scaling** (section 3): the same effect grows along a shared ramp. Each table gives what scales on each weapon and its mastery; Lv 1 to 3 follow the ramp in the section's heading.
   - **Shaping** (section 4): each level is a new, weapon-specific step. Each table gives Lv 1, Lv 2, Lv 3 and the mastery.
   - Every modifier also belongs to one of five **groups** by what it changes (section 5.1).
3. **The ramp.** Counts (bounces, pierces, jumps, extra targets) go **1, 3, 6, then 12 at mastery**. Amounts (damage, radius, slow, time) go ×1, ×2, ×3 of the Lv 1 value. A scaling mastery is the next step of the ramp plus a weapon-specific twist.
4. **Best on.** Each modifier names the attack types it suits best; the draft offers it more often on weapons of those types.
5. **More beams, less damage each.** Anything that multiplies a weapon's beams or shots (Extra Projectiles, splits) lowers the damage of each one, so the total rises less than the count.
6. **Natural fits are Not applicable.** If the weapon already does what the modifier does, the cell is N/A and the draft never offers it there.
7. **The attack type still decides defences** (`MODIFIERS.md` shared rule 1). Where a modifier changes the attack type (Melee, Ranged, Mines, Death from Above), the new type decides Thorns, Evasion and so on.
8. **Charged** is an automatic wind-up (the game autoruns): a visible build-up before each attack, then a stronger one.
9. **Mines** and **Death from Above** replace how the weapon fires. Death from Above's aim and telegraph suit the weapon (homing weapons track their target; area weapons mark a spot for 0.6 s; single-target strikes show a 0.4 s reticle).
10. **Range** and **Up Close** act on the falloff already in the build (`power11.js`: full damage to 220 units, down to 55% at 600) and apply to **Projectile and Spread only**. (In code, `power11.js` checks range on every direct hit, beams and bursts included; only pools, damage over time, reactions and allies are exempt.) **Range** also raises projectile speed and zooms the camera out one step per level (up to 3 steps per weapon; the player can still adjust zoom as normal).
11. **Sticky** applies Snared at its top levels. On Fire weapons this is a deliberate trade-off: Snared puts Fire out, so the weapon gains control and loses burn.
12. **Turncoat** works on kill only: enemies the weapon kills rise as temporary allies, each weapon its own kind. Own cap: **6 per weapon**, separate from the pets cap (12.3). Elites and bosses never rise (default).
13. **Connecting, Turncoat, Melee and Ranged** were designed weapon by weapon with the user.
14. **Advanced Targeting is a sperm passive, not a weapon modifier** (adopted 22 Oct): a targeting rule can't compete for one of a weapon's 3 slots against combat upgrades, so it sets targeting for every weapon at once (section 6).
15. **Switched at Birth** gives each weapon one fixed alternate damage type, its starter sample's other type. **Switching must never spoil the attack**: where the mechanic is the damage type, the cell is N/A.
16. **Roster:** 27 weapons. The Runs is no longer a weapon (it becomes a sperm passive, `storm-directive/NOTES.md`). The **Laser** is new: Ordered Online's Fire beam (from the user's voice notes).

17. **One per group.** Because a weapon has one slot per group, modifiers in the same group never stack. That covers every clash: Melee, Ranged, Mines and Death from Above (which each replace firing) are all Delivery; Pulling and Knockback are both Crowd; Range and Up Close are both Tempo.
18. **Transformation test.** A Delivery modifier must change more than distance. Melee and Ranged change targeting, animation and hit detection; Mines add placement and a delayed trigger; Death from Above adds a different origin, a warning marker and impact timing. A cell that only changes reach fails and gets rewritten.
19. **Balance on damage per second.** Every scaling ramp that trades one thing for another is checked on damage per second (DPS), not damage per hit, so no modifier becomes the automatic pick. Starting checks (rate × damage per hit): Rapid Fire 1.05 / 1.26 / 1.43; Charged, on a 1.0 s weapon, 1.07 / 1.36 / 1.69 (wind-up included). Sims tune from there.
20. **Pair bonuses.** Two specific modifiers from **different groups** on the same weapon (or one modifier plus a named sperm passive) unlock an extra effect (section 5.3). Once you hold one half of a pair on a weapon, the draft offers the other half more often (+50% weight).

### Conflicts and follow-ups in other docs
1. **Beams do not pierce** (user, 22 Oct). `MODIFIERS.md` 2 says "Beams always pierce", and Spark of Life's spec (`BASE_WEAPONS.md` 27) says it pierces. Here, Piercing applies to Red Flagship, Spark of Life and the Laser. Soulmate Signal is N/A, since its beam hits everything between you and your twin by design.
2. **Suicide vest** (Melee × Nappy Mines) hurts the player, against `MODIFIERS.md` 10 ("never hurts you"). Deliberate: a joke pick the card warns against.
3. **Long lunge** (Ranged × Enzyme Headbutt) lunges up to 200, past the Lunge cap of 160 (`MODIFIERS.md` 20).
4. **Family Ties base change:** without Connecting, its holes drift together only very slightly; Connecting Lv 1 restores today's drift.
5. **The Runs removed:** `BASE_WEAPONS.md` roster, Redtail's starters (`SAMPLES.md`) and references need updating; Redtail now has two starters.
6. **Laser added:** it needs a `BASE_WEAPONS.md` entry and start stats. Ordered Online would have 4 starters (Hot Mess, Nappy Mines, Blowing Bubbles, Laser) where every other sample has 3, and its types are Mucus / Acid while the Laser is Fire (open issue 6 there).
7. **Ricochet** here bounces off enemies at the true reflection angle; `MODIFIERS.md` 4 has it bouncing off walls only. That row needs updating.

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
| Laser (new) | Fire Beam | Ordered Online: a red laser beam held on one target; Burn. |

## 3. Scaling modifiers
*The same effect grows each level. Each heading gives the ramp; each table gives what scales on that weapon and its mastery twist.*

### 3.1 Range
*Ramp: full damage to 300 / 400 / 520 (base 220), floor 65 / 75 / 85% (base 55%); projectile speed +20 / +40 / +60%; camera zoom +1 / +2 / +3 steps. Mastery: no falloff at all, plus the twist. Best on: Projectile, Spread. N/A on every other attack type.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Falloff, speed. | Hits beyond 400 deal +20%. |
| Maximum Gains | Falloff; the fan also tightens 10 / 20 / 30%. | The full fan lands intact at 500. |
| Acid Spit | Falloff, speed. | Globs that fly more than 400 burst on landing. |
| Little Prick | Falloff, speed. | Needles that fly more than 400 cause double Bleed. |
| Rent Free | Falloff; ghost speed. | Ghosts that travel more than 400 possess for twice as long. |
| Family Ties | How far the hole travels (+30 / 60 / 90%). | The hole keeps travelling until it merges or expires. |
| There Is No Spoon | Falloff and speed of returned bullets. | Returned bullets gain damage the further they fly (up to +50%). |
| Unwanted Contact | Falloff, speed, jump range (+20 / 40 / 60). | Jump range doubles. |
| Ewww, Gross | Falloff, speed, tape radius (+20 / 40 / 60). | Tape reaches neighbours up to 260 away. |
| Blowing Bubbles | Bubble travel and speed. | Bubbles never pop on their own: they drift until touched. |
| One of These Days | Falloff, speed. | Marks placed from more than 400 away store 55%. |
| Sister Cousin | Sibling search range and speed. | Split siblings can reach targets anywhere on screen. |
| Chest Burster | Falloff, speed. | Shots that fly more than 400 infect everything within 50 of the target. |
| Enzyme Sneeze | Droplet range (160 to 190 / 220 / 250) and falloff. | The sneeze becomes a long, narrow jet (range 400). |
| Every other weapon | N/A: Projectile and Spread only. | |

### 3.2 Up Close
*Ramp: +40 / +80 / +120% damage within 120; full damage ends at 180 / 160 / 140 and falls to 40 / 35 / 30% by 450. Mastery: the twist. Best on: Projectile, Spread. N/A elsewhere.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Close damage. | Point-blank hits (under 60) knock the target into its mates. |
| Maximum Gains | Close damage. | Point-blank fans stun the front row for 0.5 s. |
| Acid Spit | Close damage and Corrosion. | Point-blank globs strip a full Shell layer. |
| Little Prick | Close damage; +1 / 2 / 3 Bleed stacks up close. | Point-blank needles hit twice. |
| Rent Free | Close damage; possession +1 / 2 / 3 s up close. | Point-blank possession makes the host attack its nearest mate at once. |
| Family Ties | Pull strength within 120 of you. | Enemies can't leave a hole placed within 120 of you until it expires. |
| There Is No Spoon | Close damage of returned bullets. | Bullets returned within 60 hit at double damage. |
| Unwanted Contact | Close damage; close chains start with +1 / 2 / 3 jumps. | Every jump within 120 of you Charges twice. |
| Ewww, Gross | Close damage; close stamps tape +1 / 2 / 3 neighbours. | Point-blank stamps bundle every enemy within 80. |
| Blowing Bubbles | Close bubbles trap bigger enemies (max health 50 / 65 / 80). | Point-blank pops double in radius. |
| One of These Days | Close marks store 50 / 55 / 60%. | Point-blank marks count down in 2 s. |
| Sister Cousin | Close damage. | Siblings return to you after each hit, striking again on the way. |
| Chest Burster | Close damage; undead from close infections +30 / 60 / 90%. | Point-blank infection raises the undead on the next hit. |
| Enzyme Sneeze | Close damage and Corrosion. | At point blank the droplets merge into one heavy splash. |
| Every other weapon | N/A: Projectile and Spread only. | |

### 3.3 Rapid Fire
*Ramp: attack rate +40 / +80 / +120%; damage per hit -25 / -30 / -35%. Statuses build per hit, so rapid weapons fill bars well. Mastery: the twist. Best on: Projectile, Beam.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Rate. | Minigun: rate ramps up while it stays on one target (up to +100%). |
| Maximum Gains | Rate; 3 fewer pellets per fan. | Fans alternate left and right, covering a wider arc over time. |
| Nervous Wreck | Snap rate. | Snaps hit every enemy in contact range at once. |
| Panic Button | Pulse rate; radius -20%. | Pulses ripple outward one after another from the same point. |
| Acid Spit | Rate; smaller globs. | A continuous stream: a short acid jet. |
| Red Flagship | The beam becomes fast pulses. | Pulses fork to a second target. |
| Nocturnal Emission | Puddle rate; smaller puddles. | Puddles laid close together merge into one large puddle. |
| Little Prick | Rate. | Every 10th needle ticks all the target's Bleed stacks at once. |
| Rent Free | Rate; shorter possessions. | Ghosts hitting a possessed enemy extend its possession. |
| Hot Mess | Patch rate; smaller patches. | Patches laid in a line join into a burning strip. |
| Family Ties | Hole rate; smaller holes (3-well cap stays). | Small holes merge twice as easily. |
| Skill Issue | Lob rate; smaller dollops. | A dollop landing on a flying enemy sends it flying again. |
| There Is No Spoon | Return rate. | Returned bullets fire in pairs. |
| Nappy Mines | Mine rate; smaller mines. | Mines dropped within 40 of each other fuse into a bigger mine. |
| Soulmate Signal | The beam pulses instead of holding. | Each pulse arcs once to a Charged enemy off the beam. |
| Unwanted Contact | Rate. | Chains that cross each other both gain a jump. |
| Ewww, Gross | Rate; tape lasts 3 s instead of 5. | Stamps on a taped enemy extend its tape. |
| Blowing Bubbles | A stream of smaller bubbles. | Small bubbles merge into one that traps larger enemies. |
| One of These Days | Rate; countdowns 3 s at 30%. | Extra marks on the same target stack its stored share (cap 80%). |
| Sister Cousin | More, weaker siblings. | Siblings hitting one target in quick succession each add +10%. |
| Peekaboo | Shorter vanishes, smaller BOOs. | Every 3rd BOO is full strength. |
| Eggs | Egg rate; smaller eggs. | Eggs nobody grabs hatch into a small smite when they expire. |
| Chest Burster | Rate. | Infection stacks: 3 hits raise a stronger undead. |
| Enzyme Headbutt | Headbutt rate. | The lunge comes every 3rd hit instead of every 4th. |
| Enzyme Sneeze | Sneeze rate; smaller droplets. | A sneezing fit: every 4th sneeze is 3 in a row. |
| Spark of Life | The beam pulses instead of holding. | Each pulse on a Corroded target adds Burn to its neighbours. |
| Laser | The beam becomes fast pulses. | Pulses alternate between your top 2 targets. |

### 3.4 Charged
*An automatic wind-up before each attack, then a stronger attack. Ramp: the wind-up shortens 0.5 / 0.4 / 0.3 s (cells that name a longer wind-up shorten by the same steps), and what scales grows +60 / +90 / +120%. Mastery: the twist. Best on: Projectile, Beam, Burst. N/A where waiting longer is already the payoff.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Pellet damage; +30% knockback. | A full charge pierces the whole line. |
| Maximum Gains | Pellet damage; the fan tightens to 20°. | A charged point-blank fan stuns the front row for 1 s. |
| Nervous Wreck | Snap damage (0.4 s wind-up); stun 0.5 / 0.7 / 0.9 s. | A charged snap stuns everything in contact range. |
| Panic Button | Pulse radius and damage (0.6 s). | Thrown enemies collide (40%). |
| Acid Spit | Glob size and Corrosion. | A charged glob strips a full Shell layer. |
| Red Flagship | Beam damage and width for the next on-phase (0.6 s). | A charged beam Charges everything it touches at once. |
| Nocturnal Emission | Puddle size (0.6 s). | Charged puddles Snare on contact. |
| Little Prick | Bleed stacks (+2 / 4 / 6). | A charged needle pierces and Bleeds a whole line. |
| Rent Free | Possession length. | A charged ghost possesses everything it passes. |
| Hot Mess | Patch heat and width (0.6 s). | Charged patches flare once a second. |
| Family Ties | Hole radius and pull (0.8 s). | A charged hole counts as 2 for merging. |
| Skill Issue | Launch distance. | The collision chain goes one step deeper (depth 3). |
| There Is No Spoon | Holds returns until the store is full, then fires them all as one volley; volley damage scales. | The volley fires as a ring round you. |
| Nappy Mines | Blast and patch size (0.4 s per mine). | Charged mines count double towards the Nuclear Nappy. |
| Soulmate Signal | Beam width for 1 s after each re-anchor. | Charged re-anchors arc 5 jumps instead of 3. |
| Unwanted Contact | Starting jumps (+1 / 3 / 6, the count ramp); falloff 80%. | A charged chain has no falloff. |
| Ewww, Gross | Neighbours taped (+1 / 3 / 6). | Charged tape shares 50% instead of 35%. |
| Blowing Bubbles | Trappable size (max health 50 / 65 / 80). | Charged bubbles can trap elites (never bosses). |
| One of These Days | Stored share (50 / 60 / 70%). | The payout also Bleeds everything within 80. |
| Sister Cousin | Siblings per shot (3 / 4 / 5). | Charged siblings split into 3 on a kill. |
| Peekaboo | BOO damage per 0.5 s hidden (+10 / 20 / 30%). | A full charge stuns as well as Fears. |
| Eggs | N/A: eggs already smite harder the longer they wait. | |
| Chest Burster | Infection length and undead strength (0.4 s). | A charged shot infects everything within 60 of its target. |
| Enzyme Headbutt | Turns the next headbutt into a lunge (0.4 s); lunge length scales. | Charged lunges Corrode everything they pass. |
| Enzyme Sneeze | Droplets (4 / 5 / 6). | A charged sneeze leaves a short Acid Pool. |
| Spark of Life | Burn damage and on-phase length (0.6 s). | Premature Evaporation on every Corroded enemy in its lane at once. |
| Laser | Beam damage and width (0.6 s). | The charged beam punches through the whole line (an exception to the no-pierce rule). |

### 3.5 Catalyst
*Status bars fill faster from this weapon, and the unstable reactions it sets off hit harder. Ramp: bars +25 / +50 / +75%; its reactions +20 / +40 / +60%. Force has no status, so Force weapons boost the reactions they set off by +30 / +60 / +90% instead. Mastery: the twist. Best on: any type with a status.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Force reactions it sets off. | Every pellet counts as a heavy hit for reaction triggers. |
| Maximum Gains | Force reactions. | Each pellet can set off a reaction separately (one per enemy per fan). |
| Nervous Wreck | Force reactions. | Snaps on an enemy with any status always count as heavy. |
| Panic Button | Force reactions. | Reactions it sets off also throw enemies outward. |
| Acid Spit | Corrosion; its reactions. | Corroded enemies hit by your other weapons gain Corrosion too. |
| Red Flagship | Charge; its reactions. | Charged enemies on the beam pass Charge to their neighbours. |
| Nocturnal Emission | Snare; its reactions. | Snare bars stay full 1 s after leaving the puddle. |
| Little Prick | Bleed; its reactions. | Bleeding enemies hit by any of your weapons take +1 stack. |
| Rent Free | Possessed; its reactions. | A full Possessed bar lasts twice as long. |
| Hot Mess | Burn; its reactions. | Burning enemies spread Burn to enemies they touch. |
| Family Ties | Force reactions. | Each reaction inside the well grows its radius 10%. |
| Skill Issue | Force reactions; collisions count as Force hits. | Collisions set off the reaction between the two enemies' statuses. |
| There Is No Spoon | Bars and reactions of returned bullets. | Returned bullets react with the shooter's own damage type. |
| Nappy Mines | Burn; its reactions. | Burning patches count as Fire hits for reactions. |
| Soulmate Signal | Charge; its reactions. | Arcs from the beam set off Static reactions. |
| Unwanted Contact | Charge; its reactions. | Each chain jump can set off a reaction. |
| Ewww, Gross | Snare; its reactions. | A reaction on one taped enemy repeats on the bundle as echo damage (12.1). |
| Blowing Bubbles | Snare; its reactions. | Pops set off reactions on everything they hit. |
| One of These Days | Bleed; its reactions. | Reactions on the marked target add 20% of their damage to the payout. |
| Sister Cousin | Bleed; its reactions. | Split siblings carry the reaction their parent set off. |
| Peekaboo | Possessed from the BOO; its reactions. | Feared enemies take +30% from every reaction. |
| Eggs | Possessed from the smite; its reactions. | The smite sets off every reaction its target is ready for. |
| Chest Burster | Possessed; its reactions. | Undead allies' hits fill bars and set off reactions. |
| Enzyme Headbutt | Corrosion (on top of ×2); its reactions. | The lunge sets off every reaction the target is ready for. |
| Enzyme Sneeze | Corrosion; its reactions. | Each droplet can set off a reaction separately. |
| Spark of Life | Burn; Premature Evaporation. | Premature Evaporation resets Corrosion to half, not zero. |
| Laser | Burn; its reactions. | Enemies held in the beam for 1 s count as burning for every reaction trigger. |

### 3.6 Kinship
*Rewards committing to a damage type. Ramp: +8 / +16 / +24% damage and status fill for each **other** weapon you carry with the same damage type. Mastery: the weapon's payoff for a full family (3 or more same-type weapons). Best on: any.*

| Weapon | Kin | Mastery twist (3 or more of the type) |
|---|---|---|
| Standard Issue | Force | Pellets ignore Squishy's knockback reduction. |
| Maximum Gains | Force | The fan gains 2 pellets. |
| Nervous Wreck | Force | Snaps hit everything in contact range. |
| Panic Button | Force | The pulse goes off twice. |
| Acid Spit | Acid | Corroded enemies take +20% from all your weapons. |
| Red Flagship | Static | The beam arcs to one Charged enemy off its line. |
| Nocturnal Emission | Mucus | Puddles merge with any Mucus effect they touch. |
| Little Prick | Blood | Bleed stacks have no cap. |
| Rent Free | Alien | Possessed enemies attack the toughest enemy nearby. |
| Hot Mess | Fire | Patches never go out while an enemy burns in them. |
| Family Ties | Force | The well bends your shots twice as hard. |
| Skill Issue | Force | The collision chain goes one step deeper. |
| There Is No Spoon | Force, and each returned bullet counts its own type's kin | Returned bullets gain +8% per weapon you carry of their type. |
| Nappy Mines | Fire | Every blast leaves a full-size burning patch. |
| Soulmate Signal | Static | The beam arcs 5 jumps. |
| Unwanted Contact | Static | Chains have no falloff. |
| Ewww, Gross | Mucus | The bundle shares 50%. |
| Blowing Bubbles | Mucus | Bubbles trap elites (never bosses). |
| One of These Days | Blood | The payout repeats 60%. |
| Sister Cousin | Blood | Split siblings can split once more. |
| Peekaboo | Alien | Feared enemies are also possessed for 1 s. |
| Eggs | Alien | Eggs lure elites. |
| Chest Burster | Alien | The undead cap rises to 6. |
| Enzyme Headbutt | Acid | Every 3rd hit lunges. |
| Enzyme Sneeze | Acid | The sneeze fires 5 droplets. |
| Spark of Life | Fire (Acid weapons count half: its kit partner) | It burns Shelled enemies at full damage. |
| Laser | Fire | The beam sets every enemy it touches alight at once. |

### 3.7 Knockback
*Ramp: push distance ×1 / ×2 / ×3 of the Lv 1 value. Mastery: the twist. Best on: Projectile, Burst, Contact. N/A where the weapon already knocks back.*

| Weapon | What scales (Lv 1 distance) | Mastery twist |
|---|---|---|
| Standard Issue | Pellet shove (30). | Shoved enemies that hit a mate or wall take 40% collision damage. |
| Maximum Gains | Point-blank fans (under 100) blast the front row back (50). | Point-blank fans launch enemies into their mates (40%). |
| Nervous Wreck | N/A: the snap already recoils. | |
| Panic Button | N/A: the pulse already throws enemies out. | |
| Acid Spit | Glob shove (25; Corroded targets 50). | Shoved Corroded enemies leave an acid streak. |
| Red Flagship | Push along the beam (40 a second). | Enemies pushed to the beam's end are flung off it. |
| Nocturnal Emission | Crossing enemies are squirted out of the rim (40). | Squirted enemies stay Snared where they land. |
| Little Prick | A small flinch that stacks on the same target (10). | Every 5th needle pins the target for 1 s. |
| Rent Free | The ghost pushes its target (30). | Possessed enemies are pushed into their mates. |
| Hot Mess | Enemies recoil out of the patch (40). | Enemies bounce around inside the patch instead of leaving. |
| Family Ties | The hole repels instead of pulling (its pull strength, reversed). | The supernova blasts everything 200 outward. |
| Skill Issue | N/A: already knockback-based. | |
| There Is No Spoon | Returned bullets shove (30). | The shove scales with how hard the bullet would have hit you. |
| Nappy Mines | Blasts throw enemies clear of the patch (60). | Thrown enemies set off any mine they land near. |
| Soulmate Signal | Dragging shoves enemies the way you swim (30). | Enemies shoved off the beam's end are flung away. |
| Unwanted Contact | Each jump shoves its target from the last (25). | Jumps launch enemies into each other (40%). |
| Ewww, Gross | The bundle is knocked back together (40). | The bundle crashes into enemies behind it. |
| Blowing Bubbles | Pops throw nearby enemies out (50). | The freed enemy flies out like a cannonball. |
| One of These Days | The payout launches the target (60). | The launched target hits its mates for 40% of the payout. |
| Sister Cousin | Siblings shove targets towards the next sibling's target (20). | Killed enemies are flung into the nearest enemy. |
| Peekaboo | The BOO blows Feared enemies away (60). | Fleeing enemies trample their mates. |
| Eggs | The smite knocks the grabber and neighbours from the egg (50). | The grabber is flung towards the next egg. |
| Chest Burster | Undead allies shove what they attack (30). | Undead rise with a blast that throws enemies back. |
| Enzyme Headbutt | The lunge bulldozes the target forward (60). | Every headbutt knocks back; the lunge launches. |
| Enzyme Sneeze | The front row is blown back (40). | Sneezed enemies collide for 40%. |
| Spark of Life | Burning enemies are pushed down the lane (30). | Enemies pushed to the lane's end burst. |
| Laser | Held enemies are pushed along the beam (40 a second). | Pushed enemies drag a burning streak behind them. |

### 3.8 Pulling
*Pulls enemies towards the projectile, beam or weapon. Ramp: pull strength and radius ×1 / ×2 / ×3 of the Lv 1 value. Uses the Pull rule (`COMBAT_MATRIX.md` 12.2: Squishy halves it, elites 50%, bosses 25%, never through walls). Mastery: the twist. Best on: Beam, Burst, Pool. N/A where the weapon already pulls.*

| Weapon | What scales (Lv 1) | Mastery twist |
|---|---|---|
| Standard Issue | Pellets tug enemies within 50 of their flight path towards it. | Impact yanks everything within 100 onto the target. |
| Maximum Gains | Pellets tug enemies towards the fan's centre line. | Net: enemies in the cone are dragged to its centre before the pellets land. |
| Nervous Wreck | Each snap pulls the next enemy within 120 into contact range. | A constant pull on enemies near you: they come to you. |
| Panic Button | The pulse pulls inward for 0.3 s before it throws out. | Implosion: pull only, then double damage at the centre. |
| Acid Spit | Globs drag enemies within 40 into the splash. | An acid strand reels the target 80 towards you. |
| Red Flagship | Enemies within 40 of the beam are drawn onto it. | The beam reels everything on it towards you. |
| Nocturnal Emission | The puddle drags enemies within 80 of its rim towards the centre. | Puddles slowly drift towards the densest cluster. |
| Little Prick | Each needle tugs its target 30 towards you. | Bleeding enemies are drawn towards each other. |
| Rent Free | The ghost drags enemies it passes 40 along its path. | The possessed enemy walks into its mates, pulling them along. |
| Hot Mess | The patch draws in enemies within 60 of its edge. | Burning enemies that try to leave are pulled back. |
| Family Ties | N/A: already pulls. | |
| Skill Issue | The lard pulls enemies within 60 together before launching. | Enemies are pulled into a pile, then launched at once. |
| There Is No Spoon | Enemy bullets within 140 curve towards you to be eaten (store cap still 10). | Each returned bullet tugs its shooter 40 towards you. |
| Nappy Mines | Mines pull enemies within 70 in before they go off. | Mines pull nearby mines together, packing them for Domino. |
| Soulmate Signal | Enemies within 50 of the beam are pulled onto it. | The twin pulls enemies towards itself. |
| Unwanted Contact | Each jump tugs its target 30 towards the last. | The chain contracts: every chained enemy is pulled to the first. |
| Ewww, Gross | Taped bundles are pulled tight into a clump. | Bundles within 140 pull into each other and merge (cap 8). |
| Blowing Bubbles | Bubbles pull small enemies within 60 towards them. | Bubbles drift towards small enemies by themselves. |
| One of These Days | The marked target pulls enemies within 80 towards it before the payout. | The payout bursts on everything it pulled in. |
| Sister Cousin | A sibling's hit tugs its target towards the other sibling's target. | Kill sites pull targets in for the split siblings. |
| Peekaboo | Your last spot pulls searching enemies 40 tighter before the BOO. | Everything in the BOO radius is pulled to the centre first. |
| Eggs | Eggs lure greedy enemies from further away (+30 on 230). | Eggs lure every enemy, not just greedy ones (bosses still ignore them). |
| Chest Burster | Undead allies pull enemies within 60 towards them. | Infected enemies pull their neighbours in, spreading infection by touch. |
| Enzyme Headbutt | Each headbutt pulls the next nearest enemy within 120 into reach. | The lunge drags everything it passes along with you. |
| Enzyme Sneeze | Droplets tug the enemies they hit 30 towards you. | The sneeze ends in an inward gust that pulls the front row together. |
| Spark of Life | The beam pulls Corroded enemies within 60 onto its lane. | Corroded enemies are pulled in from anywhere in range. |
| Laser | Enemies within 40 of the beam are drawn onto it. | Enemies on the beam are drawn to its tip, bunching on the target. |

### 3.9 Sticky
*Adds sticky globs. Ramp: slow 30 / 50 / 70%, and from Lv 3 the 3rd hit on the same enemy Snares it for 1 s. Mastery: the twist. On Fire weapons, Snared puts their Fire out (rule 11). Best on: Projectile, Spread. N/A where the weapon already sticks enemies in place.*

| Weapon | What scales | Mastery twist |
|---|---|---|
| Standard Issue | Pellet slow. | Globbed enemies stick to the first enemy they touch. |
| Maximum Gains | Slow per pellet (stacks within the cap). | A full fan on one enemy Snares it. |
| Nervous Wreck | Snapped enemies are slowed. | Glued enemies count as a wall: other enemies can't pass them. |
| Panic Button | Thrown enemies land slowed. | Stuck enemies are pulled back to the centre for the next pulse. |
| Acid Spit | Glob slow. | Snared enemies can't shed Corrosion while stuck. |
| Red Flagship | Slow while on the beam. | Enemies held on the beam for 1 s are Snared. |
| Nocturnal Emission | N/A: already Snares. | |
| Little Prick | Needle slow (pins at Lv 3). | Pinned Bleeding enemies take Bleed ticks twice as fast. |
| Rent Free | Possessed enemies move slower. | When possession ends, the enemy is Snared for 1 s. |
| Hot Mess | The patch slows, then Snares, putting its own Fire out on that enemy: control instead of burn. | Snared enemies in the patch reignite when the Snare ends. |
| Family Ties | Enemies are slowed on their way out of the well. | Enemies at the centre are Snared. |
| Skill Issue | Flying enemies land slowed. | Stuck enemies stick to the mate they hit. |
| There Is No Spoon | Returned bullets slow. | Returned bullets Snare. |
| Nappy Mines | A sticky patch beside the fire slows, then Snares (putting Fire out). | The sticky patch rings the fire, holding enemies at its edge. |
| Soulmate Signal | Dragged enemies are slowed. | Enemies that leave the beam stay stuck where they left it. |
| Unwanted Contact | Charged enemies are slowed. | Chained enemies are Snared, setting up Snot Socket with your Static. |
| Ewww, Gross | N/A: taped enemies are already stuck together. | |
| Blowing Bubbles | Freed enemies are slowed; bubbles linger +1 / 2 / 3 s. | Pops Snare everything in the pop. |
| One of These Days | Marked enemies are slowed. | The payout Snares the target. |
| Sister Cousin | Sibling hits slow. | Split siblings Snare their targets. |
| Peekaboo | Feared enemies are slowed as they flee. | Searching enemies are stuck at your last spot. |
| Eggs | The grabber is slowed. | Grabbers are Snared until the smite. |
| Chest Burster | Infected enemies are slowed. | Undead allies Snare what they attack. |
| Enzyme Headbutt | Headbutted enemies are slowed. | The lunge carries stuck enemies with you. |
| Enzyme Sneeze | Droplet slow. | The whole sneeze cone Snares. |
| Spark of Life | Beamed enemies are slowed, then Snared, putting its own Fire out: the beam holds instead of burning. | Snared Corroded enemies burst into Premature Evaporation when the Snare ends. |
| Laser | Held enemies are slowed, then Snared, putting its Fire out. | The beam welds the target to the floor: Snared until the beam leaves it. |

### 3.10 Piercing
*Attacks carry on through enemies, losing 15% per enemy passed (`MODIFIERS.md` 2). Ramp (counts): through 1 / 3 / 6 enemies; mastery 12. Beams do not pierce by default in this matrix (conflict 1). Best on: Projectile, Beam. N/A on Pool and Burst, and where the weapon already pierces.*

| Weapon | What pierces | Mastery twist (12, plus) |
|---|---|---|
| Standard Issue | The pellet. | Railgun: unlimited pierce in a straight line, no damage lost. |
| Maximum Gains | Each pellet. | Pellets gain 10% per enemy passed instead of losing it. |
| Nervous Wreck | The snap reaches through to the enemies behind. | The recoil hits every enemy in the line, in order. |
| Panic Button | N/A: Burst. | |
| Acid Spit | Globs, Corroding each enemy passed. | Globs swell with each enemy passed, adding more Corrosion to the next. |
| Red Flagship | The beam. | Each enemy passed adds Charge to every enemy beyond it. |
| Nocturnal Emission | N/A: Pool. | |
| Little Prick | Needles; every enemy passed Bleeds. | Needles stitch every enemy they pass together (tether 2 s). |
| Rent Free | The ghost; it possesses the last enemy it reaches. | It possesses every enemy it passes for 1 s. |
| Hot Mess | N/A: Pool. | |
| Family Ties | N/A: already pierces everything. | |
| Skill Issue | N/A: Burst. | |
| There Is No Spoon | Returned bullets. | Each pierced enemy takes a hit in every damage type currently in your store. |
| Nappy Mines | N/A: Burst. | |
| Soulmate Signal | N/A: the beam already hits everything between you and the twin. | |
| Unwanted Contact | The opening shot; the chain starts from the last enemy hit. | Every enemy it pierces starts its own chain. |
| Ewww, Gross | The stamp; each bundle it passes is taped. | Every bundle the stamp passed through is taped to the others. |
| Blowing Bubbles | Bubbles pass enemies too big to trap until they find a small one. | A bubble can trap 2 small enemies together. |
| One of These Days | The needle, on its way to the toughest. | Every enemy it passes gets a 2 s mini-countdown (20%). |
| Sister Cousin | Siblings, before homing on the next. | A kill made while piercing counts for splitting. |
| Peekaboo | N/A: Burst. | |
| Eggs | N/A: Burst. | |
| Chest Burster | Shots, infecting each enemy passed. | Unlimited pierce in a straight line. |
| Enzyme Headbutt | The headbutt also hits the enemies directly behind. | The 4th-hit lunge carries on through every enemy in its path. |
| Enzyme Sneeze | Droplets. | Each pierced enemy keeps filling Corrosion for 1 s. |
| Spark of Life | The beam. | Unlimited pierce, damaging only Corroded or unshelled enemies on the way. |
| Laser | The beam. | Unlimited pierce: a beam through the whole screen. |

### 3.11 Exploding Rounds
*Hits explode, damaging enemies near the target. Ramp: radius 40 / 60 / 80 and 40 / 60 / 80% of the hit (unless the cell says otherwise). Mastery: the twist. Best on: Projectile, Beam. N/A on Burst weapons (they already explode).*

| Weapon | What explodes | Mastery twist |
|---|---|---|
| Standard Issue | The pellet, on impact. | Cluster round: the burst throws 3 mini-pellets that each burst once more. |
| Maximum Gains | The centre pellet; Lv 2 and 3 add 1 and 2 more bursting pellets. | Every pellet bursts; bursts overlapping on one enemy merge into one blast (radius 90). |
| Nervous Wreck | The snap, forward, never towards you. | The blast also throws you 60 back out of contact. |
| Panic Button | N/A: Burst. | |
| Acid Spit | The glob, in an acid spray that adds Corrosion. | Corroded targets burst twice as wide and leave a short Acid Pool. |
| Red Flagship | The beam's tip, every 0.5 s on target (0.4 / 0.3 s at Lv 2 / 3), Charging. | The burst runs back along the beam to you, Charging everything on the line. |
| Nocturnal Emission | The first enemy to enter sets off a mucus blast that Snares its neighbours; the puddle then shrinks. | The puddle reforms after its blast, once per puddle. |
| Little Prick | The needle, from inside the target after 0.5 s; neighbours Bleed. | The burst sprays 4 needles that make what they hit Bleed. |
| Rent Free | The ghost, as it leaves its host. | The burst possesses the weakest enemy it hits for 1 s. |
| Hot Mess | The patch, as it lands. | The patch flares again as it burns out. |
| Family Ties | The hole, when it expires: +10% per enemy held (cap +100%). | The burst flings held enemies outward into their mates (40%). |
| Skill Issue | N/A: Burst. | |
| There Is No Spoon | Returned bullets, in their own damage type. | Two different types bursting together set off their unstable reaction at once. |
| Nappy Mines | N/A: Burst. | |
| Soulmate Signal | The twin's anchor, once a second (0.8 / 0.6 s at Lv 2 / 3). | Both ends burst: you emit one too (it never hurts you). |
| Unwanted Contact | The last target in each chain, Charging what it hits. | Every jump bursts (bursts never start new chains). |
| Ewww, Gross | The stamp; enemies in the blast are taped too (still up to 3 neighbours). | When the tape expires, the bundle bursts as one. |
| Blowing Bubbles | Pops become full blasts (radius ×2); the trapped enemy is spared. | The freed enemy is launched by its own pop into its mates. |
| One of These Days | The payout: the target takes it all, everything near takes 50 / 60 / 70%. | The burst puts a fresh 2 s countdown on the toughest enemy it hits. |
| Sister Cousin | A sibling's kill, in blood, before it splits. | Split siblings also burst on their kills. |
| Peekaboo | N/A: Burst. | |
| Eggs | N/A: Burst. | |
| Chest Burster | Infected enemies as they die, infecting what they hit. | Undead allies burst when they expire, infecting again. |
| Enzyme Headbutt | The 4th-hit lunge, behind the target. | Every headbutt bursts; the lunge's burst is three times the size. |
| Enzyme Sneeze | Droplets that hit the same enemy merge into one burst. | Each droplet bursts on its own; misses burst on the floor. |
| Spark of Life | Corroded targets, on first contact, spreading Premature Evaporation. | Each Premature Evaporation it causes bursts again at half size (once). |
| Laser | The beam's tip, every 0.5 s on target (0.4 / 0.3 s at Lv 2 / 3). | Thermal shock: an enemy killed by the beam explodes for double. |

### 3.12 Homing
*Shots turn towards their target (`MODIFIERS.md` 1; if the target dies, the shot flies on; Evasion still applies). Beams bend towards their target (the user's laser note). Ramp: turn rate ×1 / ×2 / ×3; beams bend up to 10 / 20 / 30°. Mastery: the twist. Best on: Projectile, Spread, Beam. N/A on Contact, Pool and self-centred Burst, and where the weapon already homes.*

| Weapon | What homes | Mastery twist |
|---|---|---|
| Standard Issue | Pellets (turn rate 3). | Pellets retarget when their target dies. |
| Maximum Gains | Each pellet, to the nearest enemy in the cone (2). | Pellets spread themselves across different enemies. |
| Acid Spit | Globs (3). | Globs prefer enemies that aren't yet Corroded. |
| Red Flagship | The beam bends towards its target. | The beam bends round obstacles and other enemies to reach its target. |
| Little Prick | Needles (5). | Needles retarget to the nearest Bleeding enemy when theirs dies. |
| Rent Free | The ghost (3). | Ghosts pass through walls to reach their target. |
| Family Ties | The hole drifts towards the densest cluster as it travels (1). | The hole follows the densest cluster for its whole life. |
| There Is No Spoon | Returned bullets home on their shooter (4). | Bullets whose shooter is dead home on the nearest enemy of the same kind. |
| Soulmate Signal | The twin's anchor tracks the densest cluster. | The anchor jumps to the next cluster the moment the current one thins. |
| Unwanted Contact | The opening shot (4); jumps pick their own targets. | The shot retargets until it starts a chain. |
| Ewww, Gross | Stamps (3). | Stamps seek the target with the most neighbours. |
| Blowing Bubbles | Bubbles drift towards small enemies (2). | Bubbles chase small enemies until they trap one or expire. |
| One of These Days | The needle, to the toughest target (4). | The needle retargets if its target would die before the payout. |
| Sister Cousin | N/A: already homes. | |
| Chest Burster | Infecting shots (4). | Shots retarget to the nearest uninfected enemy. |
| Enzyme Sneeze | Droplets, to the nearest enemy (2). | Droplets spread themselves across different enemies. |
| Spark of Life | The beam bends towards Corroded enemies. | The beam bends to touch every Corroded enemy within 60 of its line. |
| Laser | The beam bends towards its target: slight at first, more each level. | The beam curves to sweep through every enemy between you and the target. |
| Every other weapon | N/A: Contact, Pool and self-centred Burst. | |

### 3.13 Ricochet
*Attacks bounce on to another enemy at the true reflection angle, like a beam off a mirror: the bounce isn't aimed, it goes wherever the angle points, and hits whatever is there. Each bounce loses 20%. Ramp (counts): 1 / 3 / 6 bounces; mastery 12. Best on: Beam (prism), Projectile. N/A on Pool and self-centred Burst.*

| Weapon | What bounces | Mastery twist (12, plus) |
|---|---|---|
| Standard Issue | The pellet, off each enemy it hits. | Bounces lose 10% instead of 20%. |
| Maximum Gains | Each pellet. | Pellets that bounce into each other merge into a bigger pellet. |
| Nervous Wreck | The snap's recoil: the snapped enemy bounces into the next. | Each bounce snaps the enemy it hits. |
| Panic Button | N/A: self-centred Burst. | |
| Acid Spit | The glob, adding Corrosion to each enemy. | Each bounce leaves a drop of acid on the floor (no pool). |
| Red Flagship | The beam, off each enemy, like a mirror. | Prism: every bounce splits into 2 weaker beams (bounded: 12 segments). |
| Nocturnal Emission | N/A: Pool. | |
| Little Prick | The needle, Bleeding each enemy. | Each bounce adds a Bleed stack to every enemy hit before it. |
| Rent Free | The ghost, possessing the last enemy it reaches. | Each bounce possesses for 0.5 s. |
| Hot Mess | N/A: Pool. | |
| Family Ties | The hole, off walls and big enemies, changing course. | Each bounce grows the hole 10%. |
| Skill Issue | Flying enemies bounce off each other (each bounce is a collision; chain depth still 2 per enemy). | Bounces don't count towards the depth limit. |
| There Is No Spoon | Returned bullets. | Each bounce changes the bullet's damage type to the next one in your store. |
| Nappy Mines | Thrown enemies bounce off walls before landing. | Each bounce drops a small burning spot. |
| Soulmate Signal | The beam bounces off the twin to one more point. | The beam zigzags between you and the twin through the crowd. |
| Unwanted Contact | Each arc bounces once more after its chain ends. | Bounced arcs start new chains (bounded: 12 hits in all). |
| Ewww, Gross | The stamp, taping each enemy it hits to the last. | Every enemy it bounced through ends up in one bundle. |
| Blowing Bubbles | Bubbles bounce off big enemies until they find a small one. | A bubble that bounces 6 times can trap any non-elite. |
| One of These Days | The mark bounces to a new target when the countdown ends. | Each bounce carries the payout with it, 70% each time. |
| Sister Cousin | Siblings bounce to a fresh target after each hit. | Split siblings bounce too. |
| Peekaboo | N/A: self-centred Burst. | |
| Eggs | Eggs bounce when dropped, landing deeper in the crowd. | Grabbed eggs bounce to the next greedy enemy and smite again. |
| Chest Burster | Infecting shots. | Every enemy it bounced through is infected. |
| Enzyme Headbutt | The lunge rebounds off the target into the next one. | Every headbutt rebounds. |
| Enzyme Sneeze | Droplets. | Droplets that bounce off a Corroded enemy split into 2. |
| Spark of Life | The beam, off Corroded enemies only. | Every bounce sets off Premature Evaporation. |
| Laser | The beam, like a laser off a mirror: weaker after each hit. | Prism: the beam fills the area with a lattice of reflections. |

### 3.14 Focused Intensity
*Damage on one enemy ramps up the longer the weapon stays on it uninterrupted: +10% per 0.5 s, up to +40 / +80 / +120%. Switching targets resets it. Mastery: the twist. Best on: Beam, Projectile. N/A on Pool and Burst.*

| Weapon | What ramps | Mastery twist |
|---|---|---|
| Standard Issue | Pellets on the same target. | At full ramp, pellets pierce their target. |
| Maximum Gains | Pellets on the same target (counts per fan). | At full ramp, the fan narrows onto the target automatically. |
| Nervous Wreck | Snaps on the same target. | At full ramp, the snap stuns for 1 s. |
| Panic Button | N/A: Burst. | |
| Acid Spit | Damage and Corrosion on the same target. | At full ramp, each glob strips a Shell layer. |
| Red Flagship | The beam on one target. | At full ramp, the beam arcs to every Charged enemy within 100. |
| Nocturnal Emission | N/A: Pool. | |
| Little Prick | Needles on the same target; Bleed stacks too. | At full ramp, every needle ticks all Bleed stacks. |
| Rent Free | Possession length on the same target. | At full ramp, the possession becomes permanent until the enemy dies (cap 1). |
| Hot Mess | N/A: Pool. | |
| Family Ties | Crush damage on enemies held in the centre. | At full ramp, the held enemy is spaghettified (instant kill on non-elites). |
| Skill Issue | N/A: Burst. | |
| There Is No Spoon | Returned bullets on the same shooter. | At full ramp, every bullet you eat from that shooter is returned twice. |
| Nappy Mines | N/A: Burst. | |
| Soulmate Signal | The beam on enemies it stays on. | At full ramp, enemies on the beam are Charged permanently. |
| Unwanted Contact | Chains starting on the same target. | At full ramp, the chain hits the first target again at the end. |
| Ewww, Gross | Hits on the same bundle. | At full ramp, the bundle shares 70%. |
| Blowing Bubbles | Bubbles on the same enemy trap it for longer. | At full ramp, the pop is three times the size. |
| One of These Days | Hits on the marked target add to the stored share. | At full ramp, the payout repeats 80%. |
| Sister Cousin | Siblings on the same target. | At full ramp, every sibling that hits splits. |
| Peekaboo | N/A: Burst. | |
| Eggs | N/A: Burst. | |
| Chest Burster | Infection strength on the same target. | At full ramp, the undead it raises is an elite version. |
| Enzyme Headbutt | Headbutts on the same target. | At full ramp, every headbutt is a lunge. |
| Enzyme Sneeze | Sneezes on the same target. | At full ramp, the sneeze strips a Shell layer. |
| Spark of Life | The beam on one Corroded target. | At full ramp, Premature Evaporation goes off every second on that target. |
| Laser | The beam on one target. | At full ramp, the beam turns white-hot: double damage and it ignores Shell. |

## 4. Shaping modifiers
*Each level is a new step, designed for the weapon. Columns: Lv 1, Lv 2, Lv 3, Mastery.*

### 4.1 Connecting
*Links enemies the weapon hits; each weapon's link was chosen with the user. Shared damage is echo damage (`COMBAT_MATRIX.md` 12.1: no bars, no reactions, never shares on). Every link is bounded (12.5). Best on: Projectile, Beam.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Staple: the pellet staples its target to its nearest neighbour for 3 s; the pellet's knockback drags both. | Staples last 5 s. | Staples to 2 neighbours. | Staples chain: a stapled enemy hit again staples on to the next, up to 4 in a line. |
| Maximum Gains | Clothesline: enemies hit by the same fan are tied in a line for 3 s and can't spread out. | Lines hold 1 more enemy and last 4 s. | Tied enemies are dragged 20 closer together each time a fan hits them. | Lines that cross knot together into one tight clump. |
| Nervous Wreck | Drag partner: the snapped enemy is tethered to the next nearest; its recoil drags the partner away too. | 2 partners. | Partners are dragged into each other at the end of the recoil (40% collision). | 3 partners, and every collision snaps the enemy it hits. |
| Panic Button | Snap-back: thrown enemies stay tethered to the centre and snap back together after 1 s. | They snap back after 0.6 s, ready for the next pulse. | Snapped-back enemies take +20% from the next pulse. | Snapped-back enemies collide at the centre (40% each). |
| Acid Spit | Drip tether: a strand of acid ties the target to one neighbour for 3 s; anything crossing it is Corroded. | 2 strands. | Strands drip, Corroding enemies that pass under them. | Strands sag into Acid Pools when they expire (counts towards the object cap). |
| Red Flagship | Beam relay: the beam carries on from its target to 1 linked enemy within 100. | Relays to 2 (70% each). | Relayed enemies are Charged. | Every relayed enemy relays to 1 more (bounded: 6 enemies in all). |
| Nocturnal Emission | Snot strings: enemies that leave the puddle stay tied to it for 3 s and are dragged back. | Strings last 5 s and drag harder. | Strings catch a second enemy that crosses them. | Strings Snare everything they touch on the way back. |
| Little Prick | Blood thread: the needle threads its target to a neighbour; Bleeding on one ticks on both. | 2 neighbours. | Threads pass new Bleed stacks along, not just the ticks. | A dying enemy passes all its Bleed stacks to its partners. |
| Rent Free | Hive mind: possessed enemies are linked and all move to the same point, bunching their mates. | Up to 3 linked. | They gather twice as fast. | When the possession ends, the bunch is Conjoined for 2 s (can't move apart). |
| Hot Mess | Shared Burn: enemies in the same patch are linked; Burn filling on one fills 50% on the others. | 70%. | Links last 2 s after leaving the patch. | When one linked enemy goes up in flames, its partners do too. |
| Family Ties | Merge magnet: holes drift towards each other (Lv 1 is today's drift; without this modifier they drift together only very slightly, conflict 4). | Faster drift. | Holes drift towards each other from twice as far. | Linked holes merge from any distance on screen. |
| Skill Issue | Bolas: an enemy sent flying is tethered to the mate it hits, and they fly on together into a third (depth 2). | Collisions +20%. | The pair stays tethered 2 s after landing. | Bolas wrap a third enemy, tying all three. |
| There Is No Spoon | Return to sender: each eaten bullet homes on the enemy that fired it. | The hit links that shooter to its nearest mate (shares 25%). | Shares 40%. | Every enemy that has shot at you this wave is linked: returns spread 25% to all of them. |
| Nappy Mines | Tripwires: each mine links to the nearest mine within 140; an enemy crossing a wire sets off both ends. | Wires reach 180. | A mine can hold 2 wires. | Wires form triangles; crossing any wire sets off all three mines. |
| Soulmate Signal | Third point: the beam bends through one linked enemy, making a triangle of you, it and the twin. | The bend point is the densest spot near the line. | A second bend point (a four-sided shape). | Bend points jump to whichever enemies make the beam cover the most of the crowd. |
| Unwanted Contact | Aftershocks: enemies the chain jumps through stay linked for 3 s. No solid beam: stuttering sparks crack between them at intervals, and any hit on one arcs to the others. | Sparks twice as often. | Links last 5 s. | Aftershocks Charge any enemy that wanders between two linked enemies. |
| Ewww, Gross | N/A: linking enemies is the whole weapon. | | | |
| Blowing Bubbles | Bubble string: bubbles are linked by a film; popping one pops every bubble on its string. | Strings of up to 3. | Each pop on the string is bigger than the last. | Strings of up to 5, and the last pop traps the nearest small enemy. |
| One of These Days | Joint account: the mark also links the nearest neighbour; damage to either counts towards the payout, and both pay out together. | 2 neighbours. | Linked neighbours' damage counts 100% (Lv 1 and 2: 50%). | The total is split evenly across every linked enemy (still echo damage). |
| Sister Cousin | Family feud: enemies hit by siblings from the same shot are linked; when one dies, the others take a burst of Bleed. | +1 Bleed stack in the burst. | The burst reaches enemies within 60 of each partner. | A feud death counts as a kill for splitting. |
| Peekaboo | Echo BOO: searching enemies are linked; each linked enemy that is Feared lets out a small BOO (radius 60, Fear only). | Radius 80. | Echo BOOs deal 30% of the BOO's damage. | Echo BOOs can Fear enemies that weren't searching (no further echoes). |
| Eggs | Clutch: eggs laid together are linked; grabbing one smites every enemy near any egg in the clutch. | Smite radius +20. | Clutches of 3 eggs. | A clutch hatches into one big smite over the whole area between its eggs. |
| Chest Burster | Contagion: an infected enemy links to 2 neighbours for 3 s; they catch the infection (it never spreads on from them). | 3 neighbours. | Contagion lasts 5 s. | Contagion spreads one more step. |
| Enzyme Headbutt | Skewer: the 4th-hit lunge staples the target to the enemy behind it; both are dragged and both take the lunge. | 2 enemies behind. | The skewer stays 2 s after the lunge. | Skewered enemies are Corroded to full. |
| Enzyme Sneeze | Snot web: droplets that land on different enemies string them together for 3 s; Corrosion on one fills 50% on the others. | 70%. | Webs catch enemies that touch the strands. | When one webbed enemy is Corroded, the whole web is. |
| Spark of Life | Fuse: linked Corroded enemies form a fuse; setting one off sets off Premature Evaporation on each in turn. | Fuses of up to 3. | Fuses of up to 5. | Fuses relight: an enemy that re-Corrodes within 3 s joins the fuse again. |
| Laser | Energy link (the user's cell): enemies the beam hits are linked by a red thread; linked enemies share 25% of damage (echo). | Up to 3 linked. | Burn on one fills 50% on the others. | The thread is itself a thin laser: enemies crossing it are burnt. |

### 4.2 Turncoat
*Enemies this weapon kills rise as temporary allies (5 s unless the cell says otherwise). Own cap: 6 per weapon, oldest goes first; elites and bosses never rise. Each weapon's ally was chosen with the user. Best on: Projectile, Burst.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Human shield: rises as a slow ally that follows you and soaks enemy shots for 5 s; it doesn't attack. | Lasts 7 s. | +50% toughness. | Up to 3 shields form a wall that also blocks enemies swimming at you. |
| Maximum Gains | Gym buddy: rises bulked up (+50% size and damage) and brawls up close for 4 s. | Lasts 6 s. | Its hits knock enemies back. | Each extra gym buddy adds +10% damage to the others. |
| Nervous Wreck | Bouncer: rises next to you and body-checks enemies that come into contact range, for 5 s. | Lasts 7 s. | Checks hit twice as hard. | Bouncers throw checked enemies into each other (40% collision). |
| Panic Button | Panic room: enemies killed by the pulse rise and run outward, crashing into enemies (Force collision). | Each runner crashes twice. | Runners are 50% faster. | Runners carry a small pulse that goes off on their last crash. |
| Acid Spit | Spitter: rises and spits acid at enemies for 5 s. | Lasts 7 s. | Spits fill Corrosion ×2. | Spitters aim at whatever you are hitting, stripping it for you. |
| Red Flagship | Relay: your beam passes through the ally and carries on from it, as a second emitter. | Relay range +40. | Relayed beams Charge. | Relay allies can relay to each other (bounded by the cap of 6). |
| Nocturnal Emission | Bogeyman: rises mucus-covered and wraps the nearest enemy, Snaring both for 3 s. | 4 s. | Wraps 2 enemies. | When it expires, it leaves a puddle where it stood. |
| Little Prick | Blood brother: attacks for 5 s; its hits make enemies Bleed. | Lasts 7 s. | +1 Bleed stack per hit. | Blood brothers' kills rise as blood brothers too (cap still 6). |
| Rent Free | Poltergeist: its ghost rises (no body) and passes through enemies, Fearing them, for 5 s; it can't be hit. | Lasts 7 s. | Fear lasts twice as long. | Poltergeists possess the first enemy they Fear for 2 s. |
| Hot Mess | Fire walker: rises burning and chases enemies for 4 s, setting them alight on contact. | Lasts 6 s. | +50% Burn on contact. | Fire walkers leave a burning patch where they collapse. |
| Family Ties | Satellite: enemies crushed in the hole rise and orbit it, slamming into enemies being pulled in. | Slams +30%. | Satellites outlast the hole by 2 s, orbiting where it was. | Satellites survive the supernova and are flung outward through the crowd. |
| Skill Issue | Bowling ball: rises greased and rolls through the crowd once, sending each enemy it hits flying. | Rolls twice as far. | Knocked enemies start collision chains. | Bowling balls bounce off walls and roll a second time. |
| There Is No Spoon | Bullet sponge: rises and stands in front of you, absorbing enemy bullets for 4 s. | Lasts 6 s. | Absorbs from a wider arc. | Bullets it absorbs go into your store (still capped at 10). |
| Nappy Mines | Suicide runner: rises carrying a mine and swims into the nearest group, where the mine goes off. | Blast +20%. | Blast radius +20. | Runners leave a burning patch twice the normal size. |
| Soulmate Signal | Third wheel: rises as a second anchor; the beam runs you, twin, ally for 5 s. | Lasts 7 s. | The third wheel moves to cover the densest part of the crowd. | Two third wheels make a four-point beam. |
| Unwanted Contact | Tesla zombie: rises crackling and shocks enemies near it every 1 s for 5 s, starting a 2-jump chain. | 3 jumps. | Shocks every 0.6 s. | Tesla zombies Charge everything they shock, so your other weapons arc off them. |
| Ewww, Gross | Sticky friend: rises still taped and hugs the nearest enemy; damage to the ally is shared to the enemy, never the other way. | Shares 50%. | Lasts 7 s. | It tapes itself to a whole bundle (up to 3). |
| Blowing Bubbles | Bubble boy: rises inside a bubble that rolls towards enemies and pops on the first one it meets. | Pop +30%. | It rolls through 2 enemies before popping. | The pop traps the next small enemy in a fresh bubble. |
| One of These Days | Debt collector: a marked enemy that dies early rises and sticks a fresh countdown on the toughest enemy nearby. | The new countdown repeats 50%. | The collector swims twice as fast. | It brings the old target's stored damage along, adding it to the new payout. |
| Sister Cousin | Adopted: rises as an adopted sibling and fights for 5 s; your siblings home on whatever it attacks. | Lasts 7 s. | Its hits Bleed. | Adopted siblings split like real ones when they kill (cap still 6). |
| Peekaboo | Decoy: enemies killed by the BOO rise looking like you; enemies search for them too. | Lasts 7 s. | Up to 3 decoys at once. | Decoys BOO with you, each in a small radius. |
| Eggs | Hatchling: a smitten enemy hatches as a small ghost ally that fights for 5 s. | Lasts 7 s. | Its hits Fear for 0.5 s. | Hatchlings lay one egg when they expire. |
| Chest Burster | N/A: raising killed enemies is already its signature. | | | |
| Enzyme Headbutt | Battering ram: rises and charges in the direction of your lunge, headbutting the first enemy it meets. | It headbutts 2 enemies. | Its headbutts Corrode ×2. | Rams lunge through their target, like yours. |
| Enzyme Sneeze | Contagious: rises and sneezes acid at enemies every 1.5 s for 5 s. | Every 1 s. | 5 droplets per sneeze. | Enemies it kills also rise contagious (cap still 6). |
| Spark of Life | Ember: rises as a burning husk and swims at the nearest Corroded enemy, bursting into Premature Evaporation on it. | Burst +30%. | It hunts Corroded enemies anywhere on screen. | An ember's burst can raise another ember. |
| Laser | Reprogrammed (from the user's laser note): rises scorched and fires a weak red laser of its own at enemies for 5 s. | Lasts 7 s. | Its laser targets whatever your Laser is on. | Reprogrammed allies link their lasers to yours, adding +15% each. |

### 4.3 Melee
*Turns the weapon into a close-range attack. It becomes Contact unless the cell says otherwise: Thorns answers each hit and Evasion can make it miss (matrix 13). Each version was chosen with the user. Best on: Projectile, Beam. N/A where the weapon is already Contact.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Head-on ram: the sperm rams forward 60 into the target, +50% damage. | Ram 80. | The ram knocks the target into its mates. | Rams carry through the first target into the next. |
| Maximum Gains | Flex: a 120° swipe in front (reach 80), then a short recoil backwards. | Reach 100. | 160° swipe. | Every 3rd flex is a full 360° swipe. |
| Nervous Wreck | N/A: already Contact. | | | |
| Panic Button | Panic slap: 3 quick slaps on the nearest enemy; the third throws it outward. | 4 slaps. | The throw sends it into its mates (40%). | The final slap sets off the old pulse round the target. |
| Acid Spit | Acid kiss: a wet bite on the nearest enemy within 70; Corrosion fills ×2. | ×3. | The bite leaves the target drooling acid on its neighbours for 2 s. | Kisses strip a Shell layer on every 3rd bite. |
| Red Flagship | Static aura: a ring round the sperm (radius 50) zaps anything inside every 0.2 s. | Radius 70. | The aura Charges what it zaps. | Charged enemies in the aura pass the zap to one neighbour. |
| Nocturnal Emission | Slime coat: enemies that touch you are Snared and take mucus damage. | Snare lasts 1 s longer. | The coat reaches 30 beyond you. | Snared enemies stick to you as a shield (up to 2). |
| Little Prick | Stab: a quick jab at the nearest enemy within 60, double Bleed stacks. | Reach 80. | Every stab adds +1 stack. | Every 4th stab ticks all the target's Bleed stacks at once. |
| Rent Free | Haunted touch: any enemy that touches you is possessed for 2 s. | 3 s. | Possessed enemies swim away, dragging their mates. | Your touch possesses every enemy within 60 at once (every 3 s). |
| Hot Mess | Hot to touch: enemies within 40 of you, or touching you, fill their Burn bar. | Radius 60. | Burn fills ×2. | You leave a short scorch where you swim (counts towards the object cap). |
| Family Ties | Event horizon: a small black hole sits on the sperm (radius 60); enemies near you are pulled in and crushed. | Radius 80. | Enemy shots passing near you bend away. | Your shots passing near you bend towards enemies. |
| Skill Issue | Lard slap: a greasy slap on the nearest enemy sends it flying into its mates. | Launch +30%. | The slapped enemy stays greased for 2 s: anything it touches is launched too. | Every slap starts a chain one step deeper (depth 3). |
| There Is No Spoon | Spoon whack: when stocked, it smacks the nearest enemy with all stored bullets at once (each keeps its type). | Reach 80. | The whack hits everything within 40 of the target too. | A whack with 3 or more damage types sets off their unstable reactions on the target. |
| Nappy Mines | Suicide vest: a blast goes off on the sperm every 2 s, leaving a burning patch; it **hurts you too** (conflict 2). Not advised, and the card says so. | Blast +30% (self-damage too). | Every 1.5 s. | The blast heals you instead if it hits 5 or more enemies. |
| Soulmate Signal | Orbit twin: the twin circles you at 70, sweeping the beam round you like a blade. | Orbit 30% faster. | Orbit radius 90. | Two twins orbit on opposite sides. |
| Unwanted Contact | Bad touch: any enemy that touches you is zapped and starts a 3-jump chain. | 4 jumps. | Zapped enemies are thrown off you. | Bad touch Charges every enemy within 80 of you once a second. |
| Ewww, Gross | Tape slap: slaps tape on the nearest enemy within 60, taping it to up to 4 neighbours. | 5 neighbours. | Tape lasts 7 s. | Taped bundles stick to you and are dragged along (up to 1). |
| Blowing Bubbles | Bubble butt: the sperm sits in a bubble; an enemy touching it pops it as a Burst; it reforms after 3 s. | Reforms after 2 s. | Pop +40%. | The pop traps the enemy that popped it, if it is small. |
| One of These Days | Tick tock: every enemy that touches you gets a 4 s countdown. | Repeats 50%. | Countdowns 3 s. | Touch countdowns pay out on everything within 60 of the target. |
| Sister Cousin | Clingy siblings: siblings stay within 80 and peck any enemy that comes close; kills still split. | 3 siblings. | Pecks Bleed. | Split siblings also stay close: a kill-heavy fight builds a swarm round you (cap 12). |
| Peekaboo | Behind you!: you vanish and reappear behind the nearest enemy, BOOing in radius 80 at double damage. | Radius 100. | Its Fear lasts twice as long. | You reappear behind the toughest enemy instead. |
| Eggs | Nest egg: eggs are carried on you; an enemy within 60 tries to grab one and is smitten. | 2 eggs carried. | Smite radius +30. | Grabbing an egg from you also Fears the grabber's neighbours. |
| Chest Burster | Facehugger: latches on to the nearest enemy within 60 and infects it instantly; its undead is +50% stronger. | Reach 80. | Undead +80%. | The facehugger jumps to a new host when its target dies. |
| Enzyme Headbutt | N/A: already Contact. | | | |
| Enzyme Sneeze | Face full: sneezes point-blank (range 60) in a 90° spray; double Corrosion per droplet. | 120° spray. | 5 droplets. | Every 3rd sneeze is a ring round you. |
| Spark of Life | Blowtorch: a short, thick flame (range 60) that burns +60% harder and prefers Corroded enemies. | Range 80. | +90%. | Premature Evaporation from the blowtorch is twice the size. |
| Laser | Laser sword (the user's cell: a close-range laser blade): a 90-long blade swung in a 150° arc in front. | Blade 110. | Full 360° swing every 3rd swing. | The blade cuts enemy shots out of the air. |

### 4.4 Ranged
*Turns a close-range weapon into a ranged one. Applies only to Nervous Wreck, Enzyme Headbutt, Peekaboo and Panic Button; N/A on the other 23. Each version was chosen with the user. Best on: Contact, self-centred Burst.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Nervous Wreck | Thrown clamp: snaps shut on an enemy up to 220 away and yanks it 60 towards you. Now a Projectile (Evasion applies; Thorns doesn't). | Range 260; yank 80. | The clamp snaps the yanked enemy again when it arrives. | The yanked enemy is slammed into the first enemy in its path (40%). |
| Enzyme Headbutt | Long lunge: every hit is a lunge from up to 200 away. Still Contact. Past the 160 lunge cap (conflict 3). | Lunges come 0.1 s sooner. | You're immune to contact damage during the lunge. | Each lunge headbutts every enemy it passes on the way in. |
| Peekaboo | Throw your voice: the BOO goes off at a decoy spot up to 260 away (the densest cluster); enemies search there, not where you were. | Range 300. | The decoy spot lingers 1 s after the BOO, drawing a second search. | Two decoy spots, each BOOing in turn. |
| Panic Button | Remote detonator: places a button on the floor that goes off when 3 enemies are near it. | 2 buttons. | It goes off when 2 enemies are near. | Buttons set each other off in a chain (bounded: 3). |
| Every other weapon | N/A: already ranged. | | | |

### 4.5 Mines
*Replaces how the weapon fires: it lays mines that trigger when enemies come near (trigger radius 60, life 14 s, 3 on the floor at Lv 1). The mine delivers the weapon's own attack. Mines count towards the object cap. Best on: Burst, Projectile. N/A where the weapon already lays traps.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Pellet mines lodge in the floor and fire a pellet at the first enemy to come near. | 5 on the floor. | Each mine fires twice before it's spent. | Mines fire 3 pellets at the 3 nearest enemies. |
| Maximum Gains | Fan mines fire a fan towards the enemy that tripped them. | 5 on the floor. | Fans +2 pellets. | Mines fire a full ring of pellets. |
| Nervous Wreck | Snap traps clamp the first enemy to step in (Contact rules apply to the trap). | 5 traps. | Clamped enemies are held for 1 s. | A trap that clamps resets once. |
| Panic Button | Pulse mines go off when an enemy comes near. | 5 mines. | Radius +20. | Pulse mines set each other off in a chain (up to 3). |
| Acid Spit | Acid mines spray a glob's worth of Corrosion over everything near. | 5 mines. | Corrosion ×2. | Acid mines leave an Acid Pool. |
| Red Flagship | Beam traps fire a short beam (120) across a gap when an enemy crosses it. | 5 traps. | Beam 160. | Two traps within 200 join with a standing beam between them. |
| Nocturnal Emission | Puddles stay hidden until an enemy steps in, then Snare instantly. | 5 hidden puddles. | A sprung puddle is 30% larger. | A sprung puddle springs every hidden puddle within 160. |
| Little Prick | Needle traps spring a needle at passing enemies. | 5 traps. | +1 Bleed stack. | Traps spring 3 needles. |
| Rent Free | Ghost mines possess the first enemy to pass. | 5 mines. | Possession +1 s. | The possessed enemy carries a new ghost mine with it. |
| Hot Mess | Patches stay hidden until an enemy steps in, then flare. | 5 hidden patches. | Flares +30%. | Sprung patches spread to twice their size. |
| Family Ties | A dormant hole opens when enemies come near. | 2 dormant holes (3-well cap stays). | Dormant holes open 30% larger. | Dormant holes open together and merge at once. |
| Skill Issue | Lard mines launch whoever steps on them. | 5 mines. | Launch +30%. | Launched enemies land on the next lard mine. |
| There Is No Spoon | Eaten bullets are planted as mines that fire back at the first enemy to come near. | Each planted bullet fires twice. | Planted bullets keep 100% damage (Lv 1 and 2: 70%). | Planted bullets fire at every enemy that comes near, until spent. |
| Nappy Mines | N/A: already mines. | | | |
| Soulmate Signal | The twin becomes a fixed anchor; the beam fires when enemies come between you and it. | Anchor range +60. | The beam stays on 1 s after the last enemy leaves. | A second fixed anchor; the beam runs between all three points. |
| Unwanted Contact | Charged mines start a chain when tripped. | 5 mines. | +1 jump. | Charged mines link to each other: a chain from one jumps through the others. |
| Ewww, Gross | Tape traps bundle whoever steps in with their neighbours. | 5 traps. | +1 neighbour. | A trap that bundles 4 enemies sets the next trap. |
| Blowing Bubbles | Bubbles hover in place as traps until a small enemy touches one. | 5 bubbles. | They last 20 s. | Hovering bubbles drift slowly towards small enemies. |
| One of These Days | Countdown mines mark whoever trips them. | 5 mines. | Repeats 50%. | The payout re-arms the mine. |
| Sister Cousin | Sibling nests release 2 siblings at enemies that come near. | 3 siblings. | 5 nests. | Nests release siblings again when one of theirs kills. |
| Peekaboo | You leave a decoy that BOOs when enemies arrive (you don't vanish). | 2 decoys. | Radius +40. | Enemies hunt the decoys instead of you. |
| Eggs | N/A: eggs already work as lures on the ground. | | | |
| Chest Burster | Infection traps infect whoever steps in. | 5 traps. | Infection +2 s. | Undead raised from trap victims plant a new trap where they rose. |
| Enzyme Headbutt | Leaves an acid trap where you headbutted; it bites the next enemy to step on it. | 5 traps. | Corrosion ×2. | Traps lunge at enemies passing within 80. |
| Enzyme Sneeze | Sneeze traps spray the next enemy to come near. | 5 traps. | +2 droplets. | Sneeze traps go off twice. |
| Spark of Life | Beam traps fire a short Fire beam across a gap when a Corroded enemy crosses it. | 5 traps. | Beam 160. | Traps fire at any enemy, burning Corroded ones +50%. |
| Laser | Laser tripwires (the user's cell): proximity beam traps fire a laser at enemies that approach. | 5 traps. | Traps hold their beam on the target for 1 s. | Traps aim at each other's targets, crossing beams on one enemy. |

### 4.6 Death from Above
*Replaces how the weapon fires: the attack lands from above, ignoring walls and line of sight (never into a sealed arena from outside it). Aim and telegraph suit the weapon: homing weapons track their target; area weapons mark a spot for 0.6 s; single-target strikes show a 0.4 s reticle. Best on: Burst, Projectile, Beam.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | A heavy Force slug drops on the target (0.4 s reticle), +40% damage. | +70%. | The slug knocks back everything within 40. | Each slug leaves a crater that nudges enemies inward. |
| Maximum Gains | A shower of pellets over a marked zone (radius 70). | Radius 90. | Twice the pellets. | The shower walks forward across the crowd over 1 s. |
| Nervous Wreck | A stomp lands on the nearest enemy within 160 and knocks back everything round it. Now a Burst. | Range 200. | Radius +20. | The stomp stuns for 0.5 s. |
| Panic Button | The pulse lands from above on the densest cluster. | Radius +20. | Thrown enemies collide (40%). | Two pulses land in quick succession on the two densest clusters. |
| Acid Spit | Acid rain over a marked zone (radius 70) for 1.5 s. | 2.5 s. | Radius 90. | The rain follows the densest cluster while it falls. |
| Red Flagship | A lightning bolt strikes the target (0.4 s reticle), Charging everything within 50. | Radius 70. | +40% damage. | The bolt forks into 3 more bolts on nearby enemies. |
| Nocturnal Emission | A mucus drop falls on the densest cluster and spreads into a puddle. | Puddle +30%. | The drop Snares where it lands. | The drop splits into 3 puddles. |
| Little Prick | A rain of needles over the target, each causing Bleed. | +2 needles. | The rain spreads to enemies within 50. | The needles pin the target for 1 s. |
| Rent Free | A ghost dives onto the toughest enemy and possesses it (tracks its target). | Possession +1 s. | It dives on 2 targets. | It possesses everything within 60 of where it lands. |
| Hot Mess | A burning drop falls and becomes a patch. | Patch +30%. | The drop lands with a flare. | The drop splashes into 3 patches. |
| Family Ties | The black hole drops onto the densest cluster instead of travelling. | Radius +20. | It drops beside an existing hole if one is on screen. | Holes dropped within 100 of another merge on landing. |
| Skill Issue | A dollop falls on the densest cluster, sending everything flying outward. | Launch +30%. | Radius +20. | Enemies are launched upward and land on their mates (40%). |
| There Is No Spoon | Stored bullets rain down on the enemies that fired them (each tracks its shooter). | +20% damage. | Each bullet hits everything within 40 of its shooter. | The rain falls on every enemy within 100 of each shooter. |
| Nappy Mines | Mines drop from above onto enemy paths instead of behind you. | 2 mines per drop. | Mines drop on the densest cluster. | The Nuclear Nappy always drops on the densest cluster. |
| Soulmate Signal | The twin dives from above onto the far anchor point, then the beam forms. | The dive is twice as fast. | The dive point is the densest cluster. | The dive itself is a Static Burst where the twin lands. |
| Unwanted Contact | A bolt strikes the first target from above, then chains as normal. | +1 jump. | The first target is Charged twice. | Every jump is also struck from above. |
| Ewww, Gross | Tape drops on the target, bundling it as usual. | +1 neighbour. | It drops on the target with the most neighbours. | Tape drops on 2 targets at once. |
| Blowing Bubbles | Bubbles fall from above onto small enemies (tracking them). | 2 bubbles. | Bubbles that miss bounce once towards the nearest small enemy. | Bubbles fall in a ring of 6 round the densest cluster. |
| One of These Days | The mark falls on the toughest enemy (0.4 s reticle). | Repeats 50%. | The mark can't miss (ignores Evasion: it's a strike). | The payout comes as a strike from above on everything within 80. |
| Sister Cousin | Siblings dive from above at their targets (homing). | 3 siblings. | Dives Bleed. | Split siblings also dive from above. |
| Peekaboo | You vanish upward; the BOO comes down on the densest cluster. | Radius +30. | The search spot is where the BOO lands. | You land with it, at the BOO's centre, unharmed. |
| Eggs | Eggs fall from above near greedy enemies. | 2 eggs. | Eggs land with a small smite. | The smite comes down on every enemy near the grabbed egg. |
| Chest Burster | Infecting shots fall on their targets (0.4 s reticle). | Infection +2 s. | Strikes infect everything within 40. | Undead rise by dropping onto enemies. |
| Enzyme Headbutt | A falling headbutt: you drop onto the nearest enemy within 160 (still Contact). | Range 200. | Acid splashes round the landing. | The 4th-hit lunge becomes a dive that splashes acid round the landing. |
| Enzyme Sneeze | Acid drizzle over a marked zone (radius 60). | Radius 80. | Drizzle lasts 2 s. | The drizzle follows the densest cluster. |
| Spark of Life | A Fire bolt strikes a Corroded target (0.4 s reticle). | +30%. | It strikes the 2 most Corroded targets. | Every Corroded enemy within 120 of the bolt is struck too. |
| Laser | Orbital laser (the user's cell): a targeted overhead beam strikes the target and holds for 1 s. | Holds 1.5 s. | The overhead beam follows its target. | Particle cannon: the overhead beam sweeps a line across the crowd. |

### 4.7 Switched at Birth
*Changes the weapon's damage type to one fixed alternate: its starter sample's other type. **Switching must never spoil the attack**: where the mechanic is the damage type, the cell is N/A. The attack's shape and mechanic stay the same; the new type brings its own status and unstable reactions. Best on: any.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Force → **Blood**: the pellet makes targets Bleed. | +1 Bleed stack. | Bleed builds +30%. | Dual-type Force and Blood (Blood Pressure on heavy hits). |
| Maximum Gains | Force → **Static**: each pellet adds Charge. | Charge +20%. | Charge +40%. | Dual-type Force and Static: Shocking Impact on every pellet. |
| Nervous Wreck | Force → **Mucus**: snaps add Snare. | Snare +20%. | Snare +40%. | Dual-type Force and Mucus: snapped Snared enemies are launched (Snot Rocket). |
| Panic Button | Force → **Blood**: the pulse makes everything Bleed. | +1 Bleed stack. | Bleed builds +30%. | Dual-type Force and Blood. |
| Acid Spit | Acid → **Alien**: globs build Possessed instead of Corrosion. | Possessed +20%. | Possessed +40%. | Dual-type Acid and Alien. |
| Red Flagship | Static → **Force**: a plain Force beam with no Charge, but +20% damage. | +30%. | +40%. | Dual-type Static and Force (Shocking Impact along the beam). |
| Nocturnal Emission | N/A: the puddle's Snare is the attack. | | | |
| Little Prick | N/A: Force has no status; it would lose Bleed and become a thinner Standard Issue. | | | |
| Rent Free | N/A: possession is the Alien status. | | | |
| Hot Mess | Fire → **Acid**: an Acid Pool (matrix 11.6) that Corrodes. Gives Ordered Online an Acid weapon (open issue 6). | Corrosion +20%. | Corrosion +40%. | Dual-type Fire and Acid. |
| Family Ties | N/A: it was moved to Force because gravity is displacement. | | | |
| Skill Issue | Force → **Static**: collisions add Charge. | Charge +20%. | Charge +40%. | Dual-type Force and Static. |
| There Is No Spoon | N/A: its point is that returned bullets keep their own type. | | | |
| Nappy Mines | Fire → **Acid** (its original type): blasts Corrode and leave an Acid Pool instead of a burning patch. | Corrosion +20%. | Corrosion +40%. | Dual-type Fire and Acid. |
| Soulmate Signal | N/A: its arcs are the Static mechanic. | | | |
| Unwanted Contact | N/A: Charging enemies is the whole weapon. | | | |
| Ewww, Gross | Mucus → **Acid**: the stamp Corrodes; tape and sharing are unchanged. | Corrosion +20%. | Corrosion +40%. | Dual-type Mucus and Acid. |
| Blowing Bubbles | Mucus → **Acid**: pops Corrode; trapping is unchanged. | Corrosion +20%. | Corrosion +40%. | Dual-type Mucus and Acid. |
| One of These Days | Blood → **Mucus**: the needle Snares; the countdown is unchanged. | Snare +20%. | Snare +40%. | Dual-type Blood and Mucus. |
| Sister Cousin | Blood → **Fire**: siblings set targets alight; homing and splitting are unchanged. | Burn +20%. | Burn +40%. | Dual-type Blood and Fire. |
| Peekaboo | N/A: the BOO's Fear reads as Alien. | | | |
| Eggs | Alien → **Blood**: the smite makes enemies Bleed; the lure is unchanged. | +1 Bleed stack. | Bleed builds +30%. | Dual-type Alien and Blood. |
| Chest Burster | N/A: rising as an ally is the Alien mechanic. | | | |
| Enzyme Headbutt | N/A: as Fire it would undo Sample 9's strip-then-burn loop. | | | |
| Enzyme Sneeze | N/A: as Fire it would undo Sample 9's strip-then-burn loop. | | | |
| Spark of Life | N/A: burning stripped enemies is the attack. | | | |
| Laser | Fire → **Acid**: an acid-green laser that Corrodes; the beam is unchanged. Also gives Ordered Online an Acid weapon. | Corrosion +20%. | Corrosion +40%. | Dual-type Fire and Acid: it strips and burns in one beam. |

### 4.8 Primer
*Hits leave a primer mark (4 s, one per enemy). Any of your **other** weapons hitting a primed enemy sets it off: a small burst (radius 40) for 50% of the primer weapon's base damage, and the mark is used up. Lv 2: bursts 75% and radius 60. Lv 3: the weapon's step. Builds two-weapon combos. Best on: Projectile, Beam, Spread. N/A where this is already the weapon's signature.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Pellets prime their target. | Bigger detonations. | Detonations knock the enemy back. | Detonations knock enemies into their mates (40%). |
| Maximum Gains | Every pellet primes. | Bigger detonations. | An enemy primed by 3 pellets detonates twice. | An enemy primed by the whole fan detonates three times as hard. |
| Nervous Wreck | Snaps prime. | Bigger detonations. | Primed enemies that touch you detonate on their own. | Detonations stun for 0.5 s. |
| Panic Button | Everything in the pulse is primed. | Bigger detonations. | Detonations throw enemies outward. | Detonations are small pulses that prime what they hit (no further chain). |
| Acid Spit | Globs prime; detonations add Corrosion. | Bigger detonations. | A detonation on a Corroded enemy strips a Shell layer. | Detonations spread Corrosion to everything they hit. |
| Red Flagship | Enemies on the beam 0.5 s are primed; detonations Charge. | Bigger detonations. | Detonations arc to one neighbour. | Detonating a Charged enemy sets off a Static reaction around it. |
| Nocturnal Emission | Enemies in the puddle are primed; detonations Snare. | Bigger detonations. | Detonations spread the puddle to where the enemy stands. | Detonations prime every enemy in the puddle again. |
| Little Prick | Needles prime; detonations add Bleed. | Bigger detonations. | A detonation adds 2 Bleed stacks. | A detonation ticks all the target's Bleed stacks at once. |
| Rent Free | Possessed enemies are primed. | Bigger detonations. | The detonation extends the possession 1 s. | Detonating a possessed enemy possesses its neighbours for 1 s. |
| Hot Mess | Enemies in the patch are primed; detonations add Burn. | Bigger detonations. | Detonations leave a small burning patch. | Detonations set every primed enemy in the patch off at once. |
| Family Ties | Enemies inside the well are primed. | Bigger detonations. | Detonations inside the well grow it 10%. | A detonation inside the well counts towards the supernova as a merge. |
| Skill Issue | Flying enemies are primed. | Bigger detonations. | Detonations on landing send the enemy flying again. | Every collision detonates both enemies (no re-priming). |
| There Is No Spoon | Returned bullets prime; detonations are in the bullet's type. | Bigger detonations. | Detonations fill that type's status bar. | Detonations set off the unstable reaction between the bullet's type and the detonating weapon's. |
| Nappy Mines | Blasts prime everything they hit. | Bigger detonations. | Primed enemies set mines off from twice as far. | Detonations near a mine set it off (counts as Domino). |
| Soulmate Signal | Enemies the beam touches are primed. | Bigger detonations. | Detonations on the beam send an arc to the twin. | The beam re-primes enemies every 1 s. |
| Unwanted Contact | N/A: priming your other weapons (Charged enemies arc) is already its signature. | | | |
| Ewww, Gross | Taped enemies are all primed. | Bigger detonations. | Detonating one taped enemy also detonates the next. | Detonating one detonates the whole bundle (echo damage). |
| Blowing Bubbles | Trapped and freed enemies are primed. | Bigger detonations. | A pop detonates every primed enemy in it. | Detonations trap the next small enemy nearby. |
| One of These Days | The marked target is primed throughout the countdown. | Bigger detonations. | It re-primes after each detonation. | Each detonation adds 10% to the stored payout. |
| Sister Cousin | Sibling hits prime. | Bigger detonations. | A detonation kill counts for splitting. | Split siblings prime too. |
| Peekaboo | Feared enemies are primed. | Bigger detonations. | Detonating a Feared enemy Fears its neighbours. | Detonations extend the Fear on everything in range. |
| Eggs | Enemies lured to an egg are primed. | Bigger detonations. | Detonations near an egg set it off early. | The smite detonates every primed enemy within its radius. |
| Chest Burster | Infected enemies are primed. | Bigger detonations. | Undead allies' hits detonate primers. | Detonations spread the infection. |
| Enzyme Headbutt | Headbutts prime; detonations add Corrosion. | Bigger detonations. | A detonation counts as a hit towards the 4th-hit lunge. | The lunge detonates every primed enemy it passes. |
| Enzyme Sneeze | Droplets prime. | Bigger detonations. | Detonations splash a droplet onto a neighbour. | Detonations fill Corrosion to full. |
| Spark of Life | Burning enemies are primed. | Bigger detonations. | Detonating a primed Corroded enemy sets off Premature Evaporation. | Premature Evaporation re-primes everything it hits. |
| Laser | Enemies held in the beam 0.5 s are primed. | Bigger detonations. | Detonations set the enemy alight. | Detonations reflect a short laser to the nearest enemy. |

### 4.9 Every Nth
*Every Nth attack is empowered, with a visible count on the weapon icon (`MODIFIERS.md` 14). Lv 1: every 4th. Lv 2: every 3rd. Lv 3: the weapon's step. The empowered attack is one hit and may count as heavy. Best on: any. N/A where the weapon already has an every-Nth rhythm.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Every 4th pellet is double size and double damage. | Every 3rd. | The big pellet knocks back. | The big pellet pierces the whole line. |
| Maximum Gains | Every 4th fan fires double pellets. | Every 3rd. | The double fan is 50% wider. | The empowered fan is a full ring. |
| Nervous Wreck | Every 4th snap stuns for 0.5 s. | Every 3rd. | Stun 1 s. | The empowered snap hits everything in contact range. |
| Panic Button | Every 4th pulse is double radius. | Every 3rd. | It pulls first, then throws. | The empowered pulse throws enemies into each other (40%). |
| Acid Spit | Every 4th glob fills Corrosion ×3. | Every 3rd. | It splashes neighbours. | The empowered glob strips a full Shell layer. |
| Red Flagship | Every 4th on-phase is a thick beam (+50%). | Every 3rd. | It lasts 0.5 s longer. | It Charges everything it touches at once. |
| Nocturnal Emission | Every 4th puddle is double size. | Every 3rd. | It Snares instantly. | The empowered puddle pulls enemies in. |
| Little Prick | Every 4th needle adds 3 Bleed stacks. | Every 3rd. | It pierces. | It ticks all Bleed stacks at once. |
| Rent Free | Every 4th ghost possesses three times as long. | Every 3rd. | It possesses the 2 nearest enemies. | It possesses everything it passes. |
| Hot Mess | Every 4th patch flares on landing. | Every 3rd. | It's double size. | The empowered patch is a ring round you. |
| Family Ties | Every 4th hole counts as 2 for merging. | Every 3rd. | It's 30% larger. | The empowered hole goes supernova on its own after 3 s. |
| Skill Issue | Every 4th dollop launches twice as far. | Every 3rd. | Its chain goes one step deeper. | It launches everything on screen within 200. |
| There Is No Spoon | Every 4th returned bullet hits double. | Every 3rd. | It pierces. | Every empowered return fires 3 bullets. |
| Nappy Mines | Every 4th mine has double blast. | Every 3rd. | Its patch is double size. | Every 4th mine is a Nuclear Nappy (in place of every 6th). |
| Soulmate Signal | Every 4th re-anchor doubles beam width for 1 s. | Every 3rd. | 2 s. | It arcs 5 jumps. |
| Unwanted Contact | Every 4th shot has 2 more jumps. | Every 3rd. | No falloff on it. | The empowered chain loops back to its first target. |
| Ewww, Gross | Every 4th stamp tapes 3 more neighbours. | Every 3rd. | Its tape lasts twice as long. | The empowered bundle shares 70%. |
| Blowing Bubbles | Every 4th bubble traps any non-elite. | Every 3rd. | Its pop is double. | It traps elites (never bosses). |
| One of These Days | Every 4th mark stores 70%. | Every 3rd. | Its countdown is 3 s. | It pays out on every enemy within 100. |
| Sister Cousin | Every 4th shot fires 4 siblings. | Every 3rd. | They Bleed ×2. | Its siblings split on any hit, not just kills. |
| Peekaboo | Every 4th BOO is double radius. | Every 3rd. | Fear lasts twice as long. | The empowered BOO stuns as well as Fears. |
| Eggs | Every 4th egg smites at full strength the moment it's grabbed. | Every 3rd. | It lures from double range. | It hatches a ghost ally after its smite. |
| Chest Burster | Every 4th shot infects everything within 50. | Every 3rd. | Radius 80. | The empowered shot's undead rise as elite versions. |
| Enzyme Headbutt | N/A: already lunges every 4th hit. | | | |
| Enzyme Sneeze | Every 4th sneeze fires 6 droplets. | Every 3rd. | It leaves an Acid Pool. | It's a full ring round you. |
| Spark of Life | Every 4th on-phase sets off Premature Evaporation on every Corroded enemy in the lane. | Every 3rd. | It lasts 0.5 s longer. | It lasts twice as long. |
| Laser | Every 4th on-phase is a thick beam (+60%). | Every 3rd. | It pierces (exception to the no-pierce rule). | It's a white-hot burst that ignores Shell. |

### 4.10 Extra Projectiles
*Adds shots, beams or objects per attack. More of them means less damage each (rule 5). Laser cells follow the user's voice notes exactly: +1 beam (you can set a different target for each), then a rear beam (front beams confined to the front 180°, rear beams to the rear 180°), then the mastery, beams rotating in every direction. Best on: Beam, Projectile.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | +1 forward pellet (85% damage each). | +1 rear pellet. | +2 side pellets. | A ring of pellets in every direction (50% each). |
| Maximum Gains | +2 pellets per fan. | A second, smaller fan behind you. | +2 more pellets per fan. | Fans fire front, back and to both sides. |
| Nervous Wreck | Snaps a second enemy in contact range. | A third. | Snaps alternate front and back so nothing sneaks up. | Snaps every enemy in contact range. |
| Panic Button | A second pulse goes off 0.3 s later. | A third pulse. | Each pulse is offset to cover a different side. | Pulses ripple out in a ring of 5. |
| Acid Spit | +1 glob (85% each). | +1 rear glob. | +2 side globs. | A ring of globs. |
| Red Flagship | +1 beam, front 180°, on a different target. | A rear beam (rear 180°). | +1 more front beam. | Beams rotating in every direction (damage per beam lowered). |
| Nocturnal Emission | +1 puddle per cast. | +1 more. | Puddles appear on both sides of you. | A ring of small puddles round you. |
| Little Prick | +1 needle. | +1 rear needle. | +2 needles. | A burst of needles in every direction. |
| Rent Free | +1 ghost. | +1 rear ghost. | Ghosts split at the first hit. | A ring of ghosts. |
| Hot Mess | +1 patch. | +1 more. | Patches land on both sides of you. | A ring of patches round you. |
| Family Ties | +1 hole (3-well cap stays; smaller holes). | Holes fire front and back. | Holes come in pairs that drift together. | Three holes at once in a triangle that merge in the middle. |
| Skill Issue | +1 dollop. | +1 more. | Dollops land in a line. | A ring of dollops. |
| There Is No Spoon | Returns in pairs. | Returns in threes. | Returns fan out over 30°. | Returns in a ring round you. |
| Nappy Mines | +1 mine per drop. | +1 more. | Mines drop in a line behind you. | Mines drop in a ring. |
| Soulmate Signal | A second twin and beam. | The second twin mirrors the first across you. | A third twin. | Twins circle you, beams spinning like spokes. |
| Unwanted Contact | +1 chain shot. | +1 more. | Shots go to different targets by default. | A chain shot in every direction. |
| Ewww, Gross | +1 stamp. | +1 more. | Stamps go to different bundles. | Stamps in every direction. |
| Blowing Bubbles | +1 bubble. | +1 more. | Bubbles go to different small enemies. | A ring of bubbles. |
| One of These Days | +1 mark (a second target). | +1 more. | Marks go to your top 3 toughest. | Every elite on screen is marked. |
| Sister Cousin | +1 sibling per shot. | +1 more. | Siblings leave from front and back. | A brood: siblings in every direction. |
| Peekaboo | +1 BOO, offset from the first. | +1 more. | BOOs cover the 3 densest searching clusters. | A BOO from every searching cluster at once. |
| Eggs | +1 egg. | +1 more (the 3-egg cap rises to 4). | Eggs spread round you. | 5 eggs, a ring of lures. |
| Chest Burster | +1 infecting shot. | +1 more. | Shots go to different targets. | Shots in every direction. |
| Enzyme Headbutt | A second headbutt on another enemy. | A third. | The lunge hits a second target too. | Every enemy in reach is headbutted at once. |
| Enzyme Sneeze | +1 droplet. | A second, smaller sneeze behind you. | +2 droplets. | A ring sneeze. |
| Spark of Life | +1 beam, front 180°, on a different Corroded target. | A rear beam (rear 180°). | +1 more front beam. | Beams rotating in every direction, stopping briefly on Corroded enemies. |
| Laser | +1 beam; both limited to the front 180°, and you can set a different target for each. | A beam behind you, limited to the rear 180°. | +1 more front beam (3 front, 1 rear). | Beams rotating in every direction (damage per beam lowered; the user's "disco ball", name not decided). |

### 4.11 Orbiting
*The attack circles you (radius 72 unless the cell says otherwise). For most weapons the attack forms a ring round you, then flies off. For beams it becomes a ring that never leaves (the user's laser hula hoop): strong defence. Orbiters can't be hit and aren't pets; they block enemy shots only where the cell says so (12.8). Best on: Beam, Projectile. N/A where the weapon goes off round you anyway.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | Pellets circle you once, then fly off at the nearest enemy. | They circle twice. | Orbiting pellets block enemy shots. | Up to 6 pellets orbit until an enemy comes near, then fire. |
| Maximum Gains | The fan forms a ring round you, then flies outward. | The ring turns twice before it flies. | The ring blocks enemy shots while it turns. | The ring stays: a spinning ring of pellets (ring damage, 50% each). |
| Nervous Wreck | Two clamps orbit you and snap enemies they pass. | 3 clamps. | Orbit radius 90. | Clamps throw the enemies they snap. |
| Panic Button | N/A: the pulse already goes off round you. | | | |
| Acid Spit | Globs circle you once, then fly off. | Orbiting globs Corrode enemies they pass. | They circle twice. | Up to 4 globs orbit, firing when an enemy comes near. |
| Red Flagship | The beam bends into a ring round you (radius 72) that zaps enemies it touches. | Radius 90. | The ring Charges what it touches. | A second, wider ring turns the other way. |
| Nocturnal Emission | Small puddles orbit you, Snaring what they cross. | 3 puddles. | Radius 100. | The orbit leaves a sticky trail behind it. |
| Little Prick | Needles circle you once, stabbing what they pass, then fly off. | They circle twice. | Up to 3 needles stay in orbit. | Orbiting needles block enemy shots. |
| Rent Free | Ghosts circle you once, then fly off. | Orbiting ghosts possess enemies they pass for 0.5 s. | 3 ghosts stay in orbit. | Orbiting ghosts make enemies near you flee (Fear). |
| Hot Mess | A ring of fire orbits you, burning what it touches. | Radius 90. | The ring leaves a short burning trail. | Two rings turning opposite ways. |
| Family Ties | The black hole orbits you, dragging enemies round with it and bending shots. | It orbits wider (100). | Enemy shots it bends are thrown away from you. | Two holes orbit opposite each other (still the 3-well cap). |
| Skill Issue | Dollops orbit you until an enemy touches one, then launch it. | 3 dollops. | Orbit radius 90. | Launched enemies are thrown along the orbit into others. |
| There Is No Spoon | Stored bullets orbit you and block enemy shots (12.8). | Up to 5 orbit at once. | Blocked shots are eaten into the store. | Orbiting bullets fire themselves at enemies that come within 80. |
| Nappy Mines | Mines orbit you and go off on contact with enemies. | 3 mines. | Radius 90. | Orbiting mines leave burning patches along the orbit. |
| Soulmate Signal | The twin orbits you, sweeping the beam round you. | Orbit 30% faster. | Radius 100. | Two twins orbit on opposite sides. |
| Unwanted Contact | Charged orbs circle you and chain to enemies that come near. | 3 orbs. | +1 jump. | Orbs chain to each other, forming a crackling ring. |
| Ewww, Gross | Tape orbs circle you and stamp enemies that touch them. | 3 orbs. | Stamped enemies are taped to the orb and dragged round. | Dragged enemies tape everything they bump into. |
| Blowing Bubbles | Bubbles orbit you, trapping small enemies that touch them. | 3 bubbles. | Orbiting bubbles block enemy shots (and pop). | Popped bubbles reform in orbit after 2 s. |
| One of These Days | A needle orbits you and marks the first big enemy to come close. | 2 needles. | Marks from orbit store 50%. | The orbiting needle re-marks a new target after every payout. |
| Sister Cousin | Siblings orbit you between shots and dive at enemies that come close. | 3 siblings in orbit. | Split siblings join the orbit. | The orbit blocks enemy shots. |
| Peekaboo | N/A: it goes off round you anyway. | | | |
| Eggs | Eggs orbit you, so greedy enemies must come close to grab one. | 3 eggs. | Radius 100. | Grabbing an orbiting egg smites everything in the orbit. |
| Chest Burster | Undead allies orbit you as bodyguards instead of chasing. | They block enemy shots. | Up to 6 bodyguards. | Bodyguards burst into infection when they expire. |
| Enzyme Headbutt | An acid cap orbits you and headbutts enemies it passes. | 2 caps. | Radius 90. | Orbiting caps lunge outward at enemies within 120. |
| Enzyme Sneeze | Droplets orbit you once, then fly out. | They orbit twice. | Orbiting droplets Corrode what they pass. | A permanent ring of acid mist round you. |
| Spark of Life | The beam becomes a ring round you that burns Corroded enemies. | Radius 90. | The ring sets off Premature Evaporation on contact. | A second ring turning the other way. |
| Laser | Hula hoop (the user's note): the beam leaves you, twists, and forms a glowing ring round you. It never goes out again, burning anything that touches it. | Radius 100. | The ring blocks enemy shots. | Two rings at different radii, turning opposite ways. |

## 5. How the modifiers fit together

### 5.1 Groups
Every modifier belongs to one group by what it changes. A weapon has one slot per group (rule 1). Kind (scaling or shaping) says how it levels; group says what it does and which slot it takes.

| Group | What it changes | Modifiers |
|---|---|---|
| **Delivery** | How the attack reaches enemies | Melee, Ranged, Mines, Death from Above (these four replace firing), Orbiting, Extra Projectiles |
| **Flight** | What the attack does in flight or on impact | Piercing, Ricochet, Homing, Exploding Rounds |
| **Crowd** | Where enemies go, and whose side they're on | Pulling, Knockback, Sticky, Connecting, Turncoat |
| **Tempo** | Timing and the damage curve | Charged, Rapid Fire, Focused Intensity, Every Nth, Range, Up Close |
| **Chemistry** | Damage types, statuses and reactions | Switched at Birth, Catalyst, Kinship, Primer |

### 5.2 Telling look-alikes apart
One line per pair that sounds alike, so the pool never holds two effects that play the same.

| Pair | The difference |
|---|---|
| Ricochet / Connecting | Ricochet **redirects** the attack to a new enemy; Connecting **keeps a link** between enemies already hit. |
| Piercing / Ricochet | Piercing carries on in a **straight line**; Ricochet **changes direction** at each enemy. |
| Pulling / Family Ties' well | Pulling drags enemies towards **the attack** while it hits; a well is a **place** that keeps pulling. |
| Pulling / Knockback | Opposite directions: towards the attack, or away from it. Both Crowd, so never on one weapon. |
| Mines / Death from Above | Mines are **placed now, triggered by enemies later**; Death from Above **lands now, from a new origin**. |
| Melee / Orbiting | Melee makes the weapon **strike** close; Orbiting makes the attack **circle** you (it can still fly off). |
| Range / Up Close | Opposite curves: Range flattens falloff; Up Close steepens it for close damage. Both Tempo, so never on one weapon. |
| Charged / Every Nth | Charged makes **every** attack slower and stronger; Every Nth keeps the pace and makes **one in N** stronger. |
| Focused Intensity / Charged | Focused Intensity rewards **staying on one target**; Charged rewards **waiting before each attack**. |
| Primer / Catalyst | Primer sets up **your other weapons**; Catalyst strengthens **this weapon's own** statuses and reactions. |

### 5.3 Pair bonuses
Two modifiers from different groups on the same weapon (both Lv 1 or higher) unlock the bonus; a few pairs use a sperm passive as one half. The draft favours the second half once you hold the first (rule 20). Pairs were reworked on 22 Oct so that none joins two modifiers from the same group.

| Pair (groups) | Name (internal) | Bonus |
|---|---|---|
| Pulling + Exploding Rounds (Crowd, Flight) | Gather and pop | Enemies pulled in take +30% from the explosion, and its radius grows +20. |
| Connecting + Exploding Rounds (Crowd, Flight) | Crowd disintegrator | An explosion on a linked enemy also goes off on every enemy linked to it (half size). |
| Connecting + Ricochet (Crowd, Flight) | Chain reaction | Bounces prefer linked enemies and lose no damage between them. |
| Ricochet + Advanced Targeting (Flight, sperm passive) | Smart bounce | Bounces aim at the next target by your targeting rules instead of the reflection angle. |
| Melee + Knockback (Delivery, Crowd) | Bouncer | Melee hits knock enemies into each other (40% collision). |
| Mines + Ricochet (Delivery, Flight) | Scatter mines | Mines bounce when laid, spreading into the crowd before they arm (keeps the old orbital minefield's idea: mines delivered into the crowd). |
| Orbiting + Rapid Fire (Delivery, Tempo) | Carousel | Each attack adds an orbiter (cap 4), and orbiters spin faster with the attack rate. |
| Sticky + Homing (Crowd, Flight) | Living web | Sticky shots home on enemies not yet stuck; each newly stuck enemy is tethered to the last one. |
| Turncoat + Piercing (Crowd, Flight) | Conversion army | Enemies killed by the same shot all rise together, as one squad (cap 6). |
| Melee + Charged (Delivery, Tempo) | Glass cannon | A charged melee hit deals triple; you take +15% damage while winding up. |
| Focused Intensity + Extra Projectiles (Tempo, Delivery) | Drill | Every extra shot or beam on the same target counts towards the ramp, so more beams ramp faster. |
| Primer + Exploding Rounds (Chemistry, Flight) | Fuse box | Detonations use the explosion's radius and set off the unstable reaction between the two weapons' damage types. |
| Switched at Birth + Piercing (Chemistry, Flight) | Two-tone | Each enemy pierced is hit by the old and new damage type in turn, setting off their unstable reaction. |

## 6. Moved to sperm passives

### 6.1 Advanced Targeting (sperm passive)
*A sperm passive: it applies to every weapon you carry and takes a sperm passive slot, not a weapon slot. The default is one target, picked by each weapon's own rule. Lv 1 gives an ordered list of 2 rules from the menu: nearest, toughest, weakest, fastest, densest cluster, **elite first**, **nearest threat** (the enemy about to reach you), not yet afflicted (by that weapon's status). Lv 2 adds a third slot. Lv 3 adds each weapon's own step (column Lv 3). The mastery unlocks each weapon's specialty, often assigning different shots to different foes; it uses the build's one mastery (or Extra Mastery). Rules are set per weapon or once for all. N/A where the weapon doesn't aim.*

| Weapon | Lv 1 | Lv 2 | Lv 3 | Mastery |
|---|---|---|---|---|
| Standard Issue | 2-rule list. | 3 rules. | Never fires at an enemy another shot will already kill. | Lock: stays on a target until it dies, then takes the next by your list. |
| Maximum Gains | 2-rule list for where the fan points. | 3 rules. | Points the fan to cover the most enemies of your top rule. | Split fan: the left and right halves follow different rules. |
| Nervous Wreck | 2-rule list for which enemy in contact range to snap. | 3 rules. | Snaps the enemy about to hit you first. | Ignores enemies that would trigger Thorns, unless nothing else is in range. |
| Panic Button | 2-rule list for when to go off (first in range, densest moment, toughest in range). | 3 rules. | Waits up to 0.5 s for a better moment. | Holds its pulse until at least N enemies are in range (you set N). |
| Acid Spit | 2-rule list ("not yet afflicted" = not yet Corroded). | 3 rules. | Never wastes a glob on an enemy with no Shell left. | Assign shots: every other glob takes your second rule. |
| Red Flagship | 2-rule list for the beam's aim. | 3 rules. | Holds on a target until it's Charged, then moves. | Sweep order: the beam moves target to target along your list without returning. |
| Nocturnal Emission | 2-rule list for where puddles go (densest, path of the fastest, toughest). | 3 rules. | Puddles are laid on enemies' predicted paths. | Each puddle follows a different rule in turn. |
| Little Prick | 2-rule list ("not yet afflicted" = not yet Bleeding). | 3 rules. | Never stacks Bleed past the cap on one enemy. | Assign shots: needles cycle through your list's top 3 targets. |
| Rent Free | 2-rule list for who to possess. | 3 rules. | Never possesses an enemy that is already possessed. | Assign shots: alternate ghosts take different rules. |
| Hot Mess | 2-rule list for where to lay the patch. | 3 rules. | Patches go where enemies will be in 1 s. | Each patch follows a different rule in turn. |
| Family Ties | 2-rule list for where to place the hole. | 3 rules. | Places holes near existing ones to set up merges. | Places holes so the bent shots of your other weapons pass through them. |
| Skill Issue | 2-rule list for where to lob. | 3 rules. | Lobs to set up the longest collision chain. | Each dollop of a load follows a different rule. |
| There Is No Spoon | 2-rule list for returned bullets. | 3 rules. | Each bullet goes to the enemy weakest to its damage type. | Assign by type: each damage type in your store gets its own rule. |
| Nappy Mines | 2-rule list for where to drop mines (behind you, on enemy paths, near other mines). | 3 rules. | Drops mines to make the most Domino links. | Each mine of a load follows a different rule. |
| Soulmate Signal | 2-rule list for where the twin anchors. | 3 rules. | The twin anchors so the beam crosses the most enemies. | Two anchor rules: the twin alternates between them. |
| Unwanted Contact | 2-rule list for the first shot. | A separate 2-rule list for the jumps. | 3 rules each. | Jump rules: each of the jumps can follow a different rule. |
| Ewww, Gross | 2-rule list for the stamp. | 3 rules. | Picks the target whose neighbours make the biggest bundle. | Assign shots: each stamp of a load follows a different rule. |
| Blowing Bubbles | 2-rule list (small enemies only, as always). | 3 rules. | Never sends a bubble after an enemy another bubble is chasing. | Assign shots: each bubble of a load follows a different rule. |
| One of These Days | 2-rule list (default: toughest). | 3 rules. | Never marks an enemy that will die before the countdown ends. | Assign shots: up to 3 marks on 3 different rules. |
| Sister Cousin | 2-rule list for siblings. | A separate list for split siblings. | 3 rules each. | Assign shots: the two siblings take different targets by default. |
| Peekaboo | N/A: it goes off round you and doesn't aim. | | | |
| Eggs | 2-rule list for where eggs are dropped. | 3 rules. | Eggs are dropped to lure the enemy at the top of your list. | Each egg of a load follows a different rule. |
| Chest Burster | 2-rule list ("not yet afflicted" = not yet infected). | 3 rules. | Infects enemies close to death first, so allies rise sooner. | Assign shots: alternate shots take different rules. |
| Enzyme Headbutt | 2-rule list for which enemy to headbutt. | 3 rules. | The 4th-hit lunge follows its own rule, separate from the headbutts. | The lunge picks the line through the most enemies. |
| Enzyme Sneeze | 2-rule list for where the sneeze points. | 3 rules. | Points the sneeze at the most enemies that aren't yet Corroded. | Each droplet follows a different rule. |
| Spark of Life | 2-rule list (default: Corroded first, as in its spec). | 3 rules. | Waits for a target's Corrosion bar to fill before burning it. | Each on-phase follows a different rule in turn. |
| Laser | 2-rule list (the user's cell: Ricochet can use the priorities when picking the next enemy). | 3 rules. | Ricochet and Extra Projectiles bounces and beams follow the list too. | Assign beams: with Extra Projectiles, each beam gets its own rule (the user's "two different targets for each beam"). |


## 7. Open questions for the user
1. **Turncoat elites:** elites and bosses never rise (default). Confirm.
2. **The four "weakened" Switched at Birth weapons** (Little Prick, There Is No Spoon, Peekaboo, Family Ties) are N/A by default. Reverse any?
3. **Suicide vest:** keep it as a joke trap that only stops hurting you at mastery (as written)?
4. **Laser roster:** does the Laser replace one of Ordered Online's three starters, or is it a 4th?
5. **Orbiting × Laser blocks shots at Lv 3:** with a ring that never goes out, that may be too strong a defence. Keep?
