# Merge and build: design system v2 port (21-22 Oct 2026)

For the agent that merges these files into the repo and ships the APK. Read the repo's `CLAUDE.md` first (git, change log, merge playbook, Fast APK); this file only adds what is specific to this batch.

## What this is

A local session (no git, on a Mac) ported the Figma design system into the game. The files in this zip are **whole files**, not patches, at paths relative to the repo root (the folder that holds `CLAUDE.md`, `storm-directive/` and `redesign docs/`).

- **Base:** the session started from a copy of the game at **v10.61** (`APP_VERSION = '10.61'`, `versionCode 340`). Every file in the zip was changed against that version.
- **Changed:** only the files in the list below. Nothing else in the repo was touched.

## What changed (player-visible)

1. **E-ink menus everywhere.**
   - `eink.css` is always on. Settings > SCREEN > View is LAB / ARCADE again.
   - A new **Menus** row offers PAPER (the default), INK and AUTO. AUTO follows the phone.
   - Saves that had View = EINK migrate to ARCADE + PAPER.
2. **Tokens regenerated from Figma:**
   - radii 3 / 5 / 7, a 3 px button rule, 31 px titles
   - reward, state and HUD-film colours
   - all 17 text styles as `--t-*`
3. **Pictograms:** all 335 Figma pictograms ship in `web/js/pictos.js` as compact path data (121 KB, about 45 KB gzipped).
   - `web/js/pictomap.js` maps game objects to pictograms by name.
   - 64 px leads appear on loot and reward cards, draft options, the Tackle Box header and loadout, Field Guide, Gene Bank, mode cards, Pause RUN autorun options, achievements, Active Effects and junk DNA, baby traits, fusion, and How to Play.
4. **Immersive HUD is the only in-run HUD.** The setting is gone, and `immersiveOn()` always returns true.
   - **Portrait dock:**
     - weapons as 62 px round keys bottom-right, each with a reload ring
     - Feats as round keys bottom-left
     - bottom-centre rounded rectangles: Rewind 52 × 52, Autorun (RUN / KITE) 106 × 52, Tackle Box 52 × 52
     - pause alone top-right
   - Manual fire: the FIRE keys take the right-hand column.
   - Landscape keeps the old row.
5. **Screens matched to the Figma Screens page:**
   - Screen Header (counter, context, rule) on Sample Rack, Mode Select, Weapon Draft, DNA Loot, It's a Baby and Game Over.
   - The user's Figma copy on those headers.
   - Mode cards: `#001` on the left and the tag on the right. The order is Evolution (the Race), Iteration (Petri Dish), Endless, Level 1.
   - Sample cards show type swatches instead of type names.
   - Loot cards use the Reward Card layout:
     - rarity chip under the 64 px tile
     - category and swatch top-right
     - **no pin / hide (½, X) buttons and no sub-line**
   - Settings rows are stacked cards. Pause and Settings use segmented tabs. Pinned action bars stay at the bottom.
   - Pause YOU uses a readout grid; BUILD and GUIDE are plain rows.
   - Gene Bank shows a readout panel with full numbers.
   - Active Effects is split into "For you" and "Against you".
   - Game Over has the time in its readouts and 2 × 2 buttons.
6. **Title:**
   - hero egg pictogram
   - START SWIMMING, then QUICK START
   - a 2 × 2 grid of pictogram tiles (Field Guide, Gene Bank, How to Play, Settings)
   - the Daily Challenge button hidden (see Open items)
7. **New intro** (`splash.js`):
   - On paper, an ink eyepiece draws itself and a FOCUS readout pulls the slide sharp.
   - Brackets lock onto the player.
   - The logo sets itself where the title screen's logo is.
8. **Fix:** the v9 sequence screen (`openSeq`) crashed on v10 profiles, after a Petri Dish win (NEW SEQUENCE) and after a Sequence Reveal. It now opens the v10 Sample Rack.

The full details, including **Systems**, **Save data**, **Hooks** and **Risk** per batch, are in the two change fragments in this zip:
- `storm-directive/changes/local-ui-port.md`
- `storm-directive/changes/local-wicons.md` (the earlier weapon line icons)

## Files

**New:**
- `storm-directive/web/js/pictos.js`, `pictomap.js`, `dsheads.js`
- `storm-directive/tests/uishots.js` (contact sheets of every screen)
- `storm-directive/tests/tools/pictos.py` (regenerates `pictos.js` from a Figma SVG export)
- `storm-directive/changes/local-ui-port.md`, `local-wicons.md`
- `storm-directive/UI_PRINCIPLES.md`
- `storm-directive/art/pictograms/`: all 335 pictograms as standalone 64 x 64 SVGs, named by game key (e.g. `feat/little-bubble.svg`), plus `figma-grid-export.svg` (the raw Figma export) and a README. These are source art: the game itself uses `pictos.js`, so the folder doesn't need to ship in the APK.

