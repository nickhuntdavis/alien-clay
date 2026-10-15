// Level 0 (Swimming Lessons, school.js). A natural run: autorun swims you down the tube, the test makes only the taps
// the HUD asks for (RUN mode, a sprint, a Feat), and every lesson's gate has to open on its way to the egg. Then: the
// COLLECT gate stays shut until COLLECT is picked, and a lethal hit is a second wind.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const start = () => page.evaluate(() => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.lvBest = {}; delete META.school;
    SET.auto = false; UI.sample = 's009'; newGame(); UI.show('hud'); G.state = 'play';
    while (G.lootQueue.length) { UI.openLoot(G.lootQueue.shift()); UI.pickLoot(0); } G.state = 'play'; UI.show('hud');
    window.step = (sec, fn, until) => { for (let f = 0; f < sec * 30; f++) { if (until && until()) return true; if (fn) fn(); update(1 / 30); if (G.lootQueue.length && G.state === 'play') { UI.openLoot(G.lootQueue.shift()); UI.pickLoot(0); } if (G.state !== 'play' && G.state !== 'won') { G.state = 'play'; UI.show('hud'); } if (G.state === 'won') return true; } return false; };
  });
  const fails = [];
  await start();
  await page.evaluate(() => {
    const V = G.lvl, at = window.at = {}, tasks = window.tasks = {};
    window.act = () => {
      const R = V.arena, st = R && R.A.st;
      if (st && !tasks[st]) tasks[st] = SCHOOL_ST[st].task(R);
      G.manual = null;
      if (st === 'collect') G.moveDir = 'collect'; else if (st === 'hunt' || st === 'junk') G.moveDir = 'hunt'; else if (st === 'modes' || st === 'armour') G.moveDir = 'kite';
      else if (st === 'sprint') G.manual = { x: 0, y: -1, sprint: true };
      else if (st === 'feat') { const w = G.spells.find(Boolean); if (w && w.cd <= 0 && G.enemies.some(e => !e.dead && Math.hypot(e.x - G.player.x, e.y - G.player.y) < w.s.range)) featTap(w); }
      else if (!R) G.moveDir = 'kite';
      for (const A of V.L.arenas) if (V.done[A.name] && at[A.st] == null) at[A.st] = Math.round(G.t);
    };
    step(300, act, () => V.arena && V.arena.A.st === 'hazard' && V.arena.t > 1.5);
    return 1;
  });
  await page.waitForTimeout(150); await page.screenshot({ path: 'school_acid.png' });
  const h = await page.evaluate(() => {
    const V = G.lvl, at = window.at, tasks = window.tasks;
    const won = step(400, act);
    return { won, t: Math.round(G.t), junk: junkK('spitter'), at, tasks, task0: SCHOOL.arenas.length, state: G.state, metaSchool: META.school, best: !!(META.lvBest && META.lvBest.school), unl: META.lvUnlocked || 1, spells: G.spells.filter(Boolean).length, armour: G.P.armour };
  });
  console.log('RUN', JSON.stringify(h));
  for (const st of ['shoot', 'collect', 'box', 'hunt', 'modes', 'sprint', 'feat', 'hazard', 'armour', 'junk']) if (h.at[st] == null) fails.push(st + ' gate never opened');
  if (!h.won || h.metaSchool !== 1 || !h.best) fails.push('the egg did not end it');
  if (h.unl > 1) fails.push('school unlocked a level');
  if (!h.spells || h.armour < 4) fails.push('no Feat or armour handed out');
  if (!h.junk) fails.push('no junk DNA absorbed');
  if (h.t > 300) fails.push('too slow: ' + h.t + 's');
  await page.screenshot({ path: 'school_end.png' });
  // The COLLECT gate, and the second wind (fresh starts, straight into the room).
  await start();
  const c = await page.evaluate(() => {
    const V = G.lvl, A = V.L.arenas.find(a => a.st === 'collect');
    const entered = step(120, () => { G.moveDir = 'kite'; }, () => V.arena && V.arena.A === A);
    const task = V.arena && SCHOOL_ST.collect.task(V.arena);
    G.gems.length = 0; if (G.grant) grantTake('body');
    step(1); const held = !V.done[A.name];
    G.moveDir = 'collect'; step(2, null, () => V.done[A.name]);
    const opened = !!V.done[A.name];
    G.state = 'play'; G.player.iframes = 0; G.shieldT = 0; G.P.dodge = 0; G.player.hp = 1; hurtPlayer(999, 'test');
    return { entered, task, held, opened, saved: G.state === 'play' && G.player.hp === G.P.maxHp, grant: grantHas('body') };
  });
  console.log('COLLECT', JSON.stringify(c));
  if (!c.entered || !c.held || !c.opened) fails.push('collect gate wrong: ' + JSON.stringify(c));
  if (!c.saved) fails.push('no second wind');
  // A fresh save: START SWIMMING goes to Level 0; SKIP TUTORIAL ends it and sends you to the title; a tutorial reset brings it back.
  const rt = await page.evaluate(() => {
    G = null; UI.show('title'); delete META.school; delete META.schoolDue; const keep = RUNLOG.slice(); RUNLOG.length = 0;
    const due = schoolDue(); document.getElementById('playBtn').click(); const sample = UI.sample, screen = document.getElementById('seqsel').classList.contains('on');
    UI.startGame(false); const skipShown = document.getElementById('schoolSkip').classList.contains('on');
    document.getElementById('schoolSkip').click();
    const after = { g: G, school: META.school, due: schoolDue(), title: document.getElementById('title').classList.contains('on') };
    resetTutorial(); const dueAgain = schoolDue();
    UI.sample = 's001'; UI.startGame(false); const skipHidden = !document.getElementById('schoolSkip').classList.contains('on'); G = null; UI.show('title');
    RUNLOG.length = 0; RUNLOG.push(...keep); delete META.schoolDue; META.school = 1; saveMeta();
    return { due, sample, screen, skipShown, after, dueAgain, skipHidden };
  });
  console.log('ROUTE', JSON.stringify(rt));
  if (!rt.due || rt.sample !== 's009' || !rt.screen) fails.push('fresh save not sent to Level 0');
  if (!rt.skipShown || !rt.skipHidden) fails.push('skip button shown wrongly');
  if (rt.after.g !== null || rt.after.school !== 2 || rt.after.due || !rt.after.title) fails.push('skip wrong: ' + JSON.stringify(rt.after));
  if (!rt.dueAgain) fails.push('tutorial reset did not bring Level 0 back');
  console.log(fails.length ? 'FAIL ' + fails.join(' | ') : 'school ok');
  console.log('ERRORS', errors.length ? errors.slice(0, 4) : 'none'); await b.close();
})();
