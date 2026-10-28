## 2026-10-28 Collision crash with timer enemies
- Systems: combat (collisions), enemies
- Files: collide.js
- What: collide.js kept its per-pair collision memory in `e.cdT`, which newfoes.js already uses as a number cooldown, so a knocked enemy hitting one of those threw "e.cdT.get is not a function". The Map now lives in `e.cdPr`.
- Save data: none.
- Hooks: none.
- Risk: none.
