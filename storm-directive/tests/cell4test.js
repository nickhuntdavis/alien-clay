// Pool cells (cellmods4.js): Nocturnal Emission and Hot Mess, thrown as water balloons, have their own effect for all 25
// modifiers (MODIFIER_MATRIX.md 5.10). Every cell runs at Lv 1 and at its mastery against a crowd: no errors, and the weapon
// still deals damage. Plus the card rules and a few behaviours.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    // 1. Card rules: every modifier is dealt on both pools, with its own card text, and no fork screens
    for (const id of ['v_ice_pool', 'v_flame_pool']) {
      const w = fresh(id); SET.noLimits = true;
      const no = BL_CELLS.filter(m => !modOk(w, m)); if (no.length) bad.push(id + ' not dealt: ' + no);
      const c = modCard(w, 'ranged'); if (!c || c.desc !== 'TODO_COPY:cell_bl_ranged') bad.push(id + ' card text ' + (c && c.desc));
      modAdd(w, 'pull'); modAdd(w, 'pull'); SET.noLimits = false;
      if (G.lootQueue.some(q => q.kind === 'fork')) bad.push(id + ' fork screen');
    }
    // 2. Every cell at Lv 1 and at mastery
    for (const id of ['v_ice_pool', 'v_flame_pool']) for (const m of BL_CELLS) for (const n of [1, 4]) {
      const w = fresh(id); w.m10 = Array(n).fill(m); computeStats(w); crowd();
      DMG.n = 0; const k = id.slice(2, 5) + ':' + m + n;
      try { run(6); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    for (const id of ['v_ice_pool', 'v_flame_pool']) { fresh(id); crowd(); DMG.n = 0; run(6); out.dmg[id.slice(2, 5) + ':none'] = Math.round(DMG.n); } // (the plain weapon, to compare)
    // 3. Behaviours
    let w = fresh('v_ice_pool'); w.m10 = ['ricochet', 'ricochet', 'ricochet']; computeStats(w); // Rubber balloon: a splat on every face
    for (let i = 0; i < 8; i++) { const e = foe(160 + i * 40, (i % 2) * 60 - 30); e.speed = 0; }
    fireWeapon(w, G.enemies[0]); for (let i = 0; i < 180; i++) { G.state = 'play'; update(1 / 60); G.player.hp = 1e6; }
    out.bounces = G.zones.filter(z => z.blW === w).length; if (!(out.bounces >= 3)) bad.push('rubber balloon puddles ' + out.bounces);
    w = fresh('v_flame_pool'); w.m10 = ['mines']; computeStats(w); const e1 = foe(200, 0); e1.speed = 0; XC_FIRE.bl(w, e1); // a balloon waits on the floor
    out.floor = blS().floor.filter(q => q.w === w).length; if (out.floor !== 1) bad.push('floor balloons ' + out.floor);
    w = fresh('v_ice_pool'); w.m10 = ['orbiting', 'orbiting']; computeStats(w); update(1 / 60); out.juggle = w.blOrb ? w.blOrb.slots.length : 0; if (out.juggle !== 2) bad.push('juggled ' + out.juggle);
    w = fresh('v_ice_pool'); sabSwitch(w, 'arcane'); w.m10 = ['catalyst']; computeStats(w); const e2 = foe(200, 0); e2.speed = 0; // Two-tone balloon
    blPop(w, e2, e2.x, e2.y); out.tones = [...new Set(G.zones.filter(z => z.blW === w).map(z => z.elem))].sort().join();
    if (out.tones !== 'arcane,ice') bad.push('two-tone ' + out.tones);
    w = fresh('v_flame_pool'); w.m10 = ['charged']; computeStats(w); const e3 = foe(200, 0); e3.speed = 0; XC_FIRE.bl(w, e3); // Overfilled: it swells first
    out.wind = !!w.blWind; for (let i = 0; i < 40; i++) update(1 / 60); out.thrown = G.proj.some(q => q.lob && q.src.w === w) || G.zones.some(z => z.blW === w);
    if (!out.wind || !out.thrown) bad.push('overfilled ' + [out.wind, out.thrown]);
    w = fresh('v_ice_pool'); w.m10 = ['homing']; computeStats(w); const z0 = blPuddle(w, G.player.x, G.player.y + 200); const e4 = foe(150, 200); e4.speed = 0; const x0 = z0.x; // Creeping puddle
    for (let i = 0; i < 60; i++) { G.state = 'play'; update(1 / 60); } out.creep = Math.round(z0.x - x0); if (!(out.creep > 5)) bad.push('creeping ' + out.creep);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
