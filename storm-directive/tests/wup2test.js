// Weapon upgrade branches, batch 2 (web/js/wup2.js): Acid Spit, Red Flagship, Nocturnal Emission, Little Prick.
// For every weapon: its three promises (Lv 3), the Lv 6 cards (two per promise plus the wildcard) and the three masteries
// each run 300+ frames against enemies with no errors, and each asserts that its signature effect happened (w.w2.fx counters,
// or a state check where a counter is not the point). Also checks the card data (names, one-line text, banned words).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; window.FIT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const IDS = ['v_fire_proj', 'v_shock_beam', 'v_ice_pool', 'v_arcane_proj'];
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
      e.hp = e.maxHp = SC.hp + (SC.hpJit ? Math.floor(Math.random() * SC.hpJit) : 0); if (SC.maxHp) e.maxHp = SC.maxHp; e.speed = 0;
      if (SC.shell) { e.cd = makeDefence(e.maxHp, 'shell', 'normal', { layers: SC.shell }); e.cd.hp = e.hp; }
      if (SC.elite) e.elite = true;
      G.enemies.push(e); sl.e = e;
    };
    const build = (sc) => {
      SC = Object.assign({ shape: 'ring', n: 12, hp: 1e5, frames: 300, pre: 0 }, sc); slots = [];
      for (let i = 0; i < SC.n; i++) {
        let a, r;
        if (SC.shape === 'ring') { a = i / SC.n * TAU; r = 70 + i * 12; } // (every distance different: the nearest enemy stays the target)
        else if (SC.shape === 'tight') { a = i / SC.n * TAU; r = 100 + (i % 2) * 14; }
        else if (SC.shape === 'line') { a = 0.02 * (i % 2); r = 110 + i * 38; }
        else if (SC.shape === 'far') { a = i / SC.n * TAU; r = 250; }
        else { a = i / SC.n * TAU; r = 120; }
        slots.push({ a, r, e: null });
      }
      if (!SC.pre) for (const sl of slots) place(sl);
    };
    const frame = (f) => {
      const p = G.player;
      G.state = 'play'; G.lootQueue = [];
      if (!SC.swim) { if (SC.x0 == null) { SC.x0 = p.x; SC.y0 = p.y; } p.x = SC.x0; p.y = SC.y0; p.vx = p.vy = 0; } // (hold still: the autorun would swim off and change targets)
      const mine = new Set(slots.map(s => s.e)); // (no director spawns: only the scenario's enemies, and the egg)
      for (let i = G.enemies.length - 1; i >= 0; i--) { const e = G.enemies[i]; if (!e.egg && !mine.has(e)) G.enemies.splice(i, 1); }
      if (SC.pre && f === SC.pre) for (const sl of slots) place(sl);
      for (const sl of slots) {
        if (sl.e && !sl.e.dead && !SC.free) { sl.a += SC.rot || 0; sl.e.x = p.x + Math.cos(sl.a) * sl.r; sl.e.y = p.y + Math.sin(sl.a) * sl.r; }
        if (SC.refill && sl.e && sl.e.dead && f % 20 === 0 && !(SC.pre && f < SC.pre)) place(sl);
      }
      if (SC.swim) { p.vx = 120 * Math.cos(f / 20); p.vy = 120 * Math.sin(f / 20); p.x += p.vx / 60; p.y += p.vy / 60; }
      if (cbs) cbs(f);
      update(1 / 60);
    };
    const run = (sc, cb) => { build(sc); cbs = cb || null; try { for (let f = 0; f < SC.frames; f++) frame(f); } catch (err) { bad.push((W_ && W_.def.name) + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } cbs = null; };
    const take = (w, lv, title) => { const o = genLoot({ kind: 'fork', w, lv }); const c = o.find(x => x.title === title); if (!c) { bad.push(w.def.name + ' Lv ' + lv + ' fork has no "' + title + '": ' + o.map(x => x.title)); return false; } c.apply(); return true; };
    const dealt = () => Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
    const fxs = w => (w.w2 && w.w2.fx) || {};
    const stacks = e => (e.bleeds ? e.bleeds.length : 0) + (e.w2 && e.w2.bx ? e.w2.bx.length : 0);

    // ---- what each card must show (scenario, keys that must have counted)
    const SH = { shell: 2, hp: 1e5, maxHp: 60 }, SH1 = { shell: 1, hp: 1e5, maxHp: 60 };
    const FOD = { hp: 30, refill: 1, n: 14 }, TIGHT = { shape: 'tight', n: 16 };
    const X = {
      // Acid Spit
      'Spit Take': { sc: SH, keys: [], chk: w => !!w.w2.lock || 'no lock' },
      'Second Helping': { sc: SH, keys: ['seconds'] }, 'Stripped Bare': { sc: SH1, keys: ['bare'] },
      'Spittoon': { sc: { shape: 'far', n: 10, rot: 0.1, hp: 1e5 }, keys: ['puddle'] },
      'Splash Damage': { sc: TIGHT, keys: ['droplet'] }, 'Backsplash': { sc: Object.assign({ hp: 1e5, maxHp: 60 }, TIGHT), keys: ['droplet'] },
      'Nasty Fifth': { sc: { hp: 1e5 }, keys: ['fifth'] }, 'Gargle': { sc: { hp: 1e5, pre: 150, frames: 330 }, keys: ['mouthful'] },
      'Bad Aftertaste': { sc: Object.assign({}, FOD, TIGHT, { refill: 1 }), keys: ['aftertaste'] },
      'Wet Floor': { sc: Object.assign({}, FOD, TIGHT, { refill: 1 }), keys: ['wet'] }, 'Pass It On': { sc: Object.assign({}, FOD, TIGHT, { refill: 1 }), keys: ['aftertaste'] },
      'Lob Lip': { sc: { shape: 'line', n: 6, hp: 1e5 }, keys: ['behind'] },
      'Battery Acid': { sc: { shell: 2, hp: 1e5, maxHp: 4000 }, keys: ['battery'] }, 'Projectile Vomit': { sc: { hp: 1e5 }, keys: ['stream'] },
      'Acid House': { sc: Object.assign({}, FOD, TIGHT, { refill: 1, hp: 30 }), keys: ['house'] },
      // Red Flagship
      'Overclocked': { sc: { hp: 1e5 }, keys: ['full'], chk: w => (w.w2.hTgt && wupDmgMul(w.w2.hTgt, { w }) > 1.2) || 'no charge ' + (w.w2.hold) },
      'Hard Interrupt': { sc: { hp: 1e5, maxHp: 400 }, keys: ['interrupt'], frames: 400 }, 'Static Cling': { sc: { hp: 1e5 }, keys: ['cling'], frames: 400 },
      'Screen Burn': { sc: { hp: 1e5 }, keys: ['burnin', 'ghostzap'] },
      'Critical Error': { sc: { hp: 6, refill: 1, n: 14, shape: 'tight' }, keys: ['pulse'] }, 'Cascade Failure': { sc: { hp: 6, refill: 1, n: 14, shape: 'tight' }, keys: ['pulse'] },
      'Rolling Blackout': { sc: { hp: 6, refill: 1, n: 16, shape: 'tight' }, keys: ['blackout'], frames: 420 },
      'Have You Tried Turning It Off': { sc: { hp: 1e5 }, keys: ['restart'], frames: 480 },
      'Dead Pixels': { sc: { hp: 1e5 }, keys: ['glitch'] }, 'Stuck Pixels': { sc: { hp: 1e5, free: 1 }, keys: ['pixelzap'] },
      'Packet Loss': { sc: { hp: 1e5 }, keys: ['spread'] }, 'Wrong Cable': { sc: { hp: 1e5, shape: 'tight' }, keys: [], anyKeys: ['tail', 'tailhit'] },
      'Blue Screen of Death': { sc: { hp: 1e5 }, keys: ['bsod'], frames: 360 }, 'Multi-Monitor Setup': { sc: { hp: 1e5 }, keys: ['cross'] },
      'Kernel Panic': { sc: { hp: 6, refill: 1, n: 14, shape: 'tight' }, keys: ['jump'] },
      // Nocturnal Emission
      'Extra Strength Snot': { sc: { hp: 1e5 }, keys: [], chk: w => w.w2.maxChill >= 0.6 || 'chill ' + w.w2.maxChill },
      'Stringy': { sc: { shape: 'orbit', n: 10, rot: 0.01, hp: 1e5 }, keys: ['strand'], frames: 420 },
      'Rising Damp': { sc: { hp: 1e5 }, keys: ['grew'] },
      'Snot Bubble': { sc: { hp: 1e5 }, keys: ['bubble', 'bubblesplat'], frames: 600 },
      'Bogged Down': { sc: { hp: 1e5 }, keys: ['stuck'], frames: 360 },
      'Bad Company': { sc: { hp: 1e5, shape: 'tight', n: 12 }, keys: ['conjoined'], frames: 420 },
      'Gag Reflex': { sc: { hp: 1e5 }, keys: ['stuck'], frames: 360, chk: w => w.w2.sawDaze || 'no dazed stuck enemy' },
      'Sneeze Guard': { sc: { hp: 1e5 }, keys: ['guard'] },
      'Snotwork': { sc: { shape: 'orbit', n: 10, rot: 0.01, hp: 1e5 }, keys: ['netsnare'], frames: 480, chk: w => w.w2.maxTraps <= 2 || 'traps ' + w.w2.maxTraps },
      'Spare Hankies': { sc: { hp: 1e5 }, keys: [], chk: w => w.w2.maxTraps > 2 || 'traps ' + w.w2.maxTraps, frames: 420 },
      'Twang': { sc: { shape: 'orbit', n: 10, rot: 0.01, hp: 1e5 }, keys: ['twang'], frames: 480 },
      'Bogey Man': { sc: { hp: 4, maxHp: 4, refill: 1, shape: 'tight', n: 14 }, keys: ['bogey'], frames: 420 },
      'Snot Ocean': { sc: { hp: 1e5 }, keys: ['ocean'], chk: w => w.s.area > 150 || 'area ' + w.s.area },
      'Superglue': { sc: { hp: 1e5 }, keys: ['glue'] }, 'Snotwork Everywhere': { sc: { hp: 1e5, swim: 1 }, keys: ['carpet'], frames: 420 },
      // Little Prick
      'Bleeding Heart': { sc: { hp: 1e5 }, keys: [], chk: w => w.w2.maxStacks > 3 || 'stacks ' + w.w2.maxStacks, frames: 420 },
      'Leaky': { sc: { hp: 1e5 }, keys: ['leak'], frames: 420 },
      'Open Wound': { sc: { hp: 60, refill: 1, shape: 'tight', n: 14 }, keys: ['woundpool'], frames: 420 },
      'Sewing Circle': { sc: { shape: 'far', n: 10, rot: 0.1, hp: 1e5 }, keys: ['circle'] },
      'Needlework': { sc: { shape: 'line', n: 8, hp: 1e5 }, keys: [], chk: w => w.w2.maxHit >= 3 || 'pierced ' + w.w2.maxHit },
      'Sutures': { sc: { shape: 'line', n: 8, hp: 1e5 }, keys: ['thread'] }, 'Reef Knot': { sc: { shape: 'line', n: 8, hp: 1e5 }, keys: ['knot'] },
      'Tattoo': { sc: { hp: 1e5 }, keys: ['tattoo'] },
      'Final Prick': { sc: { hp: 100, refill: 1, n: 14 }, keys: ['pinprick', 'ding'], chk: w => { const e = makeEnemy(def, 0, 0); e.maxHp = 100; e.hp = 10; const lo = wupDmgMul(e, { w }); e.hp = 100; const hi = wupDmgMul(e, { w }); return (lo === 2 && hi === 0.75) || 'mults ' + lo + ' ' + hi; } },
      'Next, Please': { sc: { hp: 30, refill: 1, n: 14 }, keys: ['next'] },
      'Terminal Clause': { sc: { hp: 70, hpJit: 40, maxHp: 100, refill: 1, n: 14 }, keys: ['clause'], frames: 900 },
      'Vaccination': { sc: { hp: 30, refill: 1, n: 14 }, keys: ['armed', 'immune'], frames: 420, status: 1 },
      'Exsanguinate': { sc: { hp: 600, refill: 1, shape: 'tight', n: 14 }, keys: ['exsang'], chk: w => w.w2.maxStacks > 3 || 'stacks ' + w.w2.maxStacks, frames: 420 },
      'Pin Cushion': { sc: { hp: 1e5 }, keys: ['volley'], chk: w => w.w2.maxProj >= 6 || 'needles ' + w.w2.maxProj },
      'Coup de Grace': { sc: { hp: 20, maxHp: 100, refill: 1, n: 14 }, keys: ['coup'] },
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
        w2s(w); w.w2.maxChill = 0; w.w2.maxTraps = 0; w.w2.maxStacks = 0; w.w2.maxHit = 0; w.w2.maxProj = 0; w.w2.sawDaze = false;
        let st = 0;
        run(Object.assign({}, x.sc, x.frames ? { frames: x.frames } : {}), f => {
          const wf = w.w2;
          for (const e of G.enemies) if (!e.dead) {
            if (e.chillAmt > wf.maxChill) wf.maxChill = e.chillAmt;
            const n = stacks(e); if (n > wf.maxStacks) wf.maxStacks = n;
            if (e.w2 && e.w2.stuckUntil > G.t && e.dazeT > G.t) wf.sawDaze = true;
          }
          const tr = G.zones.filter(z => z.life > 0.01 && z.src && z.src.w === w).length; if (tr > wf.maxTraps) wf.maxTraps = tr;
          let np = 0; for (const pr of G.proj) { if (pr.w === w) { np++; if ((pr.nHit || 0) > wf.maxHit) wf.maxHit = pr.nHit; } } if (np > wf.maxProj) wf.maxProj = np;
          if (cs.name === 'Sneeze Guard' && f % 30 === 0) { const z = G.zones.find(q => q.life > 0 && q.src && q.src.w === w); if (z) G.ebul.push({ x: z.x, y: z.y, vx: 0, vy: 0, dmg: 1, r: 5, color: '#ff0000', life: 7, from: 'Test bullets' }); }
          if (cs.name === 'Stuck Pixels') { const q = w.w2.px && w.w2.px[0], e = G.enemies.find(en => !en.dead && !en.egg); if (q && e) { e.x = q.x; e.y = q.y; } } // (an enemy wanders onto a dead pixel)
          if (x.status && !st && w.w2.fx.armed) { st = 1; pdef().snareT = G.t + 3; }
        });
        const F = fxs(w), missing = (x.keys || []).filter(k => !(F[k] > 0));
        if (x.anyKeys && !x.anyKeys.some(k => F[k] > 0)) missing.push(x.anyKeys.join('|'));
        if (missing.length) bad.push(`${cs.name} (${w.def.name} Lv ${cs.lv}): no ${missing.join(', ')}; fx ${JSON.stringify(F)}`);
        if (x.chk) { const c = x.chk(w); if (c !== true) bad.push(`${cs.name}: ${c}`); }
        if (!(dealt() > 0)) bad.push(`${cs.name}: dealt nothing`);
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
