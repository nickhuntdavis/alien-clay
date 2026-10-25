## 2026-10-25 One charge-up look per damage type (v10.135)
- Systems: weapons, damage types, ui (world drawing)
- Files: chargefx.js (new), laserbeam.js, newfeats.js, render.js, bosstells10.js, newfoes.js, foes3.js, index.html, tests/chargeshot.js (new), tests/run.sh
- What: `drawChargeFx(x, y, r, k, elem, seed)` draws a charge-up in each damage type's own motion (Force ring, Acid drips, Mucus strands, Static arcs, Cooties rash, Oil gleam, Water ripples, Blood heartbeat, Alien wisps, Fire tongues) and `chargeSnap` draws the release. The Charged modifier now shows its wind-up (it had none); the Laser, Lactic Acid, charger, boss charge, Matchstick and Hayfever sneeze use it too. Boss and charger lanes are unchanged.
- Save data: none.
- Hooks: render.js drawEnemy (charger st 1), bosstells10.js (charge), newfoes.js (Matchstick), foes3.js (hayfever) each call drawChargeFx; chargefx.js wraps modDraw.
- Risk: purely visual; extra gradients while a charge is up (counts scale down with QUAL).
