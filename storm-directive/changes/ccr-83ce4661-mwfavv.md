## 30 Oct 2026 Planner: build trees, and sample branches in the rack (tool only; planner republished)
- Systems: planner (tool), tests
- Files: tests/tools/planner/template.html; tests/plannertreetest.js (new)
- What: the planner's Branches tab lists the sample's own branches (Rambo, Dirty Harry, Robocop, their run Lv 20 cards and Lv 25 masteries) as chips, and the sperm's prompt names them; before, they were only a button at the foot of the sperm's panel. A Build tree view (beside Full tree): one tree per sample, every node a card that can hold any number of alternatives, each line out to a leaf one run. Cards are added from the rack, by the node's "Add next" buttons, or "Start from everything" (every own weapon and sample branch with its cards and the masteries that suit them, to prune); nodes drag onto another to move. With Game rules on, a card must follow its path (a Lv 6 card after its Lv 3 branch, a mastery after a Lv 6 card, a modifier after a weapon that takes it, one sample branch a run); card rules are checked against each path (a held-back card is dashed red with the reason). "Open this path as a build" puts a path on the dish; Copy tree gives the tree as indented text. Kept in S.trees (with the dish, in your account).
- Save data: none in the game (planner state S.trees).
- Hooks: none (planner only).
- Risk: none for the game.

## 30 Oct 2026 Card rules reach sample branches; the planner can make them (v10.233)
- Systems: card rules, sample branches, baseline branches, planner (tool), tests
- Files: cardrulesengine.js, cardrules.js (regenerated), baseline1.js; tests/tools/planner/template.html; tests/baseline1test.js; CARD_RULES.md, ARCHITECTURE.md
- What: two new rule keys: `sb:<sample>:<A|B|C>` (a sample branch) and `sbc:<sample>:<card>` (its Lv 20 card, wild card or Lv 25 mastery). They resolve, name, inherit (a branch covers its Lv 20 cards), count as held, work as a rule's branch condition, and filter the Lv 15 / 20 / 25 screens (never left empty), with debug notes. Quick draw and Acid bath are gated by Do rules again (g1 `sb:baseline:B`, g2 `sb:baseline:C`) instead of code, so the planner can edit them. The planner gives its sample branch cards keys (Rules button on their panel, branch condition list, "sample branch cards" group) and checks them the same way; its stale "card rules do not reach them" note is gone. Rule names for a sample's own weapon branches (Alpha's) now resolve.
- Save data: none.
- Hooks: none in shared files (cardrulesengine.js adds one more forkCards wrap for req.smb).
- Risk: removing g1 or g2 in the planner and saving would deal Quick draw or Acid bath to any sample.
