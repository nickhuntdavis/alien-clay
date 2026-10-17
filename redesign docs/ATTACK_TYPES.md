# Attack Types

Contact | Projectile | Spread | Burst | Beam | Pool

A **damage type** is what kind of harm is dealt (Force, Acid, Static, Mucus, Blood, Soul, Fire). An **attack type** is how that harm reaches the target. Every attack, player or enemy, has exactly one attack type and one or more damage components. An attack may also leave a hazard behind (a patch, pool or trail) as one of its components: Snot Bubble is a Burst that leaves a Mucus patch, Matchstick is a Contact charge that leaves a Burn trail. The leftover hazard is not a second attack type. The same six attack types are used for player weapons and for enemy attacks.

The v10 test build already uses these six for its weapon matrix (6 attack types x 7 damage types = 42 weapons, `V10_ATK` in `storm-directive/web/js/v10.js` on branch `claude/zealous-clarke-i26iot`; not yet on `main`).

## The six attack types

| Attack type | What it is | Typical components | Thorns | Evasion | v10 weapon base |
|---|---|---|---|---|---|
| **Contact** | Touching or colliding: lashes, bites, headbutts, rams. | Direct hit, impulse (knockback), status application | Triggers (once per connected hit) | A miss avoids the hit and everything attached to it | Melee lash, range 110, strong knockback, nearest target |
| **Projectile** | One visible shot that travels to or across the arena. | Direct hit, status application | Does not trigger | Can miss | Single fast shot, range 440, nearest target |
| **Spread** | Several projectiles fired across a readable angle. | Several small direct hits, light impulse | Does not trigger | Rolls per pellet; some pellets still land | 7 pellets over a wide cone, short range |
| **Burst** | A delayed blast over an area, marked before it goes off. | Area direct hit, sometimes impulse or status | Does not trigger | Never applies; leaving the marked area avoids it, the edge can still hit | Blast of radius 70 after a 0.45 s delay, aimed at the densest cluster |
| **Beam** | A line or lane of danger that hits everything along it. | Rapid small direct hits, pierces | Does not trigger | Never applies; leaving the lane stops further hits | Continuous lane, range 300, pierces all |
| **Pool** | A persistent ground hazard with a visible edge and lifetime. | Hazard ticks, status application | Does not trigger | Never applies; only leaving it, or not entering, avoids it | Lobbed puddle, radius 58, lasts 3.5 s, aimed at the densest cluster |

## Rules

1. **Resolve each component separately.** A Burst can carry a direct hit and a status; Membrane may absorb the hit while the status follows its own rule (see `DEFENCE_TYPES.md`).
2. **Thorns only answers Contact.** Ranged attack types and pools never trigger it.
3. **Evasion only answers single-point hits.** Contact, Projectile and Spread can miss (Spread per pellet); Burst, Beam and Pool always land, using their actual footprint.
4. **Modifiers, not new types.** Homing, chaining, piercing, ricochet, orbiting, delayed detonation, rapid volleys and summoned attackers are modifiers on one of the six. Add a seventh attack type only when none of these can express the behaviour clearly.
5. **Telegraph by danger.** Any attack that can do significant damage shows what is happening, where it matters and when to respond. Burst always shows its area before it goes off; Beam shows its lane before it fires; Pool shows its edge for its whole life.
6. **Enemy attacks use the same vocabulary.** An enemy's card says its attack type, so the player learns one set of shapes for both sides.
7. **Leftover hazards.** An attack may leave a patch, pool or trail; it uses the world-object rules in `COMBAT_MATRIX.md` section 4, not a second attack type.
