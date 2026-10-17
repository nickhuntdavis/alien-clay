# Master Combat-System Matrix (draft)

## Current design direction (17 Oct 2026)

**Status: working proposal; validate in playtests before treating values or effects as locked.** The canonical damage types are **Force, Acid, Static, Mucus, Blood, Soul and Fire**. Cooties, Oil and Water are out of scope and must not appear as active types in this matrix. Every open question from the reconciliation pass is settled in section 10; formulas and starting values are in section 11.

### Shared vocabulary

- **Damage type:** what kind of harm an attack deals.
- **Attack type:** how the harm reaches the target (`ATTACK_TYPES.md`).
- **Status:** a temporary, readable condition on a creature (section 4).
- **World object:** a hazard on the ground with a visible edge and lifetime (Acid Pool, Mucus patch, blood pool, Burn zone, wax Pool).
- **Reaction:** a deliberate interaction between two damage types, set off by one of the four trigger kinds below.

### Reaction rules

- Seven types create **21 unique pairs**. Every pair has one designed reaction in the matrix below.
- **Four trigger kinds, no others:**
  1. **State + hit:** a hit of one type lands on a target carrying the other type's visible state (Corroded, Snared, bleeding, burning, Possessed).
  2. **World object + hit:** a hit of one type lands on the other type's world object (Acid Pool, Mucus patch, blood pool).
  3. **Dual-type weapon:** one weapon that carries both damage types (Shocking Impact only, for now).
  4. **Pairing:** the existing Pairings system (two weapons you own, both Lv 5+). Spectral Combustion only, for now.
- Reactions do **not** trigger just because both types have touched the same enemy.
- Each reaction has one primary payoff. Do not stack burst damage, control, damage over time and resource gain into one reaction.
- **Fire size rule:** only Premature Evaporation, Flammable Mucus and Cauterise make bursts or zones. Flashover, Arc Flash and Spectral Combustion hit one target.
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
| Force + Soul | **Soul Purpose** | State + hit | A Force hit lands on a Possessed enemy | It is launched and damages the first mate it collides with | Single target | One collision; Possessed carries on as normal |
| Force + Fire | **Flashover** | State + hit | A Force hit lands on a burning target | A tongue of flame jumps to one nearby enemy and adds to its Burn bar | Single target | One jump; no chain |
| Acid + Static | **Conductive Pool** | World object + hit | A Static hit lands in an Acid Pool | One electrical pulse travels across that pool | Area (pool) | Stays inside the visible pool edge; one pulse per pool |
| Acid + Mucus | **Slick Move** | World object + hit | An Acid hit lands on a Mucus patch | The patch is replaced by a short-lived corrosive slick | Area (patch) | Replaces the patch rather than layering two hazards; clear expiry |
| Acid + Blood | **Caustic Breach** | State + hit | An Acid hit lands on a bleeding target | Strips one Shell layer at once | Single target | Defence erosion only: no damage over time, no new wound; does nothing to a target without Shell; once per Bleed |
| Acid + Soul | **Soul Erosion** | State + hit | An Acid hit lands on a Possessed enemy | When Possessed ends, it bursts in a small Acid splash that adds Corrosion to nearby mates | Area (small) | One splash per Possession; compare with Corrosive Splash in playtest |
| Acid + Fire | **Premature Evaporation** | State + hit | A Fire hit lands on a Corroded target | Consumes the Corrosion in a modest close-range burst | Area (burst) | Never from an Acid Pool by itself; one burst; the Corrosion build-up resets |
| Static + Mucus | **Sticky Situation** | World object + hit | A Static hit charges a Mucus patch | The next enemy entering it is briefly shocked | Single target | One trigger per patch; obvious charge cue; no stun loop |
| Static + Blood | **Blood Circuit** | World object + hit | A Static hit lands in a blood pool | One arc hits the nearest enemy standing in or beside the pool | Single target | One target; no pulse across the pool and no onward chain (unlike Conductive Pool) |
| Static + Soul | **Interference Pattern** | State + hit | A Static hit lands on a Possessed enemy | Possessed lasts a fixed time longer | Single target | Once per Possession |
| Static + Fire | **Arc Flash** | State + hit | A Static hit lands on a burning target | One short arc jumps to the nearest other enemy | Single target | One jump; no extra Burn, stun or chain |
| Mucus + Blood | **Caught in the Clot** | World object + hit | A Mucus hit lands on a blood pool | The pool becomes a clot patch that briefly catches the first enemy to cross it | Single target | Blood visible in the patch; one catch, then the patch is gone |
| Mucus + Soul | **Held in Suspension** | State + hit | A Mucus hit lands on a Possessed enemy | It is pinned in place for a moment | Single target | Short pin; no extra damage or status |
| Mucus + Fire | **Flammable Mucus** | World object + hit | A Fire hit lands on a Mucus patch | The patch burns briefly as a small no-go zone, then is consumed | Area (zone) | Short and clearly bounded; no Mucus slow left behind; the fire cannot relight itself |
| Blood + Soul | **Blood Donor** | State + hit | A Blood hit lands on a Possessed enemy | You heal a small fixed amount | Single target | Once per Possession; no new resource meter |
| Blood + Fire | **Cauterise** | State + hit | A Fire hit lands on a bleeding target | Consumes the Bleed for one immediate burst | Area (burst) | The burst must make up for ending the Bleed; no fresh Burn by default |
| Soul + Fire | **Spectral Combustion** | Pairing | The Soul/Fire Pairing (two weapons you own, both Lv 5+) hits a burning, Possessed enemy | It ignites at once (full Burn bar) and Possessed ends | Single target | Rare by design; the first time it fires, the Scientist gets his Tier 3 line (VOICE_GUIDE.md) |

