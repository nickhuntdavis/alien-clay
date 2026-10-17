# Damage Types

Force | Acid | Static | Mucus | Blood | Soul | Fire

These are the seven canonical damage types. A **damage type** describes what kind of harm is dealt; an **attack type** describes how it reaches the target. An attack can carry more than one damage component, but each component must resolve against the relevant defence rule.

### Force

**Hit hard. Build momentum. Break poise. Send enemies flying.**

Force is **physical impact damage**. It specialises in high burst, momentum, poise disruption, and displacement. It interrupts through impact and controls space by pushing enemies into hazards, separating groups, or creating room to escape.

- **Damage profile:** High burst, low damage over time.
- **Combat identity:** Physical impact, poise pressure, knockback, and environmental collisions.
- **Primary verbs:** Impact. Stagger. Displace.
- **Defence interaction:** Force is physical damage, so qualifying Force damage is reduced by Squishy and by Shell's remaining armour layers. Membrane is specifically resistant to Force; it reduces Force's effectiveness against the shield pool and reduces knockback against the protected creature. Heavy Force impacts can shed a Shell layer when the hit meets the defined threshold.

### Acid

**Melt armour. Eat through defences. Spread. Corrode. Dissolve.**

Acid is the **attrition and defence-stripping** type. It makes enemies progressively easier to kill through sustained exposure, erodes susceptible armour, interferes with recovery where explicitly defined, and leaves persistent hazards.

- **Damage profile:** Low initial burst; sustained damage and escalating defence pressure.
- **Combat identity:** Corrosion, armour stripping, persistent pools, and area denial.
- **Primary verb:** Dissolve.
- **Defence interaction:** Acid erodes or removes finite Shell layers. It does not automatically disable Membrane regeneration or bypass every shield; any such effect must be a specific, visible interaction. Dodging the delivery does not avoid an Acid pool already on the ground.

### Static

**Zap. Arc. Jolt. Chain. Discharge. Fry. Overload.**

Static is the **chain-and-interrupt** type. It disrupts actions through electrical overload and punishes clustered enemies through readable chain effects.

- **Damage profile:** Medium burst, low damage over time, high multi-target potential.
- **Combat identity:** Chain damage, interruption, conductivity, and overload.
- **Primary verb:** Discharge.
- **Defence interaction:** Static can rapidly recharge or temporarily supercharge Membrane. A specific attack should use one clear payoff, with a visible cue and a bounded benefit; repeated hits must not create an infinite shield loop. Static is not automatically blocked by physical resistance, and a shield does not imply immunity to Charge or interruption.

### Mucus

**Cling. Coat. Stick. Smother. Snare. Encapsulate.**

Mucus is the **control and setup** type. It restricts movement and evasion, controls terrain, and creates opportunities for follow-up attacks rather than relying on high direct damage.

- **Damage profile:** Very low burst and low damage over time.
- **Combat identity:** Coating, movement denial, persistent sticky terrain, and vulnerability setup.
- **Primary verb:** Coat.
- **Defence interaction:** Squishy and Shell do not inherently prevent sticking or movement control. Dodging the application hit can prevent its attached status, but it does not remove existing coating or a patch already placed.

### Blood

**Lacerate. Bleed. Drain. Siphon. Rupture. Harvest.**

Blood attacks the target's **health economy**. It opens wounds, makes those wounds progressively more dangerous, and can convert injury into resources for the attacker. Its identity is the relationship between wounds, health, and extraction—not merely generic damage over time.

- **Damage profile:** Medium to high, with scaling through wounds and missing health.
- **Combat identity:** Wound pressure, execution, extraction, and resource sustain.
- **Primary verb:** Bleed.
- **Defence interaction:** Squishy and Shell can reduce qualifying physical cuts or strikes, but do not automatically reduce Bleed or Extraction. A shield may absorb eligible direct damage, but does not erase an existing wound. Dodge prevents a wound application only when it avoids the hit that applies it.

### Soul

**Sever. Drain. Haunt. Rend. Curse. Harvest.**

