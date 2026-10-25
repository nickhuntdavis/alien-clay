// Switched at Birth in three levels (sabtiers.js): per weapon that can switch, run an arena at Lv 1 (35%), Lv 2 (70%),
// Lv 3 Full (100%) and Lv 3 Blend, and count which damage type each hit used. Also checks the card chain and the fork screen.
const { chromium } = require('playwright');
const ONLY = process.argv[2] || '';
(async () => {
  const b = await chromium.launch(); const errors = [], bad = [], rows = [];
  const INDEX = 'file://' + require('path').resolve(__dirname, '../web/index.html');
  const wids = await (async () => { const p = await b.newPage(); p.on('pageerror', e => errors.push(e.message)); await p.goto(INDEX); await p.evaluate(() => (window.TUT_OFF = 1, splashEnd())); const r = await p.evaluate(() => Object.keys(MM_SAB)); await p.close(); return r; })();
  for (const wid of wids.filter(x => !ONLY || x === ONLY)) {
    const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(wid + ': ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
    await page.goto(INDEX); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(150);
    const r = await page.evaluate((wid) => {
      const out = { wid, runs: {}, bad: [] };
      MATRIX_ONLY.force = true; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
      const setup = () => {
        UI.sample = 's000'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons.length = 0; G.weapons.push(null);
        optNewWeapon(wid, 0).apply(); const w = G.weapons.find(x => x && (x.sid || x.id) === wid);
        w.lvl = Math.max(w.lvl, 6); computeStats(w); return w;
      };
      const arena = (w, secs) => {
        const p = G.player, cx = p.x, cy = p.y, N = 12, C = { n: 0, byElem: {}, echo: 0 };
        const put = far => { const a = Math.random() * 6.283, r = far ? 250 + Math.random() * 170 : 70 + Math.random() * 300, e = makeEnemy(ENEMIES.crawler, cx + Math.cos(a) * r, cy + Math.sin(a) * r); e.hp = e.maxHp = 3000; e.speed *= 0.4; e.xp = 0; G.enemies.push(e); return e; };
        const es = []; for (let i = 0; i < N; i++) es.push(put(false));
        hookOn('hit:late', 'sabt', (e, d, src) => { if (src.w !== w || src.dot) return; C.n++; C.byElem[src.elem] = (C.byElem[src.elem] || 0) + 1; if (src.sabEcho) C.echo++; }, -5);
        for (let f = 0; f < 30 * secs; f++) {
          update(1 / 30); p.x = cx; p.y = cy; p.vx = p.vy = 0; p.hp = G.P.maxHp; G.P.spawnMult = 0; G.lootQueue.length = 0;
          for (let i = 0; i < N; i++) { const e = es[i]; if (!e || e.dead || !G.enemies.includes(e)) es[i] = put(true); else { e.hp = e.maxHp; if (Math.hypot(e.x - cx, e.y - cy) < 45) { e.x = cx + 300; e.y = cy; } } }
        }
        HOOKS['hit:late'] = HOOKS['hit:late'].filter(h => h.name !== 'sabt');
        return C;
      };
      const t = MM_SAB[wid];
      for (const cfg of ['L1', 'L2', 'FULL', 'BLEND']) {
        const w = setup(), orig = w.def.elem;
        sabSwitch(w, t); sabInit(w);
        if (!w.sab) { out.bad.push('no w.sab after switch'); break; }
        if (!mmHeld(w).has('chemistry')) out.bad.push('chemistry not held');
        if (cfg !== 'L1') { w.sab.lv = 2; if (cfg !== 'L2') { w.sab.lv = 3; w.sab.mode = cfg === 'FULL' ? 'full' : 'blend'; } }
        sabFace(w, true);
        const c = arena(w, 12);
        if (mmHeld(w).has('chemistry') !== true) out.bad.push(cfg + ': chemistry slot dropped');
        out.runs[cfg] = { n: c.n, newShare: c.n ? +(((c.byElem[t] || 0) - c.echo * 0) / c.n).toFixed(2) : null, byElem: c.byElem, echo: c.echo, orig, t };
      }
      return out;
    }, wid);
    rows.push(r); for (const x of r.bad) bad.push(wid + ': ' + x);
    await page.close();
  }
  for (const r of rows) console.log(r.wid, JSON.stringify(Object.fromEntries(Object.entries(r.runs).map(([k, v]) => [k, [v.n, v.newShare, v.echo]]))));
  // card chain + fork
  const page = await b.newPage(); page.on('pageerror', e => errors.push(e.message)); await page.goto(INDEX); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(150);
  const c = await page.evaluate(() => {
    const bad = [];
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.weapons.length = 0; G.weapons.push(null);
    optNewWeapon('v_phys_proj', 0).apply(); const w = G.weapons.find(x => x);
    let card = null; for (let i = 0; i < 30 && !card; i++) card = sabCard();
    if (!card || card.desc !== 'TODO_COPY:sab_l1_desc') bad.push('l1 card ' + JSON.stringify(card && card.desc));
    card.apply(); if (!w.sab || w.sab.lv !== 1) bad.push('no level 1');
    for (let i = 0; i < 60 && w.sab.lv < 2; i++) { const k = sabCard(); if (k && /Level 1 > 2/.test(k.sub)) k.apply(); }
    if (w.sab.lv !== 2) bad.push('no rank 2');
    for (let i = 0; i < 60 && w.sab.lv < 3; i++) { const k = sabCard(); if (k && /Level 2 > 3/.test(k.sub)) k.apply(); }
    if (w.sab.lv !== 3) bad.push('no rank 3');
    const q = G.lootQueue[0]; if (!q || q.kind !== 'fork' || q.key !== 'sab') bad.push('no fork queued');
    const fc = forkCards(q); if (fc.length !== 2) bad.push('fork cards ' + fc.length);
    fc[1].apply(); if (w.sab.mode !== 'blend') bad.push('blend not chosen');
    if (sabUps().length) bad.push('rank-up still offered at 3');
    return bad;
  });
  bad.push(...c);
  console.log(bad.length ? 'FAIL ' + bad.join(' | ') : 'ok', errors.length ? errors : 'no errors'); await b.close();
})();
