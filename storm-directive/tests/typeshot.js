// Pass 5 looks: every damage-type status in the body, the puddles, flames and the x-ray, in Lab and Arcade view (typefx.js).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const setup = () => page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    if (!G) UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.weapons = G.weapons.map(() => null); G.spells = [];
    const p = G.player; p.x = 0; p.y = 0; cam.x = 0; cam.y = 0; G.enemies.length = 0; G.zones.length = 0; G.terrain.list.length = 0; G.terrain.grid.clear();
    const set = [['burn', e => { e.burn = 3; e.burnDps = 1; }], ['chill', e => { e.chill = 2; e.chillAmt = 0.3; e.svx = 40; }], ['frozen', e => { e.frozen = 3; }], ['shock', e => { e.shock = 2; }],
      ['sick', e => { e.poison = 4; e.poisonStacks = 5; }], ['oil', e => { e.fizz = 3; }], ['wet', e => { e.pickle = 3; }], ['blood', e => { e.bloodT = 4; e.bloodN = 4; e.svx = 50; }], ['curse', e => { e.curse = 3; e.svx = -40; }], ['xray', e => { e.xrayT = G.t + 99; }]];
    set.forEach(([k, f], i) => { const e = makeEnemy(ENEMIES.brute, -120 + (i % 4) * 80, -260 + Math.floor(i / 4) * 90); e.hp = e.maxHp = 1e9; e.speed = 0; f(e); G.enemies.push(e); });
    const Z = (o) => G.zones.push(Object.assign({ r: 50, life: 3, max: 4, dps: 0, pull: 0, tick: 0, src: { noStatus: true }, quiet: true, color: '#fff' }, o));
    Z({ x: -120, y: 120, oil: true }); Z({ x: 0, y: 120, heal: 0.001 }); Z({ x: 120, y: 120, snot: true }); Z({ x: -60, y: 230, water: true }); Z({ x: 80, y: 240, flame: true, r: 60 });
  });
  const shot = async (view, name) => { await page.evaluate(v => { SET.view = v; refreshPalette(); for (const e of G.enemies) { if (e.xrayT) e.xrayT = G.t + 99; } render(); }, view); await page.screenshot({ path: name }); };
  await setup(); await shot('lab', 'type_lab.png'); await shot('arcade', 'type_arcade.png');
  await page.evaluate(() => { SET.darkfield = true; }); await shot('lab', 'type_lab_df.png'); await page.evaluate(() => { SET.darkfield = false; });
  const grey = await page.evaluate(() => { SET.view = 'lab'; refreshPalette(); render(); const d = ctx.getImageData(0, cv.height * 0.25, cv.width, cv.height * 0.45).data; /* (the slide, not the HUD) */ let n = 0; for (let i = 0; i < d.length; i += 16) if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 30) n++; return n; });
  console.log('lab coloured pixels:', grey);
  console.log('ERRORS', JSON.stringify(errors), errors.length || grey > 50 ? 'FAIL' : 'ok');
  await b.close();
})();
