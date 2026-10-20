# Sample 9 (`s10_acro`): design and copy briefs

**Status: design approved 20 Oct 2026; revised the same day (Fire targeting fix, Unique Feat numbers and forks, exclusive gift X9, consciousness persona). Weapons built 20 Oct (`storm-directive/web/js/acro.js`, with `TODO_COPY` placeholders); the sample itself built 20 Oct (`acrosample.js`: roster entry, passive, Unique Feat, X9, unlock, body, and the lurch before every turn as a cosmetic tell). No copy yet.** Internal ids only: every player-facing string is a `TODO_COPY` placeholder for the user to write (section 6). Rules: `COMBAT_MATRIX.md` (cited as 11.x, 12.x), `MODIFIERS.md`, `WEAPON_UPGRADES.md` (branch format). Numbers are starting points; nothing is simulated.

## 1. Why this sample

- **Acid gap:** Acid Spit is the only Acid weapon in the 24 (`WEAPON_UPGRADES.md` note 4). Live weapons by type: Force 7, Alien 4, Static 3, Mucus 3, Blood 3, Fire 3, Acid 1.
- **Fire gap in attack types:** no Fire Beam, Projectile, Spread or Contact in the roster.
- **New emotional space:** impatience. The other eight are reliability, dominance, desperation, manipulation, evasion, curiosity, temporal wrongness and alien devotion.

## 2. The sample

**The joke (real science):** the acrosome is a cap of enzymes on a sperm cell's head, meant to dissolve a way into the egg. Releasing it too early (premature acrosome reaction) is a documented cause of infertility. This one can't wait. Every enemy looks like the egg.

| Field | Design |
|---|---|
| Strain | 9 |
| Types | Acid primary, Fire support |
| Body family | Natural (`samplelooks.js`) |
| Tell | Oversized fizzing pink cap on the head; lurches forward a beat before every turn |
| Passive `acro_early` | Corrosion bars pay off at 70% instead of 100% (11.2): a Shell layer strips early; with no Shell, the creature is Corroded early. Uses the existing bar and ring |
| Unique Feat `acro_release` | Slot 1. Section 2.1 |
| Exclusive gift X9 `acro_x9` | Drafted, this sample only. Section 2.2 |
| Consciousness | Section 2.3 |
| Unlock | Strip 50 Shell layers in one run |
| Visual | Player Shell shows as bands on the cap |

**Kit loop:** strip with Acid, finish with Fire. A Fire hit on a Corroded target is the existing **Premature Evaporation** reaction (matrix section 1), so the joke is also the main combo. No new rules.

**Order matters.** Premature Evaporation resets the target's Corrosion bar. A Fire hit on a Shelled enemy whose bar is still filling would wipe the progress before a layer strips (and the code counts a bar above 15% as Corroded: `fight.js` `corroded()`). So the kit's Fire waits for the strip: `acro_spark` targets enemies in the Corroded state (no Shell left, decision 34) and skips Shelled enemies with a filling bar (section 5). Acid strips; Fire burns what is left.

### 2.1 Unique Feat: `acro_release` (slot 1)

- **Is:** Acid, Burst, self-centred. Performs itself when 4+ enemies are within 220; tap to perform early when ready (`featTap`).
- **Does:** fills the Corrosion bar of every enemy within 220 (bosses half) and leaves an Acid Pool under you (radius 90, 3 s).
- **Cost:** your Acid damage −25% for 4 s (the cap is spent; tuned 20 Oct after a sim, was −50% for 6 s). The cap visibly pops; the head looks bare until it regrows. This is a weapon-side penalty shown on the body, not a new status.
- **Start stats:** 10 damage, 14 s cooldown, 24 stamina, radius 220.
- **Lv 2 / Lv 4:** cooldown −1.5 s each.
- **Lv 3 fork (pick one):**
  - `wide`: radius +40%.
  - `quick`: the spent penalty is −10% for 2 s instead of −25% for 4 s.
