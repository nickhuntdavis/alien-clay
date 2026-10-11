# Spawn Prawn visual style guide

How the slide should look. Read this before redesigning anything drawn in the world (terrain, hazards, effects, enemies). Code lives in `web/js/render.js` (`drawTerrain`, `drawBackground`), colour gating in `col()`/`refreshPalette`.

## The idea
It is a live microscope slide, not a game board. Things sit *in* the fluid and the tissue; nothing is a flat icon or a UI shape laid over the world.

## Rules
1. **Zones have no borders and no backgrounds.** A soft area (current, cilia, slick, acid) is shown by what is in it: particles, hairs, bubbles, sheen. Density and alpha fall off towards the edge so the zone fades into the slide. No outlines, no dashed rings, no flat fills.
2. **Organic, not geometric.** Use wobbling blobs (`blobPath`, with per-object `lobes`), bent beans, irregular clumps. Avoid perfect circles and straight edges. Give each instance its own seeded variation (size, lobes, bend) so no two look the same.
3. **Solids keep an edge, softly.** Things you bounce off (cartilage, mitochondria) need a readable boundary: a thin bright membrane or a top-lit rim, never a heavy black line. They can fade where they sink into the tissue (cartilage fades towards the bottom).
4. **Motion sells it.** Everything alive moves a little: lobes breathe, hairs beat in a travelling wave, particles drift with the current, bubbles swell and pop. Slow and small; nothing bounces.
5. **Danger reads by behaviour, not by red.** Acid fizzes, bubbles and glows at its rim; touching it sizzles (bubbles, steam, a flickering green edge on you, a hiss). Red (`PAL.danger`) is kept for bullets and warnings.
6. **Gameplay readouts live inside the object.** A charge is a fill inside the body (the mitochondrion's gold ATP level), not a bar floating under it.

## Two fields, both first-class
Design and check every change in **both** the normal (light grey) field and **Darkfield** (true black, AMOLED). Darkfield is the reference look.
- Darkfield is light scattered on black: dark, nearly transparent middles; bright rims; bright particles. Do not rely on `colDF` inverting greys for terrain; branch on `df` in `drawTerrain` and pick light-on-black values.
- Effects that must show in both (sizzle, glows) draw with `WORLD_DF` off and `'lighter'` compositing, plus some white (`#ffffff` survives every mode).
- Test: `tests/colourtest.js` screenshots both fields (`tests/out/colour_*.png`).

## Colour
- The world starts greyscale; colours arrive with stains and research grants, and Settings > Colour can force each kind EARNED / ALWAYS / OFF. Every new colour must belong to one category and go through `col()`.
- Terrain colours are registered in `TERRAIN_HEX` (render.js) and shown when `TERRAIN_ON` (Counterstain or the setting). Pick colours whose greyscale luminance still reads on grey (~166) and on black.
- Current terrain palette: acid green `#7fbf2a` (dark `#3d5a1f`, fizz `#c6f07a`); current blue `#9fd4e6`; cilia pink `#f2b8c6` (dark `#8a5866`); slick lilac `#c8b6ff` (bead `#f4eeff`); cartilage blue-white `#c9d6e6` (shadow `#5a6878`); mitochondrion `#c97a62`/`#8f4636` with membrane `#f3c6b8` and edge `#6e2f24`; ATP and charge in `PAL.reward` gold.
- Background ALWAYS adds a soft pink tissue wash (`tissueWash`), not a flat colour.

## Building blocks (render.js)
- `blobPath`: soft organic outline (acid pits, pools, slicks). `drawPool`: any ground effect. `glassRim`: any glass edge (dish, chamber). `eggWarmth`: a zone shown as a glow, not a ring. Shots: `droplet`, `shotTail`, `spindle`, `sickles`, `lump`. Outlines: `roundPts` (round the corners of any polygon), `smoothPts` (a fully smooth outline). Reuse these before inventing new shapes.
- Jokey props (red tape, calendars, teeth) may stay cartoon-like: the joke wins, but still no dashed rings or heavy outlines.

## Performance
Phones first. Keep per-object particle counts small (20 to 30), batch strokes into one path per colour or alpha band, use seeded `rnd()` (no per-frame `Math.random` layouts except for flicker), and avoid `save`/`clip` in tight loops.
