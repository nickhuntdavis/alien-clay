// v10 player defences (pdef.js): base Membrane soaks and recharges, Shell cards add layers that wear and break,
// Evasion misses Contact/Projectile/Spread only, Thorns hurts a Contact attacker, level-ups offer Switched at Birth + 2 defence cards.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.player.iframes = 0; G.P.dodge = 0; G.pbDodge = 0; pdef().n.latex = 1; pdefTick(0.001); }; // (nobody has a shield by default: Latex stands in; shieldtest.js covers the rest)
    const hurt = (n, kind, ent) => { const hp = G.player.hp; G.player.iframes = 0; hurtPlayer(n, 'test', ent || null, kind); return hp - G.player.hp; };
    const ph = (n, kind, ent) => pdefHurt(n, 'test', ent || null, kind); // the resolver alone: damage that reaches health
    const foe = id => { const p = G.player, e = makeEnemy(ENEMIES[id], p.x + 60, p.y); e.hp = e.maxHp = 1000; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    // Base Membrane: 30% of max health; soaks a hit; recharges after 2 s.
    fresh(); const mx = G.P.maxHp, D = G.pd;
    out.mem = Math.round(D.mem.memMax);
    if (Math.abs(D.mem.memMax - mx * 0.3) > 0.01) bad.push('base Membrane is ' + D.mem.memMax + ' of ' + mx);
    const full = D.mem.mem, soak = hurt(mx * 0.1, 'contact'); // Force: costs 2 per point, so 20% of max
    if (soak !== 0 || !(D.mem.mem < full)) bad.push('Membrane did not soak: lost ' + soak + ', mem ' + D.mem.mem);
    if (G.fst.pMem <= 0) bad.push('pMem stat not counted');
    const after1 = D.mem.mem;
    for (let i = 0; i < 90; i++) pdefTick(1 / 60); // 1.5 s: still quiet-waiting
    if (D.mem.mem > after1 + 0.01) bad.push('Membrane recharged before 2 s');
    for (let i = 0; i < 120; i++) pdefTick(1 / 60); // 3.5 s total
    if (!(D.mem.mem > after1 + 1)) bad.push('Membrane did not recharge after 2 s: ' + after1 + ' -> ' + D.mem.mem);
    // A hit that breaks the Membrane gets through and does damage.
    const through = hurt(mx * 0.5, 'contact');
    if (!(through > 0)) bad.push('overflow hit did no damage');
    // Fully soaked hit applies no status (pstHit not reached): player iframes set, hp untouched.
    fresh(); const hp0 = G.player.hp; hurt(5, 'bullets'); if (G.player.hp !== hp0) bad.push('small hit leaked through Membrane');
    // Shell card: adds a layer, which wears and breaks.
    fresh(); G.pd.mem.mem = 0; G.pd.mem.memMax = 0.0000001;
    const opts = pdefOffer(6), shellCard = opts.find(o => o.defence === 'shell'); shellCard.apply();
    if (G.pd.layers !== 1) bad.push('Shell card did not add a layer');
    const small = ph(10, 'bullets');
    out.shellSmall = small; if (small < 6.9 || small > 7.1) bad.push('Shell should cut 3 from 10: took ' + small);
    G.pd.layerHp = 0.5; ph(10, 'bullets'); // blocked 3 > 0.5 hp: breaks
    if (G.pd.layers !== 0) bad.push('Shell layer did not break');
    pdefTick(0.001); if (G.pd.layers !== 0) bad.push('Shell regrew mid-run without a refit');
    if (G.fst.pLayers < 1) bad.push('pLayers stat');
    G.pd.shellT = G.t - 61; pdefTick(0.001); if (G.pd.layers !== 1) bad.push('Shell did not come back after 60 s (race)');
    // Squishy: cuts Force 35%, not Acid.
    fresh(); G.pd.mem.memMax = 0.0000001; G.pd.mem.mem = 0;
    const f1 = ph(100, 'bullets'); pdef().n.squishy = 1; const f2 = ph(100, 'bullets');
    if (!(Math.abs(f2 - f1 * 0.65) < 0.5)) bad.push('Squishy: ' + f1 + ' -> ' + f2);
    // Evasion: misses some projectiles, never a pool/hazard/blast.
    fresh(); G.pd.mem.memMax = 0.0000001; G.pd.mem.mem = 0; pdefOffer(6).find(o => o.defence === 'evasion').apply(); pdefOffer(6); for (let i = 0; i < 3; i++) G.pd.n.evasion++;
    let miss = 0, poolMiss = 0, blastMiss = 0, contactMiss = 0;
    for (let i = 0; i < 300; i++) { if (ph(1, 'bullets') === 0) miss++; if (ph(1, 'other') === 0) poolMiss++; if (ph(1, 'blast') === 0) blastMiss++; if (ph(1, 'contact') === 0) contactMiss++; }
    out.evasion = [miss, contactMiss];
    if (miss < 70 || miss > 170) bad.push('Evasion 40% should miss about 120 of 300: ' + miss);
    if (contactMiss < 70) bad.push('Evasion should miss Contact: ' + contactMiss);
    if (poolMiss || blastMiss) bad.push('Evasion missed a pool/blast: ' + poolMiss + '/' + blastMiss);
    if (!(G.fst.pMiss > 0)) bad.push('pMiss stat');
    G.pd.n.evasion = 99; if (pdEvasion(G.pd) > 0.5) bad.push('Evasion cap');
    // Thorns: a Contact attacker takes damage; a shooter does not.
    fresh(); G.pd.mem.memMax = 0.0000001; G.pd.mem.mem = 0; G.pd.n.thorns = 1;
    const c = foe('crawler'), shooter = foe('crawler'); const hpC = c.hp;
    hurt(40, 'contact', c); update(1 / 60); update(1 / 60);
    out.thorns = Math.round(hpC - c.hp);
    if (!(c.hp < hpC)) bad.push('Thorns did not hurt the attacker');
    const hpS = shooter.hp; hurt(40, 'bullets', shooter); update(1 / 60); update(1 / 60);
    if (shooter.hp < hpS) bad.push('Thorns hit a shooter');
    if (!(G.fst.pThorns > 0)) bad.push('pThorns stat');
    // Level-up offer: Switched at Birth + 2 different defence cards; maxed ones are not offered.
    fresh(); genLoot({ kind: 'start' })[0].apply();
    let withDef = 0;
    for (let i = 0; i < 30; i++) { // (one shared draft now: draft.js; defence cards are one family among several)
      const lv = genLoot({ kind: 'level' }), defs = lv.filter(o => o.tag === 'DEFENCE');
      if (lv.length !== 3 || (defs.length === 2 && defs[0].defence === defs[1].defence)) { bad.push('offer: ' + lv.map(o => o.title)); break; }
      if (defs.length) withDef++;
    }
    if (withDef < 2) bad.push('defence cards rarely offered: ' + withDef + '/30');
    G.pd.n.squishy = 1; G.pd.n.shell = 4; G.pd.n.thick = 4;
    for (let i = 0; i < 20; i++) { const ids = pdefOffer(6).map(o => o.defence); if (ids.includes('squishy') || ids.includes('shell') || ids.includes('thick')) { bad.push('maxed offered: ' + ids); break; } }
    G.pd.n.shell = 0; G.pd.n.thick = 0; G.pd.n.squishy = 0; G.pd.n.evasion = 1; G.pd.n.fast = 1; G.pd.n.thorns = 1; G.pd.n.shell = 1; // four held: no fifth kind
    for (let i = 0; i < 10; i++) { const ids = pdefOffer(6).map(o => o.defence); if (ids.includes('squishy') || ids.includes('thick')) { bad.push('slots full but new card offered: ' + ids); break; } }
    // The card renders and applies through the real loot screen.
    fresh(); genLoot({ kind: 'start' })[0].apply(); G.lootQueue.length = 0;
    let di = -1, nCards = 0; for (let t = 0; t < 60 && di < 0; t++) { UI.openLoot({ kind: 'level', v10ok: true }); nCards = document.querySelectorAll('#lootCards .card').length; di = UI.lootOpts.findIndex(o => o.defence); } // (the shared draft also offers weapons, Feats and mutations: reopen until a defence card shows)
    if (nCards !== 3) bad.push('loot screen shows ' + nCards + ' cards'); const dk = UI.lootOpts[di].defence; UI.lootOpts[di].apply();
    if (G.pd.n[dk] !== 1) bad.push('card apply');
    fresh(); G.pd.n.shell = 2; pdRefit(G.pd); for (let i = 0; i < 120; i++) update(1 / 60); pdefDraw(); // nothing throws in a live frame, draw included
    // Your statuses from enemy damage types (matrix 11.5)
    { G.pd = null; const D = pdef(); D.mem.mem = 0; const foeOf = t => ({ def: Object.assign({}, ENEMIES.crawler), maxHp: 100, x: G.player.x + 20, y: G.player.y });
      const withType = (t, f) => { const keep = ROSTER.crawler.dmgType; ROSTER.crawler.dmgType = t; try { return f(); } finally { ROSTER.crawler.dmgType = keep; } };
      ENEMIES.crawler && withType('mucus', () => pdefHurt(10, 'x', { def: ENEMIES.crawler, maxHp: 100 }, 'bullets'));
      if (!(pdefSpeed() < 1)) bad.push('no player Snared');
      D.mem.mem = 0; withType('blood', () => pdefHurt(30, 'x', { def: ENEMIES.crawler, maxHp: 100 }, 'bullets'));
      if (!(D.bleeds && D.bleeds.length)) bad.push('no player Bleed');
      D.snareT = 0; D.mem.mem = 0; withType('fire', () => pdefHurt(30, 'x', { def: ENEMIES.crawler, maxHp: 100 }, 'bullets'));
      if (!(D.burnT > 0)) bad.push('no player burn');
      G.state = "play"; const h = G.player.hp = 100; for (let i = 0; i < 60; i++) pdefTick(1 / 60); if (!(G.player.hp < h)) bad.push('player Bleed/burn did not tick');
      D.mem.mem = D.mem.memMax; withType('blood', () => pdefHurt(1, 'x', { def: ENEMIES.crawler, maxHp: 100 }, 'bullets'));
    }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
