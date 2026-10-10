const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = 9999; G.player.hp = 9999; G.player.x = 700; G.player.y = 400; cam.x = 760; cam.y = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
    G.weapons = [makeSlot('redtape', false, 4), makeSlot('blaster', false, 2), null]; recomputeAll(); G.banner = null;
    for (let i = 0; i < 9; i++) { const e = makeEnemy(ENEMIES.brute, 700 + (i % 3) * 75 - 75, 560 + Math.floor(i / 3) * 75); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); } gridBuild();
    for (let f = 0; f < 100; f++) { G.lootQueue.length = 0; update(1 / 60); } cam.x = 700; cam.y = 560; });
  await page.waitForTimeout(150); await page.screenshot({ path: 'tapeshot.png' });
  console.log('tapes:', await page.evaluate(() => (G.toy && G.toy.tapes.length) + ' ' + Object.entries(G.stats.dmg).map(([k, v]) => k + ':' + Math.round(v)).join(' ')));
  console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
