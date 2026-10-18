# Base Weapons

**Status: roster decision of 18 Oct 2026. Docs only; the code pass is not done (section 6).** Damage types, reactions and attack-type rules live in `COMBAT_MATRIX.md`; this doc cites them and adds none. Full signature detail stays in `SIGNATURE_WEAPONS.md`; the full catalogue in `WEAPONS.md`.

The roster is **24 weapons**: 10 foundations (taken from the 42-weapon matrix) and 14 signatures (taken from the 26). **Every other weapon is archived (72, section 7).** Signature playstyle and visuals stay as in the current game; only the damage type changes, to the matrix types.

## 1. Roster

| # | Weapon | Damage type | Attack type | Source (WEAPONS.md id, code id) |
|---|---|---|---|---|
| 1 | Nut Shot | Force | Projectile | M2, was "Knuckle Dragger" |
| 2 | Spray Gun | Force | Spread | M3, was "Broadside" |
| 3 | Nutcracker | Force | Contact | M1 |
| 4 | Premature Detonation | Force | Burst | M4 |
| 5 | Acid Spit | Acid | Projectile | M8 |
| 6 | Blue Screen | Static | Beam | M17 |
| 7 | Snot Trap | Mucus | Pool | M24 |
| 8 | Red Needle | Blood | Projectile | M26 |
| 9 | Ghost Load | Soul | Projectile | M32 |
| 10 | Hot Mess | Fire | Pool | M42, was "Burning Ground" |
| 11 | Black Hole | Force | Projectile (slow, gravity well; supernova) | S5, `void`, shipped as "Toddler Gravity" |
| 12 | Meat Missile | Force | Burst (knockback collisions) | S11, `lard`, was "Lard Lobber" (rename to confirm, issue 2) |
| 13 | Placental Siphon | Force | Projectile | S12, `siphon` |
| 14 | Nappy Mines | Acid | Burst (delayed; leaves Acid Pools) | S2, `mines` |
| 15 | Twin Telepathy | Static | Beam (anchored) | S21, `twin` |
| 16 | Static Cling | Static | Projectile (chaining) | S10, `tesla` |
| 17 | Sticky Situation | Mucus | Projectile (shared damage) | S7, `redtape`, was "Red Tape" (rename to confirm, issue 1) |
| 18 | Blowing Bubbles | Mucus | Projectile (traps) | S13, `bubble`, was "Bubble Wand" (rename to confirm) |
| 19 | Due Date | Blood | Projectile (mark) | S8, `duedate` |
| 20 | Seeker Siblings | Blood | Projectile (homing) | S24, `seeker` |
| 21 | Peekaboo | Soul | Burst (reveal; Fear) | S4, `peekaboo` |
| 22 | Tooth Fairy | Soul | Burst (smite) | S14, `toothfairy` |
| 23 | Tapeworm Seeder | Soul | Projectile | S6, `parasite` |
| 24 | The Runs | Fire | Pool (trail) | S3, `wake`, was "Pub Crawl" (shipped as "Skid Mark") |

| Damage type | Weapons | | Attack type | Weapons |
| --- | --- | --- | --- | --- |
| Force | 7 | | Projectile | 12 |
| Soul | 4 | | Burst | 5 |
| Static | 3 | | Pool | 3 |
| Mucus | 3 | | Beam | 2 |
| Blood | 3 | | Contact | 1 |
| Acid | 2 | | Spread | 1 |
| Fire | 2 | | | |

## 2. The 10 foundational weapons (animation specs)

Simple, repeatable animations. They teach what each delivery type looks like before signatures add complexity. Each has no mechanic beyond its damage type and attack type. Reactions: `COMBAT_MATRIX.md` (this doc adds none).

### 1. Nut Shot (Force, Projectile)
The dependable single-target workhorse. A simple, heavy shot that makes a good baseline for upgrades and comparisons.
- **Shape:** a small, hard, nut-like pellet with a slightly lopsided shell and a blunt tip. It reads as a tiny projectile, not a literal anatomical close-up.
- **Motion:** shoots straight with a quick, confident snap and a short chunky trail.
- **Impact:** a sharp thwack flash and a tiny enemy squash. Keep the hit effect brief.

### 2. Spray Gun (Force, Spread)
Reliable crowd damage. A different targeting footprint from the single projectile, without a complex mechanic.
- **Shape:** a fan of several small, blunt, pale force pellets, clearly separate rather than one broad cloud.
- **Motion:** pellets burst outward in a consistent cone, with the outer shots diverging visibly.
- **Impact:** multiple small impact pips. At close range the fan converges into a satisfyingly dense hit.

### 3. Nutcracker (Force, Contact)
A straightforward close-range answer to enemies that get too near.
- **Shape:** a hard, chunky contact strike, suggested by two blunt force shapes snapping together around the impact point.
- **Motion:** a quick clamp-like snap or body-check when an enemy enters contact range.
- **Impact:** a brief star-shaped thump and enemy recoil. Readable without obscuring the sperm.

