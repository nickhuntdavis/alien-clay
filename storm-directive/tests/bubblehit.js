// v10 Membrane bubble as a hitbox (pdef.js): enemies stop and bounce at its edge; shots stop at it; Rubber Johnny throws them back.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [];
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.ebul.length = 0; G.proj.length = 0; G.zones.length = 0; G.player.iframes = 0; G.P.dodge = 0; G.pbDodge = 0; pdefTick(0.001); };
    // 1. With the shield, an enemy dropped on you is held at the bubble's edge and shoved away.
    fresh(); G.relics.rubber = 1; pdefTick(0.001);
    let p = G.player; const R = pdefBubbleR(); if (!(R > 0)) bad.push('no bubble radius with shield');
    const mkE = (x, y) => { const e = makeEnemy(ENEMIES.grunt || Object.values(ENEMIES)[0], x, y); G.enemies.push(e); return e; };
    const e = mkE(p.x + 5, p.y); const hp0 = G.player.hp; const mem0 = G.pd.mem.mem;
    let dmin = 1e9, memMin = mem0; for (let i = 0; i < 60; i++) { G.state = 'play'; update(1 / 60); dmin = Math.min(dmin, Math.hypot(e.x - p.x, e.y - p.y)); memMin = Math.min(memMin, G.pd.mem.mem); }
    const d = dmin; if (G.player.hp < hp0 - 0.01) bad.push('hp hurt'); Math.hypot(e.x - p.x, e.y - p.y); 
    if (d < R + e.r * 0.6) bad.push('enemy got inside the bubble: ' + d.toFixed(1) + ' vs ' + (R + e.r).toFixed(1));
    if (!(memMin < mem0)) bad.push('contact did not touch the Membrane');
    if (G.player.hp < hp0) bad.push('contact hurt health through the Membrane');
    // 2. A shot stops at the bubble edge and, with Rubber Johnny, comes back as a player shot.
    fresh(); G.relics.rubber = 1; pdefTick(0.001); G.player.iframes = 0; p = G.player;
    G.ebul.push({ x: p.x + R + 10, y: p.y, vx: -300, vy: 0, dmg: 5, r: 5, color: '#f00', life: 5, from: 'test bullets', owner: null });
    const n0 = G.proj.length; for (let i = 0; i < 6; i++) { G.state = 'play'; update(1 / 60); }
    if (G.ebul.length) bad.push('shot passed the bubble');
    if (!(G.proj.length > n0)) bad.push('Rubber Johnny did not throw the shot back');
    // 3. Without the relic (Latex card only) the shot stops but is not thrown back.
    fresh(); pdef().n.latex = 1; pdefTick(0.001); G.player.iframes = 0; p = G.player;
    G.ebul.push({ x: p.x + R + 10, y: p.y, vx: -300, vy: 0, dmg: 5, r: 5, color: '#f00', life: 5, from: 'test bullets', owner: null });
    const n1 = G.proj.length; for (let i = 0; i < 6; i++) { G.state = 'play'; update(1 / 60); }
    if (G.ebul.length) bad.push('shot passed the latex bubble'); if (G.proj.length > n1) bad.push('reflected without the relic');
    return { bad };
  });
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close(); if (r.bad.length || errors.length) process.exit(1);
})();
