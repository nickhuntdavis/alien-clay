const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.pstains = {}; META.pstainOff = {}; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.t = 40; G.enemies.length = 0; window.spawnRandom = () => {};
    const e = makeEnemy(ENEMIES.brute, G.player.x + 40, G.player.y + 10, { elite: true }); G.enemies.push(e); gridBuild(); });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const e = G.enemies[0]; G.player.iframes = 0; hurtPlayer(9999, e.name, e, 'contact'); });
  await page.waitForTimeout(3200);
  const st = await page.evaluate(() => ({ state: G.state, killer: document.querySelector('.killer b') && document.querySelector('.killer b').textContent, line: document.querySelector('.killer em') && document.querySelector('.killer em').textContent, keep: document.querySelectorAll('[data-keep]').length })); // (keep is 0: the end-of-run stain pick went with stain grants)
  console.log(JSON.stringify(st));
  await page.evaluate(() => { $('over').scrollTop = 0; }); await page.waitForTimeout(100); await page.screenshot({ path: 'over.png' });
  await page.evaluate(() => { META.pstains = { immuno: 1 }; saveMeta(); }); // (a stain kept on an older version)
  const r2 = await page.evaluate(() => { UI.sample = 's001'; newGame(); return { dyes: Object.keys(G.dyes), boon: Object.keys(G.dyeBoon) }; });
  console.log('new run:', JSON.stringify(r2));
  // speed: x2 vs x1 game time per real update
  const r3 = await page.evaluate(() => { const t = []; for (const s of [1, 2, 0.5]) { SET.speed = s; G.state = 'play'; const t0 = G.t; for (let i = 0; i < 30; i++) { G.lootQueue = []; update(1 / 60 * GAME_SPEED * gameSpeed()); } t.push(s + ':' + (G.t - t0).toFixed(3)); } SET.speed = 1; return t.join(' '); });
  console.log('game time for 30 frames:', r3);
  await page.evaluate(() => { UI.show('hud'); G.state = 'play'; UI.togglePause(); UI.pauseTab = 'you'; UI.renderPause(); const h = [...document.querySelectorAll('#pause h3')].find(x => /Permanent/.test(x.textContent)); if (h) h.scrollIntoView(); });
  await page.waitForTimeout(200); await page.screenshot({ path: 'pst.png' });
  await page.click('[data-pst="immuno"]'); const r4 = await page.evaluate(() => ({ off: META.pstainOff, dyes: Object.keys(G.dyes) }));
  console.log('after toggle:', JSON.stringify(r4));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
