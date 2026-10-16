// Screenshots of every v9.23 Feat mid-effect (newfeats.js), in Lab view and in Darkfield: tests/out/nf_<id>_lab.png and _df.png.
// node newfeatshot.js [id ...] for just those.
const { chromium } = require('playwright');
const WHEN = { slimemould: 0.7, polarbody: 1.4, hagfish: 0.35, vanishingtwin: 0.45, mosquito: 0.68, notlatex: 1.2, donorsample: 1.05, ouija: 1.9, formicacid: 0.42,
  fecaltransplant: 1.2, bombardier: 0.18, crabs: 1.4, vandegraaff: 1.6, wanderingwomb: 1.2, anhydrobiosis: 1.0, capacitation: 0.14, brownfat: 1.7, asymptomatic: 4.15,
  rupture: 0.22, spinnbarkeit: 1.0, tonic: 0.4, earcandling: 1.6, hostileenv: 1.5, sharedplacenta: 0.9, productivecough: 0.3, hirudotherapy: 1.4, lipidbilayer: 1.0,
  biofilm: 2.5, shedlining: 1.0, osmosis: 0.25, aerosol: 0.7, selflube: 1.0, anticoagulant: 0.25, fertilewindow: 1.0, surfactant: 1.6, lacticacid: 0.2 };
(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  for (const id of Object.keys(WHEN).filter(id => !only.length || only.includes(id))) {
    for (const df of [false, true]) {
      await page.evaluate(([id, t, df]) => {
        META.seen = {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; META.seenSt = {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
        SET.view = 'lab'; SET.darkfield = df; refreshPalette();
        UI.sample = 's000'; newGame(); UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.debug.freeze = true;
        G.terrain = { list: [], grid: new Map(), regridT: 1e9 };
        const w = makeSlot(id, true, 3); computeStats(w); G.spells = [w]; G.weapons = []; recomputeAll();
        const p = G.player; cam.x = p.x; cam.y = p.y - 60; G.manual = { x: 0, y: 0 };
        const add = (def, x, y) => { const e = makeEnemy(ENEMIES[def], p.x + x, p.y + y); e.hp = e.maxHp = 1e6; G.enemies.push(e); return e; };
        for (let i = 0; i < 7; i++) add('brute', -60 + i * 34, -150 - (i % 2) * 40 - i * 8);
        for (let i = 0; i < 4; i++) add('spitter', -140 + i * 90, -330);
        add('brute', 90, 60); add('brute', -100, 40);
        if (id === 'osmosis') { const e = G.enemies[2]; e.burn = 3; e.burnDps = 1; e.shock = 2; e.fizz = 3; }
        if (id === 'anticoagulant') for (const e of G.enemies.slice(0, 6)) { e.bloodT = 4; e.bloodDps = 5; e.bloodN = 3; }
        if (id === 'capacitation') for (const e of G.enemies.slice(0, 2)) { e.burn = 3; e.burnDps = 1; }
        if (id === 'lacticacid') w.nfCharge = 1;
        if (id === 'fecaltransplant') { G.manual = { x: 0.6, y: 0.2 }; }
        G.spells = []; for (let f = 0; f < 20; f++) update(1 / 30); G.spells = [w]; // (settle, without performing it yet)
        const tgt = w.def.noTarget ? null : acquire(w.dir, w.s.range * 1.3, p.x, p.y);
        if (id === 'anhydrobiosis') { w.cd = 0; G.debug.god = false; p.hp = G.P.maxHp * 0.15; p.iframes = 0; hurtPlayer(G.P.maxHp * 0.1, 'Test'); G.debug.god = true; }
        else featFire(w, tgt);
        for (let f = 0; f < Math.round(t * 30); f++) { update(1 / 30); G.player.hp = G.P.maxHp; }
        cam.x = p.x; cam.y = p.y - 60;
        render();
      }, [id, WHEN[id], df]);
      await page.screenshot({ path: `out/nf_${id}_${df ? 'df' : 'lab'}.png`.replace('out/', '') });
    }
  }
  const caught = await page.evaluate(() => Object.keys(ERRS.seen));
  console.log('ERRORS', JSON.stringify(errors.concat(caught)));
  await b.close();
})();
