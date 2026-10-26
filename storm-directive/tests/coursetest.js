// The race course (s011, course.js). Bot runs: autorun on, steered along the course when no germ is close (like
// sim/lvsim.js). Each run must end in a finish (won), a rival over the line first (BEATEN), or a death, with no
// page errors; the rivals must get going after the countdown, a valve must shut, and a sweeper must move.
// node coursetest.js [runs] [god|mortal] [steer|auto]
const { chromium } = require('playwright');
const N = +(process.argv[2] || 1), GOD = process.argv[3] === 'god', STEER = process.argv[4] !== 'auto';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; });
  const fails = [], res = [];
  for (let run = 0; run < N; run++) {
    const r = await page.evaluate(async ([GOD, STEER]) => {
      SET.auto = true; UI.sample = 's011'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
      let shut = false, swept = false, moved0 = null, maxPads = 0, shot = null;
      for (let f = 0; f < 30 * 600 && G && G.state !== 'over' && G.state !== 'won'; f++) {
        if (G.state === 'play') { if (G.lootQueue.length && !G.tutNow) UI.openLoot(G.lootQueue.shift()); else update(1 / 30); }
        else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
        else if (G.state === 'finale') break;
        UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
        G.moveDir = 'kite';
        const C = G.lvl && G.lvl.crs;
        if (STEER && G.state === 'play' && C && C.cd <= 0) { const n = lvPushOn(G.player), near = G.enemies.some(e => !e.dead && !e.charmed && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 150); if (n && !near) { const dx = n.x - G.player.x, dy = n.y - G.player.y, d = Math.hypot(dx, dy) || 1; G.manual = { x: dx / d, y: dy / d }; } else G.manual = null; }
        if (GOD && G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
        if (C) {
          if (C.valves.some(v => v.shut)) shut = true;
          if (C.sweeps.some(s => s.x != null && Math.abs(s.x - (s.x0 + s.x1) / 2) > 20)) swept = true;
          if (C.t0 != null && moved0 == null && G.t - C.t0 > 5) moved0 = C.racers.map(q => Math.round(C.sy - q.y));
          if (C.boostT > G.t) maxPads++;
          if (f === 30 * 20) { render(); shot = 1; }
        }
        if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
      }
      const C = G.lvl && G.lvl.crs;
      if (G.state === 'finale' || G.state === 'over' || G.state === 'won') { try { render(); } catch (e) {} }
      return { state: G.state, won: !!(G.lvl && G.lvl.won), by: G.rivalWinner || null, t: C && C.t0 != null ? Math.round(G.t - C.t0) : 0, place: C && C.place, lvl: G.level,
        prog: Math.round(lvProgress() * 100), order: C ? C.order : [], hp: Math.round(G.player.hp), shut, swept, moved0, boostF: maxPads,
        racers: C ? C.racers.map(q => Math.round((C.sy - q.y) / LV_C)) : [] };
    }, [GOD, STEER]);
    res.push(r);
    console.log(`RUN ${run}: ${r.won ? 'WON' : r.by ? 'BEATEN by ' + r.by : 'DIED/OTHER (' + r.state + ')'} t=${r.t}s place=${r.place} lv${r.lvl} prog=${r.prog}% hp=${r.hp} boostFrames=${r.boostF} racers(cells up)=${r.racers.join(',')} started=${r.moved0}`);
    if (!r.shut) fails.push('run ' + run + ': no valve shut');
    if (!r.swept && r.prog > 60) fails.push('run ' + run + ': sweepers did not move');
    if (!r.moved0 || r.moved0.some(m => m < 100)) fails.push('run ' + run + ': rivals did not get going ' + r.moved0);
    if (!r.won && !r.by && r.state !== 'finale' && r.state !== 'over') fails.push('run ' + run + ': race did not end (' + r.state + ')');
  }
  await page.screenshot({ path: 'course_end.png' });
  const w = res.filter(r => r.won).length, bt = res.filter(r => r.by).length;
  console.log(`SUMMARY won ${w}/${N}, beaten ${bt}, died ${N - w - bt}`);
  console.log(fails.length ? 'FAIL ' + fails.join('; ') : 'ok');
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 6) : []);
  await b.close();
})();
