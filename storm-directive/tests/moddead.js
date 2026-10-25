// Draft filter (moddead.js): a modifier the audit found dead on a weapon + Delivery is not offered; every matrix weapon
// keeps something to draft under every Delivery.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); MATRIX_ONLY.force = true; }); await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const bad = []; UI.sample = 's000'; newGame();
    const mk = (id, m) => { const w = makeSlot(id, false, 9); w.lvl = 9; w.m10 = m.slice(); return w; };
    if (modOk(mk('v_flame_beam', ['orbiting']), 'homing') !== false) bad.push('Laser + Orbiting still offers Homing (dead in the audit)');
    if (modOk(mk('v_flame_beam', ['melee']), 'homing') !== true) bad.push('Laser + Melee hides Homing (live since the Melee forms, delivforms.js)');
    if (modOk(mk('v_flame_beam', ['mines']), 'charged') !== true) bad.push('Laser + Mines lost Charge-Up (it works since the Delivery routing)');
    if (modOk(mk('v_flame_beam', []), 'charged') !== true) bad.push('naked Laser lost Charge-Up');
    const si = mk('v_phys_proj', []); for (const m of ['charged', 'knock', 'rapid']) if (!modOk(si, m)) bad.push('Standard Issue lost ' + m);
    const dl = Object.keys(MODS10).filter(id => MM_GROUP[id] === 'delivery');
    for (const id of MATRIX_ONLY.weapons) for (const base of [[], ...dl.map(d => [d])]) {
      const w = mk(id, []); if (base.length && !modOk(w, base[0])) continue;
      w.m10 = base.slice(); if (!modsFor(w).length) bad.push(WEAPONS[id].name + ' + ' + (base[0] || 'none') + ': empty draft');
    }
    return bad;
  });
  const bad = r.concat(errors.length ? ['page errors: ' + errors.join('; ')] : []);
  console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'moddead OK'); await b.close(); process.exit(bad.length ? 1 : 0);
})();
