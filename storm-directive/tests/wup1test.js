// Weapon branches, batch 1 (wup1.js): Standard Issue, Maximum Gains, Nervous Wreck, Panic Button.
// For each weapon and each promise: take the Lv 3 card from the real fork screen, run 300 frames against a ring of
// enemies (no errors), and check the promise's signature. Then each Lv 6 card and each mastery: apply it, run 300
// frames, and check something measurable.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    // A fresh run with one weapon and enemies at (dx, dy[, hp]) from the swimmer.
    const scene = (id, pts, o) => {
      o = o || {};
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = 0; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; if (o.quiet) G.weapons[0].cd = 1e9;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (o.r) e.r = o.r; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], es, p };
    };
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    let PIN = null;
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const hits = (e, n, amt, w, atk) => { for (let i = 0; i < n; i++) damageEnemy(e, amt || 5, { elem: 'phys', w, atk: atk || 'contact', noCrit: true, wname: 'test' }); };
    const echo = (w) => Math.round(G.stats.dmg[w.def.name + ' (echo)'] || 0);
    const hpLost = e => e.maxHp - e.hp;
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    // Take Lv 3 (promise index pi), then a ring run of 300 frames with no errors.
    const promise = (id, pi, name) => {
      const sc = scene(id, ringPts(12)); const t = pick(sc.w, 3, pi);
      block(name + ' ring', () => run(300));
      return sc;
    };
    // The same scene in a fresh run for the Lv 6 / 10 cards: take the promise, then the card, 300 frames.
    const card = (id, pi, lv, ci, pts, o, name) => {
      const sc = scene(id, pts || ringPts(12), o); pick(sc.w, 3, pi);
      if (lv === 6) pick(sc.w, 6, ci); if (lv === 10) pick(sc.w, 10, ci);
      return sc;
    };
    const ring12 = (sc, name) => block(name + ' ring', () => run(300));

    // ================================================================ STANDARD ISSUE
    const SI = 'v_phys_proj';
    block('SI base', () => {
      const sc = scene(SI, [[100, 0]]); const t3 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
      chk('SI promises', t3.join() === 'Ricochet Brain,Through and Through,Marked for Bonking', t3);
    });
    // A. Ricochet Brain
    block('SI A', () => {
      const sc = promise(SI, 0, 'SI A'); chk('SI A hook', sc.w.w1.p === 'A');
      const dA = scene(SI, []).w.s.dmg; const s2 = scene(SI, [[140, 0], [150, 70]]); pick(s2.w, 3, 0);
      chk('SI A first hit 15% weaker', Math.abs(s2.w.s.dmg / dA - 0.85) < 0.001, [s2.w.s.dmg, dA]);
      run(180);
      chk('SI A bounced to a second enemy', hpLost(s2.es[1]) > 0, hpLost(s2.es[1]));
    });
    block('SI A cradle', () => {
      const s = scene(SI, [[140, 0], [150, 70]]); pick(s.w, 3, 0); pick(s.w, 6, 0); run(300);
      chk('SI Newtons Cradle collision', echo(s.w) > 0, echo(s.w));
    });
    block('SI A last orders', () => {
      const pts = [[140, 0], [150, 70], [110, 130], [180, 150], [140, 220]];
      const s = scene(SI, pts); pick(s.w, 3, 0); pick(s.w, 6, 1); let mx = 0;
      run(300, () => { for (const q of G.proj) if (q.w === s.w && q.wb > mx) mx = q.wb; });
      chk('SI Last Orders 3 bounces', mx >= 3, mx);
    });
    block('SI A squirrel', () => {
      const s = scene(SI, [[200, 0]]); pick(s.w, 3, 0); pick(s.w, 6, 2);
      spawnProj(s.w, s.p.x + 60, s.p.y + 200, 0, weaponSrc(s.w), { life: 0.01, max: 0.01 }); run(3);
      chk('SI Squirrel nut on the floor', G.w1.nuts.length === 1, G.w1.nuts.length);
      s.p.x = G.w1.nuts[0].x; s.p.y = G.w1.nuts[0].y; const n0 = G.proj.length; run(2);
      chk('SI Squirrel fired again', G.w1.nuts.length === 0, G.w1.nuts.length);
      ring12(card(SI, 0, 6, 2, null, null), 'SI Squirrel');
    });
    // B. Through and Through
    block('SI B', () => {
      const sc = promise(SI, 1, 'SI B'); const base = scene(SI, []); const cd0 = base.w.s.cd;
      const pts = [60, 100, 140, 180, 220, 260].map(x => [x, 0]);
      const s = scene(SI, pts, { r: 6 }); pick(s.w, 3, 1);
      chk('SI B fire rate -20%', Math.abs(s.w.s.cd / cd0 - 1.25) < 0.01, [s.w.s.cd, cd0]);
      chk('SI B pierce 3', s.w.s.pierce === 3, s.w.s.pierce);
      let grow = 0; run(45, () => { for (const q of G.proj) if (q.w === s.w && q.wbase && q.dmg > q.wbase * 1.2) grow = 1; });
      const nh = s.es.filter(e => e.hp < e.maxHp).length;
      chk('SI B pierced 4', nh === 4, nh); chk('SI B later hits harder', grow === 1);
    });
    block('SI B momentum', () => {
      const s = scene(SI, [60, 100, 140, 180, 220, 260].map(x => [x, 0]), { r: 6 }); pick(s.w, 3, 1); pick(s.w, 6, 0);
      let big = 0, fast = 0; run(45, () => { for (const q of G.proj) if (q.w === s.w) { if (q.wr0 && q.r >= q.wr0 * 1.99) big = 1; if (q.wr0 && Math.hypot(q.vx, q.vy) > s.w.s.speed * 1.2) fast = 1; } });
      const nh = s.es.filter(e => e.hp < e.maxHp).length;
      chk('SI Momentum pierces 5', nh === 5, nh); chk('SI Momentum speeds up', fast === 1); chk('SI Momentum double size', big === 1);
      ring12(card(SI, 1, 6, 0), 'SI Momentum');
    });
    block('SI B contraflow', () => {
      const s = scene(SI, [60, 100, 140, 180, 220, 260, 300].map(x => [x, 0]), { r: 6 }); pick(s.w, 3, 1); pick(s.w, 6, 1);
      let lanes = 0, shoved = 0; run(60, () => { lanes = Math.max(lanes, G.w1.lanes.length); for (const l of G.w1.lanes) shoved = Math.max(shoved, l.hit.size); });
      chk('SI Contraflow lane', lanes > 0, lanes);
      ring12(card(SI, 1, 6, 1), 'SI Contraflow');
    });
    block('SI B conkers', () => {
      const s = scene(SI, [[100, 0], [100, 56]], { r: 6 }); pick(s.w, 3, 1); pick(s.w, 6, 2);
      let c = 0; run(70, () => { c = Math.max(c, G.w1.conk.length); });
      chk('SI Conkers swung', c > 0, c); chk('SI Conkers hit the bystander', hpLost(s.es[1]) > 0, hpLost(s.es[1]));
      ring12(card(SI, 1, 6, 2), 'SI Conkers');
    });
    // C. Marked for Bonking
    block('SI C', () => {
      const sc = promise(SI, 2, 'SI C');
      const s = scene(SI, [[100, 0]]); pick(s.w, 3, 2); const e = s.es[0];
      for (let i = 0; i < 3; i++) hits(e, 1, 5, s.w, 'proj'); chk('SI C unmarked after 3', !e.w1mk);
      hits(e, 1, 5, s.w, 'proj'); chk('SI C marked on the 4th', e.w1mk === 1, e.w1n);
      const hp0 = e.hp; hits(e, 1, 5, s.w, 'proj'); const bonk = hp0 - e.hp;
      chk('SI C bonk x2.5', bonk > 11 && !e.w1mk, bonk);
      const sh = scene(SI, [[100, 0]], { def: ENEMIES.diatom }); pick(sh.w, 3, 2); const L0 = fightCd(sh.es[0]).layers; hits(sh.es[0], 5, 5, sh.w, 'proj');
      chk('SI C bonk knocks off a Shell layer', sh.es[0].cd.layers < L0, [L0, sh.es[0].cd.layers]);
    });
    block('SI C soft spot', () => {
      const s = scene(SI, [[100, 0], [100, 30]]); pick(s.w, 3, 2); pick(s.w, 6, 0);
      const o = makeSlot('v_phys_burst', false, 1); G.weapons[1] = o;
      hits(s.es[0], 4, 1, s.w, 'proj'); chk('SI soft spot marked', s.es[0].w1mk === 1);
      const d0 = damageEnemy(s.es[0], 100, { elem: 'phys', w: o, atk: 'burst', noCrit: true }), d1 = damageEnemy(s.es[1], 100, { elem: 'phys', w: o, atk: 'burst', noCrit: true });
      chk('SI Soft Spot +20%', Math.abs(d0 / d1 - 1.2) < 0.02, [d0, d1]);
      ring12(card(SI, 2, 6, 0), 'SI Soft Spot');
    });
    block('SI C concussion', () => {
      const s = scene(SI, [[100, 0]], { def: ENEMIES.diatom }); pick(s.w, 3, 2); pick(s.w, 6, 1); const e = s.es[0]; e.elite = true;
      hits(e, 3, 5, s.w, 'proj'); chk('SI Concussion elite marked on the 3rd', e.w1mk === 1);
      hits(e, 1, 5, s.w, 'proj'); chk('SI Concussion staggers', e.dazeT > G.t, e.dazeT);
      ring12(card(SI, 2, 6, 1), 'SI Concussion');
    });
    block('SI C nut allergy', () => {
      const s = scene(SI, [[100, 0, 5], [130, 0]]); pick(s.w, 3, 2); pick(s.w, 6, 2);
      damageEnemy(s.es[0], 50, { elem: 'phys', w: s.w, atk: 'proj', noCrit: true }); const x0 = s.es[1].x; run(25);
      chk('SI Nut Allergy shoved the neighbour', s.es[1].x - x0 > 5, s.es[1].x - x0);
      ring12(card(SI, 2, 6, 2), 'SI Nut Allergy');
    });
    // masteries
    block('SI shell shock', () => {
      const s = scene(SI, [[100, 0]], { def: ENEMIES.diatom }); pick(s.w, 3, 2); const cd0 = s.w.s.cd; pick(s.w, 10, 0);
      chk('SI Shell Shock fire rate', Math.abs(cd0 / s.w.s.cd - 1.5) < 0.01, [cd0, s.w.s.cd]);
      const L0 = fightCd(s.es[0]).layers; hits(s.es[0], 1, 1, s.w, 'proj'); chk('SI Shell Shock heavy', s.es[0].cd.layers < L0, [L0, s.es[0].cd.layers]);
      ring12(card(SI, 2, 10, 0), 'SI Shell Shock');
    });
    block('SI infinite nuts', () => {
      const pts = Array.from({ length: 10 }, (_, i) => [100 + (i % 2) * 40, i * 25 - 100]);
      const s = scene(SI, pts, { r: 6 }); pick(s.w, 3, 0); pick(s.w, 10, 1);
      chk('SI Infinite Nuts pierce', s.w.s.pierce >= 11, s.w.s.pierce);
      let mb = 0, mn = 0; run(200, () => { for (const q of G.proj) if (q.w === s.w) { mb = Math.max(mb, q.wb || 0); mn = Math.max(mn, q.wn || 0); } });
      chk('SI Infinite Nuts bounces past 2', mb > 2, mb); chk('SI Infinite Nuts cap 12', mn <= 12, mn);
      ring12(card(SI, 0, 10, 1), 'SI Infinite Nuts');
    });
    block('SI squirrel away', () => {
      const s = scene(SI, [[100, 0]]); pick(s.w, 3, 2); pick(s.w, 10, 2);
      for (let i = 0; i < 10; i++) fireWeapon(s.w, s.es[0]);
      chk('SI Squirrel Away counted', s.w.w1.n === 10, s.w.w1.n);
      let mx = 0; run(30, () => { mx = Math.max(mx, G.proj.filter(q => q.w === s.w && q.src.wupEcho).length); });
      chk('SI Squirrel Away unloaded ten', mx >= 6, mx);
      ring12(card(SI, 2, 10, 2), 'SI Squirrel Away');
    });

    // ================================================================ MAXIMUM GAINS
    const MG = 'v_phys_spread';
    block('MG base', () => { const sc = scene(MG, [[100, 0]]); const t3 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title); chk('MG promises', t3.join() === 'Shotgun Wedding,More Is More,Get Off Me!', t3); });
    block('MG A', () => {
      const b = scene(MG, []); const sp0 = b.w.s.spread;
      const s = scene(MG, [[100, 0], [180, 0]]); pick(s.w, 3, 0);
      chk('MG A cone a third', Math.abs(s.w.s.spread - sp0 / 3) < 1e-6, [s.w.s.spread, sp0]); chk('MG A range 200', s.w.s.range <= 200, s.w.s.range);
      const a = damageEnemy(s.es[0], 10, { elem: 'phys', w: s.w, atk: 'spread', noCrit: true }), c = damageEnemy(s.es[1], 10, { elem: 'phys', w: s.w, atk: 'spread', noCrit: true });
      chk('MG A +60% inside 120', Math.abs(a / c - 1.6) < 0.05, [a, c]);
      promise(MG, 0, 'MG A');
    });
    block('MG A kickback', () => {
      const s = scene(MG, [[60, 0]], { r: 14 }); pick(s.w, 3, 0); pick(s.w, 6, 0); let k = 0, lg = 0;
      run(120, () => { for (const v of G.w1.vol.values()) if (v.kicked) k = 1; if (modS().lunge && modS().lunge.left > 0) lg = 1; });
      chk('MG Kickback fired', k === 1); chk('MG Kickback kicked me back', lg === 1);
      ring12(card(MG, 0, 6, 0), 'MG Kickback');
    });
    block('MG A slug', () => {
      const s = scene(MG, [[100, 0]], { quiet: 1 }); pick(s.w, 3, 0); pick(s.w, 6, 1); let sl = null, n = 0;
      for (let i = 0; i < 3; i++) { G.proj.length = 0; fireWeapon(s.w, s.es[0]); n = G.proj.length; sl = G.proj.find(q => q.wslug); }
      chk('MG Slug on the 3rd volley, one shot', sl && n === 1, n); chk('MG Slug pierces 3 and hits like the whole volley', sl && sl.pierce === 3 && sl.dmg > s.w.s.dmg * 3, sl && sl.dmg);
            ring12(card(MG, 0, 6, 1), 'MG Slug');
    });
    block('MG A confetti', () => {
      const s = scene(MG, [[400, 0]]); pick(s.w, 3, 0); pick(s.w, 6, 2);
      spawnProj(s.w, s.p.x + 100, s.p.y + 100, 0, weaponSrc(s.w), { life: 0.01, max: 0.01 }); run(3);
      chk('MG Confetti stuck', G.w1.pips.length === 1, G.w1.pips.length);
      const e = makeEnemy(plain, G.w1.pips[0].x, G.w1.pips[0].y); e.hp = e.maxHp = 1e5; e.speed = 0; e.tst = 1; G.enemies.push(e); run(5);
      chk('MG Confetti hit what swam over', hpLost(e) > 0, hpLost(e)); ring12(card(MG, 0, 6, 2), 'MG Confetti');
    });
    block('MG B', () => {
      const b = scene(MG, []); const c0 = b.w.s.count, sp0 = b.w.s.spread;
      const s = scene(MG, [[100, 0]]); pick(s.w, 3, 1);
      chk('MG B +5 pellets', s.w.s.count === c0 + 5, [s.w.s.count, c0]); chk('MG B fan 50% wider', Math.abs(s.w.s.spread / sp0 - 1.5) < 1e-6);
      fireWeapon(s.w, s.es[0]); const ds = G.proj.filter(q => q.w === s.w).map(q => q.dmg), lo = ds.filter(d => d < s.w.s.dmg * 0.7).length;
      chk('MG B five at 60%', lo === 5 && ds.length === c0 + 5, [lo, ds.length]); promise(MG, 1, 'MG B');
    });
    block('MG B overspill', () => {
      const s = scene(MG, [[400, 0]]); pick(s.w, 3, 1); pick(s.w, 6, 0);
      spawnProj(s.w, s.p.x + 100, s.p.y + 100, 0, weaponSrc(s.w), { life: 0.01, max: 0.01 }); run(2);
      const sp = G.proj.filter(q => q.w === s.w && q.wsplit);
      chk('MG Overspill split in two', sp.length === 2, sp.length); ring12(card(MG, 1, 6, 0), 'MG Overspill');
    });
    block('MG B roundabout', () => {
      const s = scene(MG, [[100, 0]]); pick(s.w, 3, 1); pick(s.w, 6, 1);
      for (let i = 0; i < 4; i++) { G.proj.length = 0; fireWeapon(s.w, s.es[0]); }
      const rn = G.proj.filter(q => q.w === s.w && q.src.atk === 'burst').length;
      chk('MG Roundabout ring of 20 on the 4th', rn === 20, rn); ring12(card(MG, 1, 6, 1), 'MG Roundabout');
    });
    block('MG B rice', () => {
      const s = scene(MG, [[100, 0]]); pick(s.w, 3, 1); pick(s.w, 6, 2);
      G.proj.length = 0; fireWeapon(s.w, s.es[0]); const fwd = G.proj.filter(q => q.vx > 0).length;
      G.proj.length = 0; fireWeapon(s.w, s.es[0]); const back = G.proj.filter(q => q.vx < 0).length;
      chk('MG Wedding Rice second volley behind', fwd > 8 && back > 8, [fwd, back]); ring12(card(MG, 1, 6, 2), 'MG Wedding Rice');
    });
    block('MG C', () => {
      const b = scene(MG, []); const d0 = b.w.s.dmg;
      const s = scene(MG, [[80, 0]], { r: 14 }); pick(s.w, 3, 2);
      chk('MG C -15%', Math.abs(s.w.s.dmg / d0 - 0.85) < 0.001, [s.w.s.dmg, d0]); chk('MG C knock', s.w.s.knock >= 70, s.w.s.knock);
      let mh = 0; run(120, () => { for (const v of G.w1.vol.values()) for (const n of v.hits.values()) mh = Math.max(mh, n); });
      chk('MG C 3+ pellets hit one enemy', mh >= 3, mh); chk('MG C shoved', Math.abs(s.es[0].x - (s.p.x + 80)) > 5, s.es[0].x - s.p.x);
      promise(MG, 2, 'MG C');
    });
    block('MG C pile-up', () => {
      const s = scene(MG, [[70, 0], [100, 0]], { r: 14 }); pick(s.w, 3, 2); pick(s.w, 6, 0); run(120);
      chk('MG Pile-Up collision damage', echo(s.w) > 0, echo(s.w)); ring12(card(MG, 2, 6, 0), 'MG Pile-Up');
    });
    block('MG C skittles', () => {
      const s = scene(MG, [[70, 0], [100, 0], [130, 0]], { r: 14 }); pick(s.w, 3, 2); pick(s.w, 6, 1); let md = 0;
      run(120, () => { for (const v of G.w1.vol.values()) md = Math.max(md, v.cap.n); });
      chk('MG Skittles passes it on (two collisions)', md >= 2, md); chk('MG Skittles collision damage', echo(s.w) > 0, echo(s.w)); ring12(card(MG, 2, 6, 1), 'MG Skittles');
    });
    block('MG C hiccups', () => {
      const b = scene(MG, []); const cd0 = b.w.s.cd; const s = scene(MG, [[100, 0]]); pick(s.w, 3, 2); pick(s.w, 6, 2);
      chk('MG Hiccups faster', Math.abs(s.w.s.cd / cd0 - 0.8) < 0.001, [s.w.s.cd, cd0]);
      let dbl = 0, sum = 0; for (let i = 0; i < 400; i++) { s.w.cd = 0; G.proj.length = 0; fireWeapon(s.w, s.es[0]); const d = s.w.cd / s.w.s.cd; sum += d; if (d < -0.9) dbl++; }
      chk('MG Hiccups sometimes fire twice, about 30% faster overall', dbl > 40 && dbl < 130 && (s.w.s.cd * (1 + sum / 400)) / cd0 < 0.8, [dbl, sum / 400]); ring12(card(MG, 2, 6, 2), 'MG Hiccups');
    });
    block('MG masteries', () => {
      const b = scene(MG, []); const c0 = b.w.s.count, cd0 = b.w.s.cd, d0 = b.w.s.dmg;
      let s = scene(MG, [[80, 0]]); pick(s.w, 3, 0); pick(s.w, 10, 0);
      chk('MG Baby Boom x3', s.w.s.count === c0 * 3, [s.w.s.count, c0]); let lg = 0; run(90, () => { if (modS().lunge && modS().lunge.left > 0) lg = 1; }); chk('MG Baby Boom recoil', lg === 1);
      ring12(card(MG, 0, 10, 0), 'MG Baby Boom');
      s = scene(MG, [[70, 0], [100, 0]], { r: 14 }); pick(s.w, 3, 2); pick(s.w, 10, 1); run(150);
      chk('MG Riot Control collisions', echo(s.w) > 0, echo(s.w)); ring12(card(MG, 2, 10, 1), 'MG Riot Control');
      s = scene(MG, [[100, 0]]); pick(s.w, 3, 1); pick(s.w, 10, 2);
      chk('MG Full Auto 4x', s.w.s.cd < cd0 * 0.26, [s.w.s.cd, cd0]); chk('MG Full Auto -40%', s.w.s.dmg < d0 * 0.61, [s.w.s.dmg, d0]); run(300);
      chk('MG Full Auto no reload', s.w.w1.vn >= 10, s.w.w1.vn); ring12(card(MG, 1, 10, 2), 'MG Full Auto');
    });

    // ================================================================ NERVOUS WRECK
    const NW = 'v_phys_contact';
    block('NW base', () => { const sc = scene(NW, [[60, 0]]); const t3 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title); chk('NW promises', t3.join() === 'Vice Grip,Shell Game,Back Off!', t3); });
    block('NW A', () => {
      const b = scene(NW, []); const cd0 = b.w.s.cd;
      const s = scene(NW, [[60, 0]]); pick(s.w, 3, 0); const e = s.es[0], x0 = e.x;
      chk('NW A one clamp per 0.8 s', Math.abs(s.w.s.cd / cd0 - 1.34) < 0.01, [s.w.s.cd, cd0]);
      hits(e, 1, 5, s.w); chk('NW A held', G.w1.held.length === 1 && e.dazeT > G.t); run(15);
      chk('NW A stays put', Math.abs(e.x - x0) < 1, e.x - x0); run(40); chk('NW A released', G.w1.held.length === 0);
      promise(NW, 0, 'NW A');
    });
    block('NW A getaway', () => {
      const s = scene(NW, [[60, 0]]); pick(s.w, 3, 0); pick(s.w, 6, 0); hits(s.es[0], 1, 5, s.w); run(2);
      chk('NW Getaway speed', G.penHasteK === 1.25 && G.penHasteT > G.t, G.penHasteK); ring12(card(NW, 0, 6, 0), 'NW Getaway');
    });
    block('NW A friend', () => {
      const s = scene(NW, [[60, 0], [100, 0]], { r: 8 }); pick(s.w, 3, 0); pick(s.w, 6, 1); hits(s.es[0], 1, 5, s.w);
      chk('NW Bring a Friend collision', echo(s.w) > 0, echo(s.w)); ring12(card(NW, 0, 6, 1), 'NW Bring a Friend');
    });
    block('NW A tooth', () => {
      const s = scene(NW, [[300, 0]]); pick(s.w, 3, 0); pick(s.w, 6, 2);
      const bl = { x: s.p.x + 40, y: s.p.y, vx: 0, vy: 0, dmg: 5, r: 4, color: '#f00', life: 5, from: 't' }; G.ebul.push(bl); run(3);
      chk('NW Tooth and Nail crushed it', bl.dead, bl.dead); ring12(card(NW, 0, 6, 2), 'NW Tooth and Nail');
    });
    block('NW B', () => {
      const s = scene(NW, [[60, 0]], { def: ENEMIES.diatom }); pick(s.w, 3, 1); const e = s.es[0], L0 = fightCd(e).layers;
      hits(e, 2, 5, s.w); chk('NW B nothing at 2', e.cd.layers === L0, e.cd.layers); hits(e, 1, 5, s.w); chk('NW B 3rd clamp sheds a layer', e.cd.layers === L0 - 1, e.cd.layers);
      const p = scene(NW, [[60, 0]]); pick(p.w, 3, 1); hits(p.es[0], 3, 5, p.w); chk('NW B crack', p.es[0].w3crack === 1, p.es[0].w3crack);
      hits(p.es[0], 9, 5, p.w); chk('NW B crack caps at 3', p.es[0].w3crack === 3, p.es[0].w3crack);
      const q = scene(NW, [[60, 0], [60, 40]]); pick(q.w, 3, 1); q.es[0].w3crack = 2;
      const d0 = damageEnemy(q.es[0], 10, { elem: 'phys', w: q.w, atk: 'contact', noCrit: true, wupEcho: true }), d1 = damageEnemy(q.es[1], 10, { elem: 'phys', w: q.w, atk: 'contact', noCrit: true, wupEcho: true });
      chk('NW B +30% at two cracks', Math.abs(d0 / d1 - 1.3) < 0.03, [d0, d1]); promise(NW, 1, 'NW B');
    });
    block('NW B seep', () => {
      const s = scene(NW, [[60, 0], [60, 20]], { r: 12 }); pick(s.w, 3, 1); pick(s.w, 6, 0); s.es[0].w3crack = 1; hits(s.es[0], 1, 10, s.w);
      chk('NW Seepage splash', hpLost(s.es[1]) > 0 && echo(s.w) > 0, hpLost(s.es[1])); ring12(card(NW, 1, 6, 0), 'NW Seepage');
    });
    block('NW B open', () => {
      const s = scene(NW, [[60, 0]], { def: ENEMIES.diatom }); pick(s.w, 3, 1); pick(s.w, 6, 1); const e = s.es[0];
      e.cd = makeDefence(e.maxHp, 'shell', 'normal', { layers: 1 }); e.cd.hp = e.hp; hits(e, 3, 5, s.w);
      chk('NW Cracked Open', e.w3open === 1 && e.dazeT > G.t, [e.w3open, e.dazeT]); ring12(card(NW, 1, 6, 1), 'NW Cracked Open');
    });
    block('NW B nut sack', () => {
      const s = scene(NW, [[60, 0], [300, 0]]); pick(s.w, 3, 1); pick(s.w, 6, 2); let seen = 0;
      for (let i = 0; i < 6; i++) { fireWeapon(s.w, s.es[0]); seen += G.proj.filter(q => q.w === s.w && q.wheavy).length; G.proj.length = 0; }
      chk('NW Nut Sack flung the sixth', seen === 1 && s.w.w1.nuts === 0, [seen, s.w.w1.nuts]); ring12(card(NW, 1, 6, 2), 'NW Nut Sack');
    });
    block('NW C', () => {
      const s = scene(NW, [[400, 0], [400, 60]], { r: 8 }); pick(s.w, 3, 2); const e = s.es[0], f = e2 => 0;
      run(2); e.x = s.p.x + 60; e.y = s.p.y; gridBuild(); run(2);
      chk('NW C entered', e.w3ent === 1, e.w3ent);
      const d0 = damageEnemy(e, 10, { elem: 'phys', w: s.w, atk: 'contact', noCrit: true, kx: 1, ky: 0 }); hits(e, 0);
      const d1 = damageEnemy(e, 10, { elem: 'phys', w: s.w, atk: 'contact', noCrit: true, kx: 1, ky: 0 });
      chk('NW C counter x2 then later clamps 20% weaker', Math.abs(d0 / d1 - 2.5) < 0.1, [d0, d1]); chk('NW C thrown', Math.hypot(e.kx, e.ky) > 100);
      promise(NW, 2, 'NW C');
    });
    block('NW C knock-on', () => {
      const s = scene(NW, [[400, 0], [400, 60]], { r: 10 }); pick(s.w, 3, 2); pick(s.w, 6, 0); const e = s.es[0], o = s.es[1];
      run(2); e.x = s.p.x + 60; e.y = s.p.y; o.x = s.p.x + 90; o.y = s.p.y; o.w3in = 1; gridBuild(); run(2);
      damageEnemy(e, 10, { elem: 'phys', w: s.w, atk: 'contact', noCrit: true, kx: 1, ky: 0 }); const x0 = o.x; run(20);
      chk('NW Knock-On knocked the second back', o.x - x0 > 5, o.x - x0); ring12(card(NW, 2, 6, 0), 'NW Knock-On');
    });
    block('NW C closing', () => {
      const s = scene(NW, [[400, 0], [400, 30], [400, -30]], { r: 8 }); pick(s.w, 3, 2); pick(s.w, 6, 1); run(2);
      s.es.forEach((e, i) => { e.x = s.p.x + 70; e.y = s.p.y + (i - 1) * 25; }); gridBuild(); const hp0 = s.es.map(e => e.hp); run(4);
      chk('NW Closing Time snapped them', s.w.w1.ringT > 0 && s.es.every((e, i) => e.hp < hp0[i]), s.w.w1.ringT); ring12(card(NW, 2, 6, 1), 'NW Closing Time');
    });
    block('NW C hug', () => {
      const s = scene(NW, [[60, 0]]); pick(s.w, 3, 2); pick(s.w, 6, 2); s.es[0].w3ent = 0; hits(s.es[0], 1, 5, s.w); run(5);
      chk('NW Hug It Out carried', G.w1.carry && G.w1.carry.e === s.es[0] && Math.hypot(s.es[0].x - s.p.x, s.es[0].y - s.p.y) < 50, G.w1.carry && 1);
      G.ebul.push({ x: s.es[0].x, y: s.es[0].y, vx: 0, vy: 0, dmg: 30, r: 4, color: '#f00', life: 5, from: 't' }); const h0 = s.es[0].hp; run(3);
      chk('NW Hug soaked a shot', s.es[0].hp < h0, h0 - s.es[0].hp); ring12(card(NW, 2, 6, 2), 'NW Hug It Out');
    });
    block('NW masteries', () => {
      let s = scene(NW, [[200, 0]]); pick(s.w, 3, 2); pick(s.w, 10, 0); chk('NW Jaws range', s.w.s.range === 240, s.w.s.range); run(120);
      chk('NW Jaws of Life reached 200', hpLost(s.es[0]) > 0, hpLost(s.es[0])); ring12(card(NW, 2, 10, 0), 'NW Jaws of Life');
      s = scene(NW, [[60, 0]], { def: ENEMIES.diatom, quiet: 1 }); pick(s.w, 3, 1); pick(s.w, 10, 1); G.player.hp = 5e5; run(60);
      const hp0 = G.player.hp; s.w.cd = 1e9; hits(s.es[0], 1, 5, s.w); chk('NW Crack Addict healed', G.player.hp > hp0 && G.player.hp - hp0 <= 6.01, G.player.hp - hp0);
      ring12(card(NW, 1, 10, 1), 'NW Crack Addict');
      s = scene(NW, [[60, 0]]); pick(s.w, 3, 0); pick(s.w, 10, 2); run(5);
      const e = s.es[0]; G.P.dodge = 0; const dealt = () => { pdef().mem.mem = 0; G.player.hp = 5e5; G.player.iframes = 0; hurtPlayer(100, 't', e, 'contact'); return 5e5 - G.player.hp; };
      s.w.w1.inRange = true; const a = dealt(); s.w.w1.inRange = false; const b2 = dealt();
      chk('NW Untouchable halves Contact damage', b2 > 0 && Math.abs(a / b2 - 0.5) < 0.06, [a, b2]); ring12(card(NW, 0, 10, 2), 'NW Untouchable');
    });

    block('NW untouchable with Vice Grip', () => {
      const s = scene(NW, [[60, 0]]); pick(s.w, 3, 0); pick(s.w, 10, 2); run(5);
      chk('NW Untouchable senses range under any promise', s.w.w1.inRange === true, s.w.w1.inRange);
    });
    // ================================================================ PANIC BUTTON
    const PB = 'v_phys_burst';
    const blast = (s, t) => { fireWeapon(s.w, t || s.es[0]); run(40); };
    block('PB base', () => { const sc = scene(PB, [[100, 0]]); const t3 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title); chk('PB promises', t3.join() === 'Bigger Bang Theory,Chain Reaction,Premature Evacuation', t3); });
    block('PB A', () => {
      const b = scene(PB, []); const a0 = b.w.s.area;
      const s = scene(PB, [[150, 0], [150, 60]], { r: 4, quiet: 1 }); pick(s.w, 3, 0); const R = s.w.s.area;
      chk('PB A radius +40%', Math.abs(R / a0 - 1.4) < 1e-6, [R, a0]);
      s.es[1].x = s.es[0].x; s.es[1].y = s.es[0].y + R * 0.9; gridBuild(); fireWeapon(s.w, s.es[0]); run(40);
      chk('PB A rim hits harder than centre', hpLost(s.es[1]) > hpLost(s.es[0]) * 1.4, [hpLost(s.es[0]), hpLost(s.es[1])]);
      promise(PB, 0, 'PB A');
    });
    block('PB A edge', () => {
      const s = scene(PB, [[200, 0]], { quiet: 1 }); pick(s.w, 3, 0); pick(s.w, 6, 0); fireWeapon(s.w, s.es[0]);
      const wn = G.fx.find(f => f.type === 'warn'); chk('PB Edge Case shifted towards me', wn && Math.abs(wn.x - s.es[0].x) > s.w.s.area * 0.4, wn && wn.x - s.es[0].x);
      ring12(card(PB, 0, 6, 0), 'PB Edge Case');
    });
    block('PB A encore', () => {
      const s = scene(PB, [[200, 0], [200 + 0, 0]], { r: 4, quiet: 1 }); pick(s.w, 3, 0); pick(s.w, 6, 1); const R = s.w.s.area;
      s.es[1].x = s.es[0].x + R * 1.5; s.es[1].y = s.es[0].y; gridBuild();
      for (let i = 0; i < 3; i++) { fireWeapon(s.w, s.es[0]); run(40); }
      chk('PB Encore not on blasts 1 to 3', hpLost(s.es[1]) === 0, hpLost(s.es[1])); fireWeapon(s.w, s.es[0]); run(70);
      chk('PB Encore ring on the 4th', hpLost(s.es[1]) > 0, hpLost(s.es[1])); ring12(card(PB, 0, 6, 1), 'PB Encore');
    });
    block('PB A grudge', () => {
      const s = scene(PB, [[100, 0], [250, 0]], { quiet: 1 }); pick(s.w, 3, 0); pick(s.w, 6, 2); G.grudge = s.es[1]; fireWeapon(s.w, s.es[0]);
      const wn = G.fx.find(f => f.type === 'warn'); chk('PB Grudge Match', wn && Math.abs(wn.x - s.es[1].x) < 1, wn && wn.x); ring12(card(PB, 0, 6, 2), 'PB Grudge Match');
    });
    block('PB B', () => {
      const b = scene(PB, []); const d0 = b.w.s.dmg;
      const s = scene(PB, [[150, 0, 1], [150, 0, 1], [150, 0, 1], [150, 0, 1]], { r: 4, quiet: 1 }); pick(s.w, 3, 1); const R = s.w.s.area;
      chk('PB B -15%', Math.abs(s.w.s.dmg / d0 - 0.85) < 1e-6);
      const [e0, e1, e2, e3] = s.es; e0.x = s.p.x + 150; e1.x = e0.x + 0.7 * R; e2.x = e1.x + 0.4 * R + 3; e3.x = e2.x + 0.4 * R + 3; [e1, e2, e3].forEach(e => e.y = e0.y); e0.y = s.p.y; e1.y = e2.y = e3.y = e0.y; gridBuild();
      fireWeapon(s.w, e0); run(60);
      chk('PB B main kills', e0.dead && e1.dead, [e0.dead, e1.dead]); chk('PB B the pop killed the next', e2.dead, e2.dead); chk('PB B pops do not chain at Lv 3', !e3.dead);
      promise(PB, 1, 'PB B');
    });
    block('PB B daisy', () => {
      const s = scene(PB, [[150, 0, 1], [150, 0, 1], [150, 0, 1], [150, 0, 1]], { r: 4, quiet: 1 }); pick(s.w, 3, 1); pick(s.w, 6, 0); const R = s.w.s.area;
      const [e0, e1, e2, e3] = s.es; e0.x = s.p.x + 150; e1.x = e0.x + 0.7 * R; e2.x = e1.x + 0.4 * R + 3; e3.x = e2.x + 0.4 * R + 3; e0.y = e1.y = e2.y = e3.y = s.p.y; gridBuild();
      fireWeapon(s.w, e0); run(90); chk('PB Daisy Chain reached the fourth', e3.dead, [e0.dead, e1.dead, e2.dead, e3.dead]); ring12(card(PB, 1, 6, 0), 'PB Daisy Chain');
    });
    block('PB B finale', () => {
      const s = scene(PB, [[150, 0, 1], [150, 0, 1], [150, 0, 1], [150, 0, 1]], { r: 4, quiet: 1 }); pick(s.w, 3, 1); pick(s.w, 6, 1); const R = s.w.s.area;
      const [e0, e1, e2, far] = s.es; e0.x = s.p.x + 150; e0.y = s.p.y; e1.x = e0.x + 0.3 * R; e1.y = e0.y; e2.x = e0.x + 0.5 * R; e2.y = e0.y; far.x = e0.x + 0.5 * R + 0.8 * R; far.y = e0.y; far.hp = far.maxHp = 1e5; gridBuild();
      fireWeapon(s.w, e0); run(90); chk('PB Grand Finale at the last link', far.hp < far.maxHp, hpLost(far)); ring12(card(PB, 1, 6, 1), 'PB Grand Finale');
    });
    block('PB B dud', () => {
      const s = scene(PB, [[150, 0]], { quiet: 1 }); pick(s.w, 3, 1); pick(s.w, 6, 2); let lumps = 0;
      for (let i = 0; i < 4; i++) { fireWeapon(s.w, s.es[0]); lumps = Math.max(lumps, G.w1.lumps.length); }
      chk('PB Dud one in four', lumps === 1, lumps); run(150); chk('PB Dud lump went off', G.w1.lumps.length === 0); ring12(card(PB, 1, 6, 2), 'PB Dud');
    });
    block('PB C', () => {
      const s = scene(PB, [[150, 0]], { quiet: 1 }); pick(s.w, 3, 2); const e = s.es[0], x0 = e.x, y0 = e.y; e.y = s.p.y + 20; const sx0 = e.x; fireWeapon(s.w, e); run(60);
      chk('PB C launched the survivor', Math.hypot(e.x - sx0, e.y - (s.p.y + 20)) > 50, Math.hypot(e.x - sx0, e.y - (s.p.y + 20))); promise(PB, 2, 'PB C');
    });
    block('PB C bump', () => {
      const s = scene(PB, [[150, 0], [150, 0], [150, 0]], { r: 8, quiet: 1 }); pick(s.w, 3, 2); pick(s.w, 6, 0); const [c, a, b2] = s.es;
      c.x = s.p.x + 150; a.x = c.x + 40; b2.x = c.x + 80; c.y = a.y = b2.y = s.p.y; gridBuild(); fireWeapon(s.w, c); run(80);
      chk('PB Bumper Cars collisions', echo(s.w) > 0, echo(s.w)); ring12(card(PB, 2, 6, 0), 'PB Bumper Cars');
    });
    block('PB C personal space', () => {
      const s = scene(PB, [[40, 0]], { quiet: 1 }); pick(s.w, 3, 2); pick(s.w, 6, 1); fireWeapon(s.w, s.es[0]);
      const wn = G.fx.find(f => f.type === 'warn'); chk('PB Personal Space on me', wn && Math.abs(wn.x - s.p.x) < 1 && Math.abs(wn.y - s.p.y) < 1);
      run(60); chk('PB Personal Space launched', Math.abs(s.es[0].x - (s.p.x + 40)) > 20); ring12(card(PB, 2, 6, 1), 'PB Personal Space');
    });
    block('PB C shrapnel', () => {
      const s = scene(PB, [[150, 0]], { quiet: 1 }); pick(s.w, 3, 2); pick(s.w, 6, 2); fireWeapon(s.w, s.es[0]); run(32);
      chk('PB Shrapnel six fragments', G.w1.frags.length === 6, G.w1.frags.length); run(90); chk('PB Shrapnel all landed', G.w1.frags.length === 0, G.w1.frags.length); ring12(card(PB, 2, 6, 2), 'PB Shrapnel Shower');
    });
    block('PB masteries', () => {
      const b = scene(PB, []); const a0 = b.w.s.area, d0 = b.w.s.dmg, cd0 = b.w.s.cd;
      let s = scene(PB, [[100, 0]]); pick(s.w, 3, 0); pick(s.w, 10, 0); const a1 = s.w.s.area;
      chk('PB Big Bang x2.5 radius', Math.abs(a1 / (a0 * 1.4) - 2.5) < 1e-6, [a1, a0]); chk('PB Big Bang x2 damage, half rate', Math.abs(s.w.s.dmg / d0 - 2) < 1e-6 && Math.abs(s.w.s.cd / cd0 - 2) < 1e-6);
      ring12(card(PB, 0, 10, 0), 'PB Big Bang');
      const pts = Array.from({ length: 9 }, () => [150, 0, 1]); s = scene(PB, pts, { r: 4, quiet: 1 }); pick(s.w, 3, 1); pick(s.w, 10, 1); const R = s.w.s.area;
      s.es.forEach((e, i) => { e.x = s.p.x + 150 + i * 0.9 * R; e.y = s.p.y; }); gridBuild(); fireWeapon(s.w, s.es[0]); run(150);
      chk('PB Chain of Command reached depth 6', s.es[7].dead, s.es.map(e => e.dead ? 1 : 0).join('')); ring12(card(PB, 1, 10, 1), 'PB Chain of Command');
      s = scene(PB, [[150, 0], [-250, 60]], { quiet: 1 }); pick(s.w, 3, 0); pick(s.w, 10, 2);
      chk('PB Hair Trigger 0.4 s', s.w.s.cd === 0.4, s.w.s.cd); s.es[0].crowd = 5; s.es[1].crowd = 4; fireWeapon(s.w, s.es[0]); const c1 = s.w.w1.lastC; fireWeapon(s.w, s.es[0]); const c2 = s.w.w1.lastC;
      chk('PB Hair Trigger different cluster', Math.hypot(c1.x - c2.x, c1.y - c2.y) > s.w.s.area * 0.8, [c1, c2]); ring12(card(PB, 0, 10, 2), 'PB Hair Trigger Happy');
    });

    // drawing: every mark, nut, lane, lump and fragment draws without error
    block('draw', () => {
      const s = scene(PB, [[100, 0], [140, 0]]); pick(s.w, 3, 1); run(2); const S = G.w1; const e = s.es[0], q = s.es[1];
      e.w1n = 2; q.w1mk = 1; q.w3crack = 2;
      S.nuts.push({ w: s.w, x: 10, y: 10, life: 5, dmg: 1 }); S.pips.push({ w: s.w, x: 20, y: 20, life: 1, dmg: 1 }); S.lanes.push({ w: s.w, x1: 0, y1: 0, x2: 50, y2: 50, life: 0.3, hit: new Set() });
      S.conk.push({ w: s.w, e, a: 0, t: 0.1, hit: new Set(), dmg: 1, cx: e.x, cy: e.y, nx: e.x + 40, ny: e.y, er: 8 }); S.lumps.push({ w: s.w, x: 30, y: 30, t: 1.5, r: 100, dmg: 1 });
      S.frags.push({ w: s.w, x: 5, y: 5, sx: 0, sy: 0, tx: 50, ty: 50, t: 0, dur: 0.3, dmg: 1 }); S.held.push({ e, w: s.w, until: G.t + 1, x: e.x, y: e.y }); S.carry = { e: q, w: s.w, until: G.t + 1 };
      v10Draw();
    });
    // every weapon, every promise: Lv 3 in a ring of twelve
    block('all promises ring', () => { for (const id of [SI, MG, NW, PB]) for (let pi = 0; pi < 3; pi++) promise(id, pi, id + ' promise ' + pi); });
    // (names: every Lv 6 card and mastery has a one-line desc, a name, and no banned words)
    block('card text', () => {
      for (const id of [SI, MG, NW, PB]) {
        const S = WUP[id]; chk(id + ' spec', S && S.A && S.B && S.C && S.lv10 && S.lv10.length === 3);
        for (const k of ['A', 'B', 'C']) {
          const P = S[k]; chk(id + k + ' two lv6 + wild', P.lv6.length === 2 && P.wild, P.lv6.length);
          for (const c of [...P.lv6, P.wild, { name: P.name, desc: P.lv3.desc }]) { chk(id + k + ' card text ' + c.name, c.name && c.desc && !/element|cast\b|—/i.test(c.desc + c.name), c.name); }
        }
        for (const c of S.lv10) chk(id + ' mastery text ' + c.name, c.name && c.desc && !/element|cast\b|—/i.test(c.desc));
      }
    });
    return { bad, out };
  });
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  else console.log('wup1 ok');
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
