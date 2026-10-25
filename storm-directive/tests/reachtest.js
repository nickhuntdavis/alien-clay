// Reach and proximity (COMBAT_MATRIX.md 15.5, web/js/reach.js): Range and Up Close are offered on Burst, Pool and Contact
// weapons and are no longer hidden by MOD_DEAD; Range widens blast radius and mine trigger radius, never damage, and leaves a
// projectile weapon's reachK at 1.
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
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); gridBuild(); return e; };
    const tick = (t, fn) => { for (let f = 0; f < t * 60; f++) { G.t += 1 / 60; (fn || mwTick)(1 / 60); gridBuild(); } };
    const lay = w => { mwLay(w, G.enemies[0] || null, weaponSrc(w)); return mwS().mines[mwS().mines.length - 1]; };
    // (a) availability: Burst, Pool and Contact weapons take both; MOD_DEAD no longer lists either
    const BURST = 'v_phys_burst';
    for (const id of ['range', 'upclose']) {
      const w = fresh(BURST, []); out['ok_' + id] = modOk(w, id); if (!out['ok_' + id]) bad.push('burst cannot take ' + id);
      for (const a of ['pool', 'contact']) { const wid = W24_IDS.find(i => (W24.find(r => r[0] === i) || [])[3] === a); if (wid) { const x = fresh(wid, []); if (!modOk(x, id)) bad.push(a + ' ' + wid + ' cannot take ' + id); } }
    }
    for (const k in MOD_DEAD) for (const d in MOD_DEAD[k]) for (const id of ['range', 'upclose']) if (MOD_DEAD[k][d].includes(id)) bad.push('MOD_DEAD ' + k + '/' + d + ' has ' + id);
    // (b) Range 3 on a burst: damage unchanged, blast radius x1.6
    let w = fresh(BURST, []); const dmg0 = w.s.dmg; let rk0 = reachK(w);
    w = fresh(BURST, [['range', 3]]); out.dmg = [dmg0, w.s.dmg]; out.reachK = reachK(w);
    if (w.s.dmg !== dmg0) bad.push('range changed damage ' + out.dmg);
    if (Math.abs(reachK(w) - 1.6) > 1e-9 || rk0 !== 1) bad.push('reachK ' + out.reachK + ' / ' + rk0);
    const hit = (wk, dist) => { const ww = fresh(BURST, wk); const e = foe(dist, 0); const hp = e.hp; aoe(G.player.x, G.player.y, 50, 10, weaponSrc(ww), '#fff'); return e.hp < hp; };
    const near = ENEMIES.brute.r || 20; const dist = 50 + (near > 0 ? near : 20) + 15; // (outside 50, inside 80)
    out.blast = [hit([], dist), hit([['range', 3]], dist)];
    if (out.blast[0] || !out.blast[1]) bad.push('blast reach ' + out.blast + ' at ' + dist);
    // (c) mines: Range 2 trips an enemy whose edge is 72 away (inside 60 x 1.4 = 84), no Range does not (msNear counts the enemy's radius), no Range does not
    const trip = mods => { const ww = fresh('v_phys_proj', mods); const e = foe(0, 0); e.x = G.player.x + 60 + e.r + 12; gridBuild(); const q = lay(ww); q.x = G.player.x; q.y = G.player.y; q.armed = 0; tick(0.5); return !!q.gone; };
    out.mine = [trip([['mines', 1]]), trip([['mines', 1], ['range', 2]])];
    if (out.mine[0] || !out.mine[1]) bad.push('mine trigger ' + out.mine);
    // (d) projectile: reachK stays 1, reachMul grows
    w = fresh('v_phys_proj', [['range', 3]]); out.proj = [reachK(w), reachMul(w)]; if (reachK(w) !== 1) bad.push('proj reachK ' + reachK(w));
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (errors.length) r.bad.push('page errors: ' + errors.join(' | '));
  await b.close();
  console.log(r.bad.length ? 'FAIL\n' + r.bad.join('\n') : 'PASS reachtest');
  process.exit(r.bad.length ? 1 : 0);
})();
