// There Is No Spoon as a sperm passive (spoon.js) and the matrix N/A cells (matrixna.js).
// 1. N/A modifiers are never dealt on their weapons; their neighbours still are. 2. There Is No Spoon is off the weapon roster.
// 3. The passive card is dealt, eats enemy bullets near you and fires them back; ranks widen, store more, hit harder.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; if (!id) return null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    // 1. N/A cells
    SET.noLimits = true;
    for (const id in MATRIX_NA) { const w = fresh(id); for (const m of MATRIX_NA[id]) if (modOk(w, m)) bad.push('dealt N/A ' + id + ' ' + m); }
    let w = fresh('s_void'); if (!modOk(w, 'homing')) bad.push('Family Ties lost homing');
    w = fresh('s_seeker'); if (!modOk(w, 'piercing')) bad.push('Sister Cousin lost piercing');
    w = fresh('v_phys_proj'); if (!modOk(w, 'knock') || !modOk(w, 'homing')) bad.push('Standard Issue lost a modifier');
    SET.noLimits = false;
    // 2. Off the roster
    if (MATRIX_ONLY.weapons.includes('s_siphon') || !W24_HOLD.includes('s_siphon')) bad.push('There Is No Spoon still a weapon');
    // 3. The passive
    fresh(); const card = MUT_REG.find(c => c.id === 'sp_spoon');
    if (!card || !SP_KEEP.includes('sp_spoon')) bad.push('no passive card');
    else if (!card.eligible(G)) bad.push('passive not eligible');
    const foe = (dx, dy) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 0; e.hp = e.maxHp = 1e5; G.enemies.push(e); return e; };
    const shoot = n => { const p = G.player; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; G.ebul.push({ x: p.x + Math.cos(a) * 60, y: p.y + Math.sin(a) * 60, vx: 0, vy: 0, dmg: 5, r: 5, color: '#f00', life: 5, from: 'test bullets', owner: null }); } };
    const trial = rank => {
      fresh(); G.muts = G.muts || {}; G.muts.sp_spoon = rank; G.spSpoon = null; const e = foe(250, 0), hp0 = G.player.hp;
      shoot(8); for (let i = 0; i < 180; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); }
      const s = G.spSpoon.w.s;
      return { ate: G.ebul.filter(q => q.from === 'test bullets' && !q.dead).length === 0, dmg: Math.round(e.maxHp - e.hp), area: Math.round(s.area), mag: s.mag, sdmg: +s.dmg.toFixed(1), hurt: Math.round(hp0 - G.player.hp) };
    };
    out.r1 = trial(1); out.r3 = trial(3); out.r4 = trial(4);
    if (!out.r1.ate) bad.push('rank 1 did not eat the bullets');
    if (!(out.r1.dmg > 0)) bad.push('rank 1 returned nothing');
    if (!(out.r3.area > out.r1.area && out.r3.mag > out.r1.mag && out.r3.sdmg > out.r1.sdmg)) bad.push('rank 3 not stronger');
    if (!(out.r4.area > out.r3.area && out.r4.mag > out.r3.mag && out.r4.sdmg > out.r3.sdmg)) bad.push('mastery not stronger');
    fresh(); G.muts = {}; G.spSpoon = null; shoot(4); for (let i = 0; i < 30; i++) update(1 / 60);
    if (G.spSpoon) bad.push('slot made without the passive');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out)); console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'spoontest ok');
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
