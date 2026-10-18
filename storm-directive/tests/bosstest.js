// v10 bosses (boss10.js): defences from the roster, no type weaknesses or immunities, capped Queen summons, readable intro text.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const boss = id => { UI.sample = 's002'; newGame(); G.state = 'play'; G.enemies.length = 0; G.bossRoster = [id]; G.bossCount = 0; spawnBoss(); return G.boss; };
    const st = boss('stone'); const c = fightCd(st);
    out.stone = [c.def, c.layers];
    if (c.def !== 'shell' || c.layers !== 6) bad.push('Kidney Stone defence ' + out.stone);
    const al = boss('alpha'); if (fightCd(al).def !== 'evasion') bad.push('Chad Prime evasion');
    const q = boss('queen'); if (fightCd(q).def !== 'squishy') bad.push('Queen squishy');
    for (const B of BOSSES) if (B.weak && Object.keys(B.weak).length && bossDamageMul({ def: B, bossDef: B }, { elem: Object.keys(B.weak)[0] }) !== 1) { bad.push(B.id + ' still has a type weakness'); break; }
    const fe = BOSSES.find(B => B.id === 'fever'); if (fe && fe.strengths.some(s => /immune/i.test(s))) bad.push('Fever intro still says immune');
    out.queenText = BOSSES.find(B => B.id === 'queen').strengths;
    if (!boss10SummonOk(q)) bad.push('summons blocked with no adds');
    for (let i = 0; i < 8; i++) { const o = makeEnemy(ENEMIES.crawler, q.x, q.y); o.summonedBy = q; G.enemies.push(o); }
    if (boss10SummonOk(q)) bad.push('summon cap not enforced');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
