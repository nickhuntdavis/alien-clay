'use strict';
// Spawn Prawn - your sperm stays sharp (user, 28 Oct). When the frame rate falls, the quality steps draw the whole
// slide at a lower resolution (game.js resize: down to 0.75x at the lowest step), which blurs you along with it.
// Your body (drawShip, the Holy/Damned halo or horns, body mods) is drawn instead on its own canvas (#youCv) at up to
// YOU_HD.dpr, stacked just above the slide and under the DOM HUD and menus; taps pass through it. Rings, the Membrane
// and effects stay on the slide. Lab view greys it with a CSS filter, as labGrey greys the slide.
//  - Off in tests and sims (window.TUT_OFF; YOU_HD_FORCE turns it on): pixel tests read the slide canvas.
// Hooks: render.js player draw -> youHd(fn); wraps render (clears the canvas each frame). Save data: none.

const YOU_HD = { on: true, dpr: 2, cv: null, g: null, box: null, k: 1 };
const youHdOn = () => YOU_HD.on && !(window.TUT_OFF && !window.YOU_HD_FORCE);
function youHdSize() {
  const c = YOU_HD.cv; if (!c) return;
  YOU_HD.k = Math.min(window.devicePixelRatio || 1, YOU_HD.dpr);
  c.width = Math.floor(window.innerWidth * YOU_HD.k); c.height = Math.floor(window.innerHeight * YOU_HD.k);
  c.style.width = window.innerWidth + 'px'; c.style.height = window.innerHeight + 'px';
  YOU_HD.box = null;
}
function youHdInit() {
  if (YOU_HD.cv) return true;
  const main = document.getElementById('game'); if (!main) return false;
  const c = document.createElement('canvas'); c.id = 'youCv'; c.style.pointerEvents = 'none';
  main.insertAdjacentElement('afterend', c); // (straight after the slide: every later element, the HUD and menus, stays on top)
  YOU_HD.cv = c; YOU_HD.g = c.getContext('2d');
  youHdSize(); window.addEventListener('resize', youHdSize);
  return true;
}
function youHdClear() {
  const b = YOU_HD.box; if (!b || !YOU_HD.g) return;
  YOU_HD.g.setTransform(1, 0, 0, 1, 0, 0); YOU_HD.g.clearRect(b[0], b[1], b[2], b[3]); YOU_HD.box = null;
}
// Draws fn (which draws with the global ctx at screen coordinates) onto the sharp canvas. False: drawn on the slide.
function youHd(fn, px, py, reach) {
  if (!youHdOn() || !youHdInit()) { if (YOU_HD.cv) YOU_HD.cv.style.display = 'none'; fn(); return false; }
  const c = YOU_HD.cv, g = YOU_HD.g, k = YOU_HD.k;
  c.style.display = ''; c.style.filter = typeof labOn === 'function' && labOn() ? 'grayscale(1)' : '';
  const R = reach * k; YOU_HD.box = [Math.floor(px * k - R), Math.floor(py * k - R), Math.ceil(2 * R), Math.ceil(2 * R)];
  const main = ctx; g.setTransform(k, 0, 0, k, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.shadowColor = main.shadowColor; g.shadowBlur = main.shadowBlur; g.shadowOffsetX = main.shadowOffsetX; g.shadowOffsetY = main.shadowOffsetY;
  ctx = g;
  try { fn(); } finally { ctx = main; }
  return true;
}
{ const r0 = render; render = function () { youHdClear(); return r0.apply(this, arguments); }; }
