## 2026-10-25 Level 1 enemies on the v10 roster (handoff A5)
- Systems: campaign (levels), fight
- Files: levels.js, fight.js
- What: Level 1's five germs and the Tartar Colony are now built on first use (after the roster is wired), so they keep their base enemy's v10 defence and attacks instead of pre-roster copies; the Colony gets the Colossus's Shell x5 and no armour, and its HP takes the V10_DIFF.bossHp knob like every other mode. Its description is `TODO_COPY:tartar_desc`; its strengths and weaknesses are the Colossus's v10 ones.
- Save data: none
- Hooks: fight.js fightId falls back to `def.rosterId` (set on the Level 1 copies).
- Risk: Level 1 enemies are tougher or squishier by their base's v10 defence; Colony HP is about 0.45x what it was. Level 1 balance not re-simmed beyond one bot win (207 s).
