const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  let i = 0;
  for (const set of [['vanguard'], ['bruiser', 'stealth', 'nerd']]) {
    await page.evaluate((set) => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; SET.auto = false;
      G.weapons[0] = makeSlot('blaster', false, 4); for (const w of G.weapons) if (w) computeStats(w);
      if (G.genes) { G.genes.primary = set[0]; G.genes.active = set.slice(); }
      G.passives = { multishot: 1, armour: 2, crit: 2 }; G.P.multishot = 1; G.lookKey = null;
      UI.togglePause(); }, set);
    await page.waitForTimeout(900);
    const px = await page.evaluate(() => G.realT);
    await page.screenshot({ path: `you_look${i++}.png`, clip: { x: 0, y: 0, width: 400, height: 420 } });
  }
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
