// The race's ending: at EGG.level, swim into the egg, its membrane gets a boss intro, kill it, finale.
// Also: touching the egg no longer wins on its own, and a rival at EGG.level breaks in (and can win).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const fails = [];
  const ok = (c, m) => { if (!c) fails.push(m); };
  const setup = () => page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.eggMet = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1;
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.t = 300; G.nextBoss = 1e9; G.rivalsInit = true; G.enemies.length = 0; window.spawnRandom = () => {}; });
  // 1. Below EGG.level and not fertile: touching the egg does nothing, and it can't be hurt.
  await setup();
  let r = await page.evaluate(() => { G.player.x = G.core.x - CORE.r - 10; G.player.y = G.core.y; for (let i = 0; i < 30; i++) { G.player.hp = G.P.maxHp; update(1 / 30); } return { state: G.state, egg: !!G.eggE }; });
  ok(r.state === 'play' && !r.egg, 'egg opened below EGG.level: ' + JSON.stringify(r));
  // 2. At EGG.level: touching it opens the membrane with a boss intro, not a win.
  r = await page.evaluate(() => { G.level = EGG.level; G.player.x = G.core.x - CORE.r - 10; G.player.y = G.core.y; for (let i = 0; i < 5 && G.state !== 'bossIntro'; i++) { G.player.hp = G.P.maxHp; G.lootQueue = []; G.state = 'play'; update(1 / 30); }
    return { state: G.state, egg: !!G.eggE, woke: G.eggE && G.eggE.woke, card: $('biName').textContent }; });
  ok(r.state === 'bossIntro' && r.egg && r.woke && /MEMBRANE/.test(r.card), 'no membrane intro: ' + JSON.stringify(r));
  // 3. Kill it: the finale starts.
  r = await page.evaluate(() => { endBossIntro(); const e = G.eggE; let n = 0;
    for (let i = 0; i < 4000 && G.state !== 'finale'; i++) { G.state = 'play'; G.player.hp = G.P.maxHp; G.t += 1; damageEnemy(e, e.maxHp, { elem: 'phys', wname: 'test', noCrit: true }); n++; }
    return { state: G.state, kind: G.finale && G.finale.kind, n }; });
  ok(r.state === 'finale' && r.kind === 'win', 'membrane kill did not reach the finale: ' + JSON.stringify(r));
  ok(r.n >= 30, 'membrane fell too fast (' + r.n + ' hits, cap is 2.5%/s)');
  // 4. A rival at EGG.level breaks in; if it gets through, you lose.
  await setup();
  r = await page.evaluate(() => { const R = RIVALS[0], e = makeRival(R, G.core.x + 500, G.core.y); e.lvl = EGG.level; e.clock = 1e6; rivalStats(e, 1); G.enemies.push(e); G.rivalOut = {};
    G.player.x = G.core.x - 1800; G.player.y = G.core.y; let opened = 0;
    for (let i = 0; i < 30 * 200 && G.state !== 'finale'; i++) { G.player.hp = G.P.maxHp; G.lootQueue = []; G.state = 'play'; G.player.x = G.core.x - 1800; update(1 / 30); if (G.eggE && !opened) opened = Math.round(G.t - 300); }
    return { foe: G.bossIntro && (G.bossIntro.foe || G.bossIntro.e.name), state: G.state, opened, by: G.eggE && G.eggE.openedBy, winner: G.rivalWinner }; });
  ok(r.opened > 0 && r.state === 'finale' && !!r.winner, 'rival break-in: ' + JSON.stringify(r));
  console.log(fails.length ? 'FAIL ' + fails.join(' | ') : 'egg ending ok');
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 3) : 'none'); await b.close();
})();
