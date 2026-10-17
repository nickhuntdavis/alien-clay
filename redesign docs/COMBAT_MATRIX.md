# Master Combat-System Matrix — Draft

## Current design direction — 17 Oct 2026

**Status: working proposal; validate in playtests before treating values or effects as locked.** The canonical damage types are **Force, Acid, Static, Mucus, Blood, Soul, and Fire**. Cooties, Oil, and Water are out of scope and must not appear as active types in this matrix.

### Shared vocabulary

- **Damage type:** what kind of harm an attack deals.
- **Attack type:** how the harm reaches the target.
- **Status:** a temporary, readable gameplay condition.
- **Reaction:** a deliberate interaction between two damage types, enabled by a clear target condition, world object, or weapon combo.

### Reaction rules

- Seven types create **21 unique pairs**. Every pair has one designed reaction in the matrix below.
- **Naming:** damage types keep plain, clinical names. Reaction names may use a dry pun, a corrupted familiar phrase, or the tone of a minor incident report, but the joke must fit the effect. Keep names short, concrete and easy to recognise at combat speed; never force a joke or make the name carry essential instructions. Use British spelling.
- Reactions do **not** trigger automatically just because both types have touched the same enemy. They need a deliberate, readable trigger.
- Each reaction should have one primary payoff. Do not stack burst damage, control, damage-over-time, and resource gain into one reaction.
- Keep triggers consistent where possible: a visible target mark, a visible world hazard, or a named weapon combo.
- Prefer short effects with clear visual/audio cues. Do not require players to track hidden timers, multiple stacks, or long recipes.
- Reactions are an internal coverage and balance tool, not a player-facing matchup chart.

## 1. Complete 21-pair reaction matrix

All effects below are **proposed**. Numbers, durations, radii and stack values remain for playtesting.

