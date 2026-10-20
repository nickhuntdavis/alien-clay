// restcam.js: the close-up between waves.
// While the next-wave button is showing (waveReady) the objective swings in on your sperm and the camera sits
// a little low of it, so the button does not cover you. When the wave starts it eases back out.
// Hooks: restCamTick (game.js update, camera line; returns a world-unit y offset for the camera target).
const RESTCAM = { k: 0, z0: 1, g: null, ZIN: 0.6, UP: 0.17 };
function restCamTick(dt) {
  const R = RESTCAM;
  if (R.g !== G) { // a new run: undo any zoom left over from the last one
    if (R.k > 0) { ZOOM.z = R.z0; S = S0 * ZOOM.z; }
    R.g = G; R.k = 0; R.z0 = ZOOM.z;
  }
  const on = typeof waveReady === 'function' && waveReady();
  if (!on && R.k <= 0) { R.z0 = ZOOM.z; return 0; }
  if (performance.now() < ZOOM.until) R.z0 = ZOOM.z / (1 + R.ZIN * R.k); // (you are pinching: your zoom becomes the new base)
  R.k = on ? Math.min(1, R.k + dt * 1.6) : Math.max(0, R.k - dt * 2.2);
  const e = R.k * R.k * (3 - 2 * R.k);
  ZOOM.z = Math.min(ZOOM.max, R.z0 * (1 + R.ZIN * e)); S = S0 * ZOOM.z;
  return e * H * R.UP / S;
}
