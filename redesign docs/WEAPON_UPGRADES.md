# Weapon Upgrades (first branch)

**Status: working proposal, 18 Oct 2026. Docs only.** Numbers are starting points for sims. Roster: `BASE_WEAPONS.md`. Rules: `COMBAT_MATRIX.md` (cited as 11.x and 12.x), `MODIFIERS.md`.

## How the branch works

- Every weapon forks at **Lv 3, Lv 6 and Lv 10**. Each fork is its own screen with **three cards**; pick one, the other two are gone for the run. That is 9 upgrades per weapon, 216 in all.
- **Replaces** the old weapon rule in `UPGRADES.md` (forks at Lv 5 and 10 with two cards).
- **Lv 3 is a tweak** (a modifier or a number). **Lv 6 is a behaviour** (a new way the weapon works). **Lv 10 is the mastery** (signature-scale; only one weapon a run reaches Lv 10).
- **The three cards at a fork differ in direction**, not just size: usually reach or power, control or utility, and a riskier or stranger option.
- **Any combination is legal.** Every card works whatever was picked before it. Cards that pair well say so.
- **Changes of attack type** are tagged **[ATTACK to X]**. The new attack type then decides every defence rule (Evasion, Thorns; `COMBAT_MATRIX.md` 13). Used mostly at Lv 10.
- **Changes of damage type** are rare, always Lv 10, and tagged **[TYPE to X]**. The weapon takes the new type's statuses and reactions, and loses the old ones. Four exist in this document.
- No new statuses and no new ground objects. Pools and patches use the standard objects (11.6, 40-object cap); "footprint" means an attack area that reactions do not use.
- Every repeat, chain or spread is bounded (12.5). Copied or shared damage is echo damage (12.1).

---

# The 10 foundations

## 1. Nut Shot (Force, Projectile)
**Lv 3**
- **Double Dip:** a rapid volley of 2 shots, 70% damage each.
- **Cracked Shell:** pierces 2 enemies (15% lost per enemy).
- **Hard Nut:** every 4th shot is a heavy hit (knocks off a Shell layer) for +50% damage.

**Lv 6**
- **Pinball:** after a hit the shot jumps to 2 more enemies (chaining, 70% falloff).
- **Second Helping:** the shot flies back to you after full range, hitting again on the way (returning).
- **Follow Through:** knockback doubled, and an enemy knocked into a wall or another enemy takes +40% collision damage.

**Lv 10**
- **Nut Cannon:** unlimited pierce in a straight line, no damage lost per enemy, builds double Poise.
- **Mixed Nuts [ATTACK to Spread]:** fires 5 pellets in a 40° cone, 40% damage each.
- **Blue Nuts [TYPE to Static]:** the shot is Static: it Charges what it hits and chains (3 jumps). Loses Poise and knockback, gains Static's reactions.

## 2. Spray Gun (Force, Spread)
**Lv 3**
- **Choke:** the cone halves in width; +30% damage.
- **Extra Pellets:** +3 pellets, cone 20% wider.
- **Kick:** recoil lunges you back 80 units on each volley; knockback +50%.

**Lv 6**
- **Through and Through:** every pellet pierces 1 enemy.
- **Two-Stage:** two volleys 0.15 s apart (rapid volley).
- **Full Circle:** every 4th volley is fired all the way round you (every Nth, self-centred).

**Lv 10**
- **Slug [ATTACK to Projectile]:** the pellets fuse into one heavy slug (90% of their total damage), pierces 3, counts as a heavy hit.
- **Point Blank:** pellets that hit within 100 units of you deal ×2 (scaling by distance, capped ×2).
- **Boomerang Spray:** pellets fly out, then return, hitting again at 60% (returning).

## 3. Nutcracker (Force, Contact)
**Lv 3**
- **Wider Jaws:** the clamp reaches 35% further and wider.
- **Body Check:** each clamp lunges you up to 100 units into the target.
- **Concussion:** each clamp builds double Poise.

**Lv 6**
- **Double Crack:** after a clamp, it jumps to the nearest other enemy within 110 and clamps again (2 jumps, 70% falloff).
- **Two-Bite:** a second clamp 0.2 s after the first.
- **Brace for Impact:** each clamp gives you a small Membrane (5% max health, 2 s), at most once a second.

