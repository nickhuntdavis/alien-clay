const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } }); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.bossRoster = ['ghost']; G.bossCount = 0; spawnBoss(); endBossIntro(); const e = G.boss; e.hp = e.maxHp = 1e5;
    const h0 = e.hp; damageEnemy(e, 500, { elem: 'phys', wname: 'T' }); const afterForce = h0 - e.hp;
    damageEnemy(e, 500, { elem: 'fire', wname: 'T' }); const afterAcid = h0 - e.hp - afterForce;
    const h1 = e.hp; damageEnemy(e, 500, { elem: 'phys', wname: 'Brush', env: true }); const env = h1 - e.hp;
    // walls: put it inside a solid obstacle and see if it stays
    const ob = (G.terrain.list || G.terrain.obs || G.terrain).find ? (G.terrain.list || G.terrain.obs || G.terrain).find(o => o.def && o.def.solid) : null; let inWall = 'no solid';
    if (ob) { e.x = ob.x; e.y = ob.y; terrainBody(e, 1 / 30); inWall = Math.hypot(e.x - ob.x, e.y - ob.y) < 1 ? 'stays inside (passes through)' : 'pushed out'; }
    // relics
    for (const id of ['seethrough', 'poltergeist', 'ectoplasm']) applyRelic(id);
    for (let i = 0; i < 6; i++) G.enemies.push(makeEnemy(ENEMIES.brute, G.player.x + 60 + i * 30, G.player.y)); for (let i = 0; i < 200; i++) { G.player.hp = G.P.maxHp; update(1 / 30); G.state = 'play'; }
    return { afterForce, afterAcid: Math.round(afterAcid), env: Math.round(env), inWall, dodge: G.P.dodge.toFixed(2), polt: Math.round(G.stats.dmg.Poltergeist || 0), name: e.name };
  });
  console.log(JSON.stringify(r)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
