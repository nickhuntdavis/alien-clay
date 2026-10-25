## 2026-10-25 Mucus Wall and Interferon grant a capped Membrane (enemy handoff B4)
- Systems: enemies
- Files: foeaura10.js (new), index.html, game.js, foes.js, foes2.js, ARCHITECTURE.md, tests/foememtest.js
- What: allies without a defence of their own near a Mucus Wall (115) or Interferon (170) get a 25% Membrane through fight.js's pool, drawn as the enemy bubble; it is removed 1.5 s after the last giver stops refreshing it. Native Membranes, Shell, Thorns and Evasion are left alone, so nothing stacks past the cap. `auraArm` (+4 armour) and Interferon's flat absorb (`ifn`) are gone.
- Save data: none
- Hooks: hookOn('tick') in foeaura10.js; game.js 'aura' case emptied, effArmour and foes.js no longer read auraArm; foes2.js interferon AI and foes2Dmg no longer use ifn.
- Risk: Mucus Wall/Interferon packs now make enemies sturdier by a Membrane instead of 4 armour / flat absorb (balance unsimmed); old `ifn`/`auraArm` writes in newfeats.js are harmless.