### 4. Premature Detonation (Force, Burst)
An area-impact baseline: a direct burst attack without the setup of a signature weapon.
- **Shape:** a compact pressure knot that flashes into a blunt circular shockwave.
- **Motion:** a very short swell, then an immediate outward pulse.
- **Impact:** a crisp expanding ring with a few chunky fragments of light; enemies visibly pop or stagger away from the centre.

### 5. Acid Spit (Acid, Projectile)
A simple delivery mechanism for the Acid damage identity.
- **Shape:** a shocking-pink glob with a slightly uneven, saliva-like surface.
- **Motion:** a small wobble in flight and a few tiny droplets that fall away; no long continuous trail.
- **Impact:** a wet splat, then a brief fizz or bubbling mark where corrosion is applied.

### 6. Blue Screen (Static, Beam)
Sustained damage along a line, and a baseline for the more elaborate electrical signatures.
- **Shape:** a thin, bright electrical line with a jagged inner core and a few angular forks.
- **Motion:** the beam flickers rapidly but stays anchored and easy to track; small pulses travel along it.
- **Impact:** quick yellow-white snaps on enemies. Branching only where the mechanic actually chains, so it never looks like Static Cling.

### 7. Snot Trap (Mucus, Pool)
A simple area-control weapon that sticks enemies crossing its patch.
- **Shape:** a flattened, glossy green mucus puddle with a thick rim and a few slow surface bubbles.
- **Motion:** the pool spreads slightly when placed, then settles into a gently wobbling patch.
- **Impact:** enemies crossing it stretch or drag for a beat, with a short elastic strand snapping back to the puddle.

### 8. Red Needle (Blood, Projectile)
A clean, precise delivery option for Blood. Chosen over Bloodletter to keep the foundation from leaning on contact attacks.
- **Shape:** a thin, dark-red needle with a brighter red tip; visibly much narrower than the Force projectile.
- **Motion:** a fast, precise dart with almost no trail.
- **Impact:** a tiny red pinprick flash. If it applies a Blood status, a small pulsing mark, not a large blood spray.

### 9. Ghost Load (Soul, Projectile)
A simple spectral attack that establishes Soul without echoes, summons or other advanced mechanics.
- **Shape:** a pale, translucent spirit-kernel with a soft inner silhouette, like a tiny ghost folded into a pellet.
- **Motion:** glides rather than tumbles; its edges lag a fraction behind the core.
- **Impact:** the projectile briefly passes through a ghostly afterimage before fading. Eerie, not smoky or explosive.

### 10. Hot Mess (Fire, Pool)
A straightforward persistent damage zone, a baseline for more elaborate Fire mechanics.
- **Shape:** an irregular, orange-red burning patch with a bright centre and a few low tongues of flame.
- **Motion:** splashes onto the surface, spreads a little, then burns in place with a low, restless flicker.
- **Impact:** enemies crossing it briefly glow at the feet and leave a few sparks. Stationary pool, never a movement trail, so it stays distinct from The Runs.

## 3. The 14 signatures

Playstyle, as set by the user on 18 Oct 2026. Type, attack type and mechanics: `SIGNATURE_WEAPONS.md` (cite it, do not copy it here).

| Signature | Playstyle |
| --- | --- |
| Black Hole | Spatial control, accumulation and explosive payoff. Pulls enemies and bends projectiles; merging orbs can culminate in a supernova. |
| Meat Missile | Collision engineering and crowd manipulation. Turns knockback into collisions that bowl enemies into one another. |
| Placental Siphon | Defensive conversion and retaliatory damage. Eats incoming bullets and fires them back. |
| Nappy Mines | Retreat, route planning and delayed area denial. Lays delayed mines behind the sperm, leaving Acid Pools after detonation. |
| Twin Telepathy | Spatial geometry and movement mastery. The beam between you and your twin turns movement and positioning into an attack. |
| Static Cling | Chain reactions and weapon-to-weapon synergy. Chains electricity through enemies and lets other weapons exploit Charged targets. |
| Sticky Situation | Exploiting relationships and concentrating damage. Links enemies so damage to one is shared with the others. |
| Blowing Bubbles | Incapacitation and tactical detonation. Traps small enemies in bubbles that burst when touched. |
| Due Date | Sustained focus and delayed damage payoff. Marks a tough enemy and returns a portion of the damage it took when the countdown ends. |
| Seeker Siblings | Autonomous targeting and kill-chain escalation. Homing shots target enemies and split after a sibling scores a kill. |
| Peekaboo | Deception and crowd manipulation. Disappears, manipulates enemy pursuit, then reveals itself and applies Fear. |
| Tooth Fairy | Prediction, baiting and delayed payoff. Baits enemies with teeth and punishes them when they approach. |
| Tapeworm Seeder | Army building and self-reinforcing combat. Turns infected enemies into allied fighters after death. |
| The Runs | Weaponised movement and pursuit manipulation. Leaves a burning trail behind the sperm. |

