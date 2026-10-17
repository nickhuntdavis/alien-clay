// Tackle Box LOADOUT tab (loadout.js): opens first, autorun and targets change, per-Feat timing, combo tracker,
// YOUR BUILD from a card screen returns to the cards; immersive layout (menus top, actions bottom). Screenshots.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const fails = [];
  await page.evaluate(() => {
    META.seen = META.seen || {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
    SET.view = 'arcade'; SET.immersive = 'auto'; UI.applySettings(); UI.quickStart(); G.lootQueue = []; UI.show('hud'); G.state = 'play';
    const c = COMBOS[0]; G.weapons = [makeSlot(c.a, false, 4), makeSlot(c.b, false, 2), makeSlot('blaster', false, 6), null];
    G.spells = [makeSlot('barrier', true, 1), null]; recomputeAll();
    G.stats.wdmg = {}; G.stats.wdmg[G.weapons[0].uid] = 600; G.stats.wdmg[G.weapons[1].uid] = 150; G.stats.wdmg[G.weapons[2].uid] = 250;
    G.elemBias = { up: 'fire', upK: 2.5 }; UI.refreshHud(true);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'immersive_hud.png' });
  const lay = await page.evaluate(() => { const y = id => document.getElementById(id).getBoundingClientRect().top; return { imm: document.body.classList.contains('immersive'), pause: y('pauseBtn'), arm: y('armBtn'), spd: y('spdBtn'), move: y('moveBtn') }; });
  console.log('layout', JSON.stringify(lay));
  if (!lay.imm || lay.pause > 100 || lay.arm > 100 || lay.spd > 100 || lay.spd < 5 || lay.move < 600) fails.push('immersive layout');
  await page.click('#armBtn'); await page.waitForTimeout(200);
  const r = await page.evaluate(() => ({ tab: UI.arm.k, rows: document.querySelectorAll('#armBody .low').length, combos: document.querySelectorAll('#armBody .loc').length }));
  console.log('loadout', JSON.stringify(r));
  if (r.tab !== 'L' || r.rows !== 4 || !r.combos) fails.push('loadout content');
  await page.screenshot({ path: 'loadout.png', fullPage: true });
  // Autorun, target, Feat timing.
  await page.click('[data-mv="orbit"]');
  const uid = await page.evaluate(() => G.weapons[0].uid);
  await page.click(`[data-tg="${uid}"]`); await page.screenshot({ path: 'loadout_target.png' });
  await page.click(`[data-dir2="strongest"][data-uid="${uid}"]`);
  await page.click(`[data-dir3="weakest"][data-uid="${uid}"]`);
  await page.click('[data-fa="0"][data-v="tap"]');
  const ch = await page.evaluate(() => ({ mv: G.moveDir, dir: G.weapons[0].dir, dir2: G.weapons[0].dir2, waits: featWaits(G.spells[0]) }));
  console.log('changed', JSON.stringify(ch));
  if (ch.mv !== 'orbit' || ch.dir !== 'strongest' || ch.dir2 !== 'weakest' || !ch.waits) fails.push('controls');
  // Weapon page: targeting comes before the stats.
  await page.click('[data-go="w0"]');
  const ord = await page.evaluate(() => { const t = document.getElementById('armBody').textContent.toLowerCase(); return { tgt: t.indexOf('targeting directive'), tree: t.indexOf('upgrade tree'), rec: t.indexOf('record') }; });
  console.log('order', JSON.stringify(ord));
  if (!(ord.tgt >= 0 && ord.tgt < ord.tree && ord.rec > ord.tree)) fails.push('weapon page order');
  await page.click('#armClose'); await page.waitForTimeout(100);
  // YOUR BUILD from a card screen.
  const lb = await page.evaluate(async () => {
    UI.openLoot({ kind: 'level' }); await new Promise(r => setTimeout(r, 700));
    const vis = getComputedStyle(document.getElementById('buildBtn')).display !== 'none';
    document.getElementById('buildBtn').click();
    const st1 = G.state, tab = UI.arm.k, btn = document.getElementById('armClose').textContent;
    document.getElementById('armClose').click();
    return { vis, st1, tab, btn, st2: G.state, cards: document.querySelectorAll('#lootCards .card').length, shown: document.getElementById('loot').classList.contains('show') || getComputedStyle(document.getElementById('loot')).display !== 'none' };
  });
  console.log('build', JSON.stringify(lb));
  if (!lb.vis || lb.st1 !== 'armoury' || lb.tab !== 'L' || lb.st2 !== 'loot' || !lb.cards || !lb.shown) fails.push('your build');
  await page.screenshot({ path: 'loot_build.png' });
  console.log(fails.length ? 'FAIL ' + fails.join('; ') : 'ok');
  console.log('ERRORS ' + JSON.stringify(errors)); await b.close();
})();
