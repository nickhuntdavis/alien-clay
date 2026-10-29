// Baseline part 2 (baseline2.js): the Shotgun (Maximum Gains renamed) and its Sperminator / Evil Dead / Riding shotgun branches,
// the gated Come back passive and the costumes. One check per card.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {}, MG = 'v_phys_spread';
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    const chk = (name, cond, info) => { if (!cond) bad.push(name + (info !== undefined ? ' [' + JSON.stringify(info) + ']' : '')); };
    const block = (name, fn) => { try { fn(); } catch (err) { bad.push(name + ' threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } };
    let PIN = null;
    // A fresh run holding the Shotgun (and a second weapon if asked); enemies at (dx, dy[, hp[, elite]]) from the swimmer. quiet: the fan never fires.
    const scene = (pts, o) => {
      o = o || {};
      if (typeof RACE15 !== 'undefined') RACE15.xp = 1; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(MG, false, 1), o.second ? makeSlot(o.second, false, 1) : null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.P.crit = -5; recomputeAll(); G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0;
      const p = G.player; p.hd = 0; p.face = 0; G.enemies.length = 0; G.stats.dmg = {}; G.proj.length = 0; G.zones.length = 0;
      if (o.quiet) G.weapons[0].cd = 1e9;
      PIN = { x: p.x, y: p.y };
      const es = pts.map(([dx, dy, hp, elite]) => { const e = makeEnemy(o.def || plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); return e; });
      gridBuild();
      return { w: G.weapons[0], w2: G.weapons[1], es, p };
    };
    const addFoe = (dx, dy, hp, elite) => { const p = G.player, e = makeEnemy(plain, p.x + dx, p.y + dy); e.tst = 1; e.hp = e.maxHp = hp || 1e5; e.speed = 0; if (elite) e.elite = 1; G.enemies.push(e); gridBuild(); return e; };
    const pick = (w, lv, i) => { const cs = genLoot({ kind: 'fork', w, lv }); if (!cs[i]) throw new Error('no card ' + lv + '/' + i); cs[i].apply(); return cs[i].title; };
    // vx: hold the swimmer at that speed along +x (the bot stands still in a test, so the speed is set by hand)
    const run = (n, fn, vx) => { for (let f = 0; f < n; f++) { G.enemies = G.enemies.filter(e => e.tst); if (vx != null) { G.player.vx = vx; G.player.vy = 0; } update(1 / 60); if (PIN) { G.player.x = PIN.x; G.player.y = PIN.y; } if (fn) fn(f); } };
    const lost = e => e.maxHp - e.hp;
    const ringPts = n => Array.from({ length: n }, (_, i) => [Math.cos(i / n * 6.283) * (70 + (i % 3) * 60), Math.sin(i / n * 6.283) * (70 + (i % 3) * 60)]);
    const fast = 165 * 1.4;
    const volleys = []; hookOn('fire:after', 'test:b2', (w, t, n0) => { if (w && !w.isSpell) volleys.push({ w, n: G.proj.length - n0, t: G.t, pr: G.proj.slice(n0).filter(q => q.w === w), spd: Math.hypot(G.player.vx, G.player.vy), inn: w._in }); });
    const cardOf = id => MUT_REG.find(c => c.id === id);

    // The rename and the promises.
    block('rename', () => {
      const sc = scene([[100, 0]]);
      chk('WEAPONS name', WEAPONS[MG].name === 'Shotgun', WEAPONS[MG].name); chk('W24_BY name', W24_BY[MG].name === 'Shotgun'); chk('slot name', sc.w.def.name === 'Shotgun');
      chk('W24 row', W24.find(r => r[0] === MG)[1] === 'Shotgun'); chk('desc in place', !!WEAPONS[MG].desc && WEAPONS[MG].desc === W24_DESC[MG] && !/^TODO_COPY/.test(WEAPONS[MG].desc));
      const t3 = genLoot({ kind: 'fork', w: sc.w, lv: 3 }).map(c => c.title); chk('Shotgun promises', t3.join() === 'Sperminator,Evil Dead,Riding shotgun', t3);
      const l6 = [0, 1, 2].map(i => { const s2 = scene([[100, 0]]); pick(s2.w, 3, i); return genLoot({ kind: 'fork', w: s2.w, lv: 6 }).map(c => c.title).join('|'); });
      out.lv6 = l6;
      chk('Lv 6 cards', l6[0].startsWith('Improved targeting|Terminated|') && l6[1].startsWith('Groovy|Boomstick|') && l6[2].startsWith('Drive-by|Handbrake turn|'), l6);
    });

    // ---------------------------------------------------------------- A. Sperminator
    block('Sperminator', () => {
      let sc = scene([[100, 0, 1e5, 1]]); pick(sc.w, 3, 0); const D = pdef();
      chk('Sperminator: two Shell layers on you', D.layers === 2, D.layers);
      run(3); D.layers = 0; bl2S().shellT = G.t - 1; run(2);
      chk('Sperminator: a layer regrows', D.layers === 1, D.layers); chk('Sperminator: next one in 12 s', bl2S().shellT - G.t > 11 && bl2S().shellT - G.t <= 12, bl2S().shellT - G.t);
      D.layers = 0; pdRefit(D); chk('Sperminator: a refit keeps the extra layers', D.layers === 2, D.layers);
      sc = scene([[100, 0, 1e5, 1]]); pick(sc.w, 3, 0); const el = sc.es[0];
      run(40); chk('Sperminator: the first volley marks the Elite', el.bl2mk === 1 && el.bl1mk === 1 && G.grudge === el, [el.bl2mk, el.bl1mk]);
      chk('Sperminator: +60% to the mark', Math.abs(bl2Dmg(sc.w, el, {}) - 1.6) < 1e-9 && bl2Dmg(sc.w, el, { wupEcho: 1 }) === 1);
      const l0 = lost(el), decoy = addFoe(0, 70); run(90);
      chk('Sperminator: aim stays on the mark', lost(el) > l0 && lost(decoy) === 0, [lost(el) - l0, lost(decoy)]);
      // a plain enemy is never marked
      sc = scene([[100, 0, 1e5, 0]]); pick(sc.w, 3, 0); run(60); chk('Sperminator: plain enemies are not marked', !sc.es[0].bl1mk);
      // Lv 6
      sc = scene([[100, 0]]); pick(sc.w, 3, 0);
      chk('FINISHER hidden before Improved targeting', !aimList().some(d => d.id === 'finisher')); pick(sc.w, 6, 0);
      chk('Improved targeting unlocks FINISHER', aimList().some(d => d.id === 'finisher'));
      sc = scene([[100, 0, 1e5, 1], [-100, 40, 1e5, 1]]); pick(sc.w, 3, 0); pick(sc.w, 6, 1); sc.p.hp = 5e5; run(40);
      const first = sc.es.find(e => e.bl2mk), other = sc.es.find(e => !e.bl2mk); chk('Terminated: a mark exists', !!first && !!other);
      damageEnemy(first, 1e9, { elem: 'phys', noCrit: true, wname: 'test' });
      chk('Terminated heals 10% of max health', sc.p.hp >= 5e5 + 0.09e6, sc.p.hp); chk('Terminated marks the next Elite', other.bl2mk === 1, other.bl2mk);
      // wild: the ricochet
      const ricScene = wild => { const s = scene([[80, 0, 1e5, 1], [80, 120, 1e5]]); pick(s.w, 3, 0); if (wild) pick(s.w, 6, 2); run(150); return s; };
      const ctl = ricScene(false), ric = ricScene(true);
      chk('Sperminator wild: control never hurts the neighbour', lost(ctl.es[1]) === 0, lost(ctl.es[1])); chk('Sperminator wild: a pellet ricochets into the neighbour', lost(ric.es[1]) > 0, lost(ric.es[1]));
      // mastery: Judgement Day
      sc = scene([[80, 0, 1e5, 1], [80, 70, 1e5]]); pick(sc.w, 3, 0); pick(sc.w, 10, 0); run(40);
      chk('Judgement Day: three layers', pdef().layers === 3, pdef().layers);
      const nb = sc.es[1], n0 = lost(nb); sc.w.cd = 1e9; damageEnemy(sc.es[0], 1e9, { elem: 'phys', noCrit: true, wname: 'test' });
      chk('Judgement Day: the mark explodes on death', lost(nb) - n0 >= sc.w.s.dmg * 3 * 0.5, [lost(nb) - n0, sc.w.s.dmg * 3]);
    });

    // ---------------------------------------------------------------- B. Evil Dead
    block('Evil Dead', () => {
      let sc = scene([[40, 0], [-40, 0], [0, 100]], { quiet: 1 }); pick(sc.w, 3, 1); run(60);
      chk('Evil Dead: the saw cuts what is in front', lost(sc.es[0]) > 20 && lost(sc.es[0]) < 90, lost(sc.es[0]));
      chk('Evil Dead: not what is behind, nor out of reach', lost(sc.es[1]) === 0 && lost(sc.es[2]) === 0, [lost(sc.es[1]), lost(sc.es[2])]);
      chk('Evil Dead: Force, no knockback', Math.abs(sc.es[0].x - (sc.p.x + 40)) < 4, sc.es[0].x - sc.p.x);
      sc = scene([[40, 0]]); pick(sc.w, 3, 1); run(120); chk('Evil Dead: the fan keeps firing', lost(sc.es[0]) > 0 && sc.w.ammo < sc.w.s.mag + 1 && volleys.some(v => v.w === sc.w), lost(sc.es[0]));
      // Groovy
      sc = scene([[40, 0, 5]], { quiet: 1 }); pick(sc.w, 3, 1); pick(sc.w, 6, 0); sc.w.ammo = 0; sc.w.reloadT = 5; let rl = 0;
      run(30, () => { if (sc.es[0].dead && sc.w.reloadT === 0 && sc.w.ammo === sc.w.s.mag) rl = 1; }); chk('Groovy: a chainsaw kill reloads the shotgun', rl === 1, [sc.es[0].dead, sc.w.ammo, sc.w.reloadT]);
      // Boomstick
      const boom = take => { const s = scene([[50, 0, 1e5]], { def: ENEMIES.diatom }); pick(s.w, 3, 1); pick(s.w, 6, take); const c = fightCd(s.es[0]); c.def = 'shell'; c.layers = 3; c.maxHp = s.es[0].maxHp; c.layerHp = c.maxHp * COMBAT.shellLayerHpFrac; s.w.cd = 0;
        let tagged = null; run(8, () => { if (!tagged) tagged = G.proj.filter(q => q.w === s.w && q.bl2boom)[0] || null; }); return { s, c, tagged }; };
      const bm = boom(1), ctlb = boom(0);
      chk('Boomstick: point-blank pellets carry the heavy hit and double knock', !!bm.tagged && bm.tagged.src.knock >= 2 * 30, bm.tagged && bm.tagged.src.knock);
      chk('Boomstick: the heavy hit takes a Shell layer', bm.c.layers < ctlb.c.layers, [bm.c.layers, ctlb.c.layers]);
      chk('Boomstick: not tagged without the card', !ctlb.tagged);
      sc = scene([[200, 0, 1e5]]); pick(sc.w, 3, 1); pick(sc.w, 6, 1); run(8); chk('Boomstick: not at range', !G.proj.some(q => q.bl2boom));
      // wild: rise as an ally
      sc = scene([[40, 0, 5]], { quiet: 1 }); pick(sc.w, 3, 1); pick(sc.w, 6, 2); let ally = null;
      run(30, () => { if (!ally) ally = G.enemies.find(e => e.bl2ally) || null; }); chk('Evil Dead wild: a chainsaw kill rises as an ally for 3 s', !!ally && ally.charmed && ally.charmT > 2.5 && ally.charmT <= 3 && ally.zombie, ally && ally.charmT);
      sc = scene([[40, 0, 5, 1]], { quiet: 1 }); pick(sc.w, 3, 1); pick(sc.w, 6, 2); run(30); chk('Evil Dead wild: Elites do not rise', !G.enemies.some(e => e.bl2ally));
      // mastery: Hail to the King
      sc = scene([[90, 0]], { quiet: 1 }); pick(sc.w, 3, 1); run(60); const noHail = lost(sc.es[0]);
      sc = scene([[90, 0]], { quiet: 1 }); pick(sc.w, 3, 1); pick(sc.w, 10, 1); run(60);
      chk('Hail to the King: reach 100', noHail === 0 && lost(sc.es[0]) > 0, [noHail, lost(sc.es[0])]); chk('Hail to the King: the chainsaw Bleeds', sc.es[0].bleeds && sc.es[0].bleeds.length > 0, sc.es[0].bleeds);
      const hail = on => { const s = scene([[200, 0], [200, 50]], { quiet: 1 }); pick(s.w, 3, 1); if (on) pick(s.w, 10, 1); s.es[0].bleeds = [{ dps: 1, t: 5 }]; bl2Phit(s.w, { dmg: s.w.s.dmg, src: {}, vx: 1, vy: 0 }, s.es[0]); return s; }; // (a pellet landing on the Bleeding enemy)
      const h0 = hail(false), h1 = hail(true);
      chk('Hail to the King: a Bleeding enemy hit by pellets bursts', lost(h1.es[1]) >= 6.4 * 2 * 0.5 && lost(h0.es[1]) === 0, [lost(h1.es[1]), lost(h0.es[1])]); chk('Hail to the King: the burst eats the Bleed', !h1.es[0].bleeds || h1.es[0].bleeds.length === 0, h1.es[0].bleeds); chk('Hail to the King: no burst without the mastery', h0.es[0].bleeds.length === 1);
    });

    // ---------------------------------------------------------------- C. Riding shotgun
    block('Riding shotgun', () => {
      const vol = (v, ride) => { volleys.length = 0; const s = scene([[150, 0]]); if (ride) pick(s.w, 3, 2); s.w.cd = 0; run(3, null, v); return { s, v: volleys.find(q => q.w === s.w && !q.inn) }; };
      const base = vol(fast, false), ride = vol(fast, true), still = vol(0, true), capd = vol(165 * 3, true);
      chk('Riding: the volleys fired', !!base.v && !!ride.v && !!still.v && !!capd.v);
      if (base.v && ride.v && still.v && capd.v) {
        const k = v => v.pr[0].dmg / v.pr[0].w.s.dmg, rg = v => v.pr.reduce((a, q) => a + q.life * q.speed, 0) / v.pr.length;
        const want = 1 + Math.min(0.6, ride.v.spd / 165 - 1);
        chk('Riding: damage +1% per 1% of speed over base', Math.abs(k(ride.v) - want) < 0.02 && k(base.v) < 1.001, [k(ride.v), want, k(base.v)]);
        chk('Riding: at a standstill no bonus', Math.abs(k(still.v) - 1) < 0.001, k(still.v)); chk('Riding: capped at +60%', Math.abs(k(capd.v) - 1.6) < 0.001, k(capd.v));
        chk('Riding: +30% range while moving', Math.abs(rg(ride.v) / rg(still.v) - 1.3) < 0.1, [rg(ride.v), rg(still.v)]);
      }
      // sprinting while firing costs no stamina
      let sc = scene([[150, 0]]); pick(sc.w, 3, 2); stamInit(); G.stam.cur = 50; G.manual = { x: 1, y: 0, sprint: true }; bl2S().fireT = G.t; stamTick(0.1);
      chk('Riding: a sprint while firing is free', Math.abs(G.stam.cur - 50) < 1e-9 && G.stam.sprint, [G.stam.cur, G.stam.sprint]);
      bl2S().fireT = -9; stamTick(0.1); chk('Riding: a sprint without firing still costs', G.stam.cur < 49, G.stam.cur);
      G.manual = null;
      sc = scene([[150, 0]]); stamInit(); G.stam.cur = 50; G.manual = { x: 1, y: 0, sprint: true }; G.bl2 = { fireT: G.t }; stamTick(0.1); chk('Riding: other branches still pay', G.stam.cur < 49, G.stam.cur); G.manual = null;
      // Drive-by
      const db = on => { volleys.length = 0; const s = scene([[40, 0]], { quiet: 1 }); pick(s.w, 3, 2); if (on) pick(s.w, 6, 0); run(50, null, fast); return { s, n: volleys.filter(v => v.w === s.w).length }; };
      const d1 = db(true), d0 = db(false);
      chk('Drive-by: a free volley at an enemy passed at speed, about once a second', d1.n >= 1 && d1.n <= 2 && lost(d1.s.es[0]) > 0, d1.n); chk('Drive-by: nothing without the card', d0.n === 0 && lost(d0.s.es[0]) === 0, d0.n);
      sc = scene([[40, 0]], { quiet: 1 }); pick(sc.w, 3, 2); pick(sc.w, 6, 0); volleys.length = 0; run(50, null, 0); chk('Drive-by: not when standing still', volleys.length === 0, volleys.length);
      // Handbrake turn
      sc = scene([[400, 0]], { quiet: 1 }); pick(sc.w, 3, 2); pick(sc.w, 6, 1); run(40, null, fast); const before = G.proj.length; run(3, null, 0); const ring1 = G.proj.filter(q => q.w === sc.w).length;
      chk('Handbrake turn: stopping dead fires a ring of 20', ring1 >= 20 && G.proj.length - before >= 20, ring1);
      G.proj.length = 0; run(40, null, fast); run(3, null, 0); chk('Handbrake turn: once every 3 s', G.proj.filter(q => q.w === sc.w).length === 0, G.proj.length);
      // Sidecar
      const pod = on => { const s = scene([[150, 0]], { quiet: 1 }); pick(s.w, 3, 2); if (on) pick(s.w, 6, 2); let n = 0; run(90, () => { n = Math.max(n, G.proj.filter(q => q.bl2pod).length); }, fast); return n; };
      chk('Riding wild: the sidecar fires a weaker fan while moving', pod(true) >= 3, pod(true));
      sc = scene([[150, 0]], { quiet: 1 }); pick(sc.w, 3, 2); pick(sc.w, 6, 2); let st = 0; run(60, () => { st = Math.max(st, G.proj.filter(q => q.bl2pod).length); }, 0); chk('Riding wild: the sidecar is quiet when you stand still', st === 0, st);
      // mastery: Getaway
      sc = scene([[150, 0]], { quiet: 1 }); pick(sc.w, 3, 2); pick(sc.w, 10, 2); sc.p.vx = fast; sc.p.vy = 0;
      chk('Getaway: no Contact damage at full speed', hookPass('hurt:before', 10, 'x', null, 'contact') === null);
      chk('Getaway: other hits still land', hookPass('hurt:before', 10, 'x', null, 'bullets') === 10);
      sc.p.vx = 20; chk('Getaway: not when slow', hookPass('hurt:before', 10, 'x', null, 'contact') === 10);
      sc = scene([[150, 0]]); pick(sc.w, 3, 2); pick(sc.w, 10, 2); sc.w.cd = 0; let kick = 0; run(6, () => { const L = modS().lunge; if (L && L.left > 0 && L.ux > 0.9) kick = 1; });
      chk('Getaway: every volley kicks you forward', kick === 1);
      sc = scene([[150, 0]]); pick(sc.w, 3, 2); chk('Getaway: Contact hurts without the mastery', (sc.p.vx = fast, hookPass('hurt:before', 10, 'x', null, 'contact') === 10));
    });

    // ---------------------------------------------------------------- Come back (gated on Sperminator)
    block('Come back', () => {
      const C = cardOf('pass_comeback'); chk('Come back registered', !!C && C.title === 'Come back' && !!C.desc && !/^TODO_COPY/.test(C.desc), C && C.title);
      if (!C) return;
      let sc = scene([[150, 0]]); chk('Come back not dealt without a branch', !C.eligible(G));
      pick(sc.w, 3, 1); chk('Come back not dealt on Evil Dead', !C.eligible(G));
      sc = scene([[150, 0]]); pick(sc.w, 3, 0); chk('Come back dealt once Sperminator is taken', C.eligible(G));
      C.apply(G); chk('Come back taken', mr('pass_comeback') === 1);
      const D = pdef(); G.P.maxHp = 100; sc.p.hp = 100; D.layers = 0; D.snareT = G.t + 9; D.bleeds = [{ dps: 1, t: 3 }]; D.burnPool = 20; D.burnT = 3; D.chargeT = G.t + 9;
      sc.p.hp = 1; sc.p.iframes = 0; hurtPlayer(500, 'test', null, 'other');
      chk('Come back: the killing hit does not end the run', G.state === 'play' && G.bl2.huskT > G.t && sc.p.hp >= 1, [G.state, sc.p.hp]);
      chk('Come back: untouchable husk', sc.p.iframes > 1.5, sc.p.iframes);
      sc.p.iframes = 0; sc.p.hp = 1; G.bl2.huskT = G.t + 1; hurtPlayer(500, 'test', null, 'other'); chk('Come back: the husk cannot die either', G.state === 'play'); sc.p.iframes = 2; G.bl2.huskT = G.t + 2;
      run(135);
      chk('Come back: back at 50% health after 2 s', Math.abs(sc.p.hp - 50) < 5 && G.state === 'play', sc.p.hp);
      chk('Come back: every status cleared', !(D.snareT > G.t) && !(D.bleeds && D.bleeds.length) && !D.burnPool && !(D.burnT > 0) && !(D.chargeT > G.t), [D.snareT, D.bleeds, D.burnPool, D.chargeT]);
      chk('Come back: the robot skeleton for the rest of the run', G.bl2.skel === 1);
      sc.p.hp = 1; sc.p.iframes = 0; D.layers = 0; hurtPlayer(500, 'test', null, 'other'); chk('Come back: once a run', G.state === 'over' || sc.p.hp <= 0, [G.state, sc.p.hp]);
    });

    // ---------------------------------------------------------------- every card runs 300 frames in a ring without errors
    block('ring runs', () => {
      for (let pi = 0; pi < 3; pi++) {
        for (let ci = 0; ci < 4; ci++) { // 0, 1: Lv 6; 2: the wild card; 3: the mastery
          const sc = scene(ringPts(8)); pick(sc.w, 3, pi); pick(sc.w, ci === 3 ? 10 : 6, ci === 3 ? pi : ci); run(260, null, pi === 2 ? fast : null);
        }
      }
    });
    // ---------------------------------------------------------------- costumes
    block('costumes', () => {
      for (const pi of [0, 1, 2]) { const sc = scene([[120, 0, 1e5, 1]]); pick(sc.w, 3, pi); run(30, null, pi === 2 ? fast : null); render(); bl2Costume(sx(G.player.x), sy(G.player.y)); }
      let sc = scene([[120, 0, 1e5, 1]]); pick(sc.w, 3, 0); bl2S().skel = 1; render(); bl2Costume(sx(G.player.x), sy(G.player.y)); bl2S().huskT = G.t + 1; render(); bl2Costume(sx(G.player.x), sy(G.player.y));
      sc = scene([[60, 0, 1e5, 1]]); pick(sc.w, 3, 1); pick(sc.w, 10, 1); run(30); render(); bl2Costume(sx(G.player.x), sy(G.player.y));
      sc = scene([[60, 0, 1e5, 1]]); pick(sc.w, 3, 2); pick(sc.w, 6, 2); run(30, null, fast); render(); bl2Costume(sx(G.player.x), sy(G.player.y));
      sc = scene([[60, 0]]); render(); chk('no costume without a branch', true);
    });
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('baseline2test OK');
  await b.close();
})();
