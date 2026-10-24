// Weapon branches (branchback.js) open in the Weapon Draft layout (tabs, details, stage), for a weapon with its own
// branch scenes (Standard Issue) and one without, at Lv 3, 6 and 9; taking a tab records the branch. Also: enemy rings
// draw after the effects layer (ringtop.js). Saves tests/out/xbrdraft_<id>_<lv>.png and xbrdraft_rings.png.
const { chromium } = require('playwright');
const path = require('path'), out = f => path.resolve(__dirname, 'out', f);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.intros = 'off'; }); await page.waitForTimeout(300);
  const bad = [], res = {};
  for (const id of ['v_phys_proj', 's_tesla']) for (const [lv, want] of [[3, 'PROMISE'], [6, 'BRANCH'], [9, 'MASTERY']]) {
    const r = await page.evaluate(([id, lv]) => {
      if (lv === 3) { META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons = [makeSlot(id, false, 1)]; recomputeAll(); UI.show('hud'); XBR.force = true; G.xbrMast = null; }
      const w = G.weapons[0]; w.lvl = lv; G.lootQueue = []; xbrTick();
      const q = G.lootQueue.find(x => x.xbr); if (!q) return { err: 'no fork at Lv ' + lv };
      G.lootQueue = []; UI.openLoot(q);
      const tabs = document.querySelectorAll('#dTabs .dtab').length, vis = $('draft').classList.contains('show') || getComputedStyle($('draft')).display !== 'none';
      return { title: $('dTitle').textContent, kick: $('dKick').textContent, tabs, n: UI.lootOpts.length, vis, perk: UI.lootOpts.map(o => o.perk || '').join(';'), state: G.state };
    }, [id, lv]);
    res[id + lv] = r;
    if (r.err || r.title !== want || !r.tabs || r.tabs !== r.n || r.state !== 'loot') bad.push(id + ' Lv ' + lv + ': ' + JSON.stringify(r));
    if (id === 'v_phys_proj' && !/siv\|/.test(r.perk || '')) bad.push(id + ' Lv ' + lv + ': no branch scene on the stage');
    await page.waitForTimeout(600);
    await page.screenshot({ path: out(`xbrdraft_${id}_${lv}.png`) });
    const got = await page.evaluate(lv => { UI.pickLoot(UI.draft.i); const U = wupUp(G.weapons[0]); return lv === 3 ? !!U.p : lv === 6 ? !!U.l6 : !!U.l10; }, lv);
    if (!got) bad.push(id + ' Lv ' + lv + ': taking the tab did not record the branch');
  }
  // Rings over effects: an enemy with Shell rings and a status, an explosion on top of it.
  const rings = await page.evaluate(() => {
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; UI.show('hud');
    const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + 120, p.y); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); fightCd(e);
    e.cd.def = 'shell'; e.cd.layers = 3; e.cd.layerHp = e.cd.maxHp; e.cd.bars.fire = 0.7; e.cd.bars.soul = 0.5;
    const order = []; const fd = fightDraw; fightDraw = function () { order.push('rings'); return fd.apply(this, arguments); };
    const fx0 = G.fx.length; G.fx.push({ type: 'flash', x: e.x, y: e.y, r: 90, color: '#ffffff', life: 0.4, max: 0.4 });
    cam.x = p.x + 60; cam.y = p.y; render(); order.push(G.fx.length > fx0 ? 'fx-before-flush' : '');
    fightDraw = fd;
    return { order: order.join(','), q: RING_Q.length };
  });
  await page.screenshot({ path: out('xbrdraft_rings.png'), clip: { x: 100, y: 330, width: 260, height: 200 } });
  if (rings.order !== 'rings,fx-before-flush' || rings.q) bad.push('rings ' + JSON.stringify(rings));
  console.log(JSON.stringify(res).slice(0, 600));
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
