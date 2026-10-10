const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(400);
  const r = await page.evaluate(() => { META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1; META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1;
    UI.sample = 's007'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue.length = 0;
    const V = G.lvl, out = []; V.done['BEHIND THE WHITE WALL'] = true; lvOpenGate('1');
    const p = G.player; p.x = 13.5 * LV_C; p.y = 105 * LV_C; G.moveDir = 'hold'; SET.spawnOff = 1; G.P.spawnMult = 0; // the corridor past the first arena
    for (let f = 0; f < 30 * 60; f++) { update(1 / 30); if (G.state !== 'play') G.state = 'play'; G.player.hp = G.P.maxHp; if (f % 300 === 0) out.push(`t${Math.round(G.t)} lost=${(G.t - V.lastGainT - LV_LOST).toFixed(0)}`); }
    // make headway: it hides again
    out.push(`before maxP=${V.maxP.toFixed(3)} y=${(G.player.y/LV_C).toFixed(1)} dEx=${V.dEx[lvIdx(G.player.x,G.player.y)]}`); { let i = lvIdx(p.x, p.y); for (let k = 0; k < 6; k++) { const j = lvNext(V.dEx, i); if (j >= 0) i = j; } const c = lvCentre(i); p.x = c.x; p.y = c.y; } G.lvl.safe = null; G.moveDir = 'hold'; update(1 / 30); out.push(`maxP=${V.maxP.toFixed(3)} y=${(G.player.y/LV_C).toFixed(1)} dEx=${V.dEx[lvIdx(G.player.x,G.player.y)]} after headway lost=${(G.t - V.lastGainT - LV_LOST).toFixed(0)} msg=${!!V.msg.lost}`);
    return out.join(' | '); });
  console.log(r, errors); await b.close();
})();
