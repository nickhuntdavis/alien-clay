// The sequence ladder (seqlock.js), wave conditions (dishfx.js) and the win screen's NEW SEQUENCE button.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  const url = 'file://' + require('path').resolve(__dirname, '../web/index.html'), fails = [];
  const load = async () => { await page.goto(url); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300); };
  await load();
  // A fresh save: the three starters only, in ladder order.
  const fresh = await page.evaluate(() => ({ open: Object.keys(PROFILES).filter(profUnlocked), order: seqOrder().slice(0, 6) }));
  if (fresh.open.join() !== 'vanguard,bruiser,nerd') fails.push('fresh ' + fresh.open);
  if (fresh.order.join() !== 'vanguard,bruiser,nerd,eggseeker,pusher,stealth') fails.push('order ' + fresh.order);
  // An old save: what the old rules unlocked stays, and a past wave win counts.
  await page.evaluate(() => { localStorage.setItem('sd_meta', JSON.stringify({ life: { bestT: 0, bosses: 30, pickups: 0, elem: 0, casts: 0 } })); localStorage.setItem('sd_runs', JSON.stringify([{ n: 1, res: 'WON', smp: 's002', seq: 'bruiser+vanguard' }])); });
  await load();
  const old = await page.evaluate(() => ({ open: Object.keys(PROFILES).filter(profUnlocked), won: Object.keys(META.dishWon || {}), runlog: typeof RUNLOG !== 'undefined' ? RUNLOG.length : -1 }));
  if (!old.open.includes('stealth') || old.open.includes('eggseeker') || old.won.join() !== 'bruiser') fails.push('old ' + JSON.stringify(old));
  // Winning with all three starters decodes the Favourite, announced once.
  const rung = await page.evaluate(() => { META.dishWon = { vanguard: 1, bruiser: 1, nerd: 1 }; const a = seqNewHtml(), b2 = seqNewHtml(); return { open: profUnlocked('eggseeker'), a: a.includes('THE FAVOURITE'), again: b2 === '' }; });
  if (!rung.open || !rung.a || !rung.again) fails.push('rung ' + JSON.stringify(rung));
  // Every wave condition runs for a wave, then ends with it.
  const fx = await page.evaluate(() => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.tutWave = 1;
    const out = {};
    for (const id of DISH_FX_IDS) {
      UI.sample = 's002'; newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      G.wave.n = 5; const r = Math.random; Math.random = () => 0; waveBegin(); Math.random = r; // (wave 6: always a condition)
      G.ev.active = G.ev.active.filter(ev => !ev.wave); G.ev.active.push({ id, dire: false, left: 1e9, max: 1e9, wave: true });
      let on = false;
      for (let f = 0; f < 30 * 20; f++) { if (G.state === 'play') update(1 / 30); else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'loot') { G.state = 'play'; UI.show('hud'); } G.player.hp = G.P.maxHp; if (G.ev.active.some(ev => ev.id === id)) on = true; }
      for (const e of G.enemies) e.dead = true; G.wave.spawned = G.wave.budget;
      for (let f = 0; f < 30 * 6 && G.wave.active; f++) { if (G.state === 'play') update(1 / 30); for (const e of G.enemies) if (!e.charmed) e.dead = true; }
      for (let f = 0; f < 10; f++) update(1 / 30);
      out[id] = { on, after: G.ev.active.some(ev => ev.id === id), waveOver: !G.wave.active };
    }
    return out;
  });
  for (const id in fx) if (!fx[id].on || fx[id].after) fails.push('fx ' + id + ' ' + JSON.stringify(fx[id]));
  // A boss beaten without a scratch counts; one that hurt you doesn't.
  const clean = await page.evaluate(() => { UI.sample = 's001'; newGame(); G.state = 'play'; META.cleanBoss = 0;
    const kill = hurt => { spawnBoss(); if (G.state === 'bossIntro') endBossIntro(); if (hurt) { G.player.iframes = 0; G.shieldT = 0; hurtPlayer(5, 'test', G.boss); } for (let f = 0; f < 150; f++) { const B = G.boss; if (B && !B.dead) { B.hp = Math.min(B.hp, 1); damageEnemy(B, 50, { elem: 'phys', wname: 'test' }); } if (G.state === 'play') update(1 / 30); else if (G.state === 'bossIntro') endBossIntro(); else if (G.state === 'loot') { G.state = 'play'; } G.player.iframes = 99; } G.player.iframes = 0; G.lootQueue = []; };
    kill(true); const a = META.cleanBoss; kill(false); return { afterHurt: a, afterClean: META.cleanBoss, open: profUnlocked('stealth'), kills: G.stats.bossKills, boss: !!G.boss, hurtFlag: G.bossHurt, state: G.state }; });
  if (clean.afterHurt !== 0 || clean.afterClean !== 1) fails.push('clean ' + JSON.stringify(clean));
  // The win screen offers a new sequence.
  const win = await page.evaluate(() => { UI.sample = 's002'; newGame(); G.state = 'play'; G.genes.primary = 'nerd'; G.wave.won = true; G.wave.n = 20; UI.showGameOver(true); const bt = document.getElementById('newSeqBtn'); return { shown: bt.style.display !== 'none', body: document.getElementById('overBody').textContent.slice(0, 160) }; });
  if (!win.shown) fails.push('win ' + JSON.stringify(win));
  await page.waitForTimeout(500); await page.evaluate(() => document.getElementById('newSeqBtn').click()); await page.waitForTimeout(300);
  const seqScreen = await page.evaluate(() => document.querySelector('.screen.on, .screen.show') ? document.querySelector('.screen.on, .screen.show').id : UI.cur);
  if (fails.length) console.log('FAIL', fails.join(' | '));
  console.log(JSON.stringify({ fresh, old, rung, clean, fx, win, seqScreen }), 'ERRORS ' + JSON.stringify(errors)); await b.close();
})();