**Lv 10**
- **Nutcracker Suite:** two jaws orbit you at radius 60 and clamp whatever they pass (orbiting).
- **Cracked Open [ATTACK to Burst]:** the clamp becomes a shockwave of radius 80 at the target. No more Thorns damage taken; Evasion no longer applies.
- **Through-Line:** the lunge goes 160 units through everything in its path, hitting all of it. You cannot be hit mid-lunge.

## 4. Premature Detonation (Force, Burst)
**Lv 3**
- **Hair Trigger:** the swell is twice as fast.
- **Bigger Bang:** radius +35%.
- **Double Pump:** a second pulse 0.3 s later at 60% damage.

**Lv 6**
- **Time Delay:** the blast is placed on the densest cluster and goes off 1 s later (delayed detonation, marked on the ground).
- **Pressure Knot:** before it goes off, a small gravity well pulls enemies in for 0.5 s (Pull rule 12.2).
- **Panic Release:** a self-centred pulse also goes off when you are hit (once per 6 s).

**Lv 10**
- **Daisy Chain:** an enemy killed by the blast sets off a smaller blast (50% radius) where it died. Depth 2.
- **Big Finish:** every 5th blast has ×2 radius and ×3 damage (every Nth).
- **Pent Up:** radius and damage grow with time since the last blast, up to +100% after 3 s (growing).

## 5. Acid Spit (Acid, Projectile)
**Lv 3**
- **Thick Glob:** a bigger glob; +40% Corrosion per hit.
- **Splash Zone:** the impact splashes enemies within 40 for 50% Corrosion.
- **Spit Take:** the glob pierces 2 enemies.

**Lv 6**
- **Triple Threat:** a rapid volley of 3 globs.
- **Residue:** the landing spot leaves a small Acid Pool (radius 40, 2.5 s).
- **Aimed Spit:** the glob homes in (turn rate 3).

**Lv 10**
- **Acid Lake [ATTACK to Pool]:** lobbed puddles of radius 60 that last 4 s. No Evasion against it.
- **Contagion:** when an enemy dies, its Corrosion bar passes to the nearest enemy (one jump, never retriggered).
- **Acid Rain:** every 4th spit bursts into 6 droplets in a fan at 40% damage each (every Nth).

## 6. Blue Screen (Static, Beam)
**Lv 3**
- **Wide Display:** the beam is 40% wider and 25% longer.
- **Overclock:** +30% damage per tick.
- **Packet Burst:** every 1.5 s a pulse runs down the beam for ×4 damage on the last enemy it reaches.

**Lv 6**
- **Screen Saver:** the beam slowly rotates through 360° (sweep).
- **Second Monitor:** a second beam fires out at 45° to the first.
- **Arc Fault:** the beam's far end chains onward (3 jumps, 70% falloff). This is the only version that forks.

**Lv 10**
- **Fatal Error:** after 3 s on one target, it takes one ×5 hit and a Poise interrupt; the beam then cools for 1 s.
- **Dual Anchor:** the beam is anchored between two enemies instead of fired from you (anchored beam).
- **Power Cycle:** every 8 s the beam cuts out for 1 s, then returns at 3× width and ×2 damage for 2 s (every Nth, by time).

## 7. Snot Trap (Mucus, Pool)
**Lv 3**
- **Thick Rim:** radius +35%, lasts 1.5× as long.
- **Stretch Armstrong:** enemies leaving the trap are tugged back towards its centre once per 1.5 s (Pull rule).
- **Double Dollop:** lays two traps side by side.

**Lv 6**
- **Slingshot:** the trap is lobbed at the densest cluster instead of laid at your feet (lobbed).
- **Crowd Control:** two Snared enemies that touch inside the trap become Conjoined (groups of 3 at most).
- **Cold Parcel:** the trap is laid as a trail while you swim (trail modifier).

**Lv 10**
- **Glue Factory:** an enemy Snared for 3 s straight is held solid for 1.5 s (once per enemy per 4 s).
- **Mucus Geyser [ATTACK to Burst]:** the trap erupts every 3 s for 150% damage over its whole area, re-Snaring everything in it. No longer a standing patch.
- **Moat:** the trap rides with you as a ring of radius 80 (self-centred).

## 8. Red Needle (Blood, Projectile)
**Lv 3**
- **Hypodermic:** pierces 2 enemies; each hit applies Bleed.
- **Sharps:** a rapid volley of 3 needles.
- **Blood Draw:** a needle that kills a bleeding enemy heals you 1% of max health (Extraction limits apply).

