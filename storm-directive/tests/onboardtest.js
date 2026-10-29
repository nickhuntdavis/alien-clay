// First-run setup (onboard.js): shown to a new player after the splash, three steps, demo split in two, then the title.
// Checks the choices are saved, META comes back as it was (plus obDone), and no run is left behind.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); const bad = [];
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => splashEnd()); await page.waitForTimeout(1500);
  const s0 = await page.evaluate(() => ({ on: OB.on, pane: !!document.getElementById('obPane'), state: G && G.state, split: OB.split && OB.split[0], meta: OB.meta }));
  if (!s0.on || !s0.pane || s0.state !== 'play' || s0.split !== 'view') bad.push('step 1 ' + JSON.stringify(s0).slice(0, 200));
  await page.waitForTimeout(2500); await page.screenshot({ path: 'onboard_1.png' });
  await page.click('[data-ob="view|arcade"]'); await page.waitForTimeout(2500); await page.screenshot({ path: 'onboard_2.png' });
  const s1 = await page.evaluate(() => ({ split: OB.split && OB.split[0], view: SET.view }));
  if (s1.split !== 'darkfield' || s1.view !== 'arcade') bad.push('step 2 ' + JSON.stringify(s1));
  await page.click('[data-ob="darkfield|1"]'); await page.waitForTimeout(2500); await page.screenshot({ path: 'onboard_3.png' });
  const s2 = await page.evaluate(() => ({ split: OB.split, df: SET.darkfield, sfx: SET.sfxVol, sliders: document.querySelectorAll('[data-obv]').length }));
  if (s2.split || !s2.df || s2.sfx !== 1 || s2.sliders !== 2) bad.push('step 3 ' + JSON.stringify(s2));
  await page.evaluate(() => { const r = document.querySelector('[data-obv="musVol"]'); r.value = 40; r.dispatchEvent(new Event('input')); });
  const before = await page.evaluate(() => { const m = JSON.parse(OB.meta); m.obDone = 1; return JSON.stringify(m); });
  await page.click('[data-obdone]'); await page.waitForTimeout(500);
  const s3 = await page.evaluate(() => ({ on: OB.on, G: !!G, title: document.getElementById('title').classList.contains('on'), set: JSON.parse(localStorage.getItem('sd_settings') || '{}'), meta: JSON.stringify(META), live: localStorage.getItem('sd_live'), again: obNeeded() }));
  if (s3.on || s3.G || !s3.title) bad.push('end ' + JSON.stringify([s3.on, s3.G, s3.title]));
  if (s3.set.view !== 'arcade' || s3.set.darkfield !== true || s3.set.musVol !== 0.4 || s3.set.sfxVol !== 1) bad.push('saved settings ' + JSON.stringify(s3.set));
  if (s3.meta !== before) bad.push('META changed by the demo');
  if (s3.again) bad.push('would show again');
  await page.screenshot({ path: 'onboard_4.png' });
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
