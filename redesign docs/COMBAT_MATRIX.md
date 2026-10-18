# Master Combat-System Matrix (draft)

## Current design direction (17 Oct 2026)

**Status: working proposal; validate in playtests before treating values or effects as locked.** The canonical damage types are **Force, Acid, Static, Mucus, Blood, Soul and Fire**. Cooties, Oil and Water are out of scope and must not appear as active types in this matrix. Every open question from the reconciliation pass is settled in section 10; formulas and starting values are in section 11.

**This is the only place combat rules and statuses live.** `DAMAGE_TYPES.md`, `DEFENCE_TYPES.md` and `ATTACK_TYPES.md` hold identity only (what each thing is for, how it looks, what it is good and bad at) and point here for every rule. Other docs (`ENEMY_DESIGN.md`, `BASE_WEAPONS.md`, `MODIFIERS.md`, `UPGRADES.md`, `SAMPLES.md`) cite sections here rather than restating them. The CSVs in `tables/` are generated from this file (section 14); never edit them by hand. If anything elsewhere disagrees with this file, this file wins and the other doc is fixed.

### Design constraints

- Fast Android game: every reaction readable at a glance, with no hidden stacks, long recipes or delayed multi-step conditions.
- Keep four concepts separate: **damage type**, **attack type** (delivery), **modifier** (behaviour, `MODIFIERS.md`), **source**.
- Voice (decided 17 Oct 2026): the impulsive gameplay voice belongs to the **pre-incarnate consciousness**, which speaks to the sperm as "you" and is not the sperm. The Scientist stays the external, clinical observer. The sperm does not speak (`VOICE_GUIDE.md`).

### Shared vocabulary

- **Damage type:** what kind of harm an attack deals.
- **Attack type:** how the harm reaches the target (`ATTACK_TYPES.md`).
- **Status:** a temporary, readable condition on a creature (section 4).
- **World object:** a hazard on the ground with a visible edge and lifetime (Acid Pool, Mucus patch, blood pool, wax Pool), plus the shipped terrain (section 4). Only shipped ground objects are used, plus wax.
- **Reaction:** a deliberate interaction between two damage types, set off by one of the five trigger kinds below.

### Reaction rules

- Seven types create **21 unique pairs**. Every pair has one designed reaction in the matrix below.
- **Five trigger kinds, no others:**
  1. **State + hit:** a hit of one type lands on a target carrying the other type's visible state (Corroded, Snared, bleeding, burning, Possessed).
  2. **World object + hit:** a hit of one type lands on the other type's world object (Acid Pool, Mucus patch, blood pool).
  3. **Dual-type weapon:** one weapon that carries both damage types (Shocking Impact only, for now).
  4. **Pairing:** the existing Pairings system (two weapons you own, both Lv 5+). Spectral Combustion only, for now.
  5. **Feat:** a Feat that explicitly stands in for a hit, for reactions only. The Other Half's First Contact only (11.3). It sets off normal state + hit reactions; it never makes up new ones.
- Reactions do **not** trigger just because both types have touched the same enemy.
- Each reaction has one primary payoff. Do not stack burst damage, control, damage over time and resource gain into one reaction.
- **Fire size rule:** only Premature Evaporation, Flammable Mucus and Cauterise make bursts. Flashover, Arc Flash and Spectral Combustion hit one target.
- **Naming:** damage types keep plain, clinical names. Reaction names may use a dry pun, a corrupted familiar phrase, or the tone of a minor incident report, but the joke must fit the effect. Keep names short and easy to recognise at combat speed; never make the name carry essential instructions. British spelling.
- Prefer short effects with clear visual and audio cues. No hidden timers, multiple stacks or long recipes.
- **Players discover reactions.** The name shows the first time a reaction fires ("Unstable reaction: Flashover"), and it gets a Field Guide entry once found. There is no matchup chart up front.

## 1. Complete 21-pair reaction matrix

All effects below are **proposed**. Numbers, durations, radii and caps remain for playtesting.

| Pair | Reaction | Trigger kind | Trigger | One clear payoff | Size | Guardrails |
| --- | --- | --- | --- | --- | --- | --- |
| Force + Acid | **Corrosive Splash** | State + hit | A Force hit lands on a Corroded target | A small splash adds Corrosion to nearby enemies | Area (small) | Spreads the setup, not a second large burst; the splash cannot trigger another splash |
| Force + Static | **Shocking Impact** | Dual-type weapon | A dual-type Force/Static weapon lands a hit | A short local electrical burst around the impact | Area (small) | Only from a dual-type weapon, never from two separate hits; local burst, no chain |
| Force + Mucus | **Snot Rocket** | State + hit | A Force hit lands on a Snared enemy | Launches it in the hit direction; it leaves one small sticky patch where it lands | Single target | One launch and one patch; no extra stun or bonus damage |
| Force + Blood | **Blood Pressure** | State + hit | A heavy Force hit (the same threshold that knocks off a Shell layer) lands on a bleeding target | The wound bursts for one small area hit | Area (small) | One burst; no new Bleed stack and no large pool |
| Force + Soul | **Out-of-Body Experience** | State + hit | A Force hit lands on a Possessed enemy | It is launched and damages the first mate it collides with | Single target | One collision; Possessed carries on as normal |
| Force + Fire | **Flashover** | State + hit | A Force hit lands on a burning target | A tongue of flame jumps to one nearby enemy and adds to its Burn bar | Single target | One jump; no chain |
| Acid + Static | **Conductive Pool** | World object + hit | A Static hit lands in an Acid Pool | One electrical pulse travels across that pool | Area (pool) | Stays inside the visible pool edge; one pulse per pool |
| Acid + Mucus | **Slick Move** | World object + hit | An Acid hit lands on a Mucus patch | The patch is replaced by a short-lived Acid Pool | Area (patch) | Replaces the patch rather than layering two hazards; clear expiry |
| Acid + Blood | **Caustic Breach** | State + hit | An Acid hit lands on a bleeding target | Strips one Shell layer at once | Single target | Defence erosion only: no damage over time, no new wound; does nothing to a target without Shell; once per Bleed |
| Acid + Soul | **Soul Erosion** | State + hit | An Acid hit lands on a Possessed enemy | When Possessed ends, it bursts in a small Acid splash that adds Corrosion to nearby mates | Area (small) | One splash per Possession; compare with Corrosive Splash in playtest |
| Acid + Fire | **Premature Evaporation** | State + hit | A Fire hit lands on a Corroded target | Consumes the Corrosion in a modest close-range burst | Area (burst) | Never from an Acid Pool by itself; one burst; the Corrosion build-up resets |
| Static + Mucus | **Snot Socket** | World object + hit | A Static hit charges a Mucus patch | The next enemy entering it is briefly shocked | Single target | One trigger per patch; obvious charge cue; no stun loop |
| Static + Blood | **Blood Circuit** | World object + hit | A Static hit lands in a blood pool | One arc hits the nearest enemy standing in or beside the pool | Single target | One target; no pulse across the pool and no onward chain (unlike Conductive Pool) |
| Static + Soul | **Interference Pattern** | State + hit | A Static hit lands on a Possessed enemy | Possessed lasts a fixed time longer | Single target | Once per Possession |
| Static + Fire | **Arc Flash** | State + hit | A Static hit lands on a burning target | One short arc jumps to the nearest other enemy | Single target | One jump; no extra Burn, stun or chain |
| Mucus + Blood | **Caught in the Clot** | World object + hit | A Mucus hit lands on a blood pool | The pool thickens: the first enemy to cross it is Snared, then the pool is gone | Single target | One catch, then the pool is gone |
| Mucus + Soul | **Held in Suspension** | State + hit | A Mucus hit lands on a Possessed enemy | It is pinned in place for a moment | Single target | Short pin; no extra damage or status |
| Mucus + Fire | **Flammable Mucus** | World object + hit | A Fire hit lands on a Mucus patch | The patch flares once: everything standing in it ignites (full Burn bar), then the patch is gone | Area (burst) | One flare; no Mucus slow left behind; the fire cannot relight itself |
| Blood + Soul | **Blood Donor** | State + hit | A Blood hit lands on a Possessed enemy | You heal a small fixed amount | Single target | Once per Possession; no new resource meter |
| Blood + Fire | **Cauterise** | State + hit | A Fire hit lands on a bleeding target | Consumes the Bleed for one immediate burst | Area (burst) | The burst must make up for ending the Bleed; no fresh Burn by default |
| Soul + Fire | **Spectral Combustion** | Pairing | The Soul/Fire Pairing (two weapons you own, both Lv 5+) hits a burning, Possessed enemy | It ignites at once (full Burn bar) and Possessed ends | Single target | Rare by design; the first time it fires, the Scientist gets his Tier 3 line (VOICE_GUIDE.md) |

