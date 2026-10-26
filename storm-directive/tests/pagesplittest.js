// The Tackle Box and BUILD tab split (pagesplit.js): Autorun moves to BUILD in two columns; modifier and Feat pips and
// weapon Next lines in the Tackle Box; Genome, Upgrades and Stat bonuses on BUILD.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const bad = [], out = {};
  await page.evaluate(() => {
    UI.sample = 's002'; newGame(); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = []; G.state = 'play'; UI.show('hud');
    const w = G.weapons.find(x => x && !x.isSpell), id = Object.keys(MODS10).find(k => modOk(w, k)); w.m10 = [id, id]; window._mid = MODS10[id].name;
    CARDS.find(c => c.id === 'feat_puddle_jumper').apply(G); recomputeAll();
    pdef().n.thorns = 2; G.muts = G.muts || {}; G.muts.sp_runs = 2;
    const up = CARDS.find(c => c.family && c.family.startsWith('up:') && c.id.startsWith('vt_')); if (up) { up.apply(G); window._up = up.title; }
    stGain('crit', 2); recomputeAll();
  });
  // BUILD tab via the sperm key
  await page.click('#spermBtn'); await page.waitForTimeout(300);
  Object.assign(out, await page.evaluate(() => {
    const mv = [...document.querySelectorAll('#pauseBody .ps-mvb')], g = document.querySelector('#pauseBody .ps-mv');
    const cols = g ? getComputedStyle(g).gridTemplateColumns.split(' ').length : 0, h = g ? Math.round(g.getBoundingClientRect().height) : 0;
    const rows = [...document.querySelectorAll('#pauseBody .ps-row')].map(r => [r.textContent.trim().slice(0, 18), r.querySelectorAll('.ps-pips i.on').length]);
    return { mvN: mv.length, cols, arH: h, rows, stats: !!document.querySelector('#pauseBody .ps-st'), arsenal: /Arsenal/.test(document.getElementById('pauseBody').textContent) };
  }));
  if (out.mvN < 6 || out.cols !== 2) bad.push('autorun grid ' + [out.mvN, out.cols]);
  if (!out.rows.some(r => /The Runs/.test(r[0]) && r[1] === 2)) bad.push('The Runs row ' + JSON.stringify(out.rows));
  if (!out.rows.some(r => /Thorns/.test(r[0]) && r[1] === 2)) bad.push('Thorns row');
  if (!out.stats) bad.push('no stat bonuses');
  if (out.arsenal) bad.push('weapons still on BUILD');
  await page.screenshot({ path: path.resolve(__dirname, 'out/pagesplit_build.png'), fullPage: true });
  await page.evaluate(() => document.querySelector('#pauseBody .ps-mvb[data-move="orbit"]').click()); await page.waitForTimeout(100);
  out.move = await page.evaluate(() => G.moveDir); if (out.move !== 'orbit') bad.push('autorun tap ' + out.move);
  // Tackle Box
  await page.evaluate(() => { UI.togglePause(); UI.openArmoury('L', 0); }); await page.waitForTimeout(300);
  Object.assign(out, await page.evaluate(() => {
    const body = document.getElementById('armBody'), t = [...body.querySelectorAll('.ps-tag')].find(x => x.textContent.includes(_mid));
    return { lomv: !!body.querySelector('.lomv'), modPips: t ? t.querySelectorAll('.ps-pips i.on').length : -1, featPips: body.querySelectorAll('.lon em .ps-pips i').length, next: /New weapon slot|Weapon upgrade/.test(body.textContent) };
  }));
  if (out.lomv) bad.push('autorun still in Tackle Box');
  if (out.modPips !== 2) bad.push('modifier pips ' + out.modPips);
  if (out.featPips !== 5) bad.push('feat pips ' + out.featPips);
  await page.screenshot({ path: path.resolve(__dirname, 'out/pagesplit_tackle.png'), fullPage: true });
  console.log(JSON.stringify(out));
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
