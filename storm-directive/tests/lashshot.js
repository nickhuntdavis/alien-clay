// The Flagellum Flail's lash (render.js 'lash' fx) at four moments: shooting out, at full stretch, springing
// back, nearly home. Also the Latex Barrier at its base size.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0;
    const p = G.player, w = makeSlot('flail', false, 1); G.weapons = [w]; recomputeAll();
    [0.9, 0.7, 0.45, 0.15].forEach((k, i) => G.fx.push({ type: 'lash', x: p.x - 120, y: p.y - 260 + i * 70, a: 0, r: w.s.range || 220, w: 14, color: w.def.color, life: 0.32 * k, max: 0.32, seed: 3 + i }));
    const bw = makeSlot('barrier', true, 1); G.spells = [bw, null]; recomputeAll();
    G.barrier = 99; G.barrierR = bw.s.area; G.debug = { freeze: true }; cam.x = p.x; cam.y = p.y - 120;
    return { barrierR: Math.round(bw.s.area), range: w.s.range };
  });
  await page.waitForTimeout(300); await page.screenshot({ path: 'lash.png', clip: { x: 0, y: 120, width: 400, height: 520 } });
  if (r.barrierR > 60) console.log('FAIL', JSON.stringify(r));
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
