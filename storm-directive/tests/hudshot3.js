const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; while (G.lootQueue.length) { UI.openLoot(G.lootQueue.shift()); UI.pickLoot(0); } G.state = 'play'; UI.show('hud');
    G.spells[0] = makeSlot('meteor', true, 1); recomputeAll(); waveBegin(); for (let f = 0; f < 200; f++) update(1/30); G.armourLost = 1; UI.refreshHud(true); });
  await page.waitForTimeout(400); await page.screenshot({ path: 'hud3.png' });
  await page.evaluate(() => { SET.immersive = true; UI.applySettings(); }); await page.waitForTimeout(300); await page.screenshot({ path: 'hud3i.png' });
  await page.evaluate(() => { SET.immersive = false; UI.applySettings(); G.state = 'play'; UI.openLoot({ kind: 'level' }); }); await page.waitForTimeout(1600); await page.screenshot({ path: 'skip.png' });
  console.log(errors); await b.close();
})();
