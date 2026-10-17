# Defence Types

A reference for the five core defensive mechanics in Spawn Prawn. Each defence changes a different combat outcome: soften physical impact, absorb damage with a regenerating barrier, reduce physical damage with finite Shell layers, retaliate on contact, or avoid eligible attacks.

<aside>
🧭

**Design baseline:** these are distinct mechanics, not universal damage-type immunities. Resolve the actual attack component—direct damage, status application, persistent hazard, impulse/control, or area coverage—and keep the result readable at combat speed.

</aside>

## Core defence roster

- **Squishy / Absorption:** proportionally reduces qualifying physical damage and may soften physical impulse.
- **Membrane:** a separate regenerating Membrane pool; Force is resisted, while Static can supercharge or rapidly recharge it.
- **Shell:** finite, non-regenerating Shell layers that reduce qualifying physical damage; Acid erodes layers and heavy Force can knock one loose.
- **Thorns:** returns damage after qualifying melee/contact hits; does not reduce incoming damage.
- **Dodge:** avoids eligible hits through movement/timing; it does not erase existing statuses or persistent hazards.

## Shared rules

- **Force is physical damage.** Squishy and Shell therefore affect Force damage when its attack component qualifies as physical; they differ in how they mitigate it.
- **Squishy uses proportional reduction.** It softens qualifying physical damage rather than subtracting a fixed amount.
- **Shell uses finite layers.** Layers provide a fixed reduction against qualifying physical hits and are permanently lost when shed during an encounter. Exact values remain for tuning.
- **Membrane is its own pool.** It absorbs eligible direct damage before health. Force is less effective against the membrane than ordinary eligible damage; Static can accelerate recovery or temporarily supercharge it, depending on the attack/ability rule chosen.
- **Damage blocking is not status immunity.** Prevent an attached status only when its application hit is prevented or a specific resistance says so.
- **Persistent hazards resolve separately.** Dodging a projectile does not grant immunity to an Acid pool, burning zone, or other hazard entered later.
- **Thorns triggers once per qualifying connected contact hit.** It does not mitigate that hit; a clean Dodge means no contact and no retaliation.
- **Area attacks use their actual coverage.** Dodging the core may still leave the creature inside the edge of a blast or wave.
- **Keep counterplay visible.** Membrane recharge, Shell loss, Thorns retaliation, and successful/failed Dodge outcomes need clear cues.

## Individual defence pages

The pages below use the same design-reference approach as the damage-type pages: identity, core mechanics, scaling, strengths and weaknesses, interactions, and explicit limits.

