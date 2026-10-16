## 2026-10-16 Purge dead stain-grant code
- Systems: render (colour switches), ui, school, show
- Files: grants.js (142 to 33 lines), game.js, render.js, ui.js, school.js, ARCHITECTURE.md, tests/tools/guide.js, tests/schooltest.js
- What: removed the retired floating research grant (grantsStart/Tick/Due/Take, drawGrants, pause-menu list and toggles, G.grant). grants.js now holds only the live Lab/Arcade colour switches.
- Save data: none (META.grants/grantOff left in place, harmless).
- Hooks: removed grantsStart (game.js), grantsTick (game.js), drawGrants (render.js), grantsHtml/grantsBind (ui.js).
- Risk: tutorial.js 'stains' card text still mentions grants (unreachable now).
