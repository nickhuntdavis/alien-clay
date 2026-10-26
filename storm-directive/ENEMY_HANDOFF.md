# Enemy optimisation: handoff (25 Oct 2026)

Read `CLAUDE.md` and `NOTES.md` first, then `ENEMY_STATS.md` and `ENEMY_BEHAVIOUR.md` (the generated tables of all 65
enemies and 15 bosses) and `redesign docs/ENEMY_DESIGN.md` (the design). Rules live in `redesign docs/COMBAT_MATRIX.md`.
This file hands the enemy work to later sessions as small, self-contained tasks. Each task names its model: **Haiku**
for mechanical edits with no judgement, **Sonnet** (medium effort unless stated) for clear specs, **Opus** for sims,
tuning and design calls. Each task is one session, one branch, one commit, its own `changes/<branch>.md` fragment, and
ends with `./run.sh quick <its tests>` and a Fast APK build (CLAUDE.md). Never write player-facing text: use
`TODO_COPY:<id>` placeholders and give the brief in the reply.

Line numbers are from v10.125 and drift as other sessions merge: grep the quoted identifier first.

## The problem (user, 25 Oct)
"Assess our enemies: how they work, gaps, vestigial features that no longer fit the latest build, coding issues, so we
can optimise enemies to be fun, effective and fitting."

## What the assessment found
Sims (bot, mortal): Petri Dish 0/4 wins, every death to a boss (waves 10, 10, 15, 20), no regular wave killed the bot and
waves 3, 7, 18 did 0 to 1 damage; slow waves Mucus Wall 111 to 158 s, Stress Ball 142 to 174 s, Static Sock up to
132 s, Summoner+Charger 193 s; boss fights 86 s, 121 s, 322 s (Twins, 73k HP at wave 15), wave 20 Failed Experiment
728k HP. The Race 0/3, deaths at 3:12, 4:20, 5:00; the Sprinter was the top hurt source every run.

Code (five audits, verified by reading each path):
1. Boss rewards never open under v10: `draftBox` (draft.js:180) returns false for `relic` and `spoils` and the loop
   drops the box (game.js:2990). 48 relics, trophy, SPOILS and Gene Swap are dead. A boss kill gives a heal, 12 gems and
   a breather.
2. Boss HP is formula-derived and unplayed: wave 10 13k to 26k, wave 15 73k to 139k, wave 20 430k to 730k
   (campaign.js:226 `CAMP.hp`). The Failed Experiment (about 725k) takes wave 15 or 20 half the time once a past run
   exists (campaign.js:71), and its move table maps v9 weapon ids (`FAILED_MOVES`, campaign.js:251) so it always gets
   aimedFan, spiral, ring. Race boss HP is a sawtooth (bosses.js:20). Sneeze and glare call `hurtPlayer` directly and
   skip `V10_DIFF` (bosspack.js:122, bosses.js:157).
3. Roster behaviours promised but not built: Acid Bubble instant unmarked blast and no pool (game.js:1512, 1069); Snot
   Bubble bursts instantly (foes3.js:98); Killer T `new_lancer` has no AI and falls back to the old aimed shot
   (newfoes.js:45); Cytokine Caster and Diatom are both the legacy 8-shot ring with no tell (game.js:1489); Mucus Wall's
   aura feeds dead armour (game.js:1532); Ghost Swimmer is fully immune while phased (game.js:796); Quantum Swimmer puffs
   after the jump (game.js:1514); Amoeba's engulf never targets you (arsenal.js:424); Hocker leaves no patch
   (foes3.js:60); Mother Cell, Nurse and Stem Cell caps are not enforced (game.js:1543, 1518; foes2.js:282); hidden sixth
   defences: Interferon flat absorb (foes2.js:155), Water Bear tunnelling x0.08 (game.js:805), Callus crit immunity
   (game.js:826), Platelet stops piercing for good (foes2.js:188); elites are x5 HP (game.js:1194) and only Smouldering
   of `ROSTER_ELITE_MODS` exists.
4. Seven enemies live outside `ROSTER` and still run v9 rules in the Race: Mirror Cell, Grease Ball, Platelet Clump,
   Litmus Cell (`foes2Dmg` weak/resist, foes2.js:145; Litmus -65% to your most-dealt type, foes2.js:207), Brood Cyst,
   Broodling, Planarian. Grease Ball's slick makes you Lubricated, a retired Oil status (pstatus.js:76). Level 1's five
   enemies and the Tartar Colony are copies taken before the roster loads (levels.js:29, 45): armour and weaknesses kept,
   no v10 defence.
