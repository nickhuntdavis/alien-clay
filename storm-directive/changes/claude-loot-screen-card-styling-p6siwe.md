## 2026-10-24 Loot cards: neutral with targeted colour
- Systems: ui, rewardui
- Files: style.css, js/uikit.js, js/ui.js
- What: loot screen cards are now neutral. Colour only on the rarity word, the reward-type label (MUTATION, DEFENCE, FEAT and so on, top right, in its rw-* category colour) and a left border in the damage-type colour when the card has one.
- Save data: none
- Hooks: none (uiLootCard wraps the tag text in span.tk; ui.js sets --ec)
- Risk: Lab view/e-ink skins may still style .card borders elsewhere; check visually.

## 2026-10-24 Fit line moves to press and hold
- Systems: rewardui, glossary
- Files: js/rewardui.js, js/glossary.js
- What: the Direct / Fits your build / Wildcard / Trade-off line is gone from loot cards and shows in the press-and-hold card instead. Feat "Next level" numbers stay on the card.
- Save data: none
- Hooks: glossary.js cardGlossary -> rwFitHtml(o, true)
- Risk: none
