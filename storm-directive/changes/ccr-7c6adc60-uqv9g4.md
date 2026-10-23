## 2026-10-23 Loot filters, attack-type swap, Laser pictogram (v10.102)
- Systems: ui (loot screen, weapon draft), weapons (modifiers), pictograms
- Files: atkswap.js (new), lootfilter.js (new), index.html, tests/lootfiltertest.js (new)
- What: long loot lists (the no-limits level-up list, the 27-weapon pick) get a search box, tabs (by weapon, passives, defences; by attack type for weapons), chips (modifier group, passive kind, damage type) and sort (as dealt, A to Z, by group). Melee, Ranged, Mines and Death from Above now swap: the card is marked SWITCH with a red border and says the old one's ranks, branch and mastery go; once a weapon has one, another is dealt at 15% weight. The Laser uses the spark-of-life pictogram.
- Save data: none.
- Hooks: none in shared files. Wraps modOk, modAdd, modCard, modDraftCands, UI.renderLootCards, UI.renderDraft; adds PICTO_ALIAS entries.
- Risk: the Laser now shares its pictogram with Spark of Life. Attack-type modifiers can now be offered on a weapon that already holds one (was never).

## 2026-10-23 Kept targeting/autorun masteries use no slot (v10.101)
- Systems: sperm passives
- Files: spsteer.js, tests/spsteertest.js
- What: the mastery card for a kept Advanced Targeting or Autopilot no longer takes a passive slot (stored in G.spMx, like the defence masteries).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-23 Branching passive masteries (v10.100)
- Systems: sperm passives, mutations, defences (pdef), draft (forks)
- Files: spmast.js (new), index.html, tests/spmasttest.js (new)
- What: taking a passive's mastery opens a fork of two masteries (user: the first two options of each). Covers Slipstream, Heartbeat, Overexcited, Group Project, Growing Pains, Extra Padding, Stickier, Crossed Wires, Conductive Mess, Big Brain, Can't Sit Still, All at Once and Hungry Hungry; Squishy, Shell, Thorns and Evasion get mastery cards (no slot) once held at 3 (Squishy at 1). Group Project, Growing Pains, Conductive Mess and the four trade-offs now have 3 levels (trade-off costs stay fixed). Shell's option A became "a lost layer regrows after 15 s without a hit", as layers already refit each wave.
- Save data: none.
- Hooks: none in shared files. Wraps mutations.js mutDmg, mutRate, mutSpeed, mutHurtIn, mutKill, mutLevel, mutBurst, mutRxLock, mutHit; pdef.js pdefHurt; game.js healPlayer, gainXp, fireWeapon; weapons24.js wupTick; draft.js forkCards, draftTitle.
- Risk: many wrappers on mutation hooks (order: after spfull and spsteer). Mastery numbers are unsimmed (bots rarely reach Rank 4).

## 2026-10-23 Targeting and autorun passives; The Runs loop mastery (v10.99)
- Systems: sperm passives, autorun, autoaim, ui (aim menus, end screen)
- Files: spsteer.js (new), spfull.js, autorun.js (aimList), ui.js and loadout.js (aim menus read aimList), index.html, tests/spsteertest.js (new)
- What: targeting starts with Nearest, Furthest, Densest cluster and Elites & bosses; Advanced Targeting adds Toughest and Fastest, then Lowest health and Shooters first, then the rest; its mastery alternates a weapon's shots between its two rules. Autorun starts with Kite and Hold; Autopilot adds Collect, Orbit, then Hunt and Nest; its mastery adds an AUTO mode that picks for you. Win a run holding one and you keep all its levels for good (both held: you pick one); a kept passive's card is gone and its mastery card turns up from run Lv 10. The Runs' mastery: close a loop of trail and everything inside takes a hit of its type.
- Save data: META.spKeep added ({ aim, auto }).
- Hooks: ui.js tap-cycle and aim grid, loadout.js aim chips: DIRECTIVES -> aimList(). Wraps autorun.js moveModes, arMode, aimDir; UI.showGameOver; v10.js v10Draw.
- Risk: tests, sims and the School get every option (STEER.force to test the limits). Weapons whose default rule is not on offer fall back to Nearest.

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

