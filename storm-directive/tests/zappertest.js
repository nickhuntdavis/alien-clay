// Unwanted Contact as a zip-zap (zapper.js): the base spark hits one enemy only; Ricochet forks to new enemies; Piercing
// runs a line through the enemies behind; Homing picks an enemy that isn't Charged; Area splashes; Charged Charges in
// one hit; the Chain Letter-style extra jumps still chain; Extra Projectiles adds sparks; the draft no longer hides
// Ricochet, Piercing, Homing or Area on it.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.evaluate(() => { if (typeof P11 !== 'undefined') Object.assign(P11, { cap: 99, start: 1, dmgTo: 1, dmgLv: 0, farK: 1, foeHp: 1 }); });
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
    const scene = () => { G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0; G.weapons.forEach((w, i) => { G.weapons[i] = null; }); G.spells.forEach((w, i) => { G.spells[i] = null; }); };
    const foe = (dx, dy) => { const e = makeEnemy(ENEMIES.crawler, dx, dy); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const gun = mods => { const w = makeSlot('s_tesla', false, 1); w.m10 = []; for (const [id, n] of mods) for (let i = 0; i < n; i++) w.m10.push(id); G.weapons[0] = w; recomputeAll(); return w; };
    let direct = new Set(); // (enemies the spark itself hit: Static's own arcs off Charged enemies are the damage type, fight.js, not the weapon)
    const hurt = () => G.enemies.filter(e => direct.has(e));
    const zap = (w, t) => { direct = new Set(); const dE = damageEnemy; damageEnemy = function (e, d, src) { if (!(src && src.arc)) direct.add(e); return dE.apply(this, arguments); }; try { fireWeapon(w, t); } finally { damageEnemy = dE; } };
    // base: one spark, one enemy
    scene(); let w = gun([]); let a = foe(100, 0), b2 = foe(150, 0), c = foe(200, 0); zap(w, a);
    out.base = hurt().length; if (out.base !== 1 || !(a.hp < a.maxHp)) bad.push('base spark hit ' + out.base + ' enemies');
    if (!zpIs(w)) bad.push('zpIs false for Unwanted Contact');
    // Ricochet 1 / 3 and mastery
    for (const [n, want] of [[1, 2], [3, 4], [4, 7]]) { scene(); w = gun([['ricochet', n]]); const t = foe(100, 0); for (let i = 0; i < 8; i++) foe(100 + Math.cos(i) * 90, Math.sin(i) * 90); zap(w, t); const h = hurt().length; out['ric' + n] = h; if (h < want) bad.push(`Ricochet ${n}: hit ${h}, want ${want}+`); }
    // Piercing 1 / 3
    for (const [n, want] of [[1, 2], [2, 4], [3, 6]]) { scene(); w = gun([['piercing', n]]); const t = foe(80, 0); for (let i = 1; i <= 5; i++) foe(80 + i * 40, 0); foe(80, 120); zap(w, t); const h = hurt().length; out['pie' + n] = h; if (h !== want) bad.push(`Piercing ${n}: hit ${h}, want ${want}`); if (direct.has(G.enemies[6])) bad.push('Piercing hit off the line'); }
    // Homing: skips the Charged enemy
    scene(); w = gun([['homing', 1]]); { const near = foe(60, 0), far = foe(160, 0); near.chargeT = G.t + 5; zap(w, near); out.hom = [direct.has(near), direct.has(far)]; if (!direct.has(far) || direct.has(near)) bad.push('Homing did not pick the un-Charged enemy ' + out.hom); }
    // Area splash
    scene(); w = gun([['area', 2]]); { const t = foe(100, 0), side = foe(130, 20); zap(w, t); if (!direct.has(side)) bad.push('Area splash missed a neighbour'); }
    // Charged: Charged in one hit
    scene(); w = gun([['charged', 1]]); { const t = foe(100, 0); zap(w, t); if (!(t.chargeT > G.t)) bad.push('Charged spark did not Charge'); }
    // extra jumps (as from Chain Letter): s.chain above the base chains on
    scene(); w = gun([]); w.s.chain = (w.def.base.chain || 0) + 2; { const t = foe(100, 0); foe(180, 0); foe(260, 0); foe(500, 0); zap(w, t); out.jumps = hurt().length; if (out.jumps !== 3) bad.push('extra jumps hit ' + out.jumps + ', want 3'); }
    // Extra Projectiles: two sparks at two enemies
    scene(); w = gun([['extra', 1]]); { const t = foe(100, 0); foe(-100, 0); zap(w, t); out.extra = hurt().length; if (out.extra < 2) bad.push('Extra Projectiles: ' + out.extra + ' hit'); }
    // the draft offers them now
    scene(); w = gun([]); for (const id of ['ricochet', 'piercing', 'homing', 'area']) if (MOD_DEAD.s_tesla[''].includes(id)) bad.push(id + ' still marked dead on Unwanted Contact');
    // a real fight: no errors over 5 s
    scene(); w = gun([['ricochet', 2], ['piercing', 1], ['area', 1]]); for (let i = 0; i < 12; i++) foe(60 + (i % 4) * 50, -60 + Math.floor(i / 4) * 60);
    for (let i = 0; i < 300; i++) { G.state = 'play'; update(1 / 60); }
    out.fight = G.enemies.filter(e => e.hp < e.maxHp).length; if (out.fight < 6) bad.push('5 s of fire hit only ' + out.fight);
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
