## 2026-10-21 Rescue beacon; autorun COLLECT goes for every collectable (v10.60)
- Systems: kindred, autorun
- Files: kindred.js, render.js, tests/kindredtest.js, ARCHITECTURE.md
- What: a waiting kindred spirit sends sonar pings and a column of light, has a big bobbing arrow over it on screen and a gold edge badge (a sperm inside, an arrow out) off screen, and nudges you (sound, buzz, marker swells) every 20 s. Autorun on COLLECT now heads for it first, chases mutation carriers, and goes for pickups and XP beyond its old reach.
- Save data: none.
- Hooks: render.js drawHud -> kinPointers() (no argument now). kindred.js also wraps autorun.js arGoal.
- Risk: COLLECT runs swim further for loot, so they meet more enemies.
