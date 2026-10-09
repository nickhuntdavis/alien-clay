const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    for (const k in ENEMY_INTRO) (META.seen || (META.seen = {}))[k] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; SET.auto = false;
    const run = n => { for (let f = 0; f < n; f++) { G.player.hp = G.P.maxHp; update(1 / 30); G.state = 'play'; G.lootQueue = G.lootQueue.filter(q => q.kind === 'sfork'); } };
    const out = {};
    for (const id of Object.keys(SPELLS)) {
      const res = [];
      for (const k of ['a', 'b']) {
        G.lootQueue = []; G.enemies.length = 0;
        for (let i = 0; i < 12; i++) { const e = makeEnemy(ENEMIES.brute, G.player.x + 80 + i * 15, G.player.y + (i % 3) * 20); e.hp = e.maxHp = 1e6; G.enemies.push(e); }
        gridBuild();
        const w = makeSlot(id, true, 3); G.spells = [w, null]; recomputeAll();
        setWeaponLevel(w, 4, 3);
        const q = G.lootQueue.find(x => x.kind === 'sfork');
        if (!q) { res.push(k + ':NO FORK'); continue; }
        const opts = genLoot(q); const before = JSON.stringify(w.s);
        opts[k === 'a' ? 0 : 1].apply();
        const statChanged = JSON.stringify(w.s) !== before;
        const hp0 = G.enemies.reduce((a, e) => a + e.hp, 0);
        w.cd = 0; run(90);
        const dealt = Math.round(hp0 - G.enemies.reduce((a, e) => a + e.hp, 0));
        res.push(`${k}:${opts[k === 'a' ? 0 : 1].title}${statChanged ? '*' : ''} dealt ${dealt}`);
      }
      out[id] = res.join(' | ');
    }
    return out;
  });
  for (const k in r) console.log(k.padEnd(11), r[k]);
  console.log('ERRORS:', errors.length ? errors.slice(0, 4) : 'none'); await b.close();
})();
