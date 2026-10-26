// Stat cards roll a rarity, and rarer ones give more (wmods.js wmStatCard, WM.statSteps).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's002'; newGame(); G.state = 'play'; UI.show('hud'); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = [];
    UI.lootReq = { kind: 'level' };
    const keep = rollRarity, gain = {};
    for (const rar of [0, 1, 2, 3, 4]) {
      rollRarity = () => rar; const c = wmStatCard('crit'); rollRarity = keep;
      const b0 = (G.stb && G.stb.crit) || 0; c.apply(); gain[rar] = +(((G.stb.crit - b0) / ST_DEF.crit.k)).toFixed(2);
      if (c.rarity !== rar || gain[rar] !== WM.statSteps[rar]) bad.push('rarity ' + rar + ' ' + [c.rarity, gain[rar], c.sub]);
    }
    out.gain = gain;
    const n = {}; for (let i = 0; i < 400; i++) { const c = wmStatCard('dmg'); n[c.rarity] = (n[c.rarity] || 0) + 1; }
    out.dealt = n; if (!(n[0] > 100 && n[2] > 10 && n[3] > 0)) bad.push('spread ' + JSON.stringify(n));
    UI.lootReq = { kind: 'level', boost: 2 }; const m = {}; for (let i = 0; i < 100; i++) { const c = wmStatCard('dmg'); m[c.rarity] = (m[c.rarity] || 0) + 1; }
    out.boosted = m; if (m[0] || m[1]) bad.push('boost floor ' + JSON.stringify(m));
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
