## 2026-10-18 Sandbox: weapons-only developer mode (v10.14)
- Systems: sandbox (new), lab-bench, draft, ui, samples
- Files: sandbox.js (new), game.js, v10.js, ui.js, samples10.js, index.html, tests/sbtest.js (new)
- What: DEVELOPER section (tap the samples title five times; the switch was lost with the v10 samples screen) gets Sandbox with 1, 2 or 3 weapons. It runs on the Lab Bench without god mode: a slow enemy stream on a quarter-speed difficulty clock, HEAT +/- bar on the HUD (35% more spawns and +90 s of clock per step, down to -3), only weapon picks and weapon upgrades (shown in the weapon draft screen), no power-ups, chests, Feats, mutations, defences, bosses or rivals.
- Save data: none (localStorage sd_dev reused).
- Hooks: game.js PT -> sbPT, newGame -> sbInit, director -> sbSpawn; v10.js v10Box -> sbBox, v10Loot -> sbLoot; ui.js openLoot -> sbDraftKind, openDraft -> sbDraftHead (wraps the kicker/title/sub lines), renderDraft -> sbDraftInfo; samples10.js s10Samples -> sbCards, sbWire.
- Risk: none outside Sandbox (every hook is gated on G.debug.sb or UI.sample s010).
