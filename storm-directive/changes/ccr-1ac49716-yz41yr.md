# ccr-1ac49716-yz41yr

## 2026-10-26 Unwanted Contact zip-zap (not shipped yet)
- Systems: weapons (Unwanted Contact), modifier cards, tests
- Files: zapper.js (new), index.html, moddead.js (s_tesla row), tests/zappertest.js (new), BASE_WEAPONS.md, ARCHITECTURE.md
- What: Unwanted Contact fires one quick spark at one target instead of a 3-jump chain. Ricochet forks it (1/2/3, mastery forks again), Piercing runs a line (1/3/6/12), Homing goes for enemies not yet Charged, Area splashes, Charged Charges in one hit (mastery zaps Charged enemies within 200), Rapid Fire mastery adds a spark. Jumps from Chain Letter or promise cards still chain. Ricochet, Piercing, Homing and Area are offered on it again.
- Save data: none.
- Hooks: none in shared files (wraps v10Fire after laserbeam.js).
- Risk: much less crowd damage at base for Redtail (sims running); Static's own arcs off Charged enemies are unchanged.

## 2026-10-26 Static looks grow with weapon level (v10.149)
- Systems: type looks (typelook)
- Files: typelook.js
- What: Static visuals start as a faint pale crackle at weapon Lv 1 (thin beam, short rare arcs, no glow or forks) and only become full forked lightning near the Lv 9 cap. The level comes from the firing weapon where known (shots, pools, the twin), else your highest-level Static weapon; Static from no weapon of yours (Feats, reactions with no Static weapon held) stays full. Chain bolts in the Static colour flatten, lose forks and fade sooner while weak.
- Save data: none.
- Hooks: typelook.js wraps game.js bolt (Static-coloured bolts only).
- Risk: reaction arcs (Static colour) also look quieter while your Static weapon is low level.

## 2026-10-26 Brave Phase and Puddle Jumper Feats (v10.148)
- Systems: Feats (v10), tests
- Files: mobfeats.js (new), index.html, tests/mobfeatstest.js (new), tests/featstest.js, FEATS.md (F16, F17), ARCHITECTURE.md
- What: two new mobility Feats in the starting pool. Brave Phase: a see-through, untouchable Force dash at 2.6x speed for 0.6 s that hits each enemy you pass through once; autorun aims it down the busiest line, manual steering bends it, walls stop it. Puddle Jumper: a Mucus tap teleport (300) behind the biggest enemy with a backstab when you carry a close-range weapon, else to the safest spot; you leave a Mucus splash and puddle. Card text is TODO_COPY.
- Save data: none.
- Hooks: none in shared files (hookOn tick 'mobTick'; wraps newfeats.js nfSpeed and feats10.js f10Draw).
- Risk: the Feat starting pool grows from 18 to 20, so other Feats are offered a little less often. Brave Phase moves you directly (like f10Lunge), so it ignores swim physics for 0.6 s.

## 2026-10-26 Alien damage type renamed Parasite (v10.147)
- Systems: chemistry, damage types, ui (glossary), docs
- Files: 41 web/js files and index.html (text and comments only), glossary.js (the bar regex matches "alien bar" or "parasite bar"), tests (assert messages), tests/tools/guide.js, COMBAT_MATRIX.md, DAMAGE_TYPES.md, redesign docs/CLAUDE.md, CLAUDE.md, STYLE.md, ARCHITECTURE.md
- What: the user renamed the Alien damage type to Parasite (you take enemies over). Every player-facing "Alien" is now "Parasite" ("an Alien" became "a Parasite"; the reaction ALIEN ROT is PARASITE ROT). The internal id stays `soul`, statuses keep their names (Possessed), and the Not of This World sample keeps its name and alien theme.
- Save data: none.
- Hooks: none.
- Risk: text only. Card_Copy_Draft_All.xlsx and GIFT_LINES.md still say Alien (cardvoice.py and giftvoice.py key off the "Not of This World (Alien)" column), as do the other redesign docs; neither puts the word on screen.