**Lv 6**
- **Acupuncture:** each needle landing on the same enemy adds +15% to the next, up to +60% (growing).
- **Multiple Choice:** each needle in a volley homes on a different target.
- **Pincushion:** needles stay in the enemy; after 3 s they pop for 50% of the total they dealt (delayed detonation).

**Lv 10**
- **Vein Glory:** a needle that hits a bleeding enemy under 20% health kills it outright (elites 10%, bosses never).
- **Phlebotomy [ATTACK to Beam]:** a thin continuous needle beam. Bleed builds as normal; no Evasion against it.
- **Bleed Them Dry:** enemies that die bleeding leave a blood pool twice as large that lasts twice as long.

## 9. Ghost Load (Soul, Projectile)
**Lv 3**
- **Afterimage:** the orb leaves a ghost behind at the first enemy hit; it hits again for 50%.
- **Haunting:** fills the Soul bar 50% faster.
- **Pass Through:** the orb goes through 2 enemies (pierce 2) and ignores walls.

**Lv 6**
- **Come Back Here:** the orb turns round at full range and returns (returning).
- **Echo Chamber:** every 3rd load fires 3 ghosts in a tight fan (every Nth).
- **Spirit Guide:** the orb homes in (turn rate 3).

**Lv 10**
- **Mass Haunting [ATTACK to Burst]:** the orb bursts at its first target (radius 90) and fills the Soul bar of everything in range.
- **Wraith Lane [ATTACK to Beam]:** a continuous spectral beam. No Evasion against it.
- **Dead Reckoning:** an enemy killed by Ghost Load releases a new ghost at 60% damage (once; the new ghost never releases another).

## 10. Hot Mess (Fire, Pool)
**Lv 3**
- **Spreading Rumour:** radius +35%.
- **Fuel Line:** burns 1.5× as long.
- **Hot Spot:** the Burn bar fills 50% faster inside it.

**Lv 6**
- **Slingshot:** the patch is lobbed at the densest cluster (lobbed).
- **Double Mess:** two patches per throw, side by side.
- **Slow Burn:** the patch creeps towards the nearest enemy at 20 units per second.

**Lv 10**
- **Flashpoint:** when the patch burns out, it flares once: everything inside takes a full Ignition.
- **Acid Reflux [TYPE to Acid]:** a sick puddle instead of a fire: builds Corrosion and strips Shell. It is a standard Acid Pool.
- **Merging Mess:** patches that touch merge into one up to radius 100, timer reset once per merge (12.7).

---

# The 14 signatures

Starting points are the shipped masteries and forks (`data.js`), rewritten to the matrix.

## 11. Black Hole (Force, Projectile, gravity well)
**Lv 3**
- **Event Horizon:** well radius +30%, pulls 25% harder.
- **Nom Nom:** the orb eats enemy shots it touches (12.8) and grows with each, up to 2× its size.
- **Slingshot:** your other weapons' shots bent by the orb leave it 25% faster and +25% damage.

**Lv 6**
- **Choking Hazard:** non-boss enemies under 20% health dragged to the centre are swallowed whole.
- **Grasp Reflex:** the longer an orb holds an enemy, the harder it squeezes, up to ×2 after 2 s (growing).
- **Naughty Step:** the orb parks where it catches 4 enemies, pulls 2× harder and lasts 2× longer.

**Lv 10**
- **Big Bang:** when an orb ends it explodes (a Burst) for 50% of all the damage it dealt.
- **Singularity [ATTACK to Pool]:** the orb stops at full range and becomes a standing well of radius 140 for 6 s. No merging.
- **Lensing:** shots bent by an orb split in two (50% each, once, never again).

## 12. Meat Missile (Force, Burst, collisions)
**Lv 3**
- **Dripping:** +1 dollop per throw.
- **Picking Up the Spare:** bowled enemies take +50% collision damage.
- **Heavy Load:** dollops are 25% bigger and knock 30% harder.

**Lv 6**
- **Perfect Game:** each flying enemy knocks the next one on, and so on to depth 3 (up from 2).
- **Wall Flower:** an enemy knocked into a wall takes ×2 collision damage and is staggered.
- **Pinball Wizard:** bowled enemies rebound off the first wall once and carry on.

**Lv 10**
- **Bowling Alley [ATTACK to Beam]:** a lane 40 wide: everything in it is launched forward. No Evasion.
- **Human Cannonball:** the first enemy hit explodes where it lands (Burst, 60% damage; one explosion per throw).
- **Meat Shower [ATTACK to Spread]:** each throw sends 5 smaller missiles in a cone, each with its own knockback.

