// Level-up boxes (levelbox.js), rescue spots (kindred.js kinIn) and the bigger arenas.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    LVBOX.force = true;
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 20; G.enemies.length = 0;
    out.arena = CORE.arena; if (CORE.arena !== 3600) bad.push('race arena ' + CORE.arena);
    // 1. A level-up becomes a box on the slide, inside the arena
    G.lootQueue.push({ kind: 'level' }); lvboxTick();
    const u = G.pickups.find(x => x.type === 'lvbox'); const p = G.player;
    out.box = u && [Math.round(Math.hypot(u.x - p.x, u.y - p.y)), G.lootQueue.length];
    if (!u || G.lootQueue.length || Math.hypot(u.x - p.x, u.y - p.y) > 310) bad.push('box ' + JSON.stringify(out.box));
    // 2. Touching it opens the screen at once, even between Race slots
    G.t = 45; G.rplan = { used: 1, ms: 0 }; applyPickup('lvbox', u.src); const q = G.lootQueue[0];
    out.open = q && [q.kind, q.now, dirGate(q)]; if (!q || q.kind !== 'level' || dirGate(q) !== true) bad.push('open ' + JSON.stringify(out.open));
    // 3. Wave mode: no wave-break hold for it; dish bigger
    LVBOX.force = true; UI.sample = 's002'; newGame(); G.state = 'play'; out.dish = CORE.arena; if (CORE.arena !== 1750) bad.push('dish ' + CORE.arena);
    G.lootQueue = [{ kind: 'level', lvbox: true, now: true }]; out.hold = waveHoldsLoot(); if (out.hold) bad.push('wave holds a picked box');
    // 4. Rescue spots stay inside the arena, even from the rim
    UI.sample = 's001'; newGame(); G.state = 'play'; G.player.x = CORE.arena - 50; G.player.y = 0;
    let worst = 0; for (let i = 0; i < 50; i++) { const s = kinIn(G.player.x + 900 * Math.cos(i), 900 * Math.sin(i)); worst = Math.max(worst, Math.hypot(s.x - G.core.x, s.y - G.core.y)); }
    out.kin = Math.round(worst); if (worst > CORE.arena - KIN.rim + 1) bad.push('rescue outside ' + worst);
    LVBOX.force = false;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
