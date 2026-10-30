// Sample branch costumes (baselinelook.js) in a run, on the sharp body canvas as on a phone (YOU_HD_FORCE), Arcade and Lab
// view, plus the Lv 15 sample branch screen (samplebranch.js). Screenshots: out/smb_<kind>.png, out/smb_<kind>_lab.png,
// out/smb_<kind>_zoom.png, out/smb_screen.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; window.YOU_HD_FORCE = 1; splashEnd(); }); await page.waitForTimeout(300);
  const bad = [];
  for (const [letter, kind] of [['A', 'rambo'], ['B', 'harry'], ['C', 'robocop']]) {
    for (const lab of [false, true]) {
      const at = await page.evaluate(([letter, lab]) => {
        META.seen = new Proxy(META.seen || {}, { get: () => 1 }); META.seenSt = new Proxy(META.seenSt || {}, { get: () => 1 });
        UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; SET.spawnOff = 1; G.P.spawnMult = 0;
        G.s10 = { id: 'baseline', strain: 1, run: 1, ev: 0, shiftT: 12, shiftI: 0, trailT: 0, low: false };
        G.weapons = [makeSlot('v_phys_proj', false, 1), null, null, null]; G.enemies.length = 0;
        G.smb = { p: letter, l6: '', l10: '', q: -1, f: {} }; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
        SET.view = lab ? 'lab' : 'arcade';
        const e = makeEnemy(ENEMIES.crawler || Object.values(ENEMIES)[0], G.player.x + 160, G.player.y - 40); e.hp = e.maxHp = 1e6; e.speed = 0; e.elite = 1; G.enemies.push(e); gridBuild();
        UI.show('hud');
        return true;
      }, [letter, lab]);
      // swim in a slow arc for a second so the tail and the ribbons trail, then shoot
      await page.evaluate(() => { for (let f = 0; f < 70; f++) { G.player.vx = 120 * Math.cos(f / 40); G.player.vy = 120 * Math.sin(f / 40); G.player.x += G.player.vx / 60; G.player.y += G.player.vy / 60; G.player.face = Math.atan2(G.player.vy, G.player.vx); update(1 / 60); } render(); });
      await page.waitForTimeout(120);
      const box = await page.evaluate(() => ({ x: sx(G.player.x), y: sy(G.player.y), S }));
      const r = Math.round(70 * box.S / 1.6) + 40;
      const f = 'out/smb_' + kind + (lab ? '_lab' : '') + '.png';
      await page.screenshot({ path: f.replace('out/', ''), clip: { x: Math.max(0, box.x - r), y: Math.max(0, box.y - r), width: 2 * r, height: 2 * r } });
      if (!lab) await page.screenshot({ path: 'smb_' + kind + '_full.png' });
    }
    // a close-up: the same body drawn big on a card canvas
    await page.evaluate(kind => {
      const cv = document.createElement('canvas'); cv.id = 'zoomcv'; cv.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:200px;z-index:99999;background:#20262a'; document.body.appendChild(cv);
      cv.width = 800; cv.height = 400; const body = { x: 0, y: 0, vx: 140, vy: 0, tailV: 140, id: -2 };
      const s10 = G.s10; for (let i = 0; i < 40; i++) { smbLookKind = kind; try { slPicDraw(cv, 'baseline', body, 1 + i / 30); } finally { smbLookKind = null; } }
      void s10;
    }, kind);
    await page.screenshot({ path: 'smb_' + kind + '_zoom.png', clip: { x: 0, y: 0, width: 400, height: 200 } });
    await page.evaluate(() => document.getElementById('zoomcv').remove());
  }
  // the sample branch screen at Lv 15
  const scr = await page.evaluate(() => {
    SET.view = 'arcade';
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100;
    G.s10 = { id: 'baseline', strain: 1, run: 1, ev: 0, shiftT: 12, shiftI: 0, trailT: 0, low: false };
    G.weapons = [makeSlot('v_phys_proj', false, 1), null, null, null]; recomputeAll();
    SMB.force = true; G.level = 15; hookSafe('tick', 1 / 60);
    const req = G.lootQueue.find(q => q.smb); if (!req) return { err: 'no sample branch request' };
    G.lootQueue = []; UI.openLoot(req);
    return { title: $('lootTitle').textContent, sub: $('lootSub').textContent, cards: UI.lootOpts.map(o => o.title), pics: document.querySelectorAll('#lootCards canvas.smbPic').length };
  });
  if (scr.err || scr.pics !== 3) bad.push('screen ' + JSON.stringify(scr));
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'smb_screen.png' });
  console.log(JSON.stringify(scr));
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (bad.length) console.log('FAIL', bad.join('; ')); else console.log('smbshot OK');
  await b.close();
})();
