## 2026-10-25 Cytokine Caster fan and Diatom ring with tells
- Systems: enemies
- Files: shooters10.js (new), roster.js (Caster and Diatom rows only), index.html, tests/newfoestest.js, ARCHITECTURE.md
- What: the Caster shows a 0.5 s fan outline then fires 5 Acid shots over 70 degrees; the Diatom shows a 0.4 s ring outline (a tick per shot) then fires a ring of 6. Both stand still during the tell; aim is locked when it starts. Their `shoot` rows are gone (damage, count, arc, speed and cooldown read from `atk[0]`).
- Save data: none.
- Hooks: none in shared files (index.html script tag after newfoes.js; wraps `nf10Draw`).
- Risk: with no `def.shoot` the two lose the off-screen shooter chevron (render.js), the autorun aim tier (autorun.js `aimShootTier`) and the 0.4x spawn weight for shooters (game.js `wOf`), so they spawn more often than before. Global `BUL.keep` still drops 1 bullet in 10, so a fan can show 4.