5. Boss mechanics against the v10 rules: Chad Prime rolls `dodge: 0.3` (data.js:836, bosses.js:118) then Evasion 35%;
   the Johnny keeps its front bounce and 0.4 front multiplier on top of its Membrane (bosspack.js:46, 252); Litmus Strip
   resists 75% (`BP.wrong`, bosspack.js:12) and its colour list still has poison, oxi, salt and lacks flame
   (bosspack.js:13); Kidney Stone has Shell x6 but no phase cracks a layer; the Fever's rage halves its attack rate
   (bosses.js:230); Mitch & Osis get no defence (boss10.js:22 ignores `parts`); no telegraph for boss charge, blink, ward
   round or summon; aimedFan, spiral and ring make up about half of every boss's cycle.
6. No Squishy or Membrane knockback cut exists; every Snared enemy takes 1.5x knockback from everything (game.js:866).
7. Wave mode uses 17 of about 56 live enemies (`WAVES10`, waves10.js:27-70): relays, the sniper, the Booster, Diatom,
   Spire, Amoeba, Rotifer, Water Bear, Alpha, Natural Killer, Interferon, Complement, Stem, Leech, Puffball and the jokes
   never appear. Entourage `wisp` slots become Also-Rans (campaign.js:122 swaps ids with `from > PT+90`; cut ids get
   `from: 99999`, newfoes.js:47).
8. Player-facing text names dead mechanics (armour, shred, Cooties, Oil, Water, Rewind, gluing, half-damage Acid) in
   intro.js, foes2.js, foes3.js, data.js boss cards, glossary.js, ui.js Field Guide rules, inspect.js (Armour and WEAK TO
   rows), render.js `[ARMOUR N]` tag; HIGHEST ARMOUR targeting ranks a dead stat (autorun.js:26); "FIRST SIGHTING n OF 41"
   can never complete; Ingrown Hair's sighting line is keyed `thorny` (voice.js:504).
9. Dead code with no callers: chem.js `chemFoe`, overloads, triples, terrain, puddle, splash, ghost; foes3.js
   `foes3Chem`; pstatus.js Sick and Wet; game.js stain boons (812), `e.shock` arc block (889), shred (863, 1395);
   typefx rings for retired types; inspect.js `RX_PAIR`; pinworm and plasmod in intro.js and junk.js; boss `weak`,
   `resist`, `noForce`, `weakAoe`, `shredStick`; `armour` on every def; `MICROBES.litmus` defined twice (foes2.js:340,
   bosspack.js:445); `tests/tools/guide.js` loads data.js without roster.js so GAME_GUIDE.md lists cut enemies.
10. Structure: AI dispatch split between a switch in game.js:1435 and `FOE_AI`; shapes between render.js:363 and
    `MICROBES`; `fightTick` loops every enemy every frame at any distance with nested loops (fight.js:296-320); one
    throwing AI handler aborts the rest of the frame (game.js:2981); 15 enemies and 2 bosses (Colossus, Immune Eye)
    appear in no test.

## Decisions (user, 25 Oct 2026; final, tasks follow them)
- D1 Boss reward: **rebuild relics for v10** (tasks A1a and A1b). Rival trophies (`rrelic`) come back with them.
- D2 Litmus Cell: **retire** (`w: 0`, kept by id, `status: 'park'`).
- D3 Amoeba: **park** at `w: 0` until an engulf is designed.
- D4 Mucus Wall and Interferon: **keep both**, one Membrane-aura mechanism, different range.
- D5 Water Bear tunnelling: **remove**; Shell x4 is its identity.
- D6 Failed Experiment: **wave 20 only, 1 run in 4**.

## Order and parallelism
Batch A: A1a and A2 to A7 run as seven parallel sessions (A1a and A2 both touch bosses.js on different lines: merge is clean); A1b runs after A1a, A2 and A3 have merged. Run A4
before B3 and B4 (they touch roster.js rows). Batch B tasks each add their own file. Batch C needs A1, A2 and B done
first (sims measure the real fights). D after C. E last.

| Batch | Tasks | Model | Time |
|---|---|---|---|
| A clean-up | A1a, A2 to A7 in parallel, then A1b | Sonnet; A6, A7 Haiku; A1b Opus | one afternoon, plus one day for A1b |
| B behaviours | B1 to B11 | Sonnet (B2, B4, B7, B11 high effort) | two to three days |
| C bosses | C1 to C3 | Opus (C2 Sonnet high) | one day |
| D encounters | D1, D2 | Sonnet | half a day |
| E delete, tests, robustness | E1 to E5 | Sonnet, E5 Haiku | one day |

Each task below: Goal, Steps, Test, Don't. Fragment line: `Systems: enemies` (or `bosses`, `wave-mode`), plus the
files, in `changes/<branch>.md`.

---

## Batch A: clean-up (ship once, as one merged build)

