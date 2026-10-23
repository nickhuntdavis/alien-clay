// The Laser fires like a laser (laserbeam.js): stops at the first enemy; Bounce reflects at the true angle off the enemy's
// surface; Piercing carries on through; both together split the beam; Internal Ricochet keeps it inside the bubble while
// the membrane is up; its damage ramps up while it stays on one target, faster and higher with Focused Intensity.
// Screenshot: out/laserbeam.png (pierce + bounce through a crowd, drawn as the held beam).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0;
      if (G.terrain && G.terrain.list) G.terrain.list.length = 0; /* (no random rocks in the way) */ G.weapons = [makeSlot('v_flame_beam', false, 9), null, null]; computeStats(G.weapons[0]); G.v10fx = []; return G.weapons[0];
    };
    const p = () => G.player;
    const foe = (dx, dy) => { const e = makeEnemy(ENEMIES.brute, p().x + dx, p().y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e6; G.enemies.push(e); return e; };
    const hurt = e => Math.round(e.maxHp - e.hp);
    const fire = (w, t, a) => { w.lzA = a; w.lzFireT = G.t; v10Fire(w, t, weaponSrc(w)); }; // (a held beam keeps its aim)
    const segs = () => G.weapons[0].lzShotSegs || [];
    const run1 = () => { for (let f = 0; f < 20; f++) { G.state = 'play'; update(1 / 60); } };
    out.name = MODS10.ricochet.name; if (out.name !== 'Bounce') bad.push('name ' + out.name);
    // 1. No pierce by default: the enemy behind is safe
    let w = fresh(); let a1 = foe(120, 0), a2 = foe(220, 0); fire(w, a1, 0);
    out.stop = [hurt(a1) > 0, hurt(a2)]; if (!(hurt(a1) > 0) || hurt(a2) > 0) bad.push('the laser pierced by default ' + out.stop);
    // 2. Bounce: the angle comes from the sperm head against the beam's line; a hit always reflects unless exactly in line
    w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0.5; const A = foe(150, 0); fire(w, A, 0);
    const want = lzBounceDir(1, 0, angDiff(0.5, 0)), s2 = segs()[1];
    if (!s2) bad.push('no bounce with the head turned');
    else {
      const got = Math.atan2(s2.y2 - s2.y1, s2.x2 - s2.x1), err = Math.abs(angDiff(got, want)); out.bounceErr = +err.toFixed(3);
      if (err > 0.01) bad.push('bounce angle off by ' + err);
      w = fresh(); modAdd(w, 'ricochet'); computeStats(w); w.s.dmg = 2000; /* (big, so a weakened bounce still shows) */ p().hd = 0.5; const A2 = foe(150, 0), B = foe(s2.x1 + Math.cos(want) * 90 - p().x, s2.y1 + Math.sin(want) * 90 - p().y); fire(w, A2, 0);
      out.bounceHit = hurt(B); if (!(hurt(B) > 0)) bad.push('the bounce missed the enemy on its line');
    }
    // 2a. Each bounce keeps less at Rank 1 than at Rank 3 (damage and brightness follow k)
    const keepAt = r => { const ww = fresh(); for (let i = 0; i < r; i++) modAdd(ww, 'ricochet'); computeStats(ww); p().hd = 0.5; const e = foe(150, 0); fire(ww, e, 0); const q = segs(); return q[1] ? +(q[1].k / q[0].k).toFixed(2) : null; };
    out.keep = [keepAt(1), keepAt(3)]; if (!(out.keep[0] < 0.4 && out.keep[1] > 0.6)) bad.push('bounce keep ' + out.keep);
    // 2b. Exactly in line with the head: no bounce; a little off: a bounce
    w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0; const H = foe(150, 0); fire(w, H, 0); const inLine = segs().length;
    w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0.15; const H2 = foe(150, 0); fire(w, H2, 0);
    out.inLine = [inLine, segs().length]; if (inLine !== 1 || segs().length < 2) bad.push('in line ' + out.inLine);
    // 3a. Piercing on a target near the edge of reach: a sliver still shows past it
    w = fresh(); modAdd(w, 'piercing'); computeStats(w); const edge = foe(w.s.range - 20, 0); fire(w, edge, 0);
    const past = segs().filter(q => q.x1 > edge.x); out.pierceEdge = past.map(q => [Math.round(q.x2 - q.x1), +q.k.toFixed(2)]);
    if (!past.length || !(past[0].x2 - past[0].x1 > 100) || !(past[0].k < 0.4)) bad.push('pierce past an edge target ' + JSON.stringify(out.pierceEdge));
    // 3. Piercing + Bounce: through and off, both weaker
    w = fresh(); modAdd(w, 'piercing'); computeStats(w); let c1 = foe(120, 6), c2 = foe(220, 6); fire(w, c1, 0); const solo = hurt(c2);
    w = fresh(); SET.noLimits = true; modAdd(w, 'piercing'); modAdd(w, 'ricochet'); SET.noLimits = false; computeStats(w); c1 = foe(120, 6); c2 = foe(220, 6); G.v10fx = []; fire(w, c1, 0);
    out.split = [solo, hurt(c2), segs().length]; if (!(solo > 0) || !(hurt(c2) > 0) || !(hurt(c2) < solo) || segs().length < 3) bad.push('pierce + bounce ' + out.split);
    // 4. Internal Ricochet: membrane up, the beam stays in the bubble; down, it leaves
    w = fresh(); CARDS.find(c => c.id === 'sp_iric') && (G.muts = Object.assign(G.muts || {}, { sp_iric: 1 })); pdefCard('latex').apply(); G.pd.mem.mem = G.pd.mem.memMax = 100;
    const far = foe(200, 0); G.v10fx = []; fire(w, far, 0.3); const R = pdefBubbleR();
    const outside = segs().filter(f => Math.hypot(f.x2 - p().x, f.y2 - p().y) > R + 1).length;
    out.iric = [Math.round(R), segs().length, outside, hurt(far)]; if (!(R > 0) || segs().length < 6 || outside || hurt(far) > 0) bad.push('internal ricochet ' + out.iric);
    G.pd.mem.mem = 0; G.v10fx = []; fire(w, far, 0); out.iricDown = hurt(far); if (!(hurt(far) > 0)) bad.push('membrane down: the beam stayed in');
    // 5. Ramp: weak at first, stronger after a while on one target; Focused Intensity ramps faster and higher
    const ramp = focus => { const ww = fresh(); if (focus) { for (let i = 0; i < 3; i++) modAdd(ww, 'focus'); computeStats(ww); } const e = foe(150, 0); const k = []; for (let i = 0; i <= 12; i++) { const h = e.hp; fire(ww, e, 0); k.push(Math.round(h - e.hp)); G.t += 0.25; } return k; };
    const k0 = ramp(false), k1 = ramp(true);
    out.ramp = [k0[0], k0[6], k0[12], k1[0], k1[6], k1[12]];
    if (!(k0[12] > k0[0] * 2)) bad.push('no ramp ' + k0);
    if (!(k1[6] > k0[6] && k1[12] > k0[12])) bad.push('focus did not speed or raise the ramp ' + out.ramp);
    // 6. Orbiting: a traced ring; an enemy on it breaks it; Piercing carries on round; no orbiting bodies
    const ringLen = () => segs().slice(1).reduce((t, q) => t + Math.hypot(q.x2 - q.x1, q.y2 - q.y1), 0);
    w = fresh(); modAdd(w, 'orbiting'); computeStats(w); const t0 = foe(250, 0); fire(w, t0, 0); const full = ringLen();
    w = fresh(); modAdd(w, 'orbiting'); computeStats(w); const t1 = foe(250, 0), blk = foe(0, -72); fire(w, t1, 0); const broken = ringLen();
    w = fresh(); SET.noLimits = true; modAdd(w, 'orbiting'); modAdd(w, 'piercing'); SET.noLimits = false; computeStats(w); const t2 = foe(250, 0), blk2 = foe(0, -72); fire(w, t2, 0); const pierced = ringLen();
    out.orbit = [Math.round(full), Math.round(broken), Math.round(pierced), hurt(blk) > 0, hurt(t1)];
    if (!(full > 400) || !(broken < full * 0.95) || !(pierced > broken) || !(hurt(blk) > 0) || hurt(t1) > 0) bad.push('orbit ring ' + out.orbit);
    run1(); if ((modS().pets || []).length || G.weapons[0].orbs) bad.push('orbiting bodies spawned for the Laser');
    // 7. A solid obstacle stops the beam (and reflects it with Bounce)
    w = fresh(); G.terrain = G.terrain || { list: [], grid: new Map() }; G.terrain.list.push({ type: 'rock', def: { solid: true }, x: p().x + 80, y: p().y, r: 20 }); const behind = foe(200, 0); fire(w, behind, 0);
    out.rock = hurt(behind); if (hurt(behind) > 0) bad.push('the beam went through a solid obstacle');
    G.terrain.list.length = 0;
    // 8. Sweep: the beam swings either side of its target
    w = fresh(); for (let i = 0; i < 3; i++) modAdd(w, 'sweep'); computeStats(w); const sw = foe(200, 0); const angs = [];
    for (let i = 0; i < 40; i++) { G.t += 0.05; fire(w, sw, 0); const q = segs()[0]; angs.push(Math.atan2(q.y2 - q.y1, q.x2 - q.x1)); }
    out.sweep = +(Math.max(...angs) - Math.min(...angs)).toFixed(2); if (!(out.sweep > 1.2)) bad.push('Laser sweep ' + out.sweep);
    // 9. (Growing is not offered on the Laser any more: see 11.)
    // 10. Charge: a beam starting from off charges first (no damage, a glow), then fires
    w = fresh(); const ch = foe(150, 0); w.lzFireT = -9; v10Fire(w, ch, weaponSrc(w)); const during = [hurt(ch), lzCharging(w)];
    for (let i = 0; i < 7; i++) { G.t += 0.1; v10Fire(w, ch, weaponSrc(w)); } // (fire ticks keep the charge going)
    out.charge = [during[0], during[1], hurt(ch) > 0]; if (during[0] > 0 || !during[1] || !(hurt(ch) > 0)) bad.push('charge ' + out.charge);
    // 11. Rapid Fire shortens the charge-up; Growing isn't offered on the Laser
    w = fresh(); const c0 = lzCharge(w); modAdd(w, 'rapid'); modAdd(w, 'rapid'); computeStats(w); const cd0 = w.s.cd;
    out.rapid = [c0, +lzCharge(w).toFixed(2), modOk(w, 'growing')]; if (!(c0 >= 0.6) || !(lzCharge(w) < c0 * 0.6) || modOk(w, 'growing')) bad.push('rapid / growing ' + out.rapid);
    // 12. Overheat: about 4 s of beam fills the bar, the Laser switches off and won't fire until it has cooled
    w = fresh(); const hot = foe(150, 0);
    for (let i = 0; i < 90; i++) { G.t += 0.05; w.lzFireT = G.t; lzHeatTick(w, 0.05); }
    const over = !!w.lzOver, h0 = hurt(hot); w.lzFireT = G.t; v10Fire(w, hot, weaponSrc(w)); const blocked = hurt(hot) === h0;
    for (let i = 0; i < 50; i++) { G.t += 0.05; lzHeatTick(w, 0.05); }
    out.heat = [over, blocked, !!w.lzOver, +(w.lzHeat || 0).toFixed(2)]; if (!over || !blocked || w.lzOver) bad.push('overheat ' + out.heat);
    // 13. Charge-Up: a longer charge, then one big blast (many ticks' worth), heat on you, no held beam
    w = fresh(); const tick = foe(150, 0); fire(w, tick, 0); const one = hurt(tick);
    w = fresh(); for (let i = 0; i < 3; i++) modAdd(w, 'charged'); computeStats(w); const bl = foe(150, 0); w.lzFireT = -9;
    const cl = lzCharge(w); let n = 0; while (!(hurt(bl) > 0) && n < 40) { G.t += 0.1; v10Fire(w, bl, weaponSrc(w)); n++; }
    out.blast = [+cl.toFixed(2), +(n * 0.1).toFixed(1), one, hurt(bl), +(w.lzHeat || 0).toFixed(2), lzOnNow(w)];
    if (!(cl > 0.6 * 1.5) || !(hurt(bl) > one * 10) || !(w.lzHeat >= 0.45) || lzOnNow(w)) bad.push('charge-up blast ' + out.blast);
    // 14. Extra Shots: a spare beam doubles up on the main target (no loss); with other enemies it locks its own after a charge
    window.spawnRandom = () => {};
    const total = (ranks, n) => {
      const ww = fresh(); for (let i = 0; i < ranks; i++) modAdd(ww, 'extra'); computeStats(ww);
      const es = []; for (let i = 0; i < n; i++) es.push(foe(Math.cos(-0.5 + i * 0.5) * 160, Math.sin(-0.5 + i * 0.5) * 160));
      for (let i = 0; i < 30; i++) { G.t += 0.05; ww.lzFireT = G.t; v10Fire(ww, es[0], weaponSrc(ww)); lzTick(0.05); }
      return { hurt: es.map(hurt), beams: lzBeams(ww).length, mainK: +(ww.lzMainK || 0).toFixed(2), heat: +(ww.lzHeat || 0).toFixed(2) };
    };
    const xsolo = total(0, 1), dbl = total(1, 1), multi = total(1, 3);
    out.extra = { solo: xsolo.hurt[0], dbl: [dbl.hurt[0], dbl.beams], multi: [multi.hurt, multi.beams, multi.mainK], heat: [xsolo.heat, dbl.heat] };
    if (dbl.beams !== 2 || Math.abs(dbl.hurt[0] - xsolo.hurt[0]) > xsolo.hurt[0] * 0.15) bad.push('extra beam doubling ' + JSON.stringify(out.extra.dbl) + ' vs ' + xsolo.hurt[0]);
    if (multi.hurt.filter(h => h > 0).length < 2 || multi.mainK > 0.8) bad.push('extra beam own target ' + JSON.stringify(out.extra.multi));
    if (!(dbl.heat > xsolo.heat * 1.2)) bad.push('extra beams heat faster ' + out.extra.heat);
    // 15. The Laser's own Strike from Above, sword, mines, Sticky, Empowered pulse, Rapid Fire branches, retired options
    const runT = t => { const px = p().x, py = p().y; for (let f = 0; f < t * 60; f++) { G.state = 'play'; G.lootQueue = []; p().x = px; p().y = py; update(1 / 60); } };
    w = fresh(); modAdd(w, 'dfa'); computeStats(w); const o1 = foe(160, 0); runT(0.5); const early = hurt(o1); w.lzDfaT = G.t; runT(0.1); const orbN = lzS().orb.length; // (Strike from Above is an extra: the beam keeps firing)
    out.orbital = [early, orbN]; if (!(early > 0) || !orbN) bad.push('orbital strike ' + out.orbital);
    w = fresh(); modAdd(w, 'melee'); computeStats(w); const sNear = foe(70, 0), sFar = foe(0, 200); runT(1.5);
    out.sword = [hurt(sNear), hurt(sFar), !!w.lzSword]; if (!(hurt(sNear) > 0) || hurt(sFar) > 0 || !w.lzSword) bad.push('laser sword ' + out.sword);
    w = fresh(); SET.noLimits = true; modAdd(w, 'mines'); modAdd(w, 'extra'); SET.noLimits = false; computeStats(w); const mTgt = foe(200, 0); runT(1.2);
    const laid = lzS().mines.length; mTgt.x = lzS().mines[0] ? lzS().mines[0].x + 30 : mTgt.x; mTgt.y = lzS().mines[0] ? lzS().mines[0].y : mTgt.y; runT(0.6);
    const fm = lzS().mines.find(m => m.firing); out.mines = [laid, !!fm, fm ? fm.segs.length : 0, hurt(mTgt)];
    if (!laid || !fm || !(fm.segs.length >= 2) || !(hurt(mTgt) > 0)) bad.push('laser mines ' + out.mines);
    w = fresh(); for (let i = 0; i < 3; i++) modAdd(w, 'sticky'); computeStats(w); const st1 = foe(150, 0); const slows = [];
    for (let i = 0; i < 14; i++) { G.t += 0.1; w.lzFireT = G.t; v10Fire(w, st1, weaponSrc(w)); slows.push(+(st1.chillAmt || 0).toFixed(2)); }
    out.sticky = [slows[2], slows[8], st1.snareT > G.t]; if (!(slows[8] > slows[2]) || !(st1.snareT > G.t)) bad.push('laser sticky ' + out.sticky + ' ' + slows);
    w = fresh(); modAdd(w, 'nth'); computeStats(w); w.lzNthS = G.t; out.pulse = [lzPulseOn(w), (G.t += 1, lzPulseOn(w))]; if (!out.pulse[0] || out.pulse[1]) bad.push('empowered pulse ' + out.pulse);
    w = fresh(); modAdd(w, 'rapid'); modAdd(w, 'rapid'); const fq = G.lootQueue.find(q => q.ms); const titles = fq ? genLoot(fq).map(c => c.title) : [];
    out.rapidFork = titles; if (titles.join() !== 'Cooler,Quicker') bad.push('laser rapid fork ' + titles);
    w = fresh(); out.retired = [modOk(w, 'turncoat'), modOk(w, 'growing')]; if (out.retired.some(Boolean)) bad.push('retired modifiers offered on the Laser ' + out.retired);
    w = fresh(); G.lootQueue = []; modAdd(w, 'charged'); modAdd(w, 'charged'); if (G.lootQueue.some(q => q.ms)) bad.push('Charge-Up fork on the Laser');
    // 16. Homing: a bounce curves onto an enemy just off its line
    const homeHit = hr => { const ww = fresh(); SET.noLimits = true; modAdd(ww, 'ricochet'); for (let i = 0; i < hr; i++) modAdd(ww, 'homing'); SET.noLimits = false; computeStats(ww); ww.s.dmg = 2000; p().hd = 0.5;
      const A0 = foe(150, 0); const ra = lzBounceDir(1, 0, angDiff(0.5, 0)) + 0.45; const cxp = A0.x - A0.r, B0 = foe(cxp - p().x + Math.cos(ra) * 160, Math.sin(ra) * 160); fire(ww, A0, 0); return hurt(B0); };
    out.homing = [homeHit(0), homeHit(3)]; if (out.homing[0] > 0 || !(out.homing[1] > 0)) bad.push('laser homing ' + out.homing);
    // 17. Crossfire: the rear beam curves round onto the main target from behind; +30% while both hold it
    w = fresh(); for (let i = 0; i < 4; i++) modAdd(w, 'extra'); w.mmB = { extra: 'A' }; w.mmX = { extra: 'A2' }; computeStats(w); w.s.dmg = 2000; w.s.crit = 0; G.P.crit = 0; const cf = foe(150, 0);
    fire(w, cf, 0); const h1 = hurt(cf); fire(w, cf, 0); const h2 = hurt(cf) - h1; const curved = segs().filter(q => !q.hit).length;
    out.cross = [h1, h2, curved, cf.lzCrossT > G.t]; if (!(cf.lzCrossT > G.t) || !(h2 > h1 * 1.2) || curved < 10) bad.push('crossfire ' + out.cross);
    // for the picture
    w = fresh(); SET.noLimits = true; modAdd(w, 'piercing'); modAdd(w, 'ricochet'); modAdd(w, 'ricochet'); SET.noLimits = false; computeStats(w);
    for (let i = 0; i < 9; i++) foe(100 + (i % 3) * 70, -90 + Math.floor(i / 3) * 80 + (i % 2) * 14);
    G.v10fx = []; fire(w, G.enemies[4], 0.05);
    return { bad, out };
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'laserbeam.png' });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
