## 2026-10-29 First-run setup; readable damage numbers on Darkfield (v10.219)
- Systems: first-run setup (new), render (floating texts), tests
- Files: onboard.js (new), render.js, index.html, ARCHITECTURE.md, tests/onboardtest.js (new), tests/tuttest.js, tests/batchcheck.js, tests/viewtest.js
- What: damage numbers and other floating texts no longer go through the Darkfield inversion (their black outline had turned white, so they washed out over glows). A new player now picks View (Lab or Arcade, shown side by side on a live demo), the slide (brightfield or Darkfield) and sound volumes before the title. Copy written by Claude at the user's request.
- Save data: META.obDone added (setup done). The demo's own run never touches META (restored from a copy).
- Hooks: none in shared files (render.js edit is one line in the floating-text block). onboard.js wraps splashEnd, render, UI.tick, achieve, liveSave; hookOn('hurt:before').
- Risk: tests that call splashEnd() without window.TUT_OFF on a fresh profile now get the setup (three updated with META.obDone). Existing players never see it (any run in RUNLOG or DNA earned).
