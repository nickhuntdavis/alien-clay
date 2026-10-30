// Private Schooled part 2 (private2.js): Ewww, Gross' branches, Daddy's Credit Card, Expelled, Signet Ring, Diplomatic Immunity.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, RT = 's_redtape', MAX = 1e6;
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    let nChk = 0; const chk = (name, cond, info) => { nChk++; if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null;
    const scene = (id, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      if (o.sample !== 'none') G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'private' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = MAX; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; G.ebul.length = 0; G.muts = {};
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild(); stamInit();
      const w = G.weapons[0]; w.cd = 99;
      return { w, es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (G.state === 'bossIntro') G.state = 'play'; if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const line = (n, gap, x0) => Array.from({ length: n }, (_, i) => [(x0 || 60) + i * gap, 0]);
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const hurt = (n, ent) => { G.player.iframes = 0; const h0 = G.player.hp; hurtPlayer(n, 't', ent || null, 'contact'); return h0 - G.player.hp; };
    const midHp = () => { G.player.hp = MAX * 0.5; };
    const fxc = (w, k) => (w.pv2 && w.pv2.fx && w.pv2.fx[k]) || 0;
    const gfx = k => (G.pv2 && G.pv2.fx && G.pv2.fx[k]) || 0;
    const withRandom = (v, fn) => { const r0 = Math.random; Math.random = () => v; try { fn(); } finally { Math.random = r0; } };
    const bundle = (sc, n, from) => { const B = tapeUp(sc.w, sc.es[from || 0], n); B.end = G.t + 600; return B; };
    const isText = s => typeof s === 'string' && s.length > 0;
    const killOne = e => { e.hp = 1; killEnemy(e, {}); };
    const shots = (shooter, n) => { const n0 = G.ebul.length; shooterEnt = shooter; for (let i = 0; i < n; i++) eBullet(G.player.x + 100, G.player.y, 0, 100, 5, 5); return G.ebul.length - n0; };

    // ---- the set exists for Private Schooled only
    block('sets', () => {
      let sc = scene(RT, line(3, 60), { sample: 'baseline' });
      let t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('baseline keeps the shared Ewww, Gross set', t === 'Birds of a Feather,Shared Trauma,Toxic Relationship', t);
      sc = scene(RT, line(3, 60), { sample: 'beta' }); t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('beta keeps the shared set', t === 'Birds of a Feather,Shared Trauma,Toxic Relationship', t);
      sc = scene(RT, line(3, 60)); t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('Private Schooled Ewww, Gross promises', t === "NDA,Hush Money,Daddy's Lawyers", t);
      const S = wupSpecFor(RT, 'private');
      chk('lv10 masteries', S.lv10.map(c => c.name).join() === 'Super-Injunction,Slush Fund,Retainer' && S.lv10.map(c => c.best).join() === 'A,B,C');
      const names = k => [...S[k].lv6.map(c => c.name), S[k].wild.name].join();
      chk('Lv 6 and wild names', names('A') === 'Gagging Order,Confidentiality Clause,Leaked' && names('B') === 'Paid Off,Bribe,Brown Envelope' && names('C') === 'Countersue,Injunction,Billable Hours', [names('A'), names('B'), names('C')]);
      for (const k of ['A', 'B', 'C']) chk(k + ' text is copy or placeholder', isText(S[k].lv3.desc) && isText(S[k].tag) && isText(S[k].costs) && S[k].lv6.every(c => isText(c.desc)) && isText(S[k].wild.desc) && S[k].lv6.length === 2);
      chk('mastery text', S.lv10.every(c => isText(c.desc)));
      sc = scene(RT, line(3, 60), { sample: 'baseline' }); pick(sc.w, 3, 0); chk('baseline pick has no pv2 state', !sc.w.pv2);
      G = null; chk('title screen: shared set', WUP[RT].A.name === 'Birds of a Feather');
    });

    // ================= A NDA
    block('NDA', () => {
      let sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); chk('A promise set', sc.w.up.p === 'A' && sc.w.pv2.p === 'A');
      const B = bundle(sc, 3);
      chk('a bundle of 3', B.members.length === 3, B.members.length);
      chk('a bundle of 3 cannot hurt you', hurt(5000, sc.es[0]) === 0 && hurt(5000, sc.es[1]) === 0);
      chk('and it was counted', fxc(sc.w, 'nda') >= 1);
      chk('and cannot shoot', shots(sc.es[0], 5) === 0);
      const free = makeEnemy(plain, sc.p.x + 300, sc.p.y); free.tst = 1; G.enemies.push(free);
      chk('an untaped enemy still shoots', shots(free, 5) > 0);
      chk('an untaped enemy still hurts', hurt(5000, free) > 0);
      // a bundle of 2
      sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); const B2 = bundle(sc, 2);
      chk('a bundle of 2', B2.members.length === 2);
      chk('of 2: the first hit lands', hurt(5000, sc.es[0]) > 0);
      chk('of 2: the next, inside 1.4 s, does not', hurt(5000, sc.es[0]) === 0);
      G.t += 2; chk('of 2: after 1.4 s it attacks again', hurt(5000, sc.es[0]) > 0);
      const n2 = shots(sc.es[1], 20); chk('of 2: about half the shots fly', n2 > 0 && n2 <= 11, n2);
      // without the promise
      sc = scene(RT, line(4, 50)); bundle(sc, 3); chk('without NDA: bundles hurt', hurt(5000, sc.es[0]) > 0);
      // Super-Injunction
      sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); pick(sc.w, 10, 0); bundle(sc, 2);
      chk('Super-Injunction: a bundle of 2 cannot attack', hurt(5000, sc.es[0]) === 0 && fxc(sc.w, 'nda') >= 1);
    });
    block('Gagging Order', () => {
      const sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); bundle(sc, 3); run(3);
      chk('taped enemies move 30% slower', sc.es.slice(0, 3).every(e => e.chillAmt >= 0.3 && e.chill > 0), sc.es.map(e => e.chillAmt));
      chk('the one not taped does not', sc.es[3].chillAmt === 0);
    });
    block('Confidentiality Clause', () => {
      const sc = scene(RT, line(3, 50)); pick(sc.w, 3, 0); const s0 = sc.w.s.share;
      pick(sc.w, 6, 1); computeStats(sc.w);
      chk('the bundle shares 50%', sc.w.s.share >= 0.5 && s0 < 0.5, [s0, sc.w.s.share]);
    });
    block('Leaked', () => {
      const sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 2); const B = bundle(sc, 3); const mem = B.members.slice();
      withRandom(0.0, () => run(75));
      chk('the bundle bursts and Fears its members', fxc(sc.w, 'leaked') === 1 && mem.every(e => e.fearT > G.t), [fxc(sc.w, 'leaked'), mem.map(e => e.fearT - G.t)]);
      chk('and the tape is gone', mem.every(e => !e.tape) && B.dead);
      const sc2 = scene(RT, line(4, 50)); pick(sc2.w, 3, 0); pick(sc2.w, 6, 2); const B2 = bundle(sc2, 3);
      withRandom(0.99, () => run(75)); chk('most bundles hold', fxc(sc2.w, 'leaked') === 0 && !B2.dead);
    });

    // ================= B Hush Money
    const bigBundle = (sc, n) => { const B = bundle(sc, 2); for (let i = 2; i < n; i++) { B.members.push(sc.es[i]); sc.es[i].tape = B; } return B; };
    block('Hush Money', () => {
      let sc = scene(RT, line(9, 40)); pick(sc.w, 3, 1); chk('B promise set', sc.w.pv2.p === 'B'); bigBundle(sc, 9); run(1);
      G.stam.cur = 10; killOne(sc.es[0]);
      chk('a taped enemy that dies pays 1 stamina', Math.abs(G.stam.cur - 11) < 0.01 && fxc(sc.w, 'pay') === 1, G.stam.cur);
      G.t += 2; G.stam.cur = 10; for (let i = 1; i < 8; i++) killOne(sc.es[i]);
      chk('at most 5 payments a second', Math.abs(G.stam.cur - 15) < 0.01, G.stam.cur);
      sc = scene(RT, line(3, 40)); pick(sc.w, 3, 1); const e = makeEnemy(plain, sc.p.x + 400, sc.p.y); e.tst = 1; G.enemies.push(e); bigBundle(sc, 3);
      G.stam.cur = 10; killOne(e); chk('an untaped enemy pays nothing', G.stam.cur === 10);
      sc = scene(RT, line(3, 40)); pick(sc.w, 3, 0); bigBundle(sc, 3); G.stam.cur = 10; killOne(sc.es[0]); chk('without Hush Money: nothing', G.stam.cur === 10);
    });
    block('Slush Fund', () => {
      const sc = scene(RT, line(5, 40)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); pick(sc.w, 10, 1); bigBundle(sc, 5); run(1);
      G.stam.cur = 10; killOne(sc.es[0]); chk('payouts are doubled', Math.abs(G.stam.cur - 12) < 0.01, G.stam.cur);
    });
    block('Paid Off', () => {
      const sc = scene(RT, line(4, 40)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); bundle(sc, 3); const e = sc.es[0], other = { w: { uid: 99 } };
      chk('other weapons deal 20% more to a taped enemy', Math.abs(hookMul('dmgMul', e, other) - 1.2) < 0.001, hookMul('dmgMul', e, other));
      chk('Ewww, Gross itself does not', hookMul('dmgMul', e, { w: sc.w }) === 1);
      chk('an untaped enemy does not', hookMul('dmgMul', sc.es[3], other) === 1);
    });
    block('Bribe', () => {
      const sc = scene(RT, [[60, 0, 0, true], [100, 0], [140, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); bundle(sc, 3);
      withRandom(0.0, () => run(3));
      chk('a taped Elite is Possessed', sc.es[0].charmed === true && sc.es[0].charmT > 3 && fxc(sc.w, 'bribe') === 1, [sc.es[0].charmed, fxc(sc.w, 'bribe')]);
      chk('and only the Elite', !sc.es[1].charmed && !sc.es[2].charmed);
      const sc2 = scene(RT, [[60, 0, 0, true], [100, 0], [140, 0]]); pick(sc2.w, 3, 1); pick(sc2.w, 6, 1); bundle(sc2, 3);
      withRandom(0.99, () => run(3)); chk('usually it refuses', !sc2.es[0].charmed);
    });
    block('Brown Envelope', () => {
      let sc = scene(RT, line(5, 40)); pick(sc.w, 3, 1); pick(sc.w, 6, 2); bigBundle(sc, 4); run(2); midHp(); const h0 = G.player.hp;
      for (let i = 0; i < 3; i++) killOne(sc.es[i]);
      chk('a bundle of 4 that falls inside 1 s drops a 5% heal', Math.abs(G.player.hp - h0 - MAX * 0.05) < MAX * 0.002 && fxc(sc.w, 'envelope') === 1, (G.player.hp - h0) / MAX);
      sc = scene(RT, line(5, 40)); pick(sc.w, 3, 1); pick(sc.w, 6, 2); bigBundle(sc, 4); run(2); midHp(); const h1 = G.player.hp;
      killOne(sc.es[0]); G.t += 2; killOne(sc.es[1]); G.t += 2; killOne(sc.es[2]);
      chk('slowly: no heal', G.player.hp === h1, G.player.hp - h1);
      sc = scene(RT, line(5, 40)); pick(sc.w, 3, 1); pick(sc.w, 6, 2); bundle(sc, 3); run(2); midHp(); const h2 = G.player.hp;
      killOne(sc.es[0]); killOne(sc.es[1]); chk('a bundle of 3: no heal', G.player.hp === h2);
    });

    // ================= C Daddy's Lawyers
    block("Daddy's Lawyers", () => {
      let sc = scene(RT, line(4, 50)); const base = hurt(1000, null);
      sc = scene(RT, line(4, 50)); pick(sc.w, 3, 2); chk('C promise set', sc.w.pv2.p === 'C'); bundle(sc, 3);
      const l0 = sc.es.map(lost), dl = hurt(1000, null), e = sc.es[0];
      chk('half the damage is redirected', Math.abs(dl - base * 0.5) < base * 0.03, [dl, base]);
      chk('the nearest taped enemy takes it', lost(e) - l0[0] >= 450 && fxc(sc.w, 'redirect') === 1, lost(e) - l0[0]);
      chk('and the rest of the bundle does not (no Countersue)', sc.es.slice(1).every((x, i) => lost(x) - l0[i + 1] < 100), sc.es.map(lost));
      sc = scene(RT, line(2, 50, 400)); pick(sc.w, 3, 2); bundle(sc, 2); chk('beyond 200: the hit lands in full', Math.abs(hurt(1000, null) - base) < base * 0.03);
      sc = scene(RT, line(4, 50)); pick(sc.w, 3, 0); bundle(sc, 3); chk('another promise: no redirect', Math.abs(hurt(1000, null) - base) < base * 0.03);
    });
    block('Countersue', () => {
      const sc = scene(RT, line(4, 50)); pick(sc.w, 3, 2); pick(sc.w, 6, 0); bundle(sc, 3); const l0 = sc.es.map(lost); hurt(1000, null);
      chk('the redirect hits the rest of the bundle again', sc.es.slice(1, 3).every((x, i) => lost(x) - l0[i + 1] >= 450) && fxc(sc.w, 'countersue') === 1, sc.es.map(lost));
      chk('not the one outside it', lost(sc.es[3]) - l0[3] < 100);
    });
    block('Injunction', () => {
      const sc = scene(RT, [[40, 0], [200, 0], [240, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); bundle(sc, 2);
      run(1); chk('a taped enemy within 60 is pushed back', fxc(sc.w, 'injunction') >= 1 && sc.es[0].kx > 50, [fxc(sc.w, 'injunction'), sc.es[0].kx]);
      const sc2 = scene(RT, [[200, 0], [240, 0]]); pick(sc2.w, 3, 2); pick(sc2.w, 6, 1); bundle(sc2, 2); run(2); chk('far away: nothing', fxc(sc2.w, 'injunction') === 0);
    });
    block('Billable Hours', () => {
      const sc = scene(RT, line(4, 50)); pick(sc.w, 3, 2); pick(sc.w, 6, 2); bundle(sc, 3); G.stam.cur = 30; hurt(1000, null);
      chk('each redirect costs 1 stamina', Math.abs(G.stam.cur - 29) < 0.01 && fxc(sc.w, 'billable') === 1, G.stam.cur);
    });
    block('Retainer', () => {
      let sc = scene(RT, line(4, 50)); const base = hurt(1000, null);
      sc = scene(RT, line(4, 50)); pick(sc.w, 3, 2); pick(sc.w, 6, 0); pick(sc.w, 10, 2); bundle(sc, 3); const l0 = lost(sc.es[0]), dl = hurt(1000, null);
      chk('three quarters are redirected', Math.abs(dl - base * 0.25) < base * 0.03 && lost(sc.es[0]) - l0 >= 700, [dl, base, lost(sc.es[0]) - l0]);
    });

    // ================= branch ring runs (300 frames each)
    const ringRun = (lbl, k, l6, l10) => block('ring ' + lbl, () => {
      const sc = scene(RT, ringPts(10)); pick(sc.w, 3, k); pick(sc.w, 6, l6); pick(sc.w, 10, l10); sc.w.dir = 'cluster'; sc.w.cd = 0; G.player.hp = MAX * 0.5;
      run(300, f => { if (f % 20 === 0) hurt(2000, sc.es[f % sc.es.length]); if (G.player.hp < MAX * 0.2) G.player.hp = MAX * 0.5; });
      chk(lbl + ' ring run hurts', sc.es.some(e => lost(e) > 0));
    });
    ringRun('NDA', 0, 0, 0); ringRun('NDA clause', 0, 1, 0); ringRun('NDA wild', 0, 2, 0);
    ringRun('Hush Money', 1, 0, 1); ringRun('Hush Money bribe', 1, 1, 1); ringRun('Hush Money wild', 1, 2, 1);
    ringRun('Lawyers', 2, 0, 2); ringRun('Lawyers injunction', 2, 1, 2); ringRun('Lawyers wild', 2, 2, 2);

    // ================= gated cards
    block("Daddy's Credit Card", () => {
      const sc = scene(RT, [[60, 0], [100, 40], [-90, 0], [400, 0]]); const card = CARDS.find(c => c.id === 'feat_pv_card');
      chk('Credit Card card', !!card && card.kind === 'acquire' && card.eligible(G) && isText(card.desc) && card.family === 'feat:acid');
      const w = f10Give('pv_card', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0;
      chk('gate reads Acid Spit B', typeof F10.pv_card.gate === 'function' && F10.pv_card.gate() === false);
      const e0 = sc.es[0], src = { w: sc.w }, k0 = hookMul('dmgMul', e0, src);
      const ok = featTap(w); chk('performs on a tap', ok === true, ok);
      chk('every weapon deals 30% more', Math.abs(hookMul('dmgMul', e0, src) / k0 - 1.3) < 0.001, hookMul('dmgMul', e0, src));
      run(40);
      chk('enemies within 150 build Corrosion', [0, 1, 2].every(i => fightCd(sc.es[i]).bars.acid > 0.1), [0, 1, 2].map(i => fightCd(sc.es[i]).bars.acid));
      chk('the far one does not', fightCd(sc.es[3]).bars.acid === 0);
      run(60 * 6 + 5);
      chk('it ends after 6 s', !G.pv2.card && Math.abs(hookMul('dmgMul', e0, src) - k0) < 0.001, hookMul('dmgMul', e0, src));
      const sc2 = scene(RT, [[60, 0]]); const w2 = f10Give('pv_card', 1); stamInit(); G.stam.cur = G.stam.v = 100; w2.cd = 0; w2.f10fk = { platinum: 1 }; recomputeAll(); featTap(w2);
      chk('Platinum: 45%', Math.abs(hookMul('dmgMul', sc2.es[0], { w: sc2.w }) - 1.45) < 0.001, hookMul('dmgMul', sc2.es[0], { w: sc2.w }));
      render();
    });
    block('Expelled', () => {
      const sc = scene(RT, ringPts(6).map(([x, y]) => [x * 0.6, y * 0.6])); const card = CARDS.find(c => c.id === 'feat_pv_expelled');
      chk('Expelled card', !!card && card.kind === 'acquire' && card.eligible(G) && isText(card.desc) && card.family === 'feat:soul');
      const w = f10Give('pv_expelled', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0;
      const friend = sc.es[5]; friend.charmed = true; friend.charmT = 20;
      const inR = sc.es.filter((e, i) => i < 5 && Math.hypot(e.x - sc.p.x, e.y - sc.p.y) < 160);
      chk('gate reads Rent Free B', typeof F10.pv_expelled.gate === 'function' && F10.pv_expelled.gate() === false);
      const ok = featTap(w); chk('performs on a tap', ok === true, ok);
      chk('everything within 160 is Feared for 1.5 s', inR.length > 0 && inR.every(e => e.fearT > G.t + 1.2 && e.fearT <= G.t + 1.6), inR.map(e => e.fearT - G.t));
      chk('and knocked away hard', inR.every(e => Math.hypot(e.kx, e.ky) > 300), inR.map(e => Math.hypot(e.kx, e.ky)));
      chk('a Possessed enemy is left alone', !(friend.fearT > G.t) && lost(friend) === 0 && Math.hypot(friend.kx, friend.ky) === 0);
      chk('a little Holy damage', inR.some(e => lost(e) > 0));
      render();
    });
    block('Signet Ring', () => {
      const sc = scene(RT, line(2, 80)); const card = CARDS.find(c => c.id === 'pass_pv_signet'); const e = sc.es[0];
      chk('Signet Ring card', !!card && card.maxRank === 1 && isText(card.desc));
      chk('without it: allies x1', hookMul('dmgMul', e, { fromAlly: true }) === 1);
      G.muts.pass_pv_signet = 1;
      chk('with it: allies deal 30% more', Math.abs(hookMul('dmgMul', e, { fromAlly: true }) - 1.3) < 0.001, hookMul('dmgMul', e, { fromAlly: true }));
      chk('your own hits are left alone', hookMul('dmgMul', e, { w: sc.w }) === 1);
    });
    block('Diplomatic Immunity', () => {
      scene(RT, line(2, 80)); const card = CARDS.find(c => c.id === 'pass_pv_immunity'); chk('Diplomatic Immunity card', !!card && card.maxRank === 1 && isText(card.desc));
      chk('without it: the hit lands', hurt(5000, null) > 0);
      G.player.hp = MAX; G.muts.pass_pv_immunity = 1;
      chk('the first hit does nothing', hurt(5000, null) === 0 && gfx('immunity') === 1);
      chk('the next lands', hurt(5000, null) > 0);
      G.t += 10; G.player.hp = MAX; chk('inside 20 s it does not come back', hurt(5000, null) > 0);
      G.t += 20; G.player.hp = MAX; chk('after 20 s it does', hurt(5000, null) === 0 && gfx('immunity') === 2);
    });
    out.checks = nChk; return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('private2test OK');
  await b.close();
})();
