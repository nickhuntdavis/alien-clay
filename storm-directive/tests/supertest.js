// Super combos (supers.js): each one unlocks only with both combos fused and every weapon Lv 8+, its power does
// something, the gold unlock screen plays, and combo partners share one border in the HUD (fusion.js comboBonds).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const R = {};
    for (const s of SUPERS) {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 200; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies = [];
      const ids = superWeapons(s);
      G.weapons = ids.map(id => makeSlot(id, false, 7)); recomputeAll();
      for (const c of [COMBO_BY[s.x], COMBO_BY[s.y]]) comboFuse(c);
      const early = availableSupers().length; // (Lv 7: not yet)
      for (const id of ids) owned(id).lvl = 8;
      const ready = availableSupers().some(x => x.id === s.id);
      superOpt(s).apply();
      G.lootQueue = []; G.P.maxHp = 1e6; G.player.hp = 1e6; G.stats.dmg = {};
      let infected = 0;
      for (let f = 0; f < 30 * 20; f++) {
        G.lootQueue = []; G.player.hp = 1e6;
        if (f % 15 === 0 && G.enemies.length < 30) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28; const e = makeEnemy(ENEMIES.crawler || Object.values(ENEMIES)[0], G.player.x + Math.cos(a) * rand(80, 260), G.player.y + Math.sin(a) * rand(80, 260)); e.hp = e.maxHp = 400; G.enemies.push(e); }
        if (s.id === 'streaker' && f % 90 === 0) peekFire(owned('peekaboo'));
        if (s.id === 'bathtime' && f === 300) { const e = G.enemies.find(x => !x.dead); if (e) { e.parasiteW = owned('parasite'); e.parasiteT = 6; } }
        G.player.x += Math.cos(f / 25) * 4; G.player.y += Math.sin(f / 25) * 4;
        update(1 / 30); G.state = 'play';
        if (s.id === 'bathtime') infected = Math.max(infected, G.enemies.filter(e => !e.dead && e.parasiteT > 0).length);
      }
      const dmg = G.stats.dmg || {};
      R[s.id] = { early, ready, top: Object.entries(dmg).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => k + ':' + Math.round(v)).join(' ') };
      if (s.id === 'reunion') R[s.id].ok = (dmg['Family Reunion'] || 0) > 0;
      if (s.id === 'nuclear') R[s.id].ok = (dmg['Nuclear Family'] || 0) > 0;
      if (s.id === 'bathtime') R[s.id].ok = infected >= 3, R[s.id].infected = infected;
    }
    return R;
  });
  // The gold screen, from the real loop: Spitball + Seeker + Yo-yo at Lv 8 with both combos fused.
  await page.evaluate(() => {
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
    G.weapons = [makeSlot('blaster', false, 8), makeSlot('shotgun', false, 3), makeSlot('seeker', false, 8), makeSlot('glaive', false, 8)]; recomputeAll();
    G.combo = { bigsib: true, spityoyo: true }; G.fusionAsked = { bigsib: true, spityoyo: true }; G.fusionAt = 0; UI.refreshHud(true);
  });
  await page.waitForFunction(() => typeof FUSION !== 'undefined' && FUSION.req, null, { timeout: 8000 });
  const s1 = await page.evaluate(() => ({ state: G.state, q: JSON.stringify(G.lootQueue), req: JSON.stringify(UI.lootReq), cls: (document.getElementById('fusion') || {}).className + '', kick: (document.getElementById('fuKick') || {}).textContent }));
  await page.evaluate(() => { FUSION.t0 = performance.now() - 1250; }); await page.waitForTimeout(30); await page.screenshot({ path: 'super0.png' });
  await page.waitForTimeout(2600); await page.screenshot({ path: 'super1.png' });
  const s2 = await page.evaluate(() => ({ name: document.getElementById('fuName').textContent, rows: [...document.querySelectorAll('#fuList .furow b')].map(x => x.textContent).join('|') }));
  await page.click('#fuGo'); await page.waitForTimeout(300);
  await page.evaluate(() => UI.refreshHud(true)); await page.waitForTimeout(100);
  const s3 = await page.evaluate(() => ({ on: superOn('reunion'), bonds: [...document.querySelectorAll('#wbonds .wbond')].map(x => x.className + ':' + x.textContent).join('|'), order: [...$('wslots').children].slice(0, 4).map(x => x.style.order).join(',') }));
  await page.screenshot({ path: 'superhud.png' });
  const ok = Object.values(r).every(x => !x.early && x.ready && x.ok !== false) && s1.cls.includes('super') && s2.name === 'FAMILY REUNION' && s2.rows.startsWith('SUPER POWER') && s3.on && /sup:FAMILY REUNION/.test(s3.bonds) && s3.order === '0,3,1,2';
  for (const k in r) console.log(k, JSON.stringify(r[k]));
  if (!ok) console.log('FAIL', JSON.stringify({ s1, s2, s3 }));
  console.log(ok ? 'OK' : 'BAD', JSON.stringify(s3), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
