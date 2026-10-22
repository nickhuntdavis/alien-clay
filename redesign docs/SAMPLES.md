# Spawn Prawn: The Eight Samples (and a proposed ninth)
## Character redesign (17 October 2026; names and starting weapons revised 18 October)

Working proposal. Design only, nothing built yet. A **sample** is the character you play; **Epigenetic Profiles** are build choices inside a sample. The eight samples replace the current sequences as the thing you pick and unlock. A ninth (Acid / Fire) is proposed, not decided: section 9 here, full design in `SAMPLE_9_ACRO.md`.

### Design principle

Every sample gets one ridiculous biological or psychological obsession, expressed through three things:

1. **A tell:** a recognisable movement or visual behaviour.
2. **A quirk:** one passive rule that changes its playstyle.
3. **A payoff:** one signature ability that produces a satisfying, legible moment of chaos.

The player should understand each sample in seconds. No extra meters, elaborate combos or complicated conditional trees. The depth comes from how the seven damage types, weapons and enemies interact with each sample's simple identity.

Each sample has its own consciousness (the pre-incarnate soul that speaks to the sperm, `VOICE_GUIDE.md`), distinct from the Scientist: impulsive, needy, immature and absolutely convinced that reaching the egg is the most important thing in existence. Its persona is the person this sample would grow up to be (`CONSCIOUSNESS.md`). The Scientist documents increasingly impossible events without acknowledging the obvious.

---

## The redesigned roster

| # | Sample | Origin | The joke | Primary / support | Signature idea |
|---|---|---|---|---|---|
| 1 | Baseline | Human | The control specimen that refuses to be irrelevant | Force / Blood | The control group that refuses to die |
| 2 | Alpha | Human | A self-appointed high-value male: crypto, cold plunges and a podcast nobody asked for | Static / Force | Every fight is a dominance contest |
| 3 | Beta | Human | The lazy underachiever who becomes terrifying when pushed too far | Blood / Mucus | Near-death becomes its power spike |
| 4 | Private Schooled | Human (paperwork sealed) | Nepotism, privilege and a suspiciously sealed family history | Acid / Alien | Makes enemies betray their own side |
| 5 | Ordered Online | Synthetic (nanobot) | A nanobot that arrived by post; who ordered it is best left uninvestigated | Mucus / Acid | Turns pursuit into a terrible decision |
| 6 | Redtail | Unknown | A chaotic little firestarter with a potentially ominous reputation | Fire / Static | Starts chain reactions in crowds |
| 7 | Prawn Again | Impossible | A second chance at life, death, and whatever the hell happened last time | Alien / Blood | Temporarily steals enemies, then collects the debt |
| 8 | Not of This World | Extraterrestrial | An extraterrestrial romantic with absolutely no grasp of the situation | Fire / Alien / Static | Constantly changes what it is |
| 9 | Sample 9 (proposed; name `TODO_COPY:s9_name`) | Human | Its enzyme cap goes off before it arrives: a premature acrosome reaction, a real cause of infertility | Acid / Fire | Strips everything, then burns what is left |

Each sample has three starting weapons of its own (section "Starting weapons" below). No starter is shared.

Old names, for anyone reading older docs: the Overachiever is Alpha, the Late Starter is Beta, the Family Friend is Private Schooled, the Cold Parcel is Ordered Online, the Unsolicited is Redtail, the Unaccounted is Prawn Again and the Other Half is Not of This World.

---

# 1. Baseline
### The control group that won't cooperate

**Core fantasy:** Be the most straightforward sample in the lab, then survive things that should be impossible.

**Behaviour**

- Swims in a clean, regular rhythm.
- Makes crisp turns and has almost no visual fuss.
- When hit, briefly folds in on itself, then resumes swimming as though nothing happened.

**Passive: Within Normal Limits**

All base stats receive a modest 5% bonus. No special conditions, no caveats. Baseline is reliably good at everything.

**Unique Feat: Standard Procedure**

Emit a powerful circular Force pulse that knocks nearby enemies away. Simple, immediate and useful when the screen gets crowded.

**Visual signature**

A perfectly textbook silhouette, an even tail beat and a faint wake. Its special attack briefly produces a clean, clinical ring.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 1.

**Scientist**

"Sample 1A established as control. It continues to be disappointingly difficult to kill."

