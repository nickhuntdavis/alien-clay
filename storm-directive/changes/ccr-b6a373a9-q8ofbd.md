## 2026-10-26 Nine more health, Shell and Membrane cards (v10.145)
- Systems: draft cards, defences (pdef), healing
- Files: vitals.js (new), index.html, ARCHITECTURE.md, tests/vitalstest.js (new)
- What: nine slotless 'up:' cards beside membrane.js's six: always-on regen, on-hit lifesteal (inside the lifesteal pool), +20% healing, rally (kills within 3 s of a hit win part of it back), Shell layers regrow mid-wave, Shell layers burst into shrapnel when they break, Membrane pops (damage and shove) when knocked to zero, regen while the Membrane is full, kills refill the Membrane. Shell and Membrane cards only appear when you have one.
- Save data: none
- Hooks: none in shared files (hookOn tick, kill, proc, hurt).
- Risk: more healing in the 'up' draft group (now 15 health cards in it, which dilutes the v9 upgrades); balance unsimmed beyond 2 bot runs (no errors). Copy is TODO_COPY:vt_*_title / _desc (18).
