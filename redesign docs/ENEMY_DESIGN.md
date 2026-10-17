# Enemy Design: Principles, Roster Review and New Concepts

Working proposal, 17 Oct 2026. Uses the vocabulary of the other redesign docs only:

- **Damage types (7):** Force, Acid, Static, Mucus, Blood, Soul, Fire (`DAMAGE_TYPES.md`).
- **Defences (5):** Squishy, Membrane, Shell, Thorns, Dodge (`DEFENCE_TYPES.md`). No additional core defence categories. Enemy-specific states, behaviours and elite modifiers (Crackle, Smouldering and the like) are allowed, but must not become hidden defence systems.
- **Attack types (6):** Contact, Projectile, Spread, Burst, Beam, Pool (`ATTACK_TYPES.md`).
- **Statuses:** Poise Pressure, Knockback, Corrosion, Acid Pool, Charge, Snared, Conjoined, Bleed, Extraction, Soul Mark, Fear, Burning (`COMBAT_MATRIX.md` section 4).
- **Reactions:** the 21 triggered pair reactions (`COMBAT_MATRIX.md` section 1). Two types touching one enemy is never enough on its own.

The decisions of 17 Oct 2026 are summarised at the end.

## 1. Design goal

Enemies create interesting combat decisions without asking the player to aim, memorise complicated rules or constantly intervene.

Spawn Prawn is a fast Android autorun autoshooter. The player steers or uses an autorun policy (KITE, COLLECT, ORBIT, HUNT, HOLD, NEST); weapons pick their own targets through targeting policies. An enemy can change where the player moves, which targeting policy is useful, which damage types and attack types the player brings, and how the arena is used. It must never depend on hitting a small weak point, a particular side, or a target autoaim cannot pick out.

The goal is not complicated enemies. It is enemies that are **recognisable, mechanically distinct and worth reacting to**.

## 2. Core principles

### 2.1 One clear identity per enemy
Every enemy has one primary reason to exist (closes fast, soaks damage, shoots from range, heals, summons, restricts space, sets up a reaction). Secondary behaviour is fine only if it reinforces that identity.

**Test:** after a few seconds, can the player say what makes it different? If not, simplify it.

### 2.2 Readable at combat speed
Use distinct silhouettes and movement, clear wind-ups, visible projectiles and hazard edges, and strong visual changes when an enemy charges, hardens, heals or prepares an attack. Avoid tiny weak points, colour-only information, long explanations, overlapping effects that hide the enemy's own behaviour, and attacks that are avoidable in theory but invisible on a phone. The most dangerous action is always more prominent than decoration.

### 2.3 Counterplay without manual aiming
Valid counterplay:
- **Movement:** kite, orbit, hunt, hold, retreat to the egg.
- **Targeting policy:** FASTEST, SHOOTERS FIRST, ELITES & BOSSES, HIGHEST HEALTH, DENSEST CLUSTER and the rest. A policy is a tool for picking the right target, not a counter in itself.
- **Attack type:** Contact, Projectile, Spread, Burst, Beam or Pool, chosen for the job.
- **Damage type:** exploit a defence interaction (Acid sheds Shell, Force is poor into Membrane) or a reaction trigger.
- **Positioning:** separate a support from its allies, leave a Pool, approach from a safer angle.
- **Timing:** hit during a vulnerable window, or let a telegraphed attack resolve harmlessly.

Never require hitting a specific side or end. A counter improves the odds; it is not mandatory. Every enemy permits at least two viable responses: different combinations of movement, targeting, attack type and damage type, not two specific damage types that counter it. Don't let the roster drift into damage-type puzzles.

### 2.4 Movement and geometry are combat
Good: a charger shows its lane, a shooter pulls you forward, a Pool changes which ground is safe, a heavy body blocks space, a group gets worse if it surrounds you. Avoid enemies whose only answer is "stand still and use the right damage type", and anything needing precise pathing through gaps.

### 2.5 Defences and damage types reinforce identity, they don't replace it
Behaviour comes first. An enemy's defence (one of the five) and any damage-type interaction should reinforce that behaviour or create a loadout decision. A plain enemy with no defence that tests movement or target priority is valuable. When an enemy reacts to a type, the reaction is visible and specific, and uses a defined trigger (a visible state, a world object, a named weapon combo).

