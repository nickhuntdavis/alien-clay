## 2026-10-25 Knockback rules from the matrix (B11)
- Systems: combat, fight
- Files: game.js (damageEnemy knockback line), fight.js (knockDefMul), combat.js (two COMBAT constants), tests/fighttest.js
- What: Squishy enemies take 50% less knockback (COMBAT_MATRIX 11.4); an enemy whose Membrane is up takes 50% less too (matrix 3 gives no figure; Force already does 50% to Membrane). The generic x1.5 knockback on Snotty (chill) enemies is gone; Snot Rocket keeps its own launch.
- Save data: none
- Hooks: none (game.js calls knockDefMul from fight.js)
- Risk: Snotty enemies slide less far; Squishy and Membrane enemies are shoved half as far, so Force/Knockback builds feel weaker against them. Pull (12.2) not changed here.
