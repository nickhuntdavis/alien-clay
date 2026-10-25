## 2026-10-25 Strike from Above forms for Flight and Crowd modifiers (task 3, batch 3)
- Systems: modifier cards, weapons (Delivery), laser, tests
- Files: delivforms.js, moddead.js (regenerated), tests/delivtest.js, ARCHITECTURE.md
- What: Homing, Bounce, Returning, Link, Pull and Knockback now have a Strike from Above form (MODIFIER_MATRIX.md 5.11). The marker follows its target (Homing) and pulls enemies onto it (Pull); the strike lands again on up to 1 / 2 / 3 nearby enemies at 60% (Bounce), sends a line of small strikes back to you (Returning), is joined to the last strike by a 2 s damaging beam (Link) and shoves outward from where it lands (Knockback). The Laser's orbital strikes get the same forms (a new target on Homing, a short second orbital strike on Bounce, a beam sweeping back on Returning). Card text is TODO_COPY:xd_dfa_<mod> until the user writes it.
- Save data: none.
- Hooks: none in shared files. delivforms.js wraps modwide.js mwDfa and laserbeam.js lzOrbital (plus another mwTick and lzExtrasTick wrap).
- Risk: Strike from Above builds with these modifiers deal more damage (bounces, walk-back strikes, link beams). The Laser's orbital strike hits run in delivforms.js (a copy of lzExtrasTick's formula) whenever one of the six modifiers is held: a change to that formula in laserbeam.js must be copied to xdOrbs.
