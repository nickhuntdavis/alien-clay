# Base Weapons

**Status: design record, 18 Oct 2026. Nothing here is built yet (see "Code pass" at the end).** Damage types and reactions follow `COMBAT_MATRIX.md` (Force, Acid, Static, Mucus, Blood, Soul, Fire; Cooties, Oil and Water are retired). Attack types follow `ATTACK_TYPES.md`.

The roster is **24 weapons**: 14 signature weapons carried over from the current game, and 10 new foundational weapons. Every other weapon is archived (list at the end, 65 weapons).

## 1. Roster at a glance

| # | Weapon | Damage type | Attack type | Class |
|---|---|---|---|---|
| 1 | Nut Shot | Force | Projectile | Foundation |
| 2 | Spray Gun | Force | Spread | Foundation |
| 3 | Nutcracker | Force | Contact | Foundation |
| 4 | Premature Detonation | Force | Burst | Foundation |
| 5 | Acid Spit | Acid | Projectile | Foundation |
| 6 | Blue Screen | Static | Beam | Foundation |
| 7 | Snot Trap | Mucus | Pool | Foundation |
| 8 | Red Needle | Blood | Projectile | Foundation |
| 9 | Ghost Load | Soul | Projectile | Foundation |
| 10 | Hot Mess | Fire | Pool | Foundation |
| 11 | Black Hole | Force | Pool (Burst finale) | Signature |
| 12 | Meat Missile | Force | Contact | Signature |
| 13 | Placental Siphon | Force | Projectile | Signature |
| 14 | Nappy Mines | Acid | Burst (leaves Pools) | Signature |
| 15 | Twin Telepathy | Static | Beam | Signature |
| 16 | Static Cling | Static | Projectile (chain) | Signature |
| 17 | Sticky Situation | Mucus | Projectile (link) | Signature |
| 18 | Blowing Bubbles | Mucus | Projectile (trap) | Signature |
| 19 | Due Date | Blood | Projectile (mark) | Signature |
| 20 | Seeker Siblings | Blood | Projectile (homing) | Signature |
| 21 | Peekaboo | Soul | Burst (reveal) | Signature |
| 22 | Tooth Fairy | Soul | Burst (smite) | Signature |
| 23 | Tapeworm Seeder | Soul | Projectile | Signature |
| 24 | The Runs | Fire | Pool (trail) | Signature |

Coverage: Force 7, Soul 4, Static 3, Mucus 3, Blood 3, Acid 2, Fire 2. Acid and Fire are thin; see open issues.

## 2. The 10 foundational weapons

Simple, repeatable animations. They teach what each delivery type looks like before signatures add complexity. Each is also the clean "setter" or "striker" a reaction needs, with no extra mechanic of its own.

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

## 3. The 14 signature weapons

Playstyle and visuals stay as in the current game. Only damage type, status and reaction hooks change. "Was" gives the current name and type in the code.

