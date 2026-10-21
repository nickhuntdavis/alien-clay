## 2026-10-21 Feat level-up card says what the level adds
- Systems: feats, draft
- Files: feats10.js
- What: the Feat "enhance" card no longer says "More of whatever it does"; `f10UpText` writes the next level's real gains (+35% damage, effect +20% and area +15% at level 2, effect +20% and cooldown 19% shorter at level 4, 5% shorter cooldown each level, and a fork notice at levels 3 and 5).
- Save data: none
- Hooks: none
- Risk: text only; numbers mirror `f10Stats` and `computeStats`, so change both if those do.
