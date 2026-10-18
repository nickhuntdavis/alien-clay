// Per-weapon telemetry (wstats.js): held time, dps, uptime, targets, distance in the run log; log keeps 60 runs.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {}, def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    const run = id => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; G.enemies.length = 0;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 70 + (i % 3) * 40; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); }
      for (let f = 0; f < 600; f++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); }
      const s = wsSummary(G); return { s, w: s.w[0], txt: runText(runSummary(G, 'CLOSED')) };
    };
    const a = run('v_phys_proj'), c = run('v_phys_burst');
    for (const [n, x] of [['Standard Issue', a.w], ['Panic Button', c.w]]) {
      if (!x) { bad.push(n + ' no entry'); continue; }
      if (!(x.held > 0)) bad.push(n + ' held ' + x.held);
      if (!(x.dps > 0)) bad.push(n + ' dps ' + x.dps);
      if (!(x.upPct > 0 && x.upPct <= 100)) bad.push(n + ' up ' + x.upPct);
      if (!(x.tgt >= 1)) bad.push(n + ' tgt ' + x.tgt);
      if (!(x.dist > 0)) bad.push(n + ' dist ' + x.dist);
    }
    if (a.w && c.w && !(c.w.tgt > a.w.tgt)) bad.push(`tgt Panic ${c.w.tgt} not > Standard ${a.w.tgt}`);
    if (!a.txt.includes(' wpn ')) bad.push('runText has no wpn line');
    out.lines = (a.txt + c.txt).split('\n').filter(l => l.startsWith(' wpn ')).join('\n');
    // A draft pick is recorded
    UI.sample = 's001'; newGame(); G.state = 'play';
    const q = G.lootQueue[0]; UI.openLoot(q); const n = UI.lootOpts.length; UI.pickLoot(1 % n);
    const t = runText(runSummary(G, 'CLOSED'));
    if (!/ offers: start\[.+>.+\]/.test(t)) bad.push('no offers line');
    out.offers = (t.split('\n').filter(l => l.includes('offers'))[0] || '').slice(0, 200);
    // Sandbox marker and live save
    UI.sample = 's010'; UI.sbN = 1; newGame(); G.state = 'play'; G.lootQueue = [];
    G.weapons[0] = makeSlot('v_phys_proj', false, 1); recomputeAll(); G.t = 40; G.debug.sb.heat = 2;
    localStorage.removeItem('sd_live'); liveSave(G);
    if (!localStorage.getItem('sd_live')) bad.push('sandbox run not live-saved');
    out.sandbox = runText(runSummary(G, 'CLOSED')).split('\n')[1];
    if (!out.sandbox.includes('[SANDBOX heat 2]')) bad.push('no sandbox marker');
    G = null; localStorage.removeItem('sd_live');
    // The run log keeps 60
    RUNLOG.length = 0; for (let i = 0; i < 65; i++) RUNLOG.push({ n: i + 1 }); saveRunLog();
    if (RUNLOG.length !== 60 || RUNLOG[0].n !== 6) bad.push('RUNLOG ' + RUNLOG.length);
    if (JSON.parse(localStorage.getItem('sd_runs')).length !== 60) bad.push('stored runs');
    RUNLOG.length = 0; saveRunLog();
    return { bad, out };
  });
  console.log(JSON.stringify(r.out, null, 1));
  console.log('wstatstest:', r.bad.length || errors.length ? 'FAIL ' + r.bad.concat(errors).join(' | ') : 'ok');
  await b.close(); process.exit(r.bad.length || errors.length ? 1 : 0);
})();
