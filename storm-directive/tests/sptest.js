// Sperm passives and masteries (spassives.js, modmatrix.js): passive slots by level, one weapon-modifier mastery and one
// sperm-passive mastery a build (Extra Mastery adds one of either kind), The Runs leaves a damaging trail in the sample's
// primary damage type, Membrane Shield's levels share its slot, and the Laser draws as a laser.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (s) => { META.profile = 's10_' + (s || 'ordered'); UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; genLoot({ kind: 'start' })[0].apply(); G.enemies.length = 0; return G.weapons.find(Boolean); };
    const card = id => CARDS.find(c => c.id === id);
    // 1. Slots: 2, then +1 at Lv 8, 16, 24.
    fresh(); const sl = [1, 8, 16, 24].map(l => (G.level = l, spSlots())); out.slots = sl;
    if (sl.join() !== '2,3,4,5') bad.push('slots ' + sl);
    // 2. Sperm mastery: Rank 4 for one passive only.
    fresh(); G.level = 30; const a = card('m_slip'), c2 = card('m_fingers');
    for (let i = 0; i < 4; i++) if (a.eligible(G)) a.apply(G);
    for (let i = 0; i < 4; i++) if (c2.eligible(G)) c2.apply(G);
    out.sperm = [mr('m_slip'), mr('m_fingers')];
    if (mr('m_slip') !== 4 || mr('m_fingers') !== 3) bad.push('sperm mastery ' + out.sperm);
    // 3. Weapon mastery: Rank 4 on one modifier only; Extra Mastery opens one more.
    const w = G.weapons.find(Boolean); w.lvl = 9;
    const ids = modsFor(w); const m1 = ids[0], m2 = ids.find(k => mmGroup(k) !== mmGroup(m1));
    for (let i = 0; i < 4; i++) modAdd(w, m1);
    if (m2) for (let i = 0; i < 4; i++) modAdd(w, m2);
    out.weapon = [m1, modCount(w, m1), m2, m2 && modCount(w, m2)];
    if (modCount(w, m1) !== 4 || (m2 && modCount(w, m2) !== 3)) bad.push('weapon mastery ' + out.weapon);
    const mc = modCard(w, m1); if (m2) { const mc2 = modCard(w, m2); if (mc2.tag === 'MASTERY' && modCardOk(w, m2)) bad.push('second weapon mastery offered'); }
    card('sp_extra').apply(G);
    if (m2 && !modAdd(w, m2)) bad.push('Extra Mastery did not open a second mastery');
    if (c2.eligible(G)) bad.push('Extra Mastery opened two more');
    // 4. The Runs: a trail in the sample's primary type that hurts.
    fresh('beta'); const runs = card('sp_runs'); runs.apply(G);
    const p = G.player, e = makeEnemy(ENEMIES.brute, p.x, p.y, {}); e.speed = 0; e.hp = e.maxHp = 5000; G.enemies.push(e);
    const hp0 = e.hp; for (let f = 0; f < 120; f++) { p.x += 3; e.x = p.x - 20; e.y = p.y; p.vx = 180; G.lootQueue = []; G.state = 'play'; update(1 / 60); }
    out.runs = { type: G.spRuns && G.spRuns.type, zones: G.zones.filter(z => z.trail).length, dmg: Math.round(hp0 - e.hp) };
    if (!G.spRuns || G.spRuns.type !== DRAFT_INT[S10_BY.beta.types[0]]) bad.push('The Runs type ' + out.runs.type);
    if (!out.runs.zones) bad.push('The Runs left no trail');
    // 5. Membrane Shield: Latex Protection plus its levels use one slot.
    fresh(); G.level = 1; for (const id of ['latex', 'thick', 'fast']) pdefCard(id).apply();
    out.defs = defsHeld(); if (defsHeld() !== 1) bad.push('Membrane Shield slots ' + defsHeld());
    // 7. No slot limits (setting): any number of passives and modifiers, groups ignored.
    fresh(); SET.noLimits = true; const fw = G.weapons.find(Boolean); let nm = 0; for (const id of modsFor(fw)) if (modAdd(fw, id)) nm++;
    out.noLimits = [spSlots() > 20, nm]; if (!(spSlots() > 20) || nm < 6) bad.push('no limits ' + out.noLimits);
    SET.noLimits = false;
    // 6. The Laser draws as a laser.
    fresh(); const lw = G.weapons.find(Boolean); G.weapons[0] = makeSlot('v_flame_beam', false, 1); computeStats(G.weapons[0]);
    const tgt = makeEnemy(ENEMIES.brute, p.x + 120, p.y, {}); G.enemies.push(tgt); v10Fire(G.weapons[0], tgt, weaponSrc(G.weapons[0]));
    const fx = G.v10fx && G.v10fx[G.v10fx.length - 1]; out.laser = fx && [fx.t, fx.c];
    if (!fx || fx.t !== 'laser') bad.push('laser fx ' + JSON.stringify(out.laser));
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
