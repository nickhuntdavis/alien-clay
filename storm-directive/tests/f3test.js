const { chromium } = require('playwright');
// Phlegm Hocker and Hayfever Cell (foes3.js): globs make you Snotty, the glob leaves a Mucus patch, the sneeze hands back statuses, ANTIHISTAMINE.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = {}, bad = [];
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; if (G.terrain) G.terrain.grid.clear(); // (no nodules between it and you)
    const p = G.player, P = G.P; P.dodge = 0; P.maxHp = 1e5; p.hp = 1e5; p.x = 700; p.y = 300;
    const run = (n, keep) => { for (let f = 0; f < n; f++) { p.hp = 1e5; G.lootQueue = []; if (!keep) p.x = 700, p.y = 300; update(1 / 60); G.state = 'play'; } };
    // Hocker: stand still, take globs.
    const h = makeEnemy(ENEMIES.hocker, 950, 300); h.hp = h.maxHp = 1e6; G.enemies.push(h); h.shootCd = 0;
    G.weapons = [null, null, null]; recomputeAll();
    let got = false; for (let f = 0; f < 600 && !got; f++) { run(1); got = pstHas('snot'); }
    out.hocker = 'snotty ' + got + ' left ' + (G.pst && (G.pst.snot - G.t).toFixed(1)); if (!got) bad.push('hocker');
    // The glob leaves a Mucus patch (40 wide) where it landed, and Water does nothing special to it any more.
    damageEnemy(h, 1, { elem: 'salt', wname: 'T' }); out.garg = h.garg; if (h.garg) bad.push('gargle still there');
    G.zones.length = 0; h.shootCd = 0; run(120); out.patch = G.zones.filter(z => z.f3patch && z.elem === 'ice').length; if (!(out.patch >= 1)) bad.push('patch');
    out.patchR = G.zones.filter(z => z.f3patch).map(z => z.r)[0]; if (out.patchR !== 40) bad.push('patchR');
    h.dead = true; run(1); G.enemies.length = 0; G.ebul.length = 0; G.pst = null;
    // Hayfever: soak it (wet) and Mucus it (snot), then let it sneeze at you.
    const y = makeEnemy(ENEMIES.hayfever, 820, 300); y.hp = y.maxHp = 1e6; G.enemies.push(y);
    y.chill = 30; y.pickle = 30; y.snzCd = 0; run(90);
    out.sneeze = JSON.stringify(G.pst && { snot: pstHas('snot') }); if (!pstHas('snot')) bad.push('sneeze');
    // (the Antihistamine reaction was deleted with Cooties and Water: E1)
    const n = makeEnemy(ENEMIES.crawler, 840, 320); n.hp = n.maxHp = 1e6; G.enemies.push(n); gridBuild();
    // Snot Bubble: hits swell it; an early pop splashes neighbours only; a late pop sticks them and you; Static pops it harmlessly.
    G.enemies.length = 0; G.pst = null; G.zones.length = 0; p.x = 700; p.y = 300;
    const mk = (x, y) => { const e = makeEnemy(ENEMIES.snotbubble, x, y); e.hp = e.maxHp = 1e6; G.enemies.push(e); return e; };
    const nb = makeEnemy(ENEMIES.crawler, 740, 300); nb.hp = nb.maxHp = 1e6; G.enemies.push(nb);
    let sb = mk(720, 300); const r0 = sb.r; gridBuild();
    for (let i = 0; i < 2; i++) { sb.swT = 0; damageEnemy(sb, 1, { elem: 'phys', wname: 'T' }); }
    out.swell = sb.swell + ' r ' + sb.r.toFixed(1) + '/' + r0; if (sb.swell !== 2 || !(sb.r > r0)) bad.push('swell');
    sb.hp = 0; foes3Kill(sb); out.early = 'neighbour snotty ' + (nb.chill > 0) + ' me ' + pstHas('snot') + ' frozen ' + (nb.frozen > 0); if (!(nb.chill > 0) || pstHas('snot') || nb.frozen > 0) bad.push('earlyPop');
    nb.chill = 0; nb.frozen = 0; sb.swell = 5; foes3Kill(sb); out.late = 'neighbour stuck ' + (nb.frozen > 0) + ' me ' + pstHas('snot'); if (!(nb.frozen > 0) || !pstHas('snot')) bad.push('latePop');
    G.pst = null; nb.chill = 0; nb.frozen = 0; nb.chillAmt = 0; sb = mk(720, 300); sb.swell = 5; sb.popped = 1; foes3Kill(sb); out.popped = 'neighbour stuck ' + (nb.frozen > 0) + ' me ' + pstHas('snot'); if (!(nb.frozen > 0) || pstHas('snot')) bad.push('poppedHarmless');
    nb.chill = 0; nb.frozen = 0; sb = mk(720, 300); G.stats.reactBy.popped = 0; damageEnemy(sb, 1, { elem: 'shock', wname: 'T' }); out.rx = 'popped ' + G.stats.reactBy.popped + ' dead ' + !!sb.dead; if (!G.stats.reactBy.popped || !sb.dead) bad.push('popped');
    out.bad = bad; return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(() => { const p = G.player; G.enemies.length = 0; const a = makeEnemy(ENEMIES.hocker, p.x - 60, p.y - 80), c = makeEnemy(ENEMIES.hayfever, p.x + 60, p.y - 80); c.snzW = 0.4; c.snzA = Math.PI / 2; G.enemies.push(a, c); });
  await page.waitForTimeout(150); await page.screenshot({ path: 'f3.png' });
  if (r.bad.length) console.log('FAIL', r.bad.join(','));
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
