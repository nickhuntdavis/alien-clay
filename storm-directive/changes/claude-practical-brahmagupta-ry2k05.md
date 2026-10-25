## 2026-10-25 Matron and Queen fights end: round healing capped per add, one snack budget a cycle (v10.144)
- Systems: bosses, tests
- Files: bosssig10_t2.js, tests/sim/bossprobe.js
- What: Probe (god-mode bot, waves 10 and 15): the Queen healed back everything she took (devour plus two dinners a cycle, each up to six snacks at 3%; a dinner with fewer than three adds orders four fresh ones, so she fed herself) and every fight timed out at 400 s with her near full health. The Matron's rounds healed the adds round you 4.8% a second without limit, so 90 to 100 adds stayed alive and she walked the beds at 300 px/s; fights ran 260 to 400 s. Now: devour and both dinners share one budget of six healing snacks a pattern cycle (18%, the old devour's amount), she still eats past it; rounds heal an add at most six ticks in its life and she walks at 240 px/s. Probe after: Queen 116 to 154 s at wave 10 and 147 s at wave 15 (one weak-build run still timed out with the bot 600 px away), Matron 25 to 182 s. bossprobe.js takes `w15` to put a tier 2 boss in the wave 15 slot and reports dealt and healed per second.
- Save data: none.
- Hooks: none new (the wrapper's queen branch calls sg2Noms; sg2Dinner applies it after its devour).
- Risk: the Queen is easier when the player feeds her; the Matron's adds die as they used to.