### Reaction quality decisions

- **No redundant damage over time:** Caustic Breach strips a Shell layer; it does not add a corrosive wound.
- **No extra sub-systems:** Out-of-Body Experience launches an enemy rather than spawning a fragment; Blood Donor is a small capped heal, not a resource.
- **Soul pairs use Possessed:** all six Soul reactions trigger on a Possessed enemy. The Soul Mark is retired.
- **Separated similar world reactions:** Conductive Pool pulses across an Acid Pool; Blood Circuit arcs from a blood pool to one enemy.
- **Controlled Fire interactions:** three Fire pairs consume a setup for a burst (Corrosion, a Mucus patch, a Bleed); three hit a single target. Fire does not make every surface explode.
- **No reaction retriggers itself.** A reaction-created patch, arc, burst or splash cannot immediately set off the same reaction again. Limit chain jumps, patch triggers and repeat healing (Blood Donor and Interference Pattern are once per Possession).

## 2. Damage-type identities

| Type | Core job | Signature gameplay | Keep distinct from |
| --- | --- | --- | --- |
| **Force** | Burst and displacement | Impact, knockback, Poise pressure, wall collision; heavy hits knock off a Shell layer | Static: physical impact and positioning, not electrical chaining |
| **Acid** | Defence erosion and area denial | Corrosion (builds to permanent Shell layer loss), Acid Pools; no damage over time on enemies (Pools are the only ongoing Acid damage) | Blood: weakens defence rather than scaling wound damage |
| **Static** | Chain pressure and action disruption | Charge, bounded arcs, conditional interruption | Force: network and charge effects, not physical knockback |
| **Mucus** | Movement control and setup | Snared, Conjoined, patches; smothers Fire (Snared clears a Burn bar) | No damage over time; avoid stacking slow, root and snare variants |
| **Blood** | Wounds and extraction | Bleed, wound thresholds, blood pools, limited sustain | Acid: wound economy, not corrosion |
| **Soul** | Mind control | Soul build-up to Possessed (the enemy fights its mates for a few seconds); all Soul reactions use Possessed | No defence bypass; Fear is a separate status, not a synonym for Soul |
| **Fire** | Ignition and consuming setups | Burn bar build-up with a short damage over time; at full, one Ignition flare on that target; consuming compatible setups | Not a universal explosion trigger; no automatic spread |

Each type has one primary verb, one recognisable visual and sound cue (`DAMAGE_TYPES.md` visual language), and a clear non-goal. Use shape and motion as well as colour so effects stay readable on a phone screen.

### Type rules

What each type does beyond its statuses (section 4) and its defence interactions (sections 3 and 7).

- **Force:** high immediate physical damage. Builds Poise and causes Knockback. A wall or hazard adds a payoff only on an actual collision. Attacker speed at contact may add impact, kept readable (no maths for the player). A shockwave exists only where an attack is designed to make one; it is never automatic on a stagger. A heavy hit (11.3) knocks off a Shell layer and triggers Blood Pressure.
- **Acid:** direct damage builds Corrosion; Acid Pools are its only ongoing damage, and there is no damage over time on enemies. Acid does not stop Membrane regeneration or bypass Membrane.
- **Static:** Static hits make the target Charged; Charged enemies pass arcs on (bounded, 11.5). Explicitly conductive world objects carry one pulse or one arc (Conductive Pool, Blood Circuit, Snot Socket). Static interrupts only through Poise, and only when an attack is tagged for it. Static recharges Membrane, so it is a poor choice against Membrane enemies (a risk the player can see).
- **Mucus:** Snares, Conjoins, leaves patches and smothers Fire. No damage over time. Does not cushion Force.
- **Blood:** applies Bleed; a reaction may consume a Bleed for one payoff (Blood Pressure, Cauterise) without adding a new stack. Extraction heals a little on kills of bleeding enemies. Blood pools come from section 4's sources only. Blood never maximises sustained damage, burst, healing and resource gain at once.
- **Soul:** build-up to Possessed is its only control. No defence bypass of any kind (the essence and resource ideas are retired). Fear is a separate status with its own sources.
- **Fire:** fills the Burn bar (direct hits and Fire Pool footprints); Ignition at full; no automatic spread. Fire's Pool attacks are attack footprints, not world objects that reactions use (decision 27). Becoming Snared puts it out.

## 3. Defensive layer matrix

**Five distinct defences:** Squishy, Membrane, Shell, Thorns and Evasion. These are the only defences; there are no extra traits. Enemies and the player can both have any of them (the player through upgrade cards, or built into some samples, weapons and Feats; decision 31). Numerical values remain for playtesting.

