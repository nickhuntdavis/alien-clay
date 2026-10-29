# claude/sharp-hypatia-icfi8l

## 2026-10-29 Planner: Save to ideas.md, idea types, moving blocks
- Systems: tests/tools, docs
- Files: tests/tools/planner/template.html, ideas.md, NOTES.md
- What: each block or edit has a Type (Weapon, Lv 3 branch, Modifier fork and so on; required before saving); Save to ideas.md (toolbar: all unsaved; panel: one block) writes rows to the artifact database (collection `ideas`, status `queued`) and sends Claude a comment to fold them into ideas.md. Blank blocks and modifiers can be dragged from one node to another on the map (modifiers keep rank, fork and mastery, and obey the fit and group rules; branches stay with their weapon). The artifact is published with the `db` and `comments` capabilities.
- Save data: none in the game.
- Hooks: none.
- Risk: none.

## 2026-10-29 ideas.md: loadout ideas from the planner
- Systems: docs only
- Files: ideas.md (new), ARCHITECTURE.md
- What: a kept list of the ideas pasted from the Loadout Planner's Copy ideas (dated batches, status per row). First batch: 9 ideas (Standard Issue and Maximum Gains upgrades, a Melee weapon with three follow-ons).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-29 Planner: edit cards as a copy, or overwrite on request
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/template.html
- What: every card node on the map has Edit as a copy (a blank block beside it, prefilled with its name and text, tagged Variant of X; the original is untouched) and Overwrite the original (rewrites the node in place, keeping its slot, rank and branches; Revert restores it). Both appear in Copy build (`[EDITED, was X]`, `variant of X`) and Copy ideas (with the original text).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-29 Planner: blank idea blocks
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/template.html
- What: a dashed Blank block chip drops on any node (sperm, weapon, modifier, fork, branch, or another blank) and is typed into on the map (tag, name, text); blocks are kept with the build, hang off their parent, and go when it goes. Copy build walks the whole tree (blanks included); Copy ideas lists only the blanks with their place in the tree, for turning into real content later.
- Save data: none (localStorage of the artifact page only).
- Hooks: none.
- Risk: none.

## 2026-10-29 Loadout Planner artifact (tool only, no game change)
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/planner.js (new), tests/tools/planner/template.html (new), ARCHITECTURE.md
- What: `node tests/tools/planner/planner.js` extracts the live roster (matrixonly.js weapons and modifiers plus Area, Lifesteal and the built-in Delivery modifiers; what fits what via modOk on a fresh slot; groups from modmatrix.js; forks and masteries from MSB and slicecopy.js; WUP branch trees; samples) and writes tests/out/loadout-planner.html: a drag-and-drop mind map (sperm > up to 4 weapons > modifiers and Lv 3/6/9 branches > forks > masteries) published at https://claude.ai/artifact/6nudTiGo14jVZ8TjaprBk3.
- Save data: none.
- Hooks: none.
- Risk: none (nothing in web/ changed).
