# Damage Types

Force | Acid | Static | Mucus | Blood | Soul | Fire

These are the seven canonical damage types. A **damage type** describes what kind of harm is dealt; an **attack type** describes how it reaches the target. An attack can carry more than one damage component, but each component must resolve against the relevant defence rule.

### Force

**Hit hard. Build momentum. Break poise. Send enemies flying.**

Force is **physical impact damage**. It specialises in high burst, momentum, poise disruption, and displacement. It interrupts through impact and controls space by pushing enemies into hazards, separating groups, or creating room to escape.

- **Damage profile:** High burst, low damage over time.
- **Combat identity:** Physical impact, poise pressure, knockback, and environmental collisions.
- **Primary verbs:** Impact. Stagger. Displace.
- **Defence interaction:** Force is physical damage, so qualifying Force damage is reduced by Squishy and by Shell's remaining layers. Membrane is specifically resistant to Force; it reduces Force's effectiveness against the Membrane pool and reduces knockback against the protected creature. A heavy Force hit (a defined threshold) knocks off one Shell layer at once; the same threshold defines a heavy hit for Blood Pressure.

### Acid

**Melt Shell. Eat through defences. Corrode. Dissolve.**

Acid is the **defence-stripping** type. Acid hits build Corrosion, which strips Shell layers for good, and some attacks leave Acid Pools that deny ground.

- **Damage profile:** Low to medium direct damage; no damage over time on enemies. Acid Pools are the only ongoing Acid damage.
- **Combat identity:** Corrosion, permanent Shell layer loss, Acid Pools and area denial.
- **Primary verb:** Dissolve.
- **Defence interaction:** Corrosion strips finite Shell layers much faster than ordinary hits. It does not disable Membrane regeneration or bypass Membrane. Evasion never protects from an Acid Pool already on the ground.

### Static

**Zap. Arc. Jolt. Chain. Discharge. Fry. Overload.**

Static is the **chain-and-interrupt** type. It disrupts actions through electrical overload and punishes clustered enemies through readable chain effects.

- **Damage profile:** Medium burst, low damage over time, high multi-target potential.
- **Combat identity:** Chain damage, interruption, conductivity, and overload.
- **Primary verb:** Discharge.
- **Defence interaction:** Static recharges Membrane (+25% capacity, once per 5 s, with a visible cue), so Static is a poor choice against Membrane enemies. Static is not blocked by physical resistance, and a Membrane does not imply immunity to Charge or interruption.

### Mucus

**Cling. Coat. Stick. Smother. Snare. Encapsulate.**

Mucus is the **control and setup** type. It restricts movement, smothers Fire (becoming Snared clears a Burn bar), controls terrain, and creates opportunities for follow-up attacks rather than relying on high direct damage.

- **Damage profile:** Very low burst; no damage over time.
- **Combat identity:** Snared, Conjoined, sticky patches and setup.
- **Primary verb:** Snare.
- **Defence interaction:** Squishy and Shell do not inherently prevent sticking or movement control. An Evasion miss on the applying hit prevents its Snare, but does not remove an existing Snare or a patch already placed.

### Blood

**Lacerate. Bleed. Drain. Siphon. Rupture. Harvest.**

Blood attacks the target's **health economy**. It opens wounds, makes those wounds progressively more dangerous, and can convert injury into resources for the attacker. Its identity is the relationship between wounds, health, and extraction—not merely generic damage over time.

- **Damage profile:** Medium to high, with scaling through wounds and missing health.
- **Combat identity:** Wound pressure, execution, extraction, and resource sustain.
- **Primary verb:** Bleed.
- **Defence interaction:** Squishy is blunt only, so Blood's cuts go through it. Shell reduces the physical part of a cut but not Bleed or Extraction. A Membrane may absorb eligible direct damage, but does not erase an existing wound. An Evasion miss prevents a wound only on the hit that would apply it.

### Soul

**Haunt. Possess. Turn. Mark.**

Soul is the **mind-control** type. Soul hits build up on an enemy; at full build-up the enemy is **Possessed** and fights its own mates for a few seconds, then recovers. All five Soul reactions trigger on a Possessed enemy. The player cannot be Possessed.