**Selection-card gag:** A specimen tube with a barcode, a ticked checklist and a handwritten note: *Nothing to report.*

---

# 2. Alpha
### Thinks he's the main character in everyone's life

**Core fantasy:** Be the apex specimen. Every fight is a dominance contest, every enemy is a beta, and every setback is an opportunity to talk about discipline. The weapons sound like self-improvement advice; what they actually do is gloriously insecure.

**Behaviour**

- Accelerates aggressively and never yields the racing line.
- Overtakes its own projectiles where possible, then acts as though it meant to.
- Puffs its midpiece out whenever an enemy dies nearby.

**Passive: No Days Off**

Its fire rate increases while moving and falls back to normal when stationary. One simple rule that makes the player want to keep swimming. The grind never stops.

**Unique Feat: Personal Best**

Burst forward in a high-speed sprint, leaving a Static wake. Enemies struck extend the wake, rewarding a good line through a crowd.

**Visual signature**

An elongated head, an oversized, puffed-out midpiece (it skips leg day; it has no legs) and a frantic whip-crack tail. At top speed, its electrical trail becomes a continuous streak.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 2.

**Scientist**

"Sample 2A describes itself as the top 1% of specimens. It is one of approximately 250 million."

**Selection-card gag:** A ring light, a tub of protein powder and a business card reading *APEX SPECIMEN. DM FOR COACHING.*

**Upgrade voice:** Alpha's upgrade cards get more delusional as they level; the Scientist's line underneath stays flat.

- Lv 3 (one line per Red Flagship promise, `WEAPON_UPGRADES.md` 6):
  - Overclocked: "Hold frame. Whoever looks away first is the beta." / "Damage rises the longer the beam holds one target."
  - Critical Error: "Every kill is content. Clip it. Ratio them." / "Kills by the beam emit a pulse."
  - Dead Pixels: "Spray and pray is cope. Spray and manifest." / "The beam now throws short zaps either side."
- Lv 10: "You didn't choose the apex. The apex chose you." / "The beam is now longer than the sample."

---

# 3. Beta
### Absolutely useless until it isn't

**Core fantasy:** Look like the weakest sample on the slide, then become an absolute nightmare to finish off.

**Behaviour**

- Starts with a lazy, slightly awkward swim.
- Tightens its movements and beats its tail harder as health falls.
- At critical health, pulses like a tiny angry heart.

**Passive: Not Dead Yet**

Below 30% health, gain increased damage and lifesteal, scaling with missing health. The closer it gets to death, the more dangerous it becomes.

**Unique Feat: Second Wind**

Drain Blood from wounded enemies in the surrounding area, restoring health. Healing scales with missing health, making it most powerful when the situation looks dire.

**Visual signature**

A slightly battered head, a notched tail and a wet, elastic trail. As health falls, the tail beat gets faster and the red glow intensifies.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 3.

**Scientist**

"Sample 3A was initially classified as sluggish. Its subsequent behaviour has made that classification difficult to defend."

**Selection-card gag:** An assessment sheet stamped *UNREMARKABLE*, with the stamp itself crossed out.

---

# 4. Private Schooled
### The little bastard who knows someone

**Core fantasy:** Refuse to fight fair. Make the toughest enemy a liability to its own team.

**Behaviour**

- Glides through danger with infuriating composure.
- Targets the biggest threat instead of the nearest nuisance.
- Barely reacts to attacks, as if it expected the room to accommodate it.

**Passive: Who Do You Think You're Dealing With?**

Its Acid builds Corrosion faster. Enemies it Possesses deal bonus damage to their former allies, turning a successful possession into a more valuable tactical advantage.

**Unique Feat: Pulling Strings**

Mark the toughest nearby enemy. It rapidly accumulates Corrosion while nearby enemies gain Alien build-up, encouraging the marked target's entourage to turn on it.

**Visual signature**

A polished, symmetrical head with a subtle collar-like neck. Almost no trail. Acid visibly eats away at armour; Possessed enemies acquire a faint purple sheen.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 4.

**Scientist**

"Sample 4A arrived with complete documentation. The donor's identity remains confidential. The accompanying note was written in familiar handwriting."

**Selection-card gag:** A sealed VIP envelope, a gold-edged access pass and a sticky note reading *SORTED. DON'T ASK.*

---

# 5. Ordered Online
### Everything is trying to grab you, and you have receipts

