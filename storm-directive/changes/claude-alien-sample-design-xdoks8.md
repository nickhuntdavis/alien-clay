# claude/alien-sample-design-xdoks8

## 2026-10-20 v10test allows the weapon draft's combo partner
- Systems: tests
- Files: tests/v10test.js
- What: the weapon slot draft may swap one card for a combo partner of a weapon you hold, of any attack type (combos10.js, by design). v10test now allows that one card (marked c10) and still checks every other card brings a new attack type. It was failing about 2 runs in 3.
- Save data: none.
- Hooks: none.
- Risk: none (test only).

## 2026-10-20 Level 0 no longer crashes at lesson 11 (v10.42)
- Systems: school, tests
- Files: school.js, tests/v10test.js, tests/.gitignore
- What: autorun in Level 0's lesson 11 (Junk in the Trunk) read the v9 junk DNA list, which doesn't exist under v10, and crashed the game on entering the room; it now steers to the mutation strand and its carrier (mutdrop.js). Level 0 plays through all ten lessons to the egg again (schooltest passes). v10test expects the four Experiments the sample screen now offers. Screenshots from tests run outside run.sh no longer show up as untracked files.
- Save data: none.
- Hooks: none.
- Risk: none.
