// Stain grants (grants.js), the egg's first meeting (tutorial.js) and the egg arrow.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.grants = {}; META.grantOff = {}; META.pstains = {}; META.eggMet = 0; META.tutWave = 1;
    UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play';
    const out = { youGrey: col(PAL.you) !== PAL.you, eggKnown0: eggKnown() };
    for (let f = 0; f < 30; f++) update(1 / 30);
    out.grantAt = G.grant && [G.grant.id, Math.round(G.grant.x), Math.round(G.grant.y)];
    // Swim to the egg, then to the grant.
    G.t = 10; G.player.x = 0; G.player.y = 300; update(1 / 30);
    out.eggKnown1 = eggKnown(); out.eggMet = META.eggMet;
    G.player.x = G.grant.x; G.player.y = G.grant.y; update(1 / 30);
    out.body = grantHas('body'); out.youCol = col(PAL.you) === PAL.you; out.shotGrey = col(G.seqCol) !== G.seqCol;
    // Level 5: the Tracer Dye floats up in front of you.
    G.level = 5; for (let f = 0; f < 3; f++) update(1 / 30);
    out.tracerAt = G.grant && G.grant.id;
    if (G.grant) { G.player.x = G.grant.x; G.player.y = G.grant.y; update(1 / 30); }
    out.tracer = grantHas('tracer'); out.shotCol = col(G.seqCol) === G.seqCol; out.pickupGrey = col(PAL.pickup) !== PAL.pickup;
    G.level = 10; for (let f = 0; f < 3; f++) update(1 / 30); if (G.grant) { G.player.x = G.grant.x; G.player.y = G.grant.y; update(1 / 30); }
    out.pickups = grantOn('pickups') && col(PAL.pickup) === PAL.pickup;
    META.grantOff = { body: 1 }; refreshPalette(); out.offGrey = col(PAL.you) !== PAL.you; META.grantOff = {}; refreshPalette();
    // Old players: a kept GFP Tag becomes the first two grants.
    META.grants = {}; META.grantsMig = 0; META.pstains = { gfp: 1, immuno: 1 }; newGame(); out.migrated = grantHas('body') && grantHas('tracer') && !META.pstains.gfp;
    return out;
  });
  console.log(JSON.stringify(r));
  const bad = ['youGrey', 'eggKnown1', 'body', 'youCol', 'shotGrey', 'tracer', 'shotCol', 'pickupGrey', 'pickups', 'offGrey', 'migrated'].filter(k => !r[k]);
  if (r.eggKnown0) bad.push('eggKnown0');
  if (bad.length) console.log('FAIL', bad.join(','));
  await page.evaluate(() => { UI.togglePause(); const h = [...document.querySelectorAll('#pause h3')].find(x => /Stain grants/.test(x.textContent)); if (h) h.scrollIntoView(); });
  await page.waitForTimeout(300); await page.screenshot({ path: 'grants_pause.png' });
  console.log('ERRORS:', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