Keep the layers separate: an enemy can be Squishy, take Force damage, build Poise and set off a reaction without those becoming four competing explanations for the same hit.

### 2.6 No hard counters
Enemies may punish over-reliance on one approach but never shut down a build. Avoid: effective immunity to a build's damage, needing one damage type to win at a reasonable pace, stacking defences, unavoidable statuses, supports that make a group untouchable, and punishment without a clear signal. A defence changes a weapon's efficiency; it never makes the weapon look broken.

### 2.7 Keep the active vocabulary small
Many species, few behaviours at once. Escalate through combinations (a Shell tank in front of a shooter; a healer behind a swarm; a Pool-maker around a charger) rather than unique exceptions.

### 2.8 Bounded and recoverable
- Snared and other movement control never become a permanent lock.
- Repeated interruptions respect the shared Poise meter (section 9).
- Charge arcs have range and jump limits.
- Summoners have caps and cooldowns.
- Pools have visible edges, lifetimes and a way out.
- Healing and Membrane-granting supports have readable ranges and ceilings.
- Bosses resist repeated control without becoming immune to it.

The player can always recover from a mistake.

## 3. Enemy template

1. **Role** (one of the roles below)
2. **Signature behaviour**
3. **Threat** if ignored
4. **Read:** how the player recognises it
5. **Attack type(s)**
6. **Defence:** one of Squishy, Membrane, Shell, Thorns, Dodge, or none
7. **Counterplay:** movement, targeting policy, attack type, damage type, timing
8. **Reaction hook:** which world object or mark it creates or responds to, if any
9. **Fallback:** what works if the preferred counter is missing
10. **Spawn context:** what it pairs with, how many at once
11. **Complexity cost:** new system, special AI, new player status, unusual UI?

No enemy ships until its signature and counterplay fit in two sentences.

### Roles

One shared role vocabulary for the roster, encounter design and the combat matrix (`COMBAT_MATRIX.md` section 5 uses the same names). Roles are labels, not enemy classes or mechanics, and they combine: an enemy can be Shooter + Sniper or Support + Relay.

| Role | Primary function | Main counterplay |
|---|---|---|
| Chaser | Steady contact pressure | Movement, general damage |
| Sprinter (`skitter`) | Closes distance fast | Evasive movement; prioritise it before it reaches contact range (FASTEST helps pick it) |
| Tank | Soaks damage, occupies space | Sustained focus, the right defence interaction, or moving round the space it occupies (HIGHEST HEALTH helps pick it) |
| Shooter | Ranged pressure | SHOOTERS FIRST, closing distance, dodging |
| Swarm | Numbers and crowding | Burst, Pool, Charge arcs, DENSEST CLUSTER |
| Charger | Threatens a telegraphed lane | Leave the lane |
| Support | Heals, buffs or grants Membrane | Prioritise the source |
| Summoner | Adds enemies | Prioritise the summoner |
| Controller | Restricts space or movement | Leave Pools, exploit windows, kill the source |
| Carrier | Leaves, stores, carries or releases a reaction ingredient | Recognise its state and exploit it |
| Leech | Steals health or another defined resource | Burst it, disengage, deny contact |
| Relay | Strengthens nearby enemies or enables their interactions | Break the cluster, prioritise the relay |
| Sniper | Long-range pressure with a clearly telegraphed attack | Read the tell, change lane |
| Elite | A familiar role with one extra modifier | Suitable targeting policy and build |
| Boss | Tests established skills in one memorable fight | Learnable phases, telegraphs, openings |

## 4. Enemy attacks

Enemies use the six attack types in `ATTACK_TYPES.md`. Homing, chaining, piercing, ricochet, delayed detonation, orbiting, rapid volleys and summoned attackers are modifiers on those six, not new systems.

Every attack that can deal significant damage shows **what** is happening, **where** it matters and **when** to respond. Weak Contact enemies need no special wind-up; the more dangerous the attack, the stronger the telegraph.

## 5. Existing roster review

A first-pass disposition, not a rebuild order. The defence column uses the five defences to separate enemies that today differ only in HP, speed or armour numbers. Names are the in-game names; the code id is in brackets. This is a design review, not yet an implementation checklist: each row's current behaviour still needs checking against the code before it is built.

