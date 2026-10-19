# claude/alien-sample-design-xdoks8

## 2026-10-19 Tails attach cleanly (v10.33, with the upgrade marks and the bold-hypatia merge)
- Systems: samples
- Files: samplelooks.js, alienyou.js
- What: the tail now leaves from the neck as drawn: its root follows the head's rock, squash and stretch (Squishy, the speed stretch, damage bulk) and Can't Sit Still's jitter, and leaves along the midpiece. Natural tails' root width matches the midpiece. The alien's tentacles stay on the rim of the bell when it squashes.
- Save data: none.
- Hooks: none.
- Risk: none (the swim physics reads the tail's shape; its root moves by a unit or two at most).

## 2026-10-19 Upgrades show on the body
- Systems: samples, mutations
- Files: samplelooks.js, tests/upbodyshot.js (new)
- What: non-defence upgrades change the v10 bodies. Stats (from any source): damage bulks the head, swim speed stretches it and lengthens the tail, attack rate quickens the tail beat, pickup range adds a faint receptor field. Each body and trade-off mutation has a mark (Slipstream wake, Extra Padding pads, Sticky Fingers hairs, Heartbeat heart, Hard to Hold drips, Spare Parts sac, Overexcited lines, Personal Space ripple, Big Brain brain, Quantity Over Quality buds, Can't Sit Still jitter, All at Once barb, Hungry Hungry belly, No Time for Being Careful stripes, Growing Pains stretch marks); a damage type mutation dyes the neck. The alien gets them too.
- Save data: none (G.slBase, run only: the stats at the run's start).
- Hooks: none new (inside samplelooks.js slDefState/slDefUnder/slDefOver, already hooked).
- Risk: visual only.

## 2026-10-19 Defences on the body, samples in the Field Guide (v10.32)
- Systems: samples, defences, ui
- Files: samplelooks.js, alienyou.js, pdef.js, ui.js, portraits.js, tests/defbodyshot.js (new), tests/codexsamples.js (new)
- What: your defence cards now change your body. Shell is shaded brown armour bands wrapping the head front first (one band per layer, a collar at 4; cracks and chips as it wears; a front cap only on the alien so its core shows) instead of rings. Squishy makes the head jelly: its squash and stretch is about three times bigger and overshoots, and hits squash it flat. Thorns are spikes raked back along the head; Evasion leaves after-images. The Field Guide has a SAMPLES tab: each sample with its live picture, family, origin, passive and lab note.
- Save data: none.
- Hooks: ui.js codexHtml -> slCodex (and a SAMPLES chip in the tab list); portraits.js portraitsStart -> slPicStart; pdef.js pdefDraw skips Shell rings when sampleLookOn; alienyou.js alienDraw -> slDefState/slDefUnder/slDefOver.
- Risk: visual only. Shell no longer draws as rings round v10 samples (only on the body).

## 2026-10-19 Every sample gets its own body (v10.31)
- Systems: samples, render
- Files: samplelooks.js (new), alienyou.js, render.js, seqsel.js, samples10.js, index.html, tests/lineupshot.js (new), tests/alienyoushot.js
- What: three visual families. Natural: Baseline (textbook), Alpha (long, pointed, big striped midpiece, longer tail), Beta (small, bent neck, droplet, coiled tail tip, plaster). Engineered: Private Schooled (lacquered navy, gold trim, crest, school-tie midpiece, braided tail), Ordered Online (moulded plastic box with seam, barcode, crooked sticker, misaligned cap, ribbed hose, zip-tie tail, frost). Anomalies: Redtail (lumpy wobbling red head, twitchy hairs, frayed tail, embers), Prawn Again (white-gold, halo, wings, light rays, an echo). Every sample card has a live picture of its body.
- Save data: none.
- Hooks: render.js drawShip -> sampleLook (replaces alienYou); seqsel.js drawSeqMods -> sampleLookOn (replaces alienYouOn); samples10.js s10Samples -> slPicStart (replaces alienPicStart).
- Risk: visual only; hitbox and swim physics unchanged. Body-look upgrades (cilia, barb, plating) and sequence marks don't show on v10 samples.

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
