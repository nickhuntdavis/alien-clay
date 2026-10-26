// Pass 3 type mechanics: Oil slicks, Water splash, Blood clot and pools, Parasite ghosts and pass-through, Mucus stuck shots (chem.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html') + ''); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 5e5; G.player.x = 700; G.player.y = 300;
    const fresh = () => { G.enemies.length = 0; G.zones.length = 0; for (let i = 0; i < 6; i++) { const e = makeEnemy(ENEMIES.brute, 900 + i * 30, 300 + (i % 2) * 30); e.hp = e.maxHp = 300; G.enemies.push(e); } gridBuild(); return G.enemies[0]; };
    const run = n => { for (let f = 0; f < n; f++) { update(1 / 60); G.state = 'play'; G.lootQueue = []; } };
    const out = {};
    let e = fresh(); damageEnemy(e, 10, { elem: 'oxi', wname: 'T' }); out.slick = G.zones.filter(z => z.oil).length;
    e = fresh(); damageEnemy(e, 10, { elem: 'fire', wname: 'T' }); damageEnemy(e, 10, { elem: 'salt', wname: 'T' }); out.splash = G.enemies.filter(o => o !== e && o.burn > 0).length;
    e = fresh(); for (let i = 0; i < 5; i++) { e.reactCd = 0; damageEnemy(e, 10, { elem: 'arcane', wname: 'T' }); } out.clot = e.clotT > G.t;
    e = fresh(); e.curse = 3; damageEnemy(e, 1e4, { wname: 'T' }); out.ghost = G.enemies.filter(o => o.ghost).length;
    e = fresh(); e.chill = 2; for (let i = 0; i < 4; i++) damageEnemy(e, 50, { wname: 'T' }); out.snot = Math.round(e.snot); const hp0 = G.enemies[1].hp; damageEnemy(e, 1e4, { wname: 'T' }); out.snotPop = Math.round(hp0 - G.enemies[1].hp);
    e = fresh(); let pools = 0; for (let k = 0; k < 20; k++) { const x = makeEnemy(ENEMIES.brute, 600, 300); x.bloodT = 3; G.enemies.push(x); damageEnemy(x, 1e5, { wname: 'T' }); } out.pools = G.zones.filter(z => z.heal).length; G.player.x = 600; const h0 = G.player.hp; run(30); out.healed = Math.round(G.player.hp - h0);
    out.soulPass = soulShot({ src: { elem: 'soul' } });
    return out;
  });
  console.log(JSON.stringify(r));
  const ok = r.slick >= 1 && r.splash >= 2 && r.clot && r.ghost === 1 && r.snot > 0 && r.snotPop > 0 && r.pools >= 1 && r.healed > 0 && r.healed < 20000 && r.soulPass;
  console.log('ERRORS', JSON.stringify(errors), ok ? 'ok' : 'FAIL');
  await b.close();
})();
