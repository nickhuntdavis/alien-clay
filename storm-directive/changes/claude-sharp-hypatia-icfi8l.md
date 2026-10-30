# claude/sharp-hypatia-icfi8l

## 2026-10-30 Planner loads the game's current rules; Baseline gates become rules
- Systems: card rules, baseline branches, tests/tools (planner)
- Files: web/js/cardrules.js, web/js/baseline1.js, web/js/baseline2.js, tests/tools/planner/planner.js, tests/tools/planner/template.html, tests/baseline1test.js, tests/baseline2test.js, tests/cardrulestest.js, CARD_RULES.md
- What: the three Baseline gates (Quick draw needs Dirty Harry, Acid bath needs Robocop, Come back needs Sperminator) moved from hard-coded eligibility into cardrules.js as Do rules, so they are editable. The planner loads the rule file's rules as editable defaults (marked "in game"; a removed default stays removed, with a Restore button) and the game's built-in tables (matrix N/A, Delivery weapons' denied modifiers, the modifier audit by Delivery form: 548 entries) as locked rules on each weapon's and modifier's panel, in Simulate and in Health. Play is unchanged.
- Save data: none.
- Hooks: none.
- Risk: none (the gates behave as before, now through the rule engine; the built-in tables stay where they are).
