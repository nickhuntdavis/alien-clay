const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const out = {}, uniq = new Set(); let shared = 0;
    for (const R of RIVALS) { for (const id of RIVAL_RELICS[R.id]) { if (uniq.has(id)) shared++; uniq.add(id); } }
    out.uniqueRelics = uniq.size + ' (shared ' + shared + ')';
    out.missing = RIVALS.filter(R => !RIVAL_RELICS[R.id] || RIVAL_RELICS[R.id].some(id => !RELICS[id])).map(R => R.id).join(',') || 'none';
    for (const R of RIVALS.slice(5)) for (const id of RIVAL_RELICS[R.id]) {
      UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.chrono.charges = 0;
      const o = optRivalRelic(id, R.id); o.apply(); G.state = 'play'; G.lootQueue = [];
      for (let i = 0; i < 25; i++) G.enemies.push(makeEnemy(ENEMIES.brute, G.player.x + Math.cos(i) * 200, G.player.y + Math.sin(i) * 200, { elite: i < 3 })); gridBuild();
      let saved = '';
      for (let f = 0; f < 300; f++) { G.lootQueue = []; G.manual = { x: Math.cos(f / 40), y: Math.sin(f / 40) }; update(1 / 60); G.state = 'play'; if (f === 150) { G.player.iframes = 0; G.player.hp = 5; hurtPlayer(9999, 'test', G.enemies[5], 'contact'); saved = G.state + ':' + Math.round(G.player.hp); } }
      out[id] = saved + ' kills' + G.kills + (G.boys ? ' boys' + G.boys.length : '');
    }
    return out;
  });
  console.log(JSON.stringify(r, null, 0)); console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
