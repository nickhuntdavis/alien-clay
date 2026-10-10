// Settings tabs must switch, including away from the Data tab (which appends HTML after render).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(400);
  await page.evaluate(() => { window.TUT_OFF = 1; UI.openSettings('title'); });
  const seq = ['view', 'sound', 'data', 'play', 'data', 'view'];
  const got = [];
  for (const t of seq) {
    await page.click(`[data-stab="${t}"]`);
    got.push(await page.evaluate(() => document.querySelector('#setBody .ptabs .sel').dataset.stab));
  }
  const ok = JSON.stringify(got) === JSON.stringify(seq);
  console.log('tabs', got.join(','), ok ? 'ok' : 'FAIL: tab did not switch');
  console.log('ERRORS', JSON.stringify(errors));
  await b.close(); process.exit(ok && !errors.length ? 0 : 1);
})();
