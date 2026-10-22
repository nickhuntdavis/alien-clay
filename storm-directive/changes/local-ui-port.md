## 2026-10-22 Tackle Box into the bottom row; leaner loot cards
- Systems: hud, ui
- Files: eink.css
- What: Bottom row is Rewind 52 x 52, Autorun 106 x 52, Tackle Box 52 x 52 (rounded rectangles), pause alone top-right. Loot cards drop the pin / hide (1/2, X) buttons and the sub-line (e.g. Defence | Squishy | New); the category and its swatch sit top-right.
- Save data: none (pins and hides made before still apply).
- Hooks: none.
- Risk: pinning and hiding cards is no longer reachable from the card screen.

## 2026-10-22 Immersive dock revised
- Systems: hud
- Files: eink.css
- What: Feats are round keys stacked bottom-left, opposite the weapons; Rewind (64 x 52) and Autorun (140 x 52) are rounded rectangles at the bottom centre; the starting ability sits above the Feats.
- Save data: none.
- Hooks: none.
- Risk: portrait only (landscape keeps its row).

## 2026-10-22 Design system v2: close match to the Figma screens, Immersive only, new intro
- Systems: ui, hud, settings, splash
- Files: dsheads.js (new), splash.js, eink.css, settings.js, samples10.js, ui.js, index.html, tests/uishots.js (new), tests/tapcycle.js
- What: Immersive is the only in-run HUD (the setting is gone). Title tiles: Field Guide first, How to Play last. Screen Header (01/02, 02/02, LV nn, IT'S A BABY!, Game Over title with Run over) on Sample Rack, Mode Select, Weapon Draft, DNA Loot, It's a Baby and Game Over, with the Figma copy (CHOOSE EXPERIMENT, BASELINE SAMPLE, WEAPON DRAFT, LEVEL UP, Level n strand | splice one gene, REROLL (n LEFT)). Mode cards: #001 left, tag right; Evolution (the Race) first, Iteration, Endless, Level 1. Sample cards show type swatches, not names. Loot cards in the Reward Card layout (rarity chip under the tile, category + swatch at the bottom). Draft loses its restating kicker and repeated description. Pause YOU stats as one ruled readout grid, BUILD and GUIDE as plain rows. Gene Bank: full numbers, Banked / Earned / Spent. Active Effects split For you / Against you. Game Over: time in the readouts, 2 x 2 buttons. New intro (splash.js): on paper, an ink eyepiece draws itself, the slide is pulled into focus, brackets lock onto you, the logo sets itself where the title has it.
- Save data: SET.immersive is now ignored (left in saves).
- Hooks: none in shared files beyond ui.js (Gene Bank readout markup, Active Effects grouping, Game Over Time cell, REROLL label) and samples10.js (mode card copy and order).
- Risk: dsheads.js wraps several UI functions; anything else wrapping them must load before it. The full HUD (top bar, minimap, event chips) is no longer reachable.

## 2026-10-22 Design system v2: remaining screens, Menus copy, pictogram coverage
- Systems: ui, settings, icons
- Files: pictomap.js, eink.css, ui.js, settings.js, seqsel.js, tests/tapcycle.js
- What: Gene Bank leads with a Readout Panel (DNA banked as the hero number, earned, spent) and the next swimmer as a pictogram card. Game Over and Victory stats are Readout Panels, four per row. How to Play rows lead with pictograms. Stat upgrades (PASSIVES, 65) and the last achievement map to shared pictograms; mutation cards 171/200 (the other 29 are v9 genome cards, they show the Mutation category pictogram). Menus setting has its copy (label Menus, PAPER / INK / AUTO). Pinned action bars sit flush with the bottom edge. The v9 sequence screen (openSeq) now opens the v10 Sample Rack: it crashed on v10 profiles after a Petri Dish win (NEW SEQUENCE) and after a Sequence Reveal.
- Save data: none.
- Hooks: seqsel.js openSeq redirects to UI.openSamples under V10.
- Risk: Immune Response can only be chosen on the old sequence screen, so it is now unreachable under v10 (it already was in practice, the screen crashed).

## 2026-10-21 Design system v2: Immersive HUD and 64px pictograms on every card screen
- Systems: ui, hud, icons, autorun
- Files: pictomap.js (new), eink.css, ui.js, uikit.js, loadout.js, fusion.js, samples10.js, junk.js, prestige.js, manualfire.js, tests/einkshot.js
- What: In-run HUD follows the Figma Immersive HUD: dark film keys, round weapon keys stacked bottom-right with a reload ring, Rewind bottom-left with a round RUN / directive key under it, Feats bottom-centre (manual fire: the FIRE keys take the right column). 64px pictograms lead loot and reward cards, draft options, the Tackle Box header and loadout, Field Guide rows, Gene Bank traits and starters, mode cards, autorun options (Pause RUN as option cards), achievements, active effects and junk DNA, baby traits and fusion. Card names are ink; loot titles ink.
- Save data: none.
- Hooks: ui.js refreshHud sets --f on each slot (reload ring); ui.js renderLootCards uses lootPictoHtml; manualfire.js toggles body.mfire.
- Risk: dock layout in portrait Immersive changed (landscape and full HUD keep the old row). Tests updated: einkshot (Menus rule), tapcycle (weapon keys may stack in a column). Full suite 105/109 before the tapcycle fix; still failing and not UI: weapons24test (expects 24 weapons, the pool is 27 with the Early Bird three), wup5test (Toxic Relationship share), wup6test (Eggs clutch cap).
- Also: Settings rows as stacked cards, Segmented Tabs for Pause and Settings, pinned actions stay at the bottom, Field Guide and Active Effects as full-width pictogram rows, mode cards with pictograms, draft options in three columns, baby traits as three cards, Ink tokens on Fusion / Sequence Reveal / Kindred Fuse, splash words in HUD ink.

## 2026-10-21 Design system v2 in the game: tokens, pictograms, title
- Systems: ui, settings, icons
- Files: eink.css, settings.js, index.html, pictos.js (new), tests/tools/pictos.py (new)
- What: The e-ink design system is now the only menu style (eink.css always on); View is LAB / ARCADE again and a new Menus setting picks PAPER / INK / AUTO. Tokens regenerated from Figma (radii 3/5/7, 3px button rule, 31px titles, reward/state/HUD colours, text styles). All 335 Figma pictograms ship as path data (121 KB, 45 KB gzipped) with a renderer. Title: hero egg, nav as 2 x 2 pictogram tiles, Daily Challenge hidden.
- Save data: SET.menus added ('paper' default); SET.view 'eink' migrates to 'arcade' + menus 'paper'.
- Hooks: none (index.html script tag for pictos.js before wicons.js).
- Risk: every DOM screen restyles (eink.css now loads for everyone). Daily Challenge has no entry point while its title button is hidden. New copy placeholders: TODO_COPY:set_menus, TODO_COPY:set_menus_hint.
