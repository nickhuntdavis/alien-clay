## 2026-10-25 Feedback animations (v10.135)
- Systems: feedback fx (new), render
- Files: feedbackfx.js (new), index.html, render.js, ARCHITECTURE.md, tests/feedbackfxtest.js
- What: reload arcs round you (tinted by damage type), a pulse on the Feat slot and a flash when a Feat, WINDED or Sprint Start comes off cooldown, an invulnerable shimmer with a start burst and an end flicker, soft heal puffs for any HP gain (rate limited), and a fade-out puff per damage type when a status ends on an enemy or on you.
- Save data: none.
- Hooks: hooks.js tick -> ffxTick (own file); render.js render -> ffxDraw after ringsOnTop.
- Risk: draw cost is small (capped at 40 effects, no per-frame allocation). Per-type looks are a stand-in (`ffxTypePuff`); swap for the ccr-charge-fx helper when it exists.