- **Lv 5 fork (pick one):**
  - `strip`: the burst also strips one Shell layer from every enemy inside (elites included; bosses none).
  - `regrow`: while spent, each Shell layer you strip takes 1 s off the penalty and 1 s off the cooldown.
- **Modes:** HOLD and ORBIT gather the 4 enemies; HUNT rarely does.

### 2.2 Exclusive gift X9: `acro_x9` (drafted, this sample only)

Joins `FEATS.md` section 3 as X9.

| # | Sample | Type and attack | Moment (trigger) | Cooldown |
| --- | --- | --- | --- | --- |
| X9 | Sample 9 | Acid, Pool (self-centred) | You stay still for 1 s | 8 s |

- **The idea:** it can't bear to wait. The moment it is made to, the cap boils over.
- **Does:** an Acid Pool spills out around you (radius 90, 3 s) and fills Corrosion on anything standing in it.
- **Rules:** a standard Acid Pool (11.6); touching pools merge (12.7). Trigger only, can't be tapped. Attacking, so it costs stamina (12). Stopping means not steering and not being pushed: knockback doesn't count.
- **Lv 3 fork (pick one):**
  - `spill`: radius +50%.
  - `drip`: when you move off, the spill trails behind you for 3 s (Trail modifier).
- **Lv 5 fork (pick one):**
  - `fidget`: triggers after 0.5 s still instead of 1 s.
  - `topup`: the spill refreshes every Acid Pool it touches to full lifetime.
- **Modes:** HOLD and NEST trigger it all the time; KITE almost never. That is the point: it rewards the playstyle this sample hates.

### 2.3 Consciousness persona (joins `CONSCIOUSNESS.md` as 9)

**The early arrival.** Turns up an hour before everything, opens presents in November, sends the email before the attachment. It is sure that going now is better than going right, and it has never once been made to regret it in a way it remembers.

- **The egg is:** a door it should already be through.
- **Tell:** starts in the middle; skips ahead to the ending; "already", "now", "done"; answers questions before they are asked.
- **Death:** insists it was nearly there; it just started a little too soon.
- **Sincere crack (campaign):** it knows going early is how it ruins things, and it cannot stop.
- **Never:** waits, says "later", asks permission (Redtail asks), counts steps (Baseline counts).
- **Blind test against Private Schooled:** the heir never hurries because the world comes to it; this one cannot stop hurrying because it thinks the world is leaving without it. Same impatience at being made to wait, opposite response.

## 3. Weapon 25: `acro_cap` (Acid, Contact)

Hits the nearest enemy within 70 every 0.6 s; Corrosion fills ×2. Every 4th hit is a lunge through the target (Every Nth + Lunge). Contact, so Thorns answers each hit.

Branches (3 promises, 9 Lv 6 cards, 3 masteries): `WEAPON_UPGRADES.md` section 25. Base stats and animation: `BASE_WEAPONS.md` section 8.

## 4. Weapon 26: `acro_spray` (Acid, Spread)

A short fan of 3 heavy droplets (tuned 20 Oct from 5 light ones, so Shell's flat reduction takes less of each). Each droplet adds Corrosion. (Hyaluronidase dissolves the glue between the egg's outer cells.)

Branches (3 promises, 9 Lv 6 cards, 3 masteries): `WEAPON_UPGRADES.md` section 26. Base stats and animation: `BASE_WEAPONS.md` section 8.

## 5. Weapon 27: `acro_spark` (Fire, Beam)

The zinc spark at conception (real). Short beam (range 180). **Targeting (all promises):** enemies in the Corroded state first (no Shell left, decision 34); then enemies with no Shell and no Corrosion; Shelled enemies whose Corrosion bar is filling only when nothing else is in range (section 2, "Order matters"). The kit's finisher; sets off Premature Evaporation without wiping your Acid progress. First Fire Beam in the roster. Below, "Corroded" always means the Corroded state, not a part-filled bar.

