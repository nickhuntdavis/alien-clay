# Changes: ccr-f8b59347-xf7dl4

## 2026-10-25 Shared mechanics batch 2: objects hold hits, reach (v10.133)
- Systems: stored hits (new), reach (new), wide modifiers, fight, modifier dead table
- Files: holdhits.js (new), reach.js (new), modwide.js, moddead.js, index.html, ARCHITECTURE.md, tests/holdhitstest.js, tests/reachtest.js, tests/run.sh
- What: COMBAT_MATRIX.md 15.4 and 15.5 in code. Your mines store the newest hit from any of your blasts, shots or pools (damage and type) and deliver it as a second typed hit when they go off, as a relay (noArc, so it never starts a chain or arc); a mine holding a Static hit is Charged and Charge arcs jump through it at full strength. Range and Up Close are offered on every attack type: Range scales reach only (blast, pool and contact radius, mine trigger radius, chain jump range, well radius, orbit radius, pet leash; +20% a rank), Up Close scales damage by distance from you as before. MOD_DEAD no longer hides either.
- Save data: none.
- Hooks: holdhits.js wraps aoe, mwMineGo, detonateMine and replaces fightArc; hookOn('tick', 'hhTick'). reach.js: modwide.js MW_NEW range/upclose atk lists widened and the mine trigger radius line reads reachMul(w); reach.js wraps aoe, ring, modWell, wupTick, wupStats, modChain, modOrbit and p11Range (Up Close on pool ticks). Not reached: pet leash (wup3.js), Nappy Mines trigger (game.js), beam blasts. moddead.js table edited by hand (regenerate after this lands).
- Risk: balance. Relayed hits add damage to every mine build next to a second weapon; Range on Burst and Pool weapons makes blasts and pools bigger with no damage cost. Not simulated beyond bot spot checks.
