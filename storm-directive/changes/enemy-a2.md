## 2026-10-25 Boss rules against v10 (A2, no build)
- Systems: bosses, defences
- Files: data.js, bosses.js, bosspack.js, boss10.js, fight.js (one token), tests/bossshot.js
- What: Chad Prime has only Evasion (the 30% `dodge` is gone). The Johnny no longer bounces shots off its front or takes 0.4x there (its Membrane is the defence; the overshoot opening still pays 1.5x). Litmus Strip tests the seven live damage types and resists a wrong type by 35% (0.65). Mitch has a Membrane and Osis a Shell, each from the roster `parts` (`boss10Twins`, `e.v10def` read first by `fightCd`). Each Kidney Stone enrage sheds one Shell layer (armour, shred-stick and "-10 ARMOUR" code removed). The Fever's rage is speed x2 and attack rate x1.5 (was dt x2); `resist.fire === 0` checks removed. The Fever's `frozen` glue trigger is kept: Conjoined and Held in Suspension both set `frozen` on bosses (0.5 s, 0.3 s).
- Save data: none
- Hooks: bosses.js spawnBoss -> boss10Twins; fight.js fightCd reads e.v10def; bpBounce hook in bossDodges removed.
- Risk: Johnny and Kidney Stone fights are easier to damage (no 0.4x front); Stone's Shell is 6 layers on the roster, not 40 armour. Intro cards for Johnny, Stone, Prime and Fever may still name the old rules (copy, see report). Boss HP untouched.
