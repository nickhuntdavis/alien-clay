// Stat bonuses and weapon base stats (statup.js): modifier cards bank a stat and show it; every matrix weapon has its
// own base stats, shown on the weapon draft, and deals about what it did before over 20 s on dummies.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; voiceLine = () => null; }); await page.waitForTimeout(300); // (no first-sighting cards or narrator lines: a line fired in one run and not its twin spends the seeded dice differently)
  const r = await page.evaluate(() => {
    const bad = [], out = { dps: [] }, def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    const R0 = Math.random; let seed = 1;
    const run = id => {
      Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; // (same dice both sides)
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      const p = G.player; p.x = 0; p.y = 0; G.enemies.length = 0; const es = [];
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 70 + (i % 3) * 50; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); es.push(e); }
      for (let f = 0; f < 1200; f++) { G.state = 'play'; G.lootQueue.length = 0; G.player.hp = 1e6; G.manual = { x: 0, y: 0 }; p.x = 0; p.y = 0; p.vx = p.vy = 0; update(1 / 60); }
      let t = 0; for (const k in G.stats.dmg) t += G.stats.dmg[k]; Math.random = R0; out.keys = Object.keys(G.stats.dmg).join(','); return t / 20;
    };
    // 1. Every matrix weapon has a shape, and keeps its damage output within 20% (three runs each side).
    for (const id of MATRIX_ONLY.weapons) {
      const d = WEAPONS[id];
      if (!ST_W[id]) { bad.push('no shape ' + id); continue; }
      if (!d.base.stOld) { bad.push('not applied ' + id); continue; }
      const nb = d.base, ob = d.base.stOld;
      const N = [], O = [], med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
      for (let k = 0; k < 5; k++) { seed = 7 + k * 101; d.base = nb; N.push(run(id)); seed = 7 + k * 101; d.base = ob; O.push(run(id)); }
      d.base = nb;
      const avg = a => a.slice().sort((x, y) => x - y).slice(1, -1).reduce((x, y) => x + y, 0) / (a.length - 2), n = avg(N), o = avg(O), ratio = o > 0 ? n / o : 1;
      out.dps.push(`${d.name}: ${Math.round(o)} -> ${Math.round(n)} (${ratio.toFixed(2)}) [${O.map(Math.round)} | ${N.map(Math.round)}]`);
      if (o > 0 && (ratio < 0.8 || ratio > 1.2)) bad.push(`${d.name} dps ratio ${ratio.toFixed(2)}`);
    }
    // 2. Base stats are different weapon to weapon.
    const sig = new Set(MATRIX_ONLY.weapons.map(id => JSON.stringify(stBase(WEAPONS[id]))));
    if (sig.size !== MATRIX_ONLY.weapons.length) bad.push('base stats repeat: ' + sig.size);
    // 3. A modifier card shows its stat and banks it.
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    G.weapons[0] = makeSlot('v_phys_proj', false, 1); recomputeAll();
    const w = G.weapons[0], c = modCard(w, 'rapid'), cd0 = w.s.cd;
    if (c.stUp !== 'rof') bad.push('rapid card stat ' + c.stUp);
    if (!UI.boonHtml(c).includes('+3% Rate of Fire')) bad.push('card line ' + UI.boonHtml(c));
    c.apply();
    if (!(Math.abs(G.stb.rof - 0.03) < 1e-9)) bad.push('rof banked ' + G.stb.rof);
    if (!(w.s.cd < cd0)) bad.push('rof did not apply');
    const hp0 = G.P.maxHp; stGain('hp'); if (G.P.maxHp !== hp0 + 5) bad.push('hp ' + G.P.maxHp);
    const d0 = w.s.dmg; stGain('dmg'); if (!(Math.abs(w.s.dmg / d0 - 1.03) < 0.001)) bad.push('dmg ' + w.s.dmg / d0);
    stGain('accel'); if (!(Math.abs(G.P.accel - 1.06) < 1e-9)) bad.push('accel ' + G.P.accel);
    stGain('membrane'); for (let f = 0; f < 3; f++) update(1 / 60); if (!(G.pd.mem.memMax > 0)) bad.push('membrane not up');
    stGain('shell'); const pd = pdefHurt(10, 'test', null, 'bullets'); if (!(pd <= 10)) bad.push('shell ' + pd);
    for (const k of ST_ORDER) if (!Object.values(ST_MOD).includes(k)) bad.push('no modifier gives ' + k);
    for (const id of MATRIX_ONLY.mods.concat(['area'])) if (!ST_MOD[id]) bad.push('mod without stat ' + id);
    // 4. The weapon draft shows base stats; the BUILD tab lists the bonuses.
    G.lootQueue = [{ kind: 'slot' }]; UI.openLoot(G.lootQueue.shift());
    const info = document.getElementById('dInfo').innerHTML;
    if (!info.includes('BASE STATS') || !info.includes('CRIT CHANCE')) bad.push('draft has no base stats');
    out.draft = document.getElementById('dInfo').querySelector('.stBase') ? document.getElementById('dInfo').querySelector('.stBase').innerText.replace(/\n/g, ' ') : '';
    if (!bpHtml().includes('Rate of Fire')) bad.push('build panel has no bonus');
    // 5. The run log has a stats line; collected XP is the gems' own value (never more than was dropped).
    const txt = runText(runSummary(G, 'CLOSED'));
    if (!/ stats: .*Rate of Fire/.test(txt)) bad.push('no stats line');
    out.stats = (txt.split('\n').find(l => l.startsWith(' stats:')) || '');
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    for (let i = 0; i < 20; i++) dropGem(G.player.x + 3, G.player.y, 5);
    for (let f = 0; f < 30; f++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); }
    const rs = runSummary(G, 'CLOSED');
    if (!(rs.xpRaw > 0 && rs.xpRaw <= rs.xpDrop)) bad.push(`xp collected ${rs.xpRaw} of ${rs.xpDrop}`);
    out.xp = runText(rs).split('\n').find(l => l.startsWith(' xp:'));
    return { bad, out };
  });
  await page.screenshot({ path: 'statup_draft.png' });
  console.log(r.out.dps.join('\n')); console.log(r.out.draft); console.log(r.out.stats); console.log(r.out.xp);
  console.log('statuptest:', r.bad.length || errors.length ? 'FAIL ' + r.bad.concat(errors).join(' | ') : 'ok');
  await b.close(); process.exit(r.bad.length || errors.length ? 1 : 0);
})();
