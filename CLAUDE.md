# CLAUDE.md: Spawn Prawn (alien-clay)

Read this, then `storm-directive/NOTES.md` (current state and open threads), before exploring. Only grep the code for what you are changing.

## What it is
Spawn Prawn is an Android autorun bullet-storm roguelite. You are a sperm cell, and the tone is Dungeon Crawler Carl: dry, deadpan, nerdy and never self-aware. Jokes are about bodies, sex, contraception and the microscopic world, with a little real science. No British slang (British spelling only). It is vanilla JS on a canvas, wrapped in an Android WebView.
- Game: `storm-directive/web/` (`index.html`, `style.css`, `js/*.js`, about 20k lines, no build step and no modules: plain globals in script order).
- Android wrapper: `storm-directive/android/`. Released APK: `storm-directive/release/SpawnPrawn.apk`.
- Player guide (generated): `storm-directive/GAME_GUIDE.md`, from `storm-directive/tests/tools/guide.js`.
- Tests: `storm-directive/tests/` (Playwright, headless Chromium).
- Visual style guide: `storm-directive/STYLE.md`. Read it before redesigning anything drawn in the world.

## Working with the user
- British English. Use () rather than em dashes. The first line is the answer. No preamble or recap. Numbered steps and ranked lists. When asked for options, give 2 to 4, recommendation first. End with one action under 2 minutes, with real time estimates.
- No accessibility or WCAG work. Answer in chat (ask before making docs). Confirm risky actions.
- After every build, send the APK with SendUserFile.
- Use "Separately: X. Handle that next?" for second issues.
- Win-rate target: about 1 in 3 for a human. The autorun bot dodges worse, so 20 to 50% bot wins is fine.
- Be token-conscious: follow Fast APK below for tests, screenshots and sims.

## Model choice (suggest it, don't lecture)
At the start of each request, check whether the model fits the job, and if not, say so in ONE line before starting (e.g. "This is a big new system: Opus would suit it better. Carrying on unless you switch."). You cannot switch models yourself; the user does it in the model picker. Use `get_session` to see which model you are on if unsure. Say nothing when the fit is fine.
- **Sonnet** (default): batches of clear changes (renames, copy, colours, CSS/HUD, tutorial text), small features with a clear spec, bugs with an obvious cause, build/ship, skimming run logs.
- **Opus**: new systems touching many files (a campaign level, a mode, a mechanic), balance work that needs sims designed and several numbers tuned together, bugs with no clear cause (hitches, rare crashes), design conversations, Level 2.
- Effort: Medium for batches; higher for gnarly bugs and new systems. If Sonnet takes two tries at the same fix, suggest Opus.

## Git
- Work and push only on the branch the session names (`main` is the integration branch; session branches are merged into it). Use `git push -q origin <branch>`.
- Conventional commits (`feat:`, `fix:` and so on), ending with the attribution lines from the session's system reminder. Never put model IDs in commits. No PR unless asked.

## Fast APK (default for every build)
1. Edit with exact-match replacements that assert they hit (fail fast); don't re-read files after editing.
2. Test only what you touched: `./run.sh <2-4 relevant tests>` (always include `quick`). Full suite only for big multi-file batches or before a release you're unsure of.
3. Never install anything, never run lint, emulators, adb or `playwright install`. Gradle and Chromium are already cached; lint needs SDK deps that aren't here.
   - The one exception: if `ANDROID_HOME` is missing (a fresh container), install the SDK once into `/home/user/android-sdk` (the command-line tools zip from dl.google.com, then `sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"`) and `export ANDROID_HOME=/home/user/android-sdk`.
4. No screenshots or sims unless the change is visual or about difficulty.
5. Ship in ONE Bash call (from `storm-directive/`):
   ```
   sed -i "s/APP_VERSION = 'X'/APP_VERSION = 'Y'/" web/js/meta.js
   sed -i "s/versionCode N/versionCode N+1/; s/versionName 'X'/versionName 'Y'/" android/app/build.gradle
   node tests/tools/guide.js | tail -1
   cd android && ./gradlew assembleRelease -q -x lintVitalAnalyzeRelease -x lintVitalReportRelease -x lintVitalRelease 2>&1 | grep -v JAVA_TOOL; cp app/build/outputs/apk/release/app-release.apk ../release/SpawnPrawn.apk
   cd .. && git add -A <paths you changed> && git commit -q -m "..." && git push -q origin <branch>
   ```
6. SendUserFile the APK, then reply. Don't narrate each step.
7. One build per batch of requests, not per item.
- Release builds are signed with `android/spawnprawn.keystore` (in the repo, so every session's APK installs over the last). Its password is NOT in the repo: it comes from the `SPAWN_KS_PASS` environment variable (set in the cloud environment's settings). If it is missing the release build stops with a clear error: tell the user, never generate a new key and never switch to the debug key (either forces an uninstall that wipes saves).
- Update `GAME_GUIDE.md` text (via `tests/tools/guide.js`) and `NOTES.md` when features change.
- Before the first build, check the session branch has main's latest (`git log -1 origin/main`) and that `APP_VERSION` matches `NOTES.md`; a branch started from an old main ships an APK missing recent work.

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
  - `col()` greyscales colours unless `RAW_COL` is true. `SET.view`: Lab view (default) has no colour at all on the slide (`labGrey` in typefx.js, after the world is drawn) and no status rings; Arcade view (`viewArcade()`) is full colour with draining rings. Damage-type looks live in `typefx.js` (soft, organic: see STYLE.md). Stains and research grants are retired (v9.11; `grants.js` is mostly inert). Campaign levels draw with `RAW_COL` on, in pink.
- Main loop (`game.js`): `update(dt)` runs systems; the director spawns; `G.lootQueue` holds boxes, opened via `UI.openLoot(req)` and `genLoot(req)`.
- Game modes (`UI.sample`):
  - `s002` Petri Dish wave mode (`waves.js` and `campaign.js`): 20 waves, a boss every 5th. Optional wave 0 tutorial is in `tutorial.js`.
  - `s001` standard race to the egg.
  - `s006` Endless.
  - `s007` campaign Level 1 (`levels.js`); `s008` Level 2 is a locked placeholder.
  - `s000` Lab Bench debug (tap the samples title 5 times).
- Damage types (internal id → name, status): `phys`=Force (untyped base damage, no status or reactions), `fire`=Acid (Melting), `ice`=Mucus (Snotty), `shock`=Static (Shocked), `poison`=Cooties (Sick), `oxi`=Oil (Lubricated), `salt`=Water (Soaking wet), `arcane`=Blood (Bleeding), `soul`=Soul (Cursed; bosses Spooked). Statuses and the 28 pair reactions live in `chem.js`; names in `data.js` `REACTIONS`; the pair table is `RX_PAIR` in `inspect.js`.
  - In player-facing text say "damage type" and "unstable reaction". Never say "element" or "elemental".
  - Internal names stay as they are (`ELEMENTS`, `elem`, the mod id `elemental`).
- Spells are called "Feats" in all player-facing text, and you "perform" a Feat (never "cast"). Internals stay `G.spells`, `SPELLS`, `isSpell`.
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
