# claude/intelligent-fermi-6seyxd

## 2026-10-31 Planner: draft generator (idea to game)
- Systems: tests/tools (planner)
- Files: tests/tools/planner/draft.js (new), tests/tools/planner/fixtures/ideas-sample.json (new), tests/tools/planner/template.html (saved rows carry f), ideas.md (header)
- What: `node tests/tools/planner/draft.js <ideas.json> --sample <id> --out web/js/<file>.js` turns saved planner rows into a draft hook file (weapons, Lv 3/6 branches and wild cards, modifiers, Feats with forks, passives, edits of existing cards as overrides) with `// DRAFT` markers where a human must decide, then verifies it: node --check, headless load with the draft injected, cards present in the game tables. It prints an ideas.md table with Status briefed. Saved rows now carry the typed fields as `f`.
- Save data: none in the game.
- Hooks: none.
- Risk: none in the game until a draft file is added to index.html; effects are stubs.

## 2026-10-31 Planner: sample personality block, dealing readout, idea status badges
- Systems: tests/tools (planner)
- Files: tests/tools/planner/template.html, ideas.md (header)
- What: the sperm node's panel ends with a Personality block (identity, Unique Feat, sample branches, the sample's Do / Don't / Weight rules as chips that open the rules panel, your blocks and edits for the version). A Dealing button next to Simulate opens a panel listing what the sample would be dealt now: weapons by damage type and modifiers by group with their weights (x1, x2.5, blocked, from a new rpWeight mirroring crWeight), Feats and passives as counts, blocked cards with the reason, and a one-line "Leans X and Y" summary. Blocks and edited cards carry a status badge from the ideas database row (Queued, Filed, Built vX; Claude sets status "built" and builtIn when an idea ships). Built from three Sonnet worker branches merged onto claude/sharp-hypatia-icfi8l's planner.
- Save data: none in the game. Planner database rows gain an optional builtIn field.
- Hooks: none.
- Risk: none in the game. The Baseline hero presets were checked and already use the live branch names (the CHANGELOG risk line is stale).
