const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); window.spawnRandom = () => {}; G.P.maxHp = 1e7; G.player.hp = 1e7; G.t = G.nextBoss - 1; let maxBosses = 0, spawned = 0;
    for (let f = 0; f < 60 * 400; f++) { G.lootQueue = []; if (G.state === 'bossIntro') endBossIntro(); G.state = 'play'; G.player.hp = 1e7; const n0 = G.bossCount; update(1 / 30); if (G.bossCount > n0) spawned++; maxBosses = Math.max(maxBosses, G.enemies.filter(e => e.boss && !e.dead && !e.twin).length); if (f === 60 * 120 && G.boss) G.boss.hp = 0, killEnemy(G.boss, {}); }
    return { spawned, maxBossesAtOnce: maxBosses, bossAlive: !!(G.boss && !G.boss.dead), nextBossIn: Math.round(G.nextBoss - G.t) };
  });
  console.log(JSON.stringify(r), errors.length ? errors.slice(0, 2) : ''); await b.close();
})();
