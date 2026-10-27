## 2026-10-27 XP specks smaller and dimmer (v10.190)
- Systems: xp granules
- Files: xpgems.js
- What: specks about 40% smaller, glow at half strength, shorter and fainter tails (user: too big and bright).
- Save data: none.
- Hooks: none.
- Risk: granules are harder to spot on busy screens.

## 2026-10-27 XP granules become specks of flowing light (v10.189)
- Systems: xp granules, render
- Files: xpgems.js, render.js
- What: XP granules are drawn as small glowing motes (bright white core, coloured bloom by size: blue, green, gold, violet) that twinkle, idle in a slow loop and trail a short tail of light, longer while flying to you. XPG.light = false restores the dark diamonds.
- Save data: none.
- Hooks: render.js gem pass -> xpgDraw (one line).
- Risk: purely visual; specks are smaller than the old diamonds, so granules may read less on busy screens.