Branches (3 promises, 9 Lv 6 cards, 3 masteries): `WEAPON_UPGRADES.md` section 27. Base stats and animation: `BASE_WEAPONS.md` section 8.

## 6. Copy briefs (the user writes these)

Fill the **Your text** column. Each group shares one length limit and one set of neighbours (existing lines, quoted, to match the voice).

### 6.1 The sample (Samples screen card, Field Guide SAMPLES tab, run log)

Neighbours (Redtail):
- `"Static hits also add to the target's burn."`
- `"What's that? Can we touch it? We touched it. Oh, it's hot. OH, EVERYONE'S HOT. DO IT AGAIN!"`
- `"Sample {id} was discovered outside the laboratory. The door was locked. Eleven minutes of footage are missing."`

| ID | Limit | Job and facts | Your text |
|---|---|---|---|
| `s9_name` | 17 chars | Strain 9, Acid / Fire. The thing behind it: an enzyme cap used too early. Don't spoil the joke in the name | |
| `acro_origin` | 25 chars | Origin tag. Others: "Human", "Unknown", "Impossible", "Extraterrestrial". This one is natural and human | |
| `acro_passive` | 30 chars | Passive name. Impatience: acts before it's ready | |
| `acro_pdesc` | 95 chars | Corrosion bars pay off at 70%: a Shell layer strips early; with no Shell, the enemy becomes Corroded early | |
| `acro_line` | 130 chars | Consciousness line on the card, in the persona of section 2.3 (the early arrival), speaking to the sperm as "you". It can't wait; every enemy looks like the egg. Must pass the blind test against Private Schooled and Redtail | |
| `acro_sci` | 150 chars, must use `{id}` | Scientist line. Dry, unimpressed. A real fertility finding: released its enzymes before arrival | |
| `acro_unlock` | 60 chars | Strip 50 Shell layers in one run | |

### 6.2 Unique Feat (Feat card, slot badge, Field Guide)

Neighbours (Reply All):
- `"I replied to everyone. EVERYONE. Look how warm they are."`
- `"You fill the nearest enemy's Burn bar at once. Static arcs from it spread more Burn to the enemies around it."`

| ID | Limit | Job and facts | Your text |
|---|---|---|---|
| `acro_feat_name` | 24 chars | Empties the cap all at once | |
| `acro_feat_icon` | 2 letters | Slot badge, like `RA` | |
| `acro_feat_line` | 70 chars, in quotes | Gift line in the consciousness's voice, speaking to the sperm as "you". Giving up everything, right now | |
| `acro_feat_does` | 120 chars | Acid burst around you: fills the Corrosion bar of every enemy within 220 (bosses half), leaves an Acid Pool. Then your Acid damage −25% for 4 s | |
| `acro_feat_fk3_wide` | name 24, desc 100 chars | Lv 3 fork: radius +40% | |
| `acro_feat_fk3_quick` | name 24, desc 100 chars | Lv 3 fork: the spent penalty is −10% for 2 s instead of −25% for 4 s | |
| `acro_feat_fk5_strip` | name 24, desc 100 chars | Lv 5 fork: the burst also strips one Shell layer from every enemy inside (not bosses) | |
| `acro_feat_fk5_regrow` | name 24, desc 100 chars | Lv 5 fork: while spent, each Shell layer you strip takes 1 s off the penalty and the cooldown | |

Fork neighbours (Reply All): `Reply to Thread`: `"The arcs reach six enemies instead of three."`; `Everyone in CC`: `"A 40% wider reach for the arcs."`

### 6.2a Exclusive gift X9 (draft card, Feat slot, Field Guide)

Neighbours (`FEATS.md` X6, Redtail): name `EVERYBODY TOGETHER`, gift line `"Hold hands! ALL OF YOU!"`. Fork names: `Group Chat`, `Hold Tight`. The gift line must be in this sample's persona (section 2.3), speaking to the sperm as "you".

