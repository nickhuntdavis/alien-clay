const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.pstains = { gfp: 1, immuno: 1, luciferase: 1 }; META.pstainOff = { luciferase: 1 };
    UI.quickStart(); G.weapons.push(makeSlot('blaster', false, 3)); recomputeAll();
    let dupes = 0, stainOn = 0, luci = 0, boxes = 0, short = 0;
    for (let i = 0; i < 3000; i++) { G.level = 4 + (i % 40); const o = genLoot({ kind: i % 5 ? 'level' : 'chest' }); boxes++; if (o.length < 3) short++;
      const keys = o.map(x => x.title + '|' + (x.modFor || '')); if (new Set(keys).size < keys.length) dupes++;
      for (const x of o) { if (x.tag === 'STAIN' && /GFP|Anti-Immune/.test(x.title)) stainOn++; if (x.tag === 'STAIN' && /Luciferase/.test(x.title)) luci++; } }
    return { boxes, dupes, short, stainsAlreadyOnOffered: stainOn, offStainOffered: luci };
  });
  console.log(JSON.stringify(r)); console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
