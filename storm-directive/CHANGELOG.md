# CHANGELOG.md: Spawn Prawn

Newest first. Sessions don't edit this file: they log in `changes/<branch>.md`, and those fragments are folded in here when a branch merges into `main` (rules: `CLAUDE.md` > Change log). System names come from `ARCHITECTURE.md`. History before v9.23 lives in `NOTES.md` > Recent changes and `git log`.

## v10.231 (versionCode 510): 2026-10-30 Every open placeholder written; modifier masteries state their numbers (`ccr-83ce4661-mwfavv`)
### 30 Oct 2026 Every open placeholder written (v10.231)
- Systems: weapons (Obligatory Podcast), card rules, progress (Mode Select), Delivery modifiers, modifier masteries
- Files: podcast.js, cardrulesengine.js, progress.js, delivforms.js, slicecopy.js
- What: a scan of the running game (static data, the generated card families against their copy tables, and the Mode Select, Settings and Field Guide screens) found five lines still showing TODO_COPY: the Obligatory Podcast's description, the card rule debug setting's label and hint, the Race's RACE MODE tag, and Area on a Ranged-delivery weapon. All written. The 20 branchless modifier masteries (Homing, Piercing and the rest) said "pushes its effect one step further" for every modifier; each now states its rank 4 numbers (modifiers.js modV: one more step of the same size).
- Save data: none.
- Hooks: none.
- Risk: none for play. The remaining TODO_COPY strings in the code are keys that copy tables fill at load (slicecopy, holdcopy, cellcopy, kinall, atklock, delivforms, acrocopy); none reaches the screen.

## v10.230 (versionCode 509): 2026-10-30 Sample branch copy written; Claude writes all player-facing copy from now on (`ccr-83ce4661-mwfavv`)
### 30 Oct 2026 Sample branch copy written; Claude now writes all copy (v10.230)
- Systems: sample branches, baseline branches, docs
- Files: samplebranch.js, baseline1.js; CLAUDE.md, voice_and_tone.md
- What: the five open sample branch lines are written (Rambo's and Dirty Harry's branch cards, and the Lv 15, 20 and 25 screen subtitles), so the sample branch screens show no TODO_COPY. CLAUDE.md's copy rule is reversed by the user's decision: Claude writes all player-facing text in the voice guide's register, ships no placeholders, and lists every new line in the reply for the user to read.
- Save data: none.
- Hooks: none.
- Risk: none for play. Other sessions keep the old placeholder rule until this CLAUDE.md reaches main.

## v10.229 (versionCode 508): 2026-10-30 Sample branches (Baseline: Rambo, Dirty Harry, Robocop at Lv 15), Standard Issue's own branches back, all nine hero costumes redrawn and visible (`ccr-83ce4661-mwfavv`)
### 30 Oct 2026 Shotgun and Hand-to-gland costumes redrawn in the high-detail style (v10.228)
- Systems: baseline costumes, baseline branches (Shotgun, Hand-to-gland), tests
- Files: baselinelook.js, baseline2.js, baseline3.js; tests baselinelooktest.js, baseline3test.js, wpnshot.js (new)
- What: the six weapon branch costumes are shaded like the sample bodies and drawn in the head's frame, fitted to whichever sample wears them: Sperminator's torn-open chrome endoskeleton with a red eye (a dry husk for Come back's 2 s, then the whole chrome skull, both eyes and metal vertebrae), Evil Dead's chainsaw (the chain runs, the motor smokes and the tip throws blood while it cuts; a longer bar with Hail to the King), Riding shotgun's goggles on a leather strap with wind at speed, Kung fu's black belt and taped fists (a strike on a kick), Samurai's topknot and sheathed katana (drawn and swept on a cut; the old drawing read a field that was never set, so the cut never showed), Biting's gums and teeth (gape and snap on a bite, blood after). The old flat versions under the body in baseline2.js and baseline3.js are gone (the mark crosshair and the sidecar pod stay).
- Save data: none.
- Hooks: none new. baseline3.js no longer wraps drawPlates; baseline2.js's drawPlates wrap draws only the crosshair and the pod.
- Risk: none for play (drawing only). The Sperminator's Shell layers still draw as brown bands under its costume.

### 30 Oct 2026 Sample branches: Rambo, Dirty Harry and Robocop move from Standard Issue to the Baseline sample; costumes redrawn and finally visible (v10.227)
- Systems: sample branches (new), baseline branches, baseline costumes, weapons24 (branch hooks), draft, fit rules, tests
- Files: samplebranch.js (new), baseline1.js, baselinelook.js, fitcheck.js, index.html; tests baseline1test.js, baselinelooktest.js, smbshot.js (new), wup1test.js, sivtest.js, fittest.js, combo10test.js
- What: a sample now has its own branch tree: at run Lv 15 the Baseline sample picks Rambo, Dirty Harry or Robocop (a live picture of each costume on its card), at Lv 20 that branch's card or wildcard, at Lv 25 a mastery; every effect acts on every weapon held, not one gun. Standard Issue has its old branches back (Ricochet Brain, Through and Through, Marked for Bonking). The hero costumes were drawn on the slide under youhd.js's sharp body canvas, so the body hid them (v10.226's 1.5x only let the edges poke out): the three sample costumes are now drawn in the head's own frame on that canvas, at the head's size, shaded like the sample bodies; the six weapon costumes draw in the same pass at 1x and give way while a sample costume is worn.
- Save data: none (run state G.smb).
- Hooks: none in shared files. samplebranch.js hookOn('tick'), wraps forkCards, draftTitle, UI.renderLootCards, UI.openLoot. baseline1.js now wraps weapons24.js wupDmgMul, wupHit, wupKill and adds hookOn('fire', 'baseline1:mark', 45). baselinelook.js wraps samplelooks.js SL_HEAD.baseline, sets SL_UNDER.baseline, wraps seqsel.js drawSeqMods (was drawPlates).
- Risk: balance (Rambo and Dirty Harry now change every weapon, not one; Belt-Fed now works on any branch, it did nothing off Rambo before); TODO_COPY: smb_rambo_desc, smb_harry_desc, smb_sub_branch, smb_sub_card, smb_sub_mastery. Tests and sims never see the screens (TUT_OFF) unless SMB.force.

## v10.227 (versionCode 506): 2026-10-30 Card rules: Do, Don't and Weight between cards, edited in the Loadout Planner (`claude/sharp-hypatia-icfi8l`)
### 2026-10-30 Planner: card rules panel (Do, Don't, Weight), simulate, health, save; rules generator
- Systems: tests/tools (planner, rules generator), docs
- Files: tests/tools/planner/template.html, tests/tools/rules/genrules.js (new), CARD_RULES.md, ARCHITECTURE.md, NOTES.md
- What: the planner opens any card in a side panel with Don't, Do and Weight boxes (drag or tap cards and groups in; scope, sample, branch and weight for new rules; a Don't shows on both cards). Simulate greys rack cards the dish's build would stop, with the reason; Health flags contradictions, unreachable Do cards and thin drafts; rules on cards both on the dish draw as dashed links. Save rules to the game writes the artifact database (rules/current) and comments to Claude; genrules.js validates them against the live game and writes web/js/cardrules.js.
- Save data: none in the game.
- Hooks: none.
- Risk: none (the game's rules stay empty until saved and applied).

### 2026-10-30 Card rules engine: Do, Don't and Weight
- Systems: card rules (new), draft, modifier cards, branches back, weapons (slot draft), settings, tests
- Files: web/js/cardrules.js (new, generated data, empty), web/js/cardrulesengine.js (new), web/js/draft.js (one line), web/index.html, CARD_RULES.md, ARCHITECTURE.md, tests/cardrulestest.js (new)
- What: rules from the Loadout Planner decide what can be dealt. Don't is symmetric (two cards never held together), Do is any-one (a card only comes while one of its parents is held), Weight multiplies a card's odds in the random deals. Per-rule scope (this weapon or the whole run) and conditions (a sample, a held branch); a rule on a branch also covers its Lv 6 cards, a rule on a modifier its forks; tags (group, attack type, damage type, kind) as targets. Applies to modifier cards, weapon branch screens, modifier forks, Feat and sperm passive cards and new weapons; branch and fork screens never go empty. Settings > Game > rule debug adds a line to dealt cards naming the rules and what was held back. Ships with no rules, so play is unchanged.
- Save data: SET.ruleDebug added (default off).
- Hooks: draft.js draftCards -> crCardW (weight). Wraps modOk, modDraftCands, wupForkCards, forkCards, cardOk, kinPool, v10Loot, genLoot; loads last.
- Risk: none while CARD_RULES is empty. With rules, too many bans can thin a draft (the planner's health check warns).

## v10.226 (versionCode 505): 2026-10-29 Baseline hero costumes you can see (`claude/sharp-hypatia-icfi8l`)
- Systems: baseline costumes (new), sidemo, fbdemo, render, tests
- Files: web/js/baselinelook.js (new), web/index.html, ARCHITECTURE.md, tests/baselinelooktest.js (new)
- What: the nine Baseline hero costumes (Rambo, Dirty Harry, Robocop, Sperminator, Evil Dead, Riding shotgun, Kung fu, Samurai, Biting) are drawn by one shared drawer at about twice the body's size, with a pale halo under a dark outline so they read in Lab view. In the run the costume follows the hero weapon fired last, and reacts: Rambo's ribbons whip as the magazine empties, Dirty Harry's revolver flashes, Robocop's scanner speeds up while a mark is live, Riding shotgun's speed lines stretch with swim speed, the chainsaw runs faster, fists jab and blades cut on a hit. The Lv 3, 6 and 9 branch screens for Standard Issue, Shotgun and Hand-to-gland now show the costume on the stage sperm (they previously showed an unrelated scene), clear of the stage's arrow buttons.
- Save data: none.
- Hooks: wraps drawPlates (bodymods.js), edits SIV_FLAG, MGV_FLAG, NWV_FLAG in place and wraps the `me` and `step` of PV_OWN for v_phys_proj, v_phys_spread and v_phys_contact. No shared file edited.
- Risk: the older small costumes in baseline1.js to baseline3.js are still drawn underneath. The stage previews still fire their old generic shots, not each hero's own behaviour.

## v10.225 (versionCode 504): 2026-10-29 Baseline reimagined: Standard Issue, Shotgun and Hand-to-gland get movie-hero branches, gated Feats, Come back, costumes and copy; Loadout Planner tool and ideas.md (`claude/sharp-hypatia-icfi8l`; v10.221 on the branch)
### 2026-10-29 Baseline part 2: Shotgun (v10.225)
- Systems: baseline branches (new), weapons24, pdef, stamina, mutations, tests
- Files: web/js/baseline2.js (new), web/index.html, tests/baseline2test.js (new), tests/wup1test.js, ARCHITECTURE.md
- What: Maximum Gains is now the Shotgun, with new Lv 3 branches. Sperminator: two Shell layers on you that regrow every 12 s, the first volley on an Elite marks it (+60%, aim stays on it; Lv 6 Improved targeting unlocks FINISHER, Terminated heals 10% and marks the next Elite; wild: pellets that hit the mark ricochet once at 70%; mastery Judgement Day: three layers, the mark explodes on death). Evil Dead: a chainsaw in front of the head (reach 60, 6 Force damage every 0.15 s) beside the fan (Lv 6 Groovy reloads on chainsaw kills, Boomstick is a heavy point-blank volley with double knockback; wild: chainsaw kills rise as allies for 3 s; mastery Hail to the King: reach 100, Bleed, Bleeding enemies burst when hit by pellets). Riding shotgun: damage +1% per 1% of swim speed over base (cap +60%), +30% range while moving, free sprint while firing (Lv 6 Drive-by, Handbrake turn; wild: a sidecar pod fires a weaker fan; mastery Getaway: no Contact damage at full speed, every volley kicks you forward). Shotgun Wedding, More Is More and Get Off Me! are no longer reachable (code stays in wup1.js). A new sperm passive, Come back (dealt only once Sperminator is taken): once a run, at 0 health you become an untouchable husk for 2 s, then return at 50% health with every status cleared, as a robot skeleton. Each branch has a costume (plates and a red eye, a spinning blade, a speed streak and a sidecar pod).
- Save data: none.
- Hooks: hookOn('fire:after'), hookOn('kill'), hookOn('tick'), hookOn('hurt:before') from baseline2.js; wraps pdRefit (pdef.js), stamTick (stamina.js), genesLethal (genes.js), aimList (spsteer.js), drawPlates (bodymods.js); mutCard('pass_comeback'); no shared file edited. tests/wup1test.js loses its Maximum Gains checks (baseline2test.js covers the new branches); fitcheck.js's old Shotgun fit rules are left in place and now inert (FIT_MOD still blocks the Lunge modifier on branch A, which is Sperminator).
- Risk: the Shotgun's balance changes for every sample that drafts it (Sperminator's mark +60% and extra Shell, Riding shotgun's speed scaling, the chainsaw's 40 damage a second at the head). Come back hooks the death check (genesLethal) ahead of the other revives. About 30 TODO_COPY strings show on cards until the user writes them. The Field Guide and guide.js text for Maximum Gains still need regenerating at ship.
### 2026-10-29 Baseline part 3: Hand-to-gland (v10.225)
- Systems: baseline branches (Hand-to-gland), weapons24, tests
- Files: web/js/baseline3.js (new), web/index.html, tests/baseline3test.js (new), tests/wup1test.js (old Nervous Wreck blocks removed), tests/modstest.js (Contact lunge foe now inside reach 70), ARCHITECTURE.md
- What: Nervous Wreck is renamed Hand-to-gland (same slot id `v_phys_contact`; name, HG icon, description `TODO_COPY:hg_desc`) and retuned in a wupStats wrap to reach 70, 14 damage, 2.2 hits a second with no magazine. Its Lv 3 branches are now Kung fu (twice the hit rate at 70% damage, every 5th swing a knockback kick; Lv 6 Combo, Flying kick; wild: a double-hit enemy's next shot is reflected; mastery Thousand fists), Samurai (one triple-damage cut a second in a 160 degree arc, heavy first strike on a fresh enemy; Lv 6 Iaijutsu, Parry; wild: heavy cuts under 30% health; mastery Clean cut) and Biting (Bleed plus 4% lifesteal; Lv 6 Chew toy, Rabies; wild: a bite strips a Shell layer; mastery Jaws). Vice Grip, Shell Game and Back Off! are no longer reachable (code stays in wup1.js). Each branch wears a costume (circling fists, a blade and topknot, a row of teeth). Simplified: the kick counts swings, a reflected shot is cancelled and its damage lands on the shooter, Jaws heals 10% of max health. 31 TODO_COPY strings show on cards until the user writes them.
- Save data: none.
- Hooks: wupReg / wupOn from baseline3.js; hookOn('fire:after'); wraps wupStats (weapons24.js) and drawPlates (bodymods.js). No shared file edited.
- Risk: Hand-to-gland's base is weaker per swing (14 against 27) but faster and magazine-free; every sample that drafts Nervous Wreck (beta's starter, v9_vanguard, v9_stealth) shifts. Modifiers and fusions keyed on `v_phys_contact` (fusions nervepanic and reel, Ranged, area) keep working on the new numbers.

### 2026-10-29 Baseline reimagined, part 1: Standard Issue's movie-cop branches (v10.221)
- Systems: baseline branches (new), weapons24, feats, aim, render, tests/tools
- Files: web/js/baseline1.js (new), web/index.html, web/js/fitcheck.js, tests/baseline1test.js (new), tests/wup1test.js, tests/fittest.js, tests/sivtest.js, tests/featstest.js, ARCHITECTURE.md, ideas.md, NOTES.md
- What: Standard Issue's Lv 3 branches are now Rambo (magazine 20, reload 0.7 s, 25% faster, 15% weaker; every weapon 10% faster while held; Lv 6 Faster and faster, First blood; wild Hot barrel; mastery Belt-fed), Dirty Harry (magazine 6, half the fire rate, x2.2, range +120, no spread, +10 crit on itself and every weapon; Lv 6 Lucky shot, Six shooter; wild; mastery Make my day) and Robocop (a mark every 6 s on the nearest Elite, tap-to-mark on the slide, shots stay on it at +50%, every 4th shot a Force rocket; Lv 6 Improved targeting unlocks the FINISHER directive, Prime Directive; wild Target rich; mastery Dead or Alive). Ricochet Brain, Through and Through and Marked for Bonking are no longer reachable (code stays in wup1.js). Two gated Feats: Quick draw (dealt only on Dirty Harry: shoots an enemy winding up a shot first, double crit) and Acid bath (Robocop only: sprays the most-Shelled enemy, 60% Corrosion, an Acid pool). Costumes: headband ribbons, a visor band, a chrome head with a sweeping red visor; a crosshair on the mark. Branch screens for Standard Issue use the plain layout (SIV_DRAFT off: sidemo.js scenes belong to the old cards).
- Save data: none.
- Hooks: hookOn('fire:after'), hookOn('tick'), hookOn('dmgMul') from baseline1.js; wraps computeStats (game.js), aimList (autorun.js/spsteer.js), targetScore (game.js), drawPlates (bodymods.js); DIRECTIVES.push('finisher'); fitcheck.js's two Standard Issue rules retired.
- Risk: Standard Issue's balance changes for every sample that drafts it (Dirty Harry is a big single-target jump; Rambo's 10% fire rate is sperm-wide). SIV_DRAFT off changes how Standard Issue's branch screens look (plain cards). About 30 TODO_COPY strings show on cards until the user writes them.

### 2026-10-29 ideas.md second batch (folded from the planner database); planner double-save guard
- Systems: docs, tests/tools
- Files: ideas.md, tests/tools/planner/template.html
- What: 19 ideas saved from the planner (Standard Issue branches Rambo / Dirty harry / Robocop with follow-ons, Maximum Gains renamed Shotgun with Sperminator / Evild Dead / Riding shotgun, Hand-to-gland with Kung fu / Samurai / Biting) folded into ideas.md and marked filed in the artifact database. The planner refuses a second Save while one is still writing (the first save ran twice and wrote 38 rows for 19 ideas).
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-29 Planner: Feats, sperm passives and branch gates
- Systems: tests/tools
- Files: tests/tools/planner/planner.js, tests/tools/planner/template.html
- What: a Feats & more tab lists the 52 Feats (feats10.js F10, Unique Feats per sample, Lv 3 and Lv 5 forks) and the 29 sperm passives still dealt (mutations.js MUT_REG minus SP.cut, with spmast.js masteries). They drop on the sperm (3 Feat slots plus the sample's Unique; 5 passive slots). Gating: a Feat, modifier or passive dropped on a branch (Lv 3/6/9 branch, fork, mastery, Feat fork, passive mastery) becomes a gate node, only available once that branch is taken; gates drag between branches, export as a Gates list (Copy ideas, Copy build) and save to ideas.md as type Gate.
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-29 Planner: rules off lets anything hang off anything
- Systems: tests/tools
- Files: tests/tools/planner/template.html
- What: with Game rules off, a chip or moved modifier the game would refuse lands as a card block (name, text, type filled in) under whatever it was dropped on, blocks included; unedited card blocks export as `[CARD]` and are not counted as ideas. Fixed: blocks older than their parent (after a move) were dropped at render; the capability probe ran before its helpers.
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-29 Planner: Save to ideas.md, idea types, moving blocks
- Systems: tests/tools, docs
- Files: tests/tools/planner/template.html, ideas.md, NOTES.md
- What: each block or edit has a Type (Weapon, Lv 3 branch, Modifier fork and so on; required before saving); Save to ideas.md (toolbar: all unsaved; panel: one block) writes rows to the artifact database (collection `ideas`, status `queued`) and sends Claude a comment to fold them into ideas.md. Blank blocks and modifiers can be dragged from one node to another on the map (modifiers keep rank, fork and mastery, and obey the fit and group rules; branches stay with their weapon). The artifact is published with the `db` and `comments` capabilities.
- Save data: none in the game.
- Hooks: none.
- Risk: none.

### 2026-10-29 ideas.md: loadout ideas from the planner
- Systems: docs only
- Files: ideas.md (new), ARCHITECTURE.md
- What: a kept list of the ideas pasted from the Loadout Planner's Copy ideas (dated batches, status per row). First batch: 9 ideas (Standard Issue and Maximum Gains upgrades, a Melee weapon with three follow-ons).
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-29 Planner: edit cards as a copy, or overwrite on request
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/template.html
- What: every card node on the map has Edit as a copy (a blank block beside it, prefilled with its name and text, tagged Variant of X; the original is untouched) and Overwrite the original (rewrites the node in place, keeping its slot, rank and branches; Revert restores it). Both appear in Copy build (`[EDITED, was X]`, `variant of X`) and Copy ideas (with the original text).
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-29 Planner: blank idea blocks
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/template.html
- What: a dashed Blank block chip drops on any node (sperm, weapon, modifier, fork, branch, or another blank) and is typed into on the map (tag, name, text); blocks are kept with the build, hang off their parent, and go when it goes. Copy build walks the whole tree (blanks included); Copy ideas lists only the blanks with their place in the tree, for turning into real content later.
- Save data: none (localStorage of the artifact page only).
- Hooks: none.
- Risk: none.

### 2026-10-29 Loadout Planner artifact (tool only, no game change)
- Systems: tests/tools (docs and tools only)
- Files: tests/tools/planner/planner.js (new), tests/tools/planner/template.html (new), ARCHITECTURE.md
- What: `node tests/tools/planner/planner.js` extracts the live roster (matrixonly.js weapons and modifiers plus Area, Lifesteal and the built-in Delivery modifiers; what fits what via modOk on a fresh slot; groups from modmatrix.js; forks and masteries from MSB and slicecopy.js; WUP branch trees; samples) and writes tests/out/loadout-planner.html: a drag-and-drop mind map (sperm > up to 4 weapons > modifiers and Lv 3/6/9 branches > forks > masteries) published at https://claude.ai/artifact/6nudTiGo14jVZ8TjaprBk3.
- Save data: none.
- Hooks: none.
- Risk: none (nothing in web/ changed).

## v10.224 (versionCode 503): 2026-10-29 Tone, not characters; type colour in text; no HUD narration (merge of `claude/zealous-cori-jj4q7l` v10.221 to v10.223, `claude/intelligent-goldberg-u2xo4b` and `claude/focused-ramanujan-gzr4rp`)
- Merge notes: both zealous-cori and focused-ramanujan removed the Narrator setting; the persona-free settings.js was kept. focused-ramanujan's rule wins in show.js: no narration reaches the HUD (voice lines and headers THE SCIENTIST, THE LAB TECH and LAB LOG are dropped; notices still show), so the rewritten captions appear only on the end screen, boss intros and in the run log. tests/wstest.js removed with the whisper behaviour. Full suite: see NOTES.md.

### 2026-10-29 Feat page shows Lv x/5 (`claude/zealous-cori-jj4q7l`)
- Systems: weapons (level display), ui (Tackle Box Feat page)
- Files: weapons24.js
- What: wTierMax returns 5 for v10 Feats, so the Feat page header reads Lv 1/5 with five squares, matching the loadout row and the real cap.
- Save data: none.
- Hooks: none.
- Risk: anything else that reads wTierMax for a Feat (wLvText in the slot tooltips) now says /5. Weapons unchanged.

### 2026-10-29 Sequence stories trimmed, last narrator drift fixed (v10.223) (`claude/zealous-cori-jj4q7l`)
- Systems: sequences, voice, ui, tutorials, bosses (float text only), campaign levels (banner only)
- Files: seqreveal.js, reborn.js, redtail.js, twins.js, holy.js, spoon.js, dnadrop.js, ui.js, weird.js, intro.js, game.js, levels.js, statusintro.js, bosspack.js, render.js, rivals.js, voice_and_tone.md
- What: the eleven v9 sequence stories are shorter and speakerless (no "my handwriting", no "Mine"); Prawn Again's gift line now matches the mechanic (every 45 s, not once a run). The three sequence quotes that spoke (Prawn Again, Redtail, Twins) are captions, and the Twins tag is SOLD AS A PAIR. The remaining first-person and "the scientist"/"the doctor" lines are captions, "bloke" is gone, and HUD alerts use a colon instead of "!". voice_and_tone.md 8B now lists what is left (enemy taunts as the deliberate exception, ENEMY_INTRO tips, the persona docs, dead Sample 9 lines).
- Save data: none.
- Hooks: none.
- Risk: none in code paths; text only. seqtest fails before and after (pre-existing unlock-order check).

### 2026-10-29 Copy pass: speakerless captions (v10.222) (`claude/zealous-cori-jj4q7l`)
- Systems: voice, ui (mutation cards, Meet card), campaign, data
- Files: voice.js, data.js, waves.js, ui.js, campaign.js, rivals.js, tutorial.js, mutations.js, samples10.js, meetsample.js
- What: every narration line that spoke in the first person, named a person in the room or shouted now reads as a flat log caption (voice_and_tone.md). About 55 voice.js lines, 20 SYSTEM_LINES, the waves.js SCIENTIST pool, the quoted dish intros, all 35 mutation flavour lines, two STATUS_HINT lines and five sighting lines were rewritten; the loud Tier 2 and 3 lines keep their volume without a speaker. The Meet card's play-style line and button are filled (MEET_STYLE, "TO THE SLIDE"). Copy written by Claude at the user's request.
- Save data: none.
- Hooks: none.
- Risk: tests that match exact narration text (none found) would break; voicetest, mutstest, samplestest, drafttest, quick pass.

### 2026-10-29 Persona cut: one caption voice, no characters (v10.221) (`claude/zealous-cori-jj4q7l`)
- Systems: voice, settings, ui (cards, sample screens), campaign, data
- Files: cardvoice.js (deleted), giftvoice.js (deleted), tests/tools/copy/cardvoice.py and giftvoice.py (deleted), index.html, voice.js, voice10.js, show.js, settings.js, data.js, feats10.js, samples10.js, meetsample.js, weapons24.js, ui.js, campaign.js, rivals.js, tutorial.js, waves.js, tests/voicetest.js, tests/wstest.js, tests/veilshot.js, tests/tools/guide.js, voice_and_tone.md, ARCHITECTURE.md, CLAUDE.md
- What: the game has a tone, not characters (voice_and_tone.md rewritten). The per-sample card quip line is gone (cards show the name and what they do; weird-box and stat-card quips stay). The Narrator setting and its Documentary, Midwife and Mums packs are gone. The inner voice is gone: voice.js keeps one pool per event (the old `sci` key), sightings have one line, `LONGING_LINES` and the campaign's egg sponsor line are deleted, the end screen shows one line. Sample intro quotes (`line`) are gone from the sample screen and the Meet card; the Feats' quoted gift lines are gone. Every caption header reads LAB LOG. Rival quotes and KILL_LINES stay by the user's decision.
- Save data: SET.narrator is no longer read (stale values are harmless). None added.
- Hooks: none added. ui.js applySettings no longer calls applyNarrator; show.js sysPool reads SYSTEM_LINES only.
- Risk: any branch that adds cardvoice.js rows, CARD_VOICE keys, `con` pools, a narrator pack or a sample `line` field will conflict or go unused. feats10.js `line` fields were removed from every Feat def. veilshot.js and statuptest fail before and after this change (pre-existing).

### 2026-10-29 Damage-type colour in text, rarity left bar, Feat upgrade line (v10.221) (`claude/intelligent-goldberg-u2xo4b`)
- Systems: ui (loot cards, Tackle Box, Armoury), weapons, feats, docs
- Files: typetext.js (new), eink.css, style.css, index.html, tests/typetexttest.js (new), tests/run.sh, ARCHITECTURE.md, UI_PRINCIPLES.md, NOTES.md
- What: words that speak to a damage type (Acid, Corrosion, Mucus, Snare, Charged, Bleed, Possessed, Burning, Force) take their type's e-ink colour in every screen; weapon and Feat names (loot card titles, the "For weapon:" line, Tackle Box rows, Armoury header) take the weapon's current type colour; the "For weapon:" line is one size; the Armoury sub line shows the type name in its colour instead of "weapon"; the loot card left bar is the rarity colour (was damage type); the rarity chip under the tile is 9 px; a Feat upgrade card leads with the Feat's own "what it does" line (F10 `does`, existing text), then the stat change. No new player-facing text.
- Save data: none.
- Hooks: none (a MutationObserver per `.screen` in typetext.js; no render function wrapped or edited).
- Risk: other sessions editing loot cards (ui.js renderLootCards, style.css `#lootCards .card`) may touch the same left-border line; lit (`.sel`) elements are skipped so inverted buttons stay readable; a type word in prose that is not a damage type (capitalised "Force", "Static", "Fire" not before "rate") would be tinted.

### 2026-10-29 Remove the Narrator setting and HUD narration (v10.221) (`claude/focused-ramanujan-gzr4rp`)
- Systems: settings, narrative (show, voice10), ui
- Files: settings.js, show.js, voice10.js, tests/voicetest.js, tests/wstest.js (removed), tests/tools/guide.js
- What: the Narrator row is gone from Settings (saves fall back to the default pack). Narrator lines (Scientist, inner voice, Lab Tech chatter) no longer reach the HUD message box; gameplay notices (achievements, combos, hazards, level instructions) still show. Voice lines are still picked and logged, and the end screen and boss intro lines are unchanged. Immersive whispers (whisper.js) are now inert.
- Save data: SET.narrator is forced to 'system' on load; key kept.
- Hooks: none (early returns in sysLine, vxPush and narrator-headed sysMsg).
- Risk: the Scientist's wave-mode start line also carried the "clear a wave, open your DNA" instruction, which no longer shows.

## v10.220 (versionCode 499): 2026-10-29 First-run setup; readable damage numbers on Darkfield (`ccr-0a3df35b-hhv6r6`; v10.219 on the branch, copy written in v10.220)
- Systems: first-run setup (new), render (floating texts), tests
- Files: onboard.js (new), render.js, index.html, ARCHITECTURE.md, tests/onboardtest.js (new), tests/tuttest.js, tests/batchcheck.js, tests/viewtest.js
- What: damage numbers and other floating texts no longer go through the Darkfield inversion (their black outline had turned white, so they washed out over glows). A new player now picks View (Lab or Arcade, shown side by side on a live demo), the slide (brightfield or Darkfield) and sound volumes before the title. Copy written by Claude at the user's request.
- Save data: META.obDone added (setup done). The demo's own run never touches META (restored from a copy).
- Hooks: none in shared files (render.js edit is one line in the floating-text block). onboard.js wraps splashEnd, render, UI.tick, achieve, liveSave; hookOn('hurt:before').
- Risk: tests that call splashEnd() without window.TUT_OFF on a fresh profile now get the setup (three updated with META.obDone). Existing players never see it (any run in RUNLOG or DNA earned).

## v10.218 (versionCode 497): 2026-10-29 Fewer reward screens, Lv 30 runs (`ccr-0a3df35b-hhv6r6`; merged into main with `ccr-d9f589ef-0b2nf0` v10.208 to v10.217 and the stale `ccr-b6a373a9-q8ofbd` build)
- Systems: level pace (new), engine (XP curve, levelsAhead), reward director, weapon levels, race schedule, DNA strands
- Files: levelpace.js (new), wmods.js, index.html, ARCHITECTURE.md, tests/tools/guide.js
- What: levels cost more as you climb (new Lv L = old Lv L + L²/30, so Lv 30 is the old Lv 60; egg opens at Lv 30, weapon mounts at 4 and 9, evolutions at 4/8/15/27). Reward screens come from play: one per level-up, the boss relic, Vestigial Masses and the weapon kill bars (WM.k0 16 -> 20). Boss spoils, elite/event/cure/pickup DNA strands (all but Achievement DNA) and the Race's 5:00/10:00 milestone screens are gone. Race bot sim (10 runs, mortal): Lv 22-29 at 15:00 (was 57-62), 14-85 screens a run (was 100-134), wins 2/10 (baseline 1/4).
- Save data: none.
- Hooks: none in shared files (levelpace.js replaces xpNeed and levelsAhead, wraps dirGate, sets EGG.level, SLOT_LEVELS, EVOLVE_LV, XEB.chance, RPLAN.milestones at load).
- Risk: wave mode (s002) and Level 1 also level about half as far; SPLICE_LEVELS and Prawn Again memories keyed to old levels may come later or not at all; the bot dies more often before 8:00 with one weapon.

## v10.217: 2026-10-28 Mythical and Immaculate cards drop again (`ccr-d9f589ef-0b2nf0`)
- Systems: loot (rarity), achievements (Achievement DNA)
- Files: mythdna.js (new), wmods.js, index.html, ARCHITECTURE.md, tests/v10test.js
- What: under v10 nothing reached Mythical or Immaculate (modifier cards are ranked Uncommon to Epic, stat cards rolled without the special roll, so Legendary was the ceiling; Achievement DNA was dropped by the box gate). Stat cards now take the special roll (0.47% Mythical, 0.26% Immaculate a card in a 20,000 roll check, three a run) with a boon each; Achievement DNA opens and deals three stat cards, all Mythical (69%) or Immaculate (31%). v10test updated: fresh-save modes, Achievement DNA no longer dropped, 46 roster weapons (the podcast, missed in v10.209).
- Save data: none.
- Hooks: wmods.js wmStatRar passes special=true to rollRarity; mythdna.js wraps wmStatCard, draftBox and v10Loot.
- Risk: dropping Achievement DNA was a deliberate v10 choice (v10test asserted it), now reversed; boons come back into play with them.

## v10.216: 2026-10-28 Weapon fusions offered again; locked samples are silhouettes (`ccr-d9f589ef-0b2nf0`)
- Systems: weapons (fusion), samples (rack)
- Files: wfusion.js, progress.js, style.css
- What: every weapon fusion offer was dropped: draft.js draftBox refuses box kinds it does not list, and 'wfuse' was never added (since the 26 Oct merge that brought both in). wfusion.js now gates its own box (open while the pair is still ready, through the Reward Director like a fork). All 27 pairs checked in the race and the Petri Dish: offered, opened and fused (0 of 54 before). Locked samples on the rack are a silhouette with ??? for the name.
- Save data: none.
- Hooks: wfusion.js wraps draftBox; progress.js wraps s10Samples.
- Risk: fusions now happen in real runs for the first time (a weapon slot opens per fusion, so builds get bigger); other dropped box kinds remain: 'myth' (Achievement DNA) and 'vesicle' (Lateral Gene Transfer).

## v10.215: 2026-10-28 First-play progression, no XP drift, sperm button opens YOU (`ccr-d9f589ef-0b2nf0`)
- Systems: samples (unlocks), modes, xp, ui (HUD)
- Files: progress.js (new), xpgems.js, buildbtn.js, index.html, ARCHITECTURE.md, tests/kinalltest.js
- What: a new player sees only The Race and The Petri Dish; Endless opens after beating the Dish, Level 1 and the race course after winning The Race (META.modeWon; developer Unlock Everything opens all). Only Baseline is open on the rack: the v9 samples are locked too (rescues do not offer them). The Race's mode tag is TODO_COPY:mode_race_tag while it is renamed. XP no longer drifts to you in the race (was 700 px at 110; Gem Drift cards still add drift). The HUD sperm button pauses on YOU instead of BUILD.
- Save data: META.modeWon { <mode>: 1 } added.
- Hooks: none in shared files (wraps game.js victory and samples10.js s10Modes).
- Risk: more XP left on the floor in the race (slower levelling, the level curve and BEHIND PACE chip will read further behind); v9 samples are unreachable outside developer mode.

## v10.214: 2026-10-28 Rarity chip on every loot card; straight to the weapon draft (`ccr-d9f589ef-0b2nf0`)
- Systems: ui (loot cards, start flow)
- Files: dsheads.js, eink.css, lab.js, ui.js
- What: loot cards without a pictogram (stat cards and others) show their rarity as a chip above the title, as pictogram cards do under theirs. Starting a run skips the 2.9 s microscope dive (INTRO.skip), which showed the plain sperm before the sample's look was applied: the weapon draft opens at once.
- Save data: none.
- Hooks: ui.js startGame reads INTRO.skip (one condition).
- Risk: the dive's sound and the fade into the slide are gone from every run start.

## v10.213: 2026-10-28 Meet a new sample on rescue; weapon name on upgrade screens (`ccr-d9f589ef-0b2nf0`)
- Systems: kindred (rescues), ui (draft screen, loot cards)
- Files: meetsample.js (new), upweap.js (new), style.css, index.html, ARCHITECTURE.md
- What: rescuing a sample you have never played (no kills on its profile, not met before) pauses on a full-screen MEET card first: live portrait, origin, damage types, its line, passive and a play-style tip (TODO_COPY:meet_<id>_style, TODO_COPY:meet_go); once per sample. Upgrade and modifier screens in the Weapon Draft layout show the weapon's icon and name in big letters above the title (dsheads.js had trimmed it from the kicker); the preview badge and the DNA cards' "For weapon" line are larger.
- Save data: META.s10met { <sample id>: 1 } added.
- Hooks: none in shared files (wraps kindred.js kinRescue and UI.openDraft).
- Risk: the MEET card is skipped under window.TUT_OFF, so tests do not cover it; open copy: 8 meet_*_style lines and meet_go.

## v10.212: 2026-10-28 Sharp player sperm, hit bursts spread over frames (`ccr-d9f589ef-0b2nf0`)
- Systems: render, combat (hits), tests (sims)
- Files: youhd.js (new), hitspread.js (new), render.js, index.html, ARCHITECTURE.md, tests/sim/crowdbench.js
- What: your body (sperm, Holy/Damned halo or horns, body mods) draws on its own canvas at up to 2x resolution, so it stays sharp when the quality steps drop the slide to 1x or 0.75x; Lab view greys it. Past 12 hits in a frame, further hits are held and land over the next frames, oldest first (a Headstrong shockwave plays out over 2 to 4 frames); damage, kills and credit unchanged. crowdbench.js: HS=1 forces hit spreading, a second crash halfway (the first crash's 40 to 90 ms is one-off code warm-up; repeats cost 10 to 30 ms on a desktop).
- Save data: none.
- Hooks: render.js player draw wrapped in youHd(fn); hitspread hookOn hit:before (order 0) and tick; youhd wraps render. Both off under window.TUT_OFF (tests, sims) unless HS_FORCE / YOU_HD_FORCE.
- Risk: a held hit returns 0 to its caller (damage-dealt stats undercount bursts slightly); the sharp canvas sits above the canvas-drawn HUD (rings and chips near you draw under your body); hitspread and youhd are off in tests, so tests do not cover them.

## v10.211: 2026-10-28 Red bullet cores and preview health rings back (`ccr-d9f589ef-0b2nf0`)
- Systems: render, ui (weapon preview), tests (sims)
- Files: render.js, preview.js, tests/sim/crowdbench.js
- What: enemy bullets always have their red core again, and the weapon preview's hurt targets wear a red health ring; both needed the Anti-Immune Stain, retired in v9.11. crowdbench.js gains CRASH=1 (swim back and forth through a clump), RAM=n (Headstrong rank) and hits by source.
- Save data: none.
- Hooks: none.
- Risk: one more fill pass over enemy bullets a frame (one path, cheap).

## 2026-10-28 Crowd frame bench (`ccr-d9f589ef-0b2nf0`)
- Systems: tests (sims), render
- Files: tests/sim/crowdbench.js (new), render.js, ARCHITECTURE.md
- What: crowdbench.js times frames when you swim into a packed crowd (DEFS=enemy ids, LOD=on-screen threshold, NODRAW=1 for update only). render.js counts enemies on screen and draws the plain crowd look above LOD_ON_SCREEN (999 for now: off, so nothing changes yet).
- Save data: none.
- Hooks: none.
- Risk: none (threshold off).

## v10.210: 2026-10-28 Run clock on the HUD (`ccr-d9f589ef-0b2nf0`)
- Systems: ui (HUD)
- Files: render.js
- What: a small run clock (m:ss) at the top centre between the AUTO/speed and pause buttons. It reads G.t, which runs at the set game speed, so it matches the race's 15:00 egg and the run log's times. The top bar that used to hold the clock is never drawn (Immersive is the only HUD).
- Save data: none.
- Hooks: none (one line in render.js drawHud).
- Risk: none.

## v10.209: 2026-10-28 Obligatory Podcast, enemy health rings back (`ccr-d9f589ef-0b2nf0`)
- Systems: weapons (podcast), samples (type pools), enemies (health rings), ui
- Files: podcast.js (new), foes.js, render.js, typepools.js, matrixonly.js, wstars.js (regenerated), index.html, ARCHITECTURE.md, tests/typepoolstest.js
- What: new Force weapon Obligatory Podcast: 3 sound waves a shot, each a widening 40-degree funnel that pierces and shoves; reach 300, crowd 116 dps into 10 (bars 1/2/5/3). In the Force pool, and Alpha drafts it too. Every hurt enemy shows a red health ring again (it needed the Anti-Immune Stain, retired in v9.11); rivals ring in their own colour. Weapon bars re-ranked with 31 weapons (a few other weapons' reach bars moved by one).
- Save data: none.
- Hooks: render.js shot loop skips pr.pod; typepools.js tpOk -> podOk; matrixonly.js MATRIX_ONLY.weapons + v_phys_podcast; wraps v10Draw; hookOn fire, tick.
- Risk: one more arc stroke per hurt enemy (late-game draw cost); Alpha's drafts now include a Force weapon. Copy open: TODO_COPY:w_podcast_desc.

## v10.208: 2026-10-28 Tougher race start (`ccr-d9f589ef-0b2nf0`)
- Systems: race (race early), enemies
- Files: raceearly.js (new), index.html, ARCHITECTURE.md, tests/sim/early.js (new)
- What: in the race, ordinary enemies spawned at 0:00 have x2 health, x2.5 hits and x1.4 speed, fading to normal by 3:00 (RACE_EARLY). Bot sim (10 runs): damage taken in minutes 1 and 2 from about 1-5 and 6-24 to about 18-35 and 40-64; lowest health in minute 2 from about 90% to 45-65%. Deaths by 7:00 unchanged within noise (baseline 1/6 to 6/10). Extra early spawns were tried and dropped: they fed XP and made the start easier.
- Save data: none.
- Hooks: wraps game.js makeEnemy (power11.js also wraps it, later in script order).
- Risk: new players meet real pressure in the first 2 minutes. Petri Dish, Endless and levels untouched (raceOn); bosses and rivals untouched (def.patterns).

## v10.207 (versionCode 486): 2026-10-28 Collision crash with timer enemies (`ccr-d9f589ef-0b2nf0`)
- Systems: combat (collisions), enemies
- Files: collide.js
- What: collide.js kept its per-pair collision memory in `e.cdT`, which newfoes.js already uses as a number cooldown, so a knocked enemy hitting one of those threw "e.cdT.get is not a function" (seen in a v10.206 run log). The Map now lives in `e.cdPr`.
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.206 (versionCode 485): 2026-10-28 Vestigial Masses (`ccr-8a075440-cbkv62`)
- Systems: loot (rewards), exploration, enemies (guardians)
- Files: vestigial.js (new), render.js (one hook), index.html, ARCHITECTURE.md
- What: hidden growths sit off the beaten track: Race up to 3 waiting (9 a run), Petri Dish and Endless up to 2 (6 a run), a new one every 110 s; Level 1 has 4 on floor cells off the shortest route. They are drawn small and dim with no pointer until you come within 620; then a banner, a glow and an edge pointer, and half of them wake 2 to 4 tougher (x2.5 health) guardians of a kind already on the slide. Touching one pops it: 30% a weapon draft (when a mount is free, in every mode, the Race included), otherwise a card screen whose stat cards roll Legendary 50%, Mythical 35% or Celestial 15%. Rewards go through the loot queue (wave mode opens them at the break).
- Save data: none (G.vm run state; G.stats.masses).
- Hooks: render.js drawHud -> vmPointers. Wraps v10Draw, v10Loot, draftBox, wmStatRar; hookOn tick.
- Risk: more power for explorers (the bot does not seek them, so sims undercount it); guardians add pressure near the rim of the dish. Banners ('VESTIGIAL MASS', ': A NEW WEAPON', ': SOMETHING RARE') are Claude-drafted.

## v10.205 (versionCode 484): 2026-10-28 Ordered Online is Static and Fire, Laser always in its first draft (`ccr-8a075440-cbkv62`)
- Systems: samples (type pools), kindred
- Files: typepools.js (TP_TYPE may be a list; tpPool takes a list), kinall.js (rescue note names both types), tests (samplestest, kinalltest, samplestarttest)
- What: Ordered Online drafts from the Static and Fire pools (was Mucus) and shows both types; its signature is the Laser, so the opening draft always holds the Laser plus two others from those pools (20 of 20 in a check). Rescuing it adds both types to the run. Its passive (Mucus trail, 30% Evasion) is unchanged. kinalltest and samplestarttest now check the written lock and unlock lines.
- Save data: none.
- Hooks: none.
- Risk: Ordered Online's pool is 11 weapons (7 Fire) instead of the Mucus three.

## v10.204 (versionCode 483): 2026-10-28 Every Prawn Again weapon is Holy/Damned (`ccr-8a075440-cbkv62`)
- Systems: samples, holy, mutations
- Files: prawndamned.js, holy.js, mutations.js (hasType), tests/holytest.js
- What: on a Prawn Again run every weapon it takes deals Holy/Damned (w.typeOver = 'soul', set from the frame it is taken): its hits fill the Holy/Damned bar, follow the stance, and draw in Holy/Damned colours; weapon tags show it. Card eligibility (hasType) counts them as Holy/Damned. Feats keep their own types.
- Save data: none.
- Hooks: holy.js holyYouPol, holyDrawYou and fire:after read typeOver; mutations.js hasType reads it on a Prawn Again run; hookOn tick 'prawnd:soul'.
- Risk: Blood weapons on Prawn Again lose Bleed (and its healing pools); Blood-only cards stop being offered to it.

## v10.203 (versionCode 482): 2026-10-28 Prawn Again keeps its damage types (`ccr-8a075440-cbkv62`)
- Systems: samples, modifier cards (Switched at Birth)
- Files: prawndamned.js, index.html (prawndamned.js now loads after sabtiers.js), ARCHITECTURE.md, tests/holytest.js
- What: a Prawn Again run never deals a Switched at Birth card, and any other switch does nothing, so its weapons always keep their own damage type.
- Save data: none.
- Hooks: none in shared files. Wraps modDraftCands, sabCard, sabSwitch.
- Risk: one fewer card family in Prawn Again drafts (the others fill the gap).

## v10.202 (versionCode 481): 2026-10-28 CONVERTED only when it turns (`ccr-8a075440-cbkv62`)
- Systems: holy, chemistry
- Files: prawndamned.js, holy.js, chem.js
- What: the CONVERTED label no longer sits over Possessed enemies; a Holy verdict that turns an enemy pops CONVERTED once (gold, in place of POSSESSED), and the enemy keeps a gold glow (red and purple while Prawn Again is Damned). Other charms still pop POSSESSED and show their ALLY countdown.
- Save data: none.
- Hooks: chem.js curseFoe reads e.holyConvNext (set by holy.js holyPayoff).
- Risk: none.

## v10.201 (versionCode 480): 2026-10-28 Prawn Again turns Damned under pressure (`ccr-8a075440-cbkv62`)
- Systems: holy (Holy/Damned), samples, pacing, look
- Files: prawndamned.js (new), holy.js, render.js, index.html, ARCHITECTURE.md, tests/holytest.js, tests/specpasstest.js
- What: Prawn Again's Holy/Damned stance follows the invisible intensity meter instead of the 30 s clock: Damned at 0.8, Holy again once it eases off (relaxing and down to 0.5). Modes without a meter (Petri Dish, Endless waves, Level 1, Lab Bench) run their own copy of it with pacing.js's numbers. Damned changes the whole body (dark plum, red veins, bat wings, horns, red eyes, purple smoke, red tail) and every shot to red and purple, with a flash, shake and burst on each flip. Enemies Possessed while you hold Holy/Damned are gold and labelled CONVERTED (red ALLY while Prawn Again is Damned); Damned-verdict enemies wear a dark red aura. HOLY.damned.glow is brighter (#d01c5c).
- Save data: none (G.prawnD, G.prawnPace are run state).
- Hooks: render.js enemy draw -> holyCharmCol (tag, rim), holyFoeMark (label, aura); holy.js holyPolW / holyYouPol -> prawnPol, holyDrawYou skips Prawn Again; hookOn tick, kill, hurt, fire:after. Wraps samplelooks.js SL_TAIL/SL_HEAD/SL_UNDER/SL_OVER prawn.
- Risk: how long Damned lasts per peak is unsimmed (about 15 to 25 s a peak in the free modes); in the Dish its own meter fills fast in busy waves, so Prawn Again may sit Damned (10% more taken) for much of a wave. Beams and pools keep their own colours.

## v10.200 (versionCode 479): 2026-10-28 Developer mode: Unlock Everything (`ccr-8a075440-cbkv62`)
- Systems: samples, debug
- Files: samples10.js (s10Samples)
- What: the samples screen's DEVELOPER section (tap the samples title five times) has an Unlock Everything card: two taps run debug.js devUnlockAll (META.devAll opens every sample, plus levels, records and 100,000 DNA). It had no button since the v10 samples screen.
- Save data: META.devAll (existing key, now reachable).
- Hooks: none.
- Risk: none for players (developer mode only).

## v10.199 (versionCode 478): 2026-10-28 Every open TODO_COPY written (`ccr-8a075440-cbkv62`)
- Systems: copy (holy, samples, kindred, lifesteal modifiers, Field Guide, race course, Delivery weapons)
- Files: holy.js, mutations.js, samples10.js, samplestart.js, specpass.js, kinall.js, lifemods.js, codex10.js, data.js, course.js, dlvweap.js (DLVW_COPY), wstars.js (comments)
- What: Claude-drafted at the user's request, for their read-through: Holy/Damned cards and Prawn Again's flip lines, Alpha, Beta, Redtail and Not of This World passives, rescue and unlock lines, Bloodsucker ranks and mastery, the Lifesteal group, Field Guide damage-type blurbs and box hints, every Motility Test (race course) line, and the four Delivery weapons (Laser Sword, Laser Mines, Orbital Laser, Nappy Rash). No TODO_COPY string is left in the loaded game.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## v10.198 (versionCode 477): 2026-10-28 Merge of `ccr-f66e39de-z06y45` (Holy/Damned damage type), `ccr-a595ab0d-mak514` (one damage type per sample, rescues in every mode), `ccr-15e338c4-03tzdb` (wup2test fix)

### 28 Oct 2026 Prawn Again's stance, 30 s clock (v10.197)
- Systems: samples, chemistry (damage types), look, voice
- Files: holy.js, tests/holytest.js, redesign docs (DAMAGE_TYPES.md, COMBAT_MATRIX.md 69)
- What: the shared Holy/Damned clock is 30 s (15 s a side at a 0.5 chance, was 6 s) and the halo or horns flicker in the last 2.5 s. Prawn Again makes every soul source it holds a coin, whatever its leaning, and the clock is its stance: Holy half glows white and gold and each Possession it causes heals 2% of max health; Damned half wears a dark shroud with red veins, deals and takes 10% more, and Damned deaths refund 6 stamina. Each flip rings and names the half; the first flip each way in a run gets a Scientist line (2 new TODO_COPY: prawn_flip_holy, prawn_flip_damned).
- Save data: none (G.holySt is run state).
- Hooks: tick (holy:flip) and hurtMul (holy:stance) registered from holy.js; voice10.js vxSay called with a forced line. No new lines in shared files.
- Risk: Prawn Again's power swings with the clock (unsimmed); the 10% taken in the Damned half can tip a close fight.

### 28 Oct 2026 Holy/Damned replaces Parasite (v10.196)
- Systems: chemistry (damage types), combat, mutations, samples, look
- Files: holy.js (new), tests/holytest.js (new), combat.js, fight.js, render.js, typefx.js, typelook.js, chargefx.js, look10.js, style.css, data.js, codex10.js, inspect.js, rewardui.js, mutations.js, samples10.js, boss10.js, cellcopy.js, feats10.js, gifts10.js, glossary.js, tutorial.js, voice.js, wup3.js, wup6.js, index.html, ARCHITECTURE.md, redesign docs (DAMAGE_TYPES.md, COMBAT_MATRIX.md decision 69)
- What: the Parasite damage type is now Holy/Damned (internal id still `soul`). Every soul hit is Holy or Damned by its source (HOLY_P; Prawn Again's kit flips on a shared 6 s clock, the player wears a halo or horns); the soul bar keeps a signed total and pays out Possessed (Holy, as before) or Damned (+30% damage taken 4 s, bosses +15% 1.5 s, spreads 0.35 of Damned bar to mates within 90 units on death). The six soul reactions fire on either verdict. Two bias cards (h_devout, h_heretic) move the chance 0.25 a rank. Type colour gold (#ffcf5a); Damned draws black with a red-purple glow. 13 TODO_COPY placeholders; "Parasite" swapped for "Holy/Damned" in 20 existing lines (user to read through).
- Save data: none (META.offered keys unchanged; `G.muts.h_devout` / `h_heretic` are run state).
- Hooks: combat.js resolveHit -> holyBar; fight.js fightHit -> holyPol, fightPayoff 'possess' -> holyPayoff, f_possessed -> holyDamned, bar colour -> holyBarCol; render.js after drawShip -> holyDrawYou; hooks fire:after, dmgMul, kill registered from holy.js.
- Risk: Damned's +30% and the death spread are unsimmed (Prawn Again and Rent Free builds get stronger); reactions on Damned enemies (Erosion bursts when Damned ends, Interference extends Damned) are new interactions; any code reading ELEMENTS.soul.color now gets gold.

### 28 Oct Rescues in every mode, weighted odds, type-pool rescue drafts, rescue-and-finish unlocks
- Systems: kindred, samples (unlocks), waves, levels, tests
- Files: kinall.js (new), kindred.js (kinTick reads kinOn()), samplestart.js (achievement unlocks removed, s10LockTxt), index.html, ARCHITECTURE.md, tests (kinalltest.js new; kindredtest, samplestarttest, samplestest updated; run.sh list)
- What: stranded samples now also appear in the Petri Dish and Endless after each boss wave (5, 10, 15; Endless every 5th) and in Level 1 after each arena clear (placed on a reachable floor cell). Which one is weighted: alpha 4, beta 4, ordered 3, redtail 3, acro 2, prawn 1, alien 0.5 (never baseline or Private Schooled), from samples not yet unlocked and not carried. The rescue draft is two weapons from the rescued sample's type pool plus one wildcard, with a type swatch and note on the screen; absorbing adds that type to the run's drafts (tpAdd). Only Baseline is open on a fresh save: a sample unlocks when it was rescued in a run that was finished (Race: the egg; Dish: wave 20 beaten; Endless: wave 20 reached; Level 1: cleared). Achievements no longer unlock samples. In the Dish and Endless the next wave waits up to 30 s for a waiting spirit. Placeholders: `TODO_COPY:kin_lock_txt`, `kin_unlocked`, `kin_type_note`, `kin_type_note_any`.
- Save data: META.s10 (unlocks, same key, now set on a finished run); META.achEver still recorded.
- Hooks: none in game.js, render.js, ui.js or bosses.js. Wraps waveClear, kinChoose, kinCards, kinAbsorb, victory, lvWin, waveBegin; hookOn tick.
- Risk: the Dish's 30 s wave hold changes pacing slightly at waves 5, 10 and 15; acro's old unlock line and the Shell-strip unlock are inert; wup2test is flaky on main (Terminal Clause scene), unrelated.

### 28 Oct Alpha may take Can't Sit Still again
- Systems: mutations
- Files: mutations.js
- What: the "Alpha already has this" gate on the Can't Sit Still trade-off is gone, since Alpha's passive is no longer a fire-rate bonus.
- Save data: none.
- Hooks: none.
- Risk: none.

### 28 Oct Weapon pools by type, one type per sample, Private Schooled on hold
- Systems: samples, weapons24, kindred (kinPool), tests
- Files: typepools.js (new), index.html, ARCHITECTURE.md, tests (typepoolstest.js new; samplestest, weapons24test, v9armstest, kindredtest, v10test updated)
- What: every sample is a specialist of one damage type (baseline Force, alpha Static, beta Blood, ordered Mucus, redtail Fire, prawn Parasite, acro Acid, alien all). Each type's pool is its live weapons (Force 6, Static 3, Mucus 3, Blood 3, Acid 3, Parasite 4, Fire 8). The opening draft is the sample's signature weapon plus two random others from its pool. Every later draft offers only the run's types (`G.tp.types`: the sample's, plus any a rescue adds with `tpAdd`). Private Schooled is off the rack (`S10_BY.private` stays; its weapons stay in their pools).
- Save data: none.
- Hooks: none in shared files. Wraps samplekit.js s10Start and kindred.js kinPool (sample runs now gate drafts by type, so kinAbsorb no longer adds weapons by itself: the rescue task calls tpAdd).
- Risk: rack count 19 (strain 004 is a gap); four pools have exactly three weapons, so their opening draft is fixed; Dish, Endless and Level 1 runs need rescues (next entry) to get a second type.

### 28 Oct Specialist passives for Alpha, Beta, Redtail and Prawn Again
- Systems: samples, chemistry (Charge, Bleed, Burning), tests
- Files: specpass.js (new), index.html, ARCHITECTURE.md, redesign docs/SAMPLES.md, tests (specpasstest.js new; samplestest, kindredtest updated)
- What: Alpha: while moving, Static hits keep Charge 4.5 s (was 3) with 1.5x arcs and other hits Charge for 1 s (the +50% fire rate is gone). Beta: below 40% health, Bleed damage heals it (25%, up to 50% at 10% health; the damage bonus and plain lifesteal are gone). Redtail: body contact Ignites (1 s per-enemy cooldown; Static no longer adds burn). Prawn Again: Possessed enemies hit their old friends twice as hard (its Bleed line is gone). Three pdescs are `TODO_COPY:pas_alpha_desc`, `pas_beta_desc`, `pas_redtail_desc`.
- Save data: none.
- Hooks: none in shared files. Wraps s10Tick, s10DmgMul, s10Hit, fightStatus; hookOn hit:late and tick.
- Risk: not sim-tuned (Alpha is likely weaker on non-Static builds; Redtail's dose is a guess). The masks depend on the shape of the old branches in samples10.js.

### 2026-10-28 wup2test green: Parasite Terminal Clause scene
- Systems: tests
- Files: tests/wup2test.js
- What: the Parasite pass of Little Prick's Terminal Clause failed because Parasite needles kill the stock scene's 40 to 80 health enemies in one hit, so none was ever hit while low and alive. The Parasite pass now uses tougher enemies (100 to 200 of 1,000 health). No change in play.
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.195 (versionCode 474): 2026-10-28 Merge of `ccr-0567207f-iybojr` (Delivery weapons), `ccr-2faffc4b-4lg67n` (Lifesteal modifiers) and `ccr-15e338c4-03tzdb` (secret reroll)

### 2026-10-28 Merge fixes (v10.195)
- Systems: modifier cards (stat bonuses), tests
- Files: lifemods.js, tests/bodiestest.js
- What: Bloodsucker and Umbilical Cord bank a stat like every other modifier card (Health Regeneration and Max Health; they fell back to a stat picked from a hash of the id, and statuptest failed). bodiestest no longer lets the spawner's enemies set its test mine off (the well's fling read 0 to 40 in about 1 run in 5 after the merge).
- Save data: none.
- Hooks: none.
- Risk: the two Lifesteal cards show a different stat bonus than in their branch's own build.

### 2026-10-28 Delivery modifiers out; four Delivery weapons in (v10.193)
- Systems: weapons, modifier cards, laser, weapon cells, tests
- Files: dlvweap.js (new), dlvrun.js (new), laserbeam.js, matrixonly.js, wstars.js (regenerated), index.html, tests/dlvtest.js (new), tests/weapons24test.js, tests/v10test.js, tests/run.sh
- What: Melee, Ranged, Mines and Death from Above are no longer dealt as modifier cards. Four of their custom forms are now weapons in the draft: Laser Sword, Laser Mines, Orbital Laser (strikes only) and Nappy Mines artillery. Each one's attack ranks with the weapon's level (Lv 1/3/6/9) instead of by cards, with the usual fork at Rank 2 and the mastery on the Laser three. Names and descriptions are TODO_COPY.
- Save data: none.
- Hooks: none in shared files. laserbeam.js lzIs also matches def.lzKin. dlvrun.js wraps makeSlot, modOk, mmHeld, wupFire, wupStats; hookOn('tick', 'dlvrun:sync'); adds statup.js ST_W rows.
- Risk: the generic Melee/Ranged/Mines/Death from Above code stays (it drives the new weapons; tests still reach it), so slots that hold one in the Sandbox keep it. Balance of the four is set from measured bars only (Orbital x1.5, artillery x0.6 damage), not from run sims.

### 2026-10-28 Lifesteal back in the v10 draft (v10.193)
- Systems: modifier cards, draft cards, healing
- Files: lifemods.js (new), index.html, ARCHITECTURE.md, tests/lifemodstest.js (new), tests/modstest.js
- What: two new weapon modifiers in their own Lifesteal group: Bloodsucker (hits heal 2/3/4% of damage dealt, mastery 6%, within the lifesteal pool) and Umbilical Cord (one rank, Epic, half weight: 5%, may draw four times the pool). Leech and Slurp were blocked for real players by the slice filter (spslice.js) and are now on its card list. In slice drafts about 1 level-up in 3 offers a lifesteal card.
- Save data: none
- Hooks: none in shared files (hookOn proc 'lsmProc'; wraps modmatrix.js modCard and modDraftCands; adds wmods.js WMV_SCENE loops; pushes to MODS10, MODUP, MM_GROUP, MM_GNAME, MATRIX_ONLY.mods, SLICE.mods, SLICE.muts).
- Risk: more healing in real runs: wave20 8 mortal (slice on) went from 2 to 4 bot wins. Copy open: TODO_COPY:mod_bloodsucker_r2, mod_bloodsucker_r3, mm_group_lifesteal, mastery_bloodsucker.

### 2026-10-28 Secret reroll on the Weapon Draft (v10.193)
- Systems: secret reroll (new), ui (Weapon Draft)
- Files: secretroll.js (new), style.css, index.html, tests/secretrolltest.js (new), tests/run.sh, ARCHITECTURE.md
- What: an invisible 56 px tap zone in the top-right corner of the Weapon Draft deals the draft again (UI.openDraft on the same request), as often as you like and free; the box count is left as it was. The start draft (always the sample's three) and a Daily's fixed weapons only reshuffle.
- Save data: none (G.stats.secretRolls counts rerolls within a run).
- Hooks: none (adds #dSecretRoll to #draft).
- Risk: an accidental tap in that corner rerolls the draft; balance is off for anyone who knows (endless free rerolls).


## v10.192 (versionCode 471): 2026-10-27 Merge of `ccr-15e338c4-03tzdb`, `ccr-8bbc67d2-zjlnl4`, `ccr-64cf07a7-30asvl`, `ccr-5a800472-3464vq` (Orbiting Link circle, Field Guide COMBOS, measured weapon card bars, 27 fusion pairs)

### 2026-10-27 Orbiting Link beam is a circle (v10.189)
- Systems: Delivery forms (Orbiting), tests
- Files: delivforms.js, tests/delivtest.js
- What: Orbiting + Connecting's beam ran in straight lines between the bodies (a triangle with three). It now runs round the ring as a circle through the bodies, bending smoothly only where a body is pulled off the ring (Homing, Bounce); the damage follows the same curve (xdLinkPolar / xdLinkR), so an enemy inside the ring is no longer cut by a chord.
- Save data: none.
- Hooks: none.
- Risk: Link hits the ring's band instead of the chords: enemies between you and the ring (the old triangle's edges) are no longer hit, enemies on the ring between bodies now are.

### 2026-10-27 Six more fusion pairs and fusion copy (v10.189)
- Systems: wfusion, wfusion5 (new), wfcopy (new), weapons
- Files: wfusion5.js (new), wfcopy.js (new), wfusion2.js, wfusion3.js, wfusion4.js, index.html, tests/wfusiontest.js, ARCHITECTURE.md, NOTES.md
- What: six more transforming fusions (27 in all). Split Ends (Standard Issue + Blowing Bubbles): shots pop trapped bubbles at full size and bullets split in bubbles. Group Hug (Maximum Gains + Ewww, Gross): pellets drag a taped bundle together and share the hit. Breeding Ground (Nocturnal Emission + Chest Burster): puddles infect, allies fire faster and leave puddles. Sympathy Sneeze (Enzyme Sneeze + Soulmate Signal): twins sneeze on their own (no knockback, which pushed the crowd off the beam). Induced Labour (Spark of Life + One of These Days): the Spark ends a countdown early at double payout, splashing. Blind Date (Enzyme Headbutt + Peekaboo): headbutts from hiding hit x3 and Fear; the BOO headbutts everything near. Names and descriptions for all 27 fusions written (Claude-drafted at the user's request) in wfcopy.js; no wf_ TODO_COPY left. Sim (400 HP crowd, 10 s, fused vs apart): Induced Labour 2.3x, Blind Date 2.3x, Group Hug 1.4x, Breeding Ground, Split Ends and Sympathy Sneeze about 1.1x.
- Save data: none.
- Hooks: none in shared files (hookOn proc, dmgMul, hit:before, tick; wraps duePop, peekBoo).
- Risk: balance of the six; Split Ends and Sympathy Sneeze are the weakest fusions in the sim.

### 2026-10-27 Weapon card bars measured (v10.189)
- Systems: weapon card bars (new), ui
- Files: wstars.js (new, generated), tests/tools/wstars.js (new), tests/wstarstest.js (new), index.html, tests/run.sh, ARCHITECTURE.md
- What: POWER, FIRE RATE, REACH and CROWDS on weapon cards and details were a flat 3 of 5 for every v10 weapon. They are now measured per weapon in a fixed arena (Lv 1, no modifiers) and ranked in fifths across the 26 matrix weapons: power is damage a second to one enemy, fire rate is attacks a second, reach is the farthest hit, crowds is damage a second into a pack of 10.
- Save data: none.
- Hooks: none (wstars.js sets WEAPONS[id].stars at load).
- Risk: the bars go stale after balance changes until tools/wstars.js is rerun.

### 2026-10-27 Field Guide COMBOS tab shows the weapon fusions (v10.189)
- Systems: help (Field Guide)
- Files: codex10.js, ARCHITECTURE.md, tests/codex10test.js
- What: the COMBOS tab lists the 21 weapon fusions (WF_LIST: name, the two weapons, what it does, fused this run) instead of the retired combos and super combos; the retired combo twists leave RULES. The header counts Fusions.
- Save data: META.cdxWf added (fusion ids made, for the COMBOS tab).
- Hooks: none in shared files (wraps wfusion.js wfFuse from codex10.js).
- Risk: fusion counts start at 0 for everyone (no history before META.cdxWf). TODO_COPY:cdx_wf_hint open; the fusion names and text are still wfusion*.js placeholders.

## v10.191 (versionCode 470): 2026-10-27 Merge of `ccr-6a5eeab5-civjwp` (XP granules as specks of flowing light)

### 2026-10-27 XP specks smaller and dimmer (v10.190)
- Systems: xp granules
- Files: xpgems.js
- What: specks about 40% smaller, glow at half strength, shorter and fainter tails (user: too big and bright).
- Save data: none.
- Hooks: none.
- Risk: granules are harder to spot on busy screens.

### 2026-10-27 XP granules become specks of flowing light (v10.189)
- Systems: xp granules, render
- Files: xpgems.js, render.js
- What: XP granules are drawn as small glowing motes (bright white core, coloured bloom by size: blue, green, gold, violet) that twinkle, idle in a slow loop and trail a short tail of light, longer while flying to you. XPG.light = false restores the dark diamonds.
- Save data: none.
- Hooks: render.js gem pass -> xpgDraw (one line).
- Risk: purely visual; specks are smaller than the old diamonds, so granules may read less on busy screens.


## v10.188 (versionCode 467): 2026-10-27 Merge of `ccr-64cf07a7-30asvl` (attack types lock in), `ccr-5a800472-3464vq` (transforming fusions, 21 pairs) and `ccr-8bbc67d2-zjlnl4` (Field Guide rebuilt for v10)

### 2026-10-27 Attack-type confirm copy (v10.186)
- Systems: ui
- Files: atklock.js
- What: the confirm box's four lines written (ATL_COPY; Claude-drafted at the user's request). No TODO_COPY:atk_lock_* left.
- Save data: none.
- Hooks: none.
- Risk: none.

### 2026-10-27 Attack types lock in (v10.185)
- Systems: modifier cards, attack-type swap, ui
- Files: atklock.js (new), index.html, tests/atklocktest.js (new), tests/run.sh, tests/tools/guide.js
- What: Melee, Ranged, Mines and Orbiting are now a one-way choice per weapon: once a weapon has one, no other attack type is offered on it. An attack-type card shown on a reward screen and not taken (another card picked, rerolled or skipped) is never offered again that run. Tapping a card that gives a weapon its first attack type opens a confirm (copy is TODO_COPY:atk_lock_title, _body, _yes, _no). The Sandbox and no-limits play keep the free swap.
- Save data: none (run state G.atkNo).
- Hooks: none in shared files (wraps modOk, genLoot, UI.renderLootCards, UI.renderDraft, UI.pickLoot; hookOn('tick', 'atklock:check')).
- Risk: fewer attack-type cards dealt over a run (each one seen and passed is gone); atkswap.js's switch card now only appears in the Sandbox.

### 2026-10-27 Six new fusion pairs (v10.187)
- Systems: wfusion, wfusion4 (new), weapons
- Files: wfusion4.js (new), index.html, tests/wfusiontest.js, ARCHITECTURE.md
- What: six new transforming fusions, offered like the first fifteen (WF_LIST grows to 21). Enzyme Headbutt + Skill Issue: every 3rd headbutt launches a living cannonball. Spark of Life + Acid Spit: kills jump the beam on with acid splashes. Red Flagship + Nervous Wreck: the beam reels enemies in, snaps fire a Force beam through the crowd. Little Prick + Rent Free: possessed enemies fire needles at their mates. Eggs + Nappy Mines: grabbed eggs explode. Peekaboo + Family Ties: vanishing leaves a black hole that implodes. Enzyme Headbutt and Spark of Life had no fusion before. Sim (400 HP crowd, 10 s, fused vs apart): 1.15x (Spark of Life, kill-driven) to 2.4x (Red Flagship + Nervous Wreck).
- Save data: none.
- Hooks: none in shared files (hookOn proc, kill, tick; wraps toothTaken, peekFire).
- Risk: balance of the six; 12 more TODO_COPY placeholders (wf_<id>_name / _desc).

### 2026-10-27 Transforming fusions, the other ten (v10.186)
- Systems: wfusion, wfusion3 (new), weapons
- Files: wfusion3.js (new), wfusion.js, index.html, tests/wfusiontest.js, ARCHITECTURE.md
- What: the remaining ten fusions transform too. Acid Spit + Hot Mess: globs drip burning patches and splash. Family Ties + Hot Mess: holes burn their core and collapse into a blast and pool. Nocturnal Emission + Hot Mess: puddles burn (without setting off Mucus + Acid) and boil over, harder per enemy stuck. Ewww, Gross + Unwanted Contact: bundles crackle and the tape jumps on a death. Chest Burster + Sister Cousin: siblings infect, allies spit siblings and burst into more. Laser + Red Flagship: a 3-beam Static fan behind the target. Rent Free + Panic Button: every 4th hit possesses; possession jumps on death with a pulse. Maximum Gains + Enzyme Sneeze: close pellets pump an enemy until it ruptures in an acid cone. Nervous Wreck + Panic Button: snaps fill a meter round you; full, a meltdown throws and stuns. Red Flagship + Soulmate Signal: a live beam tethers you to each twin. wfusion.js keeps only the offer and merge (wfProc removed). Sim (400 HP crowd, 10 s, fused vs apart): 1.25x (Soulmate tether, Family Ties) to 2.4x (Rent Free).
- Save data: none.
- Hooks: none in shared files (hookOn proc, kill, tick; wraps modDraw).
- Risk: balance of all ten pairs; 20 more TODO_COPY placeholders (wf_<id>_name / _desc), so the Claude-drafted names of pairs 1 to 16 are gone until the user writes them.

### 2026-10-27 Transforming fusions (v10.185)
- Systems: wfusion, wfusion2 (new), weapons
- Files: wfusion2.js (new), wfusion.js, index.html, tests/wfusiontest.js, ARCHITECTURE.md
- What: five weapon fusions now change how the weapon plays instead of adding a small proc. Nuclear Family pair: Standard Issue homes and pierces, and its kills release generations of homing siblings. Biological Clock pair: drawn countdowns whose Bleed blasts chain through the crowd. Static Cling pair: Blowing Bubbles feeds one storm bubble that drifts onto the crowd, zaps and bursts. Nest Egg pair: vanishing leaves a decoy egg that lures, then explodes and Fears. Nappy Blowout pair: mine blasts throw enemies at your next mine, which chains and grows. Their old powers are removed from wfusion.js. Sim (400 HP crowd, 10 s, fused vs apart): about 1.6x to 2.4x damage.
- Save data: none.
- Hooks: none in shared files (hookOn fire:after, fire, kill, proc, tick; wraps peekFire, toothLure, detonateMine, modDraw).
- Risk: balance of the five pairs (they hit harder than the old fusions); 10 open TODO_COPY placeholders (wf_<id>_name / _desc) show as raw ids on the fusion card and fused weapon name until written.

### 2026-10-27 Field Guide rebuilt for v10 (v10.185)
- Systems: help (Field Guide, damage type card)
- Files: codex10.js (new), index.html, ARCHITECTURE.md, tests/codex10test.js (new), tests/codexsamples.js
- What: the Field Guide lists only what a v10 run can meet. RULES: the seven v10 damage types with their bar or status (GLOSSARY text), the 21 v10 reactions (? until set off), defences, attack types and combo twists on live type pairs; the v9 reaction list, retired types and Rewind are gone. ENEMIES lists only enemies that can still spawn; BOSSES shows the v10 strength and signature lines; SECRETS drops five unreachable ones; MUTATIONS lists the sperm passive cards the draft deals (the 61 genes.js mutations can no longer be had); SEQUENCES no longer repeats each trait. The damage type card uses the same v10 table. 14 TODO_COPY placeholders (type blurbs, new section titles and hints).
- Save data: META.cdxMut added (mutation card ids taken, for the MUTATIONS tab).
- Hooks: none in shared files (replaces UI.codexHtml and INSPECTOR.elem; wraps each live mutation card's apply).
- Risk: other branches editing ui.js codexHtml will no longer show (codex10.js replaces it). Mutation counts start at 0 for everyone (no history before META.cdxMut).

## v10.184 (versionCode 463): 2026-10-27 Merge of `ccr-b9c3ea28-jvf30l` (pacing: intensity meter), `ccr-2a5c5bea-k3lnlv` (late-wave GC churn, acid after-burn) and `ccr-15e338c4-03tzdb` (test fixes, Enzyme Sneeze damage)

### 2026-10-27 Merge fixes (v10.184)
- Systems: weapon base stats, tests
- Files: statup.js, tests/spslicetest.js
- What: Little Prick's damage correction 0.85 to 0.95 (statuptest read 0.80 of its old output after the merge, at the floor; now 0.85). spslicetest's Fever Pitch check hits twice: one hit takes at most half an enemy's health, so the kill was left to a burn tick and failed about 1 run in 10 (on main too).
- Save data: none.
- Hooks: none.
- Risk: Little Prick hits about 12% harder per shot.

### 2026-10-27 Intensity meter replaces the clock cycle (v10.183)
- Systems: pacing
- Files: pacing.js
- What: Free modes now run on an invisible intensity meter (Left 4 Dead style) instead of a fixed 75 s loop: it fills from enemies dying within 260 units of you (0.012 each, elites 0.04), from hits you take (0.6 x the share of max HP lost) and slowly with time (0.01/s); the spawn rate is 1x to 1.3x as it fills, then a 4 s peak, then a 0.6x relax while it drains at 0.06/s until it is under 0.3 (or 40 s). A boss death jumps straight to the breather. `PACING.mode = 'clock'` restores the v10.182 loop. Telemetry: `G.stats.peaks`.
- Save data: none.
- Hooks: hookOn hurt from pacing.js (the kill and tick hooks already existed).
- Risk: a busy build (many kills near you) peaks about every 40 s, a kiting one about every 85 s; the Race sim is in NOTES.md.

### 2026-10-27 Pacing: intensity cycle, wave shape, screens in lulls (v10.182)
- Systems: pacing (new), engine (spawn rate), wave-mode, reward director
- Files: pacing.js (new), game.js, waves.js, campaign.js, director.js, index.html, ARCHITECTURE.md
- What: Free modes (Race, Endless, race to the egg) swell and lull on a 75 s cycle (0.6x for 12 s, then a ramp from 0.85x to 1.3x; the average is 1.0) with a 10 s lull after every boss death. Wave feeds are a burst, a steady middle and a final surge instead of flat; the rest after a wave clear is 5 s (was 1.6 s). The Reward Director opens screens at half its gap in a lull and 15 s later at a peak (unless three or more rewards wait). `PACING.on = false` restores the old flat behaviour. Telemetry: `G.stats.lullT`, `lullScr`.
- Save data: none.
- Hooks: game.js update spawn rate -> paceK; waves.js waveSpawn and campaign.js campSpawn feed -> paceShape; waves.js waveClear -> PACING.rest; director.js dirGate -> paceGap and lullScr. hookOn tick and kill from pacing.js.
- Risk: balance in the Race and Endless shifts within a cycle (peaks are 30% denser than before); 20-wave runs are about 1 minute longer from the rest; the bot sims are in NOTES.md.

### 2026-10-27 Late-wave hitches and acid after-burn (v10.182)
- Systems: render (enemy shapes, tails, terrain outlines), terrain (drift, acid, ambient crowd), Membranes (foemem), tests
- Files: terrain.js, render.js, foemem.js, tests/sim/framewave.js (new), ARCHITECTURE.md
- What: the late-wave stutter in the v10.180 log (#24, wave 20 win: lows of 6 to 15 fps, frames up to 158 ms) traced to garbage-collector pauses, not one slow system: the game made about 1.2 MB of garbage a frame. Terrain neighbour steering now looks only in nearby grid cells (was all pairs, 150 KB a frame), and enemy shapes, tails, terrain outlines and Membranes draw from reused buffers instead of fresh point arrays; the ambient crowd's grid reuses its cells. Same scene: 1212 -> 859 KB a frame (29% less); drawing is pixel-identical. Acid's after-burn now lasts 1.5 s per second you were in it (up to 2.5 s): a brush used to cost the full 2.5 s, so "Acid burn" out-hurt the acid itself (#23: 43 of 51 damage taken by wave 3).
- Save data: none.
- Hooks: none (new helpers terrainNTurn in terrain.js; SHB, shbRound, shbSmooth, TAIL_L/TAIL_R in render.js).
- Risk: terrain pieces see a neighbour up to 0.25 s late after it drifts into a new cell (the grid's regrid time); the phone's fps gain is unmeasured (the headless bench shows the garbage drop, not phone GC pause length).

### 2026-10-27 sivtest and statuptest green; Enzyme Sneeze damage corrected (v10.182)
- Systems: weapon base stats, tests
- Files: statup.js, tests/sivtest.js
- What: Enzyme Sneeze's reshaped base (faster fire, bigger magazine) never got its damage correction and dealt 1.47x its old output on dummies (its extra hits set off Corrosive Splash far more often); ST_W.acro_spray dmgK 0.5 brings it to 1.16x. sivtest stops at tier 3: the Lv 10 mastery tier is gone since weapons stop at Lv 9 (v10.148), and it now checks no tier 4 is offered.
- Save data: none.
- Hooks: none.
- Risk: Enzyme Sneeze (Acrobat sample) hits for half what it did per shot; its total output is near its pre-reshape level.

### 2026-10-27 Three stale tests green again (v10.182)
- Systems: weapon levels, tests
- Files: wmods.js, tests/lasershot.js, tests/v10test.js
- What: wmods.js's hit and tick listeners are labelled 'wmods:hit' / 'wmods:tick' (hookstest read the bare 'wmHit' / 'wmTick' as missing functions); lasershot and v10test expect the v10.173 opening draft (the sample's three weapons, SAMPLE_KIT) instead of four cards. No change in play.
- Save data: none.
- Hooks: none (two hookOn labels renamed in wmods.js).
- Risk: none.


## v10.181 (versionCode 460): 2026-10-27 Orbiting bodies look like the weapon's shots (merge of `ccr-15e338c4-03tzdb`)
- Systems: modifiers, rendering
- Files: modifiers.js, render.js, typelook.js
- What: Orbiting (Hangers-On) bodies on non-beam weapons now draw as the weapon's own projectile (style, colour, size and damage-type look) instead of plain dots; `orbShots()` hands display-only copies to the shot draw loop and tlShots. Beams keep their dots.
- Save data: none.
- Hooks: render.js shot loop and typelook.js tlShots iterate orbShots() instead of G.proj.
- Risk: none to balance (display only); other branches editing the render.js shot loop's first line will conflict.


## v10.180 (versionCode 459): 2026-10-26 Race course level (merge of `ccr-a4871635-2p0jtu`)
- Systems: race course (new), campaign, autorun steering, ui (end screen, sample cards), render (HUD track), tests
- Files: course.js (new), levels.js, game.js, render.js, ui.js, samples10.js, index.html, tests/coursetest.js (new), tests/run.sh
- What: a new mode `s011` on each sample's mode screen: a straight obstacle course (slalom, spit swamp, a fork with a plaque shortcut, sweepers, valves, boost pads) raced against five rivals after a 3-2-1 countdown. Cross the finish line first and alive to win; a rival over it first ends the run. All player-facing text is TODO_COPY placeholders.
- Save data: META.courseBest added (best winning time, seconds).
- Hooks: levels.js lvTick -> courseTick, lvWin -> courseWin, drawLevelHud -> courseHud, drawLevel -> courseFloor (in place of the tonsil stone), drawLevelOver -> courseDraw, drawLevelMap -> courseMap; game.js autoSteer -> courseSteer; render.js drawHud -> courseTrack; ui.js showGameOver title -> courseTitle, body -> courseEulogy; samples10.js s10Modes card. course.js wraps lvSlow.
- Risk: sample id s011 (s010 is the Sandbox). Balance unsimmed for humans: autorun alone rarely wins.

## v10.179 (versionCode 458): 2026-10-26 Merge of `ccr-3feb4203-x7mgyg` (Bigger Membrane drawn wider; weapon level catch-up and kill bar leaks)

### 2026-10-26 Weapon kill bars stop leaking kills (v10.177)
- Systems: weapon levels
- Files: wmods.js
- What: kills keep banking while a weapon's level screen waits (wave mode holds it to the wave's end; up to one bar carries over), a kill with no weapon (burn or bleed ticks, reactions, arcs) goes in full to the last weapon that hit the enemy within 3 s, and Tapeworm turret kills count for their weapon. Probe: over half of some weapons' kills were being dropped while their screen waited.
- Save data: none.
- Hooks: none in shared files (wmods.js hookOn('hit:late', 'wmHit') replaces the 'proc' listener; hookOn('tick', 'wmTick') tags turret src.wmW).
- Risk: weapons level faster mid-run (lead weapon Lv 6 to 7 by wave 10, was 4 to 6); wave20 mortal x6 bot wins 3/6 vs 1/6.

### 2026-10-26 Milder weapon level catch-up (v10.176)
- Systems: weapon levels
- Files: wmods.js
- What: catch-up toned down at the user's request: assists 0.5 to 0.3 of a kill, catch-up +50% to +35% per level behind, WM.kg 0.35 to 0.42 (316 kills from Lv 1 to Lv 9; was 352 before v10.175, 285 in it). Not simulated.
- Save data: none.
- Hooks: none.
- Risk: untested values; v10.175's milder sim variant (assist 0.3, catchK 0.35, kg 0.5) won 4/8.

### 2026-10-26 Weapon levels catch up (v10.175)
- Systems: weapon levels
- Files: wmods.js
- What: weapon kill bars now also fill from assists (half a kill for any weapon that hit the enemy in the last 3 s) and catch up (+50% kill credit per level below your highest weapon); the kill curve is gentler (WM.kg 0.5 to 0.35: 352 to 285 kills from Lv 1 to Lv 9).
- Save data: none.
- Hooks: none in shared files (wmods.js hookOn('proc', 'wmHit')).
- Risk: weapons reach Lv 9 sooner; wave20 mortal x8 bot wins 6/8 with it, 6/8 without (no measurable difficulty shift).

### 2026-10-26 Bigger Membrane draws bigger (v10.174)
- Systems: defence (pdef), stamina
- Files: stamina.js
- What: armourRing now sizes the drawn Membrane bubble from bodymods.js bubbleR(), so Bigger Membrane's 60% wider hitbox is also 60% wider on screen (before, only the invisible hitbox grew).
- Save data: none.
- Hooks: none.
- Risk: none (radius unchanged without the card).
## v10.174 (versionCode 453): 2026-10-26 Late-Race frame rate: quality step 5 thins the crowd, fewer draw calls at the floor
- Systems: render, quality (game.js QUAL), enemies (foemem)
- Files: game.js, render.js, foemem.js
- What: every long Race on the phone (runs 2, 3, 4, 18) fell to 25 to 45 fps from minute 6 with the lowest quality step already reached. A minute-8 frame held 100 enemies, 100 bullets, 100 particles and 50 to 90 puddles: about 1200 canvas calls, 50 gradient uploads and 70 to 100 composite switches a frame (each one flushes the GPU batch). Now: (1) quality step 5, the last resort outside wave mode, drops the crowd to 55% (CROWD.kLow; fewer, tougher enemies with the same XP a minute through the existing spawnK/toughK/crowdK path; the run log shows it as q0c); (2) at steps 3 and 4 every common enemy draws plain (halo and detail off), enemy Membranes draw as a flat skin and rim (two gradients a Membrane a frame gone), step 4 has 70 particles and no scorch marks; (3) at every step, pool gradients are built once per pool (unit radius, scaled under the path) and glowing pools draw in one additive pass. Headless minute-8 frame at step 4: paths 913 to 548, gradients 39 to 13, draw 11.7 to 9.5 ms; step 5 holds 60 to 75 enemies instead of 100.
- Save data: none (sd_qual still restores at most step 4).
- Hooks: none.
- Risk: at step 5 the Race crowd is thinner and tougher per enemy (balance unchanged in total, as the 23 Oct CROWD.k cut); a phone that never slows never sees it. Yeast infection ruled out as a cause (a full colony costs the same as the enemies it replaces).

## v10.173 (versionCode 452): 2026-10-26 Opening draft deals the sample's three; newfeattest green
- Systems: samples (start draft), tests
- Files: samplekit.js (wraps s10Start; Acrobat kit added), tests/samplestest.js, tests/newfeattest.js
- What: the opening Weapon Draft dealt four (samplestart.js: two best fits plus two random); it now deals the sample's own three (SAMPLE_KIT), in a random order, for all nine samples. newfeattest checks v10's statuses (Corrosion bar, Charge, Bleed, Snare; Force has none), drops the v9 Bloody Show reaction (gone since v10.136) and checks that the unlocked v9 Feats with a v10 card are drafted; its summary no longer prints an empty fails list (run.sh reads any 'fail').
- Save data: none
- Hooks: none in shared files.
- Risk: S10_FIT (samplestart.js) no longer decides the opening offer.

## v10.172 (versionCode 451): 2026-10-26 Puddle Jumper card line
- Systems: feats (copy)
- Files: mobfeats.js
- What: the Puddle Jumper card's description (was TODO_COPY:feat_puddle_jumper_does), Claude-drafted at the user's request: "Your puddles are connected. Nobody asked how. Swim into one and you come out of your furthest; tap to go at once. You leave a Mucus splash and a fresh puddle behind."
- Save data: none
- Hooks: none
- Risk: none (text only).

## v10.171 (versionCode 450): 2026-10-26 Three weapons per sample, fitted to the character
- Systems: samples, race (kindred rescues), stats
- Files: samplekit.js (new), kindred.js, xpgems.js, index.html, ARCHITECTURE.md, tests/weapons24test.js
- What: one table (SAMPLE_KIT) gives every sample exactly three weapons. Ordered Online: Blowing Bubbles, Nappy Mines, Laser (Hot Mess out; it had four). Redtail: Unwanted Contact, Hot Mess, Spark of Life (shared with the Acrobat), in place of Sister Cousin and The Runs (a passive now; it had two). Not of This World: Family Ties, Soulmate Signal, Sister Cousin, in place of There Is No Spoon (a passive now). The others are unchanged. Rescue cards read the same list. Gravity Well and Trail modifier cards now bank Pickup Range and Gem Drift (statuptest: every stat has a modifier way in).
- Save data: none
- Hooks: none in shared files (kindred.js kinCards reads S10_BY[...].weapons).
- Risk: Redtail and Not of This World start differently; Hot Mess is no longer an Ordered Online start.
- Tests after the v10.170 merge: full suite 135 of 139; statuptest (Enzyme Sneeze, known), sivtest (red on main before), pdeftest (flaky on main before, about 1 in 3), wup6test (passed on rerun).

## v10.170 (versionCode 449): 2026-10-26 One session branch merged: the Tackle Box (weapons, targeting, Feats) split from the BUILD tab (autorun, Genome, upgrades, stats)
- Merged: `ccr-b96d97ce-vqktjz` into main at v10.169 (only the APK conflicted: rebuilt; both sides had shipped a v10.169, so this build is v10.170).
- Systems: ui (Tackle Box Loadout tab, pause BUILD tab).
- Hooks: none in shared files (pagesplit.js replaces bpHtml, wraps loadoutHtml and UI.renderPause).

### Rescue weapon draft: three cards (v10.170)
- Systems: race (kindred rescues), draft
- Files: kindred.js (KIN.cards), tests/kindredtest.js
- What: a sperm rescue in the race dealt the rescued sample's three weapons plus one of your own sample's starters (four cards). It now deals three: one of your own sample's starters and two of the rescued sample's, picked at random (all three of theirs when none of yours is left).
- Save data: none
- Hooks: none
- Risk: a rescue no longer always offers every weapon of the rescued sample.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Tackle Box and BUILD tab split by job (v10.170)
- Systems: ui (Tackle Box Loadout tab, pause BUILD tab)
- Files: pagesplit.js (new), index.html, ARCHITECTURE.md, tests/pagesplittest.js (new), tests/buildbtntest.js
- What: the Tackle Box is weapons, targeting and Feats: Autorun leaves it; each weapon row gains its branch, modifiers with rank pips, slots used and weapon mutations; Feat rows show level pips and forks taken; a Next panel (weapon upgrade, weapon slot) follows the Feats. The BUILD tab (sperm key) opens with Autorun as two columns of compact rows (current mode's full hint below), then Genome rows with pips, Upgrades (slotless cards held, with pips), Stat bonuses and the non-weapon Next lines. Hold a Genome or Upgrades row for its card.
- Save data: none
- Hooks: none in shared files. Replaces buildpanel.js bpHtml (statup.js's Stat bonuses wrap is folded in); wraps loadout.js loadoutHtml and ui.js UI.renderPause.
- Risk: a branch that wraps bpHtml before this loads loses its wrap (only statup.js did); the Loadout post-process keys on .lomv, .low, [data-go] and .lon in loadout.js.

## v10.169 (versionCode 448): 2026-10-26 One session branch merged: Orbiting takes Extra, Rapid Fire and Charged with magnetic Homing; wave mode holds every upgrade until the wave is clear; tapping an enemy lists its Active effects
- Merged: `ccr-1b7c90aa-a9892t` (only the version lines and the APK conflicted: rebuilt). Its own builds v10.162 to v10.164 never reached main.
- Systems: Delivery forms (Orbiting), modifiers, waves, inspect.
- Hooks: hookOn('tick', 'inspect:foe') in inspect.js; none in shared files.
- Merge fix: batchcheck now expects a boss reward to wait for the wave clear. statuptest and sivtest fail on main before this merge too.

### Folded from ccr-1b7c90aa-a9892t: 2026-10-26 Wave mode holds every upgrade until the wave is clear; tapping an enemy lists its Active effects (v10.164)
- Systems: waves, inspect
- Files: waves.js, inspect.js, tests/inspecttest.js
- What: in wave mode nothing opens during a wave, including boss rewards, fusions and DNA drops that used to open at once ('now' requests); they open as soon as the wave is clear. An enemy's tap card now has an Active effects row: Burning, Bleeding, Snared, Charged, Corroded, Stunned, Possessed, Conjoined, the older statuses (Sick, Melting, Snotty/Glued, Lubricated, Soaking wet, Cursed), a Due Date countdown, Red Tape, and build-up bars (Corrosion, Poise, Burn bar, Parasite bar) with time left, damage a second and the weapon that caused a damage over time; a chip opens that term's Field Guide line; at HALF inspect speed it refreshes 4 times a second.
- Save data: none.
- Hooks: hookOn('tick', 'inspect:foe') in inspect.js.
- Risk: a boss's relic now waits for the wave's stragglers to die; campaign or tutorial code that relied on 'now' opening mid-wave would wait too.

### Folded from ccr-1b7c90aa-a9892t: 2026-10-26 Orbiting: Extra, Rapid Fire, Charged and magnetic Homing (v10.162)
- Systems: Delivery forms (Orbiting), modifiers
- Files: delivforms.js, tests/delivtest.js
- What: on an orbiting projectile or contact weapon, Extra Projectiles adds 1 / 2 / 3 bodies, Rapid Fire spins the ring 30 / 60 / 100% faster, and Charged makes bodies hit for a quarter while they glow, then each blasts (radius 40, twice a body hit) every 4 / 3.5 / 3 s. Homing no longer sends a body off to chase: each body bends towards the nearest enemy within 120 (up to 25 / 40 / 55), so the ring warps like a magnet is pulling it. Beam rings are unchanged. Link already joined the bodies.
- Save data: none.
- Hooks: none (modOrbit wrapper in delivforms.js now also runs for Extra, Rapid Fire and Charged: xdOrbBodies).
- Risk: Orbiting with Charged hits softer between blasts (balance unsimulated); MOD_DEAD not regenerated (these three were already live combos). Card text for the four orbit lines written on request (v10.163).
## v10.168 (versionCode 447): 2026-10-26 One session branch merged: sperm key matches the Tackle Box key, bigger XP granules with no drift in waves, Pickup Range and Gem Drift cards
- Merged: `ccr-b96d97ce-vqktjz` (fast-forward, no conflicts).
- Systems: hud, pickups, render, stats, draft.
- Hooks: game.js updatePickups -> xpDrift; render.js gem pass reads XPG; style.css and eink.css list #spermBtn beside #armBtn.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 XP granules: bigger, no drift in waves, pickup stat cards (v10.168)
- Systems: pickups, render, stats, draft
- Files: xpgems.js (new), game.js, render.js, index.html, ARCHITECTURE.md, tests/xpgemstest.js (new)
- What: XP granules draw 1.8x bigger with a white halo. Loose granules no longer drift to you in wave mode (was from 650 px); the race keeps a shorter drift (700 px at 110, was 1600 at 190). The 105 px magnet is unchanged. Two new stat cards: Pickup Range (+15% magnet a step) and Gem Drift (+100 px of drift reach a step).
- Save data: none
- Hooks: game.js updatePickups -> xpDrift (one line); render.js gem pass reads XPG (size and halo).
- Risk: slower levelling. Bot sim, Petri Dish, mortal, 6 runs each (old drift via --pre): level at wave 10 mean 19 (old 21); mean wave reached 14.3 (old 13.7), wins 1 of 6 (old 2 of 6), inside run-to-run noise.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Sperm key matches the Tackle Box key (v10.167)
- Systems: hud
- Files: buildbtn.js, style.css, eink.css
- What: the sperm HUD key takes its look from the same rules as the Tackle Box key (#spermBtn listed beside #armBtn in style.css and eink.css: 3 px themed border, corners, colours, Immersive translucency, landscape size), and its icon is a solid silhouette like the Tackle Box one. buildbtn.js keeps only its portrait Immersive position.
- Save data: none
- Hooks: none
- Risk: a branch restyling #armBtn in style.css or eink.css should add #spermBtn to new rules too.

## v10.166 (versionCode 445): 2026-10-26 One session branch merged: rank pips on loot cards, stat cards roll a rarity, sperm key to the BUILD tab, BUILD modifier pips, Puddle Jumper portals
- Merged: `ccr-b96d97ce-vqktjz` (fast-forward, no conflicts).
- Systems: reward cards, draft, stats, hud, pause (build panel), feats (mobility).
- Hooks: none in shared files (wraps UI.renderLootCards, rwDelta; adds #spermBtn before #moveBtn).
- Open: TODO_COPY:feat_puddle_jumper_does. newfeattest fails on main (mosquito and others: nostatus), before and after this merge.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Puddle Jumper: your puddles are portals (v10.166)
- Systems: feats (mobility)
- Files: mobfeats.js, tests/puddlejumptest.js (new)
- What: while you hold Puddle Jumper, swimming into any puddle you made (not The Runs' trail or a Hotbox) pops you out of your most distant puddle, 2.5 s apart, no stamina; portal puddles get a faint dashed ring. A tap jumps to the most distant puddle at once; with none, the old backstab or safe-spot jump. Every jump still leaves a Mucus splash and a puddle (a way back).
- Save data: none
- Hooks: none in shared files
- Risk: puddle-heavy builds can chain jumps every 2.5 s (PJ.gap); the Lv 5 Long Jump fork now only lengthens the no-puddle fallback. New placeholder TODO_COPY:feat_puddle_jumper_does. newfeattest fails on main already (mosquito and others: nostatus).

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 BUILD tab: modifier ranks as pips (v10.165)
- Systems: pause (build panel)
- Files: buildpanel.js, style.css, tests/buildbtntest.js
- What: each weapon's modifiers on the BUILD tab are now one tag each with their rank as pips out of 3 (a 4th, ringed, once mastered) and the branch taken, then the slot count, in place of one comma list with roman numerals.
- Save data: none
- Hooks: none
- Risk: none

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Sperm button: shortcut to the BUILD tab (v10.164)
- Systems: hud, pause
- Files: buildbtn.js (new), index.html, tests/buildbtntest.js (new)
- What: a sperm-icon HUD key left of RUN; one tap pauses on the BUILD tab (the pause button still opens on YOU). In the portrait Immersive HUD it takes Rewind's spot, moving one slot left while Rewind is on.
- Save data: none
- Hooks: none in shared files (adds #spermBtn before #moveBtn at load; calls UI.togglePause, UI.renderPause).
- Risk: another branch that moves RUN or Rewind in eink.css would need this key's left offset moved too.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Stat cards roll a rarity (v10.163)
- Systems: draft, stats
- Files: wmods.js, tests/statrartest.js (new)
- What: level-up and DNA strand stat cards (Crit Chance, Max Health and the rest) each roll a rarity like other loot (skipped-box floors count), and rarer ones give more: Common 1.5 steps, Uncommon 2 (the old fixed card), Rare 3, Epic 4, Legendary 6 (WM.statSteps). The average deal stays about 2 steps.
- Save data: none
- Hooks: none
- Risk: stat power per run is about the same on average but swingier; a Legendary Bullet Damage card is +18%.

### Folded from ccr-b96d97ce-vqktjz: 2026-10-26 Rank pips on loot cards (v10.162)
- Systems: reward cards, draft
- Files: rankpips.js (new), index.html, tests/rankpipstest.js (new)
- What: a loot card that ranks up something you already hold (defence, modifier, Feat, mutation, health/vitals/perk and v9 upgrade cards) shows "Lv N" (the rank after taking it) and a row of pips under its title: held ranks filled, the new one ringed and pulsing, ranks still to come hollow. New cards show none. The Runs' upgrade card also shows its next rank's numbers (Area, Lasts, Damage before → after) in the Feat card's "Next level" line.
- Save data: none
- Hooks: none in shared files (wraps ui.js UI.renderLootCards, after dsheads.js, and rewardui.js rwDelta).
- Risk: a card family that reports its rank some new way gets no pips (falls back to parsing "Rank r > r+1 of m" in the sub line).

## v10.161 (versionCode 440): 2026-10-26 Two session branches merged: weapon fusion pairs 9 to 16 and the Spoon pairing, Little Jacob, the material skin Feat, The Runs rolling its type, written copy; race egg fight fixes
- Merged: `ccr-1ac49716-yz41yr` (clean), `ccr-b6a373a9-q8ofbd` (only the APK conflicted: rebuilt).
- Systems: weapons (fusion, Sister Cousin), Feats, sperm passives, ui copy (ccr-1ac49716); race, autorun steering, targeting, egg, kindred rescues (ccr-b6a373a9).
- Hooks: game.js autoSteer -> raceEggSteer, acquire -> raceEggPick, eggTick reads RACE15.touch, shootPattern x e.campK (ccr-b6a373a9); none in shared files from ccr-1ac49716.
- Merge fix: matskin.js and wfusion.js hook names made globals (hookstest).

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Open copy written (v10.160)
- Systems: ui (card copy): Feats, sperm passives, weapons (fusion), Little Jacob
- Files: matskin.js (MS_TEXT), runstype.js (RUNS_TEXT), wfusion.js (WF_TEXT pairs 9 to 16, WF_SB.text), ljacob.js (LJ_TEXT), tests/runstypetest.js
- What: at the user's request ("write the open copy yourself"), Claude wrote the 33 open strings: the material skin Feat (Petrified; forks Chitin, Kidney Stone, Enamel, Latex), The Runs' seven per-type card lines, fusions 9 to 16 (Chain of Custody, Family Reunion, Red Alert, Night Terrors, Gym Flu, Fight or Flight, Mixed Signals), the Spoon pairing float and Little Jacob's squeal. No TODO_COPY left in this branch's feature files.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 There Is No Spoon + Blowing Bubbles as a passive pairing (v10.159)
- Systems: weapons (fusion), sperm passives (There Is No Spoon), tests
- Files: wfusion.js (pair 13 at the end), tests/wfusiontest.js
- What: holding the There Is No Spoon passive with Blowing Bubbles at HUD Lv 3 pairs them (no merge, no mount): every bullet Spoon fires back traps what it hits in a bubble (1.5 s Snare; bosses only slowed). A float says when it switches on (TODO_COPY:wf_spoonbub_on).
- Save data: none.
- Hooks: none in shared files (hookOn proc 'wfSpoonProc' and tick 'wfSpoonTick'; another modDraw wrap).
- Risk: none beyond balance.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Fusion pairs 9 to 16 (v10.158)
- Systems: weapons (fusion), tests
- Files: wfusion.js, tests/wfusiontest.js (7 new checks; the lardmine check pauses both weapons, it was flaky)
- What: seven more fusions: Ewww, Gross + Unwanted Contact (zaps arc through a taped bundle), Chest Burster + Sister Cousin (risen allies spit siblings), Laser + Red Flagship (the Laser's target arcs Static to 2 neighbours), Rent Free + Panic Button (possessed enemies pulse), Maximum Gains + Enzyme Sneeze (close hits splash acid), Nervous Wreck + Panic Button (snaps end in a pulse), Red Flagship + Soulmate Signal (twins fire Red Flagship beams). Pair 13 (There Is No Spoon + Blowing Bubbles) is parked: Spoon is a sperm passive now, never a weapon. Names and card text TODO_COPY.
- Save data: none.
- Hooks: none.
- Risk: weapons in two pairs (Panic Button, Red Flagship, Unwanted Contact, Sister Cousin, Blowing Bubbles) fuse with whichever partner reaches Lv 3 first.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Little Jacob (v10.157)
- Systems: weapons (Sister Cousin), modifier masteries, tests
- Files: ljacob.js (new), index.html, tests/ljacobtest.js (new), MODIFIER_MATRIX.md (5.4b), ARCHITECTURE.md
- What: Sister Cousin with both the Charged and Exploding Rounds masteries sends out Little Jacob every 8 s: a fat sibling that waddles to the crowd and explodes (Blood, radius 140, 8x Sister Cousin's damage, bosses half). Your other weapons' shots that touch him feed the blast (x1.25, capped at 4x base); shots near him bend in. Squeal text TODO_COPY:lj_squeal.
- Save data: none.
- Hooks: none in shared files (hookOn tick 'ljTick'; wraps f10Draw).
- Risk: needs two weapon masteries (Extra Mastery), so it is rare; the blast is big by design and untested for balance.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 The material skin Feat (v10.156)
- Systems: Feats (v10), tests
- Files: matskin.js (new), index.html, tests/matskintest.js (new), tests/featstest.js (starting pool 21, an entry for it), FEATS.md (F18), ARCHITECTURE.md
- What: a new Feat in the starting pool: 4 s of 60% less damage, rolling on momentum instead of swimming, bowling enemies over by speed; level 4 drags enemies into your path; forks Chitin / Calcified and Enamel / Latex. Name and card text TODO_COPY (MS_TEXT).
- Save data: none.
- Hooks: none in shared files (hookOn tick 'msTick2' and hurtMul 'msHurtMul'; wraps nfSpeed and f10Draw).
- Risk: the Feat starting pool grows to 21; autorun steering while rolling is sluggish by design.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 The Runs rolls a damage type per card (v10.155)
- Systems: sperm passives (The Runs), draft, tests
- Files: runstype.js (new), spassives.js (spRunsSlot reads G.spRunsType), index.html, tests/runstypetest.js (new), SPERM_PASSIVES.md, ARCHITECTURE.md
- What: each new The Runs card rolls one of the seven damage types (weighted towards your weapons' types and the sample's primary); picking it fixes the trail's type for the run and upgrade cards keep it. Extras: Force shoves enemies aside, Static arcs between trail pieces, Blood heals you while enemies stand in it, Parasite drags enemies along the trail away from you. Card text TODO_COPY:sp_runs_<type>_desc.
- Save data: none (run state G.spRunsType).
- Hooks: none in shared files (hookOn tick 'runsTick'; wraps cardOpt).
- Tests: runstypetest, spslicetest, mutstest, drafttest pass; spfulltest fails the same way on main (sp_aim list, Chain Letter).
- Risk: The Runs no longer follows the sample's type; balance of the four extras untested.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Race egg fight: egg health x0.03, autorun holds range and clears bodyguards
- Systems: race (race15), autorun steering, targeting, egg
- Files: race15.js, game.js (autoSteer, acquire, egg buds), boss10.js (V10_DIFF.egg)
- What: the egg's health is V10_DIFF.egg 0.03 (was 0.5: about 3.8 million at 15:00, so no build could break it before a rival's fixed chip did). Once woken, autorun holds a ring at 80% of its weapons' reach inside the healing glow (raceEggSteer), the egg pull uses the homing goal cap (4, the 1.5 cap had cut it back under the dodging), and while 2+ of the egg's bodyguards are within 260 px only 20% of target picks go to the egg (raceEggPick).
- Save data: none
- Hooks: game.js autoSteer -> raceEggSteer, acquire -> raceEggPick; egg buds marked e.eggBud.
- Risk: the egg breaks much faster for human players too (the 2.5%-a-second cap still holds it for at least 40 s).

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Race: autorun pulls harder to the egg once it is breakable
- Systems: race (race15), autorun steering
- Files: race15.js, game.js (autoSteer egg goal weights)
- What: autorun's pull to the egg is now RACE15.eggPull (4 before it wakes, 3.5 after; was 1.8 and 1.4), which beat the dodging that kept it 500 to 2,500 px away while a rival broke in. In a probe its damage to the egg rose from about 3k to 115k.
- Save data: none
- Hooks: game.js autoSteer reads RACE15.eggPull.
- Risk: autorun players head into the egg's bullet rings more readily.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Race: swimming into the egg counts from 80 px of its edge
- Systems: race (race15), egg
- Files: race15.js, game.js (eggTick touch radius)
- What: once the egg is breakable, coming within RACE15.touch (80 px, was 14) of its edge wakes it. Autorun circled it just outside the old radius while dodging its rings, so it never started its own egg fight and a rival always won.
- Save data: none
- Hooks: game.js eggTick reads RACE15.touch.
- Risk: the egg fight starts a little earlier for human players too.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Race: Fever Pitch holds 3 min after the egg opens; race boss bullets take RACE.bossHit
- Systems: race (race15), bosses, director (difficulty clock)
- Files: race15.js, game.js (one line in shootPattern)
- What: in a race, enemy damage now holds at its 15:00 level for RACE15.surgeLag (180 s) before Fever Pitch compounds, so the egg fight no longer starts inside the x1.3-a-minute spiral. Race bosses' bullets now take their RACE.bossHit softening (only their contact damage did).
- Save data: none
- Hooks: game.js shootPattern bullet damage x e.campK (set only on race bosses, bosses.js); race15.js wraps dmgMul.
- Risk: the race egg phase and the first four race bosses are easier; Petri Dish, Endless and levels unchanged (raceOn and campK gate both).

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Race: autorun no longer stacks weapons in a rescue's fusion; D2 Sprinter finding (v10.155)
- Systems: race (kindred rescues), tests
- Files: kindred.js, tests/kindredtest.js, tests/sim/race.js
- What: while a rescue's fusion played, the loot state still held the rescue's cards, so autorun's auto-pick took another weapon every 0.7 s past MAX_WEAPONS (a sim got hundreds); picks on the rescue screen are ignored until the fusion closes. race.js now starts as the Baseline sample (no sample meant no rescues, so every past Race sim ran with one weapon) and closes a fusion like a tap.
- Save data: none
- Hooks: none (kindred.js's own UI.pickLoot wrap gains one guard line)
- Risk: none expected; the guard only applies while UI.kinFuse is open on a rescue screen.

## v10.157 (versionCode 436): 2026-10-26 Loot card icons in ink
- Merged: `claude/eager-thompson-eie9mn` (no conflicts).
- Systems: ui, reward cards, pictomap. Files: style.css.
- What: icons on loot cards (pictograms and the line-icon fallback) draw in ink instead of their type or category colour; the rarity chip and damage-type left border keep their colour.
- Save data: none. Hooks: none. Risk: none (CSS scoped to #lootCards .card .cico).

## v10.156 (versionCode 435): 2026-10-26 Queen snack budget starts at 6 and falls (two sessions' cuts no longer stack)
- Systems: bosses. Files: bosssig10_t2.js.
- What: main's v10.154 merge carried both this session's flat cut (3 snacks a cycle) and ccr-b6a373a9's falling budget (6, 4, 2, 1, 1, then none), which stacked to 3, 2, 1, 1, 0 and failed queennomstest. The falling budget from 6 stands on its own (42% of her health over a whole fight, 18% in the first cycle).
- Save data: none. Hooks: none. Risk: the Queen heals a little more in her first two cycles than v10.154 did; the same over a long fight.

## v10.155 (versionCode 434): 2026-10-26 All open copy written; stat cards show before → after
- Merged: `claude/keen-euler-cl2st0` (fast-forward, no conflicts).

### Folded from claude/keen-euler-cl2st0: 2026-10-26 All open copy written; stat cards show before → after (v10.155)
- Systems: ui, feats, weapons, defence, stats
- Files: perks.js, vitals.js, mobfeats.js, passivefeat.js, wfusion.js, wmods.js, rtooth.js, statup.js, v9back.js, tests/statuptest.js
- What: every TODO_COPY that reached the screen now has Claude-drafted text (user asked: "write copy for all missing copy"): the 14 perk and 9 vitals cards (PK_TEXT, VT_TEXT), Brave Phase and Puddle Jumper with their forks, the Passive Feat slot and its two aura Feats, the 8 weapon fusions and the fusion screen, the weapon modifier screen heading and stat cards, Reverse Tooth Fairy's TEETHING float. Stat cards show your current value and the value after taking them (statup.js stNow/stDelta: "Crit Chance 5% → 8%"), as does the stat line under modifier cards; v9 ranked upgrades from rank 2 show each changing number as before → after (v9back.js v9Delta: "take 10% → 20% less damage").
- Save data: none.
- Hooks: none.
- Risk: copy is a first draft for the user's read-through. stLine's format changed (holdcopy.js "Also:" line uses it). statuptest's Enzyme Sneeze dps ratio fails on main too (not from this change).

## v10.154 (versionCode 433): 2026-10-26 Five session branches merged: weapon fusion and the Passive Feat slot, slotless draft cards, weapons level from their own kills, Queen snack cap, combat overrides on the event hub
- Merged: `ccr-1ac49716-yz41yr`, `ccr-b6a373a9-q8ofbd`, `ccr-c2f81cd0-9wox5o`, `claude/practical-brahmagupta-ry2k05`, `claude/keen-archimedes-9okpqe`. Conflicts: version files, APK, ARCHITECTURE.md script order, NOTES.md bullets, index.html script tags (wmods then passivefeat), game.js damageEnemy (event-hub wrapper kept, main's body line kept: phased Ghost Swimmers stay hittable), bosssig10_t2.js Macrophage Queen snacks (both fixes combined: noms 3 a cycle, shrinking 60% each cycle, so 3, 2, 1, 1, then none).
- Risk: the Queen now gets both healing cuts at once and may fall faster than either branch tuned for; weapon fusion (replaces v10 combos) and per-weapon kill levelling landed together untested against each other; built without running the suite (user's request).

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 The Passive Feat slot and aura Feats (v10.154)
- Systems: Feats (aura, new slot), modifier cards (Melee, Orbiting), ui (HUD), tests
- Files: passivefeat.js (new), index.html, tests/passivefeattest.js (new), FEATS.md, ARCHITECTURE.md
- What: a Passive Feat key on the Feat row holds one aura. Melee or Orbiting moves the weapon into it (stays in G.weapons as w.pfAura, weapon key hidden), opens a weapon mount with a draft and drops the modifiers that are dead under that Delivery (the hold view lists them first); Melee and Orbiting are only dealt while the slot is free. New aura Feats Flame Cloak (Fire ring) and Pearl Necklace (orbiting Mucus pearls; eat shots from level 4). The HUD now adds weapon keys past three, so the mounts fusion and auras open show up (they were invisible). Card text TODO_COPY.
- Save data: none (run state G.pf, w.pfAura, w.pfLost).
- Hooks: none in shared files (hookOn tick; wraps modAdd, modOk, hcWeapon, cardOpt, sbSlotMark, comboBonds, modDraw).
- Risk: Melee or Orbiting on a second weapon is no longer possible; tests or sims that stack them change. Aura numbers are first guesses.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Reverse Tooth Fairy (v10.153)
- Systems: weapons (Eggs), modifier cards, tests
- Files: rtooth.js (new), index.html, tests/rtoothtest.js (new), tests/wfusiontest.js (lardmine check tracks the furthest launch: it was flaky), BASE_WEAPONS.md, ARCHITECTURE.md
- What: Eggs switched to Blood can take Homing (plain Eggs still can't). With both, Eggs fires homing teeth instead of dropping eggs; teeth embed and Bleed; a bleeding enemy holding 3 teeth (2 at Homing Rank 3) thrashes for 3 s and bites its mates; bosses never thrash; Homing mastery makes bites plant teeth. Its float text is TODO_COPY:rt_float.
- Save data: none.
- Hooks: none in shared files (hookOn tick and proc; wraps toothFire, modOk, modDraw).
- Risk: thrashing enemies are capped at 6; bite damage is untested for balance.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Fused weapons show their fused name (v10.152)
- Systems: weapons (fusion), ui
- Files: wfusion.js, tests/wfusiontest.js
- What: a fused weapon wears its own name and description (WF_TEXT, TODO_COPY until the user writes them) everywhere the game shows a weapon's name: hold card, Tackle Box, drafts, run summary. It is a per-slot copy of the def over the original (as wRecolour does), re-applied if another system swaps the def; skipped on a weapon carrying Switched at Birth.
- Save data: none.
- Hooks: none.
- Risk: code that compares w.def to WEAPONS[id] by identity misses the fused weapon (acro.js only, whose weapons are in no pair).

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Weapon fusion replaces the v10 combos (v10.151)
- Systems: weapons (fusion, new), combos (retired under v10), draft, ui (HUD slot), tests
- Files: wfusion.js (new), index.html, mobfeats.js (mobTick global, for hookstest), tests/wfusiontest.js (new), tests/combo10test.js, combo3test.js and v9armstest.js (set WF.on = false), ARCHITECTURE.md
- What: two weapons from 8 listed pairs, both at HUD Lv 3, offer a fusion card. Fusing folds the second into the first (it leaves the HUD, keeps firing with its own modifiers and levels with the first), opens a weapon mount with a draft, and adds the pair's power (zapbub, acidmess, sibshot, peekegg, hotcore, lardmine, pinclock, snotfire). Declining asks again after the first weapon's next level. The v10 branch combos and v9 combo partner swaps are off under v10. Names and card text are TODO_COPY.
- Save data: none (run state only: G.wf, G.wfAsked, w.wfIn, w.wfWith).
- Hooks: none in shared files (hookOn tick and proc; wraps v10Loot, draftTitle, availableCombos, wupForkCards, sbSlotMark, modOk, bubblePop, peekFire, detonateMine).
- Tests: after merging main (v10.148), statuptest still fails (Enzyme Sneeze dps ratio 1.48), as it does on main; everything else that was run passes. Merge fix: the v10.150 commit carried conflict markers in moddead.js, meta.js and build.gradle; resolved in the v10.151 commit.
- Risk: weapon count can reach 4 entries (one hidden); systems that count G.weapons see the absorbed weapon. Combo achievements and Field Guide combo pages no longer progress under v10.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Unwanted Contact zip-zap (v10.151)
- Systems: weapons (Unwanted Contact), modifier cards, tests
- Files: zapper.js (new), index.html, moddead.js (s_tesla row), tests/zappertest.js (new), BASE_WEAPONS.md, ARCHITECTURE.md
- What: Unwanted Contact fires one quick spark at one target instead of a 3-jump chain. Ricochet forks it (1/2/3, mastery forks again), Piercing runs a line (1/3/6/12), Homing goes for enemies not yet Charged, Area splashes, Charged Charges in one hit (mastery zaps Charged enemies within 200), Rapid Fire mastery adds a spark. Jumps from Chain Letter or promise cards still chain. Ricochet, Piercing, Homing and Area are offered on it again.
- Save data: none.
- Hooks: none in shared files (wraps v10Fire after laserbeam.js).
- Risk: much less crowd damage at base for Redtail (sims running); Static's own arcs off Charged enemies are unchanged.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Static looks grow with weapon level (v10.149)
- Systems: type looks (typelook)
- Files: typelook.js
- What: Static visuals start as a faint pale crackle at weapon Lv 1 (thin beam, short rare arcs, no glow or forks) and only become full forked lightning near the Lv 9 cap. The level comes from the firing weapon where known (shots, pools, the twin), else your highest-level Static weapon; Static from no weapon of yours (Feats, reactions with no Static weapon held) stays full. Chain bolts in the Static colour flatten, lose forks and fade sooner while weak.
- Save data: none.
- Hooks: typelook.js wraps game.js bolt (Static-coloured bolts only).
- Risk: reaction arcs (Static colour) also look quieter while your Static weapon is low level.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Brave Phase and Puddle Jumper Feats (v10.148)
- Systems: Feats (v10), tests
- Files: mobfeats.js (new), index.html, tests/mobfeatstest.js (new), tests/featstest.js, FEATS.md (F16, F17), ARCHITECTURE.md
- What: two new mobility Feats in the starting pool. Brave Phase: a see-through, untouchable Force dash at 2.6x speed for 0.6 s that hits each enemy you pass through once; autorun aims it down the busiest line, manual steering bends it, walls stop it. Puddle Jumper: a Mucus tap teleport (300) behind the biggest enemy with a backstab when you carry a close-range weapon, else to the safest spot; you leave a Mucus splash and puddle. Card text is TODO_COPY.
- Save data: none.
- Hooks: none in shared files (hookOn tick 'mobTick'; wraps newfeats.js nfSpeed and feats10.js f10Draw).
- Risk: the Feat starting pool grows from 18 to 20, so other Feats are offered a little less often. Brave Phase moves you directly (like f10Lunge), so it ignores swim physics for 0.6 s.

### Folded from ccr-1ac49716-yz41yr: 2026-10-26 Alien damage type renamed Parasite (v10.147)
- Systems: chemistry, damage types, ui (glossary), docs
- Files: 41 web/js files and index.html (text and comments only), glossary.js (the bar regex matches "alien bar" or "parasite bar"), tests (assert messages), tests/tools/guide.js, COMBAT_MATRIX.md, DAMAGE_TYPES.md, redesign docs/CLAUDE.md, CLAUDE.md, STYLE.md, ARCHITECTURE.md
- What: the user renamed the Alien damage type to Parasite (you take enemies over). Every player-facing "Alien" is now "Parasite" ("an Alien" became "a Parasite"; the reaction ALIEN ROT is PARASITE ROT). The internal id stays `soul`, statuses keep their names (Possessed), and the Not of This World sample keeps its name and alien theme.
- Save data: none.
- Hooks: none.
- Risk: text only. Card_Copy_Draft_All.xlsx and GIFT_LINES.md still say Alien (cardvoice.py and giftvoice.py key off the "Not of This World (Alien)" column), as do the other redesign docs; neither puts the word on screen.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Health card trims from the forced-card sim (v10.151)
- Systems: draft cards, healing
- Files: vitals.js, perks.js
- What: Rally wins back 10% of the hit a rank (was 15%) and at most half the hit (was all of it); steady regen 0.2% of max HP a second a rank (was 0.3%); Hex adds 10% damage taken (was 15%). Forced-card sim, 12 runs each against a 3 of 12 baseline: Rally 8 of 12 after the first trim, 5 of 12 with the half-hit cap; regen 4 of 12; Hex 1 of 12 (was 0 of 18).
- Save data: none
- Hooks: none
- Risk: Hex is still a net loss for the bot (it does not value the extra card); a human may rate it differently. Copy briefs for vt_drip, vt_rally and pk_hex must use the new numbers.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Macrophage Queen heals less each cycle; forced-card balance sim (v10.150)
- Systems: bosses (tier 2 signatures), tests
- Files: bosssig10_t2.js, tests/queennomstest.js (new), tests/sim/wave20.js, tests/sim/race.js; merge of main v10.149
- What: the Queen's snack budget shrinks each pattern cycle (SG2.nomsFall 0.6: 6, 4, 2, 1, 1, then none), so she heals at most 42% of her health in a fight; before, 18% every 22 s cycle outhealed any build under about 140 damage a second (two bot fights ran 1000+ s). bossprobe: strong builds unchanged (36 to 72 s); a forced weak build went from a full-health stall to a kill in 245 s.
- Save data: none
- Hooks: none
- Risk: the Queen is easier for weak builds after about 90 s of fighting; fast fights are unchanged.

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Fourteen more draft cards: trade-offs, streaks, sprint, decoy, bosses, curse, race (v10.147 on this branch; main later used v10.147 too)
- Systems: draft cards, defences (pdef), healing, stamina (sprint), weapons (fire rate), enemy targeting (decoy)
- Files: perks.js (new), index.html, ARCHITECTURE.md, tests/perkstest.js (new); merge of main v10.146
- What: Big Heart (+40% max HP, 10% slower), Bubble Wrap (Membrane x2, mends half as fast), damage up as health drops, your statuses 25% shorter a rank, a Membrane that cuts the damage type that has hurt you most, kill streaks give +40% fire rate for 4 s, sprinting leaves a slippery trail, starting a sprint shoves and damages, a dud-sperm decoy every 30/24/18 s, +12% damage to bosses, boss hits 10% weaker, Hex (take 15% more, one more draft card), and two race-only cards near the egg (faster, tougher).
- Save data: none
- Hooks: none in shared files. hookOn tick, kill, dmgMul, hurtMul; wraps mutSpeed (mutations.js), rateBonus (arsenal.js), pdefHurt / pdefStatus / pdefTick (pdef.js), draftCards (draft.js), sillyTick / sillyDraw (silly.js), v10Draw (v10.js).
- Risk: Bubble Wrap works by lending Thicker/Faster ranks inside pdefTick (restored after the call), so anything reading G.pd.n during that tick sees the lent ranks. Hex can make 4-card drafts on take-one screens. Draft group 'up' now holds 29 health/perk cards beside the v9 upgrades. Unsimmed for balance (bot 0/3 waves, 1/1 Level 1, no errors). Copy: TODO_COPY:pk_*_title / _desc (28).

### Folded from ccr-b6a373a9-q8ofbd: 2026-10-26 Nine more health, Shell and Membrane cards (v10.145 on this branch; main later used v10.145 for its own build)
- Systems: draft cards, defences (pdef), healing
- Files: vitals.js (new), index.html, ARCHITECTURE.md, tests/vitalstest.js (new)
- What: nine slotless 'up:' cards beside membrane.js's six: always-on regen, on-hit lifesteal (inside the lifesteal pool), +20% healing, rally (kills within 3 s of a hit win part of it back), Shell layers regrow mid-wave, Shell layers burst into shrapnel when they break, Membrane pops (damage and shove) when knocked to zero, regen while the Membrane is full, kills refill the Membrane. Shell and Membrane cards only appear when you have one.
- Save data: none
- Hooks: none in shared files (hookOn tick, kill, proc, hurt).
- Risk: more healing in the 'up' draft group (now 15 health cards in it, which dilutes the v9 upgrades); balance unsimmed beyond 2 bot runs (no errors). Copy is TODO_COPY:vt_*_title / _desc (18).

### Folded from ccr-c2f81cd0-9wox5o: 2026-10-26 Weapons stop at Lv 9; Trophy Polish fills kill bars; one level per screen (v10.148)
- Systems: weapon levels, loot (boss spoils), tests
- Files: wmods.js, tests/wmodstest.js, tests/v9armstest.js
- What: wCap is capped at MM.lvlCap (9) for weapons (it was the v9 Lv 10, so Trophy Polish could raise a weapon to Lv 10). Under the kill bar, Trophy Polish fills every weapon's bar instead of adding a raw level (a raw level skipped branch tiers for good). A level screen now leaves the weapon exactly one level up (a branch card granting a modifier levelled it twice, e.g. v_soul_proj Lv 2 > 4).
- Save data: none
- Hooks: none in shared files. Wraps game.js wCap and spoils.js SPOILS.trophy.
- Risk: anything reading wCap for weapons now sees 9 (v9 tier screens no longer offer a Lv 10 tier; they are retired in the live game). v9armstest updated to match.

### Folded from ccr-c2f81cd0-9wox5o: 2026-10-26 Weapons level from their own kills; modifier screens between branch tiers (v10.147)
- Systems: weapon levels (new), modifier cards, draft, branches back, stat bonuses, sidemo (stage), ui (HUD slot), tests
- Files: wmods.js (new), index.html, style.css, tests/wmodstest.js (new), tests/run.sh, tests/sim/wave20.js (per-wave weapon levels `wl`), tests/tools/guide.js, ARCHITECTURE.md
- What: each weapon fills a kill bar (its own kills, thin bar under its HUD slot); a full bar opens its next level. Lv 3/6/9 are the branch screens; Lv 2, 4, 5, 7, 8 (and after 9) are modifier screens in the Weapon Draft layout with 3 cards for that weapon, REROLL and SKIP (+2 rerolls, no level). Level-ups and DNA strands no longer deal modifiers or Switched at Birth; small stat cards (2 steps of a statup.js stat) take their place. The free weapon level every 4th player level is off. One drawn loop per modifier on the stage, shaped by the weapon's attack type.
- Save data: none (run state only: w.wmK, w.wmQ)
- Hooks: none in shared files. hookOn('kill', 'wmKill'); wraps xbrTick, forkCards, draftBox, sivDraftKind, sivDraftHead, sbDraftInfo, makePreview, modDraftCands, modBoxCards, wupLevel, UI.openDraft, UI.refreshHud.
- Risk: weapon power curve (bot wave20 mortal: old rules 1 of 4 wins, every weapon Lv 9 by wave 10; kill bar at WM.k0 16 / kg 0.5: 2 of 4 wins, best weapon Lv 9 around wave 15). Branches that queue modifier cards or wrap modDraftCands for level-ups (raceplan, sabtiers, spslice, modpick) now only act on the weapon screens. Open copy: TODO_COPY:wm_title, wm_sub, wm_stat_tag, wm_stat_quip.

### Folded from claude/practical-brahmagupta-ry2k05: 2026-10-26 Wave 20 probe of every boss: Queen heals from 3 snacks a cycle, boss Membranes 30% of health (v10.150)
- Systems: bosses, combat defences, tests
- Files: bosssig10_t2.js, boss10.js, tests/sim/bossprobe.js
- What: Every boss plus the Failed Experiment probed in the wave 20 slot (bossprobe.js `w20`; god-mode bot, two runs each, 172k to 437k health). Two were heal-locked: the Queen healed back 95% of what she took (six snacks a cycle is 54k at wave 20) and the Twins' Membrane (half of Mitch's health, 55k) was up 87 to 95% of two 400 s fights. The Queen's shared snack budget is now 3 a cycle (9%); boss-rank Membranes are 30% of health instead of 50% (boss10.js wraps fight.js fightCd once at creation; refill stays 10 s, quiet 2 s). Wave 20 after: Queen 318 s, Twins 234 and 312 s, Johnny 129 s (each with one weak-build run still at 400 s). Real waves after: Johnny wave 5 11 and 47 s, Queen wave 10 33 s, Twins wave 10 56 s (one run each at 224 to 400 s with builds dealing under 100 damage a second). The rest at wave 20: Fever 93, Cramp 89 and 175, Litmus 95 and 152, Mucus 108 and 117, Sneeze 74, Chad 157, Colossus 162 (and one 352 with a bot death), Failed 109 and 178, Stone 180, Ghost 193, Eye 215 and 235, Pepsinator 140, Matron 60 and 259 (ward round heals 5% of 345k twice a cycle: 1100 a second). Tier 1 and 2 bosses never reach wave 20 in wave mode (bossTierRoster), so those are stress figures.
- Save data: none.
- Hooks: boss10.js now also wraps fightCd.
- Risk: every boss Membrane (Johnny, Mitch) soaks 40% less before health shows; the Queen heals half as much a cycle as v10.144.

### Folded from claude/keen-archimedes-9okpqe: 2026-10-25 Wrappers moved onto the event hub (v10.126)
- Systems: hooks, engine, weapons24, modifiers, weapon cells, pool balloons, acro, combos, aim
- Files: game.js, hooks.js, wup1.js, wup4.js, wup5.js, wup6.js, acro.js, combos10.js, modwide.js, spmast.js, balloon.js, cellmods4.js, aimplus.js, tests/hookstest.js, ARCHITECTURE.md, CLAUDE.md
- What: killEnemy, damageEnemy, hurtPlayer and fireWeapon are now thin: they fire `hit:before`, `kill:before`/`kill:after`, `hurt:before` (change or cancel the damage) and `fire:before`/`fire:after` round an unchanged body (`damageEnemyBody`, `killEnemyBody`, `hurtPlayerBody`, `fireWeaponBody`). The 13 wrap-and-replace overrides of those four functions in 11 files are hookOn listeners now, ordered as the wrappers ran. No behaviour change intended.
- Save data: none.
- Hooks: game.js killEnemy / damageEnemy / hurtPlayer / fireWeapon split into a thin entry and a ...Body; hurtPlayer takes an optional 5th argument (hookAfter, used by wup5's Postponed).
- Risk: a branch that still wraps one of the four functions keeps working (it wraps the thin entry, as before). Juggling (cellmods4) now also pops balloons on a Postponed hit landing 2 s later (it used to miss those).

## v10.149 (versionCode 428): 2026-10-26 Cramp and Sneeze close in when you are far; every boss probed; merged with main's v10.148
- Systems: bosses (boss pack tier 1), tests
- Files: bosspack.js, bosssig10_t1.js, tests/sim/bossprobe.js
- What: Probe of the tier 1 and tier 3 bosses (god-mode bot, two runs each). The Cramp (grip at 0.3 speed, contraction at 0.3) and the Sneeze (still through the wind-up and the recovery) never closed on a kiting player: 420 to 570 px out, in reach 9 to 21% of the fight, fights 141 to 200 s. Now the usual far close-in (over 380 px) stands during the Cramp's grip and contraction and the Sneeze's cone, the Sneeze moves while it recovers from a sneeze, and it does not start a wind-up from more than 420 px (it walks in first). Probe after: Cramp 20, 41, 100 s (was 141, 159); Sneeze 15, 40, 140 s (was 89, 200). Litmus Strip 16 and 86 s and Mucus Plug 32 and 52 s untouched. Tier 3 at wave 20 (345k to 437k health): Chad 182 s, Colossus 198 s, Fever 113 s, Failed Experiment 114 s with the signature beats, against 257 to 326 s (Chad) and 207 s (Fever) with the old lists; the Colossus killed the god bot twice with the old lists. No tier 3 change. bossprobe.js seeds a lost run so `failed` can be probed, and runs to 4800 s so wave 20 fights fit.
- Save data: none.
- Hooks: none.
- Risk: the Cramp and Sneeze reach a player who hangs back; a human who stands off now gets approached rather than ignored.

## v10.148 (versionCode 427): 2026-10-26 Sandbox Laser with Bounce or Piercing is offered Homing
- Systems: weapon modifiers (dead-card table), tests
- Files: moddead.js, tests/moddead.js
- What: the dead-card filter only looked at the Delivery, so it hid Homing on a Laser holding Bounce or Piercing, where Homing curves every bounce and pierce. A hand-kept MOD_LIVE_WITH table (outside the generated section, so a rebuild keeps it) lets a dead card through when the weapon holds a card that wakes it. Homing, Bounce and Piercing share the Flight group, so this only shows in the Sandbox (no slot limits).
- Save data: none.
- Hooks: none.
- Risk: none outside the Sandbox.

## v10.147 (versionCode 426): 2026-10-26 Nine stale or broken tests fixed; Range and Up Close cards offered again
- Systems: weapon modifiers (dead-card table), stat points, tests
- Files: moddead.js, statup.js; tests modstest.js, celltest.js, laserbeamtest.js, lasershot.js, slicetest.js, spslicetest.js, sptest.js, statuptest.js, tools/moddead.js
- What: the dead-card table (MOD_DEAD) had Range and Up Close back on about 50 weapon cells after a rebuild (b8daec1 had taken them off on purpose; v_phys_contact was refused Range though it widens reach 110 to 154); they are removed and the generator now skips both. Returning gets its stat ('range', what its cards already got by default). Tests updated to the intended game: MOD_DEAD filtering, the Laser's charge-up and held beam and its own forks, the two-best-weapons start draft; statuptest resets ids, kill counts, sightings and the damage-number average between weapons so results no longer depend on order; random crits off where a lucky one flipped a check.
- Save data: none.
- Hooks: none.
- Risk: Range and Up Close cards show up again on many weapons (more card variety, slightly different offers). statuptest still fails on Enzyme Sneeze (dps ratio about 1.3 to 1.5, a balance call left open).

## v10.146 (versionCode 425): 2026-10-26 Merge of two v10.145 sessions: all open copy, modifier hold view, run log newest first
- Merged: `ccr-0f6f9db5-704msv` (every open TODO_COPY written; holding a modifier card explains it on each weapon with real numbers) and `ccr-56c32e6b-e1zsrr` (run log newest first, Sandbox offer lists shortened) into main's v10.145 (boss Membrane refill). All three had shipped as v10.145; one build.

### Folded from ccr-0f6f9db5-704msv: 2026-10-25 All open copy written; modifier hold view explains the instance (v10.145)
- Systems: ui (loot cards, glossary), weapons (modifier cards), relics, bosses, tutorials, Switched at Birth, health cards
- Files: holdcopy.js (new), index.html, style.css, glossary.js, rewardui.js, data.js, rrelics.js, levels.js, foes3.js, bosspack.js, rackgrid.js, spoils.js, dnadrop.js; tests cell4test.js, sabtierstest.js, dnadroptest.js
- What: every remaining TODO_COPY is written (11 relics, 15 boss signature lines, 6 health and Membrane cards, Switched at Birth levels and fork, 25 water-balloon cells, Tartar Colony, Hocker tip, Toughest targeting, Trophy Hide, DNA drop label, notes and tutorial, random sample tag, the pick-a-weapon fit line). Holding a modifier card now shows, for each weapon it can go on, what it does on that weapon at that rank (cell or Delivery text where one exists, else a line in the weapon's own words with the rank's real numbers), what this rank adds, and the weapon's numbers before and after including the card's stat point. glossFor no longer matches "The shakes" on every "the".
- Save data: none.
- Hooks: none in shared files (holdcopy.js wraps cardGlossary and sabCard; glossary.js glossFor one-line fix).
- Risk: copy only, plus a read-only stat preview (computeStats with the modifier added, then restored). celltest's "nappy dealt" failure is pre-existing on main.

### Folded from ccr-56c32e6b-e1zsrr: 2026-10-25 Run log newest first, Sandbox offers shortened (v10.145)
- Systems: meta (run log), weapon telemetry
- Files: meta.js, wstats.js
- What: the copied run log lists the newest run first, so a paste that gets cut off loses the oldest runs, not the one that crashed; a draft offering more than 8 cards (Sandbox, the whole pool) prints "all N" instead of every name.
- Save data: none
- Hooks: none
- Risk: none (text only)
## v10.145 (versionCode 424): 2026-10-26 Boss Membranes refill in 10 s, not 2 (the Johnny's health bar moves again)
- Systems: bosses, combat defences
- Files: boss10.js
- What: The Johnny's Membrane (half its health, 1505 points at wave 5) refilled fully 2 s after 2 s untouched, so it came back during every roll and a weak build never dented the health bar. Probe (god-mode bot, wave 5): Membrane up 79 to 99% of the fight, fights 97 to 400 s, with the old pattern list too (not a C3 regression). Boss-rank Membranes now take 10 s to refill; the 2 s quiet time stays, as the intro card says. Mitch (Twins) has the same defence and gets the same rule. Probe after: 56, 66, 97 s.
- Save data: none.
- Hooks: boss10.js wraps combat.js tickDefence (fight.js calls it by name each frame).
- Risk: every boss Membrane is softer under sustained fire; small-cell Membranes unchanged.

## v10.144 (versionCode 423): 2026-10-25 Matron and Queen fights end: round healing capped per add, one healing snack budget a cycle
- Systems: bosses, tests
- Files: bosssig10_t2.js, tests/sim/bossprobe.js
- What: Probe (god-mode bot, waves 10 and 15): the Queen healed back everything she took (devour plus two dinners a cycle, each up to six snacks at 3%; a dinner with fewer than three adds orders four fresh ones, so she fed herself) and every fight timed out at 400 s with her near full health. The Matron's rounds healed the adds round you 4.8% a second without limit, so 90 to 100 adds stayed alive and she walked the beds at 300 px/s; fights ran 260 to 400 s. Now: devour and both dinners share one budget of six healing snacks a pattern cycle (18%, the old devour's amount), she still eats past it; rounds heal an add at most six ticks in its life and she walks at 240 px/s. Probe after: Queen 116 to 154 s at wave 10 and 147 s at wave 15 (one weak-build run still timed out with the bot 600 px away), Matron 25 to 182 s. bossprobe.js takes `w15` to put a tier 2 boss in the wave 15 slot and reports dealt and healed per second.
- Save data: none.
- Hooks: none new (the wrapper's queen branch calls sg2Noms; sg2Dinner applies it after its devour).
- Risk: the Queen is easier when the player feeds her; the Matron's adds die as they used to.

## v10.143 (versionCode 422): 2026-10-25 Tier 2 boss fights end: Eye closes in between saccades, Twins stay in reach and rebuild weaker
- Systems: bosses, boss telegraphs, campaign entourage, tests
- Files: bosssig10_t2.js, tests/bosstest.js
- What: Bot fights against the Immune Eye ran 70 to 572 s and the Twins 104 to 1044 s (god-mode wave sims) after C3. Probe (reach, distance, boss damage per second): the saccade held the Eye still for the whole slot, so a kiting player sat 450 px away out of every weapon's reach; the crossfire parked the Twins 240 px out and still for 3.7 s of every 5.5 s, and its entourage pulsed on 3 slots in 4 (about 150 adds alive, boss damage near zero); the rest was the rebuild loop (one body felled, the other never finished inside 8 s, the first back at 60% again and again). Now: one saccade a slot, the Eye keeps its usual distance otherwise. Crossfire ring 200 px, swing 260 px/s; outside the lit lane the bodies keep the usual boss distance; no lane is lit unless both bodies are within 320 px of you and near enough to opposite that it runs through where you stood (up to 3.2 s to get there, else they close in and try again); adds pulse on the charge and the lull timer only. Each rebuild of the pair comes back weaker (60%, then 36%, 22%, 13% ...). Probe after: Eye 62 to 181 s (median about 95), Twins 66 to 260 s (median about 110), every fight ends.
- Save data: none.
- Hooks: bosssig10_t2.js now also wraps bosses.js updateRevive. ENTOURAGE.twins.on is filtered to ['charge'] at load.
- Risk: the Twins' second phase is easier to close out (by design); fewer Mitotic Cells in that fight; the Eye sweeps half as often.

## v10.142 (versionCode 421): 2026-10-25 Enemy handoff C3, boss signature beats
- Merged: `claude/enemy-c3-t3`, `claude/enemy-c3-t1`, `claude/enemy-c3-t2` (one signature beat per boss built from its own mechanic, replacing the generic aimedFan/spiral/ring slots; tier 1 keeps one spray as a breather; `bosssig10_t1.js`, `bosssig10_t2.js`, `bosssig10_t3.js`) into `claude/practical-brahmagupta-ry2k05` on main's v10.138. One build. Orchestrator: bosstest.js rebuilt from the three branch patches after the merge.

### Folded from enemy-c3-t3: 2026-10-25 Tier 3 boss signature beats (not shipped)
- Systems: bosses, boss telegraphs, tests
- Files: bosssig10_t3.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: The Fever, Chad Prime and the Antibody Colossus lose every generic spray slot (spiral, ring, aimedFan). The Fever's list is firering/flush x2: Flush sends three expanding heat waves 0.8 s apart, each with one 50 degree safe gap that steps 30 degrees a wave, gaps marked for 0.7 s first. Chad's list is dash3/tailwhip x2: each dash landing is marked (from the wind-up) and a shockwave of radius 2.5 x his r goes off 0.3 s after he lands. The Colossus's list is yvolley/charge x2: three lanes 120 degrees apart sweep 40 degrees over 1.2 s after a 0.9 s mark, twice a pattern. All hits use the boss's own bullet damage base through V10_DIFF.dmg x 0.8 (as hazards do); no HP, damage or rate number changed.
- Save data: none.
- Hooks: none in shared files. Wraps bossAI and nf10Draw from bosssig10_t3.js, edits `patterns` of three BOSSES and ROSTER_BOSSES rows in place, adds `TODO_COPY:boss_<id>_sig` to each boss's strengths.
- Risk: boss cycle makeup shifts (fewer bullets on screen); other tier files (bosssig10_t1/t2) touch other rows only. The Colossus entourage still pulses on `charge` only.

### Folded from enemy-c3-t1: 2026-10-25 Tier 1 boss signature beats (C3)
- Systems: bosses, boss telegraphs, hazards
- Files: bosssig10_t1.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: each tier 1 boss swaps one generic spray for a signature beat with a tell: Litmus Strip Titration (a line of marked drips sweeps over 3 s in its colour), Johnny Unroll (a latex band blocks movement for 2 s, its back open), Mucus Plug Drip (3 or 4 marked drops, each a Mucus patch), Cramp Contraction (a ring closes over 2 s, pulls you in, hurts once), Sneeze Sniffle (a slow droplet cloud that lands as small Mucus patches). Patterns now: litmus [litmusdrip, titration, aimedFan, litmusdrip], johnny [johnnyroll, aimedFan, johnnyroll, unroll], mucus [mucusspit, drip, aimedFan, mucusspit], cramp [crampgrip, aimedFan, crampgrip, contract], sneeze [sneezecone, aimedFan, sneezecone, sniffle]. Johnny, Cramp and Sneeze end their pattern early when the beat is done. One intro line per boss is a TODO_COPY placeholder.
- Save data: none.
- Hooks: none (wraps bossAI and nf10Draw from its own file).
- Risk: boss cycles are shorter where a beat ends early; the Plug's drop and the Cramp's contraction add one hit each (bd x 0.7, the glob's number). No HP, damage or rate number changed.

### Folded from enemy-c3-t2: 2026-10-25 Tier 2 boss signature beats (C3, not yet shipped)
- Systems: bosses, boss telegraphs, tests
- Files: bosssig10_t2.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: the seven tier 2 bosses lose every generic spray (aimedFan, spiral, ring, flower, doubleSpiral) and each gets one signature beat that shows its area first: Twins crossfire (opposite sides, lane lit 0.9 s, one body's 0.4 s Beam), Stone fragment (a gravel chunk per shed Shell layer down a lane marked 0.8 s), Matron rounds (3 beds marked 0.9 s, she walks them healing what she passes), Phantom false positive (two drawn copies blink with her for 4 s, real one ringed; copies are not enemies), Eye saccade (60 degree sector marked 0.8 s, glare sweeps it over 1.2 s), Pepsinator reflux (one half shaded 1 s, pools roll out over it in 1 s), Queen dinner (adds queue and rush one marked line, then devour). Boss strength lines now carry TODO_COPY:boss_<id>_sig. The campaign twins entourage trigger 'spiral' becomes 'crossfire'.
- Save data: none
- Hooks: none in shared files (wraps bossAI and nf10Draw; rewrites BOSSES/ROSTER_BOSSES patterns and ENTOURAGE.twins.on at load)
- Risk: pattern mix per boss changes (no HP, damage or rate number changed; the Beams, chunks and pools use the boss's own bd as the sprays did). Siblings bosssig10_t1.js and t3.js also load after bosstells10.js (index.html tag lines will conflict: keep all). Twins swing round you at 360 px/s while repositioning (contact damage possible then, as with any twin movement).
## After v10.140 (no build): 2026-10-25 Melee Knockback test runs the collision system; run.sh filter fix
- On main. Systems: tests. Files: tests/delivtest.js, tests/run.sh, MODAUDIT_HANDOFF.md.
- What: the Delivery-forms test's Melee Knockback (Bouncer) case ticks collide.js's `cdTick` with a fast shove, since collide.js owns collisions and the form's own pass stands down when it is loaded; it had been failing silently. run.sh now keeps a FAIL line that also carries `ERRORS []` (it dropped the whole line before).
- Save data: none. Hooks: none. Risk: none.

## v10.140 (versionCode 419): 2026-10-25 Returning offered again; dead-card table regenerated
- Built on main. Systems: modifier cards, tests. Files: matrixonly.js, moddead.js.
- What: Returning (Return to Sender) is in `MATRIX_ONLY.mods` again, so the draft offers it on projectile and spread weapons, naked and under every Delivery (its five Delivery forms from task 3 were unreachable). `MOD_DEAD` regenerated from a full audit with Returning in the plan: 550 NO-OP of 2764 combos hidden (Returning itself: 32 dead, 50 visible). The audit ran on main before the v10.139 six-branch merge; regenerate again after the next modifier change.
- Save data: none. Hooks: none. Risk: Returning builds come back into play on 11 weapons; untested in wave sims.

## v10.141 (versionCode 420): 2026-10-25 Feedback animations use the shared charge-up look
- Merged: `ccr-feedback-chargefx` (reload arcs and status-end puffs drawn with chargefx.js `drawChargeFx`), on top of main's Melee Knockback test fix.

### Folded from ccr-feedback-chargefx: 2026-10-25 feedbackfx uses the shared charge-up look (v10.140)
- Systems: feedback fx, charge-up look
- Files: feedbackfx.js, NOTES.md, ARCHITECTURE.md
- What: reload arcs now show the damage type's charge-up look building inside the arc, and a status wearing off shows that look unwinding plus its release snap. The stand-in per-type puff code is deleted. chargefx.js is unchanged.
- Save data: none
- Hooks: none (feedbackfx hooks and rate limits unchanged)
- Risk: a reload now draws up to 4 drawChargeFx calls (one per reloading weapon); check frame rate on a phone.


## v10.139 (versionCode 418): 2026-10-25 Six feature branches: charge-up looks, feedback animations, health loot, Switched at Birth levels, pick-the-weapon modifiers, DNA drops
- Merged: `ccr-charge-fx`, `ccr-feedback-fx`, `ccr-loot-health`, `ccr-switched-levels`, `ccr-mod-weaponpick`, `ccr-dna-drop`. Conflicts were only shared bookkeeping (ARCHITECTURE.md rows and script order, run.sh test list, index.html script tags, NOTES.md bullets, version files, APK). feedbackfx.js still uses its own per-type stand-in colours rather than chargefx.js `drawChargeFx`.

### Folded from ccr-charge-fx: 2026-10-25 One charge-up look per damage type (v10.135)
- Systems: weapons, damage types, ui (world drawing)
- Files: chargefx.js (new), laserbeam.js, newfeats.js, render.js, bosstells10.js, newfoes.js, foes3.js, index.html, tests/chargeshot.js (new), tests/run.sh
- What: `drawChargeFx(x, y, r, k, elem, seed)` draws a charge-up in each damage type's own motion (Force ring, Acid drips, Mucus strands, Static arcs, Cooties rash, Oil gleam, Water ripples, Blood heartbeat, Alien wisps, Fire tongues) and `chargeSnap` draws the release. The Charged modifier now shows its wind-up (it had none); the Laser, Lactic Acid, charger, boss charge, Matchstick and Hayfever sneeze use it too. Boss and charger lanes are unchanged.
- Save data: none.
- Hooks: render.js drawEnemy (charger st 1), bosstells10.js (charge), newfoes.js (Matchstick), foes3.js (hayfever) each call drawChargeFx; chargefx.js wraps modDraw.
- Risk: purely visual; extra gradients while a charge is up (counts scale down with QUAL).

### Folded from ccr-feedback-fx: 2026-10-25 Feedback animations (v10.135)
- Systems: feedback fx (new), render
- Files: feedbackfx.js (new), index.html, render.js, ARCHITECTURE.md, tests/feedbackfxtest.js
- What: reload arcs round you (tinted by damage type), a pulse on the Feat slot and a flash when a Feat, WINDED or Sprint Start comes off cooldown, an invulnerable shimmer with a start burst and an end flicker, soft heal puffs for any HP gain (rate limited), and a fade-out puff per damage type when a status ends on an enemy or on you.
- Save data: none.
- Hooks: hooks.js tick -> ffxTick (own file); render.js render -> ffxDraw after ringsOnTop.
- Risk: draw cost is small (capped at 40 effects, no per-frame allocation). Per-type looks are a stand-in (`ffxTypePuff`); swap for the ccr-charge-fx helper when it exists.

### Folded from ccr-loot-health: 2026-10-25 Health and Membrane cards (v10.135)
- Systems: draft cards, defences (pdef), healing
- Files: membrane.js (new), index.html, ARCHITECTURE.md
- What: six new slotless draft cards (family 'up:'): max HP %, low-health regen, kill heal within the lifesteal pool, post-hit damage cut, overheal into Membrane, faster Membrane mend. The last two only appear with a Membrane.
- Save data: none
- Hooks: none in shared files (hookOn tick, kill, hurt, hurtMul; wraps healPlayer).
- Risk: more healing in the 'up' draft group; wave balance unsimmed beyond wave20 4 runs. Copy is TODO_COPY:hp_*_title / _desc (12).

### Folded from ccr-switched-levels: 2026-10-25 Switched at Birth in three levels (v10.135)
- Systems: weapons, draft, chemistry
- Files: sabtiers.js (new), index.html, ARCHITECTURE.md, tests/sabtierstest.js (new)
- What: Switched at Birth now levels. Level 1: 35% of attacks use the new damage type; Level 2: 70%; Level 3 opens a fork: Full (every attack) or Blend (every attack in the new type at 60%, plus an echo hit of the original type at 60%). The per-attack swap changes the weapon's def when it fires, so projectile colour and switched effects follow the shot. Later copies of the card on a switched weapon rank it up (it takes no extra slot). Card and fork text are TODO_COPY placeholders (sab_l1_desc, sab_l2_desc, sab_l3_desc, sab_l3a_name/desc, sab_l3b_name/desc).
- Save data: none (run state only: w.sab).
- Hooks: none in shared files; hookOn dmgMul and proc from sabtiers.js. Wraps fireWeapon, sabCard, modDraftCands, mmHeld, modOk.
- Risk: weapons whose damage lands later (pools, mines, bubbles, contact) read the type at hit time, so their observed share drifts from 35/70%. Starting-switched samples stay fully switched with no levels. modstest already fails on the branch before this change.

### Folded from ccr-mod-weaponpick: 2026-10-25 One modifier card, choose the weapon (v10.135)
- Systems: modifier cards, draft, loot filters
- Files: modpick.js (new), lootfilter.js, rewardui.js, index.html, tests/modpicktest.js (new)
- What: a modifier that fits more than one weapon is dealt as one level-up card with the v9 weapon chips; tap a chip to pick the weapon, a plain tap or the bot picks the highest-level weapon. Draft keeps its card count. DNA strand boxes are unchanged (already one card per modifier).
- Save data: none
- Hooks: lootfilter.js lfInfo reads o.modTab; rewardui.js fit line reads o.pickW
- Risk: modifier frequency in level-ups follows the best of the group's weight instead of each weapon's; TODO_COPY:modpick_fit is open.

### Folded from ccr-dna-drop: 2026-10-25 Level-up DNA dropped onto the slide by the scientist (v10.135)
- Systems: rewards (DNA drops, new), autorun, ui (loot screen), tutorials, tests
- Files: dnadrop.js (new), junk.js, index.html, ARCHITECTURE.md, tests/dnadroptest.js (new), tests/levelboxtest.js, tests/run.sh, tests/sim/wave20.js, tests/sim/lvsim.js
- What: a level-up is pipetted onto the slide 300 to 560 away (a reachable floor cell 4 to 8 route cells away in a campaign level), never in walls, terrain or boss hazards; one drop at a time, further level-ups add to its count and swimming into it opens every screen back to back. Boss fights: it lands nearer and autorun only fetches it when the way is safe. Autorun goes for it before other pickups (in levels only when in sight). Gold outlined edge chevrons with distance and count point to it. The level-up screen shows a note from the scientist, picked by health, boss, stack.
- Save data: none (META.seenTut.dnadrop when the tutorial card shows).
- Hooks: none in shared files. dnadrop.js replaces levelbox.js lvboxTick/lvboxSpot, wraps applyPickup, autorun.js arPickups, v10Draw, UI.openLoot; hookOn('tick', 'ddTick'). junk.js junkArrow gains an optional fill colour.
- Risk: autorun detours more (bot win rate; see sims in NOTES.md); TODO_COPY placeholders show on the drop label, three note moods and the tutorial card until the copy lands.

## v10.138 (versionCode 417): 2026-10-25 Card lines for the Delivery forms
- Built on main. Systems: modifier cards. Files: delivforms.js.
- What: the 29 `TODO_COPY:xd_*` placeholders (Mines, Melee, Strike from Above, Orbiting and Ranged forms of Homing, Bounce, Returning, Link, Pull and Knockback) have their card lines in `XD_COPY` in delivforms.js (written by the session at the user's request: what it does, then at most one dry clause, no numbers). Every form card now renders under 120 characters with no placeholder.
- Save data: none. Hooks: none. Risk: none.

## v10.137 (versionCode 416): 2026-10-25 Ranged forms for Flight and Crowd modifiers (task 3 batch 5, the last)
- Merged: ccr-task3-ranged (MODAUDIT_HANDOFF.md task 3, batch 5). Dead-card table regenerated in the branch: 516 of 2682 hidden. Task 3 complete.

### Folded from ccr-task3-ranged: 2026-10-25 Ranged forms for Flight and Crowd modifiers (task 3, batch 5)
- Systems: modifier cards, weapons (Delivery), toys (Peekaboo), tests
- Files: delivforms.js, matrixna.js, moddead.js (regenerated), tests/delivtest.js, ARCHITECTURE.md, MODAUDIT_HANDOFF.md
- What: Bounce, Returning, Link, Pull and Knockback now have a Ranged form (MODIFIER_MATRIX.md 5.11; Homing is N/A). The strike hops to 1 / 2 / 3 more enemies within 120 at 60% (Bounce), a 40 / 50 / 60% hit runs from the target back to you (Returning), everything in its area is linked for 3 / 4 / 5 s sharing 25% (Link), enemies within its radius + 60 / 90 / 120 are dragged into its centre before it lands (Pull), and it throws enemies outward from where it lands (Knockback). The forms read an area of at least 50 (Nervous Wreck's and Enzyme Headbutt's strike is 1 across). Peekaboo with Ranged now throws its decoy spot to the densest crowd within 260 and the BOO goes off there (its matrix cell 4.4; before this its Ranged did nothing). The draft deals the five on a Ranged weapon, and Knockback's N/A on Nervous Wreck and Panic Button lifts while Ranged is held. Card text is TODO_COPY:xd_ranged_<mod> until the user writes it. MOD_DEAD regenerated from the full audit (2682 combos, 516 NO-OP; main had 519 of 2672): Peekaboo's Ranged card is offered again.
- Save data: none.
- Hooks: none in game.js, render.js, ui.js or bosses.js. delivforms.js wraps modwide.js mwFire, toys.js peekFire and peekBoo, and modOk (plus another mwTick and modDraw wrap); matrixna.js matrixNa reads mwR (one condition).
- Risk: Ranged builds deal more damage and get five more cards in the draft. Peekaboo with Ranged plays differently (the BOO lands at the crowd, not round you). Returning is still outside MATRIX_ONLY.mods, so the shipped draft never offers it on any Delivery.


## v10.136 (versionCode 415): 2026-10-25 Enemy handoff Batch D1 and E
- Merged: `claude/enemy-e4` (per-enemy error isolation, far-enemy skip in fight.js), `claude/enemy-e3` (rostertest, rosterint), `claude/enemy-d1` (WAVES10 rework: relays, sniper, Booster, Diatom, Spire, Leech, Rotifer, Natural Killer, Complement, Stem, Puffball, a joke wave; per-id caps on the slog waves; entourage wisps are krill) and `claude/enemy-e1` (dead v9 enemy code gone: overloads, triples, terrain and per-enemy reactions, Sick/Wet/Lubricated, armour and weakness fields on every def, 25 dead reaction rows; the duplicate `ectoplasm` relic id split; the old dodge roll only on Contact and Projectile hits) into `claude/practical-brahmagupta-ry2k05` on main's v10.135. One build. E2 was a no-op (A1b retired no relics). Orchestrator fix: rosterint also counts shapes picked by `sh === 'x'` in render.js (Krill); run.sh's test list rebuilt after a merge mangled it.

### Folded from enemy-e4: 2026-10-25 Enemy loop robustness and frame cost (E4, not shipped)
- Systems: enemies, fight (v10 defences)
- Files: game.js (updateEnemies, new enemyFault), fight.js (fightTick, fightDraw), tests/fighttest.js
- What: one enemy's AI throwing no longer aborts the frame for the rest (caught per enemy, reported once per enemy name through `safely`, error box shows once). `fightTick` skips far enemies (beyond CROWD.far) on alternate frames with the time carried (`fFarDt`), same exemptions as updateEnemies. `fightDraw` culls off screen before calling `fightId`, once per enemy. framebench (q4, 240 frames, seeded): update 4.15 ms -> 3.81 ms, draw 8.6 ms -> 8.09 ms, calls 629 -> 628.
- Save data: none
- Hooks: none
- Risk: far enemies' defence timers now tick in 2-frame steps (carry keeps totals equal). A throwing AI now skips that enemy's rest-of-frame (leash, contact) instead of the whole frame.

### Folded from enemy-e3: 2026-10-25 Roster sweep, telegraph and integrity tests (not shipped)
- Systems: tests
- Files: tests/rostertest.js (new), tests/rosterint.js (new), tests/run.sh
- What: `rostertest` spawns the 15 enemies no other test covers plus Colossus and Immune Eye in the Lab Bench for 10 s each (no page errors, each dies to damage, no single hit above roster damage x live knobs x 2), then one ROSTER-driven loop checks that no damage lands before `tele` seconds after the tell starts for the 13 built tells (ids with no detector are printed as SKIPPED; tells that never land a timed hit are printed as vacuous). `rosterint` (plain node, TypeScript parser, no browser) checks every ROSTER `ai` has a FOE_AI entry or game.js case, every `shape` a MICROBES entry or render.js case, and fails on a duplicate key in ENEMIES, ROSTER, BOSSES, FOE_AI, MICROBES.
- Save data: none.
- Hooks: none.
- Risk: none for the game (tests only). `rosterint` fails today on ROSTER.krill (shape 'krill' has no draw code, it falls back to a circle), so the full suite shows that failure until the game is fixed.

### Folded from enemy-d1: 2026-10-25 WAVES10 rework: relays, sniper, Booster, Diatom, Spire and the rest meet the player (D1, not shipped)
- Systems: waves (waves10.js, campaign.js entourage), tests
- Files: web/js/waves10.js, web/js/campaign.js (ENTOURAGE `wisp` -> `krill`), tests/waves10test.js
- What: the 16 ordinary waves now bring in Puffball (7), Sweetcorn (the joke wave, 8), Rotifer (9), Leech (11), Enzyme Spire (12), Plasma Cell (13, Shooter + Relay), Killer T-Cell (14, sniper), Complement (16), Diatom (17, Shell tank + Shooter), Cortisol Puff (18, Swarm + Relay) and, in the wave 19 big mix, Booster, Stem Cell, Fibrin Weaver and Natural Killer. Waves 1 to 4 and 6 are unchanged. New per-wave `cap` (bodies of an id sent in all) cuts the slog waves by count: bulwark 2 and max 30 (wave 9), summoner 1 and max 34 (16), stressball 3 and max 38 (14), staticsock 4, spire 1, max 34 (12). `W10_STATUS` now names `drain` (leech, mosquito), `mark` (complement), `steal` (rotifer); amoeba removed (parked). Entourage `wisp` slots are `krill`. The `teaches` strings are developer notes (nothing reads them on screen).
- Smallest design choice: twelve ordinary waves cannot give 28 first-timers a wave each, so from wave 11 a new behaviour may arrive with one pair partner (ENEMY_DESIGN 10); before wave 11 it is one at a time (plain tag-alongs puffball, sweetcorn, rotifer excepted). waves10test's "alone first" check is relaxed to match.
- Save data: none.
- Hooks: none.
- Risk: balance after wave 11 is new ground (waves 12, 14, 16, 19 carry two new behaviours). Run-to-run variance is large (2 runs per sim); waves 1 to 4 are untouched and the bot still sometimes dies there to the Sprinter (also in the baseline).

### Per-wave seconds (hurt), `node sim/wave20.js 2 mortal`
Before (v10.133): run 0 w1 40 (19), w2 57 (128), died wave 3 to Sprinter. Run 1 w1 47, w2 49, w3 47, w4 61, w5 boss 91 (102), w6 65 (84), w7 80 (39), w8 55 (31), w9 bulwark 111 (180), w10 boss 37, w11 44 (146), died wave 12. 0 wins.
After, final table: run 0 w1 69, w2 54 (148), w3 62, died wave 4 to Sprinter (waves 1 to 4 untouched). Run 1 w1 109 (48), w2 39, w3 43, w4 70, w5 boss 73 (116), w6 53, w7 64, w8 54 (164), w9 69 (66), w10 boss 29, w11 36, w12 64, w13 59, w14 83 (135), died wave 15 (Matron). 0 wins.
After, caps-less intermediate table: run 1 reached wave 20 and WON: w9 87, w12 78, w14 85 (240), w16 128 (65), w17 75, w18 43, w19 63 (187), boss 182 s. Other runs died at waves 10, 12, 13 in the middle tables.
Slog waves: wave 9 111 s -> 64 to 87 s; wave 12 (sock + spire) 99 s -> 64 s after caps; wave 14 83 to 85 s; wave 16 was 128 s before its caps and has not been timed again (no final run reached it).

### Folded from enemy-e1: 2026-10-25 Dead enemy code removed (ENEMY_HANDOFF.md E1) (no build)
- Systems: chemistry, enemies, relics, player-defence (hurtPlayer Evasion roll)
- Files: chem.js, pstatus.js, foes3.js, foes2.js, foes.js, brood.js, events.js, bosspack.js, data.js, inspect.js, game.js, hooks.js, newfeats.js, render.js, rrelics.js, pdef.js (comment), tests/rxtest.js, tests/psttest.js, tests/f3test.js, tests/relictest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: deleted v9 code nothing reaches under v10, and made Evasion skip Burst and Pool hits.
  - chem.js removed: `OVERLOAD_OF`, `chemOverload` (the six-hit overloads), `TRIPLES`, `chemTriple`, `terrAt`, `chemTerrain`, `CHEM_FOES_M`, `chemFoes`, `chemFoe`, `chemPuddle`, `chemSplash`; the `applyElement` cases for Acid, Mucus, Static, Blood, Alien and Fire (`fightStatus` returns before them), the unused `has`/`rsrc` locals, and the water-splash call. Kept: the Cooties, Oil and Water cases (v9 weapons still reach them), `chemGhost`/`chemKill` (Feats set `e.curse`), `chemBowl`, `curseFoe`, `reactDo`, `e.fizz`/`z.oil` reads (the Oil case sets both).
  - pstatus.js removed: `pstHit`, `pstHurtMul`, `pstHeal`, `pstGrip`, the `sick`/`wet`/`lube` entries of `PST`, `PST_OF`, `PST_NAME`, `pstS`, `pstOn`, `pstClear`, the SICK / LUBRICATED / SOAKING WET chips and `STATUS_INTRO` entries, the Sick tick, and the salt/oil/poison bullet glyphs. `PST_SHOOTERS` trimmed to spitter, lancer, sperminator and endoskeleton (warlock, diatom, grease dropped). Grease Ball globs stay (`PST_GLOB`).
  - hooks.js removed: the `pstHurtMul` hurtMul hook and the `pstHit` hurt hook. game.js `healPlayer` no longer multiplies by `pstHeal()`.
  - foes3.js removed: the `foes3Chem` Hayfever antihistamine branch, the `wet`/`sick` entries of `f3carry`, the `antihistamine` REACTIONS row and its `RX_OF` entry. `foes3Chem` keeps the `popped` branch (live via `f3popped`).
  - game.js removed: stain boons in `damageEnemy` (`G.dyeBoon.luciferase/motility/rival`), the `src.shred` line in `damageEnemy`; `makeEnemy` now sets `armour: def.armour || 0`.
  - Def fields removed (data.js ENEMIES and BOSSES, foes.js, foes2.js, foes3.js, brood.js, events.js `GOLDEN_DEF`, bosspack.js `PLUG_DEF`): `armour`, `weak`, `resist`, `weakAoe`, `noForce`, `shredStick`, `does`. No def had `dodge` left (A2 removed Chad Prime's).
  - Leftovers: newfeats.js Perished no longer writes `ifn`, `auraArm`, `tunT`; foes2.js `foes2Fx` `e.ifn` shield film and the render.js `e.ifn` test; render.js Water Bear `tunT` curl drawing; brood.js `h.tunT`; inspect.js `RX_ABBR`.
  - Relics: `RELICS.ectoplasm` was defined twice (data.js armour version, rrelics.js dodge version won). The Phantom Pregnancy keeps `ectoplasm`; the rival Casper's is now `ectoplasm_r` (rrelics.js row, `RIVAL_RELICS.casper`, `rrelicApply` case). Both still give +15% dodge, so the data.js row now carries the text that was already on screen.
  - Evasion fix: `hurtPlayer` rolls `P.dodge` only for Contact and Projectile hits (`PDEF_ATK` kinds `contact` and `bullets`); Burst (`blast`, `thorns`), Beam and Pool hits skip it (COMBAT_MATRIX 13).
  - Field Guide reaction rows deleted (data.js `REACTIONS`, 25): meltdown, booger, overload, slipnslide, waterlogged, hemorrhage (overloads); zombie, baptism, napalm, flesheating, fluseason, bloodyshow, oilrig (triples); livewire, downstream, flareup, diluted (terrain); fireball, gorged, sporesneeze, shellshock, softened, thinned, gluedown, washedoff (per-enemy). inspect.js `RX_PAIR` loses its four self-pair entries (fire, ice, salt, arcane twice, shock, oxi); `possession` and `pandemic` stay (Feats fire them). typefx.js `RX_STYLE` still names the old ids (harmless, unused).
  - tests/tools/guide.js no longer prints `armour` for bosses.
- Save data: none. `META.relics.ectoplasm` keeps meaning the boss relic; `ectoplasm_r` is new and starts untaken.
- Hooks: hooks.js loses the `pstHurtMul` (hurtMul) and `pstHit` (hurt) rows; game.js `healPlayer` loses `pstHeal()`; game.js `hurtPlayer` dodge line reads `PDEF_ATK`.
- Risk: Evasion now stops fewer hits (Burst and Pool), so those hurt a little more for builds with dodge. Grease Ball, Warlock and Diatom bullets lose their white type mark. The Field Guide "Unstable reactions" list loses ANTIHISTAMINE; it still lists the overload, triple, terrain and per-enemy reaction rows whose code is gone (copy decision, not touched). Kept because they have live readers: `RX_PAIR`, `TYPE_RING` and the typefx status looks (the v9 statuses are still set by weapons, Feats and genes), the `e.shock` arc block in `damageEnemy` (genes.js Short Fuse sets `e.shock`), `bossDodges`. Not touched because they sit in `updateEnemies`: the `e.shred`, `e.auraArm` decays and the `e.tunT` read.

## v10.135 (versionCode 414): 2026-10-25 Dead-card table regenerated on v10.134 (Orbiting forms, shared mechanics, stored hits)
- Built on main. Systems: modifier cards, tests. Files: moddead.js.
- What: `MOD_DEAD` regenerated from a full audit of main at v10.134 plus the Orbiting-forms table: 519 NO-OP of 2672 combos hidden (the plan shrank from 2810 with the modifiers v10.134 retired). Nothing else changes.
- Save data: none. Hooks: none. Risk: none.

## v10.134 (versionCode 413): 2026-10-25 Recent branches merged: stored hits and reach, Orbiting forms, Sample Rack grid, There Is No Spoon passive, loot card look
- Merged: `ccr-f8b59347-xf7dl4` (its 15.4 and 15.5 commits after v10.132), `ccr-task3-orbit`, `claude/loot-screen-card-styling-p6siwe`, `ccr-6a936695-aj8p25`, `claude/tender-mccarthy-qr4h3k`, `ccr-f661268a-k7ifmw` (WEAPON_STATS.md), and the modifier matrix spreadsheet from `ccr-07fe00d5-7fh873`, on main's v10.133.
- Left out (user, 25 Oct): `claude/dreamy-brahmagupta-2xfice` (per-weapon cells for the eleven Projectile weapons mask main's shared forms: Orbiting forms, stored hits, reach; merged then reverted), `claude/loot-card-restrictions-niygz0` (v10.68 loot rule, replaced by v10.117 and v10.118).
- Post-merge fixes: rackextras.js keeps only the Immune Response stepper (no V10 guard: the v9 fallback is gone); spoontest checks Piercing on Standard Issue (moddead.js lists Homing as dead there).
- Known red on main before this merge, unchanged: statuptest (Enzyme Sneeze dps ratio), modstest (expects Homing and Ricochet on Standard Issue, which moddead.js hides).

### Folded from ccr-6a936695-aj8p25: 2026-10-24 Daily Challenge card off the Sample Rack (v10.126)
- Systems: ui
- Files: rackextras.js
- What: the Sample Rack no longer shows the Daily Challenge card (it is on the main menu).
- Save data: none
- Hooks: none
- Risk: none

### Folded from ccr-6a936695-aj8p25: 2026-10-24 Sample Rack as a grid, Random card (v10.125)
- Systems: ui
- Files: rackgrid.js (new), style.css, index.html
- What: the Sample Rack shows the samples as a two-column grid (picture, name, type swatches; descriptions hidden). A RANDOM card sits first and opens Mode Select for a random unlocked sample.
- Save data: none
- Hooks: none (wraps s10Samples, loads after dsheads.js)
- Risk: `TODO_COPY:rack_random_tag` shows on the Random card until the copy is written; paper/eInk menus not checked beyond the default.

### Folded from ccr-f8b59347-xf7dl4: 2026-10-25 Shared mechanics batch 2: objects hold hits, reach (v10.133)
- Systems: stored hits (new), reach (new), wide modifiers, fight, modifier dead table
- Files: holdhits.js (new), reach.js (new), modwide.js, moddead.js, index.html, ARCHITECTURE.md, tests/holdhitstest.js, tests/reachtest.js, tests/run.sh
- What: COMBAT_MATRIX.md 15.4 and 15.5 in code. Your mines store the newest hit from any of your blasts, shots or pools (damage and type) and deliver it as a second typed hit when they go off, as a relay (noArc, so it never starts a chain or arc); a mine holding a Static hit is Charged and Charge arcs jump through it at full strength. Range and Up Close are offered on every attack type: Range scales reach only (blast, pool and contact radius, mine trigger radius, chain jump range, well radius, orbit radius, pet leash; +20% a rank), Up Close scales damage by distance from you as before. MOD_DEAD no longer hides either.
- Save data: none.
- Hooks: holdhits.js wraps aoe, mwMineGo, detonateMine and replaces fightArc; hookOn('tick', 'hhTick'). reach.js: modwide.js MW_NEW range/upclose atk lists widened and the mine trigger radius line reads reachMul(w); reach.js wraps aoe, ring, modWell, wupTick, wupStats, modChain, modOrbit and p11Range (Up Close on pool ticks). Not reached: pet leash (wup3.js), Nappy Mines trigger (game.js), beam blasts. moddead.js table edited by hand (regenerate after this lands).
- Risk: balance. Relayed hits add damage to every mine build next to a second weapon; Range on Burst and Pool weapons makes blasts and pools bigger with no damage cost. Not simulated beyond bot spot checks.

### Folded from ccr-task3-orbit: 2026-10-25 Orbiting forms for Flight and Crowd modifiers (task 3, batch 4)
- Systems: modifier cards, weapons (Delivery), laser, tests
- Files: delivforms.js, moddead.js (regenerated), tests/delivtest.js, tests/moddead.js, ARCHITECTURE.md
- What: Homing, Bounce, Returning, Link, Pull and Knockback now have an Orbiting form (MODIFIER_MATRIX.md 5.11). Bodies break off to chase an enemy within 150 and fly back (Homing), rebound to one more enemy within 80 / 100 / 120 at 60% (Bounce), fling out to double radius and back every 3 / 2.5 / 2 s (Returning), are joined by a damaging beam (Link), drag enemies within 40 / 60 / 80 onto the ring (Pull) and bat what they hit away from themselves (Knockback). A beam's ring (the Laser's and the hoop) sends sparks off to chase, flings, hits enemies crossing it and pulls; the hoop's hits rebound with Bounce. Card text is TODO_COPY:xd_orbiting_<mod> until the user writes it.
- Save data: none.
- Hooks: none in shared files. delivforms.js wraps modifiers.js modOrbit and weapons24.js wupFire (plus another mwTick and modDraw wrap); hookOn('proc', 'xdOrbProc').
- Risk: Orbiting builds with these modifiers deal more damage. When one of the six is held, the bodies run in delivforms.js xdOrbit (a copy of modOrbit plus the forms): a change to modOrbit must be copied there.

### Folded from claude-loot-screen-card-styling-p6siwe: 2026-10-24 Loot cards: neutral with targeted colour
- Systems: ui, rewardui
- Files: style.css, js/uikit.js, js/ui.js
- What: loot screen cards are now neutral. Colour only on the rarity word, the reward-type label (MUTATION, DEFENCE, FEAT and so on, top right, in its rw-* category colour) and a left border in the damage-type colour when the card has one.
- Save data: none
- Hooks: none (uiLootCard wraps the tag text in span.tk; ui.js sets --ec)
- Risk: Lab view/e-ink skins may still style .card borders elsewhere; check visually.

### Folded from claude-loot-screen-card-styling-p6siwe: 2026-10-24 Fit line moves to press and hold
- Systems: rewardui, glossary
- Files: js/rewardui.js, js/glossary.js
- What: the Direct / Fits your build / Wildcard / Trade-off line is gone from loot cards and shows in the press-and-hold card instead. Feat "Next level" numbers stay on the card.
- Save data: none
- Hooks: glossary.js cardGlossary -> rwFitHtml(o, true)
- Risk: none

### Folded from claude-tender-mccarthy-qr4h3k: 2026-10-24 There Is No Spoon becomes a passive; matrix N/A cells enforced (v10.123)
- Systems: sperm passives, modifier matrix, matrix only, tests
- Files: spoon.js (new), matrixna.js (new), matrixonly.js, index.html, meta.js, build.gradle (v10.123, versionCode 402), tests/spoontest.js (new), tests/statuptest.js, tests/run.sh
- What: There Is No Spoon is no longer a weapon; it is a sperm passive (3 ranks and a mastery) that eats enemy bullets near you and fires them back, wider, bigger store and harder hitting per rank. Thirteen modifiers the matrix marks N/A on ten weapons are no longer dealt there (Family Ties: Pulling, Piercing; Ewww, Gross: Connecting, Sticky; Panic Button, Skill Issue, Nervous Wreck: Knockback; Sister Cousin: Homing; Chest Burster: Turncoat; Unwanted Contact: Primer; Enzyme Headbutt: Every Nth; Laser: Range).
- Save data: none (run state G.spSpoon; passive rank in G.muts.sp_spoon).
- Hooks: none (spoon.js wraps v10Tick and pushes to SP_KEEP; matrixna.js wraps modOk).
- Copy: the passive's card text and quip written in-session at the user's request (no TODO_COPY left).
- Risk: There Is No Spoon's combos and branch cards are unreachable now; the passive's balance is not simmed. statuptest now runs 7 trials a side (its result depended on weapon order).

## v10.133 (versionCode 412): 2026-10-25 Enemy handoff Batch C
- Merged: `claude/enemy-c2` (boss telegraphs) and `claude/enemy-c1` (boss HP and placement with sims) into `claude/practical-brahmagupta-ry2k05` on main's v10.132. One build. C3 (one signature pattern per boss) waits on a design conversation.

### Folded from enemy-c2: 2026-10-25 Boss telegraphs (enemy handoff C2)
- Systems: bosses, telegraphs
- Files: bosstells10.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: every boss attack with big damage now shows where and when. Charge (Colossus, Twins) draws a soft lane for the 0.8 s wind-up; Blink (Phantom, Immune Eye) marks the landing spot 0.5 s before the jump and the 14-bullet ring waits 0.3 s after arrival (same 1.6 s rhythm, first jump still 0.6 s into the pattern); the Matron's ward round shows its heal ring for 1 s before the heal and nurses (the boss pulses for the last 0.6 s); the Queen's summon pulses 0.6 s before the adds; the Fever's fire ring shows an outline for the last 0.7 s of each ring (the first ring of a pattern waits 0.7 s). No HP, damage or rate number changed. The fallback "Learn the telegraph" weakness line (boss10.js) is now true for every boss and stays.
- Save data: none.
- Hooks: none in shared files: bosstells10.js wraps `bossAI` (game.js) and `nf10Draw` (newfoes.js) from its own file.
- Risk: Matron's ward round, the Queen's summon and the Fever's first ring start 1.0, 0.6 and 0.7 s later within their 5.5 s pattern window (the adds and heals come slightly later in the fight); Phantom and Eye fire one fewer blink per pattern at most (the ring is 0.3 s late). Not simmed.

### Folded from enemy-c1: 2026-10-25 Boss HP and placement retuned from sims (C1)
- Systems: bosses, wave-mode, prestige
- Files: campaign.js, bosses.js, bosspack.js, prestige.js, waves.js, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: Petri Dish boss health is `CAMP.hp` [3.5, 13, 50, 130] (was [2.2, 13, 50, 160]) with Immune Response kept (campBoss used to overwrite `heatBoss`'s health); Mitch & Osis get half health each (`BOSS_TWIN_HP`); the Failed Experiment takes wave 20 in 1 run of 4 with a tier-3 boss's average health and moves by its weapons' v10 attack type. Race and Endless boss health grows by index without the sawtooth (`bossGrow`); Endless draws bosses by tier like wave mode; the Sneeze and the Litmus Strip's glare go through `V10_DIFF.dmg`.
- Numbers (each in one place): `CAMP.hp` [2.2, 13, 50, 160] -> [3.5, 13, 50, 130]; `CAMP.hpClock` 600 (was inline, unchanged); `CAMP.failedOdds` 0.25 (was 0.5 of wave 15 or 20); `CAMP.failedHp` 1 (was x1.4) on def hp = tier-3 average 3333 (was 2600 + 25 x level); `BOSS_TWIN_HP` 0.5 (new, bosses.js, every mode); `BOSS_GROW_ON` 1.5 per boss after the fourth (bosses.js; replaces `(1 + round x 4)` restarting at idx % 4); `FAILED_MOVES` proj spiral, spread aimedFan, burst ring, beam doubleSpiral, pool acidrain, contact charge.
- Save data: none.
- Hooks: waves.js initWaves -> bossTierRoster (Endless); prestige.js heatBoss split into heatBossHp (read by campaign.js campBoss).
- Risk: Race bosses 1 to 4 are unchanged; a fifth and later Race or Endless boss is much tougher than before (was reset to the first's size x5). Twins are softer everywhere. Wave 5 bosses 60% tougher.

### After (same sims; final numbers)
`node sim/wave20.js 4 mortal` (final), plus god runs (`1 god`, `1 god --boss failed`, `1 god --boss twins`) and the mortal set before the twins change.

Mortal (final): 1 of 4 wins (wave 20 Chad Prime in 41 s). Deaths: wave 10 (Mitch & Osis), 15 (Mitch & Osis at 48%), 15
(Mitch & Osis at 43%). Before the twins change: 0 of 4, deaths 13 (Acid drip), 10 (Twins at 4% after 483 s), 20
(Fever at 69%), 15 (Twins at 76%). No death before wave 5 in all 8 runs.

| Wave (HP) | Fights (s), all after-runs | Median before -> after |
|---|---|---|
| 5 (3.0k) | Mucus Plug 14, 10, 19; Litmus 80, 16; Sneeze 23; Johnny 64, 96, 317, 56, 91 | 31 -> 56 |
| 10 (8.2k per twin, 13k to 31k) | Stone 82, 51; Pepsinator 92, 89; Phantom 30, 19; Matron 210; Twins 33, 18 (483 before the twins change) | 72 -> 51 |
| 15 (100k to 131k; twins 37k each) | Phantom 56; Eye 88; Queen 219; Matron 36 | 116 (Failed Experiment) -> 72 |
| 20 (345k to 381k) | Failed Experiment 115 (381k); Chad Prime 111, 41 | 167 -> 111 |

Outliers are mechanics, not health: the Johnny (front bounce), the Litmus Strip, the Matron and the Queen (healing).

Per-wave seconds and hurt, final mortal runs 0 to 3:

| Wave | Run 0 | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 1 crawler | 80 s, 9/123 | 36 s, 0/123 | 71 s, 52/123 | 40 s, 26/123 |
| 2 skitter | 35 s, 14/126 | 41 s, 0/126 | 58 s, 41/126 | 47 s, 41/101 |
| 3 spitter | 50 s, 22/129 | 49 s, 0/134 | 54 s, 0/135 | 46 s, 34/104 |
| 4 brute | 67 s, 0/132 | 56 s, 3/137 | 56 s, 0/138 | 51 s, 4/107 |
| 5 boss | 107 s, 122/138 | 35 s, 58/144 | 32 s, 0/140 | 39 s, 47/109 |
| 6 to 9 | 55 to 94 s, 0 to 149 | 52 to 113 s, 0 to 89 | 53 to 83 s, 0 | 51 to 79 s, 3 to 40 |
| 10 boss | died (Twins) | Matron 222 s, 210/188 | Pepsinator 101 s, 93/181 | Twins 30 s, 1/161 |
| 15 boss | | died (Twins) | died (Twins) | Matron 46 s, 4/269 |
| 20 boss | | | | Chad Prime 51 s, WIN |

Race (`node sim/race.js 3 mortal`): 0 of 3, deaths at 3:40, 6:29, 3:40 (baseline 3:12 to 5:00); bosses 1 to 4 have the same health as before.


### Folded from enemy-c1: Baseline (measured before any change; main v10.131, 25 Oct 2026)
`node sim/wave20.js 4 mortal`, plus god runs (`2 god`, `1 god --boss twins`, `1 god --boss colossus`). Boss fight =
wave seconds minus the entourage lead (16 s at wave 5, 12 s at 10 and 15, 10 s at 20, 1.5 s for the Failed Experiment).

Mortal: 0 of 4 wins. Deaths: wave 14 (Acid drip, Phantom Pregnancy's entourage), 9 (Mucus Wall elite), 9 (Mucus Wall
elite), 10 (Mitch & Osis at 80%). No death before wave 5.

| Wave (HP) | Mortal fights (s) | God fights (s) |
|---|---|---|
| 5 (1.9k) | Sneeze 30, Litmus 7, Cramp 16, Cramp 26 | Johnny 144, Johnny 79, Sneeze 32, Litmus 251 |
| 10 (13k to 31k) | Phantom 46 | Pepsinator 87, Kidney Stone 72, Queen 19, Twins 703 (16k HP; the 8 s revive loops) |
| 15 Failed Experiment (198k, lv 44 copy) | none reached | 128, 248, 75, 105 |
| 20 (425k to 538k) | none reached | Chad Prime 216 (win), Chad Prime died at 83% after about 48, Colossus 118 (win) |

Per-wave seconds and hurt (mortal runs 0 to 3; hurt is HP lost that wave / max HP):

| Wave | Run 0 | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 1 crawler | 52 s, 23/123 | 48 s, 11/123 | 65 s, 38/123 | 47 s, 21/123 |
| 2 skitter | 45 s, 36/126 | 49 s, 16/101 | 45 s, 20/126 | 42 s, 56/126 |
| 3 spitter | 48 s, 13/129 | 50 s, 7/103 | 53 s, 0/104 | 47 s, 65/129 |
| 4 brute | 62 s, 71/132 | 54 s, 34/107 | 46 s, 61/107 | 51 s, 32/131 |
| 5 boss | 46 s, 5/134 | 23 s, 17/109 | 32 s, 6/107 | 42 s, 97/134 |
| 6 ingrown | 56 s, 0/140 | 53 s, 31/113 | 62 s, 97/113 | 59 s, 19/140 |
| 7 shell | 65 s, 42/143 | 55 s, 59/115 | 72 s, 23/113 | 55 s, 29/141 |
| 8 mosquito | 58 s, 37/144 | 56 s, 141/121 | 57 s, 80/116 | 60 s, 14/143 |
| 9 bulwark | 98 s, 156/147 | died | died | 131 s, 202/146 |
| 10 boss | 58 s, 207/149 | | | died |
| 11 to 13 | 36 s 10, 71 s 59, 55 s 61 | | | |
| 14 | died | | | |

## v10.132 (versionCode 411): 2026-10-25 Shared mechanics batch 1: tags, bodies, collisions
- Merged: `ccr-f8b59347-xf7dl4` into `main` on main's v10.131. COMBAT_MATRIX.md section 15 (shared mechanics proposal) and rules 15.1 to 15.3 in code; MODIFIER_MATRIX.md section 8 lists the cells they cover.

### Folded from ccr-f8b59347-xf7dl4: 2026-10-25 Shared mechanics batch 1: tags, bodies, collisions
- Systems: weapon tags (new), bodies (new), collisions (new), wide modifiers
- Files: wtags.js (new), bodies.js (new), collide.js (new), modwide.js, index.html, tests/wtagstest.js, tests/bodiestest.js, tests/collidetest.js, tests/run.sh
- What: COMBAT_MATRIX.md 15.1 to 15.3 in code. Every weapon carries tags (`wTags(w)`, live with its modifiers). Your mines and pools are bodies: wells pull, hold and fling them (mine half, pool quarter; +50% on a supernova) and knockback blasts scatter them. A knocked enemy moving faster than its base speed deals Force collision damage to itself and whatever it hits (mate or wall; 40% to 100% of the launching hit by speed), trips your mines, and passes on velocity slower than it had. Collide.js owns collisions; modwide's Wall Slam loop stands down when it is loaded (Knockback branch A adds +20/+40% to collision damage, Bowling Ball and Trampoline change the transfer). Laser mines are not bodies yet.
- Save data: none.
- Hooks: modwide.js mwTick Wall Slam loop, delivforms.js Melee Bouncer loop and wup1.js shove tracker (Bumper Cars, Pile-Up, Skittles, Riot Control) -> one-line skip when `cdOn()`; wup1.js shoveTrack records the launching hit (`e.cdLast`). `G.cdN` counts collisions. bodies.js wraps wellTick, aoe, mwMineGo and detonateMine. collide.js registers hookOn('tick', 'cdTick') and hookOn('proc', 'cdProc'); bodies.js hookOn('tick', 'bdTick').
- Risk: balance. Collision damage is new damage on every knockback build (Skill Issue, Panic Button, Knockback modifier); wells now carry mines, so Family Ties next to a mine-layer moves the minefield. Not simulated yet: run `node sim/wave20.js 4 mortal` before trusting the win rate.

### Folded from ccr-f8b59347-xf7dl4: 2026-10-25 Shared mechanics proposal (docs only)
- Systems: docs
- Files: redesign docs/COMBAT_MATRIX.md (section 15, decisions 64 to 68), redesign docs/WEAPON_TAGS.md (new), redesign docs/MODIFIER_MATRIX.md (section 8, Range and Up Close N/A rows)
- What: five game-layer rules proposed so weapons and modifiers combine through shared nouns; 42 modifier cells listed for removal once simulated.
- Save data: none.
- Hooks: none.
- Risk: none (docs).
## v10.131 (versionCode 410): 2026-10-25 Strike from Above forms for Flight and Crowd modifiers (task 3 batch 3)
- Merged: ccr-task3-dfa (MODAUDIT_HANDOFF.md task 3, batch 3). Dead-card table regenerated in the branch.

### Folded from ccr-task3-dfa: 2026-10-25 Strike from Above forms for Flight and Crowd modifiers (task 3, batch 3)
- Systems: modifier cards, weapons (Delivery), laser, tests
- Files: delivforms.js, moddead.js (regenerated), tests/delivtest.js, ARCHITECTURE.md
- What: Homing, Bounce, Returning, Link, Pull and Knockback now have a Strike from Above form (MODIFIER_MATRIX.md 5.11). The marker follows its target (Homing) and pulls enemies onto it (Pull); the strike lands again on up to 1 / 2 / 3 nearby enemies at 60% (Bounce), sends a line of small strikes back to you (Returning), is joined to the last strike by a 2 s damaging beam (Link) and shoves outward from where it lands (Knockback). The Laser's orbital strikes get the same forms (a new target on Homing, a short second orbital strike on Bounce, a beam sweeping back on Returning). Card text is TODO_COPY:xd_dfa_<mod> until the user writes it.
- Save data: none.
- Hooks: none in shared files. delivforms.js wraps modwide.js mwDfa and laserbeam.js lzOrbital (plus another mwTick and lzExtrasTick wrap).
- Risk: Strike from Above builds with these modifiers deal more damage (bounces, walk-back strikes, link beams). The Laser's orbital strike hits run in delivforms.js (a copy of lzExtrasTick's formula) whenever one of the six modifiers is held: a change to that formula in laserbeam.js must be copied to xdOrbs.


## v10.130 (versionCode 409): 2026-10-25 Enemy handoff Batch B
- Merged: `claude/enemy-b1` to `claude/enemy-b11` (ENEMY_HANDOFF.md Batch B: the roster's promised behaviours) into `claude/practical-brahmagupta-ry2k05` on main's v10.129. One build. Post-merge fixes: shooter detection by attack type (`defShoots`, game.js) for the chevron, SHOOTERS FIRST tier and spawn weight; no Gifting affix on an aura giver; the Snot Bubble's Static pop on the `hit:late` event; f3test drops the Cooties-only antihistamine check.

### Folded from enemy-b1: 2026-10-25 Marked bursts: Acid Bubble and Snot Bubble (enemy handoff B1)
- Systems: enemies
- Files: bursts10.js (new), roster.js (bomber ai -> new_bomber), game.js (one ai name in the danger weight), index.html, ARCHITECTURE.md, tests/newfoestest.js
- What: the Acid Bubble stops near you, marks its ring for 0.5 s, then bursts once (18, Burst, Evasion never applies) and leaves an Acid Pool; killed first it only pops the pool (no blast, no friendly fire). A Snot Bubble killed by you marks its splash area for 0.5 s before it lands, then leaves a Mucus Pool (80 radius, 4 s, Snotty while you stand in it); Static still pops it at once and harmlessly.
- Save data: none
- Hooks: hooks.js tick and kill via hookOn; wraps nf10Draw (newfoes.js) and foes3Kill (foes3.js, deferred only when called with a src, so f3test is unchanged)
- Risk: the Acid Bubble's old contact-kill blast and its friendly fire are gone; Acid Pool tick damage (0.2 x 18 per 0.5 s) and Snot pool dose (0.6 s) are my choices, the roster gives none. Levels' Amylase Droplet copies the bubble and inherits it.

### Folded from enemy-b2: 2026-10-25 Killer T-Cell fires a telegraphed Beam (B2, not shipped)
- Systems: new enemies, player defences
- Files: lancer10.js (new), index.html, roster.js, pdef.js, game.js, tests/newfoestest.js, tests/pdeftest.js
- What: the Killer T-Cell holds range, lights a fixed lane to you for 0.9 s (nothing hurts during it), then fires a 0.4 s Beam of four hits down that lane, stopped by walls. Hits go through `hurtPlayer` as kind `beam`, so Evasion and the old dodge roll never apply and leaving the lane avoids it; Membrane and Shell still do. Force or Static hits during the wind-up interrupt it. Its v9 `shoot` row is gone.
- Save data: none
- Hooks: pdef.js PDEF_ATK gains `beam: 'beam'`; game.js hurtPlayer skips the old `P.dodge` roll when kind is `beam`; `proc` hook (lancerInterrupt); wraps `nf10Draw`.
- Risk: damage is the roster 16 per Beam, then the usual V10 hurt scaling (about 12 landed in tests). Unsimmed. `ENEMY_BEHAVIOUR.md` not regenerated.

### Folded from enemy-b3: 2026-10-25 Cytokine Caster fan and Diatom ring with tells
- Systems: enemies
- Files: shooters10.js (new), roster.js (Caster and Diatom rows only), index.html, tests/newfoestest.js, ARCHITECTURE.md
- What: the Caster shows a 0.5 s fan outline then fires 5 Acid shots over 70 degrees; the Diatom shows a 0.4 s ring outline (a tick per shot) then fires a ring of 6. Both stand still during the tell; aim is locked when it starts. Their `shoot` rows are gone (damage, count, arc, speed and cooldown read from `atk[0]`).
- Save data: none.
- Hooks: none in shared files (index.html script tag after newfoes.js; wraps `nf10Draw`).
- Risk: with no `def.shoot` the two lose the off-screen shooter chevron (render.js), the autorun aim tier (autorun.js `aimShootTier`) and the 0.4x spawn weight for shooters (game.js `wOf`), so they spawn more often than before. Global `BUL.keep` still drops 1 bullet in 10, so a fan can show 4.

### Folded from enemy-b4: 2026-10-25 Mucus Wall and Interferon grant a capped Membrane (enemy handoff B4)
- Systems: enemies
- Files: foeaura10.js (new), index.html, game.js, foes.js, foes2.js, ARCHITECTURE.md, tests/foememtest.js
- What: allies without a defence of their own near a Mucus Wall (115) or Interferon (170) get a 25% Membrane through fight.js's pool, drawn as the enemy bubble; it is removed 1.5 s after the last giver stops refreshing it. Native Membranes, Shell, Thorns and Evasion are left alone, so nothing stacks past the cap. `auraArm` (+4 armour) and Interferon's flat absorb (`ifn`) are gone.
- Save data: none
- Hooks: hookOn('tick') in foeaura10.js; game.js 'aura' case emptied, effArmour and foes.js no longer read auraArm; foes2.js interferon AI and foes2Dmg no longer use ifn.
- Risk: Mucus Wall/Interferon packs now make enemies sturdier by a Membrane instead of 4 armour / flat absorb (balance unsimmed); old `ifn`/`auraArm` writes in newfeats.js are harmless.

### Folded from enemy-b5: 2026-10-25 Ghost Swimmer phases as Evasion, Quantum Swimmer tells its jump (B5, unshipped)
- Systems: enemies (roster behaviours), rendering
- Files: phasers10.js (new), game.js, render.js, index.html, ARCHITECTURE.md, tests/newfoestest.js
- What: a phased Ghost Swimmer stays hittable (damageEnemy no longer returns 0; autoaim can pick it; its Evasion defence still rolls) with contact off and a flicker (also the last 0.4 s before it fades). Quantum Swimmer picks its landing spot, draws a puff there for 0.4 s, then jumps; one jump per 2 s at most.
- Save data: none.
- Hooks: game.js 'blink' case -> qsBlink; render.js enemy alpha (2 lines) -> phFlick; phasers10.js wraps nf10Draw and registers a 'tick' hook.
- Risk: Ghost is now killable while faded (easier); Quantum's jump is 0.4 s slower.

### Folded from enemy-b6: 2026-10-25 Summon and heal caps (enemy handoff B6)
- Systems: enemies, roster
- Files: game.js (medic, summon, split), foes2.js (stem), tests/newfoestest.js
- What: Mother Cell keeps at most `summon.cap` (6) living children; Nurse Cell heals each ally at most `heal.perTargetCap` (3) times and skips full-health allies; Stem Cell revives at most `summon.cap` (3) per Stem; Mitotic Cell splits only while `splitGen < splitCap`.
- Save data: none
- Hooks: none (edits in place)
- Risk: Nurse/Mother waves are slightly easier to clear; Stem stops after 3 revives (it idles).

### Folded from enemy-b7: 2026-10-25 Elite affixes (ENEMY_HANDOFF B7)
- Systems: enemies, elites
- Files: elites10.js (new), v10.js, index.html, tests/elitetest.js (new), tests/run.sh, ARCHITECTURE.md
- What: every elite (not boss, rival or egg) gets exactly one affix picked by its roster role: Trailing (chargers leave 2 s pools, hurt 30% of contact damage per 0.5 s), Fanning (shooters swap every third volley for a 0.8 s telegraphed 5-shot 60 degree spread), Gifting (tanks give one unshielded ally within 260 a 25% Membrane for 3 s, drawn link, every 7 s), Hasty (chasers x1.5 speed below 30% health, ring and streaks). Smouldering (newfoes.js) is routed through the picker: 25% where the role has a specific affix, always where it has none. A small mark above the elite shows the affix; no text on screen. Elite HP stays x5.
- Save data: none
- Hooks: v10.js v10Draw -> el10Draw; `hookOn('tick', 'el10Tick', ..., -1)` (runs before nf10Tick); `shootPattern` is wrapped in elites10.js (Fanning volley counter).
- Risk: roles with no specific affix (swarm, carrier, summoner, leech, relay, sprinter, sniper, controller, support) now always roll Smouldering (was 25%), so every elite of those roles bursts on death; shooters that do not call `shootPattern` never fan.

### Folded from enemy-b8: 2026-10-25 Hidden sixth defences and Amoeba parked (B8, B9)
- Systems: enemies (roster), combat (defences), fight
- Files: roster.js (Callus, Water Bear, Amoeba rows), game.js (damageEnemy: `tun` and `noCrit` checks removed), fight.js (`thickLayers`, Shell ring display), data.js and foes2.js (legacy `tun`/`noCrit` flags removed), ENEMY_STATS.md, ENEMY_BEHAVIOUR.md
- What: Callus can be crit again and instead has one Shell layer with twice the usual layer hit points (`thickLayers`, read in `fightCd`). Water Bears no longer curl into a near-invulnerable tun. The Amoeba is parked (`w: 0`, `status: 'park'`) until its engulf is designed.
- Save data: none
- Hooks: none
- Risk: Water Bear is easier to kill below 30% health; Callus takes crits (balance unsimmed). Amoeba and Plasmodium (splits into Amoeba, already a cut candidate) no longer spawn from the director.

### Folded from enemy-b10: 2026-10-25 Phlegm Hocker leaves a Mucus patch (not shipped)
- Systems: enemies (foes3), world objects (Mucus patch)
- Files: web/js/foes3.js, tests/f3test.js
- What: the Hocker's glob now leaves a 40-wide, 4 s Mucus patch (`fightPatch`, fight.js) where it lands, bursts or runs out of range; standing in one keeps you Snotty. The gargle (Water makes the next 3 globs rinse puddles), the GARGLED reaction and the unused `pk` dose are deleted. Hocker tip text is `TODO_COPY:hocker_tip`.
- Save data: none
- Hooks: hookOn('tick', 'f3patch') in foes3.js; no shared file edited.
- Risk: more ice zones on screen (capped at 150); patches feed Slick Move, Snot Socket and Flammable Mucus. f3test's antihistamine and popped checks already failed before this change (unrelated).

### Folded from enemy-b11: 2026-10-25 Knockback rules from the matrix (B11)
- Systems: combat, fight
- Files: game.js (damageEnemy knockback line), fight.js (knockDefMul), combat.js (two COMBAT constants), tests/fighttest.js
- What: Squishy enemies take 50% less knockback (COMBAT_MATRIX 11.4); an enemy whose Membrane is up takes 50% less too (matrix 3 gives no figure; Force already does 50% to Membrane). The generic x1.5 knockback on Snotty (chill) enemies is gone; Snot Rocket keeps its own launch.
- Save data: none
- Hooks: none (game.js calls knockDefMul from fight.js)
- Risk: Snotty enemies slide less far; Squishy and Membrane enemies are shoved half as far, so Force/Knockback builds feel weaker against them. Pull (12.2) not changed here.

## v10.129 (versionCode 408): 2026-10-25 Enemy handoff Batch A
- Merged: `claude/practical-brahmagupta-ry2k05` (enemy assessment; ENEMY_HANDOFF.md Batch A, branches enemy-a1a to enemy-a7) into main's v10.127. One build.
- Also merged: `claude/enemy-a1b` (A1b, relics ported to v10: `relics10.js`, `tests/relictest.js`; 12 `TODO_COPY:relic_*`/`spoils_hide_desc` placeholders).

### Folded from enemy-a1b: 2026-10-25 Relics ported to v10 (A1b)
- Systems: relics, pdef, spoils, bosses
- Files: relics10.js (new), bosses.js, bosspack.js, rrelics.js, spoils.js, pdef.js, game.js, data.js, index.html, tests/relictest.js (new), tests/run.sh, ARCHITECTURE.md
- What: every boss and rival relic and every SPOILS card now does something under v10. Armour relics grow the player's v10 Shell layers instead (refit with card layers, capped at 6); Acid relics build Corrosion and make Acid Pools instead of Cooties and armour shred; heat relics use the one shared Burn and its bar instead of the v9 melting burn; Cooties zones became Acid (Ulcer) and Mucus (Slime Trail); Gene Swap only offers v10 damage types. Three card promises that were never built now are (See-Through's pass-through, Pickpocket's XP, the Queen's third guard at once). 11 relic texts and Trophy Hide are `TODO_COPY` placeholders.
- Save data: none (no relic id renamed or removed; run-only G.relHide, G.relRx, G.courtN).
- Hooks: pdef.js pdRefit -> relShell; game.js hurtPlayer passes `kind` to relicDamageIn; game.js optMod 'elemental' filters by V10_TYPES; relics10.js registers dmgMul 'relRxMul'.
- Risk: balance. Shell relics are strong early (3 off per layer; Border Wall 3 layers, Calcified 4); See-Through now lets half of all bullets through (as its card always said); Running Hot fills Burn bars on every weapon hit. Shared: the Gene Swap filter also applies to the 'elemental' modifier wherever optMod offers it.

### Relic audit (keep / port / retire)
Totals: 84 relics (45 boss, 39 rival incl. the duplicate id `ectoplasm`), 8 SPOILS plus Gene Swap. Kept 67, ported 17 (+ 3 SPOILS), retired 0 (every boss has exactly three relics, so none could go).

| Relic (id) | Verdict | Old mechanic -> v10 mechanic |
|---|---|---|
| Border Wall (borderwall) | port | +10 armour -> +3 Shell layers (pdef); +40% HP, -10% speed kept |
| Calcified (calcified) | port | +12 armour -> +4 Shell layers; +25% HP, -8% speed kept |
| Ribbed (ribbed) | port | +4 armour -> +1 Shell layer; +2 Headstrong kept |
| Mucus Wall (mucuswall, rival) | port | +6 armour -> +2 Shell layers; -5% speed kept |
| Acid Tongue (corrosive) | port | armour shred + Cooties DoT -> each weapon hit fills the Corrosion bar by 30% of the hit (strips a Shell layer, or Corroded) |
| Bad Blood (acidblood) | port | Cooties (poison) burst -> Acid (fire) Burst, builds Corrosion |
| Ulcer (ulcer) | port | Cooties puddle -> Acid Pool (elem fire): Corrosion and Pool damage |
| Running Hot (runninghot) | port | v9 melting `e.burn` -> 30% of each weapon hit feeds the shared burn (burnAdd) and the Burn bar (Ignition) |
| Fever Dream (feverdream) | port | counts `e.burn` -> counts burning enemies (`cd.burnT`, f_burning) |
| Heatstroke (heatstroke) | port | melting enemies blow up as Acid -> burning enemies blow up as a Fire (flame) Burst |
| Blue to Red (bluetored) | port | 15% v9 melt + 15% chill -> 15% Corrosion fill (a full hit as Acid) + 15% Mucus Snare (fightStatus). Kept Acid/Mucus (the litmus pair) rather than the Burn bar the brief suggested |
| Lithotripsy (lithotripsy) | port | 2 armour shred per hit -> each weapon hit wears the outer Shell layer by 50% of the hit |
| Pissing Razor Blades (razors) | port | Force burst with shred 6 -> Force Burst that also wears each hit enemy's Shell layer by its damage |
| Slime Trail (slimetrail, rival) | port | Cooties trail -> Mucus (ice) trail: Snares, same damage |
| See-Through (seethrough) | port | only +20% dodge was built -> also half of all bullet hits pass straight through (card text unchanged) |
| Pickpocket (pickpocket, rival) | port | only +50% pickup range was built -> also +15% XP |
| The Queen's Court (court) | port | only two guards for the first 15 s -> three at once, a fallen one back in 15 s |
| Universal Indicator (indicator) | keep | counts v10 types already (weaponSrc) |
| Test Strip (teststrip) | keep | Litmus Strip only |
| Rubber Johnny (rubber) | keep | already v10 (pdef shield) |
| Second Stomach, Swallow Whole, Bouncer, Diplomatic Immunity, Third Eye, Death Stare, Mother's Intuition, Bedside Manner, Triage, Transfusion, Pre-Workout, Tail Whip, Flying Start, Mirror Twin, Double Trouble, Seconds, Poltergeist, Reservoir Tip, Plugged, Snot Rocket, Mucous Membrane, Stitch, Charley Horse, Clench, Bless You, Atishoo, Catch It Bin It Kill It | keep | work as written (stats, ticks, heals, Force/Blood hits, `e.mark`, stasis) |
| Rival: Personal Best, Marathon, Gains, Head Coach, Honorary Degree, Thesis Defence, Small Mercies, Throwing a Wobbly, Just Kevin, Kevin's Mum, Head Start, Early Bird, Five-Finger Discount, Load-Bearing, Eagle Eye, Steady Hand, Buckshot, Trigger Happy, Ectoplasm, Now You See Me, Her Boys, Packed Lunch, Blood Bank, Undead Membership, Sticky Situation, Pep Talk, The Whistle, Encore, Exit Stage Left, Knitted Cardigan, Not Today Dear, Nine Espressos, Full Meltdown, Calculated Odds, Probability Cloud, Powerhouse of the Cell, Mourning Wear | keep | work as written |
| SPOILS Trophy Hide (hide) | port | +4 armour -> +1 Shell layer per pick; +6% dodge kept |
| SPOILS Lab Notes (notes) | port | `P.react` is v9 only -> reaction damage x1.4 per pick (relRxMul); +10% damage types kept |
| SPOILS Gene Swap | port | any `ELEMENTS` key (Cooties, Oil, Water...) -> `V10_TYPES` only |
| SPOILS Trophy Polish, Boss Blood, Adrenal Gland, Victory Lap, Finder's Fee, Killer Instinct | keep | work as written |

### Folded from claude-practical-brahmagupta-ry2k05: 2026-10-25 Enemy assessment: Batch A merged (v10.126)
- Systems: bosses, enemies, roster, campaign, ui, docs
- Files: ENEMY_HANDOFF.md (new), ENEMY_COPY_BRIEF.md (new, from enemy-a7), tests/statuptest.js, tests/v10test.js, tests/autoruntest.js, plus the seven `changes/enemy-a*.md` fragments merged with their branches (enemy-a1a, a2, a3, a4, a5, a6, a7)
- What: the seven Batch A tasks from `ENEMY_HANDOFF.md` merged and shipped as one build: relic, spoils and rival-trophy boxes open again; Chad Prime's second dodge, the Johnny's front rules and the Litmus Strip's retired colours gone, Kidney Stone sheds a Shell layer per enrage, the twins get their roster defences; armour display and HIGHEST ARMOUR targeting gone (TOUGHEST counts Membrane and Shell); Mirror Cell, Grease Ball, Platelet Clump, Brood Cyst, Broodling and Planarian join ROSTER, Litmus Cell parked, no v9 type multipliers; Level 1 germs and the Tartar Colony use the wired roster; Field Guide counts, the Ingrown Hair sighting line and the player guide fixed. Tests: v10test no longer expects relic boxes dropped; autoruntest expects the retired armour directive to read as TOUGHEST; statuptest silences first-sighting cards and narrator lines (it is still noisy: the same weapon swings 39 to 71 damage between identical seeded runs on main, so a 20% band fails by chance).
- Save data: none.
- Hooks: bosses.js spawnBoss -> boss10Twins (boss10.js); fight.js fightCd reads e.v10def first and fightId falls back to def.rosterId (levels.js).
- Risk: boss fights untested in play (A2 sims could not force a named boss); Level 1 balance after the 0.45 boss knob (bot won once in the sim); three live placeholders: TODO_COPY:aim_tough_desc (TOUGHEST aim line), boss_stone_crack (Kidney Stone float text), tartar_desc (Level 1 boss card).

### Folded from enemy-a1a: 2026-10-25 Relic boxes open again (handoff A1a, not shipped)
- Systems: loot, bosses, rewards
- Files: web/js/draft.js, web/js/raceplan.js, tests/bosstest.js
- What: `draftBox` now lets `relic`, `spoils` and `rrelic` boxes open (v10 dropped them, so boss relics never appeared); `rplanFree` passes `spoils` and `rrelic` in the Race. Wave mode already exempts `now` boxes in `waveHoldsLoot`; `dirGate` opens `now` boxes at once.
- Save data: none
- Hooks: none (one list extended in draft.js draftBox, one in raceplan.js rplanFree)
- Risk: boss kills now open two extra screens (relic, spoils); relic effects are unported (A1b), so some do nothing under v10.

### Folded from enemy-a2: 2026-10-25 Boss rules against v10 (A2, no build)
- Systems: bosses, defences
- Files: data.js, bosses.js, bosspack.js, boss10.js, fight.js (one token), tests/bossshot.js
- What: Chad Prime has only Evasion (the 30% `dodge` is gone). The Johnny no longer bounces shots off its front or takes 0.4x there (its Membrane is the defence; the overshoot opening still pays 1.5x). Litmus Strip tests the seven live damage types and resists a wrong type by 35% (0.65). Mitch has a Membrane and Osis a Shell, each from the roster `parts` (`boss10Twins`, `e.v10def` read first by `fightCd`). Each Kidney Stone enrage sheds one Shell layer (armour, shred-stick and "-10 ARMOUR" code removed). The Fever's rage is speed x2 and attack rate x1.5 (was dt x2); `resist.fire === 0` checks removed. The Fever's `frozen` glue trigger is kept: Conjoined and Held in Suspension both set `frozen` on bosses (0.5 s, 0.3 s).
- Save data: none
- Hooks: bosses.js spawnBoss -> boss10Twins; fight.js fightCd reads e.v10def; bpBounce hook in bossDodges removed.
- Risk: Johnny and Kidney Stone fights are easier to damage (no 0.4x front); Stone's Shell is 6 layers on the roster, not 40 armour. Intro cards for Johnny, Stone, Prime and Fever may still name the old rules (copy, see report). Boss HP untouched.

### Folded from enemy-a3: 2026-10-25 Armour display and targeting purge (A3)
- Systems: ui (inspector), render, targeting (aim), data
- Files: inspect.js, render.js, data.js, game.js, autorun.js, newfeats.js
- What: the inspector no longer shows an Armour stat or WEAK TO / RESISTS rows; the boss `[ARMOUR N]` tag and the armour arc on aura-armoured enemies are gone. HIGHEST ARMOUR is removed from the aim menu; TOUGHEST now ranks by max HP plus the defence pool (Membrane pool, Shell layers' health). The retired id `armour` still resolves (as TOUGHEST) so stored directives and pairs work; Formic Acid now aims at `strongest`.
- Save data: none
- Hooks: none
- Risk: TOUGHEST now creates the defence state (`fightCd`) when it scores an enemy; `armour` fields on defs untouched (E1 deletes them). TOUGHEST description is `TODO_COPY:aim_tough_desc`.

### Folded from enemy-a4: 2026-10-25 Strays into the roster (no build)
- Systems: enemies, roster
- Files: roster.js, foes2.js, pstatus.js, game.js, ENEMY_STATS.md, ENEMY_BEHAVIOUR.md
- What: Mirror Cell (Membrane), Grease Ball (Squishy), Platelet Clump, Brood Cyst, Broodling, Planarian are ROSTER rows with v10 defences; the Litmus Cell is retired (`w: 0`, `status: 'park'`, kept by id). `foes2Dmg` no longer applies weak/resist. Mirror's front reflection is gone; Grease Ball no longer lubricates you (slick zone, `pstGrip` effect and the enemy Oil look removed, its slow glob stays); Platelet Clump costs a piercing shot one extra pierce instead of stopping it.
- Save data: none.
- Hooks: none added (game.js: removed the `pstGrip()` factor and the `z.oil` fizz line).
- Risk: Mirror Cell and Grease Ball are now tankier in effect (Membrane/Squishy on top of old HP); not simmed for balance.

### Folded from enemy-a5: 2026-10-25 Level 1 enemies on the v10 roster (handoff A5)
- Systems: campaign (levels), fight
- Files: levels.js, fight.js
- What: Level 1's five germs and the Tartar Colony are now built on first use (after the roster is wired), so they keep their base enemy's v10 defence and attacks instead of pre-roster copies; the Colony gets the Colossus's Shell x5 and no armour, and its HP takes the V10_DIFF.bossHp knob like every other mode. Its description is `TODO_COPY:tartar_desc`; its strengths and weaknesses are the Colossus's v10 ones.
- Save data: none
- Hooks: fight.js fightId falls back to `def.rosterId` (set on the Level 1 copies).
- Risk: Level 1 enemies are tougher or squishier by their base's v10 defence; Colony HP is about 0.45x what it was. Level 1 balance not re-simmed beyond one bot win (207 s).

### Folded from enemy-a6: 2026-10-25 Enemy bookkeeping: intro keys, live Field Guide counts, guide and litmus sprite (no version)
- Systems: enemies, ui (Field Guide), tools
- Files: voice.js, intro.js, junk.js, ui.js, bosspack.js, data.js, roster.js, tests/tools/guide.js, GAME_GUIDE.md
- What: the Ingrown Hair sighting line is keyed `ingrown` (it was `thorny`, so it never showed). Pinworm and Plasmodium are gone from the first-sighting cards and from the Junk DNA powers. The "n OF N" counts (first-sighting card, Field Guide header, enemy list, Tutorials line) count only enemies that can still turn up: a live roster weight, a wave mix or a campaign level's own enemy (63 of 70 today). The Litmus Strip boss draws with its own `litmusstrip` sprite; the Litmus Cell keeps `litmus`, so the boss no longer runs the cell's paper strip drawing. The player guide's enemy table is built from the wired roster: no Armour or Weak/resists columns, a Defence column (Squishy, Membrane, Shell, Thorns, Evasion) instead, and roster role names where the old AI label is missing.
- Save data: none (ids unchanged; `META.seen` keys unchanged).
- Hooks: none.
- Risk: Field Guide counts drop from 70 to 63 (N) and seen counts follow the same rule. Splitling, Volvoxling, Yeast, Pepsinjr, Endoskeleton, Broodling and Spore are not counted while they have no live spawn; meeting one does not raise the count. Ingrown Hair's sighting line still reads "Thorny" (copy, not changed). Guide enemy behaviour for new_* AIs shows roster roles, not sentences (copy, not changed).

### Folded from enemy-a7: 2026-10-25 Copy brief for stale enemy text
- Systems: docs
- Files: ENEMY_COPY_BRIEF.md (new)
- What: One brief lists the enemy, boss, status, glossary and Field Guide lines that name dead or changed mechanics. Each row has a TODO_COPY id (or a delete), the current text and its length, the facts the new line must convey, and a neighbour line. No game code or existing text changed.
- Save data: none
- Hooks: none
- Risk: none

## v10.128: 2026-10-25 Melee forms for Flight and Crowd modifiers (task 3 batch 2)
- Merged: ccr-task3-melee (MODAUDIT_HANDOFF.md task 3, batch 2). Dead-card table regenerated in the branch: 648 -> 631 no-op combos hidden.

### Folded from ccr-task3-melee: 2026-10-25 Melee forms for Flight and Crowd modifiers (handoff task 3, batch 2)
- Systems: modifier cards (Delivery forms), weapons (Melee, Laser sword), tests
- Files: delivforms.js, moddead.js (regenerated), ARCHITECTURE.md, tests/delivtest.js, tests/moddead.js
- What: on the Melee Delivery and the Laser's sword, Homing throws homing slashes (40%) at enemies just out of reach, Bounce rebounds the last hit to 1 to 3 more enemies within 100 (60%), Returning sweeps back 0.2 s later (60 / 75 / 90%), Link shares 25% of damage between enemies hit by one swing (3 to 5 s), Pull draws enemies within 120 to 180 a step in before the swing, Knockback (Bouncer) makes shoved enemies hurt what they hit (40%). Card text `TODO_COPY:xd_melee_<mod>` (6 placeholders). MOD_DEAD regenerated from a fresh full audit.
- Save data: none
- Hooks: none in shared files; hookOn('proc', 'xdProc') in delivforms.js. Wraps mwMelee (modwide.js) and lzSwordSwing (laserbeam.js).
- Audit: Standard Issue NO-OP 21 -> 19, Laser 13 -> 11; full audit 648 -> 631 of 2810.
- Risk: Melee weapons get more damage (the follow-up hits); Link shares any weapon's hits on a linked enemy. Wall Slam keeps its own collision when held (Bouncer skips an enemy Wall Slam already counted).

## v10.126 -> v10.127: 2026-10-25 Dead-card table regenerated after the Delivery routing and the Mines forms
- Built on main (no branch). Systems: modifier cards, tests. Files: moddead.js, tests/moddead.js, tests/sim/modaudit.js (clears MOD_DEAD before planning, from c0f0687).
- What: `MOD_DEAD` is regenerated from a full audit of main with tasks 1, 2 and 3 (batch 1) in: 648 NO-OP combos of 2810 are hidden (was 761 before the routing; Laser + Mines now hides nothing, so Charge-Up on it is offered again). The filter test now checks Laser + Melee + Homing stays hidden and Laser + Mines + Charge-Up is offered.
- Save data: none. Hooks: none. Risk: cards hidden or shown differ from v10.126 by the routing and Mines-form changes only.

## v10.126 (versionCode 405): 2026-10-25 Mines forms for Flight and Crowd modifiers
- Merged: ccr-task3-forms (MODAUDIT_HANDOFF.md task 3, batch 1: the Mines column of MODIFIER_MATRIX.md 5.11). This build also ships the unbuilt main changes below it (draft hides dead modifier cards, Deliveries carry the other modifiers). Built without running tests (user's request).
- Copy still open: TODO_COPY:xd_mines_homing, _ricochet, _returning, _connecting, _pull, _knock (card text on a Mines weapon).

### Folded from ccr-task3-forms: 2026-10-25 Mines forms for Flight and Crowd modifiers (task 3, batch 1)
- Systems: modifier cards, Delivery modifiers, laser beam, tests
- Files: delivforms.js (new), modwide.js, laserbeam.js, index.html, ARCHITECTURE.md, tests/delivtest.js (new), tests/run.sh
- What: on any weapon that lays mines (the Laser's too), Homing makes armed mines creep at enemies, Bounce flings a new mine off the nearest enemy to rest in the crowd, Returning rolls an untouched mine back to you, Link strings tripwires between mines (crossing one sets off both ends and the wire hits the crosser for 60%), Pull makes a tripped mine implode for 0.3 s first, and Knockback shoves outward from the mine instead of from you. Card text for these on a Mines weapon is TODO_COPY:xd_mines_<modifier>. Audit: Standard Issue + Mines NO-OP 4 -> 2 (Homing, Bounce cleared), Laser + Mines 1 -> 0.
- Save data: none
- Hooks: none in shared files (wraps mwLay, mwMineGo, mwTick, modCard, modDraw, lzMineLay, lzExtrasTick; modwide.js mwDmgMul reads src.mwAt; laserbeam.js gains lzMineFire)
- Risk: MOD_DEAD (moddead.js) still hides Homing and Bounce on Mines weapons until it is regenerated from an audit that includes this batch. Knockback on mine blasts now pushes enemies away from the mine, which can push them towards you.

### Folded from ccr-task3-forms: 2026-10-25 Per-Delivery forms for Flight and Crowd modifiers (design only)
- Systems: docs
- Files: redesign docs/MODIFIER_MATRIX.md
- What: new section 5.11, the user-approved table of how Homing, Bounce, Returning, Link, Pull and Knockback work on Mines, Melee, Strike from Above, Orbiting and Ranged (MODAUDIT_HANDOFF.md task 3). User decisions: rule 17 stays (no Extra Projectiles row); Pull on Ranged and Grappling Hook both stay. No code.
- Save data: none
- Hooks: none
- Risk: none


## After v10.125 (no build): 2026-10-25 Deliveries carry the other modifiers
- Merged: ccr-01uaxx2k-delivmods (MODAUDIT_HANDOFF.md task 2). Built with the regenerated MOD_DEAD table in the next build.

### Folded from ccr-01uaxx2k-delivmods: 2026-10-25 Deliveries carry the other modifiers (MODAUDIT_HANDOFF task 2; no build)
- Systems: modifier cards (modwide, modslice), the Laser (laserbeam), tests
- Files: modwide.js, laserbeam.js, modslice.js, tests/widetest.js, tests/sim/modaudit.js
- What: Melee, Ranged and Mines now run modifiers.js modFire's part when they take the shot (`mwDel`), so Empowered Attack, Stat Scaling and Volley count swings, strikes and mines. New Delivery forms: Focus builds per attack that follows a hit (a quarter of its peak each, cleared by a miss or pause: `mwFocusStep`); Piercing thrusts past the melee arc (`mwThrust`); Long Range lengthens the swing and throws mines. The Laser's sword and mines charge and fire as a Charge-Up blast (lzBlast's share and heat, so it still overheats: `lzDelFire`); Area, Long Range, Piercing, Rapid Fire, Focus, Empowered Attack and Primer work on them. The audit tries a second attack-type card as the swap atkswap.js makes it.
- Audit (rank 1): all weapons 761 -> 670 NO-OP of 2810 (62 NUMBERS, 2078 VISIBLE); Laser 29 -> 14 (Laser + Melee 11 -> 2, Laser + Mines 7 -> 1); Standard Issue 31 -> 23 (+ Melee 8 -> 3, + Mines 7 -> 4).
- Save data: none.
- Hooks: none in shared files. modslice.js msDmgMul skips its per-target Focus ramp for hits marked `src.mwDel`.
- Risk: balance of Delivery builds rises (Empowered Attack, Focus now apply; the Laser's blast sword hits a whole arc at lzBlast's share). Unsimmed in wave mode. MOD_DEAD (task 1, moddead.js) must be regenerated from a fresh audit after this merges, or it hides cards that now work.


## After v10.125 (no build): 2026-10-25 Draft hides dead modifier cards
- Merged: ccr-9712267e-z2y0pu (MODAUDIT_HANDOFF.md task 1). Game change, not yet built: ship it with the next build.

### Folded from ccr-9712267e-z2y0pu: 2026-10-25 Draft hides dead modifier cards
- Systems: modifier cards, tests
- Files: moddead.js (new), index.html, ARCHITECTURE.md, tests/moddead.js (new), tests/tools/moddead.js (new)
- What: a modifier the audit found does nothing on a weapon in its current form (e.g. Charge-Up on a Laser holding Mines) is no longer offered in the draft. Table `MOD_DEAD` is generated from the audit.
- Save data: none.
- Hooks: none (wraps `modOk`).
- Risk: players see fewer cards after a Delivery; rerun `tests/tools/moddead.js --write` after any audit change.


## After v10.125 (no build): 2026-10-25 Enemy tables from the live v10 game
- Merged: ccr-e5f84558-da830u. Docs and a test tool only: no game change, no build.

### Folded from ccr-e5f84558-da830u: 2026-10-25 Enemy tables regenerated from the live v10 game
- Systems: tests (tools), docs
- Files: tests/tools/enemytables.js (new), ENEMY_STATS.md, ENEMY_BEHAVIOUR.md
- What: the two enemy tables now come from the running game (65 enemies, 15 bosses, v10 defences, V10_DIFF scaling) instead of data.js, and can be regenerated with one command.
- Save data: none.
- Hooks: none.
- Risk: none (docs and a test tool only).

## After v10.125 (no build): 2026-10-25 Weapon modifier no-op audit sim and handoff
- Merged: ccr-fdb45298-03p6vq. Tests and docs only: no game change, no build.

### Folded from ccr-fdb45298-03p6vq: 2026-10-25 Weapon modifier no-op audit: handoff
- Systems: tests, docs
- Files: MODAUDIT_HANDOFF.md (new), NOTES.md
- What: the audit's findings (761 of 2810 weapon x Delivery x modifier combos change nothing) and three briefed tasks for later sessions: a draft filter that hides dead cards (Sonnet), routing the Delivery replacements through the modifier path (Opus), per-Delivery forms for the Flight and Crowd modifiers (Opus, design first).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-fdb45298-03p6vq: 2026-10-25 Weapon modifier no-op audit sim
- Systems: tests
- Files: tests/sim/modaudit.js (new), ARCHITECTURE.md, CLAUDE.md
- What: `node sim/modaudit.js` runs every matrix weapon x Delivery x modifier the draft can offer in a fixed arena (16 slow crawlers walking in from random distances, seeded random, fresh page per trial, range falloff on) and classes each modifier as NO-OP (nothing measurable changes), NUMBERS (only damage or hit counts move) or VISIBLE. Found: 761 of 2810 combos are NO-OP; on the Laser, Charge-Up does nothing once Mines or Melee is held.
- Save data: none.
- Hooks: none.
- Risk: none (a sim only).


## v10.125: 2026-10-24 Event hub (hooks.js); the v9 fallback removed
- Merged: claude/keen-archimedes-9okpqe.

### Folded from claude/keen-archimedes-9okpqe: 2026-10-24 Event hub: features register for core moments instead of editing game.js
- Systems: hooks (new), engine
- Files: hooks.js (new), game.js, index.html, tests/hookstest.js (new), tests/run.sh, ARCHITECTURE.md, CLAUDE.md
- What: killEnemy, damageEnemy, hurtPlayer, fireWeapon and update no longer list ~75 feature calls by hand; each fires a named event (`kill:early`, `kill`, `dmgMul`, `proc`, `hit:late`, `hurtMul`, `hurt`, `hurt:late`, `fire`, `tick`) and hooks.js holds the old calls in their old order. New features call `hookOn(...)` from their own file. No behaviour change intended.
- Save data: none.
- Hooks: game.js killEnemy -> hookRun('kill:early'/'kill'); damageEnemy -> hookMul('dmgMul'), hookRun('proc'/'hit:late'); hurtPlayer -> hookMul('hurtMul'), hookRun('hurt'/'hurt:late'); fireWeapon -> hookFirst('fire'); update -> hookSafe('tick').
- Risk: a branch that adds a call inside one of the removed blocks in game.js will conflict; move that call into a hookOn line in its own file. chemPlayerZones and pstTick now run inside safely() like the other ticks (an error there no longer stops the frame). In hurtPlayer the grudge / last-hit bookkeeping now runs before the hurt listeners (none of them read it).


### Folded from claude/keen-archimedes-9okpqe: 2026-10-24 Remove the v9 fallback (window.V10_OFF)
- Systems: core spine (game, render, ui, bosses), chemistry, settings, meta, tutorials, tests
- Files: 41 files in web/js (v10.js, look10.js, game.js, ui.js, bosses.js, chem.js, inspect.js, school.js, tutorial.js and others); tests/loadouttest.js (removed), tests/run.sh
- What: the hidden `window.V10_OFF` switch that brought back the v9 combat build is gone, with every `V10`/`L10` branch folded to its v10 side and the v9 code those branches guarded deleted (old armour block in hurtPlayer, automatic reactions and overloads in applyElement, the v9 sample screen in UI.openSamples, the v9 Junk DNA lesson, the Arcade view offer). No behaviour change in the shipped build.
- Save data: none (META_KEY is always sd_meta10).
- Hooks: none added. `V10` and `L10` stay defined as `true` so other branches' `if (V10)` lines still run.
- Risk: a branch that adds new `!V10` code expects the v9 path to exist; it is now dead. loadouttest (v9 loadout screens) is deleted.

## v10.124: 2026-10-24 Enemy rings on top, branch screens in the Weapon Draft layout, two best weapons per sample
- Merged: claude/serene-mayer-hzufbe.

### Folded from claude/serene-mayer-hzufbe: 2026-10-24 Enemy rings on top, branch screens in the Weapon Draft layout, two best weapons per sample (v10.124)
- Systems: render, fight, weapons (branches), samples (starting offer), tests
- Files: ringtop.js (new), render.js, v10.js, branchback.js, samplestart.js, index.html, tests/xbrdrafttest.js (new), tests/samplestest.js, tests/v10test.js, tests/v9armstest.js, tests/run.sh, ARCHITECTURE.md
- What: every ring round an enemy (status rings, Shell and Membrane rings, build-up bars) now draws over explosions and effects (under enemy bullets). The Lv 3, 6 and 9 weapon branch screens open in the Weapon Draft layout (tabs, details, live scene per branch) instead of cards. Each of the 20 samples has two weapons that suit it (S10_FIT); the starting draft offers those two plus two random matrix weapons (four cards; the guaranteed Switched at Birth card is gone).
- Save data: none.
- Hooks: render.js render -> RING_DEFER on/off round the enemies and ringsOnTop after the fx layer; drawEnemy's ring block -> ringLater; v10.js v10Draw no longer calls fightDraw (ringtop.js does).
- Risk: anything else drawn in fightDraw (corroded drips, bleed drops, snare loops, charged-patch crackle) now also draws over effects. Starting with a suited weapon may make early runs easier (unsimmed).

## v10.123: 2026-10-24 No barge between waves; two flaky tests fixed
- Merged: claude/serene-mayer-hzufbe.

### Folded from claude/serene-mayer-hzufbe: 2026-10-24 wup4test and rivalwave made reliable; no barge between waves
- Systems: rivals, tests
- Files: rivals.js, tests/rivalwave.js, tests/wup4test.js
- What: a rival that wound up its Shoulder Barge during a Petri Dish wave no longer finishes it between waves or in a boss wave (rivals are meant to leave you alone then). rivalwave counts only the rival's own hits as breaking the calm (the player sometimes spawned in an Acid Crypt, which it blamed on the rival; about 1 run in 25). wup4test's Crawling Baby scene runs 900 frames so a mine always gets to creep.
- Save data: none.
- Hooks: none.
- Risk: none (one guard in rivalBarge; not shipped in an APK yet).

## Pool balloons after v10.122: 2026-10-24 (no build: merged without an APK)
- Merged: claude/fervent-mendel-3f1ud8.

### Folded from claude/fervent-mendel-3f1ud8: 2026-10-24 The 26 modifier cells for the pools
- Systems: weapons, modifiers
- Files: cellmods4.js (new), balloon.js (blShape), index.html, tests/cell4test.js (new), tests/celltest.js (Hot Mess checks moved out), tests/run.sh, ARCHITECTURE.md, redesign docs/MODIFIER_MATRIX.md
- What: Nocturnal Emission and Hot Mess have their own effect for every modifier (MODIFIER_MATRIX.md 5.10): Through the crowd, Face takes it all, Balloon barrage, Overfilled balloon, Evaporating puddle, Family pack, Slip and slide, Plughole, Sticky footprints, Leaky balloon, Pop goes the enemy, Creeping puddle, Rubber balloon, Marinating, Connected vessels, Lifeguards, Smash it on them, Water pistol puddles, Balloons on the floor, Stamp it out, Two-tone balloon, Primed puddle, Giant balloon, Cluster balloon, Juggling, Wetter balloon, each with its mastery. All are dealt on both pools (Range, Up Close, Piercing, Homing, Ricochet, Focus and Ranged were N/A before). Hot Mess's old 5.7 cells no longer run.
- Save data: none.
- Hooks: none in shared files. cellmods4.js wraps modOk, landLob, wupDmgMul, wupHit, wupKill, rxFired, hurtPlayer, modDraw.
- Risk: balance not simmed. In cell4test's crowd (plain weapon about 1000 damage in 6 s) Plughole is about 1.8x, Cluster and Giant masteries 2 to 3.5x; Juggling and Smash it on them deal less (0.4 to 0.8x). 25 card texts are TODO_COPY:cell_bl_*.

### Folded from claude/fervent-mendel-3f1ud8: 2026-10-24 Pool weapons throw water balloons
- Systems: weapons, render
- Files: balloon.js (new), render.js, index.html, tests/balloontest.js (new), tests/run.sh, ARCHITECTURE.md
- What: Nocturnal Emission and Hot Mess throw a wobbling balloon that follows the enemy it was aimed at and bursts on it (splash, droplets, a splat sound); the puddle lands on that enemy. Damage and puddle numbers are unchanged. A balloon lets go of an enemy that dies, teleports (over 40 units in a frame) or drifts over 260 from the aim point.
- Save data: none.
- Hooks: render.js lob drawing -> blDraw. balloon.js wraps fireWeapon, updateProjectiles, landLob (after cellmods2.js).
- Risk: pools hit more often (they no longer land where a moving enemy used to be), so both weapons are a little stronger; not simmed. The 26 modifier cells for pools (MODIFIER_MATRIX.md 5.10) are not built yet; Hot Mess still runs its 5.7 cells.

### Folded from claude/fervent-mendel-3f1ud8: 2026-10-24 Pools as water balloons: all 26 modifiers (docs only)
- Systems: docs only (redesign docs)
- Files: MODIFIER_MATRIX.md (new 5.10; Nocturnal Emission and Hot Mess cells in sections 3 and 4 point to it; 5.7 marked superseded; rule 10 exception), COMBAT_MATRIX.md (decision 63), ATTACK_TYPES.md (Pool row), README.md (follow-on item)
- What: the two pool weapons are now thrown like a water balloon at one enemy's face, and every one of the 26 modifiers has a design for them, chosen by the user.
- Save data: none.
- Hooks: none.
- Risk: none in the game; the shipped Hot Mess cells (cellmods2.js) no longer match the spec.

## Tests after v10.122: 2026-10-24 (no build: tests only)
- Merged: claude/serene-mayer-hzufbe.

### Folded from claude/serene-mayer-hzufbe: 2026-10-24 Five failing tests brought up to date
- Systems: tests
- Files: tests/samplestest.js, tests/v10test.js, tests/v9armstest.js, tests/p11test.js, tests/wup2test.js
- What: samplestest, v10test and v9armstest check the 23 Oct sample rules (samplestart.js: a random three-weapon matrix offer with one Switched at Birth card, only Baseline open on a fresh save, achievements unlock the rest, Ordered Online's 30% Evasion). p11test kills its late germ with ten times its health (late germs now pass 1e6). wup2test's Final Prick and Terminal Clause scenes run longer with weaker enemies so their chance effects always show. v10test's type-switch check uses a v10 weapon (the random offer may have none). No game code changed.
- Save data: none.
- Hooks: none.
- Risk: none (tests only).

## v10.122: 2026-10-24 v9 samples redrawn and back on the rack
- Merged: claude/serene-mayer-hzufbe.

### Folded from claude/serene-mayer-hzufbe: 2026-10-24 v9 samples back on the Sample Rack (v10.121)
- Systems: samples (rack), matrix only
- Files: matrixonly.js, samples9.js, tests/v9lookshot.js
- What: the eleven v9 samples are on the rack again, open from the start, and start like every sample with an offer from the matrix's 27 weapons (not their v9 starters). A picked v9 sample whose v9 sequence is still locked (e.g. The Favourite) now runs as itself instead of falling back to The Firstborn.
- Save data: none (META.v9pick reused).
- Hooks: none.
- Risk: v9 traits and abilities with matrix-only weapons are unsimmed; v9 sequence synergies name v9 weapons that are on hold.

### Folded from claude/serene-mayer-hzufbe: 2026-10-24 v9 sample bodies redrawn in the v10 style (v10.121)
- Systems: samplelooks (sample bodies), samples9
- Files: v9looks.js (new), samples9.js, index.html, tests/v9lookshot.js (new), ARCHITECTURE.md
- What: the eleven v9 samples no longer use the old v9 ship; each has its own v10-style body (anatomy that shows its character, its v9 colour, defences and upgrades worn on the body), on sample cards, the Field Guide, fusions and in play. The Twins' ghost twin uses the same body. Rack pictures are the live body instead of a pictogram.
- Save data: none.
- Hooks: none (fills samplelooks.js tables; wraps sampleLook for the twin).
- Risk: Kindred fusions with a v9 sample now draw its own body instead of Baseline's.

## v10.120: 2026-10-24 Cells for five more weapons, Laser branches, plain cell copy
- Merged: ccr-eff39359-vaxudl, then ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Cells for five more weapons (v10.120, merge build)
- Systems: weapons (modifiers), tests
- Files: cellmods3.js (new), cellcopy3.js (new), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: every modifier now does something specific on Red Flagship, Soulmate Signal, Spark of Life, Maximum Gains and Enzyme Sneeze (MODIFIER_MATRIX.md 5.9, 120 cells), with plain card text for each.
- Save data: none.
- Hooks: none in shared files (wraps spawnProj, twinTick, wupHit, wupDmgMul, wupFire, wupTick, modDraw).
- Risk: balance on those five weapons; spawnProj wrapper tags every pellet of those weapons.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Laser branches
- Systems: weapons (upgrades), tests
- Files: laserbranch.js (new), index.html, tests/branchtest.js
- What: the Laser gets branch upgrades at Lv 3, 6 and 9 (designed with the user): Laser Hair Removal (the beam strips Shell and Membrane; Ingrown, Wax Strip, Patch Test), Cat Toy (the red dot lures small enemies; Dot Trail, Bigger Dot, Two Dots), Overclocked (the ramp climbs three times as high, about 4 s of beam overheats it into a vent with a burst; Heat Sink, Redline, Meltdown); masteries Full Body Wax, Laser Show, Death Ray.
- Save data: none.
- Hooks: none.
- Risk: Laser balance (Overclocked's x3 ramp; Hair Removal ignores defences); every weapon now has branches.

### Folded from ccr-eff39359-vaxudl: 2026-10-24 Plain copy for weapon cells, aim choices and stat bonuses
- Systems: weapons, ui
- Files: cellcopy.js (new), aimplus.js, statup.js, index.html
- What: the 75 per-weapon modifier cards on Nappy Mines, Blowing Bubbles, Hot Mess and Eggs now say what the upgrade does on that weapon (effect, then ranks 2, 3 and mastery). The four new aim choices (Mines, Projectiles, Enemies, Me) and the build panel's stat heading have plain text. No TODO_COPY placeholder is left on screen.
- Save data: none
- Hooks: none
- Risk: copy only; cell cards are long (150 to 260 characters), so check they fit on a small phone.

## v10.119: 2026-10-24 Copy for the weapon cells, aim menu and elite carriers
- Merged: ccr-10c7b3a7-ugrptm (after ccr-eff39359-vaxudl's copy, folded above).

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Copy for the elite carriers (v10.119, merge build)
- Systems: copy (elite carriers)
- Files: branchback.js, mutdrop.js, SpawnPrawn_Copy.xlsx
- What: the elite carrier's banner, float text and labels read LOOT CARRIER!, LOOT SECURED, LOOT LOST, LOOT and KILL FOR LOOT 12s. The weapon-cell cards, aim choices and stats heading keep the plain copy from ccr-eff39359-vaxudl (cellcopy.js), by the user's choice. Written by Claude at the user's request.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## v10.118: 2026-10-24 Weapon branches at Lv 3, 6 and 9; elite carriers drop a loot box; every targeting rule and autorun mode always on
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Every targeting rule and autorun mode always on (v10.118, merge build)
- Systems: targeting, autorun, sperm passives, tests
- Files: spsteer.js, aimplus.js, tests/aimplustest.js
- What: Advanced Targeting, Autopilot and their masteries are no longer dealt; every targeting rule (MINES, PROJECTILES, ENEMIES and ME included) and every autorun mode (AUTO included) is always available. Alternating two rules every other shot (the old targeting mastery) is gone.
- Save data: META.spKeep is no longer read (left in old saves, harmless).
- Hooks: none.
- Risk: four sperm passive cards fewer in the draft; spsteertest (not in the suite) still describes the old rules.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Weapon branches and elite carriers back
- Systems: weapons (upgrades), rewards (elite drops), tests
- Files: branchback.js (new), mutdrop.js (two strand labels are TODO_COPY), index.html, tests/branchtest.js (new), tests/mutdroptest.js, tests/run.sh
- What: a weapon's old upgrade path opens again as it reaches Lv 3 (pick one of three promises), Lv 6 (that promise's cards and its wildcard) and Lv 9 (a mastery; one weapon a run). Some elites carry a DNA strand again (the helix, the beacon, a 40 s countdown); kill one in time and the strand gives you a loot box with modifier cards.
- Save data: none.
- Hooks: none in shared files (mutdrop.js labels changed in place).
- Risk: more power per run (branch cards on top of modifiers, plus carrier boxes); branch cards and the new weapon cells both act on Nappy Mines, Blowing Bubbles, Hot Mess and Eggs (e.g. Domino and Loaded nappy together); 5 TODO_COPY lines for the carrier.

## v10.117: 2026-10-24 Weapon cells for Hot Mess and Eggs; aim at mines, shots or yourself; mines show their charge; a level-up box every level
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Mines that show their charge; more to aim at; a box every level (v10.117, merge build)
- Systems: weapons (mine look), targeting, rewards (level-ups), tests
- Files: cellmods.js (xcMineLook, the Ripening fizzle), aimplus.js (new), game.js (gainXp), index.html, tests/aimplustest.js (new), tests/run.sh
- What: Nappy Mines that are ripening (Charged) fizzle and glow brighter, then flash once when full; empowered mines (Ripening, Loaded nappy, fused, nukes) are drawn bigger and brighter the more empowered they are. With the Advanced Targeting mastery every aim menu leads with MINES (shoot your own mine to set it off), PROJECTILES (shoot down enemy shots), ENEMIES (the nearest enemy, then the usual rules) and ME (your attack lands on you). Every level-up now gives a level-up box (was every level to Lv 8, every second to Lv 24, then every third).
- Save data: none.
- Hooks: game.js gainXp pushes a level request every level (the condition removed).
- Risk: about twice as many level-up boxes after Lv 8, so runs get stronger later (win rate needs a sim); aim stand-ins reach code that expects an enemy (damageEnemy and acquireMany are covered; anything else that reads target.hp sees 1).

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-24 Weapon cells for Hot Mess and Eggs
- Systems: modifiers, weapons, tests, docs
- Files: cellmods2.js (new), cellmods.js (per-tag tables; Cannonball share per source), index.html, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: Hot Mess and Eggs get their own effect for every modifier the matrix gives them (Claude's picks, 5.7 and 5.8): Spatter, Simmer, Fuel spill, Firestarter, Popcorn, Plughole, Tar pit, Grease fire, Flaming bag, Bonfire, Splash pattern, Shared Burn, Fire walker, Hot to touch, hidden patches, ring of fire, Spreading; Scrambled, Family recipe, Egg toss, Egg on your face, Egg drop, Golden egg, bouncing eggs, Clutch, Hatchling, Nest egg, orbiting eggs, Yolk splash. Switched at Birth deals Acid or Mucus on Hot Mess and Blood or Acid on Eggs. celltest covers all four weapons and no longer fails when the player spawns in cilia.
- Save data: none.
- Hooks: none in shared files.
- Risk: balance of Hot Mess and Eggs with modifiers (not simmed; Eggs' delivery cells deal less than plain Eggs); 34 more TODO_COPY card texts.

## v10.116: 2026-10-23 Weapon cells for Nappy Mines and Blowing Bubbles; every bubble inflates before it is sent
- Merged: ccr-10c7b3a7-ugrptm.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-23 Bubbles inflate before they leave; the melee bubble is its own thing (v10.116, merge build)
- Systems: weapons, modifiers, tests
- Files: cellmods.js, tests/celltest.js, redesign docs/MODIFIER_MATRIX.md
- What: every bubble (Blowing Bubbles with or without modifiers, the Bubble machine and Bubble rain) grows from nothing before it is sent (0.25 s; Big breath 0.6 s) and can't trap or pop until it leaves. Melee on Bubbles: the bubble round you pops in a Force explosion on contact, then grows back from tiny (3 s, 2 s from Lv 2); it is not the Membrane and stacks with it.
- Save data: none.
- Hooks: none.
- Risk: Blowing Bubbles fires a little later than before (every bubble waits 0.25 s); celltest now counts every hit and gives bubble cells 8 s.

### Folded from ccr-10c7b3a7-ugrptm: 2026-10-23 Weapon cells for Nappy Mines and Blowing Bubbles
- Systems: modifiers, weapons, tests, docs
- Files: cellmods.js (new), toys.js, index.html, tests/celltest.js (new), tests/run.sh, redesign docs/MODIFIER_MATRIX.md
- What: Nappy Mines and Blowing Bubbles get their own effect for every modifier the matrix gives them (designed with the user: Breadcrumbs, Ripening, Implosion, Fly paper, Cannonball, sliding Ricochet mines, artillery into carpet bombing, tripwires, suicide vest and runners; Bubble post, Personal space, Big breath, Beach ball, Bubble magnet, gum, Unpoppable, Bubble pinball, Inflating, Bubble pack, Hamster ball, a bubble round you, Bubble machine, Bubble rain, Gift wrap, Iron lung and more). Rapid Fire, Sticky, Ricochet, Connecting, Extra Projectiles and Orbiting are now dealt on Nappy Mines; Switched at Birth deals one of two alternates on each (Acid or Mucus; Acid or Static), and a switched bubble pops in its new type.
- Save data: none.
- Hooks: toys.js bubblePop: the pop's type follows Switched at Birth (one line).
- Risk: balance of both weapons with modifiers (not simmed); other branches that wrap msHit/mwHit/msStats/mwStats etc. by reassignment must load before cellmods.js; card text is TODO_COPY for the 42 cells.

## v10.115: 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats; run log stats and XP fixes; late-Race frame rate
- Merged: ccr-8707d278-h1fnlw.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Frame rate in a late Race (v10.114)
- Systems: terrain, render (enemies, bosses), combat (status draw), particles, tests (sims)
- Files: terrain.js, render.js, fight.js, game.js, tests/sim/framebench.js (new)
- What: terrain drift checks its neighbours every 8th frame (staggered) instead of all pairs every frame (0.65 to 0.2 ms a frame). Enemy status rings and bars skip enemies off screen. Volvox dots, boss aura motes and rotifer glints draw as a few batched paths; in a crowd, yeast drops its two surface spots. A fixed late-Race scene goes from 421 to 122 canvas calls for enemies and 70 to 10 for a boss aura. Particles are trimmed to the quality cap even when an effect adds them directly. New `sim/framebench.js` times a late Race at a chosen quality step.
- Save data: none.
- Hooks: none.
- Risk: terrain steering reacts up to 8 frames late (it creeps at 6 to 20 a second); crowd-mode yeast look plainer; boss motes flicker in 4 brightness steps instead of smoothly.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Run log: stats line, honest XP line
- Systems: run log, stat bonuses
- Files: statup.js, game.js, meta.js, tests/statuptest.js
- What: the run log has a ` stats:` line (your stat bonus totals) under the build line. The xp line's "collected" is now the gems' own value (it used to include the Race and Feat XP multipliers, so it read about 1.7x what was dropped) and its "bonus" is every multiplier together.
- Save data: run log records gain `stb`; `xpK` now means total multiplier.
- Hooks: none new (statup.js wraps runSummary, runText).
- Risk: none for play; old run log entries keep their old xp numbers.

### Folded from ccr-8707d278-h1fnlw: 2026-10-23 Stat bonuses on modifiers; distinct weapon base stats (v10.113)
- Systems: stat bonuses (new), weapons, modifier cards, ui (weapon draft, BUILD tab), defences, movement
- Files: statup.js (new), game.js, pdef.js, index.html, style.css, tests/statuptest.js (new), tests/run.sh, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: every modifier card (each rank, and Switched at Birth) also adds a small bonus to one of 16 stats, shown on the card and totalled on the pause BUILD tab. Each of the 27 matrix weapons has its own base stats (fire rate, magazine, reload, crit chance, crit bonus, range), shown on the weapon draft; damage is rescaled so each still deals about what it did (statuptest: all within 20% on dummies).
- Save data: none (run state `G.stb`; new stat `G.P.accel`).
- Hooks: game.js updatePlayer swim thrust reads `P.accel`; pdef.js pdMemFrac -> stMemFrac.
- Risk: weapon damage numbers change for all 27 (balance held per weapon, not simmed per sample); stat bonuses make late runs a little stronger; anything that reads `def.base.dmg`/`cd`/`mag` sees the new values. Placeholder `TODO_COPY:stats_build_head` (BUILD tab heading).

## v10.112: 2026-10-23 Strike from Above as an extra; Homing delay; Race upgrade schedule; sample unlocks, random starts, bigger passives; Rewind off; late-race frame rate; level-up boxes to pick up; much bigger arenas
- Merged: ccr-7c6adc60-uqv9g4.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Glowing level-up boxes; arenas even bigger (v10.112, merge build)
- Systems: pickups (draw), race, waves, terrain, big hazards
- Files: render.js (a level-up box draws as a bigger, glowing gold DNA strand), data.js (CORE.arena 5400), waves.js (DISH.arena 2600), terrain.js (terrain count scale capped at 2.5x), bighaz.js (Petri Dish sizing reads DISH.arena), tests/levelboxtest.js
- What: level-up boxes are a large gold DNA strand with a pulsing glow, so they stand out from Donor DNA strands and power-ups. The Race arena is 5400 (was 3600) and the Petri Dish 2600 (was 1750); terrain grows with the area but at most 2.5x the old count, so the biggest arena is sparser.
- Save data: none.
- Hooks: render.js pickups loop (lvbox draws with the chest strand).
- Risk: longer swims; sparser terrain in the Race.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Level-up boxes to pick up; bigger arenas; rescues inside the dish (v10.111)
- Systems: rewards (level-ups), pickups, kindred (rescues), terrain, waves, race
- Files: levelbox.js (new), kindred.js (kinIn, KIN.rim), data.js (CORE.arena 3600), waves.js (DISH.arena 1750), terrain.js (terrain counts scale with arena area), raceplan.js (RPLAN.fill), spsteer.js (cache keyed on mode), index.html, tests/levelboxtest.js (new), tests/kindredtest.js (diagnostics)
- What: a level-up drops a gold-ringed box 120 to 300 away (inside the arena, off hazards); swimming into it opens its screen at once (no Director gap, Race slot or wave-break hold). The Race keeps its 5:00 and 10:00 milestones and its schedule for other rewards, but no longer adds empty-slot screens. The Race arena is 3600 (was 2400) and the Petri Dish 1750 (was 1150), with terrain counts scaled to keep the same density. Rescue spirits and Donor DNA strands are placed at least 160 inside the rim and at least 540 from you (a spot pulled in from the rim could land on you). Autorun's 30 Hz steering cache no longer carries over a mode change.
- Save data: none.
- Hooks: levelbox.js wraps game.js applyPickup, weapons24.js wupTick, v10.js v10Draw; adds POWERUPS.lvbox.
- Risk: bigger arenas lengthen travel (to the egg, to rescues); terrain counts up to 2.3x (performance). Bots in sims (TUT_OFF) still get level screens directly.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Late-race frame rate: thinner crowds, cheaper movement (v10.110)
- Systems: director (spawning), enemies, autorun, fx (particles)
- Files: game.js (CROWD, crowdK/spawnK, CAPS.enemies a getter; updateEnemies far half-rate; separation half-rate; particle caps), spsteer.js (autoSteer every other frame)
- What: outside wave mode a quarter fewer enemies are alive and spawned (the hard cap every spawner checks is 128, was 170; sims at minutes 5 to 9 hold 100 to 117 alive, were 143 to 152), each with up to a third more health and XP. Enemies over 600 away update every other frame (time carried), separation runs on half the crowd a frame, autorun steers 30 times a second, particles cap 160 (120 at lower quality). Measured 6 to 19% less update time in the same scene, before the smaller crowd.
- Save data: none.
- Hooks: game.js updateEnemies(dt0); spsteer.js wraps autoSteer (cache).
- Risk: CROWD.k changes difficulty feel (fewer, tougher); far enemies' reactions lag a frame.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Run log lists the Switched at Birth start card
- Systems: telemetry (run log)
- Files: wstats.js (wsPick matches a wrapped def)
- What: the run log's start offers now include the Switched at Birth card (it was dropped, so starts looked like two offers).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Rewind off (v10.109)
- Systems: chrono (rewind), ui (HUD)
- Files: norewind.js (new), index.html, tests/rewindtest.js (checks it is off; NOREWIND.on = false for the old mechanic)
- What: Rewind is off in v10 runs: no charges, no button, and dying is final. Its Paradox Echo had done half of a Sandbox run's damage from one rewind.
- Save data: none.
- Hooks: none in shared files. Wraps td.js startRewind and gainChrono.
- Risk: runs are harder (no second chance on death); win rate unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Race's upgrade schedule (v10.108)
- Systems: rewards (Reward Director), race, draft
- Files: raceplan.js (new), index.html, tests/raceplantest.js (new), tests/drafttest.js (RPLAN.off for the Director's stacking check)
- What: in the Race, reward screens open only at 20 set times (0:30, then about every 40 to 45 s, last 14:25) plus Sample Milestone screens at 5:00 and 10:00 (a Rare-floor level draft, a placeholder for the sample reward sequence). Level-ups between slots fold into the next level screen and raise its rarity floor; a slot with nothing waiting still opens a level-up screen. Transformations are dealt less before 5:00 and more from 5:00 to 10:00; masteries less before 10:00, more after. Forks, branch screens, boss rewards and the second weapon still open at once; after the egg wakes, waiting rewards apply themselves as before.
- Save data: none.
- Hooks: none in shared files. Wraps director.js dirGate, dirTitle; modmatrix.js modDraftCands; v10.js v10Tick.
- Risk: fewer screens means slower builds in the Race (difficulty unsimmed); chests wait for slots.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Samples: achievement unlocks, random starting offer, bigger passives (v10.108)
- Systems: samples, achievements, weapons (start)
- Files: samplestart.js (new), samples10.js (locked card line; passive numbers), acrosample.js and acrocopy.js (Early Bird at 50%), kindred.js (rescues remembered in META.kinSeen, no unlock), index.html, tests/samplestarttest.js (new), tests/kindredtest.js
- What: Baseline is open; every other sample unlocks when you first earn its achievement (Alpha: Still Here?, Beta: Flesh Wound, Private Schooled: Middle Management Removed, Ordered Online: Statistically Significant, Redtail: Contractually Obligated, Prawn Again: Lab Rat, Not of This World: Congratulations It's You, Early Bird: Flawless Specimen). Achievements are remembered between runs; rescues no longer unlock samples. The start offers three random matrix weapons: one of the sample's damage type, one Switched at Birth into it (starts switched), one any. Passives exaggerated: Baseline +15% stats, Alpha +50% fire rate while moving, Beta below 40% up to +200% damage and double lifesteal, Private Schooled twice the Corrosion and ally damage, Ordered Online 30% Evasion and a wider, longer trail, Redtail double burn, Prawn Again 2.5x Bleed, Not of This World shifts every 12 s with a 3 s +30% surge, Early Bird pays off at 50%.
- Save data: META.achEver and META.kinSeen added; META.s10 now filled by achievements (S10_ALL off).
- Hooks: none in shared files. Wraps samples10.js s10Start, s10Unlock; show.js achieve.
- Risk: testers lose samples they had through S10_ALL until they earn the achievements. Stronger passives unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Homing kicks in after a moment (v10.107)
- Systems: weapons (modifiers)
- Files: piercefx.js (modStep wrapped), tests/piercetest.js, tests/modstest.js (Homing curve checked after 0.5 s)
- What: the Homing modifier steers a shot only from 0.2 s after it is fired, so a spread fans out first and then each shot turns towards the nearest enemy. Weapons that home by design are unchanged.
- Save data: none.
- Hooks: none in shared files.
- Risk: Homing shots miss a little more at point-blank range.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Strike from Above is an extra (v10.106)
- Systems: weapons (modifiers, Laser)
- Files: modwide.js (MW_DFA_RATE, mwDfaRoll; mwFire falls through), laserbeam.js (orbital strikes on a timer while the beam fires), atkswap.js (no longer an attack type), slicecopy.js (lines), tests/widetest.js, laserbeamtest.js, lootfiltertest.js
- What: Strike from Above no longer replaces the weapon's attack. The weapon fires as normal and now and then a strike from above lands too: about 0.15 strikes a second at Rank 1, then 0.25, 0.35 and 0.5 at mastery (a chance per attack from the weapon's cooldown; on the Laser, an orbital strike on a timer). It no longer swaps with Melee, Ranged or Mines (still the Delivery group).
- Save data: none.
- Hooks: none in shared files.
- Risk: Strike from Above builds gain the base attack back (stronger overall); strike rates unsimmed.

## v10.105: 2026-10-23 Full sperm passive list with branching masteries; targeting and autorun as passives; loot filters; Area modifier; piercing fixes; HOLD is manual; Turncoat by chance
- Merged: ccr-7c6adc60-uqv9g4.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Turncoat is a chance (merge build, v10.105)
- Systems: weapons (modifiers)
- Files: modwide.js (MW_TURN_CH), slicecopy.js (Turncoat lines), tests/widetest.js
- What: a Turncoat kill rises as an ally only by chance: 1 in 20 at Rank 1, then 10%, 15%, and 20% at mastery (was every kill).
- Save data: none.
- Hooks: none.
- Risk: Turncoat builds are much weaker.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser holds Piercing and Ricochet together (merge build, v10.105)
- Systems: weapons (Laser, modifiers)
- Files: atkswap.js (modOk, mmHeld wrapped), tests/flightpairtest.js (new)
- What: the Laser alone may hold Piercing and Ricochet (both Flight) at once; the second takes a slot of its own. Every other weapon keeps one Flight modifier.
- Save data: none.
- Hooks: atkswap.js wraps modmatrix.js mmHeld.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 HOLD is fully manual (merge build, v10.105)
- Systems: autorun
- Files: spsteer.js (autoSteer wrapped; HOLD's description), tests/holdtest.js (new)
- What: under HOLD the sperm does not move unless you steer it: no dodging and no drifting back to a spot.
- Save data: none.
- Hooks: spsteer.js wraps game.js autoSteer.
- Risk: HOLD players no longer get free dodges.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Piercing fixes (v10.104)
- Systems: weapons (modifiers)
- Files: piercefx.js (new), index.html, tests/piercetest.js (new)
- What: a homing shot that pierces an enemy now steers to one it has not hit (it used to curl back round the one it pierced); with none in reach it flies straight. Each pierce sprays sparks out of the far side with a small flash.
- Save data: none.
- Hooks: none in shared files. Wraps modifiers.js modHit.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Area weapon modifier (v10.103)
- Systems: weapons (modifiers)
- Files: areamod.js (new), modwide.js (Melee reach, Pulling and Repulsor read areaK), index.html, tests/areatest.js (new), tests/modstest.js (count)
- What: a new modifier, Area, on any attack type: +25/50/75% (mastery +100%) to everything the weapon does over an area: blasts (bursts, Exploding Rounds, Death from Above, Mines, Ranged), its pools, Contact reach, Melee reach, beam width, aura shots, Pulling reach, the Repulsor wave and gravity wells. It has its own group, so it only competes for a slot.
- Save data: none.
- Hooks: none in shared files. Wraps game.js aoe and ring, modifiers.js modWell, weapons24.js wupStats, wupTick.
- Risk: a 6th modifier group with 5 slots, so a weapon can no longer fill every group. Area-heavy builds unsimmed.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Loot filters, attack-type swap, Laser pictogram (v10.102)
- Systems: ui (loot screen, weapon draft), weapons (modifiers), pictograms
- Files: atkswap.js (new), lootfilter.js (new), index.html, tests/lootfiltertest.js (new)
- What: long loot lists (the no-limits level-up list, the 27-weapon pick) get a search box, tabs (by weapon, passives, defences; by attack type for weapons), chips (modifier group, passive kind, damage type) and sort (as dealt, A to Z, by group). Melee, Ranged, Mines and Death from Above now swap: the card is marked SWITCH with a red border and says the old one's ranks, branch and mastery go; once a weapon has one, another is dealt at 15% weight. The Laser uses the spark-of-life pictogram.
- Save data: none.
- Hooks: none in shared files. Wraps modOk, modAdd, modCard, modDraftCands, UI.renderLootCards, UI.renderDraft; adds PICTO_ALIAS entries.
- Risk: the Laser now shares its pictogram with Spark of Life. Attack-type modifiers can now be offered on a weapon that already holds one (was never).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Kept targeting/autorun masteries use no slot (v10.101)
- Systems: sperm passives
- Files: spsteer.js, tests/spsteertest.js
- What: the mastery card for a kept Advanced Targeting or Autopilot no longer takes a passive slot (stored in G.spMx, like the defence masteries).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Branching passive masteries (v10.100)
- Systems: sperm passives, mutations, defences (pdef), draft (forks)
- Files: spmast.js (new), index.html, tests/spmasttest.js (new)
- What: taking a passive's mastery opens a fork of two masteries (user: the first two options of each). Covers Slipstream, Heartbeat, Overexcited, Group Project, Growing Pains, Extra Padding, Stickier, Crossed Wires, Conductive Mess, Big Brain, Can't Sit Still, All at Once and Hungry Hungry; Squishy, Shell, Thorns and Evasion get mastery cards (no slot) once held at 3 (Squishy at 1). Group Project, Growing Pains, Conductive Mess and the four trade-offs now have 3 levels (trade-off costs stay fixed). Shell's option A became "a lost layer regrows after 15 s without a hit", as layers already refit each wave.
- Save data: none.
- Hooks: none in shared files. Wraps mutations.js mutDmg, mutRate, mutSpeed, mutHurtIn, mutKill, mutLevel, mutBurst, mutRxLock, mutHit; pdef.js pdefHurt; game.js healPlayer, gainXp, fireWeapon; weapons24.js wupTick; draft.js forkCards, draftTitle.
- Risk: many wrappers on mutation hooks (order: after spfull and spsteer). Mastery numbers are unsimmed (bots rarely reach Rank 4).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Targeting and autorun passives; The Runs loop mastery (v10.99)
- Systems: sperm passives, autorun, autoaim, ui (aim menus, end screen)
- Files: spsteer.js (new), spfull.js, autorun.js (aimList), ui.js and loadout.js (aim menus read aimList), index.html, tests/spsteertest.js (new)
- What: targeting starts with Nearest, Furthest, Densest cluster and Elites & bosses; Advanced Targeting adds Toughest and Fastest, then Lowest health and Shooters first, then the rest; its mastery alternates a weapon's shots between its two rules. Autorun starts with Kite and Hold; Autopilot adds Collect, Orbit, then Hunt and Nest; its mastery adds an AUTO mode that picks for you. Win a run holding one and you keep all its levels for good (both held: you pick one); a kept passive's card is gone and its mastery card turns up from run Lv 10. The Runs' mastery: close a loop of trail and everything inside takes a hit of its type.
- Save data: META.spKeep added ({ aim, auto }).
- Hooks: ui.js tap-cycle and aim grid, loadout.js aim chips: DIRECTIVES -> aimList(). Wraps autorun.js moveModes, arMode, aimDir; UI.showGameOver; v10.js v10Draw.
- Risk: tests, sims and the School get every option (STEER.force to test the limits). Weapons whose default rule is not on offer fall back to Nearest.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sperm passives: the doc's full list (v10.98)
- Systems: sperm passives, mutations, chemistry (fight), draft
- Files: spfull.js (new), index.html, tests/spfulltest.js (new)
- What: level-ups deal only SPERM_PASSIVES.md's list (24 cards plus all eight defences); Sticky Fingers, the old damage-type cards, Come Closer and Death Is Recycling as cards, and the v9 g_ cards are gone. Six new passives with 3 levels and a mastery: Pile-Up (Force knockback and collisions), Wet Floor (bigger, longer Acid pools), Chain Letter (more and longer Static jumps), Bleeding Heart (stronger Bleed, more Extraction healing; mastery Bad Blood), Peer Pressure (longer Possession, harder ally hits), Leave a Little Something (all your pools last longer, final double tick). Come Closer (Stickier + Pile-Up) and Death Is Recycling (Peer Pressure + Crossed Wires) are now automatic pair bonuses; holding one half deals the other more often. Renamed to the doc: Overexcited, Stickier, All at Once, Hungry Hungry.
- Save data: none.
- Hooks: none in shared files. Wraps fight.js fightStatus, fightDeath, fightArc; chem.js curseFoe; mutations.js mutHit; weapons24.js wupStats, wupDmgMul, wupTick, wupKill.
- Risk: Chain Letter replaces fightArc's body while held (a later change to fightArc needs copying). Defences now include Shell, Squishy, Evasion and Thorns in drafts (SLICE.defs widened).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Matrix only: the 27 matrix weapons and 25 matrix modifiers (v10.97)
- Systems: weapons, samples, weapons (modifiers), sandbox
- Files: matrixonly.js (new), index.html, tests/v9armstest.js, combo10test.js, wup3test.js, wup5test.js (matrixRestore)
- What: only the 27 weapons in MODIFIER_MATRIX.md are dealt anywhere (drafts, starting picks, rescues, the Sandbox): the rest go on hold, and the v9 samples leave the Sample Rack. Only the matrix's modifiers are offered (plus Type Swap); Sweep, Growing, Chain Hits, Returning, Delayed Blast, Lobbed, Trail, Around You, Volley, Stat Scaling, Split on Kill, Pets, Gravity Well and Lunge are hidden. MATRIX_ONLY.on = false, or matrixRestore(), undoes it; tests (window.TUT_OFF) still get every modifier.
- Save data: none.
- Hooks: none in shared files. Wraps modmatrix.js modOk; pushes onto weapons24.js W24_HOLD.
- Risk: v9 sample unlocks and saves still exist but are hidden.

## v10.96: 2026-10-23 Weapon modifier matrix and sperm passives in code; the Laser; Sandbox on the home screen; splash lag fix
- Merged: ccr-7c6adc60-uqv9g4, ccr-5e56e811-ce1r6c.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sandbox on the home screen (merge build)
- Systems: ui (home screen), sandbox, weapons (modifiers)
- Files: index.html (SANDBOX button; Quick Start hidden), sandbox.js (button; level-ups and modifier forks open), modmatrix.js (mmFree true in the Sandbox), tests/quick.js, tests/veilshot.js, tests/wstest.js (call UI.quickStart directly)
- What: the home screen has SANDBOX in place of Quick Start: straight into the Sandbox with no developer switch. In the Sandbox, level-ups now open and list every weapon modifier and sperm passive with no slot limits (and their branch and mastery forks), so any weapon and modifier can be tried. Also merges the splash lag fix (ccr-5e56e811-ce1r6c).
- Save data: none.
- Hooks: none new.
- Risk: Quick Start is gone from the home screen (UI.quickStart still exists).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Homing and Crossfire on the Laser (v10.95)
- Systems: weapons (Laser, modifiers)
- Files: laserbeam.js (lzSeek and homing steps in lzTrace; lzCross, lzCrossOn), modwide.js (Crossfire pins instead of pushing), tests/laserbeamtest.js
- What: Homing now fits beams: the Laser and every bounce and pierce curve towards the enemy ahead (within 70 degrees), turning up to 7 / 13 / 18 degrees (26 at mastery) every 45 units; Laser mines' beams don't home. Crossfire (Extra Shots mastery, Full Circle): the rear beam curves round and strikes the main target from the far side; while both beams hold it, it takes +30% and Knockback pins it instead of pushing.
- Save data: none.
- Hooks: none new.
- Risk: Homing makes bounces reliably find enemies (more damage with Bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser versions of the remaining modifiers (v10.94)
- Systems: weapons (Laser, modifiers), chemistry (Sticky), fx
- Files: laserbeam.js (lzOrbital, lzSwordSwing, lzMineLay, lzExtrasTick, lzExtrasDraw, lzDrawSegs, lzFx, lzPulseOn, LZ_RAPID; wraps wupFire, modAtk, forkCards, modCard), modwide.js (Explosive Hits pops every 0.5 s on the Laser, Knockback pushes steadily, Mark and Detonate needs 0.5 s held), modslice.js (Sticky slows then freezes by time held; Can't Pick One rolls every 0.5 s and draws as a held laser; no Charge-Up fork on the Laser), tests/laserbeamtest.js
- What: the Laser hits 10 times a second, so per-hit modifiers were rescaled for it. Strike from Above is an orbital laser (a mark, then a beam from above that follows the target for 1 s; one at a time). Melee is a laser sword (a 150-degree swing every 0.6 s). Mines are laser mines that spin out 1 beam plus one per Extra Shots beam for 1.2 s when an enemy comes near, never aiming. Empowered Attack is a wide, bright 0.5 s pulse every 4 / 3 / 3 s. Rapid Fire has Laser branches: Cooler (heats slower; Heat Sink, Vent) and Quicker (shorter charge-up; Instant, Strong Start). Raise Allies is not offered on the Laser; Charge-Up has no branches on it.
- Save data: none.
- Hooks: laserbeam.js wraps weapons24.js wupFire, modifiers.js modAtk, draft.js forkCards, modcards.js modCard.
- Risk: crowd damage with Strike from Above (about 5x the beam in a tight cluster), the sword (3x) and Explosive Hits (2x).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Extra Shots on the Laser: beams with their own targets (v10.93)
- Systems: weapons (Laser, modifiers), ui (charge glow)
- Files: laserbeam.js (lzXUpdate, lzXOn, lzRampX, lzXSweep; lzBeams returns per-beam share and ramp), modslice.js (no blanket beam damage cut on the Laser), tests/laserbeamtest.js
- What: each Extra Shots beam is its own laser: it locks its own target (front beams in your front half; Full Circle's rear beam in your back half), sweeps to it within 50 degrees, has its own ramp, and charges (a smaller glow) before firing on a new target. A beam with no target of its own runs beside the main beam on its target. Beams on one target share one beam's damage (no loss); beams on D different targets deal D^0.6 beams' worth in all. Each extra beam heats the Laser 33% faster. The old blanket damage cut (x0.76 even with nothing to aim at) is gone.
- Save data: none.
- Hooks: none new.
- Risk: more total damage in crowds than v10.92 (x1.52 with 2 targets, x1.93 with 3), offset by faster overheating.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Charge-Up turns the Laser into a charge-and-blast weapon (v10.92)
- Systems: weapons (Laser, modifiers), chemistry (status bars), fx
- Files: laserbeam.js (lzBlast, lzBlastDraw, lzCR; mutBarK wrapped for blasts), modwide.js (Charge-Up's stats and branches skip the Laser), tests/laserbeamtest.js
- What: with Charge-Up the Laser has no held beam: its charge-up is longer each rank (x1.25 / 1.5 / 1.75, x2 at mastery) and ends in one wide, white-hot blast (0.3 s flash) under all the beam's rules, dealing the held beam's damage at once: 4 s of full-strength beam at Rank 3 (50 / 75 / 100%, 125% at mastery). Blasts build enemies' status bars 3 times as fast and add half a burn bar of heat to you. The charge glow is bigger each rank.
- Save data: none.
- Hooks: laserbeam.js wraps mutations.js mutBarK.
- Risk: single huge hits (power11.js still caps early one-shots on germs).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser overheat bar; Rapid Fire shortens its charge; no Growing; longer charge (v10.91)
- Systems: weapons (Laser, modifiers), ui (burn bar)
- Files: laserbeam.js (lzHeatTick, lzHeatDraw, lzCharge, modOk drops Growing), modslice.js (Rapid Fire's rate and branches skip the Laser), tests/laserbeamtest.js
- What: firing heats the Laser (a burn bar under you, full after 4 s of beam); full, it switches off and reloads until it has cooled right down (2.2 s, faster with reload speed); it never hurts you. Rapid Fire on the Laser only shortens the charge-up (70 / 50 / 35%, 20% at mastery). The base charge-up is 0.6 s (was 0.3). Growing is no longer offered on the Laser.
- Save data: none.
- Hooks: none new.
- Risk: the Laser's damage over time drops (it rests about 2 s in every 6 under constant fire).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser charge-up (v10.90)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (LZ.charge, lzCharging, lzChargeDraw), tests/laserbeamtest.js, tests/slicetest.js
- What: a Laser starting from off charges for 0.3 s first: a small glow grows and flickers at the sperm's head, then the beam comes on (no damage while charging). A held beam, or one switching targets, doesn't charge again.
- Save data: none.
- Hooks: none new.
- Risk: the Laser's first hit on a new engagement lands 0.3 s later.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser Piercing: a visible sliver gets through (v10.89)
- Systems: weapons (Laser)
- Files: laserbeam.js (LZ_PKEEP, lzPKeep; pierced beam gets its own length), tests/laserbeamtest.js
- What: the beam past a pierced enemy gets its own length (75% of range, like a bounce) instead of what was left, so it shows even when the target is near the edge of reach; what gets through keeps 30 / 45 / 60% of the power (75% at mastery), so Rank 1 is a thin, dim sliver. Applies to the orbit ring too.
- Save data: none.
- Hooks: none new.
- Risk: Piercing deals less per pierced enemy than before (was 85%).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Sweep and Growing on the Laser (v10.88)
- Systems: weapons (Laser, modifiers)
- Files: laserbeam.js (lzSweep, lzGrow, LZC.pad), tests/laserbeamtest.js
- What: Sweep swings the Laser either side of its target (about 34 / 42 / 50 degrees, 57 at mastery) under all its beam rules. Growing widens the Laser the longer it is held (up to x1.33 / x1.67 / x2, x2.33 at mastery, over 3 s; resets when it goes out); the wider beam also catches enemies up to 12 units off its line. Both did nothing on the Laser since v10.76.
- Save data: none.
- Hooks: none new.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Anchored Beam retired; Long Range fits beams (v10.87)
- Systems: weapons (modifiers)
- Files: modwide.js (modOk refuses anchored; range fits beams, +20% beam reach a rank), tests/modstest.js
- What: Anchored Beam is no longer offered (the aim menu's FURTHEST rule already does its job); Long Range now fits beams, adding 20% reach a rank to them (so a FURTHEST Laser can reach far enemies).
- Save data: none.
- Hooks: none new.
- Risk: none (a run already holding Anchored Beam keeps it).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser curves into its orbit ring (v10.86)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (lzOrbit lead-in)
- What: with Orbiting, the beam spirals out from you (three quarters of a turn) and runs into the ring along it, instead of a straight spoke out to it. Visual only.
- Save data: none.
- Hooks: none new.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounces lose damage and brightness by Bounce rank (v10.85)
- Systems: weapons (Laser), fx
- Files: laserbeam.js (LZ_KEEP, lzKeep; brightness follows segment power), tests/laserbeamtest.js
- What: each Laser bounce keeps 35% of the power at Bounce Rank 1, 50% at Rank 2, 65% at Rank 3 and 80% at mastery (x0.6 more when Piercing splits it too); damage and the beam's brightness (glow, beam, core, hit spot) fall with it.
- Save data: none.
- Hooks: none new.
- Risk: Bounce deals less than before at low ranks (was -20% a bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounce angle from the sperm head (v10.84)
- Systems: weapons (Laser)
- Files: laserbeam.js (lzHead, lzBounceDir), tests/laserbeamtest.js
- What: the Laser's bounce angle is set by the sperm head's angle against the beam's line to the enemy (reflected as off a surface tilted by that difference), not by where on the enemy it lands, so hits nearly always reflect; only a beam exactly in line with the head (within 1 degree) doesn't reflect. Replaces v10.83's 12-degree head-on rule. Obstacles and the orbit ring follow the same rule; the membrane wall still reflects physically.
- Save data: none.
- Hooks: none new.
- Risk: Bounce fires on almost every hit again (more damage with Bounce than v10.83).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser: no bounce on a head-on hit (v10.83)
- Systems: weapons (Laser)
- Files: laserbeam.js (lzGlance), tests/laserbeamtest.js
- What: a Laser hit within 12 degrees of head-on doesn't bounce (it would only come straight back at you); off-centre hits still reflect at the true angle. Applies to enemies, obstacles and the orbit ring (user's choice of three options).
- Save data: none.
- Hooks: none new.
- Risk: Bounce triggers less often on a beam held dead on its target (mostly while sweeping or on moving enemies).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser reach and sweep limit (v10.82)
- Systems: weapons (Laser), fx
- Files: laserbeam.js
- What: a beam that ends in open water is drawn 3 times as far (stopping at the first enemy or obstacle, no damage out there) with a fade twice as long; the held beam only sweeps to a new target within 50 degrees, otherwise it switches off for a moment and comes back on aimed at the target.
- Save data: none.
- Hooks: none new.
- Risk: none (visual and aim only).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser bounces always show, open ends fade, orbit Piercing per section (v10.81)
- Systems: weapons (Laser)
- Files: laserbeam.js, tests/laserbeamtest.js
- What: a bounced beam gets its own length (75% of the weapon's range) instead of what was left, so a reflection always shows after a hit; a beam that ends in open water fades out over its last 35%; the orbit ring spends a Piercing charge in every section that meets an enemy, the same enemy included.
- Save data: none.
- Hooks: none new.
- Risk: longer bounces reach more enemies (more damage with Bounce).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser's orbit is a traced ring; beams meet obstacles (v10.80)
- Systems: weapons (Laser, Orbiting), terrain
- Files: laserbeam.js (lzOrbit, obstacles in lzMeet, modOrbit/modFire wrapped), modslice.js (old hoop skips the Laser), tests/laserbeamtest.js
- What: with Orbiting the Laser leaves you and runs round a circle as one solid beam, traced in 48 sections with the beam's rules: an enemy in the way breaks the ring until it moves (Piercing carries on past it, weaker), Bounce reflects it off enemies and obstacles as a straight beam; a second inner ring turning the other way at mastery. No orbiting bodies for the Laser. Every Laser beam now stops at solid terrain, or reflects off it with Bounce.
- Save data: none.
- Hooks: laserbeam.js wraps modifiers.js modOrbit and modFire.
- Risk: solid terrain now blocks the Laser (it used to shine through).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser is a held, smooth beam (v10.79)
- Systems: weapons (Laser), fx
- Files: laserbeam.js, tests/laserbeamtest.js, tests/slicetest.js
- What: the Laser stays on between damage ticks: every frame its aim sweeps smoothly towards the target and its path (bounces, piercing, bubble reflections) is traced again and drawn as a steady beam with a white-hot core, a coloured glow and a bright spot where it lands. More power glows more, pulsing once past full strength. Overheating (Rapid Fire) blinks it off. Damage still lands at the weapon's fire rate.
- Save data: none.
- Hooks: laserbeam.js wraps weapons24.js wupTick and modifiers.js modDraw.
- Risk: per-frame tracing costs a little (32 segments at most per beam).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Bigger Membrane; plain modifier names (v10.78)
- Systems: defences (Membrane Shield), weapons (modifier names), copy
- Files: pdef.js (wide card and state), bodymods.js (bubbleR reads it), draft.js (defsHeld), spslice.js (slice defs), modmatrix.js (Type Swap tag), rewardui.js (Type Swap category), slicecopy.js (SLICE_NAMES), tests/spslicetest.js, tests/modcardtest.js
- What: Bigger Membrane, a new Membrane Shield level (needs the shield, uses no slot): the bubble is 60% wider. Weapon modifiers get plain names (Chain Hits, Orbiting, Delayed Blast, Around You, Sweep, Anchored Beam, Empowered Attack, Stat Scaling, Split on Kill, Pets, Focus, Link, Status Boost, Extra Shots, Long Range, Close Range, Charge-Up, Same Type Bonus, Pull, Raise Allies, Strike from Above, Explosive Hits, Mark and Detonate...); Switched at Birth's card tag is TYPE SWAP.
- Save data: G.pd.n.wide (run state only).
- Hooks: bodymods.js bubbleR -> G.pd.n.wide; rewardui.js accepts the TYPE SWAP tag.
- Risk: a bigger bubble is a strong defence (it is also a hitbox). fittest already failed before this (it expects the old random Switched at Birth).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Laser always red; no limits shows every modifier; plain copy for placeholders (v10.77)
- Systems: weapons (Laser colour), draft (slice-only), copy
- Files: laserbeam.js (colour pinned), spslice.js (sliceOn off under no limits; Piercing in the slice), slicecopy.js (new), index.html
- What: every form of the Laser (rings, mines, strikes, melee arcs, links, bursts) is red unless Switched at Birth changes its type. With no slot limits, slice-only drafting is off, so every modifier is offered. First-pass plain copy (written at the user's request) fills every TODO_COPY placeholder: modifiers, branches, masteries, sperm passives, the Laser, the setting, race rescue and v9 sample lines (SLICE_COPY in slicecopy.js; the user can rewrite there).
- Save data: none.
- Hooks: none in shared files. slicecopy.js wraps modCard, forkCards, banner, makePickup, UI.renderArmoury; loads last.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The Laser fires like a laser; Ricochet renamed Bounce (v10.76)
- Systems: weapons (Laser, modifiers), defences (Internal Ricochet)
- Files: laserbeam.js (new), modslice.js (Focused Intensity skips its multiplier on the Laser), index.html, tests/laserbeamtest.js (new), run.sh
- What: the Laser is a traced ray: it stops at the first enemy (no pierce by default) and its aim swings towards the target. Bounce (was Ricochet) reflects it off the enemy's surface at the true angle; Piercing (now fits beams) carries it through; both split it into a straight and a bounced part at half power each. With Internal Ricochet and the membrane up the beam reflects round the inside of the bubble (14 reflections) and never leaves it. Its damage starts at 45% and ramps to 160% over 2.2 s on one target; Focused Intensity ramps it faster and higher.
- Save data: none.
- Hooks: none in shared files. Wraps v10.js v10Fire (outermost, Laser only).
- Risk: the Laser's damage curve changed (weaker on fast target switches); with Internal Ricochet the Laser only hits what touches the bubble.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 The other 13 weapon modifiers; every modifier on a level-up with no slot limits (v10.75)
- Systems: weapons (modifiers), chemistry (Kinship fill, Primer), ui (fork screens)
- Files: modwide.js (new), index.html, tests/widetest.js (new), run.sh
- What: Range, Up Close, Charged, Kinship, Knockback, Pulling, Turncoat, Melee, Ranged, Mines, Death from Above, Primer and Exploding Rounds, each with both branches and four masteries (generic versions; per-weapon cells later). Slice-only drafts deal them too. With the no-limits setting on, a level-up lists every card you could take (modifiers, Switched at Birth, passives, defences) in a scrolling list. wup2/5/6 tests run with MM.on off (they test the retired branch screens).
- Save data: none (run state G.mwS, G.mwAny).
- Hooks: none in shared files. Wraps weapons24.js wup* hooks, power11.js p11Range, mutations.js mutBarK, game.js hurtPlayer, modifiers.js modOk/modDraw, draft.js draftLoot, ui.js UI.renderLootCards.
- Risk: power (unsimulated); Melee shortens the weapon's reach to 110; Counter cancels a hit every 3 s.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Slice only drafts (v10.74)
- Systems: draft, weapons (modifiers), mutations (sperm passives), defences
- Files: spslice.js (SLICE, sliceSkip, modOk and pdefOffer wrappers), spassives.js (spSkip -> sliceSkip), tests/spslicetest.js
- What: for testing, drafts deal only the vertical slice: 9 weapon modifiers plus Switched at Birth, 6 sperm passives (The Runs, Slipstream, Fever Pitch, Extra Mastery, Personal Space, Internal Ricochet) and Membrane Shield's 3 cards; Feats as normal; v9 upgrades, catalysts, Concentration and other defences off. SLICE.on = false restores the full pool. Tests and sims (window.TUT_OFF) keep the full pool unless SLICE.force.
- Save data: none.
- Hooks: spassives.js spSkip -> sliceSkip.
- Risk: fewer power sources while on (harder runs).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 No slot limits setting (v10.73)
- Systems: settings, weapons, mutations (sperm passives), ui (build panel)
- Files: modmatrix.js (setting row, mmFree, modOk, mmRoom), spassives.js (spSlots), buildpanel.js, tests/sptest.js
- What: a GAME tab setting (off by default) lifts weapon modifier slot and group limits and sperm passive slot limits, for testing. Weapon count (3) and masteries are unchanged.
- Save data: SET.noLimits (sd_settings).
- Hooks: none new (SETTINGS_DEF.push, SET_DEFAULTS.noLimits from modmatrix.js).
- Risk: none with it off.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-23 Weapon level pacing, draft crash guard (v10.72)
- Systems: weapons, draft
- Files: modmatrix.js (MM.freeEvery), draft.js (draftCards skips empty candidates), tests/drafttest.js, tests/sim/wave20.js (--pre)
- What: every weapon gains a level each 4th player level (the retired upgrade screen's pacing), on top of a level per modifier card. A draft candidate that comes back empty is skipped instead of reaching the loot screen as null (a bot sim crashed in UI.sortLoot). Ships the build panel and MM.lvK changes above.
- Save data: none.
- Hooks: none new.
- Risk: wave mode is still harder than main (wave20 mortal: this branch dies at waves 5 to 15; main 20, 8, win, 15). 4 starting sperm passive slots got closest to main in sims; left at 2 pending the user.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Build panel for slots and branches; weapon level damage knob (unshipped)
- Systems: ui (build panel), weapons
- Files: buildpanel.js, modmatrix.js
- What: the build panel shows group slots (held/open), branch and mastery names, Rank IV, Personal Space's branch, and sperm slots counted as the draft counts them; the retired weapon upgrade line is hidden. MM.lvK adds 6% damage per weapon level (being tuned by wave20 sims).
- Save data: none.
- Hooks: modmatrix.js wraps weapons24.js wupStats.
- Risk: balance (lvK under test).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Slice sperm passives and pairs (v10.71)
- Systems: mutations (sperm passives), defences, weapons (pairs)
- Files: spslice.js (new), index.html, tests/spslicetest.js (new), run.sh
- What: Fever Pitch (burning kills spread Burn), Personal Space (push field; a Repel or Attract fork at Rank 2), Internal Ricochet (Membrane Shield's mastery: shots bounce inside the bubble). Pairs: Chain reaction (Connecting + Ricochet) and Not Finished Yet (Ricochet + Focused Intensity); the other half of a pair is dealt 50% more often.
- Save data: none (run state G.spB, G.spsFevT).
- Hooks: none in shared files. Wraps weapons24.js wupTick/wupKill/wupDmgMul, draft.js forkCards/draftTitle, modslice.js msRicochet, modmatrix.js modDraftCands.
- Risk: Personal Space moves enemies directly (wall-checked in campaign levels only, as the gravity well does).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Slice modifiers with branches and masteries (v10.70)
- Systems: weapons (modifiers), chemistry (Catalyst bars and reactions), ui (fork screens)
- Files: modslice.js (new), modmatrix.js (Switched at Birth checks the Chemistry slot), index.html, tests/slicetest.js (new), run.sh
- What: six new modifiers (Rapid Fire, Focused Intensity, Sticky, Connecting, Catalyst, Extra Projectiles), each with a branch fork at Rank 2 and a mastery fork (two masteries of that branch). Ricochet now bounces beams at the reflection angle; Orbiting turns a beam into a ring round you (the Laser's hula hoop).
- Save data: none (run state w.mmB, w.mmX, G.msS, G.msAny).
- Hooks: none in shared files. Wraps weapons24.js wupStats/wupFire/wupDmgMul/wupHit/wupKill/wupTick, v10.js v10Fire, fight.js fightReact, mutations.js mutBarK, modifiers.js modOk/modAdd/modDraw, draft.js forkCards/draftTitle, modcards.js modCard.
- Risk: power (stacked modifiers are unsimulated); Disco Ball and Clip Dump are strong; all new card text is TODO_COPY.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Masteries, Extra Mastery, The Runs passive, Membrane Shield levels, red Laser (v10.69)
- Systems: weapons, mutations (sperm passives), defences, fx
- Files: modmatrix.js, spassives.js, laser.js, modifiers.js (modV), pdef.js (pdHeld), draft.js (defsHeld), tests/sptest.js (new), drafttest, modcardtest, modstest, mutstest, run.sh
- What: a modifier or sperm passive at Rank 3 can take a 4th card, its mastery (one of each kind a build; Extra Mastery adds one more of either). The Runs is a sperm passive: a trail in the sample's primary damage type. Thicker Membrane and Faster Recharge are one-rank levels of Membrane Shield and use no slot. The Laser draws as a thin red beam.
- Save data: none (run state G.mmM, G.spM, G.spRuns).
- Hooks: spassives.js wraps v10.js v10Tick; laser.js wraps v10.js v10Fire. modifiers.js modV extrapolates past the last rank.
- Risk: masteries are only "one more step" of the numbers for now; The Runs stacks extra damage on every sample.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Weapon modifier matrix draft (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (new), redesign docs/README.md, redesign docs/COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md (sperm passives bullet)
- What: a 22-modifier × 26-weapon matrix with levels and masteries, from a design grilling with the user. The Runs leaves the weapon roster (becomes a sperm passive). Raises rule conflicts listed in the doc (beams don't pierce, suicide vest, long lunge, Family Ties drift, The Runs).
- Save data: none.
- Hooks: none.
- Risk: none in code; other redesign docs (MODIFIERS.md 2, BASE_WEAPONS.md, SAMPLES.md Redtail) now disagree until the conflicts are resolved.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier levels and mastery limits (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, storm-directive/NOTES.md
- What: modifiers have 3 levels plus a mastery as the 4th; up to 3 modifiers per weapon; one mastery per build unless the Extra Mastery sperm passive (costs a passive slot).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier matrix v2: scaling and shaping, Laser, 4 new modifiers (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md (rewritten), redesign docs/README.md
- What: 26 modifiers × 27 weapons. Modifiers split into scaling (shared ramp: counts 1/3/6/12) and shaping (a distinct step per level). Adds Ricochet, Orbiting, Extra Projectiles and Focused Intensity, and the Laser (Ordered Online's Fire beam) from the user's voice notes.
- Save data: none.
- Hooks: none.
- Risk: none in code; BASE_WEAPONS.md needs a Laser entry and MODIFIERS.md 4 (Ricochet) disagrees (listed in the doc).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier groups, pair bonuses, Advanced Targeting to sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md, storm-directive/NOTES.md
- What: five modifier groups (Delivery, Flight, Crowd, Tempo, Chemistry); one firing replacement per weapon; look-alike distinctions; 13 pair bonuses with draft weighting; DPS and transformation checks; Charged wind-up shortens per level; Advanced Targeting becomes a sperm passive (adds "elite first" and "nearest threat").
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 One modifier slot per group (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, redesign docs/README.md
- What: weapons have 5 modifier slots, one per group (replaces "up to 3 per weapon"); same-group modifiers never stack; 10 pair bonuses reworked so every pair crosses groups.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier slots unlock with weapon level (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: weapons start with 2 modifier slots and unlock the 3rd, 4th and 5th at weapon Lv 3, 6 and 9 (any unfilled group).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Sperm passives (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md (new), MODIFIER_MATRIX.md, MUTATIONS.md (superseded note), README.md, COMBAT_MATRIX.md (section 14 row), storm-directive/NOTES.md
- What: 29 sperm passives replace the Genome slots (mutations and defences re-sorted one by one with the user): slots 2, then +1 at Lv 8, 16, 24; 3 levels plus a mastery; separate mastery cap from weapon modifiers; two passive pairs. Weapon mutations folded into the matrix (branches, pair bonuses). Matrix gains the branch rule (2 branches, 4 masteries per modifier; tables not yet rewritten).
- Save data: none.
- Hooks: none.
- Risk: none in code; UPGRADES.md (Genome, max 3 weapon mutations) now disagrees until updated.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Combo masteries and the push/pull field (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md, SPERM_PASSIVES.md, README.md
- What: combo masteries (a modifier mastery offered only while a condition holds): Static net (Static arcs jump between your projectiles) and Planetary system (projectiles orbit Family Ties' black holes). New sperm passive: a push field that can branch to pull.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 The Runs takes the sample's primary damage type (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: The Runs' trail is in the sample's primary damage type, changeable by a type-changing passive.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Damage-type passives boost what each type does best (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md, MODIFIER_MATRIX.md
- What: Force (knockback, collisions), Acid (Acid Pools), Static (jumps and range), Mucus (Snare), Blood (wounds, Extraction; pools at mastery), Alien (possession) and Fire (spread) passives reworked; draft names written at the user's request; Static net's arc cap grows with the Static passive.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier branches written (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIER_MATRIX.md
- What: all 25 weapon modifiers (3.1 to 3.14, 4.1 to 4.11) now have a Branches block: shared Lv 1, branches A and B with Lv 2, Lv 3 and two masteries each (100 endings, plus the Static net and Planetary system combo masteries), and weapon exceptions. Table headings renamed: per-weapon cells are flavour the shared branches apply.
- Save data: none.
- Hooks: none.
- Risk: none in code. Branch numbers are starting values for sims; the Branches block in each section is now the place to tune endings.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Sperm passive source (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: sperm passives come from level-up drafts only; bosses and rivals give relics (separate reward, no slot). Open: what gene boxes and elite drops give now.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Gene boxes and elite drops retired (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/SPERM_PASSIVES.md
- What: gene boxes and elite mutation drops are retired; relics unchanged for now.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Implementation plan; Laser 4th starter; 3 weapons max (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md (new), MODIFIER_MATRIX.md, README.md
- What: phased build plan (vertical slice first). Laser is Ordered Online's 4th starter. Runs hold at most 3 weapons: combo bonus mounts (combos.js COMBO_MOUNTS) to be retired in Phase 1.
- Save data: none.
- Hooks: none.
- Risk: none in code yet; combos.js/fusion.js bonus mounts change in Phase 1.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Profiles retired; no base Membrane (docs only)
- Systems: docs only (redesign docs)
- Files: redesign docs/IMPLEMENTATION_PLAN.md, SPERM_PASSIVES.md
- What: Epigenetic Profiles retire with the gene box; runs no longer start with a Membrane (only the Membrane Shield card gives one). Plan has no blockers left.
- Save data: none yet (Profiles' META keys stay readable when retired in Phase 1).
- Hooks: none.
- Risk: none in code yet; removing the base Membrane will shift difficulty (sim in Phase 4).

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Phase 0: redesign docs reconciled (docs only)
- Systems: docs only (redesign docs)
- Files: COMBAT_MATRIX.md (decisions 47 to 62, Beam row, decision 31), MODIFIERS.md, ATTACK_TYPES.md, BASE_WEAPONS.md, SAMPLES.md, UPGRADES.md, WEAPON_UPGRADES.md, README.md, IMPLEMENTATION_PLAN.md
- What: today's design decisions logged and the conflicting docs fixed (beams don't pierce, Ricochet off enemies, named exceptions, The Runs out, Laser in, sperm passives replace Genome, branch cards retired).
- Save data: none.
- Hooks: none.
- Risk: none in code.

### Folded from ccr-7c6adc60-uqv9g4: 2026-10-22 Modifier slots by group, sperm passive slots, the Laser (v10.68)
- Systems: weapons, draft, mutations, defences, samples, combos
- Files: modmatrix.js (new), spassives.js (new), laser.js (new), mutdrop.js, combos.js, index.html; tests: lasershot.js (new), drafttest, modcardtest, modstest, mutdroptest, mutstest, samplestest, weapons24test
- What: weapons hold one modifier per group (Delivery, Flight, Crowd, Tempo; Switched at Birth is Chemistry) in slots that open at weapon Lv 1 (2), 3, 6, 9; each modifier taken levels the weapon; modifier cards come in level-ups as well as DNA strands; the old branch screens no longer open. Switched at Birth switches to one fixed alternate type, N/A where it would spoil the weapon. Genome mutations and defences are dealt in level-ups as sperm passives (2 slots, +1 at Lv 8, 16, 24); weapon mutations and cut cards are never dealt; elite mutation drops, mid-run splices, built-in sample shields and combo bonus mounts are off. The Laser (Fire Beam) is Ordered Online's 4th starter; The Runs is off the roster.
- Save data: none.
- Hooks: mutdrop.js mdDraftSkip -> spSkip. Replaced by assignment (no shared file edited): modifiers.js modOk, modAdd; modcards.js modCardOk, modCard, sabCard, modDraftCands; weapons24.js wupLevel; genes.js genesLevel.
- Risk: big balance shift (no weapon branch cards, no built-in shields, fewer Genome slots early); weapons level more slowly (only through modifiers); Private Schooled and Not of This World lose their shields; v9 weapon tier cards still open only through modifiers.

### Folded from ccr-5e56e811-ce1r6c: 2026-10-23 Splash intro lag fix (v10.68)
- Systems: ui (splash)
- Files: splash.js
- What: the focus phase of the opening splash no longer uses a canvas blur filter (very slow in the Android WebView). The slide is drawn small and scaled up for the soft look, and the canvas resolution is capped at 1.5x.
- Save data: none
- Hooks: none
- Risk: the out-of-focus look is slightly different (softer, pixel-scaled rather than gaussian).

## v10.67: 2026-10-22 Daily Challenge card, Immune Response on Mode Select, previews on paper
- Merged: claude/determined-goldberg-3z778m.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 Daily Challenge and Immune Response back in the v10 start flow; previews on paper (v10.67)
- Systems: ui (Sample Rack, Mode Select), daily, preview, kindred
- Files: rackextras.js (new), daily.js, preview.js, eink.css, kindred.js, index.html, tests/rackxtest.js (new), tests/v9armstest.js, tests/run.sh, ARCHITECTURE.md
- What: the Daily Challenge is a card at the top of the Sample Rack (its title button went with the Figma title) and picks its sample from the v10 samples only. Mode Select has the Immune Response stepper (v9 strings), so it can be set under v10 again. Weapon previews read as white grid paper on Paper menus (the canvas is inverted with its hues turned back; Ink menus keep the dark slide). The Race fusion ceremony draws a v9 sample with the Baseline body instead of nothing.
- Save data: none (META.heat and META.heatMax as in v9).
- Hooks: kindred.js kinFuseDraw body -> Baseline for v9 samples; preview.js makePreview adds class pvpaper.
- Risk: the daily's sample for a given date changes (v10 samples only). Preview colours on paper are the inverted glows (hue kept, lightness flipped).

## v10.66: 2026-10-22 v9 samples, weapons, combos and fusions back; Dinner Time fix; suite green
- Merged: claude/determined-goldberg-3z778m.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 Dinner Time works again; red tests fixed (v10.66)
- Systems: weapons (Sister Cousin branch), tests
- Files: wup5.js, tests/wup5test.js, wup6test.js, weapons24test.js, loadouttest.js, wup1test.js
- What: a Dinner Time sibling gets a fresh range of flight with each kill, so it can reach three kills and swim home (since reach stopped growing with level on 20 Oct it ran out after two). Tests: wup5/wup6 run with the V11 power curve off like wup1 to wup4 (they test card mechanics, not pacing); wup6's egg-cap checks keep enemies off the eggs (they were flaky); weapons24test counts the 24 apart from Sample 9's and the v9 weapons; loadouttest expects the Tackle Box in the bottom row (design system v2 dock); wup1test's Hiccups average takes 4000 samples (400 failed by chance about 1 run in 20).
- Save data: none
- Hooks: none
- Risk: Dinner Time siblings fly a little longer after a kill.

### Folded from claude/determined-goldberg-3z778m: 2026-10-22 v9 samples, weapons, combos and fusions back under v10 (v10.65)
- Systems: weapons, samples, combos, ui (Sample Rack, Field Guide)
- Files: v9arms.js (new), samples9.js (new), index.html, tests/v9armstest.js (new), tests/run.sh, tests/drafttest.js, samplestest.js, ufeatstest.js, v10test.js (only v10 samples where a test assumes a Unique Feat or Baseline's starters), ARCHITECTURE.md, GAME_GUIDE.md
- What: all 64 v9 weapons not already live are back in every weapon draft (91 live weapons). The retired types are re-typed (Cooties to Alien, Oil to Fire, Water to Mucus) and each has one attack type. They have no branch cards, so their tier screens (every 4th level, internal Lv 3 / 6 / 10) offer three fitting v10 modifier cards instead, which also lets them reach Lv 5 for their combos. Their 59 Combos, 40 Pairings and 5 Super Combos (fusion ceremony) can happen again and show in the Field Guide. The 11 v9 samples sit in the Sample Rack after the v10 ones, with their v9 traits, starting abilities and starters.
- Save data: META.v9pick added (the v9 sample last picked).
- Hooks: none in shared files (rows pushed into weapons24.js W24/W24_IDS/W24_BY/W24_DESC and SAMPLES10/S10_BY/KIN.skip; wraps weapons24.js wupNextLv and wupForkCards, UI.startGame, genesStart and slPicStart).
- Risk: the 27 come up far less often in drafts (91-weapon pool). v9 weapon balance under v10 combat is untuned (8 s solo damage: median level with the 27, a few outliers both ways). About 25 combo and 11 weapon descriptions still name retired types or old weapon names (copy for the user). New copy placeholders: TODO_COPY:s9_origin, TODO_COPY:s9_family (Field Guide samples list).

## v10.64: 2026-10-22 Design system v2 port (e-ink menus, pictograms, Immersive-only HUD, Figma screens)
- Merged: ccr-ui-port (local session, applied on v10.61 and merged with main at v10.63).
- Merge: no conflicts. Tests updated to the port's intended copy and order: kindredtest (WEAPON DRAFT, LEVEL UP headings), v10test (mode order Race, Petri Dish, Endless, Level 1). Still failing, as at hand-off and not UI: weapons24test, wup5test, wup6test.

### Folded from local-ui-port: 2026-10-22 Tackle Box into the bottom row; leaner loot cards
- Systems: hud, ui
- Files: eink.css
- What: Bottom row is Rewind 52 x 52, Autorun 106 x 52, Tackle Box 52 x 52 (rounded rectangles), pause alone top-right. Loot cards drop the pin / hide (1/2, X) buttons and the sub-line (e.g. Defence | Squishy | New); the category and its swatch sit top-right.
- Save data: none (pins and hides made before still apply).
- Hooks: none.
- Risk: pinning and hiding cards is no longer reachable from the card screen.

### Folded from local-ui-port: 2026-10-22 Immersive dock revised
- Systems: hud
- Files: eink.css
- What: Feats are round keys stacked bottom-left, opposite the weapons; Rewind (64 x 52) and Autorun (140 x 52) are rounded rectangles at the bottom centre; the starting ability sits above the Feats.
- Save data: none.
- Hooks: none.
- Risk: portrait only (landscape keeps its row).

### Folded from local-ui-port: 2026-10-22 Design system v2: close match to the Figma screens, Immersive only, new intro
- Systems: ui, hud, settings, splash
- Files: dsheads.js (new), splash.js, eink.css, settings.js, samples10.js, ui.js, index.html, tests/uishots.js (new), tests/tapcycle.js
- What: Immersive is the only in-run HUD (the setting is gone). Title tiles: Field Guide first, How to Play last. Screen Header (01/02, 02/02, LV nn, IT'S A BABY!, Game Over title with Run over) on Sample Rack, Mode Select, Weapon Draft, DNA Loot, It's a Baby and Game Over, with the Figma copy (CHOOSE EXPERIMENT, BASELINE SAMPLE, WEAPON DRAFT, LEVEL UP, Level n strand | splice one gene, REROLL (n LEFT)). Mode cards: #001 left, tag right; Evolution (the Race) first, Iteration, Endless, Level 1. Sample cards show type swatches, not names. Loot cards in the Reward Card layout (rarity chip under the tile, category + swatch at the bottom). Draft loses its restating kicker and repeated description. Pause YOU stats as one ruled readout grid, BUILD and GUIDE as plain rows. Gene Bank: full numbers, Banked / Earned / Spent. Active Effects split For you / Against you. Game Over: time in the readouts, 2 x 2 buttons. New intro (splash.js): on paper, an ink eyepiece draws itself, the slide is pulled into focus, brackets lock onto you, the logo sets itself where the title has it.
- Save data: SET.immersive is now ignored (left in saves).
- Hooks: none in shared files beyond ui.js (Gene Bank readout markup, Active Effects grouping, Game Over Time cell, REROLL label) and samples10.js (mode card copy and order).
- Risk: dsheads.js wraps several UI functions; anything else wrapping them must load before it. The full HUD (top bar, minimap, event chips) is no longer reachable.

### Folded from local-ui-port: 2026-10-22 Design system v2: remaining screens, Menus copy, pictogram coverage
- Systems: ui, settings, icons
- Files: pictomap.js, eink.css, ui.js, settings.js, seqsel.js, tests/tapcycle.js
- What: Gene Bank leads with a Readout Panel (DNA banked as the hero number, earned, spent) and the next swimmer as a pictogram card. Game Over and Victory stats are Readout Panels, four per row. How to Play rows lead with pictograms. Stat upgrades (PASSIVES, 65) and the last achievement map to shared pictograms; mutation cards 171/200 (the other 29 are v9 genome cards, they show the Mutation category pictogram). Menus setting has its copy (label Menus, PAPER / INK / AUTO). Pinned action bars sit flush with the bottom edge. The v9 sequence screen (openSeq) now opens the v10 Sample Rack: it crashed on v10 profiles after a Petri Dish win (NEW SEQUENCE) and after a Sequence Reveal.
- Save data: none.
- Hooks: seqsel.js openSeq redirects to UI.openSamples under V10.
- Risk: Immune Response can only be chosen on the old sequence screen, so it is now unreachable under v10 (it already was in practice, the screen crashed).

### Folded from local-ui-port: 2026-10-21 Design system v2: Immersive HUD and 64px pictograms on every card screen
- Systems: ui, hud, icons, autorun
- Files: pictomap.js (new), eink.css, ui.js, uikit.js, loadout.js, fusion.js, samples10.js, junk.js, prestige.js, manualfire.js, tests/einkshot.js
- What: In-run HUD follows the Figma Immersive HUD: dark film keys, round weapon keys stacked bottom-right with a reload ring, Rewind bottom-left with a round RUN / directive key under it, Feats bottom-centre (manual fire: the FIRE keys take the right column). 64px pictograms lead loot and reward cards, draft options, the Tackle Box header and loadout, Field Guide rows, Gene Bank traits and starters, mode cards, autorun options (Pause RUN as option cards), achievements, active effects and junk DNA, baby traits and fusion. Card names are ink; loot titles ink.
- Save data: none.
- Hooks: ui.js refreshHud sets --f on each slot (reload ring); ui.js renderLootCards uses lootPictoHtml; manualfire.js toggles body.mfire.
- Risk: dock layout in portrait Immersive changed (landscape and full HUD keep the old row). Tests updated: einkshot (Menus rule), tapcycle (weapon keys may stack in a column). Full suite 105/109 before the tapcycle fix; still failing and not UI: weapons24test (expects 24 weapons, the pool is 27 with the Early Bird three), wup5test (Toxic Relationship share), wup6test (Eggs clutch cap).
- Also: Settings rows as stacked cards, Segmented Tabs for Pause and Settings, pinned actions stay at the bottom, Field Guide and Active Effects as full-width pictogram rows, mode cards with pictograms, draft options in three columns, baby traits as three cards, Ink tokens on Fusion / Sequence Reveal / Kindred Fuse, splash words in HUD ink.

### Folded from local-ui-port: 2026-10-21 Design system v2 in the game: tokens, pictograms, title
- Systems: ui, settings, icons
- Files: eink.css, settings.js, index.html, pictos.js (new), tests/tools/pictos.py (new)
- What: The e-ink design system is now the only menu style (eink.css always on); View is LAB / ARCADE again and a new Menus setting picks PAPER / INK / AUTO. Tokens regenerated from Figma (radii 3/5/7, 3px button rule, 31px titles, reward/state/HUD colours, text styles). All 335 Figma pictograms ship as path data (121 KB, 45 KB gzipped) with a renderer. Title: hero egg, nav as 2 x 2 pictogram tiles, Daily Challenge hidden.
- Save data: SET.menus added ('paper' default); SET.view 'eink' migrates to 'arcade' + menus 'paper'.
- Hooks: none (index.html script tag for pictos.js before wicons.js).
- Risk: every DOM screen restyles (eink.css now loads for everyone). Daily Challenge has no entry point while its title button is hidden. New copy placeholders: TODO_COPY:set_menus, TODO_COPY:set_menus_hint.

### Folded from local-wicons: 2026-10-21 Weapon icons drawn from what each weapon does
- Systems: weapons, ui
- Files: wicons.js (new), index.html
- What: the 27 live weapons (the 24 plus the three Early Bird weapons) get their own icons, drawn from what they do (a dumbbell for Maximum Gains, a nappy for Nappy Mines, a moon over a puddle for Nocturnal Emission), replacing the generic gun shapes. Same grid as icons.js: 24 x 24, stroke 1.7, in the damage-type colour. Matches Figma "Weapon Icons v2".
- Save data: none.
- Hooks: none (index.html script tag after w24look.js).
- Risk: none for play. Signature slots that carry an old weapon id get the new icon too (ICON_OF[sigOf]).
- Not shipped: no APK built (local Mac has no SPAWN_KS_PASS or Android SDK). Ship from the cloud environment.

## v10.63: 2026-10-21 Feat level-up card gains, Weapon Atlas tree
- Merged: ccr-2c93f95d-u8jz5s, ccr-e216d253-cail6q.

### Folded from ccr-2c93f95d-u8jz5s: 2026-10-21 Feat level-up card says what the level adds
- Systems: feats, draft
- Files: feats10.js
- What: the Feat "enhance" card no longer says "More of whatever it does"; `f10UpText` writes the next level's real gains (+35% damage, effect +20% and area +15% at level 2, effect +20% and cooldown 19% shorter at level 4, 5% shorter cooldown each level, and a fork notice at levels 3 and 5).
- Save data: none
- Hooks: none
- Risk: text only; numbers mirror `f10Stats` and `computeStats`, so change both if those do.

### Folded from ccr-e216d253-cail6q: 2026-10-21 Weapon Atlas rebuilt for v10.62
- Systems: tests (tools)
- Files: tests/tools/atlas/atlas.js, tests/tools/atlas/template.html, NOTES.md
- What: the Atlas also has a branching upgrade tree (weapon > 3 promises > 3 branch cards each > 3 masteries, with combos on each promise). The Atlas builder now reads the v10 data (24 weapons plus Sample 9's three, 9 samples, promise / branch / mastery cards from `WUP`, the 30 `C10` branch combos, 21 `RX10` reactions) instead of the v9 sequences and 78 weapons. Atlas artifact republished at the same URL.
- Save data: none
- Hooks: none
- Risk: none (no game code touched)

## v10.62: 2026-10-21 rescues are a race's only weapon drafts
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescues are a race's only weapon drafts; Donor DNA when mounts are full (v10.62)
- Systems: kindred, ui (Tackle Box)
- Files: kindred.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race there are no level-up weapon drafts. Rescues come at 02:00 and 05:00; their screen offers the sample's three weapons plus one of your own sample's starters you don't hold, and the pick fills an empty mount or grows one (up to 3). Skip keeps the mount free. At 08:00 and 11:00 a rescue comes only if a mount is empty (a skipped rescue or a Recycle). Recycle in a race gives its rerolls and leaves the mount for the next rescue instead of opening a draft (its button text is a TODO_COPY placeholder in races). At 08:00 or 11:00 with every mount full, a Donor DNA strand (weapon modification screen) lies out with the same beacon instead (TODO_COPY banner and source name). With every mount full, a rescue still absorbs and plays the fusion, with no weapon screen.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.renderArmoury for the Recycle text; draftBox now drops non-rescue weapon drafts in a race).
- Risk: balance: one weapon for the first two minutes (the bot sim checks survival); 3 weapons at most, by 05:00.

## v10.61: 2026-10-21 absorbed samples change your head
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Absorbed samples change your head, not just your tail (v10.61)
- Systems: kindred, samples (looks)
- Files: kindred.js, ARCHITECTURE.md
- What: each absorbed sample adds its key feature to your head (user's picks): Baseline its glowing tag; Alpha its pointed nose and ridge; Beta a crooked neck, its droplet and a big coiled tail tip; Private Schooled a gold rim and crest; Ordered Online a robot shell with a blinking light over the back of your head; Redtail a wobbling red blister (plus its frayed tail); Prawn Again a white-gold glow with rays (plus its halo); Not of This World three glowing tentacles and a glowing core; Sample 9 a steaming pink rim (it is not rescuable yet). You also draw 15% bigger per absorbed sample (`KIN.grow`; hitbox unchanged). Shown in the fusion too.
- Save data: none.
- Hooks: none new (kindred.js's slDraw wrapper now also swaps SL_HEAD for the call).
- Risk: none to play; a Not of This World player still takes no grafts.

## v10.60: 2026-10-21 rescue beacon, autorun COLLECT for every collectable
- Merged: ccr-455e7cea-1tppwd.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue beacon; autorun COLLECT goes for every collectable (v10.60)
- Systems: kindred, autorun
- Files: kindred.js, render.js, tests/kindredtest.js, ARCHITECTURE.md
- What: a waiting kindred spirit sends sonar pings and a column of light, has a big bobbing arrow over it on screen and a gold edge badge (a sperm inside, an arrow out) off screen, and nudges you (sound, buzz, marker swells) every 20 s. Autorun on COLLECT now heads for it first, chases mutation carriers, and goes for pickups and XP beyond its old reach.
- Save data: none.
- Hooks: render.js drawHud -> kinPointers() (no argument now). kindred.js also wraps autorun.js arGoal.
- Risk: COLLECT runs swim further for loot, so they meet more enemies.

## v10.59: 2026-10-21 eInk view, Sample 9 copy, rescue copy
- Merged: claude/exciting-allen-oy8n9q (eInk view), ccr-cbe5a578-nzu9tn (Sample 9 copy), ccr-455e7cea-1tppwd (rescue copy drafts). Suite: 105 passed; weapons24test and wup5test fail as before the merge (they expect 24 weapons; Sample 9 makes 27).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue copy drafted (v10.58)
- Systems: kindred, samples
- Files: kindred.js, samples10.js
- What: the two rescue placeholders filled with Claude-drafted lines (the user asked for drafts): the spawn banner "ONE OF YOUR OWN, STRANDED" and the locked-sample hint "Rescue it when it turns up stranded in The Race." Awaiting the user's read-through.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-exciting-allen-oy8n9q: 2026-10-21 eInk view always light (v10.52)
- Systems: style, settings
- Files: settings.js, tests/einkshot.js, ARCHITECTURE.md
- What: eInk view is always Paper (light), whatever the phone's dark setting.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-exciting-allen-oy8n9q: 2026-10-21 eInk view (v10.51)
- Systems: style, settings, ui
- Files: eink.css (new), fonts/Barlow-*.ttf + OFL.txt (new), style.css, index.html, settings.js, ui.js, tests/einkshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: Merged the e-ink UI archive. Settings > View now has a third option, EINK: every DOM screen and the HUD use the Figma e-ink design system (grey paper, 2px ink rules, Barlow, no glow or grain; Ink mode, AMOLED black, when the phone is in dark mode), over the Arcade slide. style.css's hardcoded greys now use the colour tokens (Lab and Arcade look the same as before, near enough).
- Save data: SET.view gains the value 'eink' (no new keys).
- Hooks: ui.js applySettings -> applyEink(); index.html loads eink.css (media off) after style.css.
- Risk: viewArcade() is true in eInk view, so everything gated on Arcade (full colour, rings, Immersive AUTO) applies. TODO_COPY:set_view_eink_hint open. Barlow adds about 530 KB to the APK.

### Folded from ccr-cbe5a578-nzu9tn: 2026-10-20 Sample 9 copy dropped in (v10.51)
- Systems: weapons, samples, feats
- Files: acrocopy.js (new), acro.js, acrosample.js, index.html, ARCHITECTURE.md
- What: all 143 Sample 9 strings (sample card, Premature Evaporation Feat and forks, X9 Watched Pot and forks, three weapons, 45 branch cards) now come from `ACRO_COPY`; no `TODO_COPY` left in play. Written by Claude at the user's request, so the user may want to rewrite.
- Save data: none
- Hooks: acro.js / acrosample.js `T()` reads `ACRO_COPY[id]`
- Risk: none beyond copy quality; limits checked against SAMPLE_9_ACRO.md section 6.

## v10.57: 2026-10-21 V11: kindred spirits, one pick per screen, power curve
- Merged: ccr-455e7cea-1tppwd (v10.51 to v10.57).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 V11 power curve: no early one-shots, range falloff, per-level gains (v10.57)
- Systems: power11 (new), combat
- Files: power11.js (new), index.html, tests/p11test.js (new), tests/fighttest.js, tests/wup1test.js, tests/modstest.js, tests/ufeatstest.js (curve off: they test exact mechanics), tests/tools/guide.js, ARCHITECTURE.md
- What: until 2:00 one hit can take at most half a germ's or elite's health (lifting by 5:00; branches and mutations still multiply past it); damage against germs starts at 70% and reaches full by 10:00; early germs have x2 health, back to normal by 8:00; each level gives +0.5% damage, +0.5% attack rate and +1.5 max health; direct hits beyond 220 units lose damage, down to 55% at 600. Only your weapons' and Feats' hits (src.w); hazards, terrain and events are untouched. Bosses and rivals keep their tuning (range still applies). Sims: early one-shots ~90% -> 0 to 10% for every starter (median 2 to 3 hits); bot deaths unchanged (mostly 6 to 8 min either way).
- Save data: none.
- Hooks: none in shared files (wraps game.js makeEnemy, fight.js fightHit, juice.js levelJuice).
- Risk: balance in every v10 mode (Petri Dish and Endless too); Level 1 not checked; long-range weapons lose up to 45% on far targets.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Weapon branch screens back (v10.56)
- Systems: weapons (branch screens), ui
- Files: sidemo.js, tests/kindredtest.js
- What: weapon upgrade tiers open in the Weapon Draft layout again, with a tab and a live scene per branch (`SIV_DRAFT` true). Mutations and modifications stay plain cards.
- Save data: none.
- Hooks: none.
- Risk: the v10.44 run that stalled did so as this screen opened; watch the run log's fps line.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescue made a big deal: portrait, pick or skip, fusion animation (v10.55)
- Systems: kindred, ui (reward screens)
- Files: kindred.js, v11ui.js, tests/kindredtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: the rescue's Weapon Draft screen shows the rescued sample swimming at the top; pick one of its weapons or skip; either way a fusion plays (the two swim together, flash, and your new grafted body swims out, with both names). Paused throughout; tap to close after 2.6 s, closes itself at 5 s.
- Save data: none.
- Hooks: none new (kindred.js wraps UI.openDraft and UI.pickLoot; v11ui.js v11Skip calls kinFuse).
- Risk: none beyond the screens; the fusion borrows the drawing globals for its frames (as slPicDraw does).

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 One pick per screen; stacked rewards come back to back (v10.54)
- Systems: reward director, ui (reward screens)
- Files: director.js, v11ui.js, v10.js, tests/drafttest.js
- What: waiting level drafts no longer merge into a four-card take-two screen. Every screen offers three cards and one pick; with two or three rewards waiting, closing (or skipping) one screen opens the next at once, then the usual 30 s gap resumes. The no-sample start draft offers three, not four.
- Save data: none.
- Hooks: none new (v11ui.js listens on #skipBtn).
- Risk: more screens in a row after a big XP burst (they were merged before); `DIRECTOR.merge = true` brings take-two back.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 V11 headings, skippable weapon drafts, earlier rescues, fewer race drafts (v10.53)
- Systems: ui (reward screens), kindred, engine (levelling)
- Files: v11ui.js (new), kindred.js, game.js, index.html, tests/kindredtest.js, tests/drafttest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: reward screens head by kind (CHOOSE AN UPGRADE, CHOOSE A WEAPON, UPGRADE A WEAPON, CHOOSE A MUTATION); every weapon draft but the first has SKIP (+2 REROLLS), leaving the mount empty. Rescues at 03:00 and 06:00. A race grows a weapon mount only at Lv 5 (no Lv 12 draft): four weapon drafts a race (first, Lv 5, two rescues).
- Save data: none.
- Hooks: game.js levelling -> kinSlotLv (the SLOT_LEVELS check).
- Risk: race balance (one fewer level-up weapon, rescues 2 to 4 minutes earlier); the Build panel and pause screen still name Lv 12 as the next draft in a race.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Rescued samples change your body; one card screen for upgrades (v10.52)
- Systems: kindred, samples, ui (reward screens), weapons
- Files: kindred.js, boxlook.js, sidemo.js, tests/kindredtest.js, tests/sivtest.js, tests/tools/guide.js, ARCHITECTURE.md
- What: an absorbed sample grafts onto your body (your tail in lengths: yours, then each rescued sample's; Not of This World a glow; Prawn Again its halo). The rescue pick now uses the Weapon Draft screen, like the starting weapons. Weapon upgrade tiers, mutations and modifications all use the plain card screen (flags `SIV_DRAFT`, `BOX_LOOK_ON` bring the old screens back).
- Save data: none.
- Hooks: none new; kindred.js also wraps samplelooks.js slDraw.
- Risk: other branches working on sidemo tier screens or boxlook heads will find them switched off.

### Folded from ccr-455e7cea-1tppwd: 2026-10-21 Kindred spirits: sample rescue and absorption in The Race (v10.51)
- Systems: kindred (new), samples, weapons, ui
- Files: kindred.js (new), samples10.js, sigweap.js, render.js, index.html, tests/kindredtest.js (new), tests/samplestest.js, tests/v10test.js, tests/tools/guide.js, ARCHITECTURE.md
- What: in The Race a stranded sperm of another sample appears at 05:00 and 10:00 with an edge chevron; touching it absorbs it (its passive runs beside yours, its three weapons join the run's pool, it unlocks as a starter) and opens CHOOSE YOUR DIFFERENCE, where one of its weapons goes on a new mount. Race weapon drafts only offer carried samples' weapons. The old sample unlock watches (wave 10, a Mythical box and so on) are retired.
- Save data: META.s10 now also written by rescues; no keys added.
- Hooks: render.js drawHud -> kinPointers; sigweap.js v10Pool -> kinPool (filter). samples10.js passives read s10Has instead of G.s10.id.
- Risk: balance (a 4th and 5th weapon mount by 10:00; absorbed passives stack); slot drafts in a race often deal one card (your own remaining starter). weapons24test already failed on main (27 weapons with Acro).

## v10.50: 2026-10-20 bubble hitbox, between-wave close-up, glossary, voice check
- Merged: claude/affectionate-cerf-6ris1m, claude/dazzling-bohr-o55gfr, ccr-be55daae-goa9o3, claude/kind-faraday-bpyfxx (You check tab in Card_Copy_Draft_All.xlsx; Alpha and Prawn Again exempt from the "we" voice rule).

### Folded from claude-affectionate-cerf-6ris1m: 2026-10-20 Membrane bubble is a hitbox again (v10.49)
- Systems: combat (pdef), enemies, projectiles
- Files: pdef.js, game.js, tests/bubblehit.js (new)
- What: while your shield (Membrane) is up, the bubble is solid. Enemies touch it at its edge (not your body), are held outside it and shoved back (heavier ones less, bosses barely). Enemy shots stop at its edge and the Membrane soaks them. With the Rubber Johnny relic the bubble also throws each stopped shot back out at the mirrored angle as a player shot (the v9 skin did this; `!V10` had switched it off). Once the Membrane breaks, the bubble is gone and contact is on your body as before.
- Save data: none.
- Hooks: game.js updateEnemies -> pdefBubbleR / pdefBubbleBounce (contact radius); game.js enemy-bullet loop -> pdefBubbleR / pdefBubbleReflect (hit radius).
- Risk: balance. Contact and bullet hit radius is now the bubble's (38 units vs body ~13) while a shield is up, so the Membrane drains a little sooner; enemies can no longer body-block you inside the bubble. Sims not run.

### Folded from claude-dazzling-bohr-o55gfr: 2026-10-20 Close-up between waves; tutorial cards pan to terrain and the egg (v10.49)
- Systems: wave-mode, camera, tutorial
- Files: restcam.js (new), game.js, bosses.js, tutorial.js, index.html
- What: while the next-wave button shows, the camera zooms in on your sperm and sits low of it so the button does not cover you; it eases back out when the wave starts. Terrain and egg tutorial cards now pan and zoom to the thing they explain (they used to spotlight you).
- Save data: none
- Hooks: game.js update -> restCamTick (camera line); bosses.js updateBossIntro reads I.zk
- Risk: ZOOM.z is written directly during the rest (not saved); pinching during the rest becomes the new base zoom.

### Folded from ccr-be55daae-goa9o3: 2026-10-19 Glossary: v10 combat terms
- Systems: ui (glossary)
- Files: glossary.js
- What: Held loot cards now explain Poise, Alien bar (Possessed), Burn bar (Ignition), Corrosion, Membrane, Shell, Squishy, Thorns, Evasion, Snared, Conjoined and Bleeding (Extraction). Second pass: the six attack types, bars, run terms (sperm count, egg, Final Five, Fever Pitch, Behind pace, Stamina, Chrono energy), all 24 field pickups, terrain, big hazards and wave conditions. Charged text updated for v10.
- Save data: none.
- Hooks: none.
- Risk: none (text only).

## v10.48: 2026-10-20 local work merged (card copy, Sample 9 and tuning, consciousness gifts, design system, Ordered Online nanobot)
- Merge notes: main's feats9.js Feats (Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb, Ear Candling) removed in favour of the local builds with the user's copy (feats10.js, gifts10.js); fitcheck.js uses the new card names; voice canon ("we" mostly, "you" to blame, "I" when selfish) written into voice_and_tone.md, VOICE_GUIDE.md, CONSCIOUSNESS.md, redesign docs CLAUDE.md and COMBAT_MATRIX.md.

### Folded from local-card-copy: 2026-10-20 Card copy: names, descriptions and per-sample voice lines (not shipped)
- Systems: weapons, feats, mutations, modifiers, combos, draft, ui
- Files: cardvoice.js (new, generated), tests/tools/copy/cardvoice.py (new), feats10.js, mutations.js, combos10.js, modifiers.js, wup1.js to wup6.js, weapons24.js, draft.js, modcards.js, combos.js, sandbox.js, fitcheck.js, aldemo.js, asdemo.js, bldemo.js, fbdemo.js, mfdemo.js, scdemo.js, index.html, style.css, tests/wup2test.js, tests/wup4test.js, tests/wup5test.js
- What: 477 cards get the user's approved copy from Card_Copy_Draft_All.xlsx: new names and "what it does" text, and a consciousness line per sample (three for Not of This World, by active damage type) shown in each card's italic quip. Feat cards no longer prefix their old generic line to the description. Promise cards skip the "Costs:" suffix when the new text already carries the cost (costs fields unchanged).
- Save data: none. (A run saved mid-way keeps old branch names in w.up.l6/l10; harmless, only text lookups.)
- Hooks: draft.js cardOpt and weapon fork cards -> quip: cardVoice/cardLine; weapons24.js wupForkCards card() -> quip; modcards.js modCard -> quip; combos.js optCombo -> quip; sandbox.js sbDraftInfo shows o.quip; feats10.js feat() text = d.does.
- Risk: renamed weapon cards are matched by name in fitcheck.js and the *demo.js flag maps (updated per weapon); tests/tools/guide.js prose and fitcheck.js FIT_TEXT (The Runs' Static versions) still use some old names and old text.

### Folded from local-sample9: 2026-10-20 Range stops growing with level (not shipped)
- Systems: engine
- Files: game.js
- What: long-range weapons stay at REACH_START (300, about a phone's half-width) at every level instead of growing 30 a level to their full range (Acid Spit was 300 / 390 / 440 by tier), so kills happen on screen. Range upgrade cards still multiply it.
- Save data: none.
- Hooks: none (one line in computeStats).
- Risk: every long-range weapon is weaker from tier 2; balance shifts for all samples (bot sim below is noisy at 4 runs a sample).

### Folded from local-sample9: 2026-10-20 Sample 9 (proposed): sample, three weapons, 45 branch cards, tuning (not shipped)
- Systems: acro, acrosample, samples, weapons24, feats10
- Files: acro.js (new), acrosample.js (new), index.html
- What: Sample 9 (Acid / Fire, all text TODO_COPY): its three weapons (acro_cap, acro_spray, acro_spark) join the roster with their branches; the sample itself (passive, Unique Feat, exclusive gift X9, unlock, body, cosmetic lurch). Tuned after bot sims: Feat penalty -25% for 4 s (was -50% for 6 s); cap 34, spray 8 per pellet, beam 4 per tick. Spec: redesign docs/SAMPLE_9_ACRO.md.
- Save data: META.s10.acro (unlock), META.s10runs.acro.
- Hooks: none in shared files; wraps wupStats, wupFire, wupDmgMul, wupHit, wupKill, wupTick, hurtPlayer, s10Hit, s10DmgMul, s10Tick, sampleLook.
- Risk: roster is 27 weapons; any sample can draft the three. TODO_COPY strings show in the UI until the copy is written.

### Folded from local-sample9: 2026-10-20 Van de Graaff Feat (not shipped)
- Systems: feats
- Files: feats10.js
- What: the re-gifted Van de Graaff (FEATS.md F6) is built and in the starting pool; Lv 5 fork text TODO_COPY.
- Save data: none.
- Hooks: none (f10Tick and f10Draw call its own functions in feats10.js).
- Risk: one more Static Feat in the draft.

### Folded from local-sample9: 2026-10-20 Beams pass Charge arcs every 3rd hit (not shipped)
- Systems: combat
- Files: fight.js; redesign docs/COMBAT_MATRIX.md (decision 45, sections 4 and 11.5 Charge rows), tables/*.csv (re-exported)
- What: a Beam's Static hits pass Charge arcs on only every 3rd hit, counted per weapon (fightBeamArcOk). Red Flagship at level 1 (weapon arena, XP frozen): 65 to 75 damage a second before, 61 to 72 after; its arc share 19-22% to 14-15%. Every other attack type unchanged.
- Save data: none.
- Hooks: none (one helper in fight.js, called from fightStatus).
- Risk: Red Flagship's Static-arc branch cards and combos (Static Cling, Crossing the Streams) see a third of the arcs from beams.

### Folded from local-sample9: 2026-10-20 Beam base damage 3.5 to 3 (not shipped)
- Systems: v10, weapons
- Files: v10.js (V10_ATK.beam.base.dmg)
- What: the matrix beams' base damage drops 15%. Live, that is only Red Flagship (Soulmate Signal and Sample 9's beam set their own). Red Flagship at level 1, XP frozen: 61 / 72 damage a second (standing / circling) after decision 45, 56 / 62 after this; field: Standard Issue 47 / 50, Nervous Wreck 45 / 78, Acid Spit 33 / 40.
- Save data: none.
- Hooks: none.
- Risk: the archived matrix beams (Lab Bench, Switched at Birth targets) drop too.

### Folded from local-sample9: 2026-10-20 Chain jumps don't pass Charge arcs (not shipped)
- Systems: combat, engine
- Files: fight.js (fightArcOk, was fightBeamArcOk), game.js (doChain tags jumps chainHop); redesign docs/COMBAT_MATRIX.md (decision 46, Charge rows), tables/*.csv
- What: only a chaining attack's first hit passes Charge arcs on; its jumps (doChain and the chaining modifier) don't. Unwanted Contact at level 1, XP frozen: 96 / 86 damage a second (standing / circling) before, 84 / 81 after; its arc share 30% to 17%.
- Save data: none.
- Hooks: none new (doChain adds a src flag).
- Risk: Static Cling combos and Unwanted Contact branch cards that lean on arcs from jumps lose some of them.

### Folded from local-sample9: 2026-10-20 Unwanted Contact damage 13 to 11 (not shipped)
- Systems: weapons
- Files: sigweap.js (sigReg 'tesla' base override; the archived Static Cling def keeps 13)
- What: Unwanted Contact at level 1, XP frozen: 84 / 81 damage a second (standing / circling) after decision 46, 70 / 69 after this. Field in the same test: Red Flagship 60 / 61, Nervous Wreck 43 / 77, Acid Spit 56 / 43, Standard Issue 41 / 46.
- Save data: none.
- Hooks: none.
- Risk: Redtail's starter is weaker; Redtail averaged wave 10.0 in the last big sim, before these Static changes.

### Folded from local-sample9: 2026-10-20 Autorun KITE keeps your reach; targets count from their edge (not shipped)
- Systems: autorun, engine
- Files: autorun.js (arKite, new arReach), game.js (acquire and acquireMany range checks)
- What: KITE's band (240 / 360 / 450) now scales to your longest weapon reach (65% / 85% / 95%, never more than before); with nothing within 420 it closes in on the nearest enemy (that branch could never run before); with a boss alive it closes until the boss's edge is in reach. acquire and acquireMany count an enemy in range when its edge is (range + its radius); shots, beams and chains already hit on contact with the edge, so a picked big target is hittable. Bot, Baseline, 12 instrumented mortal runs each: average wave 11.1 to 12.9, worst run 5 to 9, boss in reach 51% to 62% of boss-fight time; damage share on the boss unchanged (24% to 25%: the aim still picks the escorts).
- Save data: none.
- Hooks: none.
- Risk: player autorun KITE plays closer with short-range weapons; every weapon can now pick big targets slightly further away (by their radius).

### Folded from local-sample9: 2026-10-20 Default aim prefers the boss (not shipped)
- Systems: autorun, engine, ui
- Files: autorun.js (aimDir), game.js (targetScore 'bossfirst'), ui.js (both aim menus set w.dirSet)
- What: a slot on its default NEAREST aim (no tie-breaker, never set in an aim menu) aims at a boss in reach before its escorts while a boss is alive. Bot, Baseline, 12 instrumented runs: damage on the boss 25% to 44%, boss fights won in 50 s on average (was 135 s), but average wave 12.9 to 11.3 (7 of 12 died at the wave-10 boss, to its own attacks: death stare, contact, bullets). Net: shorter boss fights, no gain in how far the bot gets.
- Save data: none (w.dirSet is per run).
- Hooks: none new.
- Risk: players on default aim now shoot the boss over nearer escorts; choosing any aim (even NEAREST) turns it off for that slot.

### Folded from local-sample9: 2026-10-20 Autorun bullet dodging looks further ahead (not shipped)
- Systems: autorun, engine
- Files: game.js (autoSteer: STEER_BUL, bullet radius 300 to 420)
- What: each candidate heading checks bullets at four moments (0.1, 0.225, 0.45, 0.675 s) instead of two, and sees bullets from 420 instead of 300. Bot, Baseline, 12 instrumented runs: average wave 11.8 (spread 3.6), against 11.3 with boss-first aim alone: no measurable change.
- Save data: none.
- Hooks: none.
- Risk: slightly more steering work per frame (4 checks per bullet per heading, more bullets in range).

### Folded from claude-consciousness-gifts: 2026-10-20 X5, X7, X8 to full spec; five old test failures fixed
- Systems: feats10, tests
- Files: gifts10.js, tests/featstest.js, drafttest.js, samplestest.js, ufeatstest.js, v10test.js
- What: X5 also slips chargers' and bosses' aimed wind-ups, and the attack it dodged hits its own side (areas when they go off, dashes for 1.6 s). X7's copies fire your real first weapon (an echo slot at half damage, three quarters with Muscle Memory) and count towards the 8-pet cap (wraps sigweap.js sigPetCount). X8 also clears a Complement Protein's mark (G.complT). Tests: featstest's pool is 16 (Van de Graaff), with tests for Van de Graaff, X9 and the three spec details; drafttest accepts the tabbed tier screen a lone weapon opens; samplestest, ufeatstest and v10test allow the PROPOSED Sample 9.
- Save data: none.
- Hooks: none in shared files (adds a sigPetCount wrap).
- Risk: X7 fires the weapon from the copy by moving the player for one call; a weapon with side effects on the player (a lunge) could misbehave. Supersedes the "Simplified against the spec" note below.

### Folded from claude-consciousness-gifts: 2026-10-20 Doc names for two Feats, Feat-line ownership, run.sh on macOS
- Systems: feats10, card voice, tests
- Files: feats10.js, giftvoice.js (regenerated), tests/tools/copy/giftvoice.py, tests/tools/copy/cardvoice.py, tests/run.sh, CLAUDE.md
- What: Comfort Eating is More! again and Clean Plate is COME BACK HERE (decision 45). Feat card lines are owned by the docs via giftvoice.py, the sheet keeps every other card (decision 46). run.sh runs on a Mac: no `timeout` needed, and it shims playwright-core into out/.pw when `playwright` is missing (nothing installed).
- Save data: none (Feat ids unchanged).
- Hooks: none.
- Risk: anything keyed on the two old titles (none found outside the generated tables).

### Folded from claude-consciousness-gifts: 2026-10-20 Consciousness gift lines, exclusive gifts and six new Feats
- Systems: feats10, card voice, samples10
- Files: gifts10.js (new), giftvoice.js (new, generated), tests/tools/copy/giftvoice.py (new), samples10.js, index.html, tests/featstest.js, ARCHITECTURE.md
- What: every Feat card now shows the approved per-sample gift line from the redesign docs (GIFT_LINES.md, FEATS.md 3), replacing the sheet's Feat lines; Alpha's Red Flagship Lv 3 lines and the Alpha, Beta and Ordered Online sample lines (Ordered Online is now a synthetic nanobot: origin and Scientist line) follow the docs. The eight sample-exclusive gifts X1 to X8 are drafted for their own sample only, and THIS WAY, Capacitation, Bombardier Beetle, Spinnbarkeit, Wandering Womb and Ear Candling join the later unlocks. Level 5 forks for all fourteen were written in code (the docs list level 3 only). The card text for the fourteen (does lines, fork names and descriptions, pops) was written by Claude and approved as written by the user on 20 Oct.
- Simplified against the spec: X5 dodges only the telegraphs newfoes.js exposes (G.nfBurst, wind-ups) and the dodged attack does not hit its own side; X7's copies fire bolts of the first weapon's damage type at half damage (at most two copies; they do not count towards the pet cap); X8 reacts to statuses only, not marks.
- Save data: none.
- Hooks: none in shared files (wraps f10Hurt, f10Kill, f10Tick, f10Draw, arGoal, sampleLook).
- Risk: Card_Copy_Draft_All.xlsx's Feat lines are now overridden: rerunning cardvoice.py alone no longer changes Feat lines (run giftvoice.py). Balance of the new gifts is untested by sims. Ordered Online's body still draws the old frosted look (samplelooks.js): the nanobot look is follow-on work.

### Folded from local-design-system: 2026-10-20 HUD, loot cards and boss card through the kit
- Systems: ui, uikit, hud
- Files: uikit.js, ui.js, index.html, ARCHITECTURE.md
- What: the HUD overlay (uiHud: uiHudKey, uiWeaponSlotClass/Inner, uiRewindButton, uiToast, uiSystemMessage) and the boss introduction (uiBossIntro, uiBossCard) moved out of index.html into builders; uikit.js fills #hud and #bossIntro as it loads, with every element id unchanged. Loot and weapon-upgrade card bodies use uiLootCard, the section labels uiLootSection. Screens pixel-identical; 17 tests pass (quick, hudshot3, bossshot, bosstest, rewindtest, loottest, mythtest, overtest, tapcycle, introtest, rivintro, newtut, tuttest, settabs, autotest, putest, wup1test).
- Save data: none
- Hooks: none (uikit.js now fills #hud and #bossIntro at load)
- Risk: low. Anything that adds elements to #hud must run after uikit.js loads (all current code does: it runs from ui.js init or later).

### Folded from local-design-system: 2026-10-20 Last lists and chip rows through the kit
- Systems: ui, uikit
- Files: ui.js, aimat.js, junk.js, samplelooks.js
- What: the Combos, Pairings and Damage-type synergies lists and the Autorun directive chips (ui.js), the whose-mess chips (aimat.js), the Junk DNA list (junk.js) and the Field Guide samples list (samplelooks.js) now use uiList/uiChips/uiChip/uiHint. No hand-written .list or .chips markup is left in web/js. Screens pixel-identical; 16 tests pass (adds aimowntest, pairtest).
- Save data: none
- Hooks: none
- Risk: low.

### Folded from local-design-system: 2026-10-20 Every menu panel through the kit
- Systems: ui, uikit
- Files: uikit.js, ui.js, loadout.js
- What: the 21 panels that are filled over several statements now open and close with uiPanelOpen()/uiPanelClose(), and the settings row uses uiPanel; no hand-written .sec markup is left in ui.js or loadout.js. Screens pixel-identical; the same 14 tests pass.
- Save data: none
- Hooks: none
- Risk: low.

### Folded from local-design-system: 2026-10-20 UI builders from the design system
- Systems: ui, uikit
- Files: uikit.js (new), ui.js, loadout.js, pinhide.js, samples10.js, inspect.js, v10.js, sandbox.js, index.html, ARCHITECTURE.md
- What: menus now build their HTML through one builder per design-system component (uikit.js, 15 builders, 203 call sites). Output is the same elements and classes as before: all 35 screen captures (portrait and landscape) are pixel-identical and quick, settabs, setshot, loottest, loadouttest, inspecttest, porttest, logtest, stpanel, glosstest, youshot2, overtest, finaletest and sbtest pass. Not converted at the time: 21 split panels (since done, above), 5 lists and 1 chip row with classes glued to expressions, and the HUD, loot cards and boss card (built as DOM or static HTML in index.html).
- Save data: none
- Hooks: none (index.html: uikit.js after settings.js)
- Risk: low; markup is unchanged. Anything new that builds a menu should use the builders.

### Folded from local-design-system: 2026-10-20 Design-token layer in style.css
- Systems: ui
- Files: style.css, look10.js (comment), data.js (comment)
- What: one :root block of tokens named like the Figma variables (colour, space, radius, surfaces); the three old :root blocks folded in, older names (--xw, --dim, --r, --line ...) kept as aliases; 308 declarations that a later rule with the same selector always overrides removed; 121 hex colours swapped for tokens. Screens pixel-identical. 229 one-off colours left as they are (no matching token).
- Save data: none
- Hooks: none
- Risk: low.

### Folded from claude-ordered-nanobot: 2026-10-20 Ordered Online drawn as a synthetic nanobot (not shipped)
- Systems: samplelooks, orderedlook (new)
- Files: orderedlook.js (new), samplelooks.js (old Ordered Online head and tail removed, header comment), index.html, ARCHITECTURE.md
- What: Ordered Online's body (in a run, on the sample card, in the Field Guide and pause portrait) is a machine (SAMPLES.md 5, decision 43): a segmented glossy silver shell with a seam down the head, panel gaps, a lens and a cyan status light on a jointed servo midpiece (amber after a glitch, red when hit); a tail of rigid links whose wave moves in exact steps (4 poses a beat, about 11 steps a second); a two-frame twitch every 2.5 to 6 s; on a corner the head leads past its heading, holds 0.12 s, then corrects in one step. Its Mucus trail gets a glossy gel band and a specular line on top. All cosmetic: hitbox, swim physics, kit, passive, Feat and trail rules unchanged.
- Save data: none.
- Hooks: none in shared files; replaces SL_HEAD/SL_TAIL.ordered, adds SL_UNDER.ordered, sets SL.ordered.beat 0.45 (visual beat only), wraps f10Draw.
- Risk: none to balance. The trail sheen is drawn in v10Draw (over zones, under you); a branch that edits SL_HEAD.ordered in samplelooks.js would be overridden by orderedlook.js.

## Unreleased: every weapon can take Switched at Birth


### Folded from claude/lucid-allen-vr25lv: 2026-10-20 Pick feedback on take-more-than-one card screens
- Systems: ui (card screens), rewards
- Files: pickfeel.js (new), ui.js, index.html, style.css
- What: Screens where you take two cards show an "n/2" chip. The card you took stays visible with a tick and a held glow; the remaining cards pulse an outline. Cards also squash on press.
- Save data: none
- Hooks: ui.js openLoot -> pfInit; ui.js pickLoot -> pfTaken
- Risk: the old 30% dim on the taken card is gone. Chip copy is Claude-drafted; replace if you prefer your own.

### Folded from claude-adoring-edison-w5x7ky: 2026-10-20 Fill v9 TODO_COPY placeholders
- Systems: feats, upgrades, mutations
- Files: feats9.js, v9back.js
- What: 33 placeholder strings replaced with written copy (6 Feat descriptions, 12 level 5 forks, Headstrong, Character Building, Mood Swings).  Also: Van de Graaff and Wandering Womb text now match their code; Character Building no longer grants armour (armour is retired in v10).
- Save data: none
- Hooks: none
- Risk: Character Building loses its armour clause (tiny balance shift).

### Folded from ccr-b4817013-jgeigi: 2026-10-20 Switched versions for every status-bound weapon
- Systems: fitcheck, upgrades, tests
- Files: wup2.js, wup3.js, wup4.js, fitcheck.js, tests/switchtest.js (new), tests/wup2test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick every weapon. The seven whose branches run on their own status switch only to one type with its own version: Acid Spit to Mucus (Snowball), Nocturnal Emission to Alien (Ectoplasm), Hot Mess to Blood (Crime Scene), Rent Free to Force (Poltergeist), Unwanted Contact to Fire (Wildfire), plus The Runs (Static) and Little Prick (Alien) from earlier. Mass Hysteria and Possession Fee are no longer hidden after a switch (they never needed Alien); Nappy Mines hides only Flare Up.
- Save data: none.
- Hooks: none (w2Snot/w2Ecto in wup2.js, w3Scene/w3Polter in w3BarFrac, ucWild in wup4.js ucChain; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: card and callout text for the new versions are drafts (user keeps them for now and edits in place: fitcheck.js FIT_TEXT, floatText calls in wup2/3/4/6.js); untested for balance.

## Unreleased (merged to main without a build or test run): 2026-10-20 v9 Feats, upgrades and mutations back in v10
- Systems: feats9 (new), v9back (new), feats10, draft, mutation drops
- Files: feats9.js (new), v9back.js (new), feats10.js, draft.js, mutdrop.js, v10.js, index.html, tests/featstest.js, tests/v9backtest.js (new), tests/run.sh
- What: (card text for the six new Feats' descriptions, their level 5 forks, Headstrong, Character Building and Mood Swings is TODO_COPY, waiting on the user's copy.) The six v9 Feats FEATS.md picked but never built (Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb, Ear Candling) are in, with level 3 and 5 forks, and Hagfish and Running With Scissors join the starting pool (it was waiting on an unlock system that doesn't exist). 15 v9 upgrades that change how you play (Last Word, Tunnel Vision, Overachiever, Pincer Movement, Hurry Up, Stubborn Streak, Big Boned, Muscle Memory, Big Lungs, Cardio, Tactical Nap, Spoilers, Separation Anxiety, Headstrong, Snooze Button) are draft cards again, and 29 v9 mutations are back in the elite mutation drops.
- Save data: none (G.passives, G.mut and META.muts as in v9).
- Hooks: v10.js v10Tick -> f9Tick, v10Draw -> f9Draw; draft.js grp 'up' (DRAFT.groupW.up 0.6); mutdrop.js mdIsMut also takes 'g_' ids.
- Risk: more power in a run (bot sim: death wave 9.7 -> 11.8, 0 wins both); fewer v10 mutations per elite drop (29 more in the pool); the Feat starting pool is 23, so each Feat turns up less often.

## v10.46 (versionCode 325): merge of `ccr-d549bf1a-tq7f9u` into `main` (narrator voices, Immersive whispers)

### Inner voice says "we"; shape-shifting cloud; Immersive whispers (v10.44)
- Systems: voice (voice.js, voice10, new whisper.js), narrator copy (data.js LONGING_LINES, show.js), ui, docs (VOICE_GUIDE, voice_and_tone)
- Files: whisper.js (new), voice.js, data.js, show.js, ui.js, inspect.js, index.html, style.css, tests/wstest.js (new), tests/veilshot.js, ARCHITECTURE.md
- What: The inner voice now speaks as "we" (it and the sperm are a team): every consciousness line, sighting, status hint and campaign longing line is rewritten, and the canon in VOICE_GUIDE says so. Its black cloud shape-shifts (core and colour fringe morph out of step). In Immersive, Scientist and inner-voice lines no longer pop up: a small indicator appears (a black cosmic blob, or a LOG chip for the Scientist); tapping it reveals the line and runs the slide at 10% until the line is tapped or times out. Unread lines fade after 30 s.
- Save data: none.
- Hooks: ui.js sysmsg queue -> wsTake; inspect.js inspectMul -> wsMul; index.html whisper.js after voice10.js.
- Risk: In Immersive, a player who never taps misses the lines (by design). The 10% slow-down multiplies the game speed while a line is open; autorun keeps playing behind it.

### Narrator voices: one story, two looks (v10.43)
- Systems: narrator (voice10, show), ui, copy (data.js achievements, card quips, sponsors), sequences (seqreveal)
- Files: voice10.js, show.js, ui.js, data.js, seqreveal.js, style.css, tests/veilshot.js (new)
- What: Narrator messages now carry who is speaking. The Scientist shows as the plain lab panel with a "LAB LOG · 1B" header; the inner voice is a pitch-black cloud with a soft, breathing cosmic colour fringe and italic text. Both voices now show in Immersive mode (which hid every narrator line by default). Copy that broke "he works alone" is rewritten: Funding is now Data (no £), research grants and sponsors are things found around the empty lab, Peak viewers is Peak data, achievements, card quips, reward lines and three sample stories lose the doctor, staff, lawyers, Committee and announcer "!".
- Save data: none (achievement ids viewers1m and sponsor keep their keys).
- Hooks: ui.js sysmsg display sets box.dataset.who; show.js sysMsg gains optional 5th arg `who`; voice10.js vxPush adds `who` to the queued message.
- Risk: Immersive now shows narrator lines over the slide (about one every 20 s). SPONSORS now holds place names, so anything that prints a sponsor reads "Found in {place}".

## v10.45 (versionCode 324)
- Systems: reward director, race15, reward cards, build panel, rivals, mutation drops, draft, fitcheck, upgrades
- Files: see the folded entries below.
- What: merge of `claude/game-rewards-system-stm097` into `main`. The Reward Director paces reward screens (30 s gap that shortens with a backlog, take-two level drafts, egg cut-off); mutation carriers secure the mutation on the kill and a full Genome offers swaps; the race to the egg runs 15 minutes (egg at 15:00 or Lv 60 early, rivals only go for it from 15:00); Immersive rival track with standings; one card language (type colour, icon, fit line) and a v10 Build panel. Also ships main's unreleased fit check and Static version of The Runs.
- Save data: none.
- Hooks: see the folded entries.
- Risk: race balance (race only: difficulty clock at real time, XP x1.8); player-facing text from this branch was written before the copy rule and awaits the user's copy.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 Rivals crack the egg at 15:00 (v10.44)
- Systems: race15, rivals
- Files: race15.js, rivals.js, tests/eggtest.js, tests/rewarduitest.js
- What: In a race, rivals that reach Lv 60 keep racing but only head for the egg from 15:00 (raceRivalEgg), and they level a little slower (RIVAL.finish 860 in races). Invulnerable sim: first rival at the egg at 15:04, through the membrane at 18:04.
- Save data: none.
- Hooks: rivals.js rival egg mode -> raceRivalEgg.
- Risk: the egg can no longer be opened early by a rival; eggtest now starts its break-in at 15:00.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 15-minute race, rival track, card language, Build panel (v10.43)
- Systems: race15 (new), reward cards (new), build panel (new), reward director, difficulty, rivals, ui, tutorial
- Files: race15.js (new), rewardui.js (new), buildpanel.js (new), game.js, render.js, rivals.js, inspect.js, meta.js, ui.js, director.js, tutorial.js, style.css, index.html, tests/rewarduitest.js (new), tests/sim/race.js
- What: The race to the egg now runs 15 minutes: the egg opens at 15:00, or sooner at Lv 60 or sperm count 1, and getting there early pays 20 DNA per minute to spare on a win. The top bar counts down to the egg. Immersive mode shows a thin rival track (dots by level, yours ringed, the egg at the end, a clock tick); tapping it shows the standings while the slide runs at 10%. Every reward card now has a type colour, an icon and a fit line (Feat upgrades show their numbers before and after); a "N WAITING" badge shows held rewards and "SAVED" toasts say a reward is held; choosing a card rings you in its colour. The pause BUILD tab is a v10 Build panel.
- Save data: none.
- Hooks: game.js eggBreakable -> raceEggOpen, PT and spawn rate -> racePace, gainXp -> raceXp, levelsAhead -> raceCurveT, canvas tap -> raceTap; render.js drawHud -> raceHud, rwHud, drawTopBar -> raceClock, behind-pace chip -> raceCurveT, Immersive chip row -> raceTrackH; rivals.js updateShowdown -> raceTick; inspect.js inspectMul -> raceMul; meta.js runDna -> raceDnaBonus; ui.js renderLootCards -> rwCls, rwIcoHtml, rwFitHtml, pickLoot -> rwPicked, renderPause -> bpHtml; director.js dirTick -> rwSaved.
- Risk: race balance moves a lot (race only: difficulty clock 1.5x -> 1.0x, XP x1.8, RIVAL.finish and COUNT.time are getters that differ in races). Race sim (bot, god mode): Lv 17/30/35 at 3/6/9 min, rivals break in about 12 min (was about 7). Petri Dish, Endless and levels unchanged.

### Folded from claude/game-rewards-system-stm097: 2026-10-20 Reward Director: one gate for every reward screen (v10.42)
- Systems: reward director (new), draft, mutation drops, mutations, ui, run log, campaign (Level 0 line)
- Files: director.js (new), draft.js, mutdrop.js, mutations.js, ui.js, v10.js, meta.js, school.js, index.html, tests/drafttest.js, tests/mutdroptest.js, tests/sim/race.js
- What: Reward screens outside wave modes now open at most one per 30 s of combat, highest priority first (boss, weapon slot, branch, fork, mutation, DNA strand, level draft), and a waiting reward climbs the order the longer it waits. Two waiting level drafts merge into one screen of four cards where you take two. Once the egg's membrane is awake no screen opens; waiting rewards apply themselves. Killing a mutation carrier now secures the mutation (the strand is only the show, no 20 s pickup), and a full Genome offers swaps instead of skipping the screen.
- Save data: none (run log record gains scr, scrBy, menuT, merged, autoRw, mutDrops).
- Hooks: v10.js v10Tick -> dirTick; draft.js draftBox -> dirGate, draftLoot -> dirN; ui.js openLoot -> dirTitle, pickLoot -> dirTwo and dirPicked; meta.js run record fields.
- Risk: fewer, later screens in the race to the egg slow early power (win rate); draftBox no longer sets G.draftT or req.v10ok (DRAFT.budget is now unused); swapped-out mutations lose their effect only if it is read live (one-off ones are never offered for swap).

### Folded from ccr-b4817013-jgeigi: Little Prick has an Alien version (voodoo pins)
- Systems: fitcheck, upgrades, tests
- Files: wup2.js, fitcheck.js, tests/wup2test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick Little Prick, but only to Alien. Bleed stacks become pale pins; a full pincushion (6) is Possessed; Open Wound's ghost outline makes crossers flinch to a stop; Sutures yanks crossers back; Reef Knot Possesses the knot (RAGDOLL); Terminal Clause's spirit hits the nearest enemy for x3; Exsanguinate becomes Voodoo Doll (Possessed enemies burst in pins, no double healing). Needlework and Final Prick add a pin per hit in Alien, standing in for Blood's own Bleed. Card text changes to match.
- Save data: none.
- Hooks: none (wup2.js w2Voodoo, w2Possess, w2PinBase; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: Alien Possesses enemies by itself, so Final Prick finishes fewer enemies; no balance sim run.

### Folded from main (unreleased): The Runs has a Static version
- Systems: fitcheck, upgrades, tests
- Files: wup6.js, fitcheck.js, tests/wup6test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick The Runs, but only to Static. Its Burn and Ignite cards become visible zaps: a bolt from the trail jolts (staggers) what crosses it, waves are running sparks, and closing a loop is CIRCUIT CLOSED (the loop lights up, one bolt to everything inside). Card text changes to match.
- Save data: none.
- Hooks: none (wup6.js rnBar replaces its own bar6 'fire' calls; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: Static Runs staggers a lot on Afterburner (every enemy per 3 s); untested for balance.

### Folded from main (unreleased): upgrade fit check
- Systems: fitcheck (new), upgrades, combos, tests
- Files: fitcheck.js (new), index.html, tests/fittest.js (new), tests/wup2test.js, wup3test.js, wup4test.js, tests/tools/guide.js, GAME_GUIDE.md, ARCHITECTURE.md
- What: upgrades that break a weapon's branch (attack-type changes that strand masteries or modifiers, masteries that contradict the promise, modifiers that fight or duplicate a branch) are no longer offered to that weapon, and Switched at Birth never picks a weapon whose branch runs on its own status. New guide section "Upgrades that do not fit".
- Save data: none.
- Hooks: none (wraps wupForkCards, modCardOk, modDraftCands, sabCard from its own file).
- Risk: Red Flagship never offers Packet Loss and Hot Mess never offers Fire Drill; those promises now show two Lv 6 cards. Card tests set FIT_OFF.

## v10.42 (versionCode 321)
- Systems: school, tests
- Files: see the folded entries below.
- What: Level 0 no longer crashes at lesson 11 under v10 (autorun follows the mutation strand); v10test matches the four Experiments and the weapon draft's combo partner; stray test screenshots are git-ignored.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-20 v10test allows the weapon draft's combo partner
- Systems: tests
- Files: tests/v10test.js
- What: the weapon slot draft may swap one card for a combo partner of a weapon you hold, of any attack type (combos10.js, by design). v10test now allows that one card (marked c10) and still checks every other card brings a new attack type. It was failing about 2 runs in 3.
- Save data: none.
- Hooks: none.
- Risk: none (test only).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-20 Level 0 no longer crashes at lesson 11 (v10.42)
- Systems: school, tests
- Files: school.js, tests/v10test.js, tests/.gitignore
- What: autorun in Level 0's lesson 11 (Junk in the Trunk) read the v9 junk DNA list, which doesn't exist under v10, and crashed the game on entering the room; it now steers to the mutation strand and its carrier (mutdrop.js). Level 0 plays through all ten lessons to the egg again (schooltest passes). v10test expects the four Experiments the sample screen now offers. Screenshots from tests run outside run.sh no longer show up as untracked files.
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.41 (versionCode 320)
- Systems: combos, weapons, draft, autorun, fight
- Files: see the folded entry below.
- What: merge of `ccr-d33b1fde-g92ob2` into `main`: 30 branch combos (ten weapon pairs, three each, gated on a Lv 3 promise per weapon), combo partners in the weapon draft, promise cards that name their combo.
- Save data: none.
- Hooks: fight.js fightHit -> src.noRx; combos10.js wraps globals and loads after ui.js.
- Risk: balance. Bot Races: 0 of 60 won with the combos (24 of 30 fused naturally), same as without.

### Folded from ccr-d33b1fde-g92ob2: 2026-10-19 Branch combos for the 24 weapons (v10.41)
- Systems: combos, weapons, draft, autorun, fight
- Files: combos10.js (new), fight.js, index.html, tests/combo10test.js (new), tests/run.sh, tests/sim/race.js
- What: 30 new Weapon Combos across ten weapon pairs (three each). A combo needs both weapons at Lv 5 and a particular Lv 3 promise on each; each pair's three combos use every promise once, so whatever the first weapon took, one promise on the second fuses with it. Same attack types can fuse. The weapon draft now swaps one card for a combo partner of a weapon you hold (any attack type, so the old Storm in a Teacup and Worm Farm can happen at last); Lv 3 promise cards name the combo they complete; autorun takes a card that completes a combo. Combo hits go through normal hit resolution and never set off an unstable reaction.
- Save data: none (META.combos records fused ids as before).
- Hooks: fight.js fightHit -> `src.noRx` skips fightReact. Everything else wraps globals from combos10.js (fightHit, killEnemy, projHit, comboFire, comboTick, wupDmgMul, bubblePop, toothTaken, availableCombos, wupForkCards, v10Loot, UI.autoTick); it loads after ui.js.
- Risk: balance (more combos fuse, and the weapon draft and autorun now favour partners); any file that later wraps the same globals must load before combos10.js or keep calling through.

## v10.40 (versionCode 319)
- Systems: asdemo (new), mfdemo (new), aldemo (new), screens
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: the last 14 weapons get real previews, tabbed tier screens and a scene per branch card, so all 24 weapons and all 360 branch cards are done.
- Save data: none.
- Hooks: none.
- Risk: preview only, no combat change.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 The last 14 weapons: real previews, tabbed branch screens, a scene per branch (v10.40)
- Systems: asdemo (new), mfdemo (new), aldemo (new), screens
- Files: asdemo.js (new), mfdemo.js (new), aldemo.js (new), index.html
- What: every remaining weapon gets the Standard Issue treatment, so all 24 now have a preview that shows the real weapon, their tier screens open in the Weapon Draft tabs, and every one of the 360 branch cards plays its own scene. New here: Acid Spit, Red Flagship, Soulmate Signal, Unwanted Contact, Nocturnal Emission, Ewww Gross, Blowing Bubbles, Hot Mess, Nappy Mines, The Runs, Rent Free, Peekaboo, Eggs and Chest Burster (210 cards). Typed previews share one status look (Corrosion, Burn and Alien bars; Charged, Snared, Ignited, Possessed, Feared).
- Save data: none.
- Hooks: none (PV_OWN entries).
- Risk: preview only, no combat change. Every 'wup' box with a single weapon ready now opens as that weapon's tabbed fork; the card version of the branch screen is no longer used for any of the 24.

## v10.39 (versionCode 318)
- Systems: samples, render, defences, mutations, ui
- Files: see the folded entries below.
- What: merge of `claude/alien-sample-design-xdoks8` into `main`: every v10 sample has its own body in three families (natural Baseline, Alpha, Beta; engineered Private Schooled, Ordered Online; anomalies Redtail, Prawn Again and the jellyfish-like Not of This World), live pictures on the sample cards and a Field Guide SAMPLES tab, defences and upgrades worn on the body (Shell armour bands, Squishy jelly, Thorns, Evasion, stat reshaping, a mark per body and trade-off mutation), and tails that join the neck cleanly. Branch builds were v10.29 to v10.33.
- Save data: none.
- Hooks: render.js drawShip -> sampleLook; seqsel.js drawSeqMods -> sampleLookOn; samples10.js s10Samples -> slPicStart; ui.js codexHtml -> slCodex (SAMPLES chip); portraits.js portraitsStart -> slPicStart; pdef.js pdefDraw skips Shell rings for v10 samples.
- Risk: visual only; hitbox and swim physics unchanged.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Tails attach cleanly (v10.33, with the upgrade marks and the bold-hypatia merge)
- Systems: samples
- Files: samplelooks.js, alienyou.js
- What: the tail now leaves from the neck as drawn: its root follows the head's rock, squash and stretch (Squishy, the speed stretch, damage bulk) and Can't Sit Still's jitter, and leaves along the midpiece. Natural tails' root width matches the midpiece. The alien's tentacles stay on the rim of the bell when it squashes.
- Save data: none.
- Hooks: none.
- Risk: none (the swim physics reads the tail's shape; its root moves by a unit or two at most).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Upgrades show on the body
- Systems: samples, mutations
- Files: samplelooks.js, tests/upbodyshot.js (new)
- What: non-defence upgrades change the v10 bodies. Stats (from any source): damage bulks the head, swim speed stretches it and lengthens the tail, attack rate quickens the tail beat, pickup range adds a faint receptor field. Each body and trade-off mutation has a mark (Slipstream wake, Extra Padding pads, Sticky Fingers hairs, Heartbeat heart, Hard to Hold drips, Spare Parts sac, Overexcited lines, Personal Space ripple, Big Brain brain, Quantity Over Quality buds, Can't Sit Still jitter, All at Once barb, Hungry Hungry belly, No Time for Being Careful stripes, Growing Pains stretch marks); a damage type mutation dyes the neck. The alien gets them too.
- Save data: none (G.slBase, run only: the stats at the run's start).
- Hooks: none new (inside samplelooks.js slDefState/slDefUnder/slDefOver, already hooked).
- Risk: visual only.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Defences on the body, samples in the Field Guide (v10.32)
- Systems: samples, defences, ui
- Files: samplelooks.js, alienyou.js, pdef.js, ui.js, portraits.js, tests/defbodyshot.js (new), tests/codexsamples.js (new)
- What: your defence cards now change your body. Shell is shaded brown armour bands wrapping the head front first (one band per layer, a collar at 4; cracks and chips as it wears; a front cap only on the alien so its core shows) instead of rings. Squishy makes the head jelly: its squash and stretch is about three times bigger and overshoots, and hits squash it flat. Thorns are spikes raked back along the head; Evasion leaves after-images. The Field Guide has a SAMPLES tab: each sample with its live picture, family, origin, passive and lab note.
- Save data: none.
- Hooks: ui.js codexHtml -> slCodex (and a SAMPLES chip in the tab list); portraits.js portraitsStart -> slPicStart; pdef.js pdefDraw skips Shell rings when sampleLookOn; alienyou.js alienDraw -> slDefState/slDefUnder/slDefOver.
- Risk: visual only. Shell no longer draws as rings round v10 samples (only on the body).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Every sample gets its own body (v10.31)
- Systems: samples, render
- Files: samplelooks.js (new), alienyou.js, render.js, seqsel.js, samples10.js, index.html, tests/lineupshot.js (new), tests/alienyoushot.js
- What: three visual families. Natural: Baseline (textbook), Alpha (long, pointed, big striped midpiece, longer tail), Beta (small, bent neck, droplet, coiled tail tip, plaster). Engineered: Private Schooled (lacquered navy, gold trim, crest, school-tie midpiece, braided tail), Ordered Online (moulded plastic box with seam, barcode, crooked sticker, misaligned cap, ribbed hose, zip-tie tail, frost). Anomalies: Redtail (lumpy wobbling red head, twitchy hairs, frayed tail, embers), Prawn Again (white-gold, halo, wings, light rays, an echo). Every sample card has a live picture of its body.
- Save data: none.
- Hooks: render.js drawShip -> sampleLook (replaces alienYou); seqsel.js drawSeqMods -> sampleLookOn (replaces alienYouOn); samples10.js s10Samples -> slPicStart (replaces alienPicStart).
- Risk: visual only; hitbox and swim physics unchanged. Body-look upgrades (cilia, barb, plating) and sequence marks don't show on v10 samples.

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Not of This World's card shows the creature (v10.30)
- Systems: samples
- Files: alienyou.js, samples10.js, tests/alienyoushot.js
- What: its card on the sample screen has a live picture of it, hanging and pulsing, cycling through its moods and its Fire, Alien and Static core colours. Tentacles now start laid out straight instead of in a knot. alienYou's drawing is split into alienDraw (no G needed).
- Save data: none.
- Hooks: samples10.js s10Samples -> alienPicStart (and the card list adds a canvas to the alien card).
- Risk: none (title screen only; the loop stops when the card leaves the page).

### Folded from claude/alien-sample-design-xdoks8: 2026-10-19 Not of This World gets its own body (v10.29)
- Systems: samples, render
- Files: alienyou.js (new), render.js, seqsel.js, index.html, tests/alienyoushot.js (new)
- What: the Not of This World sample is no longer drawn as a sperm. It is a translucent indigo bell with a split, glowing core and seven tentacles with glowing tips, swimming by jet pulses. Its mood shows (idle, curious, alert, agitated, hurt), and the core and tips take the colour of the current Adaptive Biology type (Fire, Alien, Static). Pause portrait too.
- Save data: none.
- Hooks: render.js drawShip -> alienYou; seqsel.js drawSeqMods -> alienYouOn.
- Risk: visual only; hitbox and swim physics unchanged (its tail never runs stepTail, so p.ext/p.behind stay at their defaults). Body-look upgrades (cilia, barb, armour plating) don't show on it.

## v10.38 (versionCode 317)
- Systems: scdemo (new), fbdemo (new), bldemo, screens
- Files: see the folded entries below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Sister Cousin and the rest of the Force and Blood weapons (Maximum Gains, Nervous Wreck, Family Ties, Skill Issue, There Is No Spoon, One of These Days) get real previews, tabbed tier screens and a scene per branch card. With Standard Issue, Panic Button and Little Prick, every Force and Blood weapon is done (10 of 24).
- Save data: none.
- Hooks: none.
- Risk: preview only, no combat change.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 The rest of the Force and Blood weapons: real previews, tabbed branch screens, a scene per branch (v10.38)
- Systems: fbdemo (new), bldemo, screens
- Files: fbdemo.js (new), bldemo.js, index.html
- What: Maximum Gains, Nervous Wreck, Family Ties, Skill Issue, There Is No Spoon and One of These Days get the Standard Issue treatment: each preview shows the real weapon (pellet fan, clamping jaws, merging vortices, bowling lard, eaten and returned shots, countdown marks with a ledger), their tier screens open in the Weapon Draft tabs, and each of their 90 branch cards plays its own scene. Spitter cells now show their purple rim (it never drew on Panic Button's Grudge Match).
- Save data: none.
- Hooks: none (PV_OWN entries).
- Risk: preview only, no combat change. 'wup' boxes with only one of these weapons ready now open as that weapon's fork.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Sister Cousin: real preview, tabbed branch screen, a scene per branch (branch build v10.37, merged as v10.38)
- Systems: scdemo (new), screens
- Files: scdemo.js (new), index.html
- What: Sister Cousin (old name Seeker Siblings) gets the Standard Issue treatment. Its preview fires two wiggling homing siblings per volley (6 volleys, 2 s reload) that add Bleed and split in two on a kill, with an in-flight counter (12 at most) under Spermy. Its tier screens open in the Weapon Draft tabs, and each of its 15 branch cards plays its own scene (extra siblings, runts, hiding and ambushes, the weakest-first favourite, squabbles, pack dives, Pile-On, Dinner Time, Baby Boom, Family Reunion, Only Child).
- Save data: none.
- Hooks: none (a PV_OWN entry).
- Risk: preview only, no combat change.

## v10.37 (versionCode 316)
- Systems: mutation drops, draft, tests
- Files: see the folded entry below.
- What: merge of `claude/bold-hypatia-jadt4w` into `main`: an empty mutation screen can no longer stick a run (the box is dropped when no mutation fits), and the flaky perf18, eggtest and autoruntest are reliable.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Flaky tests fixed; empty mutation screen no longer sticks (v10.37)
- Systems: mutation drops, draft, tests
- Files: draft.js, tests/perf18.js, tests/eggtest.js, tests/autoruntest.js
- What: (eggtest also keeps its rival alive and alone: race rivals could kill it mid-gnaw.) A mutation box now opens only if a mutation can still be taken (draft.js draftBox); several strands queued while the Genome filled up used to open an empty mutation screen that stuck the run. Tests: perf18 goes through v10Box like the main loop and times 300 play frames (it could time none); eggtest's rival break-in runs unarmed (anything of yours hitting the rival stops it gnawing); autoruntest clears terrain properly (`G.terrain` is { list, grid }: 85 to 102 pieces were left in and pushed you off HOLD and ORBIT).
- Save data: none.
- Hooks: none.
- Risk: none.

## v10.36 (versionCode 314)
- Systems: samples screen, school (Level 0), mutation drops
- Files: see the folded entry below.
- What: merge of `claude/v9-v10-breaking-changes-1hjfdw` into `main`: The Petri Dish, Endless and Level 1 are back in the Experiment picker; Level 0 lesson 11 teaches the mutation strand.
- Save data: none.
- Hooks: none.
- Risk: see the folded entry.

### Folded from claude-v9-v10-breaking-changes-1hjfdw: 2026-10-19 Petri Dish, Endless and Level 1 back; Level 0 lesson 11 teaches mutation strands (v10.36)
- Systems: samples screen, school (Level 0), mutation drops
- Files: samples10.js, school.js
- What: the Experiment picker offers The Petri Dish, The Race, Endless and Level 1 again (flags S10_PETRI, S10_ENDLESS, S10_LEVELS). Level 0 lesson 11 is no longer a free pass under V10: an Antibody carries a mutation strand (mutdrop.js) that never sheds or decays in school; kill it, swim into the strand and pick a mutation to open the gate.
- Save data: none.
- Hooks: none (school.js reads mutdrop.js mdS, mdOk, MUTDROP and G.stats.mutDrops).
- Risk: Endless and Level 1 have not been played or simmed under v10 (untested by request); expect balance gaps or a crash in Level 1 arenas. schooltest not rerun.

## v10.35 (versionCode 313)
- Systems: bldemo (new), sidemo, screens
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Panic Button and Little Prick get real previews, tabbed tier screens and a scene per branch card; sidemo.js becomes the shared engine for weapon previews.
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Panic Button and Little Prick: real previews, tabbed branch screens, a scene per branch (v10.35)
- Systems: bldemo (new), sidemo, screens
- Files: bldemo.js (new), sidemo.js, index.html
- What: the other two baseline weapons get the Standard Issue treatment. Panic Button's preview marks the densest cluster in reach, fills a warning for 0.45 s and blasts it (3 to a magazine); Little Prick fires needles that stack Bleed (red pips, drips, tick numbers) and leave blood pools. Their tier screens open in the Weapon Draft tabs, and each of their 30 branch cards plays its own scene. sidemo.js is now a shared engine: any PV_OWN entry with a flags table gets the tabbed screen.
- Save data: none.
- Hooks: none new (PV_OWN entries; sidemo.js sivDraw gained under/over/cell/me layers and sivDamage a kill hook).
- Risk: preview only, no combat change. 'wup' boxes with only one of these three weapons ready now open as that weapon's fork.

## v10.34 (versionCode 312)
- Systems: box looks (new), mutation drops, modifier cards, draft, ui
- Files: see the folded entry below.
- What: merge of `claude/bold-hypatia-jadt4w` into `main`: the mutation, weapon modification and Feat screens each look like what they change (your sperm and stats on the mutation screen, your weapons and modifier slots on the modifier screen, violet SPECIAL ABILITY Feat cards).
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Mutation, modifier and Feat screens look like what they change (v10.34)
- Systems: box looks (new), mutation drops, modifier cards, draft, ui
- Files: boxlook.js (new), mutdrop.js, modcards.js, draft.js, ui.js, index.html, style.css, tests/mutdroptest.js
- What: an elite's strand now opens a MUTATION screen (pick 1 of 3) with your sperm drawn at the top and its stats (health, speed, damage, attack speed, pickup range, Genome slots) and what it already carries. DNA strands open a WEAPON MODIFICATION screen of modifier cards only, with your weapons and their three modifier slots at the top; each card names its weapon. Feat cards in level-ups glow violet and read SPECIAL ABILITY. Card frames differ: rounded flesh for mutations, square steel for modifiers.
- Save data: none.
- Hooks: ui.js openLoot -> boxLook, renderLootCards -> boxCardCls, tick -> boxTick; draft.js draftLoot -> mdCards (kind 'mutation') and modBoxCards (chest, boss); draftBox opens 'mutation' at once.
- Risk: DNA strands no longer deal weapon upgrades, Feats or defences when a modifier fits (they fall back to the old draft when none does).

## v10.33 (versionCode 311)
- Systems: sidemo (new), screens, weapons24, ui
- Files: see the folded entry below.
- What: merge of `ccr-867eefdf-uxgom1` into `main`: Standard Issue's preview shows the real weapon (magazine, reload, reach), its tier screens use the Weapon Draft tabs, and each branch card plays its own scene.
- Save data: none.
- Hooks: see the folded entry.
- Risk: see the folded entry.

### Folded from ccr-867eefdf-uxgom1: 2026-10-19 Standard Issue: real preview, tabbed branch screen, a scene per branch (v10.33)
- Systems: sidemo (new), screens, weapons24, ui
- Files: sidemo.js (new), preview.js, ui.js, index.html, tests/sivtest.js (new), tests/run.sh
- What: Standard Issue's animated preview now shows the real weapon: one heavy shot at the nearest cell inside its 440 reach (dashed arc), 0.45 s apart, an 8-round magazine under Spermy and a 1.2 s reload ring, stopping on the first hit, with real damage numbers. Its tier screens (promise, branch card, mastery) open in the Weapon Draft layout with a tab per choice instead of cards, and each tab plays its own scene (bounces and zigzags, pierce lines, marks and BONKs, nuts, lanes, pops, the 10-shot replay ...), built on the choices already taken. The badge shows the tier, not the internal level.
- Save data: none.
- Hooks: preview.js makePreview/stepPreview/drawPreview -> PV_OWN (new registry); ui.js openLoot -> sivDraftKind, openDraft -> sivDraftHead; ui.js renderDraft badge reads wTier for 'wupfork'.
- Risk: a 'wup' box with only Standard Issue ready is turned into its 'wupfork' in openLoot (the other 23 still use cards). Preview only: no combat change.

## v10.32 (versionCode 310)
- Systems: attack looks (new), render, weapons, settings, tests
- Files: see the folded entries below.
- What: merge of `ccr-fc17e397-fp3yvs` into `main`: every attack wears its damage type (typelook.js: Static arcs, Acid drips, Mucus strings, Blood spatter, Alien wisps, Fire flames; a different beam per type), and Lab view is a Settings option again.
- Save data: SET.lab10 added.
- Hooks: see the folded entries.
- Risk: see the folded entries.

### Folded from ccr-fc17e397-fp3yvs: 2026-10-19 Lab view is an option again (v10.32)
- Systems: settings, render, tests
- Files: settings.js, look10.js, ui.js, tests/looktest.js, tests/tlshot.js
- What: the LAB/ARCADE View row is back in Settings > Screen under v10. Arcade stays the default; Lab greys the slide as before (labGrey, eyepiece). Older saves that still had Lab from v9 are moved to Arcade once, then the choice sticks.
- Save data: SET.lab10 added (the one-time Arcade reset is done; Reset settings keeps it at 1).
- Hooks: none.
- Risk: v10 colour-coded things (defence rings, type colours) are grey in Lab view, as all Lab view is; tlshot now clears terrain (a random rock could block every shot).

### Folded from ccr-fc17e397-fp3yvs: 2026-10-19 Attack looks by damage type (v10.31)
- Systems: attack looks (new), render, weapons
- Files: typelook.js (new), v10.js, render.js, toys.js, index.html, tests/tlshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: every attack now wears its damage type, whatever the weapon: Static crackles and snaps short arcs onto nearby enemies (feelers into the water when none is near), Acid drips pink goo that splats and fades, Mucus strings out and sags, Blood spatters, Alien leaves after-images and wisps, Fire sheds tongues and embers. Beams are drawn per type: Static a continuous jagged bolt with forks, Acid a sagging dribbling stream, Mucus a braided rope of snot with beads, Blood an arterial spurt in pulses, Alien a twisting helix, Fire a flamethrower plume. Soulmate Signal's twin beam is a living bolt. Bursts, swings, lashes and pools get the same per-type flourishes. Cosmetic only (no damage).
- Save data: none. Run state `G.tlook` (particles and arcs; `G.tl` is the run log's timeline).
- Hooks: v10.js v10Tick -> tlTick, v10Draw beam loop -> tlBeam; render.js after your shot loop -> tlShots, after drawTypeFx -> tlDraw; toys.js twin beam -> tlSeg.
- Risk: frame time with many typed shots (particles capped at 280, arcs at 40, shots decorated at 60 a frame; perf18 passes). Bursts are spotted by ring colour, so any ring in a type colour gets that type's flourish.

## v9.28 to v10.30 (folded late, 19 Oct 2026)
- What: session fragments from the merges between v9.27 and v10.30 that were left in `changes/` unfolded. Folded here as they were written, newest branch first; one heading per entry.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Modifiers in loot boxes; mutations dropped by elites (v10.30)
- Systems: mutation drops (new), modifier cards, draft
- Files: mutdrop.js (new), modcards.js, draft.js, game.js, v10.js, index.html, tests/mutdroptest.js (new), tests/modcardtest.js, tests/run.sh
- What: modifier cards now come only in DNA strands (chest and boss boxes), and every strand deals one when one fits; level-ups no longer offer them. Mutation cards (body, weapon, damage-type, trade-off, rare) left the draft: 60% of elites carry one, wearing the junk DNA helix with a beacon and countdown (40 s); killing it drops a strand labelled with the mutation, which you swim into to take. Catalysts, Concentrations and defences stay in the draft.
- Save data: none.
- Hooks: game.js killEnemy -> mdKill; v10.js v10Tick -> mdTick, v10Draw -> mdDraw; draft.js draftCards gains a kind argument.
- Risk: mutation supply now depends on elite numbers; level-ups are left with weapons, Feats, Switched at Birth, defences and Catalysts.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 All 24 weapons live again (v10.29)
- Systems: weapons, samples
- Files: weapons24.js, NOTES.md
- What: Family Ties, Sister Cousin and Eggs are back in drafts, starters and the Field Guide (`W24_HOLD` emptied; their wup tests pass 3 of 3). Not of This World, Redtail and Prawn Again have three starters again.
- Save data: none.
- Hooks: none.
- Risk: none beyond v10.27's card changes (Clutch, Warm Glow, Dinner Time, Baby Boom).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Family Ties, Sister Cousin and Eggs on hold (v10.28)
- Systems: weapons, samples
- Files: weapons24.js, sigweap.js, w24look.js, tests/weapons24test.js, tests/samplestest.js, NOTES.md
- What: the three weapons are no longer offered, never start a run and are hidden from the Field Guide (`W24_HOLD`, `w24Live`). Not of This World, Redtail and Prawn Again start with two starters. Code and upgrade cards are kept for their return.
- Save data: none.
- Hooks: sigweap.js v10Pool -> w24Live; w24look.js wl_wids -> w24Live.
- Risk: three samples have one starter fewer; the pool is 21 weapons.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Fix Sister Cousin, Eggs and Family Ties after levels stopped speeding up firing (v10.27)
- Systems: weapons (the 24's upgrade branches)
- Files: wup5.js, wup6.js, tests/wup3test.js, tests/wup5test.js, tests/wup6test.js
- What: since v10.23 (levels add damage only) these broke or got unreliable. Sister Cousin: Baby Boom's 24-in-flight cap now holds for volleys too (25 flew), and Dinner Time siblings home in on a new enemy after each kill (they flew straight, so 3 kills was luck). Eggs: Clutch drops 2 eggs at a time that last 8 s (1 egg a drop, 6 s life topped out near 6 eggs, so "up to 12" was unreachable); Warm Glow eggs last 9 s (a charged egg had a 1 s window to be eaten). Family Ties was only slow to show its merges: its Lv 6 tests run 10 s, Eggs' 15 s.
- Save data: none.
- Hooks: none.
- Risk: Clutch and Warm Glow are stronger (more eggs, longer lived). Card text updated for both.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-19 Merge sandbox fix, voice guide, and the two old autorun branches (v10.26)
- Systems: sandbox, docs
- Files: merges only (see changes/ccr-f38bcc1f-1rc8ck.md, claude-great-maxwell-2ar9sg.md, claude-festive-allen-xmea8i.md, claude-zealous-clarke-i26iot.md)
- What: brings in the sandbox fix (no Acid Crypts or big hazards; the run log counts weapons) and the voice and tone guide. festive-allen (v9.28 autorun) and zealous-clarke (v10.04 test build, autorun doc) were already in v10 by another route: merged with our side kept, so nothing changes from them.
- Save data: none.
- Hooks: none new.
- Risk: none. Known failures carried over: wup5test (Baby Boom), wup6test (Tooth Fairy), and autoruntest, which is flaky (also fails about 1 run in 4 on v10.25).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Enemy Membranes like yours (v10.25)
- Systems: enemy membranes (new), enemies, combat
- Files: foemem.js (new), fight.js, index.html, tests/foememtest.js (new), tests/run.sh
- What: Nurse Cell, Mitotic Cell, Mother Cell, Plasma Cell and Stem Cell now wear a Membrane worth 30% of their health (the player's size), with the usual rules (Force does half, mends after 2 quiet seconds, Static recharges it). Every enemy Membrane, Mucus Wall's and Alpha Swimmer's included, now draws as the player's soap-bubble forcefield, bulging where it is hit, instead of a thin blue arc.
- Save data: none.
- Hooks: fight.js fightCd passes d.memFrac to makeDefence; fightDraw -> foeMemDraw.
- Risk: those five enemies take about 30% more damage to kill (60% more with Force). One extra gradient per Membrane enemy per frame.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge ccr-caa43b42: Soul damage is now Alien (v10.24)
- Systems: damage types, chemistry, ui, weapons, samples, docs
- Files: merge only (see changes/ccr-caa43b42-e4m6sc.md); meta.js, build.gradle, GAME_GUIDE.md
- What: brings in the Soul -> Alien rename, so the game's text now matches the Notion tables. Internal id stays `soul`.
- Save data: none.
- Hooks: none.
- Risk: wup3test, wup5test and wup6test already failed on v10.23 before this merge (Family Ties slingshot/white hole, Baby Boom in flight 25, Tooth Fairy clutch cap 6); not caused by it.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon levels add damage only (v10.23)
- Systems: weapons
- Files: game.js (computeStatsInner, optUpgrade, lvBonusText), ui.js (weapon level tree text), toys.js (crayon)
- What: levelling a weapon no longer makes it fire 5% faster, reload 5% faster or hold 12% more a level; fire rate, reload and magazine now change only when a branch card, level table (d.lv) or modifier says so. Level-table `mag` and `range` bonuses now apply and show in the text (they were silently ignored). Feats still cycle 5% faster a level. Weapon upgrade cards no longer say "faster cycling".
- Save data: none.
- Hooks: none.
- Risk: balance (a Lv 10 weapon used to fire about 37% faster and hold twice the magazine). wave20 4 mortal: before 0/4 wins (deaths at waves 8, 10, 13, 15), after 1/4 (9, 10, 15).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon UI colours match damage types (v10.22)
- Systems: render, ui
- Files: icons.js, seqsel.js, seqreveal.js, draft.js
- What: weapon and Feat icons, names and borders in every menu now use the exact damage type colour from `ELEMENTS` (`ELEM_UI` is derived from it instead of its own slightly different palette; Blood was pink-red in menus but claret in the world). Sequence select and the sequence reveal colour each exclusive weapon by its own damage type, not the sequence colour; Lv fork cards use the type colour, not the weapon's own shade.
- Save data: none.
- Hooks: none.
- Risk: menu colours shift slightly (Blood darker, Force brighter); the in-world `elem` glow in render.js reads `ELEM_UI`, so it now matches shot colours. seqtest, revealshot and colourtest already failed on this branch before the change.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Modifier cards with ranks; Switched at Birth back for every weapon (v10.21)
- Systems: modifiers, draft, damage types
- Files: modcards.js (new), modifiers.js, draft.js, index.html, tests/modcardtest.js (new), tests/modstest.js, tests/run.sh
- What: the 20 v10 modifiers (Notion v10+ rows) are now level-up draft cards for a weapon whose attack type fits: 3 different a weapon (one Delivery), and taking one again ranks it up to Rank 3 with bigger numbers (more jumps, bounces, bodies, pets and so on). Switched at Birth is offered again for all 24 weapons, signatures included: a random weapon gets a random other damage type and keeps its level, upgrade branch, modifiers and mutations; the card is Rare and never turns up two drafts running. Mutations already matched the Notion v10+ rows, so they are unchanged. No old v9 modifiers or mutations added.
- Save data: none (run state only: w.m10 may now hold 3 copies of any modifier; G.draftN, G.sabAt).
- Hooks: draft.js draftCards -> modDraftCands (replaces the v10Switch line while modcards.js loads); draft.js groupW gains mod.
- Risk: draft share shifts (a new mod group at weight 1.1, plus Switched at Birth at 0.6). Signature weapons switched to another type may still show some old-type effects their sigFire hard-codes. Branch ccr-caa43b42 (Soul renamed Alien) touches damage types: merge order matters for card text only.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 MY OWN MESS targeting (v10.20)
- Systems: autorun (autoaim), weapons, ui
- Files: aimat.js (new), game.js, autorun.js, ui.js, loadout.js, index.html, tests/aimowntest.js (new), run.sh, tools/guide.js
- What: new targeting directive MY OWN MESS (short MESS, id `ownmess`): a weapon or Feat shoots the enemy nearest another of your weapons' stuff (black hole, puddle, a lob's landing spot, pets, orbit blades, turrets, Feat effects). Pick whose mess (ANY MESS = your biggest thing in range, a named weapon or Feat, or itself) on the weapon page or in the LOADOUT target grid. Works as the primary or the tie-breaker. No mess about: nearest.
- Save data: none (`w.aimAt` lives on the run's weapon slot).
- Hooks: game.js targetScore case 'ownmess' -> aimOwnScore; acquire/acquireMany -> aimOwnSet; updateWeapon, updateSpellList, featTap -> AIMAT.w = w; autorun.js aimKey case 'ownmess' -> aimOwnKey; ui.js armoury targeting and loadout.js target grid -> aimOwnPick/aimOwnBind. DIRECTIVES gets its entry by push from aimat.js.
- Risk: the id must stay longer than 3 letters (targetScore only reads strings over 9 characters as pairs). Homing retargets and turrets using it borrow the last-fired weapon's aim point. Echo copies aim at ANY MESS.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Sandbox HUD: kills, kills a second, DPS (v10.19)
- Systems: sandbox
- Files: sandbox.js
- What: the Sandbox HEAT bar gains a second line: KILLS n | kills a second | DPS (all your damage), both averaged over the whole run so far. The HEAT buttons now refresh it at once (a comment had swallowed the call).
- Save data: none.
- Hooks: none.
- Risk: none (Sandbox only). Touches the Sandbox session's file: merge with care.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge the Sandbox session again: autofire toggle, + mount, banked upgrades (v10.17)
- Systems: sandbox, ui
- Files: merge only (manualfire.js arrives; ARCHITECTURE.md script order keeps both wstats and manualfire)
- What: brings in ccr-b8d66d4a-dmxu9z's two newer commits (one Sandbox with + mount and banked upgrades; autofire toggle with per-weapon FIRE buttons, Rewind on the left). Both branches had shipped v10.16, so this build is v10.17.
- Save data: see changes/ccr-b8d66d4a-dmxu9z.md.
- Hooks: see that fragment.
- Risk: none beyond that fragment's.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Per-weapon telemetry in the run log (v10.16)
- Systems: runlog, weapons, sandbox
- Files: wstats.js (new), meta.js, game.js, ui.js, index.html, tests/wstatstest.js (new), tests/run.sh
- What: each run now logs, per weapon slot: seconds held, dps, uptime (0.25 s windows with damage), distinct targets per active window, projectile hit rate, average hit distance, kills, share of damage on bosses, when each tier was taken, plus the weapons offered and picked in start/slot drafts. runText adds one ` wpn` line per weapon and an ` offers:` line (existing lines unchanged). Sandbox runs are now live-saved (closed runs get logged) and marked `[SANDBOX heat N]`. The run log keeps the last 60 runs (unchanged).
- Save data: `sd_runs` entries gain a `ws` object; the log is trimmed to 60 on load and save.
- Hooks: game.js damageEnemy -> wsHit, killEnemy -> wsKill, fireWeapon -> wsFire, spawnProj -> wsProj, update -> wsTick; ui.js pickLoot -> wsPick; meta.js runSummary -> wsSummary, runText -> wsHead, wsText.
- Risk: one extra set operation per hit; older logged runs have no `ws` and print as before.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Merge the Sandbox session (ccr-b8d66d4a-dmxu9z) (v10.15)
- Systems: sandbox
- Files: merge only; tests/run.sh (sbtest added to ALL)
- What: brings in the weapons-only developer Sandbox (its fragment: changes/ccr-b8d66d4a-dmxu9z.md). Both branches had shipped v10.14, so the merged build is v10.15.
- Save data: none.
- Hooks: see that fragment.
- Risk: none outside Sandbox.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Race balance: boss contact, bullet cap and fire rate, rival damage, egg membrane (v10.14)
- Systems: bosses, enemies, rivals, the egg, difficulty
- Files: bosses.js, game.js, boss10.js
- What: boss contact damage now takes the v10 cut (bosses.js overwrote makeEnemy's); enemy bullets alive at once capped at 120 (was 800); ordinary shooters fire a third less often; rival damage 0.3 (was 0.45); the egg's membrane has half the health. Bot race sim: first win (1 of 6, was 0); 5 of 6 reach the egg.
- Save data: none.
- Hooks: V10_DIFF gains fireGap, ebulCap, egg (boss10.js); game.js eBullet cap, shooter cooldown, openEgg; bosses.js boss dmg.
- Risk: easier race; re-check against phone runs (bot target 20 to 50%).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Test triage: 20 v9 tests retired, 6 fixed
- Systems: tests, school (Level 0)
- Files: tests/run.sh, tests/schooltest.js, inspecttest.js, introtest.js, setshot.js, rewindtest.js, newtut.js, web/js/school.js
- What: the ALL list drops 20 tests of v9 systems that v10 switches off (files kept): sigwtest weirdbox pintest reborntest forktest junktest sxshot devall seqtest seqfeattest revealshot foescenetest colourtest fusiontest supertest rubbertest armtest newfeattest psttest f3test. Fixed: Level 0 crashed in lesson 11 (junk DNA is off, `G.junkDrops` undefined) so lesson 11 is now a free pass under V10; the Feat lesson now gives a tappable Feat when the starting one is a trigger Feat (Oopsie), and schooltest finishes in about 93 s again; inspecttest expects the 7x7 chart; introtest reads the `sd_meta10` key; setshot opens a visible hint row (View is hidden); rewindtest and newtut skip junk-carrier and earned-colour assertions under V10.
- Save data: none.
- Hooks: none.
- Risk: none for the game beyond Level 0 lesson 11 being skipped under V10.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapons grow between tiers; Thorns recoil capped; hazards get the v10 damage cut (v10.13)
- Systems: weapons, combat, hazards
- Files: weapons24.js, game.js, fight.js, bosses.js
- What: between tiers the 24 still gain stats with player level (up to 3 old levels past their tier, one per 3 player levels; cards stay branch-only). Thorns recoil is capped at 4% of max health per hit (a mastered contact weapon took 202 back in a sim). Hazards (kidney stones, boss ground attacks) now take V10_DIFF.dmg like everything else.
- Save data: none.
- Hooks: game.js computeStatsInner -> wStatLv; bosses.js addHazard -> V10_DIFF.dmg; fight.js thorns cap.
- Risk: bot sim still 0/6 wins (2 of 6 reach the egg, one the Final Five); deaths now mostly late bullets and rivals.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon tiers: upgrades on their own screen, four tiers, all branches; no empty slots; catalysts need this run's reaction
- Systems: weapons, draft, ui, mutations
- Files: weapons24.js, draft.js, game.js, ui.js, mutations.js, tests/drafttest.js, tests/mutstest.js
- What: normal drafts carry no weapon cards; every 4th level opens a WEAPON UPGRADE screen (pick a weapon if more than one is ready, then its branch cards). Weapons have tiers 1-4 (promise, branch, mastery; one mastery a run), stored on the old internal levels 1/3/6/10 so stats and cards are unchanged. HUD and menus show tiers and hide empty and locked slots. "More <reaction>" cards need that reaction set off this run (was: ever discovered).
- Save data: none.
- Hooks: game.js gainXp -> wupLevel; draft.js draftLoot/draftBox/draftTitle -> 'wup', 'wupfork'; ui.js HUD/armoury -> wTier, wLvText.
- Risk: weapons reach fewer levels' worth of stats early (tier 2 = old Lv 3 only at level 4); balance re-sim pending.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Enemy bullets get the v10 damage cut
- Systems: enemies, difficulty
- Files: game.js, boss10.js
- What: enemy and boss bullets read their damage from the enemy def, so V10_DIFF.dmg never reached them (bullets were 45 to 69% of damage taken in run logs). New V10_DIFF.bullet (0.6) applies in eBullet; rival bullets keep their own knob.
- Save data: none.
- Hooks: game.js eBullet -> V10_DIFF.bullet (one line).
- Risk: easier race; tuning pending a 6-run sim.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 V10 clean-up after the weapon roster change
- Systems: weapons24, ui (Field Guide, Gene Bank, weapon panel), loadout, tutorial, school, guide tool
- Files: w24look.js (new), ui.js, loadout.js, tutorial.js, school.js, index.html, tests/tools/guide.js, GAME_GUIDE.md
- What: the 24 weapons get their own icons and unique badge codes (they all fell back to the pistol); a signature weapon's old id now reads as the new name in combos, pairings and the Tackle Box; only the 4 combos, 7 pairings and 1 super combo whose weapons are all among the 24 are listed (text rewritten with the new names); the Field Guide lists 24 weapons, V10 Feats and sample sequences (and no longer crashes on them); the Gene Bank no longer sells archived weapons; the Feat tutorial and Level 0 Feat room use V10 Feats; the GRUDGE card drops the Grudge Rifle; the guide lists only the 24 weapons.
- Save data: none.
- Hooks: ui.js codexHtml/renderBank/profileHtml/weapon panel and loadout.js loadoutCombos call wl_* helpers (w24look.js); school.js feat room f10Give.
- Risk: menus only. Old-id name sync renames archived defs (Lab Bench shows new names). Pre-existing failures: schooltest, inspecttest.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Race fixes from a run log: XP pull, weapon slots at Lv 5/12, gentler death stare, branches in the log (v10.12)
- Systems: pickups, draft, bosses, run log
- Files: game.js, data.js, bosses.js, meta.js, draft.js, tests/drafttest.js, tests/sim/race.js
- What: in the race, loose XP follows you from 1600 away at 190/s (was 650 at 85) and the magnet reaches 1.5x further; weapon mounts come at Lv 5 and 12 (was 8 and 22); The Immune Eye's death stare warns for 1.6 s (was 1.1) and hits for 60%; the run log shows each weapon's branch choices {A/Lv6/Lv10}. race.js prints XP collected, weapons and boxes. drafttest samples more drafts (it flaked).
- Save data: none.
- Hooks: none (edits inside game.js updatePickups, data.js SLOT_LEVELS, bosses.js glare).
- Risk: faster levelling (bot sim: XP collected 80 to 97%, was 66 to 90%); bot still 0/3 wins, dying to bullets at 5 to 7 min.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 6: Peekaboo, Eggs, Chest Burster, The Runs
- Systems: weapons, upgrades
- Files: wup6.js (new), index.html (script tag after wup3.js), ARCHITECTURE.md (script order), tests/wup6test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg. Costs are real stat changes (BOO and smite damage, hide time, lure, trail damage, undead life, cap and damage). Unnamed Lv 6 cards were named (Standing Room Only, Encore, Silent Running, Sneak Attack, Pass It On, Stampede, Bigger Basket, Triple Yolk, Egg Trail, Golden Opportunity, Warm Glow, Time Bomb, The Staff, Adoption Papers, Chronic Condition, Open Casket, Soul Searching, Remote Detonation, Burning Rubber, Footloose, Full Circle, Flashpoint, Creature of Habit, Well Trodden).
- Save data: none.
- Hooks: none added to shared files. Peekaboo and Eggs are toy weapons, which fireWeapon sends to toyFire before the 'fire' hook, so wup6.js wraps globals instead (peekSpot, toySteer, toyAim, toothFire, toothTaken, toothLure, hurtPlayer, killEnemy, sigwTick, wupDmgMul, v10Draw), the way wup1.js does for projHit.
- Risk: once a Chest Burster card is taken, sigwTick no longer sees that weapon's undead (they are lifted out of G.turrets for the call and managed in wup6.js, so they do not count towards the shared 8-pet total). Simplified: Rattle flings the false position 230 away (not left at the real position); Sneak Attack gives other weapons +30% while hidden (they already fire while you are hidden); Don't Count Your Chickens also makes eggs last 7 s so they can reach full charge at 6 s; Open Casket also spreads infection to two neighbours (rising from any kill already happens); Chest Burster undead have no melee, so the Dead Useful cost cuts their shot damage; Hookworm undead sit on their host and fire from it; the Runs' loop and wave checks use the trail pieces, not the exact path.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 3: Rent Free, Hot Mess, Family Ties, Skill Issue
- Systems: weapons, upgrades
- Files: wup3.js (new), index.html (script tag after wup2.js), tests/wup3test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg and acting through the weapons24.js hooks (stats, fire, hit, dmg, kill, tick). Costs are real stat changes. Unnamed Lv 6 cards were named (Cold Spot, Second Sighting, Ghostly Tug, Hitching a Ride, Spreading Spooks, Friendly Ghost, Backdraft, Hot Tub, Hot Foot, Burning Bridges, Short Fuse, Powder Keg, Roach Motel, Compaction, Bumper Cars, Let Go, Appetite, Afterglow, Bank Shot, Hat Trick, Weight Class, Prime Cut, Splatter Zone, Chain Tenderising).
- Save data: none.
- Hooks: none added to shared files.
- Risk: Skill Issue cards watch the armoury bowling list (G.armBowl); Family Ties cards edit orb fields (pull, aura, r); Hot Mess cards edit their own zones. Simplified: pets are invulnerable ghosts drawn with particles; Appetite/Afterglow add a second blast after the engine's supernova.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 4: There Is No Spoon, Nappy Mines, Soulmate Signal, Unwanted Contact
- Systems: weapons, upgrades (weapons24.js engine), defence (Umbilical Shield reads the Membrane hit)
- Files: wup4.js (new), index.html (script tag after wup2.js), tests/wup4test.js (new)
- What: all 60 cards for the four signature weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise (12 new names, e.g. Afterbirth, Water Breaks, Pass the Parcel, Nappy Pin, Stretch Marks, Love Triangle, Split Ends, Echo Chamber), and three masteries each. Costs are real stat or behaviour changes. Every card draws something (ring, line, tape, floatText) and counts itself in w.w4.fx for the test.
- Save data: none.
- Hooks: none added to shared files. wup4.js wraps globals at load: updateSiphon (replaced by a copy plus the cards once a card is taken), mineDrop, mineScale, detonateMine, twinPoints, wupDmgMul, wupHit, killEnemy, rateBonus, and (on first card taken, because fight.js and pdef.js load later) fightArc, fightStatus, fightPayoff, pdefHurt. Shares the 'phit' / 'pend' hook kinds with wup1.js (same globalThis.WUP_PROJ_HOOKS guard).
- Risk: other branches that edit updateSiphon, detonateMine or pdefHurt will not see their change take effect on a slot with a card. Simplified: stored-bullet staleness is not modelled (the base weapon has none, so Return to Womb's "+2 s" is dropped); Mirror Womb bounces half the shots that enter the absorb radius, not only ones that would hit you; Odd Sock and Evil Twin pick once per wave (once per 20 s or 25 s outside wave mode).
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 5: Ewww Gross, Blowing Bubbles, One of These Days, Sister Cousin
- Systems: weapons, upgrades (weapons24.js engine), toys (Red Tape, Bubble Wand, Due Date), modifiers (multiplying)
- Files: wup5.js (new), index.html (one script tag after wup2.js), tests/wup5test.js (new), ARCHITECTURE.md (script-order line)
- What: all 60 cards for the four Mucus/Blood projectile weapons are live through wupReg: three promises (Lv 3), two Lv 6 cards and a wildcard per promise, three masteries each. 24 in-promise Lv 6 cards are newly named (Corporate Merger, Group Chat, Puppet Strings, Gossip, Tangled, Escalation, Locked In, Cannonball, Chaperone, Return to Sender, Popcorn, Stuck Together, Early Delivery, Short Notice, Pass the Parcel, Rush Hour, Compound Interest, Fine Print, Runts of the Litter, Overcrowding, Taste for It, Nepotism, Pack Hunting, Pile-On). Costs are real stat or behaviour changes. Sister Cousin now really splits on a kill from Lv 1 (its slot starts with the 'multiplying' modifier; the text promised it but nothing did it).
- Save data: none.
- Hooks: none added to shared files. wup5.js wraps these globals at load, each a no-op for a slot without a card: toyFire (so toy weapons reach the 'fire' hook, which fireWeapon skips for them), canBubble, toyHold, bubbleSoak, bubbleHit, bubblePop, dueMark, duePop, toyHurt, modHit, makeSlot, wupDmgMul, hurtPlayer, v10Draw; and the shared 'phit'/'pend' kinds (same WUP_PROJ_HOOKS guard as wup1.js). Candidates to become real one-line hooks.
- Risk: Group Chat is thin (the base tape already shares to every member at any distance, so the card only lifts the boss discount). Hit-ups that are a share of max health (snap, Compound Interest) use mult 1. Lost in the Post and Postponed act in a hurtPlayer wrapper before dodge and boss-cap rules. Cotton Wool/Postponed/Lost in the Post share one wrapper.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Every level-up and DNA pick opens at once (v10.11)
- Systems: draft
- Files: draft.js, tests/drafttest.js
- What: the 40 s spacing between draft screens is gone (`DRAFT.budget` 0): level-ups and DNA pickups open their card screen immediately.
- Save data: none.
- Hooks: none.
- Risk: more card screens close together; faster power growth.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: the game froze at the second level-up (v10.10)
- Systems: draft, core loop
- Files: game.js
- What: queued level-up boxes waiting out the 40 s draft spacing stopped the game clock, so the wait never ended. A waiting box now goes to the back of the queue and the game keeps running.
- Save data: none.
- Hooks: none (game.js frame loop condition).
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 1: Standard Issue, Maximum Gains, Nervous Wreck, Panic Button
- Systems: weapons, upgrades
- Files: wup1.js (new), index.html (one script tag after weapons24.js), tests/wup1test.js (new)
- What: all 60 cards for the four Force weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise, and three Lv 10 masteries (15 per weapon). Costs are real stat changes. Marks, bounce zigzags, lanes, nuts, confetti, lumps, fragments and jaws are drawn so each "Shows" line is true.
- Save data: none.
- Hooks: none added to shared files. wup1.js wraps four globals at load: projHit and projEnd (new hook kinds 'phit' and 'pend', guarded by globalThis.WUP_PROJ_HOOKS so later wup*.js files can share them), wupDmgMul (marks that raise damage from your other weapons), hurtPlayer (Untouchable) and v10Draw (marks). Candidates to move into weapons24.js / game.js as real one-line hooks.
- Risk: the four weapons' fire paths are replaced by dispatchers once a Lv 3 card is taken (Maximum Gains tags the engine's own volley; Panic Button places its own blast, so mutFire/modFire do not apply to it). A card "heavy hit" is applied directly (one Shell layer off, Poise up) and does not trigger Blood Pressure.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The new eight samples in code: three starters each, Race only (v10.09)
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon branches, batch 2: Acid Spit, Red Flagship, Nocturnal Emission, Little Prick
- Systems: weapons, upgrades (weapons24.js engine), combat (bars read and paid off from a card)
- Files: wup2.js (new), index.html (script tag after weapons24.js), tests/wup2test.js (new)
- What: the four weapons now have their three promises (Lv 3), nine Lv 6 cards (two per promise plus a wildcard; 18 in-promise names are new, e.g. Second Helping, Backsplash, Cascade Failure, Rising Damp, Reef Knot, Terminal Clause) and three masteries each, all registered with wupReg and acting through wupOn hooks. Costs are real stat or damage changes; every card draws something (ring, line, drips, floatText).
- Save data: none.
- Hooks: none added to shared files. wup2.js only reads fight.js, combat.js and game.js (damageEnemy, spawnProj, zones, v10fx lines). Globals are all w2* / W2_*.
- Risk: Snot Ocean is read as radius x3 (not area x3); Pin Cushion needles do 50% each; Projectile Vomit swaps stats and fire() but leaves def.v10atk as proj (its hits carry atk 'beam'). Nocturnal Emission strands, bogeys and bubbles are drawn with v10fx dots and lines. tests/wup2test.js is not in run.sh's ALL list (run it by name).
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The new eight samples in code: three starters each, Race only
- Systems: samples, weapons, ui
- Files: samples10.js, feats10.js, mutations.js, fight.js, game.js, ui.js, tests/samplestest.js, tests/ufeatstest.js, tests/v10test.js, tests/voicetest.js
- What: Samples are now Baseline, Alpha, Beta, Private Schooled, Ordered Online (Mucus / Fire), Redtail, Prawn Again and Not of This World, with ids baseline, alpha, beta, private, ordered, redtail, prawn, alien (old over, late, friend, parcel, unsol, unacc, other migrated). The first draft offers the sample's three starters (w24Starters); the other two stay in the pool. Not of This World shifts a per-slot type (w.typeOver) every 20 s instead of swapping weapons. All samples are open (S10_ALL, unlock rules kept). The Experiment picker and quick start use only the Race (S10_PETRI hides the Petri Dish). Private Schooled and Not of This World carry shield: true (s10Shield()).
- Save data: META.s10 / META.s10runs keys change from the old ids to the new ones (test build, no migration); profile ids s10_<new id>.
- Hooks: fight.js fightHit reads src.w.typeOver; game.js spawnProj colours by w.typeOver; ui.js quickStart uses s001.
- Risk: old saves with META.profile s10_over etc. fall back to a missing profile; the Petri Dish is unreachable from the sample screen.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Player shield: samples, Rubber Johnny or Latex Protection, drawn as the original forcefield
- Systems: combat (player defences), relics, draft, render (shield bubble)
- Files: pdef.js, stamina.js, bodymods.js, render.js, bosspack.js, data.js, tests/shieldtest.js (new), pdeftest.js, bubtest.js, GAME_GUIDE.md
- What: Nobody has the Membrane by default now. It is the player's shield, granted by Private Schooled / Not of This World (s10Shield, from samples10.js), the Rubber Johnny relic (replaces its old catch-a-hit skin under V10; text rewritten) or the new Latex Protection card (offered while you have no shield, takes a Genome slot). Thicker Membrane and Faster Recharge need a shield. It draws as the original forcefield bubble (armourRing) with the elastic physics and surface contact (bubbleBump); the blue arc is gone. Soaks and Static recharges set G.armFlash; a hard bump into a wall wears the Membrane 4% (was armour).
- Save data: none.
- Hooks: render.js `if (!V10 || pdefShieldUp()) armourRing(px, py)`; stamina.js armourRing guard and k -> pdefShieldUp / pdefShieldK; bodymods.js bubbleOn -> pdefShieldUp, bubbleBump dent -> pdefDent; bosspack.js bpRelicIn rubber skin `&& !V10`.
- Risk: Baseline and most samples lose 30% max health of soak (balance: re-sim). Latex Protection competes for Genome slots. s10Shield must be added by samples10.js (read via typeof guard).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Samples renamed; three unique starting weapons each; 15 weapon renames (docs only)
- Systems: sequences, weapons (docs only, redesign docs)
- Files: SAMPLES.md, BASE_WEAPONS.md, WEAPON_UPGRADES.md, COMBAT_MATRIX.md, FEATS.md, MODIFIERS.md, MUTATIONS.md, UPGRADES.md, VOICE_GUIDE.md, AUTORUN_AUTOAIM.md, README.md
- What: The eight samples are now Baseline, Alpha (rewritten as a manosphere podcaster), Beta, Private Schooled, Ordered Online, Redtail, Prawn Again and Not of This World. Each has three starters of its own (all 24 weapons, none shared), offered in the level 1 draft. Fifteen weapons renamed (Nut Shot is Standard Issue, Tooth Fairy is Eggs, and so on); the Eggs upgrade cards were rewritten from teeth to eggs.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Two open issues: Ordered Online has no Acid starter; Not of This World's type-shifting passive needs a matrix line.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades: Lv 6 wildcards (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md
- What: Lv 6 now offers three cards: two inside the chosen promise and one wildcard from outside it (72 new cards; 360 in all).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades: choices at Lv 6 and 10 (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md, CLAUDE.md
- What: Lv 6 is now a two-card choice inside the chosen promise; Lv 10 is three extreme masteries per weapon (72 new cards). 288 cards in all.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Five masteries break shared caps on purpose (listed in the doc).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrades second draft; Nappy Mines is Fire (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (rewritten), BASE_WEAPONS.md, UPGRADES.md, README.md, CLAUDE.md
- What: upgrades are now three promises at Lv 3, each grown at Lv 6 and Lv 10, with trade-offs, visible tells and autorun-mode notes; no upgrade changes damage type. Nappy Mines is Fire from the start (burning patch footprint instead of an Acid Pool).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Weapon upgrade forks (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (new), UPGRADES.md, README.md, CLAUDE.md, COMBAT_MATRIX.md
- What: 216 upgrade cards (three at each of Lv 3, 6, 10) for the 24 base weapons; weapon forks move from Lv 5/10 with two cards to Lv 3/6/10 with three.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Overrides the UPGRADES.md weapon-fork rule and the MODIFIERS.md "a fork never changes damage type" line.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Base weapons decisions (docs only)
- Systems: weapons, chemistry (docs only, redesign docs)
- Files: BASE_WEAPONS.md, COMBAT_MATRIX.md, SAMPLES.md, ENEMY_DESIGN.md, FEATS.md, tables/*.csv
- What: Static + Mucus reaction renamed Snot Socket (the weapon takes Sticky Situation); four weapon renames confirmed; three sample starting weapons changed.
- Save data: none.
- Hooks: none.
- Risk: none (no code). `combos.js` still has a combo named Sticky Situation.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Base weapons roster (docs only)
- Systems: weapons (docs only, redesign docs)
- Files: redesign docs/BASE_WEAPONS.md (new, now self-contained), WEAPONS.md and SIGNATURE_WEAPONS.md (moved to archive/), README.md, CLAUDE.md, COMBAT_MATRIX.md, SAMPLES.md
- What: records the 24-weapon roster (10 foundations with animation specs, 14 signatures) and archives the other 72; lists the open naming and sample-start issues.
- Save data: none.
- Hooks: none.
- Risk: none (no code changed). Code pass is described in BASE_WEAPONS.md section 6.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Player defences and defence cards
- Systems: combat, v10, ui (loot cards only)
- Files: pdef.js (new), game.js, v10.js, render.js, index.html, tests/pdeftest.js (new), tests/v10test.js, tests/fighttest.js
- What: under V10 you start with a base Membrane (30% of max health, recharges like an enemy's) and can hold Shell layers, Squishy, Evasion and Thorns from six new defence cards (Thicker Membrane, Faster Recharge, Shell Layer, Squishy, Evasion, Thorns). Hits resolve in matrix 11.1 order in pdef.js; a hit fully soaked by the Membrane applies no status. Level-ups now offer Switched at Birth plus two different defence cards (one box a wave unchanged). Blue Membrane arc and brown Shell rings are drawn round you; the old armour ring is off under V10.
- Save data: none (G.pd is per run; run log gains fst.pMem, pLayers, pMiss, pThorns).
- Hooks: game.js hurtPlayer -> pdefHurt (replaces the armour block under V10); v10.js v10Tick -> pdefTick, v10Draw -> pdefDraw, v10Loot -> pdefOffer; render.js armourRing skipped under V10.
- Risk: player survivability shifts (a free 30% Membrane); fighttest and v10test adjusted for it. Genome slots (4) are enforced for defence cards only.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Merge v10.04 and record the implementation plan
- Systems: none (docs and merge)
- Files: merge of claude/zealous-clarke-i26iot; NOTES.md (v10 section); redesign docs/README.md
- What: this branch now carries the v10 test build plus the newest redesign docs. NOTES records the Soul, defence and player-armour decisions and the phase plan.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: agent guide for the folder
- Systems: docs only (redesign docs)
- Files: redesign docs/CLAUDE.md (new), redesign docs/README.md, CLAUDE.md
- What: per the user, a CLAUDE.md in the redesign folder tells agents the source-of-truth order, which doc holds what, the hard limits and vocabulary, what to ignore, and the checks before finishing. The root CLAUDE.md points to it.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: mutation cards
- Systems: docs only (redesign docs)
- Files: redesign docs/MUTATIONS.md (new), MODIFIERS.md, UPGRADES.md, COMBAT_MATRIX.md, README.md
- What: per the user, the run's change-the-sample cards are called Mutations (the attack-behaviour list keeps the internal name modifiers). 33 mutations from the user's list, mapped to the rules: body, weapon, damage-type, trade-off and rare synergy. Weapon mutations attach to a weapon (max 3); the rest use Genome slots and rank up when picked again. Bad Blood and Leave a Little Something lost their new ground objects; Crossed Wires became the general Catalyst (the combinations are the 21 reactions). Starting pool of 8.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Feats as the consciousness's gifts; gravity well and lunge
- Systems: docs only (redesign docs)
- Files: redesign docs/FEATS.md (new), MODIFIERS.md, COMBAT_MATRIX.md, SIGNATURE_WEAPONS.md, WEAPONS.md, UPGRADES.md, VOICE_GUIDE.md, README.md
- What: per the user, Feats are gifts from the consciousness: 16 gifts for every sample (11 from the user's ideas list, 5 new), 8 sample-exclusive gifts (one per sample), and the best 15 of the 48 original Feats mapped to the current rules and re-gifted (gift line on the card, old Scientist line as a Field Guide note), with a suggested starting pool of about 15. New attack modifiers: gravity well (pulls bodies and bends shots; Black Hole, Sofa Crevice, Wandering Womb, Van de Graaff) and lunge (moves you). Utility Feats have no damage or attack type.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: open issues settled (decisions 29 to 32)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, WEAPONS.md, SAMPLES.md, ENEMY_DESIGN.md, UPGRADES.md, DEFENCE_TYPES.md, SIGNATURE_WEAPONS.md, README.md, tables/combat_interactions.csv
- What: per the user, (29) the Force + Soul reaction is renamed Out-of-Body Experience, so the Soul Burst weapon keeps Soul Purpose; (30) The Other Half's First Contact is a fifth reaction trigger kind (Feat): it counts as a hit of the old and new type for reactions only, at most 8 per use; (31) the player gets defences from upgrade cards (Genome slots) or built into some samples, weapons and Feats (no slot); Assimilation is dropped; (32) built-ins stay rare: The Cold Parcel has 20% Evasion, Thorny Onesie gives Thorns, no sample Feat has one.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: COMBAT_MATRIX is the single source; CSVs generated
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, README.md, MODIFIERS.md, WEAPONS.md, SIGNATURE_WEAPONS.md, UPGRADES.md, tables/*.csv, tables/export.py (new)
- What: per the user, every combat rule and status now lives only in COMBAT_MATRIX.md (new: type rules in section 2, all defence rules and interaction rows in section 3, triggers and design status on every status in section 4, attack-type rules in section 13, a where-things-live map and the CSV export in section 14; old section 9 merged away). DAMAGE_TYPES, DEFENCE_TYPES and ATTACK_TYPES are cut to identity, look, strengths and weaknesses plus pointers. ENEMY_DESIGN cites the matrix instead of restating it. The three CSVs are now generated by tables/export.py from the matrix. Stale lines fixed: "named weapon combo", Static "Charge to interrupt", Matchstick's trail as a world object, "five" Soul reactions (six), signature weapon counts, a wrong rule reference on Placental Siphon, Yo-Yo Diet's missing modifier.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Heartburn signature (returning droplets)
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md, WEAPONS.md, MODIFIERS.md
- What: per the user, Heartburn's signature is "coming back up": each droplet flies out to full range and back, hitting on both passes (the Returning modifier, now allowed on Spread). Damage per droplet 3.4 to 2.4 to compensate.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: shipped ground objects only, greyscale notes gone, tidy-up
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md, SIGNATURE_WEAPONS.md, WEAPONS.md, SAMPLES.md, VOICE_GUIDE.md, tables/*.csv
- What: per the user, only shipped ground objects plus wax (decision 27): Burn zones, corrosive slicks, clot patches and Heartburn's reflux puddle are cut. Slick Move now leaves an Acid Pool, Caught in the Clot Snares the first enemy across the blood pool, Flammable Mucus flares once (a burst, not a zone), Smouldering elites give off a death Burst. Shipped terrain added to the world objects table. Acid stays shocking pink (decision 28). Greyscale notes removed (Lab view is retired). Em dashes replaced, duplicate link removed.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Heartburn has no signature until one is chosen.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: modifiers stack, forks can rarely change attack type
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md, MODIFIERS.md
- What: per the user, a weapon can carry several modifiers (the two-plus-one cap is gone) and a fork can, rarely, change a weapon's attack type (mostly at the Lv 10 mastery fork). Damage type never changes.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: upgrades and progression
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md (new), README.md
- What: the progression model: one shared card draft (Acquire, Enhance, Transform, Specialise), slot caps (3 weapons at levels 1/8/22, 3 Feats with the sample's unique Feat fixed, 4 shared Genome slots for mutations and Assimilation defences), Feat levels with forks at 3 and 5, weapon forks at 5 and 10 (one mastery a run; forks use the upgrade modifier slot from MODIFIERS.md, never change attack type), a 50/25/25 sample-type pool lean, Skip/Reroll/Banish (Remove 2, Fewer like this 1) and a one-screen-per-40 s interruption budget.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: pets rule, modifiers, six more signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIERS.md (new), COMBAT_MATRIX.md (12.3 Pets), SIGNATURE_WEAPONS.md, WEAPONS.md, ATTACK_TYPES.md, README.md
- What: pets get one rule (damage, leash 300, 4 per weapon and 8 in total, 20% of your health, respawn 3 s, ignore statuses and hazards, enemies only target nearby pets). MODIFIERS.md defines 18 modifiers with caps (homing, piercing, chaining, ricochet, returning, orbiting, delayed detonation, lobbed, trail, self-centred, sweep, anchored beam, rapid volley, every Nth, growing, scaling, multiplying, summoned). Twin Telepathy, Blood Blister, Thorny Onesie, Seeker Siblings, Flagellum Flail and Nose Goblins become signature weapons 21 to 26 (68 weapons in all).
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Samples doc: tell, quirk and payoff format
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md
- What: SAMPLES.md rewritten in the user's format: design principle (tell, quirk, payoff), one-line roster, a page per sample (core fantasy, behaviour, named passive, Unique Feat, visual signature, consciousness, Scientist, selection-card gag), visual rhythm, guardrails and the guiding test. Rules, starting attack types (linked to WEAPONS.md section 4), unlocks and open decisions kept at the end.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: one weapons list
- Systems: docs only (redesign docs)
- Files: redesign docs/WEAPONS.md (new), README.md
- What: all 62 redesign weapons in one table set (42 matrix weapons from v10.js V10_NAMES, 20 signature weapons) plus the 34 parked originals with reasons. Flags a new name clash: Soul Purpose is both the Soul Burst weapon and the Force + Soul reaction. Section 4 maps each SAMPLES.md sample to its starting matrix weapon.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Samples design: eight new playable characters
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md (new), README.md, VOICE_GUIDE.md
- What: Eight samples (Baseline to Other Half) to replace the sequences as playable characters: types, starter attack type, passive, unique Feat, Scientist line, unlock, story and visual language each, aligned with the 26 reconciliation decisions (Soul possesses, no automatic Fire spread, Lab view retired, type colours). Profiles become trait-named builds; game modes become "Experiments".
- Save data: none.
- Hooks: none.
- Risk: none now; when built, replacing sequences touches seqsel/seqlock/genes and the META.prof migration.
### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Fire signature weapon drafts
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md
- What: five Fire signature drafts, one per attack type beside Pub Crawl's Pool: Heartburn (original `flamer`, moved from Acid), Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation. Names checked against the code (Hot Flush, Running a Temperature and Fever Dream are taken).
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Moving `flamer` from Acid to Fire changes Heartburn's existing upgrades and Pairings when ported.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md (new), COMBAT_MATRIX.md (section 12, Fear row), README.md
- What: 15 original weapons (Premature Evangelation, Nappy Mines, Pub Crawl, Peekaboo, Black Hole, Tapeworm Seeder, Red Tape, Due Date, Leeches, Static Cling, Lard Lobber, Placental Siphon, Bubble Wand, Tooth Fairy, Upchuck) return as signature weapons beside the 42-weapon matrix, each retyped to one of the seven types. New rules: echo damage, Pull, allied creatures, player hiding, bounded chains, lures, merging pools, projectile blocking.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Porting will touch weapon ids that have Pairings on other branches.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: formulas and starting values
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (new section 11, status rows), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md (Damage type column), AUTORUN_AUTOAIM.md (SHELLED, MEMBRANED, TOUGHEST), README.md, tables/*.csv
- What: every mechanic now has a formula and a starting number: hit order (Evasion, Membrane, Shell, Squishy, then crit); one build-up bar formula (raw damage over bar size x max HP, 2 s drain); heavy Force hit at 15% max HP; reaction damage as % of the triggering hit with a 1.5 s lockout; Possessed AI; Charge as a conductor; Extraction on bleeding kills; Membrane recharge only (no supercharge); defence, status and world-object values; enemy damage types on a bell curve; Snot Trap rename.
- Save data: proposed META.rxSeen (reaction discovery); nothing in code yet.
- Hooks: none.
- Risk: none (docs only); numbers need playtest.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: reconciliation (26 decisions)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (rewritten), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, VOICE_GUIDE.md, README.md, tables/*.csv (regenerated)
- What: cross-doc contradictions settled one by one (COMBAT_MATRIX.md section 10). Reactions use four trigger kinds (state + hit, world object + hit, dual-type weapon, Pairing) and are identical in every doc; Soul reactions rebuilt on Possessed and the Soul Mark retired; Dodge defence renamed Evasion (miss chance on Contact, Projectile, Spread only); Acid strips Shell for good and has no DoT outside Pools; Fire uses a Burn bar with one Ignition flare and no auto-spread; Squishy blunt only; Shell layers wear slowly under ordinary hits; Mucus smothers Fire; world objects split from statuses; player can have every defence and status except Possessed; reactions are discovered; Lab view to be retired; plain internal ids to come.
- Save data: none yet (decision 19 will rename internal type ids and needs a migration).
- Hooks: none.
- Risk: decisions 19 to 21 (id rename, Lab view retired, palette) are big code changes still to do; see redesign docs/README.md "Follow-on work".

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Redesign docs: Soul as mind control, TOUGHEST restored, feature-file enemy rows
- Systems: docs only (redesign docs)
- Files: redesign docs/AUTORUN_AUTOAIM.md (copied from claude/zealous-clarke-i26iot), DAMAGE_TYPES.md, DEFENCE_TYPES.md, COMBAT_MATRIX.md, ENEMY_DESIGN.md, README.md, tables/mechanics_statuses.csv, tables/combat_interactions.csv; NOTES.md (one bullet)
- What: Soul is mind control only: new Possessed status (full build-up turns an enemy on its mates for a few seconds; bounded, bosses reduced); essence and resource bypass removed everywhere (Essence Drain and Soul Fracture rows gone). TOUGHEST restored (HIGHEST HEALTH was removed in AUTORUN_AUTOAIM.md). ENEMY_DESIGN 5.3 now reviews all 27 enemies from foes.js, foes2.js and foes3.js, with revisions for Litmus Cell, Mirror Cell, Platelet Clump and Grease Ball.
- Save data: none.
- Hooks: none.
- Risk: v10 code may still describe Soul with essence wording.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Enemy design doc: review fixes
- Systems: docs only (redesign docs)
- Files: redesign docs/ENEMY_DESIGN.md
- What: Fire damage and Burning separated; defence wording allows enemy-specific states that aren't hidden defences; exact triggers for Static Sock (Crackle by distance), Stress Ball (qualifying hit, reset, decay, hazard-safe rebound), Mosquito (fixed bite, half back within 4 s, not Extraction) and Snot Bubble (any Static hit bursts it); targeting policies framed as tools (TOUGHEST, which doesn't exist, is now HIGHEST HEALTH); roster uses in-game names with code ids, adds Paramecium and lists the unreviewed foes/foes2/foes3 enemies; Fire prototype order (Matchstick first).
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Combat rulings 33 to 38 (docs)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (section 10 rows 33-38, 11.3, 11.5), tables/mechanics_statuses.csv (regenerated)
- What: reaction damage is explicit per reaction (no hidden 60%/150% on every reaction); Corrosion makes unshelled enemies Corroded for 4 s; a hit fully soaked by Membrane applies no status; one shared burn per target; Shell wear rule; the 21 reactions are inventory until playtested.
- Save data: none.
- Hooks: none.
- Risk: none (docs).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Pure combat resolver (combat.js)
- Systems: combat (new)
- Files: web/js/combat.js (new, not yet loaded by index.html), tests/combatunit.js (new, plain node)
- What: matrix 11.1 hit resolution as pure functions (makeDefence, resolveHit, tickDefence, addBurn, COMBAT constants) with decisions 33-37; 45 unit tests. Crits fill bars and judge heavy hits from pre-crit damage.
- Save data: none.
- Hooks: none yet (wired into damageEnemy/hurtPlayer in the slice).
- Risk: none until wired.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Voice line tables (voice.js)
- Systems: voice (new)
- Files: web/js/voice.js (new, not yet loaded)
- What: Scientist and consciousness lines for 19 events with composure tiers, a Scientist and a consciousness first-sighting line for 81 enemies and bosses, 13 first-time status hints, sampleId (1A..1Z, 1AA) and voiceLine (no repeats, tier rarity).
- Save data: none.
- Hooks: none yet (show.js, intro.js, finale.js later).
- Risk: none until wired.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Combat slice: defences and the first reactions in play (v10.05)
- Systems: combat (new fight.js), roster, v10, chemistry, engine
- Files: fight.js (new), roster.js (new, data), combat.js (addBurn renamed burnAdd: chem.js has one), game.js, chem.js, v10.js, meta.js, index.html, tests/fighttest.js (new)
- What: enemies now carry the five defences from the roster (Macrophage Squishy, Diatom/Spire/Water Bear Shell, Mucus Wall/Alpha Swimmer Membrane, Sprinter/Quantum/Ghost Evasion, the new Ingrown Hair Thorns), drawn as rings (blue Membrane arc, brown ring per Shell layer, thorn spikes, dashed Evasion ring) with "miss" puffs. Hits resolve through combat.js; crits come last. Acid builds Corrosion (strips a Shell layer, or Corroded for 4 s) with no damage over time; Mucus Snares (55% slow, puts out Burning); Static Charges (+20% Static, arcs 3 jumps, discharges on death). Five reactions: Corrosive Splash, Snot Rocket, Conductive Pool, Slick Move, Sticky Situation, named on first discovery (META.rxSeen). Per-run stats in G.fst, saved in the run log.
- Save data: META.rxSeen (list of reaction ids) added; run log entries gain `fst`.
- Hooks: game.js damageEnemy -> fightHit (replaces armour under V10; crit multiplier skipped under V10), applyElement guard e.fOk; game.js killEnemy -> fightDeath; chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js runSummary fst.
- Risk: balance. Bot sim (2 runs) dies at waves 4-5, same as the build before the slice (waves 3-5): v10 has almost no upgrades yet. Blood, Soul and Fire keep v10.04 statuses for now. Shocking Impact needs a dual-type weapon (none yet).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 All seven damage types and twenty reactions
- Systems: combat (fight.js), engine
- Files: fight.js, game.js, tests/fighttest.js, tests/v10test.js
- What: Blood Bleeds (30% of the hit over 3 s, 3 at most); dying while bleeding leaves a blood pool and heals you a little (Extraction, 1% max health, 6 a second at most). Soul fills the Possess bar only. Fire adds to one shared burn; Snared puts it out. Two Snared enemies touching are Conjoined for 3 s. The other fifteen reactions now fire: Blood Pressure, Out-of-Body Experience, Flashover, Caustic Breach, Soul Erosion, Premature Evaporation, Blood Circuit, Interference Pattern, Arc Flash, Caught in the Clot, Held in Suspension, Flammable Mucus, Blood Donor, Cauterise, Spectral Combustion (Soul Beam + Burning Ground, both Lv 5+). Area hits now land on Possessed enemies (autoaim still skips them), so the Soul reactions can happen.
- Save data: none new (META.rxSeen gains the new ids).
- Hooks: game.js damageEnemy charmed guard skipped under V10.
- Risk: Possessed enemies can now be killed by your area weapons. Shocking Impact still needs a dual-type weapon.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-17 Draft core (draft.js) (v10.06)
- Systems: draft (new), v10, loot
- Files: draft.js (new), v10.js, game.js, index.html, tests/drafttest.js (new), tests/v10test.js, tests/pdeftest.js
- What: level-ups and elite/boss chests open one shared draft: weapon upgrades, Switched at Birth, defence cards and any card a feature file registers (Feats, mutations). Acquire cards need a free slot (3 Feats, 4 Genome shared by mutations and defences). Weapons reaching Lv 5 or 10 and Feats reaching level 3 or 5 get a 2-card fork screen. Wave mode: one level draft a wave plus chests, at the wave break; race: at most one screen per 40 s (forks never wait). Banish data (G.banish, G.fewer) is honoured; the buttons come with the UI pass.
- Save data: none.
- Hooks: v10.js v10Box -> draftBox, v10Loot -> draftLoot; game.js main loop: a 'wait' from v10Box rotates the box to the back of the queue.
- Risk: more drafts in race mode than v10.04's every-strand switches are fewer now (40 s budget); elite/boss chests now open drafts in wave mode.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Wave-mode drafts queue instead of vanishing; sim uses the real draft rules
- Systems: draft, tests
- Files: draft.js, tests/sim/wave20.js, tests/v10test.js
- What: in wave mode every level-up draft now queues and plays at the wave break (UPGRADES.md 9); before, every level after the first in a wave was dropped. The wave sim now sends boxes through v10Box like the real loop and prints combat stats (G.fst) and the final build per run.
- Save data: none.
- Hooks: none.
- Risk: more upgrades per run in wave mode. Bot sims (3 runs): deaths at waves 8, 5, 8 (was 4 to 5).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Banish on draft cards; Switched at Birth keeps the weapon's level
- Systems: draft, ui, v10
- Files: draft.js, ui.js, v10.js
- What: draft cards carry two small buttons: Fewer like this (1 reroll: that family half as often) and Banish (2 rerolls: gone for the run); the screen then redraws. Switched at Birth now keeps the weapon's level, modifiers and weapon mutations instead of resetting it to Lv 1.
- Save data: none (G.banish, G.fewer are run state).
- Hooks: ui.js renderLootCards -> draftBanishBtns.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 modifiers (merged from agent-mods)
- Systems: weapons, modifiers (new)
- Files: modifiers.js (new), game.js, arsenal.js, v10.js, index.html, tests/modstest.js (new; the old body-mods test is now bodymodstest.js, not in the run list)
- What: all 20 modifiers (MODIFIERS.md) work on v10 weapons through w.m10, with modAdd / modHas / modsFor; weapon forks at Lv 5 and 10 now offer two fitting modifiers. Attack type and damage type never change.
- Save data: none (w.m10 is run state).
- Hooks: game.js fireWeapon -> modFire, spawnProj -> modProj, updateProjectiles -> modStep and modHit; arsenal.js meleeHit -> modMeleeHit; v10.js v10Fire -> modBeam and modBurstEnd, v10Tick -> modTick, v10Draw -> modDraw.
- Risk: Summoned pets can't be hurt (simplified); balance numbers (orbit 0.6x, pet 0.8x, every-4th 2.5x) untuned.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Your statuses from enemy damage types
- Systems: combat (pdef.js), engine
- Files: pdef.js, game.js, pstatus.js, tests/pdeftest.js
- What: an enemy hit that gets past your Membrane applies its damage type's status to you (matrix 11.5): Mucus Snares you (45% speed for 1.5 s, puts out Burning), Blood Bleeds (30% of the hit over 3 s, 3 at most), Fire burns (one shared burn, 20% of the hit over 3 s, at most 25% of max health held), Static Charges you (+20% Static taken for 3 s). Bleed and burn can kill. Each shows on you like on enemies. The old v9 player statuses (Snotty, Sick, Soaking wet, Lubricated) are off under V10.
- Save data: none.
- Hooks: game.js updatePlayer speed -> pdefSpeed (both speed lines); pstatus.js pstHit returns under V10.
- Risk: enemy Mucus/Blood/Fire/Static hits hurt more than before; enemy damage types come from roster.js dmgType.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The eight samples (samples10.js)
- Systems: samples (new), v10, combat, ui
- Files: samples10.js (new), v10.js, fight.js, game.js, pdef.js, ui.js, index.html, tests/samplestest.js (new), tests/v10test.js
- What: the sample screen lists the eight samples (locked ones show their unlock; the Unaccounted shows ??? until earned), then the Experiment (#002 The Petri Dish or #001 The Race). Each sample starts with its own matrix weapon and leans the draft to its types, with its passive: Baseline +5% stats; Overachiever fires 25% faster while moving; Late Starter gets damage and lifesteal below 30% health; Family Friend builds Corrosion 50% faster and its Possessed enemies hit 50% harder; Cold Parcel leaves a Snaring Mucus trail and has 20% Evasion built in; Unsolicited's Static hits add burn; Unaccounted's Possessed enemies make their friends Bleed; Other Half's weapons shift Fire, Soul, Static every 20 s. Unlocks follow SAMPLES.md (wave 10, recover from under 10%, beat the dish, survive a big hazard, Soul boss kill, beat Level 1; Mythical box still has no trigger). Unique Feats come with the Feats merge.
- Save data: META.s10 (unlocked sample ids), META.s10runs (runs per sample, for the 1A/1B IDs). META.profile now holds s10_<id>.
- Hooks: v10.js v10Samples -> s10Samples, v10Loot 'start' -> s10Start, v10Tick -> s10Tick; fight.js fightHit -> s10DmgMul, s10Hit; fightDeath -> s10Kill (game.js now passes src); pdef.js pdEvasion, pdefOffer -> s10Evasion; ui.js quickStart uses s10_baseline.
- Risk: the start draft is now one card (the sample's weapon); old saves' META.profile 'human1' still works through Lab Bench and quick start paths.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 mutation cards (merged from agent-muts)
- Systems: upgrades, combat, weapons, mutations (new)
- Files: mutations.js (new), tests/mutstest.js (new), index.html, fight.js, combat.js, game.js, v10.js, arsenal.js, tests/pdeftest.js
- What: 33 mutation cards (body, weapon, damage type, trade-off, rare), 20 Catalyst cards (one per unstable reaction, offered once discovered: +25% reaction damage and a shorter lockout per rank) and 4 Concentration cards (a build-up bar fills faster and drains slower), all in the draft. Eight make up the starting pool. Can't Sit Still is not offered to the Overachiever.
- Save data: none (G.muts, G.cat, G.conc and w.wm10 are per run).
- Hooks: v10.js v10Tick -> mutTick, v10Draw -> mutDraw; fight.js fightHit -> mutDmg/mutBarK/mutHit, rxLocked -> mutRxLock, fightStatus -> mutSnareK; combat.js resolveHit a.barK; game.js killEnemy -> mutKill, hurtPlayer -> mutHurtIn/mutHurt, gainXp -> mutLevel, computeStatsInner -> mutWeaponStats, fireWeapon -> mutFire, projectile hit -> mutProjHit, updatePlayer speed -> mutSpeed; arsenal.js rateBonus -> mutRate.
- Risk: more multipliers in the hit path (balance not simmed yet); the bigger pool dilutes defence cards.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Boss defences, fork screens, smarter auto-pick
- Systems: bosses (boss10.js new), draft, ui, combat
- Files: boss10.js (new), bosses.js, game.js, fight.js, pdef.js, draft.js, ui.js, index.html, tests/bosstest.js (new), tests/drafttest.js
- What: bosses take their defence and damage type from the roster (Kidney Stone 6 Shell layers, Antibody Colossus 5, Chad Prime Evasion, Macrophage Queen Squishy, The Johnny Membrane); the old "+60% from Acid" weaknesses and type immunities are off, and each intro card now says what its defence is and what gets through it. The Queen stops summoning while 8 of her adds live. Fixed: a weapon or Feat fork screen crashed the game (no title). Every level draft now leads with one weapon upgrade. Auto-pick takes the weapon upgrade half the time.
- Save data: none.
- Hooks: bosses.js bossDamageMul skips weak/resist/noForce/weakAoe under V10; game.js boss 'summon' pattern -> boss10SummonOk and tags adds; ui.js openLoot -> draftTitle; ui.js autoTick weapon-upgrade preference.
- Risk: bosses lose their old soft spots, so some fights get longer; balance needs the sims (1 run: died wave 10, weapons up to Lv 10 with two forks).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 Feats (merged from agent-feats); draft groups
- Systems: feats (feats10.js new), stamina, draft, ui
- Files: feats10.js (new), index.html, game.js, stamina.js, v10.js, ui.js, draft.js, tests/featstest.js (new), tests/pdeftest.js, tests/mutstest.js
- What: three Feat slots under V10 and 24 Feats (gifts from the consciousness) with levels 1 to 5 and forks at 3 and 5; attacking Feats go through damageEnemy and cost stamina, utility gifts are free; 15 in the starting pool, 9 unlockable. The draft now weights card groups (Feats, mutations, Catalyst/Concentration, defences) as wholes, so big groups don't crowd out the others. mutstest no longer depends on the random start weapon.
- Save data: META.f10unl (unlocked later-pool Feat ids).
- Hooks: game.js newGame (F10_SLOTS), fireWeapon (case 'f10'), updateSpellList and featTap (f10Wait), featFire, computeStats (f10Stats), hurtPlayer (f10Hurt, f10HurtMul), killEnemy (f10Kill), gainXp (f10Xp); stamina.js featCost (f10Cost), sprintMul (f10Speed); v10.js v10Tick (f10Tick), v10Draw (f10Draw); ui.js Feat slot count.
- Risk: Level 5 Feat forks are first drafts (FEATS.md lists only level 3). THIS WAY and the eight sample Feats are not built yet.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Signature weapons and Shocking Impact (merged from agent-sigw)
- Systems: weapons, combat, draft, sigweap (new)
- Files: sigweap.js (new), v10.js, fight.js, game.js, sigs.js, toys.js, armoury.js, arsenal.js, index.html, tests/sigwtest.js (new), tests/v10test.js
- What: 21 favourite originals plus 5 Fire drafts return as one-damage-type, one-attack-type signature weapons (WEAPONS['s_*']) in the slot-draft pool (69 weapons with the matrix). A new dual Force/Static weapon, Rubbed the Wrong Way, alternates shots and sets off Shocking Impact, so all 21 reactions can now happen. Echo damage, pet/lure/chain caps and shared Extraction are enforced.
- Save data: none.
- Hooks: game.js makeSlot (id: def.sigOf || id, sid); v10.js v10Fire/v10Tick (sigwTick)/v10Draw (sigDraw)/v10Loot (v10Pool)/v10Switch; fight.js fightReact -> sigReact; sigs.js afterMine -> sigMine, bladeEats; toys.js toySrc/toyHurt echo, peekBoo, toothFire; armoury.js latch heal, Upchuck merge, bowling depth; arsenal.js Flail tip.
- Risk: signature slots keep the OLD weapon id in w.id (w.sid is the s_ id); undead are stationary turrets; Placental Siphon fires back as Force.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The Scientist and the consciousness, wired (merged from agent-voice) (v10.07)
- Systems: voice, ui, tutorials, narrator (show.js), combat
- Files: voice10.js (new), voice.js (helper renames: its `W` clashed with game.js), index.html, show.js, v10.js, intro.js, bosses.js, fight.js, meta.js, ui.js, tests/voicetest.js (new)
- What: under V10, run events produce Scientist and consciousness lines (at most one commentary line every 20 s, no repeats, Tier 2/3 lines followed by their recovery). Enemy and boss first sightings show one of their two lines. Statuses and defences get a one-line hint the first time they appear. The end screen shows the sample ID (1A, 1B...) and a Scientist line, plus the consciousness on a win. Spectral Combustion's first trigger gets the Tier 3 line.
- Save data: META.vxSt, META.vxEv added; run log entries gain sid.
- Hooks: show.js sysLine -> vxSysLine; v10.js v10Tick -> vxTick; intro.js startFoeIntro -> vxSight; bosses.js startBossIntro -> vxBossIntro; fight.js rxFired -> vxReaction, fightReact -> vxSpectral; ui.js showGameOver/showDishOver -> vxEnd; meta.js runSummary -> vxSid.
- Risk: the old narrator's idle, level, boss, low-health and death chatter is silent under V10. Celestial drops never happen (weight 0), so that line has no trigger.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Field Guide: the 21-reaction chart
- Systems: combat (fight.js), help (inspect.js)
- Files: fight.js, inspect.js, tests/fighttest.js
- What: under V10 the Field Guide's reaction chart is the 7 by 7 grid of the 21 unstable reactions; each stays a question mark until set off once, then names itself and says what sets it off and what it does. Damage type cards list their six partners the same way.
- Save data: none (reads META.rxSeen).
- Hooks: inspect.js rxChartHtml -> rxChart10, INSPECTOR.cell -> rxCell10, inspectGuideHtml and the type card's REACTS WITH row use RX10_ORDER/rx10Pair.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Arcade-only look and one type palette (merged from agent-look)
- Systems: ui, render, damage types, look10 (new)
- Files: look10.js (new), index.html, data.js, settings.js, render.js, ui.js, tutorial.js, v10.js, fight.js, pdef.js, mutations.js, feats10.js, newfoes.js, STYLE.md, tests/looktest.js (new)
- What: under V10, Arcade is the only view (View setting hidden, Lab grey and eyepiece never run, the arcade offer is gone). The seven damage types share one palette (Acid shocking pink, Mucus green, Soul purple, Static yellow, Blood red, Fire orange, Force white), including acid pools and crypts.
- Save data: none (SET.view is ignored under V10).
- Hooks: render.js l10Swap(ELEM_SWAP); ui.js settings row filter honours d.hide; tutorial.js viewOffer skips under L10; settings.js viewArcade/hide.
- Risk: Acid and Mucus colours change wherever the old greens were hard-coded; RAW_COL drawing (levels) bypasses the remap.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Role-based wave encounters (merged from agent-waves)
- Systems: waves, enemies, waves10 (new)
- Files: waves10.js (new), campaign.js, index.html, tests/waves10test.js (new), tests/run.sh
- What: under V10 the Petri Dish's 20 waves draw from WAVES10: waves 1 to 4 teach Chaser, Sprinter (Evasion), Shooter and Tank (Squishy) alone; then Thorns, Shell, Membrane and each new enemy (Mosquito, Static Sock, Matchstick, Stress Ball, Birthday Candle, Trapped Wind) are met alone or beside familiar ones, with ENEMY_DESIGN 10's pairs and a big mix at wave 19. Per-wave cap on live enemies (summons count), no stacked disruptive statuses or Pool-makers, caps on live shooters and Pool-makers. Boss waves and CAMP budgets unchanged.
- Save data: none.
- Hooks: campaign.js campBegin -> w10Fresh; campSpawnMob -> w10Spawn; campSpawn -> w10Max.
- Risk: wave composition changes for waves 1 to 19 (sims comparable: waves 9 and 7 vs 10 and 5 before, 2 runs each).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The eight samples' Unique Feats and First Contact (merged from agent-ufeats) (v10.08)
- Systems: feats, samples, combat
- Files: feats10.js, fight.js, tests/ufeatstest.js (new)
- What: each sample starts with its Unique Feat in Feat slot 1: Standard Procedure (Force pulse), Personal Best (Static wake sprint), Second Wind (Blood drain heal, bigger when low), Pulling Strings (marks the toughest: Corrosion on it, Soul on its entourage), Shrink Wrap (Snare ring, then Acid Pools), Reply All (fills a Burn bar, Static arcs spread burn), Recount (Possess up to 6 for 3 s, then each takes a delayed hit), First Contact (the Other Half shifts type and sets off reactions on up to 8 statused enemies, no damage). Each has level 3 and 5 forks (first drafts). Never drafted for other samples.
- Save data: none.
- Hooks: none new in shared files; fight.js gains fightReactAs and inert src.feat guards.
- Risk: Unique Feat numbers and forks are untuned.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: new enemies ran their timers at double speed
- Systems: enemies (newfoes.js), tests
- Files: newfoes.js, game.js, v10.js, tests/dupetest.js (new), tests/run.sh
- What: newfoes.js reused three function names from the old newfeats.js (nfTick, nfKill, nfDraw); the later file won, so game.js ran the new-enemy tick twice a frame (wax walls, trails, Bursts and Mosquito timers at double speed) and render.js drew them extra times. They are now nf10Tick, nf10Kill, nf10Draw, nf10Hit. New dupetest fails if any two loaded scripts declare the same global; the v10 tests are now in run.sh's full list.
- Save data: none.
- Hooks: game.js damageEnemy -> nf10Hit, killEnemy -> nf10Kill, update -> nf10Tick (V10 only); v10.js v10Draw -> nf10Draw.
- Risk: new enemies' timings halve back to their designed values (they were too fast before).

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 v10 difficulty knob (balance)
- Systems: enemies, bosses, rivals, terrain, waves
- Files: boss10.js, game.js, bosses.js, rivals.js, campaign.js, terrain.js
- What: one tuning object, V10_DIFF in boss10.js, scales v10 enemy health (0.65) and damage (0.6), boss health (0.45, including wave mode's boss formula), rival champions' bullets and contact (0.45) and acid terrain damage to you (0.5). v9's enemy curve was tuned for v9's far bigger builds; with v10's leaner builds the bot died at waves 5 to 9 and never won.
- Save data: none.
- Hooks: game.js makeEnemy, bosses.js spawnBoss, campaign.js campBoss, rivals.js (bullets, contact), terrain.js acid -> V10_DIFF.
- Risk: balance in flux. Sims so far (4 runs each, deaths): before 9/5/8/9; first pass 11/7/8/5; with rivals scaled 10/13/10/8; this pass still running.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 Fix: terrain.js failed to load (runs crashed at start)
- Systems: terrain, tests
- Files: terrain.js, tests/dupetest.js
- What: the previous balance commit put a comment in the middle of the acid-crypt line in terrain.js, cutting off its closing brace, so the file didn't load and every new run crashed. Fixed. dupetest now also syntax-checks every loaded script, so a file that won't parse fails the suite.
- Save data: none.
- Hooks: none.
- Risk: none.

### Folded from claude-bold-hypatia-jadt4w: 2026-10-18 The 24 weapons and the branch engine (weapons24.js)
- Systems: weapons, draft, weapons24 (new)
- Files: weapons24.js (new), sigweap.js, draft.js, game.js, fight.js, v10.js, index.html, tests/weapons24test.js (new), tests/drafttest.js, tests/run.sh
- What: the game offers only the 24 weapons of BASE_WEAPONS.md (10 foundations, 14 signatures), renamed (Standard Issue, Red Flagship, Family Ties, Skill Issue, There Is No Spoon, Ewww Gross, Sister Cousin, Eggs, Chest Burster, The Runs...) and re-typed (Nappy Mines Fire); every other weapon is archived (Lab Bench only). Switched at Birth retires. Weapon forks move to Lv 3 (pick one of three promises), Lv 6 (the promise's two cards plus its wildcard) and Lv 10 (one of three masteries); the cards come in wup1.js...wup6.js. Rubbed the Wrong Way is archived, so Shocking Impact has no weapon again.
- Save data: none.
- Hooks: game.js computeStatsInner -> wupStats, fireWeapon -> wupFire, killEnemy -> wupKill; fight.js fightHit -> wupDmgMul, wupHit; v10.js v10Tick -> wupTick; draft.js forkCards -> wupForkCards; sigweap.js v10Pool -> W24_IDS.
- Risk: until the card files land, Lv 3/6/10 fall back to modifier forks.

### Folded from ccr-caa43b42-e4m6sc: 2026-10-18 Soul damage renamed Alien (v10.20)
- Systems: damage types, chemistry, ui, weapons, samples, docs
- Files: data.js, chem.js, mutations.js, tutorial.js, glossary.js, fight.js, wup3.js, wup6.js, voice.js, index.html and others (text only), tests, GAME_GUIDE.md, redesign docs/*
- What: the "Soul" damage type is now "Alien" in every player-facing string, comment, test message, guide and redesign doc. Reaction names follow (Alien Rot, Alien Erosion). Pun names stay: Soulmate Signal, Old Soul, Soul Searching, Soul Purpose, Soul Scatter, Twin Soul.
- Save data: none. Internal id stays `soul` (ELEMENTS.soul, `bars.soul`, `t_soul`, `soulrot`, `v_soul_proj`), so saves and META.offered are untouched. Redesign decision 19 now plans `soul` -> `alien` at the id rename (clash check: sample id `alien`, enemy id `alien`, family `alien` in weapons24.js are separate namespaces).
- Hooks: none.
- Risk: any code that compares display names to the string 'Soul' (needType display arg only; checked).

### Folded from ccr-f38bcc1f-1rc8ck: 2026-10-18 Sandbox: no Acid Crypts or big hazards; log head fixed (v10.20)
- Systems: sandbox, terrain, run log
- Files: terrain.js, bighaz.js, sandbox.js, wstats.js, meta.js, tests/sbtest.js
- What: Sandbox maps have no Acid Crypts and no big hazards (Plughole, Hot Flush and so on), which were doing 25 to 65% of the damage and killed one run. The run log's Sandbox line now counts weapons properly (was "undefined weapon") and drops the meaningless "vs level curve".
- Save data: none.
- Hooks: terrain.js makeTerrain and bighaz.js makeBigHaz -> sbOn.
- Risk: none outside Sandbox.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Autofire toggle and FIRE buttons; Rewind moves left (v10.16)
- Systems: manual fire (new), settings, ui
- Files: manualfire.js (new), game.js, settings.js, style.css, index.html, tests/mftest.js (new)
- What: Settings > Game > Autofire. OFF gives each weapon a round FIRE button, stacked up the right side; hold to fire, tap for one shot. Orbit, wake, siphon and heat weapons stay automatic. Rewind and the ability button (#side) move to the bottom left in every mode (landscape: right of the HUD column).
- Save data: SET.autoFire (default true).
- Hooks: game.js updateWeapon -> mfGo, and w.mfTap cleared after a shot.
- Risk: anything else placed bottom left now shares the corner with Rewind.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Sandbox: + mount, branch mark; level number in Immersive (v10.15)
- Systems: sandbox, ui, render
- Files: sandbox.js, ui.js, render.js, tests/sbtest.js
- What: one Sandbox card. You start with one weapon; an empty + mount on the HUD opens a weapon pick whenever tapped (up to 3). Level-ups no longer open weapon upgrades in Sandbox: every 4th level banks one, and a faint branch mark on a ready weapon's slot spends it. Immersive mode shows your level as a small faint number top left (every mode).
- Save data: none.
- Hooks: ui.js slot tap -> sbSlotTap, refreshHud -> sbSlotShow/sbSlotMark; render.js drawHud level number (Immersive).
- Risk: none outside Sandbox apart from the Immersive level number.

### Folded from ccr-b8d66d4a-dmxu9z: 2026-10-18 Sandbox: weapons-only developer mode (v10.14)
- Systems: sandbox (new), lab-bench, draft, ui, samples
- Files: sandbox.js (new), game.js, v10.js, ui.js, samples10.js, index.html, tests/sbtest.js (new)
- What: DEVELOPER section (tap the samples title five times; the switch was lost with the v10 samples screen) gets Sandbox with 1, 2 or 3 weapons. It runs on the Lab Bench without god mode: a slow enemy stream on a quarter-speed difficulty clock, HEAT +/- bar on the HUD (35% more spawns and +90 s of clock per step, down to -3), only weapon picks and weapon upgrades (shown in the weapon draft screen), no power-ups, chests, Feats, mutations, defences, bosses or rivals.
- Save data: none (localStorage sd_dev reused).
- Hooks: game.js PT -> sbPT, newGame -> sbInit, director -> sbSpawn; v10.js v10Box -> sbBox, v10Loot -> sbLoot; ui.js openLoot -> sbDraftKind, openDraft -> sbDraftHead (wraps the kicker/title/sub lines), renderDraft -> sbDraftInfo; samples10.js s10Samples -> sbCards, sbWire.
- Risk: none outside Sandbox (every hook is gated on G.debug.sb or UI.sample s010).

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Merge v9.28 autorun and autoaim revision (v10.04)
- Systems: autorun, weapons, ui (incoming, see changes/claude-festive-allen-xmea8i.md), v10
- Files: merge of claude/festive-allen-xmea8i; tests/loadouttest.js (runs with V10_OFF)
- What: the v10 test build now has v9.28's targeting (TOUGHEST, FRAGILEST, a second "Then" directive) and reworked autorun modes (autorun.js). v10 weapons keep their NEAREST and CLUSTER defaults.
- Save data: none.
- Hooks: none new; v10 hooks and v9.28's aimDir/arMode hooks sit side by side in game.js and ui.js.
- Risk: loadouttest now tests the old build only (V10_OFF), since v10 level boxes need v10 weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Regular mode: a switch every level-up and DNA strand (v10.03)
- Systems: v10
- Files: v10.js
- What: in Regular Mode every level-up box and every DNA strand (chest box: pickups, events, achievements) opens as one Switched at Birth card, replacing the once-a-minute limit. Wave Mode is unchanged (one a wave).
- Save data: none.
- Hooks: none.
- Risk: many more switches in regular mode; skipping is the only way to keep a weapon.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 Wave mode and regular mode (v10.02)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: the samples screen offers Human Sample 1 in Wave Mode (s002) or Regular Mode (s001, race to the egg). In regular mode Switched at Birth comes once a minute instead of once a wave.
- Save data: none.
- Hooks: none.
- Risk: regular mode not balanced for the new weapons.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 One Switched at Birth card a wave (v10.01)
- Systems: v10
- Files: v10.js, tests/v10test.js
- What: Switched at Birth now offers one card, and only once a wave (the first level-up box after the wave; the wave's other level-up boxes are dropped). Reroll still swaps the card.
- Save data: none (run state `G.v10sw`).
- Hooks: none.
- Risk: far fewer upgrades a run; levels past the first in a wave give nothing.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 test build: Human Sample 1, 42-weapon matrix, Switched at Birth only (v10.00)
- Systems: v10 (new), weapons, loot, chemistry, ui, meta
- Files: v10.js (new), game.js, chem.js, sigs.js, ui.js, render.js, meta.js, index.html, tests/v10test.js (new)
- What: the game is now a stripped test build. One sample card (Human Sample 1, wave mode, no trait or ability). Weapons are the 42-cell matrix from the user's spec (Contact, Projectile, Beam, Spread, Burst, Pool x Force, Acid, Static, Mucus, Blood, Soul, Fire); start draft 4 of 42, Lv 8/22 drafts 3 more (no shared attack type). Level-ups offer only Switched at Birth (same attack type, new damage type); all other boxes are dropped, so no Feats, mutations, gene transfer, relics, combos or curses. Fire (`flame`) is new: Burning, 3 s damage over time. Old automatic reactions, overloads, triples and terrain reactions are off. Old content is gated, not deleted (`window.V10_OFF = 1` restores it).
- Save data: META now lives in `sd_meta10` (full wipe); `sd_best`, `sd_runs`, `sd_live` cleared on first v10 boot. `sd_meta` left untouched.
- Hooks: game.js genLoot -> v10Loot, main loop -> v10Box, fireWeapon -> v10Fire, update -> v10Tick, newGame skips junkStart, newStats elem.flame; render.js -> v10Draw; chem.js applyElement -> v10Burn and `if (V10)` reaction guards; sigs.js applyAdapt v10 contact reach; ui.js openSamples -> v10Samples, playBtn skips Level 0, quickStart uses human1/s002; meta.js META_KEY.
- Risk: most of the old test suite assumes old content and will fail with V10 on; `quick` and `v10test` pass. Balance untested (beams and Blood Pool run hottest). Feat slots show empty.

### Folded from claude-zealous-clarke-i26iot: 2026-10-17 v10 combat rework: plan and decisions
- Systems: none yet (docs only)
- Files: NOTES.md (v10 section); merged `redesign docs/` from claude/charming-brown-51v3ev
- What: agreed approach (keep engine, rebuild combat core, restart content) and the step-2 decisions: literal Fire, Soul = mind control, 5 defences no traits, full save wipe.
- Save data: none yet (v10 will move to a new META key).
- Hooks: none.
- Risk: none.

### Folded from claude-festive-allen-xmea8i: 2026-10-17 Autorun and autoaim revision (v9.28)
- Systems: autorun (new), weapons, ui
- Files: autorun.js (new), game.js, data.js, ui.js, loadout.js, armoury.js, playpen.js, arsenal.js, toys.js, td.js, twins.js, genes.js, intro.js, index.html, tests/autoruntest.js (new), tests/loadouttest.js, tests/sim/wave20.js (`--move <id>`), tests/run.sh, tests/tools/guide.js
- What: Targeting: STRONGEST is now TOUGHEST (max health, plus 10% per point of armour), WEAKEST is now FRAGILEST, HIGHEST HEALTH is gone (its five weapons now default to TOUGHEST), SHOOTERS FIRST ranks shooters > healers > summoners, and RANDOM/REVENGE sit at the end of the list. Every weapon and Feat can take a second "Then" directive that breaks near-ties and takes over when nothing fits the first (Tackle Box loadout and weapon page; HUD shows `NEAR›FRAG`). RANDOM keeps a victim 1.5 s; FURTHEST and CLUSTER keep theirs unless a new one is 15% better. Autorun: KITE holds 240 to 360 from the nearest enemy; COLLECT skips pickups with enemies on or near the way; ORBIT picks one cluster and keeps it; HUNT keeps one target (boss > rival > elite > nearest, no longer the first weapon's directive); HOLD returns to where it was chosen; NEST only grabs pickups near the egg and is not offered in campaign levels (it used to steer you towards an egg 10 million units away).
- Save data: none (slot field `w.dir2` is run state only; `G.ar` holds autorun memory)
- Hooks: game.js targetScore -> aimPair; weapon fire -> aimSticky(acquire(aimDir(w))); every acquire(w.dir)/acquireMany(w.dir) -> aimDir(w) (game.js, arsenal.js, armoury.js, playpen.js, toys.js); game.js autoSteer -> arMode, arGoal (its old per-mode blocks moved into autorun.js); ui.js/loadout.js mode pickers -> moveModes.
- Risk: bot balance per autorun mode. Sims (`wave20.js 4 mortal --move <mode>`, old code then new): KITE 3/4 -> 2/4, ORBIT 1/4 -> 3/4, HUNT 3/4 -> 2/4, HOLD 2/4 -> 2/4; 9/16 both ways, too few runs to call any single mode; weapons that defaulted to HIGHEST HEALTH (Tapeworm Seeder, Due Date, Leeches, Umbilical Cord, Heel Prick) now pick by durability, not health left; RANDOM-targeting weapons no longer spray a new enemy every shot.

### Folded from claude-great-maxwell-2ar9sg: 2026-10-17 Voice and tone guide
- Systems: docs only
- Files: voice_and_tone.md (new)
- What: Added the voice, tone and humour guide (composure ladder, progressive disclosure, per-screen rules, existing examples).
- Save data: none
- Hooks: none
- Risk: none
- CLAUDE.md now points sessions at voice_and_tone.md before any player-facing copy.
- voice_and_tone.md: added the Lab Tech persona (the mundane-versus-life-and-death gap) and the four ways composure breaks (excited, supportive, irritated, disbelieving).
- voice_and_tone.md: added "The world" (setting, sample naming 1A/1B, the Scientist and his guardrails, decision table, optional dials). Persona renamed from Lab Tech to the Scientist. Flagged lines that imply an audience or colleagues.
- voice_and_tone.md: letter drift decided (Scientist grows slightly more invested across runs of one line, via events only).
- voice_and_tone.md: wordplay is now a core technique (the corrupted phrase, the borrowed disclaimer) with Premature Evangelation, Projectile Dysfunction and 98% effective as benchmarks. Removed the earlier "avoid puns" guidance.
- voice_and_tone.md: added the third signature technique, the innocent clinical term (Flaccid as the model).

### Folded from claude-charming-brown-51v3ev: 2026-10-17 Combat design docs imported
- Systems: docs only
- Files: redesign docs/ (COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, VOICE_GUIDE.md, tables/*.csv, README.md)
- What: Notion combat-rework exports unpacked into readable docs; remaining-updates hand-off merged as COMBAT_MATRIX.md section 9. Defences purged to the canonical five (Squishy, Membrane, Shell, Thorns, Dodge); voice owner fixed as the pre-incarnate consciousness.
- Save data: none.
- Hooks: none.
- Risk: none (no code touched).

### Folded from claude-fervent-galileo-66jpd2: 2026-10-16 Snot Bubble, player Lubricated, combos batch 2 design (not shipped: APK build blocked)
- Systems: chemistry (player statuses), enemies
- Files: pstatus.js, foes3.js, foes2.js, chem.js, game.js, tests/psttest.js, tests/f3test.js
- What: Lubricated joins Snotty, Sick and Soaking wet as a player status (3 s a hit, 6 s cap): you lose grip and skid wide in turns, and a Static hit on you then lights the grease (GREASE FIRE: x1.3 and an acid-style burn, grease gone). Grease Balls now leave a 5 s oil slick behind them (standing in it lubricates you) and lob a slow oil glob every 6 s. New enemy Snot Bubble (from 120 s, cap 4): swells with each hit; an early pop splashes neighbours with Snotty, a late pop (4+ hits) sticks every enemy within 170 and you if close; Static on it is POPPED (instant, harmless to you).
- Save data: none
- Hooks: game.js trac -> pstGrip; chem.js chemPlayerZones skips z.foe slicks for the speed boost; foes2.js foes2Dmg -> foes3Dmg, foes2Kill -> foes3Kill.
- Risk: Grease Ball is a little more dangerous (slick plus glob); win rate was not re-simmed after it. Wave sim on v9.27 before these changes: 3 of 20 mortal bot wins (15%), against 3 of 12 (25%) before player statuses; too few runs to call it a regression.

## v9.27 (versionCode 277)
- Systems: chemistry, enemies, combos, weapons, render, ui, sequences, school, tutorial, tools, tests, docs
- Files: see the folded entries below.
- What: merge of six session branches into `main`: player statuses and two enemies that use them (`claude/intelligent-keller-n89f5p`, its v9.25 and v9.26), combos batch 1 (`claude/sweet-gauss-q7pan5`), the dead stain-grant purge (`claude/exciting-ramanujan-56w3kr`), developer cards on fresh saves (`claude/youthful-pasteur-nt0tn6`), roomier draft screens (`ccr-189e2988`, its v9.25) and the Weapon Atlas builder (`ccr-618305e3`).
- Save data: META.combos gains eight combo ids; META.pstainOff no longer written. Otherwise none.
- Hooks: see the folded entries. Merge conflicts were only in NOTES.md, run.sh, guide.js, ARCHITECTURE.md, versions and game.js update (pstTick kept, grantsTick dropped).
- Risk: full suite on the merge: 90 of 92 passed; the two failures were test-side and are fixed (overtest still clicked the removed stain toggle; f3test now clears terrain so a nodule can't block the glob or sneeze).

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Phlegm Hocker and Hayfever Cell (v9.26)
- Systems: enemies, chemistry
- Files: foes3.js (new), pstatus.js (pstGive), chem.js, index.html, tests/f3test.js (new), tests/run.sh, tests/tools/guide.js
- What: two new enemies from ENEMY_IDEAS.md. The Phlegm Hocker lobs Mucus globs (a bigger Snotty dose); Water on it (GARGLED) turns its next 3 globs into rinse puddles. The Hayfever Cell winds up and sneezes a cone that gives you whichever of Snotty, Sick and Soaking wet it carries; Water then Cooties on it (ANTIHISTAMINE) makes it sneeze Sick onto its neighbours.
- Save data: none (new ENEMY_INTRO ids hocker and hayfever go in META.seen; META.foeRuns gains them).
- Hooks: chem.js applyElement (after chemFoe) -> foes3Chem.
- Risk: two more types in the wave draw pool (punisher cap 6 each); new REACTIONS ids gargled and antihistamine.

### Folded from claude/intelligent-keller-n89f5p: 2026-10-16 Player statuses from typed enemy bullets (v9.25)
- Systems: chemistry, enemies, render, tutorial
- Files: pstatus.js (new), game.js, render.js, chem.js, newfeats.js, index.html, tests/psttest.js (new), tests/tools/guide.js
- What: Antibody, Cytokine Caster, Diatom, Killer T-Cell and Booster bullets now carry a damage type (white mark on the speck) and give you Snotty (slower), Sick (slow drain, half healing) or Soaking wet (Static bullets hit 60% harder; washes off snot and acid). Status chips with timers and first-time cards; your Water puddles and Fecal Transplant rinse them off.
- Save data: none (new STATUS_INTRO keys SNOTTY, SICK, SOAKING WET go in the existing META.seenSt).
- Hooks: game.js eBullet -> pstElem, hurtPlayer -> pstHurtMul + pstHit, healPlayer -> pstHeal, player speed -> pstSpeed, update -> pstTick; render.js chips -> pstChips, enemy bullets -> pstBulletMarks; chem.js chemPlayerZones -> pstOn/pstClear; newfeats.js fecaltransplant -> pstClear.
- Risk: early runs are a little harder (Antibody is the first shooter, from 35s); wave-sim deaths were in line with the baseline over 4 runs. Bosses unchanged.

### Folded from claude-sweet-gauss-q7pan5: 2026-10-16 Combos batch 1 for the Armoury and Playpen weapons (v9.24, not shipped)
- Systems: combos, weapons
- Files: combos3.js (new), combos.js, playpen.js, index.html, tests/combo3test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: eight new Weapon Combos (Drive-By Pramming, One-Two Delivery, Live Mains, Auntie's Revenge, Water Delivery, Locker Room Towel, Packed Lunch, Guthrie Test), one per sequence. They fuse through the usual ceremony and bonus mount, and use the standard Switched at Birth twist table. Water Delivery pairs Waters Breaking (Chonker) with Bath Bomb (Good Eater), so it needs a splice. Live Mains' overload is a held stun, not the Static reaction. "Natural synergy" lines from the brief are not implemented (only twists for swapped damage types exist).
- Save data: META.combos gains eight ids (c_driveby, c_onetwo_deliv, c_livemains, c_aunties_revenge, c_waterdelivery, c_towel_snap, c_packed_lunch, c_guthrie_test).
- Hooks: combos.js comboFire -> combo3Fire, comboHit -> combo3Hit, comboTick -> combo3Tick, comboLash -> combo3Lash; playpen.js penEnd -> combo3Pram, penFire juicebox -> combo3Carton and combo3Boil.
- Risk: Drive-By Pramming spawns many Spitballs (projectile cap applies); Packed Lunch widens Upchuck puddles for 3s; no new sounds (existing sfx reused).

### Folded from claude-exciting-ramanujan-56w3kr: 2026-10-16 Purge dead stain-grant code
- Systems: render (colour switches), ui, school, show
- Files: grants.js (142 to 33 lines), game.js, render.js, ui.js, school.js, ARCHITECTURE.md, tests/tools/guide.js, tests/schooltest.js
- What: removed the retired floating research grant (grantsStart/Tick/Due/Take, drawGrants, pause-menu list and toggles, G.grant). grants.js now holds only the live Lab/Arcade colour switches.
- Save data: none (META.grants/grantOff left in place, harmless).
- Hooks: removed grantsStart (game.js), grantsTick (game.js), drawGrants (render.js), grantsHtml/grantsBind (ui.js).
- Risk: tutorial.js 'stains' card text still mentions grants (unreachable now).
- Also: deleted the unreachable `stains` tutorial card (tutorial.js). Risk: none.
- Also: removed the pause-menu Stains lists and permanent-stain toggles (ui.js stainsHtml, data-pst), .li.stain CSS, staintest. Save data: META.pstainOff no longer written; META.pstains still read in game.js (old saves keep their stains, now with no off switch).

### Folded from claude-youthful-pasteur-nt0tn6: 2026-10-16 Fix devall test on fresh saves
- Systems: ui, debug, school
- Files: ui.js, debug.js
- What: Developer mode's Unlock Everything and Reset Starters cards now render on the fresh-save samples screen (Level 0 only), so `devall` passes. Unlock Everything also marks Level 0 as skipped (`META.school`) so the full screen shows afterwards.
- Save data: none added (sets existing `META.school`).
- Hooks: none.
- Risk: none for real players; the dev cards only show with `sd_dev` on.

### Folded from ccr-189e2988-a6jy7f: 2026-10-16 Roomier draft and sequence screens (v9.25)
- Systems: ui, sequences
- Files: style.css, game.js
- What: the starter weapon draft offers at most 4 weapons. Draft tabs wrap in an even grid; sequence select and the draft have more padding and spacing.
- Save data: none
- Hooks: none
- Risk: none (spacing only; the starter draft drops the 5th wildcard when a sequence already has 4 weapons)

### Folded from ccr-618305e3-li7ynm: 2026-10-16 Weapon Atlas builder saved in the repo
- Systems: tools
- Files: tests/tools/atlas/atlas.js (new), tests/tools/atlas/template.html (new), ARCHITECTURE.md
- What: `node tests/tools/atlas/atlas.js` rebuilds the Weapon Atlas page (all weapons, sequences, upgrade ladders, combos, pairings, reactions, twists, play styles) from the live game into tests/out/weapon-atlas.html, ready to republish to the Atlas artifact. Atlas republished for v9.24 (78 weapons).
- Save data: none.
- Hooks: none.
- Risk: none (tool only, not loaded by the game).

## v9.24 (versionCode 274)
- Systems: feats, chemistry, upgrades, render, ui, audio, data, tests, docs
- Files: `newfeats.js` (new), `data.js`, `spellfork.js`, `stamina.js`, `icons.js`, `chem.js`, `typefx.js`, `game.js`, `render.js`, `ui.js`, `audio.js`, `sigs.js`, `index.html`, `meta.js`, `android/app/build.gradle`, `tests/newfeattest.js` (new), `tests/newfeatshot.js` (new), `tests/run.sh`, `tests/sim/wave20.js`, `tests/tools/guide.js`, `GAME_GUIDE.md`, `FEAT_IDEAS.md`, `ENEMY_IDEAS.md` (new, from `ccr-9082b737`), `NOTES.md`, `ARCHITECTURE.md`
- What: merge of this session's v9.23 (all 36 Feats from `FEAT_IDEAS.md`, each with two Lv 4 paths, in loot, the Tackle Box and a new Field Guide FEATS tab; the Bloody Show three-type reaction, Mucus + Blood + Static) with main's v9.23 (the Playpen) and `ccr-9082b737` (enemy ideas doc). Also fixes a crash: Rubber Johnny's spines have no weapon and broke `projHit`/`projEnd`. Two branches used v9.23, so this combined build is v9.24.
- Save data: none
- Hooks: game.js fireWeapon -> nfFire, update -> nfTick, updateEnemies -> nfSteer, shootPattern -> nfNoFire/nfAim, enemy bullets -> nfBullet, hurtPlayer -> nfHurtMul/nfLethal, updatePlayer -> nfSpeed, updateSpellList -> nfWait, featTap -> passive Feats, damageEnemy -> nfDamaged, killEnemy -> nfKill; render.js -> nfDrawUnder/nfDrawOver/nfYouAlpha and the Bloody Show squeeze; ui.js Feat slot bar -> w.nfCharge, Field Guide FEATS tab; audio.js -> G.musCutT; sigs.js projHit/projEnd skip projectiles with no weapon.
- Risk: 36 more Feats dilute Feat drafts (novelty weighting rotates them). Wave sims: 27% bot wins before, 36% with a new Feat forced in; Mosquito, Fecal Transplant, Brown Fat and Fertile Window sit at 50%. Hooks in `updateEnemies`, `shootPattern`, enemy bullets, `hurtPlayer`, `damageEnemy` and `killEnemy` all run through `G.nf` (absent until a new Feat is performed). No save-data changes.

### Folded from ccr-e8ca6f23-vawkv2: merge-friendly change logging (2026-10-16)
- Systems: docs
- Files: CLAUDE.md, ARCHITECTURE.md (new), CHANGELOG.md (new), changes/ (new)
- What: per-session change-log fragments, a merge playbook, start-of-session overlap check, and the system architecture map.
- Save data: none
- Hooks: none
- Risk: none

## v9.23 (versionCode 273)
- Systems: weapons, combos, chemistry, loot
- Files: playpen.js (new), index.html, chem.js, data.js, WEAPON_IDEAS.md, tests (armtest)
- What: the Playpen, 20 more weapons from `WEAPON_IDEAS.md` (78 in all), flagged `armoury: 1, pen: 1`. Merged `ccr-618305e3` (the Armoury) and `ccr-d9934b1d` (four weapons retyped for an even damage type spread).
- Save data: none
- Risk: new weapons in the general pool shift loot odds; armtest guards the play-style and damage type spread.
