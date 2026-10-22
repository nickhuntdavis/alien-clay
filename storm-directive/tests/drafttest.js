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
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; // (Baseline: a starter with branch cards, not a v9 weapon)
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
    // The old branch screens are retired (22 Oct, modmatrix.js): no weapon upgrade screen; a weapon levels by taking modifiers.
    G.lootQueue = []; w.lvl = 1; G.level = 3; wupLevel(4);
    if (G.lootQueue.some(q => q.kind === 'wup')) bad.push('a weapon branch screen still opens');
    const mid = modsFor(w)[0]; if (!mid || !modAdd(w, mid) || w.lvl !== 2) bad.push('a modifier did not level the weapon: ' + w.lvl);
    // Sperm passives: 2 slots at the start (+1 at Lv 8, 16, 24), shared with defences (spassives.js)
    G.muts = { a: 1 }; pdef().n.thick = 1;
    if (spSlots() !== 2) bad.push('sperm passive slots at Lv 3: ' + spSlots());
    if (genomeFree() !== 0) bad.push('genome free: ' + genomeFree());
    G.muts.tcard = 0; if (cardOk(CARDS.find(c => c.id === 'tcard'))) bad.push('acquire offered with Genome full');
    // Banish
    G.muts = {}; G.banish = { tcard: true }; seen = new Set();
    for (let i = 0; i < 40; i++) for (const o of genLoot({ kind: 'level' })) seen.add(o.card);
    if (seen.has('tcard')) bad.push('banished card offered');
    // The Reward Director outside wave mode (director.js): one screen per 30 s, forks never held back
    G.wave = null; G.dir = null; const a1 = draftBox({ kind: 'level' }), a2 = draftBox({ kind: 'level' }); G.t += 31; const a3 = draftBox({ kind: 'level' });
    if (a1 !== true || a2 !== 'wait' || a3 !== true) bad.push('director pacing: ' + [a1, a2, a3]);
    if (draftBox({ kind: 'fork', w, lv: 5 }) === 'wait') bad.push('fork held back by the director');
    // Order, no merging (V11): a mutation outranks level drafts; stacked level drafts stay separate screens of three
    G.lootQueue = [{ kind: 'level' }, { kind: 'level' }, { kind: 'mutation' }, { kind: 'level' }]; dirTick();
    out.queue = G.lootQueue.map(q => q.kind + (q.picks ? 'x' + q.picks : ''));
    if (out.queue.join() !== 'mutation,level,level,level') bad.push('director queue: ' + out.queue);
    if (genLoot({ kind: 'level' }).length !== 3) bad.push('level screen not three cards');
    // A stack plays back to back: closing a screen with more waiting opens the next one inside the gap
    G.dir = null; draftBox({ kind: 'level' }); G.t += 1; dirPicked(); G.t += 0.1;
    if (draftBox({ kind: 'level' }) !== true) bad.push('stacked screen held back');
    G.t += 0.1; if (draftBox({ kind: 'level' }) !== 'wait') bad.push('gap gone after the stack');
    // Starvation: a level draft that has waited long enough goes before a fresh DNA strand
    G.lootQueue = [{ kind: 'level', dirAt: G.t - 120 }, { kind: 'chest' }]; dirTick();
    if (G.lootQueue[0].kind !== 'level') bad.push('old level draft starved by a strand');
    G.lootQueue = [];
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
