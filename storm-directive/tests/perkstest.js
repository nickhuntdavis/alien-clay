// Trade-off, streak, sprint, decoy, boss, curse and race cards (perks.js): they register, gate, and each effect works.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = await page.evaluate(() => {
    const bad = [];
    META.profile = 's10_baseline'; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
    genLoot({ kind: 'start' })[0].apply();
    for (const id in PKC) if (!CARDS.some(c => c.id === id)) bad.push('not registered ' + id);
    const card = id => CARDS.find(c => c.id === id), P = G.P, p = G.player;
    if (card('pk_homing').eligible(G) || card('pk_last').eligible(G)) bad.push('race cards in wave mode');
    G.pd = null; G.relics = G.relics || {}; delete G.relics.rubber;
    if (!pdHasShield(pdef()) && (card('pk_bubble').eligible(G) || card('pk_learn').eligible(G))) bad.push('membrane cards without a Membrane');
    const seen = new Set(); for (let i = 0; i < 600; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card);
    if (!Object.keys(PKC).some(i => seen.has(i))) bad.push('never offered');
    // Big Heart
    const hp0 = P.maxHp, s0 = mutSpeed(); card('pk_heart').apply(G); if (!(P.maxHp > hp0) || !(mutSpeed() < s0)) bad.push('heart');
    // Edge
    card('pk_edge').apply(G); p.hp = P.maxHp; const e0 = pkDmgMul({}); p.hp = P.maxHp * 0.2; if (!(pkDmgMul({}) > e0)) bad.push('edge');
    // Slayer / Brace
    card('pk_slayer').apply(G); if (!(pkDmgMul({ boss: true }) > pkDmgMul({}))) bad.push('slayer');
    card('pk_brace').apply(G); if (!(pkHurtMul({ boss: true }) < pkHurtMul({}))) bad.push('brace');
    // Streak
    card('pk_streak').apply(G); const r0 = rateBonus(); for (let i = 0; i < 10; i++) pkKill(); if (!(rateBonus() > r0)) bad.push('streak');
    G.t += 6; if (rateBonus() !== r0) bad.push('streak never ends');
    // Shrug
    card('pk_shrug').apply(G); const D = pdef(); D.snareT = 0; pdefStatus(D, { mucus: 10 }, 10); if (!(D.snareT - G.t < PDEF_ST.snareT - 1e-6)) bad.push('shrug');
    // Sprint trail and burst
    card('pk_trail').apply(G); card('pk_burst').apply(G);
    let hits = 0; const aoe0 = window.aoe; window.aoe = () => { hits++; };
    G.stam = G.stam || {}; G.stam.sprint = false; pkTick(0.01); G.stam.sprint = true;
    const e = { x: p.x + 5, y: p.y, hp: 1e6, maxHp: 1e6, r: 10, kx: 0, ky: 0, def: {} }; G.enemies.push(e); gridBuild();
    pkTick(0.1); pkTick(0.1);
    if (!hits) bad.push('burst'); if (!G.pkS.trail.length) bad.push('trail none'); if (!(e.iceT > G.t)) bad.push('trail no slip');
    window.aoe = aoe0; G.stam.sprint = false; G.enemies.splice(G.enemies.indexOf(e), 1);
    // Dud
    card('pk_dud').apply(G); G.decoy = null; for (let i = 0; i < 31; i++) pkTick(1);
    if (!(G.decoy && G.decoy.pk) || peekSpot() !== G.decoy) bad.push('dud no decoy');
    sillyTick(0.01); if (!(G.decoy && G.decoy.pk)) bad.push('silly cleared the dud');
    G.t += 6; pkTick(0.01); if (G.decoy) bad.push('dud never ends');
    // Hex
    const n3 = draftCards(3, 'level').length; card('pk_hex').apply(G); if (!(pkHurtMul({}) > 1)) bad.push('hex no hurt');
    if (!(draftCards(3, 'level').length > n3)) bad.push('hex no extra card');
    // Membrane cards
    G.relics.rubber = 1; G.pd = null; pdefTick(0.01);
    if (!card('pk_bubble').eligible(G) || !card('pk_learn').eligible(G)) bad.push('membrane cards not offered with a Membrane');
    const mm0 = pdef().mem.memMax; card('pk_bubble').apply(G); pdefTick(0.01); if (!(pdef().mem.memMax > mm0 * 1.9)) bad.push('bubble size ' + mm0 + ' ' + pdef().mem.memMax);
    if (pdef().n.thick !== 0) bad.push('bubble left thick ranks');
    card('pk_learn').apply(G); const m = pdef().mem; m.mem = m.memMax;
    G.pkS.hurtBy = { acid: 100 }; const ent = { def: {}, x: p.x, y: p.y };
    const pt0 = pdefTypes; pdefTypes = () => ['acid']; const before = m.mem; pdefHurt(10, 'x', ent, 'bullets'); const usedA = before - m.mem;
    m.mem = m.memMax; pdefTypes = () => ['blood']; G.pkS.hurtBy = { acid: 1e6 }; pdefHurt(10, 'x', ent, 'bullets'); const usedB = m.memMax - m.mem; pdefTypes = pt0;
    if (!(usedA < usedB)) bad.push('learn no cut ' + usedA + ' ' + usedB);
    // Race cards
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; genLoot({ kind: 'start' })[0].apply();
    G.eggE = G.eggE || { x: 0, y: -3000, dead: false, egg: true };
    {
      if (!card('pk_homing').eligible(G)) bad.push('race cards not in race');
      card('pk_homing').apply(G); card('pk_last').apply(G);
      G.player.x = G.eggE.x + 200; G.player.y = G.eggE.y; const near = mutSpeed(), nh = pkHurtMul({});
      G.player.x = G.eggE.x + 5000; if (!(near > mutSpeed()) || !(nh < pkHurtMul({}))) bad.push('race cards no effect near the egg');
    }
    return bad;
  });
  await page.evaluate(() => { G.state = 'play'; }); await page.waitForTimeout(500);
  await b.close();
  if (errors.length) bad.push('page errors: ' + errors.slice(0, 3).join(' | '));
  if (bad.length) { console.log('FAIL perkstest', bad); process.exit(1); } else console.log('ok');
})();
