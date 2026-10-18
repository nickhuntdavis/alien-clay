// v10 draft core (draft.js): one draft for everything, forks at weapon Lv 3/6/10 and Feat level 3/5, Genome slots
// shared by mutations and defences, the 40 s budget outside wave mode, banished cards never offered.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
    genLoot({ kind: 'start' })[0].apply();
    const w = G.weapons.find(Boolean);
    // A test card and a test Feat with forks
    let got = 0, rank = 0;
    draftRegister({ id: 'tcard', kind: 'acquire', slot: 'genome', family: 'test', title: 'Test Card', desc: 'x', maxRank: 2, start: true, eligible: () => true, rank: () => (G.muts && G.muts.tcard) || 0, apply: () => { G.muts = G.muts || {}; G.muts.tcard = (G.muts.tcard || 0) + 1; got++; } });
    draftRegister({ id: 'tfeat', kind: 'enhance', slot: 'feat', family: 'feat:test', title: 'Test Feat', desc: 'x', maxRank: 5, start: true, eligible: () => true, rank: () => rank, apply: () => { rank++; } });
    forkRegister('feat:tfeat', 3, [{ title: 'Left', desc: 'a', apply: () => { out.fork = 'left'; } }, { title: 'Right', desc: 'b', apply: () => { out.fork = 'right'; } }]);
    let seen = new Set();
    for (let i = 0; i < 60; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card || o.tag);
    out.seen = [...seen];
    if (!seen.has('tcard') || !seen.has('tfeat') || !seen.has('UPGRADE')) bad.push('draft pool: ' + out.seen);
    // Feat fork at level 3
    rank = 2; const fo = cardOpt(CARDS.find(c => c.id === 'tfeat')); fo.apply();
    const fq = G.lootQueue.find(q => q.kind === 'fork');
    if (!fq || fq.key !== 'feat:tfeat') bad.push('no Feat fork queued');
    else { const fc = genLoot(fq); if (fc.length !== 2) bad.push('Feat fork cards: ' + fc.length); else fc[0].apply(); }
    if (out.fork !== 'left') bad.push('Feat fork did not apply');
    // Weapon fork at Lv 3
    G.lootQueue = []; w.lvl = 2; weaponUp(w).apply();
    const wq = G.lootQueue.find(q => q.kind === 'fork' && q.w === w);
    if (w.lvl !== 3 || !wq) bad.push('no weapon fork at Lv 3 (lvl ' + w.lvl + ')');
    out.wfork = wq ? genLoot(wq).map(o => o.title) : [];
    if (wq) { UI.openLoot(wq); if (G.state !== 'loot' || !$('lootTitle').textContent.includes('FORK')) bad.push('fork screen: ' + G.state + ' ' + $('lootTitle').textContent); UI.pickLoot(0); }
    // Genome: 4 slots shared with defences
    G.muts = { a: 1, b: 1, c: 1 }; pdef().n.thick = 1;
    if (genomeFree() !== 0) bad.push('genome free: ' + genomeFree());
    G.muts.tcard = 0; if (cardOk(CARDS.find(c => c.id === 'tcard'))) bad.push('acquire offered with Genome full');
    // Banish
    G.muts = {}; G.banish = { tcard: true }; seen = new Set();
    for (let i = 0; i < 40; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card);
    if (seen.has('tcard')) bad.push('banished card offered');
    // Budget outside wave mode
    G.draftT = null; const a1 = draftBox({ kind: 'level' }), a2 = draftBox({ kind: 'level' }); G.t += 41; const a3 = draftBox({ kind: 'level' });
    if (a1 !== true || a2 !== 'wait' || a3 !== true) bad.push('budget: ' + [a1, a2, a3]);
    if (draftBox({ kind: 'fork', w, lv: 5 }) === 'wait') bad.push('fork held back by the budget');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
