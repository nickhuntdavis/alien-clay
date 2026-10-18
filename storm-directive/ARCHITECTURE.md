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
| **daily** | `daily.js` | Seeded Daily Challenge. |
| **difficulty** | `prestige.js` | Immune Response levels and Being Born (prestige). |

## Player build
| System | Files | Role |
|---|---|---|
| **combat** | `combat.js`, `fight.js` | v10 combat core. `combat.js`: pure hit resolver (matrix 11.1: Evasion, Membrane, Shell, Squishy, crit, bars, Thorns), no game globals, unit-tested in node (`tests/combatunit.js`). `fight.js`: wires it into `damageEnemy` under V10, Acid/Mucus/Static statuses, the slice reactions, defence rings, run stats (`G.fst`, saved in the run log). |
| **pdef** | `pdef.js` | v10 player defences: base Membrane (30% max health) plus Shell, Squishy, Evasion and Thorns from defence cards (`PDEF`, `PDEF_CARDS`), `pdefHurt` (matrix 11.1 order, replaces the armour block in `hurtPlayer` under V10), recharge and Shell refit (`pdefTick`), Membrane and Shell rings (`pdefDraw`), card offers (`pdefOffer`, used by `v10Loot`). Reuses `combat.js`. |
| **new enemies** | `newfoes.js` | v10 enemies brought to life (runs after `fight.js`): rebuilds `ENEMIES` from `ROSTER` under V10 (cut entries dropped, event/boss-spawned ones kept at w 0), AI (`FOE_AI.new_*`) and shapes (`MICROBES`) for Static Sock, Stress Ball, Mosquito, Matchstick, Birthday Candle (wax walls, `G.nfWax`), Trapped Wind and Ingrown Hair, plus the Smouldering elite modifier. Hooks: game.js `nfTick`/`nfHit`/`nfKill`, v10.js `nfDraw`. |
| **roster** | `roster.js` | v10 enemy data (`ROSTER`, `ROSTER_BOSSES`, `ROSTER_ELITE_MODS`, `ROSTER_DEF`): role, defence, damage type, attack types per enemy. Defences are read by `fight.js`; the rest is not wired yet. |
| **voice** | `voice.js` | v10 line tables (not loaded yet): Scientist and consciousness lines per event (`VOICE`, composure tiers), first sightings (`SIGHTING`), status hints, `sampleId`, `voiceLine`. |
| **modifiers** | `modifiers.js` | v10 modifiers: 20 attack behaviours (`MODS10`, `w.m10`: homing, piercing, chaining, ricochet, returning, orbiting, gravity well, lunge and the rest), `modAdd`/`modHas`/`modsFor` for fork cards. Hooks in game.js (fireWeapon, spawnProj, updateProjectiles), arsenal.js meleeHit, v10.js. |
| **samples** | `samples10.js` | The eight v10 samples (SAMPLES.md): `SAMPLES10`, each a profile `s10_<id>` with primary/support types (`G.sampleTypes` for the draft lean), passive, starting weapon, strain number (`G.s10`), Cold Parcel's built-in Evasion, unlocks (`META.s10`), the sample-then-Experiment screen. |
| **mutations** | `mutations.js` | v10 mutation cards for the draft: 33 mutations (body, weapon, damage type, trade-off, rare), 20 Catalysts (one per discovered reaction), 4 Concentration cards (bars fill faster, drain slower). Run state `G.muts`, `G.cat`, `G.conc`, `w.wm10`. |
| **draft** | `draft.js` | v10 draft core (UPGRADES.md): one card screen for weapon upgrades, Switched at Birth, defence cards and every card feature files register (`draftRegister`, `forkRegister`); slots (3 Feats, 4 Genome shared by mutations and defences); forks at weapon Lv 5/10 and Feat level 3/5; pool lean (`G.sampleTypes`); wave-break and 40 s budget (`draftBox`, 'wait'). |
| **v10** | `v10.js` | v10 test build, on unless `window.V10_OFF`: one sample (Human Sample 1, wave mode), the 42-weapon matrix (6 attack types x 7 damage types, ids `v_<type>_<atk>`), Switched at Birth as the only upgrade, every other box dropped (`v10Box`/`v10Loot`), Fire (`flame`, Burning), no automatic reactions, save key `sd_meta10`. |
| **weapons** | `data.js`, `arsenal.js`, `toys.js`, `armoury.js`, `playpen.js`, `genegun.js`, `aim.js` | Weapon defs and behaviours. Armoury/Playpen weapons carry `armoury: 1` (`pen: 1` for Playpen) and play-style classes (`ARM_CLASS`). Falloff and trick shots in `aim.js`. |
| **autorun** | `autorun.js`, `game.js` (`autoSteer`, `targetScore`, `acquire`) | Autorun movement modes (KITE, COLLECT, ORBIT, HUNT, HOLD, NEST: `arGoal`, per-mode memory in `G.ar`) and autoaim helpers: tie-breaker directive `w.dir2` (`aimDir`, `aimPair`), TOUGHEST score (`aimTough`), target stickiness (`aimSticky`), `moveModes()` (no NEST in levels). |
| **upgrades** | `sigs.js`, `spellfork.js`, `bodymods.js`, `rubber.js` | Lv 5/10 signature forks, Feat forks at Lv 4, Rubber Johnny / plates, latex film physics. |
| **combos** | `sigs.js` (Pairings), `pairs2.js`, `combos.js`, `combos3.js`, `fusion.js`, `supers.js` | Pairings, Weapon Combos, Super Combos and the fusion ceremony. |
| **feats** | `stamina.js`, `seqfeats.js`, `newfeats.js`, Feats in `data.js` | Stamina bar (sprint + Feat cost), `featTap`, sequence-only Feats; the 36 v9.23 Feats (kind `'newfeat'`, effects in `G.nf.fx`) and the reusable decoy system (`nfDecoy`). Internals stay `G.spells`/`SPELLS`. |
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
| **screens** | `splash.js`, `lab.js`, `finale.js`, `preview.js` | Splash, lab title backdrop and dive, death/win finale, animated weapon previews. |
| **feel** | `juice.js`, `audio.js` | Hit-stop, haptics, celebrations; synthesised sound and music. |
| **style** | `style.css`, `index.html` | DOM layout and CSS. |

