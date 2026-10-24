// The sample lineup: every v10 sample's body in play (normal field and Darkfield) and every sample card's live
// picture (samplelooks.js, alienyou.js). Saves tests/out/lineup_<id>[_df].png and lineup_cards.png; fails on page
// errors or an empty card picture.
const { chromium } = require('playwright');
const path = require('path'), out = f => path.resolve(__dirname, 'out', f);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.intros = 'off'; }); await page.waitForTimeout(300);
  const bad = [], ids = await page.evaluate(() => SAMPLES10.map(s => s.id));
  for (const id of ids) for (const df of [false, true]) {
    const got = await page.evaluate(([id, df]) => {
      if (/^v9_/.test(id)) { META.profile = META.v9pick = id.slice(3); s9Sync(); } else META.profile = 's10_' + id; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; UI.show('hud');
      SET.darkfield = df; G.pdef && (G.pdef.shield = 0);
      const p = G.player, x0 = p.x, y0 = p.y;
      for (let i = 0; i < 60; i++) { update(1 / 60); p.x = x0; p.y = y0; p.vx = 150; p.vy = 0; p.face = p.hd = 0; cam.x = p.x - 30; cam.y = p.y; G.realT += 1 / 60; render(); G.player.hp = 1e6; }
      return G.s10 && G.s10.id;
    }, [id, df]);
    if (got !== id) bad.push(id + ': running ' + got);
    await page.screenshot({ path: out(`lineup_${id}${df ? '_df' : ''}.png`), clip: { x: 70, y: 360, width: 260, height: 140 } });
  }
  await page.evaluate(() => { G = null; s10Samples(); });
  await page.waitForTimeout(1200);
  for (const id of ids) { const el = await page.$(`[data-s10="${id}"]`); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    const n = await page.evaluate(id => { const c = document.querySelector(`canvas[data-slpic="${id}"]`); if (!c || !c.width) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; }, id);
    if (n < 300) bad.push('empty card picture: ' + id);
    await el.screenshot({ path: out(`lineup_card_${id}.png`) }); }
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
