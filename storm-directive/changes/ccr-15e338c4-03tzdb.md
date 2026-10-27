## 2026-10-27 sivtest and statuptest green; Enzyme Sneeze damage corrected (v10.182)
- Systems: weapon base stats, tests
- Files: statup.js, tests/sivtest.js
- What: Enzyme Sneeze's reshaped base (faster fire, bigger magazine) never got its damage correction and dealt 1.47x its old output on dummies (its extra hits set off Corrosive Splash far more often); ST_W.acro_spray dmgK 0.5 brings it to 1.16x. sivtest stops at tier 3: the Lv 10 mastery tier is gone since weapons stop at Lv 9 (v10.148), and it now checks no tier 4 is offered.
- Save data: none.
- Hooks: none.
- Risk: Enzyme Sneeze (Acrobat sample) hits for half what it did per shot; its total output is near its pre-reshape level.

## 2026-10-27 Three stale tests green again (v10.182)
- Systems: weapon levels, tests
- Files: wmods.js, tests/lasershot.js, tests/v10test.js
- What: wmods.js's hit and tick listeners are labelled 'wmods:hit' / 'wmods:tick' (hookstest read the bare 'wmHit' / 'wmTick' as missing functions); lasershot and v10test expect the v10.173 opening draft (the sample's three weapons, SAMPLE_KIT) instead of four cards. No change in play.
- Save data: none.
- Hooks: none (two hookOn labels renamed in wmods.js).
- Risk: none.