### Reaction quality decisions

- **No redundant damage over time:** Caustic Breach strips a Shell layer; it does not add a corrosive wound.
- **No extra sub-systems:** Soul Purpose launches an enemy rather than spawning a fragment; Blood Donor is a small capped heal, not a resource.
- **Soul pairs use Possessed:** all five Soul reactions trigger on a Possessed enemy. The Soul Mark is retired.
- **Separated similar world reactions:** Conductive Pool pulses across an Acid Pool; Blood Circuit arcs from a blood pool to one enemy.
- **Controlled Fire interactions:** three Fire pairs consume a setup for a burst or zone (Corrosion, a Mucus patch, a Bleed); three hit a single target. Fire does not make every surface explode.
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
| **Fire** | Ignition and short-lived burning zones | Burn bar build-up with a short damage over time; at full, one Ignition flare on that target; consuming compatible setups | Not a universal explosion trigger; no automatic spread |

Each type has one primary verb, one recognisable visual and sound cue (`DAMAGE_TYPES.md` visual language), and a clear non-goal. Use shape and motion as well as colour so effects stay readable on a phone screen.

## 3. Defensive layer matrix

**Five distinct defences:** Squishy, Membrane, Shell, Thorns and Evasion. These are the only defences; there are no extra traits. Enemies and the player can both have any of them (the player through mutations and items). Numerical values remain for playtesting.

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
- **Hazards are separate from the initial hit.** Avoiding a projectile gives no immunity to an Acid Pool, Burn zone or other hazard entered later.
- **Thorns resolves after a qualifying hit connects,** once per hit, never once per damage component.
- **Shell layer loss:** ordinary hits slowly, Acid fast, heavy Force at once. Lost layers stay gone.
- **Membrane recovery has one simple rule and a clear tell:** a brief no-damage delay.
- **Every defence has readable counterplay.** No enemy needs one specific damage type to be fought at a reasonable pace.

## 4. Status ownership and counterplay

Statuses live on creatures. World objects (Acid Pool, Mucus patch, blood pool, Burn zone, wax Pool) are listed separately below. The player can suffer every status except Possessed.

