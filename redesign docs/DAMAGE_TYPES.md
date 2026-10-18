# Damage Types

Force | Acid | Static | Mucus | Blood | Soul | Fire

The seven canonical damage types: what each one is for, how it looks and sounds, and what it is good and bad at. A **damage type** is what kind of harm is dealt; an **attack type** is how it reaches the target (`ATTACK_TYPES.md`).

**Every rule lives in `COMBAT_MATRIX.md`:** type rules (section 2), defence interactions (sections 3 and 7), statuses (section 4), the 21 reactions (section 1) and the numbers (section 11). This doc never restates them.

| Type | One line | Primary verb | Damage profile | Matrix status |
| --- | --- | --- | --- | --- |
| **Force** | Hit hard, break Poise, send enemies flying | Impact | High burst, no damage over time | Poise Pressure, Knockback |
| **Acid** | Strip Shell for good and deny ground | Dissolve | Low to medium direct damage; Pools are its only ongoing damage | Corrosion |
| **Static** | Chain through crowds and disrupt | Discharge | Medium burst, high multi-target potential | Charge |
| **Mucus** | Control movement and set up | Snare | Very low burst, no damage over time | Snared, Conjoined |
| **Blood** | Wounds and the health economy | Bleed | Medium to high, scaling through wounds | Bleed, Extraction |
| **Soul** | Turn enemies against each other | Possess | Low to medium; the payoff is the turned enemy | Possessed |
| **Fire** | Ignite and consume setups | Ignite | Moderate hits, a short burn, a flare at Ignition | Burning |

---

# Force

**Hit hard. Build momentum. Break poise. Send enemies flying.**

Force is physical impact. It wins through a decisive hit or collision, not through sustained damage: it staggers, pushes enemies into walls and hazards, separates groups and makes room to escape.

## Visual language

**White and pale grey; hard-edged impact rings, compressed silhouettes, sharp directional motion lines, and brief screen-space jolts.** Use a heavy, blunt hit sound and a clear travel direction. The cue should feel solid and physical, not soft or spectral like Soul. Keep impact flashes brief so the player can read the next attack.

## Strengths and limits

**Strong against:** targets without Shell, vulnerable Poise, clustered enemies, and targets near walls or hazards.

**Weak against:** Shell layers (until a heavy hit lands), Membranes, Squishy bodies, anchored targets and evasive enemies. Not a sustained-damage tool.

## Boundaries

Force owns impact, Poise and displacement. It does not own electrical chaining, defence erosion, sticky control, wounds, mind control or burning.

---

# Acid

**Melt Shell. Eat through defences. Corrode. Dissolve.**

Acid is the defence-stripping type. Its payoff is removing protection for good, plus Acid Pools that make ground unsafe. It is not a damage-over-time type.

## Visual language

**Shocking pink; puddles, dripping trails, splashes, and a shocking-pink UI ring for Corrosion.** Use wet bubbling and sizzling, and a clear, bounded puddle edge. Puddles and Corroded enemies stay recognisable at phone size through silhouette and motion as well as colour. Shocking pink stands even beside the pink campaign levels (`COMBAT_MATRIX.md` decision 28).

## Strengths and limits

**Strong against:** Shell enemies, and clustered enemies standing in a visible Pool.

**Weak against:** mobile enemies that leave the Pool, targets without Shell, and short fights where stripping layers has no time to pay off.

## Boundaries

Acid owns Corrosion, Shell loss and Acid Pools. Blood owns wounds; Mucus owns movement control; Fire owns ignition.

---

# Static

**Charge. Chain. Interrupt. Discharge.**

Static is chain pressure. It punishes clusters through readable arcs and interrupts telegraphed attacks when an attack is built for it. It should feel quick and reactive, not like Force in a different colour.

## Visual language

**Yellow; sharp sparks, branching lightning, quick flickers, and a yellow UI ring while an enemy is Charged.** Use a crisp crackle and a distinct discharge snap. Branching motion shows chaining; keep each arc brief and limit how many branches show at once.

## Strengths and limits

**Strong against:** clustered enemies, telegraphed attacks with an interrupt window, and conductive setups (Acid Pools, Mucus patches, blood pools).

