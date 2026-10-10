// Sequence Feats (seqfeats.js): each only drafts with its sequence, and each one goes off (both forks) without errors.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.devAll = 1;
    const FE = { elbows: 'vanguard', bellyflop: 'bruiser', lightbulb: 'nerd', doubleact: 'twins' }, out = {};
    for (const id in FE) {
      for (const fork of [null, 'a', 'b']) {
        META.profile = FE[id]; UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
        const w = makeSlot(id, true, fork ? 5 : 1); if (fork) w.fork = fork; computeStats(w); G.spells = [w]; recomputeAll();
        for (let i = 0; i < 8; i++) { const e = makeEnemy(ENEMIES.brute, G.player.x + 60 + i * 15, G.player.y + (i % 2 ? 30 : -30)); e.hp = e.maxHp = 1e6; G.enemies.push(e); }
        const hp0 = G.enemies.reduce((a, e) => a + e.hp, 0);
        for (let f = 0; f < 30 * 12; f++) { if (G.state === 'play') update(1 / 30); G.player.hp = G.P.maxHp; if (G.stam) G.stam.cur = stamMax(); }
        out[id + (fork || '')] = Math.round(hp0 - G.enemies.filter(e => !e.dead).reduce((a, e) => a + e.hp, 0));
      }
    }
    // Drafting: a sequence Feat only turns up with its sequence.
    META.profile = 'vanguard'; UI.sample = 's001'; newGame(); const seen = new Set();
    for (let i = 0; i < 300; i++) { const L = genLoot({ kind: 'level' }); for (const c of L) if (c && c.def && c.tag === 'NEW FEAT') seen.add(Object.keys(SPELLS).find(k => SPELLS[k] === c.def)); }
    out.drafted = ['elbows', 'bellyflop', 'lightbulb', 'doubleact'].filter(id => seen.has(id));
    return out;
  });
  const fails = Object.entries(r).filter(([k, v]) => typeof v === 'number' && !(v > 0)).map(([k]) => k);
  if (r.drafted.some(id => id !== 'elbows') || !r.drafted.includes('elbows')) fails.push('draft ' + r.drafted);
  if (fails.length) console.log('FAIL', fails.join(','));
  console.log(JSON.stringify(r), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
