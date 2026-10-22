# Sperm Passives

**Status: working draft, 22 Oct 2026. Docs only; nothing is built.** Decided with the user in a design session on 22 Oct. **Sperm passives replace the Genome slots**: the body, damage-type, trade-off and rare mutations of `MUTATIONS.md` (sections 2, 4, 5 and 6) and the defence cards were re-sorted into this list, one by one. Weapon mutations (`MUTATIONS.md` 3) were folded into `MODIFIER_MATRIX.md` instead. Combat rules stay in `COMBAT_MATRIX.md`; this doc cites them.

Names in quotes are existing card names; new passives carry a `TODO_COPY` id until the user writes their names. Numbers are starting values for sims.

## 1. Rules

1. **What they are.** A sperm passive applies to the sperm itself and affects every weapon it carries. Weapon modifiers (`MODIFIER_MATRIX.md`) apply to one weapon.
2. **Slots unlock with run level:** 2 at the start, then +1 at Lv 8, 16 and 24 (5 in all). Defences take these slots too; a built-in defence (from a sample, weapon or Feat) uses none.
3. **Levels:** 3 levels, then one mastery (no branches; the one exception is the push/pull field, 2.6, where the user asked for a branch). Picking a passive you already hold levels it up instead of using a slot.
4. **Masteries:** one sperm passive mastery per build, separate from the one weapon modifier mastery. **Extra Mastery** adds one more of either kind.
5. **Trade-offs:** the benefit grows with each level; the cost stays fixed.
6. **Pairs:** two specific sperm passives held together unlock a bonus (section 3). The draft favours the second half once you hold the first (+50% weight), as for weapon pairs.
7. **Card rule kept from `MUTATIONS.md`:** every passive changes a decision, makes a visible event or enables a synergy; a bare stat is a level, never a card of its own.

## 2. The passives (30)

### 2.1 Movement and offence

| Passive | Lv 1 | Lv 2 and 3 | Mastery |
|---|---|---|---|
| The Runs (was a weapon; also shipped as "Skid Mark") | You shed a trail as you swim, in **your sample's primary damage type** (the first type listed in `SAMPLES.md`; for Not of This World, its active type). A Pool trail: one piece per 30 swum, 2.2 s, width 22; counts towards the object cap. A passive that changes damage type changes the trail too (user, 22 Oct). | Lv 2: pieces last 50% longer and are 50% wider. Lv 3: +50% damage. | Close a loop of trail and everything inside it takes the trail's damage type. |
| "Slipstream" (absorbs "Hard to Hold") | Swim speed builds while you keep moving, up to +20% after 3 s; taking damage resets it. | Lv 2: up to +30%. Lv 3: up to +40%, and a hit no longer resets it: it boosts you instead, with half damage from Contact hits for 1.5 s (Hard to Hold). | At full speed, enemy Contact hits do half damage. |
| "Heartbeat" | Every 3 s, a Force Burst round you; radius 60 at empty health to 120 at full. | Every 2.5 s, then every 2 s, with more damage. | The burst takes your sample's damage type. |
| "Overexcited" | 5 kills within 2 s of each other give +30% attack speed for 3 s. | +45%, then +60%. | The streak never drops while a boss is alive. |
| "Group Project" (was rare) | When two different weapons hit the same enemy within 0.5 s, the second hit deals +30%. | +45%, then +60%. | The window is 1 s, and the visual shows which pair hit. |
| "Growing Pains" (was rare) | Each level-up lets off a Force Burst round you, and enemy Contact hits can't hurt you for 1 s. | Burst +50% and immunity 1.5 s; then burst +100% and 2 s. | The burst heals you 5% per enemy hit (cap 25%). |
| `TODO_COPY:sp_pools` (was "Leave a Little Something") | Every pool you make (weapons, Feats, reactions) lasts 50% longer and gives one last tick at double damage as it ends. | +75%, then +100% duration. | The last tick is triple damage. |

### 2.2 Survival (defences and health)

