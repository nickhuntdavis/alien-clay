## 2026-10-18 Autofire toggle and FIRE buttons; Rewind moves left (v10.16)
- Systems: manual fire (new), settings, ui
- Files: manualfire.js (new), game.js, settings.js, style.css, index.html, tests/mftest.js (new)
- What: Settings > Game > Autofire. OFF gives each weapon a round FIRE button, stacked up the right side; hold to fire, tap for one shot. Orbit, wake, siphon and heat weapons stay automatic. Rewind and the ability button (#side) move to the bottom left in every mode (landscape: right of the HUD column).
- Save data: SET.autoFire (default true).
- Hooks: game.js updateWeapon -> mfGo, and w.mfTap cleared after a shot.
- Risk: anything else placed bottom left now shares the corner with Rewind.

## 2026-10-18 Sandbox: + mount, branch mark; level number in Immersive (v10.15)
- Systems: sandbox, ui, render
- Files: sandbox.js, ui.js, render.js, tests/sbtest.js
- What: one Sandbox card. You start with one weapon; an empty + mount on the HUD opens a weapon pick whenever tapped (up to 3). Level-ups no longer open weapon upgrades in Sandbox: every 4th level banks one, and a faint branch mark on a ready weapon's slot spends it. Immersive mode shows your level as a small faint number top left (every mode).
- Save data: none.
- Hooks: ui.js slot tap -> sbSlotTap, refreshHud -> sbSlotShow/sbSlotMark; render.js drawHud level number (Immersive).
- Risk: none outside Sandbox apart from the Immersive level number.

## 2026-10-18 Sandbox: weapons-only developer mode (v10.14)
- Systems: sandbox (new), lab-bench, draft, ui, samples
- Files: sandbox.js (new), game.js, v10.js, ui.js, samples10.js, index.html, tests/sbtest.js (new)
- What: DEVELOPER section (tap the samples title five times; the switch was lost with the v10 samples screen) gets Sandbox with 1, 2 or 3 weapons. It runs on the Lab Bench without god mode: a slow enemy stream on a quarter-speed difficulty clock, HEAT +/- bar on the HUD (35% more spawns and +90 s of clock per step, down to -3), only weapon picks and weapon upgrades (shown in the weapon draft screen), no power-ups, chests, Feats, mutations, defences, bosses or rivals.
- Save data: none (localStorage sd_dev reused).
- Hooks: game.js PT -> sbPT, newGame -> sbInit, director -> sbSpawn; v10.js v10Box -> sbBox, v10Loot -> sbLoot; ui.js openLoot -> sbDraftKind, openDraft -> sbDraftHead (wraps the kicker/title/sub lines), renderDraft -> sbDraftInfo; samples10.js s10Samples -> sbCards, sbWire.
- Risk: none outside Sandbox (every hook is gated on G.debug.sb or UI.sample s010).
