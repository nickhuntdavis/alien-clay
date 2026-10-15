const { chromium } = require('playwright');
// The armour forcefield: idle, then a hit from the right at 0.1 / 0.3 / 0.6 s, in the normal field and Darkfield.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 }); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const shots = [];
  for (const df of [false, true]) {
    await page.evaluate(df => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
      SET.darkfield = df; UI.applySettings(); UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.enemies.length = 0; window.spawnRandom = () => {}; G.ebul.length = 0; G.armFlash = null; G.armourLost = 0;
      G.P.armour = 6; setZoom(2.2); }, df);
    await page.waitForTimeout(900);
    const clip = async name => { const r = await page.evaluate(() => ({ x: sx(G.player.x), y: sy(G.player.y) })); const p = require('path').resolve(__dirname, `out/arm_${df ? 'df_' : ''}${name}.png`); await page.screenshot({ path: p, clip: { x: r.x - 100, y: r.y - 100, width: 200, height: 200 } }); shots.push(p); };
    await clip('idle');
    await page.evaluate(() => { const p = G.player; p.iframes = 0; G.hitFrom = { x: p.x + 100, y: p.y - 30 }; hurtPlayer(30, 'test', null, 'bullets'); });
    for (const [w, n] of [[100, '01'], [200, '03'], [300, '06']]) { await page.waitForTimeout(w); await clip(n); }
  }
  console.log(shots.length, 'shots', 'ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