| Pair | Reaction | Trigger | One clear payoff | Quality notes / guardrails |
| --- | --- | --- | --- | --- |
| Force + Acid | **Corrosive Splash** | Force strike hits an Acid-coated target | Splashes a small amount of Acid onto nearby enemies | Keep the splash small; spreads the setup, not a second large damage burst |
| Force + Static | **Shocking Impact** | Named Force/Static weapon combo lands | Short local electrical burst around impact | Local burst only; does not chain, so it stays distinct from Static's normal chain role |
| Force + Mucus | **Snot Rocket** | Force attack hits a Mucus-stuck enemy | Launches the enemy in the hit direction; landing creates a small sticky patch | One launch and one patch; no extra stun or bonus damage layer |
| Force + Blood | **Blood Pressure** | Force finisher hits a bleeding target | Wound bursts, dealing a small area hit | One burst; do not also add a new bleed stack or large pool |
| Force + Soul | **Soul Purpose** | Force hit connects with a Soul-marked target | Breaks the mark and briefly exposes the target to the next Soul hit | Replaces the loose fragment/collect-or-strike idea; one payoff, no extra pickup system |
| Force + Fire | **Flashover** | Force weapon hits a burning target | Pushes a small tongue of flame onto one nearby target | Limit to one nearby target; no uncontrolled fire chain |
| Acid + Static | **Conductive Pool** | Static attack hits an Acid puddle | One electrical pulse travels across that puddle | World-only interaction; fixed pool boundary and one pulse |
| Acid + Mucus | **Slick Move** | Acid weapon hits a Mucus patch | Converts the patch into a short-lived corrosive slick | Replace the Mucus patch rather than layering two hazards; clear expiry |
| Acid + Blood | **Caustic Breach** | Acid combo hits a bleeding target | Briefly strips more Shell than Acid alone | Defence erosion, not another damage-over-time effect; no extra wound stack |
| Acid + Soul | **Soul Erosion** | Acid combo hits a Soul-marked target | Refreshes the Soul mark and lengthens it briefly | One refresh per mark; do not invent a new defence |
| Static + Mucus | **Sticky Situation** | Static attack charges a visible Mucus patch | The next enemy entering it is briefly shocked | One trigger per patch; obvious charge cue; no repeated stun loop |
| Static + Blood | **Blood Circuit** | Static attack hits a blood pool | Arcs once from the pool to the nearest eligible enemy standing in or beside it | Keep distinct from Conductive Pool: Blood selects a nearby target; Acid Pool carries a pulse across its surface |
| Static + Soul | **Interference Pattern** | Static combo hits during a clearly telegraphed Soul attack | Interrupts that attack | Use only on attacks with a readable tell; no general interrupt on every Soul enemy |
| Mucus + Blood | **Caught in the Clot** | Named Mucus/Blood combo creates a clot patch | A short-lived patch briefly catches the first enemy that crosses it | Blood must be visibly present in the patch; one catch only, avoiding a general Mucus snare upgrade |
| Mucus + Soul | **Held in Suspension** | Mucus attack hits a Soul-marked target | Briefly pins the target in place | Remove the special “phase-shifting enemy” requirement; the Soul mark is the visible, reusable trigger |
| Blood + Soul | **Blood Donor** | Blood attack hits a Soul-marked target | Restores a small fixed amount of player health | No new blood resource or conversion meter; cap the heal and avoid repeat-hit farming |
| Blood + Fire | **Cauterise** | Fire attack hits a bleeding target | Consumes the bleed for an immediate burst | The burst must clearly compensate for ending the bleed; do not add a fresh burn by default |
| Soul + Fire | **Spectral Combustion** | Soul/Fire combo hits a burning, Soul-marked target | Consumes the mark in a short spectral burst | Trigger on a hit, not only on defeat, so the payoff is visible during busy combat |
| Acid + Fire | **Premature Evaporation** | Fire attack hits an Acid-coated target | Consumes the Acid coating in a brief close-range burst | Target interaction, not an automatic explosion from every Acid puddle; modest radius and one burst |
| Static + Fire | **Arc Flash** | Static attack hits a burning target | Sends one short arc to the nearest other eligible enemy | One jump only; no extra burn, stun and chain stack together |
| Mucus + Fire | **Flammable Mucus** | Fire attack ignites a visible Mucus patch | Patch burns briefly, creating a small temporary no-go zone | Patch is consumed; short duration and clear boundary; no lingering Mucus slow after ignition |

### Reaction quality decisions

- **Removed redundant damage-over-time:** Acid + Blood now improves Shell erosion; it does not add a generic corrosive wound.
- **Removed extra sub-systems:** Force + Soul no longer spawns a fragment that can be collected or struck; Blood + Soul uses a small capped heal, not a new resource.
- **Reduced special-case conditions:** Mucus + Soul uses the visible Soul mark instead of requiring a phase-shifting enemy; Soul + Fire triggers on a hit rather than only on a kill.
- **Separated similar world reactions:** Acid + Static pulses across the Acid puddle; Static + Blood arcs from a blood pool to one nearby enemy.
- **Controlled Fire interactions:** each Fire pair has a different setup and payoff—consume Acid coating for a burst, arc from a burning target, or burn up a Mucus patch. Fire does not make every surface explode.
- **No reaction should retrigger itself.** A reaction-created patch, arc, burst, or mark refresh cannot immediately trigger the same reaction again. Limit chain jumps, patch triggers and repeat healing.

## 2. Damage-type identities

| Type | Core job | Signature gameplay | Keep distinct from |
| --- | --- | --- | --- |
| **Force** | Burst and displacement | Impact, knockback, poise pressure, wall collision | Static: physical impact and positioning, not electrical chaining |
| **Acid** | Defence erosion and area denial | Corrosion, Shell reduction, short-lived corrosive hazards | Blood: weakens defence rather than scaling wound damage |
| **Static** | Chain pressure and action disruption | Charge, bounded arcs, conditional interruption | Force: network/charge effects, not physical knockback |
| **Mucus** | Movement control and setup | Sticky coating, short snares, patches | No generic damage-over-time; avoid stacking slow/root/snare variants |
| **Blood** | Wounds and extraction | Bleeding, wound thresholds, limited sustain | Acid: wound economy, not generic corrosion |
| **Soul** | Essence pressure and marked-target effects | Soul marks, resource/essence effects, selective tagged bypass | Not blanket defence bypass; Fear is a status tag, not a synonym for Soul |
| **Fire** | Immediate ignition and short-lived burning zones | Burn, ignition, controlled spread, consuming compatible setups | Not a universal explosion trigger or a second generic DoT type |

