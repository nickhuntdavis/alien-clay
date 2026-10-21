## 2026-10-21 V11 power curve: no early one-shots, range falloff, per-level gains (v10.57)
- Systems: power11 (new), combat
- Files: power11.js (new), index.html, tests/p11test.js (new), tests/fighttest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: until 2:00 one hit can take at most half a germ's or elite's health (lifting by 5:00; branches and mutations still multiply past it); damage against germs starts at 70% and reaches full by 10:00; early germs have x2 health, back to normal by 8:00; each level gives +0.5% damage, +0.5% attack rate and +1.5 max health; direct hits beyond 220 units lose damage, down to 55% at 600. Bosses and rivals keep their tuning (range still applies). Sims: early one-shots ~90% -> 0 to 10% for every starter (median 2 to 3 hits); bot deaths unchanged (mostly 6 to 8 min either way).
- Save data: none.
- Hooks: none in shared files (wraps game.js makeEnemy, fight.js fightHit, juice.js levelJuice).
- Risk: balance in every v10 mode (Petri Dish and Endless too); Level 1 not checked; long-range weapons lose up to 45% on far targets.

## 2026-10-21 Weapon branch screens back (v10.56)
- Systems: weapons (branch screens), ui
- Files: sidemo.js, tests/kindredtest.js
- What: weapon upgrade tiers open in the Weapon Draft layout again, with a tab and a live scene per branch (`SIV_DRAFT` true). Mutations and modifications stay plain cards.
- Save data: none.
- Hooks: none.
- Risk: the v10.44 run that stalled did so as this screen opened; watch the run log's fps line.

## 2026-10-21 Rescue made a big deal: portrait, pick or skip, fusion animation (v10.55)
- Systems: kindred, ui (reward screens)
- Files: kindred.js, v11ui.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: the rescue's Weapon Draft screen shows the rescued sample swimming at the top; pick one of its weapons or skip; either way a fusion plays (the two swim together, flash, and your new grafted body swims out, with both names). Paused throughout; tap to close after 2.6 s, closes itself at 5 s.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.openDraft and UI.pickLoot; v11ui.js v11Skip calls kinFuse).
- Risk: none beyond the screens; the fusion borrows the drawing globals for its frames (as slPicDraw does).

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
