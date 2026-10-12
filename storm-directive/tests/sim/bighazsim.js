// Big hazards: how often autorun is caught by each (bighaz.js). node sim/bighazsim.js [runs] [minutes] [mode s001|s002]
const { chromium } = require('playwright');
const N = +(process.argv[2] || 3), MIN = +(process.argv[3] || 4), MODE = process.argv[4] || 's002';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; });
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async ([MIN, MODE]) => {
      SET.auto = true; SET.autoWaves = true; UI.sample = MODE; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      let fr = 0; const inH = {}, near = {};
      const hz = G.bigHaz.map(h => h.type).join('+');
      for (let f = 0; f < 30 * 60 * MIN && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') break;
        if (G.state === 'play' && waveReady && waveReady()) waveBegin();
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (G.state !== 'play') continue;
        fr++;
        for (const h of G.bigHaz) { const k = bhIn(h, G.player.x, G.player.y); if (k > -0.3) near[h.type] = (near[h.type] || 0) + 1; const bad = h.type === 'plughole' ? k > 0.78 : h.type === 'hotflush' ? k > 0 && h.warn > 0 : h.def.terrain ? (h.type === 'acidlake' ? G.acidOn > G.t : G.inCilia) : k > 0; if (bad) inH[h.type] = (inH[h.type] || 0) + 1; }
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      const hk = G.stats.hurt || {};
      return `${hz} | near: ${Object.entries(near).map(([k, v]) => k + ' ' + (100 * v / fr).toFixed(0) + '%').join(', ')} | caught: ${Object.entries(inH).map(([k, v]) => k + ' ' + (100 * v / fr).toFixed(1) + '%').join(', ') || 'never'} | flush kills etc: ${JSON.stringify(Object.fromEntries(Object.entries(G.stats.dmg || {}).filter(([k]) => /Plughole|Spermicide|Hot Flush/.test(k)).map(([k, v]) => [k, Math.round(v)])))}`;
    }, [MIN, MODE]);
    console.log('RUN', seed, r);
  }
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
