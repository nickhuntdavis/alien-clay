const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => UI.openSamples()); await page.waitForTimeout(900);
  await page.screenshot({ path: 'sx1.png' });
  await page.evaluate(() => { document.getElementById('samples').scrollTop = 9999; }); await page.waitForTimeout(400);
  await page.screenshot({ path: 'sx2.png' });
  await page.click('[data-sample="s007"]'); await page.waitForTimeout(300);
  console.log(await page.evaluate(() => UI.sample), errors); await b.close();
})();
