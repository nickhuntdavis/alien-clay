// More to aim at (aimplus.js): with the Advanced Targeting mastery the aim menu leads with MINES, PROJECTILES, ENEMIES and ME;
// a weapon aimed at a mine sets it off, at a shot destroys it, at ME lands on you. Also: every level-up queues a box.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce); // (no cilia: they stop attacks)
    const fresh = ids => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; ids.forEach((id, i) => { G.weapons[i] = makeSlot(id, false, 3); computeStats(G.weapons[i]); }); return G.weapons; };
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; } };
    // 1. Only with the mastery, and first in the list
    fresh(['v_phys_proj']); out.without = aimList().filter(d => d.xtop).length;
    G.spMx = { sp_aimM: 1 }; out.with = aimList().slice(0, 4).map(d => d.id).join();
    if (out.without !== 0 || out.with !== 'mines,shots,enemies,me') bad.push('menu ' + out.without + ' / ' + out.with);
    // 2. MINES: a mine within reach is set off
    let [w, nm] = fresh(['v_phys_proj', 's_mines']); G.spMx = { sp_aimM: 1 }; w.dir = 'mines'; nm.cd = 99;
    const m = mineDrop(nm, G.player.x + 150, G.player.y); m.arm = 0; G.proj.push(m); foe(0, 330);
    run(1.5); out.mine = m.dead; if (!m.dead) bad.push('mine not set off');
    // 3. PROJECTILES: an enemy shot is destroyed
    [w] = fresh(['v_phys_proj']); G.spMx = { sp_aimM: 1 }; w.dir = 'shots'; foe(0, 330);
    eBullet(G.player.x + 120, G.player.y + 90, Math.PI, 5, 1, 5, '#f00'); const sh = G.ebul[G.ebul.length - 1];
    run(1); out.shot = sh.dead; if (!sh.dead) bad.push('shot not destroyed');
    // 4. ME: a pool lands on you
    [w] = fresh(['v_flame_pool']); G.spMx = { sp_aimM: 1 }; w.dir = 'me'; foe(250, 0); G.P.speed = 0; // (you hold still, so the pool lands where you are)
    run(1.5); out.me = Math.round(Math.min(...G.zones.filter(z => z.src && z.src.w === w).map(z => Math.hypot(z.x - G.player.x, z.y - G.player.y))));
    if (!(out.me < 80)) bad.push('pool not on you ' + out.me);
    // 5. ENEMIES: the nearest enemy
    [w] = fresh(['v_phys_proj']); G.spMx = { sp_aimM: 1 }; const near = foe(100, 0); foe(300, 0); out.enemies = acquire('enemies', 400, G.player.x, G.player.y) === near; if (!out.enemies) bad.push('enemies is not nearest');
    // 6. Nothing to aim at: the nearest enemy
    out.fallback = acquire('mines', 400, G.player.x, G.player.y) === near; if (!out.fallback) bad.push('no fallback');
    // 7. Every level-up queues a box
    fresh(['v_phys_proj']); G.level = 30; G.xp = 0; G.xpNeed = xpNeed(30); G.lootQueue = [];
    for (let i = 0; i < 10; i++) gainXp((G.xpNeed - G.xp) / Math.max(0.01, XP_PACE * G.evm.xp) + 1);
    out.levels = [G.level, G.lootQueue.filter(q => q.kind === 'level').length]; if (out.levels[1] < out.levels[0] - 30) bad.push('level-ups without a box ' + out.levels);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
