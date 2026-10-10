// The Petri Dish never spawns enemies outside the dish wall or within SPAWN_SAFE of you (game.js dishSpawnPos/dishFix):
// waves 1 to 5 (boss included), at both zoom extremes, with the swimmer parked against the wall now and then.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  const out = [];
  for (const z of [0.6, 5]) {
    out.push(await page.evaluate(z => {
      META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
      UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      setZoom ? setZoom(z) : 0; ZOOM.z = z; S = S0 * z;
      const mk = makeEnemy, R = { n: 0, out: 0, near: 0, minD: 1e9, maxC: 0 };
      makeEnemy = function (def, x, y, o) {
        const e = mk(def, x, y, o), st = new Error().stack;
        if (/campSpawnOne|campSpawnMob|spawnBoss|waveEvent|dishSpawnPos/.test(st) && !/blink/.test(st)) {
          const d = Math.hypot(x - G.player.x, y - G.player.y), c = Math.hypot(x - G.core.x, y - G.core.y);
          R.n++; R.minD = Math.min(R.minD, d); R.maxC = Math.max(R.maxC, c);
          if (c > CORE.arena + 30) R.out++; if (d < SPAWN_SAFE - 40) R.near++; // (the ±25 group scatter)
        }
        return e;
      };
      const step = () => {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'bossIntro') endBossIntro();
        else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); }
        G.player.hp = G.P.maxHp; ZOOM.z = z; S = S0 * z;
      };
      for (let w = 0; w < 5; w++) {
        waveBegin();
        for (let f = 0; f < 30 * 90 && G.wave.active; f++) {
          step();
          if (f % 300 === 0) { const a = Math.random() * TAU; G.player.x = G.core.x + Math.cos(a) * (CORE.arena - 30); G.player.y = G.core.y + Math.sin(a) * (CORE.arena - 30); }
          if (f > 30 * 45) for (const e of G.enemies) if (!e.charmed && !e.dead) damageEnemy(e, 1e9, { elem: 'phys', wname: 'test' }); // (keep waves moving)
        }
        for (let f = 0; f < 30 * 30 && G.wave.active; f++) { step(); for (const e of G.enemies) if (!e.charmed && !e.dead) damageEnemy(e, 1e9, { elem: 'phys', wname: 'test' }); }
        for (let f = 0; f < 30 * 3; f++) step();
      }
      makeEnemy = mk;
      R.wave = G.wave.n; R.boss = G.stats.bossKills; R.minD = Math.round(R.minD); R.maxC = Math.round(R.maxC); R.z = z;
      return R;
    }, z));
  }
  for (const R of out) if (!R.n || R.out || R.near || R.wave < 5) console.log('FAIL', JSON.stringify(R));
  console.log(JSON.stringify(out), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
