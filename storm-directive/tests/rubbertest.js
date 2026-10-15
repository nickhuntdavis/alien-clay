// Rubber Latex Barrier (rubber.js), Acquired Taste / Gone Off It (bias.js) and Upgrade All (upall.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const fails = [];
  // 1. Bias: Acid cards with an Acid taste vs none, Base cards with Base gone off.
  const bias = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    UI.quickStart(); G.weapons = [makeSlot('blaster', false, 3), null, null, null]; const fw = Object.keys(WEAPONS).find(id => WEAPONS[id].elem === 'fire' && !WEAPONS[id].merged);
    const iw = Object.keys(WEAPONS).find(id => WEAPONS[id].elem === 'ice' && !WEAPONS[id].merged);
    G.weapons[1] = makeSlot(fw, false, 2); G.weapons[2] = makeSlot(iw, false, 2); recomputeAll();
    const count = (el) => { let n = 0, tot = 0; for (let i = 0; i < 1500; i++) { G.level = 5 + (i % 30); G.offered = {}; for (const o of genLoot({ kind: 'level' })) { if (o.tag === 'APPETITE') continue; tot++; if (o.elem === el) n++; } } return n / tot; };
    G.elemBias = null; const f0 = count('fire'), i0 = count('ice');
    G.elemBias = { up: 'fire', upK: 2.5, down: 'ice', downK: 0.2 }; const f1 = count('fire'), i1 = count('ice');
    G.elemBias = null; let seen = 0; for (let i = 0; i < 400; i++) { G.level = 6; for (const o of genLoot({ kind: 'level' })) if (o.tag === 'APPETITE') { seen++; o.apply(); } }
    return { f0, f1, i0, i1, seen, held: G.elemBias, stats: biasStatus() };
  });
  console.log('bias', JSON.stringify(bias));
  if (!(bias.f1 > bias.f0 * 1.4)) fails.push('taste did not raise fire cards');
  if (!(bias.i1 < bias.i0 * 0.6)) fails.push('gone off did not lower ice cards');
  if (!bias.seen) fails.push('no appetite cards offered');
  // 2. Upgrade All.
  const up = await page.evaluate(async () => {
    G.lootQueue = []; G.rerolls = 5; G.level = 6; UI.openLoot({ kind: 'level' });
    await new Promise(r => setTimeout(r, 900));
    const before = UI.lootOpts.map(o => [o.title, o.rarity, upAllOk(o)]);
    const vis = $('upAllBtn').style.display !== 'none';
    $('upAllBtn').click();
    const after = UI.lootOpts.map(o => [o.title, o.rarity]);
    const vis2 = $('upAllBtn').style.display !== 'none';
    UI.pickLoot(0);
    return { before, after, vis, vis2, rerolls: G.rerolls };
  });
  console.log('upall', JSON.stringify(up));
  if (!up.vis || up.vis2) fails.push('upgrade button visibility wrong');
  if (up.rerolls !== 0) fails.push('rerolls not spent');
  up.before.forEach((o, i) => { if (o[2] && !(up.after[i][1] > o[1])) fails.push('card not raised: ' + o[0]); if (o[2] && up.after[i][0] !== o[0]) fails.push('card changed: ' + o[0]); });
  // 3. Rubber barrier: an enemy charging in stays out; a bullet at an angle comes back mirrored.
  const rb = await page.evaluate(() => {
    G.debug = { god: true }; G.enemies = []; G.ebul = []; G.proj = []; G.weapons = [null, null, null, null]; G.state = 'play';
    G.spells[0] = makeSlot('barrier', true, 1); recomputeAll();
    const p = me(); G.barrier = 99; G.barrierR = 55; G.barrierDmg = 0.001;
    const def = Object.values(ENEMIES).find(d => !d.shoot && d.r && d.r < 16 && d.speed > 60) || Object.values(ENEMIES)[0];
    const e = makeEnemy(def, p.x + 120, p.y); e.hp = e.maxHp = 1e9; e.kx = -500; G.enemies.push(e);
    let minD = 1e9;
    for (let i = 0; i < 120; i++) { update(1 / 60); minD = Math.min(minD, Math.hypot(e.x - me().x, e.y - me().y)); }
    G.enemies = [];
    // Bullet coming in at 45 degrees, aimed to graze the right side of the film.
    const q = me(), s = 300;
    G.ebul.push({ x: q.x + 40 - 100, y: q.y - 100, vx: s * Math.SQRT1_2, vy: s * Math.SQRT1_2, dmg: 5, r: 5, color: '#f00', life: 7, from: 'test' });
    let held = 0, out = null;
    const px = q.x, py = q.y; for (let i = 0; i < 90 && !out; i++) { update(1 / 60); q.x = px; q.y = py; // (hold still: autorun would swim off)
      held = Math.max(held, G.rbHeld.length); const pr = G.proj.find(x => x.src && x.src.wname === 'Latex Barrier'); if (pr) out = { vx: pr.vx, vy: pr.vy, x: pr.x - me().x, y: pr.y - me().y }; }
    const minOff = Math.min(...G.rbBar.off);
    return { minD, er: e.r, held, out, minOff };
  });
  console.log('rubber', JSON.stringify(rb));
  if (!(rb.minD > 55 + rb.er - 55 * 0.45 - 1)) fails.push('enemy got through the film');
  if (!rb.held) fails.push('bullet never held');
  if (!rb.out) fails.push('bullet never flung back');
  else { const n = Math.hypot(rb.out.x, rb.out.y), nx = rb.out.x / n, ny = rb.out.y / n, vin = [Math.SQRT1_2, Math.SQRT1_2], d = vin[0] * nx + vin[1] * ny, mx = vin[0] - 2 * d * nx, my = vin[1] - 2 * d * ny, sp = Math.hypot(rb.out.vx, rb.out.vy);
    const cos = (rb.out.vx * mx + rb.out.vy * my) / sp / Math.hypot(mx, my); console.log('mirror cos', cos.toFixed(3), 'speed', sp.toFixed(0));
    if (cos < 0.9) fails.push('not mirrored'); if (Math.abs(sp - 330) > 5) fails.push('speed not x1.1'); }
  // Screenshot: film with a dent and held bullets.
  await page.evaluate(() => { UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.debug = { god: true }; G.enemies = []; G.spells[0] = makeSlot('barrier', true, 1); const p = me(); G.barrier = 99; G.barrierR = 95; for (let k = 0; k < 4; k++) { const a = -1 + k * 0.5; G.ebul.push({ x: p.x + Math.cos(a) * 140, y: p.y + Math.sin(a) * 140, vx: -Math.cos(a) * 500, vy: -Math.sin(a) * 500, dmg: 5, r: 5, color: '#ff4d6d', life: 7, from: 'test' }); } for (let i = 0; i < 6; i++) update(1 / 60); G.debug.freeze = true; cam.x = p.x; cam.y = p.y; });
  await page.waitForTimeout(200); await page.screenshot({ path: 'rubber.png', clip: { x: 80, y: 280, width: 240, height: 240 } });
  console.log(fails.length ? 'FAIL ' + fails.join('; ') : 'ok');
  console.log('ERRORS ' + JSON.stringify(errors)); await b.close();
})();
