// Screenshot of the narrator look: the lab-log panel (the inner-voice look was retired, 29 Oct 2026).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => UI.quickStart()); /* (Quick Start's button is now Sandbox: sandbox.js) */ await page.waitForTimeout(1200);
  for (const who of ['sci']) {
    const r = await page.evaluate(w => { SET.immersive = false; document.body.classList.remove('immersive'); G.show.msgQ.length = 0; UI.msgT = 0; vxPush(w, w === 'sci' ? 'Sample 1A placed on the slide. The slide has not been cleaned since Tuesday.' : 'The egg is out there. You can feel it. Swim.', null, 9); return true; }, who);
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => { const x = $('sysmsg'); return { who: x.dataset.who, on: x.classList.contains('on'), head: x.querySelector('b').textContent, vis: getComputedStyle(x.querySelector('b')).display }; });
    console.log(who, JSON.stringify(st));
    if (st.who !== who || !st.on) errors.push('wrong look for ' + who);
    const bb = await (await page.$('#sysmsg')).boundingBox(); console.log(JSON.stringify(bb)); await page.screenshot({ path: 'out/veil_' + who + '.png', clip: { x: 0, y: Math.max(0, bb.y - 40), width: 400, height: bb.height + 80 } });
  }
  console.log(errors.length ? 'FAIL ' + errors.join(' | ') : 'ok'); await b.close();
})();