### A1a Relic boxes open again (Sonnet, 2 hours; before A1b)
Goal: a boss kill opens the RELIC screen, then SPOILS, as it did under v9; a rival kill opens its trophy.
1. draft.js:180 `draftBox`: add `relic`, `spoils` and `rrelic` to the kinds that open. `v10Loot` (v10.js:120) already returns null for them, so `genLoot` (game.js:484-485) builds the cards from `spoilsRelics` / `spoilsOpts`; confirm `rrelic` has its own `genLoot` branch (grep `rrelic` in game.js and rivals.js) and the screen titles at ui.js:888-907 still render.
2. `dirGate` (director.js): relic boxes carry `now: true` (bosses.js:295); confirm the director lets them through at once in every mode (it whitelists `relic` in `rplanFree`, raceplan.js:27; add `spoils` and `rrelic` there too).
3. Wave mode holds boxes until the break (`waveHoldsLoot`): a relic should open straight after the boss dies, before the next-wave button. Check `waveHoldsLoot` (waves.js) and exempt `now` boxes if it does not already.
4. Do not change any relic effect yet (A1b). `applyRelic` (bosses.js:342) runs as is.
Test: `./run.sh quick bosstest rivalwave`; add to bosstest: after `bossDown`, `G.lootQueue[0].kind === 'relic'`, `draftBox` returns truthy, and `UI.openLoot` renders 3 cards; after picking, `G.relics[id]` is true. `node sim/wave20.js 1 mortal`: the `screens` field shows a relic after wave 5, no page errors.
Don't: touch relic descriptions, data.js RELICS, spoils.js effects.

