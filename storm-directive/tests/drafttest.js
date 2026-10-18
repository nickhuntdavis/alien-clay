// v10 draft core (draft.js): one draft for everything, forks at weapon Lv 3/6/10 and Feat level 3/5, Genome slots
// shared by mutations and defences, every draft opening at once (no spacing), banished cards never offered.
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
    for (let i = 0; i < 250; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card || o.tag);
    out.seen = [...seen];
    if (!seen.has('tcard') || !seen.has('tfeat') || seen.has('UPGRADE')) bad.push('draft pool (no weapon cards in level drafts): ' + out.seen);
    // Feat fork at level 3
    rank = 2; const fo = cardOpt(CARDS.find(c => c.id === 'tfeat')); fo.apply();
    const fq = G.lootQueue.find(q => q.kind === 'fork');
    if (!fq || fq.key !== 'feat:tfeat') bad.push('no Feat fork queued');
    else { const fc = genLoot(fq); if (fc.length !== 2) bad.push('Feat fork cards: ' + fc.length); else fc[0].apply(); }
    if (out.fork !== 'left') bad.push('Feat fork did not apply');
    // Weapon upgrades: their own screen every 4th level; tiers 1 > 2 > 3 > 4 (internal levels 1, 3, 6, 10); one mastery a run
    G.lootQueue = []; w.lvl = 1; G.level = 3; wupLevel(4);
    const uq = G.lootQueue.find(q => q.kind === 'wup');
    if (!uq) bad.push('no weapon upgrade screen at level 4');
    else {
      UI.openLoot(uq); if (G.state !== 'loot' || !/WEAPON UPGRADE/.test($('lootTitle').textContent)) bad.push('wup screen: ' + G.state + ' ' + $('lootTitle').textContent);
      out.wfork = UI.lootOpts.map(o => o.title); if (UI.lootOpts.length !== 3) bad.push('tier 2 cards: ' + out.wfork);
      UI.pickLoot(0); if (wTier(w) !== 2 || w.lvl !== 3 || !(w.up && w.up.p)) bad.push('tier 2 not taken: lvl ' + w.lvl);
    }
    G.lootQueue = []; wupLevel(5); if (G.lootQueue.some(q => q.kind === 'wup')) bad.push('wup screen off the 4-level beat');
    wupRaise(w, 6)[0].apply(); wupRaise(w, 10)[0].apply();
    if (wTier(w) !== 4) bad.push('tier 4: ' + wTier(w));
    const w2 = makeSlot(W24_IDS.find(id => id !== w24Key(w)), false, 1); G.weapons[1] = w2; w2.lvl = 6;
    if (wupNextLv(w2)) bad.push('second mastery offered');
    G.weapons[1] = null;
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
    if (a1 !== true || a2 !== true || a3 !== true) bad.push('every draft opens at once: ' + [a1, a2, a3]);
    if (draftBox({ kind: 'fork', w, lv: 5 }) === 'wait') bad.push('fork held back by the budget');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
