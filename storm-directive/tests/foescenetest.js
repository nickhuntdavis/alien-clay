// Gram Stain (enemies), Counterstain (scenery) and Settings > Full colour (grants.js, render.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.grants = { body: 1, tracer: 1, pickups: 1 }; META.grantOff = {}; META.pstains = {}; META.eggMet = 1; META.tutWave = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play';
    const out = {};
    // Put terrain of every kind and one of each common enemy round the player.
    const p = G.player; p.x = 0; p.y = 400; G.terrain.list.length = 0;
    const types = ['ridge', 'mito', 'acid', 'cilia', 'current', 'slick'];
    types.forEach((ty, i) => { const d = OBSTACLES[ty]; G.terrain.list.push({ type: ty, x: -150 + (i % 3) * 150, y: 300 + Math.floor(i / 3) * 140, r: 50, a: 0.3, seed: 0.1 + i / 10, charge: 0, flash: 0, burstT: 0, def: d }); });
    const names = ['crawler', 'brute', 'bomber', 'splitter', 'spitter'].filter(k => ENEMIES[k]);
    names.forEach((k, i) => G.enemies.push(makeEnemy(ENEMIES[k], -180 + i * 90, 470)));
    for (const e of G.enemies) { e.hp = e.maxHp = 1e6; }
    G.cam = cam; cam.x = 0; cam.y = 400;
    const colourful = () => {
      render(); const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0;
      for (let i = 0; i < d.length; i += 16) { const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx - mn > 40) n++; }
      return n;
    };
    out.none = colourful();
    META.grants = { body: 1, tracer: 1, pickups: 1, foes: 1 }; refreshPalette(); out.foes = colourful();
    META.grants.scenery = 1; refreshPalette(); out.scenery = colourful();
    META.grantOff = { foes: 1, scenery: 1 }; refreshPalette(); out.offBack = colourful(); META.grantOff = {};
    META.grants = { body: 1 }; SET.fullColour = true; refreshPalette(); out.full = colourful();
    out.fullGrantOn = grantOn('scenery') && col('#808080') === '#808080' && !FULL_COL;
    SET.fullColour = false; refreshPalette();
    // Unlock order: level 15 then 20.
    META.grants = { body: 1, tracer: 1, pickups: 1 }; G.grant = null; G.level = 14; out.due14 = grantDue();
    G.level = 15; out.due15 = grantDue(); META.grants.foes = 1; G.level = 19; out.due19 = grantDue(); G.level = 20; out.due20 = grantDue();
    return out;
  });
  console.log(JSON.stringify(r));
  const bad = [];
  if (!(r.foes > r.none * 1.2)) bad.push('foesNoMoreColour');
  if (!(r.scenery > r.foes * 1.2)) bad.push('sceneryNoMoreColour');
  if (Math.abs(r.offBack - r.none) > r.none * 0.1 + 5) bad.push('offNotGrey');
  if (!(r.full >= r.scenery * 0.9)) bad.push('fullLess');
  if (!r.fullGrantOn) bad.push('fullGrantOn');
  if (r.due14 || r.due15 !== 'foes' || r.due19 || r.due20 !== 'scenery') bad.push('unlockOrder');
  if (bad.length) console.log('FAIL', bad.join(','));
  await page.evaluate(() => { META.grants = { body: 1, tracer: 1, pickups: 1, foes: 1, scenery: 1 }; refreshPalette(); document.querySelectorAll('.screen').forEach(s => s.style.display = 'none'); render(); });
  await page.screenshot({ path: 'foescene.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