### A1b Relics ported to v10 (Opus, one day; after A1a, A2 and A3)
Goal: all 48 boss relics (data.js:904-964) and the rival relics (data.js:1258, rrelics.js) do what their card says under v10 rules, or are replaced.
1. Audit each relic's apply code (bosses.js:342-505 `applyRelic` and its hooks, bosspack.js:286-370 `bpRelicApply`, rrelics.js) against the live systems. Known breakages from the audit: Border Wall, Calcified, Ribbed, Trophy Hide add `P.armour`, which `pdefHurt` replaced (pdef.js:8, 18) (port: player Shell layers via `PDEF`, pdef.js); Acid Tongue sets Cooties (bosses.js:374) and Ulcer / Bad Blood deal `elem: 'poison'` (bosses.js:384, 410) (port to `fire`, Acid, through `fightHit`); Blue to Red / Running Hot set v9 `e.burn` (bosspack.js:305, bosses.js:375) and Fever Dream / Heatstroke count it (bosses.js:385, 500) (port to the v10 Burn bar `cd.burnT`, fight.js); Test Strip only matters for the Litmus Strip (keep); Gene Swap (spoils.js:30 -> game.js:688) picks from all `ELEMENTS` keys (restrict to `V10_TYPES`, v10.js); any relic touching Rewind, chrono, stains or dyes is retired (`G.dyeBoon`, `startRewind` are off: norewind.js).
2. For each relic: keep (works), port (one line each in the fragment: old mechanic -> v10 mechanic), or retire (remove from `RELICS` and the boss's `relics` list; every boss keeps at least three). Where the card text no longer matches, replace it with `TODO_COPY:relic_<id>_desc` and brief it (the user writes all card text).
3. `spoils.js` SPOILS options and the smuggled trophy: same audit.
Test: new `relictest`: in the Lab Bench, take every relic once and assert its hook fires (a Shell layer appears, a Burn bar fills, a heal lands); `./run.sh quick bosstest relictest`; full suite before shipping (relics touch hurtPlayer, damageEnemy and killEnemy hooks).
Don't: invent new relics; rename ids (saves and `RUNLOG` store them).

### A2 Boss rules against v10 (Sonnet, 2 hours)
Goal: no boss has a second defence or a retired-type rule.
1. Chad Prime: delete `dodge: 0.3` from data.js:836 (Evasion from the roster stays). `bossDodges` (bosses.js:116) then only handles the Johnny bounce; make it return false when `e.def.dodge` is missing (it already does).
2. The Johnny: remove the front bounce and the 0.4 front multiplier (bosspack.js:46-58, :252 and the `BP_BACK` global at :15, :49, :250). Its Membrane (roster.js:405, applied by boss10.js) is the mechanic.
3. Litmus Strip: `LITMUS_TYPES` (bosspack.js:13) becomes the seven live ids `phys fire shock ice arcane soul flame`; drop poison, oxi, salt from every list there (bosspack.js:36-37). `BP.wrong` 0.25 becomes 0.65 (a 35% resist, matching roster.js:400 `resistCap`). Keep the x1.5 on its colour.
4. Mitch & Osis: boss10.js:22 reads `R.def`; when the roster entry has `parts`, give each twin its own `v10def` from `parts` (one Membrane, one Shell per the roster).
5. Kidney Stone: in `bpPhase` (bosspack.js, the enrage phases), each phase sheds one Shell layer (call the same path fight.js uses when heavy Force sheds a layer; grep `layers` in fight.js). Delete the `armK`, shred-stick and "CRACK! -10 ARMOUR" code (bosspack.js:31, :224, :260).
6. The Fever: rage (bosses.js:228-230) follows the roster (`speedMult 2`, attack rate x1.5 faster, not slower: roster.js:385). Remove the `resist.fire === 0` checks (bosses.js:225, 375) and the `e.frozen` glue trigger if nothing can set it on a boss (fight.js:317 Conjoined and :253 Held in Suspension are the only setters: check whether either reaches bosses; if not, delete the trigger).
Test: `./run.sh quick bosstest bossshot`; `node sim/wave20.js 1 mortal --boss prime` and `--boss johnny` and `--boss litmus` and `--boss stone` (one run each, god mode is fine: `node sim/wave20.js 1 god --boss prime`) and confirm no page errors.
Don't: change boss HP (C1), change boss copy (list the lines that now lie in your reply with a `TODO_COPY` id each).

### A3 Armour display and targeting purge (Sonnet, 2 hours)
Goal: nothing the player sees or targets by refers to armour.
1. inspect.js:101-106: remove the Armour stat row and the WEAK TO / RESISTS rows (v10 defences are already shown by fight.js's panel section; check `inspect.js` for the defence row and keep it).
2. render.js:2451: remove the `[ARMOUR N]` boss tag. render.js:2142: remove the armour arc drawn for `auraArm`.
3. HIGHEST ARMOUR directive: find its id in `DIRECTIVES` (aim.js or data.js) and in autorun.js:26, 38 and game.js:221 (`effArmour` as a targeting key). Replace the directive's scoring with effective HP from the defence (Membrane pool + Shell layer health; see `ENEMY_STATS.md` "Effective HP") and rename its id only if no save stores it (grep `aimAt` in meta.js; if saves store directive ids, keep the id and change the label to `TODO_COPY:aim_tough_label`). If TOUGHEST already does this, remove HIGHEST ARMOUR from the menu and map saved uses to TOUGHEST.
4. Leave the `armour` fields on defs (E1 deletes them).
Test: `./run.sh quick inspecttest aimtest` (grep tests/ for the real names: `ls tests | grep -i 'inspect\|aim'`).
Don't: touch combat numbers.

### A4 Strays into the roster (Sonnet, 3 hours; before B3 and B4)
Goal: every live enemy is a `ROSTER` row with one of the five defences or none, and `foes2Dmg` applies no type multipliers.
1. roster.js: add rows for `mirror`, `grease`, `platelet`, `litmus` (the cell), `brood`, `broodling`, `planarian`, copying hp/speed/r/dmg/xp/color/shape/ai/from/w/cap from their defs (foes2.js:12 area, brood.js:8, planarian in brood.js or foes2.js: grep). Defences per `redesign docs/ENEMY_DESIGN.md` 5.3: Mirror Membrane, Grease Squishy, Platelet none, Litmus Cell none (D2 default: `w: 0`, `cut: true`, `status: 'revise'`), Brood Cyst none, Broodling none, Planarian none. `status: 'keep'` unless listed. `role` and `dmgType` from the table there; brood `summoner`, planarian `swarm` (it splits).
2. foes2.js:145-153 `foes2Dmg`: delete the weak/resist multiplication. Keep any non-type code in that function.
3. Mirror Cell: remove the front reflection (foes2.js:166-178 and the hook at game.js:2128 `foes2Shot` or similar); its Membrane is the defence now. Grease Ball: keep the homing slide and `heavy`; remove the player Lubricated slick (pstatus.js:76-101 `pstGrip`, game.js:2313) and the Oil look on enemies in the slick (game.js:2268 `e.fizz`); the slick zone itself may stay as a visual or go. Platelet: piercing shots lose one pierce passing through (replace the `pr.dead`/stop at foes2.js:188 with a decrement of the shot's remaining pierces; grep `pierce` in modifiers.js and piercefx.js for the field).
4. newfoes.js `nfWire` then strips `weak`, `resist`, `armour` from them automatically; confirm with `node tests/tools/enemytables.js` (regenerates `ENEMY_STATS.md` and `ENEMY_BEHAVIOUR.md`; commit both).
Test: `./run.sh quick newfoestest fighttest spawntest` plus any f2 test (`ls tests | grep f2`). `node sim/race.js 1 mortal` with no page errors.
Don't: rebalance HP. The "Oil bleaches it", "Acid etches", "Mucus gums it up" intro lines (foes2.js:61-66) are now wrong: list them with `TODO_COPY` ids in your reply; do not rewrite them.

### A5 Level 1 enemies on the v10 roster (Sonnet, 1 hour)
Goal: Level 1 enemies and the Tartar Colony use the wired roster entries and v10 defences.
1. levels.js:29-35 `LV_FOES`: build the copies lazily (a function called at level start, after `nfWire` has run) or copy from `ENEMIES` inside `lvStart`. Register each copy so `fightId` finds it (grep `fightId` in fight.js for how ids resolve; the simplest is to give each copy an `id` that exists in `ROSTER`, or add the level variants to `ROSTER` with `w: 0`).
2. levels.js:45-50 `LV_BOSSES.tartar`: copy from the Colossus at level start, after boss10.js has set `v10def`, so it gets Shell x5. Its description still says "8 armour": replace with `TODO_COPY:tartar_desc` and brief it.
3. levels.js:525: boss HP applies the same 0.45 v10 knob the other modes use (`V10_DIFF`, grep for the boss knob in campaign.js:226 and bosses.js:20).
Test: `./run.sh quick lvshot`; `node sim/lvsim.js 1 mortal kite steer` with no errors.

### A6 Bookkeeping fixes (Haiku, 1 hour)
Goal: counters, keys and generated docs match the live roster.
1. voice.js:504: key `thorny` becomes `ingrown`.
2. intro.js:29-30: remove `plasmod` and `pinworm`. junk.js: remove their `JUNK_POWERS` rows. ui.js:754 and :1234: the "n OF N" count uses only ids with `w > 0` or present in any `WAVES10` mix.
3. `tests/tools/guide.js:1-12`: load roster.js and newfoes.js (and hooks.js if newfoes needs it) after data.js and foes*.js so the guide sees the wired table and no armour column; run `node tests/tools/guide.js` and commit `GAME_GUIDE.md`.
4. `MICROBES.litmus` is defined in foes2.js:340 and bosspack.js:445. Rename the boss's to `litmusstrip` and point the boss def's `shape` at it (data.js boss `litmus` row and roster.js `ROSTER_BOSSES`).
Test: `./run.sh quick introtest bossshot`.

### A7 Copy brief for the stale enemy text (Haiku, 1 hour; no code change)
Goal: one list the user can write against. Write `ENEMY_COPY_BRIEF.md` with one row per player-facing string that names a dead mechanic: file:line, the current text, a proposed `TODO_COPY` id, the job of the line, the facts it must now convey (the enemy's real v10 defence and attack from `ENEMY_BEHAVIOUR.md`), the length limit (same as the current text), and one neighbour line. Sources: intro.js:13, 22, 31, 39, 41; foes2.js:61-66; foes3.js:23-25; data.js:811, 835 (the duplicated "never miss" lines), 892-896; levels.js:42-43; glossary.js:22-23, 43, 50-51, 56, 62-65, 84; ui.js:1319-1322; pstatus.js:28-31; boss10.js:30 (the fallback "Learn the telegraph" line shown for Matron, Eye and Pepsinator, whose attacks have no tell until C2).
Don't: change any code or text.

---

## Batch B: build what the roster promises (one new file per task, loaded after `newfoes.js` in index.html)

### B1 Marked bursts: Acid Bubble and Snot Bubble (Sonnet, 3 hours)
Goal: both Burst enemies show their area before it goes off, as COMBAT_MATRIX 13 requires.
1. New file `bursts10.js`. Acid Bubble (`bomber`): when within trigger range, stop, show a 0.5 s ring of radius 60 (reuse the `warn` hazard drawing in render.js:2759 or the Stress Ball tell in newfoes.js:335), then burst for 18 (roster.js `bomber.atk`) and leave an Acid Pool (the world object fight.js uses for Acid Pools: grep `acidPool` or `pool` in fight.js and newfoes.js's Matchstick trail). Replace the contact-triggered instant blast (game.js:1512 -> `bomberBlast`, game.js:1069) with this; the old blast stays for a death by damage if the roster says so (it does not: on death it just pops the pool).
2. Snot Bubble: 0.5 s tell ring before the burst (foes3.js:98-106), pool radius per roster `snotbubble.atk[0].leftover` (80), Static still pops it at once and harmlessly.
Test: add to `newfoestest`: an Acid Bubble within range does no damage in its first 0.5 s and a pool exists after; `./run.sh quick newfoestest f3test`.

### B2 Killer T-Cell beam (Sonnet high, 3 hours)
Goal: the sniper is a Beam with a 0.9 s lane tell.
1. New file `lancer10.js` with `FOE_AI.new_lancer`: hold range, draw a thin lane to the player for 0.9 s (like the Headbutter lane, render.js:2018, in Blood's colour), then fire a 0.4 s Beam along that fixed lane: rapid small hits totalling 16 (roster.js:139), stopping at the first thing hit; it does not track after the tell.
2. The hit goes through `hurtPlayer` with an attack type of `beam` so pdef.js:84 treats it as Beam (Evasion never applies, leaving the lane stops it). Remove the `shoot` row from roster.js:139 so `nfWire` no longer falls back (newfoes.js:45).
Test: pdef test for beam hits (grep `beam` in tests/pdeftest.js); add to `newfoestest`: a player who steps out of the lane during the tell takes no damage.

### B3 Cytokine Caster fan and Diatom ring with tells (Sonnet, 2 hours; after A4)
Goal: the two are different shooters, each with a tell.
1. New file `shooters10.js`. Caster: 0.5 s tell (a fan outline), then a Spread of 5 Fire shots over 70 degrees (roster.js:115 `atk`); delete its `shoot` row. Diatom: 0.4 s tell (ring outline), then a slow full ring of 6 (roster.js Diatom `atk`); delete its `shoot` row. Use `shootPattern` 'aimedFan' and 'ring' (game.js:1626) with a tell flag, or fire from your own code.
Test: `./run.sh quick newfoestest foeshot`.

### B4 Mucus Wall and Interferon: a real capped Membrane grant (Sonnet high, 3 hours; after A4)
Goal: allies near either get a visible, capped, temporary Membrane; nothing untouchable.
1. New file `foeaura10.js`. Every 0.5 s, allies within range (Mucus Wall 160, Interferon 220: use the roster `aura`/`gives` numbers) get `e.auraMem = { pct: 0.25, until: G.t + 1.5 }`. Hook fight.js's Membrane pool the way foemem.js does (`fightCd -> d.memFrac`; read `e.auraMem` there, capped at 25% of max HP, no stacking with a native Membrane beyond the cap). Draw it with `foeMemDraw`.
2. Delete `auraArm` (game.js:1532 and its reader at game.js:260) and the Interferon flat absorb (foes2.js:155 `e.ifn`).
Test: add to `foememtest`: an Also-Ran next to a Mucus Wall soaks its first hit into a Membrane that is gone 1.5 s after the Wall dies.

### B5 Ghost Swimmer and Quantum Swimmer (Sonnet, 2 hours)
Goal: phasing is Evasion, not immunity; blinks show where they land first.
1. Ghost: while `e.phased` (game.js:1536 timing), it stays targetable and takes hits at its Evasion cap (`miss: 0.5`, roster.js), contact off, drawn flickering; delete the `return 0` at game.js:796 and the contact skip at :1582 only if contact should also go (roster: "stays targetable"; keep contact off while phased).
2. Quantum: pick the destination, draw the puff there for 0.4 s, then jump (game.js:1514-1517); never more than one jump per 2 s.
Test: add to `newfoestest`: a phased Ghost loses health from a Burst hit.

### B6 Summon and heal caps (Sonnet, 1 hour)
Goal: every cap the roster states is enforced.
1. Mother Cell: `summon.cap` 6 alive children (game.js:1543); Nurse Cell: `heal.perTargetCap` (game.js:1518); Stem Cell: at most `revive.cap` revives per Stem (foes2.js:282); mitosis `splitCap` (game.js:1039, roster.js:68).
Test: add to `newfoestest`: a Mother Cell alone for 60 s has at most 6 Sprinters alive.

### B7 Elite affixes (Sonnet high, 4 hours)
Goal: an elite is a familiar enemy plus one visible modifier (ENEMY_DESIGN 11).
1. New file `elites10.js`. When an elite is made (game.js:1194; the Smouldering roll at newfoes.js:256), pick one affix whose `appliesTo` matches the enemy's `role` from `ROSTER_ELITE_MODS` (roster.js:331-337): Trailing (chargers leave a 2 s pool, width 18), Fanning (shooters fire a 5-shot 60 degree Spread with a 0.8 s tell instead of their normal shot every third volley), Gifting (tanks give one ally a 25% Membrane for 3 s, visible link), Hasty (chasers x1.5 speed below 30% health, visible), Smouldering (any; keep the existing code). Draw a small affix mark on the elite.
2. Elite HP stays x5 for now (C1 may change it).
Test: new `elitetest`: force each affix in the Lab Bench and assert its effect (pool exists, fan fired, ally has Membrane, speed rose).

### B8 Hidden sixth defences (Sonnet, 1 hour)
Goal: only the five defences change a hit.
1. Callus: delete `noCrit` (game.js:826, data.js/roster row); give it `thickLayers` (one layer with `layerHpPct` x2, roster.js Callus row) and read it in fight.js where Shell layers are built.
2. Water Bear: remove `tun` (game.js:805-808; roster.js:144) (D5 default).
Test: `./run.sh quick fighttest newfoestest`.

### B9 Amoeba (D3 default: Sonnet, 10 minutes)
Set `w: 0` in roster.js and `status: 'park'` until the engulf is designed. If the user picks "build": Opus, half a day: 0.6 s tell, 1.2 s hold doing 14, a reliable escape (sprint or any Burst), never on a boss arena edge.

### B10 Phlegm Hocker patch (Sonnet, 1 hour)
Goal: the glob leaves a Mucus patch (the existing world object fight.js uses for Mucus patches); delete the gargle code (foes3.js:55-57, :127) and the `pk` dose (:64).
Test: `./run.sh quick f3test`.

### B11 Knockback rules (Sonnet high, 2 hours)
Goal: Squishy and Membrane cut knockback as the matrix says; nothing else changes it silently.
1. Read COMBAT_MATRIX.md 11.4 (Squishy `knockCut 0.5`; Membrane's knockback rule) and apply them where knockback is applied (game.js:864-866: the `heavy`/`spongy`/`tethered` skip).
2. Remove the generic `e.chill > 0 ? 1.5 : 1` (game.js:866) unless the matrix gives Snared a knockback bonus (it does not; Snot Rocket has its own).
Test: `tests/combatunit.js` if knockback moves into combat.js; else `./run.sh quick fighttest`.

---

## Batch C: bosses (after A and B)

### C1 Boss HP and placement, with sims (Opus, one day)
Goal: a regular boss fight lasts 45 to 90 s for a bot that reaches it, the final one about 120 s, and the number is observed, not derived.
1. Measure: `node sim/wave20.js 4 mortal` and `--boss <id>` per tier (god mode for the length). Record seconds per boss at waves 5, 10, 15, 20 in the fragment.
2. Retune `CAMP.hp` (campaign.js:226) and, if needed, the clock term, until the targets hold. Keep `heatBoss` (prestige.js:42) in wave mode.
3. Failed Experiment (campaign.js:253-271): HP in line with the tier-3 bosses; D6 default placement; `FAILED_MOVES` keyed by v10 attack type (`v_<type>_<atk>`: map `proj`, `spread`, `burst`, `beam`, `pool`, `contact` to patterns) so its moves follow the past run's weapons.
4. Race (bosses.js:20): make the per-index growth monotonic (no sawtooth), and confirm with `node sim/race.js 3 mortal`. Endless: gate tiers by wave as wave mode does (bosses.js:6 roster shuffle).
5. Sneeze (bosspack.js:122) and glare (bosses.js:157) go through the `V10_DIFF` damage knob like every other boss hit.
Test: full `./run.sh` (this touches shared numbers).

### C2 Boss telegraphs (Sonnet high, 3 hours)
Goal: every boss attack that can do significant damage shows where and when (COMBAT_MATRIX 13.4).
1. Charge (Colossus, Twins): the lane drawing at render.js:2018 requires `def.ai === 'charge'`; draw it for bosses in the `charge` pattern too. Blink (Phantom, Eye): a 0.5 s marker at the destination before the jump, and no ring on arrival for 0.3 s. Ward round (Matron): a ring where it lands, 1 s. Summon (Queen, Matron): a pulse on the boss 0.6 s before the adds. Fire ring (Fever): a `warn` outline.
2. Remove the fallback "Learn the telegraph" strength line (boss10.js:30) once every boss has a real tell, or keep it as true.
Test: `./run.sh quick bossshot`; eyeball `tests/out/boss_*.png`.

### C3 Pattern variety (Opus, design conversation with the user first; no code until agreed)
aimedFan, spiral and ring are about half of every boss's cycle (data.js patterns). Propose one signature pattern per boss built from its mechanic (ENEMY_DESIGN 5.4), then build in `bosspack.js`.

---

## Batch D: encounters (after C)

### D1 WAVES10 rework (Sonnet, 3 hours)
Goal: 20 waves meet every role and most of the roster; no wave is a slog.
1. waves10.js:27-70: bring in the relays (Fibrin, Plasma, Cortisol as Shooter+Relay and Swarm+Relay waves), the sniper (Killer T, after B2), the Booster elite, Diatom and Spire (Shell tank + Shooter), Leech, Rotifer, Natural Killer, Complement, Stem, Puffball, one joke wave. Keep the rule: a new behaviour alone first, then pairs from ENEMY_DESIGN 10. Fix `W10_STATUS` and `W10_POOLS` (waves10.js:73-75) to name ids the table uses.
2. Entourage: campaign.js:122 swaps cut ids (`from: 99999`) for Also-Rans; swap `wisp` for `krill` in the entourage lists (campaign.js:26-43) instead.
3. Slog waves: measure per-wave seconds with `node sim/wave20.js 2 mortal` before and after; cut Mucus Wall, Stress Ball, Static Sock and Summoner+Charger waves to under 90 s by count or `max`, not by HP.
Test: `./run.sh quick waves10test`; 2 sim runs, quote per-wave seconds in the fragment.

### D2 Race early threat (Opus, half a day, with the user)
The Sprinter is the top hurt source in every bot Race and the bot dies at 3 to 5 minutes with one weapon. Decide whether that is the autorun bot or the pace; `node sim/race.js 4 mortal` with `RACE.hurt` and the Sprinter's `from`/`w` as variables.
Result (26 Oct, ccr-b6a373a9-q8ofbd): neither. The sim ran with no sample, so no rescues and one weapon; with the Baseline sample and rescues the Sprinter drops out of the top hurt sources and the bot dies at 8 to 11 min to shooters instead (NOTES.md).

---

## Batch E: delete, test, harden (last)

### E1 Dead enemy code (Sonnet, 3 hours)
Delete, then run the full suite: chem.js `chemFoe`, `CHEM_FOES_M`, `chemOverload`/`OVERLOAD_OF`, `chemTriple`/`TRIPLES`, `chemTerrain`, `chemPuddle`, `chemSplash`, `chemGhost`, the v9 status switch in `applyElement` (chem.js:47-97) except what `fightStatus` does not cover; foes3.js `foes3Chem` and the `f3carry` wet/sick entries; pstatus.js `pstHit`, Sick and Wet entries, `pstBulletMarks` salt/poison glyphs; game.js stain boons (812-814), `e.shock` arc block (889-896), shred (863, 1395); typefx.js `TYPE_RING` entries and looks for shock/poison/oxi/salt/arcane/soul statuses that fight.js no longer sets; inspect.js `RX_PAIR`/`RX_ABBR`; data.js v9 `REACTIONS` rows the Field Guide no longer shows; `armour`, `weak`, `resist`, `noForce`, `weakAoe`, `shredStick`, `dodge` on every def and boss (data.js:800-899, foes2.js, brood.js, levels.js); `PST_SHOOTERS` (pstatus.js:17). Grep each name for callers before deleting; `node --check` every file; `./run.sh`.
Don't: delete anything a test still references without updating the test in the same commit.

### E2 Retired relic code (Sonnet, 1 hour; after A1b)
Delete only the relics A1b retired: their `RELICS` rows, `apply` cases in `applyRelic` / `bpRelicApply` / `rrelicApply`, hooks that nothing else reaches, and their ids in each boss's `relics` list. Update ARCHITECTURE.md's relics row to say the relics are v10-live. Full suite.

### E3 Tests (Sonnet, 3 hours)
1. `foescenetest` (or a new `rostertest`): spawn each of the 15 untested enemies (paramecium, krill, amoeba, splitling, blinker, rotifer, volvox, volvoxling, phantom, waterbear, juggernaut, yeast, pepsinjr, endoskeleton, broodling) and bosses Colossus and Immune Eye in the Lab Bench for 10 s each: no page errors, each dies to damage, each hurts a stationary player at most its roster `dmg` x knobs per hit.
2. A telegraph helper: for every enemy with `atk[].tele > 0`, assert no damage lands before `tele` seconds after the tell starts (Headbutter, Matchstick, Static Sock, Stress Ball, Natural Killer, Booster, Hayfever, and B1, B2, B3's).
3. A roster integrity check in `tests/tools/enemytables.js`: every `ROSTER.ai` has a `FOE_AI` entry or a case in game.js's switch, every `shape` a `MICROBES` entry or a render.js case; fail loudly on a duplicate key.

### E4 Robustness and frame cost (Sonnet, 1 hour)
1. game.js `updateEnemies`: wrap each enemy's AI step in try/catch that reports once per `e.def.name` (use `safely`'s dedupe) so one bad handler cannot abort the frame.
2. fight.js:296-320 `fightTick`: skip enemies beyond `CROWD.far` on alternate frames like game.js:1380 does; fight.js:353-357 `fightDraw`: call `fightId` once per enemy, after the off-screen cull.
Test: `./run.sh quick perf18 fighttest`.

### E5 Regenerate and record (Haiku, 30 minutes; after each batch)
`node tests/tools/enemytables.js` (commit `ENEMY_STATS.md`, `ENEMY_BEHAVIOUR.md`), `node tests/tools/guide.js`, ARCHITECTURE.md rows for every new file (bursts10, lancer10, shooters10, foeaura10, elites10) and the deleted ones, one NOTES.md bullet per batch.
