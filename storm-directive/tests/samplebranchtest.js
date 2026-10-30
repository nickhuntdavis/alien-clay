// Per-sample branch sets (samplebranches.js): a sample's own set replaces a weapon's branches only in that sample's runs.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + (i !== undefined ? ' [' + JSON.stringify(i) + ']' : '')); };
    const id = 'v_shock_beam', base = WUP[id];
    const C = (name) => ({ name, desc: 'x', apply: w => { (w.tst || (w.tst = [])).push(name); } });
    const spec = { A: { name: 'Test A', tag: '', lv3: { desc: 'a', apply: w => { w.tstP = 'A'; } }, lv6: [C('A6a'), C('A6b')], wild: C('Awild') },
      B: { name: 'Test B', tag: '', lv3: { desc: 'b', apply: () => {} }, lv6: [C('B6a'), C('B6b')], wild: C('Bwild') },
      C: { name: 'Test C', tag: '', lv3: { desc: 'c', apply: () => {} }, lv6: [C('C6a'), C('C6b')], wild: C('Cwild') }, lv10: [C('M1'), C('M2'), C('M3')] };
    if (!SBR.alt[id] || !SBR.alt[id].tst) wupRegFor('tst', id, spec);
    const run = sample => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.s10 = Object.assign({}, G.s10 || {}, { id: sample }); G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); return G.weapons[0]; };
    let w = run('baseline'); const t0 = genLoot({ kind: 'fork', w, lv: 3 }).map(c => c.title);
    chk('other samples keep the shared set', t0.join() === ['A', 'B', 'C'].map(k => base[k].name).join(), t0);
    w = run('tst'); const t1 = genLoot({ kind: 'fork', w, lv: 3 }).map(c => c.title);
    chk('the sample gets its own set', t1.join() === 'Test A,Test B,Test C', t1);
    genLoot({ kind: 'fork', w, lv: 3 })[0].apply(); chk('its card applies', w.tstP === 'A' && w.up.p === 'A');
    const t6 = genLoot({ kind: 'fork', w, lv: 6 }).map(c => c.title); chk('its Lv 6 cards', t6.join() === 'A6a,A6b,Awild', t6);
    chk('wupSpecFor reads either set without a run', wupSpecFor(id, 'tst').A.name === 'Test A' && wupSpecFor(id, 'baseline').A.name === base.A.name);
    G = null; chk('title screen: shared set', WUP[id] === base);
    wupReg(id, base); chk('wupReg still sets the shared set', WUP[id] === base && SBR.base[id] === base);
    chk('sbrSamplesOf', sbrSamplesOf(id).includes('tst'));
    delete SBR.alt[id].tst;
    return { bad };
  });
  if (errors.length) console.log('ERRORS', errors.slice(0, 3).join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; ')); else console.log('samplebranchtest OK');
  await b.close();
})();
