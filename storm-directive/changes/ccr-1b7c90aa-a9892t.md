## 2026-10-26 Orbiting: Extra, Rapid Fire, Charged and magnetic Homing (v10.162)
- Systems: Delivery forms (Orbiting), modifiers
- Files: delivforms.js, tests/delivtest.js
- What: on an orbiting projectile or contact weapon, Extra Projectiles adds 1 / 2 / 3 bodies, Rapid Fire spins the ring 30 / 60 / 100% faster, and Charged makes bodies hit for a quarter while they glow, then each blasts (radius 40, twice a body hit) every 4 / 3.5 / 3 s. Homing no longer sends a body off to chase: each body bends towards the nearest enemy within 120 (up to 25 / 40 / 55), so the ring warps like a magnet is pulling it. Beam rings are unchanged. Link already joined the bodies.
- Save data: none.
- Hooks: none (modOrbit wrapper in delivforms.js now also runs for Extra, Rapid Fire and Charged: xdOrbBodies).
- Risk: Orbiting with Charged hits softer between blasts (balance unsimulated); MOD_DEAD not regenerated (these three were already live combos). Card text for the four orbit lines written on request (v10.163).
