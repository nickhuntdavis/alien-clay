'use strict';
// Spawn Prawn - colour switches (was: stain grants, retired in v9.11; the floating grant, its pickup and its pause-menu list are gone).
// Lab view keeps only your own colour; Arcade view (Settings > View) counts as every stain taken.
//   body:    you, your echoes and allies, plus your stamina ring (always on).
//   tracer:  your shots and weapon effects, and each damage type's colour (Arcade view).
//   pickups: power-up pickups (Arcade view).
//   foes / scenery: enemies, terrain and the dish's agar (Arcade view, or Settings > Colour).
// Hooks: grantCols / GRANT_EL (refreshPalette and col(), render.js), grantOn / foeStainOn / sceneStainOn (foes.js, render.js,
// twins.js, seqsel.js), grantHas / GRANT_ORDER (debug.js unlock-all, ui.js pause menu hint).

const GRANTS = {
  body:    { name: 'Personal stain', cols: () => [PAL.you, '#ffe94a', '#d6e4f0'] },
  tracer:  { name: 'Tracer Dye', cols: () => (G && G.seqCol ? [G.seqCol] : []) },
  pickups: { name: 'Gentian Violet', cols: () => [PAL.pickup] },
  foes:    { name: 'Gram Stain', cols: () => [] },
  scenery: { name: 'Counterstain', cols: () => [] },
};
const GRANT_ORDER = ['body', 'tracer', 'pickups', 'foes', 'scenery'];
const grantHas = id => !!(META.grants && META.grants[id]);
const fullColourOn = () => typeof SET !== 'undefined' && viewArcade();
const grantOn = id => fullColourOn() || id === 'body';
// Settings > Colour can override these two: ALWAYS or OFF.
const colourMode = (id, earned) => { const m = typeof SET !== 'undefined' && SET[id]; return m === 'always' || (m !== 'off' && earned); };
const foeStainOn = () => colourMode('cEnemy', grantOn('foes'));
const sceneStainOn = () => colourMode('cTerrain', grantOn('scenery'));
let GRANT_EL = false; // damage-type colours let through, set by refreshPalette
function grantCols() {
  GRANT_EL = grantOn('tracer');
  const out = [];
  for (const id of GRANT_ORDER) if (grantOn(id)) out.push(...GRANTS[id].cols());
  return out;
}
