// Frame cost when you swim into a packed crowd (the user's "lag when I crash into a big crowd", 28 Oct).
//   node sim/crowdbench.js [weapon id, default v_shock_beam] [enemies, default 80] [frames, default 90]
// Alpha, the weapon at Lv 9, a packed ring of common enemies round you; times update and draw a frame, counts hits,
// texts and particles a frame, and lists the top JS functions by self time and the draw calls by function.
const { chromium } = require('playwright');
const WID = process.argv[2] || 'v_shock_beam', NE = +(process.argv[3] || 80), N = +(process.argv[4] || 90);
(async () => {
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 448, height: 998 }, deviceScaleFactor: 2.25, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36' })).newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { let s = 12345; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; });
  if (process.env.DEFS) await page.addInitScript(d => { window.__DEFS = d.split(','); }, process.env.DEFS);
  await page.goto('file://' + require('path').resolve(__dirname, '../../web/index.html'));
  await page.evaluate(([L, nd]) => { window.TUT_OFF = 1; splashEnd(); if (L && typeof LOD_ON_SCREEN !== 'undefined') LOD_ON_SCREEN = +L; if (nd) window.__NODRAW = 1; }, [process.env.LOD || '', process.env.NODRAW || '']);
  await page.evaluate(([WID, NE]) => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1; META.eggMet = 1;
    META.profile = 's10_alpha'; SET.auto = true; UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    G.weapons = [makeSlot(WID, false, 9), null, null, null]; G.level = 30; G.P.maxHp = 1e6; recomputeAll(); G.t = 300; G.nextBoss = 1e9; G.nextWave = 1e9;
    for (let f = 0; f < 60; f++) { G.state = 'play'; update(1 / 30); }
    G.enemies.length = 0; RACE.spawn = 0;
    const p = G.player, defs = (window.__DEFS || ['crawler', 'krill', 'skitter', 'wisp', 'brute', 'splitter']).map(k => ENEMIES[k]).filter(Boolean);
    for (let i = 0; i < NE; i++) { const a = i * 2.399, r = 60 + 110 * Math.sqrt(i / NE), d = defs[i % defs.length]; const e = makeEnemy(d, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); G.enemies.push(e); }
  }, [WID, NE]);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 }); await cdp.send('Profiler.start');
  const t = await page.evaluate(async n => {
    let hits = 0; hookOn('hit:late', 'cb:h', () => hits++);
    const BY = {}; let cur = '-';
    for (const k of Object.getOwnPropertyNames(window)) { let f; try { f = window[k]; } catch (e) { continue; } if (typeof f !== 'function' || !/^(draw|glow|soft|fight|nf10|v10Draw|foeMem|ring|enemyRing|mHalo|floatText|drawText|typefx|tfx|pst|drawChargeFx|cfx|ffx)/.test(k) || /native code/.test(Function.prototype.toString.call(f))) continue;
      window[k] = function () { const pv = cur; cur = k; try { return f.apply(this, arguments); } finally { cur = pv; } }; }
    const P = CanvasRenderingContext2D.prototype; let calls = 0; const DI = {}; let kN = 0;
    const TM = {}, TN = {};
    for (const k of ['drawBackground', 'drawDecals', 'drawEnemy', 'drawForeground', 'drawLensBlur', 'drawTerrain', 'drawCore', 'v10Draw', 'drawHud', 'drawShip', 'fightDraw', 'drawParticles', 'drawTexts', 'labGrey', 'drawEnemyDetail', 'foeMemDraw', 'nf10Draw']) { const f = window[k]; if (typeof f !== 'function') continue;
      window[k] = function () { const a = performance.now(); try { return f.apply(this, arguments); } finally { TM[k] = (TM[k] || 0) + performance.now() - a; TN[k] = (TN[k] || 0) + 1; } }; }
    window.__TM = TM; window.__TN = TN;
    { const dk = window.drawKrill; window.drawKrill = function () { kN++; return dk.apply(this, arguments); }; }
    { const o = P.drawImage; P.drawImage = function (img) { const st = new Error().stack.split('\n').slice(2).find(l => /\/js\/[^/]+\.js:/.test(l)) || '', m = st.match(/at (\S+) .*\/([^/]+\.js):(\d+)/), k = (m ? m[1] + ' ' + m[2] + ':' + m[3] : st.trim().slice(0, 60)) + ' ' + (img && img.width) + 'x' + (img && img.height); DI[k] = (DI[k] || 0) + 1; return o.apply(this, arguments); }; }
    for (const m of ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText']) { const o = P[m]; P[m] = function () { calls++; BY[cur] = (BY[cur] || 0) + 1; return o.apply(this, arguments); }; }
    const U = [], D = [], Hs = [], Tx = [], Pa = [], E = [];
    for (let f = 0; f < n; f++) {
      G.state = 'play'; G.lootQueue.length = 0; G.player.hp = G.P.maxHp; const h0 = hits;
      const a = performance.now(); update(1 / 60); const m = performance.now(); if (!window.__NODRAW) render(); U.push(m - a); D.push(performance.now() - m);
      Hs.push(hits - h0); Tx.push(G.texts.length); Pa.push(G.parts.length); E.push(G.enemies.length);
      if (f % 30 === 0) await new Promise(r => setTimeout(r, 0));
    }
    const avg = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1), mx = a => +Math.max(...a).toFixed(1);
    const top = U.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(([v, i]) => i + ':' + v.toFixed(0) + 'ms/' + Hs[i] + 'hits');
    return { upd: avg(U), updMax: mx(U), updTop: top.join(' '), draw: avg(D), drawMax: mx(D), calls: Math.round(calls / n), hitsPerFrame: avg(Hs), texts: mx(Tx), parts: mx(Pa), enemiesEnd: E[E.length - 1],
      first30: { upd: avg(U.slice(0, 30)), draw: avg(D.slice(0, 30)) },
      ms: Object.entries(__TM).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + (v / n).toFixed(1) + 'ms/' + Math.round(__TN[k] / n)).join(' | '),
      krillPerFrame: Math.round(kN / n), drawImage: Object.entries(DI).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' x' + (v / n).toFixed(1)).join(' | '),
      by: Object.entries(BY).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ' ' + Math.round(v / n)).join(' | ') };
  }, N);
  const { profile } = await cdp.send('Profiler.stop');
  const dt = {}; for (let i = 0; i < profile.samples.length; i++) dt[profile.samples[i]] = (dt[profile.samples[i]] || 0) + (profile.timeDeltas[i] || 0);
  const self = {}; let tot = 0;
  for (const nd of profile.nodes) { const v = dt[nd.id] || 0; tot += v; const cf = nd.callFrame, k = cf.url ? `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}` : `(${cf.functionName || 'native'})`; self[k] = (self[k] || 0) + v; }
  console.log('frame', JSON.stringify(t));
  console.log('self time:\n' + Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 22).map(([k, v]) => `  ${(v / tot * 100).toFixed(1)}% ${k}`).join('\n'));
  if (errors.length) console.log('ERRORS', [...new Set(errors)].slice(0, 3));
  await b.close();
})();