- **Damage profile:** Low to medium direct damage; the payoff is the turned enemy, not the hit.
- **Combat identity:** Turning enemies against each other, and setting up Possessed-based reactions.
- **Primary verb:** Possess.
- **Defence interaction:** Soul has no defence bypass. Its direct damage meets Squishy, Membrane and Shell like any other eligible hit. Build-up toward Possessed is applied only when a Soul hit lands. Evasion can make a Soul Contact, Projectile or Spread hit miss.

### Fire

**Ignite. Burn. Flare. Consume.**

Fire is the **ignition** type. Fire hits and Burn zones fill a visible Burn bar (with a short damage over time); at full, Ignition flares once on that target and the bar resets. Fire does not spread on its own: it moves only through its reactions and Burn zones.

- **Damage profile:** Moderate initial damage, sustained Burn, conditional burst at Ignition.
- **Combat identity:** Escalating heat, Ignition, consuming setups (Corrosion, Mucus patches, Bleed) and short burning zones.
- **Primary verb:** Ignite.
- **Defence interaction:** Squishy and Shell do not inherently resist heat or Burning, though they may mitigate a qualifying physical component delivered by a Fire attack. Membrane absorbs eligible direct damage but does not automatically prevent Burn or protect against later contact with a burning zone. Evasion can make a Fire hit miss, but does not empty a Burn bar already filling. Becoming Snared puts Fire out.

## Shared combat rules

- **Resolve attack components separately.** Direct damage, status application, impulse/control, and persistent hazards can interact with defences differently.
- **A blocked hit is not blanket status immunity.** An attached status is prevented when its application hit is prevented, unless a specific resistance or immunity rule says otherwise.
- **Persistent hazards and existing statuses remain.** A missed projectile does not erase an Acid Pool or Burn zone; avoiding a hit does not cleanse a status already applied.
- **Keep each defence distinct:** Squishy reduces qualifying physical damage proportionally; Membrane absorbs eligible damage in a regenerating pool and resists Force; Shell subtracts a fixed amount from qualifying physical hits through finite, non-regenerating layers; Thorns retaliates once per qualifying connected Contact hit without mitigating it; Evasion is a miss chance against Contact, Projectile and Spread hits only.
- **Static–Membrane is a deliberate interaction.** Static recharges Membrane (+25% capacity, once per 5 s), with a clear cue.
- **Design reactions deliberately.** Every one of the 21 pairs has one designed reaction, set off by one of four trigger kinds (state + hit, world object + hit, dual-type weapon, Pairing; `COMBAT_MATRIX.md`). Two types touching the same enemy is never enough on its own. One main payoff, tuned for fast mobile combat.
- **Players can have any defence and any status except Possessed.**

