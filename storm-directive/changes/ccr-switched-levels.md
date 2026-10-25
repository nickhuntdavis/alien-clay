## 2026-10-25 Switched at Birth in three levels (v10.135)
- Systems: weapons, draft, chemistry
- Files: sabtiers.js (new), index.html, ARCHITECTURE.md, tests/sabtierstest.js (new)
- What: Switched at Birth now levels. Level 1: 35% of attacks use the new damage type; Level 2: 70%; Level 3 opens a fork: Full (every attack) or Blend (every attack in the new type at 60%, plus an echo hit of the original type at 60%). The per-attack swap changes the weapon's def when it fires, so projectile colour and switched effects follow the shot. Later copies of the card on a switched weapon rank it up (it takes no extra slot). Card and fork text are TODO_COPY placeholders (sab_l1_desc, sab_l2_desc, sab_l3_desc, sab_l3a_name/desc, sab_l3b_name/desc).
- Save data: none (run state only: w.sab).
- Hooks: none in shared files; hookOn dmgMul and proc from sabtiers.js. Wraps fireWeapon, sabCard, modDraftCands, mmHeld, modOk.
- Risk: weapons whose damage lands later (pools, mines, bubbles, contact) read the type at hit time, so their observed share drifts from 35/70%. Starting-switched samples stay fully switched with no levels. modstest already fails on the branch before this change.
