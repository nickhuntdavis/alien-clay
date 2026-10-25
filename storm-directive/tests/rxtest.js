// Your own puddles (chem.js chemPlayerZones). The v9 overloads, triples, terrain and per-enemy reactions were deleted (E1).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 5e5; G.player.x = 700; G.player.y = 300; G.weapons = G.weapons.map(() => null);
    const fresh = (def) => { G.enemies.length = 0; G.zones.length = 0; for (let i = 0; i < 6; i++) { const e = makeEnemy(def || ENEMIES.brute, 900 + i * 30, 300 + (i % 2) * 30); e.hp = e.maxHp = 3000; G.enemies.push(e); } gridBuild(); G.stats.reactBy = {}; return G.enemies[0]; };
    const out = {}, e = fresh();
    G.terrain.list.length = 0; G.terrain.grid.clear();
    const p = G.player;
    // Puddles: stand in each.
    const stand = (z) => { G.zones.length = 0; G.zones.push(Object.assign({ x: p.x, y: p.y, r: 40, life: 3, max: 3, dps: 0, pull: 0, tick: 0, src: { noStatus: true }, quiet: true }, z)); G.state = 'play'; update(1 / 60); };
    stand({ oil: true }); out.lube = G.lubeOn && chemPlayerSpeed() > 1;
    G.acidOn = G.t + 3; stand({ water: true }); out.rinse = !(G.acidOn > G.t);
    G.snotShield = false; G.snotCd = 0; stand({ snot: true }); out.shield = G.snotShield && chemDamageIn(50, null) === 0;
    return out;
  });
  console.log(JSON.stringify(r, null, 0));
  const bad = Object.entries(r).filter(([k, v]) => v === false || (typeof v === 'string' && !(k.startsWith('ov_') ? v.includes({ fire: 'meltdown', ice: 'booger', shock: 'overload', oxi: 'slipnslide', salt: 'waterlogged', arcane: 'hemorrhage', soul: 'possession' }[k.slice(3)]) : k.startsWith('tri_') ? v.includes(k.slice(4)) : v === 'ok'))).map(([k]) => k);
  console.log('ERRORS', JSON.stringify(errors), bad.length ? 'FAIL ' + bad.join(',') : 'ok');
  await b.close();
})();
