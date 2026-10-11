// Enemies (STYLE.md pass): the reworked shapes (Antibody, Macrophage, Acid Bubble, Nurse Cell, Cytokine
// Caster, Enzyme Spire, Mitotic Cell) and a boss with its aura, plus the toy weapons' bits, in both fields.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  for (const df of [false, true]) {
    await page.evaluate(df => {
      META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
      SET.darkfield = df; SET.fullColour = true; UI.applySettings();
      UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid([]);
      const p = G.player; p.hp = 1e9; G.P.maxHp = 1e9;
      const ids = ['spitter', 'brute', 'bomber', 'medic', 'warlock', 'spire', 'splitter', 'lancer'];
      ids.forEach((id, i) => { const e = makeEnemy(ENEMIES[id], p.x - 120 + (i % 3) * 120, p.y - 340 + Math.floor(i / 3) * 120); e.speed = 0; G.enemies.push(e); });
      const bd = BOSSES.find(b => b.id === 'matron'), boss = makeEnemy(bd, p.x, p.y + 230); boss.boss = true; boss.speed = 0; boss.bphase = 1; G.enemies.push(boss);
      G.bubbleBoy = 5;
      for (let i = 0; i < 3; i++) update(1 / 60);
      for (const e of G.enemies) { e.x = e.x; }
      cam.x = p.x; cam.y = p.y; G.state = 'pause';
    }, df);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `foes_${df ? 'df' : 'light'}.png` });
  }
  console.log('ERRORS', JSON.stringify(errors)); await b.close(); process.exit(errors.length ? 1 : 0);
})();
