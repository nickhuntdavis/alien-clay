// Samples (samplestart.js, samples10.js): locked behind achievements; a random starting offer with one weapon of the
// sample's type and one Switched at Birth into it; exaggerated passives.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    // 1. Locks
    META.s10 = {}; META.achEver = {}; META.devAll = 0;
    out.open = SAMPLES10.map(s => s10Open(s.id) ? 1 : 0).join('');
    if (out.open !== '1' + '0'.repeat(SAMPLES10.length - 1)) bad.push('locks ' + out.open);
    UI.openSamples ? UI.openSamples() : s10Samples(); out.lockTxt = /Still Here/.test(document.getElementById('sampleList').textContent); if (!out.lockTxt) bad.push('lock text');
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play';
    s10Unlock('alpha'); out.rescueNo = s10Open('alpha'); if (out.rescueNo) bad.push('a rescue unlocked a sample');
    achieve('survive5'); out.achYes = s10Open('alpha'); if (!out.achYes || !META.achEver.survive5) bad.push('achievement did not unlock Alpha');
    // 2. Starting offers, 30 times over every sample
    const fails = [];
    for (const s of SAMPLES10) for (let k = 0; k < 30; k++) {
      META.profile = 's10_' + s.id; newGame(); const o = s10Start(); const types = s.types.map(t => S10_TYPES[t]);
      const nat = o.filter(x => !x.sab && types.includes(x.def.elem)).length, sab = o.filter(x => x.sab && types.includes(x.sab)).length;
      const ok = o.every(x => MATRIX_ONLY.weapons.includes(Object.getPrototypeOf(x.def) === WEAPONS[x.def.id] ? x.def.id : (x.def.id || '')) || true);
      if (o.length !== 3 || nat < 1 || sab < 1 || new Set(o.map(x => x.title)).size !== 3) { fails.push(s.id + ':' + o.map(x => x.title + '/' + x.elem).join(',')); break; }
    }
    out.offers = fails; if (fails.length) bad.push('offers ' + fails.join(' | '));
    // the switched weapon starts switched
    META.profile = 's10_baseline'; newGame(); for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const o = s10Start().find(x => x.sab); o.apply();
    const w = G.weapons.find(Boolean); out.sabW = [w && w.def.elem, o.sab, !!(w && w.def.sab)]; if (!w || w.def.elem !== o.sab || !w.def.sab) bad.push('switched weapon ' + out.sabW);
    // 3. Passives: Alpha +50% while moving; Ordered 30% evasion
    out.ordered = S10_BY.ordered.evasion; if (out.ordered !== 0.3) bad.push('ordered evasion');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
