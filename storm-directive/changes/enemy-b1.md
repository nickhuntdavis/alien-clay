## 2026-10-25 Marked bursts: Acid Bubble and Snot Bubble (enemy handoff B1)
- Systems: enemies
- Files: bursts10.js (new), roster.js (bomber ai -> new_bomber), game.js (one ai name in the danger weight), index.html, ARCHITECTURE.md, tests/newfoestest.js
- What: the Acid Bubble stops near you, marks its ring for 0.5 s, then bursts once (18, Burst, Evasion never applies) and leaves an Acid Pool; killed first it only pops the pool (no blast, no friendly fire). A Snot Bubble killed by you marks its splash area for 0.5 s before it lands, then leaves a Mucus Pool (80 radius, 4 s, Snotty while you stand in it); Static still pops it at once and harmlessly.
- Save data: none
- Hooks: hooks.js tick and kill via hookOn; wraps nf10Draw (newfoes.js) and foes3Kill (foes3.js, deferred only when called with a src, so f3test is unchanged)
- Risk: the Acid Bubble's old contact-kill blast and its friendly fire are gone; Acid Pool tick damage (0.2 x 18 per 0.5 s) and Snot pool dose (0.6 s) are my choices, the roster gives none. Levels' Amylase Droplet copies the bubble and inherits it.
