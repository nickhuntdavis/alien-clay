// Beta part 2 (beta2.js): Sister Cousin's near-death branches, Defibrillator, Blood Bag, Morphine Drip, Famous Last Words.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, SC = 's_seeker', MAX = 1e6;
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    let nChk = 0; const chk = (name, cond, info) => { nChk++; if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null;
    const scene = (id, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      if (o.sample !== 'none') G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'beta' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = MAX; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (G.state === 'bossIntro') G.state = 'play'; if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const line = (n, gap, x0) => Array.from({ length: n }, (_, i) => [(x0 || 100) + i * gap, 0]);
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const mine = w => G.proj.filter(q => q.w === w && !q.dead);
    const seekers = (sc, n) => { sc.w.cd = 0; fireWeapon(sc.w, sc.es[0]); run(2); while (mine(sc.w).length < (n || 2)) { sc.w.cd = 0; fireWeapon(sc.w, sc.es[0]); run(1); if (G.proj.length > 40) break; } };
    const hurt = (n, ent) => { G.player.iframes = 0; hurtPlayer(n, 't', ent || null, 'contact'); };
    const lowHp = () => { G.player.hp = MAX * 0.1; }, midHp = () => { G.player.hp = MAX * 0.5; };
    const fxc = (w, k) => (w.be2 && w.be2.fx && w.be2.fx[k]) || 0;
    const withRandom = (v, fn) => { const r0 = Math.random; Math.random = () => v; try { fn(); } finally { Math.random = r0; } };

    // ---- the set exists for Beta only
    block('sets', () => {
      let sc = scene(SC, line(3, 60), { sample: 'baseline' });
      let t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('other samples keep the shared Sister Cousin set', t === 'Family Planning,The Favourite,Sibling Rivalry', t);
      sc = scene(SC, line(3, 60)); t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('Beta Sister Cousin promises', t === 'Next of Kin,Organ Donor,Transfusion', t);
      const S = wupSpecFor(SC, 'beta');
      chk('SC lv10 masteries', S.lv10.map(c => c.name).join() === 'Bloodline,Living Donor,Blood Brothers' && S.lv10.map(c => c.best).join() === 'A,B,C');
      const names = k => [...S[k].lv6.map(c => c.name), S[k].wild.name].join();
      chk('Lv 6 and wild names', names('A') === 'Emergency Contact,Power of Attorney,Family Feud' && names('B') === 'Spare Parts,Compatible Match,Black Market' && names('C') === 'Blood Type O,Shared Circulation,Rhesus Negative', [names('A'), names('B'), names('C')]);
      for (const k of ['A', 'B', 'C']) chk(k + ' text is copy or placeholder', (typeof S[k].lv3.desc === "string" && S[k].lv3.desc.length > 0) && S[k].lv6.every(c => (typeof c.desc === "string" && c.desc.length > 0)) && (typeof S[k].wild.desc === "string" && S[k].wild.desc.length > 0) && S[k].lv6.length === 2);
      chk('mastery text placeholder', S.lv10.every(c => (typeof c.desc === "string" && c.desc.length > 0)));
      sc = scene(SC, line(3, 60), { sample: 'baseline' }); pick(sc.w, 3, 0); chk('baseline pick has no be2 state', !sc.w.be2);
      G = null; chk('title screen: shared set', WUP[SC].A.name === 'Family Planning');
    });

    // ================= A Next of Kin
    block('Next of Kin', () => {
      let sc = scene(SC, line(6, 60)); pick(sc.w, 3, 0); chk('A promise set', sc.w.up.p === 'A' && sc.w.be2.p === 'A');
      seekers(sc, 2); const n0 = mine(sc.w).length; chk('seekers are out', n0 >= 2, n0);
      hurt(5000); chk('the hit is absorbed', G.player.hp === MAX, G.player.hp);
      chk('one seeker died for it', mine(sc.w).filter(q => !q.dead).length === n0 - 1 || sc.w.be2.fx.kin === 1, [mine(sc.w).length, n0]);
      chk('cooldown set', sc.w.be2.kinT > G.t + 3.5, sc.w.be2.kinT - G.t);
      hurt(5000); chk('inside 4 s the next hit lands', G.player.hp < MAX, G.player.hp);
      G.t += 5; G.player.hp = MAX; seekers(sc, 1); hurt(5000); chk('after 4 s it works again', G.player.hp === MAX && fxc(sc.w, 'kin') === 2, [G.player.hp, fxc(sc.w, 'kin')]);
      sc = scene(SC, line(6, 60)); pick(sc.w, 3, 0); hurt(5000); chk('no seeker out: the hit lands', G.player.hp < MAX);
      sc = scene(SC, line(6, 60)); pick(sc.w, 3, 0); seekers(sc, 1); for (const q of mine(sc.w)) { q.x = sc.p.x + 400; q.y = sc.p.y; } sc.w.cd = 99; hurt(5000);
      chk('a seeker beyond 150 does not take it', G.player.hp < MAX, G.player.hp);
    });
    block('Emergency Contact', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); seekers(sc, 3);
      const culprit = sc.es[4]; sc.w.cd = 99; hurt(5000, culprit);
      chk('every seeker turns on whatever hurt you', mine(sc.w).length > 0 && mine(sc.w).every(q => q.tgt === culprit), mine(sc.w).map(q => !!q.tgt));
      sc.w.be2.kinT = 0; G.t += 5; const c2 = sc.es[5]; sc.w.be2.kinT = G.t + 99; hurt(5000, c2);
      chk('also when the hit lands', mine(sc.w).every(q => q.tgt === c2), mine(sc.w).length);
    });
    block('Power of Attorney', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 1); const e = sc.es[0], src = { w: sc.w };
      chk('full health: x1', wupDmgMul(e, src) === 1, wupDmgMul(e, src));
      midHp(); chk('50% health: x1 (not low)', wupDmgMul(e, src) === 1);
      lowHp(); chk('low: +50%', Math.abs(wupDmgMul(e, src) - 1.5) < 0.001, wupDmgMul(e, src));
    });
    block('Family Feud', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 2); seekers(sc, 2); sc.w.cd = 99;
      const L = mine(sc.w); L[0].x = L[1].x = sc.p.x + 30; L[0].y = L[1].y = sc.p.y + 30; L[0].max = L[1].max = 5; L[0].life = L[1].life = 2; L[0].be2feud = L[1].be2feud = 0;
      withRandom(0.0, () => run(2)); chk('two touching seekers scatter', fxc(sc.w, 'feud') >= 1, sc.w.be2.fx);
    });
    block('Bloodline', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); pick(sc.w, 10, 0); seekers(sc, 3); sc.w.cd = 99;
      const n0 = mine(sc.w).length; hurt(5000);
      chk('the seeker that took the hit left two', mine(sc.w).length === n0 + 1 && fxc(sc.w, 'bloodline') === 1, [n0, mine(sc.w).length]);
    });

    // ================= B Organ Donor
    const endOne = sc => { seekers(sc, 2); sc.w.cd = 99; const q = mine(sc.w)[0]; q.dead = true; return q; };
    block('Organ Donor', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 1); chk('B promise set', sc.w.be2.p === 'B');
      seekers(sc, 2); sc.w.cd = 99; run(1); midHp(); const h0 = G.player.hp, q = mine(sc.w)[0]; q.dead = true; run(2);
      chk('an ended seeker heals 1.5%', G.player.hp - h0 >= MAX * 0.015 - 1 && G.player.hp - h0 <= MAX * 0.016 + 1, G.player.hp - h0);
      midHp(); const L = mine(sc.w); for (const x of L.slice(0, 5)) x.dead = true; run(2);
      chk('donations share a cap of 5% a second', G.player.hp - MAX * 0.5 <= MAX * 0.05 + 1, G.player.hp - MAX * 0.5);
    });
    block('Spare Parts', () => {
      const sc = scene(SC, [[60, 0], [200, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); seekers(sc, 2); sc.w.cd = 99;
      const q = mine(sc.w)[0]; q.x = sc.es[0].x; q.y = sc.es[0].y; q.dead = true; run(2);
      chk('a pool is left', sc.w.be2.pools.length === 1 || fxc(sc.w, 'pool') === 1, sc.w.be2.pools.length);
      run(45); chk('the pool makes it Bleed', sc.es[0].bleeds && sc.es[0].bleeds.length > 0, sc.es[0].bleeds);
      run(220); chk('the pool is gone after 3 s', sc.w.be2.pools.length === 0, sc.w.be2.pools.length);
    });
    block('Compatible Match', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 1); pick(sc.w, 6, 1); seekers(sc, 2); sc.w.cd = 99;
      G.player.hp = MAX * 0.3; const q = mine(sc.w)[0], h0 = G.player.hp; q.dead = true; run(2);
      chk('low: the donation doubles', G.player.hp - h0 >= MAX * 0.03 - 1, G.player.hp - h0);
      G.t += 2; G.player.hp = MAX * 0.6; const q2 = mine(sc.w)[0], h1 = G.player.hp; q2.dead = true; run(2);
      chk('not low: 1.5%', G.player.hp - h1 >= MAX * 0.015 - 1 && G.player.hp - h1 <= MAX * 0.016 + 1, G.player.hp - h1);
    });
    block('Black Market', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); pick(sc.w, 6, 2) ; // (a second pick of the wild is harmless here)
      stamInit(); seekers(sc, 2); sc.w.cd = 99; G.stam.cur = 40; midHp(); const q = mine(sc.w)[0], h0 = G.player.hp;
      withRandom(0.0, () => { q.dead = true; run(2); });
      chk('Black Market: 4 stamina and no heal', G.stam.cur >= 43.9 && Math.abs(G.player.hp - h0) < 1 && fxc(sc.w, 'black') === 1, [G.stam.cur, G.player.hp - h0]);
    });
    block('Living Donor', () => {
      const sc = scene(SC, line(6, 60)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); pick(sc.w, 10, 1); midHp(); const e = sc.es[0], h0 = G.player.hp;
      wupKill(e, { w: sc.w }); chk('a seeker kill heals 0.5%', Math.abs(G.player.hp - h0 - MAX * 0.005) < 2, G.player.hp - h0);
      for (let i = 0; i < 20; i++) wupKill(e, { w: sc.w }); chk('capped at 3% a second', G.player.hp - h0 <= MAX * 0.03 + 2, G.player.hp - h0);
      G.t += 1.2; const h1 = G.player.hp; wupKill(e, { w: sc.w }); chk('and it resets', G.player.hp > h1);
      const sc2 = scene(SC, line(6, 60)); pick(sc2.w, 3, 1); midHp(); const h2 = G.player.hp; wupKill(sc2.es[0], { w: sc2.w }); chk('without the mastery: nothing', G.player.hp === h2);
    });

    // ================= C Transfusion
    block('Transfusion', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 2); const e = sc.es[0], src = { w: sc.w };
      chk('full health: x1', wupDmgMul(e, src) === 1, wupDmgMul(e, src));
      G.player.hp = MAX * 0.55; chk('55%: about +50%', Math.abs(wupDmgMul(e, src) - 1.5) < 0.01, wupDmgMul(e, src));
      G.player.hp = MAX * 0.1; chk('10%: +100%', Math.abs(wupDmgMul(e, src) - 2) < 0.01, wupDmgMul(e, src));
      chk('echo hits are left alone', wupDmgMul(e, { w: sc.w, wupEcho: true }) === 1);
    });
    block('Blood Type O', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 2); pick(sc.w, 6, 0); const e = sc.es[0];
      for (const f of sc.w.uh.phit) f(sc.w, { dmg: 20, src: weaponSrc(sc.w) }, e);
      chk('a hit makes the target Bleed', e.bleeds && e.bleeds.length === 1, e.bleeds);
      const sc2 = scene(SC, line(3, 60)); pick(sc2.w, 3, 2); for (const f of sc2.w.uh.phit) f(sc2.w, { dmg: 20, src: weaponSrc(sc2.w) }, sc2.es[0]);
      chk('without it: no forced Bleed', !(sc2.es[0].bleeds && sc2.es[0].bleeds.length));
    });
    block('Shared Circulation', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 2); pick(sc.w, 6, 1); const e = sc.es[0], src = weaponSrc(sc.w);
      midHp(); const h0 = G.player.hp; for (const f of sc.w.uh.hit) f(sc.w, e, { toHp: 1000 }, src); chk('not low: no extra heal', G.player.hp === h0);
      lowHp(); const h1 = G.player.hp; for (const f of sc.w.uh.hit) f(sc.w, e, { toHp: 1000 }, src);
      chk('low: a seeker hit heals as Not Dead Yet does', Math.abs(G.player.hp - h1 - 1000 * 0.08 * 0.9) < 0.5, G.player.hp - h1);
    });
    block('Rhesus Negative', () => {
      const sc = scene(SC, line(3, 60)); pick(sc.w, 3, 2); pick(sc.w, 6, 2); const e = sc.es[0];
      sc.w.cd = 0; withRandom(0.0, () => { fireWeapon(sc.w, e); run(2); });
      const cs = mine(sc.w); chk('15% of seekers carry Mucus', cs.length > 0 && cs.every(q => q.be2muc), cs.length);
      for (const f of sc.w.uh.phit) f(sc.w, cs[0], e); chk('and Snare what they hit', e.snareT > G.t, e.snareT - G.t);
      const sc2 = scene(SC, line(3, 60)); pick(sc2.w, 3, 2); pick(sc2.w, 6, 2); sc2.w.cd = 0; withRandom(0.99, () => { fireWeapon(sc2.w, sc2.es[0]); run(2); });
      chk('most seekers carry none', mine(sc2.w).length > 0 && mine(sc2.w).every(q => !q.be2muc));
    });
    block('Blood Brothers', () => {
      const children = (lvl10) => {
        const sc = scene(SC, [[60, 0], [100, 40], [100, -40], [140, 0], [140, 60]]); pick(sc.w, 3, 2); if (lvl10) { pick(sc.w, 6, 0); pick(sc.w, 10, 2); }
        const e = sc.es[0], pr = spawnProj(sc.w, e.x, e.y, 0, weaponSrc(sc.w), {}); e.dead = true; e.hp = 0;
        const n0 = G.proj.length; modHit(pr, e); return G.proj.slice(n0).filter(q => q.mSplit).length;
      };
      const base = children(false), bro = children(true);
      chk('a kill splits into two normally, three with Blood Brothers', base === 2 && bro === 3, [base, bro]);
    });

    // ================= branch ring runs (300 frames each)
    for (const [lbl, k] of [['Next of Kin', 0], ['Organ Donor', 1], ['Transfusion', 2]]) block('ring ' + lbl, () => {
      const sc = scene(SC, ringPts(10)); pick(sc.w, 3, k); pick(sc.w, 6, k === 2 ? 0 : 1); pick(sc.w, 10, k); sc.w.dir = 'nearest';
      G.player.hp = MAX * 0.2; run(300, () => { if (G.player.hp < MAX * 0.1) G.player.hp = MAX * 0.2; });
      chk(lbl + ' ring run hurts', sc.es.some(e => lost(e) > 0));
    });
    for (const [lbl, k, l6] of [['Next of Kin wild', 0, 2], ['Organ Donor wild', 1, 2], ['Transfusion wild', 2, 2]]) block('ring ' + lbl, () => {
      const sc = scene(SC, ringPts(10)); pick(sc.w, 3, k); pick(sc.w, 6, l6); pick(sc.w, 10, k); sc.w.dir = 'nearest';
      G.player.hp = MAX * 0.2; run(300, () => { if (G.player.hp < MAX * 0.1) G.player.hp = MAX * 0.2; });
      chk(lbl + ' ring run hurts', sc.es.some(e => lost(e) > 0));
    });

    // ================= gated cards
    block('Defibrillator', () => {
      const sc = scene(SC, ringPts(6).map(([x, y]) => [x * 0.6, y * 0.6])); const card = CARDS.find(c => c.id === 'feat_be_defib');
      chk('Defibrillator card', !!card && card.kind === 'acquire' && /^TODO_COPY:|[A-Za-z]/.test(card.desc) && card.eligible(G));
      const w = f10Give('be_defib', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0; G.player.hp = MAX * 0.4;
      const inR = sc.es.filter(e => Math.hypot(e.x - sc.p.x, e.y - sc.p.y) < 140).length, ok = featTap(w);
      chk('Defibrillator performs on a tap', ok === true, ok);
      chk('it stuns what it touches', sc.es.filter(e => Math.hypot(e.x - sc.p.x, e.y - sc.p.y) < 140).every(e => e.dazeT > G.t + 0.5), inR);
      chk('and heals 5% an enemy (up to 25%)', Math.abs(G.player.hp - (MAX * 0.4 + MAX * Math.min(0.25, 0.05 * inR))) < MAX * 0.002, [G.player.hp / MAX, inR]);
      chk('a little Static damage', sc.es.some(e => lost(e) > 0));
      chk('Defibrillator gate reads Little Prick B', typeof F10.be_defib.gate === 'function' && F10.be_defib.gate() === false);
      const sc2 = scene(SC, Array.from({ length: 8 }, (_, i) => [Math.cos(i) * 60, Math.sin(i) * 60])); const w2 = f10Give('be_defib', 1); stamInit(); G.stam.cur = G.stam.v = 100; w2.cd = 0; G.player.hp = MAX * 0.4; featTap(w2);
      chk('the heal stops at 25%', Math.abs(G.player.hp - MAX * 0.65) < MAX * 0.002, G.player.hp / MAX);
      render();
    });
    block('Blood Bag', () => {
      const sc = scene(SC, line(2, 80)); const card = CARDS.find(c => c.id === 'feat_be_bloodbag'); chk('Blood Bag card', !!card && card.kind === 'acquire' && card.eligible(G));
      const w = f10Give('be_bloodbag', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0; G.player.hp = MAX * 0.3; const sp0 = mutSpeed();
      const ok = featTap(w); chk('Blood Bag performs on a tap', ok === true, ok);
      chk('low: 30% faster', Math.abs(mutSpeed() / sp0 - 1.3) < 0.01, mutSpeed() / sp0);
      G.player.hp = MAX * 0.3; run(60 * 3 + 5);
      chk('it heals 15% over 3 s', Math.abs(G.player.hp - MAX * 0.45) < MAX * 0.02, G.player.hp / MAX);
      chk('and the swim bonus ends', Math.abs(mutSpeed() / sp0 - 1) < 0.01, mutSpeed() / sp0);
      const sc2 = scene(SC, line(2, 80)); const w2 = f10Give('be_bloodbag', 1); stamInit(); G.stam.cur = G.stam.v = 100; w2.cd = 0; G.player.hp = MAX * 0.7; const sp1 = mutSpeed(); featTap(w2);
      chk('not low: no swim bonus', Math.abs(mutSpeed() / sp1 - 1) < 0.01, mutSpeed() / sp1);
      chk('Blood Bag gate reads Sister Cousin B', typeof F10.be_bloodbag.gate === 'function' && F10.be_bloodbag.gate() === false);
    });
    block('Morphine Drip', () => {
      const sc = scene(SC, line(2, 80)); const card = CARDS.find(c => c.id === 'pass_be_morphine'); chk('Morphine Drip card', !!card && card.maxRank === 1 && /^TODO_COPY:|[A-Za-z]/.test(card.desc));
      lowHp(); chk('without the passive: x1', hookMul('hurtMul', null, 'contact', 't') === 1);
      G.muts = G.muts || {}; G.muts.pass_be_morphine = 1;
      chk('low: 20% less', Math.abs(hookMul('hurtMul', null, 'contact', 't') - 0.8) < 0.001, hookMul('hurtMul', null, 'contact', 't'));
      midHp(); chk('50% health: no help', hookMul('hurtMul', null, 'contact', 't') === 1);
      G.player.hp = MAX; chk('full health: no help', hookMul('hurtMul', null, 'contact', 't') === 1);
    });
    block('Famous Last Words', () => {
      const sc = scene(SC, [[80, 0], [0, 120], [-150, 0], [400, 0]]); const card = CARDS.find(c => c.id === 'pass_be_lastwords'); chk('Famous Last Words card', !!card && card.maxRank === 1 && /^TODO_COPY:|[A-Za-z]/.test(card.desc));
      G.muts = G.muts || {}; G.level = 7; G.player.hp = MAX * 0.07; hookRun('hurt', 10, null, null);
      chk('without the passive: nothing', sc.es.every(e => lost(e) === 0));
      G.muts.pass_be_lastwords = 1; G.player.hp = MAX * 0.2; hookRun('hurt', 10, null, null); chk('above 10%: nothing', sc.es.every(e => lost(e) === 0));
      G.player.hp = MAX * 0.07; hookRun('hurt', 10, null, null);
      chk('below 10%: a Blood burst of 20 x level within 200', lost(sc.es[0]) >= 140 && lost(sc.es[1]) >= 140 && lost(sc.es[2]) >= 140 && lost(sc.es[3]) === 0, sc.es.map(lost));
      chk('and it Bleeds', sc.es[0].bleeds && sc.es[0].bleeds.length > 0 && !(sc.es[3].bleeds && sc.es[3].bleeds.length));
      const l0 = lost(sc.es[0]); hookRun('hurt', 10, null, null); chk('once a wave', lost(sc.es[0]) === l0);
      G.t += 61; hookRun('hurt', 10, null, null); chk('and again the next wave', lost(sc.es[0]) > l0);
    });
    out.checks = nChk; return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('beta2test OK');
  await b.close();
})();
