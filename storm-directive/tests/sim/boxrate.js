const { chromium } = require('playwright');
const N = +(process.argv[2] || 3), SMP = process.argv[3] || 's002';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const r = await page.evaluate(async ([N, SMP]) => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    const kinds = {}; let tot = 0, mins = 0; const perMin = [];
    const o = UI.openLoot.bind(UI); UI.openLoot = req => { kinds[req.kind] = (kinds[req.kind] || 0) + 1; tot++; const m = Math.floor(G.t / 60); perMin[m] = (perMin[m] || 0) + 1; return o(req); };
    for (let run = 0; run < N; run++) {
      SET.auto = true; SET.autoWaves = true; UI.sample = SMP; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      for (let f = 0; f < 30 * 600 && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !(typeof waveHoldsLoot === 'function' && waveHoldsLoot())) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 2) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') break;
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      mins += G.t / 60;
    }
    return { perRunMin: (tot / mins).toFixed(2), kinds, perMin: perMin.map(x => (x / N).toFixed(1)).join(' '), avgLen: (mins / N).toFixed(1) };
  }, [N, SMP]);
  console.log(SMP, JSON.stringify(r)); await b.close();
})();
