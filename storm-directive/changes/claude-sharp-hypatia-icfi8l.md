# claude/sharp-hypatia-icfi8l

## 2026-10-30 Card rules engine: Do, Don't and Weight
- Systems: card rules (new), draft, modifier cards, branches back, weapons (slot draft), settings, tests
- Files: web/js/cardrules.js (new, generated data, empty), web/js/cardrulesengine.js (new), web/js/draft.js (one line), web/index.html, CARD_RULES.md, ARCHITECTURE.md, tests/cardrulestest.js (new)
- What: rules from the Loadout Planner decide what can be dealt. Don't is symmetric (two cards never held together), Do is any-one (a card only comes while one of its parents is held), Weight multiplies a card's odds in the random deals. Per-rule scope (this weapon or the whole run) and conditions (a sample, a held branch); a rule on a branch also covers its Lv 6 cards, a rule on a modifier its forks; tags (group, attack type, damage type, kind) as targets. Applies to modifier cards, weapon branch screens, modifier forks, Feat and sperm passive cards and new weapons; branch and fork screens never go empty. Settings > Game > rule debug adds a line to dealt cards naming the rules and what was held back. Ships with no rules, so play is unchanged.
- Save data: SET.ruleDebug added (default off).
- Hooks: draft.js draftCards -> crCardW (weight). Wraps modOk, modDraftCands, wupForkCards, forkCards, cardOk, kinPool, v10Loot, genLoot; loads last.
- Risk: none while CARD_RULES is empty. With rules, too many bans can thin a draft (the planner's health check warns).
