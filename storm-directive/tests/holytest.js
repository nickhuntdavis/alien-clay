// Holy/Damned (holy.js): a Holy source fills the soul bar to Possessed, a Damned source to Damned (+30% damage taken,
// spreads Damned bar to mates on death); mixed sources flip on the shared clock; the bias cards move the chance;
// shots and bars take the polarity's colour; reactions fire on a Damned enemy too.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 });
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; G.muts = {}; };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + (dx || 90), p.y + (dy || 0)); e.hp = e.maxHp = 1000; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const hit = (e, amt, pol, extra) => damageEnemy(e, amt, Object.assign({ elem: 'soul', atk: 'proj', noCrit: true, wname: 'test', pol }, extra));
    // 1. Holy verdict: Possessed
    fresh(); let e = foe();
    for (let i = 0; i < 8 && !e.charmed; i++) hit(e, 100, 1);
    out.holy = { charmed: !!e.charmed, possess: G.fst.possess };
    if (!e.charmed || e.damnT > G.t) bad.push('Holy did not Possess: ' + JSON.stringify(out.holy));
    // 2. Damned verdict: +30% damage, not Possessed, reactions treat it as Possessed
    fresh(); e = foe();
    for (let i = 0; i < 8 && !(e.damnT > G.t); i++) hit(e, 100, -1);
    out.damned = { damnT: +(e.damnT - G.t).toFixed(2), charmed: !!e.charmed };
    if (!(e.damnT > G.t) || e.charmed) bad.push('Damned did not land: ' + JSON.stringify(out.damned));
    { const h0 = e.hp; damageEnemy(e, 100, { elem: 'phys', atk: 'proj', noCrit: true, wname: 'test', noRx: true }); out.amp = +(h0 - e.hp).toFixed(1);
      if (Math.abs(out.amp - 130) > 1) bad.push('Damned amp not +30%: ' + out.amp); }
    if (!f_possessed(e)) bad.push('f_possessed false on a Damned enemy');
    { e.hp = 5000; e.maxHp = 5000; damageEnemy(e, 100, { elem: 'fire', atk: 'proj', noCrit: true, wname: 'test' }); if (!G.fst.rx.erosion) bad.push('Erosion did not arm on a Damned enemy'); }
    // 3. Spread on death
    fresh(); e = foe(); const m1 = foe(150), m2 = foe(90, 60), far = foe(400);
    for (let i = 0; i < 8 && !(e.damnT > G.t); i++) hit(e, 100, -1);
    killEnemy(e, { elem: 'phys', wname: 'test' });
    out.spread = [m1.cd && +m1.cd.bars.soul.toFixed(2), m2.cd && +m2.cd.bars.soul.toFixed(2), far.cd ? +far.cd.bars.soul.toFixed(2) : 0, m1.cd && m1.cd.polSum];
    if (!(m1.cd && m1.cd.bars.soul >= 0.3 && m1.cd.polSum < 0) || !(m2.cd && m2.cd.bars.soul >= 0.3)) bad.push('Damned death did not spread: ' + JSON.stringify(out.spread));
    if (far.cd && far.cd.bars.soul > 0) bad.push('spread reached a far enemy');
    // 4. Polarity by source: fixed weapons and the clock for mixed ones; bias cards
    fresh();
    const w = { id: 's_toothfairy', def: { elem: 'soul' } }, d = { id: 'v_soul_proj', def: { elem: 'soul' } }, mix = { id: 'nothing', def: { elem: 'soul' } };
    out.pol = [holyPolW(w), holyPolW(d)];
    if (holyPolW(w) !== 1 || holyPolW(d) !== -1) bad.push('fixed polarities: ' + out.pol);
    G.t = HOLY.cycle * 20; const a0 = holyPolW(mix); G.t = HOLY.cycle * 20.5 + 0.1; const a1 = holyPolW(mix);
    if (a0 !== 1 || a1 !== -1) bad.push('mixed source does not flip on the clock: ' + [a0, a1]);
    G.muts = { h_devout: 2 }; G.t = HOLY.cycle * 20.5 + 0.1; if (holyPolW(mix) !== 1 || holyPolW(d) !== -1 && holyP(d) !== 0.5) bad.push('devout bias');
    G.muts = { h_heretic: 2 }; G.t = HOLY.cycle * 20; if (holyPolW(mix) !== -1 || holyPolW(w) !== 1 && holyP(w) !== 0.5) bad.push('heretic bias');
    G.muts = {};
    if (!MUT_REG.some(c => c.id === 'h_devout') || !MUT_REG.some(c => c.id === 'h_heretic')) bad.push('bias cards not registered');
    // 5. A Damned bar draws dark; shots fired by a Damned weapon carry pol and colour
    fresh(); e = foe(); hit(e, 50, -1);
    if (holyBarCol(e.cd) !== HOLY.damned.glow) bad.push('Damned bar colour');
    hit(e, 200, 1); if (holyBarCol(e.cd) !== HOLY.holy.glow) bad.push('bar colour did not swing Holy');
    { G.weapons = [makeSlot('v_soul_proj', false, 1), null, null, null]; recomputeAll(); const ww = G.weapons[0], n0 = G.proj.length; fireWeapon(ww, e);
      const shots = G.proj.slice(n0).filter(p => p.src && p.src.w === ww); out.shots = shots.length;
      if (!shots.length) bad.push('Rent Free fired no projectile'); else if (shots.some(p => p.pol !== -1 || p.color !== HOLY.damned.glow)) bad.push('Rent Free shots not Damned'); }
    // 6. Prawn Again's stance: Damned half deals and takes 10% more and refunds stamina on Damned deaths; Holy half heals on a Possession
    fresh(); G.s10 = { id: 'prawn', run: 1, shiftT: 12, shiftI: 0 }; G.weapons = [makeSlot('s_toothfairy', false, 1), null, null, null]; recomputeAll(); stamInit();
    G.prawnD = { on: true, flipT: -9 }; if (holyStance() !== -1) bad.push('Prawn Again not in its Damned half: ' + holyStance());
    { e = foe(); const h0 = e.hp; damageEnemy(e, 100, { elem: 'phys', atk: 'proj', noCrit: true, wname: 'test', noRx: true, w: G.weapons[0] }); out.stanceDealt = +(h0 - e.hp).toFixed(1);
      if (Math.abs(out.stanceDealt - 110) > 1) bad.push('Damned half dealt: ' + out.stanceDealt); }
    { const take = () => { G.player.iframes = 0; pdef().mem.mem = 0; const hp0 = G.player.hp; hurtPlayer(100, 'test', null, 'test'); return hp0 - G.player.hp; };
      const dm = take(); G.prawnD = { on: false, flipT: -9 }; const hy = take(); G.prawnD = { on: true, flipT: -9 }; out.stanceTaken = [+dm.toFixed(1), +hy.toFixed(1)];
      if (!(hy > 0) || Math.abs(dm / hy - 1.1) > 0.02) bad.push('Damned half taken: ' + out.stanceTaken); }
    { const d2 = foe(150); for (let i = 0; i < 8 && !(d2.damnT > G.t); i++) hit(d2, 100, -1); G.stam.cur = 5; killEnemy(d2, { elem: 'phys', wname: 'test' }); out.stam = G.stam.cur;
      if (!(G.stam.cur >= 5 + HOLY.stance.stam - 0.01)) bad.push('Damned death did not refund stamina: ' + G.stam.cur); }
    G.prawnD = { on: false, flipT: -9 }; if (holyStance() !== 1) bad.push('Prawn Again not in its Holy half');
    { e = foe(-120); G.player.hp = G.P.maxHp * 0.5; const hp0 = G.player.hp; for (let i = 0; i < 8 && !e.charmed; i++) hit(e, 100, 1); if (!(G.player.hp > hp0)) bad.push('Holy half Possession did not heal'); }
    { G.holySt = null; const fl = HOOKS.tick.find(h => h.name === 'holy:flip').fn; G.prawnD = { on: false, flipT: -9 }; fl(0.016); G.prawnD = { on: true, flipT: -9 }; try { fl(0.016); } catch (x) { bad.push('flip threw: ' + x.message); } if (!(G.holySt && G.holySt.last === -1 && G.holySt.said[-1])) bad.push('flip did not announce'); }
    // 6b. The stance follows the intensity meter (prawndamned.js): Damned at 0.8, Holy again once it eases off; its own meter where pacing.js has none
    { const pt = HOOKS.tick.find(h => h.name === 'prawnd:tick').fn; G.prawnD = null; G.state = 'play';
      const S = prawnMeter(); S.meter = 0.7; S.st = 'build'; pt(0.016); const a = prawnPol(); S.meter = 0.85; pt(0.016); const b = prawnPol();
      S.st = 'relax'; S.meter = 0.6; pt(0.016); const c = prawnPol(); S.meter = 0.45; pt(0.016); const d = prawnPol();
      out.meterFlip = [a, b, c, d]; if (a !== 1 || b !== -1 || c !== -1 || d !== 1) bad.push('meter stance: ' + out.meterFlip);
      G.wave = { n: 1 }; G.prawnD = null; G.prawnPace = { meter: 0.81, st: 'build', stT: 0 }; pt(0.016); out.ownMeter = [prawnOwnMeter(), prawnPol()]; G.wave = null;
      if (!out.ownMeter[0] || out.ownMeter[1] !== -1) bad.push('own meter in wave mode: ' + out.ownMeter); }
    G.s10 = null;
    // 7. The type is shown as the pair, no stray Parasite in live type tables
    if (ELEMENTS.soul.name !== 'Holy/Damned') bad.push('type name: ' + ELEMENTS.soul.name);
    if (RW_TYPE_NAME.soul !== 'Holy/Damned' || CDX10_TYPES.soul.st.indexOf('Holy/Damned') < 0) bad.push('type tables still say Parasite');
    return { bad, out };
  });
  await b.close();
  console.log(JSON.stringify(r.out));
  if (errors.length || r.bad.length) { console.log('FAIL holytest', JSON.stringify(r.bad), 'ERRORS', JSON.stringify(errors)); process.exit(1); }
  console.log('PASS holytest');
})();
