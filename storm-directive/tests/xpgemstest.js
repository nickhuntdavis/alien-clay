// XP granules (xpgems.js): no drift in waves, less in the race, Pickup Range and drift stat cards, bigger granules.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's002'; newGame(); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = []; G.state = 'play'; UI.show('hud');
    const p = me(), put = d => { G.gems.length = 0; dropGem(p.x + d, p.y, 1); return G.gems[0]; };
    let g = put(400); for (let i = 0; i < 60; i++) updatePickups(1 / 60);
    out.wave = Math.round(Math.hypot(g.x - p.x, g.y - p.y)); if (out.wave < 395) bad.push('wave gem drifted ' + out.wave);
    g = put(90); for (let i = 0; i < 60; i++) updatePickups(1 / 60); if (!g.dead) bad.push('magnet no longer pulls');
    // drift stat: 3 steps = 300 px reach in waves
    stGain('drift', 3); out.drift = xpDrift(false); g = put(250); for (let i = 0; i < 60; i++) updatePickups(1 / 60);
    out.wave2 = Math.round(Math.hypot(g.x - p.x, g.y - p.y)); if (!(g.dead || out.wave2 < 240)) bad.push('drift stat ' + out.wave2);
    // Pickup Range card
    const m0 = G.P.magnet; const c = wmStatCard('magnet'); c.apply(); out.magnet = [m0, +G.P.magnet.toFixed(3), c.desc];
    if (!(G.P.magnet > m0)) bad.push('pickup range card');
    const dc = wmStatCard('drift'); out.driftCard = [dc.title, dc.sub, dc.desc];
    if (!WM_STAT.includes('magnet') || !WM_STAT.includes('drift')) bad.push('not dealt');
    // race: drift reach 700
    G.wave = 0; out.race = xpDrift(true);
    G.wave = 1; G.gems.length = 0; for (let i = 0; i < 12; i++) dropGem(p.x + 60 + i * 25, p.y + 80 + (i % 3) * 30, [1, 6, 25, 120][i % 4]);
    return { bad, out };
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/xpgems.png'), clip: { x: 100, y: 330, width: 300, height: 200 } });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
