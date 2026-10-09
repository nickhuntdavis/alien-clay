// Full Auto: start a normal run and a waves run in the real UI, touch nothing, and see how far they get.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 2).join(' | ')));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(400); await page.evaluate(() => { META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; });
  const out = [];
  for (const smp of ['s001', 's002']) {
    await page.evaluate((smp) => { SET.auto = true; SET.autoWaves = true; UI.sample = smp; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = G.state || 'play'; }, smp);
    // Fast-forward: real frames are slow headless, so step the loop like frame() does, plus UI.tick.
    const r = await page.evaluate(async () => {
      let picks = 0, waves = 0; const opened = UI.pickLoot.bind(UI);
      UI.pickLoot = i => { picks++; return opened(i); };
      const wb = waveBegin; window.waveBegin = () => { waves++; return wb(); };
      for (let f = 0; f < 30 * 150 && G && G.state !== 'over'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else { G.player.hp = G.P.maxHp; update(1 / 30); } }
        else if (G.state === 'bossIntro') updateBossIntro(1 / 30);
        else if (G.state === 'intro') updateIntro(1 / 30);
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; if (UI.autoWaveT) UI.autoWaveT -= 1000 / 30; // let the UI timers run at game speed
        UI.autoTick();
        if (f % 300 === 0) await new Promise(r => setTimeout(r, 0));
      }
      return { state: G.state, t: Math.round(G.t), lvl: G.level, picks, waves, w: G.weapons.filter(Boolean).map(w => w.id + w.lvl).join(' '), wave: G.wave ? G.wave.n : '-' };
    });
    out.push(smp + ' ' + JSON.stringify(r));
  }
  await page.evaluate(() => { SET.auto = false; });
  console.log(out.join('\n'), '\nERRORS:', errors.length ? [...new Set(errors)].slice(0, 5).join('\n') : 'none'); await b.close();
})();