Each type should have one primary verb, one recognisable visual/sound cue, and a clear non-goal. Use shape and motion as well as colour so effects remain readable on a phone screen and in greyscale.

## 3. Defensive layer matrix

**Core baseline: five distinct defence mechanics.** Each changes a different combat outcome. These five are the only defences; there are no extra traits. These rules describe the intended design; numerical values and exact eligibility remain subject to playtesting.

| Defence | Core rule | Strength / identity | Limits and counterplay |
| --- | --- | --- | --- |
| **Squishy / Absorption** | Reduces qualifying blunt physical-impact damage; may also reduce impulse, knockback and collision effects. | Soft tissue yields under impact. Big hits still hurt, but are softened rather than fully negated. | Not universal damage reduction. Does not inherently resist cutting, Acid, Static, Mucus control, Blood effects, Soul effects or Fire. |
| **Membrane** | A separate Membrane pool absorbs eligible incoming damage before health. It regenerates after a brief period without taking Membrane damage. | Temporary protection that rewards breaking contact. Force is its defining matchup and should be particularly poor at getting through or destabilising it. | Sustained pressure delays recovery. Membrane state and recharge must be clearly visible. Do not assume it blocks already-applied statuses or persistent hazards. |
| **Shell** | Reduces qualifying physical damage through discrete, finite layers. Each lost layer is permanently gone for the encounter; Shell does not regenerate. | Rigid protection that is especially useful against repeated small physical hits. Existing prototype Shell visuals communicate remaining protection. | Acid can erode or remove layers; sufficiently heavy Force impacts can knock a layer loose. These are deliberate routes to shed Shell, not new damage types. Keep layer loss visually obvious. |
| **Thorns** | Returns damage when a qualifying melee/contact attack hits. It does not mitigate the incoming hit. | Retaliation makes close-range attacks costly while preserving the attacker's full damage payoff. | Only trigger on qualifying contact; ranged attacks and non-contact hazards do not automatically trigger it. A clean Dodge avoids the original hit and therefore its contact retaliation. Damage returned should be bounded and readable. |
| **Dodge** | Avoids eligible attacks when movement, timing and hit coverage allow it. A clean miss avoids the hit and effects attached to that hit. | Protection through movement rather than damage reduction or a resource pool. | Dodging the primary impact does not guarantee escape from the full area of effect. If the creature remains in an attack's outer AoE, it may still take reduced damage or a lesser effect. Persistent hazards can hit on later ticks; Dodge does not clear an already-applied status or erase an existing hazard. |

### Shared defence rules

- **Resolve attack components, not just damage-type labels.** Direct hit, status application, persistent hazard, impulse/control and area coverage may each need separate eligibility.
- **Blocking a hit does not clear effects already applied.** A defence only prevents an attached status when it prevents the status-application hit or explicitly says it resists that status.
- **Area-of-effect coverage matters.** A Dodge can avoid the primary core while the outer blast, wave or edge still connects. Use the actual attack footprint; do not apply a generic partial-hit penalty to every AoE.
- **Persistent hazards are separate from the initial hit.** Avoiding the projectile or strike does not make a creature immune to an Acid pool, burning zone or other hazard it later enters or remains inside.
- **Thorns resolves after a qualifying hit connects.** It never reduces that hit. If Dodge causes the melee attack to miss, Thorns does not retaliate.
- **Shell shedding combines finite layers with type interactions.** Ordinary qualifying damage can wear it down; Acid erosion and heavy Force impacts can provide more decisive layer loss. Lost layers remain gone for the encounter.
- **Membrane recovery has one simple rule and a clear tell.** Prefer a brief no-damage delay over hidden timers, stacks or complex recovery conditions.
- **Every defence must have readable counterplay.** Do not require a specific damage type to make an enemy viable to fight, and do not let a defence silently negate unrelated statuses or hazards.

