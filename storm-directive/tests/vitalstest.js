// More health, Shell and Membrane cards (vitals.js): they register, gate on Shell/Membrane, and each effect works.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = await page.evaluate(() => {
    const bad = [];
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
    genLoot({ kind: 'start' })[0].apply();
    for (const id in VTC) if (!CARDS.some(c => c.id === id)) bad.push('not registered ' + id);
    const card = id => CARDS.find(c => c.id === id), P = G.P, p = G.player;
    G.pd = null; G.relics = G.relics || {}; delete G.relics.rubber;
    if (!pdHasShield(pdef())) { for (const id of ['vt_pop', 'vt_osmo', 'vt_feed']) if (card(id).eligible(G)) bad.push(id + ' offered without a Membrane'); }
    if (vtShellCap(pdef()) === 0) { for (const id of ['vt_regrow', 'vt_shrap']) if (card(id).eligible(G)) bad.push(id + ' offered without a Shell'); }
    const seen = new Set(); for (let i = 0; i < 600; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card || o.tag);
    if (!['vt_drip', 'vt_leech', 'vt_plasma', 'vt_rally'].some(i => seen.has(i))) bad.push('never offered');
    // Drip
    card('vt_drip').apply(G); p.hp = P.maxHp * 0.8; let h = p.hp; vtTick(1); if (!(p.hp > h)) bad.push('drip no regen above half');
    // Plasma
    const hm = P.healMult; card('vt_plasma').apply(G); if (!(P.healMult > hm)) bad.push('plasma no heal boost');
    // Leech: pool-limited
    card('vt_leech').apply(G); p.hp = 10; G.lsBudget = 0; vtProc(null, 100, {}, 100); if (p.hp !== 10) bad.push('leech ignored empty pool');
    G.lsBudget = 50; vtProc(null, 100, {}, 100); if (!(p.hp > 10) || !(G.lsBudget < 50)) bad.push('leech no heal from pool');
    // Rally
    card('vt_rally').apply(G); p.hp = 20; vtHurt(30); vtKill(); if (!(p.hp > 20)) bad.push('rally no heal on kill');
    G.t += 5; h = p.hp; vtKill(); if (p.hp !== h) bad.push('rally never ends');
    // Shell cards
    const D = pdef(); D.n.shell = 2; if (!card('vt_regrow').eligible(G) || !card('vt_shrap').eligible(G)) bad.push('shell cards not offered with a Shell');
    pdRefit(D); card('vt_regrow').apply(G); card('vt_shrap').apply(G); vtTick(0.01);
    const e = { x: p.x + 40, y: p.y, hp: 1e6, maxHp: 1e6, r: 10, kx: 0, ky: 0, def: {} };
    let hits = 0; const old = window.aoe; window.aoe = (...a) => { hits++; };
    D.layers = 0; D.layerHp = 0; vtTick(0.01); if (!hits) bad.push('shrapnel no burst on layer loss');
    for (let i = 0; i < 30; i++) vtTick(1); if (!(D.layers > 0)) bad.push('regrow no layer');
    // Membrane cards
    G.relics.rubber = 1; G.pd = null; pdefTick(0.01); const m = pdef().mem;
    for (const id of ['vt_pop', 'vt_osmo', 'vt_feed']) if (!card(id).eligible(G)) bad.push(id + ' not offered with a Membrane');
    card('vt_pop').apply(G); card('vt_osmo').apply(G); card('vt_feed').apply(G);
    G.vtS = null; m.mem = m.memMax; vtTick(0.01); hits = 0; m.mem = 0; vtTick(0.01); if (!hits) bad.push('pop no burst');
    window.aoe = old;
    m.mem = 0; vtKill(); if (!(m.mem > 0)) bad.push('feed no refill');
    delete G.vtc.vt_drip; m.mem = m.memMax; p.hp = P.maxHp * 0.5; h = p.hp; vtTick(1); if (!(p.hp > h)) bad.push('osmo no regen at full Membrane');
    m.mem = m.memMax * 0.5; h = p.hp; vtTick(1); if (p.hp !== h) bad.push('osmo regen with a dented Membrane');
    return bad;
  });
  await b.close();
  if (errors.length) bad.push('page errors: ' + errors.slice(0, 3).join(' | '));
  if (bad.length) { console.log('FAIL vitalstest', bad); process.exit(1); } else console.log('ok');
})();