**Core fantasy:** Be a precision-engineered nanobot that is slippery, leaves a mess and punishes anything that tries to follow. It is synthetic (decided 20 Oct 2026); the mystery is who ordered it, not what it is. Kit and rules are unchanged.

**Behaviour**

- Slides around corners with a little overshoot, then corrects in one exact step.
- Glitches intermittently: a sub-frame twitch, like a servo recalibrating.
- Leaves a sticky ribbon behind that makes pursuing enemies regret their decisions.

**Passive: Nothing Sticks**

Leave a Mucus trail while moving. Enemies following the trail are slowed, giving the player a natural way to control pursuit without aiming or managing another resource. It also has **Evasion built in** (20% miss chance, no Genome slot; `UPGRADES.md` 5): the only sample that starts with a defence.

**Unique Feat: Shrink Wrap**

Snare a ring of enemies in Mucus, then leave an Acid Pool beneath them. The setup is immediately readable: trap first, dissolve second.

**Visual signature**

A segmented, glossy shell with a visible seam down the head and a small status light at the midpiece. The tail beats in exact stepped increments. Its trail stretches into a glossy synthetic-gel ribbon (its Mucus). The Acid Pool bubbles conspicuously.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 5.

**Scientist**

"Sample 5A arrived in an anti-static bag. It is not biological. It has been filed as biological, as the form has no other box."

**Selection-card gag:** A dented shipping box with a *THIS WAY UP* arrow pointing in three different directions and a warning sticker: *WARNING: NOT SUITABLE FOR AGES 0 AND UNDER.*

---

# 6. Redtail
### Curiosity is not a defence mechanism

**Core fantasy:** Cause spectacular accidents by being incapable of leaving anything alone.

**Behaviour**

- Makes abrupt, curious turns towards enemies and pickups.
- Loops around interesting targets.
- Occasionally seems to reconsider its direction halfway through a movement, then commits even harder.

**Passive: Touch Everything**

Static hits also apply Burn. The more enemies its attacks chain through, the more likely a crowd is to become a collection of little ticking fire hazards.

**Unique Feat: Reply All**

Instantly fills the nearest enemy's Burn bar. Static arcs from that target spread additional Burn to nearby enemies, creating a readable ignition chain.

**Visual signature**

A slightly oversized head with a glowing ember core and a flickering tail tip. Its trail scatters sparks; Static threads leap between burning enemies.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 6.

**Scientist**

"Sample 6A was discovered outside the laboratory. The door was locked. Eleven minutes of footage are missing."

**Selection-card gag:** An unlabelled container on a doormat, a scorched welcome mat and a security still showing an empty corridor.

---

# 7. Prawn Again
### The universe is off by one

**Core fantasy:** Turn enemies into temporary accomplices, then make the consequences arrive late.

**Behaviour**

- Swims slowly and calmly through chaos.
- Sometimes appears a fraction of a frame ahead of its own movement.
- Possessed enemies leave a delayed ghost-image, as though their bodies are catching up with their souls.

**Passive: Collateral Memory**

Enemies Possessed by this sample cause Bleed when they damage other enemies. Their betrayal becomes a source of Blood damage.

**Unique Feat: Recount**

Possess up to six enemies for three seconds. When possession ends, each loses a chunk of health. Kills refund stamina.

The visual sequence is simple: enemies turn, attack their friends, then take the delayed hit. No extra resource or complicated timing system is needed.

**Visual signature**

A familiar silhouette with a faint, offset duplicate. Its shadow falls in the wrong direction. Possessed enemies briefly inherit the double image.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 7.

**Scientist**

"Sample 7A was not introduced to the slide. The count is correct. No amendment is required."

**Selection-card gag:** A counting chamber with one cell circled in pencil. Beside it, *RECOUNT?* has been crossed out so many times the paper has torn.

---

# 8. Not of This World
### The wrong organism has RSVP'd

**Core fantasy:** An alien sample that continually changes its attack identity while remaining completely, unsettlingly committed to reaching the egg.

**Behaviour**

- Glides along strange, precise paths.
- Has two tails beating out of phase.
- Reconfigures visibly as its active damage type changes.

**Passive: Adaptive Biology**

Its kit shifts between Fire, Alien and Static every 20 seconds. The active type is clearly displayed on the HUD and reflected in its body, trail and attacks.

**Unique Feat: First Contact**

