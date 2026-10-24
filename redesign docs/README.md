# Redesign docs (combat rework)

Imported 17 Oct 2026 from the Notion exports. Working proposals, not shipped behaviour. Agents: read `CLAUDE.md` in this folder first.

- `BASE_WEAPONS.md`: the weapon source of truth: 24 live weapons (10 foundations with animation specs, 14 signatures), which sample each is a starter for, and the 72 archived. `archive/WEAPONS.md` and `archive/SIGNATURE_WEAPONS.md` are the old catalogues, not in use.
- `WEAPON_UPGRADES.md`: the first upgrade branch for all 24 weapons: three promises at Lv 3, three cards at Lv 6 (two in the promise, one wildcard), three extreme masteries at Lv 10 (360 cards), with trade-offs, what each shows in combat and which autorun modes suit it.
- `COMBAT_MATRIX.md`: **the only place combat rules and statuses live** (21 reactions, type rules, defence rules, statuses, world objects, role counterplay, attack-type rules). Section 10 lists the 32 reconciliation decisions of 17 Oct, section 11 the formulas and starting values, section 12 the signature weapon rules, section 14 where every topic lives. If another doc disagrees, the matrix wins.
- `DAMAGE_TYPES.md`: the seven types, one page each: identity, visual language, strengths and weaknesses. Rules: the matrix.
- `DEFENCE_TYPES.md`: the five defences (Squishy, Membrane, Shell, Thorns, Evasion; Evasion was called Dodge), one page each: identity, look, what beats it. No other defences or traits. Rules: the matrix.
- `ATTACK_TYPES.md`: the six attack types (Contact, Projectile, Spread, Burst, Beam, Pool), for weapons and enemies. Rules: matrix section 13.
- `ENEMY_DESIGN.md`: enemy principles, roster review, new concepts (including Fire enemies) and the 17 Oct decisions.
- `FEATS.md`: Feats as gifts from the consciousness: 16 gifts for every sample, 8 sample-exclusive gifts, the best 15 originals re-gifted, and a suggested starting pool of about 15.
- `MUTATIONS.md`: **superseded 22 Oct** by `SPERM_PASSIVES.md` and `MODIFIER_MATRIX.md`; kept for its card lines (copy source).
- `MODIFIERS.md`: the 20 modifiers (homing, piercing, orbiting, returning, gravity well, lunge and the rest) that change how an attack moves or repeats, with caps.
- `IMPLEMENTATION_PLAN.md`: the build plan (22 Oct 2026) for the modifier matrix and sperm passives: phases, vertical slice, blockers, risks.
- `SPERM_PASSIVES.md`: working draft (22 Oct 2026) of the 30 sperm passives that replace the Genome slots (mutations and defences re-sorted), with slots, levels, masteries and pairs.
- `MODIFIER_MATRIX.md`: working draft (22 Oct 2026) of 25 weapon modifiers (14 scaling, 11 shaping; five groups, one slot per group; pair bonuses) × 27 weapons, each with 3 levels and a mastery; Advanced Targeting moved to sperm passives; also lists the rule conflicts it raises.
- `VOICE_GUIDE.md`: tone and character voices, with demo lines.
- `GIFT_LINES.md`: approved gift lines, one per sample, for all 31 shared gifts (310 lines).
- `CONSCIOUSNESS.md`: the eight consciousness personas (one per sample): what the egg is to each, its tell, death, sincere crack and limits, plus existing lines to revisit.
- `SAMPLES.md`: the eight playable samples (characters): Baseline, Alpha, Beta, Private Schooled, Ordered Online, Redtail, Prawn Again, Not of This World: roster, three starting weapons each, unlocks, Scientist lines, stories and visual language.
- `SAMPLE_9_ACRO.md`: a ninth sample (Acid / Fire), its three new weapons with full branches, copy briefs for every player-facing string, and the six old Feats to bring back first. Design approved 20 Oct 2026; not built.
- `UPGRADES.md`: in-run progression and unlocks: one card-draft system, slot caps (3 weapons, 3 Feats; sperm passives replace the 4 Genome slots, 22 Oct), Feat levels and milestone forks, the sample-type pool lean, Skip/Reroll/Banish and the interruption budget.
- `AUTORUN_AUTOAIM.md`: autorun modes and autoaim directives, including the THEN tie-breaker, with exact rules and numbers (shipped in v9.28; merged into v10 in v10.04).
- `tables/`: the old Notion databases as CSV (statuses and world objects, defences, interactions), generated from the matrix by `tables/export.py`. Never edit them by hand; rerun the script after changing a matrix table.

## Follow-on work these decisions create (not done yet)

1. **Internal id rename** (decision 19): `phys/fire/shock/ice/arcane/soul/flame` become `force/acid/static/mucus/blood/alien/fire`, with save-data migration (`META.offered`, weapon ids). One dedicated session straight after a merge into `main`, because it touches every branch's hooks.
2. **Retire Lab view** (decision 21): remove `labGrey` and the `SET.view` choice; the Arcade look becomes the only view.
3. **`STYLE.md` and v10 colours** (decision 20): update when v10 ships. Today `STYLE.md` still describes the shipped game (acid terrain green, Lab view, borderless zones), and v10's `V10_COL` uses lime Acid, olive Mucus and pale-cyan Alien.
4. **Dual-type weapon and Pairing** (decision 1): Shocking Impact needs one Force/Static weapon (alternating shots); Spectral Combustion needs the Alien Beam + Fire Pool Pairing.
5. **Rename v10's Mucus Pool weapon** from "Sticky Situation" to "Nocturnal Emission" (`V10_ATK`, v10.js).
6. **Damage types for the rest of the roster** (spawned-only, feature-file enemies, bosses), same bell curve as `ENEMY_DESIGN.md` 5.1.
7. **Port the 14 signature weapons** (`BASE_WEAPONS.md`) into v10, name `wake` The Runs (shipped as Skid Mark), apply the 18 Oct weapon renames (`BASE_WEAPONS.md` 5, decision 4), give each sample its three starters, and recheck their old Pairings.
8. **Pools as water balloons** (decision 63): rebuild Nocturnal Emission and Hot Mess's throw (a balloon at one enemy, bursting on the face) and recode their modifier cells to `MODIFIER_MATRIX.md` 5.10; the Hot Mess cells in `cellmods2.js` (5.7) are superseded. Card text needs `TODO_COPY` briefs.
