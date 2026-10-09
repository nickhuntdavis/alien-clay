# CLAUDE.md: Spawn Prawn (alien-clay)

Read this, then `storm-directive/NOTES.md` (current state and open threads), before exploring. Only grep the code for what you are changing.

## What it is
Spawn Prawn is an Android autorun bullet-storm roguelite. You are a sperm cell, and the game is crude, British, biology-joke humour. It is vanilla JS on a canvas, wrapped in an Android WebView.
- Game: `storm-directive/web/` (`index.html`, `style.css`, `js/*.js`, about 20k lines, no build step and no modules: plain globals in script order).
- Android wrapper: `storm-directive/android/`. Released APK: `storm-directive/release/SpawnPrawn.apk`.
- Player guide (generated): `storm-directive/GAME_GUIDE.md`, from `storm-directive/tests/tools/guide.js`.
- Tests: `storm-directive/tests/` (Playwright, headless Chromium).

## Working with the user
- British English. Use () rather than em dashes. The first line is the answer. No preamble or recap. Numbered steps and ranked lists. When asked for options, give 2 to 4, recommendation first. End with one action under 2 minutes, with real time estimates.
- No accessibility or WCAG work. Answer in chat (ask before making docs). Confirm risky actions.
- After every build, send the APK with SendUserFile.
- Use "Separately: X. Handle that next?" for second issues.
- Win-rate target: about 1 in 3 for a human. The autorun bot dodges worse, so 20 to 50% bot wins is fine.
- Be token-conscious. Run only the relevant tests while iterating, and the full suite once before shipping. Take screenshots only for visual changes. Run balance sims only when difficulty is in question.

## Git
- Work and push only on the branch the session names (it has been `claude/autorun-bullet-storm-game-blptu8`). Use `git push -q origin <branch>`.
- Conventional commits (`feat:`, `fix:` and so on), ending with the attribution lines from the session's system reminder. Never put model IDs in commits. No PR unless asked.

## Ship checklist (in order)
1. `cd storm-directive/tests && ./run.sh` (the full suite, about 8 min). Everything must pass.
2. Bump `APP_VERSION` in `web/js/meta.js`, and `versionCode` (+1) and `versionName` (single-quoted) in `android/app/build.gradle`.
3. `node storm-directive/tests/tools/guide.js` regenerates `GAME_GUIDE.md`. Update its text when features change.
4. `cd storm-directive/android && ./gradlew assembleRelease -q && cp app/build/outputs/apk/release/app-release.apk ../release/SpawnPrawn.apk`
5. Commit, push, then SendUserFile the APK.

## Tests
- `./run.sh` runs everything. `./run.sh lvshot quick` runs just those. Only failures and a summary are printed. Screenshots go to `tests/out/` (git-ignored).
- Each test loads `web/index.html`, then calls `splashEnd()`. It sets `window.TUT_OFF = 1` (no tutorial cards) and usually marks `META.seen`/`META.seenSt` so intro cards don't pause it.
- Simulations in `tests/sim/`:
  - `node sim/wave20.js 4 mortal`: wave-mode bot runs, with win and death causes.
  - `node sim/lvsim.js 2 mortal kite steer`: a campaign level run by a bot that steers itself.
  - `node sim/variety.js 6`: which cards get offered.
  - `node sim/boxrate.js 3 s002`: boxes per minute.
  - `node sim/eggbump.js`: how often autorun touches the egg.
- Node and Playwright: `NODE_PATH=/opt/node22/lib/node_modules` (`run.sh` sets it). Chromium comes pre-installed; never run `playwright install`.

## Architecture (the hook-file pattern)
- Each feature lives in its own file with small hook calls into `game.js`, `render.js`, `ui.js` and `bosses.js`. Each file's header comment lists its hooks. Follow the pattern: add a file, add it to `index.html` in the right order, then add one-line hooks.
- Script order matters (globals). `data.js` and `game.js` come first. Later files include … `chem`, `spoils`, `campaign`, `statusintro`, `tutorial`, `levels`, `glossary`, `evolve`, `stamina` …, `splash`, `finale`, `juice`, `audio`, `daily`, `portraits`, `lab`, `ui`.
- Globals:
  - `G` is the run state; `null` on the title screen.
  - `META` is persistent: `localStorage sd_meta`. `SET` is settings: `sd_settings`, defined in `settings.js` `SETTINGS_DEF` with Play/View/Sound/Data tabs.
  - `UI` is the DOM UI (`ui.js`).
  - `ctx`, `W`, `H` and `S` (world→screen scale), `cam`, and `PAL` (colours).
  - `col()` greyscales colours unless `RAW_COL` is true. The world is greyscale until stains are found; campaign levels draw with `RAW_COL` on, in pink.
- Main loop (`game.js`): `update(dt)` runs systems; the director spawns; `G.lootQueue` holds boxes, opened via `UI.openLoot(req)` and `genLoot(req)`.
- Game modes (`UI.sample`):
  - `s002` Petri Dish wave mode (`waves.js` and `campaign.js`): 20 waves, a boss every 5th. Optional wave 0 tutorial is in `tutorial.js`.
  - `s001` standard race to the egg.
  - `s006` Endless.
  - `s007` campaign Level 1 (`levels.js`); `s008` Level 2 is a locked placeholder.
  - `s000` Lab Bench debug (tap the samples title 5 times).
- Damage types (internal id → name): `phys`=Force, `fire`=Acid, `ice`=Base, `shock`=Static, `poison`=Ethanol, `arcane`=Voodoo, `oxi`=Peroxide, `salt`=Brine.
  - In player-facing text say "damage type" and "chemical reaction". Never say "element" or "elemental".
  - Internal names stay as they are (`ELEMENTS`, `elem`, the mod id `elemental`).
- Spells are called "Feats" in all player-facing text. Internals stay `G.spells`, `SPELLS`, `isSpell`.
- Feats and stamina: `stamina.js`. Attacking Feats cost stamina. Tapping a Feat slot casts it (`featTap`). `SET.featAuto=false` means Feats cast on tap only.
- Loot (`game.js` `genLoot`):
  - Novelty weighting (`novK`/`novSeen`, `META.offered`) rotates the pool.
  - `rollRarity`. Achievement DNA (`kind:'myth'`) is all Mythical or Celestial.
  - Skipping a level box raises the next one's rarity floor (`G.rarBoost`, `RAR_SKIP`).
- Campaign levels (`levels.js`):
  - A level is data: an ASCII map (`LV_C`=80-unit cells), zones, arenas, boss and hazards.
  - Breadth-first route maps run to the exit (`dEx`) and to the player (`dPl`). They drive enemy chasing round walls, out-of-sight spawning and the "lost" chevron.
  - Autorun does not solve the maze (by the user's request).
  - Arenas seal (`lvLock`) until their quota is killed.
  - The level stays "Level N" until it has been beaten (`lvKnown`/`lvName`); keep the setting a surprise in all text.
  - Map source: `tests/tools/mouth.py`, which generates the ASCII and checks connectivity.
- Tutorials:
  - `intro.js` (enemy first sightings), `statusintro.js` (buffs and debuffs), `tutorial.js` (sprint, Feats, Lateral Gene Transfer, damage types, wave 0).
  - Cards come at least 25 s apart and carry a "skip tutorial" link.
  - `resetTutorial()` brings them all back.
- Lateral Gene Transfer (old name "vesicle", internal `G.vesicles` and `kind:'vesicle'`): mutation boxes from `genes.js`. In wave mode they open at the end of the wave.
