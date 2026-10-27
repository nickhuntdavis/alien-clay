## 2026-10-27 Orbiting bodies look like the weapon's shots (v10.181)
- Systems: modifiers, rendering
- Files: modifiers.js, render.js, typelook.js
- What: Orbiting (Hangers-On) bodies on non-beam weapons now draw as the weapon's own projectile (style, colour, size and damage-type look) instead of plain dots; `orbShots()` hands display-only copies to the shot draw loop and tlShots. Beams keep their dots.
- Save data: none.
- Hooks: render.js shot loop and typelook.js tlShots iterate orbShots() instead of G.proj.
- Risk: none to balance (display only); other branches editing the render.js shot loop's first line will conflict.
