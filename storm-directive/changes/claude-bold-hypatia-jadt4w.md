## 2026-10-18 Weapon UI colours match damage types (v10.22)
- Systems: render, ui
- Files: icons.js, seqsel.js, seqreveal.js, draft.js
- What: weapon and Feat icons, names and borders in every menu now use the exact damage type colour from `ELEMENTS` (`ELEM_UI` is derived from it instead of its own slightly different palette; Blood was pink-red in menus but claret in the world). Sequence select and the sequence reveal colour each exclusive weapon by its own damage type, not the sequence colour; Lv fork cards use the type colour, not the weapon's own shade.
- Save data: none.
- Hooks: none.
- Risk: menu colours shift slightly (Blood darker, Force brighter); the in-world `elem` glow in render.js reads `ELEM_UI`, so it now matches shot colours. seqtest, revealshot and colourtest already failed on this branch before the change.

## 2026-10-18 Modifier cards with ranks; Switched at Birth back for every weapon (v10.21)
- Systems: modifiers, draft, damage types
- Files: modcards.js (new), modifiers.js, draft.js, index.html, tests/modcardtest.js (new), tests/modstest.js, tests/run.sh
- What: the 20 v10 modifiers (Notion v10+ rows) are now level-up draft cards for a weapon whose attack type fits: 3 different a weapon (one Delivery), and taking one again ranks it up to Rank 3 with bigger numbers (more jumps, bounces, bodies, pets and so on). Switched at Birth is offered again for all 24 weapons, signatures included: a random weapon gets a random other damage type and keeps its level, upgrade branch, modifiers and mutations; the card is Rare and never turns up two drafts running. Mutations already matched the Notion v10+ rows, so they are unchanged. No old v9 modifiers or mutations added.
- Save data: none (run state only: w.m10 may now hold 3 copies of any modifier; G.draftN, G.sabAt).
- Hooks: draft.js draftCards -> modDraftCands (replaces the v10Switch line while modcards.js loads); draft.js groupW gains mod.
- Risk: draft share shifts (a new mod group at weight 1.1, plus Switched at Birth at 0.6). Signature weapons switched to another type may still show some old-type effects their sigFire hard-codes. Branch ccr-caa43b42 (Soul renamed Alien) touches damage types: merge order matters for card text only.

