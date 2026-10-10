const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => UI.openSamples()); await page.waitForTimeout(600);
  await page.screenshot({ path: 'lv_menu.png', fullPage: true });
  await page.evaluate(() => { UI.sample = 's007'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue.length = 0; const ex = lvExitPos(); G.player.x = ex.x; G.player.y = ex.y + 60; lvWin(ex); for (let f = 0; f < 120; f++) { if (G.state === 'play') update(1/30); } });
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({ state: G.state, title: document.getElementById('overTitle').textContent, unl: META.lvUnlocked }));
  await page.screenshot({ path: 'lv_win.png' });
  await page.evaluate(() => UI.openSamples()); await page.waitForTimeout(400);
  const lock = await page.evaluate(() => SAMPLES.find(s => s.id === 's008').lockText);
  console.log(JSON.stringify(st), lock, errors); await b.close();
})();
