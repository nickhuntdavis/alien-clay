## 2026-10-24 Pool weapons throw water balloons (v10.123)
- Systems: weapons, render
- Files: balloon.js (new), render.js, index.html, tests/balloontest.js (new), tests/run.sh, ARCHITECTURE.md
- What: Nocturnal Emission and Hot Mess throw a wobbling balloon that follows the enemy it was aimed at and bursts on it (splash, droplets, a splat sound); the puddle lands on that enemy. Damage and puddle numbers are unchanged. A balloon lets go of an enemy that dies, teleports (over 40 units in a frame) or drifts over 260 from the aim point.
- Save data: none.
- Hooks: render.js lob drawing -> blDraw. balloon.js wraps fireWeapon, updateProjectiles, landLob (after cellmods2.js).
- Risk: pools hit more often (they no longer land where a moving enemy used to be), so both weapons are a little stronger; not simmed. The 26 modifier cells for pools (MODIFIER_MATRIX.md 5.10) are not built yet; Hot Mess still runs its 5.7 cells.

## 2026-10-24 Pools as water balloons: all 26 modifiers (docs only)
- Systems: docs only (redesign docs)
- Files: MODIFIER_MATRIX.md (new 5.10; Nocturnal Emission and Hot Mess cells in sections 3 and 4 point to it; 5.7 marked superseded; rule 10 exception), COMBAT_MATRIX.md (decision 63), ATTACK_TYPES.md (Pool row), README.md (follow-on item)
- What: the two pool weapons are now thrown like a water balloon at one enemy's face, and every one of the 26 modifiers has a design for them, chosen by the user.
- Save data: none.
- Hooks: none.
- Risk: none in the game; the shipped Hot Mess cells (cellmods2.js) no longer match the spec.
