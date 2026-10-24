## 2026-10-24 v9 sample bodies redrawn in the v10 style (v10.120)
- Systems: samplelooks (sample bodies), samples9
- Files: v9looks.js (new), samples9.js, index.html, tests/v9lookshot.js (new), ARCHITECTURE.md
- What: the eleven v9 samples no longer use the old v9 ship; each has its own v10-style body (anatomy that shows its character, its v9 colour, defences and upgrades worn on the body), on sample cards, the Field Guide, fusions and in play. The Twins' ghost twin uses the same body. Rack pictures are the live body instead of a pictogram.
- Save data: none.
- Hooks: none (fills samplelooks.js tables; wraps sampleLook for the twin).
- Risk: v9 samples are still off the rack (matrixonly.js), so this shows only with matrixRestore() or once they return. Kindred fusions with a v9 sample now draw its own body instead of Baseline's.
