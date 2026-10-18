# Base Weapons

**Status: roster decision of 18 Oct 2026; names and sample starters revised the same day (section 5, decision 4). Docs only; the code pass is not done (section 6).** Damage types, reactions and attack-type rules live in `COMBAT_MATRIX.md`; this doc cites them and adds none. `WEAPONS.md` and `SIGNATURE_WEAPONS.md` are archived (`archive/`); this doc is the weapon source of truth.

The roster is **24 weapons**: 10 foundations (taken from the 42-weapon matrix) and 14 signatures (taken from the 26). **Every other weapon is archived (72, section 7).** Signature playstyle and visuals stay as in the current game; only the damage type changes, to the matrix types.

## 1. Roster

| # | Weapon | Damage type | Attack type | Starter for | Origin (archived-list id, code id) |
|---|---|---|---|---|---|
| 1 | Standard Issue | Force | Projectile | Baseline | M2, was "Knuckle Dragger"; "Nut Shot" until 18 Oct |
| 2 | Maximum Gains | Force | Spread | Alpha | M3, was "Broadside"; "Spray Gun" until 18 Oct |
| 3 | Nervous Wreck | Force | Contact | Beta | M1; "Nutcracker" until 18 Oct |
| 4 | Panic Button | Force | Burst | Baseline | M4; "Premature Detonation" until 18 Oct |
| 5 | Acid Spit | Acid | Projectile | Private Schooled | M8 |
| 6 | Red Flagship | Static | Beam | Alpha | M17; "Blue Screen" until 18 Oct |
| 7 | Nocturnal Emission | Mucus | Pool | Beta | M24; "Snot Trap" until 18 Oct |
| 8 | Little Prick | Blood | Projectile | Baseline | M26; "Red Needle" until 18 Oct |
| 9 | Rent Free | Alien | Projectile | Private Schooled | M32; "Ghost Load" until 18 Oct |
| 10 | Hot Mess | Fire | Pool | Ordered Online | M42, was "Burning Ground" |
| 11 | Family Ties | Force | Projectile (slow, gravity well; supernova) | Not of This World | `void`, shipped as "Toddler Gravity"; "Black Hole" until 18 Oct |
| 12 | Skill Issue | Force | Burst (knockback collisions) | Alpha | S11, `lard`, was "Lard Lobber" (confirmed); "Meat Missile" until 18 Oct |
| 13 | There Is No Spoon | Force | Projectile | Not of This World | S12, `siphon`; "Placental Siphon" until 18 Oct |
| 14 | Nappy Mines | Fire | Burst (delayed; leaves a burning patch) | Ordered Online | S2, `mines` |
| 15 | Soulmate Signal | Static | Beam (anchored) | Not of This World | S21, `twin`; "Twin Telepathy" until 18 Oct |
| 16 | Unwanted Contact | Static | Projectile (chaining) | Redtail | S10, `tesla`; "Static Cling" until 18 Oct |
| 17 | Ewww, Gross | Mucus | Projectile (shared damage) | Private Schooled | S7, `redtape`, was "Red Tape" (confirmed); "Sticky Situation" until 18 Oct |
| 18 | Blowing Bubbles | Mucus | Projectile (traps) | Ordered Online | S13, `bubble`, was "Bubble Wand" (confirmed) |
| 19 | One of These Days | Blood | Projectile (mark) | Beta | S8, `duedate`; "Due Date" until 18 Oct |
| 20 | Sister Cousin | Blood | Projectile (homing) | Redtail | S24, `seeker`; "Seeker Siblings" until 18 Oct |
| 21 | Peekaboo | Alien | Burst (reveal; Fear) | Prawn Again | S4, `peekaboo` |
| 22 | Eggs | Alien | Burst (smite) | Prawn Again | S14, `toothfairy`; "Tooth Fairy" until 18 Oct |
| 23 | Chest Burster | Alien | Projectile | Prawn Again | S6, `parasite`; "Tapeworm Seeder" until 18 Oct |
| 24 | The Runs | Fire | Pool (trail) | Redtail | S3, `wake`, was "Pub Crawl" (shipped as "Skid Mark") |

| Damage type | Weapons | | Attack type | Weapons |
| --- | --- | --- | --- | --- |
| Force | 7 | | Projectile | 12 |
| Alien | 4 | | Burst | 5 |
| Static | 3 | | Pool | 3 |
| Mucus | 3 | | Beam | 2 |
| Blood | 3 | | Contact | 1 |
| Fire | 3 | | Spread | 1 |
| Acid | 1 | | | |

