// Weapon levels from kills, modifier screens between the branch tiers (wmods.js): a full kill bar queues the weapon's
// screen; Lv 1 > 2 is a modifier screen (3 cards for that weapon, Reroll, Skip = +2 rerolls and no level); Lv 2 > 3 is the
// branch screen; level-ups and DNA strands deal no modifier cards; every modifier loop draws on every attack type.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); WM.force = true; XBR.force = true; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    const id0 = W24_IDS.find(i => WEAPONS[i] && WUP[i] && WEAPONS[i].v10atk && !WEAPONS[i].sig);
    if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(id0, 0).apply();
    const w = G.weapons.find(x => x && !x.isSpell && x.def && x.def.v10atk);
    if (!w) return { bad: ['no weapon'], out };
    out.w = w.def.name + ' ' + w.def.v10atk + (WUP[w24Key(w)] ? ' (branches)' : '');
    // level-ups and DNA strands: no modifier cards, stat cards appear
    let mods = 0, stats = 0;
    for (let i = 0; i < 80; i++) for (const c of draftCards(3, i % 2 ? 'chest' : 'level')) { if (/^mod:|^switch$/.test(c.family || '')) mods++; if (/^stat:/.test(c.family || '')) stats++; }
    out.stats = stats;
    if (mods) bad.push(mods + ' modifier cards in level-ups');
    if (!stats) bad.push('no stat cards in 80 drafts');
    // the kill bar
    const kill = n => { for (let i = 0; i < n; i++) wmKill({}, { w }); };
    kill(wmNeed(w) - 1);
    if (G.lootQueue.length) bad.push('queued early');
    kill(1);
    const q = G.lootQueue.find(x => x.wm);
    if (!q || q.xbr) { bad.push('no modifier screen at Lv 1: ' + JSON.stringify(G.lootQueue.map(x => x.kind))); return { bad, out }; }
    kill(50); if (G.lootQueue.length !== 1) bad.push('queued twice');
    G.lootQueue = []; UI.openLoot(q);
    out.open = [G.state, $('draft').classList.contains('on'), UI.lootOpts.length, UI.lootOpts.map(o => o.title).join(', ')];
    if (G.state !== 'loot' || !UI.lootOpts.length || UI.lootOpts.length > 3) bad.push('screen: ' + out.open);
    if (UI.lootOpts.some(o => !/^wm\|/.test(o.perk))) bad.push('perk');
    if (!$('dWmRoll') || $('dWmRoll').style.display === 'none' || $('dWmSkip').style.display === 'none') bad.push('buttons');
    UI.lootOpenT = -1e6; G.rerolls = 3; const t0 = UI.lootOpts.map(o => o.title).join();
    wmReroll(); if (G.rerolls !== 2) bad.push('reroll cost');
    out.rerolled = UI.lootOpts.map(o => o.title).join(', ') + (t0 === UI.lootOpts.map(o => o.title).join() ? ' (same)' : '');
    wmSkip();
    if (G.state !== 'play' || G.rerolls !== 4 || w.lvl !== 1 || w.wmK !== 0 || w.wmQ) bad.push('skip: ' + [G.state, G.rerolls, w.lvl, w.wmK, w.wmQ]);
    // take a modifier: Lv 2
    kill(wmNeed(w)); const q2 = G.lootQueue.pop(); UI.openLoot(q2); UI.lastDown = 1e12; UI.lootOpenT = -1e6;
    const pick0 = UI.lootOpts[0].title; UI.pickLoot(0);
    out.took = pick0;
    if (w.lvl !== 2 || w.wmQ || w.wmK) bad.push('pick: lvl ' + w.lvl);
    // Lv 2 > 3: the branch screen (where the weapon has branches)
    kill(wmNeed(w)); const q3 = G.lootQueue.pop();
    out.lv3 = q3 && (q3.xbr ? 'branch' : 'modifier');
    if (WUP[w24Key(w)] && !(q3 && q3.xbr)) bad.push('no branch screen at Lv 3');
    UI.openLoot(q3); UI.lastDown = 1e12; UI.lootOpenT = -1e6;
    out.lv3cards = UI.lootOpts.map(o => o.title).join(', ');
    UI.pickLoot(0);
    if (w.lvl !== 3 || w.wmQ) bad.push('branch pick: lvl ' + w.lvl);
    if (WUP[w24Key(w)] && !wupUp(w).p) bad.push('promise not recorded');
    // every loop on every attack type
    const cv = document.createElement('canvas'); cv.style.width = '300px'; cv.style.height = '160px'; document.body.appendChild(cv);
    let drawn = 0;
    for (const atk of ['proj', 'spread', 'beam', 'contact', 'burst', 'pool']) for (const id of Object.keys(WMV_SCENE).concat('nope')) {
      const pv = makePreview(cv, Object.assign(Object.create(w.def), { v10atk: atk }), { perk: 'wm|' + id + '|#ff00ff' });
      for (let k = 0; k < 12; k++) { pv.t = k * 0.2; drawPreview(pv); drawn++; }
      dropPreview(pv);
    }
    out.drawn = drawn;
    const miss = Object.keys(MODS10).filter(id => !WMV_SCENE[id]);
    if (miss.length) bad.push('no loop for ' + miss.join(', '));
    cv.remove();
    // a screen left open for the screenshot
    kill(wmNeed(w)); const q4 = G.lootQueue.pop(); UI.openLoot(q4);
    return { bad, out };
  });
  await page.waitForTimeout(1200); await page.screenshot({ path: 'wmods.png' });
  console.log(JSON.stringify(r.out), r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'ok', errors.length ? errors : '');
  await b.close(); process.exit(r.bad.length || errors.length ? 1 : 0);
})();
