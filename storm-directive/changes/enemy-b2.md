## 2026-10-25 Killer T-Cell fires a telegraphed Beam (B2, not shipped)
- Systems: new enemies, player defences
- Files: lancer10.js (new), index.html, roster.js, pdef.js, game.js, tests/newfoestest.js, tests/pdeftest.js
- What: the Killer T-Cell holds range, lights a fixed lane to you for 0.9 s (nothing hurts during it), then fires a 0.4 s Beam of four hits down that lane, stopped by walls. Hits go through `hurtPlayer` as kind `beam`, so Evasion and the old dodge roll never apply and leaving the lane avoids it; Membrane and Shell still do. Force or Static hits during the wind-up interrupt it. Its v9 `shoot` row is gone.
- Save data: none
- Hooks: pdef.js PDEF_ATK gains `beam: 'beam'`; game.js hurtPlayer skips the old `P.dodge` roll when kind is `beam`; `proc` hook (lancerInterrupt); wraps `nf10Draw`.
- Risk: damage is the roster 16 per Beam, then the usual V10 hurt scaling (about 12 landed in tests). Unsimmed. `ENEMY_BEHAVIOUR.md` not regenerated.
