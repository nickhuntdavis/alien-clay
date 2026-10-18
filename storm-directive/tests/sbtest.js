// Sandbox (sandbox.js): weapons only, slow stream, HEAT raises the spawn rate, upgrades in the draft screen, no bosses.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    try { localStorage.setItem('sd_dev', '1'); } catch (e) { /* storage unavailable */ }
    UI.openSamples();
    if (document.querySelectorAll('[data-sb]').length !== 3) bad.push('sandbox cards missing');
    UI.sample = 's010'; UI.sbN = 2; newGame(); G.state = 'play';
    if (!sbOn() || G.debug.god) bad.push('sandbox flags');
    const st = genLoot(G.lootQueue[0]); out.start = st.length;
    if (st.length < 20) bad.push('start offers ' + st.length);
    st[0].apply(); G.lootQueue = [];
    // Boxes: only weapons and weapon upgrades
    for (const k of ['level', 'chest', 'boss', 'vesicle', 'fork']) if (v10Box({ kind: k })) bad.push(k + ' box opened');
    G.weapons.push(null); if (v10Box({ kind: 'slot' }) !== true) bad.push('2nd mount refused');
    genLoot({ kind: 'slot' })[0].apply();
    G.weapons.push(null); if (v10Box({ kind: 'slot' }) !== false || G.weapons.length !== 2) bad.push('3rd mount allowed: ' + G.weapons.length);
    // Upgrade in the draft screen
    const w = G.weapons[0]; G.weapons[1].lvl = 10; G.level = 4; wupLevel(4);
    const q = G.lootQueue.find(x => x.kind === 'wup'); if (!q) bad.push('no wup');
    else {
      v10Box(q); if (q.kind !== 'wupfork' || q.w !== w) bad.push('wup not routed: ' + q.kind);
      UI.openLoot(q); if (G.state !== 'loot' || !$('draft').classList.contains('on') && UI.screen !== 'draft') out.screen = UI.screen;
      if ($('dTitle').textContent !== 'PROMISE') bad.push('draft title ' + $('dTitle').textContent);
      UI.pickLoot(0); if (w.lvl !== 3) bad.push('promise not applied: ' + w.lvl);
    }
    G.lootQueue = [];
    // Spawning: slow at heat 0, more at heat 3, no bosses or pickups
    const run = (heat, secs) => {
      G.enemies = []; G.spawnAcc = 0; G.debug.sb.heat = heat; G.t = 60; G.state = 'play'; G.player.hp = 1e9;
      let n = 0; const n0 = () => G.enemies.length;
      for (let i = 0; i < secs * 30; i++) { const a = n0(); update(1 / 30); n += Math.max(0, n0() - a); G.player.hp = 1e9; G.lootQueue = []; }
      return n;
    };
    out.h0 = run(0, 20); out.h3 = run(3, 20);
    if (out.h3 < out.h0 * 1.6) bad.push('heat barely matters ' + out.h0 + ' vs ' + out.h3);
    if (G.boss || G.pickups.length) bad.push('boss or pickups');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
