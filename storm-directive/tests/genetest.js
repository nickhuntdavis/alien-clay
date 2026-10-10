const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const run = (sigs) => page.evaluate(sigs => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const keep = META.profile; META.profile = 'splicer'; DAILY.on = true; UI.sample = 's001'; newGame(); DAILY.on = false; META.profile = keep;
    UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {};
    G.player.x = 700; G.player.y = 400; cam.x = 700; cam.y = 400; G.t = 120; G.P.maxHp = 9999; G.player.hp = 9999;
    const gg = makeSlot('genegun', false, 10); gg.perks = sigs; G.weapons = [gg, makeSlot('flamer', false, 3), makeSlot('frost', false, 3)]; recomputeAll();
    for (let i = 0; i < 30; i++) { const a = i * 0.7, d = 140 + (i % 5) * 50; G.enemies.push(makeEnemy(ENEMIES.brute, 700 + Math.cos(a) * d, 400 + Math.sin(a) * d)); } gridBuild();
    G.stats.dmg = {}; G.stats.reactBy = {};
    let edits = 0; const k0 = G.kills;
    for (let f = 0; f < 600; f++) { G.lootQueue = []; G.player.hp = 9999; update(1 / 60); G.state = 'play'; edits += G.enemies.filter(e => e.edited > G.t).length > 0 ? 1 : 0; }
    const pairs = G.proj.filter(p => p.pair).length;
    return { inPool: PROFILES.splicer.weapons.join(','), kills: G.kills - k0, framesWithEdits: edits, reacts: JSON.stringify(G.stats.reactBy), dmg: Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ':' + Math.round(v)).join(' '), strandsNow: pairs };
  }, sigs);
  console.log('plain', JSON.stringify(await run({ 5: 'ggcrispr', 10: 'ggrecomb' })));
  console.log('triple+chimera', JSON.stringify(await run({ 5: 'ggtriple', 10: 'ggchimera' })));
  // screenshot mid-fight
  await page.evaluate(() => { for (let i = 0; i < 30; i++) G.enemies.push(makeEnemy(ENEMIES.brute, 700 + Math.cos(i) * 260, 400 + Math.sin(i) * 260)); gridBuild(); for (let f = 0; f < 40; f++) { G.lootQueue = []; update(1 / 60); } });
  await page.waitForTimeout(200); await page.screenshot({ path: 'genegun.png' });
  // draft offers it for Designer Baby
  console.log('draft:', await page.evaluate(() => { const ids = new Set(); for (let i = 0; i < 30; i++) for (const o of genLoot({ kind: 'start' })) ids.add(o.title); return [...ids].join(', '); }));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none', await page.evaluate(() => ERRS.last)); await b.close();
})();