## 2. The 10 foundational weapons (animation specs)

Simple, repeatable animations. They teach what each delivery type looks like before signatures add complexity. Each has no mechanic beyond its damage type and attack type. Reactions: `COMBAT_MATRIX.md` (this doc adds none).

### 1. Standard Issue (Force, Projectile)
The dependable single-target workhorse. A simple, heavy shot that makes a good baseline for upgrades and comparisons.
- **Shape:** a small, hard, nut-like pellet with a slightly lopsided shell and a blunt tip. It reads as a tiny projectile, not a literal anatomical close-up.
- **Motion:** shoots straight with a quick, confident snap and a short chunky trail.
- **Impact:** a sharp thwack flash and a tiny enemy squash. Keep the hit effect brief.

### 2. Maximum Gains (Force, Spread)
Reliable crowd damage. A different targeting footprint from the single projectile, without a complex mechanic.
- **Shape:** a fan of several small, blunt, pale force pellets, clearly separate rather than one broad cloud.
- **Motion:** pellets burst outward in a consistent cone, with the outer shots diverging visibly.
- **Impact:** multiple small impact pips. At close range the fan converges into a satisfyingly dense hit.

### 3. Nervous Wreck (Force, Contact)
A straightforward close-range answer to enemies that get too near.
- **Shape:** a hard, chunky contact strike, suggested by two blunt force shapes snapping together around the impact point.
- **Motion:** a quick clamp-like snap or body-check when an enemy enters contact range.
- **Impact:** a brief star-shaped thump and enemy recoil. Readable without obscuring the sperm.

### 4. Panic Button (Force, Burst)
An area-impact baseline: a direct burst attack without the setup of a signature weapon.
- **Shape:** a compact pressure knot that flashes into a blunt circular shockwave.
- **Motion:** a very short swell, then an immediate outward pulse.
- **Impact:** a crisp expanding ring with a few chunky fragments of light; enemies visibly pop or stagger away from the centre.

### 5. Acid Spit (Acid, Projectile)
A simple delivery mechanism for the Acid damage identity.
- **Shape:** a shocking-pink glob with a slightly uneven, saliva-like surface.
- **Motion:** a small wobble in flight and a few tiny droplets that fall away; no long continuous trail.
- **Impact:** a wet splat, then a brief fizz or bubbling mark where corrosion is applied.

### 6. Red Flagship (Static, Beam)
Sustained damage along a line, and a baseline for the more elaborate electrical signatures.
- **Shape:** a thin, bright electrical line with a jagged inner core and a few angular forks.
- **Motion:** the beam flickers rapidly but stays anchored and easy to track; small pulses travel along it.
- **Impact:** quick yellow-white snaps on enemies. Branching only where the mechanic actually chains, so it never looks like Unwanted Contact.

### 7. Nocturnal Emission (Mucus, Pool)
A simple area-control weapon that sticks enemies crossing its patch.
- **Shape:** a flattened, glossy green mucus puddle with a thick rim and a few slow surface bubbles.
- **Motion:** the pool spreads slightly when placed, then settles into a gently wobbling patch.
- **Impact:** enemies crossing it stretch or drag for a beat, with a short elastic strand snapping back to the puddle.

### 8. Little Prick (Blood, Projectile)
A clean, precise delivery option for Blood. Chosen over Bloodletter to keep the foundation from leaning on contact attacks.
- **Shape:** a thin, dark-red needle with a brighter red tip; visibly much narrower than the Force projectile.
- **Motion:** a fast, precise dart with almost no trail.
- **Impact:** a tiny red pinprick flash. If it applies a Blood status, a small pulsing mark, not a large blood spray.

### 9. Rent Free (Alien, Projectile)
A simple spectral attack that establishes Alien without echoes, summons or other advanced mechanics.
- **Shape:** a pale, translucent spirit-kernel with a soft inner silhouette, like a tiny ghost folded into a pellet.
- **Motion:** glides rather than tumbles; its edges lag a fraction behind the core.
- **Impact:** the projectile briefly passes through a ghostly afterimage before fading. Eerie, not smoky or explosive.

### 10. Hot Mess (Fire, Pool)
A straightforward persistent damage zone, a baseline for more elaborate Fire mechanics.
- **Shape:** an irregular, orange-red burning patch with a bright centre and a few low tongues of flame.
- **Motion:** splashes onto the surface, spreads a little, then burns in place with a low, restless flicker.
- **Impact:** enemies crossing it briefly glow at the feet and leave a few sparks. Stationary pool, never a movement trail, so it stays distinct from The Runs.

