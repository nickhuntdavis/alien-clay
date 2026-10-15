// Lab view (default) vs Arcade view, the one-time Arcade offer after Petri Dish wave 1, and swimmer skins for wins.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => splashEnd()); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const out = { def: SET.view };
    UI.quickStart(); G.lootQueue = []; G.state = 'play';
    refreshPalette(); out.labTerrain = col('#7fbf2a'); out.labYou = col(PAL.you) === PAL.you;
    SET.view = 'arcade'; refreshPalette(); out.arcTerrain = col('#7fbf2a'); out.arcElem = col(ELEMENTS.soul.color);
    SET.view = 'lab'; refreshPalette();
    META.arcadeAsked = 0; G.tutQ = []; viewOffer({ camp: true, n: 1 }); out.offer = (G.tutQ || []).includes('arcade') || G.tutNow === 'arcade'; out.asked = META.arcadeAsked;
    viewOffer({ camp: true, n: 1 }); out.once = G.tutQ.filter(k => k === 'arcade').length;
    META.dyes = { egfp: true }; const a = skinEarn(), c = skinEarn(); out.skins = [a && a.id, c && c.id, Object.keys(META.dyes).length];
    out.buy = metaBuy('dye', 'neon'); out.wear = metaBuy('dye', a.id) && META.dye === a.id;
    return out;
  });
  console.log(JSON.stringify(r));
  const ELEM_SOUL = '#bff4ff';
  const ok = r.def === 'lab' && /^rgb/.test(r.labTerrain) && r.labYou && r.arcTerrain === '#7fbf2a' && r.arcElem === ELEM_SOUL && r.asked === 1 && r.once <= 1 && r.skins.join() === 'emerald,aqua,3' && r.buy === false && r.wear;
  console.log('ERRORS', JSON.stringify(errors), ok ? 'ok' : 'FAIL');
  await b.close();
})();
