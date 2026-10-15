// Close-ups of the damage-type looks (typefx.js) at 3x zoom: statuses, puddles, and a reaction of each style mid-flight.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  await page.evaluate(() => { META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; UI.quickStart(); G.lootQueue = []; G.state = 'play'; G.weapons = G.weapons.map(() => null); G.spells = []; document.querySelectorAll('.screen').forEach(s => s.style.display = 'none'); });
  const scene = (kind, view, t) => page.evaluate(([kind, view, t]) => {
    SET.view = view; refreshPalette();
    const p = G.player; p.x = 0; p.y = 60; G.core.x = 9000; cam.x = 0; cam.y = 0; ZOOM.z = 3; S = S0 * 3;
    G.enemies.length = 0; G.zones.length = 0; G.tfx = []; G.parts.length = 0; G.fx.length = 0; G.terrain.list.length = 0; G.terrain.grid.clear(); G.realT = t;
    const at = (i, n) => [-62 + (i % 3) * 62, -150 + Math.floor(i / 3) * 64];
    if (kind === 'status') {
      const set = [e => { e.burn = 3; e.burnDps = 1; }, e => { e.chill = 2; e.chillAmt = 0.5; e.svx = 40; }, e => { e.frozen = 3; }, e => { e.poison = 4; e.poisonStacks = 6; }, e => { e.fizz = 3; }, e => { e.pickle = 3; }, e => { e.bloodT = 4; e.bloodN = 4; e.svx = 50; }, e => { e.curse = 3; e.svx = -40; }, e => { e.xrayT = G.t + 99; }];
      set.forEach((f, i) => { const [x, y] = at(i); const e = makeEnemy(ENEMIES.brute, x, y); e.hp = e.maxHp = 1e9; e.speed = 0; f(e); G.enemies.push(e); });
    } else if (kind === 'zones') {
      const Z = (x, y, o) => G.zones.push(Object.assign({ x, y, r: 26, life: 1.4, max: 2, dps: 0, pull: 0, tick: 0, src: { noStatus: true }, quiet: true, color: '#fff' }, o));
      Z(-50, -190, { oil: true }); Z(50, -190, { heal: 0.001 }); Z(-50, -120, { snot: true }); Z(50, -120, { water: true, life: 1.6 }); Z(-40, -40, { flame: true, r: 34 });
      const g = makeEnemy(ENEMIES.brute, 55, -40); g.charmed = true; g.charmT = 4; g.ghost = true; g.svx = 40; g.hp = g.maxHp = 1e9; g.speed = 0; G.enemies.push(g);
    } else {
      const ids = ['bath', 'waterlogged', 'heartburn', 'hemorrhage', 'holywater', 'pandemic', 'greasefire', 'meltdown', 'slipnslide'];
      ids.forEach((id, i) => { const [x, y] = at(i); typeRxFx(x, y, 14, id); G.tfx[G.tfx.length - 1].t0 = G.realT - G.tfx[G.tfx.length - 1].dur * 0.35; });
    }
    try { render(); } catch (err) { return err.message + ' ' + err.stack.split('\n')[1]; }
    return cv.toDataURL('image/png');
  }, [kind, view, t]);
  for (const kind of ['status', 'zones', 'rx']) for (const view of ['arcade', 'lab']) { const m = await scene(kind, view, 12.3); if (!m.startsWith('data:')) errors.push(m); else require('fs').writeFileSync(`fx_${kind}_${view}.png`, Buffer.from(m.split(',')[1], 'base64')); }
  console.log('ERRORS', JSON.stringify(errors), errors.length ? 'FAIL' : 'ok');
  await b.close();
})();
