## 2026-10-27 Orbiting Link beam is a circle (v10.185)
- Systems: Delivery forms (Orbiting), tests
- Files: delivforms.js, tests/delivtest.js
- What: Orbiting + Connecting's beam ran in straight lines between the bodies (a triangle with three). It now runs round the ring as a circle through the bodies, bending smoothly only where a body is pulled off the ring (Homing, Bounce); the damage follows the same curve (xdLinkPolar / xdLinkR), so an enemy inside the ring is no longer cut by a chord.
- Save data: none.
- Hooks: none.
- Risk: Link hits the ring's band instead of the chords: enemies between you and the ring (the old triangle's edges) are no longer hit, enemies on the ring between bodies now are.
