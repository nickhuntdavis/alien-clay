const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 1e6; G.player.x = 700; G.player.y = 300;
    const out = {};
    // falloff curve for a slow, a medium and a fast shot
    for (const sp of [300, 500, 800]) out['mul_speed' + sp] = [200, 380, 500, 700, 900].map(d => (aimMul({ w: { isSpell: false }, speed: sp }, { x: 700 + d, y: 300, r: 10 })).toFixed(2)).join(' ');
    out.homing900 = aimMul({ w: {}, speed: 300, homing: 4 }, { x: 1600, y: 300, r: 10 }).toFixed(2);
    // slingshot: a hole at (1000,300); fire shots past it
    G.weapons = [makeSlot('blaster', false, 5), null, null]; recomputeAll(); G.weapons[0].cd = 99;
    G.zones.push({ x: 1000, y: 300, r: 120, life: 99, max: 99, dps: 1, elem: 'arcane', pull: 200, color: '#9d4edd', tick: 0, src: { wname: 'test' } });
    let slung = 0, fell = 0; const w = G.weapons[0];
    for (const [sp, off] of [[640, 60], [640, 90], [640, 120], [300, 30], [300, 60], [640, 40]]) {
      const pr = spawnProj(w, 700, 300 + off, 0, weaponSrc(w), { speed: sp, vx: sp, vy: 0, life: 3 }); const id = pr;
      for (let f = 0; f < 150; f++) { G.weapons[0].cd = 99; G.lootQueue = []; update(1 / 60); G.state = 'play'; if (pr.slung) break; if (pr.dead) break; }
      if (pr.slung) slung++; else if (pr.dead && Math.hypot(pr.x - 1000, pr.y - 300) < 40) fell++;
    }
    out.slingshots = slung + ' of 6 slung, ' + fell + ' fell in';
    return out;
  });
  console.log(JSON.stringify(r, null, 1)); console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
