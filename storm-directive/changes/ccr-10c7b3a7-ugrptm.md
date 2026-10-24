## 2026-10-24 Weapon cells for Hot Mess and Eggs
- Systems: modifiers, weapons, tests, docs
- Files: cellmods2.js (new), cellmods.js (per-tag tables; Cannonball share per source), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: Hot Mess and Eggs get their own effect for every modifier the matrix gives them (Claude's picks, 5.7 and 5.8): Spatter, Simmer, Fuel spill, Firestarter, Popcorn, Plughole, Tar pit, Grease fire, Flaming bag, Bonfire, Splash pattern, Shared Burn, Fire walker, Hot to touch, hidden patches, ring of fire, Spreading; Scrambled, Family recipe, Egg toss, Egg on your face, Egg drop, Golden egg, bouncing eggs, Clutch, Hatchling, Nest egg, orbiting eggs, Yolk splash. Switched at Birth deals Acid or Mucus on Hot Mess and Blood or Acid on Eggs. celltest covers all four weapons and no longer fails when the player spawns in cilia.
- Save data: none.
- Hooks: none in shared files.
- Risk: balance of Hot Mess and Eggs with modifiers (not simmed; Eggs' delivery cells deal less than plain Eggs); 34 more TODO_COPY card texts.
