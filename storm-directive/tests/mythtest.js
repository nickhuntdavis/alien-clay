const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue.length = 0;
    const out = []; for (let k = 0; k < 40; k++) { const o = genLoot({ kind: 'myth' }); out.push(o.map(x => x.rarity + (x.cursed ? 'C' : '')).join('')); }
    achieve('chemwar'); const q = G.lootQueue.map(x => x.kind);
    UI.openLoot(G.lootQueue.shift());
    return { rar: [...new Set(out.join('').split(''))].join(','), sample: out.slice(0, 6), q, title: document.querySelector('#loot h2, #lootTitle') && document.querySelector('#loot h2, #lootTitle').textContent, normalAfter: genLoot({ kind: 'level' }).map(x => x.rarity).join('') }; });
  await page.waitForTimeout(1500); await page.screenshot({ path: 'myth.png' });
  console.log(JSON.stringify(r), errors); await b.close();
})();
