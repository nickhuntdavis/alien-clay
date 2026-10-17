# CHANGELOG.md: Spawn Prawn

Newest first. Sessions don't edit this file: they log in `changes/<branch>.md`, and those fragments are folded in here when a branch merges into `main` (rules: `CLAUDE.md` > Change log). System names come from `ARCHITECTURE.md`. History before v9.23 lives in `NOTES.md` > Recent changes and `git log`.

## v10.04 (versionCode 282)
- Systems: v10 (new), autorun (new), weapons, loot, chemistry, ui, meta, enemies, docs
- Files: see the folded entries below.
- What: merge into `main` of the v10 test build (`claude/zealous-clarke-i26iot`): Human Sample 1 in Wave or Regular Mode, the 42-weapon matrix (6 attack types x 7 damage types), Switched at Birth as the only upgrade, Fire as a new damage type, old automatic reactions off. Also carries the v9.28 autorun and autoaim revision (`claude/festive-allen-xmea8i`), the combat rework design docs (`redesign docs/`, `claude/charming-brown-51v3ev`) and the earlier unfolded Snot Bubble fragment (`claude/fervent-galileo-66jpd2`).
- Save data: META moves to `sd_meta10` (full wipe on first v10 boot). `window.V10_OFF = 1` restores the old build and save key.
- Hooks: see the folded entries.
- Risk: most of the old test suite assumes old content and fails with V10 on; `quick`, `v10test`, `autoruntest`, `loadouttest` pass. Weapon balance untested.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Merge v9.28 autorun and autoaim revision (v10.04)
- Systems: autorun, weapons, ui (incoming, see changes/claude-festive-allen-xmea8i.md), v10
- Files: merge of claude/festive-allen-xmea8i; tests/loadouttest.js (runs with V10_OFF)
- What: the v10 test build now has v9.28's targeting (TOUGHEST, FRAGILEST, a second "Then" directive) and reworked autorun modes (autorun.js). v10 weapons keep their NEAREST and CLUSTER defaults.
- Save data: none.
- Hooks: none new; v10 hooks and v9.28's aimDir/arMode hooks sit side by side in game.js and ui.js.
- Risk: loadouttest now tests the old build only (V10_OFF), since v10 level boxes need v10 weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Regular mode: a switch every level-up and DNA strand (v10.03)
- Systems: v10
- Files: v10.js
- What: in Regular Mode every level-up box and every DNA strand (chest box: pickups, events, achievements) opens as one Switched at Birth card, replacing the once-a-minute limit. Wave Mode is unchanged (one a wave).
- Save data: none.
- Hooks: none.
- Risk: many more switches in regular mode; skipping is the only way to keep a weapon.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Wave mode and regular mode (v10.02)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: the samples screen offers Human Sample 1 in Wave Mode (s002) or Regular Mode (s001, race to the egg). In regular mode Switched at Birth comes once a minute instead of once a wave.
- Save data: none.
- Hooks: none.
- Risk: regular mode not balanced for the new weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 One Switched at Birth card a wave (v10.01)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: Switched at Birth now offers one card, and only once a wave (the first level-up box after the wave; the wave's other level-up boxes are dropped). Reroll still swaps the card.
- Save data: none (run state `G.v10sw`).
- Hooks: none.
- Risk: far fewer upgrades a run; levels past the first in a wave give nothing.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 test build: Human Sample 1, 42-weapon matrix, Switched at Birth only (v10.00)
- Systems: v10 (new), weapons, loot, chemistry, ui, meta
- Files: v10.js (new), game.js, chem.js, sigs.js, ui.js, render.js, meta.js, index.html, tests/v10test.js (new)
- What: the game is now a stripped test build. One sample card (Human Sample 1, wave mode, no trait or ability). Weapons are the 42-cell matrix from the user's spec (Contact, Projectile, Beam, Spread, Burst, Pool x Force, Acid, Static, Mucus, Blood, Soul, Fire); start draft 4 of 42, Lv 8/22 drafts 3 more (no shared attack type). Level-ups offer only Switched at Birth (same attack type, new damage type); all other boxes are dropped, so no Feats, mutations, gene transfer, relics, combos or curses. Fire (`flame`) is new: Burning, 3 s damage over time. Old automatic reactions, overloads, triples and terrain reactions are off. Old content is gated, not deleted (`window.V10_OFF = 1` restores it).
- Save data: META now lives in `sd_meta10` (full wipe); `sd_best`, `sd_runs`, `sd_live` cleared on first v10 boot. `sd_meta` left untouched.
- Hooks: game.js genLoot -> v10Loot, main loop -> v10Box, fireWeapon -> v10Fire, update -> v10Tick, newGame skips junkStart, newStats elem.flame; render.js -> v10Draw; chem.js applyElement -> v10Burn and `if (V10)` reaction guards; sigs.js applyAdapt v10 contact reach; ui.js openSamples -> v10Samples, playBtn skips Level 0, quickStart uses human1/s002; meta.js META_KEY.
- Risk: most of the old test suite assumes old content and will fail with V10 on; `quick` and `v10test` pass. Balance untested (beams and Blood Pool run hottest). Feat slots show empty.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 combat rework: plan and decisions
- Systems: none yet (docs only)
- Files: NOTES.md (v10 section); merged `redesign docs/` from claude/charming-brown-51v3ev
- What: agreed approach (keep engine, rebuild combat core, restart content) and the step-2 decisions: literal Fire, Soul = mind control, 5 defences no traits, full save wipe.
- Save data: none yet (v10 will move to a new META key).
- Hooks: none.
- Risk: none.

### Folded from claude-festive-allen-xmea8i: 2026-10-17 Autorun and autoaim revision (v9.28)
- Systems: autorun (new), weapons, ui
- Files: autorun.js (new), game.js, data.js, ui.js, loadout.js, armoury.js, playpen.js, arsenal.js, toys.js, td.js, twins.js, genes.js, intro.js, index.html, tests/autoruntest.js (new), tests/loadouttest.js, tests/sim/wave20.js (`--move <id>`), tests/run.sh, tests/tools/guide.js
- What: Targeting: STRONGEST is now TOUGHEST (max health, plus 10% per point of armour), WEAKEST is now FRAGILEST, HIGHEST HEALTH is gone (its five weapons now default to TOUGHEST), SHOOTERS FIRST ranks shooters > healers > summoners, and RANDOM/REVENGE sit at the end of the list. Every weapon and Feat can take a second "Then" directive that breaks near-ties and takes over when nothing fits the first (Tackle Box loadout and weapon page; HUD shows `NEAR›FRAG`). RANDOM keeps a victim 1.5 s; FURTHEST and CLUSTER keep theirs unless a new one is 15% better. Autorun: KITE holds 240 to 360 from the nearest enemy; COLLECT skips pickups with enemies on or near the way; ORBIT picks one cluster and keeps it; HUNT keeps one target (boss > rival > elite > nearest, no longer the first weapon's directive); HOLD returns to where it was chosen; NEST only grabs pickups near the egg and is not offered in campaign levels (it used to steer you towards an egg 10 million units away).
- Save data: none (slot field `w.dir2` is run state only; `G.ar` holds autorun memory)
- Hooks: game.js targetScore -> aimPair; weapon fire -> aimSticky(acquire(aimDir(w))); every acquire(w.dir)/acquireMany(w.dir) -> aimDir(w) (game.js, arsenal.js, armoury.js, playpen.js, toys.js); game.js autoSteer -> arMode, arGoal (its old per-mode blocks moved into autorun.js); ui.js/loadout.js mode pickers -> moveModes.
- Risk: bot balance per autorun mode. Sims (`wave20.js 4 mortal --move <mode>`, old code then new): KITE 3/4 -> 2/4, ORBIT 1/4 -> 3/4, HUNT 3/4 -> 2/4, HOLD 2/4 -> 2/4; 9/16 both ways, too few runs to call any single mode; weapons that defaulted to HIGHEST HEALTH (Tapeworm Seeder, Due Date, Leeches, Umbilical Cord, Heel Prick) now pick by durability, not health left; RANDOM-targeting weapons no longer spray a new enemy every shot.

### Folded from claude-charming-brown-51v3ev: 2026-10-17 Combat design docs imported
- Systems: docs only
- Files: redesign docs/ (COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, VOICE_GUIDE.md, tables/*.csv, README.md)
- What: Notion combat-rework exports unpacked into readable docs; remaining-updates hand-off merged as COMBAT_MATRIX.md section 9. Defences purged to the canonical five (Squishy, Membrane, Shell, Thorns, Dodge); voice owner fixed as the pre-incarnate consciousness.
- Save data: none.
- Hooks: none.
- Risk: none (no code touched).

### Folded from claude-fervent-galileo-66jpd2: 2026-10-16 Snot Bubble, player Lubricated, combos batch 2 design (not shipped: APK build blocked)
- Systems: chemistry (player statuses), enemies
- Files: pstatus.js, foes3.js, foes2.js, chem.js, game.js, tests/psttest.js, tests/f3test.js
- What: Lubricated joins Snotty, Sick and Soaking wet as a player status (3 s a hit, 6 s cap): you lose grip and skid wide in turns, and a Static hit on you then lights the grease (GREASE FIRE: x1.3 and an acid-style burn, grease gone). Grease Balls now leave a 5 s oil slick behind them (standing in it lubricates you) and lob a slow oil glob every 6 s. New enemy Snot Bubble (from 120 s, cap 4): swells with each hit; an early pop splashes neighbours with Snotty, a late pop (4+ hits) sticks every enemy within 170 and you if close; Static on it is POPPED (instant, harmless to you).
- Save data: none
- Hooks: game.js trac -> pstGrip; chem.js chemPlayerZones skips z.foe slicks for the speed boost; foes2.js foes2Dmg -> foes3Dmg, foes2Kill -> foes3Kill.
- Risk: Grease Ball is a little more dangerous (slick plus glob); win rate was not re-simmed after it. Wave sim on v9.27 before these changes: 3 of 20 mortal bot wins (15%), against 3 of 12 (25%) before player statuses; too few runs to call it a regression.

## v9.27 (versionCode 277)
- Systems: chemistry, enemies, combos, weapons, render, ui, sequences, school, tutorial, tools, tests, docs
- Files: see the folded entries below.
- What: merge of six session branches into `main`: player statuses and two enemies that use them (`claude/intelligent-keller-n89f5p`, its v9.25 and v9.26), combos batch 1 (`claude/sweet-gauss-q7pan5`), the dead stain-grant purge (`claude/exciting-ramanujan-56w3kr`), developer cards on fresh saves (`claude/youthful-pasteur-nt0tn6`), roomier draft screens (`ccr-189e2988`, its v9.25) and the Weapon Atlas builder (`ccr-618305e3`).
- Save data: META.combos gains eight combo ids; META.pstainOff no longer written. Otherwise none.
- Hooks: see the folded entries. Merge conflicts were only in NOTES.md, run.sh, guide.js, ARCHITECTURE.md, versions and game.js update (pstTick kept, grantsTick dropped).
- Risk: full suite on the merge: 90 of 92 passed; the two failures were test-side and are fixed (overtest still clicked the removed stain toggle; f3test now clears terrain so a nodule can't block the glob or sneeze).

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
