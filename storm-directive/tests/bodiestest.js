// Bodies (COMBAT_MATRIX 15.2): wells pull, hold and fling your mines and pools; knockback blasts scatter them.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (wid, mods) => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6;
      G.weapons = [makeSlot(wid || 'v_phys_proj', false, 9), null, null];
      const w = G.weapons[0];
      for (const [id, n] of mods) for (let i = 0; i < n; i++) if (!modAdd(w, id)) w.m10.push(id);
      computeStats(w); G.mwAny = true; return w;
    };
    const tick = t => { for (let f = 0; f < Math.round(t * 60); f++) update(1 / 60); };
    const mine = (w, x, y) => { const q = { w, x, y, t: G.t + 600, armed: G.t + 1e6, src: weaponSrc(w), big: 1, rearm: 0 }; mwS().mines.push(q); return q; };
    const pool = (w, x, y, src) => { const z = { x, y, r: 30, life: 5, max: 5, dps: 0, elem: 'phys', pull: 0, color: '#fff', tick: 0, src: src || weaponSrc(w) }; G.zones.push(z); return z; };
    const cx = 1000, cy = 1000, dist = (o, x, y) => Math.hypot(o.x - x, o.y - y);
    G && 0;
    // (a) pulled within 1 s, held within 2 s
    let w = fresh('v_phys_proj', [['mines', 1]]); G.player.x = 0; G.player.y = 0;
    let q = mine(w, cx + 60, cy), z = pool(w, cx, cy + 60), ez = pool(w, cx - 60, cy, { elem: 'phys', wname: 'Enemy' });
    modWell(cx, cy, 120, 600, 2.5, w, true, true);
    const q0 = dist(q, cx, cy), z0 = dist(z, cx, cy); tick(1);
    const movedQ = q0 - dist(q, cx, cy), movedZ = z0 - dist(z, cx, cy);
    out.pull = Math.round(movedQ); if (!(movedQ > 15)) bad.push('mine pulled ' + movedQ);
    tick(1); out.held = [q.bdHeld, Math.round(dist(q, cx, cy))]; if (!q.bdHeld || dist(q, cx, cy) > 10.5) bad.push('mine held ' + out.held);
    // (c) a pool moves half as far as a mine (mass 0.25 against 0.5)
    out.poolRatio = +(movedZ / movedQ).toFixed(2); if (Math.abs(movedZ / movedQ - 0.5) > 0.1) bad.push('pool ratio ' + out.poolRatio);
    // (d) an enemy zone does not move
    out.enemyZone = [ez.x, ez.y]; if (ez.x !== cx - 60 || ez.y !== cy) bad.push('enemy zone moved ' + out.enemyZone);
    // (b) the well expires: the held mine is flung outward
    const dBefore = dist(q, cx, cy); tick(0.8); // (2.5 s well, 2 s gone)
    tick(0.5);
    out.fling = Math.round(dist(q, cx, cy) - dBefore); if (!(out.fling > 40)) bad.push('fling ' + out.fling);
    if (q.bdHeld) bad.push('still held');
    // (e) a knockback blast pushes a mine outward
    w = fresh('v_phys_proj', [['mines', 1]]); G.player.x = 0; G.player.y = 0;
    q = mine(w, cx + 50, cy); const q1 = dist(q, cx, cy); aoe(cx, cy, 80, 1, Object.assign(weaponSrc(w), { knock: 100 }), '#fff'); tick(0.5);
    out.knock = Math.round(dist(q, cx, cy) - q1); if (!(out.knock > 10)) bad.push('knock ' + out.knock);
    // a non-knockback blast leaves it be
    tick(1.5); const q2 = dist(q, cx, cy); aoe(cx, cy, 80, 1, weaponSrc(w), '#fff'); tick(0.5); if (dist(q, cx, cy) - q2 > 0.5) bad.push('plain blast moved a mine');
    // (f) bdTrip marks a modwide mine gone
    w = fresh('v_phys_proj', [['mines', 1]]); q = mine(w, cx, cy);
    bdTrip({ kind: 'mine', o: q, w, mass: 0.5 }); out.trip = q.gone; if (!q.gone) bad.push('bdTrip did not mark gone');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) r.bad.push('page errors ' + JSON.stringify(errors));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'PASS bodies');
  await b.close();
  process.exit(r.bad.length ? 1 : 0);
})();
