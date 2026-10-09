const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; SET.auto = false; UI.sample = 's007'; newGame(); UI.show('hud'); G.state = 'play';
    while (G.lootQueue.length) { UI.openLoot(G.lootQueue.shift()); UI.pickLoot(0); } G.state = 'play'; UI.show('hud'); });
  const shots = [['lips', 13.5, 121, 3], ['gums', 13.5, 98, 4], ['tongue', 13, 40, 6], ['throat', 13.5, 19, 3], ['stone', 13.5, 6.5, 0]];
  for (const [name, cx, cy, sec] of shots) {
    await page.evaluate(([cx, cy, sec, name]) => {
      const p = G.player; p.x = cx * LV_C; p.y = cy * LV_C; G.lvl.safe = null; cam.x = p.x; cam.y = p.y;
      if (name === 'tongue') { G.lvl.wash.y = 38 * LV_C; }
      if (name === 'stone') { G.lvl.bossDead = true; G.lvl.boss = true; lvOpenGate('4'); lvOpenGate('3'); }
      for (let f = 0; f < sec * 30; f++) { update(1 / 30); if (G.state !== 'play') { G.state = 'play'; UI.show('hud'); } if (G.player.hp < 50) G.player.hp = G.P.maxHp; }
    }, [cx, cy, sec, name]);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `lv_${name}.png` });
  }
  console.log('ERRORS', errors.length ? errors.slice(0, 4) : 'none'); await b.close();
})();
