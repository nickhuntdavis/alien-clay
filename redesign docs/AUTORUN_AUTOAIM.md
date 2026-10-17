# Autorun and Autoaim

A reference for how Spawn Prawn moves you and aims for you. Autorun decides **where you swim**. Autoaim decides **what each weapon hits**. They are separate systems: any mode works with any directive.

<aside>
🧭

**Status:** shipped in v9.28 on `claude/festive-allen-xmea8i` (code: `web/js/autorun.js`, plus `targetScore`, `acquire` and `autoSteer` in `game.js`). Not yet merged into `main` or into this v10 branch. The numbers below are the live values in that code.

</aside>

## Design baseline

- **Understandable:** each option produces a behaviour you can recognise on screen.
- **Useful:** each option has a clear purpose and works with more than one build.
- **Compatible:** movement and targeting never require a specific pairing.
- **Low-maintenance:** the player sets a policy; the game makes the moment-to-moment calls.
- **Manual always wins:** drag anywhere to steer. Autorun is an alternative, not a restriction.

---

# Part 1: Autorun

## Shared rules (every mode)

- **Every mode dodges.** Movement is context steering: each frame scores 16 headings plus "stay" by the mode's goal minus predicted danger (enemy bodies, enemy bullets predicted 0.225 and 0.45 s ahead, hazards, terrain, the solid egg). No mode walks into a bullet to reach a goal.
- **Threat reach differs by mode.** Enemy bodies count as danger within 250 units (KITE, COLLECT, ORBIT, NEST), 120 (HUNT) or 80 (HOLD).
- **Every mode stays in the arena.** Past arena edge minus 350, a pull back to the centre grows with distance.
- **One memory per mode.** Each mode keeps what it is following (the HOLD anchor, ORBIT cluster, HUNT target, circling side) in `G.ar`. That memory resets when you change mode, or after you steer by hand (0.25 s without autorun).
- **Circling keeps its side.** KITE, ORBIT and HUNT pick clockwise or anticlockwise from your current heading and keep it, so you never flip back and forth.
- **Overrides shared by all modes except HOLD:** run-event targets (the Golden Swimmer, bounties) pull you towards them; in the race, once the egg is yours to break you swim to it and circle it; a rival breaking in gets chased.
- **Movement never picks weapon targets.** HUNT's target is for your tail only; each weapon still aims by its own directive.

## Pickups (all modes)

- **Candidates:** power-ups within 900 units (COLLECT) or 380 (other modes), ranked by value for distance. XP gems within 800 (COLLECT) or 400 (KITE, NEST), ranked by distance ÷ √value. HUNT, ORBIT and HOLD ignore gems.
- **Risk check:** for each of the top 4 candidates, risk = threat within 140 of the pickup + 0.6 × threat within 110 of the halfway point. Threat counts 1 per enemy, 1.6 for an elite, 3 for a boss. The first candidate under the cap is taken: **2.2 for COLLECT, 1.4 otherwise**.
- **Pull:** power-up 1.2 (HOLD 0.3); gems 1.1 (COLLECT) or 0.45.
- **Homing (COLLECT only):** a safe power-up within 200 gets a strong pull (2.5), but only while no enemy is within 120 of you.

## KITE

**Keep your distance and dodge attacks.**

- **Band:** 240 to 360 units from the nearest enemy.
- **Inside 240:** move away from the threat-weighted direction of every enemy within 420. Push = (240 − distance) ÷ 80 + 0.35, capped at 1.3.
- **Inside the band:** sidestep round the pack (0.5), with a slight outward drift.
- **Past 450:** close in gently (0.35), so ranged weapons stay in reach.
- **Escape check:** the danger sampling stops it fleeing one enemy into another.
- **Fallback:** no enemies means cruising on its current heading, with a lazy curve.
- **Suits:** ranged weapons and builds that want space.

## COLLECT

**Grab nearby XP and power-ups, unless it means swimming into trouble.**

- Wider pickup reach and stronger pulls (see Pickups), plus homing on safe power-ups.
- **Gives up a pickup** when its risk is over 2.2; it tries the next of the top 4 instead.
- **Fallback:** with nothing safe to take, it dodges and cruises on its heading.
- **Suits:** levelling fast; trusting it to take value, not every gem.

## ORBIT

**Circle the biggest nearby group of enemies.**

