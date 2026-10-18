// Enemy Membranes (foemem.js): the five cell enemies get a 30% Membrane, it soaks hits, and it draws as your bubble.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; META.seen = META.seen || {}; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    SET.fullColour = true; UI.applySettings();
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid([]);
    const p = G.player; p.hp = 1e9; G.P.maxHp = 1e9; let i = 0;
    for (const id of FOEMEM.ids.concat(['bulwark'])) {
      const e = makeEnemy(ENEMIES[id], p.x - 120 + (i % 3) * 120, p.y - 150 + Math.floor(i / 3) * 110); e.speed = 0; e.hp = e.maxHp = 400; e.cd = null; G.enemies.push(e); i++;
      const c = fightCd(e), want = id === 'bulwark' ? 0.5 : 0.3;
      out[id] = [c.def, +(c.memMax / c.maxHp).toFixed(2)];
      if (c.def !== 'membrane' || Math.abs(c.memMax / c.maxHp - want) > 0.01) bad.push(id + ' membrane ' + out[id]);
    }
    gridBuild();
    const e = G.enemies[0], c = fightCd(e), m0 = c.mem;
    damageEnemy(e, 30, { elem: 'fire', w: null, kx: 1, ky: 0 });
    out.soak = [Math.round(m0), Math.round(c.mem), Math.round(e.hp)];
    if (!(c.mem < m0) || e.hp < 400) bad.push('Membrane did not soak: ' + out.soak);
    return { bad, out };
  });
  for (const df of [false, true]) {
    await page.evaluate(df => { SET.darkfield = df; UI.applySettings(); const e = G.enemies[1]; damageEnemy(e, 20, { elem: 'fire', w: null, kx: 1, ky: 0 });
      for (let i = 0; i < 8; i++) update(1 / 60); cam.x = G.player.x; cam.y = G.player.y - 100; G.state = 'pause'; }, df);
    await page.waitForTimeout(200); await page.screenshot({ path: `foemem_${df ? 'df' : 'light'}.png` });
    await page.evaluate(() => { G.state = 'play'; });
  }
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