## 13. Placental Siphon (Force, Projectile)
**Lv 3**
- **Bullet Buffet:** +40% absorb radius; each bullet eaten heals you a little (6 health per second cap).
- **Trust Fund:** returned shots hit +2% harder per bullet stored, up to +80%.
- **Big Gulp:** the store holds 16 bullets instead of 10.

**Lv 6**
- **Return to Sender:** returned shots home on whoever fired them and hit that enemy ×2.
- **Spread the Love:** every returned shot splits into three at 45% damage (Spread).
- **Padded:** each stored bullet adds a little Membrane (1% max health, up to 10%).

**Lv 10**
- **Mirror Womb:** 30% of enemy shots that reach you bounce back at whoever fired them.
- **Let-Down Reflex [ATTACK to Burst]:** when the store fills, it all bursts out in a ring of returned bullets.
- **Hollow Point [ATTACK to Beam]:** spends the whole store at once as a lane, damage equal to the total stored.

## 14. Nappy Mines (Acid, Burst, delayed)
**Lv 3**
- **Domino Nappies:** a blast sets off nearby mines, 3 in the chain at most, each 25% bigger.
- **Sticky Nappies:** mines are thrown onto enemies and stick, going off 1.2 s later.
- **Pebbledash:** every mine also fires 8 shrapnel shots at the nearest enemy (25% damage each).

**Lv 6**
- **Learning to Crawl:** mines crawl after the nearest enemy (homing).
- **Blowout:** the Acid Pool left by each blast is 40% larger and lasts twice as long.
- **Tripwire:** mines come in linked pairs; an enemy crossing the line between them sets both off.

**Lv 10**
- **Nuclear Nappy:** every 6th mine is a nuke: ×3 radius, ×6 damage (one Burst; its Pool is normal size).
- **Minefield:** three mines per drop, twice as often, lasting twice as long.
- **Hot Nappies [TYPE to Fire]:** blasts ignite instead of corroding: they fill the Burn bar, radius +30%, no Acid Pool.

## 15. Twin Telepathy (Static, Beam, anchored)
**Lv 3**
- **Joined at the Hip:** the beam is twice as wide and Snares what it touches.
- **Switcheroo:** every 6 s you swap places with your twin, hitting everything along the path. You cannot be hit mid-swap.
- **Same Wavelength:** the beam destroys enemy Projectile and Spread shots that cross it (12.8).

**Lv 6**
- **Sympathetic Pain:** when you are hurt, your twin's end erupts (Burst, 300% damage, at most every 1.5 s).
- **Crossed Wires:** each end of the beam chains onward (2 jumps, 70% falloff).
- **Long Distance:** range 520 up to 700; damage grows with beam length, up to +100% (growing).

**Lv 10**
- **Quadruplets:** two more twins, each with its own beam, fanning out through the crowd.
- **Psychic Link:** every 2 s a pulse runs along the beam for 200% damage to everything on it, tagged Poise so it can interrupt.
- **Live Wire [ATTACK to Pool]:** the beam is gone; instead the line you sweep stays charged for 3 s, hitting what crosses it.

## 16. Static Cling (Static, Projectile, chaining)
**Lv 3**
- **Short Circuit:** +3 jumps, and the chain may bounce back to an enemy already hit once (6 jumps at most).
- **Longer Leash:** jump range 110 to 170; falloff 70% to 80%.
- **Static Shock:** the last enemy in each chain takes a Poise hit and may be interrupted.

**Lv 6**
- **Party Balloon:** every 4th bolt leaves a ball of static on its target that zaps nearby enemies every 0.5 s for 3 s.
- **Grounded:** each chain heals you 1% of max health per enemy hit (6 health per second cap).
- **Lightning Rod:** Charged enemies take +40% Static damage (up from +20%) and pass on one extra arc.

**Lv 10**
- **Worked Up:** every jump hits 20% harder than the last, instead of weaker.
- **Tumble Dryer:** 15% of hits from all your other weapons start a Static Cling chain (once per 0.3 s).
- **Thunderhead [ATTACK to Burst]:** every 5th bolt calls a strike on the densest cluster (radius 80) and Charges everything in it.

