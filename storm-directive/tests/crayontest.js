const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const out = {};
    for (const haste of [1, 1.5, 2]) {
      UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.player.x = 600; G.player.y = 600;
      G.P.haste = haste; G.weapons = [makeSlot('crayon', false, 3), null, null]; recomputeAll(); const w = G.weapons[0];
      const areas = []; const orig = colourIn; window.colourIn = (ww, poly, loop) => { areas.push(Math.round(polyArea(poly))); return orig(ww, poly, loop); };
      for (let f = 0; f < 60 * 20; f++) { G.lootQueue = []; G.manual = { x: Math.cos(f / 90), y: Math.sin(f / 150) }; update(1 / 60); G.state = 'play'; }
      window.colourIn = orig;
      out['haste' + haste] = { cd: +w.s.cd.toFixed(2), lineLife: +w.s.dur.toFixed(2), shapes: areas.length, avgArea: areas.length ? Math.round(areas.reduce((a, b) => a + b, 0) / areas.length) : 0 };
    }
    return out;
  });
  console.log(JSON.stringify(r)); console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