| ID | Limit | Job and facts | Your text |
|---|---|---|---|
| `acro_x9_name` | 24 chars | It boils over the moment it's made to wait | |
| `acro_x9_line` | 70 chars, in quotes | Gift line. Hates being kept waiting | |
| `acro_x9_does` | 120 chars | Stay still for 1 s and an Acid Pool spills out around you (radius 90), corroding anything in it | |
| `acro_x9_fk3_spill` | name 24, desc 100 chars | Lv 3 fork: radius +50% | |
| `acro_x9_fk3_drip` | name 24, desc 100 chars | Lv 3 fork: when you move off, the spill trails behind you for 3 s | |
| `acro_x9_fk5_fidget` | name 24, desc 100 chars | Lv 5 fork: triggers after 0.5 s still instead of 1 s | |
| `acro_x9_fk5_topup` | name 24, desc 100 chars | Lv 5 fork: the spill refreshes every Acid Pool it touches | |

### 6.3 Weapons (weapon draft cards, Field Guide, Tackle Box)

Neighbours:
- `"Hurls a shocking-pink glob that corrodes what it hits. Manners are not a survival strategy."` (Acid Spit)
- `"No aiming: you leave a burning trail wherever you swim."` (The Runs)

| ID | Limit | Job and facts | Your text |
|---|---|---|---|
| `w25_name` | 18 chars | Acid Contact. The headbutt | |
| `acro_cap_desc` | 110 chars | Headbutts the nearest enemy within 70; heavy Corrosion; every 4th hit lunges through the target | |
| `w26_name` | 18 chars | Acid Spread. An enzyme sneeze | |
| `acro_spray_desc` | 110 chars | A short fan of 3 heavy droplets; every droplet corrodes | |
| `w27_name` | 18 chars | Fire Beam. The spark of conception | |
| `acro_spark_desc` | 110 chars | Short beam (180); goes for Corroded enemies first and finishes them | |

### 6.4 to 6.6 Branch cards (Lv 3, 6, 10 screens)

Limits for all three weapons: **card names 24 chars**, **card descriptions 130 chars**, **Costs and Shows lines 70 chars each** (one pair per promise).

Neighbours (Acid Spit):
- Names: `Spit Take`, `Second Helping`, `Spittoon`, `Battery Acid`
- Description: `"Globs that miss leave a puddle; swimming through it makes your next 3 spits double size."`

ID pattern (as built in `acro.js`): `<weapon>_A` promise name, `_A3` Lv 3 description, `_Ac` / `_As` Costs / Shows, `_A6a` / `_A6b` in-promise Lv 6 cards, `_Aw` wildcard, `_M1` to `_M3` masteries. Each card's name is its ID; its description is the ID plus `_desc` (e.g. `acro_cap_A6a_desc`).

#### 6.4 `acro_cap`

| ID | Facts | Your text |
|---|---|---|
| `acro_cap_A` / `_A3` | Drilling. Consecutive hits on one target +15% (cap +100%); a full stack strips a Shell layer outright | |
| `acro_cap_Ac` / `_As` | Costs: one target only. Shows: the cap spins and fizzes in a spiral | |
| `acro_cap_A6a` | Stripping the last layer launches you to the next nearest enemy, stack kept | |
| `acro_cap_A6b` | While drilling, contact damage to you −40% | |
| `acro_cap_Aw` | Each stripped layer flicks 2 acid chips at nearby enemies | |
| `acro_cap_B` / `_B3` | Breaching. Every hit is a lunge (140) hitting everything in the lane | |
| `acro_cap_Bc` / `_Bs` | Costs: −20% damage; you end up in the crowd. Shows: a pink smear down the lane | |
| `acro_cap_B6a` | Each enemy passed adds 10% to the next one's Corrosion fill (cap +100%) | |
| `acro_cap_B6b` | Lunging through an Acid Pool coats the cap: next 3 hits leave small Acid Pools | |
| `acro_cap_Bw` | At the end of a lunge, bounce back once down the same lane | |
| `acro_cap_C` / `_C3` | Hard hat. Each Shell layer you strip gives you 1 Shell layer (max 3) | |
| `acro_cap_Cc` / `_Cs` | Costs: −25% damage. Shows: pink bands on your head | |
| `acro_cap_C6a` | While you have Shell, your hits knock enemies back | |
| `acro_cap_C6b` | An enemy's contact hit on your Shell makes the cap hit back (once per 1 s) | |
| `acro_cap_Cw` | Losing your last layer bursts it as an Acid splash (Corrosion within 80) | |
| `acro_cap_M1` | Best with A. Every 4th hit strips a layer outright, or Corrodes a target with no Shell | |
| `acro_cap_M2` | Best with B. A lunge that kills lunges again to the nearest enemy (up to 6 in a row) | |
| `acro_cap_M3` | Best with C. Shell cap rises to 6; each layer carried adds +15% damage | |

