// One modifier card, choose the weapon (modpick.js): a modifier fitting 2+ weapons is dealt once with weapon chips,
// the draft keeps its card count, the bot / a card tap picks the best weapon, a chip puts it on that weapon.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    const ids = W24_IDS.filter(i => WEAPONS[i] && WEAPONS[i].v10atk === 'proj' && !WEAPONS[i].sig).slice(0, 3);
    for (const id of ids) { if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(id, 0).apply(); }
    const ws = G.weapons.filter(w => w && !w.isSpell && w.def && w.def.v10atk); out.n = ws.length;
    if (ws.length < 2) { bad.push('need 2 weapons, got ' + ws.length); return { bad, out }; }
    ws[0].lvl = 4;
    let merged = 0, sizes = [], dupes = 0;
    for (let i = 0; i < 60; i++) {
      const cards = draftCards(3, 'chest'); sizes.push(cards.length);
      const t = cards.filter(c => c.family && c.family.startsWith('mod:')).map(c => c.family);
      if (new Set(t).size !== t.length) dupes++;
      if (cards.some(c => c.pickW)) merged++;
    }
    out.merged = merged; out.minCards = Math.min(...sizes);
    if (!merged) bad.push('no merged card in 60 drafts');
    if (dupes) bad.push('same modifier dealt twice: ' + dupes);
    if (Math.min(...sizes) < 3) bad.push('draft short of cards: ' + Math.min(...sizes));
    let c = null; for (let i = 0; i < 200 && !c; i++) c = draftCards(3, 'chest').find(x => x.pickW);
    if (!c) { bad.push('no card to test'); return { bad, out }; }
    out.card = [c.title, c.sub, c.pickW.map(p => p.n + '/' + p.max).join(' ')];
    const id = c.family.slice(4), best = ws.slice().sort((a, b) => b.lvl - a.lvl)[0];
    c.pickW = c.pickW; c.apply(undefined); // bot / plain tap
    const held = ws.filter(w => modCount(w, id) > 0);
    if (held.length !== 1 || (modOk(best, id) && held[0] !== best && c.pickW.some(p => p.uid === best.uid))) bad.push('bot pick: ' + held.map(w => w.id));
    // chip pick on the other weapon
    let c2 = null; for (let i = 0; i < 300 && !c2; i++) c2 = draftCards(3, 'chest').find(x => x.pickW && x.pickW.length >= 2);
    if (c2) { const id2 = c2.family.slice(4), tgt = c2.pickW[c2.pickW.length - 1], w = ws.find(x => x.uid === tgt.uid), before = modCount(w, id2); c2.apply(tgt.uid); if (modCount(w, id2) !== before + 1) bad.push('chip pick missed'); }
    G.lootQueue = []; UI.openLoot({ kind: 'level' });
    return { bad, out };
  });
  await page.waitForTimeout(2500); await page.screenshot({ path: 'out/modpick.png' });
  console.log(JSON.stringify(r.out), r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'ok', errors.length ? errors : '');
  await b.close(); process.exit(r.bad.length || errors.length ? 1 : 0);
})();
