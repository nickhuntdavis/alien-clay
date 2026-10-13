const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const fails = [];
  for (const mode of ['s002', 's007']) {
    const r = await page.evaluate((mode) => {
      META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; SET.auto = false;
      UI.sample = mode; newGame(); UI.show('hud'); G.state = 'play';
      while (G.lootQueue.length) { UI.openLoot(G.lootQueue.shift()); UI.pickLoot(0); }
      G.t = 200; const out = {};
      // Give the Recycler something to eat: three modifiers.
      const w = G.weapons.find(Boolean); const ids = Object.keys(MODS).filter(id => !MODS[id].kinds || MODS[id].kinds.includes(w.def.kind)).slice(0, 3);
      for (const id of ids) w.mods.push({ id, elem: null, p: 1 }); computeStats(w);
      const mods = () => G.weapons.reduce((a, x) => a + (x ? x.mods.length : 0), 0);
      for (const rule of ['double', 'sachet', 'recycler', 'cursed', 'empty']) {
        G.state = 'play'; const req = { kind: 'level', rule };
        UI.openLoot(req);
        out[rule] = { n: UI.lootOpts.length, title: document.getElementById('lootTitle').textContent, sealed: UI.lootOpts.every(o => o.sealed), gamble: UI.lootOpts.some(o => o.gamble) };
        if (rule === 'recycler') {
          const before = mods(); const o = UI.lootOpts[0];
          out.recycler.locked = !!(o.locked && o.locked());
          req.recSel = [w.uid + ':' + w.mods[0].id, w.uid + ':' + w.mods[1].id];
          UI.pickLoot(0); out.recycler.removed = before - mods();
        } else if (rule === 'empty') {
          UI.pickLoot(0); out.empty.flag = G.immNext;
          G.state = 'play'; UI.openLoot({ kind: 'level' });
          out.empty.next = UI.lootOpts.map(o => o.rarity); out.empty.flagAfter = G.immNext; out.empty.title = document.getElementById('lootTitle').textContent;
          UI.pickLoot(0);
        } else if (rule === 'cursed') {
          out.cursed.rar = UI.lootOpts[0].rarity; UI.pickLoot(0);
        } else UI.pickLoot(0);
      }
      // Rerolls keep the rule; no rule before 2 minutes.
      G.state = 'play'; const rq = { kind: 'chest', rule: 'sachet' }; UI.openLoot(rq); G.rerolls = 3; UI.reroll(); out.rerollKeeps = UI.lootOpts.every(o => o.sealed); UI.pickLoot(0);
      G.t = 10; const early = { kind: 'level' }; G.state = 'play'; UI.openLoot(early); out.early = early.rule; UI.pickLoot(0);
      G.t = 300; let n = 0; for (let i = 0; i < 300; i++) { const q = { kind: 'level' }; weirdAssign(q); if (q.rule) n++; const s = { kind: 'slot' }; weirdAssign(s); if (s.rule) n += 1000; } out.rate = n;
      return out;
    }, mode);
    console.log(mode, JSON.stringify(r));
    for (const k of ['double', 'sachet', 'recycler', 'cursed', 'empty']) if (!r[k] || !r[k].n) fails.push(mode + ' ' + k + ' empty');
    if (!r.double.gamble) fails.push(mode + ' no gamble');
    if (!r.sachet.sealed) fails.push(mode + ' not sealed');
    if (!r.recycler.locked || r.recycler.removed !== 2) fails.push(mode + ' recycler ' + JSON.stringify(r.recycler));
    if (r.cursed.rar !== 5) fails.push(mode + ' cursed rarity ' + r.cursed.rar);
    if (!r.empty.flag || r.empty.next.length !== 3 || !r.empty.next.every(x => x === 6) || r.empty.flagAfter) fails.push(mode + ' empty ' + JSON.stringify(r.empty));
    if (!r.rerollKeeps || r.early) fails.push(mode + ' reroll/early');
    if (r.rate < 20 || r.rate > 90) fails.push(mode + ' rate ' + r.rate);
  }
  console.log(fails.length ? 'FAIL ' + fails.join('; ') : 'weirdbox ok'); console.log('ERRORS', errors.length ? errors.slice(0, 4) : []); await b.close();
})();
