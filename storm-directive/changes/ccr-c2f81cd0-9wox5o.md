## 2026-10-26 Weapons stop at Lv 9; Trophy Polish fills kill bars; one level per screen (v10.148)
- Systems: weapon levels, loot (boss spoils), tests
- Files: wmods.js, tests/wmodstest.js, tests/v9armstest.js
- What: wCap is capped at MM.lvlCap (9) for weapons (it was the v9 Lv 10, so Trophy Polish could raise a weapon to Lv 10). Under the kill bar, Trophy Polish fills every weapon's bar instead of adding a raw level (a raw level skipped branch tiers for good). A level screen now leaves the weapon exactly one level up (a branch card granting a modifier levelled it twice, e.g. v_soul_proj Lv 2 > 4).
- Save data: none
- Hooks: none in shared files. Wraps game.js wCap and spoils.js SPOILS.trophy.
- Risk: anything reading wCap for weapons now sees 9 (v9 tier screens no longer offer a Lv 10 tier; they are retired in the live game). v9armstest updated to match.

## 2026-10-26 Weapons level from their own kills; modifier screens between branch tiers (v10.147)
- Systems: weapon levels (new), modifier cards, draft, branches back, stat bonuses, sidemo (stage), ui (HUD slot), tests
- Files: wmods.js (new), index.html, style.css, tests/wmodstest.js (new), tests/run.sh, tests/sim/wave20.js (per-wave weapon levels `wl`), tests/tools/guide.js, ARCHITECTURE.md
- What: each weapon fills a kill bar (its own kills, thin bar under its HUD slot); a full bar opens its next level. Lv 3/6/9 are the branch screens; Lv 2, 4, 5, 7, 8 (and after 9) are modifier screens in the Weapon Draft layout with 3 cards for that weapon, REROLL and SKIP (+2 rerolls, no level). Level-ups and DNA strands no longer deal modifiers or Switched at Birth; small stat cards (2 steps of a statup.js stat) take their place. The free weapon level every 4th player level is off. One drawn loop per modifier on the stage, shaped by the weapon's attack type.
- Save data: none (run state only: w.wmK, w.wmQ)
- Hooks: none in shared files. hookOn('kill', 'wmKill'); wraps xbrTick, forkCards, draftBox, sivDraftKind, sivDraftHead, sbDraftInfo, makePreview, modDraftCands, modBoxCards, wupLevel, UI.openDraft, UI.refreshHud.
- Risk: weapon power curve (bot wave20 mortal: old rules 1 of 4 wins, every weapon Lv 9 by wave 10; kill bar at WM.k0 16 / kg 0.5: 2 of 4 wins, best weapon Lv 9 around wave 15). Branches that queue modifier cards or wrap modDraftCands for level-ups (raceplan, sabtiers, spslice, modpick) now only act on the weapon screens. Open copy: TODO_COPY:wm_title, wm_sub, wm_stat_tag, wm_stat_quip.
