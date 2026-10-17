// Autorun modes and autoaim directives (autorun.js): each directive picks the enemy it says it will, the tie-breaker
// settles near-ties and takes over when the primary has nothing, and each autorun mode keeps to its rules.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.P.maxHp = 1e6; G.player.hp = 1e6;
    const out = { fails: [] }, P = G.player, fail = m => out.fails.push(m);
    const put = (id, d, an, o) => { const e = makeEnemy(ENEMIES[id], P.x + Math.cos(an) * d, P.y + Math.sin(an) * d); Object.assign(e, o || {}); G.enemies.push(e); return e; };
    const reset = () => { G.terrain.length = 0; G.hazards.length = 0; if (G.bigHaz) G.bigHaz.length = 0; G.enemies.length = 0; G.gems.length = 0; G.pickups.length = 0; G.ebul.length = 0; P.x = 700; P.y = 300; P.vx = P.vy = 0; G.grudge = null; };
    // 1. Every directive, one scene.
    reset();
    const S = {
      near: put('crawler', 80, 0, { maxHp: 30, hp: 30, speed: 60, armour: 0 }),
      frag: put('skitter', 200, 0.6, { maxHp: 6, hp: 6, speed: 70, armour: 0 }),
      wounded: put('brute', 220, 1.2, { maxHp: 400, hp: 3, speed: 40, armour: 3 }),
      armoured: put('bulwark', 260, 1.8, { maxHp: 300, hp: 300, speed: 40, armour: 12 }),
      tank: put('crawler', 300, 2.4, { maxHp: 2000, hp: 2000, speed: 40, armour: 0 }),
      fast: put('skitter', 320, 3.0, { maxHp: 30, hp: 30, speed: 300, armour: 0 }),
      shooter: put('spitter', 340, 3.6, { maxHp: 30, hp: 30, speed: 50, armour: 0 }),
      elite: put('crawler', 360, 4.2, { maxHp: 50, hp: 50, speed: 50, armour: 0, elite: true }),
      clus: put('crawler', 380, 4.8, { maxHp: 30, hp: 30, speed: 50, armour: 0 }),
      far: put('crawler', 420, 5.4, { maxHp: 30, hp: 30, speed: 50, armour: 0 }),
    };
    for (const e of G.enemies) e.crowd = e === S.clus ? 9 : 1;
    G.grudge = S.frag; gridBuild();
    const want = { nearest: 'near', weakest: 'frag', lowhp: 'wounded', strongest: 'tank', armour: 'armoured', fastest: 'fast', furthest: 'far', cluster: 'clus', elite: 'elite', shooters: 'shooter', revenge: 'frag' };
    const name = e => Object.keys(S).find(k => S[k] === e) || (e ? e.def.name : 'none');
    out.picks = {};
    for (const d in want) { const got = name(acquire(d, 440, P.x, P.y)); out.picks[d] = got; if (got !== want[d]) fail(`${d}: wanted ${want[d]}, got ${got}`); }
    if (DIRECTIVES.some(d => d.id === 'highhp')) fail('HIGHEST HEALTH still listed');
    if (DIRECTIVES.find(d => d.id === 'strongest').name !== 'TOUGHEST' || DIRECTIVES.find(d => d.id === 'weakest').name !== 'FRAGILEST') fail('names');
    // 2. Tie-breaker: two enemies the same distance away; and ELITES with no elite falls back to the tie-breaker.
    reset();
    const a = put('crawler', 150, 0, { maxHp: 30, hp: 30 }), c = put('crawler', 150, Math.PI, { maxHp: 10, hp: 10 });
    gridBuild();
    if (acquire('nearest', 440, P.x, P.y) !== a) fail('plain nearest should take the first of a tie');
    if (acquire('nearest>weakest', 440, P.x, P.y) !== c) fail('nearest>weakest should take the frail one');
    reset();
    const n1 = put('crawler', 100, 0, { maxHp: 30, hp: 30 }), n2 = put('crawler', 300, 2, { maxHp: 30, hp: 2 });
    gridBuild();
    if (acquire('elite', 440, P.x, P.y) !== n1) fail('elite, no elites: nearest');
    if (acquire('elite>lowhp', 440, P.x, P.y) !== n2) fail('elite>lowhp, no elites: most wounded');
    const w = G.weapons.find(Boolean); w.dir = 'elite'; w.dir2 = 'lowhp';
    if (aimDir(w) !== 'elite>lowhp') fail('aimDir');
    // 3. Movement. No weapons, so the scene stays put.
    const keepW = G.weapons.slice(), keepS = G.spells.slice();
    G.weapons = G.weapons.map(() => null); G.spells = G.spells.map(() => null); G.manual = null;
    const run = (mode, frames, each) => { G.moveDir = mode; for (let f = 0; f < frames; f++) { G.player.hp = 1e6; update(1 / 30); if (each) each(f); } };
    // HOLD: nothing about, stays near where it was chosen.
    reset(); G.ar = null; let far = 0;
    run('hold', 300, () => { far = Math.max(far, Math.hypot(P.x - 700, P.y - 300)); });
    out.holdFar = Math.round(far); if (far > 120) fail('HOLD drifted ' + Math.round(far));
    // KITE: an enemy close in gets put at a distance.
    reset(); G.ar = null; const k = put('crawler', 100, 0, { speed: 0, hp: 1e6, maxHp: 1e6 });
    run('kite', 120); out.kiteD = Math.round(Math.hypot(P.x - k.x, P.y - k.y)); if (out.kiteD < 200) fail('KITE stayed close: ' + out.kiteD);
    // ORBIT: two clusters; it circles the bigger and keeps it.
    reset(); G.ar = null;
    for (let i = 0; i < 7; i++) put('crawler', 0, 0, { x: 1000 + Math.cos(i) * 30, y: 300 + Math.sin(i) * 30, speed: 0, hp: 1e6, maxHp: 1e6 });
    for (let i = 0; i < 4; i++) put('crawler', 0, 0, { x: 450 + Math.cos(i) * 30, y: 300 + Math.sin(i) * 30, speed: 0, hp: 1e6, maxHp: 1e6 });
    let off = 0;
    run('orbit', 120, f => { const o = G.ar && G.ar.orbit; if (f > 10) off = Math.max(off, o ? Math.hypot(o.x - 1000, o.y - 300) : 999); });
    out.orbitOff = Math.round(off); if (off > 60) fail('ORBIT lost its cluster: ' + Math.round(off));
    // HUNT: the elite outranks the nearer crawler, and stays the target.
    reset(); G.ar = null;
    put('crawler', 150, 0, { speed: 0, hp: 1e6, maxHp: 1e6 }); const el = put('crawler', 600, 3, { speed: 0, hp: 1e6, maxHp: 1e6, elite: true });
    let lost = 0;
    run('hunt', 90, () => { if (G.ar.hunt !== el) lost++; });
    if (lost) fail('HUNT lost the elite for ' + lost + ' frames');
    // NEST: not offered in a campaign level; if you were on it, you get HOLD.
    G.lvl = { L: {} }; G.moveDir = 'defend';
    const m = arMode(), offered = moveModes().map(x => x.id);
    G.lvl = null;
    if (m !== 'hold' || offered.includes('defend')) fail('NEST in a level');
    if (!moveModes().some(x => x.id === 'defend')) fail('NEST missing outside levels');
    G.weapons = keepW; G.spells = keepS;
    return out;
  });
  console.log(JSON.stringify(r.picks), 'hold', r.holdFar, 'kite', r.kiteD, 'orbitOff', r.orbitOff);
  if (r.fails.length) console.log('FAIL: ' + r.fails.join('; '));
  console.log('ERRORS', JSON.stringify([...new Set(errors)].slice(0, 5))); await b.close();
})();