[Squishy / Absorption](#)

[Membrane](#)

[Shell](#)

[Thorns](#)

[Dodge](#)

---

# Dodge

**Don't absorb the hit. Don't be where it lands.**

Dodge avoids eligible attacks through movement, timing, and attack coverage. It is not a damage-reduction stat, a Membrane pool, or a cleanse.

## Core mechanics

<aside>
💨

**Avoid eligible hits**

If the attack's hitbox does not connect during the dodge, the hit and effects attached to that hit are avoided.

</aside>

<aside>
💥

**Area coverage still matters**

Dodging the centre of an explosion or wave does not guarantee escape from its outer edge. Resolve the actual footprint of each attack; do not impose one universal partial-dodge rule.

</aside>

<aside>
☣️

**Existing effects persist**

Dodge does not remove a status already applied or erase a persistent hazard. A creature can avoid a projectile and still be damaged later by entering an Acid pool or burning zone.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Dodge window | The timing window during which eligible hits can miss |
| Movement / coverage | Whether the creature actually leaves the attack's hitbox |
| Attack tags | Which attacks can be avoided; not every effect must be dodgeable |
| AoE footprint | Core, edge, and lingering zone are resolved by the specific attack |

Tune for quick visual comprehension. Telegraph attacks clearly and ensure a clean miss looks different from a partial AoE hit.

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Telegraphable projectiles and strikes | Wide AoEs, persistent hazards, and attacks that cover the dodge path |
| Attacks with a clear impact moment | Existing status effects and hazards already on the ground |
| Contact attacks that can be made to miss | A successful miss avoids Thorns retaliation, but mistiming still leaves the dodge vulnerable |

## Interactions with damage types

- **Force — Conditional:** a dodge can avoid the strike or charge; the shockwave/outer AoE may still connect if the creature remains inside its footprint.
- **Acid — Conditional:** dodge the projectile or strike, but not an Acid pool already on the ground or later contact with it.
- **Static — Conditional:** dodge the carrier hit if eligible. Arcs, chained targets, or area coverage resolve according to their own hitboxes; a dodge is not universal electrical immunity.
- **Mucus — Conditional:** avoid the application hit to avoid its attached status. Existing patches or snares remain active.
- **Blood — Conditional:** avoid the wound-applying hit to prevent that hit's Bleed application; an existing wound or pool remains.
- **Soul — Attack-dependent:** dodge a projectile or strike if it has an avoidable hitbox. An explicitly unavoidable essence effect is not dodged just because it is Soul damage.
- **Fire — Conditional:** avoid the projectile or strike if eligible. The edge of an AoE or a persistent burning zone can still connect; Dodge does not remove Burning already applied.

## Design guardrails

- A clean miss prevents statuses attached to that hit unless a separate rule says otherwise.
- AoE edge outcomes are attack-specific, not a global half-damage rule.
- Persistent hazards and already-applied statuses are separate from the initial hit.
- Make timing and hit coverage readable on a small phone screen.

---

# Membrane

**A barrier before the body. Break contact, let it recover, then go again.**

Membrane is a separate, regenerating Membrane pool. It buys temporary protection, but sustained pressure delays recovery. Force and Static have distinctive interactions with it.

**Design language:** Blue. On player, Reactive membrane. On enemies. Blue ring. 

## Core mechanics

<aside>
🛡️

**Separate Membrane pool**

Eligible direct damage drains Membrane before it can damage health. The pool has its own visible state and does not count as health or Shell layers.

</aside>

<aside>
⏳

**Regeneration**

After a brief period without Membrane damage, Membrane begins to recover. Use one simple delay and a strong visual/audio tell rather than hidden stacks or complicated recovery conditions.

</aside>

<aside>
💥

**Force resistance**

Force is physical damage. Membrane is unusually resistant to Force: Force damage is less effective against the Membrane pool, and Force knockback against a creature protected by an active Membrane is reduced. This resistance applies to the Membrane interaction, not as blanket Force immunity after the Membrane breaks.

</aside>

<aside>
⚡

**Static supercharge / rapid recharge**

Static can interact with Membrane by quickly recharging it or temporarily supercharging it. A specific attack should choose one clear payoff: restore Membrane capacity quickly, or briefly raise the Membrane's capacity/effect. Telegraph the charge and cap the benefit; do not let repeated Static hits create an infinite Membrane loop.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Membrane capacity | How much eligible damage the pool can absorb |
| Recharge delay | Time without Membrane damage before recovery begins |
| Recharge rate | Speed of recovery once it starts |
| Force modifier | Force drains the pool less efficiently than ordinary eligible damage |
| Static interaction | A bounded recharge or short overcharge effect, with a clear cue and cap |

Exact values and whether a given Static attack recharges or supercharges Membrane remain ability-level tuning decisions.

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Sustained protection while the pool remains | Continuous pressure prevents recovery |
| Eligible direct damage before it reaches health | Force is resisted but still contributes; do not make the Membrane unbreakable |
| Static can reinforce the Membrane | Static supercharge can be a risk/reward enemy mechanic; make its trigger visible |

## Interactions with damage types

- **Force — Resists:** Force damage drains Membrane less efficiently; Force knockback against the Membraneed creature is reduced. Force still damages the pool.
- **Acid — Normal / conditional:** Acid drains the Membrane as eligible damage. Corrosion does not automatically disable regeneration; add that only as a deliberate, visible interaction.
- **Static — Signature interaction:** Static can rapidly recharge or supercharge Membrane. Bound the amount/duration and prevent repeat-hit loops.
- **Mucus — Conditional:** the Membrane may absorb an eligible direct delivery hit, but does not automatically prevent Mucus patches or later contact with them.
- **Blood — Conditional:** eligible direct Blood damage is absorbed by the pool; existing Bleed or Extraction follows its own application rules.
- **Soul — Conditional:** a direct essence-targeting effect bypasses Membrane only if explicitly tagged to target essence rather than the surface. Do not give all Soul attacks a blanket bypass.
- **Fire — Conditional:** eligible direct Fire damage is absorbed by the pool; Burning or a persistent fire zone follows separate rules.

## Design guardrails

- Make Membrane state and recharge unmistakable at phone-screen scale.
- Static's recharge/supercharge must have a bounded payoff and a readable tell.
- A full Membrane does not imply immunity to statuses, control, or hazards.
- Do not confuse Membrane with Shell: Membrane recovers; Shell loses finite layers for the encounter.

---

# Shell

**Rigid layers. Shrug off small hits. Lose protection one piece at a time.**

Shell is finite, non-regenerating physical plating. Each remaining layer reduces qualifying physical damage by a fixed amount. Unlike Squishy, it does not scale as a percentage of each hit.

**Visual language:** Brown UI ring (multiple rings if multiple Shell layers that shed)

## Core mechanics

<aside>
🐚

**Finite Shell layers**

Each intact layer provides a fixed reduction against qualifying physical damage. When a layer is lost, that protection is gone for the rest of the encounter.

</aside>

<aside>
🧪

**Acid erosion**

Acid can erode or remove Shell layers. Make the loss visible and decisive; avoid adding a separate hidden corrosion meter just for Shell.

</aside>

<aside>
💥

**Heavy Force impact**

A sufficiently heavy Force hit can knock a Shell layer loose. Force is physical damage, but its special payoff here is shedding a layer—not bypassing Shell entirely or dealing automatic bonus damage.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Layer count | Finite number of protective layers at encounter start |
| Reduction per layer | Fixed amount subtracted from each qualifying physical hit, subject to a sensible damage floor |
| Layer loss | Permanent for the encounter; triggered by defined damage/threshold rules |
| Acid erosion | A clear layer-removal or accelerated-layer-loss rule |
| Force threshold | A readable heavy-impact threshold that can shed one layer |

The exact reduction, threshold, and number of layers remain for playtesting. Reuse the existing prototype Shell visual to communicate remaining layers.

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Repeated small physical hits | Acid erosion and heavy Force impacts |
| Enemies that rely on rapid, low-damage strikes | Non-physical damage components not covered by Shell |
| Visible, predictable mitigation while layers remain | Protection declines permanently as layers are shed |

## Interactions with damage types

- **Force — Conditional / signature:** qualifying physical damage is reduced by intact layers. A sufficiently heavy impact can knock one layer loose.
- **Acid — Signature counter:** Acid erodes or removes layers, making later physical hits more effective.
- **Static — Normal:** electrical damage is not reduced unless the attack has a qualifying physical component.
- **Mucus — Normal:** movement control is not physical damage; Shell does not prevent sticking or snaring by default.
- **Blood — Conditional:** qualifying physical cuts or strikes are reduced. Bleed and Extraction are not automatically reduced.
- **Soul — Conditional:** only a physical component is reduced. Explicit essence-targeting components may bypass Shell; this must be an attack tag, not a universal Soul rule.
- **Fire — Normal / conditional:** heat and Burning are not reduced by physical Shell. A physical carrier component may be reduced.

## Design guardrails

- Shell uses **fixed reduction per finite layer**; Squishy uses proportional reduction.
- Never regenerate lost layers during the same encounter.
- Acid and heavy Force should be readable ways to remove protection, not mandatory damage types for making the enemy beatable.
- Keep the visual layer count aligned with the actual remaining protection.

---

# Squishy / Absorption

**Give under pressure. Soften the hit. Stay hard to knock around.**

Squishy represents soft, yielding bodies that absorb physical impact instead of transmitting it cleanly. It is a focused physical defence, not a general resistance to damage or control.

**Design language:** Rubbery, slimy

## Core mechanics

<aside>
🫧

**Proportional physical damage reduction**

Qualifying physical damage is reduced by a percentage. Force is physical damage, so Force hits are included when their damage component is tagged as physical.

</aside>

<aside>
🪶

**Impulse absorption**

The same yielding body may reduce physical impulse, knockback, or collision force. Keep this separate from damage reduction so an attack can hurt without moving the target much.

</aside>

<aside>
🚫

**Not universal resistance**

Squishy does not inherently resist Acid, electricity, heat, Soul effects, wounds, or movement control. It does not grant status immunity.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Physical reduction | Percentage of qualifying physical damage removed; tune so large hits still matter |
| Impulse reduction | Optional separate reduction to knockback or collision impulse |
| Coverage | Applies to the physical component, not automatically every effect carried by an attack |

Use one clear proportional reduction rather than stacking multiple hidden absorption layers. Numerical values remain for playtesting.

## Strengths & weaknesses

| Strong against | Weak against |
| --- | --- |
| Repeated physical hits and blunt impacts | Acid, heat, Static, and other non-physical components |
| Force knockback, if impulse reduction is enabled | Control effects that do not rely on physical impulse |
| Physical attacks with no secondary effect | Statuses and persistent hazards that have already been applied |

## Interactions with damage types

- **Force — Resists:** Force is physical damage, so its qualifying damage is proportionally reduced. Optional impulse absorption also reduces knockback; it does not make the target immune to poise pressure unless specified.
- **Acid — Normal:** no inherent resistance to corrosion or Acid damage. A physical delivery component can still be reduced.
- **Static — Normal:** electrical damage and Charge are unaffected unless the attack also carries a qualifying physical component.
- **Mucus — Normal:** sticking, snaring, and movement restriction are not physical impact damage.
- **Blood — Conditional:** qualifying physical cuts or strikes can be reduced; Bleed and Extraction are not automatically reduced.
- **Soul — Normal:** essence-targeting effects are not physical impact. Only a separately tagged physical component qualifies.
- **Fire — Normal:** heat and Burning are not physical impact. A physical strike that also carries Fire may have only its physical component reduced.

## Design guardrails

- Squishy uses **percentage reduction**, unlike Shell's fixed reduction per finite layer.
- Big physical hits should still feel big; never let absorption erase Force's identity.
- Do not silently reduce every status just because the body is soft.
- Show the hit landing and being absorbed; avoid a visual that looks like a miss or immunity.

---

# Thorns

**Hitting it hurts you back. The hit still lands.**

Thorns punishes close-range contact by returning damage after a qualifying melee hit connects. It does not reduce or cancel the incoming hit.

**Visual language:** Literal thorns, spikes.

## Core mechanics

<aside>
🌵

**Contact retaliation**

After a qualifying melee/contact attack connects, Thorns returns a bounded amount of damage to the attacker. Resolve it once per hit, not once per damage component.

</aside>

<aside>
🚫

**No mitigation**

Thorns does not absorb, reduce, or cancel the original attack. The attacker receives its normal hit payoff and then takes the retaliation.

</aside>

<aside>
🫥

**Contact must connect**

Ranged attacks, remote hazards, and non-contact effects do not trigger Thorns by default. If Dodge makes the attack miss, there is no retaliation.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Retaliation damage | Fixed or otherwise bounded amount that is easy to read |
| Trigger eligibility | Melee/contact hit that actually connects |
| Trigger frequency | Once per connected hit, never once per damage type/component |
| Variant effects | Bleeding or charged retaliation belongs to an explicit variant or weapon combo, not baseline Thorns |

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Repeated close-range melee attackers | Ranged attacks and remote hazards |
| Fast attackers that connect many separate hits | Dodging, spacing, or using non-contact attacks |
| Enemies that force the player into contact | It offers no protection from the incoming damage |

## Interactions with damage types

- **Force — Conditional:** triggers if the Force attack makes qualifying melee contact. A missed charge or remote shockwave does not trigger it.
- **Acid — Conditional:** a close-range Acid strike can trigger retaliation if it physically contacts the defender; an Acid pool or ranged splash does not.
- **Static — Conditional:** a contact Static attack can trigger Thorns. A remote arc does not.
- **Mucus — Conditional:** direct contact application can trigger Thorns only if the delivery is a qualifying melee/contact hit; an existing sticky patch does not.
- **Blood — Conditional:** a melee Blood strike can trigger Thorns. A wound ticking later or a remote extraction effect does not.
- **Soul — Conditional:** only a Soul attack with actual qualifying physical/contact delivery triggers Thorns. A purely essence-targeting effect does not.
- **Fire — Conditional:** a melee Fire strike can trigger Thorns if it makes contact. A projectile, burning zone, or later Burning tick does not.

## Design guardrails

- Retaliation is not damage reduction, Shell, or a guaranteed trade advantage.
- Resolve one retaliation per connected hit, even when that hit carries several damage types.
- A miss caused by Dodge cannot trigger Thorns.
- Keep “bleeding thorns,” “charged thorns,” and similar effects as explicit variants or combo payoffs.