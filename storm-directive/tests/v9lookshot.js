// The v9 samples' bodies (v9looks.js): each in play (normal field and Darkfield), plus a sheet of their card pictures.
// Saves tests/out/v9look_<id>[_df].png and v9look_sheet.png; fails on page errors, a v9 sample that does not run as
// itself, or an empty picture.
const { chromium } = require('playwright');
const path = require('path'), out = f => path.resolve(__dirname, 'out', f);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.intros = 'off';  }); await page.waitForTimeout(300);
  const bad = [], ids = await page.evaluate(() => S9_IDS.slice());
  const only = process.argv[2] ? process.argv[2].split(',') : null;
  for (const pid of ids) for (const df of [false, true]) {
    if (only && !only.includes(pid)) continue;
    const got = await page.evaluate(([pid, df]) => {
      META.profile = pid; META.v9pick = pid; s9Sync(); UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; UI.show('hud');
      SET.darkfield = df; G.pdef && (G.pdef.shield = 0);
      const p = G.player, x0 = p.x, y0 = p.y;
      for (let i = 0; i < 60; i++) { update(1 / 60); p.x = x0; p.y = y0; p.vx = 150; p.vy = 0; p.face = p.hd = 0; cam.x = p.x - 30; cam.y = p.y; G.realT += 1 / 60; render(); G.player.hp = 1e6; }
      return G.s10 && G.s10.id;
    }, [pid, df]);
    if (got !== 'v9_' + pid) bad.push(pid + ': running ' + got);
    await page.screenshot({ path: out(`v9look_${pid}${df ? '_df' : ''}.png`), clip: { x: 70, y: 360, width: 260, height: 140 } });
  }
  // The card pictures, all on one sheet (light and dark backing).
  await page.evaluate(ids => {
    G = null; const d = document.createElement('div'); d.id = 'v9sheet'; d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#a3aba1;display:grid;grid-template-columns:1fr;gap:4px;padding:4px';
    d.innerHTML = ids.map((p, i) => `<div style="background:${i % 2 ? '#0b0d10' : '#c9cfc7'};padding:2px"><canvas data-slpic="v9_${p}" style="position:relative;inset:auto;display:block;width:100%;height:110px"></canvas></div>`).join('');
    document.body.appendChild(d); slPicStart();
  }, ids);
  await page.setViewportSize({ width: 400, height: 1300 }); await page.waitForTimeout(1500);
  for (const pid of ids) {
    const n = await page.evaluate(pid => { const c = document.querySelector(`#v9sheet canvas[data-slpic="v9_${pid}"]`); if (!c || !c.width) return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return n; }, pid);
    if (n < 300) bad.push('empty card picture: ' + pid);
  }
  await page.screenshot({ path: out('v9look_sheet.png'), clip: { x: 0, y: 0, width: 400, height: 1260 } });
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
