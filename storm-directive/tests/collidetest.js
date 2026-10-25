// Collisions (COMBAT_MATRIX 15.3, collide.js): a fast enemy that hits a mate damages both and passes on speed (never more
// than it had), a slow one does nothing, a fast one trips your mine, and a pair collides once per 0.5 s.
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
      for (const [id, n] of mods || []) for (let i = 0; i < n; i++) if (!modAdd(w, id)) w.m10.push(id);
      computeStats(w); G.mwAny = true; return w;
    };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + dy, {}); e.speed = 60; e.hp = e.maxHp = 1e5; G.enemies.push(e); gridBuild(); return e; };
    const tick = (t, fn) => { for (let f = 0; f < Math.round(t * 60); f++) { update(1 / 60); if (fn) fn(); } };
    // (a) a fast brute rams a mate: both lose hp, the mate is shoved on and never faster than the striker's 300
    let w = fresh(); G.player.x = 0; G.player.y = 0;
    let a = foe(100, 0), c = foe(130, 0); a.kx = 300; a.cdLast = { dmg: 100, w, t: G.t };
    let maxK = 0; tick(0.3, () => { maxK = Math.max(maxK, c.kx); });
    out.a = [Math.round(a.maxHp - a.hp), Math.round(c.maxHp - c.hp), Math.round(c.kx), Math.round(maxK)];
    if (!(a.hp < a.maxHp) || !(c.hp < c.maxHp)) bad.push('(a) no damage ' + out.a);
    if (!(c.kx > 0 || maxK > 0)) bad.push('(a) mate not shoved ' + out.a);
    if (maxK > 300.01) bad.push('(a) mate faster than striker ' + maxK);
    // (b) a slow one (50 against base 60) does nothing
    w = fresh(); G.player.x = 0; G.player.y = 0; a = foe(100, 0); c = foe(130, 0); a.kx = 50; a.cdLast = { dmg: 100, w, t: G.t };
    tick(0.3); out.b = [a.hp === a.maxHp, c.hp === c.maxHp]; if (a.hp < a.maxHp || c.hp < c.maxHp) bad.push('(b) slow enemy dealt damage');
    // (c) a fast brute trips a mine in its path
    w = fresh('v_phys_proj', [['mines', 1]]); G.player.x = 0; G.player.y = 0; a = foe(300, 0); a.x = 300; a.y = 0;
    const q = { w, x: 380, y: 0, t: G.t + 600, armed: G.t + 1e6, src: weaponSrc(w), big: 1, rearm: 0 }; mwS().mines.push(q);
    a.kx = 300; a.cdLast = { dmg: 100, w, t: G.t }; tick(0.5); out.c = !!q.gone; if (!q.gone) bad.push('(c) mine not tripped');
    // (d) the pair does not collide twice inside 0.5 s
    w = fresh(); G.player.x = 0; G.player.y = 0; a = foe(100, 0); c = foe(130, 0); a.kx = 300; a.cdLast = { dmg: 100, w, t: G.t };
    tick(1 / 60); const l1 = (a.maxHp - a.hp) + (c.maxHp - c.hp); tick(0.4); const l2 = (a.maxHp - a.hp) + (c.maxHp - c.hp);
    out.d = [Math.round(l1), Math.round(l2)]; if (!(l1 > 0)) bad.push('(d) no first hit'); if (Math.abs(l2 - l1) > 0.5) bad.push('(d) second hit within 0.5 s ' + out.d);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  const fail = r.bad.length || errors.length;
  console.log(fail ? 'FAIL ' + r.bad.join('; ') : 'PASS', 'ERRORS', JSON.stringify(errors));
  await b.close();
  process.exit(fail ? 1 : 0);
})();
