const { chromium } = require('playwright');
// The Devil's Threesome prototype: allocation, Rubber soaking, Flinch, sprint gating, Feat tiers, the HUD triangle.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 }); const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    SET.trio = true; UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.enemies.length = 0; window.spawnRandom = () => {};
    update(1 / 30); const T = G.trio, out = {};
    out.centre = trioAlloc().join('/');
    T.w = [0.5, 0, 0.5]; out.edge = trioAlloc().join('/');
    // Rubber corner: a hit is soaked, HP untouched.
    T.w = [1, 0, 0]; T.juice = 10; T.freeT = G.t; const p = G.player; p.iframes = 0; const hp0 = p.hp;
    hurtPlayer(20, 'test', null, 'bullets'); out.rubberHp = Math.round(hp0 - p.hp); out.rubberJuice = T.juice.toFixed(2);
    // Spunk corner: the same hit lands on HP.
    T.w = [0, 0, 1]; T.juice = 10; p.iframes = 0; const hp1 = p.hp; hurtPlayer(20, 'test', null, 'bullets'); out.spunkHp = Math.round(hp1 - p.hp);
    // Wiggle corner: Flinch.
    T.w = [0, 1, 0]; T.juice = 10; T.flinchT = -9; p.iframes = 0; const hp2 = p.hp; hurtPlayer(20, 'test', null, 'bullets'); out.flinchHp = Math.round(hp2 - p.hp); out.flinchJuice = T.juice.toFixed(1);
    // Sprint needs Wiggle.
    const run = () => { const x0 = p.x; for (let i = 0; i < 30; i++) { G.manual = { x: 1, y: 0, sprint: true }; update(1 / 30); G.state = 'play'; } G.manual = null; return Math.round(p.x - x0); };
    T.w = [0, 0, 1]; T.juice = 10; out.runNoWiggle = run(); T.w = [0, 1, 0]; T.juice = 10; out.runWiggle = run(); out.juiceAfterSprint = T.juice.toFixed(1);
    // Feats: Spunk sets the tier, none without Spunk.
    G.spells[0] = makeSlot('thunder', true, 1); recomputeAll();
    for (let i = 0; i < 4; i++) { const e = makeEnemy(ENEMIES.brute, p.x + 150, p.y + i * 30); e.hp = e.maxHp = 1e6; G.enemies.push(e); }
    const casts = (w, ticks) => { const c0 = G.stats.casts || 0; for (let i = 0; i < ticks; i++) { G.enemies.forEach((e, k) => { e.x = p.x + 150; e.y = p.y + k * 30; }); update(1 / 30); G.state = 'play'; } return (G.stats.casts || 0) - c0; };
    T.w = [1, 0, 0]; T.juice = 10; out.featsNoSpunk = casts(0, 90);
    T.w = [0, 0, 1]; T.juice = 10; out.featsSpunk = casts(0, 90); out.frozenAfter = G.enemies.filter(e => e.frozen > 0).length;
    T.w = [1 / 3, 1 / 3, 1 / 3]; T.juice = 7.4; G.manual = null;
    return out;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/trio.png') });
  console.log(JSON.stringify(r)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
