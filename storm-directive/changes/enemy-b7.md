## 2026-10-25 Elite affixes (ENEMY_HANDOFF B7)
- Systems: enemies, elites
- Files: elites10.js (new), v10.js, index.html, tests/elitetest.js (new), tests/run.sh, ARCHITECTURE.md
- What: every elite (not boss, rival or egg) gets exactly one affix picked by its roster role: Trailing (chargers leave 2 s pools, hurt 30% of contact damage per 0.5 s), Fanning (shooters swap every third volley for a 0.8 s telegraphed 5-shot 60 degree spread), Gifting (tanks give one unshielded ally within 260 a 25% Membrane for 3 s, drawn link, every 7 s), Hasty (chasers x1.5 speed below 30% health, ring and streaks). Smouldering (newfoes.js) is routed through the picker: 25% where the role has a specific affix, always where it has none. A small mark above the elite shows the affix; no text on screen. Elite HP stays x5.
- Save data: none
- Hooks: v10.js v10Draw -> el10Draw; `hookOn('tick', 'el10Tick', ..., -1)` (runs before nf10Tick); `shootPattern` is wrapped in elites10.js (Fanning volley counter).
- Risk: roles with no specific affix (swarm, carrier, summoner, leech, relay, sprinter, sniper, controller, support) now always roll Smouldering (was 25%), so every elite of those roles bursts on death; shooters that do not call `shootPattern` never fan.
