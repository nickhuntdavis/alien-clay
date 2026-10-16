// The Armoury (armoury.js): every damage type has at least five weapons and at least one melee, fun, area and pet
// weapon (ARM_CLASS); each new weapon deals damage at Lv 10 with no upgrades, with both forks on the left, and on the right.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(ids => { window.TUT_OFF = 1; if (ids) window.ARM_IDS = ids.split(','); splashEnd(); }, process.argv[2] || ''); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const count = {};
    for (const id in WEAPONS) if (!WEAPONS[id].merged && !WEAPONS[id].seqOnly) count[WEAPONS[id].elem] = (count[WEAPONS[id].elem] || 0) + 1;
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0], rows = [], bad = [];
    const ids = (window.ARM_IDS || Object.keys(WEAPONS).filter(id => WEAPONS[id].armoury));
    for (const id of ids) {
      if (WEAPONS[id].armoury && !Object.keys(PROFILES).some(k => PROFILES[k].weapons.includes(id))) bad.push(id + ': in no sequence');
      for (const side of [-1, 0, 1]) {
        UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
        G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
        const w = makeSlot(id, false, 10);
        if (side >= 0 && WEAPONS[id].sig) for (const l of [5, 10]) w.perks[l] = WEAPONS[id].sig[l][side];
        G.weapons = [w, null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
        const p = G.player; G.enemies.length = 0; G.stats.dmg = {};
        for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 90 + (i % 3) * 70; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); }
        try { for (let f = 0; f < 360; f++) { p.vx = Math.cos(f / 30) * 160; p.vy = Math.sin(f / 30) * 160; p.x += p.vx / 60; p.y += p.vy / 60; update(1 / 60); } } catch (err) { bad.push(id + ' side ' + side + ': ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
        const dealt = Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
        if (!(dealt > 0)) bad.push(id + ' side ' + side + ': no damage');
        rows.push(id + (side < 0 ? '' : side ? ' R' : ' L') + ' ' + Math.round(dealt / 6) + '/s');
      }
    }
    const spread = {};
    for (const id in WEAPONS) { const d = WEAPONS[id]; if (d.merged || d.seqOnly) continue; const c = ARM_CLASS[id]; if (!c) { bad.push(id + ': no play style'); continue; } (spread[d.elem] || (spread[d.elem] = {}))[c] = ((spread[d.elem] || {})[c] || 0) + 1; }
    for (const el in spread) for (const c of ['melee', 'fun', 'area', 'pet']) if (!spread[el][c]) bad.push(el + ': no ' + c);
    const total = {}; for (const id in ARM_CLASS) total[ARM_CLASS[id]] = (total[ARM_CLASS[id]] || 0) + 1;
    return { count, rows, bad, total };
  });
  const thin = Object.entries(r.count).filter(([k, n]) => n < 5);
  if (thin.length) console.log('FAIL fewer than 5 weapons:', JSON.stringify(thin));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log(JSON.stringify(r.count), JSON.stringify(r.total)); console.log(r.rows.join(' | '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
})();