These five are the complete defence list. Enemy-specific twists are built from them (and from attack types and statuses), not from extra traits.

## 4. Status ownership and counterplay

| Status / mechanic | Owner | Consequence | Counterplay and limit | Distinction |
| --- | --- | --- | --- | --- |
| Poise Pressure | Force (Static when tagged) | One shared meter; at threshold, a brief stagger or interrupt | Not every hit adds Poise; recovers after a spell without qualifying hits; elites and bosses have higher thresholds and shorter control, never full immunity | Force adds by impact; Static only when an attack explicitly carries Poise or interruption pressure |
| Knockback | Force | Repositions target; collision may add a payoff | Space, Squishy, anchoring; bonus only on actual collision | Not a guaranteed damage multiplier |
| Corrosion | Acid | Temporarily reduces Shell effectiveness | Short duration, cap, recovery or cleanse where available | Prefer this to generic Acid DoT stacking |
| Acid Pool | Acid | Punishes lingering in a visible zone | Clear boundary and lifetime | No indefinite pools |
| Charge | Static | Transfers a bounded hit or interrupts a tagged action | Charge decay, fixed jump limit, diminishing damage | Do not combine full chain damage with full interrupt on every hit |
| Snared | Mucus | Briefly restricts movement or sets up a follow-up | Short duration; one clear control strength per effect | Slow, root and snare are not interchangeable labels |
| Conjoined | Mucus | Sticks multiple enemies together stopping movement possibly causing friendly fire | Only with high enough volume and enemies clustered | Slow, root and snare are not interchangeable labels |
| Bleed | Blood | Damage over time or threshold burst | Stack cap/decay | Wounds should be distinct from Acid erosion |
| Extraction | Blood | Converts a qualifying hit or wound into limited sustain | Clear range and cap | Separate from ordinary damage and healing |
| Soul Mark | Soul | Enables specific marked-target reactions | Visible mark, brief lifetime, no blanket defence bypass | Mark is a setup cue, not a second hidden resource |
| Fear | Explicit source tag; often Soul-related | Alters behaviour or control | Duration cap and recovery | Fear is a status, not the Soul type itself |
| Burning | Fire | Immediate ignition and brief burn or zone | Clear tell and duration; compatible hazards have bounded spread | Do not add extra effects to every Fire hit |

Status labels in this matrix are functional names, not necessarily player-facing copy. Keep them short and consistent; use the Field Guide for precise definitions, and keep repeated HUD status effects mostly silent. For each status that ships, specify its duration, refresh/stack rule, termination condition, and immunity or resistance rule. If a status has no distinct gameplay consequence, merge it into an existing status or remove it.

## 5. Enemy archetype × counterplay matrix

Enemies should teach positioning, target priority or build choices—not require a specific damage type to be viable.

Role names match the merged role list in `ENEMY_DESIGN.md` section 3. Roles combine (e.g. Shooter + Sniper).

