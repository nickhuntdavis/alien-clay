const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; UI.renderBest(); });
  await page.screenshot({ path: 'daily_title.png' });
  const snap = () => page.evaluate(() => JSON.stringify({ seq: G.genes.primary, heat: G.heat, rivals: G.rivalSet.map(r => r.id), bosses: G.bossRoster, terr: JSON.stringify(G.terrain).length + ':' + JSON.stringify(G.terrain).slice(0, 60), draft: (G.lootQueue.find(q => q.kind === 'start') || UI.lootReq || {}).fixed && ((G.lootQueue.find(q => q.kind === 'start') || UI.lootReq).fixed.map(o => o.title)) }));
  await page.evaluate(() => startDaily()); const a = await snap();
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({ state: G.state, opts: (UI.lootOpts || []).map(o => o.title) }));
  // a different "phone": other unlocks, other chosen sequence, some random calls in between
  await page.evaluate(() => { G = null; UI.show('title'); for (let i = 0; i < 37; i++) Math.random(); META.profile = 'bruiser'; META.ranks = { hp: 3 }; });
  await page.evaluate(() => startDaily()); const b2 = await snap();
  console.log('A', a); console.log('same on second phone:', a === b2, '| draft shown:', JSON.stringify(st));
  // play a bit, die, check record
  await page.evaluate(() => { if (G.state === 'loot' && UI.lootOpts) UI.pickDraft ? 0 : 0; });
  await page.evaluate(() => { const o = UI.lootOpts && UI.lootOpts[0]; if (G.state === 'loot') { o.apply(); G.state = 'play'; UI.show('hud'); } });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { G.t = 200; G.chrono.charges = 0; G.player.iframes = 0; hurtPlayer(99999, 'x', null, 'contact'); });
  await page.waitForTimeout(5000);
  console.log('over:', await page.evaluate(() => G.state + ' | ' + (document.querySelector('#over .daily') || {}).textContent + ' | store ' + JSON.stringify(META.daily)));
  await page.evaluate(() => { const d = document.querySelector('#over .daily'); if (d) d.scrollIntoView(); }); await page.screenshot({ path: 'daily_over.png' });
  await page.evaluate(() => { G = null; UI.show('title'); UI.renderBest(); }); console.log('title line:', await page.evaluate(() => $('dailyLine').textContent));
  // every sequence can be the daily
  const r = await page.evaluate(() => { const out = {}; const keep = dailySetup; for (const id of Object.keys(PROFILES)) { window.dailySetup = () => Object.assign(keep(), { seq: id }); try { startDaily(); G.state = 'play'; G.lootQueue.length = 0; for (let i = 0; i < 120; i++) update(1 / 60); out[id] = G.genes.primary + ' hp' + Math.round(G.P.maxHp); } catch (e) { out[id] = 'ERR ' + e.message; } G = null; } window.dailySetup = keep; return out; });
  console.log('seqs:', JSON.stringify(r));
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none', await page.evaluate(() => ERRS.last)); await b.close();
})();
