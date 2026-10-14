const { chromium } = require('playwright');
// Immersive mode layout (portrait): Tackle Box and pause top right, the triangle on the left, START WAVE below centre.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 }); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    SET.immersive = true; SET.autoWaves = false; SET.auto = false; UI.applySettings(); UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.spells[0] = makeSlot('thunder', true, 1); G.spells[1] = makeSlot('meteor', true, 1); recomputeAll(); UI.refreshHud(true); });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => Object.fromEntries(['armBtn', 'pauseBtn', 'waveBtn', 'sslots', 'moveBtn', 'rewindBtn', 'abilBtn'].map(id => { const q = $(id).getBoundingClientRect(); return [id, [q.left, q.top, q.width, q.height].map(Math.round).join(',')]; })));
  const g = await page.evaluate(() => { const g = trioGeom(); return g.v.map(v => v.map(Math.round).join(',')).join(' '); });
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/immshot.png') });
  console.log(JSON.stringify(r), 'trio', g, 'ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