## Cross-cutting rules
- **Hook-file pattern**: a feature lives in its own file; `game.js`, `render.js`, `ui.js` and `bosses.js` get one-line calls into it. Each file's header comment lists its hooks. Add the file to `index.html` in the right order.
- **Script order** (from `index.html`): data, settings, meta, icons, game, td, terrain, arsenal, sigs, bosses, events, boons, waves, debug, quirks, toys, combos, genes, prestige, seqsel, preview, show, rivals, render, bighaz, foes, brood, pickups, silly, rrelics, intro, spellfork, reborn, genegun, redtail, twins, armoury, playpen, seqlock, pairs2, combos3, aim, autorun, chem, spoils, campaign, bosspack, dishfx, statusintro, pstatus, tutorial, grants, junk, foes2, typefx, foes3, levels, school, glossary, inspect, evolve, stamina, bodymods, rubber, bias, upall, pinhide, seqfeats, newfeats, v10, modifiers, combat, roster, fight, newfoes, pdef, draft, samples10, mutations, splash, finale, juice, audio, seqreveal, fusion, supers, daily, portraits, lab, weird, loadout, ui.
- **Persistence**: only `META` (`sd_meta`) and `SET` (`sd_settings`) in `localStorage`. `G` is per run and `null` on the title screen.
- **Build/ship**: `android/` (Gradle `assembleRelease`), version in `meta.js` `APP_VERSION` and `android/app/build.gradle`.
