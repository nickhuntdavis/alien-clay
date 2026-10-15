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
  console.log(out.join('\n'));
  const ok = /^tap:true pause/.test(out[0]) && out[1] === 'closed:false play' && out[2] === 'drag:false' && out[3] === 'locked:true true' && /^half:play 0.5/.test(out[4]) && out[5] === 'chart:81 64';
  console.log(ok ? 'inspect ok' : 'FAIL inspect');
  console.log('ERRORS', errors.length ? errors.slice(0, 3) : '[]'); await b.close();
})();
