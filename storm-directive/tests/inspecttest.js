const { chromium } = require('playwright');
// Tap to inspect: a quick tap on an enemy opens its card; a drag does not; an unmet enemy is locked.
(async () => {
  const b = await chromium.launch(); const errors = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.weapons = G.weapons.map(() => null); G.spells = []; // (nothing shoots the target about)
    G.enemies.length = 0; const p = G.player; window.__e = makeEnemy(ENEMIES.brute, p.x + 90, p.y - 90); G.enemies.push(window.__e); G.paused = 0; for (let i = 0; i < 3; i++) update(1 / 30); });
  const pos = async () => page.evaluate(() => ({ x: sx(__e.x), y: sy(__e.y) }));
  const out = [];
  // 1. a tap opens the card and pauses the game
  let p = await pos(); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); await page.waitForTimeout(150);
  out.push(await page.evaluate(() => 'tap:' + INSPECT.open + ' ' + G.state + ' ' + document.getElementById('inspect').innerText.replace(/\s+/g, ' ').slice(0, 90)));
  await page.screenshot({ path: 'inspect.png' });
  await page.evaluate(() => INSPECTOR.close());
  out.push(await page.evaluate(() => 'closed:' + INSPECT.open + ' ' + G.state));
  // 2. a drag does not
  p = await pos(); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + 40, p.y + 5, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(150);
  out.push(await page.evaluate(() => 'drag:' + INSPECT.open));
  // 3. an unmet enemy is locked
  await page.evaluate(() => { META.seen = {}; });
  p = await pos(); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.waitForTimeout(40); await page.mouse.up(); await page.waitForTimeout(150);
  out.push(await page.evaluate(() => 'locked:' + INSPECT.open + ' ' + /Not met yet/.test(document.getElementById('inspect').innerText)));
  await page.evaluate(() => INSPECTOR.close());
  // 4. half speed keeps the game in play, and a damage type card opens the chart
  await page.evaluate(() => { SET.inspect = 'half'; META.seen.brute = 1; INSPECTOR.elem('fire'); });
  out.push(await page.evaluate(() => 'half:' + G.state + ' ' + inspectMul()));
  await page.evaluate(() => { document.querySelector('#inspect [data-insp="rx:"]').click(); });
  out.push(await page.evaluate(() => 'chart:' + document.querySelectorAll('#inspect .rxc').length + ' ' + document.querySelectorAll('#inspect .rxc.unk').length));
  await page.evaluate(() => { inspectSeeRx('bath'); INSPECTOR.close(); SET.inspect = 'pause'; });
  out.push(await page.evaluate(() => 'seenRx:' + JSON.stringify(META.seenRx)));
  // 5. Active effects: a Snared, Bleeding, Burning enemy lists all three; a row opens its Field Guide line; HALF keeps it live
  await page.evaluate(() => { const e = __e; e.snareT = G.t + 2; e.bleeds = [{ dps: 10, t: 3, by: 'Little Prick' }]; const c = fightCd(e); c.burnPool = 30; c.burnT = 3; c.bars.force = 0.5; INSPECTOR.foe(e); });
  out.push(await page.evaluate(() => 'fx:' + [...document.querySelectorAll('#inspect .irow .ichip')].map(b => b.innerText.split(' ')[0]).join(',')));
  await page.evaluate(() => document.querySelector('#inspect [data-insp="gl:Snared"]').click());
  out.push(await page.evaluate(() => 'gl:' + /Snared/.test(document.querySelector('#inspect h3').innerText) + ' ' + INSPECT.hist.length));
  await page.evaluate(() => { INSPECTOR.close(); SET.inspect = 'half'; __e.snareT = 0; INSPECTOR.foe(__e); __e.snareT = G.t + 5; for (let i = 0; i < 20; i++) update(1 / 30); });
  out.push(await page.evaluate(() => 'live:' + /Snared/.test(document.getElementById('inspect').innerText)));
  await page.evaluate(() => { INSPECTOR.close(); SET.inspect = 'pause'; });
  console.log(out.join('\n'));
  const ok = /^fx:Burn.*Bleeding.*Snared.*Poise/.test(out[7] || '') && out[8] === 'gl:true 2' && out[9] === 'live:true' && /^tap:true pause/.test(out[0]) && out[1] === 'closed:false play' && out[2] === 'drag:false' && out[3] === 'locked:true true' && /^half:play 0.5/.test(out[4]) && out[5] === 'chart:49 42';
  console.log(ok ? 'inspect ok' : 'FAIL inspect');
  console.log('ERRORS', errors.length ? errors.slice(0, 3) : '[]'); await b.close();
})();
