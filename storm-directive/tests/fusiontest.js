// The combo unlock (fusion.js): two weapons at Lv 5 stop the game for the combo alone (never a card in a box),
// the animation plays, FUSE THEM fuses it, and the bonus mount draft follows.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r0 = await page.evaluate(() => {
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
    META.combos = {};
    G.weapons = [makeSlot('blaster', false, 5), makeSlot('seeker', false, 4), null]; recomputeAll();
    // Boxes never carry a combo card, even with a combo ready.
    owned('seeker').lvl = 5; let boxCombo = 0;
    for (let i = 0; i < 40; i++) boxCombo += genLoot({ kind: 'level' }).filter(o => o.fusion).length;
    owned('seeker').lvl = 4;
    update(1 / 30); const before = G.lootQueue.length;
    owned('seeker').lvl = 5; G.fusionAt = 0; update(1 / 30);
    return { boxCombo, before, queued: JSON.stringify(G.lootQueue[0]) };
  });
  // Let the main loop open it.
  await page.waitForTimeout(800);
  const r1 = await page.evaluate(() => ({ state: G.state, cls: document.getElementById('fusion').className, kick: document.getElementById('fuKick').textContent }));
  await page.screenshot({ path: 'out/fusion0.png' });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: 'out/fusion1.png' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'out/fusion2.png' });
  const r2 = await page.evaluate(() => ({ cls: document.getElementById('fusion').className, name: document.getElementById('fuName').textContent, rows: [...document.querySelectorAll('#fuList .furow b')].map(x => x.textContent).join('|') }));
  await page.click('#fuGo'); await page.waitForTimeout(200);
  const r3 = await page.evaluate(() => ({ fused: !!G.combo.bigsib, cls: document.getElementById('fusion').className, mounts: G.comboMounts, next: G.lootQueue.map(q => q.kind).concat(UI.lootReq ? [UI.lootReq.kind] : []).join(','), state: G.state, known: !!META.combos.bigsib }));
  // Not asked twice in a run.
  const r4 = await page.evaluate(() => { G.state = 'play'; G.lootQueue = []; G.fusionAt = 0; update(1 / 30); return G.lootQueue.filter(q => q.kind === 'combo').length; });
  // The build-up, mid-charge (a second combo, opened directly and held at 1.25s).
  await page.evaluate(() => { G.state = 'play'; G.lootQueue = []; G.weapons.push(makeSlot('tesla', false, 6), makeSlot('void', false, 6)); recomputeAll(); fusionOpen({ kind: 'combo', id: 'teacup' }); FUSION.t0 = performance.now() - 1250; });
  await page.waitForTimeout(30); await page.screenshot({ path: 'out/fusionC.png' });
  const ok = r0.boxCombo === 0 && r0.before === 0 && /combo.*bigsib/.test(r0.queued) && r1.cls.includes('on') && r2.cls.includes('fused') && r2.name === 'BIG SIBLING' && r2.rows.startsWith('NEW POWER') && r2.rows.includes('BONUS WEAPON MOUNT') && r3.fused && !r3.cls && r3.mounts === 1 && r3.next.includes('slot') && r4 === 0;
  if (!ok) console.log('FAIL', JSON.stringify({ r0, r1, r2, r3, r4 }));
  console.log(ok ? 'OK' : 'BAD', JSON.stringify(r2), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
