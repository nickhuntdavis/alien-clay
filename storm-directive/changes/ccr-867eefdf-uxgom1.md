## 2026-10-19 Standard Issue: real preview, tabbed branch screen, a scene per branch (v10.31)
- Systems: sidemo (new), screens, weapons24, ui
- Files: sidemo.js (new), preview.js, ui.js, index.html, tests/sivtest.js (new), tests/run.sh
- What: Standard Issue's animated preview now shows the real weapon: one heavy shot at the nearest cell inside its 440 reach (dashed arc), 0.45 s apart, an 8-round magazine under Spermy and a 1.2 s reload ring, stopping on the first hit, with real damage numbers. Its tier screens (promise, branch card, mastery) open in the Weapon Draft layout with a tab per choice instead of cards, and each tab plays its own scene (bounces and zigzags, pierce lines, marks and BONKs, nuts, lanes, pops, the 10-shot replay ...), built on the choices already taken. The badge shows the tier, not the internal level.
- Save data: none.
- Hooks: preview.js makePreview/stepPreview/drawPreview -> PV_OWN (new registry); ui.js openLoot -> sivDraftKind, openDraft -> sivDraftHead; ui.js renderDraft badge reads wTier for 'wupfork'.
- Risk: a 'wup' box with only Standard Issue ready is turned into its 'wupfork' in openLoot (the other 23 still use cards). Preview only: no combat change.