| # | Signature | Type | Was (code id) | Playstyle |
|---|---|---|---|---|
| 11 | Black Hole | Force | Toddler Gravity (`void`), Soul | Spatial control, accumulation and explosive payoff. Pulls enemies and bends projectiles; merging orbs can culminate in a supernova. |
| 12 | Meat Missile | Force | none (see issue 2) | Collision engineering and crowd manipulation. Turns knockback into collisions that bowl enemies into one another. |
| 13 | Placental Siphon | Force | `siphon`, Water | Defensive conversion and retaliatory damage. Eats incoming bullets and fires them back. |
| 14 | Nappy Mines | Acid | `mines`, Acid (old id `fire`) | Retreat, route planning and delayed area denial. Lays delayed mines behind the sperm, leaving Acid Pools after detonation. |
| 15 | Twin Telepathy | Static | `twin`, Static | Spatial geometry and movement mastery. The beam between you and your twin turns movement and positioning into an attack. |
| 16 | Static Cling | Static | `tesla`, Static | Chain reactions and weapon-to-weapon synergy. Chains electricity through enemies and lets other weapons exploit Charged targets. |
| 17 | Sticky Situation | Mucus | Red Tape (`redtape`), Cooties | Exploiting relationships and concentrating damage. Links enemies so damage to one is shared with the others. |
| 18 | Blowing Bubbles | Mucus | Bubble Wand (`bubble`), Water | Incapacitation and tactical detonation. Traps small enemies in bubbles that burst when touched. |
| 19 | Due Date | Blood | `duedate`, Blood | Sustained focus and delayed damage payoff. Marks a tough enemy and returns a portion of the damage it took when the countdown ends. |
| 20 | Seeker Siblings | Blood | `seeker`, Blood | Autonomous targeting and kill-chain escalation. Homing shots target enemies and split after a sibling scores a kill. |
| 21 | Peekaboo | Soul | `peekaboo`, Oil | Deception and crowd manipulation. Disappears, manipulates enemy pursuit, then reveals itself and applies Fear. |
| 22 | Tooth Fairy | Soul | `toothfairy`, Blood | Prediction, baiting and delayed payoff. Baits enemies with teeth and punishes them when they approach. |
| 23 | Tapeworm Seeder | Soul | `parasite`, Cooties | Army building and self-reinforcing combat. Turns infected enemies into allied fighters after death. |
| 24 | The Runs | Fire | Skid Mark (`wake`), Oil | Weaponised movement and pursuit manipulation. Leaves a burning trail behind the sperm. |

### Reaction hooks per signature

Each hook names the matrix reaction the weapon sets up (S) or triggers (T). Reactions stay deliberate: none fires just because two types touched the same enemy, and none retriggers itself.

| Signature | Hooks |
|---|---|
| Black Hole | T: Force hits (the supernova, and anything the pull drags into a Force weapon) can trigger Snot Rocket, Blood Pressure, Corrosive Splash. S: pulls Mucus-stuck, Acid-coated and Burning enemies into one tight group. The supernova is a Force hit, so it triggers once per target, not per orb. |
| Meat Missile | T: Snot Rocket (launch a Mucus-stuck enemy, collision patch on landing), Flashover (a bowled enemy that is Burning lights one neighbour). Collision damage is Force. |
| Placental Siphon | Returned bullets are Force whatever the original type (proposed; see issue 5). Triggers Force reactions on whatever they hit. |
| Nappy Mines | S: Acid-coated targets and Acid Pools. T: Slick Move (Acid onto a Mucus patch). The Acid Pool is the pool Conductive Pool uses, and Premature Evaporation consumes the coating only by a Fire hit, never automatically. |
| Twin Telepathy | S: Charged. T: Arc Flash (beam on a Burning target), Interference Pattern (beam on a telegraphed Soul attack), Blood Circuit (beam through a blood pool), Conductive Pool (beam through an Acid pool). |
| Static Cling | S: Charged. T: Arc Flash, Conductive Pool, Blood Circuit. The chain has a visible budget; reaction arcs do not extend it. |
| Sticky Situation | S: Mucus-stuck. Linked damage shares the hit, not the reaction: a reaction fires once on the struck enemy. Feeds Snot Rocket, Held in Suspension, Flammable Mucus. |
| Blowing Bubbles | S: Mucus-stuck (the bubble). T: Snot Rocket when a bubbled enemy is hit by Force and launched. One bubble, one launch. |
| Due Date | S: Blood (the mark). T: Blood Pressure, Cauterise, Caustic Breach on a bleeding target. Reaction damage counts toward the Due Date total once. |
| Seeker Siblings | S: bleeding. T: Blood Donor (a hit on a Soul-marked target), Blood Circuit. Splits are new shots, not new reactions. |
| Peekaboo | S: Fear (Fear-tagged effects only). The reveal also leaves a Soul mark (proposed), so Soul has a hook. |
| Tooth Fairy | S: Soul mark on whoever takes a tooth. T: Soul Purpose, Soul Erosion, Held in Suspension, Blood Donor, Spectral Combustion. |
| Tapeworm Seeder | S: Soul mark on the infected (visual: infested). Death turns the mark into an ally. Marks are consumed by Soul Purpose as normal. |
| The Runs | S: Burning, trail segments. T: Flammable Mucus (ignites a Mucus patch it crosses), Cauterise, Arc Flash target. Premature Evaporation applies only to an Acid-coated target hit directly, never to an Acid Pool. |

