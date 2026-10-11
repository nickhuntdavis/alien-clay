const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); });
  const r = await page.evaluate(() => { META.dna = 4242; META.offered = { pX: 3 }; saveMeta(); localStorage.setItem('sd_runs', JSON.stringify([{ n: 1, note: 'é ü 🥚' }]));
    const code = exportSave(); localStorage.clear(); const ok = importSave(code);
    return { ok, dna: JSON.parse(localStorage.getItem('sd_meta')).dna, runs: localStorage.getItem('sd_runs'), bad: importSave('nonsense'), len: code.length }; });
  await page.evaluate(() => { UI.openSettings('title'); UI.setTab = 'data'; UI.renderSettings(); });
  await page.click('#saveExport'); await page.waitForTimeout(200);
  const shown = await page.evaluate(() => document.getElementById('saveText').value.startsWith('SPAWNPRAWN-SAVE:'));
  const fail = !(r.ok && r.dna === 4242 && r.runs.includes('🥚') && !r.bad && shown);
  console.log(JSON.stringify(r), 'shown', shown, fail ? 'FAIL' : 'ok', 'ERRORS', JSON.stringify(errors)); await b.close();
})();