## 3. The 14 signatures

Playstyle is from the user (18 Oct 2026). Mechanics are carried over from the archived `archive/SIGNATURE_WEAPONS.md`; rules cited as `11.x` or `12.x` are sections of `COMBAT_MATRIX.md`. Start stats are starting points for sims.

### 11. Family Ties (`void`, shipped as "Toddler Gravity")
- **Playstyle:** Spatial control, accumulation and explosive payoff. Pulls enemies and bends projectiles; merging orbs can culminate in a supernova.
- **Is:** Force, a slow Projectile (speed 115) that pierces everything, with the **gravity well** modifier (radius 72): it pulls enemies in and bends every shot that passes near it, so your other weapons' shots curve into the crowd it is gathering.
- **Signature:** two black holes that touch merge into a bigger one. Five merged go supernova: one Burst, and the hole is gone.
- **Limits:** gravity well modifier (`MODIFIERS.md` 19) and the Pull rule (12.2); a merged hole is one well with a bigger radius (up to 140), so merging never breaks the 3-well cap; merges cap at 5 (it was 20). Moved from Alien to Force because gravity is displacement, and Alien is now mind control.
- **Start stats:** 8 damage, 1.8 s cooldown, pull strength 95.

### 12. Skill Issue (`lard`, was "Lard Lobber")
- **Playstyle:** Collision engineering and crowd manipulation. Turns knockback into collisions that bowl enemies into one another.
- **Is:** Force, Burst (lobbed, radius 66). Dollops of lard send everything flying.
- **Signature:** an enemy sent flying that hits a mate knocks that mate flying too, and both take the 40% collision damage: STRIKE.
- **Limits:** bounded chain (12.5): each flying enemy knocks one more, once (depth 2). Squishy halves the knockback as usual.
- **Start stats:** 14 damage, 1.2 s cooldown, 3 per load.

### 13. There Is No Spoon (`siphon`)
- **Playstyle:** Defensive conversion and retaliatory damage. Eats incoming bullets and fires them back.
- **Is:** Force, Projectile. Eats enemy bullets within 90 of you and fires them back as hard as they hit you.
- **Signature:** it rewards a busy screen; with nothing to eat it dribbles a weak spit.
- **Limits:** projectile blocking rule (12.8). Stores up to 10 bullets. A returned bullet keeps its **original damage type**, so it can fill bars and set off reactions.
- **Start stats:** 15 damage (spit), 40 per load, fires every 0.08 s while stocked.

### 14. Nappy Mines (`mines`)
- **Playstyle:** Retreat, route planning and delayed area denial. Lays delayed mines behind the sperm, leaving a burning patch after detonation.
- **Is:** Fire, Burst with delayed detonation (Fire from the start, user decision 18 Oct 2026; was Acid). Drops proximity mines behind you (blast radius 72, life 14 s).
- **Signature:** each blast fills the Burn bar of what it hits and leaves a small burning patch (a Fire Pool footprint, radius 40, 2 s: not a world object, decision 27). Domino upgrade: a blast sets off other mines in range, up to **3 mines** per chain.
- **Limits:** the Nuclear Nappy upgrade (every 6th mine, 3× radius and 6× damage) stays as its level-10 mastery and counts as one Burst; its patch is the normal size.
- **Start stats:** 34 damage, 0.7 s between mines, 5 per load, 2.4 s reload.

### 15. Soulmate Signal (`twin`)
- **Playstyle:** Spatial geometry and movement mastery. The beam between you and your twin turns movement and positioning into an attack.
- **Is:** Static, Beam with the anchored-beam and sweep modifiers. Your twin mirrors you across an anchor on the crowd (range 520), and a beam (width 10) always joins the two of you.
- **Signature:** swim to drag the beam through the crowd. Every enemy it touches is Charged, and Charged enemies on the beam pass arcs on (3 jumps, 70% falloff), so a crowded lane lights up.
- **Limits:** the twin is not a pet: it can't be hit and only carries the beam. Each enemy is hit at most every 0.1 s.
- **Start stats:** 24 damage, 1.6 s cooldown, 3 per load.