## 4. Foundations as reaction partners

| Foundation | Sets up | Triggers |
|---|---|---|
| Nut Shot, Spray Gun, Nutcracker, Premature Detonation (Force) | Poise damage, knockback | Every Force row: Corrosive Splash, Snot Rocket, Blood Pressure, Soul Purpose, Flashover; Shocking Impact only as a named combo |
| Acid Spit | Acid-coated | Slick Move, Caustic Breach, Soul Erosion |
| Blue Screen | Charged | Conductive Pool, Blood Circuit, Arc Flash, Interference Pattern |
| Snot Trap | Mucus patch, Mucus-stuck | Held in Suspension, Caught in the Clot |
| Red Needle | Bleeding | Cauterise, Caustic Breach, Blood Pressure (as setup) |
| Ghost Load | Soul mark | Spectral Combustion, Held in Suspension, Blood Donor (as setup) |
| Hot Mess | Burning, fire patch | Premature Evaporation, Arc Flash, Cauterise |

## 5. Open issues

1. **Thin Acid and Fire.** Acid and Fire have 2 weapons each (Acid Spit, Nappy Mines; Hot Mess, The Runs) against Force's 7. Recommendation: accept for now; the next weapons added should be Acid and Fire.
2. **Meat Missile does not exist in the game.** The nearest is Placenta Paddle (sweep with big knockback) plus the Bubble Hockey and Cannonball bowling combos. Recommendation: build it on the Paddle chassis, with the collision as the new part. The Paddle is archived.
3. **Name clash: Sticky Situation.** It is both a weapon here and the Static + Mucus reaction in `COMBAT_MATRIX.md` (also a Weapon Combo name in `combos.js`). Recommendation: keep the weapon, rename the reaction.
4. **Near-pun: Premature Detonation vs Premature Evaporation** (a Fire + Acid reaction). Harmless, but one may want a new name.
5. **Placental Siphon return type.** Returned bullets as Force keeps it simple; carrying the original type would make it a reaction engine. Recommendation: Force.
6. **Peekaboo's Soul mark** is my proposal. Without it, Peekaboo (Fear only) has no reaction hooks.
7. **Soul-heavy kit.** Tooth Fairy, Tapeworm Seeder and Peekaboo all lean on the Soul mark. Playtest that Soul Purpose does not fire constantly.

## 6. Code pass (not done)

The engine still runs the nine-type system (`phys, fire (=Acid), ice (=Mucus), shock, poison, oxi, salt, arcane, soul`). Fire has no internal id yet (`fire` means Acid). Order of work, about one long session on Opus:

1. Add `archived: 1` to the 65 archived `WEAPONS` entries and filter them from every pool (draft, loot, daily, wave offers, Lab Bench stays able to spawn them).
2. Retire Cooties, Oil, Water in `chem.js`; add Fire (new id, e.g. `burn`) and the Soul mark, Charged, Corroded statuses.
3. Re-type the 14 signatures per section 3.
4. Build the 10 foundations (new file, `base.js`, hook-file pattern), reusing the existing gun, spread, melee, ring, beam, lob and zone behaviours.
5. Rewrite the reaction table in `chem.js` from the 21-pair matrix.
6. Fix pairings, combos and Feat forks that name an archived weapon.
7. Update tests (`armtest`, `typetest`, `rxtest`) and `GAME_GUIDE.md`.

Feats are not touched by this document.

## 7. Archived weapons (65)

Kept in the code, off in the game. Type column is the old type.