Immediately shift to the next damage type and trigger a reaction on every enemy carrying a status (up to 8, nearest first). It counts as a hit of the old and new type for reactions only: the Feat trigger kind in `COMBAT_MATRIX.md` (reaction rules and 11.3). This rewards awareness of the current battlefield without requiring manual aiming.

**Visual signature**

A faceted head, two independently moving tails and an iridescent body. Each shift creates a ring-shaped ripple, followed by the visual language of the new type.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 8.

**Scientist**

"Sample 8A has responded to the target. The target has not yet been introduced."

**Selection-card gag:** A seamless container with no opening and a sheet of alien writing. One line has been translated in pencil: *OTHER HALF.*

---

# 9. Sample 9 (proposed)
### Name and tagline: `TODO_COPY:s9_name` (brief in `SAMPLE_9_ACRO.md` 6.1)

*Proposal, 20 Oct 2026. Not decided or built. Full design (three weapons and their branches, Feat numbers, copy briefs): `SAMPLE_9_ACRO.md`.*

**Core fantasy:** Dissolve through every defence on the slide before anything is ready, then burn what is left.

**Behaviour**

- Lurches forward a beat before every turn, as if it can't wait for its own swim.
- Heads straight for the nearest armoured thing.
- When made to stand still, its cap visibly fizzes and boils over.

**Passive: `TODO_COPY:acro_passive`**

Corrosion bars pay off at 70% instead of full (`COMBAT_MATRIX.md` 11.2): a Shell layer strips early, and an enemy with no Shell becomes Corroded early. Uses the existing bar and ring; no new meter.

**Unique Feat: `TODO_COPY:acro_feat_name`**

An Acid Burst around you fills the Corrosion bar of every enemy within 220 (bosses half) and leaves an Acid Pool. Then the cap is spent: your Acid damage drops 25% for 4 s, shown by the bare head until the cap regrows. The trade-off is the joke: it used everything too early.

**Visual signature**

