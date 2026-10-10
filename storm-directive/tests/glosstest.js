const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; for (let i = 0; i < 30; i++) update(1 / 30); UI.openLoot({ kind: 'level' }); });
  await page.waitForTimeout(1800);
  const box = await page.locator('#lootCards .card').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(700);
  await page.screenshot({ path: 'gloss.png' });
  const info = await page.evaluate(() => $('holdInfo').classList.contains('on') + ' ' + $('holdInfo').querySelectorAll('li').length);
  await page.mouse.up(); await page.waitForTimeout(200);
  const after = await page.evaluate(() => G.state + ' loot ' + $('loot').classList.contains('on'));
  console.log(info, '|', after); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