[Force](#)

[Acid](#)

[Static](#)

[Mucus](#)

[Blood](#)

[Soul](#)

[Fire](#)

---

# Acid

**Melt Shell. Eat through defences. Spread. Corrode. Dissolve.**

Acid is the defence-erosion type. It strips Shell layers for good and creates visible, short-lived Acid Pools. Its signature payoff is removing protection; it deals no damage over time on enemies.

## Visual language

**Shocking pink; puddles, dripping trails, splashes, and a shocking-pink UI ring that counts down ongoing Acid exposure.** Use wet bubbling/sizzling and a clear, bounded puddle edge. The puddle and coating should remain recognisable at phone size and in greyscale through silhouette and motion, not colour alone.

## Core mechanics

- **Corrosion:** Acid hits fill a visible Corrosion bar. On a Shell creature, a full bar strips one layer for good and resets. No timer, no stacks, no damage over time. Any creature can carry Corrosion; it is the "Acid-coated" state that Corrosive Splash and Premature Evaporation use.
- **Acid Pools:** Some attacks leave a visible Acid Pool with a fixed edge and lifetime. Standing in one is the only ongoing Acid damage, and it builds Corrosion. Pools never last indefinitely.
- **Membrane:** Acid does not stop Membrane regeneration; Membrane recovery follows the shared no-Membrane-damage rule.

## Strengths and limits

**Strong against:** Shell enemies, and clustered enemies standing in a visible Pool.

**Weak against:** mobile enemies that leave the hazard, targets without Shell, and short engagements where attrition has no time to matter. Acid is not a damage-over-time type.

## Defence interactions

- **Squishy / Absorption:** No inherent resistance to Acid damage, Corrosion, or Acid pools.
- **Membrane:** A Membrane absorbs eligible direct damage before health. It prevents Corrosion only when it blocks the hit that applies it; it does not remove existing Corrosion or a Pool.
- **Shell:** Acid is the defining Shell counter: Corrosion strips layers far faster than ordinary hits. Make layer loss obvious; layers do not regenerate during the encounter.
- **Thorns:** Pools and non-contact effects do not trigger Thorns. A qualifying melee/contact delivery may trigger one retaliation after it connects.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. It does not clear existing Corrosion or protect a target in an Acid Pool.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Corrosive Splash (Force + Acid):** A Force hit lands on a Corroded target: a small splash adds Corrosion to nearby enemies. Spreads the setup, not a second large burst; the splash cannot trigger another splash.
- **Conductive Pool (Acid + Static):** A Static hit lands in an Acid Pool: one electrical pulse travels across that pool. Stays inside the visible pool edge; one pulse per pool.
- **Slick Move (Acid + Mucus):** An Acid hit lands on a Mucus patch: the patch is replaced by a short-lived corrosive slick. Replaces the patch rather than layering two hazards; clear expiry.
- **Caustic Breach (Acid + Blood):** An Acid hit lands on a bleeding target: strips one Shell layer at once. Defence erosion only: no damage over time, no new wound; does nothing to a target without Shell; once per Bleed.
- **Soul Erosion (Acid + Soul):** An Acid hit lands on a Possessed enemy: when Possessed ends, it bursts in a small Acid splash that adds Corrosion to nearby mates. One splash per Possession; compare with Corrosive Splash in playtest.
- **Premature Evaporation (Acid + Fire):** A Fire hit lands on a Corroded target: consumes the Corrosion in a modest close-range burst. Never from an Acid Pool by itself; one burst; the Corrosion build-up resets.

## Design boundaries

Acid owns corrosion, Shell reduction, and bounded hazardous pools. Blood owns wounds and extraction; Mucus owns adhesion and movement control; Fire owns ignition and burning. Separate direct damage from Corrosion and later Pool exposure when resolving defences.

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
- **Blood pools:** A creature that dies while bleeding leaves a small pool; the Blood Pool weapon and the Mosquito make them too. Pools are visible, bounded and short-lived, and feed Blood Circuit and Caught in the Clot.
- **Trade-offs:** Blood should not simultaneously maximise sustained damage, execution burst, healing, and resource generation without a clear cost.

## Strengths and limits

**Strong against:** vulnerable targets that can be wounded, prolonged fights, and opportunities to turn a wound into a capped payoff.

**Weak against:** short encounters, targets that cannot bleed, and effects that prevent Blood-dependent statuses. Blood does not strip Shell as efficiently as Acid.

## Defence interactions

- **Squishy / Absorption:** Blunt only, so Blood's cuts go through. It does not reduce Bleed or Extraction.
- **Membrane:** Absorbs eligible direct damage before health. It does not erase an existing wound; Bleed application depends on whether the applying hit gets through under that attack's rule.
- **Shell:** Reduces qualifying physical hit damage by its remaining layers. It does not automatically resist Bleed or Extraction; Acid and heavy Force have the defined layer-shedding routes.
- **Thorns:** A qualifying contact hit triggers one retaliation after the hit connects. Bleed ticks, pools, and remote effects do not each trigger Thorns.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. It does not remove an existing wound or protect against a hazard entered later.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Blood Pressure (Force + Blood):** A heavy Force hit (the same threshold that knocks off a Shell layer) lands on a bleeding target: the wound bursts for one small area hit. One burst; no new Bleed stack and no large pool.
- **Caustic Breach (Acid + Blood):** An Acid hit lands on a bleeding target: strips one Shell layer at once. Defence erosion only: no damage over time, no new wound; does nothing to a target without Shell; once per Bleed.
- **Blood Circuit (Static + Blood):** A Static hit lands in a blood pool: one arc hits the nearest enemy standing in or beside the pool. One target; no pulse across the pool and no onward chain (unlike Conductive Pool).
- **Caught in the Clot (Mucus + Blood):** A Mucus hit lands on a blood pool: the pool becomes a clot patch that briefly catches the first enemy to cross it. Blood visible in the patch; one catch, then the patch is gone.
- **Blood Donor (Blood + Soul):** A Blood hit lands on a Possessed enemy: you heal a small fixed amount. Once per Possession; no new resource meter.
- **Cauterise (Blood + Fire):** A Fire hit lands on a bleeding target: consumes the Bleed for one immediate burst. The burst must make up for ending the Bleed; no fresh Burn by default.

## Design boundaries

Blood owns wounds, Bleed, and limited extraction. Acid weakens defences; Mucus controls movement; Force delivers immediate impact; Soul turns enemies on each other. Existing wounds persist unless an explicit effect consumes or changes them.

---

# Fire

**Ignite. Burn. Flare. Consume.**

Fire is the ignition and exposure type. It fills a Burn bar, flares once at full, creates short-lived Burn zones, and consumes compatible setups through its reactions. It should not become the strongest damage-over-time type or make every surface explode.

## Visual language

**Orange; unmistakable flames, flickering tongues, embers, short-lived burning patches, and an orange UI ring for Burn duration.** Use a crisp ignition whoosh and crackle. Show the edge and lifetime of burning zones clearly; propagation should be a visible, bounded event rather than a surprise chain.

## Core mechanics

- **Burn bar:** Fire hits and time in a Burn zone fill a visible bar; while it holds Burn, the target takes a short damage over time. Ordinary Burn should not outclass Acid's defence erosion or Blood's wound payoff. Becoming Snared empties the bar (Mucus smothers it).
- **Ignition:** When the bar is full, one flare hits that target and the bar resets. It does not spread to anything else.
- **Burning zones:** Some attacks create short-lived, bounded zones. A zone can affect a target that enters it later; making the original projectile miss does not grant immunity to the zone.
- **No automatic spread:** Fire moves only through its six reactions and Burn zones. Only Premature Evaporation, Flammable Mucus and Cauterise make bursts or zones; Flashover, Arc Flash and Spectral Combustion hit one target. Reaction-created fire cannot retrigger itself.

## Strengths and limits

**Strong against:** exposed targets, prepared flammable setups, and enemies that remain in a visible burning zone.

**Weak against:** dispersed or mobile targets, enemies that escape exposure, and Mucus users (Snared puts Fire out). Squishy and Shell do not resist heat or Burn.

## Defence interactions

- **Squishy / Absorption:** Does not inherently resist heat or Burning. It can reduce only a separately tagged qualifying physical component of a Fire attack.
- **Membrane:** Absorbs eligible direct damage before health. It does not automatically prevent Burn or protect against later exposure to a burning zone.
- **Shell:** Reduces only qualifying physical hit components. It does not inherently resist heat or Burn.
- **Thorns:** A qualifying melee/contact hit triggers one retaliation after it connects. A burning zone or non-contact heat effect does not automatically trigger Thorns.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. It does not empty an existing Burn bar or protect from a Burn zone.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Flashover (Force + Fire):** A Force hit lands on a burning target: a tongue of flame jumps to one nearby enemy and adds to its Burn bar. One jump; no chain.
- **Premature Evaporation (Acid + Fire):** A Fire hit lands on a Corroded target: consumes the Corrosion in a modest close-range burst. Never from an Acid Pool by itself; one burst; the Corrosion build-up resets.
- **Arc Flash (Static + Fire):** A Static hit lands on a burning target: one short arc jumps to the nearest other enemy. One jump; no extra Burn, stun or chain.
- **Flammable Mucus (Mucus + Fire):** A Fire hit lands on a Mucus patch: the patch burns briefly as a small no-go zone, then is consumed. Short and clearly bounded; no Mucus slow left behind; the fire cannot relight itself.
- **Cauterise (Blood + Fire):** A Fire hit lands on a bleeding target: consumes the Bleed for one immediate burst. The burst must make up for ending the Bleed; no fresh Burn by default.
- **Spectral Combustion (Soul + Fire):** The Soul/Fire Pairing (two weapons you own, both Lv 5+) hits a burning, Possessed enemy: it ignites at once (full Burn bar) and Possessed ends. Rare by design; the first time it fires, the Scientist gets his Tier 3 line (VOICE_GUIDE.md).

## Design boundaries

Fire owns ignition, Burn and Burn zones. Acid erodes defences; Blood owns wounds; Mucus owns sticky control; Static owns chains and interruption; Force owns impact; Soul owns Possessed. Keep the visual cue immediate and the Burn bar obvious.

---

# Force

**Hit hard. Build momentum. Break poise. Send enemies flying.**

Force is the burst-and-displacement type. It delivers immediate physical impact, builds poise pressure, and changes enemy positions. It wins through a decisive hit or collision, not through sustained damage.

## Visual language

**White and pale grey; hard-edged impact rings, compressed silhouettes, sharp directional motion lines, and brief screen-space jolts.** Use a heavy, blunt hit sound and a clear travel direction. The cue should feel solid and physical, not soft or spectral like Soul. Keep impact flashes brief so the player can read the next attack.

## Core mechanics

- **Impact:** High immediate physical damage, usually delivered by punches, headbutts, tackles, slams, or heavy strikes.
- **Poise pressure:** Repeated qualifying hits fill the shared Poise meter toward a brief stagger or interrupt. Not every hit qualifies; Poise recovers after a spell without qualifying hits; elites and bosses have higher thresholds and shorter control; avoid stun-lock. Static adds to the same meter only when an attack is explicitly tagged for it.
- **Displacement:** Strong hits push or launch targets. A wall or hazard only adds a payoff when a real collision occurs.
- **Momentum:** Attacker mass and actual speed at contact may increase impact. Keep the benefit readable and avoid requiring the player to calculate it.
- **Shockwave:** Only attacks explicitly designed to convert excess impact into an area effect create one; it is not automatic on every poise break.

## Strengths and limits

**Strong against:** targets without Shell, vulnerable poise, clustered enemies, and targets near walls or hazards.

**Weak against:** Shell layers, Membranes, anchored targets, evasive enemies, and targets with little physical substance. Force is not a reliable sustained-damage tool.

## Defence interactions

- **Squishy / Absorption:** Proportionally reduces blunt impact damage (Squishy is blunt only) and may reduce impulse, knockback and collision. It does not make the target immune to Force.
- **Membrane:** Force is inefficient against the Membrane: it drains the pool less efficiently and causes less knockback while the Membrane is active.
- **Shell:** Qualifying physical hits are reduced by remaining layers and wear the current layer slowly. A heavy Force hit knocks one layer off at once; it stays gone for the encounter.
- **Thorns:** A qualifying melee/contact hit triggers one retaliation after the hit connects. Thorns does not reduce the incoming hit. An Evasion miss means no contact and no retaliation.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. Force Bursts and Beams always land.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Corrosive Splash (Force + Acid):** A Force hit lands on a Corroded target: a small splash adds Corrosion to nearby enemies. Spreads the setup, not a second large burst; the splash cannot trigger another splash.
- **Shocking Impact (Force + Static):** A dual-type Force/Static weapon lands a hit: a short local electrical burst around the impact. Only from a dual-type weapon, never from two separate hits; local burst, no chain.
- **Snot Rocket (Force + Mucus):** A Force hit lands on a Snared enemy: launches it in the hit direction; it leaves one small sticky patch where it lands. One launch and one patch; no extra stun or bonus damage.
- **Blood Pressure (Force + Blood):** A heavy Force hit (the same threshold that knocks off a Shell layer) lands on a bleeding target: the wound bursts for one small area hit. One burst; no new Bleed stack and no large pool.
- **Soul Purpose (Force + Soul):** A Force hit lands on a Possessed enemy: it is launched and damages the first mate it collides with. One collision; Possessed carries on as normal.
- **Flashover (Force + Fire):** A Force hit lands on a burning target: a tongue of flame jumps to one nearby enemy and adds to its Burn bar. One jump; no chain.

## Design boundaries

Force owns physical impact, poise pressure, and displacement. It does not own electrical chaining, defence erosion, sticky control, wound economy, mind control or burning. Resolve the actual attack component: physical damage, impulse, status application, and area coverage can each interact with defences differently.

---

# Mucus

**Coat. Stick. Slow. Set up.**

Mucus is the movement-control and setup type. It Snares targets, sticks clustered ones together (Conjoined), puts out Fire, and creates sticky patches that shape where enemies can safely move. Its primary payoff is control, not damage over time.

## Visual language

**Green; gooey coating, elastic strands, stretched trails, and a green UI ring for Snared duration.** Use a wet, tacky sound and visible stretching when something separates from a coated surface. Patches need a clear outline and expiry cue so they remain readable on a phone screen. Conjoined enemies share one organically shaped green mucus membrane.

## Core mechanics

- **Snared:** Mucus hits Snare a target ("Mucus-stuck" and "Adhered" mean the same state). Snared slows it and sets up Snot Rocket and Held in Suspension; keep strength and duration modest. Becoming Snared clears a Burn bar.
- **Sticky patches:** Some attacks leave bounded, short-lived patches that alter movement or enable a combo. Avoid stacking multiple overlapping control effects.
- **Conjoined:** When two Snared creatures touch, or one Mucus attack's area covers several at once, they stick together in one shared membrane: none can move, and they may hit each other. Capped group size, short duration.

## Strengths and limits

**Strong against:** mobile enemies, groups that can be controlled through their routes, and setups that reward a follow-up hit.

**Weak against:** enemies that avoid patches, targets that are not meaningfully slowed by adhesion, and situations where a long setup is too slow. Mucus does not automatically cushion Force damage.

## Defence interactions

- **Squishy / Absorption:** Does not prevent Snared or Conjoined.
- **Membrane:** A Membrane may prevent a Snare only if it blocks the hit that applies it. It does not erase an existing Snare or a patch already placed.
- **Shell:** Shell reduces qualifying physical damage, not Mucus control or adhesion by default.
- **Thorns:** A qualifying melee/contact hit can trigger one retaliation after it connects. A remote patch or non-contact effect does not automatically trigger Thorns.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. It does not remove an existing Snare or patch; a patch still Snares whatever moves into it.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Snot Rocket (Force + Mucus):** A Force hit lands on a Snared enemy: launches it in the hit direction; it leaves one small sticky patch where it lands. One launch and one patch; no extra stun or bonus damage.
- **Slick Move (Acid + Mucus):** An Acid hit lands on a Mucus patch: the patch is replaced by a short-lived corrosive slick. Replaces the patch rather than layering two hazards; clear expiry.
- **Sticky Situation (Static + Mucus):** A Static hit charges a Mucus patch: the next enemy entering it is briefly shocked. One trigger per patch; obvious charge cue; no stun loop.
- **Caught in the Clot (Mucus + Blood):** A Mucus hit lands on a blood pool: the pool becomes a clot patch that briefly catches the first enemy to cross it. Blood visible in the patch; one catch, then the patch is gone.
- **Held in Suspension (Mucus + Soul):** A Mucus hit lands on a Possessed enemy: it is pinned in place for a moment. Short pin; no extra damage or status.
- **Flammable Mucus (Mucus + Fire):** A Fire hit lands on a Mucus patch: the patch burns briefly as a small no-go zone, then is consumed. Short and clearly bounded; no Mucus slow left behind; the fire cannot relight itself.

## Design boundaries

Mucus owns Snared, Conjoined, movement restriction and visible setup patches. It does not reduce physical damage, add damage over time, or guarantee a kill when combined with Fire. Keep patches short-lived and each patch-triggered reaction to one clear payoff.

---

# Soul

**Haunt. Possess. Turn. Mark.**

Soul is the mind-control type. Full Soul build-up makes an enemy fight its mates for a few seconds (Possessed), and all five of its reactions trigger on a Possessed enemy. It has no defence bypass, and Fear is a separate status, not a synonym for Soul damage.

## Visual language

**Mysterious, sparkly, translucent purple.** Use shimmering particles, translucent wisps, softly drifting motes, and a subdued airy sound rather than Force's hard impact flash. Soul's mysterious purple sparkle and translucent drifting motion distinguish it from Acid's solid, wet shocking-pink splashes and Force's sharp-edged directional impact.

## Core mechanics

- **Possessed:** Soul hits build up on an enemy. At full build-up it turns: for a few seconds it attacks and blocks its own side, then recovers. It has a clear duration, a cooldown before it can be Possessed again, and an obvious visual tell. Elites take a shorter turn; bosses take a reduced version (they hesitate or lash out at adds) and are never fully controlled. The player is exempt.
- **Reactions:** every Soul reaction triggers on a Possessed enemy (the Soul Mark is retired).
- **Control limits:** Possessed is the only control Soul owns. Fear is a separate status, applied only by attacks explicitly tagged with it.

## Strengths and limits

**Strong against:** dense groups (a turned enemy has mates to fight), tough enemies in the middle of a pack, and Possessed setups.

**Weak against:** lone targets (nobody to fight), bosses, and fast combat where Possessed is not followed up. Soul is not an answer to Shell or Membrane.

## Defence interactions

- **Squishy / Absorption:** Only reduces a qualifying physical component; it does not resist Soul build-up or Possessed.
- **Membrane:** Eligible direct Soul damage is absorbed normally; no bypass. Build-up applies only if the hit that carries it is not blocked.
- **Shell:** Qualifying physical components are reduced by Shell; no bypass. Shell does not resist build-up or Possessed.
- **Thorns:** A ranged Soul attack does not trigger Thorns. A qualifying contact hit can trigger one retaliation after it connects.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. It does not end Possessed.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Soul Purpose (Force + Soul):** A Force hit lands on a Possessed enemy: it is launched and damages the first mate it collides with. One collision; Possessed carries on as normal.
- **Soul Erosion (Acid + Soul):** An Acid hit lands on a Possessed enemy: when Possessed ends, it bursts in a small Acid splash that adds Corrosion to nearby mates. One splash per Possession; compare with Corrosive Splash in playtest.
- **Interference Pattern (Static + Soul):** A Static hit lands on a Possessed enemy: possessed lasts a fixed time longer. Once per Possession.
- **Held in Suspension (Mucus + Soul):** A Mucus hit lands on a Possessed enemy: it is pinned in place for a moment. Short pin; no extra damage or status.
- **Blood Donor (Blood + Soul):** A Blood hit lands on a Possessed enemy: you heal a small fixed amount. Once per Possession; no new resource meter.
- **Spectral Combustion (Soul + Fire):** The Soul/Fire Pairing (two weapons you own, both Lv 5+) hits a burning, Possessed enemy: it ignites at once (full Burn bar) and Possessed ends. Rare by design; the first time it fires, the Scientist gets his Tier 3 line (VOICE_GUIDE.md).

## Design boundaries

Soul owns Possessed. Force owns physical impact; Static owns electrical interruption; Blood owns bodily wounds and extraction. Possessed is bounded by duration, cooldown and boss limits, and must always be visible.

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
- **Membrane interaction:** Static recharges a Membrane (+25% capacity, once per 5 s, clearly telegraphed).

## Strengths and limits

**Strong against:** clustered eligible targets, telegraphed actions with interrupt windows, and explicit conductive setups.

**Weak against:** isolated targets, attacks without interrupt windows, and encounters where a chain has no eligible secondary target. Static is not the best source of physical knockback or Shell erosion.

## Defence interactions

- **Squishy / Absorption:** No inherent resistance to electrical damage or Charge; only an explicit physical impulse component is affected.
- **Membrane:** Eligible direct damage is absorbed by the Membrane. Static recharges it (+25% capacity, once per 5 s) as a separate, visibly signalled interaction.
- **Shell:** Only a separately tagged qualifying physical component is reduced by Shell. Shell does not inherently block electrical Charge or interruption.
- **Thorns:** Only a qualifying melee/contact hit triggers one retaliation; a remote arc or world pulse does not automatically count as contact.
- **Evasion:** A miss (Evasion only applies to Contact, Projectile and Spread hits) avoids the hit and everything attached to it. Existing charged patches and active arcs follow their own rules.

## Pair reactions

All reactions are proposed for playtesting. Each needs a clear cue and must not retrigger itself.

- **Shocking Impact (Force + Static):** A dual-type Force/Static weapon lands a hit: a short local electrical burst around the impact. Only from a dual-type weapon, never from two separate hits; local burst, no chain.
- **Conductive Pool (Acid + Static):** A Static hit lands in an Acid Pool: one electrical pulse travels across that pool. Stays inside the visible pool edge; one pulse per pool.
- **Sticky Situation (Static + Mucus):** A Static hit charges a Mucus patch: the next enemy entering it is briefly shocked. One trigger per patch; obvious charge cue; no stun loop.
- **Blood Circuit (Static + Blood):** A Static hit lands in a blood pool: one arc hits the nearest enemy standing in or beside the pool. One target; no pulse across the pool and no onward chain (unlike Conductive Pool).
- **Interference Pattern (Static + Soul):** A Static hit lands on a Possessed enemy: possessed lasts a fixed time longer. Once per Possession.
- **Arc Flash (Static + Fire):** A Static hit lands on a burning target: one short arc jumps to the nearest other enemy. One jump; no extra Burn, stun or chain.

## Design boundaries

Static owns Charge, bounded arcs, and conditional interruption. Static adds to the shared Poise meter only when an attack explicitly carries Poise or interruption pressure. Force owns physical impact and displacement; Acid owns defence erosion; Mucus owns sticky control; Blood owns wounds and extraction; Soul owns Possessed; Fire owns ignition. Resolve Membrane recharge separately from damage, and never let the interaction loop infinitely.