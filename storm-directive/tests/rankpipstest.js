// Rank pips on loot cards (rankpips.js): a card that ranks up something held shows "Lv N" and N pips, the last one lit;
// a new card shows none.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  await page.evaluate(() => { UI.sample = 's002'; newGame(); G.state = 'play'; UI.show('hud'); UI.openLoot(G.lootQueue.shift()); UI.lootOpts[0].apply(); G.lootQueue = []; UI.openLoot({ kind: 'level' }); });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    pdef().n.thorns = 2; pdef().n.evasion = 0;
    const w = G.weapons.find(x => x && !x.isSpell), mid = Object.keys(MODS10).find(id => modOk(w, id));
    w.m10 = [mid];
    UI.lootOpts = [pdefCard('thorns'), modCard(w, mid), pdefCard('evasion')];
    UI.renderLootCards();
    const read = c => { const p = c.querySelector('.rpips'); return p ? [p.querySelector('b').textContent, p.querySelectorAll('i.on').length, p.querySelectorAll('i.up').length, p.querySelectorAll('i').length] : null; };
    out.mod = (({ card, modFor, sub, tag }) => ({ card, modFor, sub, tag, mid, w: w.def.name, n: modCount(w, mid) }))(UI.lootOpts[1]);
    out.cards = [...document.querySelectorAll('#lootCards .card')].map(read);
    const [a, m, n] = out.cards;
    if (!a || a[0] !== 'Lv 3' || a[1] !== 2 || a[2] !== 1 || a[3] !== 3) bad.push('thorns ' + JSON.stringify(a));
    if (!m || m[0] !== 'Lv 2' || m[1] !== 1 || m[2] !== 1) bad.push('mod ' + JSON.stringify(m));
    if (n) bad.push('new card has pips ' + JSON.stringify(n));
    // The Runs at rank 1: its card shows the next rank's numbers
    G.muts = G.muts || {}; G.muts.sp_runs = 1;
    const runs = CARDS.find(c => c.id === 'sp_runs'); UI.lootOpts = [cardOpt(runs)]; UI.renderLootCards();
    const rc = document.querySelector('#lootCards .card'); out.runs = [rc.querySelector('.rwfit') && rc.querySelector('.rwfit').textContent, read(rc)];
    if (!out.runs[0] || !/Area .* → /.test(out.runs[0]) || !out.runs[1] || out.runs[1][0] !== 'Lv 2') bad.push('runs ' + JSON.stringify(out.runs));
    return { bad, out };
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/rankpips.png') });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
