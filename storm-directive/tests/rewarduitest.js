// The card language (rewardui.js), the Build panel (buildpanel.js) and the 15-minute race (race15.js): every v10 card
// has a type colour and an icon, Feat/mutation/modifier/defence cards carry a fit line, the Build panel lists
// weapons, Feats and the Genome, the egg opens at 15:00, the rival track draws in Immersive mode and its standings
// slow the slide to 10%, and the waiting badge counts held rewards. Screenshots: out/rwcards.png, rwbuild.png,
// rwtrack.png, rwboard.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    META.seenSt = META.seenSt || {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9;
    if (!G.weapons.some(Boolean)) genLoot({ kind: 'start' })[0].apply();
    // 1. Icons and fit lines across many drafts.
    const cats = {}, noIco = new Set(), noFit = new Set();
    for (let i = 0; i < 80; i++) for (const o of genLoot({ kind: i % 3 ? 'level' : 'chest' })) {
      const c = rwCatOf(o); cats[c || 'none:' + o.tag] = (cats[c || 'none:' + o.tag] || 0) + 1;
      if (!o.def && !rwIco(o)) noIco.add(o.tag + ':' + o.title);
      if (['feat', 'mutation', 'modifier', 'defence', 'special', 'switch'].includes(c) && !rwFitHtml(o)) noFit.add(o.tag + ':' + o.title);
    }
    out.cats = cats;
    if (Object.keys(cats).some(k => k.startsWith('none'))) bad.push('cards with no type: ' + Object.keys(cats).filter(k => k.startsWith('none')));
    if (noIco.size) bad.push('cards with no icon: ' + [...noIco].slice(0, 6));
    if (noFit.size) bad.push('cards with no fit line: ' + [...noFit].slice(0, 6));
    // 2. The mutation screen and a swap get icons and fit lines too.
    const mc = genLoot({ kind: 'mutation' });
    out.mut = mc.map(o => rwIco(o) + ' | ' + (rwFit(o) || {}).k);
    if (mc.some(o => !rwIco(o) || !rwFit(o))) bad.push('mutation cards: ' + out.mut);
    // 3. The Build panel.
    G.level = 9; const html = bpHtml();
    for (const k of ['Arsenal', 'Feats', 'Genome', 'Next', 'The egg opens in']) if (!html.includes(k)) bad.push('Build panel missing ' + k);
    // 4. The egg at 15:00.
    G.level = 20; G.t = 899; out.egg899 = eggBreakable(); G.t = 900; out.egg900 = eggBreakable();
    if (out.egg899 || !out.egg900) bad.push('egg timer: ' + [out.egg899, out.egg900]);
    raceTick(); if (!G.race || G.race.openT == null) bad.push('raceTick did not note the egg opening');
    G.t = 300; G.race = null;
    G.level = EGG.level; raceTick(); out.bonus = raceDnaBonus(G, true);
    if (out.bonus !== 10 * RACE15.early) bad.push('early bonus: ' + out.bonus);
    G.level = 20; G.race = null;
    out.clock = raceClock(5, 0);
    if (!/^EGG 10:00$/.test(out.clock)) bad.push('clock: ' + out.clock);
    // 5. Waiting badge counts held rewards.
    G.lootQueue = [{ kind: 'level' }, { kind: 'chest' }, { kind: 'fork' }];
    out.wait = G.lootQueue.filter(q => RW_WAIT.has(q.kind)).length;
    if (out.wait !== 2) bad.push('waiting count: ' + out.wait);
    return { bad, out };
  });
  // Screenshots: a level draft, the Build panel, the rival track and its standings.
  await page.evaluate(() => { G.lootQueue = []; G.t = 300; UI.openLoot({ kind: 'level' }); });
  await page.waitForTimeout(1300); await page.screenshot({ path: 'rwcards.png' });
  const ui = await page.evaluate(() => {
    const bad = [];
    if (!document.querySelector('#lootCards .card.rw')) bad.push('no typed cards on screen');
    if (document.querySelectorAll('#lootCards .card .cico').length < document.querySelectorAll('#lootCards .card').length) bad.push('a card on screen has no icon');
    UI.pickLoot(0);
    if (!G.fx.some(f => f.type === 'ring')) bad.push('no pick ring');
    G.state = 'pause'; UI.pauseTab = 'build'; UI.renderPause(); UI.show('pause');
    return bad;
  });
  await page.waitForTimeout(300); await page.screenshot({ path: 'rwbuild.png' });
  const tr = await page.evaluate(async () => {
    const bad = [];
    UI.show('hud'); G.state = 'play'; SET.immersive = true; document.body.classList.add('immersive');
    while (G.rivalIn < 4 && rivalArrive()) { /* bring rivals in */ }
    G.lootQueue = [{ kind: 'level' }, { kind: 'mutation' }]; G.dir = { t: G.t };
    for (let i = 0; i < 3; i++) { update(1 / 60); render(); }
    if (!UI.raceRect) bad.push('rival track not drawn');
    return { bad, rect: UI.raceRect };
  });
  await page.waitForTimeout(200); await page.screenshot({ path: 'rwtrack.png' });
  const bd = await page.evaluate(() => {
    const bad = [], R = UI.raceRect;
    if (R) raceTap({ clientX: R.x + R.w / 2, clientY: R.y + R.h / 2 }); else raceBoardOpen();
    if (!G.raceBoard || !document.querySelector('#raceBoard.on')) bad.push('standings did not open');
    if (Math.abs(inspectMul() - 0.1) > 1e-6) bad.push('slide not at 10%: ' + inspectMul());
    if (document.querySelectorAll('#raceBoard .rb-row').length < 2) bad.push('standings rows: ' + document.querySelectorAll('#raceBoard .rb-row').length);
    return bad;
  });
  await page.waitForTimeout(200); await page.screenshot({ path: 'rwboard.png' });
  const cl = await page.evaluate(() => { raceBoardClose(); return G.raceBoard || inspectMul() !== 1 ? ['standings did not close'] : []; });
  const all = [...r.bad, ...ui, ...tr.bad, ...bd, ...cl];
  console.log(JSON.stringify(r.out));
  if (all.length) console.log('FAIL', all.join('; '));
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
