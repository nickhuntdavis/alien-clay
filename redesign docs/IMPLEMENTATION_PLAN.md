# Implementation Plan: weapon modifiers and sperm passives

**Status: plan, 22 Oct 2026. Nothing below is built yet.** Turns `MODIFIER_MATRIX.md` (25 weapon modifiers, branches, pairs, combo masteries) and `SPERM_PASSIVES.md` (30 sperm passives replacing the Genome slots) into the game. Start with a vertical slice, then widen.

## Decisions this plan rests on (user, 22 Oct)
- Weapon modifiers: 5 slots per weapon, one per group, opening at weapon Lv 1 (2 slots), 3, 6 and 9. 3 levels per modifier; a branch choice at Lv 2 and a mastery choice (4 endings). One weapon-modifier mastery per build.
- Sperm passives: from level-up drafts only; 2 slots, then +1 at run Lv 8, 16 and 24; defences use these slots. 3 levels plus one mastery. One sperm-passive mastery per build; Extra Mastery adds one of either kind.
- **Three weapons per run at most.** The 2 bonus mounts from weapon combos (`combos.js` `COMBO_MOUNTS`) are retired.
- The Laser (Fire Beam) is Ordered Online's **4th starter**.
- Gene boxes, Epigenetic Profiles and elite mutation drops are retired; relics stay as they are.
- No base Membrane: the membrane bubble only comes from the Membrane Shield card.
- The old weapon branch cards (promise Lv 3, choice Lv 6, mastery Lv 10) are scrapped in favour of modifiers.

## What the code already has
| File | Gives us |
|---|---|
| `draft.js` | One card screen for everything, slots, fork screens (reuse for branch and mastery choices), pool lean. |
| `modifiers.js`, `modcards.js` | 20 modifier behaviours (`MODS10`, `w.m10`) and their draft cards (3 per weapon, one Delivery, rank 3). |
| `pdef.js` | Player defences; **every run starts with a base Membrane**. |
| `power11.js` | Damage falloff with range (Range and Up Close build on it). |
| `mutations.js`, `mutdrop.js`, `genes.js` | Genome mutations, elite drops, gene boxes: to retire or replace. |
| `weapons24.js`, `wup1.js` to `wup6.js` | The old branch engine and cards: to retire. |
| `kindred.js`, `combos.js`, `fusion.js` | Race rescues (fill the 3 mounts) and combo bonus mounts (retire the mounts, keep the fusions). |
| `wstats.js` | Per-weapon telemetry for sims. |

## Blockers
None. Settled 22 Oct: **Epigenetic Profiles are retired** with the gene box (Phase 1), and **the base Membrane is removed**: the bubble only comes from the Membrane Shield card (Phase 1 turns the base Membrane off in `pdef.js`; Phase 3 builds the card).

## Phases

### Phase 0: Docs straight (half a session, Sonnet)
- Log the 22 Oct decisions in `COMBAT_MATRIX.md` section 10.
- Fix conflicts: `MODIFIERS.md` 2 (beams don't pierce), 4 (Ricochet off enemies), 10 (suicide vest), 20 (long lunge); `BASE_WEAPONS.md` (The Runs out, Laser in as Ordered Online's 4th starter); `SAMPLES.md` (Redtail's and Ordered Online's starters); `UPGRADES.md` (slots and draft rules for modifiers and sperm passives; Genome and weapon mutations gone; 3 weapons, no combo mounts).
- Done when: no doc disagrees with the matrix or the passives doc.

### Phase 1: Retire (1 session, Sonnet)
- Behind flags, nothing deleted (other branches hook into these files): `mutdrop.js` (elite drops), the gene box and Epigenetic Profiles in `genes.js`, the base Membrane in `pdef.js`, `wup1.js` to `wup6.js` (branch cards), the Genome mutation cards in `mutations.js`, and combo bonus mounts (`COMBO_MOUNTS` 0; fusions keep their other effects).
- Update the tests that use them; never skip a test.
- Done when: a run plays with weapons, Feats, defences and the existing modifier cards only, at most 3 weapons, and `./run.sh quick` passes.

### Phase 2: The slot engine (1 to 2 sessions, Opus)
- New feature files, one-line hooks into shared files: `modmatrix.js` (weapon modifiers) and `spassives.js` (sperm passives).
- Weapon slots: 5 group slots, opening at weapon Lv 1, 3, 6, 9 (replaces modcards' "3, one Delivery").
- Sperm passive slots: 2, +1 at Lv 8, 16, 24 (replaces draft.js's 4 Genome slots); defences move here.
- Levels, branch screen at Lv 2, mastery screen (reuse the fork screen); one weapon mastery and one sperm mastery per build; Extra Mastery.
- Draft weights for card kinds; +50% for the second half of a pair.
- Done when: a test fills slots, branches, masters, and is refused a second mastery.

### Phase 3: Vertical slice (2 sessions, Opus)
- Ordered Online with its 4th starter, the Laser (`laser.js`: a Fire beam held on one target).
- 10 modifiers with branches, 2 per group: Extra Projectiles, Orbiting (Delivery); Ricochet, Homing (Flight); Sticky, Connecting (Crowd); Focused Intensity, Rapid Fire (Tempo); Switched at Birth, Catalyst (Chemistry). Covers every Laser idea from the user's voice notes.
- 6 sperm passives: Membrane Shield (with Internal Ricochet), The Runs (moved from the `wake` weapon), Slipstream, Fever Pitch, Extra Mastery, Personal Space.
- 2 pairs (Carousel, Smart bounce) and 1 combo mastery (Static net or Planetary system, whichever the slice's weapons reach).
- `TODO_COPY` placeholders; copy briefs to the user.
- Done when: the user can play Ordered Online on the phone with the full slice.

### Phase 4: Bot and sims (1 session, Opus)
- Autorun picks modifiers, branches, passives and targeting rules with simple rules, so sims mean something.
- Modifier stats in `wstats.js`.
- `wave20.js` and race sims; tune `power11.js`.
- Done when: bot wins are within 20 to 50% and no single modifier is in more than 40% of winning builds.

### Phase 5: Readability and UI (1 session, Sonnet)
- Build panel: 3 weapons × 5 slots, the sperm slots, the mastery locks. Card looks per group; the branch screen.
- Phone screenshots with a busy screen; frame rate with the caps (36 arcs, 8 orbiters per hole).
- Done when: the screenshots read clearly and the frame rate holds.

### Phase 6: Copy (the user)
- Briefs for the slice's cards, then for each widening batch.

### Phase 7: Widen (5 to 8 sessions; Opus for systems, Sonnet for batches)
- The other 15 modifiers, the remaining pairs and combo mastery, the other 24 passives, per-weapon exceptions across the 27 weapons.
- Field Guide, `GAME_GUIDE.md`, tutorials and tests.

### Phase 8: Ship gate
- Merge `main`, full `./run.sh`, sims in the target band, APK.

## Risks
- **Merges:** other sessions edit `draft.js`, `modcards.js` and `game.js`. Keep new work in new files with one-line hooks.
- **Power:** 3 weapons × 5 slots, plus masteries, pairs and 5 passives, is far stronger than anything simulated so far. Phase 4 is not optional.
- **Save data:** card unlocks and offered counts in `META` need new keys; old keys stay readable so saves survive.