## 4. Why these 24 together

- **Foundations teach, signatures twist.** Every damage type has a foundation; every foundation is one attack type with no extra rule. The Fire foundation (Hot Mess) is a stationary Pool so The Runs (a trail) stays distinct.
- **Echo and chain rules still apply** to Sticky Situation, Due Date, Static Cling, Black Hole and Meat Missile (`COMBAT_MATRIX.md` 11.5, 12.5, echo damage).

## 5. Open issues (need your call)

1. **Name clash: Sticky Situation.** The Static + Mucus reaction in the matrix is also called Sticky Situation (and `combos.js` has a Weapon Combo of that name). On 17 Oct the weapon of that name (a Mucus Pool) was renamed Snot Trap to avoid this. Recommendation: keep the weapon name, rename the reaction (matrix section 1, decision log, `combos.js`).
2. **Four renames I inferred from your descriptions:** Meat Missile = Lard Lobber (knocked enemies bowl into mates), Sticky Situation = Red Tape (shared damage), Blowing Bubbles = Bubble Wand, The Runs = Pub Crawl. If any is wrong, say which.
3. **Sample starting weapons break for 3 samples** (`WEAPONS.md` section 4, each starts with a matrix weapon that is now archived). Recommendation: The Late Starter starts with Red Needle (Blood Projectile instead of Contact); The Unaccounted starts with Ghost Load (Soul Projectile instead of Burst); The Unsolicited (Fire, was Cinderblast Spread) starts with Hot Mess (Fire Pool). The Other Half's rotation loses Flame Jet and Wraith Ray; its Fire and Soul slots become Hot Mess and Ghost Load. Each changes the sample's starting attack type in `SAMPLES.md`.
4. **Thin attack types.** Contact (Nutcracker) and Spread (Spray Gun) have one weapon each, and Fire has only Pool weapons. Recommendation: accept for now; the next additions should be a Fire Projectile or Spread and a second Contact.
5. **The 5 Fire drafts are archived** (Heartburn, Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation). Any enemy or reaction design that assumed a Fire Beam, Contact or Burst weapon should be re-checked.

## 6. Code pass (not done)

About one session. The v10 prototype is on this branch (`v10.js`, `sigweap.js`).
1. Archive: restrict `v10Ids()` (`v10.js`) to the 10 foundation ids and the signature list in `sigweap.js` to the 14. Keep every definition in the code; add an `archived` flag so the Lab Bench can still spawn them.
2. Rename in the data: Knuckle Dragger, Broadside, Burning Ground, Lard Lobber, Red Tape, Bubble Wand, Pub Crawl (`V10_NAMES`, `sigweap.js`).
3. Sample starters (issue 3): `samples10.js`.
4. New animations for the 10 foundations (section 2) in `render.js`/`typefx.js`, following `STYLE.md` and the redesign's visual language.
5. Fix any combo, Feat or tutorial text naming an archived weapon; update `GAME_GUIDE.md` and tests.

## 7. Archived weapons (72)

Kept in the docs and the code; not in the game. Full text in `WEAPONS.md`.

**Matrix (32):** M5 Hard Press, M6 Pressure Drop, M7 Corrosive Bite, M9 Sour Spray, M10 Caustic Reaction, M11 Dissolving Relationship, M12 Acid Reflux, M13 Shock Jab, M14 Zap Seed, M15 Forked Tongue, M16 Power Surge, M18 Live Wire, M19 Snot Knuckle, M20 Gobstopper, M21 Snotgun, M22 Gunk Bomb, M23 Snot Stream, M25 Bloodletter, M27 Bloodshot, M28 Bloodbath, M29 Bloodline, M30 Blood Pool, M31 Spirit Slap, M33 Soul Scatter, M34 Soul Purpose, M35 Wraith Ray, M36 Haunted Ground, M37 Hot Touch, M38 Hot Shot, M39 Cinderblast, M40 Firecracker, M41 Flame Jet.

**Signature (12):** Premature Evangelation, Leeches, Upchuck, Blood Blister, Thorny Onesie, Flagellum Flail, Nose Goblins, and the five Fire drafts (Heartburn, Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation).

**Parked originals (28):** Spitball, Hiccup Scattergun, Yo-Yo Diet, Booger Flick, Morning Sickness, Placenta Paddle, Colouring In, Imaginary Friend, Baby Rattle, Little Swimmers, Gut Punch, Ulcer Moons, Achoo, Bogey Roller, Runny Nose, Static Hairbrush, Carpet Shuffle, Lightning Bugs, Grubby Fingers, Whooping Cough, Cradle Cap, Butter Knife, Head Lice, Paper Cut, Spirit Fingers, Waters Breaking, Bath Bomb, Sea Monkeys. Shipped-game weapons that no redesign doc lists (for example Gene Gun, Karma, Duelling Banjo and most of the Playpen set) are archived too.
