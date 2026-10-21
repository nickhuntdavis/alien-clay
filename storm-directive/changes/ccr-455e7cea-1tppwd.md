## 2026-10-21 One pick per screen; stacked rewards come back to back (v10.54)
- Systems: reward director, ui (reward screens)
- Files: director.js, v11ui.js, v10.js, tests/drafttest.js
- What: waiting level drafts no longer merge into a four-card take-two screen. Every screen offers three cards and one pick; with two or three rewards waiting, closing (or skipping) one screen opens the next at once, then the usual 30 s gap resumes. The no-sample start draft offers three, not four.
- Save data: none.
- Hooks: none new (v11ui.js listens on #skipBtn).
- Risk: more screens in a row after a big XP burst (they were merged before); `DIRECTOR.merge = true` brings take-two back.

## 2026-10-21 V11 headings, skippable weapon drafts, earlier rescues, fewer race drafts (v10.53)
- Systems: ui (reward screens), kindred, engine (levelling)
- Files: v11ui.js (new), kindred.js, game.js, index.html, tests/kindredtest.js, tests/drafttest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: reward screens head by kind (CHOOSE AN UPGRADE, CHOOSE A WEAPON, UPGRADE A WEAPON, CHOOSE A MUTATION); every weapon draft but the first has SKIP (+2 REROLLS), leaving the mount empty. Rescues at 03:00 and 06:00. A race grows a weapon mount only at Lv 5 (no Lv 12 draft): four weapon drafts a race (first, Lv 5, two rescues).
- Save data: none.
- Hooks: game.js levelling -> kinSlotLv (the SLOT_LEVELS check).
- Risk: race balance (one fewer level-up weapon, rescues 2 to 4 minutes earlier); the Build panel and pause screen still name Lv 12 as the next draft in a race.

## 2026-10-21 Rescued samples change your body; one card screen for upgrades (v10.52)
- Systems: kindred, samples, ui (reward screens), weapons
- Files: kindred.js, boxlook.js, sidemo.js, tests/kindredtest.js, tests/sivtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: an absorbed sample grafts onto your body (your tail in lengths: yours, then each rescued sample's; Not of This World a glow; Prawn Again its halo). The rescue pick now uses the Weapon Draft screen, like the starting weapons. Weapon upgrade tiers, mutations and modifications all use the plain card screen (flags `SIV_DRAFT`, `BOX_LOOK_ON` bring the old screens back).
- Save data: none.
- Hooks: none new; kindred.js also wraps samplelooks.js slDraw.
- Risk: other branches working on sidemo tier screens or boxlook heads will find them switched off.

## 2026-10-21 Kindred spirits: sample rescue and absorption in The Race (v10.51)
- Systems: kindred (new), samples, weapons, ui
- Files: kindred.js (new), samples10.js, sigweap.js, render.js, index.html, tests/kindredtest.js (new), tests/samplestest.js, tests/v10test.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race a stranded sperm of another sample appears at 05:00 and 10:00 with an edge chevron; touching it absorbs it (its passive runs beside yours, its three weapons join the run's pool, it unlocks as a starter) and opens CHOOSE YOUR DIFFERENCE, where one of its weapons goes on a new mount. Race weapon drafts only offer carried samples' weapons. The old sample unlock watches (wave 10, a Mythical box and so on) are retired.
- Save data: META.s10 now also written by rescues; no keys added.
- Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool (filter). samples10.js passives read s10Has instead of G.s10.id.
- Risk: balance (a 4th and 5th weapon mount by 10:00; absorbed passives stack); slot drafts in a race often deal one card (your own remaining starter). weapons24test already failed on main (27 weapons with Acro).
