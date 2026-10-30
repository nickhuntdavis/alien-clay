// Alpha part 1 (alpha1.js): Red Flagship's Grindset / Life Coach / Crypto Bro and Soulmate Signal's Wingman / Situationship / Power Couple.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, RF = 'v_shock_beam', SS = 's_twin';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null, MOVE = false, FREE = false;
    hookOn('tick', 'test:move', () => { if (G && G.player) { G.player.vx = MOVE ? 120 : 0; G.player.vy = 0; } });
    const scene = (wid, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = o.t != null ? o.t : 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'alpha' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(wid, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      if (typeof stamInit === 'function') { stamInit(); G.stam.cur = 10; }
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; G.ebul.length = 0; MOVE = false;
      PIN = o.noPin ? null : { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; e.px = e.x; e.py = e.y; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (!FREE) for (const e of G.enemies) if (e.px != null) { e.x = e.px; e.y = e.py; e.kx = e.ky = 0; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const fx = (w, k) => (w.al1 && w.al1.fx && w.al1.fx[k]) || 0;

    // ---- the sets are Alpha's, and other samples keep the shared ones
    block('sets', () => {
      for (const [wid, names, shared] of [[RF, 'Grindset,Life Coach,Crypto Bro', ['Overclocked', 'Critical Error', 'Dead Pixels']], [SS, 'Wingman,Situationship,Power Couple', null]]) {
        let sc = scene(wid, [[100, 0]]); const t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
        chk(wid + ' Alpha promises', t.join() === names, t);
        sc = scene(wid, [[100, 0]], { sample: 'baseline' }); const t2 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
        const want = ['A', 'B', 'C'].map(k => wupSpecFor(wid, 'baseline')[k].name).join();
        chk(wid + ' Baseline keeps the shared branches', t2.join() === want && t2.join() !== names, t2);
        out[wid + ' shared'] = t2.join();
        sc = scene(wid, [[100, 0]], { sample: 'alpha' }); chk(wid + ' 3 Lv 9 masteries', genLoot({ kind: 'fork', w: sc.w, lv: 10 }).length === 3);
      }
    });
    // every card text is a placeholder, and the names are the drafted ones
    block('copy', () => {
      const names = { [RF]: ['4am Club', 'Cold Plunge', 'Rise and Grind', 'Accountability Partner', 'Vision Board', 'Toxic Positivity', 'HODL', 'Rug Pull', 'NFT', 'Sigma', 'Breakthrough', 'To the Moon'],
        [SS]: ['Hype Man', 'Bro Code', 'Pull Up', 'Ghosting', 'Breadcrumbing', 'Red Flag', 'Matching Outfits', 'Couples Therapy', 'PDA', 'Ride or Die', "It's Complicated", 'Soulmates'] };
      for (const wid of [RF, SS]) {
        const S = wupSpecFor(wid, 'alpha'), have = [];
        for (const k of 'ABC') { have.push(...S[k].lv6.map(c => c.name), S[k].wild.name); chk(wid + k + ' texts are placeholders', /^TODO_COPY:/.test(S[k].lv3.desc) && /^TODO_COPY:/.test(S[k].tag) && /^TODO_COPY:/.test(S[k].costs)); }
        have.push(...S.lv10.map(c => c.name)); chk(wid + ' card names', have.join() === names[wid].join(), have);
        for (const c of S.lv10) chk(wid + ' ' + c.name + ' placeholder', /^TODO_COPY:/.test(c.desc));
      }
    });

    // ================================================================ RED FLAGSHIP
    // A. Grindset
    block('Grindset', () => {
      let sc = scene(RF, ringPts(8)); const s0 = Object.assign({}, sc.w.s); pick(sc.w, 3, 0); const f = sc.w.al1;
      MOVE = true; run(250); chk('Grindset climbs while swimming', f.grind >= 0.99, f.grind);
      const e = sc.es[0], m = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e, {}), 1); chk('Grindset +60% at full climb', Math.abs(m - 1.6) < 0.02, m);
      MOVE = false; G.player.vx = G.player.vy = 0; run(40); chk('Grindset holds a moment', f.grind > 0.5, f.grind); run(40); chk('Grindset resets after 1 s still', f.grind === 0, f.grind);
      run(120); chk('Grindset hits', sc.es.some(e => lost(e) > 0));
      // 4am Club: x2 in the first 10 s of a minute (no wave in this scene)
      sc = scene(RF, ringPts(4), { t: 120 }); pick(sc.w, 3, 0); pick(sc.w, 6, 0); const d1 = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, sc.es[0], {}), 1);
      G.t = 140; const d2 = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, sc.es[0], {}), 1); chk('4am Club doubles early', Math.abs(d1 / d2 - 2) < 0.01, [d1, d2]);
      // Cold Plunge
      sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); run(60); chk('Cold Plunge slows the held target', sc.es[0].chillAmt >= 0.4 && sc.es[0].chill > 0, [sc.es[0].chillAmt, sc.es[0].chill]);
      // Rise and Grind
      sc = scene(RF, [[100, 0], [100, 4]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); run(200); chk('Rise and Grind leaves trails that zap', sc.w.al1.ghosts && sc.w.al1.ghosts.length > 0 && fx(sc.w, 'trail') > 0, [fx(sc.w, 'trail')]);
      // Sigma
      sc = scene(RF, [[100, 0], [140, 90]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); MOVE = true; run(300);
      chk('Sigma forks at full climb', fx(sc.w, 'fork') > 0 && lost(sc.es[1]) > 0, [fx(sc.w, 'fork'), lost(sc.es[1])]);
    });
    // B. Life Coach
    block('Life Coach', () => {
      let sc = scene(RF, [[100, 0], [-150, 0]], { second: 'v_phys_spread' }); const cd0 = (() => { AIMAT.w = sc.w2; return rateBonus(); })();
      pick(sc.w, 3, 1); run(20);
      const held = sc.w.al1.hTgt; chk('Life Coach holds a target', !!held, held && held.x);
      const other = sc.es.find(e => e !== held), k1 = hookMul('dmgMul', held, { w: sc.w2 }), k2 = hookMul('dmgMul', other, { w: sc.w2 });
      chk('Life Coach: others hit the held target 20% harder', Math.abs(k1 / k2 - 1.2) < 0.01, [k1, k2]);
      chk('Life Coach: the beam itself is not boosted', Math.abs(hookMul('dmgMul', held, { w: sc.w }) / k2 - 1) < 0.01);
      AIMAT.w = sc.w2; const cd1 = rateBonus(); chk('Life Coach: others fire 15% faster', Math.abs(cd1 / cd0 - 1.15) < 0.01, [cd1, cd0]);
      AIMAT.w = sc.w; chk('Life Coach: the beam is not hasted', Math.abs(rateBonus() / cd0 - 1) < 0.01);
      run(200); chk('Life Coach beam hits', lost(held) > 0);
      // Accountability Partner
      sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); run(260); chk('Accountability Partner heavy hits', fx(sc.w, 'partner') >= 1, fx(sc.w, 'partner'));
      // Vision Board
      sc = scene(RF, [[100, 0]]); const r0 = sc.w.s.range; pick(sc.w, 3, 1); pick(sc.w, 6, 1); chk('Vision Board reach +40%', Math.abs(sc.w.s.range / r0 - 1.4) < 0.01, [sc.w.s.range, r0]);
      // Toxic Positivity
      sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); G.player.hp = 5e5; run(60); chk('Toxic Positivity heals while holding', G.player.hp > 5e5 + 1000, G.player.hp);
      // Breakthrough: the held target dies, the next one starts with the bonus stacked
      sc = scene(RF, [[100, 0, 30], [-120, 0, 1e5]], { second: 'v_phys_spread' }); pick(sc.w, 3, 1); pick(sc.w, 10, 1);
      run(200); chk('Breakthrough: the kill stacks', sc.es[0].dead && sc.w.al1.stack >= 1, [sc.es[0].dead, sc.w.al1.stack]);
      run(30); const nh = sc.w.al1.hTgt; chk('Breakthrough: next target carries the stack', nh === sc.es[1] && al1CoachN(sc.w) >= 2, [al1CoachN(sc.w), !!nh]);
      chk('Breakthrough: stronger bonus', hookMul('dmgMul', sc.es[1], { w: sc.w2 }) >= 1.39, hookMul('dmgMul', sc.es[1], { w: sc.w2 }));
    });
    // C. Crypto Bro
    block('Crypto Bro', () => {
      const bursts = []; AL1.onPumpBurst.push((w, e) => bursts.push(e));
      let sc = scene(RF, [[100, 0, 120], [100, 70, 1e5], [120, -70, 1e5], [600, 0, 1e5]]); pick(sc.w, 3, 2);
      run(40); chk('Crypto Bro pumps the target', sc.es[0].al1pump > 0, sc.es[0].al1pump);
      const a = sc.es[0]; run(400);
      chk('Crypto Bro: the pump bursts on neighbours when it dies', a.dead && lost(sc.es[1]) > 0 && lost(sc.es[2]) > 0 && fx(sc.w, 'burst') >= 1, [a.dead, lost(sc.es[1]), lost(sc.es[2]), fx(sc.w, 'burst')]);
      chk('Crypto Bro: the far enemy is untouched', lost(sc.es[3]) === 0, lost(sc.es[3]));
      chk('AL1.onPumpBurst listener called (w, enemy)', bursts.length >= 1 && bursts[0] === a, bursts.length);
      // fade, and HODL
      sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 2); const e = sc.es[0]; al1PumpAdd(sc.w, e, 100); e.al1pLast = G.t - 5; const p0 = e.al1pump; al1CrTick(sc.w, 1); chk('an unfed pump fades', e.al1pump < p0, [e.al1pump, p0]);
      sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); const e2 = sc.es[0]; al1PumpAdd(sc.w, e2, 100); e2.al1pLast = G.t - 5; const q0 = e2.al1pump; al1CrTick(sc.w, 1); chk('HODL: the pump never fades', e2.al1pump === q0, [e2.al1pump, q0]);
      // HODL burst grows with the hold
      sc = scene(RF, [[0, 0], [60, 0], [-60, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0);
      const h = sc.es[0]; al1PumpAdd(sc.w, h, 100); h.al1pt0 = G.t; al1Burst(sc.w, h, 0); const l1 = lost(sc.es[1]); sc.es[1].hp = sc.es[1].maxHp;
      al1PumpAdd(sc.w, h, 100); h.al1pt0 = G.t - 10; al1Burst(sc.w, h, 0); chk('HODL: the burst grows with the hold', lost(sc.es[1]) > l1 * 1.5, [lost(sc.es[1]), l1]);
      // Rug Pull: switching dumps the old pump
      sc = scene(RF, [[100, 0], [100, 60], [-200, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); const n0 = bursts.length;
      run(30); const cur = sc.w.al1.hTgt; chk('Rug Pull: a target is held and pumped', cur && cur.al1pump > 0);
      const other = sc.es.find(x => x !== cur); al1Hold(sc.w, other); chk('Rug Pull: switching dumps the pump', bursts.length > n0 && cur.al1pump === 0 && fx(sc.w, 'rug') >= 1, [bursts.length - n0, cur.al1pump]);
      // NFT: a pumped kill drops a token that pays stamina
      sc = scene(RF, [[100, 0, 60]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); const st0 = G.stam.cur; run(200);
      chk('NFT: a pumped kill drops a token', fx(sc.w, 'token') >= 1, fx(sc.w, 'token')); G.player.x = PIN.x; run(240);
      chk('NFT: the token pays out stamina', fx(sc.w, 'tokenpaid') >= 1 && G.stam.cur > st0, [G.stam.cur, st0]);
      // To the Moon: the burst chains to the next pumped enemy
      sc = scene(RF, [[0, 0], [60, 0], [200, 0], [260, 0], [800, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2);
      const A = sc.es[0], B = sc.es[2]; al1PumpAdd(sc.w, A, 100); al1PumpAdd(sc.w, B, 100); const m0 = fx(sc.w, 'moon'); al1Burst(sc.w, A, 0);
      chk('To the Moon: chains to the next pumped enemy', B.al1pump === 0 && fx(sc.w, 'moon') > m0 && lost(sc.es[3]) > 0, [B.al1pump, fx(sc.w, 'moon'), lost(sc.es[3])]);
      AL1.onPumpBurst.length = 0;
    });

    // ================================================================ SOULMATE SIGNAL
    const ssScene = (pts, o) => { const sc = scene(SS, pts, o); run(5); return sc; };
    block('Wingman', () => {
      let sc = ssScene([[300, 0, 1e5]]); pick(sc.w, 3, 0); run(10); let T = sc.w.twins[0]; chk('twin exists', !!T);
      const shooter = sc.es[0]; G.ebul.push({ x: T.x + 70, y: T.y + 40, vx: 0, vy: 200, dmg: 50, r: 5, color: '#f00', life: 7, from: 'x', owner: shooter });
      const hp0 = G.player.hp; run(90); chk('Wingman draws fire into the twin', G.ebul.every(b => b.dead) && fx(sc.w, 'drawn') >= 1, [G.ebul.length, fx(sc.w, 'drawn')]); chk('nobody hurt', G.player.hp >= hp0);
      // Hype Man
      sc = ssScene([[300, 0, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); run(10); T = sc.w.twins[0]; const sh = sc.es[0];
      G.ebul.push({ x: T.x + 60, y: T.y, vx: 0, vy: 40, dmg: 50, r: 5, color: '#f00', life: 7, from: 'x', owner: sh }); run(20);
      chk('Hype Man: the shooter is Charged', sh.chargeT > G.t, sh.chargeT);
      // Bro Code
      sc = ssScene([[300, 0, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); run(10); T = sc.w.twins[0]; const tx = T.x, ty = T.y;
      hookRun('hurt', 10, null, 0); chk('Bro Code: you swap with the twin', Math.hypot(G.player.x - tx, G.player.y - ty) < 1 && fx(sc.w, 'bro') === 1, [G.player.x, tx]);
      const px = G.player.x; hookRun('hurt', 10, null, 0); chk('Bro Code: 6 s cooldown', G.player.x === px && fx(sc.w, 'bro') === 1);
      // Pull Up
      sc = ssScene([[300, 0, 1e5], [-300, 100, 1e5, 1]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); run(60);
      const elite = sc.es[1]; chk('Pull Up: the twin dashes to the Elite', sc.w.al1.pu.on && fx(sc.w, 'pullup') >= 1, sc.w.al1.pu.on);
      run(120); const T2 = sc.w.twins[0]; chk('Pull Up: it has moved towards the Elite', Math.hypot(T2.x - elite.x, T2.y - elite.y) < 260, Math.hypot(T2.x - elite.x, T2.y - elite.y));
      // Ride or Die
      sc = ssScene([[200, 0, 1e5], [-200, 0, 1e5]], { second: 's_tesla' }); pick(sc.w, 3, 0); pick(sc.w, 10, 0); run(5);
      const tes = sc.w2; const ws0 = G.stats.dmg ? JSON.stringify(G.stats.dmg).length : 0; fireWeapon(tes, sc.es[0]);
      chk('Ride or Die: the twin fires Unwanted Contact too', fx(sc.w, 'ride') >= 1, fx(sc.w, 'ride'));
    });
    block('Situationship', () => {
      let sc = ssScene([[250, 0, 1e5], [-250, 0, 1e5]]); pick(sc.w, 3, 1); const f = sc.w.al1;
      const e0 = sc.es[0], m = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e0, { wname: 'Twin Telepathy' }), 1); chk('Situationship x2.2', Math.abs(m - 2.2) < 0.01, m);
      let on = 0, off = 0; run(240, () => { if (twinSegs(sc.w).length) on++; else off++; });
      chk('Situationship flickers (on and off)', on > 60 && off > 60, [on, off]); chk('Situationship hits when on', sc.es.some(e => lost(e) > 0));
      // Ghosting
      sc = ssScene([[120, 0, 1e5], [-120, 40, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); let gone = 0, back = 0; run(260, () => { if (!sc.w.twins.length) gone++; else back++; });
      chk('Ghosting: the twin vanishes while off, and reappears', gone > 40 && back > 40 && fx(sc.w, 'ghost') >= 1, [gone, back, fx(sc.w, 'ghost')]);
      // Breadcrumbing
      sc = ssScene([[250, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); run(200); chk('Breadcrumbing leaves crumbs', fx(sc.w, 'crumbs') >= 1 && G.zones.some(z => z.src && z.src.wname === 'Breadcrumbs'), fx(sc.w, 'crumbs'));
      // Red Flag
      sc = ssScene([[250, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); const pr = AL1.redFlagP; AL1.redFlagP = 1; const hp0 = G.player.hp; run(260); AL1.redFlagP = pr;
      chk('Red Flag stings you a little', fx(sc.w, 'redflag') >= 1 && G.player.hp < hp0 && G.player.hp > 0, [fx(sc.w, 'redflag'), G.player.hp]);
      // It's Complicated
      sc = ssScene(ringPts(10)); pick(sc.w, 3, 1); pick(sc.w, 10, 1); const c0 = sc.w.al1.cmp || 0; for (const e of sc.es) { e.hp = 1; damageEnemy(e, 50, { elem: 'phys', noCrit: true }); }
      chk("It's Complicated: the flicker speeds up as enemies die", sc.w.al1.cmp > c0, sc.w.al1.cmp);
    });
    block('Power Couple', () => {
      let sc = ssScene([[250, 0, 1e5]], { second: 'v_arcane_proj' }); pick(sc.w, 3, 2); const T = sc.w.twins[0], p = G.player, e = sc.es[0];
      const far = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e, {}), 1); const pos = { x: p.x, y: p.y }; p.x = T.x + 10; p.y = T.y; const near = sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e, {}), 1); p.x = pos.x; p.y = pos.y;
      chk('Power Couple: +60% at the twin, nothing far away', far < 1.05 && near > 1.5 && near <= 1.61, [far, near]);
      // Matching Outfits
      sc = ssScene([[200, 0, 1e5], [-200, 0, 1e5]], { second: 'v_arcane_proj' }); pick(sc.w, 3, 2); pick(sc.w, 6, 0); run(300);
      chk("Matching Outfits: the twin's hits carry your other weapon's status (Bleed)", fx(sc.w, 'outfitsA') >= 1 && sc.es.some(e => e.bleeds && e.bleeds.length > 0), [fx(sc.w, 'outfitsA')]);
      sc = ssScene([[90, 0, 1e5]], { second: 'v_phys_spread' }); pick(sc.w, 3, 2); pick(sc.w, 6, 0); run(5); sc.es[0].chargeT = 0; hookRun('proc', sc.es[0], 5, { w: sc.w2 }, 5); chk("Matching Outfits: your hits Charge", fx(sc.w, 'outfitsB') >= 1 && sc.es[0].chargeT > G.t, [fx(sc.w, 'outfitsB'), sc.es[0].chargeT]);
      // Couples Therapy
      sc = ssScene([[250, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); PIN = null; G.player.hp = 5e5; const hp = G.player.hp; for (let i = 0; i < 3; i++) { sc.w.anchor = { x: G.player.x + 5, y: G.player.y }; run(1); }
      chk('Couples Therapy heals 2% on touching the twin', G.player.hp > hp + 1e4 * 0.9 && fx(sc.w, 'therapy') >= 1, [G.player.hp - hp, fx(sc.w, 'therapy')]);
      // PDA
      sc = ssScene([[250, 0, 1e5], [250, 30, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); PIN = null; for (let i = 0; i < 3; i++) { sc.w.anchor = { x: G.player.x + 5, y: G.player.y }; run(1); }
      chk('PDA: swimming through the twin sends a Force pulse', fx(sc.w, 'pda') >= 1, fx(sc.w, 'pda'));
      // Soulmates
      sc = ssScene([[250, 0, 1e5], [200, 80, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); run(5);
      chk('Soulmates: a second twin and a triangle tether', sc.w.twins.length === 2 && twinSegs(sc.w).length === 3, [sc.w.twins.length, twinSegs(sc.w).length]);
    });

    // ================================================================ a 300-frame ring run for every branch, with its cards stacked
    block('ring runs', () => {
      for (const [wid, second] of [[RF, 'v_phys_spread'], [SS, 's_tesla']]) for (const i of [0, 1, 2]) {
        const sc = scene(wid, ringPts(10).concat([[330, 0, 1e5, 1]]), { second }); pick(sc.w, 3, i); pick(sc.w, 6, 0); pick(sc.w, 6, 1);
        const S = wupSpecFor(wid, 'alpha'); S[['A', 'B', 'C'][i]].wild.apply(sc.w); S.lv10[i].apply(sc.w); recomputeAll();
        MOVE = i === 0; run(300); MOVE = false;
        chk(wid + ' ' + 'ABC'[i] + ' ring run hits', sc.es.some(e => lost(e) > 0)); out[wid + 'ABC'[i]] = Math.round(sc.es.reduce((a, e) => a + lost(e), 0));
      }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('alpha1test OK');
  await b.close();
})();
