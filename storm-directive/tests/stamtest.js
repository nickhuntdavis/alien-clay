const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.enemies.length = 0; window.spawnRandom = () => {};
    const run = sprint => { const x0 = G.player.x; for (let i = 0; i < 60; i++) { G.manual = { x: 1, y: 0, sprint }; update(1 / 30); G.state = 'play'; } return Math.round(G.player.x - x0); };
    const walk = run(false), s0 = Math.round(G.stam.cur), sprint = run(true), s1 = Math.round(G.stam.cur);
    for (let i = 0; i < 120; i++) { G.manual = { x: 1, y: 0, sprint: true }; update(1 / 30); G.state = 'play'; }
    const winded = G.stam.winded;
    G.manual = null; G.stam.cur = 100; G.stam.winded = false;
    G.spells[0] = makeSlot('meteor', true, 1); recomputeAll();
    for (let i = 0; i < 4; i++) { const e = makeEnemy(ENEMIES.brute, G.player.x + 150, G.player.y + i * 30); e.hp = e.maxHp = 1e6; G.enemies.push(e); }
    const c0 = G.stats.casts || 0;
    for (let i = 0; i < 300; i++) { update(1 / 30); G.state = 'play'; }
    return { walk, sprint, stamAfterSprint2s: s1, winded, casts10s: (G.stats.casts || 0) - c0, cost: featCost(G.spells[0]), oldCd: G.spells[0].s.cd.toFixed(1), stamNow: Math.round(G.stam.cur) };
  });
  console.log(JSON.stringify(r)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
