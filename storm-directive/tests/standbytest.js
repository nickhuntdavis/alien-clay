// Standby (standby.js): a blank slate. Only Zero on the sample screen; a run as Zero starts with the placeholder Shot; no box ever opens.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html') + '?standby');
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    out.samples = SAMPLES10.map(s => s.id); if (out.samples.join() !== 'zero') bad.push('samples ' + out.samples);
    s10Samples(); out.cards = [...document.querySelectorAll('#sampleList [data-s10]')].map(x => x.dataset.s10); if (out.cards.join() !== 'zero') bad.push('sample screen ' + out.cards);
    if (!S10_BY.alpha || !S10_BY.baseline) bad.push('parked samples lost from S10_BY');
    META.seen = META.seen || {}; UI.sample = 's002'; META.profile = 's10_zero'; UI.startGame(true); G.state = 'play'; out.primary = G.genes && G.genes.primary;
    const drain = () => { let n = 0; while (G.lootQueue.length && n++ < 50) { const q = G.lootQueue[0], vb = v10Box(q); if (vb === 'wait') break; G.lootQueue.shift(); if (vb) UI.openLoot(q); } }; // (the frame loop's box step, game.js)
    drain();
    out.weapons = G.weapons.filter(Boolean).map(w => w.def.name); if (out.weapons.join() !== 'Shot') bad.push('weapons ' + out.weapons);
    if (!G.s10 || G.s10.id !== 'zero') bad.push('not a Zero run');
    for (const k of ['level', 'chest', 'boss', 'vesicle', 'branch', 'slot']) G.lootQueue.push({ kind: k, uid: G.weapons[0].uid, lvl: 3 });
    drain(); for (let i = 0; i < 60; i++) update(1 / 60);
    out.queue = G.lootQueue.length; out.state2 = G.state; if (G.lootQueue.length || G.state !== 'play') bad.push('a box opened or stuck: ' + G.state + ' ' + G.lootQueue.length);
    out.kin = typeof kinChoose === 'function' ? kinChoose() : 'n/a'; if (out.kin) bad.push('a rescue was offered ' + out.kin);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out)); if (errors.length) r.bad.push('ERRORS ' + errors.slice(0, 3).join(' | '));
  if (r.bad.length) { console.log('FAIL ' + r.bad.join('; ')); process.exitCode = 1; } await b.close();
})();
