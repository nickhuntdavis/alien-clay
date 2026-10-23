## 2026-10-23 Sperm passives: the doc's full list (v10.98)
- Systems: sperm passives, mutations, chemistry (fight), draft
- Files: spfull.js (new), index.html, tests/spfulltest.js (new)
- What: level-ups deal only SPERM_PASSIVES.md's list (24 cards plus all eight defences); Sticky Fingers, the old damage-type cards, Come Closer and Death Is Recycling as cards, and the v9 g_ cards are gone. Six new passives with 3 levels and a mastery: Pile-Up (Force knockback and collisions), Wet Floor (bigger, longer Acid pools), Chain Letter (more and longer Static jumps), Bleeding Heart (stronger Bleed, more Extraction healing; mastery Bad Blood), Peer Pressure (longer Possession, harder ally hits), Leave a Little Something (all your pools last longer, final double tick). Come Closer (Stickier + Pile-Up) and Death Is Recycling (Peer Pressure + Crossed Wires) are now automatic pair bonuses; holding one half deals the other more often. Renamed to the doc: Overexcited, Stickier, All at Once, Hungry Hungry.
- Save data: none.
- Hooks: none in shared files. Wraps fight.js fightStatus, fightDeath, fightArc; chem.js curseFoe; mutations.js mutHit; weapons24.js wupStats, wupDmgMul, wupTick, wupKill.
- Risk: Chain Letter replaces fightArc's body while held (a later change to fightArc needs copying). Defences now include Shell, Squishy, Evasion and Thorns in drafts (SLICE.defs widened).

## 2026-10-23 Matrix only: the 27 matrix weapons and 25 matrix modifiers (v10.97)
- Systems: weapons, samples, weapons (modifiers), sandbox
- Files: matrixonly.js (new), index.html, tests/v9armstest.js, combo10test.js, wup3test.js, wup5test.js (matrixRestore)
- What: only the 27 weapons in MODIFIER_MATRIX.md are dealt anywhere (drafts, starting picks, rescues, the Sandbox): the rest go on hold, and the v9 samples leave the Sample Rack. Only the matrix's modifiers are offered (plus Type Swap); Sweep, Growing, Chain Hits, Returning, Delayed Blast, Lobbed, Trail, Around You, Volley, Stat Scaling, Split on Kill, Pets, Gravity Well and Lunge are hidden. MATRIX_ONLY.on = false, or matrixRestore(), undoes it; tests (window.TUT_OFF) still get every modifier.
- Save data: none.
- Hooks: none in shared files. Wraps modmatrix.js modOk; pushes onto weapons24.js W24_HOLD.
- Risk: v9 sample unlocks and saves still exist but are hidden.

