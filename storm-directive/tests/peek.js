const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 700 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.t = 40; G.enemies.length = 0; window.spawnRandom = () => {};
    const p = G.player; G.weapons = [makeSlot('peekaboo', false, 3), null, null]; recomputeAll();
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; G.enemies.push(makeEnemy(ENEMIES.charger, p.x + Math.cos(a) * 90, p.y + Math.sin(a) * 90)); }
    gridBuild(); G.peek = { x: p.x, y: p.y, t: G.t + 30, w: G.weapons[0], boo: false };
    p.x += 160; G.manual = null; window.autoSteer = () => ({ x: 0, y: 0 });
    return 'ok'; });
  await page.waitForTimeout(1500); await page.screenshot({ path: 'peek.png' });
  const faces = await page.evaluate(() => { const sp = G.peek; return G.enemies.slice(0, 4).map(e => ({ toSpot: Math.round(Math.atan2(sp.y - e.y, sp.x - e.x) * 57.3), look: Math.round((e.lookA || 0) * 57.3), toPlayer: Math.round(Math.atan2(G.player.y - e.y, G.player.x - e.x) * 57.3) })); });
  console.log(JSON.stringify(faces), errors.length ? errors.slice(0, 2) : 'no errors'); await b.close();
})();
