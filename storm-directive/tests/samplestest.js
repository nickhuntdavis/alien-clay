// The eight v10 samples (samples10.js): each starts with its own weapon and pool lean, passives work, the Cold Parcel
// has built-in Evasion and no Evasion card, the Other Half shifts type every 20 s, unlocks fire.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const run = id => { META.profile = 's10_' + id; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; genLoot({ kind: 'start' })[0].apply(); return G.weapons.find(Boolean); };
    for (const s of SAMPLES10) {
      const w = run(s.id);
      if (!w || w.id !== s.weapon) bad.push(s.id + ' weapon ' + (w && w.id));
      if (!G.sampleTypes || G.sampleTypes.primary !== s.types[0]) bad.push(s.id + ' lean');
      if (G.s10.strain !== SAMPLES10.indexOf(s) + 1) bad.push(s.id + ' strain');
    }
    run('parcel');
    if (s10Evasion() !== 0.2) bad.push('Parcel evasion ' + s10Evasion());
    for (let i = 0; i < 20; i++) if (pdefOffer(6).some(o => o.defence === 'evasion')) { bad.push('Evasion card offered to the Parcel'); break; }
    G.player.vx = 100; for (let i = 0; i < 30; i++) s10Tick(1 / 30);
    if (!G.zones.some(z => z.s10trail)) bad.push('no Mucus trail');
    const ow = run('over'); G.player.vx = 100; s10Tick(0.016); const fast = ow.rateK; G.player.vx = 0; G.player.vy = 0; s10Tick(0.016);
    if (!(fast > 1) || ow.rateK !== 1) bad.push('Overachiever rate ' + fast + '/' + ow.rateK);
    const oh = run('other'); const t0 = oh.def.v10type; G.s10.shiftT = 0.01; s10Tick(0.02);
    const t1 = G.weapons.find(Boolean).def.v10type;
    if (t0 === t1 || G.weapons.find(Boolean).def.v10atk !== 'beam') bad.push('Other Half shift ' + t0 + ' -> ' + t1);
    run('unsol'); const e = makeEnemy(ENEMIES.crawler, G.player.x + 90, G.player.y); e.hp = e.maxHp = 1000; G.enemies.push(e);
    damageEnemy(e, 20, { elem: 'shock', atk: 'proj', noCrit: true, wname: 't' });
    if (!(e.cd && e.cd.burnT > 0)) bad.push('Unsolicited: Static did not burn');
    META.s10 = {}; const keepDev = META.devAll; META.devAll = 0;
    run('baseline'); G.wave.n = 10; s10Tick(0.016);
    if (!s10Open('over')) bad.push('wave 10 did not unlock the Overachiever');
    if (s10Open('unacc')) bad.push('Unaccounted open too early');
    META.devAll = keepDev;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
