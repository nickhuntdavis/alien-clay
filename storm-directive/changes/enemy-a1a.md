## 2026-10-25 Relic boxes open again (handoff A1a, not shipped)
- Systems: loot, bosses, rewards
- Files: web/js/draft.js, web/js/raceplan.js, tests/bosstest.js
- What: `draftBox` now lets `relic`, `spoils` and `rrelic` boxes open (v10 dropped them, so boss relics never appeared); `rplanFree` passes `spoils` and `rrelic` in the Race. Wave mode already exempts `now` boxes in `waveHoldsLoot`; `dirGate` opens `now` boxes at once.
- Save data: none
- Hooks: none (one list extended in draft.js draftBox, one in raceplan.js rplanFree)
- Risk: boss kills now open two extra screens (relic, spoils); relic effects are unported (A1b), so some do nothing under v10.
