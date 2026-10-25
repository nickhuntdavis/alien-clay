// node bossprobe.js <bossId> [preJS]: god-mode wave run to that boss's wave; during the fight log reach, distance, boss dps.
const { chromium } = require('playwright');
const ID = process.argv[2], PRE = process.argv[3] || '';
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(400);
  await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; });
  if (PRE) await page.evaluate(PRE);
  const r = await page.evaluate(async (BOSS) => {
    self.FORCE_BOSS = BOSS;
    SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    const st = { frames: 0, inReach: 0, dist: 0, adds: 0, hp0: 0, t0: 0, tEnd: 0, bossMv: 0, hurt: 0, revives: 0, oneDown: 0 }; let done = false, lastHp = 0, hurt0 = 0, rev = false; const twin0 = []; const lastBoss = { id: null };
    const hs = () => Object.values(G.stats.hurt).reduce((a, b) => a + b, 0);
    for (let f = 0; f < 30 * 2400 && G && G.state !== 'over' && G.state !== 'won' && !done; f++) {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) { const vb = typeof v10Box === 'function' ? v10Box(G.lootQueue[0]) : true; if (vb === 'wait') { G.lootQueue.push(G.lootQueue.shift()); update(1 / 30); } else if (!vb) G.lootQueue.shift(); else UI.openLoot(G.lootQueue.shift()); } else update(1 / 30); }
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
      else if (G.state === 'finale') break;
      if (G.state === 'play' && waveReady()) waveBegin();
      UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
      if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
      const B = G.boss;
      if (B && !B.dead && B.def.id === BOSS && G.state === 'play') {
        if (!st.frames) { st.hp0 = B.hp; st.t0 = G.t; st.lv = G.level; st.reach = arReach(); hurt0 = hs(); st.build = G.weapons.filter(Boolean).map(w => w.def.name + ':' + Math.round(w.s.range)).join(','); }
        st.frames++; const p = G.player, d = Math.hypot(B.x - p.x, B.y - p.y) - B.r; st.dist += d; if (d < st.reach) st.inReach++;
        st.adds += G.enemies.filter(e => !e.boss && !e.dead).length; st.bossMv += B.mvs || 0; lastHp = B.hp; st.tEnd = G.t;
        if (G.revive && !rev) st.revives++; rev = !!G.revive; if (G.revive) st.oneDown++;
        if (G.t - st.t0 > 400) done = true;
      } else if (st.frames && (!B || B.dead)) { done = true; }
    }
    st.hurt = hs() - hurt0;
    return { boss: BOSS, lv: st.lv, fight: +(st.tEnd - st.t0).toFixed(0), downs: st.revives, oneDownS: +(st.oneDown / 30).toFixed(0), end: G.state + (G.boss ? ' boss alive' : ' no boss'), inReach: +(st.inReach / st.frames).toFixed(2), meanDist: Math.round(st.dist / st.frames), reach: st.reach, adds: +(st.adds / st.frames).toFixed(1), bossSpeed: Math.round(st.bossMv / st.frames), hp0: Math.round(st.hp0), hpLeft: Math.round(lastHp), dps: Math.round((st.hp0 - lastHp) / (st.tEnd - st.t0)), hurtPerS: +(st.hurt / (st.tEnd - st.t0)).toFixed(1), build: st.build };
  }, ID);
  console.log(JSON.stringify(r)); if (errors.length) console.log('ERRORS', errors.slice(0, 3));
  await b.close();
})();
