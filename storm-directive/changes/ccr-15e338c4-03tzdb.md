## 2026-10-27 Three stale tests green again
- Systems: weapon levels, tests
- Files: wmods.js, tests/lasershot.js, tests/v10test.js
- What: wmods.js's hit and tick listeners are labelled 'wmods:hit' / 'wmods:tick' (hookstest read the bare 'wmHit' / 'wmTick' as missing functions); lasershot and v10test expect the v10.173 opening draft (the sample's three weapons, SAMPLE_KIT) instead of four cards. No change in play.
- Save data: none.
- Hooks: none (two hookOn labels renamed in wmods.js).
- Risk: none.
