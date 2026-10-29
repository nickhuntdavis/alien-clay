# claude/sharp-hypatia-icfi8l

## 2026-10-29 Baseline part 2: Shotgun
- Systems: baseline branches (new), weapons24, pdef, stamina, mutations, tests
- Files: web/js/baseline2.js (new), web/index.html, tests/baseline2test.js (new), tests/wup1test.js, ARCHITECTURE.md
- What: Maximum Gains is now the Shotgun, with new Lv 3 branches. Sperminator: two Shell layers on you that regrow every 12 s, the first volley on an Elite marks it (+60%, aim stays on it; Lv 6 Improved targeting unlocks FINISHER, Terminated heals 10% and marks the next Elite; wild: pellets that hit the mark ricochet once at 70%; mastery Judgement Day: three layers, the mark explodes on death). Evil Dead: a chainsaw in front of the head (reach 60, 6 Force damage every 0.15 s) beside the fan (Lv 6 Groovy reloads on chainsaw kills, Boomstick is a heavy point-blank volley with double knockback; wild: chainsaw kills rise as allies for 3 s; mastery Hail to the King: reach 100, Bleed, Bleeding enemies burst when hit by pellets). Riding shotgun: damage +1% per 1% of swim speed over base (cap +60%), +30% range while moving, free sprint while firing (Lv 6 Drive-by, Handbrake turn; wild: a sidecar pod fires a weaker fan; mastery Getaway: no Contact damage at full speed, every volley kicks you forward). Shotgun Wedding, More Is More and Get Off Me! are no longer reachable (code stays in wup1.js). A new sperm passive, Come back (dealt only once Sperminator is taken): once a run, at 0 health you become an untouchable husk for 2 s, then return at 50% health with every status cleared, as a robot skeleton. Each branch has a costume (plates and a red eye, a spinning blade, a speed streak and a sidecar pod).
- Save data: none.
- Hooks: hookOn('fire:after'), hookOn('kill'), hookOn('tick'), hookOn('hurt:before') from baseline2.js; wraps pdRefit (pdef.js), stamTick (stamina.js), genesLethal (genes.js), aimList (spsteer.js), drawPlates (bodymods.js); mutCard('pass_comeback'); no shared file edited. tests/wup1test.js loses its Maximum Gains checks (baseline2test.js covers the new branches); fitcheck.js's old Shotgun fit rules are left in place and now inert (FIT_MOD still blocks the Lunge modifier on branch A, which is Sperminator).
- Risk: the Shotgun's balance changes for every sample that drafts it (Sperminator's mark +60% and extra Shell, Riding shotgun's speed scaling, the chainsaw's 40 damage a second at the head). Come back hooks the death check (genesLethal) ahead of the other revives. About 30 TODO_COPY strings show on cards until the user writes them. The Field Guide and guide.js text for Maximum Gains still need regenerating at ship.
## 2026-10-29 Baseline part 3: Hand-to-gland
- Systems: baseline branches (Hand-to-gland), weapons24, tests
- Files: web/js/baseline3.js (new), web/index.html, tests/baseline3test.js (new), tests/wup1test.js (old Nervous Wreck blocks removed), tests/modstest.js (Contact lunge foe now inside reach 70), ARCHITECTURE.md
- What: Nervous Wreck is renamed Hand-to-gland (same slot id `v_phys_contact`; name, HG icon, description `TODO_COPY:hg_desc`) and retuned in a wupStats wrap to reach 70, 14 damage, 2.2 hits a second with no magazine. Its Lv 3 branches are now Kung fu (twice the hit rate at 70% damage, every 5th swing a knockback kick; Lv 6 Combo, Flying kick; wild: a double-hit enemy's next shot is reflected; mastery Thousand fists), Samurai (one triple-damage cut a second in a 160 degree arc, heavy first strike on a fresh enemy; Lv 6 Iaijutsu, Parry; wild: heavy cuts under 30% health; mastery Clean cut) and Biting (Bleed plus 4% lifesteal; Lv 6 Chew toy, Rabies; wild: a bite strips a Shell layer; mastery Jaws). Vice Grip, Shell Game and Back Off! are no longer reachable (code stays in wup1.js). Each branch wears a costume (circling fists, a blade and topknot, a row of teeth). Simplified: the kick counts swings, a reflected shot is cancelled and its damage lands on the shooter, Jaws heals 10% of max health. 31 TODO_COPY strings show on cards until the user writes them.
- Save data: none.
- Hooks: wupReg / wupOn from baseline3.js; hookOn('fire:after'); wraps wupStats (weapons24.js) and drawPlates (bodymods.js). No shared file edited.
- Risk: Hand-to-gland's base is weaker per swing (14 against 27) but faster and magazine-free; every sample that drafts Nervous Wreck (beta's starter, v9_vanguard, v9_stealth) shifts. Modifiers and fusions keyed on `v_phys_contact` (fusions nervepanic and reel, Ranged, area) keep working on the new numbers.

