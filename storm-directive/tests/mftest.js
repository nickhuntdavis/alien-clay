// Manual fire (manualfire.js): with autofire OFF a weapon stays quiet until its FIRE button is held; Rewind sits on the left.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.autoFire = false; }); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's010'; UI.startGame(false); G.lootQueue = []; genLoot({ kind: 'start' })[0].apply(); G.state = 'play'; UI.show('hud'); UI.refreshHud(true); });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const bad = [], w = G.weapons.find(Boolean);
    for (let i = 0; i < 5; i++) debugSpawn(Object.keys(ENEMIES)[0]);
    const f0 = w.firedT; for (let i = 0; i < 60; i++) update(1 / 30);
    if (w.firedT !== f0) bad.push('fired with autofire off');
    const btn = document.querySelector('#fireCol button');
    if (!btn) bad.push('no FIRE button');
    else {
      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      for (let i = 0; i < 60; i++) update(1 / 30);
      if (w.firedT === f0) bad.push('did not fire while held');
      btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    }
    const rw = $('rewindBtn').getBoundingClientRect(); if (rw.left > 200) bad.push('rewind not on the left: ' + rw.left);
    return bad;
  });
  if (r.length) console.log('FAIL', r.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.length || errors.length) process.exit(1);
})();