| Status | Owner | Consequence | Counterplay and limit | Distinction |
| --- | --- | --- | --- | --- |
| Poise Pressure | Force (Static when tagged) | One shared meter; at threshold, a brief stagger or interrupt | Not every hit adds Poise; recovers after a spell without qualifying hits; elites and bosses have higher thresholds and shorter control, never full immunity | Force adds by impact; Static only when an attack explicitly carries Poise or interruption pressure |
| Knockback | Force | Repositions the target; a collision may add a payoff | Space, Squishy, anchoring; bonus only on an actual collision | Not a damage multiplier |
| Corrosion | Acid | A visible build-up from Acid hits. On a Shell creature, a full bar strips one layer for good and resets. Any creature can carry it; it is the "Acid-coated" state reactions use | No timer or stacks; no damage over time | Acid's only status; Pools are its only ongoing damage |
| Charge | Static | A Static hit makes the target Charged (3 s): it takes +20% Static damage and passes arcs on; it discharges one arc on death | Fixed jump limit (3) and 70% falloff; never interrupts by itself | A conductor state, not a build-up bar; interrupts come through Poise |
| Snared | Mucus | Briefly restricts movement (also covers "Mucus-stuck" and "Adhered"). Becoming Snared clears a Burn bar: Mucus smothers Fire | Short duration; one clear control strength per effect | Slow, root and snare are not interchangeable labels |
| Conjoined | Mucus | Snared creatures stuck together in one shared green membrane: none can move, and they may hit each other | Happens when two Snared creatures touch, or when one Mucus attack's area covers several at once; capped group size; short | Distinct from Snared: it needs two or more creatures |
| Bleed | Blood | Damage over time; a named finisher may consume it for one payoff | Stack cap and decay. A creature that dies while bleeding leaves a small blood pool | Wounds are distinct from Acid erosion |
| Extraction | Blood | An enemy dying while bleeding heals you a little | 1% of max health per kill, max 6 health per second | Separate from ordinary damage and healing |
| Possessed | Soul | At full Soul build-up the enemy fights its own mates for a few seconds | Clear duration and tell; cooldown before it can repeat; elites shorter; bosses reduced, never fully controlled; the player is exempt | The only control Soul owns; not Fear |
| Fear | A player Feat ("Jump Scare", future) | Enemies flee for 2 s | Duration cap; no enemy applies Fear | Fear is a status, not the Soul type itself |
| Burning | Fire | Fire hits fill a visible Burn bar; while it holds Burn the target takes a short damage over time; at full, Ignition: one flare on that target, then the bar resets | No spread except through reactions and Burn zones; Snared puts it out | Do not add extra effects to every Fire hit |

### World objects

| Object | Made by | Does | Limit |
| --- | --- | --- | --- |
| Acid Pool | Acid Pool weapon, Acid Bubble, Slick Move | The only ongoing Acid damage; builds Corrosion on anything standing in it | Visible edge and lifetime; never indefinite |
| Mucus patch | Mucus Pool weapon, Snot Bubble, Snot Rocket | Snares what enters it; ingredient for Slick Move, Sticky Situation, Flammable Mucus | Short-lived, clear edge |
| Blood pool | Creatures dying while bleeding; Blood Pool weapon; Mosquito | Ingredient for Blood Circuit and Caught in the Clot | Small, short-lived |
| Burn zone | Fire Pool weapon, Flammable Mucus, Matchstick, Smouldering elites | Fills the Burn bar of anything inside | Short, clearly bounded |
| Wax Pool | Birthday Candle only | Hardens into a temporary wall that blocks movement and shots | The one justified exception to "reuse existing ingredients"; short-lived |

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
| Fire | No effect on heat or Burn unless there is an impulse component | May absorb a covered hit; Burn applies only if the hit applies it; no protection from later zone exposure | Reduces the physical component only; Shell and Burn are separate | Not triggered by Burn or zones | As Force; leaving a zone limits exposure but does not empty the Burn bar |

Do not infer blanket type immunities from this table.

## 8. Priority audit and definition of done

| Priority | Issue | Decision / test |
| --- | --- | --- |
| P0 | All 21 pairs need distinct, legible reactions | Playtest whether each payoff is noticed and understood at mobile speed |
| P0 | Similar reactions risk feeling interchangeable | Compare Conductive Pool vs Blood Circuit, Premature Evaporation vs Corrosive Splash, and Soul Erosion vs Corrosive Splash; tune shape and trigger as well as damage |
| P1 | Too many conditions can hide reactions | Only the four trigger kinds; no requirements that depend on obscure enemy variants |
| P1 | Control and interruption can lock enemies down | One catch per patch, short control windows, Poise thresholds, Possessed cooldown, no retrigger loops |
| P1 | Reaction damage can multiply excessively | Set a primary power budget; do not stack burst, damage over time, vulnerability and chain without justification |
| P1 | Fire can dominate all surfaces | Only Premature Evaporation, Flammable Mucus and Cauterise make bursts or zones; no automatic spread |
| P2 | Status vocabulary may expand without adding value | Merge effects with the same player-facing consequence; keep duration and stack rules explicit |
| P2 | Mobile readability | Test at phone size; use shape, motion and sound as well as colour |

Definition of done:

- [ ]  Seven canonical types only: Force, Acid, Static, Mucus, Blood, Soul, Fire.
- [ ]  All 21 pairs have one of the four trigger kinds and one clear payoff.
- [ ]  Every reaction has limits on duration, range, consumption and retriggering.
- [ ]  Five defences (Squishy, Membrane, Shell, Thorns, Evasion) stay distinct and create no blanket type immunities.
- [ ]  Every status has a consequence, an end rule, a stack rule where needed, and counterplay.
- [ ]  Enemy roles permit at least two viable player responses; no routine enemy requires one specific type.
- [ ]  Proposed mechanics are validated in fast mobile playtests before being marked Accepted.