| Defence | Core rule | Strength / identity | Limits and counterplay |
| --- | --- | --- | --- |
| **Squishy / Absorption** | Proportionally reduces blunt physical impact (Force); may also reduce impulse, knockback and collision. | Soft tissue yields under impact. Big hits still hurt, but are softened. | Blunt only: cuts (such as a Blood slash) go through normally. Does not resist Acid, Static, Mucus control, Blood effects, Soul or Fire. |
| **Membrane** | A separate Membrane pool absorbs eligible incoming damage before health. It regenerates after a brief period without Membrane damage. | Temporary protection that rewards breaking contact. Force is poor at getting through it. | Sustained pressure delays recovery. State and recharge clearly visible (blue; on the player, the existing armour bubble). Does not block already-applied statuses or hazards. |
| **Shell** | Finite layers, each subtracting a fixed amount from qualifying physical hits. Each layer has a small amount of its own health. Lost layers are gone for the encounter. | Rigid protection against repeated small physical hits. One brown ring per layer. | Ordinary hits wear a layer down slowly; Acid's Corrosion strips one much faster; a heavy Force hit knocks one off at once. Layer loss is always visible. |
| **Thorns** | Returns damage once when a qualifying Contact hit connects. Does not mitigate the hit. | Makes close-range attacks costly while the attacker keeps its full payoff. | Contact only; ranged attacks and hazards never trigger it. An Evasion miss means no contact and no retaliation. Damage returned is bounded and readable. |
| **Evasion** | A miss chance against Contact, Projectile and Spread hits (rolled per pellet). A miss shows a visible "miss" puff and avoids the hit and everything attached to it. | Protection by luck and agility rather than damage reduction or a pool. | Never applies to Burst, Beam or Pool, so area attacks are the reliable answer. Does not clear an existing status or hazard. (Autorun's movement keeps the everyday word "dodge".) |

### Shared defence rules

- **Resolve attack components, not just damage-type labels.** Direct hit, status application, hazard, impulse and area coverage may each need their own eligibility.
- **Blocking a hit does not clear effects already applied.** A defence only prevents an attached status when it prevents the hit that applies it.
- **Area attacks ignore Evasion.** Burst, Beam and Pool use their actual footprint; standing at the edge of a Burst can still take the edge hit.
- **Hazards are separate from the initial hit.** Avoiding a projectile gives no immunity to an Acid Pool, a Fire Pool or other hazard entered later.
- **Thorns resolves after a qualifying hit connects,** once per hit, never once per damage component.
- **Shell layer loss:** ordinary hits slowly, Acid fast, heavy Force at once. Lost layers stay gone.
- **Membrane recovery has one simple rule and a clear tell:** a brief no-damage delay. A full Membrane gives no immunity to statuses, control or hazards. Force still damages the pool (it is resisted, never unbreakable), and the resistance ends when the Membrane breaks.
- **Squishy and Shell differ by method:** Squishy is a percentage (blunt only); Shell subtracts a fixed amount per layer. Big Force hits still feel big through Squishy. Squishy shows the hit landing and being absorbed, never something that looks like a miss.
- **Evasion is the one deliberate dice roll** in the system, so its "miss" puff always shows. Keep the chance well below half (cap 50%, 11.4).
- **Thorns variants** (bleeding or charged retaliation) are explicit, named variants, never baseline Thorns.
- **Every defence has readable counterplay.** No enemy needs one specific damage type to be fought at a reasonable pace; Acid and heavy Force are readable ways to remove Shell, not mandatory types.

### Implementation rules

- Resolve each attack into components: direct damage, status application, impulse or control, hazard. Hit order is 11.1.
- If the hit that applies a status is prevented, so is the status, unless a rule says otherwise. Existing statuses and hazards stay until their own rule removes them.
- Never apply Thorns more than once per attack.
- Prefer one-step reactions; no recursive splashes or arcs, unbounded propagation, hidden counters or long setup chains.

### Defence and mechanic interactions (one row each)

| Interaction | Status | Rule |
| --- | --- | --- |
| Acid erodes Shell | Accepted | Corrosion builds to permanent layer loss. Does not disable Membrane or bypass defences generally. |
| Heavy Force can shed a Shell layer | Accepted | A thresholded heavy hit (11.3) removes one layer. The same threshold defines a heavy hit for Blood Pressure. |
| Ordinary hits wear Shell | Accepted | Each layer has a little health; ordinary qualifying hits wear it slowly. |
| Membrane resists Force impact | Accepted | Less drain and less knockback while the Membrane is up. |
| Static recharges Membrane | Accepted | +25% capacity, once per 5 s; visible; no supercharge. |
| Membrane absorbs eligible direct damage | Accepted | Status prevention depends on whether the applying hit was prevented. |
| Shell and Burn remain separate | Accepted | Shell mitigates the physical component, not heat. |
| Squishy absorbs blunt impact | Accepted (verify) | Proportional; blunt only; no status resistance. |
| Thorns retaliate once on contact | Accepted (verify) | Once per qualifying Contact hit. |
| Evasion misses eligible hits | Accepted (verify) | Miss chance on Contact, Projectile and Spread only; a miss prevents the hit and its attached effects. |
| Membrane and Soul effects | Accepted (verify) | Soul damage is absorbed normally; no bypass. Build-up applies only if the hit isn't blocked. |
| Snared slows movement | Testing | Snared weakens autorun's dodging (movement); it does not change Evasion's miss chance. |
| Mucus smothers Fire | Proposed | Becoming Snared clears the Burn bar. A Mucus patch hit by Fire still burns (Flammable Mucus). Water is not a damage type. |
| Force drives targets into hazards | Proposed | Knockback into a wall or a world object pays off only on an actual collision (a wall: 40% of the hit, 11.5). No bonus in open space. |

## 4. Status ownership and counterplay

Statuses live on creatures. World objects (Acid Pool, Mucus patch, blood pool, wax Pool, and the shipped terrain) are listed separately below. The player can suffer every status except Possessed.

| Status | Owner | Trigger | Consequence | Counterplay and limit | Distinction | Design status |
| --- | --- | --- | --- | --- | --- | --- |
| Poise Pressure | Force (Static when tagged) | A qualifying Force impact, or a Static hit explicitly carrying Poise | One shared bar (11.2); at full, a brief stagger or interrupt | Not every hit adds Poise; drains after a spell without qualifying hits; elites and bosses have bigger bars and shorter staggers, never full immunity | Force adds by impact; Static only when an attack explicitly carries Poise or interruption pressure | Accepted |
| Knockback | Force | A qualifying Force impact | Repositions the target; a collision may add a payoff | Space, Squishy, an active Membrane, anchoring; bonus only on an actual collision | Not a damage multiplier | Proposed |
| Corrosion | Acid | Acid hits, or standing in an Acid Pool | A visible bar (11.2). On a Shell creature, a full bar strips one layer for good and resets. Any creature can carry it; it is the "Acid-coated" state reactions use | No timer or stacks; no damage over time | Acid's only status; Pools are its only ongoing damage | Accepted |
| Charge | Static | Any Static hit | The target is Charged (3 s): it takes +20% Static damage and passes arcs on; it discharges one arc on death | Fixed jump limit (3) and 70% falloff; never interrupts by itself | A conductor state, not a build-up bar; interrupts come through Poise | Proposed |
| Snared | Mucus | A Mucus hit, or entering a Mucus patch | Restricts movement (also covers "Mucus-stuck" and "Adhered"). Becoming Snared clears a Burn bar: Mucus smothers Fire | Short duration; one clear control strength per effect | Slow, root and snare are not interchangeable labels | Proposed |
| Conjoined | Mucus | Two Snared creatures touch, or one Mucus attack's area covers several at once | Stuck together in one shared green membrane: none can move, and they may hit each other | Capped group size; short | Distinct from Snared: it needs two or more creatures | Proposed |
| Bleed | Blood | A qualifying Blood hit | Damage over time; a reaction may consume it for one payoff | Stack cap and decay. A creature that dies while bleeding leaves a small blood pool | Wounds are distinct from Acid erosion | Proposed |
| Extraction | Blood | An enemy dies while bleeding | Heals you a little | 1% of max health per kill, max 6 health per second; never on every Blood tick | Separate from ordinary damage and healing | Proposed |
| Possessed | Soul | The Soul bar fills (11.2) | The enemy fights its own mates for a few seconds | Clear duration and tell; cooldown before it can repeat; elites shorter; bosses reduced, never fully controlled; the player is exempt | The only control Soul owns; not Fear | Accepted |
| Fear | Peekaboo's BOO; a future Feat ("Jump Scare") | An attack explicitly tagged with Fear | Enemies flee for 2 s | Duration cap; no enemy applies Fear | Fear is a status, not the Soul type itself | Proposed |
| Burning | Fire | Fire hits, or standing in a Fire Pool footprint | A visible Burn bar (11.2); while it holds Burn the target takes a short damage over time; at full, Ignition: one flare on that target, then the bar resets | No spread except through reactions; Snared puts it out | Do not add extra effects to every Fire hit | Accepted |

### World objects

| Object | Made by | Does | Limit | Design status |
| --- | --- | --- | --- | --- |
| Acid Pool | Acid Pool weapon, Acid Bubble, Slick Move, acid crypts (terrain) | The only ongoing Acid damage; builds Corrosion on anything standing in it | Visible edge and lifetime; never indefinite | Proposed |
| Mucus patch | Mucus Pool weapon, Snot Bubble, Snot Rocket | Snares what enters it; ingredient for Slick Move, Snot Socket, Flammable Mucus | Short-lived, clear edge | Proposed |
| Blood pool | Creatures dying while bleeding; Blood Pool weapon; Mosquito | Ingredient for Blood Circuit and Caught in the Clot | Small, short-lived | Proposed |
| Terrain (shipped, `terrain.js`) | The arena | Nodules, mitochondria, acid crypts, cilia beds, currents and slicks keep their current behaviour | Unchanged | Accepted |
| Wax Pool | Birthday Candle only | Hardens into a temporary wall that blocks movement and shots | The one new ground object; short-lived | Proposed |

Status labels here are functional names, not necessarily player-facing copy. Keep them short and consistent; use the Field Guide for precise definitions, and keep repeated HUD status effects mostly silent. For each status that ships, specify its duration, refresh and stack rule, how it ends, and any resistance. If a status has no distinct consequence, merge or remove it.

## 5. Enemy role × counterplay matrix

Enemies teach positioning, target priority or build choices; none requires a specific damage type. One row per role in `ENEMY_DESIGN.md` section 3 (that list is the master). Roles combine (e.g. Shooter + Sniper).

| Role | Threat | Player answer | Useful types / tools | Must not become |
| --- | --- | --- | --- | --- |
| Chaser | Steady contact pressure | Move, kite, general damage | Any; Mucus slows, Force pushes | Unavoidable contact damage |
| Sprinter | Closes distance fast | Prioritise it before contact (FASTEST) | Mucus Snare, Force knockback, Static interrupts | An instant hit with no tell |
| Tank | High effective health and slow pressure | Strip defence, flank, avoid commitment | Acid erosion, Force displacement (TOUGHEST picks it) | Mandatory Acid in every build |
| Shooter | Projectiles while you move | Break line, close distance (SHOOTERS FIRST) | Movement, Force displacement, Mucus control | Off-screen unavoidable damage |
| Swarm | Surrounding and body-blocking | Move, clear a lane, use area damage | Static chains, Burst, Pool, Mucus (Conjoined), Soul (Possessed has mates to fight) | Unavoidable contact damage |
| Charger | Telegraphs a heavy hit or collision | Leave the lane, bait, interrupt | Force Poise pressure, Mucus setup, movement | A raw-damage check |
| Support | Heals, buffs or grants Membrane | Focus, interrupt, isolate | Acid erosion, Static tagged interruption, Soul (turn a mate on it) | Mandatory hard-counter checks |
| Summoner | Adds enemies | Prioritise the summoner | Area damage for the adds; SHOOTERS FIRST picks summoners | Endless spawns |
| Controller | Sticky zones, lane denial, persistent hazards | Route round, read the edge, remove the source | Movement, Force displacement, Acid, Mucus and Fire where the hazard supports them | Removing every safe route; invisible damage |
| Carrier | Leaves, carries or releases a reaction ingredient | Recognise its state and exploit it | The reaction that uses its ingredient | A mandatory combo |
| Leech | Steals health or another defined resource | Burst it, disengage, deny contact | Force displacement, Mucus Snare | Punishing damage twice without warning |
| Relay | Strengthens nearby enemies or enables their interactions | Break the cluster or link, prioritise the relay | Static interactions, Force to separate enemies | Making Static the only group answer |
| Sniper | High damage after a clear wind-up | Read the tell, change lane | Movement; Force or Static within explicit interrupt windows | Unreadable phone-screen one-shots |
| Elite | A familiar role plus one modifier | Suitable targeting policy and build (ELITES & BOSSES) | As its base role | A new rule to learn |
| Boss | Tests one mechanic with larger stakes | Learn the telegraph, use a clear window, manage adds | Varied by boss; at least two viable answers | Full immunity to all control, or endless stun-lock |

## 6. Pair coverage and implementation rules

The 21 pairs in section 1 are the complete canonical pair inventory. Do not reintroduce a nine-type / 36-pair count or the old 28-reaction framework.

For implementation and QA, record for each reaction:

- Pair and order-independence.
- Trigger kind (state + hit, world object + hit, dual-type weapon, Pairing) and the exact requirement.
- Immediate payoff and whether it consumes a state, wound or patch.
- Duration, radius, target eligibility and boss scaling.
- Visual and audio cue, and player counterplay.
- Chain and retrigger limit, and a rough power budget (burst, control, area, sustain or setup).
- Status: **Proposed / Testing / Accepted / Rejected**, with playtest evidence.

Use these coverage labels in any future cross-system table: **S** = signature/strong interaction; **C** = conditional or ability-tag dependent; **—** = no special interaction intended; **?** = unresolved. A blank or dash is not immunity.

## 7. Coverage against the five defences

Read each cell by **damage component**, not damage-type name alone: direct hit, status application, hazard, or impulse. Blocking a hit does not remove an effect already applied or a hazard already created.

| Type | Squishy | Membrane | Shell | Thorns | Evasion |
| --- | --- | --- | --- | --- | --- |
| Force | Proportionally reduces the hit and softens knockback and collision | Drains it less efficiently and knocks back less while up | Reduced by the fixed layer value; a heavy hit knocks off one layer | Triggers only on a qualifying Contact hit | Contact, Projectile and Spread hits can miss; Burst, Beam and Pool always land |
| Acid | No effect on Acid damage, Corrosion or Pool exposure | Absorbs eligible direct damage; Corrosion applies only if the hit got through; does not stop regeneration | Corrosion strips layers fast; lost layers stay gone | Not triggered by Pools or remote hazards | As Force; never protects from a Pool already on the ground |
| Static | No effect on Charge or interruption unless there is an impulse component | Recharged: +25% capacity, once per 5 s | Not reduced unless the component is physical | Not triggered by arcs or remote effects | As Force; an active arc follows its own rule |
| Mucus | No effect on Snared or Conjoined | May absorb the carrier hit; does not erase a patch already placed | Does not reduce Snared or movement control | Not triggered by patches | As Force; a patch still Snares whatever enters it |
| Blood | Cuts go through (blunt only); Bleed and Extraction not reduced | May absorb the carrier hit; an existing wound is not removed | Reduces the physical component; Bleed ticks not reduced | Not triggered by Bleed ticks | As Force; does not undo an applied wound or a pool |
| Soul | No effect on build-up or Possessed unless there is an impulse component | Absorbs eligible direct Soul damage; no bypass; build-up applies only if the hit isn't blocked | Reduces physical components; no bypass | Not triggered by ranged Soul attacks | As Force; does not end Possessed |
| Fire | No effect on heat or Burn unless there is an impulse component | May absorb a covered hit; Burn applies only if the hit applies it; no protection from a Fire Pool entered later | Reduces the physical component only; Shell and Burn are separate | Not triggered by Burn or Pools | As Force; leaving a Fire Pool limits exposure but does not empty the Burn bar |

Do not infer blanket type immunities from this table.

## 8. Priority audit and definition of done

| Priority | Issue | Decision / test |
| --- | --- | --- |
| P0 | All 21 pairs need distinct, legible reactions | Playtest whether each payoff is noticed and understood at mobile speed |
| P0 | Similar reactions risk feeling interchangeable | Compare Conductive Pool vs Blood Circuit, Premature Evaporation vs Corrosive Splash, and Soul Erosion vs Corrosive Splash; tune shape and trigger as well as damage |
| P1 | Too many conditions can hide reactions | Only the five trigger kinds; no requirements that depend on obscure enemy variants |
| P1 | Control and interruption can lock enemies down | One catch per patch, short control windows, Poise thresholds, Possessed cooldown, no retrigger loops |
| P1 | Reaction damage can multiply excessively | Set a primary power budget; do not stack burst, damage over time, vulnerability and chain without justification |
| P1 | Fire can dominate all surfaces | Only Premature Evaporation, Flammable Mucus and Cauterise make bursts; no automatic spread |
| P2 | Status vocabulary may expand without adding value | Merge effects with the same player-facing consequence; keep duration and stack rules explicit |
| P2 | Mobile readability | Test at phone size; use shape, motion and sound as well as colour |

Definition of done:

- [ ]  Seven canonical types only: Force, Acid, Static, Mucus, Blood, Soul, Fire.
- [ ]  All 21 pairs have one of the first four trigger kinds and one clear payoff (the Feat kind only borrows them).
- [ ]  Every reaction has limits on duration, range, consumption and retriggering.
- [ ]  Five defences (Squishy, Membrane, Shell, Thorns, Evasion) stay distinct and create no blanket type immunities.
- [ ]  Every status has a consequence, an end rule, a stack rule where needed, and counterplay.
- [ ]  Enemy roles permit at least two viable player responses; no routine enemy requires one specific type.
- [ ]  Proposed mechanics are validated in fast mobile playtests before being marked Accepted.
- [ ]  Proposed / Testing / Accepted labels in sections 3 and 4 match what was actually approved.
- [ ]  Damage type, attack type, modifier and source are separate fields in code and data.
- [x]  The low-confidence Soul reactions are decided (rebuilt around Possessed, decision 6).

## 9. Remaining updates (merged)

The 17 Oct hand-off ("Combat Matrix Remaining Updates") is fully merged: design constraints into the top of this file, defence rules and interaction rows into section 3, the low-confidence reactions into section 10 (decision 6), and the checklist into section 8. The number is kept so older references still land here.

## 10. Reconciliation decisions (17 Oct 2026)

Settled one by one after a cross-doc review (27 to 32 added later on 17 Oct). Every redesign doc follows these.

| # | Question | Decision |
| --- | --- | --- |
| 1 | What is a "named combo"? | Gone. Four trigger kinds instead: state + hit, world object + hit, dual-type weapon (Shocking Impact), Pairing (Spectral Combustion) |
| 2 | How many Fire reactions? | Six; only three make bursts (Premature Evaporation, Flammable Mucus, Cauterise) |
| 3 | Acid and Shell | Corrosion builds to permanent layer loss; no timer or stacks |
| 4 | Fire ignition | Burn bar build-up; at full, one Ignition flare on that target, then reset; no automatic spread |
| 5 | Squishy and cuts | Blunt only; cuts go through |
| 6 | Shaky Soul reactions | All five Soul reactions rebuilt around Possessed; Soul Mark retired |
| 7 | One attack type per attack? | Yes, plus an optional leftover hazard (patch, pool, trail) |
| 8 | Trapped Wind | Squishy, not Dodge; Fire lights it; feeds Arc Flash and Flashover |
| 9 | Role lists | `ENEMY_DESIGN.md`'s 15 roles are the master |
| 10 | Celestial drop voice | Scientist Tier 2; the "ALL the papers" Tier 3 line moves to the first Spectral Combustion |
| 11 | First-sighting voice | Write a Scientist line and a consciousness line per enemy; each sighting shows one |
| 12 | Defence rule status | The five disputed rules are Accepted |
| 13 | Acid and Mucus states | One each: Corrosion ("Acid-coated"), Snared ("Mucus-stuck", "Adhered") |
| 14 | Blood pool sources | Creatures dying while bleeding, the Blood Pool weapon, Mosquito |
| 15 | Player-side rules | The player can have all five defences and every status except Possessed |
| 16 | How Dodge works | A miss chance on Contact, Projectile and Spread (per pellet), with a visible "miss" puff |
| 17 | Dodge naming | The defence is now **Evasion**; autorun keeps "dodge" for movement |
| 18 | Ordinary hits on Shell | Wear layers slowly (each layer has a little health) |
| 19 | Internal ids | Rename to force, acid, static, mucus, blood, soul, fire, in one dedicated session straight after a merge into `main`, with save-data migration |
| 20 | Colours | The visual language in `DAMAGE_TYPES.md` and `DEFENCE_TYPES.md` wins; `STYLE.md` and the v10 colours follow it |
| 21 | Lab view | Retired: the Arcade look (colour, rings, bounded hazard edges) is the only view |
| 22 | Are reactions player-facing? | Discovered: name on first trigger, then a Field Guide entry |
| 23 | Acid damage over time | None on enemies; Acid Pools are the only ongoing Acid damage |
| 24 | Conjoined trigger | Two Snared creatures touch, or one Mucus attack covers several at once |
| 25 | What puts Fire out | Becoming Snared clears the Burn bar |
| 26 | Birthday Candle wax | Keeps wax Pools: wax hardens into a temporary wall (a justified exception) |
| 27 | Ground objects | Only the shipped ones (terrain, Acid Pools, Mucus patches, blood pools, Skid Mark's trail, Tooth Fairy's teeth) plus wax. Burn zones, corrosive slicks, clot patches and Heartburn's reflux puddles are cut. Fire's Pool attacks (Burning Ground, Pub Crawl's trail, Matchstick's trail) are attack footprints that fill Burn bars, not reaction ingredients |
| 28 | Acid colour | Shocking pink stands, even beside the pink campaign levels |
| 29 | Soul Purpose name clash | The Force + Soul reaction is renamed **Out-of-Body Experience**; the Soul Burst weapon (M34) keeps Soul Purpose |
| 30 | First Contact | The Other Half's Feat is a fifth trigger kind (Feat): it counts as a hit of the old and new type for reactions only, capped at 8 per use |
| 31 | Player defence sources | Upgrade cards (Genome slots), or built into some samples, weapons and Feats (no slot). Assimilation is dropped |
| 32 | Built-in defences | Rare, at most one per source: The Cold Parcel has 20% Evasion, Thorny Onesie gives Thorns; no sample Feat has one |
| 33 | Reaction damage | The payoff is the whole effect. Only reactions whose payoff is a burst or a hit deal damage (11.3); control, heal and duration reactions deal none |
| 34 | Corrosion without Shell | The bar builds as if the target had one layer; a full bar on a creature with no Shell makes it visibly **Corroded** for 4 s (no damage over time), then resets |
| 35 | Membrane and statuses | A hit fully absorbed by Membrane applies no status and fills no bar; if any damage gets past the Membrane, statuses and bars apply in full |
| 36 | Burning with rapid fire | One shared burn per target: each Fire hit adds 20% of its damage to the burn and refreshes the 3 s timer; the burn holds at most 50% of max health. Ignition is separate |
| 37 | Shell wear | The outer layer loses exactly what Shell blocked on that hit; at 0 it breaks and the next layer takes over at full; excess wear does not carry. A heavy Force hit also removes one layer outright |
| 38 | Shipping the 21 reactions | All 21 stay as the design inventory; none is committed to ship until playtests show it is noticed and told apart. State + hit and world object + hit reactions are the core; dual-type, Pairing and Feat reactions are deliberate rare specialists |

## 11. Formulas and starting values (17 Oct 2026)

Starting points for the first build, chosen against today's code (player 120 health; enemies 4 to 420 health; armour 0 to 12). Every number is for tuning in playtest; the formulas are the rules.

### 11.1 How a hit resolves (in order)

1. **Evasion roll** (Contact, Projectile, Spread only; Spread per pellet). A miss stops here: no damage, no status, no Thorns.
2. **Raw damage** = weapon damage × buffs. Build-up bars and the heavy-hit test use this number.
3. **Membrane** absorbs first (Force does 50% to it).
4. **Shell** subtracts 3 per remaining layer (minimum 1 damage gets through) and wears the outer layer.
5. **Squishy** removes 35% of blunt (Force) damage; cuts go through.
6. **Crit** multiplies what is left (5% chance, ×1.6 today). Crits do not fill bars or make a hit heavy.
7. Health takes the result; then status bars fill, Thorns retaliates, reactions check their triggers.

### 11.2 Build-up bars (Corrosion, Burn, Soul, Poise)

- `fill += raw damage of that type ÷ (bar size × target max health)`. A bar is full at 1.
- **Bar sizes:** Corrosion 0.25 (per Shell layer), Burn 0.4, Poise 0.3, Soul 0.6. Elites ×1.5, bosses ×3.
- **Drain:** no qualifying hit for 2 s, then the bar empties over 2 s.
- **Payoffs:** Corrosion strips a layer; Burn triggers Ignition; Poise staggers; Soul Possesses. Each bar resets after its payoff.
- Charge is not a bar (11.4).

### 11.3 Thresholds and reactions

- **Heavy Force hit:** one Force hit whose raw damage is at least 15% of the target's max health (elites 10%, bosses 5%). Spread pellets are judged one by one. It knocks off a Shell layer and triggers Blood Pressure.
- **Reaction damage (decision 33):** only reactions whose payoff is a burst or a hit deal damage. The three big bursts (Premature Evaporation, Flammable Mucus, Cauterise) deal 150% of the triggering hit's raw damage as area (Cauterise also adds the Bleed's remaining damage). Corrosive Splash, Shocking Impact, Blood Pressure, Out-of-Body Experience (the collision), Flashover, Conductive Pool, Blood Circuit, Arc Flash and Soul Erosion deal 60%. Snot Rocket, Slick Move, Caustic Breach, Snot Socket (the shock is a short stun, no damage), Interference Pattern, Caught in the Clot, Held in Suspension, Blood Donor and Spectral Combustion deal none beyond what their payoff states.
- **Reaction lockout:** each reaction has a 1.5 s lockout per target (bosses 3 s). Anything a reaction creates cannot set off that same reaction.
- **Dual-type weapon:** shots alternate Force, Static, Force, Static. Shocking Impact fires on each Static shot that lands after a Force shot.
- **Spectral Combustion Pairing:** Soul Beam + Fire Pool (Burning Ground), both Lv 5+. A secret, like today's Pairings.
- **First Contact (Feat trigger):** when The Other Half performs First Contact, it shifts type, then counts as a hit of **both** the type it left and the type it entered on every enemy on screen, for reactions only (no damage, no bar fill, no Thorns). Each enemy fires the state + hit reactions those two hits would set off (e.g. leaving Static for Fire: Arc Flash on burning enemies, Interference Pattern on Possessed ones, Premature Evaporation on Corroded ones, Cauterise on bleeding ones). At most one reaction per enemy and 8 per use, nearest first; normal lockouts and reaction damage apply. Spectral Combustion stays Pairing-only. Blood Pressure still needs a heavy hit, so it never fires from the Feat.
- **Discovery:** the first time a reaction fires, a 2 s toast "Unstable reaction: <name>" near the top (no pause), and its Field Guide entry unlocks. Save key `META.rxSeen` (list of reaction ids). Later triggers show a small name pop over the target.

