## 2026-10-25 Roster sweep, telegraph and integrity tests (not shipped)
- Systems: tests
- Files: tests/rostertest.js (new), tests/rosterint.js (new), tests/run.sh
- What: `rostertest` spawns the 15 enemies no other test covers plus Colossus and Immune Eye in the Lab Bench for 10 s each (no page errors, each dies to damage, no single hit above roster damage x live knobs x 2), then one ROSTER-driven loop checks that no damage lands before `tele` seconds after the tell starts for the 13 built tells (ids with no detector are printed as SKIPPED; tells that never land a timed hit are printed as vacuous). `rosterint` (plain node, TypeScript parser, no browser) checks every ROSTER `ai` has a FOE_AI entry or game.js case, every `shape` a MICROBES entry or render.js case, and fails on a duplicate key in ENEMIES, ROSTER, BOSSES, FOE_AI, MICROBES.
- Save data: none.
- Hooks: none.
- Risk: none for the game (tests only). `rosterint` fails today on ROSTER.krill (shape 'krill' has no draw code, it falls back to a circle), so the full suite shows that failure until the game is fixed.