## 9. Remaining updates (merged from the hand-off document, 17 Oct 2026)

Source: "Combat Matrix Remaining Updates". Nothing here changes the 21 pair rows in section 1.

### Design constraints (additions)

- Fast Android game: every reaction readable at a glance, with no hidden stacks, long recipes or delayed multi-step conditions.
- Keep four concepts separate: **damage type**, **attack delivery**, **behaviour modifier**, **source**.
- Voice (decided 17 Oct 2026): the impulsive, blunt, immature gameplay voice belongs to the **pre-incarnate consciousness**, which speaks to the sperm as "you" and is not the sperm. The Scientist stays the external, clinical observer. The sperm itself does not speak. See `VOICE_GUIDE.md`.

### Low-confidence reactions

Settled 17 Oct 2026: the four low-confidence Soul reactions (Soul Purpose, Soul Erosion, Blood Donor, Spectral Combustion) and Interference Pattern were rebuilt around Possessed (section 1). They remain Proposed until playtested.

### Defence rules

- **Squishy / Absorption:** proportional reduction of blunt physical impact (Force); cuts go through; may soften impulse and knockback; no status resistance.
- **Membrane:** separate pool, absorbs eligible direct damage before health, regenerates after a short spell without Membrane damage. Force drains it less efficiently and knocks back less while it is up. Static recharges it (+25% capacity, once per 5 s), with a visible tell. Soul damage is absorbed normally; no bypass.
- **Shell:** finite, non-regenerating layers with fixed reduction against qualifying physical hits. Each layer has a little health: ordinary hits wear it slowly, Acid's Corrosion fast, heavy Force removes one at once. Shell does not mitigate Burn or heat.
- **Thorns:** no mitigation. Retaliates once per qualifying Contact hit. Ranged attacks, hazards, non-contact effects and Evasion misses do not trigger it.
- **Evasion:** a miss chance against Contact, Projectile and Spread hits, per pellet, with a visible "miss" puff. A miss avoids the hit and its attached effects. Never applies to Burst, Beam or Pool. Clears no existing status or hazard.

### Defence interaction rows (one row each, no duplicates)

| Interaction | Status | Rule |
| --- | --- | --- |
| Acid erodes Shell | Accepted | Corrosion builds to permanent layer loss. Does not disable Membrane or bypass defences generally. |
| Heavy Force can shed a Shell layer | Accepted | A thresholded heavy hit removes one layer. The same threshold defines a heavy hit for Blood Pressure. |
| Ordinary hits wear Shell | Accepted | Each layer has a little health; ordinary qualifying hits wear it slowly. |
| Membrane resists Force impact | Accepted | Less drain and less knockback while the Membrane is up. |
| Static recharges Membrane | Accepted | +25% capacity, once per 5 s; visible; no supercharge. |
| Membrane absorbs eligible direct damage | Accepted | Status prevention depends on whether the applying hit was prevented. |
| Shell and Burn remain separate | Accepted | Shell mitigates the physical component, not heat. |
| Squishy absorbs blunt impact | Accepted (verify) | Proportional; blunt only; no status resistance. |
| Thorns retaliate once on contact | Accepted (verify) | Once per qualifying Contact hit. |
| Evasion misses eligible hits | Accepted (verify) | Miss chance on Contact, Projectile and Spread only; a miss prevents the hit and its attached effects. |
| Snared slows movement | Testing | Snared weakens autorun's dodging (movement); it does not change Evasion's miss chance. |
| Mucus smothers Fire | Proposed | Becoming Snared clears the Burn bar. A Mucus patch hit by Fire still burns (Flammable Mucus). Water is not a damage type. |
| Membrane and Soul effects | Accepted (verify) | Soul damage is absorbed normally; no bypass. Build-up applies only if the hit isn't blocked. |

### Shared implementation rules (additions)

- Resolve each attack into components: direct damage, status application, impulse or control, hazard.
- If the hit that applies a status is prevented, so is the status, unless a rule says otherwise. Existing statuses and hazards stay until their own rule removes them.
- Never apply Thorns more than once per attack.
- Prefer one-step reactions; no recursive splashes or arcs, unbounded propagation, hidden counters or long setup chains.

### Manual checklist