### 5.1 Regular enemies

| Enemy | Disposition | Defence | Direction |
|---|---|---|---|
| Also-Ran (`crawler`) | Keep | None | Baseline chaser (Contact); teaches movement. |
| Sprinter (`skitter`) | Keep | Dodge | Faster, more urgent chaser; its Dodge suits its darting movement. |
| Paramecium (`paramecium`) | Review overlap | None | Fast ciliate swimmer; keep only if its movement differs clearly from the Sprinter's. |
| Antibody (`spitter`) | Keep, clarify | None | Projectile shooter; readable shot and cadence. |
| Krill (`krill`) | Keep | None | Swarm; numbers, not individual complexity. |
| Macrophage (`brute`) | Keep, clarify | Squishy | Tank. Force hits feel soft and barely push it; other types work normally. |
| Amoeba (`amoeba`) | Revise or test | Squishy | Engulf (Contact) with a clear tell, short hold and a reliable escape. |
| Mitotic Cell (`splitter`) | Keep, simplify | None | Splitter with a hard split cap. |
| Spermlet Swarm (`wisp`) | Review overlap | None | Keep beside Krill only if movement or formation differs. |
| Acid Bubble (`bomber`) | Keep, clarify | None | Burst then Acid Pool; the Pool must look unlike a projectile. |
| Quantum Swimmer (`blinker`) | Revise | Dodge | Short, predictable relocation with a clear reappearance; never repeatedly untargetable. |
| Rotifer (`rotifer`) | Keep if distinct | None | Thief; the stolen thing and the way to get it back are obvious. |
| Nurse Cell (`medic`) | Keep | None | Healer; readable target or radius; no endless sustain. |
| Headbutter (`charger`) | Keep, clarify | None | Charger (Contact); telegraphed lane, enough time to leave it. |
| Pinworm (`pinworm`) | Review overlap | None | Merge or give it one clear movement behaviour. |
| Mucus Wall (`bulwark`) | Revise | Membrane | Grants a visible, capped Membrane to nearby allies; never makes them untouchable or forces aiming round it. |
| Volvox (`volvox`) | Review overlap | None | Keep only if its formation or split adds a distinct role. |
| Cytokine Caster (`warlock`) | Keep if distinct | None | Pick one job (damage, buff or control), not all three. |
| Diatom (`diatom`) | Keep if distinct | Shell | Shelled shooter; Acid and heavy Force shed layers. |
| Ghost Swimmer (`phantom`) | Revise | Dodge | Soul-themed. Brief, readable phasing or repositioning with a reliable reappearance. |
| Mother Cell (`summoner`) | Keep, cap spawns | None | Summoner; visible summon cue and a strict cap. |
| Enzyme Spire (`spire`) | Keep | Shell | Stationary turret (Projectile or Beam); readable lane; reason to reposition or prioritise. |
| Plasmodium (`plasmod`) | Review overlap | None | Keep only if its split gives a genuinely different formation. |
| Killer T-Cell (`lancer`) | Keep if distinct | None | Must not be a third "fires at you" enemy beside Antibody and Cytokine Caster; give it Spread or Beam. |
| Water Bear (`waterbear`) | Keep, clarify | Shell | Heavy; many layers, so it feels unlike the Squishy Macrophage. |
| Alpha Swimmer (`juggernaut`) | Review role | Membrane | Its identity becomes the regenerating Membrane: rewards keeping up pressure, punishes breaking off. |
| Thorny enemy (new or re-skin) | Add | Thorns | One ordinary chaser that punishes Contact weapons and favours ranged attack types. |

**Consolidation focus:**
1. **Splitters:** Mitotic Cell, Volvox and Plasmodium must not all be the same fight.
2. **Shooters:** Antibody, Cytokine Caster and Killer T-Cell need different attack types (Projectile, Spread, Beam) or roles.
3. **Chasers and heavies:** Also-Ran, Pinworm, Macrophage, Water Bear and Alpha Swimmer are separated by defence (none, Squishy, Shell, Membrane), not HP.

### 5.2 Spawned-only enemies

