// Environment redesign: ground pools, the morning-after pill (fizzing and dissolved), the dish wall and the
// egg's warm zone, in the light field and Darkfield. Screenshots in out/env_*.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const setup = async (sample, df) => page.evaluate(([sample, df]) => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    SET.darkfield = df; SET.fullColour = true; UI.applySettings();
    UI.sample = sample; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid([]);
    const p = G.player; p.hp = 1e9; G.P.maxHp = 1e9;
    return 1;
  }, [sample, df]);
  const shot = async name => { await page.evaluate(() => { G.state = 'pause'; }); await page.waitForTimeout(150); await page.screenshot({ path: name }); };
  for (const df of [false, true]) {
    const tag = df ? 'df' : 'light';
    // Pools round you, the dish wall in view (wave mode).
    await setup('s002', df);
    await page.evaluate(() => {
      const p = G.player, R = CORE.arena; p.x = G.core.x + R - 260; p.y = G.core.y; cam.x = p.x; cam.y = p.y;
      const z = (dx, dy, r, o) => G.zones.push(Object.assign({ x: p.x + dx, y: p.y + dy, r, life: 5, max: 5, dps: 0, pull: 0, tick: 0, src: { wname: 't', elem: o.elem } }, o));
      z(-120, -200, 70, { color: '#c6ff3d', elem: 'fire' }); z(60, -230, 60, { color: '#bde0fe', elem: 'ice', ice: true });
      z(-110, 160, 80, { color: '#e8a33d', elem: 'poison', spell: 'cloud' }); z(80, 180, 55, { color: '#ffb3c6', elem: 'salt' });
    });
    await shot(`env_pools_${tag}.png`);
    // The pill fizzing, then dissolved, near the egg's warm zone (race mode).
    await setup('s001', df);
    await page.evaluate(() => { const p = G.player; dropPill(); G.pill.x = p.x + 60; G.pill.y = p.y - 150; G.pill.t = 2; cam.x = p.x; cam.y = p.y; });
    await shot(`env_pill_${tag}.png`);
    await page.evaluate(() => { G.pill.t = PILL.fizz + 40; const c = G.core; G.player.x = c.x + CORE.sanctuary + 150; G.player.y = c.y; cam.x = G.player.x; cam.y = G.player.y; G.pill.x = c.x + CORE.sanctuary + 1100; G.pill.y = c.y + 600; });
    await shot(`env_cloud_${tag}.png`);
  }
  console.log('ERRORS', JSON.stringify(errors)); await b.close(); process.exit(errors.length ? 1 : 0);
})();
