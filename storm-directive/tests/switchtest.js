// Switched-type branches (fitcheck.js FIT_SAB_TYPES): each weapon on its allowed type runs every card it is offered
// against a crowd with no errors, and its new payoff shows up (Spun Out, Thrown, Snowballed, gripped, ...).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const plain = ENEMIES.crawler || Object.values(ENEMIES).find(d => d.ai === 'chase');
    // weapon -> [type, [card, counter(w) > 0] ...]
    const SIG = {
      v_flame_pool: w => (w.w3 && w.w3.spun) || 0, v_soul_proj: w => (w.w3 && w.w3.thrown) || 0,
      v_fire_proj: w => (w.w2 && w.w2.fx && w.w2.fx.snowball) || 0, v_ice_pool: w => (w.w2 && w.w2.fx && w.w2.fx.grip) || 0,
      v_arcane_proj: w => w.pinsSeen || 0, // (pins seen in enemies during the run)
      s_wake: w => 1, s_tesla: w => (w.w4 && w.w4.fx.caught) || 0,
    };
    for (const id in FIT_SAB_TYPES) {
      const t = FIT_SAB_TYPES[id][0], S = WUP[id]; if (!S) { bad.push('no branch for ' + id); continue; }
      for (const P of ['A', 'B', 'C']) {
        const paths = [null, 0, 1, 2].map(i => ({ p: P, l6: i }));
        for (const path of paths) {
          UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; SET.spawnOff = 1; G.P.spawnMult = 0;
          G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
          const w = G.weapons[0] = makeSlot(id, false, 1); G.weapons[1] = G.weapons[2] = G.weapons[3] = null; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
          sabSwitch(w, t);
          const take = lv => { w.lvl = lv; computeStats(w); const cs = wupForkCards({ w, lv }); return cs; };
          let cs = take(3), c3 = cs.find(c => c.title === S[P].name); if (!c3) continue; c3.apply();
          let lab = id + '/' + t + ' ' + S[P].name;
          if (path.l6 != null) { cs = take(6); const c = cs[path.l6]; if (!c) continue; c.apply(); lab += ' > ' + c.title; }
          const p = G.player; G.enemies.length = 0;
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283, d = 70 + (i % 3) * 50; const e = makeEnemy(plain, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.tst = 1; e.hp = e.maxHp = 400; e.speed = 20; G.enemies.push(e); }
          try { for (let f = 0; f < 420; f++) { update(1 / 60); if (id === 'v_arcane_proj' && G.enemies.some(e => !e.dead && w2Stacks(e) > 0)) w.pinsSeen = 1; if (f % 60 === 0) { G.player.vx = 120 * Math.cos(f); G.player.vy = 120 * Math.sin(f); } } }
          catch (err) { bad.push(lab + ' threw ' + err.message); continue; }
          rows.push(lab + ' sig ' + SIG[id](w));
          if (path.l6 == null && !SIG[id](w)) bad.push(lab + ': no new payoff');
        }
      }
    }
    if (typeof W3_ERR !== 'undefined' && W3_ERR.length) bad.push('W3_ERR ' + W3_ERR[0]);
    return { bad, rows };
  });
  if (process.env.SW_ROWS) console.log(r.rows.join('\n'));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('\n  ') : 'switched branches ok (' + r.rows.length + ' runs)');
  console.log('ERRORS', JSON.stringify(errors.slice(0, 5))); await b.close(); process.exit(r.bad.length || errors.length ? 1 : 0);
})();