| Passive | Lv 1 | Lv 2 and 3 | Mastery |
|---|---|---|---|
| Membrane Shield (the Membrane defence, `DEFENCE_TYPES.md`) | A regenerating membrane bubble round the sperm (Membrane rules: blue bubble, strong recharge tell). | Lv 2, Expansion: a wider shield radius. Lv 3, Rapid Recovery: a shorter recharge. | **Internal Ricochet:** your own projectiles bounce off the inside of the membrane instead of escaping. A high-level transformation, because it changes how every weapon works. |
| Squishy (defence) | Knockback taken -50%; you squash on hit. | -65%, then -80%. | You squash through gaps between enemies; Contact hits while squeezing do half damage. |
| Shell (defence) | 1 armour layer: cuts each hit by a flat amount; lost layers are gone for good. | 2, then 3 layers. | A lost layer regrows once per wave. |
| Thorns (defence) | Enemies that hit you with Contact take 20% of it back. | 35%, then 50%. | Thorns also answers enemy bullets that hit you, at half. |
| Evasion (defence) | 10% of Projectile, Spread and Contact hits miss you. | 15%, then 20% (capped low so it never feels random). | After an evade, your next hit within 1 s deals +50%. |
| "Extra Padding" | +10% max health; at full health, half the bonus becomes a temporary Membrane. | +20%, then +30%. | Overflow healing becomes Membrane. |

### 2.3 Damage types (one each, plus one for reactions)

| Passive | Type | Lv 1 | Lv 2 and 3 | Mastery |
|---|---|---|---|---|
| "Hit Them Harder" | Force | +50% knockback on enemies already knocked back in the last 1 s. | +75%, then +100%. | An enemy knocked back twice in 1 s takes 40% collision damage when it lands. |
| `TODO_COPY:sp_acid` (new) | Acid | When an enemy's Shell breaks, 30% of its Corrosion splashes onto enemies within 80. | 45%, then 60%. | A broken Shell leaves the enemy taking +20% from everything for 3 s. |
| "Pass It On" | Static | When Charged runs out on an enemy, 30% chance it passes to the nearest enemy within 110 (once per Charge). | 45%, then 60%. | It always passes (still once per Charge). |
| "Stickier" | Mucus | Snared lasts 50% longer; status bars fill 25% faster on Snared enemies. | +75%, then +100% Snare time. | Snared enemies can't be knocked out of a pool or puddle. |
| "Bad Blood" | Blood | Blood pools from bleeding deaths are 50% bigger and make enemies standing in them Bleed. | +75%, then +100%. | Enemies dying in a blood pool add to it instead of making a new one. |
| "Come Out of There" | Alien | An enemy killed while Possessed or building Alien has a 25% chance to leave a wisp: collect it to heal 3% or gain +20% attack speed for 3 s. | 35%, then 45%. | Wisps fly to you by themselves. |
| `TODO_COPY:sp_fire` (new) | Fire | An enemy that dies burning sets 1 neighbour alight. | 2, then 3 neighbours. | Burning enemies that touch each other share their Burn. |
| "Crossed Wires" | Any | Every reaction you have discovered deals 25% more; its lockout drops from 1.5 s to 1 s. | +40%, then +55%. | Lockout 0.5 s. |
| "Conductive Mess" (was rare) | Static + Blood | A Charged enemy standing in a blood pool Charges every other enemy in the same pool. | The pool's Charge spreads 2, then 3 times. | Charged enemies in the pool also Bleed. |

### 2.4 Trade-offs (benefit grows, cost fixed)

| Passive | Lv 1 | Lv 2 and 3 | Cost (fixed) | Mastery |
|---|---|---|---|---|
| "Big Brain" (absorbs "No Time for Being Careful") | +25% damage. | +35%, then +45%. | -20% max health. | Above 70% health, +20% more damage, and the health cost becomes a Membrane instead. |
| "Can't Sit Still" | +20% attack speed while swimming. | +30%, then +40%. | -20% while still or very slow. Never offered to Alpha. | No penalty while a Feat is running. |
| "All at Once" | The first hit on an enemy you haven't hit for 3 s deals +60%. | +80%, then +100%. | Your other hits on it deal -20% for 3 s. | The penalty goes away. |
| "Hungry Hungry" | +30% XP (so passive slots open sooner). | +45%, then +60%. | Enemies spawn 20% faster. | The extra enemies drop double XP. |

