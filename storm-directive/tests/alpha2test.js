// Alpha part 2 (alpha2.js): Unwanted Contact and Obligatory Podcast hustle branches, Morning Routine, Going Live, Diamond Hands, Main Character Energy.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, UC = 's_tesla', OP = 'v_phys_podcast';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null; const ORD = [], DMG = []; hookOn('hit:before', 'test:order', (e, dmg, src) => { if (src && src.al2uc) { ORD.push(e); DMG.push(dmg); } }); // (Unwanted Contact chain hits only: the Charge arcs add damage to lost())
    const scene = (id, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      if (o.sample !== 'none') G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'alpha' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; ORD.length = 0; DMG.length = 0;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (G.state === 'bossIntro') G.state = 'play'; if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const line = (n, gap, x0) => Array.from({ length: n }, (_, i) => [(x0 || 100) + i * gap, 0]);
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const shoot = (sc, t) => { sc.w.cd = 0; fireWeapon(sc.w, t || sc.es[0]); };
    const pods = () => G.proj.filter(p => p.pod && p.al2);

    // ---- the sets exist for Alpha only
    block('sets', () => {
      let sc = scene(UC, line(3, 60), { sample: 'baseline' });
      let t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('other samples keep the shared UC set', t === "It's Spreading,Conductive Personality,Feedback Loop", t);
      sc = scene(UC, line(3, 60)); t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('Alpha UC promises', t === 'Networking Event,Cold Caller,Influencer', t);
      chk('UC lv10 masteries', wupSpecFor(UC, 'alpha').lv10.map(c => c.name).join() === 'Rolodex,Hard Sell,Blue Tick');
      sc = scene(OP, line(3, 60)); t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title).join();
      chk('Alpha OP promises', t === 'Hot Take,Three-Hour Episode,Call-In Show', t);
      chk('OP lv10 masteries', wupSpecFor(OP, 'alpha').lv10.map(c => c.name).join() === 'Discourse,Never Ends,Live Studio Audience');
      sc = scene(OP, line(3, 60), { sample: 'baseline' });
      chk('other samples get no podcast branches', !WUP[OP] && !genLoot({ kind: 'fork', w: sc.w, lv: 3 }).some(c => c.title === 'Hot Take'));
      chk('baseline run still has the shared Unwanted Contact set', WUP[UC].A.name === "It's Spreading");
      for (const id of [UC, OP]) { const S = wupSpecFor(id, 'alpha'); for (const k of ['A', 'B', 'C']) chk(id + ' ' + k + ' text is copy or placeholder', /^(TODO_COPY:|[A-Z])/.test(S[k].lv3.desc) && S[k].lv6.length === 2 && !!S[k].wild); }
    });

    // ================= Unwanted Contact
    let sc, base;
    block('UC base', () => { sc = scene(UC, line(8, 60)); base = Object.assign({}, sc.w.s); out.ucBase = { chain: base.chain, jump: base.jump, dmg: +base.dmg.toFixed(1) }; });
    block('Networking Event', () => {
      sc = scene(UC, line(9, 60)); pick(sc.w, 3, 0); chk('chain +2', sc.w.s.chain === base.chain + 2, [sc.w.s.chain, base.chain]);
      shoot(sc); const hitN = sc.es.filter(e => lost(e) > 0).length; chk('A hits chain+1 enemies', hitN === base.chain + 3, hitN);
      chk('the 2 extra jumps are weaker', DMG.length === base.chain + 3 && DMG[base.chain + 2] < DMG[base.chain] * 0.8 && DMG[base.chain + 1] < DMG[base.chain] * 0.9, DMG);
      sc = scene(UC, line(3, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); const e = sc.es[1];
      shoot(sc); chk('Business Card marks the chained', e.al2bc > G.t);
      const other = makeSlot('v_phys_proj', false, 1); chk('Business Card: +15% from other weapons', Math.abs(hookMul('dmgMul', e, { w: other }) - 1.15) < 0.001 && hookMul('dmgMul', e, { w: sc.w }) === 1, hookMul('dmgMul', e, { w: other }));
      sc = scene(UC, line(3, 60)); pick(sc.w, 3, 0); pick(sc.w, 6, 1); shoot(sc);
      chk('Elevator Pitch: first jump double', DMG[0] > DMG[1] * 2.1, DMG);
      sc = scene(UC, [[100, 0], [160, 0], [100, 110, 1e5, 1]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); shoot(sc);
      chk('Lanyard: the Elite is chained before the nearer enemy', ORD[1] === sc.es[2], ORD.map(e => sc.es.indexOf(e)));
      sc = scene(UC, [[100, 0], [160, 0], [100, 110, 1e5, 1]]); pick(sc.w, 3, 0); shoot(sc); chk('without Lanyard the nearer enemy goes first', ORD[1] === sc.es[1], ORD.map(e => sc.es.indexOf(e)));
      sc = scene(UC, line(9, 60)); pick(sc.w, 3, 0); pick(sc.w, 10, 0); shoot(sc);
      chk('Rolodex: no falloff', DMG.length >= 5 && Math.abs(DMG[0] - DMG[5]) < 0.01, DMG);
    });
    block('Cold Caller', () => {
      sc = scene(UC, [[100, 0], [140, 0], [100, 150]]); pick(sc.w, 3, 1); chk('range +40%', Math.abs(sc.w.s.jump / base.jump - 1.4) < 0.01, [sc.w.s.jump, base.jump]);
      shoot(sc); chk('furthest first', ORD[1] === sc.es[2], ORD.map(e => sc.es.indexOf(e)));
      sc = scene(UC, line(2, 60)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); shoot(sc); sc.w.cd = 0; G.t += 1; shoot(sc);
      chk('Follow-Up stuns on the second chain hit', sc.es[0].dazeT > G.t, sc.es[0].dazeT - G.t);
      sc = scene(UC, [[100, 0], [200, 350]]); chk('far enemy on screen for Robo-Call', f10OnView(sc.es[1]));
      pick(sc.w, 3, 1); pick(sc.w, 6, 1); sc.es[0].hp = sc.es[0].maxHp = 1e9; let far = 0; for (let i = 0; i < 40; i++) { shoot(sc, sc.es[0]); if (lost(sc.es[1]) > 0) { far = i + 1; break; } }
      chk('Robo-Call reaches an enemy out of chain range', far > 0, far);
      sc = scene(UC, line(2, 60)); pick(sc.w, 3, 1); pick(sc.w, 6, 2); shoot(sc);
      chk('Do Not Call: chained enemies stop and hold fire', sc.es[0].nfLureT > G.t && sc.es[0].nfNoFireT > G.t);
      sc = scene(UC, line(9, 60)); pick(sc.w, 3, 1); pick(sc.w, 10, 1); shoot(sc);
      chk('Hard Sell: each jump harder', DMG[3] > DMG[0] * 1.8, DMG);
    });
    block('Influencer', () => {
      sc = scene(UC, line(4, 60)); pick(sc.w, 3, 2); chk('no followers yet', !G.al2 || G.al2.fol === 0);
      shoot(sc); chk('followers = enemies chained', G.al2.fol === base.chain + 1 || G.al2.fol === 4, G.al2.fol);
      G.al2.fol = 0; DMG.length = 0; shoot(sc); const d0 = DMG[0]; G.al2.fol = 25; DMG.length = 0; shoot(sc); const d1 = DMG[0];
      chk('25 followers: +50% damage', Math.abs(d1 / d0 - 1.5) < 0.01, [d0, d1]);
      sc = scene(UC, [[100, 0], [260, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); G.al2 = { fol: 25, morn: null, live: null }; shoot(sc);
      chk('Going Viral: at 25 followers the chain jumps twice as far', lost(sc.es[1]) > 0);
      sc = scene(UC, [[100, 0], [260, 0]]); pick(sc.w, 3, 2); G.al2 = { fol: 25, morn: null, live: null }; shoot(sc);
      chk('without Going Viral the gap holds', lost(sc.es[1]) === 0);
      sc = scene(UC, line(3, 60)); pick(sc.w, 3, 2); pick(sc.w, 6, 1); G.player.hp = 500; G.al2 = { fol: 20, morn: null, live: null }; shoot(sc);
      chk('Brand Deal heals', G.player.hp > 500, G.player.hp);
      sc = scene(UC, line(3, 60)); pick(sc.w, 3, 2); G.al2 = { fol: 12, morn: null, live: null }; G.player.iframes = 0; hurtPlayer(5, 't', null, 'contact');
      chk('getting hit loses 5 followers', G.al2.fol === 7, G.al2.fol);
      sc = scene(UC, line(3, 60)); pick(sc.w, 3, 2); pick(sc.w, 10, 2); G.al2 = { fol: 12, morn: null, live: null }; G.player.iframes = 0; hurtPlayer(5, 't', null, 'contact');
      chk('Blue Tick: followers stay', G.al2.fol === 12, G.al2.fol);
      sc = scene(UC, [[80, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); G.al2 = { fol: 25, morn: null, live: null }; G.player.iframes = 0; hurtPlayer(5, 't', null, 'contact');
      chk('Cancelled: a Static blast at 25 followers', lost(sc.es[0]) > 0 && G.al2.fol === 20, [lost(sc.es[0]), G.al2.fol]);
    });
    for (const [lbl, k] of [['Networking Event', 0], ['Cold Caller', 1], ['Influencer', 2]]) block('UC ring ' + lbl, () => {
      sc = scene(UC, ringPts(10)); pick(sc.w, 3, k); pick(sc.w, 6, k === 0 ? 0 : 1); pick(sc.w, 10, k); sc.w.dir = 'nearest'; run(300);
      chk('UC ' + lbl + ' ring run hurts', sc.es.some(e => lost(e) > 0));
    });

    // ================= Obligatory Podcast
    let pb;
    block('OP base', () => { sc = scene(OP, line(4, 50)); pb = Object.assign({}, sc.w.s); shoot(sc); run(40); chk('base waves still fire without a branch', G.proj.some(p => p.pod) && !pods().length); });
    block('Hot Take', () => {
      sc = scene(OP, line(4, 50)); pick(sc.w, 3, 0); shoot(sc); const w1 = pods()[0];
      chk('Hot Take half as wide', w1 && Math.abs(w1.pod.half - 0.175) < 0.001, w1 && w1.pod.half);
      chk('Hot Take 2.5x a wave', w1 && Math.abs(w1.dmg / AL2.opBase(sc.w) - 2.5) < 0.05, w1 && w1.dmg / AL2.opBase(sc.w));
      run(120); chk('Hot Take staggers (Poise)', sc.es.some(e => e.dazeT > 0 && e.al2stagT));
      sc = scene(OP, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 0); run(120);
      chk('Cancelled: a staggered enemy is Feared', sc.es.some(e => e.al2stagT && e.fearT > e.al2stagT));
      sc = scene(OP, line(2, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 1); const e = sc.es[0], s1 = { w: sc.w, al2pod: 0, al2shot: 7 };
      const k1 = wupDmgMul(e, s1), k2 = wupDmgMul(e, Object.assign({}, s1, { al2pod: 1 })), k3 = wupDmgMul(e, Object.assign({}, s1, { al2shot: 8 }));
      chk('Ratio: the second wave of a shot +30%', k1 === 1 && Math.abs(k2 - 1.3) < 0.001 && k3 === 1, [k1, k2, k3]);
      sc = scene(OP, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 6, 2); let echo = 0; run(150, () => { echo = Math.max(echo, G.proj.filter(p => p.pod && p.src && p.src.al2echo).length); });
      chk('Clip Farmer: a stagger spawns an echo wave', echo > 0, echo);
      sc = scene(OP, line(4, 50)); pick(sc.w, 3, 0); pick(sc.w, 10, 0); shoot(sc); run(40);
      chk('Discourse: every wave staggers', sc.es.filter(e => e.dazeT > G.t - 5 && e.al2stagT).length >= 2, sc.es.map(e => e.al2stagT));
      const mce = CARDS.find(c => c.id === 'pass_al_mce'); chk('Main Character Energy card', !!mce && mce.maxRank === 1 && cardOk(mce));
      sc = scene(OP, line(2, 50)); G.muts = G.muts || {}; G.muts.pass_al_mce = 1; sc.es[0].dazeT = G.t + 1;
      chk('MCE: staggered take 20% more', Math.abs(hookMul('dmgMul', sc.es[0], {}) - 1.2) < 0.001 && hookMul('dmgMul', sc.es[1], {}) === 1);
    });
    block('Three-Hour Episode', () => {
      sc = scene(OP, line(4, 50)); pick(sc.w, 3, 1); chk('reach +30%', Math.abs(sc.w.s.range / pb.range - 1.3) < 0.01, [sc.w.s.range, pb.range]);
      shoot(sc); sc.w.cd = 99; run(30); chk('5 waves a shot', sc.w.al2.waveN === 5, sc.w.al2.waveN);
      const wv = G.proj.find(p => p.pod && p.al2); chk('each wave 35% weaker', wv && Math.abs(wv.dmg / AL2.opBase(sc.w) - 0.65) < 0.05, wv && wv.dmg / AL2.opBase(sc.w));
      sc = scene(OP, [[200, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); sc.w.al2.waveN = 4; shoot(sc, sc.es[0]); sc.w.cd = 99; const pulls = G.proj.filter(p => p.src && p.src.al2pull).length; run(70);
      chk('Ad Read: the 5th wave is flagged and pulls enemies in', pulls === 1 && sc.es[0].x < sc.p.x + 200 - 2, [pulls, sc.es[0].x - sc.p.x]);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); run(200);
      chk('Patreon Tier: 3 hits Charge', sc.es[0].al2hitN != null && (sc.es[0].chargeT > 0), [sc.es[0].al2hitN, sc.es[0].chargeT]);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); shoot(sc); let still = 0; run(90, () => { if (G.proj.some(p => p.al2lg && p.vx === 0)) still++; });
      chk('Filler: waves linger', still > 20, still);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1);
      chk('Never Ends: no reload', sc.w.s.mag > 1000 && sc.w.ammo > 1000, [sc.w.s.mag, sc.w.ammo]); run(200); chk('Never Ends never reloads', sc.w.reloadT === 0 && sc.w.ammo > 900, sc.w.ammo);
    });
    block('Call-In Show', () => {
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); sc.w.al2.shots = 2; shoot(sc);
      chk('every 3rd shot is a returning shot', pods().every(p => p.al2ret === 1) && pods().length >= 1, pods().length);
      let back = 0; run(160, () => { back = Math.max(back, G.proj.filter(p => p.al2back).length); }); chk('the waves come back', back > 0, back);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); shoot(sc); chk('shot 1 does not return', pods().every(p => !p.al2ret));
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); G.player.hp = 5e5; sc.w.al2.shots = 2; shoot(sc); const hp0 = G.player.hp; run(240);
      chk('Long-Time Listener: a returning wave heals 1%', G.player.hp > hp0 + 1000, [hp0, G.player.hp]);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); G.t += 3; shoot(sc); const w1 = pods()[0];
      chk('Dead Air: the shot after 2 s of nothing is double', w1 && Math.abs(w1.dmg / AL2.opBase(sc.w) - 2) < 0.05, w1 && w1.dmg / AL2.opBase(sc.w));
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); sc.w.al2.shots = 2; shoot(sc); run(200);
      chk('Caller on Hold stores a returned wave', sc.w.al2.hold >= 1, sc.w.al2.hold);
      const n0 = sc.w.al2.waveN, held = sc.w.al2.hold; sc.w.al2.shots = 0; shoot(sc); run(40); chk('and fires it with the next shot', sc.w.al2.waveN - n0 === 3 + held, sc.w.al2.waveN - n0);
      sc = scene(OP, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); shoot(sc); chk('Live Studio Audience: every shot returns', pods().length > 0 && pods().every(p => p.al2ret === 1));
    });
    for (const [lbl, k] of [['Hot Take', 0], ['Three-Hour Episode', 1], ['Call-In Show', 2]]) block('OP ring ' + lbl, () => {
      sc = scene(OP, ringPts(10)); pick(sc.w, 3, k); pick(sc.w, 6, 0); pick(sc.w, 10, k); sc.w.dir = 'nearest'; run(300);
      chk('OP ' + lbl + ' ring run hurts', sc.es.some(e => lost(e) > 0));
    });

    // ================= gated cards
    block('Morning Routine', () => {
      sc = scene(OP, ringPts(6)); const card = CARDS.find(c => c.id === 'feat_al_morning'); chk('Morning Routine card', !!card && card.kind === 'acquire' && /^TODO_COPY:|[A-Za-z]/.test(card.desc) && card.eligible(G));
      const w = f10Give('al_morning', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0; const r0 = rateBonus();
      const ok = featTap(w); chk('Morning Routine performs on a tap', ok === true, ok);
      chk('Morning Routine: 25% faster', G.al2 && G.al2.morn && Math.abs(rateBonus() / r0 - 1.25) < 0.01, rateBonus() / r0);
      pstGive('snot', 3); G.sticky = true; run(3); chk('Morning Routine: cannot be slowed', !pstHas('snot') && !G.sticky);
      run(60 * 7); chk('Morning Routine ends', !(G.al2.morn) && Math.abs(rateBonus() / r0 - 1) < 0.01);
      chk('Morning Routine deals a little Force', sc.es.some(e => lost(e) > 0));
      chk('Morning Routine gate reads Red Flagship B', typeof F10.al_morning.gate === 'function' && F10.al_morning.gate() === false);
    });
    block('Going Live', () => {
      sc = scene(OP, ringPts(6)); const card = CARDS.find(c => c.id === 'feat_al_golive'); chk('Going Live card', !!card && card.eligible(G));
      const w = f10Give('al_golive', 1); stamInit(); G.stam.cur = G.stam.v = 100; w.cd = 0;
      const ok = featTap(w); chk('Going Live performs on a tap', ok === true, ok); run(30);
      chk('Going Live Charges what the ring touches', sc.es.filter(e => Math.hypot(e.x - G.player.x, e.y - G.player.y) < 110).every(e => e.chargeT > G.t) && sc.es.some(e => e.chargeT > G.t));
      chk('Going Live adds followers', G.al2.fol >= 1, G.al2.fol);
      render();
    });
    block('Diamond Hands', () => {
      sc = scene(OP, [[100, 0]]); const card = CARDS.find(c => c.id === 'pass_al_diamond'); chk('Diamond Hands card (gated: not dealt without Crypto Bro, cardrules.js)', !!card && card.maxRank === 1 && !cardOk(card));
      stamInit(); G.stam.cur = 40; AL1.onPumpBurst.forEach(f => f(null, sc.es[0])); chk('without the passive: nothing', G.stam.cur === 40, G.stam.cur);
      G.muts = G.muts || {}; G.muts.pass_al_diamond = 1; AL1.onPumpBurst.forEach(f => f(null, sc.es[0])); chk('Diamond Hands: +5 stamina on a pump burst', G.stam.cur === 45, G.stam.cur);
    });
    // a Baseline run is untouched: shared UC branches, no podcast branches
    block('Baseline run', () => {
      sc = scene(UC, line(5, 60), { sample: 'baseline' }); pick(sc.w, 3, 0); shoot(sc);
      chk('Baseline UC uses the shared branch (no al2 state)', !sc.w.al2 && sc.w.up.p === 'A', sc.w.al2);
      sc = scene(OP, line(3, 60), { sample: 'baseline' }); chk('Baseline: no podcast branch screen', !genLoot({ kind: 'fork', w: sc.w, lv: 3 }).some(c => c.title === 'Hot Take'));
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('alpha2test OK');
  await b.close();
})();
