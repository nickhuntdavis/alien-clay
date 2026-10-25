## 2026-10-25 Orbiting forms for Flight and Crowd modifiers (task 3, batch 4)
- Systems: modifier cards, weapons (Delivery), laser, tests
- Files: delivforms.js, moddead.js (regenerated), tests/delivtest.js, tests/moddead.js, ARCHITECTURE.md
- What: Homing, Bounce, Returning, Link, Pull and Knockback now have an Orbiting form (MODIFIER_MATRIX.md 5.11). Bodies break off to chase an enemy within 150 and fly back (Homing), rebound to one more enemy within 80 / 100 / 120 at 60% (Bounce), fling out to double radius and back every 3 / 2.5 / 2 s (Returning), are joined by a damaging beam (Link), drag enemies within 40 / 60 / 80 onto the ring (Pull) and bat what they hit away from themselves (Knockback). A beam's ring (the Laser's and the hoop) sends sparks off to chase, flings, hits enemies crossing it and pulls; the hoop's hits rebound with Bounce. Card text is TODO_COPY:xd_orbiting_<mod> until the user writes it.
- Save data: none.
- Hooks: none in shared files. delivforms.js wraps modifiers.js modOrbit and weapons24.js wupFire (plus another mwTick and modDraw wrap); hookOn('proc', 'xdOrbProc').
- Audit: full run 598 NO-OP of 2810 (main last recorded 631, before batch 3). Standard Issue 18 -> 16, Laser 10 -> 9.
- Risk: Orbiting builds with these modifiers deal more damage. When one of the six is held, the bodies run in delivforms.js xdOrbit (a copy of modOrbit plus the forms): a change to modOrbit must be copied there.