## 17. Sticky Situation (Mucus, Projectile, shared damage)
**Lv 3**
- **In Triplicate:** every bundle tapes 3 more enemies (up to 6).
- **Stapled:** bundles are pulled tight and the members are Snared harder (slowed 40%).
- **Redacted:** taped enemies cannot shoot.

**Lv 6**
- **Joint Liability:** when a taped enemy dies, the rest of its bundle takes 30% of its max health (echo damage).
- **Forwarded:** when a taped enemy dies, its tape jumps to the nearest untaped enemy (once).
- **Fine Print:** the share rises from 35% to 50% (echo damage).

**Lv 10**
- **Bureaucracy:** bundles share 70% of every hit.
- **Referred Elsewhere:** when a bundle runs out, the four nearest enemies are taped for free.
- **Class Action [ATTACK to Burst]:** when a bundle ends, the tape snaps taut: a Burst of radius 90 at its centre for 150% of the damage shared.

## 18. Blowing Bubbles (Mucus, Projectile, traps)
**Lv 3**
- **Extra Soapy:** bubbles hold enemies twice the size, elites included (never bosses).
- **Bubble Bath:** a pop Snares everything in it for 3 s and leaves a Mucus patch.
- **Bubble Wrap:** +2 bubbles per shot.

**Lv 6**
- **Cannonball:** a pop launches the trapped enemy away from the popper; it bowls through its friends and bursts where it lands.
- **Chain Pop:** a pop sets off every other bubble in reach, one after another (depth 3).
- **Hamster Ball:** trapped enemies roll at the nearest other enemy and pop on it.

**Lv 10**
- **Cotton Wool:** every 8 s you are wrapped in a bubble that blocks your next 3 hits.
- **Big Bubble:** one huge bubble (radius 120) that traps up to 8 small enemies together and pops for 200% (a Burst).
- **Bubble Field [ATTACK to Pool]:** the shot bursts into a drifting cloud of bubbles for 5 s; small enemies that touch it are trapped.

## 19. Due Date (Blood, Projectile, mark)
**Lv 3**
- **Overdue:** the countdown is 6 s (up from 4) and the repeat 55% (up from 40%).
- **Early Delivery:** a marked enemy under 30% health goes off at once.
- **Twins:** two marks per shot, on the two toughest targets.

**Lv 6**
- **Baby Shower:** when a date goes off, half of it splashes onto everything nearby (echo damage).
- **Rebooked:** when a date goes off, the two nearest enemies are marked for free.
- **Contractions:** the marked enemy takes Bleed hits once a second until it goes off.

**Lv 10**
- **Labour Day:** a date that goes off marks the same enemy again at once (twice at most per enemy).
- **The Big Day:** marked enemies take +30% damage from everything you own (not echo damage).
- **Passing the Baton:** if a marked enemy dies, the mark and its stored damage move to the nearest enemy (once).

## 20. Seeker Siblings (Blood, Projectile, homing)
**Lv 3**
- **Big Brother:** one sibling per volley is huge: ×4 size and damage, pierces 3.
- **Sibling Rivalry:** every kill adds a sibling to your volleys, up to +8; reloading resets it.
- **One Each:** every sibling in a volley picks a different target.

**Lv 6**
- **Little Terrors:** siblings explode on hitting, 70% damage in a small blast.
- **Blood Relatives:** siblings pierce 1 and apply Bleed to everything they pass through.
- **Family Reunion:** siblings that miss swim back and circle you, eating enemy shots (12.8), then launch again.

**Lv 10**
- **Baby Boom:** every sibling splits into two on its first hit (not only on a kill). At most 12 in flight, split siblings never split.
- **Natural Selection:** siblings home on the lowest-health enemies and finish anything under 15%.
- **Dynasty:** a sibling still alive after 5 s grows up: ×2 damage and size, pierce 2 (growing).

## 21. Peekaboo (Soul, Burst, Fear)
**Lv 3**
- **Hide and Seek:** you swim 40% faster while hidden.
- **Jump Scare:** the BOO freezes enemies stiff for 1.2 s instead of sending them fleeing (not bosses).
- **Long Count:** hidden for 2.6 s (up from 1.8); the BOO bonus caps at 7 searching enemies instead of 10.

**Lv 6**
- **Who's There?:** while you are hidden, enemy shots hit other enemies for ×3.
- **Decoy Doll:** a doll stays where you vanished for 4 s; enemies keep attacking it; it bursts for BOO damage at the end (delayed detonation).
- **Possessive:** the BOO also adds 50% of a Soul bar to everything it hits.

