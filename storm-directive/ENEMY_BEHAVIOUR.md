# Enemy behaviour (v10, generated)

Generated from the live game by `tests/tools/enemytables.js`. Same enemy order as `ENEMY_STATS.md`. Roles, defences, damage types and attack types come from `web/js/roster.js` (the v10 roster, applied by `newfoes.js`). Damage types use the canonical names (force, acid, static, mucus, blood, soul, fire). Attack types are Contact, Proj(ectile), Spread, Burst, Beam and Pool (`redesign docs/ATTACK_TYPES.md`). "AI" is the engine behaviour id. "Legacy projectile" is the older `shoot` table that still drives shooters. "Weight" is spawn weight.

Regular enemies have no per-type weaknesses in v10: counterplay is the defence (see `redesign docs/DEFENCE_TYPES.md`).

## Regular enemies

| # | Enemy | Roles | Defence | Damage type | Attack types | Legacy projectile | AI | Radius | Weight | Pack, splits, cap | Flags | Roster status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Lost Tadpole | chaser | none | force |  | - | tadpole | 9 | 1.1 | cap 8 | - | keep |
| 2 | Spermlet Swarm | swarm | none | force | contact (4 dmg) | - | chase | 6 | 0 | pack of 9 | cut from random spawns | review-overlap |
| 3 | Krill | swarm | none | force | contact (3 dmg) | - | krill | 10 | 2 | pack of 12 | - | keep |
| 4 | Spore | swarm | none | force | contact (4 dmg) | - | chase | 7 | 0 | cap 10 | - | spawned |
| 5 | Glitter | swarm | none | force | contact (2 dmg) | - | chase | 7 | 0.9 | pack of 4; cap 8 | - | keep |
| 6 | Mosquito | leech, sprinter | none | blood | contact bite (4 dmg) | - | new_mosquito | 8 | 1.2 | cap 4 | - | new |
| 7 | Sprinter | sprinter | Evasion (35% miss) | force | contact (5 dmg) | - | chase | 8 | 7 | - | - | keep |
| 8 | Broodling | swarm | none | force | contact (6 dmg) | - | broodling | 8 | 0 | - | - | spawned |
| 9 | Stray Pube | controller | none | force | contact tangle (0 dmg) | - | pube | 10 | 1.1 | cap 8 | - | keep |
| 10 | Daughter Cell | swarm | none | force | contact (5 dmg) | - | chase | 9 | 0 | - | - | spawned |
| 11 | Also-Ran | chaser | none | force | contact (8 dmg) | - | chase | 12 | 10 | - | - | keep |
| 12 | Bogey | controller | none | mucus | contact stick (0 dmg) | - | bogey | 11 | 1 | cap 8 | - | keep-merge-check |
| 13 | Acid Bubble | carrier | none | acid | burst (18 dmg, 0.5s tell) | - | new_bomber | 12 | 3 | - | - | keep-clarify |
| 14 | Navel Fluff | chaser | none | force | contact (3 dmg) | - | drift | 13 | 1.1 | cap 8 | - | keep |
| 15 | Candida | swarm | none | force | contact (5 dmg) | - | yeast | 11 | 0 | - | - | spawned |
| 16 | Matchstick | charger | none | fire | contact charge (12 dmg, 0.7s tell) | - | new_matchstick | 10 | 1.4 | - | - | new |
| 17 | Antibody | shooter | none | acid | proj (6 dmg) | aimed, 6 dmg, speed 170, every 2.6s | ranged | 13 | 4 | - | - | keep-clarify |
| 18 | Killer T-Cell | shooter, sniper | none | blood | beam (16 dmg, 0.9s tell) | - | new_lancer | 13 | 1.5 | - | - | keep-if-distinct |
| 19 | Daughter Colony | swarm | none | force | contact (6 dmg) | - | chase | 12 | 0 | - | cut from random spawns | spawned |
| 20 | Complement Protein | controller | none | force | contact mark (6 dmg) | - | complement | 12 | 0.9 | cap 3 | - | keep-clarify |
| 21 | Cortisol Puff | relay | none | force | contact (6 dmg) | - | cortisol | 13 | 0.9 | cap 3 | - | keep |
| 22 | Leech | leech | none | blood | contact drain (7 dmg) | - | leech | 12 | 1.3 | cap 6 | - | keep |
| 23 | Paramecium | sprinter | none | force | contact (10 dmg) | - | ciliate | 13 | 0 | - | cut from random spawns | review-overlap |
| 24 | Snot Bubble | carrier, controller | none | mucus | burst (0 dmg, 0.5s tell) | - | chase | 13 | 1 | cap 4 | - | keep |
| 25 | Phlegm Hocker | shooter | none | mucus | proj (8 dmg, 0.3s tell) | - | hocker | 14 | 1.2 | cap 6 | - | keep-simplify |
| 26 | Quantum Swimmer | sprinter | Evasion (35% miss) | static | contact (9 dmg) | - | blink | 12 | 2 | - | - | revise |
| 27 | Interferon | support | none | force | contact (6 dmg) | - | interferon | 14 | 0.9 | cap 3 | - | keep |
| 28 | Planarian | swarm | none | force | contact (10 dmg) | - | planarian | 12 | 0.9 | - | - | keep |
| 29 | Ingrown Hair | chaser | Thorns (5 + 35%) | blood | contact (9 dmg) | - | chase | 12 | 2.2 | - | - | new |
| 30 | Trapped Wind | carrier | Squishy (-35% Force) | fire | burst (14 dmg, 0.5s tell) | - | new_trappedwind | 15 | 0.6 | cap 2 | - | new |
| 31 | Nurse Cell | support | Membrane (30% pool) | force | contact (6 dmg) | - | medic | 13 | 2 | - | - | keep |
| 32 | Litmus Cell | chaser | none | force | contact (10 dmg) | - | chase | 15 | 0 | cap 6 | - | park |
| 33 | Rotifer | leech | none | force | contact steal (8 dmg) | - | thief | 14 | 1.4 | - | - | keep-if-distinct |
| 34 | Puffball | carrier | none | force | contact (8 dmg) | - | chase | 17 | 1.4 | cap 6 | - | keep |
| 35 | Fibrin Weaver | relay | none | force | contact (8 dmg) | - | fibrin | 15 | 0.8 | cap 3 | - | keep |
| 36 | Second Dose | shooter | none | force | burst volley (4.2 dmg, 0.7s tell) | aimed, 7 dmg, speed 360, every 3s | sperminator | 12 | 0 | - | - | spawned |
| 37 | Cytokine Caster | shooter | none | fire | spread (9 dmg, 0.5s tell) | - | new_caster | 15 | 2 | - | - | keep-if-distinct |
| 38 | Platelet Clump | tank | none | force | contact (10 dmg) | - | chase | 15 | 1.2 | cap 6 | - | keep |
| 39 | Plasma Cell | relay | Membrane (30% pool) | force | contact (7 dmg) | - | plasma | 15 | 0.9 | cap 3 | - | keep |
| 40 | Headbutter | charger | none | force | contact charge (18 dmg, 0.7s tell) | - | charge | 16 | 3 | - | - | keep-clarify |
| 41 | Hayfever Cell | shooter, carrier | none | mucus | spread cone (6 dmg, 0.8s tell) | - | hayfever | 16 | 1 | cap 6 | - | revise |
| 42 | Mirror Cell | tank | Membrane (50% pool) | force | contact (9 dmg) | - | mirror | 14 | 1.3 | cap 6 | - | keep |
| 43 | Static Sock | chaser | Squishy (-35% Force) | static | contact (5 dmg); contact (22 dmg, 0.3s tell) | - | new_staticsock | 13 | 1.8 | - | - | new |
| 44 | Shell Cell | tank | Shell x1 (-3/hit) | force | contact (12 dmg) | - | chase | 16 | 1.2 | cap 6 | - | keep |
| 45 | Ghost Swimmer | chaser | Evasion (35% miss) | soul | contact (10 dmg) | - | phase | 13 | 2 | - | - | revise |
| 46 | Mitotic Cell | swarm | Membrane (30% pool) | force | contact (10 dmg) | - | chase | 17 | 3 | splits into splitling | - | keep-simplify |
| 47 | Stem Cell | summoner | Membrane (30% pool) | force | contact (6 dmg) | - | stem | 15 | 0.7 | cap 3 | - | keep |
| 48 | Pepsinator Jr | chaser | none | acid | contact (14 dmg) | - | chase | 24 | 0 | - | cut from random spawns | spawned |
| 49 | Callus | tank | Shell x1 (-3/hit) | force | contact (12 dmg) | - | chase | 16 | 1.1 | cap 6 | - | keep-merge-check |
| 50 | Diatom | shooter, tank | Shell x2 (-3/hit) | force | spread (8 dmg, 0.4s tell) | - | new_diatom | 16 | 1.4 | - | - | keep-if-distinct |
| 51 | Natural Killer | charger | Evasion (35% miss) | force | contact pounce (13 dmg, 0.4s tell) | - | alien | 13 | 1.3 | - | - | keep |
| 52 | Grease Ball | tank | Squishy (-35% Force) | force | contact (11 dmg) | - | chase | 16 | 1.2 | cap 6 | heavy | keep |
| 53 | Birthday Candle | controller | Shell x2 (-3/hit) | fire | pool wax (0.6s tell) | - | new_candle | 14 | 0.8 | cap 1 | - | new |
| 54 | Macrophage | tank | Squishy (-35% Force) | force + acid | contact (16 dmg) | - | chase | 20 | 4 | - | - | keep-clarify |
| 55 | Mother Cell | summoner | Membrane (30% pool) | mucus | contact (10 dmg) | - | summon | 18 | 1.2 | - | - | keep |
| 56 | Enzyme Spire | shooter, controller | Shell x1 (-3/hit) | acid | proj sweep (7 dmg) | spiral, 7 dmg, speed 125, every 0.16s | turret | 18 | 1.5 | - | - | keep |
| 57 | Volvox | swarm | none | force | contact (14 dmg) | - | chase | 26 | 0 | splits into volvoxling x4 | cut from random spawns | review-overlap |
| 58 | Bit of Sweetcorn | tank | Shell x1 (-3/hit) | force |  | - | drift | 12 | 0.8 | cap 8 | - | keep |
| 59 | Stress Ball | tank | Squishy (-35% Force) | force | contact (8 dmg); burst rebound (0 dmg, 0.5s tell) | - | new_stressball | 17 | 1.1 | - | - | new |
| 60 | Brood Cyst | summoner | none | force | proj launch (6 dmg, 0.35s tell) | - | brood | 26 | 1 | - | - | keep |
| 61 | Mucus Wall | support, tank | Membrane (50% pool) | mucus | contact (14 dmg) | - | aura | 20 | 2 | - | - | revise |
| 62 | Booster | elite, shooter | Shell x2 (-3/hit) | force | burst volley (5.4 dmg, 0.7s tell) | aimed, 9 dmg, speed 360, every 4s | sperminator | 14 | 1.1 | - | - | keep |
| 63 | Amoeba | tank, controller | Squishy (-35% Force) | acid | contact engulf (14 dmg, 0.6s tell) | - | engulf | 30 | 0 | - | spongy, grows to 175 | park |
| 64 | Water Bear | tank | Shell x4 (-3/hit) | force | contact (20 dmg) | - | chase | 22 | 0.8 | - | heavy | keep-clarify |
| 65 | Alpha Swimmer | tank | Membrane (50% pool) | force + static | contact (30 dmg) | - | chase | 28 | 0.6 | - | - | review-role |

