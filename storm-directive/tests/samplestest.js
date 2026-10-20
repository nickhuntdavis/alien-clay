// The eight v10 samples (samples10.js): new ids and names, three starters each in the start draft, pool lean, passives, Ordered Online's built-in
// Evasion, Not of This World shifts w.typeOver every 20 s without swapping weapons, shield flags, unlock rules.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const run = (id, k) => { META.profile = 's10_' + id; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; genLoot({ kind: 'start' })[k || 0].apply(); return G.weapons.find(Boolean); };
    const IDS = ['baseline', 'alpha', 'beta', 'private', 'ordered', 'redtail', 'prawn', 'alien'];
    if (typeof S10_BY.acro !== 'undefined') IDS.push('acro'); // (PROPOSED Sample 9, acrosample.js: a ninth sample while it is loaded)
    if (SAMPLES10.map(s => s.id).join() !== IDS.join()) bad.push('ids ' + SAMPLES10.map(s => s.id));
    if (SAMPLES10.slice(0, 8).map(s => s.name).join('|') !== 'Baseline|Alpha|Beta|Private Schooled|Ordered Online|Redtail|Prawn Again|Not of This World') bad.push('names');
    if (S10_BY.ordered.types.join() !== 'mucus,fire') bad.push('Ordered Online types ' + S10_BY.ordered.types);
    for (const s of SAMPLES10) {
      META.profile = 's10_' + s.id; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
      const offer = genLoot({ kind: 'start' }), want = w24Starters(s.id);
      const n3 = W24.filter(r => r[4] === s.id).length - W24.filter(r => r[4] === s.id && W24_HOLD.includes(r[0])).length; // (3, minus starters on hold)
      if (want.length !== n3 || offer.length !== n3 || offer.map(o => o.def.name).join() !== want.map(id => WEAPONS[id].name).join()) bad.push(s.id + ' start draft ' + offer.map(o => o.title));
      offer[1].apply(); const w = G.weapons.find(Boolean);
      if (!w || (w.sid || w.id) !== want[1]) bad.push(s.id + ' weapon ' + (w && w.id));
      if (!G.sampleTypes || G.sampleTypes.primary !== s.types[0]) bad.push(s.id + ' lean');
      if (G.s10.strain !== SAMPLES10.indexOf(s) + 1) bad.push(s.id + ' strain');
      if (s10Shield() !== (s.id === 'private' || s.id === 'alien')) bad.push(s.id + ' shield flag');
      if (s10Open(s.id) !== true) bad.push(s.id + ' not open');
    }
    run('ordered');
    if (s10Evasion() !== 0.2) bad.push('Ordered Online evasion ' + s10Evasion());
    for (let i = 0; i < 20; i++) if (pdefOffer(6).some(o => o.defence === 'evasion')) { bad.push('Evasion card offered to Ordered Online'); break; }
    G.player.vx = 100; for (let i = 0; i < 30; i++) s10Tick(1 / 30);
    if (!G.zones.some(z => z.s10trail)) bad.push('no Mucus trail');
    const ow = run('alpha'); G.player.vx = 100; s10Tick(0.016); const fast = ow.rateK; G.player.vx = 0; G.player.vy = 0; s10Tick(0.016);
    if (!(fast > 1) || ow.rateK !== 1) bad.push('Alpha rate ' + fast + '/' + ow.rateK);
    // Not of This World: the type changes, the weapon ids do not; all held weapons shift; hits use the override.
    const oh = run('alien'), id0 = oh.id, sid0 = oh.sid; G.s10.shiftT = 0.01; s10Tick(0.02);
    const w2 = G.weapons.find(Boolean);
    if (w2.id !== id0 || w2.sid !== sid0) bad.push('Not of This World swapped the weapon id');
    if (w2.typeOver !== 'soul') bad.push('Not of This World typeOver ' + w2.typeOver);
    G.weapons[1] = makeSlot(w24Starters('alien')[1], false, 1); s10Tick(0.016);
    if (G.weapons[1].typeOver !== 'soul') bad.push('second held weapon not shifted');
    { const e0 = makeEnemy(ENEMIES.crawler, G.player.x + 90, G.player.y); e0.hp = e0.maxHp = 1e6; G.enemies.push(e0); fightCd(e0); gridBuild();
      damageEnemy(e0, 20, { elem: 'phys', atk: 'proj', noCrit: true, wname: 't', w: w2 });
      if (!(e0.cd.bars.soul > 0)) bad.push('typeOver hit did not build Alien'); }
    G.s10.shiftT = 0.01; s10Tick(0.02); G.s10.shiftT = 0.01; s10Tick(0.02);
    if (w2.typeOver !== 'flame') bad.push('shift cycle did not return to Fire ' + w2.typeOver);
    run('redtail'); const e = makeEnemy(ENEMIES.crawler, G.player.x + 90, G.player.y); e.hp = e.maxHp = 1000; G.enemies.push(e);
    damageEnemy(e, 20, { elem: 'shock', atk: 'proj', noCrit: true, wname: 't' });
    if (!(e.cd && e.cd.burnT > 0)) bad.push('Redtail: Static did not burn');
    // Unlock rules stay in code: with S10_ALL off they still fire.
    S10_ALL = false; META.s10 = {}; const keepDev = META.devAll; META.devAll = 0;
    run('baseline'); G.wave.n = 10; s10Tick(0.016);
    if (!s10Open('alpha')) bad.push('wave 10 did not unlock Alpha');
    if (s10Open('prawn')) bad.push('Prawn Again open too early');
    S10_ALL = true; META.devAll = keepDev;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
