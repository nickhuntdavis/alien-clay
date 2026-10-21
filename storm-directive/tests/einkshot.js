const { chromium } = require('playwright');
// eInk view: eink.css is live only when SET.view is 'eink' (Paper, or Ink under the phone's dark setting); Lab and Arcade never see it.
(async () => {
  const b = await chromium.launch(); const errors = []; const res = {};
  for (const scheme of ['light', 'dark']) {
    const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, colorScheme: scheme }); page.on('pageerror', e => errors.push(e.message));
    await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
    const bg = () => page.evaluate(() => [document.getElementById('einkCss').media, getComputedStyle(document.body).backgroundColor, getComputedStyle(document.body).fontFamily.split(',')[0], viewArcade()].join(' | '));
    for (const v of ['arcade', 'lab', 'eink']) { await page.evaluate(v => { SET.view = v; UI.applySettings(); }, v); res[scheme + ' ' + v] = await bg(); }
    await page.screenshot({ path: require('path').resolve(__dirname, `out/eink_title_${scheme}.png`) });
    await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
      SET.autoWaves = false; SET.auto = false; UI.applySettings(); UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.spells[0] = makeSlot('thunder', true, 1); recomputeAll(); UI.refreshHud(true); });
    await page.waitForTimeout(1200); await page.screenshot({ path: require('path').resolve(__dirname, `out/eink_hud_${scheme}.png`) });
    await page.evaluate(() => { G.state = 'pause'; UI.show('pause'); }); await page.waitForTimeout(300); await page.screenshot({ path: require('path').resolve(__dirname, `out/eink_pause_${scheme}.png`) });
    await page.close();
  }
  for (const k in res) console.log(k.padEnd(13), res[k]);
  const ok = res['light eink'].startsWith('all') && res['light arcade'].startsWith('not all') && res['light lab'].startsWith('not all') && res['light eink'] !== res['dark eink'];
  console.log(ok ? 'eink OK' : 'FAIL eink toggle', 'ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
