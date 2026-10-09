const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { if (typeof splashEnd === 'function') (window.TUT_OFF = 1, splashEnd()); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; const out = {};
    const sets = []; for (let i = 0; i < RIVALS.length; i += 5) sets.push(RIVALS.slice(i, i + 5));
    // Random draws: how varied are they?
    const draws = new Set(); for (let i = 0; i < 20; i++) { G = null; newGame(); draws.add(runRivals().map(R => R.id).sort().join(',')); }
    out.distinctDrawsOf20 = draws.size;
    for (const set of sets) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.rivalSet = set; G.weapons = [makeSlot('blaster', false, 6), makeSlot('tesla', false, 6), null]; recomputeAll();
      G.t = 170; G.nextBoss = 1e9;
      for (let f = 0; f < 60 * 50; f++) { G.player.hp = G.P.maxHp; G.state = 'play'; G.lootQueue = []; update(1 / 60 * GAME_SPEED);
        if (f === 300) for (const e of G.enemies) if (e.rival) { e.x = G.player.x + rand(-250, 250); e.y = G.player.y + rand(-250, 250); e.mode = 'hunt'; e.modeT = 40; } }
      out[set.map(R => R.id).join('+')] = { board: rivalBoard().filter(x => !x.you).map(x => x.name.split(' ')[0] + (x.out ? ':out' : ':' + x.lvl)).join(' '), hurtBy: Object.keys(G.stats.hurt).slice(0, 6).join(', ') };
    }
    return out; });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