| Role | Threat | Player answer | Useful types / tools | Must not become |
| --- | --- | --- | --- | --- |
| Swarm | Surrounding and body-blocking | Move, clear a lane, use area damage | Static chains, Force displacement, Mucus lane control | Unavoidable contact damage |
| Charger | Telegraphs a heavy hit or collision | Dodge, bait, interrupt, reposition | Force poise pressure, Mucus setup, player movement | A raw-DPS check |
| Tank | High effective health and slow pressure | Strip defence, flank, avoid commitment | Acid erosion, Force displacement | Mandatory Acid in every build |
| Shooter | Projectiles while player is moving | Break line, dodge, close distance | Movement, Force displacement, Mucus control | Off-screen unavoidable damage |
| Sniper | High damage after a clear wind-up | Read tell and change lane | Dodge; Force/Static only within explicit interrupt windows | Unreadable phone-screen one-shots |
| Controller | Sticky zones and lane denial | Route around, remove priority threat | Movement, Force displacement, deliberate hazard interactions | Removing every safe route |
| Support | Regeneration, Membrane or buffs | Focus, interrupt, isolate | Acid defence erosion, Static tagged interruption, Soul only when explicitly tagged | Mandatory hard-counter checks |
| Leech | Heals or grows from injury | Burst, disengage, deny contact | Force displacement, Blood mirror-economy interactions | Punishing damage twice without warning |
| Relay | Enables nearby chains or buffs | Break cluster/link, prioritise relay | Static interactions, Force to separate enemies | Making Static the only viable group answer |
| Controller (hazard) | Persistent damage or route constraint | Read boundary, move lanes, exploit visible setup | Acid, Mucus and Fire where the hazard explicitly supports them | Invisible damage or no safe route |
| Elite / Boss | Tests one mechanic with larger stakes | Learn telegraph, exploit a clear window, manage adds | Varied by boss; at least two viable answers | Full immunity to all control or endless stun-lock |

## 6. Pair coverage and implementation rules

The 21 pairs in Section 1 are the complete canonical pair inventory. Do not reintroduce a nine-type / 36-pair count or the old 28-reaction framework.

For implementation and QA, record for each reaction:

- Pair and order-independence.
- Primary trigger and the exact weapon/target/world requirement.
- Immediate payoff and whether it consumes a mark, coating, wound or patch.
- Duration, radius, target eligibility and boss scaling.
- Visual/audio cue and player counterplay.
- Chain/re-trigger limit and a rough power budget (burst, control, area, sustain or setup).
- Status: **Proposed / Testing / Accepted / Rejected**, with playtest evidence.

Use these coverage labels in any future cross-system table: **S** = signature/strong interaction; **C** = conditional or ability-tag dependent; **—** = no special interaction intended; **?** = unresolved. A blank or dash is not immunity.

## 7. Coverage against the five core defences

Read each cell by **damage component**, not damage-type name alone: direct hit, status application, persistent hazard, or control/impulse. Blocking a hit does not automatically remove an effect already applied or a hazard already created. These are baseline rules, not permission to add hidden exceptions.

| Type | Squishy | Membrane | Shell | Thorns | Dodge |
| --- | --- | --- | --- | --- | --- |
| Force | Proportionally reduces the hit (physical) and softens knockback and collision impulse | Drains it less efficiently and knocks back less while up | Reduces the hit by fixed layer value; a heavy hit can shed one layer | Triggers only if Force is delivered as a qualifying contact hit on the defender | Avoids the hit in its valid dodge window; AoE edge can still connect |
| Acid | No effect on Acid damage, corrosion or pool exposure | Absorbs eligible direct damage; corrosion applies only if the applying hit got through; does not stop regeneration by default | Corrosion erodes or removes layers, which stay gone | Not triggered by pools or remote hazards | Avoids the delivery; does not clear an Acid Pool or existing Corrosion |
| Static | No effect on Charge or interruption unless there is an explicit impulse component | Can be recharged or supercharged (bounded, visible, no loop) | Not mitigated unless the component is physical-tagged; no default bypass | Not triggered by arcs or remote effects | Avoids telegraphed hits; an active arc or hazard follows its own rule |
| Mucus | No effect on sticking or movement restriction | May absorb the carrier hit; does not erase a patch already placed | Does not reduce Snared or movement control by default | Not triggered by patches | May avoid the carrier; a sticky patch or Adhered target still constrains the dodge path |
| Blood | Softens qualifying physical cuts; Bleed and Extraction are not automatically reduced | May absorb the carrier hit; an existing wound is not removed | Mitigates the physical component; Bleed ticks are not automatically reduced | Not triggered by Bleed ticks | Avoids the carrier; does not undo an applied wound or pool |
| Soul | No effect unless there is an impulse component | Absorbs eligible direct Soul damage; only an essence-targeting component bypasses | Mitigates ordinary physical components; only an essence-targeting component bypasses | Not triggered by marks or essence effects | Avoids eligible telegraphed attacks; does not remove a Soul Mark |
| Fire | No effect on heat or Burn unless there is an impulse component | May absorb a covered hit; Burn applies only if the delivery applies it; does not prevent later zone exposure | Mitigates the physical component only; Shell and Burn are separate layers | Not triggered by Burn or zones | Avoids the delivery; leaving a zone limits exposure but does not undo Burn |

