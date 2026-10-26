// The eight v10 samples (samples10.js): new ids and names, three starters each in the start draft, pool lean, passives, Ordered Online's built-in
// Evasion, Not of This World shifts w.typeOver every 20 s without swapping weapons, shield flags, unlock rules.
// Since 24 Oct (samplestart.js): the start draft is the sample's two best weapons (S10_FIT) and two random others from the
// matrix's 27. Since 23 Oct: only Baseline is open on a fresh save, and an achievement unlocks the rest.
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
    if (SAMPLES10.filter(s => !s.v9).map(s => s.id).join() !== IDS.join()) bad.push('ids ' + SAMPLES10.filter(s => !s.v9).map(s => s.id));
    if (SAMPLES10.slice(0, 8).map(s => s.name).join('|') !== 'Baseline|Alpha|Beta|Private Schooled|Ordered Online|Redtail|Prawn Again|Not of This World') bad.push('names');
    if (S10_BY.ordered.types.join() !== 'mucus,fire') bad.push('Ordered Online types ' + S10_BY.ordered.types);
    for (const s of SAMPLES10) if (!(S10_FIT[s.id] || []).every(id => MATRIX_ONLY.weapons.includes(id))) bad.push(s.id + ' fit off the matrix');
    for (const s of SAMPLES10.filter(s => !s.v9)) { // (the v9 samples: v9armstest)
      META.profile = 's10_' + s.id; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
      const offer = genLoot({ kind: 'start' }), pool = s10Pool(), types = s.types.map(t => S10_TYPES[t]);
      const ids = offer.map(o => W24_IDS.find(k => WEAPONS[k] === o.def || WEAPONS[k] === Object.getPrototypeOf(o.def)));
      const fit = S10_FIT[s.id] || [];
      if (offer.length !== 4 || new Set(ids).size !== 4 || !ids.every(id => pool.includes(id)) || fit.length !== 2 || !fit.every(id => ids.includes(id))) bad.push(s.id + ' start draft ' + offer.map(o => o.title));
      const k = ids.indexOf(fit[0]); offer[k >= 0 ? k : 0].apply(); const w = G.weapons.find(Boolean);
      if (!w || (w.sid || w.id) !== ids[k >= 0 ? k : 0]) bad.push(s.id + ' weapon ' + (w && w.id));
      if (!G.sampleTypes || G.sampleTypes.primary !== s.types[0]) bad.push(s.id + ' lean');
      if (G.s10.strain !== SAMPLES10.indexOf(s) + 1) bad.push(s.id + ' strain');
      if (s10Shield()) bad.push(s.id + ' shield flag'); // (no built-in shields since 22 Oct: the membrane comes only from its card, spassives.js)
      if (s10Open(s.id) !== (s.id === 'baseline' || !s.unlock)) bad.push(s.id + (s10Open(s.id) ? ' open on a fresh save' : ' not open'));
    }
    run('ordered');
    if (s10Evasion() !== 0.3) bad.push('Ordered Online evasion ' + s10Evasion());
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
      if (!(e0.cd.bars.soul > 0)) bad.push('typeOver hit did not build Parasite'); }
    G.s10.shiftT = 0.01; s10Tick(0.02); G.s10.shiftT = 0.01; s10Tick(0.02);
    if (w2.typeOver !== 'flame') bad.push('shift cycle did not return to Fire ' + w2.typeOver);
    run('redtail'); const e = makeEnemy(ENEMIES.crawler, G.player.x + 90, G.player.y); e.hp = e.maxHp = 1000; G.enemies.push(e);
    damageEnemy(e, 20, { elem: 'shock', atk: 'proj', noCrit: true, wname: 't' });
    if (!(e.cd && e.cd.burnT > 0)) bad.push('Redtail: Static did not burn');
    // Only an achievement unlocks a sample now (samplestart.js S10_ACH): not waves, not a bare s10Unlock.
    S10_ALL = false; META.s10 = {}; META.achEver = {}; const keepDev = META.devAll; META.devAll = 0;
    run('baseline'); G.wave.n = 10; s10Tick(0.016);
    if (s10Open('alpha')) bad.push('wave 10 still unlocks Alpha');
    s10Unlock('prawn'); if (s10Open('prawn')) bad.push('bare s10Unlock still unlocks');
    achieve(S10_ACH.alpha); if (!s10Open('alpha')) bad.push('achievement did not unlock Alpha');
    META.devAll = keepDev;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
