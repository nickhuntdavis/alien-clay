## 2026-10-18 Sandbox: no Acid Crypts or big hazards; log head fixed (v10.20)
- Systems: sandbox, terrain, run log
- Files: terrain.js, bighaz.js, sandbox.js, wstats.js, meta.js, tests/sbtest.js
- What: Sandbox maps have no Acid Crypts and no big hazards (Plughole, Hot Flush and so on), which were doing 25 to 65% of the damage and killed one run. The run log's Sandbox line now counts weapons properly (was "undefined weapon") and drops the meaningless "vs level curve".
- Save data: none.
- Hooks: terrain.js makeTerrain and bighaz.js makeBigHaz -> sbOn.
- Risk: none outside Sandbox.