**Weak against:** isolated targets, encounters with no second target for an arc, and Membrane enemies (Static recharges them). Not a source of knockback or Shell erosion.

## Boundaries

Static owns Charge, bounded arcs and conditional interruption. Force owns impact; Acid owns erosion; Mucus owns sticky control; Blood owns wounds; Soul owns Possessed; Fire owns ignition.

---

# Mucus

**Coat. Stick. Slow. Set up.**

Mucus is movement control and setup. It Snares targets, sticks clustered ones together, puts out Fire and leaves patches that shape where enemies can safely move. Its payoff is control, not damage.

## Visual language

**Green; gooey coating, elastic strands, stretched trails, and a green UI ring for Snared duration.** Use a wet, tacky sound and visible stretching when something separates from a coated surface. Patches need a clear outline and expiry cue. Conjoined enemies share one organically shaped green mucus membrane.

## Strengths and limits

**Strong against:** mobile enemies, groups whose routes can be controlled, and setups that reward a follow-up hit.

**Weak against:** enemies that avoid patches, targets that barely slow down, fights where a setup is too slow, and pairing with your own Fire on the same target (Snared puts Fire out; hit the patch with Fire instead). It does not cushion Force.

## Boundaries

Mucus owns Snared, Conjoined and sticky patches. It does not reduce damage, add damage over time or guarantee a kill when combined with Fire.

---

# Blood

**Wound. Bleed. Extract. Turn injury into an advantage.**

Blood attacks the target's health economy: it opens wounds, makes them pay off, and turns kills of bleeding enemies into a little health. Its identity is wounds and extraction, not generic damage over time or unlimited healing.

## Visual language

**Red; visible pools, red trails, wound splashes, and a red UI ring for Bleed duration.** Use a wet impact sound and make the source of each pool legible. Wounds look like injury, not Acid corrosion.

## Strengths and limits

**Strong against:** enemies that can be wounded, long fights, and Squishy bodies (cuts go through).

**Weak against:** short fights and Shell (it strips layers far slower than Acid).

## Boundaries

Blood owns Bleed, blood pools and Extraction. Acid weakens defences; Mucus controls movement; Force delivers impact; Soul turns enemies.

---

# Soul

**Haunt. Possess. Turn.**

Soul is mind control. Enough Soul on an enemy makes it fight its own mates for a few seconds (Possessed), and every Soul reaction plays off a Possessed enemy. It is not a defence bypass, and Fear is a separate status, not a synonym for Soul.

## Visual language

**Mysterious, sparkly, translucent purple.** Use shimmering particles, translucent wisps, softly drifting motes and a subdued airy sound rather than Force's hard impact flash. The purple sparkle and drifting motion keep it apart from Acid's solid, wet pink splashes and Force's sharp directional impact. Possessed enemies carry the purple sparkle for as long as they are turned.

## Strengths and limits

**Strong against:** dense groups (a turned enemy has mates to fight) and tough enemies in the middle of a pack.

**Weak against:** lone targets (nobody to fight), bosses (a reduced Possessed only), and fast fights where Possessed is not followed up. Not an answer to Shell or Membrane.

## Boundaries

Soul owns Possessed. Force owns impact; Static owns interruption; Blood owns wounds and extraction.

---

# Fire

**Ignite. Burn. Flare. Consume.**

Fire is ignition. Hits fill a visible Burn bar with a short burn, it flares once at full, and it consumes compatible setups (Corrosion, Mucus patches, Bleed) through its reactions. It never spreads on its own and never makes every surface explode.

## Visual language

**Orange; unmistakable flames, flickering tongues, embers, and an orange UI ring for the Burn bar.** Use a crisp ignition whoosh and crackle. Show the edge and lifetime of Fire Pool attacks clearly, and make Ignition one obvious flare.

## Strengths and limits

**Strong against:** exposed targets, prepared setups, and enemies standing in a Fire Pool attack.

**Weak against:** dispersed or mobile targets, and anything near Mucus (Snared puts Fire out).

## Boundaries

Fire owns Burning and Ignition. Acid erodes defences; Blood owns wounds; Mucus owns sticky control; Static owns chains; Force owns impact; Soul owns Possessed.