Soul attacks **essence and nonphysical resources**. It can drain resources and interfere with spiritual integrity or return from death. It should not become universal unavoidable damage: bypassing physical protection is justified only for an explicitly essence-targeting component.

- **Damage profile:** Medium, with conditional bypass of conventional physical defence.
- **Combat identity:** Essence damage, resource denial, and spiritual disruption.
- **Primary verb:** Sever.
- **Defence interaction:** Soul does not automatically bypass every defence. An essence-targeting component may bypass Shell or Membrane only when the attack is explicitly tagged to target essence rather than the physical surface. Dodge applies only to Soul attacks with an avoidable hitbox.

### Fire

**Ignite. Burn. Spread. Flare. Consume.**

Fire is the **ignition and propagation** type. It builds Burn through hits or continued exposure, triggers a distinct Ignition payoff at a threshold, and can spread to susceptible nearby targets or flammable surfaces under clear conditions.

- **Damage profile:** Moderate initial damage, sustained Burn, conditional burst at Ignition.
- **Combat identity:** Escalating heat, ignition, propagation, and area pressure.
- **Primary verb:** Ignite.
- **Defence interaction:** Squishy and Shell do not inherently resist heat or Burning, though they may mitigate a qualifying physical component delivered by a Fire attack. Membrane absorbs eligible direct damage but does not automatically prevent Burn or protect against later contact with a burning zone. Dodge avoids eligible delivery hits, not Burning already applied.

## Shared combat rules

- **Resolve attack components separately.** Direct damage, status application, impulse/control, and persistent hazards can interact with defences differently.
- **A blocked hit is not blanket status immunity.** An attached status is prevented when its application hit is prevented, unless a specific resistance or immunity rule says otherwise.
- **Persistent hazards and existing statuses remain.** Dodging a projectile does not erase an Acid pool or burning zone; avoiding a hit does not cleanse a status already applied.
- **Keep each defence distinct:** Squishy reduces qualifying physical damage proportionally; Membrane absorbs eligible damage in a regenerating pool and resists Force; Shell subtracts a fixed amount from qualifying physical hits through finite, non-regenerating layers; Thorns retaliates once per qualifying connected melee/contact hit without mitigating it; Dodge avoids eligible hits based on timing and actual attack coverage.
- **Static–Membrane is a deliberate interaction.** Static may rapidly recharge or supercharge Membrane, with a clear cue, bounded benefit, and no repeat-hit loop.
- **Design reactions deliberately.** Every one of the 21 unique damage-type pairs needs at least one designed reaction, but the two types must not trigger it merely because they both hit the same enemy. Use a clear trigger and one main payoff, tuned for fast mobile combat.

