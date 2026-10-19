// Not of This World draws as its own creature (alienyou.js), not a sperm: one screenshot per mood, in the
// normal field and Darkfield, plus the pause portrait. Fails on page errors or if the hook never draws.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = [];
  await page.evaluate(() => { META.profile = 's10_alien'; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; UI.show('hud'); SET.intros = 'off'; window.introSeen = () => true; });
  const ok = await page.evaluate(() => !!(G.s10 && G.s10.id === 'alien'));
  if (!ok) bad.push('not playing Not of This World');
  const shots = [['idle', 0, 160, 0], ['curious', 0, 0, 0], ['alert', 220, 160, 0], ['agitated', 90, 160, 0], ['hurt', 0, 160, 1]];
  for (const df of [false, true]) for (const [m, d, sp, hit] of shots) {
    const mood = await page.evaluate(async ([d, sp, hit, df]) => {
      SET.darkfield = df;
      const p = G.player; G.enemies.length = 0;
      if (d) { const e = makeEnemy(ENEMIES.crawler, p.x + d, p.y - 30); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); gridBuild(); }
      const x0 = p.x, y0 = p.y; if (d) { G.enemies[0].x = x0 + d; G.enemies[0].y = y0 - 30; }
      for (let i = 0; i < 50; i++) { update(1 / 60); p.x = x0; p.y = y0; p.vx = sp; p.vy = sp * 0.3; p.face = p.hd = 0.3; if (hit) { p.flash = 0.2; p.iframes = 0.5; } if (d) { G.enemies[0].x = x0 + d; G.enemies[0].y = y0 - 30; } cam.x = p.x; cam.y = p.y; G.realT += 1 / 60; render(); G.player.hp = 1e6; }
      return alienMood(p);
    }, [d, sp, hit, df]);
    if (mood !== m) bad.push(`${m}: mood was ${mood}`);
    await page.screenshot({ path: require('path').resolve(__dirname, `out/alien_${m}${df ? '_df' : ''}.png`), clip: { x: 120, y: 330, width: 160, height: 200 } });
  }
  const drew = await page.evaluate(() => !!G.player.ay); if (!drew) bad.push('alienYou never drew');
  // Its card on the sample screen carries a live picture.
  await page.evaluate(() => { G = null; s10Samples(); document.querySelector('[data-s10="alien"]').scrollIntoView(); });
  await page.waitForTimeout(1500);
  const pic = await page.evaluate(() => { const c = document.querySelector('canvas[data-slpic="alien"]'); if (!c || !c.width) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; });
  if (pic < 500) bad.push('card picture empty: ' + pic);
  await (await page.$('[data-s10="alien"]')).screenshot({ path: require('path').resolve(__dirname, 'out/alien_card.png') });
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
