## 2026-10-25 Phlegm Hocker leaves a Mucus patch (not shipped)
- Systems: enemies (foes3), world objects (Mucus patch)
- Files: web/js/foes3.js, tests/f3test.js
- What: the Hocker's glob now leaves a 40-wide, 4 s Mucus patch (`fightPatch`, fight.js) where it lands, bursts or runs out of range; standing in one keeps you Snotty. The gargle (Water makes the next 3 globs rinse puddles), the GARGLED reaction and the unused `pk` dose are deleted. Hocker tip text is `TODO_COPY:hocker_tip`.
- Save data: none
- Hooks: hookOn('tick', 'f3patch') in foes3.js; no shared file edited.
- Risk: more ice zones on screen (capped at 150); patches feed Slick Move, Snot Socket and Flammable Mucus. f3test's antihistamine and popped checks already failed before this change (unrelated).
