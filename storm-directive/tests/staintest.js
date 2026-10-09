const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    const before = { danger: col(PAL.danger), reward: col(PAL.reward), fast: col(DYE_FAST) };
    for (const id of ['immuno', 'luciferase', 'motility']) optDye(id).apply();
    const after = { danger: col(PAL.danger), reward: col(PAL.reward), fast: col(DYE_FAST) };
    return { before, after, card: optDye('he').desc };
  });
  console.log(JSON.stringify(r));
  await page.evaluate(() => { UI.togglePause(); const h = [...document.querySelectorAll('#pause h3')].find(x => /Stains/.test(x.textContent)); h.scrollIntoView(); });
  await page.waitForTimeout(300); await page.screenshot({ path: 'stains_pause.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
