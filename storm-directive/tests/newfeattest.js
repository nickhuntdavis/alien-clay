// The v9.23 Feats (newfeats.js): each one is performed in the Lab Bench (s000) without errors, hits, applies its damage
// type's status, and reaches both of its Lv 4 paths (a behaviour path is noted in G.nfPaths when it is read; a stat path
// changes the Feat's stats). Plus: Bloody Show fires, bosses are not taken by Vanishing Twin, and Anhydrobiosis saves you.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    const ids = Object.keys(SPELLS).filter(id => SPELLS[id].kind === 'newfeat'), out = { n: ids.length, fails: [] };
    const stage = (id, fork) => {
      UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.nfPaths = {};
      const w = makeSlot(id, true, fork ? 5 : 1); if (fork) w.fork = fork; computeStats(w); G.spells = [w]; G.weapons = []; recomputeAll();
      const p = G.player, add = (def, x, y) => { const e = makeEnemy(ENEMIES[def], p.x + x, p.y + y); e.hp = e.maxHp = 1e6; G.enemies.push(e); return e; };
      for (let i = 0; i < 8; i++) add('brute', 70 + i * 26, (i % 2 ? 26 : -26) + i * 6);
      for (let i = 0; i < 4; i++) add('spitter', -220 + i * 40, 230);
      const E = G.enemies;
      if (id === 'osmosis' || id === 'capacitation') { E[0].burn = 3; E[0].burnDps = 1; E[0].pre = 1; }
      if (id === 'anticoagulant') for (const e of E.slice(0, 2)) { e.bloodT = 4; e.bloodDps = 5; e.bloodN = 2; e.pre = 1; }
      if (id === 'lacticacid') w.nfCharge = 1;
      if (id === 'fecaltransplant') { G.player.hp = G.P.maxHp * 0.5; G.weapons = [makeSlot('blaster', false, 1)]; recomputeAll(); }
      G.manual = { x: 0, y: 0 }; // (stand still: autorun would kite away from the crowd)
      G.terrain = { list: [], grid: new Map(), regridT: 1e9 }; // (no cilia or acid in the way)
      if (id === 'brownfat') G.nfWater = 1;
      return w;
    };
    const elemOf = id => SPELLS[id].elem;
    for (const id of ids) {
      for (const fork of [null, 'a', 'b']) {
        const w = stage(id, fork), el = elemOf(id), name = SPELLS[id].name;
        let status = false;
        for (let f = 0; f < 30 * 9; f++) {
          if (G.state !== 'play') { out.fails.push(id + (fork || '') + ':state ' + G.state + '@' + f); break; }
          if (id === 'anhydrobiosis' && f === 20) { G.debug.god = false; G.player.hp = G.P.maxHp * 0.15; G.player.iframes = 0; hurtPlayer(G.P.maxHp * 0.1, 'Test'); G.debug.god = true; }
          if (id === 'lacticacid' && f % 60 === 0) { w.nfCharge = 1; G.debug.god = false; G.player.iframes = 0; hurtPlayer(1, 'Test'); G.debug.god = true; }
          if (id === 'fecaltransplant') G.player.hp = Math.min(G.player.hp, G.P.maxHp * 0.5);
          if (id === 'brownfat' && f === 18) for (const e of G.enemies) if (!e.dead) damageEnemy(e, 1, { elem: 'salt', wname: 'Test water' }); // (Water on the slick: Don't Mix)
          if (id === 'anhydrobiosis' && f > 20) { /* rehydrates by itself */ }
          update(1 / 30); G.player.hp = Math.max(G.player.hp, id === 'fecaltransplant' ? 1 : G.P.maxHp * 0.6); if (G.stam) G.stam.cur = stamMax(); if (f % 15 === 7) render();
          for (const e of G.enemies) { if (e.pre || e.dead) continue; const h = chemHas(e); if (el === 'phys' ? Object.values(h).some(Boolean) : h[el]) status = true; }
        }
        const dealt = Object.entries(G.stats.dmg).filter(([k]) => k.startsWith(name) || (id === 'tonic' && k === name)).reduce((a, [, v]) => a + v, 0);
        const tag = id + (fork || '');
        if (!(dealt > 0)) out.fails.push(tag + ':nohit casts ' + (G.stats.casts || 0) + ' alive ' + G.enemies.filter(e => !e.dead).length + ' near ' + Math.round(Math.min(...G.enemies.map(e => Math.hypot(e.x - G.player.x, e.y - G.player.y)))) + ' cd ' + w.cd.toFixed(1) + ' stam ' + Math.round(G.stam ? G.stam.cur : -1) + ' cilia ' + !!G.inCilia);
        if (!status) out.fails.push(tag + ':nostatus');
        if (fork) {
          const plain = makeSlot(id, true, 5); computeStats(plain);
          const statPath = JSON.stringify(plain.s) !== JSON.stringify(w.s);
          if (!(G.nfPaths && G.nfPaths[id + fork]) && !statPath) out.fails.push(tag + ':nopath');
        }
        out[tag] = Math.round(dealt);
      }
    }
    // Bloody Show: Mucus, Blood and Static on one enemy.
    UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.weapons = []; G.spells = [];
    const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + 120, p.y); e.hp = e.maxHp = 1e6; G.enemies.push(e);
    const n = makeEnemy(ENEMIES.brute, p.x + 170, p.y); n.hp = n.maxHp = 1e6; G.enemies.push(n);
    for (const k of ['ice', 'arcane', 'shock']) { e.reactCd = 0; applyElement(e, k, 20, { elem: k, wname: 'Test' }); }
    const hp0 = e.hp;
    for (let f = 0; f < 30 * 4; f++) update(1 / 30);
    out.bloodyshow = (G.stats.reactBy.bloodyshow || 0) + ' hit ' + Math.round(hp0 - e.hp) + ' sprayed ' + (n.bloodT > 0 && n.chill > 0);
    if (!G.stats.reactBy.bloodyshow || !(hp0 - e.hp > 0)) out.fails.push('bloodyshow');
    // A boss is spooked and hit, never taken out of play.
    UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.weapons = [];
    const wv = makeSlot('vanishingtwin', true, 1); computeStats(wv); G.spells = [wv];
    G.bossRoster = ['ghost']; G.bossCount = 0; spawnBoss(); if (G.state === 'bossIntro') endBossIntro(); G.state = 'play'; const bs = G.boss; bs.hp = bs.maxHp = 1e6; bs.x = G.player.x + 140; bs.y = G.player.y;
    let gone = false;
    for (let f = 0; f < 30 * 3; f++) { update(1 / 30); if (!G.enemies.includes(bs)) gone = true; if (G.stam) G.stam.cur = stamMax(); }
    if (gone || !(bs.spookT > 0)) out.fails.push('twin boss');
    // A taken enemy is out of play, then back on your side.
    UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.weapons = []; G.spells = [makeSlot('vanishingtwin', true, 1)]; computeStats(G.spells[0]);
    const tk = makeEnemy(ENEMIES.brute, G.player.x + 120, G.player.y); tk.hp = tk.maxHp = 1e6; G.enemies.push(tk);
    let out1 = false;
    for (let f = 0; f < 30 * 2; f++) { update(1 / 30); if (!G.enemies.includes(tk)) out1 = true; }
    G.spells = [];
    for (let f = 0; f < 30 * 3; f++) update(1 / 30);
    if (!out1 || !G.enemies.includes(tk) || !tk.charmed) out.fails.push('twin out/back ' + out1 + ' ' + tk.charmed);
    // Anhydrobiosis: the hit misses.
    UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.weapons = []; G.spells = [makeSlot('anhydrobiosis', true, 1)]; computeStats(G.spells[0]);
    G.spells[0].cd = 0; G.debug.god = false; G.player.hp = G.P.maxHp * 0.15; G.player.iframes = 0; const h0 = G.player.hp; hurtPlayer(G.P.maxHp * 0.1, 'Test');
    if (G.player.hp !== h0) out.fails.push('anhydro saved');
    // Every new Feat can turn up in a Feat draft.
    UI.sample = 's001'; newGame(); const seen = new Set();
    for (let i = 0; i < 1500; i++) { G.spells = [null, null]; const L = genLoot({ kind: 'level' }); for (const c of L) if (c && c.tag === 'NEW FEAT') seen.add(Object.keys(SPELLS).find(k => SPELLS[k] === c.def)); }
    out.drafted = ids.filter(id => seen.has(id)).length;
    if (out.drafted < ids.length * 0.8) out.fails.push('drafted ' + out.drafted);
    out.errs = Object.keys(ERRS.seen); if (out.errs.length) out.fails.push('caught: ' + out.errs.slice(0, 3).join(' | '));
    return out;
  });
  if (r.fails.length) console.log('FAIL', r.fails.join(', '));
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify([...new Set(errors)].slice(0, 6)));
  await b.close();
})();
