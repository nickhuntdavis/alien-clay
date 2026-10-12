// The Latex Barrier: a latex film with a rolled rim round you (render.js). Screenshots in both fields.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.barrier = 99; G.barrierR = 95; G.barrierDmg = 1; G.debug = { freeze: true }; });
  await page.waitForTimeout(400); await page.screenshot({ path: 'barrier.png', clip: { x: 80, y: 280, width: 240, height: 240 } });
  console.log('ERRORS ' + JSON.stringify(errors)); await b.close();
})();
