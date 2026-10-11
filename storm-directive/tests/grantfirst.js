// The first research grant can be picked up before you have been near the egg.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.grants = {}; META.grantOff = {}; META.eggMet = 0;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    update(1 / 30);
    const g = G.grant, out = { spawned: !!g, eggNear: !!G.eggNear };
    if (g) { G.player.x = g.x; G.player.y = g.y; update(1 / 30); }
    out.taken = grantHas('body'); return out;
  });
  console.log(JSON.stringify(r));
  const ok = r.spawned && !r.eggNear && r.taken;
  console.log(ok ? 'ok' : 'FAIL: first grant not taken before meeting the egg', 'ERRORS', JSON.stringify(errors));
  await b.close(); process.exit(ok && !errors.length ? 0 : 1);
})();
