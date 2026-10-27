// Attack types lock (atklock.js): a weapon with Melee, Ranged, Mines or Orbiting is never offered another; an
// attack-type card shown and not taken is never offered again this run; a fresh tap on one asks first.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    const w = makeSlot('v_phys_proj', false, 1); w.lvl = 9; G.weapons = [w];
    if (!modOk(w, 'melee') || !modOk(w, 'mines') || !modOk(w, 'orbiting')) bad.push('attack types not open on a fresh weapon');
    // 1. Lock: Melee held, no other attack type; Melee itself still ranks up.
    modAdd(w, 'melee');
    if (modOk(w, 'mines') || modOk(w, 'orbiting')) bad.push('another attack type offered after Melee');
    if (!modOk(w, 'melee')) bad.push('Melee rank-up refused');
    // 2. Decline: a screen showing Mines and Orbiting on a second weapon; Mines taken, Orbiting declined.
    const v = makeSlot('v_fire_proj', false, 1); v.lvl = 9; G.weapons = [w, v];
    const req = { kind: 'level' }, mk = id => Object.assign(modCard(v, id), { family: 'mod:' + id });
    G.state = 'loot'; UI.lootReq = req; UI.lootOpts = [mk('mines'), mk('orbiting')]; UI.renderLootCards();
    if (!UI.lootOpts[1].warn) bad.push('new attack-type card not marked');
    UI.lastDown = 0; UI.pickLoot(0);
    out.atkNo = G.atkNo; out.v = v.m10;
    if (!modHas(v, 'mines')) bad.push('Mines not taken');
    if (!(G.atkNo || []).includes('orbiting') || (G.atkNo || []).includes('mines')) bad.push('declines wrong: ' + JSON.stringify(G.atkNo));
    const x = makeSlot('v_arcane_proj', false, 1); x.lvl = 9; G.weapons.push(x);
    if (modOk(x, 'orbiting')) bad.push('declined Orbiting offered again');
    if (!modOk(x, 'mines')) bad.push('Mines (taken, not declined) refused on a fresh weapon');
    // 3. Reroll away an attack-type card: declined too.
    G.atkNo = []; G.state = 'loot'; UI.lootReq = { kind: 'level' }; UI.lootOpts = [Object.assign(modCard(x, 'mines'), { family: 'mod:mines' })]; UI.renderLootCards();
    UI.lootOpts = [mk('homing')]; UI.renderLootCards();
    if (!G.atkNo.includes('mines')) bad.push('rerolled-away card not declined');
    // 4. A fresh tap asks first; YES applies it.
    G.atkNo = []; const y = makeSlot('v_phys_spread', false, 1); y.lvl = 9; G.weapons = [y];
    G.state = 'loot'; UI.lootReq = { kind: 'level' }; UI.lootOpts = [Object.assign(modCard(y, 'mines'), { family: 'mod:mines' })]; UI.renderLootCards();
    UI.lastDown = performance.now(); UI.pickLoot(0);
    const ask = document.getElementById('atlAsk');
    if (!ask || modHas(y, 'mines')) bad.push('no confirm on a fresh tap');
    else { out.ask = ask.textContent; ask.querySelector('[data-atl="yes"]').click(); if (!modHas(y, 'mines')) bad.push('YES did not apply'); }
    // 5. The Sandbox keeps the swap.
    SET.noLimits = true; const z = makeSlot('v_phys_proj', false, 1); z.m10 = ['melee']; G.atkNo = ['mines'];
    if (!modOk(z, 'mines')) bad.push('no-limits play lost the swap'); SET.noLimits = false;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length || errors.length) console.log('FAIL', r.bad, 'ERRORS', errors);
  else console.log('PASS atklocktest');
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
