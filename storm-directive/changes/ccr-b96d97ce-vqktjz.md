## 2026-10-26 XP granules: bigger, no drift in waves, pickup stat cards (v10.168)
- Systems: pickups, render, stats, draft
- Files: xpgems.js (new), game.js, render.js, index.html, ARCHITECTURE.md, tests/xpgemstest.js (new)
- What: XP granules draw 1.8x bigger with a white halo. Loose granules no longer drift to you in wave mode (was from 650 px); the race keeps a shorter drift (700 px at 110, was 1600 at 190). The 105 px magnet is unchanged. Two new stat cards: Pickup Range (+15% magnet a step) and Gem Drift (+100 px of drift reach a step).
- Save data: none
- Hooks: game.js updatePickups -> xpDrift (one line); render.js gem pass reads XPG (size and halo).
- Risk: slower levelling. Bot sim, Petri Dish, mortal, 6 runs each (old drift via --pre): level at wave 10 mean 19 (old 21); mean wave reached 14.3 (old 13.7), wins 1 of 6 (old 2 of 6), inside run-to-run noise.

## 2026-10-26 Sperm key matches the Tackle Box key (v10.167)
- Systems: hud
- Files: buildbtn.js, style.css, eink.css
- What: the sperm HUD key takes its look from the same rules as the Tackle Box key (#spermBtn listed beside #armBtn in style.css and eink.css: 3 px themed border, corners, colours, Immersive translucency, landscape size), and its icon is a solid silhouette like the Tackle Box one. buildbtn.js keeps only its portrait Immersive position.
- Save data: none
- Hooks: none
- Risk: a branch restyling #armBtn in style.css or eink.css should add #spermBtn to new rules too.
