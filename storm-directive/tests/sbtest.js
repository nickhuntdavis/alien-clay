// Sandbox (sandbox.js): one weapon to start, + mount adds one on tap, upgrades banked every 4th level and spent
// from the branch mark (weapon draft screen), only weapon boxes open, HEAT raises the spawn rate, no bosses.
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
    if (document.querySelectorAll('[data-sb]').length !== 1) bad.push('sandbox card count');
    UI.sample = 's010'; newGame(); G.state = 'play'; UI.show('hud');
    if (!sbOn() || G.debug.god) bad.push('sandbox flags');
    const st = genLoot(G.lootQueue[0]); out.start = st.length;
    if (st.length < 20) bad.push('start offers ' + st.length);
    st[0].apply(); G.lootQueue = [];
    for (const k of ['level', 'chest', 'boss', 'vesicle', 'fork', 'slot']) if (v10Box({ kind: k })) bad.push(k + ' box opened');
    // The + mount
    update(1 / 30); UI.refreshHud(true);
    if (G.weapons.length !== 2 || G.weapons[1] !== null) bad.push('no + mount: ' + G.weapons.length);
    const plus = $('wslots').children[1]; if (plus.style.display === 'none') bad.push('+ mount hidden');
    plus.click(); const sq = G.lootQueue[0];
    if (!sq || sq.kind !== 'slot' || v10Box(sq) !== true) bad.push('+ tap did not queue a pick');
    genLoot(sq)[0].apply(); G.lootQueue = []; update(1 / 30);
    if (G.weapons.filter(Boolean).length !== 2 || G.weapons.length !== 3) bad.push('second weapon: ' + G.weapons.length);
    // Upgrades: banked, not opened; spent from the branch mark
    const w = G.weapons[0]; G.level = 4; wupLevel(4);
    const q = G.lootQueue.find(x => x.kind === 'wup');
    if (!q || v10Box(q) !== false || G.debug.sb.tok !== 1) bad.push('upgrade not banked');
    G.lootQueue = []; UI.refreshHud(true);
    const mark = $('wslots').children[0].querySelector('.sbBr');
    if (!mark || mark.style.display === 'none') bad.push('no branch mark');
    else {
      mark.click(); const fq = G.lootQueue[0];
      if (!fq || fq.kind !== 'wupfork' || fq.w !== w || G.debug.sb.tok !== 0) bad.push('mark tap did not queue');
      else {
        UI.openLoot(G.lootQueue.shift());
        if ($('dTitle').textContent !== 'PROMISE') bad.push('draft title ' + $('dTitle').textContent);
        UI.pickLoot(0); if (w.lvl !== 3) bad.push('promise not applied: ' + w.lvl);
      }
    }
    UI.refreshHud(true); if (mark && mark.style.display !== 'none') bad.push('mark still shown with no upgrade banked');
    G.lootQueue = [];
    // Spawning: slow at heat 0, more at heat 3, no bosses or pickups
    const run = (heat, secs) => {
      G.enemies = []; G.spawnAcc = 0; G.debug.sb.heat = heat; G.t = 60; G.state = 'play'; G.player.hp = 1e9;
      let n = 0;
      for (let i = 0; i < secs * 30; i++) { const a = G.enemies.length; update(1 / 30); n += Math.max(0, G.enemies.length - a); G.player.hp = 1e9; G.lootQueue = []; }
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
