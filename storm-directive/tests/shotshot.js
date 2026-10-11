// Your shots and weapon effects (STYLE.md pass): one of each projectile style, a lobbed shot and orbiting
// blades, in the light field and Darkfield. Screenshots in out/shots_*.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  for (const df of [false, true]) {
    await page.evaluate(df => {
      META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
      SET.darkfield = df; SET.fullColour = true; SET.fx = 'full'; UI.applySettings();
      UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid([]);
      const p = G.player; p.hp = 1e9; G.P.maxHp = 1e9; G.weapons[1] = makeSlot('orbit', false, 3); recomputeAll();
      for (let i = 0; i < 20; i++) update(1 / 60);
      G.proj.length = 0;
      const styles = [null, 'bolt', 'needle', 'shard', 'glaive', 'disc', 'scrap', 'rocket', 'rail', 'sperm', 'flame', 'helix'];
      const cols = ['#4dff9a', '#ffe94a', '#bde0fe', '#9ff7ff', '#c77dff', '#e9ecef', '#d4a373', '#ff9f1c', '#ffffff', '#ffb3c6', '#ff7a2f', '#8dff4a'];
      styles.forEach((st, i) => { const c = i % 3, r = Math.floor(i / 3); G.proj.push({ x: p.x - 140 + c * 140, y: p.y - 330 + r * 110, vx: 900, vy: -250, r: 5, color: cols[i], style: st, src: { elem: i === 10 ? 'fire' : 'phys', wname: 't' }, life: 1, max: 1.5, dmg: 0, pierce: 99, hit: new Set() }); });
      G.proj.push({ x: p.x + 120, y: p.y + 170, vx: 0, vy: 0, r: 6, color: '#ffd166', lob: true, h: 60, src: { elem: 'phys', wname: 'lob' }, life: 1, max: 1, dmg: 0, hit: new Set() });
      cam.x = p.x; cam.y = p.y; G.state = 'pause';
    }, df);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `shots_${df ? 'df' : 'light'}.png` });
  }
  console.log('ERRORS', JSON.stringify(errors)); await b.close(); process.exit(errors.length ? 1 : 0);
})();
