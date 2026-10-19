// Your non-defence upgrades worn on the body (samplelooks.js slUpState/slUpUnder/slUpOver): stat changes (bulk,
// stretch, beat, receptor field) and each body and trade-off mutation's mark. Saves tests/out/upbody_<id>_<case>.png.
// Fails on page errors, or if more damage and swim speed don't change the head's scale.
const { chromium } = require('playwright');
const path = require('path'), out = f => path.resolve(__dirname, 'out', f);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.intros = 'off'; }); await page.waitForTimeout(300);
  const bad = [];
  const cases = [['none', {}, null], ['stats', {}, { might: 1.6, haste: 1.6, speed: 1.4, magnet: 2 }], ['body1', { m_slip: 2, m_pad: 2, m_fingers: 2, m_heart: 2, t_static: 1 }], ['body2', { m_hold: 2, m_parts: 2, m_excite: 2, m_space: 1 }],
    ['trade1', { x_brain: 1, x_once: 1, x_careless: 1, r_pains: 1 }], ['trade2', { x_hungry: 1, x_qty: 1, t_blood: 1 }]];
  for (const id of ['baseline', 'ordered', 'prawn', 'alien']) for (const [name, muts, stat] of cases) {
    const sc = await page.evaluate(([id, muts, stat]) => {
      META.profile = 's10_' + id; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; UI.show('hud'); SET.darkfield = false;
      const D = pdef(); D.mem.mem = D.mem.memMax = 0; slUpState(); // (fixes the run's baseline before the changes)
      G.muts = Object.assign(G.muts || {}, muts); if (stat) for (const s in stat) G.P[s] *= stat[s];
      const p = G.player, x0 = p.x, y0 = p.y;
      for (let i = 0; i < 50; i++) { update(1 / 60); p.x = x0; p.y = y0; p.vx = 150; p.vy = 0; p.face = p.hd = 0; cam.x = p.x - 20; cam.y = p.y; G.realT += 1 / 60; render(); G.player.hp = 1e6; }
      const U = slUpState(); return U.bulk * U.str;
    }, [id, muts, stat]);
    if (name === 'stats' && !(sc > 1.15)) bad.push(id + ' stats did not reshape: ' + sc.toFixed(2));
    await page.screenshot({ path: out(`upbody_${id}_${name}.png`), clip: { x: 120, y: 370, width: 160, height: 120 } });
  }
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