| Enemy | Disposition | Direction |
|---|---|---|
| Daughter Cell (`splitling`) | Keep | Simple; clearly the result of another enemy's action. |
| Daughter Colony (`volvoxling`) | Review | Cap total population; differ from ordinary swarms. |
| Candida (`yeast`) | Review | Define it as a regular enemy, summon or hazard; no unexplained extra spawn. |
| Pepsinator Jr (`pepsinjr`) | Clarify or park | If it's a small boss, use a recognisable subset of the boss's attacks. |

Spawned enemies count against their source's threat budget.

### 5.3 Not yet reviewed

These live in feature files and still need a row each before the roster is locked:
- `foes.js`: Booster, Second Dose, Natural Killer.
- `foes2.js`: Litmus Cell, Mirror Cell, Shell Cell, Puffball, Spore, Grease Ball, Leech, Platelet Clump, Callus, Plasma Cell, Interferon, Cortisol Puff, Fibrin Weaver, Complement Protein, Stem Cell, Lost Tadpole, Stray Pube, Navel Fluff, Bogey, Bit of Sweetcorn, Glitter.
- `foes3.js`: Phlegm Hocker, Hayfever Cell, Snot Bubble (6.1).

Several `foes2.js` enemies break this doc's own rules and need the most scrutiny: Litmus Cell (resists your most-used type: a hard counter), Mirror Cell (reflects shots off its front: a side to hit), Platelet Clump and Grease Ball (each shuts off one attack modifier). The Leech enemy shares its name with the Leech role; that is fine, but its card should not suggest it is the only Leech.

### 5.4 Bosses

Bosses are built from familiar behaviours, attack types and defences, pushed into memorable patterns. Each has one central mechanic and at least two viable answers.

| Boss | Direction |
|---|---|
| Macrophage Queen | Squishy tank or summoner; not heavy defence plus unlimited summons. |
| Antibody Colossus | Large-scale Projectile and Spread patterns, not precision attacks. |
| Immune Eye | Its attack state is visible; no guessing what it is looking at. Beam fits. |
| The Matron | One signature mechanic, not layered supports. |
| Pepsinator | Distinct arena or attack pattern; readable between phases. |
| Chad Prime | Charger: Contact rams with visible wind-ups and recovery windows. |
| The Fever | Escalating pressure, bounded and legible. |
| Mitch & Osis | Two silhouettes, two roles (e.g. one Membrane, one Shell); their interaction is the fight. |
| Phantom Pregnancy | Boss-scale illusion or Soul Mark encounter; no long target confusion. |
| Litmus Strip | Tests adaptation without requiring one weapon. |
| The Johnny | One recognisable signature attack or movement first. |
| Mucus Plug | Snared ground and Pools; safe routes always remain. |
| The Cramp | Timed constriction, clearly telegraphed, brief. |
| The Sneeze | Big directional Spread; readable warning and footprint. |
| Kidney Stone | Heavy Shell boss that rolls or ricochets; trajectory readable without precise steering. |

Directions to investigate, not specifications.

## 6. New enemy concepts: shortlist

### 6.1 Snot Bubble (already prototyped in v9.27, `foes3.js`)
- **Role:** Carrier / controller.
- **Signature:** swells with every hit (at most once every 0.1 s, so one Spread volley counts once); bursts into a short-lived Mucus patch where it stands. Hit 4 or more times, the burst is big and sticks you too if you're close.
- **Attack type:** Burst, leaving a Mucus patch.
- **Read:** visibly grows.
- **Counterplay:** kill it small, step out of the marked burst, or pop it with Static.
- **Static trigger:** any hit that carries Static damage and lands on the bubble bursts it at once, whatever its size. The patch forms where the bubble was (no direction), sticks the enemies inside it and never sticks you. Applying Static is the trigger; Charge is not needed. (Matches POPPED in `foes3.js`.)
- **Reaction hook:** its Mucus patch feeds Flammable Mucus (Fire), Sticky Situation (Static) and Slick Move (Acid).
- **Verdict:** keep; re-express in the new vocabulary.