- **Choosing a cluster:** the enemy within 700 with the most neighbours within 70 seeds it. The cluster is every enemy within 170 of that seed: its centre, size and spread (average distance from the centre).
- **Keeping it:** each frame the cluster is recomputed round its last centre (radius 200), so it follows the group as it moves.
- **Changing it:** a new pick happens straight away if the cluster has fewer than 3 members or is over 800 away. Every 1.5 s it checks for a better one, and switches only if that cluster is 1.5 times the size and more than 200 away.
- **Circling:** sideways 1.0, plus a radial correction towards radius R = spread + 160, kept between 180 and 380.
- **Fallback:** no cluster means it behaves as KITE.
- **Suits:** radial, area and keep-firing-while-moving weapons.

## HUNT

**Close in on bosses, rivals and elites, or whatever is nearest.**

- **One target, chosen globally:** boss > rival > elite > nearest, within 900. It never asks a weapon what to chase.
- **Keeping it:** until it dies, phases out, is charmed or gets over 1,100 away.
- **Re-ranking:** every 1 s, a higher-ranked enemy in reach (a boss turns up) takes over. An equal or lower one never does.
- **Approach:** a straight pull (1.2) until within 130, then sweep past on the side you are already turning, rather than backing off.
- **Fallback:** no target means cruising.
- **Suits:** contact, short-range and aggressive builds.

## HOLD

**Hold your position and dodge immediate threats.**

- **Anchor:** where you were when HOLD started (or when you stopped steering by hand).
- **Return:** past 60 units from the anchor, a pull back = min(1.5, (distance − 60) ÷ 80 + 0.2).
- **Still moves for danger:** bullets, contact threats within 80, hazards. It is not standing still.
- **Ignores:** run events, the egg race, terrain lures and gems; power-ups pull only weakly (0.3).
- **Suits:** turrets, mines, auras and anything that wants enemies to come to you.

## NEST (id `defend`)

**Stay in the egg's warm glow, which slowly heals you.**

- **Area:** the sanctuary, 290 units round the egg. It returns when past 0.8 × that (232), and drifts round the egg (0.5) inside it.
- **Pickups:** only those within the sanctuary + 120 count.
- **Healing is not safety:** it still dodges, but it gives up chasing and distant rewards.
- **Campaign levels:** NEST is not offered there (no egg). Entering a level on NEST switches you to HOLD.
- **Suits:** sustain builds, and long fights where health matters more than tempo.

---

# Part 2: Autoaim

Each weapon and Feat has a **primary directive** and an optional **THEN directive** (the tie-breaker).

## Directives

| Directive (id) | Picks | Score | Counts as a tie within |
|---|---|---|---|
| NEAREST (`nearest`) | Closest enemy | −distance | 40 units |
| FRAGILEST (`weakest`) | Lowest **max** health, wounded or not | −max HP | 5% |
| LOWEST HEALTH (`lowhp`) | Least health **left right now** | −current HP | 5% |
| TOUGHEST (`strongest`) | Most durable | max HP × (1 + 0.1 × effective armour) | 5% |
| HIGHEST ARMOUR (`armour`) | Most effective armour (after shred, auras) | armour | 1 point |
| FASTEST (`fastest`) | Highest move speed | speed | 5% |
| FURTHEST (`furthest`) | Farthest in range | distance | 40 units |
| DENSEST CLUSTER (`cluster`) | Enemy with most neighbours within 70 (bosses +5) | crowd | exact |
| ELITES & BOSSES (`elite`) | Boss 3 > rival 2 > elite 1 > rest 0 | tier | exact |
| SHOOTERS FIRST (`shooters`) | Boss or shooter 3 > healer 2 > summoner 1 > rest 0 | tier | exact |
| REVENGE (`revenge`) | Whatever hurt you last | 1 or 0 | exact |
| RANDOM (`random`) | Anyone in range | random | n/a |

- Without a THEN, every directive breaks its own ties by distance (nearest first).
- **Always on top:** run-event targets (bounties, the Golden Swimmer) come first; once the egg is breakable, half of all picks in range go to it.
- **Never targeted:** dead, phased, charmed or allied enemies, and the egg before it can be broken.
- **FASTEST is not a threat detector:** a slow enemy with a big attack can be more dangerous.

## THEN (tie-breaker and fallback)