### 11.4 Defences

| Defence | Starting values |
| --- | --- |
| Squishy | 35% off blunt damage; 50% less knockback |
| Shell | 3 off per layer (floor 1); each layer has 15% of max health. Layers: light enemies 1, Diatom 2, Water Bear 4, bosses up to 6 |
| Membrane | 50% of max health; starts to recharge after 2 s without Membrane damage, full in 2 s; Force does 50% to it. Static **recharges** it (+25% capacity, once per 5 s); there is no supercharge |
| Evasion | 35% miss chance (cap 50%) |
| Thorns | Returns 5 + 35% of the hit |

### 11.5 Statuses

| Status | Starting values |
| --- | --- |
| Corrosion | Bar size 0.25 of max health per Shell layer, and as one layer on a creature with no Shell (11.2); a full bar strips one layer for good and resets, or with no Shell makes the creature Corroded for 4 s (decision 34). No damage over time |
| Snared | 55% slow for 2.5 s; refreshes on hit; clears a Burn bar |
| Conjoined | 3 s stuck; max 6 per group; members' contact deals 50% to each other. On the player: 1 s stuck, no enemy attached |
| Bleed | 30% of the hit over 3 s; max 3 stacks |
| Extraction | An enemy dying while bleeding heals you 1% of max health; max 6 health per second |
| Burning | One shared burn per target (decision 36): each Fire hit adds 20% of its damage and refreshes the 3 s timer; at most 50% of max health held; Ignition at full bar |
| Charge | A Static hit makes the target **Charged** for 3 s (Static hits refresh it). Charged enemies take +20% Static damage and pass arcs on: 3 jumps, range 110, each jump 70% of the last. A Charged enemy discharges one arc when it dies. Charge itself never interrupts; interrupts come through Poise |
| Poise stagger | 0.8 s (elites 0.55 s, bosses 0.35 s) |
| Knockback | Distance = impulse ÷ (radius ÷ 12); hitting a wall deals 40% of the hit |
| Possessed | 4 s, then 8 s before it can happen again (elites 2.5 s; bosses 1.5 s, lashing out at adds once). It targets the nearest enemy; its attacks and contact hurt enemies, not you; nearby enemies fight back; your weapons skip it; its kills give you XP; with no enemy near, it wanders harmlessly. The player is exempt |
| Fear | Enemies flee for 2 s. Sources: Peekaboo's BOO, and a future player Feat, "Jump Scare". No enemy applies it |
| On the player | Snared, Bleed, Burning, Charge and Fear work as on enemies; Corrosion only matters if you have Shell. The player gets defences from upgrade cards or built into some samples, weapons and Feats (decision 31; `UPGRADES.md` 5) |