#### 6.5 `acro_spray`

| ID | Facts | Your text |
|---|---|---|
| `acro_spray_A` / `_A3` | Point blank. +1 pellet per 40 units closer than 160 (max 7); pellets inside 60 fill Corrosion ×2 | |
| `acro_spray_Ac` / `_As` | Costs: −40% range. Shows: the fan thickens up close | |
| `acro_spray_A6a` | Two pellets on one target in a volley fuse into one hit at +50% | |
| `acro_spray_A6b` | Each volley's recoil pushes you back to the sweet spot | |
| `acro_spray_Aw` | Every 6th volley is a full ring around you | |
| `acro_spray_B` / `_B3` | Drizzle. Missed pellets land as small Acid Pools (2 s, max 8); touching pools merge | |
| `acro_spray_Bc` / `_Bs` | Costs: −20% direct damage. Shows: a field of pink speckles | |
| `acro_spray_B6a` | Enemies standing in your pools take +30% from your pellets | |
| `acro_spray_B6b` | A pellet landing in a pool grows it (up to radius 80) instead of making a new one | |
| `acro_spray_Bw` | Swimming through your own pool makes the next volley 3 rapid volleys | |
| `acro_spray_C` / `_C3` | Strip search. Pellets lean towards Shelled enemies and fill Corrosion +50% against Shell | |
| `acro_spray_Cc` / `_Cs` | Costs: ignores unshelled enemies while Shelled ones are near. Shows: pellets curving towards armour | |
| `acro_spray_C6a` | Stripping a layer gives a free volley (once per 1 s) | |
| `acro_spray_C6b` | A pellet hitting a Corroded enemy with no Shell carries on through it | |
| `acro_spray_Cw` | A pellet that strips a layer bounces to another Shelled enemy | |
| `acro_spray_M1` | Best with A. Point-blank pellets strip a layer outright (once per target per second) | |
| `acro_spray_M2` | Best with B. Your pools last until the wave ends (max 12) | |
| `acro_spray_M3` | Best with B and C. Volleys doubled, each pellet at 60% | |

#### 6.6 `acro_spark`

