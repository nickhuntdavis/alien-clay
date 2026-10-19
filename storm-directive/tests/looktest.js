// v10 look: Arcade is the default view, Lab an option in Settings, the type palette is canonical, an
// Acid pool and an Acid Crypt draw pink (not green, not grey), and a screenshot of every defence and a status is saved.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    const bad = [];
    const pix = (wx, wy) => { const c = ctx.canvas, k = c.width / W, d = ctx.getImageData(Math.round((W / 2 + (wx - cam.x) * S) * k), Math.round((H / 2 + (wy - cam.y) * S) * k), 1, 1).data; return [d[0], d[1], d[2]]; };
    if (!(viewArcade() && L10)) bad.push('Arcade is not the default');
    const row = SETTINGS_DEF.find(d => d.id === 'view'); if (!row || (row.hide && row.hide())) bad.push('view row hidden');
    SET.view = 'lab'; if (viewArcade() || !labOn()) bad.push('Lab view not selectable');
    SET.view = 'arcade';
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6;
    const p = G.player, ids = ['brute', 'diatom', 'bulwark', 'skitter', 'ingrown'];
    ids.forEach((id, i) => { const a = i / ids.length * TAU, e = makeEnemy(ENEMIES[id], p.x + Math.cos(a) * 130, p.y - 120 + Math.sin(a) * 90); e.hp = e.maxHp = 1e4; e.speed = 0; G.enemies.push(e); });
    gridBuild();
    const st = ['fire', 'shock', 'ice', 'arcane', 'soul', 'flame', 'phys'];
    st.forEach((t, i) => { const e = makeEnemy(ENEMIES.crawler, p.x - 150 + i * 50, p.y - 260 + (i % 2) * 40); e.hp = e.maxHp = 1e4; e.speed = 0; G.enemies.push(e); gridBuild(); damageEnemy(e, 5, { elem: t, atk: 'proj', noCrit: true, wname: 'test' }); });
    const ax = p.x + 120, ay = p.y + 150;
    G.zones.push({ x: ax, y: ay, r: 60, life: 99, max: 99, dps: 0, quiet: true, elem: 'fire', pull: 0, color: ELEMENTS.fire.color, tick: 0, src: { elem: 'fire' } });
    G.terrain = G.terrain || { list: [], grid: new Map(), regridT: 0 };
    const cx = p.x - 120, cy = p.y + 150;
    G.terrain.list.push({ type: 'acid', def: { dps: 0 }, x: cx, y: cy, r: 60, a: 0, charge: 0, flash: 0, seed: 3, burstT: 0, lobes: [1, 1, 1, 1, 1, 1, 1, 1] });
    for (let i = 0; i < 30; i++) { update(1 / 60); G.player.hp = 1e6; }
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const pa = pix(ax, ay), pc = pix(cx, cy);
    const pink = c => c[0] > 150 && c[0] > c[1] + 60 && c[2] > c[1] + 20;
    if (!pink(pa)) bad.push('Acid pool not pink: ' + pa);
    if (!(pc[0] > pc[1] + 25 && pc[2] > pc[1])) bad.push('Acid crypt not pink: ' + pc);
    const pal = { fire: ELEMENTS.fire.color, v10: V10_COL.fire, fight: FIGHT_COL.corroded, mut: MUT_COL.acid };
    if (new Set(Object.values(pal)).size !== 1) bad.push('Acid colour differs between files ' + JSON.stringify(pal));
    return { bad, pa, pc, pal };
  });
  await page.screenshot({ path: 'look_v10.png' });
  const dom = await page.evaluate(() => SETTINGS_DEF.filter(d => d.tab === 'screen' && !(d.hide && d.hide())).map(d => UI.setRowHtml(d)).join('').includes('data-s="view"'));
  if (!dom) r.bad.push('View row missing from Settings');
  console.log(JSON.stringify(r)); console.log('ERRORS', JSON.stringify(errors));
  if (r.bad.length || errors.length) { console.log('FAIL ' + r.bad.join(' | ')); process.exitCode = 1; }
  await b.close();
})();
