// Little Jacob (ljacob.js): only with both the Charged and Exploding Rounds masteries on Sister Cousin; he waddles to the
// crowd and explodes (Blood, big); your other weapons' shots that touch him are eaten and fed into the blast (x1.25, capped);
// shots passing near bend towards him; he goes again after the cooldown.
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
    const scene = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.x = 0; G.player.y = 0; G.invuln = 1e9; G.weapons = [null, null, null]; G.manual = { x: 0, y: 0 }; G.lj = null; G.ljAt = 0; };
    const foe = (x, y) => { const e = makeEnemy(ENEMIES.crawler, x, y); e.hp = e.maxHp = 1e6; e.speed = 0; G.enemies.push(e); gridBuild(); return e; };
    const sis = (c, x) => { const w = makeSlot('s_seeker', false, 9); w.m10 = []; for (let i = 0; i < c; i++) w.m10.push('charged'); for (let i = 0; i < x; i++) w.m10.push('explode'); G.weapons[0] = w; recomputeAll(); w.cd = 99; w.reloadT = 99; return w; };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue = []; for (const w of G.weapons) if (w) { w.cd = Math.max(w.cd, 50); } update(1 / 60); } };
    // ---- only with both masteries
    for (const [c, x] of [[3, 4], [4, 3], [0, 0]]) { scene(); sis(c, x); foe(200, 0); run(0.5); if (G.lj || G.ljLast) bad.push(`Jacob came out with charged ${c} explode ${x}`); }
    // ---- out he comes, off he goes
    scene(); let w = sis(4, 4); const crowd = [foe(250, 0), foe(270, 20), foe(270, -20)]; run(0.1);
    if (!G.lj) bad.push('no Jacob with both masteries'); run(4);
    out.plain = G.ljLast && Math.round(G.ljLast.dmg); if (!G.ljLast) bad.push('Jacob never went off');
    else { if (!crowd.every(e => e.hp < e.maxHp)) bad.push('the blast missed the crowd'); if (Math.abs(G.ljLast.dmg - w.s.dmg * LJ.base) > 1) bad.push('plain blast ' + G.ljLast.dmg + ' vs ' + w.s.dmg * LJ.base); }
    // ---- feeding him
    scene(); w = sis(4, 4); foe(400, 0); const gun = makeSlot('v_phys_proj', false, 3); G.weapons[1] = gun; recomputeAll(); run(0.05);
    const J = G.lj; if (!J) bad.push('no Jacob to feed'); else {
      for (let i = 0; i < 6; i++) { const pr = spawnProj(gun, J.x - 60, J.y + (i % 2 ? 6 : -6), 0, weaponSrc(gun)); if (pr) pr.dmg = 50; }
      run(0.4); out.bank = Math.round(J.bank); if (!(J.bank >= 200)) bad.push('shots were not eaten: bank ' + J.bank);
      run(4); out.fed = G.ljLast && Math.round(G.ljLast.dmg); if (!(G.ljLast && G.ljLast.dmg > J.base + J.bank)) bad.push('feeding did not grow the blast ' + out.fed);
    }
    // ---- shots passing near bend in
    scene(); w = sis(4, 4); foe(400, 0); G.weapons[1] = makeSlot('v_phys_proj', false, 3); recomputeAll(); run(0.05); { const J2 = G.lj; const pr = spawnProj(G.weapons[1], J2.x - 100, J2.y + 70, 0, weaponSrc(G.weapons[1])); run(0.5); if (!(J2.bank > 0 || pr.dead)) bad.push('a passing shot did not bend in'); }
    // ---- cap
    scene(); w = sis(4, 4); foe(400, 0); run(0.05); G.lj.bank = 1e9; run(5); if (!(G.ljLast && G.ljLast.dmg <= w.s.dmg * LJ.base * (1 + LJ.cap * LJ.feed) + 1)) bad.push('the bank is not capped');
    // ---- again after the cooldown, with drawing
    scene(); w = sis(4, 4); for (let i = 0; i < 6; i++) foe(220 + i * 15, (i % 2) * 30); let n = 0; for (let i = 0; i < 60 * 12; i++) { G.state = 'play'; G.lootQueue = []; const had = !!G.lj; update(1 / 60); if (had && !G.lj) n++; if (i % 60 === 0) render(); } out.blasts = n; if (n < 2) bad.push('only ' + n + ' blasts in 12 s');
    out.ok = bad.length === 0;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
