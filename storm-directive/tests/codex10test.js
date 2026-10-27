// The Field Guide (codex10.js): every tab renders from the title screen and mid-run without errors, the RULES tab
// lists only v10 damage types (no Cooties, Oil, Water or Rewind), dead secrets and enemies stay out, and the damage
// type card opens.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], txt = {};
    const tabs = ['all', 'samples', 'weapons', 'feats', 'genes', 'muts', 'pairs', 'secrets', 'beasts', 'bosses', 'rules'];
    for (const s of tabs) { UI.codexSec = s; UI.openCodex(); txt[s] = $('codexBody').innerText; }
    if (/Cooties|\bOil\b|\bWater\b|REWIND/.test(txt.rules)) bad.push('v9 terms in RULES');
    if (!/UNSTABLE REACTIONS \(\d+\/21/i.test(txt.rules)) bad.push('no v10 reaction list');
    if (CDX10_DEAD_QUIRKS.size && cdx10Quirks().some(id => CDX10_DEAD_QUIRKS.has(id))) bad.push('dead secret listed');
    if (!cdx10Muts().length || cdx10Muts().some(id => MUTATIONS[id] && !cdx10Card(id))) bad.push('mutation list');
    if (/^Weak to: Learn/m.test(txt.bosses) && !/Relics/.test(txt.bosses)) bad.push('boss lines');
    INSPECTOR.elem('fire'); if (!/Corrosion/.test(document.getElementById('inspect').innerText)) bad.push('damage type card'); INSPECTOR.close();
    META.profile = 's10_alpha'; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play';
    for (const s of tabs) { UI.codexSec = s; UI.openCodex(); }
    return bad;
  });
  console.log('ERRORS', JSON.stringify(errors));
  if (r.length || errors.length) { console.log('FAIL ' + r.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
