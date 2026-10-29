// Weapon branches, batch 1 (wup1.js): Nervous Wreck and Panic Button (Standard Issue is baseline1test.js, Maximum Gains/Shotgun baseline2test.js).
// For each weapon and each promise: take the Lv 3 card from the real fork screen, run 300 frames against a ring of
// enemies (no errors), and check the promise's signature. Then each Lv 6 card and each mastery: apply it, run 300
// frames, and check something measurable.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); }); // (weapon mechanics, not pacing: the V11 power curve off, power11.js)
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    // A fresh run with one weapon and enemies at (dx, dy[, hp]) from the swimmer.
    const scene = (id, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; /* (card tests: no race XP boost, so levels stay put: race15.js) */ UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
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

    // ================================================================ STANDARD ISSUE: its movie-cop branches are tested in baseline1test.js (baseline1.js)
    const SI = 'v_phys_proj';

    // ================================================================ MAXIMUM GAINS is the Shotgun now: its Sperminator / Evil Dead / Riding shotgun branches are tested in baseline2test.js (baseline2.js)
    const MG = 'v_phys_spread'; // (the ring runs below still take its three new branches)

    // ================================================================ NERVOUS WRECK (now Hand-to-gland): its Kung fu / Samurai / Biting branches are tested in baseline3test.js (baseline3.js)
    const NW = 'v_phys_contact';
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
      chk('PB Bumper Cars collisions', echo(s.w) > 0 || (G.stats.dmg.Collision || 0) > 0, [echo(s.w), Math.round(G.stats.dmg.Collision || 0)]); ring12(card(PB, 2, 6, 0), 'PB Bumper Cars');
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
