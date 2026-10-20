// v9 upgrades and mutations brought back (v9back.js): every card registers with a valid shape; upgrades rank to their cap
// and change G.P; v9 mutations are dealt by elites (mdIsMut), use a Genome slot, run genes.js mutTake and retire once
// taken; the draft deals upgrade cards; a run holding all of them plays 20 s without errors.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    draftAbsorb();
    const fresh = () => { UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; if (!G.stam) stamInit(); };
    const ups = CARDS.filter(c => c.id.startsWith('up_')), muts = CARDS.filter(c => c.id.startsWith('g_'));
    out.ups = ups.length; out.muts = muts.length;
    if (ups.length < 12) bad.push('only ' + ups.length + ' upgrades');
    if (muts.length < 25) bad.push('only ' + muts.length + ' v9 mutations');
    const names = new Set(CARDS.filter(c => !c.id.startsWith('up_') && !c.id.startsWith('g_')).map(c => c.title.toLowerCase()));
    for (const c of ups.concat(muts)) {
      if (!c.title || !c.desc || !c.icon || !c.color || typeof c.apply !== 'function' || typeof c.eligible !== 'function') bad.push('shape ' + c.id);
      if (/\b(cast|element|cooties|oil|water|armour|dodge)\b/i.test(c.desc)) bad.push('retired word in ' + c.id + ': ' + c.desc);
      if (names.has(c.title.toLowerCase())) bad.push('name clash ' + c.id);
    }
    // upgrades: rank to the cap, change G.P, and leave the pool when full
    fresh();
    for (const c of ups) {
      try {
        const before = JSON.stringify(G.P);
        let n = 0; while (cardOk(c) && n < 10) { cardOpt(c).apply(); n++; }
        if (n > c.maxRank) bad.push(c.id + ' ranked past its cap');
        if (n && JSON.stringify(G.P) === before && !['temporal'].includes(c.id.slice(3))) bad.push(c.id + ' changed nothing');
        if (n && c.rank() !== n) bad.push(c.id + ' rank ' + c.rank() + ' after ' + n);
      } catch (err) { bad.push(c.id + ' threw: ' + err.message); }
    }
    // the draft deals upgrade cards
    fresh(); let seen = 0;
    for (let i = 0; i < 40; i++) seen += draftCards(3, 'level').filter(o => o.card && o.card.startsWith('up_')).length;
    out.upPerDraft = +(seen / 40).toFixed(2);
    if (!seen) bad.push('no upgrade cards in 40 drafts');
    // mutations: elites deal them, Genome slot, mutTake, retire
    fresh();
    for (const c of muts) if (!mdIsMut(c)) bad.push(c.id + ' not dealt by elites');
    if (!mdOk().some(c => c.id.startsWith('g_'))) bad.push('no v9 mutation on the mutation screen');
    const g = muts.find(c => c.id === 'g_tcells'), free0 = genomeFree();
    cardOpt(g).apply();
    if (!G.mut.tcells) bad.push('mutTake not run');
    if (genomeFree() !== free0 - 1) bad.push('no Genome slot used');
    if (cardOk(g)) bad.push('taken mutation still offered');
    while (genomeFree() > 0) { const c = mdOk().find(x => x.slot === 'genome'); if (!c) break; cardOpt(c).apply(); }
    if (muts.some(c => cardOk(c))) bad.push('v9 mutation offered with a full Genome');
    // each v9 mutation applies on its own without errors
    for (const c of muts) { try { fresh(); cardOpt(c).apply(); } catch (err) { bad.push(c.id + ' threw: ' + err.message); } }
    // a run with everything: 20 s of play
    try {
      fresh(); UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.P.maxHp = G.player.hp = 1e6; G.nextBoss = 1e9;
      for (const c of ups) { let n = 0; while (cardOk(c) && n++ < 5) cardOpt(c).apply(); }
      for (const id of ['g_spite', 'g_tcells', 'g_codependency', 'g_tooangry']) cardOpt(CARDS.find(c => c.id === id)).apply();
      for (let i = 0; i < 20 * 60; i++) { update(1 / 60); if (G.state === 'bossIntro') G.state = 'play'; if (G.state !== 'play') { G.lootQueue = []; G.state = 'play'; } }
      out.kills = G.kills;
    } catch (err) { bad.push('run threw: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
    out.bad = bad;
    return out;
  });
  console.log(JSON.stringify(r));
  if (r.bad.length) console.log('FAIL ' + r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
