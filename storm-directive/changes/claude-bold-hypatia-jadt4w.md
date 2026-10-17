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
