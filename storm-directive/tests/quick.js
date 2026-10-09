const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(500);
  await page.screenshot({ path: 'title.png' });
  const keep = await page.evaluate(() => META.profile);
  const t0 = Date.now(); await page.click('#quickBtn'); await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ state: G.state, seq: G.genes.primary, weapons: G.weapons.filter(Boolean).map(w => w.id), queue: G.lootQueue.map(q => q.kind), profileAfter: META.profile, t: G.t.toFixed(1), hud: $('hud').classList.contains('on') }));
  console.log(JSON.stringify(r), 'profile before', keep, errors.length ? errors : 'no errors');
  await page.screenshot({ path: 'quick.png' }); await b.close();
})();
