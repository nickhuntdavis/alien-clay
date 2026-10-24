// V11 power curve (power11.js): no early one-shots on germs, damage falls off with range, small gains per level,
// tougher early germs; bosses keep their own tuning. Only your weapons' and Feats' hits (src.w) are touched.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; genLoot({ kind: 'start' })[0].apply();
    const mk = (dx) => { const e = makeEnemy(ENEMIES.crawler, G.player.x + dx, G.player.y); G.enemies.push(e); fightCd(e); return e; };
    // Early: a huge hit takes at most half (crit included).
    const e1 = mk(100); out.hp = Math.round(e1.maxHp);
    damageEnemy(e1, 1e6, { elem: 'phys', atk: 'proj', wname: 't', noCrit: true, w: G.weapons.find(Boolean) });
    if (e1.dead || e1.hp < e1.maxHp * 0.45) bad.push('early one-shot ' + e1.hp + '/' + e1.maxHp);
    // A hazard (no weapon) is not limited.
    const hz = mk(100); damageEnemy(hz, 1e6, { elem: 'phys', wname: 'Hot Flush', noCrit: true }); if (!(hz.dead || hz.hp <= 0)) bad.push('hazard hit limited');
    // Range: the same hit far away does less.
    const near = mk(100), far = mk(650); const d = near.maxHp * 0.2;
    damageEnemy(near, d, { elem: 'phys', atk: 'proj', wname: 't', noCrit: true, w: G.weapons.find(Boolean) }); damageEnemy(far, d, { elem: 'phys', atk: 'proj', wname: 't', noCrit: true, w: G.weapons.find(Boolean) });
    out.near = +(near.maxHp - near.hp).toFixed(2); out.far = +(far.maxHp - far.hp).toFixed(2);
    if (!(out.far < out.near * 0.7)) bad.push('no range falloff ' + out.near + '/' + out.far);
    // Tougher early germs, normal later.
    const h0 = makeEnemy(ENEMIES.crawler, 0, 0).maxHp, k0 = P11.foeHp; P11.foeHp = 1; const h1 = makeEnemy(ENEMIES.crawler, 0, 0).maxHp; P11.foeHp = k0; G.t = 2000;
    out.hpK = +(h0 / h1).toFixed(2);
    if (!(out.hpK > 1.5)) bad.push('early germs not tougher ' + out.hpK);
    // Later: the limit has lifted.
    const e2 = mk(100); damageEnemy(e2, e2.maxHp * 10, /* (late germs scale past 1e6 health: enemyScale) */ { elem: 'phys', atk: 'proj', wname: 't', noCrit: true, w: G.weapons.find(Boolean) });
    if (!(e2.dead || e2.hp <= 0)) bad.push('limit not lifted at ' + Math.round(PT()) + 's');
    // Levels: attack rate and health grow a little.
    const hs = G.P.haste, mh = G.P.maxHp; G.p11L = G.level; G.level += 3; levelJuice(G.level);
    if (!(G.P.haste > hs && G.P.maxHp > mh)) bad.push('no per-level gain');
    out.lv = [+(G.P.haste - hs).toFixed(3), G.P.maxHp - mh];
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
