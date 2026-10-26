## 2026-10-26 Weapon levels catch up (v10.175)
- Systems: weapon levels
- Files: wmods.js
- What: weapon kill bars now also fill from assists (half a kill for any weapon that hit the enemy in the last 3 s) and catch up (+50% kill credit per level below your highest weapon); the kill curve is gentler (WM.kg 0.5 to 0.35: 352 to 285 kills from Lv 1 to Lv 9).
- Save data: none.
- Hooks: none in shared files (wmods.js hookOn('proc', 'wmHit')).
- Risk: weapons reach Lv 9 sooner; wave20 mortal x8 bot wins 6/8 with it, 6/8 without (no measurable difficulty shift).

## 2026-10-26 Bigger Membrane draws bigger (v10.174)
- Systems: defence (pdef), stamina
- Files: stamina.js
- What: armourRing now sizes the drawn Membrane bubble from bodymods.js bubbleR(), so Bigger Membrane's 60% wider hitbox is also 60% wider on screen (before, only the invisible hitbox grew).
- Save data: none.
- Hooks: none.
- Risk: none (radius unchanged without the card).
