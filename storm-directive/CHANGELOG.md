# CHANGELOG.md: Spawn Prawn

Newest first. Sessions don't edit this file: they log in `changes/<branch>.md`, and those fragments are folded in here when a branch merges into `main` (rules: `CLAUDE.md` > Change log). System names come from `ARCHITECTURE.md`. History before v9.23 lives in `NOTES.md` > Recent changes and `git log`.

## v9.27 (versionCode 277)
- Systems: chemistry, enemies, combos, weapons, render, ui, sequences, school, tutorial, tools, tests, docs
- Files: see the folded entries below.
- What: merge of six session branches into `main`: player statuses and two enemies that use them (`claude/intelligent-keller-n89f5p`, its v9.25 and v9.26), combos batch 1 (`claude/sweet-gauss-q7pan5`), the dead stain-grant purge (`claude/exciting-ramanujan-56w3kr`), developer cards on fresh saves (`claude/youthful-pasteur-nt0tn6`), roomier draft screens (`ccr-189e2988`, its v9.25) and the Weapon Atlas builder (`ccr-618305e3`).
- Save data: META.combos gains eight combo ids; META.pstainOff no longer written. Otherwise none.
- Hooks: see the folded entries. Merge conflicts were only in NOTES.md, run.sh, guide.js, ARCHITECTURE.md, versions and game.js update (pstTick kept, grantsTick dropped).
- Risk: full test suite run on the merge.

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Phlegm Hocker and Hayfever Cell (v9.26)
- Systems: enemies, chemistry
- Files: foes3.js (new), pstatus.js (pstGive), chem.js, index.html, tests/f3test.js (new), tests/run.sh, tests/tools/guide.js
- What: two new enemies from ENEMY_IDEAS.md. The Phlegm Hocker lobs Mucus globs (a bigger Snotty dose); Water on it (GARGLED) turns its next 3 globs into rinse puddles. The Hayfever Cell winds up and sneezes a cone that gives you whichever of Snotty, Sick and Soaking wet it carries; Water then Cooties on it (ANTIHISTAMINE) makes it sneeze Sick onto its neighbours.
- Save data: none (new ENEMY_INTRO ids hocker and hayfever go in META.seen; META.foeRuns gains them).
- Hooks: chem.js applyElement (after chemFoe) -> foes3Chem.
- Risk: two more types in the wave draw pool (punisher cap 6 each); new REACTIONS ids gargled and antihistamine.

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Player statuses from typed enemy bullets (v9.25)
- Systems: chemistry, enemies, render, tutorial
- Files: pstatus.js (new), game.js, render.js, chem.js, newfeats.js, index.html, tests/psttest.js (new), tests/tools/guide.js
- What: Antibody, Cytokine Caster, Diatom, Killer T-Cell and Booster bullets now carry a damage type (white mark on the speck) and give you Snotty (slower), Sick (slow drain, half healing) or Soaking wet (Static bullets hit 60% harder; washes off snot and acid). Status chips with timers and first-time cards; your Water puddles and Fecal Transplant rinse them off.
- Save data: none (new STATUS_INTRO keys SNOTTY, SICK, SOAKING WET go in the existing META.seenSt).
- Hooks: game.js eBullet -> pstElem, hurtPlayer -> pstHurtMul + pstHit, healPlayer -> pstHeal, player speed -> pstSpeed, update -> pstTick; render.js chips -> pstChips, enemy bullets -> pstBulletMarks; chem.js chemPlayerZones -> pstOn/pstClear; newfeats.js fecaltransplant -> pstClear.
- Risk: early runs are a little harder (Antibody is the first shooter, from 35s); wave-sim deaths were in line with the baseline over 4 runs. Bosses unchanged.