## 2026-10-18 MY OWN MESS targeting (v10.20)
- Systems: autorun (autoaim), weapons, ui
- Files: aimat.js (new), game.js, autorun.js, ui.js, loadout.js, index.html, tests/aimowntest.js (new), run.sh, tools/guide.js
- What: new targeting directive MY OWN MESS (short MESS, id `ownmess`): a weapon or Feat shoots the enemy nearest another of your weapons' stuff (black hole, puddle, a lob's landing spot, pets, orbit blades, turrets, Feat effects). Pick whose mess (ANY MESS = your biggest thing in range, a named weapon or Feat, or itself) on the weapon page or in the LOADOUT target grid. Works as the primary or the tie-breaker. No mess about: nearest.
- Save data: none (`w.aimAt` lives on the run's weapon slot).
- Hooks: game.js targetScore case 'ownmess' -> aimOwnScore; acquire/acquireMany -> aimOwnSet; updateWeapon, updateSpellList, featTap -> AIMAT.w = w; autorun.js aimKey case 'ownmess' -> aimOwnKey; ui.js armoury targeting and loadout.js target grid -> aimOwnPick/aimOwnBind. DIRECTIVES gets its entry by push from aimat.js.
- Risk: the id must stay longer than 3 letters (targetScore only reads strings over 9 characters as pairs). Homing retargets and turrets using it borrow the last-fired weapon's aim point. Echo copies aim at ANY MESS.

## 2026-10-18 Sandbox HUD: kills, kills a second, DPS (v10.19)
- Systems: sandbox
- Files: sandbox.js
- What: the Sandbox HEAT bar gains a second line: KILLS n | kills a second | DPS (all your damage), both averaged over the whole run so far. The HEAT buttons now refresh it at once (a comment had swallowed the call).
- Save data: none.
- Hooks: none.
- Risk: none (Sandbox only). Touches the Sandbox session's file: merge with care.

## 2026-10-18 Merge the Sandbox session again: autofire toggle, + mount, banked upgrades (v10.17)
- Systems: sandbox, ui
- Files: merge only (manualfire.js arrives; ARCHITECTURE.md script order keeps both wstats and manualfire)
- What: brings in ccr-b8d66d4a-dmxu9z's two newer commits (one Sandbox with + mount and banked upgrades; autofire toggle with per-weapon FIRE buttons, Rewind on the left). Both branches had shipped v10.16, so this build is v10.17.
- Save data: see changes/ccr-b8d66d4a-dmxu9z.md.
- Hooks: see that fragment.
- Risk: none beyond that fragment's.

## 2026-10-18 Per-weapon telemetry in the run log (v10.16)
- Systems: runlog, weapons, sandbox
- Files: wstats.js (new), meta.js, game.js, ui.js, index.html, tests/wstatstest.js (new), tests/run.sh
- What: each run now logs, per weapon slot: seconds held, dps, uptime (0.25 s windows with damage), distinct targets per active window, projectile hit rate, average hit distance, kills, share of damage on bosses, when each tier was taken, plus the weapons offered and picked in start/slot drafts. runText adds one ` wpn` line per weapon and an ` offers:` line (existing lines unchanged). Sandbox runs are now live-saved (closed runs get logged) and marked `[SANDBOX heat N]`. The run log keeps the last 60 runs (unchanged).
- Save data: `sd_runs` entries gain a `ws` object; the log is trimmed to 60 on load and save.
- Hooks: game.js damageEnemy -> wsHit, killEnemy -> wsKill, fireWeapon -> wsFire, spawnProj -> wsProj, update -> wsTick; ui.js pickLoot -> wsPick; meta.js runSummary -> wsSummary, runText -> wsHead, wsText.
- Risk: one extra set operation per hit; older logged runs have no `ws` and print as before.

## 2026-10-18 Merge the Sandbox session (ccr-b8d66d4a-dmxu9z) (v10.15)
- Systems: sandbox
- Files: merge only; tests/run.sh (sbtest added to ALL)
- What: brings in the weapons-only developer Sandbox (its fragment: changes/ccr-b8d66d4a-dmxu9z.md). Both branches had shipped v10.14, so the merged build is v10.15.
- Save data: none.
- Hooks: see that fragment.
- Risk: none outside Sandbox.

## 2026-10-18 Race balance: boss contact, bullet cap and fire rate, rival damage, egg membrane (v10.14)
- Systems: bosses, enemies, rivals, the egg, difficulty
- Files: bosses.js, game.js, boss10.js
- What: boss contact damage now takes the v10 cut (bosses.js overwrote makeEnemy's); enemy bullets alive at once capped at 120 (was 800); ordinary shooters fire a third less often; rival damage 0.3 (was 0.45); the egg's membrane has half the health. Bot race sim: first win (1 of 6, was 0); 5 of 6 reach the egg.
- Save data: none.
- Hooks: V10_DIFF gains fireGap, ebulCap, egg (boss10.js); game.js eBullet cap, shooter cooldown, openEgg; bosses.js boss dmg.
- Risk: easier race; re-check against phone runs (bot target 20 to 50%).

## 2026-10-18 Test triage: 20 v9 tests retired, 6 fixed
- Systems: tests, school (Level 0)
- Files: tests/run.sh, tests/schooltest.js, inspecttest.js, introtest.js, setshot.js, rewindtest.js, newtut.js, web/js/school.js
- What: the ALL list drops 20 tests of v9 systems that v10 switches off (files kept): sigwtest weirdbox pintest reborntest forktest junktest sxshot devall seqtest seqfeattest revealshot foescenetest colourtest fusiontest supertest rubbertest armtest newfeattest psttest f3test. Fixed: Level 0 crashed in lesson 11 (junk DNA is off, `G.junkDrops` undefined) so lesson 11 is now a free pass under V10; the Feat lesson now gives a tappable Feat when the starting one is a trigger Feat (Oopsie), and schooltest finishes in about 93 s again; inspecttest expects the 7x7 chart; introtest reads the `sd_meta10` key; setshot opens a visible hint row (View is hidden); rewindtest and newtut skip junk-carrier and earned-colour assertions under V10.
- Save data: none.
- Hooks: none.
- Risk: none for the game beyond Level 0 lesson 11 being skipped under V10.

## 2026-10-18 Weapons grow between tiers; Thorns recoil capped; hazards get the v10 damage cut (v10.13)
- Systems: weapons, combat, hazards
- Files: weapons24.js, game.js, fight.js, bosses.js
- What: between tiers the 24 still gain stats with player level (up to 3 old levels past their tier, one per 3 player levels; cards stay branch-only). Thorns recoil is capped at 4% of max health per hit (a mastered contact weapon took 202 back in a sim). Hazards (kidney stones, boss ground attacks) now take V10_DIFF.dmg like everything else.
- Save data: none.
- Hooks: game.js computeStatsInner -> wStatLv; bosses.js addHazard -> V10_DIFF.dmg; fight.js thorns cap.
- Risk: bot sim still 0/6 wins (2 of 6 reach the egg, one the Final Five); deaths now mostly late bullets and rivals.

## 2026-10-18 Weapon tiers: upgrades on their own screen, four tiers, all branches; no empty slots; catalysts need this run's reaction
- Systems: weapons, draft, ui, mutations
- Files: weapons24.js, draft.js, game.js, ui.js, mutations.js, tests/drafttest.js, tests/mutstest.js
- What: normal drafts carry no weapon cards; every 4th level opens a WEAPON UPGRADE screen (pick a weapon if more than one is ready, then its branch cards). Weapons have tiers 1-4 (promise, branch, mastery; one mastery a run), stored on the old internal levels 1/3/6/10 so stats and cards are unchanged. HUD and menus show tiers and hide empty and locked slots. "More <reaction>" cards need that reaction set off this run (was: ever discovered).
- Save data: none.
- Hooks: game.js gainXp -> wupLevel; draft.js draftLoot/draftBox/draftTitle -> 'wup', 'wupfork'; ui.js HUD/armoury -> wTier, wLvText.
- Risk: weapons reach fewer levels' worth of stats early (tier 2 = old Lv 3 only at level 4); balance re-sim pending.

## 2026-10-18 Enemy bullets get the v10 damage cut
- Systems: enemies, difficulty
- Files: game.js, boss10.js
- What: enemy and boss bullets read their damage from the enemy def, so V10_DIFF.dmg never reached them (bullets were 45 to 69% of damage taken in run logs). New V10_DIFF.bullet (0.6) applies in eBullet; rival bullets keep their own knob.
- Save data: none.
- Hooks: game.js eBullet -> V10_DIFF.bullet (one line).
- Risk: easier race; tuning pending a 6-run sim.

## 2026-10-18 V10 clean-up after the weapon roster change
- Systems: weapons24, ui (Field Guide, Gene Bank, weapon panel), loadout, tutorial, school, guide tool
- Files: w24look.js (new), ui.js, loadout.js, tutorial.js, school.js, index.html, tests/tools/guide.js, GAME_GUIDE.md
- What: the 24 weapons get their own icons and unique badge codes (they all fell back to the pistol); a signature weapon's old id now reads as the new name in combos, pairings and the Tackle Box; only the 4 combos, 7 pairings and 1 super combo whose weapons are all among the 24 are listed (text rewritten with the new names); the Field Guide lists 24 weapons, V10 Feats and sample sequences (and no longer crashes on them); the Gene Bank no longer sells archived weapons; the Feat tutorial and Level 0 Feat room use V10 Feats; the GRUDGE card drops the Grudge Rifle; the guide lists only the 24 weapons.
- Save data: none.
- Hooks: ui.js codexHtml/renderBank/profileHtml/weapon panel and loadout.js loadoutCombos call wl_* helpers (w24look.js); school.js feat room f10Give.
- Risk: menus only. Old-id name sync renames archived defs (Lab Bench shows new names). Pre-existing failures: schooltest, inspecttest.
## 2026-10-18 Race fixes from a run log: XP pull, weapon slots at Lv 5/12, gentler death stare, branches in the log (v10.12)
- Systems: pickups, draft, bosses, run log
- Files: game.js, data.js, bosses.js, meta.js, draft.js, tests/drafttest.js, tests/sim/race.js
- What: in the race, loose XP follows you from 1600 away at 190/s (was 650 at 85) and the magnet reaches 1.5x further; weapon mounts come at Lv 5 and 12 (was 8 and 22); The Immune Eye's death stare warns for 1.6 s (was 1.1) and hits for 60%; the run log shows each weapon's branch choices {A/Lv6/Lv10}. race.js prints XP collected, weapons and boxes. drafttest samples more drafts (it flaked).
- Save data: none.
- Hooks: none (edits inside game.js updatePickups, data.js SLOT_LEVELS, bosses.js glare).
- Risk: faster levelling (bot sim: XP collected 80 to 97%, was 66 to 90%); bot still 0/3 wins, dying to bullets at 5 to 7 min.
## 2026-10-18 Weapon branches, batch 6: Peekaboo, Eggs, Chest Burster, The Runs
- Systems: weapons, upgrades
- Files: wup6.js (new), index.html (script tag after wup3.js), ARCHITECTURE.md (script order), tests/wup6test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg. Costs are real stat changes (BOO and smite damage, hide time, lure, trail damage, undead life, cap and damage). Unnamed Lv 6 cards were named (Standing Room Only, Encore, Silent Running, Sneak Attack, Pass It On, Stampede, Bigger Basket, Triple Yolk, Egg Trail, Golden Opportunity, Warm Glow, Time Bomb, The Staff, Adoption Papers, Chronic Condition, Open Casket, Soul Searching, Remote Detonation, Burning Rubber, Footloose, Full Circle, Flashpoint, Creature of Habit, Well Trodden).
- Save data: none.
- Hooks: none added to shared files. Peekaboo and Eggs are toy weapons, which fireWeapon sends to toyFire before the 'fire' hook, so wup6.js wraps globals instead (peekSpot, toySteer, toyAim, toothFire, toothTaken, toothLure, hurtPlayer, killEnemy, sigwTick, wupDmgMul, v10Draw), the way wup1.js does for projHit.
- Risk: once a Chest Burster card is taken, sigwTick no longer sees that weapon's undead (they are lifted out of G.turrets for the call and managed in wup6.js, so they do not count towards the shared 8-pet total). Simplified: Rattle flings the false position 230 away (not left at the real position); Sneak Attack gives other weapons +30% while hidden (they already fire while you are hidden); Don't Count Your Chickens also makes eggs last 7 s so they can reach full charge at 6 s; Open Casket also spreads infection to two neighbours (rising from any kill already happens); Chest Burster undead have no melee, so the Dead Useful cost cuts their shot damage; Hookworm undead sit on their host and fire from it; the Runs' loop and wave checks use the trail pieces, not the exact path.

## 2026-10-18 Weapon branches, batch 3: Rent Free, Hot Mess, Family Ties, Skill Issue
- Systems: weapons, upgrades
- Files: wup3.js (new), index.html (script tag after wup2.js), tests/wup3test.js (new)
- What: all three promises, nine Lv 6 cards and three masteries for each of the four weapons, registered with wupReg and acting through the weapons24.js hooks (stats, fire, hit, dmg, kill, tick). Costs are real stat changes. Unnamed Lv 6 cards were named (Cold Spot, Second Sighting, Ghostly Tug, Hitching a Ride, Spreading Spooks, Friendly Ghost, Backdraft, Hot Tub, Hot Foot, Burning Bridges, Short Fuse, Powder Keg, Roach Motel, Compaction, Bumper Cars, Let Go, Appetite, Afterglow, Bank Shot, Hat Trick, Weight Class, Prime Cut, Splatter Zone, Chain Tenderising).
- Save data: none.
- Hooks: none added to shared files.
- Risk: Skill Issue cards watch the armoury bowling list (G.armBowl); Family Ties cards edit orb fields (pull, aura, r); Hot Mess cards edit their own zones. Simplified: pets are invulnerable ghosts drawn with particles; Appetite/Afterglow add a second blast after the engine's supernova.
## 2026-10-18 Weapon branches, batch 4: There Is No Spoon, Nappy Mines, Soulmate Signal, Unwanted Contact
- Systems: weapons, upgrades (weapons24.js engine), defence (Umbilical Shield reads the Membrane hit)
- Files: wup4.js (new), index.html (script tag after wup2.js), tests/wup4test.js (new)
- What: all 60 cards for the four signature weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise (12 new names, e.g. Afterbirth, Water Breaks, Pass the Parcel, Nappy Pin, Stretch Marks, Love Triangle, Split Ends, Echo Chamber), and three masteries each. Costs are real stat or behaviour changes. Every card draws something (ring, line, tape, floatText) and counts itself in w.w4.fx for the test.
- Save data: none.
- Hooks: none added to shared files. wup4.js wraps globals at load: updateSiphon (replaced by a copy plus the cards once a card is taken), mineDrop, mineScale, detonateMine, twinPoints, wupDmgMul, wupHit, killEnemy, rateBonus, and (on first card taken, because fight.js and pdef.js load later) fightArc, fightStatus, fightPayoff, pdefHurt. Shares the 'phit' / 'pend' hook kinds with wup1.js (same globalThis.WUP_PROJ_HOOKS guard).
- Risk: other branches that edit updateSiphon, detonateMine or pdefHurt will not see their change take effect on a slot with a card. Simplified: stored-bullet staleness is not modelled (the base weapon has none, so Return to Womb's "+2 s" is dropped); Mirror Womb bounces half the shots that enter the absorb radius, not only ones that would hit you; Odd Sock and Evil Twin pick once per wave (once per 20 s or 25 s outside wave mode).
## 2026-10-18 Weapon branches, batch 5: Ewww Gross, Blowing Bubbles, One of These Days, Sister Cousin
- Systems: weapons, upgrades (weapons24.js engine), toys (Red Tape, Bubble Wand, Due Date), modifiers (multiplying)
- Files: wup5.js (new), index.html (one script tag after wup2.js), tests/wup5test.js (new), ARCHITECTURE.md (script-order line)
- What: all 60 cards for the four Mucus/Blood projectile weapons are live through wupReg: three promises (Lv 3), two Lv 6 cards and a wildcard per promise, three masteries each. 24 in-promise Lv 6 cards are newly named (Corporate Merger, Group Chat, Puppet Strings, Gossip, Tangled, Escalation, Locked In, Cannonball, Chaperone, Return to Sender, Popcorn, Stuck Together, Early Delivery, Short Notice, Pass the Parcel, Rush Hour, Compound Interest, Fine Print, Runts of the Litter, Overcrowding, Taste for It, Nepotism, Pack Hunting, Pile-On). Costs are real stat or behaviour changes. Sister Cousin now really splits on a kill from Lv 1 (its slot starts with the 'multiplying' modifier; the text promised it but nothing did it).
- Save data: none.
- Hooks: none added to shared files. wup5.js wraps these globals at load, each a no-op for a slot without a card: toyFire (so toy weapons reach the 'fire' hook, which fireWeapon skips for them), canBubble, toyHold, bubbleSoak, bubbleHit, bubblePop, dueMark, duePop, toyHurt, modHit, makeSlot, wupDmgMul, hurtPlayer, v10Draw; and the shared 'phit'/'pend' kinds (same WUP_PROJ_HOOKS guard as wup1.js). Candidates to become real one-line hooks.
- Risk: Group Chat is thin (the base tape already shares to every member at any distance, so the card only lifts the boss discount). Hit-ups that are a share of max health (snap, Compound Interest) use mult 1. Lost in the Post and Postponed act in a hurtPlayer wrapper before dodge and boss-cap rules. Cotton Wool/Postponed/Lost in the Post share one wrapper.

## 2026-10-18 Every level-up and DNA pick opens at once (v10.11)
- Systems: draft
- Files: draft.js, tests/drafttest.js
- What: the 40 s spacing between draft screens is gone (`DRAFT.budget` 0): level-ups and DNA pickups open their card screen immediately.
- Save data: none.
- Hooks: none.
- Risk: more card screens close together; faster power growth.

## 2026-10-18 Fix: the game froze at the second level-up (v10.10)
- Systems: draft, core loop
- Files: game.js
- What: queued level-up boxes waiting out the 40 s draft spacing stopped the game clock, so the wait never ended. A waiting box now goes to the back of the queue and the game keeps running.
- Save data: none.
- Hooks: none (game.js frame loop condition).
- Risk: none.

## 2026-10-18 Weapon branches, batch 1: Standard Issue, Maximum Gains, Nervous Wreck, Panic Button
- Systems: weapons, upgrades
- Files: wup1.js (new), index.html (one script tag after weapons24.js), tests/wup1test.js (new)
- What: all 60 cards for the four Force weapons are live through wupReg: three promises each (Lv 3), two Lv 6 cards and a wildcard per promise, and three Lv 10 masteries (15 per weapon). Costs are real stat changes. Marks, bounce zigzags, lanes, nuts, confetti, lumps, fragments and jaws are drawn so each "Shows" line is true.
- Save data: none.
- Hooks: none added to shared files. wup1.js wraps four globals at load: projHit and projEnd (new hook kinds 'phit' and 'pend', guarded by globalThis.WUP_PROJ_HOOKS so later wup*.js files can share them), wupDmgMul (marks that raise damage from your other weapons), hurtPlayer (Untouchable) and v10Draw (marks). Candidates to move into weapons24.js / game.js as real one-line hooks.
- Risk: the four weapons' fire paths are replaced by dispatchers once a Lv 3 card is taken (Maximum Gains tags the engine's own volley; Panic Button places its own blast, so mutFire/modFire do not apply to it). A card "heavy hit" is applied directly (one Shell layer off, Poise up) and does not trigger Blood Pressure.
## 2026-10-18 The new eight samples in code: three starters each, Race only (v10.09)
## 2026-10-18 Weapon branches, batch 2: Acid Spit, Red Flagship, Nocturnal Emission, Little Prick
- Systems: weapons, upgrades (weapons24.js engine), combat (bars read and paid off from a card)
- Files: wup2.js (new), index.html (script tag after weapons24.js), tests/wup2test.js (new)
- What: the four weapons now have their three promises (Lv 3), nine Lv 6 cards (two per promise plus a wildcard; 18 in-promise names are new, e.g. Second Helping, Backsplash, Cascade Failure, Rising Damp, Reef Knot, Terminal Clause) and three masteries each, all registered with wupReg and acting through wupOn hooks. Costs are real stat or damage changes; every card draws something (ring, line, drips, floatText).
- Save data: none.
- Hooks: none added to shared files. wup2.js only reads fight.js, combat.js and game.js (damageEnemy, spawnProj, zones, v10fx lines). Globals are all w2* / W2_*.
- Risk: Snot Ocean is read as radius x3 (not area x3); Pin Cushion needles do 50% each; Projectile Vomit swaps stats and fire() but leaves def.v10atk as proj (its hits carry atk 'beam'). Nocturnal Emission strands, bogeys and bubbles are drawn with v10fx dots and lines. tests/wup2test.js is not in run.sh's ALL list (run it by name).
## 2026-10-18 The new eight samples in code: three starters each, Race only
- Systems: samples, weapons, ui
- Files: samples10.js, feats10.js, mutations.js, fight.js, game.js, ui.js, tests/samplestest.js, tests/ufeatstest.js, tests/v10test.js, tests/voicetest.js
- What: Samples are now Baseline, Alpha, Beta, Private Schooled, Ordered Online (Mucus / Fire), Redtail, Prawn Again and Not of This World, with ids baseline, alpha, beta, private, ordered, redtail, prawn, alien (old over, late, friend, parcel, unsol, unacc, other migrated). The first draft offers the sample's three starters (w24Starters); the other two stay in the pool. Not of This World shifts a per-slot type (w.typeOver) every 20 s instead of swapping weapons. All samples are open (S10_ALL, unlock rules kept). The Experiment picker and quick start use only the Race (S10_PETRI hides the Petri Dish). Private Schooled and Not of This World carry shield: true (s10Shield()).
- Save data: META.s10 / META.s10runs keys change from the old ids to the new ones (test build, no migration); profile ids s10_<new id>.
- Hooks: fight.js fightHit reads src.w.typeOver; game.js spawnProj colours by w.typeOver; ui.js quickStart uses s001.
- Risk: old saves with META.profile s10_over etc. fall back to a missing profile; the Petri Dish is unreachable from the sample screen.
## 2026-10-18 Player shield: samples, Rubber Johnny or Latex Protection, drawn as the original forcefield
- Systems: combat (player defences), relics, draft, render (shield bubble)
- Files: pdef.js, stamina.js, bodymods.js, render.js, bosspack.js, data.js, tests/shieldtest.js (new), pdeftest.js, bubtest.js, GAME_GUIDE.md
- What: Nobody has the Membrane by default now. It is the player's shield, granted by Private Schooled / Not of This World (s10Shield, from samples10.js), the Rubber Johnny relic (replaces its old catch-a-hit skin under V10; text rewritten) or the new Latex Protection card (offered while you have no shield, takes a Genome slot). Thicker Membrane and Faster Recharge need a shield. It draws as the original forcefield bubble (armourRing) with the elastic physics and surface contact (bubbleBump); the blue arc is gone. Soaks and Static recharges set G.armFlash; a hard bump into a wall wears the Membrane 4% (was armour).
- Save data: none.
- Hooks: render.js `if (!V10 || pdefShieldUp()) armourRing(px, py)`; stamina.js armourRing guard and k -> pdefShieldUp / pdefShieldK; bodymods.js bubbleOn -> pdefShieldUp, bubbleBump dent -> pdefDent; bosspack.js bpRelicIn rubber skin `&& !V10`.
- Risk: Baseline and most samples lose 30% max health of soak (balance: re-sim). Latex Protection competes for Genome slots. s10Shield must be added by samples10.js (read via typeof guard).

## 2026-10-18 Samples renamed; three unique starting weapons each; 15 weapon renames (docs only)
- Systems: sequences, weapons (docs only, redesign docs)
- Files: SAMPLES.md, BASE_WEAPONS.md, WEAPON_UPGRADES.md, COMBAT_MATRIX.md, FEATS.md, MODIFIERS.md, MUTATIONS.md, UPGRADES.md, VOICE_GUIDE.md, AUTORUN_AUTOAIM.md, README.md
- What: The eight samples are now Baseline, Alpha (rewritten as a manosphere podcaster), Beta, Private Schooled, Ordered Online, Redtail, Prawn Again and Not of This World. Each has three starters of its own (all 24 weapons, none shared), offered in the level 1 draft. Fifteen weapons renamed (Nut Shot is Standard Issue, Tooth Fairy is Eggs, and so on); the Eggs upgrade cards were rewritten from teeth to eggs.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Two open issues: Ordered Online has no Acid starter; Not of This World's type-shifting passive needs a matrix line.

## 2026-10-18 Weapon upgrades: Lv 6 wildcards (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md
- What: Lv 6 now offers three cards: two inside the chosen promise and one wildcard from outside it (72 new cards; 360 in all).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

## 2026-10-18 Weapon upgrades: choices at Lv 6 and 10 (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md, UPGRADES.md, README.md, CLAUDE.md
- What: Lv 6 is now a two-card choice inside the chosen promise; Lv 10 is three extreme masteries per weapon (72 new cards). 288 cards in all.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Five masteries break shared caps on purpose (listed in the doc).

## 2026-10-18 Weapon upgrades second draft; Nappy Mines is Fire (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (rewritten), BASE_WEAPONS.md, UPGRADES.md, README.md, CLAUDE.md
- What: upgrades are now three promises at Lv 3, each grown at Lv 6 and Lv 10, with trade-offs, visible tells and autorun-mode notes; no upgrade changes damage type. Nappy Mines is Fire from the start (burning patch footprint instead of an Acid Pool).
- Save data: none.
- Hooks: none.
- Risk: none (no code).

## 2026-10-18 Weapon upgrade forks (docs only)
- Systems: weapons, upgrades (docs only, redesign docs)
- Files: WEAPON_UPGRADES.md (new), UPGRADES.md, README.md, CLAUDE.md, COMBAT_MATRIX.md
- What: 216 upgrade cards (three at each of Lv 3, 6, 10) for the 24 base weapons; weapon forks move from Lv 5/10 with two cards to Lv 3/6/10 with three.
- Save data: none.
- Hooks: none.
- Risk: none (no code). Overrides the UPGRADES.md weapon-fork rule and the MODIFIERS.md "a fork never changes damage type" line.

## 2026-10-18 Base weapons decisions (docs only)
- Systems: weapons, chemistry (docs only, redesign docs)
- Files: BASE_WEAPONS.md, COMBAT_MATRIX.md, SAMPLES.md, ENEMY_DESIGN.md, FEATS.md, tables/*.csv
- What: Static + Mucus reaction renamed Snot Socket (the weapon takes Sticky Situation); four weapon renames confirmed; three sample starting weapons changed.
- Save data: none.
- Hooks: none.
- Risk: none (no code). `combos.js` still has a combo named Sticky Situation.

## 2026-10-18 Base weapons roster (docs only)
- Systems: weapons (docs only, redesign docs)
- Files: redesign docs/BASE_WEAPONS.md (new, now self-contained), WEAPONS.md and SIGNATURE_WEAPONS.md (moved to archive/), README.md, CLAUDE.md, COMBAT_MATRIX.md, SAMPLES.md
- What: records the 24-weapon roster (10 foundations with animation specs, 14 signatures) and archives the other 72; lists the open naming and sample-start issues.
- Save data: none.
- Hooks: none.
- Risk: none (no code changed). Code pass is described in BASE_WEAPONS.md section 6.
## 2026-10-17 Player defences and defence cards
- Systems: combat, v10, ui (loot cards only)
- Files: pdef.js (new), game.js, v10.js, render.js, index.html, tests/pdeftest.js (new), tests/v10test.js, tests/fighttest.js
- What: under V10 you start with a base Membrane (30% of max health, recharges like an enemy's) and can hold Shell layers, Squishy, Evasion and Thorns from six new defence cards (Thicker Membrane, Faster Recharge, Shell Layer, Squishy, Evasion, Thorns). Hits resolve in matrix 11.1 order in pdef.js; a hit fully soaked by the Membrane applies no status. Level-ups now offer Switched at Birth plus two different defence cards (one box a wave unchanged). Blue Membrane arc and brown Shell rings are drawn round you; the old armour ring is off under V10.
- Save data: none (G.pd is per run; run log gains fst.pMem, pLayers, pMiss, pThorns).
- Hooks: game.js hurtPlayer -> pdefHurt (replaces the armour block under V10); v10.js v10Tick -> pdefTick, v10Draw -> pdefDraw, v10Loot -> pdefOffer; render.js armourRing skipped under V10.
- Risk: player survivability shifts (a free 30% Membrane); fighttest and v10test adjusted for it. Genome slots (4) are enforced for defence cards only.

## 2026-10-17 Merge v10.04 and record the implementation plan
- Systems: none (docs and merge)
- Files: merge of claude/zealous-clarke-i26iot; NOTES.md (v10 section); redesign docs/README.md
- What: this branch now carries the v10 test build plus the newest redesign docs. NOTES records the Soul, defence and player-armour decisions and the phase plan.

## 2026-10-17 Redesign docs: agent guide for the folder
- Systems: docs only (redesign docs)
- Files: redesign docs/CLAUDE.md (new), redesign docs/README.md, CLAUDE.md
- What: per the user, a CLAUDE.md in the redesign folder tells agents the source-of-truth order, which doc holds what, the hard limits and vocabulary, what to ignore, and the checks before finishing. The root CLAUDE.md points to it.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: mutation cards
- Systems: docs only (redesign docs)
- Files: redesign docs/MUTATIONS.md (new), MODIFIERS.md, UPGRADES.md, COMBAT_MATRIX.md, README.md
- What: per the user, the run's change-the-sample cards are called Mutations (the attack-behaviour list keeps the internal name modifiers). 33 mutations from the user's list, mapped to the rules: body, weapon, damage-type, trade-off and rare synergy. Weapon mutations attach to a weapon (max 3); the rest use Genome slots and rank up when picked again. Bad Blood and Leave a Little Something lost their new ground objects; Crossed Wires became the general Catalyst (the combinations are the 21 reactions). Starting pool of 8.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: Feats as the consciousness's gifts; gravity well and lunge
- Systems: docs only (redesign docs)
- Files: redesign docs/FEATS.md (new), MODIFIERS.md, COMBAT_MATRIX.md, SIGNATURE_WEAPONS.md, WEAPONS.md, UPGRADES.md, VOICE_GUIDE.md, README.md
- What: per the user, Feats are gifts from the consciousness: 16 gifts for every sample (11 from the user's ideas list, 5 new), 8 sample-exclusive gifts (one per sample), and the best 15 of the 48 original Feats mapped to the current rules and re-gifted (gift line on the card, old Scientist line as a Field Guide note), with a suggested starting pool of about 15. New attack modifiers: gravity well (pulls bodies and bends shots; Black Hole, Sofa Crevice, Wandering Womb, Van de Graaff) and lunge (moves you). Utility Feats have no damage or attack type.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: open issues settled (decisions 29 to 32)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, WEAPONS.md, SAMPLES.md, ENEMY_DESIGN.md, UPGRADES.md, DEFENCE_TYPES.md, SIGNATURE_WEAPONS.md, README.md, tables/combat_interactions.csv
- What: per the user, (29) the Force + Soul reaction is renamed Out-of-Body Experience, so the Soul Burst weapon keeps Soul Purpose; (30) The Other Half's First Contact is a fifth reaction trigger kind (Feat): it counts as a hit of the old and new type for reactions only, at most 8 per use; (31) the player gets defences from upgrade cards (Genome slots) or built into some samples, weapons and Feats (no slot); Assimilation is dropped; (32) built-ins stay rare: The Cold Parcel has 20% Evasion, Thorny Onesie gives Thorns, no sample Feat has one.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: COMBAT_MATRIX is the single source; CSVs generated
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, README.md, MODIFIERS.md, WEAPONS.md, SIGNATURE_WEAPONS.md, UPGRADES.md, tables/*.csv, tables/export.py (new)
- What: per the user, every combat rule and status now lives only in COMBAT_MATRIX.md (new: type rules in section 2, all defence rules and interaction rows in section 3, triggers and design status on every status in section 4, attack-type rules in section 13, a where-things-live map and the CSV export in section 14; old section 9 merged away). DAMAGE_TYPES, DEFENCE_TYPES and ATTACK_TYPES are cut to identity, look, strengths and weaknesses plus pointers. ENEMY_DESIGN cites the matrix instead of restating it. The three CSVs are now generated by tables/export.py from the matrix. Stale lines fixed: "named weapon combo", Static "Charge to interrupt", Matchstick's trail as a world object, "five" Soul reactions (six), signature weapon counts, a wrong rule reference on Placental Siphon, Yo-Yo Diet's missing modifier.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: Heartburn signature (returning droplets)
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md, WEAPONS.md, MODIFIERS.md
- What: per the user, Heartburn's signature is "coming back up": each droplet flies out to full range and back, hitting on both passes (the Returning modifier, now allowed on Spread). Damage per droplet 3.4 to 2.4 to compensate.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: shipped ground objects only, greyscale notes gone, tidy-up
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md, SIGNATURE_WEAPONS.md, WEAPONS.md, SAMPLES.md, VOICE_GUIDE.md, tables/*.csv
- What: per the user, only shipped ground objects plus wax (decision 27): Burn zones, corrosive slicks, clot patches and Heartburn's reflux puddle are cut. Slick Move now leaves an Acid Pool, Caught in the Clot Snares the first enemy across the blood pool, Flammable Mucus flares once (a burst, not a zone), Smouldering elites give off a death Burst. Shipped terrain added to the world objects table. Acid stays shocking pink (decision 28). Greyscale notes removed (Lab view is retired). Em dashes replaced, duplicate link removed.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Heartburn has no signature until one is chosen.

## 2026-10-17 Redesign docs: modifiers stack, forks can rarely change attack type
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md, MODIFIERS.md
- What: per the user, a weapon can carry several modifiers (the two-plus-one cap is gone) and a fork can, rarely, change a weapon's attack type (mostly at the Lv 10 mastery fork). Damage type never changes.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: upgrades and progression
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md (new), README.md
- What: the progression model: one shared card draft (Acquire, Enhance, Transform, Specialise), slot caps (3 weapons at levels 1/8/22, 3 Feats with the sample's unique Feat fixed, 4 shared Genome slots for mutations and Assimilation defences), Feat levels with forks at 3 and 5, weapon forks at 5 and 10 (one mastery a run; forks use the upgrade modifier slot from MODIFIERS.md, never change attack type), a 50/25/25 sample-type pool lean, Skip/Reroll/Banish (Remove 2, Fewer like this 1) and a one-screen-per-40 s interruption budget.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: pets rule, modifiers, six more signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIERS.md (new), COMBAT_MATRIX.md (12.3 Pets), SIGNATURE_WEAPONS.md, WEAPONS.md, ATTACK_TYPES.md, README.md
- What: pets get one rule (damage, leash 300, 4 per weapon and 8 in total, 20% of your health, respawn 3 s, ignore statuses and hazards, enemies only target nearby pets). MODIFIERS.md defines 18 modifiers with caps (homing, piercing, chaining, ricochet, returning, orbiting, delayed detonation, lobbed, trail, self-centred, sweep, anchored beam, rapid volley, every Nth, growing, scaling, multiplying, summoned). Twin Telepathy, Blood Blister, Thorny Onesie, Seeker Siblings, Flagellum Flail and Nose Goblins become signature weapons 21 to 26 (68 weapons in all).
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Samples doc: tell, quirk and payoff format
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md
- What: SAMPLES.md rewritten in the user's format: design principle (tell, quirk, payoff), one-line roster, a page per sample (core fantasy, behaviour, named passive, Unique Feat, visual signature, consciousness, Scientist, selection-card gag), visual rhythm, guardrails and the guiding test. Rules, starting attack types (linked to WEAPONS.md section 4), unlocks and open decisions kept at the end.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-17 Redesign docs: one weapons list
- Systems: docs only (redesign docs)
- Files: redesign docs/WEAPONS.md (new), README.md
- What: all 62 redesign weapons in one table set (42 matrix weapons from v10.js V10_NAMES, 20 signature weapons) plus the 34 parked originals with reasons. Flags a new name clash: Soul Purpose is both the Soul Burst weapon and the Force + Soul reaction. Section 4 maps each SAMPLES.md sample to its starting matrix weapon.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Samples design: eight new playable characters
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md (new), README.md, VOICE_GUIDE.md
- What: Eight samples (Baseline to Other Half) to replace the sequences as playable characters: types, starter attack type, passive, unique Feat, Scientist line, unlock, story and visual language each, aligned with the 26 reconciliation decisions (Soul possesses, no automatic Fire spread, Lab view retired, type colours). Profiles become trait-named builds; game modes become "Experiments".
- Save data: none.
- Hooks: none.
- Risk: none now; when built, replacing sequences touches seqsel/seqlock/genes and the META.prof migration.
## 2026-10-17 Redesign docs: Fire signature weapon drafts
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md
- What: five Fire signature drafts, one per attack type beside Pub Crawl's Pool: Heartburn (original `flamer`, moved from Acid), Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation. Names checked against the code (Hot Flush, Running a Temperature and Fever Dream are taken).
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Moving `flamer` from Acid to Fire changes Heartburn's existing upgrades and Pairings when ported.

## 2026-10-17 Redesign docs: signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md (new), COMBAT_MATRIX.md (section 12, Fear row), README.md
- What: 15 original weapons (Premature Evangelation, Nappy Mines, Pub Crawl, Peekaboo, Black Hole, Tapeworm Seeder, Red Tape, Due Date, Leeches, Static Cling, Lard Lobber, Placental Siphon, Bubble Wand, Tooth Fairy, Upchuck) return as signature weapons beside the 42-weapon matrix, each retyped to one of the seven types. New rules: echo damage, Pull, allied creatures, player hiding, bounded chains, lures, merging pools, projectile blocking.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Porting will touch weapon ids that have Pairings on other branches.

## 2026-10-17 Redesign docs: formulas and starting values
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (new section 11, status rows), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md (Damage type column), AUTORUN_AUTOAIM.md (SHELLED, MEMBRANED, TOUGHEST), README.md, tables/*.csv
- What: every mechanic now has a formula and a starting number: hit order (Evasion, Membrane, Shell, Squishy, then crit); one build-up bar formula (raw damage over bar size x max HP, 2 s drain); heavy Force hit at 15% max HP; reaction damage as % of the triggering hit with a 1.5 s lockout; Possessed AI; Charge as a conductor; Extraction on bleeding kills; Membrane recharge only (no supercharge); defence, status and world-object values; enemy damage types on a bell curve; Snot Trap rename.
- Save data: proposed META.rxSeen (reaction discovery); nothing in code yet.
- Hooks: none.
- Risk: none (docs only); numbers need playtest.

## 2026-10-17 Redesign docs: reconciliation (26 decisions)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (rewritten), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, VOICE_GUIDE.md, README.md, tables/*.csv (regenerated)
- What: cross-doc contradictions settled one by one (COMBAT_MATRIX.md section 10). Reactions use four trigger kinds (state + hit, world object + hit, dual-type weapon, Pairing) and are identical in every doc; Soul reactions rebuilt on Possessed and the Soul Mark retired; Dodge defence renamed Evasion (miss chance on Contact, Projectile, Spread only); Acid strips Shell for good and has no DoT outside Pools; Fire uses a Burn bar with one Ignition flare and no auto-spread; Squishy blunt only; Shell layers wear slowly under ordinary hits; Mucus smothers Fire; world objects split from statuses; player can have every defence and status except Possessed; reactions are discovered; Lab view to be retired; plain internal ids to come.
- Save data: none yet (decision 19 will rename internal type ids and needs a migration).
- Hooks: none.
- Risk: decisions 19 to 21 (id rename, Lab view retired, palette) are big code changes still to do; see redesign docs/README.md "Follow-on work".

## 2026-10-17 Redesign docs: Soul as mind control, TOUGHEST restored, feature-file enemy rows
- Systems: docs only (redesign docs)
- Files: redesign docs/AUTORUN_AUTOAIM.md (copied from claude/zealous-clarke-i26iot), DAMAGE_TYPES.md, DEFENCE_TYPES.md, COMBAT_MATRIX.md, ENEMY_DESIGN.md, README.md, tables/mechanics_statuses.csv, tables/combat_interactions.csv; NOTES.md (one bullet)
- What: Soul is mind control only: new Possessed status (full build-up turns an enemy on its mates for a few seconds; bounded, bosses reduced); essence and resource bypass removed everywhere (Essence Drain and Soul Fracture rows gone). TOUGHEST restored (HIGHEST HEALTH was removed in AUTORUN_AUTOAIM.md). ENEMY_DESIGN 5.3 now reviews all 27 enemies from foes.js, foes2.js and foes3.js, with revisions for Litmus Cell, Mirror Cell, Platelet Clump and Grease Ball.
- Save data: none.
- Hooks: none.
- Risk: v10 code may still describe Soul with essence wording.

## 2026-10-17 Enemy design doc: review fixes
- Systems: docs only (redesign docs)
- Files: redesign docs/ENEMY_DESIGN.md
- What: Fire damage and Burning separated; defence wording allows enemy-specific states that aren't hidden defences; exact triggers for Static Sock (Crackle by distance), Stress Ball (qualifying hit, reset, decay, hazard-safe rebound), Mosquito (fixed bite, half back within 4 s, not Extraction) and Snot Bubble (any Static hit bursts it); targeting policies framed as tools (TOUGHEST, which doesn't exist, is now HIGHEST HEALTH); roster uses in-game names with code ids, adds Paramecium and lists the unreviewed foes/foes2/foes3 enemies; Fire prototype order (Matchstick first).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-17 Combat rulings 33 to 38 (docs)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (section 10 rows 33-38, 11.3, 11.5), tables/mechanics_statuses.csv (regenerated)
- What: reaction damage is explicit per reaction (no hidden 60%/150% on every reaction); Corrosion makes unshelled enemies Corroded for 4 s; a hit fully soaked by Membrane applies no status; one shared burn per target; Shell wear rule; the 21 reactions are inventory until playtested.
- Save data: none.
- Hooks: none.
- Risk: none (docs).

## 2026-10-17 Pure combat resolver (combat.js)
- Systems: combat (new)
- Files: web/js/combat.js (new, not yet loaded by index.html), tests/combatunit.js (new, plain node)
- What: matrix 11.1 hit resolution as pure functions (makeDefence, resolveHit, tickDefence, addBurn, COMBAT constants) with decisions 33-37; 45 unit tests. Crits fill bars and judge heavy hits from pre-crit damage.
- Save data: none.
- Hooks: none yet (wired into damageEnemy/hurtPlayer in the slice).
- Risk: none until wired.

## 2026-10-17 Voice line tables (voice.js)
- Systems: voice (new)
- Files: web/js/voice.js (new, not yet loaded)
- What: Scientist and consciousness lines for 19 events with composure tiers, a Scientist and a consciousness first-sighting line for 81 enemies and bosses, 13 first-time status hints, sampleId (1A..1Z, 1AA) and voiceLine (no repeats, tier rarity).
- Save data: none.
- Hooks: none yet (show.js, intro.js, finale.js later).
- Risk: none until wired.

## 2026-10-17 Combat slice: defences and the first reactions in play (v10.05)
- Systems: combat (new fight.js), roster, v10, chemistry, engine
- Files: fight.js (new), roster.js (new, data), combat.js (addBurn renamed burnAdd: chem.js has one), game.js, chem.js, v10.js, meta.js, index.html, tests/fighttest.js (new)
- What: enemies now carry the five defences from the roster (Macrophage Squishy, Diatom/Spire/Water Bear Shell, Mucus Wall/Alpha Swimmer Membrane, Sprinter/Quantum/Ghost Evasion, the new Ingrown Hair Thorns), drawn as rings (blue Membrane arc, brown ring per Shell layer, thorn spikes, dashed Evasion ring) with "miss" puffs. Hits resolve through combat.js; crits come last. Acid builds Corrosion (strips a Shell layer, or Corroded for 4 s) with no damage over time; Mucus Snares (55% slow, puts out Burning); Static Charges (+20% Static, arcs 3 jumps, discharges on death). Five reactions: Corrosive Splash, Snot Rocket, Conductive Pool, Slick Move, Sticky Situation, named on first discovery (META.rxSeen). Per-run stats in G.fst, saved in the run log.
- Save data: META.rxSeen (list of reaction ids) added; run log entries gain `fst`.
- Hooks: game.js damageEnemy -> fightHit (replaces armour under V10; crit multiplier skipped under V10), applyElement guard e.fOk; game.js killEnemy -> fightDeath; chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js runSummary fst.
- Risk: balance. Bot sim (2 runs) dies at waves 4-5, same as the build before the slice (waves 3-5): v10 has almost no upgrades yet. Blood, Soul and Fire keep v10.04 statuses for now. Shocking Impact needs a dual-type weapon (none yet).

## 2026-10-17 All seven damage types and twenty reactions
- Systems: combat (fight.js), engine
- Files: fight.js, game.js, tests/fighttest.js, tests/v10test.js
- What: Blood Bleeds (30% of the hit over 3 s, 3 at most); dying while bleeding leaves a blood pool and heals you a little (Extraction, 1% max health, 6 a second at most). Soul fills the Possess bar only. Fire adds to one shared burn; Snared puts it out. Two Snared enemies touching are Conjoined for 3 s. The other fifteen reactions now fire: Blood Pressure, Out-of-Body Experience, Flashover, Caustic Breach, Soul Erosion, Premature Evaporation, Blood Circuit, Interference Pattern, Arc Flash, Caught in the Clot, Held in Suspension, Flammable Mucus, Blood Donor, Cauterise, Spectral Combustion (Soul Beam + Burning Ground, both Lv 5+). Area hits now land on Possessed enemies (autoaim still skips them), so the Soul reactions can happen.
- Save data: none new (META.rxSeen gains the new ids).
- Hooks: game.js damageEnemy charmed guard skipped under V10.
- Risk: Possessed enemies can now be killed by your area weapons. Shocking Impact still needs a dual-type weapon.

## 2026-10-17 Draft core (draft.js) (v10.06)
- Systems: draft (new), v10, loot
- Files: draft.js (new), v10.js, game.js, index.html, tests/drafttest.js (new), tests/v10test.js, tests/pdeftest.js
- What: level-ups and elite/boss chests open one shared draft: weapon upgrades, Switched at Birth, defence cards and any card a feature file registers (Feats, mutations). Acquire cards need a free slot (3 Feats, 4 Genome shared by mutations and defences). Weapons reaching Lv 5 or 10 and Feats reaching level 3 or 5 get a 2-card fork screen. Wave mode: one level draft a wave plus chests, at the wave break; race: at most one screen per 40 s (forks never wait). Banish data (G.banish, G.fewer) is honoured; the buttons come with the UI pass.
- Save data: none.
- Hooks: v10.js v10Box -> draftBox, v10Loot -> draftLoot; game.js main loop: a 'wait' from v10Box rotates the box to the back of the queue.
- Risk: more drafts in race mode than v10.04's every-strand switches are fewer now (40 s budget); elite/boss chests now open drafts in wave mode.

## 2026-10-18 Wave-mode drafts queue instead of vanishing; sim uses the real draft rules
- Systems: draft, tests
- Files: draft.js, tests/sim/wave20.js, tests/v10test.js
- What: in wave mode every level-up draft now queues and plays at the wave break (UPGRADES.md 9); before, every level after the first in a wave was dropped. The wave sim now sends boxes through v10Box like the real loop and prints combat stats (G.fst) and the final build per run.
- Save data: none.
- Hooks: none.
- Risk: more upgrades per run in wave mode. Bot sims (3 runs): deaths at waves 8, 5, 8 (was 4 to 5).

## 2026-10-18 Banish on draft cards; Switched at Birth keeps the weapon's level
- Systems: draft, ui, v10
- Files: draft.js, ui.js, v10.js
- What: draft cards carry two small buttons: Fewer like this (1 reroll: that family half as often) and Banish (2 rerolls: gone for the run); the screen then redraws. Switched at Birth now keeps the weapon's level, modifiers and weapon mutations instead of resetting it to Lv 1.
- Save data: none (G.banish, G.fewer are run state).
- Hooks: ui.js renderLootCards -> draftBanishBtns.
- Risk: none.

## 2026-10-18 v10 modifiers (merged from agent-mods)
- Systems: weapons, modifiers (new)
- Files: modifiers.js (new), game.js, arsenal.js, v10.js, index.html, tests/modstest.js (new; the old body-mods test is now bodymodstest.js, not in the run list)
- What: all 20 modifiers (MODIFIERS.md) work on v10 weapons through w.m10, with modAdd / modHas / modsFor; weapon forks at Lv 5 and 10 now offer two fitting modifiers. Attack type and damage type never change.
- Save data: none (w.m10 is run state).
- Hooks: game.js fireWeapon -> modFire, spawnProj -> modProj, updateProjectiles -> modStep and modHit; arsenal.js meleeHit -> modMeleeHit; v10.js v10Fire -> modBeam and modBurstEnd, v10Tick -> modTick, v10Draw -> modDraw.
- Risk: Summoned pets can't be hurt (simplified); balance numbers (orbit 0.6x, pet 0.8x, every-4th 2.5x) untuned.

## 2026-10-18 Your statuses from enemy damage types
- Systems: combat (pdef.js), engine
- Files: pdef.js, game.js, pstatus.js, tests/pdeftest.js
- What: an enemy hit that gets past your Membrane applies its damage type's status to you (matrix 11.5): Mucus Snares you (45% speed for 1.5 s, puts out Burning), Blood Bleeds (30% of the hit over 3 s, 3 at most), Fire burns (one shared burn, 20% of the hit over 3 s, at most 25% of max health held), Static Charges you (+20% Static taken for 3 s). Bleed and burn can kill. Each shows on you like on enemies. The old v9 player statuses (Snotty, Sick, Soaking wet, Lubricated) are off under V10.
- Save data: none.
- Hooks: game.js updatePlayer speed -> pdefSpeed (both speed lines); pstatus.js pstHit returns under V10.
- Risk: enemy Mucus/Blood/Fire/Static hits hurt more than before; enemy damage types come from roster.js dmgType.

## 2026-10-18 The eight samples (samples10.js)
- Systems: samples (new), v10, combat, ui
- Files: samples10.js (new), v10.js, fight.js, game.js, pdef.js, ui.js, index.html, tests/samplestest.js (new), tests/v10test.js
- What: the sample screen lists the eight samples (locked ones show their unlock; the Unaccounted shows ??? until earned), then the Experiment (#002 The Petri Dish or #001 The Race). Each sample starts with its own matrix weapon and leans the draft to its types, with its passive: Baseline +5% stats; Overachiever fires 25% faster while moving; Late Starter gets damage and lifesteal below 30% health; Family Friend builds Corrosion 50% faster and its Possessed enemies hit 50% harder; Cold Parcel leaves a Snaring Mucus trail and has 20% Evasion built in; Unsolicited's Static hits add burn; Unaccounted's Possessed enemies make their friends Bleed; Other Half's weapons shift Fire, Soul, Static every 20 s. Unlocks follow SAMPLES.md (wave 10, recover from under 10%, beat the dish, survive a big hazard, Soul boss kill, beat Level 1; Mythical box still has no trigger). Unique Feats come with the Feats merge.
- Save data: META.s10 (unlocked sample ids), META.s10runs (runs per sample, for the 1A/1B IDs). META.profile now holds s10_<id>.
- Hooks: v10.js v10Samples -> s10Samples, v10Loot 'start' -> s10Start, v10Tick -> s10Tick; fight.js fightHit -> s10DmgMul, s10Hit; fightDeath -> s10Kill (game.js now passes src); pdef.js pdEvasion, pdefOffer -> s10Evasion; ui.js quickStart uses s10_baseline.
- Risk: the start draft is now one card (the sample's weapon); old saves' META.profile 'human1' still works through Lab Bench and quick start paths.

## 2026-10-18 v10 mutation cards (merged from agent-muts)
- Systems: upgrades, combat, weapons, mutations (new)
- Files: mutations.js (new), tests/mutstest.js (new), index.html, fight.js, combat.js, game.js, v10.js, arsenal.js, tests/pdeftest.js
- What: 33 mutation cards (body, weapon, damage type, trade-off, rare), 20 Catalyst cards (one per unstable reaction, offered once discovered: +25% reaction damage and a shorter lockout per rank) and 4 Concentration cards (a build-up bar fills faster and drains slower), all in the draft. Eight make up the starting pool. Can't Sit Still is not offered to the Overachiever.
- Save data: none (G.muts, G.cat, G.conc and w.wm10 are per run).
- Hooks: v10.js v10Tick -> mutTick, v10Draw -> mutDraw; fight.js fightHit -> mutDmg/mutBarK/mutHit, rxLocked -> mutRxLock, fightStatus -> mutSnareK; combat.js resolveHit a.barK; game.js killEnemy -> mutKill, hurtPlayer -> mutHurtIn/mutHurt, gainXp -> mutLevel, computeStatsInner -> mutWeaponStats, fireWeapon -> mutFire, projectile hit -> mutProjHit, updatePlayer speed -> mutSpeed; arsenal.js rateBonus -> mutRate.
- Risk: more multipliers in the hit path (balance not simmed yet); the bigger pool dilutes defence cards.

## 2026-10-18 Boss defences, fork screens, smarter auto-pick
- Systems: bosses (boss10.js new), draft, ui, combat
- Files: boss10.js (new), bosses.js, game.js, fight.js, pdef.js, draft.js, ui.js, index.html, tests/bosstest.js (new), tests/drafttest.js
- What: bosses take their defence and damage type from the roster (Kidney Stone 6 Shell layers, Antibody Colossus 5, Chad Prime Evasion, Macrophage Queen Squishy, The Johnny Membrane); the old "+60% from Acid" weaknesses and type immunities are off, and each intro card now says what its defence is and what gets through it. The Queen stops summoning while 8 of her adds live. Fixed: a weapon or Feat fork screen crashed the game (no title). Every level draft now leads with one weapon upgrade. Auto-pick takes the weapon upgrade half the time.
- Save data: none.
- Hooks: bosses.js bossDamageMul skips weak/resist/noForce/weakAoe under V10; game.js boss 'summon' pattern -> boss10SummonOk and tags adds; ui.js openLoot -> draftTitle; ui.js autoTick weapon-upgrade preference.
- Risk: bosses lose their old soft spots, so some fights get longer; balance needs the sims (1 run: died wave 10, weapons up to Lv 10 with two forks).

## 2026-10-18 v10 Feats (merged from agent-feats); draft groups
- Systems: feats (feats10.js new), stamina, draft, ui
- Files: feats10.js (new), index.html, game.js, stamina.js, v10.js, ui.js, draft.js, tests/featstest.js (new), tests/pdeftest.js, tests/mutstest.js
- What: three Feat slots under V10 and 24 Feats (gifts from the consciousness) with levels 1 to 5 and forks at 3 and 5; attacking Feats go through damageEnemy and cost stamina, utility gifts are free; 15 in the starting pool, 9 unlockable. The draft now weights card groups (Feats, mutations, Catalyst/Concentration, defences) as wholes, so big groups don't crowd out the others. mutstest no longer depends on the random start weapon.
- Save data: META.f10unl (unlocked later-pool Feat ids).
- Hooks: game.js newGame (F10_SLOTS), fireWeapon (case 'f10'), updateSpellList and featTap (f10Wait), featFire, computeStats (f10Stats), hurtPlayer (f10Hurt, f10HurtMul), killEnemy (f10Kill), gainXp (f10Xp); stamina.js featCost (f10Cost), sprintMul (f10Speed); v10.js v10Tick (f10Tick), v10Draw (f10Draw); ui.js Feat slot count.
- Risk: Level 5 Feat forks are first drafts (FEATS.md lists only level 3). THIS WAY and the eight sample Feats are not built yet.

## 2026-10-18 Signature weapons and Shocking Impact (merged from agent-sigw)
- Systems: weapons, combat, draft, sigweap (new)
- Files: sigweap.js (new), v10.js, fight.js, game.js, sigs.js, toys.js, armoury.js, arsenal.js, index.html, tests/sigwtest.js (new), tests/v10test.js
- What: 21 favourite originals plus 5 Fire drafts return as one-damage-type, one-attack-type signature weapons (WEAPONS['s_*']) in the slot-draft pool (69 weapons with the matrix). A new dual Force/Static weapon, Rubbed the Wrong Way, alternates shots and sets off Shocking Impact, so all 21 reactions can now happen. Echo damage, pet/lure/chain caps and shared Extraction are enforced.
- Save data: none.
- Hooks: game.js makeSlot (id: def.sigOf || id, sid); v10.js v10Fire/v10Tick (sigwTick)/v10Draw (sigDraw)/v10Loot (v10Pool)/v10Switch; fight.js fightReact -> sigReact; sigs.js afterMine -> sigMine, bladeEats; toys.js toySrc/toyHurt echo, peekBoo, toothFire; armoury.js latch heal, Upchuck merge, bowling depth; arsenal.js Flail tip.
- Risk: signature slots keep the OLD weapon id in w.id (w.sid is the s_ id); undead are stationary turrets; Placental Siphon fires back as Force.

## 2026-10-18 The Scientist and the consciousness, wired (merged from agent-voice) (v10.07)
- Systems: voice, ui, tutorials, narrator (show.js), combat
- Files: voice10.js (new), voice.js (helper renames: its `W` clashed with game.js), index.html, show.js, v10.js, intro.js, bosses.js, fight.js, meta.js, ui.js, tests/voicetest.js (new)
- What: under V10, run events produce Scientist and consciousness lines (at most one commentary line every 20 s, no repeats, Tier 2/3 lines followed by their recovery). Enemy and boss first sightings show one of their two lines. Statuses and defences get a one-line hint the first time they appear. The end screen shows the sample ID (1A, 1B...) and a Scientist line, plus the consciousness on a win. Spectral Combustion's first trigger gets the Tier 3 line.
- Save data: META.vxSt, META.vxEv added; run log entries gain sid.
- Hooks: show.js sysLine -> vxSysLine; v10.js v10Tick -> vxTick; intro.js startFoeIntro -> vxSight; bosses.js startBossIntro -> vxBossIntro; fight.js rxFired -> vxReaction, fightReact -> vxSpectral; ui.js showGameOver/showDishOver -> vxEnd; meta.js runSummary -> vxSid.
- Risk: the old narrator's idle, level, boss, low-health and death chatter is silent under V10. Celestial drops never happen (weight 0), so that line has no trigger.

## 2026-10-18 Field Guide: the 21-reaction chart
- Systems: combat (fight.js), help (inspect.js)
- Files: fight.js, inspect.js, tests/fighttest.js
- What: under V10 the Field Guide's reaction chart is the 7 by 7 grid of the 21 unstable reactions; each stays a question mark until set off once, then names itself and says what sets it off and what it does. Damage type cards list their six partners the same way.
- Save data: none (reads META.rxSeen).
- Hooks: inspect.js rxChartHtml -> rxChart10, INSPECTOR.cell -> rxCell10, inspectGuideHtml and the type card's REACTS WITH row use RX10_ORDER/rx10Pair.
- Risk: none.

## 2026-10-18 Arcade-only look and one type palette (merged from agent-look)
- Systems: ui, render, damage types, look10 (new)
- Files: look10.js (new), index.html, data.js, settings.js, render.js, ui.js, tutorial.js, v10.js, fight.js, pdef.js, mutations.js, feats10.js, newfoes.js, STYLE.md, tests/looktest.js (new)
- What: under V10, Arcade is the only view (View setting hidden, Lab grey and eyepiece never run, the arcade offer is gone). The seven damage types share one palette (Acid shocking pink, Mucus green, Soul purple, Static yellow, Blood red, Fire orange, Force white), including acid pools and crypts.
- Save data: none (SET.view is ignored under V10).
- Hooks: render.js l10Swap(ELEM_SWAP); ui.js settings row filter honours d.hide; tutorial.js viewOffer skips under L10; settings.js viewArcade/hide.
- Risk: Acid and Mucus colours change wherever the old greens were hard-coded; RAW_COL drawing (levels) bypasses the remap.

## 2026-10-18 Role-based wave encounters (merged from agent-waves)
- Systems: waves, enemies, waves10 (new)
- Files: waves10.js (new), campaign.js, index.html, tests/waves10test.js (new), tests/run.sh
- What: under V10 the Petri Dish's 20 waves draw from WAVES10: waves 1 to 4 teach Chaser, Sprinter (Evasion), Shooter and Tank (Squishy) alone; then Thorns, Shell, Membrane and each new enemy (Mosquito, Static Sock, Matchstick, Stress Ball, Birthday Candle, Trapped Wind) are met alone or beside familiar ones, with ENEMY_DESIGN 10's pairs and a big mix at wave 19. Per-wave cap on live enemies (summons count), no stacked disruptive statuses or Pool-makers, caps on live shooters and Pool-makers. Boss waves and CAMP budgets unchanged.
- Save data: none.
- Hooks: campaign.js campBegin -> w10Fresh; campSpawnMob -> w10Spawn; campSpawn -> w10Max.
- Risk: wave composition changes for waves 1 to 19 (sims comparable: waves 9 and 7 vs 10 and 5 before, 2 runs each).

## 2026-10-18 The eight samples' Unique Feats and First Contact (merged from agent-ufeats) (v10.08)
- Systems: feats, samples, combat
- Files: feats10.js, fight.js, tests/ufeatstest.js (new)
- What: each sample starts with its Unique Feat in Feat slot 1: Standard Procedure (Force pulse), Personal Best (Static wake sprint), Second Wind (Blood drain heal, bigger when low), Pulling Strings (marks the toughest: Corrosion on it, Soul on its entourage), Shrink Wrap (Snare ring, then Acid Pools), Reply All (fills a Burn bar, Static arcs spread burn), Recount (Possess up to 6 for 3 s, then each takes a delayed hit), First Contact (the Other Half shifts type and sets off reactions on up to 8 statused enemies, no damage). Each has level 3 and 5 forks (first drafts). Never drafted for other samples.
- Save data: none.
- Hooks: none new in shared files; fight.js gains fightReactAs and inert src.feat guards.
- Risk: Unique Feat numbers and forks are untuned.

## 2026-10-18 Fix: new enemies ran their timers at double speed
- Systems: enemies (newfoes.js), tests
- Files: newfoes.js, game.js, v10.js, tests/dupetest.js (new), tests/run.sh
- What: newfoes.js reused three function names from the old newfeats.js (nfTick, nfKill, nfDraw); the later file won, so game.js ran the new-enemy tick twice a frame (wax walls, trails, Bursts and Mosquito timers at double speed) and render.js drew them extra times. They are now nf10Tick, nf10Kill, nf10Draw, nf10Hit. New dupetest fails if any two loaded scripts declare the same global; the v10 tests are now in run.sh's full list.
- Save data: none.
- Hooks: game.js damageEnemy -> nf10Hit, killEnemy -> nf10Kill, update -> nf10Tick (V10 only); v10.js v10Draw -> nf10Draw.
- Risk: new enemies' timings halve back to their designed values (they were too fast before).

## 2026-10-18 v10 difficulty knob (balance)
- Systems: enemies, bosses, rivals, terrain, waves
- Files: boss10.js, game.js, bosses.js, rivals.js, campaign.js, terrain.js
- What: one tuning object, V10_DIFF in boss10.js, scales v10 enemy health (0.65) and damage (0.6), boss health (0.45, including wave mode's boss formula), rival champions' bullets and contact (0.45) and acid terrain damage to you (0.5). v9's enemy curve was tuned for v9's far bigger builds; with v10's leaner builds the bot died at waves 5 to 9 and never won.
- Save data: none.
- Hooks: game.js makeEnemy, bosses.js spawnBoss, campaign.js campBoss, rivals.js (bullets, contact), terrain.js acid -> V10_DIFF.
- Risk: balance in flux. Sims so far (4 runs each, deaths): before 9/5/8/9; first pass 11/7/8/5; with rivals scaled 10/13/10/8; this pass still running.

## 2026-10-18 Fix: terrain.js failed to load (runs crashed at start)
- Systems: terrain, tests
- Files: terrain.js, tests/dupetest.js
- What: the previous balance commit put a comment in the middle of the acid-crypt line in terrain.js, cutting off its closing brace, so the file didn't load and every new run crashed. Fixed. dupetest now also syntax-checks every loaded script, so a file that won't parse fails the suite.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-18 The 24 weapons and the branch engine (weapons24.js)
- Systems: weapons, draft, weapons24 (new)
- Files: weapons24.js (new), sigweap.js, draft.js, game.js, fight.js, v10.js, index.html, tests/weapons24test.js (new), tests/drafttest.js, tests/run.sh
- What: the game offers only the 24 weapons of BASE_WEAPONS.md (10 foundations, 14 signatures), renamed (Standard Issue, Red Flagship, Family Ties, Skill Issue, There Is No Spoon, Ewww Gross, Sister Cousin, Eggs, Chest Burster, The Runs...) and re-typed (Nappy Mines Fire); every other weapon is archived (Lab Bench only). Switched at Birth retires. Weapon forks move to Lv 3 (pick one of three promises), Lv 6 (the promise's two cards plus its wildcard) and Lv 10 (one of three masteries); the cards come in wup1.js...wup6.js. Rubbed the Wrong Way is archived, so Shocking Impact has no weapon again.
- Save data: none.
- Hooks: game.js computeStatsInner -> wupStats, fireWeapon -> wupFire, killEnemy -> wupKill; fight.js fightHit -> wupDmgMul, wupHit; v10.js v10Tick -> wupTick; draft.js forkCards -> wupForkCards; sigweap.js v10Pool -> W24_IDS.
- Risk: until the card files land, Lv 3/6/10 fall back to modifier forks.
