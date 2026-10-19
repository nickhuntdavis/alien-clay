# ARCHITECTURE.md: Spawn Prawn system map

Reference map of every system: which files own it, what it reads and writes, and where it hooks in. Use the **system names** (left column, in bold) in the "Systems" line of `changes/<branch>.md` fragments. Keep this file in step with the code: a new file, a new system or a moved responsibility means an edit here in the same commit.

## Layout
- `web/`: the game. `index.html` loads `style.css` and `js/*.js` as plain scripts (no build step, no modules, globals in script order).
- `android/`: WebView wrapper, Gradle project. Release signing via `spawnprawn.keystore` + `SPAWN_KS_PASS`.
- `release/SpawnPrawn.apk`: the shipped build.
- `tests/`: Playwright tests (`run.sh`), sims (`tests/sim/`), tools (`tests/tools/`: `guide.js` builds `GAME_GUIDE.md`, `mouth.py` builds level maps, `copy/copy.sh` syncs `SpawnPrawn_Copy.xlsx`, `atlas/atlas.js` builds the Weapon Atlas page from `atlas/template.html`).
- Docs: `CLAUDE.md` (rules), `NOTES.md` (current state), `changes/<branch>.md` (per-session change log) and `CHANGELOG.md` (folded on merge into `main`), `STYLE.md` (visual style), `GAME_GUIDE.md` (generated player guide), `WEAPON_IDEAS.md` / `FEAT_IDEAS.md` (idea banks), `log.md` (run log reviews).

## Core spine
Everything else hangs off these. `data.js` and `game.js` load first; `ui.js` loads last.

| System | Files | Role |
|---|---|---|
| **data** | `data.js` | Static tables: `ELEMENTS`, weapons, `SPELLS` (Feats), merges, passives, enemies, bosses, `REACTIONS`, `PAL`. |
| **settings** | `settings.js` | `SET` (`sd_settings`), `SETTINGS_DEF` with tabs, hints, `off()`, sliders; narrator packs. |
| **meta** | `meta.js` | `META` (`sd_meta`): DNA, Gene Bank, unlocks, `APP_VERSION`. |
| **engine** | `game.js` | `G` run state, `newGame`, `update(dt)`, combat (`damageEnemy`, `killEnemy`, `fireWeapon`), AI, director/spawning, XP, `computeStats`, loot (`genLoot`, `rollRarity`, novelty `novK`). Most hook calls start here. |
| **render** | `render.js`, `icons.js`, `grants.js` (colour switches: Lab vs Arcade) | World and HUD drawing: floor, lights, entities, egg, swimmers, minimap; `col()`/`RAW_COL`; weapon icons and type colours. |
| **ui** | `ui.js`, `loadout.js` | DOM screens: title, samples, loot cards (`UI.openLoot`, `UI.pickLoot`), pause, end screen, Tackle Box (Loadout tab in `loadout.js`). |

## Game modes
| System | Files | Role |
|---|---|---|
| **wave-mode** | `waves.js`, `campaign.js`, `dishfx.js` | `s002` Petri Dish: 20 waves, boss every 5th (`CAMP` tuning), wave conditions from wave 4. |
| **race** | `game.js`, `rivals.js` | `s001` race to the egg, `s006` Endless; rival champions and the sperm count / Final Five. |
| **campaign** | `levels.js`, `school.js` | ASCII-map levels (`LV_C` cells, `dEx`/`dPl` route maps, arenas `lvLock`). `s007` Level 1, `s008` Level 2 placeholder, `s009` Level 0 Swimming Lessons. Maps from `tests/tools/mouth.py`. |
| **lab-bench** | `debug.js` | `s000` debug sample: spawn anything, god mode. |
| **manual fire** | `manualfire.js` | `SET.autoFire` OFF: weapons fire only while their FIRE button (one per weapon, stacked bottom right) is held; a tap fires the next shot (`mfGo`, `w.mfHeld`, `w.mfTap`). Rewind and the ability button (`#side`) sit bottom left. |
| **sandbox** | `sandbox.js` | `s010` developer Sandbox on the Lab Bench: weapons only (one to start, an empty + mount on the HUD adds one on tap; upgrades bank every 4th level and are spent from a branch mark on the slot, in the weapon draft screen), slow spawn stream on its own clock (`sbPT`), HEAT +/- bar; the five-tap developer switch on the samples title. |
| **daily** | `daily.js` | Seeded Daily Challenge. |
| **difficulty** | `prestige.js` | Immune Response levels and Being Born (prestige). |

