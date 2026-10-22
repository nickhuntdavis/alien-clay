// Tapping the left half of the autorun button or a weapon slot steps back through the options, the right half
// steps forward, and an arrow flashes on that side (ui.js tapSide).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.weapons = [makeSlot('blaster', false, 3), makeSlot('shotgun', false, 3), makeSlot('seeker', false, 3), makeSlot('glaive', false, 3)]; recomputeAll(); UI.refreshHud(true); G.debug = { freeze: true }; });
  const R = {};
  const tap = async (sel, side) => { const bb = await page.locator(sel).boundingBox(); await page.mouse.click(bb.x + bb.width * (side < 0 ? 0.2 : 0.8), bb.y + bb.height / 2); await page.waitForTimeout(60); };
  const mv = () => page.evaluate(() => MOVE_DIRECTIVES.findIndex(m => m.id === G.moveDir));
  const wd = () => page.evaluate(() => DIRECTIVES.findIndex(d => d.id === G.weapons[0].dir));
  const n = await page.evaluate(() => [MOVE_DIRECTIVES.length, DIRECTIVES.length]);
  let m0 = await mv(); await tap('#moveBtn', 1); R.moveFwd = (await mv()) === (m0 + 1) % n[0];
  R.arrowR = await page.evaluate(() => !!document.querySelector('#moveBtn .tapArrow.r'));
  await page.screenshot({ path: 'tapcycle.png' });
  m0 = await mv(); await tap('#moveBtn', -1); R.moveBack = (await mv()) === (m0 - 1 + n[0]) % n[0];
  let w0 = await wd(); await tap('#wslots .slot:nth-child(1)', -1); R.wBack = (await wd()) === (w0 - 1 + n[1]) % n[1];
  R.arrowL = await page.evaluate(() => !!document.querySelector('#wslots .slot .tapArrow.l'));
  w0 = await wd(); await tap('#wslots .slot:nth-child(1)', 1); R.wFwd = (await wd()) === (w0 + 1) % n[1];
  await page.waitForTimeout(700); R.gone = await page.evaluate(() => document.querySelectorAll('.tapArrow').length === 0);
  R.oneRow = await page.evaluate(() => { const r = [...$('wslots').children].slice(0, 4).filter(x => x.offsetParent).map(x => x.getBoundingClientRect()); return new Set(r.map(b => Math.round(b.top))).size === 1 || new Set(r.map(b => Math.round(b.left))).size === 1; }); // (one row, or one column: the Immersive portrait dock stacks round weapon keys bottom-right)
  const ok = Object.values(R).every(Boolean);
  if (!ok) console.log('FAIL', JSON.stringify(R));
  console.log(JSON.stringify(R), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
