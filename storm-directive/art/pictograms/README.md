# Pictograms (64 x 64)

The Figma pictogram set (file waCztn7dWzQVMt7il1lwvB, Components page, Pictograms), one SVG per pictogram, named by the key the game uses (`pictoSVG(key)` in web/js/pictos.js; `feat/little-bubble.svg` is key `feat/little-bubble`).
Body paints in `currentColor` (#1e1e1e by default); cut-outs use `var(--picto-cut, #e4e5e0)`, so set `--picto-cut` to the surface behind.
The 4px margin is built in: show them edge to edge in a 64px tile. `figma-grid-export.svg` is the raw Figma export these came from (tests/tools/pictos.py turns it into pictos.js).
