// Cilia tangle you (slow, no attacking); acid lets you in, burns, and clings after you leave.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.terrain.list.length = 0; G.director && (G.director.t = -1e9);
    const p = G.player, out = {};
    p.hp = G.P.maxHp = 1e6; G.P.dodge = 0; G.weapons[0] = makeSlot(Object.keys(WEAPONS)[0], false, 1); recomputeAll();
    const put = (type, x, y, r) => { const ob = { type, def: OBSTACLES[type], x, y, r, a: 0, charge: 0, flash: 0, seed: 1, burstT: 0, sp: 0, fixed: true }; G.terrain.list.push(ob); G.terrain.grid = terrainGrid(G.terrain.list); return ob; };
    // Cilia: an enemy in range, you in the bed: no shots fired.
    const c = put('cilia', p.x + 2000, p.y, 150);
    G.enemies.length = 0; const e = makeEnemy(ENEMIES.chaser || Object.values(ENEMIES)[0], c.x + 60, c.y); e.speed = 0; e.hp = e.maxHp = 1e9; G.enemies.push(e);
    p.x = c.x; p.y = c.y; G.proj.length = 0;
    const h0 = e.hp; for (let i = 0; i < 120; i++) { p.x = c.x; p.y = c.y; update(1 / 60); }
    out.inCilia = G.inCilia; out.shotsInCilia = h0 - e.hp;
    // Out of it: shots again.
    p.x = c.x - 400; p.y = c.y; e.x = p.x + 80; e.y = p.y;
    const h1 = e.hp; for (let i = 0; i < 120; i++) { p.x = c.x - 400; p.y = c.y; update(1 / 60); }
    out.shotsOut = h1 - e.hp;
    // Acid: you stay inside (not pushed out), it burns, and keeps burning after you leave.
    G.enemies.length = 0;
    const a = put('acid', p.x - 2000, p.y, 90);
    p.x = a.x; p.y = a.y; const hp0 = p.hp;
    for (let i = 0; i < 60; i++) { p.iframes = 0; p.vx = p.vy = 0; const px = p.x, py = p.y; update(1 / 60); out.moved = Math.max(out.moved || 0, Math.hypot(p.x - px, p.y - py)); }
    out.stayedIn = Math.hypot(p.x - a.x, p.y - a.y) < a.r; out.burntIn = p.hp < hp0;
    p.x = a.x - 600; p.y = a.y; p.iframes = 0; update(1 / 60);
    const hp1 = p.hp; for (let i = 0; i < 60; i++) { p.iframes = 0; p.x = a.x - 600; p.y = a.y; update(1 / 60); }
    out.lingers = p.hp < hp1 && G.acidOn > G.t;
    for (let i = 0; i < 200; i++) update(1 / 60);
    out.wearsOff = !(G.acidOn > G.t);
    return out;
  });
  console.log(JSON.stringify(r));
  const ok = r.inCilia && r.shotsInCilia === 0 && r.shotsOut > 0 && r.stayedIn && r.burntIn && r.lingers && r.wearsOff;
  console.log(ok ? 'ok' : 'FAIL', 'ERRORS', JSON.stringify(errors));
  await b.close(); process.exit(ok && !errors.length ? 0 : 1);
})();
