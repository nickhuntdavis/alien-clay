# ccr-1ac49716-yz41yr

## 2026-10-26 Reverse Tooth Fairy (v10.153)
- Systems: weapons (Eggs), modifier cards, tests
- Files: rtooth.js (new), index.html, tests/rtoothtest.js (new), tests/wfusiontest.js (lardmine check tracks the furthest launch: it was flaky), BASE_WEAPONS.md, ARCHITECTURE.md
- What: Eggs switched to Blood can take Homing (plain Eggs still can't). With both, Eggs fires homing teeth instead of dropping eggs; teeth embed and Bleed; a bleeding enemy holding 3 teeth (2 at Homing Rank 3) thrashes for 3 s and bites its mates; bosses never thrash; Homing mastery makes bites plant teeth. Its float text is TODO_COPY:rt_float.
- Save data: none.
- Hooks: none in shared files (hookOn tick and proc; wraps toothFire, modOk, modDraw).
- Risk: thrashing enemies are capped at 6; bite damage is untested for balance.

## 2026-10-26 Fused weapons show their fused name (v10.152)
- Systems: weapons (fusion), ui
- Files: wfusion.js, tests/wfusiontest.js
- What: a fused weapon wears its own name and description (WF_TEXT, TODO_COPY until the user writes them) everywhere the game shows a weapon's name: hold card, Tackle Box, drafts, run summary. It is a per-slot copy of the def over the original (as wRecolour does), re-applied if another system swaps the def; skipped on a weapon carrying Switched at Birth.
- Save data: none.
- Hooks: none.
- Risk: code that compares w.def to WEAPONS[id] by identity misses the fused weapon (acro.js only, whose weapons are in no pair).

## 2026-10-26 Weapon fusion replaces the v10 combos (v10.151)
- Systems: weapons (fusion, new), combos (retired under v10), draft, ui (HUD slot), tests
- Files: wfusion.js (new), index.html, mobfeats.js (mobTick global, for hookstest), tests/wfusiontest.js (new), tests/combo10test.js, combo3test.js and v9armstest.js (set WF.on = false), ARCHITECTURE.md
- What: two weapons from 8 listed pairs, both at HUD Lv 3, offer a fusion card. Fusing folds the second into the first (it leaves the HUD, keeps firing with its own modifiers and levels with the first), opens a weapon mount with a draft, and adds the pair's power (zapbub, acidmess, sibshot, peekegg, hotcore, lardmine, pinclock, snotfire). Declining asks again after the first weapon's next level. The v10 branch combos and v9 combo partner swaps are off under v10. Names and card text are TODO_COPY.
- Save data: none (run state only: G.wf, G.wfAsked, w.wfIn, w.wfWith).
- Hooks: none in shared files (hookOn tick and proc; wraps v10Loot, draftTitle, availableCombos, wupForkCards, sbSlotMark, modOk, bubblePop, peekFire, detonateMine).
- Tests: after merging main (v10.148), statuptest still fails (Enzyme Sneeze dps ratio 1.48), as it does on main; everything else that was run passes. Merge fix: the v10.150 commit carried conflict markers in moddead.js, meta.js and build.gradle; resolved in the v10.151 commit.
- Risk: weapon count can reach 4 entries (one hidden); systems that count G.weapons see the absorbed weapon. Combo achievements and Field Guide combo pages no longer progress under v10.

## 2026-10-26 Unwanted Contact zip-zap (v10.151)
- Systems: weapons (Unwanted Contact), modifier cards, tests
- Files: zapper.js (new), index.html, moddead.js (s_tesla row), tests/zappertest.js (new), BASE_WEAPONS.md, ARCHITECTURE.md
- What: Unwanted Contact fires one quick spark at one target instead of a 3-jump chain. Ricochet forks it (1/2/3, mastery forks again), Piercing runs a line (1/3/6/12), Homing goes for enemies not yet Charged, Area splashes, Charged Charges in one hit (mastery zaps Charged enemies within 200), Rapid Fire mastery adds a spark. Jumps from Chain Letter or promise cards still chain. Ricochet, Piercing, Homing and Area are offered on it again.
- Save data: none.
- Hooks: none in shared files (wraps v10Fire after laserbeam.js).
- Risk: much less crowd damage at base for Redtail (sims running); Static's own arcs off Charged enemies are unchanged.

## 2026-10-26 Static looks grow with weapon level (v10.149)
- Systems: type looks (typelook)
- Files: typelook.js
- What: Static visuals start as a faint pale crackle at weapon Lv 1 (thin beam, short rare arcs, no glow or forks) and only become full forked lightning near the Lv 9 cap. The level comes from the firing weapon where known (shots, pools, the twin), else your highest-level Static weapon; Static from no weapon of yours (Feats, reactions with no Static weapon held) stays full. Chain bolts in the Static colour flatten, lose forks and fade sooner while weak.
- Save data: none.
- Hooks: typelook.js wraps game.js bolt (Static-coloured bolts only).
- Risk: reaction arcs (Static colour) also look quieter while your Static weapon is low level.

## 2026-10-26 Brave Phase and Puddle Jumper Feats (v10.148)
- Systems: Feats (v10), tests
- Files: mobfeats.js (new), index.html, tests/mobfeatstest.js (new), tests/featstest.js, FEATS.md (F16, F17), ARCHITECTURE.md
- What: two new mobility Feats in the starting pool. Brave Phase: a see-through, untouchable Force dash at 2.6x speed for 0.6 s that hits each enemy you pass through once; autorun aims it down the busiest line, manual steering bends it, walls stop it. Puddle Jumper: a Mucus tap teleport (300) behind the biggest enemy with a backstab when you carry a close-range weapon, else to the safest spot; you leave a Mucus splash and puddle. Card text is TODO_COPY.
- Save data: none.
- Hooks: none in shared files (hookOn tick 'mobTick'; wraps newfeats.js nfSpeed and feats10.js f10Draw).
- Risk: the Feat starting pool grows from 18 to 20, so other Feats are offered a little less often. Brave Phase moves you directly (like f10Lunge), so it ignores swim physics for 0.6 s.

## 2026-10-26 Alien damage type renamed Parasite (v10.147)
- Systems: chemistry, damage types, ui (glossary), docs
- Files: 41 web/js files and index.html (text and comments only), glossary.js (the bar regex matches "alien bar" or "parasite bar"), tests (assert messages), tests/tools/guide.js, COMBAT_MATRIX.md, DAMAGE_TYPES.md, redesign docs/CLAUDE.md, CLAUDE.md, STYLE.md, ARCHITECTURE.md
- What: the user renamed the Alien damage type to Parasite (you take enemies over). Every player-facing "Alien" is now "Parasite" ("an Alien" became "a Parasite"; the reaction ALIEN ROT is PARASITE ROT). The internal id stays `soul`, statuses keep their names (Possessed), and the Not of This World sample keeps its name and alien theme.
- Save data: none.
- Hooks: none.
- Risk: text only. Card_Copy_Draft_All.xlsx and GIFT_LINES.md still say Alien (cardvoice.py and giftvoice.py key off the "Not of This World (Alien)" column), as do the other redesign docs; neither puts the word on screen.
