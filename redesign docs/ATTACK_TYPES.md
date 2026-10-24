# Attack Types

Contact | Projectile | Spread | Burst | Beam | Pool

A **damage type** is what kind of harm is dealt (`DAMAGE_TYPES.md`). An **attack type** is how that harm reaches the target. Player weapons, Feats and enemy attacks all use the same six, so the player learns one set of shapes for both sides.

**Every rule lives in `COMBAT_MATRIX.md` section 13:** components, how each type meets Thorns and Evasion, telegraphs, leftover hazards and modifiers. This doc never restates them. Modifiers (homing, orbiting, returning and the rest) are in `MODIFIERS.md`.

The v10 test build already uses these six for its weapon matrix (6 attack types × 7 damage types = 42 weapons, `V10_ATK` in `storm-directive/web/js/v10.js` on branch `claude/zealous-clarke-i26iot`; not yet on `main`).

| Attack type | What it is | Good for | v10 weapon base |
|---|---|---|---|
| **Contact** | Touching or colliding: lashes, bites, headbutts, rams. | Knockback, close crowds; risky into Thorns | Melee lash, range 110, strong knockback, nearest target |
| **Projectile** | One visible shot that travels to or across the arena. | Picking off one target at range | Single fast shot, range 440, nearest target |
| **Spread** | Several projectiles fired across a readable angle. | Close groups; many pellets average out Evasion's luck (but Shell takes its cut off each one) | 7 pellets over a wide cone, short range |
| **Burst** | A delayed blast over an area, marked before it goes off. | Clusters and evasive enemies | Blast of radius 70 after a 0.45 s delay, aimed at the densest cluster |
| **Beam** | A line or lane of danger that hits everything along it. | Lines of enemies and evasive ones | Continuous lane, range 300; stops at the first enemy unless it has Piercing (COMBAT_MATRIX decision 50) |
| **Pool** | A ground hazard with a visible edge and lifetime. | Denying ground; evasive enemies | A water balloon thrown at one enemy in the densest cluster: it bursts on the face and leaves a puddle, radius 58, lasting 3.5 s (decision 63) |
