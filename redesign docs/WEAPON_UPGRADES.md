# Weapon Upgrades (first branch)

**Status: working proposal, 18 Oct 2026 (second draft). Docs only.** Numbers are starting points for sims. Roster: `BASE_WEAPONS.md`. Rules: `COMBAT_MATRIX.md` (cited as 11.x and 12.x), `MODIFIERS.md`, autorun modes in `AUTORUN_AUTOAIM.md`.

## How the branch works

- **Lv 3: pick a promise.** Three cards, each a different answer to "how will this weapon play from now on?" The other two are gone for the run.
- **Lv 6 and Lv 10: the promise grows.** Each promise has its own Lv 6 and Lv 10 step. Lv 6 adds a new behaviour that leans further into the promise; Lv 10 (the mastery: one weapon a run) adds the signature-scale behaviour. Neither is a plain number bump.
- 3 promises × 3 steps = 9 upgrades per weapon, 216 in all.

## Design rules for every branch

1. **A promise changes what the player wants to do** (where to swim, what to target, when to commit), not how much damage a number says.
2. **Autorun modes find different openings.** No card requires a mode. Each path notes which modes suit it: KITE (long trails, traps, range), ORBIT (circles, repeated contact), COLLECT (moving through drops), HUNT (focus fire on one target), HOLD (letting enemies come), NEST (fighting round the egg).
3. **Identity first.** Each signature deepens its own fantasy. Sticky Situation shares damage; Static Cling chains; Tapeworm Seeder builds an army. They do not converge on generic chain reactions.
4. **Visible in combat.** Every path has a **Shows** line: what the player sees that proves the choice is working.
5. **Trade-offs.** Where a path gives something, its **Costs** line says what it takes away. Not every path is strictly better.
6. **Damage type never changes** through an upgrade. Attack type can change, rarely and mostly at Lv 10, tagged **[ATTACK to X]**; the new attack type then decides the defence rules (Evasion, Thorns; matrix 13).
7. No new statuses and no new ground objects. Weapon marks (a visible tag a weapon puts on an enemy for its own use, like Due Date's countdown) are allowed; they are not statuses and no reaction reads them. Pools are standard objects (11.6) or footprints (attack areas no reaction uses). Every repeat is bounded (12.5); copied damage is echo damage (12.1).

---

# The 10 foundations

## 1. Nut Shot (Force, Projectile)
**A. Ricochet Brain: play into packed groups.**
- Lv 3: after a hit, the shot bounces to the nearest enemy within 110 (2 bounces, 80% damage each time).
- Lv 6: a bounce that hits an enemy already knocked back by this shot slams them together: both take a collision hit.
- Lv 10: the last bounce of each shot is a heavy hit (knocks off a Shell layer) and bounces once more.
- Costs: the first hit is 15% weaker. Shows: a pale zigzag linking the bounces. Modes: ORBIT keeps a tight group in front of you.

**B. Through and Through: line the crowd up.**
- Lv 3: pierces up to 4 enemies; each one after the first takes +15% more than the last.
- Lv 6: the shot speeds up with every enemy it passes through; a shot that clears 4 grows to double size.
- Lv 10: a shot that pierces 5 or more leaves a shock lane behind it for 0.5 s that knocks back anything crossing it.
- Costs: lower fire rate (−20%). Shows: the pellet visibly grows and its trail thickens per enemy. Modes: KITE lines pursuers up behind each other.

**C. Marked for Bonking: focus fire.**
- Lv 3: every 4th hit on the same enemy marks it (a dented-nut icon); the next Nut Shot on a marked enemy is a heavy hit for ×2.5.
- Lv 6: a marked enemy also takes +20% from your other weapons until the bonk lands.
- Lv 10: the bonk staggers the target (full Poise bar) and knocks off a Shell layer; elites take it every 3rd hit instead of 4th.
- Costs: the shot no longer switches targets while one is marked. Shows: the dent icon fills in quarters; the bonk has a big thwack frame. Modes: HUNT, which already locks one target.

## 2. Spray Gun (Force, Spread)
**A. Shotgun Wedding: get close and commit.**
- Lv 3: the cone tightens to a third of its width; pellets that land within 120 units deal +60%.
- Lv 6: a point-blank volley (every pellet hits one enemy) knocks it back hard and pushes you back 60 units (recoil lunge).
- Lv 10: every 3rd volley fuses into a single slug that pierces 3 and is a heavy hit.
- Costs: almost nothing lands beyond 200 units. Shows: a dense pellet ball and a recoil kick on the sperm. Modes: HUNT and ORBIT close the gap; KITE wastes it.

**B. More Is More: cover the screen.**
- Lv 3: +5 smaller pellets (60% damage each) across a 50% wider fan.
- Lv 6: pellets that miss carry on to full range and split once into 2 (40% damage).
- Lv 10 [ATTACK to Burst]: every 4th volley fires all the way round you as a ring of pellets.
- Costs: poor single-target damage; bosses shrug it off. Shows: a wide fan of tiny pips, then a full ring. Modes: ORBIT keeps a crowd in the fan; COLLECT clears a path through gems.

**C. Get Off Me!: shove them about.**
- Lv 3: pellets knock back; an enemy hit by 3 or more pellets in one volley is shoved twice as far.
- Lv 6: an enemy shoved into another enemy or a wall takes a collision hit, and so does what it hit.
- Lv 10: a shove that causes a collision also knocks the second enemy on (depth 2), so one volley can scatter a group.
- Costs: −15% damage per pellet. Shows: enemies tumble away and bump into each other. Modes: KITE and HOLD keep space clear; NEST keeps the egg free.

## 3. Nutcracker (Force, Contact)
**A. Vice Grip: hold them and get out.**
- Lv 3: each clamp holds the enemy in place for 0.4 s.
- Lv 6: while an enemy is held, your swim speed is +25% and enemy shots aimed at you lose track for the same 0.4 s.
- Lv 10: a held enemy can be clamped into a neighbour: the clamp swings it into the nearest enemy for a collision hit on both.
- Costs: one clamp per 0.8 s (slower). Shows: the jaws visibly stay shut round the enemy. Modes: KITE uses the hold to escape; NEST stops attackers reaching the egg.

**B. Shell Game: crack the tough ones.**
- Lv 3: every 3rd clamp on the same enemy knocks off a Shell layer; an enemy with no Shell instead gets a crack mark: +15% damage from you, up to +45%.
- Lv 6: a cracked enemy leaks: your clamps on it splash 30% onto the enemies touching it.
- Lv 10: when the last Shell layer comes off, the enemy is staggered and takes a ×3 clamp.
- Costs: it does nothing extra to enemies you don't stay on. Shows: visible cracks spreading across the target. Modes: HUNT keeps you on one enemy.

**C. Back Off!: answer the first one in.**
- Lv 3: the first clamp on each enemy that enters range is a counter-strike: ×2 damage and heavy knockback (each enemy once per 4 s).
- Lv 6: a counter-struck enemy knocked into another enemy knocks it back too.
- Lv 10: when 3 or more enemies enter range within 1 s, the jaws snap all of them at once in a ring (self-centred).
- Costs: later clamps on the same enemy are 20% weaker. Shows: a big star thump and enemies flung clear. Modes: HOLD and NEST let enemies come to you.

## 4. Premature Detonation (Force, Burst)
**A. Bigger Bang Theory: clear the crowd.**
- Lv 3: radius +40%, and the outer edge hits harder than the centre (+30% at the rim).
- Lv 6: the blast aims at the densest cluster's edge, so the rim lands on the most enemies.
- Lv 10: every 4th blast has a second, larger ring 0.3 s later (double radius, 60% damage).
- Costs: −20% damage at the centre. Shows: a fat shockwave with a bright rim. Modes: ORBIT keeps clusters in range.

**B. Chain Reaction: cascades.**
- Lv 3: an enemy killed by the blast sets off a small blast (40% radius, 50% damage) where it died.
- Lv 6: chain blasts can kill too, and those kills chain once more (depth 3 at most).
- Lv 10: a chain of 3 or more ends in one big blast at the last link (full radius, 100%).
- Costs: −15% base damage, so the payoff needs kills. Shows: pops rippling outwards through the crowd. Modes: COLLECT benefits from gems spilled across a wide area.

**C. Premature Evacuation: make room.**
- Lv 3: survivors are launched away from the centre; the more damage dealt, the further they fly.
- Lv 6: a launched enemy that hits another enemy or a wall takes a collision hit, and so does what it hits.
- Lv 10: blasts go off around you instead of at a target [ATTACK stays Burst, self-centred], launching everything near outward.
- Costs: no extra damage; the payoff is space and collisions. Shows: enemies flung outwards in a ring. Modes: KITE and NEST, which want enemies kept away.

## 5. Acid Spit (Acid, Projectile)
**A. Spit Take: stay on one target.**
- Lv 3: Corrosion builds 50% faster; the fuller a target's Corrosion bar, the more Acid damage it takes (up to +40% when full).
- Lv 6: when a full bar strips a Shell layer, the bar resets only halfway.
- Lv 10: a target that loses its last Shell layer to Acid Spit takes ×2 damage from your Acid Spit for 4 s.
- Costs: the glob no longer re-targets until its target dies. Shows: a fizzing coat that thickens on the target. Modes: HUNT.

**B. Splash Damage: precise shots, messy results.**
- Lv 3: a direct hit splatters 3 droplets onto enemies within 60 (30% damage, 30% Corrosion).
- Lv 6: droplets that hit an enemy already carrying Corrosion splatter once more.
- Lv 10: every 5th spit lands as a lobbed glob that leaves an Acid Pool (radius 50, 3 s).
- Costs: −15% damage on the direct hit. Shows: visible droplets arcing off the target. Modes: ORBIT keeps a group bunched.

**C. Bad Aftertaste: the death spreads it.**
- Lv 3: each hit leaves an acidic residue mark on the target; when it dies, the residue splashes enemies within 70 with its Corrosion bar.
- Lv 6: the splash also leaves a small Acid Pool where it died (radius 35, 2 s).
- Lv 10: enemies hit by a splash carry their own residue mark, so the next death splashes again (depth 3).
- Costs: no help against the target itself. Shows: green-pink drips on marked enemies, a splat on death. Modes: COLLECT swims through the gems those deaths drop.

## 6. Blue Screen (Static, Beam)
**A. Overclocked: hold the line on one target.**
- Lv 3: damage grows the longer the beam stays on one target, up to +100% after 3 s; switching target resets it.
- Lv 6: at full charge the beam turns white and its hits carry Poise, so it can interrupt.
- Lv 10: at full charge, the target is Charged permanently while the beam holds, so your other weapons' arcs start from it.
- Costs: weak against crowds; every switch throws the charge away. Shows: the beam thickens and whitens as it charges, then snaps thin when switching. Modes: HUNT.

**B. Critical Error: hold it through a crowd.**
- Lv 3: an enemy killed by the beam emits a pulse (radius 60, 50% of one second's beam damage).
- Lv 6: a pulse that kills emits another (depth 3).
- Lv 10: every 10 kills, the next kill makes a full-screen flicker that Charges every enemy on screen.
- Costs: −10% beam damage. Shows: little static pops along the beam as enemies die. Modes: ORBIT keeps a crowd crossing the beam.

**C. Dead Pixels: wider, scrappier coverage.**
- Lv 3: every 0.5 s the beam glitches into 3 short parallel zaps either side of its line (50% damage each).
- Lv 6: the glitches leave dead pixels on the floor for 1 s that zap anything crossing them (footprint).
- Lv 10 [ATTACK to Spread]: the beam breaks up permanently into 7 short zaps fanned out in front of you.
- Costs: −30% damage on the main line. Shows: a jittery beam with sparks either side. Modes: KITE drags the glitches across pursuers.

## 7. Snot Trap (Mucus, Pool)
**A. Extra Strength Snot: slow everything.**
- Lv 3: Snared enemies crossing it move at 40% speed (from 60%) and stay slowed for 1.5 s after leaving.
- Lv 6: enemies leaving drag a strand behind them; the next enemy to cross the strand is Snared too.
- Lv 10: the trap grows by 10% every second something is Snared in it (up to double size).
- Costs: the trap lasts 25% less time. Shows: thick green drag lines and strands snapping back. Modes: KITE drags pursuers through it.

**B. Bogged Down: stick the dangerous ones.**
- Lv 3: an enemy that stays in the trap for 1.5 s is stuck in place for 1.5 s (once per enemy per 4 s).
- Lv 6: two stuck enemies close together become Conjoined (groups of 3 at most).
- Lv 10: stuck enemies cannot attack.
- Costs: one trap at a time. Shows: a stuck enemy sinks a little into the snot. Modes: HOLD and NEST, where enemies come to you.

**C. Snotwork: build a network.**
- Lv 3: traps within 200 of each other are joined by a stretchy strand; enemies crossing it are Snared.
- Lv 6: up to 4 traps can be down at once (from 2).
- Lv 10: an enemy crossing a strand is pulled along it to the nearest trap (Pull rule 12.2).
- Costs: each trap is 30% smaller. Shows: glistening strands between puddles, enemies twanging into them. Modes: KITE and ORBIT both lay traps across a wide area.

## 8. Red Needle (Blood, Projectile)
**A. Bleeding Heart: the long fight.**
- Lv 3: each hit adds a Bleed stack (cap raised to 6).
- Lv 6: an enemy at the Bleed cap leaks: each second it splashes 1 stack onto the nearest enemy.
- Lv 10: a bleeding enemy that dies leaves a blood pool twice as large, and enemies crossing it gain a Bleed stack.
- Costs: −30% direct damage. Shows: growing pulsing marks on the target, drips between enemies. Modes: KITE keeps you alive while the Bleed works.

**B. Needlework: thread the horde.**
- Lv 3: pierces up to 5 enemies; each one after the first takes +10% more than the last.
- Lv 6: a needle that pierces 3 or more leaves a thread between the first and last enemy: Bleed hits anything crossing it for 2 s.
- Lv 10: a needle that pierces 5 sews them together: they are pulled into a knot (Pull rule) and each takes a Bleed stack.
- Costs: fires 25% slower. Shows: a red thread trailing the needle through the line. Modes: KITE lines pursuers up.

**C. Final Prick: clean up.**
- Lv 3: +100% damage to enemies under 30% health.
- Lv 6: a kill by Red Needle fires a free needle at the next-weakest enemy within 300.
- Lv 10: a needle that hits a bleeding enemy under 15% health kills it outright (elites under 8%, never bosses).
- Costs: −25% damage to enemies above half health. Shows: a red pinprick flash and a ding on the finishing blow. Modes: COLLECT sweeps up the gems from the clean-up.

## 9. Ghost Load (Soul, Projectile)
**A. Ghost Through: pass through the crowd.**
- Lv 3: passes through up to 4 enemies; each one after the first takes 20% less.
- Lv 6: every enemy it passes through gains Soul build-up, so a long line fills several bars at once.
- Lv 10: when the ghost reaches full range it fades and re-forms at the start of its path, flying the same line again once.
- Costs: −15% damage to the first target. Shows: the ghost visibly passes through bodies, leaving a faint wisp in each. Modes: KITE lines pursuers up.

**B. Return to Sender: twice the haunting.**
- Lv 3: after its hit, the ghost fades, reappears and retraces its path back to you, hitting again (returning).
- Lv 6: on its way back it pulls a little of each enemy it passes towards you (Pull rule, weak).
- Lv 10: a Possessed enemy it passes on the way back is dragged along with it for 1 s, bumping its mates.
- Costs: the shot is 30% slower. Shows: a translucent ghost reversing along its trail. Modes: ORBIT keeps enemies on both legs of the path.

**C. Unfinished Business: they come back for their friends.**
- Lv 3: an enemy hit but not killed carries a haunting mark for 3 s; if it dies while marked, its spirit bursts out (radius 70, 60% damage, Soul build-up).
- Lv 6: the burst also marks the enemies it hits (depth 2).
- Lv 10: instead of bursting, the spirit of an elite or big enemy fights for you for 4 s (pets rule 12.3).
- Costs: −20% direct damage. Shows: a pale wisp orbiting marked enemies, then a ghostly puff on death. Modes: HUNT tags a big target; COLLECT enjoys the bursts.

## 10. Hot Mess (Fire, Pool)
**A. Hotter Mess: don't stand in it.**
- Lv 3: the longer an enemy stays inside, the faster its Burn bar fills (up to 3× after 2 s).
- Lv 6: an enemy that Ignites inside the patch makes the whole patch flare up for 0.5 s (+50% damage).
- Lv 10: the patch pulls enemies standing at its edge back in (Pull rule, weak).
- Costs: the patch is 20% smaller. Shows: the flames climb taller the longer someone stands in them. Modes: HOLD and NEST make enemies walk into it.

**B. Spreading Rumours: the fire leaves with them.**
- Lv 3: an enemy that walks out of the patch while Burning leaves a trail of small burning footprints for 1.5 s.
- Lv 6: those footprints fill Burn bars as fast as the patch does.
- Lv 10: an enemy that Ignites while trailing footprints drops a fresh small patch where it Ignites (once per enemy).
- Costs: the patch itself burns out 30% sooner. Shows: scorched footprints leading away from the patch. Modes: KITE makes pursuers walk through and out again.

**C. Flash in the Pan: short fuse, big finish.**
- Lv 3: patches last half as long, but when one expires it erupts in a burst (its full radius) that fills Burn bars by half.
- Lv 6: the eruption is aimed: it goes off early the moment 4 or more enemies stand in it.
- Lv 10 [ATTACK to Burst]: patches no longer burn at all; they are delayed blasts that erupt after 1 s, with double the radius.
- Costs: very little steady damage. Shows: the patch visibly swells and glows before it erupts. Modes: ORBIT gathers a crowd on top of it.

---

# The 14 signatures

## 11. Black Hole (Force, Projectile, gravity well)
**A. Event Horizon: nothing gets out.**
- Lv 3: the pull is much stronger near the centre (×2 within half the radius) and weaker at the edge.
- Lv 6: an enemy pulled into the centre is held there until the orb ends (bosses never; elites 1 s).
- Lv 10: when the orb ends, everything held is crushed together: one Burst with a collision hit for each enemy held.
- Costs: the outer pull is 30% weaker, so fewer enemies are caught. Shows: a dark core with enemies pinned on it. Modes: HOLD and NEST, where the orbs fill up with enemies coming at you.

**B. Orbituary: a moving hazard.**
- Lv 3: enemies near the orb orbit it instead of falling in.
- Lv 6: orbiting enemies collide with each other and with anything they swing into (collision hits both).
- Lv 10: when the orb ends, orbiting enemies are flung outwards in all directions as projectiles that knock back what they hit.
- Costs: the orb does 40% less damage of its own. Shows: a ring of enemies whirling round the orb. Modes: ORBIT keeps the crowd feeding the ring.

**C. Big Bang, Eventually: wait for it.**
- Lv 3: merged orbs gain power 50% faster, but each orb lasts longer and drifts slower (−30% speed).
- Lv 6: the merge count shows on the orb; at 3 merged it starts eating enemy shots (12.8).
- Lv 10: the supernova radius and damage scale with everything the orbs dealt (up to ×2), and it leaves a short standing well for 3 s [ATTACK to Pool for that well].
- Costs: slow, back-loaded damage. Shows: a growing, wobbling orb with a visible merge counter, then the supernova. Modes: KITE keeps you alive while it grows.

## 12. Peekaboo (Soul, Burst, Fear)
**A. Peek-a-Boom: punish the bait.**
- Lv 3: your false position explodes in a Soul burst (radius 90) when enemies reach it.
- Lv 6: the burst's size grows with the number of enemies that reached the spot.
- Lv 10: the false position stays for 4 s after you reappear and goes off a second time.
- Costs: the BOO itself is 30% weaker. Shows: a faint sperm-shaped outline that pops when crowded. Modes: KITE leaves the bait far behind.

**B. You Can't See Me: stay gone.**
- Lv 3: enemies searching the decoy stay confused 1 s longer; enemy shots aimed at you while hidden pass harmlessly through your old position.
- Lv 6: while hidden, you swim 40% faster and can pick up drops without breaking cover.
- Lv 10: while hidden, your other weapons keep firing, from where you actually are.
- Costs: the BOO is 40% weaker. Shows: shots passing through a ghost outline, enemies milling about. Modes: COLLECT uses the hidden time to sweep gems.

**C. Boo!: make them panic.**
- Lv 3: the BOO's Fear lasts 3 s (from 2) when you reappear within 150 of enemies.
- Lv 6: a fleeing enemy that bumps into another spreads Fear to it (once per enemy).
- Lv 10: Feared enemies that run into each other collide for a hit and drop their next attack.
- Costs: a shorter hide (1.2 s). Shows: enemies scattering and bumping into each other. Modes: HUNT reappears in the thick of it.

## 13. Twin Telepathy (Static, Beam, anchored)
**A. Long-Distance Relationship: sweep the whole arena.**
- Lv 3: the twin stays twice as far away; the beam is twice as long.
- Lv 6: the beam damage grows with its length, up to +60% at full stretch.
- Lv 10: the twin's end drags anything it touches along the beam towards you (Pull rule).
- Costs: much harder to keep the beam on one target. Shows: a long beam slashing across the screen. Modes: KITE and ORBIT both sweep it naturally.

**B. Toxic Codependency: drag it through the dense part.**
- Lv 3: each enemy the beam crosses in one sweep adds +10% to the beam for 2 s (up to +100%).
- Lv 6: at +100% the beam turns white and Charges everything it touches for 3 s.
- Lv 10: at +100% your twin swaps places with you along the beam, hitting everything on the line.
- Costs: −20% damage when crossing few enemies. Shows: the beam brightening step by step as it sweeps. Modes: ORBIT.

**C. Third Wheel: more geometry.**
- Lv 3: a Charged enemy struck by the beam throws a second, shorter beam to the nearest enemy for 1 s.
- Lv 6: up to 3 extra beams at once; each extra beam that crosses another makes a spark at the crossing that hits everything near it.
- Lv 10: a third anchor appears (another twin): the beams form a triangle and everything inside it is Charged.
- Costs: the main beam is 20% thinner. Shows: branching beams and crossing sparks. Modes: ORBIT and HUNT weave through clusters.

## 14. Tooth Fairy (Soul, Burst, lures)
**A. Pillow Tax: bait makes more bait.**
- Lv 3: every enemy smitten drops a tooth of its own.
- Lv 6: up to 6 teeth on the ground at once (from 3).
- Lv 10: when 3 teeth are taken within 1 s, the Fairy smites all three takers and everything between them.
- Costs: each smite is 25% weaker. Shows: teeth tumbling out of each smitten enemy. Modes: COLLECT and ORBIT keep you near the falling teeth.

**B. Sweet Tooth: steer the horde.**
- Lv 3: teeth lure from twice as far, and enemies chasing a tooth stop attacking you.
- Lv 6: teeth are dropped where you choose to be: they land on your swim path, 200 units behind you.
- Lv 10: one gold tooth at a time lures everything on screen (bosses excepted) for 2 s.
- Costs: smites are 20% weaker. Shows: enemies peeling off the crowd and swimming for the glint. Modes: KITE drops teeth behind you; NEST draws enemies away from the egg.

**C. Tooth and Consequences: patience pays.**
- Lv 3: a tooth gains power while it waits: +25% smite damage per second, up to +150%.
- Lv 6: a fully charged tooth (6 s) glows, and its smite also hits everything within 100.
- Lv 10: a fully charged tooth that is never taken explodes when it expires, smiting everything within 160.
- Costs: teeth are dropped 40% less often. Shows: teeth glowing brighter as they wait. Modes: HOLD and KITE give teeth time to charge.

## 15. Tapeworm Seeder (Soul, Projectile)
**A. The Family Business: a durable army.**
- Lv 3: undead last 12 s (from 6) and deal +50%.
- Lv 6: undead follow you and fight near you, instead of where they died.
- Lv 10: the first elite you convert each wave stays for the whole wave (counts towards the pets cap).
- Costs: at most 3 undead (from 4). Shows: a little worm-ridden escort swimming with you. Modes: KITE keeps them between you and the crowd.

**B. Contagious Personality: the army recruits.**
- Lv 3: undead infect the enemies they attack.
- Lv 6: infection lasts until death (no 8 s timeout).
- Lv 10: any enemy that dies infected rises, whoever killed it (pets cap still applies; the oldest undead goes first).
- Costs: undead last 4 s and deal 30% less. Shows: worm marks spreading enemy to enemy. Modes: ORBIT keeps the fight tightly packed for infection.

**C. Dead Useful: an army of ammunition.**
- Lv 3: undead explode in a Soul burst (radius 70) when they expire or are killed.
- Lv 6: the burst adds Soul build-up to everything it hits.
- Lv 10: you can detonate your undead early: every 8 s, all undead rush the densest cluster and burst on arrival.
- Costs: undead deal 50% less in melee. Shows: undead shambling into crowds and popping. Modes: HUNT points them at a big target.

## 16. The Runs (Fire, Pool, trail)
**A. Can't Hold It: go fast.**
- Lv 3: the faster you swim, the denser and hotter the trail (up to ×2 Burn rate at full speed).
- Lv 6: sprinting leaves a white-hot streak that Ignites anything crossing it at once (once per enemy per 4 s).
- Lv 10: at full speed you leave burning footprints either side of you as well, tripling the trail's width.
- Costs: standing still leaves nothing, and slow swimming leaves a weak trail. Shows: the trail brightens and widens with speed. Modes: KITE and ORBIT keep you moving fast.

**B. Backdraft: cross your own path.**
- Lv 3: crossing your own trail ignites it in a wave: fire runs along the path both ways from the crossing (1 s, fills Burn bars by half).
- Lv 6: closing a loop (crossing a trail you laid within 4 s) fills the Burn bar of everything inside the loop.
- Lv 10: a wave that meets another wave bursts where they meet (a Burst of radius 90).
- Costs: the trail itself burns 30% weaker. Shows: a visible wave of fire racing along the trail. Modes: ORBIT crosses its own path constantly.

**C. Leave a Little Behind: lay a route.**
- Lv 3: the trail lasts 3 times as long but starts at low heat, building up over 2 s.
- Lv 6: enemies following your exact path take +50% (the trail remembers them).
- Lv 10: trail pieces that are fully hot become embers that stay for 10 s along your most-used route.
- Costs: slow payoff; the fresh trail behind you does little. Shows: a trail that glows from dull to bright behind you. Modes: KITE drags pursuers along the route; NEST circles the egg on one route.

## 17. Nappy Mines (Fire, Burst, delayed)
**A. Proximity Problems: punish pursuers.**
- Lv 3: mines go off as soon as an enemy comes within 50, as well as on their fuse.
- Lv 6: a mine that goes off on contact flings the enemy back towards the next mine.
- Lv 10: mines crawl slowly after the nearest enemy within 150 (homing).
- Costs: −15% blast damage. Shows: mines blinking faster as enemies near. Modes: KITE lays them in the path of pursuers.

**B. Cluster Diaper: build a minefield, set it off once.**
- Lv 3: mines dropped within 120 of each other link (a visible tape between them); one blast sets off the whole linked group.
- Lv 6: each mine in a chain goes off 20% bigger than the last (3 mines max per chain, 12.5).
- Lv 10: a chain of 3 ends in a nappy-shaped blast of triple radius.
- Costs: mines do not go off on their own until an enemy touches one in the group. Shows: taped-together mines going off in sequence. Modes: HOLD and NEST drop mines in one place.

**C. Lingering Smoulder: deny the ground.**
- Lv 3: the burning patch left by each blast lasts 3 s (from 2) and grows slowly.
- Lv 6: patches that touch merge into one bigger patch (12.7 limits).
- Lv 10: an enemy that Ignites on a patch makes it flare outward to double size for 1 s.
- Costs: the blast itself is 25% weaker. Shows: smouldering patches spreading behind you. Modes: KITE turns a retreat into a burning route.

## 18. Static Cling (Static, Projectile, chaining)
**A. It's Spreading: cover the crowd.**
- Lv 3: +3 jumps (6 in all); jump range 140.
- Lv 6: the chain can fork once: at the first enemy it splits into two chains.
- Lv 10: the last enemy in each chain stays Charged for 6 s instead of 3.
- Costs: each jump loses more (60% falloff instead of 70%). Shows: long branching arcs across the crowd. Modes: ORBIT keeps a crowd within jump range.

**B. Conductive Personality: set up the whole build.**
- Lv 3: Charged enemies take +20% damage from all your weapons (not just Static).
- Lv 6: Static Cling picks targets that are not yet Charged, spreading the setup.
- Lv 10: when an enemy dies while Charged, all your weapons fire 20% faster for 2 s (does not stack).
- Costs: Static Cling's own damage is −30%. Shows: crackling Charged outlines on many enemies at once. Modes: HUNT pairs it with a heavy hitter.

**C. Feedback Loop: arcs feed arcs.**
- Lv 3: when another weapon's hit makes a Charged enemy arc, there is a 30% chance it throws a second, smaller arc (50%).
- Lv 6: a second arc that lands on another Charged enemy can throw one more (depth 3).
- Lv 10: every 20 arcs, the next Static Cling bolt is a storm: it chains to every Charged enemy on screen.
- Costs: Static Cling fires 25% slower. Shows: arcs spawning arcs in visible cascades. Modes: any mode with a fast-firing second weapon.

## 19. Sticky Situation (Mucus, Projectile, shared damage)
**A. Birds of a Feather: bigger networks.**
- Lv 3: bundles link up to 6 enemies (from 4) and reach 220 (from 170).
- Lv 6: two bundles that touch merge into one network (up to 10).
- Lv 10: hitting any enemy in the network shares the hit with all of it (35% each, echo damage).
- Costs: bundles last 3 s (from 5). Shows: a web of red tape across the crowd. Modes: ORBIT keeps the network packed.

**B. Shared Trauma: share what is wrong with them.**
- Lv 3: when one linked enemy is Snared, Burning or Corroded, its partners gain a quarter of that bar or status (once per second; a weapon rule, not echo damage).
- Lv 6: a linked enemy that is Possessed drags its partners towards its targets.
- Lv 10: when one partner Ignites or loses a Shell layer, every partner takes the same, once per bundle.
- Costs: the shared damage drops to 20%. Shows: statuses visibly flowing along the tape. Modes: any; strongest with a second weapon that applies statuses.

**C. Toxic Relationship: focus until it snaps.**
- Lv 3: when a linked enemy dies, the tape snaps and its partners take 30% of its max health (echo damage).
- Lv 6: the snap pulls the survivors together, Conjoining them.
- Lv 10: each snap in the same bundle hits harder than the last (+50% per snap).
- Costs: no damage is shared while they live. Shows: the tape twanging tight, then snapping. Modes: HUNT focuses one linked enemy down.

## 20. Meat Missile (Force, Burst, collisions)
**A. Pinball Wizard: rebound everything.**
- Lv 3: enemies that collide with others rebound instead of stopping, carrying on at 70% speed.
- Lv 6: rebounds off walls count too, and each rebound adds a collision hit.
- Lv 10: a rebounding enemy that hits 3 others bursts in a small Force blast.
- Costs: −20% blast damage. Shows: enemies visibly ricocheting round the group. Modes: ORBIT keeps the group close enough to bounce.

**B. Heavy Meat: big enemies make the best ammunition.**
- Lv 3: collision damage scales with the size of the flying enemy (up to ×2 for elites).
- Lv 6: big enemies send small ones flying twice as far.
- Lv 10: elites can be launched (bosses never), and a launched elite is a heavy hit to everything it strikes.
- Costs: small enemies barely move. Shows: big enemies cannoning through little ones. Modes: HUNT finds the big ones.

**C. Meat Grinder: hits build up.**
- Lv 3: each collision adds an impact mark to the enemy; at 3 marks it bursts in a small Force shockwave.
- Lv 6: the shockwave launches its neighbours too.
- Lv 10: the shockwave counts as a collision, so it adds marks to what it hits (depth 3).
- Costs: −30% knockback distance. Shows: tenderised enemies swelling with each mark, then popping. Modes: HOLD lets the crowd pile in.

## 21. Placental Siphon (Force, Projectile)
**A. Return to Womb: store it up.**
- Lv 3: the store holds 25 bullets (from 10), and stored bullets keep 2 s longer before going stale.
- Lv 6: the volley fires only when the store is full, all at once, in a tight cone.
- Lv 10: a full-store volley is followed by a second volley of the same size at the nearest elite.
- Costs: nothing fires until the store fills. Shows: a visibly swelling placenta round the sperm, then a big volley. Modes: KITE survives while it fills.

**B. Umbilical Shield: survive the pattern.**
- Lv 3: each stored bullet adds a little Membrane (1% max health, up to 15%).
- Lv 6: while the Membrane holds, enemy bullets within 120 are pulled towards you to be eaten.
- Lv 10: when the Membrane breaks, every stored bullet bursts out in a ring.
- Costs: returned shots do 40% less. Shows: a cord-and-membrane bubble that thickens. Modes: NEST and HOLD stand in the bullets.

**C. Eat the Rich: the scarier the shot, the nastier the reply.**
- Lv 3: big or powerful enemy shots count as 3 stored bullets and are returned at triple damage.
- Lv 6: a returned big shot pierces everything in its path.
- Lv 10: a boss shot that is eaten is returned at its boss (homing) and is a heavy hit.
- Costs: small shots are no longer eaten. Shows: big shots visibly swallowed and spat back. Modes: HUNT goes near bosses and elites.

## 22. Blowing Bubbles (Mucus, Projectile, traps)
**A. Big Bubble Trouble: catch the elites.**
- Lv 3: bubbles can trap enemies of any size except bosses, but take 0.8 s to close round anything bigger than small.
- Lv 6: a trapped elite cannot attack and its Membrane stops regenerating.
- Lv 10: popping an elite's bubble launches it like a cannonball through its friends.
- Costs: one bubble at a time. Shows: a large bubble wobbling closed round a big enemy. Modes: HUNT.

**B. Bubble Wrap: walls you can move.**
- Lv 3: trapped enemies' bubbles block enemy shots.
- Lv 6: bubbles drift towards you and float between you and the nearest shooter.
- Lv 10: when a bubble has blocked 5 shots it pops and fires them back.
- Costs: bubbles pop only to shots and you, not to enemies. Shows: shots splashing harmlessly on bubbles. Modes: KITE and NEST.

**C. Pop Goes the Prawn: control bombs.**
- Lv 3: a pop releases a mucus shockwave (radius 90) that Snares everything near.
- Lv 6: the shockwave pops other bubbles it reaches (depth 3).
- Lv 10: the shockwave Conjoins enemies it Snares together.
- Costs: bubbles hold enemies for 2 s (from 5). Shows: a green ring spreading from each pop. Modes: ORBIT keeps bubbles near crowds.

## 23. Due Date (Blood, Projectile, mark)
**A. Any Day Now: commit and it comes sooner.**
- Lv 3: the countdown shortens by 0.1 s for every hit the marked enemy takes.
- Lv 6: a date that goes off early repeats 50% (from 40%).
- Lv 10: going off early staggers the target.
- Costs: one mark at a time. Shows: the countdown clock spinning faster as you hit it. Modes: HUNT.

**B. Multiplying Responsibilities: spread the dates.**
- Lv 3: when a date goes off or its enemy dies, the 2 nearest enemies get weaker marks (20% repeat).
- Lv 6: weaker marks pass on once more when they go off (depth 2).
- Lv 10: when 3 dates go off within 1 s, the third repeats at full strength.
- Costs: the main mark repeats only 30%. Shows: little clocks hopping enemy to enemy. Modes: ORBIT.

**C. Interest Accrued: a long wait for a big cheque.**
- Lv 3: the countdown is 8 s (from 4) and repeats 70% (from 40%).
- Lv 6: the clock shows the stored total, and the stored damage keeps 25% of itself if the enemy dies early, bursting onto neighbours.
- Lv 10: a mark that goes off on a boss or elite also marks it again at once (twice per enemy).
- Costs: the slowest payoff in the game. Shows: a big ledger number growing over the target. Modes: HUNT and HOLD against bosses.

## 24. Seeker Siblings (Blood, Projectile, homing)
**A. Family Planning: more children.**
- Lv 3: every kill produces an extra seeker (not only when one splits).
- Lv 6: the extra seekers are faster and smaller.
- Lv 10: the cap rises to 18 in flight (from 12).
- Costs: each seeker is 25% weaker. Shows: a swarm visibly growing through a crowd. Modes: ORBIT keeps them fed.

**B. The Favourite: pick on the weak.**
- Lv 3: seekers always home on the weakest enemy in range.
- Lv 6: a seeker that kills gains +30% damage for its next target.
- Lv 10: a kill from a seeker that has already killed splits into three instead of two.
- Costs: they ignore big threats. Shows: seekers zipping between the wounded. Modes: COLLECT follows the kills.

**C. Sibling Rivalry: gang up.**
- Lv 3: two or more seekers on the same enemy deal +25% each.
- Lv 6: all seekers in a volley pick the same target.
- Lv 10: when 4 seekers hit one enemy within 0.5 s, they apply a full Bleed stack cap at once.
- Costs: no splitting. Shows: a tight knot of seekers diving in together. Modes: HUNT.

---

# Notes and open points

1. **Rule changes needed before code:** Shared Trauma (statuses copied between linked enemies) and Snotwork's strand pull need lines in the matrix. Weapon marks (Marked for Bonking, Shell Game cracks, Unfinished Business, Bad Aftertaste, Meat Grinder) need one shared rule saying what a weapon mark is.
2. **Attack-type changes (5):** More Is More (to Burst), Dead Pixels (to Spread), Flash in the Pan (to Burst), Big Bang, Eventually (a standing well), Premature Evacuation stays Burst but becomes self-centred.
3. **No damage-type changes.** `MODIFIERS.md`'s "it never changes the attack's damage type" stands.
4. **Nappy Mines is Fire from the start** (user, 18 Oct). Its patch is a Fire Pool footprint, not an Acid Pool. Acid now has one weapon (Acid Spit).
5. **Untested:** no number has been simulated.
