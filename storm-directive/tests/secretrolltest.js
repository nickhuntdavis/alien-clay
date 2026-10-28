// Secret reroll (secretroll.js): an invisible tap in the Weapon Draft's top-right corner deals the draft again, endlessly
// and free (the box count stays), and the draft still picks afterwards.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const bad = [];
  const st = await page.evaluate(() => {
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons = [makeSlot('v_phys_proj', false, 1), null, null, null]; recomputeAll(); UI.show('hud');
    UI.openLoot({ kind: 'slot' });
    const r = $('dSecretRoll').getBoundingClientRect();
    return { shown: !$('draft').classList.contains('hidden') && getComputedStyle($('draft')).display !== 'none', opts: UI.lootOpts.map(o => o.title).join(), boxes: G.stats.boxes, op: getComputedStyle($('dSecretRoll')).opacity, r: [r.right, r.top, r.width] };
  });
  if (!st.shown) bad.push('no draft');
  if (st.op !== '0' || st.r[0] < 390 || st.r[1] > 10) bad.push('button not invisible in the top right ' + JSON.stringify(st));
  await page.waitForTimeout(500); // (the title splash is still fading out over the page)
  const seen = new Set([st.opts]);
  for (let i = 0; i < 12; i++) { await page.mouse.click(372, 28); await page.waitForFunction(n => (G.stats.secretRolls || 0) >= n, i + 1, { timeout: 5000 }); seen.add(await page.evaluate(() => UI.lootOpts.map(o => o.title).join())); }
  const after = await page.evaluate(() => ({ boxes: G.stats.boxes, rolls: G.stats.secretRolls, state: G.state, n: UI.lootOpts.length }));
  if (seen.size < 3) bad.push('rerolls barely change the draft: ' + seen.size);
  if (after.rolls !== 12 || after.boxes !== st.boxes || after.state !== 'loot' || after.n < 2) bad.push('after rolls ' + JSON.stringify(after));
  await page.waitForTimeout(600); await page.mouse.click(200, 820); await page.waitForTimeout(100);
  const picked = await page.evaluate(() => { if (G.state === 'loot') { UI.lastDown = performance.now(); UI.lootOpenT -= 1000; $('dPick').click(); } return { state: G.state, w: G.weapons.filter(Boolean).map(w => w.def.name) }; });
  if (picked.w.length !== 2) bad.push('pick after reroll ' + JSON.stringify(picked));
  console.log(JSON.stringify({ variants: seen.size, after, picked }));
  console.log(bad.length || errors.length ? 'FAIL ' + bad.concat(errors).join(' | ') : 'OK');
  await b.close(); process.exit(bad.length || errors.length ? 1 : 0);
})();