| ID | Facts | Your text |
|---|---|---|
| `acro_spark_A` / `_A3` | Flashpoint. +40% against Corroded targets; when the target stops being Corroded, the beam jumps to the next Corroded one | |
| `acro_spark_Ac` / `_As` | Costs: −30% against everything else. Shows: the beam flares on pink-ringed enemies | |
| `acro_spark_A6a` | +10% damage per Corroded enemy on screen (cap +100%) | |
| `acro_spark_A6b` | Setting off Premature Evaporation splits the beam into two for 2 s | |
| `acro_spark_Aw` | The beam's lane stays on fire for 1 s | |
| `acro_spark_B` / `_B3` | Spark gap. The beam chains from you to the nearest Corroded enemy, then on to the next (stronger on those strings). Shelled enemies it anchors on aren't burnt, so their Corrosion keeps building | |
| `acro_spark_Bc` / `_Bs` | Costs: only as long as your anchors; with none, an ordinary beam. Shows: a line of fire from you through the enemies | |
| `acro_spark_B6a` | A third Corroded enemy turns it into a triangle | |
| `acro_spark_B6b` | When an anchor dies, the beam whips to the next Corroded enemy within 200 | |
| `acro_spark_Bw` | The anchors are pulled towards each other | |
| `acro_spark_C` / `_C3` | Paint the slide. The beam points where you swim (260); swept enemies burn ×1.5 faster | |
| `acro_spark_Cc` / `_Cs` | Costs: no autoaim. Shows: burning lanes behind your path | |
| `acro_spark_C6a` | Turning sharply widens the beam for 0.5 s | |
| `acro_spark_C6b` | The beam's tip leaves short-lived fire behind it (1 s) | |
| `acro_spark_Cw` | While you stand still, it sweeps back and forth on its own | |
| `acro_spark_M1` | Best with A and B. A second beam on the second-best target | |
| `acro_spark_M2` | Best with A. Igniting a Corroded enemy half-fills the Corrosion bars of enemies within 80 | |
| `acro_spark_M3` | Best with C. The beam is twice as fast and twice as wide | |

## 7. Old Feats to bring back

`FEATS.md` section 4 re-specs 15 originals under v10 rules. **Correction (20 Oct):** an earlier count here said only 3 were built; the search used the old ids. The code (`feats10.js`) uses new ids, and 10 of the 15 are now built:

- **Built before 20 Oct (9):** Sofa Crevice, Anhydrobiosis, Formic Acid, Tonic Immobility, Hagfish, Shed the Lining, Running With Scissors, Vanishing Twin, Brown Fat. All but Hagfish and Running With Scissors are in the starting pool (`FEATS.md` 5).
- **Built 20 Oct (1):** Van de Graaff (`van_de_graaff`). In the starting pool since 20 Oct (`start: 1`; `FEATS.md` 5 updated). Its Lv 5 fork names and text are `TODO_COPY` (`FEATS.md` has none): larger store (16 bullets) and longer dome (×1.5).
- **Not built (5), each overlaps something:**
  - Capacitation: overlaps `acro_cap` B (lunge).
  - Bombardier Beetle: overlaps `acro_spray` A (Spread with recoil).
  - Wandering Womb: a second gravity well (Sofa Crevice).
  - Ear Candling: a lure (Eggs).
  - Spinnbarkeit: shared damage between tied enemies (Ewww, Gross).

## 8. Knock-on changes

