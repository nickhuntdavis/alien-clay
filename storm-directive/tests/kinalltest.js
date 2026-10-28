// Kindred spirits in every mode (kinall.js): weighted odds, a spirit after each boss wave (Dish, Endless) and each Level 1
// arena, rescue drafts from the rescued sample's type pool, and rescue-then-finish unlocks (S10_ALL off).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = META.seenSt || {}; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const run = (sample, prof) => { META.profile = 's10_' + (prof || 'baseline'); UI.sample = sample; newGame(); G.state = 'play'; G.lootQueue = []; G.enemies.length = 0; G.t = 10; genLoot({ kind: 'start' })[0].apply(); G.lootQueue = []; kinInit(); return G.kin; };
    const wave = (n, camp) => { const V = G.wave; V.n = n; V.active = true; V.restT = 0; if (camp != null) V.camp = camp ? V.camp || true : false; waveClear(V); };
    // 1. Locks: only Baseline on a fresh save
    META.s10 = {}; META.devAll = 0; META.achEver = {};
    out.open = SAMPLES10.map(s => s10Open(s.id) ? 1 : 0).join('');
    const want = SAMPLES10.map(s => (s.id === 'baseline' || s.v9) ? 1 : 0).join(''); // (the v9 samples were never locked)
    if (S10_ALL !== false || out.open !== want || out.open[0] !== '1' || SAMPLES10.filter(s => !s.v9 && s10Open(s.id)).length !== 1) bad.push('locks ' + out.open);
    if (s10LockTxt(S10_BY.alpha) !== 'TODO_COPY:kin_lock_txt') bad.push('lock text ' + s10LockTxt(S10_BY.alpha));
    // 2. The odds
    run('s001');
    { const n = {}; for (let i = 0; i < 2000; i++) { const id = kinChoose(); n[id] = (n[id] || 0) + 1; } out.odds = n;
      if (n.private || n.baseline) bad.push('private or baseline offered ' + JSON.stringify(n));
      if ((n.alien || 0) >= 100) bad.push('alien too common ' + n.alien);
      if (!(n.alpha + n.beta > 800)) bad.push('alpha+beta under 40% ' + (n.alpha + n.beta));
      for (const id of ['alpha', 'beta', 'ordered', 'redtail', 'acro', 'prawn']) if (!n[id]) bad.push('never ' + id);
      if (!(n.alien >= 0)) bad.push('no alien key'); }
    // once everything is unlocked: any sample not carried; carried ones never
    META.s10 = { alpha: 1, beta: 1, ordered: 1, redtail: 1, acro: 1, prawn: 1, alien: 1 };
    { run('s001', 'alpha'); const seen = new Set(); for (let i = 0; i < 300; i++) seen.add(kinChoose()); if (seen.has('alpha') || seen.has('private') || seen.has('baseline') || !seen.has('beta')) bad.push('all-unlocked pool ' + [...seen]); }
    META.s10 = {};
    // 3. The Race keeps its timed marks and its rules
    run('s001'); G.t = 120; v10Tick(0.016); if (G.kin.spirits.length !== 1) bad.push('race: no spirit at 02:00');
    if (!kinSlotLv || kinSlotLv(12)) bad.push('race slot levels');
    // 4. Petri Dish: a boss wave clear brings one spirit; other waves do not; the timed marks stay off
    run('s002');
    if (!kinOn()) bad.push('kinOn off in the dish');
    G.t = 500; v10Tick(0.016); if (G.kin.spirits.length || G.pickups.some(u => u.kinB)) bad.push('dish: a timed mark fired');
    wave(4); if (G.kin.spirits.length) bad.push('dish: spirit after wave 4');
    wave(5); out.dish5 = G.kin.spirits.length; if (G.kin.spirits.length !== 1) bad.push('dish: no spirit after wave 5 ' + G.kin.spirits.length);
    { const s = G.kin.spirits[0], d = Math.hypot(s.x - G.player.x, s.y - G.player.y), c = Math.hypot(s.x - G.core.x, s.y - G.core.y); out.dishD = Math.round(d); if (c > CORE.arena - 100) bad.push('dish: spirit at the rim ' + c); }
    // the next drop waits for the spirit, but not for ever
    G.lootQueue = []; G.wave.active = false; G.wave.restT = 0; G.wave.final = false; G.state = 'play'; hookSafe('tick', 0.1); if (waveReady()) bad.push('dish: next drop not held for the spirit');
    G.kin.holdT = KINALL.hold + 1; G.wave.restT = 0; hookSafe('tick', 0.1); if (!waveReady()) bad.push('dish: the hold never lets go');
    wave(5); if (G.kin.spirits.length !== 1) bad.push('dish: a second clear of wave 5 doubled the spirit');
    G.kin.spirits = []; wave(10); if (G.kin.spirits.length !== 1) bad.push('dish: none after wave 10');
    G.kin.spirits = []; wave(15); if (G.kin.spirits.length !== 1) bad.push('dish: none after wave 15');
    G.kin.spirits = []; wave(20); if (G.kin.spirits.length) bad.push('dish: a spirit after the final wave');
    // 5. Rescue Alpha in the Dish: its type joins the pool, the draft is 2 Static + 1 more, the screen says so
    run('s002'); wave(5); { const s = G.kin.spirits[0]; s.id = 'alpha'; }
    if (tpRunTypes().includes('shock')) bad.push('shock before the rescue');
    { const s = G.kin.spirits[0]; G.wave.active = false; G.wave.restT = 0; G.player.x = s.x; G.player.y = s.y; v10Tick(0.016); }
    if (G.kin.spirits.length || !kinHas('alpha')) bad.push('dish: not rescued on touch');
    if (!tpRunTypes().includes('shock')) bad.push('dish: Static not in the run pool ' + tpRunTypes());
    { const q = G.lootQueue[0]; if (!q || q.kind !== 'kindred' || q.id !== 'alpha') bad.push('dish: no rescue draft queued ' + JSON.stringify(q));
      const shock = tpPool('shock').map(id => WEAPONS[id].name);
      for (let k = 0; k < 20; k++) { const cards = kinCards({ id: 'alpha' }); if (cards.length !== 3 || !cards.slice(0, 2).every(c => shock.includes(c.title)) || new Set(cards.map(c => c.title)).size !== 3) { bad.push('dish: cards ' + cards.map(c => c.title)); break; } }
      UI.show('hud'); UI.openLoot(G.lootQueue.shift()); UI.lootOpenT -= 1000;
      const note = document.getElementById('kinTypeNote');
      out.note = note && note.textContent; if (!note || note.style.display === 'none' || !/Static/.test(note.textContent) || !note.querySelector('i')) bad.push('no type note ' + out.note);
      if (document.getElementById('dTitle').textContent !== 'CHOOSE YOUR DIFFERENCE' || UI.lootOpts.length !== 3) bad.push('dish: not the rescue screen');
      UI.openLoot({ kind: 'slot' }); if (document.getElementById('kinTypeNote').style.display !== 'none') bad.push('type note stays on an ordinary draft');
      UI.show('hud'); G.state = 'play'; }
    // a later draft now offers Static
    { let seen = false; for (let i = 0; i < 40 && !seen; i++) seen = v10Pool().some(id => W24_BY[id].type === 'shock'); if (!seen) bad.push('Static not in later drafts'); }
    // Not of This World: two cards from any type, and it adds '*'
    run('s002', 'alpha'); G.kin.has.push('alien'); tpAdd(tpOf('alien')); { const c = kinCards({ id: 'alien' }); if (c.length !== 3) bad.push('alien cards ' + c.length); if (!tpRunTypes().includes('*')) bad.push('alien did not add *'); }
    // 6. Endless: every 5th wave
    run('s006'); wave(5); if (G.kin.spirits.length !== 1) bad.push('endless: none after wave 5');
    G.kin.spirits = []; wave(20); if (G.kin.spirits.length !== 1) bad.push('endless: none after wave 20'); G.kin.spirits = []; wave(25); if (G.kin.spirits.length !== 1) bad.push('endless: none after wave 25');
    G.kin.spirits = []; wave(7); if (G.kin.spirits.length) bad.push('endless: spirit after wave 7');
    // 7. Level 1: an arena clear brings one, on a floor cell
    run('s007'); G.state = 'play';
    if (!G.lvl || !kinOn()) bad.push('level 1 not live');
    { const V = G.lvl, A = V.L.arenas[0], c = lvRectPos(A.rect, 0); G.player.x = c.x; G.player.y = c.y;
      update(0.05); if (!V.arena) bad.push('arena did not start');
      if (G.kin.spirits.length) bad.push('level 1: spirit before the clear');
      G.kills = V.kills0 + A.quota; update(0.05);
      out.lvDone = Object.keys(V.done);
      if (!V.done[A.name]) bad.push('arena not cleared');
      update(0.05);
      const s = G.kin.spirits[0]; if (!s) bad.push('level 1: no spirit after the arena');
      else { out.lvSpot = [Math.round(s.x), Math.round(s.y), V.dPl[lvIdx(s.x, s.y)]]; if (lvSolidAt(s.x, s.y)) bad.push('level 1: spirit inside a wall');
        if (V.dPl[lvIdx(s.x, s.y)] < 0) bad.push('level 1: spirit unreachable'); }
      // draw paths with a waiting spirit
      try { v10Draw(); kinPointers(() => {}); } catch (e) { bad.push('draw ' + e.message); }
      const n = G.kin.spirits.length; update(0.05); update(0.05); if (G.kin.spirits.length !== n) bad.push('level 1: another spirit with no new clear'); }
    // 8. Unlocks: rescue, then finish
    META.s10 = {};
    run('s001'); kinAbsorb('alpha'); if (META.s10.alpha) bad.push('rescue alone unlocked');
    G.stats.lastHit = 'test'; try { hurtPlayer(1e9, 'test'); } catch (e) { /* death path varies */ }
    for (let i = 0; i < 80 && G.state === 'finale'; i++) updateFinale(0.1);
    if (META.s10.alpha) bad.push('a rescued-then-died run unlocked Alpha ' + G.state);
    achieve('survive5'); achieve('lowhp'); s10Unlock('beta'); if (META.s10.beta || META.s10.alpha) bad.push('achievement or s10Unlock opened a sample');
    run('s001'); kinAbsorb('alpha'); kinAbsorb('ordered'); victory({ x: 0, y: 0, r: 60 });
    if (!META.s10.alpha || !META.s10.ordered || META.s10.beta) bad.push('race win: ' + JSON.stringify(META.s10));
    if (!s10Open('alpha') || s10Open('beta')) bad.push('s10Open after the win');
    G.state = 'won'; UI.showVictory(); out.over = document.getElementById('overBody').textContent.slice(0, 60);
    if (!/TODO_COPY:kin_unlocked/.test(document.getElementById('overBody').textContent)) bad.push('no unlock notice on the end screen ' + out.over);
    UI.show('hud');
    META.s10 = {};
    run('s002'); kinAbsorb('prawn'); campWin(); if (!META.s10.prawn) bad.push('dish win did not unlock');
    META.s10 = {}; run('s002'); kinAbsorb('prawn'); G.wave.won = false; G.wave.n = 19; /* dying in wave 19 */ try { hurtPlayer(1e9, 'test'); } catch (e) { /* */ } if (META.s10.prawn) bad.push('dish death unlocked');
    META.s10 = {}; run('s006'); kinAbsorb('redtail'); G.wave.n = 18; G.wave.active = false; waveBegin(); if (META.s10.redtail) bad.push('endless wave 19 unlocked');
    G.wave.active = false; waveBegin(); if (G.wave.n !== 20 || !META.s10.redtail) bad.push('endless wave 20 did not unlock ' + G.wave.n);
    META.s10 = {}; run('s007'); kinAbsorb('beta'); lvWin({ x: G.player.x, y: G.player.y }); if (!META.s10.beta) bad.push('level 1 win did not unlock');
    META.s10 = {}; run('s001'); kinAbsorb('acro'); victory(null); if (!META.s10.acro) bad.push('acro rescue did not unlock on a win');
    META.s10 = {};
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
