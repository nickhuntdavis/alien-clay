// Baseline part 3 (baseline3.js): Hand-to-gland (Nervous Wreck renamed), its retuned base, the Kung fu / Samurai / Biting branches and costumes.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, HG = 'v_phys_contact';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null, SWINGS = 0;
    hookOn('fire:after', 'test:swings', w => { if (w && w.def && w24Key(w) === HG) SWINGS++; });
    const scene = (pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(HG, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; G.ebul.length = 0; SWINGS = 0;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; e.hx = e.x; e.hy = e.y; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn, hold) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (hold) for (const e of G.enemies) { e.x = e.hx; e.y = e.hy; } if (fn && fn(f) === 'stop') break; } };
    const lost = e => e.maxHp - e.hp;
    const shell = (e, n) => { const c = fightCd(e); c.def = 'shell'; c.layers = n; c.maxHp = e.maxHp; c.layerHp = e.maxHp * COMBAT.shellLayerHpFrac; return c; };
    const around = (n, r) => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * r, Math.sin(i / n * 6.283) * r]);

    // The rename and the retuned base.
    let sc = scene([[45, 0, 1e5]]);
    chk('rename: W24_BY', W24_BY[HG].name === 'Hand-to-gland', W24_BY[HG].name);
    chk('rename: WEAPONS name and slot', WEAPONS[HG].name === 'Hand-to-gland' && sc.w.def.name === 'Hand-to-gland', [WEAPONS[HG].name, sc.w.def.name]);
    chk('rename: description in place', !!WEAPONS[HG].desc && WEAPONS[HG].desc === W24_DESC[HG] && !/Nervous Wreck|too close\. It was not looking/.test(WEAPONS[HG].desc), WEAPONS[HG].desc);
    chk('rename: roster row and icon', W24.find(r => r[0] === HG)[1] === 'Hand-to-gland' && WEAPONS[HG].icon === 'HG', WEAPONS[HG].icon);
    chk('rename: no "Nervous Wreck" left on the def', !/Nervous Wreck/.test(JSON.stringify([WEAPONS[HG].name, WEAPONS[HG].desc, WEAPONS[HG].play])));
    const base = Object.assign({}, sc.w.s);
    chk('base: reach 70', Math.abs(base.reach - 70) < 0.5 && Math.abs(base.range - 70) < 0.5, [base.reach, base.range]);
    chk('base: 14 damage (x0.9 level scale of the engine)', base.dmg > 11.5 && base.dmg < 14.5, base.dmg);
    chk('base: no magazine', base.mag > 1000 && sc.w.ammo > 1000, [base.mag, sc.w.ammo]);
    run(180, null, true); out.baseSwings = SWINGS; // 3 s: 2.2 a second, times the sperm's own fire-rate bonus
    chk('base: about 2.2 swings a second', SWINGS >= 6 && SWINGS <= 9, SWINGS);
    chk('base hits', lost(sc.es[0]) > 0);
    const titles = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
    chk('promises are Kung fu, Samurai, Biting', titles.join() === 'Kung fu,Samurai,Biting', titles);
    out.base = { reach: +base.reach.toFixed(1), dmg: +base.dmg.toFixed(1), cd: +base.cd.toFixed(3), swings3s: SWINGS };

    // A. Kung fu
    block('Kung fu', () => {
      sc = scene([[50, 0, 1e5]]); pick(sc.w, 3, 0); let s = sc.w.s;
      chk('Kung fu: twice the rate', Math.abs(s.cd / base.cd - 0.5) < 0.02, [s.cd, base.cd]); chk('Kung fu: 70% damage', Math.abs(s.dmg / base.dmg - 0.7) < 0.02, [s.dmg, base.dmg]);
      let maxK = 0; run(240, () => { maxK = Math.max(maxK, Math.hypot(sc.es[0].kx, sc.es[0].ky)); }, true);
      const f = sc.w.hg;
      chk('Kung fu: every 5th swing is a kick', f.kicks >= 3 && f.kicks === Math.floor(f.swings / 5), [f.kicks, f.swings]); chk('Kung fu: the kick knocks back', maxK > 150, maxK);
      chk('Kung fu hits', lost(sc.es[0]) > 0);
      // Combo: +8% a hit on one enemy up to +40%, drops when you switch
      sc = scene([[50, 0, 1e5], [-50, 0, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); const [a, c2] = sc.es, w = sc.w;
      a.hgN = 3; chk('Combo: +24% at 3 hits', Math.abs(hgDmg(w, a, {}) - 1.24) < 0.001, hgDmg(w, a, {}));
      a.hgN = 9; chk('Combo: capped at +40%', Math.abs(hgDmg(w, a, {}) - 1.4) < 0.001, hgDmg(w, a, {})); a.hgN = 0;
      run(150, null, true); chk('Combo builds on the target in reach', (a.hgN || 0) + (c2.hgN || 0) >= 4, [a.hgN, c2.hgN]);
      a.hgN = 4; w.hg.comboE = a; hgHit(w, c2, { toHp: 1, raw: 1 }, {}); chk('Combo: switching drops the old count', a.hgN === 0 && c2.hgN >= 1, [a.hgN, c2.hgN]);
      // Flying kick: the kick lunges you through the target
      sc = scene([[90, 0, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); sc.es[0].x = sc.es[0].hx = sc.p.x + 55; let lunged = 0;
      run(240, () => { const S = G.m10; if (S && S.lunge && S.lunge.left > 0) lunged++; }, true); chk('Flying kick lunges on the kick', lunged > 3, lunged);
      // Wild: hit twice within a second and the next shot goes back
      sc = scene([[50, 0, 1e5]]); const e = sc.es[0]; pick(sc.w, 3, 0); pick(sc.w, 6, 2);
      run(40, null, true); chk('Reflect: an enemy hit twice is marked', !!e.hgRefl, e.hgRefl);
      const b0 = { x: e.x, y: e.y, vx: 0, vy: 0, dmg: 50, r: 5, life: 7, from: 'test', owner: e, color: '#f00' }; G.ebul.push(b0); const l0 = lost(e);
      run(3, null, true); chk('Reflect: the next shot is cancelled and hits the shooter', b0.dead && lost(e) > l0 && !e.hgRefl && sc.w.hg.reflected === 1, [b0.dead, lost(e) - l0, sc.w.hg.reflected]);
      // Mastery: Thousand fists hit everything in reach, not one enemy
      const ring6 = around(6, 45).map(([x, y]) => [x, y, 1e5]);
      sc = scene(ring6); pick(sc.w, 3, 0); run(90, null, true); const without = sc.es.filter(q => lost(q) > 0).length;
      sc = scene(ring6); pick(sc.w, 3, 0); pick(sc.w, 6, 0); pick(sc.w, 10, 0); run(90, null, true); const withF = sc.es.filter(q => lost(q) > 0).length;
      chk('Thousand fists: all six in reach are hit', withF === 6 && without < 6, [withF, without]);
    });

    // B. Samurai
    block('Samurai', () => {
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); let s = sc.w.s;
      chk('Samurai: one cut a second (x2.2 slower)', Math.abs(s.cd / base.cd - 2.2) < 0.05, [s.cd, base.cd]); chk('Samurai: triple damage', Math.abs(s.dmg / base.dmg - 3) < 0.05, [s.dmg, base.dmg]);
      chk('Samurai: 160 degree arc', Math.abs(s.arc - 160 * Math.PI / 180) < 0.01, s.arc);
      // the arc: in front and to either side are hit, behind is not
      sc = scene([[40, 0, 1e5], [30, 45, 1e5], [30, -45, 1e5], [-55, 0, 1e5]]); pick(sc.w, 3, 1); run(70, null, true);
      chk('Samurai: the arc hits everything in front', lost(sc.es[0]) > 0 && lost(sc.es[1]) > 0 && lost(sc.es[2]) > 0, sc.es.map(lost));
      chk('Samurai: nothing behind', lost(sc.es[3]) === 0, lost(sc.es[3]));
      // heavy first strike on a fresh enemy
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); const c = shell(sc.es[0], 3); run(300, () => { if (sc.w.hg.cuts >= 1 && !out.cut1) out.cut1 = c.layers; if (sc.w.hg.cuts >= 3) return 'stop'; }, true);
      chk('Samurai: the first strike sheds a layer, later cuts do not', out.cut1 === 2 && c.layers === 2, [out.cut1, c.layers]);
      // Iaijutsu: the first cut (nothing for 1.5 s) is doubled, the next is not
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); let l1 = 0, l2 = 0;
      run(300, () => { const f = sc.w.hg; if (f.cuts === 1 && !l1) l1 = lost(sc.es[0]); if (f.cuts === 2) { l2 = lost(sc.es[0]) - l1; return 'stop'; } }, true);
      chk('Iaijutsu: a cut after a pause is x2', l1 > 0 && l2 > 0 && Math.abs(l1 / l2 - 2) < 0.25 && sc.w.hg.iais === 1, [l1, l2, sc.w.hg.iais]);
      // Parry: the cut destroys enemy shots in its arc
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1);
      const bIn = { x: sc.p.x + 35, y: sc.p.y + 12, vx: 0, vy: 0, dmg: 5, r: 5, life: 7, owner: sc.es[0], from: 't' }, bOut = { x: sc.p.x - 35, y: sc.p.y, vx: 0, vy: 0, dmg: 5, r: 5, life: 7, owner: sc.es[0], from: 't' };
      G.ebul.push(bIn, bOut); run(70, null, true); chk('Parry: a shot in the arc is destroyed, one behind is not', bIn.dead && !bOut.dead && sc.w.hg.parried >= 1, [bIn.dead, bOut.dead]);
      // Wild: under 30% health every cut is a heavy hit
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); G.player.hp = G.P.maxHp * 0.2; const cw = shell(sc.es[0], 6);
      G.player.hp = G.P.maxHp * 0.2; run(330, () => { G.player.hp = G.P.maxHp * 0.2; if (sc.w.hg.cuts >= 3) return 'stop'; }, true);
      chk('Samurai wild: every cut is heavy under 30% health', sc.w.hg.heavies >= 3 && cw.layers <= 3, [sc.w.hg.heavies, cw.layers]);
      // Mastery: Clean cut strips a layer and staggers on every cut
      sc = scene([[40, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); pick(sc.w, 10, 1); const cc = shell(sc.es[0], 4); let stag = 0; const fp = fightPayoff;
      run(330, () => { if (sc.w.hg.cuts >= 3) return 'stop'; }, true);
      chk('Clean cut: a layer off every cut', cc.layers <= 1, cc.layers);
    });

    // C. Biting
    block('Biting', () => {
      sc = scene([[45, 0, 1e5]]); pick(sc.w, 3, 2); G.player.hp = 1000; const hp0 = G.player.hp;
      run(120, null, true);
      chk('Biting: bites Bleed', sc.es[0].bleeds && sc.es[0].bleeds.length > 0 && sc.w.hg.bites > 2, [sc.es[0].bleeds && sc.es[0].bleeds.length, sc.w.hg.bites]);
      chk('Biting: heals you', G.player.hp > hp0 + 1, [G.player.hp, hp0]);
      // Chew toy: held for half a second
      sc = scene([[45, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); let held = 0;
      run(60, () => { const e = sc.es[0]; if (e.snareT > G.t + 0.2 && e.dazeT > G.t) held++; }, true); chk('Chew toy: a bitten enemy is held (snareT and stun)', held > 5, held);
      sc = scene([[45, 0, 1e5]]); pick(sc.w, 3, 2); run(60, () => { if (sc.es[0].snareT > G.t) held = -99; }, true); chk('no hold without Chew toy', held !== -99);
      // Rabies: a bite on a Bleeding enemy spreads Bleed to neighbours within 60
      const rabPts = [[50, 0, 1e5], [50, 55, 1e5]];
      sc = scene(rabPts); pick(sc.w, 3, 2); run(100, null, true); const noRab = (sc.es[1].bleeds || []).length;
      sc = scene(rabPts); pick(sc.w, 3, 2); pick(sc.w, 6, 1); run(100, null, true);
      chk('Rabies: the neighbour catches the Bleed', (sc.es[1].bleeds || []).length > 0 && noRab === 0, [(sc.es[1].bleeds || []).length, noRab]);
      // Wild: a bite on a Shelled enemy strips a layer
      sc = scene([[45, 0, 1e5]]); pick(sc.w, 3, 2); const cn = shell(sc.es[0], 4); run(100, null, true); const keep = cn.layers;
      sc = scene([[45, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); const cs = shell(sc.es[0], 4); run(100, null, true);
      chk('Biting wild: bites strip Shell layers', keep === 4 && cs.layers < 4, [keep, cs.layers]);
      // Mastery: Jaws kills the nearly dead outright (not bosses) and heals
      sc = scene([[45, 0, 10000]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); pick(sc.w, 10, 2); sc.es[0].hp = 1500; G.player.hp = 1000;
      run(60, () => { if (sc.es[0].dead) return 'stop'; }, true);
      chk('Jaws: a bite under 20% kills outright and heals 10%', sc.es[0].dead && G.player.hp > 50000, [sc.es[0].dead, G.player.hp]);
      sc = scene([[45, 0, 10000]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); pick(sc.w, 10, 2); sc.es[0].hp = 1500; sc.es[0].boss = 1;
      run(30, null, true); chk('Jaws: a boss is not executed', !sc.es[0].dead && sc.es[0].hp > 0, sc.es[0].hp);
    });

    // The old Nervous Wreck cards are unreachable
    block('old cards gone', () => {
      sc = scene([[45, 0, 1e5]]);
      const all = [3].flatMap(lv => genLoot({ kind: 'fork', w: sc.w, lv }).map(c => c.title));
      chk('Vice Grip, Shell Game and Back Off! are gone', !all.some(t => /Vice Grip|Shell Game|Back Off/.test(t)), all);
    });
    // Costumes draw for every branch (no errors), and nothing without a branch.
    block('costumes', () => {
      sc = scene([[60, 0, 1e5]]); render(); hgCostume(sx(G.player.x), sy(G.player.y));
      for (const i of [0, 1, 2]) { sc = scene([[60, 0, 1e5, 1]]); pick(sc.w, 3, i); run(70, null, true); render(); hgCostume(sx(G.player.x), sy(G.player.y)); chk('costume branch letter ' + i, hgP() === 'ABC'[i], hgP()); }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('baseline3test OK');
  await b.close();
})();
