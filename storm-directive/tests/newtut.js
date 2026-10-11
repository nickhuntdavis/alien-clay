// Tutorial pacing, quiet "new powerup" chips (tap to read) and damage types turning to colour on their first card.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [], fails = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(300);
  const ok = (c, m) => { if (!c) fails.push(m); };
  // 1. Statuses: two full cards, then the third is flagged on its chip and play carries on.
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; }); await page.waitForTimeout(100); // (freeze the live loop: the test steps the game itself)
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.seenSt = {}; delete META.stFull; META.seenTut = {}; for (const k in TUT_CARDS) META.seenTut[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; for (let i = 0; i < 60; i++) update(1 / 30);
    const out = {};
    G.rage = 5; render(); out.a = G.state; endBossIntro(); G.rage = 0; G.t += 5;
    G.shieldT = 30; render(); out.b = G.state; endBossIntro(); G.t += 5;
    G.warp = 30; render(); out.c = G.state; out.flag = Object.keys(G.stNew || {}).join(',');
    out.rect = UI.chipRects.find(x => x.key === 'WARP' && x.w > 150);
    out.stFull = META.stFull;
    return out; });
  ok(r.a === 'bossIntro' && r.b === 'bossIntro', 'first two statuses get full cards: ' + r.a + ' ' + r.b);
  ok(r.c === 'play' && r.flag === 'WARP', 'third status is flagged, not paused: ' + r.c + ' ' + r.flag);
  ok(r.rect, 'flagged chip has a tappable message');
  await page.screenshot({ path: 'newchip.png' });
  if (r.rect) await page.mouse.click(r.rect.x + r.rect.w - 20, r.rect.y + 8);
  const t = await page.evaluate(() => [G.state, G.bossIntro && G.bossIntro.status, Object.keys(G.stNew).length]);
  ok(t[0] === 'bossIntro' && t[1] === 'WARP' && t[2] === 0, 'tapping the message opens its card: ' + t);
  // 2. Pacing: mechanics first, then a damage type, terrain last; damage types too early in a run wait.
  const p = await page.evaluate(() => {
    endBossIntro(); G.warp = 0; G.shieldT = 0; G.state = 'play';
    META.seenTut = { egg: 1 }; META.elemSeen = {}; META.elemMig = 1; G.eggNear = true; G.tutQ = []; G.tutNext = 0; G.stIntroNext = 0; G.introNext = 0; G.boss = null; G.player.hp = G.P.maxHp;
    const out = [];
    G.t = 5; tutShow('tr_ridge'); tutElem('ice'); tutShow('grudge');
    tutTick(); out.push(G.bossIntro && G.bossIntro.tut); endBossIntro(); G.state = 'play';
    out.push('gap' + Math.round(G.tutNext - G.t));
    G.t = 20; tutTick(); out.push(G.state); // (still in the gap)
    G.t = 60; tutTick(); out.push(G.bossIntro && G.bossIntro.tut); endBossIntro(); G.state = 'play';
    G.t = 100; tutTick(); out.push(G.state); // (terrain: gap after a damage type)
    G.t = 120; tutTick(); out.push(G.bossIntro && G.bossIntro.tut); endBossIntro(); G.state = 'play';
    return out.join(' '); });
  ok(p === 'grudge gap40 play el_ice play tr_ridge', 'order and gaps: ' + p);
  // 3. Colour: Alkali greys until its card, colour after; with tutorials off a type is coloured on first use.
  const c = await page.evaluate(() => {
    const out = {};
    META.elemSeen = {}; META.elemMig = 1; META.grantOff = { tracer: 1 }; refreshPalette(); COL.clear();
    out.grey = col('#5b8cff'); META.seenTut = {}; G.tutQ = []; G.tutNext = 0; G.state = 'play'; tutOpen('el_ice'); out.blue = col('#5b8cff'); endBossIntro();
    out.card = TUT_CARDS.el_ice().what + ' | ' + TUT_CARDS.el_ice().desc;
    window.TUT_OFF = 1; out.acid0 = col('#c6ff3d'); tutElem('fire'); out.acid1 = col('#c6ff3d');
    return out; });
  ok(/^rgb/.test(c.grey) && c.blue === '#5b8cff', 'alkali grey then blue: ' + c.grey + ' ' + c.blue);
  ok(/^rgb/.test(c.acid0) && c.acid1 === '#c6ff3d', 'acid coloured at first use with tutorials off: ' + c.acid0 + ' ' + c.acid1);
  ok(/Its colour is blue/.test(c.card) && /Alkali:/.test(c.card), 'alkali card text: ' + c.card);
  // 4. Immersive mode: the flag sits under the chip row, and tapping it opens the card.
  const im = await page.evaluate(() => {
    window.TUT_OFF = 0; G.tutQ = []; SET.immersive = true; G.state = 'play'; G.bossIntro = null; G.t += 10; G.stIntroNext = 0;
    G.barrier = 30; render(); const r = UI.chipRects.find(x => x.key && x.w > 150);
    return { st: G.state, r, card: TUT_CARDS.el_arcane().what, name: ELEMENTS.arcane.name, key: r && r.key }; });
  ok(im.st === 'play' && im.r, 'immersive: flagged without a pause: ' + im.st);
  await page.screenshot({ path: 'newchip_imm.png' });
  if (im.r) await page.mouse.click(im.r.x + im.r.w / 2, im.r.y + 8);
  const it = await page.evaluate(() => [G.state, G.bossIntro && G.bossIntro.status]);
  ok(it[0] === 'bossIntro' && it[1] === im.key, 'immersive: tap opens the card: ' + it);
  ok(im.name === 'Blood Magic' && /blood red/.test(im.card), 'blood magic card: ' + im.card);
  console.log(fails.length ? 'FAIL ' + fails.join(' || ') : 'all good', '\n' + c.card);
  console.log('ERRORS', errors.length ? errors.slice(0, 3) : '[]'); await b.close();
})();
