// HOLD (spsteer.js): the sperm does not move unless steered by hand.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; G.P.maxHp = G.player.hp = 1e6; G.manual = null;
    const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + 60, p.y, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e);
    G.moveDir = 'hold'; for (let i = 0; i < 30; i++) update(1 / 60); const x0 = p.x, y0 = p.y; out.v = [Math.round(p.vx), Math.round(p.vy)]; for (let i = 0; i < 60; i++) update(1 / 60);
    out.hold = Math.round(Math.hypot(p.x - x0, p.y - y0)); if (out.hold > 3) bad.push('HOLD moved ' + out.hold);
    G.moveDir = 'kite'; const x1 = p.x, y1 = p.y; for (let i = 0; i < 60; i++) update(1 / 60);
    out.kite = Math.round(Math.hypot(p.x - x1, p.y - y1)); if (out.kite < 10) bad.push('KITE did not move ' + out.kite);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
