// Samples (samplestart.js, kinall.js, samples10.js): locked until you rescue one in a run and finish it (achievements no
// longer unlock them); the locked card says so (TODO_COPY:kin_lock_txt); the Ordered Online passive is unchanged.
// (The starting offer is typepools.js's now: typepoolstest.js covers it.)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    // 1. Locks: on a fresh save only Baseline (and the v9 samples, which were never locked) are open
    META.s10 = {}; META.achEver = {}; META.devAll = 0;
    const rack = SAMPLES10.filter(s => !s.v9);
    out.open = rack.map(s => s10Open(s.id) ? 1 : 0).join('');
    if (out.open !== '1' + '0'.repeat(rack.length - 1)) bad.push('locks ' + out.open);
    s10Samples(); const list = document.getElementById('sampleList').textContent;
    out.lockTxt = list.includes(KINALL_COPY.kin_lock_txt); if (!out.lockTxt) bad.push('lock text');
    // 2. Neither an achievement nor a direct unlock opens a sample; the earned achievement is still recorded
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play';
    s10Unlock('alpha'); if (s10Open('alpha')) bad.push('s10Unlock opened a sample');
    achieve('survive5'); out.achEver = !!META.achEver.survive5; if (s10Open('alpha') || !out.achEver) bad.push('achievement unlocked Alpha, or was not recorded');
    // a save from before (achievements remembered) does not open samples on its own either: nothing runs at load
    if (META.s10 && META.s10.alpha) bad.push('META.s10 written by an achievement');
    // 3. Opened by a rescue and a win (kinall.js; kinalltest.js covers every mode)
    genLoot({ kind: 'start' })[0].apply(); kinInit(); kinAbsorb('alpha'); if (s10Open('alpha')) bad.push('a rescue alone opened Alpha');
    victory({ x: 0, y: 0, r: 60 }); if (!s10Open('alpha')) bad.push('a rescue and a win did not open Alpha');
    META.s10 = {};
    // 4. Passives: Ordered 30% evasion
    out.ordered = S10_BY.ordered.evasion; if (out.ordered !== 0.3) bad.push('ordered evasion');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