[Force](#)

[Acid](#)

[Static](#)

[Mucus](#)

[Blood](#)

[Soul](#)

[Fire](#)

---

# Acid

**Melt armour. Eat through defences. Spread. Corrode. Dissolve.**

Acid is the attrition and defence-erosion type. It makes targets easier to damage by weakening susceptible armour and creates visible, short-lived hazards. Its signature payoff is reducing protection, not adding endless damage-over-time stacks.

## Visual language

**Shocking pink; puddles, dripping trails, splashes, and a shocking-pink UI ring that counts down ongoing Acid exposure.** Use wet bubbling/sizzling and a clear, bounded puddle edge. The puddle and coating should remain recognisable at phone size and in greyscale through silhouette and motion, not colour alone.

## Core mechanics

- **Corrosion:** Temporarily reduces Armour effectiveness. Keep stacks capped and the duration short/readable; a threshold may remove a Shell layer when explicitly supported.
- **Persistent pools:** Some attacks leave a visible Acid pool with a fixed boundary and lifetime. Pools punish lingering but do not last indefinitely.
- **Coating:** Some attacks coat a target, allowing explicit reactions such as Corrosive Splash or Premature Evaporation.
- **Recovery pressure:** Acid may suppress a clearly tagged regeneration effect while Corrosion is active. It does not automatically stop Membrane regeneration; shield recovery follows the shared no-shield-damage rule unless an attack explicitly says otherwise.

## Strengths and limits

**Strong against:** Shell, armour-dependent enemies, clustered enemies standing in a visible pool, and targets that rely on tagged regeneration.

**Weak against:** mobile enemies that leave the hazard, targets without susceptible armour, and short engagements where attrition has no time to matter. Acid should not become a second generic wound/bleed type.

## Defence interactions

- **Squishy / Absorption:** No inherent resistance to Acid damage, Corrosion, or Acid pools.
- **Membrane:** A shield absorbs eligible direct damage before health. It prevents a coating/status only when it blocks the hit that applies it; it does not remove an existing coating or pool.
- **Shell:** Acid is the defining Shell counter: corrosion can erode or remove layers. Make layer loss obvious; layers do not regenerate during the encounter.
- **Thorns:** Pools and non-contact effects do not trigger Thorns. A qualifying melee/contact delivery may trigger one retaliation after it connects.
- **Dodge:** Can avoid an eligible delivery hit. It does not clear existing Corrosion/coating or protect a target that later enters or remains in an Acid pool.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Acid — Corrosive Splash:** A Force strike hits an Acid-coated target; a small amount of Acid splashes onto nearby enemies. The payoff is spreading the setup, not a second large burst.
- **Acid + Static — Conductive Pool:** A Static attack hits an Acid puddle; one electrical pulse travels across that puddle. Keep it within the visible pool boundary and limit it to one pulse.
- **Acid + Mucus — Slick Move:** An Acid weapon hits a Mucus patch; the patch is replaced by a short-lived corrosive slick. Do not layer two hazards; show a clear expiry.
- **Acid + Blood — Caustic Breach:** An Acid combo hits a bleeding target; it briefly strips more Armour than Acid alone. Defence erosion only—no extra damage-over-time or wound stack.
- **Acid + Soul — Soul Erosion:** An Acid combo hits a Soul-marked target; it consumes the mark to weaken a Soul ward if that target has one. If Soul wards are not a shared mechanic, use a brief Soul-mark refresh instead; do not invent a new defence.
- **Acid + Fire — Premature Evaporation:** A Fire attack hits an Acid-coated target; the coating is consumed in a modest close-range burst. This is a target reaction, not an automatic explosion from every Acid puddle.

## Design boundaries

Acid owns corrosion, armour reduction, and bounded hazardous pools. Blood owns wounds and extraction; Mucus owns adhesion and movement control; Fire owns ignition and burning. Separate direct damage from Corrosion, coating application, and later pool exposure when resolving defences.

---

# Blood

**Wound. Bleed. Extract. Turn injury into an advantage.**

Blood is the wound-and-extraction type. It turns qualifying hits into persistent bleeding or limited sustain, but its central identity is bodily injury and health economy—not generic corrosion or unlimited healing.

## Visual language

**Red; visible pools, red trails, wound splashes, and a red UI ring for Bleed duration.** Use a wet impact sound and make the source of each pool legible. Wounds should look like injury, not Acid corrosion; keep the countdown and pool boundary readable on a phone screen and in greyscale.

## Core mechanics

- **Wounds / Bleed:** Qualifying attacks apply a capped Bleed effect that causes damage over time. Keep duration, refresh/stack behaviour, and termination explicit.
- **Wound threshold:** Some attacks can consume or burst an existing wound for one immediate payoff. Do not automatically add another Bleed stack when a wound is consumed.
- **Extraction:** Specific attacks may convert a qualifying hit or wound into a small, capped amount of player sustain. This is a deliberate attack effect, not a reward on every Blood tick.
- **Blood pools:** Only explicit attacks create a pool. Pools are visible, bounded, and short-lived; they can enable the Static reaction below.
- **Trade-offs:** Blood should not simultaneously maximise sustained damage, execution burst, healing, and resource generation without a clear cost.

## Strengths and limits

**Strong against:** vulnerable targets that can be wounded, prolonged fights, and opportunities to turn a wound into a capped payoff.

**Weak against:** short encounters, targets that cannot bleed, and effects that prevent Blood-dependent statuses. Blood does not strip Armour as efficiently as Acid.

## Defence interactions

- **Squishy / Absorption:** Reduces a direct hit only when that damage component is tagged as qualifying physical impact/cutting damage. It does not automatically reduce Bleed or Extraction.
- **Membrane:** Absorbs eligible direct damage before health. It does not erase an existing wound; Bleed application depends on whether the applying hit gets through under that attack's rule.
- **Shell:** Reduces qualifying physical hit damage by its remaining layers. It does not automatically resist Bleed or Extraction; Acid and heavy Force have the defined layer-shedding routes.
- **Thorns:** A qualifying contact hit triggers one retaliation after the hit connects. Bleed ticks, pools, and remote effects do not each trigger Thorns.
- **Dodge:** Can avoid an eligible wound-applying hit. It does not remove an existing wound or protect against a separate persistent hazard the target later enters.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Blood — Blood Pressure:** A Force finisher hits a bleeding target; the wound bursts for one small area hit. No new Bleed stack or large pool.
- **Acid + Blood — Caustic Breach:** An Acid combo hits a bleeding target; it briefly strips more Armour than Acid alone. This is defence erosion, not extra damage-over-time.
- **Static + Blood — Blood Circuit:** A Static attack hits a blood pool; it arcs once to the nearest eligible enemy standing in or beside the pool. One selected target, not a surface-wide pulse.
- **Mucus + Blood — Caught in the Clot:** A named Mucus/Blood combo creates a clot patch; the first enemy crossing it is briefly caught. Blood must be visible in the patch; one catch only.
- **Blood + Soul — Blood Donor:** A Blood attack hits a Soul-marked target; the player restores a small fixed amount of health. Cap the heal and prevent repeat-hit farming; no new resource meter.
- **Blood + Fire — Cauterise:** A Fire attack hits a bleeding target; it consumes the Bleed for an immediate burst. The burst must compensate for ending the Bleed; do not add a fresh Burn by default.

## Design boundaries

Blood owns wounds, Bleed, and limited extraction. Acid weakens defences; Mucus controls movement; Force delivers immediate impact; Soul targets essence. Existing wounds persist unless an explicit effect consumes or changes them.

---

# Fire

**Ignite. Burn. Spread—when the setup allows it.**

Fire is the ignition and exposure type. It applies Burn, creates short-lived burning zones, and can propagate through explicitly compatible setups. It should not become the strongest generic damage-over-time type or make every surface explode.

## Visual language

**Orange; unmistakable flames, flickering tongues, embers, short-lived burning patches, and an orange UI ring for Burn duration.** Use a crisp ignition whoosh and crackle. Show the edge and lifetime of burning zones clearly; propagation should be a visible, bounded event rather than a surprise chain.

## Core mechanics

- **Burn:** Repeated hits or continued exposure may build a capped Burn state. Make the threshold and duration legible; ordinary Burn should not outclass Acid's defence erosion or Blood's wound payoff.
- **Ignition:** At a defined threshold, an explicitly designed attack can trigger an ignition payoff. Not every Fire hit causes a burst.
- **Burning zones:** Some attacks create short-lived, bounded zones. A zone can affect a target that enters it later; dodging the original projectile does not grant immunity to the zone.
- **Propagation:** Fire spreads only through explicitly compatible targets, patches, or named reactions. Limit each event to one clear payoff and prevent reaction-created fire from retriggering itself.

## Strengths and limits

**Strong against:** exposed targets, prepared flammable setups, and enemies that remain in a visible burning zone.

**Weak against:** dispersed or mobile targets, enemies that escape exposure, and targets with explicit Fire resistance. Squishy and Shell do not inherently resist heat or Burn.

## Defence interactions

- **Squishy / Absorption:** Does not inherently resist heat or Burning. It can reduce only a separately tagged qualifying physical component of a Fire attack.
- **Membrane:** Absorbs eligible direct damage before health. It does not automatically prevent Burn or protect against later exposure to a burning zone.
- **Shell:** Reduces only qualifying physical hit components. It does not inherently resist heat or Burn.
- **Thorns:** A qualifying melee/contact hit triggers one retaliation after it connects. A burning zone or non-contact heat effect does not automatically trigger Thorns.
- **Dodge:** Can avoid an eligible Fire hit. It does not undo existing Burn or make the target immune to a separate burning zone.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Fire — Flashover:** A Force weapon hits a burning target; a small tongue of flame jumps to one nearby target. No uncontrolled fire chain.
- **Acid + Fire — Premature Evaporation:** A Fire attack hits an Acid-coated target; the coating is consumed in a modest close-range burst. This is not an automatic explosion from every Acid puddle.
- **Static + Fire — Arc Flash:** A Static attack hits a burning target; one short arc jumps to the nearest other eligible enemy. Do not stack extra Burn, stun, and multi-jump chaining.
- **Mucus + Fire — Flammable Mucus:** A Fire attack ignites a visible Mucus patch; the patch burns briefly as a small temporary no-go zone, then is consumed. No lingering Mucus slow after ignition.
- **Blood + Fire — Cauterise:** A Fire attack hits a bleeding target; it consumes the Bleed for an immediate burst. Do not add a fresh Burn by default.
- **Soul + Fire — Spectral Combustion:** A Soul/Fire combo hits a burning, Soul-marked target; it consumes the mark in a short spectral burst. Trigger on a hit, not only on defeat.

## Design boundaries

Fire owns ignition, Burn, and bounded propagation. Acid erodes defences; Blood owns wounds; Mucus owns sticky control; Static owns chains and interruption; Force owns impact; Soul owns essence. Keep the visual cue immediate and the spread limit obvious.

---

# Force

**Hit hard. Build momentum. Break poise. Send enemies flying.**

Force is the burst-and-displacement type. It delivers immediate physical impact, builds poise pressure, and changes enemy positions. It wins through a decisive hit or collision, not through sustained damage.

## Visual language

**White and pale grey; hard-edged impact rings, compressed silhouettes, sharp directional motion lines, and brief screen-space jolts.** Use a heavy, blunt hit sound and a clear travel direction. The cue should feel solid and physical, not soft or spectral like Soul. Keep impact flashes brief so the player can read the next attack.

## Core mechanics

- **Impact:** High immediate physical damage, usually delivered by punches, headbutts, tackles, slams, or heavy strikes.
- **Poise pressure:** Repeated qualifying hits build pressure toward a brief stagger or interrupt. Use thresholds and diminishing returns on elites; avoid stun-lock.
- **Displacement:** Strong hits push or launch targets. A wall or hazard only adds a payoff when a real collision occurs.
- **Momentum:** Attacker mass and actual speed at contact may increase impact. Keep the benefit readable and avoid requiring the player to calculate it.
- **Shockwave:** Only attacks explicitly designed to convert excess impact into an area effect create one; it is not automatic on every poise break.

## Strengths and limits

**Strong against:** unarmoured targets, vulnerable poise, clustered enemies, and targets near walls or hazards.

**Weak against:** Shell layers, Membranes, anchored targets, evasive enemies, and targets with little physical substance. Force is not a reliable sustained-damage tool.

## Defence interactions

- **Squishy / Absorption:** Reduces qualifying blunt impact damage and may reduce impulse, knockback, and collision effects. It does not make the target immune to Force.
- **Membrane:** Force is inefficient against the shield: it drains the pool less efficiently and causes less knockback while the shield is active.
- **Shell:** Qualifying physical hits are reduced by remaining layers. A sufficiently heavy Force impact can knock one layer loose; the lost layer stays gone for the encounter.
- **Thorns:** A qualifying melee/contact hit triggers one retaliation after the hit connects. Thorns does not reduce the incoming hit. A clean Dodge means no contact and no retaliation.
- **Dodge:** Can avoid an eligible Force hit. If the target avoids the strike, attached impact/status effects do not apply; a target still inside an attack's actual AoE may be hit by its edge.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Acid — Corrosive Splash:** A Force strike hits an Acid-coated target; a small amount of Acid splashes onto nearby enemies. Spread the setup, not a second large damage burst.
- **Force + Static — Shocking Impact:** A named Force/Static weapon combo lands; a short local electrical burst occurs around the impact. It does not chain.
- **Force + Mucus — Snot Rocket:** A Force attack hits a Mucus-stuck enemy; it launches the enemy in the hit direction and leaves one small sticky patch on landing. No extra stun or bonus-damage layer.
- **Force + Blood — Blood Pressure:** A Force finisher hits a bleeding target; the wound bursts for one small area hit. Do not add another Bleed stack or a large pool.
- **Force + Soul — Soul Purpose:** A Force hit connects with a Soul-marked target; the hit breaks the mark and briefly exposes the target to the next Soul hit. No fragment or pickup system.
- **Force + Fire — Flashover:** A Force weapon hits a burning target; a small tongue of flame jumps to one nearby target. No uncontrolled chain.

## Design boundaries

Force owns physical impact, poise pressure, and displacement. It does not own electrical chaining, defence erosion, sticky control, wound economy, essence damage, or general burning. Resolve the actual attack component: physical damage, impulse, status application, and area coverage can each interact with defences differently.

---

# Mucus

**Coat. Stick. Slow. Set up.**

Mucus is the movement-control and setup type. It coats targets and surfaces, restricts movement, and creates sticky patches that shape where enemies can safely move. Its primary payoff is control, not generic damage-over-time.

## Visual language

**Green; gooey coating, elastic strands, stretched trails, and a green UI ring for coating/control duration.** Use a wet, tacky sound and visible stretching when something separates from a coated surface. Patches need a clear outline and expiry cue so they remain readable on a phone screen. Enemies conjoind by mucus share one organicly shaped green mucus membrane.

## Core mechanics

- **Coating:** Mucus sticks to eligible targets and surfaces. Coating can make a target slower or set up a named reaction; keep control strength and duration modest.
- **Sticky patches:** Some attacks leave bounded, short-lived patches that alter movement or enable a combo. Avoid stacking multiple overlapping control effects.
- **Snare:** Use a brief, clearly communicated movement restriction only where the attack is designed for it. Slow, snare, and root should not be interchangeable names for the same effect.
- **Conjoined targets:** If used, sticking enemies together is a distinct, limited effect requiring a visible setup; it should not be a routine extra consequence of every Mucus hit.

## Strengths and limits

**Strong against:** mobile enemies, groups that can be controlled through their routes, and setups that reward a follow-up hit.

**Weak against:** enemies that avoid patches, targets that are not meaningfully slowed by adhesion, and situations where a long setup is too slow. Mucus does not automatically cushion Force damage.

## Defence interactions

- **Squishy / Absorption:** Does not prevent sticking, coating, or movement restriction.
- **Membrane:** A shield may prevent coating only if it blocks the hit that applies it. It does not erase an existing coating or a patch already placed in the world.
- **Shell:** Shell reduces qualifying physical damage, not Mucus control or adhesion by default.
- **Thorns:** A qualifying melee/contact hit can trigger one retaliation after it connects. A remote patch or non-contact effect does not automatically trigger Thorns.
- **Dodge:** Can avoid the carrier attack and its attached coating if the hit misses. It does not remove existing coating or a sticky patch, and a patch may still affect the route taken while dodging.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Mucus — Snot Rocket:** A Force attack hits a Mucus-stuck enemy; it launches the enemy in the hit direction and leaves one small sticky patch on landing. No extra stun or bonus damage.
- **Acid + Mucus — Slick Move:** An Acid weapon hits a Mucus patch; the patch is replaced by a short-lived corrosive slick. Do not layer the two hazards.
- **Static + Mucus — Sticky Situation:** A Static attack charges a visible Mucus patch; the next enemy entering it is briefly shocked. One trigger per patch, with a clear charge cue.
- **Mucus + Blood — Caught in the Clot:** A named Mucus/Blood combo creates a clot patch; the first enemy crossing it is briefly caught. Blood must be visibly present, and the patch catches only once.
- **Mucus + Soul — Held in Suspension:** A Mucus attack hits a Soul-marked target; it briefly pins the target in place. The visible Soul mark is the trigger; no special enemy variant required.
- **Mucus + Fire — Flammable Mucus:** A Fire attack ignites a visible Mucus patch; the patch burns briefly as a small temporary no-go zone, then is consumed. No lingering Mucus slow after ignition.

## Design boundaries

Mucus owns adhesion, movement restriction, and visible setup patches. It does not inherently reduce physical damage, add generic damage-over-time, or guarantee a kill when combined with Fire. Keep patches short-lived and each patch-triggered reaction to one clear payoff.

---

# Soul

**Mark. Drain. Fracture. Reach beyond the physical.**

Soul is the essence-pressure type. It targets explicitly nonphysical resources or integrity and uses visible Soul marks to enable selected reactions. It is not blanket defence bypass, and Fear is a status tag—not a synonym for Soul damage.

## Visual language

**Mysterious, sparkly, translucent purple.** Use shimmering particles, translucent wisps, softly drifting motes, and a subdued airy sound rather than Force's hard impact flash. Soul's mysterious purple sparkle and translucent drifting motion distinguish it from Acid's solid, wet shocking-pink splashes and Force's sharp-edged directional impact.

## Core mechanics

- **Essence damage:** Only components explicitly tagged as targeting essence can bypass Shell or Membrane. Ordinary Soul-labelled direct damage does not automatically bypass every defence.
- **Soul Mark:** A visible, short-lived mark enables specific pair reactions. It is a setup cue, not a hidden resource or an excuse for long combo recipes.
- **Resource drain:** Selected attacks can drain a defined nonphysical resource when the target has one. Do not invent a resource for every enemy.
- **Fracture / control:** Any maximum-health reduction, Fear, Silence, or other strong effect must be explicitly assigned to an attack with clear duration and counterplay; do not attach all of them to every Soul hit.
- **Harvest:** Resource or health recovery is limited to explicit attacks and capped effects.

## Strengths and limits

**Strong against:** targets with explicitly vulnerable essence/resources, Soul-mark setups, and selected nonphysical defences.

**Weak against:** targets without the relevant resource or essence vulnerability, and fast combat where the mark is not followed up. Soul is not a universal answer to Shell or Membrane.

## Defence interactions

- **Squishy / Absorption:** Only reduces a separately tagged qualifying physical component; it does not inherently resist essence effects.
- **Membrane:** Eligible direct damage is absorbed normally. An explicitly essence-targeting component may bypass Membrane only when the attack is tagged for that exception; the Soul type alone is not enough.
- **Shell:** Qualifying physical components are reduced by Shell. Only an explicitly essence-targeting component may bypass it; no blanket phase-through rule.
- **Thorns:** A non-contact essence effect does not trigger Thorns. A qualifying contact hit can trigger one retaliation after it connects.
- **Dodge:** Applies only to attacks with an avoidable hitbox or telegraph. It does not remove an existing Soul Mark or automatically avoid a non-spatial effect.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Soul — Soul Purpose:** A Force hit connects with a Soul-marked target; the hit breaks the mark and briefly exposes the target to the next Soul hit. No fragment or pickup system.
- **Acid + Soul — Soul Erosion:** An Acid combo hits a Soul-marked target; it consumes the mark to weaken a Soul ward if that target has one. If Soul wards are not a shared mechanic, use a brief Soul-mark refresh instead; do not invent a new defence.
- **Static + Soul — Interference Pattern:** A Static combo hits during a clearly telegraphed Soul attack; it interrupts that attack. No general interrupt against every Soul enemy.
- **Mucus + Soul — Held in Suspension:** A Mucus attack hits a Soul-marked target; it briefly pins the target in place. The visible mark is the trigger.
- **Blood + Soul — Blood Donor:** A Blood attack hits a Soul-marked target; the player restores a small fixed amount of health. Cap the heal; no new resource meter or repeat-hit farming.
- **Soul + Fire — Spectral Combustion:** A Soul/Fire combo hits a burning, Soul-marked target; it consumes the mark in a short spectral burst. Trigger on a hit, not only on defeat.

## Design boundaries

Soul owns essence, explicitly tagged nonphysical resource effects, and Soul Mark. Force owns physical impact; Static owns electrical interruption; Blood owns bodily wounds and extraction. Keep bypass selective and visible, and give strong control/resource effects clear limits.

---

# Static

**Charge. Chain. Interrupt. Discharge.**

Static is the chain-pressure and action-disruption type. It delivers electrical damage and uses bounded Charge, arcs, and specific interrupt windows. It should feel quick and reactive, not like Force with a different colour.

## Visual language

**Yellow; sharp sparks, branching lightning, quick flickers, and a yellow UI ring showing Charge buildup/decay.** Use crisp crackle and a distinct discharge snap. Branching motion communicates electrical chaining; keep each arc brief and limit the number of visible simultaneous branches.

## Core mechanics

- **Charge:** A hit can build a bounded Charge state. Make buildup and decay visible; avoid hidden stacks that require counting.
- **Arc:** Some attacks jump to a limited number of eligible nearby targets, with diminishing damage or a fixed jump limit.
- **Interrupt:** Static can interrupt a clearly tagged action during a readable window. It does not automatically interrupt every enemy or every hit.
- **Conductive world:** Explicitly conductive pools or patches can carry a single pulse or one bounded arc.
- **Membrane interaction:** Static can rapidly recharge or supercharge a Membrane, but the benefit is bounded, clearly telegraphed, and cannot loop through repeated hits.

## Strengths and limits

**Strong against:** clustered eligible targets, telegraphed actions with interrupt windows, and explicit conductive setups.

**Weak against:** isolated targets, attacks without interrupt windows, and encounters where a chain has no eligible secondary target. Static is not the best source of physical knockback or armour erosion.

## Defence interactions

- **Squishy / Absorption:** No inherent resistance to electrical damage or Charge; only an explicit physical impulse component is affected.
- **Membrane:** Eligible direct damage is absorbed by the shield. Static may recharge/supercharge it as a separate, bounded, visibly signalled interaction; do not allow repeat-hit loops.
- **Shell:** Only a separately tagged qualifying physical component is reduced by Shell. Shell does not inherently block electrical Charge or interruption.
- **Thorns:** Only a qualifying melee/contact hit triggers one retaliation; a remote arc or world pulse does not automatically count as contact.
- **Dodge:** Can avoid eligible carrier hits. Existing charged patches or active arcs follow their own hitbox rules; Dodge does not remove an already-created world effect.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Force + Static — Shocking Impact:** A named Force/Static weapon combo lands; a short local electrical burst occurs around the impact. It does not chain.
- **Acid + Static — Conductive Pool:** A Static attack hits an Acid puddle; one electrical pulse travels across that puddle, bounded by its visible edge.
- **Static + Mucus — Sticky Situation:** A Static attack charges a visible Mucus patch; the next enemy entering it is briefly shocked. One trigger per patch, with an obvious charge cue.
- **Static + Blood — Blood Circuit:** A Static attack hits a blood pool; it arcs once to the nearest eligible enemy standing in or beside the pool. This selects one nearby target rather than pulsing across the surface.
- **Static + Soul — Interference Pattern:** A Static combo hits during a clearly telegraphed Soul attack; it interrupts that attack. No general interrupt against every Soul enemy.
- **Static + Fire — Arc Flash:** A Static attack hits a burning target; one short arc jumps to the nearest other eligible enemy. No extra Burn, stun, and multi-jump chain stacked together.

## Design boundaries

Static owns Charge, bounded arcs, and conditional interruption. Force owns physical impact and displacement; Acid owns defence erosion; Mucus owns sticky control; Blood owns wounds and extraction; Soul owns essence and marks; Fire owns ignition. Resolve shield recharge separately from damage, and never let the interaction loop infinitely.