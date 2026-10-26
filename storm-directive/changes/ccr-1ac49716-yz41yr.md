# ccr-1ac49716-yz41yr

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
