# ccr-1ac49716-yz41yr

## 2026-10-26 Alien damage type renamed Parasite (v10.147)
- Systems: chemistry, damage types, ui (glossary), docs
- Files: 41 web/js files and index.html (text and comments only), glossary.js (the bar regex matches "alien bar" or "parasite bar"), tests (assert messages), tests/tools/guide.js, COMBAT_MATRIX.md, DAMAGE_TYPES.md, redesign docs/CLAUDE.md, CLAUDE.md, STYLE.md, ARCHITECTURE.md
- What: the user renamed the Alien damage type to Parasite (you take enemies over). Every player-facing "Alien" is now "Parasite" ("an Alien" became "a Parasite"; the reaction ALIEN ROT is PARASITE ROT). The internal id stays `soul`, statuses keep their names (Possessed), and the Not of This World sample keeps its name and alien theme.
- Save data: none.
- Hooks: none.
- Risk: text only. Card_Copy_Draft_All.xlsx and GIFT_LINES.md still say Alien (cardvoice.py and giftvoice.py key off the "Not of This World (Alien)" column), as do the other redesign docs; neither puts the word on screen.
