# Weapon Upgrades (first branch)

**Status: working proposal, 18 Oct 2026 (second draft). Docs only.** Numbers are starting points for sims. Roster: `BASE_WEAPONS.md`. Rules: `COMBAT_MATRIX.md` (cited as 11.x and 12.x), `MODIFIERS.md`, autorun modes in `AUTORUN_AUTOAIM.md`.

## How the branch works

- **Lv 3: pick a promise.** Three cards, each a different answer to "how will this weapon play from now on?" The other two are gone for the run.
- **Lv 6: grow the promise, or swerve.** Three cards: two belong to the promise you picked and add a new behaviour (not a bigger number); the third is a wildcard from outside the promise, stranger and less expected.
- **Lv 10: the mastery.** Only one weapon a run reaches Lv 10, so these are extreme. Three cards per weapon, offered whatever promise you took; each says which promises it suits best.
- Per weapon: 3 promises, 9 Lv 6 cards (2 per promise plus a wildcard each), 3 masteries. 360 cards in all. The in-promise Lv 6 cards still need names.

## Design rules for every branch

1. **A promise changes what the player wants to do** (where to swim, what to target, when to commit), not how much damage a number says.
2. **Autorun modes find different openings.** No card requires a mode. Each path notes which modes suit it: KITE (long trails, traps, range), ORBIT (circles, repeated contact), COLLECT (moving through drops), HUNT (focus fire on one target), HOLD (letting enemies come), NEST (fighting round the egg).
3. **Identity first.** Each signature deepens its own fantasy. Ewww, Gross shares damage; Unwanted Contact chains; Chest Burster builds an army. They do not converge on generic chain reactions.
4. **Visible in combat.** Every path has a **Shows** line: what the player sees that proves the choice is working.
5. **Trade-offs.** Where a path gives something, its **Costs** line says what it takes away. Not every path is strictly better.
6. **Damage type never changes** through an upgrade. Attack type can change, rarely, tagged **[ATTACK to X]**; the new attack type then decides the defence rules (Evasion, Thorns; matrix 13).
7. No new statuses and no new ground objects. Weapon marks (a visible tag a weapon puts on an enemy for its own use, like One of These Days' countdown) are allowed; they are not statuses and no reaction reads them. Pools are standard objects (11.6) or footprints (attack areas no reaction uses). Every repeat is bounded (12.5); copied damage is echo damage (12.1).

---

# The 10 foundations

## 1. Standard Issue (Force, Projectile)
**A. Ricochet Brain: play into packed groups.**
- Lv 3: after a hit, the shot bounces to the nearest enemy within 110 (2 bounces, 80% damage each time).
- Lv 6, pick one:
  - a bounce that hits an enemy already knocked back by this shot slams them together: both take a collision hit.
  - the last bounce of each shot is a heavy hit (knocks off a Shell layer) and bounces once more.
  - Wildcard, **Squirrel**: shots that miss land as nuts on the floor; swimming over one fires it again at the nearest enemy.
- Costs: the first hit is 15% weaker. Shows: a pale zigzag linking the bounces. Modes: ORBIT keeps a tight group in front of you.

**B. Through and Through: line the crowd up.**
- Lv 3: pierces up to 4 enemies; each one after the first takes +15% more than the last.
- Lv 6, pick one:
  - the shot speeds up with every enemy it passes through; a shot that clears 4 grows to double size.
  - a shot that pierces 5 or more leaves a shock lane behind it for 0.5 s that knocks back anything crossing it.
  - Wildcard, **Conkers**: each nut is on a string: after its first hit it swings once round that enemy, hitting whatever it sweeps.
- Costs: lower fire rate (−20%). Shows: the pellet visibly grows and its trail thickens per enemy. Modes: KITE lines pursuers up behind each other.

**C. Marked for Bonking: focus fire.**
- Lv 3: every 4th hit on the same enemy marks it (a dented-nut icon); the next Standard Issue on a marked enemy is a heavy hit for ×2.5.
- Lv 6, pick one:
  - a marked enemy also takes +20% from your other weapons until the bonk lands.
  - the bonk staggers the target (full Poise bar) and knocks off a Shell layer; elites take it every 3rd hit instead of 4th.
  - Wildcard, **Nut Allergy**: enemies killed by Standard Issue swell up and burst, knocking their neighbours back.
- Costs: the shot no longer switches targets while one is marked. Shows: the dent icon fills in quarters; the bonk has a big thwack frame. Modes: HUNT, which already locks one target.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Shell Shock** (C): every shot is a heavy hit (knocks off a Shell layer, fills Poise by a third), and fire rate is ×1.5.
- **Infinite Nuts** (A, B): shots keep going: unlimited pierce and bounces until each shot has hit 12 enemies, with no damage lost.
- **Squirrel Away** (C): every 10th shot unloads the last ten again in 0.3 s at the same target, each at ×1.5.

## 2. Maximum Gains (Force, Spread)
**A. Shotgun Wedding: get close and commit.**
- Lv 3: the cone tightens to a third of its width; pellets that land within 120 units deal +60%.
- Lv 6, pick one:
  - a point-blank volley (every pellet hits one enemy) knocks it back hard and pushes you back 60 units (recoil lunge).
  - every 3rd volley fuses into a single slug that pierces 3 and is a heavy hit.
  - Wildcard, **Confetti**: pellets that miss stick in the floor for 2 s and hit enemies that swim over them.
- Costs: almost nothing lands beyond 200 units. Shows: a dense pellet ball and a recoil kick on the sperm. Modes: HUNT and ORBIT close the gap; KITE wastes it.

**B. More Is More: cover the screen.**
- Lv 3: +5 smaller pellets (60% damage each) across a 50% wider fan.
- Lv 6, pick one:
  - pellets that miss carry on to full range and split once into 2 (40% damage).
  - [ATTACK to Burst] every 4th volley fires all the way round you as a ring of pellets.
  - Wildcard, **Wedding Rice**: every other volley fires backwards, behind you.
- Costs: poor single-target damage; bosses shrug it off. Shows: a wide fan of tiny pips, then a full ring. Modes: ORBIT keeps a crowd in the fan; COLLECT clears a path through gems.

**C. Get Off Me!: shove them about.**
- Lv 3: pellets knock back; an enemy hit by 3 or more pellets in one volley is shoved twice as far.
- Lv 6, pick one:
  - an enemy shoved into another enemy or a wall takes a collision hit, and so does what it hit.
  - a shove that causes a collision also knocks the second enemy on (depth 2), so one volley can scatter a group.
  - Wildcard, **Hiccups**: fires at random moments, sometimes twice in a row: about 30% faster on average, never on a rhythm.
- Costs: −15% damage per pellet. Shows: enemies tumble away and bump into each other. Modes: KITE and HOLD keep space clear; NEST keeps the egg free.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Baby Boom** (A, B): three times the pellets, each at full damage, and every volley recoils you 80 units.
- **Riot Control** (C): every pellet knocks back like a heavy hit; each collision sets off a small Force blast (depth 2).
- **Full Auto** (B): fires four times as fast with no reload; pellets do 40% less.

## 3. Nervous Wreck (Force, Contact)
**A. Vice Grip: hold them and get out.**
- Lv 3: each clamp holds the enemy in place for 0.4 s.
- Lv 6, pick one:
  - while an enemy is held, your swim speed is +25% and enemy shots aimed at you lose track for the same 0.4 s.
  - a held enemy can be clamped into a neighbour: the clamp swings it into the nearest enemy for a collision hit on both.
  - Wildcard, **Tooth and Nail**: the jaws bite bullets: an enemy shot that enters clamp range is crushed (12.8, once per 0.5 s).
- Costs: one clamp per 0.8 s (slower). Shows: the jaws visibly stay shut round the enemy. Modes: KITE uses the hold to escape; NEST stops attackers reaching the egg.

**B. Shell Game: crack the tough ones.**
- Lv 3: every 3rd clamp on the same enemy knocks off a Shell layer; an enemy with no Shell instead gets a crack mark: +15% damage from you, up to +45%.
- Lv 6, pick one:
  - a cracked enemy leaks: your clamps on it splash 30% onto the enemies touching it.
  - when the last Shell layer comes off, the enemy is staggered and takes a ×3 clamp.
  - Wildcard, **Nut Sack**: each clamp stores a nut; every 6 stored are flung at the furthest enemy as one heavy shot.
- Costs: it does nothing extra to enemies you don't stay on. Shows: visible cracks spreading across the target. Modes: HUNT keeps you on one enemy.

**C. Back Off!: answer the first one in.**
- Lv 3: the first clamp on each enemy that enters range is a counter-strike: ×2 damage and heavy knockback (each enemy once per 4 s).
- Lv 6, pick one:
  - a counter-struck enemy knocked into another enemy knocks it back too.
  - when 3 or more enemies enter range within 1 s, the jaws snap all of them at once in a ring (self-centred).
  - Wildcard, **Hug It Out**: a clamped enemy is carried in front of you for 1 s, soaking up enemy shots.
- Costs: later clamps on the same enemy are 20% weaker. Shows: a big star thump and enemies flung clear. Modes: HOLD and NEST let enemies come to you.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Jaws of Life** (C): the clamp becomes a ring of jaws round you (radius 240) that hits everything in reach on every clamp.
- **Crack Addict** (B): every clamp is a heavy hit; each Shell layer you knock off heals you 1% of max health (6 health per second cap).
- **Untouchable** (A, C): while an enemy is in clamp range you take 50% less Contact damage, and every enemy that enters range is countered (no per-enemy cooldown; once per 0.3 s overall).

## 4. Panic Button (Force, Burst)
**A. Bigger Bang Theory: clear the crowd.**
- Lv 3: radius +40%, and the outer edge hits harder than the centre (+30% at the rim).
- Lv 6, pick one:
  - the blast aims at the densest cluster's edge, so the rim lands on the most enemies.
  - every 4th blast has a second, larger ring 0.3 s later (double radius, 60% damage).
  - Wildcard, **Grudge Match**: each blast goes off on whoever last hurt you, if it is in range.
- Costs: −20% damage at the centre. Shows: a fat shockwave with a bright rim. Modes: ORBIT keeps clusters in range.

**B. Chain Reaction: cascades.**
- Lv 3: an enemy killed by the blast sets off a small blast (40% radius, 50% damage) where it died.
- Lv 6, pick one:
  - chain blasts can kill too, and those kills chain once more (depth 3 at most).
  - a chain of 3 or more ends in one big blast at the last link (full radius, 100%).
  - Wildcard, **Dud**: 1 blast in 4 fails and leaves a lump that goes off 2 s later at triple size.
- Costs: −15% base damage, so the payoff needs kills. Shows: pops rippling outwards through the crowd. Modes: COLLECT benefits from gems spilled across a wide area.

**C. Premature Evacuation: make room.**
- Lv 3: survivors are launched away from the centre; the more damage dealt, the further they fly.
- Lv 6, pick one:
  - a launched enemy that hits another enemy or a wall takes a collision hit, and so does what it hits.
  - blasts go off around you instead of at a target [ATTACK stays Burst, self-centred], launching everything near outward.
  - Wildcard, **Shrapnel Shower**: blasts throw 6 chunky fragments that land, bounce once and hit what they land on.
- Costs: no extra damage; the payoff is space and collisions. Shows: enemies flung outwards in a ring. Modes: KITE and NEST, which want enemies kept away.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Big Bang** (A): radius ×2.5 and damage ×2; fires half as often.
- **Chain of Command** (B): chain blasts go to depth 6 and keep full radius.
- **Hair Trigger Happy** (A, C): a blast every 0.4 s, each on a different cluster.

## 5. Acid Spit (Acid, Projectile)
**A. Spit Take: stay on one target.**
- Lv 3: Corrosion builds 50% faster; the fuller a target's Corrosion bar, the more Acid damage it takes (up to +40% when full).
- Lv 6, pick one:
  - when a full bar strips a Shell layer, the bar resets only halfway.
  - a target that loses its last Shell layer to Acid Spit takes ×2 damage from your Acid Spit for 4 s.
  - Wildcard, **Spittoon**: globs that miss leave a puddle; swimming through it makes your next 3 spits double size.
- Costs: the glob no longer re-targets until its target dies. Shows: a fizzing coat that thickens on the target. Modes: HUNT.

**B. Splash Damage: precise shots, messy results.**
- Lv 3: a direct hit splatters 3 droplets onto enemies within 60 (30% damage, 30% Corrosion).
- Lv 6, pick one:
  - droplets that hit an enemy already carrying Corrosion splatter once more.
  - every 5th spit lands as a lobbed glob that leaves an Acid Pool (radius 50, 3 s).
  - Wildcard, **Gargle**: with nothing in range for 2 s, the next spit is a mouthful: 5 globs at once.
- Costs: −15% damage on the direct hit. Shows: visible droplets arcing off the target. Modes: ORBIT keeps a group bunched.

**C. Bad Aftertaste: the death spreads it.**
- Lv 3: each hit leaves an acidic residue mark on the target; when it dies, the residue splashes enemies within 70 with its Corrosion bar.
- Lv 6, pick one:
  - the splash also leaves a small Acid Pool where it died (radius 35, 2 s).
  - enemies hit by a splash carry their own residue mark, so the next death splashes again (depth 3).
  - Wildcard, **Lob Lip**: globs arc over the first enemy and land on the one behind it (lobbed).
- Costs: no help against the target itself. Shows: green-pink drips on marked enemies, a splat on death. Modes: COLLECT swims through the gems those deaths drop.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Battery Acid** (A): every hit fills a non-boss enemy's Corrosion bar completely (bosses: half).
- **Projectile Vomit [ATTACK to Beam]** (A, B): a continuous acid stream that pierces everything and builds Corrosion ×1.5.
- **Acid House** (B, C): every enemy that dies carrying Corrosion leaves an Acid Pool (radius 60, 3 s); touching pools merge (12.7).

## 6. Red Flagship (Static, Beam)
**A. Overclocked: hold the line on one target.**
- Lv 3: damage grows the longer the beam stays on one target, up to +100% after 3 s; switching target resets it.
- Lv 6, pick one:
  - at full charge the beam turns white and its hits carry Poise, so it can interrupt.
  - at full charge, the target is Charged permanently while the beam holds, so your other weapons' arcs start from it.
  - Wildcard, **Screen Burn**: wherever the beam rests for 1 s, a ghost of it stays burnt in for 3 s and still zaps (footprint).
- Costs: weak against crowds; every switch throws the charge away. Shows: the beam thickens and whitens as it charges, then snaps thin when switching. Modes: HUNT.

**B. Critical Error: hold it through a crowd.**
- Lv 3: an enemy killed by the beam emits a pulse (radius 60, 50% of one second's beam damage).
- Lv 6, pick one:
  - a pulse that kills emits another (depth 3).
  - every 10 kills, the next kill makes a full-screen flicker that Charges every enemy on screen.
  - Wildcard, **Have You Tried Turning It Off**: every 6 s the beam switches off and on again; the restart Charges everything on its line.
- Costs: −10% beam damage. Shows: little static pops along the beam as enemies die. Modes: ORBIT keeps a crowd crossing the beam.

**C. Dead Pixels: wider, scrappier coverage.**
- Lv 3: every 0.5 s the beam glitches into 3 short parallel zaps either side of its line (50% damage each).
- Lv 6, pick one:
  - the glitches leave dead pixels on the floor for 1 s that zap anything crossing them (footprint).
  - [ATTACK to Spread] the beam breaks up permanently into 7 short zaps fanned out in front of you.
  - Wildcard, **Wrong Cable**: the beam fires backwards out of your tail.
- Costs: −30% damage on the main line. Shows: a jittery beam with sparks either side. Modes: KITE drags the glitches across pursuers.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Blue Screen of Death** (A): an enemy held in the beam for 2 s is staggered and takes ×5 (bosses: 4 s).
- **Multi-Monitor Setup** (B, C): four beams in a cross, turning with your swim direction.
- **Kernel Panic** (B): an enemy killed by the beam Charges everything within 150, and the beam jumps to the nearest of them (3 jumps).

## 7. Nocturnal Emission (Mucus, Pool)
**A. Extra Strength Snot: slow everything.**
- Lv 3: Snared enemies crossing it move at 40% speed (from 60%) and stay slowed for 1.5 s after leaving.
- Lv 6, pick one:
  - enemies leaving drag a strand behind them; the next enemy to cross the strand is Snared too.
  - the trap grows by 10% every second something is Snared in it (up to double size).
  - Wildcard, **Snot Bubble**: now and then a trap floats up as a bubble that drifts after the nearest enemy and splats on it, leaving a small trap.
- Costs: the trap lasts 25% less time. Shows: thick green drag lines and strands snapping back. Modes: KITE drags pursuers through it.

**B. Bogged Down: stick the dangerous ones.**
- Lv 3: an enemy that stays in the trap for 1.5 s is stuck in place for 1.5 s (once per enemy per 4 s).
- Lv 6, pick one:
  - two stuck enemies close together become Conjoined (groups of 3 at most).
  - stuck enemies cannot attack.
  - Wildcard, **Sneeze Guard**: traps block enemy shots that cross them (once per 0.3 s per trap).
- Costs: one trap at a time. Shows: a stuck enemy sinks a little into the snot. Modes: HOLD and NEST, where enemies come to you.

**C. Snotwork: build a network.**
- Lv 3: traps within 200 of each other are joined by a stretchy strand; enemies crossing it are Snared.
- Lv 6, pick one:
  - up to 4 traps can be down at once (from 2).
  - an enemy crossing a strand is pulled along it to the nearest trap (Pull rule 12.2).
  - Wildcard, **Bogey Man**: an enemy that dies Snared in a trap leaves a bogey that rolls slowly, Snaring what it touches for 3 s.
- Costs: each trap is 30% smaller. Shows: glistening strands between puddles, enemies twanging into them. Modes: KITE and ORBIT both lay traps across a wide area.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Snot Ocean** (A): traps are three times the size and last twice as long.
- **Superglue** (B): anything Snared in a trap is stuck solid for 2 s: no moving, no attacking (elites 1 s; bosses are only slowed). Once per enemy per 5 s.
- **Snotwork Everywhere** (C): a trap drops every 1 s as you swim, and strands join all of them (8 traps at most).

## 8. Little Prick (Blood, Projectile)
**A. Bleeding Heart: the long fight.**
- Lv 3: each hit adds a Bleed stack (cap raised to 6).
- Lv 6, pick one:
  - an enemy at the Bleed cap leaks: each second it splashes 1 stack onto the nearest enemy.
  - a bleeding enemy that dies leaves a blood pool twice as large, and enemies crossing it gain a Bleed stack.
  - Wildcard, **Sewing Circle**: needles that miss circle you once and launch again.
- Costs: −30% direct damage. Shows: growing pulsing marks on the target, drips between enemies. Modes: KITE keeps you alive while the Bleed works.

**B. Needlework: thread the horde.**
- Lv 3: pierces up to 5 enemies; each one after the first takes +10% more than the last.
- Lv 6, pick one:
  - a needle that pierces 3 or more leaves a thread between the first and last enemy: Bleed hits anything crossing it for 2 s.
  - a needle that pierces 5 sews them together: they are pulled into a knot (Pull rule) and each takes a Bleed stack.
  - Wildcard, **Tattoo**: an enemy hit 5 times gets a small heart tattoo; when it dies you heal 1% of max health.
- Costs: fires 25% slower. Shows: a red thread trailing the needle through the line. Modes: KITE lines pursuers up.

**C. Final Prick: clean up.**
- Lv 3: +100% damage to enemies under 30% health.
- Lv 6, pick one:
  - a kill by Little Prick fires a free needle at the next-weakest enemy within 300.
  - a needle that hits a bleeding enemy under 15% health kills it outright (elites under 8%, never bosses).
  - Wildcard, **Vaccination**: each needle kill makes you immune to the next status that would hit you within 3 s.
- Costs: −25% damage to enemies above half health. Shows: a red pinprick flash and a ding on the finishing blow. Modes: COLLECT sweeps up the gems from the clean-up.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Exsanguinate** (A): every hit adds 3 Bleed stacks, and kills of bleeding enemies heal you double (12 health per second cap).
- **Pin Cushion** (B): each shot is a volley of 8 needles, each homing on a different enemy.
- **Coup de Grace** (C): any enemy under 25% health hit by a needle dies (elites under 12%; bosses take ×3 instead).

## 9. Rent Free (Soul, Projectile)
**A. Ghost Through: pass through the crowd.**
- Lv 3: passes through up to 4 enemies; each one after the first takes 20% less.
- Lv 6, pick one:
  - every enemy it passes through gains Soul build-up, so a long line fills several bars at once.
  - when the ghost reaches full range it fades and re-forms at the start of its path, flying the same line again once.
  - Wildcard, **Nine-Tenths of the Law**: a Possessed enemy fires Rent Free shots at its mates.
- Costs: −15% damage to the first target. Shows: the ghost visibly passes through bodies, leaving a faint wisp in each. Modes: KITE lines pursuers up.

**B. Return to Sender: twice the haunting.**
- Lv 3: after its hit, the ghost fades, reappears and retraces its path back to you, hitting again (returning).
- Lv 6, pick one:
  - on its way back it pulls a little of each enemy it passes towards you (Pull rule, weak).
  - a Possessed enemy it passes on the way back is dragged along with it for 1 s, bumping its mates.
  - Wildcard, **Haunted House**: ghosts that miss sink into the floor and pop up under the next enemy that swims over them.
- Costs: the shot is 30% slower. Shows: a translucent ghost reversing along its trail. Modes: ORBIT keeps enemies on both legs of the path.

**C. Unfinished Business: they come back for their friends.**
- Lv 3: an enemy hit but not killed carries a haunting mark for 3 s; if it dies while marked, its spirit bursts out (radius 70, 60% damage, Soul build-up).
- Lv 6, pick one:
  - the burst also marks the enemies it hits (depth 2).
  - instead of bursting, the spirit of an elite or big enemy fights for you for 4 s (pets rule 12.3).
  - Wildcard, **Seance**: every 8 s, the last 5 enemies you killed flicker back for 1 s as ghosts that draw enemy fire.
- Costs: −20% direct damage. Shows: a pale wisp orbiting marked enemies, then a ghostly puff on death. Modes: HUNT tags a big target; COLLECT enjoys the bursts.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Mass Possession** (A, C): every hit fills half a Soul bar, and Possession lasts twice as long.
- **Poltergeist** (A, B): ghosts never stop at a target: they wander for 6 s, hitting everything they touch (6 at most).
- **Ghost Army** (C): each kill by Rent Free raises a ghost that fires Rent Free shots for 5 s (pets rule 12.3).

## 10. Hot Mess (Fire, Pool)
**A. Hotter Mess: don't stand in it.**
- Lv 3: the longer an enemy stays inside, the faster its Burn bar fills (up to 3× after 2 s).
- Lv 6, pick one:
  - an enemy that Ignites inside the patch makes the whole patch flare up for 0.5 s (+50% damage).
  - the patch pulls enemies standing at its edge back in (Pull rule, weak).
  - Wildcard, **Fire Drill**: enemies refuse to enter the patch, so it works as a wall; anything already inside burns twice as fast.
- Costs: the patch is 20% smaller. Shows: the flames climb taller the longer someone stands in them. Modes: HOLD and NEST make enemies walk into it.

**B. Spreading Rumours: the fire leaves with them.**
- Lv 3: an enemy that walks out of the patch while Burning leaves a trail of small burning footprints for 1.5 s.
- Lv 6, pick one:
  - those footprints fill Burn bars as fast as the patch does.
  - an enemy that Ignites while trailing footprints drops a fresh small patch where it Ignites (once per enemy).
  - Wildcard, **Toasty**: standing in your own patch heals you 1% of max health a second.
- Costs: the patch itself burns out 30% sooner. Shows: scorched footprints leading away from the patch. Modes: KITE makes pursuers walk through and out again.

**C. Flash in the Pan: short fuse, big finish.**
- Lv 3: patches last half as long, but when one expires it erupts in a burst (its full radius) that fills Burn bars by half.
- Lv 6, pick one:
  - the eruption is aimed: it goes off early the moment 4 or more enemies stand in it.
  - [ATTACK to Burst] patches no longer burn at all; they are delayed blasts that erupt after 1 s, with double the radius.
  - Wildcard, **Hot Potato**: every 2 s the patch jumps to under the nearest enemy outside it.
- Costs: very little steady damage. Shows: the patch visibly swells and glows before it erupts. Modes: ORBIT gathers a crowd on top of it.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Hellmouth** (A): one huge patch (radius 200) that crawls after the densest cluster and burns for 10 s.
- **Spontaneous Combustion** (B): every enemy that Ignites, from any source, drops a Hot Mess patch where it stands (once per enemy).
- **Scorched Earth** (A, C): patches do not expire while an enemy stands in them; up to 6 at once.

---

# The 14 signatures

## 11. Family Ties (Force, Projectile, gravity well)
**A. Event Horizon: nothing gets out.**
- Lv 3: the pull is much stronger near the centre (×2 within half the radius) and weaker at the edge.
- Lv 6, pick one:
  - an enemy pulled into the centre is held there until the orb ends (bosses never; elites 1 s).
  - when the orb ends, everything at its centre is crushed together: one Burst with a collision hit for each enemy there.
  - Wildcard, **Lost Property**: enemies swallowed or crushed by an orb drop their gems at your feet.
- Costs: the outer pull is 30% weaker, so fewer enemies are caught. Shows: a dark core with enemies pinned on it. Modes: HOLD and NEST, where the orbs fill up with enemies coming at you.

**B. Orbituary: a moving hazard.**
- Lv 3: enemies near the orb orbit it instead of falling in.
- Lv 6, pick one:
  - orbiting enemies collide with each other and with anything they swing into (collision hits both).
  - when the orb ends, orbiting enemies are flung outwards in all directions as projectiles that knock back what they hit.
  - Wildcard, **Gravity Assist**: swimming past an orb slingshots you: +60% swim speed for 1 s.
- Costs: the orb does 40% less damage of its own. Shows: a ring of enemies whirling round the orb. Modes: ORBIT keeps the crowd feeding the ring.

**C. Big Bang, Eventually: wait for it.**
- Lv 3: merged orbs gain power 50% faster, but each orb lasts longer and drifts slower (−30% speed).
- Lv 6, pick one:
  - the merge count shows on the orb; at 3 merged it starts eating enemy shots (12.8).
  - the supernova radius and damage scale with everything the orbs dealt (up to ×2), and it leaves a short standing well for 3 s [ATTACK to Pool for that well].
  - Wildcard, **White Hole**: every 3rd orb pushes enemies away instead of pulling.
- Costs: slow, back-loaded damage. Shows: a growing, wobbling orb with a visible merge counter, then the supernova. Modes: KITE keeps you alive while it grows.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Supermassive** (C): orbs are twice the size and pull 2.5 times as hard; 3 merges make a supernova, which deals ×3.
- **Spaghettification** (A): enemies at the centre take ×4 damage and are swallowed whole under 30% health (not bosses).
- **Wormhole** (B): orbs come in linked pairs: an enemy pulled into one is shot out of the other at speed, hitting whatever it meets.

## 12. Peekaboo (Soul, Burst, Fear)
**A. Peek-a-Boom: punish the bait.**
- Lv 3: your false position explodes in a Soul burst (radius 90) when enemies reach it.
- Lv 6, pick one:
  - the burst's size grows with the number of enemies that reached the spot.
  - the false position stays for 4 s after you reappear and goes off a second time.
  - Wildcard, **Rattle**: while hidden you leave a baby rattle at your real position that lures enemies away from you.
- Costs: the BOO itself is 30% weaker. Shows: a faint sperm-shaped outline that pops when crowded. Modes: KITE leaves the bait far behind.

**B. You Can't See Me: stay gone.**
- Lv 3: enemies searching the decoy stay confused 1 s longer; enemy shots aimed at you while hidden pass harmlessly through your old position.
- Lv 6, pick one:
  - while hidden, you swim 40% faster and can pick up drops without breaking cover.
  - while hidden, your other weapons keep firing, from where you actually are.
  - Wildcard, **Mirror, Mirror**: two false positions instead of one; enemies split between them.
- Costs: the BOO is 40% weaker. Shows: shots passing through a ghost outline, enemies milling about. Modes: COLLECT uses the hidden time to sweep gems.

**C. Boo!: make them panic.**
- Lv 3: the BOO's Fear lasts 3 s (from 2) when you reappear within 150 of enemies.
- Lv 6, pick one:
  - a fleeing enemy that bumps into another spreads Fear to it (once per enemy).
  - Feared enemies that run into each other collide for a hit and drop their next attack.
  - Wildcard, **Cuckoo**: when you reappear, you swap places with the nearest enemy.
- Costs: a shorter hide (1.2 s). Shows: enemies scattering and bumping into each other. Modes: HUNT reappears in the thick of it.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Object Permanence** (B, C): you vanish twice as often, and the BOO reaches the whole screen.
- **Mass Hysteria** (C): the BOO also fills the Soul bar of up to 5 enemies at once, so they are Possessed.
- **Now You See Me** (A, B): you are hidden 3 s out of every 4; every reappearance is a BOO.

## 13. Soulmate Signal (Static, Beam, anchored)
**A. Long-Distance Relationship: sweep the whole arena.**
- Lv 3: the twin stays twice as far away; the beam is twice as long.
- Lv 6, pick one:
  - the beam damage grows with its length, up to +60% at full stretch.
  - the twin's end drags anything it touches along the beam towards you (Pull rule).
  - Wildcard, **Evil Twin**: once a wave your twin goes off on its own for 5 s, chasing the nearest elite with its end of the beam.
- Costs: much harder to keep the beam on one target. Shows: a long beam slashing across the screen. Modes: KITE and ORBIT both sweep it naturally.

**B. Toxic Codependency: drag it through the dense part.**
- Lv 3: each enemy the beam crosses in one sweep adds +10% to the beam for 2 s (up to +100%).
- Lv 6, pick one:
  - at +100% the beam turns white and Charges everything it touches for 3 s.
  - at +100% your twin swaps places with you along the beam, hitting everything on the line.
  - Wildcard, **Sticky Fingers**: the beam picks up the gems it crosses and drops them at your feet.
- Costs: −20% damage when crossing few enemies. Shows: the beam brightening step by step as it sweeps. Modes: ORBIT.

**C. Third Wheel: more geometry.**
- Lv 3: a Charged enemy struck by the beam throws a second, shorter beam to the nearest enemy for 1 s.
- Lv 6, pick one:
  - up to 3 extra beams at once; each extra beam that crosses another makes a spark at the crossing that hits everything near it.
  - a third anchor appears (another twin): the beams form a triangle and everything inside it is Charged.
  - Wildcard, **Mirror Image**: 25% of enemy shots aimed at you hit your twin instead (it cannot be hurt).
- Costs: the main beam is 20% thinner. Shows: branching beams and crossing sparks. Modes: ORBIT and HUNT weave through clusters.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Quadruplets** (A, C): two more twins, each with its own beam.
- **Psychic Link** (B): every 1.5 s a pulse runs along every beam for 300%, tagged Poise so it can interrupt.
- **Conjoined Twins** (B): your twin is fused beside you: one beam straight ahead at ×4 damage and three times the range. No more sweeping.

## 14. Eggs (Soul, Burst, lures)
**A. Nest Egg: bait makes more bait.**
- Lv 3: every enemy smitten lays an egg of its own.
- Lv 6, pick one:
  - up to 6 eggs on the ground at once (from 3).
  - when 3 eggs are taken within 1 s, the eggs smite all three takers and everything between them.
  - Wildcard, **Easter Egg Hunt**: eggs burrow and pop up under the nearest enemy instead of waiting.
- Costs: each smite is 25% weaker. Shows: eggs rolling out of each smitten enemy. Modes: COLLECT and ORBIT keep you near the rolling eggs.

**B. Egg On: steer the horde.**
- Lv 3: eggs lure from twice as far, and enemies chasing an egg stop attacking you.
- Lv 6, pick one:
  - eggs are dropped where you choose to be: they land on your swim path, 200 units behind you.
  - one golden egg at a time lures everything on screen (bosses excepted) for 2 s.
  - Wildcard, **Broody**: every 3rd egg is kept back and hatched smiting a random elite.
- Costs: smites are 20% weaker. Shows: enemies peeling off the crowd and swimming for the glint. Modes: KITE drops eggs behind you; NEST draws enemies away from the egg.

**C. Don't Count Your Chickens: patience pays.**
- Lv 3: an egg gains power while it waits: +25% smite damage per second, up to +150%.
- Lv 6, pick one:
  - a fully charged egg (6 s) glows, and its smite also hits everything within 100.
  - a fully charged egg that is never taken explodes when it expires, smiting everything within 160.
  - Wildcard, **Egg on Your Face**: when you take damage, an egg drops at the feet of whatever hurt you.
- Costs: eggs are dropped 40% less often. Shows: eggs glowing brighter as they wait. Modes: HOLD and KITE give eggs time to charge.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Golden Goose** (A, C): every smite hits everything within 160 of the victim at full damage.
- **Clutch** (A, B): up to 12 eggs on the ground at once, scattered all round you.
- **Possession Fee** (B): every smite Possesses the victim at once (bosses take ×3 instead).

## 15. Chest Burster (Soul, Projectile)
**A. The Family Business: a durable army.**
- Lv 3: undead last 12 s (from 6) and deal +50%.
- Lv 6, pick one:
  - undead follow you and fight near you, instead of where they died.
  - the first elite you convert each wave stays for the whole wave (counts towards the pets cap).
  - Wildcard, **Doggy Bag**: undead fetch gems back to you between fights.
- Costs: at most 3 undead (from 4). Shows: a little worm-ridden escort swimming with you. Modes: KITE keeps them between you and the crowd.

**B. Contagious Personality: the army recruits.**
- Lv 3: undead infect the enemies they attack.
- Lv 6, pick one:
  - infection lasts until death (no 8 s timeout).
  - any enemy that dies infected rises, whoever killed it (pets cap still applies; the oldest undead goes first).
  - Wildcard, **Hookworm**: undead latch on to an enemy and ride it, biting, until it dies.
- Costs: undead last 4 s and deal 30% less. Shows: worm marks spreading enemy to enemy. Modes: ORBIT keeps the fight tightly packed for infection.

**C. Dead Useful: an army of ammunition.**
- Lv 3: undead explode in a Soul burst (radius 70) when they expire or are killed.
- Lv 6, pick one:
  - the burst adds Soul build-up to everything it hits.
  - you can detonate your undead early: every 8 s, all undead rush the densest cluster and burst on arrival.
  - Wildcard, **Gut Feeling**: infected enemies flash red just before they attack.
- Costs: undead deal 50% less in melee. Shows: undead shambling into crowds and popping. Modes: HUNT points them at a big target.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Zombie Apocalypse** (B): this weapon's undead cap rises from 4 to 12 (overrides the pets cap, 12.3).
- **Adopted** (A): elites killed while infected become permanent allies (3 at most).
- **Mother of Worms** (A, C): three tapeworms coil round you permanently and bite what comes close; every infected death adds +10% to their damage (up to +200%).

## 16. The Runs (Fire, Pool, trail)
**A. Can't Hold It: go fast.**
- Lv 3: the faster you swim, the denser and hotter the trail (up to ×2 Burn rate at full speed).
- Lv 6, pick one:
  - sprinting leaves a white-hot streak that Ignites anything crossing it at once (once per enemy per 4 s).
  - at full speed you leave burning footprints either side of you as well, tripling the trail's width.
  - Wildcard, **Slip Road**: enemies that cross the trail skid forward along it.
- Costs: standing still leaves nothing, and slow swimming leaves a weak trail. Shows: the trail brightens and widens with speed. Modes: KITE and ORBIT keep you moving fast.

**B. Backdraft: cross your own path.**
- Lv 3: crossing your own trail ignites it in a wave: fire runs along the path both ways from the crossing (1 s, fills Burn bars by half).
- Lv 6, pick one:
  - closing a loop (crossing a trail you laid within 4 s) fills the Burn bar of everything inside the loop.
  - a wave that meets another wave bursts where they meet (a Burst of radius 90).
  - Wildcard, **Breadcrumbs**: gems you swim past follow the trail behind you until you collect them.
- Costs: the trail itself burns 30% weaker. Shows: a visible wave of fire racing along the trail. Modes: ORBIT crosses its own path constantly.

**C. Leave a Little Behind: lay a route.**
- Lv 3: the trail lasts 3 times as long but starts at low heat, building up over 2 s.
- Lv 6, pick one:
  - enemies following your exact path take +50% (the trail remembers them).
  - trail pieces that are fully hot become embers that stay for 10 s along your most-used route.
  - Wildcard, **Wrong Way**: the trail is laid 150 units ahead of you instead of behind.
- Costs: slow payoff; the fresh trail behind you does little. Shows: a trail that glows from dull to bright behind you. Modes: KITE drags pursuers along the route; NEST circles the egg on one route.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Afterburner** (A): the trail Ignites everything it touches at once (once per enemy per 3 s).
- **Hot Lap** (B): closing a loop erupts everything inside it (full Ignition) and doubles your swim speed for 2 s.
- **Scorched Route** (C): the trail lasts 20 s at full heat (trail pieces get their own cap of 80).

## 17. Nappy Mines (Fire, Burst, delayed)
**A. Proximity Problems: punish pursuers.**
- Lv 3: mines go off as soon as an enemy comes within 50, as well as on their fuse.
- Lv 6, pick one:
  - a mine that goes off on contact flings the enemy back towards the next mine.
  - mines crawl slowly after the nearest enemy within 150 (homing).
  - Wildcard, **Hand-Me-Down**: an enemy that touches a mine picks it up and carries it for 1 s before it goes off among its mates.
- Costs: −15% blast damage. Shows: mines blinking faster as enemies near. Modes: KITE lays them in the path of pursuers.

**B. Cluster Diaper: build a minefield, set it off once.**
- Lv 3: mines dropped within 120 of each other link (a visible tape between them); one blast sets off the whole linked group.
- Lv 6, pick one:
  - each mine in a chain goes off 20% bigger than the last (3 mines max per chain, 12.5).
  - a chain of 3 ends in a nappy-shaped blast of triple radius.
  - Wildcard, **Changing Mat**: when you stop swimming, mines are laid in a ring round you.
- Costs: mines do not go off on their own until an enemy touches one in the group. Shows: taped-together mines going off in sequence. Modes: HOLD and NEST drop mines in one place.

**C. Lingering Smoulder: deny the ground.**
- Lv 3: the burning patch left by each blast lasts 3 s (from 2) and grows slowly.
- Lv 6, pick one:
  - patches that touch merge into one bigger patch (12.7 limits).
  - an enemy that Ignites on a patch makes it flare outward to double size for 1 s.
  - Wildcard, **Bouncy Castle**: a blast throws its mine 100 units on, where it goes off again (once).
- Costs: the blast itself is 25% weaker. Shows: smouldering patches spreading behind you. Modes: KITE turns a retreat into a burning route.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Nuclear Nappy** (B): every 4th mine is a nuke: triple radius, six times the damage.
- **Minefield** (A, B): three mines per drop, twice as often, lasting twice as long.
- **Nappy Rash** (C): burning patches are three times the size, last 6 s and merge.

## 18. Unwanted Contact (Static, Projectile, chaining)
**A. It's Spreading: cover the crowd.**
- Lv 3: +3 jumps (6 in all); jump range 140.
- Lv 6, pick one:
  - the chain can fork once: at the first enemy it splits into two chains.
  - the last enemy in each chain stays Charged for 6 s instead of 3.
  - Wildcard, **Bad Hair Day**: Charged enemies are gently pulled towards each other, like hair to a balloon.
- Costs: each jump loses more (60% falloff instead of 70%). Shows: long branching arcs across the crowd. Modes: ORBIT keeps a crowd within jump range.

**B. Conductive Personality: set up the whole build.**
- Lv 3: Charged enemies take +20% damage from all your weapons (not just Static).
- Lv 6, pick one:
  - Unwanted Contact picks targets that are not yet Charged, spreading the setup.
  - when an enemy dies while Charged, all your weapons fire 20% faster for 2 s (does not stack).
  - Wildcard, **Odd Sock**: one enemy each wave becomes a lightning rod: every chain passes through it on the way.
- Costs: Unwanted Contact's own damage is −30%. Shows: crackling Charged outlines on many enemies at once. Modes: HUNT pairs it with a heavy hitter.

**C. Feedback Loop: arcs feed arcs.**
- Lv 3: when another weapon's hit makes a Charged enemy arc, there is a 30% chance it throws a second, smaller arc (50%).
- Lv 6, pick one:
  - a second arc that lands on another Charged enemy can throw one more (depth 3).
  - every 20 arcs, the next Unwanted Contact bolt is a storm: it chains to every Charged enemy on screen.
  - Wildcard, **Balloon Animal**: a chain that kills leaves a static balloon that floats to the nearest enemy and pops on it.
- Costs: Unwanted Contact fires 25% slower. Shows: arcs spawning arcs in visible cascades. Modes: any mode with a fast-firing second weapon.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Tumble Dryer** (B, C): 20% of hits from all your other weapons start a Unwanted Contact chain.
- **Worked Up** (A): 8 jumps, and every jump hits 25% harder than the last instead of weaker.
- **Grid Lock** (A, B): every Charged enemy is joined to the nearest other Charged enemy by a live arc that hits anything crossing it (8 arcs at most).

## 19. Ewww, Gross (Mucus, Projectile, shared damage)
**A. Birds of a Feather: bigger networks.**
- Lv 3: bundles link up to 6 enemies (from 4) and reach 220 (from 170).
- Lv 6, pick one:
  - two bundles that touch merge into one network (up to 10).
  - hitting any enemy in a bundle shares the hit with the whole bundle at 35% each, however far apart they drift (echo damage).
  - Wildcard, **Paper Trail**: when a bundle ends, it leaves a strip of tape on the floor that Snares what crosses it for 3 s.
- Costs: bundles last 3 s (from 5). Shows: a web of red tape across the crowd. Modes: ORBIT keeps the network packed.

**B. Shared Trauma: share what is wrong with them.**
- Lv 3: when one linked enemy is Snared, Burning or Corroded, its partners gain a quarter of that bar or status (once per second; a weapon rule, not echo damage).
- Lv 6, pick one:
  - a linked enemy that is Possessed drags its partners towards its targets.
  - when one partner Ignites or loses a Shell layer, every partner takes the same, once per bundle.
  - Wildcard, **Office Politics**: taped enemies blame each other: they bump and shove within their bundle.
- Costs: the shared damage drops to 20%. Shows: statuses visibly flowing along the tape. Modes: any; strongest with a second weapon that applies statuses.

**C. Toxic Relationship: focus until it snaps.**
- Lv 3: when a linked enemy dies, the tape snaps and its partners take 30% of its max health (echo damage).
- Lv 6, pick one:
  - the snap pulls the survivors together, Conjoining them.
  - each snap in the same bundle hits harder than the last (+50% per snap).
  - Wildcard, **Lost in the Post**: now and then a bundle includes you: hits you take while taped are shared out to the bundle.
- Costs: no damage is shared while they live. Shows: the tape twanging tight, then snapping. Modes: HUNT focuses one linked enemy down.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Bureaucracy** (A): bundles share 80% of every hit (echo damage).
- **Red Tape Everywhere** (A, B): every enemy on screen is in a bundle; bundles re-form every 3 s.
- **Mutually Assured Destruction** (C): when a linked enemy dies, partners under 30% health die too (elites 15%; bosses take 30% of its max health).

## 20. Skill Issue (Force, Burst, collisions)
**A. Pinball Wizard: rebound everything.**
- Lv 3: enemies that collide with others rebound instead of stopping, carrying on at 70% speed.
- Lv 6, pick one:
  - rebounds off walls count too, and each rebound adds a collision hit.
  - a rebounding enemy that hits 3 others bursts in a small Force blast.
  - Wildcard, **Sausage Link**: a launched enemy trails a string that tugs the next enemy it passes along behind it.
- Costs: −20% blast damage. Shows: enemies visibly ricocheting round the group. Modes: ORBIT keeps the group close enough to bounce.

**B. Heavy Meat: big enemies make the best ammunition.**
- Lv 3: collision damage scales with the size of the flying enemy (up to ×2 for elites).
- Lv 6, pick one:
  - big enemies send small ones flying twice as far.
  - elites can be launched (bosses never), and a launched elite is a heavy hit to everything it strikes.
  - Wildcard, **Meat Shield**: dollops that land near you set into a wall of meat for 2 s that blocks enemy shots.
- Costs: small enemies barely move. Shows: big enemies cannoning through little ones. Modes: HUNT finds the big ones.

**C. Meat Grinder: hits build up.**
- Lv 3: each collision adds an impact mark to the enemy; at 3 marks it bursts in a small Force shockwave.
- Lv 6, pick one:
  - the shockwave launches its neighbours too.
  - the shockwave counts as a collision, so it adds marks to what it hits (depth 3).
  - Wildcard, **Leftovers**: bowled enemies drop chunks; swimming through one heals 0.5% of max health.
- Costs: −30% knockback distance. Shows: tenderised enemies swelling with each mark, then popping. Modes: HOLD lets the crowd pile in.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Perfect Game** (A): everything flies twice as hard and knocks on to depth 4.
- **Tenderiser** (B, C): every collision is a heavy hit.
- **Human Cannonball** (A): you are the missile: every 4 s you launch yourself 320 units (cannot be hit mid-flight), bowling over everything you touch.

## 21. There Is No Spoon (Force, Projectile)
**A. Return to Womb: store it up.**
- Lv 3: the store holds 25 bullets (from 10), and stored bullets keep 2 s longer before going stale.
- Lv 6, pick one:
  - the volley fires only when the store is full, all at once, in a tight cone.
  - a full-store volley is followed by a second volley of the same size at the nearest elite.
  - Wildcard, **Hiccup**: each returned shot has a 25% chance to fire twice.
- Costs: nothing fires until the store fills. Shows: a visibly swelling placenta round the sperm, then a big volley. Modes: KITE survives while it fills.

**B. Umbilical Shield: survive the pattern.**
- Lv 3: each stored bullet adds a little Membrane (1% max health, up to 15%).
- Lv 6, pick one:
  - while the Membrane holds, enemy bullets within 120 are pulled towards you to be eaten.
  - when the Membrane breaks, every stored bullet bursts out in a ring.
  - Wildcard, **Re-Gift**: returned shots go to a different enemy from the one that fired them, the furthest in range.
- Costs: returned shots do 40% less. Shows: a cord-and-membrane bubble that thickens. Modes: NEST and HOLD stand in the bullets.

**C. Eat the Rich: the scarier the shot, the nastier the reply.**
- Lv 3: big or powerful enemy shots count as 3 stored bullets and are returned at triple damage.
- Lv 6, pick one:
  - a returned big shot pierces everything in its path.
  - a boss shot that is eaten is returned at its boss (homing) and is a heavy hit.
  - Wildcard, **Swap Meet**: each returned shot copies a random one of your other weapons' shots (its own type and attack type).
- Costs: small shots are no longer eaten. Shows: big shots visibly swallowed and spat back. Modes: HUNT goes near bosses and elites.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Mirror Womb** (B, C): half of all enemy shots that reach you bounce back at whoever fired them.
- **Let-Down Reflex** (A): the store holds 40; when full it bursts in a ring of all 40, twice.
- **Bullet Sponge** (A, B): absorb radius ×3 (270).

## 22. Blowing Bubbles (Mucus, Projectile, traps)
**A. Big Bubble Trouble: catch the elites.**
- Lv 3: bubbles can trap enemies of any size except bosses, but take 0.8 s to close round anything bigger than small.
- Lv 6, pick one:
  - a trapped elite cannot attack and its Membrane stops regenerating.
  - popping an elite's bubble launches it like a cannonball through its friends.
  - Wildcard, **Bath Time**: popped bubbles leave soap that you skid on: +40% swim speed for 2 s.
- Costs: one bubble at a time. Shows: a large bubble wobbling closed round a big enemy. Modes: HUNT.

**B. Bubble Wrap: walls you can move.**
- Lv 3: trapped enemies' bubbles block enemy shots.
- Lv 6, pick one:
  - bubbles drift towards you and float between you and the nearest shooter.
  - when a bubble has blocked 5 shots it pops and fires them back.
  - Wildcard, **Snow Globe**: bubbles also trap enemy shots and drift with them inside.
- Costs: bubbles pop only to shots and you, not to enemies. Shows: shots splashing harmlessly on bubbles. Modes: KITE and NEST.

**C. Pop Goes the Prawn: control bombs.**
- Lv 3: a pop releases a mucus shockwave (radius 90) that Snares everything near.
- Lv 6, pick one:
  - the shockwave pops other bubbles it reaches (depth 3).
  - the shockwave Conjoins enemies it Snares together.
  - Wildcard, **Bubble Gum**: a popped bubble sticks to the next enemy that swims through the spot, Snaring it.
- Costs: bubbles hold enemies for 2 s (from 5). Shows: a green ring spreading from each pop. Modes: ORBIT keeps bubbles near crowds.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Cotton Wool** (B): every 6 s you are wrapped in a bubble that blocks your next 3 hits.
- **Bubble Boy** (A): bubbles trap any enemy except bosses, instantly.
- **Hamster Ball** (C): trapped enemies roll at the nearest other enemy and pop on it, trapping that one (depth 3).

## 23. One of These Days (Blood, Projectile, mark)
**A. Any Day Now: commit and it comes sooner.**
- Lv 3: the countdown shortens by 0.1 s for every hit the marked enemy takes.
- Lv 6, pick one:
  - a date that goes off early repeats 50% (from 40%).
  - going off early staggers the target.
  - Wildcard, **Gender Reveal**: each date goes off with a random extra: a knockback blast, a full Bleed stack or a small heal for you.
- Costs: one mark at a time. Shows: the countdown clock spinning faster as you hit it. Modes: HUNT.

**B. Multiplying Responsibilities: spread the dates.**
- Lv 3: when a date goes off or its enemy dies, the 2 nearest enemies get weaker marks (20% repeat).
- Lv 6, pick one:
  - weaker marks pass on once more when they go off (depth 2).
  - when 3 dates go off within 1 s, the third repeats at full strength.
  - Wildcard, **Morning After**: a marked enemy that leaves the screen goes off at once.
- Costs: the main mark repeats only 30%. Shows: little clocks hopping enemy to enemy. Modes: ORBIT.

**C. Interest Accrued: a long wait for a big cheque.**
- Lv 3: the countdown is 8 s (from 4) and repeats 70% (from 40%).
- Lv 6, pick one:
  - the clock shows the stored total, and the stored damage keeps 25% of itself if the enemy dies early, bursting onto neighbours.
  - a mark that goes off on a boss or elite also marks it again at once (twice per enemy).
  - Wildcard, **Postponed**: a single hit on you of over 15% max health is postponed for 2 s and halved (once per 10 s).
- Costs: the slowest payoff in the game. Shows: a big ledger number growing over the target. Modes: HUNT and HOLD against bosses.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Labour Day** (A, C): a date that goes off re-marks the same enemy at once, every time (bosses included).
- **The Big Day** (B): marked enemies take +50% damage from everything you own, and you can mark 3 at once.
- **Induced** (C): the repeat is 100% of the stored damage, but only one mark every 10 s.

## 24. Sister Cousin (Blood, Projectile, homing)
**A. Family Planning: more children.**
- Lv 3: every kill produces an extra seeker (not only when one splits).
- Lv 6, pick one:
  - the extra seekers are faster and smaller.
  - the cap rises to 18 in flight (from 12).
  - Wildcard, **Hide and Seek**: siblings that lose their target hide in place and ambush the next enemy that comes near.
- Costs: each seeker is 25% weaker. Shows: a swarm visibly growing through a crowd. Modes: ORBIT keeps them fed.

**B. The Favourite: pick on the weak.**
- Lv 3: seekers always home on the weakest enemy in range.
- Lv 6, pick one:
  - a seeker that kills gains +30% damage for its next target.
  - a kill from a seeker that has already killed splits into three instead of two.
  - Wildcard, **Sibling Squabble**: siblings that meet bounce off each other and pick different targets.
- Costs: they ignore big threats. Shows: seekers zipping between the wounded. Modes: COLLECT follows the kills.

**C. Sibling Rivalry: gang up.**
- Lv 3: two or more seekers on the same enemy deal +25% each.
- Lv 6, pick one:
  - all seekers in a volley pick the same target.
  - when 4 seekers hit one enemy within 0.5 s, they apply a full Bleed stack cap at once.
  - Wildcard, **Dinner Time**: a sibling with 3 kills swims back to you and heals you 1% of max health.
- Costs: no splitting. Shows: a tight knot of seekers diving in together. Modes: HUNT.

**Lv 10 mastery (pick one; works with any promise, best with the letters shown)**
- **Baby Boom** (A): every sibling splits into two on every hit, not just kills (24 in flight at most).
- **Family Reunion** (B): siblings that miss circle you, eating enemy shots, and relaunch; they last until they hit.
- **Only Child** (C): one sibling per volley at ×6 damage; it pierces everything and keeps homing until it has killed 5.

---

# Notes and open points

1. **Rule changes needed before code:** Shared Trauma (statuses copied between linked enemies) and Snotwork's strand pull need lines in the matrix. Weapon marks (Marked for Bonking, Shell Game cracks, Unfinished Business, Bad Aftertaste, Meat Grinder) need one shared rule saying what a weapon mark is.
2. **Attack-type changes (5):** Lv 6 cards More Is More (to Burst), Dead Pixels (to Spread), Flash in the Pan (to Burst) and Big Bang, Eventually (its leftover well is a Pool); mastery Projectile Vomit (to Beam). Premature Evacuation stays a Burst but becomes self-centred.
6. **Masteries that break a shared cap** (flagged so they are a deliberate exception): Zombie Apocalypse (pets cap 12.3), Scorched Route (40-object cap), Chain of Command (chain depth 6, 12.5), Infinite Nuts (12 hits per shot), Baby Boom for Sister Cousin (24 in flight). Each needs a matrix line before code.
3. **No damage-type changes.** `MODIFIERS.md`'s "it never changes the attack's damage type" stands.
4. **Nappy Mines is Fire from the start** (user, 18 Oct). Its patch is a Fire Pool footprint, not an Acid Pool. Acid now has one weapon (Acid Spit).
5. **Untested:** no number has been simulated.
