const { chromium } = require('playwright');
// Player statuses (pstatus.js): typed enemy bullets give you Snotty, Sick and Soaking wet; Static hurts more when wet; puddles rinse.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = {}, bad = [];
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0;
    const p = G.player, P = G.P; P.dodge = 0; P.armour = 0; P.maxHp = 1000; p.hp = 1000; p.x = 700; p.y = 300;
    const shoot = id => { const e = makeEnemy(ENEMIES[id], p.x + 200, p.y); G.enemies.push(e); shooterEnt = e; shooterName = e.name; G.bulSeq = 0; G.ebul.length = 0; eBullet(p.x + 3, p.y, 0, 1, 10, 5); shooterEnt = null; const bu = G.ebul[0]; p.iframes = 0; G.state = 'play'; G.hitFrom = bu; const h = p.hp; hurtPlayer(bu.dmg, bu.from, bu.owner, 'bullets'); return { pel: bu.pel, d: h - p.hp }; };
    const t1 = shoot('spitter'); out.snot = t1.pel + ' ' + pstHas('snot') + ' speed ' + pstSpeed(); if (!pstHas('snot') || t1.pel !== 'ice') bad.push('snot');
    const t2 = shoot('warlock'); const h0 = p.hp; for (let i = 0; i < 60; i++) pstTick(1 / 60); out.sick = t2.pel + ' ' + pstHas('sick') + ' tick ' + (h0 - p.hp).toFixed(1) + ' heal ' + pstHeal(); if (!(h0 - p.hp > 5) || pstHeal() !== 0.5) bad.push('sick');
    const dry = shoot('lancer').d;
    shoot('diatom'); out.wet = pstHas('wet') + ' snot washed ' + !pstHas('snot'); if (!pstHas('wet') || pstHas('snot')) bad.push('wet');
    const wet = shoot('lancer').d; out.zap = 'dry ' + dry.toFixed(1) + ' wet ' + wet.toFixed(1); if (!(wet > dry * 1.4)) bad.push('zap');
    const chips = []; pstChips(chips); out.chips = chips.map(c => c[0]).join(' | '); if (chips.length !== 2) bad.push('chips');
    const plain = shoot('sperminator'); const bulw = makeEnemy(ENEMIES.crawler, 0, 0); out.untyped = String(pstElem(bulw));
    G.zones.push({ x: p.x, y: p.y, r: 40, life: 2, max: 2, dps: 0, elem: 'salt', water: true, quiet: true, src: {} }); chemPlayerZones(); out.rinse = !pstHas('sick'); if (pstHas('sick')) bad.push('rinse');
    for (let f = 0; f < 120; f++) { update(1 / 60); G.state = 'play'; }
    out.bad = bad;
    return out;
  });
  console.log(JSON.stringify(r, null, 1));
  await page.evaluate(() => { const p = G.player; for (const [id, k] of [['spitter', 0], ['warlock', 1], ['diatom', 2], ['lancer', 3]]) { const e = makeEnemy(ENEMIES[id], p.x - 60 + k * 40, p.y - 50); shooterEnt = e; G.bulSeq = 0; eBullet(e.x, e.y, Math.PI / 2, 0.01, 1, 6); } shooterEnt = null; G.pst = { snot: G.t + 3, sick: G.t + 4, wet: 0 }; });
  await page.waitForTimeout(400); await page.screenshot({ path: 'pst.png' });
  if (r.bad.length) console.log('FAIL', r.bad.join(','));
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
