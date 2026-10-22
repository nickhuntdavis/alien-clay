// The Daily Challenge card on the Sample Rack and the Immune Response stepper on Mode Select (rackextras.js): the card
// starts today's daily on a v10 sample; the stepper moves META.heat within META.heatMax and the run carries it; weapon
// previews wear the paper class (eink.css inverts them on Paper menus).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.heatMax = 2; META.heat = 0; s10Samples();
    const card = document.querySelector('#sampleList [data-daily]');
    if (!card || !/DAILY CHALLENGE/.test(card.textContent)) bad.push('no daily card');
    if (!dailySetup().seq.startsWith('s10_')) bad.push('daily sample ' + dailySetup().seq);
    s10Modes('baseline');
    const up = document.querySelector('#s10Heat [data-h="1"]'); if (!up) bad.push('no stepper'); else { up.click(); document.querySelector('#s10Heat [data-h="1"]').click(); document.querySelector('#s10Heat [data-h="1"]').click(); }
    out.heat = META.heat; if (META.heat !== 2) bad.push('heat ' + META.heat);
    document.querySelector('#sampleList [data-mode="s002"]').click();
    out.run = G.heat; if (G.heat !== 2) bad.push('run heat ' + G.heat);
    for (let i = 0; i < 300; i++) { G.lootQueue = []; G.state = 'play'; update(1 / 60); }
    s10Samples(); document.querySelector('#sampleList [data-daily]').click();
    out.daily = G.daily; if (!G.daily || !G.s10) bad.push('daily start ' + G.daily + ' ' + (G.s10 && G.s10.id));
    for (let i = 0; i < 300; i++) { G.lootQueue = []; G.state = 'play'; update(1 / 60); }
    const cv = document.createElement('canvas'); document.body.appendChild(cv); makePreview(cv, WEAPONS.v_phys_proj, {});
    if (!cv.classList.contains('pvpaper')) bad.push('preview not on paper');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
