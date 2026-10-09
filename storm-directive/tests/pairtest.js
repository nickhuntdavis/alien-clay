const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const out = {};
    const run = (a, b, combo) => {
      UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 1e6; G.player.x = 700; G.player.y = 300;
      G.weapons = [makeSlot(a, false, 6), makeSlot(b, false, 6), null]; recomputeAll(); updatePairings(); G.combo = G.combo || {}; if (combo) G.combo[combo] = true;
      G.enemies.length = 0; for (let i = 0; i < 40; i++) { const an = i * 0.5, d = 100 + (i % 5) * 50; const e = makeEnemy(ENEMIES.brute, 700 + Math.cos(an) * d, 300 + Math.sin(an) * d); e.hp = e.maxHp = 2500; G.enemies.push(e); } gridBuild(); G.stats.dmg = {};
      const g = owned('ghosts'); const s0 = g ? 0 : null;
      for (let f = 0; f < 480; f++) { G.lootQueue = []; G.player.hp = 1e6; update(1 / 60); G.state = 'play'; if (f % 120 === 0) { for (const e of G.enemies) if (!e.dead) e.due = e.due || null; } }
      return Object.keys(G.pair).join(',') + ' | ' + Object.entries(G.stats.dmg).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([k, v]) => k + ':' + Math.round(v)).join(' ') + (g ? ' | souls ' + (g.souls || 0) : '');
    };
    for (const q of PAIRINGS.slice(-14)) out['P ' + q.id] = run(q.a, q.b);
    for (const c of COMBOS.slice(-5)) out['C ' + c.id] = run(c.a, c.b, c.id);
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
