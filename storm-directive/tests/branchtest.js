// Branches (branches.js, the Force slice): Spitball, Placenta Paddle and Little Swimmers get a Lv 4 first branch and
// Lv 7 sub-branches that belong to the one picked. Checks the queue, the offers, that picking one narrows the next,
// that the old forks are untouched, and that every path deals damage with no errors. Prints FAIL on any problem.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); });
  const r = await page.evaluate(() => {
    const bad = [], rows = [], def = ENEMIES.chaser || Object.values(ENEMIES)[0];
    const fresh = (id, lvl) => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      const w = makeSlot(id, false, lvl); G.weapons = [w, null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; return w;
    };
    // 1. Queue and offers: Lv 4 offers the two first branches, Lv 7 only the two under the one picked.
    for (const id of Object.keys(BRANCHES)) {
      for (let side = 0; side < 2; side++) {
        const w = fresh(id, 3); w.perks = w.perks || {};
        setWeaponLevel(w, 4, 3);
        const q4 = G.lootQueue.filter(x => x.kind === 'branch' && x.lvl === 4 && x.uid === w.uid);
        if (q4.length !== 1) bad.push(id + ': Lv 4 queued ' + q4.length + ' branch choices');
        const o4 = genLoot({ kind: 'branch', uid: w.uid, lvl: 4 }).map(o => o.perk);
        if (o4.join() !== BRANCHES[id].map(n => n.id).join()) bad.push(id + ': Lv 4 offered ' + o4.join());
        genLoot({ kind: 'branch', uid: w.uid, lvl: 4 }).find(o => o.perk === BRANCHES[id][side].id).apply();
        G.lootQueue = [];
        setWeaponLevel(w, 7, 4);
        const q7 = G.lootQueue.filter(x => x.kind === 'branch' && x.lvl === 7 && x.uid === w.uid);
        if (q7.length !== 1) bad.push(id + ': Lv 7 queued ' + q7.length);
        const o7 = genLoot({ kind: 'branch', uid: w.uid, lvl: 7 }).map(o => o.perk);
        if (o7.join() !== BRANCHES[id][side].kids.map(k => k.id).join()) bad.push(id + ' side ' + side + ': Lv 7 offered ' + o7.join());
        for (const o of genLoot({ kind: 'branch', uid: w.uid, lvl: 7 })) if (o.tag !== 'BRANCH') bad.push(id + ': ' + o.perk + ' tagged ' + o.tag);
      }
    }
    // 2. The old forks still queue at 5, 8 and 10, and a weapon without a tree gets no extra choices.
    { const w = fresh('blaster', 1); setWeaponLevel(w, 10, 1); const lv = G.lootQueue.filter(x => x.kind === 'branch').map(x => x.lvl).sort((a, c) => a - c).join();
      if (lv !== '3,4,5,7,8,10') bad.push('blaster: choices at ' + lv); }
    { const w = fresh('shotgun', 1); setWeaponLevel(w, 10, 1); const lv = G.lootQueue.filter(x => x.kind === 'branch').map(x => x.lvl).sort((a, c) => a - c).join();
      if (lv !== '3,5,8,10') bad.push('shotgun: choices at ' + lv); }
    // 3. Every path (6 first branches, 12 sub-branches) runs for six seconds against a crowd.
    const paths = [];
    for (const id of Object.keys(BRANCHES)) for (const n of BRANCHES[id]) { paths.push([id, n.id, null]); for (const k of n.kids) paths.push([id, n.id, k.id]); }
    for (const [id, a, k] of paths) {
      const w = fresh(id, 10); w.perks[4] = a; if (k) w.perks[7] = k; recomputeAll();
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {};
      for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2, d = 80 + (i % 3) * 60; const e = makeEnemy(def, p.x + Math.cos(an) * d, p.y + Math.sin(an) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
      const hp0 = p.hp = 1e5; G.P.maxHp = 1e6;
      try { for (let f = 0; f < 360; f++) { p.vx = Math.cos(f / 30) * 160; p.vy = Math.sin(f / 30) * 160; p.x += p.vx / 60; p.y += p.vy / 60; update(1 / 60); } } catch (err) { bad.push(a + '/' + k + ': ' + err.message); continue; }
      const dealt = Object.values(G.stats.dmg).reduce((s, v) => s + v, 0);
      if (!(dealt > 0)) bad.push((k || a) + ': no damage');
      const want = { brSpitTake: 'Spit Take', brSubpoena: 'Spit Take', brSpitRoast: 'Spit Take', brBounce: 'Bounce House', brAfterbirth: 'Afterbirth', brWarm: 'Afterbirth', brSlip: 'Afterbirth' }[k || a];
      if (want && !(G.stats.dmg[want] > 0)) bad.push((k || a) + ': never dealt its ' + want + ' damage');
      if ((k || a) === 'brWarm') { /* healing is checked below */ }
      rows.push((k || a) + ' ' + Math.round(dealt / 6) + '/s');
    }
    // 4. Stat effects.
    { const w = fresh('blaster', 10), m0 = w.s.mag; w.perks[4] = 'brTapWater'; computeStats(w); if (w.s.mag <= m0) bad.push('Tap Water: magazine ' + m0 + ' -> ' + w.s.mag);
      const cd0 = w.s.cd; w.perks[7] = 'brFireHose'; computeStats(w); if (!(w.s.cd < cd0 * 0.6)) bad.push('Fire Hose: fire rate unchanged'); }
    { const w = fresh('paddle', 10), a0 = w.s.arc; w.perks[4] = 'brSpanking'; computeStats(w); if (!(w.s.arc > a0 * 1.2)) bad.push('Spanking Machine: arc ' + a0 + ' -> ' + w.s.arc); }
    { const w = fresh('swimmers', 10), sp0 = w.s.speed; w.perks[4] = 'brRace'; computeStats(w); if (!(w.s.speed > sp0 * 1.3)) bad.push('Race to the Egg: speed unchanged');
      w.perks[7] = 'brSlipstream'; if (!(brSpeed() > 1.05)) bad.push('Slipstream: no speed bonus'); }
    // 5. Warm Bath heals while you stand in a puddle (the player is hurt first).
    { const w = fresh('paddle', 10); w.perks[4] = 'brAfterbirth'; w.perks[7] = 'brWarm'; recomputeAll(); const p = G.player; G.P.maxHp = 100; p.hp = 10;
      G.zones.push({ x: p.x, y: p.y, r: 60, life: 2, max: 2, dps: 0, elem: 'phys', pull: 0, color: '#fff', tick: 0, src: {}, br: w.uid, warm: true, slip: false });
      for (let i = 0; i < 60; i++) brTick(1 / 60);
      if (!(p.hp > 10)) bad.push('Warm Bath: no healing (hp ' + p.hp + ')'); }
    return { bad, rows };
  });
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log(r.rows.join(' | '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
})();
