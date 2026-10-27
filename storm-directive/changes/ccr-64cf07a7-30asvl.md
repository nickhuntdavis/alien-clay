## 2026-10-27 Attack types lock in (v10.185)
- Systems: modifier cards, attack-type swap, ui
- Files: atklock.js (new), index.html, tests/atklocktest.js (new), tests/run.sh, tests/tools/guide.js
- What: Melee, Ranged, Mines and Orbiting are now a one-way choice per weapon: once a weapon has one, no other attack type is offered on it. An attack-type card shown on a reward screen and not taken (another card picked, rerolled or skipped) is never offered again that run. Tapping a card that gives a weapon its first attack type opens a confirm (copy is TODO_COPY:atk_lock_title, _body, _yes, _no). The Sandbox and no-limits play keep the free swap.
- Save data: none (run state G.atkNo).
- Hooks: none in shared files (wraps modOk, genLoot, UI.renderLootCards, UI.renderDraft, UI.pickLoot; hookOn('tick', 'atklock:check')).
- Risk: fewer attack-type cards dealt over a run (each one seen and passed is gone); atkswap.js's switch card now only appears in the Sandbox.
