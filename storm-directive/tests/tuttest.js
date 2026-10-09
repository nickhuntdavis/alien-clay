const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(400);
  const r1 = await page.evaluate(() => {
    SET.auto = false; SET.autoWaves = true; SET.intros = 'auto'; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const log = [`n0=${G.wave.n}`]; let cards = [];
    const step = () => {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot() && !G.tutNow) { if (!tutBeforeLoot(G.lootQueue[0])) { UI.openLoot(G.lootQueue.shift()); } } else update(1/30); }
      else if (G.state === 'intro') updateIntro(1/30);
      else if (G.state === 'bossIntro') { const I = G.bossIntro; if (I.tut) cards.push(`${I.tut}@${G.t.toFixed(0)}w${G.wave.n}${G.wave.active ? 'a' : ''}`); endBossIntro(); }
      else if (G.state === 'loot') { try { UI.pickLoot(0); } catch (e) {} if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); } }
      if (G.state === 'play' && waveReady()) waveBegin();
    };
    for (let f = 0; f < 30 && G.lootQueue.length; f++) step();
    waveBegin(); log.push(`weapons=${G.weapons.filter(Boolean).map(w => w.id)} begin n=${G.wave.n} phase=${G.wave.phase} boss=${G.wave.boss} budget=${G.wave.budget}`);
    let sprinted = false;
    for (let f = 0; f < 30 * 400 && G.state !== 'over'; f++) {
      step();
      if (G.player.hp < G.P.maxHp * 0.5) G.player.hp = G.P.maxHp;
      if (G.vesicles.length && G.wave.n === 0) { G.player.x = G.vesicles[0].x; G.player.y = G.vesicles[0].y; }
      if (G.t > 12 && G.t < 13 && G.state === 'play') G.manual = { x: 1, y: 0, sprint: true }; else if (G.t >= 13 && !sprinted && G.manual) { G.manual = null; sprinted = true; }
      if (G.wave.n === 0 && !G.wave.active && !log.some(l => l.startsWith('clear'))) log.push(`clear tutWave=${META.tutWave} t=${G.t.toFixed(0)}`);
      if (G.wave.n === 1 && G.wave.active && !log.some(l => l.startsWith('w1'))) log.push(`w1 fresh=${G.wave.fresh}`);
    }
    return log.concat(['cards ' + cards.join(' '), `end t=${G.t.toFixed(0)} n=${G.wave.n} q=${JSON.stringify(G.tutQ)} next=${(G.tutNext||0).toFixed(0)} st=${G.state} seen=${Object.keys(META.seenTut||{})}`]).join('\n');
  });
  console.log(r1);
  // gaps between non-urgent cards
  // skip: reset tutorial, new run, tap skip on the welcome
  const r2 = await page.evaluate(() => {
    resetTutorial(); UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    waveBegin(); for (let f = 0; f < 60 && G.state === 'play'; f++) update(1/30);
    return `n=${G.wave.n} state=${G.state} tut=${G.bossIntro && G.bossIntro.tut} off=${document.getElementById('biOff').textContent}`;
  });
  console.log(r2);
  await page.waitForTimeout(1500); await page.screenshot({ path: 'tutcard.png' });
  await page.click('#biOff'); await page.waitForTimeout(200);
  const r3 = await page.evaluate(() => { for (let f = 0; f < 120; f++) if (G.state === 'play') update(1/30); return `after skip: n=${G.wave.n} active=${G.wave.active} intros=${SET.intros} tutWave=${META.tutWave} q=${G.lootQueue.length} btn=${document.getElementById('waveBtn').textContent}`; });
  console.log(r3);
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
