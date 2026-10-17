# Defence Types

A reference for the five core defensive mechanics in Spawn Prawn. Each defence changes a different combat outcome: soften physical impact, absorb damage with a regenerating barrier, reduce physical damage with finite Shell layers, retaliate on contact, or avoid eligible attacks.

<aside>
🧭

**Design baseline:** these are distinct mechanics, not universal damage-type immunities. Resolve the actual attack component—direct damage, status application, persistent hazard, impulse/control, or area coverage—and keep the result readable at combat speed.

</aside>

## Core defence roster

- **Squishy / Absorption:** proportionally reduces blunt physical impact (Force) and may soften impulse; cuts go through.
- **Membrane:** a separate regenerating Membrane pool; Force is resisted, while Static recharges it.
- **Shell:** finite, non-regenerating layers that reduce qualifying physical damage; ordinary hits wear a layer slowly, Acid strips them fast, a heavy Force hit knocks one off at once.
- **Thorns:** returns damage after qualifying melee/contact hits; does not reduce incoming damage.
- **Evasion:** a miss chance against Contact, Projectile and Spread hits; never Burst, Beam or Pool. It does not erase existing statuses or hazards.

## Shared rules

- **Force is physical damage.** Squishy and Shell both affect it; they differ in how they mitigate it. Squishy is blunt only, so cuts go through it.
- **Who can have them.** Enemies and the player can both have any of the five (the player through mutations and items).
- **Squishy uses proportional reduction.** It softens blunt impact rather than subtracting a fixed amount.
- **Shell uses finite layers.** Layers provide a fixed reduction against qualifying physical hits. Each layer has a little health: ordinary hits wear it slowly, Acid's Corrosion fast, and a heavy Force hit removes it at once. Lost layers stay gone for the encounter. Exact values remain for tuning.
- **Membrane is its own pool.** It absorbs eligible direct damage before health. Force is less effective against the membrane than ordinary eligible damage; Static recharges it (+25% capacity, once per 5 s).
- **Damage blocking is not status immunity.** Prevent an attached status only when its application hit is prevented or a specific resistance says so.
- **Persistent hazards resolve separately.** A missed projectile gives no immunity to an Acid Pool, Burn zone or other hazard entered later.
- **Thorns triggers once per qualifying connected contact hit.** It does not mitigate that hit; an Evasion miss means no contact and no retaliation.
- **Area attacks ignore Evasion.** Burst, Beam and Pool always land and use their actual footprint.
- **Keep counterplay visible.** Membrane recharge, Shell loss, Thorns retaliation, and Evasion misses need clear cues.

## Individual defence pages

The pages below use the same design-reference approach as the damage-type pages: identity, core mechanics, scaling, strengths and weaknesses, interactions, and explicit limits.

