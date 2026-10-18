// v10 wave-mode encounters (waves10.js): the table covers 20 waves, every id is live, every defence and new enemy
// appears, new enemies arrive alone before they are mixed, the population rules hold, and waves 1 to 6 run clean
// with the bot, each ordinary wave spawning every id it lists.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    const bad = [], out = {};
    // ---- the table
    for (let n = 1; n <= 20; n++) if (!WAVES10[n]) bad.push('no entry for wave ' + n);
    if (Object.keys(WAVES10).length !== 20) bad.push('table has ' + Object.keys(WAVES10).length + ' entries');
    for (let n = 5; n <= 20; n += 5) if (!WAVES10[n] || !WAVES10[n].boss) bad.push('wave ' + n + ' is not a boss wave');
    const seen = new Set(), firstWave = {}, introduced = {};
    for (let n = 1; n <= 20; n++) {
      const E = WAVES10[n]; if (!E || E.boss) continue;
      if (!E.teaches || !E.roles || !E.max) bad.push('wave ' + n + ' lacks teaches/roles/max');
      bad.push(...w10Check(n));
      for (const id of Object.keys(E.mix)) {
        if (!ENEMIES[id]) bad.push(`wave ${n}: ${id} is not in ENEMIES`);
        else if (ROSTER[id] && ROSTER[id].cut) bad.push(`wave ${n}: ${id} is cut`);
        else if (!(ENEMIES[id].w > 0)) bad.push(`wave ${n}: ${id} cannot spawn (w=0)`);
        if (!seen.has(id)) { seen.add(id); firstWave[id] = n; (introduced[n] = introduced[n] || []).push(id); }
      }
    }
    // ---- coverage
    const kinds = new Set(); for (const id of seen) { const d = ROSTER[id].def; kinds.add(d ? d.kind : 'none'); }
    for (const k of ['squishy', 'membrane', 'shell', 'thorns', 'evasion']) if (!kinds.has(k)) bad.push('defence missing: ' + k);
    const NEW = ['ingrown', 'staticsock', 'stressball', 'mosquito', 'matchstick', 'candle', 'trappedwind'];
    for (const id of NEW) if (!seen.has(id)) bad.push('new enemy missing: ' + id);
    const roles = new Set(); for (let n = 1; n <= 20; n++) (WAVES10[n].roles || []).forEach(x => roles.add(x));
    for (const x of ['chaser', 'sprinter', 'shooter', 'tank', 'swarm', 'charger', 'support', 'summoner', 'controller', 'carrier']) if (!roles.has(x)) bad.push('role missing: ' + x);
    // ---- alone first: waves 1 to 4 add one each; a new enemy shares its first wave with no other new-list enemy and with no more than one first-timer
    for (let n = 1; n <= 4; n++) if ((introduced[n] || []).length !== 1) bad.push(`wave ${n} should introduce exactly one id: ${introduced[n]}`);
    const wantFirst = { 1: 'crawler', 2: 'skitter', 3: 'spitter', 4: 'brute' };
    for (const n in wantFirst) if (firstWave[wantFirst[n]] != n) bad.push(`${wantFirst[n]} should first appear in wave ${n}`);
    for (const id of NEW) {
      const n = firstWave[id], others = (introduced[n] || []).filter(x => x !== id && NEW.includes(x));
      if (others.length) bad.push(`${id} arrives in wave ${n} with other new enemies: ${others}`);
      const also = (introduced[n] || []).filter(x => x !== id);
      if (also.length) bad.push(`${id} arrives in wave ${n} with other first-timers: ${also}`);
      if (Object.keys(WAVES10[n].mix).length < 2) { /* a lone new enemy is fine */ }
    }
    out.firstWave = firstWave;
    // ---- the bot, waves 1 to 6 (copied from sim/wave20.js, god mode)
    self.FORCE_BOSS = null; SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); if (G.state !== 'intro') G.state = 'play';
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    const got = {}, peak = {}; let lastN = 0, f = 0;
    for (; f < 30 * 2400 && G && G.state !== 'over' && G.state !== 'won'; f++) {
      if (G.state === 'play') {
        if (G.lootQueue.length && !waveHoldsLoot()) { const vb = typeof v10Box === 'function' ? v10Box(G.lootQueue[0]) : true; if (vb === 'wait') { G.lootQueue.push(G.lootQueue.shift()); update(1 / 30); } else if (!vb) G.lootQueue.shift(); else UI.openLoot(G.lootQueue.shift()); }
        else update(1 / 30);
      }
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
      else if (G.state === 'finale') break;
      if (G.state === 'play' && waveReady()) { if (G.wave.n >= 6) break; waveBegin(); }
      UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
      if (G.player.hp < G.P.maxHp * 0.3) G.player.hp = G.P.maxHp * 0.3;
      const V = G.wave;
      if (V.active && V.n !== lastN) lastN = V.n;
      if (V.active && V.phase === 'mobs') {
        if (V.w10 && V.w10.n === V.n) got[V.n] = Object.assign({}, V.w10.cnt);
        const alive = G.enemies.filter(e => !e.dead && !e.charmed && !e.rival && !e.egg).length;
        peak[V.n] = Math.max(peak[V.n] || 0, alive);
      }
      if (f % 600 === 0) await new Promise(r => setTimeout(r, 0));
    }
    out.frames = f; out.reached = G.wave.n; out.peak = peak; out.spawned = got;
    if (G.wave.n < 6) bad.push('only reached wave ' + G.wave.n + ' (state ' + G.state + ')');
    for (const n of [1, 2, 3, 4, 6]) {
      const E = WAVES10[n], g = got[n] || {};
      for (const id of Object.keys(E.mix)) if (!g[id]) bad.push(`wave ${n} never spawned ${id}: ${JSON.stringify(g)}`);
      for (const id of Object.keys(g)) if (!E.mix[id]) bad.push(`wave ${n} spawned unlisted ${id}`);
      if ((peak[n] || 0) > E.max + 8) bad.push(`wave ${n} peaked at ${peak[n]} alive, max ${E.max}`);
    }
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.slice(0, 20));
  console.log('ERRORS', errors.length ? [...new Set(errors)].slice(0, 4) : 'none'); await b.close();
  process.exit(r.bad.length || errors.length ? 1 : 0);
})();
