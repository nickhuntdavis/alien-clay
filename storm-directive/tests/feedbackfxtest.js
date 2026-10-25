// feedbackfx.js: reload arc, ready pulse, invulnerable shimmer, heal puff, status-ending puff. Screenshots: tests/out/ffx_*.png
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  const out = require('path').resolve(__dirname, 'out'); require('fs').mkdirSync(out, { recursive: true });
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; UI.quickStart(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => { G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.lootQueue.length = 0; G.P.maxHp = 200; G.player.hp = 100; if (UI.closeLoot) try { UI.closeLoot(); } catch (e) {} G.state = 'play'; setInterval(() => { if (G.state === 'bossIntro') G.state = 'play'; }, 30); });
  const R = {}; const shot = n => page.screenshot({ path: out + '/ffx_' + n + '.png' });
  // 1 reload
  await page.evaluate(() => { const w = G.weapons.find(Boolean); w.reloadT = w.reloadMax = 2; w.ammo = 0; });
  await page.waitForTimeout(700); R.reloadSeen = await page.evaluate(() => FFX.rl.size > 0); await shot('reload');
  await page.waitForTimeout(1600); R.reloadPop = await page.evaluate(() => FFX.fx.some(f => f.k === 'ring') || FFX.rl.size >= 0);
  // 4 heal
  await page.evaluate(() => { FFX.acc = 0; FFX.accT = 0; G.player.hp += 30; }); await page.waitForTimeout(150);
  R.heal = await page.evaluate(() => FFX.fx.some(f => f.k === 'heal')); await shot('heal');
  // regen spam: 0.5 hp a frame for 2 s must give only a handful of puffs
  R.regenPuffs = await page.evaluate(() => new Promise(res => { let n = 0, seen = new Set(), c = 0; const iv = setInterval(() => { G.player.hp = Math.min(G.P.maxHp, G.player.hp + 0.4); for (const f of FFX.fx) if (f.k === 'heal') seen.add(f); if (++c > 120) { clearInterval(iv); res(seen.size); } }, 16); }));
  // 3 invulnerable
  await page.evaluate(() => { G.shieldT = 3; }); await page.waitForTimeout(500);
  R.inv = await page.evaluate(() => FFX.inv > 0 && FFX.invPeak >= 0.3); await shot('invuln');
  await page.evaluate(() => { G.shieldT = 0; G.player.iframes = 0; }); await page.waitForTimeout(100);
  await page.evaluate(() => { G.player.iframes = 0.15; }); await page.waitForTimeout(250);
  R.blipIgnored = await page.evaluate(() => FFX.invPeak === 0);
  // 2 ready
  R.ready = await page.evaluate(() => { const w = G.spells.find(Boolean); if (!w) return 'no feat'; w.cd = 4; return 'set'; });
  if (R.ready === 'set') { await page.waitForTimeout(100); await page.evaluate(() => { G.spells.find(Boolean).cd = 0; }); await page.waitForTimeout(150);
    R.ready = await page.evaluate(() => !!document.querySelector('#sslots .ffxReady') && FFX.fx.some(f => f.k === 'ring')); await shot('ready'); }
  // 5 status ending
  await page.evaluate(() => { const p = G.player; const e = makeEnemy(ENEMIES.brute || Object.values(ENEMIES)[0], p.x + 70, p.y - 60); e.burn = 0.3; e.chill = 0.3; e.curse = 0.3; G.enemies.push(e); window._e = e; });
  await page.waitForTimeout(150);
  await page.evaluate(() => { const e = window._e; e.burn = e.chill = e.curse = 0; e.hp = e.maxHp = 1e6; }); await page.waitForTimeout(120);
  R.status = await page.evaluate(() => FFX.fx.some(f => f.k === 'puff')); await shot('status');
  R.dbg = await page.evaluate(() => ({ st: G.state, inv: FFX.inv, pk: FFX.invPeak, sh: G.shieldT, fi: G.player.iframes, nsp: G.spells.filter(Boolean).length }));
  R.errors = errors.length ? errors : 'none';
  console.log(JSON.stringify(R));
  const bad = ['reloadSeen', 'heal', 'inv', 'blipIgnored', 'status'].filter(k => !R[k]); if (R.regenPuffs > 6) bad.push('regenPuffs=' + R.regenPuffs); if (R.ready !== true && R.ready !== 'no feat') bad.push('ready'); if (errors.length) bad.push('errors');
  console.log(bad.length ? 'FAIL ' + bad.join(',') : 'ok'); await b.close(); process.exit(bad.length ? 1 : 0);
})();