### Folded from claude-sweet-gauss-q7pan5: 2026-10-16 Combos batch 1 for the Armoury and Playpen weapons (v9.24, not shipped)
- Systems: combos, weapons
- Files: combos3.js (new), combos.js, playpen.js, index.html, tests/combo3test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: eight new Weapon Combos (Drive-By Pramming, One-Two Delivery, Live Mains, Auntie's Revenge, Water Delivery, Locker Room Towel, Packed Lunch, Guthrie Test), one per sequence. They fuse through the usual ceremony and bonus mount, and use the standard Switched at Birth twist table. Water Delivery pairs Waters Breaking (Chonker) with Bath Bomb (Good Eater), so it needs a splice. Live Mains' overload is a held stun, not the Static reaction. "Natural synergy" lines from the brief are not implemented (only twists for swapped damage types exist).
- Save data: META.combos gains eight ids (c_driveby, c_onetwo_deliv, c_livemains, c_aunties_revenge, c_waterdelivery, c_towel_snap, c_packed_lunch, c_guthrie_test).
- Hooks: combos.js comboFire -> combo3Fire, comboHit -> combo3Hit, comboTick -> combo3Tick, comboLash -> combo3Lash; playpen.js penEnd -> combo3Pram, penFire juicebox -> combo3Carton and combo3Boil.
- Risk: Drive-By Pramming spawns many Spitballs (projectile cap applies); Packed Lunch widens Upchuck puddles for 3s; no new sounds (existing sfx reused).

### Folded from claude-exciting-ramanujan-56w3kr: 2026-10-16 Purge dead stain-grant code
- Systems: render (colour switches), ui, school, show
- Files: grants.js (142 to 33 lines), game.js, render.js, ui.js, school.js, ARCHITECTURE.md, tests/tools/guide.js, tests/schooltest.js
- What: removed the retired floating research grant (grantsStart/Tick/Due/Take, drawGrants, pause-menu list and toggles, G.grant). grants.js now holds only the live Lab/Arcade colour switches.
- Save data: none (META.grants/grantOff left in place, harmless).
- Hooks: removed grantsStart (game.js), grantsTick (game.js), drawGrants (render.js), grantsHtml/grantsBind (ui.js).
- Risk: tutorial.js 'stains' card text still mentions grants (unreachable now).
- Also: deleted the unreachable `stains` tutorial card (tutorial.js). Risk: none.
- Also: removed the pause-menu Stains lists and permanent-stain toggles (ui.js stainsHtml, data-pst), .li.stain CSS, staintest. Save data: META.pstainOff no longer written; META.pstains still read in game.js (old saves keep their stains, now with no off switch).

### Folded from claude-youthful-pasteur-nt0tn6: 2026-10-16 Fix devall test on fresh saves
- Systems: ui, debug, school
- Files: ui.js, debug.js
- What: Developer mode's Unlock Everything and Reset Starters cards now render on the fresh-save samples screen (Level 0 only), so `devall` passes. Unlock Everything also marks Level 0 as skipped (`META.school`) so the full screen shows afterwards.
- Save data: none added (sets existing `META.school`).
- Hooks: none.
- Risk: none for real players; the dev cards only show with `sd_dev` on.

### Folded from ccr-189e2988-a6jy7f: 2026-10-16 Roomier draft and sequence screens (v9.25)
- Systems: ui, sequences
- Files: style.css, game.js
- What: the starter weapon draft offers at most 4 weapons. Draft tabs wrap in an even grid; sequence select and the draft have more padding and spacing.
- Save data: none
- Hooks: none
- Risk: none (spacing only; the starter draft drops the 5th wildcard when a sequence already has 4 weapons)

### Folded from ccr-618305e3-li7ynm: 2026-10-16 Weapon Atlas builder saved in the repo
- Systems: tools
- Files: tests/tools/atlas/atlas.js (new), tests/tools/atlas/template.html (new), ARCHITECTURE.md
- What: `node tests/tools/atlas/atlas.js` rebuilds the Weapon Atlas page (all weapons, sequences, upgrade ladders, combos, pairings, reactions, twists, play styles) from the live game into tests/out/weapon-atlas.html, ready to republish to the Atlas artifact. Atlas republished for v9.24 (78 weapons).
- Save data: none.
- Hooks: none.
- Risk: none (tool only, not loaded by the game).

## v9.24 (versionCode 274)
- Systems: feats, chemistry, upgrades, render, ui, audio, data, tests, docs
- Files: `newfeats.js` (new), `data.js`, `spellfork.js`, `stamina.js`, `icons.js`, `chem.js`, `typefx.js`, `game.js`, `render.js`, `ui.js`, `audio.js`, `sigs.js`, `index.html`, `meta.js`, `android/app/build.gradle`, `tests/newfeattest.js` (new), `tests/newfeatshot.js` (new), `tests/run.sh`, `tests/sim/wave20.js`, `tests/tools/guide.js`, `GAME_GUIDE.md`, `FEAT_IDEAS.md`, `ENEMY_IDEAS.md` (new, from `ccr-9082b737`), `NOTES.md`, `ARCHITECTURE.md`
- What: merge of this session's v9.23 (all 36 Feats from `FEAT_IDEAS.md`, each with two Lv 4 paths, in loot, the Tackle Box and a new Field Guide FEATS tab; the Bloody Show three-type reaction, Mucus + Blood + Static) with main's v9.23 (the Playpen) and `ccr-9082b737` (enemy ideas doc). Also fixes a crash: Rubber Johnny's spines have no weapon and broke `projHit`/`projEnd`. Two branches used v9.23, so this combined build is v9.24.
- Save data: none
- Hooks: game.js fireWeapon -> nfFire, update -> nfTick, updateEnemies -> nfSteer, shootPattern -> nfNoFire/nfAim, enemy bullets -> nfBullet, hurtPlayer -> nfHurtMul/nfLethal, updatePlayer -> nfSpeed, updateSpellList -> nfWait, featTap -> passive Feats, damageEnemy -> nfDamaged, killEnemy -> nfKill; render.js -> nfDrawUnder/nfDrawOver/nfYouAlpha and the Bloody Show squeeze; ui.js Feat slot bar -> w.nfCharge, Field Guide FEATS tab; audio.js -> G.musCutT; sigs.js projHit/projEnd skip projectiles with no weapon.
- Risk: 36 more Feats dilute Feat drafts (novelty weighting rotates them). Wave sims: 27% bot wins before, 36% with a new Feat forced in; Mosquito, Fecal Transplant, Brown Fat and Fertile Window sit at 50%. Hooks in `updateEnemies`, `shootPattern`, enemy bullets, `hurtPlayer`, `damageEnemy` and `killEnemy` all run through `G.nf` (absent until a new Feat is performed). No save-data changes.

### Folded from ccr-e8ca6f23-vawkv2: merge-friendly change logging (2026-10-16)
- Systems: docs
- Files: CLAUDE.md, ARCHITECTURE.md (new), CHANGELOG.md (new), changes/ (new)
- What: per-session change-log fragments, a merge playbook, start-of-session overlap check, and the system architecture map.
- Save data: none
- Hooks: none
- Risk: none

## v9.23 (versionCode 273)
- Systems: weapons, combos, chemistry, loot
- Files: playpen.js (new), index.html, chem.js, data.js, WEAPON_IDEAS.md, tests (armtest)
- What: the Playpen, 20 more weapons from `WEAPON_IDEAS.md` (78 in all), flagged `armoury: 1, pen: 1`. Merged `ccr-618305e3` (the Armoury) and `ccr-d9934b1d` (four weapons retyped for an even damage type spread).
- Save data: none
- Risk: new weapons in the general pool shift loot odds; armtest guards the play-style and damage type spread.
