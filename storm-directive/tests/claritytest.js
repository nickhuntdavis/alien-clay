const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; UI.quickStart(); window.spawnRandom = () => {}; applyPickup('rage'); G.rage = 0.05; });
  await page.waitForTimeout(900); await page.screenshot({ path: 'clarity.png' });
  console.log(await page.evaluate(() => JSON.stringify({ clarity: +(G.clarityT - G.t).toFixed(1), chips: document.getElementById('hud').textContent.includes('POST-NUT CLARITY'), msg: $('sysmsg').textContent.slice(0, 80) })));
  console.log(await page.evaluate(() => { G.stats.boxBy = { level: 30, branch: 12, chest: 9 }; G.stats.boxes = 51; return runText(runSummary(G, 'TEST')).split('\n')[0]; }).catch(e => 'fmt: ' + e.message));
  console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
