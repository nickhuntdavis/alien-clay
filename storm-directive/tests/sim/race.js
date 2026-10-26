// Race mode (s001) bot runs: node sim/race.js 4 mortal
// Prints the race milestones (Final Five, sperm count 1, membrane, win) and how each run ended.
const { chromium } = require('playwright');
const N = +(process.argv[2] || 2), GOD = process.argv[3] !== 'mortal', TUNE = process.argv[4] || ''; // e.g. 'RACE.hurt=0.7;PACE=1.3'
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.eggMet = 1; }); if (TUNE) await page.evaluate(TUNE);
  if (TUNE) await page.evaluate(TUNE); // (balance experiments, as wave20.js --pre)
  let wins = 0;
  for (let seed = 0; seed < N; seed++) {
    const r = await page.evaluate(async GOD => {
      if (!self.SIM_KEEP_PROFILE) META.profile = 's10_baseline'; // (a real run always starts as a sample: without one there are no rescues, so no second weapon, kindred.js)
      SET.auto = true; UI.sample = 's001'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      const ev = []; const once = {}; const mark = (k, s) => { if (!once[k]) { once[k] = 1; ev.push(s + ' t=' + Math.round(G.t) + ' lv' + G.level); } };
      let win = false;
      for (let f = 0; f < 30 * 1500 && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (UI.kinFuse && !UI.kinFuse.done && $('kinFuse')) { UI.kinFuse.t0 -= 1e4; $('kinFuse').onpointerdown({ stopPropagation() {} }); } // (a tap closes a rescue's fusion: the sim's loop never yields to the frame that would)
        if (G.state === 'play') { let vb; if (G.lootQueue.length && (vb = v10Box(G.lootQueue[0])) !== 'wait') { const q = G.lootQueue.shift(); if (vb) UI.openLoot(q); } else update(1 / 30); } // (as game.js's main loop: the Reward Director holds, orders or drops boxes)
        else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') {
          win = G.finale.kind === 'win';
          ev.push(win ? 'WIN t=' + Math.round(G.t) + ' lv' + G.level + ' membrane ' + Math.round(G.t - (G.eggWokeT || G.t)) + 's'
            : G.rivalWinner ? 'BEATEN by ' + G.rivalWinner + ' t=' + Math.round(G.t) + ' lv' + G.level
            : 'DIED t=' + Math.round(G.t) + ' lv' + G.level + ' by ' + G.stats.lastHit + (G.eggE ? ' membrane ' + Math.round(100 * G.eggE.hp / G.eggE.maxHp) + '%' : '') + ' hurt ' + JSON.stringify(Object.entries(G.stats.hurt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0] + ':' + Math.round(x[1]))));
          break;
        }
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        if (GOD && G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        for (const mt of [180, 360, 540, 720, 900]) if (G.t >= mt) mark('t' + mt, 'at' + mt / 60 + 'm');
        if (G.showdown) mark('ff', 'final5');
        if (G.fertile) mark('fert', 'count1');
        if (G.eggE && G.eggE.woke && !G.eggWokeT) G.eggWokeT = G.t;
        if (G.eggE) { mark('egg', 'membrane' + (G.eggE.openedBy ? '(by ' + G.eggE.openedBy + ')' : '')); if (G.eggE.openedBy) mark('rv', 'rivalBreakIn'); }
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      if (G && G.state === 'play') ev.push('TIMEOUT t=' + Math.round(G.t) + ' lv' + G.level);
      if (G) { const st = G.stats, fl = G.gems.reduce((a, g) => a + (g.kind === 'x' ? g.v : 0), 0); ev.push(`xp ${Math.round(st.xpRaw || 0)}/${Math.round(st.xpDrop || 0)} floor ${Math.round(fl)} | W ${G.weapons.filter(Boolean).map(w => w.def.name + ' ' + w.lvl + (w.up && w.up.p ? w.up.p : '')).join(', ')} | boxes ${JSON.stringify(st.boxBy || {})} | combos ${Object.keys(G.combo || {}).join(',') || '-'} | screens ${st.scr || 0} ${JSON.stringify(st.scrBy || {})} merged ${st.merged || 0} auto ${st.auto || 0}`); }
      if (G) ev.push('cards ' + JSON.stringify(Object.assign({}, G.hpc, G.vtc, G.pkc))); // (health and perk card ranks)
      return { win, s: ev.join(' | ') };
    }, GOD);
    if (r.win) wins++;
    console.log('RUN', seed, r.s);
  }
  console.log(`WINS ${wins}/${N}`);
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
})();