## Player build
| System | Files | Role |
|---|---|---|
| **look10** | `look10.js` | v10 look (loaded before data.js): one palette for the seven types (`TYPE_PAL`), defence colours (`DEF_PAL`), pink acid terrain (`ACID_TERR`), `l10Swap` remaps old acid greens and mucus olives; Arcade is the only view under V10 (Lab view retired). |
| **combat** | `combat.js`, `fight.js` | v10 combat core. `combat.js`: pure hit resolver (matrix 11.1: Evasion, Membrane, Shell, Squishy, crit, bars, Thorns), no game globals, unit-tested in node (`tests/combatunit.js`). `fight.js`: wires it into `damageEnemy` under V10, Acid/Mucus/Static statuses, the slice reactions, defence rings, run stats (`G.fst`, saved in the run log). |
| **pdef** | `pdef.js` | v10 player defences: base Membrane (30% max health) plus Shell, Squishy, Evasion and Thorns from defence cards (`PDEF`, `PDEF_CARDS`), `pdefHurt` (matrix 11.1 order, replaces the armour block in `hurtPlayer` under V10), recharge and Shell refit (`pdefTick`), Membrane and Shell rings (`pdefDraw`), card offers (`pdefOffer`, used by `v10Loot`). Reuses `combat.js`. |
| **new enemies** | `newfoes.js` | v10 enemies brought to life (runs after `fight.js`): rebuilds `ENEMIES` from `ROSTER` under V10 (cut entries dropped, event/boss-spawned ones kept at w 0), AI (`FOE_AI.new_*`) and shapes (`MICROBES`) for Static Sock, Stress Ball, Mosquito, Matchstick, Birthday Candle (wax walls, `G.nfWax`), Trapped Wind and Ingrown Hair, plus the Smouldering elite modifier. Hooks: game.js `nfTick`/`nfHit`/`nfKill`, v10.js `nfDraw`. |
| **enemy membranes** | `foemem.js` | Five cell enemies (Nurse, Mitotic, Mother, Plasma, Stem Cell) get a Membrane at the player's 30% (`FOEMEM`, sets `ROSTER[id].def`), and every enemy Membrane draws as the player's forcefield bubble with a hit ripple (`foeMemDraw`). Hooks: fight.js fightCd -> d.memFrac, fightDraw -> foeMemDraw. |
| **roster** | `roster.js` | v10 enemy data (`ROSTER`, `ROSTER_BOSSES`, `ROSTER_ELITE_MODS`, `ROSTER_DEF`): role, defence, damage type, attack types per enemy. Defences are read by `fight.js`; the rest is not wired yet. |
| **voice** | `voice.js`, `voice10.js` | v10 voices. `voice.js`: line tables: Scientist and consciousness lines per event (`VOICE`, composure tiers), first sightings (`SIGHTING`), status hints, `sampleId`, `voiceLine`. `voice10.js`: wires them under V10 (narrator events with a 20 s gap, first sightings, boss intros, one-time status hints, end screen, sample IDs in the run log). |
| **sigweap** | `sigweap.js` | v10 signature weapons (`WEAPONS['s_*']`, `sig: 1`): 21 re-typed originals, 5 Fire drafts and the dual Force/Static Rubbed the Wrong Way (Shocking Impact); echo damage, pet/lure/chain caps; `v10Pool()` feeds the slot draft. |
| **weapons24** | `weapons24.js` | The 24 weapons (BASE_WEAPONS.md): `W24` roster (renames, re-types, starter of which sample), everything else `archived`; the branch engine (WEAPON_UPGRADES.md): `wupReg` card specs, `wupOn` hooks (stats, fire, hit, dmg, kill, tick), Lv 3 promise / Lv 6 / Lv 10 mastery screens (`wupForkCards`). Card data in `wup1.js`...`wup6.js`. |
| **wstats** | `wstats.js` | Per-weapon balance telemetry for the run log (Notion Score = DPS x Targets x Reach x Uptime): held time, dps, uptime, distinct targets, hit rate, distance, kills, boss share, tier times, weapon offers and picks (`G.ws`, stored as `r.ws` in `RUNLOG`; ` wpn` lines in `runText`). Hooks in game.js, ui.js pickLoot, meta.js. |
| **w24look** | `w24look.js` | Icons, badge codes and names of the 24 weapons; live combos, pairings and super combos only (new text); `wl_*` list helpers for the Field Guide, Gene Bank and Tackle Box. |
| **modifiers** | `modifiers.js` | v10 modifiers: 20 attack behaviours (`MODS10`, `w.m10`: homing, piercing, chaining, ricochet, returning, orbiting, gravity well, lunge and the rest), `modAdd`/`modHas`/`modsFor` for fork cards. Hooks in game.js (fireWeapon, spawnProj, updateProjectiles), arsenal.js meleeHit, v10.js. |
| **modifier cards** | `modcards.js` | The 20 v10 modifiers as level-up draft cards (`modDraftCands`: fits the weapon's attack type, 3 different a weapon, each ranks to 3 via `modV` cap arrays, text in `MODUP`) and Switched at Birth for the 24 weapons (`sabCard`/`sabSwitch`: the slot gets its own def with the new type; Rare; never two drafts running, `G.sabAt`). Hook: draft.js draftCards -> modDraftCands. |
| **samples** | `samples10.js` | The eight v10 samples (SAMPLES.md): `SAMPLES10`, each a profile `s10_<id>` with primary/support types (`G.sampleTypes` for the draft lean), passive, three starters (`w24Starters`, ids baseline, alpha, beta, private, ordered, redtail, prawn, alien), strain number (`G.s10`), Ordered Online's built-in Evasion, Not of This World's per-slot type shift (`w.typeOver`), `shield` flag (`s10Shield()`), unlocks (`META.s10`, bypassed by `S10_ALL`), the sample-then-Experiment screen (The Race only; `S10_PETRI`). |
| **mutations** | `mutations.js` | v10 mutation cards for the draft: 33 mutations (body, weapon, damage type, trade-off, rare), 20 Catalysts (one per discovered reaction), 4 Concentration cards (bars fill faster, drain slower). Run state `G.muts`, `G.cat`, `G.conc`, `w.wm10`. |
| **mutation drops** | `mutdrop.js` | Mutations come from elites, not drafts (`mdDraftSkip`): 60% of elites carry one (junk DNA helix, beacon, countdown, arrows; `MUTDROP`), and killing one drops a labelled strand you swim into to open the mutation screen (`mdAbsorb`, kind 'mutation', `mdCards`). Hooks: game.js killEnemy -> mdKill; v10.js v10Tick -> mdTick, v10Draw -> mdDraw; draft.js draftCards -> mdDraftSkip. |
| **box looks** | `boxlook.js` | Each box looks like what it changes: the mutation screen shows your sperm (`drawYouPortrait`) and stats, the modifier screen (DNA strands, `modBoxCards`) your weapons and their modifier slots; Feat cards glow violet (`boxCardCls`). Hooks: ui.js openLoot -> boxLook, renderLootCards -> boxCardCls, tick -> boxTick. |
| **boss10** | `boss10.js` | v10 bosses: defence and damage type from `ROSTER_BOSSES` (`B.v10def`, `B.v10dmg`), old type weaknesses/immunities off under V10, intro text rewritten round the defence, Queen's adds capped (`boss10SummonOk`). |
| **feats10** | `feats10.js` | v10 Feats: 24 gifts from the consciousness as `SPELLS` entries (kind `f10`) in `G.spells` (3 slots), levels 1 to 5, forks at 3 and 5 registered with draft.js; trigger events (hit, kill, XP, tick); effect drawing. |
| **waves10** | `waves10.js` | v10 wave mode: `WAVES10` role table for the 20 waves (each new behaviour and defence met alone first, then ENEMY_DESIGN 10's pairs), population rules (`w10Check`), spawner hooks `w10Fresh`/`w10Spawn`/`w10Max` in campaign.js. |
| **draft** | `draft.js` | v10 draft core (UPGRADES.md): one card screen for weapon upgrades, Switched at Birth, defence cards and every card feature files register (`draftRegister`, `forkRegister`); slots (3 Feats, 4 Genome shared by mutations and defences); forks at weapon Lv 5/10 and Feat level 3/5; pool lean (`G.sampleTypes`); wave-break and 40 s budget (`draftBox`, 'wait'). |
| **v10** | `v10.js` | v10 test build, on unless `window.V10_OFF`: one sample (Human Sample 1, wave mode), the 42-weapon matrix (6 attack types x 7 damage types, ids `v_<type>_<atk>`), Switched at Birth as the only upgrade, every other box dropped (`v10Box`/`v10Loot`), Fire (`flame`, Burning), no automatic reactions, save key `sd_meta10`. |
| **weapons** | `data.js`, `arsenal.js`, `toys.js`, `armoury.js`, `playpen.js`, `genegun.js`, `aim.js`, `aimat.js` | Weapon defs and behaviours. Armoury/Playpen weapons carry `armoury: 1` (`pen: 1` for Playpen) and play-style classes (`ARM_CLASS`). Falloff and trick shots in `aim.js`. MY OWN MESS directive (`ownmess`: shoot the enemy nearest another weapon's stuff, chosen in `w.aimAt`) in `aimat.js`. |
| **autorun** | `autorun.js`, `game.js` (`autoSteer`, `targetScore`, `acquire`) | Autorun movement modes (KITE, COLLECT, ORBIT, HUNT, HOLD, NEST: `arGoal`, per-mode memory in `G.ar`) and autoaim helpers: tie-breaker directive `w.dir2` (`aimDir`, `aimPair`), TOUGHEST score (`aimTough`), target stickiness (`aimSticky`), `moveModes()` (no NEST in levels). |
| **upgrades** | `sigs.js`, `spellfork.js`, `bodymods.js`, `rubber.js` | Lv 5/10 signature forks, Feat forks at Lv 4, Rubber Johnny / plates, latex film physics. |
| **combos** | `sigs.js` (Pairings), `pairs2.js`, `combos.js`, `combos3.js`, `combos10.js`, `fusion.js`, `supers.js` | Pairings, Weapon Combos, Super Combos and the fusion ceremony. `combos10.js`: 30 branch combos for the 24 weapons (both at Lv 5 AND a set Lv 3 promise on each; ten pairs, three each), combo partners in the weapon draft (any attack type), promise-card hints, autorun prefers combo cards. |
| **feats** | `stamina.js`, `seqfeats.js`, `newfeats.js`, Feats in `data.js` | Stamina bar (sprint + Feat cost), `featTap`, sequence-only Feats; the 36 v9.23 Feats (kind `'newfeat'`, effects in `G.nf.fx`) and the reusable decoy system (`nfDecoy`). Internals stay `G.spells`/`SPELLS`. |
| **attack looks** | `typelook.js` | Cosmetic only: every attack wears its damage type (Static crackles and snaps arcs to nearby enemies, Acid drips, Mucus strings, Blood spurts, Alien drifts, Fire flickers) on shots, lobs, mines, bursts (rings in a type colour), swings, lashes and pools; per-type beams (Static a live jagged bolt, Acid a dribbling stream, Mucus a braided rope, Blood pulses, Alien a helix, Fire a flamethrower plume). State in `G.tlook`. Hooks: v10.js v10Tick -> tlTick, v10Draw -> tlBeam; render.js tlShots (after your shots), tlDraw (after drawTypeFx); toys.js twin beam -> tlSeg. |
| **chemistry** | `chem.js`, `typefx.js`, `pstatus.js` | Damage-type statuses, 28 pair reactions, overloads, triples (`chemOverload`, `chemTriple`); how each type looks (Lab/Arcade view, `labGrey`). Player statuses (`pstatus.js`): typed enemy bullets (`b.pel`, `PST_SHOOTERS`) make you Snotty, Sick or Soaking wet (`G.pst`). |
| **sequences** | `genes.js`, `seqsel.js`, `seqlock.js`, `seqreveal.js`, `evolve.js`, `reborn.js`, `redtail.js`, `twins.js` | Epigenetic Profiles, Mutations, sequence select/ladder/unlock ceremony, evolutions, the special sequences. |

## Loot and rewards
| System | Files | Role |
|---|---|---|
| **loot** | `game.js` (`genLoot`), `boons.js`, `weird.js`, `bias.js`, `upall.js`, `pinhide.js`, `spoils.js` | Box generation and rarity, Mythical/Immaculate bonuses, Weird Loot rules, appetite cards, Upgrade All, pin/hide, boss spoils. |
| **pickups** | `pickups.js`, `silly.js` | Timed power-ups (`G.pu[id]`) and silly modifiers. |
| **gene-transfer** | `junk.js`, `genes.js` | Lateral Gene Transfer: junk DNA carriers, vesicle boxes (`G.vesicles`, `kind:'vesicle'`). |
| **relics** | `bosses.js`, `rrelics.js` | Boss and rival relics (`applyRelic`, `rrelic*` hooks). |
| **show** | `show.js` | Narrator, achievements, funding/devotion meter. |

## Enemies and world
| System | Files | Role |
|---|---|---|
| **enemies** | `data.js`, `game.js`, `foes.js`, `foes2.js`, `foes3.js`, `brood.js` | Enemy defs, AI, caps (`G.typeN`), status VFX. `foes3.js`: enemies that use player statuses (Phlegm Hocker, Hayfever Cell) and their reactions (`foes3Chem`). |
| **bosses** | `bosses.js`, `bosspack.js` | Roster, intro cinematic, abilities, death, relic choice; the mechanic-teaching boss pack. |
| **rivals** | `rivals.js`, `rrelics.js` | Named rival swimmers and their relics. |
| **terrain** | `terrain.js`, `bighaz.js` | Nodules, mitochondria, acid crypts, cilia, currents, slicks; rare big hazards. |
| **events** | `events.js`, `dishfx.js` | Timed run events (DIRE from Lv 40); wave conditions ride this. |
| **time** | `td.js` | Egg healing glow, Rewind / Paradox Echo. |

## Onboarding and help
| System | Files | Role |
|---|---|---|
| **tutorial** | `tutorial.js`, `statusintro.js`, `intro.js`, `school.js` | Tutorial cards (25 s apart, skip link, `resetTutorial()`), status cards, first sightings, Level 0. |
| **help** | `glossary.js`, `inspect.js`, `portraits.js`, `quirks.js` | Hold-to-read glossary, tap-to-inspect cards and Reaction chart (`RX_PAIR`), Field Guide portraits, hidden quirks. |

## Presentation
| System | Files | Role |
|---|---|---|
| **screens** | `splash.js`, `lab.js`, `finale.js`, `preview.js` | Splash, lab title backdrop and dive, death/win finale, animated weapon previews (a weapon can bring its own preview through `PV_OWN`). |
| **sidemo** | `sidemo.js` | Standard Issue's own preview (the real weapon: magazine, reload, 440 reach, stops on first hit) and one scene per branch card; its tier screens open in the Weapon Draft layout (tabs) instead of cards. The model for the other 23. |
| **feel** | `juice.js`, `audio.js` | Hit-stop, haptics, celebrations; synthesised sound and music. |
| **style** | `style.css`, `index.html` | DOM layout and CSS. |

## Cross-cutting rules
- **Hook-file pattern**: a feature lives in its own file; `game.js`, `render.js`, `ui.js` and `bosses.js` get one-line calls into it. Each file's header comment lists its hooks. Add the file to `index.html` in the right order.
- **Script order** (from `index.html`): look10, data, settings, meta, icons, game, td, terrain, arsenal, sigs, bosses, events, boons, waves, debug, quirks, toys, combos, genes, prestige, seqsel, preview, show, rivals, render, bighaz, foes, brood, pickups, silly, rrelics, intro, spellfork, reborn, genegun, redtail, twins, armoury, playpen, seqlock, pairs2, combos3, aim, autorun, aimat, chem, spoils, campaign, bosspack, dishfx, statusintro, pstatus, tutorial, grants, junk, foes2, typefx, foes3, levels, school, glossary, inspect, evolve, stamina, bodymods, rubber, bias, upall, pinhide, seqfeats, newfeats, v10, sigweap, modifiers, weapons24, wstats, wup1, wup2, wup3, wup4, wup5, wup6, combat, roster, fight, newfoes, foemem, waves10, pdef, draft, modcards, samples10, boss10, voice, voice10, mutations, mutdrop, boxlook, feats10, splash, finale, juice, audio, seqreveal, fusion, supers, w24look, typelook, daily, portraits, lab, weird, loadout, sandbox, sidemo, manualfire, ui, combos10 (after ui: it wraps UI.autoTick).
- **Persistence**: only `META` (`sd_meta`) and `SET` (`sd_settings`) in `localStorage`. `G` is per run and `null` on the title screen.
- **Build/ship**: `android/` (Gradle `assembleRelease`), version in `meta.js` `APP_VERSION` and `android/app/build.gradle`.
