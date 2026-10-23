// Piercing (piercefx.js): a homing piercing shot moves on to enemies it has not hit; a pierce shows sparks out the far side.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    for (const combo of [[], ['homing']]) {
      UI.sample = 's010'; META.profile = 'human1'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.manual = { x: 0, y: 0 };
      const w = G.weapons[0] = makeSlot('v_phys_proj', false, 1); modAdd(w, 'piercing'); for (const m of combo) modAdd(w, m); computeStats(w);
      const p = G.player, es = [];
      for (let i = 0; i < 6; i++) { const e = makeEnemy(ENEMIES.crawler, p.x + 120 + i * 40, p.y + (i % 2) * 6, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); es.push(e); }
      const hit = new Set(); const de = damageEnemy; damageEnemy = function (e, d, src) { if (src && src.wname === 'Standard Issue') hit.add(es.indexOf(e)); return de.apply(this, arguments); };
      const n0 = G.parts.length; fireWeapon(w, es[0]);
      let sparks = 0; for (let i = 0; i < 60; i++) { const k = G.parts.length; update(1 / 60); sparks = Math.max(sparks, G.parts.length - n0); }
      damageEnemy = de;
      out[combo.join() || 'plain'] = [[...hit].sort().join(','), sparks > 0];
    }
    if (out.plain[0] !== '0,1,2') bad.push('plain ' + out.plain);
    if (out.homing[0] !== '0,1,2') bad.push('homing ' + out.homing);
    if (!out.plain[1]) bad.push('no sparks');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