- Roster grows to 27 weapons; "every weapon is exactly one sample's starter" still holds. Done 20 Oct: `SAMPLES.md` (section 9, roster, starters, unlock order), `BASE_WEAPONS.md` (rows 25 to 27, section 8: base stats and animation) and `WEAPON_UPGRADES.md` (sections 25 to 27: the branches, now their only home).
- Done 20 Oct: X9 added to `FEATS.md` section 3 (table and entry) and persona 9 to `CONSCIOUSNESS.md` (At a glance and section 9), both marked proposed, with `TODO_COPY` ids for the lines.
- Balance fix (20 Oct): `acro_spark` B (spark gap) first did almost nothing (it needed two Corroded enemies at once). Now it chains from you to the nearest anchor, then anchor to anchor; anchors include enemies with Corrosion building, and Shelled anchors aren't burnt. Test runs (2 minutes each): 292 to 669 damage with `acro_cap`, 327 to 419 with `acro_spray`, against about 630 to 790 for the base beam.
- Balance sim (20 Oct; mortal Petri Dish bot, ported `tests/sim/wave20.js`; no sample won a run): average wave reached, Private Schooled 12.5, Baseline 10.0, Redtail 9.8, Sample 9 7.5 (4 runs). After tuning (Feat penalty −25% for 4 s, cap 26, spray 6): Sample 9 8.9 (8 runs: 10, 10, 10, 9, 9, 10, 8, 5). Its own three weapons still rarely carry: at most 13% of damage in a run; drafted weapons do most of the work.
- Sim 3 (20 Oct, after range stopped growing game-wide and Sample 9's weapons went to cap 34, spray 8, beam 4; 4 runs each): Sample 9 9, 5, 9, 5 (7.0); Baseline 15, 10, 14, 10 (12.3); Private Schooled 10, 10, 5, 2 (6.8); Redtail 16, 10, 10, 10 (11.5). Too noisy to rank at 4 runs: Private Schooled swung from 12.5 to 6.8 between sims. Sample 9's two early deaths both started with the spray.
- Big sim (20 Oct, same build as sim 3; 10 mortal runs each, average wave and spread): Baseline 12.0 (8 to 15), Private Schooled 11.6 (9 to 15), Redtail 10.0 (5 to 20, the only win), Sample 9 8.0 (5 to 10). Sample 9 is last by 2 to 4 waves and never passed wave 10 (4 of 10 reached it). By starter: cap 7.2 (4 runs), spray 8.3 (3), spark 8.7 (3): no starter is clearly the weak one. The cap carried two runs (61% and 38% of damage); the spray and the beam never made a run's top four, though runs holding the beam set off 115 to 137 evaporations.
- Weapon arena (20 Oct; invulnerable player, a steady crowd of 12: half unshelled, a third Shell 2, a fifth Shell 4; 60 s, 2 repeats; damage per second standing still / circling): cap 48 / 91, spray 33 / 54, beam 46 / 65; Acid Spit 50 / 62, Standard Issue 59 / 75, Nervous Wreck 54 / 124, Maximum Gains 49 / 53, Red Flagship 103 / 108. Pairs: cap + beam 58 / 102, spray + beam 89 / 91, cap + spray 47 / 90. Findings: the spray is the weakest weapon tested (Shell's flat 3 per layer eats small pellets); Sample 9's three short-range weapons compete for the same few enemies in reach, so pairs add little; Red Flagship is an outlier at about twice everything else.
- Big sim after the spray change (20 Oct; Sample 9 only, 10 mortal runs; references from the previous big sim): Sample 9 8.5 (5 to 14), up from 8.0, within the noise (spread 2.8). It passed wave 10 for the first time (14). By starter: spray 9.8 (5 runs), cap 7.3 (3), spark 7.0 (2). The spray carried one run (58% of damage). 3 of 10 runs still died at wave 5 (the first boss, The Plughole, a Sprinter), where no reference sample's worst run ended (their worst: Baseline 8, Private Schooled 9).
- Correction to the weapon arena (20 Oct): the first two arena runs let the player gain XP, so faster weapons levelled up mid-test and snowballed. Re-run at level 1 with XP frozen (3 repeats; standing still / circling): cap 54 / 55, spray (3 × 14) 36 / 38, beam 34 / 41; Acid Spit 41 / 42, Standard Issue 41 / 57, Nervous Wreck 49 / 78, Maximum Gains 40 / 39, Red Flagship 65 / 75. Pairs: cap + beam 46 / 68, spray + beam 40 / 59, cap + spray 57 / 73. Sample 9's three are now in line with the field (the beam slightly low: a 12-tick magazine against 30). The spray change was decided on the flawed numbers; at level 1 the spray now sits level with Maximum Gains.
- Code note: `fight.js` `corroded()` counts a Corrosion bar above 15% as Corroded, wider than the matrix's "visible state". `acro_spark`'s targeting works around it; decide whether the matrix or the code is right.
- Three cap exceptions need matrix lines: `acro_cap` M2 (6-lunge chain), `acro_cap` M3 (6 player Shell layers), `acro_spray` M2 (12 lasting pools).
- Build estimate: about 1 day per weapon with its 15 cards; half a day for the sample (body, passive, Feat, unlock); about 1 day for the 6 Feats. Build in the real repo on a session branch, with `TODO_COPY` placeholders until section 6 is filled.
