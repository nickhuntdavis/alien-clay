const { chromium } = require('playwright');
// Phlegm Hocker and Hayfever Cell (foes3.js): globs make you Snotty, GARGLED gives rinse puddles, the sneeze hands back statuses, ANTIHISTAMINE.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = {}, bad = [];
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0;
    const p = G.player, P = G.P; P.dodge = 0; P.maxHp = 1e5; p.hp = 1e5; p.x = 700; p.y = 300;
    const run = (n, keep) => { for (let f = 0; f < n; f++) { p.hp = 1e5; G.lootQueue = []; if (!keep) p.x = 700, p.y = 300; update(1 / 60); G.state = 'play'; } };
    // Hocker: stand still, take globs.
    const h = makeEnemy(ENEMIES.hocker, 950, 300); h.hp = h.maxHp = 1e6; G.enemies.push(h); h.shootCd = 0;
    G.weapons = [null, null, null]; recomputeAll();
    let got = false; for (let f = 0; f < 600 && !got; f++) { run(1); got = pstHas('snot'); }
    out.hocker = 'snotty ' + got + ' left ' + (G.pst && (G.pst.snot - G.t).toFixed(1)); if (!got) bad.push('hocker');
    damageEnemy(h, 1, { elem: 'salt', wname: 'T' }); out.garg = h.garg; if (h.garg !== 3) bad.push('gargled');
    h.shootCd = 0; const z0 = G.zones.filter(z => z.water).length; run(5); out.puddle = G.zones.filter(z => z.water).length - z0; if (!(out.puddle >= 1)) bad.push('puddle');
    h.dead = true; run(1); G.enemies.length = 0; G.ebul.length = 0; G.pst = null;
    // Hayfever: soak it (wet) and Mucus it (snot), then let it sneeze at you.
    const y = makeEnemy(ENEMIES.hayfever, 820, 300); y.hp = y.maxHp = 1e6; G.enemies.push(y);
    y.chill = 30; y.pickle = 30; y.snzCd = 0; run(90);
    out.sneeze = JSON.stringify(G.pst && { wet: pstHas('wet'), snot: pstHas('snot'), sick: pstHas('sick') }); if (!pstHas('wet')) bad.push('sneeze');
    // Antihistamine: wet it, then Cooties.
    const n = makeEnemy(ENEMIES.crawler, 840, 320); n.hp = n.maxHp = 1e6; G.enemies.push(n); gridBuild();
    y.ahT = 0; damageEnemy(y, 1, { elem: 'salt', wname: 'T' }); damageEnemy(y, 1, { elem: 'poison', wname: 'T' });
    out.anti = (G.stats.reactBy.antihistamine || 0) + ' neighbour sick ' + (n.poison > 0); if (!G.stats.reactBy.antihistamine || !(n.poison > 0)) bad.push('antihistamine');
    out.bad = bad; return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(() => { const p = G.player; G.enemies.length = 0; const a = makeEnemy(ENEMIES.hocker, p.x - 60, p.y - 80), c = makeEnemy(ENEMIES.hayfever, p.x + 60, p.y - 80); a.garg = 2; c.snzW = 0.4; c.snzA = Math.PI / 2; G.enemies.push(a, c); });
  await page.waitForTimeout(150); await page.screenshot({ path: 'f3.png' });
  if (r.bad.length) console.log('FAIL', r.bad.join(','));
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
