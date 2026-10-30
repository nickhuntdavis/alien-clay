// Private Schooled part 1 (private1.js): Acid Spit's Silver Spoon / Trust Fund / Hostile Takeover and Rent Free's Old Boys' Network / The Help / Legacy Admission.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, AS = 'v_fire_proj', RF = 'v_soul_proj', MAXHP = 1e6;
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null, FREE = false, KEEP = false;
    // pts: [dx, dy, hp, flags]; flags: 'elite' | 'boss'
    const scene = (wid, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = o.t != null ? o.t : 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.wave = null;
      G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'private' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(wid, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = MAXHP; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      if (typeof stamInit === 'function') { stamInit(); G.stam.cur = 10; }
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; G.ebul.length = 0; KEEP = false; FREE = false;
      PIN = o.noPin ? null : { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, fl]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; e.px = e.x; e.py = e.y; if (fl === 'elite') e.elite = true; if (fl === 'boss') e.boss = true; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { if (!KEEP) G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (!FREE) for (const e of G.enemies) if (e.px != null) { e.x = e.px; e.y = e.py; e.kx = e.ky = 0; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const hpAt = fr => { G.player.hp = MAXHP * fr; };
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const fx = (w, k) => (w.pv1 && w.pv1.fx && w.pv1.fx[k]) || 0;
    const acid = w => ({ elem: 'fire', w });
    const mul = (e, src) => hookMul('dmgMul', e, src);
    const slug = n => n.toLowerCase().replace(/[^a-z]/g, '');
    const poss = (e, t) => { e.charmed = true; e.charmT = t || 10; e.frozen = 0; e.allyT = null; return e; };
    const shots = w => G.proj.filter(q => q.w === w && !q.dead);
    const toughF = w => { w.pv1.toughF = -1; return pv1Toughest(w); };

    // ---- the sets are Private's, and other samples keep the shared ones
    block('sets', () => {
      for (const [wid, names] of [[AS, 'Silver Spoon,Trust Fund,Hostile Takeover'], [RF, "Old Boys' Network,The Help,Legacy Admission"]]) {
        let sc = scene(wid, [[100, 0]]); const t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
        chk(wid + ' Private promises', t.join() === names, t);
        for (const smp of ['alpha', 'beta', 'baseline']) {
          sc = scene(wid, [[100, 0]], { sample: smp }); const t2 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
          const want = ['A', 'B', 'C'].map(k => wupSpecFor(wid, smp)[k].name).join();
          chk(wid + ' ' + smp + ' keeps its own branches', t2.join() === want && t2.join() !== names, t2);
        }
        sc = scene(wid, [[100, 0]]); chk(wid + ' 3 Lv 9 masteries', genLoot({ kind: 'fork', w: sc.w, lv: 10 }).length === 3);
        const S = wupSpecFor(wid, 'private'); for (const k of 'ABC') chk(wid + k + ' has 2 Lv 6 cards and a wild', S[k].lv6.length === 2 && S[k].wild && S[k].wild.name);
      }
    });
    // every card text is a placeholder (or the user's copy once privatecopy.js has it), and the names are the drafted ones
    block('copy', () => {
      const names = { [AS]: ['Born to Rule', 'Entitled', 'Spoilt', 'Offshore Account', 'Inheritance', 'Gap Year', 'Asset Stripping', 'Golden Handshake', 'Insider Trading', 'Head Boy', 'Old Money', 'Conglomerate'],
        [RF]: ['Secret Handshake', 'Nepotism', 'Blackballed', 'Butler', 'Live-in Staff', 'Below Stairs', 'Family Crest', 'Endowment', 'Disinherited', 'Old School Tie', 'Staff Quarters', 'Dynasty'] };
      const keys = { [AS]: ['spoon', 'trust', 'takeover'], [RF]: ['network', 'help', 'legacy'] }, pre = { [AS]: 'pv_as', [RF]: 'pv_rf' };
      const ok = (txt, id) => typeof txt === 'string' && txt.length > 0 && (txt === 'TODO_COPY:' + id || (typeof PRIVATE_COPY !== 'undefined' && PRIVATE_COPY[id] === txt));
      const ids = [];
      for (const wid of [AS, RF]) {
        const S = wupSpecFor(wid, 'private'), have = [];
        'ABC'.split('').forEach((k, i) => {
          const id = pre[wid] + '_' + keys[wid][i]; ids.push(id + '_tag', id + '_costs', id + '_desc');
          have.push(...S[k].lv6.map(c => c.name), S[k].wild.name);
          chk(wid + k + ' branch texts', ok(S[k].lv3.desc, id + '_desc') && ok(S[k].tag, id + '_tag') && ok(S[k].costs, id + '_costs'), [S[k].lv3.desc, S[k].tag, S[k].costs]);
          for (const c of [...S[k].lv6, S[k].wild]) { ids.push(pre[wid] + '_' + slug(c.name) + '_desc'); chk(wid + ' ' + c.name + ' text', ok(c.desc, pre[wid] + '_' + slug(c.name) + '_desc'), c.desc); }
        });
        have.push(...S.lv10.map(c => c.name)); chk(wid + ' card names', have.join() === names[wid].join(), have);
        for (const c of S.lv10) { ids.push(pre[wid] + '_' + slug(c.name) + '_desc'); chk(wid + ' ' + c.name + ' text', ok(c.desc, pre[wid] + '_' + slug(c.name) + '_desc'), c.desc); }
        chk(wid + ' best letters', S.lv10.map(c => c.best).join() === 'A,B,C');
      }
      out.ids = ids.length;
    });

    // ================================================================ ACID SPIT
    block('Silver Spoon', () => {
      let sc = scene(AS, [[220, 0, 1e5], [0, 200, 5e5, 'elite'], [-150, 0, 9e6]]); pick(sc.w, 3, 0); const f = sc.w.pv1;
      chk('Spoon: the toughest in reach is the Elite, not the biggest health bar', toughF(sc.w) === sc.es[1], toughF(sc.w) && toughF(sc.w).maxHp);
      f.toughF = -1; G.proj.length = 0; fireWeapon(sc.w, sc.es[0]);
      const pr = shots(sc.w), want = Math.atan2(200, 0);
      chk('Spoon: every glob of the shot flies at the toughest', pr.length >= 1 && pr.every(q => Math.abs(Math.atan2(q.vy, q.vx) - want) < (sc.w.s.spread || 0) + 0.05), pr.map(q => Math.atan2(q.vy, q.vx)));
      chk('Spoon: counted', fx(sc.w, 'aim') === 1);
      // the glob really reaches it
      sc = scene(AS, [[220, 0, 1e5], [0, 200, 5e5, 'elite']]); pick(sc.w, 3, 0); run(120); chk('Spoon: the Elite is the one that gets hit', lost(sc.es[1]) > lost(sc.es[0]), [lost(sc.es[0]), lost(sc.es[1])]);
      // +40% to Elites and bosses
      sc = scene(AS, [[100, 0], [150, 0, 1e5, 'elite'], [200, 0, 1e5, 'boss']]); pick(sc.w, 3, 0); const dm = e => sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e, {}), 1);
      chk('Spoon: +40% to Elites and bosses', Math.abs(dm(sc.es[1]) - 1.4) < 1e-9 && Math.abs(dm(sc.es[2]) - 1.4) < 1e-9 && dm(sc.es[0]) === 1, [dm(sc.es[0]), dm(sc.es[1]), dm(sc.es[2])]);
      // Born to Rule
      sc = scene(AS, [[100, 0, 1e5, 'elite'], [130, 0], [100, 50], [400, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); toughF(sc.w);
      pv1AsHit(sc.w, sc.es[0], { raw: 1000, statusOk: true }, {});
      chk('Born to Rule: a hit on the toughest splashes 30% within 60', lost(sc.es[1]) > 150 && lost(sc.es[2]) > 150 && lost(sc.es[3]) === 0 && fx(sc.w, 'born') === 1, sc.es.map(lost));
      sc.es.forEach(e => e.hp = e.maxHp); pv1AsHit(sc.w, sc.es[1], { raw: 1000, statusOk: true }, {}); chk('Born to Rule: a hit on anyone else does not', sc.es.every(e => lost(e) === 0) && fx(sc.w, 'born') === 1);
      // Entitled
      const count = fl => { const s2 = scene(AS, [[200, 0, 1e5, fl]]); pick(s2.w, 3, 0); if (fl === 'boss') pick(s2.w, 6, 1); G.proj.length = 0; fireWeapon(s2.w, s2.es[0]); return { n: shots(s2.w).length, w: s2.w }; };
      const bossN = count('boss'), eliteN = count('elite');
      chk('Entitled: one more glob a shot at a boss', bossN.n === eliteN.n + 1 && fx(bossN.w, 'entitled') === 1, [bossN.n, eliteN.n]);
      sc = scene(AS, [[200, 0, 1e5, 'elite']]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); G.proj.length = 0; fireWeapon(sc.w, sc.es[0]); chk('Entitled: nothing extra at an Elite', shots(sc.w).length === eliteN.n && fx(sc.w, 'entitled') === 0);
      // Spoilt
      sc = scene(AS, [[200, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); let tot = 0, big = [];
      for (let i = 0; i < 12; i++) { G.proj.length = 0; fireWeapon(sc.w, sc.es[0]); const s2 = shots(sc.w); tot += s2.length; big.push(...s2.filter(q => q.pv1big)); }
      const base = sc.w.s.dmg;
      chk('Spoilt: every 5th glob is big', big.length === Math.floor(tot / 5) && big.length >= 1, [tot, big.length]);
      chk('Spoilt: twice the damage and size, slower', big.every(q => q.dmg >= base * 1.9 && q.r >= (sc.w.s.size || 4) * 1.9 && Math.hypot(q.vx, q.vy) < sc.w.s.speed * 0.75), big[0] && [big[0].dmg, base, big[0].r, Math.hypot(big[0].vx, big[0].vy), sc.w.s.speed]);
      // Head Boy
      sc = scene(AS, [[100, 0, 1e5, 'elite'], [150, 0]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); toughF(sc.w);
      const e0 = sc.es[0]; e0.cd = e0.cd || fightCd(e0); fightCd(e0).bars.acid = 0; pv1AsHit(sc.w, e0, { raw: 1000, statusOk: true }, {});
      const want2 = 0.5 * pv1AcidFrac(e0, 1000); chk('Head Boy: the toughest enemy\'s bar fills 50% faster', want2 > 0 && Math.abs(fightCd(e0).bars.acid - want2) < 1e-9 && fx(sc.w, 'headboy') === 1, [fightCd(e0).bars.acid, want2]);
      fightCd(sc.es[1]).bars.acid = 0; pv1AsHit(sc.w, sc.es[1], { raw: 1000, statusOk: true }, {}); chk('Head Boy: not on anyone else', fightCd(sc.es[1]).bars.acid === 0);
    });
    block('Trust Fund', () => {
      let sc = scene(AS, [[100, 0], [160, 0]]); pick(sc.w, 3, 1); const e = sc.es[0], P = () => e.pv1 || {};
      e.corrodedT = G.t + 1e4; for (let i = 0; i < 5; i++) pv1Frame(1);
      chk('Trust Fund: +10% a second while Corroded', Math.abs(P().tf - 0.5) < 1e-9, P().tf);
      chk('Trust Fund: an Acid hit hurts more', Math.abs(mul(e, acid(sc.w)) / mul(sc.es[1], acid(sc.w)) - 1.5) < 1e-9, [mul(e, acid(sc.w)), mul(sc.es[1], acid(sc.w))]);
      chk('Trust Fund: only Acid', Math.abs(mul(e, { elem: 'phys', w: sc.w }) / mul(sc.es[1], { elem: 'phys', w: sc.w }) - 1) < 1e-9);
      chk('Trust Fund: any weapon\'s Acid counts', Math.abs(mul(e, { elem: 'fire' }) / mul(sc.es[1], { elem: 'fire' }) - 1.5) < 1e-9);
      for (let i = 0; i < 20; i++) pv1Frame(1); chk('Trust Fund: up to +100%', Math.abs(P().tf - 1) < 1e-9, P().tf);
      sc.w.pv1.tfN === 1 || chk('Trust Fund: state exposed', sc.w.pv1.tfN === 1, sc.w.pv1.tfN);
      e.corrodedT = 0; fightCd(e).bars.acid = 0; pv1Frame(0.1); chk('Trust Fund: it resets when Corrosion ends', P().tf === 0, P().tf);
      // it really lands
      sc = scene(AS, [[100, 0], [160, 0]]); pick(sc.w, 3, 1); sc.es[0].pv1 = { tf: 1 }; sc.es[0].corrodedT = G.t + 1e4;
      damageEnemy(sc.es[0], 1000, Object.assign(weaponSrc(sc.w), { noCrit: true, mult: 1 })); damageEnemy(sc.es[1], 1000, Object.assign(weaponSrc(sc.w), { noCrit: true, mult: 1 }));
      chk('Trust Fund: the damage lands doubled', lost(sc.es[0]) > lost(sc.es[1]) * 1.9 && lost(sc.es[1]) > 0, [lost(sc.es[0]), lost(sc.es[1])]);
      // Offshore Account
      sc = scene(AS, [[100, 0], [160, 0], [600, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); sc.es[0].pv1 = { tf: 0.6 }; hpAt(1);
      killEnemy(sc.es[0], acid(sc.w));
      chk('Offshore Account: the bonus moves to the nearest enemy', Math.abs((sc.es[1].pv1 || {}).tf - 0.6) < 1e-9 && !(sc.es[2].pv1 && sc.es[2].pv1.tf) && fx(sc.w, 'offshore') === 1, sc.es.map(x => x.pv1 && x.pv1.tf));
      pv1Frame(0.1); chk('Offshore Account: and it is not reset at once', sc.es[1].pv1.tf === 0.6);
      // Inheritance
      sc = scene(AS, [[100, 0], [160, 0], [220, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); hpAt(0.5); let h0 = G.player.hp; killEnemy(sc.es[0], acid(sc.w));
      chk('Inheritance: a kill by Acid heals 1%', Math.abs(G.player.hp - h0 - MAXHP * 0.01 * G.P.healMult) < 1 && fx(sc.w, 'inherit') === 1, G.player.hp - h0);
      h0 = G.player.hp; killEnemy(sc.es[1], { elem: 'phys', w: sc.w }); chk('Inheritance: not by Force', G.player.hp === h0);
      killEnemy(sc.es[2], { elem: 'fire', fromAlly: true }); chk('Inheritance: not by an ally', G.player.hp === h0);
      // Gap Year
      PV1.gapP = 1; sc = scene(AS, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); const g = sc.es[0]; g.corrodedT = G.t + 1e4; pv1Frame(1);
      const frozen = g.pv1.tf; chk('Gap Year: compounding sometimes stops for 2 s', g.pv1.tfPause > G.t && fx(sc.w, 'gappause') === 1, [g.pv1.tfPause, G.t]);
      pv1Frame(1); chk('Gap Year: nothing grows while it is stopped', g.pv1.tf === frozen, [g.pv1.tf, frozen]);
      G.t += 2.1; pv1Frame(0.01); PV1.gapP = 0.15;
      chk('Gap Year: then it comes back doubled', Math.abs(g.pv1.tf - frozen * 2) < 1e-9 && g.pv1.tfPause === 0 && fx(sc.w, 'gapdouble') === 1, [g.pv1.tf, frozen]);
      g.pv1.tf = 1.8; g.pv1.tfPause = G.t - 1; pv1Frame(0.01); chk('Gap Year: at most +200%', g.pv1.tf <= 2 + 1e-9);
      // Old Money
      sc = scene(AS, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); sc.es[0].pv1 = { tf: 0.7 }; sc.es[0].corrodedT = 0; fightCd(sc.es[0]).bars.acid = 0; for (let i = 0; i < 5; i++) pv1Frame(1);
      chk('Old Money: compounding never resets', sc.es[0].pv1.tf === 0.7, sc.es[0].pv1.tf);
      sc = scene(AS, [[100, 0]]); pick(sc.w, 3, 1); sc.es[0].pv1 = { tf: 0.7 }; pv1Frame(1); chk('Old Money: (without it, it does)', sc.es[0].pv1.tf === 0);
    });
    block('Hostile Takeover', () => {
      let sc = scene(AS, [[100, 0], [150, 0], [200, 0], [250, 0]]); pick(sc.w, 3, 2); const f = sc.w.pv1;
      fightCd(sc.es[0]).bars.acid = 0.999; damageEnemy(sc.es[0], 1000, Object.assign(weaponSrc(sc.w), { noCrit: true }));
      chk('Takeover: a full Corrosion bar Possesses for 6 s', sc.es[0].charmed && sc.es[0].charmT > 5.9 && sc.es[0].charmT <= 6 && f.tks.has(sc.es[0]) && fx(sc.w, 'takeover') === 1, [sc.es[0].charmed, sc.es[0].charmT]);
      fightPayoff(sc.es[1], 'corrode', { raw: 0 }, {}); chk('Takeover: one at a time', !sc.es[1].charmed && f.tks.size === 1);
      pv1BarBump(sc.es[1], 1.5, {}); chk('Takeover: (still one at a time through a bar bump)', !sc.es[1].charmed);
      // a Shell layer strip counts too
      const sh = scene(AS, [[100, 0]]); pick(sh.w, 3, 2); const se = sh.es[0]; const cd = fightCd(se); cd.def = 'shell'; cd.layers = 2; cd.layerHp = 1e9; fightPayoff(se, 'strip', { raw: 0 }, {});
      chk('Takeover: a strip fills the bar too', se.charmed && se.pv1 && se.pv1.tk === 1);
      // bosses are not taken over
      const bs = scene(AS, [[100, 0, 1e5, 'boss']]); pick(bs.w, 3, 2); fightPayoff(bs.es[0], 'corrode', { raw: 0 }, {}); chk('Takeover: not bosses', !bs.es[0].charmed && bs.w.pv1.tks.size === 0);
      // Asset Stripping
      sc = scene(AS, [[100, 0], [150, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); fightPayoff(sc.es[0], 'corrode', { raw: 0 }, {});
      chk('Asset Stripping: a taken-over enemy takes double Acid', Math.abs(mul(sc.es[0], acid(sc.w)) / mul(sc.es[1], acid(sc.w)) - 2) < 1e-9 && Math.abs(mul(sc.es[0], { elem: 'phys', w: sc.w }) / mul(sc.es[1], { elem: 'phys', w: sc.w }) - 1) < 1e-9);
      // Golden Handshake
      sc = scene(AS, [[100, 0], [150, 0], [100, 50], [500, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); fightPayoff(sc.es[0], 'corrode', { raw: 0 }, {}); sc.es[0].charmT = 0.01; KEEP = false;
      run(3);
      chk('Golden Handshake: when it ends the enemy bursts in Acid (80)', sc.es[1].maxHp - sc.es[1].hp > 0 && lost(sc.es[2]) > 0 && lost(sc.es[3]) === 0 && lost(sc.es[0]) === 0 && fx(sc.w, 'golden') === 1, sc.es.map(lost));
      sc = scene(AS, [[100, 0], [150, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); fightPayoff(sc.es[0], 'corrode', { raw: 0 }, {}); killEnemy(sc.es[0], {}); pv1Frame(0.01);
      chk('Golden Handshake: also when the enemy dies', lost(sc.es[1]) > 0 && fx(sc.w, 'golden') === 1);
      // Insider Trading
      sc = scene(AS, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); fightPayoff(sc.es[0], 'corrode', { raw: 0 }, {}); G.stam.cur = 10; sc.es[0].charmT = 0.01; run(3);
      chk('Insider Trading: an ended takeover gives 4 stamina', G.stam.cur >= 13.9 && fx(sc.w, 'insider') === 1, G.stam.cur);
      // Conglomerate
      sc = scene(AS, [[100, 0], [150, 0], [200, 0], [250, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); for (const e of sc.es) fightPayoff(e, 'corrode', { raw: 0 }, {});
      chk('Conglomerate: up to 3 at once', sc.es.filter(e => e.charmed).length === 3 && !sc.es[3].charmed, sc.es.map(e => e.charmed));
      pv1Frame(0.01); chk('Conglomerate: state exposed', sc.w.pv1.tkN === 3);
      // a taken-over enemy fights for you
      sc = scene(AS, [[100, 0, 1e5], [118, 0, 1e5]]); pick(sc.w, 3, 2); fightPayoff(sc.es[0], 'corrode', { raw: 0 }, {}); run(60); chk('Takeover: the enemy turns on its mate', lost(sc.es[1]) > 0);
    });

    // ================================================================ RENT FREE
    block('Old Boys\' Network', () => {
      const setup = (n, o) => { const sc = scene(RF, [[100, 0, 1e5], [118, 0, 1], ...Array.from({ length: n }, (_, i) => [-100 - i * 30, 0, 1e5])], o); pick(sc.w, 3, 0); poss(sc.es[0], 20); sc.es.slice(2).forEach(e => poss(e, 20)); KEEP = true; return sc; };
      let sc = scene(RF, [[100, 0]]); chk('Rent Free is Holy under Private (it Possesses)', (pick(sc.w, 3, 0), sc.w.holyP === 1));
      sc = setup(0); run(40);
      chk('Old Boys\' Network: a kill by a Possessed enemy rises Possessed', sc.es[1].dead && fx(sc.w, 'recruit') === 1 && G.enemies.some(q => q.pv1 && q.pv1.rec && q.charmed && q.zombie && q.xp === 0), [sc.es[1].dead, fx(sc.w, 'recruit')]);
      const rec = G.enemies.find(q => q.pv1 && q.pv1.rec); chk('Old Boys\' Network: the recruit counts as Possessed', rec && pvPoss(rec) && rec.maxHp <= 1e5 && rec.charmT > 0);
      // cap 4, with the recruit counted
      sc = setup(3); run(40); chk('Old Boys\' Network: at most 4 Possessed at once', G.enemies.filter(pvPoss).length <= 4 && fx(sc.w, 'recruit') === 0, [G.enemies.filter(pvPoss).length, fx(sc.w, 'recruit')]);
      // Old School Tie
      sc = setup(3); pick(sc.w, 10, 0); run(40); chk('Old School Tie: up to 8', fx(sc.w, 'recruit') === 1 && G.enemies.filter(pvPoss).length === 5, [fx(sc.w, 'recruit'), G.enemies.filter(pvPoss).length]);
      sc = setup(7); pick(sc.w, 10, 0); run(40); chk('Old School Tie: and no more than 8', G.enemies.filter(pvPoss).length <= 8 && fx(sc.w, 'recruit') === 0, G.enemies.filter(pvPoss).length);
      // Blackballed
      PV1.blackP = 1; sc = setup(0); pick(sc.w, 6, 2); run(40); PV1.blackP = 0.15;
      const ref = G.enemies.find(q => q.pv1 && !q.charmed && !q.tst && q !== sc.es[0]);
      chk('Blackballed: a recruit refuses and is Feared for 2 s', fx(sc.w, 'blackball') === 1 && ref && ref.fearT > G.t - 1.2 && !ref.zombie, [fx(sc.w, 'blackball'), ref && ref.fearT, G.t]);
      // Secret Handshake
      sc = scene(RF, [[100, 0], [150, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); poss(sc.es[0]);
      chk('Secret Handshake: your weapons deal 50% less to Possessed enemies', Math.abs(mul(sc.es[0], { elem: 'soul', w: sc.w }) / mul(sc.es[1], { elem: 'soul', w: sc.w }) - 0.5) < 1e-9);
      chk('Secret Handshake: only your weapons', Math.abs(mul(sc.es[0], { fromAlly: true }) / mul(sc.es[1], { fromAlly: true }) - 1) < 1e-9);
      // Nepotism
      sc = scene(RF, [[100, 0, 1e5, 'elite'], [150, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); poss(sc.es[0], 2.5); poss(sc.es[1], 4); pv1Frame(0.01);
      chk('Nepotism: Possessed Elites stay Possessed twice as long', Math.abs(sc.es[0].charmT - 5) < 0.02 && Math.abs(sc.es[1].charmT - 4) < 0.02, [sc.es[0].charmT, sc.es[1].charmT]);
    });
    block('The Help', () => {
      let sc = scene(RF, [[400, 0, 1e5], [500, 100, 1e5]], { noPin: false }); pick(sc.w, 3, 1); poss(sc.es[0], 50); FREE = true; sc.es[1].px = undefined; KEEP = true;
      run(90); const d = pv1Dist(sc.es[0], G.player);
      chk('The Help: a Possessed enemy stays within 120 of you', d < 130 && fx(sc.w, 'leash') >= 1, d);
      chk('The Help: and a hostile one is left alone', pv1Dist(sc.es[1], G.player) > 300);
      // shots
      sc = scene(RF, [[100, 0, 1e5]]); pick(sc.w, 3, 1); poss(sc.es[0], 50); const q = sc.es[0];
      G.ebul.push({ x: q.x + 30, y: q.y, vx: 0, vy: 0, dmg: 5, r: 4, life: 5, from: 'test' }, { x: q.x + 100, y: q.y, vx: 0, vy: 0, dmg: 5, r: 4, life: 5, from: 'test' });
      pv1Frame(0.01); chk('The Help: shots within 40 of a Possessed enemy stop on it', G.ebul[0].dead && !G.ebul[1].dead && fx(sc.w, 'stop') === 1, G.ebul.map(x => x.dead));
      // Butler
      sc = scene(RF, [[100, 0], [150, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); poss(sc.es[0]); hpAt(0.5); let h0 = G.player.hp; killEnemy(sc.es[0], {});
      chk('Butler: a Possessed enemy that dies heals you 2%', Math.abs(G.player.hp - h0 - MAXHP * 0.02 * G.P.healMult) < 1 && fx(sc.w, 'butler') === 1, G.player.hp - h0);
      h0 = G.player.hp; killEnemy(sc.es[1], {}); chk('Butler: a hostile one does not', G.player.hp === h0);
      // Live-in Staff
      sc = scene(RF, [[100, 0], [150, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); poss(sc.es[0], 4); pv1Frame(0.01); chk('Live-in Staff: Possession lasts 50% longer', Math.abs(sc.es[0].charmT - 6) < 0.02, sc.es[0].charmT);
      pv1Frame(0.01); chk('Live-in Staff: once, not every frame', Math.abs(sc.es[0].charmT - 6) < 0.02);
      // Below Stairs
      sc = scene(RF, [[100, 0], [150, 0], [100, 60], [500, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); poss(sc.es[0]); pv1Frame(0.01); sc.es[0].pv1.bsT = 0; fightCd(sc.es[2]).bars.soul = 0.9; pv1Frame(0.01);
      chk('Below Stairs: a Possessed enemy fills Holy build-up on its neighbours', Math.abs(fightCd(sc.es[1]).bars.soul - PV1.belowFill) < 0.02 && sc.es[2].charmed && fightCd(sc.es[3]).bars.soul === 0 && fx(sc.w, 'below') === 1, [fightCd(sc.es[1]).bars.soul, sc.es[2].charmed]);
      pv1Frame(0.01); chk('Below Stairs: every 3 s, not every frame', fx(sc.w, 'below') === 1);
      // Staff Quarters
      const r0 = Math.random; sc = scene(RF, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); poss(sc.es[0], 4); pv1Frame(0.01); sc.es[0].charmT = 0.05;
      Math.random = () => 0; pv1Frame(0.01); Math.random = r0;
      chk('Staff Quarters: a Possession about to end may start again', Math.abs(sc.es[0].charmT - 4) < 0.02 && fx(sc.w, 'staff') === 1, [sc.es[0].charmT, fx(sc.w, 'staff')]);
      sc.es[0].charmT = 0.05; Math.random = () => 0.99; pv1Frame(0.01); Math.random = r0; chk('Staff Quarters: 25% only', sc.es[0].charmT < 0.06 && fx(sc.w, 'staff') === 1);
    });
    block('Legacy Admission', () => {
      let sc = scene(RF, [[100, 0, 1e5], [150, 0, 1e5], [200, 0, 1e5]]); pick(sc.w, 3, 2); const f = sc.w.pv1; const a = sc.es[0], r0 = a.r;
      poss(a, 4); pv1Frame(0.01);
      chk('Legacy: the first Possessed enemy stays Possessed, bigger and stronger', a.pv1.leg === 1 && a.charmT > 1e8 && Math.abs(a.r - r0 * 1.5) < 1e-9 && Math.abs(a.maxHp - 1.5e5) < 1 && f.legs.length === 1 && fx(sc.w, 'legacy') === 1, [a.r / r0, a.maxHp, f.legs.length]);
      poss(sc.es[1], 4); pv1Frame(0.01); chk('Legacy: only the first each wave', !(sc.es[1].pv1 && sc.es[1].pv1.leg) && sc.es[1].charmT < 5);
      pv1Frame(0.01); chk('Legacy: and only once', Math.abs(a.r - r0 * 1.5) < 1e-9);
      G.t += 61; pv1Frame(0.01); chk('Legacy: it retires when the wave moves on', a.dead && f.legs.length === 0);
      poss(sc.es[2], 4); pv1Frame(0.01); chk('Legacy: a new wave, a new Legacy', sc.es[2].pv1 && sc.es[2].pv1.leg === 1);
      G.wave = { n: 2 }; chk('Legacy: waves key on the wave number', pv1Key() === 'w2'); G.wave = null;
      // Family Crest
      sc = scene(RF, [[100, 0, 1e5], [118, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); poss(sc.es[0], 4); KEEP = true; run(40);
      chk('Family Crest: the Legacy\'s hits build Corrosion', fx(sc.w, 'crest') >= 1 && (fightCd(sc.es[1]).bars.acid > 0.1 || corroded(sc.es[1]) || sc.es[1].corrodedT > 0), [fx(sc.w, 'crest'), fightCd(sc.es[1]).bars.acid]);
      // Endowment
      sc = scene(RF, [[100, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); poss(sc.es[0], 4); pv1Frame(0.01); const L = sc.es[0]; L.hp = L.maxHp * 0.5; const hh = L.hp; pv1Frame(1);
      chk('Endowment: the Legacy heals 2% of its health a second', Math.abs(L.hp - hh - L.maxHp * 0.02) < 1, L.hp - hh);
      // Disinherited
      sc = scene(RF, [[100, 0, 1e5], [140, 0, 1e5], [100, 70, 1e5], [500, 0, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); poss(sc.es[0], 4); pv1Frame(0.01); killEnemy(sc.es[0], {});
      chk('Disinherited: the Legacy bursts in Holy damage (100)', lost(sc.es[1]) > 0 && lost(sc.es[2]) > 0 && lost(sc.es[3]) === 0 && fx(sc.w, 'disinherit') === 1, sc.es.map(lost));
      // Dynasty
      sc = scene(RF, [[100, 0], [150, 0], [200, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); for (const e of sc.es) { poss(e, 4); pv1Frame(0.01); }
      chk('Dynasty: two Legacies a wave', sc.es.filter(e => e.pv1 && e.pv1.leg).length === 2 && sc.w.pv1.legs.length === 2, sc.es.map(e => e.pv1 && e.pv1.leg));
    });

    // ================================================================ a 300-frame ring run for every branch, with its cards stacked
    block('ring runs', () => {
      for (const wid of [AS, RF]) for (const i of [0, 1, 2]) {
        const sc = scene(wid, ringPts(10).concat([[330, 0, 1e5, 'elite']]), { second: wid === AS ? RF : AS }); pick(sc.w, 3, i); pick(sc.w, 6, 0); pick(sc.w, 6, 1);
        const S = wupSpecFor(wid, 'private'); S[['A', 'B', 'C'][i]].wild.apply(sc.w); S.lv10[i].apply(sc.w);
        // the other slot gets a few of its cards too, so the cross-effects run together
        const S2 = wupSpecFor(wid === AS ? RF : AS, 'private'); S2.A.lv3.apply(sc.w2); S2.A.lv6[0].apply(sc.w2); S2.C.lv3.apply(sc.w2); S2.lv10[2].apply(sc.w2); recomputeAll();
        KEEP = true;
        run(300, f => { if (f % 40 === 0) for (const e of G.enemies.slice(0, 3)) if (e.tst && !e.charmed && !e.dead) { fightCd(e).bars.acid = 0.99; e.corrodedT = G.t + 5; } hpAt(0.8); });
        chk(wid + ' ' + 'ABC'[i] + ' ring run hits', G.enemies.some(e => lost(e) > 0) || G.kills > 0); out[wid + 'ABC'[i]] = Math.round(G.enemies.reduce((a, e) => a + lost(e), 0));
        chk(wid + ' ' + 'ABC'[i] + ' ring run leaves you alive', G.state === 'play' && G.player.hp > 0, G.state);
      }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('private1test OK');
  await b.close();
})();
