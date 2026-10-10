const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  // title codex: half met
  await page.evaluate(() => { META.seen = {}; Object.keys(ENEMY_INTRO).forEach((id, i) => { if (i % 3) META.seen[id] = 1; }); RIVALS.forEach((R, i) => { if (i % 2) META.seen['rival_' + R.id] = 1; }); BOSSES.forEach((B, i) => { if (i % 2) META.bosses[B.id] = 1; }); UI.codexSec = 'beasts'; UI.openCodex(); });
  // scroll through so every portrait draws once
  const n = await page.evaluate(() => document.querySelectorAll('canvas.cdxp').length);
  for (let y = 0; y < 30; y++) { await page.evaluate(y => { $('codex').scrollTop = y * 500; }, y); await page.waitForTimeout(80); }
  await page.evaluate(() => { $('codex').scrollTop = 0; const h = [...document.querySelectorAll('#codex h3')].find(x => /Enemies/.test(x.textContent)); if (h) h.scrollIntoView(); }); await page.waitForTimeout(300);
  await page.screenshot({ path: 'port_foes.png' });
  await page.evaluate(() => { $('codex').scrollTop = 0; }); await page.waitForTimeout(300); await page.screenshot({ path: 'port_rivals.png' });
  await page.evaluate(() => { UI.codexSec = 'bosses'; UI.openCodex(); }); await page.waitForTimeout(400); await page.screenshot({ path: 'port_boss.png' });
  for (let y = 0; y < 10; y++) { await page.evaluate(y => { $('codex').scrollTop = y * 500; }, y); await page.waitForTimeout(80); }
  const bad = await page.evaluate(() => [...document.querySelectorAll('canvas.cdxp[data-bad]')].map(c => c.dataset.pe).concat([ERRS.last]));
  console.log('portraits', n, 'bad:', JSON.stringify(bad), 'G after:', await page.evaluate(() => G));
  // in a run: pause codex tab
  await page.evaluate(() => { UI.codexSec = 'beasts'; UI.quickStart(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { UI.togglePause(); UI.pauseTab = 'codex'; UI.renderPause(); const h = [...document.querySelectorAll('#pause h3')].find(x => /Enemies/.test(x.textContent)); if (h) h.scrollIntoView(); });
  await page.waitForTimeout(400); await page.screenshot({ path: 'port_pause.png' });
  console.log('run ok:', await page.evaluate(() => G.state + ' ' + PORT.on + ' bad=' + document.querySelectorAll('canvas.cdxp[data-bad]').length));
  await page.evaluate(() => UI.togglePause()); await page.waitForTimeout(300);
  console.log('after close:', await page.evaluate(() => G.state + ' ' + PORT.on));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