### 16. Unwanted Contact (`tesla`)
- **Playstyle:** Chain reactions and weapon-to-weapon synergy. Chains electricity through enemies and lets other weapons exploit Charged targets.
- **Is:** Static, Projectile with the chaining modifier (3 jumps, range 140).
- **Signature:** every enemy it hits is Charged. Your **other** weapons' hits on a Charged enemy arc too (the old "powers every other weapon"), within the usual 3-jump limit.
- **Limits:** an arc never starts another arc on the same target; jump falloff is 70% (11.5).
- **Start stats:** 13 damage, 0.7 s cooldown, 6 per load.

### 17. Ewww, Gross (`redtape`, was "Red Tape")
- **Playstyle:** Exploiting relationships and concentrating damage. Links enemies so damage to one is shared with the others.
- **Is:** Mucus, Projectile. Stamps a target and tapes it to up to 3 neighbours within 170 for 5 s.
- **Signature:** damage to one of the bundle is shared with the rest (35%). Being taped counts as Conjoined: the bundle cannot move apart.
- **Limits:** the shared 35% is echo damage (12.1): it never fills bars, sets off reactions or shares on again.
- **Start stats:** 18 damage, 1.4 s cooldown, 3 per load.

### 18. Blowing Bubbles (`bubble`, was "Bubble Wand")
- **Playstyle:** Incapacitation and tactical detonation. Traps small enemies in bubbles that burst when touched.
- **Is:** Mucus, Projectile (slow bubbles).
- **Signature:** a bubble traps a small enemy (up to 34 max health): it is fully Snared and cannot attack. Anything touching the bubble (you, an enemy, a shot) pops it, and the pop is a small Burst that hits everything near except the trapped one.
- **Limits:** never traps elites or bosses; a trap lasts 5 s at most.
- **Start stats:** 18 damage, 1.1 s cooldown, 4 per load.

### 19. One of These Days (`duedate`)
- **Playstyle:** Sustained focus and delayed damage payoff. Marks a tough enemy and returns a portion of the damage it took when the countdown ends.
- **Is:** Blood, Projectile. Sticks a 4 s countdown on a big target (it prefers TOUGHEST).
- **Signature:** when the countdown ends, the target takes 40% of everything it took while marked, all over again. If it dies early, the stored damage bursts onto enemies nearby.
- **Limits:** the repeat is echo damage (12.1). One One of These Days per target.
- **Start stats:** 20 damage, 0.9 s cooldown, 3 per load.

### 20. Sister Cousin (`seeker`)
- **Playstyle:** Autonomous targeting and kill-chain escalation. Homing shots target enemies and split after a sibling scores a kill.
- **Is:** Blood, Projectile with the homing and multiplying modifiers. Two homing siblings per shot (turn rate 5).
- **Signature:** they never miss (Evasion still applies), and a sibling that kills splits into two smaller siblings (50% damage) that home on the next targets. Their hits Bleed.
- **Limits:** split siblings never split again; at most 12 siblings in flight.
- **Description:** "Tiny homing siblings who swim for you and never miss. Family is complicated."
- **Start stats:** 9 damage, 0.45 s cooldown, 6 per load.

### 21. Peekaboo (`peekaboo`)
- **Playstyle:** Deception and crowd manipulation. Disappears, manipulates enemy pursuit, then reveals itself and applies Fear.
- **Is:** Alien, Burst. Every 5.5 s you vanish for 1.8 s, then BOO (radius 230).
- **Signature:** while you're hidden, enemies lose you and swarm your last spot; their shots there can hit each other. The BOO applies **Fear** to everything in range and hits harder the more enemies were searching for you.
- **Limits:** player hiding rule (12.4). Fear lasts 2 s. BOO damage bonus is capped at +100% (from 10 searching enemies).
- **Start stats:** 20 damage, 5.5 s cooldown, hidden 1.8 s.

### 22. Eggs (`toothfairy`)
- **Playstyle:** Prediction, baiting and delayed payoff. Baits enemies with spectral eggs and punishes them when they approach.
- **Is:** Alien, Burst (the smite).
- **Signature:** drops spectral eggs near the crowd. Greedy enemies within 230 swim off to grab one; the egg smites whoever takes it, harder the longer it waited (Lv 3, promise C).
- **Limits:** lures rule (12.6): at most 3 eggs on the ground; each lasts 6 s. Bosses ignore eggs. Draw them small, ghostly and nothing like the egg you are racing to, so the two never get confused.
- **Start stats:** 34 damage, 1.1 s cooldown, 3 per load.

