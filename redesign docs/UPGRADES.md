# Upgrades, Feats and Progression

Working proposal, 17 Oct 2026. How the build grows during a run and how the game grows between runs. Settled one decision at a time; the numbers are starting points for sims and playtesting. It sits on top of `COMBAT_MATRIX.md` (damage types, attack types, defences), `SAMPLES.md` (primary and support types, unique Feats), `FEATS.md` (the 15 drafted Feats) and `WEAPONS.md`.

**What this is not:** an RPG skill tree. Spawn Prawn is a fast autoshooter. The player makes a series of small, consequential choices, then watches them interact in combat.

## Summary

| # | Decision | Locked |
| --- | --- | --- |
| 1 | Weapons | 3 slots, offered at levels 1, 8 and 22 (plus up to 2 Weapon Combo mounts), as today |
| 2 | Feats | 3 slots: the sample's unique Feat starts in slot 1; 2 more are drafted. Feats cap at about level 5 |
| 3 | Mutations and defences | 4 shared Genome slots, each rankable. Defences come from upgrade cards (or are built into some samples, weapons and Feats), mutations from Lateral Gene Transfer |
| 4 | Milestones | Weapons fork at levels 5 and 10, Feats at 3 and 5. Each fork is its own 2-card screen. Only one weapon a run reaches level 10 |
| 5 | Pool | Moderate lean: 50% primary type, 25% support, 25% other. No Instability cost. Novelty weighting stays inside each band |
| 6 | Draft controls | Skip, Reroll and Banish (Remove, or Fewer like this), all paid in rerolls. No Freeze |
| 7 | Triggers | Level-ups and elite or boss kills open drafts; everything else adds cards to the pool with a toast. At most one screen per ~40 s of combat |

## 1. Principles

1. **One shared drafting interaction.** Weapons, Feats, upgrades, mutations, defences and forks all use the same card-choice screen. No crafting screens, menus or trees.
2. **Feats have meaningful progression.** Milestones change behaviour, not just numbers.
3. **Unlocks expand choice.** Meta-progression mainly adds possibilities, not permanent power. A small, capped power trickle (Profile ranks) stays, because the win-rate target is about 1 in 3 and new players need some ramp.
4. **Randomness stays meaningful.** Players tilt their odds (sample, Banish) but never dictate an offer.
5. **Draft controls are scarce and distinct.** Skip, Reroll and Banish each do a different job.
6. **Complexity arrives gradually.** The starting pool is the tutorial: the clearest cards go in it.
7. **The combat rework drives builds.** Damage types, reactions and defences must show up in the draft, or the 21 reactions and 5 defences stay invisible.

## 2. What stays, what changes

| Keep (already in v9) | Change | Add |
| --- | --- | --- |
| Three-card level boxes from XP | Feats: 2 slots → 3, sample's unique Feat fixed in slot 1 | Feat levels and Feat forks |
| Weapons at levels 1, 8, 22 (`SLOT_LEVELS`), combo mounts | Lv 10 mastery becomes a fork; Lv 5 fork added | Genome slots (mutations and defences share 4) |
| Chests from elites and bosses | Pool weighting adds a sample-type lean on top of novelty | Defence cards (and built-in defences) |
| Rerolls as a currency; Skip raises the next rarity floor (`G.rarBoost`) | Lateral Gene Transfer feeds Genome slots | Banish |
| Novelty weighting (`novK`, `META.offered`) | | Catalyst and Concentration cards (Specialise) |
| One mastery weapon a run | | Interruption budget and queue |

## 3. Card kinds

Conceptual categories for designers; the player never sees these labels.

| Kind | Does | Examples |
| --- | --- | --- |
| **Acquire** | Adds a weapon, Feat, mutation or defence | A new Feat while a Feat slot is free; a Shell card |
| **Enhance** | Improves something you already have | Weapon level, Feat level, Genome rank, stamina |
| **Transform** | Changes behaviour: a fork | A weapon's Lv 5 fork; a Feat's level 3 fork |
| **Specialise** | Strengthens a mechanic or direction | **Catalysts:** empower a reaction you have discovered. **Concentration:** fill a build-up bar (Burn, Corrosion, Soul, Poise) faster or drain it slower |

