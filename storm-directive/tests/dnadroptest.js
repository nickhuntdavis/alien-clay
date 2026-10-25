// DNA drops (dnadrop.js): the pipette drip, stacking, autorun going for it, the scientist's note, campaign spots, the markers.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const bad = [], out = {};
  const step = (n, keep) => { for (let f = 0; f < n; f++) { if (!keep) G.enemies.length = 0; G.ebul.length = 0; update(1 / 30); } };
  // 1. Wave mode: a drip lands 300 to 560 away; a second level-up joins it
  Object.assign(out, await page.evaluate(() => {
    const o = {};
    LVBOX.force = true; SET.auto = true; UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0;
    G.lootQueue.push({ kind: 'level' }); lvboxTick(); o.falling = !!(G.dd && G.dd.fall) && !ddBox();
    G.lootQueue.push({ kind: 'level' }); lvboxTick(); o.stack = G.dd.fall && G.dd.fall.reqs.length;
    ddTick(2); const u = ddBox(), p = G.player;
    o.box = u && { d: Math.round(Math.hypot(u.x - p.x, u.y - p.y)), n: u.src.reqs.length, inDish: Math.hypot(u.x - G.core.x, u.y - G.core.y) <= CORE.arena, safe: !terrainDanger(u.x, u.y, 20) };
    G.lootQueue.push({ kind: 'level' }); lvboxTick(); o.topUp = ddBox().src.reqs.length;
    return o;
  }));
  if (!out.falling) bad.push('no drip falling');
  if (out.stack !== 2) bad.push('stack ' + out.stack);
  if (!out.box || out.box.d > 570 || !out.box.inDish || !out.box.safe) bad.push('box ' + JSON.stringify(out.box));
  if (out.topUp !== 3) bad.push('top-up ' + out.topUp);
  // 2. The off-screen marker (and the label)
  await page.evaluate(() => { const u = ddBox(), p = G.player; u.x = p.x + 900; u.y = p.y - 500; G.debug = { freeze: true }; });
  await page.waitForTimeout(350); await page.screenshot({ path: 'dnadrop_marker.png' });
  await page.evaluate(() => { const u = ddBox(), p = G.player; u.x = p.x + 120; u.y = p.y - 160; });
  await page.waitForTimeout(250); await page.screenshot({ path: 'dnadrop_box.png' });
  // 3. Autorun swims to it (no other pickups competing), and all three screens queue at once
  Object.assign(out, await page.evaluate(() => {
    G.debug = null; const u = ddBox(), p = G.player; u.x = p.x + 380; u.y = p.y + 120;
    for (let i = 0; i < 4; i++) G.pickups.push(makePickup('heal', p.x - 200, p.y - 60 * i));
    let f = 0; for (; f < 30 * 12 && ddBox(); f++) { G.enemies.length = 0; G.ebul.length = 0; update(1 / 30); }
    return { got: !ddBox(), secs: Math.round(f / 3) / 10, queued: G.lootQueue.filter(q => q.kind === 'level' && q.now && q.lvbox).length };
  }));
  if (!out.got || out.queued !== 3) bad.push('autorun ' + JSON.stringify([out.got, out.secs, out.queued]));
  // 4. The scientist's note: a stack, then low health
  Object.assign(out, await page.evaluate(() => {
    UI.openLoot(G.lootQueue.shift()); const n1 = document.getElementById('lootNote'); const a = n1 && n1.style.display !== 'none' && n1.textContent;
    UI.pickLoot(0); G.state = 'play'; G.player.hp = G.P.maxHp * 0.2;
    UI.openLoot(G.lootQueue.shift()); const b = document.getElementById('lootNote').textContent;
    return { noteStack: a, noteLow: b };
  }));
  await page.screenshot({ path: 'dnadrop_note.png' });
  if (!/sci_note_stack/.test(out.noteStack || '')) bad.push('stack note ' + out.noteStack);
  if (!/faltering/.test(out.noteLow || '')) bad.push('low note ' + out.noteLow);
  Object.assign(out, await page.evaluate(() => {
    UI.pickLoot(0); G.state = 'play'; UI.openLoot({ kind: 'chest' }); const el = document.getElementById('lootNote');
    const hid = el.style.display === 'none'; UI.pickLoot(0); G.state = 'play'; return { noteHiddenOnChest: hid };
  }));
  if (!out.noteHiddenOnChest) bad.push('note on a chest');
  // 5. The pipette, mid-drip
  await page.evaluate(() => { G.lootQueue = []; G.dd.fall = null; UI.show('hud'); G.state = 'play'; G.lootQueue.push({ kind: 'level' }); lvboxTick(); ddTick(DNADROP.fall * 0.5); G.dd.show[0].t = DNADROP.fall * 0.5; G.debug = { freeze: true }; cam.x = G.dd.fall.x; cam.y = G.dd.fall.y - 60; });
  await page.waitForTimeout(350); await page.screenshot({ path: 'dnadrop_pipette.png' });
  // 6. Campaign level: a reachable floor cell 4 to 8 cells away by the route, never a wall
  Object.assign(out, await page.evaluate(() => {
    G.debug = null; UI.sample = 's007'; newGame(); G.state = 'play'; G.lootQueue = [];
    const V = G.lvl, res = [];
    for (let i = 0; i < 20; i++) { const s = lvboxSpot(), c = lvIdx(s.x, s.y); res.push(c >= 0 && !lvSolidAt(s.x, s.y) && V.dPl[c] >= 4 && V.dPl[c] <= 8); }
    return { lvOk: res.filter(Boolean).length };
  }));
  if (out.lvOk !== 20) bad.push('level spots ' + out.lvOk + '/20');
  await page.evaluate(() => { LVBOX.force = false; });
  console.log(JSON.stringify(out));
  console.log(bad.length ? 'FAIL ' + bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