### 23. Chest Burster (`parasite`)
- **Playstyle:** Army building and self-reinforcing combat. Turns infected enemies into allied fighters after death.
- **Is:** Alien, Projectile. Fast shots infect (8 s).
- **Signature:** an infected enemy that dies rises as an undead ally for a few seconds and fights for you. Possessed after death: the purest Alien weapon.
- **Limits:** pets rule (12.3); at most **4 undead** at once; each lasts 6 s.
- **Start stats:** 12 damage, 0.4 s between shots, 8 per load.

### 24. The Runs (`wake`, was "Pub Crawl", shipped as "Skid Mark")
- **Playstyle:** Weaponised movement and pursuit manipulation. Leaves a burning trail behind the sperm.
- **Is:** Fire, Pool laid as a trail. No aiming: you shed a boozy trail wherever you swim. Alcohol burns.
- **Signature:** the trail (Skid Mark's shipped trail, now Fire) burns whatever wades through it, filling its Burn bar. Swim circles round a crowd to set the whole thing alight.
- **Limits:** trail pieces count towards the 40-object cap; the oldest piece goes first. Mucus (Snared) puts burning enemies out, as usual.
- **Start stats:** 20 damage, each piece lasts 2.2 s, width 22.

## 4. Why these 24 together

- **Foundations teach, signatures twist.** Every damage type has a foundation; every foundation is one attack type with no extra rule. The Fire foundation (Hot Mess) is a stationary Pool so The Runs (a trail) stays distinct.
- **Echo and chain rules still apply** to Ewww, Gross, One of These Days, Unwanted Contact, Family Ties and Skill Issue (`COMBAT_MATRIX.md` 11.5, 12.5, echo damage).

## 5. Decisions (18 Oct 2026) and open issues

Decided:
1. **Sticky Situation** is the weapon (was Red Tape; renamed Ewww, Gross in decision 4). The Static + Mucus reaction is renamed **Snot Socket** in `COMBAT_MATRIX.md`. `combos.js` also has a Weapon Combo called Sticky Situation; rename it in the code pass.
2. **Renames confirmed:** Meat Missile (was Lard Lobber), Sticky Situation (was Red Tape), Blowing Bubbles (was Bubble Wand), The Runs (was Pub Crawl).
3. **Sample starting weapons** (first pass, superseded by decision 5): each sample started with one foundation weapon.
4. **Renames (user, 18 Oct):** fifteen weapons renamed to fit their sample. Was: Nut Shot, Red Needle, Premature Detonation, Blue Screen, Spray Gun, Meat Missile, Snot Trap, Nutcracker, Due Date, Ghost Load, Sticky Situation, Static Cling, Seeker Siblings, Twin Telepathy, Placental Siphon, Black Hole, Tapeworm Seeder, Tooth Fairy (Eggs: the teeth become spectral eggs). Card names that punned on an old name (Blue Screen of Death, Nut Allergy, Infinite Nuts) stay for now.
5. **Three unique starters per sample (user, 18 Oct).** Every one of the 24 weapons is exactly one sample's starter; none is shared. The level 1 weapon draft (`UPGRADES.md` 4) offers that sample's three, and you take one. The other two stay in the pool for the later drafts, as do the other samples' starters. Full kits, jokes and upgrade fantasies: `SAMPLES.md` ("Starting weapons").

| Sample | Starters (type, attack) |
|---|---|
| Baseline | Standard Issue (Force Projectile), Little Prick (Blood Projectile), Panic Button (Force Burst) |
| Alpha | Red Flagship (Static Beam), Maximum Gains (Force Spread), Skill Issue (Force Burst) |
| Beta | Nocturnal Emission (Mucus Pool), Nervous Wreck (Force Contact), One of These Days (Blood Projectile) |
| Private Schooled | Acid Spit (Acid Projectile), Rent Free (Alien Projectile), Ewww, Gross (Mucus Projectile) |
| Ordered Online | Hot Mess (Fire Pool), Nappy Mines (Fire Burst), Blowing Bubbles (Mucus Projectile) |
| Redtail | The Runs (Fire Pool trail), Unwanted Contact (Static Projectile), Sister Cousin (Blood Projectile) |
| Prawn Again | Chest Burster (Alien Projectile), Peekaboo (Alien Burst), Eggs (Alien Burst) |
| Not of This World | Soulmate Signal (Static Beam), There Is No Spoon (Force Projectile), Family Ties (Force Projectile) |

Still open:
4. **Thin attack types.** Contact (Nervous Wreck) and Spread (Maximum Gains) have one weapon each, and Fire has only Pool and Burst weapons. Acid now has a single weapon (Acid Spit), since Nappy Mines became Fire. Since decision 5 every attack type is some sample's starter. Recommendation: accept for now; the next additions should be a Fire Projectile or Spread and a second Contact.
5. **The 5 Fire drafts are archived** (Heartburn, Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation). Re-check any enemy or reaction design that assumed a Fire Beam, Contact or Burst weapon. Redtail's "starts chain reactions in crowds" rests on The Runs and Unwanted Contact.
6. **Ordered Online has no Acid starter.** Its types are Mucus and Acid, but its kit is Hot Mess (Fire), Nappy Mines (Fire) and Blowing Bubbles (Mucus); its Acid comes only from its Feat (Shrink Wrap). The brief asks for Hot Mess to look like "a violently reactive, corrosive slick" for this sample, but a Fire pool drawn as Acid breaks the damage-type look (`DAMAGE_TYPES.md`), and corrosive slicks are a cut ground object (matrix decision 27). Options: (a) make Hot Mess an Acid Pool everywhere (Acid gets 2 weapons, Fire loses its foundation and Hot Mess's Burn upgrades need rewriting); (b) keep Hot Mess Fire and change Ordered Online's types to Mucus / Fire. Recommendation: (b), the smaller change.
7. **Not of This World's weapons are Static, Force and Force**, while its passive shifts its type between Fire, Alien and Static. `SAMPLES.md` now says its three starters deal the active type; There Is No Spoon's returned bullets keep their own type (12.8). Needs a matrix line if kept.

## 6. Code pass (not done)

About one session. The v10 prototype is on this branch (`v10.js`, `sigweap.js`).
1. Archive: restrict `v10Ids()` (`v10.js`) to the 10 foundation ids and the signature list in `sigweap.js` to the 14. Keep every definition in the code; add an `archived` flag so the Lab Bench can still spawn them.
2. Rename in the data (decision 4 names): Knuckle Dragger, Broadside, Burning Ground, Lard Lobber, Red Tape, Bubble Wand, Pub Crawl (`V10_NAMES`, `sigweap.js`).
3. Sample starters (decision 5): `samples10.js`, and the level 1 weapon draft offers the sample's three.
4. New animations for the 10 foundations (section 2) in `render.js`/`typefx.js`, following `STYLE.md` and the redesign's visual language.
5. Fix any combo, Feat or tutorial text naming an archived weapon; update `GAME_GUIDE.md` and tests.

## 7. Archived weapons (72)

Kept in the docs and the code; not in the game. Full text in `archive/WEAPONS.md`.

**Matrix (32):** M5 Hard Press, M6 Pressure Drop, M7 Corrosive Bite, M9 Sour Spray, M10 Caustic Reaction, M11 Dissolving Relationship, M12 Acid Reflux, M13 Shock Jab, M14 Zap Seed, M15 Forked Tongue, M16 Power Surge, M18 Live Wire, M19 Snot Knuckle, M20 Gobstopper, M21 Snotgun, M22 Gunk Bomb, M23 Snot Stream, M25 Bloodletter, M27 Bloodshot, M28 Bloodbath, M29 Bloodline, M30 Blood Pool, M31 Spirit Slap, M33 Soul Scatter, M34 Soul Purpose, M35 Wraith Ray, M36 Haunted Ground, M37 Hot Touch, M38 Hot Shot, M39 Cinderblast, M40 Firecracker, M41 Flame Jet.

**Signature (12):** Premature Evangelation, Leeches, Upchuck, Blood Blister, Thorny Onesie, Flagellum Flail, Nose Goblins, and the five Fire drafts (Heartburn, Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation).

**Parked originals (28):** Spitball, Hiccup Scattergun, Yo-Yo Diet, Booger Flick, Morning Sickness, Placenta Paddle, Colouring In, Imaginary Friend, Baby Rattle, Little Swimmers, Gut Punch, Ulcer Moons, Achoo, Bogey Roller, Runny Nose, Static Hairbrush, Carpet Shuffle, Lightning Bugs, Grubby Fingers, Whooping Cough, Cradle Cap, Butter Knife, Head Lice, Paper Cut, Spirit Fingers, Waters Breaking, Bath Bomb, Sea Monkeys. Shipped-game weapons that no redesign doc lists (for example Gene Gun, Karma, Duelling Banjo and most of the Playpen set) are archived too.
