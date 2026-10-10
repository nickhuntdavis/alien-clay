// Developer mode's UNLOCK EVERYTHING card: two taps unlock every sequence, Endless, Level 2's notice, the grants and the Field Guide.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; localStorage.setItem('sd_dev', '1'); splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => UI.openSamples()); await page.waitForTimeout(500);
  const before = await page.evaluate(() => ({ endless: endlessOpen(), seqs: Object.keys(PROFILES).filter(profUnlocked).length }));
  await page.click('#devAll'); await page.waitForTimeout(200);
  const armed = await page.evaluate(() => document.getElementById('devAll').textContent);
  await page.click('#devAll'); await page.waitForTimeout(300);
  await page.screenshot({ path: 'devall.png' });
  const after = await page.evaluate(() => ({ endless: endlessOpen(), seqs: Object.keys(PROFILES).filter(profUnlocked).length + '/' + Object.keys(PROFILES).length, grants: GRANT_ORDER.every(grantHas), heat: META.heatMax, dna: META.dna, lv: META.lvUnlocked, locked: document.querySelectorAll('.sx-card.locked').length }));
  if (!after.endless || !after.seqs.startsWith(after.seqs.split('/')[1]) || !after.grants || !armed.includes('TAP AGAIN') || after.locked) console.log('FAIL', armed, after);
  console.log(JSON.stringify(before), JSON.stringify(after), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
