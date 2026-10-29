// Whispers (whisper.js): in Immersive, voice lines wait behind an indicator; a tap reveals the line at 10% speed.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => UI.quickStart()); /* (Quick Start's button is now Sandbox: sandbox.js) */ await page.waitForTimeout(1200);
  const imm = await page.evaluate(() => { SET.immersive = true; UI.applySettings && UI.applySettings(); document.body.classList.add('immersive'); G.show.msgQ.length = 0; UI.msgT = 0; vxPush('sci', 'The egg is out there. We can feel it. Swim.', null, 6); return immersiveOn(); });
  await page.waitForTimeout(600);
  const s1 = await page.evaluate(() => ({ dot: $('wsDot') && $('wsDot').classList.contains('on'), who: $('wsDot') && $('wsDot').dataset.who, box: $('sysmsg').classList.contains('on'), mul: inspectMul() }));
  await page.screenshot({ path: 'out/ws_dot.png', clip: { x: 0, y: 460, width: 400, height: 240 } });
  await page.click('#wsDot'); await page.waitForTimeout(600);
  const s2 = await page.evaluate(() => ({ box: $('sysmsg').classList.contains('on'), who: $('sysmsg').dataset.who, mul: inspectMul(), dot: $('wsDot').classList.contains('on') }));
  await page.screenshot({ path: 'out/ws_open.png', clip: { x: 0, y: 460, width: 400, height: 240 } });
  await page.click('#sysmsg'); await page.waitForTimeout(300);
  const s3 = await page.evaluate(() => ({ box: $('sysmsg').classList.contains('on'), mul: inspectMul() }));
  console.log(imm, JSON.stringify(s1), JSON.stringify(s2), JSON.stringify(s3));
  if (!imm || !s1.dot || s1.who !== 'sci' || s1.box || s1.mul !== 1) errors.push('indicator');
  if (!s2.box || s2.who !== 'sci' || Math.abs(s2.mul - 0.1) > 1e-9 || s2.dot) errors.push('reveal');
  if (s3.box || s3.mul !== 1) errors.push('close');
  console.log(errors.length ? 'FAIL ' + errors.join(' | ') : 'ok'); await b.close(); if (errors.length) process.exit(1);
})();
