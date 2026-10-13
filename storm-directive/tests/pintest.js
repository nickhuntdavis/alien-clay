const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    UI.quickStart(); G.weapons.push(makeSlot('blaster', false, 3)); recomputeAll(); G.level = 8;
    const out = {};
    // pin: pick a pk-bearing card from a box, pin it, the next boxes contain it
    let o = null; for (let i = 0; i < 50 && !o; i++) o = genLoot({ kind: 'level' }).find(x => x.pk);
    let hit = 0; for (let i = 0; i < 30; i++) { G.pins = [o.pk]; if (genLoot({ kind: 'level' }).some(x => x.pk === o.pk)) hit++; }
    out.pinHits = hit;
    // taking clears the pin
    G.pins = [o.pk]; phTaken(o); out.pinCleared = G.pins.length === 0;
    // a hidden key never appears
    const h = genLoot({ kind: 'level' }).find(x => x.pk && x.pk !== o.pk); G.pins = []; G.hides = [h.pk];
    let bad = 0; for (let i = 0; i < 200; i++) if (genLoot({ kind: i % 4 ? 'level' : 'chest' }).some(x => x.pk === h.pk)) bad++;
    out.hiddenSeen = bad;
    // buttons render
    G.hides = []; UI.lootReq = { kind: 'level' }; UI.lootOpts = genLoot(UI.lootReq); UI.renderLootCards();
    out.buttons = document.querySelectorAll('#lootCards .phb').length;
    // newGame clears both
    G.pins = ['a|b']; G.hides = ['c|d']; newGame();
    out.cleared = G.pins.length === 0 && G.hides.length === 0;
    return out;
  });
  console.log(JSON.stringify(r));
  if (r.pinHits < 30 || !r.pinCleared || r.hiddenSeen || !r.buttons || !r.cleared) console.log('FAIL pintest');
  console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
