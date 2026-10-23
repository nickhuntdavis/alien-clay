## 2026-10-23 Weapon cells for Nappy Mines and Blowing Bubbles
- Systems: modifiers, weapons, tests, docs
- Files: cellmods.js (new), toys.js, index.html, tests/celltest.js (new), tests/run.sh, redesign docs/MODIFIER_MATRIX.md
- What: Nappy Mines and Blowing Bubbles get their own effect for every modifier the matrix gives them (designed with the user: Breadcrumbs, Ripening, Implosion, Fly paper, Cannonball, sliding Ricochet mines, artillery into carpet bombing, tripwires, suicide vest and runners; Bubble post, Personal space, Big breath, Beach ball, Bubble magnet, gum, Unpoppable, Bubble pinball, Inflating, Bubble pack, Hamster ball, a bubble round you, Bubble machine, Bubble rain, Gift wrap, Iron lung and more). Rapid Fire, Sticky, Ricochet, Connecting, Extra Projectiles and Orbiting are now dealt on Nappy Mines; Switched at Birth deals one of two alternates on each (Acid or Mucus; Acid or Static), and a switched bubble pops in its new type.
- Save data: none.
- Hooks: toys.js bubblePop: the pop's type follows Switched at Birth (one line).
- Risk: balance of both weapons with modifiers (not simmed); other branches that wrap msHit/mwHit/msStats/mwStats etc. by reassignment must load before cellmods.js; card text is TODO_COPY for the 42 cells.
