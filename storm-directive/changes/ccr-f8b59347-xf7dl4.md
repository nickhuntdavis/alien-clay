# Changes: ccr-f8b59347-xf7dl4

## 2026-10-25 Shared mechanics batch 1: tags, bodies, collisions (v10.130)
- Systems: weapon tags (new), bodies (new), collisions (new), wide modifiers
- Files: wtags.js (new), bodies.js (new), collide.js (new), modwide.js, index.html, tests/wtagstest.js, tests/bodiestest.js, tests/collidetest.js, tests/run.sh
- What: COMBAT_MATRIX.md 15.1 to 15.3 in code. Every weapon carries tags (`wTags(w)`, live with its modifiers). Your mines and pools are bodies: wells pull, hold and fling them (mine half, pool quarter; +50% on a supernova) and knockback blasts scatter them. A knocked enemy moving faster than its base speed deals Force collision damage to itself and whatever it hits (mate or wall; 40% to 100% of the launching hit by speed), trips your mines, and passes on velocity slower than it had. Collide.js owns collisions; modwide's Wall Slam loop stands down when it is loaded (Knockback branch A adds +20/+40% to collision damage, Bowling Ball and Trampoline change the transfer). Laser mines are not bodies yet.
- Save data: none.
- Hooks: modwide.js mwTick Wall Slam loop and delivforms.js Melee Bouncer loop -> one-line skip when `cdOn()`. bodies.js wraps wellTick, aoe, mwMineGo and detonateMine. collide.js registers hookOn('tick', 'cdTick') and hookOn('proc', 'cdProc'); bodies.js hookOn('tick', 'bdTick').
- Risk: balance. Collision damage is new damage on every knockback build (Skill Issue, Panic Button, Knockback modifier); wells now carry mines, so Family Ties next to a mine-layer moves the minefield. Not simulated yet: run `node sim/wave20.js 4 mortal` before trusting the win rate.

## 2026-10-25 Shared mechanics proposal (docs only)
- Systems: docs
- Files: redesign docs/COMBAT_MATRIX.md (section 15, decisions 64 to 68), redesign docs/WEAPON_TAGS.md (new), redesign docs/MODIFIER_MATRIX.md (section 8, Range and Up Close N/A rows)
- What: five game-layer rules proposed so weapons and modifiers combine through shared nouns; 42 modifier cells listed for removal once simulated.
- Save data: none.
- Hooks: none.
- Risk: none (docs).
