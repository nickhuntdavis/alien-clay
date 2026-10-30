// Beta part 1 (beta1.js): Little Prick's IV Drip / Adrenaline Shot / Blood Draw and One of These Days' Flatline / DNR / Triage.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, LP = 'v_arcane_proj', DD = 's_duedate', MAXHP = 1e6;
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null, FREE = false, KEEPBLEED = false;
    const scene = (wid, pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = o.t != null ? o.t : 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.s10 = Object.assign({}, G.s10 || {}, { id: o.sample || 'beta' });
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(wid, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = MAXHP; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      if (typeof stamInit === 'function') { stamInit(); G.stam.cur = 10; }
      const p = G.player; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0; G.ebul.length = 0; KEEPBLEED = false;
      PIN = o.noPin ? null : { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; e.px = e.x; e.py = e.y; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    const run = (n, fn) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (!FREE) for (const e of G.enemies) if (e.px != null) { e.x = e.px; e.y = e.py; e.kx = e.ky = 0; } if (KEEPBLEED) for (const e of G.enemies) if (!e.dead) e.bleeds = [{ dps: 0, t: 3, by: 'test' }]; if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const hpAt = fr => { G.player.hp = MAXHP * fr; };
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const fx = (w, k) => (w.be1 && w.be1.fx && w.be1.fx[k]) || 0;
    const rate = w => { AIMAT.w = w; return rateBonus(); };
    const mark = (w, e, stored) => { dueMark(w, e, true); if (stored != null && e.due) e.due.stored = stored; return e.due; };

    // ---- the sets are Beta's, and other samples keep the shared ones
    block('sets', () => {
      for (const [wid, names] of [[LP, 'IV Drip,Adrenaline Shot,Blood Draw'], [DD, 'Flatline,DNR,Triage']]) {
        let sc = scene(wid, [[100, 0]]); const t = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
        chk(wid + ' Beta promises', t.join() === names, t);
        for (const smp of ['alpha', 'baseline']) {
          sc = scene(wid, [[100, 0]], { sample: smp }); const t2 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title);
          const want = ['A', 'B', 'C'].map(k => wupSpecFor(wid, smp)[k].name).join();
          chk(wid + ' ' + smp + ' keeps the shared branches', t2.join() === want && t2.join() !== names, t2);
        }
        sc = scene(wid, [[100, 0]], { sample: 'beta' }); chk(wid + ' 3 Lv 9 masteries', genLoot({ kind: 'fork', w: sc.w, lv: 10 }).length === 3);
      }
    });
    // every card text is a placeholder (or the user's copy once betacopy.js has it), and the names are the drafted ones
    block('copy', () => {
      const names = { [LP]: ['Saline Bag', 'Cannula', 'Air Bubble', 'Epinephrine', 'Racing Heart', 'Overdose', 'Phlebotomist', 'Butterfly Needle', 'Squeamish', 'Drip Feed', 'Crash Cart', 'Blood Bank'],
        [DD]: ['Code Blue', 'Heart Monitor', 'Beep', 'Living Will', 'Last Rites', 'Paperwork', 'Waiting Room', 'Walk-in Clinic', 'Wrong Patient', 'Time of Death', 'Organ Harvest', 'Mass Casualty'] };
      const keys = { [LP]: ['iv', 'adren', 'draw'], [DD]: ['flatline', 'dnr', 'triage'] }, pre = { [LP]: 'be_lp', [DD]: 'be_dd' };
      const ok = (txt, id) => typeof txt === 'string' && txt.length > 0 && (txt === 'TODO_COPY:' + id || (typeof BETA_COPY !== 'undefined' && BETA_COPY[id] === txt));
      const slug = n => n.toLowerCase().replace(/[^a-z]/g, '');
      for (const wid of [LP, DD]) {
        const S = wupSpecFor(wid, 'beta'), have = [];
        'ABC'.split('').forEach((k, i) => {
          const id = pre[wid] + '_' + keys[wid][i];
          have.push(...S[k].lv6.map(c => c.name), S[k].wild.name);
          chk(wid + k + ' branch texts', ok(S[k].lv3.desc, id + '_desc') && ok(S[k].tag, id + '_tag') && ok(S[k].costs, id + '_costs'), [S[k].lv3.desc, S[k].tag, S[k].costs]);
          for (const c of [...S[k].lv6, S[k].wild]) chk(wid + ' ' + c.name + ' text', ok(c.desc, pre[wid] + '_' + slug(c.name) + '_desc'), c.desc);
        });
        have.push(...S.lv10.map(c => c.name)); chk(wid + ' card names', have.join() === names[wid].join(), have);
        for (const c of S.lv10) chk(wid + ' ' + c.name + ' text', ok(c.desc, pre[wid] + '_' + slug(c.name) + '_desc'), c.desc);
        chk(wid + ' best letters', S.lv10.map(c => c.best).join() === 'A,B,C');
      }
    });
    // the wrappers do nothing for another sample's run
    block('inert elsewhere', () => {
      const sc = scene(LP, [[100, 0]], { sample: 'alpha' }); hpAt(0.5); const h0 = G.player.hp; healPlayer(1000, true);
      chk('healPlayer is normal for others', Math.abs(G.player.hp - h0 - 1000 * G.P.healMult) < 1e-6, G.player.hp - h0);
      chk('no shield for others', !(G.be1 && G.be1.shield > 0)); chk('mutSpeed/rateBonus callable', typeof mutSpeed() === 'number' && (AIMAT.w = sc.w, typeof rateBonus() === 'number'));
    });

    // ================================================================ LITTLE PRICK
    block('IV Drip', () => {
      let sc = scene(LP, ringPts(8)); pick(sc.w, 3, 0); const f = sc.w.be1; hpAt(0.5); const h0 = G.player.hp;
      run(150); chk('IV Drip: needles leave drips', fx(sc.w, 'drip') >= 3 && f.dripN >= 1, [fx(sc.w, 'drip'), f.dripN]);
      for (const e of sc.es.slice(0, 3)) be1LpHit(sc.w, e, {}, {}); hpAt(0.5); const h00 = G.player.hp; run(60); chk('IV Drip: 3 dripping enemies heal you', f.dripN >= 3 && fx(sc.w, 'dripheal') >= 1 && G.player.hp > h00 + 3e3, [f.dripN, G.player.hp - h00]);
      chk('IV Drip: (unused)', true);
      chk('IV Drip: dripping enemies bleed', sc.es.some(e => e.bleeds && e.bleeds.length));
      // fewer than 3: no heal
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 0); hpAt(0.5); const h1 = G.player.hp; run(120); chk('IV Drip: one drip heals nothing', sc.w.be1.dripN === 1 && G.player.hp <= h1 + 1e-6, [sc.w.be1.dripN, G.player.hp - h1]);
      // Saline Bag: the heal doubles while low
      const heal = (low, saline) => {
        const s2 = scene(LP, [[100, 0], [100, 40], [100, -40]]); pick(s2.w, 3, 0); if (saline) pick(s2.w, 6, 0);
        for (const e of s2.es) { e.be1drip = G.t + 5; (s2.w.be1.drips || (s2.w.be1.drips = new Set())).add(e); }
        hpAt(low ? 0.2 : 0.6); const h = G.player.hp; be1LpTick(s2.w, 1); return G.player.hp - h;
      };
      const base = heal(false, false), salNot = heal(false, true), salLow = heal(true, true);
      chk('Saline Bag: no change at normal health', Math.abs(salNot / base - 1) < 0.01 && base > 0, [base, salNot]);
      chk('Saline Bag: the drip heal doubles while low', Math.abs(salLow / base - 2) < 0.01, [salLow, base]);
      // Cannula
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 0); const p0 = sc.w.s.pierce || 0; pick(sc.w, 6, 1); chk('Cannula: pierce +1', (sc.w.s.pierce || 0) === p0 + 1, [p0, sc.w.s.pierce]);
      // Air Bubble
      BE1.bubbleP = 1; sc = scene(LP, [[100, 0], [120, 30], [90, -40]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); run(200); BE1.bubbleP = 0.15;
      chk('Air Bubble: a dripping enemy pops in a Blood burst', fx(sc.w, 'bubble') >= 1, fx(sc.w, 'bubble'));
      // Drip Feed
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); G.be1 = null;
      healPlayer(5e5, true); chk('Drip Feed: healing past full becomes shield, capped at 20%', Math.abs(G.be1.shield - 2e5) < 1, G.be1 && G.be1.shield);
      const left = hookPass('hurt:before', 3e5, 'test', null, 'other'); chk('Drip Feed: the shield takes the hit first', Math.abs(left - 1e5) < 1 && G.be1.shield === 0, [left, G.be1.shield]);
      G.be1.shield = 5e4; const hp = G.player.hp; hurtPlayer(8e4, 'test', null, 'other'); chk('Drip Feed: a real hit is soaked', hp - G.player.hp < 3.1e4 + 1 && hp - G.player.hp > 0, hp - G.player.hp);
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 1); G.be1 = null; hpAt(1); healPlayer(5e5, true); chk('no shield without Drip Feed', !(G.be1 && G.be1.shield > 0));
    });
    block('Adrenaline Shot', () => {
      let sc = scene(LP, ringPts(8)); const r0 = rate(sc.w); pick(sc.w, 3, 1); const f = sc.w.be1;
      hpAt(1); chk('Adrenaline: nothing at full health', Math.abs(rate(sc.w) / r0 - 1) < 0.001, rate(sc.w) / r0);
      hpAt(0.1); chk('Adrenaline: +80% at 10% health', Math.abs(rate(sc.w) / r0 - 1.8) < 0.01, rate(sc.w) / r0);
      hpAt(0.55); const mid = rate(sc.w) / r0; chk('Adrenaline: climbs between', mid > 1.2 && mid < 1.6, mid);
      const other = makeSlot('v_phys_proj', false, 1); AIMAT.w = other; chk('Adrenaline: only Little Prick', Math.abs(rateBonus() / r0 - 1) < 0.001);
      hpAt(0.2); run(120); chk('Adrenaline: fires and hits', sc.es.some(e => lost(e) > 0));
      // Epinephrine
      sc = scene(LP, ringPts(6)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); hpAt(1); run(10); const rFull = rate(sc.w);
      hpAt(0.3); run(3); chk('Epinephrine: dropping below 40% starts 3 s', fx(sc.w, 'epi') === 1 && sc.w.be1.epiT > G.t, [fx(sc.w, 'epi'), sc.w.be1.epiT - G.t]);
      const withEpi = rate(sc.w); sc.w.be1.epiT = 0; const noEpi = rate(sc.w); chk('Epinephrine: double fire rate', Math.abs(withEpi / noEpi - 2) < 0.01, [withEpi, noEpi]);
      hpAt(1); run(5); hpAt(0.3); run(5); chk('Epinephrine: 20 s cooldown', fx(sc.w, 'epi') === 1, fx(sc.w, 'epi'));
      sc.w.be1.epiCd = 0; hpAt(1); run(5); hpAt(0.3); run(5); chk('Epinephrine: goes off again after the cooldown', fx(sc.w, 'epi') === 2, fx(sc.w, 'epi'));
      sc = scene(LP, ringPts(6)); pick(sc.w, 3, 1); pick(sc.w, 6, 0); hpAt(0.5); run(10); chk('Epinephrine: 50% health is not low', fx(sc.w, 'epi') === 0);
      // Racing Heart
      sc = scene(LP, ringPts(8)); pick(sc.w, 3, 1); pick(sc.w, 6, 1); const sp0 = mutSpeed(); hpAt(0.5); run(120);
      chk('Racing Heart: nothing while healthy', !(sc.w.be1.rh > 0) && Math.abs(mutSpeed() / sp0 - 1) < 1e-6, sc.w.be1.rh);
      hpAt(0.2); run(150); chk('Racing Heart: needles that land make you faster', sc.w.be1.rh >= 0.04 && Math.abs(mutSpeed() / sp0 - (1 + sc.w.be1.rh)) < 1e-6, [sc.w.be1.rh, mutSpeed() / sp0]);
      for (let i = 0; i < 14; i++) be1LpHit(sc.w, sc.es[0], {}, {}); chk('Racing Heart: up to 20%', Math.abs(sc.w.be1.rh - 0.2) < 1e-9 && Math.abs(mutSpeed() / sp0 - 1.2) < 1e-6, [sc.w.be1.rh, mutSpeed() / sp0]);
      sc.es.forEach(e => e.hp = 1); const rh = sc.w.be1.rh; hpAt(0.5); G.proj.length = 0; sc.es.forEach(e => { e.x = e.px = 9999; e.y = e.py = 9999; }); run(150); chk('Racing Heart: fades after 2 s', sc.w.be1.rh < rh * 0.2, [rh, sc.w.be1.rh]);
      // Overdose
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); const e = sc.es[0], dm = () => sc.w.uh.dmg.reduce((k, h) => k * h(sc.w, e, {}), 1);
      hpAt(1); chk('Overdose: needles 15% weaker at full health', Math.abs(dm() - 0.85) < 0.001, dm()); hpAt(0.99); chk('Overdose: not below full', Math.abs(dm() - 1) < 0.001, dm());
      // Crash Cart
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); G.player.hp = 5; G.proj.length = 0; G.player.iframes = 0;
      hurtPlayer(3e5, 'test', null, 'other');
      chk('Crash Cart: the killing hit leaves you on 1', G.player.hp === 1 && G.state === 'play', [G.player.hp, G.state]);
      chk('Crash Cart: a ring of 16 needles', G.proj.filter(q => q.w === sc.w).length >= 12 && fx(sc.w, 'crash') === 1, [G.proj.length, fx(sc.w, 'crash')]);
      G.player.hp = 0; hookRun('hurt:late', 10, null, null); chk('Crash Cart: once a wave', G.player.hp === 0 && fx(sc.w, 'crash') === 1);
      G.be1.crashKey = 'other'; G.player.hp = 0; hookRun('hurt:late', 10, null, null); chk('Crash Cart: ready again next wave', G.player.hp === 1 && fx(sc.w, 'crash') === 2);
    });
    block('Blood Draw', () => {
      let sc = scene(LP, ringPts(6)); pick(sc.w, 3, 2); const f = sc.w.be1; KEEPBLEED = true; hpAt(0.5);
      run(30); chk('Blood Draw: vials fill on Bleeding enemies', (f.vials || 0) > 0 || fx(sc.w, 'armed') > 0, [f.vials, fx(sc.w, 'vial')]);
      run(400); chk('Blood Draw: a full vial arms the next needle', fx(sc.w, 'armed') >= 1, fx(sc.w, 'armed'));
      chk('Blood Draw: the heavy needle flies, lands and heals', fx(sc.w, 'heavy') >= 1 && fx(sc.w, 'heavyhit') >= 1 && fx(sc.w, 'heavyheal') >= 1, [fx(sc.w, 'heavy'), fx(sc.w, 'heavyhit'), fx(sc.w, 'heavyheal')]);
      // no bleed, no vial
      sc = scene(LP, [[100, 0]]); pick(sc.w, 3, 2); KEEPBLEED = false; sc.es[0].bleeds = []; be1LpHit(sc.w, sc.es[0], { statusOk: false }, {}); chk('Blood Draw: a clean enemy fills nothing', !sc.w.be1.vials);
      // x4 and the heal
      sc = scene(LP, [[200, 0]]); pick(sc.w, 3, 2); sc.w.be1.armed = true; G.proj.length = 0; fireWeapon(sc.w, sc.es[0]);
      const hv = G.proj.filter(q => q.w === sc.w && q.be1heavy); chk('Blood Draw: the next needle is heavy (x4)', hv.length === 1 && hv[0].dmg >= sc.w.s.dmg * 3.9 && !sc.w.be1.armed, [hv.length, hv[0] && hv[0].dmg, sc.w.s.dmg]);
      hpAt(0.5); const h0 = G.player.hp; be1LpHit(sc.w, sc.es[0], {}, hv[0].src); be1LpHit(sc.w, sc.es[0], {}, hv[0].src);
      chk('Blood Draw: heals 3%, once per needle', Math.abs(G.player.hp - h0 - MAXHP * 0.03 * G.P.healMult) < 1, G.player.hp - h0);
      chk('Blood Draw: not piercing by default', !(hv[0].pierce > 50));
      // Phlebotomist
      sc = scene(LP, [[100, 0, 1e5, 1], [100, 40]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); for (const e of sc.es) e.bleeds = [{ dps: 0, t: 3, by: 't' }];
      be1LpHit(sc.w, sc.es[1], {}, {}); const nv = sc.w.be1.vials; sc.w.be1.vials = 0; be1LpHit(sc.w, sc.es[0], {}, {}); chk('Phlebotomist: Elites fill twice as fast', nv === 1 && sc.w.be1.vials === 2, [nv, sc.w.be1.vials]);
      // Butterfly Needle
      sc = scene(LP, [[200, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); sc.w.be1.armed = true; fireWeapon(sc.w, sc.es[0]); const bn = G.proj.find(q => q.w === sc.w && q.be1heavy);
      chk('Butterfly Needle: the heavy needle pierces everything', bn && bn.pierce >= 50, bn && bn.pierce);
      // Squeamish
      sc = scene(LP, [[100, 0], [140, 0], [100, 60], [400, 0], [130, 20, 1e5]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); sc.es[4].boss = true;
      be1HeavyLand(sc.w, sc.es[0], { be1id: 77 });
      chk('Squeamish: enemies within 100 flee for 1 s', sc.es[1].fearT > G.t && sc.es[2].fearT > G.t && !(sc.es[3].fearT > G.t) && !(sc.es[4].fearT > G.t) && !(sc.es[0].fearT > G.t), sc.es.map(e => e.fearT));
      // Blood Bank
      sc = scene(LP, [[100, 0], [150, 50], [-150, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); const bf = sc.w.be1; hpAt(0.8);
      for (const e of sc.es) e.bleeds = [{ dps: 0, t: 3, by: 't' }];
      for (let i = 0; i < 4; i++) { bf.vials = 9; be1LpHit(sc.w, sc.es[0], {}, {}); }
      chk('Blood Bank: up to 3 heavy needles are stored', bf.stored === 3 && !bf.armed && bf.vials === 10, [bf.stored, bf.armed, bf.vials]);
      run(3); G.proj.length = 0; hpAt(0.3); run(2);
      const volley = G.proj.filter(q => q.w === sc.w && q.be1heavy).length; chk('Blood Bank: dropping below 40% fires them all at once', volley === 3 && bf.stored === 0 && fx(sc.w, 'bank') === 1, [volley, bf.stored, fx(sc.w, 'bank')]);
      bf.vials = 9; be1LpHit(sc.w, sc.es[0], {}, {}); chk('Blood Bank: while low a full vial arms the next needle instead', bf.armed && !bf.stored, [bf.armed, bf.stored]);
    });

    // ================================================================ ONE OF THESE DAYS
    block('Flatline', () => {
      const payout = fr => { const sc = scene(DD, [[100, 0], [200, 0, 1e5]]); pick(sc.w, 3, 0); mark(sc.w, sc.es[0], 1000); hpAt(fr); duePop(sc.es[0]); return { sc, M: sc.w.be1.last.M, l: lost(sc.es[0]) }; };
      const a = payout(1), c = payout(0.1), d = payout(0.55);
      chk('Flatline: nothing at full health', Math.abs(a.M - 1) < 0.001, a.M); chk('Flatline: +150% at 10% health', Math.abs(c.M - 2.5) < 0.001, c.M);
      chk('Flatline: climbs between', d.M > 1.5 && d.M < 2.2, d.M); chk('Flatline: the payout really is bigger', c.l > a.l * 2, [a.l, c.l]);
      // Code Blue
      let sc = scene(DD, [[100, 0], [150, 0, 5e5], [200, 40, 1e4]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); mark(sc.w, sc.es[0], 100); hpAt(1); duePop(sc.es[0]);
      chk('Code Blue: nothing when healthy', !sc.es[1].due && !sc.es[2].due);
      sc = scene(DD, [[100, 0], [150, 0, 5e5], [200, 40, 1e4]]); pick(sc.w, 3, 0); pick(sc.w, 6, 0); mark(sc.w, sc.es[0], 100); hpAt(0.2); duePop(sc.es[0]);
      chk('Code Blue: low at a payout marks the strongest at once', !!sc.es[1].due && !sc.es[2].due && fx(sc.w, 'codeblue') === 1, [!!sc.es[1].due, !!sc.es[2].due]);
      // Heart Monitor
      const drain = low => { const s2 = scene(DD, [[100, 0]]); pick(s2.w, 3, 0); pick(s2.w, 6, 1); s2.w.cd = 1e9; const D = mark(s2.w, s2.es[0], 0); D.end = G.t + 100; const e0 = D.end; hpAt(low ? 0.2 : 0.8); for (let i = 0; i < 60; i++) { be1DdTick(s2.w, 1 / 60); } return e0 - D.end; };
      const dl = drain(true), dn = drain(false); chk('Heart Monitor: the countdown runs 40% faster while low', Math.abs(dl - 0.4) < 0.01 && dn === 0, [dl, dn]);
      // Beep
      sc = scene(DD, [[100, 0], [130, 0], [100, 40], [600, 0]]); pick(sc.w, 3, 0); pick(sc.w, 6, 2); sc.w.cd = 1e9; const bm = mark(sc.w, sc.es[0], 0); bm.end = G.t + 100;
      run(190); chk('Beep: a Blood pulse every second round the marked enemy', fx(sc.w, 'beep') >= 2 && lost(sc.es[1]) > 0 && lost(sc.es[2]) > 0 && lost(sc.es[3]) === 0, [fx(sc.w, 'beep'), lost(sc.es[1]), lost(sc.es[2]), lost(sc.es[3])]);
      // Time of Death
      sc = scene(DD, [[100, 0], [150, 0]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); sc.es[0].hp = sc.es[0].maxHp * 0.2; mark(sc.w, sc.es[0], 0); duePop(sc.es[0]);
      chk('Time of Death: under 25% dies outright', sc.es[0].dead && fx(sc.w, 'tod') === 1, [sc.es[0].dead, fx(sc.w, 'tod')]);
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); sc.es[0].hp = sc.es[0].maxHp * 0.3; mark(sc.w, sc.es[0], 0); duePop(sc.es[0]); chk('Time of Death: not above 25%', !sc.es[0].dead);
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); const bs = sc.es[0]; bs.boss = true; bs.hp = bs.maxHp * 0.2; mark(sc.w, bs, 0); hpAt(1); duePop(bs);
      chk('Time of Death: a boss takes x3 instead', !bs.dead && Math.abs(sc.w.be1.last.M - 3) < 0.001 && fx(sc.w, 'todboss') === 1, [bs.dead, sc.w.be1.last.M]);
    });
    block('DNR', () => {
      let sc = scene(DD, [[100, 0], [150, 0]]); pick(sc.w, 3, 1); const f = sc.w.be1; hpAt(0.5); const h0 = G.player.hp;
      healPlayer(1e4, true); chk('DNR: healing works with no mark up', G.player.hp > h0 + 1e3);
      sc.w.cd = 1e9; const D = mark(sc.w, sc.es[0], 1000); D.end = G.t + 100; hpAt(0.5); const h1 = G.player.hp; healPlayer(1e4, true);
      chk('DNR: no healing while a mark is up', G.player.hp === h1 && f.blocked >= 1e4 * G.P.healMult - 1, [G.player.hp - h1, f.blocked]);
      be1DdTick(sc.w, 1 / 60); G.player.hp += 5e3; be1DdTick(sc.w, 1 / 60); chk('DNR: regeneration is pulled back too', G.player.hp === h1 && f.blocked >= 1.4e4, [G.player.hp - h1, f.blocked]);
      G.player.hp -= 1e4; be1DdTick(sc.w, 1 / 60); chk('DNR: damage still lands', G.player.hp === h1 - 1e4);
      f.blocked = 0; sc.es[0].due.stored = 1000; hpAt(1); duePop(sc.es[0]); chk('DNR: the payout is x2.5', Math.abs(f.last.M - 2.5) < 0.001, f.last.M);
      be1DdTick(sc.w, 1 / 60); hpAt(0.5); const h2 = G.player.hp; healPlayer(1e4, true); chk('DNR: healing is back once the mark has paid', G.player.hp > h2 + 1e3);
      // Living Will
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); const e = sc.es[0]; const d1 = mark(sc.w, e, 1000); const base = (1000 * sc.w.s.repeat + sc.w.s.dmg * 3) * 2.5; sc.w.be1.blocked = 2000; duePop(e);
      chk('Living Will: the blocked healing, x3, is added to the payout', Math.abs(sc.w.be1.last.T - (base + 6000)) < 1 && sc.w.be1.blocked === 0 && fx(sc.w, 'will') === 1, [sc.w.be1.last.T, base]);
      const e2 = (sc = scene(DD, [[100, 0]]), pick(sc.w, 3, 1), pick(sc.w, 6, 0), sc.es[0]); mark(sc.w, e2, 1000); sc.w.be1.blocked = 0; duePop(e2); const l0 = lost(e2);
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 0); mark(sc.w, sc.es[0], 1000); sc.w.be1.blocked = 2e5; duePop(sc.es[0]); chk('Living Will: it really lands', lost(sc.es[0]) > l0 + 3e5, [l0, lost(sc.es[0])]);
      // Last Rites
      sc = scene(DD, [[100, 0], [160, 0], [100, 60], [500, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); mark(sc.w, sc.es[0], 100); duePop(sc.es[0]);
      chk('Last Rites: everything within 120 Bleeds', sc.es[1].bleeds && sc.es[1].bleeds.length && sc.es[2].bleeds && sc.es[2].bleeds.length && !(sc.es[3].bleeds && sc.es[3].bleeds.length), sc.es.map(x => x.bleeds && x.bleeds.length));
      // Paperwork
      BE1.paperP = 1; sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); mark(sc.w, sc.es[0], 1000); duePop(sc.es[0]); BE1.paperP = 0.25;
      chk('Paperwork: a payout is paid twice', fx(sc.w, 'paper') === 1 && lost(sc.es[0]) > sc.w.be1.last.T * 1.5, [lost(sc.es[0]), sc.w.be1.last.T]);
      BE1.paperP = 0; sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 1); pick(sc.w, 6, 2); mark(sc.w, sc.es[0], 1000); duePop(sc.es[0]); BE1.paperP = 0.25; chk('Paperwork: not every time', fx(sc.w, 'paper') === 0);
      // Organ Harvest
      sc = scene(DD, [[100, 0], [150, 0], [100, 60], [-100, -40], [700, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); sc.es[0].hp = 10; mark(sc.w, sc.es[0], 100); hpAt(1); duePop(sc.es[0]);
      const sp = sc.w.be1.last.T / 3; chk('Organ Harvest: a payout that kills splits across the 3 nearest', sc.es[0].dead && [1, 2, 3].every(i => lost(sc.es[i]) > sp * 0.3) && lost(sc.es[4]) === 0 && fx(sc.w, 'harvest') === 1, [sc.es[0].dead, [1, 2, 3].map(i => lost(sc.es[i])), sp]);
      sc = scene(DD, [[100, 0], [150, 0]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); mark(sc.w, sc.es[0], 0); duePop(sc.es[0]); chk('Organ Harvest: nothing if it lives', !sc.es[0].dead && fx(sc.w, 'harvest') === 0);
    });
    block('Triage', () => {
      let sc = scene(DD, [[100, 0], [150, 20], [120, -60], [200, 0], [-100, 0], [-150, 40]]); const dur0 = sc.w.s.dur; pick(sc.w, 3, 2);
      chk('Triage: the countdown is half as long', Math.abs(sc.w.s.dur - dur0 / 2) < 1e-6, [dur0, sc.w.s.dur]);
      const fr = [0.9, 0.5, 0.2, 1, 0.1, 0.7]; sc.es.forEach((e, i) => e.hp = e.maxHp * fr[i]); sc.w.cd = 0; run(40);
      const got = sc.es.map((e, i) => e.due ? i : -1).filter(i => i >= 0); chk('Triage: marks go on the 3 most wounded', got.join() === '1,2,4', got);
      mark(sc.w, sc.es[0], 100); sc.es[2].due.stored = 1000; hpAt(1); duePop(sc.es[2]); chk('Triage: payout x0.4', Math.abs(sc.w.be1.last.M - 0.4) < 0.001, sc.w.be1.last.M);
      // Waiting Room
      sc = scene(DD, [[100, 0], [400, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 0); run(30); const mk = sc.es.find(e => e.due); chk('Waiting Room: marked enemies are slowed 30%', mk && mk.chillAmt >= 0.3 && mk.chill > 0 && fx(sc.w, 'waiting') > 0, mk && [mk.chillAmt, mk.chill]);
      // Walk-in Clinic
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); sc.es[0].hp = 5; mark(sc.w, sc.es[0], 50); hpAt(0.5); const h0 = G.player.hp; duePop(sc.es[0]);
      chk('Walk-in Clinic: a kill by a payout heals 2%', sc.es[0].dead && Math.abs(G.player.hp - h0 - MAXHP * 0.02 * G.P.healMult) < 1 && fx(sc.w, 'clinic') === 1, [G.player.hp - h0]);
      sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 1); mark(sc.w, sc.es[0], 50); hpAt(0.5); const h1 = G.player.hp; duePop(sc.es[0]); chk('Walk-in Clinic: no heal if it lives', !sc.es[0].dead && G.player.hp === h1);
      // Wrong Patient
      BE1.wrongP = 1; sc = scene(DD, [[100, 0], [150, 20], [120, -60]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); hpAt(0.5); const h2 = G.player.hp; sc.w.cd = 0; run(10);
      chk('Wrong Patient: a mark lands on you instead', !!sc.w.be1.self && fx(sc.w, 'wrongself') >= 1 && be1Marks(sc.w).length === 2, [!!sc.w.be1.self, be1Marks(sc.w).length]);
      run(Math.ceil(sc.w.s.dur * 60) + 30); BE1.wrongP = 0.15; chk('Wrong Patient: it heals you 5% when it pays out', fx(sc.w, 'wrongpay') >= 1 && G.player.hp >= h2 + MAXHP * 0.05 - 1, [G.player.hp - h2, fx(sc.w, 'wrongpay')]);
      BE1.wrongP = 0; sc = scene(DD, [[100, 0]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); sc.w.cd = 0; run(20); BE1.wrongP = 0.15; chk('Wrong Patient: not every time', !sc.w.be1.self);
      // Mass Casualty
      sc = scene(DD, Array.from({ length: 8 }, (_, i) => [90 + i * 25, (i % 2) * 70 - 35])); const keep = () => { for (const e of be1Marks(sc.w)) e.due.end = G.t + 50; }; pick(sc.w, 3, 2); sc.w.cd = 0; run(60, keep); const n3 = be1Marks(sc.w).length;
      pick(sc.w, 10, 2); sc.w.cd = 0; run(90, keep); const n5 = be1Marks(sc.w).length; chk('Mass Casualty: up to 5 marks (3 before)', n3 === 3 && n5 === 5, [n3, n5]);
      sc = scene(DD, Array.from({ length: 8 }, (_, i) => [90 + i * 25, (i % 2) * 70 - 35])); pick(sc.w, 3, 0); pick(sc.w, 10, 2); sc.w.cd = 0; run(120, () => { for (const e of be1Marks(sc.w)) e.due.end = G.t + 50; }); chk('Mass Casualty: caps the marks at 5 on any branch', be1Marks(sc.w).length <= 5 && be1Marks(sc.w).length >= 1, be1Marks(sc.w).length);
    });

    // ================================================================ a 300-frame ring run for every branch, with its cards stacked and health swinging
    block('ring runs', () => {
      for (const wid of [LP, DD]) for (const i of [0, 1, 2]) {
        const sc = scene(wid, ringPts(10).concat([[330, 0, 1e5, 1]]), { second: wid === LP ? 'v_phys_spread' : LP }); pick(sc.w, 3, i); pick(sc.w, 6, 0); pick(sc.w, 6, 1);
        const S = wupSpecFor(wid, 'beta'); S[['A', 'B', 'C'][i]].wild.apply(sc.w); S.lv10[i].apply(sc.w); recomputeAll();
        KEEPBLEED = wid === LP && i === 2;
        run(300, f => { hpAt(f < 100 ? 0.9 : f < 200 ? 0.25 : 0.6); });
        chk(wid + ' ' + 'ABC'[i] + ' ring run hits', sc.es.some(e => lost(e) > 0)); out[wid + 'ABC'[i]] = Math.round(sc.es.reduce((a, e) => a + lost(e), 0));
        chk(wid + ' ' + 'ABC'[i] + ' ring run leaves you alive', G.state === 'play' && G.player.hp > 0, G.state);
      }
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('beta1test OK');
  await b.close();
})();