[Squishy / Absorption](#)

[Membrane](#)

[Shell](#)

[Thorns](#)

[Evasion](#)

---

# Evasion

**Don't absorb the hit. Don't be where it lands.**

Evasion is a miss chance against hits that travel to a single point: Contact, Projectile and Spread. It is not a damage-reduction stat, a Membrane pool, or a cleanse. (Renamed from Dodge on 17 Oct 2026 so it doesn't clash with autorun, where every mode "dodges" by moving.)

**Visual language:** a quick sideways flicker and a visible "miss" puff, so a miss never looks like an immunity or a bug.

## Core mechanics

<aside>
💨

**Miss chance**

Each eligible hit rolls against the creature's Evasion. A miss avoids the hit and everything attached to it (status build-up, impulse, Thorns retaliation). Spread rolls once per pellet, so some pellets land.

</aside>

<aside>
💥

**Area attacks always land**

Evasion never applies to Burst, Beam or Pool. Area attacks are the reliable answer to an evasive creature, for both the player and enemies.

</aside>

<aside>
☣️

**Existing effects persist**

Evasion does not remove a status already applied or erase a hazard. A creature can make a projectile miss and still be hurt by walking into an Acid Pool or Burn zone.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Miss chance | Percentage of eligible hits that miss; keep it well below half so builds never look broken |
| Eligible attack types | Contact, Projectile and Spread only |
| Pellet rule | Spread rolls per pellet |

Values remain for playtesting. The docs warn against hidden dice elsewhere; Evasion is the one deliberate exception, so its "miss" puff must always show.

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Single projectiles and Contact strikes | Burst, Beam and Pool, which always land |
| Contact attackers (a miss means no Thorns retaliation) | Statuses and hazards already applied |
| Slow, heavy single hits | Many small hits (Spread pellets, Beam ticks) that average out the luck |

## Interactions with damage types

The same rule for every type: Contact, Projectile and Spread hits can miss; Burst, Beam and Pool always land.

- **Force:** a missed strike carries no knockback or Poise. A Force Burst still lands.
- **Acid:** a miss prevents its Corrosion; an Acid Pool on the ground is unaffected.
- **Static:** a miss prevents Charge on that hit; arcs and charged patches follow their own rules.
- **Mucus:** a miss prevents the Snare; a sticky patch still Snares whatever moves into it.
- **Blood:** a miss prevents that hit's wound; an existing Bleed or blood pool remains.
- **Soul:** a miss also avoids the build-up that hit carried; it does not end Possessed.
- **Fire:** a miss adds nothing to the Burn bar; a Burn zone still fills it.

## Design guardrails

- A miss prevents everything attached to that hit unless a separate rule says otherwise.
- Never apply Evasion to Burst, Beam or Pool.
- Hazards and already-applied statuses are separate from the initial hit.
- Always show the "miss" puff.

---

# Membrane

**A barrier before the body. Break contact, let it recover, then go again.**

Membrane is a separate, regenerating Membrane pool. It buys temporary protection, but sustained pressure delays recovery. Force and Static have distinctive interactions with it.

**Design language:** Blue. On the player, a reactive membrane like the existing armour bubble. On enemies, a blue ring.

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

**Static recharge**

A Static hit restores 25% of the Membrane's capacity, at most once every 5 s, with a visible crackle across the bubble. There is no supercharge (no capacity above full).

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Membrane capacity | How much eligible damage the pool can absorb |
| Recharge delay | Time without Membrane damage before recovery begins |
| Recharge rate | Speed of recovery once it starts |
| Force modifier | Force drains the pool less efficiently than ordinary eligible damage |
| Static interaction | Recharges 25% of capacity, at most once per 5 s, with a clear cue |

Starting values: `COMBAT_MATRIX.md` section 11.4.

## Strengths & weaknesses

| Strong against | Weak against / counterplay |
| --- | --- |
| Sustained protection while the pool remains | Continuous pressure prevents recovery |
| Eligible direct damage before it reaches health | Force is resisted but still contributes; do not make the Membrane unbreakable |
| Static can reinforce the Membrane | Static recharge is a risk the player sees; make its tell visible |

## Interactions with damage types

- **Force — Resists:** Force damage drains Membrane less efficiently; Force knockback against a creature with an active Membrane is reduced. Force still damages the pool.
- **Acid — Normal:** Acid drains the Membrane as eligible damage. Corrosion does not disable regeneration.
- **Static — Signature interaction:** Static recharges Membrane: +25% capacity, once per 5 s.
- **Mucus — Conditional:** the Membrane may absorb an eligible direct delivery hit, but does not automatically prevent Mucus patches or later contact with them.
- **Blood — Conditional:** eligible direct Blood damage is absorbed by the pool; existing Bleed or Extraction follows its own application rules.
- **Soul — Normal:** eligible direct Soul damage is absorbed like any other; no bypass. Build-up toward Possessed applies only if the hit carrying it is not blocked.
- **Fire — Conditional:** eligible direct Fire damage is absorbed by the pool; Burning or a persistent fire zone follows separate rules.

## Design guardrails

- Make Membrane state and recharge unmistakable at phone-screen scale.
- Static's recharge has a fixed amount, a 5 s limit and a readable tell.
- A full Membrane does not imply immunity to statuses, control, or hazards.
- Do not confuse Membrane with Shell: Membrane recovers; Shell loses finite layers for the encounter.

---

# Shell

**Rigid layers. Shrug off small hits. Lose protection one piece at a time.**

Shell is finite, non-regenerating physical plating. Each remaining layer reduces qualifying physical damage by a fixed amount, and has a little health of its own. Unlike Squishy, it does not scale as a percentage of each hit.

**Visual language:** Brown UI ring, one ring per layer; a ring cracks off when its layer is lost.

## Core mechanics

<aside>
🐚

**Finite Shell layers**

Each intact layer provides a fixed reduction against qualifying physical damage and has a little health. Ordinary qualifying hits wear the outer layer down slowly. When a layer is lost, that protection is gone for the rest of the encounter.

</aside>

<aside>
🧪

**Acid erosion**

Acid hits fill a visible Corrosion bar; when it is full the outer layer is stripped for good and the bar resets. Much faster than ordinary wear. No timer, no stacks.

</aside>

<aside>
💥

**Heavy Force impact**

A heavy Force hit (one defined threshold) knocks the outer layer off at once. The same threshold defines a heavy hit for Blood Pressure. It does not bypass Shell or deal bonus damage.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Layer count | Finite number of protective layers at encounter start |
| Reduction per layer | Fixed amount subtracted from each qualifying physical hit, subject to a sensible damage floor |
| Layer health | Small; ordinary qualifying hits wear it down slowly |
| Layer loss | Permanent for the encounter |
| Acid erosion | A full Corrosion bar strips one layer |
| Force threshold | A readable heavy-impact threshold that knocks off one layer |

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
- **Blood — Conditional:** the physical part of a cut or strike is reduced. Bleed and Extraction are not reduced.
- **Soul — Normal:** a qualifying physical component is reduced; no bypass. Shell does not resist build-up or Possessed.
- **Fire — Normal / conditional:** heat and Burning are not reduced by physical Shell. A physical carrier component may be reduced.

## Design guardrails

- Shell uses **fixed reduction per finite layer**; Squishy uses proportional reduction.
- Never regenerate lost layers during the same encounter.
- Acid and heavy Force should be readable ways to remove protection, not mandatory damage types for making the enemy beatable.
- Keep the visual layer count aligned with the actual remaining protection.

---

# Squishy / Absorption

**Give under pressure. Soften the hit. Stay hard to knock around.**

Squishy represents soft, yielding bodies that absorb blunt impact instead of transmitting it cleanly. It is a focused anti-Force defence, not a general resistance to damage or control. Cuts go through it.

**Design language:** Rubbery, slimy

## Core mechanics

<aside>
🫧

**Proportional physical damage reduction**

Blunt physical impact is reduced by a percentage. That means Force; cutting damage (such as a Blood slash) is not reduced.

</aside>

<aside>
🪶

**Impulse absorption**

The same yielding body may reduce physical impulse, knockback, or collision force. Keep this separate from damage reduction so an attack can hurt without moving the target much.

</aside>

<aside>
🚫

**Not universal resistance**

Squishy does not resist cuts, Acid, electricity, heat, Soul effects, wounds or movement control. It does not grant status immunity.

</aside>

## Power scaling

| Parameter | Gameplay interpretation |
| --- | --- |
| Blunt reduction | Percentage of blunt impact damage removed; tune so large hits still matter |
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
- **Blood — Normal:** cuts go through (Squishy is blunt only); a blunt Blood strike's impact part is reduced. Bleed and Extraction are not reduced.
- **Soul — Normal:** Soul build-up and Possessed are not physical impact. Only a qualifying physical component is reduced.
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

Ranged attacks, remote hazards, and non-contact effects do not trigger Thorns by default. If Evasion makes the attack miss, there is no retaliation.

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
| Fast attackers that connect many separate hits | Evasion, spacing, or using non-contact attacks |
| Enemies that force the player into contact | It offers no protection from the incoming damage |

## Interactions with damage types

- **Force — Conditional:** triggers if the Force attack makes qualifying melee contact. A missed charge or remote shockwave does not trigger it.
- **Acid — Conditional:** a close-range Acid strike can trigger retaliation if it physically contacts the defender; an Acid pool or ranged splash does not.
- **Static — Conditional:** a contact Static attack can trigger Thorns. A remote arc does not.
- **Mucus — Conditional:** direct contact application can trigger Thorns only if the delivery is a qualifying melee/contact hit; an existing sticky patch does not.
- **Blood — Conditional:** a melee Blood strike can trigger Thorns. A wound ticking later or a remote extraction effect does not.
- **Soul — Conditional:** only a Soul attack with actual qualifying physical/contact delivery triggers Thorns. A ranged Soul attack does not.
- **Fire — Conditional:** a melee Fire strike can trigger Thorns if it makes contact. A projectile, burning zone, or later Burning tick does not.

## Design guardrails

- Retaliation is not damage reduction, Shell, or a guaranteed trade advantage.
- Resolve one retaliation per connected hit, even when that hit carries several damage types.
- A miss caused by Evasion cannot trigger Thorns.
- Keep “bleeding thorns,” “charged thorns,” and similar effects as explicit variants or combo payoffs.