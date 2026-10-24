## 2026-10-24 v9 samples back on the Sample Rack (v10.121)
- Systems: samples (rack), matrix only
- Files: matrixonly.js, samples9.js, tests/v9lookshot.js
- What: the eleven v9 samples are on the rack again, open from the start, and start like every sample with an offer from the matrix's 27 weapons (not their v9 starters). A picked v9 sample whose v9 sequence is still locked (e.g. The Favourite) now runs as itself instead of falling back to The Firstborn.
- Save data: none (META.v9pick reused).
- Hooks: none.
- Risk: v9 traits and abilities with matrix-only weapons are unsimmed; v9 sequence synergies name v9 weapons that are on hold.

## 2026-10-24 v9 sample bodies redrawn in the v10 style (v10.121)
- Systems: samplelooks (sample bodies), samples9
- Files: v9looks.js (new), samples9.js, index.html, tests/v9lookshot.js (new), ARCHITECTURE.md
- What: the eleven v9 samples no longer use the old v9 ship; each has its own v10-style body (anatomy that shows its character, its v9 colour, defences and upgrades worn on the body), on sample cards, the Field Guide, fusions and in play. The Twins' ghost twin uses the same body. Rack pictures are the live body instead of a pictogram.
- Save data: none.
- Hooks: none (fills samplelooks.js tables; wraps sampleLook for the twin).
- Risk: Kindred fusions with a v9 sample now draw its own body instead of Baseline's.