## Bosses

Per-boss defence and damage type come from `ROSTER_BOSSES`. The old hard counters (+60% to one damage type, immunities, Force passing through) are off in v10 (`boss10.js`); what is left is the defence plus each boss's own mechanic.

| # | Boss | Defence | Damage type | Patterns | Attack types | Strengths | Weaknesses |
|---|---|---|---|---|---|---|---|
| 1 | **THE LITMUS STRIP** | none | acid | litmusdrip, ring, aimedFan, litmusdrip | pool litmusdrip (0.6s tell); spread (8 dmg, 0.6s tell) | Shrugs off three quarters of every damage type but its current colour; Changes colour every 12 seconds (faster when hurt) | Soaked for 4 seconds after every change: anything goes; It likes to test what you are carrying |
| 2 | **THE MUCUS PLUG** | none | mucus | mucusspit, ring, aimedFan, mucusspit | proj spit (8 dmg, 0.4s tell); spread (8 dmg, 0.6s tell) | Seals you into a small ring; Lobs sticky globs that pool on the floor | Break its four plugs: each one widens the ring |
| 3 | **THE CRAMP** | none | blood | crampgrip, aimedFan, crampgrip, spiral | contact grip (18 dmg, 1s tell); spread (8 dmg, 0.6s tell) | Grabs you and drags you in; Rings of bullets up close | Slow: the pull can be outswum |
| 4 | **THE SNEEZE** | none | mucus | sneezecone, aimedFan, sneezecone, spiral | spread cone (28 dmg, 1.2s tell) | Huge cone blasts that hit very hard; Two cones at once when it is nearly done | Every sneeze is telegraphed for over a second |
| 5 | **THE JOHNNY** | Membrane (50% pool) | force | johnnyroll, aimedFan, johnnyroll, spiral | contact roll (18 dmg, 0.9s tell); spread (8 dmg, 0.5s tell) | Membrane: a blue pool that soaks hits first and refills if you let it rest; Shots that hit its front bounce back at you; Blasts and beams on its front do only 40% | Keep up the pressure: it only refills after 2 s untouched. Force is poor into it; Hit it from behind: no protection at all |
| 6 | **MITCH & OSIS** | none | force + acid | spiral, aimedFan, charge, ring | contact (26 dmg, 0.8s tell); spread (10 dmg, 0.6s tell) | Revive each other; Crossfire from two sides | Finish both within 8 seconds |
| 7 | **THE KIDNEY STONE** | Shell x6 (-3/hit) | force | stoneroll, gravel, ring, stoneroll | contact roll (28 dmg, 1s tell); spread gravel (8 dmg, 0.5s tell) | Shell: layers that take 3 off every hit; 40 armour: small hits do almost nothing; Rolls at you, leaving gravel | Acid strips layers for good; a heavy Force hit knocks one loose; Armour shred sticks to it for good; Cracks lose 10 armour each |
| 8 | **THE MATRON** | none | force | wardround, aimedFan, ring, wardround, spiral | burst wardround (0 dmg, 1s tell); spread fan (10 dmg, 0.6s tell) | Heals every enemy nearby on her rounds; Nurse cells orbit her and soak your shots | Learn the telegraph; every big attack shows where it lands first |
| 9 | **THE PHANTOM PREGNANCY** | none | soul | blink, spiral, ring, doubleSpiral | spread ring (10 dmg, 0.6s tell); proj spiral (8 dmg) | Swims through obstacles | Terrain still hurts it: Acid Crypts, cilia and ATP bursts |
| 10 | **THE IMMUNE EYE** | none | soul | blink, glare, flower, doubleSpiral | beam glare (30 dmg, 1s tell); spread flower (10 dmg, 0.6s tell) | Teleports right next to you; Death-stare beam that tracks you | Learn the telegraph; every big attack shows where it lands first |
| 11 | **THE PEPSINATOR** | none | acid | acidrain, ring, acidrain, spiral | pool acidrain (6 dmg, 0.6s tell); spread ring (10 dmg, 0.6s tell) | Acid puddles eat into you; Acid only does half damage to it; Splits off blobs at 60% and 30% health | Learn the telegraph; every big attack shows where it lands first |
| 12 | **THE MACROPHAGE QUEEN** | Squishy (-35% Force) | force | summon, devour, spiral, aimedFan | contact devour (25 dmg, 0.8s tell); spread (10 dmg, 0.6s tell); proj spiral (8 dmg) | Squishy: blunt Force hits lose a third and barely push it; Devours her own minions to heal; Summons swarms of swimmers | Acid, Static, Fire, Blood and Alien land in full; Slow: kite her and clear the snacks |
| 13 | **THE FEVER** | none | fire | firering, spiral, firering, ring | spread firering (12 dmg, 0.7s tell); pool scald (0.5s tell) | Rages below 35% health: twice as fast | Gluing it snuffs out its current attack |
| 14 | **CHAD PRIME** | Evasion (35% miss) | force | dash3, tailwhip, aimedFan, dash3 | contact dash3 (32 dmg, 0.8s tell); contact tailwhip (20 dmg, 0.5s tell); spread (10 dmg, 0.5s tell) | Evasion: a third of your shots and swipes simply miss; Blindingly fast triple dash; Flexes: dodges 30% of your shots | Bursts, Beams and Pools never miss; Blasts, beams and pools never miss him |
| 15 | **THE ANTIBODY COLOSSUS** | Shell x5 (-3/hit) | force | ring, charge, aimedFan, charge | spread ring (12 dmg, 0.7s tell); spread fan (12 dmg, 0.7s tell); proj barrage (10 dmg); contact charge (35 dmg, 1s tell) | Shell: layers that take 3 off every hit; 12 armour: small hits barely scratch it; Cannot be knocked back or glued | Acid strips layers for good; a heavy Force hit knocks one loose; Armour shred sticks for longer; Charges are telegraphed: side-step |

