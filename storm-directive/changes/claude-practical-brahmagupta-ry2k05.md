## 2026-10-26 Boss Membranes refill in 10 s, not 2 (the Johnny's health bar moves again) (v10.145)
- Systems: bosses, combat defences
- Files: boss10.js
- What: The Johnny's Membrane (half its health, 1505 points at wave 5) refilled fully 2 s after 2 s untouched, so it came back during every roll and a weak build never dented the health bar. Probe (god-mode bot, wave 5): Membrane up 79 to 99% of the fight, fights 97 to 400 s, with the old pattern list too (not a C3 regression). Boss-rank Membranes now take 10 s to refill; the 2 s quiet time stays, as the intro card says. Mitch (Twins) has the same defence and gets the same rule. Probe after: 56, 66, 97 s.
- Save data: none.
- Hooks: boss10.js wraps combat.js tickDefence (fight.js calls it by name each frame).
- Risk: every boss Membrane is softer under sustained fire; small-cell Membranes unchanged.
