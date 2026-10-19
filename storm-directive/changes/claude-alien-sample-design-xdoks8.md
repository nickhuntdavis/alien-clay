# claude/alien-sample-design-xdoks8

## 2026-10-19 Not of This World's card shows the creature (v10.30)
- Systems: samples
- Files: alienyou.js, samples10.js, tests/alienyoushot.js
- What: its card on the sample screen has a live picture of it, hanging and pulsing, cycling through its moods and its Fire, Alien and Static core colours. Tentacles now start laid out straight instead of in a knot. alienYou's drawing is split into alienDraw (no G needed).
- Save data: none.
- Hooks: samples10.js s10Samples -> alienPicStart (and the card list adds a canvas to the alien card).
- Risk: none (title screen only; the loop stops when the card leaves the page).

## 2026-10-19 Not of This World gets its own body (v10.29)
- Systems: samples, render
- Files: alienyou.js (new), render.js, seqsel.js, index.html, tests/alienyoushot.js (new)
- What: the Not of This World sample is no longer drawn as a sperm. It is a translucent indigo bell with a split, glowing core and seven tentacles with glowing tips, swimming by jet pulses. Its mood shows (idle, curious, alert, agitated, hurt), and the core and tips take the colour of the current Adaptive Biology type (Fire, Alien, Static). Pause portrait too.
- Save data: none.
- Hooks: render.js drawShip -> alienYou; seqsel.js drawSeqMods -> alienYouOn.
- Risk: visual only; hitbox and swim physics unchanged (its tail never runs stepTail, so p.ext/p.behind stay at their defaults). Body-look upgrades (cilia, barb, armour plating) don't show on it.
