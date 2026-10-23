// Area (areamod.js): a weapon modifier that makes the weapon's blasts, pools, contact reach, beam width and modifier
// areas bigger (+25% a rank); dealt on one weapon like any modifier.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); return e; };
    // 1. Offered on any attack type; its own group
    let w = fresh('v_phys_burst'); out.ok = ['v_phys_burst', 'v_flame_pool', 'v_phys_contact', 'v_phys_proj', 'v_shock_beam'].map(id => modOk(fresh(id), 'area'));
    if (out.ok.includes(false)) bad.push('offered ' + out.ok);
    // 2. Blasts: a blast of r 60 hits an enemy at 70 only with Area
    w = fresh('v_phys_burst'); const e1 = foe(0, 300); const src = weaponSrc(w); aoe(e1.x + 70, e1.y, 60, 10, src); update(1 / 60); const h0 = e1.hp;
    modAdd(w, 'area'); computeStats(w); aoe(e1.x + 70, e1.y, 60, 10, weaponSrc(w)); out.blast = [h0 === 1e5, e1.hp < h0]; if (!(e1.hp < h0)) bad.push('blast ' + out.blast);
    // 3. Pools: a zone from this weapon grows
    w = fresh('v_flame_pool'); modAdd(w, 'area'); modAdd(w, 'area'); computeStats(w); G.zones.push({ x: 0, y: 0, r: 40, life: 2, max: 2, dps: 1, elem: 'fire', pull: 0, color: '#fff', tick: 0, src: weaponSrc(w) });
    wupTick(1 / 60); out.pool = G.zones[0].r; if (out.pool !== 60) bad.push('pool ' + out.pool);
    // 4. Contact reach and beam width
    w = fresh('v_phys_contact'); const r0 = w.s.range; modAdd(w, 'area'); computeStats(w); out.reach = [r0, w.s.range]; if (!(w.s.range > r0 * 1.2)) bad.push('reach ' + out.reach);
    w = fresh('v_shock_beam'); const w0 = w.s.width; modAdd(w, 'area'); computeStats(w); out.width = [w0, w.s.width]; if (!(w.s.width > w0 * 1.2)) bad.push('width ' + out.width);
    // 5. Ring matches the blast
    w = fresh('v_phys_burst'); modAdd(w, 'area'); computeStats(w); G.fx.length = 0; aoe(500, 500, 40, 1, weaponSrc(w)); ring(500, 500, 40, '#fff'); out.ring = G.fx.filter(f => f.type === 'ring').map(f => f.r).pop(); if (out.ring !== 50) bad.push('ring ' + out.ring);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
