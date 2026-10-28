// The 24 weapons (weapons24.js): only they are offered, each fires and deals damage, and the upgrade engine gives
// Lv 3 promises, Lv 6 the promise's cards plus its wildcard, and Lv 10 masteries, with hooks that act.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const n = W24_IDS.length - (typeof V9_IDS !== 'undefined' ? V9_IDS.length : 0) - W24.filter(r => r[4] === 'acro').length; // (the 24 plus Sample 9's three, acro.js, and the v9 weapons, v9arms.js)
    if (n !== 29 || W24_IDS.some(id => !WEAPONS[id])) bad.push('roster ' + n + ' ' + W24_IDS.filter(id => !WEAPONS[id])); // (the 24 plus the Laser, laser.js, and the four Delivery weapons, dlvweap.js; The Runs is on hold)
    if (!W24_HOLD.includes('s_wake') || !W24_BY.v_flame_beam || !S10_BY.ordered.weapons.includes('v_flame_beam') || S10_BY.ordered.weapons.length !== 3) bad.push('Laser in / The Runs out');
    if (v10Pool().length !== W24_IDS.length - W24_HOLD.length || v10Pool().some(id => W24_HOLD.includes(id))) bad.push('pool ' + v10Pool().length); // (minus the weapons on hold)
    const def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0], rows = [];
    for (const id of W24_IDS) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {};
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 70 + (i % 3) * 60; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      try { for (let f = 0; f < 360; f++) { if (id === 's_wake' || id === 's_twin' || id === 's_mines') { p.vx = 120 * Math.cos(f / 20); p.vy = 120 * Math.sin(f / 20); p.x += p.vx / 60; p.y += p.vy / 60; } update(1 / 60); } } catch (err) { bad.push(id + ': ' + err.message); }
      const dealt = Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
      rows.push(WEAPONS[id].name + ' ' + Math.round(dealt));
      if (!(dealt > 0) && !['s_siphon', 's_toothfairy', 's_peekaboo', 's_parasite'].includes(id)) bad.push(id + ' dealt nothing');
    }
    out.rows = rows.join(' | ');
    // Slot draft offers only the 24
    UI.sample = 's001'; newGame(); G.state = 'play'; G.weapons = [makeSlot('v_phys_proj', false, 1), null, null, null]; recomputeAll();
    for (let i = 0; i < 20; i++) for (const o of genLoot({ kind: 'slot' })) if (!o.def || !o.def.w24) bad.push('slot offered ' + (o.def && o.def.name));
    // The upgrade engine with a dummy spec
    let hits = 0, fired = 0, stat = 0;
    const c = (name, fn) => ({ name, desc: name, apply: fn });
    wupReg('v_phys_proj', { A: { name: 'Pa', lv3: { desc: 'a3', apply: w => wupOn(w, 'hit', () => hits++) }, lv6: [c('A6a', w => wupOn(w, 'stats', (w, s) => { s.dmg *= 2; stat++; })), c('A6b', () => {})], wild: c('Awild', () => {}) },
      B: { name: 'Pb', lv3: { desc: 'b3', apply: () => {} }, lv6: [c('B6a', () => {}), c('B6b', () => {})], wild: c('Bwild', () => {}) },
      C: { name: 'Pc', lv3: { desc: 'c3', apply: () => {} }, lv6: [c('C6a', () => {}), c('C6b', () => {})], wild: c('Cwild', () => {}) },
      lv10: [c('M1', w => wupOn(w, 'fire', () => { fired++; return false; })), c('M2', () => {}), c('M3', () => {})] });
    const w = G.weapons[0];
    const f3 = genLoot({ kind: 'fork', w, lv: 3 }); out.f3 = f3.map(o => o.title);
    if (f3.length !== 3) bad.push('Lv 3 cards ' + f3.length); else f3[0].apply();
    const f6 = genLoot({ kind: 'fork', w, lv: 6 }); out.f6 = f6.map(o => o.title + ':' + o.tag);
    if (f6.map(o => o.title).join() !== 'A6a,A6b,Awild') bad.push('Lv 6 cards ' + out.f6); else f6[0].apply();
    const f10 = genLoot({ kind: 'fork', w, lv: 10 }); if (f10.length !== 3) bad.push('Lv 10 cards'); else f10[0].apply();
    if (!stat) bad.push('stats hook did not run');
    const e = makeEnemy(def, G.player.x + 80, G.player.y); e.hp = e.maxHp = 1e5; G.enemies.push(e);
    damageEnemy(e, 5, { elem: 'phys', w, atk: 'proj', noCrit: true, wname: 't' });
    if (!hits) bad.push('hit hook did not run');
    G.terrain.list.length = 0; for (let i = 0; i < 120; i++) update(1 / 60);
    if (!fired) bad.push('fire hook did not run');
    if (w.up.p !== 'A' || w.up.l6 !== 'A6a' || w.up.l10 !== 'M1') bad.push('choices ' + JSON.stringify(w.up));
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
