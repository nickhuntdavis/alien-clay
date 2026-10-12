// Acid: about half the enemies chasing you across a pit wade through it (and burn, with an Acid ring), the rest
// go round; bosses never wade. Every damage over time on an enemy has a coloured ring (render.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.terrain.list.length = 0; G.director && (G.director.t = -1e9); G.nextBoss = 1e9; G.ev.next = 1e9;
    const p = G.player; p.hp = G.P.maxHp = 1e6; G.weapons = [null]; recomputeAll();
    const ob = { type: 'acid', def: OBSTACLES.acid, x: p.x + 1500, y: p.y, r: 90, a: 0, charge: 0, flash: 0, seed: 1, burstT: 0, sp: 0, fixed: true, lobes: [] };
    G.terrain.list.push(ob); G.terrain.grid = terrainGrid(G.terrain.list);
    // You sit just left of the pit; a column of chasers comes at you from the right, straight through it.
    G.enemies.length = 0;
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0];
    for (let i = 0; i < 40; i++) { const e = makeEnemy(def, ob.x + 260, ob.y + (i - 20) * 4); e.hp = e.maxHp = 1e9; G.enemies.push(e); }
    const inside = new Set();
    for (let f = 0; f < 60 * 8; f++) {
      p.x = ob.x - 200; p.y = ob.y; update(1 / 60);
      for (const e of G.enemies) if (Math.hypot(e.x - ob.x, e.y - ob.y) < ob.r - 6) inside.add(e);
    }
    const waders = G.enemies.filter(e => e.acidWade).length;
    const boss = makeEnemy(def, ob.x + 20, ob.y + 10); boss.boss = true; terrainBody(boss, 0); const bossIn = boss.acidWade !== false || Math.hypot(boss.x - ob.x, boss.y - ob.y) < ob.r;
    return { waders, inside: inside.size, bossIn, burnt: G.enemies.filter(e => e.acidT > 0).length };
  });
  // The rings: one enemy with each damage over time.
  await page.evaluate(() => {
    const p = G.player; G.enemies.length = 0; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0];
    const set = [e => { e.burn = 9; e.burnDps = 1; }, e => { e.poison = 9; e.poisonDps = 1; e.poisonStacks = 1; }, e => { e.bleed = 50; }, e => { e.acidT = G.t + 99; }, e => { e.parasiteT = 9; }];
    set.forEach((fn, i) => { const e = makeEnemy(def, p.x - 120 + i * 60, p.y - 120); e.speed = 0; e.hp = e.maxHp = 1e9; fn(e); G.enemies.push(e); });
    G.debug = { freeze: true };
  });
  await page.waitForTimeout(400); await page.screenshot({ path: 'dotrings.png' });
  const ok = r.waders >= 10 && r.waders <= 30 && r.inside >= 5 && !r.bossIn && r.burnt >= 5;
  if (!ok) console.log('FAIL', JSON.stringify(r));
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
