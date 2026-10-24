// Rivals arrive one a wave: in a race with each scripted wave, in wave mode with each ordinary wave from 2.
// Dish rivals don't hold a wave up, keep out of it between waves and come back stronger.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errors = [], fails = [];
  const page = await b.newPage({ viewport: { width: 400, height: 860 } }); page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; }); await page.waitForTimeout(100);
  const ok = (c, m) => { if (!c) fails.push(m); };
  const seenAll = () => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; };
  // Race.
  const r = await page.evaluate(seen => {
    eval(seen)();
    UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    const alive = () => G.enemies.filter(e => e.rival && !e.dead).length, out = [];
    for (let i = 0; i < 25 * 30; i++) { G.lootQueue = []; G.state = 'play'; update(1 / 30); } out.push(alive()); // (before the first wave at 27 s)
    for (let i = 0; i < 8 * 30; i++) { G.lootQueue = []; G.state = 'play'; update(1 / 30); } out.push(alive());
    const e = G.enemies.find(x => x.rival && !x.dead); out.push(e ? e.lvl : -1); out.push(rivalBoard().length);
    waveEvent(); out.push(alive());
    startShowdown(); out.push(G.enemies.filter(x => x.final && !x.dead && x.R && RIVALS.includes(x.R)).length);
    return out.join(' ');
  }, seenAll.toString());
  const [r0, r1, , rb, r2, rf] = r.split(' ').map(Number);
  ok(r0 === 0 && r1 === 1 && rb === 2 && r2 === 2, 'race: none, then one a wave: ' + r);
  ok(rf === 5, 'race: showdown brings every rival in: ' + r);
  // Wave mode.
  const w = await page.evaluate(seen => {
    eval(seen)();
    META.tutWave = 1; UI.sample = 's002'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    const out = {}, V = G.wave, run = s => { for (let i = 0; i < s * 30; i++) { G.lootQueue = []; G.state = 'play'; update(1 / 30); } };
    const rivals = () => G.enemies.filter(e => e.rival && !e.dead);
    waveBegin(); run(4); out.w1 = rivals().length;
    for (const e of G.enemies) if (!e.rival) e.dead = true; V.spawned = V.budget; run(1);
    waveBegin(); out.n = V.n; run(4); out.w2 = rivals().length;
    const e = rivals()[0]; out.lv0 = e && e.lvl;
    V.spawned = V.budget; for (const o of G.enemies) if (!o.rival && !o.egg) o.dead = true; run(1);
    out.cleared = !V.active; out.lv1 = e && e.lvl; out.alive = !!(e && !e.dead);
    // Between waves it keeps its distance and holds fire.
    // (only the rival's own hits count: the player may be standing in random terrain, such as an Acid Crypt)
    if (e) { e.x = G.player.x + 200; e.y = G.player.y; e.mode = 'hunt'; } const b0 = G.ebul.length; let hitByRival = 0;
    const hp_ = hurtPlayer; hurtPlayer = function (d, from, ent) { if (ent === e || String(from || '').startsWith(e && e.name)) hitByRival++; return hp_.apply(this, arguments); };
    try { run(3); } finally { hurtPlayer = hp_; }
    out.calm = e && e.mode !== 'hunt' && !hitByRival && G.ebul.length <= b0;
    out.egg = e && e.mode !== 'egg';
    return out;
  }, seenAll.toString());
  ok(w.w1 === 0, 'dish: no rival in wave 1: ' + JSON.stringify(w));
  ok(w.n === 2 && w.w2 === 1, 'dish: one rival joins wave 2: ' + JSON.stringify(w));
  ok(w.cleared && w.alive, 'dish: the wave clears with the rival alive: ' + JSON.stringify(w));
  ok(w.lv1 >= w.lv0 + 2, 'dish: survivor comes back stronger: ' + JSON.stringify(w));
  ok(w.calm && w.egg, 'dish: calm between waves, no egg run: ' + JSON.stringify(w));
  console.log(fails.length ? 'FAIL ' + fails.join(' || ') : 'all good', r, JSON.stringify(w));
  console.log('ERRORS', errors.length ? errors.slice(0, 3) : '[]'); await b.close();
})();
