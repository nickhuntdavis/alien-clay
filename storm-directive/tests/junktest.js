// Lateral Gene Transfer as junk DNA (junk.js): carriers turn up only while a wave is on, killing one absorbs
// its power, and every power runs without errors.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const step = () => {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
      else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'bossIntro') endBossIntro();
      else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); }
      if (G.player.hp < G.P.maxHp * 0.5) G.player.hp = G.P.maxHp;
    };
    waveBegin(); G.nextJunk = G.t + 3;
    let carrier = null, absorbed = null, lull = 0;
    for (let f = 0; f < 30 * 120 && G.wave.active; f++) {
      step();
      if (G.junkE && !carrier) { carrier = junkId(G.junkE); const e = G.junkE; e.hp = 1; damageEnemy(e, 999, { elem: 'phys', wname: 'test' }); absorbed = Object.keys(G.junk).join(','); }
    }
    // Between waves: none turn up.
    G.nextJunk = G.t;
    for (let f = 0; f < 30 * 20; f++) { if (G.wave.active) break; step(); if (G.junkE) lull++; }
    // Every power, three stacks each, then a minute of play.
    const P0 = { armour: G.P.armour, speed: G.P.speed };
    for (const id in JUNK_POWERS) for (let i = 0; i < 4; i++) { const e = makeEnemy(ENEMIES[id] || ENEMIES.crawler, me().x + 100, me().y); G.enemies.push(e); e.junk = G.t; G.junkE = e; junkAbsorb(e); e.dead = true; }
    const capped = Object.values(G.junk).every(k => k === JUNK.stacks);
    if (!G.wave.active) waveBegin();
    for (let f = 0; f < 30 * 60; f++) { step(); if (!G.wave.active && waveReady()) waveBegin(); }
    const txt = Object.keys(JUNK_POWERS).map(id => JUNK_POWERS[id].fmt(3)).filter(s => /undefined|NaN/.test(s));
    return { carrier, absorbed, lull, n: Object.keys(JUNK_POWERS).length, capped, armour: G.P.armour - P0.armour, badText: txt, hp: Math.round(G.player.hp), html: junkHtml().length > 200 };
  });
  console.log(JSON.stringify(r));
  const bad = [];
  if (!r.carrier || !r.absorbed) bad.push('no carrier/absorb'); if (r.lull) bad.push('carrier between waves'); if (!r.capped) bad.push('stacks'); if (r.badText.length) bad.push('text'); if (!r.html) bad.push('html');
  if (bad.length) console.log('FAIL', bad.join(','));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
