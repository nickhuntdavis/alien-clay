## 2026-10-22 Loot only from level-ups and boss kills (v10.68)
- Systems: loot rules (new), reward director, mutation drops, kindred, loot
- Files: lootrules.js (new), mutdrop.js, index.html, tests/lootrulestest.js (new), tests/kindredtest.js, tests/mutdroptest.js, tests/run.sh, ARCHITECTURE.md
- What: card screens now come only from levelling up (level drafts, weapon drafts, Feat forks, weapon upgrades) and boss kills. DNA strand pickups and elite mutation carriers are gone (mutations are back in level drafts); a boss kill gives one box (weapon modifiers when one fits) that opens at once, mid-wave too; weapon upgrade and branch screens open the moment they are earned. Kindred rescues and Level 0's lesson box are kept.
- Save data: none.
- Hooks: none in shared files (lootrules.js wraps draftBox, bossDown, chestOr, kinDna, v10Tick); mutdrop.js mdDraftSkip reads lrOn.
- Risk: fewer rewards (no strands, modifiers only from bosses), so runs may be harder; 2 bot wave runs: one died at the wave 10 boss, one reached wave 18. kindredtest and mutdroptest now run with window.LOOT_ANY (the old sources). rewarduitest and weirdbox fail on main too (unchanged).