An oversized, fizzing shocking-pink cap on the head (Acid's visual language, `DAMAGE_TYPES.md`). Player Shell shows as bands on the cap. When the Feat goes off, the cap pops and the head looks bare until it regrows.

**Inner consciousness**

Persona, tell and sample line: `CONSCIOUSNESS.md` section 9 (the early arrival).

**Scientist**

`TODO_COPY:acro_sci` (brief in `SAMPLE_9_ACRO.md` 6.1: dry; it released its enzymes before arrival).

**Selection-card gag (visual only):** a specimen tube with the seal already broken and nothing inside, logged in before its collection was booked. Any label text is copy for the user.

---

## The roster's visual rhythm

The samples should read as a series of increasingly implausible specimens, not eight interchangeable skins.

| Sample | Instantly recognisable signature |
|---|---|
| Baseline | Perfectly regular tail beat |
| Alpha | Puffed-out midpiece, whip-crack acceleration and electrical streak |
| Beta | Notched tail that pulses harder at low health |
| Private Schooled | Polished glide and almost no trail |
| Ordered Online | Segmented shell, status light and stretchy gel ribbon |
| Redtail | Glowing ember core and twitchy motion |
| Prawn Again | Offset double image and wrong-way shadow |
| Not of This World | Faceted head, twin tails and visible reconfiguration |
| Sample 9 (proposed) | Oversized fizzing cap and a forward lurch before every turn |

These signatures must survive phone-size presentation. Colour reinforces identity; it must not carry it. Colours come from each damage type's visual language in `DAMAGE_TYPES.md`.

## What makes the characters feel different

- **Baseline:** reliability.
- **Alpha:** self-appointed dominance.
- **Beta:** desperation.
- **Private Schooled:** manipulation.
- **Ordered Online:** synthetic evasion.
- **Redtail:** uncontrolled curiosity.
- **Prawn Again:** temporal wrongness.
- **Not of This World:** alien devotion.
- **Sample 9 (proposed):** impatience.

Each one occupies a different emotional and gameplay space. That matters more than giving every sample more lore, more attacks or more stats.

## Implementation guardrails

1. Keep one passive and one Unique Feat per sample.
2. Use existing status bars, stamina, health and damage reactions. Avoid new meters.
3. Make every Feat's effect apparent within a second of activation.
4. Keep the base attack types distinct and preserve coverage across the seven damage types.
5. Use existing Alien possession, Acid Corrosion and Pool rules, Blood Bleed and lifesteal, and Static and Fire interactions. Do not introduce new damage rules just to support a character gag.
6. Make the unlock conditions teach the sample's playstyle where possible.
7. Keep the Scientist dry. The more ridiculous the specimen, the less the Scientist should sound impressed.
8. Keep the sperm's consciousness emotionally consistent with the core premise: it wants to reach the egg, and everything else is an obstacle, a distraction or an affront.

**The guiding test:** If removing a sample's name, colour and description makes it impossible to tell which one is on screen, its design is not distinctive enough yet.

---

## Supporting decisions

### Rules that come with the roster
- **Profiles go by their trait names**, so they no longer read as characters: Quick Recovery, Puppy Fat, Early Developer, Favouritism, Under Your Feet, Healthy Appetite, Overtired, Good Genes. Ranks carry over.
- **Game modes become "Experiments"** (for example, "Experiment #002: The Petri Dish"). This frees the word "sample" for characters. Internal ids (`s002`) stay as they are.
- **The sperm doesn't speak** (`VOICE_GUIDE.md`). Its consciousness talks to it; each sample's consciousness has its own persona (`CONSCIOUSNESS.md`) under the shared voice rules. Every consciousness line is written per sample, shared Feat gift lines included (`FEATS.md` 1).
- **A new soul every run** (1A, 1B are different souls of the same temperament), except Prawn Again, whose consciousness remembers earlier runs.
- **The consciousness doesn't know the lab exists.** It believes it is exactly where it is supposed to be. No Scientist, slide, sample, specimen, experiment or HUD in its lines.
- **Blind test for voice:** with the sample's name hidden, its tell (`CONSCIOUSNESS.md`) must identify the speaker.
- **The Scientist uses IDs.** The strain number is the roster position (Baseline is 1, Not of This World is 8). The letter is the run of that strain: 1A, 1B and so on.
- **Combat rules:** every sample follows the reconciliation decisions in `COMBAT_MATRIX.md` section 10 (Alien possesses; Fire does not spread on its own, so Redtail spreads Burn only through its Static; Acid's only ongoing damage is Pools).

### Starting weapons

Decided 18 Oct 2026 (`BASE_WEAPONS.md` section 5, decisions 4 and 5). Each sample has three starters, and all 24 weapons are exactly one sample's starter (27 if Sample 9 ships: its three are new). The level 1 weapon draft offers the sample's three and you take one; the other two stay in the pool for later drafts. Rules, numbers and limits for every weapon: `BASE_WEAPONS.md` and `WEAPON_UPGRADES.md`. The principles:

- **Mechanics express personality:** weapon behaviour reinforces the sample's identity, not just its damage types.
- **Upgrades exaggerate the joke:** each weapon becomes a more extreme version of its own concept as it levels.
- **Names set the tone:** irreverent, suggestive or absurd, and easy to tell apart in combat.
- **Damage types stay meaningful:** the joke never hides the damage type or what the weapon does.
- **Preserve the mystery:** Private Schooled, Ordered Online, Redtail, Prawn Again and Not of This World keep their unanswered questions.

#### 1. Baseline (Force / Blood)
The names are almost painfully mundane. The charm is how these unremarkable tools carry it through the impossible.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Standard Issue (Nut Shot) | Force Projectile | A straightforward shot. No gimmicks. It keeps firing even when the situation is objectively hopeless | The most ordinary weapon in the world develops an unreasonable amount of stopping power |
| Little Prick (Red Needle) | Blood Projectile | A small, precise needle. Individually unimpressive; repeated hits make enemies regret underestimating it | Little hits become a big problem through persistence and bleeding |
| Panic Button (Premature Detonation) | Force Burst | An emergency Force burst around the sperm when enemies get too close | The ordinary little survivor keeps finding ridiculous ways to stay alive |

#### 2. Alpha (Static / Force)
Alpha lectures everyone, optimises everything and blames everyone else.

| Weapon (was) | Type, attack | What it does | The joke |
|---|---|---|---|
| Red Flagship (Blue Screen) | Static Beam | A sustained beam that grows stronger the longer it stays on one target; switching targets resets it | Alpha's podcast. He can talk for hours about anything, provided nobody challenges his central thesis. Upgrades: longer rants, more influence, an audience of increasingly electrified listeners |
| Maximum Gains (Spray Gun) | Force Spread | A wide fan of pellets; the closer Alpha gets to the perfect angle, the more connect | Everything is optimisation and min-maxing. Even swimming through reproductive fluids is leg day. Upgrades: wider spreads, tighter patterns, gains that defy biology |
| Skill Issue (Meat Missile) | Force Burst | A heavy dollop that knocks enemies into one another for collision damage | Alpha never loses. If it goes wrong, it's a skill issue; if it goes right, it proves his superiority. Upgrades: bigger knockbacks and chain collisions |

Parked ideas (not in the 24; use them as upgrade or mutation names, or if a weapon is added): Pump and Dump (grows as it travels, then loses it all on impact or detonates), Unsolicited Advice (periodic sound-wave blasts: nobody asked), High-Value Male (marks a target to take more damage from Alpha's other weapons), Lamborghini Mindset (a movement charge), The Red Pill (exposes weaknesses or turns enemies on each other). Spare names: The Discourse, Mic Drop, Unfollow Me Bro, Sigma Spread, Alpha Strike, Protein Shake, Ratio'd, Top G, Dominance Hierarchy.

#### 3. Beta (Blood / Mucus)
Reluctance, endurance and a sudden breaking point. They should feel underwhelming at first, then frightening as Beta nears death.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Nocturnal Emission (Snot Trap) | Mucus Pool | A sticky patch that slows enemies, buying time for a creature that would rather not exert itself | The longer the fight drags on, the more the slide becomes a sticky bog |
| Nervous Wreck (Nutcracker) | Force Contact | Punishes enemies who get too close; can stagger or crack tougher targets | Patience runs out, and the lazy survivor turns vicious |
| One of These Days (Due Date) | Blood Projectile | Marks a target with a countdown; when it ends, part of the damage taken meanwhile lands again | A slow, harmless-looking problem becomes a catastrophic bill |

#### 4. Private Schooled (Acid / Alien)
Obligations, influence and social entanglement. Making enemies betray their own side is the natural end point.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Acid Spit | Acid Projectile | Acid globs that corrode targets, making them more vulnerable | Sticks and stones may break your bones; a little acid makes everything worse |
| Rent Free (Ghost Load) | Alien Projectile | A spectral shot that passes through enemies with an unsettling sense of authority | It gets more influential: haunting targets, or leaving consequences behind when they die |
| Ewww, Gross (Sticky Situation) | Mucus Projectile | Tapes enemies together with Mucus strands, so damage to one is shared with its associates | Private Schooled knows somebody who knows somebody. Nobody keeps their problems to themselves |

#### 5. Ordered Online (Mucus / Acid)
Chasing this specimen is a series of increasingly unpleasant surprises. Everything it leaves behind is a potential mistake.

| Weapon | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Hot Mess | Fire Pool | A persistent hazardous patch | The ground gets more unpleasant to cross, especially for anything following |
| Nappy Mines | Fire Burst | Delayed mines dropped behind the sperm. Pursuers find them at precisely the wrong moment | Mines trigger on proximity, chain together or leave a lasting stain |
| Blowing Bubbles | Mucus Projectile | Traps small enemies in bubbles, taking them out of the fight; contact pops a bubble | Capture pursuers, use bubbles as shields, or slow everything when they burst |
| Laser (4th starter, 22 Oct) | Fire Beam | A red laser beam held on one target | Extra beams, mirror bounces, a ring round the sperm (`MODIFIER_MATRIX.md`) |

The brief asked for Hot Mess to look like a corrosive slick for this sample. Open: `BASE_WEAPONS.md` section 5, issue 6.

#### 6. Redtail (Fire / Static)
It escalates from unwanted contact to oversharing to a catastrophic group conversation: absurd, intrusive and built for chain reactions.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| ~~The Runs~~ | Fire Pool (trail) | **Removed 22 Oct**: now a sperm passive any sample can take (`SPERM_PASSIVES.md`) | |
| Unwanted Contact (Static Cling) | Static Projectile | Chains electricity through crowds; other weapons arc again off Charged enemies | One unsolicited interaction becomes the whole crowd's problem |
| Sister Cousin (Seeker Siblings) | Blood Projectile | Homing siblings that never let go; a sibling that kills splits into two smaller ones | Kills grow the family, and sibling rivalry makes focused fire nastier |

#### 7. Prawn Again (Alien / Blood)
Memory, recurrence and consequences, without becoming a conventional Grim Reaper. The strangest, most supernatural kit.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Chest Burster (Tapeworm Seeder) | Alien Projectile | Infects enemies so they rise after death and fight for the sperm. The dead aren't finished making decisions | Infection spreads, allies linger, and even their departure hurts the living |
| Peekaboo | Alien Burst | The sperm vanishes; enemies swarm the wrong spot and hit each other, then suffer Fear when it reappears | Enemies grow unsure whether they've seen this exact death before |
| Eggs (Tooth Fairy) | Alien Burst | Drops spectral eggs that lure greedy enemies, then smite them. Eggs gain power while they wait | The longer an enemy puts off collecting its fate, the worse the reckoning |

#### 8. Not of This World (Fire / Alien / Static)
Intimacy, imitation and cosmic escalation. Everything is connected, everything can be absorbed, and every relationship threatens to become an astronomical event.

| Weapon (was) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| Soulmate Signal (Twin Telepathy) | Static Beam (anchored) | A beam joins the sperm to its twin; swimming sweeps it through enemies, and Charged targets arc on | The connection changes length and strength, and involves more parties than anyone intended |
| There Is No Spoon (Placental Siphon) | Force Projectile | Absorbs nearby enemy bullets and fires them back. Incoming aggression becomes a resource | Absorb more, hold it longer, or turn stolen shots into a shield |
| Family Ties (Black Hole) | Force Projectile (gravity well) | A vortex that pulls in enemies and bends shots; holes merge, and enough merges go supernova | Every problem gets dragged into the conversation until the room explodes |

#### 9. Sample 9, proposed (Acid / Fire)
Strip, then burn. Every weapon is new; all three fill gaps (Acid had one weapon; there was no Fire Beam). Names, descriptions and the 45 branch cards: `SAMPLE_9_ACRO.md` sections 3 to 6.

| Weapon (id) | Type, attack | What it does | Upgrade fantasy |
|---|---|---|---|
| `acro_cap` | Acid Contact | Headbutts the nearest enemy; heavy Corrosion; every 4th hit lunges through the target | Drill one target, breach a whole lane, or wear the stripped Shell yourself |
| `acro_spray` | Acid Spread | A short fan of 3 heavy, corroding droplets | Point-blank shotgun, a field of Acid Pools, or pellets that hunt armour |
| `acro_spark` | Fire Beam | A short beam that goes for enemies with no Shell left and burns them | Feed on Corroded enemies, string fire between them, or paint the slide by swimming |

Adaptive Biology (its passive) makes all three deal the active type (Fire, Alien or Static). Open: `BASE_WEAPONS.md` section 5, issue 7.

### Unlocks, in order
1. **Baseline:** available from the start.
2. **Alpha:** reach wave 10 of the Petri Dish in one run.
3. **Beta:** recover from below 10% health to full health in one run.
4. **Private Schooled:** beat the Petri Dish with any sample. It turns up once the hard work is done.
5. **Ordered Online:** open a Mythical box.
6. **Redtail:** survive one of the slide's rare big hazards.
7. **Prawn Again:** shown as "???" until earned. Land a boss's killing blow with Alien damage.
8. **Not of This World:** beat the campaign's furthest level (Level 1 today).
9. **Sample 9 (proposed):** strip 50 Shell layers in one run. Teaches its playstyle; in difficulty it sits around Ordered Online and Redtail, so it can be offered mid-curve whatever its number.

The first few come early, so players get variety quickly. The last two reward curiosity and mastery.


1. **Redtail, the Twins and Prawn Again:** retire them as samples (recommended), or keep them as secret ninth and tenth samples.
2. **Profile weapons:** each Profile either keeps its old starting weapons or becomes a trait only. Trait-only is recommended, so the sample owns the kit.

### Decided (18 Oct 2026)
1. **Redtail and Prawn Again carry over** as sample names (6 and 7); the Twins are retired as a sample (Soulmate Signal keeps the twin).
2. **Profiles are traits only**, so the sample owns the kit (its three starters).
3. **Positions 7 and 8:** the brief's weapon list had Prawn Again and Not of This World's kits under each other's headings. The kits follow the identity (Prawn Again remembers dying; Not of This World is the alien romantic), so they match the roster table above.