Do not infer blanket type immunities from this table. Resolve each conditional interaction at the attack and status-tag level.

## 8. Priority audit and definition of done

| Priority | Issue | Decision / test |
| --- | --- | --- |
| P0 | All 21 pairs need distinct, legible reactions | Complete the inventory above; playtest whether each payoff is noticed and understood at mobile speed |
| P0 | Similar reactions risk feeling interchangeable | Compare Acid + Static vs Static + Blood, and Acid + Fire vs Force + Acid; tune visual shape and trigger as well as damage |
| P1 | Too many conditions can hide reactions | Prefer visible marks, patches, wounds or named combos; remove requirements that depend on obscure enemy variants |
| P1 | Control and interruption can lock enemies down | One catch per patch, short control windows, poise thresholds and no reaction re-trigger loops |
| P1 | Reaction damage can multiply excessively | Set a primary power budget; do not stack burst + DoT + vulnerability + chain without explicit justification |
| P1 | Fire can dominate all surfaces | Only the three listed Fire reactions; no universal explosion rule |
| P2 | Status vocabulary may expand without adding value | Merge effects that have the same player-facing consequence; keep duration and stack rules explicit |
| P2 | Mobile readability | Test in greyscale and at phone size; use shape, motion and sound as well as colour |

Definition of done:

- [ ]  Seven canonical types only: Force, Acid, Static, Mucus, Blood, Soul, Fire.
- [ ]  All 21 pairs have a deliberate trigger and one clear payoff.
- [ ]  Every reaction has limits on duration, range, consumption and re-triggering.
- [ ]  Five core defences (Squishy, Membrane, Shell, Thorns, Dodge) remain distinct and do not create blanket type immunities.
- [ ]  Every status has a consequence, duration/termination rule, stack rule where needed, and counterplay.
- [ ]  Enemy archetypes permit at least two viable player responses; no routine enemy requires one specific type.
- [ ]  Proposed mechanics are validated in fast mobile playtests before being marked Accepted.

## 9. Remaining updates (merged from the hand-off document, 17 Oct 2026)

Source: "Combat Matrix Remaining Updates". Nothing here changes the 21 pair rows in section 1 (names and behaviours match). Do not add duplicate rows.

### Design constraints (additions)

- Fast Android game: every reaction must be readable at a glance, with no hidden stacks, long recipes or delayed multi-step conditions.
- Keep four concepts separate: **damage type**, **attack delivery**, **behaviour modifier**, **source**.
- Voice (decided 17 Oct 2026): the impulsive, blunt, immature gameplay voice belongs to the **pre-incarnate consciousness**, which speaks to the sperm as "you" and is not the sperm. The Scientist stays the external, clinical observer. The sperm itself does not speak. See `VOICE_GUIDE.md`.

### Four low-confidence reactions (decide before implementation)

