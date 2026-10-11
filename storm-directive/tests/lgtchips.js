// Lateral Gene Transfer chips: a row of their own above the status chips (left; top in Immersive mode).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  let ok = true;
  for (const imm of [false, true]) {
    const r = await page.evaluate(imm => {
      META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
      META.seenSt = META.seenSt || {}; SET.immersive = imm; UI.applySettings();
      UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
      G.junk = { brute: 2, medic: 1, rotifer: 1, crawler: 3 }; G.junkNew = { medic: 1 }; G.rage = 5; G.shieldT = 5;
      update(1 / 60); G.state = 'pause'; render();
      const lg = junkChips().length, rects = UI.chipRects.slice(0, lg), st = UI.chipRects[lg];
      return { lg, rows: new Set(rects.map(q => q.y)).size, above: rects.every(q => st && q.y < st.y) };
    }, imm);
    console.log(imm ? 'immersive' : 'regular', JSON.stringify(r));
    ok = ok && r.lg === 4 && r.above;
    await page.screenshot({ path: `lgt_${imm ? 'imm' : 'reg'}.png` });
  }
  // Tap the first LGT chip: the Active effects screen lists the junk DNA powers.
  const tap = await page.evaluate(() => { G.state = 'play'; G.junkNew = { medic: 1 }; render(); const q = UI.chipRects[0]; return { x: q.x + q.w / 2, y: q.y + q.h / 2 }; });
  await page.mouse.click(tap.x, tap.y); await page.waitForTimeout(200);
  const pan = await page.evaluate(() => ({ on: document.getElementById('stpanel').classList.contains('on'), text: document.getElementById('stBody').textContent, fresh: Object.keys(G.junkNew).length }));
  console.log('panel', JSON.stringify({ on: pan.on, thick: /THICK SKIN x2/.test(pan.text), heading: /Lateral Gene Transfer/.test(pan.text), fresh: pan.fresh }));
  ok = ok && pan.on && /THICK SKIN x2/.test(pan.text) && /BEDSIDE MANNER/.test(pan.text) && pan.fresh === 0;
  await page.screenshot({ path: 'lgt_panel.png' });
  console.log(ok ? 'ok' : 'FAIL', 'ERRORS', JSON.stringify(errors)); await b.close(); process.exit(ok && !errors.length ? 0 : 1);
})();
