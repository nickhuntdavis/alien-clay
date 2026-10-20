// Upgrade fit check (fitcheck.js): branch cards, modifiers and Switched at Birth that would break a branch are not offered.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [];
    const slot = id => { UI.sample = 's001'; newGame(); G.lootQueue = []; G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); return G.weapons[0]; };
    const titles = (w, lv) => wupForkCards({ w, lv }).map(c => c.title);
    // Red Flagship: Packet Loss never offered.
    let w = slot('v_shock_beam'); w.up = { p: 'C' }; if (titles(w, 6).includes('Packet Loss')) bad.push('Packet Loss offered');
    // Soulmate Signal on A: no Conjoined Twins.
    w = slot('s_twin'); w.up = { p: 'A' }; if (titles(w, 10).includes('Conjoined Twins')) bad.push('Conjoined Twins on A');
    // Standard Issue Through and Through: no Homing modifier.
    w = slot('v_phys_proj'); w.up = { p: 'B' }; if (modCardOk(w, 'homing')) bad.push('Homing on Through and Through');
    w.up = { p: 'A' }; if (!modCardOk(w, 'homing')) bad.push('Homing blocked on Ricochet Brain');
    // Switched at Birth: never on a status-bound weapon; no card when only those are held.
    slot('v_ice_pool'); if (sabCard()) bad.push('Switched at Birth on Nocturnal Emission');
    if (modDraftCands('level').some(c => c.fam === 'switch')) bad.push('switch candidate with only status weapons');
    slot('v_phys_proj'); const c = sabCard(); if (!c) bad.push('no Switched at Birth on Standard Issue');
    return bad;
  });
  console.log(r.length ? 'FAIL ' + r.join('; ') : 'fit check ok'); console.log('ERRORS', JSON.stringify(errors));
  await b.close(); process.exit(r.length || errors.length ? 1 : 0);
})();
