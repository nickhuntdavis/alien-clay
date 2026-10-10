const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.addInitScript(() => { window.VIBES = []; navigator.vibrate = p => { window.VIBES.push(JSON.stringify(p)); return true; }; });
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; UI.quickStart(); G.t = 40; });
  await page.waitForTimeout(400);
  // level up: loot should wait ~0.45s
  await page.evaluate(() => { G.lootQueue.length = 0; VIBES.length = 0; gainXp(G.xpNeed * 1.01 / (XP_PACE * G.P.xp * G.evm.xp * puXp())); });
  await page.waitForTimeout(120); await page.screenshot({ path: 'juice_lvl.png' });
  const a = await page.evaluate(() => ({ st: G.state, lvl: G.level, hold: +(G.lootHold || 0).toFixed(2), vib: VIBES.slice() }));
  await page.waitForTimeout(600);
  const b2 = await page.evaluate(() => ({ st: G.state, loot: $('loot').classList.contains('on') }));
  console.log('level', JSON.stringify(a), JSON.stringify(b2));
  // mastery
  await page.evaluate(() => { UI.show('hud'); G.state = 'play'; G.lootQueue.length = 0; VIBES.length = 0; const w = G.weapons.find(Boolean); setWeaponLevel(w, 10, 9); G.lootQueue.length = 0; });
  await page.waitForTimeout(250); await page.screenshot({ path: 'juice_mast.png' });
  console.log('mastery', await page.evaluate(() => JSON.stringify({ banner: G.banner && G.banner.text, vib: VIBES })));
  // elite kill + boss-hit hitstop + big hurt
  const c = await page.evaluate(() => { VIBES.length = 0; G.hsNext = 0; const e = makeEnemy(ENEMIES.brute, G.player.x + 300, G.player.y, { elite: true }); G.enemies.push(e); killEnemy(e, {}); const r1 = G.hitStop; G.hitStop = 0; G.hsNext = 0;
    G.player.iframes = 0; hurtPlayer(G.P.maxHp * 0.3, 'test', null, 'contact'); const r2 = G.hitStop; return { elite: r1, hurt: r2, vib: VIBES.slice() }; });
  console.log('hits', JSON.stringify(c));
  // freeze actually stops the world
  const d = await page.evaluate(async () => { G.hitStop = 0.2; const t0 = G.t; await new Promise(r => setTimeout(r, 120)); const t1 = G.t; await new Promise(r => setTimeout(r, 250)); return { during: +(t1 - t0).toFixed(3), after: +(G.t - t1).toFixed(3) }; });
  console.log('freeze', JSON.stringify(d));
  await page.evaluate(() => { SET.vibe = false; VIBES.length = 0; buzz('level'); }); console.log('vibe off', await page.evaluate(() => VIBES.length));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
