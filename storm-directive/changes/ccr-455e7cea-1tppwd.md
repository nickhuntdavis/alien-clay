## 2026-10-21 Rescues are a race's only weapon drafts (v10.62)
- Systems: kindred, ui (Tackle Box)
- Files: kindred.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race there are no level-up weapon drafts. Rescues come at 02:00 and 05:00; their screen offers the sample's three weapons plus one of your own sample's starters you don't hold, and the pick fills an empty mount or grows one (up to 3). Skip keeps the mount free. At 08:00 and 11:00 a rescue comes only if a mount is empty (a skipped rescue or a Recycle). Recycle in a race gives its rerolls and leaves the mount for the next rescue instead of opening a draft (its button text is a TODO_COPY placeholder in races). With every mount full, a rescue still absorbs and plays the fusion, with no weapon screen.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.renderArmoury for the Recycle text; draftBox now drops non-rescue weapon drafts in a race).
- Risk: balance: one weapon for the first two minutes (the bot sim checks survival); 3 weapons at most, by 05:00.
