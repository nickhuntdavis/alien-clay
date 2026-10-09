const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {};
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; for (let i = 0; i < 60; i++) update(1 / 30);
    G.rage = 5; render(); const a = G.state + ' ' + (G.bossIntro && G.bossIntro.status);
    return a; });
  await page.waitForTimeout(1500); await page.screenshot({ path: 'stintro.png' });
  const r2 = await page.evaluate(() => { endBossIntro(); const s1 = G.state; G.t += 5; render(); const s2 = G.state; G.t += 5; G.shieldT = 3; render(); const s3 = G.state + ' ' + (G.bossIntro && G.bossIntro.status); endBossIntro(); G.t += 5; render(); return [s1, s2, s3, G.state, Object.keys(META.seenSt).join(',')].join(' | '); });
  console.log(r, '||', r2); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
