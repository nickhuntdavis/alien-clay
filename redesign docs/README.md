# Redesign docs (combat rework)

Imported 17 Oct 2026 from the Notion exports. Working proposals, not shipped behaviour.

- `COMBAT_MATRIX.md`: master matrix (21 reactions, defences, statuses, world objects, roles). Section 9 holds the remaining-updates hand-off; section 10 lists the 26 reconciliation decisions of 17 Oct, which every doc follows.
- `DAMAGE_TYPES.md`: the seven types, one page each.
- `DEFENCE_TYPES.md`: the five defences (Squishy, Membrane, Shell, Thorns, Evasion; Evasion was called Dodge), one page each. No other defences or traits.
- `ATTACK_TYPES.md`: the six attack types (Contact, Projectile, Spread, Burst, Beam, Pool), for weapons and enemies.
- `ENEMY_DESIGN.md`: enemy principles, roster review, new concepts (including Fire enemies) and the 17 Oct decisions.
- `VOICE_GUIDE.md`: tone and character voices, with demo lines.
- `AUTORUN_AUTOAIM.md`: autorun modes and autoaim directives, including the THEN tie-breaker, with exact rules and numbers (shipped in v9.28 on `claude/festive-allen-xmea8i`, not yet in v10).
- `tables/`: the Notion databases as CSV (statuses and world objects, defences, interactions), regenerated from the matrix on 17 Oct. The matrix wins if they ever disagree.

## Follow-on work these decisions create (not done yet)

1. **Internal id rename** (decision 19): `phys/fire/shock/ice/arcane/soul/flame` become `force/acid/static/mucus/blood/soul/fire`, with save-data migration (`META.offered`, weapon ids). One dedicated session straight after a merge into `main`, because it touches every branch's hooks.
2. **Retire Lab view** (decision 21): remove `labGrey` and the `SET.view` choice; the Arcade look becomes the only view.
3. **`STYLE.md` and v10 colours** (decision 20): update when v10 ships. Today `STYLE.md` still describes the shipped game (acid terrain green, Lab view, borderless zones), and v10's `V10_COL` uses lime Acid, olive Mucus and pale-cyan Soul.
4. **Dual-type weapon and Pairing** (decision 1): Shocking Impact needs one Force/Static weapon; Spectral Combustion needs a Soul/Fire Pairing in the existing Pairings system.
