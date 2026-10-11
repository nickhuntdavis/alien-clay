// Settings > Colour: EARNED / ALWAYS / OFF per kind of colour, and the soft terrain (screenshots of both looks).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    const grey = c => /^rgba?\((\d+),\1,\1/.test(col(c).replace(/\s/g, ''));
    const out = { earnedDanger: grey(PAL.danger) };
    SET.cDanger = 'always'; SET.cElem = 'always'; UI.applySettings(); out.alwaysDanger = !grey(PAL.danger); out.alwaysAcid = !grey('#c6ff3d');
    G.boons = G.boons || {}; G.boons.technicolour = 1; SET.cReward = 'off'; UI.applySettings(); out.offRewardUnderTechni = grey(PAL.reward); out.techniYou = !grey(PAL.you);
    delete G.boons.technicolour; SET.cDanger = SET.cElem = SET.cReward = 'earned'; UI.applySettings();
    // Put one of each obstacle round the player.
    const p = G.player, L = G.terrain.list; L.length = 0; p.x += 1300; cam.x = p.x; cam.y = p.y;
    const put = (type, dx, dy, r) => L.push({ type, def: OBSTACLES[type], x: p.x + dx, y: p.y + dy, r, a: 0.4, charge: 20, flash: 0, seed: Math.random() * 100, burstT: 0 });
    put('acid', -110, -230, 70); put('current', 110, -230, 150); put('cilia', -110, 120, 130); put('slick', 110, 120, 120); put('ridge', -80, 330, 80); put('mito', 110, 330, 60);
    G.terrain.grid = terrainGrid(L); G.enemies.length = 0; G.director && (G.director.t = -999);
    return out;
  });
  console.log(JSON.stringify(r));
  const ok = r.earnedDanger && r.alwaysDanger && r.alwaysAcid && r.offRewardUnderTechni && r.techniYou;
  await page.evaluate(() => { G.state = 'pause'; }); await page.waitForTimeout(200);
  await page.screenshot({ path: 'colour_grey.png' });
  await page.evaluate(() => { SET.cTerrain = 'always'; SET.cBg = 'always'; UI.applySettings(); }); await page.waitForTimeout(200);
  await page.screenshot({ path: 'colour_on.png' });
  await page.evaluate(() => { SET.darkfield = true; SET.cTerrain = 'earned'; UI.applySettings(); }); await page.waitForTimeout(200);
  await page.screenshot({ path: 'colour_df_grey.png' });
  await page.evaluate(() => { SET.cTerrain = 'always'; UI.applySettings(); }); await page.waitForTimeout(200);
  await page.screenshot({ path: 'colour_df_on.png' });
  await page.evaluate(() => { SET.darkfield = false; SET.cTerrain = SET.cBg = 'earned'; UI.applySettings(); UI.openSettings('title'); UI.setTab = 'colour'; UI.renderSettings(); });
  const rows = await page.evaluate(() => document.querySelectorAll('#setBody .setrow').length);
  console.log('colour rows', rows, ok && rows === 11 ? 'ok' : 'FAIL');
  console.log('ERRORS', JSON.stringify(errors)); await b.close(); process.exit(ok && rows === 11 && !errors.length ? 0 : 1);
})();