### Eligibility

A card is offered only when it can matter:
- **Acquire** needs a free slot of its kind. Once every slot is full, Acquire cards leave the pool, so late-run drafts become upgrades by themselves. This is the answer to "acquire versus upgrade": slot caps, not weighting maths.
- **Enhance** needs the item, below its level cap.
- **Transform** is never a normal draft card (see 6).
- **Catalysts** need the reaction to have been discovered this save (decision 22 in `COMBAT_MATRIX.md`).
- **Concentration** needs a weapon or Feat that builds that bar.
- **Defences** need a free Genome slot, like mutations, and are not offered if you already have that defence built in (see 5).

## 4. Slots

| Slot | Count | How it fills |
| --- | --- | --- |
| Weapons | 3 (+ up to 2 combo mounts) | Weapon draft at levels 1, 8 and 22, as today. Weapons never appear as random cards |
| Feats | 3 | Slot 1: the sample's unique Feat, from the start. Slots 2 and 3: Feat cards in normal drafts while a slot is free |
| Genome | 4, shared | Mutations (Lateral Gene Transfer) and defence cards. Each rankable. Taking Shell means one fewer mutation. Built-in defences use no slot |

Few weapons keeps each one readable on a phone screen and leaves the draft for Feats, upgrades and Genome cards.

## 5. Feats

### Arc

| Stage | Levels | What happens |
| --- | --- | --- |
| **Acquire** | 1 | The Feat's defining ability, useful from the first second |
| **Develop** | 2, 4 | Effect, cooldown, duration, stamina cost, or a modest secondary effect |
| **Transform** | 3, 5 | A fork: two different behaviours, pick one |

Level counts can differ per Feat, but the default is 5 with forks at 3 and 5 so a Feat in any of the three slots can reach its milestones in a normal run. Feats carry a damage type and an attack type and follow every rule in `COMBAT_MATRIX.md`; stamina is unchanged.