### 2.5 Rules-changers

| Passive | Lv 1 | Lv 2 and 3 | Mastery |
|---|---|---|---|
| Extra Mastery | One more mastery of either kind (weapon modifier or sperm passive). Takes a slot; that slot is its whole cost. | None: a single level. | None. |
| Advanced Targeting (moved from weapon modifiers) | An ordered list of 2 targeting rules for your weapons (menu: nearest, toughest, weakest, fastest, densest cluster, elite first, nearest threat, not yet afflicted). | Lv 2: 3 rules. Lv 3: each weapon's own step (`MODIFIER_MATRIX.md` 6.1). | Each weapon's specialty, such as different shots to different foes (`MODIFIER_MATRIX.md` 6.1). Uses the sperm passive mastery. |

### 2.6 Fields (the one passive with a branch)

| Passive | Lv 1 | Lv 2 (branch) | Lv 3 | Mastery |
|---|---|---|---|---|
| `TODO_COPY:sp_field` (new) | A field round the sperm (radius 80) gently pushes enemies away (40 a second; the Pull rule's numbers reversed, 12.2: Squishy halves it, elites 50%, bosses 25%, never through walls). | **A, Repel:** the push doubles, and an enemy pushed out of the field is staggered for 0.3 s. **B, Attract:** the field flips and pulls enemies in instead (for melee, Contact and aura builds). | A: radius 110, and enemies pushed into each other collide (40%). B: radius 110, and enemies pulled close are slowed 20%. | A: enemy bullets entering the field slow by 50%. B: enemies pulled within 60 take +20% from your Contact and Burst hits. |

## 3. Sperm passive pairs

| Pair | Name | Bonus |
|---|---|---|
| "Stickier" + "Hit Them Harder" | "Come Closer" (was a rare mutation) | Snared enemies take +25% Force damage, and a Force hit on one pulls the other Snared enemies within 80 towards it (Pull rule, 12.2). |
| "Come Out of There" + "Crossed Wires" | "Death Is Recycling" (was a rare mutation) | A wisp you don't collect flies to the nearest enemy and fills 25% of its Alien bar. Wisp kills never release wisps. |

## 4. Cut in the re-sort
"Spare Parts", "Personal Space", "Quantity Over Quality" (Rapid Fire and Extra Projectiles cover it per weapon), and from the weapon mutations "Reachy" and "Through and Through" (Piercing covers it). "No Time for Being Careful" and "Hard to Hold" were merged (above).

## 5. Follow-ups in other docs
1. **`UPGRADES.md`** still describes Genome slots (4, shared) and weapon mutations (max 3 per weapon). Both are replaced: sperm passive slots here, weapon modifier slots in `MODIFIER_MATRIX.md` (5, one per group, unlocking with weapon level).
2. **`MUTATIONS.md`** is superseded by this doc and the modifier matrix; its card lines (the consciousness's voice) stay the source for copy.
3. **`BASE_WEAPONS.md`**: The Runs leaves the weapon roster.
4. **Copy:** `TODO_COPY:sp_pools`, `TODO_COPY:sp_acid`, `TODO_COPY:sp_fire` and `TODO_COPY:sp_field` need names and lines; Membrane Shield, Extra Mastery and Advanced Targeting need card text.

## 6. Open questions
1. (Answered 22 Oct: The Runs takes the sample's primary damage type.) Which passive can change its type? No sperm passive changes damage type yet, and Switched at Birth is a weapon modifier.
2. Extra Mastery as a single level: fine, or should it have levels too?
3. With defences now competing for 5 slots, will players skip them entirely? Watch in sims.
