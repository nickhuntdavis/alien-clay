const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + e.stack));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const out = [];
  for (const smp of ['s001', 's002']) {
    out.push(await page.evaluate((smp) => {
      UI.sample = smp; newGame(); G.state = 'play';
      for (let f = 0; f < 30 * 40; f++) { G.lootQueue = []; G.player.hp = G.P.maxHp; update(1 / 30); G.state = 'play'; }
      const n0 = RUNLOG.length;
      try { G.chrono.charges = 0; G.player.iframes = 0; G.shieldT = 0; hurtPlayer(1e9, 'test'); if (G.state !== 'over') gameOver(); } catch (e) { return 'THROW ' + e.message + e.stack; }
      return smp + ' state=' + G.state + ' t=' + Math.round(G.t) + ' logged=' + (RUNLOG.length - n0) + ' last=' + JSON.stringify(RUNLOG[RUNLOG.length - 1] || {}).slice(0, 120);
    }, smp));
    await page.waitForTimeout(3500);
    out.push(await page.evaluate(() => 'after wait: runs=' + RUNLOG.length + ' screen=' + document.querySelector('.screen.on, .on')?.id));
  }
  console.log(out.join('\n'), '\nERRORS:', errors.length ? errors.slice(0, 3).join('\n') : 'none'); await b.close();
})();
