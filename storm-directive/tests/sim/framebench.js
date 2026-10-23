// Frame-cost benchmark for a late Race (like run log #2): There Is No Spoon, Little Prick, Ewww Gross, three Feats,
// 8 minutes in, Android user agent, seeded dice so two builds see the same scene.
//   node sim/framebench.js [quality 0-4, default 4] [frames, default 240]
//   CALLS=1 also splits the canvas calls by the draw function that made them (slower).
// Prints update and draw ms a frame, canvas calls a frame, the scene, and the top JS functions by self time.
const { chromium } = require('playwright');
const Q = +(process.argv[2] || 4), N = +(process.argv[3] || 240);
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
  const scene = await page.evaluate(async () => {
    META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    SET.auto = true; UI.sample = 's001'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = [];
    G.weapons = [makeSlot('s_siphon', false, 9), makeSlot('v_arcane_proj', false, 9), makeSlot('s_redtape', false, 4), null];
    for (const id of ['standard_procedure', 'big_feelings', 'shed_the_lining']) try { f10Give(id, 2); } catch (e) {}
    for (let k = 0; k < 3; k++) { const c = MUT_REG.find(x => x.id === 'sp_runs'); if (c) c.apply(G, 0); }
    G.level = 36; G.P.maxHp = 5000; recomputeAll(); G.t = 470;
    for (let f = 0; f < 30 * 70; f++) { G.state = 'play'; G.lootQueue.length = 0; G.player.hp = G.P.maxHp; update(1 / 30); if (f % 300 === 0) await new Promise(r => setTimeout(r, 0)); }
    return { e: G.enemies.length, b: G.ebul.length, s: G.proj.length, p: G.parts.length, z: G.zones.length, q: QUAL.lv };
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 }); await cdp.send('Profiler.start');
  const t = await page.evaluate(async ([n, wrap]) => {
    const BY = {}; let cur = '-';
    const SHP = {}, SHN = {};
    if (wrap) { const de = window.drawEnemy; window.drawEnemy = function (e) { const pv = cur; cur = 'E:' + e.def.shape + (e.boss ? '(boss)' : e.elite ? '(elite)' : ''); SHN[cur] = (SHN[cur] || 0) + 1; try { return de.apply(this, arguments); } finally { cur = pv; } }; }
    if (wrap) for (const k of Object.getOwnPropertyNames(window)) { let f; try { f = window[k]; } catch (e) { continue; } if (typeof f !== 'function' || !/^(draw|glow|soft|fight|tl|pst|pdef|nf|f10|f9|kin|sl|v10Draw|labGrey|foeMem|volvox|rotifer|yeast|mHalo|ring)/.test(k) || /native code/.test(Function.prototype.toString.call(f))) continue;
      window[k] = function () { const pv = cur; cur = k; try { return f.apply(this, arguments); } finally { cur = pv; } }; }
    const P = CanvasRenderingContext2D.prototype; let calls = 0;
    for (const m of ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText']) { const o = P[m]; P[m] = function () { calls++; BY[cur] = (BY[cur] || 0) + 1; return o.apply(this, arguments); }; }
    const U = [], D = [];
    for (let f = 0; f < n; f++) {
      G.state = 'play'; G.lootQueue.length = 0; G.player.hp = G.P.maxHp;
      const a = performance.now(); update(1 / 60); const m = performance.now(); render(); U.push(m - a); D.push(performance.now() - m);
      if (f % 30 === 0) await new Promise(r => setTimeout(r, 0));
    }
    const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1], avg = a => a.reduce((x, y) => x + y, 0) / a.length;
    return { update: +avg(U).toFixed(2), updMed: +med(U).toFixed(2), updMax: +Math.max(...U).toFixed(1), draw: +avg(D).toFixed(2), drawMed: +med(D).toFixed(2), calls: Math.round(calls / n), shapes: wrap ? Object.keys(SHN).sort((a, b) => (BY[b] || 0) - (BY[a] || 0)).slice(0, 14).map(k => `${k} n${Math.round(SHN[k] / n)} c${Math.round((BY[k] || 0) / n)}`).join(' | ') : undefined, by: wrap ? Object.entries(BY).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k, v]) => k + ' ' + Math.round(v / n)).join(' | ') : undefined, e: G.enemies.length, b: G.ebul.length, p: G.parts.length, z: G.zones.length };
  }, [N, !!process.env.CALLS]);
  const { profile } = await cdp.send('Profiler.stop');
  const dt = {}; for (let i = 0; i < profile.samples.length; i++) dt[profile.samples[i]] = (dt[profile.samples[i]] || 0) + (profile.timeDeltas[i] || 0);
  const self = {}; let tot = 0;
  for (const n of profile.nodes) { const v = dt[n.id] || 0; tot += v; if (!n.callFrame.url) continue; const cf = n.callFrame, k = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop()}:${cf.lineNumber + 1}`; self[k] = (self[k] || 0) + v; }
  console.log('scene', JSON.stringify(scene));
  console.log('frame', JSON.stringify(t));
  console.log('JS self (share of all sampled time):\n' + Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `  ${(v / tot * 100).toFixed(1)}% ${k}`).join('\n'));
  if (errors.length) console.log('ERRORS', errors.slice(0, 3));
  await b.close();
})();
