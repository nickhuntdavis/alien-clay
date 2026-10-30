# claude/sharp-hypatia-icfi8l

## 2026-10-30 Planner: card rules panel (Do, Don't, Weight), simulate, health, save; rules generator
- Systems: tests/tools (planner, rules generator), docs
- Files: tests/tools/planner/template.html, tests/tools/rules/genrules.js (new), CARD_RULES.md, ARCHITECTURE.md, NOTES.md
- What: the planner opens any card in a side panel with Don't, Do and Weight boxes (drag or tap cards and groups in; scope, sample, branch and weight for new rules; a Don't shows on both cards). Simulate greys rack cards the dish's build would stop, with the reason; Health flags contradictions, unreachable Do cards and thin drafts; rules on cards both on the dish draw as dashed links. Save rules to the game writes the artifact database (rules/current) and comments to Claude; genrules.js validates them against the live game and writes web/js/cardrules.js.
- Save data: none in the game.
- Hooks: none.
- Risk: none (the game's rules stay empty until saved and applied).

## 2026-10-30 Card rules engine: Do, Don't and Weight
- Systems: card rules (new), draft, modifier cards, branches back, weapons (slot draft), settings, tests
- Files: web/js/cardrules.js (new, generated data, empty), web/js/cardrulesengine.js (new), web/js/draft.js (one line), web/index.html, CARD_RULES.md, ARCHITECTURE.md, tests/cardrulestest.js (new)
- What: rules from the Loadout Planner decide what can be dealt. Don't is symmetric (two cards never held together), Do is any-one (a card only comes while one of its parents is held), Weight multiplies a card's odds in the random deals. Per-rule scope (this weapon or the whole run) and conditions (a sample, a held branch); a rule on a branch also covers its Lv 6 cards, a rule on a modifier its forks; tags (group, attack type, damage type, kind) as targets. Applies to modifier cards, weapon branch screens, modifier forks, Feat and sperm passive cards and new weapons; branch and fork screens never go empty. Settings > Game > rule debug adds a line to dealt cards naming the rules and what was held back. Ships with no rules, so play is unchanged.
- Save data: SET.ruleDebug added (default off).
- Hooks: draft.js draftCards -> crCardW (weight). Wraps modOk, modDraftCands, wupForkCards, forkCards, cardOk, kinPool, v10Loot, genLoot; loads last.
- Risk: none while CARD_RULES is empty. With rules, too many bans can thin a draft (the planner's health check warns).
