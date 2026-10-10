const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = {};
    for (const id of Object.keys(EVOLVE)) { META.profile = id; UI.sample = 's001'; UI.startGame(false); const m0 = G.P.might; for (const l of [5, 10, 20, 50]) evolveCheck(l); out[id] = (G.evolved || []).join(', ') + ' | primary ' + G.genes.primary; }
    return out; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
