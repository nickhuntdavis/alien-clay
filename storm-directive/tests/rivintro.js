const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { localStorage.clear(); SET.intros = 'full'; META.seen = {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; SET.auto = false; G.weapons = [makeSlot('blaster', false, 2), null, null]; recomputeAll();
    G.rivalSet = RIVALS.slice(0, 5); updateRivals(0.01); G.t = 20;
    const chad = G.enemies.find(e => e.rid === 'chad'); chad.x = G.player.x + 120; chad.y = G.player.y - 60; gridBuild(); G.introCheck = 0; introTick();
    const bodies = {}; for (const e of G.enemies) if (e.rival) bodies[e.rid] = { hp: Math.round(e.maxHp), spd: Math.round(e.speed), r: e.r.toFixed(1) };
    return { state: G.state, foe: G.bossIntro && G.bossIntro.foe, bodies };
  });
  console.log(JSON.stringify(r));
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'rivintro.png' });
  await page.click('#bossIntro'); await page.waitForTimeout(200);
  const beh = await page.evaluate(() => {
    const out = {}; const get = id => G.enemies.find(e => e.rid === id);
    // Kevin: first knockout doesn't take.
    const k = get('kevin'); killEnemy(k, {}); out.kevin1 = { dead: k.dead, hp: (k.hp / k.maxHp).toFixed(2), mode: k.mode };
    killEnemy(k, {}); out.kevin2 = { dead: k.dead, out: G.rivalOut.kevin };
    // Chad: barge when hunting nearby.
    const c = get('chad'); c.mode = 'hunt'; c.modeT = 20; c.bargeCd = 0; c.x = G.player.x + 200; c.y = G.player.y; G.state = 'play';
    rivalAI(c, 0.05); out.chadWind = c.bargeWind > 0;
    for (let i = 0; i < 14; i++) rivalAI(c, 0.05); out.chadDash = c.bargeT > 0 || Math.hypot(c.x - G.player.x, c.y - G.player.y) < 200;
    // Wiggles blinks when hurt.
    const w = get('wiggles'); w.mode = 'hunt'; w.modeT = 20; w.x = G.player.x + 300; w.y = G.player.y; w.hp = w.maxHp * 0.2; w.lastHp = w.hp;
    const d0 = Math.hypot(w.x - G.player.x, w.y - G.player.y); rivalAI(w, 0.05); out.wiggles = { jumped: Math.round(Math.hypot(w.x - G.player.x, w.y - G.player.y) - d0), mode: w.mode };
    // Zygo never flees.
    const z = get('zygo'); z.mode = 'hunt'; z.modeT = 20; z.x = G.player.x + 300; z.y = G.player.y; z.hp = z.maxHp * 0.2; z.lastHp = z.hp; rivalAI(z, 0.05); out.zygo = z.mode;
    return out;
  });
  console.log(JSON.stringify(beh));
  await page.evaluate(() => { for (const R of RIVALS) META.seen['rival_' + R.id] = 1; G.state = 'play'; UI.togglePause(); UI.pauseTab = 'codex'; UI.renderPause(); });
  await page.waitForTimeout(200);
  const y = await page.evaluate(() => { const h = [...document.querySelectorAll('#pause h3')].find(x => /Rivals/.test(x.textContent)); if (!h) return -1; h.scrollIntoView(); return 1; });
  console.log('codex rivals:', y);
  await page.waitForTimeout(200); await page.screenshot({ path: 'rivcodex.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
