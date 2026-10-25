// Objects hold hits (COMBAT_MATRIX 15.4, holdhits.js): a mine stores the last hit your attacks land on it and relays it when
// it goes off; a Charged mine is an arc node; a mine's own blast does not store into a neighbour.
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
      G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0;
      G.weapons = [makeSlot(wid || 'v_phys_proj', false, 9), makeSlot('v_flame_pool', false, 9), null];
      const w = G.weapons[0];
      for (const [id, n] of mods || []) for (let i = 0; i < n; i++) if (!modAdd(w, id)) w.m10.push(id);
      computeStats(w); G.mwAny = true; return w;
    };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); gridBuild(); return e; };
    const mine = (w, x, y) => { const q = { w, x, y, t: G.t + 600, armed: G.t + 1e6, src: weaponSrc(w), big: 1, rearm: 0 }; mwS().mines.push(q); return q; };
    const lost = e => e.maxHp - e.hp;
    // (a) a blast from another weapon is stored (damage and type)
    let w = fresh('v_phys_proj', [['mines', 1]]); const w2 = G.weapons[1]; let q = mine(w, 200, 0);
    aoe(q.x, q.y, 40, 50, Object.assign(weaponSrc(w2), { elem: 'flame' }), '#fff');
    out.a = q.hh && [q.hh.elem, q.hh.dmg]; if (!q.hh || q.hh.elem !== 'flame' || q.hh.dmg !== 50) bad.push('(a) not stored ' + JSON.stringify(q.hh));
    // (b) it goes off: the brute loses more than from the mine's blast alone, and the hold is spent
    w = fresh('v_phys_proj', [['mines', 1]]); let e = foe(230, 0); q = mine(w, 200, 0); mwMineGo(q); const base = lost(e);
    w = fresh('v_phys_proj', [['mines', 1]]); e = foe(230, 0); q = mine(w, 200, 0);
    aoe(q.x, q.y, 40, 500, Object.assign(weaponSrc(G.weapons[1]), { elem: 'flame' }), '#fff'); const pre = lost(e);
    mwMineGo(q); out.b = [Math.round(base), Math.round(lost(e) - pre)];
    if (!(base > 0)) bad.push('(b) mine blast did nothing ' + base); else if (!(lost(e) - pre > base + 100)) bad.push('(b) no relay ' + out.b); if (q.hh) bad.push('(b) hold not cleared');
    // (c) a Static hold makes the mine an arc node: the arc reaches a second brute out of range of the first
    const arcTest = hold => {
      const w = fresh('v_phys_proj', [['mines', 1]]); const e1 = foe(120, 0), e2 = foe(280, 0), q = mine(w, 200, 0);
      if (hold) aoe(q.x, q.y, 40, 50, Object.assign(weaponSrc(G.weapons[1]), { elem: 'shock' }), '#fff');
      if (hold && !(q.hh && q.hh.elem === 'shock')) bad.push('(c) no Static hold');
      e1.chargeT = G.t + 3; damageEnemy(e1, 100, Object.assign(weaponSrc(w), { elem: 'shock' }));
      return [lost(e2), q.hh && q.hh.dmg];
    };
    const c0 = arcTest(false), c1 = arcTest(true); out.c = [c0, c1];
    if (c0[0] > 0) bad.push('(c) control arc reached the far brute'); if (!(c1[0] > 0)) bad.push('(c) arc did not pass through the mine');
    // (d) a mine's own blast does not store into a neighbouring mine
    w = fresh('v_phys_proj', [['mines', 1]]); q = mine(w, 200, 0); const q2 = mine(w, 240, 0); mwMineGo(q); out.d = !!q2.hh; if (q2.hh) bad.push('(d) neighbour stored the blast');
    // (e) a shot overlapping a mine stores once; a pool stores every 0.5 s
    w = fresh('v_phys_proj', [['mines', 1]]); q = mine(w, 200, 0); const w3 = G.weapons[1];
    G.proj.push({ x: 200, y: 0, vx: 0, vy: 0, r: 6, dmg: 30, life: 5, src: weaponSrc(w3), w: w3 }); hhTick(1 / 60);
    out.e1 = q.hh && q.hh.dmg; if (!q.hh || q.hh.dmg !== 30) bad.push('(e) shot not stored ' + JSON.stringify(q.hh));
    q.hh = null; hhTick(1 / 60); if (q.hh) bad.push('(e) same shot stored twice');
    G.proj.length = 0; G.zones.push({ x: 200, y: 0, r: 60, life: 3, max: 3, dps: 20, elem: 'fire', pull: 0, tick: 0, src: weaponSrc(w3) });
    hhTick(1 / 60); out.e2 = q.hh && q.hh.dmg; if (!q.hh || q.hh.dmg !== 10) bad.push('(e) pool not stored ' + JSON.stringify(q.hh));
    q.hh = null; hhTick(1 / 60); if (q.hh) bad.push('(e) pool stored inside 0.5 s');
    // frames still run
    for (let f = 0; f < 30; f++) update(1 / 60);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  const fail = r.bad.length || errors.length;
  console.log(fail ? 'FAIL ' + r.bad.join('; ') : 'PASS', 'ERRORS', JSON.stringify(errors));
  await b.close();
  process.exit(fail ? 1 : 0);
})();
