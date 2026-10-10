const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const ids = Object.keys(WEAPONS).filter(id => !WEAPONS[id].merged);
    const rows = ids.map(id => { const c = COMBOS.filter(x => x.a === id || x.b === id).length, p = PAIRINGS.filter(x => x.a === id || x.b === id).length; const seq = Object.keys(PROFILES).find(k => PROFILES[k].weapons.includes(id)) || '-'; return [id, WEAPONS[id].name, seq, c, p, c + p]; });
    rows.sort((a, b) => a[5] - b[5]);
    return { total: ids.length, combos: COMBOS.length, pairings: PAIRINGS.length, merged: Object.keys(WEAPONS).filter(id => WEAPONS[id].merged).length, rows: rows.map(r => r.join(' | ')) };
  });
  console.log(r.total, 'weapons;', r.combos, 'combos;', r.pairings, 'pairings;', r.merged, 'fusion results'); console.log(r.rows.join('\n')); await b.close();
})();
