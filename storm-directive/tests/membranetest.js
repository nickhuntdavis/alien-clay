// Health and Membrane cards (membrane.js): they are offered, apply, and the effects work.
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
    const ids = ['hp_marrow', 'hp_scab', 'hp_slurp', 'hp_scar', 'hp_spill', 'hp_coat'];
    for (const id of ids) if (!CARDS.some(c => c.id === id)) bad.push('not registered ' + id);
    const card = id => CARDS.find(c => c.id === id);
    // membrane cards need a Membrane
    if (card('hp_coat').eligible(G) || card('hp_spill').eligible(G)) bad.push('membrane cards offered without a Membrane');
    // offered in drafts
    const seen = new Set(); for (let i = 0; i < 400; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card || o.tag);
    if (!['hp_marrow', 'hp_scab', 'hp_slurp', 'hp_scar'].some(i => seen.has(i))) bad.push('never offered: ' + [...seen]);
    // Marrow
    const m0 = G.P.maxHp; card('hp_marrow').apply(G); if (G.P.maxHp <= m0) bad.push('marrow no max HP');
    // Scab
    card('hp_scab').apply(G); G.player.hp = G.P.maxHp * 0.3; const h0 = G.player.hp; hpTick(1); if (G.player.hp <= h0) bad.push('scab no regen');
    G.player.hp = G.P.maxHp; hpTick(1);
    // Slurp respects the lifesteal pool
    card('hp_slurp').apply(G); G.player.hp = 10; G.lsBudget = 0; hpKill(); if (G.player.hp !== 10) bad.push('slurp ignored empty lifesteal pool');
    G.lsBudget = 100; hpKill(); if (!(G.player.hp > 10) || !(G.lsBudget < 100)) bad.push('slurp did not heal from pool');
    // Scar
    card('hp_scar').apply(G); hpHurt(); if (!(hpHurtMul() < 1)) bad.push('scar no cut'); G.t += 5; if (hpHurtMul() !== 1) bad.push('scar never ends');
    // Membrane cards with a shield
    G.relics = G.relics || {}; G.relics.rubber = 1; G.pd = null;
    if (!card('hp_coat').eligible(G) || !card('hp_spill').eligible(G)) bad.push('membrane cards not offered with a Membrane');
    card('hp_coat').apply(G); card('hp_spill').apply(G);
    const mem = pdef().mem; mem.mem = 0; hpTick(1); if (!(mem.mem > 0)) bad.push('coat no mend');
    mem.mem = 0; G.player.hp = G.P.maxHp; healPlayer(20, true); if (!(mem.mem > 0)) bad.push('spill no overheal to membrane');
    return bad;
  });
  await b.close();
  if (errors.length) bad.push('page errors: ' + errors.slice(0, 3).join(' | '));
  if (bad.length) { console.log('FAIL membranetest', bad); process.exit(1); } else console.log('ok');
})();
