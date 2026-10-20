// Weapon upgrade branches, batch 4 (web/js/wup4.js): There Is No Spoon, Nappy Mines, Soulmate Signal, Unwanted Contact.
// For every weapon: its three promises (Lv 3), the Lv 6 cards (two per promise plus the wildcard) and the three masteries
// each run 300+ frames against a ring of enemies with no errors, and each asserts that its signature effect happened (w.w4.fx
// counters, or a state check where a counter is not the point). Also checks the card data (names, one-line text, banned words).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; window.FIT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const IDS = ['s_siphon', 's_mines', 's_twin', 's_tesla'];
    // ---- card data
    for (const id of IDS) {
      const S = WUP[id]; if (!S) { bad.push(id + ' not registered'); continue; }
      for (const k of ['A', 'B', 'C']) {
        const P = S[k]; if (!P) { bad.push(id + ' missing promise ' + k); continue; }
        if (!P.name || !P.lv3 || !P.lv3.desc || !P.lv3.apply) bad.push(id + k + ' lv3');
        if (!P.lv6 || P.lv6.length !== 2 || !P.wild) bad.push(id + k + ' lv6 cards');
        for (const c of [...(P.lv6 || []), P.wild]) if (!c || !c.name || !c.desc || !c.apply) bad.push(id + k + ' card ' + (c && c.name));
        if (!P.costs || !P.shows) bad.push(id + k + ' costs/shows');
      }
      if (!S.lv10 || S.lv10.length !== 3) bad.push(id + ' masteries');
      const all = [S.A, S.B, S.C].flatMap(P => [P.name, P.lv3.desc, ...P.lv6.flatMap(c => [c.name, c.desc]), P.wild.name, P.wild.desc]).concat((S.lv10 || []).flatMap(c => [c.name, c.desc]));
      for (const t of all) { if (/\b(element|elemental|cast)\b/i.test(t) || /\n/.test(t) || /—/.test(t)) bad.push('text: ' + t); }
    }
    // ---- scenario machinery
    const def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    let W_, slots = [], SC = null, cbs = null;
    const setup = (id, lvl) => {
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; /* (card tests: no race XP boost, so levels stay put: race15.js) */ UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      W_ = G.weapons[0]; W_.lvl = lvl || 1; computeStats(W_); G.enemies.length = 0; slots = []; return W_;
    };
    const place = (sl) => {
      const p = G.player, e = makeEnemy(def, p.x + Math.cos(sl.a) * sl.r, p.y + Math.sin(sl.a) * sl.r);
      e.hp = e.maxHp = SC.hp; if (SC.maxHp) e.maxHp = SC.maxHp; e.speed = 0;
      if (SC.elite) e.elite = true;
      G.enemies.push(e); sl.e = e;
    };
    const build = (sc) => {
      SC = Object.assign({ shape: 'ring', n: 12, hp: 1e5, frames: 300 }, sc); slots = [];
      for (let i = 0; i < SC.n; i++) {
        let a, r;
        if (SC.shape === 'ring') { a = i / SC.n * TAU; r = 70 + i * 12; }
        else if (SC.shape === 'tight') { a = i / SC.n * TAU; r = 100 + (i % 2) * 14; }
        else if (SC.shape === 'far') { a = i / SC.n * TAU; r = 250; }
        else { a = i / SC.n * TAU; r = 120; }
        slots.push({ a, r, e: null });
      }
      for (const sl of slots) place(sl);
    };
    const frame = (f) => {
      const p = G.player;
      G.state = 'play'; G.lootQueue = []; G.P.maxHp = G.player.hp = 1e6;
      if (!SC.swim) { if (SC.x0 == null) { SC.x0 = p.x; SC.y0 = p.y; } p.x = SC.x0; p.y = SC.y0; p.vx = p.vy = 0; }
      const mine = new Set(slots.map(s => s.e));
      for (let i = G.enemies.length - 1; i >= 0; i--) { const e = G.enemies[i]; if (!e.egg && !mine.has(e)) G.enemies.splice(i, 1); }
      for (const sl of slots) {
        if (sl.e && !sl.e.dead && !SC.free) { sl.e.x = p.x + Math.cos(sl.a) * sl.r; sl.e.y = p.y + Math.sin(sl.a) * sl.r; }
        if (SC.refill && sl.e && sl.e.dead && f % 20 === 0) place(sl);
      }
      if (SC.swim) { p.vx = 120 * Math.cos(f / 20); p.vy = 120 * Math.sin(f / 20); p.x += p.vx / 60; p.y += p.vy / 60; }
      if (cbs) cbs(f);
      update(1 / 60);
    };
    const run = (sc, cb) => { build(sc); cbs = cb || null; try { for (let f = 0; f < SC.frames; f++) frame(f); } catch (err) { bad.push((W_ && W_.def.name) + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } cbs = null; };
    const take = (w, lv, title) => { const o = genLoot({ kind: 'fork', w, lv }); const c = o.find(x => x.title === title); if (!c) { bad.push(w.def.name + ' Lv ' + lv + ' fork has no "' + title + '": ' + o.map(x => x.title)); return false; } c.apply(); return true; };
    const dealt = () => Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
    const fxs = w => (w.w4 && w.w4.fx) || {};
    // ---- enemy bullets for the Siphon: parked near you (or in the Suction ring)
    const feed = (o) => f => {
      const p = G.player;
      if (o.boss) { const e0 = G.enemies.find(e => !e.dead && !e.egg); o.fake = o.fake || { boss: true, dead: false, elite: true, x: 0, y: 0, r: 20 }; if (e0) { o.fake.x = e0.x; o.fake.y = e0.y; } } // (a boss that stands where the first enemy is)
      if (f % (o.every || 6) !== 0) return;
      for (let i = 0; i < (o.n || 3); i++) {
        const a = (f + i * 2.1) * 0.7, d = o.dist || 40;
        const bx = p.x + Math.cos(a) * d, by = p.y + Math.sin(a) * d, sp = o.toward ? 90 : 0;
        const owner = o.boss ? o.fake : null;
        if (o.mixed && i === 0) G.ebul.push({ x: bx, y: by, vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, dmg: 5, r: 4, color: '#f00', life: 7, from: 'Test bullets', owner: null });
        else G.ebul.push({ x: bx, y: by, vx: -Math.cos(a) * sp, vy: -Math.sin(a) * sp, dmg: 20, r: o.r || 5, color: '#f00', life: 7, from: 'Test bullets', owner });
      }
    };
    // ---- Mines: an enemy walks onto a live mine now and then
    const lure = (w, late, many) => f => {
      if (f % 25 !== 0 || f < (late || 0)) return;
      if (many && G.proj.filter(q => q.mine && !q.dead && q.w === w).length < many) return;
      const m = G.proj.find(q => q.mine && !q.dead && q.w === w && q.arm <= 0 && !q.stick);
      const e = G.enemies.find(en => !en.dead && !en.egg);
      if (m && e) { const sl = slots.find(s => s.e === e); if (sl) { e.x = m.x + 22; e.y = m.y; } }
    };
    // a small minefield laid at fixed spots, then an enemy walks up to the first mine (gap: how far from it; under 34 the mine's own trigger does it)
    const mset = (w, o) => f => {
      const p = G.player;
      if (f === 5) w.t3 = [[-40, 0], [0, 36], [40, 0], [0, -40]].map(([a, b]) => [a * (o.sp || 1), b * (o.sp || 1)]).slice(0, o.n || 3).map(([dx, dy]) => { const m = mineDrop(w, p.x + dx, p.y + dy); G.proj.push(m); return m; });
      if (f >= 60 && f % 20 === 0 && w.t3) { const m = w.t3.find(q => !q.dead), e = G.enemies.find(en => !en.dead && !en.egg); if (m && e && m.arm <= 0) { e.x = m.x - (o.gap === 'prox' ? 46 + e.r : 25); e.y = m.y; } }
    };
    const SW = { swim: 1, free: 1 }, ST = { shape: 'far', n: 6, free: 1 };

    // ---- what each card must show (scenario, keys that must have counted)
    const FEED = feed({}), X = {
      // There Is No Spoon
      'Return to Womb': { sc: {}, cb: () => FEED, keys: ['swell', 'volley'], chk: w => w.s.mag >= 25 || 'mag ' + w.s.mag },
      'Full Term': { sc: {}, cb: () => FEED, keys: ['volley'], chk: w => w.w4.tight || 'not tight' },
      'Afterbirth': { sc: {}, cb: () => FEED, keys: ['after'] },
      'Hiccup': { sc: {}, cb: () => FEED, keys: ['hiccup'] },
      'Umbilical Shield': { sc: {}, cb: () => FEED, keys: ['ate', 'bubble'], chk: w => { const d = pdefHurt(5, null, null, 'proj'); return (d < 5 && w.w4.fx.soaked > 0) || 'not soaked ' + d; } },
      'Suction Cup': { sc: {}, cb: () => feed({ dist: 105 }), keys: ['pull'] },
      'Water Breaks': { sc: {}, cb: () => { const fd = FEED; return f => { fd(f); if (f === 200) pdefHurt(1e7, null, null, 'proj'); }; }, keys: ['burst'] },
      'Re-Gift': { sc: {}, cb: () => FEED, keys: ['regift'] },
      'Eat the Rich': { sc: {}, cb: () => feed({ r: 9, mixed: 1 }), keys: ['rich'], chk: w => G.ebul.some(b => !b.dead && b.r < 5) || 'small shots were eaten' },
      'In One Ear': { sc: {}, cb: () => feed({ r: 9 }), keys: ['pierce'] },
      'Paternity Test': { sc: {}, cb: () => feed({ r: 9, boss: 1 }), keys: ['paternity', 'heavy'], frames: 360 },
      'Swap Meet': { sc: {}, cb: () => FEED, keys: ['swap'], extra: 'v_fire_proj' },
      'Mirror Womb': { sc: {}, cb: () => FEED, keys: ['mirror'] },
      'Let-Down Reflex': { sc: {}, cb: () => feed({ n: 5, every: 4 }), keys: ['ring'], chk: w => w.s.mag >= 40 || 'mag ' + w.s.mag, frames: 360 },
      'Bullet Sponge': { sc: {}, cb: () => FEED, keys: ['sponge'], chk: w => w.s.area >= 270 || 'area ' + w.s.area },
      // Nappy Mines
      'Proximity Problems': { sc: ST, cb: w => mset(w, { gap: 'prox', sp: 2.4 }), keys: ['prox'] },
      'Pass the Parcel': { sc: ST, cb: w => mset(w, { gap: 'prox', sp: 2.4 }), keys: ['fling'] },
      'Crawling Baby': { sc: {}, cb: () => null, keys: ['crawl'], frames: 420 },
      'Hand-Me-Down': { sc: ST, cb: w => mset(w, { gap: 25 }), keys: ['carry'] },
      'Cluster Diaper': { sc: ST, cb: w => mset(w, {}), keys: ['link', 'group'] },
      'Compound Interest': { sc: ST, cb: w => mset(w, {}), keys: ['group', 'grow'] },
      'Nappy Pin': { sc: ST, cb: w => mset(w, { n: 4 }), keys: ['group', 'pin'] },
      'Changing Mat': { sc: { frames: 300 }, cb: () => null, keys: ['mat'] },
      'Lingering Smoulder': { sc: ST, cb: w => mset(w, {}), keys: ['patch'], chk: w => w.w4.maxLife >= 5 || 'patch life ' + w.w4.maxLife },
      'Pooling Resources': { sc: ST, cb: w => mset(w, { n: 4 }), keys: ['merge'] },
      'Flare Up': { sc: Object.assign({ hp: 1e5, maxHp: 40, n: 8, shape: 'tight' }, SW), cb: w => lure(w), keys: ['flare'], frames: 540 },
      'Bouncy Castle': { sc: ST, cb: w => mset(w, {}), keys: ['bounce'] },
      'Nuclear Nappy': { sc: SW, cb: w => lure(w), keys: ['nuke'], frames: 420 },
      'Minefield': { sc: SW, cb: w => lure(w), keys: ['field'], chk: w => w.s.count >= 3 || 'count ' + w.s.count },
      'Nappy Rash': { sc: SW, cb: w => lure(w), keys: ['patch'], chk: w => w.w4.maxR > 100 || 'patch radius ' + w.w4.maxR },
      // Soulmate Signal
      'Long-Distance Love': { sc: {}, keys: ['long'], chk: w => w.s.range >= 590 || 'range ' + w.s.range },
      'Absence Makes It Grow': { sc: {}, keys: [], chk: w => { const e = makeEnemy(def, 0, 0); return wupDmgMul(e, { w }) > 1.05 || 'no stretch bonus ' + wupDmgMul(e, { w }); } },
      'Tug of Love': { sc: { free: 1 }, cb: w => f => { const t = w.twins && w.twins[0], e = G.enemies.find(en => !en.dead); if (t && e && f % 10 === 0) { e.x = t.x + 8; e.y = t.y; } }, keys: ['tug'] },
      'Evil Twin': { sc: { elite: 1 }, keys: ['evil'], chk: w => w.w4.evil.key != null || 'never started' },
      'Toxic Codependency': { sc: { swim: 1 }, keys: ['cross'], chk: w => true },
      'Boiling Point': { sc: {}, cb: w => () => { w.w4.ramp = Array(10).fill(G.t + 2); }, keys: ['white'], chk: () => G.enemies.some(e => e.chargeT > G.t) || 'nothing Charged' },
      'Swapsies': { sc: {}, cb: w => f => { w.w4.ramp = Array(10).fill(G.t + 2); if (w.w4.swapT > G.t) { SC.x0 = G.player.x; SC.y0 = G.player.y; } }, keys: ['swapped'] },
      'Gold Digger': { sc: {}, cb: w => f => { const t = w.twins && w.twins[0]; if (t && f % 20 === 0) G.gems.push({ x: (G.player.x + t.x) / 2, y: (G.player.y + t.y) / 2, v: 1, kind: 'x', mag: false, vx: 0, vy: 0 }); }, keys: ['gems'] },
      'Third Wheel': { sc: { shape: 'tight', swim: 1 }, keys: ['extra', 'extrahit'], frames: 420 },
      'Mixed Signals': { sc: { shape: 'tight', n: 16, swim: 1 }, keys: ['extra', 'spark'], frames: 480 },
      'Love Triangle': { sc: { shape: 'tight', swim: 1 }, keys: ['tri'], chk: w => w.s.count >= 2 || 'count ' + w.s.count, frames: 360 },
      'Mirror Image': { sc: {}, cb: () => feed({ dist: 90, toward: 1, every: 5 }), keys: ['mirror'], frames: 360 },
      'Quadruplets': { sc: {}, keys: ['quads'], chk: w => (w.twins && w.twins.length >= 3) || 'twins ' + (w.twins && w.twins.length) },
      'Psychic Link': { sc: {}, keys: ['psychic'] },
      'Conjoined Twins': { sc: {}, keys: ['fused'], chk: w => (w.s.range >= 890 && w.twins.length === 1 && wupDmgMul(G.enemies[0], { w }) > 3) || 'range ' + w.s.range + ' twins ' + w.twins.length },
      // Unwanted Contact
      "It's Spreading": { sc: { shape: 'tight', n: 16 }, keys: [], chk: w => (w.s.chain === 6 && w.w4.lastHit >= 4) || 'chain ' + w.s.chain + ' hit ' + w.w4.lastHit },
      'Split Ends': { sc: { shape: 'tight', n: 16 }, keys: ['fork'] },
      'Still Buzzing': { sc: { shape: 'tight', n: 16 }, keys: ['afterglow'] },
      'Bad Hair Day': { sc: { shape: 'tight', n: 16, free: 1 }, keys: ['hair'] },
      'Conductive Personality': { sc: { shape: 'tight' }, keys: [], chk: w => { const e = makeEnemy(def, 0, 0); e.chargeT = G.t + 3; const c = wupDmgMul(e, { w }); return c >= 1.19 || 'mult ' + c; } },
      'Spread the Love': { sc: { shape: 'tight', n: 16 }, keys: ['fresh'] },
      'Last Spark': { sc: { shape: 'tight', n: 14, hp: 30, refill: 1 }, keys: ['haste'], chk: () => G.w4haste > 0 || 'no haste', frames: 420 },
      'Odd Sock': { sc: { shape: 'tight', n: 16, free: 1 }, keys: ['rod', 'rodhit'] },
      'Feedback Loop': { sc: { shape: 'tight', n: 16 }, keys: ['arcs', 'arc1'], extra: 'v_shock_beam', frames: 420 },
      'Echo Chamber': { sc: { shape: 'tight', n: 16 }, keys: ['arc1'], extra: 'v_shock_beam', frames: 420, chk: w => w.w4.deep || 'not deep' },
      'Brainstorm': { sc: { shape: 'tight', n: 16 }, keys: ['arcs', 'brew', 'storm'], extra: 'v_shock_beam', frames: 600 },
      'Balloon Animal': { sc: { shape: 'tight', n: 14, hp: 30, refill: 1 }, keys: ['balloon', 'pop'], frames: 480 },
      'Tumble Dryer': { sc: { shape: 'tight', n: 16 }, cb: () => f => { const o = G.weapons[1], e = G.enemies.find(en => !en.dead); if (o && e && f % 8 === 0) damageEnemy(e, 5, { elem: 'phys', w: o, atk: 'proj', noCrit: true, wname: 't' }); }, keys: ['dryer'], extra: 'v_phys_proj', frames: 420 },
      'Worked Up': { sc: { shape: 'tight', n: 16 }, keys: [], chk: w => (w.s.chain === 8 && w.w4.rise && w.w4.lastHit >= 5) || 'chain ' + w.s.chain + ' hit ' + w.w4.lastHit },
      'Grid Lock': { sc: { shape: 'tight', n: 16, free: 1 }, keys: ['grid'], frames: 420 },
    };
    // ---- run every card
    for (const id of IDS) {
      const S = WUP[id];
      const cases = [];
      for (const k of ['A', 'B', 'C']) {
        cases.push({ lv: 3, p: k, name: S[k].name });
        for (const c of [...S[k].lv6, S[k].wild]) cases.push({ lv: 6, p: k, name: c.name });
      }
      for (const c of S.lv10) cases.push({ lv: 10, p: c.best[0], name: c.name });
      for (const cs of cases) {
        const x = X[cs.name]; if (!x) { bad.push('no test for ' + cs.name); continue; }
        const w = setup(id, cs.lv === 3 ? 3 : cs.lv === 6 ? 6 : 10);
        if (cs.lv > 3) { w.lvl = 3; computeStats(w); if (!take(w, 3, S[cs.p].name)) continue; w.lvl = cs.lv; computeStats(w); }
        if (!take(w, cs.lv, cs.name)) continue;
        if (x.extra) { G.weapons[1] = makeSlot(x.extra, false, 1); recomputeAll(); G.P.maxHp = G.player.hp = 1e6; computeStats(w); }
        w.w4.maxLife = 0; w.w4.maxR = 0;
        const user = x.cb ? x.cb(w) : null;
        run(Object.assign({}, x.sc, x.frames ? { frames: x.frames } : {}), f => {
          if (user) user(f);
          for (const z of G.zones) if (z.w4 && z.w4.w === w) { if (z.life > w.w4.maxLife) w.w4.maxLife = z.life; if (z.r > w.w4.maxR) w.w4.maxR = z.r; }
        });
        const F = fxs(w), missing = (x.keys || []).filter(k => !(F[k] > 0));
        if (missing.length) bad.push(`${cs.name} (${w.def.name} Lv ${cs.lv}): no ${missing.join(', ')}; fx ${JSON.stringify(F)}`);
        if (x.chk) { const c = x.chk(w); if (c !== true) bad.push(`${cs.name}: ${c}`); }
        if (!(dealt() > 0) && id !== 's_siphon') bad.push(`${cs.name}: dealt nothing`);
        rows.push(`${cs.name}:${Object.keys(F).map(k => k + F[k]).join(',')}`);
      }
    }
    return { bad, rows };
  });
  if (process.env.WUP_ROWS) console.log(r.rows.join('\n')); // (what each card counted; WUP_ROWS=1 to see)
  console.log(r.rows.length + ' cards ran');
  if (r.bad.length) console.log('FAIL', r.bad.join('\n  '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
