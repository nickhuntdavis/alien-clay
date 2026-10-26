# CLAUDE.md: Spawn Prawn (alien-clay)

Read this, then `storm-directive/NOTES.md` (current state and open threads), before exploring. Use `storm-directive/ARCHITECTURE.md` (the system map: which files own which system) to find where a change belongs. Only grep the code for what you are changing.

## What it is
Spawn Prawn is an Android autorun bullet-storm roguelite. You are a sperm cell, and the tone is Dungeon Crawler Carl: dry, deadpan, nerdy and never self-aware. Jokes are about bodies, sex, contraception and the microscopic world, with a little real science. No British slang (British spelling only). It is vanilla JS on a canvas, wrapped in an Android WebView.
- Game: `storm-directive/web/` (`index.html`, `style.css`, `js/*.js`, about 46k lines in 127 files, no build step and no modules: plain globals in script order).
- Android wrapper: `storm-directive/android/`. Released APK: `storm-directive/release/SpawnPrawn.apk`.
- Player guide (generated): `storm-directive/GAME_GUIDE.md`, from `storm-directive/tests/tools/guide.js`.
- Tests: `storm-directive/tests/` (Playwright, headless Chromium).
- Combat redesign (v10 spec, the only combat build since v10.125 removed the v9 fallback): `redesign docs/`. Read `redesign docs/CLAUDE.md` first; `COMBAT_MATRIX.md` there is the single source of rules.
- Visual style guide: `storm-directive/STYLE.md`. Read it before redesigning anything drawn in the world.
- Voice guide: `storm-directive/voice_and_tone.md`. The user writes all player-facing text (see Copy below); use the guide to write good briefs.
- System map: `storm-directive/ARCHITECTURE.md`. Change log: `storm-directive/changes/<branch>.md` per session, folded into `storm-directive/CHANGELOG.md` on merge into `main`.

