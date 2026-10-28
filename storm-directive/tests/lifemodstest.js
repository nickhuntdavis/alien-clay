// Lifesteal back in the v10 draft (lifemods.js): Bloodsucker heals a share of each hit within the lifesteal pool and ranks
// up; Umbilical Cord heals more and can draw four times the pool; the two share a group; real (slice-only) drafts deal
// Bloodsucker, Umbilical Cord, Leech and Slurp.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.weapons[0] = makeSlot('v_phys_proj', false, 9); G.weapons[1] = G.weapons[2] = null; recomputeAll(); return G.weapons[0]; };
    const foe = () => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + 100, p.y, {}); e.speed = 0; e.hp = e.maxHp = 1e7; G.enemies.push(e); return e; };
    const healOf = (w, pool) => { G.player.hp = 10; G.lsBudget = pool; const e = foe(); damageEnemy(e, 1000, weaponSrc(w)); return { h: G.player.hp - 10, left: G.lsBudget }; };
    // 1. Bloodsucker: nothing without it, a share of the hit with it, more at Rank 2; the pool caps it
    let w = fresh(); G.P.maxHp = 1e4;
    const none = healOf(w, 100).h;
    modAdd(w, 'bloodsucker'); const r1 = healOf(w, 100).h;
    modAdd(w, 'bloodsucker'); const r2 = healOf(w, 100).h;
    const capped = healOf(w, 2);
    out.blood = [none, +r1.toFixed(2), +r2.toFixed(2), +capped.h.toFixed(2), +capped.left.toFixed(2)];
    if (none > 0 || !(r1 > 0) || !(r2 > r1) || !(capped.h <= 2 * G.P.healMult + 1e-6) || capped.left > 1e-6) bad.push('Bloodsucker ' + out.blood);
    // 2. Umbilical Cord: heals more than Bloodsucker Rank 1 and draws at most four times a small pool
    w = fresh(); G.P.maxHp = 1e4; modAdd(w, 'umbilical');
    const c1 = healOf(w, 100).h, c2 = healOf(w, 2);
    out.cord = [+c1.toFixed(2), +c2.h.toFixed(2), +c2.left.toFixed(2)];
    if (!(c1 > r1) || !(c2.h > 2 * G.P.healMult + 1e-6) || !(c2.h <= 8 * G.P.healMult + 1e-6)) bad.push('Umbilical Cord ' + out.cord);
    // 3. One group: a weapon with one is never offered the other
    out.group = [modOk(w, 'bloodsucker'), MM_GNAME[mmGroup('umbilical')]];
    if (modOk(w, 'bloodsucker')) bad.push('Bloodsucker offered beside Umbilical Cord');
    const card = modCard(fresh(), 'umbilical'); out.cordCard = [card.rarity, card.sub];
    if (card.rarity !== 3) bad.push('Umbilical Cord card rarity ' + card.rarity);
    // 4. Real drafts (slice only) deal all four; count over 150 level-up drafts
    SLICE.force = true; fresh(); const n = { 'mod:bloodsucker': 0, 'mod:umbilical': 0, vt_leech: 0, hp_slurp: 0 }; let drafts = 0, any = 0;
    for (let i = 0; i < 150; i++) {
      const cs = genLoot({ kind: 'level' }).filter(Boolean); drafts++; let hit = 0;
      for (const c of cs) { const k = c.card || c.family; if (k in n) { n[k]++; hit = 1; } }
      any += hit;
    }
    SLICE.force = false;
    out.slice = Object.assign({ drafts, withLifesteal: any }, n);
    for (const k in n) if (!n[k]) bad.push(k + ' never dealt in slice drafts');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
