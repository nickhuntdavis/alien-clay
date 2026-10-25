## 2026-10-25 Level-up DNA dropped onto the slide by the scientist (v10.135)
- Systems: rewards (DNA drops, new), autorun, ui (loot screen), tutorials, tests
- Files: dnadrop.js (new), junk.js, index.html, ARCHITECTURE.md, tests/dnadroptest.js (new), tests/levelboxtest.js, tests/run.sh, tests/sim/wave20.js, tests/sim/lvsim.js
- What: a level-up is pipetted onto the slide 300 to 560 away (a reachable floor cell 4 to 8 route cells away in a campaign level), never in walls, terrain or boss hazards; one drop at a time, further level-ups add to its count and swimming into it opens every screen back to back. Boss fights: it lands nearer and autorun only fetches it when the way is safe. Autorun goes for it before other pickups (in levels only when in sight). Gold outlined edge chevrons with distance and count point to it. The level-up screen shows a note from the scientist, picked by health, boss, stack.
- Save data: none (META.seenTut.dnadrop when the tutorial card shows).
- Hooks: none in shared files. dnadrop.js replaces levelbox.js lvboxTick/lvboxSpot, wraps applyPickup, autorun.js arPickups, v10Draw, UI.openLoot; hookOn('tick', 'ddTick'). junk.js junkArrow gains an optional fill colour.
- Risk: autorun detours more (bot win rate; see sims in NOTES.md); TODO_COPY placeholders show on the drop label, three note moods and the tutorial card until the copy lands.
