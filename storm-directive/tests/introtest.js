const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  await page.evaluate(() => { localStorage.clear(); META.seen = {}; UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; SET.auto = false; G.weapons = [makeSlot('blaster', false, 2), null, null]; recomputeAll(); });
  let st = null;
  for (let i = 0; i < 120 && !st; i++) { await page.waitForTimeout(250); st = await page.evaluate(() => G.state === 'bossIntro' && G.bossIntro && G.bossIntro.foe ? G.bossIntro.foe + ' t=' + G.t.toFixed(1) : null); await page.evaluate(() => { G.lootQueue = []; }); }
  console.log('intro:', st);
  await page.waitForTimeout(1700);
  await page.screenshot({ path: 'introcard.png' });
  await page.click('#bossIntro');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({ state: G.state, seen: Object.keys(META.seen), saved: JSON.parse(localStorage.getItem('sd_meta')).seen }));
  console.log(JSON.stringify(after));
  // Same type again in a new run: no intro (until another new type shows up).
  const again = await page.evaluate(() => { const first = Object.keys(META.seen)[0]; newGame(); UI.show('hud'); G.state = 'play'; G.t = 20; G.enemies.length = 0; const e = makeEnemy(ENEMIES[first], G.player.x + 60, G.player.y); G.enemies.push(e); gridBuild(); G.introCheck = 0; introTick(); return G.state; });
  console.log('same type, new run:', again);
  // Full Auto clears an intro by itself.
  const auto = await page.evaluate(async () => { SET.auto = true; G.t = 30; G.introNext = 0; G.introCheck = 0; G.enemies.length = 0; const e = makeEnemy(ENEMIES.medic, G.player.x + 60, G.player.y); G.enemies.push(e); gridBuild(); introTick(); const s0 = G.state; await new Promise(r => setTimeout(r, 3500)); return s0 + ' -> ' + G.state; });
  console.log('full auto:', auto);
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
