## 2026-10-26 Puddle Jumper: your puddles are portals (v10.166)
- Systems: feats (mobility)
- Files: mobfeats.js, tests/puddlejumptest.js (new)
- What: while you hold Puddle Jumper, swimming into any puddle you made (not The Runs' trail or a Hotbox) pops you out of your most distant puddle, 2.5 s apart, no stamina; portal puddles get a faint dashed ring. A tap jumps to the most distant puddle at once; with none, the old backstab or safe-spot jump. Every jump still leaves a Mucus splash and a puddle (a way back).
- Save data: none
- Hooks: none in shared files
- Risk: puddle-heavy builds can chain jumps every 2.5 s (PJ.gap); the Lv 5 Long Jump fork now only lengthens the no-puddle fallback. New placeholder TODO_COPY:feat_puddle_jumper_does. newfeattest fails on main already (mosquito and others: nostatus).

## 2026-10-26 BUILD tab: modifier ranks as pips (v10.165)
- Systems: pause (build panel)
- Files: buildpanel.js, style.css, tests/buildbtntest.js
- What: each weapon's modifiers on the BUILD tab are now one tag each with their rank as pips out of 3 (a 4th, ringed, once mastered) and the branch taken, then the slot count, in place of one comma list with roman numerals.
- Save data: none
- Hooks: none
- Risk: none

## 2026-10-26 Sperm button: shortcut to the BUILD tab (v10.164)
- Systems: hud, pause
- Files: buildbtn.js (new), index.html, tests/buildbtntest.js (new)
- What: a sperm-icon HUD key left of RUN; one tap pauses on the BUILD tab (the pause button still opens on YOU). In the portrait Immersive HUD it takes Rewind's spot, moving one slot left while Rewind is on.
- Save data: none
- Hooks: none in shared files (adds #spermBtn before #moveBtn at load; calls UI.togglePause, UI.renderPause).
- Risk: another branch that moves RUN or Rewind in eink.css would need this key's left offset moved too.

## 2026-10-26 Stat cards roll a rarity (v10.163)
- Systems: draft, stats
- Files: wmods.js, tests/statrartest.js (new)
- What: level-up and DNA strand stat cards (Crit Chance, Max Health and the rest) each roll a rarity like other loot (skipped-box floors count), and rarer ones give more: Common 1.5 steps, Uncommon 2 (the old fixed card), Rare 3, Epic 4, Legendary 6 (WM.statSteps). The average deal stays about 2 steps.
- Save data: none
- Hooks: none
- Risk: stat power per run is about the same on average but swingier; a Legendary Bullet Damage card is +18%.

## 2026-10-26 Rank pips on loot cards (v10.162)
- Systems: reward cards, draft
- Files: rankpips.js (new), index.html, tests/rankpipstest.js (new)
- What: a loot card that ranks up something you already hold (defence, modifier, Feat, mutation, health/vitals/perk and v9 upgrade cards) shows "Lv N" (the rank after taking it) and a row of pips under its title: held ranks filled, the new one ringed and pulsing, ranks still to come hollow. New cards show none. The Runs' upgrade card also shows its next rank's numbers (Area, Lasts, Damage before → after) in the Feat card's "Next level" line.
- Save data: none
- Hooks: none in shared files (wraps ui.js UI.renderLootCards, after dsheads.js, and rewardui.js rwDelta).
- Risk: a card family that reports its rank some new way gets no pips (falls back to parsing "Rank r > r+1 of m" in the sub line).
