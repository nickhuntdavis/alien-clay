const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.rage = 8; G.shieldT = 5; G.chargeUpT = G.t + 3; G.clarityT = G.t + 4; });
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => JSON.stringify(UI.chipRects));
  const c = JSON.parse(r)[0];
  await page.mouse.click(c.x + 10, c.y + 8); await page.waitForTimeout(400);
  const st = await page.evaluate(() => G.state + ' ' + $('stpanel').classList.contains('on') + ' rows ' + $('stBody').querySelectorAll('.li').length);
  await page.screenshot({ path: 'stpanel.png' });
  await page.click('#stClose'); await page.waitForTimeout(200);
  const st2 = await page.evaluate(() => G.state + ' spd ' + $('spdBtn').textContent);
  await page.click('#spdBtn'); const st3 = await page.evaluate(() => SET.speed + ' ' + $('spdBtn').textContent);
  console.log(r.slice(0, 120), '|', st, '|', st2, '|', st3); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
