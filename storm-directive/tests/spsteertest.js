// Targeting and autorun as sperm passives (spsteer.js), and The Runs' loop mastery (spfull.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    STEER.force = true; delete META.spKeep;
    const fresh = () => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; G.level = 30; G.weapons[0] = makeSlot('v_phys_proj', false, 3); computeStats(G.weapons[0]); };
    const card = id => CARDS.find(c => c.id === id);
    const ids = () => aimList().map(d => d.id).join(), mv = () => moveModes().map(m => m.id).join();
    // 1. Start: four rules, two modes; a weapon on a rule not on offer falls back to Nearest
    fresh(); out.aim0 = ids(); out.mv0 = mv();
    if (out.aim0 !== 'nearest,furthest,cluster,elite') bad.push('aim start ' + out.aim0);
    if (out.mv0 !== 'kite,hold') bad.push('move start ' + out.mv0);
    G.weapons[0].dir = 'weakest'; G.moveDir = 'orbit'; wupTick(1 / 60); if (G.weapons[0].dir !== 'nearest' || G.moveDir !== 'kite') bad.push('clamp ' + [G.weapons[0].dir, G.moveDir]);
    // 2. Levels add options
    const at = card('sp_aim'), ap = card('sp_auto');
    at.apply(G); out.aim1 = ids(); if (!out.aim1.includes('strongest') || out.aim1.includes('lowhp')) bad.push('aim Lv1 ' + out.aim1);
    at.apply(G); at.apply(G); out.aim3 = aimList().length; if (out.aim3 !== DIRECTIVES.length) bad.push('aim Lv3 ' + out.aim3);
    ap.apply(G); ap.apply(G); ap.apply(G); out.mv3 = mv(); if (out.mv3 !== 'kite,collect,orbit,hunt,hold,defend') bad.push('move Lv3 ' + out.mv3);
    // 3. Masteries: alternate rules; AUTO mode
    at.apply(G); const w = G.weapons[0]; w.dir = 'nearest'; w.dir2 = 'furthest'; out.alt = [aimDir(w), aimDir(w)];
    if (out.alt[0] === out.alt[1]) bad.push('aim mastery ' + out.alt);
    G.spM = []; ap.apply(G); out.auto = mv().includes('auto'); G.moveDir = 'auto'; const m = arMode(); out.autoMode = m;
    if (!out.auto || G.moveDir !== 'auto' || m === 'auto') bad.push('autopilot mastery ' + [out.auto, G.moveDir, m]);
    // 4. Keeping: one held -> kept with no choice; kept cards gone, mastery card from Lv 10
    fresh(); card('sp_auto').apply(G); out.keepHtml = /Kept/.test(steerKeepHtml()); out.kept = META.spKeep;
    if (!out.keepHtml || !steerKept('auto')) bad.push('keep one');
    fresh(); out.mvKept = mv(); if (!out.mvKept.includes('hunt')) bad.push('kept modes ' + out.mvKept);
    out.cardGone = !card('sp_auto').eligible(G); G.level = 5; out.mastLow = card('sp_autoM').eligible(G); G.level = 12; out.mastHigh = card('sp_autoM').eligible(G);
    if (!out.cardGone || out.mastLow || !out.mastHigh) bad.push('kept cards ' + [out.cardGone, out.mastLow, out.mastHigh]);
    const h0 = mutsHeld(); card('sp_autoM').apply(G); out.freeM = [mutsHeld() - h0, mv().includes('auto')]; if (out.freeM[0] !== 0 || !out.freeM[1]) bad.push('kept mastery slot ' + out.freeM);
    // both held -> a choice
    delete META.spKeep; fresh(); card('sp_auto').apply(G); card('sp_aim').apply(G); out.choice = (steerKeepHtml().match(/data-spkeep/g) || []).length;
    if (out.choice !== 2 || META.spKeep) bad.push('keep choice ' + out.choice);
    delete META.spKeep; saveMeta();
    // 5. The Runs: closing a loop hits what is inside
    fresh(); const runs = card('sp_runs'); for (let i = 0; i < 4; i++) runs.apply(G); v10Tick(1 / 60);
    const p = G.player, cx = p.x, cy = p.y, e = makeEnemy(ENEMIES.brute, cx + 60, cy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e);
    const path = []; for (let x = -120; x <= 120; x += 40) path.push([x, -100]); for (let y = -60; y <= 100; y += 40) path.push([120, y]);
    for (let x = 80; x >= -90; x -= 40) path.push([x, 100]); path.push([-90, 100]); for (let y = 70; y >= -160; y -= 40) path.push([-90, y]);
    for (const [x, y] of path) { p.x = cx + 60 + x; p.y = cy + y; G.t += 0.05; wupTick(1 / 60); }
    out.loop = Math.round(1e5 - e.hp); if (!(e.hp < 1e5)) bad.push('Runs loop');
    STEER.force = false;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