- **How it compares:** primary value (rounded to its tie tolerance), then THEN value (rounded), then exact distance.
- **Ties:** two enemies within the tolerance on the primary count as level, so THEN picks between them. *NEAREST then FRAGILEST*: of two enemies about equally close, shoot the frailer.
- **Fallback:** when no enemy qualifies for a tiered primary, every enemy ties at 0, so THEN takes over. *ELITES & BOSSES then LOWEST HEALTH*: with no elite about, finish off the most wounded.
- **Default:** none. A weapon behaves exactly as before until you set one.
- **Where:** Tackle Box → LOADOUT → tap a weapon's target chip → "Then"; also on each weapon's page. The HUD chip shows both, e.g. `NEAR›FRAG`.
- **Not for:** weapons with three barrels (committee weapons) keep their per-barrel directives; weapons with no target (trails, mines) have none.
- **Copies inherit it:** echo, friend and twin copies of a weapon carry both directives.

## Stickiness (no target flicking)

- **RANDOM** keeps a victim for 1.5 s, while it stays valid and in range.
- **FURTHEST** keeps its target unless the new one is more than 15% farther.
- **DENSEST CLUSTER** keeps its target unless the new one's crowd is more than 15% bigger.
- Any directive drops a target that dies, phases, is charmed or leaves range.

## Removed and deferred

- **STRONGEST → TOUGHEST:** it now includes armour, not max health alone.
- **WEAKEST → FRAGILEST:** a rename. It still means max health, which is what separates it from LOWEST HEALTH.
- **HIGHEST HEALTH: removed.** In a fast game it overlapped TOUGHEST. Its five default users now use TOUGHEST: Tapeworm Seeder, Due Date, Leeches, Umbilical Cord, Heel Prick.
- **INCOMING: deferred.** Only worth adding once enemies expose a clear, readable "about to attack" state; guessing from movement would just repeat FASTEST or SHOOTERS FIRST.

---

# Part 3: Together

**Autorun moves you. Autoaim aims each weapon.** They can disagree (HUNT swimming at a boss while a SHOOTERS FIRST weapon shoots the healer next to you), and that is intended.

| Autorun | Autoaim | What it does |
|---|---|---|
| KITE | SHOOTERS FIRST | Keeps its distance while removing ranged and support enemies |
| HUNT | LOWEST HEALTH | Chases the big target while weapons mop up the wounded |
| ORBIT | DENSEST CLUSTER | Circles the biggest group while splash weapons hit its middle |
| NEST | ELITES & BOSSES | Heals at the egg while focusing the big threats |
| HOLD | FASTEST | Holds its ground and drops chargers before they arrive |
| COLLECT | NEAREST | Gathers XP while weapons handle whatever is close |

These are examples, not prescribed builds.

---

# Tuning

- **Movement constants:** `AR` in `autorun.js`: `kiteIn 240`, `kiteOut 360`, `kiteFar 450`, `holdR 60`, `orbitEvery 1.5`, `orbitBetter 1.5`, `huntR 900`, `huntLose 1100`. The other numbers above are inline in `arPickups`, `arOrbit` and `arKite`.
- **Toughness weight:** `aimTough` (0.1 per armour point).
- **Tie tolerances:** `aimKey` (40 units, 5% steps via `aimRel`).
- **Tests:** `tests/autoruntest.js` (every directive in one staged scene, both THEN cases, HOLD drift under 120, KITE escape, ORBIT keeps its cluster, HUNT keeps the elite, NEST hidden in levels).
- **Sims:** `node sim/wave20.js 4 mortal --move <mode>`. At v9.28, old code then new, wins out of 4: KITE 3 → 2, ORBIT 1 → 3, HUNT 3 → 2, HOLD 2 → 2 (9 of 16 both ways).

# Open questions for v10

- **Porting:** v10 gates old content; check the autorun hooks still fire with `V10` on, and that v10's weapon matrix routes through `acquire(aimDir(w))`.
- **Tiers:** check ELITES & BOSSES and SHOOTERS FIRST against the v10 enemy roster (what counts as a shooter, healer or summoner there).
- **TOUGHEST and defences:** decide whether durability should use the five v10 defences (Squishy, Membrane, Shell) instead of one armour number. Shell layers are the closest match to `effArmour`.
- **HIGHEST ARMOUR:** in v10 this may mean "most Shell layers"; keep it only if Acid or Force weapons exist that strip layers.
