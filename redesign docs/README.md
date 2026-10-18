# Redesign docs (combat rework)

Imported 17 Oct 2026 from the Notion exports. Working proposals, not shipped behaviour. Agents: read `CLAUDE.md` in this folder first.

- `BASE_WEAPONS.md`: the 24-weapon roster (10 foundations, 14 signatures), animation specs, reaction hooks, archive list.
- `COMBAT_MATRIX.md`: **the only place combat rules and statuses live** (21 reactions, type rules, defence rules, statuses, world objects, role counterplay, attack-type rules). Section 10 lists the 32 reconciliation decisions of 17 Oct, section 11 the formulas and starting values, section 12 the signature weapon rules, section 14 where every topic lives. If another doc disagrees, the matrix wins.
- `DAMAGE_TYPES.md`: the seven types, one page each: identity, visual language, strengths and weaknesses. Rules: the matrix.
- `DEFENCE_TYPES.md`: the five defences (Squishy, Membrane, Shell, Thorns, Evasion; Evasion was called Dodge), one page each: identity, look, what beats it. No other defences or traits. Rules: the matrix.
- `ATTACK_TYPES.md`: the six attack types (Contact, Projectile, Spread, Burst, Beam, Pool), for weapons and enemies. Rules: matrix section 13.
- `ENEMY_DESIGN.md`: enemy principles, roster review, new concepts (including Fire enemies) and the 17 Oct decisions.
- `WEAPONS.md`: every weapon in one place: the 42 matrix weapons, the 26 signature weapons and the 28 parked originals, with totals per damage type.
- `FEATS.md`: Feats as gifts from the consciousness: 16 gifts for every sample, 8 sample-exclusive gifts, the best 15 originals re-gifted, and a suggested starting pool of about 15.
- `MUTATIONS.md`: the 33 mutation cards (body, weapon, damage-type, trade-off and rare synergy), how they use Genome slots, and a starting pool of 8.
- `MODIFIERS.md`: the 20 modifiers (homing, piercing, orbiting, returning, gravity well, lunge and the rest) that change how an attack moves or repeats, with caps.
- `SIGNATURE_WEAPONS.md`: 26 signature weapons (21 originals and 5 Fire drafts) brought back alongside the 42-weapon matrix, each with one damage type, one attack type and one signature behaviour (rules in `COMBAT_MATRIX.md` section 12).
- `VOICE_GUIDE.md`: tone and character voices, with demo lines.
- `SAMPLES.md`: the eight playable samples (characters): roster, unlocks, Scientist lines, stories and visual language.
- `UPGRADES.md`: in-run progression and unlocks: one card-draft system, slot caps (3 weapons, 3 Feats, 4 Genome), Feat levels and milestone forks, the sample-type pool lean, Skip/Reroll/Banish and the interruption budget.
- `AUTORUN_AUTOAIM.md`: autorun modes and autoaim directives, including the THEN tie-breaker, with exact rules and numbers (shipped in v9.28; merged into v10 in v10.04).
- `tables/`: the old Notion databases as CSV (statuses and world objects, defences, interactions), generated from the matrix by `tables/export.py`. Never edit them by hand; rerun the script after changing a matrix table.

## Follow-on work these decisions create (not done yet)

1. **Internal id rename** (decision 19): `phys/fire/shock/ice/arcane/soul/flame` become `force/acid/static/mucus/blood/soul/fire`, with save-data migration (`META.offered`, weapon ids). One dedicated session straight after a merge into `main`, because it touches every branch's hooks.
2. **Retire Lab view** (decision 21): remove `labGrey` and the `SET.view` choice; the Arcade look becomes the only view.
3. **`STYLE.md` and v10 colours** (decision 20): update when v10 ships. Today `STYLE.md` still describes the shipped game (acid terrain green, Lab view, borderless zones), and v10's `V10_COL` uses lime Acid, olive Mucus and pale-cyan Soul.
4. **Dual-type weapon and Pairing** (decision 1): Shocking Impact needs one Force/Static weapon (alternating shots); Spectral Combustion needs the Soul Beam + Fire Pool Pairing.
5. **Rename v10's Mucus Pool weapon** from "Sticky Situation" to "Snot Trap" (`V10_ATK`, v10.js).
6. **Damage types for the rest of the roster** (spawned-only, feature-file enemies, bosses), same bell curve as `ENEMY_DESIGN.md` 5.1.
7. **Port the 26 signature weapons** (`SIGNATURE_WEAPONS.md`) into v10, restore the name Pub Crawl for `wake` (shipped as Skid Mark), and recheck their old Pairings.
