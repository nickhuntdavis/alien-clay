# Spawn Prawn visual style guide

How the slide should look. Read this before redesigning anything drawn in the world (terrain, hazards, effects, enemies). Code lives in `web/js/render.js` (`drawTerrain`, `drawBackground`), colour gating in `col()`/`refreshPalette`.

## The idea
It is a live microscope slide, not a game board. Things sit *in* the fluid and the tissue; nothing is a flat icon or a UI shape laid over the world.

## v10 look (Arcade only; Lab view retired)
Redesign decisions 20, 21 and 28 (`redesign docs/COMBAT_MATRIX.md`) win over the older rules below. Lab view (grey slide, eyepiece, no rings) is retired: `viewArcade()` is always true, the View row is hidden in Settings, `labGrey` and `labEyepiece` never run, and `col()` returns real colours. The agar and tissue stay soft grey and pink so the colours read on top. Darkfield is a separate option and still works. `window.V10_OFF` restores the old look.
- One palette, in `look10.js` (`TYPE_PAL`, `DEF_PAL`, `ACID_TERR`); ELEMENTS, `V10_COL`, `FIGHT_COL`, `MUT_COL`, `F10_COL` and `PDEF_COL` read from it. Never hard-code a type colour.

  | Type (internal id) | Colour | Look |
  | --- | --- | --- |
  | Force (`phys`) | white / pale grey `#e8eef8` | hard-edged impact rings, sharp motion lines |
  | Acid (`fire`) | shocking pink `#ff2fa8` | puddles, drips, bounded pool edge; pink even in the pink campaign levels |
  | Static (`shock`) | yellow `#ffe94a` | sparks, branching lightning |
  | Mucus (`ice`) | green `#7fd04a` | strands, sticky patches |
  | Blood (`arcane`) | red `#c9184a` | wounds, pools |
  | Soul (`soul`) | translucent sparkly purple `#b06cff` | ghostly, sparkling |
  | Fire (`flame`) | orange `#ff6a2a` | embers, flare |

- Old hard-coded acid greens and mucus olives are remapped through `ELEM_SWAP` (`l10Swap`), so `col()` paints them pink and green. Code that draws with `RAW_COL` on (campaign levels) must use the palette directly (`ACID_TERR` in the acid terrain).
- Defence rings (`DEF_PAL`): Membrane is a blue ring, Shell is brown rings (one per layer), Thorns are pale spikes, Evasion shows in motion (misses), Squishy is rubbery and has no ring.

## Rules
1. **Zones have no borders and no backgrounds.** A soft area (current, cilia, slick, acid) is shown by what is in it: particles, hairs, bubbles, sheen. Density and alpha fall off towards the edge so the zone fades into the slide. No flat fills.
   - **Rings are allowed for timed effects** (a coloured ring that drains shows time left: `typeRings`, typefx.js). Under v10 Arcade is the only view, so rings always show; each status also reads from shape and motion (`typeStatusFx`), one motion per damage type.
2. **Soft outer edges.** No hard silhouette on effects: feather the outermost edge (`softBlob`, `soft`, `softStroke` in typefx.js) so things sit in the fluid. Realistic, not graphic.
2b. **Organic, not geometric.** Use wobbling blobs (`blobPath`, with per-object `lobes`), bent beans, irregular clumps. Avoid perfect circles and straight edges. Give each instance its own seeded variation (size, lobes, bend) so no two look the same.
3. **Solids keep an edge, softly.** Things you bounce off (cartilage, mitochondria) need a readable boundary: a thin bright membrane or a top-lit rim, never a heavy black line. They can fade where they sink into the tissue (cartilage fades towards the bottom).
4. **Motion sells it.** Everything alive moves a little: lobes breathe, hairs beat in a travelling wave, particles drift with the current, bubbles swell and pop. Slow and small; nothing bounces.
5. **Danger reads by behaviour, not by red.** Acid fizzes, bubbles and glows at its rim; touching it sizzles (bubbles, steam, a flickering green edge on you, a hiss). Red (`PAL.danger`) is kept for bullets and warnings.
6. **Gameplay readouts live inside the object.** A charge is a fill inside the body (the mitochondrion's gold ATP level), not a bar floating under it.

## Two fields, both first-class
Design and check every change in **both** the normal (light grey) field and **Darkfield** (true black, AMOLED). Darkfield is the reference look.
- Darkfield is light scattered on black: dark, nearly transparent middles; bright rims; bright particles. Do not rely on `colDF` inverting greys for terrain; branch on `df` in `drawTerrain` and pick light-on-black values.
- Effects that must show in both (sizzle, glows) draw with `WORLD_DF` off and `'lighter'` compositing, plus some white (`#ffffff` survives every mode).
- Test: `tests/colourtest.js` screenshots both fields (`tests/out/colour_*.png`).

## Colour (older notes: stains and grants are retired, v10 above wins)
- The world starts greyscale; colours arrive with stains and research grants, and Settings > Colour can force each kind EARNED / ALWAYS / OFF. Every new colour must belong to one category and go through `col()`.
- Terrain colours are registered in `TERRAIN_HEX` (render.js) and shown when `TERRAIN_ON` (Counterstain or the setting). Pick colours whose greyscale luminance still reads on grey (~166) and on black.
- Current terrain palette: acid green `#7fbf2a` (dark `#3d5a1f`, fizz `#c6f07a`); current blue `#9fd4e6`; cilia pink `#f2b8c6` (dark `#8a5866`); slick lilac `#c8b6ff` (bead `#f4eeff`); cartilage blue-white `#c9d6e6` (shadow `#5a6878`); mitochondrion `#c97a62`/`#8f4636` with membrane `#f3c6b8` and edge `#6e2f24`; ATP and charge in `PAL.reward` gold.
- Background ALWAYS adds a soft pink tissue wash (`tissueWash`), not a flat colour.

## Building blocks (render.js)
- `blobPath`: soft organic outline (acid pits, pools, slicks). `drawPool`: any ground effect. `glassRim`: any glass edge (dish, chamber). `eggWarmth`: a zone shown as a glow, not a ring. Shots: `droplet`, `shotTail`, `spindle`, `sickles`, `lump`. Outlines: `roundPts` (round the corners of any polygon), `smoothPts` (a fully smooth outline). Reuse these before inventing new shapes.
- Jokey props (red tape, calendars, teeth) may stay cartoon-like: the joke wins, but still no dashed rings or heavy outlines.

## Performance
Phones first. Keep per-object particle counts small (20 to 30), batch strokes into one path per colour or alpha band, use seeded `rnd()` (no per-frame `Math.random` layouts except for flicker), and avoid `save`/`clip` in tight loops.
