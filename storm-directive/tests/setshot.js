// Settings overhaul (v9.20): every tab renders, (?) opens a hint, rows dim when they do nothing, sliders set volumes,
// old saves migrate (sound off -> both volumes 0), Reset settings restores defaults. Screenshots of each tab.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  const url = 'file://' + require('path').resolve(__dirname, '../web/index.html');
  await page.goto(url);
  await page.evaluate(() => localStorage.setItem('sd_settings', JSON.stringify({ sound: false, cDanger: 'off', speed: 1.5 })));
  await page.reload(); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const fails = [];
  const mig = await page.evaluate(() => ({ sfx: SET.sfxVol, mus: SET.musVol, speed: SET.speed, on: AUDIO.on, c: 'cDanger' in SET }));
  console.log('migrated', JSON.stringify(mig));
  if (mig.sfx !== 0 || mig.mus !== 0 || mig.speed !== 1.5 || mig.on || mig.c) fails.push('migration');
  await page.evaluate(() => UI.openSettings('title'));
  for (const t of ['game', 'screen', 'sound', 'data']) {
    await page.click(`[data-stab="${t}"]`);
    const n = await page.evaluate(() => document.querySelectorAll('#setBody .setrow').length);
    if (!n) fails.push('empty tab ' + t);
    await page.screenshot({ path: `settings_${t}.png`, fullPage: false });
  }
  // (?) opens a hint; Depth of field dims under Clean clinical.
  await page.click('[data-stab="screen"]');
  const r = await page.evaluate(() => {
    const hid = document.querySelectorAll('#setBody .srow > .hint').length;
    document.querySelector('[data-sq="view"]').click();
    const shown = document.querySelectorAll('#setBody .srow > .hint').length;
    SET.clinical = true; UI.renderSettings(); const dim = !!document.querySelector('[data-s="dof"]').closest('.soff');
    SET.clinical = false; UI.renderSettings();
    return { hid, shown, dim };
  });
  console.log('hints', JSON.stringify(r));
  if (r.hid !== 0 || r.shown !== 1 || !r.dim) fails.push('hint or dim');
  // Slider.
  await page.click('[data-stab="sound"]');
  const v = await page.evaluate(() => { const s = document.querySelector('[data-sv="musVol"]'); s.value = 40; s.dispatchEvent(new Event('input')); s.dispatchEvent(new Event('change')); return { mus: SET.musVol, saved: JSON.parse(localStorage.getItem('sd_settings')).musVol, label: document.getElementById('sv_musVol').textContent }; });
  console.log('slider', JSON.stringify(v));
  if (v.mus !== 0.4 || v.saved !== 0.4 || v.label !== '40%') fails.push('slider');
  // Reset settings.
  await page.click('[data-stab="data"]');
  await page.click('#setReset'); await page.click('#setReset');
  const rs = await page.evaluate(() => ({ speed: SET.speed, sfx: SET.sfxVol, tab: SET.setTab }));
  console.log('reset', JSON.stringify(rs));
  if (rs.speed !== 1 || rs.sfx !== 1) fails.push('reset');
  // Damage numbers off: no numbers.
  const dn = await page.evaluate(() => { SET.dmgNums = 'off'; UI.quickStart(); G.texts = []; const e = makeEnemy(Object.values(ENEMIES)[0], me().x + 80, me().y); e.hp = e.maxHp = 1e6; G.enemies.push(e); for (let i = 0; i < 20; i++) damageEnemy(e, 50 + i * 40, { crit: true }); const n = G.texts.length; SET.dmgNums = 'all'; return n; });
  console.log('numbers with OFF', dn);
  if (dn) fails.push('damage numbers still shown');
  console.log(fails.length ? 'FAIL ' + fails.join('; ') : 'ok');
  console.log('ERRORS ' + JSON.stringify(errors)); await b.close();
})();
