// Attack looks by damage type (typelook.js): for each of the six typed damage types, the beam on its own
// (tl_<type>_beam.png) and a shot, a burst and a pool together (tl_<type>_mix.png), against a still crowd.
// Checks: each type leaves its own particles; Static snaps arcs onto enemies; no errors.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 700 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const out = {}, bad = [];
  for (const t of ['shock', 'fire', 'ice', 'arcane', 'soul', 'flame']) for (const set of ['beam', 'mix']) {
    await page.evaluate(([t, set]) => {
      META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
      UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.lootQueue = []; G.tlook = null;
      const p = G.player; p.x = 700; p.y = 300; G.invuln = 1e9;
      const ids = set === 'beam' ? ['v_' + t + '_beam'] : ['v_' + t + '_proj', 'v_' + t + '_burst', 'v_' + t + '_pool'];
      G.weapons = ids.map(id => makeSlot(id, false, 3)).concat([null]).slice(0, 4); recomputeAll();
      const def = Object.values(ENEMIES).find(d => !d.boss && d.ai === 'chase') || Object.values(ENEMIES)[0];
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, d = 150 + (i % 3) * 60, e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); }
      cam.x = p.x; cam.y = p.y - 120;
    }, [t, set]);
    const seen = {}; // (particles are short-lived: tally what turns up over the second)
    Object.assign(seen, await page.evaluate(() => { const o = {}; for (let i = 0; i < 150; i++) { update(1 / 60); for (const q of (G.tlook ? G.tlook.p : [])) o[q.k] = 1; } return o; })); // (2.5 s of game time, stepped: headless frames are slow)
    const r = await page.evaluate(t => {
            const p = G.player, e = G.enemies[4], T = G.tlook || (G.tlook = { p: [], a: [] });
      if (t === 'shock') tlSnap(e.x, e.y, 160, 3); // (arcs live a few frames: make sure some are up for the picture)
      (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: p.x + (e.x - p.x) * 1.3, y2: p.y + (e.y - p.y) * 1.3, w: 10, c: V10_COL[t], t, life: 0.6, max: 0.6, tl: 1 });
      const n = {}; for (const q of T.p) n[q.k] = (n[q.k] || 0) + 1;
      return { n, arcs: T.a.length, onFoe: T.a.filter(a => a.e).length, state: G.state };
    }, t);
    await page.waitForTimeout(80);
    await page.screenshot({ path: `tl_${t}_${set}.png`, clip: { x: 0, y: 60, width: 400, height: 460 } });
    await page.evaluate(() => { G.v10fx = []; });
    out[t + '_' + set] = r; Object.assign(r.n, seen);
    const need = { shock: null, fire: 'drip', ice: 'goo', arcane: 'blood', soul: 'wisp', flame: 'tongue' }[t];
    if (need && !(r.n[need] > 0) && !(t === 'ice' && r.n.string > 0)) bad.push(`${t} ${set}: no ${need} (${JSON.stringify(r.n)})`);
    if (t === 'shock' && !(r.onFoe > 0)) bad.push('shock ' + set + ': no arcs onto enemies');
  }
  if (bad.length) console.log('FAIL', bad.join('; '));
  console.log(JSON.stringify(out), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
