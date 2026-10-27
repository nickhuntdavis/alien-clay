// Frame-cost benchmark for a late Petri Dish wave (like run log #24 of v10.180): Ordered Online, Laser, Acid Spit and
// Enzyme Sneeze at level 9, three Feats, god-mode autorun to the start of wave N, Android user agent, seeded dice.
//   node sim/framewave.js [quality 0-5, default 5] [wave, default 16] [frames, default 300]
// It keeps playing (waves start, boxes open) while it measures. Prints the scene, update and draw ms a frame, the
// worst frames, and top JS self time. WRAP=1 times every global function and names the ones behind frames over
// 8 ms (update) or 80 ms (draw); HEAP=1 adds an allocation profile (KB of garbage a frame, by function), the
// measure that found the v10.180 late-wave hitches (garbage-collector pauses, not one slow system).
const { chromium } = require('playwright');
const Q = +(process.argv[2] ?? 5), WV = +(process.argv[3] || 16), N = +(process.argv[4] || 300);
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 448, height: 998 }, deviceScaleFactor: 2.25, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(q => {
    try { localStorage.setItem('sd_qual', String(q + 1)); } catch (e) {}
    let s = 12345; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }, Q);
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); });
  const scene = await page.evaluate(async ([WV, Q]) => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; for (const k in POWERUPS) META.seenSt[POWERUPS[k].name] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    META.profile = 's10_ordered'; SET.auto = true; SET.autoWaves = true; UI.sample = 's002'; UI.syncAuto(); newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    genLoot({ kind: 'start' })[0].apply();
    G.weapons = [makeSlot('v_flame_beam', false, 9), makeSlot('v_fire_proj', false, 9), makeSlot('acro_spray', false, 9), null];
    const fork = (w, p, l6, l10) => { const c3 = wupForkCards({ w, lv: 3 }); (c3[['A', 'B', 'C'].indexOf(p)] || c3[0]).apply();
      for (const [lv, n] of [[6, l6], [10, l10]]) { if (!n) continue; const cs = wupForkCards({ w, lv }) || []; const c = cs.find(x => x.title === n); if (c) c.apply(); } };
    fork(G.weapons[0], 'C', 'Heat Sink', 'Death Ray'); fork(G.weapons[1], 'A', 'Spittoon', 'Battery Acid'); fork(G.weapons[2], 'A', 'Full Circle');
    for (const id of ['more', 'x5_whered']) try { f10Give(id, 5); } catch (e) {}
    recomputeAll();
    const zmax = [];
    for (let f = 0; f < 30 * 3000 && G.wave.n < WV; f++) {
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) { const vb = typeof v10Box === 'function' ? v10Box(G.lootQueue[0]) : true; if (vb === 'wait') { G.lootQueue.push(G.lootQueue.shift()); update(1 / 30); } else if (!vb) G.lootQueue.shift(); else UI.openLoot(G.lootQueue.shift()); } else update(1 / 30); }
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 30); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 30); else if (G.state === 'rewind') updateRewind(1 / 30);
      if (G.state === 'play' && waveReady()) waveBegin();
      UI.lootOpenT -= 1000 / 30; UI.autoAt = (UI.autoAt || 0) - 1000 / 30; UI.autoTick();
      G.player.hp = G.P.maxHp;
      if (f % 300 === 0) await new Promise(r => setTimeout(r, 0));
    }
    // into the wave until it is busy
    for (let f = 0; f < 30 * 40; f++) { G.state = 'play'; G.lootQueue.length = 0; G.player.hp = G.P.maxHp; update(1 / 30); if (f % 300 === 0) await new Promise(r => setTimeout(r, 0)); }
    QUAL.lv = Q; resize();
    const zk = {}; for (const z of G.zones) { const k = (z.src && z.src.wname) || (z.s10trail ? 'trail' : '?'); zk[k] = (zk[k] || 0) + 1; }
    return { wave: G.wave.n, lv: G.level, e: G.enemies.length, b: G.ebul.length, s: G.proj.length, p: G.parts.length, z: G.zones.length, q: QUAL.lv, zones: zk, weapons: G.weapons.filter(Boolean).map(w => w.def.name + w.lvl + JSON.stringify(w.up || {})) };
  }, [WV, Q]);
  console.log('scene', JSON.stringify(scene));
  const cdp = await page.context().newCDPSession(page);
  const HEAP = !!process.env.HEAP;
  if (HEAP) { await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 4096, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true }); }
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 }); await cdp.send('Profiler.start');
  const t = await page.evaluate(async ([n, wrap]) => {
    const P = CanvasRenderingContext2D.prototype; let calls = 0;
    for (const m of ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText']) { const o = P[m]; P[m] = function () { calls++; return o.apply(this, arguments); }; }
    const U = [], D = [], Z = [];
    let depth = 0, FT = {}; const SP = [];
    if (wrap) for (const k of Object.getOwnPropertyNames(window)) { let f; try { f = window[k]; } catch (e) { continue; } if (typeof f !== 'function' || k === 'render' || /^[A-Z]/.test(k) || /native code/.test(Function.prototype.toString.call(f))) continue;
      window[k] = function () { if (depth > 2) return f.apply(this, arguments); depth++; const a = performance.now(); try { return f.apply(this, arguments); } finally { depth--; if (depth === 1 || (depth === 0 && k !== 'update')) FT[k] = (FT[k] || 0) + performance.now() - a; } }; }
    const UP = [];
    for (let f = 0; f < n; f++) {
      G.player.hp = G.P.maxHp;
      FT = {}; const a = performance.now();
      if (G.state === 'play') { if (G.lootQueue.length && !waveHoldsLoot()) { const vb = typeof v10Box === 'function' ? v10Box(G.lootQueue[0]) : true; if (vb === 'wait') { G.lootQueue.push(G.lootQueue.shift()); update(1 / 60); } else if (!vb) G.lootQueue.shift(); else UI.openLoot(G.lootQueue.shift()); } else update(1 / 60); }
      else if (G.state === 'bossIntro') { updateBossIntro(1 / 60); if (G.bossIntro && G.bossIntro.t > 3) endBossIntro(); } else if (G.state === 'intro') updateIntro(1 / 60); else if (G.state === 'rewind') updateRewind(1 / 60);
      if (G.state === 'play' && waveReady()) waveBegin();
      UI.lootOpenT -= 1000 / 60; UI.autoAt = (UI.autoAt || 0) - 1000 / 60; UI.autoTick();
      const m = performance.now(); const FU = FT; FT = {}; render(); U.push(m - a); D.push(performance.now() - m); Z.push(G.zones.length);
      if (U[U.length - 1] > 8) UP.push(f + ' w' + G.wave.n + ' ' + (m - a).toFixed(0) + ': ' + Object.entries(FU).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([k, v]) => k + ' ' + v.toFixed(0)).join(', '));
      if (D[D.length - 1] > 80) SP.push(f + ': ' + Object.entries(FT).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([k, v]) => k + ' ' + v.toFixed(0)).join(', '));
      if (f % 30 === 0) await new Promise(r => setTimeout(r, 0));
    }
    const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1], avg = a => a.reduce((x, y) => x + y, 0) / a.length, p95 = a => a.slice().sort((x, y) => x - y)[Math.floor(a.length * 0.95)];
    return { update: +avg(U).toFixed(2), updP95: +p95(U).toFixed(1), updMax: +Math.max(...U).toFixed(1), draw: +avg(D).toFixed(2), drawP95: +p95(D).toFixed(1), drawMax: +Math.max(...D).toFixed(1), calls: Math.round(calls / n), zAvg: Math.round(avg(Z)), spikes: SP.slice(0, 4), upd: UP.slice(0, 25), nUp: UP.length, worst: D.map((d, i) => [i, +d.toFixed(0), +U[i].toFixed(0)]).sort((a, b) => b[1] + b[2] - a[1] - a[2]).slice(0, 6).map(x => x.join(':')).join(' '), zMax: Math.max(...Z), e: G.enemies.length, p: G.parts.length };
  }, [N, !!process.env.WRAP]);
  const { profile } = await cdp.send('Profiler.stop');
  if (HEAP) {
    const { profile: hp } = await cdp.send('HeapProfiler.stopSampling'); const by = {}; let tot = 0;
    const walk = (n, top) => { const cf = n.callFrame, k = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; const v = n.selfSize; tot += v; by[k] = (by[k] || 0) + v; for (const c of n.children) walk(c); };
    walk(hp.head);
    console.log('alloc total MB', (tot / 1e6).toFixed(1), 'per frame KB', (tot / N / 1e3).toFixed(1));
    console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => `  ${(v / tot * 100).toFixed(1)}% ${(v / N / 1e3).toFixed(1)}KB/f ${k}`).join('\n'));
  }
  const dt = {}; for (let i = 0; i < profile.samples.length; i++) dt[profile.samples[i]] = (dt[profile.samples[i]] || 0) + (profile.timeDeltas[i] || 0);
  const self = {}; let tot = 0;
  for (const n of profile.nodes) { const v = dt[n.id] || 0; tot += v; const cf = n.callFrame, k = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; self[k] = (self[k] || 0) + v; }
  console.log('frame', JSON.stringify(t));
  console.log('JS self:\n' + Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => `  ${(v / tot * 100).toFixed(1)}% ${k}`).join('\n'));
  if (errors.length) console.log('ERRORS', errors.slice(0, 3));
  await b.close();
})();