**Example (hypothetical): Panic Button**
- Level 1: releases a pulse automatically when you are in danger.
- Levels 2 and 4: stronger pulse, shorter cooldown.
- Level 3 fork (Feat forks follow the weapon rules: modifiers, hazards, rarely a new attack type): **Safe Space** (the pulse leaves a short-lived zone enemies won't enter) or **Overreaction** (the pulse doubles in size but costs stamina).
- Level 5 fork: two further changes to whichever branch was taken.

Upgrading a Feat competes with every other card in that draft. That trade is the point.

### Defences: upgrade cards and built-ins

The player gets defences (Squishy, Membrane, Shell, Thorns, Evasion) two ways (decided 17 Oct, replacing Assimilation):
- **Upgrade cards:** a defence is an ordinary Acquire card in normal drafts, taking a Genome slot; later copies rank it up. Defences are untyped, so they sit outside the sample lean (novelty weighting only).
- **Built in:** a few samples, weapons and Feats come with a defence while you have them. A built-in defence uses no Genome slot, and its card is not offered while you have it. Keep them rare (at most one per source) so defence cards stay a real draft choice. Current list:

| Source | Defence | Value |
| --- | --- | --- |
| The Cold Parcel (sample) | Evasion | 20% miss chance (below the 35% card value, so a starting sample isn't over-tuned) |
| Thorny Onesie (weapon) | Thorns | As the card (`COMBAT_MATRIX.md` 11.4) |

None of the eight sample Feats carries one; a drafted Feat may, later.

Your defence has the same weaknesses as an enemy's: take Shell and Acid enemies become dangerous.

## 6. Milestones and forks

| Item | Fork levels | Notes |
| --- | --- | --- |
| Weapons | 5 and 10 | Lv 5 open to all three weapons. Lv 10 is the mastery fork: only one weapon a run (today's rule, `masterOf`/`wCap`) |
| Feats | 3 and 5 | All three Feats |
| Genome | none at first | Add later if ranks feel flat |

- A fork is **its own screen with 2 transform cards** for that item. Pick one; the other is gone for the run.
- Forks change something the player can see: they **add a modifier** (`MODIFIERS.md`; a weapon can carry several), add a leftover hazard (Pool, trail; decision 7), or add a signature behaviour. A fork never changes damage type.
- **Rarely, a fork changes the attack type** (Projectile becomes Spread or Burst). Keep it for forks where the new shape is the whole point, mostly the Lv 10 mastery fork; the new attack type then decides every defence rule.
- The Lv 5 fork typically offers two modifiers (e.g. Piercing or Ricochet); the Lv 10 mastery fork offers two signature-scale changes.
- Signature weapons keep their current Lv 10 masteries as one side of the fork.
- A transform card never sits in a normal draft next to ordinary cards: it would win every time and not be a choice.

## 7. The pool

### Sample lean

Typed cards (weapons, Feats, Catalysts, Concentration) are weighted by the sample's types:

| Band | Share |
| --- | --- |
| Primary type | 50% |
| Support type | 25% |
| Every other type | 25% |

Novelty weighting works inside each band. Off-type picks have no extra cost: being rarer is the cost. Revisit (Instability) only if hybrid builds dominate in sims. The Other Half uses its current type for the lean and shifts with it.

### Between runs: unlock possibilities

Unlocks add Feats, samples, fork options and card families to the pool, each with its unlock condition shown clearly. The starting pool stays small and clear.

### Later: pool curation

Treat it as curation, never a literal deck (no counts, depletion or reshuffling). Stages, only if the sample lean and Banish don't give enough control:
1. **Curated pool** (this doc): the game controls eligibility and weighting.
2. **Presets:** a few ready-made pool configurations per sample.
3. **Custom pools:** players choose eligible cards. Lowest priority on mobile.

## 8. Draft controls

| Control | Cost | Does |
| --- | --- | --- |
| **Skip** | free | Decline all cards; the next box's rarity floor rises (`RAR_SKIP`, as today) |
| **Reroll** | 1 reroll | Replace all cards |
| **Banish: Remove** | 2 rerolls | This card and its upgrade line are gone for the run |
| **Banish: Fewer like this** | 1 reroll | Its family (e.g. Blood cards, or Static Feats) appears about half as often for the run. Never to zero |

No Freeze: it overlaps Reroll and adds a button to a phone card screen. Banish never removes a whole category, which would make the pool predictable and create dominant strategies.

## 9. Triggers and the interruption budget

### What opens a card screen

| Event | Effect |
| --- | --- |
| XP level-up | Draft |
| Elite or boss killed | Draft (chest) |
| Weapon or Feat reaches a fork level | Fork screen |
| Weapon slot level (1, 8, 22) | Weapon draft |
| Reaction discovered | Catalyst cards join the pool; toast, no pause |
| Wave or stage milestone | Nothing for now. Add a guaranteed draft only if sims show XP pacing is lumpy |

### Budget and queue

- **At most one screen per ~40 s of combat.** Screens earned inside that window queue.
- **Petri Dish:** queued screens play at the wave break, next to Lateral Gene Transfer boxes.
- **Race to the egg and campaign levels:** queued screens open when the budget allows.
- **Screens that land together share one pause**, shown back to back with the fork first, so combat never restarts in between.
- **A toast always marks a pool change**, or the player never links the elite kill to the card that turns up later.

## 10. Sims and the bot

The sim bot (`tests/sim/wave20.js`, `lvsim.js`) picks cards for balance runs, so every new rule needs a bot policy before balance work starts:
- **Forks:** pick the branch whose attack type, modifier or hazard the current loadout lacks, else random.
- **Banish:** never (keeps sims comparable), except a test mode that measures its effect.
- **Skip and Reroll:** as today.
- **Feats:** prefer upgrading the unique Feat while below its next fork.

## 11. Open questions

1. Feat level cap of 5: check in sims that all three Feats can reach rank 3 by mid-run.
2. Genome ranks: how many, and do they need forks?
3. Weapon fork content: write a fork pair for each of the 42 matrix weapons and 26 signature weapons (a big job; start with each sample's starting weapon).
4. Feat fork content: the 15 drafted Feats have their Lv 3 forks (`FEATS.md`); Lv 5 forks, and both forks for the eight samples' unique Feats, are still to write.
5. The 40 s budget: tune in play; late runs earn XP fastest.
6. How often defence cards appear in drafts, and whether The Cold Parcel's 20% Evasion holds up in sims.
7. Which cards make up the starting pool.
