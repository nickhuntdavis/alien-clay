// The Macrophage Queen's snack budget (bosssig10_t2.js sg2Noms): 6 snacks in the first pattern cycle, each later cycle
// 60% of the last (6, 4, 2, 1, 1, then none), so her healing in one fight is bounded and a weak build still wins.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = await page.evaluate(() => {
    const bad = [], e = { maxHp: 1000, hp: 500 }, s = {}, per = 30, got = [];
    for (let c = 0; c < 8; c++) {
      sg2Noms(e, s, 'summon', 'dinner', e.hp); // (a new cycle)
      let healed = 0;
      for (let i = 0; i < 10; i++) { e.hp = 500; const h0 = e.hp; e.hp += per; sg2Noms(e, s, 'devour', 'devour', h0); healed += e.hp - h0; }
      got.push(Math.round(healed / per));
    }
    if (got.join(',') !== '6,4,2,1,1,0,0,0') bad.push('budgets ' + got.join(','));
    const f = { maxHp: 1000, hp: 500 }, t = {}; sg2Noms(f, t, 'summon', 'summon', 500); // (the fight's first cycle)
    let n = 0; for (let i = 0; i < 10; i++) { f.hp = 500; f.hp += per; sg2Noms(f, t, 'devour', 'devour', 500); n += f.hp > 500 ? 1 : 0; }
    if (n !== 6) bad.push('first cycle ' + n);
    return bad;
  });
  await b.close();
  if (errors.length) bad.push('page errors: ' + errors.slice(0, 3).join(' | '));
  if (bad.length) { console.log('FAIL queennomstest', bad); process.exit(1); } else console.log('ok');
})();
