// Long loot lists get tabs, chips, search and sort (lootfilter.js); attack-type modifiers swap with a warning and are
// dealt less once a weapon has one (atkswap.js); the Laser has a pictogram.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    // 1. Sandbox: the weapon pick and a level-up list get the bar
    UI.sample = 's010'; META.profile = 'human1'; newGame(); G.state = 'play'; UI.show('hud'); UI.openLoot(G.lootQueue.shift());
    return new Promise(res => setTimeout(() => {
      const vis = () => [...document.querySelectorAll('#lootCards .card')].filter(c => c.style.display !== 'none').length;
      const visT = () => [...document.querySelectorAll('#dTabs .dtab')].filter(c => c.style.display !== 'none').length;
      out.wBar = !!document.getElementById('lfBar'); out.wN = visT();
      if (!out.wBar || out.wN < 20) bad.push('weapon pick bar ' + [out.wBar, out.wN]);
      const tab = [...document.querySelectorAll('[data-lft]')].find(t => t.dataset.lft === 'a:beam'); if (tab) tab.click(); out.beam = visT();
      if (!tab || !(out.beam > 0 && out.beam < out.wN)) bad.push('attack tab ' + out.beam);
      const q = document.querySelector('.lfQ'); q.value = 'laser'; q.dispatchEvent(new Event('input')); out.laser = visT(); out.sel = UI.lootOpts[UI.draft.i].title;
      if (out.laser !== 1 || out.sel !== 'Laser') bad.push('search laser ' + [out.laser, out.sel]);
      out.picto = pictoKey('Laser', 'weapon'); if (out.picto !== 'spark-of-life') bad.push('laser picto ' + out.picto);
      // take the Laser, then a level-up list
      const L = UI.lootOpts.find(o => o.title === 'Laser') || UI.lootOpts[0]; L.apply(); UI.lf = {};
      G.lootQueue = []; UI.openLoot({ kind: 'level' });
      setTimeout(() => {
        out.lBar = !!document.getElementById('lfBar'); out.lN = vis(); out.tabs = [...document.querySelectorAll('[data-lft]')].map(t => t.textContent);
        if (!out.lBar || !out.tabs.includes('PASSIVES')) bad.push('level bar ' + JSON.stringify(out.tabs));
        const pt = [...document.querySelectorAll('[data-lft]')].find(t => t.dataset.lft === 'passive'); pt.click(); out.pass = vis();
        const chip = document.querySelector('[data-lfc]:not([data-lfc="all"])'); if (chip) chip.click(); out.chip = vis();
        if (!(out.pass > 0 && out.pass < out.lN) || !(out.chip > 0 && out.chip <= out.pass)) bad.push('passive tab/chip ' + [out.pass, out.chip]);
        document.querySelector('[data-lfs="az"]').click(); const shown = [...document.querySelectorAll('#lootCards .card')].filter(c => c.style.display !== 'none').sort((a, b) => a.style.order - b.style.order).map(c => c.querySelector('.ct, .title, b') ? c.textContent : '');
        out.sorted = shown.length;
        UI.closeLoot && UI.closeLoot();
        // 2. Attack-type swap: Melee then Mines on one weapon
        const w = G.weapons.find(Boolean); w.m10 = []; G.mmM = [];
        const ok1 = modAdd(w, 'melee'); modAdd(w, 'melee'); (w.mmB || (w.mmB = {})).melee = 'B';
        const card = modCard(w, 'mines'); out.warn = [card.warn, card.tag, card.desc.slice(0, 40)];
        const ok2 = modAdd(w, 'mines'); out.after = (w.m10 || []).join();
        if (!ok1 || !ok2 || !card.warn || w.m10.includes('melee') || !w.m10.includes('mines') || (w.mmB && w.mmB.melee)) bad.push('swap ' + JSON.stringify([ok1, ok2, out.after, out.warn]));
        // 3. Draft weight: another attack type is rarer once one is held
        const c = modDraftCands('level').find(x => x.fam === 'mod:dfa'); const c2 = modDraftCands('level').find(x => x.fam === 'mod:knock');
        out.w = [c && +c.w.toFixed(3), c2 && +c2.w.toFixed(3)]; if (!c || !(c.w < 0.5)) bad.push('weight ' + out.w);
        res({ bad, out });
      }, 600);
    }, 900));
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
