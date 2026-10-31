// Baseline part 1 (baseline1.js, samplebranch.js): the movie-cop SAMPLE branches (Lv 5 / 20 / 25), acting on every weapon held;
// Standard Issue's own branches are back; the gated Feats, the FINISHER directive and the costumes.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, SI = 'v_phys_proj', MG = 'v_phys_spread';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null;
    const scene = (pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.s10 = { id: 'baseline', strain: 1, run: 1, ev: 0, shiftT: 12, shiftI: 0, trailT: 0, low: false };
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(o.first || SI, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = o.crit != null ? o.crit : -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    // Take sample branch cards in order: [branch index, lv6 index or null, mastery index or null].
    const take = (...ix) => { const lvs = [3, 6, 10], got = []; ix.forEach((i, s) => { if (i == null) return; const cs = genLoot({ kind: 'fork', v10ok: true, smb: { lv: lvs[s] } }); if (!cs[i]) throw new Error('no sample card ' + lvs[s] + '/' + i); cs[i].apply(); got.push(cs[i].title); }); return got; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);

    // The screens: the level gates, the titles, Standard Issue's own branches.
    block('gates', () => {
      let sc = scene(ringPts(4)); const base = Object.assign({}, sc.w.s), base2 = null; void base2;
      out.base = { mag: base.mag, cd: +base.cd.toFixed(3), dmg: +base.dmg.toFixed(1), reload: +base.reload.toFixed(2), crit: +base.crit.toFixed(2) };
      const si = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
      chk('Standard Issue has its own branches again', si.join() === 'Ricochet Brain,Through and Through,Marked for Bonking', si);
      const t3 = genLoot({ kind: 'fork', smb: { lv: 3 } }).map(c => c.title);
      chk('sample branches', t3.join() === 'Rambo,Dirty Harry,Robocop', t3);
      SMB.force = true; const q = () => G.lootQueue.filter(x => x.smb).map(x => x.smb.lv);
      const gate = HOOKS.tick.find(h => h.name === 'samplebranch:gate').fn, hookSafe = (ev, dt) => gate(dt); // (only the gate: the director would open the screen and empty the queue)
      G.level = 4; hookSafe('tick', 1 / 60); chk('nothing before Lv 5', !q().length, q());
      G.level = 5; hookSafe('tick', 1 / 60); hookSafe('tick', 1 / 60); chk('the branch screen at Lv 5, once', q().join() === '3', q());
      G.lootQueue = []; take(0); G.level = 19; hookSafe('tick', 1 / 60); chk('nothing at Lv 19', !q().length, q());
      G.level = 20; hookSafe('tick', 1 / 60); chk('the branch card at Lv 20', q().join() === '6', q());
      G.lootQueue = []; take(null, 0); G.level = 25; hookSafe('tick', 1 / 60); chk('the mastery at Lv 25', q().join() === '10', q());
      G.lootQueue = []; take(null, null, 0); G.level = 30; hookSafe('tick', 1 / 60); chk('nothing after the mastery', !q().length, q());
      chk('a taken step deals no cards', !genLoot({ kind: 'fork', smb: { lv: 3 } }).length);
      sc = scene([]); G.s10 = { id: 'alpha' }; G.level = 5; hookSafe('tick', 1 / 60); chk('other samples have no sample branch', !q().length, q());
      G.s10 = null; hookSafe('tick', 1 / 60); chk('no sample, no branch', !q().length, q());
      SMB.force = false;
      sc = scene([]); take(1); const t6 = genLoot({ kind: 'fork', smb: { lv: 6 } }).map(c => c.title + '/' + c.tag);
      chk('Dirty Harry Lv 20 cards', t6.join() === 'Lucky shot/BRANCH,The Sixth Round/BRANCH,Feeling Lucky?/WILDCARD', t6);
      chk('a title for the screen', draftTitle({ kind: 'fork', smb: { lv: 6 } })[0] === 'BASELINE: DIRTY HARRY', draftTitle({ kind: 'fork', smb: { lv: 6 } }));
    });
    // A. Rambo: every weapon
    block('Rambo', () => {
      let sc = scene(ringPts(8), { second: MG }); const s1 = Object.assign({}, sc.w.s), s2 = Object.assign({}, sc.w2.s); take(0);
      chk('Rambo: Standard Issue magazine two thirds bigger', sc.w.s.mag === Math.ceil(s1.mag * 5 / 3), [sc.w.s.mag, s1.mag]);
      for (const [nm, w, s0] of [['Standard Issue', sc.w, s1], ['Shotgun', sc.w2, s2]]) {
        chk('Rambo: ' + nm + ' 25% faster', Math.abs(w.s.cd / s0.cd - 0.8) < 0.01, [w.s.cd, s0.cd]);
        chk('Rambo: ' + nm + ' 15% weaker', Math.abs(w.s.dmg / s0.dmg - 0.85) < 0.01, [w.s.dmg, s0.dmg]);
        if (s0.mag > 1) chk('Rambo: ' + nm + ' reloads quicker', w.s.reload < s0.reload * 0.7, [w.s.reload, s0.reload]);
      }
      run(300); chk('Rambo hits', sc.es.some(e => lost(e) > 0));
      sc = scene(ringPts(8)); take(0, 0); // Faster and faster
      const cds = []; run(240, () => { if (sc.w.ammo < sc.w.s.mag && sc.w.cd > 0) cds.push([sc.w.s.mag - sc.w.ammo, sc.w.cd]); });
      const early = cds.filter(x => x[0] === 1).map(x => x[1]), late = cds.filter(x => x[0] >= 12).map(x => x[1]);
      chk('Faster and faster shortens the cooldown through the magazine', early.length && late.length && Math.max(...late) < Math.max(...early) * 0.75, [Math.max(...early), late.length ? Math.max(...late) : null]);
      sc = scene([[80, 0, 1e5]], { first: MG }); take(0, 1); run(120); // First blood, from the Shotgun
      chk('First blood bleeds from any weapon', sc.es[0].bleeds && sc.es[0].bleeds.length > 0);
      sc = scene(ringPts(8), { second: MG }); take(0, 0, 0); // Belt-fed: both weapons
      chk('Belt-fed: no reload', sc.w.s.mag > 1000 && sc.w.ammo > 1000 && (sc.w2.s.mag <= 1 || sc.w2.s.mag > 1000), [sc.w.s.mag, sc.w.ammo, sc.w2.s.mag]); run(300); chk('Belt-fed never reloads', sc.w.reloadT === 0 && sc.w.ammo > 900, sc.w.ammo);
    });
    // B. Dirty Harry: every weapon
    block('Dirty Harry', () => {
      let sc = scene(ringPts(8), { second: MG }); const s1 = Object.assign({}, sc.w.s), s2 = Object.assign({}, sc.w2.s); take(1);
      for (const [nm, w, s0] of [['Standard Issue', sc.w, s1], ['Shotgun', sc.w2, s2]]) {
        chk('Harry: ' + nm + ' x2.2', Math.abs(w.s.dmg / s0.dmg - 2.2) < 0.05, w.s.dmg / s0.dmg);
        chk('Harry: ' + nm + ' half the rate', Math.abs(w.s.cd / s0.cd - 2) < 0.02, [w.s.cd, s0.cd]);
        chk('Harry: ' + nm + ' crit +0.1', Math.abs(w.s.crit - s0.crit - 0.1) < 0.01, [w.s.crit, s0.crit]);
        chk('Harry: ' + nm + ' range +120', Math.abs(w.s.range - s0.range - 120) < 1, [w.s.range, s0.range]);
      }
      run(300); chk('Harry hits', sc.es.some(e => lost(e) > 0));
      sc = scene([[90, 0, 1e5, 1], [-90, 0, 1e5, 0]]); take(1, 0); // Lucky shot: the Elite takes crits (x1.6), the plain enemy none
      G.weapons[0].dir = 'nearest'; run(360);
      chk('Lucky shot: Elite hurt more per hit', lost(sc.es[0]) > lost(sc.es[1]) * 1.3 && lost(sc.es[1]) > 0, [lost(sc.es[0]), lost(sc.es[1])]);
      sc = scene([[90, 0, 1e5]]); take(1, 1); // The Sixth Round
      run(400); chk('Sixth Round fired', lost(sc.es[0]) > out.base.dmg * 2.2 * 5, lost(sc.es[0]));
      sc = scene([[90, 0, 30, 1]]); take(1, 0, 1); // Made Your Day: a crit kill refills the magazine
      run(150, () => { if (sc.es[0].dead && sc.w.bl1 && sc.w.bl1.nextCrit) out.makeday = 'refilled: ' + sc.w.ammo + '/' + sc.w.s.mag; });
      chk('Made Your Day: crit kill refills and arms the next crit', !!out.makeday, out.makeday);
    });
    // C. Robocop: every weapon
    block('Robocop', () => {
      let sc = scene([[120, 0, 1e5, 0], [-120, 60, 1e5, 1], [-150, 60, 1e5, 0]], { first: MG, second: SI }); take(2); const el = sc.es[1], nb = sc.es[2], near = sc.es[0];
      run(30); chk('Robocop marks the Elite within 6 s', el.bl1mk === 1 && G.grudge === el, [el.bl1mk, sc.es.map(e => e.bl1mk)]);
      run(300); chk('Robocop: every weapon shoots the mark', lost(el) > lost(near) * 2, [lost(el), lost(near)]); chk('Robocop rockets splash the neighbour', lost(nb) > 0, lost(nb));
      sc = scene([[120, 0, 1e5]]); take(2);
      chk('FINISHER hidden before Improved targeting', !aimList().some(d => d.id === 'finisher')); take(null, 0);
      chk('FINISHER offered after Improved targeting', aimList().some(d => d.id === 'finisher'));
      chk('FINISHER prefers the nearly dead', targetScore('finisher', { hp: 5, maxHp: 100 }, 9000) > targetScore('finisher', { hp: 90, maxHp: 100 }, 100));
      sc = scene([[120, 0, 40, 1], [-120, 0, 1e5, 1]]); take(2, 1); // Prime Directive: the mark passes on a kill
      run(200); chk('Prime Directive passes the mark', sc.es[0].dead && sc.es[1].bl1mk === 1, [sc.es[0].dead, sc.es[1].bl1mk]);
      sc = scene([[120, 0, 1000, 1]]); take(2, 0, 2); sc.es[0].hp = 120; // Dead on Arrival: under 15% the mark dies on a hit
      run(90); chk('Dead on Arrival executes the mark', sc.es[0].dead, sc.es[0].hp);
      sc = scene([[120, 0, 1e5, 0], [160, 20, 1e5, 0]]); take(2); bl1SetMark(null, sc.es[1], true);
      chk('tap-to-mark marks by hand', sc.es[1].bl1mk === 1 && !sc.es[0].bl1mk);
    });
    // Gated Feats
    block('Feats', () => {
      const QD = CARDS.find(c => c.id === 'feat_quick_draw'), AB = CARDS.find(c => c.id === 'feat_acid_bath');
      let sc = scene([[150, 0, 1e5]]); chk('Quick draw not dealt without Dirty Harry', !QD.eligible(G)); chk('Acid bath not dealt without Robocop', !AB.eligible(G));
      take(1); chk('Quick draw dealt on Dirty Harry', QD.eligible(G)); chk('Acid bath still gated', !AB.eligible(G));
      const qd = f10Give('quick_draw', 1); chk('Quick draw slot', !!qd); if (typeof stamInit === 'function') { stamInit(); G.stam.cur = G.stam.v = 100; }
      qd.cd = 0; sc.es[0].aimT = 5; run(40);
      chk('Quick draw answers a wind-up', qd.cd > 1, [qd.cd]);
      sc = scene([[150, 0, 1e5]]); take(2); chk('Acid bath dealt on Robocop', AB.eligible(G));
      const ab = f10Give('acid_bath', 1); if (typeof stamInit === 'function') { stamInit(); G.stam.cur = G.stam.v = 100; }
      const c = fightCd(sc.es[0]); c.def = 'shell'; c.layers = 2; c.maxHp = sc.es[0].maxHp;
      ab.cd = 0; const ok = f10Go(ab, null);
      chk('Acid bath performs', ok && fightCd(sc.es[0]).bars.acid >= 0.59 && G.zones.some(z => z.bl1bath), [ok, fightCd(sc.es[0]).bars.acid, G.zones.length]);
      run(60); chk('Acid bath pool hurts', lost(sc.es[0]) > 0);
    });
    // Costumes draw for every branch (no errors), on you and on a card; none without a branch.
    block('costumes', () => {
      let sc = scene([[120, 0, 1e5, 1]]); chk('no costume without a branch', blSmbKind() === null);
      for (const i of [0, 1, 2]) { sc = scene([[120, 0, 1e5, 1]]); take(i); chk('costume ' + i, blSmbKind() === ['rambo', 'harry', 'robocop'][i], blSmbKind()); run(30); render(); }
      const cv = document.createElement('canvas'); cv.width = 300; cv.height = 100;
      for (const k of ['rambo', 'harry', 'robocop']) { smbLookKind = k; try { smbPicDraw(cv, 'baseline', { x: 0, y: 0, vx: 140, vy: 0, tailV: 140, id: -2 }, 1.2); } finally { smbLookKind = null; } }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('baseline1test OK');
  await b.close();
})();