**Changed:**
- `storm-directive/web/index.html`
  - script tags: `pictos.js` and `pictomap.js` before `wicons.js`; `dsheads.js` last, after `power11.js`
  - title markup and the splash tagline
- `storm-directive/web/eink.css`: the bulk of the visual work. The token block at the top is generated, and the "Design system v2 port" sections are appended at the end.
- `storm-directive/web/js/`: `ui.js`, `uikit.js`, `settings.js`, `samples10.js`, `seqsel.js`, `splash.js`, `loadout.js`, `fusion.js`, `junk.js`, `prestige.js`, `manualfire.js`, `wicons.js`
- `storm-directive/web/js/icons.js` and `rewardui.js`: edited and then reverted to their original content. They should match the repo, so skip them if the diff is empty.
- `storm-directive/tests/einkshot.js` (now tests the Menus rule) and `tapcycle.js` (accepts the stacked weapon column)
- `storm-directive/ARCHITECTURE.md` (rows for pictos, pictomap, dsheads, wicons; script order)
- `storm-directive/NOTES.md` (open-thread bullets added; nothing rewritten)

## How to merge

1. Read `CLAUDE.md`. Then:
   ```
   git fetch -q origin
   ```
2. Make a branch from the **v10.61 commit**: the one whose `web/js/meta.js` has `APP_VERSION = '10.61'` and whose `android/app/build.gradle` has `versionCode 340`. Name it e.g. `ccr-ui-port`.
   - If you can't find that exact commit, branch from `origin/main`, but take extra care in step 4.
3. Unzip at the repo root on that branch, overwriting files. Then:
   ```
   git status
   git diff --stat
   ```
   - Skip `icons.js` and `rewardui.js` if their diffs are empty.
   - Commit once:
     ```
     feat(ui): design system v2 (tokens, pictograms, Immersive HUD, screens)
     ```
     End the message with the attribution lines from your session.
4. Merge `origin/main` into the branch with the playbook in `CLAUDE.md`:
   - **`ui.js`, `index.html`, `settings.js`:** keep both sides' changes. This batch's edits in `ui.js` are local:
     - the loot card icon (`lootPictoHtml`)
     - the codex, Gene Bank, Tackle Box and draft icons (`defPicto` / `pictoFor`)
     - `refreshHud` sets `--f`
     - the `moveBtn` label
     - Gene Bank readout markup
     - Active Effects grouping
     - Game Over Time cell
     - the THE LAB achievements row
     - Pause RUN autorun options
     - the REROLL label
   - **`index.html` script tags:** keep both sides' new tags. `dsheads.js` must stay **after** anything that wraps `UI.openLoot`, `UI.openDraft`, `UI.renderLootCards`, `UI.renderDraft`, `UI.showGameOver`, `UI.showDishOver`, `s10Samples`, `s10Modes` or `openBirth`.
   - **`eink.css`:** if main changed it, keep both. The "Design system v2 port" sections are appended at the end and are meant to win (later rules).
   - **`NOTES.md`, `ARCHITECTURE.md`:** keep both sides (one row per file).
5. Check for leftovers:
   ```
   grep -rn "TODO_COPY:set_menus" storm-directive/web
   ```
   It should return nothing; the copy has been written.
6. Run the full suite from `storm-directive/`:
   ```
   ./run.sh
   ```
   - At hand-off, 106 of 109 passed. The three failures are gameplay or structural tests that none of these changes touch:
     - `weapons24test` expects exactly 24 weapons, but the pool is 27 with the Early Bird three.
     - `wup5test` fails on Toxic Relationship's damage sharing.
     - `wup6test` fails on the Eggs clutch cap.
   - Any **other** failure comes from the merge: fix it before shipping.
   - Optional: `./run.sh uishots` writes `tests/out/ui_sheet_*.png` for a visual check against the Figma Screens page.
7. Fold the fragments into `CHANGELOG.md` if this merges into `main` (see `CLAUDE.md` > Change log).
8. Ship with the Fast APK steps:
   - Version: **10.62**, `versionCode 341`. If main has moved past that, take the higher version and bump once.
   - Run `node tests/tools/guide.js`.
   - Build `assembleRelease`, copy the result to `release/SpawnPrawn.apk`, commit, and push the branch.
   - The release build needs `SPAWN_KS_PASS`. If it's missing, stop and tell the user. **Never** generate a new key or switch to the debug key, because either forces an uninstall that wipes saves.
9. Send the APK to the user.

## Open items (for the user, not blockers)

- **Daily Challenge** has no way in while its title button is hidden. The user's Figma removed it; it needs a new home.
- **Immune Response** can only be chosen on the old v9 sequence screen, so it can't be reached under v10.
- **Weapon preview:** it should sit on white grid paper (Figma), but its effects are drawn additively, so it stays dark for now.
- **How to Play text is out of date** (Cooties, Oil, Water, 29 reactions, v9 modifiers). That copy is for the user to rewrite.
- **Figma's title** shows a second random start (START SWIMMING, "random everything") that isn't in the game.
