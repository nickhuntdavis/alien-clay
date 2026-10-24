## 2026-10-24 Mines that show their charge; more to aim at; a box every level
- Systems: weapons (mine look), targeting, rewards (level-ups), tests
- Files: cellmods.js (xcMineLook, the Ripening fizzle), aimplus.js (new), game.js (gainXp), index.html, tests/aimplustest.js (new), tests/run.sh
- What: Nappy Mines that are ripening (Charged) fizzle and glow brighter, then flash once when full; empowered mines (Ripening, Loaded nappy, fused, nukes) are drawn bigger and brighter the more empowered they are. With the Advanced Targeting mastery every aim menu leads with MINES (shoot your own mine to set it off), PROJECTILES (shoot down enemy shots), ENEMIES (the nearest enemy, then the usual rules) and ME (your attack lands on you). Every level-up now gives a level-up box (was every level to Lv 8, every second to Lv 24, then every third).
- Save data: none.
- Hooks: game.js gainXp pushes a level request every level (the condition removed).
- Risk: about twice as many level-up boxes after Lv 8, so runs get stronger later (win rate needs a sim); aim stand-ins reach code that expects an enemy (damageEnemy and acquireMany are covered; anything else that reads target.hp sees 1).

## 2026-10-24 Weapon cells for Hot Mess and Eggs
- Systems: modifiers, weapons, tests, docs
- Files: cellmods2.js (new), cellmods.js (per-tag tables; Cannonball share per source), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: Hot Mess and Eggs get their own effect for every modifier the matrix gives them (Claude's picks, 5.7 and 5.8): Spatter, Simmer, Fuel spill, Firestarter, Popcorn, Plughole, Tar pit, Grease fire, Flaming bag, Bonfire, Splash pattern, Shared Burn, Fire walker, Hot to touch, hidden patches, ring of fire, Spreading; Scrambled, Family recipe, Egg toss, Egg on your face, Egg drop, Golden egg, bouncing eggs, Clutch, Hatchling, Nest egg, orbiting eggs, Yolk splash. Switched at Birth deals Acid or Mucus on Hot Mess and Blood or Acid on Eggs. celltest covers all four weapons and no longer fails when the player spawns in cilia.
- Save data: none.
- Hooks: none in shared files.
- Risk: balance of Hot Mess and Eggs with modifiers (not simmed; Eggs' delivery cells deal less than plain Eggs); 34 more TODO_COPY card texts.