### 11.6 World objects

| Object | Radius | Lifetime | Notes |
| --- | --- | --- | --- |
| Acid Pool | 58 | 3.5 s | Matches the v10 Pool weapon |
| Mucus patch | 50 | 4 s | |
| Blood pool | 35 | 3 s | |
| Wax wall | about 60 long | 6 s | Blocks movement and shots both ways; about 30 health (shots chip it); autoaim skips targets behind it unless a Beam or Burst can reach; max 2 per Candle |

At most 40 world objects at once (phones). Where two overlap, the newest wins, except where a reaction converts one into the other.

### 11.7 Other systems

- **Crits** come last (11.1).
- **Feats** carry a damage type and an attack type, like weapons, and follow every rule here. Stamina is unchanged. A utility Feat (no attack: a shield, a pickup, a trail) has neither and costs no stamina (`FEATS.md` 1).
- **Autoaim:** TOUGHEST scores effective health (health + Membrane + Shell layers × layer health, ×1.35 if Squishy). HIGHEST ARMOUR is replaced by two directives: **SHELLED** (most Shell layers left) and **MEMBRANED** (most Membrane left).
- **Enemy damage types:** see `ENEMY_DESIGN.md` 5.1. Force is most common and Soul least; some enemies have two types.
- **Name clash fixed:** v10's Mucus Pool weapon is renamed **Snot Trap** ("Leaves a patch that sticks enemies crossing it. Watch your step; they won't."). On 18 Oct the Static + Mucus reaction was renamed **Snot Socket**, so the signature weapon (Red Tape) can take the name **Sticky Situation**.

