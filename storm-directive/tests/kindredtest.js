// Kindred spirits (kindred.js, V11): The Race spawns a stranded sample at 05:00 and 10:00, a chevron points to it,
// touching it absorbs it (passive on, weapons into the race pool, META.s10 unlock) and opens CHOOSE YOUR DIFFERENCE
// with its three weapons; the pick goes on a new mount. Race weapon drafts only offer carried samples' weapons.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.s10 = { private: 1, ordered: 1, redtail: 1, prawn: 1, alien: 1, beta: 1 }; // (only Alpha never rescued)
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 10;
    genLoot({ kind: 'start' })[0].apply();
    if (!raceOn()) bad.push('not a race');
    // Pool before: Baseline's weapons only.
    const own = r => W24.find(x => x[0] === r)[4];
    if (v10Pool().some(id => own(id) !== 'baseline')) bad.push('pool not limited ' + v10Pool().map(own));
    G.weapons.push(null, null); G.weapons[1] = makeSlot(w24Starters('baseline')[1], false, 1); G.weapons[2] = makeSlot(w24Starters('baseline')[2], false, 1); recomputeAll();
    v10Tick(0.016);
    if (G.kin.spirits.length) bad.push('spirit before 05:00');
    G.t = 300; v10Tick(0.016);
    const s = G.kin.spirits[0];
    if (!s) { bad.push('no spirit at 05:00'); return { bad, out }; }
    if (s.id !== 'alpha') bad.push('prefers unrescued: got ' + s.id);
    out.dist = Math.round(Math.hypot(s.x - G.player.x, s.y - G.player.y));
    G.player.x = s.x; G.player.y = s.y; v10Tick(0.016);
    if (G.kin.spirits.length) bad.push('not rescued on touch');
    if (!kinHas('alpha') || !s10Has('alpha') || !s10Has('baseline')) bad.push('passives ' + G.kin.has);
    if (!(META.s10 && META.s10.alpha)) bad.push('not unlocked');
    if (!v10Pool().some(id => own(id) === 'alpha')) bad.push('alpha weapons not in pool');
    const q = G.lootQueue[0];
    if (!q || q.kind !== 'kindred' || draftBox(q) !== true) bad.push('no kindred screen ' + JSON.stringify(q));
    const t = draftTitle(q); out.title = t[0];
    if (t[0] !== 'CHOOSE YOUR DIFFERENCE') bad.push('title ' + t[0]);
    const cards = genLoot(q);
    if (cards.map(c => c.title).join() !== w24Starters('alpha').map(id => WEAPONS[id].name).join()) bad.push('cards ' + cards.map(c => c.title));
    // Alpha's passive now runs: moving speeds up every weapon.
    G.player.vx = 100; s10Tick(0.016); if (!(G.weapons[0].rateK > 1)) bad.push('alpha passive off');
    const n0 = G.weapons.filter(Boolean).length; cards[0].apply();
    if (G.weapons.filter(Boolean).length !== n0 + 1) bad.push('pick not equipped ' + G.weapons.map(w => w && w.id));
    // Open the real screen once.
    G.lootQueue = [q]; UI.openLoot(G.lootQueue.shift());
    out.screen = document.getElementById('lootTitle').textContent;
    if (document.getElementById('rerollBtn').style.display !== 'none') bad.push('reroll shown');
    UI.show('game'); G.state = 'play';
    // 10:00: a second spirit, not Alpha.
    G.t = 600; v10Tick(0.016);
    const s2 = G.kin.spirits[0];
    if (!s2 || s2.id === 'alpha' || s2.id === 'baseline') bad.push('second spirit ' + (s2 && s2.id));
    // Draw paths: world and chevrons.
    try { v10Draw(); kinPointers(() => {}); } catch (e) { bad.push('draw ' + e.message); }
    // Not a race: no spirits.
    META.profile = 's10_baseline'; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; v10Tick(0.016);
    if (G.kin && G.kin.spirits.length) bad.push('spirit in the Petri Dish');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
