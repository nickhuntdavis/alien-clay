// Frame time at wave 18 of wave mode: a god-mode bot plays up to wave 18, the foes2.js types are added to the
// crowd, then 300 frames of update + render are timed. Headless Chromium draws in software and stalls now and
// then for 150 to 300 ms whatever is on screen (the HEAD build before foes2.js did it 8 times in 300 frames), so
// it fails on the 90th percentile over 33 ms or a median over 16 ms, and prints the max and the slow frames.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const step = () => {
      if (G.state === 'play') { let vb; if (G.lootQueue.length && !waveHoldsLoot() && (vb = v10Box(G.lootQueue[0])) !== 'wait') { const q = G.lootQueue.shift(); if (vb) UI.openLoot(q); } else update(1 / 30); } // (as game.js's main loop: v10Box drops or holds boxes)
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
      if (G.state === 'play' && waveReady()) waveBegin();
      UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
      G.player.hp = G.P.maxHp;
    };
    for (let f = 0; f < 30 * 3000 && !(G.wave.n >= 18 && G.wave.active && G.wave.t > 15); f++) {
      step();
      if (G.state === 'finale' || G.state === 'over') return { err: 'run ended at wave ' + G.wave.n };
      if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
    }
    const p = G.player, ids = ['litmus', 'mirror', 'shell', 'puffball', 'grease', 'leech', 'platelet', 'callus', 'plasma', 'interferon', 'cortisol', 'fibrin', 'complement', 'stem', 'tadpole', 'pube', 'fluff', 'bogey', 'sweetcorn', 'glitter'];
    for (const id of ids) for (let i = 0; i < 2; i++) { const a = Math.random() * 6.28; G.enemies.push(makeEnemy(ENEMIES[id], p.x + Math.cos(a) * 300, p.y + Math.sin(a) * 300)); }
    // Only the game frame is timed (update + render); loot cards and menus are DOM work between frames.
    const times = [], slow = [];
    for (let f = 0; times.length < 300 && f < 3000; f++) { // (300 timed play frames: loot screens and the wave break are skipped, not timed)
      let ms = 0;
      if (G.state === 'play' && !(G.lootQueue.length && !waveHoldsLoot())) {
        const t0 = performance.now(); update(1 / 30); const t1 = performance.now(); render(); const t2 = performance.now();
        ms = t2 - t0; if (ms > 33) slow.push(`f${f} update ${(t1 - t0).toFixed(0)} render ${(t2 - t1).toFixed(0)} n${G.enemies.length}`);
        if (f >= 10) times.push(ms);
        if (G.wave && !G.wave.active && G.enemies.length < 20) for (const id of ids) { const a = Math.random() * 6.28; G.enemies.push(makeEnemy(ENEMIES[id], p.x + Math.cos(a) * 300, p.y + Math.sin(a) * 300)); } // (keep the crowd if the wave ends)
        if (G.state === 'play' && waveReady()) waveBegin();
        UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        G.player.hp = G.P.maxHp;
      } else step();
      if (f % 30 === 0) await new Promise(r => setTimeout(r, 0));
    }
    const w = times.sort((a, b) => a - b);
    if (w.length < 100) return { err: 'only ' + w.length + ' play frames timed', state: G.state, box: UI.lootReq && UI.lootReq.kind, opts: (UI.lootOpts || []).map(o => o.tag), q: G.lootQueue.map(q => q.kind), scr: UI.cur };
    return { wave: G.wave.n, enemies: G.enemies.length, frames: w.length, max: +w[w.length - 1].toFixed(1), p90: +w[Math.floor(w.length * 0.9)].toFixed(1), p95: +w[Math.floor(w.length * 0.95)].toFixed(1), over33: w.filter(x => x > 33).length, med: +w[w.length >> 1].toFixed(1) };
  });
  console.log(JSON.stringify(r));
  const bad = r.err || r.p90 > 33 || r.med > 16;
  console.log(bad ? 'FAIL frame time' : 'ok', 'ERRORS', JSON.stringify(errors)); await b.close(); process.exit(bad || errors.length ? 1 : 0);
})();