## Cut from the roster

Marked `cut` in `roster.js` and removed from `ENEMIES` (not in the live game):

- **Pinworm** (HP 70, dmg 12): Cut candidate: a tougher Also-Ran. Merge into it, or give it one clear movement behaviour (wriggle in S-curves).
- **Plasmodium** (HP 380, dmg 22): Cut candidate: a bigger Amoeba that splits into Amoebas. Keep only if the split gives a genuinely different formation.

Enemies cut from random spawns but still spawned by id (events and bosses): Spermlet Swarm, Daughter Colony, Paramecium, Pepsinator Jr, Volvox.

## Design notes per enemy (from roster.js)

- **Lost Tadpole**: Joke: 1 HP, harmless, asks for directions. Capped numbers.
- **Spermlet Swarm**: Cut candidate: a second Krill. Keep only if its formation or movement differs (it does not, today).
- **Krill**: Read: a darting shoal. Counter: area damage and a clear lane; numbers, not individual complexity.
- **Spore**: Spawned only, from Puffball. Counts against Puffball's budget.
- **Glitter**: Comes back once after you kill it (joke version of the Booster's second life). Area damage.
- **Mosquito**: Read: swells as it feeds, then retreats. Counter: kill it within 4 s for half the bite back (FASTEST picks it). Dies into a small blood pool. Not Extraction.
- **Sprinter**: Read: small and quick, zig-zags. Counter: FASTEST, Mucus Snare, or a Spread/Burst that ignores its misses.
- **Broodling**: Spawned only, from the Brood Cyst; a plain chaser, or a kamikaze after the cyst bursts.
- **Stray Pube**: Joke Controller: touching it tangles you for about a second. Short and capped.
- **Daughter Cell**: Spawned only, from Mitotic Cell. Clearly the result of another enemy's action; counts against its source's budget.
- **Also-Ran**: Read: a plain rival swimmer. Counter: move and shoot; it teaches kiting.
- **Bogey**: Sticks to you, 5% slower each up to 20%. Merge into the Mucus slow if it overlaps Snot Bubble's patch.
- **Acid Bubble**: Read: a green bubble that rushes you, area marked before it pops. Counter: kill it at range; the Acid Pool must look nothing like a projectile.
- **Navel Fluff**: Joke: drifts about; flavour only. Nobody knows where it comes from.
- **Candida**: Event-only regular enemy (the infection event). Buds a daughter every few seconds with a visible swelling, hard cap on colony size. Review: no unexplained extra spawn.
- **Matchstick**: Read: spark and flare as it strikes, lane lit before it runs. Counter: step out of the lane; do not kite back through the trail. Spawn 2 to 3 with a Shooter, never with another Pool-maker.
- **Antibody**: Read: yellow Y that stops to fire. Counter: break line of sight, close the gap, SHOOTERS FIRST. The one plain Projectile shooter.
- **Killer T-Cell**: Read: a thin lane lights up for about a second, then fires. Counter: change lane; Force or Static interrupts within the wind-up. Not a third "aimed shot" enemy.
- **Daughter Colony**: Spawned only, from Volvox; goes if Volvox goes. If kept: cap total population and differ from ordinary swarms.
- **Complement Protein**: Marks you so enemies hit harder for 5 s; the mark must be obvious on you (icon plus outline). Flimsy: kill it as it closes.
- **Cortisol Puff**: Visible aura: allies nearby swim 30% faster. Kill it and the crowd calms down.
- **Leech**: Drains your stamina within 120 (a visible line to you). Counter: burst it, disengage, deny contact.
- **Paramecium**: Cut candidate: a straight-line ciliate that backs off after a bump. Keep only if that retreat reads clearly different from the Sprinter.
- **Snot Bubble**: Swells with every hit (max once per 0.1 s); bursts into a Mucus patch. Any Static hit pops it at once and harmlessly. Counter: kill it small, step out of the marked burst.
- **Phlegm Hocker**: Simplify: a visible sticky glob that leaves a Mucus patch. One avoidable shot; drop the cleanse rule. Counter: strafe; the patch feeds Static, Fire and Acid reactions.
- **Quantum Swimmer**: Revise: short predictable relocation with a puff where it will land; never untargetable for more than a beat. Counter: Burst or Beam ignore its Evasion.
- **Interferon**: Gives allies in range a capped Membrane (visible ring). Overlaps Mucus Wall: keep one. Counter: kill it first; it hangs back.
- **Planarian**: A looping flatworm: destroy a segment and it splits in two, each half slowly regrowing. Counter: area damage on the pair.
- **Ingrown Hair**: Read: a bristling dark curl, spines out. Counter: Contact weapons take 5 + 35% of the hit back; use Projectile, Spread, Burst, Beam or Pool and it is an ordinary chaser.
- **Trapped Wind**: Read: a swelling, wobbling cloud; flickers when Burning enemies are near. Counter: light it among enemies, or keep away. One Burst, no chain. Prototype only after Matchstick and Candle show it is a distinct decision.
- **Nurse Cell**: Read: green cross, ring pulse each heal. Counter: reach it (it keeps its distance); no endless sustain (per-target heal cap).
- **Litmus Cell**: Retired (decision D2): the hard type-resist is gone; the idea lives on in the Litmus Strip boss. Kept by id, never spawned.
- **Rotifer**: Thief: hoovers up your XP; killing it returns it. Keep only if the stolen thing and the recovery are obvious (a visible trail of motes).
- **Puffball**: Burst and Pool hits burst it into Spores. Releases an existing threat, as the Carrier rule allows. Counter: single shots are fine; save the blasts for after.
- **Fibrin Weaver**: Tethers up to 4 allies so they cannot be knocked back; visible threads, killing it frees them.
- **Second Dose**: Spawned only, from the Booster: the second life. Counts against its source.
- **Cytokine Caster**: One job only: a telegraphed fan of Fire shots (damage). No buff or control. Counter: sidestep the fan. The Spread shooter beside Antibody (Projectile) and Killer T (Beam).
- **Platelet Clump**: Piercing shots lose one extra pierce passing through it (they are no longer stopped dead). Counter: blasts and chains go round it.
- **Plasma Cell**: Shooters within 200 fire 40% faster. The Shooter + Relay pairing; kill it first.
- **Headbutter**: Read: crouches and a lane lights up. Counter: step out of the lane; Force or Static interrupts. Tell must be long enough to leave.
- **Hayfever Cell**: Revise: AH... AH... wind-up, then one clearly signalled reflection of a status you gave it. Counter: step out of the cone; go easy on the statuses.
- **Mirror Cell**: Its polished front is now a recharging Membrane all round (no reflection). Counter: burst it with Static or heavy hits, or outlast the recharge.
- **Static Sock**: Read: crackles harder in 3 steps as it travels. Counter: kill it before full, avoid its path, or dodge the zap. Crackle is its own meter, not a status.
- **Shell Cell**: The plainest Shell enemy (the old 15 flat armour becomes one layer). Counter: Acid or one heavy hit sheds it, then it is soft.
- **Ghost Swimmer**: Revise: brief fade (1.4 s) with a flicker before it goes and returns; stays targetable (Evasion, not immunity). Counter: wait it out, Burst or Beam.
- **Mitotic Cell**: The one true splitter: divides once into Daughter Cells, hard cap on total population (splitCap = generations). Counter: area damage on the pair.
- **Stem Cell**: Revives a dead ordinary enemy every 10 s with a visible gather-and-glow; strict cap. Counter: kill it before it works.
- **Pepsinator Jr**: Parked. If revived as a small boss, it uses a recognisable subset of the Pepsinator's attacks (acid rain, one pool).
- **Callus**: Crit immunity gone. Keep only if it differs from Shell Cell: one thicker layer (thickLayers: layerHpPct x2).
- **Diatom**: Glass-shelled turret: 2 Shell layers; Acid or heavy Force sheds them. A slow full ring (not a fan), so it differs from the Caster. Counter: outrange it, or strip the shell.
- **Natural Killer**: Weaves in, crouches (the tell), then pounces in a straight line. Counter: leave the lane when it crouches; Burst and Beam ignore Evasion. Bleeds acid on death (flavour).
- **Grease Ball**: Homing shots slide off it; Squishy covers its knockback resistance. No slick on you any more (Lubricated is retired). Counter: aim properly, or use pools and auras.
- **Birthday Candle**: Read: flame flares before each drip; wax cools and hardens; lit patches glow. Counter: kill it, keep Mucus away, route round the walls, or lure enemies into the lit patch. One per arena.
- **Macrophage**: Read: big soft pink blob; Force visibly dents it and barely pushes it. Counter: any other type works normally; kite, it is slow.
- **Mother Cell**: Read: ring pulse and a bulge before each pair of Sprinters; strict cap of 6 alive. Counter: SHOOTERS FIRST picks it; area damage for the adds.
- **Enzyme Spire**: Stationary turret with a slow rotating stream (Projectile; Beam is the alternative). Read: the lane is the rotation. Counter: reposition out of the sweep, or prioritise it.
- **Volvox**: Cut candidate: a third splitter beside Mitotic Cell and Plasmodium. Keep only if the ring formation or a single big split adds a distinct role.
- **Bit of Sweetcorn**: Joke Tank: tough and harmless; a Shell punchbag. Do not waste your best hits on it.
- **Stress Ball**: Read: squeezes tighter with each Force hit; the 5th is unmistakable. Counter: keep your distance when fully squeezed, or use another type. Drop it if the knockback feels awkward.
- **Brood Cyst**: Swells for 0.35 s, then lobs a Broodling; killed, the rest scatter and dive as kamikazes. Counter: kill it from range before its brood is out.
- **Mucus Wall**: Revise: gives nearby allies a visible, capped Membrane; never untouchable. Overlaps Interferon, keep one. Counter: Acid; avoid Static, which recharges it; separate it from allies.
- **Booster**: Elite: red sight line, then a three-round volley; when killed, Second Dose climbs out. Counter: move when the line appears; both lives need killing.
- **Amoeba**: Revise or test: engulf needs a clear tell, a short hold (about 1.2 s) and a reliable escape. Counter: kite it; it is slow.
- **Water Bear**: Four Shell layers make it feel unlike the soft Macrophage. Counter: Acid erosion or heavy Force; or just walk away, it is slow.
- **Alpha Swimmer**: Identity is the regenerating Membrane: rewards keeping up pressure, punishes breaking off. Counter: sustained damage or Burst; Static would only recharge it.
