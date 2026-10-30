// The six weapon branch costumes (baselinelook.js BL_WEAP): a close-up of each at rest and in action on the Baseline body
// (out/wpn_<kind>_zoom.png), and each in a run at phone size on the sharp body canvas, Arcade and Lab view (out/wpn_<kind>.png,
// out/wpn_<kind>_lab.png), plus the Come back husk and skeleton.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; window.YOU_HD_FORCE = 1; splashEnd(); }); await page.waitForTimeout(300);
  const KINDS = [['v_phys_spread', 0, 'sperm'], ['v_phys_spread', 1, 'evil'], ['v_phys_spread', 2, 'ride'], ['v_phys_contact', 0, 'kungfu'], ['v_phys_contact', 1, 'samurai'], ['v_phys_contact', 2, 'biting']];
  for (const [, , kind] of KINDS.concat([[0, 0, 'husk'], [0, 0, 'skel']])) { // close-ups: rest on the left, in action on the right
    await page.evaluate(kind => {
      const box = document.createElement('div'); box.id = 'zbox'; box.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:130px;z-index:99999;display:flex;background:#20262a';
      document.body.appendChild(box);
      const look = kind === 'husk' || kind === 'skel' ? 'sperm' : kind;
      [0, 1].forEach(on => {
        const cv = document.createElement('canvas'); cv.style.cssText = 'width:200px;height:130px;position:relative'; cv.width = 400; cv.height = 260; box.appendChild(cv);
        const body = { x: 0, y: 0, vx: 140, vy: 0, tailV: 140, id: -2 }, now = 1.37;
        const S1 = cv.height / 30, keep = { ctx, S, W, H, cx: cam.x, cy: cam.y, G }, g = cv.getContext('2d');
        for (let i = 0; i < 30; i++) { // (samplebranch.js smbPicDraw, framed wider: the costumes reach past the head)
          try { ctx = g; W = cv.width; H = cv.height; G = { realT: 1 + i / 30 }; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); S = S1; body.hd = body.face = 0; cam.x = body.x - W * 0.08 / S; cam.y = body.y; slDraw('baseline', sx(body.x), sy(body.y), 0, PAL.you, 1, 1, body, 1 + i / 30); }
          finally { ctx = keep.ctx; S = keep.S; W = keep.W; H = keep.H; cam.x = keep.cx; cam.y = keep.cy; G = keep.G; }
        }
        const hx = cv.width * 0.58 + S1, hy = cv.height / 2;
        const o = on ? { act: 1, speed: 1.2, saw: true, kick: 0.7, cut: 0.5, bite: 0.5, blood: true } : { act: 0, speed: 0, saw: false, kick: 0, cut: 0, bite: 0 };
        if (kind === 'husk') o.husk = true; if (kind === 'skel') o.skel = true;
        blDrawLook(cv.getContext('2d'), look, hx, hy, 7.5 * S1, 0, now, o);
      });
    }, kind);
    await page.screenshot({ path: 'wpn_' + kind + '_zoom.png', clip: { x: 0, y: 0, width: 400, height: 130 } });
    await page.evaluate(() => document.getElementById('zbox').remove());
  }
  for (const [id, letter, kind] of KINDS) {
    for (const lab of [false, true]) {
      await page.evaluate(([id, letter, lab]) => {
        META.seen = new Proxy(META.seen || {}, { get: () => 1 }); META.seenSt = new Proxy(META.seenSt || {}, { get: () => 1 });
        UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; SET.spawnOff = 1; G.P.spawnMult = 0;
        G.s10 = { id: 'baseline', strain: 1, run: 1, ev: 0, shiftT: 12, shiftI: 0, trailT: 0, low: false };
        G.weapons = [makeSlot(id, false, 1), null, null, null]; G.enemies.length = 0; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
        genLoot({ kind: 'fork', w: G.weapons[0], lv: 3 })[letter].apply(); G.weapons[0].firedT = 99;
        SET.view = lab ? 'lab' : 'arcade'; UI.show('hud');
        for (let f = 0; f < 70; f++) { G.player.vx = 120 * Math.cos(f / 40); G.player.vy = 120 * Math.sin(f / 40); G.player.x += G.player.vx / 60; G.player.y += G.player.vy / 60; G.player.face = Math.atan2(G.player.vy, G.player.vx); update(1 / 60); }
        const w = G.weapons[0]; if (w.bl2) w.bl2.sawOn = G.t; if (w.hg) { w.hg.kickT = w.hg.biteT = G.realT; w.hg.cutT = G.t - 0.1; }
        render();
      }, [id, letter, lab]);
      await page.waitForTimeout(100);
      const box = await page.evaluate(() => ({ x: sx(G.player.x), y: sy(G.player.y), S }));
      const r = Math.round(70 * box.S / 1.6) + 40;
      await page.screenshot({ path: 'wpn_' + kind + (lab ? '_lab' : '') + '.png', clip: { x: Math.max(0, box.x - r), y: Math.max(0, box.y - r), width: 2 * r, height: 2 * r } });
    }
  }
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | ')); else console.log('wpnshot OK');
  await b.close();
})();