| Pair | Reaction | Question to settle |
| --- | --- | --- |
| Force + Soul | Soul Purpose | Is breaking a mark and exposing the target to the next Soul hit clear and useful enough? |
| Acid + Soul | Soul Erosion | Is a brief mark refresh worth a reaction slot, or should it be replaced? Do not add a defence for it. |
| Blood + Soul | Blood Donor | Is a small fixed heal right? Cap it and stop repeat-hit farming. |
| Soul + Fire | Spectral Combustion | Is the extra mark worth the visual and state burden? Keep the payoff immediate and on hit, not on defeat. |

### Defence rules to verify

- **Squishy / Absorption:** proportional reduction of qualifying physical damage; may soften impulse and knockback; no blanket status resistance. Force counts as physical.
- **Membrane:** separate pool, absorbs eligible direct damage before health, regenerates after a short spell without Membrane damage. Force drains it less efficiently and knocks back less while it is up. Static may recharge or supercharge it, with a visible cap and no loop. Direct Soul damage is absorbed normally; only a component tagged **essence-targeting** bypasses it.
- **Shell:** finite, non-regenerating layers with fixed reduction against qualifying physical hits. Acid erodes layers; a heavy Force hit may knock one loose. Distinct from Squishy (fixed layers against proportional). Shell does not mitigate Burn or heat.
- **Thorns:** no mitigation. Retaliates once per qualifying melee or contact hit (not once per damage component). Ranged attacks, remote hazards, non-contact effects and cleanly dodged attacks do not trigger it.
- **Dodge:** avoids eligible hits through movement and timing; a clean miss also avoids the effects attached to that hit. An AoE edge can still hit and persistent hazards hit later. It clears no existing status or hazard. Mucus constrains Dodge only when the path crosses a sticky zone or the target is Adhered.


### Defence interaction rows (one row each, no duplicates)

| Interaction | Status | Rule |
| --- | --- | --- |
| Acid erodes Shell | Accepted | Corrosion removes finite layers. Does not disable Membrane or bypass defences generally. |
| Heavy Force can shed a Shell layer | Proposed | A thresholded heavy hit removes one layer. |
| Membrane resists Force impact | Proposed | Less drain and less knockback while the Membrane is up. |
| Static recharges / supercharges Membrane | Proposed | Bounded, visible, no loop. |
| Membrane absorbs eligible direct damage | Proposed | Status prevention depends on whether the applying hit was prevented. |
| Essence-targeting Soul may bypass Shell or Membrane | Proposed | Only an explicitly tagged component. The Soul label alone is not enough. |
| Shell and Burn remain separate layers | Proposed | Shell mitigates the physical component, not heat. |
| Squishy absorbs physical impact | Accepted (verify) | Proportional; no blanket status resistance. |
| Thorns retaliate once on contact | Accepted (verify) | Once per qualifying contact hit. |
| Dodge avoids eligible attacks | Accepted (verify) | A clean dodge prevents the hit and its attached effects. |
| Mucus constrains Dodge routes | Testing | Sticky zone or Adhered target only. |
| Extinguishing suppresses Fire | Proposed | A specific supported action reduces Burn exposure or stops propagation. Water is not a damage type. |
| Membrane and Soul effects | Accepted (verify) | Eligible direct Soul damage is absorbed; only essence-targeting components bypass. |

### Shared implementation rules (additions)

- Resolve each attack into components: direct damage, status application, impulse or control, persistent hazard.
- If the hit that applies a status is prevented, so is the status, unless a rule says otherwise. Existing statuses and hazards stay until their own rule removes them.
- Never apply Thorns more than once per attack.
- Prefer one-step reactions; no recursive splashes or arcs, unbounded propagation, hidden counters or long setup chains.

### Manual checklist

- [ ] Every pair row uses the names and behaviours in section 1; no duplicates.
- [ ] Each pair row links both damage types and any required mechanic or status.
- [ ] Proposed / Accepted / Testing statuses match what was actually approved.
- [ ] The four low-confidence reactions are decided.
- [ ] Defence interaction rows exist once, with correct statuses.
- [ ] Damage type, attack type, behaviour modifier and source are separate fields.
- [ ] Every reaction reads quickly, has one payoff and no unbounded loop.
