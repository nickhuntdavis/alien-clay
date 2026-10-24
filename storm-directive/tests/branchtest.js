// Weapon branches and elite carriers back (branchback.js): a weapon's promise, cards and mastery open at Lv 3, 6 and 9;
// a carrier elite's strand holds a loot box (a DNA strand box), not a mutation.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    XBR.force = true; XEB.force = true;
    META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0;
    for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null;
    const w = G.weapons[0] = makeSlot('s_mines', false, 1), w2 = G.weapons[1] = makeSlot('v_flame_pool', false, 1); computeStats(w); computeStats(w2);
    const forks = () => G.lootQueue.filter(q => q.kind === 'fork' && q.xbr);
    // 1. Nothing below Lv 3; the promise at Lv 3
    xbrTick(); out.lv1 = forks().length; if (out.lv1) bad.push('fork before Lv 3');
    w.lvl = 3; xbrTick(); xbrTick(); let q = forks(); out.lv3 = q.map(x => x.xbr.lv).join();
    if (out.lv3 !== '3') bad.push('Lv 3 fork ' + out.lv3);
    let cards = forkCards(q[0]); out.promises = cards.length; if (cards.length !== 3) bad.push('promises ' + cards.length);
    out.title = draftTitle(q[0])[0]; if (!/TIER/.test(out.title)) bad.push('title ' + out.title);
    G.lootQueue = []; cards[0].apply(); out.p = wupUp(w).p; if (!out.p) bad.push('promise not taken');
    // 2. Lv 6: that promise's cards
    w.lvl = 6; xbrTick(); q = forks(); cards = q.length ? forkCards(q[0]) : []; out.lv6 = cards.length; if (cards.length < 2) bad.push('Lv 6 cards ' + cards.length);
    G.lootQueue = []; cards[0].apply(); if (!wupUp(w).l6) bad.push('Lv 6 not taken');
    // 3. Lv 9: the mastery; one weapon a run
    w.lvl = 9; xbrTick(); q = forks(); cards = q.length ? forkCards(q[0]) : []; out.lv9 = [q.length && q[0].xbr.lv, cards.length]; if (!(q.length && q[0].xbr.lv === 10 && cards.length)) bad.push('mastery ' + out.lv9);
    G.lootQueue = []; cards[0].apply(); if (!wupUp(w).l10) bad.push('mastery not taken');
    const U2 = wupUp(w2); U2.p = 'A'; U2.l6 = 'x'; w2.lvl = 9; xbrTick(); out.second = forks().length; if (out.second) bad.push('a second weapon got a mastery');
    // 4. Elite carriers: the strand holds a loot box
    G.lootQueue = []; XEB.chance = 1; const e = makeEnemy(ENEMIES.crawler, G.player.x + 200, G.player.y, { elite: true }); e.elite = true; G.enemies.push(e);
    mdTick(1 / 60); out.carry = !!e.mdCarry; if (!e.mdCarry) bad.push('no carrier');
    mdKill(e); out.box = G.lootQueue.map(x => x.kind).join(); if (out.box !== 'chest') bad.push('box ' + out.box);
    out.cards = (draftLoot(G.lootQueue[0]) || []).length; if (!out.cards) bad.push('empty box');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
