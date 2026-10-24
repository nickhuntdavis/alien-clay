## 2026-10-24 Enemy rings on top, branch screens in the Weapon Draft layout, two best weapons per sample (v10.124)
- Systems: render, fight, weapons (branches), samples (starting offer), tests
- Files: ringtop.js (new), render.js, v10.js, branchback.js, samplestart.js, index.html, tests/xbrdrafttest.js (new), tests/samplestest.js, tests/v10test.js, tests/v9armstest.js, tests/run.sh, ARCHITECTURE.md
- What: every ring round an enemy (status rings, Shell and Membrane rings, build-up bars) now draws over explosions and effects (under enemy bullets). The Lv 3, 6 and 9 weapon branch screens open in the Weapon Draft layout (tabs, details, live scene per branch) instead of cards. Each of the 20 samples has two weapons that suit it (S10_FIT); the starting draft offers those two plus two random matrix weapons (four cards; the guaranteed Switched at Birth card is gone).
- Save data: none.
- Hooks: render.js render -> RING_DEFER on/off round the enemies and ringsOnTop after the fx layer; drawEnemy's ring block -> ringLater; v10.js v10Draw no longer calls fightDraw (ringtop.js does).
- Risk: anything else drawn in fightDraw (corroded drips, bleed drops, snare loops, charged-patch crackle) now also draws over effects. Starting with a suited weapon may make early runs easier (unsimmed).
