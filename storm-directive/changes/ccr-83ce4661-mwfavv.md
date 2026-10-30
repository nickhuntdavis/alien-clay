## 30 Oct 2026 Card rules reach sample branches; the planner can make them (v10.233)
- Systems: card rules, sample branches, baseline branches, planner (tool), tests
- Files: cardrulesengine.js, cardrules.js (regenerated), baseline1.js; tests/tools/planner/template.html; tests/baseline1test.js; CARD_RULES.md, ARCHITECTURE.md
- What: two new rule keys: `sb:<sample>:<A|B|C>` (a sample branch) and `sbc:<sample>:<card>` (its Lv 20 card, wild card or Lv 25 mastery). They resolve, name, inherit (a branch covers its Lv 20 cards), count as held, work as a rule's branch condition, and filter the Lv 15 / 20 / 25 screens (never left empty), with debug notes. Quick draw and Acid bath are gated by Do rules again (g1 `sb:baseline:B`, g2 `sb:baseline:C`) instead of code, so the planner can edit them. The planner gives its sample branch cards keys (Rules button on their panel, branch condition list, "sample branch cards" group) and checks them the same way; its stale "card rules do not reach them" note is gone. Rule names for a sample's own weapon branches (Alpha's) now resolve.
- Save data: none.
- Hooks: none in shared files (cardrulesengine.js adds one more forkCards wrap for req.smb).
- Risk: removing g1 or g2 in the planner and saving would deal Quick draw or Acid bath to any sample.
