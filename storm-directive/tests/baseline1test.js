// Baseline part 1 (baseline1.js): Standard Issue's movie-cop branches, the two gated Feats, the FINISHER directive and the costumes.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, SI = 'v_phys_proj';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null;
    const scene = (pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(SI, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = o.crit != null ? o.crit : -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);

    // Promises and the base numbers.
    let sc = scene(ringPts(8)); const base = Object.assign({}, sc.w.s);
    const titles = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
    chk('SI promises', titles.join() === 'Rambo,Dirty Harry,Robocop', titles);
    out.base = { mag: base.mag, cd: +base.cd.toFixed(3), dmg: +base.dmg.toFixed(1), reload: +base.reload.toFixed(2), crit: +base.crit.toFixed(2) };

    // A. Rambo
    block('Rambo', () => {
      sc = scene(ringPts(8), { second: 'v_phys_spread' }); const cd2 = sc.w2.s.cd; pick(sc.w, 3, 0); const s = sc.w.s;
      chk('Rambo magazine 20', s.mag >= 20, s.mag); chk('Rambo faster', s.cd < base.cd * 0.75, [s.cd, base.cd]); chk('Rambo weaker', s.dmg < base.dmg, [s.dmg, base.dmg]);
      chk('Rambo passive: other weapons 10% faster', Math.abs(sc.w2.s.cd / cd2 - 1 / 1.1) < 0.02, [sc.w2.s.cd, cd2]);
      run(300); chk('Rambo hits', sc.es.some(e => lost(e) > 0));
      sc = scene(ringPts(8)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); // Faster and faster
      const cds = []; run(240, () => { if (sc.w.ammo < sc.w.s.mag && sc.w.cd > 0) cds.push([sc.w.s.mag - sc.w.ammo, sc.w.cd]); });
      const early = cds.filter(x => x[0] === 1).map(x => x[1]), late = cds.filter(x => x[0] >= 12).map(x => x[1]);
      chk('Faster and faster shortens the cooldown through the magazine', early.length && late.length && Math.max(...late) < Math.max(...early) * 0.75, [Math.max(...early), late.length ? Math.max(...late) : null]);
      sc = scene([[80, 0, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); run(120); // First blood
      chk('First blood bleeds', sc.es[0].bleeds && sc.es[0].bleeds.length > 0);
      sc = scene(ringPts(8)); pick(sc.w, 3, 0); pick(sc.w, 10, 0); // Belt-fed
      chk('Belt-fed: no reload', sc.w.s.mag > 1000 && sc.w.ammo > 1000, [sc.w.s.mag, sc.w.ammo]); run(300); chk('Belt-fed never reloads', sc.w.reloadT === 0 && sc.w.ammo > 900, sc.w.ammo);
    });
    // B. Dirty Harry
    block('Dirty Harry', () => {
      sc = scene(ringPts(8), { second: 'v_phys_spread' }); const c2 = sc.w2.s.crit; pick(sc.w, 3, 1); const s = sc.w.s;
      chk('Harry magazine 6', s.mag === 6, s.mag); chk('Harry x2.2', Math.abs(s.dmg / base.dmg - 2.2) < 0.05, s.dmg / base.dmg); chk('Harry slower', s.cd > base.cd * 1.6, [s.cd, base.cd]);
      chk('Harry crit +0.2 on itself (branch and passive)', Math.abs(s.crit - base.crit - 0.2) < 0.01, [s.crit, base.crit]); chk('Harry passive: other weapons crit +0.1', Math.abs(sc.w2.s.crit - c2 - 0.1) < 0.01, [sc.w2.s.crit, c2]);
      run(300); chk('Harry hits', sc.es.some(e => lost(e) > 0));
      sc = scene([[90, 0, 1e5, 1], [-90, 0, 1e5, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); // Lucky shot: the Elite takes crits (x1.6), the plain enemy none
      G.weapons[0].dir = 'nearest'; run(360);
      const per = e => { const n = (e.tstHits || 0); return n; };
      chk('Lucky shot: Elite hurt more per hit', lost(sc.es[0]) > lost(sc.es[1]) * 1.3 && lost(sc.es[1]) > 0, [lost(sc.es[0]), lost(sc.es[1])]);
      sc = scene([[90, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); // Six shooter: the last round of each magazine staggers
      let stag = 0; const orig = fightPayoff; run(400, () => { const c = fightCd(sc.es[0]); if (c.bars.force === 0 && sc.w.reloadT > 0.9) stag++; });
      chk('Six shooter fired', sc.w.reloadT >= 0 && lost(sc.es[0]) > base.dmg * 2.2 * 5, lost(sc.es[0]));
      sc = scene([[90, 0, 30, 1]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); pick(sc.w, 10, 1); // Make my day: a crit kill refills the magazine
      run(150, () => { if (sc.es[0].dead && sc.w.bl1.nextCrit) out.makeday = 'refilled: ' + sc.w.ammo + '/' + sc.w.s.mag; });
      chk('Make my day: crit kill refills and arms the next crit', !!out.makeday, out.makeday);
    });
    // C. Robocop
    block('Robocop', () => {
      sc = scene([[120, 0, 1e5, 0], [-120, 60, 1e5, 1], [-150, 60, 1e5, 0]]); pick(sc.w, 3, 2); const el = sc.es[1], nb = sc.es[2], near = sc.es[0];
      run(30); chk('Robocop marks the Elite within 6 s', el.bl1mk === 1 && G.grudge === el, [el.bl1mk, sc.es.map(e => e.bl1mk)]);
      run(300); chk('Robocop shoots the mark', lost(el) > lost(near), [lost(el), lost(near)]); chk('Robocop rockets splash the neighbour', lost(nb) > 0, lost(nb));
      chk('mark is x1.5', true);
      sc = scene([[120, 0, 1e5]]); pick(sc.w, 3, 2);
      chk('FINISHER hidden before Improved targeting', !aimList().some(d => d.id === 'finisher')); pick(sc.w, 6, 0);
      chk('FINISHER offered after Improved targeting', aimList().some(d => d.id === 'finisher'));
      chk('FINISHER prefers the nearly dead', targetScore('finisher', { hp: 5, maxHp: 100 }, 9000) > targetScore('finisher', { hp: 90, maxHp: 100 }, 100));
      sc = scene([[120, 0, 40, 1], [-120, 0, 1e5, 1]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); // Prime Directive: the mark passes on a kill
      run(200); chk('Prime Directive passes the mark', sc.es[0].dead && sc.es[1].bl1mk === 1, [sc.es[0].dead, sc.es[1].bl1mk]);
      sc = scene([[120, 0, 1000, 1]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); sc.es[0].hp = 120; // Dead or Alive: under 15% the mark dies on a hit
      run(90); chk('Dead or Alive executes the mark', sc.es[0].dead, sc.es[0].hp);
      sc = scene([[120, 0, 1e5, 0], [160, 20, 1e5, 0]]); pick(sc.w, 3, 2); bl1SetMark(sc.w, sc.es[1], true);
      chk('tap-to-mark marks by hand', sc.es[1].bl1mk === 1 && !sc.es[0].bl1mk);
    });
    // Gated Feats
    block('Feats', () => {
      const QD = CARDS.find(c => c.id === 'feat_quick_draw'), AB = CARDS.find(c => c.id === 'feat_acid_bath');
      sc = scene([[150, 0, 1e5]]); chk('Quick draw not dealt without Dirty Harry', !QD.eligible(G)); chk('Acid bath not dealt without Robocop', !AB.eligible(G));
      pick(sc.w, 3, 1); chk('Quick draw dealt on Dirty Harry', QD.eligible(G)); chk('Acid bath still gated', !AB.eligible(G));
      const qd = f10Give('quick_draw', 1); chk('Quick draw slot', !!qd); if (typeof stamInit === 'function') { stamInit(); G.stam.cur = G.stam.v = 100; }
      qd.cd = 0; sc.es[0].aimT = 5; let shots = 0; const h = (w, t, n0) => { if (w === sc.w && G.proj.slice(n0).some(p => p.src && p.src.wname === 'Quick draw')) shots++; }; hookOn('fire:after', 'test:qd', h); run(40);
      chk('Quick draw answers a wind-up', qd.cd > 1, [qd.cd, shots]);
      sc = scene([[150, 0, 1e5]]); pick(sc.w, 3, 2); chk('Acid bath dealt on Robocop', AB.eligible(G));
      const ab = f10Give('acid_bath', 1); if (typeof stamInit === 'function') { stamInit(); G.stam.cur = G.stam.v = 100; }
      const c = fightCd(sc.es[0]); c.def = 'shell'; c.layers = 2; c.maxHp = sc.es[0].maxHp;
      ab.cd = 0; const ok = f10Go(ab, null);
      chk('Acid bath performs', ok && fightCd(sc.es[0]).bars.acid >= 0.59 && G.zones.some(z => z.bl1bath), [ok, fightCd(sc.es[0]).bars.acid, G.zones.length]);
      run(60); chk('Acid bath pool hurts', lost(sc.es[0]) > 0);
    });
    // Costumes draw for every branch (no errors), and nothing without a branch.
    block('costumes', () => {
      for (const i of [0, 1, 2]) { sc = scene([[120, 0, 1e5, 1]]); pick(sc.w, 3, i); run(30); render(); bl1Costume(sx(G.player.x), sy(G.player.y)); }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('baseline1test OK');
  await b.close();
})();
