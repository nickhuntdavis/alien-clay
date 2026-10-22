const { chromium } = require('playwright');
// UI contact sheet: every design-system screen at 390 x 844 (paper menus), for comparing with the Figma Screens page.
// Writes out/ui_<name>.png per screen and out/ui_sheet_<n>.png contact sheets (6 per sheet).
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch(); const errors = [];
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { localStorage.clear(); window.TUT_OFF = 1; splashEnd(); SET.menus = 'paper'; UI.applySettings();
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; });
  await page.waitForTimeout(300);
  const shots = [];
  const shot = async (name, fn, wait) => { try { await page.evaluate(() => { window.seqReveal = () => {}; if (typeof REVEAL !== 'undefined') { REVEAL.q = []; REVEAL.id = null; } document.querySelectorAll('#seqReveal').forEach(e => e.remove()); }); await page.evaluate(fn); await page.evaluate(() => document.querySelectorAll('#seqReveal').forEach(e => e.remove())); } catch (e) { errors.push(name + ': ' + e.message); } await page.waitForTimeout(wait || 500); const f = path.resolve(__dirname, `out/ui_${name}.png`); await page.screenshot({ path: f }); shots.push([name, f]); };
  await shot('01_title', () => { UI.show('title'); });
  await shot('02_samples', () => { UI.openSamples(); });
  await shot('03_modes', () => { const c = document.querySelector('.sx-card.hero:not(.locked)'); c && c.click(); });
  await shot('04_draft', () => { UI.quickStart(); G.nextBoss = 1e9; G.lootQueue = []; UI.openLoot({ kind: 'start' }); }, 1500);
  await shot('05_hud', () => { const b = document.getElementById('dPick'); b && b.click(); SET.darkfield = true; UI.applySettings(); G.state = 'play'; UI.show('hud'); UI.refreshHud(true); }, 1500);
  await shot('06_loot', () => { SET.darkfield = false; UI.applySettings(); UI.openLoot({ kind: 'level', lv: 3 }); }, 2500);
  await shot('08_pause_you', () => { UI.show('hud'); G.state = 'play'; UI.togglePause(); });
  await shot('28_pause_run', () => { document.querySelector('[data-ptab=run]').click(); });
  await shot('29_pause_build', () => { document.querySelector('[data-ptab=build]').click(); });
  await shot('31_pause_guide', () => { document.querySelector('[data-ptab=codex],[data-ptab=guide]').click(); });
  await shot('09_tackle', () => { UI.togglePause(); G.state = 'play'; UI.openArmoury('w', 0); });
  await shot('10_settings', () => { UI.openSettings('title'); });
  await shot('11_codex', () => { UI.openCodex(); });
  await shot('12_bank', () => { META.dna = 1240; META.total = 3860; UI.renderBank(); UI.show('bank'); });
  await shot('13_over', () => { G.state = 'play'; G.lootQueue = []; G.kills = 812; G.t = 402; UI.showGameOver(); const r = document.getElementById('seqReveal'); if (r) r.remove(); UI.show('over'); }, 1200);
  await shot('18_born', () => { openBirth(); });
  await shot('19_effects', () => { UI.quickStart(); G.nextBoss = 1e9; G.lootQueue = []; G.state = 'play'; UI.chips = [['OXYTOCIN 6', '#f0f'], ['STUCK IN YEAST', '#f00']]; G.junk = { crawler: 1, skitter: 1 }; UI.openStatusPanel(); });
  await shot('15_how', () => { UI.show('title'); document.getElementById('how').classList.add('open'); document.getElementById('how').scrollIntoView(); });
  // contact sheets
  for (let i = 0; i < shots.length; i += 6) {
    const g = shots.slice(i, i + 6);
    const html = `<body style="margin:0;background:#888;display:flex;gap:10px;padding:10px;font:12px sans-serif">${g.map(([n, f]) => `<div><div style="color:#fff">${n}</div><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}" width="390"></div>`).join('')}</body>`;
    const p2 = await b.newPage({ viewport: { width: 6 * 400 + 20, height: 880 } }); await p2.setContent(html); await p2.waitForTimeout(200);
    await p2.screenshot({ path: path.resolve(__dirname, `out/ui_sheet_${i / 6 + 1}.png`) }); await p2.close();
  }
  console.log('shots', shots.length, 'ERRORS', errors.length ? errors.slice(0, 5) : 'none');
  await b.close();
})();
