// Only the Laser may hold Piercing and Ricochet together (atkswap.js); the second takes its own slot. Other weapons: one Flight modifier.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    const w = G.weapons[0] = makeSlot('v_flame_beam', false, 1); w.m10 = []; w.lvl = 1; computeStats(w);
    out.slots = mmSlots(w);
    modAdd(w, 'piercing'); out.ricOk = modOk(w, 'ricochet'); out.homOk = modOk(w, 'homing');
    if (!out.ricOk || out.homOk) bad.push('pair ' + [out.ricOk, out.homOk]);
    modAdd(w, 'ricochet'); out.held = [...mmHeld(w)].join(); out.room = modOk(w, 'rapid');
    out.slots2 = mmSlots(w); if (out.room !== (mmHeld(w).size < mmSlots(w))) bad.push('slot count ' + [out.room, out.slots2]); w.lvl = 1; out.room1 = modOk(w, 'rapid'); if (out.room1) bad.push('second took no slot');
    const w2 = makeSlot('v_flame_beam', false, 1); w2.m10 = []; w2.lvl = 1; G.weapons[1] = w2; computeStats(w2);
    modAdd(w2, 'ricochet'); out.rev = modOk(w2, 'piercing'); if (!out.rev) bad.push('ricochet then piercing');
    const w3 = makeSlot('v_phys_proj', false, 1); w3.m10 = []; w3.lvl = 1; G.weapons[2] = w3; computeStats(w3);
    modAdd(w3, 'piercing'); out.other = modOk(w3, 'ricochet'); if (out.other) bad.push('non-Laser weapon got both');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