## Copy: the user writes it, you write the brief
Never write player-facing text yourself (card names and descriptions, narrator lines, enemy and boss names, tutorials, Field Guide, menus, buttons, toasts, achievements). This includes rewording existing text.
1. Build the feature with a placeholder string `TODO_COPY:<id>` (e.g. `TODO_COPY:card_spermicide_desc`) wherever text is needed. Placeholders must not crash or overflow the UI.
2. In your reply, give one brief per placeholder:
   - **ID** and **where it appears** (screen, trigger, how long it stays up).
   - **Job**: what the player must understand or feel from it.
   - **Facts to convey**: numbers, mechanics, damage types (use the game's terms, e.g. "Feat", "unstable reaction").
   - **Length limit**: characters or words that fit the UI.
   - **Neighbours**: 1 to 3 existing lines it sits beside, quoted, so the voice matches.
3. When the user sends the copy, drop it in, replace the placeholders, and grep that no `TODO_COPY` remains before shipping. If some are still open at ship time, say which in one line.
Internal text (code comments, commit messages, changelog fragments, NOTES.md) is still yours to write.
Where card lines live: Feat gift lines (per sample) are in `redesign docs/GIFT_LINES.md` and `FEATS.md` 3, built by `tests/tools/copy/giftvoice.py`; every other card line is in `storm-directive/Card_Copy_Draft_All.xlsx`, built by `cardvoice.py`. Run cardvoice.py first, then giftvoice.py.

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

## Change log (one file per session, so merges don't clash)
Several sessions run at once and get merged into each other and into `main`. Shared files that every session edits (one changelog, NOTES.md's top lines, version numbers) are where merges break, so:
- Each session logs only in its own fragment: `storm-directive/changes/<branch>.md` (e.g. `changes/ccr-e8ca6f23-vawkv2.md`). Create it on your first commit. Never edit another session's fragment, and don't touch `CHANGELOG.md` except when folding (below).
- Add an entry per commit that changes the game, tests or build, newest first, in the same commit:
  ```
  ## <date> <short title> (vX.YZ if shipped)
  - Systems: weapons, chemistry, ui        (names from ARCHITECTURE.md)
  - Files: playpen.js (new), chem.js, index.html
  - What: one or two plain sentences on what now works differently.
  - Save data: META/SET keys added, renamed or removed, or none.
  - Hooks: one-line hook calls added to shared files (game.js, render.js, ui.js, bosses.js), e.g. game.js killEnemy -> penKill. Or none.
  - Risk: what could break or shift (balance, other systems), or none.
  ```
  Systems, Save data and Hooks are what a merging session needs: they say where two branches will collide.
- Folding: whoever merges into `main` moves every fragment that came in with the merge into `CHANGELOG.md` under the new version heading, then deletes those fragments, in the merge commit.
- `ARCHITECTURE.md` changes in the same commit when a file is added, removed or renamed, a system is added, or a responsibility moves. Add new files to its script-order line.
- Commit scope names the main system: `feat(weapons): ...`, `fix(chemistry): ...`.
- `NOTES.md`: sessions only add bullets (new open threads, new balance numbers). The "Current state" line and "Recent changes" are rewritten only when merging into `main`.

## Avoiding merge pain while you work
1. At session start: `git fetch -q origin && git merge -q origin/main`. Then check what other live sessions are touching:
   `for b in $(git branch -r | grep -o 'origin/ccr-[^ ]*'); do f=$(git show $b:storm-directive/changes/${b#origin/}.md 2>/dev/null | grep -m3 -E 'Systems|Hooks'); [ -n "$f" ] && echo "$b: $f"; done`
   If one overlaps your systems, say so to the user in one line before starting.
2. New content goes in your own feature file (as `armoury.js` and `playpen.js` do), not appended to shared tables in `data.js` or `game.js`. Shared files get one-line hooks only.
3. Don't rename or move shared code (functions in `game.js`, `render.js`, `ui.js`, `data.js` keys) unless asked: it breaks every other branch's hooks.
4. Version numbers change only in the ship command, never mid-work.
5. Before a long piece of work, and before shipping, merge `origin/main` again.

## Merging another branch (playbook)
`git fetch -q origin && git merge origin/<branch>`. Never rebase or force-push a shared branch. Resolve by file type:
| File | Resolve |
|---|---|
| `changes/*.md` | Never conflicts (one per branch). Read the incoming fragments first: Systems and Hooks list the risky spots. |
| `meta.js` `APP_VERSION`, `build.gradle` `versionCode`/`versionName` | Take the higher of each side, then bump once more for the merged build. |
| `release/SpawnPrawn.apk` | `git checkout --ours`, then rebuild. Never hand-merge. |
| `GAME_GUIDE.md` | Take either side, then rerun `node tests/tools/guide.js`. |
| `SpawnPrawn_Copy.xlsx` | Take either side, then rerun `tests/tools/copy/copy.sh export`. |
| `index.html` script tags | Keep both sides' new tags, each after the files it depends on. |
| Hook lines in `game.js`/`render.js`/`ui.js`/`bosses.js` | Keep both lines. |
| Tables in `data.js` and feature files | Keep both entries, then check for duplicate ids (same key defined twice: the later silently wins). |
| `NOTES.md`, `CHANGELOG.md` | Keep both sides' bullets. |
| `ARCHITECTURE.md` | Keep both; one row per file. |
After resolving: run the full suite (`./run.sh`, a merge counts as a big batch), fold fragments if this is a merge into `main`, ship one build.

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
   cd .. && git add -A <paths you changed> changes/ && git commit -q -m "..." && git push -q origin <branch>
   ```
6. SendUserFile the APK, then reply. Don't narrate each step.
7. One build per batch of requests, not per item.
- Release builds are signed with `android/spawnprawn.keystore` (in the repo, so every session's APK installs over the last). Its password is NOT in the repo: it comes from the `SPAWN_KS_PASS` environment variable (set in the cloud environment's settings). If it is missing the release build stops with a clear error: tell the user, never generate a new key and never switch to the debug key (either forces an uninstall that wipes saves).
- Update `GAME_GUIDE.md` text (via `tests/tools/guide.js`) and your `changes/<branch>.md` fragment when features change; add the shipped version to the fragment's latest heading.
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
  - `node sim/modaudit.js --w v_flame_beam --mod charged`: which weapon modifiers do nothing (or only change numbers) on each weapon and Delivery. No flags runs everything (about 15 minutes).
- Node and Playwright: `NODE_PATH=/opt/node22/lib/node_modules` (`run.sh` sets it). Chromium comes pre-installed; never run `playwright install`.

## Architecture (the hook-file pattern)
- Each feature lives in its own file with small hook calls into `game.js`, `render.js`, `ui.js` and `bosses.js`. Each file's header comment lists its hooks. Follow the pattern: add a file, add it to `index.html` in the right order, then add one-line hooks.
- For kills, hits, damage multipliers, being hurt, firing and per-frame ticks, don't edit `game.js`: register from your own file with `hookOn('kill', 'myfile:what', (e, src) => myKill(e, src))` (events and arguments: header of `hooks.js`). Don't wrap `killEnemy`, `damageEnemy`, `hurtPlayer` or `fireWeapon`: use their `:before` / `:after` events.
- Script order matters (globals). `data.js` and `game.js` come first. Later files include … `chem`, `spoils`, `campaign`, `statusintro`, `tutorial`, `levels`, `glossary`, `evolve`, `stamina` …, `splash`, `finale`, `juice`, `audio`, `daily`, `portraits`, `lab`, `ui`.
- Globals:
  - `G` is the run state; `null` on the title screen.
  - `META` is persistent: `localStorage sd_meta10` (`META_KEY` in meta.js). `SET` is settings: `sd_settings`, defined in `settings.js` `SETTINGS_DEF` with Play/View/Sound/Data tabs.
  - `UI` is the DOM UI (`ui.js`).
  - `ctx`, `W`, `H` and `S` (world→screen scale), `cam`, and `PAL` (colours).
  - `col()` greyscales colours unless `RAW_COL` is true. `SET.view`: Arcade view (`viewArcade()`, the default under v10) is full colour with draining rings; Lab view (the v9 default, a Settings option again from v10.32) has no colour at all on the slide (`labGrey` in typefx.js, after the world is drawn) and no status rings. Damage-type looks live in `typefx.js` (soft, organic: see STYLE.md). Stains and research grants are retired (v9.11; `grants.js` is mostly inert). Campaign levels draw with `RAW_COL` on, in pink.
- Main loop (`game.js`): `update(dt)` runs systems; the director spawns; `G.lootQueue` holds boxes, opened via `UI.openLoot(req)` and `genLoot(req)`.
- Game modes (`UI.sample`):
  - `s002` Petri Dish wave mode (`waves.js` and `campaign.js`): 20 waves, a boss every 5th. Optional wave 0 tutorial is in `tutorial.js`.
  - `s001` standard race to the egg.
  - `s006` Endless.
  - `s007` campaign Level 1 (`levels.js`); `s008` Level 2 is a locked placeholder.
  - `s000` Lab Bench debug (tap the samples title 5 times).
- Damage types (internal id → name, status): `phys`=Force (untyped base damage, no status or reactions), `fire`=Acid (Melting), `ice`=Mucus (Snotty), `shock`=Static (Shocked), `poison`=Cooties (Sick), `oxi`=Oil (Lubricated), `salt`=Water (Soaking wet), `arcane`=Blood (Bleeding), `soul`=Parasite (Cursed; bosses Spooked). Statuses and the 28 pair reactions live in `chem.js`; names in `data.js` `REACTIONS`; the pair table is `RX_PAIR` in `inspect.js`.
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