**Lv 10**
- **Big Boo:** the BOO reaches everything on screen and the Fear lasts twice as long.
- **Surprise!:** you reappear at the densest cluster and the BOO goes off there.
- **Camper:** your other weapons keep firing while you are hidden, at +30% damage.

## 22. Tooth Fairy (Soul, Burst, lures)
**Lv 3**
- **Gold Tooth:** every 4th tooth is gold: it lures from twice as far, and whoever takes it is smitten along with everything within 90.
- **Wisdom Teeth:** teeth lure from 60% further and last twice as long.
- **Baby Teeth:** up to 5 teeth on the ground (up from 3); each smite does 30% less.

**Lv 6**
- **Under the Pillow:** a tooth nobody takes within 4 s turns into a large XP coin.
- **Dentures:** teeth bite anything that comes close, 50% damage every half second.
- **Tooth Decay:** an enemy holding a tooth takes +12% from everything per tooth, up to +36%.

**Lv 10**
- **Fairy Ring:** every smite also hits everything within 140 of the victim for 50%.
- **Possession Fee:** a smite fills the victim's Soul bar at once, so it is Possessed (once per enemy; bosses get reduced).
- **Hollow Tooth [ATTACK to Projectile]:** teeth are thrown as homing shots at the nearest enemy instead of left as lures.

## 23. Tapeworm Seeder (Soul, Projectile)
**Lv 3**
- **Up and About:** undead last 12 s (up from 6).
- **Big Worm:** undead hit 50% harder.
- **Feeding Tube:** each infected enemy that dies heals you 1% of max health (6 health per second cap).

**Lv 6**
- **Eating for Two:** undead hit twice as hard.
- **Carrier:** an infected enemy infects the first enemy it touches (once per enemy).
- **Rapid Infection:** a rapid volley of 3 shots; infection lasts 12 s (up from 8).

**Lv 10**
- **Brood:** every infected death infects the 3 nearest enemies (depth 2 at most).
- **Adopted:** elites killed while infected become permanent allies (3 at most; they count towards the pets cap).
- **Hatchery [ATTACK to Pool]:** an infected corpse becomes a worm nest for 5 s that infects whatever steps in and spawns an undead (pets cap applies).

## 24. The Runs (Fire, Pool, trail)
**Lv 3**
- **Long Run:** trail pieces last twice as long.
- **Closing the Loop:** swim a loop round enemies and everything inside takes a full Burn bar at once (pairs with ORBIT autorun).
- **Slipstream:** swimming through your own trail gives +35% swim speed and 25% less damage taken.

**Lv 6**
- **Hot Stuff:** the Burn bar fills 50% faster; the Ignition flare is 40% bigger.
- **Patient Zeroes:** two ghost carriers circle you, each shedding its own trail (orbiting).
- **Smoke Screen:** enemy Projectile and Spread shots crossing the trail burn up (12.8).

**Lv 10**
- **Fever Trail:** the faster you swim, the hotter it burns, up to ×2 (scaling).
- **Backdraft [ATTACK to Burst]:** when you stop, the whole trail ignites at once: one Ignition per enemy standing on it.
- **Gastric Distress [TYPE to Acid]:** the trail turns corrosive: it builds Corrosion and strips Shell. Pieces are standard Acid Pools.

---

# Notes and open points

1. **Type changes (4):** Nut Shot to Static, Nappy Mines to Fire, Hot Mess to Acid, The Runs to Acid. Each changes which reactions the weapon feeds; none breaks a rule. The Runs and Hot Mess both reaching Acid is deliberate: Acid is the thinnest Fire-adjacent Shell stripper.
2. **Attack-type changes (20):** Burst 7, Pool 5, Beam 4, Spread 2, Projectile 2. Beam and Burst are the types the roster is short of; Contact gets none (Nutcracker keeps its own).
3. **Rules this document overrides:** `UPGRADES.md` 6 (weapon forks at Lv 5 and 10, two cards) and `MODIFIERS.md` ("a fork never changes damage type"). Neither doc is edited yet.
4. **Not checked by sim:** every number is untested. Likely first problems: Sticky Situation Lv 10 stacking with Joint Liability; Static Cling Tumble Dryer with several signatures; Peekaboo Camper.
5. **Cards that need a rule line in the matrix before code:** Switcheroo and Through-Line (invulnerable mid-lunge), Passing the Baton, Dead Reckoning, Hatchery.
