// The sperm button left of RUN opens the pause menu on the BUILD tab (buildbtn.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's002'; newGame(); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = []; G.state = 'play'; UI.show('hud'); UI.refreshHud(true); });
  await page.waitForTimeout(400);
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/buildbtn_hud.png') });
  const bad = [];
  const pos = await page.evaluate(() => { const s = document.getElementById('spermBtn').getBoundingClientRect(), m = document.getElementById('moveBtn').getBoundingClientRect(); return [s.width, s.right <= m.left + 1, s.top < m.bottom && s.bottom > m.top]; });
  if (!(pos[0] > 20 && pos[1] && pos[2])) bad.push('placement ' + pos);
  await page.evaluate(() => { const w = G.weapons.find(x => x && !x.isSpell), id = Object.keys(MODS10).find(k => modOk(w, k)); w.m10 = [id, id]; window._mid = MODS10[id].name; });
  await page.click('#spermBtn'); await page.waitForTimeout(300);
  const st = await page.evaluate(() => [G.state, UI.pauseTab, !!document.querySelector('#pauseBody .bp-h')]);
  const pp = await page.evaluate(() => { const t = [...document.querySelectorAll('#pauseBody .bp-tag')].find(x => x.textContent.includes(_mid)); return t ? [t.querySelectorAll('.bp-pips i').length, t.querySelectorAll('.bp-pips i.on').length] : null; });
  if (!pp || pp[0] !== 3 || pp[1] !== 2) bad.push('mod pips ' + JSON.stringify(pp));
  if (st[0] !== 'pause' || st[1] !== 'build' || !st[2]) bad.push('opens ' + st);
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/buildbtn_build.png') });
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
