## 2026-10-21 Kindred spirits: sample rescue and absorption in The Race (v10.51)
- Systems: kindred (new), samples, weapons, ui
- Files: kindred.js (new), samples10.js, sigweap.js, render.js, index.html, tests/kindredtest.js (new), tests/samplestest.js, tests/v10test.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race a stranded sperm of another sample appears at 05:00 and 10:00 with an edge chevron; touching it absorbs it (its passive runs beside yours, its three weapons join the run's pool, it unlocks as a starter) and opens CHOOSE YOUR DIFFERENCE, where one of its weapons goes on a new mount. Race weapon drafts only offer carried samples' weapons. The old sample unlock watches (wave 10, a Mythical box and so on) are retired.
- Save data: META.s10 now also written by rescues; no keys added.
- Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool (filter). samples10.js passives read s10Has instead of G.s10.id.
- Risk: balance (a 4th and 5th weapon mount by 10:00; absorbed passives stack); slot drafts in a race often deal one card (your own remaining starter). weapons24test already failed on main (27 weapons with Acro).
