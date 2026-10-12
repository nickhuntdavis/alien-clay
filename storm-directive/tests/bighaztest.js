// Big hazards (bighaz.js): 1 to 3 a run, never two the same, clear of your start; each does its job to enemies
// and to you. Screenshots of each in both fields (out/bighaz_*.png).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const R = {};
    // Counts, in both maps.
    for (const smp of ['s001', 's002']) {
      UI.sample = smp; newGame();
      const n = [0, 0, 0, 0], bad = [];
      for (let i = 0; i < 300; i++) {
        const L = makeBigHaz(); n[L.length]++;
        if (new Set(L.filter(h => !h.twin).map(h => h.type)).size !== L.filter(h => !h.twin).length) bad.push('dup');
        for (const h of L) { if (Math.hypot(h.x, h.y - CORE.arena * 0.78) < h.r + (h.def.terrain ? 0 : 300)) bad.push('start'); if (Math.hypot(h.x, h.y) > CORE.arena) bad.push('out'); }
      }
      R[smp] = { n: n.join('/'), bad: bad.length, now: G.bigHaz.length };
    }
    // Each hazard on its own, enemies parked in it.
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0];
    const setup = type => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; G.enemies.length = 0;
      const h = { type, def: BIG_HAZ[type], x: p.x + 1500, y: p.y, r: 400, seed: 5, seen: true, vx: 0, vy: 0, flushT: 99, warn: 0, blastT: -9 };
      G.bigHaz = [h]; return h;
    };
    const mk = (x, y) => { const e = makeEnemy(def, x, y); e.hp = e.maxHp = 1000; G.enemies.push(e); return e; };
    const hp = e => e.dead ? 0 : e.hp;
    // Plughole: pulls in, drowns in the middle.
    { const h = setup('plughole'); const out = mk(h.x + 300, h.y), mid = mk(h.x + 10, h.y); out.speed = mid.speed = 0;
      const d0 = Math.hypot(out.x - h.x, out.y - h.y); for (let f = 0; f < 60; f++) { G.player.x = h.x - 750; update(1 / 60); }
      R.plughole = { pulled: Math.round(d0 - Math.hypot(out.x - h.x, out.y - h.y)), drowned: Math.round(1000 - hp(mid)) }; }
    // Spermicide: burns enemies and slows you.
    { const h = setup('spermicide'); const e = mk(h.x, h.y); e.speed = 0; for (let f = 0; f < 120; f++) { G.player.x = h.x - 750; update(1 / 60); }
      G.player.x = h.x; G.player.y = h.y; R.spermicide = { burnt: Math.round((G.stats.dmg || {})['Spermicide'] || 0), yourSpeed: +bigHazSpeed().toFixed(2) }; }
    // Hot Flush: builds, then goes off.
    { const h = setup('hotflush'); const e = mk(h.x + 100, h.y); e.speed = 0; h.flushT = 3; let warned = 0;
      for (let f = 0; f < 60 * 4; f++) { G.player.x = h.x - 750; update(1 / 60); if (h.warn > 0) warned++; }
      R.hotflush = { warned: warned > 0, blasted: Math.round(1000 - hp(e)) }; }
    // Mucus Plug: enemies chasing you crawl through it.
    { const h = setup('mucusplug'); const a = mk(h.x, h.y), c = mk(h.x, h.y + 600);
      G.player.x = h.x - 750; G.player.y = h.y; const a0 = a.x, c0 = c.x;
      for (let f = 0; f < 60; f++) { G.player.x = h.x - 750; G.player.y = h.y; c.y = h.y + 600; update(1 / 60); }
      G.player.x = h.x; G.player.y = h.y;
      R.mucus = { inGoo: Math.round(a0 - a.x), outside: Math.round(c0 - c.x), yourSpeed: +bigHazSpeed().toFixed(2) }; }
    // Acid Lake and Cilia Field: built from real terrain; a lake swallows an acid pit it reaches.
    { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0;
      const p = G.player, h = { type: 'acidlake', def: BIG_HAZ.acidlake, x: p.x + 1500, y: p.y - 300, r: 300, seed: 1, seen: true };
      const f = { type: 'ciliafield', def: BIG_HAZ.ciliafield, x: p.x - 1200, y: p.y - 900, r: 520, seed: 2, seen: true };
      const n0 = G.terrain.list.length; G.bigHaz = bigHazBuild([h, f]);
      const lake = h.ob, pieces = G.terrain.list.filter(o => o === lake || o.parent === lake).length;
      const beds = G.terrain.list.filter(o => o.type === 'cilia' && !o.parent && o.fixed && Math.hypot(o.x - f.x, o.y - f.y) < f.r).length;
      const pit = bhPiece('acid', lake.x + lake.r * 1.4, lake.y, 60, { sp: 0, h: 0, fixed: true }); G.terrain.list.push(pit);
      G.bhMergeT = 0; updateTerrain(1 / 60);
      R.terrain = { pieces, beds, merged: pit.parent === lake, merges: G.stats.lakeMerges || 0 };
      for (let i = 0; i < 600; i++) update(1 / 60); R.terrain.runs = true; }
    return R;
  });
  for (const df of [false, true]) for (const type of ['plughole', 'spermicide', 'hotflush', 'mucusplug', 'acidlake', 'ciliafield']) {
    await page.evaluate(([df, type]) => {
      SET.darkfield = df; UI.applySettings();
      UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0;
      const p = G.player, h = { type, def: BIG_HAZ[type], x: p.x, y: p.y - 260, r: 400, seed: 7, seen: true, vx: 0, vy: 0, flushT: type === 'hotflush' ? 1 : 99, warn: type === 'hotflush' ? 0.6 : 0, blastT: -9 };
      G.bigHaz = bigHazBuild([h]); if (h.ob) { h.ob.sp = 0; } G.debug = { freeze: true }; cam.x = p.x; cam.y = p.y - 200;
    }, [df, type]);
    await page.waitForTimeout(250); await page.screenshot({ path: `bighaz_${type}${df ? '_df' : ''}.png` });
  }
  const ok = r.s001.bad === 0 && r.s002.bad === 0 && r.s001.n.startsWith('0/') && r.plughole.pulled > 20 && r.plughole.drowned > 100 && r.spermicide.burnt > 50 && r.spermicide.yourSpeed < 0.8
    && r.hotflush.warned && r.hotflush.blasted > 300 && r.mucus.inGoo < r.mucus.outside * 0.7 && r.mucus.yourSpeed < 0.6 && r.terrain.pieces >= 5 && r.terrain.beds >= 6 && r.terrain.merged;
  if (!ok) console.log('FAIL');
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
