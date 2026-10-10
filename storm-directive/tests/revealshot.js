// The sequence-decoded ceremony and story (seqreveal.js), from the end of a run that unlocks the Twins.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's002'; newGame(); G.state = 'play'; META.beatTwins = 1; UI.showGameOver(false); });
  await page.waitForTimeout(1500); await page.screenshot({ path: 'reveal0.png' });
  await page.waitForTimeout(1800); await page.screenshot({ path: 'reveal1.png' });
  const st = [];
  for (let i = 0; i < 3; i++) { await page.evaluate(() => document.querySelector('#srBtns .btn.primary').click()); await page.waitForTimeout(500); st.push(await page.evaluate(() => document.getElementById('srKick').textContent)); await page.screenshot({ path: `reveal${i + 2}.png` }); }
  await page.evaluate(() => document.querySelector('#srBtns .btn.primary').click()); await page.waitForTimeout(400);
  const end = await page.evaluate(() => ({ screen: document.getElementById('seqsel').classList.contains('on') || getComputedStyle(document.getElementById('seqsel')).display !== 'none', profile: META.profile, overlay: document.getElementById('seqReveal').className, story: !!document.getElementById('sqStory') }));
  if (st.join('|') !== 'THEIR STORY  1/3|THEIR WEAPONS  2/3|THEIR GIFT  3/3' || end.profile !== 'twins' || end.overlay || !end.story) console.log('FAIL', st, end);
  console.log(JSON.stringify({ st, end }), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
