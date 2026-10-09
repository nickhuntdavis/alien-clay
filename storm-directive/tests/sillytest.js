const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const setup = () => page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; UI.quickStart(); G.t = 60; G.level = 12; G.P.maxHp = 300; G.player.hp = 300; window.spawnRandom = () => {}; });
  const crowd = (n) => page.evaluate(n => { for (let i = 0; i < n; i++) { const a = i / n * TAU, d = 120 + (i % 4) * 60; G.enemies.push(makeEnemy(pick([ENEMIES.grunt, ENEMIES.brute, ENEMIES.charger].filter(Boolean)), G.player.x + Math.cos(a) * d, G.player.y + Math.sin(a) * d)); } gridBuild(); }, n);
  const sim = (sec) => page.evaluate(sec => { for (let i = 0; i < sec * 60; i++) { G.lootQueue.length = 0; if (G.state !== 'play') { G.state = 'play'; UI.show('hud'); } update(1 / 60); } }, sec);
  const res = {};
  await setup();
  for (const id of ['decoy', 'gossip', 'conga', 'hiccups', 'paperwork', 'insure', 'sneeze', 'refund']) {
    await page.evaluate(() => { G.enemies.length = 0; G.ebul.length = 0; G.player.hp = G.P.maxHp; G.chrono.charges = 0; });
    await crowd(24);
    const before = await page.evaluate(() => ({ x: G.player.x, y: G.player.y, gems: G.gems.length, kills: G.kills }));
    await page.evaluate(id => applyPickup(id, {}), id);
    if (id === 'decoy') await page.evaluate(() => { G.player.x += 400; });
    if (id === 'insure') await page.evaluate(() => { G.player.iframes = 0; hurtPlayer(99999, 'test', null, 'contact'); });
    await sim(1.5);
    if (['decoy', 'conga', 'gossip', 'paperwork'].includes(id)) { await page.waitForTimeout(250); await page.screenshot({ path: 'silly_' + id + '.png' }); }
    res[id] = await page.evaluate(({ id, before }) => {
      const o = { state: G.state, pu: +(G.pu && G.pu[id] || 0).toFixed(1) };
      if (id === 'decoy') { const D = G.decoy; o.nearDecoy = D ? G.enemies.filter(e => Math.hypot(e.x - D.x, e.y - D.y) < 160).length : 'gone'; }
      if (id === 'gossip') o.gossiping = G.enemies.filter(e => e.gossip).length;
      if (id === 'conga') o.dancers = G.conga && G.conga.n;
      if (id === 'hiccups') o.moved = Math.round(Math.hypot(G.player.x - before.x, G.player.y - before.y));
      if (id === 'paperwork') o.formed = G.enemies.filter(e => e.formT > G.t).length + '/' + G.enemies.length;
      if (id === 'insure') o.hp = Math.round(G.player.hp) + '/' + G.P.maxHp;
      if (id === 'refund') o.gems = G.gems.length - before.gems;
      o.kills = G.kills - before.kills;
      return o;
    }, { id, before });
  }
  console.log(JSON.stringify(res));
  // modifiers: install each on the first weapon and fight a crowd for 6s
  const mods = {};
  for (const id of ['trashtalk', 'passive', 'trophy', 'inherit', 'clingy', 'snitch']) {
    const r = await page.evaluate(id => { G.enemies.length = 0; G.player.hp = G.P.maxHp; G.stats.dmg = {}; const w = G.weapons.find(Boolean); w.mods = [{ id, p: 1.25 }]; computeStats(w); w.ttN = 0; w.trN = 0; return w.def.name; }, id);
    await crowd(30); await sim(6);
    mods[id] = await page.evaluate(() => { const w = G.weapons.find(Boolean); return { tt: w.ttN, dmg: Object.entries(G.stats.dmg).map(([k, v]) => k + ':' + Math.round(v)).join(' ') }; });
    mods[id].w = r;
  }
  console.log(JSON.stringify(mods, null, 1));
  // duos register
  console.log('duos:', await page.evaluate(() => { const w = G.weapons.find(Boolean); w.mods = [{ id: 'trashtalk', p: 1 }, { id: 'trophy', p: 1 }, { id: 'passive', p: 1 }, { id: 'snitch', p: 1 }]; computeStats(w); return w.s.duos.join(', '); }));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none', await page.evaluate(() => ERRS.last)); await b.close();
})();
