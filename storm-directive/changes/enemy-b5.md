## 2026-10-25 Ghost Swimmer phases as Evasion, Quantum Swimmer tells its jump (B5, unshipped)
- Systems: enemies (roster behaviours), rendering
- Files: phasers10.js (new), game.js, render.js, index.html, ARCHITECTURE.md, tests/newfoestest.js
- What: a phased Ghost Swimmer stays hittable (damageEnemy no longer returns 0; autoaim can pick it; its Evasion defence still rolls) with contact off and a flicker (also the last 0.4 s before it fades). Quantum Swimmer picks its landing spot, draws a puff there for 0.4 s, then jumps; one jump per 2 s at most.
- Save data: none.
- Hooks: game.js 'blink' case -> qsBlink; render.js enemy alpha (2 lines) -> phFlick; phasers10.js wraps nf10Draw and registers a 'tick' hook.
- Risk: Ghost is now killable while faded (easier); Quantum's jump is 0.4 s slower.