| Weapon | Code id | Old type | Kind | Set |
|---|---|---|---|---|
| Spitball | `blaster` | Force | gun | Original |
| Yo-Yo Diet | `glaive` | Force | gun | Original |
| Placenta Paddle | `paddle` | Force | melee | Original |
| Flagellum Flail | `flail` | Force | melee | Original |
| Thorny Onesie | `onesie` | Force | melee | Original |
| Colouring In | `crayon` | Force | crayon | Original |
| Karma | `karma` | Force | ring | Original |
| Shotgun Wedding | `wedding` | Force | gun | Original |
| Hand in Hand | `doubletrouble` | Force | gun | Original |
| Baby Rattle | `rattle` | Force | ring | Armoury |
| Little Swimmers | `swimmers` | Force | critter | Armoury |
| Runaway Pram | `pram` | Force | gun | Playpen |
| Heartburn | `flamer` | Acid | gun | Original |
| Morning Sickness | `venom` | Acid | lob | Original |
| Gut Punch | `gutpunch` | Acid | melee | Armoury |
| Upchuck | `upchuck` | Acid | lob | Armoury |
| Ulcer Moons | `ulcer` | Acid | orbit | Armoury |
| Juice Box | `juicebox` | Acid | gun | Playpen |
| Lemon Squeezy | `lemon` | Acid | gun | Playpen |
| Hiccup Scattergun | `shotgun` | Mucus | gun | Original |
| Booger Flick | `frost` | Mucus | gun | Original |
| Achoo | `achoo` | Mucus | melee | Armoury |
| Bogey Roller | `roller` | Mucus | gun | Armoury |
| Runny Nose | `runny` | Mucus | wake | Armoury |
| Nose Goblins | `goblins` | Mucus | gun | Armoury |
| Sticky Fingers | `sticky` | Mucus | gun | Playpen |
| Egg White | `eggwhite` | Mucus | critter | Playpen |
| Duelling Banjo | `banjo` | Static | ring | Original |
| Static Hairbrush | `hairbrush` | Static | melee | Armoury |
| Carpet Shuffle | `carpet` | Static | ring | Armoury |
| Lightning Bugs | `bugs` | Static | critter | Armoury |
| Fork in the Socket | `fork` | Static | gun | Playpen |
| Grubby Fingers | `grubby` | Cooties | melee | Armoury |
| Whooping Cough | `whoop` | Cooties | gun | Armoury |
| Hanky Panky | `hanky` | Cooties | melee | Playpen |
| Wet Kiss | `wetkiss` | Cooties | gun | Playpen |
| Soft Play | `softplay` | Cooties | lob | Playpen |
| Moonshine Jug | `moonshine` | Oil | lob | Original |
| Cradle Cap | `cradlecap` | Oil | gun | Armoury |
| Butter Knife | `butterknife` | Oil | melee | Armoury |
| Lard Lobber | `lard` | Oil | lob | Armoury |
| Head Lice | `lice` | Oil | critter | Armoury |
| Cod Liver Oil | `codliver` | Oil | lob | Playpen |
| Lava Lamp | `lavalamp` | Oil | orbit | Playpen |
| Greased Piglet | `piglet` | Oil | critter | Playpen |
| Waters Breaking | `waters` | Water | gun | Armoury |
| Bath Bomb | `bathbomb` | Water | lob | Armoury |
| Sea Monkeys | `seamonkeys` | Water | critter | Armoury |
| Baby Shower | `shower` | Water | lob | Playpen |
| Wet Wipe | `wetwipe` | Water | melee | Playpen |
| Water Pistol | `pistol` | Water | gun | Playpen |
| Gene Gun | `genegun` | Blood | gun | Original |
| Paper Cut | `papercut` | Blood | melee | Armoury |
| Blood Blister | `blister` | Blood | lob | Armoury |
| Leeches | `leeches` | Blood | critter | Armoury |
| Umbilical Cord | `cord` | Blood | gun | Playpen |
| Period Drama | `period` | Blood | gun | Playpen |
| Heel Prick | `heelprick` | Blood | gun | Playpen |
| Premature Evangelation | `orbit` | Soul | orbit | Original |
| Imaginary Friend | `friend` | Soul | friend | Original |
| Déjà Vu | `dejavu` | Soul | gun | Original |
| Ghosts of You | `ghosts` | Soul | gun | Original |
| Spirit Fingers | `spiritfingers` | Soul | melee | Armoury |
| Night Light | `nightlight` | Soul | critter | Playpen |
| Boo-merang | `booerang` | Soul | gun | Playpen |