- [ ] Every pair row uses the names and behaviours in section 1; no duplicates.
- [ ] Each pair row links both damage types and any required mechanic or status.
- [ ] Proposed / Accepted / Testing statuses match what was actually approved.
- [x] The low-confidence reactions are decided (rebuilt around Possessed).
- [ ] Defence interaction rows exist once, with correct statuses.
- [ ] Damage type, attack type, behaviour modifier and source are separate fields.
- [ ] Every reaction reads quickly, has one payoff and no unbounded loop.

## 10. Reconciliation decisions (17 Oct 2026)

Settled one by one after a cross-doc review. Every redesign doc follows these.

| # | Question | Decision |
| --- | --- | --- |
| 1 | What is a "named combo"? | Gone. Four trigger kinds instead: state + hit, world object + hit, dual-type weapon (Shocking Impact), Pairing (Spectral Combustion) |
| 2 | How many Fire reactions? | Six; only three make bursts or zones (Premature Evaporation, Flammable Mucus, Cauterise) |
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
- **Reaction damage:** the three big ones (Premature Evaporation, Flammable Mucus, Cauterise) deal 150% of the triggering hit's raw damage as area; the rest deal 60%. Cauterise also adds the Bleed's remaining damage.
- **Reaction lockout:** each reaction has a 1.5 s lockout per target (bosses 3 s). Anything a reaction creates cannot set off that same reaction.
- **Dual-type weapon:** shots alternate Force, Static, Force, Static. Shocking Impact fires on each Static shot that lands after a Force shot.
- **Spectral Combustion Pairing:** Soul Beam + Fire Pool (Burning Ground), both Lv 5+. A secret, like today's Pairings.
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
| Snared | 55% slow for 2.5 s; refreshes on hit; clears a Burn bar |
| Conjoined | 3 s stuck; max 6 per group; members' contact deals 50% to each other. On the player: 1 s stuck, no enemy attached |
| Bleed | 30% of the hit over 3 s; max 3 stacks |
| Extraction | An enemy dying while bleeding heals you 1% of max health; max 6 health per second |
| Burning | Damage over time of 20% of the hit over 3 s while the Burn bar holds; Ignition at full |
| Charge | A Static hit makes the target **Charged** for 3 s (Static hits refresh it). Charged enemies take +20% Static damage and pass arcs on: 3 jumps, range 110, each jump 70% of the last. A Charged enemy discharges one arc when it dies. Charge itself never interrupts; interrupts come through Poise |
| Poise stagger | 0.8 s (elites 0.55 s, bosses 0.35 s) |
| Knockback | Distance = impulse ÷ (radius ÷ 12); hitting a wall deals 40% of the hit |
| Possessed | 4 s, then 8 s before it can happen again (elites 2.5 s; bosses 1.5 s, lashing out at adds once). It targets the nearest enemy; its attacks and contact hurt enemies, not you; nearby enemies fight back; your weapons skip it; its kills give you XP; with no enemy near, it wanders harmlessly. The player is exempt |
| Fear | No enemy applies it. Source: a future player Feat, "Jump Scare" (enemies flee for 2 s) |
| On the player | Snared, Bleed, Burning, Charge and Fear work as on enemies; Corrosion only matters if you have Shell. The player has no sources of defences until the upgrade and reward systems return |

### 11.6 World objects

| Object | Radius | Lifetime | Notes |
| --- | --- | --- | --- |
| Acid Pool | 58 | 3.5 s | Matches the v10 Pool weapon |
| Mucus patch | 50 | 4 s | |
| Blood pool | 35 | 3 s | |
| Burn zone | 60 | 3 s | |
| Wax wall | about 60 long | 6 s | Blocks movement and shots both ways; about 30 health (shots chip it); autoaim skips targets behind it unless a Beam or Burst can reach; max 2 per Candle |

At most 40 world objects at once (phones). Where two overlap, the newest wins, except where a reaction converts one into the other.

### 11.7 Other systems

- **Crits** come last (11.1).
- **Feats** carry a damage type and an attack type, like weapons, and follow every rule here. Stamina is unchanged.
- **Autoaim:** TOUGHEST scores effective health (health + Membrane + Shell layers × layer health, ×1.35 if Squishy). HIGHEST ARMOUR is replaced by two directives: **SHELLED** (most Shell layers left) and **MEMBRANED** (most Membrane left).
- **Enemy damage types:** see `ENEMY_DESIGN.md` 5.1. Force is most common and Soul least; some enemies have two types.
- **Name clash fixed:** v10's Mucus Pool weapon is renamed **Snot Trap** ("Leaves a patch that sticks enemies crossing it. Watch your step; they won't."). The reaction keeps "Sticky Situation".
