## 2026-10-26 Wave mode holds every upgrade until the wave is clear; tapping an enemy lists its Active effects (v10.164)
- Systems: waves, inspect
- Files: waves.js, inspect.js, tests/inspecttest.js
- What: in wave mode nothing opens during a wave, including boss rewards, fusions and DNA drops that used to open at once ('now' requests); they open as soon as the wave is clear. An enemy's tap card now has an Active effects row: Burning, Bleeding, Snared, Charged, Corroded, Stunned, Possessed, Conjoined, the older statuses (Sick, Melting, Snotty/Glued, Lubricated, Soaking wet, Cursed), a Due Date countdown, Red Tape, and build-up bars (Corrosion, Poise, Burn bar, Parasite bar) with time left, damage a second and the weapon that caused a damage over time; a chip opens that term's Field Guide line; at HALF inspect speed it refreshes 4 times a second.
- Save data: none.
- Hooks: hookOn('tick', 'inspect:foe') in inspect.js.
- Risk: a boss's relic now waits for the wave's stragglers to die; campaign or tutorial code that relied on 'now' opening mid-wave would wait too.
