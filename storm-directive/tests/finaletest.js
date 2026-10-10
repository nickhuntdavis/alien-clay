const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const setup = async () => page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); G.t = 40; G.enemies.length = 0; window.spawnRandom = () => {};
    for (let i = 0; i < 8; i++) G.enemies.push(makeEnemy(ENEMIES.grunt || ENEMIES.brute, G.player.x + 120 * Math.cos(i), G.player.y + 160 * Math.sin(i), {}));
    const e = makeEnemy(ENEMIES.brute, G.player.x + 60, G.player.y + 10, { elite: true }); G.enemies.push(e); gridBuild(); });
  await setup(); await page.waitForTimeout(500);
  await page.evaluate(() => { const e = G.enemies.find(x => x.elite) || G.enemies[0]; e.x = G.player.x + 70; e.y = G.player.y + 20; G.player.iframes = 0; hurtPlayer(9999, e.name, e, 'contact'); });
  for (const [ms, n] of [[350, 'd1'], [800, 'd2'], [800, 'd3']]) { await page.waitForTimeout(ms); await page.screenshot({ path: 'fin_' + n + '.png' }); console.log(n, await page.evaluate(() => G.state + ' ' + (G.finale ? G.finale.t.toFixed(2) : '-') + ' z' + ZOOM.z.toFixed(2))); }
  await page.waitForTimeout(1200);
  console.log('after death:', await page.evaluate(() => G.state + ' over=' + $('over').classList.contains('on') + ' z' + ZOOM.z.toFixed(2) + ' killer=' + (document.querySelector('.killer b') || {}).textContent));
  await page.screenshot({ path: 'fin_over.png' });
  // skip by tap
  await page.evaluate(() => { G = null; UI.show('title'); }); await setup(); await page.waitForTimeout(300);
  await page.evaluate(() => { const e = G.enemies.find(x => x.elite) || G.enemies[0]; e.x = G.player.x + 70; e.y = G.player.y + 20; G.player.iframes = 0; hurtPlayer(9999, e.name, e, 'contact'); });
  await page.waitForTimeout(700); console.log('pre', await page.evaluate(() => G.state + ' ' + (G.finale && G.finale.t) + ' ' + document.elementFromPoint(200,400).id)); await page.mouse.click(200, 400); await page.waitForTimeout(200);
  console.log('skip:', await page.evaluate(() => G.state + ' over=' + $('over').classList.contains('on')));
  // win
  await page.evaluate(() => { G = null; UI.show('title'); }); await setup(); await page.waitForTimeout(300);
  await page.evaluate(() => { G.player.x = G.core.x - 260; G.player.y = G.core.y; cam.x = G.player.x; cam.y = G.player.y; victory({ x: G.core.x, y: G.core.y, r: CORE.r }); });
  for (const [ms, n] of [[700, 'w1'], [650, 'w2'], [250, 'w3'], [600, 'w4'], [700, 'w5']]) { await page.waitForTimeout(ms); await page.screenshot({ path: 'fin_' + n + '.png' }); console.log(n, await page.evaluate(() => G.state + ' ' + (G.finale ? G.finale.t.toFixed(2) : '-'))); }
  await page.waitForTimeout(1200);
  console.log('after win:', await page.evaluate(() => G.state + ' over=' + $('over').classList.contains('on') + ' title=' + $('overTitle').textContent));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
