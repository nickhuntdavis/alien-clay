// v10 player shield (pdef.js): nobody has it by default; samples (s10Shield), the Rubber Johnny relic or the Latex Protection card grant it;
// Thicker Membrane / Faster Recharge need it; it draws as the original forcefield (stamina.js armourRing), soaks set G.armFlash.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [];
    const fresh = () => { window.s10Shield = undefined; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.player.iframes = 0; G.P.dodge = 0; G.pbDodge = 0; pdefTick(0.001); };
    const ids = () => { const o = new Set(); for (let i = 0; i < 40; i++) pdefOffer(6).forEach(c => o.add(c.defence)); return o; };
    const hurt = (n, kind) => { G.player.iframes = 0; hurtPlayer(n, 'test', null, kind); };
    // 1. Baseline: no shield, no bubble, Latex offered, Thicker/Faster not.
    fresh();
    if (pdefShieldUp() || G.pd.mem.memMax !== 0) bad.push('baseline has a shield');
    let o = ids(); if (!o.has('latex')) bad.push('Latex not offered without a shield'); if (o.has('thick') || o.has('fast')) bad.push('Thicker/Faster offered without a shield');
    const hp0 = G.player.hp; hurt(10, 'bullets'); if (!(G.player.hp < hp0) || G.armFlash) bad.push('baseline hit should hurt with no flash');
    // 2. Latex Protection grants it; it is not offered again; Thicker/Faster now are.
    fresh(); pdefOffer(6).find(c => c.defence === 'latex').apply(); pdefTick(0.001);
    if (!pdefShieldUp() || Math.abs(G.pd.mem.memMax - G.P.maxHp * 0.3) > 0.01) bad.push('Latex did not grant a 30% shield: ' + G.pd.mem.memMax);
    o = ids(); if (o.has('latex')) bad.push('Latex offered with a shield'); if (!o.has('thick') || !o.has('fast')) bad.push('Thicker/Faster not offered with a shield: ' + [...o]);
    // 3. Private Schooled (stubbed s10Shield) starts with it; no Latex then.
    fresh(); window.s10Shield = () => true; pdefTick(0.001);
    if (!pdefShieldUp()) bad.push('s10Shield did not grant a shield'); if (ids().has('latex')) bad.push('Latex offered to a sample with a shield');
    // 4. Rubber Johnny relic grants it (and the old skin is gone).
    fresh(); G.relics.rubber = 1; pdefTick(0.001);
    if (!pdefShieldUp()) bad.push('Rubber Johnny did not grant the shield');
    const hpR = G.player.hp; hurt(5, 'bullets'); if (G.player.hp !== hpR) bad.push('small hit leaked through the relic shield'); if (G.rubberAt) bad.push('old skin still fired');
    // 5. Drawing: armourRing runs when up, not when down; a soak sets armFlash and the bubble physics run.
    let calls = 0; const orig = armourRing; window.armourRing = function () { calls++; return orig.apply(this, arguments); };
    for (let i = 0; i < 3; i++) render();
    if (!calls) bad.push('armourRing not drawn with the shield up');
    G.armFlash = null; if (G.state !== 'play') console.log('state', G.state); G.state = 'play'; hurt(8, 'contact'); if (!G.armFlash) bad.push('soak did not set armFlash');
    for (let i = 0; i < 20; i++) update(1 / 60); if (!G.bub) bad.push('bubble physics (G.bub) not running');
    calls = 0; G.pd.mem.mem = 0; G.pd.mem.memQuietT = -99; for (let i = 0; i < 3; i++) render();
    if (calls) bad.push('armourRing drawn with the shield down');
    window.armourRing = orig;
    G.pd.mem.memQuietT = 0; for (let i = 0; i < 300; i++) pdefTick(1 / 60);
    if (!pdefShieldUp()) bad.push('shield did not come back after recharging');
    // 6. Screenshot state: shield up, a fresh hit rippling.
    fresh(); G.relics.rubber = 1; pdefTick(0.001); G.pd.mem.mem = G.pd.mem.memMax * 0.8;
    for (let i = 0; i < 6; i++) update(1 / 60);
    G.armFlash = { t: G.realT, k: 0.9, a: 0.6 }; render();
    return { bad };
  });
  await page.screenshot({ path: 'shield.png' });
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
