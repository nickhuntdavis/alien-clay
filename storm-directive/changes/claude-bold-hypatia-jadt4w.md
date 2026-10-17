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

## 2026-10-17 Redesign docs: enemy decisions recorded
- Systems: docs only (redesign docs)
- Files: redesign docs/ENEMY_DESIGN.md, COMBAT_MATRIX.md, DAMAGE_TYPES.md
- What: Stress Ball is fixed Squishy with a telegraphed rebound every 5th Force hit; Carrier rule (reuse reaction ingredients when they fit); one merged role list (adds Leech, Relay, Sniper; matrix section 5 renamed to match); Soul Mark is the Soul enemies' hook, Fear is selective; Static Sock builds Crackle (not Charge); one shared Poise meter for Force and tagged Static.
- Save data: none.
- Hooks: none.
- Risk: the Soul wording (essence and non-physical resources) differs from the v10 NOTES line "Soul is the mind-control type".

## 2026-10-17 Redesign docs: five defences only, attack types, enemy design
- Systems: docs only (redesign docs)
- Files: redesign docs/ATTACK_TYPES.md (new), ENEMY_DESIGN.md (new), COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, README.md, tables/*.csv
- What: purged Fearless, Bloodless, Fire Resistance, Soul ward and loose "shield"/"armour" wording (only Squishy, Membrane, Shell, Thorns, Dodge remain); Soul Erosion now refreshes the Soul mark. Listed the six attack types used by v10.js. Added the enemy design doc in the new vocabulary, with three Fire enemies and a Smouldering elite.
- Save data: none.
- Hooks: none.
- Risk: zealous-clarke NOTES says traits arrive with the enemy redesign; this removes them from the docs.
