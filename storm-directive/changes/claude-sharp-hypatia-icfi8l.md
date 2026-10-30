# claude/sharp-hypatia-icfi8l

## 2026-10-30 Planner: your dish kept in your account
- Systems: tests/tools (planner)
- Files: tests/tools/planner/template.html
- What: the whole planner state (dish, blocks, edits, rules, settings) saves to the user's private space in the artifact database (data/users/<id>: planner_dish and planner_rules) a second after each change; on open the newer copy wins, so another device or a cleared cache picks up where you left off. A toolbar status says "Saved to your account" or "This device only" (signed out). Load-time housekeeping saves keep the old timestamp so they never overwrite a newer copy. The artifact now declares the user capability (to know whose space).
- Save data: none in the game.
- Hooks: none.
- Risk: none.

## 2026-10-30 Planner: Builds menu and first-open preload
- Systems: tests/tools (planner)
- Files: tests/tools/planner/planner.js, tests/tools/planner/template.html
- What: a Builds menu loads your saved ideas rebuilt onto the dish (from the artifact database: each row's path puts its weapon on the dish and its blocks under it), each sample's start (two best-fit weapons and its Unique Feat) or a Baseline hero build (the weapon on that branch with the cards its branch unlocks). The first open preloads your saved ideas, else Baseline's start. Replacing a dish that has something on it takes a second tap.
- Save data: none in the game.
- Hooks: none.
- Risk: none.

## 2026-10-30 The game's dealing tables become editable card rules
- Systems: card rules, modifier cards (moddead, matrixna), Delivery weapons (dlvrun), tests/tools (planner, rules), tests
- Files: web/js/cardrules.js (551 rules, CARD_RULES_OWNS), web/js/cardrulesengine.js, web/js/moddead.js, web/js/matrixna.js, web/js/dlvrun.js (one guard line each), tests/tools/rules/importtables.js (new), tests/tools/rules/rulesfile.js (new), tests/tools/rules/genrules.js, tests/tools/moddead.js (comment), tests/tools/planner/planner.js, tests/tools/planner/template.html, tests/cardrulestest.js, tests/modstest.js, tests/sim/modaudit.js, CARD_RULES.md
- What: MOD_DEAD (530), MATRIX_NA (12) and DLV.deny (6) are rules in cardrules.js, so the planner edits them; the three files stand down as dealing filters when CARD_RULES_OWNS says so. The engine gained `form`, `with` and `unless` conditions, a rule index (551 rules), and treats rank-ups as deals (as the tables did). Dealing is proven identical in 238 weapon and Delivery states.
- Save data: none.
- Hooks: moddead.js, matrixna.js and dlvrun.js each read CARD_RULES_OWNS in their existing modOk check (one line).
- Risk: a session that adds rows to MOD_DEAD, MATRIX_NA or DLV.deny must rerun tests/tools/rules/importtables.js, or the new rows do nothing as filters. passivefeat.js still reads MOD_DEAD directly.

## 2026-10-30 Planner loads the game's current rules; Baseline gates become rules
- Systems: card rules, baseline branches, tests/tools (planner)
- Files: web/js/cardrules.js, web/js/baseline1.js, web/js/baseline2.js, tests/tools/planner/planner.js, tests/tools/planner/template.html, tests/baseline1test.js, tests/baseline2test.js, tests/cardrulestest.js, CARD_RULES.md
- What: the three Baseline gates (Quick draw needs Dirty Harry, Acid bath needs Robocop, Come back needs Sperminator) moved from hard-coded eligibility into cardrules.js as Do rules, so they are editable. The planner loads the rule file's rules as editable defaults (marked "in game"; a removed default stays removed, with a Restore button) and the game's built-in tables (matrix N/A, Delivery weapons' denied modifiers, the modifier audit by Delivery form: 548 entries) as locked rules on each weapon's and modifier's panel, in Simulate and in Health. Play is unchanged.
- Save data: none.
- Hooks: none.
- Risk: none (the gates behave as before, now through the rule engine; the built-in tables stay where they are).
