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
    // Standard Issue's branch fit rules went with its old branches (baseline1.js); Homing stays off it by the audit (moddead.js).
    // Switched at Birth: never on a status-bound weapon; no card when only those are held.
    slot('v_ice_pool'); { const c = sabCard(); if (!c || c.elem !== 'soul') bad.push('Nocturnal Emission must switch to Parasite only: ' + (c && c.elem)); }
    slot('v_phys_proj'); const c = sabCard(); if (!c) bad.push('no Switched at Birth on Standard Issue');
    // The Runs: may switch, but only to Static, and its cards then say so.
    w = slot('s_wake'); const r = sabCard(); if (!r || r.elem !== 'shock') bad.push('The Runs not offered Static: ' + (r && r.elem));
    else { r.apply(); w.up = { p: 'B' }; const d = wupForkCards({ w, lv: 6 }).map(c => c.desc).join(' '); if (!/circuit/.test(d)) bad.push('Static text missing'); }
    w = slot('v_arcane_proj'); const v = sabCard(); if (!v || v.elem !== 'soul') bad.push('Little Prick not offered Parasite: ' + (v && v.elem));
    else { v.apply(); w.up = { p: 'A' }; const d = wupForkCards({ w, lv: 6 }).map(c => c.desc).join(' '); if (!/pincushion/.test(d)) bad.push('voodoo text missing'); }
    return bad;
  });
  console.log(r.length ? 'FAIL ' + r.join('; ') : 'fit check ok'); console.log('ERRORS', JSON.stringify(errors));
  await b.close(); process.exit(r.length || errors.length ? 1 : 0);
})();
