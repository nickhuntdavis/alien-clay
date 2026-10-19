// Your defences worn on the body (samplelooks.js slDefOver/slDefUnder/slJelly): Shell 1 to 4 layers (and worn), Thorns,
// Evasion and Squishy, on a natural, an engineered, an anomaly and the alien. Saves tests/out/defbody_<id>_<case>.png.
// Fails on page errors, if the old Shell rings still draw, or if Squishy doesn't stretch the head a lot more than normal.
const { chromium } = require('playwright');
const path = require('path'), out = f => path.resolve(__dirname, 'out', f);
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); SET.intros = 'off'; }); await page.waitForTimeout(300);
  const bad = [];
  const cases = [['shell1', { shell: 1 }], ['shell2', { shell: 2 }], ['shell4', { shell: 4 }], ['worn', { shell: 3 }, 0.2], ['thorns', { thorns: 3 }], ['evasion', { evasion: 3 }], ['squishy', { squishy: 1 }], ['all', { shell: 2, thorns: 2, squishy: 1, evasion: 1 }]];
  for (const id of ['baseline', 'private', 'redtail', 'alien']) for (const [name, n, hp] of cases) {
    await page.evaluate(([id, n, hp]) => {
      META.profile = 's10_' + id; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.lootQueue = []; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.P.maxHp = G.player.hp = 1e6; UI.show('hud'); SET.darkfield = false;
      const D = pdef(); Object.assign(D.n, n); pdRefit(D); if (hp != null) D.layerHp = pdLayerHp() * hp; D.mem.mem = D.mem.memMax = 0;
      const p = G.player, x0 = p.x, y0 = p.y;
      for (let i = 0; i < 50; i++) { update(1 / 60); p.x = x0; p.y = y0; p.vx = 150; p.vy = 0; p.face = p.hd = 0; cam.x = p.x - 20; cam.y = p.y; G.realT += 1 / 60; D.layers = n.shell || 0; if (hp != null) D.layerHp = pdLayerHp() * hp; render(); G.player.hp = 1e6; }
    }, [id, n, hp]);
    await page.screenshot({ path: out(`defbody_${id}_${name}.png`), clip: { x: 130, y: 380, width: 140, height: 100 } });
  }
  // Squishy: a sudden burst of speed stretches the head far more than without it.
  const stretch = await page.evaluate(() => {
    const run = sq => { META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); s10Start(); G.state = 'play'; G.enemies.length = 0; const D = pdef(); D.n.squishy = sq; const p = G.player; let top = 0;
      for (let i = 0; i < 40; i++) { p.vx = i < 20 ? 0 : 400; p.vy = 0; G.realT += 1 / 60; const B = p.sl || (p.sl = { emb: [], hist: [] }); const st = slDefState(p, B, G.realT); const sq = headSquash(p); top = Math.max(top, st && st.jel ? st.jel[0] : sq.x); }
      return top; };
    return [run(0), run(1)];
  });
  if (!(stretch[1] - 1 > 2.5 * (stretch[0] - 1))) bad.push('Squishy stretch not exaggerated: ' + stretch.map(v => v.toFixed(2)));
  console.log('stretch normal/squishy', stretch.map(v => v.toFixed(2)).join(' / '));
  console.log('ERRORS', JSON.stringify(errors));
  if (bad.length || errors.length) { console.log('FAIL ' + bad.join(' | ')); process.exitCode = 1; } else console.log('PASS');
  await b.close();
})();
