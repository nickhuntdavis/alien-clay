const { chromium } = require('playwright');
// Player statuses (pstatus.js): only Snotty is left (E1 deleted Sick, Soaking wet and Lubricated). Mucus and Static shooters mark their bullets; the rest are untyped.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 420, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const out = {}, bad = [];
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0;
    const p = G.player, P = G.P; P.dodge = 0; P.armour = 0; P.maxHp = 1000; p.hp = 1000; p.x = 700; p.y = 300;
    const shoot = id => { const e = makeEnemy(ENEMIES[id], p.x + 200, p.y); G.enemies.push(e); shooterEnt = e; shooterName = e.name; G.bulSeq = 0; G.ebul.length = 0; eBullet(p.x + 3, p.y, 0, 1, 10, 5); shooterEnt = null; const bu = G.ebul[0]; p.iframes = 0; G.state = 'play'; G.hitFrom = bu; const h = p.hp; hurtPlayer(bu.dmg, bu.from, bu.owner, 'bullets'); return { pel: bu.pel, d: h - p.hp }; };
    const t1 = shoot('spitter'); pstGive('snot', 2); out.snot = t1.pel + ' ' + pstHas('snot') + ' speed ' + pstSpeed(); if (!pstHas('snot') || t1.pel !== 'ice' || pstSpeed() >= 1) bad.push('snot'); // (a hit gives no status now: pdef.js; the Hocker, Snot Bubble and sneeze call pstGive)
    // Typed bullets that no longer carry a status: the mark stays on Static shooters only.
    out.marks = ['lancer', 'sperminator', 'warlock', 'diatom', 'grease'].map(id => id + ':' + shoot(id).pel).join(' ');
    if (shoot('lancer').pel !== 'shock') bad.push('lancerMark');
    for (const id of ['warlock', 'diatom', 'grease']) if (shoot(id).pel) bad.push(id + 'Mark');
    if (pstHas('sick') || pstHas('wet') || pstHas('lube')) bad.push('retiredStatus');
    const chips = []; pstChips(chips); out.chips = chips.map(c => c[0]).join(' | '); if (chips.length !== 1) bad.push('chips');
    const bulw = makeEnemy(ENEMIES.crawler, 0, 0); out.untyped = String(pstElem(bulw));
    pstClear(); if (pstHas('snot')) bad.push('clear');
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
