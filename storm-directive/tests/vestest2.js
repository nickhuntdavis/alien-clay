const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const opened = []; let lullSpawn = 0, heldInWave = 0;
    const step = () => {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) { const q = G.lootQueue.shift(); opened.push(q.kind + (G.wave.active ? '!ACTIVE' : '')); UI.openLoot(q); } else update(1/30); }
      else if (G.state === 'intro') updateIntro(1/30); else if (G.state === 'bossIntro') endBossIntro();
      else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); }
    };
    waveBegin(); G.nextVesicle = 5;
    // wave 1: don't touch the vesicle; it should burst at wave clear
    for (let f = 0; f < 30 * 200 && G.wave.active; f++) { step(); if (G.wave.active && G.lootQueue.some(q => q.kind === 'vesicle')) heldInWave = 1; }
    const vesAtClear = G.vesicles.length;
    // lull: 150s without starting the next wave
    G.nextVesicle = G.t;
    for (let f = 0; f < 30 * 150; f++) { step(); if (G.vesicles.length && !lullSpawn) lullSpawn = `t=${G.t.toFixed(1)} active=${G.wave.active} n=${G.wave.n} born=${G.vesicles[0].born.toFixed(1)}`; }
    return { opened: opened.join(','), vesAtClear, lullSpawn, heldInWave, gotMut: opened.includes('vesicle') };
  });
  console.log(r, errors.slice(0,3)); await b.close();
})();
