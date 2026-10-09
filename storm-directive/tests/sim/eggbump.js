const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  const out = [];
  for (const mode of ['collect', 'kite', 'hunt', 'orbit', 'defend']) {
    out.push(await page.evaluate(mode => {
      META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
      SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      let touch = 0, n = 0;
      for (let f = 0; f < 30 * 240 && G.state !== 'over'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1/30); }
        else if (G.state === 'bossIntro') endBossIntro(); else if (G.state === 'intro') updateIntro(1/30);
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.lootOpenT -= 1000/30; UI.autoAt = (UI.autoAt||0) - 1000/30; UI.autoTick();
        G.moveDir = mode; if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (G.state === 'play') { n++; { const dd = Math.hypot(G.player.x - G.core.x, G.player.y - G.core.y); if (dd > 1 && dd < CORE.r + G.player.r + 3) touch++; } }
      }
      return mode + ' ' + (100 * touch / n).toFixed(1) + '%';
    }, mode));
  }
  console.log(out.join(' | '), errors.slice(0, 2)); await b.close();
})();
