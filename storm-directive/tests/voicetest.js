// The two voices (voice.js tables, voice10.js wiring): a run start produces a line, death gives the Scientist a line
// on the end screen, a first sighting shows a SIGHTING line, a status hint shows once, sample IDs advance 1A -> 1B,
// and the rate limit holds (no more than one commentary line every 20 s of run time).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const run = (id, mode) => { META.profile = 's10_' + id; UI.sample = mode || 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 0; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; genLoot({ kind: 'start' })[0].apply(); G.P.maxHp = G.player.hp = 1e6; };
    const q = () => G.show.msgQ.map(m => m.body);
    META.s10runs = {}; META.seen = {}; META.vxSt = {}; META.vxEv = {};
    // 1. a run start produces a line, and the sample ID is 1A
    run('baseline'); out.sid1 = vxSid();
    G.t = 2; vxTick(0.3); vxTick(0.3);
    out.start = q();
    if (!q().length || !G.vx.log.some(l => l.event === 'runStart')) bad.push('no run start line');
    if (out.sid1 !== '1A') bad.push('first run id ' + out.sid1);
    if (!/1A/.test(q().join(' '))) bad.push('first run line does not name the sample: ' + q());
    // 2. death: a Scientist line on the end screen, ID 1B on the second run, and the run log carries it
    run('baseline'); out.sid2 = vxSid();
    if (out.sid2 !== '1B') bad.push('second run id ' + out.sid2);
    G.t = 100; G.state = 'over'; UI.showGameOver(false);
    const end = document.querySelector('#overBody .vxend');
    out.end = end && end.innerText;
    if (!end || !end.querySelector('.vxl') || !/SAMPLE 1B/.test(end.innerText)) bad.push('no Scientist line on the end screen: ' + out.end);
    if (!G.vx.log.some(l => l.event === 'death' && l.who === 'sci')) bad.push('death line not from the Scientist');
    if (G.vx.log.some(l => l.event === 'death' && l.who === 'sci' && VOICE.death.sci.some(x => x.t === l.text && x.tier > 0))) bad.push('death line above Tier 0');
    if (runSummary(G, 'LOST').sid !== '1B') bad.push('run log sid ' + runSummary(G, 'LOST').sid);
    run('alpha', 's001'); if (vxSid() !== '2A') bad.push('Alpha id ' + vxSid());
    if (sampleId(1, 26) !== '1Z' || sampleId(1, 27) !== '1AA') bad.push('sampleId wrap');
    // 3. a first sighting shows one SIGHTING line (quiet mode: a message, no stop)
    run('baseline', 's001'); SET.intros = 'quiet'; META.seen = {};
    const c = makeEnemy(ENEMIES.crawler, G.player.x + 80, G.player.y); G.enemies.push(c); gridBuild();
    G.t = 10; G.introNext = 0; G.introCheck = 0; introTick();
    out.sight = q();
    if (!q().some(t => t.indexOf(SIGHTING.crawler.sci) === 0 || t.indexOf(SIGHTING.crawler.con) === 0)) bad.push('no SIGHTING line: ' + q());
    // 4. a status hint shows once
    run('baseline', 's001'); META.vxSt = {}; SET.intros = 'auto';
    const k = makeEnemy(ENEMIES.crawler, G.player.x + 80, G.player.y); G.enemies.push(k);
    G.t = 20; k.corrodedT = G.t + 60; vxHints();
    const n1 = q().filter(t => t === STATUS_HINT.Corrosion).length;
    G.t = 40; vxHints(); G.t = 60; vxHints();
    const n2 = q().filter(t => t === STATUS_HINT.Corrosion).length;
    if (n1 !== 1 || n2 !== 1) bad.push('Corrosion hint shown ' + n1 + ' then ' + n2 + ' times');
    if (!META.vxSt.Corrosion) bad.push('hint not remembered');
    // 5. the rate limit: 60 s of events, no more than one line every 20 s
    run('baseline'); const S = vxs(); G.show.msgQ.length = 0; S.log.length = 0;
    const evs = [['lowHp', 'sci'], ['surrounded', 'sci'], ['levelUp', 'sci'], ['newWeapon', 'sci'], ['waveClear', 'sci'], ['quietMoment', 'sci']];
    for (let t = 10; t < 70; t += 0.5) { G.t = t; for (const [e, w] of evs) vxSay(e, w); }
    out.rate = S.log.length;
    if (S.log.length > 3 || S.log.length < 1) bad.push('60 s produced ' + S.log.length + ' lines');
    for (let i = 1; i < S.log.length; i++) if (S.log[i].t - S.log[i - 1].t < 19.9) bad.push('lines ' + (S.log[i].t - S.log[i - 1].t) + ' s apart');
    // 6. Spectral Combustion: the Tier 3 line plus its recovery, once
    run('baseline'); G.show.msgQ.length = 0; vxSpectral();
    if (q().length !== 2 || !/^Form 12B filed\./.test(q()[1])) bad.push('Spectral lines: ' + q());
    // 7. Tier 2 lines bring their recover line
    run('baseline'); G.show.msgQ.length = 0; vxSay('celestialDrop', 'sci', { force: true });
    if (q().length !== 2) bad.push('celestial recover: ' + q());
    // 8. boss intro: a line on the card
    run('baseline'); META.bosses = {}; spawnBoss(); const bi = document.getElementById('biReward');
    if (!bi || !/"/.test(bi.innerHTML)) bad.push('no boss intro line');
    out.bad = bad; return out;
  });
  await b.close();
  console.log(JSON.stringify(r).slice(0, 900));
  console.log('ERRORS', JSON.stringify(errors));
  if (r.bad.length || errors.length) { console.log('FAIL', r.bad.join(' | ')); process.exit(1); }
  console.log('voicetest ok');
})();
