const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.waitForTimeout(3200);
  await page.screenshot({ path: 'splash.png' });
  const on1 = await page.evaluate(() => document.getElementById('splash').classList.contains('on'));
  await page.mouse.click(200, 400); await page.waitForTimeout(500);
  const on2 = await page.evaluate(() => document.getElementById('splash').classList.contains('on'));
  await page.reload(); await page.waitForTimeout(6200);
  const on3 = await page.evaluate(() => document.getElementById('splash').classList.contains('on'));
  console.log('showing at 3s', on1, '| after tap', on2, '| after 6s untouched', on3, errors.length ? errors : 'no errors'); await b.close();
})();
