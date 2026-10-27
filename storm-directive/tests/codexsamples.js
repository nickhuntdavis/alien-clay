// The Field Guide's SAMPLES tab (samplelooks.js slCodex): every sample listed with a live picture that draws, from
// the title screen and from the pause menu. Saves tests/out/codex_samples.png.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = [];
  await page.evaluate(() => { UI.codexSec = 'samples'; UI.openCodex(); });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => { const cs = [...document.querySelectorAll('#codexBody canvas[data-slpic]')]; const c = cs[0], d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++; return { count: cs.length, ink: n, want: SAMPLES10.length }; });
  if (r.count !== r.want) bad.push('pictures: ' + r.count);
  if (r.ink < 300) bad.push('first picture empty');
  await page.screenshot({ path: path.resolve(__dirname, 'out/codex_samples.png') });
  // From the pause menu, mid-run, with a run's G in place (the pictures swap a stand-in G only while drawing).
  const mid = await page.evaluate(async () => { META.profile = 's10_alpha'; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; const keep = G; UI.codexSec = 'samples'; UI.openCodex(); await new Promise(r => setTimeout(r, 400)); return G === keep && !!G.player; });
  if (!mid) bad.push('run state disturbed by the pictures');
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
