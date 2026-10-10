// Rewind relinks globals that pointed at replaced enemy objects (junk carrier, Queen's Court guards).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    const step = () => {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
      else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'bossIntro') endBossIntro();
      else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); }
      if (G.player.hp < G.P.maxHp * 0.5) G.player.hp = G.P.maxHp;
    };
    const rewind = () => {
      G.chrono.charges = 2;
      const ok = startRewind(false);
      for (let f = 0; f < 30 * 20 && G.state === 'rewind'; f++) updateRewind(1 / 30);
      return ok;
    };
    const out = {};
    UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    waveBegin(); G.nextJunk = G.t + 1;
    for (let f = 0; f < 30 * 120 && !G.junkE; f++) step();
    out.hadJunk = !!G.junkE;
    for (let f = 0; f < 30 * 6; f++) step();
    out.rw1 = rewind();
    out.junkOk = G.junkE === null || G.enemies.includes(G.junkE);
    UI.sample = 's001'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    G.relics.court = 1;
    for (let f = 0; f < 30 * 10; f++) step();
    out.rw2 = rewind();
    for (let f = 0; f < 30 * 60; f++) step();
    out.courtN = (G.court || []).length;
    out.courtOk = (G.court || []).every(g => G.enemies.includes(g));
    return out;
  });
  console.log(JSON.stringify(r));
  const bad = [];
  if (!r.hadJunk) bad.push('no junk carrier'); if (!r.rw1 || !r.rw2) bad.push('rewind did not start');
  if (!r.junkOk) bad.push('junkE is a ghost'); if (!r.courtN || !r.courtOk) bad.push('court ghosts');
  if (bad.length) console.log('FAIL', bad.join(','));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
