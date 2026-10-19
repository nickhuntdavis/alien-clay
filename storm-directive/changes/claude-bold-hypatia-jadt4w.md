## 2026-10-19 Mutation, modifier and Feat screens look like what they change (v10.33)
- Systems: box looks (new), mutation drops, modifier cards, draft, ui
- Files: boxlook.js (new), mutdrop.js, modcards.js, draft.js, ui.js, index.html, style.css, tests/mutdroptest.js
- What: an elite's strand now opens a MUTATION screen (pick 1 of 3) with your sperm drawn at the top and its stats (health, speed, damage, attack speed, pickup range, Genome slots) and what it already carries. DNA strands open a WEAPON MODIFICATION screen of modifier cards only, with your weapons and their three modifier slots at the top; each card names its weapon. Feat cards in level-ups glow violet and read SPECIAL ABILITY. Card frames differ: rounded flesh for mutations, square steel for modifiers.
- Save data: none.
- Hooks: ui.js openLoot -> boxLook, renderLootCards -> boxCardCls, tick -> boxTick; draft.js draftLoot -> mdCards (kind 'mutation') and modBoxCards (chest, boss); draftBox opens 'mutation' at once.
- Risk: DNA strands no longer deal weapon upgrades, Feats or defences when a modifier fits (they fall back to the old draft when none does).
