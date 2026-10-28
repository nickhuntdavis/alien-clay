// The four Delivery weapons (dlvweap.js, dlvrun.js): on the roster, built-in Delivery modifier ranked by weapon level,
// each one hurts what it should, and Melee / Ranged / Mines / Death from Above are no longer dealt as cards.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (id, lv) => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0;
      if (G.terrain && G.terrain.list) G.terrain.list.length = 0;
      G.weapons = [makeSlot(id, false, lv || 1), null, null]; computeStats(G.weapons[0]); G.v10fx = []; return G.weapons[0];
    };
    const p = () => G.player;
    const foe = (dx, dy) => { const e = makeEnemy(ENEMIES.brute, p().x + dx, p().y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e6; G.enemies.push(e); return e; };
    const hurt = e => Math.round(e.maxHp - e.hp);
    const runT = t => { const px = p().x, py = p().y; for (let f = 0; f < t * 60; f++) { G.state = 'play'; G.lootQueue = []; p().x = px; p().y = py; update(1 / 60); } };
    const IDS = ['v_flame_sword', 'v_flame_mines', 'v_flame_orbital', 's_mines_dfa'];
    // 1. On the roster and offered
    for (const id of IDS) if (!w24Live().includes(id) || !WEAPONS[id] || WEAPONS[id].archived) bad.push('not live ' + id);
    // 2. Built in at Rank 1, Rank 4 at Lv 9, takes no slot
    for (const id of IDS) {
      const w = fresh(id); const d = w.def.dlv;
      if (modCount(w, d) !== 1) bad.push(id + ' rank at Lv 1 ' + modCount(w, d));
      if (mmHeld(w).has('delivery')) bad.push(id + ' built-in takes a slot');
      if (modOk(w, d)) bad.push(id + ' built-in dealt as a card');
      const w9 = fresh(id, 9); if (modCount(w9, d) !== 4) bad.push(id + ' rank at Lv 9 ' + modCount(w9, d));
    }
    // 3. Levelling to 3 ranks the sword up and opens its fork
    let w = fresh('v_flame_sword'); w.lvl = 3; G.lootQueue = []; dlvSync(w);
    out.fork = G.lootQueue.map(q => q.ms && q.ms.id + q.ms.st);
    if (modCount(w, 'melee') !== 2 || !G.lootQueue.some(q => q.ms && q.ms.id === 'melee' && q.ms.st === 'b')) bad.push('sword Lv 3 ' + modCount(w, 'melee') + ' ' + out.fork);
    // 4. Each weapon hurts
    w = fresh('v_flame_sword'); const sNear = foe(70, 0), sFar = foe(0, 220); runT(1.5);
    out.sword = [hurt(sNear), hurt(sFar)]; if (!(hurt(sNear) > 0) || hurt(sFar) > 0 || !w.lzSword) bad.push('sword ' + out.sword);
    w = fresh('v_flame_mines'); const mT = foe(200, 0); runT(1.6); const laid = lzS().mines.filter(m => m.w === w).length;
    if (lzS().mines[0]) { mT.x = lzS().mines[0].x + 30; mT.y = lzS().mines[0].y; } runT(1);
    out.mines = [laid, hurt(mT)]; if (!laid || !(hurt(mT) > 0)) bad.push('laser mines ' + out.mines);
    w = fresh('v_flame_orbital'); const oT = foe(200, 0); runT(2.5);
    out.orbital = [hurt(oT), (w.lzShotSegs || []).length]; if (!(hurt(oT) > 0) || (w.lzShotSegs || []).length) bad.push('orbital ' + out.orbital);
    w = fresh('s_mines_dfa'); const aT = foe(180, 0); runT(3);
    out.artillery = hurt(aT); if (!(hurt(aT) > 0)) bad.push('artillery ' + out.artillery);
    // 5. The four modifiers are gone from the draft; the mines weapons still take Extra Projectiles
    MATRIX_ONLY.force = true; // (tests get every modifier unless forced)
    w = fresh('v_phys_proj'); w.lvl = 9;
    for (const id of ['melee', 'ranged', 'mines', 'dfa']) if (modOk(w, id)) bad.push('still dealt ' + id);
    const nb = fresh('v_phys_contact'); nb.lvl = 9; if (modOk(nb, 'ranged')) bad.push('ranged still dealt');
    w = fresh('v_flame_mines', 3); out.minesMods = modsFor(w); if (!out.minesMods.includes('extra')) bad.push('laser mines no extra');
    w = fresh('v_flame_sword', 3); out.swordMods = modsFor(w); if (out.swordMods.some(id => mmGroup(id) === 'delivery')) bad.push('sword delivery card ' + out.swordMods);
    MATRIX_ONLY.force = false;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join(' | '));
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
