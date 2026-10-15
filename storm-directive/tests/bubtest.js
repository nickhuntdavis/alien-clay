const { chromium } = require('playwright');
// The armour bubble (bodymods.js): it meets obstacles at its own edge, bounces you, dents on a fast hit, sloshes on a stop.
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 }); const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
    UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.enemies.length = 0; window.spawnRandom = () => {}; G.ebul.length = 0;
    const p = G.player, P = G.P, out = {};
    const ob = G.terrain.list.find(o => o.type === 'ridge') || G.terrain.list.find(o => o.def.solid && o.type !== 'acid');
    const tick = n => { for (let i = 0; i < n; i++) { G.enemies.length = 0; G.ebul.length = 0; update(1 / 30); G.state = 'play'; } };
    const place = gap => { p.x = ob.x - ob.r - gap; p.y = ob.y; p.vx = 0; p.vy = 0; p.hd = 0; p.face = 0; G.bub = null; };
    const surf = () => Math.round(Math.hypot(p.x - ob.x, p.y - ob.y) - ob.r);
    // No armour: you touch the surface with your body (12).
    P.armour = 0; place(80); let m = 1e9; for (let i = 0; i < 90; i++) { G.manual = { x: 1, y: 0 }; tick(1); m = Math.min(m, surf()); } out.noArmourClosest = m;
    // Armour: held off by the bubble (radius ~38), it gives a little under a push.
    P.armour = 6; G.armourLost = 0; place(80); m = 1e9; for (let i = 0; i < 90; i++) { G.manual = { x: 1, y: 0 }; tick(1); m = Math.min(m, surf()); } out.armourClosest = m; out.bubR = Math.round(bubbleR()); out.squash = G.bubC ? Math.round(G.bubC.pen) : 0;
    // Normal swim speed into it: a bounce, no dent.
    place(45); p.vx = 165; G.manual = null; for (let i = 0; i < 6 && p.vx > 0; i++) { p.vx = Math.max(p.vx, 150); tick(1); } out.bounceVx = Math.round(p.vx); out.lostSlow = G.armourLost;
    // Sprint speed (300): dented.
    G.armourLost = 0; G.bubDentT = -9; place(45); p.vx = 300; for (let i = 0; i < 6 && p.vx > 0; i++) { p.vx = Math.max(p.vx, 290); tick(1); } out.bounceFastVx = Math.round(p.vx); out.lostFast = G.armourLost;
    // Slosh: swim fast, stop dead.
    place(2000); G.manual = null; p.vx = 250; tick(3); p.vx = 0; p.vy = 0; tick(2); out.slosh = +Math.hypot(G.bub.ox, G.bub.oy).toFixed(1);
    // Leave you pressed against it for the screenshot.
    place(40); setZoom(2.2); for (let i = 0; i < 20; i++) { G.manual = { x: 1, y: 0 }; tick(1); }
    window.SHOT = { x: sx(p.x), y: sy(p.y) };
    return out;
  });
  await page.evaluate(() => { window.KEEP = setInterval(() => { if (G) G.manual = { x: 1, y: 0 }; }, 10); });
  await page.waitForTimeout(500);
  const s = await page.evaluate(() => ({ x: sx(G.player.x), y: sy(G.player.y) }));
  await page.screenshot({ path: require('path').resolve(__dirname, 'out/bubble.png'), clip: { x: s.x - 120, y: s.y - 120, width: 240, height: 240 } });
  console.log(JSON.stringify(r)); console.log('ERRORS', errors.length ? errors.slice(0, 3) : 'none'); await b.close();
})();
