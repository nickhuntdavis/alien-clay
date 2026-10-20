## 2026-10-20 Membrane bubble is a hitbox again (v10.49)
- Systems: combat (pdef), enemies, projectiles
- Files: pdef.js, game.js, tests/bubblehit.js (new)
- What: while your shield (Membrane) is up, the bubble is solid. Enemies touch it at its edge (not your body), are held outside it and shoved back (heavier ones less, bosses barely). Enemy shots stop at its edge and the Membrane soaks them. With the Rubber Johnny relic the bubble also throws each stopped shot back out at the mirrored angle as a player shot (the v9 skin did this; `!V10` had switched it off). Once the Membrane breaks, the bubble is gone and contact is on your body as before.
- Save data: none.
- Hooks: game.js updateEnemies -> pdefBubbleR / pdefBubbleBounce (contact radius); game.js enemy-bullet loop -> pdefBubbleR / pdefBubbleReflect (hit radius).
- Risk: balance. Contact and bullet hit radius is now the bubble's (38 units vs body ~13) while a shield is up, so the Membrane drains a little sooner; enemies can no longer body-block you inside the bubble. Sims not run.
