# CLAUDE.md: redesign docs (combat rework)

Read this before touching anything in this folder. `README.md` is the human index; this file is how to work here.

## What this folder is
Design proposals for the v10 combat rework of Spawn Prawn. **Not shipped behaviour.** The shipped game is described by the code (`storm-directive/web/js/`) and `storm-directive/GAME_GUIDE.md`; neither is the redesign. The v10 prototype (`v10.js`, the 42-weapon matrix) lives only on branch `claude/zealous-clarke-i26iot`, not `main`.

## Source of truth (in this order)
1. **The user's latest instruction** in the session.
2. **`COMBAT_MATRIX.md`:** the only place combat rules, statuses, reactions, world objects, defence rules, attack-type rules, formulas and numbers live. Section 10 is the numbered decision log (every doc follows it); section 11 has the formulas and starting values; section 14 says where every topic lives.
3. **Every other doc** holds content (identity, rosters, cards, voice) and **cites** matrix sections rather than restating rules. If a doc disagrees with the matrix, fix the doc.
4. **`tables/*.csv`** are generated from the matrix by `tables/export.py`. Never edit them by hand.

## Where to look

| Need | Doc |
| --- | --- |
| Any rule, number or status; what was decided and when | `COMBAT_MATRIX.md` (decisions: section 10) |
| What a damage type, defence or attack type is for, how it looks | `DAMAGE_TYPES.md`, `DEFENCE_TYPES.md`, `ATTACK_TYPES.md` (identity only) |
| Enemies: principles, roles, roster, new concepts, Fire enemies | `ENEMY_DESIGN.md` |
| The 24 live weapons | `BASE_WEAPONS.md` (24 live weapons; `archive/` holds the old catalogue) |
| Feats (gifts from the consciousness), Lv 3 forks, starting pool | `FEATS.md` |
| Mutation cards (body, weapon, type, trade-off, rare) | `MUTATIONS.md` |
| Attack behaviours: homing, orbiting, gravity well, lunge and caps | `MODIFIERS.md` |
| Draft, slots, forks, pool lean, unlocks | `UPGRADES.md` |
| The eight playable samples | `SAMPLES.md` |
| Autorun modes and autoaim directives | `AUTORUN_AUTOAIM.md` |
| Tone, the Scientist, the consciousness, card text | `VOICE_GUIDE.md` |
| Follow-on code work these decisions create | `README.md` ("Follow-on work") |

## What matters
- **Rules live once.** New or changed rule: edit the matrix, add a row to the section 10 decision table if the user decided it, then fix any doc that cites it. Never copy a rule into another doc; cite the section (e.g. "matrix 11.3").
- **After changing a matrix table** (sections 1, 3, 4, 11.4 to 11.6), run `python3 "redesign docs/tables/export.py"` and commit the CSVs with it.
- **Section numbers are stable.** Other docs cite them. Don't renumber; append new sections (old section 9 is kept as a stub for this reason).
- **Hard limits the user set** (check the matrix before adding anything):
  - 7 damage types only: Force, Acid, Static, Mucus, Blood, Soul, Fire. Cooties, Oil and Water are retired.
  - 5 defences only: Squishy, Membrane, Shell, Thorns, Evasion. No extra traits.
  - 6 attack types only: Contact, Projectile, Spread, Burst, Beam, Pool. Everything else is a modifier.
  - Reactions fire only through the five trigger kinds (matrix reaction rules).
  - No new ground objects beyond decision 27's list, and no new statuses without the user.
  - Every chain is bounded (12.5); every effect is visible on a phone.
- **Vocabulary** (player-facing and in docs):
  - "damage type" and "unstable reaction", never "element" or "elemental".
  - Feats are "performed", never "cast".
  - **Evasion** is the defence; "dodge" means autorun movement.
  - **Mutations** are the player-facing cards; **modifiers** are the internal attack behaviours. Don't mix them up.
- **Voice:** Feats speak in the consciousness's voice (it speaks to the sperm as "you", never as the sperm); the Scientist is flat and clinical. British spelling, () not em dashes.
- **Merges:** these docs change in parallel sessions. Log each commit in your `storm-directive/changes/<branch>.md` fragment (Systems: "docs only (redesign docs)").

## What doesn't matter (ignore or treat with care)
- **Notion leftovers:** `[Name](#)` links, `<aside>` blocks and "imported from Notion" notes are harmless; don't chase them.
- **The shipped code's names:** internal ids are still `phys/fire/shock/ice/arcane/soul/flame` (`fire` is Acid in code). The rename is follow-on work (decision 19); docs use the canonical names.
- **`STYLE.md`, `V10_COL` and Lab view** still describe the old look. The redesign's visual language (DAMAGE_TYPES and DEFENCE_TYPES) wins (decisions 20, 21).
- **Old Feat and weapon text in `data.js`** is source material, not design. Map it through the matrix before reusing it (see `FEATS.md` section 4 for how).
- **Ideas lists pasted by the user** (Feats, mutations) have already been folded in. Their rejected or merged items are recorded in each doc's "left out" notes; don't re-add them.

## Before you finish
- Grep for anything you renamed or retired across the whole folder (`grep -rn "Old Name" "redesign docs"`).
- Matrix tables changed? Rerun `export.py`.
- Update `README.md` if you add, remove or retitle a doc, and add the doc to matrix section 14's table.
