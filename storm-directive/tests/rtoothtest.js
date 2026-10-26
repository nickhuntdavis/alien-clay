// Reverse Tooth Fairy (rtooth.js): Eggs switched to Blood can take Homing (plain Eggs can't); with both, Eggs fires homing
// teeth that embed and Bleed; a bleeding enemy with 3 teeth thrashes and bites its mates; bosses never thrash; the Homing
// mastery spreads teeth through bites; plain Eggs still drops eggs.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1;
    const start = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0; G.invuln = 1e9; G.weapons = [null, null, null]; G.manual = { x: 0, y: 0 }; if (G.toys) G.toys.teeth = []; };
    const foe = (x, y, o) => { const e = makeEnemy(ENEMIES.crawler, x, y); e.hp = e.maxHp = 1e5; e.speed = 0; if (o) Object.assign(e, o); G.enemies.push(e); gridBuild(); return e; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); } };
    const eggs = blood => { const w = makeSlot('s_toothfairy', false, 1); w.m10 = []; G.weapons[0] = w; if (blood) sabSwitch(w, 'arcane'); recomputeAll(); w.cd = 0; return w; };
    // ---- Homing: only once Eggs deals Blood
    start(); let w = eggs(false); out.plainHoming = modOk(w, 'homing'); if (out.plainHoming) bad.push('plain Eggs offered Homing');
    start(); w = eggs(true); out.blood = w.def.elem; out.bloodHoming = modOk(w, 'homing'); if (!out.bloodHoming) bad.push('Blood Eggs not offered Homing (' + w.def.elem + ')');
    // ---- plain Eggs still drop eggs
    start(); w = eggs(false); { const e = foe(150, 0); toothFire(w, e); if (!TOYS().teeth.some(t => t.w === w)) bad.push('plain Eggs no longer drops eggs'); if (G.proj.some(pr => pr.w === w)) bad.push('plain Eggs fired teeth'); }
    // ---- with Homing: homing teeth that embed and Bleed
    start(); w = eggs(true); w.m10.push('homing'); recomputeAll(); { const a = foe(150, 0), c = foe(150, 60); toothFire(w, a); w.cd = 99; out.teeth = G.proj.filter(pr => pr.w === w).length; if (out.teeth !== 2) bad.push('Homing 1 fired ' + out.teeth + ' teeth, want 2'); run(1); out.embedded = (a.rtTeeth || 0) + (c.rtTeeth || 0); if (out.embedded !== 2) bad.push('2 teeth embedded ' + out.embedded); if (!((a.bleeds || []).length || (c.bleeds || []).length)) bad.push('teeth did not Bleed'); }
    // ---- teething: 3 teeth while bleeding -> thrashes and bites a neighbour
    start(); w = eggs(true); w.m10.push('homing'); recomputeAll(); { const a = foe(150, 0), nb = foe(150 + 26, 0); a.bleeds = [{ dps: 1, t: 5 }]; rtTeeth(a, w, 3); out.thrash = a.rtEnd > G.t; if (!out.thrash) bad.push('3 teeth while bleeding did not thrash');
      const h0 = nb.hp, x0 = a.x; run(1.5); out.bit = Math.round(h0 - nb.hp); out.moved = Math.round(Math.hypot(a.x - x0, a.y)); if (!(out.bit > 0)) bad.push('the thrashing enemy bit nobody'); if (out.moved < 20) bad.push('the thrashing enemy did not lurch ' + out.moved); }
    // ---- bosses never thrash
    start(); w = eggs(true); w.m10.push('homing'); recomputeAll(); { const bo = foe(150, 0, { boss: true }); bo.bleeds = [{ dps: 1, t: 5 }]; rtTeeth(bo, w, 5); if (bo.rtEnd > G.t) bad.push('a boss thrashed'); }
    // ---- mastery: bites plant teeth
    start(); w = eggs(true); for (let i = 0; i < 4; i++) w.m10.push('homing'); recomputeAll(); { const a = foe(150, 0), nb = foe(176, 0); a.bleeds = [{ dps: 1, t: 5 }]; rtTeeth(a, w, 3); run(1); if (!(nb.rtTeeth > 0)) bad.push('mastery: bites did not plant teeth'); }
    // ---- a real fight with drawing: no errors
    start(); w = eggs(true); w.m10.push('homing', 'homing'); recomputeAll(); for (let i = 0; i < 10; i++) foe(100 + (i % 5) * 30, -40 + Math.floor(i / 5) * 40); for (let i = 0; i < 240; i++) { G.state = 'play'; G.lootQueue = []; update(1 / 60); if (i % 30 === 0) render(); }
    out.fightTeeth = G.enemies.reduce((a, e) => a + (e.rtTeeth || 0), 0); if (!out.fightTeeth) bad.push('4 s of fire planted no teeth');
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
