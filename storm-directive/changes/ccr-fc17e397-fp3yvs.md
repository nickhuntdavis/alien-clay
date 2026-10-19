## 2026-10-19 Attack looks by damage type (v10.31)
- Systems: attack looks (new), render, weapons
- Files: typelook.js (new), v10.js, render.js, toys.js, index.html, tests/tlshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: every attack now wears its damage type, whatever the weapon: Static crackles and snaps short arcs onto nearby enemies (feelers into the water when none is near), Acid drips pink goo that splats and fades, Mucus strings out and sags, Blood spatters, Alien leaves after-images and wisps, Fire sheds tongues and embers. Beams are drawn per type: Static a continuous jagged bolt with forks, Acid a sagging dribbling stream, Mucus a braided rope of snot with beads, Blood an arterial spurt in pulses, Alien a twisting helix, Fire a flamethrower plume. Soulmate Signal's twin beam is a living bolt. Bursts, swings, lashes and pools get the same per-type flourishes. Cosmetic only (no damage).
- Save data: none. Run state `G.tlook` (particles and arcs; `G.tl` is the run log's timeline).
- Hooks: v10.js v10Tick -> tlTick, v10Draw beam loop -> tlBeam; render.js after your shot loop -> tlShots, after drawTypeFx -> tlDraw; toys.js twin beam -> tlSeg.
- Risk: frame time with many typed shots (particles capped at 280, arcs at 40, shots decorated at 60 a frame; perf18 passes). Bursts are spotted by ring colour, so any ring in a type colour gets that type's flourish.
