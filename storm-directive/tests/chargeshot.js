// Charge-up look (chargefx.js): one screenshot per damage type at 50% and 100%, Arcade view. Fails on page errors or
// if a type draws nothing (pixels in the crop match the empty-field crop).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.lootQueue = []; G.invuln = 1e9; G.weapons = [null, null, null, null];
    modDraw = (o => function () { o(); if (window.__cfx) drawChargeFx(sx(G.player.x), sy(G.player.y), 14 * S, window.__cfx[1], window.__cfx[0], 0); })(modDraw); });
  const bad = [], out = n => require('path').resolve(__dirname, `out/charge_${n}.png`);
  let C = null;
  const shot = async (n) => { C = await page.evaluate(() => { update(1 / 60); return { x: Math.round(sx(G.player.x)), y: Math.round(sy(G.player.y)) }; }); await page.waitForTimeout(120); return page.screenshot({ path: out(n), clip: { x: C.x - 70, y: C.y - 70, width: 140, height: 140 } }); };
  await page.evaluate(() => { window.__cfx = null; }); const empty = (await shot('none')).toString('base64');
  for (const el of ['phys', 'fire', 'ice', 'shock', 'poison', 'oxi', 'salt', 'arcane', 'soul', 'flame']) for (const k of [0.5, 1]) {
    await page.evaluate(([el, k]) => { window.__cfx = [el, k]; }, [el, k]);
    const img = (await shot(`${el}_${k * 100}`)).toString('base64');
    if (img === empty) bad.push(`${el} ${k}: drew nothing`);
  }
  await page.evaluate(() => { window.__cfx = null; chargeSnap(G.player.x, G.player.y, 14, 'shock'); });
  await page.waitForTimeout(40); await page.screenshot({ path: out('snap_shock'), clip: { x: C.x - 70, y: C.y - 70, width: 140, height: 140 } });
  // Live sites: a Charged weapon winds up and snaps; a charger's wind-up and the Laser's charge draw without errors.
  const live = await page.evaluate(async () => {
    const p = G.player; G.weapons = [makeSlot('v_shock_proj', false, 9), null, null, null]; const w = G.weapons[0]; computeStats(w); modAdd(w, 'charged'); computeStats(w);
    const e = makeEnemy(ENEMIES.brute, p.x + 150, p.y, {}); e.speed = 0; e.hp = e.maxHp = 1e9; G.enemies.push(e);
    const ch = Object.values(ENEMIES).find(d => d.ai === 'charge'); if (ch) { const c = makeEnemy(ch, p.x - 200, p.y, {}); c.hp = c.maxHp = 1e9; c.st = 1; c.stT = 0.7; c.dashX = 1; c.dashY = 0; G.enemies.push(c); }
    let seen = 0, snaps = 0; for (let i = 0; i < 120; i++) { await new Promise(r => setTimeout(r, 25)); G.state = 'play'; G.lootQueue = []; if (w.cfxK > 0.1) seen++; }
    for (const s of CFX_SNAPS) if (s.t > -9) snaps++;
    return { seen, snaps };
  });
  if (!live.seen) bad.push('Charged weapon never showed a wind-up'); if (!live.snaps) bad.push('Charged weapon never snapped');
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