## 12. Signature weapon rules (17 Oct 2026)

Rules added so the signature weapons (now in `BASE_WEAPONS.md`) fit the system. They apply to anything that does the same thing, not just those weapons.

### 12.1 Echo damage

Damage that is copied, shared or repeated from other damage (Red Tape's 35% share, Due Date's 40% repeat) is **echo damage**. It deals damage and nothing else: it never fills build-up bars, counts as a heavy hit, sets off a reaction, triggers Thorns or Extraction, or creates more echo. It still goes through defences (step 3 onwards in 11.1).

### 12.2 Pull

Pull is reverse knockback with the same formula: distance = pull strength ÷ (radius ÷ 12), towards the source. The gravity well modifier (`MODIFIERS.md` 19) is how weapons and Feats pull, and it also bends shots. Squishy halves it, as it halves knockback. Elites take 50%, bosses 25%. Pull never drags anything through a wall or into a sealed arena.

### 12.3 Pets (allied creatures)

A **pet** is a creature on your side with its own movement: summoned critters (Little Swimmers, Lightning Bugs, Leeches, Sea Monkeys, Head Lice) and converted enemies (Tapeworm undead). Orbiting bodies (Premature Evangelation's angels, Nose Goblins) are **not** pets: they are the orbiting modifier (`MODIFIERS.md`), cannot be hit, and follow you exactly.

| Rule | Value |
| --- | --- |
| Damage | The weapon's damage, damage type and attack type (usually Contact). Your buffs apply; crits apply (11.1). |
| Their hits are your hits | They fill bars, set off reactions, trigger Extraction, and their kills give you XP. |
| Targeting | Each pet uses its weapon's autoaim directive and THEN tie-breaker (`AUTORUN_AUTOAIM.md`). |
| Leash | Pets stay within 300 of you; past that they swim back and do not attack until they are within 200. |
| Caps | At most 4 pets per weapon and 8 pets in total, across all weapons (screen clarity and phone speed). Upgrades that add pets stop at the cap. |
| Health | 20% of your max health (24 at 120). No defences. |
| Death | Summoned pets come back at your side after 3 s. Converted pets (undead) are gone for good when they die or their lifetime ends. |
| Enemies | An enemy targets a pet only when the pet is closer than you and within 120. Enemies never chase pets across the arena. |
| Statuses and hazards | Pets ignore statuses, Pools and patches. Only direct enemy hits hurt them. |
| Thorns | A pet's Contact hit on a Thorns enemy hurts the pet, not you. |
| Autoaim and shots | Your weapons never target pets, your shots pass through them, and they never block enemy shots. |
| Peekaboo | While you are hidden, enemies ignore your pets too (they search your last spot). |
| Look | Drawn smaller than enemies, outlined in your colour, so they never read as threats. |

Possessed enemies are not pets; they keep their own rules (11.5).

### 12.4 Player hiding

While hidden (Peekaboo), enemies lose you and go to your last seen spot. Their shots there can hit each other (normal damage; it counts as their damage, not yours). Hiding lasts at most 2 s, and the same weapon cannot hide you again for 3 s after. Anything that hits you while hidden (a Burst or Pool you're standing in) still hits.

### 12.5 Bounded chains

Anything that sets off more of itself has a fixed depth: Nappy Mines' domino stops at 3 mines; Lard Lobber's bowling at depth 2 (each flying enemy knocks one more, once); Black Hole merges stop at 5 (then supernova: one Burst). Reactions keep their own lockout (11.3).

### 12.6 Lures

A lure is a world object that draws greedy enemies to it (Tooth Fairy's teeth). At most 3 per weapon, each lasting 6 s, counting towards the 40-object cap. Bosses ignore lures; elites go to them half as often. Tooth Fairy's teeth already exist in the shipped game, so they are not a new ground object.

### 12.7 Merging pools

Upchuck's puddles are the one exception to "newest wins" on overlap: two of its Acid Pools that touch merge into one, up to radius 100, and the timer resets once per merge.

### 12.8 Projectile blocking

An orbiting body or eater (Premature Evangelation's angels, Placental Siphon) destroys enemy **Projectile** and **Spread** shots it touches. It never blocks Burst, Beam, Pool or Contact. Placental Siphon stores up to 10 and fires them back with their original damage and damage type.

### 12.9 Signature weapons and the matrix

Signature weapons sit alongside the 42 matrix weapons. Each has one damage type and one attack type and is otherwise a normal weapon (levels, upgrades, autoaim directives). The signature behaviour is the only thing that sets it apart.

## 13. Attack-type rules

What each attack type is for lives in `ATTACK_TYPES.md`; how each one meets the defences lives here.

| Attack type | Components | Thorns | Evasion | Telegraph |
| --- | --- | --- | --- | --- |
| Contact | Direct hit, impulse (knockback), status application | Triggers, once per connected hit | Can miss; a miss avoids the hit and everything attached to it | Dangerous Contact attacks (charges, rams) show their lane |
| Projectile | Direct hit, status application | Never | Can miss | The shot is visible in flight |
| Spread | Several small direct hits, light impulse | Never | Rolls per pellet; some pellets still land | The fan's angle is readable |
| Burst | Area direct hit, sometimes impulse or status | Never | Never applies; leaving the marked area avoids it, the edge can still hit | Always shows its area before it goes off |
| Beam | Rapid small direct hits; pierces | Never | Never applies; leaving the lane stops further hits | Shows its lane before it fires |
| Pool | Hazard ticks, status application | Never | Never applies; only leaving it, or not entering, avoids it | Shows its edge for its whole life |

1. **One attack type per attack**, plus an optional leftover hazard (patch, pool or trail; decision 7). The leftover hazard uses the world-object rules in section 4, not a second attack type.
2. **Resolve each component separately** (section 3, implementation rules). A Burst can carry a direct hit and a status; Membrane may absorb the hit while the status follows its own rule.
3. **Modifiers, not new types** (`MODIFIERS.md`). Homing, chaining, piercing, ricochet, orbiting, delayed detonation, rapid volleys and summoned attackers are modifiers on one of the six; the attack type still decides every defence rule. A modifier that changes how defences apply is a rule, and belongs here. Add a seventh attack type only when no modifier can express the behaviour clearly.
4. **Telegraph by danger.** Any attack that can do significant damage shows what is happening, where it matters and when to respond. Weak Contact enemies need no special wind-up.
5. **Same vocabulary both sides.** Player weapons, Feats and enemy attacks all use the six types, and an enemy's card says its attack type.

## 14. Where things live, and the CSV export

| Topic | Source of truth |
| --- | --- |
| Reactions, statuses, world objects, defence rules, attack-type rules, formulas, numbers | This file |
| What each damage type, defence and attack type is for, how it looks, strengths and weaknesses | `DAMAGE_TYPES.md`, `DEFENCE_TYPES.md`, `ATTACK_TYPES.md` |
| Enemy roles, roster, new enemies | `ENEMY_DESIGN.md` (role counterplay: section 5 here) |
| Weapons, Feats, mutations and modifiers | `BASE_WEAPONS.md`, `WEAPON_UPGRADES.md`, `FEATS.md`, `MUTATIONS.md`, `MODIFIERS.md` |
| Progression, samples, autorun, voice | `UPGRADES.md`, `SAMPLES.md`, `AUTORUN_AUTOAIM.md`, `VOICE_GUIDE.md` |

The three CSVs in `tables/` (the old Notion databases) are generated from the tables in this file by `tables/export.py`:

- `combat_interactions.csv`: section 1 (the 21 reactions) and section 3's interaction rows.
- `defences_traits.csv`: section 3's defence table, with section 11.4's starting values.
- `mechanics_statuses.csv`: section 4's statuses and world objects, with section 11.5 and 11.6's starting values.

After changing any of those tables, run `python3 "redesign docs/tables/export.py"` and commit the CSVs in the same commit.
