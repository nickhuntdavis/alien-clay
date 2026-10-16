## 2026-10-16 Purge dead stain-grant code
- Systems: render (colour switches), ui, school, show
- Files: grants.js (142 to 33 lines), game.js, render.js, ui.js, school.js, ARCHITECTURE.md, tests/tools/guide.js, tests/schooltest.js
- What: removed the retired floating research grant (grantsStart/Tick/Due/Take, drawGrants, pause-menu list and toggles, G.grant). grants.js now holds only the live Lab/Arcade colour switches.
- Save data: none (META.grants/grantOff left in place, harmless).
- Hooks: removed grantsStart (game.js), grantsTick (game.js), drawGrants (render.js), grantsHtml/grantsBind (ui.js).
- Risk: tutorial.js 'stains' card text still mentions grants (unreachable now).
- Also: deleted the unreachable `stains` tutorial card (tutorial.js). Risk: none.
- Also: removed the pause-menu Stains lists and permanent-stain toggles (ui.js stainsHtml, data-pst), .li.stain CSS, staintest. Save data: META.pstainOff no longer written; META.pstains still read in game.js (old saves keep their stains, now with no off switch).
