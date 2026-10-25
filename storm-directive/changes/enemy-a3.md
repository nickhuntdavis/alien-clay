## 2026-10-25 Armour display and targeting purge (A3)
- Systems: ui (inspector), render, targeting (aim), data
- Files: inspect.js, render.js, data.js, game.js, autorun.js, newfeats.js
- What: the inspector no longer shows an Armour stat or WEAK TO / RESISTS rows; the boss `[ARMOUR N]` tag and the armour arc on aura-armoured enemies are gone. HIGHEST ARMOUR is removed from the aim menu; TOUGHEST now ranks by max HP plus the defence pool (Membrane pool, Shell layers' health). The retired id `armour` still resolves (as TOUGHEST) so stored directives and pairs work; Formic Acid now aims at `strongest`.
- Save data: none
- Hooks: none
- Risk: TOUGHEST now creates the defence state (`fightCd`) when it scores an enemy; `armour` fields on defs untouched (E1 deletes them). TOUGHEST description is `TODO_COPY:aim_tough_desc`.