### 6.2 Static Sock
- **Role:** close-range punisher (Chaser).
- **Signature:** builds Crackle by distance travelled (not time, not hits taken). Crackle has a clear maximum in 3 visible steps. At full Crackle its next touch delivers one heavy Contact zap, and Crackle resets to zero. Below full, its touch is an ordinary weak Contact hit. Being knocked back does not add Crackle.
- **Read:** it crackles harder as Crackle builds. Crackle belongs to this enemy only: no general status, icon or meter. Charge stays the status Static weapons put on enemies.
- **Counterplay:** kill it before it's full, avoid its path, or dodge the zap.
- **Defence:** Squishy (it's a sock).
- **Verdict:** prototype.

### 6.3 Stress Ball
- **Role:** defensive specialist (Tank).
- **Signature:** every 5th qualifying Force hit sets off a rebound: it squeezes, then springs back, knocking you back if you're close.
- **Qualifying hit:** a Force hit that actually lands and deals damage. At most one counts every 0.1 s, so one Spread volley or Burst counts once. Damage over time ticks, Pools and reactions never count.
- **Counter:** shown as 4 squeeze stages. The 5th qualifying hit triggers the rebound and resets the count to 0. With no qualifying hit for 2 s, it relaxes one stage, so the count carries between attacks only while the pressure keeps up.
- **Rebound:** short fixed distance, only within a small radius. It never pushes you through a wall, and if the landing point is inside a hazard the push stops at the hazard's edge. It creates a positional problem, never an unpredictable death.
- **Read:** it visibly squeezes tighter with each Force hit; the 5th squeeze is unmistakable before it springs.
- **Counterplay:** keep your distance when it's fully squeezed, or use another attack or damage type.
- **Defence:** Squishy, fixed (Force is softened as usual; the rebound is its identity, not a stronger defence).
- **Limit:** telegraphed and infrequent, so Force builds never feel punished at random.
- **Verdict:** prototype. If knocking the player back feels awkward in practice, drop Stress Ball rather than add a defence for it.

### 6.4 Mosquito
- **Role:** resource pressure (joke).
- **Signature:** a Contact bite that deals a small, fixed amount of damage, then it flies off. This is not Extraction (Extraction stays the player's Blood mechanic) and adds no new resource.
- **Read:** swells as it feeds; retreats.
- **Counterplay:** kill it within 4 s of the bite and you get back half of that bite's damage (capped per bite). FASTEST helps pick it.
- **Too late or escaped:** after 4 s it shrinks back to normal and killing it returns nothing. If it leaves the screen it is gone, and so is the health.
- **Reaction hook:** dies into a small blood pool (Blood Circuit); here the ingredient fits naturally.
- **Verdict:** prototype.

### 6.5 Earwax Plug
- **Role:** spatial counter to Charge arcs (Controller).
- **Signature:** Charge arcs stop at its body.
- **Read:** arcs visibly fizzle into it.
- **Counterplay:** kill it, move so arcs route round it, or use a non-arc attack.
- **Defence:** Shell (wax layers; Acid melts them).
- **Limit:** only stops arcs; enemies behind it still take everything else.
- **Verdict:** conditional; only if Static arcs are a big part of play.

### 6.6 Bath Duck
- **Role:** low-threat joke.
- **Signature:** harmless until it hits a Mucus patch or Acid Pool, then skids across it fast.
- **Read:** squeaks and speeds up on the surface.
- **Counterplay:** stay out of its skid line, or let it skid into other enemies.
- **Verdict:** low priority flavour.

### 6.7 Echo Cell (defer)
Leaves a see-through echo that repeats its recent movement or attack. If the echo must be hit, autoaim must be able to target it. Its Soul hook is the Soul Mark (the echo arrives marked). Prototype only once simpler enemies are solid.

### 6.8 Newton's Cradle (redesign first)
A linked chain of bodies passes an impact end to end. Remove any need to hit a particular end. Trigger it through automatic attacks, movement or a visible state; Force Knockback is the natural driver.

### 6.9 Bladder (defer or simplify)
Grows over time, then bursts into a larger Burst or Pool the longer it's left. Local, immediate payoff only; no screen-wide effects.

### 6.10 Cootie Catcher (defer)
Rotates between two or three defences (e.g. Shell, then Membrane, then none), each with a distinct shape, not just a colour. Risks needing too much attention mid-fight.

## 7. Fire enemies (new)

Fire is literal fire (matches, lighters, candles). Fire enemies set up and use Burning, Burn zones and Flammable Mucus.

Fire damage and Burning are separate effects. Defences decide how an enemy handles the direct hit; Burning follows its own rules. No core defence gives blanket immunity to Burning, though individual enemies may have bounded ways to reduce it. Fire's value against Shell and Squishy comes from its defined interactions (`DEFENCE_TYPES.md`: Shell and Squishy reduce only a physical carrier component, and do not reduce heat or Burning), not from bypassing defences by default.

**Prototype order:** Matchstick first (mobile, telegraphed lane threat), then Birthday Candle (stationary, changes safe ground), then Trapped Wind only if playtests show it is a different decision from an ordinary Pool or Burst Carrier.

### 7.1 Matchstick
- **Role:** Charger.
- **Signature:** strikes its head on a wall, then charges in a straight line and leaves a short burning trail (a thin Pool).
- **Read:** a spark and flare as it strikes; the lane is lit before it runs.
- **Attack types:** Contact (the charge), Pool (the trail).
- **Counterplay:** step out of the lane; don't kite back through the trail.
- **Defence:** none. Dies easily, burns out fast.
- **Spawn context:** two or three at once with a Shooter behind; never with another Pool-maker.
- **Complexity:** low (Headbutter's charge plus a trail).

### 7.2 Birthday Candle
- **Role:** Controller / hazard organism.
- **Signature:** a stationary wax stub with a flame tip. It drips wax Pools and lights any Mucus patch next to it (Flammable Mucus, set off by the enemy).
- **Read:** flame flares before each drip; lit patches glow.
- **Attack type:** Pool.
- **Counterplay:** kill it, keep Mucus away from it, or use it on purpose: lure enemies into the lit patch.
- **Defence:** Shell (wax layers; Acid melts them, heavy Force snaps one off).
- **Spawn context:** one per arena, near Mucus-making enemies.
- **Complexity:** low (stationary, reuses Enzyme Spire placement).

### 7.3 Trapped Wind
- **Role:** Carrier.
- **Signature:** a drifting pocket of gas. If anything Burning touches it, or a Fire attack hits it, it goes up in a Burst.
- **Read:** a swelling, wobbling cloud; flickers when Burning enemies are close.
- **Attack type:** Burst (only when lit).
- **Counterplay:** light it while it sits among enemies, or keep away when it drifts near you.
- **Defence:** Dodge (it wafts aside from shots that aren't Fire).
- **Reaction hook:** its Burst sets Burning on enemies inside, which can feed Arc Flash (Static) or Cauterise (Blood).
- **Limit:** one Burst, no chain to other gas pockets.
- **Complexity:** low to medium.

### 7.4 Elite modifier: Smouldering
Any elite can be Smouldering: it leaves a small, short Burn zone where it dies. One modifier, readable glow, no chain.

## 8. Concepts to park or rework

Not rejected, but each currently adds too many dependencies.

| Concept | Why defer | What would make it viable |
|---|---|---|
| Hayfever Cell (prototyped v9.27) | Reflects player statuses back; several player-side statuses. | One clearly signalled reflection. |
| Phlegm Hocker (prototyped v9.27) | Adds a player-side Snared and a cleanse rule. | A simple, avoidable sticky Projectile that leaves a Mucus patch. |
| Ouija Planchette | Readable text, buff attribution, special targeting. | A visible link to one protected enemy, with a simple counter. |
| Séance Ring | Linked bodies and a closing area. | A small group with one ring-formation Burst. |
| Lava Lamp | Splitting, merging and Burn spread together. | One behaviour: a blob that splits briefly and rejoins. |
| Grease Trap | Relied on a damage type that no longer exists. | A carrier that leaves one existing world object. |
| Leaky Tap | Healing puddles make enemies harder to kill without a clear answer. | A small, visible healing zone that can be interrupted or abandoned. |
| Chameleon Cell | Copying appearances misleads about threats. | A clear giveaway; never hides telegraphs. |
| Plaque | Shrinking the arena risks a movement lock. | A limited, removable patch. |
| Clotting Factor | Directly counters Bleed. | Slows Bleed rather than cancelling it, with visible, limited coverage. |
| Crybaby | Healing, area and damage-type interactions on one enemy. | One healing-area behaviour with a vulnerability window. |
| Cold Sore | Attaches to enemies and grants protection. | A simple, removable Membrane on one ally. |
| Sneeze Guard | A moving wall that catches shots undermines autoaim. | A short-lived frontal Membrane with a clear edge. |
| Inkblot | Hiding enemies undermines readability. | A visible cloud that obscures some information, never threats. |
| Hairball | Grows by collecting things. | A rolling hazard that grows to a fixed cap. |
| Fever Blister | Relied on an old damage type. | A simple Burst hazard with one defined reaction hook. |
| Tooth Decay | Effects on allies plus a speed buff. | One visible support aura or Contact effect. |
| Antacid Tablet | Cancels Acid, potentially invalidating a build. | A short-range Corrosion-slowing support with a visible zone. |
| Canker Sore | Persistent Acid trail plus a second counter. | A short trail with a clear safe route. |
| Oil Tanker | Relied on a damage type that no longer exists. | A carrier that leaves one existing world object. |
| Battery Cell | Overlaps Static Sock. | Only if its reward to the player differs from the Sock's threat. |

## 9. Enemies and damage types

### Carriers
- Reuse an existing reaction ingredient (Acid Pool, Mucus patch, blood pool or wound, Burning, Soul Mark) whenever it fits naturally.
- A Carrier can instead store, carry or release an existing effect.
- A custom effect is allowed only when it creates a distinct, worthwhile decision. Never add a new status just so an enemy counts as a Carrier.
- A Carrier's effects never get round Shell, Membrane or Dodge.

### Soul enemies
- The Soul Mark is the shared hook: a Soul-marked enemy is a visible chance to set off Force + Soul, Mucus + Soul or Blood + Soul.
- Fear is a separate status, used only where it creates a distinct, readable threat. It is not what Soul damage inherently does.
- Each Soul-themed enemy has its own primary behaviour (Ghost Swimmer phases, Echo Cell repeats, Phantom Pregnancy is a boss-scale illusion). No enemy needs Soul damage to turn it on its allies.

### Poise
- One shared Poise meter. Force adds to it through physical impact; Static adds only when an attack explicitly carries Poise or interruption pressure.
- At the threshold the enemy briefly staggers or its action is interrupted.
- Not every Force or Static hit adds Poise.
- Poise recovers after a period without qualifying hits.
- Elites and bosses have higher thresholds and shorter control. Bosses are never fully immune: briefly interrupting a telegraphed attack is satisfying counterplay.

### Rules
1. **Every reaction needs a readable trigger:** a visible state, a world object (Acid Pool, Mucus patch, blood pool, Burn zone), a Soul Mark or a named weapon combo.
2. **No manual targeting:** if a specific enemy must be hit, autoaim must be able to pick it.
3. **A matching type never auto-wins:** it improves efficiency or opens a window.
4. **No permanent immunity:** every defence has a route through it (`DEFENCE_TYPES.md`).
5. **No duplicated jobs:** Force isn't a general Shell breaker beyond heavy hits; Acid isn't a universal bypass; Charge doesn't stun everything; Snared never permanently stops movement; Extraction doesn't sustain forever; Soul doesn't ignore every defence; Burning doesn't spread without limit.
6. **Short and visible payoffs.**
7. **Bounded chains:** arcs, ignition, splitting and summoning all have limits.

### What each type wants from enemies

- **Force:** enemies that can be knocked into Pools or walls, or given Poise Pressure while vulnerable. Poor into Membrane; softened by Squishy; heavy hits shed Shell.
- **Acid:** enemies with Shell to erode; Acid Pools that deny ground.
- **Static:** clustered enemies for arcs; Charge to interrupt telegraphed attacks; can strengthen Membrane (a risk the player sees).
- **Mucus:** fast or evasive enemies to Snare; patches that set up Fire, Static and Acid reactions.
- **Blood:** high-HP enemies to Bleed; Extraction for limited sustain.
- **Soul:** essence and non-physical resources; Soul Mark setups. Fear only where an enemy is built around it.
- **Fire:** Burning, Burn zones and lighting Mucus. The direct hit meets defences as usual; Burning is a separate effect that Shell and Squishy don't reduce.

Not every enemy needs to respond to every type.

## 10. Spawn composition

Build encounters from familiar roles:
- **Shooter + Chaser:** close the gap or keep moving while weapons handle the back line.
- **Shell tank + Shooter:** the tank holds space while the shooter fires from behind.
- **Healer + Swarm:** a clear priority decision.
- **Summoner + Charger:** growing numbers plus a direct threat that demands movement.
- **Controller + Shooter:** a Pool makes dodging harder.
- **Carrier + Swarm:** the carrier turns a dangerous group into an opportunity.

Population rules:
- A maximum active enemy count per encounter or wave.
- Summoned enemies count against the same budget.
- Splitters can't multiply indefinitely.
- Limits on simultaneous high-pressure projectiles and Pools.
- Don't stack several enemies that apply the same disruptive status.
- Introduce new behaviours alone before combining them.

## 11. Elites

An elite is a familiar enemy plus one modifier:
- A charger that leaves a short Pool.
- A shooter that fires a different, clearly telegraphed Spread.
- A tank that briefly gives one ally Membrane.
- A chaser that gets a visible speed burst at low health.
- Smouldering (section 7.4).

ELITES & BOSSES and HIGHEST HEALTH help pick elites, but NEAREST, LOWEST HEALTH and other sensible policies still work.

## 12. Bosses

A good boss has one central mechanic, readable phases or cycles, clear windows to dodge, reposition and hit, room for different builds, an answer to burst, arcs and repeated interruption, no small or temporary weak points, no hidden targeting rules, and is easy to tell apart from its projectiles, Pools and summons. Phases change the rhythm, never the controls. A boss that needs a specific target attacked makes it autoaim-selectable; a phase that needs movement telegraphs well enough for autorun, while manual steering still does better.

## 13. Implementation order

1. **Audit the roster:** one role and one defence (or none) per enemy; find duplicate splitters, shooters, chasers and tanks; confirm signature and counterplay; merge only what fails to be distinct; remove manual-aim assumptions.
2. **Validate core behaviours** in real autorun play: Chaser and Sprinter; Shooter and Charger; Shell tank and Shell shooter; Swarm and Splitter; Healer and Summoner; Controller and Pool-maker. Check movement, targeting policies and several builds against each.
3. **Prototype new concepts:** Static Sock, Stress Ball, Mosquito and Matchstick first. Add Birthday Candle, then Trapped Wind, only once those tests show what combat still needs. Then Earwax Plug if arcs need a counter; Bath Duck as a joke. Snot Bubble already exists.
4. **Validate interactions:** every defence against all seven types; no hard counters; Pools and statuses tested separately from direct hits; bounded chains; explicit visible triggers.
5. **Rebuild encounters:** roles alone, then pairs, then larger groups. Track active enemies, projectiles, Pool coverage and time spent unable to move freely. Test all six autorun modes and a range of targeting policies.
6. **Review bosses:** one identity each, familiar attack types, several builds, no precision targeting, readable on a small screen.

## Final recommendation

Make the existing roster coherent before adding new ideas. Separate the heavies by defence, the shooters by attack type and the splitters by formation. Prototype Static Sock, Stress Ball, Mosquito and Matchstick first; add the other Fire enemies after those tests.

**Every enemy should make the player change a decision, not necessarily learn a new rule.**

## Decisions (17 Oct 2026)

| Question | Decision |
|---|---|
| Stress Ball | Fixed Squishy; a bounded, telegraphed rebound every 5th qualifying Force hit, or drop it |
| Fire and Burning | Separate effects: defences handle the hit, Burning has its own rules |
| Static Sock trigger | Crackle builds by distance travelled; one zap at full, then reset |
| Mosquito | Fixed bite; kill within 4 s to get half back; not Extraction |
| Snot Bubble Static | Any Static hit bursts it at once; harmless to you |
| Prototype order | Static Sock, Stress Ball, Mosquito, Matchstick; other Fire enemies after |
| Carrier effects | Reuse existing reaction ingredients when they fit; allow justified exceptions |
| Enemy roles | One merged vocabulary (adds Leech, Relay, Sniper); roles can combine |
| Soul enemies | Soul Mark is the shared hook; Fear is selective |
| Static Sock state | Crackle, not Charge |
| Poise | One shared Force/Static meter, with explicit contribution and elite and boss limits |
