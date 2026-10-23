// The Race's upgrade schedule (raceplan.js): screens only at set times, banked level-ups raise the rarity floor,
// milestones at 5:00 and 10:00, phase weights; other modes unchanged.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    out.on = rplanOn(); if (!out.on) bad.push('race not detected');
    G.t = 10; out.early = dirGate({ kind: 'level' }); if (out.early !== 'wait') bad.push('opened before 0:30');
    G.t = 31; out.first = dirGate({ kind: 'level' }); if (out.first !== true) bad.push('first slot ' + out.first);
    G.t = 32; out.again = dirGate({ kind: 'chest' }); if (out.again !== 'wait') bad.push('second screen in the same slot');
    G.t = 72; const a = { kind: 'level' }; G.lootQueue = [a, { kind: 'level' }, { kind: 'level' }, { kind: 'chest' }];
    out.bank = dirGate(a); out.left = G.lootQueue.map(q => q.kind).join(); out.boost = a.boost;
    if (out.bank !== true || out.left.split(',').filter(k => k === 'level').length !== 1 || a.boost !== 1) bad.push('banking ' + JSON.stringify([out.bank, out.left, a.boost]));
    out.fork = (G.t = 73, dirGate({ kind: 'fork' })); if (out.fork !== true) bad.push('fork held back');
    G.lootQueue = []; G.t = 301; v10Tick(1 / 60); const m = G.lootQueue.find(q => q.mstone); out.ms = m && [m.mstone, m.boost];
    if (!m || m.mstone !== 5) bad.push('milestone at 5:00');
    const titles = { level: ['x', 'y'] }; dirTitle(m, titles); out.title = titles.level[0]; if (!/MILESTONE/.test(out.title)) bad.push('milestone title');
    G.lootQueue = []; G.rplan.used = RPLAN.at.findIndex(t => t > 302); G.t = RPLAN.at[G.rplan.used] + 1; v10Tick(1 / 60); out.sched = G.lootQueue.map(q => q.kind).join(); if (out.sched !== 'level') bad.push('empty slot ' + out.sched);
    // other modes: unchanged
    UI.sample = 's002'; newGame(); G.state = 'play'; out.wave = rplanOn(); if (out.wave) bad.push('on in wave mode');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
