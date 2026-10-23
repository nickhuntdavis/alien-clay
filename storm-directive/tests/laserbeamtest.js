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
      w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0.5; const A2 = foe(150, 0), B = foe(s2.x1 + Math.cos(want) * 90 - p().x, s2.y1 + Math.sin(want) * 90 - p().y); fire(w, A2, 0);
      out.bounceHit = hurt(B); if (!(hurt(B) > 0)) bad.push('the bounce missed the enemy on its line');
    }
    // 2a. Each bounce keeps less at Rank 1 than at Rank 3 (damage and brightness follow k)
    const keepAt = r => { const ww = fresh(); for (let i = 0; i < r; i++) modAdd(ww, 'ricochet'); computeStats(ww); p().hd = 0.5; const e = foe(150, 0); fire(ww, e, 0); const q = segs(); return q[1] ? +(q[1].k / q[0].k).toFixed(2) : null; };
    out.keep = [keepAt(1), keepAt(3)]; if (!(out.keep[0] < 0.4 && out.keep[1] > 0.6)) bad.push('bounce keep ' + out.keep);
    // 2b. Exactly in line with the head: no bounce; a little off: a bounce
    w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0; const H = foe(150, 0); fire(w, H, 0); const inLine = segs().length;
    w = fresh(); modAdd(w, 'ricochet'); computeStats(w); p().hd = 0.15; const H2 = foe(150, 0); fire(w, H2, 0);
    out.inLine = [inLine, segs().length]; if (inLine !== 1 || segs().length < 2) bad.push('in line ' + out.inLine);
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
    // 9. Growing: a beam held 3 s is wider and catches an enemy just off its line
    w = fresh(); for (let i = 0; i < 3; i++) modAdd(w, 'growing'); computeStats(w); const off = foe(150, 0); off.y = p().y + off.r + 6;
    fire(w, off, 0); const fresh0 = hurt(off); w.lzHeldS = G.t - 3.1; fire(w, off, 0);
    out.grow = [+lzGrow(w).toFixed(2), fresh0, hurt(off)]; if (!(lzGrow(w) > 1.9) || fresh0 > 0 || !(hurt(off) > 0)) bad.push('Laser growing ' + out.grow);
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
