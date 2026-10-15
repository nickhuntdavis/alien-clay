// Pass 4 reactions: overloads (a type six times), triples, terrain, particular enemies, and your own puddles (chem.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 5e5; G.player.x = 700; G.player.y = 300; G.weapons = G.weapons.map(() => null);
    const fresh = (def) => { G.enemies.length = 0; G.zones.length = 0; for (let i = 0; i < 6; i++) { const e = makeEnemy(def || ENEMIES.brute, 900 + i * 30, 300 + (i % 2) * 30); e.hp = e.maxHp = 3000; G.enemies.push(e); } gridBuild(); G.stats.reactBy = {}; return G.enemies[0]; };
    const hit = (e, el, n) => { for (let i = 0; i < n; i++) { e.reactCd = 0; damageEnemy(e, 20, { elem: el, wname: 'T' }); } };
    const got = () => Object.keys(G.stats.reactBy).join(',');
    const out = {};
    for (const el of ['fire', 'ice', 'shock', 'oxi', 'salt', 'arcane', 'soul']) { const e = fresh(); hit(e, el, 6); out['ov_' + el] = got(); }
    for (const [id, ks] of TRIPLES) { const e = fresh(); for (const k of ks) hit(e, k, 1); out['tri_' + id] = got(); }
    for (const [def, el, id] of [['grease', 'shock', 'fireball'], ['leech', 'arcane', 'gorged'], ['puffball', 'poison', 'sporesneeze'], ['shell', 'fire', 'shellshock'], ['callus', 'salt', 'softened'], ['platelet', 'arcane', 'thinned'], ['pube', 'ice', 'gluedown'], ['bogey', 'salt', 'washedoff']]) { const e = fresh(ENEMIES[def]); hit(e, el, 1); out['foe_' + id] = G.stats.reactBy[id] ? 'ok' : got(); }
    // Terrain: an acid pit and a current under the target.
    const terr = (type) => { const d = OBSTACLES[type]; const ob = { type, x: 900, y: 300, r: 90, a: 0, seed: 0.3, charge: 0, flash: 0, burstT: 0, def: d }; G.terrain.list.length = 0; G.terrain.grid.clear(); G.terrain.list.push(ob); for (let cx = -2; cx <= 2; cx++) for (let cy = -2; cy <= 2; cy++) { const k = tKey(Math.floor(900 / TCELL) + cx, Math.floor(300 / TCELL) + cy); if (!G.terrain.grid.get(k)) G.terrain.grid.set(k, []); G.terrain.grid.get(k).push(ob); } return ob; };
    let ob = terr('current'), e = fresh(); hit(e, 'shock', 1); out.livewire = !!G.stats.reactBy.livewire; e = fresh(); ob.rxT = 0; hit(e, 'poison', 1); out.downstream = !!G.stats.reactBy.downstream;
    ob = terr('acid'); e = fresh(); hit(e, 'oxi', 1); out.flareup = ob.flareT > G.t; e = fresh(); ob.rxT = 0; hit(e, 'salt', 1); out.diluted = ob.dilT > G.t;
    // Puddles: stand in each.
    G.terrain.list.length = 0; G.terrain.grid.clear(); e = fresh(); const p = G.player;
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