## 2026-10-29 Baseline reimagined, part 1: Standard Issue's movie-cop branches (v10.221)
- Systems: baseline branches (new), weapons24, feats, aim, render, tests/tools
- Files: web/js/baseline1.js (new), web/index.html, web/js/fitcheck.js, tests/baseline1test.js (new), tests/wup1test.js, tests/fittest.js, tests/sivtest.js, tests/featstest.js, ARCHITECTURE.md, ideas.md, NOTES.md
- What: Standard Issue's Lv 3 branches are now Rambo (magazine 20, reload 0.7 s, 25% faster, 15% weaker; every weapon 10% faster while held; Lv 6 Faster and faster, First blood; wild Hot barrel; mastery Belt-fed), Dirty Harry (magazine 6, half the fire rate, x2.2, range +120, no spread, +10 crit on itself and every weapon; Lv 6 Lucky shot, Six shooter; wild; mastery Make my day) and Robocop (a mark every 6 s on the nearest Elite, tap-to-mark on the slide, shots stay on it at +50%, every 4th shot a Force rocket; Lv 6 Improved targeting unlocks the FINISHER directive, Prime Directive; wild Target rich; mastery Dead or Alive). Ricochet Brain, Through and Through and Marked for Bonking are no longer reachable (code stays in wup1.js). Two gated Feats: Quick draw (dealt only on Dirty Harry: shoots an enemy winding up a shot first, double crit) and Acid bath (Robocop only: sprays the most-Shelled enemy, 60% Corrosion, an Acid pool). Costumes: headband ribbons, a visor band, a chrome head with a sweeping red visor; a crosshair on the mark. Branch screens for Standard Issue use the plain layout (SIV_DRAFT off: sidemo.js scenes belong to the old cards).
- Save data: none.
- Hooks: hookOn('fire:after'), hookOn('tick'), hookOn('dmgMul') from baseline1.js; wraps computeStats (game.js), aimList (autorun.js/spsteer.js), targetScore (game.js), drawPlates (bodymods.js); DIRECTIVES.push('finisher'); fitcheck.js's two Standard Issue rules retired.
- Risk: Standard Issue's balance changes for every sample that drafts it (Dirty Harry is a big single-target jump; Rambo's 10% fire rate is sperm-wide). SIV_DRAFT off changes how Standard Issue's branch screens look (plain cards). About 30 TODO_COPY strings show on cards until the user writes them.

## 2026-10-29 ideas.md second batch (folded from the planner database); planner double-save guard
- Systems: docs, tests/tools
- Files: ideas.md, tests/tools/planner/template.html
- What: 19 ideas saved from the planner (Standard Issue branches Rambo / Dirty harry / Robocop with follow-ons, Maximum Gains renamed Shotgun with Sperminator / Evild Dead / Riding shotgun, Hand-to-gland with Kung fu / Samurai / Biting) folded into ideas.md and marked filed in the artifact database. The planner refuses a second Save while one is still writing (the first save ran twice and wrote 38 rows for 19 ideas).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-29 Planner: Feats, sperm passives and branch gates
- Systems: tests/tools
- Files: tests/tools/planner/planner.js, tests/tools/planner/template.html
- What: a Feats & more tab lists the 52 Feats (feats10.js F10, Unique Feats per sample, Lv 3 and Lv 5 forks) and the 29 sperm passives still dealt (mutations.js MUT_REG minus SP.cut, with spmast.js masteries). They drop on the sperm (3 Feat slots plus the sample's Unique; 5 passive slots). Gating: a Feat, modifier or passive dropped on a branch (Lv 3/6/9 branch, fork, mastery, Feat fork, passive mastery) becomes a gate node, only available once that branch is taken; gates drag between branches, export as a Gates list (Copy ideas, Copy build) and save to ideas.md as type Gate.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-29 Planner: rules off lets anything hang off anything
- Systems: tests/tools
- Files: tests/tools/planner/template.html
- What: with Game rules off, a chip or moved modifier the game would refuse lands as a card block (name, text, type filled in) under whatever it was dropped on, blocks included; unedited card blocks export as `[CARD]` and are not counted as ideas. Fixed: blocks older than their parent (after a move) were dropped at render; the capability probe ran before its helpers.
- Save data: none.
- Hooks: none.
- Risk: none.

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
