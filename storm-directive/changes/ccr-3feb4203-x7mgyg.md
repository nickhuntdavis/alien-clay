## 2026-10-26 Weapon kill bars stop leaking kills (v10.177)
- Systems: weapon levels
- Files: wmods.js
- What: kills keep banking while a weapon's level screen waits (wave mode holds it to the wave's end; up to one bar carries over), a kill with no weapon (burn or bleed ticks, reactions, arcs) goes in full to the last weapon that hit the enemy within 3 s, and Tapeworm turret kills count for their weapon. Probe: over half of some weapons' kills were being dropped while their screen waited.
- Save data: none.
- Hooks: none in shared files (wmods.js hookOn('hit:late', 'wmHit') replaces the 'proc' listener; hookOn('tick', 'wmTick') tags turret src.wmW).
- Risk: weapons level faster mid-run (lead weapon Lv 6 to 7 by wave 10, was 4 to 6); wave20 mortal x6 bot wins 3/6 vs 1/6.

## 2026-10-26 Milder weapon level catch-up (v10.176)
- Systems: weapon levels
- Files: wmods.js
- What: catch-up toned down at the user's request: assists 0.5 to 0.3 of a kill, catch-up +50% to +35% per level behind, WM.kg 0.35 to 0.42 (316 kills from Lv 1 to Lv 9; was 352 before v10.175, 285 in it). Not simulated.
- Save data: none.
- Hooks: none.
- Risk: untested values; v10.175's milder sim variant (assist 0.3, catchK 0.35, kg 0.5) won 4/8.

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
